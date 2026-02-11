/**
 * Client-side prediction with server reconciliation
 * Makes local movement feel instant while maintaining server authority
 */

import { PlayerInput, PlayerState } from '@shared/types/NetworkMessages';
import { MECH, PHYSICS, ARENA } from '@shared/constants/GameConstants';

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

    state.velocity[0] = moveX * speed * dashMultiplier;
    state.velocity[2] = moveZ * speed * dashMultiplier;

    // Apply gravity
    if (state.position[1] > ARENA.FLOOR_Y) {
      state.velocity[1] += PHYSICS.GRAVITY * deltaTime;
      state.velocity[1] = Math.max(state.velocity[1], PHYSICS.MAX_FALL_SPEED);
      state.isJumping = true;
    } else {
      // On ground
      state.position[1] = ARENA.FLOOR_Y;
      state.velocity[1] = 0;
      state.isJumping = false;

      // Regen jump fuel on ground
      state.jumpFuel = Math.min(MECH.MAX_JUMP_FUEL, state.jumpFuel + MECH.JUMP_FUEL_REGEN * deltaTime);
    }

    // Handle jump
    if (input.jump && !state.isJumping && state.jumpFuel > 0) {
      state.velocity[1] = MECH.JUMP_THRUST;
      state.isJumping = true;
    }

    // Consume jump fuel while jumping
    if (input.jump && state.isJumping && state.jumpFuel > 0) {
      state.velocity[1] = Math.max(state.velocity[1], 0);
      state.velocity[1] += MECH.JUMP_THRUST * 0.5 * deltaTime;
      state.jumpFuel = Math.max(0, state.jumpFuel - MECH.JUMP_FUEL_CONSUMPTION * deltaTime);
    }

    // Update position
    state.position[0] += state.velocity[0] * deltaTime;
    state.position[1] += state.velocity[1] * deltaTime;
    state.position[2] += state.velocity[2] * deltaTime;

    // Clamp to arena bounds
    const halfArena = ARENA.WIDTH / 2;
    state.position[0] = Math.max(-halfArena, Math.min(halfArena, state.position[0]));
    state.position[2] = Math.max(-halfArena, Math.min(halfArena, state.position[2]));
    state.position[1] = Math.max(ARENA.FLOOR_Y, Math.min(ARENA.CEILING_Y, state.position[1]));

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
