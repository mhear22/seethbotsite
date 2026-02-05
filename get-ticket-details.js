const Database = require('better-sqlite3');
const db = new Database('backend/data/tickets.db', { readonly: true });

const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?')
  .get(64);

console.log(JSON.stringify(ticket, null, 2));

db.close();
