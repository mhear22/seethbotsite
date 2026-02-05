#!/bin/bash
# Build and deploy the full-stack application

set -e

CONTAINER_NAME="seethbot-server"
IMAGE_NAME="seethbotsite-server:latest"
DOCKER="${DOCKER:-docker}"

# Get build info
GIT_HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
BUILD_NUMBER=$(cat backend/build-info.json 2>/dev/null | python3 -c "import sys, json; print(json.load(sys.stdin).get('buildCount', 'unknown'))" 2>/dev/null || echo "unknown")

echo "📝 Updating build info..."
./scripts/update-build-info.sh

# Notify Discord that build started
./scripts/notify-discord.sh "started" "$BUILD_NUMBER" "$GIT_HASH" "$GIT_BRANCH"

echo "🐳 Building Docker image (frontend + backend)..."
$DOCKER build \
  --build-arg GIT_HASH="$GIT_HASH" \
  --build-arg GIT_BRANCH="$GIT_BRANCH" \
  -t "$IMAGE_NAME" .

echo "✅ Build complete!"
echo ""

# Notify Discord that build succeeded
./scripts/notify-discord.sh "success" "$BUILD_NUMBER" "$GIT_HASH" "$GIT_BRANCH"

echo "🔄 Restarting server container..."
$DOCKER stop "$CONTAINER_NAME" 2>/dev/null || true
$DOCKER rm "$CONTAINER_NAME" 2>/dev/null || true

echo "🚀 Starting container..."
$DOCKER run -d \
  --name "$CONTAINER_NAME" \
  -p 8081:3000 \
  -v seethbot-data:/app/backend/data \
  -e NODE_ENV=production \
  "$IMAGE_NAME"

echo "✅ Deployment complete!"
echo "🌐 Website available at: http://localhost:8081"
echo "📊 API at: http://localhost:8081/api/*"
