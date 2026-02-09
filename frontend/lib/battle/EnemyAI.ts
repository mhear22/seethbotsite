import * as THREE from 'three'
import type { MechEntity } from './MechEntity'

const ARENA_HALF = 25

type AIState = 'flank' | 'retreat' | 'aggressive' | 'chase'

export class EnemyAI {
  private state: AIState = 'flank'
  private strafeDir: number = 1
  private strafeDirTimer: number = 2 + Math.random() * 2

  /**
   * Updates enemy AI and returns whether the enemy should fire this frame.
   */
  update(enemy: MechEntity, player: MechEntity, deltaTime: number): boolean {
    const distanceToPlayer = enemy.position.distanceTo(player.position)
    const optimalRange = 15

    // Direction to player (flat)
    const dirToPlayer = player.position.clone().sub(enemy.position)
    dirToPlayer.y = 0
    dirToPlayer.normalize()

    // Face player
    enemy.rotation.y = Math.atan2(dirToPlayer.x, dirToPlayer.z)

    // Health-based state selection
    const enemyHealthPct = enemy.stats.currentHealth / enemy.stats.maxHealth
    const playerHealthPct = player.stats.currentHealth / player.stats.maxHealth

    if (enemyHealthPct < 0.3) {
      this.state = 'retreat'
    } else if (playerHealthPct < 0.3) {
      this.state = 'aggressive'
    } else if (distanceToPlayer > optimalRange + 10) {
      this.state = 'chase'
    } else {
      this.state = 'flank'
    }

    // Persistent strafe direction — hold for 2-4 seconds
    this.strafeDirTimer -= deltaTime
    if (this.strafeDirTimer <= 0) {
      this.strafeDir *= -1
      this.strafeDirTimer = 2 + Math.random() * 2
    }

    const moveSpeed = (enemy.stats.speed / 100) * 6 * deltaTime
    const strafeVec = new THREE.Vector3(-dirToPlayer.z, 0, dirToPlayer.x)
      .multiplyScalar(this.strafeDir)

    switch (this.state) {
      case 'chase': {
        // Move straight toward player
        enemy.velocity.add(dirToPlayer.clone().multiplyScalar(moveSpeed))
        break
      }

      case 'flank': {
        // Arc around player — mostly strafe with slight closing/opening
        const closingBias = distanceToPlayer > optimalRange ? 0.3 : -0.2
        const flankDir = strafeVec.clone()
          .add(dirToPlayer.clone().multiplyScalar(closingBias))
          .normalize()
        enemy.velocity.add(flankDir.multiplyScalar(moveSpeed))
        break
      }

      case 'retreat': {
        // Move away from player while still strafing
        const retreatDir = strafeVec.clone()
          .add(dirToPlayer.clone().multiplyScalar(-0.7))
          .normalize()
        enemy.velocity.add(retreatDir.multiplyScalar(moveSpeed * 1.2))
        break
      }

      case 'aggressive': {
        // Close distance quickly with slight strafe
        const aggroDir = dirToPlayer.clone()
          .add(strafeVec.clone().multiplyScalar(0.3))
          .normalize()
        enemy.velocity.add(aggroDir.multiplyScalar(moveSpeed * 1.3))
        break
      }
    }

    // Apply velocity
    enemy.position.add(enemy.velocity.clone().multiplyScalar(deltaTime))

    // Friction
    enemy.velocity.multiplyScalar(0.9)

    // Arena bounds
    enemy.position.x = Math.max(-ARENA_HALF, Math.min(ARENA_HALF, enemy.position.x))
    enemy.position.z = Math.max(-ARENA_HALF, Math.min(ARENA_HALF, enemy.position.z))

    // Fire decision — fire rate based on accuracy, higher in aggressive mode
    let fireRateMult = 1.5
    if (this.state === 'aggressive') fireRateMult = 2.5
    if (this.state === 'retreat') fireRateMult = 1.0

    const fireChance = (enemy.stats.accuracy / 100) * deltaTime * fireRateMult
    return Math.random() < fireChance && distanceToPlayer < 30
  }
}
