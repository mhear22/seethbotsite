/**
 * GameServer Tests
 * Tests for game server player connections, message routing, and match management
 */

import { GameServer } from '../../src/services/GameServer';
import { matchmakingService } from '../../src/services/MatchmakingService';
import { MechLoadout } from '../../src/shared/types/NetworkMessages';

// Mock WebSocket
class MockWebSocket {
  readyState = 1; // WebSocket.OPEN
  messages: string[] = [];
  closed = false;

  send(data: string) {
    this.messages.push(data);
  }

  close() {
    this.readyState = 3; // WebSocket.CLOSED
    this.closed = true;
  }

  ping() {
    // Mock ping
  }

  on(event: string, callback: Function) {
    // Mock event listener
  }
}

const createMockLoadout = (): MechLoadout => ({
  chassisType: 'standard',
  leftWeapon: {
    type: 'autocannon',
    name: 'AC-20',
    damage: 20,
    fireRate: 60,
    projectileSpeed: 500,
    energyCost: 10,
    cooldown: 1000
  },
  rightWeapon: {
    type: 'laser',
    name: 'Pulse Laser',
    damage: 15,
    fireRate: 120,
    projectileSpeed: 1000,
    energyCost: 15,
    cooldown: 500
  },
  ability: {
    type: 'shield',
    name: 'Energy Shield',
    duration: 5000,
    cooldown: 30000,
    energyCost: 50
  }
});

describe('GameServer', () => {
  let gameServer: GameServer;

  beforeEach(() => {
    gameServer = new GameServer();
    matchmakingService.cleanup();
  });

  afterEach(() => {
    gameServer.cleanup();
    matchmakingService.cleanup();
  });

  describe('Player Registration', () => {
    it('should register a new player', () => {
      const socket = new MockWebSocket();
      gameServer.registerPlayer('player1', 'TestPlayer1', socket);

      const stats = gameServer.getStats();
      expect(stats.connectedPlayers).toBe(1);
    });

    it('should replace existing connection for same player', () => {
      const socket1 = new MockWebSocket();
      const socket2 = new MockWebSocket();

      gameServer.registerPlayer('player1', 'TestPlayer1', socket1);
      gameServer.registerPlayer('player1', 'TestPlayer1', socket2);

      const stats = gameServer.getStats();
      expect(stats.connectedPlayers).toBe(1);
      expect(socket1.closed).toBe(true);
    });

    it('should allow multiple different players to connect', () => {
      const socket1 = new MockWebSocket();
      const socket2 = new MockWebSocket();

      gameServer.registerPlayer('player1', 'TestPlayer1', socket1);
      gameServer.registerPlayer('player2', 'TestPlayer2', socket2);

      const stats = gameServer.getStats();
      expect(stats.connectedPlayers).toBe(2);
    });
  });

  describe('Player Disconnection', () => {
    it('should remove disconnected player', () => {
      const socket = new MockWebSocket();
      gameServer.registerPlayer('player1', 'TestPlayer1', socket);

      let stats = gameServer.getStats();
      expect(stats.connectedPlayers).toBe(1);

      gameServer.handleDisconnect('player1');

      stats = gameServer.getStats();
      expect(stats.connectedPlayers).toBe(0);
    });

    it('should remove player from matchmaking queue on disconnect', () => {
      const socket = new MockWebSocket();
      gameServer.registerPlayer('player1', 'TestPlayer1', socket);

      gameServer.handleMessage('player1', {
        type: 'match_request',
        loadout: createMockLoadout()
      });

      expect(matchmakingService.isInQueue('player1')).toBe(true);

      gameServer.handleDisconnect('player1');

      expect(matchmakingService.isInQueue('player1')).toBe(false);
    });

    it('should handle disconnect for non-existent player gracefully', () => {
      expect(() => {
        gameServer.handleDisconnect('non-existent-player');
      }).not.toThrow();
    });
  });

  describe('Match Request Handling', () => {
    it('should add player to matchmaking queue', () => {
      const socket = new MockWebSocket();
      gameServer.registerPlayer('player1', 'TestPlayer1', socket);

      gameServer.handleMessage('player1', {
        type: 'match_request',
        loadout: createMockLoadout()
      });

      expect(matchmakingService.isInQueue('player1')).toBe(true);
      const stats = gameServer.getStats();
      expect(stats.queueSize).toBe(1);
    });

    it('should reject match request if already in queue', () => {
      const socket = new MockWebSocket();
      gameServer.registerPlayer('player1', 'TestPlayer1', socket);

      gameServer.handleMessage('player1', {
        type: 'match_request',
        loadout: createMockLoadout()
      });

      gameServer.handleMessage('player1', {
        type: 'match_request',
        loadout: createMockLoadout()
      });

      const errorMessages = socket.messages.filter(msg => {
        const parsed = JSON.parse(msg);
        return parsed.type === 'error' && parsed.code === 'ALREADY_IN_QUEUE';
      });

      expect(errorMessages.length).toBeGreaterThan(0);
    });
  });

  describe('Cancel Matchmaking', () => {
    it('should remove player from queue when cancelled', () => {
      const socket = new MockWebSocket();
      gameServer.registerPlayer('player1', 'TestPlayer1', socket);

      gameServer.handleMessage('player1', {
        type: 'match_request',
        loadout: createMockLoadout()
      });

      expect(matchmakingService.isInQueue('player1')).toBe(true);

      gameServer.handleMessage('player1', {
        type: 'cancel_matchmaking'
      });

      expect(matchmakingService.isInQueue('player1')).toBe(false);
    });

    it('should send cancellation confirmation', () => {
      const socket = new MockWebSocket();
      gameServer.registerPlayer('player1', 'TestPlayer1', socket);

      gameServer.handleMessage('player1', {
        type: 'match_request',
        loadout: createMockLoadout()
      });

      gameServer.handleMessage('player1', {
        type: 'cancel_matchmaking'
      });

      const cancelMessages = socket.messages.filter(msg => {
        const parsed = JSON.parse(msg);
        return parsed.type === 'matchmaking_status' && parsed.status === 'cancelled';
      });

      expect(cancelMessages.length).toBeGreaterThan(0);
    });
  });

  describe('Ping/Pong', () => {
    it('should respond to ping with pong', () => {
      const socket = new MockWebSocket();
      gameServer.registerPlayer('player1', 'TestPlayer1', socket);

      gameServer.handleMessage('player1', {
        type: 'ping'
      });

      const pongMessages = socket.messages.filter(msg => {
        const parsed = JSON.parse(msg);
        return parsed.type === 'pong';
      });

      expect(pongMessages.length).toBe(1);
    });
  });

  describe('Game Statistics', () => {
    it('should return correct statistics', () => {
      const socket1 = new MockWebSocket();
      const socket2 = new MockWebSocket();

      gameServer.registerPlayer('player1', 'TestPlayer1', socket1);
      gameServer.registerPlayer('player2', 'TestPlayer2', socket2);

      gameServer.handleMessage('player1', {
        type: 'match_request',
        loadout: createMockLoadout()
      });

      const stats = gameServer.getStats();

      expect(stats.connectedPlayers).toBe(2);
      expect(stats.queueSize).toBe(1);
      expect(stats.activeMatches).toBe(0);
    });

    it('should update statistics when players disconnect', () => {
      const socket1 = new MockWebSocket();
      const socket2 = new MockWebSocket();

      gameServer.registerPlayer('player1', 'TestPlayer1', socket1);
      gameServer.registerPlayer('player2', 'TestPlayer2', socket2);

      gameServer.handleDisconnect('player1');

      const stats = gameServer.getStats();
      expect(stats.connectedPlayers).toBe(1);
    });
  });

  describe('Message Handling', () => {
    it('should handle unknown message types gracefully', () => {
      const socket = new MockWebSocket();
      gameServer.registerPlayer('player1', 'TestPlayer1', socket);

      expect(() => {
        gameServer.handleMessage('player1', {
          type: 'unknown_type' as any
        });
      }).not.toThrow();
    });

    it('should ignore messages from unregistered players', () => {
      expect(() => {
        gameServer.handleMessage('non-existent-player', {
          type: 'ping'
        });
      }).not.toThrow();
    });

    it('should handle input messages only when in a match', () => {
      const socket = new MockWebSocket();
      gameServer.registerPlayer('player1', 'TestPlayer1', socket);

      // Send input without being in a match
      expect(() => {
        gameServer.handleMessage('player1', {
          type: 'input',
          seq: 1,
          timestamp: Date.now(),
          input: {
            forward: true,
            backward: false,
            left: false,
            right: false,
            jump: false,
            shootLeft: false,
            shootRight: false,
            dash: false,
            useAbility: false,
            aimDirection: { x: 0, y: 0, z: 1 }
          }
        });
      }).not.toThrow();
    });
  });

  describe('Cleanup', () => {
    it('should cleanup all resources', () => {
      const socket1 = new MockWebSocket();
      const socket2 = new MockWebSocket();

      gameServer.registerPlayer('player1', 'TestPlayer1', socket1);
      gameServer.registerPlayer('player2', 'TestPlayer2', socket2);

      gameServer.cleanup();

      const stats = gameServer.getStats();
      expect(stats.connectedPlayers).toBe(0);
      expect(stats.activeMatches).toBe(0);
    });
  });
});
