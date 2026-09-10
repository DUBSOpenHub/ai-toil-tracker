#!/usr/bin/env node
/* =============================================================================
 * tests/test-dashboard-ui.js — Logic tests for docs/dashboard/index.html
 * =============================================================================
 * The dashboard is a single self-contained HTML file with no build step, so
 * there is nothing to import. This harness lifts the pure functions out of the
 * inline <script> by name and runs them in a vm sandbox — no DOM required.
 *
 * Run:  node tests/test-dashboard-ui.js
 * Exit: 0 = all pass, 1 = any failures
 * ========================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const HTML = fs.readFileSync(path.join(ROOT, 'docs', 'dashboard', 'index.html'), 'utf8');

const scriptMatch = HTML.match(/<script[^>]*>([\s\S]*?)<\/script>/);
if (!scriptMatch) {
  console.error('Could not find an inline <script> block in the dashboard.');
  process.exit(1);
}
const SRC = scriptMatch[1];

// --- extract a single top-level declaration by name, via brace matching -----
function extractDeclaration(name) {
  const patterns = [
    new RegExp(`^(?:async\\s+)?function\\s+${name}\\s*\\(`, 'm'),
    new RegExp(`^const\\s+${name}\\s*=`, 'm')
  ];
  for (const re of patterns) {
    const m = SRC.match(re);
    if (!m) continue;
    const start = m.index;
    let i = SRC.indexOf('{', start);
    // `const X = [...]` style declarations open with a bracket instead
    const bracket = SRC.indexOf('[', start);
    let open = '{', close = '}';
    if (bracket !== -1 && (i === -1 || bracket < i)) { i = bracket; open = '['; close = ']'; }
    if (i === -1) throw new Error(`no body found for ${name}`);
    let depth = 0;
    for (let j = i; j < SRC.length; j++) {
      const ch = SRC[j];
      if (ch === open) depth++;
      else if (ch === close) {
        depth--;
        if (depth === 0) return SRC.slice(start, j + 1) + ';';
      }
    }
    throw new Error(`unbalanced body for ${name}`);
  }
  throw new Error(`declaration not found: ${name}`);
}

const NEEDED = [
  'CONFIG', 'FREQ_SCORES', 'TIME_SCORES', 'PEOPLE_SCORES',
  'BONUS_FACTORS', 'PRIORITY_BANDS',
  'bonusSlug', 'bonusLabel', 'getPriorityBand', 'getPriorityLabel', 'isCritical',
  'reverseFreqScore', 'reverseTimeScore', 'reversePeopleScore',
  'normalizeData', 'getStatus', 'calcScore', 'extractCheckedBonus'
];

const sandbox = {
  console,
  localEdits: {},
  BONUS_PER_FACTOR: Number((SRC.match(/const BONUS_PER_FACTOR = (\d+);/) || [])[1] || 10),
  CRITICAL_THRESHOLD: 0
};
vm.createContext(sandbox);

let bootstrap = '';
for (const name of NEEDED) bootstrap += extractDeclaration(name) + '\n';
bootstrap += 'CRITICAL_THRESHOLD = PRIORITY_BANDS[0].min;\n';
// `const`/`let` declarations stay lexical inside a vm context, so surface the
// ones the assertions need onto the sandbox object explicitly.
bootstrap += NEEDED.map(n => `globalThis.${n} = ${n};`).join('\n') + '\n';
vm.runInContext(bootstrap, sandbox);

// --- tiny assertion harness -------------------------------------------------
let pass = 0, fail = 0, total = 0;
function assertEq(desc, got, want) {
  total++;
  const g = JSON.stringify(got), w = JSON.stringify(want);
  if (g === w) { pass++; console.log(`  ✅  ${desc}`); }
  else {
    fail++;
    console.log(`  ❌  ${desc}`);
    console.log(`       got:  ${g}`);
    console.log(`       want: ${w}`);
  }
}

console.log('\n── dashboard ui logic tests ────────────────');

// --- bonus factor alignment with the backend --------------------------------
assertEq('bonus slug passes through', sandbox.bonusSlug('error-prone'), 'error-prone');
assertEq('bonus slug from checkbox label', sandbox.bonusSlug('❌ Error-prone — causes mistakes'), 'error-prone');
assertEq('bonus slug for morale killer', sandbox.bonusSlug('😤 Morale killer'), 'morale-killer');
assertEq('bonus slug for blocking', sandbox.bonusSlug('🔗 Blocking'), 'blocking');
assertEq('unknown bonus is ignored', sandbox.bonusSlug('📈 Growing worse'), null);
assertEq('bonus renders a readable label', sandbox.bonusLabel('blocking'), '🔗 Blocking');
assertEq('every bonus factor is worth the same as the backend',
  Object.values(sandbox.BONUS_FACTORS).map(f => f.points), [10, 10, 10]);

// --- score parity with scripts/scoring.sh -----------------------------------
// freq 8 × time 8 × people 3 = 192, + 2 bonus × 10 = 212 (see tests/test-scoring.sh)
assertEq('score matches the shell scorer',
  sandbox.calcScore('🔴 Multiple times per day', '> 1 hour', '4–6 people',
    ['error-prone', 'morale-killer']).score, 212);
assertEq('score handles emoji checkbox labels too',
  sandbox.calcScore('🔴 Multiple times per day', '> 1 hour', '4–6 people',
    ['❌ Error-prone', '😤 Morale killer']).score, 212);
assertEq('no bonus factors means base score only',
  sandbox.calcScore('🔵 Weekly', '5–15 minutes', 'Just me', []).score, 4);

// --- checked-checkbox extraction --------------------------------------------
const body = [
  '### Bonus factors (optional)',
  '',
  '- [x] ❌ Error-prone — this toil frequently causes mistakes',
  '- [ ] 😤 Morale killer — this toil is demoralizing',
  '- [x] 🔗 Blocking — this toil blocks other people'
].join('\n');
assertEq('reads every ticked checkbox, not just the first',
  sandbox.extractCheckedBonus(body), ['error-prone', 'blocking']);
assertEq('unticked checkboxes are excluded',
  sandbox.extractCheckedBonus('- [ ] ❌ Error-prone'), []);

// --- schema 2 payload -------------------------------------------------------
const v2 = {
  meta: {
    schemaVersion: 2,
    generatedAt: '2026-03-01T00:00:00Z',
    repo: 'test/repo',
    summary: { totalToil: 3, openToil: 1, automated: 1, monthlyMinutes: 300,
               realizedMonthlyMinutes: 100, potentialMonthlyMinutes: 180,
               abandonedMonthlyMinutes: 20 },
    byTeam: [{ name: 'Platform', count: 3 }],
    byCategory: [{ name: 'Security', count: 3 }]
  },
  issues: [
    { number: 1, title: 'Open toil', state: 'OPEN', url: '#', author: 'dana',
      submitter: 'Dana Rivera (@dana)', team: 'Platform', category: 'Security',
      labels: ['toil'], automated: false,
      form: { frequency: '🔵 Weekly', timePerOccurrence: '30–60 minutes',
              peopleAffected: '2–3 people', bonusFactors: ['error-prone'],
              automationIdea: 'Rotate with OIDC' },
      scoring: { frequency: 2, time: 5, people: 2, base: 20, adjusted: 30, priority: 'high' },
      roi: { monthlyMins: 180, realized: false }, createdAt: '2026-01-01T00:00:00Z' },
    { number: 2, title: 'Automated toil', state: 'CLOSED', url: '#', author: 'sam',
      submitter: 'Sam Okafor (@sam)', team: 'Platform', category: 'Security',
      labels: ['toil', 'automated'], automated: true,
      form: { frequency: '🔵 Weekly', timePerOccurrence: '5–15 minutes',
              peopleAffected: '2–3 people', bonusFactors: [], automationIdea: '' },
      scoring: { frequency: 2, time: 2, people: 2, base: 8, adjusted: 8, priority: 'low' },
      roi: { monthlyMins: 100, realized: true }, createdAt: '2026-01-01T00:00:00Z' },
    { number: 3, title: 'Closed as stale', state: 'CLOSED', url: '#', author: 'lee',
      submitter: 'Lee Nakamura (@lee)', team: 'Platform', category: 'Security',
      labels: ['toil', 'stale'], automated: false,
      form: { frequency: '⚪ Monthly or less', timePerOccurrence: '< 5 minutes',
              peopleAffected: 'Just me', bonusFactors: [], automationIdea: '' },
      scoring: { frequency: 1, time: 1, people: 1, base: 1, adjusted: 1, priority: 'low' },
      roi: { monthlyMins: 20, realized: false }, createdAt: '2026-01-01T00:00:00Z' }
  ]
};

const norm = sandbox.normalizeData(v2);
assertEq('schema version is carried through', norm.schemaVersion, 2);
assertEq('summary is carried through', norm.summary.realizedMonthlyMinutes, 100);
assertEq('team aggregates are carried through', norm.byTeam.length, 1);
assertEq('submitter uses the typed name', norm.issues[0].submitter, 'Dana Rivera (@dana)');
assertEq('team comes from the form', norm.issues[0].team, 'Platform');
assertEq('frequency is the real answer, not a reverse lookup',
  norm.issues[0].frequency, '🔵 Weekly');
assertEq('time answer survives', norm.issues[0].time_per_occurrence, '30–60 minutes');
assertEq('bonus factors survive', norm.issues[0].bonus_factors, ['error-prone']);
assertEq('automation idea survives', norm.issues[0].automation_idea, 'Rotate with OIDC');
assertEq('weekly toil load is derived from monthly minutes',
  Math.round(norm.issues[0].weekly_time_spent), Math.round(180 / 4.33));

// --- the closed != automated regression -------------------------------------
assertEq('open toil is ready to fix', sandbox.getStatus(norm.issues[0]), 'toil');
assertEq('labelled toil is automated', sandbox.getStatus(norm.issues[1]), 'automated');
assertEq('closed-as-stale is NOT counted as automated',
  sandbox.getStatus(norm.issues[2]), 'closed');

const realized = norm.issues
  .filter(i => sandbox.getStatus(i) === 'automated')
  .reduce((s, i) => s + i.monthly_saved_minutes, 0);
const potential = norm.issues
  .filter(i => sandbox.getStatus(i) !== 'automated' && i.state !== 'closed')
  .reduce((s, i) => s + i.monthly_saved_minutes, 0);
assertEq('realized savings match the generator', realized, v2.meta.summary.realizedMonthlyMinutes);
assertEq('potential savings match the generator', potential, v2.meta.summary.potentialMonthlyMinutes);

// --- schema 1 payloads still render ------------------------------------------
const v1 = {
  meta: { generatedAt: '2026-01-01T00:00:00Z', repo: 'test/repo',
          summary: { totalToil: 1, openToil: 1, automated: 0 } },
  issues: [{ number: 9, title: 'Legacy', state: 'OPEN', url: '#', author: 'kim',
             labels: ['toil'],
             scoring: { frequency: 8, time: 8, people: 3, base: 192, adjusted: 212 },
             roi: { monthlyMins: 400 }, createdAt: '2026-01-01T00:00:00Z' }]
};
const normV1 = sandbox.normalizeData(v1);
assertEq('missing schemaVersion defaults to 1', normV1.schemaVersion, 1);
assertEq('legacy submitter falls back to the author', normV1.issues[0].submitter, 'kim (@kim)');
assertEq('legacy frequency is reverse-mapped from the score',
  normV1.issues[0].frequency, '🔴 Multiple times per day');
assertEq('legacy issue without the automated flag is not automated',
  sandbox.getStatus(normV1.issues[0]), 'toil');

// --- priorities --------------------------------------------------------------
assertEq('212 is critical', sandbox.getPriorityBand(212).id, 'critical');
assertEq('25 is high', sandbox.getPriorityBand(25).id, 'high');
assertEq('12 is medium', sandbox.getPriorityBand(12).id, 'medium');
assertEq('4 is low', sandbox.getPriorityBand(4).id, 'low');

// --- guards against the bugs this suite exists to prevent --------------------
total++;
if (/labels\.includes\('automated'\)\s*\|\|\s*issue\.state === 'closed'/.test(SRC)) {
  fail++; console.log('  ❌  getStatus no longer equates closed with automated');
} else { pass++; console.log('  ✅  getStatus no longer equates closed with automated'); }

total++;
if (/json\.issues && json\.issues\.length > 0/.test(SRC)) {
  fail++; console.log('  ❌  loadData does not fall back to demo data on an empty payload');
} else { pass++; console.log('  ✅  loadData does not fall back to demo data on an empty payload'); }

total++;
if (/\bSAMPLE_DATA\b/.test(SRC)) {
  fail++; console.log('  ❌  dead SAMPLE_DATA fixture stays removed');
} else { pass++; console.log('  ✅  dead SAMPLE_DATA fixture stays removed'); }

total++;
if (/(?<!GitHub )Copilot CLI/.test(HTML)) {
  fail++; console.log('  ❌  product is always written as "GitHub Copilot CLI"');
} else { pass++; console.log('  ✅  product is always written as "GitHub Copilot CLI"'); }

assertEq('prompt button omits CLI wording',
  HTML.includes('⚡ Generate GitHub Copilot Prompt</button>'), true);
assertEq('category filter is removed from the dashboard',
  HTML.includes('id="filterCategory"'), false);
assertEq('category column is removed from the dashboard',
  HTML.includes('data-col="category"'), false);
assertEq('five summary cards use a dedicated aligned grid',
  HTML.includes('.cards[data-count="5"] { grid-template-columns: repeat(5, minmax(0, 1fr)); }'), true);
assertEq('summary card count drives the responsive layout',
  SRC.includes('summaryCards.dataset.count = cards.length;'), true);
assertEq('generated date is removed from the header',
  HTML.includes('id="headerDate"') || HTML.includes('Generated:'), false);
assertEq('hotspot map is mounted in the dashboard',
  HTML.includes('id="hotspotMapCard"'), true);
assertEq('hotspot map renderer is called',
  SRC.includes('renderHotspotMap(issues);'), true);
assertEq('hotspot bubbles stay in one largest-to-smallest row',
  HTML.includes('flex-wrap: nowrap') && SRC.includes('const monthlyDiff = (b.monthly_saved_minutes || 0) - (a.monthly_saved_minutes || 0);'), true);
assertEq('hotspot bubbles shrink to fit without clipping',
  HTML.includes('.hotspot-item { min-width: 0; flex: 1 1 0;') && HTML.includes('overflow: hidden'), true);
assertEq('hotspot bubbles label the task instead of an unassigned team',
  SRC.includes("const taskName = title") && !SRC.includes("issue.team || 'Unassigned'"), true);
assertEq('hotspot map shows focused open-work totals',
  SRC.includes('burningMinutes') && SRC.includes('openIssues.length') && SRC.includes('topDrainMinutes'), true);
assertEq('hotspot items show monthly units and explicit status text',
  HTML.includes('hrs</strong>') && SRC.includes("const timeMeaning = 'spent per month';") && HTML.includes('hotspot-status'), true);
assertEq('hotspot map focuses on the top five tasks',
  SRC.includes('.slice(0, 5)') && HTML.includes('Top 5 open tasks'), true);
assertEq('hotspot circles and labels share fixed alignment guides',
  HTML.includes('.hotspot-bubble-stage { width: 100%; height: 104px;') && HTML.includes('height: 2.3em;'), true);
assertEq('hotspot circles use one consistent size',
  HTML.includes('width: min(100%, 100px); max-width: 100px;') && !SRC.includes('const size = Math.round'), true);
assertEq('hotspot map excludes completed automation',
  SRC.includes("getStatus(issue) !== 'automated' && issue.state !== 'closed'"), true);
assertEq('hotspot map uses red circles for every open time drain',
  SRC.includes('hotspot-bubble hotspot-drain') && HTML.includes('🔥 Top Time Drains'), true);
assertEq('time-drain labels use lifecycle stages only',
  SRC.includes("'In progress'") && SRC.includes("'Not started'") && !SRC.includes("'High impact'"), true);
assertEq('equal-hour time drains use score and issue number tie-breakers',
  SRC.includes('const scoreDiff = (b.toil_score || 0) - (a.toil_score || 0);') &&
  SRC.includes('(a.number || 0) - (b.number || 0)'), true);
assertEq('demo links fall back to matching backlog rows',
  SRC.includes('function getIssueUrl(issue)') &&
  SRC.includes('const safeUrl = getIssueUrl(issue);') &&
  SRC.includes('const issueUrl = getIssueUrl(issue);') &&
  SRC.includes('return `#toil-${issueNumber}`;') &&
  SRC.includes('<tr id="toil-${issue.number}"'), true);
assertEq('real issue links still open GitHub in a new tab',
  SRC.includes("safeUrl.startsWith('https://github.com/')") &&
  SRC.includes("issueUrl.startsWith('https://github.com/')"), true);
assertEq('team load derives weekly effort and excludes completed toil',
  SRC.includes('weekly_time_spent: (item.roi?.monthlyMins || 0) / 4.33') &&
  SRC.includes("getStatus(issue) !== 'automated' && issue.state !== 'closed'") &&
  HTML.includes('Open Toil Load'), true);
assertEq('team load renders a visual ranked card grid',
  HTML.includes('class="team-load-grid"') &&
  HTML.includes('class="load-person-card"') &&
  HTML.includes('class="load-avatar"') &&
  SRC.includes('const share = totalWeekly > 0'), true);

// --- cross-language parity with scripts/scoring.sh ---------------------------
// The shell scorer writes the score onto the issue; this file recomputes it in
// the browser when someone edits a dropdown. If the two ever disagree, the
// dashboard silently contradicts the issue it is displaying.
const { execFileSync } = require('child_process');
const FREQS = ['🔴 Multiple times per day', '🟠 Daily', '🟡 Multiple times per week', '🔵 Weekly', '⚪ Monthly or less'];
const TIMES = ['> 1 hour', '30–60 minutes', '15–30 minutes', '5–15 minutes', '< 5 minutes'];
const PEOPLE = ['Multiple teams / org-wide', 'Entire team', '4–6 people', '2–3 people', 'Just me'];

let parityChecked = 0;
const parityMismatch = [];
try {
  const combos = [];
  for (const f of FREQS) for (const t of TIMES) for (const p of PEOPLE) combos.push([f, t, p]);
  const script = `
set -euo pipefail
source scripts/scoring.sh
while IFS=$'\\t' read -r f t p; do
  fs=$(freq_score "$f"); ts=$(time_score "$t"); ps=$(people_score "$p")
  mult=$(monthly_multiplier "$fs"); mins=$(time_minutes "$ts")
  printf '%s\\t%s\\t%s\\t%s\\n' "$(( fs * ts * ps ))" "$mult" "$mins" "$ps"
done
`;
  const input = combos.map(c => c.join('\t')).join('\n') + '\n';
  const out = execFileSync('bash', ['-c', script], { cwd: ROOT, input, encoding: 'utf8' })
    .trim().split('\n');
  combos.forEach((c, i) => {
    const [base, mult, mins, ps] = out[i].split('\t').map(Number);
    const js = sandbox.calcScore(c[0], c[1], c[2], []);
    parityChecked++;
    if (js.score !== base) parityMismatch.push(`score ${c.join(' / ')}: js=${js.score} sh=${base}`);
    if (js.monthlyMins !== mult * mins * ps) {
      parityMismatch.push(`minutes ${c.join(' / ')}: js=${js.monthlyMins} sh=${mult * mins * ps}`);
    }
  });
} catch (err) {
  parityMismatch.push(`could not run scripts/scoring.sh: ${err.message}`);
}

total++;
if (parityMismatch.length === 0 && parityChecked === FREQS.length * TIMES.length * PEOPLE.length) {
  pass++; console.log(`  ✅  browser scorer matches scripts/scoring.sh (${parityChecked} combinations)`);
} else {
  fail++;
  console.log('  ❌  browser scorer matches scripts/scoring.sh');
  parityMismatch.slice(0, 8).forEach(m => console.log(`       ${m}`));
  if (parityMismatch.length > 8) console.log(`       …and ${parityMismatch.length - 8} more`);
}

console.log('');
console.log('════════════════════════════════════════════');
console.log(`  Tests: ${total}  |  ✅ Passed: ${pass}  |  ❌ Failed: ${fail}`);
console.log('════════════════════════════════════════════');
console.log('');
process.exit(fail === 0 ? 0 : 1);
