import * as THREE from 'three'
import type { MechEntity } from './MechEntity'
import type { InputState } from './InputManager'
import {
  JUMP_VELOCITY_BASE,
  JUMP_VELOCITY_JETS,
  MOVEMENT,
  WEIGHT_MOVEMENT,
  LEG_MODIFIERS,
  DASH,
  BOOST,
  JUMP,
  FOOTFALL,
} from './constants'

export class PhysicsSystem {
  public speedMultiplier = 1.0
  private arenaHalfW: number = MOVEMENT.DEFAULT_ARENA_HALF
  private arenaHalfD: number = MOVEMENT.DEFAULT_ARENA_HALF

  /**
   * When true, dashing and boosting spend `mech.currentPower` (the single
   * combat economy) and are blocked when the bar is empty. Single-player scenes
   * leave this on. Multiplayer should set it false — power is server-authoritative
   * there and local gating would fight reconciliation. See report notes.
   */
  public powerEconomyEnabled = true

  /**
   * Footfall / landing feedback hooks. The scene wires these to the camera (or
   * audio / particles). `intensity` is a 0..~1.5 magnitude already scaled by the
   * mech's weight class, so a heavy mech shakes harder per step and SLAMS on
   * landing. Default no-op so multiplayer / headless callers are unaffected.
   */
  public onFootstep: ((intensity: number) => void) | null = null
  public onLanding: ((intensity: number) => void) | null = null

  // Footstep cadence accumulator (player instance only — enemies use EnemyAI).
  private footstepAccumulator = 0

  /**
   * Ground height at a world (x, z). Defaults to a flat floor at y = 0 (battle
   * arenas); the story overworld supplies a terrain heightfield so mechs walk
   * on the procedurally-generated hills.
   */
  private groundHeightAt: (x: number, z: number) => number = () => 0

  setArenaBounds(width: number, depth: number) {
    this.arenaHalfW = width / 2
    this.arenaHalfD = depth / 2
  }

  /** Supply a ground-height function (e.g. from procedural terrain). */
  setGroundHeightProvider(fn: (x: number, z: number) => number) {
    this.groundHeightAt = fn
  }

  updateMovement(mech: MechEntity, input: InputState, deltaTime: number): boolean {
    // Get leg type for special handling
    const legType = mech.loadout.legs?.mobilityType || 'bipedal'
    const legMod = LEG_MODIFIERS[legType] ?? LEG_MODIFIERS.bipedal

    // Calculate base speed with weight penalty. Steady-state top speed is
    // intentionally left on the shared formula so MP reconciliation stays matched.
    const speedStat = Math.max(10, mech.stats.speed) / 100
    const weightFactor = mech.weightPenalty // 0.5 to 1.0
    const baseSpeed = MOVEMENT.BASE_SPEED_FACTOR * this.speedMultiplier * speedStat * weightFactor

    // Boost drains power and cuts out when the bar is empty (the resource layer).
    let boosting = input.useAbility
    if (boosting && this.powerEconomyEnabled) {
      if (mech.currentPower > 0) {
        mech.currentPower = Math.max(0, mech.currentPower - BOOST.POWER_DRAIN * deltaTime)
      } else {
        boosting = false // out of power — no boost this frame
      }
    }
    const targetSpeed = boosting ? baseSpeed * MOVEMENT.BOOST_MULTIPLIER : baseSpeed

    // Momentum by weight class: heavier mechs spool up slower (lower accel) and
    // coast further (lower friction). Leg type layers a friction multiplier on
    // top (hover slides, tracked grips).
    const weightCurve = WEIGHT_MOVEMENT[mech.weightClass] ?? WEIGHT_MOVEMENT.medium
    const accelRate = weightCurve.accel
    const frictionRate = weightCurve.friction * legMod.frictionMult
    const backwardSpeedPenalty = legMod.backwardPenalty

    // Get movement directions relative to camera view
    const forward = new THREE.Vector3(0, 0, 1)
    const right = new THREE.Vector3(1, 0, 0)

    // Apply rotation to get world-space directions
    forward.applyEuler(mech.rotation)
    right.applyEuler(mech.rotation)

    // Hover legs oscillate vertically for effect
    if (legType === 'hover') {
      mech.position.y += Math.sin(performance.now() * 0.003) * 0.15 * deltaTime
    }

    // Block jump if tracked legs
    if (legMod.blockJump && input.jump) {
      input = { ...input, jump: false }
    }

    // Calculate desired movement direction
    const moveDir = new THREE.Vector3()
    if (input.forward) moveDir.add(forward)
    if (input.backward) moveDir.add(forward.clone().multiplyScalar(-backwardSpeedPenalty))
    if (input.left) moveDir.add(right)
    if (input.right) moveDir.sub(right)

    let counterBoostImpact = false

    if (moveDir.lengthSq() > 0) {
      moveDir.normalize()

      // Detect counter-boost: boosting hard against current velocity.
      if (boosting) {
        const currentHorizVel = new THREE.Vector3(mech.velocity.x, 0, mech.velocity.z)
        if (
          currentHorizVel.length() > BOOST.COUNTER_MIN_SPEED &&
          moveDir.dot(currentHorizVel.normalize()) < BOOST.COUNTER_DOT_THRESHOLD
        ) {
          counterBoostImpact = true
        }
      }

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

    // Counter-boost juke: a hard reverse-boost brakes momentum (breaks pursuit)
    // and costs a chunk of power on top of the drain. The scene turns the flag
    // into a screen-shake "brake" + thruster flare. The velocity brake is gated
    // on the power economy: in multiplayer (powerEconomyEnabled === false) movement
    // is server-authoritative and gets overwritten each snapshot, so braking the
    // local velocity here would only rubber-band. The flag still returns for the
    // (purely cosmetic) camera shake in every mode.
    if (counterBoostImpact && this.powerEconomyEnabled) {
      mech.velocity.x *= 1 - BOOST.COUNTER_BRAKE
      mech.velocity.z *= 1 - BOOST.COUNTER_BRAKE
      mech.currentPower = Math.max(0, mech.currentPower - BOOST.COUNTER_POWER_COST)
    }

    // Apply velocity to position
    mech.position.add(mech.velocity.clone().multiplyScalar(deltaTime))

    // Clamp to arena bounds
    mech.position.x = Math.max(-this.arenaHalfW, Math.min(this.arenaHalfW, mech.position.x))
    mech.position.z = Math.max(-this.arenaHalfD, Math.min(this.arenaHalfD, mech.position.z))

    // Footfall cadence: while grounded and moving, fire a weight-scaled footstep
    // on a speed-driven interval (faster movement = quicker steps).
    this.updateFootsteps(mech, deltaTime)

    // Expose resolved boost state (after the power-out cutout) so the firing
    // path can suppress fire while boosting (design §3.1: "cannot fire while
    // boosting"). Reads on MechEntity keep the scene/StoryCombat decoupled.
    mech.isBoosting = boosting

    return counterBoostImpact
  }

  /**
   * Advance the footstep timer and fire onFootstep when a stride completes.
   * Grounded is approximated by !isJumping (updateJumpJets runs after this and
   * owns the airborne state); enemies never call updateMovement so this is the
   * player's cadence only.
   */
  private updateFootsteps(mech: MechEntity, deltaTime: number) {
    const speed = Math.sqrt(mech.velocity.x ** 2 + mech.velocity.z ** 2)
    if (mech.isJumping || speed < FOOTFALL.MIN_STEP_SPEED) {
      // Reset toward "about to step" so the first step after moving lands quickly.
      this.footstepAccumulator = FOOTFALL.MAX_STEP_INTERVAL
      return
    }

    const interval = Math.max(
      FOOTFALL.MIN_STEP_INTERVAL,
      Math.min(FOOTFALL.MAX_STEP_INTERVAL, FOOTFALL.STRIDE_LENGTH / speed),
    )
    this.footstepAccumulator += deltaTime
    if (this.footstepAccumulator >= interval) {
      this.footstepAccumulator -= interval
      if (this.onFootstep) {
        const base = FOOTFALL.STEP_INTENSITY[mech.weightClass] ?? FOOTFALL.STEP_INTENSITY.medium
        // Slightly stronger footfalls at higher speed.
        const speedScale = 0.6 + 0.4 * Math.min(1, speed / 12)
        this.onFootstep(base * speedScale)
      }
    }
  }

  // Returns true if a new dash was just initiated this frame
  updateDash(mech: MechEntity, input: InputState, deltaTime: number): boolean {
    // Tick cooldown
    if (mech.dashCooldown > 0) {
      mech.dashCooldown -= deltaTime
    }

    // Currently dashing — count down timer and apply dash velocity to position
    if (mech.isDashing) {
      mech.dashTimer -= deltaTime
      if (mech.dashTimer <= 0) {
        mech.isDashing = false
      } else {
        // Apply velocity and clamp bounds during active dash
        mech.position.add(mech.velocity.clone().multiplyScalar(deltaTime))
        mech.position.x = Math.max(-this.arenaHalfW, Math.min(this.arenaHalfW, mech.position.x))
        mech.position.z = Math.max(-this.arenaHalfD, Math.min(this.arenaHalfD, mech.position.z))
      }
      return false
    }

    // Initiate dash — costs power (the dodge is the skill verb, and it spends
    // the combat economy so it can't be spammed while firing).
    const hasPower = !this.powerEconomyEnabled || mech.currentPower >= DASH.POWER_COST
    if (input.dash && mech.dashCooldown <= 0 && hasPower) {
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
      const dashSpeed = DASH.SPEED_BASE + DASH.SPEED_WEIGHT_BONUS * mech.weightPenalty // Light mechs dash faster
      const dashCooldown = DASH.COOLDOWN_BASE * (DASH.COOLDOWN_WEIGHT_OFFSET - mech.weightPenalty) // Heavy mechs have longer cooldown

      mech.velocity.copy(dashDir.multiplyScalar(dashSpeed))
      mech.isDashing = true
      mech.dashTimer = mech.DASH_DURATION
      mech.dashCooldown = dashCooldown
      if (this.powerEconomyEnabled) {
        mech.currentPower = Math.max(0, mech.currentPower - DASH.POWER_COST)
      }
      return true // Signal that dash just started
    }

    return false
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
      let jumpVelocity = hasJumpJets ? JUMP_VELOCITY_JETS * mech.weightPenalty : JUMP_VELOCITY_BASE * mech.weightPenalty
      // Jump-jets rack ability: while its boost window is open, launch harder —
      // this is the "boosted jump" the ability advertises (design §3.4). Without
      // this the rack ability only refilled fuel and the extra lift was inert.
      if (mech.jumpBoostTimer > 0) jumpVelocity *= JUMP.BOOST_MULTIPLIER
      mech.velocity.y = jumpVelocity
      mech.isJumping = true
    }

    // Ground height beneath the mech (terrain in the overworld, else y = 0).
    const groundY = this.groundHeightAt(mech.position.x, mech.position.z)
    const aboveGround = mech.position.y - groundY

    // "Airborne" means genuinely off the surface: mid-jump, still rising, or far
    // enough above the ground to have walked off a ledge. Otherwise the mech is
    // grounded and simply hugs the terrain — this keeps walking over rolling
    // hills smooth instead of falling-and-snapping every frame on a downslope.
    const airborne = mech.isJumping || mech.velocity.y > 0 || aboveGround > MOVEMENT.GROUND_STICK_DISTANCE

    if (airborne) {
      // Apply gravity (increased for faster falling)
      mech.velocity.y -= JUMP.GRAVITY * deltaTime
      mech.position.y += mech.velocity.y * deltaTime

      // Consume jump fuel while airborne and ascending (jump jets only)
      if (hasJumpJets && mech.isJumping && mech.velocity.y > 0) {
        const fuelConsumption = JUMP.FUEL_CONSUMPTION_BASE * (2.0 - mech.weightPenalty) // Heavy = 45/s, Light = 30/s
        mech.jumpFuel -= deltaTime * fuelConsumption
        if (mech.jumpFuel < 0) {
          mech.jumpFuel = 0
        }
      }

      // Land when we reach the surface.
      if (mech.position.y <= groundY) {
        // Capture impact BEFORE zeroing — a fast downward landing SLAMS.
        const impactSpeed = Math.max(0, -mech.velocity.y)
        mech.position.y = groundY
        mech.velocity.y = 0
        mech.isJumping = false
        this.emitLanding(mech, impactSpeed)
      }
    } else {
      // Grounded: stick to the terrain surface (smoothly follows slopes up/down).
      mech.position.y = groundY
      mech.velocity.y = 0
      mech.isJumping = false
    }

    // Recharge fuel whenever grounded (y=0 or landed on building top last frame)
    if (!mech.isJumping && hasJumpJets) {
      mech.jumpFuel = Math.min(mech.stats.energy, mech.jumpFuel + deltaTime * JUMP.FUEL_REGEN)
    }
  }

  /** Fire the landing hook with a weight-scaled intensity if the impact is hard enough. */
  private emitLanding(mech: MechEntity, impactSpeed: number) {
    if (!this.onLanding || impactSpeed < FOOTFALL.MIN_LANDING_IMPACT) return
    const norm = Math.min(1, impactSpeed / FOOTFALL.LANDING_REFERENCE_IMPACT)
    const weightMult = FOOTFALL.LANDING_INTENSITY[mech.weightClass] ?? FOOTFALL.LANDING_INTENSITY.medium
    this.onLanding(norm * weightMult)
  }
}
