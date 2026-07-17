"use server";

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createInAppNotification } from '@/lib/notifications';
import { revalidatePath } from 'next/cache';

/**
 * Retrieve all pending koreksi requests for Supervisor to review.
 */
export async function getPendingKoreksi() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'SUPERVISOR') {
    throw new Error('Unauthorized');
  }

  try {
    const list = await prisma.permintaanKoreksi.findMany({
      where: { status: 'PENDING_APPROVAL' },
      include: {
        permohonan: {
          include: {
            bundle: { select: { id: true, nomorBundle: true, status: true } }
          }
        },
        pengaju: { select: { id: true, name: true, role: true } },
      },
      orderBy: { createdAt: 'asc' }
    });
    return { success: true, list };
  } catch (error: any) {
    console.error('[ACTION-GET-PENDING-KOREKSI-ERR]', error);
    return { success: false, list: [], error: 'Gagal mengambil daftar permintaan koreksi.' };
  }
}

/**
 * Retrieve all decided (APPROVED / REJECTED) koreksi requests for history view.
 */
export async function getKoreksiHistory() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'SUPERVISOR') {
    throw new Error('Unauthorized');
  }

  try {
    const list = await prisma.permintaanKoreksi.findMany({
      where: { status: { in: ['APPROVED', 'REJECTED'] } },
      include: {
        permohonan: {
          select: {
            id: true,
            nomorPermohonan: true,
            jenisPermohonan: true,
            status: true,
            namaWajibPajak: true,
          }
        },
        pengaju: { select: { id: true, name: true, role: true } },
        supervisor: { select: { id: true, name: true } },
      },
      orderBy: { diputuskanAt: 'desc' },
      take: 100
    });
    return { success: true, list };
  } catch (error: any) {
    console.error('[ACTION-GET-KOREKSI-HISTORY-ERR]', error);
    return { success: false, list: [], error: 'Gagal mengambil riwayat keputusan.' };
  }
}

/**
 * Retrieve summary statistics for the Supervisor dashboard.
 */
export async function getSupervisorStats() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'SUPERVISOR') {
    throw new Error('Unauthorized');
  }

  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [pendingTotal, decidedToday, approvedTotal, rejectedTotal, byJenis] = await Promise.all([
      prisma.permintaanKoreksi.count({ where: { status: 'PENDING_APPROVAL' } }),
      prisma.permintaanKoreksi.count({
        where: {
          status: { in: ['APPROVED', 'REJECTED'] },
          diputuskanAt: { gte: todayStart }
        }
      }),
      prisma.permintaanKoreksi.count({ where: { status: 'APPROVED' } }),
      prisma.permintaanKoreksi.count({ where: { status: 'REJECTED' } }),
      prisma.permintaanKoreksi.groupBy({
        by: ['jenisKoreksi'],
        where: { status: 'PENDING_APPROVAL' },
        _count: true
      }),
    ]);

    const jenisCount: Record<string, number> = {};
    byJenis.forEach(g => { jenisCount[g.jenisKoreksi] = g._count; });

    return {
      success: true,
      stats: {
        pendingTotal,
        decidedToday,
        approvedTotal,
        rejectedTotal,
        byJenis: jenisCount,
      }
    };
  } catch (error: any) {
    console.error('[ACTION-GET-SUPERVISOR-STATS-ERR]', error);
    return {
      success: false,
      stats: { pendingTotal: 0, decidedToday: 0, approvedTotal: 0, rejectedTotal: 0, byJenis: {} },
      error: 'Gagal mengambil statistik supervisor.'
    };
  }
}

/**
 * Approve a PermintaanKoreksi and execute the side-effect for each jenisKoreksi.
 * Also fixes the empty LOCKED bundle bug for KELUARKAN_DARI_BUNDLE.
 */
export async function approveKoreksi(koreksiId: string, catatan?: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'SUPERVISOR') {
    throw new Error('Unauthorized');
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const koreksi = await tx.permintaanKoreksi.findUnique({
        where: { id: koreksiId },
        include: {
          permohonan: {
            include: {
              bundle: true,
              arsipDigital: { orderBy: { versi: 'desc' }, take: 1 }
            }
          },
          pengaju: { select: { id: true, name: true, role: true } }
        }
      });

      if (!koreksi) throw new Error('Permintaan koreksi tidak ditemukan.');
      if (koreksi.status !== 'PENDING_APPROVAL') throw new Error('Permintaan koreksi ini sudah diputuskan sebelumnya.');

      const permohonan = koreksi.permohonan;
      const bundle = permohonan.bundle;
      let aksiDetail = '';

      // ======================================================
      // EXECUTE SIDE EFFECTS BASED ON jenisKoreksi
      // ======================================================
      if (koreksi.jenisKoreksi === 'KELUARKAN_DARI_BUNDLE') {
        // Remove permohonan from bundle, revert to SUBMITTED
        await tx.permohonan.update({
          where: { id: permohonan.id },
          data: { bundleId: null, status: 'SUBMITTED' }
        });

        // Check if bundle is now empty → fix the empty LOCKED bundle bug
        if (bundle) {
          const remaining = await tx.permohonan.findMany({ where: { bundleId: bundle.id } });
          if (remaining.length === 0) {
            await tx.bundle.update({
              where: { id: bundle.id },
              data: {
                // If bundle was LOCKED and now empty → revert to DRAFT so it can be reused
                status: bundle.status === 'LOCKED' ? 'DRAFT' : bundle.status,
                jenisPermohonan: null
              }
            });
          }
        }
        aksiDetail = `Permohonan ${permohonan.nomorPermohonan} dikeluarkan dari bundle${bundle ? ` ${bundle.nomorBundle}` : ''} dan dikembalikan ke status SUBMITTED.`;

      } else if (koreksi.jenisKoreksi === 'KEMBALIKAN_KE_PENELITI') {
        // Detach from bundle and revert to SUBMITTED for re-bundling
        await tx.permohonan.update({
          where: { id: permohonan.id },
          data: { bundleId: null, status: 'SUBMITTED' }
        });

        // If bundle is now empty after removal, reset it
        if (bundle) {
          const remaining = await tx.permohonan.findMany({ where: { bundleId: bundle.id } });
          if (remaining.length === 0) {
            await tx.bundle.update({
              where: { id: bundle.id },
              data: {
                status: bundle.status === 'LOCKED' ? 'DRAFT' : bundle.status,
                jenisPermohonan: null
              }
            });
          }
        }
        aksiDetail = `Permohonan ${permohonan.nomorPermohonan} dikembalikan ke Peneliti (SUBMITTED).`;

      } else if (koreksi.jenisKoreksi === 'KEMBALIKAN_KE_PENGARSIP') {
        // Revert ARCHIVED back to BUNDLED so Pengarsip can re-scan
        await tx.permohonan.update({
          where: { id: permohonan.id },
          data: { status: 'BUNDLED' }
        });

        // Supersede the most recent arsip digital version so Pengarsip can upload fresh
        if (permohonan.arsipDigital.length > 0) {
          await tx.arsipDigital.update({
            where: { id: permohonan.arsipDigital[0].id },
            data: { status: 'INVALIDATED' }
          });
        }
        aksiDetail = `Permohonan ${permohonan.nomorPermohonan} dikembalikan ke Pengarsip (BUNDLED), arsip digital terakhir diinvalidasi.`;

      } else if (koreksi.jenisKoreksi === 'BATAL_SELESAI') {
        // Rollback COMPLETED → ARCHIVED
        await tx.permohonan.update({
          where: { id: permohonan.id },
          data: { status: 'ARCHIVED' }
        });
        aksiDetail = `Permohonan ${permohonan.nomorPermohonan} dibatalkan status Selesainya, kembali ke ARCHIVED.`;
      }

      // Mark koreksi as APPROVED
      const updatedKoreksi = await tx.permintaanKoreksi.update({
        where: { id: koreksiId },
        data: {
          status: 'APPROVED',
          supervisorId: session.user.id,
          catatanSupervisor: catatan || 'Disetujui.',
          diputuskanAt: new Date()
        }
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          entityType: 'PERMOHONAN',
          entityId: permohonan.id,
          aksi: `Supervisor Menyetujui Koreksi (${koreksi.jenisKoreksi}): ${aksiDetail}`,
          statusSebelum: permohonan.status,
          pelakuId: session.user.id,
          metadata: { koreksiId, jenisKoreksi: koreksi.jenisKoreksi, catatan }
        }
      });

      return {
        updatedKoreksi,
        pengajuId: koreksi.pengajuId,
        nomorPelayanan: permohonan.nomorPelayanan || permohonan.nomorPermohonan,
        jenisKoreksi: koreksi.jenisKoreksi,
      };
    });

    // Notify pengaju (outside transaction)
    const notifPesan = `Permintaan koreksi Anda untuk Permohonan ${result.nomorPelayanan} (${result.jenisKoreksi.replace(/_/g, ' ')}) telah DISETUJUI oleh Supervisor.${catatan ? ` Catatan: "${catatan}"` : ''}`;
    await createInAppNotification(result.pengajuId, 'Koreksi Disetujui', notifPesan, { koreksiId });

    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('[ACTION-APPROVE-KOREKSI-ERR]', error);
    return { success: false, error: error.message || 'Gagal menyetujui koreksi.' };
  }
}

/**
 * Reject a PermintaanKoreksi. No side-effects on permohonan status.
 */
export async function rejectKoreksi(koreksiId: string, catatan: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'SUPERVISOR') {
    throw new Error('Unauthorized');
  }

  if (!catatan.trim()) {
    return { success: false, error: 'Alasan penolakan wajib diisi.' };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const koreksi = await tx.permintaanKoreksi.findUnique({
        where: { id: koreksiId },
        include: {
          permohonan: { select: { id: true, nomorPermohonan: true, nomorPelayanan: true, status: true } },
          pengaju: { select: { id: true, name: true } }
        }
      });

      if (!koreksi) throw new Error('Permintaan koreksi tidak ditemukan.');
      if (koreksi.status !== 'PENDING_APPROVAL') throw new Error('Permintaan koreksi ini sudah diputuskan sebelumnya.');

      const updatedKoreksi = await tx.permintaanKoreksi.update({
        where: { id: koreksiId },
        data: {
          status: 'REJECTED',
          supervisorId: session.user.id,
          catatanSupervisor: catatan,
          diputuskanAt: new Date()
        }
      });

      await tx.auditLog.create({
        data: {
          entityType: 'PERMOHONAN',
          entityId: koreksi.permohonanId,
          aksi: `Supervisor Menolak Koreksi (${koreksi.jenisKoreksi})`,
          statusSebelum: koreksi.permohonan.status,
          pelakuId: session.user.id,
          metadata: { koreksiId, jenisKoreksi: koreksi.jenisKoreksi, catatan }
        }
      });

      return {
        updatedKoreksi,
        pengajuId: koreksi.pengajuId,
        nomorPelayanan: koreksi.permohonan.nomorPelayanan || koreksi.permohonan.nomorPermohonan,
        jenisKoreksi: koreksi.jenisKoreksi,
      };
    });

    const notifPesan = `Permintaan koreksi Anda untuk Permohonan ${result.nomorPelayanan} (${result.jenisKoreksi.replace(/_/g, ' ')}) telah DITOLAK oleh Supervisor. Alasan: "${catatan}"`;
    await createInAppNotification(result.pengajuId, 'Koreksi Ditolak', notifPesan, { koreksiId });

    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('[ACTION-REJECT-KOREKSI-ERR]', error);
    return { success: false, error: error.message || 'Gagal menolak koreksi.' };
  }
}
