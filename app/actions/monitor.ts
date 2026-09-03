"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendWhatsApp } from "@/lib/fonnte";
import { revalidatePath } from "next/cache";

/**
 * Action: Get all applications that can be monitored.
 */
export async function getMonitoringPermohonan() {
  const session = await getServerSession(authOptions);
  if (!session || !["MONITOR", "SUPERVISOR", "PEMANTAU"].includes((session.user as any).role)) {
    throw new Error("Unauthorized");
  }

  try {
    const list = await prisma.application.findMany({
      where: {
        status: { in: ["ARCHIVED", "COMPLETED", "DELIVERED", "MANIFESTED", "SUBMITTED"] }
      },
      include: {
        currentBundle: true
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
 * Action: Mark a permohonan as completed
 */
export async function completePermohonan(permohonanId: string) {
  const session = await getServerSession(authOptions);
  if (!session || !["MONITOR", "SUPERVISOR", "PEMANTAU"].includes((session.user as any).role)) {
    throw new Error("Unauthorized");
  }

  try {
    const updated = await prisma.application.update({
      where: { id: permohonanId },
      data: {
        status: "COMPLETED"
      }
    });

    revalidatePath("/");
    return { success: true, permohonan: updated };
  } catch (error: any) {
    console.error("[ACTION-COMPLETE-PERMOHONAN-ERR]", error);
    return { success: false, error: error.message || "Gagal menyelesaikan permohonan." };
  }
}

/**
 * Action: Request Batal Selesai
 */
export async function ajukanBatalSelesai(permohonanId: string, alasan: string) {
  const session = await getServerSession(authOptions);
  if (!session || !["MONITOR", "SUPERVISOR", "PEMANTAU"].includes((session.user as any).role)) {
    throw new Error("Unauthorized");
  }

  try {
    const updated = await prisma.application.update({
      where: { id: permohonanId },
      data: { status: "ARCHIVED" }
    });

    revalidatePath("/");
    return { success: true, permohonan: updated };
  } catch (error: any) {
    console.error("[ACTION-BATAL-SELESAI-ERR]", error);
    return { success: false, error: error.message || "Gagal membatalkan status selesai." };
  }
}

export async function toggleVerifyDataBaru(permohonanId: string, targetDataId?: any) {
  try {
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function verifyAllDataBaru(permohonanId: string) {
  try {
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function getMonitorStats() {
  const session = await getServerSession(authOptions);
  if (!session || !["MONITOR", "SUPERVISOR", "PEMANTAU"].includes((session.user as any).role)) {
    throw new Error("Unauthorized");
  }

  try {
    const totalCount = await prisma.application.count();
    const completedCount = await prisma.application.count({ where: { status: "COMPLETED" } });
    const archivedCount = await prisma.application.count({ where: { status: "ARCHIVED" } });

    return {
      success: true,
      stats: {
        totalCount,
        completedCount,
        archivedCount
      }
    };
  } catch (error: any) {
    console.error("[ACTION-GET-MONITOR-STATS-ERR]", error);
    return { success: false, stats: null, error: "Gagal mengambil statistik pemantauan." };
  }
}
