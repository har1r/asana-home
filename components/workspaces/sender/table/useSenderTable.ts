"use client";

import { useState, useMemo, useCallback } from "react";

const cleanPecahanSuffix = (name?: string | null): string => {
  if (!name) return "";
  return name
    .replace(/\s*\([^)]*pecahan[^)]*\)/gi, "")
    .replace(/\s*\(Pecahan\s*\d+\)/gi, "")
    .replace(/\s*Pecahan\s*\d+/gi, "")
    .trim();
};

export function useSenderTable(selectedBundleInManifest: any | null) {
  // Display Mode & Search for Applications Table
  const [bundleDisplayMode, setBundleDisplayMode] = useState<"berkas" | "pemohon">("berkas");
  const [searchApplicationQuery, setSearchApplicationQuery] = useState("");

  // Copy Feedback State
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Pagination states for applications table
  const [currentApplicationPage, setCurrentApplicationPage] = useState(1);
  const [itemsPerApplicationPage, setItemsPerApplicationPage] = useState(10);

  // Favorites state mapping
  const [favoritesMap, setFavoritesMap] = useState<Record<string, boolean>>({});

  // Copy helper
  const handleCopy = useCallback((e: React.MouseEvent, text?: string | null) => {
    e.stopPropagation();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 1500);
  }, []);

  const handleToggleFavorite = useCallback((applicationId: string) => {
    setFavoritesMap((prev) => ({
      ...prev,
      [applicationId]: !prev[applicationId],
    }));
  }, []);

  // Process Application List according to Display Mode (berkas vs pemohon)
  const processedApplicationList = useMemo(() => {
    const applicationList =
      selectedBundleInManifest?.applications || selectedBundleInManifest?.permohonan || [];

    if (bundleDisplayMode === "pemohon") {
      const result: any[] = [];
      applicationList.forEach((p: any, pIndex: number) => {
        const isFav = favoritesMap[p.id] !== undefined ? favoritesMap[p.id] : !!p.isFavorite;
        const type = p.applicationType || p.jenisPermohonan;
        const targetList = p.targetData || p.dataBaru || [];
        if ((type === "MUTASI_SEBAGIAN" || type === "PARTIAL_MUTATION") && targetList.length > 0) {
          targetList.forEach((db: any, idx: number) => {
            result.push({
              ...p,
              isFavorite: isFav,
              isPecahanRow: true,
              pecahanIndex: idx + 1,
              totalPecahan: targetList.length,
              displayNamaWajibPajak: cleanPecahanSuffix(db.namaPemilikBaru || db.ownerName || p.namaWajibPajak || p.applicantName),
              targetDataBaruId: db.id,
              uniqueRowKey: `${p.id || pIndex}-db-${idx}`,
            });
          });
        } else {
          result.push({
            ...p,
            isFavorite: isFav,
            isPecahanRow: false,
            displayNamaWajibPajak: cleanPecahanSuffix(p.namaWajibPajak || p.applicantName),
            uniqueRowKey: p.id || `app-row-${pIndex}`,
          });
        }
      });
      return result;
    }

    return applicationList.map((p: any, idx: number) => {
      const isFav = favoritesMap[p.id] !== undefined ? favoritesMap[p.id] : !!p.isFavorite;
      return {
        ...p,
        isFavorite: isFav,
        isPecahanRow: false,
        displayNamaWajibPajak: cleanPecahanSuffix(p.namaWajibPajak || p.applicantName),
        uniqueRowKey: p.id || `app-row-${idx}`,
      };
    });
  }, [selectedBundleInManifest, bundleDisplayMode, favoritesMap]);

  // Filter Applications by search query
  const filteredApplicationList = useMemo(() => {
    if (!searchApplicationQuery.trim()) return processedApplicationList;
    const q = searchApplicationQuery.toLowerCase().trim();
    return processedApplicationList.filter((p: any) => {
      const nop = (p.nop || p.nopPencarian || p.taxObjectNumber || "").toString().toLowerCase();
      const nama = (p.displayNamaWajibPajak || p.namaWajibPajak || p.applicantName || "").toString().toLowerCase();
      const noApp = (p.nomorPermohonan || p.applicationNumber || "").toString().toLowerCase();
      return nop.includes(q) || nama.includes(q) || noApp.includes(q);
    });
  }, [processedApplicationList, searchApplicationQuery]);

  const totalApplicationPages = useMemo(() => {
    return Math.ceil(filteredApplicationList.length / itemsPerApplicationPage) || 1;
  }, [filteredApplicationList.length, itemsPerApplicationPage]);

  const paginatedApplicationList = useMemo(() => {
    const start = (currentApplicationPage - 1) * itemsPerApplicationPage;
    return filteredApplicationList.slice(start, start + itemsPerApplicationPage);
  }, [filteredApplicationList, currentApplicationPage, itemsPerApplicationPage]);

  return {
    bundleDisplayMode,
    setBundleDisplayMode,
    searchApplicationQuery,
    setSearchApplicationQuery,
    copiedText,
    currentApplicationPage,
    setCurrentApplicationPage,
    itemsPerApplicationPage,
    setItemsPerApplicationPage,
    totalApplicationPages,
    paginatedApplicationList,
    filteredApplicationList,
    handleCopy,
    handleToggleFavorite,
  };
}
