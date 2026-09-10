"use client";

import { useState, useMemo, useEffect, useRef, useCallback, useDeferredValue } from "react";
import { ManifestStatusCounts } from "../statistic-sender/SenderKPIStrip";

export function useSenderManifest(
  manifestsList: any[],
  onSelectManifest: (manifest: any) => void,
  onCreateManifest: () => Promise<void>
) {
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [filterManifestStatus, setFilterManifestStatus] = useState<string>("ALL");

  // Load More / Infinite Scroll state
  const [visibleCount, setVisibleCount] = useState(8);
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

  // Reset visibleCount whenever search or status filter changes
  useEffect(() => {
    setVisibleCount(8);
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
      const matchesSearch =
        m.nomorManifest.toLowerCase().includes(deferredSearchQuery.toLowerCase()) ||
        (m.pengirim?.name || "").toLowerCase().includes(deferredSearchQuery.toLowerCase());
      const matchesStatus = filterManifestStatus === "ALL" || m.status === filterManifestStatus;
      return matchesSearch && matchesStatus;
    });
  }, [manifestsList, deferredSearchQuery, filterManifestStatus]);

  const hasMore = visibleCount < filteredManifests.length;

  const visibleManifests = useMemo(() => {
    return filteredManifests.slice(0, visibleCount);
  }, [filteredManifests, visibleCount]);

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + 8, filteredManifests.length));
  }, [filteredManifests.length]);

  return {
    searchQuery,
    setSearchQuery,
    isSearchFocused,
    setIsSearchFocused,
    filterManifestStatus,
    setFilterManifestStatus,
    visibleCount,
    setVisibleCount,
    hasMore,
    loadMore,
    manifestStatusCounts,
    filteredManifests,
    visibleManifests,
    searchManifestInputRef,
  };
}
