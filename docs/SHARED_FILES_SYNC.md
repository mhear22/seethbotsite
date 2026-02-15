# Shared Files Sync

`backend/src/shared/` and `frontend/shared/` contain duplicate files that must be kept in sync.

## Monitored Files (9 pairs)

**Types:** `MapDefinition.ts`, `NetworkMessages.ts`

**Constants:** `GameConstants.ts`

**Maps:** `defaultArena.ts`, `ruinedHighway.ts`, `reactorCore.ts`, `megaFactory.ts`, `spaceColony.ts`, `index.ts`

## How It Works

`scripts/validate-shared-files.js` runs automatically as a `prebuild` hook in both `backend/package.json` and `frontend/package.json`. Builds fail if files are out of sync.

```bash
# Manual validation
node scripts/validate-shared-files.js

# It will suggest the copy command if files are out of sync:
cp backend/src/shared/path/file.ts frontend/shared/path/file.ts
```

## Adding New Shared Files

Add the pair to `SHARED_FILE_PAIRS` in `scripts/validate-shared-files.js`:

```javascript
{
  backend: 'backend/src/shared/path/NewFile.ts',
  frontend: 'frontend/shared/path/NewFile.ts',
}
```
