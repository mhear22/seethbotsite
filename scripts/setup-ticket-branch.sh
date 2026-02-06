#!/bin/bash
# Setup a ticket branch for sub-agent work
# Usage: ./scripts/setup-ticket-branch.sh [ticket-id]
# If no ticket-id provided, auto-selects from eligible pending tickets

set -e

# Configuration
TICKET_API="http://localhost:8081/api/tickets"
WORKDIR="/home/seethbotsite"
MAX_ELIGIBLE_AGE_HOURS=2  # Don't restart tickets older than this unless specified

cd "$WORKDIR"

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

# Check if branch already exists (short circuit for restarting work)
if git ls-remote --heads origin "$BRANCH_NAME" | grep -q "$BRANCH_NAME"; then
  echo "REUSING_EXISTING_BRANCH:$BRANCH_NAME:$TICKET_ID"
  git checkout "$BRANCH_NAME" 2>/dev/null || git checkout -b "$BRANCH_NAME" "origin/$BRANCH_NAME"
  git pull origin "$BRANCH_NAME" 2>/dev/null || true
else
  echo "CREATING_NEW_BRANCH:$BRANCH_NAME:$TICKET_ID"
  git checkout main 2>/dev/null || git checkout master 2>/dev/null || git checkout -b main origin/main
  git pull origin main 2>/dev/null || git pull origin master 2>/dev/null || true
  git checkout -b "$BRANCH_NAME"
fi

# Write ticket metadata to workspace root
echo "$TICKET_JSON" > .ticket-meta.json

echo "READY:$BRANCH_NAME:$TICKET_ID"
echo "Ticket info written to .ticket-meta.json"
