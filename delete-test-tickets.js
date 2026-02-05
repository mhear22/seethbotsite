const Database = require('better-sqlite3');
const db = new Database('backend/data/tickets.db');

// Delete test tickets (72-93)
const stmt = db.prepare("DELETE FROM tickets WHERE id BETWEEN 72 AND 93");
const result = stmt.run();

console.log(`Deleted ${result.changes} test tickets`);
