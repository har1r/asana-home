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
        nomorPelayanan: permohonan.nomorPelayanan,
        jenisPermohonan: permohonan.jenisPermohonan,
        penginputId: permohonan.penginputId
      };
    });

    // Send In-App Notification to the responsible Penginput (outside transaction)
    const notifPesan = `Permohonan Anda (${result.nomorPelayanan || result.nomorPermohonan}) dikembalikan untuk revisi. Catatan Peneliti: "${catatan}"`;
    await createInAppNotification(result.penginputId, 'Permohonan Perlu Revisi', notifPesan, { permohonanId });

    // Kirim notifikasi WhatsApp ke Wajib Pajak di luar transaction scope
    const readableJenis = result.jenisPermohonan.replace(/_/g, ' ');
    const whatsappMessage = `Permohonan ${readableJenis} Anda dengan nomor ${result.nomorPermohonan} memerlukan kelengkapan berkas. Harap segera hubungi petugas untuk informasi lebih lanjut.`;
    await sendWhatsApp(result.noWhatsapp, whatsappMessage);

    revalidatePath('/');
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
        status: { in: ['DRAFT', 'LOCKED', 'IN_MANIFEST', 'VOID'] }
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
    const result = await prisma.$transaction(async (tx) => {
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
    revalidatePath('/');
    return result;
  } catch (error: any) {
    console.error('[ACTION-ADD-TO-BUNDLE-ERR]', error);
    return { success: false, error: error.message || 'Gagal memasukkan permohonan ke bundle.' };
  }
}

/**
 * Action: Remove Permohonan from Bundle
 * If DRAFT: Immediate extraction. If empty, Bundle stays DRAFT but type is reset to null.
 * If LOCKED: Creates a PENDING_APPROVAL request for the Supervisor.
 */
export async function removePermohonanFromBundle(bundleId: string, permohonanId: string, alasan?: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'PENELITI') {
    throw new Error('Unauthorized');
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
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
          // Reset locked type and keep status as DRAFT so it can be reused
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
              aksi: 'Jenis permohonan bundle direset karena kosong setelah seluruh permohonan dikeluarkan (tetap DRAFT)',
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

        return {
          success: true,
          status: 'PENDING_APPROVAL',
          request,
          nomorPelayanan: permohonan.nomorPelayanan || permohonan.nomorPermohonan,
          nomorBundle: bundle.nomorBundle
        };
      }

      throw new Error('Bundle dalam manifest atau status lain tidak dapat dikoreksi oleh Peneliti.');
    });

    // Notify Supervisor (outside transaction)
    if (result.success && result.status === 'PENDING_APPROVAL' && result.request) {
      const notifTitle = 'Persetujuan Koreksi';
      const notifPesan = `Peneliti mengajukan koreksi untuk mengeluarkan Permohonan ${result.nomorPelayanan} dari Bundle ${result.nomorBundle}. Alasan: "${alasan}"`;
      await notifyAllUsersOfRole('SUPERVISOR', notifTitle, notifPesan, {
        koreksiId: result.request.id,
        permohonanId,
        bundleId
      });
    }

    revalidatePath('/');
    return result;
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
    const result = await prisma.$transaction(async (tx) => {
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

      return { success: true, bundle: updatedBundle, nomorBundle: bundle.nomorBundle };
    });

    // Send In-App Notification to all active PENGARSIP users (outside transaction)
    if (result.success && result.bundle) {
      const notifPesan = `Bundle Baru ${result.nomorBundle} telah dikunci oleh Peneliti dan siap untuk didigitalisasi.`;
      await notifyAllUsersOfRole('PENGARSIP', 'Bundle Siap Didigitalisasi', notifPesan, { bundleId });
    }

    revalidatePath('/');
    return { success: true, bundle: result.bundle };
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

/**
 * Retrieve summary stats of bundles and queue for Peneliti dashboard
 */
export async function getPenelitiStats() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'PENELITI') {
    throw new Error('Unauthorized');
  }

  try {
    const draftCount = await prisma.bundle.count({ where: { status: 'DRAFT' } });
    const lockedCount = await prisma.bundle.count({ where: { status: 'LOCKED' } });
    const inManifestCount = await prisma.bundle.count({ where: { status: 'IN_MANIFEST' } });

    // For submitted but unbundled permohonan
    const allSubmitted = await prisma.permohonan.findMany({
      where: { status: 'SUBMITTED' },
      select: { bundleId: true }
    });
    const unbundledCount = allSubmitted.filter(p => !p.bundleId).length;

    const voidCount = await prisma.bundle.count({ where: { status: 'VOID' } });

    // Total bundles (including VOID)
    const totalCount = await prisma.bundle.count({
      where: {
        status: { in: ['DRAFT', 'LOCKED', 'IN_MANIFEST', 'VOID'] }
      }
    });

    // Pending correction requests count
    const pendingCorrectionCount = await prisma.permintaanKoreksi.count({
      where: { status: 'PENDING_APPROVAL' }
    });

    return {
      success: true,
      stats: {
        unbundled: unbundledCount,
        draft: draftCount,
        locked: lockedCount,
        inManifest: inManifestCount,
        void: voidCount,
        total: totalCount,
        pendingKoreksi: pendingCorrectionCount
      }
    };
  } catch (error: any) {
    console.error('[ACTION-GET-PENELITI-STATS-ERR]', error);
    return {
      success: false,
      stats: { unbundled: 0, draft: 0, locked: 0, inManifest: 0, void: 0, total: 0, pendingKoreksi: 0 },
      error: 'Gagal mengambil statistik peneliti.'
    };
  }
}

/**
 * Retrieve recent bundles for Peneliti dashboard
 */
export async function getRecentBundles(limit = 5) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'PENELITI') {
    throw new Error('Unauthorized');
  }

  try {
    const list = await prisma.bundle.findMany({
      where: {
        status: { in: ['DRAFT', 'LOCKED', 'IN_MANIFEST'] }
      },
      include: {
        permohonan: { select: { id: true } },
        peneliti: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
    return { success: true, list };
  } catch (error: any) {
    console.error('[ACTION-GET-RECENT-BUNDLES-ERR]', error);
    return { success: false, list: [], error: 'Gagal mengambil daftar bundle terbaru.' };
  }
}

/**
 * Action: Reset jenisPermohonan on an empty DRAFT bundle.
 * 
 * Handles the legacy case where a DRAFT bundle has no permohonan inside it
 * but still carries a non-null jenisPermohonan from a previous state.
 * Only allowed if the bundle is truly empty (0 permohonan) and in DRAFT status.
 */
export async function resetEmptyBundleType(bundleId: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'PENELITI') {
    throw new Error('Unauthorized');
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const bundle = await tx.bundle.findUnique({
        where: { id: bundleId },
        include: { _count: { select: { permohonan: true } } }
      });

      if (!bundle) throw new Error('Bundle tidak ditemukan.');
      if (bundle.status !== 'DRAFT') throw new Error('Hanya bundle DRAFT yang dapat direset jenis permohonannya.');
      if (bundle._count.permohonan > 0) throw new Error('Bundle masih berisi permohonan — tidak dapat direset.');
      if (!bundle.jenisPermohonan) return { success: true, message: 'Bundle sudah bersih (jenisPermohonan sudah null).' };

      await tx.bundle.update({
        where: { id: bundleId },
        data: { jenisPermohonan: null }
      });

      await tx.auditLog.create({
        data: {
          entityType: 'BUNDLE',
          entityId: bundleId,
          aksi: `Jenis permohonan bundle "${bundle.nomorBundle}" direset secara manual karena bundle kosong`,
          pelakuId: session.user.id,
        }
      });

      revalidatePath('/');
      return { success: true, message: `Jenis layanan bundle ${bundle.nomorBundle} berhasil direset.` };
    });
  } catch (error: any) {
    console.error('[ACTION-RESET-EMPTY-BUNDLE-TYPE-ERR]', error);
    return { success: false, error: error.message || 'Gagal mereset jenis bundle.' };
  }
}

/**
 * Retrieve voided bundles for Peneliti dashboard
 */
export async function getVoidedBundles(limit = 5) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'PENELITI') {
    throw new Error('Unauthorized');
  }

  try {
    const list = await prisma.bundle.findMany({
      where: {
        status: 'VOID'
      },
      include: {
        peneliti: { select: { name: true } }
      },
      orderBy: { updatedAt: 'desc' },
      take: limit
    });
    return { success: true, list };
  } catch (error: any) {
    console.error('[ACTION-GET-VOIDED-BUNDLES-ERR]', error);
    return { success: false, list: [], error: 'Gagal mengambil daftar bundle void.' };
  }
}

/**
 * Retrieve draft bundles for Peneliti dashboard
 */
export async function getDraftBundles(limit = 5) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'PENELITI') {
    throw new Error('Unauthorized');
  }

  try {
    const list = await prisma.bundle.findMany({
      where: {
        status: 'DRAFT'
      },
      include: {
        permohonan: { select: { id: true } },
        peneliti: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
    const total = await prisma.bundle.count({
      where: {
        status: 'DRAFT'
      }
    });
    return { success: true, list, total };
  } catch (error: any) {
    console.error('[ACTION-GET-DRAFT-BUNDLES-ERR]', error);
    return { success: false, list: [], total: 0, error: 'Gagal mengambil daftar bundle draf.' };
  }
}


