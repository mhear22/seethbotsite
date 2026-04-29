import { Router, Request, Response } from 'express';
import { getClickCount, incrementClick, resetClick } from '../db';
import { requireApiKey } from '../auth';
import { pointsManager } from '../services/points-manager';

const router = Router();

/**
 * @openapi
 * /api/clicks:
 *   get:
 *     tags: [Clicks]
 *     summary: Get click count
 *     description: Returns the current click counter value
 *     responses:
 *       200:
 *         description: Click count retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   example: 42
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/clicks', async (req: Request, res: Response) => {
  try {
    const count = await getClickCount();
    res.json({ count, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Error getting click count:', error);
    res.status(500).json({ error: 'Failed to get click count' });
  }
});

/**
 * @openapi
 * /api/clicks/increment:
 *   post:
 *     tags: [Clicks]
 *     summary: Increment click counter
 *     description: Increments the click counter by 1. Requires authentication.
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Counter incremented successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   example: 43
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/clicks/increment',
  requireApiKey(),
  async (req: Request, res: Response) => {
    try {
      const newCount = await incrementClick();
      res.json({ count: newCount, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('Error incrementing click:', error);
      res.status(500).json({ error: 'Failed to increment click' });
    }
  }
);

/**
 * @openapi
 * /api/clicks/reset:
 *   post:
 *     tags: [Clicks]
 *     summary: Reset click counter
 *     description: Resets the click counter to 0. Requires authentication.
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Counter reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   example: 0
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/clicks/reset',
  requireApiKey(),
  async (req: Request, res: Response) => {
    try {
      const newCount = await resetClick();
      res.json({ count: newCount, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('Error resetting clicks:', error);
      res.status(500).json({ error: 'Failed to reset clicks' });
    }
  }
);

/**
 * @openapi
 * /api/clicks/add-points:
 *   post:
 *     tags: [Clicks]
 *     summary: Add points to rankings based on clicks
 *     description: Adds points to user's rankings based on their clicker activity
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID
 *               clicks:
 *                 type: integer
 *                 description: Number of clicks to convert to points
 *     responses:
 *       200:
 *         description: Points added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 points:
 *                   type: integer
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 */
router.post('/clicks/add-points', (req: Request, res: Response) => {
  try {
    const { userId, clicks } = req.body;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'userId is required' });
    }

    if (!clicks || typeof clicks !== 'number' || clicks < 0) {
      return res.status(400).json({ error: 'valid clicks value is required' });
    }

    // Convert clicks to points (1 click = 1 point)
    let totalPoints = 0;
    for (let i = 0; i < clicks; i++) {
      const result = pointsManager.addPoints(userId, 'clicker');
      if (result.success) {
        totalPoints += result.points;
      }
    }

    res.json({
      success: true,
      points: totalPoints,
      message: `Added ${totalPoints} points to rankings`
    });
  } catch (error) {
    console.error('Error adding points:', error);
    res.status(500).json({ error: 'Failed to add points' });
  }
});

export default router;
