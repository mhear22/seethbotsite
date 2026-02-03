import { Router, Request, Response } from 'express';
import { pointsManager } from '../services/points-manager';

const router = Router();

/**
 * @openapi
 * /api/points/add:
 *   post:
 *     tags: [Points]
 *     summary: Add points for a user interaction
 *     description: Adds points for a user when they interact with the bot
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - reason
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "temer3"
 *                 description: Unique user identifier (Discord ID or username)
 *               reason:
 *                 type: string
 *                 example: "good interaction"
 *                 description: Reason for adding points (shown in message)
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
 */
router.post('/add', (req: Request, res: Response) => {
  const { userId, reason } = req.body;
  
  if (!userId) {
    return res.status(400).json({ 
      error: 'userId is required' 
    });
  }
  
  if (!reason) {
    return res.status(400).json({ 
      error: 'reason is required' 
    });
  }
  
  const result = pointsManager.addPoints(userId, reason);
  
  if (result.success) {
    res.json(result);
  } else {
    res.status(400).json({ error: result.message });
  }
});

/**
 * @openapi
 * /api/points/status:
 *   post:
 *     tags: [Points]
 *     summary: Get a user's current score and status
 *     description: Returns a user's current points, base points, and cooldown status
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
 *                 example: "temer3"
 *     responses:
 *       200:
 *         description: User status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 avatar:
 *                   type: string
 *                 name:
 *                   type: string
 *                 points:
 *                   type: integer
 *                 basePoints:
 *                   type: integer
 *                 onCooldown:
 *                   type: boolean
 *                 lastInteraction:
 *                   type: integer
 */
router.post('/status', (req: Request, res: Response) => {
  const { userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ 
      error: 'userId is required' 
    });
  }
  
  const user = pointsManager.getUser(userId);
  
  if (!user) {
    return res.status(404).json({ 
      error: 'User not found' 
    });
  }
  
  const now = Date.now();
  const timeSinceLastInteraction = now - user.lastInteraction;
  const onCooldown = timeSinceLastInteraction < 60000; // 1 minute cooldown
  
  res.json({
    avatar: user.avatar,
    name: user.userName,
    points: user.points,
    basePoints: user.basePoints,
    pointsAboveBase: user.points - user.basePoints,
    onCooldown,
    lastInteraction: user.lastInteraction,
    timeUntilFullPoints: onCooldown ? Math.ceil((60000 - timeSinceLastInteraction) / 1000) : 0
  });
});

/**
 * @openapi
 * /api/points/leaderboard:
 *   get:
 *     tags: [Points]
 *     summary: Get current leaderboard
 *     description: Returns top 50 users sorted by points with ranks
 *     responses:
 *       200:
 *         description: Leaderboard retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 leaderboard:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       avatar:
 *                         type: string
 *                       name:
 *                         type: string
 *                       score:
 *                         type: integer
 *                       rank:
 *                         type: integer
 *                       isCurrentUser:
 *                         type: boolean
 */
router.get('/leaderboard', (req: Request, res: Response) => {
  const leaderboard = pointsManager.getLeaderboard();
  res.json({ leaderboard });
});

/**
 * @openapi
 * /api/points/reset:
 *   post:
 *     tags: [Points]
 *     summary: Reset a user to their base score
 *     description: Admin function to reset a user to their base score
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
 *                 example: "temer3"
 *     responses:
 *       200:
 *         description: User reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post('/reset', (req: Request, res: Response) => {
  const { userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ 
      error: 'userId is required' 
    });
  }
  
  const success = pointsManager.resetUser(userId);
  
  if (success) {
    res.json({ success: true, message: 'User reset to base score' });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

export default router;
