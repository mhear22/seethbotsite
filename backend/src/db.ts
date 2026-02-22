import { prisma } from './lib/prisma';

// Click counter operations
export async function getClickCount(): Promise<number> {
  const click = await prisma.click.findUnique({ where: { id: 1 } });
  return click?.count ?? 0;
}

export async function incrementClick(): Promise<number> {
  const click = await prisma.click.upsert({
    where: { id: 1 },
    create: { count: 1 },
    update: { count: { increment: 1 } },
  });
  return click.count;
}

export async function resetClick(): Promise<number> {
  await prisma.click.upsert({
    where: { id: 1 },
    create: { count: 0 },
    update: { count: 0 },
  });
  return 0;
}
