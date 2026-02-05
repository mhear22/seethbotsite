const Database = require('better-sqlite3');
const db = new Database('backend/data/tickets.db');

const tickets = db.prepare("SELECT id, title, status FROM tickets WHERE id BETWEEN 28 AND 96 ORDER BY id").all();
console.log(JSON.stringify(tickets, null, 2));
