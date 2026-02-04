const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '../backend/data/tickets.db');
const db = new Database(DB_PATH);

// Update ticket 8 to complete status - Brand text change
db.prepare(`
  UPDATE tickets
  SET status = 'complete',
      response = 'Changed brand text from "SeethBot" to "Mold" in the top left of the UI.
- Updated Router.vue line 71: Changed brand-text span from "SeethBot" to "Mold"'
  WHERE id = 8
`).run();

console.log('Updated ticket 8 to complete status');

const updatedTicket8 = db.prepare('SELECT id, title, status FROM tickets WHERE id = 8').get();
console.log('Updated ticket 8:', updatedTicket8);

// Update ticket 3 to complete status - Nav controls dock
db.prepare(`
  UPDATE tickets
  SET status = 'complete',
      response = 'Docked the nav controls to the bottom centre of the screen like MacOS dock, visible above all elements including goose button.
- Removed margin-top: 70px from nav-controls div in Router.vue
- Updated styles.css .nav-controls: Added fixed positioning at bottom: 20px, centered with transform, MacOS dock glassmorphism styling, backdrop-filter blur, rounded corners, box-shadow, z-index: 1001 (above goose at 1000)
- Enhanced .control-btn hover effects: Increased scale from 1.05 to 1.3, added translateY(-5px), improved cubic-bezier easing for smoother transitions
- Added .control-btn.active state: Same scale/translate as hover for consistency
- Added dark mode variants for dock styling'
  WHERE id = 3
`).run();

console.log('Updated ticket 3 to complete status');

const updatedTicket3 = db.prepare('SELECT id, title, status FROM tickets WHERE id = 3').get();
console.log('Updated ticket 3:', updatedTicket3);

// Update ticket 9 to complete status - Goose movement
db.prepare(`
  UPDATE tickets
  SET status = 'complete',
      response = 'Made the goose button move to a different part of the screen when clicked with smooth animation, fully visible within viewport.
- Updated DigitalGoose.vue script: Added goosePosition reactive ref for x/y coordinates, added moveGoose() function that calculates safe boundaries (20px margin from edges), generates random positions within viewport bounds, uses estimated goose dimensions (250px width, 150px height)
- Updated honk() function: Calls moveGoose() before other actions
- Updated template: Changed digital-goose div to use dynamic :style binding with left/top positioning from goosePosition
- Updated styles: Changed .digital-goose from fixed bottom/right to dynamic left/top with smooth transitions (0.6s cubic-bezier), changed migrate animation from translate keyframes to shake keyframes for visual effect
- Goose now smoothly animates to new random positions on click while staying fully visible within viewport'
  WHERE id = 9
`).run();

console.log('Updated ticket 9 to complete status');

const updatedTicket9 = db.prepare('SELECT id, title, status FROM tickets WHERE id = 9').get();
console.log('Updated ticket 9:', updatedTicket9);

db.close();

console.log('\nAll tickets updated successfully!');
console.log('Summary:');
console.log('- Ticket 8: Brand text changed to "Mold" - COMPLETE');
console.log('- Ticket 3: Nav controls docked to bottom centre - COMPLETE');
console.log('- Ticket 9: Goose button moves on click - COMPLETE');