"use client";

import { useState, useMemo, useEffect, useRef, useCallback, useDeferredValue } from "react";

export function useMonitorBundle(
  permohonanList: any[],
  selectedBundle: any | null,
  onSelectBundle: (bundle: any) => void
) {
  const [searchBundleQuery, setSearchBundleQuery] = useState("");
  const deferredSearchBundleQuery = useDeferredValue(searchBundleQuery);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [filterJenisLayanan, setFilterJenisLayanan] = useState<string>("ALL");

  // Load More state (default 8 items per batch)
  const [visibleCount, setVisibleCount] = useState(8);
  const searchBundleInputRef = useRef<HTMLInputElement | null>(null);

  // Keyboard shortcut: Ctrl+K or '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      const isTyping = tag === "input" || tag === "textarea" || tag === "select" || (e.target as HTMLElement).isContentEditable;
      if ((e.ctrlKey && e.key === "k") || (e.key === "/" && !isTyping)) {
        e.preventDefault();
        searchBundleInputRef.current?.focus();
        searchBundleInputRef.current?.select();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Reset visibleCount whenever search or filter changes
  useEffect(() => {
    setVisibleCount(8);
  }, [searchBundleQuery, filterJenisLayanan]);

  // Unique Bundles list dynamically derived from permohonanList
  const uniqueBundlesList = useMemo(() => {
    const map = new Map();
    permohonanList.forEach((p) => {
      const b = p.bundle;
      if (b && !map.has(b.id)) {
        map.set(b.id, {
          ...b,
          permohonan: [p],
        });
      } else if (b) {
        map.get(b.id).permohonan.push(p);
      }
    });
    return Array.from(map.values());
  }, [permohonanList]);

  // Counts for Pemantau Bundle Jenis Layanan Quick Filter Chips
  const bundleJenisCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: uniqueBundlesList.length,
      MUTASI_SEBAGIAN: 0,
      MUTASI_HABIS_UPDATE: 0,
      MUTASI_HABIS_REGULER: 0,
      OBJEK_PAJAK_BARU: 0,
      PEMBETULAN: 0,
      PENGAKTIFAN: 0,
    };
    uniqueBundlesList.forEach((b) => {
      if (b.jenisPermohonan && counts[b.jenisPermohonan] !== undefined) {
        counts[b.jenisPermohonan]++;
      }
    });
    return counts;
  }, [uniqueBundlesList]);

  // Filtered bundles list
  const filteredBundlesList = useMemo(() => {
    return uniqueBundlesList.filter((b) => {
      const matchesSearch = b.nomorBundle.toLowerCase().includes(deferredSearchBundleQuery.toLowerCase());
      const matchesJenis = filterJenisLayanan === "ALL" || b.jenisPermohonan === filterJenisLayanan;
      return matchesSearch && matchesJenis;
    });
  }, [uniqueBundlesList, deferredSearchBundleQuery, filterJenisLayanan]);

  const hasMore = visibleCount < filteredBundlesList.length;

  const visibleBundles = useMemo(() => {
    return filteredBundlesList.slice(0, visibleCount);
  }, [filteredBundlesList, visibleCount]);

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + 8, filteredBundlesList.length));
  }, [filteredBundlesList.length]);

  return {
    searchBundleQuery,
    setSearchBundleQuery,
    isSearchFocused,
    setIsSearchFocused,
    filterJenisLayanan,
    setFilterJenisLayanan,
    bundleJenisCounts,
    uniqueBundlesList,
    filteredBundlesList,
    visibleBundles,
    hasMore,
    loadMore,
    searchBundleInputRef,
  };
}
