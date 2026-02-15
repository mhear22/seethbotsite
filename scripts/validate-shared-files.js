#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Script to validate that shared files between backend and frontend are in sync.
 * This script compares duplicate files and throws an error if they differ.
 *
 * Run this as part of the build process to catch out-of-sync files early.
 */

// Configuration: Define the pairs of files that should be kept in sync
const SHARED_FILE_PAIRS = [
  // Types
  {
    backend: 'backend/src/shared/types/MapDefinition.ts',
    frontend: 'frontend/shared/types/MapDefinition.ts',
  },
  {
    backend: 'backend/src/shared/types/NetworkMessages.ts',
    frontend: 'frontend/shared/types/NetworkMessages.ts',
  },
  // Constants
  {
    backend: 'backend/src/shared/constants/GameConstants.ts',
    frontend: 'frontend/shared/constants/GameConstants.ts',
  },
  // Maps
  {
    backend: 'backend/src/shared/maps/defaultArena.ts',
    frontend: 'frontend/shared/maps/defaultArena.ts',
  },
  {
    backend: 'backend/src/shared/maps/ruinedHighway.ts',
    frontend: 'frontend/shared/maps/ruinedHighway.ts',
  },
  {
    backend: 'backend/src/shared/maps/reactorCore.ts',
    frontend: 'frontend/shared/maps/reactorCore.ts',
  },
  {
    backend: 'backend/src/shared/maps/megaFactory.ts',
    frontend: 'frontend/shared/maps/megaFactory.ts',
  },
  {
    backend: 'backend/src/shared/maps/spaceColony.ts',
    frontend: 'frontend/shared/maps/spaceColony.ts',
  },
  {
    backend: 'backend/src/shared/maps/index.ts',
    frontend: 'frontend/shared/maps/index.ts',
  },
];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function getFileHash(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return crypto.createHash('md5').update(content).digest('hex');
  } catch (error) {
    return null;
  }
}

function getFileModTime(filePath) {
  try {
    return fs.statSync(filePath).mtime;
  } catch (error) {
    return null;
  }
}

function formatTime(date) {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function main() {
  console.log(`\n${colors.cyan}=== Shared File Sync Validation ===${colors.reset}\n`);

  // Find the monorepo root (where the script is located, then go up to find the root)
  let rootDir = path.resolve(__dirname, '..');

  let hasErrors = false;
  let syncedCount = 0;
  let errorCount = 0;
  let missingCount = 0;

  for (const pair of SHARED_FILE_PAIRS) {
    const backendPath = path.resolve(rootDir, pair.backend);
    const frontendPath = path.resolve(rootDir, pair.frontend);

    const backendHash = getFileHash(backendPath);
    const frontendHash = getFileHash(frontendPath);

    if (backendHash === null && frontendHash === null) {
      console.log(`${colors.yellow}⚠ NEITHER EXISTS${colors.reset}`);
      console.log(`  Backend:  ${pair.backend}`);
      console.log(`  Frontend: ${pair.frontend}`);
      console.log('');
      missingCount++;
      continue;
    }

    if (backendHash === null) {
      console.log(`${colors.yellow}⚠ BACKEND MISSING${colors.reset}`);
      console.log(`  ${pair.backend}`);
      console.log(`  Frontend exists: ${pair.frontend}`);
      console.log('');
      missingCount++;
      continue;
    }

    if (frontendHash === null) {
      console.log(`${colors.yellow}⚠ FRONTEND MISSING${colors.reset}`);
      console.log(`  Backend exists: ${pair.backend}`);
      console.log(`  ${pair.frontend}`);
      console.log('');
      missingCount++;
      continue;
    }

    if (backendHash === frontendHash) {
      console.log(`${colors.green}✓ IN SYNC${colors.reset} ${pair.backend}`);
      syncedCount++;
    } else {
      const backendTime = getFileModTime(backendPath);
      const frontendTime = getFileModTime(frontendPath);

      console.log(`${colors.red}✗ OUT OF SYNC${colors.reset}`);
      console.log(`  File: ${path.basename(pair.backend)}`);
      console.log(`  ${colors.blue}Backend${colors.reset}  (${formatTime(backendTime)}): ${pair.backend}`);
      console.log(`  ${colors.blue}Frontend${colors.reset} (${formatTime(frontendTime)}): ${pair.frontend}`);

      if (backendTime > frontendTime) {
        console.log(`  ${colors.yellow}→ Backend is newer. Run: cp ${pair.backend} ${pair.frontend}${colors.reset}`);
      } else {
        console.log(`  ${colors.yellow}→ Frontend is newer. Run: cp ${pair.frontend} ${pair.backend}${colors.reset}`);
      }
      console.log('');

      hasErrors = true;
      errorCount++;
    }
  }

  // Summary
  console.log(`${colors.cyan}=== Summary ===${colors.reset}`);
  console.log(`  ${colors.green}Synced: ${syncedCount}${colors.reset}`);
  console.log(`  ${colors.red}Out of sync: ${errorCount}${colors.reset}`);
  console.log(`  ${colors.yellow}Missing: ${missingCount}${colors.reset}`);
  console.log('');

  if (hasErrors) {
    console.error(`${colors.red}ERROR: Shared files are out of sync!${colors.reset}`);
    console.error(`${colors.yellow}Please synchronize the files before building.${colors.reset}\n`);
    process.exit(1);
  } else {
    console.log(`${colors.green}✓ All shared files are in sync.${colors.reset}\n`);
    process.exit(0);
  }
}

main();
