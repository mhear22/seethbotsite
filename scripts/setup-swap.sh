#!/bin/bash
# Script to setup swap space on production server to prevent OOM during builds
# Run with sudo if needed

set -e

echo "Checking current swap..."
swapon --show

# Check if swap already exists
if swapon --show | grep -q "/swapfile"; then
    echo "✅ Swap file already exists"
    free -h
    exit 0
fi

echo ""
echo "Creating 2GB swap file to prevent OOM during Docker builds..."
echo ""

# Create swap file
sudo fallocate -l 2G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=2048 status=progress

# Set permissions
sudo chmod 600 /swapfile

# Make swap
sudo mkswap /swapfile

# Enable swap
sudo swapon /swapfile

# Add to fstab for persistence
if ! grep -q "/swapfile" /etc/fstab; then
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi

echo ""
echo "✅ Swap file created and enabled"
echo ""
free -h
