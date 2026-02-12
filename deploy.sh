#!/bin/bash
# Build and deploy the full-stack application using Docker Compose

set -e

# Get build info
GIT_HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
BUILD_NUMBER=$(cat backend/build-info.json 2>/dev/null | python3 -c "import sys, json; print(json.load(sys.stdin).get('buildCount', 'unknown'))" 2>/dev/null || echo "unknown")

# Export build info for Docker Compose
export GIT_HASH
export GIT_BRANCH

echo "📝 Updating build info..."
./scripts/update-build-info.sh

# Notify Discord that build started
./scripts/notify-discord.sh "started" "$BUILD_NUMBER" "$GIT_HASH" "$GIT_BRANCH"

echo "🐳 Building Docker images with Docker Compose..."
docker-compose build

echo "✅ Build complete!"
echo ""

# Notify Discord that build succeeded
./scripts/notify-discord.sh "success" "$BUILD_NUMBER" "$GIT_HASH" "$GIT_BRANCH"

echo "🔄 Restarting services with Docker Compose..."
docker-compose up -d --force-recreate

echo "⏳ Waiting for services to be healthy..."
# Wait for PostgreSQL to be healthy
timeout 60 sh -c 'until docker-compose ps | grep postgres | grep -q "healthy"; do sleep 2; done' || echo "⚠️  PostgreSQL health check timed out, but deployment continues"

# Wait for server to be healthy
timeout 60 sh -c 'until docker-compose ps | grep server | grep -q "healthy"; do sleep 2; done' || echo "⚠️  Server health check timed out, but deployment continues"

echo "✅ Deployment complete!"
echo ""
echo "🌐 Website available at: http://localhost:8081"
echo "📊 API at: http://localhost:8081/api/*"
echo "🗄️  PostgreSQL at: localhost:5432"
echo ""
echo "📋 Service Status:"
docker-compose ps
