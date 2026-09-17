"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendWhatsApp } from "@/lib/fonnte";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";
import { notifyAllUsersOfRole } from "@/lib/notifications";
import { UserRole } from "@prisma/client";
import { checkAllApplicationsArchived } from "@/lib/archiveHelpers";

/**
 * Action: Create a new Manifest in DRAFT status.
 * Generates unique manifestNumber in format: 973-MANIFEST/{sequence}/{year}
 */
export async function createManifest() {
  const session = await getServerSession(authOptions);

  if (!session || !["SENDER", "SUPERVISOR"].includes((session.user as any).role)) {
    throw new Error("Unauthorized");
  }

  const currentYear = new Date().getFullYear();
  const suffix = `/${currentYear}`;

  try {
    const latestManifest = await prisma.manifest.findFirst(
      {
        where: {
          manifestNumber: {
            endsWith: suffix,
          }
        },
        orderBy: {
          createdAt: "desc"
        },
        select: {
          manifestNumber: true,
        }
      }
    );

    let nextSequence = 1;

    if (latestManifest) {
      const parts = latestManifest.manifestNumber.split("/");
      if (parts.length === 3 && parts[0] === "973-MANIFEST") {
        const lastSeq = parseInt(parts[1], 10);
        if (!isNaN(lastSeq)) {
          nextSequence = lastSeq + 1;
        }
      }
    }

    const manifestNumber = `973-MANIFEST/${nextSequence}${suffix}`;

    const result = await prisma.$transaction(async (tx) => {
      const manifest = await tx.manifest.create({
        data: {
          manifestNumber,
          status: "DRAFT",
          createdById: session.user.id,
        },
        include: {
          bundles: {
            include: {
              applications: true
            },
          },
        }
      });

      const auditLog = await tx.auditLog.create({
        data: {
          entityType: "MANIFEST",
          entityId: manifest.id,
          action: "CREATE",
          actorId: session.user.id,
          newStatus: "DRAFT",
          metadata: {
            manifestNumber: manifest.manifestNumber
          }
        }
      });
      return { manifest, auditLog };
    });

    revalidatePath("/");
    return { success: true, manifest: result.manifest, auditLog: result.auditLog };
  } catch (error: any) {
    console.error("[ACTION-CREATE-MANIFEST-ERR]", error);

    if (error.code === "P2002") {
      return {
        success: false,
        error: "Sistem sedang sibuk, nomor manifest bertabrakan. Silakan coba lagi.",
      }
    }

    return {
      success: false,
      error: error.message || "Gagal membuat manifest baru."
    }
  }
}

/**
 * Action: Retrieve manifests in the system with optimized field selection and status filtering.
 */
export async function getManifests(params?: {
  status?: string;
  page?: number;
  limit?: number;
  search?: string;
}) {
  const session = await getServerSession(authOptions);

  if (!session || !["SENDER", "SUPERVISOR"].includes((session.user as any).role)) {
    throw new Error("Unauthorized");
  }

  const { status = "DRAFT", page = 1, limit = 48, search = "" } = params || {};

  try {
    const whereClause: any = {};
    if (status && status !== "ALL") {
      whereClause.status = status as any;
    }

    if (search.trim() !== "") {
      const matchedUsers = await prisma.user.findMany({
        where: {
          name: { contains: search, mode: "insensitive" }
        },
        select: {
          id: true,
        }
      });
      const matchedUserIds = matchedUsers.map((user) => user.id);
      whereClause.OR = [
        { manifestNumber: { contains: search, mode: "insensitive" } },
        { createdById: { in: matchedUserIds } },
      ]
    }

    const skip = (page - 1) * limit;

    const [rawList, total] = await Promise.all([
      prisma.manifest.findMany({
        where: whereClause,
        take: limit,
        skip: skip,
        select: {
          id: true,
          manifestNumber: true,
          status: true,
          createdBy: {
            select: {
              name: true,
            }
          },
          createdAt: true,
          bundles: {
            select: {
              applications: {
                select: {
                  targetData: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: "desc" }
      }),
      prisma.manifest.count({ where: whereClause })
    ]);

    const list = rawList.map((m) => {
      const bundles = m.bundles || [];
      const bundleCount = bundles.length;

      const applicantCount = bundles.reduce((bAcc, b) => {
        const apps = b.applications || [];
        return bAcc + apps.reduce((pAcc, p) => {
          if (!p.targetData) {
            return pAcc + 1;
          }

          if (Array.isArray(p.targetData)) {
            const count = p.targetData.length === 0 ? 1 : p.targetData.length;
            return pAcc + count;
          }
          return pAcc + 1;
        }, 0)
      }, 0);

      return {
        id: m.id,
        manifestNumber: m.manifestNumber,
        status: m.status,
        createdBy: m.createdBy,
        createdAt: m.createdAt,
        bundleCount,
        applicantCount,
      };
    });

    return {
      success: true,
      list,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error: any) {
    console.error("[ACTION-GET-MANIFESTS-ERR]", error);

    return { success: false, list: [], error: "Gagal mengambil daftar manifest." };
  }
}

/**
 * Action: Get all bundles in LOCKED status that are fully digitalized
 * Application: ARCHIVED | Bundle: LOCKED | Manifest: null
 */
export async function getEligibleBundles() {
  const session = await getServerSession(authOptions);

  if (!session || !["SENDER", "SUPERVISOR"].includes((session.user as any).role)) {
    throw new Error("Unauthorized");
  }

  try {
    const eligibleList = await prisma.bundle.findMany({
      where: {
        status: "LOCKED",
        OR: [
          { currentManifestId: null },
          { currentManifestId: { isSet: false } }
        ],
        applications: {
          some: {},
          none: {
            status: { not: "ARCHIVED" },
          }
        }
      },
      select: {
        id: true,
        bundleNumber: true,
        applicationType: true,
        status: true,
        createdAt: true,
        applications: {
          select: {
            id: true,
            targetData: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return { success: true, list: eligibleList };
  } catch (error: any) {
    console.error("[ACTION-GET-ELIGIBLE-BUNDLES-ERR]", error);

    return { success: false, list: [], error: "Gagal mengambil antrean bundle logistik." };
  }
}


/**
 * Action: Retrieve details of a specific manifest, including its bundles and applications.
 */
export async function getManifestDetails(manifestId: string) {
  const session = await getServerSession(authOptions);

  if (!session || !["SENDER", "SUPERVISOR"].includes((session.user as any).role)) {
    throw new Error("Unauthorized");
  }

  try {
    const manifest = await prisma.manifest.findUnique({
      where: { id: manifestId },
      select: {
        id: true,
        manifestNumber: true,
        status: true,
        createdAt: true,
        createdBy: {
          select: { name: true }
        },
        bundles: {
          select: {
            id: true,
            bundleNumber: true,
            applicationType: true,
            status: true,
            createdAt: true,
            applications: {
              select: {
                id: true,
                applicationType: true,
                applicationNumber: true,
                serviceNumberDate: true,
                completionDate: true,
                status: true,
                isFavorite: true,
                createdAt: true,
                previousData: true,
                targetData: true,
              }
            }
          }
        }
      }
    });

    if (!manifest) {
      return { success: false, error: "Manifest tidak ditemukan." };
    }

    return { success: true, manifest };
  } catch (error: any) {
    console.error("[ACTION-GET-MANIFEST-DETAILS-ERR]", error);

    return { success: false, error: "Gagal mengambil detail manifest." };
  }
}

/**
 * Action: Add an eligible locked bundle to a DRAFT manifest.
 */
export async function addBundleToManifest(manifestId: string, bundleId: string) {
  const session = await getServerSession(authOptions);
  if (!session || !["SENDER", "SUPERVISOR", "PENGIRIM"].includes((session.user as any).role)) {
    throw new Error("Unauthorized");
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const manifest = await tx.manifest.findUnique({
        where: { id: manifestId }
      });
      if (!manifest) {
        throw new Error("Manifest tidak ditemukan.");
      }
      if (manifest.status !== "DRAFT") {
        throw new Error("Hanya manifest berstatus DRAFT yang dapat ditambah bundle.");
      }

      const bundle = await tx.bundle.findUnique({
        where: { id: bundleId },
        include: { applications: true }
      });
      if (!bundle) {
        throw new Error("Bundle tidak ditemukan.");
      }
      if (bundle.status !== "LOCKED" || bundle.currentManifestId) {
        throw new Error("Hanya bundle berstatus Terkunci (LOCKED) yang dapat ditambahkan.");
      }

      const updatedBundle = await tx.bundle.update({
        where: { id: bundleId },
        data: {
          currentManifestId: manifestId,
          status: "IN_MANIFEST"
        }
      });

      await tx.auditLog.create({
        data: {
          entityType: "BUNDLE",
          entityId: bundleId,
          action: "ADD_TO_MANIFEST",
          actorId: session.user.id,
          metadata: { manifestId, manifestNumber: manifest.manifestNumber }
        }
      });

      return { success: true, bundle: updatedBundle };
    });
  } catch (error: any) {
    console.error("[ACTION-ADD-BUNDLE-TO-MANIFEST-ERR]", error);
    return { success: false, error: error.message || "Gagal menambahkan bundle ke manifest." };
  }
}

/**
 * Action: Remove a bundle from a DRAFT manifest.
 */
export async function removeBundleFromManifest(manifestId: string, bundleId: string) {
  const session = await getServerSession(authOptions);
  if (!session || !["SENDER", "SUPERVISOR", "PENGIRIM"].includes((session.user as any).role)) {
    throw new Error("Unauthorized");
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const manifest = await tx.manifest.findUnique({
        where: { id: manifestId }
      });
      if (!manifest) {
        throw new Error("Manifest tidak ditemukan.");
      }
      if (manifest.status !== "DRAFT") {
        throw new Error("Hanya manifest berstatus DRAFT yang dapat dilepas bundle.");
      }

      const bundle = await tx.bundle.findUnique({
        where: { id: bundleId }
      });
      if (!bundle || bundle.currentManifestId !== manifestId) {
        throw new Error("Bundle tidak berada di dalam manifest yang dipilih.");
      }

      const updatedBundle = await tx.bundle.update({
        where: { id: bundleId },
        data: {
          currentManifestId: null,
          status: "LOCKED"
        }
      });

      await tx.auditLog.create({
        data: {
          entityType: "BUNDLE",
          entityId: bundleId,
          action: "REMOVE_FROM_MANIFEST",
          actorId: session.user.id,
          metadata: { manifestId, manifestNumber: manifest.manifestNumber }
        }
      });

      return { success: true, bundle: updatedBundle };
    });
  } catch (error: any) {
    console.error("[ACTION-REMOVE-BUNDLE-FROM-MANIFEST-ERR]", error);
    return { success: false, error: error.message || "Gagal melepas bundle dari manifest." };
  }
}

/**
 * Action: Lock manifest (DRAFT -> LOCKED).
 */
export async function lockManifest(manifestId: string) {
  const session = await getServerSession(authOptions);
  if (!session || !["SENDER", "SUPERVISOR", "PENGIRIM"].includes((session.user as any).role)) {
    throw new Error("Unauthorized");
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const manifest = await tx.manifest.findUnique({
        where: { id: manifestId },
        include: { bundles: true }
      });

      if (!manifest) {
        throw new Error("Manifest tidak ditemukan.");
      }

      if (manifest.status !== "DRAFT") {
        throw new Error("Hanya manifest berstatus DRAFT yang dapat dikunci.");
      }

      if (manifest.bundles.length === 0) {
        throw new Error("Gagal mengunci: Manifest masih kosong. Masukkan minimal 1 bundle.");
      }

      const updated = await tx.manifest.update({
        where: { id: manifestId },
        data: { status: "LOCKED" }
      });

      await tx.auditLog.create({
        data: {
          entityType: "MANIFEST",
          entityId: manifestId,
          action: "LOCK_MANIFEST",
          actorId: session.user.id
        }
      });

      return { success: true, manifest: updated };
    });
  } catch (error: any) {
    console.error("[ACTION-LOCK-MANIFEST-ERR]", error);
    return { success: false, error: error.message || "Gagal mengunci manifest." };
  }
}

/**
 * Action: Revisi Manifest (LOCKED -> DRAFT).
 */
export async function revisiManifest(manifestId: string) {
  const session = await getServerSession(authOptions);
  if (!session || !["SENDER", "SUPERVISOR", "PENGIRIM"].includes((session.user as any).role)) {
    throw new Error("Unauthorized");
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const manifest = await tx.manifest.findUnique({
        where: { id: manifestId }
      });

      if (!manifest) {
        throw new Error("Manifest tidak ditemukan.");
      }

      if (manifest.status !== "LOCKED") {
        throw new Error("Hanya manifest berstatus LOCKED yang dapat direvisi.");
      }

      const updated = await tx.manifest.update({
        where: { id: manifestId },
        data: { status: "DRAFT" }
      });

      await tx.auditLog.create({
        data: {
          entityType: "MANIFEST",
          entityId: manifestId,
          action: "ADD_TO_MANIFEST",
          actorId: session.user.id
        }
      });

      return { success: true, manifest: updated };
    });
  } catch (error: any) {
    console.error("[ACTION-REVISI-MANIFEST-ERR]", error);
    return { success: false, error: error.message || "Gagal merevisi manifest." };
  }
}

/**
 * Action: Complete shipment by uploading receipt proof (LOCKED -> SENT).
 */
export async function uploadBuktiTandaTerima(manifestId: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || !["SENDER", "SUPERVISOR", "PENGIRIM"].includes((session.user as any).role)) {
    return { success: false, error: "Unauthorized" };
  }

  const file = formData.get("file") as File;

  if (!file || file.size === 0) {
    return { success: false, error: "File bukti tanda terima wajib diunggah." };
  }

  const MAX_SIZE = 20 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return { success: false, error: "Ukuran file tidak boleh melebihi 20 MB." };
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png"];

  let isValidType = false;
  let fileExt = "";
  try {
    const { fileTypeFromBuffer } = await (eval('import("file-type")') as any);
    const type = await fileTypeFromBuffer(buffer);
    if (type && allowedMimeTypes.includes(type.mime)) {
      isValidType = true;
      fileExt = type.ext;
    }
  } catch (e) {
    if (buffer.length >= 4) {
      if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
        isValidType = true;
        fileExt = "pdf";
      } else if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
        isValidType = true;
        fileExt = "jpg";
      } else if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
        isValidType = true;
        fileExt = "png";
      }
    }
  }

  if (!isValidType) {
    return { success: false, error: "File bukti wajib berupa dokumen PDF, JPG, atau PNG." };
  }

  try {
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileName = `tanda_terima_${manifestId}_${Date.now()}.${fileExt}`;
    const filePath = path.join(uploadsDir, fileName);
    await fs.promises.writeFile(filePath, buffer);
    const buktiTandaTerima = `/uploads/${fileName}`;

    return await prisma.$transaction(async (tx) => {
      const manifest = await tx.manifest.findUnique({
        where: { id: manifestId },
        include: {
          bundles: {
            include: {
              applications: true
            }
          }
        }
      });

      if (!manifest) {
        throw new Error("Manifest tidak ditemukan.");
      }

      if (manifest.status !== "LOCKED") {
        throw new Error("Hanya manifest berstatus LOCKED yang dapat diselesaikan pengirimannya.");
      }

      const updated = await tx.manifest.update({
        where: { id: manifestId },
        data: {
          status: "SENT",
          signedReceiptUrl: buktiTandaTerima
        }
      });

      // Update all applications inside all bundles of this manifest to DELIVERED
      const applicationIds: string[] = [];
      manifest.bundles.forEach((b: any) => {
        if (Array.isArray(b.applications)) {
          b.applications.forEach((app: any) => {
            if (app.id) applicationIds.push(app.id);
          });
        }
      });

      if (applicationIds.length > 0) {
        await tx.application.updateMany({
          where: { id: { in: applicationIds } },
          data: { status: "DELIVERED" }
        });
      }

      const notifTitle = "Manifest Baru Terkirim";
      const notifPesan = `Manifest ${manifest.manifestNumber} telah dikirim dan bukti tanda terima telah diunggah. Siap dipantau.`;
      await notifyAllUsersOfRole(UserRole.MONITOR, notifTitle, notifPesan, { manifestId });

      await tx.auditLog.create({
        data: {
          entityType: "MANIFEST",
          entityId: manifestId,
          action: "SEND_MANIFEST",
          actorId: session.user.id,
          metadata: { signedReceiptUrl: buktiTandaTerima, totalApplicationsDelivered: applicationIds.length }
        }
      });

      return { success: true, manifest: updated };
    });
  } catch (error: any) {
    console.error("[ACTION-UPLOAD-RECEIPT-ERR]", error);
    return { success: false, error: error.message || "Gagal menyelesaikan manifest pengiriman." };
  }
}

/**
 * Action: Report bundle as lost during transit.
 */
export async function laporkanBundleHilang(bundleId: string) {
  const session = await getServerSession(authOptions);
  if (!session || !["SENDER", "SUPERVISOR", "PENGIRIM"].includes((session.user as any).role)) {
    throw new Error("Unauthorized");
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const bundle = await tx.bundle.findUnique({
        where: { id: bundleId },
        include: { currentManifest: true }
      });

      if (!bundle) {
        throw new Error("Bundle tidak ditemukan.");
      }

      if (!bundle.currentManifestId || bundle.currentManifest?.status !== "SENT") {
        throw new Error("Bundle hanya dapat dilaporkan hilang jika kargo/manifest utama sudah dikirim (SENT).");
      }

      const originalManifestId = bundle.currentManifestId;
      const originalManifestNo = bundle.currentManifest.manifestNumber;

      const updated = await tx.bundle.update({
        where: { id: bundleId },
        data: {
          currentManifestId: null,
          status: "LOCKED"
        }
      });

      await tx.auditLog.create({
        data: {
          entityType: "BUNDLE",
          entityId: bundleId,
          action: "REMOVE_FROM_MANIFEST",
          actorId: session.user.id,
          metadata: { manifestId: originalManifestId, manifestNumber: originalManifestNo }
        }
      });

      return { success: true, bundle: updated };
    });
  } catch (error: any) {
    console.error("[ACTION-BUNDLE-HILANG-ERR]", error);
    return { success: false, error: error.message || "Gagal melaporkan bundle hilang." };
  }
}

/**
 * Action: Request "Kembalikan ke Pengarsip" for major correction found during logistics packing.
 */
export async function ajukanKembalikanKePengarsip(permohonanId: string, alasan: string) {
  const session = await getServerSession(authOptions);
  if (!session || !["SENDER", "SUPERVISOR", "PENGIRIM"].includes((session.user as any).role)) {
    throw new Error("Unauthorized");
  }

  if (!alasan || !alasan.trim()) {
    return { success: false, error: "Alasan pengembalian wajib diisi." };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const application = await tx.application.findUnique({
        where: { id: permohonanId },
        include: { currentBundle: true }
      });

      if (!application) {
        throw new Error("Permohonan tidak ditemukan.");
      }

      const request = await tx.returnRequest.create({
        data: {
          bundleId: application.currentBundleId,
          origin: "SENDER",
          triggeredBy: session.user.id,
          reason: alasan,
          status: "APPROVED"
        }
      });

      await tx.auditLog.create({
        data: {
          entityType: "APPLICATION",
          entityId: permohonanId,
          action: "TRIGGER_RETURN",
          actorId: session.user.id,
          metadata: { reason: alasan, bundleId: application.currentBundleId }
        }
      });

      return { success: true, status: "RETURNED_DIRECTLY", permohonan: application, request };
    });

    await notifyAllUsersOfRole(
      UserRole.ARCHIVIST,
      "Permintaan Pengembalian dari Pengirim",
      `Pengirim ${session.user.name || ""} mengajukan pengembalian untuk Permohonan ${result.permohonan.applicationNumber}. Alasan: "${alasan}"`,
      { permohonanId }
    );

    revalidatePath("/");
    return result;
  } catch (error: any) {
    console.error("[ACTION-KEMBALIKAN-KE-PENGARSIP-ERR]", error);
    return { success: false, error: error.message || "Gagal mengembalikan permohonan ke pengarsip." };
  }
}

/**
 * Helper Action: Retrieve active return requests for permohonan.
 */
export async function getPendingKoreksiForPermohonan(permohonanId: string) {
  try {
    const request = await prisma.returnRequest.findFirst({
      where: {
        status: "PENDING"
      }
    });
    return { success: true, request };
  } catch (e) {
    return { success: false, request: null };
  }
}

/**
 * Action: Retrieve statistics for the sender dashboard.
 */
export async function getSenderKPIStats() {
  const session = await getServerSession(authOptions);

  if (!session || !["SENDER", "SUPERVISOR"].includes((session.user as any).role)) {
    throw new Error("Unauthorized");
  }

  try {
    const now = new Date();
    const d7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const d14 = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const d21 = new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000);
    const d28 = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);

    const [
      rawManifestStats, eligibleBundles,
    ] = await Promise.all([
      prisma.manifest.aggregateRaw({
        pipeline: [
          {
            $facet: {
              statusCounts: [
                {
                  $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                  }
                }
              ],
              trends: [
                {
                  $group: {
                    _id: null,
                    totalAll: { $sum: 1 },

                    thisWeekTotal: { $sum: { $cond: [{ $gte: ["$createdAt", { $date: d7.toISOString() }] }, 1, 0] } },
                    lastWeekTotal: { $sum: { $cond: [{ $and: [{ $gte: ["$createdAt", { $date: d14.toISOString() }] }, { $lt: ["$createdAt", { $date: d7.toISOString() }] }] }, 1, 0] } },
                    w3Total: { $sum: { $cond: [{ $and: [{ $gte: ["$createdAt", { $date: d21.toISOString() }] }, { $lt: ["$createdAt", { $date: d14.toISOString() }] }] }, 1, 0] } },
                    w4Total: { $sum: { $cond: [{ $and: [{ $gte: ["$createdAt", { $date: d28.toISOString() }] }, { $lt: ["$createdAt", { $date: d21.toISOString() }] }] }, 1, 0] } },

                    thisWeekDraft: { $sum: { $cond: [{ $and: [{ $eq: ["$status", "DRAFT"] }, { $gte: ["$createdAt", { $date: d7.toISOString() }] }] }, 1, 0] } },
                    lastWeekDraft: { $sum: { $cond: [{ $and: [{ $eq: ["$status", "DRAFT"] }, { $gte: ["$createdAt", { $date: d14.toISOString() }] }, { $lt: ["$createdAt", { $date: d7.toISOString() }] }] }, 1, 0] } },
                    w3Draft: { $sum: { $cond: [{ $and: [{ $eq: ["$status", "DRAFT"] }, { $gte: ["$createdAt", { $date: d21.toISOString() }] }, { $lt: ["$createdAt", { $date: d14.toISOString() }] }] }, 1, 0] } },
                    w4Draft: { $sum: { $cond: [{ $and: [{ $eq: ["$status", "DRAFT"] }, { $gte: ["$createdAt", { $date: d28.toISOString() }] }, { $lt: ["$createdAt", { $date: d21.toISOString() }] }] }, 1, 0] } },

                    thisWeekLocked: { $sum: { $cond: [{ $and: [{ $eq: ["$status", "LOCKED"] }, { $gte: ["$createdAt", { $date: d7.toISOString() }] }] }, 1, 0] } },
                    lastWeekLocked: { $sum: { $cond: [{ $and: [{ $eq: ["$status", "LOCKED"] }, { $gte: ["$createdAt", { $date: d14.toISOString() }] }, { $lt: ["$createdAt", { $date: d7.toISOString() }] }] }, 1, 0] } },
                    w3Locked: { $sum: { $cond: [{ $and: [{ $eq: ["$status", "LOCKED"] }, { $gte: ["$createdAt", { $date: d21.toISOString() }] }, { $lt: ["$createdAt", { $date: d14.toISOString() }] }] }, 1, 0] } },
                    w4Locked: { $sum: { $cond: [{ $and: [{ $eq: ["$status", "LOCKED"] }, { $gte: ["$createdAt", { $date: d28.toISOString() }] }, { $lt: ["$createdAt", { $date: d21.toISOString() }] }] }, 1, 0] } },

                    thisWeekSent: { $sum: { $cond: [{ $and: [{ $eq: ["$status", "SENT"] }, { $gte: ["$createdAt", { $date: d7.toISOString() }] }] }, 1, 0] } },
                    lastWeekSent: { $sum: { $cond: [{ $and: [{ $eq: ["$status", "SENT"] }, { $gte: ["$createdAt", { $date: d14.toISOString() }] }, { $lt: ["$createdAt", { $date: d7.toISOString() }] }] }, 1, 0] } },
                    w3Sent: { $sum: { $cond: [{ $and: [{ $eq: ["$status", "SENT"] }, { $gte: ["$createdAt", { $date: d21.toISOString() }] }, { $lt: ["$createdAt", { $date: d14.toISOString() }] }] }, 1, 0] } },
                    w4Sent: { $sum: { $cond: [{ $and: [{ $eq: ["$status", "SENT"] }, { $gte: ["$createdAt", { $date: d28.toISOString() }] }, { $lt: ["$createdAt", { $date: d21.toISOString() }] }] }, 1, 0] } },

                  }
                }
              ]
            }
          }
        ]
      }),

      prisma.bundle.count({
        where: {
          status: "LOCKED",
          OR: [
            { currentManifestId: null },
            { currentManifestId: { isSet: false } }
          ],
          applications: {
            some: {},
            none: {
              status: { not: "ARCHIVED" }
            }
          }
        }
      })
    ]);

    const manifestData = (rawManifestStats as any)[0];
    const statusArray = manifestData?.statusCounts || [];
    const trendData = manifestData?.trends[0] || {
      totalAll: 0, thisWeekTotal: 0, lastWeekTotal: 0, w3Total: 0, w4Total: 0,
      thisWeekDraft: 0, lastWeekDraft: 0, w3Draft: 0, w4Draft: 0,
      thisWeekLocked: 0, lastWeekLocked: 0, w3Locked: 0, w4Locked: 0,
      thisWeekSent: 0, lastWeekSent: 0, w3Sent: 0, w4Sent: 0
    };

    const getCountByStatus = (status: string) => statusArray.find((s: any) => s._id === status)?.count || 0;

    const calcWoWGrowth = (thisWeek: number, lastWeek: number) => {
      if (lastWeek === 0) return thisWeek > 0 ? 100 : 0;
      return Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
    };

    return {
      success: true,
      stats: {
        totalAllManifest: trendData.totalAll,
        totalDraftManifest: getCountByStatus("DRAFT"),
        totalLockedManifest: getCountByStatus("LOCKED"),
        totalSentManifest: getCountByStatus("SENT"),
        eligibleBundles,

        totalTrend: [trendData.w4Total, trendData.w3Total, trendData.lastWeekTotal, trendData.thisWeekTotal],
        draftTrend: [trendData.w4Draft, trendData.w3Draft, trendData.lastWeekDraft, trendData.thisWeekDraft],
        lockedTrend: [trendData.w4Locked, trendData.w3Locked, trendData.lastWeekLocked, trendData.thisWeekLocked],
        sentTrend: [trendData.w4Sent, trendData.w3Sent, trendData.lastWeekSent, trendData.thisWeekSent],

        totalGrowthPct: calcWoWGrowth(trendData.thisWeekTotal, trendData.lastWeekTotal),
        draftGrowthPct: calcWoWGrowth(trendData.thisWeekDraft, trendData.lastWeekDraft),
        lockedGrowthPct: calcWoWGrowth(trendData.thisWeekLocked, trendData.lastWeekLocked),
        sentGrowthPct: calcWoWGrowth(trendData.thisWeekSent, trendData.lastWeekSent),
      }
    };
  } catch (error: any) {
    console.error("[ACTION-GET-SENDER-KPI-STATS-ERR]", error);

    return { success: false, stats: null, error: "Gagal mengambil statistik pengirim." };
  }
}
