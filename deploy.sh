#!/bin/bash
# Build and deploy the full-stack application

set -e

CONTAINER_NAME="seethbot-server"
IMAGE_NAME="seethbotsite-server:latest"
DOCKER="${DOCKER:-docker}"

echo "🐳 Building Docker image (frontend + backend)..."
$DOCKER build -t "$IMAGE_NAME" .

echo "✅ Build complete!"
echo ""
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
