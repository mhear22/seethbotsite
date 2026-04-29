import { Router, Request, Response } from 'express';
import * as stockMarket from '../stockMarket';
import { requireApiKey } from '../auth';
import { validations, handleValidationErrors } from '../middleware';

const router = Router();

/**
 * @openapi
 * /api/stocks:
 *   get:
 *     tags: [Stocks]
 *     summary: Get all stocks
 *     description: Returns a list of all available stocks in the market
 *     responses:
 *       200:
 *         description: List of all stocks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stocks:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Stock'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/stocks', (req: Request, res: Response) => {
  try {
    const allStocks = stockMarket.getAllStocks();
    res.json({ stocks: allStocks, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Error getting stocks:', error);
    res.status(500).json({ error: 'Failed to get stocks' });
  }
});

/**
 * @openapi
 * /api/stocks/{name}:
 *   get:
 *     tags: [Stocks]
 *     summary: Get specific stock by name
 *     description: Returns detailed information about a specific stock
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the stock
 *         example: Cam
 *     responses:
 *       200:
 *         description: Stock details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stock:
 *                   $ref: '#/components/schemas/Stock'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Stock not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Stock not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/stocks/:name', (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const stock = stockMarket.getStock(name);
    if (!stock) {
      return res.status(404).json({ error: 'Stock not found' });
    }
    res.json({ stock, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Error getting stock:', error);
    res.status(500).json({ error: 'Failed to get stock' });
  }
});

/**
 * @openapi
 * /api/stocks/buy:
 *   post:
 *     tags: [Stocks]
 *     summary: Buy stock shares
 *     description: Purchase shares of a stock. Requires authentication.
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - stockName
 *               - shares
 *             properties:
 *               userId:
 *                 type: string
 *                 maxLength: 100
 *                 example: user123
 *               stockName:
 *                 type: string
 *                 maxLength: 50
 *                 example: Cam
 *               shares:
 *                 type: integer
 *                 minimum: 1
 *                 example: 10
 *     responses:
 *       200:
 *         description: Shares purchased successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Successfully bought 10 shares
 *                 newPrice:
 *                   type: number
 *                   example: 105.50
 *                 newCash:
 *                   type: number
 *                   example: 8945.00
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/stocks/buy',
  validations.tradeStock,
  handleValidationErrors,
  requireApiKey(),
  (req: Request, res: Response) => {
    try {
      const { userId, stockName, shares } = req.body;
      if (!userId || !stockName || !shares || shares <= 0) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      const result = stockMarket.buyShares(userId, stockName, shares);
      res.json({ ...result, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('Error buying shares:', error);
      res.status(500).json({ error: 'Failed to buy shares' });
    }
  }
);

/**
 * @openapi
 * /api/stocks/sell:
 *   post:
 *     tags: [Stocks]
 *     summary: Sell stock shares
 *     description: Sell shares of a stock. Requires authentication.
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - stockName
 *               - shares
 *             properties:
 *               userId:
 *                 type: string
 *                 maxLength: 100
 *                 example: user123
 *               stockName:
 *                 type: string
 *                 maxLength: 50
 *                 example: Cam
 *               shares:
 *                 type: integer
 *                 minimum: 1
 *                 example: 5
 *     responses:
 *       200:
 *         description: Shares sold successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Successfully sold 5 shares
 *                 newPrice:
 *                   type: number
 *                   example: 98.75
 *                 newCash:
 *                   type: number
 *                   example: 9443.75
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/stocks/sell',
  validations.tradeStock,
  handleValidationErrors,
  requireApiKey(),
  (req: Request, res: Response) => {
    try {
      const { userId, stockName, shares } = req.body;
      if (!userId || !stockName || !shares || shares <= 0) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      const result = stockMarket.sellShares(userId, stockName, shares);
      res.json({ ...result, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('Error selling shares:', error);
      res.status(500).json({ error: 'Failed to sell shares' });
    }
  }
);

/**
 * @openapi
 * /api/portfolio/{userId}:
 *   get:
 *     tags: [Portfolio]
 *     summary: Get user portfolio
 *     description: Returns the portfolio and total value for a specific user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *         example: user123
 *     responses:
 *       200:
 *         description: Portfolio retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 portfolio:
 *                   $ref: '#/components/schemas/UserPortfolio'
 *                 portfolioValue:
 *                   type: number
 *                   example: 15234.50
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/portfolio/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const portfolio = await stockMarket.getUserPortfolio(userId);
    const portfolioValue = await stockMarket.calculatePortfolioValue(userId);
    res.json({ portfolio, portfolioValue, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Error getting portfolio:', error);
    res.status(500).json({ error: 'Failed to get portfolio' });
  }
});

export default router;
