const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'backend/data/tickets.db');
const db = new Database(DB_PATH);

// Show all tickets with full details
console.log('All tickets in database:');
console.log('='.repeat(80));

const allTickets = db.prepare('SELECT * FROM tickets ORDER BY id').all();

allTickets.forEach(ticket => {
  const status = ticket.status === 'complete' || ticket.status === 'completed' ? '✅' : '⏳';
  console.log(`${status} ID ${ticket.id}: "${ticket.title}"`);
  console.log(`   Status: ${ticket.status}`);
  console.log(`   Type: ${ticket.type}`);
  console.log(`   Priority: ${ticket.priority}`);
  console.log(`   Description: ${ticket.description}`);
  console.log('   ' + '-'.repeat(76));
});

db.close();

console.log('\n' + '='.repeat(80));
console.log(`Total tickets: ${allTickets.length}`);
console.log(`Complete: ${allTickets.filter(t => t.status === 'complete' || t.status === 'completed').length}`);
console.log(`Pending: ${allTickets.filter(t => t.status === 'pending').length}`);
