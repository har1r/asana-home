const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanExceptUser() {
  console.log('Cleaning database collections except User...');
  const logs = await prisma.auditLog.deleteMany({});
  console.log('AuditLog deleted:', logs.count);
  const notifs = await prisma.inAppNotification.deleteMany({});
  console.log('InAppNotification deleted:', notifs.count);
  const koreksi = await prisma.permintaanKoreksi.deleteMany({});
  console.log('PermintaanKoreksi deleted:', koreksi.count);
  const arsip = await prisma.arsipDigital.deleteMany({});
  console.log('ArsipDigital deleted:', arsip.count);
  const manifest = await prisma.manifest.deleteMany({});
  console.log('Manifest deleted:', manifest.count);
  const bundle = await prisma.bundle.deleteMany({});
  console.log('Bundle deleted:', bundle.count);
  const dbBaru = await prisma.dataBaru.deleteMany({});
  console.log('DataBaru deleted:', dbBaru.count);
  const dbLama = await prisma.dataLama.deleteMany({});
  console.log('DataLama deleted:', dbLama.count);
  const permohonan = await prisma.permohonan.deleteMany({});
  console.log('Permohonan deleted:', permohonan.count);
  
  const userCount = await prisma.user.count();
  console.log(`Cleanup complete! Preserved ${userCount} records in User collection.`);
}

cleanExceptUser()
  .catch(err => {
    console.error('Cleanup error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
