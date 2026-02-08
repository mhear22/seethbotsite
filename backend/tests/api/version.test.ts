/**
 * Version Controller API Tests
 * Tests for version and build information endpoints
 */

import request from 'supertest';
import express, { Express } from 'express';
import fs from 'fs';
import path from 'path';

// Import the controller
import versionController from '../../src/controllers/version.controller';

// Create a test app
const createTestApp = (buildInfoPath?: string): Express => {
  const app = express();
  app.use(express.json());

  // Set up a temporary build-info file if provided
  let testBuildInfoPath: string | null = null;

  if (buildInfoPath) {
    testBuildInfoPath = buildInfoPath;
    // Ensure test directory exists
    const testDir = path.dirname(testBuildInfoPath);
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    // Create initial build info
    const initialBuildInfo = {
      gitHash: 'abc123',
      gitBranch: 'test-branch',
      buildTime: '2026-02-09T00:00:00.000Z',
      version: '1.0.0',
      buildCount: 1
    };
    fs.writeFileSync(testBuildInfoPath, JSON.stringify(initialBuildInfo, null, 2));

    // Set environment variable to use test build info
    process.env.NODE_ENV = 'test';
  }

  // Mount the controller
  app.use('/api', versionController);

  return app;
};

describe('Version API', () => {
  let app: Express;
  let testBuildInfoPath: string;

  beforeAll(() => {
    testBuildInfoPath = path.join(__dirname, '..', '..', 'data-test', 'build-info-test.json');
    app = createTestApp(testBuildInfoPath);
  });

  afterAll(() => {
    // Clean up test file
    if (fs.existsSync(testBuildInfoPath)) {
      fs.unlinkSync(testBuildInfoPath);
    }
  });

  describe('GET /api/version', () => {
    it('should return version information', async () => {
      const response = await request(app).get('/api/version');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('gitHash');
      expect(response.body).toHaveProperty('gitBranch');
      expect(response.body).toHaveProperty('buildTime');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('environment');
      expect(response.body).toHaveProperty('buildCount');
    });

    it('should return git hash as string', async () => {
      const response = await request(app).get('/api/version');

      expect(response.body.gitHash).toBeDefined();
      expect(typeof response.body.gitHash).toBe('string');
    });

    it('should return git branch as string', async () => {
      const response = await request(app).get('/api/version');

      expect(response.body.gitBranch).toBeDefined();
      expect(typeof response.body.gitBranch).toBe('string');
    });

    it('should return build time as ISO string', async () => {
      const response = await request(app).get('/api/version');

      expect(response.body.buildTime).toBeDefined();
      expect(typeof response.body.buildTime).toBe('string');
      const buildTime = new Date(response.body.buildTime);
      expect(isNaN(buildTime.getTime())).toBe(false);
    });

    it('should return version as string', async () => {
      const response = await request(app).get('/api/version');

      expect(response.body.version).toBeDefined();
      expect(typeof response.body.version).toBe('string');
    });

    it('should return environment as string', async () => {
      const response = await request(app).get('/api/version');

      expect(response.body.environment).toBeDefined();
      expect(typeof response.body.environment).toBe('string');
    });

    it('should return build count as number', async () => {
      const response = await request(app).get('/api/version');

      expect(response.body.buildCount).toBeDefined();
      expect(typeof response.body.buildCount).toBe('number');
    });

    it('should return current timestamp', async () => {
      const response = await request(app).get('/api/version');

      expect(response.body).toHaveProperty('currentTimestamp');
      expect(typeof response.body.currentTimestamp).toBe('string');

      const currentTimestamp = new Date(response.body.currentTimestamp);
      expect(isNaN(currentTimestamp.getTime())).toBe(false);
    });

    it('should return a recent current timestamp', async () => {
      const beforeTime = new Date();
      const response = await request(app).get('/api/version');
      const afterTime = new Date();

      const currentTimestamp = new Date(response.body.currentTimestamp);
      expect(currentTimestamp >= beforeTime).toBe(true);
      expect(currentTimestamp <= afterTime).toBe(true);
    });
  });

  describe('Version API error handling', () => {
    it('should handle missing build-info file gracefully', async () => {
      // Create app without build-info file
      const appWithoutInfo = createTestApp();

      const response = await request(appWithoutInfo).get('/api/version');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('gitHash');
      expect(response.body).toHaveProperty('gitBranch');
      expect(response.body).toHaveProperty('buildTime');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('environment');
      expect(response.body).toHaveProperty('buildCount');

      // Should fall back to environment variables or defaults
      expect(['unknown', 'production', 'development', 'test']).toContain(response.body.environment);
    });

    it('should use cached build info on subsequent calls', async () => {
      const response1 = await request(app).get('/api/version');
      const firstGitHash = response1.body.gitHash;
      const firstBuildTime = response1.body.buildTime;

      const response2 = await request(app).get('/api/version');
      const secondGitHash = response2.body.gitHash;
      const secondBuildTime = response2.body.buildTime;

      // Build info should be cached
      expect(secondGitHash).toBe(firstGitHash);
      expect(secondBuildTime).toBe(firstBuildTime);
    });
  });
});
