import { Router, Request, Response } from 'express';
import { fartService } from '../services/fart-service';

const router = Router();

/**
 * Fart Controller
 * Handles all fart-related API endpoints for the Fart-o-meter feature
 */

/**
 * @openapi
 * /api/farts/stats:
 *   get:
 *     tags: [Farts]
 *     summary: Get overall fart statistics
 *     description: Returns overall fart statistics including total farts, users, and volume metrics
 *     responses:
 *       200:
 *         description: Overall fart statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalFarts:
 *                   type: integer
 *                   example: 1234
 *                 totalUsers:
 *                   type: integer
 *                   example: 42
 *                 totalVolume:
 *                   type: number
 *                   example: 567.89
 *                 avgVolume:
 *                   type: number
 *                   example: 0.46
 *                 todayFarts:
 *                   type: integer
 *                   example: 56
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await fartService.getFartStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting fart stats:', error);
    res.status(500).json({ error: 'Failed to get fart statistics' });
  }
});

/**
 * @openapi
 * /api/farts/stats/{userId}:
 *   get:
 *     tags: [Farts]
 *     summary: Get user fart statistics
 *     description: Returns fart statistics for a specific user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User fart statistics
 *       404:
 *         description: User not found
 */
router.get('/stats/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const stats = await fartService.getUserFartStats(userId);
    
    if (!stats) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    res.json(stats);
  } catch (error) {
    console.error('Error getting user fart stats:', error);
    res.status(500).json({ error: 'Failed to get user fart statistics' });
  }
});

/**
 * @openapi
 * /api/farts/record:
 *   post:
 *     tags: [Farts]
 *     summary: Record a fart event
 *     description: Records a fart event with parameters and updates statistics
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 default: anonymous
 *               volume:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 1
 *                 default: 0.5
 *               parameters:
 *                 type: object
 *                 properties:
 *                   bassGain:
 *                     type: number
 *                   bassFrequency:
 *                     type: number
 *                   distortionAmount:
 *                     type: number
 *                   volumeMultiplier:
 *                     type: number
 *                   playbackRate:
 *                     type: number
 *     responses:
 *       200:
 *         description: Fart recorded successfully
 */
router.post('/record', async (req: Request, res: Response) => {
  try {
    const { userId, volume, parameters } = req.body;
    
    const result = await fartService.recordFart({
      userId: userId || 'anonymous',
      volume: volume || 0.5,
      parameters: parameters || {},
      timestamp: new Date().toISOString()
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error recording fart:', error);
    res.status(500).json({ error: 'Failed to record fart' });
  }
});

/**
 * @openapi
 * /api/farts/leaderboard:
 *   get:
 *     tags: [Farts]
 *     summary: Get fart leaderboard
 *     description: Returns top farters ranked by total farts
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Leaderboard data
 */
router.get('/leaderboard', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const leaderboard = await fartService.getFartLeaderboard(limit);
    res.json(leaderboard);
  } catch (error) {
    console.error('Error getting fart leaderboard:', error);
    res.status(500).json({ error: 'Failed to get fart leaderboard' });
  }
});

/**
 * @openapi
 * /api/farts/history/{userId}:
 *   get:
 *     tags: [Farts]
 *     summary: Get user fart history
 *     description: Returns recent fart events for a specific user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: User fart history
 */
router.get('/history/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;
    const history = await fartService.getFartHistory(userId, limit);
    res.json(history);
  } catch (error) {
    console.error('Error getting fart history:', error);
    res.status(500).json({ error: 'Failed to get fart history' });
  }
});

/**
 * @openapi
 * /api/farts/processing-stats:
 *   get:
 *     tags: [Farts]
 *     summary: Get processing statistics
 *     description: Returns audio processing statistics and trends
 *     responses:
 *       200:
 *         description: Processing statistics
 */
router.get('/processing-stats', async (req: Request, res: Response) => {
  try {
    const stats = await fartService.getProcessingStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting processing stats:', error);
    res.status(500).json({ error: 'Failed to get processing statistics' });
  }
});

/**
 * @openapi
 * /api/farts/daily:
 *   get:
 *     tags: [Farts]
 *     summary: Get daily fart statistics
 *     description: Returns daily fart trends and statistics
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 *     responses:
 *       200:
 *         description: Daily statistics
 */
router.get('/daily', async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    const stats = await fartService.getDailyFartStats(days);
    res.json(stats);
  } catch (error) {
    console.error('Error getting daily fart stats:', error);
    res.status(500).json({ error: 'Failed to get daily fart statistics' });
  }
});

export default router;