#!/usr/bin/env bash
# =============================================================================
# scripts/parse-form.sh — Robust GitHub issue form field extraction
# =============================================================================
# Source this file:  . ./scripts/parse-form.sh
#
# Functions:
#   parse_field <heading> <body>       → echoes trimmed field value (or empty)
#   parse_bonus_checkboxes <body>      → echoes newline-per-checked-name
#   sanitize_body <body>               → echoes safe body or __SENSITIVE_CONTENT_DETECTED__
#   normalize_field <value>            → echoes lowercase + trimmed + dashes normalized
#
# Edge cases handled:
#   ✓ Blank lines between heading and value
#   ✓ _No response_ sentinel → empty string
#   ✓ Leading/trailing whitespace stripped
#   ✓ Multi-line answers (first meaningful line returned)
#   ✓ Unicode characters in values
#   ✓ Compact format (no blank line between heading and value)
#   ✓ En-dash (–) and em-dash (—) in dropdown values
# =============================================================================

# ---------------------------------------------------------------------------
# parse_field <heading> <body>
# Extracts the first meaningful line following a "### heading" in a GitHub
# issue form body.
# ---------------------------------------------------------------------------
parse_field() {
  local heading="$1"
  local body="$2"
  local target="### ${heading}"
  local in_section=0

  while IFS= read -r line; do
    if [ "$in_section" -eq 1 ]; then
      # Stop at the next section heading
      if [[ "$line" == "### "* ]]; then
        break
      fi
      # Trim and check for content
      local trimmed
      trimmed=$(echo "$line" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | tr -d '\r')
      if [ -n "$trimmed" ]; then
        # Skip GitHub's "no response" sentinel value
        if [ "$trimmed" = "_No response_" ] || [ "$trimmed" = "_No Response_" ]; then
          break
        fi
        echo "$trimmed"
        return
      fi
    fi
    # Match the target heading (strip trailing whitespace for safety)
    local stripped
    stripped=$(echo "$line" | sed 's/[[:space:]]*$//' | tr -d '\r')
    if [ "$stripped" = "$target" ]; then
      in_section=1
    fi
  done <<< "$body"
  # Return empty string if field not found
}

# ---------------------------------------------------------------------------
# parse_bonus_checkboxes <body>
# Parses checked bonus factor checkboxes from anywhere in the issue body.
# Outputs one line per checked factor name.
# ---------------------------------------------------------------------------
parse_bonus_checkboxes() {
  local body="$1"

  while IFS= read -r line; do
    if echo "$line" | grep -qiE '^\s*-\s*\[[xX]\]'; then
      if echo "$line" | grep -qi "error.prone"; then
        echo "error-prone"
      fi
      if echo "$line" | grep -qi "morale.killer\|morale killer"; then
        echo "morale-killer"
      fi
      if echo "$line" | grep -qi "\bblocking\b"; then
        echo "blocking"
      fi
    fi
  done <<< "$body"
}

# ---------------------------------------------------------------------------
# sanitize_body <body>
# Detects potential secrets/credentials and returns a sentinel if found.
# Truncates to 2000 chars to limit AI prompt size.
# ---------------------------------------------------------------------------
sanitize_body() {
  local body="$1"

  if echo "$body" | grep -qiE '(AKIA[A-Z0-9]{16}|ghp_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{59}|sk-[a-zA-Z0-9]{20,}|password\s*[:=]|token\s*[:=]|secret\s*[:=]|api.key\s*[:=])'; then
    echo "__SENSITIVE_CONTENT_DETECTED__"
    return
  fi

  echo "$body" | head -c 2000
}

# ---------------------------------------------------------------------------
# normalize_field <value>
# Returns: lowercase, trimmed, en/em dashes → ASCII hyphen.
# ---------------------------------------------------------------------------
normalize_field() {
  echo "$1" \
    | tr '[:upper:]' '[:lower:]' \
    | sed 's/[–—]/-/g' \
    | sed 's/^[[:space:]]*//;s/[[:space:]]*$//'
}
