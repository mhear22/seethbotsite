# Mech Backend Module

This module is the backend entry point for mech-specific APIs and realtime setup.

The standalone mech backend server entrypoint is:

- `backend/src/mech-server.ts`

## Canonical API paths

- `/api/mech/multiplayer/stats`
- `/ws/mech/multiplayer`

## Compatibility paths

Legacy paths are still supported:

- `/api/multiplayer/stats`
- `/ws/multiplayer`
