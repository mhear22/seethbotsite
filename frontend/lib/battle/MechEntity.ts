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

  // AI state
  aiState: 'idle' | 'chase' | 'strafe' | 'shoot' = 'idle'
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
