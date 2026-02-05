const Database = require('better-sqlite3');

const db = new Database('container-runtime-tickets.db', { readonly: true });

// The tickets I was assigned to work on
const assignedIds = [30, 38, 49, 62, 66, 69, 76, 77, 82, 88, 91, 92, 95, 109];

console.log("Ticket Details:");
console.log("=".repeat(80));

for (const id of assignedIds) {
  const ticket = db.prepare('SELECT id, title, description, status FROM tickets WHERE id = ?').get(id);

  if (ticket) {
    console.log(`\nID ${ticket.id}: "${ticket.title}"`);
    console.log(`Status: ${ticket.status}`);
    console.log(`Description: ${ticket.description}`);
  } else {
    console.log(`\nID ${id}: NOT FOUND`);
  }
}

db.close();
