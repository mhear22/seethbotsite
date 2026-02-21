import * as THREE from 'three'
import type { MechEntity } from './MechEntity'
import { JUMP_VELOCITY_BASE, JUMP_VELOCITY_JETS } from './constants'

type AIState = 'flank' | 'retreat' | 'aggressive' | 'chase'

export class EnemyAI {
  private state: AIState = 'flank'
  private strafeDir: number = 1
  private strafeDirTimer: number = 2 + Math.random() * 2

  // Arena bounds — set by BattleScene to match the actual map
  private arenaHalf: number = 100

  // Waypoint roaming — pick spots around the arena to keep moving
  private waypoint: THREE.Vector3 = new THREE.Vector3()
  private waypointTimer: number = 0

  // Jump cooldown — only jump evasively, not constantly
  private jumpCooldown: number = 6 + Math.random() * 4

  constructor() {
    this.pickNewWaypoint(new THREE.Vector3())
  }

  setArenaBounds(halfWidth: number, halfDepth: number): void {
    this.arenaHalf = Math.min(halfWidth, halfDepth)
  }

  private pickNewWaypoint(_currentPos: THREE.Vector3): void {
    // Pick a random point spread across most of the arena
    const angle = Math.random() * Math.PI * 2
    const dist = this.arenaHalf * 0.4 + Math.random() * this.arenaHalf * 0.5
    this.waypoint.set(
      Math.cos(angle) * dist,
      0,
      Math.sin(angle) * dist,
    )
    // Hold waypoint for 3–6 seconds before picking a new one
    this.waypointTimer = 3 + Math.random() * 3
  }

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

    // Strafe direction — flip every 2–4 seconds
    this.strafeDirTimer -= deltaTime
    if (this.strafeDirTimer <= 0) {
      this.strafeDir *= -1
      this.strafeDirTimer = 2 + Math.random() * 2
    }

    // Waypoint roaming — tick down and pick a new destination periodically
    this.waypointTimer -= deltaTime
    if (this.waypointTimer <= 0) {
      this.pickNewWaypoint(enemy.position)
    }

    // Match player physics: targetSpeed = 8 * speedStat * weightFactor
    const speedStat = Math.max(10, enemy.stats.speed) / 100
    const weightFactor = enemy.weightPenalty
    const maxSpeed = 8 * speedStat * weightFactor
    const accel = 60 * weightFactor // units/s² — same as PhysicsSystem

    const strafeVec = new THREE.Vector3(-dirToPlayer.z, 0, dirToPlayer.x)
      .multiplyScalar(this.strafeDir)

    // Compute a desired move direction that blends combat intent with roaming
    let combatDir = new THREE.Vector3()

    switch (this.state) {
      case 'chase': {
        combatDir = dirToPlayer.clone()
        break
      }
      case 'flank': {
        const closingBias = distanceToPlayer > optimalRange ? 0.3 : -0.2
        combatDir = strafeVec.clone()
          .add(dirToPlayer.clone().multiplyScalar(closingBias))
          .normalize()
        break
      }
      case 'retreat': {
        combatDir = strafeVec.clone()
          .add(dirToPlayer.clone().multiplyScalar(-0.7))
          .normalize()
        break
      }
      case 'aggressive': {
        combatDir = dirToPlayer.clone()
          .add(strafeVec.clone().multiplyScalar(0.3))
          .normalize()
        break
      }
    }

    // Direction toward the current roam waypoint
    const toWaypoint = this.waypoint.clone().sub(enemy.position)
    toWaypoint.y = 0
    const distToWaypoint = toWaypoint.length()
    const waypointDir = distToWaypoint > 0.5 ? toWaypoint.clone().normalize() : new THREE.Vector3()

    // Blend: combat-heavy when engaged, waypoint-heavy when at ideal range
    // This ensures the AI keeps moving around the map even while fighting
    const roamBlend = this.state === 'chase' ? 0.2 : 0.5
    const desiredDir = combatDir.clone()
      .multiplyScalar(1 - roamBlend)
      .add(waypointDir.clone().multiplyScalar(roamBlend))

    if (desiredDir.lengthSq() > 0.001) desiredDir.normalize()

    // Accelerate toward desired direction (horizontal only)
    enemy.velocity.x += desiredDir.x * accel * deltaTime
    enemy.velocity.z += desiredDir.z * accel * deltaTime

    // Clamp horizontal speed
    const hSpeed = Math.sqrt(enemy.velocity.x ** 2 + enemy.velocity.z ** 2)
    const speedMult = this.state === 'retreat' ? 1.2 : this.state === 'aggressive' ? 1.15 : 1.0
    const cap = maxSpeed * speedMult
    if (hSpeed > cap) {
      enemy.velocity.x = (enemy.velocity.x / hSpeed) * cap
      enemy.velocity.z = (enemy.velocity.z / hSpeed) * cap
    }

    // --- Evasive jump ---
    // Jump when the player is close and aiming at us, or when retreating
    this.jumpCooldown -= deltaTime
    if (this.jumpCooldown <= 0 && !enemy.isJumping) {
      // Estimate if player is aimed toward us
      const playerLookDir = new THREE.Vector3(
        Math.sin(player.rotation.y),
        0,
        Math.cos(player.rotation.y),
      )
      const playerToEnemy = enemy.position.clone().sub(player.position)
      playerToEnemy.y = 0
      playerToEnemy.normalize()
      const aimDot = playerLookDir.dot(playerToEnemy)

      const isBeingAimedAt = aimDot > 0.85 && distanceToPlayer < 15
      const isRetreating = this.state === 'retreat' && distanceToPlayer < 20

      if (isBeingAimedAt || isRetreating) {
        const hasJumpJets = enemy.loadout.rack?.id === 'rack-jump-jets'
        enemy.velocity.y = hasJumpJets ? JUMP_VELOCITY_JETS * enemy.weightPenalty : JUMP_VELOCITY_BASE * enemy.weightPenalty
        enemy.isJumping = true
      }

      // Reset cooldown whether we jumped or not — check again in 3–6s
      this.jumpCooldown = 6 + Math.random() * 4
    }

    // Gravity and landing
    if (enemy.position.y > 0 || enemy.velocity.y > 0) {
      enemy.velocity.y -= 50 * deltaTime
      enemy.position.y += enemy.velocity.y * deltaTime
    }
    if (enemy.position.y <= 0) {
      enemy.position.y = 0
      enemy.velocity.y = 0
      enemy.isJumping = false
    }

    // Apply horizontal movement
    enemy.position.x += enemy.velocity.x * deltaTime
    enemy.position.z += enemy.velocity.z * deltaTime

    // Frame-rate independent friction
    const friction = Math.exp(-6 * deltaTime)
    enemy.velocity.x *= friction
    enemy.velocity.z *= friction

    // Arena bounds
    enemy.position.x = Math.max(-this.arenaHalf, Math.min(this.arenaHalf, enemy.position.x))
    enemy.position.z = Math.max(-this.arenaHalf, Math.min(this.arenaHalf, enemy.position.z))

    // Fire decision
    let fireRateMult = 1.5
    if (this.state === 'aggressive') fireRateMult = 2.5
    if (this.state === 'retreat') fireRateMult = 1.0

    const fireChance = (enemy.stats.accuracy / 100) * deltaTime * fireRateMult
    return Math.random() < fireChance && distanceToPlayer < 30
  }
}
