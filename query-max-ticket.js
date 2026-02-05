const Database = require('better-sqlite3');

const DB_PATH = '/home/seethbotsite/backend/data/tickets.db';
const db = new Database(DB_PATH);

try {
  const maxId = db.prepare('SELECT MAX(id) as max_id FROM tickets').get();
  const count = db.prepare('SELECT COUNT(*) as count FROM tickets').get();

  console.log('Max ticket ID:', maxId.max_id);
  console.log('Total tickets:', count.count);

  // Show some recent tickets
  const recent = db.prepare(`
    SELECT id, title, status, type, priority
    FROM tickets
    ORDER BY id DESC
    LIMIT 20
  `).all();

  console.log();
  console.log('Most recent tickets:');
  recent.forEach(t => {
    console.log(`  ${t.id}: ${t.title} [${t.type || 'N/A'}] [${t.priority || 'N/A'}] - Status: ${t.status}`);
  });
} catch (err) {
  console.error('Error:', err.message);
} finally {
  db.close();
}
