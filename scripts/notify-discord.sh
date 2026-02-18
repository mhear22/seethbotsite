#!/bin/bash
# Send Discord webhook notification for build deployments

# Colors for Discord embeds
# 0x00ff00 = Green (Success)
# 0xff0000 = Red (Error)
# 0xffff00 = Yellow (Warning)
# 0x00bfff = Blue (Info)

DISCORD_WEBHOOK_URL="${DISCORD_WEBHOOK_URL:-}"

if [ -z "$DISCORD_WEBHOOK_URL" ]; then
  echo "⚠️  DISCORD_WEBHOOK_URL not set. Skipping Discord notification."
  exit 0
fi

# Default values
STATUS="${1:-success}"
BUILD_NUMBER="${2:-unknown}"
GIT_HASH="${3:-unknown}"
GIT_BRANCH="${4:-unknown}"
BUILD_TIME="${5:-$(date -u +"%Y-%m-%d %H:%M:%S UTC")}"

# Determine color and emoji based on status
case "$STATUS" in
  "success")
    COLOR=65280  # Green
    EMOJI="✅"
    TITLE="Build Completed Successfully"
    ;;
  "failed")
    COLOR=16711680  # Red
    EMOJI="❌"
    TITLE="Build Failed"
    ;;
  "started")
    COLOR=255  # Blue
    EMOJI="🚀"
    TITLE="Build Started"
    ;;
  *)
    COLOR=16776960  # Yellow
    EMOJI="ℹ️"
    TITLE="Build Update"
    ;;
esac

# Get build info if available
if [ -f "backend/build-info.json" ]; then
  BUILD_INFO=$(cat backend/build-info.json)
  FILE_BUILD_TIME=$(echo "$BUILD_INFO" | python3 -c "import sys, json; print(json.load(sys.stdin).get('buildTime', '$BUILD_TIME'))" 2>/dev/null || echo "$BUILD_TIME")
  FILE_BUILD_NUMBER=$(echo "$BUILD_INFO" | python3 -c "import sys, json; print(json.load(sys.stdin).get('buildCount', '$BUILD_NUMBER'))" 2>/dev/null || echo "$BUILD_NUMBER")

  if [ -z "$BUILD_TIME" ] || [ "$BUILD_TIME" = "unknown" ]; then
    BUILD_TIME="$FILE_BUILD_TIME"
  fi

  if [ -z "$BUILD_NUMBER" ] || [ "$BUILD_NUMBER" = "unknown" ]; then
    BUILD_NUMBER="$FILE_BUILD_NUMBER"
  fi
fi

# Create Discord webhook payload
PAYLOAD=$(cat <<EOF
{
  "username": "Mold Build Bot",
  "avatar_url": "https://cataas.com/cat?width=200&height=200&timestamp=$(date +%s)",
  "embeds": [
    {
      "title": "$EMOJI $TITLE",
      "description": "A new build has been deployed to seethbotsite",
      "color": $COLOR,
      "fields": [
        {
          "name": "Build #",
          "value": "$BUILD_NUMBER",
          "inline": true
        },
        {
          "name": "Branch",
          "value": "$GIT_BRANCH",
          "inline": true
        },
        {
          "name": "Git Hash",
          "value": "$GIT_HASH",
          "inline": true
        },
        {
          "name": "Time",
          "value": "$BUILD_TIME",
          "inline": false
        }
      ],
      "footer": {
        "text": "Mold Bot • Deployed via Docker",
        "icon_url": "https://cataas.com/cat?width=64&height=64&timestamp=$(date +%s)"
      },
      "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")"
    }
  ]
}
EOF
)

# Send webhook
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" \
  "$DISCORD_WEBHOOK_URL")

if [ "$HTTP_CODE" -eq 204 ] || [ "$HTTP_CODE" -eq 200 ]; then
  echo "✅ Discord notification sent successfully"
  exit 0
else
  echo "❌ Failed to send Discord notification (HTTP $HTTP_CODE)"
  exit 1
fi
