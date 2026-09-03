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
    const results = await prisma.application.findMany({
      where: {
        OR: [
          { applicationNumber: { contains: trimmedQuery, mode: "insensitive" } },
        ],
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
