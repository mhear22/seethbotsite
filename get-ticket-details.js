const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = '/home/seethbotsite/backend/data/tickets.db';
const db = new Database(DB_PATH);

// Get all tickets with details
const tickets = db.prepare('SELECT * FROM tickets ORDER BY id').all();

console.log('All tickets:');
tickets.forEach(ticket => {
  console.log(`\n=== ID: ${ticket.id} ===`);
  console.log(`Title: "${ticket.title}"`);
  console.log(`Status: ${ticket.status}`);
  console.log(`Description: ${ticket.description || 'N/A'}`);
  console.log(`Created: ${ticket.created_at || 'N/A'}`);
  console.log(`Updated: ${ticket.updated_at || 'N/A'}`);
});

db.close();
