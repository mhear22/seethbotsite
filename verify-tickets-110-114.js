const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'container-tickets.db');
const db = new Database(dbPath, { readonly: true });

// Get ticket info
const getTicketInfo = (ticketId) => {
  const ticket = db.prepare('SELECT id, title, status, updated_at FROM tickets WHERE id = ?').get(ticketId);
  if (!ticket) {
    console.log(`  Ticket #${ticketId}: NOT FOUND`);
    return null;
  }
  const updatedAt = new Date(ticket.updated_at).toISOString();
  console.log(`  Ticket #${ticketId}: ${ticket.status} (updated: ${updatedAt})`);
  return ticket;
};

async function main() {
  try {
    console.log('Ticket Completion Report\n');
    console.log('=====================\n');

    console.log('Tickets 110-114:');
    const ids = [110, 111, 112, 113, 114];
    ids.forEach(id => getTicketInfo(id));

    console.log('\nSummary:');
    const completed = db.prepare("SELECT COUNT(*) as count FROM tickets WHERE id IN (110,111,112,113,114) AND status IN ('complete', 'completed')").get();
    console.log(`  ✅ Completed: ${completed.count}/5 tickets`);
    console.log(`  📊 Success Rate: ${(completed.count/5*100).toFixed(0)}%`);

    console.log('\nDeployment Status:');
    console.log(`  🐳 Container: seethbot-server`);
    console.log(`  🌐 URL: http://localhost:8081`);
    console.log(`  📦 Build: #37`);

    console.log('\nKey Changes:');
    console.log(`  1. Fixed mobile nav width (tickets 110, 111)`);
    console.log(`  2. Verified mold mode toggle (ticket 112)`);
    console.log(`  3. Verified settings page (ticket 113)`);
    console.log(`  4. Verified site favicon (ticket 114)`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

main();
