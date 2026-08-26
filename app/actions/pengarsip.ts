"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";
import { uploadToGoogleDrive } from "@/lib/googleDrive";

/**
 * Action: Get all bundles that Pengarsip can work on.
 * This includes:
 * 1. Bundles in LOCKED status (main digitalization queue).
 * 2. Bundles in IN_MANIFEST status that contain at least one permohonan with BUNDLED status
 *    and a SUPERSEDED digital archive version (indicating it was returned from Fase 4 for re-upload).
 */
export async function getDigitizationBundles() {
  const session = await getServerSession(authOptions);
  if (!session || !["PENGARSIP", "SUPERVISOR"].includes(session.user.role)) {
    throw new Error("Unauthorized");
  }

  try {
    // Fetch ALL bundles for Pengarsip workspace
    const list = await prisma.bundle.findMany({
      include: {
        permohonan: {
          include: {
            penginput: { select: { id: true, name: true, email: true } },
            dataBaru: true,
            arsipDigital: {
              include: {
                pengarsip: { select: { name: true } }
              },
              orderBy: { versi: "desc" }
            },
            permintaanKoreksi: {
              where: { status: "PENDING_APPROVAL" }
            }
          }
        },
        peneliti: { select: { name: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    // Fetch ALL permohonan across system for overall system KPI metrics
    const allPermohonan = await prisma.permohonan.findMany({
      include: {
        dataBaru: true,
        arsipDigital: true,
        permintaanKoreksi: true
      }
    });

    return { success: true, list, allPermohonan };
  } catch (error: any) {
    console.error("[ACTION-GET-DIGIT-BUNDLES-ERR]", error);
    return { success: false, list: [], error: "Gagal mengambil daftar bundle digitalisasi." };
  }
}

/**
 * Action: Retrieve details of a specific bundle, including its permohonan list,
 * digital archives list, and pending supervisor correction requests.
 */
export async function getBundleDetails(bundleId: string) {
  const session = await getServerSession(authOptions);
  if (!session || !["PENGARSIP", "SUPERVISOR"].includes(session.user.role)) {
    throw new Error("Unauthorized");
  }

  try {
    const bundle = await prisma.bundle.findUnique({
      where: { id: bundleId },
      include: {
        permohonan: {
          include: {
            penginput: { select: { id: true, name: true, email: true } },
            dataBaru: true,
            arsipDigital: {
              include: {
                pengarsip: { select: { name: true } }
              },
              orderBy: { versi: "desc" }
            },
            permintaanKoreksi: {
              where: { status: "PENDING_APPROVAL" }
            }
          }
        },
        peneliti: { select: { name: true } }
      }
    });

    if (!bundle) {
      return { success: false, error: "Bundle tidak ditemukan." };
    }

    return { success: true, bundle };
  } catch (error: any) {
    console.error("[ACTION-GET-BUNDLE-DETAILS-ERR]", error);
    return { success: false, error: "Gagal mengambil detail bundle." };
  }
}

/**
 * Action: Upload scanned PDF file for a specific permohonan.
 * Marks the application as ARCHIVED, registers version history, and handles re-upload logistik checks.
 */
export async function uploadArsipDigital(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PENGARSIP") {
    return { success: false, error: "Unauthorized" };
  }

  const permohonanId = formData.get("permohonanId") as string;
  const dataBaruId = formData.get("dataBaruId") as string || null;
  const file = formData.get("file") as File;

  if (!permohonanId) {
    return { success: false, error: "Permohonan ID wajib diisi." };
  }
  if (!file || file.size === 0) {
    return { success: false, error: "File PDF wajib diunggah." };
  }

  // Size limit validation (20MB)
  const MAX_SIZE = 20 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return { success: false, error: "Ukuran file tidak boleh melebihi 20 MB." };
  }

  // Validate that the file is PDF using file-type
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  let isPdf = false;
  try {
    const { fileTypeFromBuffer } = await (eval('import("file-type")') as any);
    const type = await fileTypeFromBuffer(buffer);
    if (type && type.mime === "application/pdf") {
      isPdf = true;
    }
  } catch (e) {
    console.warn("[UPLOAD-FILE-TYPE-WARN] file-type library fallback used.", e);
    // Fallback: Check magic number for PDF: "%PDF-" which is "25 50 44 46" in hex
    if (
      buffer.length >= 4 &&
      buffer[0] === 0x25 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x44 &&
      buffer[3] === 0x46
    ) {
      isPdf = true;
    }
  }

  if (!isPdf) {
    return { success: false, error: "File wajib berupa dokumen PDF yang valid." };
  }

  try {
    // 1. Try uploading to Google Drive if credentials exist
    const suffix = dataBaruId ? `_db_${dataBaruId}` : "";
    const fileName = `arsip_${permohonanId}${suffix}_v${Date.now()}.pdf`;
    let urlBlob = `/uploads/${fileName}`;

    try {
      if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
        console.log('[GOOGLE-DRIVE-UPLOAD] Mengunggah file ke Google Drive...', fileName);
        const driveResult = await uploadToGoogleDrive({
          buffer,
          fileName,
          mimeType: file.type || "application/pdf",
        });
        if (driveResult.webViewLink) {
          urlBlob = driveResult.webViewLink;
          console.log('[GOOGLE-DRIVE-SUCCESS] Berhasil diunggah ke Google Drive:', urlBlob);
        }
      }
    } catch (gDriveErr: any) {
      console.warn('[GOOGLE-DRIVE-FALLBACK] Gagal mengunggah ke Google Drive, menggunakan penyimpanan lokal disk:', gDriveErr?.message || gDriveErr);
    }

    // 2. Write file locally as backup / local storage
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const filePath = path.join(uploadsDir, fileName);
    await fs.promises.writeFile(filePath, buffer);

    const result = await prisma.$transaction(async (tx) => {
      // Fetch the permohonan and its bundle
      const permohonan = await tx.permohonan.findUnique({
        where: { id: permohonanId },
        include: { bundle: true, dataBaru: true }
      });

      if (!permohonan) {
        throw new Error("Permohonan tidak ditemukan.");
      }

      // Check if it's frozen
      const pendingKoreksi = await tx.permintaanKoreksi.findFirst({
        where: {
          permohonanId,
          status: "PENDING_APPROVAL"
        }
      });
      if (pendingKoreksi) {
        throw new Error("Permohonan dibekukan karena sedang menunggu persetujuan Supervisor.");
      }

      // Find the last active archive version
      const lastActive = await (tx as any).arsipDigital.findFirst({
        where: {
          permohonanId,
          dataBaruId: dataBaruId || null,
          status: "ACTIVE"
        },
        orderBy: { versi: "desc" }
      });

      const nextVersion = lastActive ? lastActive.versi + 1 : 1;

      // Update old ACTIVE version to SUPERSEDED
      if (lastActive) {
        await tx.arsipDigital.update({
          where: { id: lastActive.id },
          data: { status: "SUPERSEDED" }
        });
      }

      // Create new ACTIVE archive
      const newArchive = await (tx as any).arsipDigital.create({
        data: {
          permohonanId,
          dataBaruId: dataBaruId || null,
          urlBlob,
          status: "ACTIVE",
          versi: nextVersion,
          pengarsipId: session.user.id
        }
      });

      const oldStatus = permohonan.status;
      let newStatus = oldStatus;

      // Update permohonan status to ARCHIVED if it was BUNDLED
      if (oldStatus === "BUNDLED") {
        let shouldArchive = false;

        if (permohonan.jenisPermohonan === "MUTASI_SEBAGIAN") {
          const totalFractions = permohonan.dataBaru.length;
          // Count active uploads for all fractions (including the one just created)
          const activeFractionsCount = await (tx as any).arsipDigital.count({
            where: {
              permohonanId,
              status: "ACTIVE",
              dataBaruId: { not: null }
            }
          });

          if (activeFractionsCount >= totalFractions) {
            shouldArchive = true;
          }
        } else {
          // For other types, 1 file is enough
          shouldArchive = true;
        }

        if (shouldArchive) {
          newStatus = "ARCHIVED";
          await tx.permohonan.update({
            where: { id: permohonanId },
            data: { status: "ARCHIVED" }
          });
        }
      }

      // Handle Re-upload check from Fase 4 (returned from logistik):
      // If it was returned from Fase 4, it has an active version changed to SUPERSEDED
      // and we need to notify the Pengirim who requested this correction.
      const lastKoreksi = await tx.permintaanKoreksi.findFirst({
        where: {
          permohonanId,
          status: "APPROVED",
          jenisKoreksi: "KEMBALIKAN_KE_PENGARSIP"
        },
        orderBy: { updatedAt: "desc" }
      });

      if (lastKoreksi && lastKoreksi.pengajuId) {
        // Send In-App Notification to the Pengirim
        const notifPesan = `Permohonan ${permohonan.nomorPelayanan || permohonan.nomorPermohonan} telah selesai didigitalisasi ulang oleh Pengarsip dan kembali ke status Terarsip (ARCHIVED).`;
        await tx.inAppNotification.create({
          data: {
            userId: lastKoreksi.pengajuId,
            judul: "Arsip Diperbaiki",
            pesan: notifPesan,
            metadata: { permohonanId, bundleId: permohonan.bundleId }
          }
        });
      }

      // Create Audit Log
      const isMinorCorrection = oldStatus === "ARCHIVED";
      await tx.auditLog.create({
        data: {
          entityType: "PERMOHONAN",
          entityId: permohonanId,
          aksi: isMinorCorrection
            ? "Upload Ulang Arsip Digital (Koreksi Minor)"
            : "Mengunggah Arsip Digital (DRAFT -> ACTIVE)",
          statusSebelum: oldStatus,
          statusSesudah: newStatus,
          pelakuId: session.user.id,
          metadata: {
            arsipDigitalLamaId: lastActive?.id || null,
            arsipDigitalBaruId: newArchive.id,
            versi: nextVersion,
            urlBlob
          }
        }
      });

      return { success: true, archive: newArchive, permohonanStatus: newStatus };
    });
    revalidatePath('/');
    return result;
  } catch (error: any) {
    console.error("[ACTION-UPLOAD-ARSIP-ERR]", error);
    return { success: false, error: error.message || "Gagal menyimpan arsip digital." };
  }
}

/**
 * Action: Request "Kembalikan ke Peneliti" for major correction (physical file damage or wrong file details).
 * This requires Supervisor approval, so status goes to PENDING_APPROVAL.
 */
export async function ajukanKembalikanKePeneliti(permohonanId: string, alasan: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PENGARSIP") {
    throw new Error("Unauthorized");
  }

  if (!alasan || !alasan.trim()) {
    return { success: false, error: "Alasan pengembalian wajib diisi." };
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const permohonan = await tx.permohonan.findUnique({
        where: { id: permohonanId },
        include: { bundle: true }
      });

      if (!permohonan) {
        throw new Error("Permohonan tidak ditemukan.");
      }

      if (permohonan.status !== "BUNDLED" && permohonan.status !== "ARCHIVED") {
        throw new Error("Hanya permohonan berstatus Terbundel atau Terarsip yang dapat dikembalikan ke Peneliti.");
      }

      // Check if there is an existing pending request
      const existingRequest = await tx.permintaanKoreksi.findFirst({
        where: {
          permohonanId,
          status: "PENDING_APPROVAL",
          jenisKoreksi: "KEMBALIKAN_KE_PENELITI"
        }
      });

      if (existingRequest) {
        throw new Error("Permintaan pengembalian permohonan ini sudah diajukan sebelumnya dan masih menunggu keputusan Supervisor.");
      }

      // Create PermintaanKoreksi
      const request = await tx.permintaanKoreksi.create({
        data: {
          permohonanId,
          jenisKoreksi: "KEMBALIKAN_KE_PENELITI",
          status: "PENDING_APPROVAL",
          pengajuId: session.user.id,
          catatanPengaju: alasan
        }
      });

      // Notify Supervisor
      const notifTitle = "Persetujuan Koreksi";
      const notifPesan = `Pengarsip mengajukan koreksi untuk mengembalikan Permohonan ${permohonan.nomorPelayanan || permohonan.nomorPermohonan} ke Peneliti. Alasan: "${alasan}"`;
      
      const activeSupervisors = await tx.user.findMany({
        where: { role: "SUPERVISOR", isActive: true },
        select: { id: true }
      });

      if (activeSupervisors.length > 0) {
        await tx.inAppNotification.createMany({
          data: activeSupervisors.map((sup) => ({
            userId: sup.id,
            judul: notifTitle,
            pesan: notifPesan,
            metadata: {
              koreksiId: request.id,
              permohonanId,
              bundleId: permohonan.bundleId
            }
          }))
        });
      }

      return { success: true, status: "PENDING_APPROVAL", request };
    });
  } catch (error: any) {
    console.error("[ACTION-KEMBALIKAN-KE-PENELITI-ERR]", error);
    return { success: false, error: error.message || "Gagal mengajukan pengembalian ke peneliti." };
  }
}

/**
 * Helper Action: Retrieve active koreksi requests for permohonan in locked bundles.
 */
export async function getPendingKoreksiForPermohonan(permohonanId: string) {
  try {
    const request = await prisma.permintaanKoreksi.findFirst({
      where: {
        permohonanId,
        status: "PENDING_APPROVAL"
      }
    });
    return { success: true, request };
  } catch (e) {
    return { success: false, request: null };
  }
}

/**
 * Retrieve summary stats of digitization for Pengarsip dashboard
 */
export async function getPengarsipStats() {
  const session = await getServerSession(authOptions);
  if (!session || !["PENGARSIP", "SUPERVISOR"].includes(session.user.role)) {
    throw new Error("Unauthorized");
  }

  try {
    // 1. Get active bundles in the queue (LOCKED + returned IN_MANIFEST bundles)
    const bundles = await prisma.bundle.findMany({
      where: { status: { in: ["LOCKED", "IN_MANIFEST"] } },
      include: {
        permohonan: {
          include: {
            dataBaru: true,
            arsipDigital: { orderBy: { versi: "desc" } }
          }
        }
      }
    });

    const activeBundles = bundles.filter((bundle) => {
      if (bundle.status === "LOCKED") return true;
      if (bundle.status === "IN_MANIFEST") {
        return bundle.permohonan.some(
          (p) => p.status === "BUNDLED" && p.arsipDigital.some((ad) => ad.status === "SUPERSEDED")
        );
      }
      return false;
    });

    // Calculate digitization queue and pending re-upload counts per file (pecahan or regular application)
    let queueFileCount = 0;
    let reuploadFileCount = 0;

    for (const b of activeBundles) {
      for (const p of b.permohonan) {
        if (p.status !== "ARCHIVED") {
          // digitization queue: files that do NOT have ACTIVE digital archive
          if (p.jenisPermohonan === "MUTASI_SEBAGIAN") {
            const unarchivedFractions = p.dataBaru.filter(db => 
              !p.arsipDigital.some((ad: any) => ad.dataBaruId === db.id && ad.status === "ACTIVE")
            ).length;
            queueFileCount += (unarchivedFractions === 0 && p.dataBaru.length === 0) ? 1 : unarchivedFractions;

            // re-upload queue: fractions that have SUPERSEDED archive and no ACTIVE archive
            const supersededFractions = p.dataBaru.filter(db => 
              p.arsipDigital.some((ad: any) => ad.dataBaruId === db.id && ad.status === "SUPERSEDED") &&
              !p.arsipDigital.some((ad: any) => ad.dataBaruId === db.id && ad.status === "ACTIVE")
            ).length;
            reuploadFileCount += supersededFractions;
          } else {
            queueFileCount += 1;

            const hasSuperseded = p.arsipDigital.some((ad: any) => ad.dataBaruId === null && ad.status === "SUPERSEDED");
            const hasActive = p.arsipDigital.some((ad: any) => ad.dataBaruId === null && ad.status === "ACTIVE");
            if (hasSuperseded && !hasActive) {
              reuploadFileCount += 1;
            }
          }
        }
      }
    }

    // 2. Total files currently in ARCHIVED status (Awaiting manifest phase)
    const archivedPermohonan = await prisma.permohonan.findMany({
      where: { status: "ARCHIVED" },
      include: { dataBaru: true }
    });
    const archivedPendingCount = archivedPermohonan.reduce((acc, p) => {
      if (p.jenisPermohonan === "MUTASI_SEBAGIAN") {
        return acc + (p.dataBaru.length || 1);
      }
      return acc + 1;
    }, 0);

    // 3. Total uploaded active/all archives by this user (counts every separate file row)
    const totalUploadedCount = await prisma.arsipDigital.count({
      where: { pengarsipId: session.user.id }
    });

    return {
      success: true,
      stats: {
        digitizationQueue: queueFileCount,
        archivedPending: archivedPendingCount,
        totalUploaded: totalUploadedCount,
        pendingKoreksi: reuploadFileCount
      }
    };
  } catch (error: any) {
    console.error("[ACTION-GET-PENGARSIP-STATS-ERR]", error);
    return {
      success: false,
      stats: { digitizationQueue: 0, archivedPending: 0, totalUploaded: 0, pendingKoreksi: 0 },
      error: "Gagal mengambil statistik pengarsip."
    };
  }
}

/**
 * Retrieve recent uploads for Pengarsip dashboard
 */
export async function getRecentUploads(limit = 5) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PENGARSIP") {
    throw new Error("Unauthorized");
  }

  try {
    const list = await prisma.arsipDigital.findMany({
      where: { pengarsipId: session.user.id },
      include: {
        permohonan: {
          select: {
            nomorPermohonan: true,
            namaWajibPajak: true,
            jenisPermohonan: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: limit
    });
    return { success: true, list };
  } catch (error: any) {
    console.error("[ACTION-GET-RECENT-UPLOADS-ERR]", error);
    return { success: false, list: [], error: "Gagal mengambil riwayat unggah terbaru." };
  }
}

/**
 * Retrieve bundles that need re-upload (IN_MANIFEST with SUPERSEDED archives)
 * for the Pengarsip "Arsip Perlu Direvisi" dashboard card.
 */
export async function getReuploadBundles(limit = 5) {
  const session = await getServerSession(authOptions);
  if (!session || !["PENGARSIP", "SUPERVISOR"].includes(session.user.role)) {
    throw new Error("Unauthorized");
  }

  try {
    const inManifestBundles = await prisma.bundle.findMany({
      where: { status: "IN_MANIFEST" },
      include: {
        permohonan: {
          include: {
            arsipDigital: { orderBy: { versi: "desc" } }
          }
        },
        peneliti: { select: { name: true } }
      },
      orderBy: { updatedAt: "desc" }
    });

    // Only keep bundles that have at least one BUNDLED permohonan with a SUPERSEDED archive
    const reuploadList = inManifestBundles.filter((bundle) =>
      bundle.permohonan.some(
        (p) => p.status === "BUNDLED" && p.arsipDigital.some((ad) => ad.status === "SUPERSEDED")
      )
    );

    const total = reuploadList.length;
    const list = reuploadList.slice(0, limit);

    return { success: true, list, total };
  } catch (error: any) {
    console.error("[ACTION-GET-REUPLOAD-BUNDLES-ERR]", error);
    return { success: false, list: [], total: 0, error: "Gagal mengambil daftar arsip yang perlu direvisi." };
  }
}

/**
 * Retrieve LOCKED bundles only (normal digitalization queue)
 * for the Pengarsip "Antrean Digitalisasi" dashboard card.
 */
export async function getLockedBundles(limit = 5) {
  const session = await getServerSession(authOptions);
  if (!session || !["PENGARSIP", "SUPERVISOR"].includes(session.user.role)) {
    throw new Error("Unauthorized");
  }

  try {
    const list = await prisma.bundle.findMany({
      where: { status: "LOCKED" },
      include: {
        peneliti: { select: { name: true } }
      },
      orderBy: { createdAt: "desc" },
      take: limit
    });

    const total = await prisma.bundle.count({ where: { status: "LOCKED" } });

    return { success: true, list, total };
  } catch (error: any) {
    console.error("[ACTION-GET-LOCKED-BUNDLES-ERR]", error);
    return { success: false, list: [], total: 0, error: "Gagal mengambil daftar antrean digitalisasi." };
  }
}
