import { Router, Request, Response } from 'express';
import {
  getActivityFeed,
  getGlobalActivity,
  getUserActivityStats,
  ActivityType
} from '../activityFeedDb';

const router = Router();

/**
 * @openapi
 * /api/activity-feed:
 *   get:
 *     tags: [Activity Feed]
 *     summary: Get global activity feed
 *     description: Returns recent activities from all users
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of activities to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Offset for pagination
 *     responses:
 *       200:
 *         description: Activity feed retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 activities:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       userId:
 *                         type: string
 *                       userName:
 *                         type: string
 *                       userAvatar:
 *                         type: string
 *                       activityType:
 *                         type: string
 *                       description:
 *                         type: string
 *                       metadata:
 *                         type: object
 *                       pointsChange:
 *                         type: integer
 *                       gameType:
 *                         type: string
 *                       recordedAt:
 *                         type: string
 *                         format: date-time
 *                 timestamp:
 *                   type: string
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const activities = await getGlobalActivity({ limit, offset });

    res.json({
      activities,
      count: activities.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting activity feed:', error);
    res.status(500).json({ error: 'Failed to get activity feed' });
  }
});

/**
 * @openapi
 * /api/activity-feed/user/{userId}:
 *   get:
 *     tags: [Activity Feed]
 *     summary: Get activity feed for a specific user
 *     description: Returns activities for a specific user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of activities to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Offset for pagination
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [points_earned, points_bulk, achievement_unlocked, high_score, challenge_completed, game_played, ranking_change, session_end]
 *         description: Filter by activity type
 *       - in: query
 *         name: gameType
 *         schema:
 *           type: string
 *           enum: [clicker, fishing]
 *         description: Filter by game type
 *     responses:
 *       200:
 *         description: User activity feed retrieved successfully
 */
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const activityType = req.query.type as ActivityType | undefined;
    const gameType = req.query.gameType as 'clicker' | 'fishing' | undefined;

    const activities = await getActivityFeed({
      userId,
      limit,
      offset,
      activityType,
      gameType
    });

    res.json({
      activities,
      count: activities.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting user activity feed:', error);
    res.status(500).json({ error: 'Failed to get user activity feed' });
  }
});

/**
 * @openapi
 * /api/activity-feed/stats/{userId}:
 *   get:
 *     tags: [Activity Feed]
 *     summary: Get activity statistics for a user
 *     description: Returns aggregated statistics for a user's activities
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User activity statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalActivities:
 *                   type: integer
 *                 pointsEarned:
 *                   type: integer
 *                 achievementsUnlocked:
 *                   type: integer
 *                 gamesPlayed:
 *                   type: integer
 */
router.get('/stats/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const stats = await getUserActivityStats(userId);

    res.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting user activity stats:', error);
    res.status(500).json({ error: 'Failed to get user activity stats' });
  }
});

/**
 * @openapi
 * /api/activity-feed/types:
 *   get:
 *     tags: [Activity Feed]
 *     summary: Get available activity types
 *     description: Returns list of all available activity types
 *     responses:
 *       200:
 *         description: Activity types retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 types:
 *                   type: array
 *                   items:
 *                     type: string
 */
router.get('/types', (req: Request, res: Response) => {
  res.json({
    types: Object.values(ActivityType)
  });
});

export default router;
