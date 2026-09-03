"use server";

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Retrieve all pending return/koreksi requests for Supervisor to review.
 */
export async function getPendingKoreksi() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'SUPERVISOR') {
    throw new Error('Unauthorized');
  }

  try {
    const list = await prisma.returnRequest.findMany({
      where: { status: 'PENDING' },
      include: {
        bundle: {
          include: {
            applications: true
          }
        },
        manifest: true
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
    const list = await prisma.returnRequest.findMany({
      where: { status: { in: ['APPROVED', 'REJECTED'] } },
      include: {
        bundle: {
          include: {
            applications: true
          }
        },
        manifest: true
      },
      orderBy: { updatedAt: 'desc' },
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

    const [pendingTotal, decidedToday, approvedTotal, rejectedTotal] = await Promise.all([
      prisma.returnRequest.count({ where: { status: 'PENDING' } }),
      prisma.returnRequest.count({
        where: {
          status: { in: ['APPROVED', 'REJECTED'] },
          updatedAt: { gte: todayStart }
        }
      }),
      prisma.returnRequest.count({ where: { status: 'APPROVED' } }),
      prisma.returnRequest.count({ where: { status: 'REJECTED' } }),
    ]);

    return {
      success: true,
      stats: {
        pendingTotal,
        decidedToday,
        approvedTotal,
        rejectedTotal,
        byJenis: {}
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
 * Approve a ReturnRequest
 */
export async function approveKoreksi(koreksiId: string, catatan?: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'SUPERVISOR') {
    throw new Error('Unauthorized');
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const returnReq = await tx.returnRequest.findUnique({
        where: { id: koreksiId },
        include: {
          bundle: {
            include: {
              applications: true
            }
          }
        }
      });

      if (!returnReq) throw new Error('Permintaan koreksi tidak ditemukan.');
      if (returnReq.status !== 'PENDING') throw new Error('Permintaan koreksi ini sudah diputuskan sebelumnya.');

      if (returnReq.bundleId) {
        await tx.application.updateMany({
          where: { currentBundleId: returnReq.bundleId },
          data: { status: 'SUBMITTED', currentBundleId: null }
        });
      }

      const updated = await tx.returnRequest.update({
        where: { id: koreksiId },
        data: {
          status: 'APPROVED',
          approvedBy: session.user.id,
          approvedAt: new Date()
        }
      });

      await tx.auditLog.create({
        data: {
          entityType: 'RETURN_REQUEST',
          entityId: returnReq.id,
          action: 'LOCK_BUNDLE',
          actorId: session.user.id,
          metadata: { note: catatan || 'Disetujui.' }
        }
      });

      return updated;
    });

    revalidatePath('/');
    return { success: true, result };
  } catch (error: any) {
    console.error('[ACTION-APPROVE-KOREKSI-ERR]', error);
    return { success: false, error: error.message || 'Gagal menyetujui koreksi.' };
  }
}

/**
 * Reject a ReturnRequest
 */
export async function rejectKoreksi(koreksiId: string, alasanPenolakan: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'SUPERVISOR') {
    throw new Error('Unauthorized');
  }

  if (!alasanPenolakan || !alasanPenolakan.trim()) {
    return { success: false, error: 'Alasan penolakan wajib diisi.' };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const returnReq = await tx.returnRequest.findUnique({
        where: { id: koreksiId }
      });

      if (!returnReq) throw new Error('Permintaan koreksi tidak ditemukan.');
      if (returnReq.status !== 'PENDING') throw new Error('Permintaan koreksi ini sudah diputuskan sebelumnya.');

      const updated = await tx.returnRequest.update({
        where: { id: koreksiId },
        data: {
          status: 'REJECTED',
          rejectionNote: alasanPenolakan.trim(),
          approvedBy: session.user.id,
          approvedAt: new Date()
        }
      });

      await tx.auditLog.create({
        data: {
          entityType: 'RETURN_REQUEST',
          entityId: returnReq.id,
          action: 'LOCK_BUNDLE',
          actorId: session.user.id,
          metadata: { rejectionNote: alasanPenolakan.trim() }
        }
      });

      return updated;
    });

    revalidatePath('/');
    return { success: true, result };
  } catch (error: any) {
    console.error('[ACTION-REJECT-KOREKSI-ERR]', error);
    return { success: false, error: error.message || 'Gagal menolak koreksi.' };
  }
}
