const Database = require('better-sqlite3');

// Open both databases
const backendDB = new Database('backend/data/tickets.db', { readonly: true });
const containerDB = new Database('container-tickets.db');

// Get all tickets from backend
const backendTickets = backendDB.prepare('SELECT id, status FROM tickets').all();

console.log('Syncing container-tickets.db with backend/data/tickets.db...');
console.log('='.repeat(80));

for (const ticket of backendTickets) {
  // Check if ticket exists in container db
  const containerTicket = containerDB.prepare('SELECT id, status FROM tickets WHERE id = ?').get(ticket.id);

  if (containerTicket) {
    // Update status if different
    if (containerTicket.status !== ticket.status) {
      console.log(`Updating ticket ${ticket.id}: ${containerTicket.status} -> ${ticket.status}`);
      containerDB.prepare('UPDATE tickets SET status = ? WHERE id = ?').run(ticket.status, ticket.id);
    } else {
      console.log(`Ticket ${ticket.id}: Already in sync (${ticket.status})`);
    }
  } else {
    console.log(`Ticket ${ticket.id}: Not found in container db (skipping)`);
  }
}

console.log('='.repeat(80));
console.log('Sync complete!');

containerDB.close();
backendDB.close();
