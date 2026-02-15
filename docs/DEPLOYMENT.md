# Deployment Guide

## Quick Deploy (Git Push + Docker Deploy)

After making changes, run this single command to push to GitHub AND deploy:

```bash
./push-and-deploy.sh
```

This will:
1. Push changes to GitHub
2. Build the Docker image
3. Restart the container with new changes

## Manual Deploy Steps

If you prefer to do things manually:

### 1. Push to GitHub
```bash
git add .
git commit -m "your message"
GIT_TERMINAL_PROMPT=0 git -c credential.helper='!f() { echo "username=mhear22"; echo "password=$(cat /home/pat.txt)"; }; f' push origin main
```

### 2. Deploy to Docker
```bash
./deploy.sh
```

## Important: Always Deploy After Git Push! 🚨

**Changes won't appear on the live site until you run `./deploy.sh`!**

The site runs in a Docker container, so pushing to GitHub is NOT enough. You MUST run the deploy script to:
- Rebuild the Vue.js frontend
- Rebuild the Express backend
- Restart the Docker container with the new code

## What Deploy Does

The `deploy.sh` script:
1. Builds a new Docker image with your changes
2. Stops the old container
3. Starts a new container with the updated code
4. Runs on port 8081: http://localhost:8081

## Environment Variables (Optional)

If you need to customize the authentication system, you can set environment variables in the Docker container:

- `SEETHBOT_JWT_SECRET`: Secret key for JWT tokens (CHANGE THIS IN PRODUCTION!)
- `SEETHBOT_JWT_EXPIRY`: Token expiry time (default: 30d)
- `SEETHBOT_API_KEYS`: Comma-separated API keys for admin access

To set environment variables, edit the `deploy.sh` script or use Docker's `-e` flag.

## Troubleshooting

**Site not updating?**
- Make sure you ran `./deploy.sh` after git push
- Check container is running: `docker ps | grep seethbot`
- View logs: `docker logs seethbot-server`

**Build errors?**
- Check syntax in .vue files
- Make sure backend/src/index.ts compiles
- Run `docker logs seethbot-server` for errors
