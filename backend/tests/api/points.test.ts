/**
 * Points Controller API Tests
 * Tests for points management endpoints
 */

import request from 'supertest';
import express, { Express } from 'express';

// Import the controller
import pointsController from '../../src/controllers/points.controller';

// Create a test app
const createTestApp = (): Express => {
  const app = express();
  app.use(express.json());

  // Mount the controller
  app.use('/api/points', pointsController);

  return app;
};

describe('Points API', () => {
  let app: Express;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('POST /api/points/add', () => {
    it('should require userId', async () => {
      const response = await request(app)
        .post('/api/points/add')
        .send({ reason: 'good interaction' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'userId is required');
    });

    it('should require reason', async () => {
      const response = await request(app)
        .post('/api/points/add')
        .send({ userId: 'testuser' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'reason is required');
    });

    it('should add points for valid request', async () => {
      const response = await request(app)
        .post('/api/points/add')
        .send({ userId: 'testuser', reason: 'good interaction' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('points');
      expect(response.body).toHaveProperty('message');
    });

    it('should include reason in success message when not on cooldown', async () => {
      // Use a unique user to avoid cooldown from prior tests
      const uniqueUser = `reason-test-${Date.now()}`;
      const response = await request(app)
        .post('/api/points/add')
        .send({ userId: uniqueUser, reason: 'excellent work' });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('excellent work');
    });
  });

  describe('POST /api/points/status', () => {
    it('should require userId', async () => {
      const response = await request(app)
        .post('/api/points/status')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'userId is required');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .post('/api/points/status')
        .send({ userId: 'nonexistentuser12345' });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'User not found');
    });

    it('should return user status for existing user', async () => {
      // First add points to create user
      await request(app)
        .post('/api/points/add')
        .send({ userId: 'statususer', reason: 'test' });

      // Then get status
      const response = await request(app)
        .post('/api/points/status')
        .send({ userId: 'statususer' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('points');
      expect(response.body).toHaveProperty('basePoints');
      expect(response.body).toHaveProperty('onCooldown');
      expect(response.body).toHaveProperty('lastInteraction');
    });

    it('should calculate pointsAboveBase correctly', async () => {
      // Add points
      await request(app)
        .post('/api/points/add')
        .send({ userId: 'pointsuser', reason: 'test' });

      // Get status
      const response = await request(app)
        .post('/api/points/status')
        .send({ userId: 'pointsuser' });

      expect(response.body.pointsAboveBase).toBe(response.body.points - response.body.basePoints);
    });

    it('should have correct cooldown status', async () => {
      // Add points
      await request(app)
        .post('/api/points/add')
        .send({ userId: 'cooldownuser', reason: 'test' });

      // Get status immediately - should be on cooldown
      const response = await request(app)
        .post('/api/points/status')
        .send({ userId: 'cooldownuser' });

      expect(response.body.onCooldown).toBe(true);
      expect(response.body.timeUntilFullPoints).toBeGreaterThan(0);
    });
  });

  describe('GET /api/points/leaderboard', () => {
    it('should return leaderboard', async () => {
      const response = await request(app)
        .get('/api/points/leaderboard');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('leaderboard');
      expect(response.body.leaderboard).toHaveProperty('rankings');
      expect(Array.isArray(response.body.leaderboard.rankings)).toBe(true);
    });

    it('should return leaderboard entries with required fields', async () => {
      const response = await request(app)
        .get('/api/points/leaderboard');

      const rankings = response.body.leaderboard.rankings;
      expect(Array.isArray(rankings)).toBe(true);
      if (rankings.length > 0) {
        const firstEntry = rankings[0];
        expect(firstEntry).toHaveProperty('avatar');
        expect(firstEntry).toHaveProperty('name');
        expect(firstEntry).toHaveProperty('score');
        expect(firstEntry).toHaveProperty('rank');
      }
    });
  });

  describe('POST /api/points/reset', () => {
    it('should require userId', async () => {
      const response = await request(app)
        .post('/api/points/reset')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'userId is required');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .post('/api/points/reset')
        .send({ userId: 'nonexistentuser12345' });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'User not found');
    });

    it('should reset user to base score', async () => {
      // Use a user from BASE_SCORES that can be reset
      const userId = 'goose';

      // Add points to create user with points above base
      await request(app)
        .post('/api/points/add')
        .send({ userId, reason: 'test' });

      // Reset user
      const resetResponse = await request(app)
        .post('/api/points/reset')
        .send({ userId });

      expect(resetResponse.status).toBe(200);
      expect(resetResponse.body).toHaveProperty('success', true);
      expect(resetResponse.body).toHaveProperty('message', 'User reset to base score');

      // Get status after reset
      const afterReset = await request(app)
        .post('/api/points/status')
        .send({ userId });

      // Points should be back to base
      expect(afterReset.body.points).toBe(afterReset.body.basePoints);
    });
  });
});
