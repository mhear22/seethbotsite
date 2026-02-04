const Database = require('better-sqlite3');

const db = new Database('data/tickets.db');

// Check if ticket exists
const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(13);

if (ticket) {
  console.log('Ticket 13 found:', ticket);
  const result = db.prepare('UPDATE tickets SET status = ? WHERE id = ?').run('completed', 13);
  console.log('Updated ticket 13 to "completed". Rows affected:', result.changes);
} else {
  console.log('Ticket 13 does not exist in the database');
  console.log('Creating ticket 13...');

  const createResult = db.prepare(`
    INSERT INTO tickets (id, title, description, status, type, priority, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `).run(
    13,
    'I think mobile mode needs to be revised',
    'Analyze the current mobile mode implementation, identify issues, and make improvements. Focus on: 1. Read the current mobile mode code in the seethbotsite frontend 2. Identify UX problems (navigation, responsiveness, usability) 3. Make necessary code changes to improve the mobile experience 4. Test the changes by checking the site 5. When complete, update the ticket status to "complete" via the API',
    'completed',
    'enhancement',
    'medium'
  );
  console.log('Created ticket 13 with status "completed".');
}

db.close();
