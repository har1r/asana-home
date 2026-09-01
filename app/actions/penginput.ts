"use server";

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendWhatsApp } from '@/lib/fonnte';
import { notifyAllUsersOfRole } from '@/lib/notifications';
import { revalidatePath } from 'next/cache';
import { getGlobalBerandaStats as getGlobalBerandaStatsFromBeranda } from './beranda';
import { randomInt } from 'crypto';
import { permohonanSchema } from '@/lib/validations/permohonan';

import { formatAlamatLengkap } from '@/components/workspaces/shared/constants';

/* ============================================================================
 * BAGIAN 2: HELPER & UTILITY FUNCTIONS
 * ============================================================================ */

/**
 * Helper internal untuk membuat Nomor Permohonan acak unik: PMH-YYYYMMDD-[4 Digit Acak]
 */
async function generateUniqueNomorPermohonan(): Promise<string> {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  let nomor = '';
  let attempts = 0;

  while (attempts < 10) {
    const randomDigits = randomInt(1000, 10000);
    nomor = `PMH-${dateStr}-${randomDigits}`;

    const existing = await prisma.permohonan.findUnique({
      where: { nomorPermohonan: nomor },
      select: { id: true }
    });

    if (!existing) {
      return nomor;
    }
    attempts++;
  }
  return `PMH-${dateStr}-${randomInt(1000, 10000)}`;
}


/* ============================================================================
 * BAGIAN 3: SERVER ACTIONS - OLAH DATA PERMOHONAN (CREATE & EDIT)
 * ============================================================================ */

/**
 * Server Action: Membuat permohonan PBB baru ke database.
 *
 * Seluruh validasi bisnis dilakukan oleh permohonanSchema.
 *
 * Aturan layanan:
 *
 * 1. OBJEK_PAJAK_BARU
 *    - Data lama: boleh kosong
 *    - Data baru: wajib, semua field wajib termasuk nopBaru
 *
 * 2. PENGAKTIFAN
 *    - Data lama: semua field wajib
 *    - Data baru: tidak wajib
 *
 * 3. MUTASI_HABIS_UPDATE
 *    - Data lama: wajib
 *    - alamatPemilikLama, blokPemilikLama,
 *      rtPemilikLama, rwPemilikLama, sertifikatLama: optional
 *    - Data baru: wajib
 *    - nopBaru: optional
 *
 * 4. MUTASI_HABIS_REGULER
 *    - Data lama: wajib
 *    - alamatPemilikLama, blokPemilikLama,
 *      rtPemilikLama, rwPemilikLama, sertifikatLama: optional
 *    - Data baru: wajib
 *    - nopBaru: optional
 *
 * 5. MUTASI_SEBAGIAN
 *    - Data lama: wajib
 *    - alamatPemilikLama, blokPemilikLama,
 *      rtPemilikLama, rwPemilikLama, sertifikatLama: optional
 *    - Data baru: wajib
 *    - nopBaru: optional
 *    - boleh memiliki lebih dari 1 data baru
 *
 * 6. MUTASI_PENGGABUNGAN
 *    - dataLama: wajib minimal 2 item
 *    - alamatPemilikLama, blokPemilikLama,
 *      rtPemilikLama, rwPemilikLama, sertifikatLama: optional
 *    - dataBaru: wajib
 *    - nopBaru: optional
 *    - hanya 1 data baru
 *
 * 7. PEMBETULAN
 *    - Data lama: semua field wajib
 *    - Data baru: wajib
 *    - nopBaru: optional
 *    - hanya 1 data baru
 */

export async function createPermohonan(rawInput: unknown) {

  // ============================================================
  // 1. CEK SESSION & ROLE
  // ============================================================

  const session = await getServerSession(authOptions);

  if (
    !session ||
    !session.user ||
    !['PENGINPUT', 'SUPERVISOR'].includes(session.user.role)
  ) {
    return {
      success: false,
      error:
        'Unauthorized: Hanya peran PENGINPUT atau SUPERVISOR yang diizinkan menginput data.',
    };
  }


  // ============================================================
  // 2. VALIDASI DENGAN ZOD
  // ============================================================
  //
  // permohonanSchema adalah sumber utama seluruh aturan validasi.
  //

  const validationResult = permohonanSchema.safeParse(rawInput);

  if (!validationResult.success) {

    const firstIssue = validationResult.error.issues[0];

    return {
      success: false,
      error: firstIssue?.message || 'Data permohonan tidak valid.',
      issues: validationResult.error.issues,
    };
  }

  const validated = validationResult.data;


  // ============================================================
  // 3. TENTUKAN KEBUTUHAN DATA BERDASARKAN JENIS LAYANAN
  // ============================================================

  const jenisPermohonan = validated.jenisPermohonan;

  const needDataLama = [
    'MUTASI_SEBAGIAN',
    'MUTASI_PENGGABUNGAN',
    'MUTASI_HABIS_UPDATE',
    'MUTASI_HABIS_REGULER',
    'PEMBETULAN',
    'PENGAKTIFAN',
  ].includes(jenisPermohonan);

  const needDataBaru = [
    'MUTASI_SEBAGIAN',
    'MUTASI_PENGGABUNGAN',
    'MUTASI_HABIS_UPDATE',
    'MUTASI_HABIS_REGULER',
    'PEMBETULAN',
    'OBJEK_PAJAK_BARU',
  ].includes(jenisPermohonan);


  try {

    // ==========================================================
    // 4. CEK DUPLIKASI NOMOR PELAYANAN
    // ==========================================================

    const existingNopel = await prisma.permohonan.findFirst({
      where: {
        nomorPelayanan: validated.nomorPelayanan,
      },
      select: {
        id: true,
        nomorPelayanan: true,
      },
    });

    if (existingNopel) {

      return {
        success: false,
        error:
          `Nomor Pelayanan "${validated.nomorPelayanan}" sudah terdaftar di sistem. ` +
          'Mohon periksa kembali berkas Anda.',
      };
    }


    // ==========================================================
    // 5. GENERATE NOMOR PERMOHONAN
    // ==========================================================

    const nomorPermohonan =
      await generateUniqueNomorPermohonan();


    // ==========================================================
    // 6. MENENTUKAN DATA UTAMA PERMOHONAN
    // ==========================================================
    //
    // Parent Permohonan memiliki:
    //
    // - namaWajibPajak
    // - alamat
    //
    // Data ini diambil dari hasil/data baru jika tersedia.
    //
    // Khusus PENGAKTIFAN, karena dataBaru tidak wajib,
    // fallback ke data lama.
    //
    // Khusus MUTASI_PENGGABUNGAN:
    // data lama adalah array, sehingga sumber parent untuk
    // informasi utama tidak boleh bergantung pada
    // validated.namaPemilikLama.
    //
    // Data baru tetap menjadi sumber utama karena merupakan
    // hasil akhir permohonan.
    // ==========================================================

    const firstDataBaru =
      validated.dataBaru &&
        validated.dataBaru.length > 0
        ? validated.dataBaru[0]
        : null;

    const firstDataLama =
      validated.dataLama &&
        validated.dataLama.length > 0
        ? validated.dataLama[0]
        : null;


    // ==========================================================
    // 7. DERIVED NAMA WAJIB PAJAK
    // ==========================================================

    let derivedNama = '';


    if (firstDataBaru) {

      derivedNama =
        firstDataBaru.namaPemilikBaru?.trim() || '';

    }

    else if (jenisPermohonan === 'MUTASI_PENGGABUNGAN') {

      derivedNama =
        firstDataLama?.namaPemilikLama?.trim() || '';

    }

    else {

      derivedNama =
        validated.namaPemilikLama?.trim() || '';

    }


    // ==========================================================
    // 8. DERIVED ALAMAT
    // ==========================================================

    let derivedAlamat = '';


    if (firstDataBaru) {

      derivedAlamat = formatAlamatLengkap({
        alamat: firstDataBaru.alamatPemilikBaru,
        blok: firstDataBaru.blokPemilikBaru,
        rt: firstDataBaru.rtPemilikBaru,
        rw: firstDataBaru.rwPemilikBaru,
      });

    }

    else if (jenisPermohonan === 'MUTASI_PENGGABUNGAN') {

      derivedAlamat = formatAlamatLengkap({
        alamat: firstDataLama?.alamatPemilikLama || '',
        blok: firstDataLama?.blokPemilikLama || null,
        rt: firstDataLama?.rtPemilikLama || null,
        rw: firstDataLama?.rwPemilikLama || null,
      });

    }

    else {

      derivedAlamat = formatAlamatLengkap({
        alamat: validated.alamatPemilikLama || '',
        blok: validated.blokPemilikLama || null,
        rt: validated.rtPemilikLama || null,
        rw: validated.rwPemilikLama || null,
      });

    }


    // ==========================================================
    // 9. NORMALISASI NOP
    // ==========================================================
    //
    // Schema sudah memvalidasi NOP.
    //
    // Untuk OBJEK_PAJAK_BARU:
    // NOP utama boleh kosong.
    //
    // Untuk layanan lainnya:
    // NOP sudah dipastikan valid oleh schema.
    // ==========================================================

    const normalizedNop =
      validated.nop?.trim() || null;


    // ==========================================================
    // 10. NORMALISASI DATA LAMA ARRAY
    // ==========================================================
    //
    // Hanya dataLama[] yang benar-benar dikirim yang dibuat.
    //
    // Khusus MUTASI_PENGGABUNGAN:
    // semua item disimpan.
    //
    // Field optional:
    //
    // alamatPemilikLama
    // blokPemilikLama
    // rtPemilikLama
    // rwPemilikLama
    // sertifikatLama
    //
    // akan menjadi null jika kosong.
    // ==========================================================

    const dataLamaCreate =
      jenisPermohonan === 'MUTASI_PENGGABUNGAN' &&
        validated.dataLama &&
        validated.dataLama.length > 0
        ? validated.dataLama.map((item, index) => ({
          nopLama:
            item.nopLama?.trim() || null,

          namaPemilikLama:
            item.namaPemilikLama?.trim() || null,

          alamatPemilikLama:
            item.alamatPemilikLama?.trim() || null,

          blokPemilikLama:
            item.blokPemilikLama?.trim() || null,

          rtPemilikLama:
            item.rtPemilikLama?.trim() || null,

          rwPemilikLama:
            item.rwPemilikLama?.trim() || null,

          kecamatanPemilikLama:
            item.kecamatanPemilikLama?.trim() || null,

          desaPemilikLama:
            item.desaPemilikLama?.trim() || null,

          alamatObjekLama:
            item.alamatObjekLama?.trim() || null,

          blokObjekLama:
            item.blokObjekLama?.trim() || null,

          rtObjekLama:
            item.rtObjekLama?.trim() || null,

          rwObjekLama:
            item.rwObjekLama?.trim() || null,

          kecamatanObjekLama:
            item.kecamatanObjekLama?.trim() || null,

          desaObjekLama:
            item.desaObjekLama?.trim() || null,

          luasTanahLama:
            item.luasTanahLama ?? 0,

          luasBangunanLama:
            item.luasBangunanLama ?? 0,

          sertifikatLama:
            item.sertifikatLama?.trim() || null,

          isUtama:
            item.isUtama ?? (index === 0),

          catatan:
            item.catatan?.trim() || null,
        }))
        : undefined;


    // ==========================================================
    // 11. NORMALISASI DATA BARU ARRAY
    // ==========================================================
    //
    // Data baru hanya dibuat jika layanan memang membutuhkan
    // data baru.
    //
    // Semua aturan required/optional sudah diperiksa
    // oleh permohonanSchema.
    //
    // nopBaru:
    // - OBJEK_PAJAK_BARU -> wajib
    // - layanan lainnya -> boleh null
    // ==========================================================

    const dataBaruCreate =
      needDataBaru &&
        validated.dataBaru &&
        validated.dataBaru.length > 0
        ? validated.dataBaru.map((item) => ({
          nopBaru:
            item.nopBaru?.trim() || null,

          namaPemilikBaru:
            item.namaPemilikBaru?.trim() || null,

          alamatPemilikBaru:
            item.alamatPemilikBaru?.trim() || null,

          blokPemilikBaru:
            item.blokPemilikBaru?.trim() || null,

          rtPemilikBaru:
            item.rtPemilikBaru?.trim() || null,

          rwPemilikBaru:
            item.rwPemilikBaru?.trim() || null,

          kecamatanPemilikBaru:
            item.kecamatanPemilikBaru?.trim() || null,

          desaPemilikBaru:
            item.desaPemilikBaru?.trim() || null,

          alamatObjekBaru:
            item.alamatObjekBaru?.trim() || null,

          blokObjekBaru:
            item.blokObjekBaru?.trim() || null,

          rtObjekBaru:
            item.rtObjekBaru?.trim() || null,

          rwObjekBaru:
            item.rwObjekBaru?.trim() || null,

          kecamatanObjekBaru:
            item.kecamatanObjekBaru?.trim() || null,

          desaObjekBaru:
            item.desaObjekBaru?.trim() || null,

          luasTanahBaru:
            item.luasTanahBaru ?? 0,

          luasBangunanBaru:
            item.luasBangunanBaru ?? 0,

          sertifikatBaru:
            item.sertifikatBaru?.trim() || null,

          catatan:
            item.catatan?.trim() || null,
        }))
        : undefined;


    // ==========================================================
    // 12. DATA LAMA SNAPSHOT PARENT
    // ==========================================================
    //
    // Penting:
    //
    // MUTASI_PENGGABUNGAN memiliki data lama berbentuk array.
    // Karena itu parent snapshot TIDAK mengambil data dari
    // validated.namaPemilikLama secara sembarangan.
    //
    // Untuk penggabungan:
    // parent snapshot menggunakan item pertama dari dataLama
    // hanya sebagai snapshot/representasi.
    //
    // Data lengkap tetap berada pada dataLama[].
    // ==========================================================

    let snapshotNamaPemilikLama:
      | string
      | null = null;

    let snapshotAlamatPemilikLama:
      | string
      | null = null;

    let snapshotBlokPemilikLama:
      | string
      | null = null;

    let snapshotRtPemilikLama:
      | string
      | null = null;

    let snapshotRwPemilikLama:
      | string
      | null = null;

    let snapshotKecamatanPemilikLama:
      | string
      | null = null;

    let snapshotDesaPemilikLama:
      | string
      | null = null;

    let snapshotAlamatObjekLama:
      | string
      | null = null;

    let snapshotBlokObjekLama:
      | string
      | null = null;

    let snapshotRtObjekLama:
      | string
      | null = null;

    let snapshotRwObjekLama:
      | string
      | null = null;

    let snapshotKecamatanObjekLama:
      | string
      | null = null;

    let snapshotDesaObjekLama:
      | string
      | null = null;

    let snapshotLuasTanahLama:
      | number
      | null = null;

    let snapshotLuasBangunanLama:
      | number
      | null = null;

    let snapshotSertifikatLama:
      | string
      | null = null;


    // ==========================================================
    // 13. SNAPSHOT UNTUK MUTASI PENGGABUNGAN
    // ==========================================================

    if (
      jenisPermohonan === 'MUTASI_PENGGABUNGAN' &&
      firstDataLama
    ) {

      snapshotNamaPemilikLama =
        firstDataLama.namaPemilikLama?.trim() || null;

      snapshotAlamatPemilikLama =
        firstDataLama.alamatPemilikLama?.trim() || null;

      snapshotBlokPemilikLama =
        firstDataLama.blokPemilikLama?.trim() || null;

      snapshotRtPemilikLama =
        firstDataLama.rtPemilikLama?.trim() || null;

      snapshotRwPemilikLama =
        firstDataLama.rwPemilikLama?.trim() || null;

      snapshotKecamatanPemilikLama =
        firstDataLama.kecamatanPemilikLama?.trim() || null;

      snapshotDesaPemilikLama =
        firstDataLama.desaPemilikLama?.trim() || null;

      snapshotAlamatObjekLama =
        firstDataLama.alamatObjekLama?.trim() || null;

      snapshotBlokObjekLama =
        firstDataLama.blokObjekLama?.trim() || null;

      snapshotRtObjekLama =
        firstDataLama.rtObjekLama?.trim() || null;

      snapshotRwObjekLama =
        firstDataLama.rwObjekLama?.trim() || null;

      snapshotKecamatanObjekLama =
        firstDataLama.kecamatanObjekLama?.trim() || null;

      snapshotDesaObjekLama =
        firstDataLama.desaObjekLama?.trim() || null;

      snapshotLuasTanahLama =
        firstDataLama.luasTanahLama ?? null;

      snapshotLuasBangunanLama =
        firstDataLama.luasBangunanLama ?? null;

      snapshotSertifikatLama =
        firstDataLama.sertifikatLama?.trim() || null;
    }


    // ==========================================================
    // 14. SNAPSHOT UNTUK LAYANAN SINGLE DATA LAMA
    // ==========================================================

    else if (needDataLama) {

      snapshotNamaPemilikLama =
        validated.namaPemilikLama?.trim() || null;

      snapshotAlamatPemilikLama =
        validated.alamatPemilikLama?.trim() || null;

      snapshotBlokPemilikLama =
        validated.blokPemilikLama?.trim() || null;

      snapshotRtPemilikLama =
        validated.rtPemilikLama?.trim() || null;

      snapshotRwPemilikLama =
        validated.rwPemilikLama?.trim() || null;

      snapshotKecamatanPemilikLama =
        validated.kecamatanPemilikLama?.trim() || null;

      snapshotDesaPemilikLama =
        validated.desaPemilikLama?.trim() || null;

      snapshotAlamatObjekLama =
        validated.alamatObjekLama?.trim() || null;

      snapshotBlokObjekLama =
        validated.blokObjekLama?.trim() || null;

      snapshotRtObjekLama =
        validated.rtObjekLama?.trim() || null;

      snapshotRwObjekLama =
        validated.rwObjekLama?.trim() || null;

      snapshotKecamatanObjekLama =
        validated.kecamatanObjekLama?.trim() || null;

      snapshotDesaObjekLama =
        validated.desaObjekLama?.trim() || null;

      snapshotLuasTanahLama =
        validated.luasTanahLama ?? null;

      snapshotLuasBangunanLama =
        validated.luasBangunanLama ?? null;

      snapshotSertifikatLama =
        validated.sertifikatLama?.trim() || null;
    }


    // ==========================================================
    // 15. CREATE PERMOHONAN
    // ==========================================================

    const permohonan = await prisma.permohonan.create({

      data: {

        // ------------------------------------------------------
        // IDENTITAS PERMOHONAN
        // ------------------------------------------------------

        nomorPermohonan,

        jenisPermohonan,

        status: 'SUBMITTED',

        namaWajibPajak:
          derivedNama,

        nop:
          normalizedNop,

        noWhatsapp:
          validated.noWhatsapp?.trim() || null,

        alamat:
          derivedAlamat,

        nomorPelayanan:
          validated.nomorPelayanan?.trim() || null,

        tanggalNoPelayanan:
          new Date(validated.tanggalNoPelayanan),

        tanggalPenyelesaian:
          validated.tanggalPenyelesaian
            ? new Date(validated.tanggalPenyelesaian)
            : null,


        // ------------------------------------------------------
        // SNAPSHOT DATA LAMA PADA PARENT
        // ------------------------------------------------------

        namaPemilikLama:
          snapshotNamaPemilikLama,

        alamatPemilikLama:
          snapshotAlamatPemilikLama,

        blokPemilikLama:
          snapshotBlokPemilikLama,

        rtPemilikLama:
          snapshotRtPemilikLama,

        rwPemilikLama:
          snapshotRwPemilikLama,

        kecamatanPemilikLama:
          snapshotKecamatanPemilikLama,

        desaPemilikLama:
          snapshotDesaPemilikLama,

        alamatObjekLama:
          snapshotAlamatObjekLama,

        blokObjekLama:
          snapshotBlokObjekLama,

        rtObjekLama:
          snapshotRtObjekLama,

        rwObjekLama:
          snapshotRwObjekLama,

        kecamatanObjekLama:
          snapshotKecamatanObjekLama,

        desaObjekLama:
          snapshotDesaObjekLama,

        luasTanahLama:
          snapshotLuasTanahLama,

        luasBangunanLama:
          snapshotLuasBangunanLama,

        sertifikatLama:
          snapshotSertifikatLama,


        // ------------------------------------------------------
        // RELASI DATA LAMA
        // ------------------------------------------------------

        dataLama:
          dataLamaCreate
            ? {
              create: dataLamaCreate,
            }
            : undefined,


        // ------------------------------------------------------
        // RELASI DATA BARU
        // ------------------------------------------------------

        dataBaru:
          dataBaruCreate
            ? {
              create: dataBaruCreate,
            }
            : undefined,


        // ------------------------------------------------------
        // PENGINPUT
        // ------------------------------------------------------

        penginputId:
          session.user.id,
      },

      include: {
        dataLama: true,
        dataBaru: true,
      },
    });


    // ==========================================================
    // 16. EFEK SAMPING
    // ==========================================================

    const readableJenis =
      jenisPermohonan.replace(/_/g, ' ');


    const whatsappMessage =
      `Permohonan ${readableJenis} Anda dengan nomor ` +
      `${nomorPermohonan} telah berhasil diajukan dan sedang ` +
      `dalam proses verifikasi.`;


    const notifTitle =
      'Permohonan Baru Diajukan';


    const notifPesan =
      `Permohonan ${readableJenis} nomor ` +
      `${validated.nomorPelayanan || nomorPermohonan} ` +
      `telah diinput dan siap diajukan untuk diteliti.`;


    await Promise.allSettled([

      // --------------------------------------------------------
      // WHATSAPP
      // --------------------------------------------------------

      sendWhatsApp(
        validated.noWhatsapp,
        whatsappMessage
      ),


      // --------------------------------------------------------
      // NOTIFIKASI PENELITI
      // --------------------------------------------------------

      notifyAllUsersOfRole(
        'PENELITI',
        notifTitle,
        notifPesan,
        {
          permohonanId: permohonan.id,
        }
      ),


      // --------------------------------------------------------
      // AUDIT LOG
      // --------------------------------------------------------

      prisma.auditLog.create({
        data: {
          entityType: 'PERMOHONAN',

          entityId:
            permohonan.id,

          aksi:
            'Membuat Permohonan Baru PBB',

          statusSebelum:
            null,

          statusSesudah:
            'SUBMITTED',

          pelakuId:
            session.user.id,

          metadata: {
            nomorPermohonan,

            nomorPelayanan:
              validated.nomorPelayanan,

            jenisPermohonan:
              jenisPermohonan,
          },
        },
      }),

    ]);


    // ==========================================================
    // 17. REVALIDATE
    // ==========================================================

    revalidatePath('/');


    // ==========================================================
    // 18. RESPONSE SUCCESS
    // ==========================================================

    return {
      success: true,
      permohonan,
    };

  } catch (error: unknown) {
    console.error(
      '[ACTION-CREATE-ERR]',
      error
    );

    let clientErrorMessage = 'Gagal menyimpan permohonan ke database.';

    if (error instanceof Error) {
      const msg = error.message;
      if (msg.includes('Invalid `prisma.permohonan.create()` invocation:')) {
        const lines = msg.split('\n').map(l => l.trim()).filter(Boolean);
        const detailLine = lines.slice().reverse().find(l =>
          !l.includes('~') &&
          !l.startsWith('{') &&
          !l.startsWith('}') &&
          !l.startsWith(']') &&
          !l.startsWith('[') &&
          !l.startsWith('data:') &&
          !l.includes('invocation:')
        );
        clientErrorMessage = detailLine ? `Gagal menyimpan: ${detailLine}` : 'Gagal menyimpan permohonan ke database. Mohon periksa kelengkapan isian.';
      } else {
        clientErrorMessage = msg;
      }
    }

    return {
      success: false,
      error: clientErrorMessage,
    };
  }
}

/**
 * Server Action: Memperbarui data permohonan PBB yang belum terkunci.
 * 
 * @param id - ID dokumen permohonan yang akan diubah
 * @param rawInput - Data permohonan baru dari formulir pengeditan
 * @returns Object `{ success: boolean, permohonan?: Permohonan, error?: string }`
 */
export async function updatePermohonan(id: string, rawInput: any) {
  const session = await getServerSession(authOptions);

  if (!session || !['PENGINPUT', 'SUPERVISOR'].includes(session.user.role)) {
    return { success: false, error: 'Unauthorized: Hanya peran PENGINPUT atau SUPERVISOR yang diizinkan mengubah data.' };
  }

  const validated = permohonanSchema.parse(rawInput);

  try {
    const existing = await prisma.permohonan.findUnique({
      where: { id },
      select: { status: true, bundleId: true, nop: true, nomorPelayanan: true, penginputId: true }
    });

    if (!existing) {
      return { success: false, error: 'Data permohonan tidak ditemukan.' };
    }

    // Verifikasi status: harus SUBMITTED & belum terbundel, ATAU berstatus REVISION
    const canUpdate = (existing.status === 'SUBMITTED' && !existing.bundleId) || existing.status === 'REVISION';

    if (!canUpdate) {
      return { success: false, error: 'Data permohonan sudah terkunci atau diproses ke dalam bundle, tidak dapat diedit.' };
    }

    // Pengecekan keunikan Nomor Pelayanan (Nopel) untuk permohonan lain
    const existingNopel = await prisma.permohonan.findFirst({
      where: {
        nomorPelayanan: validated.nomorPelayanan,
        id: { not: id }
      },
      select: { id: true, nomorPelayanan: true }
    });

    if (existingNopel) {
      return {
        success: false,
        error: `Nomor Pelayanan "${validated.nomorPelayanan}" sudah digunakan oleh permohonan lain.`
      };
    }

    const derivedNama = (validated.dataBaru && validated.dataBaru.length > 0)
      ? validated.dataBaru[0].namaPemilikBaru
      : (validated.namaPemilikLama || "");
    const derivedAlamat = (validated.dataBaru && validated.dataBaru.length > 0)
      ? formatAlamatLengkap({
        alamat: validated.dataBaru[0].alamatPemilikBaru,
        blok: validated.dataBaru[0].blokPemilikBaru,
        rt: validated.dataBaru[0].rtPemilikBaru,
        rw: validated.dataBaru[0].rwPemilikBaru
      })
      : formatAlamatLengkap({
        alamat: validated.namaPemilikLama ? validated.alamatPemilikLama : "",
        blok: validated.blokPemilikLama,
        rt: validated.rtPemilikLama,
        rw: validated.rwPemilikLama
      });

    const needDataLama = [
      'MUTASI_SEBAGIAN',
      'MUTASI_PENGGABUNGAN',
      'MUTASI_HABIS_UPDATE',
      'MUTASI_HABIS_REGULER',
      'PEMBETULAN',
      'PENGAKTIFAN'
    ].includes(validated.jenisPermohonan);

    const needDataBaru = [
      'MUTASI_SEBAGIAN',
      'MUTASI_PENGGABUNGAN',
      'MUTASI_HABIS_UPDATE',
      'MUTASI_HABIS_REGULER',
      'PEMBETULAN',
      'OBJEK_PAJAK_BARU'
    ].includes(validated.jenisPermohonan);

    // Update permohonan dan buat ulang dataLama & dataBaru menggunakan Prisma Transaction
    const permohonan = await prisma.$transaction(async (tx) => {
      // Hapus dataLama & dataBaru lama
      await tx.dataLama.deleteMany({
        where: { permohonanId: id }
      });
      await tx.dataBaru.deleteMany({
        where: { permohonanId: id }
      });

      // Update permohonan
      return await tx.permohonan.update({
        where: { id },
        data: {
          jenisPermohonan: validated.jenisPermohonan,
          namaWajibPajak: derivedNama,
          nop: validated.nop,
          noWhatsapp: validated.noWhatsapp,
          alamat: derivedAlamat,
          nomorPelayanan: validated.nomorPelayanan,
          tanggalNoPelayanan: new Date(validated.tanggalNoPelayanan),
          tanggalPenyelesaian: validated.tanggalPenyelesaian ? new Date(validated.tanggalPenyelesaian) : null,

          // Data Lama Snapshot
          namaPemilikLama: needDataLama ? (validated.namaPemilikLama?.trim() || null) : null,
          alamatPemilikLama: needDataLama ? (validated.alamatPemilikLama?.trim() || null) : null,
          blokPemilikLama: needDataLama ? (validated.blokPemilikLama?.trim() || null) : null,
          rtPemilikLama: needDataLama ? (validated.rtPemilikLama?.trim() || null) : null,
          rwPemilikLama: needDataLama ? (validated.rwPemilikLama?.trim() || null) : null,
          kecamatanPemilikLama: needDataLama ? (validated.kecamatanPemilikLama?.trim() || null) : null,
          desaPemilikLama: needDataLama ? (validated.desaPemilikLama?.trim() || null) : null,
          alamatObjekLama: needDataLama ? (validated.alamatObjekLama?.trim() || null) : null,
          blokObjekLama: needDataLama ? (validated.blokObjekLama?.trim() || null) : null,
          rtObjekLama: needDataLama ? (validated.rtObjekLama?.trim() || null) : null,
          rwObjekLama: needDataLama ? (validated.rwObjekLama?.trim() || null) : null,
          kecamatanObjekLama: needDataLama ? (validated.kecamatanObjekLama?.trim() || null) : null,
          desaObjekLama: needDataLama ? (validated.desaObjekLama?.trim() || null) : null,
          luasTanahLama: needDataLama ? validated.luasTanahLama : null,
          luasBangunanLama: needDataLama ? validated.luasBangunanLama : null,
          sertifikatLama: needDataLama ? (validated.sertifikatLama?.trim() || null) : null,

          // Data Lama (One-to-Many untuk Mutasi Penggabungan)
          dataLama: validated.dataLama && validated.dataLama.length > 0 ? {
            create: validated.dataLama.map((item, idx) => ({
              nopLama: item.nopLama?.trim() || null,
              namaPemilikLama: item.namaPemilikLama?.trim() || null,
              alamatPemilikLama: item.alamatPemilikLama?.trim() || null,
              blokPemilikLama: item.blokPemilikLama?.trim() || null,
              rtPemilikLama: item.rtPemilikLama?.trim() || null,
              rwPemilikLama: item.rwPemilikLama?.trim() || null,
              kecamatanPemilikLama: item.kecamatanPemilikLama?.trim() || null,
              desaPemilikLama: item.desaPemilikLama?.trim() || null,
              alamatObjekLama: item.alamatObjekLama?.trim() || null,
              blokObjekLama: item.blokObjekLama?.trim() || null,
              rtObjekLama: item.rtObjekLama?.trim() || null,
              rwObjekLama: item.rwObjekLama?.trim() || null,
              kecamatanObjekLama: item.kecamatanObjekLama?.trim() || null,
              desaObjekLama: item.desaObjekLama?.trim() || null,
              luasTanahLama: item.luasTanahLama ?? 0,
              luasBangunanLama: item.luasBangunanLama ?? 0,
              sertifikatLama: item.sertifikatLama?.trim() || null,
              isUtama: item.isUtama ?? (idx === 0),
              catatan: item.catatan?.trim() || null
            }))
          } : undefined,

          // Data Baru
          dataBaru: needDataBaru && validated.dataBaru ? {
            create: validated.dataBaru.map(item => ({
              nopBaru: item.nopBaru?.trim() || null,
              namaPemilikBaru: item.namaPemilikBaru?.trim() || null,
              alamatPemilikBaru: item.alamatPemilikBaru?.trim() || null,
              blokPemilikBaru: item.blokPemilikBaru?.trim() || null,
              rtPemilikBaru: item.rtPemilikBaru?.trim() || null,
              rwPemilikBaru: item.rwPemilikBaru?.trim() || null,
              kecamatanPemilikBaru: item.kecamatanPemilikBaru?.trim() || null,
              desaPemilikBaru: item.desaPemilikBaru?.trim() || null,
              alamatObjekBaru: item.alamatObjekBaru?.trim() || null,
              blokObjekBaru: item.blokObjekBaru?.trim() || null,
              rtObjekBaru: item.rtObjekBaru?.trim() || null,
              rwObjekBaru: item.rwObjekBaru?.trim() || null,
              kecamatanObjekBaru: item.kecamatanObjekBaru?.trim() || null,
              desaObjekBaru: item.desaObjekBaru?.trim() || null,
              luasTanahBaru: item.luasTanahBaru ?? 0,
              luasBangunanBaru: item.luasBangunanBaru ?? 0,
              sertifikatBaru: item.sertifikatBaru?.trim() || null,
              catatan: item.catatan?.trim() || null
            }))
          } : undefined
        },
        include: {
          dataLama: true,
          dataBaru: true
        }
      });
    }, {
      maxWait: 5000,
      timeout: 10000
    });

    // Catat Audit Log jika NOP / No Pelayanan berubah
    if (existing.nomorPelayanan !== validated.nomorPelayanan || existing.nop !== validated.nop) {
      await prisma.auditLog.create({
        data: {
          entityType: 'PERMOHONAN',
          entityId: permohonan.id,
          aksi: 'Mengupdate Nomor Pelayanan/NOP Permohonan',
          statusSebelum: existing.status,
          statusSesudah: existing.status,
          pelakuId: session.user.id,
          metadata: {
            oldNomorPelayanan: existing.nomorPelayanan,
            newNomorPelayanan: validated.nomorPelayanan,
            oldNop: existing.nop,
            newNop: validated.nop
          }
        }
      });
    }

    revalidatePath('/');
    return { success: true, permohonan };
  } catch (error: any) {
    console.error('[ACTION-UPDATE-ERR]', error);
    return { success: false, error: error.message || 'Gagal memperbarui permohonan.' };
  }
}


/* ============================================================================
 * BAGIAN 4: SERVER ACTIONS - WORKFLOW & REVISI PERMOHONAN
 * ============================================================================ */

/**
 * Server Action: Mengajukan ulang permohonan yang telah diperbaiki dari status REVISION kembali ke SUBMITTED.
 * 
 * @param id - ID dokumen permohonan yang diajukan ulang
 * @returns Object `{ success: boolean, permohonan?: Permohonan, error?: string }`
 */
export async function resubmitPermohonan(id: string) {
  const session = await getServerSession(authOptions);

  if (!session || !['PENGINPUT', 'SUPERVISOR'].includes(session.user.role)) {
    return { success: false, error: 'Unauthorized: Hanya peran PENGINPUT atau SUPERVISOR yang diizinkan melakukan resubmit data.' };
  }

  try {
    const existing = await prisma.permohonan.findUnique({
      where: { id },
      select: { status: true, nomorPermohonan: true, nomorPelayanan: true, noWhatsapp: true, jenisPermohonan: true }
    });

    if (!existing) {
      return { success: false, error: 'Data permohonan tidak ditemukan.' };
    }

    if (existing.status !== 'REVISION') {
      return { success: false, error: 'Permohonan tidak berstatus REVISION. Resubmit tidak dapat dilakukan.' };
    }

    // Update status ke SUBMITTED
    const permohonan = await prisma.permohonan.update({
      where: { id },
      data: { status: 'SUBMITTED' }
    });

    // Jalankan efek samping (WhatsApp, Notifikasi In-App, Audit Log) secara paralel
    const readableJenis = existing.jenisPermohonan.replace(/_/g, ' ');
    const whatsappMessage = `Permohonan ${readableJenis} Anda dengan nomor ${existing.nomorPermohonan} telah berhasil diterima dan sedang dalam proses verifikasi.`;
    const notifTitle = 'Resubmit Permohonan';
    const notifPesan = `Permohonan ${readableJenis} nomor ${existing.nomorPelayanan || existing.nomorPermohonan} telah diperbaiki oleh Penginput dan siap diverifikasi kembali.`;

    await Promise.allSettled([
      sendWhatsApp(existing.noWhatsapp, whatsappMessage),
      notifyAllUsersOfRole('PENELITI', notifTitle, notifPesan, { permohonanId: id }),
      prisma.auditLog.create({
        data: {
          entityType: 'PERMOHONAN',
          entityId: id,
          aksi: 'Resubmit Permohonan Hasil Revisi',
          statusSebelum: 'REVISION',
          statusSesudah: 'SUBMITTED',
          pelakuId: session.user.id,
          metadata: { nomorPermohonan: existing.nomorPermohonan }
        }
      })
    ]);

    revalidatePath('/');
    return { success: true, permohonan };
  } catch (error: any) {
    console.error('[ACTION-RESUBMIT-ERR]', error);
    return { success: false, error: error.message || 'Gagal melakukan resubmit permohonan.' };
  }
}


/* ============================================================================
 * BAGIAN 5: SERVER ACTIONS - QUERY & STATISTIK PENGINPUT
 * ============================================================================ */

/**
 * Server Action: Mengambil seluruh daftar permohonan PBB secara global untuk workspace Penginput.
 * 
 * @returns Object `{ success: boolean, list: Permohonan[], error?: string }`
 */
export async function getPenginputPermohonan() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return { success: false, list: [], error: 'Unauthorized: Sesi tidak ditemukan.' };
  }

  try {
    const list = await prisma.permohonan.findMany({
      include: {
        dataBaru: true,
        penginput: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        permintaanKoreksi: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return { success: true, list };
  } catch (error: any) {
    console.error('[ACTION-GET-ERR]', error);
    return { success: false, list: [], error: 'Gagal mengambil data permohonan.' };
  }
}

/**
 * Server Action: Mengubah status favorit (Bintang) pada permohonan PBB.
 * 
 * @param id - ID permohonan yang ditandai/dilepas favorit
 * @returns Object `{ success: boolean, isFavorite?: boolean, error?: string }`
 */
export async function togglePermohonanFavorite(id: string) {
  const session = await getServerSession(authOptions);

  if (!session || !['PENGINPUT', 'PENELITI', 'SUPERVISOR'].includes(session.user.role)) {
    return { success: false, error: 'Unauthorized: Peran Anda tidak memiliki akses untuk menandai favorit.' };
  }

  try {
    const existing = await prisma.permohonan.findUnique({
      where: { id },
      select: { isFavorite: true }
    });

    if (!existing) {
      return { success: false, error: 'Permohonan tidak ditemukan.' };
    }

    const updated = await prisma.permohonan.update({
      where: { id },
      data: { isFavorite: !existing.isFavorite }
    });

    revalidatePath('/');
    return { success: true, isFavorite: updated.isFavorite };
  } catch (error: any) {
    console.error('[ACTION-TOGGLE-FAVORITE-ERR]', error);
    return { success: false, error: error.message || 'Gagal mengubah status favorit.' };
  }
}

/**
 * Server Action: Mengambil seluruh permohonan PBB yang berstatus REVISION.
 */
export async function getRevisionPermohonans() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return { success: false, list: [], error: 'Unauthorized: Sesi tidak ditemukan.' };
  }

  try {
    const list = await prisma.permohonan.findMany({
      where: { status: 'REVISION' },
      include: {
        dataBaru: true,
        penginput: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return { success: true, list };
  } catch (error: any) {
    console.error('[ACTION-GET-REVISIONS-ERR]', error);
    return { success: false, list: [], error: 'Gagal mengambil data revisi permohonan.' };
  }
}

/**
 * Server Action: Mengambil permohonan PBB terbaru (termasuk jumlah SUBMITTED).
 */
export async function getLatestPermohonans(limit = 10) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return { success: false, list: [], submittedCount: 0, error: 'Unauthorized: Sesi tidak ditemukan.' };
  }

  try {
    const [list, submittedCount] = await Promise.all([
      prisma.permohonan.findMany({
        include: {
          dataBaru: true,
          penginput: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      }),
      prisma.permohonan.count({ where: { status: 'SUBMITTED' } })
    ]);

    return { success: true, list, submittedCount };
  } catch (error: any) {
    console.error('[ACTION-GET-LATEST-ERR]', error);
    return { success: false, list: [], submittedCount: 0, error: 'Gagal mengambil data permohonan terbaru.' };
  }
}

/**
 * Server Action: Mengambil ringkasan statistik permohonan berdasarkan status untuk widget statistik Penginput.
 */
export async function getPermohonanStats() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return { success: false, error: 'Unauthorized: Sesi tidak ditemukan.' };
  }

  try {
    const groupedStats = await prisma.permohonan.groupBy({
      by: ['status'],
      _count: {
        _all: true
      }
    });

    let total = 0;
    const statsMap: Record<string, number> = {
      SUBMITTED: 0,
      REVISION: 0,
      BUNDLED: 0,
      ARCHIVED: 0,
      COMPLETED: 0,
      REJECTED: 0
    };

    for (const group of groupedStats) {
      const count = group._count._all;
      total += count;
      if (group.status) {
        statsMap[group.status] = count;
      }
    }

    return {
      success: true,
      stats: {
        total,
        submitted: statsMap.SUBMITTED,
        revision: statsMap.REVISION,
        bundled: statsMap.BUNDLED,
        archived: statsMap.ARCHIVED,
        completed: statsMap.COMPLETED,
        rejected: statsMap.REJECTED
      }
    };
  } catch (error: any) {
    console.error('[ACTION-GET-STATS-ERR]', error);
    return { success: false, error: 'Gagal mengambil statistik permohonan.' };
  }
}

/**
 * Server Action: Mengambil seluruh permohonan PBB yang ditandai sebagai favorit.
 */
export async function getFavoritePermohonans() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return { success: false, error: 'Unauthorized: Sesi tidak ditemukan.', list: [] };
  }

  try {
    const list = await prisma.permohonan.findMany({
      where: { isFavorite: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        nomorPelayanan: true,
        nomorPermohonan: true,
        isFavorite: true,
      }
    });

    return { success: true, list };
  } catch (error: any) {
    console.error('[ACTION-GET-FAVORITES-ERR]', error);
    return { success: false, error: 'Gagal mengambil data favorit.', list: [] };
  }
}


/* ============================================================================
 * BAGIAN 6: DELEGASI ACTIONS BERANDA (BACKWARD COMPATIBILITY)
 * ============================================================================ */

/**
 * Server Action: Mengambil statistik global Beranda (Didelegasikan ke app/actions/beranda.ts)
 */
export async function getGlobalBerandaStats() {
  return getGlobalBerandaStatsFromBeranda();
}
