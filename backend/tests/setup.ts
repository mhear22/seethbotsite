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

export const setupTestDB = () => {
  // Run Prisma migrations for test database
  console.log('Setting up test database...');
  try {
    execSync('npx prisma migrate deploy', {
      stdio: 'inherit',
      env: { ...process.env }
    });
    console.log('Test database setup complete.');
  } catch (error) {
    console.error('Failed to setup test database:', error);
    console.error('Make sure PostgreSQL is running. You can start it with: docker-compose up -d postgres');
    throw error;
  }
};

export const cleanupTestDB = () => {
  // For PostgreSQL, we typically don't drop the database between tests
  // Instead, transactions are rolled back or data is truncated
  console.log('Test cleanup complete.');
};

// Setup before all tests
beforeAll(() => {
  setupTestDB();
});

// Cleanup after all tests
afterAll(() => {
  cleanupTestDB();
});
