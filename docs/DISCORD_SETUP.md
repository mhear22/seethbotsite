# Discord Build Notifications

Build notifications are sent automatically by `deploy.sh` when `DISCORD_WEBHOOK_URL` is set.

## Setup

1. In Discord: Server Settings → Integrations → Webhooks → New Webhook → copy URL
2. Set the env var:
   ```bash
   export DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/..."
   ```
3. Deploy as usual - notifications are sent automatically.

## Notification Stages

- **Build Started** (blue)
- **Build Completed** (green)
- **Build Failed** (red)

Each message includes build number, branch, git hash, and timestamp.

## Test Without Deploying

```bash
./scripts/notify-discord.sh "started" "test-123" "abc1234" "main"
./scripts/notify-discord.sh "success" "test-123" "abc1234" "main"
./scripts/notify-discord.sh "failed" "test-123" "abc1234" "main"
```

## Troubleshooting

```bash
# Check if env var is set
echo $DISCORD_WEBHOOK_URL

# Test webhook manually
curl -X POST -H "Content-Type: application/json" \
  -d '{"content": "Test"}' "$DISCORD_WEBHOOK_URL"

# Fix permissions
chmod +x scripts/notify-discord.sh
```

Deploy script will print either success or failure for each notification attempt.

## Security

Keep the webhook URL private - anyone with it can post to your channel. Use env vars, never hardcode.
