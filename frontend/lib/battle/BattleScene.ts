import * as THREE from 'three'
import { MechEntity } from './MechEntity'
import { ProjectileSystem } from './ProjectileSystem'
import { CameraController } from './CameraController'
import { PhysicsSystem } from './PhysicsSystem'
import { InputManager, type InputState } from './InputManager'
import { ParticleSystem } from './ParticleSystem'
import { EnemyAI } from './EnemyAI'
import { markRaw } from 'vue'

export interface BattleSceneConfig {
  canvas: HTMLCanvasElement
  playerMech: MechEntity
  enemyMech: MechEntity
  onBattleEnd: (result: 'victory' | 'defeat') => void
  onDamageDealt: (amount: number) => void
  mouseSensitivity?: number
  movementSpeed?: number
}

export class BattleScene {
  private scene: THREE.Scene
  private renderer: THREE.WebGLRenderer
  private camera: CameraController
  private inputManager: InputManager
  private physicsSystem: PhysicsSystem
  private projectileSystem: ProjectileSystem
  private particleSystem!: ParticleSystem
  private enemyAI!: EnemyAI

  playerMech: MechEntity
  enemyMech: MechEntity

  private animationId: number | null = null
  private lastTime: number = 0
  private battleTime: number = 0
  private onBattleEnd: (result: 'victory' | 'defeat') => void
  private onDamageDealt: (amount: number) => void

  // Shooting cooldown
  private lastPlayerShot: number = 0
  private readonly PLAYER_FIRE_RATE = 0.25 // Shots per second

  // Battle ending animation
  private battleEnding: boolean = false
  private battleEndTimer: number = 0
  private battleEndResult: 'victory' | 'defeat' = 'victory'

  constructor(config: BattleSceneConfig) {
    this.playerMech = config.playerMech
    this.enemyMech = config.enemyMech
    this.onBattleEnd = config.onBattleEnd
    this.onDamageDealt = config.onDamageDealt

    // Initialize Three.js scene
    this.scene = markRaw(new THREE.Scene())

    // Initialize renderer
    this.renderer = markRaw(new THREE.WebGLRenderer({
      canvas: config.canvas,
      antialias: true
    }))
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.shadowMap.enabled = true

    // Initialize systems
    this.inputManager = new InputManager(config.canvas)
    this.physicsSystem = new PhysicsSystem()
    this.projectileSystem = new ProjectileSystem(this.scene)
    this.particleSystem = new ParticleSystem(this.scene)
    this.camera = new CameraController(this.playerMech)
    this.enemyAI = new EnemyAI()

    // Apply settings
    if (config.mouseSensitivity !== undefined) {
      this.camera.sensitivityMultiplier = config.mouseSensitivity
    }
    if (config.movementSpeed !== undefined) {
      this.physicsSystem.speedMultiplier = config.movementSpeed
    }

    // Setup scene
    this.setupSky()
    this.setupLighting()
    this.setupArena()
    this.addMechsToScene()

    // Handle window resize
    window.addEventListener('resize', () => this.handleResize())
  }

  private setupSky() {
    const skyGeometry = new THREE.SphereGeometry(400, 32, 16)
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
    directionalLight.position.set(20, 30, 20)
    directionalLight.castShadow = true
    directionalLight.shadow.camera.left = -50
    directionalLight.shadow.camera.right = 50
    directionalLight.shadow.camera.top = 50
    directionalLight.shadow.camera.bottom = -50
    this.scene.add(directionalLight)

    // Hemisphere light for better ambient
    const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x2d3748, 0.3)
    this.scene.add(hemiLight)
  }

  private setupArena() {
    // Floor
    const floorGeometry = new THREE.PlaneGeometry(50, 50)
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
    const gridHelper = new THREE.GridHelper(50, 50, 0x4a5568, 0x374151)
    gridHelper.position.y = 0.01
    this.scene.add(gridHelper)

    // Arena boundaries (visual walls)
    const wallHeight = 5
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
    createWall(50, wallHeight, 0.5, 0, -25) // North
    createWall(50, wallHeight, 0.5, 0, 25)  // South
    createWall(0.5, wallHeight, 50, -25, 0) // West
    createWall(0.5, wallHeight, 50, 25, 0)  // East
  }

  private addMechsToScene() {
    this.scene.add(this.playerMech.mesh)
    this.scene.add(this.enemyMech.mesh)
  }

  private handleResize() {
    this.camera.handleResize(window.innerWidth, window.innerHeight)
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }

  start() {
    this.lastTime = performance.now()
    this.animate()
  }

  private animate = () => {
    this.animationId = requestAnimationFrame(this.animate)

    const currentTime = performance.now()
    const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1) // Cap at 100ms
    this.lastTime = currentTime
    this.battleTime += deltaTime

    this.update(deltaTime)
    this.render()
  }

  private update(deltaTime: number) {
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

    // Update player mech
    this.physicsSystem.updateDash(this.playerMech, input, deltaTime)
    if (!this.playerMech.isDashing) {
      this.physicsSystem.updateMovement(this.playerMech, input, deltaTime)
    }
    this.physicsSystem.updateJumpJets(this.playerMech, input, deltaTime)
    this.playerMech.update(deltaTime)

    // Player shooting
    if (input.shoot && this.battleTime - this.lastPlayerShot > this.PLAYER_FIRE_RATE) {
      const aimDirection = this.playerMech.getForwardDirection()
      this.projectileSystem.fireWeapon(this.playerMech, aimDirection)
      this.lastPlayerShot = this.battleTime
    }

    // Update enemy AI (new dedicated class)
    const shouldEnemyFire = this.enemyAI.update(
      this.enemyMech,
      this.playerMech,
      deltaTime
    )

    if (shouldEnemyFire) {
      const aimDirection = this.playerMech.position.clone()
        .sub(this.enemyMech.position)
        .normalize()
      this.projectileSystem.fireWeapon(this.enemyMech, aimDirection)
    }

    this.enemyMech.update(deltaTime)

    // Update projectiles
    this.projectileSystem.update(deltaTime)

    // Check projectile collisions
    const hits = this.projectileSystem.checkCollisions([this.playerMech, this.enemyMech])

    for (const hit of hits) {
      const defeated = hit.target.takeDamage(hit.projectile.damage)

      // Spawn hit particles at impact point
      this.particleSystem.spawnHitEffect(
        hit.projectile.position.clone(),
        hit.projectile.type
      )

      // Track damage dealt by player
      if (hit.target === this.enemyMech) {
        this.onDamageDealt(hit.projectile.damage)
      }

      // Screen shake when player takes damage
      if (hit.target === this.playerMech) {
        this.camera.triggerShake(0.4)
      }

      this.projectileSystem.removeProjectile(hit.projectile)

      // Check for battle end — start destruction animation instead of immediate stop
      if (defeated) {
        this.particleSystem.spawnExplosion(hit.target.position.clone())
        this.camera.triggerShake(1.0)
        hit.target.isDestroyed = true
        this.battleEnding = true
        this.battleEndTimer = 2.0
        this.battleEndResult = hit.target === this.playerMech ? 'defeat' : 'victory'
      }
    }

    // Update camera
    this.camera.update(deltaTime, input.mouseX, input.mouseY)
    this.inputManager.resetMouseMovement()
  }

  private render() {
    this.renderer.render(this.scene, this.camera.camera)
  }

  stop() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
  }

  cleanup() {
    this.stop()
    this.inputManager.cleanup()
    this.projectileSystem.cleanup()
    this.particleSystem.cleanup()
    this.playerMech.cleanup()
    this.enemyMech.cleanup()

    // Cleanup scene
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose()
        if (object.material instanceof THREE.Material) {
          object.material.dispose()
        }
      }
    })

    this.renderer.dispose()
  }

  getBattleTime(): number {
    return this.battleTime
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
}
