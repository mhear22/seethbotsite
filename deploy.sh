#!/bin/bash
# Build and deploy the Vite application

set -e

REPO_DIR="/home/seethbotsite"
CONTAINER_NAME="seethbot-server"

cd "$REPO_DIR" || exit 1

echo "🔨 Building Vite frontend..."
npm run build

echo "✅ Frontend build complete!"
echo ""
echo "🔄 Restarting server container..."
docker stop "$CONTAINER_NAME" 2>/dev/null || true
docker rm "$CONTAINER_NAME" 2>/dev/null || true

echo "🚀 Starting container with updated build..."
docker run -d \
  --name "$CONTAINER_NAME" \
  -p 8081:3000 \
  -v "$REPO_DIR:/app/seethbotsite:ro" \
  -v seethbot-data:/app/server/data \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e SERVE_ROOT=/app/seethbotsite/dist \
  seethbotsite-server:latest

echo "✅ Deployment complete!"
echo "🌐 Website available at: http://localhost:8081"
echo "📊 API at: http://localhost:8081/api/*"
