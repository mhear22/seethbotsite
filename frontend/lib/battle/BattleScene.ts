import * as THREE from 'three'
import { MechEntity } from './MechEntity'
import { ProjectileSystem } from './ProjectileSystem'
import { CameraController } from './CameraController'
import { PhysicsSystem } from './PhysicsSystem'
import { InputManager, type InputState } from './InputManager'
import { markRaw } from 'vue'

export interface BattleSceneConfig {
  canvas: HTMLCanvasElement
  playerMech: MechEntity
  enemyMech: MechEntity
  onBattleEnd: (result: 'victory' | 'defeat') => void
  onDamageDealt: (amount: number) => void
}

export class BattleScene {
  private scene: THREE.Scene
  private renderer: THREE.WebGLRenderer
  private camera: CameraController
  private inputManager: InputManager
  private physicsSystem: PhysicsSystem
  private projectileSystem: ProjectileSystem

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

  constructor(config: BattleSceneConfig) {
    this.playerMech = config.playerMech
    this.enemyMech = config.enemyMech
    this.onBattleEnd = config.onBattleEnd
    this.onDamageDealt = config.onDamageDealt

    // Initialize Three.js scene
    this.scene = markRaw(new THREE.Scene())
    this.scene.background = new THREE.Color(0x1a1a2e)

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
    this.camera = new CameraController(this.playerMech)

    // Setup scene
    this.setupLighting()
    this.setupArena()
    this.addMechsToScene()

    // Handle window resize
    window.addEventListener('resize', () => this.handleResize())
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
    const input = this.inputManager.getInputState()

    // Update player mech
    this.physicsSystem.updateMovement(this.playerMech, input, deltaTime)
    this.physicsSystem.updateJumpJets(this.playerMech, input, deltaTime)
    this.playerMech.update(deltaTime)

    // Player shooting
    if (input.shoot && this.battleTime - this.lastPlayerShot > this.PLAYER_FIRE_RATE) {
      const aimDirection = this.playerMech.getForwardDirection()
      this.projectileSystem.fireWeapon(this.playerMech, aimDirection)
      this.lastPlayerShot = this.battleTime
    }

    // Update enemy AI
    const shouldEnemyFire = this.physicsSystem.updateEnemyAI(
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

      // Track damage dealt by player
      if (hit.target === this.enemyMech) {
        this.onDamageDealt(hit.projectile.damage)
      }

      this.projectileSystem.removeProjectile(hit.projectile)

      // Check for battle end
      if (defeated) {
        if (hit.target === this.playerMech) {
          this.onBattleEnd('defeat')
          this.stop()
        } else {
          this.onBattleEnd('victory')
          this.stop()
        }
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
}
