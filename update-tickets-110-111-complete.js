const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'container-tickets.db');
const db = new sqlite3.Database(dbPath);

const updateTicket = (ticketId) => {
  return new Promise((resolve, reject) => {
    const now = new Date().toISOString();
    
    db.run(
      `UPDATE tickets SET status = ?, updatedAt = ? WHERE id = ?`,
      ['complete', now, ticketId],
      function(err) {
        if (err) {
          reject(err);
        } else {
          console.log(`✅ Ticket #${ticketId} updated to status: complete`);
          resolve(this.changes);
        }
      }
    );
  });
};

async function main() {
  try {
    console.log('Updating tickets 110 and 111 to complete...');
    
    await updateTicket(110);
    await updateTicket(111);
    
    console.log('\n✅ All tickets updated successfully!');
    console.log('\nFixed issue: Mobile navigation bar width expansion');
    console.log('Changes made:');
    console.log('  - Removed overflow-x: auto from .mobile-bottom-nav');
    console.log('  - Changed width: 100% to width: 100vw with overflow: hidden');
    console.log('  - Removed padding from .mobile-bottom-nav container');
    console.log('  - Adjusted .mobile-nav-item to use flex: 1 instead of min-width');
    console.log('  - Reduced padding and font sizes to fit mobile viewport');
    console.log('  - Added text-overflow: ellipsis for long labels');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

main();
