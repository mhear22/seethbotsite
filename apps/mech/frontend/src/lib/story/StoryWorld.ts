import * as THREE from 'three'
import { markRaw } from 'vue'
import { MechEntity, type CombatStats } from '../battle/MechEntity'
import { CameraController } from '../battle/CameraController'
import { PhysicsSystem } from '../battle/PhysicsSystem'
import { InputManager } from '../battle/InputManager'
import { ProjectileSystem } from '../battle/ProjectileSystem'
import { ParticleSystem } from '../battle/ParticleSystem'
import { Town } from './Town'
import { Terrain } from './Terrain'
import { StoryCombat } from './StoryCombat'
import type { QuestDef } from './quests'
import type { MechLoadout } from '../../composables/useMechBuilder'
import type { GraphicsSettings } from '../../composables/useGameSettings'
import type { TownState } from '../../composables/useStoryMode'
import { TOWN_DECAY_RADIUS, WORLD_HALF_EXTENT } from '../../composables/useStoryMode'

/** XZ distance within which the E-key opens a town's quest-giver dialogue. */
export const QUEST_GIVER_RADIUS = 14

export interface StoryWorldConfig {
  canvas: HTMLCanvasElement
  /** The player mech (built from the run's loadout by the caller). */
  playerMech: MechEntity
  /** Town data from the run; used to place + initialise Town visuals. */
  towns: TownState[]
  /** Graphics quality (shadow/AA/render-scale); honours the user's settings. */
  graphics?: GraphicsSettings
  /**
   * Called once per frame with the player's current world position, the nearest
   * town, its centre distance, and the dt — so the host can drive decay/HUD.
   */
  onFrame?: (info: StoryFrameInfo) => void
  /** Fired when an active combat/object encounter completes (host pays + advances). */
  onQuestComplete?: (quest: QuestDef) => void
  /** Fired when the player mech is destroyed during an encounter. */
  onPlayerDefeated?: () => void
}

export interface StoryFrameInfo {
  deltaTime: number
  playerPosition: THREE.Vector3
  nearestTownId: string | null
  nearestTownName: string | null
  /** Centre distance (world units) to the nearest town. */
  nearestTownDistance: number
  /** Whether the player is inside the nearest town's decay radius. */
  insideTownId: string | null
  /** Town whose quest-giver the player is close enough to talk to (E), or null. */
  questGiverTownId: string | null
  /** Whether a combat/object encounter is currently running. */
  encounterActive: boolean
  /** Live progress of the active encounter (cleared/total, found/collected). */
  encounter: {
    questId: string
    cleared: number
    total: number
    found: boolean
    collected: boolean
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
  private onQuestComplete?: (quest: QuestDef) => void
  private onPlayerDefeated?: () => void

  private animationId: number | null = null
  private lastTime: number = 0
  private elapsed: number = 0
  /** Combat clock for weapon cooldown bookkeeping (mirrors BattleScene.battleTime). */
  private battleTime: number = 0
  /** Suspends decay/free-roam input while a dialogue/garage UI is open. */
  private paused: boolean = false

  private handleResizeBound: () => void
  private handleVisibilityBound: () => void

  constructor(config: StoryWorldConfig) {
    this._playerMech = config.playerMech
    this.onFrame = config.onFrame
    this.onQuestComplete = config.onQuestComplete
    this.onPlayerDefeated = config.onPlayerDefeated

    // --- Scene + renderer (mirrors BattleScene setup; honours graphics settings) ---
    const gfx = config.graphics
    this.scene = markRaw(new THREE.Scene())
    this.renderer = markRaw(new THREE.WebGLRenderer({
      canvas: config.canvas,
      antialias: gfx?.antialias ?? true,
    }))
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(window.devicePixelRatio * (gfx?.renderScale ?? 1.0))
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

    // --- Combat systems (single-player only; mirrors BattleScene) ---
    this.projectileSystem = new ProjectileSystem(this.scene)
    this.particleSystem = new ParticleSystem(this.scene)
    this.projectileSystem.onMissileSmoke = (p: THREE.Vector3) => {
      this.particleSystem.spawnImpactSparks(p, new THREE.Vector3(0, 1, 0), 'floor')
    }
    this.combat = new StoryCombat(this.scene, this.projectileSystem, this.particleSystem)
    // Encounters are local to a town; bound the AI to a generous play radius.
    this.combat.setArenaBounds(WORLD_HALF_EXTENT)
    this.combat.onShake = (amount) => this.camera.triggerShake(amount)
    this.combat.onComplete = (quest) => this.onQuestComplete?.(quest)
    this.combat.onPlayerDefeated = () => this.onPlayerDefeated?.()

    // --- World content ---
    this.setupSky()
    this.setupLighting()
    this.setupTerrain(config.towns)
    this.setupTowns(config.towns)

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
  }

  private setupSky(): void {
    // Daytime gradient sky (lighter, friendlier than the battle arena's night sky
    // — matches the playful overworld tone).
    const skyGeometry = new THREE.SphereGeometry(WORLD_HALF_EXTENT * 2.4, 32, 16)
    const skyMaterial = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {},
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec3 dir = normalize(vWorldPosition);
          float t = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);
          vec3 horizon = vec3(0.85, 0.9, 0.98);
          vec3 zenith = vec3(0.32, 0.55, 0.85);
          gl_FragColor = vec4(mix(horizon, zenith, t), 1.0);
        }
      `,
    })
    this.scene.add(new THREE.Mesh(skyGeometry, skyMaterial))

    // Distance haze: fades the far edges of the (large) map into the horizon
    // colour so the world reads as open and continuous rather than a flat slab.
    this.scene.fog = new THREE.Fog(0xc9dcef, WORLD_HALF_EXTENT * 0.75, WORLD_HALF_EXTENT * 1.95)
  }

  private setupLighting(): void {
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.6))

    const sun = new THREE.DirectionalLight(0xfff4e0, 0.9)
    sun.position.set(120, 200, 80)
    sun.castShadow = this.shadowsEnabled
    sun.shadow.camera.left = -WORLD_HALF_EXTENT
    sun.shadow.camera.right = WORLD_HALF_EXTENT
    sun.shadow.camera.top = WORLD_HALF_EXTENT
    sun.shadow.camera.bottom = -WORLD_HALF_EXTENT
    sun.shadow.camera.far = 1200
    sun.shadow.mapSize.width = this.shadowMapSize
    sun.shadow.mapSize.height = this.shadowMapSize
    this.scene.add(sun)

    this.scene.add(new THREE.HemisphereLight(0xbfe3ff, 0x4a7a3a, 0.4))
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

    this.terrain = new Terrain({ size, segments: 300, seed: 1337, pads })
    this.scene.add(this.terrain.mesh)
    this.scene.add(this.terrain.waterMesh)
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
    if (document.hidden) {
      this.animationId = null
      return
    }
    this.animationId = requestAnimationFrame(this.animate)

    const currentTime = performance.now()
    const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1)
    this.lastTime = currentTime
    this.elapsed += deltaTime
    this.battleTime += deltaTime

    this.update(deltaTime)
    this.render()
  }

  private update(deltaTime: number): void {
    const input = this.inputManager.getInputState()

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

    // Player movement (dash / move / jump) — same systems as battle.
    const dashStarted = this.physicsSystem.updateDash(this.playerMech, input, deltaTime)
    if (dashStarted) {
      this.camera.triggerShake(0.25)
      this.camera.triggerFovKick(10)
    }
    if (!this.playerMech.isDashing) {
      this.physicsSystem.updateMovement(this.playerMech, input, deltaTime)
    }
    this.physicsSystem.updateJumpJets(this.playerMech, input, deltaTime)
    this.playerMech.update(deltaTime)
    this.playerMech.updatePower(deltaTime)

    // --- Active encounter combat (firing, AI, projectiles, VFX) ---
    this.particleSystem.update(deltaTime)
    if (this.combat.active) {
      this.combat.update(
        deltaTime,
        this.playerMech,
        { left: input.shootLeft, right: input.shootRight, aimDir: this.getAimDirection() },
        this.battleTime,
      )
    }

    // Towns: animate markers + find the nearest one to the player.
    let nearest: Town | null = null
    let nearestDistSq = Infinity
    for (const town of this.towns) {
      town.update(this.elapsed)
      const dSq = town.distanceSqTo(this.playerMech.position)
      if (dSq < nearestDistSq) {
        nearestDistSq = dSq
        nearest = town
      }
    }

    const insideRadius = nearest !== null && nearestDistSq <= TOWN_DECAY_RADIUS * TOWN_DECAY_RADIUS
    const questGiverInRange = nearest !== null && nearestDistSq <= QUEST_GIVER_RADIUS * QUEST_GIVER_RADIUS

    const prog = this.combat.active ? this.combat.getProgress() : null
    const activeQuest = this.combat.activeQuest

    this.onFrame?.({
      deltaTime,
      playerPosition: this.playerMech.position,
      nearestTownId: nearest?.id ?? null,
      nearestTownName: nearest?.name ?? null,
      nearestTownDistance: nearest ? Math.sqrt(nearestDistSq) : Infinity,
      insideTownId: insideRadius ? nearest!.id : null,
      questGiverTownId: questGiverInRange ? nearest!.id : null,
      encounterActive: this.combat.active,
      encounter: prog && activeQuest ? {
        questId: activeQuest.id,
        cleared: prog.cleared,
        total: prog.total,
        found: prog.found,
        collected: prog.collected,
      } : null,
    })
  }

  /** World-space aim direction from the camera's yaw/pitch (matches BattleScene). */
  private getAimDirection(): THREE.Vector3 {
    const yaw = this.camera.mouseRotation.x
    const pitch = this.camera.mouseRotation.y
    return new THREE.Vector3(
      Math.sin(yaw) * Math.cos(pitch),
      Math.sin(pitch),
      Math.cos(yaw) * Math.cos(pitch),
    ).normalize()
  }

  private render(): void {
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
    } else if (this.animationId === null) {
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

  /** Pause/resume free-roam + decay + combat (used while a UI panel is open). */
  setPaused(paused: boolean): void {
    this.paused = paused
  }

  isPaused(): boolean {
    return this.paused
  }

  /** Whether a combat/object encounter is currently running. */
  isEncounterActive(): boolean {
    return this.combat.active
  }

  /**
   * Begin the given quest's in-world encounter anchored at its town. Returns
   * false if a town isn't found or an encounter is already active.
   */
  startQuest(quest: QuestDef, townId: string): boolean {
    const town = this.getTown(townId)
    if (!town) return false
    return this.combat.start(quest, town.position)
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
    this.camera.target = rebuilt
    this.scene.add(rebuilt.mesh)
  }

  getElapsed(): number {
    return this.elapsed
  }

  getPlayerPosition(): THREE.Vector3 {
    return this.playerMech.position
  }

  cleanup(): void {
    this.stop()
    window.removeEventListener('resize', this.handleResizeBound)
    document.removeEventListener('visibilitychange', this.handleVisibilityBound)
    this.inputManager.cleanup()

    this.combat.cleanup()
    this.projectileSystem.cleanup()
    this.particleSystem.cleanup()

    for (const town of this.towns) town.dispose()
    this.towns = []

    this.terrain.dispose()

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
  }
}
