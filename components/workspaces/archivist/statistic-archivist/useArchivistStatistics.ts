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
  totalGrowthPct?: number;
  uploadedGrowthPct?: number;
  pendingGrowthPct?: number;
  reuploadGrowthPct?: number;
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

    const BUCKET_COUNT = 4;
    const totalBuckets = new Array(BUCKET_COUNT).fill(0);
    const uploadedBuckets = new Array(BUCKET_COUNT).fill(0);
    const pendingBuckets = new Array(BUCKET_COUNT).fill(0);
    const reuploadBuckets = new Array(BUCKET_COUNT).fill(0);

    let thisWeekTotal = 0;
    let lastWeekTotal = 0;
    let thisWeekUploaded = 0;
    let lastWeekUploaded = 0;
    let thisWeekPending = 0;
    let lastWeekPending = 0;
    let thisWeekReupload = 0;
    let lastWeekReupload = 0;

    const now = Date.now();
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;

    targetList.forEach((p: any, idx: number) => {
      const isReupload = checkPermohonanNeedsReupload(p);
      const jenis = p.jenisPermohonan || p.applicationType;
      const isPartialMutation = jenis === "MUTASI_SEBAGIAN" || jenis === "PARTIAL_MUTATION";
      const fractions = p.targetData || p.dataBaru;

      const dateStr = p.createdAt || p.serviceNumberDate || p.updatedAt;
      let daysAgo = -1;
      if (dateStr) {
        const itemTime = new Date(dateStr).getTime();
        if (!isNaN(itemTime)) {
          daysAgo = Math.floor(Math.max(0, now - itemTime) / ONE_DAY_MS);
        }
      }

      const addToBucket = (isUploaded: boolean, isReup: boolean) => {
        if (daysAgo >= 0 && daysAgo < 28) {
          const weekOffset = Math.floor(daysAgo / 7);
          const bucketIdx = (BUCKET_COUNT - 1) - weekOffset;
          totalBuckets[bucketIdx]++;
          if (isUploaded) uploadedBuckets[bucketIdx]++;
          else pendingBuckets[bucketIdx]++;
          if (isReup) reuploadBuckets[bucketIdx]++;
        } else {
          const bucketIdx = Math.floor((idx / Math.max(1, targetList.length)) * BUCKET_COUNT);
          totalBuckets[bucketIdx]++;
          if (isUploaded) uploadedBuckets[bucketIdx]++;
          else pendingBuckets[bucketIdx]++;
          if (isReup) reuploadBuckets[bucketIdx]++;
        }

        if (daysAgo >= 0 && daysAgo < 7) {
          thisWeekTotal++;
          if (isUploaded) thisWeekUploaded++;
          else thisWeekPending++;
          if (isReup) thisWeekReupload++;
        } else if (daysAgo >= 7 && daysAgo < 14) {
          lastWeekTotal++;
          if (isUploaded) lastWeekUploaded++;
          else lastWeekPending++;
          if (isReup) lastWeekReupload++;
        }
      };

      if (isPartialMutation && Array.isArray(fractions) && fractions.length > 0) {
        fractions.forEach((db: any) => {
          totalPemohon++;
          const fractionReupload = checkPermohonanNeedsReupload(p, db.id || db.idTargetData);
          if (fractionReupload || isReupload) {
            perluReupload++;
          }
          const isUploaded =
            p.status === "ARCHIVED" ||
            p.arsipDigital?.some(
              (ad: any) => (ad.dataBaruId === db.id || ad.dataBaruId === db.idTargetData) && ad.status === "ACTIVE"
            );
          if (isUploaded) {
            sudahTerupload++;
          } else {
            belumDiupload++;
          }
          addToBucket(!!isUploaded, fractionReupload || isReupload);
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
        addToBucket(!!isUploaded, isReupload);
      }
    });

    const total = totalPemohon || 1;
    const sudahTeruploadPct = `${((sudahTerupload / total) * 100).toFixed(0)}%`;
    const belumDiuploadPct = `${((belumDiupload / total) * 100).toFixed(0)}%`;
    const perluReuploadPct = `${((perluReupload / total) * 100).toFixed(0)}%`;

    const cumulateIfNeeded = (buckets: number[], totalCount: number) => {
      const sum = buckets.reduce((a, b) => a + b, 0);
      if (sum === 0 && totalCount > 0) {
        return [
          Math.ceil(totalCount * 0.2),
          Math.ceil(totalCount * 0.5),
          Math.ceil(totalCount * 0.8),
          totalCount,
        ];
      }
      return buckets;
    };

    const calcWoWGrowth = (thisWeek: number, lastWeek: number) => {
      if (lastWeek === 0) {
        return thisWeek > 0 ? 100 : 0;
      }
      return Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
    };

    return {
      totalPemohon,
      sudahTerupload,
      sudahTeruploadPct,
      belumDiupload,
      belumDiuploadPct,
      perluReupload,
      perluReuploadPct,
      totalTrend: cumulateIfNeeded(totalBuckets, totalPemohon),
      uploadedTrend: cumulateIfNeeded(uploadedBuckets, sudahTerupload),
      pendingTrend: cumulateIfNeeded(pendingBuckets, belumDiupload),
      reuploadTrend: cumulateIfNeeded(reuploadBuckets, perluReupload),
      totalGrowthPct: calcWoWGrowth(thisWeekTotal, lastWeekTotal),
      uploadedGrowthPct: calcWoWGrowth(thisWeekUploaded, lastWeekUploaded),
      pendingGrowthPct: calcWoWGrowth(thisWeekPending, lastWeekPending),
      reuploadGrowthPct: calcWoWGrowth(thisWeekReupload, lastWeekReupload),
    };
  }, [allPermohonanList, bundlesList, checkPermohonanNeedsReupload]);
}
