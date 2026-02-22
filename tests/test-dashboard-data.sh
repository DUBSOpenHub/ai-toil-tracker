#!/usr/bin/env bash
# =============================================================================
# tests/test-dashboard-data.sh — Unit tests for scripts/generate-dashboard-data.sh
# =============================================================================
# Run:  bash tests/test-dashboard-data.sh
# Exit: 0 = all pass, 1 = any failures
# Requires: jq
# =============================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

TMPDIR="$(mktemp -d)"
trap 'rm -rf "$TMPDIR"' EXIT

# Minimal config pointing output to temp paths
cat > "$TMPDIR/config.yml" << 'EOF'
dashboard:
  output_json: /tmp/test-dashboard-data.json
  history_json: /tmp/test-dashboard-history.json
  history_days: 0
labels:
  toil: toil
  automated: automated
scoring:
  priority_tiers:
    critical: 40
    high: 20
    medium: 10
  bonus_per_factor: 10
EOF

export CONFIG_FILE="$TMPDIR/config.yml"
export ISSUES_JSON_INPUT="$ROOT/tests/fixtures/issues-sample.json"
export REPO="test/repo"

bash "$ROOT/scripts/generate-dashboard-data.sh"

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

DATA="/tmp/test-dashboard-data.json"

echo ""
echo "── dashboard data tests ────────────────────"

total=$(jq '.meta.summary.totalToil' "$DATA")
open=$(jq '.meta.summary.openToil' "$DATA")
automated=$(jq '[.issues[] | select(.automated==true)] | length' "$DATA")
issues_count=$(jq '.issues | length' "$DATA")

assert_eq "total toil count"    "$total"        "2"
assert_eq "open toil count"     "$open"         "1"
assert_eq "automated count"     "$automated"    "1"
assert_eq "issues array length" "$issues_count" "2"

# Issue 1: freq=8, time=8, people=3, base=192, bonus=20, adjusted=212
first_adjusted=$(jq '.issues[0].scoring.adjusted' "$DATA")
assert_eq "first issue adjusted score" "$first_adjusted" "212"

first_priority=$(jq -r '.issues[0].scoring.priority' "$DATA")
assert_eq "first issue priority" "$first_priority" "critical"

# Issue 2: freq=2, time=2, people=1, base=4, bonus=0, adjusted=4
second_adjusted=$(jq '.issues[1].scoring.adjusted' "$DATA")
assert_eq "second issue adjusted score" "$second_adjusted" "4"

echo ""
echo "════════════════════════════════════════════"
echo "  Tests: $TOTAL  |  ✅ Passed: $PASS  |  ❌ Failed: $FAIL"
echo "════════════════════════════════════════════"
echo ""
[ "$FAIL" -eq 0 ] || exit 1
