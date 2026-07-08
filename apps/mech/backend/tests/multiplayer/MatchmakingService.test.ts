/**
 * MatchmakingService Tests
 * Tests for multiplayer matchmaking queue and pairing logic
 */

import { MatchmakingService } from '../../src/services/MatchmakingService';
import { MechLoadout } from '../../src/shared/types/NetworkMessages';

// Mock WebSocket
class MockWebSocket {
  readyState = 1; // WebSocket.OPEN
  messages: string[] = [];

  send(data: string) {
    this.messages.push(data);
  }

  close() {
    this.readyState = 3; // WebSocket.CLOSED
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

describe('MatchmakingService', () => {
  let service: MatchmakingService;

  beforeEach(() => {
    service = new MatchmakingService();
  });

  afterEach(() => {
    service.cleanup();
  });

  describe('Queue Management', () => {
    it('should add a player to the queue', () => {
      const socket = new MockWebSocket();
      const player = {
        playerId: 'player1',
        playerName: 'TestPlayer1',
        loadout: createMockLoadout(),
        queuedAt: Date.now(),
        socket
      };

      service.addToQueue(player);

      expect(service.getQueueSize()).toBe(1);
      expect(service.isInQueue('player1')).toBe(true);
      expect(service.getPlayerPosition('player1')).toBe(1);
    });

    it('should remove a player from the queue', () => {
      const socket = new MockWebSocket();
      const player = {
        playerId: 'player1',
        playerName: 'TestPlayer1',
        loadout: createMockLoadout(),
        queuedAt: Date.now(),
        socket
      };

      service.addToQueue(player);
      expect(service.getQueueSize()).toBe(1);

      service.removeFromQueue('player1');
      expect(service.getQueueSize()).toBe(0);
      expect(service.isInQueue('player1')).toBe(false);
    });

    it('should not add duplicate players to the queue', () => {
      const socket1 = new MockWebSocket();
      const socket2 = new MockWebSocket();
      const player1 = {
        playerId: 'player1',
        playerName: 'TestPlayer1',
        loadout: createMockLoadout(),
        queuedAt: Date.now(),
        socket: socket1
      };
      const player2 = {
        playerId: 'player1', // Same ID
        playerName: 'TestPlayer1',
        loadout: createMockLoadout(),
        queuedAt: Date.now(),
        socket: socket2
      };

      service.addToQueue(player1);
      service.addToQueue(player2);

      expect(service.getQueueSize()).toBe(1);
    });

    it('should send queue status when player joins', () => {
      const socket = new MockWebSocket();
      const player = {
        playerId: 'player1',
        playerName: 'TestPlayer1',
        loadout: createMockLoadout(),
        queuedAt: Date.now(),
        socket
      };

      service.addToQueue(player);

      expect(socket.messages.length).toBeGreaterThan(0);
      const lastMessage = JSON.parse(socket.messages[socket.messages.length - 1]);
      expect(lastMessage.type).toBe('matchmaking_status');
      expect(lastMessage.status).toBe('searching');
      expect(lastMessage.queuePosition).toBe(1);
    });

    it('should maintain correct queue positions', () => {
      const socket1 = new MockWebSocket();
      const socket2 = new MockWebSocket();
      const socket3 = new MockWebSocket();

      service.addToQueue({
        playerId: 'player1',
        playerName: 'TestPlayer1',
        loadout: createMockLoadout(),
        queuedAt: Date.now(),
        socket: socket1
      });

      service.addToQueue({
        playerId: 'player2',
        playerName: 'TestPlayer2',
        loadout: createMockLoadout(),
        queuedAt: Date.now(),
        socket: socket2
      });

      service.addToQueue({
        playerId: 'player3',
        playerName: 'TestPlayer3',
        loadout: createMockLoadout(),
        queuedAt: Date.now(),
        socket: socket3
      });

      expect(service.getPlayerPosition('player1')).toBe(1);
      expect(service.getPlayerPosition('player2')).toBe(2);
      expect(service.getPlayerPosition('player3')).toBe(3);
    });
  });

  describe('Matchmaking', () => {
    it('should not create a match with only one player', () => {
      const socket = new MockWebSocket();
      service.addToQueue({
        playerId: 'player1',
        playerName: 'TestPlayer1',
        loadout: createMockLoadout(),
        queuedAt: Date.now(),
        socket
      });

      const match = service.attemptMatch();
      expect(match).toBeNull();
      expect(service.getQueueSize()).toBe(1);
    });

    it('should create a match with two players (FIFO)', () => {
      const socket1 = new MockWebSocket();
      const socket2 = new MockWebSocket();

      service.addToQueue({
        playerId: 'player1',
        playerName: 'TestPlayer1',
        loadout: createMockLoadout(),
        queuedAt: Date.now(),
        socket: socket1
      });

      service.addToQueue({
        playerId: 'player2',
        playerName: 'TestPlayer2',
        loadout: createMockLoadout(),
        queuedAt: Date.now(),
        socket: socket2
      });

      const match = service.attemptMatch();
      expect(match).not.toBeNull();
      expect(match?.player1.playerId).toBe('player1');
      expect(match?.player2.playerId).toBe('player2');
      expect(match?.matchId).toBeDefined();
      expect(service.getQueueSize()).toBe(0);
    });

    it('should remove matched players from the queue', () => {
      const socket1 = new MockWebSocket();
      const socket2 = new MockWebSocket();

      service.addToQueue({
        playerId: 'player1',
        playerName: 'TestPlayer1',
        loadout: createMockLoadout(),
        queuedAt: Date.now(),
        socket: socket1
      });

      service.addToQueue({
        playerId: 'player2',
        playerName: 'TestPlayer2',
        loadout: createMockLoadout(),
        queuedAt: Date.now(),
        socket: socket2
      });

      service.attemptMatch();

      expect(service.isInQueue('player1')).toBe(false);
      expect(service.isInQueue('player2')).toBe(false);
      expect(service.getQueueSize()).toBe(0);
    });

    it('should create multiple matches in sequence', () => {
      const sockets = [
        new MockWebSocket(),
        new MockWebSocket(),
        new MockWebSocket(),
        new MockWebSocket()
      ];

      for (let i = 0; i < 4; i++) {
        service.addToQueue({
          playerId: `player${i + 1}`,
          playerName: `TestPlayer${i + 1}`,
          loadout: createMockLoadout(),
          queuedAt: Date.now(),
          socket: sockets[i]
        });
      }

      expect(service.getQueueSize()).toBe(4);

      const match1 = service.attemptMatch();
      expect(match1).not.toBeNull();
      expect(match1?.player1.playerId).toBe('player1');
      expect(match1?.player2.playerId).toBe('player2');
      expect(service.getQueueSize()).toBe(2);

      const match2 = service.attemptMatch();
      expect(match2).not.toBeNull();
      expect(match2?.player1.playerId).toBe('player3');
      expect(match2?.player2.playerId).toBe('player4');
      expect(service.getQueueSize()).toBe(0);
    });

    it('should generate unique match IDs', () => {
      const socket1 = new MockWebSocket();
      const socket2 = new MockWebSocket();
      const socket3 = new MockWebSocket();
      const socket4 = new MockWebSocket();

      service.addToQueue({
        playerId: 'player1',
        playerName: 'TestPlayer1',
        loadout: createMockLoadout(),
        queuedAt: Date.now(),
        socket: socket1
      });

      service.addToQueue({
        playerId: 'player2',
        playerName: 'TestPlayer2',
        loadout: createMockLoadout(),
        queuedAt: Date.now(),
        socket: socket2
      });

      const match1 = service.attemptMatch();

      service.addToQueue({
        playerId: 'player3',
        playerName: 'TestPlayer3',
        loadout: createMockLoadout(),
        queuedAt: Date.now(),
        socket: socket3
      });

      service.addToQueue({
        playerId: 'player4',
        playerName: 'TestPlayer4',
        loadout: createMockLoadout(),
        queuedAt: Date.now(),
        socket: socket4
      });

      const match2 = service.attemptMatch();

      expect(match1?.matchId).not.toBe(match2?.matchId);
    });
  });

  describe('Queue Cleanup', () => {
    it('should clean up all timeouts on cleanup', () => {
      const socket1 = new MockWebSocket();
      const socket2 = new MockWebSocket();

      service.addToQueue({
        playerId: 'player1',
        playerName: 'TestPlayer1',
        loadout: createMockLoadout(),
        queuedAt: Date.now(),
        socket: socket1
      });

      service.addToQueue({
        playerId: 'player2',
        playerName: 'TestPlayer2',
        loadout: createMockLoadout(),
        queuedAt: Date.now(),
        socket: socket2
      });

      service.cleanup();

      expect(service.getQueueSize()).toBe(0);
    });

    it('should not error when removing non-existent player', () => {
      expect(() => {
        service.removeFromQueue('non-existent-player');
      }).not.toThrow();
    });
  });

  describe('Queue Position Tracking', () => {
    it('should return -1 for non-queued player position', () => {
      expect(service.getPlayerPosition('non-existent')).toBe(-1);
    });

    it('should update positions after removing a player', () => {
      const socket1 = new MockWebSocket();
      const socket2 = new MockWebSocket();
      const socket3 = new MockWebSocket();

      service.addToQueue({
        playerId: 'player1',
        playerName: 'TestPlayer1',
        loadout: createMockLoadout(),
        queuedAt: Date.now(),
        socket: socket1
      });

      service.addToQueue({
        playerId: 'player2',
        playerName: 'TestPlayer2',
        loadout: createMockLoadout(),
        queuedAt: Date.now(),
        socket: socket2
      });

      service.addToQueue({
        playerId: 'player3',
        playerName: 'TestPlayer3',
        loadout: createMockLoadout(),
        queuedAt: Date.now(),
        socket: socket3
      });

      expect(service.getPlayerPosition('player2')).toBe(2);

      service.removeFromQueue('player1');

      expect(service.getPlayerPosition('player2')).toBe(1);
      expect(service.getPlayerPosition('player3')).toBe(2);
    });
  });
});
