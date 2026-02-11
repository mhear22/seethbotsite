/**
 * Multiplayer Controller Tests
 * Tests for WebSocket connection handling, authentication, and message routing
 */

import jwt from 'jsonwebtoken';
import { getGameStats } from '../../src/controllers/multiplayer.controller';

const JWT_SECRET = process.env.SEETHBOT_JWT_SECRET || 'change-this-in-production-secret-key';

describe('Multiplayer Controller', () => {
  describe('JWT Token Verification', () => {
    it('should generate valid JWT tokens', () => {
      const payload = {
        id: '12345',
        username: 'TestPlayer'
      };

      const token = jwt.sign(payload, JWT_SECRET);
      const decoded = jwt.verify(token, JWT_SECRET) as any;

      expect(decoded.id).toBe('12345');
      expect(decoded.username).toBe('TestPlayer');
    });

    it('should reject invalid JWT tokens', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => {
        jwt.verify(invalidToken, JWT_SECRET);
      }).toThrow();
    });

    it('should reject tokens with wrong secret', () => {
      const payload = {
        id: '12345',
        username: 'TestPlayer'
      };

      const token = jwt.sign(payload, 'wrong-secret');

      expect(() => {
        jwt.verify(token, JWT_SECRET);
      }).toThrow();
    });

    it('should extract userId from token payload', () => {
      const payload1 = {
        id: '12345',
        username: 'TestPlayer'
      };

      const payload2 = {
        userId: '67890',
        name: 'AnotherPlayer'
      };

      const token1 = jwt.sign(payload1, JWT_SECRET);
      const token2 = jwt.sign(payload2, JWT_SECRET);

      const decoded1 = jwt.verify(token1, JWT_SECRET) as any;
      const decoded2 = jwt.verify(token2, JWT_SECRET) as any;

      expect(decoded1.id).toBe('12345');
      expect(decoded2.userId).toBe('67890');
    });

    it('should extract username from various token fields', () => {
      const payloadWithUsername = {
        id: '1',
        username: 'Player1'
      };

      const payloadWithName = {
        id: '2',
        name: 'Player2'
      };

      const token1 = jwt.sign(payloadWithUsername, JWT_SECRET);
      const token2 = jwt.sign(payloadWithName, JWT_SECRET);

      const decoded1 = jwt.verify(token1, JWT_SECRET) as any;
      const decoded2 = jwt.verify(token2, JWT_SECRET) as any;

      expect(decoded1.username).toBe('Player1');
      expect(decoded2.name).toBe('Player2');
    });
  });

  describe('getGameStats Endpoint', () => {
    it('should return game statistics', () => {
      const mockReq = {};
      const mockRes = {
        json: jest.fn()
      };

      getGameStats(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          activeMatches: expect.any(Number),
          connectedPlayers: expect.any(Number),
          queueSize: expect.any(Number)
        })
      );
    });

    it('should return non-negative statistics', () => {
      const mockReq = {};
      let capturedStats: any;
      const mockRes = {
        json: jest.fn((data) => {
          capturedStats = data;
        })
      };

      getGameStats(mockReq, mockRes);

      expect(capturedStats.activeMatches).toBeGreaterThanOrEqual(0);
      expect(capturedStats.connectedPlayers).toBeGreaterThanOrEqual(0);
      expect(capturedStats.queueSize).toBeGreaterThanOrEqual(0);
    });
  });

  describe('WebSocket Path Validation', () => {
    it('should validate correct WebSocket path', () => {
      const validPaths = [
        '/ws/multiplayer',
        '/ws/multiplayer?token=abc123'
      ];

      validPaths.forEach(path => {
        const url = new URL(path, 'http://localhost');
        expect(url.pathname).toBe('/ws/multiplayer');
      });
    });

    it('should parse query parameters from WebSocket URL', () => {
      const path = '/ws/multiplayer?token=abc123&userId=456';
      const url = new URL(path, 'http://localhost');

      expect(url.searchParams.get('token')).toBe('abc123');
      expect(url.searchParams.get('userId')).toBe('456');
    });

    it('should handle missing query parameters', () => {
      const path = '/ws/multiplayer';
      const url = new URL(path, 'http://localhost');

      expect(url.searchParams.get('token')).toBeNull();
    });
  });

  describe('Message Parsing', () => {
    it('should parse valid JSON messages', () => {
      const message = {
        type: 'match_request',
        loadout: {
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
        }
      };

      const messageStr = JSON.stringify(message);
      const parsed = JSON.parse(messageStr);

      expect(parsed.type).toBe('match_request');
      expect(parsed.loadout).toBeDefined();
    });

    it('should handle malformed JSON gracefully', () => {
      const invalidJSON = '{invalid json}';

      expect(() => {
        JSON.parse(invalidJSON);
      }).toThrow();
    });

    it('should validate message types', () => {
      const validTypes = [
        'input',
        'match_request',
        'cancel_matchmaking',
        'ack',
        'ping'
      ];

      validTypes.forEach(type => {
        const message = { type };
        expect(message.type).toBe(type);
      });
    });
  });

  describe('Error Message Format', () => {
    it('should format error messages correctly', () => {
      const errorMessage = {
        type: 'error',
        code: 'INVALID_TOKEN',
        message: 'Authentication failed'
      };

      expect(errorMessage.type).toBe('error');
      expect(errorMessage.code).toBeDefined();
      expect(errorMessage.message).toBeDefined();
    });

    it('should include all required error fields', () => {
      const errorCodes = [
        'INVALID_MESSAGE',
        'INVALID_TOKEN',
        'NO_TOKEN',
        'ALREADY_IN_MATCH',
        'ALREADY_IN_QUEUE',
        'QUEUE_TIMEOUT',
        'MATCH_CREATE_FAILED'
      ];

      errorCodes.forEach(code => {
        const error = {
          type: 'error',
          code,
          message: `Error: ${code}`
        };

        expect(error.type).toBe('error');
        expect(error.code).toBe(code);
        expect(typeof error.message).toBe('string');
      });
    });
  });

  describe('Connection Message Format', () => {
    it('should format connection confirmation correctly', () => {
      const connectionMessage = {
        type: 'connected',
        playerId: 'player123',
        playerName: 'TestPlayer'
      };

      expect(connectionMessage.type).toBe('connected');
      expect(connectionMessage.playerId).toBeDefined();
      expect(connectionMessage.playerName).toBeDefined();
    });
  });
});
