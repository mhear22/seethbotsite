# Mech Story Mode — Design Outline (DRAFT for review)

> Status: **IN IMPLEMENTATION (v1).** User greenlit a one-go build. The open
> questions below were resolved with the defaults in **§0 Resolved decisions**;
> the **[Q#]** markers are retained for traceability and future tuning. Anything
> can still be changed after v1 lands.

## 0. Resolved decisions (v1)

| # | Decision (v1) |
|---|---|
| Q1 | **5 towns**, scattered on one open map |
| Q2 | **One open map** (single persistent scene; towns are regions; enemies spawn in-world near towns). Reuses single-player `BattleScene` with a large ground and no arena walls. |
| Q3 | Buildings degrade too (intact → damaged → rubble) |
| Q4 | "Happy" = quest **standing** only, **independent** of physical damage (the tragedy: you can save a town's standing while wrecking it) |
| Q5 | Decay trigger = **(a) player mech presence** within a town's radius (proximity-gated) |
| Q6 | Condition floors at **0** (fully destroyable) so the damage tally has range |
| Q7 | Decay is **permanent** (one-way ratchet) |
| Q8 | **3 quests** per town chain |
| Q9 | Ambient decay is the only pressure (no separate per-quest fail timers) |
| Q10 | Starter = lightest valid chassis + one basic weapon, low stats; **ignores builder loadout** |
| Q11 | **Garage openable near any town** from the town HUD (buy/equip parts) |
| Q12 | Part prices **tiered by power**; strong parts affordable only after several quests |
| Q13 | Finale targets = the towns you **didn't help** (dynamic), occupied by strong opponents |
| Q14 | End screen shows per-town damage report **+ a verdict/grade** from total damage |
| Q15 | **Single** save slot (localStorage) |
| Q16 | Tone = playful, matching the site's humor; funny town names |
| Q17 | **Fully local** (localStorage); no backend/server changes |

Decay rate (Q6): ~10 real minutes 100→0 while present ≈ **0.167 condition/sec**,
accruing only inside the town radius.

## 1. Pitch

A single-player, run-based **open-world story campaign** for the Mech game. You
start with a bare-bones mech and **build it up over the run** using money earned
from quests. You roam a map dotted with small towns; each town has a quest giver
offering jobs (wave defence, find a hidden object, kill a nearby boss). But your
mech is a walking disaster — **the longer you linger near a town, the more it
decays**: farms wither, townsfolk vanish. Help **at least three towns**, and the
campaign opens its finale: hunt down the strong opponents occupying the remaining
towns. Beat them and the game ends — the **credits tally how much damage each
town took** under your watch.

The emotional hook: you are simultaneously a town's only hope *and* its slow
ruin. Efficiency (get in, do the job, leave) is rewarded; loitering is punished.

## 2. Core loop

```
START run
  └─ choose Story Mode (ignores any pre-built mech; you start with a Starter chassis)
OVERWORLD (drive/roam between towns)
  └─ enter a town → talk to quest giver → accept a quest
       ├─ Wave Defence (protect town from incoming AI mechs)
       ├─ Hidden Object (search the area for a concealed item)
       └─ Boss Hunt (defeat a strong enemy mech nearby)
  └─ complete quest → earn money + advance that town's quest chain
  └─ spend money at a town garage → buy/equip parts (build your mech mid-run)
  └─ MEANWHILE: every town near which you are active decays in real time
WIN CONDITION
  └─ when ≥3 towns are "happy" → finale quest unlocks: clear strong opponents
     occupying the other towns
  └─ finish finale → END
CREDITS
  └─ per-town damage report (how wrecked each town got) + run stats
```

## 3. Systems

### 3.1 The world map (overworld)
- An **open map** larger than the current arena, with **several towns** (target:
  **5 towns** — enough that "help 3, then clear the rest" works). **[Q1]**
- Player pilots the mech across the open terrain between towns (same controls as
  battle: WASD + dash + jump). Enemies/bosses live out in the world near towns.
- **[Q2 — biggest technical question]** The current battle is a bounded arena
  (`MapRenderer` + fixed arena bounds, server-authoritative only in MP). Story
  mode is single-player and client-only, so we can extend the *single-player*
  `BattleScene` path. Two feasible approaches:
  - **A. One large open map** (single scene, towns are regions within it).
    Most "open world" feeling; heavier to build/perf-tune.
  - **B. Hub overworld + instanced encounters** (a simpler navigable map where
    towns are nodes; entering a quest loads a focused encounter area). Much less
    risk, reuses existing arena tech per encounter, still reads as a world map.
  - *Recommendation:* start with **B** (lower risk, ships faster), with the map
    styled as a continuous space so it still feels open. Revisit A later.

### 3.2 Towns
- Each town has: **a couple of buildings**, **2 farms**, **a population of
  townsfolk** (small crowd of simple figures), and **one quest giver** (a marker
  you walk up to / interact with).
- Town **health/state** is tracked as a 0–100 "condition" (100 = thriving,
  0 = ruined). Visual states tied to thresholds:
  - **Farms**: green/crops → wilting → dead dirt as condition drops.
  - **Townsfolk**: full crowd → thinning → gone (people "disappear").
  - **Buildings**: intact → scorched/damaged → rubble (optional tiers). **[Q3]**
- Town also has a **mood/standing** toward you (separate from physical condition):
  rises when you complete its quests, so a town can be *physically battered* but
  still *grateful* — or pristine but indifferent. "Happy" (for the win condition)
  = standing ≥ threshold, **[Q4]** *independent of* physical damage (or do we want
  damage to cap how happy they can be? **[Q4]**).

### 3.3 Decay (the signature mechanic)
- **Trigger:** while the player mech is **active near a town** (within a decay
  radius), that town's condition ticks **down** in **real time**.
  - **[Q5 — please confirm the trigger.]** Options:
    - (a) *Mere presence* — just being near town decays it (your mech is
      destructive to be around). Simplest, matches "as a mech stays active near
      it."
    - (b) *Combat only* — decay accrues only while fighting near town.
    - (c) *Enemy presence* — decay accrues while hostile mechs are near town and
      you haven't cleared them (you're the savior, not the cause).
  - The brief ("each town slowly get destroyed as **a mech** stays active near
    it" + "only count up as you are there") most directly reads as **(a)**:
    proximity-gated, your-presence-driven. Outline assumes (a) unless you say
    otherwise.
- **Rate:** ~**10 real minutes** from full (100) to "bad" — define "bad" as a low
  threshold, e.g. condition ≈ 15 ("bad" but not 0). So ≈ **(100−15)/600s ≈
  0.14 condition/sec** while present. **[Q6]** (Do you want it to bottom out at 0
  = fully destroyed, or floor at "bad"?)
- **Accumulates only while present** — a per-town timer that advances only when
  the player is inside that town's radius; pauses when you leave. Persisted so it
  resumes where it left off when you return.
- Multiple towns each have their **own** independent decay timer.
- **[Q7]** Should farms/people ever **recover** over time when you're away, or is
  decay permanent (a one-way ratchet)? Permanent makes the finale tally
  meaningful; recovery makes it gentler. Outline assumes **permanent**.

### 3.4 Quests
- Each town's quest giver offers a **quest chain** (sequence). Completing the
  current quest pays out and unlocks the next in that town's chain. **[Q8 — how
  many quests per chain?** Outline assumes **3 per town**.]
- Quest types (mix across towns):
  1. **Wave Defence** — survive/clear N escalating waves of AI mechs attacking
     the town. *Reuses the new single-player survival/wave engine* (`EnemyAI`,
     `WaveManager`-style escalation, `BattleScene.respawnEnemy`).
  2. **Hidden Object** — a concealed item somewhere in/around the town area;
     find and retrieve it (proximity reveal / simple search). Light exploration.
  3. **Boss Hunt** — a single strong, hand-tuned enemy mech near the town
     (reuses the boss difficulty profile + scaled stats). The "very strong boss
     nearby."
- A town's **standing** rises on each completed quest; finishing its chain makes
  it "happy."
- **[Q9]** Do quests have **time pressure** beyond the ambient decay (e.g. wave
  defence fails if the town drops below X condition mid-fight)? Tension lever
  worth considering. Outline assumes no separate timer — decay is the pressure.

### 3.5 Economy & mech building during the run
- You **start with a fixed weak Starter mech** (Story Mode **ignores your
  builder loadout** — confirmed by the brief). **[Q10 — define the Starter:**
  outline assumes the lightest valid chassis + one basic weapon, low stats.]
- Quests pay **money**. Money is spent at a **garage** (in towns / a home base
  **[Q11]**) to **buy parts** from the existing `MechParts` catalogue and
  re-equip slots — this is how you progress your mech across the run.
- **[Q12]** Are parts **gated/priced by tier** (cheap early, expensive bosses-
  enable later) so progression paces with difficulty? Outline assumes yes:
  part cost scales with its power; better parts affordable only after several
  quests.
- Reuse `useMechBuilder` validation (no energy deficit, ≥1 weapon) so mid-run
  builds stay legal.

### 3.6 Finale & win condition
- When **≥3 towns are happy**, the quest giver(s) / a story beat unlocks the
  **finale**: the remaining (un-helped) towns are **occupied by strong
  opponents** — go town to town and **take them out**.
- **[Q13]** Are the finale targets the towns you *didn't* help (so helping more
  than 3 reduces the finale), or always a fixed set? Outline assumes: finale =
  clear strong opponents in **every town you haven't already cleared/helped**.
- Defeating the last finale opponent **ends the game** → credits.

### 3.7 Credits & scoring
- Credits roll showing a **per-town damage report**: each town's final condition
  / total damage taken (e.g. "Greenhollow — 62% destroyed, 14 residents lost"),
  plus run stats (towns helped, quests done, bosses killed, money earned, total
  real-time elapsed). **[Q14 — any letter grade / overall score** derived from
  total town damage? A "you were a hero / you were a menace" verdict reads well.]

## 4. Data model (sketch)

```ts
type TownId = string
interface TownState {
  id: TownId
  name: string
  position: Vec3            // location on the overworld
  condition: number         // 0..100 physical health (one-way down, [Q7])
  standing: number          // 0..100 mood toward player
  decaySecondsAccrued: number   // advances only while player is present
  farms: { alive: number; total: number }
  population: { current: number; initial: number }
  questChain: QuestId[]
  questIndex: number        // progress through the chain
  happy: boolean            // standing >= threshold
  cleared: boolean          // finale opponent defeated (or town helped)
}
interface Quest {
  id: QuestId
  townId: TownId
  type: 'wave_defence' | 'hidden_object' | 'boss_hunt'
  reward: number
  params: ...               // wave count / object location / boss loadout+difficulty
  state: 'locked' | 'available' | 'active' | 'complete'
}
interface StoryRun {
  money: number
  loadout: MechLoadout      // the mech you are building this run
  towns: Record<TownId, TownState>
  phase: 'exploring' | 'finale' | 'ended'
  startedAt; realElapsedSec
}
```
- Persist `StoryRun` to **localStorage** (single active run; mirrors the existing
  client-side persistence pattern). **[Q15 — one save slot, or allow multiple
  runs?** Outline assumes one.]
- All **single-player & client-only** — **no server / multiplayer / netcode
  changes**, so it can't destabilize PvP or co-op survival.

## 5. Reuse map (what exists vs what's new)

**Reuse:**
- `BattleScene` (single-player path), `MechEntity`, `ProjectileSystem`,
  `ParticleSystem`, `CameraController`, `InputManager`, the new combat-feel VFX.
- `EnemyAI` + difficulty profiles + the survival/wave logic (for Wave Defence &
  Boss Hunt).
- `MechParts`, `useMechBuilder` (Starter + garage purchasing + validation).
- `MapRenderer` styling for the overworld / encounter areas.

**New:**
- `useStoryMode` composable (run state machine, save/load, money, decay ticking).
- Overworld map + town entities (buildings, farms, townsfolk, quest-giver
  markers) with condition-driven visual states.
- Quest system (definitions, activation, completion checks per type).
- Garage/shop UI for buying parts mid-run.
- Quest-giver dialogue UI + town HUD (condition, standing, active quest).
- Finale orchestration + credits/damage-report screen.
- A "Story Mode" entry on the start/mode-select screen.

## 6. Suggested implementation phases (after sign-off)

1. **Skeleton:** Story Mode entry, `useStoryMode` run state, Starter mech, a map
   with towns as nodes, free-roam between them (approach B), localStorage save.
2. **Decay system:** per-town proximity timer, condition→farms/people/buildings
   visual states, town HUD.
3. **Quests v1:** quest giver + dialogue, Wave Defence (reuse wave engine),
   reward money, quest chain progression, standing/"happy".
4. **Economy:** garage UI, buy/equip parts mid-run, tiered pricing.
5. **Quests v2:** Hidden Object + Boss Hunt.
6. **Finale:** unlock at ≥3 happy towns, clear remaining towns, end trigger.
7. **Credits:** per-town damage report + run-stats + verdict.
8. **Polish/balance:** decay rate tuning, economy curve, difficulty, audio.

## 7. Open questions (consolidated — please answer/adjust)

- **[Q1]** Number of towns (outline: 5).
- **[Q2]** Overworld approach: A (one big open map) vs **B (hub + instanced
  encounters, recommended)**.
- **[Q3]** Do buildings visually degrade too, or just farms + people?
- **[Q4]** Is "happy" purely from quest standing, or capped by physical damage?
- **[Q5]** **Decay trigger: (a) your presence / (b) combat only / (c) uncleared
  enemies near town.** (Outline assumes **a**.)
- **[Q6]** Does condition bottom out at 0 (fully destroyed) or floor at "bad"?
- **[Q7]** Is decay permanent, or do towns recover when you leave?
- **[Q8]** Quests per town chain (outline: 3).
- **[Q9]** Separate per-quest fail timers, or is ambient decay the only pressure?
- **[Q10]** What's the Starter mech?
- **[Q11]** Garage location: every town, or a home base?
- **[Q12]** Tiered/priced part progression — yes?
- **[Q13]** Finale targets = the towns you didn't help (dynamic) vs fixed set?
- **[Q14]** End-screen verdict/grade from total town damage?
- **[Q15]** Single save slot vs multiple runs?
- **[Q16]** Tone/setting & naming (town names, quest-giver flavor) — any vibe you
  want (gritty? comedic, matching the site's humor?).
- **[Q17]** Should story progress feed the existing stats/achievements backend,
  or stay fully local?

---
*Next step: you review/edit this outline (especially the [Q] items), then we lock
it and start at Phase 1.*
