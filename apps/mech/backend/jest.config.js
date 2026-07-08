module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  verbose: true,
  testTimeout: 30000,
  maxWorkers: 1,
  // Sets SEETHBOT_JWT_SECRET before modules load (multiplayer.controller asserts it).
  // No DB setup — these suites are pure unit tests.
  setupFiles: ['<rootDir>/tests/setup.ts'],
};
