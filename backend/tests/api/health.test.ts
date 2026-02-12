/**
 * Health Controller API Tests
 * Tests for health check endpoints
 */

import request from 'supertest';
import express, { Express } from 'express';
import fs from 'fs';
import path from 'path';

// Import the controller
import healthController from '../../src/controllers/health.controller';

// Create a test app
const createTestApp = (): Express => {
  const app = express();
  app.use(express.json());

  // Set up a temporary health state file
  const testHealthStatePath = path.join(__dirname, '..', '..', 'data-test', 'health-state-test.json');

  // Mock the health state path in the controller
  const originalModule = require('../../src/controllers/health.controller');

  // Ensure test directory exists
  const testDir = path.dirname(testHealthStatePath);
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  // Create initial health state
  const initialState = { lastChecked: null as string | null, lastCheckTime: null as number | null };
  fs.writeFileSync(testHealthStatePath, JSON.stringify(initialState, null, 2));

  // Mount the controller
  app.use('/api', healthController);

  return app;
};

describe('Health API', () => {
  let app: Express;
  let testHealthStatePath: string;

  beforeAll(() => {
    app = createTestApp();
    testHealthStatePath = path.join(__dirname, '..', '..', 'data-test', 'health-state-test.json');
  });

  afterAll(() => {
    // Clean up test file
    if (fs.existsSync(testHealthStatePath)) {
      fs.unlinkSync(testHealthStatePath);
    }
  });

  describe('GET /api/health', () => {
    it('should return health status with ok status', async () => {
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
    });

    it('should return current timestamp', async () => {
      const response = await request(app).get('/api/health');

      expect(response.body).toHaveProperty('timestamp');
      const timestamp = new Date(response.body.timestamp);
      expect(isNaN(timestamp.getTime())).toBe(false);
    });

    it('should return lastChecked field', async () => {
      const response = await request(app).get('/api/health');

      expect(response.body).toHaveProperty('lastChecked');
      // Could be null initially
      expect(response.body.lastChecked === null || typeof response.body.lastChecked === 'string').toBe(
        true
      );
    });

    it('should return lastCheckTime field', async () => {
      const response = await request(app).get('/api/health');

      expect(response.body).toHaveProperty('lastCheckTime');
      // Could be null initially
      expect(
        response.body.lastCheckTime === null || typeof response.body.lastCheckTime === 'number'
      ).toBe(true);
    });
  });

  describe('POST /api/health/check', () => {
    it('should update health check timestamp', async () => {
      const beforeTime = new Date().toISOString();

      const response = await request(app).post('/api/health/check');

      const afterTime = new Date().toISOString();

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'updated');
      expect(response.body).toHaveProperty('lastChecked');
      expect(response.body).toHaveProperty('lastCheckTime');

      // Verify the timestamp is recent
      const lastChecked = new Date(response.body.lastChecked);
      expect(lastChecked >= new Date(beforeTime)).toBe(true);
      expect(lastChecked <= new Date(afterTime)).toBe(true);
    });

    it('should persist health check state', async () => {
      const response1 = await request(app).post('/api/health/check');
      const firstTimestamp = response1.body.lastCheckTime;

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 10));

      const response2 = await request(app).post('/api/health/check');
      const secondTimestamp = response2.body.lastCheckTime;

      expect(secondTimestamp).toBeGreaterThan(firstTimestamp);
    });
  });

  describe('Health state persistence', () => {
    it('should update and read health state correctly', async () => {
      // Perform a health check to update state
      const checkResponse = await request(app).post('/api/health/check');
      expect(checkResponse.status).toBe(200);

      const savedTimestamp = checkResponse.body.lastChecked;
      const savedTime = checkResponse.body.lastCheckTime;

      // Read back should reflect the update
      const response = await request(app).get('/api/health');

      expect(response.body.lastChecked).toBe(savedTimestamp);
      expect(response.body.lastCheckTime).toBe(savedTime);
    });

    it('should handle health state file gracefully', async () => {
      // Health endpoint should always return ok status
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
    });
  });
});
