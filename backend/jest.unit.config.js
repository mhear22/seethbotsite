/**
 * Jest config for PURE, DB-FREE unit tests.
 *
 * The default jest.config.js wires tests/setup.ts via setupFilesAfterEach,
 * which runs `prisma migrate deploy` against a live Postgres — unavailable in
 * CI / sandbox environments. This config runs ONLY DB-free modules and does NOT
 * load any DB setup file.
 *
 * NOTE: the mech game unit suites (formerly src/game/__tests__) moved to the
 * standalone mech backend package (apps/mech/backend); run them with
 * `pnpm --filter ./apps/mech/backend test`.
 *
 * Run with: npm run test:unit
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/middleware.test.ts', '**/tokenLimiter.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  verbose: true,
  testTimeout: 30000,
  // NOTE: intentionally NO setupFilesAfterEach / globalSetup — no DB.
};
