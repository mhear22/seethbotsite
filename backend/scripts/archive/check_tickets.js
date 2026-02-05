const Database = require('better-sqlite3');
const path = require('path');
const DB_PATH = path.join(__dirname, 'data/tickets.db');

const db = new Database(DB_PATH);

// Check if tickets table exists
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables:', tables);

// Get ticket 14
try {
  const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(14);
  console.log('\nTicket 14:', JSON.stringify(ticket, null, 2));
} catch (err) {
  console.log('\nError getting ticket 14:', err.message);
}

// Get all tickets
try {
  const tickets = db.prepare('SELECT * FROM tickets ORDER BY id').all();
  console.log('\nAll tickets:', tickets.length);
  tickets.forEach(t => console.log(`  ID ${t.id}: ${t.title} (${t.status})`));
} catch (err) {
  console.log('\nError getting all tickets:', err.message);
}

db.close();
