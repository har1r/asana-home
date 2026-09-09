"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { getHistoryApplications } from "@/app/actions/data-entry";

export type ViewMode = "list" | "grid";
export type DisplayMode = "permohonan" | "pemohon";
export type HistoryStatusFilter = "ALL" | "BUNDLED" | "LOCKED" | "IN_MANIFEST" | "COMPLETED";

export interface FormattedHistoryItem {
  id: string;
  uniqueRowKey: string;
  applicationNumber: string;
  serviceNumberDate: string;
  completionDate?: string;
  createdAt: string;
  ownerName: string;
  nop: string;
  status: string;
  applicationType: string;
  bundleNumber?: string;
  isPecahanRow?: boolean;
  pecahanInfo?: string;
  original: any;
}

export function useDataEntryHistory() {
  const [rawApplications, setRawApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<HistoryStatusFilter>("ALL");
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  // Display Mode State: 'permohonan' (Berkas Induk) vs 'pemohon' (Rincian per Pemohon/Pecahan)
  const [displayMode, setDisplayMode] = useState<DisplayMode>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("architax_history_display_mode");
      if (saved === "permohonan" || saved === "pemohon") return saved;
    }
    return "permohonan";
  });

  const handleSwitchDisplayMode = useCallback((mode: DisplayMode) => {
    setDisplayMode(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem("architax_history_display_mode", mode);
    }
  }, []);

  const [visibleCount, setVisibleCount] = useState(10);
  const [selectedDetailsItem, setSelectedDetailsItem] = useState<any | null>(null);

  // Fetch History Applications
  const fetchHistory = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setIsRefreshing(true);
    setError("");

    try {
      const res = await getHistoryApplications();
      if (res.success && Array.isArray(res.list)) {
        setRawApplications(res.list);
      } else {
        setError(res.error || "Gagal memuat riwayat pengajuan.");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Mode Base List: transform applications based on displayMode ('permohonan' vs 'pemohon')
  const modeBaseList = useMemo(() => {
    if (displayMode === "permohonan") {
      return rawApplications.map((item) => ({ ...item, uniqueRowKey: item.id }));
    }

    // DisplayMode === 'pemohon': FlatMap per target owner for Mutasi Sebagian
    return rawApplications.flatMap((item) => {
      const appType = item.applicationType || item.jenisPermohonan || "";
      const isPartial = appType === "PARTIAL_MUTATION" || appType === "MUTASI_SEBAGIAN";
      const targets = Array.isArray(item.targetData) && item.targetData.length > 0
        ? item.targetData
        : (Array.isArray(item.dataBaru) ? item.dataBaru : []);

      if (isPartial && targets.length > 0) {
        return targets.map((td: any, idx: number) => ({
          ...item,
          uniqueRowKey: `${item.id}-pecahan-${idx}`,
          displayOwnerName: td.ownerName || td.namaPemilikBaru || item.ownerName,
          isPecahanRow: true,
          pecahanInfo: `(Pecahan ${idx + 1}/${targets.length})`,
        }));
      }

      return [{ ...item, uniqueRowKey: item.id }];
    });
  }, [rawApplications, displayMode]);

  // Format raw/mode-based application data
  const formattedItems = useMemo<FormattedHistoryItem[]>(() => {
    return modeBaseList.map((item: any) => {
      const previousData = Array.isArray(item.previousData) ? item.previousData : [];
      const targetData = Array.isArray(item.targetData) ? item.targetData : [];
      const firstPrev = previousData[0] || {};
      const firstTarget = targetData[0] || {};
      const appType = item.applicationType || item.jenisPermohonan || "";

      const isPartialMutation = appType === "PARTIAL_MUTATION" || appType === "MUTASI_SEBAGIAN";
      const isReactivation = appType === "REACTIVATION" || appType === "PENGAKTIFAN";

      // NOP calculation
      let calculatedNop = item.nop || "";
      if (appType === "NEW_TAX_OBJECT" || appType === "OBJEK_PAJAK_BARU") {
        calculatedNop = firstTarget.nopTemporary || firstTarget.nop || item.nop || "-";
      } else {
        calculatedNop = firstPrev.nop || item.nop || "-";
      }

      // Owner Name calculation
      let calculatedOwnerName = item.displayOwnerName || "";
      if (!calculatedOwnerName) {
        if (isReactivation) {
          calculatedOwnerName = firstPrev.ownerName || firstPrev.namaPemilikLama || "-";
        } else if (isPartialMutation) {
          const firstName = firstTarget.ownerName || firstTarget.namaPemilikBaru || "";
          const totalCount = targetData.length;
          if (firstName && totalCount > 1) {
            calculatedOwnerName = `${firstName} (${totalCount})`;
          } else {
            calculatedOwnerName = firstName || "-";
          }
        } else {
          if (targetData.length > 0) {
            calculatedOwnerName = targetData
              .map((t: any) => t.ownerName || t.namaPemilikBaru)
              .filter(Boolean)
              .join(", ");
          }
          if (!calculatedOwnerName) {
            calculatedOwnerName = firstPrev.ownerName || item.ownerName || "-";
          }
        }
      }

      return {
        id: item.id,
        uniqueRowKey: item.uniqueRowKey || item.id,
        applicationNumber: item.applicationNumber || item.nomorPelayanan || "-",
        serviceNumberDate: item.serviceNumberDate || item.tanggalNoPelayanan || item.createdAt,
        completionDate: item.completionDate || item.tanggalPenyelesaian,
        createdAt: item.createdAt,
        ownerName: calculatedOwnerName || "-",
        nop: calculatedNop || "-",
        status: item.status || "BUNDLED",
        applicationType: appType,
        bundleNumber: item.currentBundle?.bundleNumber || item.bundleNumber || undefined,
        isPecahanRow: item.isPecahanRow,
        pecahanInfo: item.pecahanInfo,
        original: item,
      };
    });
  }, [modeBaseList]);

  // Filtered List
  const filteredApplications = useMemo(() => {
    let list = formattedItems;

    // Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((item) => {
        const appNo = item.applicationNumber.toLowerCase();
        const owner = item.ownerName.toLowerCase();
        const nop = item.nop.toLowerCase();
        return appNo.includes(q) || owner.includes(q) || nop.includes(q);
      });
    }

    return list;
  }, [formattedItems, searchQuery]);

  // Visible Applications for View More
  const visibleApplications = useMemo(() => {
    return filteredApplications.slice(0, visibleCount);
  }, [filteredApplications, visibleCount]);

  const hasMore = visibleCount < filteredApplications.length;

  const handleViewMore = useCallback(() => {
    setVisibleCount((prev) => prev + 10);
  }, []);

  return {
    rawApplications,
    formattedItems,
    filteredApplications,
    visibleApplications,
    hasMore,
    handleViewMore,
    loading,
    isRefreshing,
    error,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    viewMode,
    setViewMode,
    displayMode,
    handleSwitchDisplayMode,
    selectedDetailsItem,
    setSelectedDetailsItem,
    refreshData: () => fetchHistory(true),
  };
}
