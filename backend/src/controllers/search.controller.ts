import { Router, Request, Response } from 'express';
import { search } from '../services/search.service';

const router = Router();

/**
 * @openapi
 * /api/search:
 *   get:
 *     tags: [Search]
 *     summary: Search across all content
 *     description: Search for movies, shop items, quotes, and advice
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *         example: "matrix"
 *       - in: query
 *         name: types
 *         schema:
 *           type: string
 *         description: Comma-separated list of types to search (movie,shop_item,quote,advice)
 *         example: "movie,shop_item"
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 query:
 *                   type: string
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         enum: [movie, shop_item, quote, advice]
 *                       id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       relevance:
 *                         type: number
 *                       metadata:
 *                         type: object
 *                 count:
 *                   type: integer
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad request (missing query)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { q, types } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Search query (q) is required' });
    }

    const trimmedQuery = q.trim();
    if (trimmedQuery.length === 0) {
      return res.status(400).json({ error: 'Search query cannot be empty' });
    }

    // Parse types if provided
    let searchTypes: string[] | undefined;
    if (types && typeof types === 'string') {
      searchTypes = types.split(',').map(t => t.trim()).filter(t => t.length > 0);
    }

    const results = await search(trimmedQuery, searchTypes);

    res.json({
      query: trimmedQuery,
      results,
      count: results.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error performing search:', error);
    res.status(500).json({ error: 'Failed to perform search' });
  }
});

export default router;
