"use client";

import { useMemo } from "react";

export interface ManifestStatusCounts {
  ALL?: number;
  DRAFT: number;
  LOCKED: number;
  SENT: number;
  [key: string]: number | undefined;
}

export interface SenderKPIStatsMetrics {
  totalManifests: number;
  manifestStatusCounts: ManifestStatusCounts;
  eligibleBundles: number;

  totalTrend: number[];
  draftTrend: number[];
  lockedTrend: number[];
  sentTrend: number[];

  totalGrowthPct: number;
  draftGrowthPct: number;
  lockedGrowthPct: number;
  sentGrowthPct: number;
}

export interface UseSenderKPIStatsProps {
  senderKPIStats?: {
    totalAllManifest?: number;
    totalDraftManifest?: number;
    totalLockedManifest?: number;
    totalSentManifest?: number;
    eligibleBundles?: number;
    totalTrend?: number[];
    draftTrend?: number[];
    lockedTrend?: number[];
    sentTrend?: number[];
    totalGrowthPct?: number;
    draftGrowthPct?: number;
    lockedGrowthPct?: number;
    sentGrowthPct?: number;
  } | null;
}

export function useSenderKPIStats({ senderKPIStats }: UseSenderKPIStatsProps): SenderKPIStatsMetrics {
  return useMemo(() => {
    return {
      totalManifests: senderKPIStats?.totalAllManifest ?? 0,
      manifestStatusCounts: {
        DRAFT: senderKPIStats?.totalDraftManifest ?? 0,
        LOCKED: senderKPIStats?.totalLockedManifest ?? 0,
        SENT: senderKPIStats?.totalSentManifest ?? 0,
      },
      eligibleBundles: senderKPIStats?.eligibleBundles ?? 0,

      totalTrend: senderKPIStats?.totalTrend ?? [0, 0, 0, 0],
      draftTrend: senderKPIStats?.draftTrend ?? [0, 0, 0, 0],
      lockedTrend: senderKPIStats?.lockedTrend ?? [0, 0, 0, 0],
      sentTrend: senderKPIStats?.sentTrend ?? [0, 0, 0, 0],

      totalGrowthPct: senderKPIStats?.totalGrowthPct ?? 0,
      draftGrowthPct: senderKPIStats?.draftGrowthPct ?? 0,
      lockedGrowthPct: senderKPIStats?.lockedGrowthPct ?? 0,
      sentGrowthPct: senderKPIStats?.sentGrowthPct ?? 0,
    };
  }, [senderKPIStats]);
}
