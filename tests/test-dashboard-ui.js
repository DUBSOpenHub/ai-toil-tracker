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
  'CONFIG', 'DEMO_DATA', 'FREQ_SCORES', 'TIME_SCORES', 'PEOPLE_SCORES',
  'BONUS_FACTORS', 'PRIORITY_BANDS',
  'bonusSlug', 'bonusLabel', 'getPriorityBand', 'getPriorityLabel', 'isCritical',
  'reverseFreqScore', 'reverseTimeScore', 'reversePeopleScore',
  'normalizeData', 'getStatus', 'calcScore', 'extractCheckedBonus',
  'applyLocalEdits', 'getIssueUrl', 'renderHotspotMap', 'renderHeroPulse', 'renderSummaryCards',
  'updateStickyHeaderHeight', 'revealToilRow', 'handleToilLinkClick', 'revealToilFromHash', 'prepareReloadScroll'
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

const publishedDemo = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/dashboard/dashboard-data.json'), 'utf8'));
const embeddedDemo = JSON.parse(JSON.stringify(sandbox.DEMO_DATA));
if (fs.existsSync(path.join(ROOT, 'docs/dashboard/.demo'))) {
  assertEq('embedded and published demo data stay identical while demo mode is enabled',
    require('node:util').isDeepStrictEqual(embeddedDemo, publishedDemo), true);
}
const normalizedDemo = sandbox.normalizeData(embeddedDemo).issues;
const demoOpen = normalizedDemo.filter(issue => sandbox.getStatus(issue) !== 'automated' && issue.state !== 'closed');
const demoShipped = normalizedDemo.filter(issue => sandbox.getStatus(issue) === 'automated');
const demoTop = [...demoOpen].sort((a, b) => b.monthly_saved_minutes - a.monthly_saved_minutes).slice(0, 5);
assertEq('the top five mix technical, product, program and operations tasks',
  demoTop.map(issue => [issue.number, issue.title.split(' — ')[0], issue.team, issue.monthly_saved_minutes]),
  [
    [8, 'Flaky CI tests', 'Engineering', 960],
    [12, 'Product roadmap updates', 'Product', 330],
    [6, 'Program status updates', 'Program Management', 200],
    [10, 'Meeting follow-ups', 'Operations', 180],
    [7, 'License checks', 'Security', 132]
  ]);
assertEq('updated demo examples preserve issue counts', [demoOpen.length, demoShipped.length], [7, 5]);
assertEq('updated demo examples preserve recorded monthly effort',
  [demoOpen.reduce((sum, issue) => sum + issue.monthly_saved_minutes, 0),
    demoShipped.reduce((sum, issue) => sum + issue.monthly_saved_minutes, 0)], [1834, 2235]);
assertEq('every demo task has a meaningful team', normalizedDemo.every(issue => issue.team !== 'Unassigned team'), true);
assertEq('non-technical examples carry useful automation context',
  [6, 10, 12].every(number => normalizedDemo.find(issue => issue.number === number).automation_idea.length > 0), true);

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

const stageIssue = { ...normV1.issues[0] };
const stageCard = { innerHTML: '' };
sandbox.dashboardData = { issues: [stageIssue] };
sandbox.document = { getElementById: id => id === 'hotspotMapCard' ? stageCard : null };
sandbox.esc = value => String(value ?? '');
for (const [status, label, className] of [
  ['toil', 'Not started', 'backlog'],
  ['triage', 'Triaging', 'triage'],
  ['in-progress', 'In progress', 'building']
]) {
  sandbox.localEdits[stageIssue.number] = { status };
  sandbox.applyLocalEdits();
  sandbox.renderHotspotMap([stageIssue]);
  assertEq(`${status}: preserves the recorded monthly effort`, stageIssue.monthly_saved_minutes, 400);
  assertEq(`${status}: preserves the recorded score`, stageIssue.toil_score, 212);
  assertEq(`${status}: displays its lifecycle badge`,
    stageCard.innerHTML.includes(`<span class="hotspot-status ${className}">${label}</span>`), true);
  assertEq(`${status}: exposes the stage in the accessible label`,
    stageCard.innerHTML.includes(`hours spent per month. ${label}.`), true);
  assertEq(`${status}: keeps unfinished effort in a red circle`,
    stageCard.innerHTML.includes('hotspot-bubble hotspot-drain'), true);
}
sandbox.localEdits[stageIssue.number] = { status: 'automated' };
sandbox.renderHotspotMap([stageIssue]);
assertEq('automated tasks leave Top Time Drains',
  stageCard.innerHTML.includes('class="hotspot-item"'), false);
delete sandbox.localEdits[stageIssue.number];
stageIssue.labels = ['toil', 'in-progress'];
sandbox.renderHotspotMap([stageIssue]);
assertEq('GitHub in-progress labels display the same stage without a local override',
  stageCard.innerHTML.includes('<span class="hotspot-status building">In progress</span>'), true);
stageIssue.labels = ['toil', 'triage'];
sandbox.renderHotspotMap([stageIssue]);
assertEq('GitHub triage labels display Triaging without a local override',
  stageCard.innerHTML.includes('<span class="hotspot-status triage">Triaging</span>'), true);
sandbox.localEdits[stageIssue.number] = { frequency: '⚪ Monthly or less' };
sandbox.applyLocalEdits();
const rescored = sandbox.calcScore('⚪ Monthly or less', stageIssue.time_per_occurrence,
  stageIssue.people_affected, stageIssue.bonus_factors);
assertEq('effort edits still recalculate monthly minutes', stageIssue.monthly_saved_minutes, rescored.monthlyMins);
assertEq('effort edits still recalculate the score', stageIssue.toil_score, rescored.score);
delete sandbox.localEdits[stageIssue.number];

const heroPulse = { innerHTML: '' };
sandbox.document = { getElementById: id => id === 'heroPulse' ? heroPulse : null };
const triageIssues = [
  { ...norm.issues[0], number: 91, labels: ['toil', 'triage'] },
  { ...norm.issues[0], number: 92, labels: ['toil', 'triage'] },
  { ...norm.issues[0], number: 93, labels: ['toil', 'in-progress'] },
  { ...norm.issues[1], number: 94, labels: ['toil', 'triage', 'automated'] }
];
sandbox.renderHeroPulse(triageIssues);
const triagePill = heroPulse.innerHTML.match(/<span[^>]*data-filter-status="triage"[^>]*>[^<]*<\/span>/)?.[0] || '';
assertEq('header triage bubble counts triaging tasks, not automated or building tasks',
  triagePill.includes('🔍 2 triaging</span>'), true);
assertEq('header triage bubble is keyboard accessible',
  triagePill.includes('tabindex="0"') && triagePill.includes('role="button"'), true);
assertEq('header triage bubble explains its filter action',
  triagePill.includes('title="Filter to triaging"'), true);
sandbox.localEdits[91] = { status: 'in-progress' };
sandbox.renderHeroPulse(triageIssues);
assertEq('header triage count updates when work starts',
  heroPulse.innerHTML.includes('🔍 1 triaging</span>'), true);
sandbox.localEdits[92] = { status: 'automated' };
sandbox.renderHeroPulse(triageIssues);
assertEq('header triage bubble hides at zero like the other stage bubbles',
  heroPulse.innerHTML.includes('data-filter-status="triage"'), false);
assertEq('other header stage counts stay correct after triage transitions',
  heroPulse.innerHTML.includes('2 shipped</span>') && heroPulse.innerHTML.includes('2 building</span>'), true);
delete sandbox.localEdits[91];
delete sandbox.localEdits[92];
sandbox.renderHeroPulse([]);
assertEq('empty dashboards do not show a triage bubble',
  heroPulse.innerHTML.includes('data-filter-status="triage"'), false);

const summaryCards = { dataset: {}, innerHTML: '' };
sandbox.document = { getElementById: id => id === 'summaryCards' ? summaryCards : null };
sandbox.animateSummaryNumbers = () => {};
for (const issues of [norm.issues, []]) {
  sandbox.renderSummaryCards(issues);
  assertEq(`${issues.length} issues: all five summary cards have a progress track`,
    (summaryCards.innerHTML.match(/class="micro-progress"/g) || []).length, 5);
  assertEq(`${issues.length} issues: velocity groups its details into one shared layout row`,
    summaryCards.innerHTML.includes('class="card-detail"'), true);
}
assertEq('empty summary cards do not show fictional progress',
  summaryCards.innerHTML.includes('width:15%'), false);
assertEq('summary content shares aligned grid tracks',
  HTML.includes('grid-template-rows: subgrid; grid-row: span 4;'), true);
assertEq('header bubbles occupy their own non-wrapping row',
  HTML.includes('.hero-pulse { grid-column: 1 / -1; display: flex; flex-wrap: nowrap;'), true);

function navigationFixture(visible = true) {
  const state = { visible, renders: 0, scrolls: 0, focuses: 0, prevented: 0, notices: [], style: {} };
  const controls = {
    filterTeam: { value: 'Platform' },
    filterStatus: { value: 'toil' },
    searchToil: { value: 'flaky' }
  };
  const wrap = { scrollLeft: 600 };
  const row = {
    closest: () => wrap,
    classList: { add: value => { state.highlight = value; } },
    scrollIntoView: options => { state.scrolls++; state.scrollOptions = options; },
    focus: options => { state.focuses++; state.focusOptions = options; }
  };
  sandbox.dashboardData = { issues: [{ number: 8 }] };
  sandbox.window = { location: { hash: '' } };
  sandbox.document = {
    getElementById: id => id === 'toil-8' ? (state.visible ? row : null) : controls[id],
    querySelector: () => ({ getBoundingClientRect: () => ({ height: 294.25 }) }),
    querySelectorAll: () => [{ classList: { remove: value => { state.removedHighlight = value; } } }],
    documentElement: { style: { setProperty: (name, value) => { state.style[name] = value; } } }
  };
  sandbox.render = () => { state.renders++; state.visible = true; };
  sandbox.showToast = message => state.notices.push(message);
  state.event = (href, overrides = {}) => ({
    button: 0,
    target: { closest: () => ({ getAttribute: () => href }) },
    preventDefault: () => { state.prevented++; },
    ...overrides
  });
  return { state, controls, wrap };
}

let navigation = navigationFixture();
sandbox.handleToilLinkClick(navigation.state.event('#toil-8'));
assertEq('demo clicks use the exact issue number', sandbox.window.location.hash, '#toil-8');
assertEq('demo navigation takes control of the anchor scroll', navigation.state.prevented, 1);
assertEq('navigation measures the actual sticky header', navigation.state.style['--sticky-header-height'], '295px');
assertEq('demo navigation reveals the task-name columns', navigation.wrap.scrollLeft, 0);
assertEq('navigation focuses the row without a second browser scroll',
  navigation.state.focusOptions, { preventScroll: true });
assertEq('already-visible tasks keep the active filters', navigation.controls.searchToil.value, 'flaky');
assertEq('already-visible tasks avoid unnecessary rendering', navigation.state.renders, 0);
sandbox.handleToilLinkClick(navigation.state.event('#toil-8'));
assertEq('clicking the same circle again still reveals its row', navigation.state.scrolls, 2);
assertEq('repeat navigation explicitly highlights newly rendered rows', navigation.state.highlight, 'toil-target');
assertEq('navigation removes the previous row highlight', navigation.state.removedHighlight, 'toil-target');

navigation = navigationFixture(false);
sandbox.handleToilLinkClick(navigation.state.event('#toil-8'));
assertEq('hidden tasks trigger a fresh backlog render', navigation.state.renders, 1);
assertEq('conflicting team, status and search filters are cleared',
  Object.values(navigation.controls).map(control => control.value), ['', '', '']);
assertEq('filter changes are explained to the user',
  navigation.state.notices[0], 'Showing toil #8 - backlog filters cleared.');
assertEq('hidden tasks are scrolled into view after rendering', navigation.state.scrolls, 1);

navigation = navigationFixture();
sandbox.handleToilLinkClick(navigation.state.event('https://github.com/test/repo/issues/8'));
for (const override of [{ metaKey: true }, { ctrlKey: true }, { shiftKey: true }, { altKey: true }, { button: 1 }]) {
  sandbox.handleToilLinkClick(navigation.state.event('#toil-8', override));
}
assertEq('real issue links and modified clicks keep native browser behavior', navigation.state.prevented, 0);
assertEq('native links do not mutate backlog navigation', navigation.state.scrolls, 0);
assertEq('unknown tasks fail explicitly', sandbox.revealToilRow(999), false);
assertEq('unknown tasks do not clear filters', navigation.controls.searchToil.value, 'flaky');
assertEq('unknown tasks explain why navigation failed',
  navigation.state.notices[0], '⚠️ This toil is not available in the current dashboard.');
sandbox.window.location.hash = '#toil-8';
sandbox.revealToilFromHash();
assertEq('direct links and history navigation reveal the matching task', navigation.state.scrolls, 1);

const reloadScrolls = [];
let pageshow;
sandbox.performance = { getEntriesByType: () => [{ type: 'reload' }] };
sandbox.window.location = { pathname: '/dashboard/', search: '?preview=22', hash: '#toil-8' };
sandbox.window.history = {
  scrollRestoration: 'auto',
  state: { existing: true },
  replaceState: (state, title, url) => { sandbox.window.replacedUrl = url; }
};
sandbox.window.scrollTo = (x, y) => reloadScrolls.push([x, y]);
sandbox.window.addEventListener = (name, handler, options) => {
  assertEq('reload positioning runs at page-show once', [name, options.once], ['pageshow', true]);
  pageshow = handler;
};
sandbox.requestAnimationFrame = callback => callback();
assertEq('reload navigation is detected', sandbox.prepareReloadScroll(), true);
assertEq('reload removes only the old fragment', sandbox.window.replacedUrl, '/dashboard/?preview=22');
assertEq('reload initially prevents the browser restoring an old scroll position',
  sandbox.window.history.scrollRestoration, 'manual');
pageshow();
assertEq('reload resets both scroll axes before and after page-show',
  reloadScrolls, [[0, 0], [0, 0]]);
assertEq('ordinary history restoration resumes after reload',
  sandbox.window.history.scrollRestoration, 'auto');
sandbox.performance = { getEntriesByType: () => [{ type: 'navigate' }] };
assertEq('opening a direct link is not treated as a refresh', sandbox.prepareReloadScroll(), false);

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
assertEq('prompt button copies a plain prompt instead of a shell command',
  SRC.includes('data-prompt="${esc(agentPrompt, true)}"') &&
  !SRC.includes('const ghCmd =') && !SRC.includes('copyLaunchCmd'), true);
assertEq('prompt feedback and tooltip name only GitHub Copilot',
  SRC.includes('Prompt copied — paste into GitHub Copilot.') &&
  SRC.includes('Copies a ready-to-use prompt for GitHub Copilot.') &&
  !SRC.includes('Microsoft 365 Copilot') && !SRC.includes('paste in your terminal'), true);
assertEq('monthly time cells have a pinned-column selector',
  SRC.includes('<td class="toil-monthly-cell">${formatMinutes(issue.monthly_saved_minutes)}</td>') &&
  HTML.includes('#toilTable td.toil-monthly-cell { position: sticky; right: 0;'), true);
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
  HTML.includes('Team Member Toil') && !HTML.includes('Open Toil Load'), true);
assertEq('team load renders a visual ranked card grid',
  HTML.includes('class="team-load-grid"') &&
  HTML.includes('class="load-person-card"') &&
  HTML.includes('class="load-avatar"') &&
  SRC.includes('const share = totalWeekly > 0'), true);
assertEq('the weekly team total uses the requested terminology',
  HTML.includes('combined team toil') && !HTML.includes('combined open load'), true);
assertEq('the automation gauge no longer has a metric-replacing click Easter egg',
  !SRC.includes("e.target.closest('.radial-progress')") && !SRC.includes("span.textContent = 'COPILOT'"), true);

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

// --- sharing metadata and fork URL adaptation --------------------------------
const head = HTML.slice(0, HTML.indexOf('</head>'));
const sharingTags = Object.fromEntries(
  [...head.matchAll(/<meta (?:property|name)="([^"]+)" content="([^"]*)">/g)]
    .map(match => [match[1], match[2]])
);
assertEq('sharing metadata is present without running dashboard JavaScript',
  sharingTags['og:type'], 'website');
assertEq('social platforms receive a large-image card', sharingTags['twitter:card'], 'summary_large_image');
assertEq('sharing images use an absolute HTTPS URL',
  /^https:\/\/.+\/dashboard\/social-preview-yc\.png\?v=3$/.test(sharingTags['og:image']), true);
assertEq('both sharing formats use the same image',
  sharingTags['twitter:image'], sharingTags['og:image']);
assertEq('sharing images have descriptive alternative text',
  sharingTags['og:image:alt'] === sharingTags['twitter:image:alt'] &&
    sharingTags['og:image:alt'].includes('Demo tasks span engineering, product'), true);
const socialImage = fs.readFileSync(path.join(ROOT, 'docs/dashboard/social-preview-yc.png'));
const socialSvg = fs.readFileSync(path.join(ROOT, 'docs/dashboard/social-preview.svg'), 'utf8');
const ycSvg = fs.readFileSync(path.join(ROOT, 'docs/dashboard/social-preview-yc.svg'), 'utf8');
for (const variant of ['dark-text', 'white-text']) {
  const logo = fs.readFileSync(path.join(ROOT, `docs/assets/brand/ai-toil-tracker-${variant}.png`));
  assertEq(`${variant} logo retains high-resolution RGBA output`,
    [logo.readUInt32BE(16), logo.readUInt32BE(20), logo[25]], [2976, 480, 6]);
  const logoSvg = fs.readFileSync(path.join(ROOT, `docs/assets/brand/ai-toil-tracker-${variant}.svg`), 'utf8');
  assertEq(`${variant} logo includes its editable source`,
    logoSvg.includes('>AI Toil Tracker</text>') && logoSvg.includes('viewBox="0 0 248 40"'), true);
}
assertEq('the light artwork omits the top-right open-source badge',
  ycSvg.includes('>OPEN SOURCE</text>'), false);
assertEq('the product wordmark stays legible in both previews',
  [ycSvg, socialSvg].map(svg => Number(svg.match(/id="product-name"[^>]*font-size="([^"]+)"/)?.[1])), [30, 30]);
assertEq('preview copy avoids the replaced busywork wording', /busywork/i.test(socialSvg + ycSvg), false);
assertEq('preview copy uses the requested title',
  [ycSvg, socialSvg].every(svg => svg.includes('>Find the work</text>') &&
    svg.includes('>slowing your</text>') && svg.includes('>team down.</text>')), true);
const highlightColors = svg => [...svg.matchAll(/<text\b[^>]*\bfill="([^"]+)"[^>]*>(?:slowing your|team down\.)<\/text>/g)]
  .map(match => match[1]);
assertEq('the whole highlighted phrase uses the selected red',
  [highlightColors(ycSvg), highlightColors(socialSvg)],
  [['#ff4d6d', '#ff4d6d'], ['#ff4d6d', '#ff4d6d']]);
const lightHeadlines = [...ycSvg.matchAll(/<text class="yc-headline"[^>]*>/g)].map(match => match[0]);
assertEq('the light headline fills its column with natural larger letterforms',
  lightHeadlines.map(tag => [
    Number(tag.match(/font-size="([^"]+)"/)?.[1]),
    Number(tag.match(/textLength="([^"]+)"/)?.[1]),
    tag.match(/lengthAdjust="([^"]+)"/)?.[1]
  ]), [[88, 540, 'spacing'], [92, 539, 'spacing'], [104, 540, 'spacing']]);
const subtitleWidths = svg => [...svg.matchAll(/<text\b[^>]*class="(?:yc|preview)-copy"[^>]*textLength="([^"]+)"[^>]*>/g)]
  .map(match => Number(match[1]));
assertEq('subtitle lines have equal widths in both previews',
  [subtitleWidths(ycSvg), subtitleWidths(socialSvg)], [[360, 360], [360, 360]]);
assertEq('the light preview has no standalone savings callout',
  ycSvg.includes('id="yc-saved-hours"') || ycSvg.includes('id="yc-saved-caption"'), false);
assertEq('the light preview does not repeat removed savings captions',
  ycSvg.includes('37.3') || /\bin the demo\b/i.test(ycSvg), false);
assertEq('the preview distinguishes completed and remaining tasks',
  ycSvg.includes('>TOP REMAINING TIME DRAINS</text>') &&
    ycSvg.includes(`>${demoShipped.length} automated, ${demoOpen.length} remaining</text>`), true);
assertEq('the preview visibly identifies each task function',
  demoTop.every(issue => ycSvg.includes(`>${issue.team.toUpperCase()}</text>`)), true);
assertEq('preview copy uses the requested subtitle and full product name',
  [ycSvg, socialSvg].every(svg => svg.includes('>Use GitHub Copilot to create</text>') &&
    svg.includes('>capacity for what matters most.</text>') && !/\bAI prompt\b/i.test(svg)), true);
assertEq('sharing metadata uses the requested subtitle',
  sharingTags['og:description'], 'Use GitHub Copilot to create capacity for what matters most.');
const artworkLabels = {
  8: ['Shared build failures', 'Shared builds'],
  12: ['Team roadmap updates', 'Team roadmap'],
  6: ['Team status reports', 'Team reports'],
  10: ['Team action follow-ups', 'Team follow-ups'],
  7: ['Shared dependency checks', 'Shared checks']
};
const artworkTasks = svg => [...svg.matchAll(/<text\b[^>]*data-issue="(\d+)"[^>]*>([^<]+)<\/text>/g)]
  .map(match => [Number(match[1]), match[2]]);
assertEq('the detailed preview maps shared-work labels to the same demo issues',
  artworkTasks(ycSvg), demoTop.map(issue => [issue.number, artworkLabels[issue.number][0]]));
assertEq('the compact preview preserves the same team-workflow mapping',
  artworkTasks(socialSvg), demoTop.map(issue => [issue.number, artworkLabels[issue.number][1]]));
const svgColor = (id, attribute) => socialSvg.match(new RegExp(`id="${id}"[^>]*\\b${attribute}="([^"]+)"`))?.[1];
const darkTokens = HTML.match(/\.dark, :root:not\(\.light\)\s*\{([^}]+)\}/)?.[1] || '';
assertEq('sharing image canvas matches the dashboard dark theme',
  svgColor('canvas-edge', 'stop-color'), darkTokens.match(/--bg-surface:\s*([^;]+);/)?.[1]);
assertEq('sharing image primary text matches the dashboard dark theme',
  svgColor('headline', 'fill'), darkTokens.match(/--text-primary:\s*([^;]+);/)?.[1]);
assertEq('sharing image uses the dashboard purple accent',
  svgColor('accent-start', 'stop-color'), HTML.match(/--accent:\s*([^;]+);/)?.[1]);
assertEq('sharing image time-drain circles match the dashboard red',
  svgColor('time-drain-circles', 'stroke'), HTML.match(/\.hotspot-drain \{ border: 2px solid (#[a-f0-9]+);/)?.[1]);
assertEq('sharing image reclaimed hours use the dashboard success green',
  svgColor('reclaimed-hours', 'fill'), HTML.match(/\.pulse-pill\.success \{[^}]* color: (#[a-f0-9]+);/)?.[1]);
assertEq('the sharing asset is a PNG', socialImage.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
assertEq('sharing image dimensions match the metadata',
  [socialImage.readUInt32BE(16), socialImage.readUInt32BE(20)],
  [Number(sharingTags['og:image:width']), Number(sharingTags['og:image:height'])]);
assertEq('high-resolution sharing image stays below 2 MB', socialImage.length < 2000000, true);
const sharingFixtureDir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'toil-sharing-'));
const sharingFixture = path.join(sharingFixtureDir, 'index.html');
const sharingScript = path.join(ROOT, 'scripts/update-dashboard-sharing.sh');
try {
  for (const [repo, pagesUrl, expected] of [
    ['Another-Team/toil-board', '', 'https://another-team.github.io/toil-board/dashboard/'],
    ['Another-Team/Another-Team.github.io', '', 'https://another-team.github.io/dashboard/'],
    ['Another-Team/toil-board', 'https://work.example.test/tools/', 'https://work.example.test/tools/dashboard/']
  ]) {
    fs.writeFileSync(sharingFixture, HTML);
    const env = { ...process.env, REPO: repo, PAGES_URL: pagesUrl, DASHBOARD_HTML: sharingFixture };
    execFileSync('bash', [sharingScript], { env, encoding: 'utf8' });
    const updated = fs.readFileSync(sharingFixture, 'utf8');
    assertEq(`${expected}: canonical URL adapts`, updated.includes(`<link rel="canonical" href="${expected}">`), true);
    assertEq(`${expected}: Open Graph URL adapts`, updated.includes(`<meta property="og:url" content="${expected}">`), true);
    assertEq(`${expected}: both image URLs adapt`,
      (updated.match(new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + 'social-preview-yc\\.png\\?v=3', 'g')) || []).length, 2);
    assertEq(`${expected}: dashboard code is unchanged`,
      updated.slice(updated.indexOf('<script>')), HTML.slice(HTML.indexOf('<script>')));
    execFileSync('bash', [sharingScript], { env, encoding: 'utf8' });
    assertEq(`${expected}: URL updates are idempotent`, fs.readFileSync(sharingFixture, 'utf8'), updated);
  }
  fs.writeFileSync(sharingFixture, HTML);
  const { spawnSync } = require('child_process');
  for (const badUrl of ['http://insecure.example.test', 'https://example.test/?query=1', 'https://example.test/#fragment']) {
    const run = spawnSync('bash', [sharingScript], {
      env: { ...process.env, REPO: 'test/repo', PAGES_URL: badUrl, DASHBOARD_HTML: sharingFixture },
      encoding: 'utf8'
    });
    assertEq(`${badUrl}: invalid sharing URLs fail explicitly`, run.status, 2);
    assertEq(`${badUrl}: failed validation leaves the page unchanged`, fs.readFileSync(sharingFixture, 'utf8'), HTML);
  }
  fs.writeFileSync(sharingFixture, HTML.replace(/<meta property="og:image"[^>]*>\n/, ''));
  const before = fs.readFileSync(sharingFixture, 'utf8');
  const missingTag = spawnSync('bash', [sharingScript], {
    env: { ...process.env, REPO: 'test/repo', PAGES_URL: '', DASHBOARD_HTML: sharingFixture },
    encoding: 'utf8'
  });
  assertEq('missing sharing tags fail explicitly', missingTag.status, 1);
  assertEq('missing sharing tags do not truncate the HTML', fs.readFileSync(sharingFixture, 'utf8'), before);
} finally {
  fs.rmSync(sharingFixtureDir, { recursive: true, force: true });
}

async function testPromptCopy() {
  const prompt = 'Automate "the toil".\nPreserve the issue context.';
  const successMessage = '🚀 Prompt copied — paste into GitHub Copilot.';
  const failureMessage = 'Unable to copy the prompt. Allow clipboard access and try again.';
  for (const mode of ['clipboard', 'fallback', 'no-api', 'denied', 'throws', 'missing']) {
    const messages = [], tracked = [], writes = [], removed = [];
    const textarea = { value: '', style: {}, select() {} };
    let renders = 0;
    const context = {
      console: { error() {} },
      navigator: mode === 'no-api' ? {} : {
        clipboard: {
          async writeText(text) {
            if (mode !== 'clipboard') throw new Error('Clipboard unavailable');
            writes.push(text);
          }
        }
      },
      document: {
        createElement() { return textarea; },
        body: {
          appendChild() {},
          removeChild(node) { removed.push(node === textarea); }
        },
        execCommand(command) {
          assertEq(`${mode}: legacy copy command`, command, 'copy');
          if (mode === 'throws') throw new Error('Copy blocked');
          if (mode === 'denied') return false;
          writes.push(textarea.value);
          return true;
        }
      },
      showToast(message) { messages.push(message); },
      trackCopilotLaunch(number) { tracked.push(number); },
      render() { renders++; }
    };
    vm.createContext(context);
    vm.runInContext(extractDeclaration('copyCopilotPrompt'), context);
    const succeeds = ['clipboard', 'fallback', 'no-api'].includes(mode);
    await context.copyCopilotPrompt({
      getAttribute(name) {
        assertEq(`${mode}: reads prompt data`, name, 'data-prompt');
        return mode === 'missing' ? null : prompt;
      }
    }, 10);
    assertEq(`${mode}: copy feedback`, messages, [succeeds ? successMessage :
      mode === 'missing' ? 'No prompt is available to copy. Refresh the dashboard and try again.' :
        failureMessage]);
    assertEq(`${mode}: preserves prompt text`, writes, succeeds ? [prompt] : []);
    assertEq(`${mode}: only tracks a successful copy`, tracked, succeeds ? [10] : []);
    assertEq(`${mode}: only rerenders after success`, renders, succeeds ? 1 : 0);
    assertEq(`${mode}: cleans up fallback textarea`, removed,
      ['fallback', 'no-api', 'denied', 'throws'].includes(mode) ? [true] : []);
  }
}

testPromptCopy().then(() => {
  console.log('');
  console.log('════════════════════════════════════════════');
  console.log(`  Tests: ${total}  |  ✅ Passed: ${pass}  |  ❌ Failed: ${fail}`);
  console.log('════════════════════════════════════════════');
  console.log('');
  process.exit(fail === 0 ? 0 : 1);
}).catch(error => {
  console.error('Prompt copy tests failed:', error);
  process.exit(1);
});
