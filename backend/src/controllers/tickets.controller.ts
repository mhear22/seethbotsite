import { Router, Request, Response } from 'express';
import { validateApiKey, extractApiKey } from '../auth';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const router = Router();

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

  // Create settings table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

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
 *                     type:
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

    // Get the next pending ticket, excluding those picked in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const ticket = db.prepare(`
      SELECT * FROM tickets
      WHERE status = 'pending'
        AND (updated_at < ? OR updated_at IS NULL)
        AND (title NOT LIKE '%weiner%' AND title NOT LIKE '%fire%')
      ORDER BY priority DESC, created_at ASC
      LIMIT 1
    `).get(oneHourAgo) || null;

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
 *     description: Updates the timestamp of the last ticket collection. Requires API key authentication.
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
 *       401:
 *         description: Unauthorized - invalid API key
 */
router.patch('/tickets/settings/last-collection', async (req: Request, res: Response) => {
  try {
    // Require API key
    const apiKey = extractApiKey(req);
    if (!apiKey || !validateApiKey(apiKey)) {
      return res.status(401).json({ error: 'Unauthorized: Invalid API key' });
    }

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
 *     description: Returns all tickets with optional filtering by status, type, and priority
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
 *                       type:
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
 */
router.get('/tickets', async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const { status = 'all', type = 'all', priority = 'all' } = req.query;

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

    query += ' ORDER BY created_at DESC';

    const tickets = db.prepare(query).all(...params);
    res.json({ tickets });
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
 *     description: Creates a new ticket with title and description. Optionally includes a creator_id for ticket ownership tracking.
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
    const { title, description, creator_id } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const db = getDB();
    const stmt = db.prepare(`
      INSERT INTO tickets (title, description, status, creator_id, created_at, updated_at)
      VALUES (?, ?, 'pending', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);
    const result = stmt.run(title, description, creator_id || null);

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
 *                 enum: [pending, needs-info, completed, declined]
 *               response:
 *                 type: string
 *               creator_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ticket updated successfully
 *       401:
 *         description: Unauthorized - invalid API key or not ticket creator
 *       400:
 *         description: Bad request - invalid field values
 *       404:
 *         description: Ticket not found
 */
router.patch('/tickets/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, response, title, description, creator_id } = req.body;

    // Require API key for status/response updates (admin operations)
    // OR allow users to close their own tickets
    const apiKey = extractApiKey(req);
    const hasValidApiKey = apiKey && validateApiKey(apiKey);

    // Check if any field is provided
    if (!status && !response && !title && !description) {
      return res.status(400).json({ error: 'At least one field must be provided' });
    }

    // Validate status if provided
    if (status && !['pending', 'needs-info', 'completed', 'declined'].includes(status)) {
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

    // Check authorization for status/response updates
    if (status || response) {
      const isCreator = creator_id && existing.creator_id === creator_id;
      const isClosingOwnTicket = isCreator && ['completed', 'declined'].includes(status || '');

      // Admins can update status/response freely
      // Users can only close their own tickets (completed/declined)
      // Users cannot add admin responses
      if (!hasValidApiKey) {
        if (response) {
          return res.status(401).json({ error: 'Unauthorized: API key required for admin responses' });
        }
        if (status && !isClosingOwnTicket) {
          return res.status(401).json({ error: 'Unauthorized: API key required for status changes (except closing own ticket)' });
        }
        if (status && !isCreator) {
          return res.status(401).json({ error: 'Unauthorized: You can only close your own tickets' });
        }
      }
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    // Auto-reset from "needs-info" to "pending" when user edits title/description
    const isUserEdit = !hasValidApiKey;
    const shouldResetStatus = isUserEdit && (title !== undefined || description !== undefined) && existing.status === 'needs-info';

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
 *     description: Deletes a ticket. Requires API key authentication for admins, or creator_id in request body or X-Creator-ID header for ticket creators.
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
 *         description: Unauthorized - invalid API key or not ticket creator
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

    // Check authorization
    const apiKey = extractApiKey(req);
    const hasValidApiKey = apiKey && validateApiKey(apiKey);

    // Extract creator_id from body or headers
    const creator_id = req.body.creator_id || req.headers['x-creator-id'] as string;

    // Admins can delete any ticket
    // Users can only delete their own tickets
    if (!hasValidApiKey) {
      if (!creator_id) {
        return res.status(401).json({ error: 'Unauthorized: Creator ID required to delete own tickets' });
      }
      if (existing.creator_id !== creator_id) {
        return res.status(401).json({ error: 'Unauthorized: You can only delete your own tickets' });
      }
    }

    const stmt = db.prepare('DELETE FROM tickets WHERE id = ?');
    stmt.run(id);

    res.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    res.status(500).json({ error: 'Failed to delete ticket' });
  }
});

export default router;
