# Mech Battle System — SUPERSEDED

> **⚠️ WARNING — DO NOT TRUST THIS FILE'S OLD CONTENTS.**
> The original version of this document described a file tree under the
> **top-level `frontend/`** (`frontend/lib/battle`, `frontend/components/mech`,
> `frontend/composables/useMechBattle.ts` & `useMechBuilder.ts`,
> `frontend/components/pages/MechBattlePage.vue` & `MechBuilderPage.vue`).
>
> **That entire tree was a dead, stale fork and has been DELETED.** It was a
> closed import loop unreachable from the main-site router — editing it had zero
> runtime effect (the classic "wrong-copy trap"). Every path the old doc listed
> now points at nothing.

## Where the mech game actually lives

The **live, deployed** mech game is the standalone SPA at:

```
apps/mech/frontend/src/
```

It builds to `backend/mech-webdist` and is served under `/mech/`. The main site
only *hands off* to it via a full-page navigation (`frontend/features/mech/` —
routes + nav, deliberately kept).

## Read these instead

- **`docs/GRINDER_DESIGN.md`** — the definitive design for the current game
  (the GRINDER overhaul: feel/damage, squads/hit-locations/salvage, the campaign
  spine, and the on-foot dismount). This is the source of truth for *what the
  game is*.
- **`docs/MECH_ARCHITECTURE_MAP.md`** — the verified code map (live vs. dead
  code, subsystems, extension points). Note: it was written pre-overhaul, so the
  code at branch HEAD supersedes its finer details, but its live/dead verdict and
  system layout still hold.
- **`docs/MECH_GAME.md`** — the dev guide: how to run dev/test/e2e/build, where
  the live code lives, the save-version chain, the phase history, and the
  build → deploy chain.
