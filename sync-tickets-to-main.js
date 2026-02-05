const Database = require('better-sqlite3');

const containerDbPath = '/home/seethbotsite/container-tickets.db';
const mainDbPath = '/home/seethbotsite/backend/data/tickets.db';

const containerDb = new Database(containerDbPath);
const mainDb = new Database(mainDbPath);

try {
  // Get all tickets from container DB that are > 113
  const tickets = containerDb.prepare(`
    SELECT * FROM tickets
    WHERE id > 113
    ORDER BY id
  `).all();

  console.log(`Found ${tickets.length} tickets in container DB (IDs > 113)`);
  console.log();

  // Check which ones already exist in main DB
  const existingIds = mainDb.prepare('SELECT id FROM tickets WHERE id > 113').all();
  const existingIdSet = new Set(existingIds.map(t => t.id));

  let inserted = 0;
  let skipped = 0;

  tickets.forEach(ticket => {
    if (existingIdSet.has(ticket.id)) {
      console.log(`⏭️  Skipping ticket #${ticket.id} (already exists)`);
      skipped++;
    } else {
      const stmt = mainDb.prepare(`
        INSERT INTO tickets (id, title, description, status, priority, type, creator_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
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
      console.log(`✅ Inserted ticket #${ticket.id}: ${ticket.title} [${ticket.type}] [${ticket.priority}]`);
      inserted++;
    }
  });

  console.log();
  console.log(`✅ Inserted: ${inserted} tickets`);
  console.log(`⏭️  Skipped: ${skipped} tickets`);
} catch (err) {
  console.error('❌ Error:', err.message);
  process.exit(1);
} finally {
  containerDb.close();
  mainDb.close();
}
