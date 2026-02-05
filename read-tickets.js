const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'backend', 'data', 'tickets.db');
const db = new Database(dbPath);

// Get tickets by ID
const ticketIds = [30, 38, 49, 62, 69, 76, 77, 82, 88, 91, 92, 95, 109];
const placeholders = ticketIds.map(() => '?').join(',');

const tickets = db.prepare(`SELECT id, title, description, status, created_at, updated_at FROM tickets WHERE id IN (${placeholders}) ORDER BY id`).all(...ticketIds);

console.log(JSON.stringify(tickets, null, 2));

db.close();
