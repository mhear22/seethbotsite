# Tickets Frontend Handoff

This folder owns the tickets route handoff used by the main site.

The tickets UI is now a separate frontend app under:

- `apps/tickets/frontend`

Main-site routes in `routes.ts` do not render tickets pages directly; they transfer navigation to `/tickets`.

In local `frontend` dev mode, `/tickets` falls back to the in-repo tickets page so local development keeps working without running a second frontend server.

## Canonical tickets app route

- `/tickets`
