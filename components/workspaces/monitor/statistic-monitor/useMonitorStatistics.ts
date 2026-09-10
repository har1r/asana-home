import { useMemo } from "react";

export interface PemohonKpiCounts {
  total: number;
  completed: number;
  pending: number;
  percentage: number;
}

export function useMonitorStatistics(permohonanList: any[]) {
  const pemohonKpiCounts = useMemo<PemohonKpiCounts>(() => {
    let totalPemohon = 0;
    let completedPemohon = 0;

    permohonanList.forEach((p) => {
      if (p.jenisPermohonan === "MUTASI_SEBAGIAN" && p.dataBaru && p.dataBaru.length > 0) {
        totalPemohon += p.dataBaru.length;
        if (p.status === "COMPLETED") {
          completedPemohon += p.dataBaru.length;
        } else {
          p.dataBaru.forEach((db: any) => {
            if (db.isVerified) completedPemohon++;
          });
        }
      } else {
        totalPemohon += 1;
        if (p.status === "COMPLETED") {
          completedPemohon += 1;
        }
      }
    });

    const effectiveTotal = Math.max(totalPemohon, permohonanList.length);
    const pendingPemohon = Math.max(0, effectiveTotal - completedPemohon);
    const pctCompleted = effectiveTotal > 0 ? Math.round((completedPemohon / effectiveTotal) * 100) : 0;

    return {
      total: effectiveTotal,
      completed: completedPemohon,
      pending: pendingPemohon,
      percentage: pctCompleted,
    };
  }, [permohonanList]);

  return {
    pemohonKpiCounts,
  };
}
