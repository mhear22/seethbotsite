import { Router, Request, Response } from 'express';

const router = Router();

interface VersionInfo {
  gitHash: string;
  gitBranch: string;
  buildTime: string;
  version: string;
  environment: string;
}

/**
 * @openapi
 * /api/version:
 *   get:
 *     tags: [Version]
 *     summary: Get version and build information
 *     description: Returns git hash, branch, build time, and version information
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
 */
router.get('/version', (req: Request, res: Response) => {
  const versionInfo: VersionInfo = {
    gitHash: process.env.GIT_HASH || 'unknown',
    gitBranch: process.env.GIT_BRANCH || 'unknown',
    buildTime: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'production'
  };

  res.json({
    ...versionInfo,
    timestamp: new Date().toISOString()
  });
});

export default router;