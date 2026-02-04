const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'backend/data/tickets.db');
const db = new Database(DB_PATH);

// Mark tickets as complete
const ticketsToComplete = [28, 30, 34];

ticketsToComplete.forEach(ticketId => {
  try {
    const stmt = db.prepare(`
      UPDATE tickets
      SET status = 'completed', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(ticketId);
    console.log(`✅ Marked ticket ${ticketId} as complete`);
  } catch (error) {
    console.log(`❌ Error marking ticket ${ticketId}: ${error.message}`);
  }
});

// Show updated tickets
const updatedTickets = db.prepare('SELECT * FROM tickets WHERE id IN (28, 30, 34) ORDER BY id').all();
console.log('\nUpdated tickets:');
updatedTickets.forEach(ticket => {
  console.log(`ID: ${ticket.id} - "${ticket.title}" - Status: ${ticket.status}`);
});

db.close();
console.log('\n✅ Tickets updated successfully!');
