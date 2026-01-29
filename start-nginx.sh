#!/bin/bash
# Start nginx container with Docker Compose-style configuration
# (For when docker-compose plugin is not available)

REPO_DIR="/home/seethbotsite"
CONTAINER_NAME="test-nginx"

cd "$REPO_DIR" || exit 1

# Stop existing container
echo "🛑 Stopping existing container..."
docker stop "$CONTAINER_NAME" 2>/dev/null
docker rm "$CONTAINER_NAME" 2>/dev/null

echo "🚀 Starting container with port 8081 configuration..."
docker run -d \
  --name "$CONTAINER_NAME" \
  -p 8081:8081 \
  -v "$REPO_DIR:/app" \
  -v "$REPO_DIR/docker-compose.yml:/docker-compose.yml" \
  nginx:latest \
  nginx -g daemon off

echo "✅ Container started!"
echo "🌐 Website available at: http://localhost:8081"
echo ""
echo "📋 To restart:"
echo "  docker stop $CONTAINER_NAME"
echo "  docker rm $CONTAINER_NAME"
echo "  bash $0"
echo ""
echo "📝 To stop:"
echo "  docker stop $CONTAINER_NAME && docker rm $CONTAINER_NAME"
