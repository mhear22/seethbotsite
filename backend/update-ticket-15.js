const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data/tickets.db');
const db = new Database(DB_PATH);

// Update ticket 15 to complete status
db.prepare(`
  UPDATE tickets
  SET status = 'complete',
      response = 'Fixed darkmode on the Tools page (Countdowns). Changes:
- Added useAppStore import to CountdownPage.vue to access darkMode state
- Added :class="{ dark: appStore.darkMode }" to root countdown-page div
- Updated styles to support dark mode:
  - countdown-page: Added dark variant with purple gradient background
  - countdown-card: Added dark variant with dark background
  - game-title: Added dark variant with light text color
  - game-description: Added dark variant with light text color
  - release-date: Added dark variant with lighter text color
  - countdown-display: Added dark variant with purple gradient
  - time-unit: Added dark variant with dark background
  - time-value: Added dark variant with light pink color
  - time-label: Added dark variant with light text color
  - footer-note: Added dark variant with dark background and light text
  - credit: Added dark variant with lighter text color
- Dark mode now properly applies to all CountdownPage elements
- About page already supported dark mode (no hardcoded backgrounds)'
  WHERE id = 15
`).run();

console.log('Updated ticket 15 to complete status');

const updatedTicket = db.prepare('SELECT id, title, status FROM tickets WHERE id = 15').get();
console.log('Updated ticket 15:', updatedTicket);

db.close();
