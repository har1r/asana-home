"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendWhatsApp } from "@/lib/fonnte";
import { revalidatePath } from "next/cache";

/**
 * Action: Get all applications (Permohonan) that can be monitored.
 * This includes:
 * 1. Permohonan in ARCHIVED status (active monitoring queue, physical documents arrived at central office).
 * 2. Permohonan in COMPLETED status (already finished, ready for overview or rollback).
 * Both must belong to bundles that are associated with manifests in SENT status.
 */
export async function getMonitoringPermohonan() {
  const session = await getServerSession(authOptions);
  if (!session || !["PEMANTAU", "SUPERVISOR"].includes(session.user.role)) {
    throw new Error("Unauthorized");
  }

  try {
    const list = await prisma.permohonan.findMany({
      where: {
        status: { in: ["ARCHIVED", "COMPLETED"] },
        bundle: {
          manifest: {
            status: "SENT"
          }
        }
      },
      include: {
        bundle: {
          include: {
            manifest: {
              include: {
                pengirim: { select: { name: true } }
              }
            },
            peneliti: { select: { name: true } }
          }
        },
        arsipDigital: {
          orderBy: { versi: "desc" }
        },
        permintaanKoreksi: {
          where: { status: "PENDING_APPROVAL" }
        }
      },
      orderBy: { updatedAt: "desc" }
    });

    return { success: true, list };
  } catch (error: any) {
    console.error("[ACTION-GET-MONITOR-PERMOHONAN-ERR]", error);
    return { success: false, list: [], error: "Gagal mengambil antrean pemantauan." };
  }
}

/**
 * Action: Mark a permohonan as completed (ARCHIVED -> COMPLETED) in Phase 5.
 * Triggers a WhatsApp notification to the taxpayer.
 */
export async function completePermohonan(permohonanId: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PEMANTAU") {
    throw new Error("Unauthorized");
  }

  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Fetch permohonan
      const permohonan = await tx.permohonan.findUnique({
        where: { id: permohonanId },
        include: {
          bundle: {
            include: {
              manifest: true
            }
          }
        }
      });

      if (!permohonan) {
        throw new Error("Permohonan tidak ditemukan.");
      }

      if (permohonan.status !== "ARCHIVED" || permohonan.bundle?.manifest?.status !== "SENT") {
        throw new Error("Hanya permohonan terarsip (ARCHIVED) yang manifest kargonya sudah dikirim (SENT) yang dapat diselesaikan.");
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

      // 2. Transition status to COMPLETED
      const updated = await tx.permohonan.update({
        where: { id: permohonanId },
        data: { status: "COMPLETED" }
      });

      // 3. Dispatch WhatsApp Notification to the taxpayer
      const readableJenis = permohonan.jenisPermohonan.replace(/_/g, " ");
      const waMessage = `Halo Wajib Pajak, permohonan ${readableJenis} Anda dengan Nomor Pelayanan: ${permohonan.nomorPelayanan || "-"} (NOP: ${permohonan.nop}) telah selesai diproses oleh Kantor Pusat. Produk layanan berupa Surat Keputusan / SPPT telah diterbitkan. Terima kasih.`;
      
      // Asynchronous, tolerating failure
      sendWhatsApp(permohonan.noWhatsapp, waMessage).catch((err) => {
        console.error(`[WA-COMPLETED-FAIL] Gagal kirim WA ke wajib pajak ${permohonan.namaWajibPajak}:`, err);
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          entityType: "PERMOHONAN",
          entityId: permohonanId,
          aksi: "Menandai Permohonan Selesai (ARCHIVED -> COMPLETED)",
          statusSebelum: "ARCHIVED",
          statusSesudah: "COMPLETED",
          pelakuId: session.user.id
        }
      });

      return { success: true, permohonan: updated };
    });
  } catch (error: any) {
    console.error("[ACTION-COMPLETE-PERMOHONAN-ERR]", error);
    return { success: false, error: error.message || "Gagal menyelesaikan permohonan." };
  }
}

/**
 * Action: Request "Batal Selesai" (rollback: COMPLETED -> ARCHIVED).
 * Requires Supervisor approval. Creates PENDING_APPROVAL request.
 */
export async function ajukanBatalSelesai(permohonanId: string, alasan: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PEMANTAU") {
    throw new Error("Unauthorized");
  }

  if (!alasan || !alasan.trim()) {
    return { success: false, error: "Alasan pembatalan selesai wajib diisi." };
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

      if (permohonan.status !== "COMPLETED") {
        throw new Error("Hanya permohonan berstatus Selesai (COMPLETED) yang dapat dibatalkan penyelesaiannya.");
      }

      // Check if there is an existing pending request
      const existingRequest = await tx.permintaanKoreksi.findFirst({
        where: {
          permohonanId,
          status: "PENDING_APPROVAL",
          jenisKoreksi: "BATAL_SELESAI"
        }
      });

      if (existingRequest) {
        throw new Error("Permintaan pembatalan penyelesaian untuk berkas ini sudah diajukan dan masih menunggu keputusan Supervisor.");
      }

      // Create PermintaanKoreksi
      const request = await tx.permintaanKoreksi.create({
        data: {
          permohonanId,
          jenisKoreksi: "BATAL_SELESAI",
          status: "PENDING_APPROVAL",
          pengajuId: session.user.id,
          catatanPengaju: alasan
        }
      });

      // Notify Supervisor
      const notifTitle = "Persetujuan Batal Selesai";
      const notifPesan = `Pemantau mengajukan pembatalan status selesai (Rollback) untuk Permohonan ${permohonan.nomorPelayanan || permohonan.nomorPermohonan}. Alasan: "${alasan}"`;
      
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
    console.error("[ACTION-AJUKAN-BATAL-SELESAI-ERR]", error);
    return { success: false, error: error.message || "Gagal mengajukan pembatalan selesai." };
  }
}

/**
 * Action: Retrieve statistics for the Pemantau dashboard.
 */
export async function getPemantauStats() {
  const session = await getServerSession(authOptions);
  if (!session || !["PEMANTAU", "SUPERVISOR"].includes(session.user.role)) {
    throw new Error("Unauthorized");
  }

  try {
    const antreanPemantauan = await prisma.permohonan.count({
      where: {
        status: "ARCHIVED",
        bundle: {
          manifest: {
            status: "SENT"
          }
        }
      }
    });

    const berkasSelesai = await prisma.permohonan.count({
      where: {
        status: "COMPLETED",
        bundle: {
          manifest: {
            status: "SENT"
          }
        }
      }
    });

    const berkasFrozen = await prisma.permohonan.count({
      where: {
        status: { in: ["ARCHIVED", "COMPLETED"] },
        bundle: {
          manifest: {
            status: "SENT"
          }
        },
        permintaanKoreksi: {
          some: {
            status: "PENDING_APPROVAL"
          }
        }
      }
    });

    return {
      success: true,
      stats: {
        antreanPemantauan,
        berkasSelesai,
        berkasFrozen
      }
    };
  } catch (error: any) {
    console.error("[ACTION-GET-PEMANTAU-STATS-ERR]", error);
    return { success: false, stats: null, error: "Gagal mengambil statistik pemantau." };
  }
}
