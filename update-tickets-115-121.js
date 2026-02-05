const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'container-tickets.db');
const db = new Database(dbPath);

const now = new Date().toISOString();

// Update tickets
const updates = [
  { id: 115, status: 'complete', description: 'Settings page already exists and is fully functional with hearts, mold, and various site configuration options.' },
  { id: 117, status: 'complete', description: 'Fishing game already exists and is fully functional with 3D graphics, multiple fish types, and scoring system.' },
  { id: 118, status: 'declined', description: 'Ticket appears to be a joke or non-serious request. No meaningful implementation provided.' },
  { id: 119, status: 'declined', description: 'Ticket appears to be a joke or non-serious request. No meaningful implementation provided.' },
  { id: 121, status: 'complete', description: 'Created CarPage.vue - a car-sized display page with speedometer, fuel gauge, weather, time, and large touch-friendly buttons suitable for in-car displays. Added route at /car.' }
];

const updateTicket = (ticket) => {
  const stmt = db.prepare(`
    UPDATE tickets
    SET status = ?, description = ?, updated_at = ?
    WHERE id = ?
  `);
  const result = stmt.run(ticket.status, ticket.description, now, ticket.id);
  console.log(`✅ Updated ticket #${ticket.id}: ${ticket.status}`);
  return result;
};

async function main() {
  try {
    console.log('Updating tickets 115, 117, 118, 119, 121...\n');

    updates.forEach(ticket => {
      updateTicket(ticket);
    });

    console.log('\n✅ All tickets updated successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

main();
