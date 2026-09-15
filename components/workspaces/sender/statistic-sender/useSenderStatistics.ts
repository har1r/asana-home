import { useMemo } from "react";

export interface ManifestStatusCounts {
  ALL?: number;
  DRAFT: number;
  LOCKED: number;
  SENT: number;
  [key: string]: number | undefined;
}

export interface SenderStatisticMetrics {
  totalManifests: number;
  manifestStatusCounts: ManifestStatusCounts;

  // Sparkline 4-week trends
  totalTrend: number[];
  draftTrend: number[];
  lockedTrend: number[];
  sentTrend: number[];

  // Week-over-Week Growth %
  totalGrowthPct: number;
  draftGrowthPct: number;
  lockedGrowthPct: number;
  sentGrowthPct: number;
}

export interface UseSenderStatisticsProps {
  manifestsList: any[];
}

export function useSenderStatistics({ manifestsList }: UseSenderStatisticsProps): SenderStatisticMetrics {
  return useMemo(() => {
    const totalManifests = manifestsList.length;

    const manifestStatusCounts: ManifestStatusCounts = {
      DRAFT: 0,
      LOCKED: 0,
      SENT: 0,
    };

    const BUCKET_COUNT = 4; // 4 weeks in a month (M4 Lalu, M3 Lalu, M Lalu, M Ini)
    const totalBuckets = new Array(BUCKET_COUNT).fill(0);
    const draftBuckets = new Array(BUCKET_COUNT).fill(0);
    const lockedBuckets = new Array(BUCKET_COUNT).fill(0);
    const sentBuckets = new Array(BUCKET_COUNT).fill(0);

    let thisWeekTotal = 0;
    let lastWeekTotal = 0;
    let thisWeekDraft = 0;
    let lastWeekDraft = 0;
    let thisWeekLocked = 0;
    let lastWeekLocked = 0;
    let thisWeekSent = 0;
    let lastWeekSent = 0;

    const now = Date.now();
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;

    manifestsList.forEach((m, idx) => {
      const status = m.status || "DRAFT";
      if (manifestStatusCounts[status] !== undefined) {
        manifestStatusCounts[status]!++;
      } else {
        manifestStatusCounts[status] = 1;
      }

      const isDraft = status === "DRAFT";
      const isLocked = status === "LOCKED";
      const isSent = status === "SENT";

      const dateStr = m.createdAt || m.updatedAt;
      if (dateStr) {
        const itemTime = new Date(dateStr).getTime();
        if (!isNaN(itemTime)) {
          const diffMs = Math.max(0, now - itemTime);
          const daysAgo = Math.floor(diffMs / ONE_DAY_MS);

          if (daysAgo >= 0 && daysAgo < 28) {
            const weekOffset = Math.floor(daysAgo / 7);
            const bucketIdx = BUCKET_COUNT - 1 - weekOffset;
            totalBuckets[bucketIdx]++;
            if (isDraft) draftBuckets[bucketIdx]++;
            else if (isLocked) lockedBuckets[bucketIdx]++;
            else if (isSent) sentBuckets[bucketIdx]++;
          }

          if (daysAgo >= 0 && daysAgo < 7) {
            thisWeekTotal++;
            if (isDraft) thisWeekDraft++;
            else if (isLocked) thisWeekLocked++;
            else if (isSent) thisWeekSent++;
          } else if (daysAgo >= 7 && daysAgo < 14) {
            lastWeekTotal++;
            if (isDraft) lastWeekDraft++;
            else if (isLocked) lastWeekLocked++;
            else if (isSent) lastWeekSent++;
          }
        }
      } else {
        const bucketIdx = Math.floor((idx / Math.max(1, totalManifests)) * BUCKET_COUNT);
        totalBuckets[bucketIdx]++;
        if (isDraft) draftBuckets[bucketIdx]++;
        else if (isLocked) lockedBuckets[bucketIdx]++;
        else if (isSent) sentBuckets[bucketIdx]++;
      }
    });

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
      totalManifests,
      manifestStatusCounts,

      totalTrend: cumulateIfNeeded(totalBuckets, totalManifests),
      draftTrend: cumulateIfNeeded(draftBuckets, manifestStatusCounts.DRAFT || 0),
      lockedTrend: cumulateIfNeeded(lockedBuckets, manifestStatusCounts.LOCKED || 0),
      sentTrend: cumulateIfNeeded(sentBuckets, manifestStatusCounts.SENT || 0),

      totalGrowthPct: calcWoWGrowth(thisWeekTotal, lastWeekTotal),
      draftGrowthPct: calcWoWGrowth(thisWeekDraft, lastWeekDraft),
      lockedGrowthPct: calcWoWGrowth(thisWeekLocked, lastWeekLocked),
      sentGrowthPct: calcWoWGrowth(thisWeekSent, lastWeekSent),
    };
  }, [manifestsList]);
}
