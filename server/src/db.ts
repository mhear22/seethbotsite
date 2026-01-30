import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(__dirname, '..', 'data', 'clicks.db');

// Initialize database
export function initDB(): Database.Database {
  const db = new Database(DB_PATH);

  // Create clicks table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS clicks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      count INTEGER NOT NULL DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert initial row if table is empty
  const row = db.prepare('SELECT COUNT(*) as count FROM clicks').get() as { count: number };
  if (row.count === 0) {
    db.prepare('INSERT INTO clicks (count) VALUES (0)').run();
  }

  return db;
}

let dbInstance: Database.Database | null = null;

export function getDB(): Database.Database {
  if (!dbInstance) {
    dbInstance = initDB();
  }
  return dbInstance;
}

// Click counter operations
export function getClickCount(): number {
  const db = getDB();
  const row = db.prepare('SELECT count FROM clicks WHERE id = 1').get() as { count: number } | undefined;
  return row?.count ?? 0;
}

export function incrementClick(): number {
  const db = getDB();
  const stmt = db.prepare(`
    UPDATE clicks
    SET count = count + 1, updated_at = CURRENT_TIMESTAMP
    WHERE id = 1
  `);
  stmt.run();
  return getClickCount();
}

export function resetClick(): number {
  const db = getDB();
  const stmt = db.prepare(`
    UPDATE clicks
    SET count = 0, updated_at = CURRENT_TIMESTAMP
    WHERE id = 1
  `);
  stmt.run();
  return 0;
}
