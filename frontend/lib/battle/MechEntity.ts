import * as THREE from 'three'
import type { MechLoadout } from '../../composables/useMechBuilder'
import { markRaw } from 'vue'
import { getMechModelLoader, MODEL_ATTACH_POINTS } from './MechModelLoader'

export interface CombatStats {
  maxHealth: number
  currentHealth: number
  armor: number
  speed: number
  firepower: number
  accuracy: number
  energy: number
}

export class MechEntity {
  id: string
  name: string
  loadout: MechLoadout
  stats: CombatStats

  // Three.js objects
  mesh: THREE.Group
  position: THREE.Vector3
  rotation: THREE.Euler
  velocity: THREE.Vector3

  // Combat state
  isJumping: boolean = false
  jumpFuel: number
  isPlayer: boolean
  isDestroyed: boolean = false

  // Walk animation
  private walkCycle: number = 0

  // Power system
  currentPower: number = 100
  maxPower: number = 100

  // Rack ability state
  rackAbilityCooldown: number = 0
  rackAbilityActive: boolean = false

  // Destruction animation - random velocities per mesh child
  private destroyVelocities: THREE.Vector3[] = []
  private destroyRotations: THREE.Vector3[] = []

  // Dash state
  isDashing: boolean = false
  dashTimer: number = 0
  dashCooldown: number = 0
  readonly DASH_DURATION = 0.15
  readonly DASH_COOLDOWN = 2.0

  // AI state
  aiState: 'idle' | 'chase' | 'strafe' | 'shoot' | 'flank' | 'retreat' | 'aggressive' = 'idle'
  aiStrafeDir: number = 1
  aiStrafeDirTimer: number = 0
  lastShotTime: number = 0

  // Model loading state
  private modelLoadPromise: Promise<void> | null = null

  constructor(
    id: string,
    name: string,
    loadout: MechLoadout,
    stats: CombatStats,
    isPlayer: boolean,
    spawnPosition: THREE.Vector3
  ) {
    this.id = id
    this.name = name
    this.loadout = loadout
    this.stats = { ...stats }
    this.isPlayer = isPlayer
    this.jumpFuel = stats.energy

    this.position = spawnPosition.clone()
    this.rotation = new THREE.Euler(0, 0, 0)
    this.velocity = new THREE.Vector3(0, 0, 0)

    // Create immediate procedural mesh (fast, always available)
    this.mesh = markRaw(this.createMeshGroup())

    // Start async model loading in background
    this.modelLoadPromise = this.loadAndApplyModels()
  }

  /**
   * Load 3D models asynchronously and replace procedural geometry
   * Falls back silently if models aren't available
   */
  private async loadAndApplyModels(): Promise<void> {
    try {
      const loader = getMechModelLoader()
      const teamColor = this.isPlayer ? 0x3b82f6 : 0xef4444

      const modelGroup = await loader.assembleMech(this.loadout, teamColor)

      // Transfer position and rotation from old mesh
      modelGroup.position.copy(this.position)
      modelGroup.rotation.copy(this.rotation)

      // Dispose old procedural geometry
      this.disposeMeshGroup()

      // Replace with loaded model
      this.mesh = markRaw(modelGroup)
    } catch (error) {
      // Silently keep procedural geometry on error
      console.debug('Model loading failed, using procedural geometry:', error)
    }
  }

  /**
   * Wait for model loading to complete
   * Useful for loading screens
   */
  async waitForModelLoad(): Promise<void> {
    if (this.modelLoadPromise) {
      await this.modelLoadPromise
    }
  }

  /**
   * Dispose all geometry and materials in the mesh group
   */
  private disposeMeshGroup(): void {
    this.mesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()
        if (child.material instanceof THREE.Material) {
          child.material.dispose()
        }
      }
    })
  }

  private createMeshGroup(): THREE.Group {
    const group = new THREE.Group()

    // Color based on team
    const color = this.isPlayer ? 0x3b82f6 : 0xef4444 // Blue vs Red

    // Core body (compact torso)
    const coreGeometry = new THREE.BoxGeometry(1.6, 1.6, 1.3)
    const coreMaterial = new THREE.MeshStandardMaterial({ color })
    const core = new THREE.Mesh(coreGeometry, coreMaterial)
    core.position.copy(MODEL_ATTACH_POINTS.core)
    core.position.y += 0.8
    group.add(core)

    // Head (1x1x1)
    const headGeometry = new THREE.BoxGeometry(1, 1, 1)
    const headMaterial = new THREE.MeshStandardMaterial({
      color: this.isPlayer ? 0x60a5fa : 0xfca5a5
    })
    const head = new THREE.Mesh(headGeometry, headMaterial)
    head.position.copy(MODEL_ATTACH_POINTS.head)
    group.add(head)

    // Left arm
    const armGeometry = new THREE.BoxGeometry(0.8, 2, 0.8)
    const armMaterial = new THREE.MeshStandardMaterial({
      color: this.isPlayer ? 0x2563eb : 0xdc2626
    })
    const leftArm = new THREE.Mesh(armGeometry, armMaterial)
    leftArm.position.copy(MODEL_ATTACH_POINTS.leftArm)
    group.add(leftArm)

    // Right arm
    const rightArm = new THREE.Mesh(armGeometry, armMaterial)
    rightArm.position.copy(MODEL_ATTACH_POINTS.rightArm)
    group.add(rightArm)

    // Legs (taller bipedal legs)
    const legsGeometry = new THREE.BoxGeometry(1.8, 2.8, 1.5)
    const legsMaterial = new THREE.MeshStandardMaterial({
      color: this.isPlayer ? 0x1e40af : 0x991b1b
    })
    const legs = new THREE.Mesh(legsGeometry, legsMaterial)
    legs.position.copy(MODEL_ATTACH_POINTS.legs)
    legs.position.y += 1.4
    group.add(legs)

    // Set initial position
    group.position.copy(this.position)

    return group
  }

  update(deltaTime: number) {
    // Update mesh position and rotation
    this.mesh.position.copy(this.position)
    this.mesh.rotation.copy(this.rotation)

    // Walk animation
    if (!this.isDestroyed) {
      this.animateWalk(deltaTime)
    }
  }

  private animateWalk(deltaTime: number) {
    const speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.z ** 2)
    const isMoving = speed > 0.5

    if (isMoving) {
      // Advance walk cycle based on movement speed
      this.walkCycle += deltaTime * speed * 0.8
    } else {
      // Smoothly return to neutral when stopped
      this.walkCycle *= 0.9
      if (Math.abs(this.walkCycle) < 0.01) this.walkCycle = 0
    }

    const swing = Math.sin(this.walkCycle)
    const legsGroup = this.findChildByName(this.mesh, 'legs')
    if (!legsGroup) return

    // Bipedal legs — swing left/right legs in opposition
    const legLeft = this.findChildByName(legsGroup, 'leg-left')
    const legRight = this.findChildByName(legsGroup, 'leg-right')
    if (legLeft && legRight) {
      const angle = swing * 0.3 // max ~17 degrees
      legLeft.rotation.x = angle
      legRight.rotation.x = -angle
      // Subtle body bob on the upper parts
      this.applyBodyBob(swing, isMoving)
      return
    }

    // Quadrupedal — diagonal pairs move together (trot gait)
    const legLF = this.findChildByName(legsGroup, 'leg-lf')
    const legRB = this.findChildByName(legsGroup, 'leg-rb')
    const legRF = this.findChildByName(legsGroup, 'leg-rf')
    const legLB = this.findChildByName(legsGroup, 'leg-lb')
    if (legLF && legRB && legRF && legLB) {
      const angle = swing * 0.25
      // Diagonal pair 1
      legLF.rotation.x = angle
      legRB.rotation.x = angle
      // Diagonal pair 2 (opposite)
      legRF.rotation.x = -angle
      legLB.rotation.x = -angle
      return
    }

    // Tracked — spin wheels based on speed
    const trackLeft = this.findChildByName(legsGroup, 'track-left')
    const trackRight = this.findChildByName(legsGroup, 'track-right')
    if (trackLeft || trackRight) {
      const spinRate = speed * deltaTime * 3
      const spinWheels = (parent: THREE.Object3D) => {
        parent.traverse((child) => {
          if (child.name.startsWith('wheel-') || child.name.startsWith('sprocket-') || child.name.startsWith('idler-')) {
            child.rotation.x += spinRate
          }
        })
      }
      if (trackLeft) spinWheels(trackLeft)
      if (trackRight) spinWheels(trackRight)
      return
    }

    // Hover — constant bob + thrust glow pulse
    const thruster = this.findChildByName(legsGroup, 'thruster-lf')
    if (thruster) {
      // Hover always bobs (use raw time via walkCycle advancing)
      this.walkCycle += deltaTime * 4 // override: constant advance for hover
      const bobAmount = isMoving ? 0.1 : 0.05
      const bob = Math.sin(this.walkCycle) * bobAmount
      if (legsGroup.userData.baseY === undefined) {
        legsGroup.userData.baseY = legsGroup.position.y
      }
      legsGroup.position.y = (legsGroup.userData.baseY as number) + bob
      // Pulse thrust glow
      legsGroup.traverse((child) => {
        if (child.name === 'thrust-glow' && child instanceof THREE.Mesh) {
          const mat = child.material as THREE.MeshStandardMaterial
          mat.emissiveIntensity = isMoving ? 0.8 + Math.sin(this.walkCycle * 3) * 0.3 : 0.5
        }
      })
      return
    }
  }

  private applyBodyBob(swing: number, isMoving: boolean) {
    // Subtle vertical bob based on walk cycle
    // Uses the attach points as base, so we set absolute Y offset
    const bobY = isMoving ? Math.abs(swing) * 0.06 : 0
    for (const name of ['core', 'head', 'leftArm', 'rightArm', 'rack'] as const) {
      const part = this.findChildByName(this.mesh, name)
      if (part && part.userData.baseY === undefined) {
        part.userData.baseY = part.position.y
      }
      if (part && part.userData.baseY !== undefined) {
        part.position.y = part.userData.baseY + bobY
      }
    }
  }

  private findChildByName(parent: THREE.Object3D, name: string): THREE.Object3D | null {
    for (const child of parent.children) {
      if (child.name === name) return child
    }
    return null
  }

  takeDamage(damage: number): boolean {
    // Apply armor reduction (armor is %)
    const armorReduction = Math.min(0.9, this.stats.armor / 100) // Cap at 90%
    const actualDamage = damage * (1 - armorReduction)

    this.stats.currentHealth -= actualDamage

    // Visual feedback - flash red
    this.flashDamage()

    console.log(`${this.name} took ${actualDamage.toFixed(1)} damage (raw: ${damage}, armor: ${armorReduction * 100}%)`)

    if (this.stats.currentHealth <= 0) {
      this.stats.currentHealth = 0
      return true // Defeated
    }

    return false
  }

  private flashDamage() {
    // Brief red flash effect
    this.mesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const originalColor = child.material.color.getHex()
        child.material.color.setHex(0xff0000)

        setTimeout(() => {
          child.material.color.setHex(originalColor)
        }, 100)
      }
    })
  }

  playDestroyAnimation(deltaTime: number) {
    const children = this.mesh.children
    // Initialize random velocities on first call
    if (this.destroyVelocities.length === 0) {
      for (let i = 0; i < children.length; i++) {
        this.destroyVelocities.push(new THREE.Vector3(
          (Math.random() - 0.5) * 8,
          2 + Math.random() * 6,
          (Math.random() - 0.5) * 8,
        ))
        this.destroyRotations.push(new THREE.Vector3(
          (Math.random() - 0.5) * 5,
          (Math.random() - 0.5) * 5,
          (Math.random() - 0.5) * 5,
        ))
      }
    }

    for (let i = 0; i < children.length; i++) {
      const child = children[i]
      const vel = this.destroyVelocities[i]
      const rot = this.destroyRotations[i]
      if (!vel || !rot) continue

      // Apply gravity to velocity
      vel.y -= 12 * deltaTime

      // Move part
      child.position.x += vel.x * deltaTime
      child.position.y += vel.y * deltaTime
      child.position.z += vel.z * deltaTime

      // Spin part
      child.rotation.x += rot.x * deltaTime
      child.rotation.y += rot.y * deltaTime
      child.rotation.z += rot.z * deltaTime
    }
  }

  getForwardDirection(): THREE.Vector3 {
    const direction = new THREE.Vector3(0, 0, 1)
    direction.applyEuler(this.rotation)
    return direction.normalize()
  }

  getRightDirection(): THREE.Vector3 {
    const direction = new THREE.Vector3(1, 0, 0)
    direction.applyEuler(this.rotation)
    return direction.normalize()
  }

  // Weight system computed properties
  get totalWeight(): number {
    let weight = 0
    if (this.loadout.leftArm) weight += this.loadout.leftArm.weight
    if (this.loadout.rightArm) weight += this.loadout.rightArm.weight
    if (this.loadout.core) weight += this.loadout.core.weight
    if (this.loadout.legs) weight += this.loadout.legs.weight
    if (this.loadout.head) weight += this.loadout.head.weight
    if (this.loadout.rack) weight += this.loadout.rack.weight
    return weight
  }

  get weightClass(): 'light' | 'medium' | 'heavy' | 'assault' {
    const w = this.totalWeight
    if (w < 60) return 'light'
    if (w < 90) return 'medium'
    if (w < 120) return 'heavy'
    return 'assault'
  }

  get weightPenalty(): number {
    // 0.5 to 1.0 multiplier (lighter = higher, faster)
    return Math.max(0.5, 1.0 - (this.totalWeight / 200))
  }

  // Power system computed properties
  get powerCapacity(): number {
    return this.loadout.legs?.powerCapacity || 100
  }

  get totalPowerDraw(): number {
    let draw = 0
    if (this.loadout.leftArm) draw += this.loadout.leftArm.powerDraw
    if (this.loadout.rightArm) draw += this.loadout.rightArm.powerDraw
    return draw
  }

  updatePower(deltaTime: number) {
    // Regenerate power from core
    const regenRate = this.loadout.core?.powerOutput || 10
    this.currentPower = Math.min(this.powerCapacity, this.currentPower + regenRate * deltaTime)
    this.maxPower = this.powerCapacity
  }

  // Targeting system
  getTargetingBonus(targetDistance: number, isMoving: boolean): number {
    const head = this.loadout.head
    if (!head) return 0

    let bonus = head.targetingBonus / 100 // Base bonus (0.0 to 1.0)

    // Head-specific range modifiers
    switch (head.id) {
      case 'head-targeting-array':
        // Excellent at all ranges, no movement penalty
        if (targetDistance > 50) bonus += 0.2
        break
      case 'head-scout-suite':
        // Best at extreme range, poor close-up
        if (targetDistance > 70) bonus += 0.3
        if (targetDistance < 20) bonus -= 0.2
        break
      case 'head-reinforced':
        // Consistent but mediocre
        bonus *= 0.8
        break
      case 'head-standard-optics':
        // Balanced
        break
    }

    // Movement penalty (reduced by advanced targeting)
    if (isMoving && head.id !== 'head-targeting-array') {
      bonus -= 0.15
    }

    return Math.max(-0.3, Math.min(0.3, bonus)) // Clamp to ±30%
  }

  // Rack ability system
  useRackAbility(): boolean {
    if (!this.loadout.rack || this.rackAbilityCooldown > 0) return false

    switch (this.loadout.rack.id) {
      case 'rack-jump-jets':
        // Already implemented via jump input
        return false
      case 'rack-smoke-launcher':
        // Trigger smoke cloud
        this.rackAbilityCooldown = 15
        return true
      case 'rack-ammo-feed':
        // Activate burst fire mode
        this.rackAbilityActive = true
        this.rackAbilityCooldown = 20
        setTimeout(() => { this.rackAbilityActive = false }, 5000)
        return true
      case 'rack-repair-drone':
        // Instant heal
        this.stats.currentHealth = Math.min(this.stats.maxHealth, this.stats.currentHealth + 50)
        this.rackAbilityCooldown = 30
        return true
    }
    return false
  }

  cleanup() {
    this.disposeMeshGroup()
  }
}
