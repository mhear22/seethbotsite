# Architecture Decisions Log

Read this before working on any feature. It explains WHY things are built the way they are and prevents conflicting choices.

When you make a new architectural decision, add it here.

---

## Tech Stack

**Vue 3 + TypeScript + Vite** (2026-01-30): Migrated from vanilla JS → Vue CDN → Vite build. Composition API with `<script setup>`, Pinia Setup Stores, Vue Router. TypeScript everywhere for compile-time safety. Vite for fast HMR and optimized builds.

**Express.js + TypeScript backend** (2026-01-30): Battle-tested, simple middleware system, easy SQLite integration. Less opinionated than NestJS, which suits the project scale.

**SQLite via Prisma** (2026-02-01 / migrated to PostgreSQL 2026-02-12): Originally separate SQLite files per domain. Migrated to PostgreSQL 16 in Docker Compose for better concurrency and backup options. Prisma ORM handles schema, migrations, and type generation. See `POSTGRESQL_SETUP.md` for setup.

**Docker multi-stage build** (2026-02-01): 3 stages - build frontend (Vite), build backend (TypeScript), production image (Nginx + Node.js). Single container, reproducible builds, easy rollback.

---

## Authentication

**Dual auth system** (2026-02-04): Two independent systems coexist:
1. **User auth**: Optional JWT (30-day rolling expiry, bcrypt/10 rounds), session tracking per device. Env vars: `SEETHBOT_JWT_SECRET`, `SEETHBOT_JWT_EXPIRY`.
2. **API key auth**: Simple string keys for admin/integrations. Env var: `SEETHBOT_API_KEYS`. Types: READ_ONLY, READ_WRITE, ADMIN.

All GET endpoints are public. Write endpoints require API key. User-specific endpoints require JWT. A default dev key is generated on startup - set `SEETHBOT_API_KEYS` in production.

**Sessions** track device info (`device_name`, `device_type`). Auto-extend: if 5+ minutes since last use, session extends 30 days. Password change invalidates all sessions.

---

## Database

**Separate DB files by domain** (2026-02-01, now Prisma-managed):
- Users, sessions → `users` domain
- Stocks, portfolios → `stocks` domain
- Game stats, achievements, challenges → `game_stats` domain

Auto-increment integer IDs for most tables. String user IDs (`'cam'`, `'orlando'`, `'mika'`) in game stats for simplicity - no FK enforcement.

---

## Frontend Architecture

**Vue Router** for client-side routing with route guards for protected pages.

**Pinia Setup Store pattern**: `defineStore('name', () => { ... })` with `ref()` and `computed()`. All stores in `frontend/stores/`. Never use Options Store pattern.

**Composables** for reusable logic (`useAudio`, `useCat`, `useRankings`, `usePanels`, etc.).

**Repository pattern** with `openapi-fetch` for type-safe API calls generated from OpenAPI spec. Components use stores; stores use repositories; repositories use generated types. Never call `fetch()` directly from components.

**Single File Components** with `<script setup lang="ts">` and `<style scoped>`.

---

## Backend Architecture

**RESTful API**: GET (public), POST/PATCH/DELETE (require API key or user auth). Resource-based URLs: `/api/movies`, `/api/stats/:userId`, etc.

**Controller-service pattern**: Controllers handle HTTP; services handle business logic; repositories handle DB.

**Middleware stack** in `backend/src/index.ts`: JSON parser → URL parser → logging → CORS → rate limiting → API key auth → error handler.

**In-memory state for real-time data**: Stock prices live in `StockPriceManager` (reset on restart - acceptable). Transactions persist to DB.

**Rate limiting**: 10,000 req/min per IP (high to support WebSocket multiplayer traffic).

---

## Features

**Optional user accounts** (2026-02-04): All features work without login. Auth is opt-in. Anonymous users identified by localStorage ID.

**Daily challenges** (2026-02-05): 3 random challenges per user per day (keyed by YYYY-MM-DD). Progress updates automatically when games are played.

**Achievement system** (2026-02-05): 13 achievement templates. Checked automatically when stats are recorded.

**Stock market**: 6 stocks, prices fluctuate every 30 seconds in memory, users start with $10,000.

**Movie voting**: Preferential (ranked choice) voting, Condorcet-like result calculation.

**Clicker/idle**: Clicks tracked globally, transferable to user rankings via `POST /api/clicks/add-points`.

**Mech battle** (2026-02-08): Three.js 3D arena, stat-driven combat, single-player AI + multiplayer (WebSocket at `/ws/multiplayer`). Shared types in `backend/src/shared/` and `frontend/shared/` kept in sync by `scripts/validate-shared-files.js`.

---

## Deployment & Infrastructure

**Nginx as reverse proxy**: Serves `frontend/dist/` static files, proxies `/api/*` to Express on port 3010. Single entry on port 8081.

**Discord webhook** for build notifications. Configure via `DISCORD_WEBHOOK_URL`. Notifications: build started, completed, failed.

**Git-based deployment**: `./push-and-deploy.sh` = git push + `./deploy.sh`.

---

## Testing

Frontend: **Vitest** + **@vue/test-utils** (`npm run test` in `frontend/`)

Backend: **Jest** + **Supertest** (`npm run test` in `backend/`)

Coverage in `frontend/coverage/` and `backend/coverage/`.

---

## Performance & Security

- **CSS animations** (GPU-accelerated) over JS animations
- **Vite code splitting** - automatic by route, zero-config
- **Input validation**: HTML tags stripped, length limits, parameterized queries (no SQL injection)
- **Security headers**: `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`
- **Secrets**: Always use env vars (`SEETHBOT_JWT_SECRET`, `SEETHBOT_API_KEYS`, `DISCORD_WEBHOOK_URL`). Never commit.

---

## Key Principles

- Keep it simple - avoid over-engineering
- User experience first (optional auth, low barrier)
- TypeScript everywhere
- Automated deployment (Docker + scripts)
- Security best practices throughout

*Last Updated: 2026-02-15*
