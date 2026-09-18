"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";

export function useSenderInstalledBundleHistory(initialBundles: any[] = []) {
  const [bundlesList, setBundlesList] = useState<any[]>(initialBundles || []);
  const [selectedBundle, setSelectedBundle] = useState<any | null>(null);

  // Create a stable primitive key based on bundle IDs to prevent infinite re-render loops
  const bundleIdsKey = useMemo(() => {
    return (initialBundles || []).map((b: any) => b.id || b.bundleNumber || "").join(",");
  }, [initialBundles]);

  // Sync initial bundles when bundle list contents actually change
  useEffect(() => {
    const list = initialBundles || [];
    setBundlesList(list);
    if (list.length > 0) {
      setSelectedBundle((prev: any) => {
        if (!prev) return list[0];
        const exists = list.find((b: any) => b.id === prev.id);
        return exists || list[0];
      });
    } else {
      setSelectedBundle(null);
    }
  }, [bundleIdsKey]);

  // Search & Pagination state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchQuery, setActiveSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  const searchInputRef = useRef<HTMLInputElement | null>(null);

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
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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

  const handleSelectBundle = useCallback((bundle: any) => {
    setSelectedBundle(bundle);
  }, []);

  const filteredBundles = useMemo(() => {
    if (!activeSearchQuery.trim()) return bundlesList;
    const q = activeSearchQuery.toLowerCase().trim();
    return bundlesList.filter((b: any) => {
      const bundleNo = (b.bundleNumber || b.nomorBundle || "").toLowerCase();
      const jenis = (b.applicationType || b.jenisPermohonan || "").toLowerCase();
      const creator = (
        b.createdBy?.name ||
        b.createdByUser?.name ||
        b.peneliti?.name ||
        b.user?.name ||
        ""
      ).toLowerCase();
      return bundleNo.includes(q) || jenis.includes(q) || creator.includes(q);
    });
  }, [bundlesList, activeSearchQuery]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredBundles.length / itemsPerPage) || 1;
  }, [filteredBundles.length, itemsPerPage]);

  const paginatedBundles = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBundles.slice(start, start + itemsPerPage);
  }, [filteredBundles, currentPage, itemsPerPage]);

  return {
    bundlesList,
    setBundlesList,
    selectedBundle,
    setSelectedBundle,
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
    filteredBundles,
    paginatedBundles,
    searchInputRef,
    handleSelectBundle,
  };
}
