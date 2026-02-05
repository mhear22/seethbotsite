const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'backend', 'data', 'tickets.db');
const db = new Database(dbPath);

// Update tickets 76 and 88 to completed
const tickets = [
  { id: 76, status: 'completed', response: 'Implemented GPU mining feature. Users can now mine for new stocks via the mining panel on the stock market page. Includes a 30-second simulated mining process with progress tracking.' },
  { id: 88, status: 'completed', response: 'Implemented chaos mode feature. Users can toggle chaos mode via the navigation bar. Includes random color changes, animations, and fun visual effects.' }
];

tickets.forEach(ticket => {
  const stmt = db.prepare(`
    UPDATE tickets
    SET status = ?, response = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  stmt.run(ticket.status, ticket.response, ticket.id);
  console.log(`Updated ticket ${ticket.id} to ${ticket.status}`);
});

// Verify updates
const updatedTickets = db.prepare(`SELECT id, title, status, updated_at FROM tickets WHERE id IN (76, 88)`).all();
console.log('\nUpdated tickets:');
console.log(JSON.stringify(updatedTickets, null, 2));

db.close();
