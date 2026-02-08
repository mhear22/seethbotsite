import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'tickets.db');

let dbInstance: Database.Database | null = null;

/**
 * Get database instance for tickets
 */
export function getDB(): Database.Database {
  if (!dbInstance) {
    dbInstance = initDB();
  }
  return dbInstance;
}

/**
 * Initialize database and create tables/indexes
 */
function initDB(): Database.Database {
  // Ensure data directory exists
  const dataDir = path.join(__dirname, '..', '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const db = new Database(DB_PATH);

  // Create tickets table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      response TEXT,
      creator_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Add is_deleted column if it doesn't exist (for soft deletes)
  try {
    db.exec(`ALTER TABLE tickets ADD COLUMN is_deleted BOOLEAN DEFAULT 0`);
  } catch (err) {
    // Column already exists, ignore the error
  }

  // Add creator_id column if it doesn't exist (for existing databases)
  try {
    db.exec(`ALTER TABLE tickets ADD COLUMN creator_id TEXT`);
  } catch (err) {
    // Column already exists, ignore the error
  }

  // Add type column if it doesn't exist (for ticket filtering - Ticket #151)
  try {
    db.exec(`ALTER TABLE tickets ADD COLUMN type TEXT DEFAULT 'feature'`);
  } catch (err) {
    // Column already exists, ignore the error
  }

  // Add priority column if it doesn't exist (for ticket filtering - Ticket #151)
  try {
    db.exec(`ALTER TABLE tickets ADD COLUMN priority TEXT DEFAULT 'medium'`);
  } catch (err) {
    // Column already exists, ignore the error
  }

  // Add tags column if it doesn't exist (for ticket categorization - Ticket #140)
  try {
    db.exec(`ALTER TABLE tickets ADD COLUMN tags TEXT`);
  } catch (err) {
    // Column already exists, ignore the error
  }

  // Add category column if it doesn't exist (for ticket categorization - Ticket #140)
  try {
    db.exec(`ALTER TABLE tickets ADD COLUMN category TEXT`);
  } catch (err) {
    // Column already exists, ignore the error
  }

  // Add dependencies column if it doesn't exist (for ticket dependency tracking - Ticket #180)
  try {
    db.exec(`ALTER TABLE tickets ADD COLUMN dependencies TEXT`);
  } catch (err) {
    // Column already exists, ignore the error
  }

  // Create settings table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes for faster filtering and sorting (Ticket #77)
  try {
    db.exec(`CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_tickets_updated_at ON tickets(updated_at)`);
  } catch (err) {
    // Indexes might already exist, ignore
  }

  // Create appeals table if it doesn't exist
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS ticket_appeals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_id INTEGER NOT NULL,
        reason TEXT NOT NULL,
        creator_id TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        reviewed_at DATETIME,
        FOREIGN KEY (ticket_id) REFERENCES tickets(id)
      )
    `);
  } catch (err) {
    // Table already exists, ignore
  }

  return db;
}

/**
 * Parse dependencies from ticket description
 * Looks for patterns like "depends on #123", "requires #123", "blocked by #123"
 * Supports multiple ticket IDs like "depends on #123 and #124" or "requires #123, #124"
 * Returns array of ticket IDs
 */
export function parseDependencies(description: string | null): number[] {
  if (!description) return [];

  const dependencies: number[] = [];

  // Find all sections that contain dependency phrases
  const dependencyPhrases = [
    /depends\s+on\s+([^\n.]+)/gi,
    /requires\s+([^\n.]+)/gi,
    /blocked\s+by\s+([^\n.]+)/gi
  ];

  for (const phrasePattern of dependencyPhrases) {
    phrasePattern.lastIndex = 0; // Reset regex state
    let phraseMatch;
    while ((phraseMatch = phrasePattern.exec(description)) !== null) {
      // Extract the text after the dependency phrase
      const phraseText = phraseMatch[1];

      // Find all ticket IDs in this phrase (with or without # prefix)
      const ticketIds = phraseText.match(/#?(\d+)/g);
      if (ticketIds) {
        for (const idWithHash of ticketIds) {
          const ticketId = parseInt(idWithHash.replace('#', ''), 10);
          if (!isNaN(ticketId) && !dependencies.includes(ticketId)) {
            dependencies.push(ticketId);
          }
        }
      }
    }
  }

  return dependencies.sort((a, b) => a - b);
}

/**
 * Check if a ticket is blocked based on its dependencies
 * A ticket is blocked if any of its dependencies are not completed
 */
export function isTicketBlocked(db: Database.Database, dependencies: number[]): boolean {
  if (!dependencies || dependencies.length === 0) return false;

  // Check if all dependency tickets are completed or declined
  for (const depId of dependencies) {
    const depTicket = db.prepare('SELECT status FROM tickets WHERE id = ? AND is_deleted = 0').get(depId) as { status: string } | undefined;

    // If dependency doesn't exist or is not completed/declined, ticket is blocked
    if (!depTicket || !['completed', 'declined'].includes(depTicket.status)) {
      return true;
    }
  }

  return false;
}

/**
 * Settings helpers
 */
export function getIgnoreMode(): boolean {
  const db = getDB();
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('ignore_mode') as { value: string } | undefined;
  return row?.value === 'true';
}

export function setIgnoreMode(enabled: boolean): void {
  const db = getDB();
  db.prepare(`
    INSERT INTO settings (key, value) VALUES ('ignore_mode', ?)
    ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = CURRENT_TIMESTAMP
  `).run(String(enabled), String(enabled));
}
