# AGENTS.md - Development Guide

*mald.mikahear.es - playful interactive personal website*

## Read Before Working

1. **`docs/DECISIONS.md`** - All major architectural decisions (WHY things are built the way they are)
2. **`docs/AUTH.md`** - Authentication system
3. **`docs/DEPLOYMENT.md`** - How to deploy

---

## Tech Stack

- **Frontend:** Vue 3 Composition API, TypeScript, Vite 5, Pinia (Setup Stores), Vue Router
- **Backend:** Node.js, Express, TypeScript, Prisma ORM
- **Database:** SQLite (via Prisma at `backend/prisma/dev.db`)
- **Deployment:** Docker multi-stage build, Nginx reverse proxy

## Project Structure

```
seethbotsite/
├── frontend/
│   ├── components/         # Vue SFCs (pages/ and shared/)
│   ├── stores/             # Pinia stores
│   ├── composables/        # Reusable composition functions
│   ├── repositories/       # API call layer (openapi-fetch)
│   ├── router/index.ts     # Route definitions
│   └── lib/battle/         # Mech battle game library (Three.js)
├── backend/
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Express middleware
│   │   └── index.ts        # Server entry point
│   └── prisma/             # Schema, migrations, seed
├── docs/                   # Documentation
├── scripts/                # Utility scripts
├── cli.js                  # Unified CLI tool
└── deploy.sh               # Deployment script
```

## Routes

| Route | Description |
|-------|-------------|
| `/` | Home (mold meter, fart button) |
| `/girl` | Girl mode easter egg |
| `/gender` | Gender selection |
| `/about` | About page |
| `/rankings` | Coolness leaderboard |
| `/cats` | Random cat pictures |
| `/stocks` | Stock market simulation |
| `/movies` | Movie night voting |
| `/clicker` | Clicker game |
| `/fishing` | Fishing game |
| `/idle` | Idle clicker |
| `/mech-builder` | Mech builder |
| `/mech-battle` | Mech battle (Three.js 3D) |

## State Management

- **Pinia Setup Stores** for global/shared state (`stores/`)
- **Composables** for local/reusable logic (`composables/`)
- **Repositories** for API calls (`repositories/`) - components never call `fetch()` directly

All stores use the `defineStore('name', () => { ... })` pattern with `ref()` for state and `computed()` for derived values.

## Development

```bash
# Frontend dev (port 5173)
cd frontend && npm run dev

# Backend dev (port 3010)
cd backend && npm run dev

# Test production build
cd frontend && npm run build && npm run preview
```

## Sub-Agent Workflow

```bash
# 1. Check pending tickets
node cli.js ticket list --status pending

# 2. Show details
node cli.js ticket show --id 128

# 3. Work on it
git checkout -b ticket-128-feature-name
# ... make changes ...
git add <files>
git commit -m "Fixes #128: Brief description"
git push origin ticket-128-feature-name

# 4. Mark done
node cli.js ticket complete --id 128 --response "Implemented X"
```

**Do NOT create new root-level scripts.** The CLI replaces all one-off scripts.

## Git Conventions

```
feat: Add new feature
fix: Fix bug
refactor: Refactor code
docs: Update documentation
test: Add/update tests
chore: Maintenance
```

## Testing Checklist (Before Deploy)

- [ ] All routes load (`/`, `/rankings`, `/cats`, `/stocks`, `/movies`, `/clicker`, `/fishing`)
- [ ] Dark mode toggle works
- [ ] Audio (no autoplay on load, plays on interaction)
- [ ] Tachometer fart button
- [ ] Rankings refresh
- [ ] Movie voting flow
- [ ] `npm run build` succeeds
- [ ] Check console for errors

## Deployment

```bash
./deploy.sh            # Build Docker image and restart container
./push-and-deploy.sh   # Git push + deploy
```

Nginx serves static files from `/app/frontend/dist/` and proxies `/api/*` to Express on port 3010. Container runs on port 8081.

## Key Notes

- **Audio autoplay:** Browsers block it - always require user interaction first
- **Memory leaks:** Clean up dynamically created DOM elements with `setTimeout(() => el.remove(), ms)`
- **Shared files:** `backend/src/shared/` and `frontend/shared/` must stay in sync - `scripts/validate-shared-files.js` runs as `prebuild`
- **Rate limit:** 10,000 req/min per IP (high to support multiplayer WebSocket traffic)
