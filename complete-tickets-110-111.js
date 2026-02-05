const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'container-tickets.db');
const db = new Database(dbPath);

const now = new Date().toISOString();

const stmt110 = db.prepare('UPDATE tickets SET status = ?, updated_at = ? WHERE id = ?');
const stmt111 = db.prepare('UPDATE tickets SET status = ?, updated_at = ? WHERE id = ?');

try {
  console.log('Updating tickets 110 and 111 to complete...');
  
  stmt110.run('complete', now, 110);
  console.log('✅ Ticket #110 updated to status: complete');
  
  stmt111.run('complete', now, 111);
  console.log('✅ Ticket #111 updated to status: complete');
  
  console.log('\n✅ All tickets updated successfully!');
  console.log('\nFixed issue: Mobile navigation bar width expansion');
  console.log('Changes made:');
  console.log('  - Removed overflow-x: auto from .mobile-bottom-nav');
  console.log('  - Changed width: 100% to width: 100vw with overflow: hidden');
  console.log('  - Removed padding from .mobile-bottom-nav container');
  console.log('  - Adjusted .mobile-nav-item to use flex: 1 instead of min-width');
  console.log('  - Reduced padding and font sizes to fit mobile viewport');
  console.log('  - Added text-overflow: ellipsis for long labels');
  
  db.close();
} catch (error) {
  console.error('❌ Error:', error);
  db.close();
  process.exit(1);
}
