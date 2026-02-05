const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'backend/data/tickets.db');
const db = new Database(DB_PATH);

// Update ticket 58 to complete
const result58 = db.prepare('UPDATE tickets SET status = ? WHERE id = ?').run('complete', 58);

// Update ticket 61 to complete
const result61 = db.prepare('UPDATE tickets SET status = ? WHERE id = ?').run('complete', 61);

if (result58.changes > 0) {
  console.log(`✅ Ticket 58 marked as complete!`);
  console.log(`   Feature: Moldbot opinion page with generator`);
  console.log(`   Status: Already fully implemented`);
}

if (result61.changes > 0) {
  console.log(`✅ Ticket 61 marked as complete!`);
  console.log(`   Feature: Enhanced mold bot opinions`);
  console.log(`   Status: Already fully implemented`);
}

if (result58.changes === 0 && result61.changes === 0) {
  console.log(`❌ Failed to update tickets`);
}

db.close();
