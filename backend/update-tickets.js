const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data/tickets.db');
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

db.close();
