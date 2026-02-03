#!/bin/bash

# Configuration
SESSIONS_DIR="${1:-'/root/.clawdbot/agents/main/sessions'}"  # Set this to your session files directory
TOKEN_THRESHOLD=50000

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "Error: jq is required but not installed. Install it with: sudo dnf install jq"
    exit 1
fi

echo "Fetching sessions from clawdbot..."

# Fetch JSON data from clawdbot
json_data=$(npx clawdbot sessions --json 2>/dev/null)

if [ $? -ne 0 ]; then
    echo "Error: Failed to fetch sessions from 'npx clawdbot sessions --json'"
    exit 1
fi

if [ -z "$json_data" ]; then
    echo "Error: No data returned from clawdbot"
    exit 1
fi

echo "Searching for sessions with totalTokens > $TOKEN_THRESHOLD..."

# Parse JSON and find sessions with totalTokens > 100000
# Assumes JSON structure is either an array of sessions or an object with sessions
session_ids=$(echo "$json_data" | jq -r '
    if type == "array" then
        .[] | select(.totalTokens > 100000) | .sessionId
    elif type == "object" then
        .[] | select(.totalTokens > 100000) | .sessionId
    else
        empty
    end
' 2>/dev/null)

if [ -z "$session_ids" ]; then
    echo "No sessions found with totalTokens > $TOKEN_THRESHOLD"
    exit 0
fi

# Count sessions to be deleted
count=$(echo "$session_ids" | wc -l)
echo "Found $count session(s) to delete:"

# Delete the corresponding .jsonl files
deleted=0
failed=0

while IFS= read -r session_id; do
    if [ -n "$session_id" ]; then
        file_path="$SESSIONS_DIR/${session_id}.jsonl"

        if [ -f "$file_path" ]; then
            echo "  Deleting: $file_path"
            rm "$file_path"
            if [ $? -eq 0 ]; then
                ((deleted++))
            else
                echo "    Failed to delete $file_path"
                ((failed++))
            fi
        else
            echo "  File not found: $file_path"
            ((failed++))
        fi
    fi
done <<< "$session_ids"

echo ""
echo "Summary:"
echo "  Deleted: $deleted file(s)"
echo "  Failed/Not found: $failed file(s)"
