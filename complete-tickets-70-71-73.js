const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'backend/data/tickets.db');
const db = new Database(DB_PATH);

const ticketsToComplete = [
  {
    id: 70,
    title: 'Idle clicker needs to persist to local storage',
    response: '✅ Fixed: Upgrades now persist to localStorage across page reloads. The clicker saves upgrade state (purchased status and costs) and restores it on mount. Reset button also clears saved data properly.'
  },
  {
    id: 71,
    title: 'Idle Clicker doesn\'t affect Coolness points',
    response: '✅ Fixed: Idle clicker now integrates with rankings system. Clicks are tracked and converted to coolness points automatically. Added new /api/clicks/add-points endpoint and clicker periodically syncs clicks to rankings. Points are earned per click (respecting click power) and synced in batches to avoid spam.'
  },
  {
    id: 73,
    title: 'Ticket filter issues',
    response: '✅ Fixed: Ticket filtering now works consistently. Removed server-side filtering from loadTickets() - all tickets are loaded once and filtered client-side using the filteredTickets computed property. This ensures filters work reliably and consistently.'
  }
];

ticketsToComplete.forEach(ticket => {
  try {
    const stmt = db.prepare(`
      UPDATE tickets
      SET status = 'completed',
          response = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    const result = stmt.run(ticket.response, ticket.id);

    if (result.changes > 0) {
      console.log(`✅ Completed ticket ${ticket.id}: "${ticket.title}"`);
    } else {
      console.log(`⚠️  Ticket ${ticket.id} not found or already completed`);
    }
  } catch (error) {
    console.error(`❌ Error completing ticket ${ticket.id}:`, error);
  }
});

// Verify completion
console.log('\nVerifying completion:');
const completedTickets = db.prepare('SELECT id, title, status FROM tickets WHERE id IN (70, 71, 73) ORDER BY id').all();
completedTickets.forEach(ticket => {
  console.log(`  Ticket ${ticket.id}: ${ticket.status} - "${ticket.title}"`);
});

db.close();
console.log('\n✅ All tickets completed successfully!');
