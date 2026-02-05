const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'container-tickets.db');
const db = new Database(dbPath);

// Function to update a ticket status
const updateTicketStatus = (id, status, response = null) => {
  const stmt = db.prepare(`
    UPDATE tickets
    SET status = ?, response = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  const result = stmt.run(status, response, id);
  console.log(`✅ Updated ticket #${id} to "${status}"`);
  return result;
};

async function main() {
  try {
    console.log('Updating tickets 151, 152 to "complete"...\n');

    // Ticket 151: Ticket filter - Filter UI already exists with search box and status dropdown
    updateTicketStatus(151, 'complete',
      'Ticket filtering UI is already implemented with search box and status filter dropdown. Type and priority filters removed per ticket #65. Search functionality works with keyboard shortcut (/) to focus.');

    // Ticket 152: Ticket stat appearance is ugly - Fixed by adding proper CSS styles
    updateTicketStatus(152, 'complete',
      'Fixed ticket statistics appearance by adding proper CSS styles for ticket-stats-section, stat-card, stats-grid, status-breakdown, etc. Added dark mode support for better visibility.');

    console.log('\n✅ All tickets updated successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

main();
