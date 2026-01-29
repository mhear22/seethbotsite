#!/bin/bash
# Sync nginx HTML files to git repo and restart nginx container
# Supports both direct Docker and Docker Compose deployment

REPO_DIR="/home/seethbotsite"
PAT_FILE="/home/pat.txt"
CONTAINER_NAME="test-nginx"
USE_DOCKER_COMPOSE="true"  # Use Docker Compose by default

cd "$REPO_DIR" || exit 1

# Function to restart using direct Docker
restart_direct_docker() {
  echo "🔄 Restarting nginx container using direct Docker..."
  docker restart "$CONTAINER_NAME" 2>/dev/null || \
    docker run -d --name "$CONTAINER_NAME" --restart unless-stopped \
      -p 80:8081 \
      -v "$REPO_DIR:/app" \
      nginx:latest \
      nginx -g daemon off
}

# Function to restart using Docker Compose
restart_docker_compose() {
  echo "🔄 Restarting nginx container using Docker Compose..."
  docker-compose down 2>/dev/null
  docker-compose up -d
}

# Check if user wants Docker Compose and file exists
if [ "$USE_DOCKER_COMPOSE" = "true" ]; then
  if [ ! -f "docker-compose.yml" ]; then
    echo "⚠️  Docker Compose requested but docker-compose.yml not found!"
    echo "   Falling back to direct Docker..."
    restart_direct_docker
  else
    restart_docker_compose
  fi
else
  restart_direct_docker
fi

# Check for changes
if git diff --quiet && git diff --cached --quiet; then
  echo "✅ No changes to commit."
else
  # Add all changes
  git add .

  # Commit with timestamp
  git commit -m "Auto-commit: $(date '+%Y-%m-%d %H:%M:%S')"

  # Push using PAT
  echo "📤 Pushing to GitHub..."
  git push https://$(cat "$PAT_FILE")@github.com/mhear22/seethbotsite.git

  if [ $? -eq 0 ]; then
    echo "✅ Successfully synced changes to git."
  else
    echo "❌ Failed to push to git."
  fi
fi

echo "✅ Done! Changes synced and nginx restarted."
echo "🌐 Website available at: http://localhost:8081"
