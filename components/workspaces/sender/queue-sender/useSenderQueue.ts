"use client";

import { useState, useMemo, useEffect, useCallback } from "react";

const cleanPecahanSuffix = (name?: string | null): string => {
  if (!name) return "";
  return name
    .replace(/\s*\([^)]*pecahan[^)]*\)/gi, "")
    .replace(/\s*\(Pecahan\s*\d+\)/gi, "")
    .replace(/\s*Pecahan\s*\d+/gi, "")
    .trim();
};

export function useSenderQueue(selectedManifest: any | null) {
  const [selectedBundleInManifest, setSelectedBundleInManifest] = useState<any | null>(null);

  // Display Mode & Search for Bundle Permohonan Table
  const [bundleDisplayMode, setBundleDisplayMode] = useState<"berkas" | "pemohon">("berkas");
  const [searchBundlePermohonanQuery, setSearchBundlePermohonanQuery] = useState("");

  // Copy Feedback State
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Pagination states for bundle permohonan table
  const [currentBundlePermohonanPage, setCurrentBundlePermohonanPage] = useState(1);
  const [itemsPerBundlePermohonanPage, setItemsPerBundlePermohonanPage] = useState(10);

  // Sync selectedBundleInManifest when selectedManifest changes
  useEffect(() => {
    const bundlesList = selectedManifest?.bundles || selectedManifest?.bundle || [];
    if (bundlesList.length > 0) {
      const exists = bundlesList.find((b: any) => b.id === selectedBundleInManifest?.id);
      if (exists) {
        setSelectedBundleInManifest(exists);
      } else {
        setSelectedBundleInManifest(bundlesList[0]);
      }
    } else {
      setSelectedBundleInManifest(null);
    }
  }, [selectedManifest]);

  const handleCopy = useCallback((e: React.MouseEvent, text?: string | null) => {
    e.stopPropagation();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 1500);
  }, []);

  const handleToggleFavorite = useCallback((permohonanId: string) => {
    setSelectedBundleInManifest((prevBundle: any) => {
      const permohonanList = prevBundle?.applications || prevBundle?.permohonan;
      if (!permohonanList) return prevBundle;
      const updatedPermohonan = permohonanList.map((p: any) =>
        p.id === permohonanId ? { ...p, isFavorite: !p.isFavorite } : p
      );
      return { ...prevBundle, applications: updatedPermohonan, permohonan: updatedPermohonan };
    });
  }, []);

  // Process Permohonan List according to Display Mode (berkas vs pemohon)
  const processedBundlePermohonanList = useMemo(() => {
    const permohonanList =
      selectedBundleInManifest?.applications || selectedBundleInManifest?.permohonan || [];

    if (bundleDisplayMode === "pemohon") {
      const result: any[] = [];
      permohonanList.forEach((p: any, pIndex: number) => {
        const type = p.applicationType || p.jenisPermohonan;
        const targetList = p.targetData || p.dataBaru || [];
        if ((type === "MUTASI_SEBAGIAN" || type === "PARTIAL_MUTATION") && targetList.length > 0) {
          targetList.forEach((db: any, idx: number) => {
            result.push({
              ...p,
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
            isPecahanRow: false,
            displayNamaWajibPajak: cleanPecahanSuffix(p.namaWajibPajak || p.applicantName),
            uniqueRowKey: p.id || `app-row-${pIndex}`,
          });
        }
      });
      return result;
    }

    return permohonanList.map((p: any, idx: number) => ({
      ...p,
      isPecahanRow: false,
      displayNamaWajibPajak: cleanPecahanSuffix(p.namaWajibPajak || p.applicantName),
      uniqueRowKey: p.id || `app-row-${idx}`,
    }));
  }, [selectedBundleInManifest, bundleDisplayMode]);

  // Filtered Bundle Permohonan List
  const filteredBundlePermohonanList = useMemo(() => {
    if (!searchBundlePermohonanQuery.trim()) return processedBundlePermohonanList;
    const q = searchBundlePermohonanQuery.toLowerCase();
    return processedBundlePermohonanList.filter((p: any) => {
      const nopel = (p.nomorPelayanan || p.nomorPermohonan || "").toLowerCase();
      const nop = (p.nop || "").toLowerCase();
      const nama = (p.displayNamaWajibPajak || p.namaWajibPajak || "").toLowerCase();
      const penginput = (p.penginput?.name || "").toLowerCase();
      return nopel.includes(q) || nop.includes(q) || nama.includes(q) || penginput.includes(q);
    });
  }, [processedBundlePermohonanList, searchBundlePermohonanQuery]);

  // Reset permohonan pagination when search or display mode change
  useEffect(() => {
    setCurrentBundlePermohonanPage(1);
  }, [searchBundlePermohonanQuery, bundleDisplayMode, selectedBundleInManifest]);

  const totalBundlePermohonanPages =
    Math.ceil(filteredBundlePermohonanList.length / itemsPerBundlePermohonanPage) || 1;
  const activeBundlePermohonanPage =
    currentBundlePermohonanPage > totalBundlePermohonanPages ? 1 : currentBundlePermohonanPage;

  const paginatedBundlePermohonanList = useMemo(() => {
    const start = (activeBundlePermohonanPage - 1) * itemsPerBundlePermohonanPage;
    return filteredBundlePermohonanList.slice(start, start + itemsPerBundlePermohonanPage);
  }, [filteredBundlePermohonanList, activeBundlePermohonanPage, itemsPerBundlePermohonanPage]);

  return {
    selectedBundleInManifest,
    setSelectedBundleInManifest,
    bundleDisplayMode,
    setBundleDisplayMode,
    searchBundlePermohonanQuery,
    setSearchBundlePermohonanQuery,
    copiedText,
    handleCopy,
    handleToggleFavorite,
    currentBundlePermohonanPage: activeBundlePermohonanPage,
    setCurrentBundlePermohonanPage,
    itemsPerBundlePermohonanPage,
    setItemsPerBundlePermohonanPage,
    totalBundlePermohonanPages,
    filteredBundlePermohonanList,
    paginatedBundlePermohonanList,
  };
}
