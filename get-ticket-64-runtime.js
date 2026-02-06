const Database = require('better-sqlite3');
const db = new Database('container-runtime-tickets.db', { readonly: true });

const stmt = db.prepare(`
  SELECT id, title, description, status, priority, created_at, updated_at
  FROM tickets
  WHERE id = 64
`);

const ticket = stmt.get();
console.log(JSON.stringify(ticket, null, 2));

db.close();
