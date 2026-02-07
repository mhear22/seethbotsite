#!/bin/bash
# Setup a ticket branch for sub-agent work using git worktrees
# Usage: ./scripts/setup-ticket-branch.sh [ticket-id]
# If no ticket-id provided, auto-selects from eligible pending tickets
#
# Output format: READY:<branch>:<ticket-id>:<worktree-path>
# Example: READY:ticket-128-feature-name:128:/home/seethbotsite/worktrees/ticket-128

set -e

# Configuration
TICKET_API="http://localhost:8081/api/tickets"
MAIN_REPO="/home/seethbotsite"
WORKTREE_DIR="$MAIN_REPO/worktrees"
MAX_ELIGIBLE_AGE_HOURS=2

# Ensure worktrees directory exists
mkdir -p "$WORKTREE_DIR"

cd "$MAIN_REPO"

# If ticket-id not provided, auto-select from eligible tickets
if [ -z "$1" ]; then
  echo "No ticket ID provided, searching for eligible tickets..."

  # Get pending tickets, exclude joke tickets (2, 4), exclude in-progress branches
  ELIGIBLE=$(curl -s "$TICKET_API" | \
    jq -r '.tickets[] | 
      select(.status == "pending" or .status == "needs-info") | 
      select(.id != 2 and .id != 4) | 
      .id' | \
    head -1)

  if [ -z "$ELIGIBLE" ]; then
    echo "NO_ELIGIBLE_TICKETS"
    exit 0
  fi

  TICKET_ID=$ELIGIBLE
  echo "Auto-selected ticket #$TICKET_ID"
else
  TICKET_ID=$1
fi

# Fetch ticket details (API returns all tickets, we filter)
TICKET_JSON=$(curl -s "$TICKET_API" | jq ".tickets[] | select(.id == $TICKET_ID)")

if [ -z "$TICKET_JSON" ]; then
  echo "ERROR: Ticket #$TICKET_ID not found"
  exit 1
fi

TITLE=$(echo "$TICKET_JSON" | jq -r '.title' | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9-]/-/g' | tr -s '-')
BRANCH_NAME="ticket-$TICKET_ID-$TITLE"

# Check if worktree already exists
if [ -d "$WORKTREE_PATH" ]; then
  echo "REUSING_EXISTING_WORKTREE:$BRANCH_NAME:$TICKET_ID:$WORKTREE_PATH"
  echo "✅ Using existing worktree at $WORKTREE_PATH"
else
  echo "CREATING_NEW_WORKTREE:$BRANCH_NAME:$TICKET_ID:$WORKTREE_PATH"

  # Ensure main is up to date
  git checkout main 2>/dev/null || git checkout master 2>/dev/null || git checkout -b main origin/main
  git pull origin main 2>/dev/null || git pull origin master 2>/dev/null || true

  # Check if branch already exists on remote
  if git ls-remote --heads origin "$BRANCH_NAME" | grep -q "$BRANCH_NAME"; then
    echo "✅ Branch $BRANCH_NAME exists on remote, creating worktree from it"
    git worktree add "$WORKTREE_PATH" "origin/$BRANCH_NAME"
  else
    echo "✅ Creating new branch $BRANCH_NAME and worktree"
    git worktree add -b "$BRANCH_NAME" "$WORKTREE_PATH" main
  fi
fi

# Write ticket metadata to worktree
echo "$TICKET_JSON" > "$WORKTREE_PATH/.ticket-meta.json"

echo "READY:$BRANCH_NAME:$TICKET_ID:$WORKTREE_PATH"
echo ""
echo "================================"
echo "📍 Worktree Location: $WORKTREE_PATH"
echo "🌿 Branch: $BRANCH_NAME"
echo "🎫 Ticket: #$TICKET_ID"
echo "================================"
echo ""
echo "Next steps:"
echo "  cd $WORKTREE_PATH"
echo "  # Make your changes..."
echo "  git add ."
echo "  git commit -m 'Fixes #$TICKET_ID: description'"
echo "  git push origin $BRANCH_NAME"
echo "  # Mark ticket complete via CLI or API"
echo ""
