const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'backend/data/tickets.db');
const db = new Database(dbPath);

const updateTicket = (ticketId, status, response) => {
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    UPDATE tickets
    SET status = ?, response = ?, updated_at = ?
    WHERE id = ?
  `);
  const result = stmt.run(status, response, now, ticketId);
  console.log(`✅ Ticket #${ticketId} updated to status: ${status}`);
  return result;
};

async function main() {
  try {
    console.log('Updating tickets 110, 111, 112, and 114 to completed...\n');

    const response110 = "Fixed mobile navigation bar width issue. Changed .mobile-bottom-nav from 'left: 0; right: 0;' to 'width: 100vw;' and added 'box-sizing: border-box;' to prevent the nav bar from slowly getting wider on mobile. This ensures the navigation bar always fills the viewport width properly without overflow.";

    updateTicket(110, 'completed', response110);

    const response111 = "Duplicate of ticket #110. Same fix applied - mobile navigation bar width issue resolved.";

    updateTicket(111, 'completed', response111);

    const response112 = "Already implemented. Mold mode can be toggled via nav-control (🦠) next to goose (🦆). The toggleMoldMode() function exists in useAppStore.ts and properly enables/disables mold spawning. When disabled, mold circles stop spawning and existing circles are cleared. Setting is persisted to localStorage.";

    updateTicket(112, 'completed', response112);

    const response114 = "Already implemented. Site favicon exists at frontend/public/favicon.svg (cherry blossom flower design) and is properly linked in frontend/index.html with: <link rel=\"icon\" type=\"image/svg+xml\" href=\"/favicon.svg\">";

    updateTicket(114, 'completed', response114);

    console.log('\n✅ All tickets updated successfully!');
    console.log('\nTicket #110: Mobile navigation bar width fix');
    console.log('Ticket #111: Duplicate of 110');
    console.log('Ticket #112: Mold mode toggle (already implemented)');
    console.log('Ticket #114: Site favicon (already implemented)');
    console.log('\nTicket #113: Settings page - ignored per instructions (joke ticket)');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

main();
