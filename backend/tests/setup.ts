/**
 * Test setup file for Jest
 * Initializes test databases and provides test utilities
 */

import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

// Set test environment
process.env.NODE_ENV = 'test';
process.env.PORT = '3002'; // Use different port for tests

// Create test data directory
const TEST_DATA_DIR = path.join(__dirname, '..', 'data-test');

export const setupTestDB = () => {
  // Ensure test data directory exists
  if (!fs.existsSync(TEST_DATA_DIR)) {
    fs.mkdirSync(TEST_DATA_DIR, { recursive: true });
  }

  // Clean up old test databases
  const testDBs = ['clicks.db', 'tickets.db', 'stocks.db', 'dev.db'];
  testDBs.forEach(dbName => {
    const dbPath = path.join(TEST_DATA_DIR, dbName);
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
  });

  // Apply Prisma schema to test database
  const dbPath = path.join(TEST_DATA_DIR, 'dev.db');
  const db = new Database(dbPath);

  // Read and execute the migration SQL
  const migrationDir = path.join(__dirname, '..', 'prisma', 'migrations', '20260211034657_init');
  const migrationSQL = fs.readFileSync(path.join(migrationDir, 'migration.sql'), 'utf8');

  db.exec(migrationSQL);
  db.close();

  return TEST_DATA_DIR;
};

export const cleanupTestDB = () => {
  if (fs.existsSync(TEST_DATA_DIR)) {
    const files = fs.readdirSync(TEST_DATA_DIR);
    files.forEach(file => {
      fs.unlinkSync(path.join(TEST_DATA_DIR, file));
    });
  }
};

// Setup before all tests
beforeAll(() => {
  setupTestDB();
});

// Cleanup after all tests
afterAll(() => {
  cleanupTestDB();
});
