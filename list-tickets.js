const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = '/home/seethbotsite/backend/data/tickets.db';
const db = new Database(DB_PATH);

const tickets = db.prepare('SELECT id, title, status FROM tickets ORDER BY id').all();

console.log('All tickets:');
tickets.forEach(ticket => {
  console.log(`ID: ${ticket.id}, Title: "${ticket.title}", Status: ${ticket.status}`);
});

db.close();
