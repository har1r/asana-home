import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { uploadArsipDigital, ajukanKembalikanKePeneliti, getBundleDetails } from "@/app/actions/archivist";
import { toggleFavoriteApplication } from "@/app/actions/data-entry";

export interface UseArchivistArsipQueueOptions {
  permohonanList: any[];
  selectedBundle: any | null;
  fetchBundleDetail: (bundleId: string) => Promise<void>;
  fetchBundles: (isManualRefresh?: boolean) => Promise<void>;
  checkPermohonanNeedsReupload: (p: any, targetDataBaruId?: string | null) => boolean;
}

export function useArchivistArsipQueue({
  permohonanList,
  selectedBundle,
  fetchBundleDetail,
  fetchBundles,
  checkPermohonanNeedsReupload,
}: UseArchivistArsipQueueOptions) {
  // Search & Pagination States
  const [searchArsipQuery, setSearchArsipQuery] = useState("");
  const [isArsipSearchFocused, setIsArsipSearchFocused] = useState<boolean>(false);
  const [arsipDisplayMode, setArsipDisplayMode] = useState<"berkas" | "pemohon">("berkas");
  const [filterArsipJenisLayanan, setFilterArsipJenisLayanan] = useState<string>("ALL");
  const searchArsipInputRef = useRef<HTMLInputElement | null>(null);
  const [currentArsipPage, setCurrentArsipPage] = useState<number>(1);
  const [itemsPerArsipPage, setItemsPerArsipPage] = useState<number>(10);

  // Sort State
  const [sortBy, setSortBy] = useState<"terbaru" | "tgl_nopel_desc" | "tgl_nopel_asc" | "nama_asc">("terbaru");
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Modal Detail Permohonan
  const [globalSelectedRequest, setGlobalSelectedRequest] = useState<any | null>(null);

  // Modal Koreksi / Pengembalian
  const [showCorrectionModal, setShowCorrectionModal] = useState<boolean>(false);
  const [correctionTarget, setCorrectionTarget] = useState<any | null>(null);
  const [correctionReason, setCorrectionReason] = useState<string>("");

  // Modal Kelola Pecahan (Mutasi Sebagian)
  const [showFractionsModal, setShowFractionsModal] = useState<boolean>(false);
  const [fractionTargetPermohonan, setFractionTargetPermohonan] = useState<any | null>(null);

  // Loading & Feedback States
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // Copy Feedback State
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // File Inputs Refs
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const handleCopy = useCallback((e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 1000);
  }, []);

  // Handle Upload File PDF Arsip
  const handleUploadFile = async (
    permohonanId: string,
    event: React.ChangeEvent<HTMLInputElement>,
    dataBaruId?: string
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("File harus berformat PDF.");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setError("Ukuran file maksimal 15MB.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("permohonanId", permohonanId);
      if (dataBaruId) {
        formData.append("dataBaruId", dataBaruId);
      }

      const res = await uploadArsipDigital(formData);

      if (res.success) {
        if ((res as any).isFullyArchived) {
          setSuccess("Seluruh dokumen target data lengkap! Permohonan otomatis berstatus ARCHIVED.");
        } else {
          setSuccess(
            "File arsip digital target data berhasil diunggah! Permohonan tetap BUNDLED menunggu target data lain."
          );
        }
        if (selectedBundle) {
          await fetchBundleDetail(selectedBundle.id);
        }
        await fetchBundles(true);

        if (showFractionsModal && fractionTargetPermohonan && selectedBundle) {
          const updatedRes = await getBundleDetails(selectedBundle.id);
          if (updatedRes.success && "bundle" in updatedRes && updatedRes.bundle) {
            const appList =
              (updatedRes.bundle as any).applications || (updatedRes.bundle as any).permohonan || [];
            const updatedP = appList.find((p: any) => p.id === fractionTargetPermohonan.id);
            if (updatedP) setFractionTargetPermohonan(updatedP);
          }
        }
      } else {
        setError("error" in res && res.error ? (res.error as string) : "Gagal mengunggah file arsip.");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat mengunggah file.");
    } finally {
      setLoading(false);
      if (event.target) event.target.value = "";
    }
  };

  const triggerFileInput = (permohonanId: string) => {
    const ref = fileInputRefs.current[permohonanId];
    if (ref) ref.click();
  };

  // Handle pengembalian berkas ke Peneliti
  const handleRequestCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctionTarget || !correctionReason.trim()) {
      setError("Alasan pengembalian wajib diisi.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await ajukanKembalikanKePeneliti(correctionTarget.id, correctionReason);
      if (res.success) {
        setSuccess("Pengajuan pengembalian berkas ke Peneliti berhasil terkirim.");
        setShowCorrectionModal(false);
        setCorrectionTarget(null);
        setCorrectionReason("");
        if (selectedBundle) {
          await fetchBundleDetail(selectedBundle.id);
        }
        await fetchBundles(true);
      } else {
        setError("error" in res && res.error ? (res.error as string) : "Gagal mengajukan pengembalian.");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan sistem saat mengajukan pengembalian.");
    } finally {
      setLoading(false);
    }
  };

  const openCorrectionModal = (permohonan: any) => {
    setCorrectionTarget(permohonan);
    setCorrectionReason("");
    setShowCorrectionModal(true);
  };

  // Toggle Favorit Permohonan
  const handleToggleFavorite = async (permohonanId: string) => {
    try {
      const res = await toggleFavoriteApplication(permohonanId);
      if (res.success) {
        if (selectedBundle) {
          fetchBundleDetail(selectedBundle.id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Process Arsip List according to Display Mode (berkas vs pemohon) & compute NOP/ownerName
  const processedArsipList = useMemo(() => {
    const rawTargetApps =
      permohonanList.length > 0
        ? permohonanList
        : selectedBundle?.applications || selectedBundle?.permohonan || [];

    const targetApps = rawTargetApps.map((item: any) => {
      const previousData = Array.isArray(item.previousData) ? item.previousData : (Array.isArray(item.dataLama) ? item.dataLama : []);
      const targetData = Array.isArray(item.targetData) ? item.targetData : (Array.isArray(item.dataBaru) ? item.dataBaru : []);
      const firstPrev = previousData[0] || {};
      const firstTarget = targetData[0] || {};
      const appType = item.applicationType || item.jenisPermohonan || '';

      const isPartialMutation = appType === 'PARTIAL_MUTATION' || appType === 'MUTASI_SEBAGIAN';
      const isReactivation = appType === 'REACTIVATION' || appType === 'PENGAKTIFAN';

      let calculatedNop = item.nop || '';
      if (!calculatedNop || calculatedNop === '-') {
        if (appType === 'NEW_TAX_OBJECT' || appType === 'OBJEK_PAJAK_BARU') {
          calculatedNop = firstTarget.nopTemporary || firstTarget.nop || '-';
        } else {
          calculatedNop = firstPrev.nop || '-';
        }
      }

      let calculatedOwnerName = item.ownerName || item.namaWajibPajak || item.displayNamaWajibPajak || '';
      if (!calculatedOwnerName || calculatedOwnerName === '-') {
        if (isReactivation) {
          calculatedOwnerName = firstPrev.ownerName || firstPrev.namaPemilikLama || '-';
        } else if (isPartialMutation) {
          const firstName = firstTarget.ownerName || firstTarget.namaPemilikBaru || '';
          const totalCount = targetData.length;
          if (firstName && totalCount > 1) {
            calculatedOwnerName = `${firstName} (${totalCount})`;
          } else {
            calculatedOwnerName = firstName || '-';
          }
        } else {
          if (targetData.length > 0) {
            calculatedOwnerName = targetData
              .map((t: any) => t.ownerName || t.namaPemilikBaru)
              .filter(Boolean)
              .join(', ');
          }
          if (!calculatedOwnerName) {
            calculatedOwnerName = firstPrev.ownerName || '-';
          }
        }
      }

      return {
        ...item,
        nop: calculatedNop,
        ownerName: calculatedOwnerName,
        namaWajibPajak: calculatedOwnerName,
        previousData,
        targetData,
        dataLama: previousData,
        dataBaru: targetData,
      };
    });

    if (arsipDisplayMode === "pemohon") {
      const result: any[] = [];
      targetApps.forEach((p) => {
        const jenis = p.jenisPermohonan || p.applicationType;
        const targetList = p.targetData || [];
        if ((jenis === "MUTASI_SEBAGIAN" || jenis === "PARTIAL_MUTATION") && targetList.length > 0) {
          targetList.forEach((db: any, idx: number) => {
            const pecahanName = db.ownerName || db.namaPemilikBaru || p.ownerName || p.namaWajibPajak;
            result.push({
              ...p,
              isPecahanRow: true,
              pecahanIndex: idx + 1,
              totalPecahan: targetList.length,
              displayNamaWajibPajak: pecahanName,
              targetDataBaruId: db.id || db.idTargetData,
              uniqueRowKey: `${p.id}-db-${idx}`,
            });
          });
        } else {
          result.push({
            ...p,
            isPecahanRow: false,
            displayNamaWajibPajak: p.ownerName || p.namaWajibPajak,
            uniqueRowKey: p.id,
          });
        }
      });
      return result;
    }

    return targetApps.map((p) => ({
      ...p,
      isPecahanRow: false,
      displayNamaWajibPajak: p.ownerName || p.namaWajibPajak,
      uniqueRowKey: p.id,
    }));
  }, [permohonanList, selectedBundle, arsipDisplayMode]);

  // Counts for Arsip Jenis Layanan Pills
  const arsipJenisCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: processedArsipList.length };
    processedArsipList.forEach((p) => {
      const j = p.jenisPermohonan || p.applicationType;
      if (j) {
        counts[j] = (counts[j] || 0) + 1;
      }
    });
    return counts;
  }, [processedArsipList]);

  // Filter Permohonan Arsip List
  const filteredArsipList = useMemo(() => {
    return processedArsipList.filter((p) => {
      const q = searchArsipQuery.toLowerCase();
      const matchSearch =
        searchArsipQuery === "" ||
        (p.nomorPelayanan && p.nomorPelayanan.toLowerCase().includes(q)) ||
        (p.nomorPermohonan && p.nomorPermohonan.toLowerCase().includes(q)) ||
        (p.nop && p.nop.includes(q)) ||
        (p.displayNamaWajibPajak && p.displayNamaWajibPajak.toLowerCase().includes(q)) ||
        (p.penginput?.name && p.penginput.name.toLowerCase().includes(q));

      const jenis = p.jenisPermohonan || p.applicationType;
      const matchJenis = filterArsipJenisLayanan === "ALL" || jenis === filterArsipJenisLayanan;

      return matchSearch && matchJenis;
    });
  }, [processedArsipList, searchArsipQuery, filterArsipJenisLayanan]);

  return {
    searchArsipQuery,
    setSearchArsipQuery,
    isArsipSearchFocused,
    setIsArsipSearchFocused,
    arsipDisplayMode,
    setArsipDisplayMode,
    filterArsipJenisLayanan,
    setFilterArsipJenisLayanan,
    searchArsipInputRef,
    currentArsipPage,
    setCurrentArsipPage,
    itemsPerArsipPage,
    setItemsPerArsipPage,
    sortBy,
    setSortBy,
    isSortDropdownOpen,
    setIsSortDropdownOpen,
    sortDropdownRef,
    globalSelectedRequest,
    setGlobalSelectedRequest,
    showCorrectionModal,
    setShowCorrectionModal,
    correctionTarget,
    setCorrectionTarget,
    correctionReason,
    setCorrectionReason,
    showFractionsModal,
    setShowFractionsModal,
    fractionTargetPermohonan,
    setFractionTargetPermohonan,
    loading,
    error,
    setError,
    success,
    setSuccess,
    copiedText,
    handleCopy,
    fileInputRefs,
    handleUploadFile,
    triggerFileInput,
    handleRequestCorrection,
    openCorrectionModal,
    handleToggleFavorite,
    processedArsipList,
    filteredArsipList,
    arsipJenisCounts,
  };
}
