/**
 * Matchmaking service for multiplayer mech battle
 * Implements FIFO queue for 1v1 matches
 */

import { MechLoadout, GameMode } from '../shared/types/NetworkMessages';
import { MATCHMAKING } from '../shared/constants/GameConstants';

/**
 * How long a lone survival player waits for a co-op partner before a solo
 * survival match is started. Backend-only tuning (not part of the shared
 * deterministic sim), so it lives here rather than in shared GameConstants.
 */
const SURVIVAL_SOLO_GRACE_MS = 5000;

export interface QueuedPlayer {
  playerId: string;
  playerName: string;
  loadout: MechLoadout;
  queuedAt: number;
  socket: any; // WebSocket
  /** Desired game mode. Absent => 'pvp' (existing behavior unchanged). */
  gameMode?: GameMode;
}

export interface MatchPair {
  player1: QueuedPlayer;
  /** null for a solo survival match (co-op survival may start with one human). */
  player2: QueuedPlayer | null;
  matchId: string;
  /** Game mode for the created match. Absent => 'pvp'. */
  gameMode: GameMode;
}

export class MatchmakingService {
  private queue: QueuedPlayer[] = [];
  private queueTimeouts: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Add a player to the matchmaking queue
   */
  public addToQueue(player: QueuedPlayer): void {
    // Remove if already in queue (shouldn't happen, but be safe)
    this.removeFromQueue(player.playerId);

    this.queue.push(player);

    // Send status update
    this.sendQueueStatus(player);

    // Set timeout for max queue time
    const timeout = setTimeout(() => {
      this.onQueueTimeout(player.playerId);
    }, MATCHMAKING.MAX_QUEUE_TIME);

    this.queueTimeouts.set(player.playerId, timeout);

    // Don't try to match immediately - let GameServer's interval handle it
    // This ensures proper match creation through the GameServer
  }

  /**
   * Remove a player from the queue
   */
  public removeFromQueue(playerId: string): void {
    const index = this.queue.findIndex(p => p.playerId === playerId);

    if (index !== -1) {
      const player = this.queue[index];
      this.queue.splice(index, 1);

      // Clear timeout
      const timeout = this.queueTimeouts.get(playerId);
      if (timeout) {
        clearTimeout(timeout);
        this.queueTimeouts.delete(playerId);
      }
    }
  }

  /**
   * Handle queue timeout for a player
   */
  private onQueueTimeout(playerId: string): void {
    const player = this.queue.find(p => p.playerId === playerId);

    if (player) {
      console.log(`[Matchmaking] Queue timeout for player ${player.playerName}`);
      this.removeFromQueue(playerId);

      // Send timeout message
      if (player.socket.readyState === 1) { // WebSocket.OPEN
        player.socket.send(JSON.stringify({
          type: 'error',
          code: 'QUEUE_TIMEOUT',
          message: 'No match found within time limit. Please try again.'
        }));
      }
    }
  }

  /**
   * Send queue status to a player
   */
  private sendQueueStatus(player: QueuedPlayer): void {
    const position = this.queue.findIndex(p => p.playerId === player.playerId) + 1;
    const queueTime = Date.now() - player.queuedAt;
    const estimatedWait = Math.max(0, MATCHMAKING.MAX_QUEUE_TIME - queueTime);

    if (player.socket.readyState === 1) { // WebSocket.OPEN
      player.socket.send(JSON.stringify({
        type: 'matchmaking_status',
        status: 'searching',
        queuePosition: position,
        estimatedWait: Math.floor(estimatedWait / 1000) // Convert to seconds
      }));
    }
  }

  /**
   * Try to match players in the queue
   * Uses simple FIFO - first two players get matched
   */
  private tryMatchPlayers(): MatchPair | null {
    // --- PvP: classic FIFO pairing of two 'pvp' (or unspecified) players. ---
    const pvpQueue = this.queue.filter(p => (p.gameMode ?? 'pvp') === 'pvp');
    if (pvpQueue.length >= 2) {
      const player1 = pvpQueue[0];
      const player2 = pvpQueue[1];
      this.dequeue(player1.playerId);
      this.dequeue(player2.playerId);
      const matchId = this.generateMatchId();
      console.log(`[Matchmaking] PvP match found! ${player1.playerName} vs ${player2.playerName} (${matchId})`);
      return { player1, player2, matchId, gameMode: 'pvp' };
    }

    // --- Survival: prefer co-op pairs; fall back to solo after a short grace. ---
    const survivalQueue = this.queue.filter(p => p.gameMode === 'survival');
    if (survivalQueue.length >= 2) {
      const player1 = survivalQueue[0];
      const player2 = survivalQueue[1];
      this.dequeue(player1.playerId);
      this.dequeue(player2.playerId);
      const matchId = this.generateMatchId();
      console.log(`[Matchmaking] Survival co-op match! ${player1.playerName} + ${player2.playerName} (${matchId})`);
      return { player1, player2, matchId, gameMode: 'survival' };
    }
    if (survivalQueue.length === 1) {
      const player1 = survivalQueue[0];
      const waited = Date.now() - player1.queuedAt;
      if (waited >= SURVIVAL_SOLO_GRACE_MS) {
        this.dequeue(player1.playerId);
        const matchId = this.generateMatchId();
        console.log(`[Matchmaking] Survival solo match! ${player1.playerName} (${matchId})`);
        return { player1, player2: null, matchId, gameMode: 'survival' };
      }
    }

    return null;
  }

  /** Remove a queued player and clear their timeout (used during match creation). */
  private dequeue(playerId: string): void {
    const idx = this.queue.findIndex(p => p.playerId === playerId);
    if (idx !== -1) this.queue.splice(idx, 1);
    const timeout = this.queueTimeouts.get(playerId);
    if (timeout) clearTimeout(timeout);
    this.queueTimeouts.delete(playerId);
  }

  /**
   * Public method to attempt matching (called by GameServer)
   */
  public attemptMatch(): MatchPair | null {
    return this.tryMatchPlayers();
  }

  /**
   * Get queue size
   */
  public getQueueSize(): number {
    return this.queue.length;
  }

  /**
   * Get player's position in queue
   */
  public getPlayerPosition(playerId: string): number {
    const index = this.queue.findIndex(p => p.playerId === playerId);
    return index === -1 ? -1 : index + 1;
  }

  /**
   * Check if player is in queue
   */
  public isInQueue(playerId: string): boolean {
    return this.queue.some(p => p.playerId === playerId);
  }

  /**
   * Generate a unique match ID
   */
  private generateMatchId(): string {
    return `match_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Clean up - clear all timeouts
   */
  public cleanup(): void {
    for (const timeout of this.queueTimeouts.values()) {
      clearTimeout(timeout);
    }
    this.queueTimeouts.clear();
    this.queue = [];
  }
}

// Singleton instance
export const matchmakingService = new MatchmakingService();
