"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Server Action: Get global unified dashboard statistics
 */
export async function getGlobalBerandaStats(startDate?: string, endDate?: string) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error('Unauthorized');
  }

  try {
    const whereClause: any = {};
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        whereClause.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        whereClause.createdAt.lte = end;
      }
    }

    const list = await prisma.application.findMany({
      where: whereClause,
      include: {
        currentBundle: true
      },
      orderBy: { createdAt: 'desc' }
    });

    let totalNopel = list.length;
    let totalPemohon = 0;
    let totalScannedPemohon = 0;

    const serviceTypes = [
      'PARTIAL_MUTATION',
      'EXPIRED_UPDATE',
      'EXPIRED_REGULAR',
      'NEW_TAX_OBJECT',
      'CORRECTION',
      'REACTIVATION'
    ];

    const breakdownByService: Record<string, {
      totalNopel: number;
      totalPemohon: number;
      prosesCount: number;
      selesaiCount: number;
      revisiCount: number;
      dikirimCount: number;
    }> = {};

    serviceTypes.forEach(st => {
      breakdownByService[st] = {
        totalNopel: 0,
        totalPemohon: 0,
        prosesCount: 0,
        selesaiCount: 0,
        revisiCount: 0,
        dikirimCount: 0,
      };
    });

    let globalProses = 0;
    let globalSelesai = 0;
    let globalRevisi = 0;
    let globalDikirim = 0;
    let mutasiSebagianMultiNopelCount = 0;

    const kecamatanMap: Record<string, { kecamatan: string; totalPemohon: number; totalNopel: number }> = {};
    const desaMap: Record<string, { desa: string; kecamatan: string; totalPemohon: number; totalNopel: number }> = {};

    list.forEach((item: any) => {
      const targetData = item.targetData || [];
      const previousData = item.previousData || [];
      const pemohonCountInItem = targetData.length > 0 ? targetData.length : 1;
      totalPemohon += pemohonCountInItem;

      if (targetData.length > 0) {
        targetData.forEach((td: any) => {
          const hasScan = (td.digitalArchives || []).some((da: any) => da.status === 'ACTIVE')
            || item.status === 'COMPLETED' || item.status === 'ARCHIVED';
          if (hasScan) {
            totalScannedPemohon += 1;
          }
        });
      } else {
        const hasScan = item.status === 'COMPLETED' || item.status === 'ARCHIVED';
        if (hasScan) {
          totalScannedPemohon += 1;
        }
      }

      const stKey = item.applicationType || 'PARTIAL_MUTATION';
      if (!breakdownByService[stKey]) {
        breakdownByService[stKey] = {
          totalNopel: 0,
          totalPemohon: 0,
          prosesCount: 0,
          selesaiCount: 0,
          revisiCount: 0,
          dikirimCount: 0,
        };
      }

      breakdownByService[stKey].totalNopel += 1;
      breakdownByService[stKey].totalPemohon += pemohonCountInItem;

      if (stKey === 'PARTIAL_MUTATION' && pemohonCountInItem > 1) {
        mutasiSebagianMultiNopelCount += 1;
      }

      const statusStr = String(item.status);
      if (statusStr === 'COMPLETED') {
        breakdownByService[stKey].selesaiCount += pemohonCountInItem;
        globalSelesai += pemohonCountInItem;
      } else if (statusStr === 'MANIFESTED' || statusStr === 'ARCHIVED' || statusStr === 'DELIVERED') {
        globalDikirim += pemohonCountInItem;
        breakdownByService[stKey].dikirimCount += pemohonCountInItem;
      } else if (statusStr === 'REVISION') {
        breakdownByService[stKey].revisiCount += pemohonCountInItem;
        globalRevisi += pemohonCountInItem;
      } else {
        breakdownByService[stKey].prosesCount += pemohonCountInItem;
        globalProses += pemohonCountInItem;
      }

      if (targetData.length > 0) {
        const kecSetInItem = new Set<string>();
        const desaSetInItem = new Set<string>();

        targetData.forEach((td: any) => {
          const kec = (td.objectKecamatan || td.ownerKecamatan || previousData[0]?.objectKecamatan || 'KECAMATAN LAIN').trim().toUpperCase();
          const desa = (td.objectDesa || td.ownerDesa || previousData[0]?.objectDesa || 'DESA LAIN').trim().toUpperCase();

          if (!kecamatanMap[kec]) {
            kecamatanMap[kec] = { kecamatan: kec, totalPemohon: 0, totalNopel: 0 };
          }
          kecamatanMap[kec].totalPemohon += 1;

          if (!kecSetInItem.has(kec)) {
            kecSetInItem.add(kec);
            kecamatanMap[kec].totalNopel += 1;
          }

          const desaKey = `${kec}___${desa}`;
          if (!desaMap[desaKey]) {
            desaMap[desaKey] = { desa: desa, kecamatan: kec, totalPemohon: 0, totalNopel: 0 };
          }
          desaMap[desaKey].totalPemohon += 1;

          if (!desaSetInItem.has(desaKey)) {
            desaSetInItem.add(desaKey);
            desaMap[desaKey].totalNopel += 1;
          }
        });
      } else {
        const prev = previousData[0] || {};
        const kec = (prev.objectKecamatan || 'KECAMATAN LAIN').trim().toUpperCase();
        const desa = (prev.objectDesa || 'DESA LAIN').trim().toUpperCase();

        if (!kecamatanMap[kec]) {
          kecamatanMap[kec] = { kecamatan: kec, totalPemohon: 0, totalNopel: 0 };
        }
        kecamatanMap[kec].totalPemohon += 1;
        kecamatanMap[kec].totalNopel += 1;

        const desaKey = `${kec}___${desa}`;
        if (!desaMap[desaKey]) {
          desaMap[desaKey] = { desa: desa, kecamatan: kec, totalPemohon: 0, totalNopel: 0 };
        }
        desaMap[desaKey].totalPemohon += 1;
        desaMap[desaKey].totalNopel += 1;
      }
    });

    const bundles = await prisma.bundle.findMany({
      include: { currentManifest: true }
    });

    let totalRekomDibuat = 0;
    let totalRekomDikirim = 0;
    let totalRekomVoid = 0;

    const rekomBreakdownByService: Record<string, {
      totalDibuat: number;
      totalDikirim: number;
      totalVoid: number;
    }> = {};

    serviceTypes.forEach(st => {
      rekomBreakdownByService[st] = {
        totalDibuat: 0,
        totalDikirim: 0,
        totalVoid: 0,
      };
    });

    bundles.forEach((b: any) => {
      const stKey = b.applicationType || 'PARTIAL_MUTATION';
      if (!rekomBreakdownByService[stKey]) {
        rekomBreakdownByService[stKey] = {
          totalDibuat: 0,
          totalDikirim: 0,
          totalVoid: 0,
        };
      }

      const isDibuat = b.status === 'LOCKED' || b.status === 'IN_MANIFEST';
      const isDikirim = b.currentManifest?.status === 'SENT';

      if (isDibuat) {
        totalRekomDibuat += 1;
        rekomBreakdownByService[stKey].totalDibuat += 1;
      }
      if (isDikirim) {
        totalRekomDikirim += 1;
        rekomBreakdownByService[stKey].totalDikirim += 1;
      }
    });

    const byKecamatan = Object.values(kecamatanMap).sort((a, b) => b.totalPemohon - a.totalPemohon);
    const byDesa = Object.values(desaMap).sort((a, b) => b.totalPemohon - a.totalPemohon);

    return {
      success: true,
      totalNopel,
      totalPemohon,
      totalScannedPemohon,
      globalProses,
      globalSelesai,
      globalRevisi,
      globalDikirim,
      mutasiSebagianMultiNopelCount,
      breakdownByService,
      byKecamatan,
      byDesa,
      recentList: list.slice(0, 15),
      rekomStats: {
        totalDibuat: totalRekomDibuat,
        totalDikirim: totalRekomDikirim,
        totalVoid: totalRekomVoid,
        breakdownByService: rekomBreakdownByService
      }
    };
  } catch (error: any) {
    console.error('[ACTION-GET-GLOBAL-BERANDA-STATS-ERR]', error);
    return {
      success: false,
      totalNopel: 0,
      totalPemohon: 0,
      globalProses: 0,
      globalSelesai: 0,
      globalRevisi: 0,
      globalDikirim: 0,
      mutasiSebagianMultiNopelCount: 0,
      breakdownByService: {},
      byKecamatan: [],
      byDesa: [],
      recentList: [],
      rekomStats: {
        totalDibuat: 0,
        totalDikirim: 0,
        totalVoid: 0,
        breakdownByService: {}
      }
    };
  }
}
