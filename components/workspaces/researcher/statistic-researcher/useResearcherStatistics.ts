import { useMemo } from 'react';

export interface BundleStatusCounts {
  DRAFT: number;
  LOCKED: number;
  IN_MANIFEST: number;
  [key: string]: number;
}

export interface UseResearcherStatisticsProps {
  bundlesList: any[];
  submittedList: any[];
}

export function useResearcherStatistics({ bundlesList, submittedList }: UseResearcherStatisticsProps) {
  return useMemo(() => {
    const totalBundles = bundlesList.length;

    const bundleStatusCounts: BundleStatusCounts = {
      DRAFT: 0,
      LOCKED: 0,
      IN_MANIFEST: 0,
    };

    bundlesList.forEach((bundle) => {
      const status = bundle.status || 'DRAFT';
      if (bundleStatusCounts[status] !== undefined) {
        bundleStatusCounts[status]++;
      } else {
        bundleStatusCounts[status] = 1;
      }
    });

    // Revision retur counters
    let returnedFromPengarsipCount = 0;
    let returnedFromPengirimLogistikCount = 0;
    let returnedFromPengirimPusatCount = 0;

    submittedList.forEach((item) => {
      if (item.status === 'REVISION') {
        const source = item.revisionSource || item.lastReturnOrigin || 'PENGARSIP';
        if (source === 'PENGARSIP') returnedFromPengarsipCount++;
        else if (source === 'PENGIRIM_LOGISTIK') returnedFromPengirimLogistikCount++;
        else if (source === 'PENGIRIM_PUSAT') returnedFromPengirimPusatCount++;
      }
    });

    const submittedCount = submittedList.length;
    const processedCount = bundlesList.reduce((acc, b) => acc + (b.applications?.length || 0), 0);

    return {
      totalBundles,
      bundleStatusCounts,
      returnedFromPengarsipCount,
      returnedFromPengirimLogistikCount,
      returnedFromPengirimPusatCount,
      submittedCount,
      processedCount,
    };
  }, [bundlesList, submittedList]);
}
