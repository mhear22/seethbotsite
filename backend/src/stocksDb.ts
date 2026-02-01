import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(__dirname, '..', 'data', 'stocks.db');

// Initialize database
export function initStocksDB(): Database.Database {
  const db = new Database(DB_PATH);

  // Create stocks table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS stocks (
      name TEXT PRIMARY KEY,
      avatar TEXT NOT NULL,
      price INTEGER NOT NULL,
      coolness_score INTEGER NOT NULL,
      shares INTEGER NOT NULL,
      min_price INTEGER NOT NULL,
      max_price INTEGER NOT NULL,
      price_history TEXT NOT NULL
    )
  `);

  // Create user_portfolios table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_portfolios (
      user_id TEXT PRIMARY KEY,
      cash INTEGER NOT NULL DEFAULT 10000,
      holdings TEXT NOT NULL DEFAULT '{}',
      transactions TEXT NOT NULL DEFAULT '[]'
    )
  `);

  return db;
}

let dbInstance: Database.Database | null = null;

export function getStocksDB(): Database.Database {
  if (!dbInstance) {
    dbInstance = initStocksDB();
  }
  return dbInstance;
}
