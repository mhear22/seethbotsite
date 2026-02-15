# Shared Files Sync System

This document explains the automated system for keeping shared files between backend and frontend in sync.

## Overview

The codebase has duplicate files between `backend/src/shared/` and `frontend/shared/` that must be kept synchronized. To prevent issues with out-of-sync files, we've implemented an automated validation system.

## How It Works

### Validation Script

Location: `scripts/validate-shared-files.js`

This script:
1. Compares the MD5 hashes of each shared file pair
2. Reports which files are in sync, out of sync, or missing
3. Shows modification times and suggests which direction to copy
4. Exits with code 1 if any files are out of sync

### Build Integration

The validation script runs automatically as a `prebuild` hook in both:

- **Backend**: `backend/package.json` - runs before TypeScript compilation
- **Frontend**: `frontend/package.json` - runs before Vite build

This ensures that builds will fail early if shared files are out of sync.

## Files Being Monitored

The following 9 file pairs are checked for synchronization:

**Types:**
- `MapDefinition.ts`
- `NetworkMessages.ts`

**Constants:**
- `GameConstants.ts`

**Maps:**
- `defaultArena.ts`
- `ruinedHighway.ts`
- `reactorCore.ts`
- `megaFactory.ts`
- `spaceColony.ts`
- `index.ts`

## Usage

### Manual Validation

Run from the repository root:

```bash
node scripts/validate-shared-files.js
```

### Automatic Validation

The script runs automatically during:

```bash
# Backend build
cd backend
npm run build  # prebuild hook validates sync

# Frontend build
cd frontend
npm run build  # prebuild hook validates sync
```

### Fixing Out-of-Sync Files

When the script detects out-of-sync files, it will suggest the copy command:

```bash
# If backend is newer:
cp backend/src/shared/path/to/file.ts frontend/shared/path/to/file.ts

# If frontend is newer:
cp frontend/shared/path/to/file.ts backend/src/shared/path/to/file.ts
```

## Adding New Shared Files

To add a new file pair to the validation:

1. Add the file pair to the `SHARED_FILE_PAIRS` array in `scripts/validate-shared-files.js`:

```javascript
{
  backend: 'backend/src/shared/path/to/NewFile.ts',
  frontend: 'frontend/shared/path/to/NewFile.ts',
}
```

2. Test the script: `node scripts/validate-shared-files.js`

## Current Status

All 9 shared file pairs are currently in sync and validated on every build.
