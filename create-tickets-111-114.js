const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'container-tickets.db');
const db = new Database(dbPath);

const now = new Date().toISOString();

const tickets = [
  {
    id: 111,
    title: 'the nav bar on mobile slowly gets wider',
    description: 'Appears to be duplicate of ticket #110. Check and resolve together.',
    status: 'pending',
    priority: 'medium',
    type: 'frontend',
    creator_id: null,
    created_at: now,
    updated_at: now
  },
  {
    id: 112,
    title: 'Allow the mold mode to be toggled via a nav-control (next to goose)',
    description: 'Add a nav-control button next to the goose button that toggles mold mode on/off.',
    status: 'pending',
    priority: 'medium',
    type: 'frontend',
    creator_id: null,
    created_at: now,
    updated_at: now
  },
  {
    id: 113,
    title: 'Add a settings page',
    description: 'Create a settings page where users can configure site preferences.',
    status: 'pending',
    priority: 'medium',
    type: 'frontend',
    creator_id: null,
    created_at: now,
    updated_at: now
  },
  {
    id: 114,
    title: 'Site favicon',
    description: 'Add a favicon to the site that displays in browser tabs.',
    status: 'pending',
    priority: 'low',
    type: 'frontend',
    creator_id: null,
    created_at: now,
    updated_at: now
  }
];

const createTicket = (ticket) => {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO tickets (id, title, description, status, priority, type, creator_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    ticket.id,
    ticket.title,
    ticket.description,
    ticket.status,
    ticket.priority,
    ticket.type,
    ticket.creator_id,
    ticket.created_at,
    ticket.updated_at
  );
  console.log(`✅ Created ticket #${ticket.id}: ${ticket.title}`);
  return result;
};

async function main() {
  try {
    console.log('Creating tickets 111-114...\n');

    tickets.forEach(ticket => {
      createTicket(ticket);
    });

    console.log('\n✅ All tickets created successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

main();
