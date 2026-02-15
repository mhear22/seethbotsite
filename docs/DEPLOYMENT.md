# Deployment Guide

## Deploy

```bash
# Recommended: push to GitHub + build + restart Docker
./push-and-deploy.sh

# Or just build + restart (no git push)
./deploy.sh
```

The `deploy.sh` script builds a new Docker image, stops the old container, and starts a new one on port 8081.

**Changes won't appear on the live site until you run `./deploy.sh`.**

## Environment Variables

Set these in the Docker container (edit `deploy.sh` or use Docker `-e` flags):

| Variable | Required | Description |
|----------|----------|-------------|
| `SEETHBOT_JWT_SECRET` | Yes (prod) | JWT signing secret |
| `SEETHBOT_API_KEYS` | Yes (prod) | Comma-separated admin API keys |
| `SEETHBOT_JWT_EXPIRY` | No | Token expiry (default: `30d`) |
| `DISCORD_WEBHOOK_URL` | No | Discord build notifications |

## Troubleshooting

```bash
# Check container is running
docker ps | grep seethbot

# View logs
docker logs seethbot-server

# OOM during build? Run the swap setup script on the server
./scripts/setup-swap.sh
```

**Build errors:** Check syntax in `.vue` files and `backend/src/index.ts`. Run `docker logs seethbot-server`.
