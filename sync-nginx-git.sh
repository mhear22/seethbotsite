#!/bin/bash
# Sync nginx HTML files to git repo and restart nginx container
# Supports Docker Compose (port 8081 configuration)

REPO_DIR="/home/seethbotsite"
PAT_FILE="/home/pat.txt"
CONTAINER_NAME="test-nginx"

cd "$REPO_DIR" || exit 1

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

  # Restart nginx container using Docker Compose
  echo "🔄 Restarting nginx container using Docker Compose..."
  docker-compose down 2>/dev/null
  docker-compose up -d

  echo "✅ Done! Changes synced and nginx restarted."
  echo "🌐 Website available at: http://localhost:8081"
fi
