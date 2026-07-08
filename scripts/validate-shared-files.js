#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Script to validate that shared files between backend and frontend are in sync.
 * This script compares duplicate files and throws an error if they differ.
 *
 * Run this as part of the build process to catch out-of-sync files early.
 *
 * There are THREE copies of the shared network/map contract in this repo:
 *   1. apps/mech/backend/src/shared   — server-authoritative source of truth
 *   2. frontend/shared                — the (main-site) root frontend copy
 *   3. apps/mech/frontend/src/shared  — the LIVE mech SPA copy (deployed to /mech/)
 * Every pair below carries an optional `appsMech` path so the live SPA copy is
 * validated against the backend contract too. Previously only backend↔root-frontend
 * was guarded, so the deployed SPA could silently drift from the server protocol
 * (see docs/MECH_ARCHITECTURE_MAP.md §5).
 *
 * INTENTIONAL, DOCUMENTED EXCEPTION — maps/endOfUniverse.ts:
 *   Both frontend copies add client-only cosmetic material fields
 *   (`emissive` / `emissiveIntensity`) that the backend copy omits, because the
 *   server simulation never renders and ignores them. This is additive-only,
 *   client-side visual divergence, identical between the two frontends. It is
 *   deliberately NOT validated for byte-equality here — forcing the backend to
 *   carry unused render fields would be churn with no protocol benefit. If the
 *   *structure* of endOfUniverse (geometry/collision) ever needs to match the
 *   server, promote it to SHARED_FILE_PAIRS and reconcile the non-cosmetic fields.
 */

// Configuration: Define the pairs of files that should be kept in sync.
// `appsMech` (optional) is the live mech SPA copy, validated against `backend`.
const SHARED_FILE_PAIRS = [
  // Types
  {
    backend: 'apps/mech/backend/src/shared/types/MapDefinition.ts',
    frontend: 'frontend/shared/types/MapDefinition.ts',
    appsMech: 'apps/mech/frontend/src/shared/types/MapDefinition.ts',
  },
  {
    backend: 'apps/mech/backend/src/shared/types/NetworkMessages.ts',
    frontend: 'frontend/shared/types/NetworkMessages.ts',
    appsMech: 'apps/mech/frontend/src/shared/types/NetworkMessages.ts',
  },
  // Constants
  {
    backend: 'apps/mech/backend/src/shared/constants/GameConstants.ts',
    frontend: 'frontend/shared/constants/GameConstants.ts',
    appsMech: 'apps/mech/frontend/src/shared/constants/GameConstants.ts',
  },
  // Maps
  {
    backend: 'apps/mech/backend/src/shared/maps/defaultArena.ts',
    frontend: 'frontend/shared/maps/defaultArena.ts',
    appsMech: 'apps/mech/frontend/src/shared/maps/defaultArena.ts',
  },
  {
    backend: 'apps/mech/backend/src/shared/maps/ruinedHighway.ts',
    frontend: 'frontend/shared/maps/ruinedHighway.ts',
    appsMech: 'apps/mech/frontend/src/shared/maps/ruinedHighway.ts',
  },
  {
    backend: 'apps/mech/backend/src/shared/maps/reactorCore.ts',
    frontend: 'frontend/shared/maps/reactorCore.ts',
    appsMech: 'apps/mech/frontend/src/shared/maps/reactorCore.ts',
  },
  {
    backend: 'apps/mech/backend/src/shared/maps/megaFactory.ts',
    frontend: 'frontend/shared/maps/megaFactory.ts',
    appsMech: 'apps/mech/frontend/src/shared/maps/megaFactory.ts',
  },
  {
    backend: 'apps/mech/backend/src/shared/maps/spaceColony.ts',
    frontend: 'frontend/shared/maps/spaceColony.ts',
    appsMech: 'apps/mech/frontend/src/shared/maps/spaceColony.ts',
  },
  {
    backend: 'apps/mech/backend/src/shared/maps/index.ts',
    frontend: 'frontend/shared/maps/index.ts',
    appsMech: 'apps/mech/frontend/src/shared/maps/index.ts',
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

  // Compare one copy against the backend reference. Returns 'synced' | 'error' | 'missing'.
  function compareCopy(label, backendRel, backendHash, backendPath, copyRel) {
    const copyPath = path.resolve(rootDir, copyRel);
    const copyHash = getFileHash(copyPath);

    if (copyHash === null) {
      console.log(`${colors.yellow}⚠ ${label.toUpperCase()} MISSING${colors.reset}`);
      console.log(`  Backend exists: ${backendRel}`);
      console.log(`  ${copyRel}`);
      console.log('');
      return 'missing';
    }

    if (backendHash === copyHash) {
      console.log(`${colors.green}✓ IN SYNC${colors.reset} (backend ↔ ${label}) ${copyRel}`);
      return 'synced';
    }

    const backendTime = getFileModTime(backendPath);
    const copyTime = getFileModTime(copyPath);
    console.log(`${colors.red}✗ OUT OF SYNC${colors.reset} (backend ↔ ${label})`);
    console.log(`  File: ${path.basename(backendRel)}`);
    console.log(`  ${colors.blue}Backend${colors.reset} (${formatTime(backendTime)}): ${backendRel}`);
    console.log(`  ${colors.blue}${label}${colors.reset} (${formatTime(copyTime)}): ${copyRel}`);
    if (backendTime > copyTime) {
      console.log(`  ${colors.yellow}→ Backend is newer. Run: cp ${backendRel} ${copyRel}${colors.reset}`);
    } else {
      console.log(`  ${colors.yellow}→ ${label} is newer. Run: cp ${copyRel} ${backendRel}${colors.reset}`);
    }
    console.log('');
    return 'error';
  }

  for (const pair of SHARED_FILE_PAIRS) {
    const backendPath = path.resolve(rootDir, pair.backend);
    const backendHash = getFileHash(backendPath);

    // The backend copy is the source of truth; if it is missing we cannot compare.
    if (backendHash === null) {
      console.log(`${colors.yellow}⚠ BACKEND MISSING${colors.reset}`);
      console.log(`  ${pair.backend}`);
      console.log('');
      // A missing source-of-truth means the pair cannot be validated at all —
      // that is a sync failure, not a green pass.
      hasErrors = true;
      missingCount++;
      continue;
    }

    // Build the list of copies to validate against the backend reference.
    const copies = [{ label: 'frontend', rel: pair.frontend }];
    if (pair.appsMech) {
      copies.push({ label: 'apps/mech', rel: pair.appsMech });
    }

    for (const copy of copies) {
      const result = compareCopy(copy.label, pair.backend, backendHash, backendPath, copy.rel);
      if (result === 'synced') syncedCount++;
      else if (result === 'missing') {
        // A protocol copy that is absent has drifted from the backend contract as
        // surely as one that differs — fail the gate so the sync guard is real.
        hasErrors = true;
        missingCount++;
      } else {
        hasErrors = true;
        errorCount++;
      }
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
