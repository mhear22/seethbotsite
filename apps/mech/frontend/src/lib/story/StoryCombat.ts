import * as THREE from 'three'
import { markRaw } from 'vue'
import { MechEntity } from '../battle/MechEntity'
import { EnemyAI, type EnemyArchetype } from '../battle/EnemyAI'
import { ProjectileSystem } from '../battle/ProjectileSystem'
import { ParticleSystem } from '../battle/ParticleSystem'
import {
  archetypeStats,
  archetypeLoadout,
  weaponProjectileSpeed,
  maxAliveForDifficulty,
  compositionForDifficulty,
  reinforcementComposition,
  convoyInterceptorComposition,
  holdLineComposition,
  extractionPressComposition,
  aceBodyguardComposition,
} from '../battle/enemyGeneration'
import type { AIDifficulty } from '../../composables/useGameSettings'
import type { MechSlot } from '../../shared/types/MechTypes'
import type { MechLoadout } from '../../composables/useMechBuilder'
import type { QuestDef } from './quests'
import {
  COLLATERAL_SEVERITY_PER_PLAYER_HIT,
  COLLATERAL_SEVERITY_PER_COMBAT_SECOND,
} from '../../composables/useStoryMode'

/**
 * Per-enemy bundle: the mech, its own AI brain, its weapon cooldowns, and the
 * archetype it was spawned as. Each enemy in a wave gets an independent AI so
 * they can flank/strafe separately.
 */
interface CombatEnemy {
  mech: MechEntity
  ai: EnemyAI
  lastShot: number
  archetype: EnemyArchetype
  /** Named-ace boss (drives the half-health reinforcement script). */
  isBoss: boolean
  /** Limb slots shot off this fight — the guaranteed-damaged salvage drops (§3.6). */
  destroyedSlots: MechSlot[]
}

/** Payload the host consumes to award salvage for a killed enemy (§3.6/§3.7). */
export interface EnemyKill {
  /** The killed enemy's loadout — its parts are the salvage drop pool. */
  loadout: MechLoadout
  /** Limb slots destroyed during the fight (drop damaged, guaranteed). */
  destroyedSlots: MechSlot[]
  archetype: EnemyArchetype
  isBoss: boolean
  /**
   * ace_hunt (§5.4): the marked ace drops a GUARANTEED pristine part from its
   * loadout. When set, the host's awardKillSalvage must roll one equipped part as
   * a pristine (undamaged) drop rather than the normal chance-based roll.
   */
  pristineDrop?: boolean
}

/**
 * Outcome payload handed to onComplete alongside the quest (§5). Backward
 * compatible — existing single-arg wiring ignores it. `rewardMultiplier` lets a
 * partial success (an escort that lost crawlers) pay less than a clean run; the
 * host multiplies the quest's base reward by it.
 */
export interface CombatOutcome {
  /** Multiplier the host applies to quest.reward (1 = full; <1 = degraded). */
  rewardMultiplier: number
  /** escort_convoy: crawlers that reached the waypoint. */
  crawlersSaved?: number
  /** escort_convoy: crawlers lost en route. */
  crawlersLost?: number
}

/** Story pacing: how much the quest difficulty tier scales archetype stats. */
const TIER_SCALE: Record<AIDifficulty, number> = {
  tutorial: 0.8,
  easy: 0.9,
  medium: 1.0,
  hard: 1.15,
  boss: 1.3,
}

/**
 * New Game+ enemy toughness multiplier (§5). Each completed cycle fields machines
 * ~one difficulty tier tougher — 0.15 mirrors the largest step in TIER_SCALE
 * (hard→boss). Multiplies the per-encounter scale for EVERY spawned enemy (waves,
 * boss, guards, reinforcements) so the whole cycle ramps, not just one fight.
 * Cycle 0 returns 1 (no change), keeping first-run balance identical.
 */
export function ngPlusEnemyScale(level: number): number {
  return 1 + 0.15 * Math.max(0, Math.floor(level))
}

/**
 * Radius (world units) around the town centre inside which combat collateral
 * (explosions, stray ordnance) registers. Mirrors useStoryMode's decay radius;
 * kept local so this module stays free of the story-state composable.
 */
const COLLATERAL_RADIUS = 60

/** Snapshot the host reads each frame to drive HUD / completion. */
export interface CombatProgress {
  /** Enemies cleared so far this encounter (wave/boss). */
  cleared: number
  /** Total enemies in this encounter. */
  total: number
  /** Hidden Object: whether the object has been revealed (player got close). */
  found: boolean
  /** Hidden Object: whether the object has been collected (quest done). */
  collected: boolean
  /** True once the whole encounter is complete. */
  complete: boolean
  // --- Phase 5 variety readouts (§5) — populated only for the relevant type ---
  /** escort_convoy: crawlers still rolling. */
  crawlersAlive?: number
  /** escort_convoy: crawlers that reached the waypoint. */
  crawlersArrived?: number
  /** escort_convoy / any convoy: total crawlers dispatched. */
  crawlersTotal?: number
  /** hold_the_line: current wave (1-based) and total; barricade HP fraction 0..1. */
  waveIndex?: number
  waveTotal?: number
  barricadeFraction?: number
  /** extraction: current phase and seconds left in the hold; perimeter fraction 0..1. */
  extractionPhase?: 'reach' | 'hold'
  secondsLeft?: number
  perimeterFraction?: number
}

// ── Phase 5 mission-variety tuning (§5) — local to the encounter driver ──────
/** escort_convoy: crawler ground speed (u/s). Deliberately slow — the escort is
 *  paced by the convoy, not the player. */
const CONVOY_SPEED = 9
/** escort_convoy: distance to the waypoint at which a crawler counts as arrived. */
const CONVOY_ARRIVE_RADIUS = 12
/** escort_convoy: an interceptor within this range of a crawler chips its HP. */
const CONVOY_HARASS_RADIUS = 42
/** escort_convoy: crawler HP loss per second per harassing interceptor. */
const CONVOY_HARASS_DPS = 16
/** escort_convoy: crawler hit points. No weapons, no armour — just endurance. */
const CRAWLER_HP = 260
/** escort_convoy: obstacle-avoidance radius (crawlers steer around mechs + siblings). */
const CONVOY_AVOID_RADIUS = 11
/** hold_the_line: an enemy within this range of the barricade damages it. */
const BARRICADE_THREAT_RADIUS = 30
/** hold_the_line: barricade HP loss per second per enemy in range. */
const BARRICADE_DPS = 20
/** extraction: player proximity to the beacon that flips reach -> hold. */
const EXTRACTION_REACH_RADIUS = 14
/** extraction: the perimeter ring never shrinks below this radius. */
const EXTRACTION_PERIMETER_FLOOR = 10

/** One convoy hauler (escort_convoy). Boxy, unarmed, HP only (§5.1). */
interface Crawler {
  mesh: THREE.Group
  hp: number
  maxHp: number
  alive: boolean
  arrived: boolean
}

/**
 * Single-player combat encounter driver for Story Mode. Spawns the active
 * quest's enemies (or hidden object) near a town, runs the same combat sim as
 * BattleScene (AI, projectiles, collisions, damage, death VFX), and reports
 * progress so the host can complete the quest.
 *
 * It does NOT own the scene/renderer/camera — StoryWorld passes those in and
 * calls update() each frame. All THREE objects are markRaw via the systems they
 * come from; the class itself must not be made reactive.
 */
export class StoryCombat {
  private scene: THREE.Scene
  private projectiles: ProjectileSystem
  private particles: ParticleSystem

  private enemies: CombatEnemy[] = []
  private quest: QuestDef | null = null
  /** Town centre the encounter is anchored to. */
  private anchor = new THREE.Vector3()
  private arenaHalf = 100

  // Hidden Object state.
  private hiddenObject: THREE.Group | null = null
  private hiddenGeoms: THREE.BufferGeometry[] = []
  private hiddenMats: THREE.Material[] = []
  private objectFound = false
  private objectCollected = false

  // Wave Defence pacing: spawn enemies in small batches as the player clears them.
  private waveSpawnQueue: number = 0 // enemies still to spawn for the current wave quest
  private waveDifficulty: AIDifficulty = 'easy'
  private waveTierScale = 1
  /** New Game+ toughness multiplier (§5); 1 on the first cycle. Set once per
   *  session by the host via setNgPlusLevel and folded into every enemy spawn. */
  private ngPlusScale = 1
  private waveBatchTimer = 0
  private clearedCount = 0
  private totalCount = 0
  /** Monotonic count of enemies spawned this encounter — drives the toughness
   *  ramp + name index without depending on the (per-type) totalCount meaning. */
  private waveSpawnedTotal = 0
  /** Archetype pool the current encounter's waves cycle through (per-type, §5).
   *  Empty = fall back to compositionForDifficulty (plain wave_defence). */
  private waveComposition: EnemyArchetype[] = []
  /** Centre spawned enemies ring around (town gate by default; the beacon for
   *  extraction, the convoy for escort) so field encounters spawn in the field. */
  private spawnCenter = new THREE.Vector3()

  // Boss (Sanction / named ace) state — drives the half-health reinforcement
  // script (§3.6). `boss` is the ace unit; `bossReinforced` latches so the
  // reinforcement pair spawns exactly once when it crosses 50% HP.
  private boss: CombatEnemy | null = null
  private bossReinforced = false
  private bossScale = 1

  // --- Phase 5 variety state (§5) ---
  // Shared prop bookkeeping for disposal (crawlers/barricade/beacon/perimeter).
  private propGeoms: THREE.BufferGeometry[] = []
  private propMats: THREE.Material[] = []

  // escort_convoy
  private crawlers: Crawler[] = []
  private convoyWaypoint = new THREE.Vector3()
  private crawlersArrived = 0
  private crawlersLost = 0

  // hold_the_line
  private barricade: THREE.Mesh | null = null
  private barricadeHp = 0
  private barricadeMaxHp = 0
  private holdWaveIndex = 0 // waves fully spawned so far
  private holdWaveTotal = 0
  private holdBreather = 0 // seconds left before the next wave
  private holdWaveOnField = false // a wave currently has enemies to clear

  // extraction
  private beacon: THREE.Group | null = null
  private perimeterRing: THREE.Mesh | null = null
  private extractionPhase: 'reach' | 'hold' = 'reach'
  private extractionSeconds = 0
  private extractionHoldTotal = 0
  private extractionPerimeterR = 0

  private elapsed = 0

  // Player firing cooldowns (the world drives player firing through us so the
  // single combat path matches BattleScene's dual-arm logic).
  private lastLeftShot = 0
  private lastRightShot = 0

  /**
   * Fired when the encounter is fully complete (all enemies dead / object got /
   * convoy delivered / perimeter held / ace down). The optional `outcome` carries
   * a reward multiplier and per-type detail (§5); existing single-arg wiring
   * simply ignores it and pays the full reward.
   */
  onComplete?: (quest: QuestDef, outcome?: CombatOutcome) => void
  /**
   * Fired when a variety objective FAILS without the player being destroyed (§5):
   * escort_convoy loses every crawler, or hold_the_line's barricade is destroyed.
   * The host treats it as a failed mission (no reward, no chain advance) and ends
   * the encounter. `reason` is a short machine tag for the HUD banner. Player
   * DEATH still routes through onPlayerDefeated (the death-stakes path), not here.
   */
  onQuestFailed?: (quest: QuestDef, reason: string) => void
  /**
   * Fired when the player mech is destroyed during an encounter. Carries the
   * limb slots the player lost in the fight (from MechEntity.destroyedSlots, core
   * excluded) so the host can strip them into the inventory as damaged repair
   * debt (§3.7 death stakes).
   */
  onPlayerDefeated?: (destroyedSlots: MechSlot[]) => void
  /** Camera shake hook (host wires CameraController.triggerShake). */
  onShake?: (amount: number) => void
  /**
   * Collateral hook (§3.5): fired when combat harms the town. Reshaped in Phase 3
   * to the SYSTEMS severity contract — collateral is dominated by **hits the
   * player takes** and **combat-seconds spent near town**, and is NEVER driven by
   * the player landing shots or by kill/AoE explosions (those emit 0). `amount`
   * is a distance-tapered severity (full weight at the town centre, tapering to 0
   * at COLLATERAL_RADIUS); `position` is the world impact point. The host routes
   * it into useStoryMode.applyTownCollateral (a gentle one-way condition drop).
   */
  onCollateral?: (amount: number, position: THREE.Vector3) => void
  /**
   * Comms-style HUD callout hook (§3.6): fired once when a named ace calls in
   * its half-health reinforcement pair, so the host can surface a "hostile
   * reinforcements inbound" banner. Phase 2 emits; the HUD lands in Phase 3.
   */
  onReinforcement?: (info: { bossName: string; count: number }) => void
  /**
   * Salvage hook (§3.6/§3.7): fired once per enemy killed, with its loadout and
   * the limb slots destroyed during the fight. The host routes this into
   * `useStoryMode.awardKillSalvage` (scrap + rolled part drops) and a HUD toast.
   */
  onEnemyKilled?: (kill: EnemyKill) => void

  constructor(scene: THREE.Scene, projectiles: ProjectileSystem, particles: ParticleSystem) {
    this.scene = scene
    this.projectiles = projectiles
    this.particles = particles
  }

  setArenaBounds(half: number): void {
    this.arenaHalf = half
  }

  /** §5 New Game+: field tougher machines each cycle. Applied to every spawn. */
  setNgPlusLevel(level: number): void {
    this.ngPlusScale = ngPlusEnemyScale(level)
  }

  get active(): boolean {
    return this.quest !== null
  }

  get activeQuest(): QuestDef | null {
    return this.quest
  }

  getProgress(): CombatProgress {
    const base: CombatProgress = {
      cleared: this.clearedCount,
      total: this.totalCount,
      found: this.objectFound,
      collected: this.objectCollected,
      complete: false,
    }
    switch (this.quest?.type) {
      case 'escort_convoy':
        return {
          ...base,
          crawlersAlive: this.crawlers.filter((c) => c.alive && !c.arrived).length,
          crawlersArrived: this.crawlersArrived,
          crawlersTotal: this.crawlers.length,
        }
      case 'hold_the_line':
        return {
          ...base,
          waveIndex: this.holdWaveIndex,
          waveTotal: this.holdWaveTotal,
          barricadeFraction: this.barricadeMaxHp > 0 ? Math.max(0, this.barricadeHp / this.barricadeMaxHp) : 0,
        }
      case 'extraction':
        return {
          ...base,
          extractionPhase: this.extractionPhase,
          secondsLeft: this.extractionPhase === 'hold' ? Math.ceil(this.extractionSeconds) : 0,
          perimeterFraction: this.extractionHoldTotal > 0
            ? Math.max(0, this.extractionSeconds / this.extractionHoldTotal)
            : 0,
        }
      default:
        return base
    }
  }

  /**
   * Begin an encounter for a quest, anchored at the town centre. Spawns the
   * appropriate content. Returns false if an encounter is already running.
   */
  start(quest: QuestDef, townCenter: THREE.Vector3): boolean {
    if (this.quest) return false
    this.quest = quest
    this.anchor.copy(townCenter)
    this.spawnCenter.copy(townCenter)
    this.elapsed = 0
    this.clearedCount = 0
    this.objectFound = false
    this.objectCollected = false
    this.boss = null
    this.bossReinforced = false
    this.waveComposition = []
    this.waveSpawnQueue = 0
    this.waveSpawnedTotal = 0
    this.waveBatchTimer = 0
    // Reset variety state.
    this.crawlers = []
    this.crawlersArrived = 0
    this.crawlersLost = 0
    this.barricade = null
    this.barricadeHp = 0
    this.barricadeMaxHp = 0
    this.holdWaveIndex = 0
    this.holdWaveTotal = 0
    this.holdBreather = 0
    this.holdWaveOnField = false
    this.beacon = null
    this.perimeterRing = null
    this.extractionPhase = 'reach'

    switch (quest.type) {
      case 'hidden_object':
        this.totalCount = 1
        this.spawnHiddenObject(quest)
        break

      case 'boss_hunt':
        // Sanction: a named ace. The reinforcement pair (spawned at half HP) adds
        // to totalCount when it arrives.
        this.totalCount = 1
        this.bossScale = quest.bossScale ?? 1
        this.boss = this.spawnArchetypeEnemy('ace', this.bossScale, 0, true, quest.bossName)
        break

      case 'ace_hunt':
        this.startAceHunt(quest)
        break

      case 'escort_convoy':
        this.startEscort(quest)
        break

      case 'hold_the_line':
        this.startHold(quest)
        break

      case 'extraction':
        this.startExtraction(quest)
        break

      case 'wave_defence':
      default: {
        // wave_defence: queue N enemies as a combined-arms composition, spawn the
        // first batch.
        const n = quest.waveCount ?? 3
        this.totalCount = n
        this.waveSpawnQueue = n
        this.waveDifficulty = quest.difficulty ?? 'easy'
        this.waveTierScale = TIER_SCALE[this.waveDifficulty] ?? 1
        this.spawnWaveBatch()
        break
      }
    }
    return true
  }

  /**
   * Remove + dispose everything this encounter put in the scene: live enemy
   * mechs, the hidden object, and the variety props (crawlers/barricade/beacon/
   * ring). Does NOT award salvage — used both when an encounter is abandoned and
   * when it COMPLETES with survivors still on the field (an ace hunt ends the
   * moment the ace dies; a delivered convoy despawns its escorts). Idempotent.
   */
  private clearSpawned(): void {
    for (const e of this.enemies) {
      this.scene.remove(e.mech.mesh)
      e.mech.cleanup()
    }
    this.enemies = []
    this.disposeHiddenObject()
    this.disposeProps()
  }

  /** Abandon the current encounter, removing all spawned content from the scene. */
  abort(): void {
    this.clearSpawned()
    this.quest = null
    this.waveSpawnQueue = 0
    this.clearedCount = 0
    this.totalCount = 0
    this.boss = null
    this.bossReinforced = false
    this.waveComposition = []
    this.crawlers = []
    this.barricade = null
    this.beacon = null
    this.perimeterRing = null
    this.holdWaveOnField = false
  }

  // --- Spawning ---

  private randomRingPoint(minR: number, maxR: number): THREE.Vector3 {
    const a = Math.random() * Math.PI * 2
    const r = minR + Math.random() * (maxR - minR)
    return new THREE.Vector3(
      this.spawnCenter.x + Math.cos(a) * r,
      0,
      this.spawnCenter.z + Math.sin(a) * r,
    )
  }

  /**
   * Unit direction from the world origin outward through the town anchor — the
   * bearing convoy waypoints and extraction beacons point along, so field
   * objectives head AWAY from the map centre toward an edge. Deterministic; falls
   * back to +x when the anchor sits on the origin.
   */
  private outwardDirection(): THREE.Vector3 {
    const d = new THREE.Vector3(this.anchor.x, 0, this.anchor.z)
    if (d.lengthSq() < 1) return new THREE.Vector3(1, 0, 0)
    return d.normalize()
  }

  /** Short HUD label per archetype (falls back to a generic "Raider"). */
  private static readonly ARCHETYPE_LABEL: Record<EnemyArchetype, string> = {
    skirmisher: 'Skirmisher',
    line: 'Trooper',
    bulwark: 'Bulwark',
    sniper: 'Lancer',
    ace: 'Ace',
  }

  /**
   * Spawn one archetype enemy from the unified enemyGeneration table and give it
   * the matching AI brain (§3.6). Returns the CombatEnemy bundle so callers
   * (boss spawn) can hold a reference. `scale` multiplies the archetype's base
   * stats (boss scale / wave ramp).
   */
  private spawnArchetypeEnemy(
    archetype: EnemyArchetype,
    scale: number,
    index: number,
    isBoss = false,
    bossName?: string,
  ): CombatEnemy {
    const stats = archetypeStats(archetype, scale * this.ngPlusScale)
    const loadout = archetypeLoadout(archetype)
    const spawn = this.randomRingPoint(30, 45)
    const label = StoryCombat.ARCHETYPE_LABEL[archetype] ?? 'Raider'
    // Named Combine ace (§2.5): the boss carries the quest's identity so the HUD
    // and the reinforcement callout read as a person, not a generic "Town Bully".
    const name = isBoss ? (bossName ?? 'Combine Ace') : `${label} ${index + 1}`
    const mech = new MechEntity(`story-enemy-${this.elapsed}-${index}-${Math.random().toString(36).slice(2, 6)}`,
      name, loadout, stats, false, spawn)
    // Face the town centre.
    const toCenter = this.anchor.clone().sub(spawn)
    mech.rotation.y = Math.atan2(toCenter.x, toCenter.z)

    // Behaviour brain: archetype profile drives kite/brawl/aim; the ace uses the
    // boss difficulty as its base so it stays elite even before setArchetype.
    const ai = new EnemyAI(isBoss ? 'boss' : 'medium')
    ai.setArchetype(archetype)
    ai.setArenaBounds(this.arenaHalf, this.arenaHalf)

    // Slot-destruction feedback + salvage tracking (§3.3/§3.6): record which limb
    // was shot off (a guaranteed damaged drop when this enemy dies) and punch a
    // burst + shake at the limb so delimbing reads distinctly from a plain hit.
    const unit: CombatEnemy = { mech, ai, lastShot: 0, archetype, isBoss, destroyedSlots: [] }
    mech.onSlotDestroyed = (m, slot) => {
      unit.destroyedSlots.push(slot)
      this.particles.spawnExplosion(m.getSlotPosition(slot), 1.2)
      this.onShake?.(0.5)
    }

    this.scene.add(mech.mesh)
    this.enemies.push(unit)
    return unit
  }

  private spawnWaveBatch(): void {
    // Combined-arms composition for this encounter, cycled across the wave so the
    // batch is mixed (skirmisher + bulwark + sniper …) rather than N clones. The
    // per-type pool (waveComposition) wins when set; otherwise the plain
    // wave_defence composition for the tier.
    const maxAlive = maxAliveForDifficulty(this.waveDifficulty)
    const composition = this.waveComposition.length
      ? this.waveComposition
      : compositionForDifficulty(this.waveDifficulty)
    while (this.enemies.length < maxAlive && this.waveSpawnQueue > 0) {
      const idx = this.waveSpawnedTotal
      const archetype = composition[idx % composition.length]
      // Tier scale sets the wave's baseline toughness; later enemies ramp slightly
      // (capped so a long continuous press does not runaway-scale).
      const scale = this.waveTierScale * (1 + Math.min(0.4, idx * 0.08))
      this.spawnArchetypeEnemy(archetype, scale, idx)
      this.waveSpawnQueue--
      this.waveSpawnedTotal++
    }
  }

  private spawnHiddenObject(quest: QuestDef): void {
    const group = markRaw(new THREE.Group())
    // A small glittering crate/orb hidden out in the town's fields.
    const bodyGeo = new THREE.IcosahedronGeometry(1.1, 0)
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0x000000,
      emissiveIntensity: 0,
      roughness: 0.5,
      metalness: 0.3,
    })
    const body = new THREE.Mesh(bodyGeo, bodyMat)
    body.position.y = 1.1
    body.castShadow = true
    body.name = 'hidden-body'
    group.add(body)
    this.hiddenGeoms.push(bodyGeo)
    this.hiddenMats.push(bodyMat)

    // A faint base ring so, once revealed, it's easy to spot.
    const ringGeo = new THREE.RingGeometry(1.6, 2.0, 24)
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffe066,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    })
    const ring = new THREE.Mesh(ringGeo, ringMat)
    ring.rotation.x = -Math.PI / 2
    ring.position.y = 0.05
    ring.name = 'hidden-ring'
    group.add(ring)
    this.hiddenGeoms.push(ringGeo)
    this.hiddenMats.push(ringMat)

    const pos = this.randomRingPoint(14, quest.searchRadius ?? 26)
    group.position.copy(pos)
    group.visible = false // concealed until proximity reveal
    this.hiddenObject = group
    this.scene.add(group)
  }

  private disposeHiddenObject(): void {
    if (this.hiddenObject) {
      this.scene.remove(this.hiddenObject)
      this.hiddenObject = null
    }
    for (const g of this.hiddenGeoms) g.dispose()
    for (const m of this.hiddenMats) m.dispose()
    this.hiddenGeoms = []
    this.hiddenMats = []
  }

  // --- Per-frame update ---

  /**
   * Advance the encounter one frame. The host supplies the player mech, current
   * input-driven fire intent, and battleTime for cooldown bookkeeping. Returns
   * the in-flight player projectiles so the host can optionally feed the AI.
   */
  update(
    deltaTime: number,
    player: MechEntity,
    fire: { left: boolean; right: boolean; aimDir: THREE.Vector3 | null },
    battleTime: number,
  ): void {
    if (!this.quest) return
    this.elapsed += deltaTime

    if (this.quest.type === 'hidden_object') {
      this.updateHiddenObject(player.position)
      return
    }

    this.updateCombat(deltaTime, player, fire, battleTime)
  }

  /**
   * Advance an on-foot Recovery search (design §4/§2.6). The dismounted pilot has
   * no combat loop, so StoryWorld drives the hidden-object proximity/reveal/collect
   * directly from the pilot's world position while on foot — decay-free (§4.2). A
   * no-op for any non-hidden-object encounter (there is no on-foot combat, §6).
   */
  updateSearchAt(pos: THREE.Vector3, deltaTime: number): void {
    if (this.quest?.type !== 'hidden_object') return
    this.elapsed += deltaTime
    this.updateHiddenObject(pos)
  }

  private updateHiddenObject(pos: THREE.Vector3): void {
    if (!this.hiddenObject || this.objectCollected) return
    const obj = this.hiddenObject
    const dx = pos.x - obj.position.x
    const dz = pos.z - obj.position.z
    const distSq = dx * dx + dz * dz

    // Reveal within 18 units; sparkle/grow when found.
    const revealDist = 18
    if (!this.objectFound && distSq <= revealDist * revealDist) {
      this.objectFound = true
      obj.visible = true
      const ring = obj.getObjectByName('hidden-ring') as THREE.Mesh | null
      if (ring) (ring.material as THREE.MeshBasicMaterial).opacity = 0.7
      const body = obj.getObjectByName('hidden-body') as THREE.Mesh | null
      if (body) {
        const m = body.material as THREE.MeshStandardMaterial
        m.emissive.setHex(0xffaa00)
        m.emissiveIntensity = 0.6
      }
    }

    if (this.objectFound) {
      // Gentle bob + spin so it reads as a collectible.
      obj.rotation.y += 0.02
      obj.position.y = Math.sin(this.elapsed * 2.5) * 0.3
      // Pick up within 4 units.
      if (distSq <= 16) {
        this.objectCollected = true
        this.particles.spawnHitEffect(obj.position.clone().setY(1.2), 'energy')
        this.disposeHiddenObject()
        this.finish()
      }
    }
  }

  private updateCombat(
    deltaTime: number,
    player: MechEntity,
    fire: { left: boolean; right: boolean; aimDir: THREE.Vector3 | null },
    battleTime: number,
  ): void {
    // --- Collateral: time-in-combat-near-town (§3.5 contract) ---
    // Each second of active combat inside the town taxes its condition a little,
    // tapered by the player's proximity to the town centre. This (plus hits the
    // player takes, below) is the dominant, deliberately-gentle collateral term.
    // The player LANDING shots and kill/AoE explosions are explicitly untaxed.
    this.emitCollateral(player.position, COLLATERAL_SEVERITY_PER_COMBAT_SECOND * deltaTime)

    // --- Player firing (mirrors BattleScene dual-arm cadence) ---
    const aim = fire.aimDir ?? player.getForwardDirection()
    // Cannot fire while boosting (design §3.1). PhysicsSystem sets isBoosting
    // on the player each frame from StoryWorld's movement update.
    const canFire = !player.isBoosting
    // Ammo-feed rack ability: doubled fire rate while active (design §3.4 — a
    // fire-rate buff, not a magazine sim). Mirrors BattleScene so the rack works
    // in the campaign, not just Build & Battle.
    const ammoFeed = player.rackAbilityActive && player.loadout.rack?.id === 'rack-ammo-feed'
    if (canFire && fire.left && player.loadout.leftArm) {
      let rate = player.loadout.leftArm.fireRate ?? (player.loadout.leftArm.weaponType === 'melee' ? 1.5 : 0.25)
      if (ammoFeed) rate *= 0.5
      if (battleTime - this.lastLeftShot > rate) {
        const target = this.nearestEnemyTo(player)
        const fired = this.projectiles.fireWeapon(player, this.armAim(player, 'left', aim), 'left', target?.mech)
        if (fired) {
          this.lastLeftShot = battleTime
          this.spawnMuzzle(player, 'left', aim)
        }
      }
    }
    if (canFire && fire.right && player.loadout.rightArm) {
      let rate = player.loadout.rightArm.fireRate ?? (player.loadout.rightArm.weaponType === 'melee' ? 1.5 : 0.25)
      if (ammoFeed) rate *= 0.5
      if (battleTime - this.lastRightShot > rate) {
        const target = this.nearestEnemyTo(player)
        const fired = this.projectiles.fireWeapon(player, this.armAim(player, 'right', aim), 'right', target?.mech)
        if (fired) {
          this.lastRightShot = battleTime
          this.spawnMuzzle(player, 'right', aim)
        }
      }
    }

    // Feed AI the player's in-flight projectiles so it can dodge.
    const threats = this.projectiles.getProjectiles()
      .filter((p) => p.ownerId === player.id)
      .map((p) => ({ position: p.position, velocity: p.velocity }))

    // --- Enemy AI + firing ---
    for (const e of this.enemies) {
      if (e.mech.isDestroyed) continue
      e.ai.feedThreats(threats)
      const shouldFire = e.ai.update(e.mech, player, deltaTime)
      e.mech.updatePower(deltaTime)
      e.mech.update(deltaTime)
      if (shouldFire) {
        // Fire from a live weapon arm (§3.3): a defanged right arm falls back to
        // the left; both gone = the enemy can't shoot.
        const fireArm = e.mech.liveWeaponArm()
        if (fireArm) {
          const armPart = e.mech.loadout[fireArm === 'left' ? 'leftArm' : 'rightArm']
          const projSpeed = weaponProjectileSpeed(armPart?.weaponType)
          const aimPoint = e.ai.computeAimPoint(e.mech, player, projSpeed)
          const dir = aimPoint.sub(e.mech.getArmPosition(fireArm)).normalize()
          this.projectiles.fireWeapon(e.mech, dir, fireArm, player)
        }
      }
    }

    // --- Projectiles + collisions (player + all live enemies) ---
    const allMechs = [player, ...this.enemies.map((e) => e.mech)]
    this.projectiles.update(deltaTime, allMechs)
    const hits = this.projectiles.checkCollisions(allMechs)
    for (const hit of hits) {
      const defeated = hit.target.takeDamage(hit.projectile.damage, hit.projectile.damageType, {
        armorPierce: hit.projectile.armorPierce,
        burn: hit.projectile.appliesBurn,
        fromFront: hit.target.isHitFromFront(hit.projectile.velocity),
        slot: hit.slot,
      })
      const impact = hit.target.position.clone()
      impact.y += 1.5
      this.particles.spawnHitEffect(impact, hit.projectile.type)
      this.particles.spawnImpactSparks(impact, hit.projectile.velocity.clone().normalize(), 'mech')
      this.projectiles.removeProjectile(hit.projectile)

      if (hit.target === player) {
        this.onShake?.(0.4)
        // A hit LANDING ON THE PLAYER is the dominant collateral term (§3.5): the
        // town pays for the fight you couldn't dodge. Full per-hit severity,
        // tapered by proximity to the town centre.
        this.emitCollateral(hit.target.position, COLLATERAL_SEVERITY_PER_PLAYER_HIT)
      } else {
        this.onShake?.(Math.min(0.4, 0.1 + hit.projectile.damage * 0.01))
      }

      if (defeated) {
        this.spawnDeathExplosion(hit.target.position.clone(), 1.8)
        this.onShake?.(1.0)
        hit.target.isDestroyed = true
        if (hit.target === player) {
          this.onPlayerDefeated?.(this.playerDestroyedLimbs(player))
          this.abort()
          return
        }
      }
    }

    // Burn DoT (flamer) can reduce a mech to 0 HP in MechEntity.update() without
    // a projectile hit. Register a burn-only player defeat here (enemies handled
    // in the removal loop below). Design §3.2 flamer identity.
    if (player.stats.currentHealth <= 0 && !player.isDestroyed) {
      player.isDestroyed = true
      this.spawnDeathExplosion(player.position.clone(), 1.8)
      this.onShake?.(1.0)
      this.onPlayerDefeated?.(this.playerDestroyedLimbs(player))
      this.abort()
      return
    }

    // --- Named-ace half-health reinforcement script (§3.6) ---
    // When the boss first drops to 50% HP, it calls in a scripted skirmisher
    // pair and fires the comms callout hook. Fires exactly once.
    const boss = this.boss
    if (boss && !this.bossReinforced && !boss.mech.isDestroyed) {
      const hp = boss.mech.stats.currentHealth / boss.mech.stats.maxHealth
      if (hp <= 0.5) {
        this.bossReinforced = true
        const pair = reinforcementComposition()
        // Reinforcements are lighter than the ace — half the boss scale, floored
        // at 1 so they still bite.
        const reScale = Math.max(1, this.bossScale * 0.5)
        pair.forEach((arch, i) => this.spawnArchetypeEnemy(arch, reScale, this.totalCount + i))
        this.totalCount += pair.length
        this.onReinforcement?.({ bossName: boss.mech.name, count: pair.length })
      }
    }

    // --- Remove dead enemies, refill wave, check completion ---
    const stillAlive: CombatEnemy[] = []
    for (const e of this.enemies) {
      // A burn-out (currentHealth <= 0 with no explosion yet) counts as a kill.
      if (!e.mech.isDestroyed && e.mech.stats.currentHealth <= 0) {
        e.mech.isDestroyed = true
        this.spawnDeathExplosion(e.mech.position.clone(), 1.8)
      }
      if (e.mech.isDestroyed) {
        // Salvage (§3.6/§3.7): hand the host this enemy's loadout + the limbs it
        // lost so it can award scrap and roll part drops. Read before cleanup().
        // ace_hunt (§5.4): the marked ace drops a GUARANTEED pristine part.
        this.onEnemyKilled?.({
          loadout: e.mech.loadout,
          destroyedSlots: e.destroyedSlots.slice(),
          archetype: e.archetype,
          isBoss: e.isBoss,
          pristineDrop: e.isBoss && this.quest?.type === 'ace_hunt',
        })
        this.scene.remove(e.mech.mesh)
        e.mech.cleanup()
        this.clearedCount++
        if (this.boss === e) this.boss = null
      } else {
        stillAlive.push(e)
      }
    }
    this.enemies = stillAlive

    // Per-type objective bookkeeping: wave refill, variety props, completion/fail.
    this.updateObjective(deltaTime, player)
  }

  /**
   * Advance the active quest's objective after enemy removal each frame: refill
   * waves, tick the variety props (convoy / barricade / beacon+perimeter), and
   * apply the type's completion or fail condition. Player DEATH is handled inline
   * in updateCombat (the death-stakes path); this method never handles death.
   */
  private updateObjective(deltaTime: number, player: MechEntity): void {
    switch (this.quest?.type) {
      case 'escort_convoy':
        this.updateEscort(deltaTime, player)
        return
      case 'hold_the_line':
        this.updateHold(deltaTime)
        return
      case 'extraction':
        this.updateExtraction(deltaTime, player)
        return
      case 'ace_hunt':
        // Killing the ace ends the hunt regardless of the bodyguards (§5.4).
        if (this.boss === null) this.finish()
        return
      case 'wave_defence':
        // Refill the wave from the queue if a slot opened.
        if (this.waveSpawnQueue > 0) {
          this.waveBatchTimer -= deltaTime
          if (this.enemies.length < maxAliveForDifficulty(this.waveDifficulty) && this.waveBatchTimer <= 0) {
            this.spawnWaveBatch()
            this.waveBatchTimer = 1.5
          }
        }
        if (this.enemies.length === 0 && this.waveSpawnQueue === 0) this.finish()
        return
      case 'boss_hunt':
      default:
        // Boss + any reinforcements cleared.
        if (this.enemies.length === 0 && this.waveSpawnQueue === 0) this.finish()
        return
    }
  }

  private finish(outcome?: CombatOutcome): void {
    const quest = this.quest
    // Despawn anything still on the field (ace-hunt bodyguards, a delivered
    // convoy's interceptors + crawlers, the extraction beacon/ring, the hold
    // barricade). Salvage was already awarded per-kill in the removal loop; this
    // is pure scene cleanup so a completion never leaks meshes/geometry.
    this.clearSpawned()
    this.crawlers = []
    this.barricade = null
    this.beacon = null
    this.perimeterRing = null
    this.boss = null
    this.holdWaveOnField = false
    this.quest = null
    if (quest) this.onComplete?.(quest, outcome)
  }

  /** Fail a variety objective (convoy wiped / barricade destroyed). Ends the
   *  encounter and notifies the host — distinct from player death (§5). */
  private fail(reason: string): void {
    const quest = this.quest
    this.abort()
    if (quest) this.onQuestFailed?.(quest, reason)
  }

  // ==========================================================================
  // Phase 5 mission variety (§5)
  // ==========================================================================

  /** Clamp an XZ point just inside the arena bounds (waypoints / beacons). */
  private clampToArena(v: THREE.Vector3): void {
    const h = this.arenaHalf * 0.95
    v.x = Math.max(-h, Math.min(h, v.x))
    v.z = Math.max(-h, Math.min(h, v.z))
  }

  /** Count live enemies within `r` of a point (barricade attrition). */
  private countEnemiesNear(pos: THREE.Vector3, r: number): number {
    const r2 = r * r
    let n = 0
    for (const e of this.enemies) {
      if (!e.mech.isDestroyed && e.mech.position.distanceToSquared(pos) <= r2) n++
    }
    return n
  }

  // ── ace_hunt (§5.4) ────────────────────────────────────────────────────
  /**
   * A marked named ace roaming a field zone with a bodyguard pair. The ace is a
   * `boss` unit, so it inherits the P1 ace archetype and the P2 half-health
   * reinforcement script (the shared `this.boss` machinery). Killing the ace
   * completes the hunt regardless of the bodyguards (updateObjective), and the
   * ace's kill carries a guaranteed pristine drop (the kill loop).
   */
  private startAceHunt(quest: QuestDef): void {
    this.bossScale = quest.bossScale ?? 1
    this.boss = this.spawnArchetypeEnemy('ace', this.bossScale, 0, true, quest.bossName)
    const guards = aceBodyguardComposition().slice(0, quest.bodyguardCount ?? 2)
    const guardScale = Math.max(1, this.bossScale * 0.6)
    guards.forEach((arch, i) => this.spawnArchetypeEnemy(arch, guardScale, i + 1))
    this.totalCount = 1 + guards.length
  }

  // ── escort_convoy (§5.1) ─────────────────────────────────────────────────
  /**
   * Shepherd 2-3 slow, unarmed crawlers from the town gate to a map-edge
   * waypoint while Combine interceptors harass. Crawlers path with simple
   * steering + obstacle-radius avoidance (§5); interceptors spawn in a refilling
   * harass queue and target the player (the standard AI). Reward degrades per
   * crawler lost; the run fails only if the whole convoy is wiped out.
   */
  private startEscort(quest: QuestDef): void {
    const count = quest.escortCount ?? 3
    const dir = this.outwardDirection()
    const dist = quest.waypointDistance ?? 220
    this.convoyWaypoint.copy(this.anchor).addScaledVector(dir, dist)
    this.clampToArena(this.convoyWaypoint)

    // Crawlers line up at the gate (just behind the anchor), spread laterally.
    const perp = new THREE.Vector3(-dir.z, 0, dir.x)
    const gate = this.anchor.clone().addScaledVector(dir, -6)
    for (let i = 0; i < count; i++) {
      const pos = gate.clone().addScaledVector(perp, (i - (count - 1) / 2) * 6)
      this.spawnCrawler(pos, dir)
    }
    this.totalCount = count

    this.waveDifficulty = quest.difficulty ?? 'easy'
    this.waveTierScale = TIER_SCALE[this.waveDifficulty] ?? 1
    this.waveComposition = convoyInterceptorComposition(this.waveDifficulty)
    this.waveSpawnQueue = quest.interceptorCount ?? 4
    this.spawnCenter.copy(gate)
    this.spawnWaveBatch()
  }

  private spawnCrawler(pos: THREE.Vector3, facing: THREE.Vector3): void {
    const mesh = this.buildCrawler()
    mesh.position.copy(pos)
    mesh.position.y = 0
    mesh.rotation.y = Math.atan2(facing.x, facing.z)
    this.scene.add(mesh)
    this.crawlers.push({ mesh, hp: CRAWLER_HP, maxHp: CRAWLER_HP, alive: true, arrived: false })
  }

  /** A procedural boxy hauler (§5.1) — body + cab, no weapons. */
  private buildCrawler(): THREE.Group {
    const group = markRaw(new THREE.Group())
    const bodyGeo = new THREE.BoxGeometry(6, 3, 3.6)
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x6b7280, roughness: 0.85, metalness: 0.25 })
    const body = new THREE.Mesh(bodyGeo, bodyMat)
    body.position.y = 2
    body.castShadow = true
    group.add(body)
    const cabGeo = new THREE.BoxGeometry(2.2, 2.2, 3.2)
    const cabMat = new THREE.MeshStandardMaterial({ color: 0x9aa3af, roughness: 0.7, metalness: 0.2 })
    const cab = new THREE.Mesh(cabGeo, cabMat)
    cab.position.set(3.4, 1.6, 0)
    group.add(cab)
    this.propGeoms.push(bodyGeo, cabGeo)
    this.propMats.push(bodyMat, cabMat)
    return group
  }

  /** Centroid of the still-rolling crawlers (spawn interceptors near the convoy). */
  private convoyCentroid(): THREE.Vector3 {
    const live = this.crawlers.filter((c) => c.alive && !c.arrived)
    if (live.length === 0) return this.anchor.clone()
    const c = new THREE.Vector3()
    for (const cr of live) c.add(cr.mesh.position)
    return c.multiplyScalar(1 / live.length)
  }

  private updateEscort(deltaTime: number, _player: MechEntity): void {
    // Refill the interceptor harass up to the cap, near the moving convoy.
    if (this.waveSpawnQueue > 0) {
      this.waveBatchTimer -= deltaTime
      if (this.enemies.length < maxAliveForDifficulty(this.waveDifficulty) && this.waveBatchTimer <= 0) {
        this.spawnCenter.copy(this.convoyCentroid())
        this.spawnWaveBatch()
        this.waveBatchTimer = 3
      }
    }

    const live = this.enemies.filter((e) => !e.mech.isDestroyed)
    for (const c of this.crawlers) {
      if (!c.alive || c.arrived) continue

      // Attrition: each interceptor inside harass range chips the crawler.
      const harassers = live.reduce(
        (n, e) =>
          e.mech.position.distanceToSquared(c.mesh.position) <= CONVOY_HARASS_RADIUS * CONVOY_HARASS_RADIUS
            ? n + 1
            : n,
        0,
      )
      if (harassers > 0) {
        c.hp -= CONVOY_HARASS_DPS * harassers * deltaTime
        if (c.hp <= 0) {
          c.alive = false
          this.crawlersLost++
          this.spawnDeathExplosion(c.mesh.position.clone(), 2.0)
          this.onShake?.(0.8)
          if (c.mesh.parent) this.scene.remove(c.mesh)
          continue
        }
      }

      // Steering toward the waypoint with obstacle-radius avoidance.
      const toWp = this.convoyWaypoint.clone().sub(c.mesh.position)
      toWp.y = 0
      const dist = toWp.length()
      if (dist <= CONVOY_ARRIVE_RADIUS) {
        c.arrived = true
        this.crawlersArrived++
        continue
      }
      const steer = toWp.normalize()
      const avoid = new THREE.Vector3()
      for (const o of this.crawlers) {
        if (o === c || !o.alive || o.arrived) continue
        this.accumulateAvoid(avoid, c.mesh.position, o.mesh.position)
      }
      for (const e of live) this.accumulateAvoid(avoid, c.mesh.position, e.mech.position)
      steer.add(avoid)
      if (steer.lengthSq() > 1e-6) steer.normalize()
      c.mesh.position.addScaledVector(steer, CONVOY_SPEED * deltaTime)
      c.mesh.position.y = 0
      c.mesh.rotation.y = Math.atan2(steer.x, steer.z)
    }

    // Fail only if the whole convoy is gone; otherwise complete once every
    // surviving crawler has reached the waypoint (degraded reward per loss).
    if (!this.crawlers.some((c) => c.alive)) {
      this.fail('convoy-lost')
      return
    }
    if (this.crawlers.every((c) => !c.alive || c.arrived)) {
      const saved = this.crawlers.filter((c) => c.arrived).length
      const total = this.crawlers.length
      this.finish({
        rewardMultiplier: total > 0 ? saved / total : 0,
        crawlersSaved: saved,
        crawlersLost: this.crawlersLost,
      })
    }
  }

  /** Accumulate a separation push away from an obstacle within CONVOY_AVOID_RADIUS. */
  private accumulateAvoid(out: THREE.Vector3, self: THREE.Vector3, other: THREE.Vector3): void {
    const dx = self.x - other.x
    const dz = self.z - other.z
    const d2 = dx * dx + dz * dz
    if (d2 < CONVOY_AVOID_RADIUS * CONVOY_AVOID_RADIUS && d2 > 1e-4) {
      const d = Math.sqrt(d2)
      const w = (CONVOY_AVOID_RADIUS - d) / CONVOY_AVOID_RADIUS
      out.x += (dx / d) * w
      out.z += (dz / d) * w
    }
  }

  // ── hold_the_line (§5.2) ─────────────────────────────────────────────────
  /**
   * Defend the town-gate anchor through N timed waves, with a breather beat
   * between them, behind a deployable barricade prop. Reuses the wave machinery
   * (one batch per wave). The run fails if the barricade is destroyed; it
   * completes once the final wave is cleared.
   */
  private startHold(quest: QuestDef): void {
    this.waveDifficulty = quest.difficulty ?? 'easy'
    this.waveTierScale = TIER_SCALE[this.waveDifficulty] ?? 1
    this.waveComposition = holdLineComposition(this.waveDifficulty)
    this.holdWaveTotal = quest.holdWaves ?? 3
    this.holdWaveIndex = 0
    this.holdBreather = 0
    this.holdWaveOnField = false
    this.totalCount = this.holdWaveTotal
    this.barricadeMaxHp = quest.barricadeHp ?? 900
    this.barricadeHp = this.barricadeMaxHp
    this.buildBarricade()
    this.spawnCenter.copy(this.anchor)
    this.spawnHoldWave()
  }

  /** Spawn one hold wave (a batch of up to maxAlive) at the gate. */
  private spawnHoldWave(): void {
    this.waveSpawnQueue = maxAliveForDifficulty(this.waveDifficulty)
    this.spawnCenter.copy(this.anchor)
    this.spawnWaveBatch()
    this.holdWaveIndex++
    this.holdWaveOnField = true
  }

  /** A deployable barricade prop at the town gate (the point to defend). */
  private buildBarricade(): void {
    const geo = new THREE.BoxGeometry(16, 5, 2.2)
    const mat = new THREE.MeshStandardMaterial({ color: 0x8a5a2b, roughness: 0.9, metalness: 0.1 })
    const wall = markRaw(new THREE.Mesh(geo, mat))
    wall.position.copy(this.anchor)
    wall.position.y = 2.5
    wall.castShadow = true
    this.propGeoms.push(geo)
    this.propMats.push(mat)
    this.scene.add(wall)
    this.barricade = wall
  }

  private updateBarricadeVisual(): void {
    if (!this.barricade) return
    const frac = this.barricadeMaxHp > 0 ? Math.max(0, this.barricadeHp / this.barricadeMaxHp) : 0
    const m = this.barricade.material as THREE.MeshStandardMaterial
    m.emissive.setRGB(0.6 * (1 - frac), 0.05 * (1 - frac), 0)
    m.emissiveIntensity = 0.6 * (1 - frac)
  }

  private updateHold(deltaTime: number): void {
    // Barricade attrition: any enemy pressing the gate chips it.
    if (this.barricade) {
      const near = this.countEnemiesNear(this.barricade.position, BARRICADE_THREAT_RADIUS)
      if (near > 0) {
        this.barricadeHp -= BARRICADE_DPS * near * deltaTime
        this.updateBarricadeVisual()
        if (this.barricadeHp <= 0) {
          this.spawnDeathExplosion(this.barricade.position.clone(), 2.6)
          this.onShake?.(1.0)
          this.fail('barricade-destroyed')
          return
        }
      }
    }

    // Wave scheduling: current wave cleared -> breather -> next wave (or finish).
    if (this.holdWaveOnField && this.enemies.length === 0 && this.waveSpawnQueue === 0) {
      this.holdWaveOnField = false
      if (this.holdWaveIndex >= this.holdWaveTotal) {
        this.finish()
        return
      }
      this.holdBreather = this.quest?.breatherSeconds ?? 6
    }
    if (!this.holdWaveOnField && this.holdWaveIndex < this.holdWaveTotal) {
      this.holdBreather -= deltaTime
      if (this.holdBreather <= 0) this.spawnHoldWave()
    }
  }

  // ── extraction (§5.3) ────────────────────────────────────────────────────
  /**
   * Push out to a downed-pilot beacon at field distance, then hold a SHRINKING
   * perimeter for T seconds while waves press. Two phases: `reach` (get to the
   * beacon) then `hold` (survive the timer). Completion is surviving the hold —
   * no return trip (§5). Player death routes through the death-stakes path.
   */
  private startExtraction(quest: QuestDef): void {
    const dir = this.outwardDirection()
    const beaconPos = this.anchor.clone().addScaledVector(dir, quest.beaconDistance ?? 160)
    this.clampToArena(beaconPos)
    this.extractionPerimeterR = quest.perimeterRadius ?? 34
    this.extractionHoldTotal = quest.holdSeconds ?? 45
    this.extractionSeconds = this.extractionHoldTotal
    this.extractionPhase = 'reach'
    this.buildBeaconAndPerimeter(beaconPos)
    this.totalCount = 1

    this.waveDifficulty = quest.difficulty ?? 'easy'
    this.waveTierScale = TIER_SCALE[this.waveDifficulty] ?? 1
    this.waveComposition = extractionPressComposition(this.waveDifficulty)
    // A light initial press so the approach is contested.
    this.waveSpawnQueue = maxAliveForDifficulty(this.waveDifficulty)
    this.spawnCenter.copy(beaconPos)
    this.spawnWaveBatch()
  }

  /** The beacon pillar + the perimeter ring the player must hold (§5.3). */
  private buildBeaconAndPerimeter(pos: THREE.Vector3): void {
    const group = markRaw(new THREE.Group())
    group.position.copy(pos)
    const pillarGeo = new THREE.CylinderGeometry(0.6, 0.95, 4.5, 10)
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      emissive: 0x0891b2,
      emissiveIntensity: 0.9,
      roughness: 0.4,
      metalness: 0.4,
    })
    const pillar = new THREE.Mesh(pillarGeo, pillarMat)
    pillar.position.y = 2.25
    pillar.castShadow = true
    group.add(pillar)
    this.propGeoms.push(pillarGeo)
    this.propMats.push(pillarMat)
    this.scene.add(group)
    this.beacon = group

    const ringGeo = new THREE.RingGeometry(this.extractionPerimeterR - 0.8, this.extractionPerimeterR, 56)
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    })
    const ring = markRaw(new THREE.Mesh(ringGeo, ringMat))
    ring.rotation.x = -Math.PI / 2
    ring.position.copy(pos)
    ring.position.y = 0.12
    this.propGeoms.push(ringGeo)
    this.propMats.push(ringMat)
    this.scene.add(ring)
    this.perimeterRing = ring
  }

  /** Scale the perimeter ring to the current (shrinking) radius. */
  private updatePerimeterVisual(r: number): void {
    if (!this.perimeterRing) return
    const s = this.extractionPerimeterR > 0 ? r / this.extractionPerimeterR : 1
    this.perimeterRing.scale.set(s, s, 1)
  }

  /** Keep enemies topped to the cap around a centre while a hold is contested. */
  private topUpPress(deltaTime: number, center: THREE.Vector3): void {
    const cap = maxAliveForDifficulty(this.waveDifficulty)
    this.waveBatchTimer -= deltaTime
    if (this.enemies.length < cap && this.waveBatchTimer <= 0) {
      this.waveSpawnQueue = cap - this.enemies.length
      this.spawnCenter.copy(center)
      this.spawnWaveBatch()
      this.waveBatchTimer = 2.5
    }
  }

  private updateExtraction(deltaTime: number, player: MechEntity): void {
    if (!this.beacon) return
    const beaconPos = this.beacon.position
    this.beacon.rotation.y += deltaTime * 1.4 // pulse/spin so it reads as a beacon
    this.topUpPress(deltaTime, beaconPos)

    if (this.extractionPhase === 'reach') {
      const dx = player.position.x - beaconPos.x
      const dz = player.position.z - beaconPos.z
      if (dx * dx + dz * dz <= EXTRACTION_REACH_RADIUS * EXTRACTION_REACH_RADIUS) {
        this.extractionPhase = 'hold'
      }
      return
    }

    // Hold phase: count down and shrink the perimeter to its floor.
    this.extractionSeconds -= deltaTime
    const frac = Math.max(0, this.extractionSeconds / this.extractionHoldTotal)
    this.updatePerimeterVisual(EXTRACTION_PERIMETER_FLOOR + (this.extractionPerimeterR - EXTRACTION_PERIMETER_FLOOR) * frac)
    if (this.extractionSeconds <= 0) this.finish()
  }

  /** Remove + dispose all variety props (crawlers / barricade / beacon / ring). */
  private disposeProps(): void {
    for (const c of this.crawlers) if (c.mesh.parent) this.scene.remove(c.mesh)
    if (this.barricade?.parent) this.scene.remove(this.barricade)
    if (this.beacon?.parent) this.scene.remove(this.beacon)
    if (this.perimeterRing?.parent) this.scene.remove(this.perimeterRing)
    for (const g of this.propGeoms) g.dispose()
    for (const m of this.propMats) m.dispose()
    this.propGeoms = []
    this.propMats = []
  }

  // --- Helpers ---

  /**
   * Spawn a death/AoE explosion (VFX only). Kill explosions are NOT taxed as
   * collateral (§3.5 contract — PER_ENEMY_KILL = 0): landing a kill should never
   * feel like it hurts the town, so the disposable P2 kill-explosion collateral
   * term was removed here. Collateral now comes only from hits-you-take and
   * time-in-combat (see updateCombat).
   */
  private spawnDeathExplosion(position: THREE.Vector3, scale: number): void {
    this.particles.spawnExplosion(position, scale)
  }

  /** The limb slots the player lost this fight (core excluded — that IS the death),
   *  handed to onPlayerDefeated so the host strips them into damaged repair debt. */
  private playerDestroyedLimbs(player: MechEntity): MechSlot[] {
    return [...player.destroyedSlots].filter((s) => s !== 'core')
  }

  /**
   * Emit a distance-tapered collateral severity toward the town centre. No-op
   * when there is no listener, the severity is non-positive, or the impact is
   * outside COLLATERAL_RADIUS. The emitter feeds raw severity from the §3.5
   * contract (hits-taken / combat-time); the host applies the condition-per-
   * severity coefficient.
   */
  private emitCollateral(position: THREE.Vector3, severity: number): void {
    if (!this.onCollateral || severity <= 0) return
    const dx = position.x - this.anchor.x
    const dz = position.z - this.anchor.z
    const dist = Math.sqrt(dx * dx + dz * dz)
    const proximity = 1 - dist / COLLATERAL_RADIUS
    if (proximity <= 0) return
    this.onCollateral(severity * proximity, position.clone())
  }

  private nearestEnemyTo(player: MechEntity): CombatEnemy | null {
    let best: CombatEnemy | null = null
    let bestSq = Infinity
    for (const e of this.enemies) {
      if (e.mech.isDestroyed) continue
      const d = e.mech.position.distanceToSquared(player.position)
      if (d < bestSq) {
        bestSq = d
        best = e
      }
    }
    return best
  }

  /** Per-arm aim: if a free aim dir is given use it, else lead toward the
   *  nearest enemy's core from the arm muzzle (auto-aim assist for roaming). */
  private armAim(player: MechEntity, arm: 'left' | 'right', freeAim: THREE.Vector3): THREE.Vector3 {
    const target = this.nearestEnemyTo(player)
    if (!target) return freeAim
    const muzzle = player.getArmPosition(arm)
    const to = target.mech.getCorePosition().sub(muzzle)
    // Only auto-aim when the player is roughly facing the target (so free look
    // still matters); otherwise honour the free aim direction.
    if (to.lengthSq() < 1e-4) return freeAim
    const dir = to.normalize()
    if (dir.dot(freeAim) > 0.3) {
      const spread = 0.02
      dir.x += (Math.random() - 0.5) * spread
      dir.y += (Math.random() - 0.5) * spread
      dir.z += (Math.random() - 0.5) * spread
      return dir.normalize()
    }
    return freeAim
  }

  private spawnMuzzle(player: MechEntity, arm: 'left' | 'right', aim: THREE.Vector3): void {
    const part = arm === 'left' ? player.loadout.leftArm : player.loadout.rightArm
    const rawType = part?.weaponType ?? 'ballistic'
    let fxType: 'ballistic' | 'energy' | 'missile'
    if (rawType === 'energy') fxType = 'energy'
    else if (rawType === 'missile') fxType = 'missile'
    else fxType = 'ballistic'
    this.particles.spawnMuzzleFlash(player.getArmPosition(arm), fxType, aim)
  }

  cleanup(): void {
    this.abort()
  }
}
