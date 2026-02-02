import { Router, Request, Response } from 'express';
import { getClickCount, incrementClick, resetClick } from '../db';
import { requireApiKey } from '../auth';

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
router.get('/clicks', (req: Request, res: Response) => {
  try {
    const count = getClickCount();
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
  (req: Request, res: Response) => {
    try {
      const newCount = incrementClick();
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
  (req: Request, res: Response) => {
    try {
      const newCount = resetClick();
      res.json({ count: newCount, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('Error resetting clicks:', error);
      res.status(500).json({ error: 'Failed to reset clicks' });
    }
  }
);

export default router;
