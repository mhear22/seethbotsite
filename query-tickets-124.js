const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = '/home/seethbotsite/backend/data/tickets.db';
const db = new Database(DB_PATH);

try {
  const tickets = db.prepare(`
    SELECT id, title, status, type, priority
    FROM tickets
    WHERE id >= 124
    ORDER BY id
  `).all();

  console.log('Tickets 124+:');
  console.log('Total:', tickets.length);
  console.log();
  tickets.forEach(t => {
    console.log(`  ${t.id}: ${t.title} [${t.type || 'N/A'}] [${t.priority || 'N/A'}] - Status: ${t.status}`);
  });

  // Also show all statuses
  const statusCounts = db.prepare(`
    SELECT status, COUNT(*) as count
    FROM tickets
    WHERE id >= 124
    GROUP BY status
  `).all();

  console.log();
  console.log('Status breakdown:');
  statusCounts.forEach(s => {
    console.log(`  ${s.status}: ${s.count}`);
  });
} catch (err) {
  console.error('Error:', err.message);
} finally {
  db.close();
}
