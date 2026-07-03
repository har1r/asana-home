import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // Clean existing users
  await prisma.user.deleteMany({});
  
  const passwordHash = await bcrypt.hash('password123', 10);
  
  const users = [
    {
      name: 'Ahmad Penginput',
      email: 'penginput@architax.com',
      passwordHash,
      role: 'PENGINPUT' as const,
      isActive: true,
    },
    {
      name: 'Budi Peneliti',
      email: 'peneliti@architax.com',
      passwordHash,
      role: 'PENELITI' as const,
      isActive: true,
    },
    {
      name: 'Chandra Pengarsip',
      email: 'pengarsip@architax.com',
      passwordHash,
      role: 'PENGARSIP' as const,
      isActive: true,
    },
    {
      name: 'Dedi Pengirim',
      email: 'pengirim@architax.com',
      passwordHash,
      role: 'PENGIRIM' as const,
      isActive: true,
    },
    {
      name: 'Eko Pemantau',
      email: 'pemantau@architax.com',
      passwordHash,
      role: 'PEMANTAU' as const,
      isActive: true,
    },
    {
      name: 'Siti Supervisor',
      email: 'supervisor@architax.com',
      passwordHash,
      role: 'SUPERVISOR' as const,
      isActive: true,
    },
  ];

  for (const u of users) {
    const created = await prisma.user.create({
      data: u,
    });
    console.log(`Created user: ${created.name} (${created.role})`);
  }

  console.log('Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
