# Archived Root-Level Scripts

This folder contains archived utility scripts that were previously in the project root.

## Background

Previously, 145+ one-off utility scripts (check-*.js, complete-*.js, list-*.js, etc.) cluttered the project root. These were created by sub-agents for quick ticket operations.

## Current State

All root-level utility scripts have been consolidated into the unified CLI tool (`cli.js`). This directory exists as a reference for any archived scripts that might be needed for debugging or historical purposes.

## Migration

**Before:** Using individual scripts
```bash
node check-ticket-128.js
node complete-ticket-128.js "Done"
```

**After:** Using the unified CLI
```bash
node cli.js ticket show --id 128
node cli.js ticket complete --id 128 --response "Done"
```

## CLI Tool

The unified CLI tool (`cli.js` in project root) provides all functionality that was previously spread across 145+ scripts.

### Available Commands

```bash
# List tickets
node cli.js ticket list
node cli.js ticket list --status pending --limit 10

# Show ticket details
node cli.js ticket show --id 128

# Complete a ticket
node cli.js ticket complete --id 128 --response "Fixed the issue"

# Decline a ticket
node cli.js ticket decline --id 128 --response "Won't implement"

# Update ticket
node cli.js ticket update --id 128 --priority high

# System status
node cli.js status
```

See `node cli.js --help` for complete documentation.

## Why This Matters

- **Cleaner codebase:** Only 3 JS files in root (cli.js, deploy.sh, clearsessions.sh)
- **Consistent interface:** All operations use the same CLI tool
- **Better maintainability:** Single source of truth for ticket operations
- **Easier to discover:** Help documentation and consistent command structure
- **No more script duplication:** All ticket operations in one place
