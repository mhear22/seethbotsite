import * as THREE from 'three'
import type { MechEntity } from './MechEntity'
import type { InputState } from './InputManager'

const ARENA_SIZE = 50
const ARENA_HALF = ARENA_SIZE / 2

export class PhysicsSystem {
  public speedMultiplier = 1.0

  updateMovement(mech: MechEntity, input: InputState, deltaTime: number) {
    // Calculate base speed from stats
    const baseSpeed = 8 * this.speedMultiplier * (Math.max(10, mech.stats.speed) / 100)

    // Get movement directions relative to camera view
    const forward = new THREE.Vector3(0, 0, 1)
    const right = new THREE.Vector3(1, 0, 0)

    // Apply rotation to get world-space directions
    forward.applyEuler(mech.rotation)
    right.applyEuler(mech.rotation)

    // WASD movement - add acceleration to velocity
    if (input.forward) {
      mech.velocity.add(forward.clone().multiplyScalar(baseSpeed))
    }
    if (input.backward) {
      mech.velocity.add(forward.clone().multiplyScalar(-baseSpeed))
    }
    if (input.left) {
      mech.velocity.add(right.clone().multiplyScalar(baseSpeed))
    }
    if (input.right) {
      mech.velocity.add(right.clone().multiplyScalar(-baseSpeed))
    }

    // Apply velocity to position with deltaTime
    mech.position.add(mech.velocity.clone().multiplyScalar(deltaTime))

    // Apply friction (ground) - tighter control
    mech.velocity.multiplyScalar(0.75)

    // Clamp to arena bounds
    mech.position.x = Math.max(-ARENA_HALF, Math.min(ARENA_HALF, mech.position.x))
    mech.position.z = Math.max(-ARENA_HALF, Math.min(ARENA_HALF, mech.position.z))
  }

  updateDash(mech: MechEntity, input: InputState, deltaTime: number) {
    // Tick cooldown
    if (mech.dashCooldown > 0) {
      mech.dashCooldown -= deltaTime
    }

    // Currently dashing — count down timer
    if (mech.isDashing) {
      mech.dashTimer -= deltaTime
      if (mech.dashTimer <= 0) {
        mech.isDashing = false
      }
      return // Skip normal movement during dash
    }

    // Initiate dash
    if (input.dash && mech.dashCooldown <= 0) {
      // Determine dash direction from input, or forward by default
      const forward = new THREE.Vector3(0, 0, 1).applyEuler(mech.rotation)
      const right = new THREE.Vector3(1, 0, 0).applyEuler(mech.rotation)
      const dashDir = new THREE.Vector3()

      if (input.forward) dashDir.add(forward)
      if (input.backward) dashDir.sub(forward)
      if (input.left) dashDir.sub(right)
      if (input.right) dashDir.add(right)

      if (dashDir.lengthSq() < 0.01) {
        dashDir.copy(forward) // Default: dash forward
      }
      dashDir.normalize()

      mech.velocity.copy(dashDir.multiplyScalar(30))
      mech.isDashing = true
      mech.dashTimer = mech.DASH_DURATION
      mech.dashCooldown = mech.DASH_COOLDOWN
    }
  }

  updateJumpJets(mech: MechEntity, input: InputState, deltaTime: number) {
    const hasJumpJets = mech.loadout.rack?.id === 'rack-jump-jets'

    // Jump jet activation
    if (input.jump && mech.jumpFuel > 0 && !mech.isJumping && hasJumpJets) {
      mech.velocity.y = 12 // Initial upward velocity
      mech.isJumping = true
    }

    // Apply gravity
    if (mech.position.y > 0 || mech.velocity.y > 0) {
      mech.velocity.y -= 20 * deltaTime // Gravity
      mech.position.y += mech.velocity.y * deltaTime

      // Consume jump fuel while airborne and ascending
      if (mech.isJumping && mech.velocity.y > 0) {
        mech.jumpFuel -= deltaTime * 30
        if (mech.jumpFuel < 0) {
          mech.jumpFuel = 0
        }
      }
    }

    // Ground check
    if (mech.position.y <= 0) {
      mech.position.y = 0
      mech.velocity.y = 0
      mech.isJumping = false

      // Recharge fuel on ground
      if (hasJumpJets) {
        mech.jumpFuel = Math.min(mech.stats.energy, mech.jumpFuel + deltaTime * 15)
      }
    }
  }

  updateEnemyAI(enemy: MechEntity, player: MechEntity, deltaTime: number): boolean {
    const distanceToPlayer = enemy.position.distanceTo(player.position)
    const optimalRange = 15 // Prefer mid-range combat

    // Calculate direction to player
    const directionToPlayer = player.position.clone().sub(enemy.position)
    directionToPlayer.y = 0 // Ignore vertical
    directionToPlayer.normalize()

    // Face player
    enemy.rotation.y = Math.atan2(directionToPlayer.x, directionToPlayer.z)

    // State machine
    if (distanceToPlayer > optimalRange + 8) {
      // Too far - chase player
      enemy.aiState = 'chase'
      const moveSpeed = (enemy.stats.speed / 100) * 6 * deltaTime
      enemy.velocity.add(directionToPlayer.multiplyScalar(moveSpeed))
    } else if (distanceToPlayer < optimalRange - 5) {
      // Too close - back up
      enemy.aiState = 'chase'
      const moveSpeed = (enemy.stats.speed / 100) * 4 * deltaTime
      enemy.velocity.add(directionToPlayer.multiplyScalar(-moveSpeed))
    } else {
      // Optimal range - strafe
      enemy.aiState = 'strafe'
      const strafeDirection = new THREE.Vector3(-directionToPlayer.z, 0, directionToPlayer.x)
      const strafeSpeed = (enemy.stats.speed / 100) * 3 * deltaTime

      // Randomly change strafe direction occasionally
      if (Math.random() < 0.02) {
        strafeDirection.multiplyScalar(-1)
      }

      enemy.velocity.add(strafeDirection.multiplyScalar(strafeSpeed))
    }

    // Apply velocity
    enemy.position.add(enemy.velocity.clone().multiplyScalar(deltaTime))

    // Apply friction
    enemy.velocity.multiplyScalar(0.9)

    // Clamp to arena bounds
    enemy.position.x = Math.max(-ARENA_HALF, Math.min(ARENA_HALF, enemy.position.x))
    enemy.position.z = Math.max(-ARENA_HALF, Math.min(ARENA_HALF, enemy.position.z))

    // Decide whether to shoot
    // Fire rate based on accuracy (higher accuracy = more shots)
    const fireChance = (enemy.stats.accuracy / 100) * deltaTime * 1.5
    const shouldFire = Math.random() < fireChance && distanceToPlayer < 30

    return shouldFire
  }
}
