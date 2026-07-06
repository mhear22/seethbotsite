import * as THREE from 'three'
import { MechEntity } from './MechEntity'
import { ProjectileSystem } from './ProjectileSystem'
import { CameraController } from './CameraController'
import { PhysicsSystem } from './PhysicsSystem'
import { InputManager, type InputState } from './InputManager'
import { ParticleSystem } from './ParticleSystem'
import { EnemyAI } from './EnemyAI'
import { weaponProjectileSpeed } from './enemyGeneration'
import { MapRenderer } from './MapRenderer'
import { applyWindowShaders, updateWindowShaders } from './WindowShader'
import { createDamageShaderPass, decayDamageIntensity } from './DamageShader'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import type { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'
import { markRaw } from 'vue'
import { useAudio } from '../../composables/useAudio'
import { getMapById } from '@shared/maps'
import type { MapDefinition } from '@shared/types/MapDefinition'
import type { GraphicsSettings, AIDifficulty } from '../../composables/useGameSettings'

export interface BattleSceneConfig {
  canvas: HTMLCanvasElement
  playerMech: MechEntity
  enemyMech: MechEntity
  onBattleEnd: (result: 'victory' | 'defeat') => void
  onDamageDealt: (amount: number) => void
  /** Fired when the PLAYER lands a shot on the enemy (single-player only). */
  onPlayerHitConfirm?: (info: { kill: boolean; crit: boolean }) => void
  /** Fired with screen-space position + amount for floating damage numbers (single-player only). */
  onPlayerDamageNumber?: (info: { amount: number; crit: boolean; screenX: number; screenY: number }) => void
  mouseSensitivity?: number
  movementSpeed?: number
  invertMouseX?: boolean
  invertMouseY?: boolean
  mapId?: string
  graphics?: GraphicsSettings
  /** AI behaviour tier (single-player only). Defaults to 'medium'. */
  aiDifficulty?: AIDifficulty
  keyBindings?: {
    forward: string
    backward: string
    left: string
    right: string
    jump: string
    dash: string
  }
}

export interface Building {
  mesh: THREE.Mesh
  position: THREE.Vector3
  width: number
  height: number
  depth: number
}

/**
 * Per-enemy bundle for the single-player arena: the mech, its own AI brain, and
 * its weapon cooldown. The arena was hardwired 1v1 (a scalar `enemyMech`); this
 * array generalizes it to player-vs-squad (each enemy targets the one player —
 * exactly the shape EnemyAI.update already supports). `enemyMech` is retained as
 * the "focus" enemy (nearest living, or the last one during the death anim) for
 * targeting, radar, and MultiplayerBattleScene, which overrides update() and
 * drives its single opponent through the `enemyMech` field directly.
 */
interface SceneEnemy {
  mech: MechEntity
  ai: EnemyAI
  lastShot: number
}

export interface TargetingState {
  isTargeted: boolean
  screenX: number      // pixels from left edge
  screenY: number      // pixels from top edge
  screenWidth: number  // pixels
  screenHeight: number // pixels
}

export class BattleScene {
  protected scene: THREE.Scene
  protected renderer: THREE.WebGLRenderer
  protected camera: CameraController
  protected inputManager: InputManager
  protected physicsSystem: PhysicsSystem
  protected projectileSystem: ProjectileSystem
  protected particleSystem!: ParticleSystem
  protected enemyAI!: EnemyAI
  protected audio: ReturnType<typeof useAudio>

  playerMech: MechEntity
  /** Focus enemy (nearest living / last-killed). See SceneEnemy doc. */
  enemyMech: MechEntity
  /** Single-player squad. Empty during MP (which uses enemyMech directly). */
  protected enemies: SceneEnemy[] = []
  private buildings: Building[] = []
  protected mapRenderer: MapRenderer | null = null
  protected mapDef: MapDefinition | null = null
  private windowShaderMaterials: THREE.ShaderMaterial[] = []

  // Post-processing
  private composer: EffectComposer | null = null
  private damagePass: ShaderPass | null = null
  private bloomPass: UnrealBloomPass | null = null
  private damageIntensity: number = 0

  // Graphics settings (kept for resize/bloom decisions)
  private graphics?: GraphicsSettings

  // Hitstop: when > 0, dt is scaled toward zero for a brief impact freeze.
  private hitstopTimer: number = 0

  protected targetingState: TargetingState = {
    isTargeted: false,
    screenX: 0,
    screenY: 0,
    screenWidth: 0,
    screenHeight: 0
  }

  private animationId: number | null = null
  private lastTime: number = 0
  private battleTime: number = 0
  private handleResizeBound: () => void
  private handleVisibilityBound: () => void

  // FPS tracking
  private fpsFrameTimes: number[] = []
  private currentFPS: number = 0

  // Graphics config
  protected _shadowMapSize: number = 1024
  protected onBattleEnd: (result: 'victory' | 'defeat') => void
  private onDamageDealt: (amount: number) => void
  private onPlayerHitConfirm?: (info: { kill: boolean; crit: boolean }) => void
  private onPlayerDamageNumber?: (info: { amount: number; crit: boolean; screenX: number; screenY: number }) => void

  // Dual weapon cooldowns
  private lastLeftArmShot: number = 0
  private lastRightArmShot: number = 0
  // Rising-edge latch for the rack-ability key: fire once per press, never every
  // frame it is held (holding a key must not re-trigger on each cooldown expiry).
  private rackAbilityHeld = false

  // Battle ending animation
  protected battleEnding: boolean = false
  protected battleEndTimer: number = 0
  protected battleEndResult: 'victory' | 'defeat' = 'victory'

  constructor(config: BattleSceneConfig) {
    this.playerMech = config.playerMech
    this.enemyMech = config.enemyMech
    this.onBattleEnd = config.onBattleEnd
    this.onDamageDealt = config.onDamageDealt
    this.onPlayerHitConfirm = config.onPlayerHitConfirm
    this.onPlayerDamageNumber = config.onPlayerDamageNumber
    this.graphics = config.graphics

    // Initialize Three.js scene
    this.scene = markRaw(new THREE.Scene())

    // Initialize renderer
    const gfx = config.graphics
    this.renderer = markRaw(new THREE.WebGLRenderer({
      canvas: config.canvas,
      antialias: gfx?.antialias ?? true
    }))
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(window.devicePixelRatio * (gfx?.renderScale ?? 1.0))
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.0

    // Set up environment map for PBR material ambient lighting
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer)
    pmremGenerator.compileEquirectangularShader()
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture
    pmremGenerator.dispose()

    // Apply shadow quality
    const shadowQuality = gfx?.shadowQuality ?? 'medium'
    if (shadowQuality === 'off') {
      this.renderer.shadowMap.enabled = false
    } else {
      this.renderer.shadowMap.enabled = true
      const shadowMapSizes: Record<string, number> = { low: 512, medium: 1024, high: 2048 }
      this._shadowMapSize = shadowMapSizes[shadowQuality] ?? 1024
    }

    // Initialize systems
    this.inputManager = new InputManager(config.canvas, config.keyBindings)
    this.physicsSystem = new PhysicsSystem()
    this.projectileSystem = new ProjectileSystem(this.scene)
    this.particleSystem = new ParticleSystem(this.scene)
    // Wire missile smoke trails to a tiny grey rising spark puff. Safe no-op if
    // never called; ParticleSystem has no dedicated smoke helper so we reuse the
    // low-intensity impact spark with an upward bias.
    this.projectileSystem.onMissileSmoke = (p: THREE.Vector3) => {
      this.particleSystem.spawnImpactSparks(p, new THREE.Vector3(0, 1, 0), 'floor')
    }
    this.camera = new CameraController(this.playerMech)
    this.enemyAI = new EnemyAI(config.aiDifficulty ?? 'medium')
    // Seed the squad with the initial enemy (1v1 by default; the arena can grow
    // it via addEnemy). MultiplayerBattleScene ignores this array — it overrides
    // update() and drives its opponent through the enemyMech field.
    this.enemies = [{ mech: this.enemyMech, ai: this.enemyAI, lastShot: 0 }]
    this.audio = useAudio()

    // Footfall / landing weight (design §3.1): PhysicsSystem detects strides and
    // ground slams; route the weight-scaled intensity into the camera dip/shake.
    // Inherited by MultiplayerBattleScene (same physics + camera instances).
    this.physicsSystem.onFootstep = (intensity) => this.camera.onFootstep(intensity)
    this.physicsSystem.onLanding = (intensity) => {
      this.camera.onLanding(intensity)
      // Fall-velocity × weight dust ring on landing (design §3.1 item 4).
      const p = this.playerMech.position.clone()
      this.particleSystem.spawnImpactSparks(p, new THREE.Vector3(0, 1, 0), 'floor')
    }
    // Smoke rack ability deploys a cloud + arms the EnemyAI accuracy debuff.
    this.playerMech.onSmokeDeploy = (pos) => this.particleSystem.spawnSmokeScreen(pos)

    // Apply settings
    if (config.mouseSensitivity !== undefined) {
      this.camera.sensitivityMultiplier = config.mouseSensitivity
    }
    if (config.movementSpeed !== undefined) {
      this.physicsSystem.speedMultiplier = config.movementSpeed
    }
    if (config.invertMouseX !== undefined) {
      this.camera.invertMouseX = config.invertMouseX
    }
    if (config.invertMouseY !== undefined) {
      this.camera.invertMouseY = config.invertMouseY
    }

    // Setup scene - use MapRenderer if mapId provided, otherwise default setup
    if (config.mapId) {
      const mapDef = getMapById(config.mapId)
      if (mapDef) {
        this.mapDef = mapDef
        this.mapRenderer = new MapRenderer(this.scene, this.renderer)
        this.buildings = this.mapRenderer.loadMap(mapDef)
        // Update physics bounds to match map
        this.physicsSystem.setArenaBounds(mapDef.arena.width, mapDef.arena.depth)
        this.enemyAI.setArenaBounds(mapDef.arena.width / 2, mapDef.arena.depth / 2)
        // Apply window shaders if map has windows (Space Colony)
        const windowMeshes = this.mapRenderer.getWindowMeshes()
        if (windowMeshes.length > 0) {
          this.windowShaderMaterials = applyWindowShaders(windowMeshes)
        }
      } else {
        console.warn(`[BattleScene] Map '${config.mapId}' not found, using default`)
        this.setupDefaultArena()
      }
    } else {
      this.setupDefaultArena()
    }
    // Post-processing composer (used when map has no lensing)
    this.composer = markRaw(new EffectComposer(this.renderer))
    this.composer.addPass(new RenderPass(this.scene, this.camera.camera))

    // Bloom — gated behind graphics quality (skip when shadows are off = "low
    // end" profile). Threshold high so only bright VFX (muzzle flash, energy
    // bolts, explosions) bloom; modest strength to avoid washing the scene out.
    // NOTE: lensing maps render through their own pipeline (renderWithLensing)
    // which bypasses this composer, so bloom is not applied on those maps.
    if ((gfx?.shadowQuality ?? 'medium') !== 'off') {
      this.bloomPass = markRaw(new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.6,   // strength (modest)
        0.4,   // radius
        0.85,  // threshold
      ))
      this.composer.addPass(this.bloomPass)
    }

    this.damagePass = markRaw(createDamageShaderPass())
    this.damagePass.renderToScreen = true
    this.composer.addPass(this.damagePass)

    this.addMechsToScene()

    // Handle window resize
    this.handleResizeBound = () => this.handleResize()
    window.addEventListener('resize', this.handleResizeBound)

    // Pause rendering work while the tab is hidden (also clamps the dt spike on
    // return so the sim doesn't fast-forward).
    this.handleVisibilityBound = () => this.handleVisibilityChange()
    document.addEventListener('visibilitychange', this.handleVisibilityBound)
  }

  private setupDefaultArena() {
    this.setupSky()
    this.setupLighting()
    this.setupArena()
  }

  private setupSky() {
    const skyGeometry = new THREE.SphereGeometry(800, 32, 16)
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

        // Simple hash for star placement
        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }

        void main() {
          vec3 dir = normalize(vWorldPosition);
          float elevation = dir.y; // -1 (bottom) to 1 (top)

          // Zenith color (dark sky)
          vec3 zenith = vec3(0.039, 0.039, 0.102); // #0a0a1a

          // Horizon glow: magenta -> cyan gradient
          vec3 magenta = vec3(1.0, 0.0, 1.0);  // #ff00ff
          vec3 cyan = vec3(0.0, 1.0, 1.0);      // #00ffff

          // Horizon band: strongest at elevation ~0, fading by |elevation| > 0.15
          float horizonBand = smoothstep(0.2, 0.0, abs(elevation));
          // Blend magenta to cyan across the horizontal angle
          float angle = atan(dir.x, dir.z) * 0.5 + 0.5;
          vec3 horizonColor = mix(magenta, cyan, angle);

          // Base sky: interpolate zenith down to darker near bottom
          vec3 skyColor = mix(zenith * 0.5, zenith, smoothstep(-0.3, 0.3, elevation));

          // Add horizon glow
          skyColor = mix(skyColor, horizonColor, horizonBand * 0.6);

          // Procedural stars in upper hemisphere
          if (elevation > 0.05) {
            vec2 starUV = dir.xz / (elevation + 0.001) * 20.0;
            float starVal = hash(floor(starUV));
            float starBright = step(0.985, starVal);
            // Twinkle based on slightly shifted UV
            float twinkle = hash(floor(starUV) + vec2(0.5));
            starBright *= (0.6 + 0.4 * twinkle);
            skyColor += vec3(starBright) * smoothstep(0.05, 0.3, elevation);
          }

          gl_FragColor = vec4(skyColor, 1.0);
        }
      `
    })
    const sky = new THREE.Mesh(skyGeometry, skyMaterial)
    this.scene.add(sky)
  }

  private setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    this.scene.add(ambientLight)

    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(50, 80, 50)
    directionalLight.castShadow = true
    directionalLight.shadow.camera.left = -200
    directionalLight.shadow.camera.right = 200
    directionalLight.shadow.camera.top = 200
    directionalLight.shadow.camera.bottom = -200
    directionalLight.shadow.mapSize.width = this._shadowMapSize
    directionalLight.shadow.mapSize.height = this._shadowMapSize
    this.scene.add(directionalLight)

    // Hemisphere light for better ambient
    const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x2d3748, 0.3)
    this.scene.add(hemiLight)
  }

  private setupArena() {
    // Floor
    const floorGeometry = new THREE.PlaneGeometry(300, 300)
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x2d3748,
      roughness: 0.8,
      metalness: 0.2
    })
    const floor = new THREE.Mesh(floorGeometry, floorMaterial)
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    this.scene.add(floor)

    // Grid helper
    const gridHelper = new THREE.GridHelper(300, 150, 0x4a5568, 0x374151)
    gridHelper.position.y = 0.01
    this.scene.add(gridHelper)

    // Arena boundaries (visual walls)
    const wallHeight = 10
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      transparent: true,
      opacity: 0.3
    })

    const createWall = (width: number, height: number, depth: number, x: number, z: number) => {
      const geometry = new THREE.BoxGeometry(width, height, depth)
      const wall = new THREE.Mesh(geometry, wallMaterial)
      wall.position.set(x, height / 2, z)
      this.scene.add(wall)
    }

    // Four walls
    createWall(300, wallHeight, 0.5, 0, -150) // North
    createWall(300, wallHeight, 0.5, 0, 150)  // South
    createWall(0.5, wallHeight, 300, -150, 0) // West
    createWall(0.5, wallHeight, 300, 150, 0)  // East

    // Add buildings as obstacles
    this.addBuildings()
  }

  private addBuildings() {
    const buildingMaterial = new THREE.MeshStandardMaterial({
      color: 0x3b4252,
      roughness: 0.9,
      metalness: 0.1
    })

    const createBuilding = (width: number, height: number, depth: number, x: number, z: number) => {
      const geometry = new THREE.BoxGeometry(width, height, depth)
      const building = new THREE.Mesh(geometry, buildingMaterial)
      building.position.set(x, height / 2, z)
      building.castShadow = true
      building.receiveShadow = true
      this.scene.add(building)

      // Add accent lines
      const edgeGeometry = new THREE.EdgesGeometry(geometry)
      const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x5e81ac })
      const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial)
      building.add(edges)

      // Store building data for collision detection
      this.buildings.push({
        mesh: building,
        position: new THREE.Vector3(x, height / 2, z),
        width,
        height,
        depth
      })
    }

    // Strategic building placement - scattered throughout arena
    // Keep center area relatively clear for spawning

    // Cluster 1: Northwest
    createBuilding(12, 8, 12, -80, -80)
    createBuilding(8, 12, 8, -65, -95)
    createBuilding(10, 6, 10, -100, -70)

    // Cluster 2: Northeast
    createBuilding(15, 10, 15, 75, -85)
    createBuilding(8, 14, 8, 90, -70)
    createBuilding(10, 7, 10, 85, -105)

    // Cluster 3: Southwest
    createBuilding(10, 9, 10, -90, 80)
    createBuilding(12, 11, 12, -70, 95)
    createBuilding(8, 6, 8, -105, 90)

    // Cluster 4: Southeast
    createBuilding(14, 8, 14, 80, 75)
    createBuilding(9, 13, 9, 95, 90)
    createBuilding(11, 7, 11, 70, 100)

    // Mid-range buildings (ring around center)
    createBuilding(8, 10, 8, -50, 0)
    createBuilding(8, 10, 8, 50, 0)
    createBuilding(8, 10, 8, 0, -50)
    createBuilding(8, 10, 8, 0, 50)

    // Corner pillars
    createBuilding(6, 15, 6, -120, -120)
    createBuilding(6, 15, 6, 120, -120)
    createBuilding(6, 15, 6, -120, 120)
    createBuilding(6, 15, 6, 120, 120)

    // Additional scattered obstacles
    createBuilding(7, 5, 7, -30, -70)
    createBuilding(7, 5, 7, 30, 70)
    createBuilding(7, 5, 7, -70, 30)
    createBuilding(7, 5, 7, 70, -30)
  }

  private addMechsToScene() {
    this.scene.add(this.playerMech.mesh)
    this.wireSlotFeedback(this.playerMech)
    // Add every enemy in the squad. For MP / classic 1v1 this is just the one
    // opponent; the focus enemyMech is always among them at construction.
    for (const e of this.enemies) {
      this.scene.add(e.mech.mesh)
      this.wireSlotFeedback(e.mech)
    }
  }

  /**
   * Slot-destruction feedback (design §3.3): when a limb is shot off, punch a
   * small explosion at the limb, shake the camera, and add a beat of hitstop so
   * delimbing reads as a distinct impact from a plain hit. Harmless for MP —
   * server-authoritative damage never passes a slot, so this never fires there.
   */
  protected wireSlotFeedback(mech: MechEntity): void {
    mech.onSlotDestroyed = (m, slot) => {
      this.particleSystem.spawnExplosion(m.getSlotPosition(slot), 1.2)
      this.camera.triggerShake(0.5)
      this.hitstopTimer = Math.max(this.hitstopTimer, 0.08)
    }
  }

  /**
   * Nearest living squad enemy to the player — the "focus" used for targeting,
   * player auto-aim/homing, and radar. Null only when the squad is wiped.
   */
  protected nearestEnemy(): SceneEnemy | null {
    let best: SceneEnemy | null = null
    let bestSq = Infinity
    for (const e of this.enemies) {
      if (e.mech.isDestroyed) continue
      const d = e.mech.position.distanceToSquared(this.playerMech.position)
      if (d < bestSq) {
        bestSq = d
        best = e
      }
    }
    return best
  }

  /**
   * Add another enemy to the single-player squad mid-scene (combined-arms /
   * wave reinforcement seam). Each gets its own AI brain so it flanks
   * independently. No-op shape for MP (which never calls this).
   */
  addEnemy(mech: MechEntity, difficulty?: AIDifficulty): void {
    const ai = new EnemyAI(difficulty ?? 'medium')
    if (this.mapDef) ai.setArenaBounds(this.mapDef.arena.width / 2, this.mapDef.arena.depth / 2)
    this.enemies.push({ mech, ai, lastShot: 0 })
    this.scene.add(mech.mesh)
    this.wireSlotFeedback(mech)
  }

  private handleResize() {
    const w = window.innerWidth
    const h = window.innerHeight
    this.camera.handleResize(w, h)
    this.renderer.setSize(w, h)
    this.composer?.setSize(w, h)
    this.bloomPass?.setSize(w, h)
    // Resize the gravitational-lensing offscreen target so it tracks the canvas.
    this.mapRenderer?.resize(w, h)
  }

  private handleVisibilityChange() {
    if (document.hidden) {
      // Stop the rAF loop entirely while hidden.
      this.stop()
    } else if (this.animationId === null) {
      // Resume; reset lastTime so the first frame after returning has a small dt
      // (the animate loop also clamps, but this avoids a big jump).
      this.lastTime = performance.now()
      this.animate()
    }
  }

  start() {
    this.lastTime = performance.now()
    this.animate()
  }

  /** The input manager, so a touch overlay can drive virtual movement/look/buttons. */
  getInputManager(): InputManager {
    return this.inputManager
  }

  private animate = () => {
    // Don't queue further frames while the tab is hidden (visibilitychange will
    // resume). Guards against any stray rAF that fires during the hidden window.
    if (document.hidden) {
      this.animationId = null
      return
    }
    this.animationId = requestAnimationFrame(this.animate)

    const currentTime = performance.now()
    let deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1) // Cap at 100ms
    this.lastTime = currentTime

    // Hitstop: scale dt toward zero for a brief impact freeze on kills.
    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= deltaTime
      deltaTime *= 0.15
    }

    this.battleTime += deltaTime

    // Track FPS using a rolling 60-frame window
    this.fpsFrameTimes.push(currentTime)
    if (this.fpsFrameTimes.length > 60) {
      this.fpsFrameTimes.shift()
    }
    if (this.fpsFrameTimes.length >= 2) {
      const elapsed = (currentTime - this.fpsFrameTimes[0]) / 1000
      this.currentFPS = Math.round((this.fpsFrameTimes.length - 1) / elapsed)
    }

    this.update(deltaTime)
    this.render()
  }

  protected update(deltaTime: number) {
    // Update map dynamic elements, hazard visuals, and window shaders
    if (this.mapRenderer) {
      this.mapRenderer.updateDynamicElements(this.battleTime, this.camera.camera)
      this.mapRenderer.updateHazardVisuals(this.battleTime)
    }
    if (this.windowShaderMaterials.length > 0) {
      updateWindowShaders(this.windowShaderMaterials, this.battleTime)
    }

    // Decay damage shader intensity
    if (this.damagePass && this.damageIntensity > 0) {
      this.damageIntensity = decayDamageIntensity(this.damageIntensity, deltaTime)
      this.damagePass.uniforms.intensity.value = this.damageIntensity
      this.damagePass.uniforms.time.value = this.battleTime
    }

    // Update particles every frame (even during battle ending)
    this.particleSystem.update(deltaTime)

    // If battle is ending, play destruction animation then stop
    if (this.battleEnding) {
      this.battleEndTimer -= deltaTime
      const defeated = this.battleEndResult === 'victory' ? this.enemyMech : this.playerMech
      defeated.playDestroyAnimation(deltaTime)

      // Still update camera during ending
      const input = this.inputManager.getInputState()
      this.camera.update(deltaTime, input.mouseX, input.mouseY)
      this.inputManager.resetMouseMovement()

      if (this.battleEndTimer <= 0) {
        this.onBattleEnd(this.battleEndResult)
        this.stop()
      }
      return
    }

    const input = this.inputManager.getInputState()

    // Camera first: sets the mech's yaw from the mouse before movement, the mesh
    // sync, and aim — so the body tracks the camera with no one-frame trail and
    // movement/aim are camera-relative on the same frame.
    this.camera.update(deltaTime, input.mouseX, input.mouseY)
    this.inputManager.resetMouseMovement()

    // Update player mech
    const dashStarted = this.physicsSystem.updateDash(this.playerMech, input, deltaTime)
    if (dashStarted) {
      this.camera.triggerShake(0.25)
      // Dash juice: FOV kick, directional thruster trail, whoosh SFX.
      this.camera.triggerFovKick(10)
      const dashDir = this.playerMech.velocity.lengthSq() > 0.001
        ? this.playerMech.velocity.clone().normalize()
        : this.playerMech.getForwardDirection()
      this.particleSystem.spawnDashBurst(this.playerMech.position.clone().setY(this.playerMech.position.y + 1.5), dashDir)
      this.audio.playThruster()
    }
    if (!this.playerMech.isDashing) {
      const counterBoost = this.physicsSystem.updateMovement(this.playerMech, input, deltaTime)
      if (counterBoost) {
        this.camera.triggerShake(0.5)
      }
    }
    this.physicsSystem.updateJumpJets(this.playerMech, input, deltaTime)
    this.checkMechBuildingCollisions(this.playerMech)
    this.playerMech.update(deltaTime)

    // Update power regeneration
    this.playerMech.updatePower(deltaTime)

    // Update rack ability cooldown
    this.playerMech.rackAbilityCooldown = Math.max(0, this.playerMech.rackAbilityCooldown - deltaTime)

    // Handle rack ability input (Q) — edge-triggered and distinct from boost (E),
    // so sprinting never auto-wastes the rack ability the moment it comes off CD.
    if (input.useRackAbility && !this.rackAbilityHeld) {
      this.playerMech.useRackAbility()
    }
    this.rackAbilityHeld = input.useRackAbility

    // Focus the nearest living squad enemy. enemyMech tracks it so the shared
    // targeting / radar / aim code (and MultiplayerBattleScene) is unchanged.
    const focus = this.nearestEnemy()
    if (focus) this.enemyMech = focus.mech

    // Dual weapon firing with separate cooldowns
    // When locked, compute per-arm aim from each arm's spawn position to target center
    const targetPoint = this.targetingState.isTargeted
      ? this.enemyMech.getCorePosition()
      : null

    const getAimDirection = (arm: 'left' | 'right'): THREE.Vector3 => {
      if (!targetPoint) {
        return this.playerMech.getForwardDirection()
      }
      const armSpawn = this.playerMech.getArmPosition(arm)
      const dir = targetPoint.clone().sub(armSpawn).normalize()
      // Slight spread
      const spread = 0.02
      dir.x += (Math.random() - 0.5) * spread
      dir.y += (Math.random() - 0.5) * spread
      dir.z += (Math.random() - 0.5) * spread
      return dir.normalize()
    }

    // Determine fire rate (affected by melee weapons and rack abilities)
    const leftWeaponType = this.playerMech.loadout.leftArm?.weaponType
    const rightWeaponType = this.playerMech.loadout.rightArm?.weaponType

    // Check for custom fire rates on weapons, fall back to defaults
    const leftWeapon = this.playerMech.loadout.leftArm
    const rightWeapon = this.playerMech.loadout.rightArm

    let leftFireRate = leftWeapon?.fireRate ?? (leftWeaponType === 'melee' ? 1.5 : 0.25)
    let rightFireRate = rightWeapon?.fireRate ?? (rightWeaponType === 'melee' ? 1.5 : 0.25)

    // Ammo feed rack ability: 2x fire rate
    if (this.playerMech.rackAbilityActive && this.playerMech.loadout.rack?.id === 'rack-ammo-feed') {
      leftFireRate *= 0.5
      rightFireRate *= 0.5
    }

    // Cannot fire while boosting (design §3.1): the thrust pool and the trigger
    // compete for the same reactor draw.
    const canFire = !this.playerMech.isBoosting

    // Left arm (right mouse button)
    if (canFire && input.shootLeft && this.battleTime - this.lastLeftArmShot > leftFireRate) {
      if (this.playerMech.loadout.leftArm) {
        const aim = getAimDirection('left')
        const fired = this.projectileSystem.fireWeapon(this.playerMech, aim, 'left', this.enemyMech)
        if (fired) {
          this.onPlayerFire('left', aim)
          this.lastLeftArmShot = this.battleTime
        }
      }
    }

    // Right arm (left mouse button)
    if (canFire && input.shootRight && this.battleTime - this.lastRightArmShot > rightFireRate) {
      if (this.playerMech.loadout.rightArm) {
        const aim = getAimDirection('right')
        const fired = this.projectileSystem.fireWeapon(this.playerMech, aim, 'right', this.enemyMech)
        if (fired) {
          this.onPlayerFire('right', aim)
          this.lastRightArmShot = this.battleTime
        }
      }
    }

    // Feed the AI the player's in-flight projectiles so it can dodge incoming
    // fire (single-player only; multiplayer uses MultiplayerBattleScene).
    const incomingThreats = this.projectileSystem.getProjectiles()
      .filter((p) => p.ownerId === this.playerMech.id)
      .map((p) => ({ position: p.position, velocity: p.velocity }))

    // Update each squad enemy with its own AI brain (player-vs-squad: every
    // enemy targets the single player mech).
    for (const e of this.enemies) {
      if (e.mech.isDestroyed) continue
      e.ai.feedThreats(incomingThreats)
      const shouldEnemyFire = e.ai.update(e.mech, this.playerMech, deltaTime)
      e.mech.updatePower(deltaTime)

      if (shouldEnemyFire) {
        // Fire from a live weapon arm (design §3.3): defanging the enemy's right
        // gun arm makes it fall back to the left; both gone = it can't fire.
        const fireArm = e.mech.liveWeaponArm()
        if (fireArm) {
          // Aim at a leading intercept point with an aim-error cone scaled by the
          // difficulty's aimSkill, so the accuracy stat actually affects aim.
          const armPart = e.mech.loadout[fireArm === 'left' ? 'leftArm' : 'rightArm']
          const projSpeed = weaponProjectileSpeed(armPart?.weaponType)
          const aimPoint = e.ai.computeAimPoint(e.mech, this.playerMech, projSpeed)
          const enemyAimDirection = aimPoint
            .sub(e.mech.getArmPosition(fireArm))
            .normalize()
          this.projectileSystem.fireWeapon(e.mech, enemyAimDirection, fireArm, this.playerMech)
        }
      }

      this.checkMechBuildingCollisions(e.mech)
      e.mech.update(deltaTime)
    }

    // Update projectiles + resolve collisions against the player and all enemies.
    const allMechs = [this.playerMech, ...this.enemies.map((e) => e.mech)]
    this.projectileSystem.update(deltaTime, allMechs)

    // Check projectile-building collisions
    this.checkProjectileBuildingCollisions()

    // Check projectile collisions
    const hits = this.projectileSystem.checkCollisions(allMechs)

    for (const hit of hits) {
      const damage = hit.projectile.damage
      const defeated = hit.target.takeDamage(damage, hit.projectile.damageType, {
        armorPierce: hit.projectile.armorPierce,
        burn: hit.projectile.appliesBurn,
        fromFront: hit.target.isHitFromFront(hit.projectile.velocity),
        slot: hit.slot,
      })
      // Player landed the hit iff its projectile is the player's (robust for
      // squads — the target may be any enemy, not just the focus).
      const isPlayerShot = hit.projectile.ownerId === this.playerMech.id && hit.target !== this.playerMech
      // Heuristic crit: high-damage hits (melee / heavy weapons) read as crits.
      const crit = damage >= 15

      // Calculate impact position at the target's center (more visible)
      const impactPosition = hit.target.position.clone()
      impactPosition.y += 1.5 // Spawn at torso height for better visibility

      // Spawn hit particles at impact point
      this.particleSystem.spawnHitEffect(
        impactPosition,
        hit.projectile.type
      )
      // Directional impact sparks off the mech surface (incoming bolt direction).
      this.particleSystem.spawnImpactSparks(
        impactPosition,
        hit.projectile.velocity.clone().normalize(),
        'mech',
      )

      // Track damage dealt by player + fire hit-confirm/damage-number feedback.
      if (isPlayerShot) {
        this.onDamageDealt(damage)

        // Hit-confirm marker + tink audio.
        this.onPlayerHitConfirm?.({ kill: defeated, crit })
        this.audio.playHitConfirm(crit || defeated)

        // Floating damage number projected to screen space.
        if (this.onPlayerDamageNumber) {
          const screen = impactPosition.clone().project(this.camera.camera)
          if (screen.z <= 1) {
            this.onPlayerDamageNumber({
              amount: damage,
              crit,
              screenX: (screen.x + 1) / 2 * window.innerWidth,
              screenY: (-screen.y + 1) / 2 * window.innerHeight,
            })
          }
        }

        // Screenshake scaled by damage (player landing the hit).
        this.camera.triggerShake(Math.min(0.5, 0.12 + damage * 0.012))
      }

      // Screen shake + pixel sort shader when player takes damage
      if (hit.target === this.playerMech) {
        this.camera.triggerShake(0.4)
        this.triggerDamageEffect(1.0)
      }

      this.projectileSystem.removeProjectile(hit.projectile)

      // Mark the kill + play the impact explosion. Enemy kills are reconciled
      // after the loop (win only when the whole squad is cleared) so a squad
      // fight never ends on the first kill; a player death ends immediately.
      if (defeated) {
        // Bigger explosion for kills (per VFX agent guidance: scale 1.5-2).
        this.particleSystem.spawnExplosion(hit.target.position.clone(), 1.8)
        this.camera.triggerShake(1.0)
        // Brief hitstop when the PLAYER scores the kill.
        if (isPlayerShot) {
          this.hitstopTimer = 0.12
        }
        hit.target.isDestroyed = true
        if (hit.target === this.playerMech) {
          this.battleEnding = true
          this.battleEndTimer = 2.0
          this.battleEndResult = 'defeat'
        }
      }
    }

    // Burn DoT (flamer) chips currentHealth in MechEntity.update() outside the
    // projectile-hit path; register burn-only enemy deaths here (design §3.2
    // flamer identity) so a mech that burns out doesn't linger.
    if (!this.battleEnding) {
      for (const e of this.enemies) {
        if (!e.mech.isDestroyed && e.mech.stats.currentHealth <= 0) {
          e.mech.isDestroyed = true
          this.particleSystem.spawnExplosion(e.mech.position.clone(), 1.8)
          this.camera.triggerShake(1.0)
        }
      }
    }

    // Reconcile enemy deaths → win condition. The squad is cleared = victory.
    if (!this.battleEnding) {
      const dead = this.enemies.filter((e) => e.mech.isDestroyed)
      if (dead.length > 0) {
        const live = this.enemies.filter((e) => !e.mech.isDestroyed)
        if (live.length === 0) {
          // Final kill — victory. Keep the last-killed mech + its mesh in the
          // scene so the destruction animation can play on it; dispose the rest.
          const last = dead[dead.length - 1].mech
          for (const e of dead) {
            if (e.mech !== last) {
              this.scene.remove(e.mech.mesh)
              e.mech.cleanup()
            }
          }
          this.enemyMech = last
          this.enemies = []
          this.battleEnding = true
          this.battleEndTimer = 2.0
          this.battleEndResult = 'victory'
        } else {
          // Squad fight continues — dispose the dead and keep going.
          for (const e of dead) {
            this.scene.remove(e.mech.mesh)
            e.mech.cleanup()
          }
          this.enemies = live
          const f = this.nearestEnemy()
          if (f) this.enemyMech = f.mech
        }
      }
    }

    // Player burn-out death.
    if (!this.battleEnding && !this.playerMech.isDestroyed && this.playerMech.stats.currentHealth <= 0) {
      this.particleSystem.spawnExplosion(this.playerMech.position.clone(), 1.8)
      this.camera.triggerShake(1.0)
      this.playerMech.isDestroyed = true
      this.battleEnding = true
      this.battleEndTimer = 2.0
      this.battleEndResult = 'defeat'
    }

    // Update targeting state (camera already updated at the top of the frame)
    this.targetingState = this.calculateTargeting()
  }

  private render() {
    if (this.mapRenderer?.hasLensing()) {
      // Lensing maps handle their own render pipeline; damage shader not applied here
      this.mapRenderer.renderWithLensing(this.renderer, this.scene, this.camera.camera)
    } else if (this.composer) {
      this.composer.render()
    } else {
      this.renderer.render(this.scene, this.camera.camera)
    }
  }

  stop() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
  }

  /**
   * Swap in a fresh enemy for the next survival wave WITHOUT tearing down the
   * scene or the player mech. Disposes the old enemy's mesh, adds the new one,
   * resets the battle-ending state, and resumes the render loop. Single-player
   * survival only; multiplayer never calls this.
   */
  respawnEnemy(newEnemy: MechEntity, difficulty?: AIDifficulty): void {
    // Dispose the previous squad (any live stragglers) and the focus mesh — after
    // a victory the enemies array is empty but the last-killed focus mesh is kept
    // in the scene for the destruction animation, so clean that up too. Dedupe so
    // a mech that is both the focus and in the array isn't disposed twice.
    const disposed = new Set<MechEntity>()
    const dispose = (m: MechEntity) => {
      if (disposed.has(m)) return
      disposed.add(m)
      this.scene.remove(m.mesh)
      m.cleanup()
    }
    dispose(this.enemyMech)
    for (const e of this.enemies) dispose(e.mech)

    // Adopt the new enemy as a fresh 1-enemy squad and add it to the scene.
    this.enemyMech = newEnemy
    this.enemies = [{ mech: newEnemy, ai: this.enemyAI, lastShot: 0 }]
    this.scene.add(this.enemyMech.mesh)
    this.wireSlotFeedback(newEnemy)

    // Re-arm the AI for the new wave.
    if (difficulty) this.enemyAI.setDifficulty(difficulty)
    if (this.mapDef) {
      this.enemyAI.setArenaBounds(this.mapDef.arena.width / 2, this.mapDef.arena.depth / 2)
    }

    // Clear ending state and any leftover in-flight projectiles, then resume.
    // (Remove active projectiles without disposing the shared visual pools.)
    this.battleEnding = false
    this.battleEndTimer = 0
    this.targetingState = { isTargeted: false, screenX: 0, screenY: 0, screenWidth: 0, screenHeight: 0 }
    for (const proj of this.projectileSystem.getProjectiles().slice()) {
      this.projectileSystem.removeProjectile(proj)
    }

    if (this.animationId === null && !document.hidden) {
      this.lastTime = performance.now()
      this.animate()
    }
  }

  /**
   * Player-only fire feedback: muzzle flash at the arm + a synthesized fire SFX.
   * Single-player path only — multiplayer projectile spawns are untouched.
   */
  private onPlayerFire(arm: 'left' | 'right', aim: THREE.Vector3) {
    const armPart = arm === 'left' ? this.playerMech.loadout.leftArm : this.playerMech.loadout.rightArm
    const rawType = armPart?.weaponType ?? 'ballistic'
    // Map the part-level weaponType to a VFX/SFX projectile type. WeaponType has
    // no 'missile' member (missiles are ballistic parts whose id contains
    // 'missile'); energy stays energy; melee/support read as a ballistic spark.
    let fxType: 'ballistic' | 'energy' | 'missile'
    if (rawType === 'energy') {
      fxType = 'energy'
    } else if (rawType === 'missile') {
      fxType = 'missile'
    } else {
      fxType = 'ballistic'
    }

    this.particleSystem.spawnMuzzleFlash(this.playerMech.getArmPosition(arm), fxType, aim)
    this.audio.playWeaponFire(fxType)
  }

  triggerDamageEffect(intensity: number = 1.0) {
    this.damageIntensity = Math.min(1.0, this.damageIntensity + intensity)
    if (this.damagePass) {
      this.damagePass.uniforms.intensity.value = this.damageIntensity
    }
  }

  cleanup() {
    this.stop()
    window.removeEventListener('resize', this.handleResizeBound)
    document.removeEventListener('visibilitychange', this.handleVisibilityBound)
    this.inputManager.cleanup()
    this.projectileSystem.cleanup()
    this.particleSystem.cleanup()
    this.playerMech.cleanup()
    // Dispose the focus enemy + any live squad members, deduped (the focus is
    // usually also in the array; MP's single opponent is both).
    const disposed = new Set<MechEntity>()
    for (const m of [this.enemyMech, ...this.enemies.map((e) => e.mech)]) {
      if (disposed.has(m)) continue
      disposed.add(m)
      m.cleanup()
    }

    // Cleanup scene
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose()
        if (object.material instanceof THREE.Material) {
          object.material.dispose()
        }
      }
    })

    this.composer?.dispose()
    this.renderer.dispose()
  }

  getBattleTime(): number {
    return this.battleTime
  }

  getFPS(): number {
    return this.currentFPS
  }

  getPlayerPosition(): THREE.Vector3 {
    return this.playerMech.position
  }

  getEnemyPosition(): THREE.Vector3 {
    return this.enemyMech.position
  }

  getPlayerYaw(): number {
    return this.playerMech.rotation.y
  }

  getPlayerDashCooldown(): number {
    return this.playerMech.dashCooldown
  }

  getPlayerDashMaxCooldown(): number {
    return this.playerMech.DASH_COOLDOWN
  }

  getPlayerPower(): number {
    return this.playerMech.currentPower
  }

  getPlayerMaxPower(): number {
    return this.playerMech.maxPower
  }

  getPlayerAbilityCooldown(): number {
    return this.playerMech.rackAbilityCooldown
  }

  getPlayerAbilityMaxCooldown(): number {
    // Return the max cooldown for the equipped rack ability
    const rack = this.playerMech.loadout.rack
    if (!rack) return 0

    switch (rack.id) {
      case 'rack-smoke-launcher': return 15
      case 'rack-ammo-feed': return 20
      case 'rack-repair-drone': return 30
      default: return 0
    }
  }

  getTargetingState(): TargetingState {
    return this.targetingState
  }

  protected calculateTargeting(): TargetingState {
    // Get camera aim direction from yaw/pitch
    const yaw = this.camera.mouseRotation.x
    const pitch = this.camera.mouseRotation.y
    const aimDir = new THREE.Vector3(
      Math.sin(yaw) * Math.cos(pitch),
      Math.sin(pitch),
      Math.cos(yaw) * Math.cos(pitch)
    ).normalize()

    // Vector from player to enemy
    const toEnemy = this.enemyMech.position.clone()
      .sub(this.playerMech.position)
    const distance = toEnemy.length()
    toEnemy.normalize()

    // Get targeting cone angle from head part (fallback to 15° if no head)
    const coneAngleDegrees = this.playerMech.loadout.head?.targetingConeAngle ?? 15
    const coneAngleRadians = coneAngleDegrees * (Math.PI / 180)

    // Cone-based detection: check angle via dot product
    const dotProduct = aimDir.dot(toEnemy)
    const angleThreshold = Math.cos(coneAngleRadians)

    if (dotProduct <= angleThreshold) {
      return { isTargeted: false, screenX: 0, screenY: 0, screenWidth: 0, screenHeight: 0 }
    }

    // Project enemy position to screen space (NDC coordinates)
    const enemyScreenPos = this.enemyMech.position.clone()
    enemyScreenPos.project(this.camera.camera)

    // Check if enemy is in front of camera (not behind)
    if (enemyScreenPos.z > 1) {
      return { isTargeted: false, screenX: 0, screenY: 0, screenWidth: 0, screenHeight: 0 }
    }

    // Convert NDC (-1 to +1) to screen pixel coordinates
    const screenX = (enemyScreenPos.x + 1) / 2 * window.innerWidth
    const screenY = (-enemyScreenPos.y + 1) / 2 * window.innerHeight

    // Calculate box size using perspective projection
    const mechHeightWorld = 4 // Mech is ~4 units tall
    const fov = this.camera.camera.fov * (Math.PI / 180) // Convert to radians
    const screenHeight = (mechHeightWorld / distance) *
                         (window.innerHeight / (2 * Math.tan(fov / 2)))
    const screenWidth = screenHeight * 0.6 // Aspect ratio (~width/height of mech)

    return {
      isTargeted: true,
      screenX,
      screenY,
      screenWidth,
      screenHeight
    }
  }

  private checkProjectileBuildingCollisions() {
    const projectiles = this.projectileSystem.getProjectiles()

    for (const projectile of projectiles) {
      for (const building of this.buildings) {
        // Check if projectile is within building bounds
        const dx = Math.abs(projectile.position.x - building.position.x)
        const dy = Math.abs(projectile.position.y - building.position.y)
        const dz = Math.abs(projectile.position.z - building.position.z)

        if (dx < building.width / 2 &&
            dy < building.height / 2 &&
            dz < building.depth / 2) {
          // Projectile hit building - directional debris sparks + remove.
          this.particleSystem.spawnImpactSparks(
            projectile.position.clone(),
            projectile.velocity.clone().normalize(),
            'building',
          )
          this.projectileSystem.removeProjectile(projectile)
          break
        }
      }
    }
  }

  private checkMechBuildingCollisions(mech: MechEntity) {
    const mechRadius = 2 // Collision radius for mechs

    for (const building of this.buildings) {
      const buildingTop = building.position.y + building.height / 2

      // Calculate closest point on building to mech in XZ plane
      const closestX = Math.max(
        building.position.x - building.width / 2,
        Math.min(mech.position.x, building.position.x + building.width / 2)
      )
      const closestZ = Math.max(
        building.position.z - building.depth / 2,
        Math.min(mech.position.z, building.position.z + building.depth / 2)
      )

      const dx = mech.position.x - closestX
      const dz = mech.position.z - closestZ
      const distanceSquared = dx * dx + dz * dz
      const withinXZ = distanceSquared < mechRadius * mechRadius

      if (!withinXZ) continue

      // Mech is within the XZ footprint of the building.
      // If the mech is falling and has reached or passed the building top, land on it.
      if (mech.velocity.y < 0 && mech.position.y <= buildingTop) {
        mech.position.y = buildingTop
        mech.velocity.y = 0
        mech.isJumping = false
        continue
      }

      // Mech is colliding with the side of the building — push it out horizontally.
      // Only apply if mech is below the building top (not already on top).
      if (mech.position.y < buildingTop) {
        const distance = Math.sqrt(distanceSquared)
        if (distance > 0) {
          const pushX = (dx / distance) * (mechRadius - distance)
          const pushZ = (dz / distance) * (mechRadius - distance)
          mech.position.x += pushX
          mech.position.z += pushZ
        } else {
          // Mech is exactly at building center, push in arbitrary direction
          mech.position.x += mechRadius
        }
      }
    }
  }
}
