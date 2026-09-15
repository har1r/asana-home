"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { getManifests } from "@/app/actions/sender";

export type ViewMode = "list" | "grid";

export interface FormattedManifestItem {
  id: string;
  manifestNumber: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  pengirimName: string;
  bundleCount: number;
  berkasCount: number;
  pemohonCount: number;
  buktiTandaTerima?: string | null;
  original: any;
}

export function useSenderHistory() {
  const [rawManifests, setRawManifests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL"); // ALL, LOCKED, SENT
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [visibleCount, setVisibleCount] = useState(12);

  const fetchHistory = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setIsRefreshing(true);
    setError("");

    try {
      const res = await getManifests({ status: "ALL", limit: 100 });
      if (res.success && Array.isArray(res.list)) {
        // Filter history manifests: LOCKED or SENT
        const historyList = res.list.filter(
          (m: any) => m.status === "LOCKED" || m.status === "SENT"
        );
        setRawManifests(historyList);
      } else {
        setError(res.error || "Gagal memuat riwayat manifest pengiriman.");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan koneksi ke server.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const formattedItems = useMemo<FormattedManifestItem[]>(() => {
    return rawManifests.map((item: any) => {
      const bundles = Array.isArray(item.bundles)
        ? item.bundles
        : Array.isArray(item.bundle)
        ? item.bundle
        : [];
      
      let berkasCount = 0;
      let pemohonCount = 0;

      bundles.forEach((b: any) => {
        const apps = Array.isArray(b.applications)
          ? b.applications
          : Array.isArray(b.permohonan)
          ? b.permohonan
          : [];
        berkasCount += apps.length;
        apps.forEach((app: any) => {
          pemohonCount += app.targetData?.length || app.dataBaru?.length || 1;
        });
      });

      const pengirimName =
        item.createdBy?.name ||
        item.user?.name ||
        item.pengirim?.name ||
        "Pengirim";

      return {
        id: item.id,
        manifestNumber: item.manifestNumber || item.nomorManifest || "—",
        createdAt: item.createdAt,
        updatedAt: item.updatedAt || item.createdAt,
        status: item.status || "LOCKED",
        pengirimName,
        bundleCount: bundles.length,
        berkasCount,
        pemohonCount,
        buktiTandaTerima: item.buktiTandaTerima || null,
        original: item,
      };
    });
  }, [rawManifests]);

  const filteredManifests = useMemo(() => {
    let list = formattedItems;

    if (statusFilter !== "ALL") {
      list = list.filter((item) => item.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((item) => {
        const mNo = item.manifestNumber.toLowerCase();
        const pengirim = item.pengirimName.toLowerCase();
        const status = item.status.toLowerCase();
        return mNo.includes(q) || pengirim.includes(q) || status.includes(q);
      });
    }

    return list;
  }, [formattedItems, statusFilter, searchQuery]);

  const visibleManifests = useMemo(() => {
    return filteredManifests.slice(0, visibleCount);
  }, [filteredManifests, visibleCount]);

  const hasMore = visibleCount < filteredManifests.length;

  const handleViewMore = useCallback(() => {
    setVisibleCount((prev) => prev + 12);
  }, []);

  return {
    rawManifests,
    formattedItems,
    filteredManifests,
    visibleManifests,
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
    refreshData: () => fetchHistory(true),
  };
}
