#!/bin/bash
# Sync nginx HTML files to git repo and restart nginx container

REPO_DIR="/home/seethbotsite"
PAT_FILE="/home/pat.txt"
CONTAINER_NAME="test-nginx"

cd "$REPO_DIR" || exit 1

# Check if there are changes
if git diff --quiet && git diff --cached --quiet; then
    echo "No changes to commit."
    exit 0
fi

# Add all changes
git add .

# Commit with timestamp
git commit -m "Auto-commit: $(date '+%Y-%m-%d %H:%M:%S')"

# Push using PAT
git push https://$(cat "$PAT_FILE")@github.com/mhear22/seethbotsite.git

# Restart nginx container to load latest files
echo "Restarting nginx container..."
docker restart "$CONTAINER_NAME"

echo "Synced changes to git and restarted nginx."
