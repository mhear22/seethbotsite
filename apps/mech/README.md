# Mech App

A standalone mech game — mech builder, single-player battles (Practice vs AI /
Survival), an open-world Story mode, and online multiplayer. Built with Vue 3 +
Three.js (frontend) and a standalone Express + WebSocket game server (backend).

## Layout

| Part | Path | Package |
|------|------|---------|
| Frontend (Vue + Three.js) | `apps/mech/frontend` | `seethbotsite-mech-frontend` |
| Backend (game API + WebSocket) | `apps/mech/backend` | `seethbotsite-mech-server` |

The backend was extracted from the shared monolith into its own process. It is a
pure game service (matchmaking + multiplayer WebSocket); it has **no code
dependency on the main backend** and needs no database.

## Running

### Single-player only — no backend required

Practice vs AI, Survival, the Mech Builder, and Story mode run **entirely in the
browser**. You can serve just the frontend with nothing else running:

```bash
pnpm --filter ./apps/mech/frontend dev      # → http://localhost:3002
```

The app loads unauthenticated (there is no login gate) and these modes make zero
network calls. Verified: the full Builder → Battle → "Ready for Combat" flow
completes with no backend process running.

### Full stack (adds online multiplayer)

Online multiplayer needs **two** backends:

- the **mech backend** (`apps/mech/backend`, port `3011`) for matchmaking + the
  game WebSocket, and
- the **main backend** for `/api/auth/*` — multiplayer authenticates with a JWT
  minted by the main site, and the mech backend validates it on the WS upgrade.

The simplest way to run everything (Postgres + main backend + main frontend +
mech frontend + mech backend) is the repo-root dev script:

```bash
./dev.sh
```

Or run the mech backend on its own:

```bash
pnpm --filter ./apps/mech/backend dev       # ts-node-dev, port 3011
# or built:
pnpm --filter ./apps/mech/backend build && pnpm --filter ./apps/mech/backend start
```

## Environment

| Var | Used by | Notes |
|-----|---------|-------|
| `MECH_PORT` | mech backend | Listen port (default `3011`). Binds `127.0.0.1` only. |
| `SEETHBOT_JWT_SECRET` | mech backend **and** main backend | **Must be identical** for both — the mech backend validates tokens the main backend mints. The mech backend throws at startup if it is unset. |

The mech backend needs no `DATABASE_URL` (no DB usage).

## How it fits together (production)

The **main backend is the front door**. It serves the built mech SPA at `/mech`
and reverse-proxies the mech runtime traffic to the mech backend process:

- HTTP: `/api/mech/multiplayer/*`, `/api/multiplayer/*` → mech backend
- WS:   `/ws/mech/multiplayer`, `/ws/multiplayer` → mech backend

Because the mech backend binds loopback only, it is reachable exclusively via
that proxy (which applies the main site's rate limiting + auth logging). Both
processes run in the same container; `backend/scripts/start.sh` launches the mech
backend, waits for it to be ready, then starts main — and if either process
exits, the container exits so it restarts rather than serving a broken game.

### Canonical URLs (when mounted by the main server)

- App: `/mech`, `/mech/builder`, `/mech/battle`, `/mech/story`
- API: `/api/mech/multiplayer/*` (legacy alias: `/api/multiplayer/*`)
- WS:  `/ws/mech/multiplayer` (legacy alias: `/ws/multiplayer`)

In local dev the mech frontend (Vite, port `3002`) proxies `/api` and `/ws` to
the main backend, which forwards the mech paths onward — so dev mirrors prod.

## Build output

The frontend builds to `backend/mech-webdist` (served by the main backend at
`/mech`). The backend builds to `apps/mech/backend/dist` (run with `node`).

## Tests

```bash
pnpm --filter ./apps/mech/backend test      # 176 game-logic tests (no DB)
pnpm --filter ./apps/mech/frontend test     # frontend unit tests
```

The mech backend tests are also included in the repo-root `pnpm test`.
