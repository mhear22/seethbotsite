const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = '/home/seethbotsite/backend/data/tickets.db';
const db = new Database(DB_PATH);

// Get table schema
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables:', tables);

if (tables.length > 0) {
  const tableName = tables[0].name;
  console.log(`\nSchema for ${tableName}:`);
  const schema = db.prepare(`PRAGMA table_info(${tableName})`).all();
  schema.forEach(col => {
    console.log(`  ${col.name}: ${col.type}`);
  });
}

db.close();
