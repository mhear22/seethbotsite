const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data/tickets.db');
const db = new Database(DB_PATH);

const ticket = db.prepare('SELECT id, title, status, response FROM tickets WHERE id = 13').get();
console.log('Ticket 13 Final Status:');
console.log('='.repeat(60));
console.log(`ID: ${ticket.id}`);
console.log(`Title: ${ticket.title}`);
console.log(`Status: ${ticket.status}`);
console.log(`Response: ${ticket.response}`);

db.close();
