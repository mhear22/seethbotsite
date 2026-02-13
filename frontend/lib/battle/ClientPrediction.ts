/**
 * Client-side prediction with server reconciliation
 * Makes local movement feel instant while maintaining server authority
 */

import type { PlayerInput, PlayerState } from '@shared/types/NetworkMessages';
import { MECH, PHYSICS, ARENA } from '@shared/constants/GameConstants';



interface AABB {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
}

interface PendingInput {
  seq: number;
  input: PlayerInput;
  timestamp: number;
}

export class ClientPrediction {
  private pendingInputs: PendingInput[] = [];
  private predictedState: PlayerState;
  private lastServerState: PlayerState | null = null;
  private lastProcessedSeq = 0;
  private arenaHalfW = ARENA.WIDTH / 2;
  private arenaHalfD = ARENA.DEPTH / 2;
  private floorY = ARENA.FLOOR_Y;
  private ceilingY = ARENA.CEILING_Y;
  private buildingAABBs: AABB[] = [];

  setArenaBounds(width: number, depth: number, floorY?: number, ceilingY?: number) {
    this.arenaHalfW = width / 2;
    this.arenaHalfD = depth / 2;
    if (floorY !== undefined) this.floorY = floorY;
    if (ceilingY !== undefined) this.ceilingY = ceilingY;
  }

  /**
   * Set building AABBs for collision detection
   */
  setBuildingAABBs(aabbs: AABB[]): void {
    this.buildingAABBs = aabbs;
  }

  constructor(initialState: PlayerState) {
    this.predictedState = this.cloneState(initialState);
  }

  /**
   * Add a new input to the prediction buffer
   */
  public addInput(seq: number, input: PlayerInput): void {
    this.pendingInputs.push({
      seq,
      input: this.cloneInput(input),
      timestamp: Date.now()
    });

    // Apply input immediately for instant local response
    this.applyInput(this.predictedState, input, 1 / 60); // Assume 60fps

    // Keep buffer size reasonable (max 2 seconds)
    const maxBufferSize = 120;
    if (this.pendingInputs.length > maxBufferSize) {
      this.pendingInputs.shift();
    }
  }

  /**
   * Reconcile with server state
   * Called when receiving authoritative state from server
   */
  public reconcile(serverState: PlayerState, lastProcessedSeq: number): void {
    this.lastServerState = this.cloneState(serverState);
    this.lastProcessedSeq = lastProcessedSeq;

    // Remove acknowledged inputs
    this.pendingInputs = this.pendingInputs.filter(input => input.seq > lastProcessedSeq);

    // If no pending inputs, just use server state
    if (this.pendingInputs.length === 0) {
      this.predictedState = this.cloneState(serverState);
      return;
    }

    // Calculate position divergence
    const divergence = this.calculateDivergence(this.predictedState, serverState);

    // If divergence is small, don't reconcile (avoid jitter)
    const DIVERGENCE_THRESHOLD = 0.5; // units
    if (divergence < DIVERGENCE_THRESHOLD) {
      return;
    }

    // Significant divergence - reset to server state and replay inputs
    console.log(`[ClientPrediction] Reconciling (divergence: ${divergence.toFixed(2)})`);
    this.predictedState = this.cloneState(serverState);

    // Replay all pending inputs
    for (const pendingInput of this.pendingInputs) {
      this.applyInput(this.predictedState, pendingInput.input, 1 / 60);
    }
  }

  /**
   * Apply input to state (client-side physics simulation)
   * Should match server-side physics as closely as possible
   *
   * NOTE: These values must match PhysicsSystem.updateJumpJets() exactly
   * to prevent rubber banding during reconciliation
   */
  private applyInput(state: PlayerState, input: PlayerInput, deltaTime: number): void {
    // Calculate movement direction from input
    let moveX = 0;
    let moveZ = 0;

    if (input.forward) moveZ -= 1;
    if (input.backward) moveZ += 1;
    if (input.left) moveX -= 1;
    if (input.right) moveX += 1;

    // Normalize movement
    const moveLength = Math.sqrt(moveX * moveX + moveZ * moveZ);
    if (moveLength > 0) {
      moveX /= moveLength;
      moveZ /= moveLength;
    }

    // Apply movement speed
    const speed = state.isJumping ? MECH.AIR_MOVE_SPEED : MECH.MOVE_SPEED;
    const dashMultiplier = state.isDashing ? MECH.DASH_SPEED_MULTIPLIER : 1;

    // Rotate movement from local space to world space using mech's yaw
    const yaw = input.aimDirection
      ? Math.atan2(input.aimDirection.x, input.aimDirection.z)
      : state.rotation[1];
    const sinYaw = Math.sin(yaw);
    const cosYaw = Math.cos(yaw);
    const worldMoveX = -(moveX * cosYaw + moveZ * sinYaw);
    const worldMoveZ = -(moveZ * cosYaw - moveX * sinYaw);

    state.velocity[0] = worldMoveX * speed * dashMultiplier;
    state.velocity[2] = worldMoveZ * speed * dashMultiplier;

    // Apply gravity - MUST match server MatchInstance.updatePlayerPhysics()
    if (state.position[1] > this.floorY) {
      state.velocity[1] += PHYSICS.GRAVITY * deltaTime;
      state.velocity[1] = Math.max(state.velocity[1], PHYSICS.MAX_FALL_SPEED);
      state.isJumping = true;
    } else {
      // On ground
      state.position[1] = this.floorY;
      state.velocity[1] = 0;
      state.isJumping = false;

      // Regen jump fuel on ground - MUST match server MECH.JUMP_FUEL_REGEN (20/s)
      state.jumpFuel = Math.min(MECH.MAX_JUMP_FUEL, state.jumpFuel + MECH.JUMP_FUEL_REGEN * deltaTime);
    }

    // Handle jump - MUST match server MatchInstance exactly
    if (input.jump && !state.isJumping && state.jumpFuel > 0) {
      state.velocity[1] = MECH.JUMP_THRUST;
      state.isJumping = true;
    }

    // Consume jump fuel while jumping - MUST match server (sustained thrust)
    if (input.jump && state.isJumping && state.jumpFuel > 0) {
      state.velocity[1] = Math.max(state.velocity[1], 0); // Maintain upward velocity
      state.velocity[1] += MECH.JUMP_THRUST * 0.5 * deltaTime;
      state.jumpFuel = Math.max(0, state.jumpFuel - MECH.JUMP_FUEL_CONSUMPTION * deltaTime);
    }

    // Update position
    state.position[0] += state.velocity[0] * deltaTime;
    state.position[1] += state.velocity[1] * deltaTime;
    state.position[2] += state.velocity[2] * deltaTime;

    // Check building collisions (both landing on top and horizontal push-out)
    this.checkBuildingCollisions(state, deltaTime);

    // Clamp to arena bounds
    state.position[0] = Math.max(-this.arenaHalfW, Math.min(this.arenaHalfW, state.position[0]));
    state.position[2] = Math.max(-this.arenaHalfD, Math.min(this.arenaHalfD, state.position[2]));
    state.position[1] = Math.max(this.floorY, Math.min(this.ceilingY, state.position[1]));

    // Update rotation based on aim direction
    if (input.aimDirection) {
      const yaw = Math.atan2(input.aimDirection.x, input.aimDirection.z);
      state.rotation[1] = yaw;
    }

    // Handle dash (simplified - server handles cooldown)
    if (input.dash && !state.isDashing && state.power >= MECH.DASH_ENERGY_COST) {
      state.isDashing = true;
      state.power -= MECH.DASH_ENERGY_COST;
    }

    // Dash ends after duration (simplified)
    // Real implementation would track dash start time
    // For now, server controls this

    // Regenerate power
    state.power = Math.min(MECH.MAX_POWER, state.power + MECH.POWER_REGEN * deltaTime);
  }

  /**
   * Check building collisions - both landing on top and horizontal push-out
   * MUST match server MatchInstance.checkBuildingCollisions() behavior
   */
  private checkBuildingCollisions(state: PlayerState, deltaTime: number): void {
    if (this.buildingAABBs.length === 0) return;

    const mechRadius = 2;
    const mechHeight = 5;
    const px = state.position[0];
    const py = state.position[1];
    const pz = state.position[2];

    // Track highest surface we're standing on
    let groundY = this.floorY;

    for (const aabb of this.buildingAABBs) {
      // Check if horizontally within building bounds (with mech radius)
      const horizontallyAbove = px >= aabb.minX - mechRadius && px <= aabb.maxX + mechRadius &&
                                 pz >= aabb.minZ - mechRadius && pz <= aabb.maxZ + mechRadius;

      // Check for landing on top of building
      if (horizontallyAbove && state.velocity[1] <= 0) {
        const topSurfaceY = aabb.maxY;
        // Check if falling onto the top surface (within landing range)
        if (py >= topSurfaceY && py <= topSurfaceY + mechHeight && topSurfaceY > groundY) {
          groundY = topSurfaceY;
        }
      }

      // Horizontal push-out collision (only if inside building vertically)
      if (py + mechHeight > aabb.minY && py < aabb.maxY) {
        const closestX = Math.max(aabb.minX, Math.min(px, aabb.maxX));
        const closestZ = Math.max(aabb.minZ, Math.min(pz, aabb.maxZ));

        const dx = px - closestX;
        const dz = pz - closestZ;
        const distSq = dx * dx + dz * dz;

        if (distSq < mechRadius * mechRadius) {
          const dist = Math.sqrt(distSq);
          if (dist > 0) {
            const pushX = (dx / dist) * (mechRadius - dist);
            const pushZ = (dz / dist) * (mechRadius - dist);
            state.position[0] += pushX;
            state.position[2] += pushZ;
          } else {
            state.position[0] += mechRadius;
          }
        }
      }
    }

    // Apply ground collision for standing on buildings (in addition to floor)
    if (py <= groundY && state.velocity[1] <= 0) {
      state.position[1] = groundY;
      state.velocity[1] = 0;
      state.isJumping = false;
      // Regen jump fuel when on buildings too - same rate as floor
      state.jumpFuel = Math.min(MECH.MAX_JUMP_FUEL, state.jumpFuel + MECH.JUMP_FUEL_REGEN * deltaTime);
    }
  }

  /**
   * Calculate divergence between two states (Euclidean distance)
   */
  private calculateDivergence(state1: PlayerState, state2: PlayerState): number {
    const dx = state1.position[0] - state2.position[0];
    const dy = state1.position[1] - state2.position[1];
    const dz = state1.position[2] - state2.position[2];
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Get current predicted state
   */
  public getPredictedState(): PlayerState {
    return this.predictedState;
  }

  /**
   * Get last server state (for debugging)
   */
  public getLastServerState(): PlayerState | null {
    return this.lastServerState;
  }

  /**
   * Get number of pending inputs
   */
  public getPendingInputCount(): number {
    return this.pendingInputs.length;
  }

  /**
   * Clone a player state
   */
  private cloneState(state: PlayerState): PlayerState {
    return {
      position: [...state.position] as [number, number, number],
      rotation: [...state.rotation] as [number, number, number],
      velocity: [...state.velocity] as [number, number, number],
      health: state.health,
      power: state.power,
      jumpFuel: state.jumpFuel,
      isDashing: state.isDashing,
      isJumping: state.isJumping,
      abilityActive: state.abilityActive
    };
  }

  /**
   * Clone a player input
   */
  private cloneInput(input: PlayerInput): PlayerInput {
    return {
      forward: input.forward,
      backward: input.backward,
      left: input.left,
      right: input.right,
      jump: input.jump,
      shootLeft: input.shootLeft,
      shootRight: input.shootRight,
      dash: input.dash,
      useAbility: input.useAbility,
      aimDirection: { ...input.aimDirection }
    };
  }

  /**
   * Reset prediction state
   */
  public reset(initialState: PlayerState): void {
    this.pendingInputs = [];
    this.predictedState = this.cloneState(initialState);
    this.lastServerState = null;
    this.lastProcessedSeq = 0;
  }

  /**
   * Clear pending inputs (useful when respawning or teleporting)
   */
  public clearPendingInputs(): void {
    this.pendingInputs = [];
  }
}
