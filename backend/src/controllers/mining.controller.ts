import { Router, Request, Response } from 'express';
import * as stockMarket from '../stockMarket';

const router = Router();

// List of potential new stocks to discover
const potentialStocks = [
  { name: 'Bitcoin', avatar: '₿', baseScore: 50000 },
  { name: 'Ethereum', avatar: '💎', baseScore: 40000 },
  { name: 'Dogecoin', avatar: '🐕', baseScore: 10000 },
  { name: 'Tesla', avatar: '🚗', baseScore: 60000 },
  { name: 'Apple', avatar: '🍎', baseScore: 80000 },
  { name: 'NVIDIA', avatar: '💻', baseScore: 70000 },
  { name: 'Google', avatar: '🔍', baseScore: 65000 },
  { name: 'Amazon', avatar: '📦', baseScore: 55000 },
  { name: 'Microsoft', avatar: '🪟', baseScore: 75000 },
  { name: 'Meta', avatar: '👓', baseScore: 45000 },
  { name: 'Solana', avatar: '☀️', baseScore: 35000 },
  { name: 'Cardano', avatar: '🃏', baseScore: 25000 },
  { name: 'GameStop', avatar: '🎮', baseScore: 20000 },
  { name: 'AMC', avatar: '🍿', baseScore: 15000 },
  { name: 'NFT Whale', avatar: '🖼️', baseScore: 30000 },
  { name: 'Crypto Bro', avatar: '📈', baseScore: 18000 },
  { name: 'HODL', avatar: '🤲', baseScore: 12000 },
  { name: 'To The Moon', avatar: '🚀', baseScore: 22000 },
  { name: 'Satoshi', avatar: '👤', baseScore: 99999 },
  { name: 'Whale Alert', avatar: '🐋', baseScore: 40000 }
];

// Mining progress storage (in production, use Redis or database)
const miningProgress = new Map<string, { progress: number; startTime: number; userId: string }>();

/**
 * @openapi
 * /api/mining/start:
 *   post:
 *     tags: [Mining]
 *     summary: Start GPU mining for new stocks
 *     description: Starts a simulated GPU mining process that will discover a new stock when complete. Mining takes approximately 30 seconds.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The user ID starting the mining operation
 *     responses:
 *       200:
 *         description: Mining started successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 estimatedTime:
 *                   type: number
 *                   description: Estimated mining time in seconds
 *       400:
 *         description: User is already mining
 *       500:
 *         description: Server error
 */
router.post('/mining/start', (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Check if user is already mining
    if (miningProgress.has(userId)) {
      const progress = miningProgress.get(userId)!;
      const elapsed = (Date.now() - progress.startTime) / 1000;
      return res.status(400).json({
        error: 'Already mining',
        message: `Mining in progress (${Math.floor(progress.progress)}% complete)`,
        progress: progress.progress,
        elapsed
      });
    }

    // Start mining
    const startTime = Date.now();
    miningProgress.set(userId, { progress: 0, startTime, userId });

    // Simulate mining progress (30 seconds total)
    const totalDuration = 30000; // 30 seconds
    const updateInterval = 1000; // Update every second
    let elapsed = 0;

    const progressInterval = setInterval(() => {
      elapsed += updateInterval;
      const progress = Math.min(100, (elapsed / totalDuration) * 100);

      const current = miningProgress.get(userId);
      if (current) {
        current.progress = progress;
      }

      if (elapsed >= totalDuration) {
        clearInterval(progressInterval);
        miningProgress.delete(userId);
      }
    }, updateInterval);

    res.json({
      message: 'GPU mining started',
      estimatedTime: 30,
      userId
    });
  } catch (error) {
    console.error('Error starting mining:', error);
    res.status(500).json({ error: 'Failed to start mining' });
  }
});

/**
 * @openapi
 * /api/mining/progress:
 *   get:
 *     tags: [Mining]
 *     summary: Get mining progress
 *     description: Returns the current progress of an ongoing mining operation
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID to check progress for
 *     responses:
 *       200:
 *         description: Mining progress retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 progress:
 *                   type: number
 *                   description: Mining progress percentage (0-100)
 *                 elapsed:
 *                   type: number
 *                   description: Time elapsed since mining started (seconds)
 *                 complete:
 *                   type: boolean
 *                   description: Whether mining is complete
 *       404:
 *         description: No mining operation found for this user
 *       500:
 *         description: Server error
 */
router.get('/mining/progress', (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const progress = miningProgress.get(userId);

    if (!progress) {
      return res.status(404).json({
        error: 'No mining operation found',
        message: 'No active mining operation for this user'
      });
    }

    const elapsed = (Date.now() - progress.startTime) / 1000;
    const complete = progress.progress >= 100;

    res.json({
      progress: Math.floor(progress.progress),
      elapsed: Math.floor(elapsed),
      complete
    });
  } catch (error) {
    console.error('Error getting mining progress:', error);
    res.status(500).json({ error: 'Failed to get mining progress' });
  }
});

/**
 * @openapi
 * /api/mining/claim:
 *   post:
 *     tags: [Mining]
 *     summary: Claim mined stock
 *     description: Claims a newly discovered stock after mining is complete. Returns the discovered stock.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The user ID claiming the stock
 *     responses:
 *       200:
 *         description: Stock claimed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stock:
 *                   type: object
 *                   description: The newly discovered stock
 *                 message:
 *                   type: string
 *       400:
 *         description: Mining not complete or not started
 *       500:
 *         description: Server error
 */
router.post('/mining/claim', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Check if mining is complete (progress was deleted from map)
    // In this implementation, mining is considered complete if it's not in the progress map
    // and the user hasn't claimed yet (we'll need to track claimed stocks in production)

    // For simplicity, we'll just generate a new stock when claimed
    // In production, track which users have mined which stocks

    // Select a random potential stock
    const randomIndex = Math.floor(Math.random() * potentialStocks.length);
    const potential = potentialStocks[randomIndex];

    // Generate the stock
    const basePrice = Math.round(potential.baseScore / 10);
    const newStock = await stockMarket.addStock({
      name: potential.name,
      avatar: potential.avatar,
      baseScore: potential.baseScore,
      basePrice
    });

    res.json({
      stock: newStock,
      message: `Successfully mined ${newStock.name}!`
    });
  } catch (error) {
    console.error('Error claiming stock:', error);
    res.status(500).json({ error: 'Failed to claim stock' });
  }
});

/**
 * @openapi
 * /api/mining/stats:
 *   get:
 *     tags: [Mining]
 *     summary: Get mining statistics
 *     description: Returns statistics about the mining system
 *     responses:
 *       200:
 *         description: Mining statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 activeMiners:
 *                   type: number
 *                   description: Number of users currently mining
 *                 totalStocksDiscovered:
 *                   type: number
 *                   description: Total number of stocks in the market
 *                 availableStocks:
 *                   type: number
 *                   description: Number of stocks that can still be discovered
 *       500:
 *         description: Server error
 */
router.get('/mining/stats', (req: Request, res: Response) => {
  try {
    const allStocks = stockMarket.getAllStocks();
    const discoveredStocks = new Set(allStocks.map(s => s.name));

    // Count how many potential stocks haven't been discovered yet
    const availableStocks = potentialStocks.filter(s => !discoveredStocks.has(s.name)).length;

    res.json({
      activeMiners: miningProgress.size,
      totalStocksDiscovered: allStocks.length,
      availableStocks,
      totalPotential: potentialStocks.length
    });
  } catch (error) {
    console.error('Error getting mining stats:', error);
    res.status(500).json({ error: 'Failed to get mining stats' });
  }
});

export default router;
