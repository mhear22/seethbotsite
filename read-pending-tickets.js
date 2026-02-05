const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'backend', 'data', 'tickets.db');
const db = new Database(dbPath);

// Get all tickets with status pending or needs-info
const tickets = db.prepare(`SELECT id, title, status, created_at, updated_at FROM tickets WHERE status IN ('pending', 'needs-info') ORDER BY id`).all();

console.log(JSON.stringify(tickets, null, 2));

db.close();
