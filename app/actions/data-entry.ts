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
      const formattedTargetData = (validated.targetData || []).map((item) => {
        const { files, ...targetDataWithoutFiles } = item as any;

        const archives = (files || []).map((fileInfo: any) => ({
          idArchive: crypto.randomUUID(),
          urlBlob: fileInfo.urlBlob || fileInfo.url || '',
          fileName: fileInfo.name || fileInfo.fileName || 'Dokumen Utama',
          status: 'ACTIVE' as const,
          uploadedBy: session.user.id,
          createdAt: new Date(),
        }));

        return {
          ...targetDataWithoutFiles,
          idTargetData: crypto.randomUUID(),
          digitalArchives: archives,
        };
      });

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
          targetData: formattedTargetData || [],
        },
      });

      const isDuplicated = Boolean(validated.duplicatedFromAppId || validated.duplicatedFromNumber);
      const snapshotType = isDuplicated ? 'DUPLICATE_SUBMIT' : 'INITIAL_SUBMIT';
      const note = isDuplicated
        ? `Duplikasi dari permohonan No. ${validated.duplicatedFromNumber || validated.duplicatedFromAppId}`
        : 'Pendaftaran awal permohonan';

      const newSnapshot = await tx.applicationSnapshot.create({
        data: {
          applicationId: newApplication.id,
          snapshotType,
          note,
          actorId: session.user.id,
          snapshotData: {
            applicationType: newApplication.applicationType,
            applicationNumber: newApplication.applicationNumber,
            serviceNumberDate: newApplication.serviceNumberDate,
            completionDate: newApplication.completionDate,
            status: newApplication.status,
            previousData: newApplication.previousData,
            targetData: newApplication.targetData,
            ...(validated.duplicatedFromAppId ? { duplicatedFromAppId: validated.duplicatedFromAppId } : {}),
            ...(validated.duplicatedFromNumber ? { duplicatedFromNumber: validated.duplicatedFromNumber } : {}),
          } as any,
        },
      });

      const newAuditLog = await tx.auditLog.create({
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
            ...(isDuplicated ? { isDuplicated: true } : {}),
            ...(validated.duplicatedFromAppId ? { duplicatedFromAppId: validated.duplicatedFromAppId } : {}),
            ...(validated.duplicatedFromNumber ? { duplicatedFromNumber: validated.duplicatedFromNumber } : {}),
          },
        },
      });

      console.log('\n=================== [TAHAP 1: PENDAFTARAN PERMOHONAN BARU] ===================');
      console.log('1. [MODEL: Application]');
      console.log(JSON.stringify(newApplication, null, 2));

      console.log('\n2. [MODEL: ApplicationSnapshot]');
      console.log(JSON.stringify(newSnapshot, null, 2));

      console.log('\n3. [MODEL: AuditLog]');
      console.log(JSON.stringify(newAuditLog, null, 2));
      console.log('===============================================================================\n');

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

    const waRecipients = recipients.filter(
      (item) => item.whatsappNumber && item.whatsappNumber.trim().length > 0
    );

    Promise.allSettled([
      ...waRecipients.map((target) => {
        let cleanPhone = target.whatsappNumber!.replace(/[\s\-]/g, '');
        if (cleanPhone.startsWith('+')) {
          cleanPhone = cleanPhone.substring(1);
        }
        return sendWhatsApp(
          cleanPhone,
          `Permohonan ${applicationLabel} atas nama Bapak/Ibu ${target.ownerName} dengan nomor permohonan ${result.applicationNumber} telah berhasil diajukan.`
        );
      }),

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

export async function updateApplication(id: string, rawInput: any) {
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

    let formattedTargetData = undefined;
    if (rawInput.targetData && Array.isArray(rawInput.targetData)) {
      formattedTargetData = rawInput.targetData.map((item: any) => {
        const { files, ...targetDataWithoutFiles } = item;

        const newArchives = (files || []).map((fileInfo: any) => ({
          idArchive: crypto.randomUUID(),
          urlBlob: fileInfo.urlBlob || fileInfo.url || '',
          fileName: fileInfo.name || fileInfo.fileName || 'Dokumen Utama',
          status: 'ACTIVE' as const,
          uploadedBy: session.user.id,
          createdAt: new Date(),
        }));

        const existingArchives = item.digitalArchives || [];

        return {
          ...targetDataWithoutFiles,
          idTargetData: item.idTargetData || crypto.randomUUID(),
          digitalArchives: [...existingArchives, ...newArchives],
        };
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.application.update({
        where: { id },
        data: {
          ...(rawInput.applicationType ? { applicationType: rawInput.applicationType } : {}),
          ...(rawInput.applicationNumber ? { applicationNumber: rawInput.applicationNumber } : {}),
          ...(rawInput.serviceNumberDate ? { serviceNumberDate: new Date(rawInput.serviceNumberDate) } : {}),
          ...(rawInput.completionDate ? { completionDate: new Date(rawInput.completionDate) } : {}),
          ...(formattedTargetData ? { targetData: formattedTargetData } : {}),
          ...(rawInput.previousData ? { previousData: rawInput.previousData } : {})
        }
      });

      const newSnapshot = await tx.applicationSnapshot.create({
        data: {
          applicationId: id,
          snapshotType: 'UPDATE_DATA',
          note: 'Pengeditan data permohonan oleh Data Entry',
          actorId: session.user.id,
          snapshotData: {
            applicationType: updated.applicationType,
            applicationNumber: updated.applicationNumber,
            serviceNumberDate: updated.serviceNumberDate,
            completionDate: updated.completionDate,
            status: updated.status,
            previousData: updated.previousData,
            targetData: updated.targetData,
          } as any,
        },
      });

      const newAuditLog = await tx.auditLog.create({
        data: {
          action: 'UPDATE_STATUS',
          entityType: 'APPLICATION',
          entityId: id,
          oldStatus: existing.status,
          newStatus: updated.status,
          actorId: session.user.id,
          metadata: {
            note: 'Pengeditan data permohonan oleh Data Entry',
            applicationNumber: updated.applicationNumber,
          },
        },
      });

      console.log('\n=================== [PENGEDITAN PERMOHONAN] ===================');
      console.log('1. [MODEL: Application (Updated)]');
      console.log(JSON.stringify(updated, null, 2));

      console.log('\n2. [MODEL: ApplicationSnapshot (Edit Version Snapshot Created)]');
      console.log(JSON.stringify(newSnapshot, null, 2));

      console.log('\n3. [MODEL: AuditLog (Edit Recorded)]');
      console.log(JSON.stringify(newAuditLog, null, 2));
      console.log('=================================================================\n');

      return updated;
    });

    revalidatePath('/');
    return { success: true, permohonan: result, application: result };
  } catch (error: any) {
    console.error('[ACTION-UPDATE-APP-ERR]', error);
    return { success: false, error: error.message || 'Gagal mengupdate permohonan.' };
  }
}

export async function resubmitApplication(id: string, note?: string) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    const result = await prisma.$transaction(async (tx) => {
      const application = await tx.application.findUnique({ where: { id } });
      if (!application) throw new Error('Permohonan tidak ditemukan.');

      const oldStatusVal = application.status;

      const updated = await tx.application.update({
        where: { id },
        data: {
          status: 'SUBMITTED',
          currentBundleId: null,
        },
      });

      const newSnapshot = await tx.applicationSnapshot.create({
        data: {
          applicationId: id,
          snapshotType: 'RESUBMIT_AFTER_REVISION',
          note: note || 'Perbaikan data setelah revisi',
          actorId: session.user.id,
          snapshotData: {
            applicationType: updated.applicationType,
            applicationNumber: updated.applicationNumber,
            serviceNumberDate: updated.serviceNumberDate,
            completionDate: updated.completionDate,
            status: updated.status,
            previousData: updated.previousData,
            targetData: updated.targetData,
          } as any,
        },
      });

      const newAuditLog = await tx.auditLog.create({
        data: {
          action: 'UPDATE_STATUS',
          entityType: 'APPLICATION',
          entityId: id,
          oldStatus: oldStatusVal,
          newStatus: 'SUBMITTED',
          actorId: session.user.id,
          metadata: {
            note: note || 'Data telah diperbaiki dan diajukan ulang',
          },
        },
      });

      console.log('\n=================== [TAHAP 3: PERBAIKAN DATA & RESUBMIT] ===================');
      console.log('1. [MODEL: Application (Resubmitted)]');
      console.log(JSON.stringify(updated, null, 2));

      console.log('\n2. [MODEL: ApplicationSnapshot (Revision Version Snapshot Created)]');
      console.log(JSON.stringify(newSnapshot, null, 2));

      console.log('\n3. [MODEL: AuditLog (Resubmit Recorded)]');
      console.log(JSON.stringify(newAuditLog, null, 2));
      console.log('============================================================================\n');

      return updated;
    });

    revalidatePath('/');
    return { success: true, permohonan: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getActiveApplications() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return { success: false, list: [], error: 'Unauthorized: Sesi tidak ditemukan.' };
  }

  try {
    const list = await prisma.application.findMany({
      where: {
        status: { in: ['SUBMITTED', 'REVISION'] }
      },
      orderBy: { createdAt: 'desc' }
    });

    return { success: true, list };
  } catch (error: any) {
    console.error('[ACTION-GET-ACTIVE-ERR]', error);
    return { success: false, list: [], error: 'Gagal mengambil data permohonan aktif.' };
  }
}

export async function getHistoryApplications() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return { success: false, list: [], error: 'Unauthorized: Sesi tidak ditemukan.' };
  }

  try {
    const list = await prisma.application.findMany({
      where: {
        status: { in: ['BUNDLED', 'ARCHIVED', 'MANIFESTED', 'DELIVERED', 'COMPLETED'] }
      },
      orderBy: { createdAt: 'desc' }
    });

    return { success: true, list };
  } catch (error: any) {
    console.error('[ACTION-GET-HISTORY-ERR]', error);
    return { success: false, list: [], error: 'Gagal mengambil data riwayat permohonan.' };
  }
}

export async function toggleFavoriteApplication(id: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { success: false, error: 'Unauthorized: Peran Anda tidak memiliki akses untuk menandai favorit.' };
  }

  try {
    const existing = await prisma.application.findUnique({
      where: { id },
      select: { id: true, isFavorite: true, applicationNumber: true, status: true }
    });

    if (!existing) {
      return { success: false, error: 'Permohonan tidak ditemukan.' };
    }

    const newFavoriteState = !existing.isFavorite;

    const updated = await prisma.$transaction(async (tx) => {
      const app = await tx.application.update({
        where: { id },
        data: { isFavorite: newFavoriteState }
      });

      await tx.auditLog.create({
        data: {
          action: 'UPDATE_STATUS',
          entityType: 'APPLICATION',
          entityId: id,
          oldStatus: existing.status,
          newStatus: existing.status,
          actorId: (session.user as any).id,
          metadata: {
            field: 'isFavorite',
            isFavorite: newFavoriteState,
            applicationNumber: existing.applicationNumber,
            description: newFavoriteState
              ? `Permohonan No. ${existing.applicationNumber} ditandai sebagai favorit`
              : `Permohonan No. ${existing.applicationNumber} dihapus dari favorit`
          }
        }
      });

      return app;
    });

    revalidatePath('/');
    return { success: true, isFavorite: updated.isFavorite };
  } catch (error: any) {
    console.error('[ACTION-TOGGLE-FAVORITE-ERR]', error);
    return { success: false, error: error.message || 'Gagal mengubah status favorit.' };
  }
}

export async function getRevisionApplications() {
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

export async function getLatestApplications(limit = 10) {
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

export async function getApplicationStats() {
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

export async function getFavoriteApplications() {
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

export async function getApplicationSnapshots(applicationId: string) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return { success: false, error: 'Unauthorized: Sesi tidak ditemukan.', list: [] };
  }

  try {
    const list = await prisma.applicationSnapshot.findMany({
      where: { applicationId },
      orderBy: { createdAt: 'desc' },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            role: true,
            email: true,
          },
        },
      },
    });

    return { success: true, list };
  } catch (error: any) {
    console.error('[ACTION-GET-SNAPSHOTS-ERR]', error);
    return { success: false, error: 'Gagal mengambil riwayat snapshot permohonan.', list: [] };
  }
}

// ==================== ALIASES FOR BACKWARD COMPATIBILITY ====================
export const updatePermohonan = updateApplication;
export const resubmitPermohonan = resubmitApplication;
export const getPenginputPermohonan = getActiveApplications;
export const getPenginputHistoryPermohonan = getHistoryApplications;
export const togglePermohonanFavorite = toggleFavoriteApplication;
export const getRevisionPermohonans = getRevisionApplications;
export const getLatestPermohonans = getLatestApplications;
export const getPermohonanStats = getApplicationStats;
export const getFavoritePermohonans = getFavoriteApplications;

