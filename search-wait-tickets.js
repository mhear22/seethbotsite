const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'backend', 'data', 'tickets.db');
const db = new Database(DB_PATH);

// Search for tickets with "wait" or "estimate" in title or description
const waitTickets = db.prepare("SELECT id, title, status FROM tickets WHERE title LIKE '%wait%' OR description LIKE '%wait%' OR title LIKE '%estimate%' OR description LIKE '%estimate%'").all();
console.log('Tickets with wait/estimate keywords:', waitTickets);

// Get all pending ticket IDs and titles
const pendingTickets = db.prepare("SELECT id, title, created_at FROM tickets WHERE status = 'pending' ORDER BY created_at ASC").all();
console.log('\nAll pending tickets:');
pendingTickets.forEach(t => {
  console.log(`  ID ${t.id}: ${t.title} (created: ${t.created_at})`);
});

db.close();
