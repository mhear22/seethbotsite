const Database = require('better-sqlite3');
const db = new Database('container-tickets.db', { readonly: true });

const allTickets = db.prepare('SELECT id, title, status FROM tickets ORDER BY id')
  .all();

console.log(JSON.stringify(allTickets, null, 2));

db.close();
