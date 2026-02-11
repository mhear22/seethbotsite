/**
 * Game server managing multiple active match instances
 * Routes messages between players and their matches
 */

import { MatchInstance } from './MatchInstance';
import { matchmakingService, MatchPair } from './MatchmakingService';
import {
  ClientMessage,
  InputMessage,
  MatchRequestMessage,
  CancelMatchmakingMessage,
  MatchFoundMessage,
  ArenaBuilding,
  MechLoadout
} from '../shared/types/NetworkMessages';
import { ARENA, MATCHMAKING } from '../shared/constants/GameConstants';

interface ConnectedPlayer {
  playerId: string;
  playerName: string;
  socket: any; // WebSocket
  currentMatchId: string | null;
}

export class GameServer {
  private matches: Map<string, MatchInstance> = new Map();
  private players: Map<string, ConnectedPlayer> = new Map();
  private matchmakingInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startMatchmaking();
    console.log('[GameServer] Initialized');
  }

  /**
   * Start matchmaking loop
   */
  private startMatchmaking(): void {
    this.matchmakingInterval = setInterval(() => {
      this.attemptMatches();
    }, MATCHMAKING.MATCHMAKING_INTERVAL);
  }

  /**
   * Attempt to create matches from queue
   */
  private attemptMatches(): void {
    console.log('[GameServer] attemptMatches() called');
    let matchPair = matchmakingService.attemptMatch();
    console.log('[GameServer] matchPair:', matchPair ? 'found' : 'null');

    while (matchPair) {
      try {
        console.log('[GameServer] Calling createMatch()...');
        this.createMatch(matchPair);
      } catch (error) {
        console.error('[GameServer] Error in createMatch():', error);
      }
      matchPair = matchmakingService.attemptMatch();
    }
  }

  /**
   * Create a new match from a pair of players
   */
  private createMatch(pair: MatchPair): void {
    console.log('[GameServer] createMatch() called');
    const { player1, player2, matchId } = pair;
    console.log(`[GameServer] Match pair: ${player1?.playerName} vs ${player2?.playerName}, matchId: ${matchId}`);

    // Generate arena buildings
    const buildings = this.generateArenaBuildings();
    console.log(`[GameServer] Generated ${buildings.length} buildings`);

    // Get spawn positions
    const spawn1: [number, number, number] = [
      Math.sin(0) * ARENA.SPAWN_DISTANCE,
      ARENA.FLOOR_Y,
      Math.cos(0) * ARENA.SPAWN_DISTANCE
    ];

    const spawn2: [number, number, number] = [
      Math.sin(Math.PI) * ARENA.SPAWN_DISTANCE,
      ARENA.FLOOR_Y,
      Math.cos(Math.PI) * ARENA.SPAWN_DISTANCE
    ];

    // Send match_found to both players
    
    const match1Message: MatchFoundMessage = {
      type: 'match_found',
      matchId,
      opponentId: player2.playerId,
      opponentName: player2.playerName,
      opponentLoadout: player2.loadout,
      yourPlayerId: player1.playerId,
      yourSpawnPosition: spawn1,
      opponentSpawnPosition: spawn2,
      arenaBuildings: buildings
    };

    const match2Message: MatchFoundMessage = {
      type: 'match_found',
      matchId,
      opponentId: player1.playerId,
      opponentName: player1.playerName,
      opponentLoadout: player1.loadout,
      yourPlayerId: player2.playerId,
      yourSpawnPosition: spawn2,
      opponentSpawnPosition: spawn1,
      arenaBuildings: buildings
    };

    if (player1.socket.readyState === 1) {
      player1.socket.send(JSON.stringify(match1Message));
    }

    if (player2.socket.readyState === 1) {
      player2.socket.send(JSON.stringify(match2Message));
    }

    // Create match instance
    try {
      console.log(`[GameServer] Creating match instance: ${matchId}`);
      const match = new MatchInstance(
        matchId,
        player1.playerId,
        player1.playerName,
        player1.loadout,
        player1.socket,
        player2.playerId,
        player2.playerName,
        player2.loadout,
        player2.socket
      );

      // Set match end callback
      match.setOnMatchEnd((matchId) => {
        this.onMatchEnd(matchId);
      });

      // Store match
      this.matches.set(matchId, match);

      // Update player records
      const p1 = this.players.get(player1.playerId);
      const p2 = this.players.get(player2.playerId);
      if (p1) p1.currentMatchId = matchId;
      if (p2) p2.currentMatchId = matchId;

      // Start match after a short delay for loading
      setTimeout(() => {
        console.log(`[GameServer] Starting match: ${matchId}`);
        match.start();
      }, 1000);
    } catch (error) {
      console.error(`[GameServer] Error creating match ${matchId}:`, error);
      // Notify players of error
      const errorMessage = {
        type: 'error',
        code: 'MATCH_CREATE_FAILED',
        message: 'Failed to create match'
      };
      if (player1.socket.readyState === 1) {
        player1.socket.send(JSON.stringify(errorMessage));
      }
      if (player2.socket.readyState === 1) {
        player2.socket.send(JSON.stringify(errorMessage));
      }
    }
  }

  /**
   * Generate random arena buildings
   */
  private generateArenaBuildings(): ArenaBuilding[] {
    const buildings: ArenaBuilding[] = [];
    const halfArena = ARENA.WIDTH / 2;
    const minDist = 30; // Minimum distance from spawn points

    for (let i = 0; i < ARENA.BUILDING_COUNT; i++) {
      let position: [number, number, number];
      let attempts = 0;

      // Try to find a valid position
      do {
        const x = (Math.random() - 0.5) * ARENA.WIDTH * 0.8;
        const z = (Math.random() - 0.5) * ARENA.DEPTH * 0.8;
        position = [x, ARENA.FLOOR_Y, z];
        attempts++;
      } while (attempts < 20 && (
        // Too close to spawn points
        Math.sqrt(position[0] ** 2 + position[2] ** 2) < minDist ||
        Math.sqrt((position[0] - Math.sin(Math.PI) * ARENA.SPAWN_DISTANCE) ** 2 +
                  (position[2] - Math.cos(Math.PI) * ARENA.SPAWN_DISTANCE) ** 2) < minDist
      ));

      const width = ARENA.MIN_BUILDING_SIZE[0] +
                    Math.random() * (ARENA.MAX_BUILDING_SIZE[0] - ARENA.MIN_BUILDING_SIZE[0]);
      const height = ARENA.MIN_BUILDING_SIZE[1] +
                     Math.random() * (ARENA.MAX_BUILDING_SIZE[1] - ARENA.MIN_BUILDING_SIZE[1]);
      const depth = ARENA.MIN_BUILDING_SIZE[2] +
                    Math.random() * (ARENA.MAX_BUILDING_SIZE[2] - ARENA.MIN_BUILDING_SIZE[2]);

      buildings.push({
        position,
        size: [width, height, depth],
        type: 'building'
      });
    }

    return buildings;
  }

  /**
   * Handle match end
   */
  private onMatchEnd(matchId: string): void {
    console.log(`[GameServer] Match ${matchId} ended`);

    const match = this.matches.get(matchId);
    if (!match) return;

    // Clear player match IDs
    for (const [playerId, player] of this.players.entries()) {
      if (player.currentMatchId === matchId) {
        player.currentMatchId = null;
      }
    }

    // Remove match
    this.matches.delete(matchId);
  }

  /**
   * Register a new player connection
   */
  public registerPlayer(playerId: string, playerName: string, socket: any): void {
    // Remove existing connection if any
    const existing = this.players.get(playerId);
    if (existing && existing.socket.readyState === 1) {
      existing.socket.close();
    }

    this.players.set(playerId, {
      playerId,
      playerName,
      socket,
      currentMatchId: null
    });

    console.log(`[GameServer] Player ${playerName} (${playerId}) connected`);
  }

  /**
   * Handle player disconnection
   */
  public handleDisconnect(playerId: string): void {
    const player = this.players.get(playerId);
    if (!player) return;

    console.log(`[GameServer] Player ${player.playerName} disconnected`);

    // Remove from matchmaking queue if in queue
    matchmakingService.removeFromQueue(playerId);

    // Handle match disconnection
    if (player.currentMatchId) {
      const match = this.matches.get(player.currentMatchId);
      if (match) {
        match.handleDisconnect(playerId);
      }
    }

    // Remove player
    this.players.delete(playerId);
  }

  /**
   * Handle incoming message from player
   */
  public handleMessage(playerId: string, message: ClientMessage): void {
    const player = this.players.get(playerId);
    if (!player) return;

    try {
      switch (message.type) {
        case 'match_request':
          this.handleMatchRequest(player, message);
          break;

        case 'cancel_matchmaking':
          this.handleCancelMatchmaking(player, message);
          break;

        case 'input':
          this.handleInput(player, message);
          break;

        case 'ack':
          // Handle acknowledgments (Phase 3)
          break;

        case 'ping':
          // Respond with pong for latency measurement
          if (player.socket.readyState === 1) {
            player.socket.send(JSON.stringify({ type: 'pong' }));
          }
          break;

        default:
          console.warn(`[GameServer] Unknown message type "${(message as any).type}" from ${player.playerName}`);
      }
    } catch (error) {
      console.error(`[GameServer] Error handling message from ${player.playerName}:`, error);
    }
  }

  /**
   * Handle match request
   */
  private handleMatchRequest(player: ConnectedPlayer, message: MatchRequestMessage): void {
    // Check if already in match or queue
    if (player.currentMatchId) {
      this.sendError(player, 'ALREADY_IN_MATCH', 'You are already in a match');
      return;
    }

    if (matchmakingService.isInQueue(player.playerId)) {
      this.sendError(player, 'ALREADY_IN_QUEUE', 'You are already in the matchmaking queue');
      return;
    }

    // Add to queue
    matchmakingService.addToQueue({
      playerId: player.playerId,
      playerName: player.playerName,
      loadout: message.loadout,
      queuedAt: Date.now(),
      socket: player.socket
    });
  }

  /**
   * Handle cancel matchmaking
   */
  private handleCancelMatchmaking(player: ConnectedPlayer, message: CancelMatchmakingMessage): void {
    matchmakingService.removeFromQueue(player.playerId);

    if (player.socket.readyState === 1) {
      player.socket.send(JSON.stringify({
        type: 'matchmaking_status',
        status: 'cancelled'
      }));
    }
  }

  /**
   * Handle input from player
   */
  private handleInput(player: ConnectedPlayer, message: InputMessage): void {
    if (!player.currentMatchId) return;

    const match = this.matches.get(player.currentMatchId);
    if (!match) return;

    match.handleInput(player.playerId, message.seq, message.timestamp, message.input);
  }

  /**
   * Send error to player
   */
  private sendError(player: ConnectedPlayer, code: string, message: string): void {
    if (player.socket.readyState === 1) {
      player.socket.send(JSON.stringify({
        type: 'error',
        code,
        message
      }));
    }
  }

  /**
   * Get statistics
   */
  public getStats(): { activeMatches: number; connectedPlayers: number; queueSize: number } {
    return {
      activeMatches: this.matches.size,
      connectedPlayers: this.players.size,
      queueSize: matchmakingService.getQueueSize()
    };
  }

  /**
   * Cleanup
   */
  public cleanup(): void {
    if (this.matchmakingInterval) {
      clearInterval(this.matchmakingInterval);
    }

    for (const match of this.matches.values()) {
      match.cleanup();
    }

    matchmakingService.cleanup();
    this.matches.clear();
    this.players.clear();

    console.log('[GameServer] Cleaned up');
  }
}

// Singleton instance
export const gameServer = new GameServer();
