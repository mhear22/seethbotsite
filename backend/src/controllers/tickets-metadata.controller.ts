/**
 * tickets-metadata.controller.ts
 *
 * Ticket metadata management (tags, categories)
 *
 * This controller handles ticket metadata endpoints:
 * - List all tags used across tickets
 * - List all categories used across tickets
 */

import { Router, Request, Response } from 'express';
import {
  ticketsStatsService
} from '../services/tickets-stats.service';

const router = Router();

/**
 * @openapi
 * /api/tickets/tags:
 *   get:
 *     tags: [Tickets]
 *     summary: Get all tags used across tickets
 *     description: Returns a list of all unique tags used in tickets, sorted by usage count
 *     responses:
 *       200:
 *         description: Tags retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tags:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "ui"
 *                       count:
 *                         type: integer
 *                         example: 5
 */
router.get('/tickets/tags', async (req: Request, res: Response) => {
  try {
    const tags = ticketsStatsService.getAllTags();
    res.json({ tags });
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

/**
 * @openapi
 * /api/tickets/categories:
 *   get:
 *     tags: [Tickets]
 *     summary: Get all categories used across tickets
 *     description: Returns a list of all unique categories used in tickets, sorted by usage count
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categories:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "ui"
 *                       count:
 *                         type: integer
 *                         example: 3
 */
router.get('/tickets/categories', async (req: Request, res: Response) => {
  try {
    const categories = ticketsStatsService.getAllCategories();
    res.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

export default router;
