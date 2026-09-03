import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // Clean existing users
  await prisma.user.deleteMany({});
  
  const passwordHash = await bcrypt.hash('password123', 10);
  
  const users = [
    {
      name: 'Ahmad Data Entry',
      email: 'penginput@architax.com',
      passwordHash,
      role: UserRole.DATA_ENTRY,
      isActive: true,
    },
    {
      name: 'Budi Researcher',
      email: 'peneliti@architax.com',
      passwordHash,
      role: UserRole.RESEARCHER,
      isActive: true,
    },
    {
      name: 'Chandra Archivist',
      email: 'pengarsip@architax.com',
      passwordHash,
      role: UserRole.ARCHIVIST,
      isActive: true,
    },
    {
      name: 'Dedi Sender',
      email: 'pengirim@architax.com',
      passwordHash,
      role: UserRole.SENDER,
      isActive: true,
    },
    {
      name: 'Eko Monitor',
      email: 'pemantau@architax.com',
      passwordHash,
      role: UserRole.MONITOR,
      isActive: true,
    },
    {
      name: 'Siti Supervisor',
      email: 'supervisor@architax.com',
      passwordHash,
      role: UserRole.SUPERVISOR,
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
