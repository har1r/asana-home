"use client";

import { useState, useMemo, useCallback } from "react";
import { addBundleToManifest } from "@/app/actions/sender";

export function useSenderBundle(
  showActionStatus?: (status: 'loading' | 'success' | 'error', title: string, message: string) => void,
  onRefreshWorkspace?: () => void
) {
  const [eligibleBundlesList, setEligibleBundlesList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchQuery, setActiveSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  const handleSearchSubmit = useCallback(() => {
    setActiveSearchQuery(searchQuery);
    setCurrentPage(1);
  }, [searchQuery]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setActiveSearchQuery("");
    setCurrentPage(1);
  }, []);

  const filteredBundles = useMemo(() => {
    if (!activeSearchQuery || !activeSearchQuery.trim()) return eligibleBundlesList;
    const q = activeSearchQuery.toLowerCase().trim();
    return eligibleBundlesList.filter((b) => {
      const bNo = (b.bundleNumber || b.nomorBundle || "").toLowerCase();
      return bNo.includes(q);
    });
  }, [eligibleBundlesList, activeSearchQuery]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredBundles.length / itemsPerPage) || 1;
  }, [filteredBundles.length, itemsPerPage]);

  const paginatedBundles = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBundles.slice(start, start + itemsPerPage);
  }, [filteredBundles, currentPage, itemsPerPage]);

  const handleAddBundle = async (
    bundleId: string,
    currentManifest: any,
    setManifestsList: React.Dispatch<React.SetStateAction<any[]>>,
    setSelectedManifest: (m: any) => void
  ) => {
    if (!currentManifest) {
      if (showActionStatus) {
        showActionStatus(
          "error",
          "Pilih Manifest Terlebih Dahulu",
          "Silakan pilih atau buat draf manifest di tab Daftar Manifest terlebih dahulu sebelum memasukkan bundle ini."
        );
      }
      return;
    }

    const targetBundle = eligibleBundlesList.find((b) => b.id === bundleId);
    if (!targetBundle) return;

    // Optimistic UI update
    setEligibleBundlesList((prev) => prev.filter((b) => b.id !== bundleId));

    const currentBundles = currentManifest.bundles || currentManifest.bundle || [];
    const updatedBundles = [...currentBundles, targetBundle];
    const updatedSelectedManifest = { ...currentManifest, bundles: updatedBundles, bundle: updatedBundles };
    setSelectedManifest(updatedSelectedManifest);

    setManifestsList((prev) =>
      prev.map((m) => (m.id === currentManifest.id ? updatedSelectedManifest : m))
    );

    if (showActionStatus) {
      showActionStatus("loading", "Menambahkan Bundle", "Sedang memasukkan map bundle ke dalam manifest...");
    }

    setLoading(true);
    try {
      const res: any = await addBundleToManifest(currentManifest.id, bundleId);
      if (res.success) {
        if (showActionStatus) showActionStatus("success", "Bundle Berhasil Ditambahkan", "Map bundle berhasil dimasukkan ke dalam manifest pengiriman.");
        if (onRefreshWorkspace) onRefreshWorkspace();
      } else {
        if (showActionStatus) showActionStatus("error", "Gagal Menambahkan Bundle", res.error || "Gagal menambahkan bundle.");
        if (onRefreshWorkspace) onRefreshWorkspace();
      }
    } catch (err: any) {
      if (showActionStatus) showActionStatus("error", "Gagal Menambahkan Bundle", err.message || "Sistem error saat menambahkan bundle.");
      if (onRefreshWorkspace) onRefreshWorkspace();
    } finally {
      setLoading(false);
    }
  };

  return {
    eligibleBundlesList,
    setEligibleBundlesList,
    searchQuery,
    setSearchQuery,
    activeSearchQuery,
    handleSearchSubmit,
    handleClearSearch,
    filteredBundles,
    paginatedBundles,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    loading,
    setLoading,
    handleAddBundle,
  };
}
