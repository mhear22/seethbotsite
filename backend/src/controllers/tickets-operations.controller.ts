/**
 * tickets-operations.controller.ts
 *
 * Ticket operations (next-task, appeals, search)
 *
 * This controller handles operational ticket management:
 * - Retrieve next pending ticket for heartbeat automation
 * - Submit and review ticket appeals
 * - Search tickets by title/description
 */

import { Router, Request, Response } from 'express';
import {
  getDB
} from '../services/tickets-db';
import {
  ticketsFilterService,
  TicketFilters
} from '../services/tickets-filter.service';

const router = Router();

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
