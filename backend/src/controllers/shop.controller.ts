import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

interface ShopItem {
  id: number;
  name: string;
  description: string;
  price: number;
  icon: string | null;
  category: string;
  effect: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface UserInventory {
  id: number;
  user_id: number;
  item_id: number;
  purchased_at: Date;
  item: ShopItem;
}

// Seed default shop items
async function seedShopItems(): Promise<void> {
  const count = await prisma.shopItem.count();
  if (count > 0) {
    return; // Already seeded
  }

  const items = [
    {
      name: 'Double Click Power',
      description: 'Your clicks are worth 2x points!',
      price: 500,
      icon: '✌️',
      category: 'clicker',
      effect: 'clickPower:2'
    },
    {
      name: 'Auto-Clicker Boost',
      description: 'Auto-clicker generates +1 point/second',
      price: 1000,
      icon: '🤖',
      category: 'clicker',
      effect: 'autoClickBoost:1'
    },
    {
      name: 'Custom Goose Emoji',
      description: 'Set a custom emoji for the digital goose',
      price: 300,
      icon: '🦆',
      category: 'cosmetic',
      effect: 'customGoose'
    },
    {
      name: 'Neon Goose Effect',
      description: 'Add a glowing neon effect to the goose',
      price: 250,
      icon: '✨',
      category: 'cosmetic',
      effect: 'neonGoose'
    },
    {
      name: 'Coolness Multiplier',
      description: 'All point gains multiplied by 1.5x',
      price: 2000,
      icon: '⭐',
      category: 'premium',
      effect: 'multiplier:1.5'
    },
    {
      name: 'Instant Points Bundle',
      description: 'Get 100 points instantly',
      price: 100,
      icon: '💎',
      category: 'consumable',
      effect: 'instantPoints:100'
    },
    {
      name: 'Golden Mushroom',
      description: 'Special mushroom skin for clicker',
      price: 750,
      icon: '🍄',
      category: 'cosmetic',
      effect: 'goldenMushroom'
    },
    {
      name: 'Speed Upgrades',
      description: 'Auto-clicker generates +2 points/second',
      price: 3000,
      icon: '⚡',
      category: 'clicker',
      effect: 'autoClickBoost:2'
    }
  ];

  await prisma.shopItem.createMany({
    data: items
  });

  console.log('✅ Shop items seeded successfully');
}

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
 *                       price:
 *                         type: integer
 *                       icon:
 *                         type: string
 *                       category:
 *                         type: string
 *                       effect:
 *                         type: string
 */
router.get('/items', async (req: Request, res: Response) => {
  try {
    await seedShopItems();
    const items = await prisma.shopItem.findMany({
      where: { is_active: true },
      orderBy: { price: 'asc' }
    });
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
router.get('/inventory', async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const userIdNum = Number(userId);

    const inventory = await prisma.purchasedItem.findMany({
      where: { user_id: userIdNum },
      include: {
        item: true
      },
      orderBy: { purchased_at: 'desc' }
    });

    const formattedInventory = inventory.map(inv => ({
      id: inv.id,
      itemId: inv.item_id,
      itemName: inv.item.name,
      itemIcon: inv.item.icon,
      category: inv.item.category,
      purchasedAt: inv.purchased_at
    }));

    res.json({ inventory: formattedInventory });
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
router.post('/purchase', async (req: Request, res: Response) => {
  try {
    const { userId, itemId } = req.body;

    if (!userId || !itemId) {
      return res.status(400).json({ error: 'userId and itemId are required' });
    }

    const userIdNum = Number(userId);
    const itemIdNum = Number(itemId);

    // Get item details
    const item = await prisma.shopItem.findUnique({
      where: { id: itemIdNum }
    });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Check if user already owns this item
    const owned = await prisma.purchasedItem.findUnique({
      where: {
        user_id_item_id: {
          user_id: userIdNum,
          item_id: itemIdNum
        }
      }
    });

    if (owned) {
      return res.status(400).json({ error: 'You already own this item' });
    }

    // Check user's current points (using User model)
    const user = await prisma.user.findUnique({
      where: { id: userIdNum }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // TODO: Implement points system on User model
    // For now, we'll assume the user has enough points
    // In a real implementation, you'd need a points field on the User model

    // Process purchase
    await prisma.purchasedItem.create({
      data: {
        user_id: userIdNum,
        item_id: itemIdNum
      }
    });

    res.json({
      success: true,
      item,
      newPoints: 1000, // Placeholder
      message: `Successfully purchased ${item.name}!`
    });
  } catch (error) {
    console.error('Error processing purchase:', error);
    res.status(500).json({ error: 'Failed to process purchase' });
  }
});

export default router;
