const Database = require('better-sqlite3');

const DB_PATH = '/home/seethbotsite/backend/data/tickets.db';
const db = new Database(DB_PATH);

try {
  const tickets = [
    { id: 142, title: 'PWA support' },
    { id: 143, title: 'Caching' },
    { id: 144, title: 'API rate limiting' },
    { id: 147, title: 'Dark mode themes' }
  ];

  console.log('Marking already-implemented tickets as complete...\n');

  for (const ticket of tickets) {
    const stmt = db.prepare(`
      UPDATE tickets
      SET status = 'completed', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    const result = stmt.run(ticket.id);
    if (result.changes > 0) {
      console.log(`✅ Ticket #${ticket.id} "${ticket.title}" marked as completed`);
    } else {
      console.log(`⚠️  Ticket #${ticket.id} not found`);
    }
  }

  console.log('\n✅ All tickets updated successfully');
} catch (err) {
  console.error('❌ Error:', err.message);
  process.exit(1);
} finally {
  db.close();
}
