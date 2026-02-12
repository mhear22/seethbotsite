import * as THREE from 'three'
import { MechEntity } from './MechEntity'
import { ProjectileSystem } from './ProjectileSystem'
import { CameraController } from './CameraController'
import { PhysicsSystem } from './PhysicsSystem'
import { InputManager, type InputState } from './InputManager'
import { ParticleSystem } from './ParticleSystem'
import { EnemyAI } from './EnemyAI'
import { markRaw } from 'vue'
import { useAudio } from '../../composables/useAudio'

export interface BattleSceneConfig {
  canvas: HTMLCanvasElement
  playerMech: MechEntity
  enemyMech: MechEntity
  onBattleEnd: (result: 'victory' | 'defeat') => void
  onDamageDealt: (amount: number) => void
  mouseSensitivity?: number
  movementSpeed?: number
  invertMouseX?: boolean
  invertMouseY?: boolean
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
  enemyMech: MechEntity
  private buildings: Building[] = []

  private targetingState: TargetingState = {
    isTargeted: false,
    screenX: 0,
    screenY: 0,
    screenWidth: 0,
    screenHeight: 0
  }

  private animationId: number | null = null
  private lastTime: number = 0
  private battleTime: number = 0
  private onBattleEnd: (result: 'victory' | 'defeat') => void
  private onDamageDealt: (amount: number) => void

  // Dual weapon cooldowns
  private lastLeftArmShot: number = 0
  private lastRightArmShot: number = 0

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
    this.inputManager = new InputManager(config.canvas, config.keyBindings)
    this.physicsSystem = new PhysicsSystem()
    this.projectileSystem = new ProjectileSystem(this.scene)
    this.particleSystem = new ParticleSystem(this.scene)
    this.camera = new CameraController(this.playerMech)
    this.enemyAI = new EnemyAI()
    this.audio = useAudio()

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

    // Setup scene
    this.setupSky()
    this.setupLighting()
    this.setupArena()
    this.addMechsToScene()

    // Handle window resize
    window.addEventListener('resize', () => this.handleResize())
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
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
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

  protected update(deltaTime: number) {
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
    this.checkMechBuildingCollisions(this.playerMech)
    this.playerMech.update(deltaTime)

    // Update power regeneration
    this.playerMech.updatePower(deltaTime)

    // Update rack ability cooldown
    this.playerMech.rackAbilityCooldown = Math.max(0, this.playerMech.rackAbilityCooldown - deltaTime)

    // Handle rack ability input
    if (input.useAbility) {
      this.playerMech.useRackAbility()
    }

    // Dual weapon firing with separate cooldowns
    // Auto-aim at locked targets, otherwise use camera direction
    let aimDirection: THREE.Vector3
    if (this.targetingState.isTargeted) {
      // Aim at locked enemy
      aimDirection = this.enemyMech.position.clone()
        .sub(this.playerMech.position)
        .normalize()
    } else {
      // Use camera aim direction
      aimDirection = this.playerMech.getForwardDirection()
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

    // Left arm (right mouse button)
    if (input.shootLeft && this.battleTime - this.lastLeftArmShot > leftFireRate) {
      if (this.playerMech.loadout.leftArm) {
        this.projectileSystem.fireWeapon(this.playerMech, aimDirection, 'left')
        this.lastLeftArmShot = this.battleTime
      }
    }

    // Right arm (left mouse button)
    if (input.shootRight && this.battleTime - this.lastRightArmShot > rightFireRate) {
      if (this.playerMech.loadout.rightArm) {
        this.projectileSystem.fireWeapon(this.playerMech, aimDirection, 'right')
        this.lastRightArmShot = this.battleTime
      }
    }

    // Update enemy AI (new dedicated class)
    const shouldEnemyFire = this.enemyAI.update(
      this.enemyMech,
      this.playerMech,
      deltaTime
    )

    // Update enemy power regeneration
    this.enemyMech.updatePower(deltaTime)

    if (shouldEnemyFire) {
      const enemyAimDirection = this.playerMech.position.clone()
        .sub(this.enemyMech.position)
        .normalize()
      // Enemy fires from right arm by default
      this.projectileSystem.fireWeapon(this.enemyMech, enemyAimDirection, 'right')
    }

    this.checkMechBuildingCollisions(this.enemyMech)
    this.enemyMech.update(deltaTime)

    // Update projectiles
    this.projectileSystem.update(deltaTime)

    // Check projectile-building collisions
    this.checkProjectileBuildingCollisions()

    // Check projectile collisions
    const hits = this.projectileSystem.checkCollisions([this.playerMech, this.enemyMech])

    for (const hit of hits) {
      const defeated = hit.target.takeDamage(hit.projectile.damage)

      // Calculate impact position at the target's center (more visible)
      const impactPosition = hit.target.position.clone()
      impactPosition.y += 1.5 // Spawn at torso height for better visibility

      // Spawn hit particles at impact point
      this.particleSystem.spawnHitEffect(
        impactPosition,
        hit.projectile.type
      )

      // Play hit sound
      //this.audio.playBulletHitMech()

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

    // Update targeting state
    this.targetingState = this.calculateTargeting()
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

  private calculateTargeting(): TargetingState {
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
          // Projectile hit building - spawn impact effect and remove projectile
          this.particleSystem.spawnHitEffect(
            projectile.position.clone(),
            projectile.type
          )
          // Play hit sound for building impacts
          //this.audio.playBulletHit()
          this.projectileSystem.removeProjectile(projectile)
          break
        }
      }
    }
  }

  private checkMechBuildingCollisions(mech: MechEntity) {
    const mechRadius = 2 // Collision radius for mechs

    for (const building of this.buildings) {
      // Calculate closest point on building to mech
      const closestX = Math.max(
        building.position.x - building.width / 2,
        Math.min(mech.position.x, building.position.x + building.width / 2)
      )
      const closestZ = Math.max(
        building.position.z - building.depth / 2,
        Math.min(mech.position.z, building.position.z + building.depth / 2)
      )

      // Calculate distance from mech to closest point
      const dx = mech.position.x - closestX
      const dz = mech.position.z - closestZ
      const distanceSquared = dx * dx + dz * dz

      // If mech is colliding with building, push it out
      if (distanceSquared < mechRadius * mechRadius) {
        const distance = Math.sqrt(distanceSquared)
        if (distance > 0) {
          // Push mech away from building
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
