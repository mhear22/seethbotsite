import prisma from './src/lib/prisma';

async function test() {
  try {
    const count = await prisma.ticket.count();
    console.log('✅ Prisma connection successful!');
    console.log(`Total tickets: ${count}`);
  } catch (error) {
    console.error('❌ Prisma connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
