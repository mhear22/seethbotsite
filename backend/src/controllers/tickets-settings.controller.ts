/**
 * tickets-settings.controller.ts
 *
 * Ticket processing settings (ignore-mode, last-collection)
 *
 * This controller handles system-level settings for ticket processing:
 * - Toggle ticket processing pause mode
 * - Track and update last collection timestamps
 */

import { Router, Request, Response } from 'express';
import {
  getIgnoreMode,
  setIgnoreMode,
  getDB
} from '../services/tickets-db';

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

export default router;
