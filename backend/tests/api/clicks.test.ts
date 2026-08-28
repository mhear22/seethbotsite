/**
 * Clicks Controller API Tests
 * Tests for click counter endpoints
 */

import request from 'supertest';
import { registerApiKey } from '../../src/auth';

const TEST_API_KEY = 'test-suite-api-key';
registerApiKey(TEST_API_KEY);
import express, { Express } from 'express';

// Import the controller and database functions
import clicksController from '../../src/controllers/clicks.controller';
import { getClickCount, incrementClick, resetClick } from '../../src/db';

// Create a test app
const createTestApp = (): Express => {
  const app = express();
  app.use(express.json());
  // These suites exercise CRUD/flow logic, not auth (covered by auth.test.ts);
  // authenticate every request so the API-key middleware lets them through.
  app.use((req, _res, next) => {
    req.headers['x-api-key'] = TEST_API_KEY;
    next();
  });

  // Mount the controller
  app.use('/api', clicksController);

  return app;
};

describe('Clicks API', () => {
  let app: Express;

  beforeAll(() => {
    app = createTestApp();
  });

  beforeEach(async () => {
    // Reset click count before each test
    await resetClick();
  });

  describe('GET /api/clicks', () => {
    it('should return click count', async () => {
      const response = await request(app).get('/api/clicks');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('count');
      expect(typeof response.body.count).toBe('number');
      expect(response.body.count).toBeGreaterThanOrEqual(0);
    });

    it('should return timestamp', async () => {
      const response = await request(app).get('/api/clicks');

      expect(response.body).toHaveProperty('timestamp');
      expect(typeof response.body.timestamp).toBe('string');

      const timestamp = new Date(response.body.timestamp);
      expect(isNaN(timestamp.getTime())).toBe(false);
    });

    it('should return initial count of 0', async () => {
      const response = await request(app).get('/api/clicks');

      expect(response.body.count).toBe(0);
    });

    it('should return updated count after incrementing', async () => {
      // Increment a few times
      await incrementClick();
      await incrementClick();
      await incrementClick();

      const response = await request(app).get('/api/clicks');

      expect(response.body.count).toBe(3);
    });
  });

  describe('POST /api/clicks/increment', () => {
    it('should increment click count', async () => {
      const before = await getClickCount();

      const response = await request(app).post('/api/clicks/increment');

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(before + 1);
    });

    it('should return new count', async () => {
      await resetClick();
      const count1 = await getClickCount();

      await request(app).post('/api/clicks/increment');

      const response = await request(app).get('/api/clicks');

      expect(response.body.count).toBe(count1 + 1);
    });

    it('should return timestamp', async () => {
      const response = await request(app).post('/api/clicks/increment');

      expect(response.body).toHaveProperty('timestamp');
      expect(typeof response.body.timestamp).toBe('string');
    });

    it('should increment multiple times correctly', async () => {
      await resetClick();

      for (let i = 1; i <= 5; i++) {
        const response = await request(app).post('/api/clicks/increment');
        expect(response.body.count).toBe(i);
      }
    });
  });

  describe('POST /api/clicks/reset', () => {
    it('should reset click count to 0', async () => {
      // Increment a few times
      await request(app).post('/api/clicks/increment');
      await request(app).post('/api/clicks/increment');
      await request(app).post('/api/clicks/increment');

      // Reset
      const response = await request(app).post('/api/clicks/reset');

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(0);
    });

    it('should return timestamp', async () => {
      const response = await request(app).post('/api/clicks/reset');

      expect(response.body).toHaveProperty('timestamp');
      expect(typeof response.body.timestamp).toBe('string');
    });

    it('should handle reset when count is already 0', async () => {
      await resetClick();

      const response = await request(app).post('/api/clicks/reset');

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(0);
    });
  });

  describe('Click counter workflow', () => {
    it('should handle full workflow: get, increment, get, reset, get', async () => {
      // Get initial count
      const r1 = await request(app).get('/api/clicks');
      expect(r1.body.count).toBe(0);

      // Increment
      const r2 = await request(app).post('/api/clicks/increment');
      expect(r2.body.count).toBe(1);

      // Increment again
      const r3 = await request(app).post('/api/clicks/increment');
      expect(r3.body.count).toBe(2);

      // Get count
      const r4 = await request(app).get('/api/clicks');
      expect(r4.body.count).toBe(2);

      // Reset
      const r5 = await request(app).post('/api/clicks/reset');
      expect(r5.body.count).toBe(0);

      // Get final count
      const r6 = await request(app).get('/api/clicks');
      expect(r6.body.count).toBe(0);
    });

    it('should handle concurrent increments (basic test)', async () => {
      await resetClick();

      // Make multiple increment requests
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(request(app).post('/api/clicks/increment'));
      }

      const responses = await Promise.all(promises);

      // All should succeed
      responses.forEach(r => {
        expect(r.status).toBe(200);
      });

      // Final count should be 10
      const final = await request(app).get('/api/clicks');
      expect(final.body.count).toBe(10);
    });
  });

  describe('Error handling', () => {
    it('should handle database errors gracefully', async () => {
      // This test would need to mock the database to induce errors
      // For now, we test that endpoints return valid JSON
      const response = await request(app).get('/api/clicks');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/json/);
    });
  });
});
