#!/usr/bin/env bash
set -euo pipefail

# Portable (bash 3.2+) YAML lookup for config.yml.
# Supports:
# - maps with 2-space indentation
# - scalar values (strings/numbers)
# - dot-path keys, e.g. "ai.model" or "scoring.priority_tiers.critical"

CONFIG_FILE="${CONFIG_FILE:-config.yml}"

_cfg_strip_quotes() {
  local s="$1"
  s="$(printf '%s' "$s" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
  if [[ "$s" =~ ^".*"$ ]]; then
    s="${s:1:${#s}-2}"
  elif [[ "$s" =~ ^\'.*\'$ ]]; then
    s="${s:1:${#s}-2}"
  fi
  printf '%s' "$s"
}

config_get() {
  local key="$1"
  local def="${2-}"

  if [[ ! -f "$CONFIG_FILE" ]]; then
    printf '%s' "$def"
    return 0
  fi

  # Single-pass parser that prints the first matching key.
  local val
  val="$(
    awk -v want="$key" '
      function trim(s) { sub(/^[[:space:]]+/, "", s); sub(/[[:space:]]+$/, "", s); return s }
      function strip_comment(s) { sub(/#.*/, "", s); return s }
      {
        line=$0
        line=strip_comment(line)
        if (line ~ /^[[:space:]]*$/) next

        match(line, /^[ ]*/)
        indent=RLENGTH
        rest=substr(line, indent+1)
        pos=index(rest, ":")
        if (pos==0) next

        k=trim(substr(rest, 1, pos-1))
        v=trim(substr(rest, pos+1))
        level=int(indent/2)

        keys[level]=k
        for (i=level+1; i<50; i++) delete keys[i]

        # Only scalars (maps have empty values)
        if (v=="" || v=="|" || v==">") next

        path=keys[0]
        for (i=1; i<=level; i++) path=path "." keys[i]
        if (path==want) { print v; exit }
      }
    ' "$CONFIG_FILE"
  )"

  val="$(_cfg_strip_quotes "$val")"
  if [[ -n "$val" ]]; then
    printf '%s' "$val"
  else
    printf '%s' "$def"
  fi
}

config_require() {
  local key="$1"
  local v
  v="$(config_get "$key" "")"
  if [[ -z "$v" ]]; then
    echo "Missing required config key: $key" >&2
    return 1
  fi
  printf '%s' "$v"
}
