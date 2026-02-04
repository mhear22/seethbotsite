const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'data', 'tickets.db');

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(DB_PATH);

// Create tickets table if it doesn't exist (same as controller)
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

console.log('Starting migration: Adding type and priority columns to tickets table...');

try {
  // Add type column
  try {
    db.exec(`ALTER TABLE tickets ADD COLUMN type TEXT DEFAULT 'feature'`);
    console.log('✓ Added type column (default: feature)');
  } catch (err) {
    if (err.message.includes('duplicate column name')) {
      console.log('✓ type column already exists');
    } else {
      throw err;
    }
  }

  // Add priority column
  try {
    db.exec(`ALTER TABLE tickets ADD COLUMN priority TEXT DEFAULT 'medium'`);
    console.log('✓ Added priority column (default: medium)');
  } catch (err) {
    if (err.message.includes('duplicate column name')) {
      console.log('✓ priority column already exists');
    } else {
      throw err;
    }
  }

  // Create indexes for better query performance
  try {
    db.exec(`CREATE INDEX IF NOT EXISTS idx_tickets_type ON tickets(type)`);
    console.log('✓ Created index on type column');
  } catch (err) {
    console.log('Note: Could not create index on type:', err.message);
  }

  try {
    db.exec(`CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority)`);
    console.log('✓ Created index on priority column');
  } catch (err) {
    console.log('Note: Could not create index on priority:', err.message);
  }

  try {
    db.exec(`CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status)`);
    console.log('✓ Created index on status column');
  } catch (err) {
    console.log('Note: Could not create index on status:', err.message);
  }

  // Verify the columns exist
  const ticket = db.prepare(`SELECT * FROM tickets LIMIT 1`).get();
  if (ticket) {
    console.log('\n✓ Current tickets table structure:', Object.keys(ticket));
  } else {
    console.log('\n✓ No tickets in database yet (table is empty)');
  }

  console.log('\n✓ Migration completed successfully!');
} catch (err) {
  console.error('\n✗ Migration failed:', err.message);
  process.exit(1);
} finally {
  db.close();
}
