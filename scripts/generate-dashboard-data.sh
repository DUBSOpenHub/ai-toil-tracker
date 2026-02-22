#!/usr/bin/env bash
set -euo pipefail

# Generates docs/dashboard/dashboard-data.json and docs/dashboard/history.json
# from GitHub Issues labeled as toil.

# shellcheck source=./scripts/config.sh
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/config.sh"
# shellcheck source=./scripts/scoring.sh
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/scoring.sh"
# shellcheck source=./scripts/parse-form.sh
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/parse-form.sh"

# Bridge: wraps Sonnet's scoring.sh globals into key=value output
compute_scores_from_issue_body() {
  local body="$1"
  calc_full_score "$body" > /dev/null
  local mult mins monthly_mins monthly_saved_text
  mult=$(monthly_multiplier "$FREQ_SCORE")
  mins=$(time_minutes "$TIME_SCORE")
  monthly_mins=$(( mult * mins * PEOPLE_SCORE ))
  monthly_saved_text=$(format_monthly_saved "$FREQ_SCORE" "$TIME_SCORE" "$PEOPLE_SCORE")
  printf 'freq_score=%s\n' "$FREQ_SCORE"
  printf 'time_score=%s\n' "$TIME_SCORE"
  printf 'people_score=%s\n' "$PEOPLE_SCORE"
  printf 'base_score=%s\n' "$BASE_SCORE"
  printf 'bonus_count=%s\n' "${#BONUS_REASONS[@]}"
  printf 'bonus_points=%s\n' "$BONUS_SCORE"
  printf 'adjusted_score=%s\n' "$TOIL_SCORE"
  printf 'priority=%s\n' "$PRIORITY_TIER"
  printf 'monthly_saved=%s\n' "$monthly_saved_text"
  printf 'monthly_mins=%s\n' "$monthly_mins"
}

REPO="${REPO:-}"
if [[ -z "$REPO" ]]; then
  echo "REPO env var required (owner/repo)" >&2
  exit 2
fi

OUT_JSON="$(config_get 'dashboard.output_json' 'docs/dashboard/dashboard-data.json')"
HISTORY_JSON="$(config_get 'dashboard.history_json' 'docs/dashboard/history.json')"
HISTORY_DAYS="$(config_get 'dashboard.history_days' '90')"

TOIL_LABEL="$(config_get 'labels.toil' 'toil')"
AUTOMATED_LABEL="$(config_get 'labels.automated' 'automated')"

mkdir -p "$(dirname "$OUT_JSON")" "$(dirname "$HISTORY_JSON")"

ISSUES_JSON_INPUT="${ISSUES_JSON_INPUT:-}"

if [[ -n "$ISSUES_JSON_INPUT" ]]; then
  issues_json="$(cat "$ISSUES_JSON_INPUT")"
else
  issues_json="$(gh issue list --repo "$REPO" --label "$TOIL_LABEL" --state all --limit 1000 \
    --json number,title,state,labels,createdAt,updatedAt,author,body,url)"
fi

kv_get() {
  local kv="$1"
  local want="$2"
  printf '%s\n' "$kv" | awk -F= -v k="$want" '$1==k{print substr($0, length(k)+2); exit}'
}

issues_enriched="$(jq -c '.[]' <<<"$issues_json" | while IFS= read -r issue; do
  number="$(jq -r '.number' <<<"$issue")"
  title="$(jq -r '.title' <<<"$issue")"
  state="$(jq -r '.state' <<<"$issue")"
  url="$(jq -r '.url' <<<"$issue")"
  createdAt="$(jq -r '.createdAt' <<<"$issue")"
  updatedAt="$(jq -r '.updatedAt' <<<"$issue")"
  author="$(jq -r '.author.login // ""' <<<"$issue")"
  body="$(jq -r '.body // ""' <<<"$issue")"

  kv="$(compute_scores_from_issue_body "$body")"
  freq_score="$(kv_get "$kv" 'freq_score')"
  time_score="$(kv_get "$kv" 'time_score')"
  people_score="$(kv_get "$kv" 'people_score')"
  base_score="$(kv_get "$kv" 'base_score')"
  bonus_count="$(kv_get "$kv" 'bonus_count')"
  bonus_points="$(kv_get "$kv" 'bonus_points')"
  adjusted_score="$(kv_get "$kv" 'adjusted_score')"
  priority="$(kv_get "$kv" 'priority')"
  monthly_saved="$(kv_get "$kv" 'monthly_saved')"
  monthly_mins="$(kv_get "$kv" 'monthly_mins')"

  automated="$(jq -r --arg a "$AUTOMATED_LABEL" '[.labels[].name] | index($a) != null' <<<"$issue")"

  jq -n \
    --argjson number "$number" \
    --arg title "$title" \
    --arg state "$state" \
    --arg url "$url" \
    --arg createdAt "$createdAt" \
    --arg updatedAt "$updatedAt" \
    --arg author "$author" \
    --argjson freqScore "${freq_score:-1}" \
    --argjson timeScore "${time_score:-1}" \
    --argjson peopleScore "${people_score:-1}" \
    --argjson baseScore "${base_score:-1}" \
    --argjson bonusCount "${bonus_count:-0}" \
    --argjson bonusPoints "${bonus_points:-0}" \
    --argjson adjustedScore "${adjusted_score:-1}" \
    --arg priority "${priority:-}" \
    --arg monthlySaved "${monthly_saved:-}" \
    --argjson monthlyMins "${monthly_mins:-0}" \
    --argjson automated "$automated" \
    '{
      number: $number,
      title: $title,
      state: $state,
      url: $url,
      author: $author,
      createdAt: $createdAt,
      updatedAt: $updatedAt,
      scoring: {
        frequency: $freqScore,
        time: $timeScore,
        people: $peopleScore,
        base: $baseScore,
        bonusCount: $bonusCount,
        bonusPoints: $bonusPoints,
        adjusted: $adjustedScore,
        priority: $priority
      },
      roi: {
        monthlyMins: $monthlyMins,
        monthlySavedText: $monthlySaved
      },
      automated: $automated
    }'
done | jq -s '.')"

summary_json="$(jq -n \
  --arg generatedAt "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  --arg repo "$REPO" \
  --arg toilLabel "$TOIL_LABEL" \
  --arg automatedLabel "$AUTOMATED_LABEL" \
  --argjson total "$(jq 'length' <<<"$issues_enriched")" \
  --argjson open "$(jq '[.[] | select(.state=="OPEN")] | length' <<<"$issues_enriched")" \
  --argjson automated "$(jq '[.[] | select(.automated==true)] | length' <<<"$issues_enriched")" \
  --argjson monthlyMinutes "$(jq '[.[] | .roi.monthlyMins] | add' <<<"$issues_enriched")" \
  '{
    generatedAt: $generatedAt,
    repo: $repo,
    labels: { toil: $toilLabel, automated: $automatedLabel },
    summary: {
      totalToil: $total,
      openToil: $open,
      automated: $automated,
      monthlyMinutes: $monthlyMinutes
    }
  }')"

final_json="$(jq -n --argjson meta "$summary_json" --argjson issues "$issues_enriched" '{meta: $meta, issues: $issues}')"

_tmp_out="$(mktemp)"
printf '%s\n' "$final_json" | jq '.' > "$_tmp_out"

if [[ -f "$OUT_JSON" ]] && cmp -s "$_tmp_out" "$OUT_JSON"; then
  rm -f "$_tmp_out"
else
  mv "$_tmp_out" "$OUT_JSON"
fi

if [[ "$HISTORY_DAYS" -gt 0 ]]; then
  today="$(date -u +%Y-%m-%d)"
  entry="$(jq -n \
    --arg date "$today" \
    --argjson totalToil "$(jq -r '.meta.summary.totalToil' <<<"$final_json")" \
    --argjson openToil "$(jq -r '.meta.summary.openToil' <<<"$final_json")" \
    --argjson automated "$(jq -r '.meta.summary.automated' <<<"$final_json")" \
    --argjson monthlyMinutes "$(jq -r '.meta.summary.monthlyMinutes' <<<"$final_json")" \
    '{date:$date,totalToil:$totalToil,openToil:$openToil,automated:$automated,monthlyMinutes:$monthlyMinutes}')"

  if [[ -f "$HISTORY_JSON" ]]; then
    history="$(cat "$HISTORY_JSON")"
  else
    history='[]'
  fi

  updated="$(jq -n --argjson history "$history" --argjson entry "$entry" --arg today "$today" \
    '$history
     | map(select(.date != $today))
     | . + [$entry]
     | sort_by(.date)')"

  cutoff="$(date -u -d "${HISTORY_DAYS} days ago" +%Y-%m-%d 2>/dev/null || date -u -v"-${HISTORY_DAYS}d" +%Y-%m-%d)"
  updated_pruned="$(jq -n --argjson history "$updated" --arg cutoff "$cutoff" '$history | map(select(.date >= $cutoff))')"
  printf '%s\n' "$updated_pruned" | jq '.' > "$HISTORY_JSON"
fi
