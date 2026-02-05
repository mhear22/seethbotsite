const Database = require('better-sqlite3');
const db = new Database('backend/data/tickets.db', { readonly: true });

// Get all tickets
const allTickets = db.prepare('SELECT id, title, status, created_at FROM tickets ORDER BY id').all();

console.log('=== All Tickets ===');
console.log(JSON.stringify(allTickets, null, 2));

db.close();
