const Database = require('better-sqlite3');

const db = new Database('container-runtime-tickets.db');

// Tickets to mark as completed
const ticketsToComplete = [
  30,   // Ticket stats
  38,   // Shop
  62,   // Sign on/Auth
  66,   // Cats (change from needs-info to completed)
  69,   // Ticket relevance
  76,   // GPU mining
  77,   // Ticket processing
  82,   // Character tinder
  88,   // Chaos mode
  91,   // Joke ticket appeal
  92,   // Brand Icon Stylisation
  95,   // US vs AU english
  109   // Darker mode
];

console.log("Marking tickets as completed:");
console.log("=".repeat(80));

for (const id of ticketsToComplete) {
  const ticket = db.prepare('SELECT id, title, status FROM tickets WHERE id = ?').get(id);

  if (ticket) {
    if (ticket.status !== 'completed') {
      console.log(`Ticket ${id} ("${ticket.title}"): ${ticket.status} -> completed`);
      db.prepare('UPDATE tickets SET status = ? WHERE id = ?').run('completed', id);
    } else {
      console.log(`Ticket ${id}: Already completed`);
    }
  } else {
    console.log(`Ticket ${id}: NOT FOUND`);
  }
}

console.log("=".repeat(80));
console.log("Done!");

db.close();
