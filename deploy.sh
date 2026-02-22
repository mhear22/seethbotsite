#!/bin/bash
# Build and deploy the full-stack application using Docker Compose or Podman Compose

set -euo pipefail

# Detect container runtime
if command -v podman &>/dev/null; then
  CONTAINER_CMD="podman"
  COMPOSE_CMD="podman compose"
elif command -v docker &>/dev/null; then
  CONTAINER_CMD="docker"
  COMPOSE_CMD="docker compose"
else
  echo "❌ Neither podman nor docker found. Please install one of them."
  exit 1
fi

echo "🔧 Using: $CONTAINER_CMD"

if [ "$CONTAINER_CMD" = "docker" ]; then
  export DOCKER_BUILDKIT=1
  export COMPOSE_DOCKER_CLI_BUILD=1
  echo "⚡ Docker BuildKit enabled"

  # Set up persistent build cache
  CACHE_DIR="/tmp/buildkit-cache"
  mkdir -p "$CACHE_DIR"
  echo "💾 Build cache: $CACHE_DIR"
fi

# Get build info
GIT_HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
BUILD_NUMBER=$(git rev-list --count HEAD 2>/dev/null || echo "1")

# Export build info for compose/build args
export GIT_HASH
export GIT_BRANCH
export BUILD_NUMBER

# Prevent deployments when frontend typing is broken
echo "🔍 Running frontend typecheck..."
npm --prefix frontend run typecheck

# Notify Discord that build started
./scripts/notify-discord.sh "started" "$BUILD_NUMBER" "$GIT_HASH" "$GIT_BRANCH"

echo "🐳 Building images with $COMPOSE_CMD..."
$COMPOSE_CMD build

echo "✅ Build complete!"
echo ""

# Notify Discord that build succeeded
./scripts/notify-discord.sh "success" "$BUILD_NUMBER" "$GIT_HASH" "$GIT_BRANCH"

echo "🔄 Restarting services with $COMPOSE_CMD..."
$COMPOSE_CMD up -d

echo "⏳ Waiting for services to be healthy..."
# Wait for PostgreSQL to be healthy
timeout 60 sh -c "until $COMPOSE_CMD ps | grep postgres | grep -q 'healthy'; do sleep 2; done" || echo "⚠️  PostgreSQL health check timed out, but deployment continues"

# Wait for server to be healthy
timeout 60 sh -c "until $COMPOSE_CMD ps | grep server | grep -q 'healthy'; do sleep 2; done" || echo "⚠️  Server health check timed out, but deployment continues"

echo "✅ Deployment complete!"
echo ""
echo "🌐 Website available at: http://localhost:8081"
echo "📊 API at: http://localhost:8081/api/*"
echo "🗄️  PostgreSQL at: localhost:5432"
echo ""
echo "📋 Service Status:"
$COMPOSE_CMD ps
