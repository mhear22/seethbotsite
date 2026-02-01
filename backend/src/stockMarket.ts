// Stock Market System

import { getStocksDB } from './stocksDb';

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
  { avatar: '✨', name: 'Others', score: 500 }
]

// Database-backed storage
export const stocks: { [name: string]: Stock } = {}

// Initialize stocks from database or rankings
function initStocks() {
  const db = getStocksDB();

  // Check if stocks exist in database
  const row = db.prepare('SELECT COUNT(*) as count FROM stocks').get() as { count: number };

  if (row.count === 0) {
    // Insert initial stocks from rankings
    rankings.forEach(person => {
      const basePrice = Math.round(person.score / 10)
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
      }
      db.prepare(`
        INSERT INTO stocks (name, avatar, price, coolness_score, shares, min_price, max_price, price_history)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        stock.name,
        stock.avatar,
        stock.price,
        stock.coolnessScore,
        stock.shares,
        stock.minPrice,
        stock.maxPrice,
        JSON.stringify(stock.priceHistory)
      )
      stocks[person.name] = stock
    })
  } else {
    // Load stocks from database
    const stockRows = db.prepare('SELECT * FROM stocks').all() as any[];
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
      }
    })
  }
}

initStocks()

// Helper function to save stock to database
function saveStock(name: string) {
  const stock = stocks[name];
  if (!stock) return;

  const db = getStocksDB();
  db.prepare(`
    UPDATE stocks
    SET price = ?, shares = ?, price_history = ?
    WHERE name = ?
  `).run(
    stock.price,
    stock.shares,
    JSON.stringify(stock.priceHistory),
    name
  );
}

// Initialize user portfolio from database
export function initUserPortfolio(userId: string): UserPortfolio {
  const db = getStocksDB();

  // Check if portfolio exists in database
  const row = db.prepare('SELECT * FROM user_portfolios WHERE user_id = ?').get(userId) as any;

  if (!row) {
    // Create new portfolio
    const portfolio: UserPortfolio = {
      userId,
      cash: 10000, // €10,000 starting cash
      holdings: {},
      transactions: []
    }
    db.prepare(`
      INSERT INTO user_portfolios (user_id, cash, holdings, transactions)
      VALUES (?, ?, ?, ?)
    `).run(userId, portfolio.cash, JSON.stringify(portfolio.holdings), JSON.stringify(portfolio.transactions))
    return portfolio
  }

  // Load existing portfolio
  return {
    userId: row.user_id,
    cash: row.cash,
    holdings: JSON.parse(row.holdings),
    transactions: JSON.parse(row.transactions)
  }
}

// Helper function to save portfolio to database
function savePortfolio(userId: string, portfolio: UserPortfolio) {
  const db = getStocksDB();
  db.prepare(`
    UPDATE user_portfolios
    SET cash = ?, holdings = ?, transactions = ?
    WHERE user_id = ?
  `).run(portfolio.cash, JSON.stringify(portfolio.holdings), JSON.stringify(portfolio.transactions), userId)
}

// Buy shares
export function buyShares(userId: string, stockName: string, shares: number): { success: boolean; message: string; newPrice?: number; newCash?: number } {
  const portfolio = initUserPortfolio(userId)
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
  savePortfolio(userId, portfolio)
  saveStock(stockName)

  return { success: true, message: `Bought ${shares} shares of ${stockName}`, newPrice: stock.price, newCash: portfolio.cash }
}

// Sell shares
export function sellShares(userId: string, stockName: string, shares: number): { success: boolean; message: string; newPrice?: number; newCash?: number } {
  const portfolio = initUserPortfolio(userId)
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
  savePortfolio(userId, portfolio)
  saveStock(stockName)

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
export function getUserPortfolio(userId: string): UserPortfolio {
  return initUserPortfolio(userId)
}

// Calculate portfolio value
export function calculatePortfolioValue(userId: string): number {
  const portfolio = initUserPortfolio(userId)
  let value = portfolio.cash

  Object.entries(portfolio.holdings).forEach(([stockName, shares]) => {
    const stock = stocks[stockName]
    if (stock) {
      value += stock.price * shares
    }
  })

  return value
}
