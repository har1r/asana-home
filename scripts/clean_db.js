const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanDatabase() {
  console.log('Cleaning transactional database records...');
  try {
    await prisma.dataLama.deleteMany({});
    console.log('Cleared DataLama');

    await prisma.dataBaru.deleteMany({});
    console.log('Cleared DataBaru');

    await prisma.arsipDigital.deleteMany({});
    console.log('Cleared ArsipDigital');

    await prisma.permintaanKoreksi.deleteMany({});
    console.log('Cleared PermintaanKoreksi');

    await prisma.permohonan.deleteMany({});
    console.log('Cleared Permohonan');

    await prisma.bundle.deleteMany({});
    console.log('Cleared Bundle');

    await prisma.manifest.deleteMany({});
    console.log('Cleared Manifest');

    await prisma.inAppNotification.deleteMany({});
    console.log('Cleared InAppNotification');

    await prisma.auditLog.deleteMany({});
    console.log('Cleared AuditLog');

    const userCount = await prisma.user.count();
    console.log(`Database cleaned successfully! (${userCount} User accounts preserved)`);
  } catch (error) {
    console.error('Error cleaning database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDatabase();
