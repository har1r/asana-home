const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const NOP_MAPPING = {
  '150': {
    name: 'SEPATAN',
    villages: {
      '001': 'MEKARJAYA',
      '002': 'KARET',
      '003': 'LEBAK WANGI',
      '004': 'KEDAUNG BARAT',
      '005': 'PONDOK JAYA',
      '006': 'SEPATAN',
      '007': 'PISANGAN JAYA',
      '008': 'SARAKAN',
      '009': 'TANAH MERAH',
      '010': 'JATI MULYA',
      '011': 'GEMPOLSARI',
      '012': 'SANGIANG',
      '013': 'KAYU AGUNG',
      '014': 'KAYU BONGKOK',
      '023': 'KAMPUNG KELOR',
    }
  },
  '151': {
    name: 'PAKUHAJI',
    villages: {
      '001': 'KALIBARU',
      '002': 'SURYA BAHARI',
      '003': 'SUKAWALI',
      '004': 'KRAMAT',
      '005': 'KOHOD',
      '006': 'GAGA',
      '007': 'KIARA PAYUNG',
      '008': 'BUARAN BAMBU',
      '009': 'PAKU ALAM',
      '010': 'BUARAN MANGGA',
      '011': 'PAKUHAJI',
      '012': 'BUNISARI',
      '013': 'LAKSANA',
      '014': 'RAWABONI',
    }
  },
  '152': {
    name: 'SEPATAN TIMUR',
    villages: {
      '001': 'KEDAUNG BARAT',
      '002': 'LEBAK WANGI',
      '003': 'TANAH MERAH',
      '004': 'JATI MULYA',
      '005': 'GEMPOLSARI',
      '006': 'SANGIANG',
      '007': 'PONDOK KELOR',
      '008': 'KAMPUNG KELOR',
    }
  },
  '160': {
    name: 'TELUKNAGA',
    villages: {
      '002': 'BOJONG RENGED',
      '004': 'KEBON CAU',
      '005': 'TELUKNAGA',
      '006': 'BABAKAN ASEM',
      '015': 'KAMP MELAYU T',
      '016': 'KAMP MELAYU B',
      '017': 'KAMPUNG BESAR',
      '018': 'LEMO',
      '019': 'TEGAL ANGUS',
      '020': 'PANGKALAN',
      '021': 'TANJUNG BURUNG',
      '022': 'TANJUNG PASIR',
      '023': 'MUARA',
    }
  },
  '161': {
    name: 'KOSAMBI',
    villages: {
      '001': 'SALEMBARAN JAYA',
      '002': 'SALEMBARAN JATI',
      '003': 'KOSAMBI BARAT',
      '004': 'KOSAMBI TIMUR',
      '005': 'DADAP',
      '006': 'JATIMULYA',
      '007': 'CENGKLONG',
      '008': 'BLIMBING',
      '009': 'RAWA BURUNG',
      '010': 'RAWA RENGAS',
    }
  }
};

const KECAMATAN_CODES = Object.keys(NOP_MAPPING);

// Helper to get random/round-robin kecamatan and desa details
function getKecAndDesa(index) {
  const kecCode = KECAMATAN_CODES[index % KECAMATAN_CODES.length];
  const mapping = NOP_MAPPING[kecCode];
  const villageCodes = Object.keys(mapping.villages);
  const desaCode = villageCodes[index % villageCodes.length];
  const desaName = mapping.villages[desaCode];
  return {
    kecCode,
    kecName: mapping.name,
    desaCode,
    desaName
  };
}

// Generate names for variety
const MALE_NAMES = [
  'BUDI', 'JOKO', 'ANDI', 'EDI', 'TOTO', 'AGUS', 'IWAN', 'HERI', 'TONI', 'HARI',
  'SOFYAN', 'ARIF', 'HENDRA', 'FAJAR', 'DEDI', 'RUDI', 'BAMBANG', 'SURYA', 'INDRA', 'SLAMET'
];
const FEMALE_NAMES = [
  'SITI', 'DEWI', 'RINA', 'SRI', 'MEGA', 'WULAN', 'ANISA', 'LILIS', 'GITA', 'INDAH',
  'RATNA', 'FITRI', 'SARI', 'DIAN', 'RUSTINI', 'TRI', 'KUSUMA', 'NANI', 'HARTATI', 'YUNI'
];
const SURNAMES = [
  'SUSILO', 'WIDODO', 'HIDAYAT', 'PRATAMA', 'PUTRA', 'WIJAYA', 'SUTRISNO', 'GUNAWAN', 'RAHMAN', 'SANTOSO',
  'NUGRAHA', 'SAPUTRA', 'BUDIANTO', 'PAMUNGKAS', 'HERMAWAN', 'SETIAWAN', 'KUSUMA', 'MUBAROK', 'ALAMSYAH', 'HADI'
];

function generateName(index, isNew = false) {
  const first = isNew ? FEMALE_NAMES[index % FEMALE_NAMES.length] : MALE_NAMES[index % MALE_NAMES.length];
  const last = SURNAMES[(index + (isNew ? 5 : 0)) % SURNAMES.length];
  return `${first} ${last}`;
}

async function main() {
  console.log('Cleaning up database...');
  // Delete all tables
  await prisma.auditLog.deleteMany({});
  await prisma.inAppNotification.deleteMany({});
  await prisma.permintaanKoreksi.deleteMany({});
  await prisma.arsipDigital.deleteMany({});
  await prisma.manifest.deleteMany({});
  await prisma.bundle.deleteMany({});
  await prisma.dataBaru.deleteMany({});
  await prisma.permohonan.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('Database cleanup complete.');

  console.log('Creating users for each role...');
  const passwordHash = await bcrypt.hash('password123', 10);
  
  const roles = [
    { name: 'Ahmad Penginput', email: 'penginput@architax.com', role: 'PENGINPUT' },
    { name: 'Budi Peneliti', email: 'peneliti@architax.com', role: 'PENELITI' },
    { name: 'Chandra Pengarsip', email: 'pengarsip@architax.com', role: 'PENGARSIP' },
    { name: 'Dedi Pengirim', email: 'pengirim@architax.com', role: 'PENGIRIM' },
    { name: 'Eko Pemantau', email: 'pemantau@architax.com', role: 'PEMANTAU' },
    { name: 'Siti Supervisor', email: 'supervisor@architax.com', role: 'SUPERVISOR' }
  ];

  const createdUsers = {};
  for (const r of roles) {
    const user = await prisma.user.create({
      data: {
        name: r.name,
        email: r.email,
        passwordHash,
        role: r.role,
        isActive: true
      }
    });
    createdUsers[r.role] = user;
    console.log(`Created user: ${user.name} (${user.role}) - Login Email: ${user.email} / Password: password123`);
  }

  const penginput = createdUsers['PENGINPUT'];

  // 60 permohonan: 10 of each type
  const typesToSeed = [
    { type: 'MUTASI_SEBAGIAN', count: 10 },
    { type: 'MUTASI_HABIS_REGULER', count: 10 },
    { type: 'MUTASI_HABIS_UPDATE', count: 10 },
    { type: 'PEMBETULAN', count: 10 },
    { type: 'PENGAKTIFAN', count: 10 },
    { type: 'OBJEK_PAJAK_BARU', count: 10 }
  ];

  let seqNum = 1;
  const baseDate = new Date('2026-07-18');

  for (const { type, count } of typesToSeed) {
    console.log(`Seeding ${count} records for type: ${type}...`);
    for (let i = 1; i <= count; i++) {
      const currentSeq = seqNum;
      seqNum++;

      const { kecCode, kecName, desaCode, desaName } = getKecAndDesa(currentSeq);
      const nop = `3619${kecCode}${desaCode}000${String(currentSeq).padStart(4, '0')}0`;
      const nomorPelayanan = `2026/LP/${String(currentSeq).padStart(4, '0')}`;
      const nomorPermohonan = `PMH-20260718-${String(1000 + currentSeq)}`;
      const noWhatsapp = `628123456${String(100 + currentSeq)}`;
      const readableJenis = type.replace(/_/g, ' ');

      // Calculate tanggalPenyelesaian
      let monthsToAdd = 4;
      if (type === 'OBJEK_PAJAK_BARU') {
        monthsToAdd = 6;
      } else if (type === 'PENGAKTIFAN') {
        monthsToAdd = 1;
      }
      const tanggalPenyelesaian = new Date(baseDate);
      tanggalPenyelesaian.setMonth(baseDate.getMonth() + monthsToAdd);

      // Determine fields based on JenisPermohonan meanings
      let namaWajibPajak = '';
      let alamat = '';
      let needDataLama = false;
      let needDataBaru = false;

      // Data Lama
      let namaPemilikLama = null;
      let alamatPemilikLama = null;
      let kecamatanPemilikLama = null;
      let desaPemilikLama = null;
      let alamatObjekLama = null;
      let kecamatanObjekLama = null;
      let desaObjekLama = null;
      let luasTanahLama = null;
      let luasBangunanLama = null;
      let sertifikatLama = null;

      // Data Baru
      let dataBaruList = [];

      const oldName = generateName(currentSeq, false);
      const newName = generateName(currentSeq, true);

      if (type === 'MUTASI_SEBAGIAN') {
        needDataLama = true;
        needDataBaru = true;
        
        namaPemilikLama = oldName;
        alamatPemilikLama = `JL. MAWAR NO. ${currentSeq}`;
        kecamatanPemilikLama = kecName;
        desaPemilikLama = desaName;
        alamatObjekLama = `JL. RAYA ${desaName} NO. ${currentSeq}`;
        kecamatanObjekLama = kecName;
        desaObjekLama = desaName;
        luasTanahLama = 300.0;
        luasBangunanLama = 150.0;
        sertifikatLama = `SHM-${kecCode}-${desaCode}-OLD-${currentSeq}`;

        namaWajibPajak = newName; // derived from first new owner
        alamat = `JL. ANGGREK NO. ${currentSeq}`;

        dataBaruList = [{
          namaPemilikBaru: newName,
          alamatPemilikBaru: `JL. ANGGREK NO. ${currentSeq}`,
          kecamatanPemilikBaru: kecName,
          desaPemilikBaru: desaName,
          alamatObjekBaru: `JL. RAYA ${desaName} NO. ${currentSeq} B`, // split portion
          kecamatanObjekBaru: kecName,
          desaObjekBaru: desaName,
          luasTanahBaru: 150.0, // partial land mutation
          luasBangunanBaru: 75.0, // partial building mutation
          sertifikatBaru: `SHM-${kecCode}-${desaCode}-NEW-${currentSeq}`
        }];
      } 
      else if (type === 'MUTASI_HABIS_REGULER') {
        needDataLama = true;
        needDataBaru = true;

        namaPemilikLama = oldName;
        alamatPemilikLama = `JL. KEMBOJA NO. ${currentSeq}`;
        kecamatanPemilikLama = kecName;
        desaPemilikLama = desaName;
        alamatObjekLama = `JL. UTAMA ${desaName} NO. ${currentSeq}`;
        kecamatanObjekLama = kecName;
        desaObjekLama = desaName;
        luasTanahLama = 200.0;
        luasBangunanLama = 100.0;
        sertifikatLama = `SHM-${kecCode}-${desaCode}-OLD-${currentSeq}`;

        namaWajibPajak = newName;
        alamat = `JL. DAHLIA NO. ${currentSeq}`;

        dataBaruList = [{
          namaPemilikBaru: newName,
          alamatPemilikBaru: `JL. DAHLIA NO. ${currentSeq}`,
          kecamatanPemilikBaru: kecName,
          desaPemilikBaru: desaName,
          alamatObjekBaru: `JL. UTAMA ${desaName} NO. ${currentSeq}`,
          kecamatanObjekBaru: kecName,
          desaObjekBaru: desaName,
          luasTanahBaru: 200.0, // matches old area (regular transfer)
          luasBangunanBaru: 100.0, // matches old area (regular transfer)
          sertifikatBaru: `SHM-${kecCode}-${desaCode}-NEW-${currentSeq}`
        }];
      } 
      else if (type === 'MUTASI_HABIS_UPDATE') {
        needDataLama = true;
        needDataBaru = true;

        namaPemilikLama = oldName;
        alamatPemilikLama = `JL. MELATI NO. ${currentSeq}`;
        kecamatanPemilikLama = kecName;
        desaPemilikLama = desaName;
        alamatObjekLama = `JL. FLAMBOYAN NO. ${currentSeq}`;
        kecamatanObjekLama = kecName;
        desaObjekLama = desaName;
        luasTanahLama = 200.0;
        luasBangunanLama = 80.0;
        sertifikatLama = `SHM-${kecCode}-${desaCode}-OLD-${currentSeq}`;

        namaWajibPajak = newName;
        alamat = `JL. CEMPAKA NO. ${currentSeq}`;

        dataBaruList = [{
          namaPemilikBaru: newName,
          alamatPemilikBaru: `JL. CEMPAKA NO. ${currentSeq}`,
          kecamatanPemilikBaru: kecName,
          desaPemilikBaru: desaName,
          alamatObjekBaru: `JL. FLAMBOYAN NO. ${currentSeq}`,
          kecamatanObjekBaru: kecName,
          desaObjekBaru: desaName,
          luasTanahBaru: 250.0, // updated/re-measured area
          luasBangunanBaru: 120.0, // updated building area (new renovation)
          sertifikatBaru: `SHM-${kecCode}-${desaCode}-NEW-${currentSeq}`
        }];
      } 
      else if (type === 'PEMBETULAN') {
        needDataLama = true;
        needDataBaru = true;

        // typo simulated in old name: using '0' instead of 'O' or missing char
        const typoName = oldName.replace(/O/g, '0').replace(/A/g, '4');
        namaPemilikLama = typoName;
        alamatPemilikLama = `JL. RAYA INDAH NO. ${currentSeq}`;
        kecamatanPemilikLama = kecName;
        desaPemilikLama = desaName;
        alamatObjekLama = `JL. PALEM NO. ${currentSeq}`;
        kecamatanObjekLama = kecName;
        desaObjekLama = desaName;
        luasTanahLama = 145.0; // incorrect area in DB
        luasBangunanLama = 78.0; // incorrect area in DB
        sertifikatLama = `SHM-${kecCode}-${desaCode}-OLD-${currentSeq}`;

        namaWajibPajak = oldName; // corrected name
        alamat = `JL. RAYA INDAH NO. ${currentSeq}`;

        dataBaruList = [{
          namaPemilikBaru: oldName, // corrected name
          alamatPemilikBaru: `JL. RAYA INDAH NO. ${currentSeq}`,
          kecamatanPemilikBaru: kecName,
          desaPemilikBaru: desaName,
          alamatObjekBaru: `JL. PALEM NO. ${currentSeq}`,
          kecamatanObjekBaru: kecName,
          desaObjekBaru: desaName,
          luasTanahBaru: 150.0, // corrected area
          luasBangunanBaru: 80.0, // corrected area
          sertifikatBaru: `SHM-${kecCode}-${desaCode}-NEW-${currentSeq}`
        }];
      } 
      else if (type === 'PENGAKTIFAN') {
        needDataLama = true;
        needDataBaru = false;

        namaPemilikLama = oldName;
        alamatPemilikLama = `JL. TULIP NO. ${currentSeq}`;
        kecamatanPemilikLama = kecName;
        desaPemilikLama = desaName;
        alamatObjekLama = `JL. KENANGA NO. ${currentSeq}`;
        kecamatanObjekLama = kecName;
        desaObjekLama = desaName;
        luasTanahLama = 180.0;
        luasBangunanLama = 90.0;
        sertifikatLama = `SHM-${kecCode}-${desaCode}-OLD-${currentSeq}`;

        namaWajibPajak = oldName; // active owner
        alamat = `JL. TULIP NO. ${currentSeq}`;
      } 
      else if (type === 'OBJEK_PAJAK_BARU') {
        needDataLama = false;
        needDataBaru = true;

        namaWajibPajak = newName;
        alamat = `JL. BOULEVARD NO. ${currentSeq}`;

        dataBaruList = [{
          namaPemilikBaru: newName,
          alamatPemilikBaru: `JL. BOULEVARD NO. ${currentSeq}`,
          kecamatanPemilikBaru: kecName,
          desaPemilikBaru: desaName,
          alamatObjekBaru: `JL. ARLIA NO. ${currentSeq}`,
          kecamatanObjekBaru: kecName,
          desaObjekBaru: desaName,
          luasTanahBaru: 120.0,
          luasBangunanBaru: 60.0,
          sertifikatBaru: `SHM-${kecCode}-${desaCode}-NEW-${currentSeq}`
        }];
      }

      // Save Permohonan and Data Baru
      await prisma.permohonan.create({
        data: {
          nomorPermohonan,
          jenisPermohonan: type,
          status: 'SUBMITTED',
          namaWajibPajak,
          nop,
          noWhatsapp,
          alamat,
          nomorPelayanan,
          tanggalNoPelayanan: baseDate,
          tanggalPenyelesaian,

          // Data Lama
          namaPemilikLama: needDataLama ? namaPemilikLama : null,
          alamatPemilikLama: needDataLama ? alamatPemilikLama : null,
          kecamatanPemilikLama: needDataLama ? kecamatanPemilikLama : null,
          desaPemilikLama: needDataLama ? desaPemilikLama : null,
          alamatObjekLama: needDataLama ? alamatObjekLama : null,
          kecamatanObjekLama: needDataLama ? kecamatanObjekLama : null,
          desaObjekLama: needDataLama ? desaObjekLama : null,
          luasTanahLama: needDataLama ? luasTanahLama : null,
          luasBangunanLama: needDataLama ? luasBangunanLama : null,
          sertifikatLama: needDataLama ? sertifikatLama : null,

          // Data Baru
          dataBaru: needDataBaru && dataBaruList.length > 0 ? {
            create: dataBaruList.map(item => ({
              namaPemilikBaru: item.namaPemilikBaru,
              alamatPemilikBaru: item.alamatPemilikBaru,
              kecamatanPemilikBaru: item.kecamatanPemilikBaru,
              desaPemilikBaru: item.desaPemilikBaru,
              alamatObjekBaru: item.alamatObjekBaru,
              kecamatanObjekBaru: item.kecamatanObjekBaru,
              desaObjekBaru: item.desaObjekBaru,
              luasTanahBaru: item.luasTanahBaru,
              luasBangunanBaru: item.luasBangunanBaru,
              sertifikatBaru: item.sertifikatBaru
            }))
          } : undefined,

          penginputId: penginput.id
        }
      });
      console.log(`[${currentSeq}/60] Created Permohonan: ${nomorPermohonan} - ${type}`);
    }
  }

  console.log('Database seeding completed successfully for 6 roles and 60 permohonan records!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
