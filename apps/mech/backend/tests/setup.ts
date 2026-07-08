/**
 * Jest setup for the mech backend test suites.
 *
 * These are pure, DB-free unit tests. The only ambient requirement is
 * SEETHBOT_JWT_SECRET, which multiplayer.controller.ts asserts at import time
 * (it refuses to load with an insecure default). Provide a deterministic test
 * value here so the suite is self-contained and does not depend on a shell env.
 *
 * Runs via `setupFiles` (before test modules are imported) so the env var is
 * present when the controller module is evaluated.
 */
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.SEETHBOT_JWT_SECRET = process.env.SEETHBOT_JWT_SECRET || 'test-jwt-secret-mech-backend';
