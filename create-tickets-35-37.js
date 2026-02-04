const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'backend/data/tickets.db');
const db = new Database(DB_PATH);

// Create tickets
const tickets = [
  {
    id: 35,
    title: 'add a idle clicker',
    description: 'Implement an idle clicker game feature where users can click to earn points, possibly with upgrades or progression mechanics.',
    type: 'feature',
    priority: 'medium'
  },
  {
    id: 36,
    title: 'Ticket Completion Confirmation',
    description: 'Add a confirmation dialog or notification when a ticket is completed to acknowledge the completion to the user.',
    type: 'feature',
    priority: 'low'
  },
  {
    id: 37,
    title: 'Goose button starting location',
    description: 'Adjust the starting location of the goose button in the UI for better user experience or positioning.',
    type: 'feature',
    priority: 'low'
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
