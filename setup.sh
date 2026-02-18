#!/usr/bin/env bash
# setup.sh — After forking, run this to replace DUBSOpenHub/ai-first-toil-tracker
#             with your own org/repo across all relevant files.
#
# Usage:
#   ./setup.sh                  # auto-detects from git remote
#   ./setup.sh myorg/myrepo     # explicit org/repo

set -euo pipefail

ORIGINAL="DUBSOpenHub/ai-first-toil-tracker"

# --- Determine target org/repo ------------------------------------------------
if [[ $# -ge 1 ]]; then
  TARGET="$1"
else
  REMOTE_URL=$(git remote get-url origin 2>/dev/null || true)
  if [[ -z "$REMOTE_URL" ]]; then
    echo "❌  Could not detect a git remote. Pass your org/repo as an argument:"
    echo "    ./setup.sh myorg/myrepo"
    exit 1
  fi
  # Handle both HTTPS and SSH remote URLs
  TARGET=$(echo "$REMOTE_URL" | sed -E 's#.+github\.com[:/]##; s/\.git$//')
fi

if [[ -z "$TARGET" || "$TARGET" != */* ]]; then
  echo "❌  Invalid org/repo: '$TARGET'"
  echo "    Expected format: myorg/myrepo"
  exit 1
fi

# --- Idempotency: skip if already replaced -----------------------------------
if [[ "$TARGET" == "$ORIGINAL" ]]; then
  echo "✅  Nothing to do — repo is already set to $ORIGINAL."
  exit 0
fi

# --- Find and replace ---------------------------------------------------------
REPO_ROOT=$(git rev-parse --show-toplevel)
FILES=(
  "$REPO_ROOT/README.md"
  "$REPO_ROOT/SECURITY.md"
  "$REPO_ROOT/.github/workflows/stale.yml"
)

changed=0
for file in "${FILES[@]}"; do
  if [[ ! -f "$file" ]]; then
    continue
  fi
  if grep -q "$ORIGINAL" "$file"; then
    if [[ "$(uname)" == "Darwin" ]]; then
      sed -i '' "s|$ORIGINAL|$TARGET|g" "$file"
    else
      sed -i "s|$ORIGINAL|$TARGET|g" "$file"
    fi
    relpath="${file#$REPO_ROOT/}"
    echo "✏️   Updated $relpath"
    changed=$((changed + 1))
  fi
done

if [[ $changed -eq 0 ]]; then
  echo "✅  No files contained '$ORIGINAL' — already up to date."
else
  echo ""
  echo "✅  Replaced '$ORIGINAL' → '$TARGET' in $changed file(s)."
  echo "    Review the changes with:  git diff"
fi
