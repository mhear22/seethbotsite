/**
 * State interpolation for smooth opponent rendering
 * Buffers received states and interpolates between them
 */

import { PlayerState } from '../../shared/types/NetworkMessages';
import { NETWORK, lerp } from '../../shared/constants/GameConstants';

interface BufferedState {
  state: PlayerState;
  timestamp: number;
}

export class StateInterpolation {
  private stateBuffer: BufferedState[] = [];
  private bufferDuration: number;
  private renderDelay: number;

  constructor(bufferDuration = NETWORK.INTERPOLATION_BUFFER) {
    this.bufferDuration = bufferDuration;
    this.renderDelay = bufferDuration;
  }

  /**
   * Add a new state to the buffer
   */
  public addState(state: PlayerState, serverTime: number): void {
    this.stateBuffer.push({
      state: this.cloneState(state),
      timestamp: serverTime
    });

    // Keep buffer size reasonable (max 1 second of history)
    const maxBufferSize = Math.ceil(1000 / NETWORK.SNAPSHOT_INTERVAL);
    if (this.stateBuffer.length > maxBufferSize) {
      this.stateBuffer.shift();
    }
  }

  /**
   * Get interpolated state for rendering
   * Renders the world renderDelay milliseconds in the past
   */
  public getInterpolatedState(currentTime: number): PlayerState | null {
    if (this.stateBuffer.length < 2) {
      // Not enough states to interpolate, return latest if available
      return this.stateBuffer.length > 0
        ? this.stateBuffer[this.stateBuffer.length - 1].state
        : null;
    }

    // Render time is current time minus render delay
    const renderTime = currentTime - this.renderDelay;

    // Find the two states to interpolate between
    let fromState: BufferedState | null = null;
    let toState: BufferedState | null = null;

    for (let i = 0; i < this.stateBuffer.length - 1; i++) {
      if (this.stateBuffer[i].timestamp <= renderTime &&
          this.stateBuffer[i + 1].timestamp >= renderTime) {
        fromState = this.stateBuffer[i];
        toState = this.stateBuffer[i + 1];
        break;
      }
    }

    // If we couldn't find states to interpolate between
    if (!fromState || !toState) {
      // Check if we're ahead of all buffered states (shouldn't happen often)
      if (this.stateBuffer[this.stateBuffer.length - 1].timestamp < renderTime) {
        // Use latest state (we're ahead of buffer)
        return this.stateBuffer[this.stateBuffer.length - 1].state;
      }

      // We're behind the buffer, use oldest state
      return this.stateBuffer[0].state;
    }

    // Calculate interpolation factor
    const timeDiff = toState.timestamp - fromState.timestamp;
    const t = timeDiff > 0
      ? (renderTime - fromState.timestamp) / timeDiff
      : 0;

    // Interpolate between states
    return this.interpolateStates(fromState.state, toState.state, t);
  }

  /**
   * Interpolate between two player states
   */
  private interpolateStates(from: PlayerState, to: PlayerState, t: number): PlayerState {
    // Clamp t to [0, 1]
    t = Math.max(0, Math.min(1, t));

    return {
      position: [
        lerp(from.position[0], to.position[0], t),
        lerp(from.position[1], to.position[1], t),
        lerp(from.position[2], to.position[2], t)
      ],
      rotation: [
        this.lerpAngle(from.rotation[0], to.rotation[0], t),
        this.lerpAngle(from.rotation[1], to.rotation[1], t),
        this.lerpAngle(from.rotation[2], to.rotation[2], t)
      ],
      velocity: [
        lerp(from.velocity[0], to.velocity[0], t),
        lerp(from.velocity[1], to.velocity[1], t),
        lerp(from.velocity[2], to.velocity[2], t)
      ],
      health: lerp(from.health, to.health, t),
      power: lerp(from.power, to.power, t),
      jumpFuel: lerp(from.jumpFuel, to.jumpFuel, t),
      isDashing: to.isDashing, // Use latest for boolean flags
      isJumping: to.isJumping,
      abilityActive: to.abilityActive
    };
  }

  /**
   * Interpolate angle with wrapping
   */
  private lerpAngle(from: number, to: number, t: number): number {
    // Ensure angles are in [-PI, PI] range
    from = this.normalizeAngle(from);
    to = this.normalizeAngle(to);

    // Find shortest path
    let diff = to - from;
    if (diff > Math.PI) {
      diff -= 2 * Math.PI;
    } else if (diff < -Math.PI) {
      diff += 2 * Math.PI;
    }

    return this.normalizeAngle(from + diff * t);
  }

  /**
   * Normalize angle to [-PI, PI]
   */
  private normalizeAngle(angle: number): number {
    while (angle > Math.PI) angle -= 2 * Math.PI;
    while (angle < -Math.PI) angle += 2 * Math.PI;
    return angle;
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
   * Clear the buffer
   */
  public clear(): void {
    this.stateBuffer = [];
  }

  /**
   * Get buffer size
   */
  public getBufferSize(): number {
    return this.stateBuffer.length;
  }

  /**
   * Adjust render delay dynamically based on jitter
   * Call this periodically to adapt to network conditions
   */
  public adjustRenderDelay(): void {
    if (this.stateBuffer.length < 3) return;

    // Calculate jitter (variance in arrival times)
    const intervals: number[] = [];
    for (let i = 1; i < this.stateBuffer.length; i++) {
      intervals.push(
        this.stateBuffer[i].timestamp - this.stateBuffer[i - 1].timestamp
      );
    }

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((sum, interval) => {
      return sum + Math.pow(interval - avgInterval, 2);
    }, 0) / intervals.length;
    const jitter = Math.sqrt(variance);

    // Adjust render delay: base buffer + 2x jitter
    // This ensures we have enough buffer to handle most jitter
    const targetDelay = this.bufferDuration + jitter * 2;

    // Smooth the adjustment
    this.renderDelay = lerp(this.renderDelay, targetDelay, 0.1);

    // Clamp to reasonable values
    this.renderDelay = Math.max(50, Math.min(300, this.renderDelay));
  }

  /**
   * Get current render delay
   */
  public getRenderDelay(): number {
    return this.renderDelay;
  }
}
