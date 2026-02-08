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
router.get('/', (req: Request, res: Response) => {
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

    const results = search(trimmedQuery, searchTypes);

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

/**
 * @openapi
 * /api/search/movies:
 *   get:
 *     tags: [Search]
 *     summary: Search movies only
 *     description: Search for movies by title, genre, or notes
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *         example: "matrix"
 *     responses:
 *       200:
 *         description: Movie search results
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
 *                     $ref: '#/components/schemas/Movie'
 *                 count:
 *                   type: integer
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad request (missing query)
 *       500:
 *         description: Server error
 */
router.get('/movies', (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Search query (q) is required' });
    }

    const trimmedQuery = q.trim();
    if (trimmedQuery.length === 0) {
      return res.status(400).json({ error: 'Search query cannot be empty' });
    }

    const results = search(trimmedQuery, ['movie']);

    res.json({
      query: trimmedQuery,
      results,
      count: results.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error searching movies:', error);
    res.status(500).json({ error: 'Failed to search movies' });
  }
});

/**
 * @openapi
 * /api/search/shop:
 *   get:
 *     tags: [Search]
 *     summary: Search shop items only
 *     description: Search for shop items by name, description, or category
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *         example: "boost"
 *     responses:
 *       200:
 *         description: Shop item search results
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
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       cost:
 *                         type: integer
 *                       icon:
 *                         type: string
 *                       category:
 *                         type: string
 *                 count:
 *                   type: integer
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad request (missing query)
 *       500:
 *         description: Server error
 */
router.get('/shop', (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Search query (q) is required' });
    }

    const trimmedQuery = q.trim();
    if (trimmedQuery.length === 0) {
      return res.status(400).json({ error: 'Search query cannot be empty' });
    }

    const results = search(trimmedQuery, ['shop_item']);

    res.json({
      query: trimmedQuery,
      results,
      count: results.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error searching shop:', error);
    res.status(500).json({ error: 'Failed to search shop' });
  }
});

/**
 * @openapi
 * /api/search/quotes:
 *   get:
 *     tags: [Search]
 *     summary: Search quotes only
 *     description: Search for Northernlion quotes and advice
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *         example: "chaos"
 *     responses:
 *       200:
 *         description: Quote search results
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
 *                         enum: [quote, advice]
 *                       id:
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
 *       500:
 *         description: Server error
 */
router.get('/quotes', (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Search query (q) is required' });
    }

    const trimmedQuery = q.trim();
    if (trimmedQuery.length === 0) {
      return res.status(400).json({ error: 'Search query cannot be empty' });
    }

    const results = search(trimmedQuery, ['quote', 'advice']);

    res.json({
      query: trimmedQuery,
      results,
      count: results.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error searching quotes:', error);
    res.status(500).json({ error: 'Failed to search quotes' });
  }
});

export default router;
