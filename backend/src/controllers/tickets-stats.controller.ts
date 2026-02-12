/**
 * tickets-stats.controller.ts
 *
 * Ticket statistics and analytics endpoints
 *
 * This controller handles ticket statistics and metrics:
 * - Calculate estimated wait time for new tickets
 * - Get dashboard statistics (counts, status breakdown, date ranges)
 */

import { Router, Request, Response } from 'express';
import {
  ticketsStatsService
} from '../services/tickets-stats.service';

const router = Router();

/**
 * @openapi
 * /api/tickets/estimated-wait-time:
 *   get:
 *     tags: [Tickets]
 *     summary: Get estimated wait time for new tickets
 *     description: Returns the average completion time based on the last 10 completed tickets. Used to estimate how long new tickets might take to process.
 *     responses:
 *       200:
 *         description: Estimated wait time retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 estimatedWaitTimeMinutes:
 *                   type: number
 *                   description: Estimated wait time in minutes (null if insufficient data)
 *                 sampleSize:
 *                   type: number
 *                   description: Number of completed tickets used for calculation
 *                 averageCompletionTimeHours:
 *                   type: number
 *                   description: Average completion time in hours (null if insufficient data)
 */
router.get('/tickets/estimated-wait-time', async (req: Request, res: Response) => {
  try {
    const result = ticketsStatsService.getEstimatedWaitTime();
    res.json(result);
  } catch (error) {
    console.error('Error calculating estimated wait time:', error);
    res.status(500).json({ error: 'Failed to calculate estimated wait time' });
  }
});

/**
 * @openapi
 * /api/tickets/stats:
 *   get:
 *     tags: [Tickets]
 *     summary: Get ticketing statistics
 *     description: Returns ticket statistics including total count, status breakdown, and date ranges
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalTickets:
 *                   type: integer
 *                   example: 42
 *                 byStatus:
 *                   type: object
 *                   properties:
 *                     pending:
 *                       type: integer
 *                     needs-info:
 *                       type: integer
 *                     completed:
 *                       type: integer
 *                     declined:
 *                       type: integer
 *                 oldestTicket:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     title:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                 newestTicket:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     title:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                 dates:
 *                   type: object
 *                   properties:
 *                     oldestCreated:
 *                       type: string
 *                     newestCreated:
 *                       type: string
 *                     oldestCompleted:
 *                       type: string
 *                     newestCompleted:
 *                       type: string
 */
router.get('/tickets/stats', async (req: Request, res: Response) => {
  try {
    const stats = ticketsStatsService.getDashboardStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching ticket stats:', error);
    res.status(500).json({ error: 'Failed to fetch ticket stats' });
  }
});

export default router;
