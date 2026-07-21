"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function searchPermohonans(query: string) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, results: [] };

  const trimmedQuery = query.trim();
  if (!trimmedQuery) return { success: true, results: [] };

  try {
    const results = await prisma.permohonan.findMany({
      where: {
        OR: [
          { nomorPelayanan: { contains: trimmedQuery, mode: "insensitive" } },
          { nop: { contains: trimmedQuery, mode: "insensitive" } },
          { namaWajibPajak: { contains: trimmedQuery, mode: "insensitive" } },
        ],
      },
      include: {
        dataBaru: true,
      },
      orderBy: { createdAt: "desc" },
      take: 15,
    });

    return { success: true, results };
  } catch (error) {
    console.error("[GLOBAL-SEARCH-ERR]", error);
    return { success: false, results: [] };
  }
}
