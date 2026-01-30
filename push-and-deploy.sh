#!/bin/bash
# Git push AND deploy in one command

set -e

echo "📤 Pushing to GitHub..."
GIT_TERMINAL_PROMPT=0 git -c credential.helper='!f() { echo "username=mhear22"; echo "password=$(cat /home/pat.txt)"; }; f' push origin main

echo ""
echo "🐳 Deploying to Docker..."
bash deploy.sh

echo ""
echo "✅ Push and deploy complete!"
