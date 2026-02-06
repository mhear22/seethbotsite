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

    it('should include reason in success message', async () => {
      const response = await request(app)
        .post('/api/points/add')
        .send({ userId: 'testuser', reason: 'excellent work' });

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
      expect(Array.isArray(response.body.leaderboard)).toBe(true);
    });

    it('should return leaderboard entries with required fields', async () => {
      // Add some points
      await request(app)
        .post('/api/points/add')
        .send({ userId: 'leader1', reason: 'test' });
      await request(app)
        .post('/api/points/add')
        .send({ userId: 'leader2', reason: 'test' });

      const response = await request(app)
        .get('/api/points/leaderboard');

      expect(Array.isArray(response.body.leaderboard)).toBe(true);
      if (response.body.leaderboard.length > 0) {
        const firstEntry = response.body.leaderboard[0];
        expect(firstEntry).toHaveProperty('avatar');
        expect(firstEntry).toHaveProperty('name');
        expect(firstEntry).toHaveProperty('score');
        expect(firstEntry).toHaveProperty('rank');
        expect(firstEntry).toHaveProperty('isCurrentUser');
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
      // Add points to create user with points above base
      await request(app)
        .post('/api/points/add')
        .send({ userId: 'resetuser', reason: 'test' });

      // Get status before reset
      const beforeReset = await request(app)
        .post('/api/points/status')
        .send({ userId: 'resetuser' });

      // Reset user
      const resetResponse = await request(app)
        .post('/api/points/reset')
        .send({ userId: 'resetuser' });

      expect(resetResponse.status).toBe(200);
      expect(resetResponse.body).toHaveProperty('success', true);
      expect(resetResponse.body).toHaveProperty('message', 'User reset to base score');

      // Get status after reset
      const afterReset = await request(app)
        .post('/api/points/status')
        .send({ userId: 'resetuser' });

      // Points should be back to base
      expect(afterReset.body.points).toBe(afterReset.body.basePoints);
    });
  });
});
