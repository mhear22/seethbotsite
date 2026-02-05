const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'backend/data/tickets.db');
const db = new Database(DB_PATH);

// Create tickets
const tickets = [
  {
    id: 70,
    title: 'Idle clicker needs to persist to local storage',
    description: 'The idle clicker should save the state of purchased upgrades to local storage so that they persist across page reloads and sessions.',
    type: 'bug',
    priority: 'high'
  },
  {
    id: 71,
    title: 'Idle Clicker doesn\'t affect Coolness points',
    description: 'The idle clicker should integrate with the rankings/coolness points system so that clicking earns points in the rankings.',
    type: 'bug',
    priority: 'high'
  },
  {
    id: 73,
    title: 'Ticket filter issues',
    description: 'The ticket filtering is inconsistent - sometimes filters are applied on the server side, sometimes client-side. Fix to ensure consistent filtering behavior.',
    type: 'bug',
    priority: 'high'
  },
  {
    id: 94,
    title: 'Cat Page Broken',
    description: 'The cat page is not loading or displaying cat images correctly.',
    type: 'bug',
    priority: 'high'
  },
  {
    id: 96,
    title: 'Cat page has no header',
    description: 'The cat page is missing its header section or the header is not displaying properly.',
    type: 'bug',
    priority: 'medium'
  }
];

// Insert tickets if they don't exist
tickets.forEach(ticket => {
  try {
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO tickets (id, title, description, status, type, priority, created_at, updated_at)
      VALUES (?, ?, ?, 'pending', ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);
    stmt.run(ticket.id, ticket.title, ticket.description, ticket.type, ticket.priority);
    console.log(`Created ticket ${ticket.id}: "${ticket.title}"`);
  } catch (error) {
    console.log(`Ticket ${ticket.id} already exists, skipping creation`);
  }
});

// Show all pending tickets
const pendingTickets = db.prepare('SELECT * FROM tickets WHERE status = "pending" ORDER BY id').all();
console.log('\nPending tickets in database:');
pendingTickets.forEach(ticket => {
  console.log(`ID: ${ticket.id} - "${ticket.title}" - Type: ${ticket.type} - Priority: ${ticket.priority}`);
});

db.close();
console.log('\n✅ Tickets created successfully!');
