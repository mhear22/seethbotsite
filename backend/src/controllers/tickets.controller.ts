import { Router, Request, Response } from 'express';
import { validateApiKey, extractApiKey } from '../auth';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const router = Router();

/**
 * Ticket Controller Performance Notes (Ticket #77)
 *
 * Current Implementation:
 * - Each request creates a new database connection
 * - Table creation checks on every request (cached by SQLite)
 * - Indexes added for status, created_at, updated_at for faster filtering
 *
 * Performance Optimizations Applied:
 * - Added indexes on frequently queried columns (status, created_at, updated_at)
 *
 * Future Optimizations Recommended:
 * - Share database connection across requests (reduce connection overhead)
 * - Move table initialization to startup, not per-request
 * - Use prepared statements for repeated queries
 * - Consider connection pooling for high-traffic scenarios
 * - Move relevance score calculation to SQL for better performance
 */

// Database setup
// In production: __dirname is /app/backend/dist/controllers, data is at /app/backend/data
// Go up two levels: /app/backend/dist/controllers -> /app/backend/dist -> /app/backend
const DB_PATH = path.join(__dirname, '..', '..', 'data', 'tickets.db');

// Settings helpers
function getIgnoreMode(): boolean {
  const db = getDB();
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('ignore_mode') as { value: string } | undefined;
  return row?.value === 'true';
}

function setIgnoreMode(enabled: boolean): void {
  const db = getDB();
  db.prepare(`
    INSERT INTO settings (key, value) VALUES ('ignore_mode', ?)
    ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = CURRENT_TIMESTAMP
  `).run(String(enabled), String(enabled));
}

function getDB(): Database.Database {
  // Ensure data directory exists
  // In production: __dirname is /app/backend/dist/controllers, data is at /app/backend/data
  // Go up two levels: /app/backend/dist/controllers -> /app/backend/dist -> /app/backend
  const dataDir = path.join(__dirname, '..', '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const db = new Database(DB_PATH);

  // Create tickets table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      response TEXT,
      creator_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Add creator_id column if it doesn't exist (for existing databases)
  try {
    db.exec(`ALTER TABLE tickets ADD COLUMN creator_id TEXT`);
  } catch (err) {
    // Column already exists, ignore the error
    // SQLite throws error when trying to add a duplicate column
  }

  // Add type column if it doesn't exist (for ticket filtering - Ticket #151)
  try {
    db.exec(`ALTER TABLE tickets ADD COLUMN type TEXT DEFAULT 'feature'`);
  } catch (err) {
    // Column already exists, ignore the error
  }

  // Add priority column if it doesn't exist (for ticket filtering - Ticket #151)
  try {
    db.exec(`ALTER TABLE tickets ADD COLUMN priority TEXT DEFAULT 'medium'`);
  } catch (err) {
    // Column already exists, ignore the error
  }

  // Create settings table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes for faster filtering and sorting (Ticket #77)
  try {
    db.exec(`CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_tickets_updated_at ON tickets(updated_at)`);
  } catch (err) {
    // Indexes might already exist, ignore
  }

  return db;
}

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
 *
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
 *                       response:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                       updated_at:
 *                         type: string
 */
/**
 * @openapi
 * /api/tickets:
 *   get:
 *     tags: [Tickets]
 *     summary: Get all tickets
 *     description: Returns all tickets with optional filtering by status, type, and priority. Sorted by relevance by default (older pending tickets first).
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [all, pending, needs-info, completed, declined, in-progress]
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [all, feature, bug, feedback]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [all, high, medium, low]
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [relevance, created_at, updated_at]
 *           default: relevance
 *           description: Sort method - relevance prioritizes older pending tickets
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
    const db = getDB();
    const { status = 'all', type = 'all', priority = 'all', sortBy = 'relevance' } = req.query;

    let query = 'SELECT * FROM tickets WHERE 1=1';
    const params: any[] = [];

    // Map "in-progress" to "needs-info" for frontend compatibility
    const statusFilter = status === 'in-progress' ? 'needs-info' : status;

    if (statusFilter !== 'all') {
      query += ' AND status = ?';
      params.push(statusFilter);
    }

    if (type !== 'all') {
      query += ' AND type = ?';
      params.push(type);
    }

    if (priority !== 'all') {
      query += ' AND priority = ?';
      params.push(priority);
    }

    // Sort options: relevance (default), created_at, updated_at
    if (sortBy === 'relevance') {
      // Sort by relevance: older pending tickets first, then newer
      query += ' ORDER BY CASE status ' +
                'WHEN \'pending\' THEN 1 ' +
                'WHEN \'needs-info\' THEN 2 ' +
                'WHEN \'unresolved\' THEN 2.5 ' +
                'WHEN \'completed\' THEN 3 ' +
                'WHEN \'declined\' THEN 4 ' +
                'ELSE 5 END, created_at ASC';
    } else if (sortBy === 'created_at' || sortBy === 'updated_at') {
      query += ` ORDER BY ${sortBy} DESC`;
    } else {
      query += ' ORDER BY created_at ASC';
    }

    const tickets = db.prepare(query).all(...params);

    // Calculate relevance score for each ticket
    const ticketsWithRelevance = tickets.map((ticket: any) => {
      const now = new Date();
      const createdDate = new Date(ticket.created_at);
      const daysSinceCreation = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

      // Relevance score calculation:
      // - Pending tickets: higher score for older tickets
      // - Completed/Declined: lower score
      // - Base score depends on status
      // - Age multiplier increases score for pending tickets
      let baseScore = 0;
      switch (ticket.status) {
        case 'pending':
          baseScore = 100 - Math.min(daysSinceCreation * 2, 50); // 100-50, decreases with age
          break;
        case 'needs-info':
          baseScore = 90 - Math.min(daysSinceCreation * 2, 40); // 90-50
          break;
        case 'unresolved':
          baseScore = 85 - Math.min(daysSinceCreation * 2, 35); // 85-50, high priority
          break;
        case 'completed':
          baseScore = 30; // Completed tickets are less relevant
          break;
        case 'declined':
          baseScore = 10; // Declined tickets are least relevant
          break;
        default:
          baseScore = 50;
      }

      return {
        ...ticket,
        relevanceScore: baseScore,
        daysSinceCreation
      };
    });

    // If sorting by relevance, sort the results
    if (sortBy === 'relevance') {
      ticketsWithRelevance.sort((a: any, b: any) => b.relevanceScore - a.relevanceScore);
    }

    res.json({ tickets: ticketsWithRelevance });
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
 *     description: Creates a new ticket with title and description. Optionally includes type, priority, and creator_id for ticket ownership tracking.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               ticketType:
 *                 type: string
 *                 enum: [feature, bug, feedback]
 *                 default: feature
 *                 description: Type of ticket
 *               priority:
 *                 type: string
 *                 enum: [high, medium, low]
 *                 default: medium
 *                 description: Priority level of the ticket
 *               creator_id:
 *                 type: string
 *                 description: Optional unique identifier for the ticket creator
 *     responses:
 *       201:
 *         description: Ticket created successfully
 *       400:
 *         description: Bad request - missing required fields
 */
router.post('/tickets', async (req: Request, res: Response) => {
  try {
    const { title, description, creator_id, type, priority } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const db = getDB();
    const stmt = db.prepare(`
      INSERT INTO tickets (title, description, status, creator_id, type, priority, created_at, updated_at)
      VALUES (?, ?, 'pending', ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);
    const result = stmt.run(
      title,
      description || null,
      creator_id || null,
      type || 'feature',
      priority || 'medium'
    );

    const newTicket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({ ticket: newTicket });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

/**
 * @openapi
 * /api/tickets/{id}:
 *   patch:
 *     tags: [Tickets]
 *     summary: Update a ticket
 *     description: Update ticket fields including status, response, title, and description. No authentication required.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: false
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
 *                 enum: [pending, needs-info, completed, declined, unresolved]
 *               response:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [feature, bug, feedback]
 *                 description: Type of ticket
 *               priority:
 *                 type: string
 *                 enum: [high, medium, low]
 *                 description: Priority level of the ticket
 *               creator_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ticket updated successfully
 *       400:
 *         description: Bad request - invalid field values
 *       403:
 *         description: Forbidden - cannot edit non-pending tickets
 *       404:
 *         description: Ticket not found
 */
router.patch('/tickets/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, response, title, description, creator_id, type, priority } = req.body;

    // Check if any field is provided
    if (!status && !response && !title && !description) {
      return res.status(400).json({ error: 'At least one field must be provided' });
    }

    // Validate status if provided
    if (status && !['pending', 'needs-info', 'completed', 'declined', 'unresolved'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    // Validate title/description if provided
    if (title !== undefined && (typeof title !== 'string' || title.trim().length === 0)) {
      return res.status(400).json({ error: 'Title must be a non-empty string' });
    }

    if (description !== undefined && (typeof description !== 'string' || description.trim().length === 0)) {
      return res.status(400).json({ error: 'Description must be a non-empty string' });
    }

    const db = getDB();

    // Check if ticket exists
    const existing = db.prepare('SELECT * FROM tickets WHERE id = ?').get(id) as any;
    if (!existing) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Prevent editing tickets that are not in 'pending' status
    // Users can only edit tickets they own that are still pending
    const isEditing = title !== undefined || description !== undefined;
    if (isEditing && existing.status !== 'pending') {
      return res.status(403).json({ error: 'Cannot edit tickets that are not in pending status' });
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    // Auto-reset from "needs-info" to "pending" when user edits title/description
    const shouldResetStatus = (title !== undefined || description !== undefined) && existing.status === 'needs-info';

    if (status) {
      updates.push('status = ?');
      values.push(status);
    } else if (shouldResetStatus) {
      updates.push('status = ?');
      values.push('pending');
    }

    if (response !== undefined) {
      updates.push('response = ?');
      values.push(response);
    }
    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title.trim());
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description.trim());
    }
    if (type !== undefined) {
      updates.push('type = ?');
      values.push(type);
    }
    if (priority !== undefined) {
      updates.push('priority = ?');
      values.push(priority);
    }
    updates.push('updated_at = CURRENT_TIMESTAMP');

    const stmt = db.prepare(`UPDATE tickets SET ${updates.join(', ')} WHERE id = ?`);
    stmt.run(...values, id);

    const updatedTicket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(id);

    res.json({ ticket: updatedTicket });
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ error: 'Failed to update ticket' });
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
    const db = getDB();

    // Check if ticket exists
    const existing = db.prepare('SELECT * FROM tickets WHERE id = ?').get(id) as any;
    if (!existing) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Extract creator_id from body or headers
    const creator_id = req.body.creator_id || req.headers['x-creator-id'] as string;

    // Users can delete tickets by providing creator_id
    if (creator_id && existing.creator_id === creator_id) {
      // User is deleting their own ticket
    } else if (!creator_id) {
      // No creator_id provided - allow deletion
    } else {
      // Creator_id doesn't match
      return res.status(401).json({ error: 'Unauthorized: You can only delete your own tickets' });
    }

    const stmt = db.prepare('DELETE FROM tickets WHERE id = ?');
    stmt.run(id);

    res.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    res.status(500).json({ error: 'Failed to delete ticket' });
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
    const db = getDB();

    // Get the last 10 completed tickets (status = 'completed' or 'complete')
    const completedTickets = db.prepare(`
      SELECT created_at, updated_at
      FROM tickets
      WHERE status IN ('completed', 'complete')
      ORDER BY updated_at DESC
      LIMIT 10
    `).all() as { created_at: string; updated_at: string }[];

    // If we have fewer than 2 completed tickets, return null (not enough data)
    if (completedTickets.length < 2) {
      return res.json({
        estimatedWaitTimeMinutes: null,
        sampleSize: completedTickets.length,
        averageCompletionTimeHours: null
      });
    }

    // Calculate the average completion time
    let totalCompletionTime = 0;
    for (const ticket of completedTickets) {
      const created = new Date(ticket.created_at);
      const updated = new Date(ticket.updated_at);
      const completionTimeHours = (updated.getTime() - created.getTime()) / (1000 * 60 * 60);
      totalCompletionTime += completionTimeHours;
    }

    const averageCompletionTimeHours = totalCompletionTime / completedTickets.length;
    const estimatedWaitTimeMinutes = Math.round(averageCompletionTimeHours * 60);

    res.json({
      estimatedWaitTimeMinutes,
      sampleSize: completedTickets.length,
      averageCompletionTimeHours: Math.round(averageCompletionTimeHours * 100) / 100
    });
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
 *                       newestCreated:
 *                       type: string
 *                     oldestCompleted:
 *                       type: string
 *                     newestCompleted:
 *                       type: string
 */
router.get('/tickets/stats', async (req: Request, res: Response) => {
  try {
    const db = getDB();

    // Get total ticket count
    const totalTickets = db.prepare('SELECT COUNT(*) as count FROM tickets').get() as { count: number };

    // Get tickets by status
    const ticketsByStatus = db.prepare(`
      SELECT status, COUNT(*) as count
      FROM tickets
      GROUP BY status
    `).all() as any;

    // Convert to object format
    const byStatus: Record<string, number> = (ticketsByStatus as any[]).reduce<Record<string, number>>(
      (acc: Record<string, number>, row: any): Record<string, number> => {
        acc[row.status] = row.count;
        return acc;
      },
      {} as Record<string, number>
    );

    // Get oldest ticket
    const oldestTicket = db.prepare(`
      SELECT id, title, created_at
      FROM tickets
      ORDER BY created_at ASC
      LIMIT 1
    `).get() as any;

    // Get newest ticket
    const newestTicket = db.prepare(`
      SELECT id, title, created_at
      FROM tickets
      ORDER BY created_at DESC
      LIMIT 1
    `).get() as any;

    // Get date ranges
    const dates = db.prepare(`
      SELECT
        MIN(created_at) as oldestCreated,
        MAX(created_at) as newestCreated,
        MIN(CASE WHEN status = 'completed' THEN updated_at END) as oldestCompleted,
        MAX(CASE WHEN status = 'completed' THEN updated_at END) as newestCompleted
      FROM tickets
    `).get() as any;

    const stats = {
      totalTickets: totalTickets.count,
      byStatus,
      oldestTicket,
      newestTicket,
      dates: {
        oldestCreated: dates.oldestCreated,
        newestCreated: dates.newestCreated,
        oldestCompleted: dates.oldestCompleted || null,
        newestCompleted: dates.newestCompleted || null
      }
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching ticket stats:', error);
    res.status(500).json({ error: 'Failed to fetch ticket stats' });
  }
});

export default router;

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

    // Check if ticket exists
    const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(id) as any;
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Only allow appeals for completed or declined tickets
    if (!['completed', 'declined'].includes(ticket.status)) {
      return res.status(400).json({ error: 'Only completed or declined tickets can be appealed' });
    }

    // Create appeals table if it doesn't exist
    try {
      db.exec(`
        CREATE TABLE IF NOT EXISTS ticket_appeals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          ticket_id INTEGER NOT NULL,
          reason TEXT NOT NULL,
          creator_id TEXT NOT NULL,
          status TEXT DEFAULT 'pending',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          reviewed_at DATETIME,
          FOREIGN KEY (ticket_id) REFERENCES tickets(id)
        )
      `);
    } catch (err) {
      // Table already exists, ignore
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
