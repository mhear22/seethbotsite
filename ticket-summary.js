const Database = require('better-sqlite3');
const db = new Database('backend/data/tickets.db');

const tickets = db.prepare("SELECT id, title, status, type, priority FROM tickets ORDER BY id").all();

// Group by status
const byStatus = {
  pending: [],
  'needs-info': [],
  completed: [],
  declined: []
};

tickets.forEach(ticket => {
  const normalizedStatus = ticket.status === 'complete' ? 'completed' : ticket.status;
  if (byStatus[normalizedStatus]) {
    byStatus[normalizedStatus].push(ticket);
  }
});

console.log('Ticket Status Summary:');
console.log('='.repeat(80));
console.log(`Pending: ${byStatus.pending.length} tickets`);
console.log(`Needs Info: ${byStatus['needs-info'].length} tickets`);
console.log(`Completed: ${byStatus.completed.length} tickets`);
console.log(`Declined: ${byStatus.declined.length} tickets`);
console.log('='.repeat(80));

if (byStatus.pending.length > 0) {
  console.log('\n📋 Pending Tickets:');
  byStatus.pending.forEach(ticket => {
    console.log(`   #${ticket.id}: ${ticket.title} (${ticket.type}/${ticket.priority})`);
  });
}

if (byStatus['needs-info'].length > 0) {
  console.log('\n❓ Needs Info Tickets:');
  byStatus['needs-info'].forEach(ticket => {
    console.log(`   #${ticket.id}: ${ticket.title} (${ticket.type}/${ticket.priority})`);
  });
}
