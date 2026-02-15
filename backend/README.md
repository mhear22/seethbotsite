# Backend

TypeScript Express server. Serves the API for the Vue.js frontend.

## Dev

```bash
cd backend
npm install
npm run dev    # http://localhost:3010 with hot reload (ts-node-dev)
```

## Build & Run

```bash
npm run build  # Compile TypeScript → dist/
npm start      # Run compiled server
```

## Structure

```
backend/
├── src/
│   ├── controllers/   # Route handlers
│   ├── services/      # Business logic
│   ├── middleware/     # Express middleware (auth, rate limit, logging)
│   ├── game/          # Server-side game logic (multiplayer mech battle)
│   └── index.ts       # Server entry point
├── prisma/
│   ├── schema.prisma  # Database schema
│   ├── migrations/    # Migration files
│   └── seed.ts        # Initial data seed
└── tests/             # Jest tests
```

## Key API Endpoints

```
GET  /api/health
GET  /api/rankings
GET  /api/movies
POST /api/auth/register
POST /api/auth/login
GET  /api/stats/:userId
POST /api/clicks/add-points
WS   /ws/multiplayer
```

See `docs/AUTH.md` for auth details and `docs/AGENTS.md` for full route list.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3010 | Server port |
| `DATABASE_URL` | (from .env) | PostgreSQL connection string |
| `SEETHBOT_JWT_SECRET` | (dev default) | JWT signing secret |
| `SEETHBOT_API_KEYS` | (auto-generated) | Admin API keys |

## Database

```bash
npm run db:migrate        # Create + apply migration (dev)
npm run db:migrate:deploy # Apply existing migrations (production)
npm run db:seed           # Seed initial data
npm run db:studio         # Prisma Studio GUI
npm run db:generate       # Regenerate Prisma client
```

## Troubleshooting

`better-sqlite3` build errors: `npm install better-sqlite3@latest` (native module needs to match Node.js version).
