/**
 * tickets-core.controller.ts
 *
 * Core ticket CRUD operations (GET /tickets, POST /tickets, PATCH /tickets/:id, DELETE /tickets/:id)
 *
 * This controller handles the fundamental ticket management endpoints:
 * - List all tickets with filtering
 * - Create new tickets
 * - Update existing tickets
 * - Delete tickets (soft delete)
 */

import { Router, Request, Response } from 'express';
import {
  ticketsService,
  CreateTicketDTO,
  UpdateTicketDTO
} from '../services/tickets.service';
import {
  ticketsFilterService,
  TicketFilters
} from '../services/tickets-filter.service';

const router = Router();

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

export default router;
