const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'backend/data/tickets.db');
const db = new Database(DB_PATH);

// Create tickets that were mentioned as pending but don't exist
const tickets = [
  {
    id: 76,
    title: 'Allow GPU mining to gain new stocks',
    description: 'Implement a GPU mining feature that allows users to mine for new stocks using their browser or available computing resources. This could be a gamified feature where users "mine" to unlock rare stocks or special stock types.',
    type: 'feature',
    priority: 'medium'
  },
  {
    id: 77,
    title: 'Tickets are being processed too slowly',
    description: 'The ticket processing workflow is slower than expected. Investigate the bottlenecks in the ticket creation, update, and completion processes. Consider adding async processing, better indexing, or caching to improve performance.',
    type: 'bug',
    priority: 'medium'
  },
  {
    id: 80,
    title: 'Gender page',
    description: 'Create a gender detection or classification page. This could be a fun feature where users can test a gender detector, or it could be related to the existing phrenology/gender page with improvements.',
    type: 'feature',
    priority: 'medium'
  },
  {
    id: 82,
    title: 'Fictional character tinder',
    description: 'Create a tinder-like swipe interface for fictional characters. Users can swipe left/right on characters to indicate preference, and the system keeps track of matches and preferences. This is an extension of the existing Character Tinder feature.',
    type: 'feature',
    priority: 'low'
  },
  {
    id: 88,
    title: 'Chaos mode',
    description: 'Implement a chaos mode feature that introduces random, unpredictable elements to the site. This could include: random color changes, gravity effects, particles, surprise popups, or other chaotic but fun interactions. Could be toggled on/off.',
    type: 'feature',
    priority: 'low'
  },
  {
    id: 91,
    title: 'Joke ticket appeal',
    description: 'Create a mechanism to appeal joke tickets that were closed. Users should be able to explain why a joke ticket should be taken seriously or reopened, with a review process for the appeals.',
    type: 'feature',
    priority: 'low'
  },
  {
    id: 92,
    title: 'Brand Icon Stylisation',
    description: 'Add more stylization options for the brand icon (the flower 🌸). This could include: rotation on scroll (implemented), hover effects, click animations, particle effects, or customizable styling options.',
    type: 'feature',
    priority: 'low'
  },
  {
    id: 95,
    title: 'US vs AU english',
    description: 'Implement a feature to switch between US and Australian English spelling and terminology throughout the site. This could include: colour/color, centre/center, favourite/favorite, and other regional differences. Could be a user preference setting.',
    type: 'feature',
    priority: 'low'
  },
  {
    id: 109,
    title: 'Darker mode',
    description: 'Implement an even darker mode beyond the current dark mode. This could be an "ultra dark" or "midnight" theme with extremely dark backgrounds and high-contrast text for users who prefer a darker aesthetic.',
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
    console.log(`✅ Created ticket ${ticket.id}: "${ticket.title}"`);
  } catch (error) {
    console.log(`⚠️  Ticket ${ticket.id} already exists or error:`, error.message);
  }
});

// Show all pending tickets
const pendingTickets = db.prepare("SELECT * FROM tickets WHERE status = 'pending' ORDER BY id").all();
console.log(`\n📋 Pending tickets in database: ${pendingTickets.length}`);
pendingTickets.forEach(ticket => {
  console.log(`   ID ${ticket.id}: "${ticket.title}" - Type: ${ticket.type} - Priority: ${ticket.priority}`);
});

db.close();
console.log('\n✅ Tickets created successfully!');
