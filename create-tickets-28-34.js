const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'backend/data/tickets.db');
const db = new Database(DB_PATH);

// Create tickets
const tickets = [
  {
    id: 28,
    title: 'Ticketing workflow',
    description: 'Implement the ticketing workflow for managing and tracking project tickets. This includes creating, viewing, updating, and closing tickets with proper status management.',
    type: 'feature',
    priority: 'medium'
  },
  {
    id: 29,
    title: 'Home page',
    description: 'Implement the home page with an overview of the site features, navigation links, and a welcome message for users.',
    type: 'feature',
    priority: 'medium'
  },
  {
    id: 30,
    title: 'Ticketing',
    description: 'Implement the ticketing system interface for users to submit and view tickets. This should include a form for creating tickets and a list view for browsing existing tickets.',
    type: 'feature',
    priority: 'medium'
  },
  {
    id: 31,
    title: 'Moldbot opinion page',
    description: 'Implement the Moldbot opinion page with a random opinion generator or curated opinions display.',
    type: 'feature',
    priority: 'medium'
  },
  {
    id: 32,
    title: 'Mold',
    description: 'Implement mold-related functionality. This could include mold tracking, mold information, or mold-related content.',
    type: 'feature',
    priority: 'medium'
  },
  {
    id: 33,
    title: 'Gender detector dark mode colour',
    description: 'Fix the dark mode colour scheme for the gender detector page. Ensure proper contrast and visibility in dark mode.',
    type: 'bug',
    priority: 'medium'
  },
  {
    id: 34,
    title: 'Only process one ticket at a time',
    description: 'Implement a mechanism to ensure only one ticket is processed at a time. This prevents concurrent ticket processing issues and ensures sequential ticket handling.',
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
