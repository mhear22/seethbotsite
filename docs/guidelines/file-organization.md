# File Organization

## Project Structure

```
seethbotsite/
├── frontend/
│   ├── components/
│   │   ├── pages/         # Route-level page components
│   │   ├── mech/          # Mech builder/battle components
│   │   └── shared/        # Reusable UI components
│   ├── composables/       # Reusable composition functions (use-*.ts)
│   ├── stores/            # Pinia stores (*-store.ts)
│   ├── repositories/      # API data access layer
│   ├── router/index.ts    # Route definitions
│   ├── lib/battle/        # Mech battle game library
│   └── shared/            # Shared types/constants (synced with backend)
├── backend/
│   └── src/
│       ├── controllers/   # HTTP route handlers
│       ├── services/      # Business logic
│       ├── middleware/     # Express middleware
│       ├── game/          # Server-side game logic
│       └── shared/        # Shared types/constants (synced with frontend)
├── docs/                  # Documentation
└── scripts/               # Build, deploy, utility scripts
```

## Import Aliases (frontend)

```typescript
import Component from '@/components/Component.vue'
import { useStore } from '@/stores/my-store'
import { useComposable } from '@/composables/use-composable'
```

## Placement Rules

- **Components:** Put in `pages/` if it's a route target, `mech/` if mech-specific, `shared/` if reusable
- **Composables:** `composables/` - files start with `use-`, function names start with `use`
- **Stores:** `stores/` - files end in `-store`, function names start with `use` and end in `Store`
- **API calls:** `repositories/` only - never call `fetch()` directly from components
- **Shared frontend/backend types:** `shared/` in both - must be kept in sync (see `SHARED_FILES_SYNC.md`)
- **Scripts:** `scripts/` - never create one-off scripts in project root

## When to Create New Folders

- 3+ files with a shared domain belong in their own subfolder
- Max ~10 files per folder before sub-grouping
- Max 3-4 levels of nesting
