# Mech Game — Developer Guide

The one-page orientation for working on the mech game. For *design* read
`docs/GRINDER_DESIGN.md`; for the *code map* read `docs/MECH_ARCHITECTURE_MAP.md`.

---

## Where the live code lives

**All game code is in `apps/mech/frontend/src/`.** This is a standalone Vue 3 +
Pinia + vue-router + three.js SPA (pnpm package `seethbotsite-mech-frontend`).

- `src/lib/battle/` — the real-time engine (BattleScene, PhysicsSystem,
  CameraController, ProjectileSystem, EnemyAI, MechEntity, InputManager,
  particles, shaders, multiplayer scene).
- `src/lib/story/` — the single-player campaign engine (StoryWorld, StoryCombat,
  Terrain, Town, quests, OnFootEntity/OnFootPhysics, PilotableEntity).
- `src/composables/` — `useStoryMode.ts` (campaign state + save), `useMechBattle.ts`,
  `useMechBuilder.ts`.
- `src/components/pages/` — HomePage, MechBuilderPage, MechBattlePage, StoryModePage.
- `src/shared/` — the network/map contract, duplicated from `backend/src/shared`
  (see "Shared-file drift guard" below).

> **⚠️ Wrong-copy trap (now removed).** There used to be a *second*, stale copy of
> the whole battle stack under the top-level `frontend/` (`frontend/lib/battle`,
> `frontend/components/mech`, the `useMech*` composables, and `Mech*Page.vue`). It
> was dead — a closed import loop unreachable from the main-site router — and has
> been **deleted**. Only `frontend/features/mech/` survives there: it is the live
> handoff (routes + nav) that `window.location.assign`-navigates the main site
> into this SPA. Never recreate the old dead tree; do all mech work in
> `apps/mech/frontend`.
>
> `backend/src/game/` is a *legitimate* third copy — the server-authoritative
> multiplayer sim. Leave it alone unless you are working on netcode.

---

## Running it

All commands assume repo root `/home/seethbotsite`. `pnpm -C apps/mech/frontend <script>`.

| Task | Command |
|---|---|
| **Dev server** | `pnpm -C apps/mech/frontend dev` (Vite on :3002, proxies `/api` + `/ws` → :3001) |
| **Unit/logic tests** | `pnpm -C apps/mech/frontend test` (Vitest — 348 tests, 25 files at time of writing) |
| **Watch tests** | `pnpm -C apps/mech/frontend test:watch` |
| **E2E** | `pnpm -C apps/mech/frontend playtest` (Playwright + Chromium; `playtest:headed` to watch) |
| **Production build** | `pnpm -C apps/mech/frontend build` (or root `pnpm build:mech`) |

The main site is a separate SPA (`frontend/`, root scripts `build:frontend` /
`test`). It shares only the `src/shared` contract with the mech app; there is no
runtime code path from the main site into the mech engine besides the full-page
handoff.

---

## Save-version chain (`v1 → v2 → v3`)

Single-player progress is one `localStorage` slot. The **storage key name is
`mech-story-v1` and is deliberately stable** — it does *not* track the schema
version, so `deserializeRun` can read an older payload from the same slot and
migrate it forward in place. The schema version is a separate `version` field.

`SAVE_VERSION` is currently **3** (`apps/mech/frontend/src/composables/useStoryMode.ts`).

| Version | Introduced | What it added | Migration |
|---|---|---|---|
| **v1** | Story Mode v1 (pre-overhaul) | `StoryRun`/`TownState`/`RunStats`, decay, standing, finale/verdict, `money` | — |
| **v2** | GRINDER Phase 2 | `run.inventory` (salvage parts); `money` carries over 1:1 | `migrateV1toV2` |
| **v3** | GRINDER Phase 3 | `chapter`, `storyFlags`, two-axis Command/Town reputation | `migrateV2toV3` |

`deserializeRun` steps any known older payload up to `SAVE_VERSION`
(`v1 → migrateV1toV2 → migrateV2toV3`, or `v2 → migrateV2toV3`). Bump the constant
and add a `migrateVNtoVN+1` step whenever the persisted shape changes; never
hard-reject on `version !== N` (that silently drops old saves).

---

## Phase history (branch `mech-grinder-overhaul`)

The GRINDER overhaul (design: `docs/GRINDER_DESIGN.md`) shipped in five phases.
Commit SHAs from `git log --oneline` on this branch:

| Phase | SHA | Summary |
|---|---|---|
| Design + verified map | `cd27dff` | GRINDER design doc + pre-overhaul architecture map |
| **P1 — Feel + weapons** | `2006ae7` | Per-arm firepower, homing missiles, damage types/resistances, dash i-frames, momentum/weight, rack abilities, centralized `constants.ts` |
| **P2 — Squads/slots/salvage** | `29c5b5a` | Player-vs-squad arena, per-slot hit locations + delimb, salvage drops enemy loadout, save `v1→v2` |
| **P3 — Campaign spine** | `7dc0d2e` | Acts, named characters (Vaun/Rooker/Kestrel), two-axis reputation, collateral tax, death stakes, save `v2→v3` |
| **P4 — The dismount** | `7634f9e` | On-foot pilot (`OnFootEntity`), walkable towns + hub anchors, decay-pauses-on-foot, mission board |
| **P5 — Production sweep** | *(this cluster)* | Dead-tree deletion, shared-file drift guard, docs, three-vendor chunk split, deploy-chain verification |

---

## Build → deploy chain

**Do not deploy from here** — this section documents the chain for reference.

1. **Build.** `pnpm --filter ./apps/mech/frontend build` (root alias `build:mech`).
   Vite config (`apps/mech/frontend/vite.config.ts`):
   - `base: '/mech/'` in production (assets are requested at `/mech/assets/*`).
   - `build.outDir` → `backend/mech-webdist` (`emptyOutDir: true`).
   - `manualChunks` splits `node_modules/three` into a long-lived `three-vendor`
     chunk so three.js (~600 kB) is not folded into an app chunk and cache-busted
     on every edit.
   Output: `backend/mech-webdist/{index.html, assets/, models/}`.

2. **Container.** `Dockerfile` stage `mech-frontend-builder` runs
   `pnpm --filter ./apps/mech/frontend run build`; the final stage copies
   `/app/backend/mech-webdist` → `./mech-webdist`.

3. **Serve.** `MECH_SERVE_ROOT` defaults to `backend/mech-webdist` and is served
   two ways (both read the same build output):
   - **Main backend (production path) — `backend/src/index.ts`:** mounts the SPA
     under `/mech` via `app.use('/mech', express.static(MECH_SERVE_ROOT))` +
     `spaFallback('/mech', MECH_SERVE_ROOT)`. This matches the Vite `/mech/` base,
     so this is the path the `/mech/`-prefixed asset URLs resolve against.
   - **Standalone mech server — `backend/src/mech-server.ts` (port `MECH_PORT`,
     default 3011):** serves `MECH_SERVE_ROOT` at the **root** path `/`
     (`express.static` + `*` SPA fallback), and also hosts the multiplayer
     WebSocket (`/ws/mech/multiplayer`). Because it serves at `/` rather than
     `/mech`, a `/mech/`-based build only resolves through it if an upstream proxy
     strips the `/mech` prefix; the direct `/mech/` production path is the main
     backend above.

Multiplayer WS lives at `/ws/mech/multiplayer` (legacy `/ws/multiplayer`), JWT
authenticated. Story mode is entirely offline and never touches the network.

---

## Shared-file drift guard

`NetworkMessages.ts`, `MapDefinition.ts`, `GameConstants.ts`, and the map
definitions are triplicated across `backend/src/shared`, `frontend/shared`, and
`apps/mech/frontend/src/shared`. `scripts/validate-shared-files.js` (run by the
main frontend's `prebuild`) validates the **backend source of truth against both
frontend copies**, including the live `apps/mech` SPA copy.

**Known documented exception:** `maps/endOfUniverse.ts` — both frontend copies add
client-only cosmetic material fields (`emissive` / `emissiveIntensity`) the
non-rendering backend omits. This additive-only, identical-between-frontends
divergence is intentionally *not* byte-validated (see the header comment in the
validator). When adding a new map or changing the network contract, edit all
three copies and run `node scripts/validate-shared-files.js`.
