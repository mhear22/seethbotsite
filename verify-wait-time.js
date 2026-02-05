const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'backend', 'data', 'tickets.db');
const db = new Database(DB_PATH);

// Get completed tickets to verify the calculation
const completedTickets = db.prepare(`
  SELECT id, title,
         datetime(created_at) as created,
         datetime(updated_at) as updated,
         julianday(updated_at) - julianday(created_at) as hours
  FROM tickets
  WHERE status IN ('completed', 'complete')
  ORDER BY updated_at DESC
  LIMIT 10
`).all();

console.log('Last 10 completed tickets (for estimated wait time calculation):');
console.log('ID | Hours to Complete | Title');
console.log('---|------------------|------');
let totalHours = 0;
completedTickets.forEach(t => {
  totalHours += t.hours;
  console.log(`${t.id} | ${t.hours.toFixed(2)} | ${t.title}`);
});

const avgHours = totalHours / completedTickets.length;
const avgMinutes = Math.round(avgHours * 60);

console.log('\n--- Summary ---');
console.log(`Sample size: ${completedTickets.length}`);
console.log(`Average completion time: ${avgHours.toFixed(2)} hours (${avgMinutes} minutes)`);
console.log(`Estimated wait time for new tickets: ${avgMinutes} minutes`);

db.close();
