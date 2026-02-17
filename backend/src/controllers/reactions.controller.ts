import { Router, Request, Response } from 'express';
import {
  validateTokenAndGetUser
} from '../users';
import {
  toggleReaction,
  addReaction,
  removeReactionById,
  removeReaction,
  getReactionsForTarget,
  getReactionCountsForTarget,
  hasUserReacted,
  getReactionsByUser
} from '../services/reaction.service';

const router = Router();

/**
 * Helper to extract user ID from JWT token
 */
async function getUserIdFromToken(req: Request): Promise<number | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  const result = await validateTokenAndGetUser(token);
  return result ? result.user.id : null;
}

/**
 * @openapi
 * /api/reactions:
 *   post:
 *     tags: [Reactions]
 *     summary: Add or toggle a reaction
 *     description: Adds a reaction if it doesn't exist, removes it if it does (toggle behavior)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targetType
 *               - targetId
 *               - emoji
 *             properties:
 *               targetType:
 *                 type: string
 *                 enum: [message, post, comment]
 *                 example: "message"
 *                 description: Type of target to react to
 *               targetId:
 *                 type: integer
 *                 example: 123
 *                 description: ID of the target
 *               emoji:
 *                 type: string
 *                 example: "👍"
 *                 description: Emoji reaction
 *     responses:
 *       200:
 *         description: Reaction toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 added:
 *                   type: boolean
 *                   description: true if reaction was added, false if removed
 *                 removed:
 *                   type: boolean
 *                   description: true if reaction was removed, false if added
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/', async (req: Request, res: Response) => {
  const userId = await getUserIdFromToken(req);

  if (!userId) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Please provide a valid JWT token'
    });
  }

  const { targetType, targetId, emoji } = req.body;

  if (!targetType || !targetId || !emoji) {
    return res.status(400).json({
      error: 'Bad request',
      message: 'targetType, targetId, and emoji are required'
    });
  }

  if (
!['message', 'post', 'comment'].includes(targetType)
) {
    return res.status(400).json({
      error: 'Bad request',
      message: 'targetType must be one of: message, post, comment'
    });
  }

  const result = await toggleReaction(userId, targetType as 'message' | 'post' | 'comment', targetId, emoji);

  res.json({
    success: true,
    added: result.added,
    removed: result.removed
  });
});

/**
 * @openapi
 * /api/reactions/force:
 *   post:
 *     tags: [Reactions]
 *     summary: Force add a reaction
 *     description: Adds a reaction without toggling. Returns null if reaction already exists.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targetType
 *               - targetId
 *               - emoji
 *             properties:
 *               targetType:
 *                 type: string
 *                 enum: [message, post, comment]
 *                 example: "message"
 *               targetId:
 *                 type: integer
 *                 example: 123
 *               emoji:
 *                 type: string
 *                 example: "👍"
 *     responses:
 *       200:
 *         description: Reaction added successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/force', async (req: Request, res: Response) => {
  const userId = await getUserIdFromToken(req);

  if (!userId) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Please provide a valid JWT token'
    });
  }

  const { targetType, targetId, emoji } = req.body;

  if (!targetType || !targetId || !emoji) {
    return res.status(400).json({
      error: 'Bad request',
      message: 'targetType, targetId, and emoji are required'
    });
  }

  if (
!['message', 'post', 'comment'].includes(targetType)
) {
    return res.status(400).json({
      error: 'Bad request',
      message: 'targetType must be one of: message, post, comment'
    });
  }

  const reaction = addReaction(userId, targetType as 'message' | 'post' | 'comment', targetId, emoji);

  if (!reaction) {
    return res.status(409).json({
      error: 'Conflict',
      message: 'Reaction already exists'
    });
  }

  res.json({
    success: true,
    reaction
  });
});

/**
 * @openapi
 * /api/reactions/{id}:
 *   delete:
 *     tags: [Reactions]
 *     summary: Remove a reaction by ID
 *     description: Removes a reaction using its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Reaction ID
 *     responses:
 *       200:
 *         description: Reaction removed successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Reaction not found or doesn't belong to user
 */
router.delete('/:id', async (req: Request, res: Response) => {
  const userId = await getUserIdFromToken(req);

  if (!userId) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Please provide a valid JWT token'
    });
  }

  const reactionId = parseInt(req.params.id);

  if (isNaN(reactionId)) {
    return res.status(400).json({
      error: 'Bad request',
      message: 'Invalid reaction ID'
    });
  }

  const success = removeReactionById(reactionId, userId);

  if (!success) {
    return res.status(404).json({
      error: 'Not found',
      message: 'Reaction not found or doesn\'t belong to you'
    });
  }

  res.json({
    success: true,
    message: 'Reaction removed'
  });
});

/**
 * @openapi
 * /api/reactions/{targetType}/{targetId}:
 *   get:
 *     tags: [Reactions]
 *     summary: Get reactions for a target
 *     description: Returns all reactions for a specific target, aggregated by emoji
 *     parameters:
 *       - in: path
 *         name: targetType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [message, post, comment]
 *         description: Type of target
 *       - in: path
 *         name: targetId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the target
 *       - in: query
 *         name: detailed
 *         schema:
 *           type: boolean
 *         description: If true, returns individual reactions instead of aggregated counts
 *     responses:
 *       200:
 *         description: Reactions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reactions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       emoji:
 *                         type: string
 *                       count:
 *                         type: integer
 *                       user_ids:
 *                         type: array
 *                         items:
 *                           type: integer
 */
router.get('/:targetType/:targetId', async (req: Request, res: Response) => {
  const { targetType, targetId } = req.params;
  const { detailed } = req.query;

  if (!
['message', 'post', 'comment'].includes(targetType)
) {
    return res.status(400).json({
      error: 'Bad request',
      message: 'targetType must be one of: message, post, comment'
    });
  }

  const numericTargetId = parseInt(targetId);

  if (isNaN(numericTargetId)) {
    return res.status(400).json({
      error: 'Bad request',
      message: 'Invalid target ID'
    });
  }

  if (detailed === 'true') {
    // Return individual reactions
    const reactions = await getReactionsForTarget(targetType as 'message' | 'post' | 'comment', targetId as string);

    // If user is authenticated, mark which reactions belong to them
    const userId = await getUserIdFromToken(req);

    const enrichedReactions = reactions.map(r => ({
      ...r,
      is_mine: r.user_id === userId
    }));

    res.json({
      success: true,
      reactions: enrichedReactions
    });
  } else {
    // Return aggregated counts
    const reactionCounts = await getReactionCountsForTarget(targetType as 'message' | 'post' | 'comment', targetId as string);

    // If user is authenticated, mark which reactions they've made
    const userId = await getUserIdFromToken(req);

    if (userId) {
      const enrichedCounts = await Promise.all(reactionCounts.map(async (rc) => ({
        ...rc,
        has_reacted: await hasUserReacted(userId, targetType as 'message' | 'post' | 'comment', targetId as string, rc.emoji)
      })));

      res.json({
        success: true,
        reactions: enrichedCounts
      });
    } else {
      res.json({
        success: true,
        reactions: reactionCounts
      });
    }
  }
});

/**
 * @openapi
 * /api/reactions/check:
 *   get:
 *     tags: [Reactions]
 *     summary: Check if current user has reacted to a target
 *     description: Returns true if the authenticated user has reacted with the specified emoji
 *     parameters:
 *       - in: query
 *         name: targetType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [message, post, comment]
 *       - in: query
 *         name: targetId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: emoji
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Check completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 has_reacted:
 *                   type: boolean
 *       401:
 *         description: Unauthorized
 */
router.get('/check', async (req: Request, res: Response) => {
  const userId = await getUserIdFromToken(req);

  if (!userId) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Please provide a valid JWT token'
    });
  }

  const { targetType, targetId, emoji } = req.query;

  if (!targetType || !targetId || !emoji) {
    return res.status(400).json({
      error: 'Bad request',
      message: 'targetType, targetId, and emoji are required'
    });
  }

  if (
!['message', 'post', 'comment'].includes(targetType as string)
) {
    return res.status(400).json({
      error: 'Bad request',
      message: 'targetType must be one of: message, post, comment'
    });
  }

  const hasReacted = await hasUserReacted(
    userId,
    targetType as 'message' | 'post' | 'comment',
    targetId as string,
    emoji as string
  );

  res.json({
    success: true,
    has_reacted: hasReacted
  });
});

/**
 * @openapi
 * /api/reactions/user:
 *   get:
 *     tags: [Reactions]
 *     summary: Get all reactions by the current user
 *     description: Returns all reactions made by the authenticated user
 *     responses:
 *       200:
 *         description: Reactions retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/user', async (req: Request, res: Response) => {
  const userId = await getUserIdFromToken(req);

  if (!userId) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Please provide a valid JWT token'
    });
  }

  const reactions = await getReactionsByUser(userId);

  res.json({
    success: true,
    reactions
  });
});

export default router;
