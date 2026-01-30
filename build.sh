#!/bin/bash
# Quick build script (does not deploy)

set -e

cd /home/seethbotsite || exit 1

echo "🔨 Building Vite application..."
npm run build

echo "✅ Build complete! Output in /home/seethbotsite/dist"
echo ""
echo "To deploy, run: ./deploy.sh"
