const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'backend/data/tickets.db');
const db = new Database(DB_PATH);

// Create tickets
const tickets = [
  {
    id: 38,
    title: 'Add a shop that lets you buy things with your coolness points',
    description: 'Implement a shop system where users can spend their coolness points to purchase items or upgrades.',
    type: 'feature',
    priority: 'medium'
  },
  {
    id: 39,
    title: 'Readability of about page in dark mode',
    description: 'Fix the readability issues on the about page when in dark mode. Ensure text has proper contrast and visibility.',
    type: 'bug',
    priority: 'medium'
  },
  {
    id: 40,
    title: 'Goose Emoji',
    description: 'Add or fix the goose emoji in the UI.',
    type: 'feature',
    priority: 'low'
  },
  {
    id: 41,
    title: 'Goose button appearance',
    description: 'Improve the appearance of the goose button for better visual design and user experience.',
    type: 'feature',
    priority: 'low'
  },
  {
    id: 42,
    title: 'Ticket page ease of use',
    description: 'Improve the user experience of the ticket page to make it more intuitive and easier to use.',
    type: 'feature',
    priority: 'medium'
  },
  {
    id: 44,
    title: 'Countdowns',
    description: 'Implement a countdown feature where users can create and track countdowns to specific dates or events.',
    type: 'feature',
    priority: 'medium'
  },
  {
    id: 45,
    title: 'Implement PlaceKeanu api',
    description: 'Integrate the PlaceKeanu API to display Keanu Reeves images in various locations.',
    type: 'feature',
    priority: 'low'
  },
  {
    id: 46,
    title: 'Clock page daylight indicator',
    description: 'Add a daylight indicator to the clock page to show whether it is day or night in different time zones.',
    type: 'feature',
    priority: 'medium'
  },
  {
    id: 49,
    title: 'Make a word cloud section',
    description: 'Create a word cloud visualization section that displays frequently used words or topics.',
    type: 'feature',
    priority: 'low'
  },
  {
    id: 50,
    title: 'Make Ctrl+Enter submit tickets',
    description: 'Add keyboard shortcut support so that Ctrl+Enter submits the ticket form instead of requiring a button click.',
    type: 'feature',
    priority: 'medium'
  },
  {
    id: 51,
    title: 'API docs',
    description: 'Document the API endpoints for developers and integrations.',
    type: 'feature',
    priority: 'high'
  },
  {
    id: 52,
    title: 'add advice to quotes',
    description: 'Add advice or wisdom content to the quotes feature.',
    type: 'feature',
    priority: 'low'
  },
  {
    id: 53,
    title: 'Fart button',
    description: 'Add a fart button that plays fart sounds when clicked.',
    type: 'feature',
    priority: 'low'
  },
  {
    id: 54,
    title: 'Make coolness rankings decay with time',
    description: 'Implement a decay mechanism for coolness rankings so they decrease over time, encouraging continued activity.',
    type: 'feature',
    priority: 'medium'
  },
  {
    id: 56,
    title: 'Build time indicator',
    description: 'Add a build time indicator to show when the application was last built or deployed.',
    type: 'feature',
    priority: 'low'
  },
  {
    id: 57,
    title: 'Patch notes',
    description: 'Create a patch notes section to document changes and updates made to the application.',
    type: 'feature',
    priority: 'medium'
  },
  {
    id: 58,
    title: 'Mold bot opinions',
    description: 'Implement mold bot opinions feature.',
    type: 'feature',
    priority: 'medium'
  },
  {
    id: 59,
    title: 'create ticket modal submit ticket button doesn\'t work',
    description: 'Fix the issue where the submit ticket button in the create ticket modal is not functioning correctly.',
    type: 'bug',
    priority: 'high'
  },
  {
    id: 60,
    title: 'app-footer is redundant',
    description: 'Remove or restructure the redundant app-footer component to reduce duplication.',
    type: 'feature',
    priority: 'low'
  },
  {
    id: 61,
    title: 'Mold bot opinions plus!',
    description: 'Enhanced mold bot opinions feature with additional functionality.',
    type: 'feature',
    priority: 'medium'
  },
  {
    id: 62,
    title: 'Add sign on',
    description: 'Implement a sign on/login feature for user authentication.',
    type: 'feature',
    priority: 'high'
  },
  {
    id: 63,
    title: 'Timestamps',
    description: 'Add timestamps to relevant features or entries throughout the application.',
    type: 'feature',
    priority: 'medium'
  },
  {
    id: 64,
    title: 'Discord',
    description: 'Integrate Discord functionality or bot features.',
    type: 'feature',
    priority: 'medium'
  },
  {
    id: 65,
    title: 'Remove Type and Priority of tickets',
    description: 'Remove the Type and Priority fields from the ticket system as they are no longer needed.',
    type: 'feature',
    priority: 'low'
  },
  {
    id: 66,
    title: 'The random cats isnt working',
    description: 'Fix the issue with the random cats feature not functioning properly.',
    type: 'bug',
    priority: 'high'
  },
  {
    id: 67,
    title: 'I should be able to submit descriptionless tickets',
    description: 'Allow users to submit tickets without requiring a description field.',
    type: 'feature',
    priority: 'medium'
  },
  {
    id: 68,
    title: 'Cat page is not centred',
    description: 'Fix the centering issue on the cat page so content is properly aligned.',
    type: 'bug',
    priority: 'low'
  },
  {
    id: 69,
    title: 'Use time of ticket to determine if it\'s relevant',
    description: 'Implement logic to use the ticket creation time to determine relevance or priority.',
    type: 'feature',
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
