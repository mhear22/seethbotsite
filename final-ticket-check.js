const Database = require('better-sqlite3');
const db = new Database('backend/data/tickets.db');

console.log('📊 Final Ticket Status Check');
console.log('='.repeat(80));

// Check cat-related tickets
const catTickets = [94, 96];
console.log('\nCat Page Tickets:');
catTickets.forEach(ticketId => {
  const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(ticketId);
  if (ticket) {
    const status = ticket.status === 'completed' ? '✅' : '❌';
    console.log(`${status} Ticket #${ticket.id}: "${ticket.title}"`);
    console.log(`   Status: ${ticket.status}`);
    console.log();
  }
});

// Check Discord ticket (needs-info)
const discordTicket = db.prepare('SELECT * FROM tickets WHERE id = 64').get();
if (discordTicket) {
  console.log('📋 Needs-Info Ticket:');
  console.log(`❓ Ticket #${discordTicket.id}: "${discordTicket.title}"`);
  console.log(`   Status: ${discordTicket.status} (waiting for user info)`);
  console.log();
}

// Count all pending tickets
const pendingCount = db.prepare("SELECT COUNT(*) as count FROM tickets WHERE status = 'pending'").get();
console.log('='.repeat(80));
console.log(`📈 Pending Tickets Remaining: ${pendingCount.count}`);
console.log('='.repeat(80));
