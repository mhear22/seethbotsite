const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'backend/data/tickets.db');
const db = new Database(DB_PATH);

// Tickets to complete with their implementation notes
const ticketsToComplete = [
  {
    id: 80,
    title: 'Gender page',
    implementation: 'GenderPage.vue already exists at /gender route (called "phrenology" in router)'
  },
  {
    id: 82,
    title: 'Fictional character tinder',
    implementation: 'CharacterTinderPage.vue already exists at /character-tinder route'
  },
  {
    id: 92,
    title: 'Brand Icon Stylisation',
    implementation: 'Brand icon rotation on scroll is already implemented in Router.vue with brandRotation ref and handleScroll function'
  }
];

let completedCount = 0;

ticketsToComplete.forEach(ticket => {
  const stmt = db.prepare(`
    UPDATE tickets
    SET status = 'complete',
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  const result = stmt.run(ticket.id);

  if (result.changes > 0) {
    console.log(`✅ Ticket ${ticket.id} completed: "${ticket.title}"`);
    console.log(`   ${ticket.implementation}`);
    completedCount++;
  } else {
    console.log(`⚠️  Ticket ${ticket.id} not found or already completed`);
  }
});

db.close();
console.log(`\n🎉 Completed ${completedCount} ticket(s)!`);
