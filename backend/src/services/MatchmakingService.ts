/**
 * Matchmaking service for multiplayer mech battle
 * Implements FIFO queue for 1v1 matches
 */

import { MechLoadout } from '../../../shared/types/NetworkMessages';
import { MATCHMAKING } from '../../../shared/constants/GameConstants';

export interface QueuedPlayer {
  playerId: string;
  playerName: string;
  loadout: MechLoadout;
  queuedAt: number;
  socket: any; // WebSocket
}

export interface MatchPair {
  player1: QueuedPlayer;
  player2: QueuedPlayer;
  matchId: string;
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
    console.log(`[Matchmaking] Player ${player.playerName} joined queue. Queue size: ${this.queue.length}`);

    // Send status update
    this.sendQueueStatus(player);

    // Set timeout for max queue time
    const timeout = setTimeout(() => {
      this.onQueueTimeout(player.playerId);
    }, MATCHMAKING.MAX_QUEUE_TIME);

    this.queueTimeouts.set(player.playerId, timeout);

    // Try to match immediately
    this.tryMatchPlayers();
  }

  /**
   * Remove a player from the queue
   */
  public removeFromQueue(playerId: string): void {
    const index = this.queue.findIndex(p => p.playerId === playerId);

    if (index !== -1) {
      const player = this.queue[index];
      this.queue.splice(index, 1);
      console.log(`[Matchmaking] Player ${player.playerName} left queue. Queue size: ${this.queue.length}`);

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
    if (this.queue.length < 2) {
      return null;
    }

    // Take first two players
    const player1 = this.queue.shift()!;
    const player2 = this.queue.shift()!;

    // Clear their timeouts
    const timeout1 = this.queueTimeouts.get(player1.playerId);
    const timeout2 = this.queueTimeouts.get(player2.playerId);
    if (timeout1) clearTimeout(timeout1);
    if (timeout2) clearTimeout(timeout2);
    this.queueTimeouts.delete(player1.playerId);
    this.queueTimeouts.delete(player2.playerId);

    // Generate match ID
    const matchId = this.generateMatchId();

    console.log(`[Matchmaking] Match found! ${player1.playerName} vs ${player2.playerName} (${matchId})`);

    return {
      player1,
      player2,
      matchId
    };
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
