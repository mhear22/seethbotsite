import * as THREE from 'three'
import type { MechEntity } from './MechEntity'
import { markRaw } from 'vue'

export interface Projectile {
  id: string
  type: 'ballistic' | 'energy' | 'missile'
  position: THREE.Vector3
  velocity: THREE.Vector3
  damage: number
  ownerId: string
  lifetime: number
  mesh: THREE.Mesh
}

export class ProjectileSystem {
  private projectiles: Projectile[] = []
  private scene: THREE.Scene
  private nextId: number = 0

  constructor(scene: THREE.Scene) {
    this.scene = scene
  }

  fireWeapon(mech: MechEntity, targetDirection: THREE.Vector3, arm: 'left' | 'right' = 'left'): Projectile | null {
    // Get correct weapon
    const armPart = arm === 'left' ? mech.loadout.leftArm : mech.loadout.rightArm
    if (!armPart) return null

    const weaponType = armPart.weaponType || 'ballistic'

    // Check power consumption
    const powerCost = armPart.powerDraw
    if (mech.currentPower < powerCost) {
      // Not enough power - can't fire
      return null
    }

    // Consume power
    mech.currentPower -= powerCost

    // Calculate damage based on firepower stat
    let baseDamage = Math.max(5, mech.stats.firepower / 10)

    // Handle melee weapons specially
    if (weaponType === 'melee') {
      baseDamage *= 2.5 // Melee deals 2.5x damage

      // Very short range spawn position
      const spawnPosition = mech.position.clone().add(
        mech.getForwardDirection().multiplyScalar(2)
      )
      spawnPosition.y += 2

      // Create melee projectile (short-lived, slow)
      const geometry = new THREE.BoxGeometry(1, 1, 1)
      const material = new THREE.MeshStandardMaterial({
        color: mech.isPlayer ? 0xff6600 : 0xff0066
      })
      const mesh = markRaw(new THREE.Mesh(geometry, material))
      mesh.position.copy(spawnPosition)
      this.scene.add(mesh)

      // Lunge forward when attacking
      mech.velocity.add(mech.getForwardDirection().multiplyScalar(8))

      const projectile: Projectile = {
        id: `proj_${this.nextId++}`,
        type: 'ballistic',
        position: spawnPosition,
        velocity: targetDirection.clone().multiplyScalar(80), // Slow projectile
        damage: baseDamage,
        ownerId: mech.id,
        lifetime: 0.2, // Only 200ms to hit
        mesh
      }

      this.projectiles.push(projectile)
      return projectile
    }

    // Calculate distance to target for targeting bonus (use 50 as default for AI)
    const targetDistance = 50
    const isMoving = mech.velocity.length() > 1.0
    const targetingBonus = mech.getTargetingBonus(targetDistance, isMoving)

    // Accuracy affects spread
    const accuracyFactor = Math.max(0.1, Math.min(1, (mech.stats.accuracy / 100) + targetingBonus))
    const baseSpread = (1 - accuracyFactor) * 0.15

    // Check for multi-projectile weapons
    const projectileCount = armPart.projectileCount ?? 1
    let firstProjectile: Projectile | null = null

    // Fire multiple projectiles if specified
    for (let i = 0; i < projectileCount; i++) {
      // Add spread for multiple projectiles to create a cone pattern
      const spreadAngle = projectileCount > 1 ? (i - (projectileCount - 1) / 2) * 0.15 : 0

      // Apply random accuracy spread
      const direction = targetDirection.clone().add(
        new THREE.Vector3(
          (Math.random() - 0.5) * baseSpread,
          (Math.random() - 0.5) * baseSpread,
          (Math.random() - 0.5) * baseSpread
        )
      ).normalize()

      // Apply cone spread for multi-projectile weapons
      if (spreadAngle !== 0) {
        direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), spreadAngle)
      }

      // Adjust spawn position based on arm (-1.4 for left, +1.4 for right)
      const armOffset = arm === 'left' ? -1.4 : 1.4
      const spawnPosition = mech.position.clone()
        .add(mech.getForwardDirection().multiplyScalar(2))
        .add(mech.getRightDirection().multiplyScalar(armOffset))
      spawnPosition.y += 2

      // Create projectile mesh
      const geometry = this.getProjectileGeometry(weaponType)
      const material = this.getProjectileMaterial(weaponType, mech.isPlayer)
      const mesh = markRaw(new THREE.Mesh(geometry, material))
      mesh.position.copy(spawnPosition)
      this.scene.add(mesh)

      const projectile: Projectile = {
        id: `proj_${this.nextId++}`,
        type: weaponType,
        position: spawnPosition,
        velocity: direction.multiplyScalar(this.getProjectileSpeed(weaponType)),
        damage: baseDamage,
        ownerId: mech.id,
        lifetime: 3, // 3 seconds
        mesh
      }

      this.projectiles.push(projectile)

      // Return the first projectile for compatibility
      if (i === 0) {
        firstProjectile = projectile
      }
    }

    return firstProjectile
  }

  private getProjectileGeometry(type: string): THREE.BufferGeometry {
    switch (type) {
      case 'energy':
        return new THREE.SphereGeometry(0.3, 8, 8)
      case 'missile':
        return new THREE.CylinderGeometry(0.2, 0.2, 0.8, 8)
      default: // ballistic
        return new THREE.SphereGeometry(0.2, 6, 6)
    }
  }

  private getProjectileMaterial(type: string, isPlayer: boolean): THREE.Material {
    const playerColor = isPlayer ? 0x60a5fa : 0xfca5a5

    switch (type) {
      case 'energy':
        return new THREE.MeshBasicMaterial({
          color: isPlayer ? 0x00ffff : 0xff00ff,
          emissive: isPlayer ? 0x00ffff : 0xff00ff,
          emissiveIntensity: 0.8
        })
      case 'missile':
        return new THREE.MeshStandardMaterial({
          color: 0x888888,
          emissive: 0xff4400,
          emissiveIntensity: 0.5
        })
      default: // ballistic
        return new THREE.MeshStandardMaterial({ color: playerColor })
    }
  }

  private getProjectileSpeed(type: string): number {
    switch (type) {
      case 'energy':
        return 400 // Fast
      case 'missile':
        return 240 // Medium
      default: // ballistic
        return 300 // Fast
    }
  }

  update(deltaTime: number): Projectile[] {
    const activeProjectiles: Projectile[] = []

    for (const proj of this.projectiles) {
      // Update position
      proj.position.add(proj.velocity.clone().multiplyScalar(deltaTime))
      proj.mesh.position.copy(proj.position)

      // Update lifetime
      proj.lifetime -= deltaTime

      // Keep if still alive
      if (proj.lifetime > 0) {
        activeProjectiles.push(proj)
      } else {
        // Cleanup expired projectile
        this.scene.remove(proj.mesh)
        proj.mesh.geometry.dispose()
        if (proj.mesh.material instanceof THREE.Material) {
          proj.mesh.material.dispose()
        }
      }
    }

    this.projectiles = activeProjectiles
    return this.projectiles
  }

  checkCollisions(mechs: MechEntity[]): Array<{projectile: Projectile, target: MechEntity}> {
    const hits: Array<{projectile: Projectile, target: MechEntity}> = []

    for (const proj of this.projectiles) {
      for (const mech of mechs) {
        // Skip if projectile owner is the target
        if (proj.ownerId === mech.id) continue

        // Skip if mech is already destroyed
        if (mech.isDestroyed) continue

        // Box collision detection - more accurate for tall mechs
        // Mech dimensions: 2 wide, 4 tall (core 3 + head 1), 2 deep
        // Check as a box around the mech's center
        const mechCenter = mech.position.clone()
        mechCenter.y += 2 // Center of mech vertically

        const dx = Math.abs(proj.position.x - mechCenter.x)
        const dy = Math.abs(proj.position.y - mechCenter.y)
        const dz = Math.abs(proj.position.z - mechCenter.z)

        // Hit box: 1.5 units radius in X/Z (generous), 2.5 units in Y (tall)
        const hitRadiusXZ = 1.5
        const hitRadiusY = 2.5

        if (dx < hitRadiusXZ && dy < hitRadiusY && dz < hitRadiusXZ) {
          hits.push({ projectile: proj, target: mech })
        }
      }
    }

    return hits
  }

  removeProjectile(projectile: Projectile) {
    const index = this.projectiles.indexOf(projectile)
    if (index !== -1) {
      this.projectiles.splice(index, 1)
      this.scene.remove(projectile.mesh)
      projectile.mesh.geometry.dispose()
      if (projectile.mesh.material instanceof THREE.Material) {
        projectile.mesh.material.dispose()
      }
    }
  }

  cleanup() {
    for (const proj of this.projectiles) {
      this.scene.remove(proj.mesh)
      proj.mesh.geometry.dispose()
      if (proj.mesh.material instanceof THREE.Material) {
        proj.mesh.material.dispose()
      }
    }
    this.projectiles = []
  }

  getProjectiles(): Projectile[] {
    return this.projectiles
  }

  /**
   * Spawn a projectile from network data (multiplayer)
   */
  spawnFromNetwork(
    id: string,
    position: [number, number, number],
    velocity: [number, number, number],
    type: 'ballistic' | 'energy' | 'missile',
    ownerId: string,
    damage: number,
    isLocalPlayer: boolean
  ): Projectile {
    const geometry = this.getProjectileGeometry(type)
    const material = this.getProjectileMaterial(type, isLocalPlayer)
    const mesh = markRaw(new THREE.Mesh(geometry, material))
    const pos = new THREE.Vector3(position[0], position[1], position[2])
    mesh.position.copy(pos)
    this.scene.add(mesh)

    const projectile: Projectile = {
      id,
      type,
      position: pos,
      velocity: new THREE.Vector3(velocity[0], velocity[1], velocity[2]),
      damage,
      ownerId,
      lifetime: 5,
      mesh
    }

    this.projectiles.push(projectile)
    return projectile
  }

  /**
   * Sync projectiles from server state snapshot (multiplayer)
   * Creates new projectiles, updates existing ones, removes stale ones.
   */
  syncFromSnapshot(
    serverProjectiles: Array<{
      id: string
      position: [number, number, number]
      velocity: [number, number, number]
      ownerId: string
      type: 'ballistic' | 'energy' | 'missile'
      damage: number
    }>,
    localPlayerId: string
  ): void {
    const serverIds = new Set(serverProjectiles.map(p => p.id))

    // Remove projectiles no longer on server
    const toRemove = this.projectiles.filter(p => !serverIds.has(p.id))
    for (const proj of toRemove) {
      this.removeProjectile(proj)
    }

    // Create or update projectiles from server
    for (const sp of serverProjectiles) {
      const existing = this.projectiles.find(p => p.id === sp.id)
      if (existing) {
        // Update position and velocity from server
        existing.position.set(sp.position[0], sp.position[1], sp.position[2])
        existing.velocity.set(sp.velocity[0], sp.velocity[1], sp.velocity[2])
        existing.mesh.position.copy(existing.position)
      } else {
        // Spawn new projectile
        this.spawnFromNetwork(
          sp.id,
          sp.position,
          sp.velocity,
          sp.type,
          sp.ownerId,
          sp.damage,
          sp.ownerId === localPlayerId
        )
      }
    }
  }

  /**
   * Remove a projectile by its ID string
   */
  removeById(id: string): void {
    const proj = this.projectiles.find(p => p.id === id)
    if (proj) {
      this.removeProjectile(proj)
    }
  }
}
