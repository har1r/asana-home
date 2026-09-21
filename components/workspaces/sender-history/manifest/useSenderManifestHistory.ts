"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { getManifests, getManifestDetails } from "@/app/actions/sender";

export function useSenderManifestHistory(onSelectManifestCallback?: (manifest: any) => void) {
  const [manifestsList, setManifestsList] = useState<any[]>([]);
  const [selectedManifest, setSelectedManifest] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGridLoading, setIsGridLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  // Search & Pagination state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchQuery, setActiveSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  const searchManifestInputRef = useRef<HTMLInputElement | null>(null);

  // Keyboard shortcut: Ctrl+K or '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName?.toLowerCase();
      const isTyping =
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        (e.target as HTMLElement).isContentEditable;
      if (
        ((e.ctrlKey || e.metaKey) && (e.key?.toLowerCase() === "k" || e.code === "KeyK")) ||
        (e.key === "/" && !isTyping)
      ) {
        e.preventDefault();
        searchManifestInputRef.current?.focus();
        searchManifestInputRef.current?.select();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const fetchHistory = useCallback(async (isSilent = false) => {
    const startTime = performance.now();
    if (!isSilent) setLoading(true);
    else setIsRefreshing(true);
    setError("");

    try {
      const res = await getManifests({ status: "ALL", limit: 100 });
      const duration = (performance.now() - startTime).toFixed(2);
      if (res.success && Array.isArray(res.list)) {
        const historyList = res.list.filter(
          (m: any) => m.status === "LOCKED" || m.status === "SENT"
        );
        setManifestsList(historyList);
        console.log(
          `%c[DATA LOAD] %cSender History loaded: %c${historyList.length} items %cin %c${duration}ms`,
          'color: #00a389; font-weight: bold;',
          'color: #64748b;',
          'color: #10b981; font-weight: bold;',
          'color: #64748b;',
          'color: #f59e0b; font-weight: bold;'
        );

        if (typeof window !== "undefined") {
          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.get("view")) {
            const cleanUrl = new URL(window.location.href);
            cleanUrl.searchParams.delete("view");
            window.history.replaceState(null, "", cleanUrl.toString());
          }
          const manifestParam = urlParams.get("manifest");
          if (manifestParam) {
            const matched = historyList.find(
              (m: any) =>
                m.manifestNumber === manifestParam ||
                m.id === manifestParam
            );
            if (matched) {
              setSelectedManifest(matched);
              getManifestDetails(matched.id).then((detailRes) => {
                if (detailRes.success && "manifest" in detailRes && detailRes.manifest) {
                  setSelectedManifest(detailRes.manifest);
                }
              });
            }
          }
        }
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

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (!value.trim()) {
      setActiveSearchQuery("");
      setCurrentPage(1);
    }
  };

  const handleSearchSubmit = () => {
    setActiveSearchQuery(searchQuery);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setActiveSearchQuery("");
    setCurrentPage(1);
  };

  const handleSelectManifest = useCallback(
    (manifest: any) => {
      setSelectedManifest(manifest);
      if (onSelectManifestCallback) {
        onSelectManifestCallback(manifest);
      }

      // Update Query Param URL (?manifest=MNF-xxx)
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.delete("view");
        if (manifest) {
          const rawNo = manifest.manifestNumber || manifest.id;
          url.searchParams.set("manifest", rawNo);
        } else {
          url.searchParams.delete("manifest");
          url.searchParams.delete("bundle");
        }
        window.history.replaceState(null, "", url.toString());
      }

      if (manifest?.id) {
        getManifestDetails(manifest.id)
          .then((res) => {
            if (res.success && "manifest" in res && res.manifest) {
              setSelectedManifest(res.manifest);
            }
          })
          .catch(() => { });
      }
    },
    [onSelectManifestCallback]
  );

  const filteredManifests = useMemo(() => {
    if (!activeSearchQuery.trim()) return manifestsList;
    const q = activeSearchQuery.toLowerCase().trim();
    return manifestsList.filter((m: any) => {
      const rawNum = (m.manifestNumber || m.nomorManifest || "").toLowerCase();
      const status = (m.status || "").toLowerCase();
      const pengirim = (
        m.createdBy?.name ||
        m.user?.name ||
        m.pengirim?.name ||
        ""
      ).toLowerCase();
      return rawNum.includes(q) || status.includes(q) || pengirim.includes(q);
    });
  }, [manifestsList, activeSearchQuery]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredManifests.length / itemsPerPage) || 1;
  }, [filteredManifests.length, itemsPerPage]);

  const paginatedManifests = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredManifests.slice(start, start + itemsPerPage);
  }, [filteredManifests, currentPage, itemsPerPage]);

  return {
    manifestsList,
    setManifestsList,
    selectedManifest,
    setSelectedManifest,
    loading,
    isGridLoading,
    isRefreshing,
    error,
    searchQuery,
    setSearchQuery: handleSearchChange,
    activeSearchQuery,
    handleSearchSubmit,
    handleClearSearch,
    isSearchFocused,
    setIsSearchFocused,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    filteredManifests,
    paginatedManifests,
    searchManifestInputRef,
    handleSelectManifest,
    refreshData: () => fetchHistory(true),
  };
}
