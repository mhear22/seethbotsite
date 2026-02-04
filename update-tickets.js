const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '../backend/data/tickets.db');
const db = new Database(DB_PATH);

// Update joke tickets
db.prepare(`
  UPDATE tickets
  SET status = 'declined', response = 'Joke ticket - will not be implemented'
  WHERE id IN (2, 4)
`).run();

console.log('Updated tickets 2 and 4 to declined status');

const updatedTickets = db.prepare('SELECT id, title, status, response FROM tickets WHERE id IN (2, 4)').all();
console.log('Updated tickets:', updatedTickets);

// Update ticket 12 to complete status
db.prepare(`
  UPDATE tickets
  SET status = 'complete',
      response = 'Implemented standardized modal container system. Changes:
- Created ModalContainer.vue: Reusable dock component for modals with hide/show functionality
- Created FeedContent.vue: Simplified feed panel content for modal container
- Created TachometerContent.vue: Simplified tachometer (Mold Meter) with fart button for modal container
- Updated MainApp.vue: Uses ModalContainer for Feed (right dock) and Tachometer (left dock)
- Updated Router.vue: Added tachometer toggle button (🍄) to control buttons
- Updated usePanels.ts: Added tachometer panel state
- Modals now dock to screen edges and dont extend beyond boundaries
- Goose button remains independent as required
- Rankings and Cat panels remain in original bottom-left positions'
  WHERE id = 12
`).run();

console.log('Updated ticket 12 to complete status');

const updatedTicket12 = db.prepare('SELECT id, title, status FROM tickets WHERE id = 12').get();
console.log('Updated ticket 12:', updatedTicket12);

db.close();
