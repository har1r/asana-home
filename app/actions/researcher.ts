"use server";

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notifyAllUsersOfRole } from '@/lib/notifications';
import { revalidatePath } from 'next/cache';
import { UserRole } from '@prisma/client';

export async function getSubmittedPermohonan() {
  const session = await getServerSession(authOptions);
  if (!session || !['RESEARCHER', 'SUPERVISOR', 'PENELITI'].includes((session.user as any).role)) {
    throw new Error('Unauthorized');
  }

  try {
    const all = await prisma.application.findMany({
      where: { status: 'SUBMITTED' },
      orderBy: { createdAt: 'asc' }
    });

    const list = all.filter(p => !p.currentBundleId);

    return { success: true, list };
  } catch (error: any) {
    console.error('[ACTION-GET-SUBMITTED-ERR]', error);
    return { success: false, list: [], error: 'Gagal mengambil antrean permohonan.' };
  }
}

export async function mintaRevisi(permohonanId: string, catatan: string) {
  const session = await getServerSession(authOptions);
  if (!session || !['RESEARCHER', 'SUPERVISOR', 'PENELITI'].includes((session.user as any).role)) {
    throw new Error('Unauthorized');
  }

  if (!catatan.trim()) {
    return { success: false, error: 'Catatan alasan revisi wajib diisi.' };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const application = await tx.application.findUnique({
        where: { id: permohonanId },
        include: { currentBundle: true }
      });

      if (!application) {
        throw new Error('Permohonan tidak ditemukan.');
      }

      const updatedPermohonan = await tx.application.update({
        where: { id: permohonanId },
        data: {
          status: 'REVISION',
          currentBundleId: null
        }
      });

      await tx.auditLog.create({
        data: {
          entityType: 'APPLICATION',
          entityId: permohonanId,
          action: 'UPDATE_STATUS',
          actorId: session.user.id,
          metadata: { note: catatan }
        }
      });

      return updatedPermohonan;
    });

    revalidatePath('/');
    return { success: true, permohonan: result };
  } catch (error: any) {
    console.error('[ACTION-MINTA-REVISI-ERR]', error);
    return { success: false, error: error.message || 'Gagal meminta revisi.' };
  }
}

export async function getDraftBundles(arg?: any) {
  const session = await getServerSession(authOptions);
  if (!session || !['RESEARCHER', 'SUPERVISOR', 'PENELITI'].includes((session.user as any).role)) {
    throw new Error('Unauthorized');
  }

  try {
    const list = await prisma.bundle.findMany({
      include: {
        applications: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return { success: true, list };
  } catch (error: any) {
    console.error('[ACTION-GET-DRAFT-BUNDLES-ERR]', error);
    return { success: false, list: [], error: 'Gagal mengambil daftar bundle draf.' };
  }
}

export async function lockBundle(bundleId: string) {
  const session = await getServerSession(authOptions);
  if (!session || !['RESEARCHER', 'SUPERVISOR', 'PENELITI'].includes((session.user as any).role)) {
    throw new Error('Unauthorized');
  }

  try {
    const updated = await prisma.bundle.update({
      where: { id: bundleId },
      data: { status: 'LOCKED' }
    });

    await notifyAllUsersOfRole(UserRole.ARCHIVIST, 'Bundle Siap Digitisasi', `Bundle ${updated.bundleNumber} telah dikunci.`);
    revalidatePath('/');
    return { success: true, bundle: updated };
  } catch (error: any) {
    console.error('[ACTION-LOCK-BUNDLE-ERR]', error);
    return { success: false, error: error.message || 'Gagal mengunci bundle.' };
  }
}

export async function removePermohonanFromBundle(bundleId: string, permohonanId?: string, notes?: string) {
  const session = await getServerSession(authOptions);
  if (!session || !['RESEARCHER', 'SUPERVISOR', 'PENELITI'].includes((session.user as any).role)) {
    throw new Error('Unauthorized');
  }

  const targetId = permohonanId || bundleId;

  try {
    const updated = await prisma.application.update({
      where: { id: targetId },
      data: { currentBundleId: null, status: 'SUBMITTED' }
    });

    revalidatePath('/');
    return { success: true, status: 'REMOVED_IMMEDIATELY', permohonan: updated };
  } catch (error: any) {
    console.error('[ACTION-REMOVE-PERMOHONAN-FROM-BUNDLE-ERR]', error);
    return { success: false, error: error.message || 'Gagal mengeluarkan permohonan dari bundle.' };
  }
}

export async function getPendingKoreksiForPermohonan(permohonanId: string) {
  try {
    const request = await prisma.returnRequest.findFirst({
      where: {
        status: 'PENDING'
      }
    });
    return { success: true, request };
  } catch (e) {
    return { success: false, request: null };
  }
}

export async function resetEmptyBundleType(bundleId: string) {
  try {
    const updated = await prisma.bundle.update({
      where: { id: bundleId },
      data: { status: 'DRAFT' }
    });
    return { success: true, bundle: updated };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function resubmitPermohonanPeneliti(permohonanId: string) {
  try {
    const updated = await prisma.application.update({
      where: { id: permohonanId },
      data: { status: 'SUBMITTED' }
    });
    return { success: true, permohonan: updated };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function addPermohonanToBundle(bundleId: string, permohonanId?: string, extraArg?: any) {
  try {
    const targetId = permohonanId || bundleId;
    const updated = await prisma.application.update({
      where: { id: targetId },
      data: { currentBundleId: bundleId, status: 'BUNDLED' }
    });
    return { success: true, permohonan: updated };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function createBundle(applicationType?: any) {
  try {
    const bundleNumber = `BUNDLE-${Date.now()}`;
    const created = await prisma.bundle.create({
      data: {
        bundleNumber,
        applicationType: (applicationType || 'PARTIAL_MUTATION') as any,
        status: 'DRAFT'
      }
    });
    return { success: true, bundle: created };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export { getDraftBundles as getBundles };
