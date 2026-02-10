/**
 * Individual match instance managing game state for one 1v1 battle
 * Runs authoritative server tick loop at 20Hz
 */

import {
  PlayerState,
  ProjectileState,
  StateSnapshotMessage,
  EventMessage,
  MatchEndMessage,
  MatchStats,
  PlayerInput,
  MechLoadout
} from '../../../shared/types/NetworkMessages';
import {
  NETWORK,
  ARENA,
  MECH,
  PHYSICS
} from '../../../shared/constants/GameConstants';

interface PlayerData {
  playerId: string;
  playerName: string;
  loadout: MechLoadout;
  socket: any; // WebSocket
  state: PlayerState;
  lastInputSeq: number;
  lastInput: PlayerInput | null;
  connected: boolean;
  stats: MatchStats;
}

export type MatchState = 'COUNTDOWN' | 'ACTIVE' | 'ENDING' | 'ENDED';

export class MatchInstance {
  public readonly matchId: string;
  private player1: PlayerData;
  private player2: PlayerData;
  private matchState: MatchState = 'COUNTDOWN';
  private projectiles: Map<string, ProjectileState> = new Map();
  private tickInterval: NodeJS.Timeout | null = null;
  private serverTime: number = Date.now();
  private countdownRemaining: number = 3;
  private onMatchEndCallback: ((matchId: string) => void) | null = null;

  constructor(
    matchId: string,
    player1Id: string,
    player1Name: string,
    player1Loadout: MechLoadout,
    player1Socket: any,
    player2Id: string,
    player2Name: string,
    player2Loadout: MechLoadout,
    player2Socket: any
  ) {
    this.matchId = matchId;

    // Initialize player 1
    const spawn1 = this.generateSpawnPosition(0);
    this.player1 = {
      playerId: player1Id,
      playerName: player1Name,
      loadout: player1Loadout,
      socket: player1Socket,
      state: this.createInitialState(spawn1),
      lastInputSeq: 0,
      lastInput: null,
      connected: true,
      stats: this.createInitialStats()
    };

    // Initialize player 2
    const spawn2 = this.generateSpawnPosition(Math.PI);
    this.player2 = {
      playerId: player2Id,
      playerName: player2Name,
      loadout: player2Loadout,
      socket: player2Socket,
      state: this.createInitialState(spawn2),
      lastInputSeq: 0,
      lastInput: null,
      connected: true,
      stats: this.createInitialStats()
    };

    console.log(`[Match ${matchId}] Created: ${player1Name} vs ${player2Name}`);
  }

  /**
   * Start the match with countdown
   */
  public start(): void {
    console.log(`[Match ${this.matchId}] Starting countdown...`);

    // Send match_start to both players
    this.broadcast({
      type: 'match_start',
      countdown: this.countdownRemaining
    });

    // Start countdown timer
    const countdownInterval = setInterval(() => {
      this.countdownRemaining--;

      if (this.countdownRemaining > 0) {
        this.broadcast({
          type: 'match_start',
          countdown: this.countdownRemaining
        });
      } else {
        clearInterval(countdownInterval);
        this.matchState = 'ACTIVE';
        console.log(`[Match ${this.matchId}] Match started!`);
        this.startGameLoop();
      }
    }, 1000);
  }

  /**
   * Start the main game loop at 20Hz
   */
  private startGameLoop(): void {
    this.tickInterval = setInterval(() => {
      this.tick();
    }, NETWORK.SNAPSHOT_INTERVAL);
  }

  /**
   * Main game tick - update physics and send state snapshot
   */
  private tick(): void {
    this.serverTime = Date.now();

    // Update player physics based on last input
    this.updatePlayerPhysics(this.player1);
    this.updatePlayerPhysics(this.player2);

    // Update projectiles (Phase 3)
    // this.updateProjectiles();

    // Send state snapshot to both players
    this.sendStateSnapshot();
  }

  /**
   * Update player physics based on input
   */
  private updatePlayerPhysics(player: PlayerData): void {
    if (!player.lastInput) return;

    const input = player.lastInput;
    const state = player.state;
    const dt = NETWORK.SNAPSHOT_INTERVAL / 1000; // Convert to seconds

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
      state.velocity[1] += PHYSICS.GRAVITY * dt;
      state.velocity[1] = Math.max(state.velocity[1], PHYSICS.MAX_FALL_SPEED);
      state.isJumping = true;
    } else {
      // On ground
      state.position[1] = ARENA.FLOOR_Y;
      state.velocity[1] = 0;
      state.isJumping = false;

      // Regen jump fuel on ground
      state.jumpFuel = Math.min(MECH.MAX_JUMP_FUEL, state.jumpFuel + MECH.JUMP_FUEL_REGEN * dt);
    }

    // Handle jump
    if (input.jump && !state.isJumping && state.jumpFuel > 0) {
      state.velocity[1] = MECH.JUMP_THRUST;
      state.isJumping = true;
    }

    // Consume jump fuel while jumping
    if (input.jump && state.isJumping && state.jumpFuel > 0) {
      state.velocity[1] = Math.max(state.velocity[1], 0); // Maintain upward velocity
      state.velocity[1] += MECH.JUMP_THRUST * 0.5 * dt;
      state.jumpFuel = Math.max(0, state.jumpFuel - MECH.JUMP_FUEL_CONSUMPTION * dt);
    }

    // Update position
    state.position[0] += state.velocity[0] * dt;
    state.position[1] += state.velocity[1] * dt;
    state.position[2] += state.velocity[2] * dt;

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

    // Regenerate power
    state.power = Math.min(MECH.MAX_POWER, state.power + MECH.POWER_REGEN * dt);
  }

  /**
   * Send state snapshot to both players
   */
  private sendStateSnapshot(): void {
    const snapshot: StateSnapshotMessage = {
      type: 'state_snapshot',
      serverTime: this.serverTime,
      lastProcessedSeq: 0, // Will be set per player
      players: {
        [this.player1.playerId]: this.player1.state,
        [this.player2.playerId]: this.player2.state
      },
      projectiles: Array.from(this.projectiles.values())
    };

    // Send to player 1 with their last seq
    if (this.player1.connected && this.player1.socket.readyState === 1) {
      const p1Snapshot = { ...snapshot, lastProcessedSeq: this.player1.lastInputSeq };
      this.player1.socket.send(JSON.stringify(p1Snapshot));
    }

    // Send to player 2 with their last seq
    if (this.player2.connected && this.player2.socket.readyState === 1) {
      const p2Snapshot = { ...snapshot, lastProcessedSeq: this.player2.lastInputSeq };
      this.player2.socket.send(JSON.stringify(p2Snapshot));
    }
  }

  /**
   * Handle input message from a player
   */
  public handleInput(playerId: string, seq: number, timestamp: number, input: PlayerInput): void {
    const player = this.getPlayer(playerId);
    if (!player || this.matchState !== 'ACTIVE') return;

    // Validate timestamp (reject if too old or in future)
    const timeDiff = this.serverTime - timestamp;
    if (Math.abs(timeDiff) > NETWORK.MAX_INPUT_AGE) {
      console.warn(`[Match ${this.matchId}] Rejected input from ${player.playerName}: timestamp too old/future`);
      return;
    }

    // Update sequence number and input
    if (seq > player.lastInputSeq) {
      player.lastInputSeq = seq;
      player.lastInput = input;
    }
  }

  /**
   * Handle player disconnection
   */
  public handleDisconnect(playerId: string): void {
    const player = this.getPlayer(playerId);
    if (!player) return;

    console.log(`[Match ${this.matchId}] Player ${player.playerName} disconnected`);
    player.connected = false;

    if (this.matchState === 'ACTIVE') {
      // End match - opponent wins
      const opponent = playerId === this.player1.playerId ? this.player2 : this.player1;
      this.endMatch(opponent.playerId, 'disconnect');
    } else if (this.matchState === 'COUNTDOWN') {
      // Cancel match during countdown
      console.log(`[Match ${this.matchId}] Match cancelled during countdown`);
      this.cleanup();
      if (this.onMatchEndCallback) {
        this.onMatchEndCallback(this.matchId);
      }
    }
  }

  /**
   * End the match
   */
  private endMatch(winnerId: string, reason: 'health_depleted' | 'disconnect' | 'forfeit'): void {
    if (this.matchState === 'ENDING' || this.matchState === 'ENDED') return;

    this.matchState = 'ENDING';
    console.log(`[Match ${this.matchId}] Match ending. Winner: ${winnerId}, Reason: ${reason}`);

    const winner = this.getPlayer(winnerId);
    const loser = winnerId === this.player1.playerId ? this.player2 : this.player1;

    if (!winner || !loser) return;

    // Send match_end to both players
    const winnerMessage: MatchEndMessage = {
      type: 'match_end',
      winnerId: winner.playerId,
      reason,
      stats: winner.stats
    };

    const loserMessage: MatchEndMessage = {
      type: 'match_end',
      winnerId: winner.playerId,
      reason,
      stats: loser.stats
    };

    if (winner.connected && winner.socket.readyState === 1) {
      winner.socket.send(JSON.stringify(winnerMessage));
    }

    if (loser.connected && loser.socket.readyState === 1) {
      loser.socket.send(JSON.stringify(loserMessage));
    }

    // Wait 2 seconds before cleanup
    setTimeout(() => {
      this.matchState = 'ENDED';
      this.cleanup();
      if (this.onMatchEndCallback) {
        this.onMatchEndCallback(this.matchId);
      }
    }, 2000);
  }

  /**
   * Broadcast message to both players
   */
  private broadcast(message: any): void {
    const messageStr = JSON.stringify(message);

    if (this.player1.connected && this.player1.socket.readyState === 1) {
      this.player1.socket.send(messageStr);
    }

    if (this.player2.connected && this.player2.socket.readyState === 1) {
      this.player2.socket.send(messageStr);
    }
  }

  /**
   * Get player by ID
   */
  private getPlayer(playerId: string): PlayerData | null {
    if (this.player1.playerId === playerId) return this.player1;
    if (this.player2.playerId === playerId) return this.player2;
    return null;
  }

  /**
   * Get opponent for a player
   */
  public getOpponent(playerId: string): PlayerData | null {
    if (this.player1.playerId === playerId) return this.player2;
    if (this.player2.playerId === playerId) return this.player1;
    return null;
  }

  /**
   * Generate spawn position based on angle
   */
  private generateSpawnPosition(angle: number): [number, number, number] {
    const distance = ARENA.SPAWN_DISTANCE;
    return [
      Math.sin(angle) * distance,
      ARENA.FLOOR_Y,
      Math.cos(angle) * distance
    ];
  }

  /**
   * Create initial player state
   */
  private createInitialState(position: [number, number, number]): PlayerState {
    return {
      position,
      rotation: [0, 0, 0],
      velocity: [0, 0, 0],
      health: MECH.MAX_HEALTH,
      power: MECH.MAX_POWER,
      jumpFuel: MECH.MAX_JUMP_FUEL,
      isDashing: false,
      isJumping: false,
      abilityActive: false
    };
  }

  /**
   * Create initial stats
   */
  private createInitialStats(): MatchStats {
    return {
      damageDealt: 0,
      damageReceived: 0,
      shotsHit: 0,
      shotsFired: 0,
      timeSurvived: 0
    };
  }

  /**
   * Set match end callback
   */
  public setOnMatchEnd(callback: (matchId: string) => void): void {
    this.onMatchEndCallback = callback;
  }

  /**
   * Get match state
   */
  public getState(): MatchState {
    return this.matchState;
  }

  /**
   * Check if player is in this match
   */
  public hasPlayer(playerId: string): boolean {
    return this.player1.playerId === playerId || this.player2.playerId === playerId;
  }

  /**
   * Clean up resources
   */
  public cleanup(): void {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }

    console.log(`[Match ${this.matchId}] Cleaned up`);
  }
}
