# GitHub Copilot Instructions — AI Toil Tracker

This file gives Copilot immediate context so every session starts productive, not confused.

---

## What This Repo Does

Zero-dependency, GitHub-native toil tracking system. Teams submit repetitive-work ("toil") ideas via GitHub Issue forms. A GitHub Actions workflow auto-scores each idea using `Frequency × Time × People + Bonuses`, applies labels, calls the GitHub Models API for automation suggestions, and posts a structured triage comment — all within 60 seconds of submission.

---

## Repo Structure

```
.github/
  ISSUE_TEMPLATE/
    toil-idea.yml          ← Capture loop: toil submission form
    log-win.yml            ← Capture loop: completed automation form
    automation-proposal.md ← Capture loop: free-form proposal
  workflows/
    ai-triage.yml          ← Score & Label loop: fires on issues:opened
    ci.yml                 ← Testing: runs on PRs to main
    stale.yml              ← Housekeeping: stale issue nudge/close
  copilot-instructions.md  ← This file

scripts/
  scoring.sh     ← Shared scoring functions (source in any workflow or test)
  parse-form.sh  ← Shared field extraction (source alongside scoring.sh)

tests/
  test-scoring.sh  ← Unit tests for scoring.sh
  test-parsing.sh  ← Unit tests for parse-form.sh
  fixtures/        ← Sample issue bodies for testing

docs/
  scoring-guide.md    ← Human-readable scoring documentation
  triage-workflow.md  ← Triage process docs

config.yml    ← ALL configurable values (thresholds, AI model, stale days)
AGENTS.md     ← Agent working guide (read this too)
```

---

## Scoring Formula

```
Toil Score = (Frequency × Time × People) + Bonuses
```

Fibonacci scale (1/2/3/5/8) for each dimension. Bonus: +10 per checked factor (max +30).

**Priority tiers** (configured in `config.yml`):
- 🔴 Critical ≥ 40 → `high-impact` label
- 🟡 High ≥ 20 → `high-impact` label
- 🟢 Medium ≥ 10 → no priority label
- ⚪ Low < 10 → no priority label

---

## Hard Constraints — Never Violate

1. **Zero runtime dependencies** — bash + gh + jq + curl only (all pre-installed on ubuntu-latest)
2. **All `${{ }}` expressions in `env:` blocks** — never inline them in `run:` scripts (injection prevention)
3. **Actions pinned to SHA** — never use `@v4` tags; use full commit SHAs like `@11bd71901bbe5b1630ceea73d27597364c9af683`
4. **Fork-friendly** — no hardcoded org/repo names; always use `${{ github.repository }}`
5. **Single-source scoring** — scoring logic lives ONLY in `scripts/scoring.sh`; never duplicate it

---

## Making Changes

### Changing scoring thresholds
→ Edit `config.yml` only. Scripts use `${CRITICAL_THRESHOLD:-40}` style defaults.

### Changing scoring functions
1. Edit `scripts/scoring.sh`
2. Run `bash tests/test-scoring.sh` (must exit 0)
3. Update `docs/scoring-guide.md` to match

### Changing form fields
1. Add/modify field in `.github/ISSUE_TEMPLATE/toil-idea.yml`
2. Add `parse_field("New Heading Label", "$BODY")` call in `ai-triage.yml`
3. Add test case in `tests/test-parsing.sh` + fixture in `tests/fixtures/`

### Changing the AI model or prompt
→ `config.yml` → `ai.model` / `ai.max_tokens`
→ Prompt is in `ai-triage.yml` step "Get AI automation suggestion"
→ Keep few-shot examples — they improve output quality significantly

---

## Local Testing

```bash
# Run all tests
bash tests/test-scoring.sh
bash tests/test-parsing.sh

# Scoring self-test
bash scripts/scoring.sh --selftest

# Interactive testing
. ./scripts/scoring.sh && . ./scripts/parse-form.sh
BODY=$(cat tests/fixtures/high-priority-with-bonuses.txt)
calc_full_score "$BODY"
echo "Score: $TOIL_SCORE, Priority: $PRIORITY_TIER"

# Validate YAML
python3 -c "import yaml; yaml.safe_load(open('config.yml'))"
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ai-triage.yml'))"
```

---

## Common Pitfalls

1. **En-dash `–` vs ASCII hyphen `-`** — dropdown values use en-dash; `time_score()` and `people_score()` handle both via regex `'5.{0,3}15'` patterns. Don't switch to exact string matching.

2. **Multiline `$GITHUB_OUTPUT`** — use heredoc pattern:
   ```bash
   echo "myvar<<__EOF__"
   echo "$MULTILINE"
   echo "__EOF__"
   ```
   Never: `echo "myvar=$MULTILINE"` — breaks on newlines.

3. **JSON payload for PATCH** — always use `jq -n --rawfile body /tmp/file '{"body": $body}'`. Never interpolate comment text into JSON strings directly.

4. **`set -e` in sourced files** — `scoring.sh` and `parse-form.sh` do NOT set `set -e` because it propagates to the caller. Let the caller set its own error handling.

5. **Label names include emoji** — e.g., `🔴 multiple-times-daily`. These labels must exist in the target repo. New forks need a label setup step (documented in README).
