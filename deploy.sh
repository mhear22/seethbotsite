#!/bin/bash
# Build and deploy the Vite application

set -e

REPO_DIR="/home/seethbotsite"
CONTAINER_NAME="test-nginx"
NETWORK_NAME="seethbotsite_default"

cd "$REPO_DIR" || exit 1

echo "🔨 Building Vite application..."
npm run build

echo "✅ Build complete!"
echo ""
echo "🔄 Restarting nginx container..."
docker stop "$CONTAINER_NAME" 2>/dev/null || true
docker rm "$CONTAINER_NAME" 2>/dev/null || true

echo "🚀 Starting container with updated build..."
docker run -d \
  --name "$CONTAINER_NAME" \
  --network "$NETWORK_NAME" \
  -p 80:8081 \
  -v "$REPO_DIR:/home/seethbotsite:ro" \
  -v "$REPO_DIR/nginx.conf:/etc/nginx/conf.d/default.conf:ro" \
  nginx:latest

echo "✅ Deployment complete!"
echo "🌐 Website available at: http://localhost"
