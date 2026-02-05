const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'container-tickets.db');
const db = new Database(dbPath);

const now = new Date().toISOString();

const tickets = [
  {
    id: 122,
    title: 'Game stats/history',
    description: 'Implement game statistics tracking and history feature. Track user game performance, sessions, scores, and historical data.',
    status: 'pending',
    priority: 'high',
    type: 'feature',
    creator_id: null,
    created_at: now,
    updated_at: now
  },
  {
    id: 123,
    title: 'Leaderboards',
    description: 'Create a leaderboard system to display top scores and rankings across games.',
    status: 'pending',
    priority: 'medium',
    type: 'feature',
    creator_id: null,
    created_at: now,
    updated_at: now
  },
  {
    id: 124,
    title: 'Daily challenges',
    description: 'Implement daily challenge system for games to keep users engaged.',
    status: 'pending',
    priority: 'medium',
    type: 'feature',
    creator_id: null,
    created_at: now,
    updated_at: now
  },
  {
    id: 125,
    title: 'Achievement system',
    description: 'Create an achievement/badge system for game accomplishments.',
    status: 'pending',
    priority: 'medium',
    type: 'feature',
    creator_id: null,
    created_at: now,
    updated_at: now
  },
  {
    id: 126,
    title: 'Breadcrumb navigation',
    description: 'Add breadcrumb navigation to help users track their location in the app.',
    status: 'pending',
    priority: 'low',
    type: 'feature',
    creator_id: null,
    created_at: now,
    updated_at: now
  },
  {
    id: 127,
    title: 'Quick favorites',
    description: 'Allow users to quickly favorite and access frequently used features.',
    status: 'pending',
    priority: 'low',
    type: 'feature',
    creator_id: null,
    created_at: now,
    updated_at: now
  },
  {
    id: 128,
    title: 'Keyboard shortcuts',
    description: 'Implement keyboard shortcuts for common actions and navigation.',
    status: 'pending',
    priority: 'medium',
    type: 'feature',
    creator_id: null,
    created_at: now,
    updated_at: now
  },
  {
    id: 129,
    title: 'Swipe gestures',
    description: 'Add swipe gestures for mobile users to navigate between pages or sections.',
    status: 'pending',
    priority: 'low',
    type: 'feature',
    creator_id: null,
    created_at: now,
    updated_at: now
  },
  {
    id: 130,
    title: 'Sound effects',
    description: 'Add sound effects for interactions, achievements, and game actions.',
    status: 'pending',
    priority: 'low',
    type: 'feature',
    creator_id: null,
    created_at: now,
    updated_at: now
  },
  {
    id: 131,
    title: 'Theme customization',
    description: 'Allow users to customize the theme colors and appearance.',
    status: 'pending',
    priority: 'medium',
    type: 'feature',
    creator_id: null,
    created_at: now,
    updated_at: now
  },
  {
    id: 132,
    title: 'Data export',
    description: 'Implement data export functionality for users to download their data.',
    status: 'pending',
    priority: 'medium',
    type: 'feature',
    creator_id: null,
    created_at: now,
    updated_at: now
  },
  {
    id: 133,
    title: 'Account sync',
    description: 'Implement account synchronization across devices.',
    status: 'pending',
    priority: 'high',
    type: 'feature',
    creator_id: null,
    created_at: now,
    updated_at: now
  },
  {
    id: 134,
    title: 'User profiles',
    description: 'Create user profiles with customizable avatars and bio.',
    status: 'pending',
    priority: 'medium',
    type: 'feature',
    creator_id: null,
    created_at: now,
    updated_at: now
  },
  {
    id: 135,
    title: 'Activity feed',
    description: 'Add an activity feed to show recent actions and events.',
    status: 'pending',
    priority: 'medium',
    type: 'feature',
    creator_id: null,
    created_at: now,
    updated_at: now
  },
  {
    id: 136,
    title: 'Reaction system',
    description: 'Add emoji reaction system for content and messages.',
    status: 'pending',
    priority: 'low',
    type: 'feature',
    creator_id: null,
    created_at: now,
    updated_at: now
  },
  {
    id: 137,
    title: 'Direct messages',
    description: 'Implement direct messaging between users.',
    status: 'pending',
    priority: 'medium',
    type: 'feature',
    creator_id: null,
    created_at: now,
    updated_at: now
  },
  {
    id: 138,
    title: 'Analytics dashboard',
    description: 'Create an analytics dashboard to view usage statistics.',
    status: 'pending',
    priority: 'low',
    type: 'feature',
    creator_id: null,
    created_at: now,
    updated_at: now
  },
  {
    id: 139,
    title: 'Search',
    description: 'Implement search functionality across content and features.',
    status: 'pending',
    priority: 'high',
    type: 'feature',
    creator_id: null,
    created_at: now,
    updated_at: now
  },
  {
    id: 140,
    title: 'Tags/categories',
    description: 'Add tagging and categorization system for content.',
    status: 'pending',
    priority: 'medium',
    type: 'feature',
    creator_id: null,
    created_at: now,
    updated_at: now
  },
  {
    id: 141,
    title: 'Archive/history',
    description: 'Implement archive and history management for content.',
    status: 'pending',
    priority: 'low',
    type: 'feature',
    creator_id: null,
    created_at: now,
    updated_at: now
  },
  {
    id: 142,
    title: 'PWA support',
    description: 'Add Progressive Web App (PWA) support for offline use.',
    status: 'pending',
    priority: 'high',
    type: 'feature',
    creator_id: null,
    created_at: now,
    updated_at: now
  },
  {
    id: 143,
    title: 'Caching',
    description: 'Implement caching strategy for improved performance.',
    status: 'pending',
    priority: 'medium',
    type: 'feature',
    creator_id: null,
    created_at: now,
    updated_at: now
  },
  {
    id: 144,
    title: 'API rate limiting',
    description: 'Implement API rate limiting to prevent abuse.',
    status: 'pending',
    priority: 'medium',
    type: 'feature',
    creator_id: null,
    created_at: now,
    updated_at: now
  },
  {
    id: 145,
    title: 'Performance monitoring',
    description: 'Add performance monitoring and logging.',
    status: 'pending',
    priority: 'medium',
    type: 'feature',
    creator_id: null,
    created_at: now,
    updated_at: now
  },
  {
    id: 146,
    title: 'Animations',
    description: 'Add smooth animations and transitions throughout the app.',
    status: 'pending',
    priority: 'low',
    type: 'feature',
    creator_id: null,
    created_at: now,
    updated_at: now
  },
  {
    id: 147,
    title: 'Dark mode themes',
    description: 'Add multiple dark mode theme options.',
    status: 'pending',
    priority: 'low',
    type: 'feature',
    creator_id: null,
    created_at: now,
    updated_at: now
  },
  {
    id: 148,
    title: 'Accessibility',
    description: 'Improve accessibility features (screen reader, keyboard navigation, etc.).',
    status: 'pending',
    priority: 'medium',
    type: 'feature',
    creator_id: null,
    created_at: now,
    updated_at: now
  },
  {
    id: 149,
    title: 'Responsive images',
    description: 'Implement responsive image loading for better performance.',
    status: 'pending',
    priority: 'low',
    type: 'feature',
    creator_id: null,
    created_at: now,
    updated_at: now
  },
  {
    id: 150,
    title: 'Clicker game upgrade persistence broken',
    description: 'Fix bug where clicker game upgrades are not persisting correctly across sessions.',
    status: 'pending',
    priority: 'high',
    type: 'bug',
    creator_id: null,
    created_at: now,
    updated_at: now
  },
  {
    id: 151,
    title: 'Ticket filter',
    description: 'Add or improve ticket filtering functionality.',
    status: 'pending',
    priority: 'medium',
    type: 'feature',
    creator_id: null,
    created_at: now,
    updated_at: now
  },
  {
    id: 152,
    title: 'Ticket stat appearance is ugly',
    description: 'Improve the visual appearance of ticket statistics display.',
    status: 'pending',
    priority: 'low',
    type: 'bug',
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
    console.log('Creating tickets 122-152...\n');

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
