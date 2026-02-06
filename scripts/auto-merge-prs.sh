#!/bin/bash
# Auto-merge completed ticket branches into main
# Usage: ./scripts/auto-merge-prs.sh
#
# Workflow:
# - Sub-agents push branches and mark tickets as "completed"
# - This script checks for completed tickets and merges their branches
# - Merges directly to main (no PRs needed)

set -e

WORKDIR="/home/seethbotsite"
ALERT_CHANNEL="<#1001285086655807550>"
TICKET_API="http://localhost:8081/api/tickets"
cd "$WORKDIR"

echo "Checking for completed tickets with branches..."

# Get all completed tickets
COMPLETED_TICKETS=$(curl -s "$TICKET_API" | \
  jq -r '.tickets[] | select(.status == "completed") | "\(.id):\(.title)"')

if [ -z "$COMPLETED_TICKETS" ]; then
  echo "No completed tickets found."
  exit 0
fi

echo "Found completed tickets:"
echo "$COMPLETED_TICKETS"
echo

# Switch to main first
git checkout main 2>/dev/null || git checkout master 2>/dev/null || git checkout -b main origin/main
git pull origin main 2>/dev/null || git pull origin master 2>/dev/null || true

MERGED_ANY=0

# Process each completed ticket
while IFS=':' read -r ticket_id ticket_title; do
  echo "Processing ticket #$ticket_id: $ticket_title"

  # Generate expected branch name
  BRANCH_NAME=$(echo "$ticket_title" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9-]/-/g' | tr -s '-')
  BRANCH_NAME="ticket-$ticket_id-$BRANCH_NAME"

  # Check if branch exists on remote
  if ! git ls-remote --heads origin "$BRANCH_NAME" | grep -q "$BRANCH_NAME"; then
    echo "⚠️ Branch $BRANCH_NAME not found on remote, skipping..."
    continue
  fi

  echo "Merging branch $BRANCH_NAME into main..."

  # Try to merge
  if git merge "$BRANCH_NAME" --no-ff -m "Merge ticket #$ticket_id: $ticket_title"; then
    echo "✅ Successfully merged $BRANCH_NAME"

    # Push merge
    git push origin main 2>/dev/null || git push origin master 2>/dev/null

    # Delete remote branch
    git push origin --delete "$BRANCH_NAME"

    # Delete local branch
    git branch -D "$BRANCH_NAME" 2>/dev/null || true

    MERGED_ANY=1

    # Update ticket status to "deployed" to avoid re-merging
    curl -s -X PATCH "http://localhost:8081/api/tickets/$ticket_id" \
      -H "Content-Type: application/json" \
      -d '{"status":"deployed"}' > /dev/null
  else
    echo "❌ Merge conflict on $BRANCH_NAME"
    echo "❌ Alerting channel about merge conflict..."
    # Abort merge
    git merge --abort 2>/dev/null || true
    # Alert via message tool when running in heartbeat context
  fi
done <<< "$COMPLETED_TICKETS"

# Deploy if we merged anything
if [ $MERGED_ANY -eq 1 ]; then
  echo "Running deployment..."
  ./deploy.sh
fi

echo "Auto-merge check complete."
