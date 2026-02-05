import { Router, Request, Response } from 'express';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const router = Router();

// Database setup
const DB_PATH = path.join(__dirname, '..', '..', 'data', 'users.db');
const POINTS_DB_PATH = path.join(__dirname, '..', '..', 'data', 'tickets.db');

interface ShopItem {
  id: number;
  name: string;
  description: string;
  cost: number;
  icon: string;
  category: string;
  effect?: string;
}

interface UserInventory {
  id: number;
  userId: string;
  itemId: number;
  purchasedAt: string;
}

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const getPointsDB = (): Database.Database => {
  const db = new Database(POINTS_DB_PATH);

  // Create shop items table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS shop_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      cost INTEGER NOT NULL,
      icon TEXT NOT NULL,
      category TEXT NOT NULL,
      effect TEXT
    )
  `);

  // Create user inventory table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      itemId INTEGER NOT NULL,
      purchasedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (itemId) REFERENCES shop_items(id)
    )
  `);

  // Insert default shop items if none exist
  const count = db.prepare('SELECT COUNT(*) as count FROM shop_items').get() as { count: number };
  if (count.count === 0) {
    const items = [
      {
        name: 'Double Click Power',
        description: 'Your clicks are worth 2x points!',
        cost: 500,
        icon: '✌️',
        category: 'clicker',
        effect: 'clickPower:2'
      },
      {
        name: 'Auto-Clicker Boost',
        description: 'Auto-clicker generates +1 point/second',
        cost: 1000,
        icon: '🤖',
        category: 'clicker',
        effect: 'autoClickBoost:1'
      },
      {
        name: 'Custom Goose Emoji',
        description: 'Set a custom emoji for the digital goose',
        cost: 300,
        icon: '🦆',
        category: 'cosmetic',
        effect: 'customGoose'
      },
      {
        name: 'Neon Goose Effect',
        description: 'Add a glowing neon effect to the goose',
        cost: 250,
        icon: '✨',
        category: 'cosmetic',
        effect: 'neonGoose'
      },
      {
        name: 'Coolness Multiplier',
        description: 'All point gains multiplied by 1.5x',
        cost: 2000,
        icon: '⭐',
        category: 'premium',
        effect: 'multiplier:1.5'
      },
      {
        name: 'Instant Points Bundle',
        description: 'Get 100 points instantly',
        cost: 100,
        icon: '💎',
        category: 'consumable',
        effect: 'instantPoints:100'
      },
      {
        name: 'Golden Mushroom',
        description: 'Special mushroom skin for clicker',
        cost: 750,
        icon: '🍄',
        category: 'cosmetic',
        effect: 'goldenMushroom'
      },
      {
        name: 'Speed Upgrades',
        description: 'Auto-clicker generates +2 points/second',
        cost: 3000,
        icon: '⚡',
        category: 'clicker',
        effect: 'autoClickBoost:2'
      }
    ];

    const insertStmt = db.prepare(`
      INSERT INTO shop_items (name, description, cost, icon, category, effect)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    items.forEach(item => {
      insertStmt.run(item.name, item.description, item.cost, item.icon, item.category, item.effect);
    });
  }

  return db;
};

/**
 * @openapi
 * /api/shop/items:
 *   get:
 *     tags: [Shop]
 *     summary: Get all shop items
 *     description: Returns a list of all available shop items with their costs
 *     responses:
 *       200:
 *         description: Shop items retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       cost:
 *                         type: integer
 *                       icon:
 *                         type: string
 *                       category:
 *                         type: string
 *                       effect:
 *                         type: string
 */
router.get('/items', (req: Request, res: Response) => {
  try {
    const db = getPointsDB();
    const items = db.prepare('SELECT * FROM shop_items ORDER BY cost ASC').all() as ShopItem[];
    res.json({ items });
  } catch (error) {
    console.error('Error fetching shop items:', error);
    res.status(500).json({ error: 'Failed to fetch shop items' });
  }
});

/**
 * @openapi
 * /api/shop/inventory:
 *   get:
 *     tags: [Shop]
 *     summary: Get user's inventory
 *     description: Returns a list of items a user has purchased
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User inventory retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 inventory:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       itemId:
 *                         type: integer
 *                       itemName:
 *                         type: string
 *                       itemIcon:
 *                         type: string
 *                       purchasedAt:
 *                         type: string
 */
router.get('/inventory', (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const db = getPointsDB();
    const inventory = db.prepare(`
      SELECT 
        ui.id,
        ui.itemId,
        si.name as itemName,
        si.icon as itemIcon,
        si.category,
        ui.purchasedAt
      FROM user_inventory ui
      JOIN shop_items si ON ui.itemId = si.id
      WHERE ui.userId = ?
      ORDER BY ui.purchasedAt DESC
    `).all(userId) as (UserInventory & { itemName: string; itemIcon: string; category: string })[];

    res.json({ inventory });
  } catch (error) {
    console.error('Error fetching user inventory:', error);
    res.status(500).json({ error: 'Failed to fetch user inventory' });
  }
});

/**
 * @openapi
 * /api/shop/purchase:
 *   post:
 *     tags: [Shop]
 *     summary: Purchase an item from the shop
 *     description: Purchase an item using coolness points
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - itemId
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "user123"
 *                 description: User ID making the purchase
 *               itemId:
 *                 type: integer
 *                 example: 1
 *                 description: ID of the item to purchase
 *     responses:
 *       200:
 *         description: Purchase successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 item:
 *                   type: object
 *                 newPoints:
 *                   type: integer
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request or insufficient points
 *       404:
 *         description: Item not found
 */
router.post('/purchase', (req: Request, res: Response) => {
  try {
    const { userId, itemId } = req.body;

    if (!userId || !itemId) {
      return res.status(400).json({ error: 'userId and itemId are required' });
    }

    const db = getPointsDB();

    // Get item details
    const item = db.prepare('SELECT * FROM shop_items WHERE id = ?').get(itemId) as ShopItem | undefined;
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Check if user already owns this item
    const owned = db.prepare('SELECT id FROM user_inventory WHERE userId = ? AND itemId = ?').get(userId, itemId) as { id: number } | undefined;
    if (owned) {
      return res.status(400).json({ error: 'You already own this item' });
    }

    // Check user's current points
    const pointsDb = new Database(POINTS_DB_PATH);
    const userPoints = pointsDb.prepare('SELECT points FROM points WHERE userId = ?').get(userId) as { points: number } | undefined;

    if (!userPoints) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (userPoints.points < item.cost) {
      return res.status(400).json({ 
        error: 'Insufficient points',
        required: item.cost,
        current: userPoints.points 
      });
    }

    // Process purchase
    const now = new Date().toISOString();

    // Deduct points
    const newPoints = userPoints.points - item.cost;
    pointsDb.prepare('UPDATE points SET points = ? WHERE userId = ?').run(newPoints, userId);

    // Add to inventory
    db.prepare('INSERT INTO user_inventory (userId, itemId, purchasedAt) VALUES (?, ?, ?)').run(userId, itemId, now);

    pointsDb.close();
    db.close();

    res.json({
      success: true,
      item,
      newPoints,
      message: `Successfully purchased ${item.name}!`
    });
  } catch (error) {
    console.error('Error processing purchase:', error);
    res.status(500).json({ error: 'Failed to process purchase' });
  }
});

export default router;
