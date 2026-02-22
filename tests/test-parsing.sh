#!/usr/bin/env bash
# =============================================================================
# tests/test-parsing.sh — Unit tests for scripts/parse-form.sh
# =============================================================================
# Run:  bash tests/test-parsing.sh
# Exit: 0 = all pass, 1 = any failures
# =============================================================================
set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
. "${REPO_ROOT}/scripts/parse-form.sh"

PASS=0; FAIL=0; TOTAL=0

assert_eq() {
  local desc="$1" got="$2" want="$3"
  TOTAL=$(( TOTAL + 1 ))
  if [ "$got" = "$want" ]; then echo "  ✅  $desc"; PASS=$(( PASS + 1 ))
  else echo "  ❌  $desc"; echo "       got:  '$got'"; echo "       want: '$want'"; FAIL=$(( FAIL + 1 )); fi
}
assert_empty() {
  local desc="$1" got="$2"
  TOTAL=$(( TOTAL + 1 ))
  if [ -z "$got" ]; then echo "  ✅  $desc (empty as expected)"; PASS=$(( PASS + 1 ))
  else echo "  ❌  $desc: expected empty, got '$got'"; FAIL=$(( FAIL + 1 )); fi
}
assert_contains() {
  local desc="$1" got="$2" substr="$3"
  TOTAL=$(( TOTAL + 1 ))
  if echo "$got" | grep -qF "$substr"; then echo "  ✅  $desc"; PASS=$(( PASS + 1 ))
  else echo "  ❌  $desc: '$substr' not found in '$got'"; FAIL=$(( FAIL + 1 )); fi
}

FIXTURE_DIR="${REPO_ROOT}/tests/fixtures"

# ── parse_field: basic ───────────────────────────────────────────────────────
echo ""
echo "── parse_field: basic ──────────────────────"

STANDARD=$(cat << 'BODY_EOF'
### Your name

Jane Smith

### What's the toil?

I manually update a spreadsheet.

### How often does it happen?

🟠 Daily

### How long does it take each time?

30–60 minutes

### Who is affected?

Entire team

### Automation idea (if any)

_No response_
BODY_EOF
)

assert_eq "name field"       "$(parse_field "Your name" "$STANDARD")"                    "Jane Smith"
assert_eq "frequency field"  "$(parse_field "How often does it happen?" "$STANDARD")"    "🟠 Daily"
assert_eq "time field"       "$(parse_field "How long does it take each time?" "$STANDARD")" "30–60 minutes"
assert_eq "people field"     "$(parse_field "Who is affected?" "$STANDARD")"             "Entire team"
assert_empty "no-response"   "$(parse_field "Automation idea (if any)" "$STANDARD")"

# ── parse_field: edge cases ──────────────────────────────────────────────────
echo ""
echo "── parse_field: edge cases ─────────────────"

assert_empty "missing field" "$(parse_field "Nonexistent heading" "$STANDARD")"

EXTRA_BLANKS=$(printf '### How often does it happen?\n\n\n\n🟡 Multiple times per week\n\n### Next\n')
assert_eq "extra blank lines" "$(parse_field "How often does it happen?" "$EXTRA_BLANKS")" "🟡 Multiple times per week"

WHITESPACE=$(printf '### Who is affected?\n\n   Entire team   \n\n### Next\n')
assert_eq "leading/trailing whitespace" "$(parse_field "Who is affected?" "$WHITESPACE")" "Entire team"

MULTILINE=$(printf '### What is the toil?\n\nFirst line.\nSecond line.\n\n### Next\n')
assert_eq "multi-line returns first" "$(parse_field "What is the toil?" "$MULTILINE")" "First line."

NO_RESP_CAP=$(printf '### Automation idea (if any)\n\n_No Response_\n\n### Next\n')
assert_empty "No Response (capital R)" "$(parse_field "Automation idea (if any)" "$NO_RESP_CAP")"

# ── parse_field: compact format ──────────────────────────────────────────────
echo ""
echo "── parse_field: compact ────────────────────"
COMPACT=$(cat "${FIXTURE_DIR}/compact-no-blank-lines.txt")
assert_eq "compact: frequency" "$(parse_field "How often does it happen?" "$COMPACT")"       "🟡 Multiple times per week"
assert_eq "compact: time"      "$(parse_field "How long does it take each time?" "$COMPACT")" "5–15 minutes"
assert_eq "compact: people"    "$(parse_field "Who is affected?" "$COMPACT")"                 "2–3 people"

# ── parse_field: unicode ─────────────────────────────────────────────────────
echo ""
echo "── parse_field: unicode ────────────────────"
UNICODE_BODY=$(cat "${FIXTURE_DIR}/critical-all-bonuses.txt")
assert_eq "unicode name"      "$(parse_field "Your name" "$UNICODE_BODY")"                "Álvaro García-Müller"
assert_eq "unicode frequency" "$(parse_field "How often does it happen?" "$UNICODE_BODY")" "🔴 Multiple times per day"

# ── parse_bonus_checkboxes ────────────────────────────────────────────────────
echo ""
echo "── parse_bonus_checkboxes ──────────────────"

NONE=$'### Bonus factors\n- [ ] Error-prone\n- [ ] Morale killer\n- [ ] Blocking'
assert_empty "none checked" "$(parse_bonus_checkboxes "$NONE")"

ONE=$'- [x] ❌ Error-prone\n- [ ] Morale killer\n- [ ] Blocking'
assert_eq "one checked: error-prone" "$(parse_bonus_checkboxes "$ONE")" "error-prone"

TWO=$'- [x] Error-prone\n- [x] 😤 Morale killer\n- [ ] Blocking'
TWO_COUNT=$(parse_bonus_checkboxes "$TWO" | wc -l | tr -d ' ')
assert_eq "two checked: count=2" "$TWO_COUNT" "2"

ALL=$'- [X] Error-prone\n- [X] Morale killer\n- [X] 🔗 Blocking'
ALL_COUNT=$(parse_bonus_checkboxes "$ALL" | wc -l | tr -d ' ')
assert_eq "all three [X] uppercase: count=3" "$ALL_COUNT" "3"

FIXTURE_BODY=$(cat "${FIXTURE_DIR}/high-priority-with-bonuses.txt")
CHECKED=$(parse_bonus_checkboxes "$FIXTURE_BODY")
assert_contains "fixture: error-prone checked" "$CHECKED" "error-prone"
assert_contains "fixture: blocking checked"    "$CHECKED" "blocking"

LOW_BODY=$(cat "${FIXTURE_DIR}/low-priority-minimal.txt")
assert_empty "fixture: low-priority no bonuses" "$(parse_bonus_checkboxes "$LOW_BODY")"

# ── sanitize_body ─────────────────────────────────────────────────────────────
echo ""
echo "── sanitize_body ───────────────────────────"

SAFE="I manually copy logs to a spreadsheet every day. It takes 30 minutes."
assert_eq "safe body passes through" "$(sanitize_body "$SAFE")" "$SAFE"

AWS_BODY="My deploy key is AKIAIOSFODNN7EXAMPLE and it is hardcoded."
assert_eq "AWS key → sentinel" "$(sanitize_body "$AWS_BODY")" "__SENSITIVE_CONTENT_DETECTED__"

GH_BODY="I use ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx to authenticate."
assert_eq "GitHub PAT → sentinel" "$(sanitize_body "$GH_BODY")" "__SENSITIVE_CONTENT_DETECTED__"

LONG_BODY=$(printf 'x%.0s' {1..3000})
RESULT_LEN=$(sanitize_body "$LONG_BODY" | wc -c | tr -d ' ')
assert_eq "body truncated to 2000" "$RESULT_LEN" "2000"

# ── normalize_field ───────────────────────────────────────────────────────────
echo ""
echo "── normalize_field ─────────────────────────"
assert_eq "lowercase"         "$(normalize_field 'DAILY')"          "daily"
assert_eq "trim whitespace"   "$(normalize_field '  Weekly  ')"     "weekly"
assert_eq "en-dash → hyphen"  "$(normalize_field '5–15 minutes')"   "5-15 minutes"
assert_eq "em-dash → hyphen"  "$(normalize_field 'Multiple—times')" "multiple-times"

# ── fixture: full parse ───────────────────────────────────────────────────────
echo ""
echo "── fixture: end-to-end parse ───────────────"
BODY=$(cat "${FIXTURE_DIR}/high-priority-with-bonuses.txt")
assert_eq "h-p: submitter"  "$(parse_field "Your name" "$BODY")"                      "Jane Smith"
assert_eq "h-p: frequency"  "$(parse_field "How often does it happen?" "$BODY")"      "🟠 Daily"
assert_eq "h-p: time"       "$(parse_field "How long does it take each time?" "$BODY")" "30–60 minutes"
assert_eq "h-p: people"     "$(parse_field "Who is affected?" "$BODY")"               "Entire team"

BODY=$(cat "${FIXTURE_DIR}/medium-priority-one-bonus.txt")
assert_eq "m-p: frequency"  "$(parse_field "How often does it happen?" "$BODY")"      "🔵 Weekly"
assert_eq "m-p: time"       "$(parse_field "How long does it take each time?" "$BODY")" "15–30 minutes"
assert_eq "m-p: people"     "$(parse_field "Who is affected?" "$BODY")"               "4–6 people"

# ── Results ──────────────────────────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════════"
echo "  Tests: $TOTAL  |  ✅ Passed: $PASS  |  ❌ Failed: $FAIL"
echo "════════════════════════════════════════════"
echo ""
[ "$FAIL" -eq 0 ] || exit 1
