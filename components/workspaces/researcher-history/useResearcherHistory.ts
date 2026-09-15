"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { getHistoryBundles } from "@/app/actions/researcher";

export type ViewMode = "list" | "grid";

export interface FormattedBundleItem {
  id: string;
  bundleNumber: string;
  createdAt: string;
  creatorName: string;
  status: string;
  applicationType: string;
  totalApplications: number;
  original: any;
}

export function useResearcherHistory() {
  const [rawBundles, setRawBundles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [visibleCount, setVisibleCount] = useState(10);

  const fetchHistory = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setIsRefreshing(true);
    setError("");

    try {
      const res = await getHistoryBundles();
      if (res.success && Array.isArray(res.list)) {
        setRawBundles(res.list);
      } else {
        setError(res.error || "Gagal memuat riwayat bundle.");
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

  const formattedItems = useMemo<FormattedBundleItem[]>(() => {
    return rawBundles.map((item: any) => {
      const apps = Array.isArray(item.applications)
        ? item.applications
        : Array.isArray(item.permohonan)
        ? item.permohonan
        : [];
      const creator = item.createdBy?.name || item.creatorName || "Peneliti";
      const appType =
        item.applicationType ||
        item.jenisPermohonan ||
        apps[0]?.applicationType ||
        apps[0]?.jenisPermohonan ||
        "";

      return {
        id: item.id,
        bundleNumber: item.bundleNumber || item.nomorBundle || "-",
        createdAt: item.createdAt,
        creatorName: creator,
        status: item.status || "DRAFT",
        applicationType: appType,
        totalApplications: apps.length,
        original: item,
      };
    });
  }, [rawBundles]);

  const filteredBundles = useMemo(() => {
    let list = formattedItems;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((item) => {
        const bNo = item.bundleNumber.toLowerCase();
        const creator = item.creatorName.toLowerCase();
        const status = item.status.toLowerCase();
        const appTypeStr = (item.applicationType || "").toLowerCase();
        return bNo.includes(q) || creator.includes(q) || status.includes(q) || appTypeStr.includes(q);
      });
    }
    return list;
  }, [formattedItems, searchQuery]);

  const visibleBundles = useMemo(() => {
    return filteredBundles.slice(0, visibleCount);
  }, [filteredBundles, visibleCount]);

  const hasMore = visibleCount < filteredBundles.length;

  const handleViewMore = useCallback(() => {
    setVisibleCount((prev) => prev + 10);
  }, []);

  return {
    rawBundles,
    formattedItems,
    filteredBundles,
    visibleBundles,
    hasMore,
    handleViewMore,
    loading,
    isRefreshing,
    error,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    refreshData: () => fetchHistory(true),
  };
}
