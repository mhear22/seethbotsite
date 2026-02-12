import { Router, Request, Response } from 'express';
import {
  recordStat,
  updateHighScore,
  getStatsHistory,
  getUserStats,
  getLeaderboard,
  getGlobalStats,
  updateChallengeProgress,
  checkAchievements
} from '../statsDb';

const router = Router();

/**
 * @openapi
 * /api/stats/record:
 *   post:
 *     tags: [Stats]
 *     summary: Record a game stat event
 *     description: Records a game stat (click, fish caught, score, etc.)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - gameType
 *               - statType
 *               - value
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID
 *               userName:
 *                 type: string
 *                 description: User name (optional)
 *               gameType:
 *                 type: string
 *                 enum: [clicker, fishing]
 *               statType:
 *                 type: string
 *                 enum: [click, fish_caught, score, session_end]
 *               value:
 *                 type: number
 *               metadata:
 *                 type: object
 *                 description: Additional metadata
 *     responses:
 *       200:
 *         description: Stat recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/record', (req: Request, res: Response) => {
  try {
    const { userId, userName, gameType, statType, value, metadata } = req.body;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'userId is required' });
    }

    if (!gameType || !['clicker', 'fishing'].includes(gameType)) {
      return res.status(400).json({ error: 'Invalid gameType. Must be "clicker" or "fishing"' });
    }

    if (!statType || typeof statType !== 'string') {
      return res.status(400).json({ error: 'statType is required' });
    }

    const validStatTypes = ['click', 'fish_caught', 'score', 'session_end'];
    if (!validStatTypes.includes(statType)) {
      return res.status(400).json({ error: `Invalid statType. Must be one of: ${validStatTypes.join(', ')}` });
    }

    if (value === undefined || typeof value !== 'number') {
      return res.status(400).json({ error: 'value is required and must be a number' });
    }

    recordStat({
      userId,
      userName,
      gameType,
      statType: statType as 'click' | 'fish_caught' | 'score' | 'session_end',
      value,
      metadata
    });

    // Update daily challenge progress automatically
    try {
      updateChallengeProgress(userId, gameType, statType, value);
    } catch (error) {
      // Don't fail if challenge update fails
      console.warn('Could not update challenge progress:', error);
    }

    // Check for achievements automatically
    try {
      checkAchievements(userId);
    } catch (error) {
      // Don't fail if achievement check fails
      console.warn('Could not check achievements:', error);
    }

    res.json({
      success: true,
      message: 'Stat recorded successfully'
    });
  } catch (error) {
    console.error('Error recording stat:', error);
    res.status(500).json({ error: 'Failed to record stat' });
  }
});

/**
 * @openapi
 * /api/stats/highscore:
 *   post:
 *     tags: [Stats]
 *     summary: Update high score for a user
 *     description: Updates or inserts a high score for a user in a game
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - gameType
 *               - score
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID
 *               userName:
 *                 type: string
 *                 description: User name (optional)
 *               gameType:
 *                 type: string
 *                 enum: [clicker, fishing]
 *               score:
 *                 type: integer
 *               details:
 *                 type: object
 *                 description: Additional details about the high score
 *     responses:
 *       200:
 *         description: High score updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 isNewRecord:
 *                   type: boolean
 *                 score:
 *                   type: integer
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/highscore', async (req: Request, res: Response) => {
  try {
    const { userId, userName, gameType, score, details } = req.body;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'userId is required' });
    }

    if (!gameType || !['clicker', 'fishing'].includes(gameType)) {
      return res.status(400).json({ error: 'Invalid gameType. Must be "clicker" or "fishing"' });
    }

    if (score === undefined || typeof score !== 'number') {
      return res.status(400).json({ error: 'score is required and must be a number' });
    }

    const wasUpdated = await updateHighScore({
      userId,
      userName,
      gameType,
      score,
      details
    });

    const existingScore = (await getLeaderboard({ gameType, limit: 100 }))
      .find(entry => entry.userId === userId)?.score || 0;

    const isNewRecord = score > existingScore || !wasUpdated;

    res.json({
      success: true,
      isNewRecord,
      score,
      message: isNewRecord
        ? `New high score for ${gameType}: ${score}`
        : `Score recorded: ${score}`
    });
  } catch (error) {
    console.error('Error updating high score:', error);
    res.status(500).json({ error: 'Failed to update high score' });
  }
});

/**
 * @openapi
 * /api/stats/history:
 *   post:
 *     tags: [Stats]
 *     summary: Get stats history for a user
 *     description: Retrieves stats history for a user, optionally filtered by game type and stat type
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *               gameType:
 *                 type: string
 *                 enum: [clicker, fishing]
 *               statType:
 *                 type: string
 *               limit:
 *                 type: integer
 *                 default: 100
 *               offset:
 *                 type: integer
 *                 default: 0
 *     responses:
 *       200:
 *         description: Stats history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 history:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       userId:
 *                         type: string
 *                       gameType:
 *                         type: string
 *                       statType:
 *                         type: string
 *                       value:
 *                         type: number
 *                       metadata:
 *                         type: object
 *                       recordedAt:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/history', async (req: Request, res: Response) => {
  try {
    const { userId, gameType, statType, limit, offset } = req.body;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'userId is required' });
    }

    const history = await getStatsHistory({
      userId,
      gameType,
      statType,
      limit,
      offset
    });

    res.json({
      history: history.map(row => ({
        id: row.id,
        userId: row.user_id,
        gameType: row.game_type,
        statType: row.stat_type,
        value: row.value,
        metadata: row.metadata,
        recordedAt: row.recorded_at
      }))
    });
  } catch (error) {
    console.error('Error getting stats history:', error);
    res.status(500).json({ error: 'Failed to get stats history' });
  }
});

/**
 * @openapi
 * /api/stats/user:
 *   post:
 *     tags: [Stats]
 *     summary: Get aggregated stats for a user
 *     description: Retrieves aggregated statistics for a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *               gameType:
 *                 type: string
 *                 enum: [clicker, fishing]
 *     responses:
 *       200:
 *         description: User stats retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                 gameType:
 *                   type: string
 *                 totalClicks:
 *                   type: integer
 *                 totalFishCaught:
 *                   type: integer
 *                 highScore:
 *                   type: integer
 *                 totalSessions:
 *                   type: integer
 *       400:
 *         description: Bad request
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post('/user', (req: Request, res: Response) => {
  try {
    const { userId, gameType } = req.body;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'userId is required' });
    }

    const stats = getUserStats({ userId, gameType });

    res.json({
      userId,
      gameType: gameType || 'all',
      ...stats
    });
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({ error: 'Failed to get user stats' });
  }
});

/**
 * @openapi
 * /api/stats/leaderboard:
 *   post:
 *     tags: [Stats]
 *     summary: Get leaderboard for a game type
 *     description: Retrieves the leaderboard for a specific game type
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - gameType
 *             properties:
 *               gameType:
 *                 type: string
 *                 enum: [clicker, fishing]
 *               limit:
 *                 type: integer
 *                 default: 10
 *     responses:
 *       200:
 *         description: Leaderboard retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 gameType:
 *                   type: string
 *                 leaderboard:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       rank:
 *                         type: integer
 *                       userId:
 *                         type: string
 *                       userName:
 *                         type: string
 *                       gameType:
 *                         type: string
 *                       score:
 *                         type: integer
 *                       recordedAt:
 *                         type: string
 *                       updatedAt:
 *                         type: string
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/leaderboard', (req: Request, res: Response) => {
  try {
    const { gameType, limit } = req.body;

    if (!gameType || !['clicker', 'fishing'].includes(gameType)) {
      return res.status(400).json({ error: 'Invalid gameType. Must be "clicker" or "fishing"' });
    }

    const leaderboard = getLeaderboard({ gameType, limit });

    res.json({
      gameType,
      leaderboard
    });
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});

/**
 * @openapi
 * /api/stats/global:
 *   post:
 *     tags: [Stats]
 *     summary: Get global stats across all users
 *     description: Retrieves aggregated global statistics
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               gameType:
 *                 type: string
 *                 enum: [clicker, fishing]
 *               statType:
 *                 type: string
 *               timeRange:
 *                 type: string
 *                 enum: [hour, day, week, month]
 *     responses:
 *       200:
 *         description: Global stats retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 uniqueUsers:
 *                   type: integer
 *                 timeRange:
 *                   type: string
 *       500:
 *         description: Server error
 */
router.post('/global', (req: Request, res: Response) => {
  try {
    const { gameType, statType, timeRange } = req.body;

    const stats = getGlobalStats({
      gameType,
      statType,
      timeRange
    });

    res.json(stats);
  } catch (error) {
    console.error('Error getting global stats:', error);
    res.status(500).json({ error: 'Failed to get global stats' });
  }
});

export default router;
