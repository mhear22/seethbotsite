const Database = require('better-sqlite3');
const db = new Database('container-tickets.db', { readonly: true });

const stmt = db.prepare(`
  SELECT id, title, description, status, priority, created_at, updated_at
  FROM tickets
  WHERE status IN ('pending', 'needs-info')
  AND id >= 150
  ORDER BY id
`);

const tickets = stmt.all();
console.log(JSON.stringify(tickets, null, 2));

db.close();
