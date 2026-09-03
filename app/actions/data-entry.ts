"use server";

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { applicationSchema } from '@/lib/validations/application';
import { notifyAllUsersOfRole } from '@/lib/notifications';
import { sendWhatsApp } from '@/lib/fonnte';
import { ApplicationType, UserRole } from '@prisma/client';

const typeLabelMap: Record<ApplicationType, string> = {
  PARTIAL_MUTATION: 'Mutasi Sebagian',
  MERGER_MUTATION: 'Mutasi Penggabungan',
  EXPIRED_UPDATE: 'Mutasi Habis Update',
  EXPIRED_REGULAR: 'Mutasi Habis Reguler',
  NEW_TAX_OBJECT: 'Objek Pajak Baru',
  CORRECTION: 'Pembetulan',
  REACTIVATION: 'Pengaktifan',
};

export async function createApplication(rawInput: unknown) {
  // AUTHENTICATION & AUTHORIZATION
  const session = await getServerSession(authOptions);

  if (!session?.user || !['DATA_ENTRY', 'SUPERVISOR'].includes(session.user.role as any)) {
    return {
      success: false,
      error: 'Unauthorized: Hanya peran DATA_ENTRY atau SUPERVISOR yang diizinkan menginput data.',
    };
  }

  // VALIDASI DATA
  const validationResult = applicationSchema.safeParse(rawInput);

  if (!validationResult.success) {
    return {
      success: false,
      error: validationResult.error.issues[0]?.message || 'Data application tidak valid.',
      issues: validationResult.error.issues,
    };
  }

  const validated = validationResult.data;

  try {
    // CEK DUPLIKASI DATA
    const existingApp = await prisma.application.findFirst({
      where: { applicationNumber: validated.applicationNumber },
      select: { id: true },
    });

    if (existingApp) {
      return {
        success: false,
        error: `Nomor Permohonan "${validated.applicationNumber}" sudah terdaftar di sistem.`,
      };
    }

    // EKSEKUSI DATABASE DALAM TRANSAKSI (All or Nothing)
    const result = await prisma.$transaction(async (tx) => {
      const newApplication = await tx.application.create({
        data: {
          applicationType: validated.applicationType,
          applicationNumber: validated.applicationNumber,
          serviceNumberDate: new Date(validated.serviceNumberDate),
          completionDate: new Date(validated.completionDate),
          status: 'SUBMITTED',
          currentBundleId: null,
          isFavorite: false,
          previousData: validated.previousData || [],
          targetData: validated.targetData || [],
        },
      });

      await tx.applicationSnapshot.create({
        data: {
          applicationId: newApplication.id,
          snapshotType: 'INITIAL_SUBMIT',
          note: 'Pendaftaran awal permohonan',
          actorId: session.user.id,
          snapshotData: {
            previousData: newApplication.previousData,
            targetData: newApplication.targetData,
          } as any,
        },
      });

      await tx.auditLog.create({
        data: {
          action: 'SUBMIT_DATA',
          entityType: 'APPLICATION',
          entityId: newApplication.id,
          oldStatus: null,
          newStatus: 'SUBMITTED',
          actorId: session.user.id,
          metadata: {
            applicationNumber: validated.applicationNumber,
            serviceNumberDate: new Date(validated.serviceNumberDate).toISOString(),
            slaDeadline: new Date(validated.completionDate).toISOString(),
            totalPreviousData: newApplication.previousData.length,
            totalTargetData: newApplication.targetData.length,
          },
        },
      });

      return newApplication;
    });

    // SIDE EFFECTS (Non-blocking, agar tidak menghambat response)
    // Gunakan Promise.allSettled agar jika notifikasi gagal, transaksi utama tetap sukses.
    const applicationLabel = typeLabelMap[validated.applicationType] || validated.applicationType;

    let recipients: { ownerName: string; whatsappNumber?: string | null }[] = [];
    if (validated.applicationType === 'REACTIVATION') {
      recipients = validated.previousData || [];
    } else {
      recipients = (validated.targetData && validated.targetData.length > 0)
        ? validated.targetData
        : (validated.previousData || []);
    }

    const waTargets = recipients.filter(
      (item) => item.whatsappNumber && item.whatsappNumber.trim().length > 0
    );

    Promise.allSettled([
      ...waTargets.map((target) =>
        sendWhatsApp(
          target.whatsappNumber!,
          `Permohonan ${applicationLabel} atas nama Bapak/Ibu ${target.ownerName} dengan nomor permohonan ${result.applicationNumber} telah berhasil diajukan.`
        )
      ),

      // Notifikasi Internal ke Role Peneliti
      notifyAllUsersOfRole(
        UserRole.RESEARCHER,
        'Permohonan Baru Diajukan',
        `Permohonan ${applicationLabel} nomor ${result.applicationNumber} masuk antrean penelitian.`,
        { applicationId: result.id }
      ),
    ]).catch((err) => console.error('[SIDE-EFFECT-ERR]', err));

    revalidatePath('/dashboard/data-entry');

    return {
      success: true,
      data: result,
      message: 'Permohonan berhasil dibuat dan masuk ke antrean penelitian.',
    };

  } catch (error: any) {
    console.error('[ACTION-CREATE-APPLICATION-ERR]', error);

    let clientErrorMessage = 'Gagal menyimpan permohonan ke database.';

    if (error.message?.includes('Invalid `prisma.application.create()`')) {
      clientErrorMessage = 'Gagal menyimpan: Periksa kembali kelengkapan dan format data yang diisi.';
    } else if (error.message) {
      clientErrorMessage = error.message;
    }

    return {
      success: false,
      error: clientErrorMessage,
    };
  }
}

export async function updatePermohonan(id: string, rawInput: any) {
  const session = await getServerSession(authOptions);

  if (!session || !['DATA_ENTRY', 'SUPERVISOR', 'PENGINPUT'].includes((session.user as any).role)) {
    return { success: false, error: 'Unauthorized: Hanya peran DATA_ENTRY atau SUPERVISOR yang diizinkan mengubah data.' };
  }

  try {
    const existing = await prisma.application.findUnique({
      where: { id }
    });

    if (!existing) {
      return { success: false, error: 'Data permohonan tidak ditemukan.' };
    }

    const updated = await prisma.application.update({
      where: { id },
      data: {
        ...(rawInput.applicationNumber ? { applicationNumber: rawInput.applicationNumber } : {}),
        ...(rawInput.targetData ? { targetData: rawInput.targetData } : {}),
        ...(rawInput.previousData ? { previousData: rawInput.previousData } : {})
      }
    });

    revalidatePath('/');
    return { success: true, permohonan: updated, application: updated };
  } catch (error: any) {
    console.error('[ACTION-UPDATE-APP-ERR]', error);
    return { success: false, error: error.message || 'Gagal mengupdate permohonan.' };
  }
}

export async function resubmitPermohonan(id: string) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    const updated = await prisma.application.update({
      where: { id },
      data: { status: 'SUBMITTED' }
    });

    revalidatePath('/');
    return { success: true, permohonan: updated };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getPenginputPermohonan() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return { success: false, list: [], error: 'Unauthorized: Sesi tidak ditemukan.' };
  }

  try {
    const list = await prisma.application.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return { success: true, list };
  } catch (error: any) {
    console.error('[ACTION-GET-ERR]', error);
    return { success: false, list: [], error: 'Gagal mengambil data permohonan.' };
  }
}

export async function togglePermohonanFavorite(id: string) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return { success: false, error: 'Unauthorized: Peran Anda tidak memiliki akses untuk menandai favorit.' };
  }

  try {
    const existing = await prisma.application.findUnique({
      where: { id },
      select: { isFavorite: true }
    });

    if (!existing) {
      return { success: false, error: 'Permohonan tidak ditemukan.' };
    }

    const updated = await prisma.application.update({
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

export async function getRevisionPermohonans() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return { success: false, list: [], error: 'Unauthorized: Sesi tidak ditemukan.' };
  }

  try {
    const list = await prisma.application.findMany({
      where: { status: 'REVISION' },
      orderBy: { createdAt: 'desc' }
    });

    return { success: true, list };
  } catch (error: any) {
    console.error('[ACTION-GET-REVISIONS-ERR]', error);
    return { success: false, list: [], error: 'Gagal mengambil data revisi permohonan.' };
  }
}

export async function getLatestPermohonans(limit = 10) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return { success: false, list: [], submittedCount: 0, error: 'Unauthorized: Sesi tidak ditemukan.' };
  }

  try {
    const [list, submittedCount] = await Promise.all([
      prisma.application.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit
      }),
      prisma.application.count({ where: { status: 'SUBMITTED' } })
    ]);

    return { success: true, list, submittedCount };
  } catch (error: any) {
    console.error('[ACTION-GET-LATEST-ERR]', error);
    return { success: false, list: [], submittedCount: 0, error: 'Gagal mengambil data permohonan terbaru.' };
  }
}

export async function getPermohonanStats() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return { success: false, error: 'Unauthorized: Sesi tidak ditemukan.' };
  }

  try {
    const groupedStats = await prisma.application.groupBy({
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
      COMPLETED: 0
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
        submitted: statsMap.SUBMITTED || 0,
        revision: statsMap.REVISION || 0,
        bundled: statsMap.BUNDLED || 0,
        archived: statsMap.ARCHIVED || 0,
        completed: statsMap.COMPLETED || 0,
        rejected: 0
      }
    };
  } catch (error: any) {
    console.error('[ACTION-GET-STATS-ERR]', error);
    return { success: false, error: 'Gagal mengambil statistik permohonan.' };
  }
}

export async function getFavoritePermohonans() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return { success: false, error: 'Unauthorized: Sesi tidak ditemukan.', list: [] };
  }

  try {
    const list = await prisma.application.findMany({
      where: { isFavorite: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        applicationNumber: true,
        isFavorite: true,
      }
    });

    return { success: true, list };
  } catch (error: any) {
    console.error('[ACTION-GET-FAVORITES-ERR]', error);
    return { success: false, error: 'Gagal mengambil data favorit.', list: [] };
  }
}
