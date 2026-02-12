import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create default settings
  const defaultSettings = [
    { key: 'site_name', value: 'Seethbot Site' },
    { key: 'maintenance_mode', value: 'false' },
    { key: 'registration_open', value: 'true' },
  ];

  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  // Create default click counter
  await prisma.click.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, count: 0 },
  });

  // Create default stocks
  const defaultStocks = [
    {
      name: 'Average Hex',
      avatar: 'https://cdn.discordapp.com/avatars/179152342820585472/placeholder.png',
      price: 500,
      coolness_score: 500,
      shares: 1000,
      min_price: 100,
      max_price: 2000,
      price_history: JSON.stringify([{ timestamp: Date.now(), price: 500 }]),
    },
    {
      name: 'Chang\'Yi',
      avatar: 'https://cdn.discordapp.com/avatars/180988078649769984/placeholder.png',
      price: 600,
      coolness_score: 550,
      shares: 1000,
      min_price: 100,
      max_price: 2000,
      price_history: JSON.stringify([{ timestamp: Date.now(), price: 600 }]),
    },
  ];

  for (const stock of defaultStocks) {
    await prisma.stock.upsert({
      where: { name: stock.name },
      update: {},
      create: stock,
    });
  }

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
