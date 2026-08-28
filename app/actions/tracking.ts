"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getTrackingData(query?: string) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return { success: false, error: "Unauthorized access.", manifests: [], loosePermohonans: [] };
  }

  const trimmedQuery = query?.trim() || "";

  try {
    if (!trimmedQuery) {
      // 1. Fetch latest 10 manifests
      const manifests = await prisma.manifest.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          pengirim: {
            select: { name: true, email: true }
          },
          bundle: {
            include: {
              peneliti: {
                select: { name: true, email: true }
              },
              permohonan: {
                include: {
                  penginput: {
                    select: { name: true, email: true }
                  },
                  dataBaru: true,
                  arsipDigital: {
                    where: { status: "ACTIVE" },
                    orderBy: { versi: "desc" },
                    take: 1
                  }
                }
              }
            }
          }
        }
      });

      // 2. Fetch latest 15 loose permohonans
      const loosePermohonans = await prisma.permohonan.findMany({
        where: {
          OR: [
            { bundleId: null },
            { bundle: { manifestId: null } }
          ]
        },
        include: {
          penginput: {
            select: { name: true, email: true }
          },
          dataBaru: true,
          arsipDigital: {
            where: { status: "ACTIVE" },
            orderBy: { versi: "desc" },
            take: 1
          },
          bundle: {
            include: {
              peneliti: {
                select: { name: true, email: true }
              }
            }
          }
        },
        orderBy: { createdAt: "desc" },
        take: 15
      });

      return { success: true, manifests, loosePermohonans };
    } else {
      // 3. Query manifests matching query (by nomorManifest, nomorBundle, NOP, nomorPelayanan, nomorPermohonan, namaWajibPajak)
      const manifests = await prisma.manifest.findMany({
        where: {
          OR: [
            { nomorManifest: { contains: trimmedQuery, mode: "insensitive" } },
            {
              bundle: {
                some: {
                  OR: [
                    { nomorBundle: { contains: trimmedQuery, mode: "insensitive" } },
                    {
                      permohonan: {
                        some: {
                          OR: [
                            { nop: { contains: trimmedQuery, mode: "insensitive" } },
                            { nomorPelayanan: { contains: trimmedQuery, mode: "insensitive" } },
                            { nomorPermohonan: { contains: trimmedQuery, mode: "insensitive" } },
                            { namaWajibPajak: { contains: trimmedQuery, mode: "insensitive" } }
                          ]
                        }
                      }
                    }
                  ]
                }
              }
            }
          ]
        },
        include: {
          pengirim: {
            select: { name: true, email: true }
          },
          bundle: {
            include: {
              peneliti: {
                select: { name: true, email: true }
              },
              permohonan: {
                include: {
                  penginput: {
                    select: { name: true, email: true }
                  },
                  dataBaru: true,
                  arsipDigital: {
                    where: { status: "ACTIVE" },
                    orderBy: { versi: "desc" },
                    take: 1
                  }
                }
              }
            }
          }
        },
        orderBy: { createdAt: "desc" }
      });

      // 4. Query matching loose permohonans
      const loosePermohonans = await prisma.permohonan.findMany({
        where: {
          AND: [
            {
              OR: [
                { bundleId: null },
                { bundle: { manifestId: null } }
              ]
            },
            {
              OR: [
                { nop: { contains: trimmedQuery, mode: "insensitive" } },
                { nomorPelayanan: { contains: trimmedQuery, mode: "insensitive" } },
                { nomorPermohonan: { contains: trimmedQuery, mode: "insensitive" } },
                { namaWajibPajak: { contains: trimmedQuery, mode: "insensitive" } }
              ]
            }
          ]
        },
        include: {
          penginput: {
            select: { name: true, email: true }
          },
          dataBaru: true,
          arsipDigital: {
            where: { status: "ACTIVE" },
            orderBy: { versi: "desc" },
            take: 1
          },
          bundle: {
            include: {
              peneliti: {
                select: { name: true, email: true }
              }
            }
          }
        },
        orderBy: { createdAt: "desc" }
      });

      return { success: true, manifests, loosePermohonans };
    }
  } catch (error: any) {
    console.error("[TRACKING-ACTION-ERR]", error);
    return { success: false, error: error.message || "Failed to fetch tracking data.", manifests: [], loosePermohonans: [] };
  }
}
