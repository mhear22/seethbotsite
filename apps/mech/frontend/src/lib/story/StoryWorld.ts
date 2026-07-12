import * as THREE from 'three'
import { markRaw } from 'vue'
import { MechEntity, type CombatStats } from '../battle/MechEntity'
import { CameraController } from '../battle/CameraController'
import { PhysicsSystem } from '../battle/PhysicsSystem'
import { InputManager } from '../battle/InputManager'
import { ProjectileSystem } from '../battle/ProjectileSystem'
import { ParticleSystem } from '../battle/ParticleSystem'
import { Town, type AnchorKind, type NPCRole } from './Town'
import { Terrain } from './Terrain'
import { StoryCombat, type EnemyKill, type CombatOutcome } from './StoryCombat'
import { OnFootEntity } from './OnFootEntity'
import { OnFootPhysics } from './OnFootPhysics'
import type { InputState } from '../battle/InputManager'
import type { QuestDef } from './quests'
import type { MechLoadout } from '../../composables/useMechBuilder'
import type { MechSlot } from '../../shared/types/MechTypes'
import { motionScale, type GraphicsSettings } from '../../composables/useGameSettings'
import type { TownState, PilotMode } from '../../composables/useStoryMode'
import { TOWN_DECAY_RADIUS, WORLD_HALF_EXTENT } from '../../composables/useStoryMode'
import { createOverworldSkyMaterial, updateOverworldSky } from './OverworldSky'
import { WeatherSystem } from './Weather'
import { DayNightCycle } from './DayNightCycle'
import { OverworldGunplay } from './OverworldGunplay'
import { BanditSystem } from './Bandits'

/** XZ distance within which the E-key opens a town's quest-giver dialogue. */
export const QUEST_GIVER_RADIUS = 14

// --- On-foot pedestrian constants (design §4.3/§4.4) ---
/** Pedestrian "town bounds": beyond this the pilot is nudged to head back. */
export const ON_FOOT_TOWN_RADIUS = 45
/** Hard leash — the pilot is clamped inside 1.5× the town radius (§4.3). */
export const ON_FOOT_HARD_LIMIT = ON_FOOT_TOWN_RADIUS * 1.5
/** XZ radius for the on-foot "talk to {NPC}" E-prompt. */
export const NPC_INTERACT_RADIUS = 4.5
/** XZ radius for the on-foot "enter {anchor}" E-prompt (garage/comms/warden). */
export const ANCHOR_INTERACT_RADIUS = 6
/**
 * How far in front of the parked Frame the pilot spawns on dismount (§4.1). Far
 * enough to clear the Frame's leg/torso geometry and frame the towering machine
 * behind the pilot, but well inside the 8u remount radius.
 */
export const DISMOUNT_SPAWN_OFFSET = 4.5
/**
 * Generous grace after hostiles appear while on foot before the pilot is force-
 * remounted (design §4.3 combat interlock: the answer is remount, not fight).
 */
export const ON_FOOT_HOSTILE_GRACE_SEC = 12

// --- Sun shadow follow-box (perf) ---
/**
 * Half-extent of the sun's shadow ortho frustum — a small box that follows the
 * player instead of spanning the whole ±600u world, so distant towns' casters
 * are frustum-culled out of the shadow pass and texel density improves ~8x.
 */
const SHADOW_FRUSTUM_HALF_EXTENT = 70

/** Free-roam speed multiplier for the open world (combat resets to 1.0). The
 *  overworld is ~1200u across with towns 300m+ apart, so arena speed felt slow. */
const OVERWORLD_SPEED_MULT = 2.6
/** Constant offset from the shadow target to the sun. Position and target move
 *  together each frame (updateSunShadow), so the light DIRECTION never changes. */
const SUN_SHADOW_OFFSET = new THREE.Vector3(120, 200, 80)
/** Distance the sun's shadow-casting position sits from its target — held
 *  constant even though the light's DIRECTION now follows DayNightCycle.sunDir
 *  (see updateSunShadow), so the shadow map's projection depth never changes. */
const SUN_SHADOW_DISTANCE = SUN_SHADOW_OFFSET.length()
/** Scratch for the per-frame shadow-frustum re-centre (never retained). */
const _shadowCenter = new THREE.Vector3()
/** Scratch sun direction used ONLY for the shadow-casting light position — a
 *  copy of DayNightCycle.sunDir with a small positive elevation floor, so the
 *  shadow-casting light never dives below the terrain and flips the shadow
 *  direction upside-down at night (when sun.intensity is already near zero,
 *  so the visual difference is imperceptible). Never reallocated. */
const _shadowSunDir = new THREE.Vector3()
/** Reused offset vector (direction × distance) added to the shadow target to
 *  place the light each frame (updateSunShadow). Never reallocated. */
const _sunOffset = new THREE.Vector3()

/** On-foot slice of the per-frame info (null while in the mech). */
export interface OnFootFrameInfo {
  /** Town the pilot is dismounted inside. */
  townId: string
  /** Nearest interactable NPC within {@link NPC_INTERACT_RADIUS}, or null. */
  nearestNPC: { id: string; name: string; role: NPCRole; anchor: AnchorKind; distance: number } | null
  /** Nearest anchor within {@link ANCHOR_INTERACT_RADIUS}, or null. */
  nearestAnchor: { kind: AnchorKind; label: string; distance: number } | null
  /** True once the pilot walks past the town bounds (show a "head back" nudge). */
  outOfBounds: boolean
  /** Seconds until forced remount when hostiles appeared on foot, else null. */
  remountSecondsLeft: number | null
}

export interface StoryWorldConfig {
  canvas: HTMLCanvasElement
  /** The player mech (built from the run's loadout by the caller). */
  playerMech: MechEntity
  /** Town data from the run; used to place + initialise Town visuals. */
  towns: TownState[]
  /** Graphics quality (shadow/AA/render-scale); honours the user's settings. */
  graphics?: GraphicsSettings
  /** New Game+ cycle (§5). >0 fields tougher enemies for the whole session. */
  ngPlusLevel?: number
  /**
   * Called once per frame with the player's current world position, the nearest
   * town, its centre distance, and the dt — so the host can drive decay/HUD.
   */
  onFrame?: (info: StoryFrameInfo) => void
  /** Fired when an active combat/object encounter completes (host pays + advances).
   *  The optional §5 outcome carries a `rewardMultiplier` (degraded escort payouts)
   *  and per-type detail the host can fold into its reward/toast. */
  onQuestComplete?: (quest: QuestDef, outcome?: CombatOutcome) => void
  /** Fired when a §5 objective encounter FAILS without a player death (all crawlers
   *  lost, barricade destroyed). The host pays nothing and leaves the quest available
   *  to re-attempt — never a soft-lock. Death still routes through onPlayerDefeated. */
  onQuestFailed?: (quest: QuestDef, reason: string) => void
  /** Fired when the player mech is destroyed during an encounter, with the limb
   *  slots lost (core excluded) for the §3.7 death-stakes repair debt. */
  onPlayerDefeated?: (destroyedSlots: MechSlot[]) => void
  /** Fired per enemy killed with its loadout + destroyed limbs (host awards salvage, §3.6). */
  onEnemyKilled?: (kill: EnemyKill) => void
  /** Fired per roaming BANDIT killed (same payload shape as onEnemyKilled — the
   *  host awards salvage identically); see Bandits.ts. */
  onBanditKilled?: (kill: EnemyKill) => void
  /** Fired (throttled) the first time a roaming bandit aggros on the player. */
  onBanditsSpotted?: (count: number) => void
  /** Fired when a named ace calls in its half-health reinforcement pair (§3.6 comms callout). */
  onReinforcement?: (info: { bossName: string; count: number }) => void
  /**
   * Fired when combat harms the town (explosions / stray ordnance inside the
   * town, §3.5). `amount` is a normalized severity, `position` the impact point.
   * Phase 2 only surfaces this; Phase 3 routes it into a town-condition decrement.
   */
  onCollateral?: (amount: number, position: THREE.Vector3) => void
  /**
   * Fired when a free-roam shot (outside an active encounter) lands near a town
   * with no hostiles around to blame it on (see OverworldGunplay). `severity` is
   * `1 - dist/RECKLESS_FIRE_RADIUS`; the host taxes that town's standing.
   */
  onRecklessFire?: (townId: string, severity: number) => void
  /**
   * Fired whenever the body mode flips (dismount/mount/restore). The host routes
   * this into `useStoryMode.setPilotMode(mode, { townId, mechPark })` so the decay
   * pause (§4.2) and the save/load round-trip share one source of truth.
   */
  onModeChange?: (mode: PilotMode, ctx: { townId: string | null; mechPark: [number, number, number] | null }) => void
}

export interface StoryFrameInfo {
  /** Which body the player currently inhabits (design §4). */
  mode: PilotMode
  /** On-foot details (nearest NPC/anchor, bounds, remount timer), null in mech. */
  onFoot: OnFootFrameInfo | null
  /** True when a dismount is currently allowed (in mech, inside a town, no combat,
   *  seam wired) — the host shows the "Dismount" prompt off this. */
  canDismount: boolean
  deltaTime: number
  playerPosition: THREE.Vector3
  nearestTownId: string | null
  nearestTownName: string | null
  /** Centre distance (world units) to the nearest town. */
  nearestTownDistance: number
  /** Bearing to the nearest town relative to where the camera is facing, in
   *  radians: 0 = dead ahead, +ve = to the right, ±π = behind. Lets the HUD show
   *  a compass arrow so "which way do I go" is answerable, not just "how far". */
  nearestTownBearing: number
  /** Whether the player is inside the nearest town's decay radius. */
  insideTownId: string | null
  /** Town whose quest-giver the player is close enough to talk to (E), or null. */
  questGiverTownId: string | null
  /** Whether a combat/object encounter is currently running. */
  encounterActive: boolean
  /** Live progress of the active encounter (cleared/total, found/collected), plus
   *  the §5 variety readouts (convoy / hold-waves / extraction) when relevant. */
  encounter: {
    questId: string
    cleared: number
    total: number
    found: boolean
    collected: boolean
    // --- Phase 5 variety HUD readouts (populated only for the relevant type) ---
    /** escort_convoy: crawlers still rolling / that reached the waypoint / dispatched. */
    crawlersAlive?: number
    crawlersArrived?: number
    crawlersTotal?: number
    /** hold_the_line: current wave (1-based), total waves, barricade HP fraction 0..1. */
    waveIndex?: number
    waveTotal?: number
    barricadeFraction?: number
    /** extraction: current phase, seconds left in the hold, perimeter ring fraction 0..1. */
    extractionPhase?: 'reach' | 'hold'
    secondsLeft?: number
    perimeterFraction?: number
  } | null
}

/**
 * A single persistent 3D scene for the story-mode open world.
 *
 * Reuses the single-player battle systems (MechEntity, InputManager,
 * CameraController, PhysicsSystem) but with NO arena walls and a large ground
 * plane. Towns are placed around the map. Free-roam only in Phase 1 — combat,
 * quests, and enemies arrive in later phases.
 *
 * All three.js objects are markRaw / non-reactive (matching BattleScene). The
 * render loop pauses while the tab is hidden and everything is disposed on
 * teardown.
 */
export class StoryWorld {
  private canvas: HTMLCanvasElement
  private scene: THREE.Scene
  private renderer: THREE.WebGLRenderer
  private camera: CameraController
  private inputManager: InputManager
  private physicsSystem: PhysicsSystem
  private projectileSystem: ProjectileSystem
  private particleSystem: ParticleSystem
  private combat: StoryCombat
  private terrain!: Terrain
  /** Shadow-map resolution + whether shadows are on (from graphics settings). */
  private shadowMapSize = 2048
  private shadowsEnabled = true

  /** Backing field for the player mech. Replaced in place by applyLoadout(). */
  private _playerMech: MechEntity
  /** The player mech (read-only to callers; mutated internally on garage equip). */
  get playerMech(): MechEntity {
    return this._playerMech
  }
  private towns: Town[] = []

  private onFrame?: (info: StoryFrameInfo) => void
  private onQuestComplete?: (quest: QuestDef, outcome?: CombatOutcome) => void
  private onQuestFailed?: (quest: QuestDef, reason: string) => void
  private onPlayerDefeated?: (destroyedSlots: MechSlot[]) => void
  private onEnemyKilled?: (kill: EnemyKill) => void
  private onBanditKilled?: (kill: EnemyKill) => void
  private onBanditsSpotted?: (count: number) => void
  private onReinforcement?: (info: { bossName: string; count: number }) => void
  private onCollateral?: (amount: number, position: THREE.Vector3) => void
  private onRecklessFire?: (townId: string, severity: number) => void
  /** Free-roam weapons fire outside active encounters (cadence, ground scars,
   *  near-town reckless-fire standing tax). Constructed after setupTowns(). */
  private gunplay!: OverworldGunplay
  /** Roaming hostile mechs that prowl near living towns (design: bandits give
   *  the player something to fight — and justify weapons fire near towns —
   *  outside quest encounters). Not underscore-prefixed so the dev debug handle
   *  (`window.__storyWorld.bandits`) can poke it. Constructed after gunplay
   *  (shares the projectile/particle systems + terrain + live town states). */
  bandits!: BanditSystem
  /** Live town state (id/position/condition), retained from config so BanditSystem
   *  always reads the CURRENT condition as decay/collateral tick — see Bandits.ts. */
  private townStates: TownState[] = []

  /** Day/night cycle: rotates the sun/planet/moon overhead as one rigid sweep
   *  and derives the lighting/fog outputs WeatherSystem composes each frame
   *  (see DayNightCycle.ts). Public-ish (not underscore-prefixed) so the dev
   *  debug handle (`window.__storyWorld.dayNight`) can poke it manually. */
  readonly dayNight: DayNightCycle = new DayNightCycle()
  /** Animated alien-sky shader material (planet spin / star twinkle); driven each frame. */
  private skyMaterial: THREE.ShaderMaterial | null = null
  /** The sky dome mesh; re-centred on the camera each frame so it never clips. */
  private skyMesh: THREE.Mesh | null = null
  /** The sun light; its shadow frustum follows the player (see updateSunShadow). */
  private sun: THREE.DirectionalLight | null = null
  /** Ambient/hemisphere lights, kept as fields so WeatherSystem can mutate their
   *  intensity in place (never re-added — see WeatherRefs' ownership doc). */
  private ambientLight: THREE.AmbientLight | null = null
  private hemiLight: THREE.HemisphereLight | null = null
  /** Drifting clouds / rain / dust storms / shifting fog-haze (see Weather.ts). */
  private weather!: WeatherSystem
  /** Constant world↔light-space rotation, used to texel-snap the shadow frustum
   *  centre in updateSunShadow (built once in setupLighting). */
  private readonly sunBasis = new THREE.Matrix4()
  private readonly sunBasisInverse = new THREE.Matrix4()
  private animationId: number | null = null
  private lastTime: number = 0
  private elapsed: number = 0
  // FPS over a rolling 60-frame window (mirrors BattleScene) for the HUD counter.
  private fpsFrameTimes: number[] = []
  private currentFPS: number = 0
  /** Combat clock for weapon cooldown bookkeeping (mirrors BattleScene.battleTime). */
  private battleTime: number = 0
  // Particle budget for missile smoke trails (mirrors BattleScene.missileSmokeBudget).
  private missileSmokeBudget: number = 0
  // Rising-edge latch for the rack-ability key (fire once per press, see BattleScene).
  private rackAbilityHeld = false
  /** Suspends decay/free-roam input while a dialogue/garage UI is open. */
  private paused: boolean = false

  // --- On-foot / dismount state (design §4) ---
  private onModeChange?: (mode: PilotMode, ctx: { townId: string | null; mechPark: [number, number, number] | null }) => void
  /** Current body mode; the Frame is always kept in the scene (monument). */
  private _mode: PilotMode = 'mech'
  /** The dismounted pilot body (ENTITY cluster) while on foot, else null. */
  private _onFootEntity: OnFootEntity | null = null
  /** OnFootPhysics controller (constructed lazily, reused across dismounts). */
  private _onFootPhysics: OnFootPhysics | null = null
  /** Town the pilot dismounted inside (bounds + NPC/anchor queries key off it). */
  private _dismountTown: Town | null = null
  /** Where the Frame is parked while on foot (monument), world-space. */
  private _mechPark: THREE.Vector3 | null = null
  /** Nearest town + inside-id snapshot, refreshed each frame (dismount gating). */
  private _nearestTown: Town | null = null
  private _insideTownId: string | null = null
  /**
   * Seconds left before a forced remount after on-foot hostiles, or null. Counted
   * down in updateOnFoot (which is skipped while paused), NOT against `elapsed` —
   * so opening a hub panel during the grace window doesn't silently burn it (§4.3).
   */
  private _remountSecondsLeft: number | null = null
  /** Edge-trigger latch for the on-foot sprint FOV kick (fire once per press). */
  private _onFootWasSprinting = false

  // --- Reusable per-frame payloads (perf: no 60Hz allocation churn / GC hitches) ---
  /**
   * Reused StoryFrameInfo handed to onFrame every frame. Valid ONLY during the
   * callback — consumers must copy anything they retain across frames. `onFoot`
   * is the one exception and stays freshly allocated per frame (buildOnFootInfo):
   * StoryModePage stores it in a ref and needs its identity to change to trigger
   * Vue reactivity.
   */
  private readonly _frameInfo: StoryFrameInfo = {
    mode: 'mech',
    onFoot: null,
    canDismount: false,
    deltaTime: 0,
    playerPosition: new THREE.Vector3(),
    nearestTownId: null,
    nearestTownName: null,
    nearestTownDistance: Infinity,
    nearestTownBearing: 0,
    insideTownId: null,
    questGiverTownId: null,
    encounterActive: false,
    encounter: null,
  }
  /** Reused encounter sub-object of {@link _frameInfo}. Every field — including
   *  the optional §5 variety ones — is reassigned each frame, so stale values
   *  can never leak between quest types. */
  private readonly _encounterInfo: NonNullable<StoryFrameInfo['encounter']> = {
    questId: '',
    cleared: 0,
    total: 0,
    found: false,
    collected: false,
  }
  /** Scratch aim direction (reused each combat frame; see getAimDirection). */
  private readonly _aimDir = new THREE.Vector3()

  private handleResizeBound: () => void
  private handleVisibilityBound: () => void
  private handleContextLostBound: (e: Event) => void
  private handleContextRestoredBound: () => void
  /** True while the WebGL context is lost (e.g. OS reclaimed it under memory
   *  pressure on mobile). The render loop pauses instead of hammering a dead
   *  context with GL errors; it resumes on `webglcontextrestored`. */
  private contextLost = false

  constructor(config: StoryWorldConfig) {
    this._playerMech = config.playerMech
    this.onFrame = config.onFrame
    this.onQuestComplete = config.onQuestComplete
    this.onQuestFailed = config.onQuestFailed
    this.onPlayerDefeated = config.onPlayerDefeated
    this.onEnemyKilled = config.onEnemyKilled
    this.onBanditKilled = config.onBanditKilled
    this.onBanditsSpotted = config.onBanditsSpotted
    this.onReinforcement = config.onReinforcement
    this.onCollateral = config.onCollateral
    this.onRecklessFire = config.onRecklessFire
    this.onModeChange = config.onModeChange
    // Retained (not just consumed) so BanditSystem's spawn eligibility always
    // reads the LIVE condition as the host's decay/collateral ticks mutate it.
    this.townStates = config.towns

    // --- Scene + renderer (mirrors BattleScene setup; honours graphics settings) ---
    const gfx = config.graphics
    this.canvas = config.canvas
    this.scene = markRaw(new THREE.Scene())
    this.renderer = markRaw(new THREE.WebGLRenderer({
      canvas: config.canvas,
      antialias: gfx?.antialias ?? true,
    }))
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    // Cap the device pixel ratio at 2 (matches BattleScene): uncapped DPR on
    // 4K/scaled displays quadruples fill-rate cost for imperceptible sharpness.
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2) * (gfx?.renderScale ?? 1.0))
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.0

    // Shadow quality from settings (off disables the shadow pass entirely).
    const shadowQuality = gfx?.shadowQuality ?? 'high'
    if (shadowQuality === 'off') {
      this.renderer.shadowMap.enabled = false
      this.shadowsEnabled = false
    } else {
      this.renderer.shadowMap.enabled = true
      const shadowMapSizes: Record<string, number> = { low: 512, medium: 1024, high: 2048 }
      this.shadowMapSize = shadowMapSizes[shadowQuality] ?? 2048
    }

    // --- Systems ---
    this.inputManager = new InputManager(config.canvas)
    this.physicsSystem = new PhysicsSystem()
    // Large open-world bounds (no arena walls); double the half-extent so the
    // playable square spans the whole ground plane.
    this.physicsSystem.setArenaBounds(WORLD_HALF_EXTENT * 2, WORLD_HALF_EXTENT * 2)
    this.camera = new CameraController(this.playerMech)
    // Reduced-motion (§5): zero out camera shake/kick/dip when the player opted in.
    this.camera.motionScale = motionScale({ reducedMotion: gfx?.reducedMotion ?? false })

    // --- Combat systems (single-player only; mirrors BattleScene) ---
    this.projectileSystem = new ProjectileSystem(this.scene)
    this.particleSystem = new ParticleSystem(this.scene)
    // Budget the smoke trail like BattleScene: unthrottled this hook fires every
    // 0.03s per missile (~470 particles/s each), saturating the particle pool.
    // Accrue time-based budget and spend ~13 particles per puff (~60/s cap).
    this.projectileSystem.onMissileSmoke = (p: THREE.Vector3) => {
      this.missileSmokeBudget += 0.03 * 60 // interval × target particles/s
      if (this.missileSmokeBudget < 13) return
      this.missileSmokeBudget -= 13 // ~particles per 'floor' spark puff
      this.particleSystem.spawnImpactSparks(p, new THREE.Vector3(0, 1, 0), 'floor')
    }

    // Footfall / landing weight (design §3.1): route PhysicsSystem's weight-scaled
    // strides and ground slams into the camera dip/shake + a landing dust ring.
    this.physicsSystem.onFootstep = (intensity) => this.camera.onFootstep(intensity)
    this.physicsSystem.onLanding = (intensity) => {
      this.camera.onLanding(intensity)
      this.particleSystem.spawnImpactSparks(
        this.playerMech.position.clone(), new THREE.Vector3(0, 1, 0), 'floor',
      )
    }
    // Smoke rack ability + slot-destruction feedback on the player mech.
    this.wirePlayerHooks(this.playerMech)

    this.combat = new StoryCombat(this.scene, this.projectileSystem, this.particleSystem)
    // Encounters are local to a town; bound the AI to a generous play radius.
    this.combat.setArenaBounds(WORLD_HALF_EXTENT)
    // New Game+ (§5): every enemy this session spawns one tier tougher per cycle.
    if (config.ngPlusLevel) this.combat.setNgPlusLevel(config.ngPlusLevel)
    this.combat.onShake = (amount) => this.camera.triggerShake(amount)
    this.combat.onComplete = (quest, outcome) => this.onQuestComplete?.(quest, outcome)
    this.combat.onQuestFailed = (quest, reason) => this.onQuestFailed?.(quest, reason)
    this.combat.onPlayerDefeated = (slots) => this.onPlayerDefeated?.(slots)
    // Salvage + comms + collateral seams (§3.5/§3.6) — pass through to the host.
    this.combat.onEnemyKilled = (kill) => this.onEnemyKilled?.(kill)
    this.combat.onReinforcement = (info) => this.onReinforcement?.(info)
    this.combat.onCollateral = (amount, pos) => this.onCollateral?.(amount, pos)

    // --- World content ---
    this.setupSky()
    this.setupLighting()
    this.setupTerrain(config.towns)
    this.setupTowns(config.towns)

    // Free-roam weapons fire (outside active encounters): cadence-gated firing,
    // ground scars, near-town reckless-fire standing tax, stray-impact/building-
    // hit condition tax. Needs the terrain (ground impacts) and towns (reckless-
    // fire proximity + building colliders), so it's built here.
    this.gunplay = new OverworldGunplay({
      projectileSystem: this.projectileSystem,
      particleSystem: this.particleSystem,
      terrain: this.terrain,
      scene: this.scene,
      towns: this.towns,
    })
    this.gunplay.onRecklessFire = (townId, severity) => this.onRecklessFire?.(townId, severity)
    // Stray-impact/building-hit condition tax reuses the existing onCollateral
    // seam (StoryCombat's own collateral contract, §3.5) rather than adding a
    // new StoryWorldConfig callback — onCollateral is (amount, position), so
    // resolve the town's position from its id before forwarding.
    this.gunplay.onStrayImpact = (townId, severity) => {
      const town = this.towns.find((t) => t.id === townId)
      if (town) this.onCollateral?.(severity, town.position)
    }

    // Roaming bandits (design: hostile mechs that prowl near living towns, can
    // be fought/killed in free roam, and justify the player's weapons fire near
    // a town — see BanditSystem.hasHostileNear below). Shares the projectile/
    // particle systems + terrain with gunplay/combat; needs the live town states
    // for spawn eligibility (condition + player proximity).
    this.bandits = new BanditSystem({
      scene: this.scene,
      projectileSystem: this.projectileSystem,
      particleSystem: this.particleSystem,
      terrain: this.terrain,
      towns: this.townStates,
      onShake: (amount) => this.camera.triggerShake(amount),
      onBanditKilled: (kill) => this.onBanditKilled?.(kill),
      // Shared defeat flow with StoryCombat: the host's onPlayerDefeated handler
      // already tolerates no active quest/town context (see StoryModePage).
      onPlayerDefeated: (slots) => this.onPlayerDefeated?.(slots),
      onBanditsSpotted: (count) => this.onBanditsSpotted?.(count),
      onHostileWhileOnFoot: () => this.signalHostileWhileOnFoot(),
    })
    // Reckless-fire gate (design): a live bandit within weapons range of the
    // shot vouches for it — no town protest when there's an actual hostile to
    // blame it on. 130u ≈ practical engagement range (autocannon rounds carry
    // ~120-180u), so opening fire on a bandit you can actually hit never reads
    // as vandalism, while bandits spawn 90-150u out from towns.
    // The stray-impact/building CONDITION tax stays unconditional (onStrayImpact
    // above is untouched) — mirrors how combat collateral still taxes the town
    // during a sanctioned fight.
    this.gunplay.hostilesNear = (pos) => this.bandits.hasHostileNear(pos, 130)

    // Ambient weather (drifting clouds, occasional rain/dust storms, shifting
    // haze/fog). Mutates the fog + lights just set up above in place; a fresh
    // random seed per session keeps the state-machine's sequence varied while
    // staying fully deterministic/testable (see Weather.ts).
    this.weather = new WeatherSystem(
      this.scene,
      { fog: this.scene.fog as THREE.Fog, sun: this.sun!, ambient: this.ambientLight!, hemi: this.hemiLight! },
      Math.floor(Math.random() * 0xffffffff),
    )

    // Mechs walk on the procedural terrain (towns sit on flattened pads).
    this.physicsSystem.setGroundHeightProvider((x, z) => this.terrain.heightAt(x, z))

    // Player mech into the scene, snapped onto the ground at its spawn.
    this._playerMech.position.y = this.terrain.heightAt(
      this._playerMech.position.x,
      this._playerMech.position.z,
    )
    this.scene.add(this.playerMech.mesh)

    // --- Events ---
    this.handleResizeBound = () => this.handleResize()
    window.addEventListener('resize', this.handleResizeBound)
    this.handleVisibilityBound = () => this.handleVisibilityChange()
    document.addEventListener('visibilitychange', this.handleVisibilityBound)
    // WebGL context loss/restore (§ production): mobile browsers reclaim the GL
    // context under memory pressure or when backgrounded. preventDefault() opts
    // into automatic restoration; we pause the loop while lost and resume after.
    this.handleContextLostBound = (e: Event) => this.handleContextLost(e)
    this.handleContextRestoredBound = () => this.handleContextRestored()
    this.canvas.addEventListener('webglcontextlost', this.handleContextLostBound, false)
    this.canvas.addEventListener('webglcontextrestored', this.handleContextRestoredBound, false)

    // Dev-only escape hatch for manual/automated poking (force weather states,
    // teleport, inspect subsystems) without shipping any surface in prod builds.
    if (import.meta.env.DEV && typeof window !== 'undefined') {
      ;(window as unknown as Record<string, unknown>).__storyWorld = this
    }
  }

  /**
   * Wire the per-mech feedback callbacks the player entity needs: the smoke rack
   * cloud and the slot-destruction burst (§3.3). Called at construction AND after
   * applyLoadout rebuilds the mech, so a garage swap never drops these hooks.
   */
  private wirePlayerHooks(mech: MechEntity): void {
    mech.onSmokeDeploy = (pos) => this.particleSystem.spawnSmokeScreen(pos)
    mech.onSlotDestroyed = (m, slot) => {
      this.particleSystem.spawnExplosion(m.getSlotPosition(slot), 1.2)
      this.camera.triggerShake(0.5)
    }
  }

  private setupSky(): void {
    // Alien-world sky (deep violet zenith, huge ringed companion planet, faint
    // daytime stars) — see OverworldSky.ts. Radius sits well inside the camera's
    // far plane (1000); the dome FOLLOWS the camera each frame (updateSky) with
    // depth off + a negative render order, so its far side can never clip to
    // black and it always renders behind the world.
    const skyGeometry = new THREE.SphereGeometry(800, 48, 24)
    this.skyMaterial = createOverworldSkyMaterial()
    const skyMesh = new THREE.Mesh(skyGeometry, this.skyMaterial)
    skyMesh.renderOrder = -1
    skyMesh.frustumCulled = false
    this.scene.add(skyMesh)
    this.skyMesh = skyMesh

    // Distance haze: fade the far edges of the (large) map into the horizon
    // colour so the world reads as open and continuous rather than a flat slab.
    // Tinted to the alien horizon rose so terrain melts into the same sky.
    // Fog FAR is kept inside the camera's 1000u far plane (WORLD_HALF_EXTENT=600
    // → 900) so distant terrain hazes fully out before it would hard-clip at the
    // far plane, instead of popping while still ~24% visible.
    this.scene.fog = new THREE.Fog(0xb08a80, WORLD_HALF_EXTENT * 0.75, WORLD_HALF_EXTENT * 1.5)
  }

  /** Keep the sky dome centred on the camera (so its far side never clips past
   *  the far plane) and advance its animated uniforms (planet spin, twinkle,
   *  and the current sun/planet/moon directions from the day/night cycle —
   *  see DayNightCycle.ts). */
  private updateSky(): void {
    if (this.skyMesh) this.skyMesh.position.copy(this.camera.camera.position)
    if (this.skyMaterial) {
      updateOverworldSky(
        this.skyMaterial, this.elapsed,
        this.dayNight.sunDir, this.dayNight.planetDir, this.dayNight.moonDir,
      )
    }
  }

  private setupLighting(): void {
    const ambient = new THREE.AmbientLight(0xffffff, 0.6)
    this.scene.add(ambient)
    this.ambientLight = ambient

    const sun = new THREE.DirectionalLight(0xfff4e0, 0.9)
    sun.position.copy(SUN_SHADOW_OFFSET)
    sun.castShadow = this.shadowsEnabled
    // A tight follow-box frustum instead of the whole ±600u world: only casters
    // near the player enter the shadow pass (distant towns are frustum-culled),
    // and texel density improves ~8x. Re-centred on the active body every frame
    // in updateSunShadow(); the BOUNDS themselves never change after this (so no
    // per-frame updateProjectionMatrix is needed).
    sun.shadow.camera.left = -SHADOW_FRUSTUM_HALF_EXTENT
    sun.shadow.camera.right = SHADOW_FRUSTUM_HALF_EXTENT
    sun.shadow.camera.top = SHADOW_FRUSTUM_HALF_EXTENT
    sun.shadow.camera.bottom = -SHADOW_FRUSTUM_HALF_EXTENT
    // The light hovers ~247u from its target; 500 covers the follow-box plus
    // terrain relief with margin (1200 wasted ortho depth precision).
    sun.shadow.camera.far = 500
    sun.shadow.mapSize.width = this.shadowMapSize
    sun.shadow.mapSize.height = this.shadowMapSize
    this.scene.add(sun)
    // The target moves with the player each frame; it MUST live in the scene
    // graph or its matrixWorld never updates and the shadows silently break.
    this.scene.add(sun.target)
    this.sun = sun

    // Constant light-space basis (the light direction never changes): Z points
    // from the sun toward its target, X/Y span the shadow map's texel plane.
    this.sunBasis.lookAt(SUN_SHADOW_OFFSET, new THREE.Vector3(0, 0, 0), THREE.Object3D.DEFAULT_UP)
    this.sunBasisInverse.copy(this.sunBasis).invert()

    // Sky-tinted ambient bounce: a violet-rose skylight agrees with the alien
    // overworld sky, while the ground term stays earthy so terrain still reads.
    const hemi = new THREE.HemisphereLight(0xb59fd6, 0x5a6a3a, 0.4)
    this.scene.add(hemi)
    this.hemiLight = hemi
  }

  /**
   * Re-centre the sun's shadow follow-box on `center` (the active body). The
   * target moves to the (texel-snapped) centre and the light sits
   * SUN_SHADOW_DISTANCE away along the CURRENT day/night sun direction — so
   * the shadows swing with the sky instead of a fixed offset. The texel-snap
   * basis (sunBasis/sunBasisInverse, built once in setupLighting from the
   * ORIGINAL fixed sun offset) is kept constant rather than rebuilt every
   * frame: the day/night rotation is slow enough that re-deriving it per-
   * frame would buy negligible shimmer reduction for a real cost, and the
   * snap only needs to fight camera-motion shimmer, not track the sun exactly.
   *
   * The shadow-casting direction is floored to a small positive elevation
   * (_shadowSunDir) so the light never dives below the terrain and flips the
   * shadow direction upside-down at night — by then sun.intensity is already
   * near its NIGHT_SUN_FLOOR, so the visual difference is imperceptible.
   */
  private updateSunShadow(center: THREE.Vector3): void {
    const sun = this.sun
    if (!sun || !this.shadowsEnabled) return
    const worldUnitsPerTexel = (SHADOW_FRUSTUM_HALF_EXTENT * 2) / this.shadowMapSize
    _shadowCenter.copy(center).applyMatrix4(this.sunBasisInverse)
    _shadowCenter.x = Math.round(_shadowCenter.x / worldUnitsPerTexel) * worldUnitsPerTexel
    _shadowCenter.y = Math.round(_shadowCenter.y / worldUnitsPerTexel) * worldUnitsPerTexel
    _shadowCenter.applyMatrix4(this.sunBasis)
    sun.target.position.copy(_shadowCenter)

    _shadowSunDir.copy(this.dayNight.sunDir)
    if (_shadowSunDir.y < 0.05) _shadowSunDir.y = 0.05
    _shadowSunDir.normalize()
    _sunOffset.copy(_shadowSunDir).multiplyScalar(SUN_SHADOW_DISTANCE)
    sun.position.copy(_shadowCenter).add(_sunOffset)
  }

  /**
   * Procedurally-generated rolling terrain. Each town gets a flattened pad so
   * its buildings, farms and combat encounters stay on level ground while the
   * surrounding wilderness undulates. The heightfield is deterministic (seeded)
   * so reloads reproduce the same hills, and it backs the physics ground-height
   * queries so mechs walk on the surface.
   */
  private setupTerrain(townStates: TownState[]): void {
    const size = WORLD_HALF_EXTENT * 2
    // Flatten generously around each town (the flat radius clears the town's 34u
    // pad and the 30–45u combat-encounter spawn ring) plus a pad at the origin so
    // the player always spawns on level plains. Pads sit at y = 0 so combat/spawn
    // logic is unchanged.
    const pads = townStates.map((t) => ({
      x: t.position[0],
      z: t.position[2],
      flatRadius: 50,
      blendRadius: 45,
      elevation: 0,
    }))
    pads.push({ x: 0, z: 0, flatRadius: 32, blendRadius: 48, elevation: 0 })

    // 160 segments (was 300): 180k→~51k tris on the un-cullable world-spanning
    // ground mesh — the single biggest geometry in the open-world frame. The
    // heightfield is gentle and towns sit on flat pads, so the silhouette loss
    // is imperceptible while the vertex-shader cost drops ~3.5x.
    this.terrain = new Terrain({ size, segments: 160, seed: 1337, pads })
    this.scene.add(this.terrain.mesh)
    this.scene.add(this.terrain.waterMesh)
    // Wilderness scatter (rocks / alien flora / grass) — instanced, disposed by Terrain.
    for (const m of this.terrain.scatterMeshes) this.scene.add(m)
  }

  private setupTowns(townStates: TownState[]): void {
    for (const state of townStates) {
      const town = new Town(state)
      this.towns.push(town)
      this.scene.add(town.group)
    }
  }

  // --- Lifecycle ---

  start(): void {
    this.lastTime = performance.now()
    this.animate()
  }

  private animate = (): void => {
    if (document.hidden || this.contextLost) {
      this.animationId = null
      return
    }
    this.animationId = requestAnimationFrame(this.animate)

    const currentTime = performance.now()
    const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1)
    this.lastTime = currentTime
    this.elapsed += deltaTime
    this.battleTime += deltaTime

    this.fpsFrameTimes.push(currentTime)
    if (this.fpsFrameTimes.length > 60) {
      this.fpsFrameTimes.shift()
    }
    if (this.fpsFrameTimes.length >= 2) {
      const fpsElapsed = (currentTime - this.fpsFrameTimes[0]) / 1000
      this.currentFPS = Math.round((this.fpsFrameTimes.length - 1) / fpsElapsed)
    }

    this.update(deltaTime)
    this.render()
  }

  getFPS(): number {
    return this.currentFPS
  }

  private update(deltaTime: number): void {
    const input = this.inputManager.getInputState()

    // The planet's rotation (sun/planet/moon sweep + lighting/fog outputs)
    // advances first, unconditionally (like weather, it must not freeze on a
    // paused menu) — WeatherSystem.update reads its outputs this same frame.
    this.dayNight.update(deltaTime)

    // Ambient weather (drifting clouds/rain/dust storms, shifting fog/haze) keeps
    // evolving even while a UI panel pauses free-roam/combat below — it must not
    // freeze on menus, so it runs unconditionally ahead of the paused early-return.
    this.weather.update(deltaTime, this.activePosition(), this.dayNight)

    // While a UI panel (dialogue/garage) is open the world is paused: no input,
    // no decay, no combat. Particles still settle so nothing freezes mid-burst.
    if (this.paused) {
      this.particleSystem.update(deltaTime)
      this.camera.update(deltaTime, 0, 0)
      this.inputManager.resetMouseMovement()
      return
    }

    // Camera first: this sets the mech's yaw from the mouse BEFORE movement and
    // the mesh sync below, so (a) movement is camera-relative on the same frame
    // and (b) the rendered body tracks the camera with no one-frame trail.
    this.camera.update(deltaTime, input.mouseX, input.mouseY)
    this.inputManager.resetMouseMovement()

    if (this._mode === 'onFoot') {
      // On foot (design §4): no dash/jump/rack/weapons — just a slow walk resolved
      // against the town's colliders. The Frame stays parked as a monument.
      this.updateOnFoot(input, deltaTime)
    } else {
      // Overworld traversal is much larger than an arena (towns are 300m+ apart),
      // so free-roam runs at OVERWORLD_SPEED_MULT; combat drops back to arena
      // speed (1.0) so encounters keep their tuned feel.
      this.physicsSystem.speedMultiplier = this.combat.active ? 1.0 : OVERWORLD_SPEED_MULT
      // Match accel/friction to the free-roam speed scale so fast travel doesn't
      // spool up slushily or coast forever; combat drops back to arena feel (1.0).
      this.physicsSystem.accelMultiplier = this.combat.active ? 1.0 : 1.7
      this.physicsSystem.frictionMultiplier = this.combat.active ? 1.0 : 1.3
      // Player movement (dash / move / jump) — same systems as battle.
      const dashStarted = this.physicsSystem.updateDash(this.playerMech, input, deltaTime)
      if (dashStarted) {
        // The dash reads as a forward surge: a light shake + FOV punch, and the
        // camera hangs back then lerps forward to catch the lunge (onDash). The
        // shake is kept small so it doesn't fight that smooth catch-up.
        this.camera.triggerShake(0.12)
        this.camera.triggerFovKick(10)
        this.camera.onDash()
      }
      if (!this.playerMech.isDashing) {
        this.physicsSystem.updateMovement(this.playerMech, input, deltaTime)
      }
      this.physicsSystem.updateJumpJets(this.playerMech, input, deltaTime)
      this.playerMech.update(deltaTime)
      this.playerMech.updatePower(deltaTime)

      // Rack ability (smoke / shield / jump-jets / repair) — mirrors BattleScene so
      // the finished rack abilities (design §3.4) are reachable in story combat too.
      // Bound to Q and edge-triggered so holding boost (E) never auto-dumps it.
      this.playerMech.rackAbilityCooldown = Math.max(0, this.playerMech.rackAbilityCooldown - deltaTime)
      if (input.useRackAbility && !this.rackAbilityHeld) {
        this.playerMech.useRackAbility()
      }
      this.rackAbilityHeld = input.useRackAbility
    }

    // NOTE: intentionally NOT calling camera.reanchor() here. camera.update()
    // above runs before movement (so movement is camera-relative on the same
    // frame); letting the camera trail the post-move position by a frame + the
    // built-in positional lerp is what gives fast overworld travel its weighty
    // trail. A per-frame reanchor used to hard-snap smoothedPosition to the
    // post-move spot, silently nullifying POSITION_LAG (BattleScene never
    // reanchors either). setPlayerPosition() still reanchors for teleports.

    // --- Active encounter combat (firing, AI, projectiles, VFX) ---
    // Never runs on foot: the interlock blocks dismount during combat, and any
    // hostiles that appear on foot force a remount rather than an on-foot fight.
    this.particleSystem.update(deltaTime)
    if (this._mode === 'mech' && this.combat.active) {
      this.combat.update(
        deltaTime,
        this.playerMech,
        { left: input.shootLeft, right: input.shootRight, aimDir: this.getAimDirection() },
        this.battleTime,
      )
    }
    // Free-roam weapons fire (outside active encounters): cadence-gated firing
    // with free aim, projectile flight while no encounter owns it, and ground-
    // impact scarring (runs regardless of combat state — stray encounter fire
    // scars the terrain too).
    this.gunplay.update(
      deltaTime,
      this.playerMech,
      { shootLeft: input.shootLeft, shootRight: input.shootRight },
      this.getAimDirection(),
      this.combat.active,
      this._mode,
    )
    // Roaming bandits: spawn/wander/aggro/combat, AFTER gunplay has advanced the
    // projectile system this frame (bandits' own hit-resolution pass reads the
    // post-move positions — see BanditSystem.resolveCombat).
    this.bandits.update(deltaTime, this.playerMech, this._mode, this.combat.active)

    // Towns: animate markers + find the nearest one to the ACTIVE body (mech or
    // pilot), so all proximity readouts follow whoever the camera is on.
    const activePos = this.activePosition()
    // Keep the sun's shadow follow-box centred on whoever the camera is on.
    this.updateSunShadow(activePos)
    let nearest: Town | null = null
    let nearestDistSq = Infinity
    for (const town of this.towns) {
      town.update(this.elapsed)
      const dSq = town.distanceSqTo(activePos)
      if (dSq < nearestDistSq) {
        nearestDistSq = dSq
        nearest = town
      }
    }

    const insideRadius = nearest !== null && nearestDistSq <= TOWN_DECAY_RADIUS * TOWN_DECAY_RADIUS
    const questGiverInRange = nearest !== null && nearestDistSq <= QUEST_GIVER_RADIUS * QUEST_GIVER_RADIUS
    // Snapshot for dismount gating (dismount() reads these on the host's keypress).
    this._nearestTown = nearest
    this._insideTownId = insideRadius ? nearest!.id : null

    const prog = this.combat.active ? this.combat.getProgress() : null
    const activeQuest = this.combat.activeQuest

    // Mutate the REUSED frame-info payload in place (no per-frame allocation;
    // valid only during the callback — see the _frameInfo field doc). `onFoot`
    // stays freshly allocated: the host retains it in a ref and relies on its
    // identity changing to trigger reactivity.
    const info = this._frameInfo
    info.deltaTime = deltaTime
    info.mode = this._mode
    info.onFoot = this._mode === 'onFoot' ? this.buildOnFootInfo(activePos) : null
    info.canDismount = this.canDismount()
    info.playerPosition = activePos
    info.nearestTownId = nearest?.id ?? null
    info.nearestTownName = nearest?.name ?? null
    info.nearestTownDistance = nearest ? Math.sqrt(nearestDistSq) : Infinity
    // Bearing to the nearest town relative to the camera facing (yaw). The camera
    // forward is +Z at yaw 0 (atan2(x, z) convention), and camera-right is +X, so
    // (townAngle - yaw) wrapped to (-π, π] gives 0 = ahead, +ve = to the right.
    if (nearest) {
      const townAngle = Math.atan2(nearest.position.x - activePos.x, nearest.position.z - activePos.z)
      let rel = townAngle - this.camera.mouseRotation.x
      rel = ((rel + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI
      info.nearestTownBearing = rel
    } else {
      info.nearestTownBearing = 0
    }
    info.insideTownId = insideRadius ? nearest!.id : null
    info.questGiverTownId = questGiverInRange ? nearest!.id : null
    info.encounterActive = this.combat.active
    if (prog && activeQuest) {
      const enc = this._encounterInfo
      enc.questId = activeQuest.id
      enc.cleared = prog.cleared
      enc.total = prog.total
      enc.found = prog.found
      enc.collected = prog.collected
      // §5 variety readouts — forwarded verbatim (undefined for non-variety
      // types), which also clears stale values left by a previous quest type.
      enc.crawlersAlive = prog.crawlersAlive
      enc.crawlersArrived = prog.crawlersArrived
      enc.crawlersTotal = prog.crawlersTotal
      enc.waveIndex = prog.waveIndex
      enc.waveTotal = prog.waveTotal
      enc.barricadeFraction = prog.barricadeFraction
      enc.extractionPhase = prog.extractionPhase
      enc.secondsLeft = prog.secondsLeft
      enc.perimeterFraction = prog.perimeterFraction
      info.encounter = enc
    } else {
      info.encounter = null
    }
    this.onFrame?.(info)
  }

  /** World-space position of the body the camera is currently on. */
  private activePosition(): THREE.Vector3 {
    return this._mode === 'onFoot' && this._onFootEntity
      ? this._onFootEntity.position
      : this._playerMech.position
  }

  /**
   * Advance the dismounted pilot for one frame (design §4.3). Delegates the walk +
   * collider resolution to the injected OnFootController, then enforces the town
   * leash: past the town radius the pilot is nudged (frame-info flag), and at the
   * hard limit (1.5× radius) they are clamped back so they can never wander the
   * open wilderness on foot. A forced-remount deadline (on-foot hostiles) is also
   * ticked here and auto-mounts on expiry — the answer to danger on foot is to get
   * back in the machine, never to fight (design §6: no on-foot combat).
   */
  private updateOnFoot(input: InputState, deltaTime: number): void {
    const entity = this._onFootEntity
    const physics = this._onFootPhysics
    const town = this._dismountTown
    if (!entity || !physics || !town) return

    // OnFootPhysics reads the town colliders + terrain (set on dismount) and the
    // body's yaw (the camera wrote entity.rotation.y this frame), so movement is
    // camera-relative just like the mech. No dash/jump/rack/weapons on foot.
    physics.updateMovement(entity, input, deltaTime)
    entity.update(deltaTime)

    // Sprint tell: a small, edge-triggered FOV widen on the jog so the dash key
    // actually reads on foot (the mech branch kicks FOV on dash; on-foot had no
    // juice at all). Kept well under the mech's kick and only when actually moving
    // so a stationary held-dash doesn't puff the view. The on-foot camera profile
    // damps it further via shakeScale, so nominal is deliberately generous.
    const sprintingNow = input.dash &&
      (entity.velocity.x ** 2 + entity.velocity.z ** 2) > 0.25
    if (sprintingNow && !this._onFootWasSprinting) this.camera.triggerFovKick(7)
    this._onFootWasSprinting = sprintingNow

    // On-foot Recovery (§2.6): a dismounted search has no combat loop, so drive
    // the hidden-object reveal/collect directly from the pilot's position. Combat
    // encounters never run on foot (the interlock forces a remount instead).
    if (this.combat.active && this.combat.activeQuest?.type === 'hidden_object') {
      this.combat.updateSearchAt(entity.position, deltaTime)
    }

    // Town leash (design §4.3): clamp inside the hard limit around the town centre.
    const dx = entity.position.x - town.position.x
    const dz = entity.position.z - town.position.z
    const dist = Math.sqrt(dx * dx + dz * dz)
    if (dist > ON_FOOT_HARD_LIMIT && dist > 0) {
      const s = ON_FOOT_HARD_LIMIT / dist
      entity.position.x = town.position.x + dx * s
      entity.position.z = town.position.z + dz * s
      entity.position.y = this.terrain.heightAt(entity.position.x, entity.position.z)
    }

    // Forced-remount countdown after on-foot hostiles: auto-mount on expiry. Ticks
    // by dt here (not off `elapsed`) so a paused hub panel freezes the timer too.
    if (this._remountSecondsLeft !== null) {
      this._remountSecondsLeft -= deltaTime
      if (this._remountSecondsLeft <= 0) {
        this.mount()
      }
    }
  }

  /** Assemble the on-foot slice of frame info (NPC/anchor prompts + leash state). */
  private buildOnFootInfo(pos: THREE.Vector3): OnFootFrameInfo {
    const town = this._dismountTown
    if (!town) {
      return { townId: '', nearestNPC: null, nearestAnchor: null, outOfBounds: false, remountSecondsLeft: null }
    }
    const npc = town.nearestNPC(pos, NPC_INTERACT_RADIUS)
    const anchor = town.nearestAnchor(pos, ANCHOR_INTERACT_RADIUS)
    const dx = pos.x - town.position.x
    const dz = pos.z - town.position.z
    const dist = Math.sqrt(dx * dx + dz * dz)
    const npcDist = npc ? Math.hypot(pos.x - npc.position.x, pos.z - npc.position.z) : 0
    const anchorDist = anchor ? Math.hypot(pos.x - anchor.position.x, pos.z - anchor.position.z) : 0
    return {
      townId: town.id,
      nearestNPC: npc ? { id: npc.id, name: npc.name, role: npc.role, anchor: npc.anchor, distance: npcDist } : null,
      nearestAnchor: anchor ? { kind: anchor.kind, label: anchor.label, distance: anchorDist } : null,
      outOfBounds: dist > ON_FOOT_TOWN_RADIUS,
      remountSecondsLeft: this._remountSecondsLeft !== null ? Math.max(0, this._remountSecondsLeft) : null,
    }
  }

  /**
   * World-space aim direction from the camera's yaw/pitch (matches BattleScene).
   * Returns a REUSED scratch vector, valid until the next call — every current
   * consumer reads or clones it synchronously (fireWeapon clones into velocity).
   */
  private getAimDirection(): THREE.Vector3 {
    const yaw = this.camera.mouseRotation.x
    const pitch = this.camera.mouseRotation.y
    return this._aimDir.set(
      Math.sin(yaw) * Math.cos(pitch),
      Math.sin(pitch),
      Math.cos(yaw) * Math.cos(pitch),
    ).normalize()
  }

  private render(): void {
    // Re-centre + animate the sky just before drawing, using the camera's final
    // position for this frame (set by update()/reanchor()).
    this.updateSky()
    this.renderer.render(this.scene, this.camera.camera)
  }

  stop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
  }

  private handleVisibilityChange(): void {
    if (document.hidden) {
      this.stop()
    } else if (this.animationId === null && !this.contextLost) {
      this.lastTime = performance.now()
      this.animate()
    }
  }

  /**
   * WebGL context lost (mobile OS reclaim, GPU reset, or contexts exhausted).
   * preventDefault() tells the browser we intend to restore, then we pause the
   * render loop so we stop calling renderer.render() on a dead context.
   */
  private handleContextLost(e: Event): void {
    e.preventDefault()
    this.contextLost = true
    this.stop()
  }

  /**
   * Context restored: THREE.WebGLRenderer re-initialises its GL state and lazily
   * re-uploads geometries/textures on the next render, so resuming the loop
   * rebuilds the frame. Skip if the tab is hidden — visibilitychange resumes it.
   */
  private handleContextRestored(): void {
    this.contextLost = false
    if (!document.hidden && this.animationId === null) {
      this.lastTime = performance.now()
      this.animate()
    }
  }

  private handleResize(): void {
    const w = window.innerWidth
    const h = window.innerHeight
    this.camera.handleResize(w, h)
    this.renderer.setSize(w, h)
  }

  // --- Public API for hosts / later phases ---

  /** Apply a town's current condition to its visuals (call after decay ticks). */
  setTownCondition(id: string, condition: number): void {
    const town = this.towns.find((t) => t.id === id)
    town?.setCondition(condition)
  }

  /** Find a town's render object by id. */
  getTown(id: string): Town | undefined {
    return this.towns.find((t) => t.id === id)
  }

  /** The input manager, so a touch overlay can drive virtual movement/look/buttons. */
  getInputManager(): InputManager {
    return this.inputManager
  }

  /**
   * Pause/resume free-roam + decay + combat (used while a UI panel is open).
   * Also flips the InputManager interactive flag so that, while paused for a
   * menu, the cursor is freed (pointer lock released) and won't be re-acquired
   * on click — letting the player interact with the overlay. On resume the
   * player must click the canvas to re-engage mouse-look (handled by
   * InputManager's mousedown), or the host may call requestPointerLock().
   */
  setPaused(paused: boolean): void {
    this.paused = paused
    this.inputManager.setInteractive(!paused)
  }

  isPaused(): boolean {
    return this.paused
  }

  /**
   * Re-acquire pointer lock on the canvas (mouse-look). Safe to call after a
   * menu closes if the host wants to auto-re-engage look without the player
   * needing to click first. No-op while a menu still suppresses input.
   */
  requestPointerLock(): void {
    if (this.inputManager.isInteractive()) {
      this.canvas.requestPointerLock()
    }
  }

  /** Whether a combat/object encounter is currently running. */
  isEncounterActive(): boolean {
    return this.combat.active
  }

  /**
   * Begin the given quest's in-world encounter anchored at its town. Returns
   * false if a town isn't found or an encounter is already active. Combat quests
   * (Hold/Sanction) are refused on foot (the combat interlock — you must be in the
   * Frame to fight, §4.3/§6); an on-foot Recovery (`hidden_object`) IS allowed
   * while dismounted — it is a decay-free walking search (§2.6/§4.2), driven from
   * the pilot's position each frame (see updateOnFoot).
   */
  startQuest(quest: QuestDef, townId: string): boolean {
    if (this._mode === 'onFoot' && quest.type !== 'hidden_object') return false
    const town = this.getTown(townId)
    if (!town) return false
    return this.combat.start(quest, town.position)
  }

  // --- On-foot / dismount (design §4) ---

  /** Current body mode. */
  getMode(): PilotMode {
    return this._mode
  }

  isOnFoot(): boolean {
    return this._mode === 'onFoot'
  }

  /** Where the Frame is parked (monument) while on foot, or null in the mech. */
  getMechParkPosition(): THREE.Vector3 | null {
    return this._mechPark ? this._mechPark.clone() : null
  }

  /**
   * Whether a dismount is currently allowed: in the mech, no encounter is running
   * (the combat interlock), and the active body is inside a town's decay radius
   * (design §4.1 — `insideTownId` is the ready trigger).
   */
  canDismount(): boolean {
    return this._mode === 'mech' && !this.combat.active && this._insideTownId !== null
  }

  /**
   * Build (once) and configure the OnFootPhysics for the given town: point it at
   * the town's pedestrian colliders + the terrain heightfield, and route its
   * footsteps into the same camera dip/shake the mech uses (scaled down inside
   * OnFootPhysics). Reused across dismounts — only the collider set changes.
   */
  private prepareOnFootPhysics(town: Town): OnFootPhysics {
    if (!this._onFootPhysics) {
      this._onFootPhysics = new OnFootPhysics()
      this._onFootPhysics.setGroundHeightProvider((x, z) => this.terrain.heightAt(x, z))
      this._onFootPhysics.onFootstep = (intensity) => this.camera.onFootstep(intensity)
    }
    this._onFootPhysics.setColliders(town.getPedestrianColliders())
    return this._onFootPhysics
  }

  /**
   * Spawn the pilot body at `spawn` facing `yaw`, add it to the scene, repoint the
   * camera onto it and play the ~0.8s god→person drop (design §4.1). Shared by
   * dismount() and restoreOnFoot().
   */
  private spawnPilot(spawn: THREE.Vector3, yaw: number, town: Town): void {
    const pilot = new OnFootEntity(spawn)
    pilot.rotation.y = yaw
    pilot.mesh.rotation.y = yaw
    this._onFootEntity = pilot
    this.prepareOnFootPhysics(town)
    this.scene.add(pilot.mesh)

    // Pointer-swap the rig onto the pilot, then fall from the cockpit view to the
    // human eye view. CameraController.target is PilotableEntity — no cast needed.
    // The drop lands (§4.1) with a small boots-hit-dirt dust puff + a soft thud
    // (a gentle shake, further scaled down by the onFoot profile's 0.25 shakeScale)
    // as the done callback fires at the end of the ~0.8s fall. restoreOnFoot()
    // cancels the transition (setProfile) so a load lands silently, not with a puff.
    this.camera.setTarget(pilot)
    this.camera.mouseRotation.x = yaw
    const feet = spawn.clone()
    this.camera.playDismountTransition('mech', 'onFoot', () => {
      this.particleSystem.spawnImpactSparks(feet, new THREE.Vector3(0, 1, 0), 'floor')
      this.camera.triggerShake(0.4)
    })

    this._mode = 'onFoot'
    this._dismountTown = town
    this._remountSecondsLeft = null
  }

  /**
   * Drop out of the cockpit (design §4.1). Parks the Frame where it stands as a
   * static monument (its mesh stays in the scene), spawns the pilot there, and
   * repoints the camera + physics onto the on-foot body. Fires onModeChange so the
   * host persists the mode + park position (which drives the §4.2 decay pause).
   * Returns false — leaving everything untouched — if a dismount isn't allowed.
   */
  dismount(): boolean {
    if (!this.canDismount()) return false
    const town = this._nearestTown
    if (!town) return false

    // Park the Frame as a monument where you left it (§4.1). Its mesh is never
    // removed from the scene, so it stays visible from anywhere in the town.
    this._mechPark = this._playerMech.position.clone()

    // Climb down a few metres out IN FRONT of the parked Frame, snapped to the
    // ground, and turn the pilot BACK to face it (§4.1): the god→person drop must
    // land looking UP at the towering machine — not out at empty street — and the
    // human must not spawn clipped inside the un-collided Frame geometry. The 4.5u
    // offset keeps the pilot well inside the 8u remount radius (canRemount stays
    // immediately true), so stepping right back in is never blocked.
    const yaw = this.camera.mouseRotation.x
    const spawn = this._playerMech.position.clone()
    spawn.x += Math.sin(yaw) * DISMOUNT_SPAWN_OFFSET
    spawn.z += Math.cos(yaw) * DISMOUNT_SPAWN_OFFSET
    spawn.y = this.terrain.heightAt(spawn.x, spawn.z)
    this.spawnPilot(spawn, yaw + Math.PI, town)
    this.emitModeChange()
    return true
  }

  /**
   * Climb back into the parked Frame (design §4.1). Disposes the pilot body,
   * repoints the camera + physics back onto the mech (still parked where you left
   * it), and plays the climb-up transition. Fires onModeChange so the host resumes
   * decay. Returns false if already mounted.
   */
  mount(): boolean {
    if (this._mode !== 'onFoot') return false

    if (this._onFootEntity) {
      this.scene.remove(this._onFootEntity.mesh)
      this._onFootEntity.dispose()
      this._onFootEntity = null
    }

    this.camera.setTarget(this._playerMech)
    this.camera.mouseRotation.x = this._playerMech.rotation.y
    this.camera.playDismountTransition('onFoot', 'mech') // the climb back up

    this._mode = 'mech'
    this._dismountTown = null
    this._remountSecondsLeft = null
    this.emitModeChange()
    return true
  }

  /**
   * Restore the on-foot body on load (design §4 persistence). The host, seeing a
   * saved run with pilotMode==='onFoot', places the Frame at its saved park spot
   * (setPlayerPosition) then calls this to re-enter the dismounted state WITHOUT
   * the inside-town / combat gating dismount() enforces. No-op if the town id is
   * unknown; returns whether it restored. Snaps the camera to the on-foot profile
   * (no drop transition — the player is loading INTO the state, not falling into it).
   */
  restoreOnFoot(townId: string): boolean {
    if (this._mode === 'onFoot') return true
    const town = this.getTown(townId)
    if (!town) return false

    this._mechPark = this._playerMech.position.clone()
    const spawn = this._playerMech.position.clone()
    spawn.y = this.terrain.heightAt(spawn.x, spawn.z)
    this.spawnPilot(spawn, this.camera.mouseRotation.x, town)
    this.camera.setProfile('onFoot') // instant — cancels the drop the spawn queued
    // No emitModeChange: we are restoring FROM the persisted state, so re-persisting
    // would be redundant.
    return true
  }

  /**
   * Signal that hostiles have appeared while the player is on foot (design §4.3
   * combat interlock). Starts the generous forced-remount countdown; the pilot is
   * auto-mounted when it expires (see updateOnFoot). The host surfaces the timer
   * via frame-info.onFoot.remountSecondsLeft. No-op in the mech.
   */
  signalHostileWhileOnFoot(): void {
    if (this._mode !== 'onFoot') return
    if (this._remountSecondsLeft === null) {
      this._remountSecondsLeft = ON_FOOT_HOSTILE_GRACE_SEC
    }
  }

  /** Route a mode flip to the host for persistence (setPilotMode). */
  private emitModeChange(): void {
    this.onModeChange?.(this._mode, {
      townId: this._dismountTown?.id ?? null,
      mechPark: this._mechPark ? [this._mechPark.x, this._mechPark.y, this._mechPark.z] : null,
    })
  }

  /** Abandon the active encounter (e.g. on teardown / give-up). */
  abortEncounter(): void {
    this.combat.abort()
  }

  /**
   * Apply a freshly-purchased loadout to the player mech (garage). Rebuilds the
   * MechEntity in place so the visuals + combat stats reflect the new parts,
   * preserving the current world position/rotation. The new combat stats are
   * computed with the same floors as the rest of Story Mode.
   */
  applyLoadout(loadout: MechLoadout, stats: CombatStats): void {
    const pos = this._playerMech.position.clone()
    const yaw = this._playerMech.rotation.y

    // MechEntity has no in-place part rebuild, so dispose the old mesh and build
    // a fresh entity at the same transform, then repoint the world + camera at
    // it. Combat/physics read this._playerMech each frame, so the swap is safe.
    this.scene.remove(this._playerMech.mesh)
    this._playerMech.cleanup()

    const rebuilt = new MechEntity(this._playerMech.id, this._playerMech.name, loadout, stats, true, pos)
    rebuilt.rotation.y = yaw
    this._playerMech = rebuilt
    // Only repoint the camera at the mech when actually driving it — a garage
    // equip happens on foot (design §4.5), where the camera must stay on the pilot.
    if (this._mode === 'mech') this.camera.target = rebuilt
    this.wirePlayerHooks(rebuilt)
    this.scene.add(rebuilt.mesh)
  }

  getElapsed(): number {
    return this.elapsed
  }

  getPlayerPosition(): THREE.Vector3 {
    return this.playerMech.position
  }

  /**
   * Reposition the player mech (snapping to terrain height) and re-anchor the
   * camera. Used by the §3.7 death-stakes flow to drop the ejected pilot's
   * recovered Frame back at the edge of the town they were defending.
   */
  setPlayerPosition(x: number, z: number): void {
    const y = this.terrain.heightAt(x, z)
    this._playerMech.position.set(x, y, z)
    this.camera.reanchor()
  }

  cleanup(): void {
    this.stop()
    window.removeEventListener('resize', this.handleResizeBound)
    document.removeEventListener('visibilitychange', this.handleVisibilityBound)
    this.canvas.removeEventListener('webglcontextlost', this.handleContextLostBound, false)
    this.canvas.removeEventListener('webglcontextrestored', this.handleContextRestoredBound, false)
    this.inputManager.cleanup()

    this.combat.cleanup()
    this.bandits.dispose()
    this.projectileSystem.cleanup()
    this.particleSystem.cleanup()
    this.gunplay.dispose()
    this.weather.dispose()

    for (const town of this.towns) town.dispose()
    this.towns = []

    this.terrain.dispose()

    if (this._onFootEntity) {
      this.scene.remove(this._onFootEntity.mesh)
      this._onFootEntity.dispose()
      this._onFootEntity = null
    }
    this._playerMech.cleanup()

    // Dispose remaining scene geometry/materials (ground, sky, lights, grid).
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose()
        if (object.material instanceof THREE.Material) {
          object.material.dispose()
        } else if (Array.isArray(object.material)) {
          object.material.forEach((m) => m.dispose())
        }
      }
    })

    this.renderer.dispose()
    // dispose() frees GPU buffers but leaves the WebGL context live; browsers cap
    // live contexts (~8-16), so re-entering Story Mode would orphan and exhaust
    // them. forceContextLoss() releases the context on teardown (documented fix).
    this.renderer.forceContextLoss()
  }
}
