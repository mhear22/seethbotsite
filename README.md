# Seethbot Site

A playful, interactive personal website with games and features.

## Quick Start

```bash
# Frontend dev server (http://localhost:5173)
cd frontend && npm run dev

# Backend dev server (http://localhost:3010)
cd backend && npm run dev
```

## Deploy

```bash
./push-and-deploy.sh   # push to GitHub + build + restart Docker
# or just
./deploy.sh            # build + restart Docker only
```

## CLI Tool

```bash
node cli.js --help
node cli.js status
node cli.js ticket list --status pending
node cli.js ticket show --id 128
node cli.js ticket complete --id 128 --response "Done"
node cli.js ticket decline --id 128 --response "Won't do"
```

Do NOT create new root-level scripts. Use `node cli.js` instead.

## Project Structure

```
.
├── frontend/       # Vue 3 + TypeScript frontend
├── backend/        # Node.js + Express backend
├── docs/           # Documentation
├── scripts/        # Utility scripts
├── cli.js          # Unified CLI tool
└── deploy.sh       # Deployment script
```

## Tech Stack

- **Frontend:** Vue 3, TypeScript, Vite, Pinia, Vue Router
- **Backend:** Node.js, Express, TypeScript, Prisma
- **Database:** SQLite (via Prisma)
- **Deployment:** Docker, Nginx

## Key Docs

1. **[docs/DECISIONS.md](docs/DECISIONS.md)** - Architecture decisions (read first)
2. **[docs/AUTH.md](docs/AUTH.md)** - Auth system
3. **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Deployment guide
4. **[docs/AGENTS.md](docs/AGENTS.md)** - Development workflow

## Workflow for Sub-Agents

1. `node cli.js ticket list --status pending`
2. Read relevant docs
3. `git checkout -b ticket-128-feature-name`
4. Make changes, commit with `Fixes #128: description`
5. `node cli.js ticket complete --id 128 --response "Done"`

## License

Internal project - not for public distribution.
