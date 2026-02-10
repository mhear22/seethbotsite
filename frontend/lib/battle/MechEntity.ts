import * as THREE from 'three'
import type { MechLoadout } from '../../composables/useMechBuilder'
import { markRaw } from 'vue'

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

    this.mesh = markRaw(this.createMeshGroup())
  }

  private createMeshGroup(): THREE.Group {
    const group = new THREE.Group()

    // Color based on team
    const color = this.isPlayer ? 0x3b82f6 : 0xef4444 // Blue vs Red

    // Core body (2x3x2)
    const coreGeometry = new THREE.BoxGeometry(2, 3, 2)
    const coreMaterial = new THREE.MeshStandardMaterial({ color })
    const core = new THREE.Mesh(coreGeometry, coreMaterial)
    core.position.y = 1.5
    group.add(core)

    // Head (1x1x1)
    const headGeometry = new THREE.BoxGeometry(1, 1, 1)
    const headMaterial = new THREE.MeshStandardMaterial({
      color: this.isPlayer ? 0x60a5fa : 0xfca5a5
    })
    const head = new THREE.Mesh(headGeometry, headMaterial)
    head.position.y = 3.5
    group.add(head)

    // Left arm
    const armGeometry = new THREE.BoxGeometry(0.8, 2, 0.8)
    const armMaterial = new THREE.MeshStandardMaterial({
      color: this.isPlayer ? 0x2563eb : 0xdc2626
    })
    const leftArm = new THREE.Mesh(armGeometry, armMaterial)
    leftArm.position.set(-1.4, 2, 0)
    group.add(leftArm)

    // Right arm
    const rightArm = new THREE.Mesh(armGeometry, armMaterial)
    rightArm.position.set(1.4, 2, 0)
    group.add(rightArm)

    // Legs (combined as one box for simplicity)
    const legsGeometry = new THREE.BoxGeometry(1.5, 1.5, 1.5)
    const legsMaterial = new THREE.MeshStandardMaterial({
      color: this.isPlayer ? 0x1e40af : 0x991b1b
    })
    const legs = new THREE.Mesh(legsGeometry, legsMaterial)
    legs.position.y = 0.75
    group.add(legs)

    // Set initial position
    group.position.copy(this.position)

    return group
  }

  update(deltaTime: number) {
    // Update mesh position and rotation
    this.mesh.position.copy(this.position)
    this.mesh.rotation.copy(this.rotation)
  }

  takeDamage(damage: number): boolean {
    // Apply armor reduction (armor is %)
    const armorReduction = Math.min(0.9, this.stats.armor / 100) // Cap at 90%
    const actualDamage = damage * (1 - armorReduction)

    this.stats.currentHealth -= actualDamage

    // Visual feedback - flash red
    this.flashDamage()

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
    this.mesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()
        if (child.material instanceof THREE.Material) {
          child.material.dispose()
        }
      }
    })
  }
}
