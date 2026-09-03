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

/**
 * Action: Get all bundles in LOCKED status that are fully digitalized
 * and have not been assigned to a manifest yet.
 */
export async function getEligibleBundles() {
  const session = await getServerSession(authOptions);
  if (!session || !["SENDER", "SUPERVISOR", "PENGIRIM"].includes((session.user as any).role)) {
    throw new Error("Unauthorized");
  }

  try {
    const list = await prisma.bundle.findMany({
      where: {
        status: "LOCKED"
      },
      include: {
        applications: true
      },
      orderBy: { createdAt: "desc" }
    });

    const eligibleList = list.filter((b: any) => {
      const apps = b.applications || b.permohonan || [];
      return (
        !b.currentManifestId &&
        apps.length > 0 &&
        apps.every((p: any) => p.status === "ARCHIVED" || p.status === "BUNDLED" || p.status === "SUBMITTED")
      );
    });

    return { success: true, list: eligibleList };
  } catch (error: any) {
    console.error("[ACTION-GET-ELIGIBLE-BUNDLES-ERR]", error);
    return { success: false, list: [], error: "Gagal mengambil antrean bundle logistik." };
  }
}

/**
 * Action: Retrieve all manifests in the system with their status and bundles count.
 */
export async function getManifests() {
  const session = await getServerSession(authOptions);
  if (!session || !["SENDER", "SUPERVISOR", "PENGIRIM"].includes((session.user as any).role)) {
    throw new Error("Unauthorized");
  }

  try {
    const list = await prisma.manifest.findMany({
      include: {
        bundles: {
          include: {
            applications: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    return { success: true, list };
  } catch (error: any) {
    console.error("[ACTION-GET-MANIFESTS-ERR]", error);
    return { success: false, list: [], error: "Gagal mengambil daftar manifest." };
  }
}

/**
 * Action: Retrieve details of a specific manifest, including its bundles and applications.
 */
export async function getManifestDetails(manifestId: string) {
  const session = await getServerSession(authOptions);
  if (!session || !["SENDER", "SUPERVISOR", "PENGIRIM"].includes((session.user as any).role)) {
    throw new Error("Unauthorized");
  }

  try {
    const manifest = await prisma.manifest.findUnique({
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
      return { success: false, error: "Manifest tidak ditemukan." };
    }

    return { success: true, manifest };
  } catch (error: any) {
    console.error("[ACTION-GET-MANIFEST-DETAILS-ERR]", error);
    return { success: false, error: "Gagal mengambil detail manifest." };
  }
}

/**
 * Action: Create a new Manifest in DRAFT status.
 * Generates unique manifestNumber in format: 973-MANIFEST/{sequence}/{year}
 */
export async function createManifest() {
  const session = await getServerSession(authOptions);
  if (!session || !["SENDER", "SUPERVISOR", "PENGIRIM"].includes((session.user as any).role)) {
    throw new Error("Unauthorized");
  }

  let manifestNumber = "";
  let isUnique = false;
  let attempts = 0;
  const currentYear = new Date().getFullYear();
  const suffix = `/${currentYear}`;

  try {
    while (!isUnique && attempts < 10) {
      const existingManifests = await prisma.manifest.findMany({
        where: {
          manifestNumber: {
            endsWith: suffix
          }
        },
        select: { manifestNumber: true }
      });

      let maxSequence = 0;
      for (const m of existingManifests) {
        const parts = m.manifestNumber.split("/");
        if (parts.length === 3 && parts[0] === "973-MANIFEST") {
          const seq = parseInt(parts[1], 10);
          if (!isNaN(seq) && seq > maxSequence) {
            maxSequence = seq;
          }
        }
      }

      const nextSequence = maxSequence + 1 + attempts;
      manifestNumber = `973-MANIFEST/${nextSequence}/${currentYear}`;

      const existing = await prisma.manifest.findUnique({
        where: { manifestNumber },
        select: { id: true }
      });

      if (!existing) {
        isUnique = true;
      } else {
        attempts++;
      }
    }

    if (!isUnique) {
      throw new Error("Gagal menghasilkan nomor manifest yang unik.");
    }

    const manifest = await prisma.manifest.create({
      data: {
        manifestNumber,
        status: "DRAFT"
      }
    });

    revalidatePath("/");
    return { success: true, manifest };
  } catch (error: any) {
    console.error("[ACTION-CREATE-MANIFEST-ERR]", error);
    return { success: false, error: error.message || "Gagal membuat manifest baru." };
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

      const notifTitle = "Manifest Baru Terkirim";
      const notifPesan = `Manifest ${manifest.manifestNumber} telah dikirim dan bukti tanda terima telah diunggah. Siap dipantau.`;
      await notifyAllUsersOfRole(UserRole.MONITOR, notifTitle, notifPesan, { manifestId });

      await tx.auditLog.create({
        data: {
          entityType: "MANIFEST",
          entityId: manifestId,
          action: "SEND_MANIFEST",
          actorId: session.user.id,
          metadata: { signedReceiptUrl: buktiTandaTerima }
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
 * Action: Retrieve statistics for the Pengirim dashboard.
 */
export async function getPengirimStats() {
  const session = await getServerSession(authOptions);
  if (!session || !["SENDER", "SUPERVISOR", "PENGIRIM"].includes((session.user as any).role)) {
    throw new Error("Unauthorized");
  }

  try {
    const totalManifest = await prisma.manifest.count();
    const draftManifest = await prisma.manifest.count({ where: { status: "DRAFT" } });
    const lockedManifest = await prisma.manifest.count({ where: { status: "LOCKED" } });
    const sentManifest = await prisma.manifest.count({ where: { status: "SENT" } });

    const list = await prisma.bundle.findMany({
      where: {
        status: "LOCKED",
        currentManifestId: null
      },
      include: {
        applications: true
      }
    });

    const eligibleBundles = list.filter((b: any) => {
      const apps = b.applications || b.permohonan || [];
      return (
        apps.length > 0 &&
        apps.every((p: any) => p.status === "ARCHIVED" || p.status === "BUNDLED" || p.status === "SUBMITTED")
      );
    }).length;

    return {
      success: true,
      stats: {
        totalManifest,
        draftManifest,
        lockedManifest,
        sentManifest,
        eligibleBundles
      }
    };
  } catch (error: any) {
    console.error("[ACTION-GET-PENGIRIM-STATS-ERR]", error);
    return { success: false, stats: null, error: "Gagal mengambil statistik pengirim." };
  }
}
