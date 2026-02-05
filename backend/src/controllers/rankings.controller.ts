import { Router, Request, Response } from 'express';
import { pointsManager } from '../services/points-manager';

const router = Router();

/**
 * @openapi
 * /api/rankings:
 *   get:
 *     tags: [Rankings]
 *     summary: Get user rankings and leaderboard
 *     description: Returns the current leaderboard with dynamic point tracking
 *     responses:
 *       200:
 *         description: User rankings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rankings:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       avatar:
 *                         type: string
 *                         example: 🥔
 *                       name:
 *                         type: string
 *                         example: Cam
 *                       score:
 *                         type: integer
 *                         example: 10000
 *                       isCurrentUser:
 *                         type: boolean
 *                         example: false
 */
router.get('/rankings', (req: Request, res: Response) => {
  const leaderboard = pointsManager.getLeaderboard();
  res.json({
    ...leaderboard,
    timestamp: new Date().toISOString()
  });
});

export default router;
