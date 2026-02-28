// Stock Market System

import prisma from './lib/prisma';

export interface Stock {
  name: string
  avatar: string
  price: number
  coolnessScore: number
  shares: number
  minPrice: number
  maxPrice: number
  priceHistory: { timestamp: number; price: number }[]
}

export interface UserPortfolio {
  userId: string
  cash: number
  holdings: { [stockName: string]: number }
  transactions: {
    timestamp: number
    type: 'buy' | 'sell'
    stockName: string
    shares: number
    price: number
    total: number
  }[]
}

// Rankings for initial stock prices
const rankings = [
  { avatar: '🥔', name: 'Cam', score: 10000 },
  { avatar: '🌙', name: 'Orlando', score: 10067 },
  { avatar: '<:flooshies:1000736727259947069>', name: 'Ashley', score: 5000 },
  { avatar: '🌸', name: 'Average Hex', score: 2000 },
  { avatar: '🔧', name: 'Temer3', score: 1800 },
  { avatar: '🌸', name: 'You', score: 1467 },
  { avatar: '🏍️', name: '美香', score: 21467 },
  { avatar: '<:sadcat:1000736705197907968>', name: "Chang'Yi", score: 1367 },
  { avatar: '🎮', name: 'RIUM+', score: 501 },
  { avatar: '🍄', name: 'Goopsworthy', score: 667 },
  { avatar: '🎮', name: 'Blair', score: 900 },
  { avatar: '✨', name: 'Others', score: 500 },
  { avatar: '%◕‿‿◕%', name: 'Claire Salem', score: 500 }
]

// Database-backed storage
export const stocks: { [name: string]: Stock } = {}

// Initialize stocks from database or rankings
async function initStocks() {
  try {
    // Check if stocks exist in database
    const count = await prisma.stock.count();

    if (count === 0) {
      // Insert initial stocks from rankings
      for (const person of rankings) {
        const basePrice = Math.round(person.score / 10);
        const stock: Stock = {
          name: person.name,
          avatar: person.avatar,
          price: basePrice,
          coolnessScore: person.score,
          shares: 1000, // Total shares available
          minPrice: Math.max(10, Math.round(basePrice * 0.5)), // Min 50% of base, minimum €10
          maxPrice: Math.round(basePrice * 5), // Max 5x base price
          priceHistory: [
            { timestamp: Date.now() - 30000, price: basePrice },
            { timestamp: Date.now(), price: basePrice }
          ]
        };

        await prisma.stock.create({
          data: {
            name: stock.name,
            avatar: stock.avatar,
            price: stock.price,
            coolness_score: stock.coolnessScore,
            shares: stock.shares,
            min_price: stock.minPrice,
            max_price: stock.maxPrice,
            price_history: JSON.stringify(stock.priceHistory)
          }
        });

        stocks[person.name] = stock;
      }
    } else {
      // Load stocks from database
      const stockRows = await prisma.stock.findMany();
      stockRows.forEach(row => {
        stocks[row.name] = {
          name: row.name,
          avatar: row.avatar,
          price: row.price,
          coolnessScore: row.coolness_score,
          shares: row.shares,
          minPrice: row.min_price,
          maxPrice: row.max_price,
          priceHistory: JSON.parse(row.price_history)
        };
      });
    }
  } catch (error) {
    console.error('Failed to initialize stocks:', error);
    throw error;
  }
}

// Initialize stocks at module load time
let initPromise: Promise<void> | null = null;

function ensureStocksInitialized(): Promise<void> {
  if (!initPromise) {
    initPromise = initStocks();
  }
  return initPromise;
}

// Start initialization immediately
ensureStocksInitialized().catch(error => {
  console.error('Failed to initialize stocks at module load:', error);
});

// Helper function to save stock to database
async function saveStock(name: string) {
  const stock = stocks[name];
  if (!stock) return;

  try {
    await prisma.stock.update({
      where: { name },
      data: {
        price: stock.price,
        shares: stock.shares,
        price_history: JSON.stringify(stock.priceHistory)
      }
    });
  } catch (error) {
    console.error(`Failed to save stock ${name}:`, error);
  }
}

// Initialize user portfolio from database
export async function initUserPortfolio(userId: string): Promise<UserPortfolio> {
  // Convert string userId to number for Prisma
  const userIdNum = parseInt(userId, 10);

  if (isNaN(userIdNum)) {
    throw new Error(`Invalid userId: ${userId} cannot be converted to a number`);
  }

  try {
    // Check if portfolio exists in database
    const row = await prisma.userPortfolio.findUnique({
      where: { user_id: userIdNum }
    });

    if (!row) {
      // Create new portfolio - this will fail if user doesn't exist in User table
      // due to foreign key constraint
      const portfolio: UserPortfolio = {
        userId,
        cash: 10000, // €10,000 starting cash
        holdings: {},
        transactions: []
      };

      try {
        await prisma.userPortfolio.create({
          data: {
            user_id: userIdNum,
            cash: portfolio.cash,
            holdings: JSON.stringify(portfolio.holdings),
            transactions: JSON.stringify(portfolio.transactions)
          }
        });
      } catch (createError: any) {
        // If it's a foreign key constraint error, the user doesn't exist
        if (createError.code === 'P2003') {
          throw new Error(`User with ID ${userId} does not exist in the database`);
        }
        throw createError;
      }

      return portfolio;
    }

    // Load existing portfolio
    return {
      userId: row.user_id.toString(),
      cash: row.cash,
      holdings: JSON.parse(row.holdings),
      transactions: JSON.parse(row.transactions)
    };
  } catch (error) {
    console.error(`Failed to initialize portfolio for user ${userId}:`, error);
    throw error;
  }
}

// Helper function to save portfolio to database
async function savePortfolio(userId: string, portfolio: UserPortfolio) {
  const userIdNum = parseInt(userId, 10);

  if (isNaN(userIdNum)) {
    console.error(`Invalid userId: ${userId} cannot be converted to a number`);
    return;
  }

  try {
    await prisma.userPortfolio.update({
      where: { user_id: userIdNum },
      data: {
        cash: portfolio.cash,
        holdings: JSON.stringify(portfolio.holdings),
        transactions: JSON.stringify(portfolio.transactions)
      }
    });
  } catch (error) {
    console.error(`Failed to save portfolio for user ${userId}:`, error);
  }
}

// Buy shares
export async function buyShares(userId: string, stockName: string, shares: number): Promise<{ success: boolean; message: string; newPrice?: number; newCash?: number }> {
  await ensureStocksInitialized();

  const portfolio = await initUserPortfolio(userId);
  const stock = stocks[stockName]

  if (!stock) {
    return { success: false, message: 'Stock not found' }
  }

  const totalCost = stock.price * shares

  if (totalCost > portfolio.cash) {
    return { success: false, message: 'Not enough cash' }
  }

  if (stock.shares < shares) {
    return { success: false, message: 'Not enough shares available' }
  }

  // Execute purchase
  portfolio.cash -= totalCost
  stock.shares -= shares

  // Update holdings
  if (!portfolio.holdings[stockName]) {
    portfolio.holdings[stockName] = 0
  }
  portfolio.holdings[stockName] += shares

  // Update stock price based on volume (buy = price up)
  const priceChangePercent = Math.min(0.15, (shares / 100) * 0.05) // Max 15% up
  const newPrice = Math.round(stock.price * (1 + priceChangePercent))
  stock.price = Math.max(stock.minPrice, Math.min(stock.maxPrice, newPrice))

  // Add to price history
  stock.priceHistory.push({ timestamp: Date.now(), price: stock.price })
  if (stock.priceHistory.length > 50) {
    stock.priceHistory.shift()
  }

  // Record transaction
  portfolio.transactions.push({
    timestamp: Date.now(),
    type: 'buy',
    stockName,
    shares,
    price: stock.price - (stock.price * priceChangePercent), // Price at time of purchase
    total: totalCost
  })

  // Save to database
  await savePortfolio(userId, portfolio)
  await saveStock(stockName)

  return { success: true, message: `Bought ${shares} shares of ${stockName}`, newPrice: stock.price, newCash: portfolio.cash }
}

// Sell shares
export async function sellShares(userId: string, stockName: string, shares: number): Promise<{ success: boolean; message: string; newPrice?: number; newCash?: number }> {
  await ensureStocksInitialized();

  const portfolio = await initUserPortfolio(userId);
  const stock = stocks[stockName]

  if (!stock) {
    return { success: false, message: 'Stock not found' }
  }

  const currentHoldings = portfolio.holdings[stockName] || 0

  if (currentHoldings < shares) {
    return { success: false, message: 'Not enough shares to sell' }
  }

  const totalRevenue = stock.price * shares

  // Execute sale
  portfolio.cash += totalRevenue
  stock.shares += shares
  portfolio.holdings[stockName] -= shares

  // Update stock price based on volume (sell = price down)
  const priceChangePercent = Math.min(0.15, (shares / 100) * 0.05) // Max 15% down
  const newPrice = Math.round(stock.price * (1 - priceChangePercent))
  stock.price = Math.max(stock.minPrice, Math.min(stock.maxPrice, newPrice))

  // Add to price history
  stock.priceHistory.push({ timestamp: Date.now(), price: stock.price })
  if (stock.priceHistory.length > 50) {
    stock.priceHistory.shift()
  }

  // Record transaction
  portfolio.transactions.push({
    timestamp: Date.now(),
    type: 'sell',
    stockName,
    shares,
    price: stock.price + (stock.price * priceChangePercent), // Price at time of sale
    total: totalRevenue
  })

  // Save to database
  await savePortfolio(userId, portfolio)
  await saveStock(stockName)

  return { success: true, message: `Sold ${shares} shares of ${stockName}`, newPrice: stock.price, newCash: portfolio.cash }
}

// Get all stocks
export function getAllStocks(): Stock[] {
  return Object.values(stocks)
}

// Get stock by name
export function getStock(name: string): Stock | undefined {
  return stocks[name]
}

// Get user portfolio
export async function getUserPortfolio(userId: string): Promise<UserPortfolio> {
  return await initUserPortfolio(userId)
}

// Calculate portfolio value
export async function calculatePortfolioValue(userId: string): Promise<number> {
  const portfolio = await initUserPortfolio(userId)
  let value = portfolio.cash

  Object.entries(portfolio.holdings).forEach(([stockName, shares]) => {
    const stock = stocks[stockName]
    if (stock) {
      value += stock.price * shares
    }
  })

  return value
}

// Add a new stock to the market (for GPU mining feature)
export async function addStock(config: {
  name: string
  avatar: string
  baseScore: number
  basePrice?: number
}): Promise<Stock> {
  await ensureStocksInitialized();

  try {
    // Check if stock already exists
    const existing = await prisma.stock.findUnique({
      where: { name: config.name }
    });

    if (existing) {
      // Return existing stock
      return stocks[config.name]!;
    }

    const price = config.basePrice || Math.round(config.baseScore / 10);
    const stock: Stock = {
      name: config.name,
      avatar: config.avatar,
      price,
      coolnessScore: config.baseScore,
      shares: 1000, // Total shares available
      minPrice: Math.max(10, Math.round(price * 0.5)), // Min 50% of base, minimum €10
      maxPrice: Math.round(price * 5), // Max 5x base price
      priceHistory: [
        { timestamp: Date.now(), price }
      ]
    };

    // Insert into database
    await prisma.stock.create({
      data: {
        name: stock.name,
        avatar: stock.avatar,
        price: stock.price,
        coolness_score: stock.coolnessScore,
        shares: stock.shares,
        min_price: stock.minPrice,
        max_price: stock.maxPrice,
        price_history: JSON.stringify(stock.priceHistory)
      }
    });

    // Add to in-memory store
    stocks[config.name] = stock;

    return stock;
  } catch (error) {
    console.error(`Failed to add stock ${config.name}:`, error);
    throw error;
  }
}
