import { useMemo } from "react";

export interface ArchivistStatisticMetrics {
  totalPemohon: number;
  sudahTerupload: number;
  sudahTeruploadPct: string;
  belumDiupload: number;
  belumDiuploadPct: string;
  perluReupload: number;
  perluReuploadPct: string;
  totalTrend: number[];
  uploadedTrend: number[];
  pendingTrend: number[];
  reuploadTrend: number[];
}

export function useArchivistStatistics(
  allPermohonanList: any[],
  bundlesList: any[],
  checkPermohonanNeedsReupload: (p: any, targetId?: string | null) => boolean
): ArchivistStatisticMetrics {
  return useMemo(() => {
    let totalPemohon = 0;
    let sudahTerupload = 0;
    let belumDiupload = 0;
    let perluReupload = 0;

    const targetList =
      allPermohonanList.length > 0
        ? allPermohonanList
        : bundlesList.flatMap((b) => b.applications || b.permohonan || []);

    targetList.forEach((p: any) => {
      const isReupload = checkPermohonanNeedsReupload(p);
      const jenis = p.jenisPermohonan || p.applicationType;

      if (jenis === "MUTASI_SEBAGIAN" && p.dataBaru && p.dataBaru.length > 0) {
        p.dataBaru.forEach((db: any) => {
          totalPemohon++;
          const fractionReupload = checkPermohonanNeedsReupload(p, db.id);
          if (fractionReupload || isReupload) {
            perluReupload++;
          }
          const isUploaded =
            p.status === "ARCHIVED" ||
            p.arsipDigital?.some((ad: any) => ad.dataBaruId === db.id && ad.status === "ACTIVE");
          if (isUploaded) {
            sudahTerupload++;
          } else {
            belumDiupload++;
          }
        });
      } else {
        totalPemohon++;
        if (isReupload) {
          perluReupload++;
        }
        const isUploaded =
          p.status === "ARCHIVED" ||
          p.arsipDigital?.some((ad: any) => ad.status === "ACTIVE" && ad.dataBaruId === null);
        if (isUploaded) {
          sudahTerupload++;
        } else {
          belumDiupload++;
        }
      }
    });

    const total = totalPemohon || 1;
    const sudahTeruploadPct = `${((sudahTerupload / total) * 100).toFixed(0)}%`;
    const belumDiuploadPct = `${((belumDiupload / total) * 100).toFixed(0)}%`;
    const perluReuploadPct = `${((perluReupload / total) * 100).toFixed(0)}%`;

    // Simulated 5-step trends for visual sparklines
    const totalTrend = [
      Math.max(1, Math.round(totalPemohon * 0.6)),
      Math.max(1, Math.round(totalPemohon * 0.75)),
      Math.max(1, Math.round(totalPemohon * 0.85)),
      Math.max(1, Math.round(totalPemohon * 0.95)),
      totalPemohon,
    ];

    const uploadedTrend = [
      Math.max(0, Math.round(sudahTerupload * 0.4)),
      Math.max(0, Math.round(sudahTerupload * 0.6)),
      Math.max(0, Math.round(sudahTerupload * 0.75)),
      Math.max(0, Math.round(sudahTerupload * 0.9)),
      sudahTerupload,
    ];

    const pendingTrend = [
      Math.max(0, Math.round(belumDiupload * 1.3)),
      Math.max(0, Math.round(belumDiupload * 1.2)),
      Math.max(0, Math.round(belumDiupload * 1.1)),
      Math.max(0, Math.round(belumDiupload * 1.05)),
      belumDiupload,
    ];

    const reuploadTrend = [
      Math.max(0, Math.round(perluReupload * 0.2)),
      Math.max(0, Math.round(perluReupload * 0.5)),
      Math.max(0, Math.round(perluReupload * 0.8)),
      Math.max(0, Math.round(perluReupload * 0.9)),
      perluReupload,
    ];

    return {
      totalPemohon,
      sudahTerupload,
      sudahTeruploadPct,
      belumDiupload,
      belumDiuploadPct,
      perluReupload,
      perluReuploadPct,
      totalTrend,
      uploadedTrend,
      pendingTrend,
      reuploadTrend,
    };
  }, [allPermohonanList, bundlesList, checkPermohonanNeedsReupload]);
}
