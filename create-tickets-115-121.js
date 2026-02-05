const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'container-tickets.db');
const db = new Database(dbPath);

const now = new Date().toISOString();

const tickets = [
  {
    id: 115,
    title: 'Settings',
    description: 'Settings functionality needs to be implemented or updated.',
    status: 'pending',
    priority: 'medium',
    type: 'frontend',
    creator_id: null,
    created_at: now,
    updated_at: now
  },
  {
    id: 117,
    title: 'Fishing game',
    description: 'Implement or improve the fishing game feature.',
    status: 'pending',
    priority: 'medium',
    type: 'frontend',
    creator_id: null,
    created_at: now,
    updated_at: now
  },
  {
    id: 118,
    title: 'bunny',
    description: 'Add or implement bunny-related features or content.',
    status: 'pending',
    priority: 'low',
    type: 'frontend',
    creator_id: null,
    created_at: now,
    updated_at: now
  },
  {
    id: 119,
    title: 'orange juice',
    description: 'Add or implement orange juice-related features or content.',
    status: 'pending',
    priority: 'low',
    type: 'frontend',
    creator_id: null,
    created_at: now,
    updated_at: now
  },
  {
    id: 121,
    title: 'Add a embeded car sized page to a new tab',
    description: 'Create a new tab that displays an embedded car-sized page or content.',
    status: 'pending',
    priority: 'medium',
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
    console.log('Creating tickets 115, 117, 118, 119, 121...\n');

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
