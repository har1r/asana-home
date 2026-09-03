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
          bundles: {
            include: {
              applications: true
            }
          }
        }
      });

      // 2. Fetch latest 15 loose applications
      const loosePermohonans = await prisma.application.findMany({
        where: {
          OR: [
            { currentBundleId: null },
            { currentBundle: { currentManifestId: null } }
          ]
        },
        include: {
          currentBundle: true
        },
        orderBy: { createdAt: "desc" },
        take: 15
      });

      return { success: true, manifests, loosePermohonans };
    } else {
      // 3. Query manifests matching query
      const manifests = await prisma.manifest.findMany({
        where: {
          OR: [
            { manifestNumber: { contains: trimmedQuery, mode: "insensitive" } },
            {
              bundles: {
                some: {
                  OR: [
                    { bundleNumber: { contains: trimmedQuery, mode: "insensitive" } },
                    {
                      applications: {
                        some: {
                          applicationNumber: { contains: trimmedQuery, mode: "insensitive" }
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
          bundles: {
            include: {
              applications: true
            }
          }
        },
        orderBy: { createdAt: "desc" }
      });

      // 4. Query matching loose applications
      const loosePermohonans = await prisma.application.findMany({
        where: {
          AND: [
            {
              OR: [
                { currentBundleId: null },
                { currentBundle: { currentManifestId: null } }
              ]
            },
            {
              applicationNumber: { contains: trimmedQuery, mode: "insensitive" }
            }
          ]
        },
        include: {
          currentBundle: true
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
