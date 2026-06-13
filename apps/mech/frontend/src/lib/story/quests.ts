/**
 * Story Mode quest definitions + economy pricing (Phase 3).
 *
 * Pure, testable module: no Vue, no THREE, no DOM. Defines the three quest
 * types, builds each town's deterministic 3-quest chain, sizes rewards, and
 * prices garage parts by their power tier (design doc Q8/Q12). The in-world
 * encounter logic (spawning enemies/objects, combat) lives in StoryCombat /
 * StoryWorld; this module only describes WHAT a quest is and its payouts.
 */

import type { MechPart, ArmPart } from '../../shared/types/MechTypes'
import { ALL_PARTS } from '../../shared/data/MechParts'
import { QUESTS_PER_CHAIN } from '../../composables/useStoryMode'
import type { AIDifficulty } from '../../composables/useGameSettings'

// ============================================================================
// Quest model
// ============================================================================

export type QuestType = 'wave_defence' | 'hidden_object' | 'boss_hunt'

export interface QuestDef {
  /** Stable id `town-{i}-quest-{q}` (matches TownState.questChain entries). */
  id: string
  townId: string
  /** 0-based slot within the town's chain. */
  index: number
  type: QuestType
  title: string
  /** Quest-giver flavor line (playful tone, Q16). */
  flavor: string
  /** Money paid on completion. */
  reward: number
  // --- Type-specific params (only the relevant ones are populated) ---
  /** Wave Defence: number of escalating enemy mechs to clear. */
  waveCount?: number
  /** Wave Defence / Boss Hunt: base AI difficulty tier for spawned enemies. */
  difficulty?: AIDifficulty
  /** Boss Hunt: stat multiplier applied to the boss profile. */
  bossScale?: number
  /** Hidden Object: the flavor name of the thing to find. */
  objectName?: string
  /** Hidden Object: search radius (world units) the object hides within. */
  searchRadius?: number
}

// ============================================================================
// Chain generation (deterministic per town)
// ============================================================================

/** A town's quest types cycle through the three kinds in a fixed order so each
 *  town has one of each across its 3-quest chain. Offset by town index so the
 *  *first* quest a player meets varies town to town. */
const QUEST_TYPE_ORDER: QuestType[] = ['wave_defence', 'hidden_object', 'boss_hunt']

const WAVE_TITLES = ['Hold the Line', 'They Keep Coming', 'Last Stand at the Gate']
const HIDDEN_TITLES = ['Lost & Found', 'The Missing Heirloom', 'X Marks the Spot']
const BOSS_TITLES = ['Bully on the Hill', 'The Big One', 'Final Eviction Notice']

const HIDDEN_OBJECTS = ['the Mayor’s prize turnip', 'a runaway gravy barrel', 'Granny’s lucky wrench']

const WAVE_FLAVOR = [
  'Bandits incoming! Stomp them before they trample the petunias.',
  'More of ’em! Keep them off the farms, would you kindly?',
]
const HIDDEN_FLAVOR = [
  'We lost something precious out in the weeds. Be a dear and fetch it?',
  'It’s round here somewhere. Walk about until you trip over it.',
]
const BOSS_FLAVOR = [
  'A right nasty mech is squatting nearby. Could you… un-squat it?',
  'One big bully left. Send it packing and we’re square.',
]

/**
 * Reward for a quest scales with chain depth (later quests pay more) and type
 * (boss hunts pay best, hidden objects least). Tuned so a full town chain funds
 * a couple of mid-tier part upgrades.
 */
export function questReward(type: QuestType, index: number): number {
  const base: Record<QuestType, number> = {
    hidden_object: 120,
    wave_defence: 200,
    boss_hunt: 320,
  }
  // +60% by the last quest in a chain.
  const depthMult = 1 + index * 0.3
  return Math.round(base[type] * depthMult)
}

/** Difficulty steps up with chain depth so later quests are tougher. */
function difficultyForIndex(index: number): AIDifficulty {
  return index <= 0 ? 'easy' : index === 1 ? 'medium' : 'hard'
}

/** Build a single quest def for a town slot. Pure + deterministic. */
export function buildQuest(townId: string, townIndex: number, slot: number): QuestDef {
  const type = QUEST_TYPE_ORDER[(slot + townIndex) % QUEST_TYPE_ORDER.length]
  const id = `${townId}-quest-${slot}`
  const reward = questReward(type, slot)

  if (type === 'wave_defence') {
    return {
      id,
      townId,
      index: slot,
      type,
      title: WAVE_TITLES[slot % WAVE_TITLES.length],
      flavor: WAVE_FLAVOR[slot % WAVE_FLAVOR.length],
      reward,
      waveCount: 2 + slot, // 2, 3, 4 enemies across the chain
      difficulty: difficultyForIndex(slot),
    }
  }

  if (type === 'boss_hunt') {
    return {
      id,
      townId,
      index: slot,
      type,
      title: BOSS_TITLES[slot % BOSS_TITLES.length],
      flavor: BOSS_FLAVOR[slot % BOSS_FLAVOR.length],
      reward,
      difficulty: 'boss',
      bossScale: 1 + slot * 0.25, // tougher boss deeper in the chain
    }
  }

  // hidden_object
  return {
    id,
    townId,
    index: slot,
    type,
    title: HIDDEN_TITLES[slot % HIDDEN_TITLES.length],
    flavor: HIDDEN_FLAVOR[slot % HIDDEN_FLAVOR.length],
    reward,
    objectName: HIDDEN_OBJECTS[slot % HIDDEN_OBJECTS.length],
    searchRadius: 28,
  }
}

/** Full 3-quest chain for a town (index order matches TownState.questChain). */
export function buildQuestChain(townId: string, townIndex: number): QuestDef[] {
  return Array.from({ length: QUESTS_PER_CHAIN }, (_, slot) => buildQuest(townId, townIndex, slot))
}

/**
 * The town's currently-offered quest given how far through its chain it is.
 * Returns null once the chain is complete (town happy).
 */
export function currentQuest(townId: string, townIndex: number, questIndex: number): QuestDef | null {
  if (questIndex >= QUESTS_PER_CHAIN) return null
  return buildQuest(townId, townIndex, questIndex)
}

// ============================================================================
// Finale bosses (Phase 4) — strong opponents occupying un-helped towns (Q13)
// ============================================================================

/** Stat multiplier for a finale boss — much tougher than any chain boss hunt. */
export const FINALE_BOSS_SCALE = 2.0

/** Reward for clearing a finale boss (best payout in the game). */
export const FINALE_BOSS_REWARD = 500

const FINALE_BOSS_TITLES = [
  'The Iron Warlord',
  'Old Rustjaw',
  'The Crusher',
  'Lady Havoc',
  'The Final Tyrant',
] as const

const FINALE_BOSS_FLAVOR =
  'A monstrous war machine has rolled in and claimed the ruins. End its reign.'

/**
 * A finale boss encounter for a town the player never helped. It is a single
 * very strong boss-hunt quest (StoryCombat.start handles any QuestDef). The id is
 * suffixed `-finale` so it never collides with the town's chain quest ids and so
 * the host can tell finale completions from chain completions.
 */
export function buildFinaleBoss(townId: string, townIndex: number): QuestDef {
  return {
    id: `${townId}-finale`,
    townId,
    index: QUESTS_PER_CHAIN, // beyond the normal chain
    type: 'boss_hunt',
    title: FINALE_BOSS_TITLES[townIndex % FINALE_BOSS_TITLES.length],
    flavor: FINALE_BOSS_FLAVOR,
    reward: FINALE_BOSS_REWARD,
    difficulty: 'boss',
    bossScale: FINALE_BOSS_SCALE,
  }
}

/** Whether a quest def is a finale boss (vs a town-chain quest). */
export function isFinaleBoss(quest: QuestDef): boolean {
  return quest.id.endsWith('-finale')
}

/** Short human label for a quest type (HUD / dialogue). */
export function questTypeLabel(type: QuestType): string {
  switch (type) {
    case 'wave_defence': return 'Wave Defence'
    case 'hidden_object': return 'Hidden Object'
    case 'boss_hunt': return 'Boss Hunt'
  }
}

/** One-line objective text for the active-quest HUD. */
export function questObjective(quest: QuestDef, progress: number): string {
  switch (quest.type) {
    case 'wave_defence':
      return `Defeat the attackers (${progress}/${quest.waveCount ?? 0})`
    case 'boss_hunt':
      return `Defeat the boss mech`
    case 'hidden_object':
      return progress > 0 ? 'Pick up the object (you found it!)' : `Find ${quest.objectName}`
  }
}

// ============================================================================
// Economy — garage part pricing tiered by power (Q12)
// ============================================================================

/** Rarity → base price multiplier (stronger rarity costs more). */
const RARITY_MULT: Record<MechPart['rarity'], number> = {
  common: 1,
  uncommon: 1.8,
  rare: 3.2,
  legendary: 5.5,
}

/**
 * A rough "power" score for a part from its stat block, so price tracks how much
 * the part actually improves a mech (design doc Q12: priced by power). Firepower
 * and health/armor weigh most; we use absolute values so big stat swings (e.g.
 * the railgun's huge firepower) read as expensive.
 */
export function partPowerScore(part: MechPart): number {
  const s = part.stats
  return (
    Math.abs(s.firepower) * 1.2 +
    Math.abs(s.health) * 0.5 +
    Math.abs(s.armor) * 0.8 +
    Math.abs(s.speed) * 0.6 +
    Math.abs(s.energy) * 0.3 +
    Math.abs(s.accuracy) * 0.7
  )
}

/**
 * Garage price for a part: power score scaled by rarity, rounded to a tidy
 * value. Strong/rare parts (railgun, fusion reactor) land well above what a
 * single early quest pays, so progression paces with quest income.
 */
export function partPrice(part: MechPart): number {
  const raw = partPowerScore(part) * RARITY_MULT[part.rarity] * 0.9
  // Round to the nearest 10 for clean shop numbers, with a sane floor.
  return Math.max(40, Math.round(raw / 10) * 10)
}

export interface ShopPart {
  part: MechPart
  price: number
  /** Loadout slot this part fills. */
  slot: ShopSlot
}

export type ShopSlot = 'leftArm' | 'rightArm' | 'core' | 'legs' | 'head' | 'rack'

/** The slot(s) a part can be equipped into. Arms can go in either hand. */
export function slotsForPart(part: MechPart): ShopSlot[] {
  switch (part.type) {
    case 'arm': return ['leftArm', 'rightArm']
    case 'core': return ['core']
    case 'legs': return ['legs']
    case 'head': return ['head']
    case 'rack': return ['rack']
  }
}

/** Whether a part is a real weapon (not the support shield) — for arm validity. */
export function isWeaponArm(part: MechPart): boolean {
  return part.type === 'arm' && (part as ArmPart).weaponType !== 'support'
}

/** Full catalogue with prices, sorted cheapest-first within each part type. */
export function buildShopCatalogue(): MechPart[] {
  return [...ALL_PARTS].sort((a, b) => partPrice(a) - partPrice(b))
}
