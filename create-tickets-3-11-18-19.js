const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'backend/data/tickets.db');
const db = new Database(DB_PATH);

// Create tickets
const tickets = [
  {
    id: 3,
    title: 'Dock the nav controls to the bottom centre of the screen',
    description: 'Move the navigation controls to the bottom centre of the screen, similar to a macOS dock style.',
    type: 'feature',
    priority: 'medium'
  },
  {
    id: 11,
    title: 'Another test ticket',
    description: 'This is a test ticket to verify the ticket system works correctly.',
    type: 'bug',
    priority: 'low'
  },
  {
    id: 18,
    title: 'The backend should use the OpenAPI spec, the frontend should use open-fetch to connect so models flow through',
    description: 'Implement OpenAPI specification on the backend and use open-fetch on the frontend for type-safe API calls. This ensures models (types) flow through from backend to frontend automatically.',
    type: 'feature',
    priority: 'high'
  },
  {
    id: 19,
    title: 'All of the fold outs should be saved to local storage, so if I turn off the goose, it should stay off',
    description: 'Save all fold-out panel states to localStorage so they persist across page refreshes. This includes the goose and other toggleable panels.',
    type: 'feature',
    priority: 'high'
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

// Show all tickets
const allTickets = db.prepare('SELECT * FROM tickets ORDER BY id').all();
console.log('\nAll tickets in database:');
allTickets.forEach(ticket => {
  console.log(`ID: ${ticket.id} - "${ticket.title}" - Status: ${ticket.status}`);
});

db.close();
console.log('\n✅ Tickets created successfully!');
