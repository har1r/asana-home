"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AuditAction } from "@prisma/client";

export interface GetGlobalAuditLogsParams {
  search?: string;
  entityType?: string; // "ALL" | "APPLICATION" | "BUNDLE" | "MANIFEST"
  action?: string;     // "ALL" | AuditAction enum string
  page?: number;
  limit?: number;
}

export async function getGlobalAuditLogs(params: GetGlobalAuditLogsParams = {}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return {
      success: false,
      error: "Unauthorized access.",
      logs: [],
      total: 0,
      page: 1,
      totalPages: 0,
    };
  }

  const search = params.search?.trim() || "";
  const entityType = params.entityType && params.entityType !== "ALL" ? params.entityType : undefined;
  const action = params.action && params.action !== "ALL" ? (params.action as AuditAction) : undefined;
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(50, Math.max(1, params.limit || 15));
  const skip = (page - 1) * limit;

  try {
    const whereCondition: any = {};

    if (entityType) {
      whereCondition.entityType = entityType;
    }

    if (action) {
      whereCondition.action = action;
    }

    if (search) {
      // 1. Cari Application yang cocok dengan nomor permohonan, NOP, atau nama pemohon
      const matchingApps = await prisma.application.findMany({
        where: {
          OR: [
            { applicationNumber: { contains: search, mode: "insensitive" } },
            { previousData: { some: { nop: { contains: search, mode: "insensitive" } } } },
            { targetData: { some: { nopTemporary: { contains: search, mode: "insensitive" } } } },
            { targetData: { some: { ownerName: { contains: search, mode: "insensitive" } } } },
          ],
        },
        select: { id: true, currentBundleId: true },
      });

      const appIds = matchingApps.map((a) => a.id);
      const bundleIdsFromApps = matchingApps.map((a) => a.currentBundleId).filter(Boolean) as string[];

      // 2. Cari Bundle yang cocok dengan nomor bundle atau terikat permohonan terkait
      const matchingBundles = await prisma.bundle.findMany({
        where: {
          OR: [
            { bundleNumber: { contains: search, mode: "insensitive" } },
            { id: { in: bundleIdsFromApps } },
            { applications: { some: { id: { in: appIds } } } },
          ],
        },
        select: { id: true, currentManifestId: true },
      });

      const bundleIds = matchingBundles.map((b) => b.id);
      const manifestIdsFromBundles = matchingBundles.map((b) => b.currentManifestId).filter(Boolean) as string[];

      // 3. Cari Manifest yang cocok dengan nomor manifest atau terikat bundle terkait
      const matchingManifests = await prisma.manifest.findMany({
        where: {
          OR: [
            { manifestNumber: { contains: search, mode: "insensitive" } },
            { id: { in: manifestIdsFromBundles } },
            { bundles: { some: { id: { in: bundleIds } } } },
          ],
        },
        select: { id: true },
      });

      const manifestIds = matchingManifests.map((m) => m.id);

      const allMatchingEntityIds = Array.from(new Set([...appIds, ...bundleIds, ...manifestIds]));

      whereCondition.OR = [
        { entityType: { contains: search, mode: "insensitive" } },
        { oldStatus: { contains: search, mode: "insensitive" } },
        { newStatus: { contains: search, mode: "insensitive" } },
        ...(allMatchingEntityIds.length > 0 ? [{ entityId: { in: allMatchingEntityIds } }] : []),
        {
          actor: {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: whereCondition,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          actor: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      }),
      prisma.auditLog.count({ where: whereCondition }),
    ]);

    // Format metadata JSON for safe serialization
    const serializedLogs = logs.map((log) => ({
      ...log,
      createdAt: log.createdAt.toISOString(),
    }));

    return {
      success: true,
      logs: serializedLogs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error: any) {
    console.error("[ACTION-GET-GLOBAL-AUDIT-LOGS-ERR]", error);
    return {
      success: false,
      error: "Gagal mengambil data audit log global.",
      logs: [],
      total: 0,
      page: 1,
      totalPages: 0,
    };
  }
}

/**
 * Mendapatkan statistik ringkasan aktivitas Audit Log untuk dashboard header.
 */
export async function getAuditStats() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return {
      success: false,
      error: "Unauthorized",
      stats: { totalLogs: 0, todayLogs: 0, applicationLogs: 0, bundleLogs: 0, manifestLogs: 0 },
    };
  }

  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [totalLogs, todayLogs, applicationLogs, bundleLogs, manifestLogs] = await Promise.all([
      prisma.auditLog.count(),
      prisma.auditLog.count({
        where: { createdAt: { gte: todayStart } },
      }),
      prisma.auditLog.count({
        where: { entityType: "APPLICATION" },
      }),
      prisma.auditLog.count({
        where: { entityType: "BUNDLE" },
      }),
      prisma.auditLog.count({
        where: { entityType: "MANIFEST" },
      }),
    ]);

    return {
      success: true,
      stats: {
        totalLogs,
        todayLogs,
        applicationLogs,
        bundleLogs,
        manifestLogs,
      },
    };
  } catch (error: any) {
    console.error("[ACTION-GET-AUDIT-STATS-ERR]", error);
    return {
      success: false,
      error: "Gagal mengambil statistik audit log.",
      stats: { totalLogs: 0, todayLogs: 0, applicationLogs: 0, bundleLogs: 0, manifestLogs: 0 },
    };
  }
}

/**
 * Mencari entitas terkait untuk dikirim ke DetailsModal saat diklik dari audit log.
 */
export async function getEntityDetailsForAudit(entityType: string, entityId: string) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    if (entityType === "APPLICATION") {
      const app = await prisma.application.findUnique({
        where: { id: entityId },
        include: { currentBundle: true },
      });
      return { success: !!app, data: app, entityType };
    } else if (entityType === "BUNDLE") {
      const bundle = await prisma.bundle.findUnique({
        where: { id: entityId },
        include: { applications: true, currentManifest: true },
      });
      return { success: !!bundle, data: bundle, entityType };
    } else if (entityType === "MANIFEST") {
      const manifest = await prisma.manifest.findUnique({
        where: { id: entityId },
        include: { bundles: { include: { applications: true } } },
      });
      return { success: !!manifest, data: manifest, entityType };
    }

    return { success: false, error: "Tipe entitas tidak dikenali." };
  } catch (error: any) {
    console.error("[ACTION-GET-ENTITY-DETAILS-AUDIT-ERR]", error);
    return { success: false, error: "Gagal mengambil detail entitas." };
  }
}
