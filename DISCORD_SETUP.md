# Discord Build Notifications

## Overview

The seethbotsite now supports automatic Discord webhook notifications for build deployments. Whenever a new build is deployed, a message will be posted to a Discord channel of your choice.

## Setup Instructions

### 1. Create a Discord Webhook

1. Open your Discord server
2. Go to **Server Settings** → **Integrations** → **Webhooks**
3. Click **New Webhook**
4. Choose the channel where you want build notifications
5. Name the webhook (e.g., "Mold Build Bot")
6. Copy the **Webhook URL** (starts with `https://discord.com/api/webhooks/...`)

### 2. Set the Environment Variable

Set the `DISCORD_WEBHOOK_URL` environment variable before running the deploy script:

```bash
# Temporary (for current session only)
export DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/..."

# Permanent (add to ~/.bashrc or ~/.zshrc)
echo 'export DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/..."' >> ~/.bashrc
source ~/.bashrc
```

### 3. Deploy as Usual

Run the deploy script as normal. Discord notifications will be sent automatically:

```bash
./deploy.sh
```

## Notification Stages

The Discord webhook is notified at three stages:

1. **Build Started** (Blue) - When the build process begins
2. **Build Completed** (Green) - When the Docker image builds successfully
3. **Build Failed** (Red) - If any step fails (automatic on script error)

## Message Format

Each Discord message includes:

- **Build Status** (with emoji: ✅, ❌, 🚀)
- **Build Number** (e.g., #42)
- **Git Branch** (e.g., main)
- **Git Hash** (short commit hash)
- **Build Time** (UTC timestamp)
- **Cat Avatar** - Random cat image from cataas.com API

## Example Notification

```
✅ Build Completed Successfully

A new build has been deployed to seethbotsite

Build #: 42
Branch: main
Git Hash: a1b2c3d
Time: 2026-02-05 06:30:00 UTC
```

## Optional: Test the Webhook

You can test the Discord webhook without deploying:

```bash
# Test notification
./scripts/notify-discord.sh "started" "test-123" "abc1234" "main"

# Test success notification
./scripts/notify-discord.sh "success" "test-123" "abc1234" "main"

# Test failure notification
./scripts/notify-discord.sh "failed" "test-123" "abc1234" "main"
```

## Troubleshooting

### Notification Not Sending

If notifications aren't sending:

1. Check that `DISCORD_WEBHOOK_URL` is set:
   ```bash
   echo $DISCORD_WEBHOOK_URL
   ```

2. Verify the webhook URL is valid by testing it manually:
   ```bash
   curl -X POST \
     -H "Content-Type: application/json" \
     -d '{"content": "Test message"}' \
     "https://discord.com/api/webhooks/..."
   ```

3. Check the deploy script output - you should see:
   - `✅ Discord notification sent successfully` (on success)
   - `❌ Failed to send Discord notification` (on failure)
   - `⚠️  DISCORD_WEBHOOK_URL not set. Skipping Discord notification.` (if webhook not configured)

### Permission Errors

If you get permission denied when running scripts:

```bash
chmod +x scripts/notify-discord.sh
```

### Python3 Not Found

The notification script uses Python3 to parse build info. If you don't have it:

```bash
# Ubuntu/Debian
sudo apt install python3

# macOS (with Homebrew)
brew install python3
```

## Security Notes

- **Keep the webhook URL private** - Anyone with the URL can post to your Discord channel
- **Don't commit the webhook URL** to git - it's a secret
- **Rotate the webhook periodically** - If it's accidentally leaked, regenerate it in Discord
- **Use environment variables** - Don't hardcode the URL in scripts

## Advanced Usage

### Custom Webhook Names

You can customize the bot name and avatar by editing `scripts/notify-discord.sh`:

```bash
"username": "Mold Build Bot",  # Change this
"avatar_url": "https://..."     # Change this
```

### Multiple Webhooks

To notify multiple channels, modify `deploy.sh` to send multiple notifications:

```bash
# Notify first channel
DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/..." ./scripts/notify-discord.sh ...

# Notify second channel
DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/..." ./scripts/notify-discord.sh ...
```

### Build Script Integration

The webhook script can be integrated into CI/CD pipelines:

```yaml
# Example: GitHub Actions
- name: Notify Discord
  run: ./scripts/notify-discord.sh "success" "${{ github.run_number }}" "${GITHUB_SHA::7 }}" "${GITHUB_REF_NAME}"
  env:
    DISCORD_WEBHOOK_URL: ${{ secrets.DISCORD_WEBHOOK_URL }}
```

## Related Files

- `scripts/notify-discord.sh` - Discord webhook notification script
- `deploy.sh` - Main deployment script (now with Discord integration)
- `scripts/update-build-info.sh` - Build info generator
- `backend/build-info.json` - Current build information
