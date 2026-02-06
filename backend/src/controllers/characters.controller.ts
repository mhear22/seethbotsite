import { Router, Request, Response } from 'express';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const router = Router();

// Database setup
const DB_PATH = path.join(__dirname, '..', '..', 'data', 'characters.db');

function getDB(): Database.Database {
  const dataDir = path.join(__dirname, '..', '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const db = new Database(DB_PATH);

  // Create characters table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS characters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      image_url TEXT,
      elo_rating INTEGER DEFAULT 1200,
      wins INTEGER DEFAULT 0,
      losses INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Add is_deleted column if it doesn't exist (for soft deletes)
  try {
    db.exec(`ALTER TABLE characters ADD COLUMN is_deleted BOOLEAN DEFAULT 0`);
  } catch (err) {
    // Column already exists, ignore the error
  }

  return db;
}

/**
 * @openapi
 * /api/characters:
 *   get:
 *     tags: [Characters]
 *     summary: Get all characters sorted by ELO rating
 *     responses:
 *       200:
 *         description: List of all characters
 */
router.get('/characters', async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const characters = db.prepare(`
      SELECT * FROM characters
      WHERE is_deleted = 0
      ORDER BY elo_rating DESC
    `).all();

    res.json({ characters });
  } catch (error) {
    console.error('Error fetching characters:', error);
    res.status(500).json({ error: 'Failed to fetch characters' });
  }
});

/**
 * @openapi
 * /api/characters/random-pair:
 *   get:
 *     tags: [Characters]
 *     summary: Get two random characters for comparison
 *     responses:
 *       200:
 *         description: Two random characters
 */
router.get('/characters/random-pair', async (req: Request, res: Response) => {
  try {
    const db = getDB();

    // Get all character IDs
    const allIds = db.prepare('SELECT id FROM characters WHERE is_deleted = 0').all() as { id: number }[];

    if (allIds.length < 2) {
      return res.json({ characters: [] });
    }

    // Get two random distinct IDs
    const shuffled = allIds.sort(() => Math.random() - 0.5);
    const pairIds = [shuffled[0].id, shuffled[1].id];

    // Fetch the two characters
    const characters = db.prepare(`
      SELECT * FROM characters
      WHERE id IN (?, ?) AND is_deleted = 0
    `).all(pairIds[0], pairIds[1]);

    res.json({ characters });
  } catch (error) {
    console.error('Error fetching random pair:', error);
    res.status(500).json({ error: 'Failed to fetch random pair' });
  }
});

/**
 * @openapi
 * /api/characters:
 *   post:
 *     tags: [Characters]
 *     summary: Create a new character
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               image_url:
 *                 type: string
 *     responses:
 *       201:
 *         description: Character created successfully
 */
router.post('/characters', async (req: Request, res: Response) => {
  try {
    const { name, image_url } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const db = getDB();
    const stmt = db.prepare(`
      INSERT INTO characters (name, image_url, elo_rating, wins, losses, created_at, updated_at)
      VALUES (?, ?, 1200, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);
    const result = stmt.run(name.trim(), image_url || null);

    const newCharacter = db.prepare('SELECT * FROM characters WHERE id = ? AND is_deleted = 0').get(result.lastInsertRowid);

    res.status(201).json({ character: newCharacter });
  } catch (error) {
    console.error('Error creating character:', error);
    res.status(500).json({ error: 'Failed to create character' });
  }
});

/**
 * @openapi
 * /api/characters/vote:
 *   post:
 *     tags: [Characters]
 *     summary: Vote for a character and update ELO ratings
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [winner_id, loser_id]
 *             properties:
 *               winner_id:
 *                 type: integer
 *               loser_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: ELO ratings updated successfully
 */
router.post('/characters/vote', async (req: Request, res: Response) => {
  try {
    const { winner_id, loser_id } = req.body;

    if (!winner_id || !loser_id) {
      return res.status(400).json({ error: 'Both winner_id and loser_id are required' });
    }

    if (winner_id === loser_id) {
      return res.status(400).json({ error: 'Winner and loser must be different characters' });
    }

    const db = getDB();

    // Get current ELO ratings
    const winner = db.prepare('SELECT * FROM characters WHERE id = ? AND is_deleted = 0').get(winner_id) as any;
    const loser = db.prepare('SELECT * FROM characters WHERE id = ? AND is_deleted = 0').get(loser_id) as any;

    if (!winner || !loser) {
      return res.status(404).json({ error: 'One or both characters not found' });
    }

    // Calculate ELO rating (K-factor of 32 for new ratings)
    const K = 32;
    const expectedWinner = 1 / (1 + Math.pow(10, (loser.elo_rating - winner.elo_rating) / 400));
    const expectedLoser = 1 / (1 + Math.pow(10, (winner.elo_rating - loser.elo_rating) / 400));

    const newWinnerElo = Math.round(winner.elo_rating + K * (1 - expectedWinner));
    const newLoserElo = Math.round(loser.elo_rating + K * (0 - expectedLoser));

    // Update winner
    db.prepare(`
      UPDATE characters
      SET elo_rating = ?, wins = wins + 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(newWinnerElo, winner_id);

    // Update loser
    db.prepare(`
      UPDATE characters
      SET elo_rating = ?, losses = losses + 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(newLoserElo, loser_id);

    // Fetch updated characters
    const updatedWinner = db.prepare('SELECT * FROM characters WHERE id = ? AND is_deleted = 0').get(winner_id);
    const updatedLoser = db.prepare('SELECT * FROM characters WHERE id = ? AND is_deleted = 0').get(loser_id);

    res.json({
      winner: updatedWinner,
      loser: updatedLoser,
      elo_change_winner: newWinnerElo - winner.elo_rating,
      elo_change_loser: newLoserElo - loser.elo_rating
    });
  } catch (error) {
    console.error('Error processing vote:', error);
    res.status(500).json({ error: 'Failed to process vote' });
  }
});

/**
 * @openapi
 * /api/characters/{id}:
 *   delete:
 *     tags: [Characters]
 *     summary: Delete a character
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Character deleted successfully
 */
router.delete('/characters/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDB();

    const stmt = db.prepare('UPDATE characters SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(id);

    res.json({ message: 'Character deleted successfully' });
  } catch (error) {
    console.error('Error deleting character:', error);
    res.status(500).json({ error: 'Failed to delete character' });
  }
});

export default router;
