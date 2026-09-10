#!/usr/bin/env bash
set -euo pipefail

# Keep crawler-visible sharing URLs correct on forks and custom Pages domains.
# REPO=owner/name is required. PAGES_URL optionally overrides the site's base URL.
# DASHBOARD_HTML overrides the target file for local tooling and tests.
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HTML_FILE="${DASHBOARD_HTML:-${ROOT_DIR}/docs/dashboard/index.html}"
REPO="${REPO:-${GITHUB_REPOSITORY:-}}"

if [[ ! "$REPO" =~ ^[[:alnum:]][[:alnum:]-]*/[[:alnum:]_.-]+$ ]]; then
  echo "REPO must be a GitHub owner/repository name." >&2
  exit 2
fi
if [[ ! -f "$HTML_FILE" ]]; then
  echo "Dashboard HTML not found: $HTML_FILE" >&2
  exit 2
fi

owner="$(printf '%s' "${REPO%%/*}" | tr '[:upper:]' '[:lower:]')"
name="${REPO#*/}"
name_lower="$(printf '%s' "$name" | tr '[:upper:]' '[:lower:]')"
base_url="${PAGES_URL:-}"
if [[ -z "$base_url" && -s "${ROOT_DIR}/docs/CNAME" ]]; then
  domain="$(<"${ROOT_DIR}/docs/CNAME")"
  base_url="https://${domain%$'\r'}"
fi
if [[ -z "$base_url" ]]; then
  base_url="https://${owner}.github.io"
  if [[ "$name_lower" != "${owner}.github.io" ]]; then
    base_url="${base_url}/${name}"
  fi
fi
base_url="${base_url%/}"
if [[ ! "$base_url" =~ ^https://[[:alnum:].-]+(/[[:alnum:]_.~%/-]*)?$ ]]; then
  echo "PAGES_URL must be an HTTPS site URL without a query or fragment." >&2
  exit 2
fi

dashboard_url="${base_url}/dashboard/"
image_url="${dashboard_url}social-preview.png?v=2"
tmp="$(mktemp "${HTML_FILE}.XXXXXX")"
trap 'rm -f "$tmp"' EXIT
awk -v dashboard_url="$dashboard_url" -v image_url="$image_url" '
  /^<link rel="canonical" / {
    sub(/href="[^"]*"/, "href=\"" dashboard_url "\"")
    canonical++
  }
  /^<meta property="og:url" / {
    sub(/content="[^"]*"/, "content=\"" dashboard_url "\"")
    url++
  }
  /^<meta property="og:image" / {
    sub(/content="[^"]*"/, "content=\"" image_url "\"")
    image++
  }
  /^<meta name="twitter:image" / {
    sub(/content="[^"]*"/, "content=\"" image_url "\"")
    twitter++
  }
  { print }
  END {
    if (canonical != 1 || url != 1 || image != 1 || twitter != 1) {
      print "Expected exactly one canonical URL and each sharing URL tag." > "/dev/stderr"
      exit 1
    }
  }
' "$HTML_FILE" > "$tmp"
if cmp -s "$HTML_FILE" "$tmp"; then
  echo "Dashboard sharing URLs already match ${dashboard_url}"
  exit 0
fi
chmod 644 "$tmp"
mv "$tmp" "$HTML_FILE"
echo "Updated dashboard sharing URLs for ${dashboard_url}"
