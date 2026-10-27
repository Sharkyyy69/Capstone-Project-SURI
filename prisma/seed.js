import bcrypt from 'bcryptjs';
import prisma from '../server/config/prisma.js';

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@suri.app' },
    update: {},
    create: {
      name: 'SURI Admin',
      email: 'admin@suri.app',
      password: passwordHash,
    },
  });

  await prisma.assessment.upsert({
    where: { id: 'sample-assessment' },
    update: {},
    create: {
      id: 'sample-assessment',
      userId: (await prisma.user.findUnique({ where: { email: 'admin@suri.app' } })).id,
      productType: 'fruit',
      itemName: 'Mango',
      result: 'Fresh',
      score: 92,
      recommendation: 'Buy',
      imageUrl: '/uploads/sample-mango.jpg',
    },
  });

  console.log('Seed data created successfully.');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
