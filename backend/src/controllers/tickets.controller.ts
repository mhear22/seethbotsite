import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import {
  getIgnoreMode,
  setIgnoreMode
} from '../services/tickets-db';
import {
  ticketsService,
  CreateTicketDTO,
  UpdateTicketDTO
} from '../services/tickets.service';
import {
  ticketsFilterService,
  TicketFilters
} from '../services/tickets-filter.service';
import {
  ticketsStatsService
} from '../services/tickets-stats.service';

const router = Router();

/**
 * @openapi
 * /api/tickets/settings/ignore-mode:
 *   get:
 *     tags: [Tickets]
 *     summary: Get ticket processing ignore mode
 *     description: Returns whether ticket processing is paused (ignoring all tickets)
 *     responses:
 *       200:
 *         description: Ignore mode status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ignoreMode:
 *                   type: boolean
 *                   example: false
 */
router.get('/tickets/settings/ignore-mode', async (req: Request, res: Response) => {
  try {
    const ignoreMode = await getIgnoreMode();
    res.json({ ignoreMode });
  } catch (error) {
    console.error('Error fetching ignore mode:', error);
    res.status(500).json({ error: 'Failed to fetch ignore mode' });
  }
});

/**
 * @openapi
 * /api/tickets/settings/ignore-mode:
 *   patch:
 *     tags: [Tickets]
 *     summary: Update ticket processing ignore mode
 *     description: Sets whether ticket processing is paused
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ignoreMode]
 *             properties:
 *               ignoreMode:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Ignore mode updated successfully
 *       400:
 *         description: Bad request - invalid ignoreMode value
 */
router.patch('/tickets/settings/ignore-mode', async (req: Request, res: Response) => {
  try {
    const { ignoreMode } = req.body;

    if (typeof ignoreMode !== 'boolean') {
      return res.status(400).json({ error: 'ignoreMode must be a boolean' });
    }

    await setIgnoreMode(ignoreMode);

    res.json({ ignoreMode, message: `Ticket processing ${ignoreMode ? 'paused' : 'resumed'}` });
  } catch (error) {
    console.error('Error updating ignore mode:', error);
    res.status(500).json({ error: 'Failed to update ignore mode' });
  }
});

/**
 * @openapi
 * /api/tickets/next-task:
 *   get:
 *     tags: [Tickets]
 *     summary: Get next task and update last collection time
 *     description: Returns the next pending ticket to work on (excluding those collected in the last hour) and updates the last collection timestamp. Designed for heartbeat automation.
 *     responses:
 *       200:
 *         description: Next task retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ticket:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     id:
 *                       type: integer
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     status:
 *                       type: string
 *                     ticketType:
 *                       type: string
 *                     priority:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                     updated_at:
 *                       type: string
 *                 lastCollection:
 *                   type: string
 *                   example: "2024-02-04T00:00:00.000Z"
 */
router.get('/tickets/next-task', async (req: Request, res: Response) => {
  try {
    const now = new Date();

    // Update last collection timestamp
    await prisma.setting.upsert({
      where: { key: 'last_collection' },
      create: { key: 'last_collection', value: now.toISOString() },
      update: { value: now.toISOString(), updated_at: now }
    });

    // First, check if there's already a ticket in progress (needs-info status)
    let ticket = await prisma.ticket.findFirst({
      where: {
        status: 'needs-info',
        is_deleted: false,
        NOT: { OR: [{ title: { contains: 'weiner' } }, { title: { contains: 'fire' } }] }
      },
      orderBy: { created_at: 'asc' }
    });

    // If no in-progress ticket, get the next pending ticket
    if (!ticket) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      ticket = await prisma.ticket.findFirst({
        where: {
          status: 'pending',
          is_deleted: false,
          updated_at: { lt: oneHourAgo },
          NOT: { OR: [{ title: { contains: 'weiner' } }, { title: { contains: 'fire' } }] }
        },
        orderBy: { id: 'asc' }
      });
    }

    res.json({ ticket, lastCollection: now.toISOString() });
  } catch (error) {
    console.error('Error fetching next task:', error);
    res.status(500).json({ error: 'Failed to fetch next task' });
  }
});

/**
 * @openapi
 * /api/tickets/settings/last-collection:
 *   get:
 *     tags: [Tickets]
 *     summary: Get last ticket collection timestamp
 *     description: Returns the timestamp of the last ticket collection
 *     responses:
 *       200:
 *         description: Last collection timestamp retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 lastCollection:
 *                   type: string
 *                   nullable: true
 *                   example: "2024-02-04T00:00:00.000Z"
 */
router.get('/tickets/settings/last-collection', async (req: Request, res: Response) => {
  try {
    const row = await prisma.setting.findUnique({ where: { key: 'last_collection' } });
    res.json({ lastCollection: row?.value || null });
  } catch (error) {
    console.error('Error fetching last collection:', error);
    res.status(500).json({ error: 'Failed to fetch last collection' });
  }
});

/**
 * @openapi
 * /api/tickets/settings/last-collection:
 *   patch:
 *     tags: [Tickets]
 *     summary: Update last ticket collection timestamp
 *     description: Updates the timestamp of the last ticket collection. No authentication required.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [lastCollection]
 *             properties:
 *               lastCollection:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Last collection updated successfully
 */
router.patch('/tickets/settings/last-collection', async (req: Request, res: Response) => {
  try {
    const { lastCollection } = req.body;
    await prisma.setting.upsert({
      where: { key: 'last_collection' },
      create: { key: 'last_collection', value: lastCollection },
      update: { value: lastCollection, updated_at: new Date() }
    });
    res.json({ lastCollection });
  } catch (error) {
    console.error('Error updating last collection:', error);
    res.status(500).json({ error: 'Failed to update last collection' });
  }
});

/**
 * @openapi
 * /api/tickets:
 *   get:
 *     tags: [Tickets]
 *     summary: Get all tickets
 *     description: Returns all tickets with optional filtering by status, type, priority, tags, and category. Sorted by relevance by default (older pending tickets first).
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tickets:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       status:
 *                         type: string
 *                         enum: [pending, needs-info, completed, declined]
 *                       ticketType:
 *                         type: string
 *                         enum: [feature, bug, feedback]
 *                       priority:
 *                         type: string
 *                         enum: [high, medium, low]
 *                       response:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                       updated_at:
 *                         type: string
 *                       relevanceScore:
 *                         type: number
 *                         description: Relevance score (0-100), higher = more relevant
 *                       daysSinceCreation:
 *                         type: integer
 *                         description: Number of days since ticket creation
 */
router.get('/tickets', async (req: Request, res: Response) => {
  try {
    const { status, type, priority, tag, category, sortBy = 'relevance', page, limit } = req.query;

    const filters: TicketFilters & { page?: number; limit?: number; sortBy?: any } = {
      status: status as string,
      type: type as string,
      priority: priority as string,
      tag: tag as string,
      category: category as string,
      sortBy: sortBy as 'relevance' | 'created_at' | 'updated_at',
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined
    };

    const result = await ticketsFilterService.getFilteredTickets(filters);
    res.json(result);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

/**
 * @openapi
 * /api/tickets:
 *   post:
 *     tags: [Tickets]
 *     summary: Create a new ticket
 *     description: Creates a new ticket with title and description. Optionally includes type, priority, tags, category, and creator_id for ticket ownership tracking.
 */
router.post('/tickets', async (req: Request, res: Response) => {
  try {
    const data: CreateTicketDTO = req.body;

    const ticket = await ticketsService.createTicket(data);
    res.status(201).json({ ticket });
  } catch (error) {
    console.error('Error creating ticket:', error);
    const message = (error as Error).message;
    res.status(message === 'Title is required' ? 400 : 500).json({ error: message });
  }
});

/**
 * @openapi
 * /api/tickets/{id}:
 *   patch:
 *     tags: [Tickets]
 *     summary: Update a ticket
 *     description: Update ticket fields including status, response, title, description, tags, and category. No authentication required.
 */
router.patch('/tickets/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data: UpdateTicketDTO = req.body;

    const ticket = await ticketsService.updateTicket(parseInt(id, 10), data);
    res.json({ ticket });
  } catch (error) {
    console.error('Error updating ticket:', error);
    const message = (error as Error).message;

    if (message === 'Ticket not found') {
      res.status(404).json({ error: message });
    } else if (message.includes('Cannot edit')) {
      res.status(403).json({ error: message });
    } else if (message.includes('Invalid status') || message.includes('Title') || message.includes('Description') || message.includes('At least one field')) {
      res.status(400).json({ error: message });
    } else {
      res.status(500).json({ error: message || 'Failed to update ticket' });
    }
  }
});

/**
 * @openapi
 * /api/tickets/{id}:
 *   delete:
 *     tags: [Tickets]
 *     summary: Delete a ticket
 *     description: Deletes a ticket. No authentication required. Optionally provide creator_id to verify ownership.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: header
 *         name: X-Creator-ID
 *         schema:
 *           type: string
 *         required: false
 *         description: Creator ID for authorization (alternative to API key)
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               creator_id:
 *                 type: string
 *                 description: Creator ID for authorization (alternative to API key)
 *     responses:
 *       200:
 *         description: Ticket deleted successfully
 *       401:
 *         description: Unauthorized - creator_id does not match
 *       404:
 *         description: Ticket not found
 */
router.delete('/tickets/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Extract creator_id from body or headers
    const creator_id = req.body.creator_id || req.headers['x-creator-id'] as string;

    await ticketsService.deleteTicket(parseInt(id, 10), creator_id);

    res.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    const message = (error as Error).message;

    if (message === 'Ticket not found') {
      res.status(404).json({ error: message });
    } else if (message.includes('Unauthorized')) {
      res.status(401).json({ error: message });
    } else {
      res.status(500).json({ error: message || 'Failed to delete ticket' });
    }
  }
});

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
    const result = await ticketsStatsService.getEstimatedWaitTime();
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
    const stats = await ticketsStatsService.getDashboardStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching ticket stats:', error);
    res.status(500).json({ error: 'Failed to fetch ticket stats' });
  }
});

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
    const tags = await ticketsStatsService.getAllTags();
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
    const categories = await ticketsStatsService.getAllCategories();
    res.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

/**
 * @openapi
 * /api/tickets/search:
 *   get:
 *     tags: [Tickets]
 *     summary: Search tickets by term
 *     description: Search tickets by a search term that matches title or description. Supports optional filtering by status, type, priority, tag, and category.
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search term to match in title or description
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [all, pending, needs-info, completed, declined]
 *           default: all
 *         description: Filter by status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [all, feature, bug, feedback]
 *           default: all
 *         description: Filter by type
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [all, high, medium, low]
 *           default: all
 *         description: Filter by priority
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: Filter by tag
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tickets:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       status:
 *                         type: string
 *                       type:
 *                         type: string
 *                       priority:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                       updated_at:
 *                         type: string
 *                 query:
 *                   type: string
 *                   description: The search term used
 *       400:
 *         description: Bad request - missing search term
 *       500:
 *         description: Internal server error
 */
router.get('/tickets/search', async (req: Request, res: Response) => {
  try {
    const { q, status, type, priority, tag, category } = req.query;

    // Validate search term
    if (!q || typeof q !== 'string' || q.trim().length === 0) {
      return res.status(400).json({ error: 'Search term "q" is required' });
    }

    // Build filters
    const filters: TicketFilters = {
      status: status as string || 'all',
      type: type as string || 'all',
      priority: priority as string || 'all',
      tag: tag as string,
      category: category as string
    };

    // Search tickets
    const tickets = ticketsFilterService.searchTickets(filters, q.trim());

    res.json({
      tickets,
      query: q.trim()
    });
  } catch (error) {
    console.error('Error searching tickets:', error);
    res.status(500).json({ error: 'Failed to search tickets' });
  }
});

export default router;
