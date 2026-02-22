#!/usr/bin/env bash
# =============================================================================
# tests/test-scoring.sh — Unit tests for scripts/scoring.sh
# =============================================================================
# Run:  bash tests/test-scoring.sh
# Exit: 0 = all pass, 1 = any failures
# =============================================================================
set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck source=../scripts/scoring.sh
. "${REPO_ROOT}/scripts/scoring.sh"

PASS=0; FAIL=0; TOTAL=0

assert_eq() {
  local desc="$1" got="$2" want="$3"
  TOTAL=$(( TOTAL + 1 ))
  if [ "$got" = "$want" ]; then
    echo "  ✅  $desc"
    PASS=$(( PASS + 1 ))
  else
    echo "  ❌  $desc"
    echo "       got:  '$got'"
    echo "       want: '$want'"
    FAIL=$(( FAIL + 1 ))
  fi
}

# ── freq_score ──────────────────────────────────────────────────────────────
echo ""
echo "── freq_score ──────────────────────────────"
assert_eq "multiple times per day → 8" "$(freq_score '🔴 Multiple times per day')" "8"
assert_eq "daily → 5"                  "$(freq_score '🟠 Daily')"                  "5"
assert_eq "multiple times/week → 3"    "$(freq_score '🟡 Multiple times per week')" "3"
assert_eq "weekly → 2"                 "$(freq_score '🔵 Weekly')"                  "2"
assert_eq "monthly or less → 1"        "$(freq_score '⚪ Monthly or less')"          "1"
assert_eq "lowercase daily → 5"        "$(freq_score 'daily')"                      "5"
assert_eq "empty → 1 (fallback)"       "$(freq_score '')"                           "1"
assert_eq "unknown → 1 (fallback)"     "$(freq_score 'never')"                      "1"
freq_score "🟡 Multiple times per week" > /dev/null
assert_eq "FREQ_LABEL global"   "$FREQ_LABEL" "🟡 multiple-times-weekly"
assert_eq "FREQ_TEXT global"    "$FREQ_TEXT"  "multiple times per week"

# ── time_score ──────────────────────────────────────────────────────────────
echo ""
echo "── time_score ──────────────────────────────"
assert_eq "> 1 hour → 8"      "$(time_score '> 1 hour')"      "8"
assert_eq "30–60 min → 5"     "$(time_score '30–60 minutes')" "5"
assert_eq "30-60 min → 5"     "$(time_score '30-60 minutes')" "5"
assert_eq "15–30 min → 3"     "$(time_score '15–30 minutes')" "3"
assert_eq "5–15 min → 2"      "$(time_score '5–15 minutes')"  "2"
assert_eq "< 5 min → 1"       "$(time_score '< 5 minutes')"   "1"
assert_eq "empty → 1"         "$(time_score '')"              "1"
time_score "> 1 hour" > /dev/null
assert_eq "TIME_SCORE global" "$TIME_SCORE" "8"

# ── people_score ────────────────────────────────────────────────────────────
echo ""
echo "── people_score ────────────────────────────"
assert_eq "multiple teams / org-wide → 8" "$(people_score 'Multiple teams / org-wide')" "8"
assert_eq "entire team → 5"               "$(people_score 'Entire team')"               "5"
assert_eq "4–6 people → 3"                "$(people_score '4–6 people')"                "3"
assert_eq "4-6 people (ascii) → 3"        "$(people_score '4-6 people')"                "3"
assert_eq "2–3 people → 2"                "$(people_score '2–3 people')"                "2"
assert_eq "just me → 1"                   "$(people_score 'Just me')"                   "1"
assert_eq "1 person → 1 (fallback)"       "$(people_score '1 person')"                  "1"

# ── calc_bonus_score ─────────────────────────────────────────────────────────
echo ""
echo "── calc_bonus_score ────────────────────────"
BODY_NONE=$'### Bonus factors\n- [ ] Error-prone\n- [ ] Morale killer\n- [ ] Blocking'
calc_bonus_score "$BODY_NONE" > /dev/null
assert_eq "no boxes → 0"           "$BONUS_SCORE"         "0"
assert_eq "reasons empty"          "${#BONUS_REASONS[@]}" "0"

BODY_ONE=$'- [x] Error-prone\n- [ ] Morale killer\n- [ ] Blocking'
calc_bonus_score "$BODY_ONE" > /dev/null
assert_eq "1 checked → 10"         "$BONUS_SCORE"         "10"
assert_eq "1 reason"               "${#BONUS_REASONS[@]}" "1"
assert_eq "reason = error-prone"   "${BONUS_REASONS[0]}"  "error-prone"

BODY_TWO=$'- [x] Error-prone\n- [x] Morale killer\n- [ ] Blocking'
calc_bonus_score "$BODY_TWO" > /dev/null
assert_eq "2 checked → 20"         "$BONUS_SCORE"         "20"
assert_eq "2 reasons"              "${#BONUS_REASONS[@]}" "2"

BODY_ALL=$'- [x] Error-prone\n- [x] Morale killer\n- [x] Blocking'
calc_bonus_score "$BODY_ALL" > /dev/null
assert_eq "all 3 → 30"             "$BONUS_SCORE"         "30"

BODY_UPPER=$'- [X] Error-prone\n- [X] Blocking'
calc_bonus_score "$BODY_UPPER" > /dev/null
assert_eq "uppercase [X] accepted" "$BONUS_SCORE"         "20"

# ── priority_tier ────────────────────────────────────────────────────────────
echo ""
echo "── priority_tier ───────────────────────────"
priority_tier 50; assert_eq "50 → critical"              "$PRIORITY_TIER" "critical"
priority_tier 40; assert_eq "40 → critical (boundary)"   "$PRIORITY_TIER" "critical"
priority_tier 39; assert_eq "39 → high (boundary)"       "$PRIORITY_TIER" "high"
priority_tier 25; assert_eq "25 → high"                  "$PRIORITY_TIER" "high"
priority_tier 20; assert_eq "20 → high (boundary)"       "$PRIORITY_TIER" "high"
priority_tier 19; assert_eq "19 → medium (boundary)"     "$PRIORITY_TIER" "medium"
priority_tier 12; assert_eq "12 → medium"                "$PRIORITY_TIER" "medium"
priority_tier 10; assert_eq "10 → medium (boundary)"     "$PRIORITY_TIER" "medium"
priority_tier 9;  assert_eq "9  → low (boundary)"        "$PRIORITY_TIER" "low"
priority_tier 1;  assert_eq "1  → low"                   "$PRIORITY_TIER" "low"
priority_tier 40; assert_eq "critical: PRIORITY_LABEL"   "$PRIORITY_LABEL" "high-impact"
priority_tier 12; assert_eq "medium: PRIORITY_LABEL"     "$PRIORITY_LABEL" ""
priority_tier 5;  assert_eq "low: PRIORITY_LABEL"        "$PRIORITY_LABEL" ""

# ── format_monthly_saved ─────────────────────────────────────────────────────
echo ""
echo "── format_monthly_saved ────────────────────"
assert_eq "max (8,8,5) = 375 hrs" "$(format_monthly_saved 8 8 5)" "~375 hours/month"
assert_eq "min (1,1,1) = 3 min"   "$(format_monthly_saved 1 1 1)" "~3 minutes/month"
assert_eq "(5,3,5) = 36 hrs"      "$(format_monthly_saved 5 3 5)" "~36 hours/month"

# ── integration: score math ──────────────────────────────────────────────────
echo ""
echo "── integration: score math ─────────────────"
freq_score "🟠 Daily"; time_score "30–60 minutes"; people_score "Entire team"
BASE=$(( FREQ_SCORE * TIME_SCORE * PEOPLE_SCORE ))
assert_eq "daily × 30-60 × entire-team = 125" "$BASE" "125"

freq_score "🔴 Multiple times per day"; time_score "> 1 hour"; people_score "Multiple teams / org-wide"
BASE=$(( FREQ_SCORE * TIME_SCORE * PEOPLE_SCORE ))
assert_eq "max combo = 512" "$BASE" "512"

freq_score "🔵 Weekly"; time_score "15–30 minutes"; people_score "4–6 people"
BASE=$(( FREQ_SCORE * TIME_SCORE * PEOPLE_SCORE ))
assert_eq "weekly × 15-30 × 4-6 = 18" "$BASE" "18"

# ── fixture-based integration ────────────────────────────────────────────────
echo ""
echo "── fixture tests ───────────────────────────"
FIXTURE_DIR="${REPO_ROOT}/tests/fixtures"
. "${REPO_ROOT}/scripts/parse-form.sh"

BODY=$(cat "${FIXTURE_DIR}/high-priority-with-bonuses.txt")
calc_full_score "$BODY" > /dev/null
assert_eq "high-prio: base score"  "$BASE_SCORE"  "125"
assert_eq "high-prio: bonus"       "$BONUS_SCORE" "20"
assert_eq "high-prio: total"       "$TOIL_SCORE"  "145"
assert_eq "high-prio: tier"        "$PRIORITY_TIER" "critical"

BODY=$(cat "${FIXTURE_DIR}/low-priority-minimal.txt")
calc_full_score "$BODY" > /dev/null
assert_eq "low-prio: base score"   "$BASE_SCORE"  "1"
assert_eq "low-prio: bonus"        "$BONUS_SCORE" "0"
assert_eq "low-prio: tier"         "$PRIORITY_TIER" "low"

BODY=$(cat "${FIXTURE_DIR}/critical-all-bonuses.txt")
calc_full_score "$BODY" > /dev/null
assert_eq "critical: base score"   "$BASE_SCORE"  "512"
assert_eq "critical: all bonuses"  "$BONUS_SCORE" "30"
assert_eq "critical: total"        "$TOIL_SCORE"  "542"
assert_eq "critical: tier"         "$PRIORITY_TIER" "critical"

BODY=$(cat "${FIXTURE_DIR}/medium-priority-one-bonus.txt")
calc_full_score "$BODY" > /dev/null
assert_eq "medium: base score"     "$BASE_SCORE"  "18"
assert_eq "medium: one bonus"      "$BONUS_SCORE" "10"
assert_eq "medium: total"          "$TOIL_SCORE"  "28"
assert_eq "medium: tier"           "$PRIORITY_TIER" "high"

# ── Results ──────────────────────────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════════"
echo "  Tests: $TOTAL  |  ✅ Passed: $PASS  |  ❌ Failed: $FAIL"
echo "════════════════════════════════════════════"
echo ""
[ "$FAIL" -eq 0 ] || exit 1
