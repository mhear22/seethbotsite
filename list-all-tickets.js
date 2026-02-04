const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'backend/data/tickets.db');
const db = new Database(DB_PATH);

// Get all tickets
const tickets = db.prepare('SELECT * FROM tickets ORDER BY id').all();

console.log('All tickets in database:');
tickets.forEach(ticket => {
  console.log(`\n=== ID: ${ticket.id} ===`);
  console.log(`Title: "${ticket.title}"`);
  console.log(`Status: ${ticket.status}`);
  if (ticket.response) {
    console.log(`Response: ${ticket.response.substring(0, 100)}...`);
  }
});

db.close();
