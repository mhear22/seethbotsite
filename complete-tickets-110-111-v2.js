const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'container-tickets.db');
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
    console.log('Updating tickets 110 and 111 to completed...\n');

    const response110 = "Fixed mobile navigation bar width issue. The nav bar no longer slowly gets wider on mobile. Changes made: 1) Removed overflow-x: auto and set overflow: hidden on .mobile-bottom-nav 2) Changed width: 100% to width: 100vw 3) Removed padding from container 4) Made nav items responsive with flex: 1 and min-width: 0 5) Reduced padding and font sizes to fit mobile viewport 6) Added text-overflow: ellipsis for long labels. Deployed to production.";

    updateTicket(110, 'completed', response110);

    const response111 = "Duplicate of ticket #110. Same fix applied - mobile navigation bar width issue resolved.";

    updateTicket(111, 'completed', response111);

    console.log('\n✅ All tickets updated successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

main();
