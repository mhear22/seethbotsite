import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';

const adapter = new PrismaLibSql({
  url: 'file:./prisma/dev.db',
});

const prisma = new PrismaClient({
  adapter,
});

try {
  const count = await prisma.ticket.count();
  console.log('✅ Prisma connection successful!');
  console.log(`Total tickets: ${count}`);
} catch (error) {
  console.error('❌ Prisma connection failed:', error);
} finally {
  await prisma.$disconnect();
}
