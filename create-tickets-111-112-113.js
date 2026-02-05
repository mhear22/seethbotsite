const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'backend/data/tickets.db');
const db = new Database(dbPath);

const createTicket = (id, title, description, creatorId) => {
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO tickets (id, title, description, status, creator_id, created_at, updated_at)
    VALUES (?, ?, ?, 'pending', ?, ?, ?)
  `);
  const result = stmt.run(id, title, description, creatorId, now, now);
  console.log(`✅ Ticket #${id} created`);
  return result;
};

async function main() {
  try {
    console.log('Creating tickets 111, 112, and 113 in backend database...\n');

    // Ticket 111 (duplicate of 110)
    createTicket(
      111,
      'the nav bar on mobile slowly gets wider',
      'Duplicate of ticket #110. Same fix applied - mobile navigation bar width issue resolved.',
      null
    );

    // Ticket 112
    createTicket(
      112,
      'Allow the mold mode to be toggled via a nav-control (next to goose)',
      'Its nice but it lags my pc from time to time',
      'user_027h2oc2qskx2sioegni63a'
    );

    // Ticket 113
    createTicket(
      113,
      'Add a settings page',
      'Allow things to be configured such as the heart total count, mold growth/speed and other settings. Update the components to use these values and push them all to local storage',
      'user_027h2oc2qskx2sioegni63a'
    );

    console.log('\n✅ All tickets created successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

main();
