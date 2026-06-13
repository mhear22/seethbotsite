/**
 * Jest config for PURE, DB-FREE unit tests.
 *
 * The default jest.config.js wires tests/setup.ts via setupFilesAfterEach,
 * which runs `prisma migrate deploy` against a live Postgres — unavailable in
 * CI / sandbox environments. This config runs ONLY the DB-free game modules in
 * src/game/__tests__ and does NOT load any DB setup file.
 *
 * Run with: npm run test:unit
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/game/__tests__'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  verbose: true,
  testTimeout: 30000,
  // NOTE: intentionally NO setupFilesAfterEach / globalSetup — no DB.
};
