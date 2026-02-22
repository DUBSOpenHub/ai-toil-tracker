# AGENTS.md — Working Guide for AI Agents

This file tells any AI agent (Copilot, Claude, GPT, Gemini, etc.) exactly how to work effectively on this codebase. Read this before making any changes.

---

## The Four Loops — File Ownership Map

| Loop | What it does | Key files |
|------|-------------|-----------|
| **Capture** | Teams submit toil via forms | `.github/ISSUE_TEMPLATE/toil-idea.yml`, `log-win.yml`, `automation-proposal.md` |
| **Score & Label** | Auto-score, label, and suggest automation | `.github/workflows/ai-triage.yml`, `scripts/scoring.sh`, `scripts/parse-form.sh` |
| **Test** | Prevent regressions | `tests/test-scoring.sh`, `tests/test-parsing.sh`, `tests/fixtures/`, `.github/workflows/ci.yml` |
| **Config** | Central tunables | `config.yml` |

---

## Before You Start Any Change

Run the full test suite and make sure it's green:

```bash
bash tests/test-scoring.sh && bash tests/test-parsing.sh
```

If any test fails before your change, document it — don't fix pre-existing failures as part of your change.

---

## Agent Instructions by Change Type

### 1. Modifying scoring logic

**Files to change:** `scripts/scoring.sh` only.  
**Never change:** Hardcoded values in `ai-triage.yml` (there shouldn't be any — if you see them, that's a bug).

Checklist:
- [ ] Edit the relevant function in `scripts/scoring.sh`
- [ ] Add/update test cases in `tests/test-scoring.sh`
- [ ] Add/update fixture in `tests/fixtures/` if testing a new input pattern
- [ ] Run `bash tests/test-scoring.sh` — must exit 0
- [ ] Update `docs/scoring-guide.md` if user-visible behavior changed
- [ ] If you changed thresholds, update `config.yml` too

### 2. Modifying the triage workflow

**File:** `.github/workflows/ai-triage.yml`  
**Rule:** Every `${{ }}` expression MUST be in an `env:` block, not inlined in `run:` scripts.

Checklist:
- [ ] Verify all `${{ github.* }}`, `${{ secrets.* }}`, `${{ steps.*.outputs.* }}` are in `env:` blocks
- [ ] Verify the workflow still sources `scripts/scoring.sh` and `scripts/parse-form.sh`
- [ ] Validate YAML: `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ai-triage.yml'))"`
- [ ] If you added a new Action `uses:` line, pin it to a full SHA commit (not a tag)

### 3. Modifying form fields

**Files:** `.github/ISSUE_TEMPLATE/toil-idea.yml` AND `scripts/parse-form.sh` AND `tests/test-parsing.sh`

These three must stay in sync:
- The YAML template defines the heading text (e.g., `label: How often does it happen?`)
- `parse_field` in the workflow uses the exact same heading text
- Tests verify that the heading + value round-trip works

Checklist:
- [ ] Add field to `toil-idea.yml` with a clear, unique `label:` string
- [ ] Add `parse_field("Exact Label Text", "$BODY")` in `ai-triage.yml`
- [ ] Add fixture file to `tests/fixtures/` that includes the new field
- [ ] Add test case in `tests/test-parsing.sh`
- [ ] Run `bash tests/test-parsing.sh` — must exit 0

### 4. Changing the AI model or prompt

**File:** `.github/workflows/ai-triage.yml`, step "Get AI automation suggestion"  
**Config:** `config.yml` → `ai.model`, `ai.max_tokens`, `ai.temperature`

Checklist:
- [ ] Test the new prompt/model against the few-shot examples in the prompt itself
- [ ] Ensure the response format still includes `**Confidence:**` on its own line (used for label logic)
- [ ] Keep `max_tokens` ≥ 400 to avoid truncated responses
- [ ] If changing the model, verify it's available in GitHub Models API

### 5. Adding documentation

**Files:** `docs/` only.  
No test required, but make sure Markdown renders correctly.

---

## Common Pitfalls (Learn from Past Bugs)

### En-dash vs ASCII hyphen in dropdown values
GitHub issue forms render the dropdown options exactly as written in `toil-idea.yml`. The options use en-dashes (e.g., `5–15 minutes`, `4–6 people`). The `time_score()` and `people_score()` functions handle this with regex patterns like `'5.{0,3}15'` where `.` matches either dash type. **Do not change these to exact string matches** without updating all test fixtures.

### Multiline values in `$GITHUB_OUTPUT`
GitHub Actions output values cannot contain raw newlines. The AI suggestion can be multi-line. Always use the heredoc EOF pattern:
```bash
echo "suggestion<<__AI_EOF__"
printf '%s' "$SUGGESTION"
echo ""
echo "__AI_EOF__"
```
Never use `echo "suggestion=$SUGGESTION"` for multiline content.

### `jq --rawfile` for building comment JSON payloads
When constructing the `{"body": "..."}` JSON payload for GitHub API PATCH requests, always use:
```bash
jq -n --rawfile body /tmp/comment.md '{"body": $body}' > /tmp/payload.json
```
This correctly escapes newlines, quotes, backslashes, and Unicode. Direct string interpolation will break on any of these.

### `parse_field` heading text must match exactly
The heading passed to `parse_field` must match the `label:` text in the issue template **exactly** (including punctuation, capitalization, and any special characters like `?`). A mismatch causes a silent empty return — the field scores as 1 (the default fallback).

### `BONUS_REASONS` is a bash array
`BONUS_REASONS` is declared as a bash array (`BONUS_REASONS=()`) in `scoring.sh`. When you need a comma-separated string for display:
```bash
REASONS_STR=$(IFS=', '; echo "${BONUS_REASONS[*]}")
```
Do not try to echo `$BONUS_REASONS` directly — that only prints the first element.

### Actions SHAs decay
Every `uses:` line should use a SHA. Over time, new versions are released and the SHA should be updated (Dependabot handles this automatically via `.github/dependabot.yml`). When manually adding a new action, look up the latest release SHA on GitHub.

---

## Testing Checklist (for any change)

Before submitting, verify:

1. **Tests pass:** `bash tests/test-scoring.sh && bash tests/test-parsing.sh` → both exit 0
2. **YAML valid:** `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ai-triage.yml'))"`  
3. **No hardcoded values:** configurable values come from `config.yml` or env var defaults
4. **No inline expressions:** no `${{ }}` directly in `run:` blocks
5. **SHAs not tags:** any new `uses:` lines use full SHA, not `@v4` style
6. **Backward compatible:** existing forks continue to work (no breaking changes to form field headings or label names without migration notes)

---

## Repo Constraints (absolute)

| Constraint | Why |
|-----------|-----|
| Zero runtime dependencies (no npm, pip, Docker) | Fork-and-run in <10 min |
| bash + gh + jq + curl only | Pre-installed on ubuntu-latest |
| All `${{ }}` in `env:` blocks | Script injection prevention |
| Actions pinned to SHA | Supply chain security |
| Single-file scoring source of truth | Prevents drift bugs |
| Fork-friendly (no hardcoded org/repo) | Adoption |
