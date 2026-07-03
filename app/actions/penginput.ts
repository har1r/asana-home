"use server";

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendWhatsApp } from '@/lib/fonnte';
import { notifyAllUsersOfRole } from '@/lib/notifications';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';


// Zod Schema for PBB Permohonan input validation
const dataBaruItemSchema = z.object({
  namaPemilikBaru: z.string().min(1, 'Nama pemilik baru wajib diisi'),
  alamatPemilikBaru: z.string().min(1, 'Alamat pemilik baru wajib diisi'),
  kecamatanPemilikBaru: z.string().min(1, 'Kecamatan pemilik baru wajib diisi'),
  desaPemilikBaru: z.string().min(1, 'Desa pemilik baru wajib diisi'),
  alamatObjekBaru: z.string().min(1, 'Alamat objek baru wajib diisi'),
  kecamatanObjekBaru: z.string().min(1, 'Kecamatan objek baru wajib diisi'),
  desaObjekBaru: z.string().min(1, 'Desa objek baru wajib diisi'),
  luasTanahBaru: z.coerce.number().min(0, 'Luas tanah baru harus >= 0'),
  luasBangunanBaru: z.coerce.number().min(0, 'Luas bangunan baru harus >= 0'),
  sertifikatBaru: z.string().min(1, 'Sertifikat baru wajib diisi')
});

const permohonanSchema = z.object({
  jenisPermohonan: z.enum([
    'MUTASI_SEBAGIAN',
    'MUTASI_HABIS_UPDATE',
    'MUTASI_HABIS_REGULER',
    'OBJEK_PAJAK_BARU',
    'PEMBETULAN',
    'PENGAKTIFAN'
  ] as const),
  nomorPelayanan: z.string().min(1, 'Nomor pelayanan wajib diisi'),
  nop: z.string().regex(/^\d{18}$/, 'NOP harus terdiri dari 18 digit angka'),
  noWhatsapp: z.string().regex(/^(08|628)\d{8,12}$/, 'Nomor WhatsApp tidak valid (contoh: 08123456789)'),

  // Data Lama
  namaPemilikLama: z.string().optional().nullable(),
  alamatPemilikLama: z.string().optional().nullable(),
  kecamatanPemilikLama: z.string().optional().nullable(),
  desaPemilikLama: z.string().optional().nullable(),
  alamatObjekLama: z.string().optional().nullable(),
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

/**
 * Helper to generate a unique tracking number: PMH-YYYYMMDD-[4 Random Digits]
 */
async function generateUniqueNomorPermohonan(): Promise<string> {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  let nomor = '';
  let isUnique = false;
  let attempts = 0;

  while (!isUnique && attempts < 10) {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    nomor = `PMH-${dateStr}-${randomDigits}`;

    const existing = await prisma.permohonan.findUnique({
      where: { nomorPermohonan: nomor },
      select: { id: true }
    });

    if (!existing) {
      isUnique = true;
    }
    attempts++;
  }
  return nomor;
}

/**
 * Server Action: Create a new PBB Permohonan entry (Fase 1)
 */
export async function createPermohonan(rawInput: any) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'PENGINPUT') {
    throw new Error('Unauthorized: Hanya peran PENGINPUT yang diizinkan untuk menginput data.');
  }

  // Parse and validate input data
  const validated = permohonanSchema.parse(rawInput);
  const nomorPermohonan = await generateUniqueNomorPermohonan();

  try {
    const derivedNama = (validated.dataBaru && validated.dataBaru.length > 0)
      ? validated.dataBaru[0].namaPemilikBaru
      : (validated.namaPemilikLama || "");
    const derivedAlamat = (validated.dataBaru && validated.dataBaru.length > 0)
      ? validated.dataBaru[0].alamatPemilikBaru
      : (validated.alamatPemilikLama || "");

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

        // Data Lama
        namaPemilikLama: needDataLama ? validated.namaPemilikLama : null,
        alamatPemilikLama: needDataLama ? validated.alamatPemilikLama : null,
        kecamatanPemilikLama: needDataLama ? validated.kecamatanPemilikLama : null,
        desaPemilikLama: needDataLama ? validated.desaPemilikLama : null,
        alamatObjekLama: needDataLama ? validated.alamatObjekLama : null,
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

        penginputId: session.user.id
      }
    });

    // Send WhatsApp notification to the taxpayer
    const readableJenis = validated.jenisPermohonan.replace(/_/g, ' ');
    const whatsappMessage = `Permohonan ${readableJenis} Anda dengan nomor ${nomorPermohonan} telah berhasil diterima dan sedang dalam proses verifikasi.`;
    await sendWhatsApp(validated.noWhatsapp, whatsappMessage);

    // Optional Audit Log for record keeping
    await prisma.auditLog.create({
      data: {
        entityType: 'PERMOHONAN',
        entityId: permohonan.id,
        aksi: 'Membuat Permohonan Baru PBB',
        statusSebelum: null,
        statusSesudah: 'SUBMITTED',
        pelakuId: session.user.id,
        metadata: { nomorPermohonan, jenisPermohonan: validated.jenisPermohonan }
      }
    });

    revalidatePath('/');
    return { success: true, permohonan };
  } catch (error: any) {
    console.error('[ACTION-CREATE-ERR]', error);
    return { success: false, error: error.message || 'Gagal menyimpan permohonan ke database.' };
  }
}

/**
 * Server Action: Update an existing Permohonan
 */
export async function updatePermohonan(id: string, rawInput: any) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'PENGINPUT') {
    throw new Error('Unauthorized: Hanya peran PENGINPUT yang diizinkan untuk mengubah data.');
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

    // Verify constraints: status must be SUBMITTED and bundleId must be null, OR status must be REVISION
    const canUpdate = (existing.status === 'SUBMITTED' && !existing.bundleId) || existing.status === 'REVISION';

    if (!canUpdate) {
      return { success: false, error: 'Data permohonan sudah terkunci atau diproses ke dalam bundle, tidak dapat diedit.' };
    }

    const derivedNama = (validated.dataBaru && validated.dataBaru.length > 0)
      ? validated.dataBaru[0].namaPemilikBaru
      : (validated.namaPemilikLama || "");
    const derivedAlamat = (validated.dataBaru && validated.dataBaru.length > 0)
      ? validated.dataBaru[0].alamatPemilikBaru
      : (validated.alamatPemilikLama || "");

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

    // Update permohonan and recreate dataBaru
    const permohonan = await prisma.$transaction(async (tx) => {
      // Delete old dataBaru entries
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

          // Data Lama
          namaPemilikLama: needDataLama ? validated.namaPemilikLama : null,
          alamatPemilikLama: needDataLama ? validated.alamatPemilikLama : null,
          kecamatanPemilikLama: needDataLama ? validated.kecamatanPemilikLama : null,
          desaPemilikLama: needDataLama ? validated.desaPemilikLama : null,
          alamatObjekLama: needDataLama ? validated.alamatObjekLama : null,
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
              kecamatanPemilikBaru: item.kecamatanPemilikBaru,
              desaPemilikBaru: item.desaPemilikBaru,
              alamatObjekBaru: item.alamatObjekBaru,
              kecamatanObjekBaru: item.kecamatanObjekBaru,
              desaObjekBaru: item.desaObjekBaru,
              luasTanahBaru: item.luasTanahBaru,
              luasBangunanBaru: item.luasBangunanBaru,
              sertifikatBaru: item.sertifikatBaru
            }))
          } : undefined
        }
      });
    });

    // Create Audit Log if critical fields were updated
    const isCriticalFieldUpdated = existing.nomorPelayanan !== validated.nomorPelayanan || existing.nop !== validated.nop;
    if (isCriticalFieldUpdated) {
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

/**
 * Server Action: Explicitly resubmit a permohonan that requires revision (REVISION -> SUBMITTED)
 */
export async function resubmitPermohonan(id: string) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'PENGINPUT') {
    throw new Error('Unauthorized: Hanya peran PENGINPUT yang diizinkan untuk resubmit data.');
  }

  try {
    const existing = await prisma.permohonan.findUnique({
      where: { id },
      select: { status: true, nomorPermohonan: true, noWhatsapp: true, jenisPermohonan: true }
    });

    if (!existing) {
      return { success: false, error: 'Data permohonan tidak ditemukan.' };
    }

    if (existing.status !== 'REVISION') {
      return { success: false, error: 'Permohonan tidak berstatus REVISION. Resubmit tidak dapat dilakukan.' };
    }

    // Update status to SUBMITTED
    const permohonan = await prisma.permohonan.update({
      where: { id },
      data: { status: 'SUBMITTED' }
    });

    // 1. Send WhatsApp notification to the taxpayer
    const readableJenis = existing.jenisPermohonan.replace(/_/g, ' ');
    const whatsappMessage = `Permohonan ${readableJenis} Anda dengan nomor ${existing.nomorPermohonan} telah berhasil diterima dan sedang dalam proses verifikasi.`;
    await sendWhatsApp(existing.noWhatsapp, whatsappMessage);

    // 2. Send In-App Notification to all active PENELITI users
    const notifTitle = 'Resubmit Permohonan';
    const notifPesan = `Permohonan ${readableJenis} nomor ${existing.nomorPermohonan} telah diperbaiki oleh Penginput dan siap diverifikasi kembali.`;
    await notifyAllUsersOfRole('PENELITI', notifTitle, notifPesan, { permohonanId: id });

    // 3. Create Audit Log record
    await prisma.auditLog.create({
      data: {
        entityType: 'PERMOHONAN',
        entityId: id,
        aksi: 'Resubmit Permohonan Hasil Revisi',
        statusSebelum: 'REVISION',
        statusSesudah: 'SUBMITTED',
        pelakuId: session.user.id,
        metadata: { nomorPermohonan: existing.nomorPermohonan }
      }
    });

    revalidatePath('/');
    return { success: true, permohonan };
  } catch (error: any) {
    console.error('[ACTION-RESUBMIT-ERR]', error);
    return { success: false, error: error.message || 'Gagal melakukan resubmit permohonan.' };
  }
}

/**
 * Server Action: Retrieve all permohonan created by the logged-in Penginput
 */
export async function getPenginputPermohonan() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'PENGINPUT') {
    throw new Error('Unauthorized.');
  }

  try {
    const list = await prisma.permohonan.findMany({
      where: { penginputId: session.user.id },
      include: { dataBaru: true },
      orderBy: { createdAt: 'desc' }
    });

    return { success: true, list };
  } catch (error: any) {
    console.error('[ACTION-GET-ERR]', error);
    return { success: false, list: [], error: 'Gagal mengambil data permohonan.' };
  }
}

/**
 * Server Action: Toggle favorite status of a permohonan
 */
export async function togglePermohonanFavorite(id: string) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'PENGINPUT') {
    throw new Error('Unauthorized: Hanya Penginput yang dapat menandai favorit.');
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
 * Server Action: Get permohonan with status REVISION
 */
export async function getRevisionPermohonans() {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error('Unauthorized');
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
 * Server Action: Get latest permohonan (all statuses), ordered by newest
 */
export async function getLatestPermohonans(limit = 10) {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error('Unauthorized');
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
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return { success: true, list };
  } catch (error: any) {
    console.error('[ACTION-GET-LATEST-ERR]', error);
    return { success: false, list: [], error: 'Gagal mengambil data permohonan terbaru.' };
  }
}

/**
 * Server Action: Get statistics of Permohonans for the FavoritesCard replacement.
 */
export async function getPermohonanStats() {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error('Unauthorized');
  }

  try {
    const total = await prisma.permohonan.count();
    const revision = await prisma.permohonan.count({
      where: { status: 'REVISION' }
    });
    const sent = await prisma.permohonan.count({
      where: {
        status: 'ARCHIVED',
        bundle: {
          manifest: {
            status: 'SENT'
          }
        }
      }
    });
    const completed = await prisma.permohonan.count({
      where: { status: 'COMPLETED' }
    });
    const rejected = await prisma.permohonan.count({
      where: { status: 'REJECTED' }
    });

    return {
      success: true,
      stats: {
        total,
        revision,
        sent,
        completed,
        rejected
      }
    };
  } catch (error: any) {
    console.error('[ACTION-GET-STATS-ERR]', error);
    return { success: false, error: 'Gagal mengambil statistik permohonan.' };
  }
}

