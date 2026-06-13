import { Router, Request, Response } from 'express';
import { validateTokenAndGetUser } from '../users';
import {
  getFavoritesByUserId,
  addFavorite,
  removeFavorite,
  removeFavoriteByItem,
  updateFavorite,
  reorderFavorites,
  isFavorited,
  type CreateFavoriteInput,
  type UpdateFavoriteInput
} from '../services/favorites.service';

const router = Router();

/**
 * Helper to extract user from JWT token
 */
async function getUserFromToken(req: Request): Promise<{ user: any; session: any } | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  return validateTokenAndGetUser(token);
}

/**
 * Helper to require authentication
 */
async function requireAuth(req: Request, res: Response): Promise<{ user: any; session: any } | null> {
  const result = await getUserFromToken(req);
  if (!result) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Please authenticate to access this resource'
    });
    return null;
  }
  return result;
}

/**
 * @openapi
 * /api/favorites:
 *   get:
 *     tags: [Favorites]
 *     summary: Get my favorites
 *     description: Returns the authenticated user's favorites sorted by order
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Favorites retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 favorites:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       user_id:
 *                         type: integer
 *                       item_type:
 *                         type: string
 *                         enum: [page, panel, feature]
 *                       item_id:
 *                         type: string
 *                       display_name:
 *                         type: string
 *                       order_index:
 *                         type: integer
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 */
router.get('/', async (req: Request, res: Response) => {
  const authResult = await requireAuth(req, res);
  if (!authResult) return;

  const { user } = authResult;
  const favorites = await getFavoritesByUserId(user.id);

  res.json({ favorites });
});

/**
 * @openapi
 * /api/favorites:
 *   post:
 *     tags: [Favorites]
 *     summary: Add to favorites
 *     description: Adds an item to the authenticated user's favorites
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - item_type
 *               - item_id
 *               - display_name
 *             properties:
 *               item_type:
 *                 type: string
 *                 enum: [page, panel, feature]
 *               item_id:
 *                 type: string
 *               display_name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Favorite added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 favorite:
 *                   type: object
 *       400:
 *         description: Bad request (item already favorited or invalid input)
 *       401:
 *         description: Unauthorized
 */
router.post('/', async (req: Request, res: Response) => {
  const authResult = await requireAuth(req, res);
  if (!authResult) return;

  const { user } = authResult;

  // Validate input
  const { item_type, item_id, display_name } = req.body;

  if (!item_type || !item_id || !display_name) {
    return res.status(400).json({
      error: 'Bad request',
      message: 'Missing required fields: item_type, item_id, display_name'
    });
  }

  if (!['page', 'panel', 'feature'].includes(item_type)) {
    return res.status(400).json({
      error: 'Bad request',
      message: 'Invalid item_type. Must be one of: page, panel, feature'
    });
  }

  try {
    const favorite = await addFavorite(user.id, { item_type, item_id, display_name });
    res.status(201).json({ favorite });
  } catch (error: any) {
    res.status(400).json({
      error: 'Bad request',
      message: error.message || 'Failed to add favorite'
    });
  }
});

/**
 * @openapi
 * /api/favorites/item:
 *   delete:
 *     tags: [Favorites]
 *     summary: Remove favorite by item
 *     description: Removes a favorite by item type and item ID
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - item_type
 *               - item_id
 *             properties:
 *               item_type:
 *                 type: string
 *                 enum: [page, panel, feature]
 *               item_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Favorite removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.delete('/item', async (req: Request, res: Response) => {
  const authResult = await requireAuth(req, res);
  if (!authResult) return;

  const { user } = authResult;
  const { item_type, item_id } = req.body;

  if (!item_type || !item_id) {
    return res.status(400).json({
      error: 'Bad request',
      message: 'Missing required fields: item_type, item_id'
    });
  }

  try {
    const removed = await removeFavoriteByItem(user.id, item_type, item_id);
    if (removed) {
      res.json({ message: 'Favorite removed successfully' });
    } else {
      res.status(404).json({
        error: 'Not found',
        message: 'Favorite not found'
      });
    }
  } catch (error: any) {
    res.status(400).json({
      error: 'Bad request',
      message: error.message || 'Failed to remove favorite'
    });
  }
});

/**
 * @openapi
 * /api/favorites/{id}:
 *   delete:
 *     tags: [Favorites]
 *     summary: Remove favorite
 *     description: Removes a favorite by ID
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Favorite ID
 *     responses:
 *       200:
 *         description: Favorite removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request (not found or access denied)
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', async (req: Request, res: Response) => {
  const authResult = await requireAuth(req, res);
  if (!authResult) return;

  const { user } = authResult;
  const favoriteId = parseInt(req.params.id);

  if (isNaN(favoriteId)) {
    return res.status(400).json({
      error: 'Bad request',
      message: 'Invalid favorite ID'
    });
  }

  try {
    const removed = await removeFavorite(favoriteId, user.id);
    if (removed) {
      res.json({ message: 'Favorite removed successfully' });
    } else {
      res.status(404).json({
        error: 'Not found',
        message: 'Favorite not found'
      });
    }
  } catch (error: any) {
    res.status(400).json({
      error: 'Bad request',
      message: error.message || 'Failed to remove favorite'
    });
  }
});

/**
 * @openapi
 * /api/favorites/reorder:
 *   put:
 *     tags: [Favorites]
 *     summary: Reorder favorites
 *     description: Updates the order of favorites based on the provided array of IDs
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - favorite_ids
 *             properties:
 *               favorite_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of favorite IDs in the desired order
 *     responses:
 *       200:
 *         description: Favorites reordered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 favorites:
 *                   type: array
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.put('/reorder', async (req: Request, res: Response) => {
  const authResult = await requireAuth(req, res);
  if (!authResult) return;

  const { user } = authResult;
  const { favorite_ids } = req.body;

  if (!Array.isArray(favorite_ids)) {
    return res.status(400).json({
      error: 'Bad request',
      message: 'favorite_ids must be an array'
    });
  }

  try {
    const favorites = await reorderFavorites(user.id, favorite_ids);
    res.json({ favorites });
  } catch (error: any) {
    res.status(400).json({
      error: 'Bad request',
      message: error.message || 'Failed to reorder favorites'
    });
  }
});

/**
 * @openapi
 * /api/favorites/{id}:
 *   put:
 *     tags: [Favorites]
 *     summary: Update favorite
 *     description: Updates a favorite's display name or order
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Favorite ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               display_name:
 *                 type: string
 *               order_index:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Favorite updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 favorite:
 *                   type: object
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Favorite not found
 */
router.put('/:id', async (req: Request, res: Response) => {
  const authResult = await requireAuth(req, res);
  if (!authResult) return;

  const { user } = authResult;
  const favoriteId = parseInt(req.params.id);

  if (isNaN(favoriteId)) {
    return res.status(400).json({
      error: 'Bad request',
      message: 'Invalid favorite ID'
    });
  }

  const updates: UpdateFavoriteInput = {};

  if (req.body.display_name !== undefined) {
    updates.display_name = req.body.display_name;
  }

  if (req.body.order_index !== undefined) {
    updates.order_index = parseInt(req.body.order_index);
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      error: 'Bad request',
      message: 'No updates provided'
    });
  }

  try {
    const updatedFavorite = await updateFavorite(favoriteId, user.id, updates);
    if (!updatedFavorite) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Favorite not found'
      });
    }
    res.json({ favorite: updatedFavorite });
  } catch (error: any) {
    res.status(400).json({
      error: 'Bad request',
      message: error.message || 'Failed to update favorite'
    });
  }
});

/**
 * @openapi
 * /api/favorites/check:
 *   get:
 *     tags: [Favorites]
 *     summary: Check if item is favorited
 *     description: Checks if an item is in the authenticated user's favorites
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: item_type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [page, panel, feature]
 *       - in: query
 *         name: item_id
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
 *                 favorited:
 *                   type: boolean
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.get('/check', async (req: Request, res: Response) => {
  const authResult = await requireAuth(req, res);
  if (!authResult) return;

  const { user } = authResult;
  const { item_type, item_id } = req.query;

  if (!item_type || !item_id) {
    return res.status(400).json({
      error: 'Bad request',
      message: 'Missing required query parameters: item_type, item_id'
    });
  }

  try {
    const favorited = await isFavorited(user.id, item_type as string, item_id as string);
    res.json({ favorited });
  } catch (error: any) {
    res.status(400).json({
      error: 'Bad request',
      message: error.message || 'Failed to check favorite status'
    });
  }
});

export default router;
