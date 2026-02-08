/**
 * Tickets DB Helper Tests
 * Tests for dependency parsing and blocking logic
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { parseDependencies, isTicketBlocked } from '../src/services/tickets-db';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

describe('parseDependencies', () => {
  it('should parse single dependency with # symbol', () => {
    const result = parseDependencies('This depends on #123');
    expect(result).toEqual([123]);
  });

  it('should parse single dependency without # symbol', () => {
    const result = parseDependencies('This depends on 123');
    expect(result).toEqual([123]);
  });

  it('should parse multiple dependencies separated by "and"', () => {
    const result = parseDependencies('This depends on #123 and #124');
    expect(result).toEqual([123, 124]);
  });

  it('should parse multiple dependencies separated by commas', () => {
    const result = parseDependencies('This requires 123, 124, and 125');
    expect(result).toEqual([123, 124, 125]);
  });

  it('should parse dependencies from "requires" phrase', () => {
    const result = parseDependencies('This requires #123');
    expect(result).toEqual([123]);
  });

  it('should parse dependencies from "blocked by" phrase', () => {
    const result = parseDependencies('Blocked by #123');
    expect(result).toEqual([123]);
  });

  it('should handle mixed formats', () => {
    const result = parseDependencies('This depends on #123, 124 and #125');
    expect(result).toEqual([123, 124, 125]);
  });

  it('should return empty array for null description', () => {
    const result = parseDependencies(null);
    expect(result).toEqual([]);
  });

  it('should return empty array for empty description', () => {
    const result = parseDependencies('');
    expect(result).toEqual([]);
  });

  it('should return empty array when no dependencies found', () => {
    const result = parseDependencies('This is just a normal description without dependencies');
    expect(result).toEqual([]);
  });

  it('should handle multiple dependency phrases in same description', () => {
    const result = parseDependencies('This depends on #123 and also requires #124');
    expect(result).toEqual([123, 124]);
  });

  it('should not duplicate dependencies', () => {
    const result = parseDependencies('This depends on #123, #123, and #124');
    expect(result).toEqual([123, 124]);
  });

  it('should stop at sentence boundary', () => {
    const result = parseDependencies('This depends on #123. Also #124 should be ignored');
    expect(result).toEqual([123]);
  });

  it('should stop at line boundary', () => {
    const result = parseDependencies('This depends on #123\nAnd #124 is on next line');
    expect(result).toEqual([123]);
  });
});

describe('isTicketBlocked', () => {
  let db: Database.Database;
  let testDataDir: string;

  beforeEach(() => {
    // Create temporary test database
    testDataDir = path.join(__dirname, '..', 'data-test-tickets-db-' + Date.now());
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
    }

    const testDbPath = path.join(testDataDir, 'test.db');
    db = new Database(testDbPath);

    // Create tickets table
    db.exec(`
      CREATE TABLE tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        status TEXT NOT NULL,
        is_deleted INTEGER DEFAULT 0
      )
    `);

    // Insert some test tickets
    db.prepare('INSERT INTO tickets (id, status, is_deleted) VALUES (?, ?, ?)').run(100, 'completed', 0);
    db.prepare('INSERT INTO tickets (id, status, is_deleted) VALUES (?, ?, ?)').run(101, 'declined', 0);
    db.prepare('INSERT INTO tickets (id, status, is_deleted) VALUES (?, ?, ?)').run(102, 'pending', 0);
    db.prepare('INSERT INTO tickets (id, status, is_deleted) VALUES (?, ?, ?)').run(103, 'needs-info', 0);
    db.prepare('INSERT INTO tickets (id, status, is_deleted) VALUES (?, ?, ?)').run(104, 'unresolved', 0);
    db.prepare('INSERT INTO tickets (id, status, is_deleted) VALUES (?, ?, ?)').run(105, 'completed', 1); // Deleted
  });

  afterEach(() => {
    // Clean up test database
    if (db) {
      db.close();
    }
    if (testDataDir && fs.existsSync(testDataDir)) {
      const testDbPath = path.join(testDataDir, 'test.db');
      if (fs.existsSync(testDbPath)) {
        fs.unlinkSync(testDbPath);
      }
      fs.rmdirSync(testDataDir);
    }
  });

  it('should return false for empty dependencies', () => {
    const result = isTicketBlocked(db, []);
    expect(result).toBe(false);
  });

  it('should return false when all dependencies are completed', () => {
    const result = isTicketBlocked(db, [100]);
    expect(result).toBe(false);
  });

  it('should return false when all dependencies are declined', () => {
    const result = isTicketBlocked(db, [101]);
    expect(result).toBe(false);
  });

  it('should return true when dependency is pending', () => {
    const result = isTicketBlocked(db, [102]);
    expect(result).toBe(true);
  });

  it('should return true when dependency is needs-info', () => {
    const result = isTicketBlocked(db, [103]);
    expect(result).toBe(true);
  });

  it('should return true when dependency is unresolved', () => {
    const result = isTicketBlocked(db, [104]);
    expect(result).toBe(true);
  });

  it('should return true when dependency is deleted', () => {
    const result = isTicketBlocked(db, [105]);
    expect(result).toBe(true);
  });

  it('should return true when dependency does not exist', () => {
    const result = isTicketBlocked(db, [999]);
    expect(result).toBe(true);
  });

  it('should return true when any dependency is blocked (mix of completed and pending)', () => {
    const result = isTicketBlocked(db, [100, 102]);
    expect(result).toBe(true);
  });

  it('should return false when all dependencies are completed or declined', () => {
    const result = isTicketBlocked(db, [100, 101]);
    expect(result).toBe(false);
  });

  it('should handle multiple dependencies with mixed statuses', () => {
    const result = isTicketBlocked(db, [100, 101, 102, 103]);
    expect(result).toBe(true);
  });
});
