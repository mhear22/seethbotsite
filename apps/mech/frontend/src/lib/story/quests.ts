/**
 * Story Mode quest definitions + economy pricing (Phase 3).
 *
 * Pure, testable module: no Vue, no THREE, no DOM. Defines the three quest
 * types, builds each town's deterministic 3-quest chain, sizes rewards, and
 * prices garage parts by their power tier (design doc Q8/Q12). The in-world
 * encounter logic (spawning enemies/objects, combat) lives in StoryCombat /
 * StoryWorld; this module only describes WHAT a quest is and its payouts.
 *
 * Phase 3 (GRINDER §2.6): the whimsical procedural flavor is gone. Each quest
 * slot now pulls AUTHORED military content — a warden hook, a 2-4 sentence
 * briefing, a completion beat, and the two-axis reputation deltas (§3.7) — from
 * `campaign.ts`, while the deterministic type/id/reward machinery is unchanged.
 * The three archetypes re-skin as: wave_defence -> Hold (Combine raids),
 * hidden_object -> Recovery (on-foot black-box/cache/survivor), boss_hunt ->
 * Sanction (named Combine aces).
 */

import type { MechPart, ArmPart } from '../../shared/types/MechTypes'
import { ALL_PARTS } from '../../shared/data/MechParts'
import { QUESTS_PER_CHAIN } from '../../composables/useStoryMode'
import type { AIDifficulty } from '../../composables/useGameSettings'
import {
  questContent,
  townIdentity,
  aceForTown,
  type QuestContent,
} from './campaign'

// ============================================================================
// Quest model
// ============================================================================

/**
 * Quest kinds. The three ORIGINAL archetypes (wave_defence / hidden_object /
 * boss_hunt — re-skinned Hold / Recovery / Sanction) drive the deterministic
 * chain machinery and the authored five-town arcs. Phase 5 (§5) adds four
 * VARIETY types on the multi-enemy core; each substitutes into a later town's
 * chain within the SAME family (see `questFamily`), so the arc's wave/recovery/
 * boss "shape" is preserved while the moment-to-moment objective varies.
 */
export type QuestType =
  | 'wave_defence'
  | 'hidden_object'
  | 'boss_hunt'
  // Phase 5 variety (§5):
  | 'escort_convoy' // wave-family: protect slow crawlers to a map-edge waypoint
  | 'hold_the_line' // wave-family: defend a barricade prop through timed waves
  | 'extraction' // wave-family: reach a beacon, hold a shrinking perimeter T sec
  | 'ace_hunt' // boss-family: kill a marked roaming ace (+ bodyguard pair)

/**
 * The chain FAMILY a quest type belongs to. Chain placement is deterministic by
 * family, not by exact type: the three base types define the family per slot
 * (`questTypeFor`), and any Phase-5 variety that substitutes into that slot must
 * share the family so the town's authored three-beat arc keeps its wave /
 * recovery / boss shape (§5 "variety without breaking determinism").
 */
export type QuestFamily = 'wave' | 'recovery' | 'boss'

/** The family a quest type belongs to (§5 determinism guard). */
export function questFamily(type: QuestType): QuestFamily {
  switch (type) {
    case 'wave_defence':
    case 'escort_convoy':
    case 'hold_the_line':
    case 'extraction':
      return 'wave'
    case 'hidden_object':
      return 'recovery'
    case 'boss_hunt':
    case 'ace_hunt':
      return 'boss'
  }
}

export interface QuestDef {
  /** Stable id `town-{i}-quest-{q}` (matches TownState.questChain entries). */
  id: string
  townId: string
  /** 0-based slot within the town's chain. */
  index: number
  type: QuestType
  title: string
  /** Quest-giver's terse spoken hook (authored, §2.6). Kept named `flavor` for
   *  UI compatibility (QuestDialog reads it). */
  flavor: string
  /** 2-4 sentence mission briefing shown when accepting (authored, §2.6). */
  briefing: string
  /** Completion beat — the line that advances the town's arc (authored, §2.6). */
  completion: string
  /** Who briefs it (warden name, or the ace's callsign for a finale). */
  giver: string
  /** Command-sanctioned (Hold/Sanction under orders) vs town-initiated (Recovery). §3.7 */
  sanctioned: boolean
  /** Command reputation delta applied on completion (§3.7 axis effects). */
  commandRep: number
  /** Town reputation delta applied on completion (§3.7 axis effects). */
  townRep: number
  /** Salvage paid on completion. */
  reward: number
  // --- Type-specific params (only the relevant ones are populated) ---
  /** Wave Defence: number of escalating enemy mechs to clear. */
  waveCount?: number
  /** Wave Defence / Boss Hunt: base AI difficulty tier for spawned enemies. */
  difficulty?: AIDifficulty
  /** Boss Hunt: stat multiplier applied to the boss profile. */
  bossScale?: number
  /** Boss Hunt: the target's callsign (StoryCombat names the boss mech with it,
   *  so the HUD + reinforcement callout read as a person). */
  bossName?: string
  /** Hidden Object: the flavor name of the thing to find. */
  objectName?: string
  /** Hidden Object: search radius (world units) the object hides within. */
  searchRadius?: number
  /**
   * Recovery (hidden_object) only: whether the search is walked ON FOOT inside the
   * town, vs driven as a mech-scale field encounter (§4, Phase 4). On-foot
   * recoveries hide their target within town bounds (searchRadius fits inside
   * TOWN_DECAY_RADIUS) and are DECAY-FREE by the keystone rule (§4.2) — the town
   * does not decay while the pilot is out of the cockpit. A field-wreck recovery
   * outside town stays mech-scale (`onFoot: false`, larger radius). The five
   * authored Talus Reach recoveries (black box, pit survivor, missing kid, lost
   * pilgrim, buried cache) are all in-town, on-foot by design (§2.6). */
  onFoot?: boolean

  // --- Phase 5 variety params (§5) — only the relevant type populates each ---
  /** escort_convoy: number of slow convoy crawlers to shepherd (2-3). */
  escortCount?: number
  /** escort_convoy: distance (world units) from the town gate to the map-edge
   *  waypoint the convoy must reach. */
  waypointDistance?: number
  /** escort_convoy: total Combine interceptors that harass across the run. */
  interceptorCount?: number
  /** hold_the_line: number of timed assault waves to survive. */
  holdWaves?: number
  /** hold_the_line: breather seconds between cleared waves. */
  breatherSeconds?: number
  /** hold_the_line: barricade prop hit points (fail if it is destroyed). */
  barricadeHp?: number
  /** extraction: seconds to hold the shrinking perimeter once the beacon is reached. */
  holdSeconds?: number
  /** extraction: distance (world units) out to the downed-pilot beacon. */
  beaconDistance?: number
  /** extraction: starting perimeter ring radius (shrinks to a floor over holdSeconds). */
  perimeterRadius?: number
  /** ace_hunt: number of bodyguard mechs escorting the ace (design: a pair). */
  bodyguardCount?: number
}

/**
 * On-foot Recovery search radius (world units). Sized to sit INSIDE town bounds
 * (TOWN_DECAY_RADIUS = 60) so the target hides within the walkable town and the
 * pilot reaches it on foot — decay-free by §4.2. StoryCombat rings the object in
 * [inner, searchRadius]; keeping this < the decay radius keeps it in-town. */
export const ON_FOOT_SEARCH_RADIUS = 28

// ── Phase 5 variety tuning (§5) — baseline mechanical params per new type ────
// buildQuest reads these and ramps a few by chain depth (`slot`). They are the
// single knob surface for balancing the variety missions; StoryCombat consumes
// the resolved QuestDef fields and never hardcodes these numbers.

/** escort_convoy: crawlers in the convoy (design: 2-3 slow haulers). */
export const ESCORT_CRAWLER_COUNT = 3
/** escort_convoy: gate → map-edge waypoint distance the convoy must cross. */
export const ESCORT_WAYPOINT_DISTANCE = 220
/** hold_the_line: timed assault waves to survive. */
export const HOLD_WAVES = 3
/** hold_the_line: breather seconds between cleared waves. */
export const HOLD_BREATHER_SECONDS = 6
/** hold_the_line: barricade prop HP at slot 0 (ramps with depth). */
export const HOLD_BARRICADE_HP = 900
/** extraction: seconds to hold the shrinking perimeter once the beacon is reached. */
export const EXTRACTION_HOLD_SECONDS = 45
/** extraction: field distance out to the downed-pilot beacon. */
export const EXTRACTION_BEACON_DISTANCE = 160
/** extraction: starting perimeter radius (StoryCombat shrinks it to a floor). */
export const EXTRACTION_PERIMETER_RADIUS = 34
/** ace_hunt: bodyguard mechs escorting the roaming ace (design: a pair). */
export const ACE_HUNT_BODYGUARDS = 2

// ============================================================================
// Chain generation (deterministic per town)
// ============================================================================

/** A town's quest types cycle through the three kinds in a fixed order so each
 *  town has one of each across its 3-quest chain. Offset by town index so the
 *  *first* quest a player meets varies town to town. The authored content in
 *  campaign.ts (CAMPAIGN_QUESTS[townIndex][slot]) is written to match the type
 *  this order produces for every slot — pinned by a determinism test. */
const QUEST_TYPE_ORDER: QuestType[] = ['wave_defence', 'hidden_object', 'boss_hunt']

/**
 * The FAMILY-defining type this deterministic machinery assigns to a
 * (townIndex, slot). The authored CAMPAIGN_QUESTS entry for that slot may carry
 * a Phase-5 VARIETY type, but its `questFamily` must equal this type's family —
 * so the town's three-beat wave/recovery/boss arc is preserved even when the
 * exact objective varies. A determinism test pins `questFamily(content.type) ===
 * questFamily(questTypeFor(t, s))` for every shipping slot.
 */
export function questTypeFor(townIndex: number, slot: number): QuestType {
  return QUEST_TYPE_ORDER[(slot + townIndex) % QUEST_TYPE_ORDER.length]
}

/**
 * Reward for a quest scales with chain depth (later quests pay more) and type.
 * Ordering within a family holds (a Sanction/ace hunt pays best, a Recovery
 * least); the Phase-5 variety types pay a small premium over their plain-family
 * base for their extra objective complexity. Tuned so a full town chain funds a
 * couple of mid-tier part upgrades.
 */
export function questReward(type: QuestType, index: number): number {
  const base: Record<QuestType, number> = {
    hidden_object: 120,
    wave_defence: 200,
    escort_convoy: 240,
    hold_the_line: 240,
    extraction: 260,
    boss_hunt: 320,
    ace_hunt: 360,
  }
  // +60% by the last quest in a chain.
  const depthMult = 1 + index * 0.3
  return Math.round(base[type] * depthMult)
}

/** Difficulty steps up with chain depth so later quests are tougher. */
function difficultyForIndex(index: number): AIDifficulty {
  return index <= 0 ? 'easy' : index === 1 ? 'medium' : 'hard'
}

/**
 * Fallback content if a town/slot has no authored entry (e.g. a 6th town beyond
 * the five Talus Reach settlements). Keeps buildQuest total — content should
 * always be authored for the shipping five, guarded by the determinism test.
 */
function fallbackContent(type: QuestType): QuestContent {
  return {
    type,
    title: type === 'wave_defence' ? 'Hold' : type === 'boss_hunt' ? 'Sanction' : 'Recovery',
    hook: 'There is work here. Take it or leave it.',
    briefing: 'A Combine action threatens the settlement. Resolve it and move on.',
    completion: 'The action is resolved. The settlement holds, for now.',
    sanctioned: type !== 'hidden_object',
    commandRep: type === 'hidden_object' ? -2 : 8,
    townRep: type === 'hidden_object' ? 12 : 6,
    objectName: type === 'hidden_object' ? 'the recovery target' : undefined,
  }
}

/**
 * Build a single quest def for a town slot. Pure + deterministic.
 *
 * The RESOLVED type comes from the authored content (`content.type`), which is
 * the source of truth for what the mission actually is — early towns author the
 * plain three types, later towns author Phase-5 variety within the same family
 * (§5). `questTypeFor` still supplies the family (and the fallback type when a
 * slot is unauthored, e.g. a hypothetical sixth town). Mechanical params are
 * layered on per resolved type from the tuning constants above.
 */
export function buildQuest(townId: string, townIndex: number, slot: number): QuestDef {
  const id = `${townId}-quest-${slot}`
  const content = questContent(townIndex, slot) ?? fallbackContent(questTypeFor(townIndex, slot))
  const type = content.type
  const reward = questReward(type, slot)
  const giver = townIdentity(townIndex)?.warden.name ?? 'The warden'

  const common = {
    id,
    townId,
    index: slot,
    type,
    title: content.title,
    flavor: content.hook,
    briefing: content.briefing,
    completion: content.completion,
    giver,
    sanctioned: content.sanctioned,
    commandRep: content.commandRep,
    townRep: content.townRep,
    reward,
  }

  switch (type) {
    case 'wave_defence':
      return {
        ...common,
        waveCount: 2 + slot, // 2, 3, 4 enemies across the chain
        difficulty: difficultyForIndex(slot),
      }

    case 'boss_hunt':
      return {
        ...common,
        difficulty: 'boss',
        bossScale: 1 + slot * 0.25, // tougher boss deeper in the chain
        bossName: content.target ?? `${content.title} target`,
      }

    // ── Phase 5 variety (§5) ────────────────────────────────────────────
    case 'escort_convoy':
      return {
        ...common,
        escortCount: ESCORT_CRAWLER_COUNT,
        waypointDistance: ESCORT_WAYPOINT_DISTANCE,
        interceptorCount: 4 + slot * 2, // more harassers deeper in the chain
        difficulty: difficultyForIndex(slot),
      }

    case 'hold_the_line':
      return {
        ...common,
        holdWaves: HOLD_WAVES,
        breatherSeconds: HOLD_BREATHER_SECONDS,
        barricadeHp: Math.round(HOLD_BARRICADE_HP * (1 + slot * 0.15)),
        difficulty: difficultyForIndex(slot),
      }

    case 'extraction':
      return {
        ...common,
        holdSeconds: EXTRACTION_HOLD_SECONDS,
        beaconDistance: EXTRACTION_BEACON_DISTANCE,
        perimeterRadius: EXTRACTION_PERIMETER_RADIUS,
        difficulty: difficultyForIndex(slot),
      }

    case 'ace_hunt':
      return {
        ...common,
        difficulty: 'boss',
        bossScale: 1 + slot * 0.25,
        bossName: content.target ?? `${content.title} target`,
        bodyguardCount: ACE_HUNT_BODYGUARDS,
      }

    // hidden_object (Recovery) — on-foot, in-town, decay-free (§4.2).
    case 'hidden_object':
      return {
        ...common,
        objectName: content.objectName ?? 'the recovery target',
        searchRadius: ON_FOOT_SEARCH_RADIUS,
        onFoot: true,
      }
  }
}

/**
 * Whether a quest is an on-foot Recovery: a hidden_object accepted (from a warden,
 * the mission board, or in the street) that is walked on foot inside town bounds,
 * decay-free by the keystone rule (§4.2). Combat/field recoveries (`onFoot: false`)
 * stay mech-scale. The integrator reads this to route acceptance: an on-foot
 * Recovery dismounts (or stays dismounted) and marks its search area as a walkable
 * objective; everything else mounts up and drives out.
 */
export function isOnFootRecovery(quest: QuestDef): boolean {
  return quest.type === 'hidden_object' && quest.onFoot === true
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
// Mission board (Phase 4 §4.5) — the warden-office board, data-driven
// ============================================================================

/** Where a quest sits relative to the town's chain progress. */
export type MissionStatus = 'completed' | 'available' | 'locked'

/**
 * One row on the warden-office mission board. Pure/derived from the deterministic
 * chain + the town's `questIndex`, so MissionBoard.vue is fully data-driven (like
 * the P3 components). The board lists the WHOLE chain: cleared beats read as done,
 * the current beat is acceptable (routes the SAME accept flow as warden dialogue),
 * and later beats are shown locked so the arc reads as a three-beat story.
 */
export interface MissionBoardEntry {
  quest: QuestDef
  status: MissionStatus
  /** Re-skinned type label (Hold / Recovery / Sanction). */
  typeLabel: string
  /** One-line briefing for the board row (the warden's terse hook). */
  oneLine: string
  /** Reputation-axis tags for the row (§3.7): who this beat serves. */
  rep: { command: number; town: number; sanctioned: boolean }
  /** True for on-foot in-town Recovery (§4): the board can flag it "on foot". */
  onFoot: boolean
}

/**
 * Build the full mission board for a town given how far through its chain it is.
 * `questIndex` is the town's progress (0..QUESTS_PER_CHAIN). Rows before it are
 * completed, the row at it is available, rows after it are locked. Deterministic
 * and pure — MissionBoard.vue renders the returned rows and emits `accept` with
 * the `available` row's quest, which the host routes exactly like the dialogue
 * `acceptQuest` action.
 */
export function buildMissionBoard(
  townId: string,
  townIndex: number,
  questIndex: number,
): MissionBoardEntry[] {
  return buildQuestChain(townId, townIndex).map((quest) => {
    const status: MissionStatus =
      quest.index < questIndex ? 'completed' : quest.index === questIndex ? 'available' : 'locked'
    return {
      quest,
      status,
      typeLabel: questTypeLabel(quest.type),
      oneLine: quest.flavor,
      rep: { command: quest.commandRep, town: quest.townRep, sanctioned: quest.sanctioned },
      onFoot: isOnFootRecovery(quest),
    }
  })
}

/** Whether the town has an acceptable mission on its board (chain not finished). */
export function boardHasOpenMission(questIndex: number): boolean {
  return questIndex < QUESTS_PER_CHAIN
}

// ============================================================================
// Finale bosses (Phase 4) — strong opponents occupying un-helped towns (Q13)
// ============================================================================

/** Stat multiplier for a finale boss — much tougher than any chain boss hunt. */
export const FINALE_BOSS_SCALE = 2.0

/** Reward for clearing a finale boss (best payout in the game). */
export const FINALE_BOSS_REWARD = 500

/**
 * A finale boss encounter for a town the player never helped — a named Combine
 * ace who moved in when Command wrote the town off (§2.5). The ace identity
 * (name, epithet, intro) comes from campaign.CAMPAIGN_ACES; the ace's `name`
 * becomes the quest title, which StoryCombat threads onto the boss mech so the
 * reinforcement callout and HUD read as a person, not "Town Bully". Clearing one
 * against Vaun's withdrawal order is the Act III defiance beat, so it pays Town
 * standing while costing Command standing (§3.7). The id is suffixed `-finale`
 * so it never collides with a town's chain quest ids.
 */
export function buildFinaleBoss(townId: string, townIndex: number): QuestDef {
  const ace = aceForTown(townIndex)
  const giver = townIdentity(townIndex)?.warden.name ?? 'The Reach'
  const name = ace ? `${ace.name} "${ace.epithet}"` : 'Combine Warlord'
  return {
    id: `${townId}-finale`,
    townId,
    index: QUESTS_PER_CHAIN, // beyond the normal chain
    type: 'boss_hunt',
    title: name,
    flavor: ace?.intro ?? 'A Combine ace has claimed the ruins. End its hold.',
    briefing:
      ace?.intro ??
      'A named Combine ace holds this settlement, seized after Command wrote it off. Take it back — off the books, against the withdrawal order.',
    completion: ace
      ? `${ace.name} is down and the town is yours again — held against orders, at the cost of your standing with Command. The Reach will remember who came back for it.`
      : 'The ace is down and the town is reclaimed against orders.',
    giver,
    // Reclaiming an abandoned town defies Command (§3.7): Town loves it, Command does not.
    sanctioned: false,
    commandRep: -10,
    townRep: 25,
    reward: FINALE_BOSS_REWARD,
    difficulty: 'boss',
    bossScale: FINALE_BOSS_SCALE,
    bossName: name,
  }
}

/** Whether a quest def is a finale boss (vs a town-chain quest). */
export function isFinaleBoss(quest: QuestDef): boolean {
  return quest.id.endsWith('-finale')
}

/** Short human label for a quest type, re-skinned to the fiction (§2.6 / §5). */
export function questTypeLabel(type: QuestType): string {
  switch (type) {
    case 'wave_defence': return 'Hold'
    case 'hidden_object': return 'Recovery'
    case 'boss_hunt': return 'Sanction'
    case 'escort_convoy': return 'Escort'
    case 'hold_the_line': return 'Defend'
    case 'extraction': return 'Extraction'
    case 'ace_hunt': return 'Ace Hunt'
  }
}

/**
 * One-line objective text for the active-quest HUD. `progress` is the type's
 * primary counter: enemies cleared (waves), search state (recovery), crawlers
 * still rolling (escort), waves survived (defend), seconds left / phase
 * (extraction), or unused (hunts).
 */
export function questObjective(quest: QuestDef, progress: number): string {
  switch (quest.type) {
    case 'wave_defence':
      return `Repel the Combine push (${progress}/${quest.waveCount ?? 0})`
    case 'boss_hunt':
      return `Sanction the target`
    case 'hidden_object':
      return progress > 0 ? `Recover ${quest.objectName}` : `Locate ${quest.objectName}`
    case 'escort_convoy':
      return `Get the convoy to the waypoint (${progress}/${quest.escortCount ?? 0} rolling)`
    case 'hold_the_line':
      return `Hold the barricade (wave ${progress}/${quest.holdWaves ?? 0})`
    case 'extraction':
      return progress > 0 ? `Hold the perimeter (${progress}s)` : `Reach the downed pilot's beacon`
    case 'ace_hunt':
      return `Hunt down ${quest.bossName ?? 'the ace'}`
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
