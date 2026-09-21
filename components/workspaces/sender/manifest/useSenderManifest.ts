"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ManifestStatusCounts } from "../kpi/useSenderKPIStats";
import {
  getManifests,
  getManifestDetails,
  createManifest,
  lockManifest,
  revisiManifest,
} from "@/app/actions/sender";

export function useSenderManifest(
  showActionStatus?: (status: 'loading' | 'success' | 'error', title: string, message: string) => void,
  showConfirm?: (params: { title: string; message: string; onConfirm: () => void }) => void,
  onRefreshWorkspace?: () => void
) {
  const [manifestsList, setManifestsList] = useState<any[]>([]);
  const [selectedManifest, setSelectedManifest] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [isGridLoading, setIsGridLoading] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchQuery, setActiveSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [filterManifestStatus, setFilterManifestStatus] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Modal Lock Manifest
  const [showLockManifestModal, setShowLockManifestModal] = useState(false);
  const [manifestToLock, setManifestToLock] = useState<any | null>(null);

  const searchManifestInputRef = useRef<HTMLInputElement | null>(null);

  // Keyboard shortcut: Ctrl+K or '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName?.toLowerCase();
      const isTyping = tag === "input" || tag === "textarea" || tag === "select" || (e.target as HTMLElement).isContentEditable;
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

  const handleSearchSubmit = () => {
    setActiveSearchQuery(searchQuery);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setActiveSearchQuery("");
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filterManifestStatus]);

  // Execute Server Search when activeSearchQuery changes
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const executeServerSearch = async () => {
      setIsGridLoading(true);
      try {
        const res = await getManifests({
          status: "ALL",
          limit: 48,
          search: activeSearchQuery,
        });

        if (res.success && "list" in res) {
          setManifestsList(res.list || []);
        }
      } catch (err: any) {
        console.error("Gagal melakukan pencarian manifest:", err);
      } finally {
        setIsGridLoading(false);
      }
    };

    executeServerSearch();
  }, [activeSearchQuery]);

  const handleSelectManifest = useCallback((manifest: any) => {
    setSelectedManifest(manifest);

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
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
  }, []);

  // Handle Create Manifest
  const handleCreateManifest = async () => {
    setLoading(true);
    if (showActionStatus) {
      showActionStatus("loading", "Membuat Manifest Baru", "Sedang menghasilkan nomor manifest dan menyiapkan draf pengiriman...");
    }
    try {
      const res: any = await createManifest();
      if (res.success && res.manifest) {
        const createdNo = res.manifest.manifestNumber || res.manifest.nomorManifest || "";
        if (showActionStatus) {
          showActionStatus("success", "Manifest Berhasil Dibuat", `Manifest baru ${createdNo} berhasil dibuat.`);
        }
        if (onRefreshWorkspace) onRefreshWorkspace();

        const detail = await getManifestDetails(res.manifest.id);
        if (detail.success && "manifest" in detail && detail.manifest) {
          setSelectedManifest(detail.manifest);
        }
      } else {
        if (showActionStatus) {
          showActionStatus("error", "Gagal Membuat Manifest", res.error || "Gagal membuat manifest baru.");
        }
      }
    } catch (err: any) {
      if (showActionStatus) {
        showActionStatus("error", "Gagal Membuat Manifest", err.message || "Sistem error saat membuat manifest.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Lock Manifest Modal trigger & execution
  const handleLockManifest = (target?: any) => {
    const manifest =
      target && typeof target === "object" && typeof target.id === "string"
        ? target
        : selectedManifest;
    if (!manifest || !manifest.id) return;
    setManifestToLock(manifest);
    setShowLockManifestModal(true);
  };

  const executeLockManifest = async (manifestId: string) => {
    const targetId = manifestId || manifestToLock?.id || selectedManifest?.id;
    if (!targetId) {
      if (showActionStatus) showActionStatus("error", "Gagal Mengunci Manifest", "ID Manifest tidak valid.");
      return;
    }

    const targetManifest = manifestsList.find((m) => m.id === targetId) || selectedManifest;
    const mNo = targetManifest?.nomorManifest || targetManifest?.manifestNumber || "";
    setLoading(true);
    if (showActionStatus) showActionStatus("loading", "Mengunci Manifest", `Sedang mengunci manifest ${mNo}...`);

    try {
      const res: any = await lockManifest(targetId);
      if (res.success) {
        if (showActionStatus) showActionStatus("success", "Manifest Berhasil Dikunci", `Manifest ${mNo} berhasil dikunci dan siap untuk pengiriman kargo.`);
        if (onRefreshWorkspace) onRefreshWorkspace();
      } else {
        if (showActionStatus) showActionStatus("error", "Gagal Mengunci Manifest", res.error || "Gagal mengunci manifest.");
      }
    } catch (err: any) {
      if (showActionStatus) showActionStatus("error", "Gagal Mengunci Manifest", err.message || "Sistem error saat mengunci.");
    } finally {
      setLoading(false);
      setManifestToLock(null);
      setShowLockManifestModal(false);
    }
  };

  // Handle Revisi Manifest
  const handleRevisiManifest = () => {
    if (!selectedManifest) return;
    const mNo = selectedManifest.nomorManifest || selectedManifest.manifestNumber || "";
    if (showConfirm) {
      showConfirm({
        title: "Konfirmasi Revisi Manifest",
        message: `Apakah Anda yakin ingin MEREVISI manifest ${mNo}? Ini akan mengembalikan status menjadi DRAFT agar Anda dapat mengubah daftar bundle didalamnya.`,
        onConfirm: async () => {
          setLoading(true);
          if (showActionStatus) showActionStatus("loading", "Merevisi Manifest", `Sedang mengembalikan status manifest ${mNo} ke DRAFT...`);
          try {
            const res: any = await revisiManifest(selectedManifest.id);
            if (res.success) {
              if (showActionStatus) showActionStatus("success", "Manifest Berhasil Direvisi", `Manifest ${mNo} berhasil dikembalikan ke status DRAFT.`);
              if (onRefreshWorkspace) onRefreshWorkspace();
            } else {
              if (showActionStatus) showActionStatus("error", "Gagal Merevisi Manifest", res.error || "Gagal merevisi manifest.");
            }
          } catch (err: any) {
            if (showActionStatus) showActionStatus("error", "Gagal Merevisi Manifest", err.message || "Sistem error.");
          } finally {
            setLoading(false);
          }
        },
      });
    }
  };

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

  const filteredManifests = useMemo(() => {
    return manifestsList.filter((m) => {
      const matchesStatus =
        filterManifestStatus === "ALL"
          ? m.status === "DRAFT"
          : m.status === filterManifestStatus;
      return matchesStatus;
    });
  }, [manifestsList, filterManifestStatus]);

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
    setLoading,
    isGridLoading,
    setIsGridLoading,
    searchQuery,
    setSearchQuery,
    activeSearchQuery,
    handleSearchSubmit,
    handleClearSearch,
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

    // Modal states
    showLockManifestModal,
    setShowLockManifestModal,
    manifestToLock,
    setManifestToLock,

    // Actions
    handleSelectManifest,
    handleCreateManifest,
    handleLockManifest,
    executeLockManifest,
    handleRevisiManifest,
  };
}
