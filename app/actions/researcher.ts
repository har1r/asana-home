"use server";

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notifyAllUsersOfRole } from '@/lib/notifications';
import { revalidatePath } from 'next/cache';
import { UserRole } from '@prisma/client';

// =========================================================================
// TAHAP 4: PENYETUJUAN DATA & PENYUSUNAN BUNDLE (DRAFT)
// Role Aktor: RESEARCHER (Peneliti)
// =========================================================================

/**
 * 1. GET SUBMITTED APPLICATIONS (Antrean Penelitian)
 * Mengambil permohonan yang berstatus SUBMITTED dan BELUM terikat ke Bundle manapun.
 */
export async function getSubmittedApplications() {
  const session = await getServerSession(authOptions);
  if (!session || !['RESEARCHER', 'SUPERVISOR', 'PENELITI'].includes((session.user as any).role)) {
    throw new Error('Unauthorized');
  }

  try {
    const all = await prisma.application.findMany({
      where: { status: { in: ['SUBMITTED', 'REVISION'] } },
      orderBy: { createdAt: 'asc' }
    });

    // Permohonan yang sudah masuk ke Bundle DRAFT otomatis tidak muncul di antrean umum
    const list = all.filter(p => !p.currentBundleId);

    return { success: true, list };
  } catch (error: any) {
    console.error('[ACTION-GET-SUBMITTED-ERR]', error);
    return { success: false, list: [], error: 'Gagal mengambil antrean permohonan.' };
  }
}

/**
 * 2. REQUEST REVISION (Meminta Revisi Data Permohonan)
 * Mengubah status permohonan menjadi REVISION dan melepas relasi bundle jika ada.
 */
export async function requestRevision(permohonanId: string, catatan: string) {
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

      const newAuditLog = await tx.auditLog.create({
        data: {
          entityType: 'APPLICATION',
          entityId: permohonanId,
          action: 'UPDATE_STATUS',
          oldStatus: application.status,
          newStatus: 'REVISION',
          actorId: session.user.id,
          metadata: { note: catatan }
        }
      });

      console.log('\n=================== [TAHAP 2: PENELITIAN & REVISI PERMOHONAN] ===================');
      console.log('1. [MODEL: Application (Status Updated)]');
      console.log(JSON.stringify(updatedPermohonan, null, 2));

      console.log('\n2. [MODEL: AuditLog (Revision Requested)]');
      console.log(JSON.stringify(newAuditLog, null, 2));
      console.log('=================================================================================\n');

      return updatedPermohonan;
    });

    revalidatePath('/');
    return { success: true, permohonan: result };
  } catch (error: any) {
    console.error('[ACTION-REQUEST-REVISION-ERR]', error);
    return { success: false, error: error.message || 'Gagal meminta revisi.' };
  }
}

/**
 * 3. GET ALL BUNDLES (Mengambil Seluruh Daftar Bundle Peneliti Murni untuk KPI)
 */
export async function getAllBundles(arg?: any) {
  const session = await getServerSession(authOptions);
  if (!session || !['RESEARCHER', 'SUPERVISOR', 'PENELITI'].includes((session.user as any).role)) {
    throw new Error('Unauthorized');
  }

  try {
    const rawList = await prisma.bundle.findMany({
      include: {
        applications: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    const userIds = Array.from(new Set(rawList.map((b: any) => b.createdById).filter(Boolean))) as string[];
    let userMap = new Map<string, any>();
    if (userIds.length > 0) {
      try {
        const users = await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, name: true, email: true }
        });
        userMap = new Map(users.map(u => [u.id, u]));
      } catch (uErr) {
        // Fallback jika pencarian user terpisah tidak berhasil
      }
    }

    const currentUserName = session.user?.name || 'Peneliti';
    const list = rawList.map((b: any) => ({
      ...b,
      createdBy: b.createdBy || (b.createdById ? userMap.get(b.createdById) : null) || { name: currentUserName }
    }));

    return { success: true, list };
  } catch (error: any) {
    console.error('[ACTION-GET-ALL-BUNDLES-ERR]', error);
    return { success: false, list: [], error: 'Gagal mengambil daftar seluruh bundle.' };
  }
}

/**
 * 3b. GET DRAFT BUNDLES (Mengambil Hanya Bundle Berstatus DRAFT untuk Card View Kelola Bundle)
 */
export async function getDraftBundles(arg?: any) {
  const session = await getServerSession(authOptions);
  if (!session || !['RESEARCHER', 'SUPERVISOR', 'PENELITI'].includes((session.user as any).role)) {
    throw new Error('Unauthorized');
  }

  try {
    const rawList = await prisma.bundle.findMany({
      where: {
        status: 'DRAFT'
      },
      include: {
        applications: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    const userIds = Array.from(new Set(rawList.map((b: any) => b.createdById).filter(Boolean))) as string[];
    let userMap = new Map<string, any>();
    if (userIds.length > 0) {
      try {
        const users = await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, name: true, email: true }
        });
        userMap = new Map(users.map(u => [u.id, u]));
      } catch (uErr) {
        // Fallback jika pencarian user terpisah tidak berhasil
      }
    }

    const currentUserName = session.user?.name || 'Peneliti';
    const list = rawList.map((b: any) => ({
      ...b,
      createdBy: b.createdBy || (b.createdById ? userMap.get(b.createdById) : null) || { name: currentUserName }
    }));

    return { success: true, list };
  } catch (error: any) {
    console.error('[ACTION-GET-DRAFT-BUNDLES-ERR]', error);
    return { success: false, list: [], error: 'Gagal mengambil daftar bundle draf.' };
  }
}

/**
 * 4. CREATE BUNDLE (Membuat Wadah Bundle Baru Berstatus DRAFT)
 * Sesuai Tahap 4: Sistem membuat dokumen Bundle baru berstatus DRAFT dan mencatat AuditLog.
 */
export async function createBundle(applicationType?: any) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id || null;

  try {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear + 1, 0, 1);

    // Count bundles created in the current year
    const count = await prisma.bundle.count({
      where: {
        createdAt: {
          gte: startOfYear,
          lt: endOfYear,
        },
      },
    });

    let seq = count + 1;
    let bundleNumber = `973/${String(seq).padStart(3, '0')}-UPT.PD.WIL.IV/${currentYear}`;

    let exists = await prisma.bundle.findUnique({ where: { bundleNumber } });
    while (exists) {
      seq++;
      bundleNumber = `973/${String(seq).padStart(3, '0')}-UPT.PD.WIL.IV/${currentYear}`;
      exists = await prisma.bundle.findUnique({ where: { bundleNumber } });
    }

    const appTypeVal = (applicationType || 'PARTIAL_MUTATION') as any;

    const result = await prisma.$transaction(async (tx) => {
      let newBundle: any;
      if (userId) {
        try {
          newBundle = await tx.bundle.create({
            data: {
              bundleNumber,
              applicationType: appTypeVal,
              status: 'DRAFT',
              createdBy: {
                connect: { id: userId }
              }
            } as any,
          });
        } catch (errConnect) {
          newBundle = await tx.bundle.create({
            data: {
              bundleNumber,
              applicationType: appTypeVal,
              status: 'DRAFT',
            } as any,
          });
        }
      } else {
        newBundle = await tx.bundle.create({
          data: {
            bundleNumber,
            applicationType: appTypeVal,
            status: 'DRAFT',
          } as any,
        });
      }

      if (!newBundle.createdBy && session?.user?.name) {
        newBundle.createdBy = { name: session.user.name };
      }

      let auditLogRecord = null;
      if (userId) {
        try {
          auditLogRecord = await tx.auditLog.create({
            data: {
              action: 'CREATE',
              entityType: 'BUNDLE',
              entityId: newBundle.id,
              oldStatus: null,
              newStatus: 'DRAFT',
              actorId: userId,
              metadata: {
                bundleNumber: newBundle.bundleNumber,
                applicationType: newBundle.applicationType,
              },
            },
          });
        } catch (auditErr) {
          console.warn('[AUDIT-LOG-CREATE-BUNDLE-WARN]', auditErr);
        }
      }

      console.log('\n=================== [TAHAP 4: PEMBUATAN BUNDLE DRAFT] ===================');
      console.log('1. [MODEL: Bundle (DRAFT Created)]');
      console.log(JSON.stringify(newBundle, null, 2));

      if (auditLogRecord) {
        console.log('\n2. [MODEL: AuditLog (Bundle Created)]');
        console.log(JSON.stringify(auditLogRecord, null, 2));
      }
      console.log('=========================================================================\n');

      return newBundle;
    });

    revalidatePath('/');
    return { success: true, bundle: result };
  } catch (e: any) {
    console.error('[ACTION-CREATE-BUNDLE-ERR]', e);
    return { success: false, error: e.message || 'Gagal membuat bundle baru.' };
  }
}

/**
 * 5. ADD APPLICATION TO BUNDLE (Memasukkan Permohonan ke Dalam Bundle DRAFT)
 * Sesuai Tahap 4:
 * - Application.currentBundleId terisi ID Bundle.
 * - Application.status TETAP SUBMITTED (Belum berubah jadi BUNDLED).
 * - Mencatat ApplicationBundleHistory (joinedAt).
 * - Mencatat AuditLog (action: ADD_TO_BUNDLE).
 */
export async function addApplicationToBundle(bundleId: string, permohonanId?: string, extraArg?: any) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id || null;
  const targetId = permohonanId || bundleId;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const bundle = await tx.bundle.findUnique({
        where: { id: bundleId },
      });

      if (!bundle) {
        throw new Error('Bundle tidak ditemukan.');
      }

      const application = await tx.application.findUnique({
        where: { id: targetId },
      });

      if (!application) {
        throw new Error('Permohonan tidak ditemukan.');
      }

      // 1. Validasi Homogenitas Jenis Permohonan dalam Bundle
      const existingApps = await tx.application.findMany({
        where: { currentBundleId: bundleId },
      });

      const normalizeType = (t?: string | null) => {
        if (!t) return '';
        const s = t.trim().toUpperCase();
        if (s === 'PARTIAL_MUTATION') return 'MUTASI_SEBAGIAN';
        if (s === 'MERGER_MUTATION') return 'MUTASI_PENGGABUNGAN';
        if (s === 'EXPIRED_UPDATE') return 'MUTASI_HABIS_UPDATE';
        if (s === 'EXPIRED_REGULAR') return 'MUTASI_HABIS_REGULER';
        if (s === 'NEW_TAX_OBJECT') return 'OBJEK_PAJAK_BARU';
        if (s === 'CORRECTION') return 'PEMBETULAN';
        if (s === 'REACTIVATION') return 'PENGAKTIFAN';
        return s;
      };

      if (existingApps.length > 0) {
        const existingTypeNormalized = normalizeType(existingApps[0].applicationType || bundle.applicationType);
        const appTypeNormalized = normalizeType(application.applicationType);

        if (existingTypeNormalized && appTypeNormalized && existingTypeNormalized !== appTypeNormalized) {
          const formatType = (t: string) => t.replace(/_/g, ' ');
          throw new Error(
            `Gagal: Bundle ini sudah terisi permohonan jenis ${formatType(existingTypeNormalized)}. ` +
            `Tidak dapat memasukkan permohonan jenis ${formatType(appTypeNormalized)}.`
          );
        }
      }

      // 2. Update Bundle: SINKRONISASI applicationType BUNDLE DENGAN PERMOHONAN YANG DIMASUKKAN
      const updatedBundle = await tx.bundle.update({
        where: { id: bundleId },
        data: {
          applicationType: application.applicationType,
        },
      });

      // 2. Update Application: TERIKAT KE BUNDLE TETAPI STATUS TETAP SUBMITTED (FASE DRAFT)
      const updatedApp = await tx.application.update({
        where: { id: targetId },
        data: {
          currentBundleId: bundleId,
          status: 'SUBMITTED', // ✅ TETAP SUBMITTED (Belum BUNDLED saat DRAFT)
        },
      });

      // 3. Catat AuditLog (ADD_TO_BUNDLE)
      // Note: ApplicationBundleHistory TIDAK DICATAT di Fase DRAFT (Hanya dicatat saat LOCK_BUNDLE)
      let auditLogRecord = null;
      if (userId) {
        auditLogRecord = await tx.auditLog.create({
          data: {
            action: 'ADD_TO_BUNDLE',
            entityType: 'APPLICATION',
            entityId: targetId,
            oldStatus: application.status,
            newStatus: application.status, // Status tidak berubah
            actorId: userId,
            metadata: {
              bundleId: bundle.id,
              bundleNumber: bundle.bundleNumber,
              joinedAt: new Date().toISOString(),
            },
          },
        });
      }

      console.log('\n=================== [PEMASUKAN PERMOHONAN KE BUNDLE DRAFT] ===================');
      console.log('1. [MODEL: Bundle (Synced applicationType)]');
      console.log(JSON.stringify(updatedBundle, null, 2));

      console.log('\n2. [MODEL: Application (Bound to Bundle, Status SUBMITTED)]');
      console.log(JSON.stringify(updatedApp, null, 2));

      if (auditLogRecord) {
        console.log('\n3. [MODEL: AuditLog (ADD_TO_BUNDLE)]');
        console.log(JSON.stringify(auditLogRecord, null, 2));
      }
      console.log('========================================================================================\n');

      return updatedApp;
    });

    revalidatePath('/');
    return { success: true, permohonan: result };
  } catch (e: any) {
    console.error('[ACTION-ADD-APP-TO-BUNDLE-ERR]', e);
    return { success: false, error: e.message || 'Gagal memasukkan permohonan ke bundle.' };
  }
}

/**
 * 6. REMOVE APPLICATION FROM BUNDLE (Mengeluarkan Permohonan dari Bundle)
 * Mengosongkan currentBundleId. Jika pernah locked (memiliki active history), update leftAt.
 */
export async function removeApplicationFromBundle(bundleId: string, permohonanId?: string, notes?: string) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id || null;
  const targetId = permohonanId || bundleId;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const application = await tx.application.findUnique({
        where: { id: targetId },
      });

      if (!application) {
        throw new Error('Permohonan tidak ditemukan.');
      }

      // 1. Unbind currentBundleId from Application
      const updatedApp = await tx.application.update({
        where: { id: targetId },
        data: {
          currentBundleId: null,
          status: 'SUBMITTED',
        },
      });

      // 2. Update ApplicationBundleHistory (Hanya jika permohonan pernah menjadi anggota resmi bundle locked)
      const activeHistories = await tx.applicationBundleHistory.findMany({
        where: {
          applicationId: targetId,
          bundleId: bundleId,
          leftAt: null,
        },
      });

      for (const hist of activeHistories) {
        await tx.applicationBundleHistory.update({
          where: { id: hist.id },
          data: {
            leftAt: new Date(),
            reasonLeft: notes || 'Dikeluarkan dari bundle',
          },
        });
      }

      // 3. Catat AuditLog (REMOVE_FROM_BUNDLE)
      let auditLogRecord = null;
      if (userId) {
        auditLogRecord = await tx.auditLog.create({
          data: {
            action: 'REMOVE_FROM_BUNDLE',
            entityType: 'APPLICATION',
            entityId: targetId,
            oldStatus: application.status,
            newStatus: application.status,
            actorId: userId,
            metadata: {
              bundleId: bundleId,
              reasonLeft: notes || 'Dikeluarkan dari bundle',
              leftAt: new Date().toISOString(),
            },
          },
        });
      }

      console.log('\n=================== [MENGELUARKAN PERMOHONAN DARI BUNDLE] ===================');
      console.log('1. [MODEL: Application (Unbound from Bundle)]');
      console.log(JSON.stringify(updatedApp, null, 2));

      if (auditLogRecord) {
        console.log('\n2. [MODEL: AuditLog (REMOVE_FROM_BUNDLE)]');
        console.log(JSON.stringify(auditLogRecord, null, 2));
      }
      console.log('=====================================================================================\n');

      return updatedApp;
    });

    revalidatePath('/');
    return { success: true, status: 'REMOVED_IMMEDIATELY', permohonan: result };
  } catch (error: any) {
    console.error('[ACTION-REMOVE-APP-FROM-BUNDLE-ERR]', error);
    return { success: false, error: error.message || 'Gagal mengeluarkan permohonan dari bundle.' };
  }
}

/**
 * 7. LOCK BUNDLE (Penguncian Bundle & Commit Keanggotaan Resmi)
 * Mengunci status bundle menjadi LOCKED, meng-update status permohonan menjadi BUNDLED,
 * dan mencatat keanggotaan resmi di ApplicationBundleHistory serta AuditLog.
 */
export async function lockBundle(bundleId: string) {
  const session = await getServerSession(authOptions);
  if (!session || !['RESEARCHER', 'SUPERVISOR', 'PENELITI'].includes((session.user as any).role)) {
    throw new Error('Unauthorized');
  }
  const userId = (session.user as any).id || null;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const bundle = await tx.bundle.findUnique({
        where: { id: bundleId },
        include: { applications: true }
      });

      if (!bundle) {
        throw new Error('Bundle tidak ditemukan.');
      }

      const apps = bundle.applications || [];
      if (apps.length === 0) {
        throw new Error('Bundle kosong (0 Pemohon) tidak dapat dikunci. Silakan masukkan permohonan terlebih dahulu.');
      }

      // 1. Update status Bundle menjadi LOCKED
      const updatedBundle = await tx.bundle.update({
        where: { id: bundleId },
        data: { status: 'LOCKED' }
      });

      // 2. Commit status permohonan menjadi BUNDLED & buat record ApplicationBundleHistory
      const lockTimestamp = new Date();
      for (const app of apps) {
        // Update Application Status -> BUNDLED
        await tx.application.update({
          where: { id: app.id },
          data: { status: 'BUNDLED' }
        });

        // Buat/pastikan record ApplicationBundleHistory aktif (hanya jika belum ada history aktif)
        const activeHist = await tx.applicationBundleHistory.findFirst({
          where: {
            applicationId: app.id,
            bundleId: bundleId,
            leftAt: null
          }
        });

        if (!activeHist) {
          await tx.applicationBundleHistory.create({
            data: {
              applicationId: app.id,
              bundleId: bundleId,
              joinedAt: lockTimestamp,
              leftAt: null,
              reasonLeft: null
            }
          });
        }
      }

      // 3. Catat AuditLog (LOCK_BUNDLE)
      if (userId) {
        try {
          await tx.auditLog.create({
            data: {
              action: 'UPDATE_STATUS',
              entityType: 'BUNDLE',
              entityId: bundleId,
              oldStatus: 'DRAFT',
              newStatus: 'LOCKED',
              actorId: userId,
              metadata: {
                bundleNumber: updatedBundle.bundleNumber,
                applicationCount: apps.length,
                lockedAt: lockTimestamp.toISOString()
              }
            }
          });
        } catch (auditErr) {
          console.warn('[AUDIT-LOG-LOCK-BUNDLE-WARN]', auditErr);
        }
      }

      return updatedBundle;
    });

    await notifyAllUsersOfRole(UserRole.ARCHIVIST, 'Bundle Siap Digitisasi', `Bundle ${result.bundleNumber} telah dikunci.`);
    revalidatePath('/');
    return { success: true, bundle: result };
  } catch (error: any) {
    console.error('[ACTION-LOCK-BUNDLE-ERR]', error);
    return { success: false, error: error.message || 'Gagal mengunci bundle.' };
  }
}

/**
 * 8. GET PENDING RETURN REQUEST FOR APPLICATION
 */
export async function getPendingReturnForApplication(permohonanId: string) {
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

/**
 * 9. RESET EMPTY BUNDLE TYPE
 */
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

/**
 * 11. GET BUNDLE VERSIONS (Mengambil Riwayat Versi & Audit Log Checkpoints Bundle)
 */
export async function getBundleVersions(bundleId: string) {
  try {
    const bundle = await prisma.bundle.findUnique({
      where: { id: bundleId },
      include: {
        createdBy: true,
        applications: true,
        applicationHistory: true
      }
    });

    if (!bundle) {
      return { success: false, error: 'Bundle tidak ditemukan.', list: [] };
    }

    const apps = bundle.applications || [];

    // Fetch audit logs for lock events of this bundle
    const lockLogs = await prisma.auditLog.findMany({
      where: {
        entityType: 'BUNDLE',
        entityId: bundleId,
        newStatus: 'LOCKED'
      },
      include: { actor: true },
      orderBy: { createdAt: 'desc' }
    });

    const list: any[] = [];

    // If bundle is currently LOCKED, add the active locked version (Versi 1.0)
    if (bundle.status === 'LOCKED') {
      const lockLog = lockLogs[0];
      list.push({
        id: `locked-${bundle.id}`,
        versionLabel: 'Versi 1.0 (Dikunci)',
        snapshotType: 'BUNDLE_LOCKED',
        createdAt: lockLog?.createdAt || bundle.updatedAt || bundle.createdAt,
        actor: lockLog?.actor || bundle.createdBy || { name: 'Peneliti' },
        note: `Bundle telah dikunci resmi dengan ${apps.length} permohonan.`,
        snapshotData: {
          bundleNumber: bundle.bundleNumber,
          status: 'LOCKED',
          applicationType: bundle.applicationType,
          applications: apps,
        }
      });
    }

    // Add historical lock checkpoints if any older lock logs exist
    for (let i = 1; i < lockLogs.length; i++) {
      const log = lockLogs[i];
      const verNum = (lockLogs.length - i).toFixed(1);
      list.push({
        id: log.id,
        versionLabel: `Versi ${verNum} (Terkunci)`,
        snapshotType: 'BUNDLE_LOCKED',
        createdAt: log.createdAt,
        actor: log.actor,
        note: 'Versi bundle resmi yang telah dikunci sebelumnya.',
        snapshotData: {
          bundleNumber: bundle.bundleNumber,
          status: 'LOCKED',
          applicationType: bundle.applicationType,
          applications: apps,
        }
      });
    }

    return { success: true, list, bundle };
  } catch (e: any) {
    console.error('[ACTION-GET-BUNDLE-VERSIONS-ERR]', e);
    return { success: false, error: e.message || 'Gagal memuat versi bundle.', list: [] };
  }
}

/**
 * 10. RESUBMIT RESEARCHER APPLICATION
 */
export async function resubmitResearcherApplication(permohonanId: string, note?: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, error: 'Unauthorized: Sesi tidak ditemukan.' };
  }

  try {
    const existing = await prisma.application.findUnique({
      where: { id: permohonanId },
      select: {
        id: true,
        status: true,
        applicationType: true,
        applicationNumber: true,
        serviceNumberDate: true,
        completionDate: true,
        previousData: true,
        targetData: true,
      }
    });

    if (!existing) {
      return { success: false, error: 'Permohonan tidak ditemukan.' };
    }

    if (existing.status !== 'REVISION') {
      return { success: false, error: 'Hanya permohonan berstatus REVISION yang dapat di-resubmit.' };
    }

    const updated = await prisma.$transaction(async (tx) => {
      const app = await tx.application.update({
        where: { id: permohonanId },
        data: { status: 'SUBMITTED' }
      });

      await tx.applicationSnapshot.create({
        data: {
          applicationId: permohonanId,
          snapshotType: 'RESUBMIT_AFTER_REVISION',
          note: note || 'Permohonan telah direvisi dan diajukan ulang ke antrean oleh Peneliti',
          actorId: (session.user as any).id,
          snapshotData: {
            applicationType: existing.applicationType,
            applicationNumber: existing.applicationNumber,
            serviceNumberDate: existing.serviceNumberDate,
            completionDate: existing.completionDate,
            status: 'SUBMITTED',
            previousData: existing.previousData,
            targetData: existing.targetData,
          } as any
        }
      });

      await tx.auditLog.create({
        data: {
          action: 'UPDATE_STATUS',
          entityType: 'APPLICATION',
          entityId: permohonanId,
          oldStatus: 'REVISION',
          newStatus: 'SUBMITTED',
          actorId: (session.user as any).id,
          metadata: {
            applicationNumber: existing.applicationNumber,
            description: `Peneliti melakukan resubmit permohonan No. ${existing.applicationNumber} dari REVISION ke SUBMITTED`
          }
        }
      });

      return app;
    });

    revalidatePath('/');
    return { success: true, permohonan: updated };
  } catch (e: any) {
    console.error('[ACTION-RESUBMIT-RESEARCHER-ERR]', e);
    return { success: false, error: e.message || 'Gagal melakukan resubmit permohonan.' };
  }
}

/**
 * 12. GET HISTORY BUNDLES (Mengambil Seluruh Riwayat Bundle Peneliti)
 */
export async function getHistoryBundles() {
  const session = await getServerSession(authOptions);
  if (!session || !['RESEARCHER', 'SUPERVISOR', 'PENELITI'].includes((session.user as any).role)) {
    return { success: false, list: [], error: 'Unauthorized' };
  }

  try {
    const rawList = await prisma.bundle.findMany({
      where: {
        status: { not: 'DRAFT' }
      },
      include: {
        applications: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    const userIds = Array.from(new Set(rawList.map((b: any) => b.createdById).filter(Boolean))) as string[];
    let userMap = new Map<string, any>();
    if (userIds.length > 0) {
      try {
        const users = await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, name: true, email: true }
        });
        userMap = new Map(users.map(u => [u.id, u]));
      } catch (uErr) {
        // Fallback
      }
    }

    const currentUserName = session.user?.name || 'Peneliti';
    const list = rawList.map((b: any) => ({
      ...b,
      createdBy: b.createdBy || (b.createdById ? userMap.get(b.createdById) : null) || { name: currentUserName }
    }));

    return { success: true, list };
  } catch (error: any) {
    console.error('[ACTION-GET-HISTORY-BUNDLES-ERR]', error);
    return { success: false, list: [], error: 'Gagal mengambil riwayat bundle.' };
  }
}

// =========================================================================
// BACKWARD COMPATIBILITY EXPORT ALIASES
// =========================================================================
export const getSubmittedPermohonan = getSubmittedApplications;
export const mintaRevisi = requestRevision;
export const addPermohonanToBundle = addApplicationToBundle;
export const removePermohonanFromBundle = removeApplicationFromBundle;
export const getPendingKoreksiForPermohonan = getPendingReturnForApplication;
export const resubmitPermohonanPeneliti = resubmitResearcherApplication;
export { getDraftBundles as getBundles };

