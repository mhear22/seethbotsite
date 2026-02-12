import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';

// Determine database path based on environment
const isTest = process.env.NODE_ENV === 'test';
const dbDir = isTest ? 'data-test' : 'data';
const dbPath = path.join(__dirname, '../../', dbDir, 'dev.db');
const adapter = new PrismaBetterSqlite3({ url: dbPath });

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'test' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
