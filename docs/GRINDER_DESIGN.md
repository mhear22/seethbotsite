# GRINDER — Definitive Design Overhaul for the Mech Game
*Live target: `apps/mech/frontend`. Every path below is in the deployed SPA; the dead `frontend/lib/battle` tree is never touched.*

*This document is the synthesis of four competing designs. Its backbone is **feel** — the winning design across the feasibility and player lenses — hardened by grafting the strongest, code-grounded ideas from **progression** (the collateral-tax consequence hook, decay-pauses-on-foot), **narrative** (two-axis reputation, the mirror-antagonist who dismounts cleanly), and **combat** (hit-location delimb consequences, the half-health reinforcement script, salvage-drops-the-enemy's-loadout). Where the judges flagged a weakness in the winner, the fix is called out inline as **[FIX]**.*

---

## 1. Vision

You pilot a sixty-ton war Frame through a colony belt the war forgot. Every time you spool the reactor and step, the ground shakes and the shanty town beside you loses a roof. You are the biggest, loudest, most destructive thing for a hundred kilometres — and the people you are sent to "protect" flinch when your shadow crosses them. The fantasy is **weight with a conscience**: the seismic, momentum-heavy joy of driving a walking tank, cut against the moment you power it down, drop out of the cockpit, and walk the same street as a fragile human who has to look survivors in the eye.

The overhaul's spine is that **the machine is itself the harm, and skill is the only mercy you can offer.** The existing decay system already says *your presence damages what you protect*. We make that legible in the player's hands: a clean, fast, precisely-dodged fight costs a town almost nothing; a sloppy brawl where you tank hits and spray fire leaves it in rubble. Command wants efficiency. The towns want mercy. The Frame only knows how to break things. You live in the gap between those three facts — and at the end a tribunal reads back exactly what your presence cost.

---

## 2. Story & campaign

### 2.1 Why we evolve the spine, not replace it

Story Mode already contains a moral-ambiguity engine wearing a joke costume. Three load-bearing facts, verified in code:
- Town `condition` decays **one-way, only while the player stands within `TOWN_DECAY_RADIUS` (60u)** (`useStoryMode.applyDecay`) — *your presence is the harm.*
- `standing` (0–100 via the 3-quest chain) is earned **separately** from the damage you cause — *trust and harm are different ledgers.*
- The ending `verdict` (`verdictForDamage`) grades you on average destruction — *the gap between the two is your judgment.*

We keep the entire mechanical spine — `StoryRun`/`TownState`, the decay ratchet, the standing chain, the `exploring → finale → ended` phase machine, the verdict — and re-skin the fiction on top. Rewriting it would throw away the one system that already encodes the theme.

### 2.2 Setting

The **Talus Reach** — a string of frontier mining colonies at the tail end of a twenty-year attritional war between the **Directorate** (the fading central authority you nominally serve) and the **Combine** (a coalition of aggressor states and ex-Directorate deserters running scavenger warbands). The front moved on years ago. What is left is five half-abandoned settlements, a broken supply chain, and standing orders nobody in the capital remembers issuing. You are a Frame pilot redeployed here because the Reach is cheap to lose and expensive to hold.

### 2.3 The chain of command (named characters)

- **Major Sela Vaun** — your Directorate handler, voice-on-comms only. Cold, competent, morally elastic. Her orders trend from "defend the town" to "the town is a liability, pull your assets." She is the *finale pressure* personified; she is never wrong about the tactics and rarely right about the people.
- **Rooker** — your quartermaster and Frame mechanic, met on foot at each town's garage (the diegetic face of `Garage.vue`). Ex-Combine, deserted, hates both sides. The one NPC who tells you the truth about what your Frame does to a place.
- **Kestrel** — **[GRAFT: narrative's mirror-antagonist].** A former squadmate, now a Combine ace. She is the Menace you are one bad run from becoming, and the recurring hunt target across the campaign. Her defining trait is a mechanic, not a cutscene: **every town she has taken, she took cleanly — she dismounts, she does not loiter, and her towns do not decay.** The player discovers the game's core moral trick (§4.2) by seeing Kestrel model it. Rooker names it out loud the first time you notice: *"She gets out of the machine. That's the whole secret. You just have to want to."*
- **Five town wardens**, one per settlement, reskinned from the floating quest markers. Each has a distinct relationship to the war (grateful, bitter, opportunist, zealot, broken). Their dialogue tracks their town's `condition` and your standing: a warden at 80% thanks you; the same warden at 20% will not come out of the bunker.
- **Warlord Kass "Rustjaw"** and the other named enemy aces — the finale bosses (`FINALE_BOSS_TITLES` become *people*). Each occupies a town you abandoned. They are the mirror at scale: pilots who also had a Reach to defend and chose the machine over the people.

### 2.4 Town re-skin

`TOWN_NAMES` in `useStoryMode.ts`: `Dunderhollow → Warden's Rest`, `Lower Wobbleton → Sump`, `Crumpetshire → The Kiln`, `Gravy Falls → Longwater`, `Mudpuddle Crossing → Halberd Station`. Same deterministic ring layout (`townSpawnPosition`); the war-scarred visual states are already driven by `condition`.

### 2.5 Structure mapped onto the phase machine

We do **not** widen the `StoryPhase` enum (`'exploring' | 'finale' | 'ended'`). We add a lightweight `chapter` counter and a `storyFlags: Record<string, boolean>` to `StoryRun`, layering three acts on top of existing state.

| Act | Phase | Gate | Beat |
|---|---|---|---|
| **I — Deployment** | `exploring`, `questsCompleted === 0` | First town (Warden's Rest) | Teaches movement, the dismount, one quest of each type. Vaun supportive. You watch the decay meter tick *because you lingered*. |
| **II — The Grind** | `exploring` | Free roam, 5 towns, quest chains | The core loop. You choose which towns to save. Decay is the clock; the **collateral tax** (§3.5) is the per-fight cost. Vaun's orders start carrying moral weight. Kestrel escalates. |
| **III — The Order** | `finale` (auto-flip via `isFinaleUnlocked`, 3 happy towns) | `finaleTargets()` = towns you never saved | Vaun declares the Reach a lost cause and orders a scorched withdrawal. The towns you abandoned are held by the named aces. Reclaim them (defying Command) or leave them. |
| **Tribunal** | `ended` | Last finale town cleared | `StoryCredits.vue` becomes a post-war tribunal record: per-town damage ledger + Hero / Mercenary / Menace / Monster verdict, written as how history and the survivors remember you. |

The finale-unlock count (`FINALE_UNLOCK_HAPPY_TOWNS = 3`) is the central tension: **you cannot save all five before the withdrawal order.** The two you abandon become the aces' strongholds. This is the moral spine, and it is already in the code.

### 2.6 Mission-to-story flow

Every mission is accepted **on foot**, from a warden or the comms post, as a dialogue beat — not a floating marker. Accepting spawns the encounter in the same `StoryWorld` (mount up, drive out). The three existing quest archetypes in `quests.ts` re-skin without touching the generator:
- `wave_defence` → **Hold** — repel a Combine push / salvage raiders. Command-sanctioned, the "clean" fights.
- `hidden_object` → **Recovery** — find a downed pilot's black box, a missing child, a buried munitions cache. **These are the on-foot missions (§4)** — you dismount and search, and the town does not decay while you are out of the cockpit. Low-harm help made literal.
- `boss_hunt` → **Sanction** — kill a named target, sometimes a raider, sometimes a holdout the town loves and Command wants gone. Escalates toward Kestrel.

---

## 3. Gameplay systems

Everything below leads with *how it feels*, then the number. **One currency of consequence** underlies it all: irreversible town condition. Time-in-town spends it (decay), sloppy combat spends it (collateral tax), and death spends it (repair debt). Combat skill is therefore the master mercy.

### 3.1 Movement & feel — the core investment

Today: `baseSpeed = 8 · speedStat · weightPenalty`, `accelRate = 60 · weightPenalty`, exponential per-leg friction, `dash 30·(1+weightPenalty)` for 0.15s, gravity 50, a 3× `useAbility` boost with **no cost**. Serviceable but weightless. All changes live in `PhysicsSystem.ts` / `CameraController.ts` / `MechEntity.ts`, tuned via a newly centralized `constants.ts`.

1. **Momentum you can feel.** Widen the class spread so weight is a *choice*. Light (`weightPenalty ≈ 1.0`): accel ~70, friction ~9 — twitchy, stops on a dime. Assault (`~0.5`): accel ~30, friction ~4 — a beat to spool up, *slides* when you release. Branch friction/accel off the existing `weightClass` field (`MechEntity.ts:462`). Free to tune — the numbers already flow through `weightPenalty`.
2. **Dash i-frames — the skill-expression core.** Grant invulnerability for the 0.15s `dashTimer` window by gating `takeDamage` on the existing `isDashing`/`dashTimer` fields. Dash becomes *the dodge* — the verb that makes a clean, no-hits-taken fight (and therefore a low-collateral fight, §3.5) a matter of skill. Cooldown stays `2.0·(2.0−weightPenalty)` so light mechs get more dodges. Existing FOV kick + shake + thruster burst already sell it.
3. **Boost as a resource.** The 3× boost drains `currentPower` (~40/s) and cannot fire while boosting. **Reuse the already-computed `counterBoostImpact` flag (`PhysicsSystem.ts:97`)**: hard-reversing your boost triggers a screen-shake "brake" + thruster flare — a juke that costs power but breaks pursuit. Power becomes the one real firefight economy.
4. **Footfall and landing weight.** Heavy mechs shake the camera on each footfall (hook off `MechEntity.animateWalk`'s `walkCycle`) and *slam* on landing — shake + a `ParticleSystem` dust ring scaled to fall velocity × weight. Jump-jet landings become a real ground-slam. This is the difference between driving a mech and driving a box.
5. **Camera contrast is the mission.** `CameraController` shoulder distance stays high and heavy for the Frame; on dismount it drops to ~1.7u human eye height and widens FOV (§4). The controller already only *reads* `target.position` and *writes* `target.rotation.y`, so it accepts either entity through a narrow interface.

### 3.2 Damage model — the biggest cheap win

Today every hit is `max(5, mech.stats.firepower/10)` — the **summed** firepower of all parts (`ProjectileSystem.ts:92`), so both arms deal identical damage and the six weapons are cosmetic. Three layered changes at the single choke point.

1. **Per-arm firepower (one line).** Change `mech.stats.firepower` → `armPart.stats.firepower` in `fireWeapon`. The existing catalog instantly balances into distinct identities:

   | Weapon | fp | Cadence | Per-shot | ~DPS | Identity |
   |---|---|---|---|---|---|
   | M61 Autocannon | 50 | 0.12s | 5 | ~42 | Sustained pressure, forgiving |
   | SRM-6 Missile Pod | 100 | 1.0s ×6 | 10×6 | ~60 | Burst alpha, **now homing** |
   | Type-7 Flamer | 240 | 0.4s | 24 + burn DoT | ~60 | Short-range shredder, area denial, **highest collateral** |
   | Mk8 Railgun | 400 | 2.0s | 40 (armor-pierce) | ~20 | One devastating aimed shot; power-hungry |
   | Pile Driver | 320 | 1.5s + lunge | 80 + stagger | high burst | Brawler finisher; the lunge is already coded |

2. **Damage types & resistances.** Extend the choke point `MechEntity.takeDamage(damage)` → `takeDamage(damage, weaponType)`. Map `weaponType` to kinetic / energy / melee and derive per-mech resistances from existing `synergyTags` and mobility/head types: tracked/reinforced = kinetic-resistant, energy-weak; hover/scout = energy-resistant, kinetic-weak; melee resisted only by range. **Drop the flat armor cap from 90% to 75%** so nothing is unkillable and the *type* you bring matters. Loadout becomes a rock-paper-scissors read on enemy composition. **Delete the hot-loop `console.log` in `takeDamage` (~line 384) while here.**
3. **Activate homing missiles for free.** The entire homing path (`targetId`, `homingDelay`, quaternion steering, `PointLight`, smoke trail) already exists in `ProjectileSystem` but is unreachable because no part has `weaponType: 'missile'`. Set `arm-missile-pod` → `weaponType: 'missile'` in `MechParts.ts` and pass the already-plumbed `target` — homing salvos light up with zero new physics code.

### 3.3 Hit locations & part destruction — **[FIX: pulled forward from feel's Phase 4 to Phase 2]**

The judges' single strongest combat note: feel deferred the biggest combat-depth upgrade too late. We pull it forward and adopt **combat's specific delimb consequences**. The loadout is already slot-based (`leftArm`/`rightArm`/`legs`/`head`/`core`); we add per-slot sub-hitboxes and per-slot HP.

> **[FIX — honest scope]** The combat design over-claimed that this "reuses the sub-hitbox resolution already in `checkCollisions`." Verified false: `checkCollisions` resolves a **single cylinder**. Hit locations are **net-new geometry + per-slot HP**, and are scoped as such in Phase 2 (not sold as a free reuse).

| Location | HP source | On destruction |
|---|---|---|
| Left/Right arm | `arm.stats.health ×3` | That weapon stops firing — **defang the gun arm to halve enemy DPS** |
| Legs | `legs.stats.health ×2` | Speed → 40%, no dash/jump — **strand a skirmisher, then take your time** |
| Head | `head.stats.health ×2` | No lock-on, wider spread, targeting bonus lost |
| Core | `maxHealth` | Death |

Every fight becomes a target-priority decision, and *your* build becomes fragile in a specific way. This is also the payoff of the salvage loop (§3.6): a destroyed enemy limb is a part you can strip.

### 3.4 Weapon differentiation & rack abilities — activate what's dormant

- **Rack abilities, finished** (`MechEntity.useRackAbility`, ~line 530, currently a half-empty switch): **smoke** → spawn a `ParticleSystem` cloud that drops `EnemyAI` aim accuracy for any AI whose aim ray crosses it (the escape/anti-sniper tool); **jump-jets** (currently `return false`) → route through the boost/thrust pool; **shield-gen** (currently falls through to a damage-5 sphere) → a held directional 70% frontal block that drains power instead of HP. **Fix the `rack-ammo-feed` `setTimeout`** (~line 545) — make its window `dt`-driven so it respects pause/hitstop.
- **[FIX — no ammo/reload layer].** Feel, narrative, and progression all consciously cut the ballistic ammo/magazine/reload system that combat proposed; the coherence and player lenses flagged it as a second economy that fights the arcade, momentum-forward feel. **Power stays the single combat economy.** The `rack-ammo-feed` ability becomes a fire-rate buff, not a magazine sim. Weapon *sustain* identity comes from power draw and cooldowns (railgun/flamer bite the power bar) — not a reload minigame.

### 3.5 The consequence economy — **[GRAFT: progression's collateral tax]**

Feel's one thin spot (per every judge): moral pressure rode almost entirely on the decay-only mechanic, so combat sat *beside* the moral loop rather than paying into it. We weld them together with progression's grounded hook.

- **`onCollateral` hook.** In `StoryCombat`, the hit/explosion handlers already fire `spawnExplosion` / `onShake` (lines ~429–431). Add an `onCollateral(amount)` callback that the host routes into a **small condition decrement**, mirroring `tickTownDecay`. Explosions, AoE, and stray shots that resolve inside a town during an encounter chip its condition.
- **Skill = mercy, made legible.** Target tuning: a *clean* 3-enemy Hold (dodge well, land shots, end it fast) costs a town ~2–4 condition; a drawn-out, sloppy fight where you tank hits and spray costs ~10–15. Dash i-frames (§3.1) are the skill verb that lets a good pilot keep collateral near zero — this is why the i-frame dodge is the campaign's most important mechanic, not just a feel upgrade.
- **[FIX — the tuning risk].** The player and progression lenses both warned this can backfire: penalize firing near a town too hard and players *flinch from using their best weapons*, making combat feel worse. **We ship it deliberately gentle.** Collateral is dominated by *hits taken and time elapsed*, not by the player firing. Landing your own shots on enemies is never taxed; only stray misses, AoE overspray, and enemy ordnance detonating in the town core register, and each at a small coefficient. The felt message is "end it fast and clean," never "don't shoot."

### 3.6 Enemy design

Today one deep 1v1 duelist (`EnemyAI`, 466 lines, per-difficulty profiles). Two moves:

1. **Generalize the arena to squads.** `BattleScene` hardwires a scalar `enemyMech`; lift it to `enemies: MechEntity[]`. **[FIX — correct the shared over-claim]**: the map (repeated by all four designs) said `EnemyAI.update` "takes arrays" — verified inaccurate; `EnemyAI.update(self, target, dt)` targets **a single player mech** (line ~258). This is fine for **player-vs-squad** (many enemies each targeting the one player), which is exactly what we want; the phrasing is corrected so no one builds many-vs-many expecting it for free. `StoryCombat` already runs multiple enemies, proving the pattern. **[FIX — raise the cap]**: `StoryCombat` currently caps ~2 enemies alive (line ~240); raise it before advertising combined-arms squads.
2. **Archetypes as new `DIFFICULTY_PROFILES` rows + loadouts** (data, not new AI code): **Skirmisher** (hover, autocannon, kites, high dodge), **Line trooper** (bipedal, missile pod, balanced grunt), **Bulwark** (tracked, shield + autocannon, brawl, high armor — a wall you flank or delimb), **Sniper** (quad, railgun, extreme range — teaches cover/smoke), and named **aces** (Kestrel, Kass — `boss` profile at `FINALE_BOSS_SCALE 2.0`, mixed loadout).
3. **[GRAFT: combat's half-health reinforcement script].** Named-ace finale fights get a scripted escalation beat: at half health, the ace calls in a Skirmisher pair (a timed `StoryCombat` re-spawn). Turns a duel into a two-stage encounter and gives the finale bosses a memorable rhythm.
4. **Difficulty = composition.** A Bulwark pinning you while two Skirmishers flank is a real tactics problem — and the payoff of hit locations (§3.3): shoot the Skirmishers' legs to strand them, then take the wall. **Unify the two enemy-generation sources of truth** (`StoryCombat.DIFFICULTY_STATS`/`DIFFICULTY_LOADOUT` and `useMechBattle.generateEnemy`) into one archetype table so they cannot drift.

### 3.7 Progression, economy & stakes on death

- **Salvage economy.** Rename `money` → **Salvage**. **[GRAFT: narrative/combat's salvage-drops-the-enemy's-loadout]** — a killed enemy drops the specific parts from *its* loadout, and destroyed limbs (§3.3) drop scrap. Kill the sniper, take its railgun. This gives combat a concrete pull into the garage and a reason to prioritize a target beyond raw currency. Stored in a new `run.inventory` on `StoryRun`.
- **Two-axis reputation — [GRAFT: narrative's Command vs Town standing].** The player lens explicitly preferred this over feel's single reputation-gated shop for a deeper "who did you serve" loadout choice. Split standing into **Command** and **Town** on `StoryRun`. Command missions raise Command / can lower Town; on-foot Recovery and town defense raise Town / can annoy Command. Command standing unlocks **military hardware** (railgun, fusion core); Town standing unlocks **civilian support** (Rooker's discounts, field repair, raider intel). You cannot max both — the loadout you can afford becomes a statement about who you served.
  > **[FIX — protect the load-bearing gate]** The feasibility lens flagged this as the single riskiest graft: `isFinaleUnlocked` and `happyTownCount` read `standing`, so splitting it could half-strand the moral engine. **Mitigation, mandatory:** the finale gate re-derives off **Town standing only** — `happyTownCount` counts towns whose Town standing hits 100. Command standing is a purely additive second axis that gates *shop tiers*, never the phase machine. The finale math changes by one field reference, not in structure, and is covered by a regression test before ship.
- **Real stakes on death — [FIX: strengthen feel's light-touch downed/eject and route it through the ledger].** Today death is a free full-HP revive. New rule: death = **downed**. Your Frame drops, you eject (briefly the fragile human), and you respawn at the last town. Cost, all spending the *same* consequence currency as loitering and collateral: lose 25% of carried Salvage; the mission fails; the enemies you were fighting **damage the town you were defending** (a decay/standing hit); and any limb destroyed in the lost fight must be re-bought or field-repaired at the garage before you redeploy. Not a hard game-over (every phase stays playable) — the Reach does not kill you, it *bleeds* you.

---

## 4. On-foot town hub — the dismount

This is the emotional keystone and the game's signature contrast. **No on-foot combat** — vulnerability is the entire point, and it is a hard brief constraint.

### 4.1 The dismount moment (feel spec)

Press dismount inside a town (`StoryFrameInfo.insideTownId` is the ready trigger). The Frame's reactor whines down, hydraulics hiss, the ambient rumble stops. The camera **falls** from ~10u shoulder height to ~1.7u human eye level over ~0.8s, FOV widens, and your speed collapses from tens of u/s to a ~4u/s walk. No screen shake. No weight. Everything goes quiet and small. The town that cowered from your machine is suddenly at your scale, and the survivors are taller than you expected. That drop — from god to person — is the beat the whole game is built to deliver.

### 4.2 The rule that makes the dismount load-bearing — **[GRAFT: progression + narrative's decay-pauses-on-foot]**

**[FIX — feel's biggest gap]** Every judge flagged the same hole: feel's dismount was emotionally spec'd but *mechanically optional* — nothing but story pulled you out of the cockpit, so an optimizing player would skip the signature feature. The fix, converged on by progression and narrative independently and named the field's best mechanic-tone fusion:

**While you are on foot, the town does not decay.** The reactor idles, the weight is off the ground, the heat signature drops. The low-collateral act (park, walk, talk) is the *same act* that stops hurting the town. Looming in your mech to shop or chat bleeds condition; stepping out does not. On-foot is thereby wired into the consequence economy, not bolted beside it. And it is the trick **Kestrel** already uses (§2.3) — her towns are clean because she dismounts — so the player learns the game's core mercy by discovering how the antagonist stays clean. Recovery missions (§2.6) are performed on foot, which makes on-foot content *also* the lowest-harm way to help: cohesion, not a chore.

### 4.3 Implementation path

- **Player abstraction (the one real refactor).** Introduce `interface PilotableEntity { position; rotation; velocity; mesh; update(dt) }`. `MechEntity` implements it as-is; add a small `OnFootEntity`. `CameraController.target` already only reads `.position` / writes `.rotation.y`, so it accepts either — just lower `MIN/MAX_DISTANCE` and shoulder offsets for the human.
- **Reuse `InputManager` unchanged** (entity-agnostic WASD/look/touch).
- **`OnFootPhysics`** (sibling to `PhysicsSystem`): walk ~4u/s, terrain-follow via the existing `setGroundHeightProvider(terrain.heightAt)`; no weight/dash/jump-jets; firing disabled. A gentle head-bob is the only juice.
- **`StoryWorld.dismount()/mount()`** mirrors the proven `applyLoadout()` pattern (dispose/rebuild mesh, repoint `camera.target` + scene). The Frame parks at the town gate as a mount point.

### 4.4 Town layout (pedestrian scale)

`Town.ts` today is one decorative `THREE.Group` with no colliders or interiors — a walkable town is genuine new spatial work, scoped as such. A pedestrian-scale main street, no walkable interiors (doorways are proximity panels):
- **The gate** — your parked Frame / mount point.
- **Rooker's garage** — opens `Garage.vue` on foot; buy / equip / sell salvage / field-repair limbs.
- **The comms post** — Vaun's briefings + the mission board.
- **The warden's house** — story dialogue and quest acceptance.
- **The commons** — survivors (the existing townsfolk capsules become NPC anchors), whose count and state already thin as `condition` decays.

### 4.5 What you DO on foot, and how it feeds the loop

Reuse the `QUEST_GIVER_RADIUS` proximity + E-prompt pattern for "talk" / "enter." On foot you **accept missions** (dialogue grown in `QuestDialog.vue`, today a one-line flavor string, into a small branching tree; choices set `storyFlags`, gate lines by Command/Town standing, and let you *refuse* a Command order in Act III), **shop and repair** (`Garage.vue`), **run Recovery searches** (`searchRadius` already exists), and **read the town's mood** (warden and survivor dialogue keyed to `condition`/standing — a decayed town's people are the moral feedback). Walking past rubble *you* caused, at eye level, is the payoff the top-down mech view cannot deliver. Everything you do on foot feeds a mission, the economy, or the narrative.

---

## 5. Phased implementation plan

Each phase leaves the game **playable and strictly better**. All paths are live-tree (`apps/mech/frontend/src/…`) — never `frontend/lib/battle`.

### Phase 1 — Weapons That Matter + The Feel Pass
**Goal:** make every step and every fight feel dramatically better on day one, with zero new content or screens. This is the winning front-loaded feel bet — the dodge, the weight, and distinct weapons all land immediately.

**Work items:**
- `lib/battle/ProjectileSystem.ts` — per-arm firepower (change `mech.stats.firepower` → firing `armPart.stats.firepower` at line ~92); pass `target` through to activate the dormant homing path.
- `shared/data/MechParts.ts` — set `arm-missile-pod` → `weaponType: 'missile'`; add `damageType` (kinetic/energy/melee) and per-part resistance fields.
- `lib/battle/MechEntity.ts` — `takeDamage(damage, weaponType)` + typed resistances; drop the armor cap 90%→75%; add flamer burn DoT; **dash i-frames** (gate `takeDamage` on `isDashing`/`dashTimer`); finish `useRackAbility` (smoke / jump-jets / shield-gen); fix the `rack-ammo-feed` `setTimeout` → `dt`-driven; **delete the hot-loop `console.log` (~line 384)**.
- `lib/battle/PhysicsSystem.ts` — momentum spread by `weightClass`; boost-as-power-cost + `counterBoostImpact` juke (line ~97); footfall/landing shake hooks; **delete the dead `updateEnemyAI` (`ARENA_HALF` ReferenceError)**.
- `lib/battle/CameraController.ts` — weight-scaled footfall/landing camera dip.
- `lib/battle/constants.ts` — centralize accel/gravity/dash/friction (currently only 2 values).
- `lib/battle/EnemyAI.ts` — add archetype rows to `DIFFICULTY_PROFILES` (data only).
- Tests: extend `lib/story/__tests__/` with a per-weapon-damage + resistance unit suite.

**Playable result:** Build & Battle and Story combat both play like a different game — six weapons feel distinct, missiles home, shields block, the dash is a real dodge, and the heavy mech feels like a freight train. No story or save changes yet.

### Phase 2 — Squads, Hit Locations & Salvage
**Goal:** raise the combat-depth ceiling — fights become tactics problems, bodies come apart, and killing specific enemies feeds the garage. Pulled forward from feel's original Phase 4 per the player lens.

**Work items:**
- `lib/battle/BattleScene.ts` — generalize scalar `enemyMech` → `enemies: MechEntity[]` (player-vs-squad; `EnemyAI` targets the single player mech, which is exactly the shape needed).
- `lib/story/StoryCombat.ts` — **raise the ~2-alive enemy cap (line ~240)**; add the half-health reinforcement script for named aces; wire the `onCollateral` groundwork on `spawnExplosion`/`onShake` (consumed in Phase 3).
- `lib/battle/ProjectileSystem.ts` + `MechEntity.ts` — per-slot sub-hitboxes in `checkCollisions` (net-new cylinder→multi-slot geometry) + per-slot HP; delimb consequences (arm→weapon dead, legs→strand, head→no lock-on).
- `lib/battle/EnemyAI.ts` + `composables/useMechBattle.ts` — combined-arms compositions; **unify the two enemy-generation sources of truth** into one archetype table.
- `composables/useStoryMode.ts` — add `run.inventory`; salvage drops the killed enemy's loadout parts + scrap from destroyed limbs. **Bump save `version: 1 → 2` and FIX `deserializeRun`'s `version !== 1` hard-reject (line ~430)** with a migration, or old saves silently fail to load.
- `components/mech/story/Garage.vue` — install/repair salvaged parts.

**Playable result:** combined-arms squad fights and limb-shooting in both the arena and story; you can defang a Bulwark's gun arm, strand a Skirmisher, and strip a downed sniper's railgun into your garage. Saves migrate cleanly.

### Phase 3 — The Campaign Spine & Consequence Economy
**Goal:** the game reads as gritty military sci-fi with named characters and real stakes, and combat now *pays into* the moral loop.

**Work items:**
- `composables/useStoryMode.ts` — new `TOWN_NAMES`; add `chapter` + `storyFlags` to `StoryRun` (**bump `version: 2 → 3`, extend `deserializeRun` migration**); **collateral tax** — route `StoryCombat.onCollateral` into a gentle condition decrement mirroring `tickTownDecay` (§3.5 tuning: dominated by hits-taken/time, never by the player landing shots); **two-axis Command/Town reputation** (rename `money` → Salvage; **re-derive `happyTownCount`/`isFinaleUnlocked` off Town standing only** — regression-tested); reputation-gated shop tiers; **death stakes** (`handlePlayerDefeated`: downed/eject, 25% salvage loss, town decay/standing hit, limb re-buy).
- `lib/story/quests.ts` — authored military `QuestDef` flavor + character/dialogue fields (replace whimsical strings); reputation reward scaling; Recovery/Hold/Sanction re-skin.
- `components/mech/story/` — `QuestDialog.vue` → branching dialogue tree (flags, Command/Town gating, refusable Act III orders); `TownHud.vue` surfaces both reputation axes + a decay warning while in-mech; `StoryCredits.vue` → tribunal ledger + reframed verdict.
- `components/pages/StoryModePage.vue` — orchestrate the above; Vaun comms beats; Kestrel escalation hooks; `handlePlayerDefeated` wiring.
- `lib/story/quests.ts` + `useStoryMode.ts` — `FINALE_BOSS_TITLES` become named aces (Kass, Kestrel) occupying abandoned towns; abandonment in Act II directly seeds Act III.

**Playable result:** a tone-complete campaign with named characters, a "who did you serve" loadout choice, a legible skill-is-mercy combat economy, and death that costs — all still in-Frame. The finale gate provably still works after the reputation split.

### Phase 4 — The Dismount
**Goal:** deliver the signature contrast and make leaving the cockpit strategically *and* thematically load-bearing.

**Work items:**
- New `lib/battle/PilotableEntity.ts` interface; new `lib/story/OnFootEntity.ts` + `lib/story/OnFootPhysics.ts`.
- `lib/battle/CameraController.ts` — target-interface acceptance + human offsets + the ~0.8s drop transition.
- `lib/story/StoryWorld.ts` — `dismount()/mount()` mirroring `applyLoadout()`, gated on `insideTownId`; **pause decay while on foot** (§4.2, the keystone).
- `lib/story/Town.ts` — pedestrian colliders, building anchors (gate/garage/comms/warden/commons), NPC anchors on the townsfolk capsules.
- `components/mech/story/` + new `TownHub*` components — NPC talk UI, mission board; make `Garage.vue`/`QuestDialog.vue` reachable on foot; Kestrel-mirror reveal (Rooker's line when you first notice her towns are clean).
- `lib/story/quests.ts` — Recovery (`hidden_object`) missions run on foot, decay-free, using `searchRadius`.

**Playable result:** the god-to-person drop is live; missions are accepted by a person in a town; getting out of the machine is the only way to be present without cost; and the player discovers the campaign's core mercy by seeing how Kestrel keeps her towns clean.

### Phase 5 (optional / stretch) — Mission Variety & Meta
**Goal:** sustain moment-to-moment variety across a full campaign and pick up free wins.

**Work items:**
- `lib/story/StoryCombat.ts` + `quests.ts` — new mission types on the multi-enemy core: **escort a convoy**, **hold under waves**, **extraction under a timer**, **hunt a marked ace** (new `QuestType` entries + handlers; escort/extraction are genuinely new pathing/objective code — sequenced last for that reason).
- `public/models/` — drop-in real `.glb` files for a zero-code visual upgrade (pipeline + `MODEL_ATTACH_POINTS` already exist).
- Optional Ironman flag; optional account-backed saves via the existing `useAuthStore` JWT hook; optional New Game+.

**Playable result:** the campaign has real mission variety beyond arena fights, plus optional visual and meta upgrades — none of which block the core experience.

---

## 6. What we deliberately cut — and why

- **On-foot combat.** The whole emotional weight of the dismount is *powerlessness*. Give the human a gun and you delete the contrast that justifies the feature — and it is a hard brief constraint. Cutting it is a feature.
- **An ammo / reload layer.** Three of four designs cut it and the coherence and player lenses flagged it as a second economy that fights the arcade, momentum-forward feel. **Power stays the single combat economy;** `rack-ammo-feed` is a fire-rate buff, not a magazine sim. Weapon sustain identity comes from power draw and cooldowns.
- **A separate heat system.** `currentPower` + per-weapon cooldowns already give the railgun and flamer their "spend it wisely" bite. A second resource bar is UI noise; fold heat into those cooldowns.
- **A branching multi-ending narrative tree.** The moral weight comes from the *systems* — decay you cause, the collateral tax, the two reputation axes, the dismount rule — far more than from branch bookkeeping. We keep the **verdict axis** as the ending framework and resist a combinatorial flag explosion. A system that judges you honestly beats a tree of scripted forks.
- **A parallel XP / skill tree.** Progression rides the part/loadout/salvage economy and reputation-gated shops. A parallel pilot-XP track would fight the "your machine *is* your build" fantasy that hit locations and salvage are built to sell, and double the tuning surface.
- **Walkable interiors.** Doorway proximity-panels get ~90% of the hub value for ~10% of the spatial work; `Town.ts` is colliderless today and interiors would balloon the dismount phase. Cut, revisit if the hub sings.
- **Multiplayer / co-op campaign.** The brief says MP must keep working, not grow. Story stays entirely offline (as today), and the netcode's known half-built seams (dead abilities, ack stub, `player2` null risk, `aiMechs` render gap, no tick accumulator) are left untouched so a non-goal never destabilizes a shipping system.
- **Deleting the dead `frontend/lib/battle` tree.** Tempting hygiene and a real wrong-copy trap, but out of scope for a design that must keep shipping. Noted as a one-time cleanup so no one edits the wrong copy.
- **Bespoke art & audio.** Everything ships on the existing procedural pipeline and current sounds. The `public/models/` GLB drop-in is a zero-code future win, not a dependency — and Phase 1 stops the 6 wasted 404 fetches per mech load regardless.

**The through-line:** every system we touch bends toward one sentence the player should feel by the tribunal — *I was the only thing that could save this place, and I am the reason it needs saving.* Decay is that sentence as an ambient meter; the collateral tax is that sentence in your trigger discipline; the dismount rule is that sentence as a choice; the two-axis rep is that sentence as a loadout; the verdict reads it back. Combat is just what happens when you cannot talk your way out — and the overhaul is mostly a matter of activating what is already dormant in the tree and pointing it at a grittier fiction.