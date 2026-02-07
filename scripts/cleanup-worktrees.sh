#!/bin/bash
# Clean up stale or orphaned git worktrees
# Usage: ./scripts/cleanup-worktrees.sh
#
# Removes worktrees that:
# - Don't have a corresponding branch in the main repo
# - Are older than MAX_AGE_DAYS
# - Have been completed and merged

set -e

WORKDIR="/home/seethbotsite"
WORKTREE_DIR="$WORKDIR/worktrees"
MAX_AGE_DAYS=7

cd "$WORKDIR"

echo "Checking for stale worktrees..."
echo ""

# List all worktrees
WORKTREES=$(git worktree list | grep -v "bare" | awk '{print $1}')

if [ -z "$WORKTREES" ]; then
  echo "✅ No worktrees found."
  exit 0
fi

REMOVED=0

for worktree in $WORKTREES; do
  # Skip main repo
  if [ "$worktree" = "$WORKDIR" ]; then
    continue
  fi

  # Extract branch name from worktree list
  BRANCH_NAME=$(git worktree list | grep "$worktree" | awk '{print $3}' | sed 's/^\[//' | sed 's/\]$//')

  # Check if branch exists in main repo
  if ! git show-ref --verify --quiet "refs/heads/$BRANCH_NAME" && ! git show-ref --verify --quiet "refs/remotes/origin/$BRANCH_NAME"; then
    echo "🗑️ Removing orphaned worktree: $worktree (branch: $BRANCH_NAME)"
    git worktree remove "$worktree" -f
    REMOVED=1
  else
    # Check age
    if [ -d "$worktree" ]; then
      AGE_DAYS=$(( ($(date +%s) - $(stat -c %Y "$worktree")) / 86400 ))
      if [ $AGE_DAYS -gt $MAX_AGE_DAYS ]; then
        echo "🗑️ Removing stale worktree: $worktree (age: $AGE_DAYS days)"
        git worktree remove "$worktree" -f
        REMOVED=1
      else
        echo "✅ Keeping worktree: $worktree (age: $AGE_DAYS days)"
      fi
    fi
  fi
done

echo ""

if [ $REMOVED -eq 1 ]; then
  echo "✅ Cleanup complete."
else
  echo "✅ All worktrees are active."
fi
