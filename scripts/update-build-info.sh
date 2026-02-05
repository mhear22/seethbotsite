#!/bin/bash
# Update build-info.json with current timestamp and use git commit count

set -e

BUILD_INFO_FILE="backend/build-info.json"

# Get git commit count
BUILD_COUNT=$(git rev-list --count HEAD 2>/dev/null || echo "1")

# Check if file exists
if [ ! -f "$BUILD_INFO_FILE" ]; then
  echo "⚠️  build-info.json not found, creating new one"
fi

# Get git info
GIT_HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "dev")
GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")
BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")

# Update build-info.json
jq --arg buildTime "$BUILD_TIME" \
   --arg gitHash "$GIT_HASH" \
   --arg gitBranch "$GIT_BRANCH" \
   --argjson buildCount "$BUILD_COUNT" \
   '.buildTime = $buildTime | .gitHash = $gitHash | .gitBranch = $gitBranch | .buildCount = $buildCount' \
   "$BUILD_INFO_FILE" > "${BUILD_INFO_FILE}.tmp" && mv "${BUILD_INFO_FILE}.tmp" "$BUILD_INFO_FILE"

echo "✅ Build info updated: Build #$BUILD_COUNT at $BUILD_TIME"
