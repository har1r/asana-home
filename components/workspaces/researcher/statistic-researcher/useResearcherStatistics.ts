import { useMemo } from 'react';

export interface BundleStatusCounts {
  DRAFT: number;
  LOCKED: number;
  IN_MANIFEST: number;
  [key: string]: number;
}

export interface ResearcherStatisticMetrics {
  totalBundles: number;
  bundleStatusCounts: BundleStatusCounts;

  returnedFromPengarsipCount: number;
  returnedFromPengirimLogistikCount: number;
  returnedFromPengirimPusatCount: number;
  totalReturCount: number;

  submittedCount: number;
  processedCount: number;

  // Sparkline 4-week trends
  totalBundlesTrend: number[];
  draftTrend: number[];
  lockedTrend: number[];
  manifestTrend: number[];

  totalReturTrend: number[];
  pengarsipTrend: number[];
  logistikTrend: number[];
  pusatTrend: number[];

  // Week-over-Week Growth %
  totalBundlesGrowthPct: number;
  draftGrowthPct: number;
  lockedGrowthPct: number;
  manifestGrowthPct: number;

  totalReturGrowthPct: number;
  pengarsipGrowthPct: number;
  logistikGrowthPct: number;
  pusatGrowthPct: number;
}

export interface UseResearcherStatisticsProps {
  bundlesList: any[];
  submittedList: any[];
}

export function useResearcherStatistics({ bundlesList, submittedList }: UseResearcherStatisticsProps): ResearcherStatisticMetrics {
  return useMemo(() => {
    const totalBundles = bundlesList.length;

    const bundleStatusCounts: BundleStatusCounts = {
      DRAFT: 0,
      LOCKED: 0,
      IN_MANIFEST: 0,
    };

    const BUCKET_COUNT = 4; // 4 weeks in a month
    const totalBundlesBuckets = new Array(BUCKET_COUNT).fill(0);
    const draftBuckets = new Array(BUCKET_COUNT).fill(0);
    const lockedBuckets = new Array(BUCKET_COUNT).fill(0);
    const manifestBuckets = new Array(BUCKET_COUNT).fill(0);

    let thisWeekBundles = 0;
    let lastWeekBundles = 0;
    let thisWeekDraft = 0;
    let lastWeekDraft = 0;
    let thisWeekLocked = 0;
    let lastWeekLocked = 0;
    let thisWeekManifest = 0;
    let lastWeekManifest = 0;

    const now = Date.now();
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;

    bundlesList.forEach((bundle, idx) => {
      const status = bundle.status || 'DRAFT';
      if (bundleStatusCounts[status] !== undefined) {
        bundleStatusCounts[status]++;
      } else {
        bundleStatusCounts[status] = 1;
      }

      const isDraft = status === 'DRAFT';
      const isLocked = status === 'LOCKED';
      const isManifest = status === 'IN_MANIFEST';

      const dateStr = bundle.createdAt || bundle.updatedAt;
      if (dateStr) {
        const itemTime = new Date(dateStr).getTime();
        if (!isNaN(itemTime)) {
          const diffMs = Math.max(0, now - itemTime);
          const daysAgo = Math.floor(diffMs / ONE_DAY_MS);

          if (daysAgo >= 0 && daysAgo < 28) {
            const weekOffset = Math.floor(daysAgo / 7);
            const bucketIdx = (BUCKET_COUNT - 1) - weekOffset;
            totalBundlesBuckets[bucketIdx]++;
            if (isDraft) draftBuckets[bucketIdx]++;
            else if (isLocked) lockedBuckets[bucketIdx]++;
            else if (isManifest) manifestBuckets[bucketIdx]++;
          }

          if (daysAgo >= 0 && daysAgo < 7) {
            thisWeekBundles++;
            if (isDraft) thisWeekDraft++;
            else if (isLocked) thisWeekLocked++;
            else if (isManifest) thisWeekManifest++;
          } else if (daysAgo >= 7 && daysAgo < 14) {
            lastWeekBundles++;
            if (isDraft) lastWeekDraft++;
            else if (isLocked) lastWeekLocked++;
            else if (isManifest) lastWeekManifest++;
          }
        }
      } else {
        const bucketIdx = Math.floor((idx / Math.max(1, totalBundles)) * BUCKET_COUNT);
        totalBundlesBuckets[bucketIdx]++;
        if (isDraft) draftBuckets[bucketIdx]++;
        else if (isLocked) lockedBuckets[bucketIdx]++;
        else if (isManifest) manifestBuckets[bucketIdx]++;
      }
    });

    // Revision retur counters
    let returnedFromPengarsipCount = 0;
    let returnedFromPengirimLogistikCount = 0;
    let returnedFromPengirimPusatCount = 0;
    let totalReturCount = 0;

    const totalReturBuckets = new Array(BUCKET_COUNT).fill(0);
    const pengarsipBuckets = new Array(BUCKET_COUNT).fill(0);
    const logistikBuckets = new Array(BUCKET_COUNT).fill(0);
    const pusatBuckets = new Array(BUCKET_COUNT).fill(0);

    let thisWeekRetur = 0;
    let lastWeekRetur = 0;
    let thisWeekPengarsip = 0;
    let lastWeekPengarsip = 0;
    let thisWeekLogistik = 0;
    let lastWeekLogistik = 0;
    let thisWeekPusat = 0;
    let lastWeekPusat = 0;

    submittedList.forEach((item, idx) => {
      if (item.status === 'REVISION') {
        totalReturCount++;
        const source = item.revisionSource || item.lastReturnOrigin || 'PENGARSIP';
        const isPengarsip = source === 'PENGARSIP';
        const isLogistik = source === 'PENGIRIM_LOGISTIK';
        const isPusat = source === 'PENGIRIM_PUSAT';

        if (isPengarsip) returnedFromPengarsipCount++;
        else if (isLogistik) returnedFromPengirimLogistikCount++;
        else if (isPusat) returnedFromPengirimPusatCount++;

        const dateStr = item.serviceNumberDate || item.createdAt || item.updatedAt;
        if (dateStr) {
          const itemTime = new Date(dateStr).getTime();
          if (!isNaN(itemTime)) {
            const diffMs = Math.max(0, now - itemTime);
            const daysAgo = Math.floor(diffMs / ONE_DAY_MS);

            if (daysAgo >= 0 && daysAgo < 28) {
              const weekOffset = Math.floor(daysAgo / 7);
              const bucketIdx = (BUCKET_COUNT - 1) - weekOffset;
              totalReturBuckets[bucketIdx]++;
              if (isPengarsip) pengarsipBuckets[bucketIdx]++;
              else if (isLogistik) logistikBuckets[bucketIdx]++;
              else if (isPusat) pusatBuckets[bucketIdx]++;
            }

            if (daysAgo >= 0 && daysAgo < 7) {
              thisWeekRetur++;
              if (isPengarsip) thisWeekPengarsip++;
              else if (isLogistik) thisWeekLogistik++;
              else if (isPusat) thisWeekPusat++;
            } else if (daysAgo >= 7 && daysAgo < 14) {
              lastWeekRetur++;
              if (isPengarsip) lastWeekPengarsip++;
              else if (isLogistik) lastWeekLogistik++;
              else if (isPusat) lastWeekPusat++;
            }
          }
        } else {
          const bucketIdx = Math.floor((idx / Math.max(1, submittedList.length)) * BUCKET_COUNT);
          totalReturBuckets[bucketIdx]++;
          if (isPengarsip) pengarsipBuckets[bucketIdx]++;
          else if (isLogistik) logistikBuckets[bucketIdx]++;
          else if (isPusat) pusatBuckets[bucketIdx]++;
        }
      }
    });

    const submittedCount = submittedList.length;
    const processedCount = bundlesList.reduce((acc, b) => acc + (b.applications?.length || 0), 0);

    const cumulateIfNeeded = (buckets: number[], totalCount: number) => {
      const sum = buckets.reduce((a, b) => a + b, 0);
      if (sum === 0 && totalCount > 0) {
        return [1, Math.ceil(totalCount * 0.4), Math.ceil(totalCount * 0.7), totalCount];
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
      totalBundles,
      bundleStatusCounts,
      returnedFromPengarsipCount,
      returnedFromPengirimLogistikCount,
      returnedFromPengirimPusatCount,
      totalReturCount,
      submittedCount,
      processedCount,

      totalBundlesTrend: cumulateIfNeeded(totalBundlesBuckets, totalBundles),
      draftTrend: cumulateIfNeeded(draftBuckets, bundleStatusCounts.DRAFT || 0),
      lockedTrend: cumulateIfNeeded(lockedBuckets, bundleStatusCounts.LOCKED || 0),
      manifestTrend: cumulateIfNeeded(manifestBuckets, bundleStatusCounts.IN_MANIFEST || 0),

      totalReturTrend: cumulateIfNeeded(totalReturBuckets, totalReturCount),
      pengarsipTrend: cumulateIfNeeded(pengarsipBuckets, returnedFromPengarsipCount),
      logistikTrend: cumulateIfNeeded(logistikBuckets, returnedFromPengirimLogistikCount),
      pusatTrend: cumulateIfNeeded(pusatBuckets, returnedFromPengirimPusatCount),

      totalBundlesGrowthPct: calcWoWGrowth(thisWeekBundles, lastWeekBundles),
      draftGrowthPct: calcWoWGrowth(thisWeekDraft, lastWeekDraft),
      lockedGrowthPct: calcWoWGrowth(thisWeekLocked, lastWeekLocked),
      manifestGrowthPct: calcWoWGrowth(thisWeekManifest, lastWeekManifest),

      totalReturGrowthPct: calcWoWGrowth(thisWeekRetur, lastWeekRetur),
      pengarsipGrowthPct: calcWoWGrowth(thisWeekPengarsip, lastWeekPengarsip),
      logistikGrowthPct: calcWoWGrowth(thisWeekLogistik, lastWeekLogistik),
      pusatGrowthPct: calcWoWGrowth(thisWeekPusat, lastWeekPusat),
    };
  }, [bundlesList, submittedList]);
}
