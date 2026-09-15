"use client";

import { useState, useMemo, useEffect, useRef, useCallback, useDeferredValue } from "react";
import { ManifestStatusCounts } from "../statistic-sender/useSenderStatistics";

export function useSenderManifest(
  manifestsList: any[],
  onSelectManifest: (manifest: any) => void,
  onCreateManifest: () => Promise<void>
) {
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [filterManifestStatus, setFilterManifestStatus] = useState<string>("ALL");

  // Page-based Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const searchManifestInputRef = useRef<HTMLInputElement | null>(null);

  // Keyboard shortcut: Ctrl+K or '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      const isTyping = tag === "input" || tag === "textarea" || tag === "select" || (e.target as HTMLElement).isContentEditable;
      if ((e.ctrlKey && e.key === "k") || (e.key === "/" && !isTyping)) {
        e.preventDefault();
        searchManifestInputRef.current?.focus();
        searchManifestInputRef.current?.select();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Reset currentPage to 1 whenever search query or status filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterManifestStatus]);

  // Computed manifest status counts for KPI Strip
  const manifestStatusCounts = useMemo<ManifestStatusCounts>(() => {
    const counts: ManifestStatusCounts = { ALL: manifestsList.length, DRAFT: 0, LOCKED: 0, SENT: 0 };
    manifestsList.forEach((m) => {
      if (m.status) {
        counts[m.status] = (counts[m.status] || 0) + 1;
      }
    });
    return counts;
  }, [manifestsList]);

  // Filtered manifests list
  const filteredManifests = useMemo(() => {
    return manifestsList.filter((m) => {
      const manifestNo = m.nomorManifest || m.manifestNumber || "";
      const matchesSearch =
        manifestNo.toLowerCase().includes(deferredSearchQuery.toLowerCase()) ||
        (m.pengirim?.name || m.user?.name || "").toLowerCase().includes(deferredSearchQuery.toLowerCase());
      const matchesStatus =
        filterManifestStatus === "ALL"
          ? m.status === "DRAFT"
          : m.status === filterManifestStatus;
      return matchesSearch && matchesStatus;
    });
  }, [manifestsList, deferredSearchQuery, filterManifestStatus]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredManifests.length / itemsPerPage) || 1;
  }, [filteredManifests.length, itemsPerPage]);

  const paginatedManifests = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredManifests.slice(start, start + itemsPerPage);
  }, [filteredManifests, currentPage, itemsPerPage]);

  return {
    searchQuery,
    setSearchQuery,
    isSearchFocused,
    setIsSearchFocused,
    filterManifestStatus,
    setFilterManifestStatus,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    paginatedManifests,
    manifestStatusCounts,
    filteredManifests,
    searchManifestInputRef,
  };
}
