# Mech Frontend Handoff

This folder owns the mech route handoff and navigation links used by the main site.

The mech UI itself is now a separate frontend app under:

- `apps/mech/frontend`

Main-site routes in `routes.ts` do not render mech pages directly; they transfer navigation to `/mech/*`.

## Canonical mech app routes

- `/mech/builder`
- `/mech/battle`

## Legacy compatibility routes

- `/mech-builder` -> `/mech/builder`
- `/mech-battle` -> `/mech/battle`
