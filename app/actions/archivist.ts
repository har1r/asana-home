"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";
import { UserRole } from "@prisma/client";

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
        include: {
          applications: true
        },
        orderBy: { createdAt: "desc" }
      }),
      prisma.application.findMany({
        select: {
          id: true,
          status: true,
          applicationType: true,
          currentBundleId: true
        }
      })
    ]);

    return { success: true, list, allPermohonan };
  } catch (error: any) {
    console.error("[ACTION-GET-DIGIT-BUNDLES-ERR]", error);
    return { success: false, list: [], error: "Gagal mengambil daftar bundle digitalisasi." };
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

    return { success: true, bundle };
  } catch (error: any) {
    console.error("[ACTION-GET-BUNDLE-DETAILS-ERR]", error);
    return { success: false, error: "Gagal mengambil detail bundle." };
  }
}

export async function uploadArsipDigital(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || !["ARCHIVIST", "SUPERVISOR", "PENGARSIP"].includes((session.user as any).role)) {
    return { success: false, error: "Unauthorized" };
  }

  const file = formData.get("file") as File;
  const permohonanId = formData.get("permohonanId") as string;

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

    const updated = await prisma.application.update({
      where: { id: permohonanId },
      data: {
        status: "ARCHIVED"
      }
    });

    revalidatePath("/");
    return { success: true, permohonan: updated, urlBlob };
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
