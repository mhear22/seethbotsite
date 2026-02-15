# Production Memory Fix

## Problem

Docker builds were failing with exit code 137 (OOM) during `npm install` on the production server.

## Fixes Applied

1. **Root `package.json`** - Removed unnecessary dependencies (`better-sqlite3`, `dotenv`); root should only define workspace structure
2. **`Dockerfile`** - Added `--maxsockets 1 --prefer-offline --no-audit` to npm install commands to reduce memory usage
3. **`.npmrc`** - `maxsockets=1`, `prefer-offline=true`, `audit=false`
4. **`backend/package.json`** - Moved `dotenv` to `dependencies` (required by `prisma.config.ts` at runtime)
5. **`scripts/setup-swap.sh`** - Creates 2GB swap file on the production server (one-time setup)

## If OOM Persists

SSH into the production server and run:

```bash
./scripts/setup-swap.sh
```

Then deploy normally:

```bash
git pull && ./deploy.sh
```
