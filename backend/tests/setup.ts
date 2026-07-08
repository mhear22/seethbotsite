/**
 * Test setup file for Jest
 * Initializes test database and provides test utilities
 */

import { execSync } from 'child_process';

// Set test environment
process.env.NODE_ENV = 'test';
process.env.PORT = '3002'; // Use different port for tests

// Default test database URL if not provided - matches docker-compose.yml postgres service
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://seethbot:seethbot_secret_change_me@localhost:5432/seethbot?schema=public';
}

// Silence noisy console output during tests (console.error kept for real failures)
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
console.log = (...args: any[]) => {
  // Only suppress known noisy prefixes; pass through unexpected logs
  const msg = args[0]?.toString?.() ?? '';
  if (
    msg.startsWith('[Auth]') ||
    msg.startsWith('prisma:') ||
    msg.startsWith('Setting up test database') ||
    msg.startsWith('Test database setup') ||
    msg.startsWith('Test cleanup')
  ) return;
  originalConsoleLog(...args);
};
console.warn = (...args: any[]) => {
  const msg = args[0]?.toString?.() ?? '';
  if (
    msg.startsWith('[Auth]')
  ) return;
  originalConsoleWarn(...args);
};

export const setupTestDB = () => {
  // Run Prisma migrations for test database
  try {
    execSync('npx prisma migrate deploy', {
      stdio: 'inherit',
      env: { ...process.env }
    });
  } catch (error) {
    console.error('Failed to setup test database:', error);
    console.error('Make sure PostgreSQL is running. You can start it with: docker-compose up -d postgres');
    throw error;
  }
};

export const cleanupTestDB = () => {
  // For PostgreSQL, we typically don't drop the database between tests
  // Instead, transactions are rolled back or data is truncated
};

// Setup before all tests
beforeAll(() => {
  setupTestDB();
});

// Cleanup after all tests
afterAll(() => {
  cleanupTestDB();
});
