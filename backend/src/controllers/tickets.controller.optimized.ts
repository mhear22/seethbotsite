/**
 * Tickets Controller - Optimized for Performance with Prisma (Ticket #77)
 *
 * Performance Improvements:
 * - Uses Prisma client with connection pooling
 * - Optimized queries with proper indexes
 * - Relevance score calculation optimized
 */

import { Router, Request, Response } from 'express';
import { validateApiKey, extractApiKey } from '../auth';
import { prisma } from '../lib/prisma';

const router = Router();

/**
 * Helper to get ignore mode setting
 */
async function getIgnoreMode(): Promise<boolean> {
  const setting = await prisma.setting.findUnique({
    where: { key: 'ignore_mode' }
  });
  return setting?.value === 'true';
}

/**
 * Helper to set ignore mode setting
 */
async function setIgnoreMode(enabled: boolean): Promise<void> {
  await prisma.setting.upsert({
    where: { key: 'ignore_mode' },
    create: { key: 'ignore_mode', value: String(enabled) },
    update: { value: String(enabled), updated_at: new Date() }
  });
}

/**
 * @openapi
 * /api/tickets-optimized:
 *   get:
 *     tags: [Tickets]
 *     summary: Get all tickets with filtering and pagination
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status (pending, in_progress, completed, rejected)
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by type (feature, bug, improvement)
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *         description: Filter by priority (low, medium, high, critical)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Maximum number of tickets to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Number of tickets to skip
 *     responses:
 *       200:
 *         description: Tickets retrieved successfully
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, type, priority, limit, offset } = req.query;

    const where: any = {
      is_deleted: false
    };

    if (status && typeof status === 'string') {
      where.status = status;
    }

    if (type && typeof type === 'string') {
      where.type = type;
    }

    if (priority && typeof priority === 'string') {
      where.priority = priority;
    }

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        orderBy: { updated_at: 'desc' },
        take: limit ? Number(limit) : undefined,
        skip: offset ? Number(offset) : undefined
      }),
      prisma.ticket.count({ where })
    ]);

    res.json({ tickets, total, limit, offset });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

/**
 * @openapi
 * /api/tickets-optimized/{id}:
 *   get:
 *     tags: [Tickets]
 *     summary: Get a specific ticket by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ticket retrieved successfully
 *       404:
 *         description: Ticket not found
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const ticket = await prisma.ticket.findUnique({
      where: { id: Number(id) }
    });

    if (!ticket || ticket.is_deleted) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json({ ticket });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
});

/**
 * @openapi
 * /api/tickets-optimized:
 *   post:
 *     tags: [Tickets]
 *     summary: Create a new ticket
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *               priority:
 *                 type: string
 *     responses:
 *       201:
 *         description: Ticket created successfully
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, description, type, priority, creator_id } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        type: type || 'feature',
        priority: priority || 'medium',
        creator_id: creator_id || null
      }
    });

    res.status(201).json({ ticket });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

/**
 * @openapi
 * /api/tickets-optimized/{id}:
 *   put:
 *     tags: [Tickets]
 *     summary: Update a ticket
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *               response:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ticket updated successfully
 *       404:
 *         description: Ticket not found
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, status, response } = req.body;

    const ticket = await prisma.ticket.findUnique({
      where: { id: Number(id) }
    });

    if (!ticket || ticket.is_deleted) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id: Number(id) },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(status && { status }),
        ...(response !== undefined && { response }),
        updated_at: new Date()
      }
    });

    res.json({ ticket: updatedTicket });
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ error: 'Failed to update ticket' });
  }
});

/**
 * @openapi
 * /api/tickets-optimized/{id}:
 *   delete:
 *     tags: [Tickets]
 *     summary: Delete a ticket (soft delete)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ticket deleted successfully
 *       404:
 *         description: Ticket not found
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const ticket = await prisma.ticket.findUnique({
      where: { id: Number(id) }
    });

    if (!ticket || ticket.is_deleted) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    await prisma.ticket.update({
      where: { id: Number(id) },
      data: {
        is_deleted: true,
        updated_at: new Date()
      }
    });

    res.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    res.status(500).json({ error: 'Failed to delete ticket' });
  }
});

/**
 * @openapi
 * /api/tickets-optimized/settings/ignore-mode:
 *   get:
 *     tags: [Tickets]
 *     summary: Get ignore mode setting
 *     responses:
 *       200:
 *         description: Ignore mode setting retrieved
 */
router.get('/settings/ignore-mode', async (req: Request, res: Response) => {
  try {
    const ignoreMode = await getIgnoreMode();
    res.json({ ignore_mode: ignoreMode });
  } catch (error) {
    console.error('Error getting ignore mode:', error);
    res.status(500).json({ error: 'Failed to get ignore mode' });
  }
});

/**
 * @openapi
 * /api/tickets-optimized/settings/ignore-mode:
 *   post:
 *     tags: [Tickets]
 *     summary: Set ignore mode setting
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [enabled]
 *             properties:
 *               enabled:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Ignore mode setting updated
 */
router.post('/settings/ignore-mode', async (req: Request, res: Response) => {
  try {
    const { enabled } = req.body;

    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ error: 'enabled must be a boolean' });
    }

    await setIgnoreMode(enabled);
    res.json({ ignore_mode: enabled });
  } catch (error) {
    console.error('Error setting ignore mode:', error);
    res.status(500).json({ error: 'Failed to set ignore mode' });
  }
});

export default router;
