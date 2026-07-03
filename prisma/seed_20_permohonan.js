const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up database...');
  // Delete all tables except User
  await prisma.auditLog.deleteMany({});
  await prisma.inAppNotification.deleteMany({});
  await prisma.permintaanKoreksi.deleteMany({});
  await prisma.arsipDigital.deleteMany({});
  await prisma.manifest.deleteMany({});
  await prisma.bundle.deleteMany({});
  await prisma.dataBaru.deleteMany({});
  await prisma.permohonan.deleteMany({});
  console.log('Database cleanup complete.');

  // Find a PENGINPUT user
  let penginput = await prisma.user.findFirst({
    where: { role: 'PENGINPUT' }
  });

  if (!penginput) {
    console.log('No PENGINPUT user found! Creating a default one...');
    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash('password123', 10);
    penginput = await prisma.user.create({
      data: {
        name: 'Ahmad Penginput',
        email: 'penginput@architax.com',
        passwordHash,
        role: 'PENGINPUT',
        isActive: true,
      }
    });
  }
  console.log(`Using penginput user: ${penginput.name} (${penginput.id})`);

  // Generate 20 permohonan data
  const jenisLayananList = [
    'MUTASI_SEBAGIAN',
    'MUTASI_HABIS_UPDATE',
    'MUTASI_HABIS_REGULER',
    'OBJEK_PAJAK_BARU',
    'PEMBETULAN',
    'PENGAKTIFAN'
  ];

  const namaWPList = [
    'Suparman', 'Joko Susilo', 'Siti Rahmawati', 'Dewi Lestari', 'Bambang Pamungkas',
    'Rian Hidayat', 'Mega Utami', 'Hadi Wijaya', 'Sri Mulyani', 'Aditya Pratama',
    'Indah Permatasari', 'Fajar Nugraha', 'Eka Putra', 'Rina Handayani', 'Yusuf Mansur',
    'Anisa Trihapsari', 'Deni Sumargo', 'Gita Gutawa', 'Budi Utomo', 'Lilis Karlina'
  ];

  const alamatWPList = [
    'Jl. Anggrek No. 12, Semarang',
    'Jl. Mawar No. 45, Boyolali',
    'Jl. Melati No. 8, Solo',
    'Jl. Kenanga No. 23, Sukoharjo',
    'Jl. Flamboyan No. 17, Klaten',
    'Jl. Kamboja No. 9, Karanganyar',
    'Jl. Dahlia No. 34, Sragen',
    'Jl. Tulip No. 2, Wonogiri',
    'Jl. Sakura No. 11, Purwodadi',
    'Jl. Teratai No. 15, Salatiga'
  ];

  const kecamatanList = ['Kecamatan Gajahmungkur', 'Kecamatan Tembalang', 'Kecamatan Banyumanik', 'Kecamatan Pedurungan'];
  const desaList = ['Desa Lempongsari', 'Desa Bendan Ngisor', 'Desa Sampangan', 'Desa Pudakpayung'];

  console.log('Seeding 20 permohonan records...');

  for (let i = 1; i <= 20; i++) {
    const jenis = jenisLayananList[(i - 1) % jenisLayananList.length];
    const namaWp = namaWPList[i - 1];
    const alamatWp = alamatWPList[i % alamatWPList.length];
    const nop = '3374' + String(10000000000000 + i).padStart(14, '0'); // Ensure it is exactly 18 digits (4 digits area + 14 digits)
    const nomorPelayanan = `2026/07/${String(100 + i)}`;
    const nomorPermohonan = `PERM-${String(20260700 + i)}`;

    // Create Permohonan
    const permohonan = await prisma.permohonan.create({
      data: {
        nomorPermohonan,
        jenisPermohonan: jenis,
        status: 'SUBMITTED',
        namaWajibPajak: namaWp,
        nop,
        noWhatsapp: '08123456789' + (i % 10),
        alamat: alamatWp,
        nomorPelayanan,
        penginputId: penginput.id,
        namaPemilikLama: 'Pemilik Lama ' + namaWp,
        alamatPemilikLama: alamatWp,
        kecamatanPemilikLama: kecamatanList[i % kecamatanList.length],
        desaPemilikLama: desaList[i % desaList.length],
        alamatObjekLama: alamatWp,
        kecamatanObjekLama: kecamatanList[i % kecamatanList.length],
        desaObjekLama: desaList[i % desaList.length],
        luasTanahLama: 150.0 + (i * 10),
        luasBangunanLama: 80.0 + (i * 5),
        sertifikatLama: 'SHM-OLD-' + (1000 + i),
        // Create DataBaru relation
        dataBaru: {
          create: {
            namaPemilikBaru: 'Pemilik Baru ' + namaWp,
            alamatPemilikBaru: alamatWp,
            kecamatanPemilikBaru: kecamatanList[(i + 1) % kecamatanList.length],
            desaPemilikBaru: desaList[(i + 1) % desaList.length],
            alamatObjekBaru: alamatWp,
            kecamatanObjekBaru: kecamatanList[(i + 1) % kecamatanList.length],
            desaObjekBaru: desaList[(i + 1) % desaList.length],
            luasTanahBaru: 150.0 + (i * 10),
            luasBangunanBaru: 80.0 + (i * 5),
            sertifikatBaru: 'SHM-NEW-' + (2000 + i),
          }
        }
      }
    });

    console.log(`Created [${i}/20] Permohonan: ${nomorPermohonan} - ${jenis} for WP: ${namaWp}`);
  }

  console.log('Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
