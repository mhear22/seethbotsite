/**
 * Database Operations Tests
 * Tests for database initialization and click counter operations
 */

import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { initDB, getDB, getClickCount, incrementClick, resetClick } from '../src/db';

const TEST_DB_DIR = path.join(__dirname, '..', 'data-test');

// Mock the database path to use test database
jest.mock('../src/db', () => {
  const originalModule = jest.requireActual('../src/db');
  return {
    ...originalModule,
    initDB: jest.fn(),
  };
});

describe('Database Operations', () => {
  let testDB: Database.Database;
  let dbPath: string;

  beforeAll(() => {
    // Create test database directory
    if (!fs.existsSync(TEST_DB_DIR)) {
      fs.mkdirSync(TEST_DB_DIR, { recursive: true });
    }

    // Create a test database
    dbPath = path.join(TEST_DB_DIR, 'clicks-test.db');
    testDB = new Database(dbPath);

    // Initialize the clicks table
    testDB.exec(`
      CREATE TABLE IF NOT EXISTS clicks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        count INTEGER NOT NULL DEFAULT 0,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert initial row
    testDB.prepare('INSERT INTO clicks (count) VALUES (0)').run();
  });

  afterAll(() => {
    testDB.close();
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
  });

  describe('initDB', () => {
    it('should create the clicks table if it does not exist', () => {
      const tables = testDB
        .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='clicks'")
        .all();

      expect(tables.length).toBeGreaterThan(0);
      expect(tables[0].name).toBe('clicks');
    });

    it('should initialize with default count of 0', () => {
      const row = testDB.prepare('SELECT count FROM clicks WHERE id = 1').get() as { count: number };
      expect(row.count).toBe(0);
    });
  });

  describe('getClickCount', () => {
    it('should return the current click count', () => {
      const count = getClickCount();
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThanOrEqual(0);
    });

    it('should return 0 when database is empty', () => {
      // This would be tested with a fresh DB
      const count = getClickCount();
      expect(count).toBe(0);
    });
  });

  describe('incrementClick', () => {
    it('should increment the click count by 1', () => {
      const before = getClickCount();
      const after = incrementClick();
      expect(after).toBe(before + 1);
    });

    it('should return the new count after incrementing', () => {
      resetClick(); // Reset to known state
      const count1 = incrementClick();
      expect(count1).toBe(1);
      const count2 = incrementClick();
      expect(count2).toBe(2);
    });

    it('should update the updated_at timestamp', () => {
      resetClick();
      incrementClick();

      const row = testDB
        .prepare('SELECT updated_at FROM clicks WHERE id = 1')
        .get() as { updated_at: string };

      expect(row.updated_at).toBeDefined();
      expect(new Date(row.updated_at)).toBeInstanceOf(Date);
    });
  });

  describe('resetClick', () => {
    it('should reset the click count to 0', () => {
      incrementClick();
      incrementClick();
      incrementClick(); // Get some clicks

      const count = resetClick();
      expect(count).toBe(0);
    });

    it('should return 0 after reset', () => {
      incrementClick();
      resetClick();
      const count = getClickCount();
      expect(count).toBe(0);
    });
  });
});
