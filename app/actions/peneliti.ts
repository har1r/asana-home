"use server";

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendWhatsApp } from '@/lib/fonnte';
import { createInAppNotification, notifyAllUsersOfRole } from '@/lib/notifications';
import { revalidatePath } from 'next/cache';

/**
 * Get all permohonan that are SUBMITTED and do not have a bundle yet
 */
export async function getSubmittedPermohonan() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'PENELITI') {
    throw new Error('Unauthorized');
  }

  try {
    // CATATAN BUG: Prisma + MongoDB tidak dapat memfilter `bundleId: null`
    // secara akurat pada optional relation field bersamaan dengan filter status lain.
    // Solusi: ambil semua SUBMITTED dari DB, lalu filter bundleId di sisi JavaScript.
    const all = await prisma.permohonan.findMany({
      where: { status: 'SUBMITTED' },
      orderBy: { createdAt: 'asc' }
    });

    // Filter di JS: hanya yang belum memiliki bundleId
    const list = all.filter(p => !p.bundleId);
    
    return { success: true, list };
  } catch (error: any) {
    console.error('[ACTION-GET-SUBMITTED-ERR]', error);
    return { success: false, list: [], error: 'Gagal mengambil antrean permohonan.' };
  }
}



/**
 * Action: Minta Revisi (SUBMITTED -> REVISION)
 * If the application is inside a DRAFT bundle, it'll be removed first.
 * If that bundle becomes empty, it changes status to VOID.
 */
export async function mintaRevisi(permohonanId: string, catatan: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'PENELITI') {
    throw new Error('Unauthorized');
  }

  if (!catatan.trim()) {
    return { success: false, error: 'Catatan alasan revisi wajib diisi.' };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const permohonan = await tx.permohonan.findUnique({
        where: { id: permohonanId },
        include: { bundle: true }
      });

      if (!permohonan) {
        throw new Error('Permohonan tidak ditemukan.');
      }

      if (permohonan.status !== 'SUBMITTED' && permohonan.status !== 'BUNDLED') {
        throw new Error('Hanya permohonan berstatus Diajukan atau Terbundel Draf yang bisa direvisi.');
      }

      // Check if it's in a LOCKED/IN_MANIFEST bundle
      if (permohonan.bundle && permohonan.bundle.status !== 'DRAFT') {
        throw new Error('Permohonan berada di bundle yang sudah terkunci, gunakan alur koreksi.');
      }

      const originalBundleId = permohonan.bundleId;

      // Update permohonan to REVISION and clear bundleId
      const updatedPermohonan = await tx.permohonan.update({
        where: { id: permohonanId },
        data: {
          status: 'REVISION',
          bundleId: null
        }
      });

      // If it was in a DRAFT bundle, check if we need to VOID the bundle
      if (originalBundleId) {
        const remainingInBundle = await tx.permohonan.findMany({
          where: { bundleId: originalBundleId }
        });

        if (remainingInBundle.length === 0) {
          await tx.bundle.update({
            where: { id: originalBundleId },
            data: { jenisPermohonan: null }
          });

          await tx.auditLog.create({
            data: {
              entityType: 'BUNDLE',
              entityId: originalBundleId,
              aksi: 'Jenis permohonan bundle direset karena kosong setelah pengembalian revisi (tetap DRAFT)',
              pelakuId: session.user.id
            }
          });
        }
      }

      // Send In-App Notification to the responsible Penginput
      const notifPesan = `Permohonan Anda (${permohonan.nomorPermohonan}) dikembalikan untuk revisi. Catatan Peneliti: "${catatan}"`;
      await createInAppNotification(permohonan.penginputId, 'Permohonan Perlu Revisi', notifPesan, { permohonanId });

      // Create Audit Log
      await tx.auditLog.create({
        data: {
          entityType: 'PERMOHONAN',
          entityId: permohonanId,
          aksi: 'Mengembalikan Permohonan untuk Revisi',
          statusSebelum: permohonan.status,
          statusSesudah: 'REVISION',
          pelakuId: session.user.id,
          metadata: { catatan }
        }
      });

      return {
        updatedPermohonan,
        noWhatsapp: permohonan.noWhatsapp,
        nomorPermohonan: permohonan.nomorPermohonan,
        jenisPermohonan: permohonan.jenisPermohonan
      };
    });

    // Kirim notifikasi WhatsApp ke Wajib Pajak di luar transaction scope
    const readableJenis = result.jenisPermohonan.replace(/_/g, ' ');
    const whatsappMessage = `Permohonan ${readableJenis} Anda dengan nomor ${result.nomorPermohonan} memerlukan kelengkapan berkas. Harap segera hubungi petugas untuk informasi lebih lanjut.`;
    await sendWhatsApp(result.noWhatsapp, whatsappMessage);

    return { success: true, permohonan: result.updatedPermohonan };
  } catch (error: any) {
    console.error('[ACTION-MINTA-REVISI-ERR]', error);
    return { success: false, error: error.message || 'Gagal mengirim permohonan ke revisi.' };
  }
}

/**
 * Action: Create a new Bundle in DRAFT status
 */
export async function createBundle() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'PENELITI') {
    throw new Error('Unauthorized');
  }

  const currentYear = new Date().getFullYear();
  const suffix = `/UPT.PD.WIL.IV/${currentYear}`;

  try {
    // Step 1: Fetch all existing bundles for this year ONCE to find the
    // current maximum sequence number. This single query replaces the
    // repeated findMany that previously ran on every loop iteration.
    const existingBundles = await prisma.bundle.findMany({
      where: {
        nomorBundle: { endsWith: suffix }
      },
      select: { nomorBundle: true }
    });

    let maxSequence = 0;
    for (const b of existingBundles) {
      const parts = b.nomorBundle.split('/');
      if (parts.length === 4 && parts[0] === '973' && parts[2] === 'UPT.PD.WIL.IV') {
        const seq = parseInt(parts[1], 10);
        if (!isNaN(seq) && seq > maxSequence) {
          maxSequence = seq;
        }
      }
    }

    // Step 2: Loop with lightweight findUnique only (no findMany inside loop)
    // to handle the rare race-condition where another concurrent request
    // already claimed the next sequence number.
    let nomorBundle = '';
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      const nextSequence = maxSequence + 1 + attempts;
      nomorBundle = `973/${nextSequence}/UPT.PD.WIL.IV/${currentYear}`;

      const existing = await prisma.bundle.findUnique({
        where: { nomorBundle },
        select: { id: true }
      });

      if (!existing) {
        isUnique = true;
      } else {
        attempts++;
      }
    }

    if (!isUnique) {
      throw new Error('Tidak dapat menghasilkan nomor bundle yang unik.');
    }

    const bundle = await prisma.bundle.create({
      data: {
        nomorBundle,
        status: 'DRAFT',
        penelitiId: session.user.id
      }
    });

    revalidatePath('/');
    return { success: true, bundle };
  } catch (error: any) {
    console.error('[ACTION-CREATE-BUNDLE-ERR]', error);
    return { success: false, error: error.message || 'Gagal membuat bundle baru.' };
  }
}


/**
 * Action: Retrieve all active bundles (DRAFT and LOCKED)
 */
export async function getBundles() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'PENELITI') {
    throw new Error('Unauthorized');
  }

  try {
    const list = await prisma.bundle.findMany({
      where: {
        status: { in: ['DRAFT', 'LOCKED'] }
      },
      include: {
        permohonan: true,
        peneliti: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, list };
  } catch (error: any) {
    console.error('[ACTION-GET-BUNDLES-ERR]', error);
    return { success: false, list: [], error: 'Gagal mengambil daftar bundle.' };
  }
}

/**
 * Action: Add Permohonan to Bundle (homogeneity rule is validated here)
 */
export async function addPermohonanToBundle(bundleId: string, permohonanId: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'PENELITI') {
    throw new Error('Unauthorized');
  }

  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Fetch the bundle
      const bundle = await tx.bundle.findUnique({
        where: { id: bundleId },
        include: { permohonan: true }
      });

      if (!bundle) {
        throw new Error('Bundle tidak ditemukan.');
      }

      if (bundle.status !== 'DRAFT') {
        throw new Error('Hanya bundle berstatus DRAFT yang dapat ditambah permohonan.');
      }

      // 2. Fetch the permohonan
      const permohonan = await tx.permohonan.findUnique({
        where: { id: permohonanId }
      });

      if (!permohonan) {
        throw new Error('Permohonan tidak ditemukan.');
      }

      if (permohonan.status !== 'SUBMITTED' || permohonan.bundleId) {
        throw new Error('Permohonan harus berstatus Diajukan (SUBMITTED) dan belum memiliki bundle.');
      }

      // 3. Verify homogeneity
      if (bundle.jenisPermohonan) {
        if (bundle.jenisPermohonan !== permohonan.jenisPermohonan) {
          throw new Error(`Aturan Bundle Homogen: Bundle ini dikunci untuk jenis "${bundle.jenisPermohonan.replace(/_/g, ' ')}". Permohonan bertipe "${permohonan.jenisPermohonan.replace(/_/g, ' ')}" ditolak.`);
        }
      }

      // 4. Perform update: associate permohonan with bundle, change status to BUNDLED
      // If it's the first permohonan in the bundle, set the locked jenisPermohonan on the bundle
      const updatedBundleJenis = bundle.jenisPermohonan || permohonan.jenisPermohonan;
      
      await tx.bundle.update({
        where: { id: bundleId },
        data: { jenisPermohonan: updatedBundleJenis }
      });

      const updatedPermohonan = await tx.permohonan.update({
        where: { id: permohonanId },
        data: {
          bundleId,
          status: 'BUNDLED'
        }
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          entityType: 'PERMOHONAN',
          entityId: permohonanId,
          aksi: 'Memasukkan Permohonan ke Bundle Draf',
          statusSebelum: 'SUBMITTED',
          statusSesudah: 'BUNDLED',
          pelakuId: session.user.id,
          metadata: { bundleId, nomorBundle: bundle.nomorBundle }
        }
      });

      return { success: true, permohonan: updatedPermohonan };
    });
  } catch (error: any) {
    console.error('[ACTION-ADD-TO-BUNDLE-ERR]', error);
    return { success: false, error: error.message || 'Gagal memasukkan permohonan ke bundle.' };
  }
}

/**
 * Action: Remove Permohonan from Bundle
 * If DRAFT: Immediate extraction. If empty, Bundle becomes VOID.
 * If LOCKED: Creates a PENDING_APPROVAL request for the Supervisor.
 */
export async function removePermohonanFromBundle(bundleId: string, permohonanId: string, alasan?: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'PENELITI') {
    throw new Error('Unauthorized');
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const bundle = await tx.bundle.findUnique({
        where: { id: bundleId }
      });

      if (!bundle) {
        throw new Error('Bundle tidak ditemukan.');
      }

      const permohonan = await tx.permohonan.findUnique({
        where: { id: permohonanId }
      });

      if (!permohonan || permohonan.bundleId !== bundleId) {
        throw new Error('Permohonan tidak berada di dalam bundle yang dipilih.');
      }

      // Case A: Bundle is DRAFT (Immediate action)
      if (bundle.status === 'DRAFT') {
        const updatedPermohonan = await tx.permohonan.update({
          where: { id: permohonanId },
          data: {
            bundleId: null,
            status: 'SUBMITTED'
          }
        });

        // Check if bundle is now empty
        const remaining = await tx.permohonan.findMany({
          where: { bundleId }
        });

        if (remaining.length === 0) {
          // Reset locked type, but keep status as DRAFT
          await tx.bundle.update({
            where: { id: bundleId },
            data: { 
              jenisPermohonan: null
            }
          });

          await tx.auditLog.create({
            data: {
              entityType: 'BUNDLE',
              entityId: bundleId,
              aksi: 'Jenis permohonan bundle direset karena seluruh permohonan dikeluarkan (tetap DRAFT)',
              pelakuId: session.user.id
            }
          });
        }

        // Log extraction
        await tx.auditLog.create({
          data: {
            entityType: 'PERMOHONAN',
            entityId: permohonanId,
            aksi: 'Mengeluarkan Permohonan dari Bundle Draf',
            statusSebelum: 'BUNDLED',
            statusSesudah: 'SUBMITTED',
            pelakuId: session.user.id,
            metadata: { bundleId }
          }
        });

        return { success: true, status: 'REMOVED_IMMEDIATELY', permohonan: updatedPermohonan };
      }

      // Case B: Bundle is LOCKED (Requires Supervisor Approval)
      if (bundle.status === 'LOCKED') {
        if (!alasan || !alasan.trim()) {
          throw new Error('Alasan wajib diisi untuk mengeluarkan permohonan dari bundle yang terkunci.');
        }

        // Check for existing pending requests
        const existingRequest = await tx.permintaanKoreksi.findFirst({
          where: {
            permohonanId,
            status: 'PENDING_APPROVAL',
            jenisKoreksi: 'KELUARKAN_DARI_BUNDLE'
          }
        });

        if (existingRequest) {
          throw new Error('Permintaan pengeluaran permohonan ini sudah diajukan sebelumnya dan masih menunggu keputusan Supervisor.');
        }

        // Create PermintaanKoreksi
        const request = await tx.permintaanKoreksi.create({
          data: {
            permohonanId,
            jenisKoreksi: 'KELUARKAN_DARI_BUNDLE',
            status: 'PENDING_APPROVAL',
            pengajuId: session.user.id,
            catatanPengaju: alasan
          }
        });

        // Notify Supervisor
        const notifTitle = 'Persetujuan Koreksi';
        const notifPesan = `Peneliti mengajukan koreksi untuk mengeluarkan Permohonan ${permohonan.nomorPermohonan} dari Bundle ${bundle.nomorBundle}. Alasan: "${alasan}"`;
        await notifyAllUsersOfRole('SUPERVISOR', notifTitle, notifPesan, { 
          koreksiId: request.id, 
          permohonanId, 
          bundleId 
        });

        return { success: true, status: 'PENDING_APPROVAL', request };
      }

      throw new Error('Bundle dalam manifest atau status lain tidak dapat dikoreksi oleh Peneliti.');
    });
  } catch (error: any) {
    console.error('[ACTION-REMOVE-FROM-BUNDLE-ERR]', error);
    return { success: false, error: error.message || 'Gagal mengeluarkan permohonan.' };
  }
}

/**
 * Action: Lock Bundle (DRAFT -> LOCKED)
 */
export async function lockBundle(bundleId: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'PENELITI') {
    throw new Error('Unauthorized');
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const bundle = await tx.bundle.findUnique({
        where: { id: bundleId },
        include: { permohonan: true }
      });

      if (!bundle) {
        throw new Error('Bundle tidak ditemukan.');
      }

      if (bundle.status !== 'DRAFT') {
        throw new Error('Hanya bundle berstatus DRAFT yang dapat dikunci.');
      }

      if (bundle.permohonan.length === 0) {
        throw new Error('Gagal mengunci: Bundle masih kosong. Silakan masukkan minimal 1 permohonan.');
      }

      // Update bundle status to LOCKED
      const updatedBundle = await tx.bundle.update({
        where: { id: bundleId },
        data: { status: 'LOCKED' }
      });

      // Send In-App Notification to all active PENGARSIP users
      const notifPesan = `Bundle Baru ${bundle.nomorBundle} telah dikunci oleh Peneliti dan siap untuk didigitalisasi.`;
      await notifyAllUsersOfRole('PENGARSIP', 'Bundle Siap Didigitalisasi', notifPesan, { bundleId });

      // Audit Log
      await tx.auditLog.create({
        data: {
          entityType: 'BUNDLE',
          entityId: bundleId,
          aksi: 'Mengunci Bundle (DRAFT -> LOCKED)',
          statusSebelum: 'DRAFT',
          statusSesudah: 'LOCKED',
          pelakuId: session.user.id
        }
      });

      return { success: true, bundle: updatedBundle };
    });
  } catch (error: any) {
    console.error('[ACTION-LOCK-BUNDLE-ERR]', error);
    return { success: false, error: error.message || 'Gagal mengunci bundle.' };
  }
}

/**
 * Retrieve active koreksi requests for permohonan in locked bundles
 */
export async function getPendingKoreksiForPermohonan(permohonanId: string) {
  try {
    const request = await prisma.permintaanKoreksi.findFirst({
      where: {
        permohonanId,
        status: 'PENDING_APPROVAL'
      }
    });
    return { success: true, request };
  } catch (e) {
    return { success: false, request: null };
  }
}
