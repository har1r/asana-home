"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendWhatsApp } from "@/lib/fonnte";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";

/**
 * Action: Get all bundles in LOCKED status that are fully digitalized (all applications are ARCHIVED)
 * and have not been assigned to a manifest yet.
 */
export async function getEligibleBundles() {
  const session = await getServerSession(authOptions);
  if (!session || !["PENGIRIM", "SUPERVISOR"].includes(session.user.role)) {
    throw new Error("Unauthorized");
  }

  try {
    const list = await prisma.bundle.findMany({
      where: {
        status: "LOCKED"
      },
      include: {
        permohonan: {
          include: {
            arsipDigital: {
              orderBy: { versi: "desc" }
            }
          }
        },
        peneliti: { select: { name: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    // Filter in JS:
    // 1. Must not have manifestId.
    // 2. Must contain at least 1 permohonan.
    // 3. Every permohonan in the bundle must be in ARCHIVED status.
    const eligibleList = list.filter((b) => {
      return (
        !b.manifestId &&
        b.permohonan.length > 0 &&
        b.permohonan.every((p) => p.status === "ARCHIVED")
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
  if (!session || !["PENGIRIM", "SUPERVISOR"].includes(session.user.role)) {
    throw new Error("Unauthorized");
  }

  try {
    const list = await prisma.manifest.findMany({
      include: {
        bundle: {
          include: {
            permohonan: true
          }
        },
        pengirim: { select: { name: true } }
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
 * Action: Retrieve details of a specific manifest, including its bundles, permohonans,
 * and current correction requests.
 */
export async function getManifestDetails(manifestId: string) {
  const session = await getServerSession(authOptions);
  if (!session || !["PENGIRIM", "SUPERVISOR"].includes(session.user.role)) {
    throw new Error("Unauthorized");
  }

  try {
    const manifest = await prisma.manifest.findUnique({
      where: { id: manifestId },
      include: {
        bundle: {
          include: {
            permohonan: {
              include: {
                arsipDigital: {
                  orderBy: { versi: "desc" }
                },
                permintaanKoreksi: {
                  where: { status: "PENDING_APPROVAL" }
                }
              }
            },
            peneliti: { select: { name: true } }
          }
        },
        pengirim: { select: { name: true } }
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
 * Generates unique nomorManifest in format: 973-MANIFEST/{sequence}/{year}
 */
export async function createManifest() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PENGIRIM") {
    throw new Error("Unauthorized");
  }

  let nomorManifest = "";
  let isUnique = false;
  let attempts = 0;
  const currentYear = new Date().getFullYear();
  const suffix = `/${currentYear}`;

  try {
    while (!isUnique && attempts < 10) {
      const existingManifests = await prisma.manifest.findMany({
        where: {
          nomorManifest: {
            endsWith: suffix
          }
        },
        select: { nomorManifest: true }
      });

      let maxSequence = 0;
      for (const m of existingManifests) {
        const parts = m.nomorManifest.split("/");
        if (parts.length === 3 && parts[0] === "973-MANIFEST") {
          const seq = parseInt(parts[1], 10);
          if (!isNaN(seq) && seq > maxSequence) {
            maxSequence = seq;
          }
        }
      }

      const nextSequence = maxSequence + 1 + attempts;
      nomorManifest = `973-MANIFEST/${nextSequence}/${currentYear}`;

      const existing = await prisma.manifest.findUnique({
        where: { nomorManifest },
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
        nomorManifest,
        status: "DRAFT",
        pengirimId: session.user.id
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
 * HOMOGENEITY/ELIGIBILITY: Validates that the bundle is LOCKED and all permohonan in it are ARCHIVED.
 */
export async function addBundleToManifest(manifestId: string, bundleId: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PENGIRIM") {
    throw new Error("Unauthorized");
  }

  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Fetch manifest
      const manifest = await tx.manifest.findUnique({
        where: { id: manifestId }
      });
      if (!manifest) {
        throw new Error("Manifest tidak ditemukan.");
      }
      if (manifest.status !== "DRAFT") {
        throw new Error("Hanya manifest berstatus DRAFT yang dapat ditambah bundle.");
      }

      // 2. Fetch bundle
      const bundle = await tx.bundle.findUnique({
        where: { id: bundleId },
        include: { permohonan: true }
      });
      if (!bundle) {
        throw new Error("Bundle tidak ditemukan.");
      }
      if (bundle.status !== "LOCKED" || bundle.manifestId) {
        throw new Error("Hanya bundle berstatus Terkunci (LOCKED) yang dapat ditambahkan.");
      }

      // 3. Strict validation: all permohonan in bundle must be ARCHIVED
      if (bundle.permohonan.length === 0) {
        throw new Error("Bundle kosong tidak dapat ditambahkan ke manifest.");
      }
      const allArchived = bundle.permohonan.every((p) => p.status === "ARCHIVED");
      if (!allArchived) {
        throw new Error(
          "Aturan Logistik: Seluruh permohonan di dalam bundle harus sudah digitalisasi (ARCHIVED) sebelum dikirim."
        );
      }

      // 4. Associate bundle
      const updatedBundle = await tx.bundle.update({
        where: { id: bundleId },
        data: {
          manifestId,
          status: "IN_MANIFEST"
        }
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          entityType: "BUNDLE",
          entityId: bundleId,
          aksi: "Memasukkan Bundle ke Manifest Draf",
          statusSebelum: "LOCKED",
          statusSesudah: "IN_MANIFEST",
          pelakuId: session.user.id,
          metadata: { manifestId, nomorManifest: manifest.nomorManifest }
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
 * Reverts the bundle status back to LOCKED.
 */
export async function removeBundleFromManifest(manifestId: string, bundleId: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PENGIRIM") {
    throw new Error("Unauthorized");
  }

  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Fetch manifest
      const manifest = await tx.manifest.findUnique({
        where: { id: manifestId }
      });
      if (!manifest) {
        throw new Error("Manifest tidak ditemukan.");
      }
      if (manifest.status !== "DRAFT") {
        throw new Error("Hanya manifest berstatus DRAFT yang dapat dilepas bundle.");
      }

      // 2. Fetch bundle
      const bundle = await tx.bundle.findUnique({
        where: { id: bundleId }
      });
      if (!bundle || bundle.manifestId !== manifestId) {
        throw new Error("Bundle tidak berada di dalam manifest yang dipilih.");
      }

      // 3. Remove association and set status back to LOCKED
      const updatedBundle = await tx.bundle.update({
        where: { id: bundleId },
        data: {
          manifestId: null,
          status: "LOCKED"
        }
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          entityType: "BUNDLE",
          entityId: bundleId,
          aksi: "Melepas Bundle dari Manifest Draf",
          statusSebelum: "IN_MANIFEST",
          statusSesudah: "LOCKED",
          pelakuId: session.user.id,
          metadata: { manifestId, nomorManifest: manifest.nomorManifest }
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
 * Closes adding bundles to this manifest.
 */
export async function lockManifest(manifestId: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PENGIRIM") {
    throw new Error("Unauthorized");
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const manifest = await tx.manifest.findUnique({
        where: { id: manifestId },
        include: { bundle: true }
      });

      if (!manifest) {
        throw new Error("Manifest tidak ditemukan.");
      }

      if (manifest.status !== "DRAFT") {
        throw new Error("Hanya manifest berstatus DRAFT yang dapat dikunci.");
      }

      if (manifest.bundle.length === 0) {
        throw new Error("Gagal mengunci: Manifest masih kosong. Masukkan minimal 1 bundle.");
      }

      const updated = await tx.manifest.update({
        where: { id: manifestId },
        data: { status: "LOCKED" }
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          entityType: "MANIFEST",
          entityId: manifestId,
          aksi: "Mengunci Manifest (DRAFT -> LOCKED)",
          statusSebelum: "DRAFT",
          statusSesudah: "LOCKED",
          pelakuId: session.user.id
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
 * Anomali B: Releases manifest lock back to draft for adjustments. Does not require supervisor approval.
 */
export async function revisiManifest(manifestId: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PENGIRIM") {
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

      // Audit Log
      await tx.auditLog.create({
        data: {
          entityType: "MANIFEST",
          entityId: manifestId,
          aksi: "Revisi Manifest (LOCKED -> DRAFT)",
          statusSebelum: "LOCKED",
          statusSesudah: "DRAFT",
          pelakuId: session.user.id
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
 * Sends In-App notifications to PEMANTAU and WhatsApp notifications to all taxpayers.
 */
export async function uploadBuktiTandaTerima(manifestId: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PENGIRIM") {
    return { success: false, error: "Unauthorized" };
  }

  const file = formData.get("file") as File;

  if (!file || file.size === 0) {
    return { success: false, error: "File bukti tanda terima wajib diunggah." };
  }

  // Size limit validation (20MB)
  const MAX_SIZE = 20 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return { success: false, error: "Ukuran file tidak boleh melebihi 20 MB." };
  }

  // Validate file type (PDF/JPG/PNG) using file-type library
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
    console.warn("[UPLOAD-RECEIPT-WARN] file-type fallback check used.", e);
    // Fallback signature check:
    // PDF: %PDF- (25 50 44 46)
    // JPG: FF D8 FF
    // PNG: 89 50 4E 47
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
    // Generate uploads directory
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileName = `tanda_terima_${manifestId}_${Date.now()}.${fileExt}`;
    const filePath = path.join(uploadsDir, fileName);
    await fs.promises.writeFile(filePath, buffer);
    const buktiTandaTerima = `/uploads/${fileName}`;

    return await prisma.$transaction(async (tx) => {
      // 1. Fetch manifest
      const manifest = await tx.manifest.findUnique({
        where: { id: manifestId },
        include: {
          bundle: {
            include: {
              permohonan: true
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

      // 2. Update manifest status to SENT
      const updated = await tx.manifest.update({
        where: { id: manifestId },
        data: {
          status: "SENT",
          buktiTandaTerima
        }
      });

      // 3. Collect active Pemantau users and send In-App notifications
      const activePemantauList = await tx.user.findMany({
        where: { role: "PEMANTAU", isActive: true },
        select: { id: true }
      });

      const notifTitle = "Manifest Baru Terkirim";
      const notifPesan = `Manifest ${manifest.nomorManifest} telah dikirim dan bukti tanda terima telah diunggah. Siap dipantau.`;

      if (activePemantauList.length > 0) {
        await tx.inAppNotification.createMany({
          data: activePemantauList.map((pemantau) => ({
            userId: pemantau.id,
            judul: notifTitle,
            pesan: notifPesan,
            metadata: { manifestId }
          }))
        });
      }

      // 4. Send WhatsApp notifications to taxpayers of all permohonan in manifest
      // Collect all permohonan
      const allPermohonan = manifest.bundle.flatMap((b) => b.permohonan);
      
      // Execute WhatsApp dispatch in background/non-blocking manner to avoid slowing down database transaction.
      // We log each dispatch.
      for (const p of allPermohonan) {
        const readableJenis = p.jenisPermohonan.replace(/_/g, " ");
        const waMessage = `Halo Wajib Pajak, berkas permohonan ${readableJenis} Anda (Nomor: ${p.nomorPermohonan}) telah dikirimkan ke Kantor Pusat melalui manifest pengiriman ${manifest.nomorManifest}. Terima kasih.`;
        
        // Asynchronous, tolerating failure
        sendWhatsApp(p.noWhatsapp, waMessage).catch((err) => {
          console.error(`[WA-FAIL] Gagal kirim WA ke wajib pajak ${p.namaWajibPajak}:`, err);
        });
      }

      // Audit Log
      await tx.auditLog.create({
        data: {
          entityType: "MANIFEST",
          entityId: manifestId,
          aksi: "Menyelesaikan Pengiriman Manifest (LOCKED -> SENT)",
          statusSebelum: "LOCKED",
          statusSesudah: "SENT",
          pelakuId: session.user.id,
          metadata: { buktiTandaTerima }
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
 * Action: Report bundle as lost during transit (Anomali C).
 * Sets bundle manifestId to null, status back to LOCKED. Does not require supervisor approval.
 */
export async function laporkanBundleHilang(bundleId: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PENGIRIM") {
    throw new Error("Unauthorized");
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const bundle = await tx.bundle.findUnique({
        where: { id: bundleId },
        include: { manifest: true }
      });

      if (!bundle) {
        throw new Error("Bundle tidak ditemukan.");
      }

      if (!bundle.manifestId || bundle.manifest?.status !== "SENT") {
        throw new Error("Bundle hanya dapat dilaporkan hilang jika kargo/manifest utama sudah dikirim (SENT).");
      }

      const originalManifestId = bundle.manifestId;
      const originalManifestNo = bundle.manifest.nomorManifest;

      // Reset bundle
      const updated = await tx.bundle.update({
        where: { id: bundleId },
        data: {
          manifestId: null,
          status: "LOCKED"
        }
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          entityType: "BUNDLE",
          entityId: bundleId,
          aksi: "Melaporkan Bundle Hilang Saat Transit",
          statusSebelum: "IN_MANIFEST",
          statusSesudah: "LOCKED",
          pelakuId: session.user.id,
          metadata: { manifestId: originalManifestId, nomorManifest: originalManifestNo }
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
 * Action: Request "Kembalikan ke Pengarsip" for major correction found during logistics packing (Anomali A).
 * Requires Supervisor approval. Creates PENDING_APPROVAL request.
 */
export async function ajukanKembalikanKePengarsip(permohonanId: string, alasan: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PENGIRIM") {
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

      if (permohonan.status !== "ARCHIVED") {
        throw new Error("Hanya permohonan berstatus Terarsip (ARCHIVED) yang dapat dikembalikan ke Pengarsip.");
      }

      if (!permohonan.bundleId || permohonan.bundle?.status !== "IN_MANIFEST") {
        throw new Error(
          "Permohonan harus sudah terasosiasi ke bundle yang dimasukkan ke manifest (IN_MANIFEST) sebelum dikembalikan."
        );
      }

      // Check if there is an existing pending request
      const existingRequest = await tx.permintaanKoreksi.findFirst({
        where: {
          permohonanId,
          status: "PENDING_APPROVAL",
          jenisKoreksi: "KEMBALIKAN_KE_PENGARSIP"
        }
      });

      if (existingRequest) {
        throw new Error("Permintaan koreksi untuk permohonan ini sudah diajukan dan masih menunggu keputusan Supervisor.");
      }

      // Create PermintaanKoreksi
      const request = await tx.permintaanKoreksi.create({
        data: {
          permohonanId,
          jenisKoreksi: "KEMBALIKAN_KE_PENGARSIP",
          status: "PENDING_APPROVAL",
          pengajuId: session.user.id,
          catatanPengaju: alasan
        }
      });

      // Notify Supervisor
      const notifTitle = "Persetujuan Koreksi Logistik";
      const notifPesan = `Pengirim mengajukan pengembalian Permohonan ${permohonan.nomorPermohonan} ke Pengarsip. Alasan: "${alasan}"`;
      
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
    console.error("[ACTION-KEMBALIKAN-KE-PENGARSIP-ERR]", error);
    return { success: false, error: error.message || "Gagal mengajukan pengembalian ke pengarsip." };
  }
}

/**
 * Helper Action: Retrieve active koreksi requests for permohonan.
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
