#!/bin/bash
# Sync nginx HTML files to git repo and restart nginx container

REPO_DIR="/home/seethbotsite"
PAT_FILE="/home/pat.txt"
START_SCRIPT="/home/seethbotsite/start-nginx.sh"

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
    echo ""
    echo "🔄 Restarting nginx container..."
    bash "$START_SCRIPT"

    echo "✅ Done! Changes synced, nginx restarted, website live."
    echo "🌐 Website available at: http://localhost:8081"
  else
    echo "❌ Failed to push to git."
  fi
fi
