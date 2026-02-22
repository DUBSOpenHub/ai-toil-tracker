#!/usr/bin/env bash
# =============================================================================
# scripts/scoring.sh — Shared scoring logic for AI Toil Tracker
# =============================================================================
# Source this file in workflows and scripts:
#   . ./scripts/scoring.sh
#
# After calling the functions below, these globals are set:
#   FREQ_SCORE, FREQ_LABEL, FREQ_TEXT
#   TIME_SCORE
#   PEOPLE_SCORE
#   BONUS_SCORE, BONUS_REASONS (array)
#   BASE_SCORE, TOIL_SCORE
#   PRIORITY_TIER, PRIORITY_DISPLAY, PRIORITY_LABEL
#
# Configurable via environment variables (defaults match config.yml):
#   CRITICAL_THRESHOLD, HIGH_THRESHOLD, MEDIUM_THRESHOLD, BONUS_PER_FACTOR
#
# Self-test: bash scripts/scoring.sh --selftest
# =============================================================================

# Configurable thresholds — override via env or load config.yml first
: "${CRITICAL_THRESHOLD:=40}"
: "${HIGH_THRESHOLD:=20}"
: "${MEDIUM_THRESHOLD:=10}"
: "${BONUS_PER_FACTOR:=10}"

# ---------------------------------------------------------------------------
# freq_score <value>
# Maps a frequency dropdown value to its integer score.
# Sets globals: FREQ_SCORE, FREQ_LABEL, FREQ_TEXT
# Echoes: integer score
# ---------------------------------------------------------------------------
freq_score() {
  local value="$1"
  local normalized
  normalized=$(echo "$value" | tr '[:upper:]' '[:lower:]')

  if echo "$normalized" | grep -q "multiple times per day"; then
    FREQ_SCORE=8; FREQ_LABEL="🔴 multiple-times-daily"; FREQ_TEXT="multiple times per day"
  elif echo "$normalized" | grep -q "daily"; then
    FREQ_SCORE=5; FREQ_LABEL="🟠 daily"; FREQ_TEXT="daily"
  elif echo "$normalized" | grep -q "multiple times per week"; then
    FREQ_SCORE=3; FREQ_LABEL="🟡 multiple-times-weekly"; FREQ_TEXT="multiple times per week"
  elif echo "$normalized" | grep -q "weekly"; then
    FREQ_SCORE=2; FREQ_LABEL="🔵 weekly"; FREQ_TEXT="weekly"
  else
    FREQ_SCORE=1; FREQ_LABEL="⚪ monthly"; FREQ_TEXT="monthly or less"
  fi
  echo "$FREQ_SCORE"
}

# ---------------------------------------------------------------------------
# time_score <value>
# Maps a time-per-occurrence dropdown value to its integer score.
# Sets global: TIME_SCORE
# Echoes: integer score
# ---------------------------------------------------------------------------
time_score() {
  local value="$1"
  local normalized
  normalized=$(echo "$value" | tr '[:upper:]' '[:lower:]')

  if echo "$normalized" | grep -qE '>[ ]?1 hour|over.1.hour|greater than 1'; then
    TIME_SCORE=8
  elif echo "$normalized" | grep -qE '30.{0,3}60 min|30[[:space:]]*[-–][[:space:]]*60'; then
    TIME_SCORE=5
  elif echo "$normalized" | grep -qE '15.{0,3}30 min|15[[:space:]]*[-–][[:space:]]*30'; then
    TIME_SCORE=3
  elif echo "$normalized" | grep -qE '5.{0,3}15 min|5[[:space:]]*[-–][[:space:]]*15'; then
    TIME_SCORE=2
  else
    TIME_SCORE=1
  fi
  echo "$TIME_SCORE"
}

# ---------------------------------------------------------------------------
# people_score <value>
# Maps a people-affected dropdown value to its integer score.
# Sets global: PEOPLE_SCORE
# Echoes: integer score
# ---------------------------------------------------------------------------
people_score() {
  local value="$1"
  local normalized
  normalized=$(echo "$value" | tr '[:upper:]' '[:lower:]')

  if echo "$normalized" | grep -qE 'multiple teams|org.wide'; then
    PEOPLE_SCORE=8
  elif echo "$normalized" | grep -q "entire team"; then
    PEOPLE_SCORE=5
  elif echo "$normalized" | grep -qE '4.{0,3}6 people'; then
    PEOPLE_SCORE=3
  elif echo "$normalized" | grep -qE '2.{0,3}3 people'; then
    PEOPLE_SCORE=2
  else
    PEOPLE_SCORE=1
  fi
  echo "$PEOPLE_SCORE"
}

# ---------------------------------------------------------------------------
# calc_bonus_score <full_issue_body>
# Parses checked bonus factor checkboxes from the issue body.
# Sets globals: BONUS_SCORE (integer), BONUS_REASONS (array)
# Echoes: integer bonus score
# ---------------------------------------------------------------------------
calc_bonus_score() {
  local body="$1"
  BONUS_SCORE=0
  BONUS_REASONS=()

  while IFS= read -r line; do
    if echo "$line" | grep -qiE '^\s*-\s*\[[xX]\]'; then
      if echo "$line" | grep -qi "error.prone"; then
        BONUS_SCORE=$(( BONUS_SCORE + BONUS_PER_FACTOR ))
        BONUS_REASONS+=("error-prone")
      fi
      if echo "$line" | grep -qi "morale.killer\|morale killer"; then
        BONUS_SCORE=$(( BONUS_SCORE + BONUS_PER_FACTOR ))
        BONUS_REASONS+=("morale-killer")
      fi
      if echo "$line" | grep -qi "\bblocking\b"; then
        BONUS_SCORE=$(( BONUS_SCORE + BONUS_PER_FACTOR ))
        BONUS_REASONS+=("blocking")
      fi
    fi
  done <<< "$body"

  echo "$BONUS_SCORE"
}

# ---------------------------------------------------------------------------
# priority_tier <adjusted_score>
# Sets globals: PRIORITY_TIER, PRIORITY_DISPLAY, PRIORITY_LABEL
# Echoes: tier string (critical|high|medium|low)
# ---------------------------------------------------------------------------
priority_tier() {
  local score="$1"

  if [ "$score" -ge "$CRITICAL_THRESHOLD" ]; then
    PRIORITY_TIER="critical"
    PRIORITY_DISPLAY="🔴 Critical — automate immediately"
    PRIORITY_LABEL="high-impact"
  elif [ "$score" -ge "$HIGH_THRESHOLD" ]; then
    PRIORITY_TIER="high"
    PRIORITY_DISPLAY="🟡 High — automate this sprint"
    PRIORITY_LABEL="high-impact"
  elif [ "$score" -ge "$MEDIUM_THRESHOLD" ]; then
    PRIORITY_TIER="medium"
    PRIORITY_DISPLAY="🟢 Medium — add to backlog"
    PRIORITY_LABEL=""
  else
    PRIORITY_TIER="low"
    PRIORITY_DISPLAY="⚪ Low — track but don't prioritize"
    PRIORITY_LABEL=""
  fi
  echo "$PRIORITY_TIER"
}

# ---------------------------------------------------------------------------
# monthly_multiplier <freq_score>
# Echoes: number of monthly occurrences
# ---------------------------------------------------------------------------
monthly_multiplier() {
  case "$1" in
    8) echo 60 ;;
    5) echo 20 ;;
    3) echo 10 ;;
    2) echo  4 ;;
    *) echo  1 ;;
  esac
}

# ---------------------------------------------------------------------------
# time_minutes <time_score>
# Echoes: representative minutes per occurrence
# ---------------------------------------------------------------------------
time_minutes() {
  case "$1" in
    8) echo 75 ;;
    5) echo 45 ;;
    3) echo 22 ;;
    2) echo 10 ;;
    *) echo  3 ;;
  esac
}

# ---------------------------------------------------------------------------
# format_monthly_saved <freq_score> <time_score> <people_score>
# Echoes: human-readable monthly time estimate (e.g. "~36 hours/month")
# ---------------------------------------------------------------------------
format_monthly_saved() {
  local fscore="$1" tscore="$2" pscore="$3"
  local mult mins total_mins
  mult=$(monthly_multiplier "$fscore")
  mins=$(time_minutes "$tscore")
  total_mins=$(( mult * mins * pscore ))

  if [ "$total_mins" -ge 60 ]; then
    echo "~$(( total_mins / 60 )) hours/month"
  else
    echo "~${total_mins} minutes/month"
  fi
}

# ---------------------------------------------------------------------------
# calc_full_score <full_issue_body>
# Convenience wrapper: parses all fields, populates all globals.
# Requires parse-form.sh to be sourced first (for parse_field).
# Echoes: adjusted toil score
# ---------------------------------------------------------------------------
calc_full_score() {
  local body="$1"

  local freq_val time_val people_val
  freq_val=$(parse_field "How often does it happen?" "$body")
  time_val=$(parse_field "How long does it take each time?" "$body")
  people_val=$(parse_field "Who is affected?" "$body")

  freq_score   "$freq_val"
  time_score   "$time_val"
  people_score "$people_val"
  calc_bonus_score "$body"

  BASE_SCORE=$(( FREQ_SCORE * TIME_SCORE * PEOPLE_SCORE ))
  TOIL_SCORE=$(( BASE_SCORE + BONUS_SCORE ))

  priority_tier "$TOIL_SCORE"
  echo "$TOIL_SCORE"
}

# ---------------------------------------------------------------------------
# Self-test mode: bash scripts/scoring.sh --selftest
# ---------------------------------------------------------------------------
if [[ "${1:-}" == "--selftest" ]]; then
  PASS=0; FAIL=0
  _assert() {
    local d="$1" g="$2" w="$3"
    if [ "$g" = "$w" ]; then echo "  ✅ $d"; PASS=$(( PASS+1 ))
    else echo "  ❌ $d: got='$g' want='$w'"; FAIL=$(( FAIL+1 )); fi
  }
  echo "=== scoring.sh --selftest ==="
  _assert "freq 8"  "$(freq_score '🔴 Multiple times per day')" "8"
  _assert "freq 5"  "$(freq_score '🟠 Daily')"                  "5"
  _assert "freq 3"  "$(freq_score '🟡 Multiple times per week')" "3"
  _assert "freq 2"  "$(freq_score '🔵 Weekly')"                  "2"
  _assert "freq 1"  "$(freq_score '⚪ Monthly or less')"          "1"
  _assert "time 8"  "$(time_score '> 1 hour')"      "8"
  _assert "time 5"  "$(time_score '30–60 minutes')" "5"
  _assert "time 3"  "$(time_score '15–30 minutes')" "3"
  _assert "time 2"  "$(time_score '5–15 minutes')"  "2"
  _assert "time 1"  "$(time_score '< 5 minutes')"   "1"
  _assert "ppl  8"  "$(people_score 'Multiple teams / org-wide')" "8"
  _assert "ppl  5"  "$(people_score 'Entire team')"               "5"
  _assert "ppl  3"  "$(people_score '4–6 people')"                "3"
  _assert "ppl  2"  "$(people_score '2–3 people')"                "2"
  _assert "ppl  1"  "$(people_score 'Just me')"                   "1"
  BODY=$'- [x] Error-prone\n- [x] Morale killer\n- [ ] Blocking'
  calc_bonus_score "$BODY" > /dev/null
  _assert "bonus 2×10=20" "$BONUS_SCORE" "20"
  priority_tier 50; _assert "priority critical" "$PRIORITY_TIER" "critical"
  priority_tier 25; _assert "priority high"     "$PRIORITY_TIER" "high"
  priority_tier 12; _assert "priority medium"   "$PRIORITY_TIER" "medium"
  priority_tier 5;  _assert "priority low"      "$PRIORITY_TIER" "low"
  _assert "monthly 1,1,1" "$(format_monthly_saved 1 1 1)" "~3 minutes/month"
  echo ""
  echo "Results: ${PASS} passed, ${FAIL} failed"
  [ "$FAIL" -eq 0 ] || exit 1
fi
