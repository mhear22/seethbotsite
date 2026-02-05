import { Router, Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

const router = Router();

interface VersionInfo {
  gitHash: string;
  gitBranch: string;
  buildTime: string;
  version: string;
  environment: string;
  buildCount: number;
}

// Read build info from file generated during build
let buildInfoCache: VersionInfo | null = null;

const loadBuildInfo = (): VersionInfo => {
  if (buildInfoCache) {
    return buildInfoCache;
  }

  try {
    // Try both possible paths: in production (app/backend) and development (dist/backend)
    const possiblePaths = [
      path.join(__dirname, '..', 'build-info.json'),  // /app/backend/dist/../build-info.json -> /app/backend/build-info.json
      path.join(__dirname, '..', '..', 'build-info.json'),  // /app/backend/dist/controllers/../../build-info.json -> /app/backend/build-info.json
    ];
    
    let buildData = null;
    for (const buildInfoPath of possiblePaths) {
      try {
        buildData = fs.readFileSync(buildInfoPath, 'utf-8');
        break;
      } catch (err) {
        // Try next path
        continue;
      }
    }
    
    if (!buildData) {
      throw new Error('Could not find build-info.json in any expected location');
    }
    
    const info = JSON.parse(buildData);
    buildInfoCache = {
      gitHash: info.gitHash || 'unknown',
      gitBranch: info.gitBranch || 'unknown',
      buildTime: info.buildTime || new Date().toISOString(),
      version: info.version || '1.0.0',
      environment: process.env.NODE_ENV || 'production',
      buildCount: info.buildCount || 1
    };
    return buildInfoCache;
  } catch (error) {
    console.warn('Could not load build-info.json, using defaults');
    return {
      gitHash: process.env.GIT_HASH || 'unknown',
      gitBranch: process.env.GIT_BRANCH || 'unknown',
      buildTime: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'production',
      buildCount: 1
    };
  }
};

/**
 * @openapi
 * /api/version:
 *   get:
 *     tags: [Version]
 *     summary: Get version and build information
 *     description: Returns git hash, branch, build time, version, and build count information
 *     responses:
 *       200:
 *         description: Version information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 gitHash:
 *                   type: string
 *                   example: "1ab857e"
 *                   description: Git commit hash
 *                 gitBranch:
 *                   type: string
 *                   example: "main"
 *                   description: Git branch name
 *                 buildTime:
 *                   type: string
 *                   format: date-time
 *                   example: "2026-02-03T10:30:00.000Z"
 *                   description: ISO 8601 build timestamp
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                   description: Application version
 *                 environment:
 *                   type: string
 *                   example: "production"
 *                   description: Deployment environment
 *                 buildCount:
 *                   type: number
 *                   example: 42
 *                   description: Total number of builds
 *                 currentTimestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2026-02-03T10:30:00.000Z"
 *                   description: Current server time
 */
router.get('/version', (req: Request, res: Response) => {
  const versionInfo = loadBuildInfo();

  res.json({
    ...versionInfo,
    currentTimestamp: new Date().toISOString()
  });
});

export default router;