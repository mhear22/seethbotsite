import { ref, computed } from 'vue'
import type { MechLoadout } from './useMechBuilder'
import type { CombatStats } from '../lib/battle/MechEntity'
import type { ArmPart, CorePart, LegsPart, HeadPart, RackPart, MechPart } from '../shared/types/MechTypes'
import {
  ARM_PARTS,
  CORE_PARTS,
  LEGS_PARTS,
  HEAD_PARTS,
  findPartById,
} from '../shared/data/MechParts'
import {
  currentQuest as currentQuestDef,
  buildFinaleBoss,
  partPrice,
  partPowerScore,
  slotsForPart,
  isWeaponArm,
  type QuestDef,
  type ShopSlot,
} from '../lib/story/quests'
import {
  evaluateChoice,
  type DialogueChoice,
  type ChoiceEvaluation,
} from '../lib/story/dialogue'

// ============================================================================
// Constants (v1 tuning — see docs/STORY_MODE_DESIGN.md §0)
// ============================================================================

/** localStorage key for the single active run (Q15). The key is the *slot*, not
 *  the schema version — it stays stable across version bumps so `deserializeRun`
 *  can read an older payload from the same slot and migrate it in place. */
export const STORY_SAVE_KEY = 'mech-story-v1'

/** Current save schema version.
 *  v1 -> v2 adds `run.inventory` (Phase 2 salvage).
 *  v2 -> v3 (Phase 3): renames `money` -> `salvage`, adds `chapter`,
 *  `storyFlags`, and the two-axis `commandRep`/`townRep`. */
export const SAVE_VERSION = 3 as const

// ---- Salvage economy tuning (Phase 2 §3.7). Documented defaults where the
// design left the numbers open. ----

/** Scrap (salvage currency) granted per unit of a killed enemy's total part power. */
export const SALVAGE_SCRAP_PER_POWER = 0.15
/** Minimum scrap paid for any kill, so a stripped-down enemy still pays out. */
export const SALVAGE_SCRAP_FLOOR = 20
/** Chance an *intact* enemy slot drops its part (pristine) on kill. */
export const SALVAGE_INTACT_DROP_CHANCE = 0.25
/** Chance a slot the player *destroyed* drops its part (damaged) on kill.
 *  Phase 3 counterweight (deferred P2 finding): lowered 1.0 -> 0.85 so a
 *  free-install salvage wreck is no longer *guaranteed* — you still usually
 *  keep the limb you shot off, but not every time, which (with the fitting fee
 *  + reputation-gated shop tiers + death repair debt) stops salvage from
 *  collapsing the garage economy. */
export const SALVAGE_DESTROYED_DROP_CHANCE = 0.85
/** Repair fee for a damaged part, as a fraction of its shop price. */
export const REPAIR_PRICE_FRACTION = 0.35
/** Sell refund fraction of shop price for a pristine inventory part. */
export const SELL_PRICE_FRACTION_PRISTINE = 0.4
/** Sell refund fraction of shop price for a damaged inventory part. */
export const SELL_PRICE_FRACTION_DAMAGED = 0.2
/** Scrap fitting fee to install an inventory part, as a fraction of shop price.
 *  Phase 3 counterweight: even a *free* salvaged part costs a little to bolt on,
 *  so hoarding wrecks and swapping loadout every fight is no longer costless. */
export const INSTALL_FITTING_FEE_FRACTION = 0.1

// ---- Two-axis reputation (Phase 3 §3.7). Command vs Town, both 0..100. ----

/** Reputation floor / ceiling / neutral start (both axes begin at REP_START). */
export const REP_MIN = 0
export const REP_MAX = 100
export const REP_START = 50

/**
 * ── The reputation / shop split (design §3.7) ─────────────────────────────
 * Two DIFFERENT gates, deliberately kept separate:
 *   • PER-TOWN `standing` (0..100, earned by that town's quest chain) gates
 *     stock DEPTH — how deep a garage's shelves go (tiers T1/T2/T3). A town you
 *     have helped opens up its rarer stock. This is LOCAL.
 *   • GLOBAL `commandRep` / `townRep` gate PRICE modifiers and RARE/restricted
 *     hardware — military parts need Command standing, civilian/support parts
 *     need Town standing, and your rep on the matching axis discounts (or
 *     surcharges) them. This is GLOBAL and follows you between towns.
 * Neither axis touches the finale gate (that is per-town `standing` only — see
 * isFinaleUnlocked + the regression test).
 */

/** Per-town standing at/above which garage stock tier 2 / tier 3 unlocks. */
export const SHOP_TIER_T2_STANDING = 60
export const SHOP_TIER_T3_STANDING = 80

/** Global commandRep needed to buy restricted military hardware (railgun, fusion). */
export const MILITARY_REP_UNLOCK = 65
/** Global townRep needed to buy restricted civilian/support hardware (repair, shield). */
export const CIVILIAN_REP_UNLOCK = 65
/** Max price swing from rep on a part's axis: ±this fraction (rep 100 -> -20%, rep 0 -> +20%). */
export const REP_PRICE_SWING = 0.2

// ---- Collateral tax (Phase 3 §3.5). GENTLE by design. ----

/**
 * ── The collateral severity contract (design §3.5) ────────────────────────
 * `applyCollateral(run, townId, severity)` converts an abstract "severity"
 * budget into a small, one-way town-condition decrement (mirrors tickTownDecay).
 *
 * The integrator (StoryCombat / StoryModePage) is responsible for EMITTING
 * severity, and MUST feed it from the design's event mix — collateral is
 * dominated by **hits the player takes** and **combat-seconds spent near town**,
 * and is NEVER driven by the player landing shots or by kill explosions:
 *
 *   severity source                         per-event severity   taxed?
 *   ─────────────────────────────────────   ──────────────────   ──────
 *   an enemy hit landing on the player      PER_PLAYER_HIT (1.0)   YES
 *   each second of active combat near town  PER_COMBAT_SECOND(.35) YES
 *   the player landing a shot on an enemy   0                      NO
 *   an enemy/kill explosion detonating      0                      NO
 *
 * Each emitted event is distance-tapered toward the town centre at emission
 * (StoryCombat.emitCollateral) before reaching applyCollateral. Calibrated so a
 * clean fast fight costs a town < 1 condition and a full sloppy fight < ~8 (see
 * the collateral test, which models both mixes against these coefficients).
 */
export const COLLATERAL_CONDITION_PER_SEVERITY = 0.25
export const COLLATERAL_SEVERITY_PER_PLAYER_HIT = 1.0
export const COLLATERAL_SEVERITY_PER_COMBAT_SECOND = 0.35
/** Explicitly zero — landing your own shots is never taxed (design §3.5 FIX). */
export const COLLATERAL_SEVERITY_PER_PLAYER_SHOT = 0
/** Explicitly zero — kill/AoE explosions are never taxed (the disposable P2 shape). */
export const COLLATERAL_SEVERITY_PER_ENEMY_KILL = 0

// ---- Death stakes (Phase 3 §3.7). Downed, not game-over. ----

/** Fraction of carried salvage lost when the player's Frame is downed. */
export const DEATH_SALVAGE_LOSS_FRACTION = 0.25
/** Condition the defended town loses when you go down (enemies overrun it). */
export const DEATH_TOWN_CONDITION_HIT = 8
/** Per-town standing lost when you fail its defence by being downed. */
export const DEATH_STANDING_HIT = 10

/** Number of towns scattered across the open map (Q1). */
export const TOWN_COUNT = 5

/** Condition decay per real second while the player is inside a town's radius
 *  (Q5/Q6: ~10 real minutes from 100 → 0). Permanent, one-way (Q7). */
export const DECAY_PER_SECOND = 0.167

/** Standing needed for a town to count as "happy" toward the finale (Q4). */
export const HAPPY_STANDING_THRESHOLD = 100

/** Number of happy towns required to unlock the finale (Q13/§2 win condition). */
export const FINALE_UNLOCK_HAPPY_TOWNS = 3

/** Quests per town chain (Q8). Standing rises by 100/3 per completed quest. */
export const QUESTS_PER_CHAIN = 3

/** World-space radius (XZ) within which a town accrues decay while the player is near. */
export const TOWN_DECAY_RADIUS = 60

/** Half-extent of the square open world (matches StoryWorld ground / physics bounds). */
export const WORLD_HALF_EXTENT = 600

// ============================================================================
// Data model (see design doc §4)
// ============================================================================

export type TownId = string
export type StoryPhase = 'exploring' | 'finale' | 'ended'

/**
 * Narrative act, layered on top of the (unchanged) phase machine — design §2.5.
 * Derived from phase + progress, never a fourth independent state:
 *   act1 (Deployment) = exploring & no quests done yet
 *   act2 (The Grind)  = exploring, mid-campaign
 *   act3 (The Order)  = finale / tribunal
 */
export type Chapter = 'act1' | 'act2' | 'act3'

export interface TownState {
  id: TownId
  name: string
  /** Overworld position [x, y, z]. y is always 0 (ground). */
  position: [number, number, number]
  /** 0..100 physical health (one-way down, Q7). */
  condition: number
  /** 0..100 mood toward the player; rises on quest completion (Q4). */
  standing: number
  /** Real seconds of decay accrued — advances only while the player is present (Q5). */
  decaySecondsAccrued: number
  farms: { alive: number; total: number }
  population: { current: number; initial: number }
  /** Quest chain placeholder — Phase 3 fills concrete quests; for now a list of ids. */
  questChain: string[]
  /** Progress through the chain (0..questChain.length). */
  questIndex: number
  /** True once the town's finale opponent has been defeated (or the town was helped). */
  cleared: boolean
}

/** Cumulative run statistics surfaced on the credits screen. */
export interface RunStats {
  /** Town quest-chain quests completed (excludes finale boss kills). */
  questsCompleted: number
  /** Boss mechs defeated (chain boss hunts + finale bosses). */
  bossesDefeated: number
  /** Total money earned across the run (gross, ignores spending). */
  moneyEarned: number
}

/** Condition of an owned part instance. Damaged parts (salvaged off a limb the
 *  player shot away) must be repaired before they can be installed. */
export type InstanceCondition = 'pristine' | 'damaged'

/**
 * One owned part in the run inventory (Phase 2 §3.7). Parts are stored by catalog
 * id (rehydrated via `findPartById`), not as full objects, so the save stays small
 * and forward-compatible. `instanceId` is unique within a run so duplicates of the
 * same part id — and their individual condition — are addressable.
 */
export interface InventoryItem {
  /** Unique-within-run instance id (`inst-{n}`). */
  instanceId: string
  /** Catalog part id (see MechParts). */
  partId: string
  /** Damaged parts need a repair fee before they can be equipped. */
  condition: InstanceCondition
}

export interface StoryRun {
  /** Schema version for forward-compatible migrations (see deserializeRun). */
  version: typeof SAVE_VERSION
  /** Scrap currency (Phase 3 rename of `money`; earned from salvage + quests). */
  salvage: number
  /** Owned-but-unequipped parts (bought or salvaged). Equipping pulls from here. */
  inventory: InventoryItem[]
  /** The mech being built up this run (starts from the Starter, Q10). */
  loadout: MechLoadout
  towns: TownState[]
  phase: StoryPhase
  /** Narrative act (design §2.5), derived from phase + progress; see deriveChapter. */
  chapter: Chapter
  /** Set of narrative flags raised by dialogue choices / beats (design §2.5). */
  storyFlags: string[]
  /** Global reputation with the Directorate chain of command (0..100, start 50). */
  commandRep: number
  /** Global reputation with the Reach's towns/civilians (0..100, start 50). */
  townRep: number
  startedAt: number
  /** Total real seconds elapsed in the run (accrued while playing). */
  realElapsedSec: number
  /** Cumulative run stats for the credits report. */
  stats: RunStats
}

// ============================================================================
// Pure helpers (testable — no Vue / no DOM)
// ============================================================================

/** Talus Reach settlement names (design §2.4 re-skin). Index order is stable so
 *  positions — and any saved run's town ids — stay deterministic across the
 *  whimsy→war rename. */
export const TOWN_NAMES = [
  "Warden's Rest",
  'Sump',
  'The Kiln',
  'Longwater',
  'Halberd Station',
] as const

/**
 * Deterministic town spawn positions: scattered around the open map in a ring
 * with a jittered radius so they don't read as a perfect circle. Pure function
 * of the index so a reload reproduces the same layout.
 */
export function townSpawnPosition(index: number, count: number = TOWN_COUNT): [number, number, number] {
  const angle = (index / count) * Math.PI * 2
  // Alternate inner/outer ring for variety, well inside the world bounds.
  const radius = index % 2 === 0 ? WORLD_HALF_EXTENT * 0.55 : WORLD_HALF_EXTENT * 0.78
  const x = Math.cos(angle) * radius
  const z = Math.sin(angle) * radius
  return [Math.round(x), 0, Math.round(z)]
}

/**
 * One-way decay ratchet: given a current condition and the seconds the player has
 * spent inside the town radius this tick, return the new condition. Floors at 0
 * (Q6) and never increases (Q7).
 */
export function applyDecay(condition: number, secondsPresent: number): number {
  if (secondsPresent <= 0) return condition
  const next = condition - secondsPresent * DECAY_PER_SECOND
  return Math.max(0, Math.min(condition, next))
}

/** A town is "happy" purely from quest standing (Q4), independent of damage. */
export function isHappy(town: Pick<TownState, 'standing'>): boolean {
  return town.standing >= HAPPY_STANDING_THRESHOLD
}

/** Standing awarded per completed quest so finishing the chain reaches 100. */
export function standingPerQuest(chainLength: number = QUESTS_PER_CHAIN): number {
  return chainLength > 0 ? HAPPY_STANDING_THRESHOLD / chainLength : HAPPY_STANDING_THRESHOLD
}

/** Count of happy towns in a run. */
export function happyTownCount(towns: Array<Pick<TownState, 'standing'>>): number {
  return towns.reduce((n, t) => (isHappy(t) ? n + 1 : n), 0)
}

/** Finale unlocks once at least N towns are happy (§2). */
export function isFinaleUnlocked(towns: Array<Pick<TownState, 'standing'>>): boolean {
  return happyTownCount(towns) >= FINALE_UNLOCK_HAPPY_TOWNS
}

/**
 * Finale targets are the towns the player did NOT help — i.e. not happy and not
 * already cleared (Q13, dynamic set).
 */
export function finaleTargets<T extends Pick<TownState, 'standing' | 'cleared'>>(towns: T[]): T[] {
  return towns.filter((t) => !isHappy(t) && !t.cleared)
}

/**
 * Derive farms/population display counts from a town's current condition. Pure so
 * the visual layer (Town.ts) and any tests share the same thresholds.
 */
export function farmsAliveForCondition(condition: number, total: number): number {
  // Linear: full crops at 100, dead dirt at 0.
  return Math.round((condition / 100) * total)
}

export function populationForCondition(condition: number, initial: number): number {
  return Math.round((condition / 100) * initial)
}

// ============================================================================
// Starter loadout (Q10) — lightest valid chassis/legs/head + one basic weapon
// ============================================================================

/**
 * Picks the lightest valid Starter loadout straight from MechParts (ignores the
 * builder loadout per Q10). Validity mirrors useMechBuilder's rules: core + legs
 * + head present, at least one real weapon, non-negative energy budget.
 */
export function buildStarterLoadout(): MechLoadout {
  const byWeight = <T extends { weight: number }>(arr: T[]): T[] =>
    [...arr].sort((a, b) => a.weight - b.weight)

  const lightestCore = byWeight(CORE_PARTS)[0] as CorePart
  const lightestLegs = byWeight(LEGS_PARTS)[0] as LegsPart
  const lightestHead = byWeight(HEAD_PARTS)[0] as HeadPart

  // Cheapest/basic real weapon: the autocannon (low draw, no energy deficit).
  const basicWeapon =
    (ARM_PARTS.find((a) => a.id === 'arm-autocannon-mk1') as ArmPart | undefined) ??
    (byWeight(ARM_PARTS.filter((a) => a.weaponType !== 'support'))[0] as ArmPart)

  return {
    leftArm: basicWeapon,
    rightArm: null,
    core: lightestCore,
    legs: lightestLegs,
    head: lightestHead,
    rack: null,
  }
}

/** Validity check mirroring useMechBuilder (core/legs/head + >=1 weapon + energy >= 0). */
export function isLoadoutValid(loadout: MechLoadout): boolean {
  if (!loadout.core || !loadout.legs || !loadout.head) return false
  if (!loadout.leftArm && !loadout.rightArm) return false
  let energy = 0
  for (const part of Object.values(loadout)) {
    if (part) energy += part.stats.energy
  }
  return energy >= 0
}

/** Human-readable reason a loadout is invalid (for garage validation UI), or ''. */
export function loadoutInvalidReason(loadout: MechLoadout): string {
  if (!loadout.core) return 'A core is required.'
  if (!loadout.legs) return 'Legs are required.'
  if (!loadout.head) return 'A head is required.'
  const hasWeapon =
    (loadout.leftArm && isWeaponArm(loadout.leftArm)) ||
    (loadout.rightArm && isWeaponArm(loadout.rightArm))
  if (!hasWeapon) return 'At least one weapon arm is required.'
  let energy = 0
  for (const part of Object.values(loadout)) if (part) energy += part.stats.energy
  if (energy < 0) return `Energy deficit (${energy}). Add a stronger core or drop a draw-heavy part.`
  return ''
}

/**
 * Combat stats for a loadout, mirroring useMechBattle.convertStatsToCombat
 * (same floors/base offsets) so the Story Mode mech is always playable. Shared
 * by the page (player init) and the garage (re-equip).
 */
export function computeCombatStats(loadout: MechLoadout): CombatStats {
  const base = { health: 0, armor: 0, speed: 0, energy: 0, firepower: 0, accuracy: 0 }
  for (const part of Object.values(loadout)) {
    if (!part) continue
    base.health += part.stats.health
    base.armor += part.stats.armor
    base.speed += part.stats.speed
    base.energy += part.stats.energy
    base.firepower += part.stats.firepower
    base.accuracy += part.stats.accuracy
  }
  return {
    maxHealth: Math.max(100, base.health),
    currentHealth: Math.max(100, base.health),
    armor: Math.max(0, base.armor),
    speed: Math.max(50, base.speed + 50),
    firepower: Math.max(20, base.firepower + 20),
    accuracy: Math.max(20, base.accuracy + 20),
    energy: Math.max(50, base.energy + 50),
  }
}

// ============================================================================
// Fresh run factory
// ============================================================================

/** Initial farm/population counts for a brand-new town. */
const TOWN_FARMS_TOTAL = 2
const TOWN_POPULATION_INITIAL = 12

export function createTowns(): TownState[] {
  const towns: TownState[] = []
  for (let i = 0; i < TOWN_COUNT; i++) {
    towns.push({
      id: `town-${i}`,
      name: TOWN_NAMES[i] ?? `Town ${i + 1}`,
      position: townSpawnPosition(i),
      condition: 100,
      standing: 0,
      decaySecondsAccrued: 0,
      farms: { alive: TOWN_FARMS_TOTAL, total: TOWN_FARMS_TOTAL },
      population: { current: TOWN_POPULATION_INITIAL, initial: TOWN_POPULATION_INITIAL },
      questChain: Array.from({ length: QUESTS_PER_CHAIN }, (_, q) => `town-${i}-quest-${q}`),
      questIndex: 0,
      cleared: false,
    })
  }
  return towns
}

export function freshStats(): RunStats {
  return { questsCompleted: 0, bossesDefeated: 0, moneyEarned: 0 }
}

export function createFreshRun(now: number = Date.now()): StoryRun {
  return {
    version: SAVE_VERSION,
    salvage: 0,
    inventory: [],
    loadout: buildStarterLoadout(),
    towns: createTowns(),
    phase: 'exploring',
    chapter: 'act1',
    storyFlags: [],
    commandRep: REP_START,
    townRep: REP_START,
    startedAt: now,
    realElapsedSec: 0,
    stats: freshStats(),
  }
}

// ============================================================================
// Chapter (act) derivation + story flags — pure (design §2.5)
// ============================================================================

/**
 * Derive the narrative act from the (unchanged) phase machine + progress.
 *   finale/ended -> act3 (The Order / Tribunal)
 *   exploring, nothing done yet -> act1 (Deployment)
 *   exploring, mid-campaign -> act2 (The Grind)
 * Kept a pure function of observable run state so `chapter` is never a
 * fourth state that can desync from the phase machine.
 */
export function deriveChapter(
  phase: StoryPhase,
  questsCompleted: number,
): Chapter {
  if (phase === 'finale' || phase === 'ended') return 'act3'
  return questsCompleted === 0 ? 'act1' : 'act2'
}

/** True if a narrative flag has been raised on the run. */
export function hasFlag(run: Pick<StoryRun, 'storyFlags'>, flag: string): boolean {
  return run.storyFlags.includes(flag)
}

/** Raise a narrative flag (idempotent — no duplicates). */
export function setFlag(run: Pick<StoryRun, 'storyFlags'>, flag: string): void {
  if (!run.storyFlags.includes(flag)) run.storyFlags.push(flag)
}

// ============================================================================
// Two-axis reputation — pure helpers (design §3.7)
// ============================================================================

/** Clamp a reputation value into [REP_MIN, REP_MAX]. */
export function clampRep(value: number): number {
  return Math.max(REP_MIN, Math.min(REP_MAX, value))
}

/**
 * Apply a reputation delta on either/both axes (clamped). Mutates `run`. A
 * Command-sanctioned quest typically passes `{ commandRep: +x }`; helping a town
 * beyond orders (or refusing a bad one) passes `{ townRep: +x, commandRep: -y }`.
 * CONTENT wires the specific numbers via quest defs / dialogue effects.
 */
export function adjustRep(
  run: Pick<StoryRun, 'commandRep' | 'townRep'>,
  delta: { commandRep?: number; townRep?: number },
): void {
  if (typeof delta.commandRep === 'number') run.commandRep = clampRep(run.commandRep + delta.commandRep)
  if (typeof delta.townRep === 'number') run.townRep = clampRep(run.townRep + delta.townRep)
}

// ---- Shop stock DEPTH: gated by PER-TOWN standing (local). ----

/** Garage stock tier a town's standing unlocks (T1 always, T2/T3 with standing). */
export function shopTier(townStanding: number): 1 | 2 | 3 {
  if (townStanding >= SHOP_TIER_T3_STANDING) return 3
  if (townStanding >= SHOP_TIER_T2_STANDING) return 2
  return 1
}

/** The shelf tier a part sits on, by rarity (common T1, uncommon T2, rare+ T3). */
export function partShopTier(part: MechPart): 1 | 2 | 3 {
  if (part.rarity === 'rare' || part.rarity === 'legendary') return 3
  if (part.rarity === 'uncommon') return 2
  return 1
}

/** Whether a town (by its standing) stocks this part on its shelves at all. */
export function isPartStocked(part: MechPart, townStanding: number): boolean {
  return partShopTier(part) <= shopTier(townStanding)
}

// ---- Restricted hardware + prices: gated by GLOBAL rep axes. ----

/**
 * Which reputation axis a restricted part is gated behind, or null if it is
 * freely available. Only rare/legendary parts are restricted; among those,
 * support/defensive/mobility logistics are Town-gated (civilian hardware —
 * shields, repair drones, hover legs) and everything else military hardware
 * (railgun, fusion core, targeting arrays) is Command-gated. CONTENT may refine.
 */
export function partRepAxis(part: MechPart): 'command' | 'town' | null {
  if (part.rarity !== 'rare' && part.rarity !== 'legendary') return null
  const tags = part.synergyTags ?? []
  if ((part as ArmPart).weaponType === 'support') return 'town'
  if (tags.includes('support') || tags.includes('defensive') || tags.includes('mobility')) return 'town'
  return 'command'
}

/** Whether the run's global reputation clears a restricted part's rep gate. */
export function isPartRepUnlocked(part: MechPart, commandRep: number, townRep: number): boolean {
  const axis = partRepAxis(part)
  if (axis === 'command') return commandRep >= MILITARY_REP_UNLOCK
  if (axis === 'town') return townRep >= CIVILIAN_REP_UNLOCK
  return true
}

/**
 * Price multiplier a restricted part gets from the run's rep on its axis:
 * neutral (rep 50) -> 1.0, maxed (rep 100) -> 1 - REP_PRICE_SWING (a discount),
 * tanked (rep 0) -> 1 + REP_PRICE_SWING (a surcharge). Unrestricted parts: 1.0.
 */
export function repPriceModifier(part: MechPart, commandRep: number, townRep: number): number {
  const axis = partRepAxis(part)
  if (!axis) return 1
  const rep = axis === 'command' ? commandRep : townRep
  return 1 - ((rep - REP_START) / (REP_MAX - REP_START)) * REP_PRICE_SWING
}

// ============================================================================
// Collateral tax — pure (design §3.5). Mirrors applyDecay's one-way ratchet.
// ============================================================================

/**
 * Register combat collateral against a town: convert an emitted `severity`
 * budget (see the COLLATERAL_* contract above) into a small, one-way condition
 * decrement, and re-derive the town's farms/population counts (mirrors
 * tickTownDecay). Mutates the town in `run.towns`. Returns the new condition, or
 * undefined if the town id is unknown. Severity is expected to already be
 * distance-tapered by the emitter; negative/zero severity is a no-op.
 */
export function applyCollateral(run: StoryRun, townId: TownId, severity: number): number | undefined {
  const town = run.towns.find((t) => t.id === townId)
  if (!town) return undefined
  if (severity <= 0) return town.condition
  const drop = severity * COLLATERAL_CONDITION_PER_SEVERITY
  town.condition = Math.max(0, town.condition - drop)
  town.farms.alive = farmsAliveForCondition(town.condition, town.farms.total)
  town.population.current = populationForCondition(town.condition, town.population.initial)
  return town.condition
}

// ============================================================================
// Death stakes — pure (design §3.7). Downed, not game-over.
// ============================================================================

/** Outcome of the player being downed; the caller surfaces it + applies respawn. */
export interface DefeatResult {
  /** Scrap lost (25% of carried salvage), already deducted from run. */
  salvageLost: number
  /** Condition removed from the defended town (0 if none / no town). */
  townConditionHit: number
  /** Per-town standing removed from the defended town (0 if none / no town). */
  standingHit: number
  /** Always true — a defeat downs the pilot rather than ending the run. */
  downed: true
  /** Total scrap owed to repair the limbs knocked to `damaged` on redeploy. */
  repairFeeOwed: number
  /** Loadout slots emptied into the inventory as damaged (must be repaired + refit). */
  damagedSlots: ShopSlot[]
}

/**
 * Resolve a player defeat (design §3.7): lose 25% salvage; if the defeat
 * happened defending a town, that town takes a condition + standing hit (the
 * enemies overran it); and any limb slot destroyed in the lost fight is stripped
 * off the loadout into the inventory as `damaged`, so it must be repaired (and
 * re-installed) before redeploy — the "re-buy destroyed limbs at repair pricing"
 * stake. Pure w.r.t. state (mutates `run`); `destroyedSlots` comes from the live
 * MechEntity's destroyedSlots at the moment it died.
 */
export function handlePlayerDefeated(
  run: StoryRun,
  townId?: TownId,
  destroyedSlots: ShopSlot[] = [],
): DefeatResult {
  // --- 25% salvage loss. ---
  const salvageLost = Math.floor(run.salvage * DEATH_SALVAGE_LOSS_FRACTION)
  run.salvage = Math.max(0, run.salvage - salvageLost)

  // --- Town takes the hit you failed to prevent. ---
  let townConditionHit = 0
  let standingHit = 0
  if (townId) {
    const town = run.towns.find((t) => t.id === townId)
    if (town) {
      const before = town.condition
      town.condition = Math.max(0, town.condition - DEATH_TOWN_CONDITION_HIT)
      town.farms.alive = farmsAliveForCondition(town.condition, town.farms.total)
      town.population.current = populationForCondition(town.condition, town.population.initial)
      townConditionHit = before - town.condition
      const standingBefore = town.standing
      town.standing = Math.max(0, town.standing - DEATH_STANDING_HIT)
      standingHit = standingBefore - town.standing
    }
  }

  // --- Strip destroyed limbs into the inventory as damaged (repair debt). ---
  let repairFeeOwed = 0
  const damagedSlots: ShopSlot[] = []
  for (const slot of destroyedSlots) {
    const part = run.loadout[slot]
    if (!part) continue
    run.inventory.push({
      instanceId: nextInstanceId(run.inventory),
      partId: part.id,
      condition: 'damaged',
    })
    repairFeeOwed += repairPrice(part)
    run.loadout = { ...run.loadout, [slot]: null }
    damagedSlots.push(slot)
  }

  return { salvageLost, townConditionHit, standingHit, downed: true, repairFeeOwed, damagedSlots }
}

// ============================================================================
// Damage report + verdict (credits, Q14)
// ============================================================================

export interface TownDamageReport {
  id: TownId
  name: string
  /** Final physical condition 0..100. */
  condition: number
  /** Percent destroyed (100 - condition), rounded. */
  destroyedPct: number
  /** Residents lost = initial - current. */
  residentsLost: number
  residentsInitial: number
  /** Farms lost = total - alive. */
  farmsLost: number
  farmsTotal: number
  /** Whether the town was made happy (helped). */
  helped: boolean
  /** Whether the town's finale opponent was defeated. */
  cleared: boolean
}

export function buildTownDamageReport(town: TownState): TownDamageReport {
  const residentsLost = Math.max(0, town.population.initial - town.population.current)
  const farmsLost = Math.max(0, town.farms.total - town.farms.alive)
  return {
    id: town.id,
    name: town.name,
    condition: Math.round(town.condition),
    destroyedPct: Math.round(100 - town.condition),
    residentsLost,
    residentsInitial: town.population.initial,
    farmsLost,
    farmsTotal: town.farms.total,
    helped: isHappy(town),
    cleared: town.cleared,
  }
}

/** Average percent-destroyed across all towns (0..100). */
export function averageDestruction(towns: TownState[]): number {
  if (towns.length === 0) return 0
  const sum = towns.reduce((n, t) => n + (100 - t.condition), 0)
  return sum / towns.length
}

export type Verdict = 'Hero' | 'Mercenary' | 'Menace' | 'Monster'

/**
 * Overall verdict derived from total town damage (Q14). The less you wrecked the
 * towns, the kinder the grade. Tuned against the decay rate so a careful run can
 * still reach Hero and a loiterer slides toward Monster.
 */
export function verdictForDamage(avgDestruction: number): Verdict {
  if (avgDestruction < 25) return 'Hero'
  if (avgDestruction < 50) return 'Mercenary'
  if (avgDestruction < 75) return 'Menace'
  return 'Monster'
}

/** One-line flavor for each verdict (playful tone, Q16). */
export function verdictFlavor(verdict: Verdict): string {
  switch (verdict) {
    case 'Hero':
      return 'You came, you helped, you barely flattened a thing. The towns sing your name.'
    case 'Mercenary':
      return 'Job done, paycheck collected, a few petunias trampled. Nobody’s mad enough to chase you.'
    case 'Menace':
      return 'You meant well. The craters disagree. They’ll rebuild… eventually.'
    case 'Monster':
      return 'Saviour? The history books will file this under “natural disaster”.'
  }
}

// ============================================================================
// Salvage economy & inventory (Phase 2 §3.7) — pure, testable
// ============================================================================

/** The six loadout slots, in a stable order for deterministic drop rolls. */
export const SLOT_KEYS: ShopSlot[] = ['leftArm', 'rightArm', 'core', 'legs', 'head', 'rack']

/**
 * Next free inventory instance id. Ids are `inst-{n}` where n is one past the
 * highest existing numeric suffix, so ids never collide with loaded ones and
 * generation stays deterministic (important for tests + reloads).
 */
export function nextInstanceId(inventory: Array<{ instanceId: string }>): string {
  let max = -1
  for (const it of inventory) {
    const m = /inst-(\d+)/.exec(it.instanceId)
    if (m) max = Math.max(max, parseInt(m[1], 10))
  }
  return `inst-${max + 1}`
}

/** Repair fee to bring a damaged part back to working order (fraction of shop price). */
export function repairPrice(part: MechPart): number {
  return Math.max(20, Math.round((partPrice(part) * REPAIR_PRICE_FRACTION) / 10) * 10)
}

/** Scrap fitting fee to install an inventory part (small fraction of shop price). */
export function fittingFee(part: MechPart): number {
  return Math.max(10, Math.round((partPrice(part) * INSTALL_FITTING_FEE_FRACTION) / 10) * 10)
}

/** Scrap refunded for selling an owned part; damaged parts fetch less. */
export function salvageSellPrice(part: MechPart, condition: InstanceCondition): number {
  const frac = condition === 'damaged' ? SELL_PRICE_FRACTION_DAMAGED : SELL_PRICE_FRACTION_PRISTINE
  return Math.max(10, Math.round((partPrice(part) * frac) / 10) * 10)
}

/** Result of a kill's salvage award: scrap gained + the parts that dropped. */
export interface SalvageResult {
  /** Scrap (salvage currency) granted for the kill. */
  scrap: number
  /** Parts that dropped into the run inventory (already appended to run.inventory). */
  drops: InventoryItem[]
}

/**
 * Award salvage for a killed enemy (design §3.7). Mutates `run`:
 *  - grants scrap scaled by the KILLED enemy's total equipped part power
 *    (min `SALVAGE_SCRAP_FLOOR`), tracked as gross earnings; and
 *  - rolls the enemy's actual loadout parts as inventory drops: a slot the player
 *    destroyed (`destroyedSlots`) drops its part in **damaged** condition at
 *    `SALVAGE_DESTROYED_DROP_CHANCE` (default guaranteed — you shot it off, you
 *    keep the wreck to repair); an intact slot has the lower
 *    `SALVAGE_INTACT_DROP_CHANCE` to drop **pristine**.
 *
 * Pure w.r.t. randomness via the injectable `rng` (defaults to Math.random) so the
 * whole thing is unit-testable without three.js. Returns the scrap + drops for the
 * caller (StoryCombat kill hook / garage toast). Callers persist via `save()`.
 */
export function awardSalvage(
  run: StoryRun,
  killedLoadout: MechLoadout,
  destroyedSlots: ShopSlot[] = [],
  rng: () => number = Math.random,
): SalvageResult {
  // --- Scrap: scale by the enemy's total equipped part power. ---
  let power = 0
  for (const slot of SLOT_KEYS) {
    const part = killedLoadout[slot]
    if (part) power += partPowerScore(part)
  }
  const scrap = Math.max(SALVAGE_SCRAP_FLOOR, Math.round(power * SALVAGE_SCRAP_PER_POWER))

  // --- Part drops: roll each equipped slot. ---
  const drops: InventoryItem[] = []
  // `working` seeds id generation off the current inventory + drops rolled so far
  // so every dropped instance id is unique before we commit them to the run.
  const working: InventoryItem[] = [...run.inventory]
  for (const slot of SLOT_KEYS) {
    const part = killedLoadout[slot]
    if (!part) continue
    const wasDestroyed = destroyedSlots.includes(slot)
    const chance = wasDestroyed ? SALVAGE_DESTROYED_DROP_CHANCE : SALVAGE_INTACT_DROP_CHANCE
    if (rng() >= chance) continue
    const item: InventoryItem = {
      instanceId: nextInstanceId(working),
      partId: part.id,
      condition: wasDestroyed ? 'damaged' : 'pristine',
    }
    working.push(item)
    drops.push(item)
  }

  // --- Commit to the run. ---
  run.salvage += scrap
  run.stats.moneyEarned += scrap
  for (const d of drops) run.inventory.push(d)

  return { scrap, drops }
}

/** Drop unknown/malformed inventory entries and normalise condition + ids. */
function sanitizeInventory(raw: unknown): InventoryItem[] {
  if (!Array.isArray(raw)) return []
  const out: InventoryItem[] = []
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue
    const partId = (entry as { partId?: unknown }).partId
    if (typeof partId !== 'string' || !findPartById(partId)) continue
    const rawCond = (entry as { condition?: unknown }).condition
    const condition: InstanceCondition = rawCond === 'damaged' ? 'damaged' : 'pristine'
    const rawId = (entry as { instanceId?: unknown }).instanceId
    const instanceId = typeof rawId === 'string' ? rawId : nextInstanceId(out)
    out.push({ instanceId, partId, condition })
  }
  return out
}

// ============================================================================
// Serialization (loadout parts are stored by id; rehydrated from MechParts)
// ============================================================================

interface SerializedLoadout {
  leftArm: string | null
  rightArm: string | null
  core: string | null
  legs: string | null
  head: string | null
  rack: string | null
}

function serializeLoadout(loadout: MechLoadout): SerializedLoadout {
  return {
    leftArm: loadout.leftArm?.id ?? null,
    rightArm: loadout.rightArm?.id ?? null,
    core: loadout.core?.id ?? null,
    legs: loadout.legs?.id ?? null,
    head: loadout.head?.id ?? null,
    rack: loadout.rack?.id ?? null,
  }
}

function deserializeLoadout(data: SerializedLoadout): MechLoadout {
  return {
    leftArm: data.leftArm ? (findPartById(data.leftArm) as ArmPart) : null,
    rightArm: data.rightArm ? (findPartById(data.rightArm) as ArmPart) : null,
    core: data.core ? (findPartById(data.core) as CorePart) : null,
    legs: data.legs ? (findPartById(data.legs) as LegsPart) : null,
    head: data.head ? (findPartById(data.head) as HeadPart) : null,
    rack: data.rack ? (findPartById(data.rack) as RackPart) : null,
  }
}

export function serializeRun(run: StoryRun): string {
  return JSON.stringify({ ...run, loadout: serializeLoadout(run.loadout) })
}

/**
 * Migrate a v1 payload up to v2: gains an empty inventory; money carries over 1:1
 * (scrap and money are the same currency in Phase 2). Pure — returns a new object.
 */
function migrateV1toV2(data: Record<string, unknown>): Record<string, unknown> {
  return {
    ...data,
    version: 2,
    inventory: Array.isArray(data.inventory) ? data.inventory : [],
  }
}

/**
 * Migrate a v2 payload up to v3 (Phase 3): `money` becomes `salvage` (1:1), the
 * narrative fields appear at their neutral defaults — no flags, both rep axes at
 * REP_START, chapter derived from the existing phase + quest progress so an
 * in-progress v2 save lands in the right act. Pure — returns a new object.
 */
function migrateV2toV3(data: Record<string, unknown>): Record<string, unknown> {
  const stats = data.stats as Partial<RunStats> | undefined
  const phase = (data.phase as StoryPhase) ?? 'exploring'
  return {
    ...data,
    version: 3,
    salvage: typeof data.salvage === 'number'
      ? data.salvage
      : typeof data.money === 'number' ? data.money : 0,
    storyFlags: Array.isArray(data.storyFlags) ? data.storyFlags : [],
    commandRep: typeof data.commandRep === 'number' ? data.commandRep : REP_START,
    townRep: typeof data.townRep === 'number' ? data.townRep : REP_START,
    chapter: (data.chapter as Chapter) ?? deriveChapter(phase, stats?.questsCompleted ?? 0),
  }
}

/**
 * Parse + migrate a saved run. Returns null on anything unusable — malformed JSON,
 * a missing towns array, or an unknown/future schema version — so a bad slot fails
 * cleanly (caller starts fresh) rather than crashing. Known older versions are run
 * through the full migration chain (v1 -> v2 -> v3) before the run is rebuilt.
 */
export function deserializeRun(raw: string): StoryRun | null {
  try {
    const data = JSON.parse(raw) as Record<string, unknown> | null
    if (!data || typeof data !== 'object' || !Array.isArray(data.towns)) return null

    // --- Migration chain: step any known older schema up to SAVE_VERSION. ---
    let migrated: Record<string, unknown>
    if (data.version === 1) migrated = migrateV2toV3(migrateV1toV2(data))
    else if (data.version === 2) migrated = migrateV2toV3(data)
    else if (data.version === SAVE_VERSION) migrated = data
    else return null // unknown / future version -> clean rejection, never a crash

    const stats = migrated.stats as Partial<RunStats> | undefined
    const phase = (migrated.phase as StoryPhase) ?? 'exploring'
    const salvage = typeof migrated.salvage === 'number'
      ? migrated.salvage
      : typeof migrated.money === 'number' ? migrated.money : 0
    const questsCompleted = stats?.questsCompleted ?? 0
    return {
      version: SAVE_VERSION,
      salvage,
      inventory: sanitizeInventory(migrated.inventory),
      loadout: deserializeLoadout(migrated.loadout as SerializedLoadout),
      towns: migrated.towns as TownState[],
      phase,
      chapter: (migrated.chapter as Chapter) ?? deriveChapter(phase, questsCompleted),
      storyFlags: Array.isArray(migrated.storyFlags)
        ? (migrated.storyFlags as unknown[]).filter((f): f is string => typeof f === 'string')
        : [],
      commandRep: typeof migrated.commandRep === 'number' ? clampRep(migrated.commandRep) : REP_START,
      townRep: typeof migrated.townRep === 'number' ? clampRep(migrated.townRep) : REP_START,
      startedAt: (migrated.startedAt as number) ?? Date.now(),
      realElapsedSec: (migrated.realElapsedSec as number) ?? 0,
      stats: {
        questsCompleted,
        bossesDefeated: stats?.bossesDefeated ?? 0,
        moneyEarned: stats?.moneyEarned ?? 0,
      },
    }
  } catch {
    return null
  }
}

// ============================================================================
// Composable — the run state machine
// ============================================================================

/** Numeric town index from its id (`town-3` -> 3); -1 if unparseable. */
export function townIndexFromId(id: TownId): number {
  const m = /town-(\d+)/.exec(id)
  return m ? parseInt(m[1], 10) : -1
}

/** The quest a town is currently offering (null once its chain is complete). */
export function questForTown(town: Pick<TownState, 'id' | 'questIndex'>): QuestDef | null {
  return currentQuestDef(town.id, townIndexFromId(town.id), town.questIndex)
}

export function useStoryMode() {
  const run = ref<StoryRun | null>(null)
  /** Transient (non-persisted) quest currently being attempted in-world. */
  const activeQuest = ref<QuestDef | null>(null)

  // --- Persistence (single slot) ---

  function save(): void {
    if (!run.value) return
    try {
      localStorage.setItem(STORY_SAVE_KEY, serializeRun(run.value))
    } catch (e) {
      console.error('[StoryMode] Failed to save run:', e)
    }
  }

  function load(): boolean {
    try {
      const raw = localStorage.getItem(STORY_SAVE_KEY)
      if (!raw) return false
      const parsed = deserializeRun(raw)
      if (!parsed) return false
      run.value = parsed
      return true
    } catch (e) {
      console.error('[StoryMode] Failed to load run:', e)
      return false
    }
  }

  function hasSavedRun(): boolean {
    try {
      return localStorage.getItem(STORY_SAVE_KEY) !== null
    } catch {
      return false
    }
  }

  function clearSavedRun(): void {
    try {
      localStorage.removeItem(STORY_SAVE_KEY)
    } catch {
      /* ignore */
    }
  }

  /** Start a brand-new run (overwrites the single save slot). */
  function newRun(): StoryRun {
    run.value = createFreshRun()
    save()
    return run.value
  }

  /** Load the saved run if present, otherwise start a fresh one. */
  function loadOrNew(): StoryRun {
    if (load() && run.value) return run.value
    return newRun()
  }

  // --- Mutations ---

  function addSalvage(amount: number): void {
    if (!run.value) return
    run.value.salvage = Math.max(0, run.value.salvage + amount)
    if (amount > 0) run.value.stats.moneyEarned += amount
    save()
  }
  /** @deprecated Phase 3 rename — kept so existing callers keep compiling. Use addSalvage. */
  const addMoney = addSalvage

  function getTown(id: TownId): TownState | undefined {
    return run.value?.towns.find((t) => t.id === id)
  }

  /**
   * Accrue real-time decay on a town the player is currently within range of.
   * Updates condition (one-way) and the derived farms/population counts, then
   * re-evaluates the run phase. Returns the new condition (or undefined if no run).
   */
  function tickTownDecay(id: TownId, secondsPresent: number): number | undefined {
    const town = getTown(id)
    if (!town) return undefined
    town.decaySecondsAccrued += secondsPresent
    town.condition = applyDecay(town.condition, secondsPresent)
    town.farms.alive = farmsAliveForCondition(town.condition, town.farms.total)
    town.population.current = populationForCondition(town.condition, town.population.initial)
    refreshPhase()
    return town.condition
  }

  /** Advance a town's quest chain on completion: bump index, raise standing, pay out. */
  function completeQuest(id: TownId, reward: number): void {
    const town = getTown(id)
    if (!town) return
    if (town.questIndex < town.questChain.length) {
      town.questIndex += 1
      // Finishing the LAST quest in the chain snaps standing exactly to the
      // happy threshold — per-quest steps are 100/3 = 33.33 and would otherwise
      // sum to 99.99 (< 100), so isHappy would never fire and the finale would
      // never unlock. Mid-chain quests use the proportional step.
      town.standing =
        town.questIndex >= town.questChain.length
          ? HAPPY_STANDING_THRESHOLD
          : Math.min(
              HAPPY_STANDING_THRESHOLD,
              town.standing + standingPerQuest(town.questChain.length),
            )
      run.value!.stats.questsCompleted += 1
    }
    if (isHappy(town)) town.cleared = true
    addMoney(reward) // addMoney saves
    refreshPhase()
  }

  /** Mark a finale town cleared (opponent defeated). */
  function clearTown(id: TownId): void {
    const town = getTown(id)
    if (!town) return
    town.cleared = true
    refreshPhase()
    save()
  }

  /** Re-evaluate phase from town state: unlock finale at >=3 happy; end when all
   *  targets cleared. Also re-derives the narrative `chapter` from the (unchanged)
   *  phase machine + quest progress so the act tracks the phase without being an
   *  independent, desyncable state (design §2.5). */
  function refreshPhase(): void {
    if (!run.value) return
    if (run.value.phase !== 'ended') {
      const towns = run.value.towns
      if (run.value.phase === 'exploring') {
        if (isFinaleUnlocked(towns)) run.value.phase = 'finale'
      }
      if (run.value.phase === 'finale') {
        if (finaleTargets(towns).length === 0) run.value.phase = 'ended'
      }
    }
    run.value.chapter = deriveChapter(run.value.phase, run.value.stats.questsCompleted)
  }

  /**
   * Force the run to conclude (design §2.5 Act III withdrawal). When the player
   * obeys Vaun's scorched-withdrawal order they leave the un-reclaimed towns to
   * the aces, which the phase machine cannot reach on its own (it only ends when
   * every finale target is *cleared*). This flips the run to 'ended' so the
   * tribunal rolls with the abandoned towns still on the ledger. Idempotent.
   */
  function concludeRun(): void {
    if (!run.value) return
    run.value.phase = 'ended'
    refreshPhase() // keeps 'ended', re-derives chapter -> act3
    save()
  }

  /** Accrue total real elapsed time (called by the world loop). */
  function tickElapsed(seconds: number): void {
    if (!run.value) return
    run.value.realElapsedSec += seconds
  }

  // --- Quests ---

  /** The quest a given town is currently offering (null when its chain is done). */
  function getCurrentQuest(id: TownId): QuestDef | null {
    const town = getTown(id)
    if (!town) return null
    return questForTown(town)
  }

  /** Begin attempting a quest in-world; the world spawns the encounter. */
  function startQuest(quest: QuestDef): void {
    activeQuest.value = quest
  }

  /** Clear the active-quest marker (encounter ended / abandoned). */
  function clearActiveQuest(): void {
    activeQuest.value = null
  }

  /**
   * Finish the active quest by id: pays the reward, raises standing + advances
   * the town's chain (via completeQuest), and clears the active marker. Returns
   * the town it belonged to (or undefined).
   */
  function finishActiveQuest(quest: QuestDef): TownState | undefined {
    const town = getTown(quest.townId)
    if (!town) return undefined
    // Only advance if this quest is still the town's current one (guards double-fire).
    if (town.questIndex === quest.index) {
      if (quest.type === 'boss_hunt' && run.value) run.value.stats.bossesDefeated += 1
      completeQuest(quest.townId, quest.reward) // pays + standing + saves
    }
    activeQuest.value = null
    return town
  }

  // --- Finale ---

  /**
   * Kick off the finale: mark the towns the player never helped as occupied by a
   * strong opponent and flip the phase to 'finale'. Idempotent — calling it again
   * (e.g. on reload) is a no-op once already in/past the finale. Returns the towns
   * that are now finale targets (un-helped, uncleared).
   */
  function beginFinale(): TownState[] {
    if (!run.value) return []
    if (run.value.phase === 'exploring' && isFinaleUnlocked(run.value.towns)) {
      run.value.phase = 'finale'
    }
    save()
    return finaleTargets(run.value.towns)
  }

  /** The finale boss QuestDef for an un-helped target town. */
  function finaleBossForTown(id: TownId): QuestDef | null {
    const town = getTown(id)
    if (!town) return null
    return buildFinaleBoss(town.id, townIndexFromId(town.id))
  }

  /**
   * Complete a finale boss encounter: pay the reward, count the boss kill, and
   * mark the town cleared. Distinct from finishActiveQuest (which advances chain
   * quests). Returns the town, or undefined.
   */
  function finishFinaleBoss(quest: QuestDef): TownState | undefined {
    const town = getTown(quest.townId)
    if (!town) return undefined
    if (!town.cleared) {
      if (run.value) run.value.stats.bossesDefeated += 1
      addMoney(quest.reward) // pays + saves + tracks earnings
      clearTown(quest.townId) // marks cleared + refreshes phase (-> 'ended' when last)
    }
    activeQuest.value = null
    return town
  }

  // --- Garage / economy ---

  /**
   * Buy a part and equip it into a slot, applying the result to the run loadout.
   * Validates affordability and that the resulting loadout stays legal (mirrors
   * useMechBuilder rules). Returns { ok, reason }. On success money is spent and
   * the run is saved. Does NOT touch the live MechEntity — the caller applies the
   * new loadout to the world via StoryWorld.applyLoadout.
   */
  function buyAndEquip(part: MechPart, slot: ShopSlot): { ok: boolean; reason?: string } {
    if (!run.value) return { ok: false, reason: 'No active run.' }
    if (!slotsForPart(part).includes(slot)) {
      return { ok: false, reason: 'That part cannot go in that slot.' }
    }
    // Charge the REPUTATION-ADJUSTED shop price — the exact figure the Garage
    // shows and gates its Buy button on (garagePriceModifier / Garage.displayPrice
    // both = max(0, round(base * repPriceModifier))). Charging raw base instead
    // (a) makes the §3.7 rep-priced tier cosmetic, (b) lets a rep discount enable
    // a Buy the charge then rejects, and (c) blocks a rep surcharge the player can
    // actually afford at base. See findings — shown price must equal charge.
    const price = Math.max(
      0,
      Math.round(partPrice(part) * repPriceModifier(part, run.value.commandRep, run.value.townRep)),
    )
    if (run.value.salvage < price) {
      return { ok: false, reason: `Not enough salvage (need ${price}).` }
    }

    // Build a candidate loadout with the part equipped and validate it.
    const candidate: MechLoadout = { ...run.value.loadout, [slot]: part as never }
    const reason = loadoutInvalidReason(candidate)
    if (reason) return { ok: false, reason }

    run.value.loadout = candidate
    run.value.salvage -= price
    save()
    return { ok: true }
  }

  // --- Inventory & salvage (Phase 2 §3.7) ---

  /**
   * Award salvage for a killed enemy (scrap + rolled loadout drops). This is the
   * StoryCombat kill-hook seam: the integrator calls this from the enemy-destroyed
   * handler, passing the killed mech's `loadout` and the slots it destroyed
   * (`onSlotDestroyed` accumulates these; core-death = the whole enemy dying, so
   * the core slot is typically present). Persists and returns the scrap + drops
   * for a garage/HUD toast.
   */
  function awardKillSalvage(
    killedLoadout: MechLoadout,
    destroyedSlots: ShopSlot[] = [],
    rng: () => number = Math.random,
  ): SalvageResult {
    if (!run.value) return { scrap: 0, drops: [] }
    const result = awardSalvage(run.value, killedLoadout, destroyedSlots, rng)
    save()
    return result
  }

  /**
   * Buy a part into the inventory (does NOT equip). Spends scrap. Use
   * `installFromInventory` to equip it. Returns the created instance on success.
   */
  function buyPart(part: MechPart): { ok: boolean; reason?: string; item?: InventoryItem } {
    if (!run.value) return { ok: false, reason: 'No active run.' }
    const price = partPrice(part)
    if (run.value.salvage < price) return { ok: false, reason: `Not enough salvage (need ${price}).` }
    const item: InventoryItem = {
      instanceId: nextInstanceId(run.value.inventory),
      partId: part.id,
      condition: 'pristine',
    }
    run.value.inventory.push(item)
    run.value.salvage -= price
    save()
    return { ok: true, item }
  }

  /**
   * Install an owned (pristine) inventory instance into a slot. Validates slot
   * fit + loadout legality (same rules as buyAndEquip) and charges a small scrap
   * FITTING FEE (Phase 3 counterweight — even a free salvaged part costs a little
   * to bolt on). On success the instance is consumed and any displaced part is
   * returned to the inventory (pristine), so a swap never destroys the part you
   * took off. Damaged parts are refused until repaired. Caller applies the new
   * loadout to the world (StoryWorld.applyLoadout). Returns the fee charged.
   */
  function installFromInventory(
    instanceId: string,
    slot: ShopSlot,
  ): { ok: boolean; reason?: string; fee?: number } {
    if (!run.value) return { ok: false, reason: 'No active run.' }
    const idx = run.value.inventory.findIndex((i) => i.instanceId === instanceId)
    if (idx < 0) return { ok: false, reason: 'That part is not in your inventory.' }
    const item = run.value.inventory[idx]
    if (item.condition === 'damaged') {
      return { ok: false, reason: 'Part is damaged — repair it before installing.' }
    }
    const part = findPartById(item.partId)
    if (!part) return { ok: false, reason: 'Unknown part.' }
    if (!slotsForPart(part).includes(slot)) {
      return { ok: false, reason: 'That part cannot go in that slot.' }
    }
    const candidate: MechLoadout = { ...run.value.loadout, [slot]: part as never }
    const reason = loadoutInvalidReason(candidate)
    if (reason) return { ok: false, reason }

    const fee = fittingFee(part)
    if (run.value.salvage < fee) return { ok: false, reason: `Not enough salvage for the fitting fee (need ${fee}).` }

    const displaced = run.value.loadout[slot]
    run.value.inventory.splice(idx, 1)
    if (displaced) {
      run.value.inventory.push({
        instanceId: nextInstanceId(run.value.inventory),
        partId: displaced.id,
        condition: 'pristine',
      })
    }
    run.value.loadout = candidate
    run.value.salvage -= fee
    save()
    return { ok: true, fee }
  }

  /** Repair a damaged inventory instance to pristine for scrap. */
  function repairPart(instanceId: string): { ok: boolean; reason?: string; cost?: number } {
    if (!run.value) return { ok: false, reason: 'No active run.' }
    const item = run.value.inventory.find((i) => i.instanceId === instanceId)
    if (!item) return { ok: false, reason: 'That part is not in your inventory.' }
    if (item.condition !== 'damaged') return { ok: false, reason: 'That part is already in working order.' }
    const part = findPartById(item.partId)
    if (!part) return { ok: false, reason: 'Unknown part.' }
    const cost = repairPrice(part)
    if (run.value.salvage < cost) return { ok: false, reason: `Not enough salvage to repair (need ${cost}).` }
    run.value.salvage -= cost
    item.condition = 'pristine'
    save()
    return { ok: true, cost }
  }

  /** Sell an owned inventory instance for scrap (damaged parts fetch less). */
  function sellPart(instanceId: string): { ok: boolean; reason?: string; refund?: number } {
    if (!run.value) return { ok: false, reason: 'No active run.' }
    const idx = run.value.inventory.findIndex((i) => i.instanceId === instanceId)
    if (idx < 0) return { ok: false, reason: 'That part is not in your inventory.' }
    const item = run.value.inventory[idx]
    const part = findPartById(item.partId)
    run.value.inventory.splice(idx, 1)
    const refund = part ? salvageSellPrice(part, item.condition) : 0
    addMoney(refund) // addMoney saves + tracks gross earnings
    return { ok: true, refund }
  }

  // --- Reputation / flags / collateral / death (Phase 3 §3.5, §3.7) ---

  /** Apply a reputation delta on either/both axes (clamped) + persist. */
  function adjustReputation(delta: { commandRep?: number; townRep?: number }): void {
    if (!run.value) return
    adjustRep(run.value, delta)
    save()
  }

  /** Raise a narrative flag (idempotent) + persist. */
  function raiseFlag(flag: string): void {
    if (!run.value) return
    setFlag(run.value, flag)
    save()
  }

  /** Whether a narrative flag is set on the active run. */
  function hasStoryFlag(flag: string): boolean {
    return run.value ? hasFlag(run.value, flag) : false
  }

  /**
   * Route a chosen dialogue choice through the shared-contract evaluator: gate on
   * requirements, then (if available) apply its flag/rep effects to the run and
   * surface the host action + next node. No-op (available:false) if gated out.
   * The one seam CONTENT/UI use to run a dialogue tree against run state.
   */
  function chooseDialogue(choice: DialogueChoice): ChoiceEvaluation {
    if (!run.value) return { available: false }
    const evaluation = evaluateChoice(run.value, choice)
    if (evaluation.available) save()
    return evaluation
  }

  /**
   * Register combat collateral against a town (design §3.5). The integrator wires
   * StoryCombat.onCollateral(severity, pos) -> this. Applies the gentle one-way
   * condition decrement, re-derives phase (collateral can't unlock the finale —
   * that's standing-only — but keeps the machine consistent) + persists.
   */
  function applyTownCollateral(
    townId: TownId,
    severity: number,
    persist = true,
  ): number | undefined {
    if (!run.value) return undefined
    const condition = applyCollateral(run.value, townId, severity)
    // Collateral is emitted every combat frame (§3.5); persisting on each one is a
    // full-run serialize + localStorage write per frame. Callers on the hot combat
    // loop pass persist:false and throttle the save themselves (mirrors the decay
    // save throttle). Default true keeps the wrapper self-persisting elsewhere.
    if (persist) save()
    return condition
  }

  /**
   * Resolve a player defeat (design §3.7). The integrator calls this from
   * StoryCombat.onPlayerDefeated, passing the town being defended (if any) and the
   * dead Frame's destroyedSlots. Applies the salvage loss, town condition/standing
   * hit, and limb repair debt, then persists. Returns the ledger for a HUD/garage
   * "downed" screen. Redeploy is gated on isLoadoutValid(run.loadout) afterwards.
   */
  function playerDefeated(townId?: TownId, destroyedSlots: ShopSlot[] = []): DefeatResult {
    if (!run.value) {
      return { salvageLost: 0, townConditionHit: 0, standingHit: 0, downed: true, repairFeeOwed: 0, damagedSlots: [] }
    }
    const result = handlePlayerDefeated(run.value, townId, destroyedSlots)
    refreshPhase()
    save()
    return result
  }

  // --- Getters ---

  const salvage = computed(() => run.value?.salvage ?? 0)
  /** @deprecated Phase 3 rename — kept so existing UI (`story.money.value`) compiles. Use `salvage`. */
  const money = salvage
  const inventory = computed<InventoryItem[]>(() => run.value?.inventory ?? [])
  const towns = computed<TownState[]>(() => run.value?.towns ?? [])
  const phase = computed<StoryPhase>(() => run.value?.phase ?? 'exploring')
  const chapter = computed<Chapter>(() => run.value?.chapter ?? 'act1')
  const commandRep = computed(() => run.value?.commandRep ?? REP_START)
  const townRep = computed(() => run.value?.townRep ?? REP_START)
  const storyFlags = computed<string[]>(() => run.value?.storyFlags ?? [])
  const loadout = computed<MechLoadout | null>(() => run.value?.loadout ?? null)
  const happyCount = computed(() => happyTownCount(towns.value))
  const finaleUnlocked = computed(() => isFinaleUnlocked(towns.value))
  const remainingFinaleTargets = computed(() => finaleTargets(towns.value))
  const stats = computed<RunStats>(() => run.value?.stats ?? freshStats())
  const realElapsedSec = computed(() => run.value?.realElapsedSec ?? 0)
  /** Number of towns the player made happy (helped) this run. */
  const townsHelped = computed(() => happyCount.value)
  /** Per-town damage reports for the credits screen. */
  const damageReports = computed<TownDamageReport[]>(() =>
    towns.value.map(buildTownDamageReport),
  )
  /** Average percent-destroyed across all towns (0..100). */
  const avgDestruction = computed(() => averageDestruction(towns.value))
  /** Overall verdict/grade derived from total town damage (Q14). */
  const verdict = computed<Verdict>(() => verdictForDamage(avgDestruction.value))

  return {
    // state
    run,
    activeQuest,
    // getters
    salvage,
    money, // deprecated alias of salvage
    inventory,
    towns,
    phase,
    chapter,
    commandRep,
    townRep,
    storyFlags,
    loadout,
    happyCount,
    finaleUnlocked,
    remainingFinaleTargets,
    stats,
    realElapsedSec,
    townsHelped,
    damageReports,
    avgDestruction,
    verdict,
    // persistence
    save,
    load,
    loadOrNew,
    newRun,
    hasSavedRun,
    clearSavedRun,
    // mutations
    addSalvage,
    addMoney, // deprecated alias of addSalvage
    getTown,
    tickTownDecay,
    completeQuest,
    clearTown,
    refreshPhase,
    concludeRun,
    tickElapsed,
    // reputation / flags / consequence economy (Phase 3)
    adjustReputation,
    raiseFlag,
    hasStoryFlag,
    chooseDialogue,
    applyTownCollateral,
    playerDefeated,
    // quests
    getCurrentQuest,
    startQuest,
    clearActiveQuest,
    finishActiveQuest,
    // finale
    beginFinale,
    finaleBossForTown,
    finishFinaleBoss,
    // garage / economy
    buyAndEquip,
    // inventory / salvage
    awardKillSalvage,
    buyPart,
    installFromInventory,
    repairPart,
    sellPart,
  }
}
