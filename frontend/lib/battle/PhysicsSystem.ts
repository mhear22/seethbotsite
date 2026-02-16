import * as THREE from 'three'
import type { MechEntity } from './MechEntity'
import type { InputState } from './InputManager'
import { JUMP_VELOCITY_BASE, JUMP_VELOCITY_JETS } from './constants'

export class PhysicsSystem {
  public speedMultiplier = 1.0
  private arenaHalfW = 150
  private arenaHalfD = 150

  setArenaBounds(width: number, depth: number) {
    this.arenaHalfW = width / 2
    this.arenaHalfD = depth / 2
  }

  updateMovement(mech: MechEntity, input: InputState, deltaTime: number) {
    // Get leg type for special handling
    const legType = mech.loadout.legs?.mobilityType || 'bipedal'

    // Calculate base speed with weight penalty
    const speedStat = Math.max(10, mech.stats.speed) / 100
    const weightFactor = mech.weightPenalty // 0.5 to 1.0
    const targetSpeed = 8 * this.speedMultiplier * speedStat * weightFactor

    // Acceleration rate (units/s²) - how fast we reach target speed
    const accelRate = 60 * weightFactor

    // Get movement directions relative to camera view
    const forward = new THREE.Vector3(0, 0, 1)
    const right = new THREE.Vector3(1, 0, 0)

    // Apply rotation to get world-space directions
    forward.applyEuler(mech.rotation)
    right.applyEuler(mech.rotation)

    // Leg-specific modifiers
    // frictionRate: higher = stops faster. Expressed as decay per second.
    let frictionRate = 8.0
    let backwardSpeedPenalty = 0.6
    let blockJump = false

    switch (legType) {
      case 'tracked':
        frictionRate = 8.0
        blockJump = true
        break

      case 'hover':
        frictionRate = 2.0 // Slides more
        // Oscillate vertically for hover effect
        mech.position.y += Math.sin(performance.now() * 0.003) * 0.15 * deltaTime
        break

      case 'quadrupedal':
        frictionRate = 6.0
        backwardSpeedPenalty = 0.8
        break

      case 'bipedal':
      default:
        frictionRate = 8.0
        break
    }

    // Block jump if tracked legs
    if (blockJump && input.jump) {
      input = { ...input, jump: false }
    }

    // Calculate desired movement direction
    const moveDir = new THREE.Vector3()
    if (input.forward) moveDir.add(forward)
    if (input.backward) moveDir.add(forward.clone().multiplyScalar(-backwardSpeedPenalty))
    if (input.left) moveDir.add(right)
    if (input.right) moveDir.sub(right)

    if (moveDir.lengthSq() > 0) {
      moveDir.normalize()
      // Accelerate toward target velocity (frame-rate independent)
      const targetVel = moveDir.multiplyScalar(targetSpeed)
      const diffX = targetVel.x - mech.velocity.x
      const diffZ = targetVel.z - mech.velocity.z
      const step = accelRate * deltaTime
      mech.velocity.x += Math.sign(diffX) * Math.min(Math.abs(diffX), step)
      mech.velocity.z += Math.sign(diffZ) * Math.min(Math.abs(diffZ), step)
    } else {
      // No input: apply friction (frame-rate independent exponential decay)
      const frictionFactor = Math.exp(-frictionRate * deltaTime)
      mech.velocity.x *= frictionFactor
      mech.velocity.z *= frictionFactor
    }

    // Apply velocity to position
    mech.position.add(mech.velocity.clone().multiplyScalar(deltaTime))

    // Clamp to arena bounds
    mech.position.x = Math.max(-this.arenaHalfW, Math.min(this.arenaHalfW, mech.position.x))
    mech.position.z = Math.max(-this.arenaHalfD, Math.min(this.arenaHalfD, mech.position.z))
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

      // Dash speed and cooldown affected by weight
      const dashSpeed = 30 * (1.0 + mech.weightPenalty) // Light mechs dash faster
      const dashCooldown = 2.0 * (2.0 - mech.weightPenalty) // Heavy mechs have longer cooldown

      mech.velocity.copy(dashDir.multiplyScalar(dashSpeed))
      mech.isDashing = true
      mech.dashTimer = mech.DASH_DURATION
      mech.dashCooldown = dashCooldown
    }
  }

  updateJumpJets(mech: MechEntity, input: InputState, deltaTime: number) {
    const hasJumpJets = mech.loadout.rack?.id === 'rack-jump-jets'
    const legType = mech.loadout.legs?.mobilityType || 'bipedal'

    // Tracked legs can't jump
    if (legType === 'tracked') {
      input = { ...input, jump: false }
    }

    // Basic jump for all mechs (no jets required)
    if (input.jump && !mech.isJumping) {
      const jumpVelocity = hasJumpJets ? JUMP_VELOCITY_JETS * mech.weightPenalty : JUMP_VELOCITY_BASE * mech.weightPenalty
      mech.velocity.y = jumpVelocity
      mech.isJumping = true
    }

    // Apply gravity (increased for faster falling)
    if (mech.position.y > 0 || mech.velocity.y > 0) {
      mech.velocity.y -= 50 * deltaTime // Stronger gravity for faster falling
      mech.position.y += mech.velocity.y * deltaTime

      // Consume jump fuel while airborne and ascending (jump jets only)
      if (hasJumpJets && mech.isJumping && mech.velocity.y > 0) {
        const fuelConsumption = 30 * (2.0 - mech.weightPenalty) // Heavy = 45/s, Light = 30/s
        mech.jumpFuel -= deltaTime * fuelConsumption
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
    }

    // Recharge fuel whenever grounded (y=0 or landed on building top last frame)
    if (!mech.isJumping && hasJumpJets) {
      mech.jumpFuel = Math.min(mech.stats.energy, mech.jumpFuel + deltaTime * 15)
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
