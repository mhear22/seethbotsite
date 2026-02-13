# Production Deployment Memory Fix

## Problem
The deploy script was failing with exit code 137 (Out of Memory) during `npm install` in Docker builds on the production server.

## Solutions Implemented

### 1. Fixed Root Package Structure
- **File**: `package.json`
- **Change**: Removed unnecessary dependencies (`better-sqlite3`, `dotenv`) from root
- **Reason**: Root package.json should only define workspace structure, not have dependencies

### 2. Optimized npm Install Flags
- **File**: `Dockerfile`
- **Changes**:
  - Added `--maxsockets 1` to limit concurrent connections (reduces memory)
  - Added `--prefer-offline` to use cached packages when available
  - Added `--no-audit` to skip security audits during build (reduces memory)

### 3. Created .npmrc Configuration
- **File**: `.npmrc`
- **Purpose**: Configure npm to use less memory during installation
- **Settings**:
  - `maxsockets=1`: Limit concurrent downloads
  - `prefer-offline=true`: Use cache when possible
  - `audit=false`: Skip audits during build

### 4. Fixed Backend Dependencies
- **File**: `backend/package.json`
- **Change**: Moved `dotenv` to dependencies (from devDependencies)
- **Reason**: Required by `prisma.config.ts` during production build

### 5. Created Swap Setup Script (Optional)
- **File**: `scripts/setup-swap.sh`
- **Purpose**: Create 2GB swap file on production server to prevent OOM
- **Usage**:
  ```bash
  ./scripts/setup-swap.sh
  ```

## Production Server Setup (One-time)

If you still experience OOM issues, run the swap setup script on your production server:

```bash
# SSH into your production server
cd /home/seethbotsite
./scripts/setup-swap.sh
```

This will create a 2GB swap file that helps prevent OOM during Docker builds.

## Deployment

Now deploy normally:

```bash
git pull
./deploy.sh
```

## What Changed

### Modified Files
1. `package.json` - Fixed workspace structure
2. `backend/package.json` - Moved dotenv to dependencies
3. `Dockerfile` - Added memory optimization flags
4. `.dockerignore` - Ensured package-lock.json files are included
5. `.npmrc` - New file for npm configuration

### New Files
1. `scripts/setup-swap.sh` - Swap setup script for production server
2. `PRODUCTION_MEMORY_FIX.md` - This documentation

## Technical Details

The OOM issue was caused by:
1. npm install trying to install unnecessary root dependencies
2. High memory usage from concurrent package downloads
3. Production server having limited RAM

The fix:
1. Removed root-level dependencies (reduces work)
2. Limited npm concurrency with `--maxsockets 1` (reduces memory spikes)
3. Added swap file option for extra headroom
4. Ensured dotenv is available for Prisma config

## Verification

The deployment now completes successfully with:
- Backend dependencies: ~670 packages
- Frontend dependencies: ~282 packages
- Production dependencies: ~281 packages

All services start healthy and the application is accessible.
