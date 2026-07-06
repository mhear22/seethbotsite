# Mech Game Architecture Map

A single-player-focused 3D mech game (Vue 3 + Pinia + vue-router + three.js) living at `/home/seethbotsite`. This map merges six subsystem reports and resolves the live-vs-dead-code question by direct inspection of the tree.

---

## 1. What the game is today

### Two apps, one handoff
The mech game is a **standalone SPA** at `apps/mech/frontend` (pnpm package `seethbotsite-mech-frontend`). It builds to `backend/mech-webdist` and is served under `/mech/` by `backend/src/mech-server.ts` (standalone Express+WS on port 3011).

The main site does **not** render any mech UI. `frontend/features/mech/routes.ts` registers `/mech`, `/mech/builder`, `/mech/battle` with a `beforeEnter` guard that calls `window.location.assign(to.fullPath)` — a full-page navigation into the separate mech SPA. The nav link ("Mech Game" → `/mech/builder`) is in `frontend/features/mech/navigation.ts`. The two are distinct Vue apps bridged only by a page reload; shared state (auth, settings) does not flow between them.

### Player flow (live app: `apps/mech/frontend/src/router.ts`, exactly 5 routes)
`/` HomePage → `/builder` → `/battle` → `/story` → `/auth` (redirect stub back to the main site's `/auth`).

`HomePage.vue` menu: **Continue** (only if a story save exists), **Story Mode**, **Build & Battle**, **Settings**.

- **Build & Battle:** `MechBuilderPage.vue` — wizard (core/legs/head/arms/rack), threat meter, starter presets, saved builds in `localStorage` (`mechBuilder_loadout`, `mechBuilder_savedBuilds`). "Battle" exports a build code and pushes `/battle?build=CODE`. `MechBattlePage.vue` (2054 lines) reads it via `useMechBuilder.importBuild`, then offers **single-player** (local AI enemy, fully offline via `useMechBattle.ts`) or **multiplayer** (WebSocket matchmaking, **requires login** via the JWT auth store).
- **Story Mode:** intro (New Run / Continue) → a persistent open-world `StoryWorld` 3D scene. See §3.

### Core gameplay loop
The player is **always a `MechEntity`** — there is no on-foot code anywhere (verified: zero matches for dismount/on-foot/pedestrian/cockpit in the live app).

Battle loop (`apps/mech/frontend/src/lib/battle/BattleScene.ts`, 1101 lines, `requestAnimationFrame` → `update(dt)`):
1. Read input (`InputManager` — WASD/jump/dash/fire/ability + mouse-look via pointer lock, **plus** virtual joystick/buttons for touch).
2. `CameraController` sets the mech's yaw from mouse-look and positions an over-the-shoulder camera.
3. `PhysicsSystem` accelerates toward a camera-relative target velocity (per-leg friction, weight penalty, 3× ability boost), handles dash (FOV kick + shake + thruster burst) and jump-jets (gravity 50, terrain ground-stick).
4. Dual-arm firing with independent cooldowns (weapon `fireRate` or default 0.25s; melee 1.5s); power consumed per shot, regens from `core.powerOutput` — running out blocks firing (the one real resource layer).
5. `EnemyAI` drives the single enemy; projectiles/collisions/particles/damage-flash/hitstop resolve.

Feel is arcade-tuned with heavy juice: screen shake, FOV kick, hitstop on kills, and a `DamageShader` (pixel-sort + chromatic aberration + red-wash, ~0.6s decay). The `ParticleSystem` (560 lines, pooled 1500-particle buffer) is the most polished part of combat.

**Combat is hardwired 1v1** in `BattleScene` (scalar `playerMech` + `enemyMech` fields, not an entity array). `EnemyAI` (466 lines) is genuinely deep for a duel: per-difficulty profiles (tutorial/easy/medium/hard/boss) tuning aim skill, reaction time, shot-leading, projectile-dodging, kite-vs-brawl, evasive jumps.

### Damage model (shallow — the main gameplay-depth ceiling)
- Every hit's damage = `max(5, mech.stats.firepower/10)` — derived from the **sum of all parts' firepower**, not the arm that fired. Both arms deal identical damage; per-weapon `firepower` in `MechParts.ts` is effectively cosmetic. Melee gets a flat 2.5× + lunge.
- One shared HP pool, flat armor% reduction (cap 90%). No hit locations, no part destruction, no range falloff, no ammo/heat. "Crit" is a cosmetic `dmg>=15` flag.
- 6 arm weapons collapse to 3 projectile archetypes (ballistic sphere / energy sphere / melee box); `weaponType` only changes mesh/color/speed/spread. Accuracy only widens spread.

### Rendering
Mechs are assembled **100% procedurally**: `MechModelLoader` requests a per-part GLB (paths declared in `MechParts.ts`), gets a 404 (no `.glb` files ship — `public/models/` holds only a README), and falls back to `getProceduralModel` (`ProceduralModels.ts` → generators in `procedural/`). Battle arenas are declarative `MapDefinition` data rendered by `MapRenderer` — 6 arenas (defaultArena, ruinedHighway, reactorCore, spaceColony, megaFactory, endOfUniverse), bounded box worlds with static geometry, animated hazards, and several sky shaders (RingWorldSky, EndOfUniverseSky with two-pass gravitational lensing).

### Multiplayer
Server-authoritative WebSocket, wired and reachable from the live app. `backend/src/services/MatchInstance.ts` (~1300 lines) simulates all physics/combat/projectiles/damage at a fixed 20Hz; clients send only input at ≤60Hz and do prediction/reconciliation (own mech, diverge threshold 0.5u) + interpolation (~100ms). Supports 1v1 PvP and server-driven **survival co-op** (WaveManager/ServerEnemyAI, `AIMechState` bolted onto `PlayerState`). Protocol contract: `backend/src/shared/types/NetworkMessages.ts`. Client scene: `apps/mech/frontend/src/lib/battle/MultiplayerBattleScene.ts`. Story mode is **entirely offline** and never touches the network.

---

## 2. Live code vs duplicated/dead code — SETTLED

All six reports agree, and direct inspection confirms it definitively:

**LIVE:** `apps/mech/frontend/` is the canonical, deployed mech game.
**DEAD:** the top-level `frontend/lib/battle`, `frontend/components/mech`, `frontend/composables/useMechBattle.ts` & `useMechBuilder.ts`, and `frontend/components/pages/MechBuilderPage.vue` / `MechBattlePage.vue` are a stale, less-advanced earlier extraction.

### Verification evidence
- **Routing:** `frontend/features/mech/routes.ts` is the *only* place the main site references mech routes, and every entry hands off via `window.location.assign` (confirmed by reading the file). Grepping the main-site router config for `MechBattlePage`/`MechBuilderPage` returns **nothing** — the dead pages are not routed anywhere.
- **Import graph:** `frontend/lib/battle` is imported only by other dead `frontend/` files (`components/mech/BattleCanvas.vue`, `MultiplayerBattleCanvas.vue`, `MechPreview3D.vue`, `composables/useMechBattle.ts`, `components/pages/MechBattlePage.vue`) — a closed loop of unreachable code.
- **Divergence (the dead copy is materially behind):** line counts — `EnemyAI.ts` 466 (live) vs 211 (dead); `ParticleSystem.ts` 560 vs 194; `ProjectileSystem.ts` 633 vs 446. The dead `EnemyAI` lacks difficulty profiles, shot-leading and dodging; the dead tree lacks `procedural/detailing.ts`, the model rework, and **has no `lib/story` at all** (no story mode). `useMechBuilder` is 515 lines live vs 367 dead. `DamageShader.ts` and `ProceduralModels.ts` happen to be byte-identical, but the systems above have diverged in **both** directions in the netcode case (see below).

### The full duplication picture (three trees for battle)
1. `apps/mech/frontend/src/lib/battle` — **LIVE**.
2. `frontend/lib/battle` (+ `components/mech`, `features/mech`) — **DEAD** front-end fork. Prime deletion candidate; confirm no stray imports first (import loop is self-contained, so safe).
3. `backend/src/game` (`MechEntity`, `ProjectileSystem`, `WaveManager`, `ServerEnemyAI`) — **LIVE** server-authoritative sim, a legitimately separate copy for multiplayer. It imports centralized `backend/src/shared/constants/GameConstants` that the frontend `constants.ts` does **not** mirror.

Also triplicated: `NetworkMessages.ts` and `shared/maps/index.ts` exist verbatim in `backend/src/shared`, `frontend/shared`, and `apps/mech/frontend/src/shared`. `scripts/validate-shared-files.js` only guards backend vs root-frontend — **the `apps/mech` copy is unvalidated and can silently drift.**

**Bottom line: do all new mech work in `apps/mech/frontend`. Never edit `frontend/lib/battle` or `frontend/components/mech` — those changes do nothing.** `docs/MECH_BATTLE_IMPLEMENTATION.md` is stale: its mechanics are accurate but every file path points at the dead tree and it never mentions `apps/mech`.

---

## 3. Current story-mode status

Story Mode is a **complete, self-contained v1** built from `docs/STORY_MODE_DESIGN.md` (decisions Q1–Q17), confined entirely to `apps/mech/frontend`. It is well tested at the logic layer and thinly tested at the interactive layer.

### Flow
`HomePage` → `/story` shows an intro with **New Run / Continue** (Continue appears only if `localStorage['mech-story-v1']` exists; `?start=continue` auto-enters). Starting spawns one persistent `StoryWorld`:

- A **1200×1200-unit** procedural-biome open world (`Terrain.ts`: seeded noise → ocean/beach/plains/savanna/forest/rock/snow with rivers, flattened `TerrainPads` under towns) and a drifting sky.
- **5 named towns** (Dunderhollow, etc.) placed deterministically on a jittered ring (`Town.ts`: ground pad, 2 buildings, 2 farm plots, ~8 townsfolk capsules, a floating quest-giver marker).
- The player drives a `MechEntity` built from a **fixed lightest-valid Starter loadout** (by design, `buildStarterLoadout` ignores the builder loadout — design Q10).

### Systems
- **Decay:** each town's `condition` (0–100) decays one-way (~0.167/s, ~10 real minutes to zero) **only while the player stands within 60u** (`TOWN_DECAY_RADIUS`). Farms wilt and population thins as it drops. Throttle-saved ~1/s.
- **Standing:** raised by completing a deterministic **3-quest chain** per town (`quests.ts`: `wave_defence` / `hidden_object` / `boss_hunt`), rewards + difficulty scaled by power tier.
- **Interaction:** walk within 14u of a quest-giver → E prompt → `QuestDialog.vue` → accept spawns a `StoryCombat` encounter, or open the **Garage** (`Garage.vue`) to buy+equip parts (priced by `power × rarity`, validated to keep the loadout legal, applied live by rebuilding the mech via `applyLoadout`).
- **Finale:** making **3 towns happy** (standing 100) flips phase `exploring → finale`; towns you never helped are seized by 2× scaled bosses that auto-attack on entry. Clearing the last flips to `ended` → `StoryCredits.vue` shows a per-town damage report and a **Hero / Mercenary / Menace / Monster** verdict from average destruction.
- **No stakes on death:** player death has no game-over — the mech is rebuilt at full HP. The only lasting cost is the decay you personally caused. Finishing clears the save slot.

### Key files
- `src/composables/useStoryMode.ts` (778 lines) — the heart: `StoryRun`/`TownState`/`RunStats` model, pure helpers (decay, standing, finale/verdict), starter loadout, buy+equip economy, single-slot `localStorage` persistence (`STORY_SAVE_KEY = 'mech-story-v1'`, `version:1`, migration-ready `deserializeRun`), phase state machine `refreshPhase()`.
- `src/components/pages/StoryModePage.vue` (849 lines) — orchestrator: intro/continue, owns the `StoryWorld`, per-frame HUD/decay tick, quest dialogue, garage, finale auto-start, credits.
- `src/lib/story/StoryWorld.ts` (564 lines) — the open-world engine. Reuses battle systems (`MechEntity`, `CameraController`, `PhysicsSystem`, `InputManager`, `Projectile`/`ParticleSystem`) + `Terrain`/`Town`/`StoryCombat`. API: `start`, `cleanup`, `setPaused`, `startQuest`, `applyLoadout`, `setTownCondition`, `getInputManager`, `onFrame`. Emits `StoryFrameInfo` (`insideTownId`, `questGiverTownId`) each frame.
- `src/lib/story/StoryCombat.ts` (530 lines) — encounter engine; spawns scaled enemy mechs and **supports multiple enemies at once** (proving the combat core already generalizes past 1v1).
- `src/lib/story/quests.ts` — pure/deterministic quest + economy spine.
- Story UI: `src/components/mech/story/` — `QuestDialog.vue`, `Garage.vue`, `TownHud.vue`, `StoryCredits.vue`.

### Test coverage
Good pure-logic coverage: `src/lib/story/__tests__/quests.test.ts` (13) + `useStoryMode.test.ts` (33) covering decay, standing, finale, credits, economy. Thin interactive coverage: only `e2e/story-mode.spec.ts` — a smoke test that `/story` → New Run renders a non-blank canvas and survives ~1s of W movement. **No quest/garage/finale flow tests and no component tests** for the 849-line page.

---

## 4. Extension points

### (a) Gameplay depth
- **Per-weapon damage (biggest, cheapest win):** change `ProjectileSystem.fireWeapon` to use the firing arm's own `firepower` (and the richer per-weapon `WeaponConfig` already defined in `MechTypes.ts`) instead of `mech.stats.firepower/10`. One-function change; instantly makes the 6 weapons distinct.
- **Activate dead subsystems already coded in `ProjectileSystem`:** the full homing-**missile** path (targetId/homingDelay/glow/PointLight/quaternion steering) is unreachable because no part has `weaponType: 'missile'` — assign it to a part to light it up for free.
- **Damage types / resistances:** `MechEntity.takeDamage(damage)` is the single choke point — extend to `takeDamage(damage, weaponType)` and add per-armor resistances (energy/ballistic/melee) using existing `weaponType` + `synergyTags` data.
- **Hit locations / part destruction:** `ProjectileSystem.checkCollisions` already resolves a hitbox; the loadout is already slot-based (`leftArm`/`rightArm`/`legs`/`head`), so per-part subhitboxes + per-slot HP would let you shoot off a weapon.
- **Rack abilities:** `MechEntity.useRackAbility()` (~line 530) is a half-empty switch — only repair-drone (+50 HP) and ammo-feed (temp 2× fire rate) work; smoke does nothing, jump-jets returns false, shield-gen `support` weapon falls through to a damage-5 sphere. Fleshing these out is data-ready in `MechParts.ts`.
- **Multi-enemy arena:** `StoryCombat` already runs `EnemyAI`+`ProjectileSystem` against multiple enemies. Only `BattleScene`'s scalar `enemyMech` blocks squads/waves in the arena — generalize it to an array (`EnemyAI.update(self, target, dt)` and `ProjectileSystem.checkCollisions` already take arrays).
- **Tuning:** `constants.ts` holds only 2 values; most magic numbers (accel 60, gravity 50, dash 30, per-leg friction) are inline in `PhysicsSystem`/`CameraController`. Centralizing them there unblocks systematic balance work. New AI archetypes are just new rows in `EnemyAI`'s `DIFFICULTY_PROFILES`.
- **GLB visuals:** dropping real `.glb` files into `public/models/` per the README upgrades every mech with **zero code change** (pipeline + `MODEL_ATTACH_POINTS` already exist).

### (b) On-foot / town mode — greenfield, host is `StoryWorld`
Nothing exists today. The clean path:
1. **Player abstraction (the core blocker):** `BattleScene`, `StoryWorld`, `CameraController`, and `PhysicsSystem` are all typed directly against concrete `MechEntity` and read mech-specific fields (`loadout.legs.mobilityType`, `weightPenalty`, `jumpFuel`, `dashCooldown`). Introduce a small `{ position; rotation; velocity; mesh; update(dt) }` interface. `CameraController.target` only *reads* `.position` and *writes* `.rotation.y` — a narrow interface that can already accept either a mech or a new `OnFootEntity` (just lower `MIN/MAX_DISTANCE` and shoulder offsets for a human).
2. **Reuse `InputManager` unchanged** (WASD/jump/look + touch is entity-agnostic).
3. **Physics:** add an entity-type branch or a sibling `OnFootPhysics`; reuse `setGroundHeightProvider(terrain.heightAt)` for terrain walking; skip weight/jump-jet/dash-fuel.
4. **Dismount pattern is already demonstrated:** `StoryWorld.applyLoadout()` disposes the old mech mesh, builds a new entity, and repoints `camera.target` + scene — mirror it for `dismount()` swapping `MechEntity ↔ OnFootEntity`. `StoryFrameInfo.insideTownId` is the ready-made trigger to enable on-foot on town entry.
5. **Walkable town:** `Town.ts` is currently one `THREE.Group` of mech-scale decorative meshes with **no colliders and no interiors** (only battle-arena `staticGeometry` with `collision:true` feeds the collision `Building[]`). Extend it with pedestrian-scale building colliders, interiors/doors, and NPC anchors — the townsfolk capsules are natural NPC hooks, and the existing `QUEST_GIVER_RADIUS` proximity + E-prompt pattern generalizes to "enter building" / NPC talk. Its condition-driven visual states make it story-reactive already.

For networked on-foot later: add an `entityType`/`mode` field to `PlayerState` in `NetworkMessages.ts` and branch `MatchInstance.updatePlayerPhysics` **in lockstep with** `ClientPrediction.applyInput` (they must match to avoid rubber-banding). Use a mount/dismount action boolean rather than new message types.

### (c) Story campaign
- **Content spine:** `quests.ts` is pure/deterministic with no authored narrative — `buildQuest`/`buildQuestChain` generate from town index. Replace with authored `QuestDef` data, add dialogue/branching fields and characters; `QuestDialog.vue` (currently a one-line flavor string) is where a dialogue-tree UI grows.
- **Progression:** `useStoryMode`'s phase state machine (`exploring | finale | ended`) and versioned serializable `StoryRun`/`TownState` are the world-state substrate. Extend the phase enum for chapters, add story flags and cross-town arcs; `serializeRun`/`deserializeRun` already version the save for migrations and can grow to multi-slot / chapter checkpoints. `StoryCredits` + verdict give a ready ending framework.
- **Menu/routing:** adding a "Campaign" mode is trivial — one entry in `HomePage.vue` + one route in `router.ts` (mirror how `/story` was added). Level-select / chapter screens live here too.
- **Networked/co-op campaign (optional):** `match_found` already carries mode-specific bootstrap (`initialWave`, `initialAIMechs`) — mirror it to inject mission/objective data, and add `quest_started`/`objective_complete` events modeled on the working `wave_started`/`wave_complete` survival example. A persistent shared overworld would need a longer-lived session type in `GameServer` (matches are ephemeral today), not just new messages.
- **Account-backed saves (optional):** `useAuthStore` already provides JWT + profile + a persistence hook; story progress could be lifted from the single local slot into cloud saves. Note story is deliberately account-independent today (auth gates only multiplayer).

---

## 5. Risks & gotchas

**Editing the wrong copy (highest-impact trap).** The mech stack exists twice on the front end. Editing anything under `frontend/lib/battle`, `frontend/components/mech`, or `frontend/components/pages/Mech*.vue` has **zero runtime effect** — those files are unreachable (verified). Always work in `apps/mech/frontend`. Consider deleting the dead `frontend/` mech tree to remove the trap.

**Silent shared-file drift.** `NetworkMessages.ts` and `shared/maps/index.ts` are triplicated across `backend/src/shared`, `frontend/shared`, and `apps/mech/frontend/src/shared`. `scripts/validate-shared-files.js` only compares backend vs root-frontend — the **live `apps/mech` copy is unvalidated** and can drift from the server contract undetected. New maps must be added in both `apps/mech/frontend/src/shared/maps/index.ts` and `backend/src/shared/maps`.

**Enemy generation has two sources of truth.** `StoryCombat`'s `DIFFICULTY_STATS`/`DIFFICULTY_LOADOUT` deliberately mirror `useMechBattle.generateEnemy` — they can drift. Unify when deepening combat.

**Live dead/buggy code inside the live tree:**
- `PhysicsSystem.updateEnemyAI()` references an undefined `ARENA_HALF` (would throw `ReferenceError`) — never called; `EnemyAI.ts` is the real AI. Delete it.
- `MechEntity.useRackAbility` rack-ammo-feed uses a raw `setTimeout` for its 5s window, so it ignores hitstop/pause and isn't deterministic.
- `MechEntity.takeDamage` (~line 384) has a per-hit `console.log` in the hot combat loop.
- `StoryWorld.ts` declares `terrain` twice (a `Terrain` field and an unused `TerrainParams` object); `TerrainNoise.ts` is superseded by `Terrain.ts` and referenced nowhere. `OverworldSky.ts` is imported but `StoryWorld.setupSky()` builds its own inline gradient sky, so `OverworldSky`'s animated clouds/sun are unwired.
- Every mech assemble fires 6 GLB fetches that 404 (no models ship) and fall back to procedural — wasted requests + console warnings on every load.

**Multiplayer half-built pathways:**
- Abilities are dead end-to-end: `PlayerInput.useAbility` / `PlayerState.abilityActive` / `MechLoadout.ability` exist, but `MatchInstance` never reads `useAbility` or applies any effect.
- Reliable-event delivery is a Phase-3 stub: clients send `ack` but `GameServer.handleMessage`'s ack case is empty — events are fire-and-forget, so a dropped `mech_destroyed`/`damage` is lost.
- `MultiplayerBattleScene.handleStateSnapshot` reads only `snapshot.players[opponentId]` + projectiles and **ignores `snapshot.aiMechs`** — networked survival AI may not render via this scene (verify before extending co-op).
- `MatchInstance.hasPlayer()` reads `this.player2.playerId` with no null check, but `player2` is legitimately null in solo survival — potential crash. Survival kill attribution is a documented hack (`projectileOwnerId` returns player1 when an AI is hit).
- Server tick is a fixed 20Hz `setInterval` with constant 50ms `dt` and no accumulator/catch-up — GC pauses/timer drift desync server physics, a scaling limiter.

**Story-mode fragility & scope limits:**
- Terrain/physics coupling is fragile: comments variously claim mechs are clamped to `y=0` **and** that they walk the heightfield via `setGroundHeightProvider`; pads force elevation 0 to reconcile this, so any non-zero pad elevation risks desyncing visuals from collision.
- Towns are self-described **coarse Phase-1** states (buildings have no colliders/interiors, townsfolk are static capsules, no pedestrian scale) — a walkable town is real new spatial work, not a visual tweak.
- Story is **procedural, not authored**: no characters, no branching, no scripted beats — a real narrative needs new authored-content structures.
- Progression is shallow/local: single `localStorage` slot, not account-tied; builder loadout and story run are separate universes (by design Q10); no XP/unlock meta; death is a cost-free revive so stakes are only passive decay. Pacing constants (decay rate, happy threshold, finale-unlock count) are module constants — tuning needs code edits.

**Cross-SPA seams:** the main site and mech app are separate Vue SPAs bridged only by `window.location.assign` (full reload); auth/settings don't flow across. The mech app's `/auth` route is just a redirect stub, yet multiplayer silently depends on `auth.token` — the login round-trip is a rough edge for anyone extending online play. `docs/MECH_BATTLE_IMPLEMENTATION.md` points entirely at the dead file tree and should not be trusted for locations.