import { Router, Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

const router = Router();
// In production: __dirname is /app/backend/dist/controllers, data is at /app/backend/data
// Go up two levels: /app/backend/dist/controllers -> /app/backend/dist -> /app/backend
const HEALTH_STATE_PATH = path.resolve(__dirname, '../../data/health-state.json');

// Initialize health state file if it doesn't exist
if (!fs.existsSync(HEALTH_STATE_PATH)) {
  const initialState: { lastChecked: Date | null; lastCheckTime: number | null } = { lastChecked: null, lastCheckTime: null };
  // Ensure the directory exists before writing
  const dir = path.dirname(HEALTH_STATE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(HEALTH_STATE_PATH, JSON.stringify(initialState, null, 2));
}

/**
 * @openapi
 * /api/health:
 *   get:
 *     tags: [Health]
 *     summary: Check API health status
 *     description: Returns the current health status of the API and when it was last checked by the bot
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   description: Current server time
 *                 lastChecked:
 *                   type: string
 *                   format: date-time
 *                   description: Last time the bot performed a health check
 */
router.get('/health', (req: Request, res: Response) => {
  try {
    // Read the health state
    const healthState = JSON.parse(fs.readFileSync(HEALTH_STATE_PATH, 'utf-8'));

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      lastChecked: healthState.lastChecked,
      lastCheckTime: healthState.lastCheckTime
    });
  } catch (error) {
    // If file read fails, still return health but without last checked time
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      lastChecked: null,
      lastCheckTime: null,
      error: 'Could not read health state'
    });
  }
});

/**
 * @openapi
 * /api/health/check:
 *   post:
 *     tags: [Health]
 *     summary: Update health check timestamp
 *     description: Records that the bot has performed a health check
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Health check timestamp updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: updated
 *                 lastChecked:
 *                   type: string
 *                   format: date-time
 */
router.post('/health/check', (req: Request, res: Response) => {
  try {
    const now = new Date();
    const healthState = {
      lastChecked: now.toISOString(),
      lastCheckTime: now.getTime()
    };

    fs.writeFileSync(HEALTH_STATE_PATH, JSON.stringify(healthState, null, 2));

    res.json({
      status: 'updated',
      lastChecked: healthState.lastChecked,
      lastCheckTime: healthState.lastCheckTime
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: 'Failed to update health state'
    });
  }
});

export default router;
