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

  fireWeapon(mech: MechEntity, targetDirection: THREE.Vector3): Projectile {
    const weaponType = mech.isPlayer
      ? (mech.loadout.leftArm?.weaponType || 'ballistic')
      : 'ballistic'

    // Calculate damage based on firepower stat
    const baseDamage = Math.max(5, mech.stats.firepower / 10)

    // Accuracy affects spread
    const accuracyFactor = Math.max(0.1, Math.min(1, mech.stats.accuracy / 100))
    const spread = (1 - accuracyFactor) * 0.15
    const direction = targetDirection.clone().add(
      new THREE.Vector3(
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * spread
      )
    ).normalize()

    // Spawn position slightly in front of mech
    const spawnPosition = mech.position.clone().add(
      mech.getForwardDirection().multiplyScalar(2)
    )
    spawnPosition.y += 2 // Fire from chest height

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
    return projectile
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
        return 80 // Fast
      case 'missile':
        return 50 // Medium
      default: // ballistic
        return 60 // Fast
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

        // Simple sphere collision
        const distance = proj.position.distanceTo(mech.position)
        const hitRadius = 2 // Mech collision radius

        if (distance < hitRadius) {
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
}
