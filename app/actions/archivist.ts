"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";
import { UserRole } from "@prisma/client";

function normalizeApplicationData(app: any) {
  if (!app) return app;
  const targetDataArchives = (app.targetData || []).flatMap((td: any) => td.digitalArchives || []);
  const arsipDigital = (app.arsipDigital && app.arsipDigital.length > 0)
    ? app.arsipDigital
    : targetDataArchives;

  return {
    ...app,
    arsipDigital
  };
}

function normalizeBundleData(b: any, userMap?: Map<string, any>, currentUserName?: string) {
  if (!b) return b;
  const rawApps = b.applications || b.permohonan || [];
  const normalizedApps = rawApps.map(normalizeApplicationData);

  return {
    ...b,
    nomorBundle: b.nomorBundle || b.bundleNumber,
    jenisPermohonan: b.jenisPermohonan || b.applicationType,
    applications: normalizedApps,
    permohonan: normalizedApps,
    createdBy: b.createdBy || (b.createdById && userMap ? userMap.get(b.createdById) : null) || (currentUserName ? { name: currentUserName } : null)
  };
}

/**
 * Action: Get all bundles that Archivist can work on.
 */
export async function getDigitizationBundles() {
  const session = await getServerSession(authOptions);
  if (!session || !["ARCHIVIST", "SUPERVISOR", "PENGARSIP"].includes((session.user as any).role)) {
    throw new Error("Unauthorized");
  }

  try {
    const [list, allPermohonan] = await Promise.all([
      prisma.bundle.findMany({
        where: {
          status: { in: ["LOCKED", "IN_MANIFEST"] }
        },
        include: {
          applications: true
        },
        orderBy: { createdAt: "desc" }
      }),
      prisma.application.findMany({
        where: {
          currentBundle: {
            status: { in: ["LOCKED", "IN_MANIFEST"] }
          }
        },
        select: {
          id: true,
          status: true,
          applicationType: true,
          currentBundleId: true,
          targetData: true
        }
      })
    ]);

    // Active bundles: Bundles that still have applications waiting for digital archive upload (not all ARCHIVED)
    const activeList = list.filter((b: any) => {
      const apps = b.applications || b.permohonan || [];
      if (apps.length === 0) return true;
      return apps.some((a: any) => a.status !== "ARCHIVED");
    });

    const normalizedList = activeList.map((b: any) => normalizeBundleData(b));
    const normalizedAllPermohonan = allPermohonan.map(normalizeApplicationData);

    return { success: true, list: normalizedList, allPermohonan: normalizedAllPermohonan };
  } catch (error: any) {
    console.error("[ACTION-GET-DIGIT-BUNDLES-ERR]", error);
    return { success: false, list: [], error: "Gagal mengambil daftar bundle digitalisasi." };
  }
}

/**
 * Action: Get all bundles that are LOCKED and fully digitized (all applications are ARCHIVED).
 */
export async function getArchivistHistoryBundles() {
  const session = await getServerSession(authOptions);
  if (!session || !["ARCHIVIST", "SUPERVISOR", "PENGARSIP"].includes((session.user as any).role)) {
    return { success: false, list: [], error: "Unauthorized" };
  }

  try {
    const rawList = await prisma.bundle.findMany({
      where: {
        status: { in: ["LOCKED", "IN_MANIFEST"] }
      },
      include: {
        applications: true,
      },
      orderBy: { createdAt: "desc" }
    });

    // Filter bundles where ALL applications are digitized (status === 'ARCHIVED')
    const completedBundles = rawList.filter((b: any) => {
      const apps = b.applications || b.permohonan || [];
      if (apps.length === 0) return false;
      return apps.every((a: any) => a.status === "ARCHIVED");
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

    const currentUserName = session.user?.name || "Pengarsip";
    // Fallback if no bundles are 100% archived yet, return bundles with at least 1 archived app
    const targetList = completedBundles.length > 0 ? completedBundles : rawList.filter((b: any) => {
      const apps = b.applications || b.permohonan || [];
      return apps.some((a: any) => a.status === "ARCHIVED");
    });

    const list = targetList.map((b: any) => normalizeBundleData(b, userMap, currentUserName));

    return { success: true, list };
  } catch (error: any) {
    console.error("[ACTION-GET-ARCHIVIST-HISTORY-ERR]", error);
    return { success: false, list: [], error: "Gagal mengambil riwayat digitalisasi arsip." };
  }
}

/**
 * Action: Retrieve details of a specific bundle.
 */
export async function getBundleDetails(bundleId: string) {
  const session = await getServerSession(authOptions);
  if (!session || !["ARCHIVIST", "SUPERVISOR", "PENGARSIP"].includes((session.user as any).role)) {
    throw new Error("Unauthorized");
  }

  try {
    const bundle = await prisma.bundle.findUnique({
      where: { id: bundleId },
      include: {
        applications: true
      }
    });

    if (!bundle) {
      return { success: false, error: "Bundle tidak ditemukan." };
    }

    const normalizedBundle = normalizeBundleData(bundle);

    return { success: true, bundle: normalizedBundle };
  } catch (error: any) {
    console.error("[ACTION-GET-BUNDLE-DETAILS-ERR]", error);
    return { success: false, error: "Gagal mengambil detail bundle." };
  }
}

import { checkAllTargetDataArchived } from "@/lib/archiveHelpers";

export async function uploadArsipDigital(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || !["ARCHIVIST", "SUPERVISOR", "PENGARSIP"].includes((session.user as any).role)) {
    return { success: false, error: "Unauthorized" };
  }

  const file = formData.get("file") as File;
  const permohonanId = formData.get("permohonanId") as string;
  const targetDataId = (formData.get("targetDataId") || formData.get("idTargetData") || formData.get("dataBaruId")) as string | null;

  if (!file || !permohonanId) {
    return { success: false, error: "File dan Permohonan ID wajib diisi." };
  }

  try {
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileName = `arsip_${permohonanId}_${Date.now()}.${file.name.split('.').pop() || 'pdf'}`;
    const filePath = path.join(uploadsDir, fileName);
    const arrayBuffer = await file.arrayBuffer();
    await fs.promises.writeFile(filePath, Buffer.from(arrayBuffer));
    const urlBlob = `/uploads/${fileName}`;

    return await prisma.$transaction(async (tx) => {
      const application = await tx.application.findUnique({
        where: { id: permohonanId }
      });

      if (!application) {
        throw new Error("Permohonan tidak ditemukan.");
      }

      const archiveId = `arc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const newArchiveItem = {
        idArchive: archiveId,
        urlBlob,
        fileName: file.name,
        status: "ACTIVE" as const,
        uploadedBy: session.user.id,
        createdAt: new Date(),
        revisionNote: null,
        supersededBy: null,
        supersededAt: null
      };

      let existingTargetData = (application.targetData || []) as any[];
      let updatedTargetData: any[] = [];

      if (existingTargetData.length > 0) {
        let matched = false;
        updatedTargetData = existingTargetData.map((td) => {
          const targetIdMatch = targetDataId && (td.idTargetData === targetDataId || td.id === targetDataId);
          if (targetIdMatch || (!targetDataId && !matched)) {
            matched = true;
            const currentArchives = td.digitalArchives || [];
            return {
              ...td,
              isArchived: true,
              digitalArchives: [...currentArchives, newArchiveItem]
            };
          }
          return td;
        });

        // If targetDataId didn't match any existing target data, update the first one
        if (targetDataId && !matched) {
          updatedTargetData[0] = {
            ...updatedTargetData[0],
            isArchived: true,
            digitalArchives: [...(updatedTargetData[0].digitalArchives || []), newArchiveItem]
          };
        }
      } else {
        updatedTargetData = [
          {
            idTargetData: targetDataId || `td_${Date.now()}`,
            ownerName: "Pemohon",
            isVerified: false,
            isArchived: true,
            digitalArchives: [newArchiveItem]
          }
        ];
      }

      const isAllTargetArchived = checkAllTargetDataArchived(updatedTargetData);
      const oldStatus = application.status;
      const newStatus = isAllTargetArchived ? "ARCHIVED" : "BUNDLED";

      const updatedApp = await tx.application.update({
        where: { id: permohonanId },
        data: {
          targetData: updatedTargetData,
          status: newStatus
        }
      });

      // 1. Audit log for document upload
      await tx.auditLog.create({
        data: {
          entityType: "APPLICATION",
          entityId: permohonanId,
          action: "UPLOAD_DOCUMENT",
          oldStatus: oldStatus,
          newStatus: newStatus,
          actorId: session.user.id,
          metadata: {
            targetDataId: targetDataId || (updatedTargetData[0]?.idTargetData ?? null),
            fileName: file.name,
            archiveId
          }
        }
      });

      // 2. Audit log for status transition when all target data archived
      if (isAllTargetArchived && oldStatus !== "ARCHIVED") {
        const totalDocs = updatedTargetData.reduce(
          (sum: number, td: any) => sum + (td.digitalArchives?.length || 0),
          0
        );

        await tx.auditLog.create({
          data: {
            entityType: "APPLICATION",
            entityId: permohonanId,
            action: "UPDATE_STATUS",
            oldStatus: oldStatus,
            newStatus: "ARCHIVED",
            actorId: session.user.id,
            metadata: {
              trigger: "ALL_TARGET_DATA_ARCHIVED",
              totalTargetData: updatedTargetData.length,
              totalDocuments: totalDocs
            }
          }
        });
      }

      revalidatePath("/");
      return { success: true, permohonan: updatedApp, urlBlob, isFullyArchived: isAllTargetArchived };
    });
  } catch (error: any) {
    console.error("[UPLOAD-ARSIP-ERR]", error);
    return { success: false, error: error.message || "Gagal mengunggah berkas arsip digital." };
  }
}

export async function ajukanKembalikanKePeneliti(permohonanId: string, alasan: string) {
  const session = await getServerSession(authOptions);
  if (!session || !["ARCHIVIST", "SUPERVISOR", "PENGARSIP"].includes((session.user as any).role)) {
    throw new Error("Unauthorized");
  }

  try {
    const updated = await prisma.application.update({
      where: { id: permohonanId },
      data: { status: "REVISION", currentBundleId: null }
    });

    revalidatePath("/");
    return { success: true, permohonan: updated };
  } catch (error: any) {
    console.error("[AJUKAN-KEMBALIKAN-ERR]", error);
    return { success: false, error: error.message || "Gagal mengembalikan permohonan ke peneliti." };
  }
}
