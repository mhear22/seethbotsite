# Mech App

This is the standalone mech game app.

## Frontend

- Path: `apps/mech/frontend`
- Dev: `cd apps/mech/frontend && npm run dev`
- Build output: `backend/mech-webdist`

## Backend

- Standalone entrypoint: `backend/src/mech-server.ts`
- Dev: `cd backend && npm run dev:mech`

## Canonical URLs (when mounted by main server)

- `/mech/builder`
- `/mech/battle`
- API: `/api/mech/multiplayer/*`
- WS: `/ws/mech/multiplayer`
