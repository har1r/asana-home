"use server";

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendWhatsApp } from '@/lib/fonnte';
import { notifyAllUsersOfRole } from '@/lib/notifications';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getGlobalBerandaStats as getGlobalBerandaStatsFromBeranda } from './beranda';
import { randomInt } from 'crypto';

import { formatAlamatLengkap } from '@/components/workspaces/shared/constants';

/* ============================================================================
 * BAGIAN 1: SKEMA VALIDASI ZOD & SANITASI INPUT DATA
 * ============================================================================ */

/**
 * Skema Validasi Zod untuk setiap item Objek Pajak / Pemohon Baru (Pecahan).
 * Dilengkapi sanitasi otomatis `.trim()` untuk keamanan data.
 */
const dataBaruItemSchema = z.object({
  namaPemilikBaru: z.string().trim().min(1, 'Nama pemilik baru wajib diisi'),
  alamatPemilikBaru: z.string().trim().min(1, 'Alamat pemilik baru wajib diisi'),
  blokPemilikBaru: z.string().optional().nullable(),
  rtPemilikBaru: z.string().optional().nullable(),
  rwPemilikBaru: z.string().optional().nullable(),
  kecamatanPemilikBaru: z.string().trim().min(1, 'Kecamatan pemilik baru wajib diisi'),
  desaPemilikBaru: z.string().trim().min(1, 'Desa pemilik baru wajib diisi'),
  alamatObjekBaru: z.string().trim().min(1, 'Alamat objek baru wajib diisi'),
  blokObjekBaru: z.string().optional().nullable(),
  rtObjekBaru: z.string().optional().nullable(),
  rwObjekBaru: z.string().optional().nullable(),
  kecamatanObjekBaru: z.string().trim().min(1, 'Kecamatan objek baru wajib diisi'),
  desaObjekBaru: z.string().trim().min(1, 'Desa objek baru wajib diisi'),
  luasTanahBaru: z.coerce.number().min(0, 'Luas tanah baru harus >= 0'),
  luasBangunanBaru: z.coerce.number().min(0, 'Luas bangunan baru harus >= 0'),
  sertifikatBaru: z.string().trim().min(1, 'Sertifikat baru wajib diisi')
});

/**
 * Skema Validasi Utama Zod untuk Pembuatan/Penyuntingan Permohonan PBB.
 * Memastikan jenis permohonan, format NOP 18-digit, dan nomor WhatsApp valid.
 */
const permohonanSchema = z.object({
  jenisPermohonan: z.enum([
    'MUTASI_SEBAGIAN',
    'MUTASI_HABIS_UPDATE',
    'MUTASI_HABIS_REGULER',
    'OBJEK_PAJAK_BARU',
    'PEMBETULAN',
    'PENGAKTIFAN'
  ] as const),
  nomorPelayanan: z.string().trim().min(1, 'Nomor pelayanan wajib diisi'),
  tanggalNoPelayanan: z.string().trim().min(1, 'Tanggal pelayanan wajib diisi'),
  tanggalPenyelesaian: z.string().trim().min(1, 'Tanggal penyelesaian wajib diisi'),
  nop: z.string().trim().regex(/^\d{18}$/, 'NOP harus terdiri dari 18 digit angka'),
  noWhatsapp: z.string().trim().regex(/^(08|628)\d{8,12}$/, 'Nomor WhatsApp tidak valid (contoh: 08123456789)'),

  // Data Lama
  namaPemilikLama: z.string().optional().nullable(),
  alamatPemilikLama: z.string().optional().nullable(),
  blokPemilikLama: z.string().optional().nullable(),
  rtPemilikLama: z.string().optional().nullable(),
  rwPemilikLama: z.string().optional().nullable(),
  kecamatanPemilikLama: z.string().optional().nullable(),
  desaPemilikLama: z.string().optional().nullable(),
  alamatObjekLama: z.string().optional().nullable(),
  blokObjekLama: z.string().optional().nullable(),
  rtObjekLama: z.string().optional().nullable(),
  rwObjekLama: z.string().optional().nullable(),
  kecamatanObjekLama: z.string().optional().nullable(),
  desaObjekLama: z.string().optional().nullable(),
  luasTanahLama: z.coerce.number().optional().nullable(),
  luasBangunanLama: z.coerce.number().optional().nullable(),
  sertifikatLama: z.string().optional().nullable(),

  // Data Baru
  dataBaru: z.array(dataBaruItemSchema).optional()
}).superRefine((data, ctx) => {
  const { jenisPermohonan } = data;

  const needDataLama = [
    'MUTASI_SEBAGIAN',
    'MUTASI_HABIS_UPDATE',
    'MUTASI_HABIS_REGULER',
    'PEMBETULAN',
    'PENGAKTIFAN'
  ].includes(jenisPermohonan);

  if (needDataLama) {
    if (!data.namaPemilikLama?.trim()) ctx.addIssue({ code: 'custom', message: 'Nama pemilik lama wajib diisi', path: ['namaPemilikLama'] });
    if (!data.alamatPemilikLama?.trim()) ctx.addIssue({ code: 'custom', message: 'Alamat pemilik lama wajib diisi', path: ['alamatPemilikLama'] });
    if (!data.kecamatanPemilikLama?.trim()) ctx.addIssue({ code: 'custom', message: 'Kecamatan pemilik lama wajib diisi', path: ['kecamatanPemilikLama'] });
    if (!data.desaPemilikLama?.trim()) ctx.addIssue({ code: 'custom', message: 'Desa pemilik lama wajib diisi', path: ['desaPemilikLama'] });
    if (!data.alamatObjekLama?.trim()) ctx.addIssue({ code: 'custom', message: 'Alamat objek lama wajib diisi', path: ['alamatObjekLama'] });
    if (!data.kecamatanObjekLama?.trim()) ctx.addIssue({ code: 'custom', message: 'Kecamatan objek lama wajib diisi', path: ['kecamatanObjekLama'] });
    if (!data.desaObjekLama?.trim()) ctx.addIssue({ code: 'custom', message: 'Desa objek lama wajib diisi', path: ['desaObjekLama'] });
    if (data.luasTanahLama === undefined || data.luasTanahLama === null || data.luasTanahLama < 0) {
      ctx.addIssue({ code: 'custom', message: 'Luas tanah lama harus >= 0', path: ['luasTanahLama'] });
    }
    if (data.luasBangunanLama === undefined || data.luasBangunanLama === null || data.luasBangunanLama < 0) {
      ctx.addIssue({ code: 'custom', message: 'Luas bangunan lama harus >= 0', path: ['luasBangunanLama'] });
    }
    if (!data.sertifikatLama?.trim()) ctx.addIssue({ code: 'custom', message: 'Sertifikat lama wajib diisi', path: ['sertifikatLama'] });
  }

  const needDataBaru = [
    'MUTASI_SEBAGIAN',
    'MUTASI_HABIS_UPDATE',
    'MUTASI_HABIS_REGULER',
    'PEMBETULAN',
    'OBJEK_PAJAK_BARU'
  ].includes(jenisPermohonan);

  if (needDataBaru) {
    if (!data.dataBaru || data.dataBaru.length === 0) {
      ctx.addIssue({ code: 'custom', message: 'Minimal 1 data pemilik baru wajib diisi', path: ['dataBaru'] });
    } else {
      if (jenisPermohonan !== 'MUTASI_SEBAGIAN' && data.dataBaru.length > 1) {
        ctx.addIssue({ code: 'custom', message: 'Hanya Mutasi Sebagian yang diperbolehkan memiliki lebih dari 1 pemilik baru', path: ['dataBaru'] });
      }
    }
  }
});


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
 * @param rawInput - Data mentah permohonan dari formulir input
 * @returns Object `{ success: boolean, permohonan?: Permohonan, error?: string }`
 */
export async function createPermohonan(rawInput: any) {
  const session = await getServerSession(authOptions);

  if (!session || !['PENGINPUT', 'SUPERVISOR'].includes(session.user.role)) {
    return { success: false, error: 'Unauthorized: Hanya peran PENGINPUT atau SUPERVISOR yang diizinkan menginput data.' };
  }

  // Parse dan validasi data input
  const validated = permohonanSchema.parse(rawInput);
  const nomorPermohonan = await generateUniqueNomorPermohonan();

  try {
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
      'MUTASI_HABIS_UPDATE',
      'MUTASI_HABIS_REGULER',
      'PEMBETULAN',
      'PENGAKTIFAN'
    ].includes(validated.jenisPermohonan);

    const needDataBaru = [
      'MUTASI_SEBAGIAN',
      'MUTASI_HABIS_UPDATE',
      'MUTASI_HABIS_REGULER',
      'PEMBETULAN',
      'OBJEK_PAJAK_BARU'
    ].includes(validated.jenisPermohonan);

    const permohonan = await prisma.permohonan.create({
      data: {
        nomorPermohonan,
        jenisPermohonan: validated.jenisPermohonan,
        status: 'SUBMITTED',
        namaWajibPajak: derivedNama,
        nop: validated.nop,
        noWhatsapp: validated.noWhatsapp,
        alamat: derivedAlamat,
        nomorPelayanan: validated.nomorPelayanan,
        tanggalNoPelayanan: new Date(validated.tanggalNoPelayanan),
        tanggalPenyelesaian: validated.tanggalPenyelesaian ? new Date(validated.tanggalPenyelesaian) : null,

        // Data Lama
        namaPemilikLama: needDataLama ? validated.namaPemilikLama : null,
        alamatPemilikLama: needDataLama ? validated.alamatPemilikLama : null,
        blokPemilikLama: needDataLama ? validated.blokPemilikLama : null,
        rtPemilikLama: needDataLama ? validated.rtPemilikLama : null,
        rwPemilikLama: needDataLama ? validated.rwPemilikLama : null,
        kecamatanPemilikLama: needDataLama ? validated.kecamatanPemilikLama : null,
        desaPemilikLama: needDataLama ? validated.desaPemilikLama : null,
        alamatObjekLama: needDataLama ? validated.alamatObjekLama : null,
        blokObjekLama: needDataLama ? validated.blokObjekLama : null,
        rtObjekLama: needDataLama ? validated.rtObjekLama : null,
        rwObjekLama: needDataLama ? validated.rwObjekLama : null,
        kecamatanObjekLama: needDataLama ? validated.kecamatanObjekLama : null,
        desaObjekLama: needDataLama ? validated.desaObjekLama : null,
        luasTanahLama: needDataLama ? validated.luasTanahLama : null,
        luasBangunanLama: needDataLama ? validated.luasBangunanLama : null,
        sertifikatLama: needDataLama ? validated.sertifikatLama : null,

        // Data Baru (One-to-Many)
        dataBaru: needDataBaru && validated.dataBaru ? {
          create: validated.dataBaru.map(item => ({
            namaPemilikBaru: item.namaPemilikBaru,
            alamatPemilikBaru: item.alamatPemilikBaru,
            blokPemilikBaru: item.blokPemilikBaru || null,
            rtPemilikBaru: item.rtPemilikBaru || null,
            rwPemilikBaru: item.rwPemilikBaru || null,
            kecamatanPemilikBaru: item.kecamatanPemilikBaru,
            desaPemilikBaru: item.desaPemilikBaru,
            alamatObjekBaru: item.alamatObjekBaru,
            blokObjekBaru: item.blokObjekBaru || null,
            rtObjekBaru: item.rtObjekBaru || null,
            rwObjekBaru: item.rwObjekBaru || null,
            kecamatanObjekBaru: item.kecamatanObjekBaru,
            desaObjekBaru: item.desaObjekBaru,
            luasTanahBaru: item.luasTanahBaru,
            luasBangunanBaru: item.luasBangunanBaru,
            sertifikatBaru: item.sertifikatBaru
          }))
        } : undefined,

        penginputId: session.user.id
      },
      include: {
        dataBaru: true
      }
    });

    // Jalankan efek samping (WhatsApp, Notifikasi In-App, Audit Log) secara paralel
    const readableJenis = validated.jenisPermohonan.replace(/_/g, ' ');
    const whatsappMessage = `Permohonan ${readableJenis} Anda dengan nomor ${nomorPermohonan} telah berhasil diajukan dan sedang dalam proses verifikasi.`;
    const notifTitle = 'Permohonan Baru Diajukan';
    const notifPesan = `Permohonan ${readableJenis} nomor ${validated.nomorPelayanan || nomorPermohonan} telah diinput dan siap diajukan untuk diteliti.`;

    await Promise.allSettled([
      sendWhatsApp(validated.noWhatsapp, whatsappMessage),
      notifyAllUsersOfRole('PENELITI', notifTitle, notifPesan, { permohonanId: permohonan.id }),
      prisma.auditLog.create({
        data: {
          entityType: 'PERMOHONAN',
          entityId: permohonan.id,
          aksi: 'Membuat Permohonan Baru PBB',
          statusSebelum: null,
          statusSesudah: 'SUBMITTED',
          pelakuId: session.user.id,
          metadata: { nomorPermohonan, jenisPermohonan: validated.jenisPermohonan }
        }
      })
    ]);

    revalidatePath('/');
    return { success: true, permohonan };
  } catch (error: any) {
    console.error('[ACTION-CREATE-ERR]', error);
    return { success: false, error: error.message || 'Gagal menyimpan permohonan ke database.' };
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
      'MUTASI_HABIS_UPDATE',
      'MUTASI_HABIS_REGULER',
      'PEMBETULAN',
      'PENGAKTIFAN'
    ].includes(validated.jenisPermohonan);

    const needDataBaru = [
      'MUTASI_SEBAGIAN',
      'MUTASI_HABIS_UPDATE',
      'MUTASI_HABIS_REGULER',
      'PEMBETULAN',
      'OBJEK_PAJAK_BARU'
    ].includes(validated.jenisPermohonan);

    // Update permohonan dan buat ulang dataBaru menggunakan Prisma Transaction
    const permohonan = await prisma.$transaction(async (tx) => {
      // Hapus dataBaru lama
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

          // Data Lama
          namaPemilikLama: needDataLama ? validated.namaPemilikLama : null,
          alamatPemilikLama: needDataLama ? validated.alamatPemilikLama : null,
          blokPemilikLama: needDataLama ? validated.blokPemilikLama : null,
          rtPemilikLama: needDataLama ? validated.rtPemilikLama : null,
          rwPemilikLama: needDataLama ? validated.rwPemilikLama : null,
          kecamatanPemilikLama: needDataLama ? validated.kecamatanPemilikLama : null,
          desaPemilikLama: needDataLama ? validated.desaPemilikLama : null,
          alamatObjekLama: needDataLama ? validated.alamatObjekLama : null,
          blokObjekLama: needDataLama ? validated.blokObjekLama : null,
          rtObjekLama: needDataLama ? validated.rtObjekLama : null,
          rwObjekLama: needDataLama ? validated.rwObjekLama : null,
          kecamatanObjekLama: needDataLama ? validated.kecamatanObjekLama : null,
          desaObjekLama: needDataLama ? validated.desaObjekLama : null,
          luasTanahLama: needDataLama ? validated.luasTanahLama : null,
          luasBangunanLama: needDataLama ? validated.luasBangunanLama : null,
          sertifikatLama: needDataLama ? validated.sertifikatLama : null,

          // Data Baru
          dataBaru: needDataBaru && validated.dataBaru ? {
            create: validated.dataBaru.map(item => ({
              namaPemilikBaru: item.namaPemilikBaru,
              alamatPemilikBaru: item.alamatPemilikBaru,
              blokPemilikBaru: item.blokPemilikBaru || null,
              rtPemilikBaru: item.rtPemilikBaru || null,
              rwPemilikBaru: item.rwPemilikBaru || null,
              kecamatanPemilikBaru: item.kecamatanPemilikBaru,
              desaPemilikBaru: item.desaPemilikBaru,
              alamatObjekBaru: item.alamatObjekBaru,
              blokObjekBaru: item.blokObjekBaru || null,
              rtObjekBaru: item.rtObjekBaru || null,
              rwObjekBaru: item.rwObjekBaru || null,
              kecamatanObjekBaru: item.kecamatanObjekBaru,
              desaObjekBaru: item.desaObjekBaru,
              luasTanahBaru: item.luasTanahBaru,
              luasBangunanBaru: item.luasBangunanBaru,
              sertifikatBaru: item.sertifikatBaru
            }))
          } : undefined
        },
        include: {
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
 * Server Action: Mengambil seluruh daftar permohonan PBB yang diinput oleh pengguna yang sedang login.
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
      where: {
        penginputId: session.user.id
      },
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
