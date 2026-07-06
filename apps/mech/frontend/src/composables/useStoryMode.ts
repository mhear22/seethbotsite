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

// ============================================================================
// Constants (v1 tuning — see docs/STORY_MODE_DESIGN.md §0)
// ============================================================================

/** localStorage key for the single active run (Q15). The key is the *slot*, not
 *  the schema version — it stays stable across version bumps so `deserializeRun`
 *  can read an older payload from the same slot and migrate it in place. */
export const STORY_SAVE_KEY = 'mech-story-v1'

/** Current save schema version. v1 -> v2 adds `run.inventory` (Phase 2 salvage). */
export const SAVE_VERSION = 2 as const

// ---- Salvage economy tuning (Phase 2 §3.7). Documented defaults where the
// design left the numbers open. ----

/** Scrap (salvage currency) granted per unit of a killed enemy's total part power. */
export const SALVAGE_SCRAP_PER_POWER = 0.15
/** Minimum scrap paid for any kill, so a stripped-down enemy still pays out. */
export const SALVAGE_SCRAP_FLOOR = 20
/** Chance an *intact* enemy slot drops its part (pristine) on kill. */
export const SALVAGE_INTACT_DROP_CHANCE = 0.25
/** Chance a slot the player *destroyed* drops its part (damaged) on kill.
 *  1.0 = you shot the limb off, you always get the wreck to repair. */
export const SALVAGE_DESTROYED_DROP_CHANCE = 1.0
/** Repair fee for a damaged part, as a fraction of its shop price. */
export const REPAIR_PRICE_FRACTION = 0.35
/** Sell refund fraction of shop price for a pristine inventory part. */
export const SELL_PRICE_FRACTION_PRISTINE = 0.4
/** Sell refund fraction of shop price for a damaged inventory part. */
export const SELL_PRICE_FRACTION_DAMAGED = 0.2

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
  money: number
  /** Owned-but-unequipped parts (bought or salvaged). Equipping pulls from here. */
  inventory: InventoryItem[]
  /** The mech being built up this run (starts from the Starter, Q10). */
  loadout: MechLoadout
  towns: TownState[]
  phase: StoryPhase
  startedAt: number
  /** Total real seconds elapsed in the run (accrued while playing). */
  realElapsedSec: number
  /** Cumulative run stats for the credits report. */
  stats: RunStats
}

// ============================================================================
// Pure helpers (testable — no Vue / no DOM)
// ============================================================================

/** Funny town names (Q16). Index order is stable so positions stay deterministic. */
export const TOWN_NAMES = [
  'Dunderhollow',
  'Lower Wobbleton',
  'Crumpetshire',
  'Gravy Falls',
  'Mudpuddle Crossing',
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
    money: 0,
    inventory: [],
    loadout: buildStarterLoadout(),
    towns: createTowns(),
    phase: 'exploring',
    startedAt: now,
    realElapsedSec: 0,
    stats: freshStats(),
  }
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
  run.money += scrap
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
 * Parse + migrate a saved run. Returns null on anything unusable — malformed JSON,
 * a missing towns array, or an unknown/future schema version — so a bad slot fails
 * cleanly (caller starts fresh) rather than crashing. Known older versions are run
 * through the migration chain (v1 -> v2 -> …) before the run is rebuilt.
 */
export function deserializeRun(raw: string): StoryRun | null {
  try {
    const data = JSON.parse(raw) as Record<string, unknown> | null
    if (!data || typeof data !== 'object' || !Array.isArray(data.towns)) return null

    // --- Migration chain: step any known older schema up to SAVE_VERSION. ---
    let migrated: Record<string, unknown>
    if (data.version === 1) migrated = migrateV1toV2(data)
    else if (data.version === SAVE_VERSION) migrated = data
    else return null // unknown / future version -> clean rejection, never a crash

    const stats = migrated.stats as Partial<RunStats> | undefined
    return {
      version: SAVE_VERSION,
      money: typeof migrated.money === 'number' ? migrated.money : 0,
      inventory: sanitizeInventory(migrated.inventory),
      loadout: deserializeLoadout(migrated.loadout as SerializedLoadout),
      towns: migrated.towns as TownState[],
      phase: (migrated.phase as StoryPhase) ?? 'exploring',
      startedAt: (migrated.startedAt as number) ?? Date.now(),
      realElapsedSec: (migrated.realElapsedSec as number) ?? 0,
      stats: {
        questsCompleted: stats?.questsCompleted ?? 0,
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

  function addMoney(amount: number): void {
    if (!run.value) return
    run.value.money = Math.max(0, run.value.money + amount)
    if (amount > 0) run.value.stats.moneyEarned += amount
    save()
  }

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

  /** Re-evaluate phase from town state: unlock finale at >=3 happy; end when all targets cleared. */
  function refreshPhase(): void {
    if (!run.value || run.value.phase === 'ended') return
    const towns = run.value.towns
    if (run.value.phase === 'exploring') {
      if (isFinaleUnlocked(towns)) run.value.phase = 'finale'
    }
    if (run.value.phase === 'finale') {
      if (finaleTargets(towns).length === 0) run.value.phase = 'ended'
    }
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
    const price = partPrice(part)
    if (run.value.money < price) {
      return { ok: false, reason: `Not enough money (need ${price}).` }
    }

    // Build a candidate loadout with the part equipped and validate it.
    const candidate: MechLoadout = { ...run.value.loadout, [slot]: part as never }
    const reason = loadoutInvalidReason(candidate)
    if (reason) return { ok: false, reason }

    run.value.loadout = candidate
    run.value.money -= price
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
    if (run.value.money < price) return { ok: false, reason: `Not enough salvage (need ${price}).` }
    const item: InventoryItem = {
      instanceId: nextInstanceId(run.value.inventory),
      partId: part.id,
      condition: 'pristine',
    }
    run.value.inventory.push(item)
    run.value.money -= price
    save()
    return { ok: true, item }
  }

  /**
   * Install an owned (pristine) inventory instance into a slot. Validates slot
   * fit + loadout legality (same rules as buyAndEquip). On success the instance is
   * consumed and any displaced part is returned to the inventory (pristine), so a
   * swap never destroys the part you took off. Damaged parts are refused until
   * repaired. Caller applies the new loadout to the world (StoryWorld.applyLoadout).
   */
  function installFromInventory(instanceId: string, slot: ShopSlot): { ok: boolean; reason?: string } {
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
    save()
    return { ok: true }
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
    if (run.value.money < cost) return { ok: false, reason: `Not enough salvage to repair (need ${cost}).` }
    run.value.money -= cost
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

  // --- Getters ---

  const money = computed(() => run.value?.money ?? 0)
  const inventory = computed<InventoryItem[]>(() => run.value?.inventory ?? [])
  const towns = computed<TownState[]>(() => run.value?.towns ?? [])
  const phase = computed<StoryPhase>(() => run.value?.phase ?? 'exploring')
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
    money,
    inventory,
    towns,
    phase,
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
    addMoney,
    getTown,
    tickTownDecay,
    completeQuest,
    clearTown,
    refreshPhase,
    tickElapsed,
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
