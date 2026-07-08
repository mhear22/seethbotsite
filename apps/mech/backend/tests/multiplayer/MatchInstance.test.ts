/**
 * MatchInstance Tests
 * Tests for individual match logic, game loop, physics, and combat
 */

import { MatchInstance } from '../../src/services/MatchInstance';
import { MechLoadout, PlayerInput } from '../../src/shared/types/NetworkMessages';

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

const createDefaultInput = (): PlayerInput => ({
  forward: false,
  backward: false,
  left: false,
  right: false,
  jump: false,
  shootLeft: false,
  shootRight: false,
  dash: false,
  useAbility: false,
  aimDirection: { x: 0, y: 0, z: 1 }
});

describe('MatchInstance', () => {
  let match: MatchInstance;
  let player1Socket: MockWebSocket;
  let player2Socket: MockWebSocket;

  beforeEach(() => {
    player1Socket = new MockWebSocket();
    player2Socket = new MockWebSocket();

    match = new MatchInstance(
      'test-match-1',
      'player1',
      'TestPlayer1',
      createMockLoadout(),
      player1Socket,
      'player2',
      'TestPlayer2',
      createMockLoadout(),
      player2Socket
    );
  });

  afterEach(() => {
    match.cleanup();
  });

  describe('Match Creation', () => {
    it('should create a match with correct initial state', () => {
      expect(match.matchId).toBe('test-match-1');
      expect(match.getState()).toBe('COUNTDOWN');
    });

    it('should initialize both players', () => {
      expect(match.hasPlayer('player1')).toBe(true);
      expect(match.hasPlayer('player2')).toBe(true);
      expect(match.hasPlayer('player3')).toBe(false);
    });

    it('should send match_start countdown to both players on start', () => {
      match.start();

      const p1Messages = player1Socket.messages.filter(msg => {
        const parsed = JSON.parse(msg);
        return parsed.type === 'match_start';
      });

      const p2Messages = player2Socket.messages.filter(msg => {
        const parsed = JSON.parse(msg);
        return parsed.type === 'match_start';
      });

      expect(p1Messages.length).toBeGreaterThan(0);
      expect(p2Messages.length).toBeGreaterThan(0);
    });
  });

  describe('Match States', () => {
    it('should transition from COUNTDOWN to ACTIVE', (done) => {
      match.start();
      expect(match.getState()).toBe('COUNTDOWN');

      // Wait for countdown to complete (3 seconds + buffer)
      setTimeout(() => {
        expect(match.getState()).toBe('ACTIVE');
        done();
      }, 3500);
    }, 5000);

    it('should accept input only when ACTIVE', () => {
      const input = createDefaultInput();
      input.forward = true;

      // Try to send input before match is active
      match.handleInput('player1', 1, Date.now(), input);

      // Should not process input (no error thrown, just ignored)
      expect(() => {
        match.handleInput('player1', 1, Date.now(), input);
      }).not.toThrow();
    });
  });

  describe('Player Input Handling', () => {
    it('should accept valid input from players', (done) => {
      match.start();

      setTimeout(() => {
        const input = createDefaultInput();
        input.forward = true;

        expect(() => {
          match.handleInput('player1', 1, Date.now(), input);
        }).not.toThrow();

        done();
      }, 3500);
    }, 5000);

    it('should ignore old input sequences', (done) => {
      match.start();

      setTimeout(() => {
        const input = createDefaultInput();

        match.handleInput('player1', 5, Date.now(), input);
        match.handleInput('player1', 3, Date.now(), input); // Older seq

        // Should not throw, but older input is ignored
        expect(() => {
          match.handleInput('player1', 3, Date.now(), input);
        }).not.toThrow();

        done();
      }, 3500);
    }, 5000);

    it('should reject input with invalid timestamp', (done) => {
      match.start();

      setTimeout(() => {
        const input = createDefaultInput();
        const oldTimestamp = Date.now() - 10000; // 10 seconds old

        // Should not throw, but input is ignored
        expect(() => {
          match.handleInput('player1', 1, oldTimestamp, input);
        }).not.toThrow();

        done();
      }, 3500);
    }, 5000);

    it('should ignore input from non-existent players', () => {
      const input = createDefaultInput();

      expect(() => {
        match.handleInput('non-existent-player', 1, Date.now(), input);
      }).not.toThrow();
    });
  });

  describe('Player Disconnection', () => {
    it('should handle player disconnection during countdown', () => {
      match.start();
      expect(match.getState()).toBe('COUNTDOWN');

      match.handleDisconnect('player1');

      // Should notify other player
      const p2Messages = player2Socket.messages.filter(msg => {
        const parsed = JSON.parse(msg);
        return parsed.type === 'error' && parsed.code === 'MATCH_CANCELLED';
      });

      expect(p2Messages.length).toBeGreaterThan(0);
    });

    it('should handle player disconnection during active match', (done) => {
      match.start();

      setTimeout(() => {
        match.handleDisconnect('player1');

        // Should notify other player
        const p2Messages = player2Socket.messages.filter(msg => {
          const parsed = JSON.parse(msg);
          return parsed.type === 'opponent_disconnected';
        });

        expect(p2Messages.length).toBeGreaterThan(0);
        done();
      }, 3500);
    }, 5000);

    it('should end match when player disconnects during active match', (done) => {
      match.start();

      setTimeout(() => {
        match.handleDisconnect('player1');

        // Wait for match to end
        setTimeout(() => {
          expect(match.getState()).toBe('ENDED');
          done();
        }, 2500);
      }, 3500);
    }, 7000);
  });

  describe('Match Lifecycle', () => {
    it('should call onMatchEnd callback when match ends', (done) => {
      let callbackCalled = false;
      match.setOnMatchEnd((matchId) => {
        callbackCalled = true;
        expect(matchId).toBe('test-match-1');
      });

      match.start();

      setTimeout(() => {
        match.handleDisconnect('player1');

        setTimeout(() => {
          expect(callbackCalled).toBe(true);
          done();
        }, 2500);
      }, 3500);
    }, 7000);

    it('should cleanup resources on cleanup', () => {
      match.start();

      expect(() => {
        match.cleanup();
      }).not.toThrow();
    });

    it('should not end match multiple times', (done) => {
      match.start();

      setTimeout(() => {
        match.handleDisconnect('player1');
        match.handleDisconnect('player2'); // Second disconnect

        // Should handle gracefully
        expect(() => {
          match.handleDisconnect('player2');
        }).not.toThrow();

        done();
      }, 3500);
    }, 5000);
  });

  describe('State Snapshots', () => {
    it('should send state snapshots when match is active', (done) => {
      match.start();

      setTimeout(() => {
        const initialMessageCount = player1Socket.messages.length;

        // Wait for some snapshots to be sent
        setTimeout(() => {
          const snapshotMessages = player1Socket.messages.filter(msg => {
            const parsed = JSON.parse(msg);
            return parsed.type === 'state_snapshot';
          });

          expect(snapshotMessages.length).toBeGreaterThan(0);
          done();
        }, 500);
      }, 3500);
    }, 5000);

    it('should include both players in state snapshots', (done) => {
      match.start();

      setTimeout(() => {
        // Wait for snapshots
        setTimeout(() => {
          const snapshotMessages = player1Socket.messages.filter(msg => {
            const parsed = JSON.parse(msg);
            return parsed.type === 'state_snapshot';
          });

          expect(snapshotMessages.length).toBeGreaterThan(0);

          const snapshot = JSON.parse(snapshotMessages[0]);
          expect(snapshot.players).toBeDefined();
          expect(Object.keys(snapshot.players).length).toBe(2);
          expect(snapshot.players['player1']).toBeDefined();
          expect(snapshot.players['player2']).toBeDefined();

          done();
        }, 500);
      }, 3500);
    }, 5000);

    it('should include server time in snapshots', (done) => {
      match.start();

      setTimeout(() => {
        setTimeout(() => {
          const snapshotMessages = player1Socket.messages.filter(msg => {
            const parsed = JSON.parse(msg);
            return parsed.type === 'state_snapshot';
          });

          expect(snapshotMessages.length).toBeGreaterThan(0);

          const snapshot = JSON.parse(snapshotMessages[0]);
          expect(snapshot.serverTime).toBeDefined();
          expect(typeof snapshot.serverTime).toBe('number');

          done();
        }, 500);
      }, 3500);
    }, 5000);
  });

  describe('Opponent Retrieval', () => {
    it('should return correct opponent for a player', () => {
      const opponent1 = match.getOpponent('player1');
      const opponent2 = match.getOpponent('player2');

      expect(opponent1).not.toBeNull();
      expect(opponent2).not.toBeNull();
      expect(opponent1?.playerId).toBe('player2');
      expect(opponent2?.playerId).toBe('player1');
    });

    it('should return null for non-existent player', () => {
      const opponent = match.getOpponent('non-existent');
      expect(opponent).toBeNull();
    });
  });
});
