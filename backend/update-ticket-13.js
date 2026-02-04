const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data/tickets.db');
const db = new Database(DB_PATH);

// Update ticket 13 to complete status
db.prepare(`
  UPDATE tickets
  SET status = 'complete',
      response = 'Fixed mobile mode overlay issues for components (goose, feeds, tacho). Changes made:

1. Fixed Digital Goose Mobile Styles:
   - Changed z-index from 1000 to 95 (was blocking interactions)
   - Fixed broken mobile styles (wrong class name: .digital-goose-container → .digital-goose)
   - Made goose smaller on mobile (smaller container and font sizes)

2. Fixed Panel Overlap Issues:
   - Updated usePanels composable to prevent multiple bottom panels from being open simultaneously on mobile
   - Changed default panel state: cat panel now closed by default (was causing overlap with rankings)
   - Panel toggle logic now closes other bottom panels when one is opened on mobile

3. Z-Index Hierarchy (mobile):
   - Quote section: 50
   - Digital goose: 95 (lowered from 1000)
   - Tachometer: 100
   - Cat panel: 140
   - Rankings panel: 150
   - Mobile menu: 198
   - Nav bar: 200
   - Feed panel: 300
   - Feed toggle: 301

Files modified:
- frontend/composables/usePanels.ts - Added mobile-aware panel management
- frontend/styles.css - Fixed digital goose mobile styles

Result: Mobile navigation is now much easier with no component overlaps!'
  WHERE id = 13
`).run();

console.log('Updated ticket 13 to complete status');

const updatedTicket = db.prepare('SELECT id, title, status FROM tickets WHERE id = 13').get();
console.log('Updated ticket:', updatedTicket);

db.close();
