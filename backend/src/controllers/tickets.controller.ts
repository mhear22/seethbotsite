import { Router, Request, Response } from 'express';
import {
  getIgnoreMode,
  setIgnoreMode,
  getDB
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
    const ignoreMode = getIgnoreMode();
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

    setIgnoreMode(ignoreMode);

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
    const db = getDB();

    // Update last collection timestamp
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO settings (key, value) VALUES ('last_collection', ?)
      ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = CURRENT_TIMESTAMP
    `).run(now, now);

    // First, check if there's already a ticket in progress (needs-info status)
    let ticket = db.prepare(`
      SELECT * FROM tickets
      WHERE status = 'needs-info'
        AND is_deleted = 0
        AND (title NOT LIKE '%weiner%' AND title NOT LIKE '%fire%')
      ORDER BY created_at ASC
      LIMIT 1
    `).get() as any || null;

    // If no in-progress ticket, get the next pending ticket
    if (!ticket) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      ticket = db.prepare(`
        SELECT * FROM tickets
        WHERE status = 'pending'
          AND is_deleted = 0
          AND (updated_at < ? OR updated_at IS NULL)
          AND (title NOT LIKE '%weiner%' AND title NOT LIKE '%fire%')
        ORDER BY id ASC
        LIMIT 1
      `).get(oneHourAgo) || null;
    }

    res.json({ ticket, lastCollection: now });
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
    const db = getDB();
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('last_collection') as { value: string } | undefined;
    const lastCollection = row?.value || null;
    res.json({ lastCollection });
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
    const db = getDB();

    db.prepare(`
      INSERT INTO settings (key, value) VALUES ('last_collection', ?)
      ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = CURRENT_TIMESTAMP
    `).run(lastCollection, lastCollection);

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
    } else if (message.includes('Cannot edit') || message.includes('Invalid status')) {
      res.status(403).json({ error: message });
    } else if (message.includes('Title') || message.includes('Description')) {
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

/**
 * @openapi
 * /api/tickets/{id}/appeal:
 *   post:
 *     tags: [Tickets]
 *     summary: Appeal a ticket
 *     description: Submit an appeal for a ticket, explaining why it should be reopened. Useful for joke tickets that were mistakenly closed.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of ticket to appeal
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reason, creator_id]
 *             properties:
 *               reason:
 *                 type: string
 *                 description: The reason for appeal
 *               creator_id:
 *                 type: string
 *                 description: The user ID submitting appeal
 *     responses:
 *       200:
 *         description: Appeal submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 appeal:
 *                   type: object
 *       400:
 *         description: Bad request - missing required fields or invalid ticket status
 *       404:
 *         description: Ticket not found
 */
router.post('/tickets/:id/appeal', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason, creator_id } = req.body;

    if (!reason || !creator_id) {
      return res.status(400).json({ error: 'Reason and creator_id are required' });
    }

    const db = getDB();

    // Check if ticket exists (exclude soft-deleted)
    const ticket = db.prepare('SELECT * FROM tickets WHERE id = ? AND is_deleted = 0').get(id) as any;
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Only allow appeals for completed or declined tickets
    if (!['completed', 'declined'].includes(ticket.status)) {
      return res.status(400).json({ error: 'Only completed or declined tickets can be appealed' });
    }

    // Create appeal
    const stmt = db.prepare(`
      INSERT INTO ticket_appeals (ticket_id, reason, creator_id, status, created_at)
      VALUES (?, ?, ?, 'pending', CURRENT_TIMESTAMP)
    `);
    const result = stmt.run(id, reason, creator_id);

    const newAppeal = db.prepare('SELECT * FROM ticket_appeals WHERE id = ?').get(result.lastInsertRowid);

    res.json({
      message: 'Appeal submitted successfully',
      appeal: newAppeal
    });
  } catch (error) {
    console.error('Error submitting appeal:', error);
    res.status(500).json({ error: 'Failed to submit appeal' });
  }
});

/**
 * @openapi
 * /api/tickets/appeals:
 *   get:
 *     tags: [Tickets]
 *     summary: Get all ticket appeals
 *     description: Returns all ticket appeals. No authentication required.
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [all, pending, approved, rejected]
 *           default: all
 *         description: Filter appeals by status
 *     responses:
 *       200:
 *         description: Appeals retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 appeals:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized - invalid API key
 */
router.get('/tickets/appeals', async (req: Request, res: Response) => {
  try {
    const { status = 'all' } = req.query;
    const db = getDB();

    let query = 'SELECT * FROM ticket_appeals WHERE 1=1';
    const params: any[] = [];

    if (status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const appeals = db.prepare(query).all(...params);

    res.json({ appeals });
  } catch (error) {
    console.error('Error fetching appeals:', error);
    res.status(500).json({ error: 'Failed to fetch appeals' });
  }
});

/**
 * @openapi
 * /api/tickets/appeals/{id}/review:
 *   patch:
 *     tags: [Tickets]
 *     summary: Review a ticket appeal
 *     description: Approve or reject a ticket appeal. No authentication required.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The appeal ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [decision, reviewer_id]
 *             properties:
 *               decision:
 *                 type: string
 *                 enum: [approved, rejected]
 *                 description: The appeal decision
 *               reviewer_id:
 *                 type: string
 *                 description: The ID of admin reviewing appeal
 *               response:
 *                 type: string
 *                 description: Optional response from reviewer
 *     responses:
 *       200:
 *         description: Appeal reviewed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 appeal:
 *                   type: object
 *       404:
 *         description: Appeal not found
 */
router.patch('/tickets/appeals/:id/review', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { decision, reviewer_id } = req.body;

    if (!decision || !['approved', 'rejected'].includes(decision)) {
      return res.status(400).json({ error: 'Decision must be "approved" or "rejected"' });
    }

    if (!reviewer_id) {
      return res.status(400).json({ error: 'Reviewer ID is required' });
    }

    const db = getDB();

    // Check if appeal exists
    const appeal = db.prepare('SELECT * FROM ticket_appeals WHERE id = ?').get(id) as any;
    if (!appeal) {
      return res.status(404).json({ error: 'Appeal not found' });
    }

    // Update appeal
    const stmt = db.prepare(`
      UPDATE ticket_appeals
      SET status = ?, reviewed_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(decision, id);

    // If approved, reopen ticket
    if (decision === 'approved') {
      db.prepare(`
        UPDATE tickets
        SET status = 'pending', updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(appeal.ticket_id);
    }

    const updatedAppeal = db.prepare('SELECT * FROM ticket_appeals WHERE id = ?').get(id);

    res.json({
      message: `Appeal ${decision} successfully`,
      appeal: updatedAppeal,
      ticketReopened: decision === 'approved'
    });
  } catch (error) {
    console.error('Error reviewing appeal:', error);
    res.status(500).json({ error: 'Failed to review appeal' });
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
