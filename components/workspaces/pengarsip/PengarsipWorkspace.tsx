"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  Upload,
  AlertTriangle,
  CheckCircle,
  FileCheck,
  ArrowLeftRight,
  Loader2,
  X,
  Star,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Boxes,
  FileSpreadsheet,
  Clock,
  ArrowRight,
  FolderOpen,
  RefreshCw,
  ListFilter,
  Lock,
  Unlock,
  Send,
  Folder,
  FolderLock,
  Copy,
  Check,
  Slash,
} from "lucide-react";
import {
  getDigitizationBundles,
  getBundleDetails,
  uploadArsipDigital,
  ajukanKembalikanKePeneliti,
} from "@/app/actions/pengarsip";
import { useDashboard } from "@/context/DashboardContext";
import {
  SkeletonBox,
  SkeletonText,
  SkeletonBadge,
} from "@/components/skeletons/SkeletonBase";

type ViewMode = "bundle" | "arsip";

/** Skeleton untuk PengarsipWorkspace — premium card grid layout (mengikuti PenelitiSkeleton) */
export function PengarsipSkeleton() {
  return (
    <div className="w-full font-sans select-none flex flex-col gap-6 animate-fadeIn">
      {/* Header card skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#dde3ea] p-5 rounded-2xl shadow-sm">
        <SkeletonBox width="w-56" height="h-5" rounded="rounded-full" />
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1">
            <SkeletonBox width="w-28" height="h-7" rounded="rounded-lg" />
            <SkeletonBox width="w-28" height="h-7" rounded="rounded-lg" />
          </div>
        </div>
      </div>

      {/* Content card skeleton (grid of cards) */}
      <div className="bg-[#dde3ea] border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6 min-h-[300px]">
        {/* Action row skeleton */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <SkeletonBox width="w-40" height="h-4.5" rounded="rounded-full" />
          <div className="flex items-center gap-3 w-full md:w-auto">
            <SkeletonBox width="w-full sm:w-72" height="h-8" rounded="rounded-lg" />
            <SkeletonBox width="w-16" height="h-8" rounded="rounded-lg" />
          </div>
        </div>

        {/* Grid of bundle cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl border border-slate-200 bg-white flex flex-col justify-between gap-3.5 min-h-[110px]"
            >
              {/* Top Row: Title & Count Badge */}
              <div className="flex items-center justify-between gap-3 w-full">
                <SkeletonBox width="w-32" height="h-3" rounded="rounded-sm" />
                <SkeletonBox width="w-6" height="h-4.5" rounded="rounded-md" />
              </div>

              {/* Bottom Row */}
              <div className="flex flex-col gap-2 pt-2.5 border-t border-slate-100/80">
                <div className="flex items-center justify-between gap-2.5">
                  <SkeletonBox width="w-12" height="h-4" rounded="rounded-full" />
                  <SkeletonBox width="w-16" height="h-4" rounded="rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Footer skeleton */}
        <div className="px-5 py-3.5 border border-slate-200 bg-slate-50 flex items-center justify-between mt-auto rounded-xl shadow-3xs">
          <SkeletonBox width="w-48" height="h-3" rounded="rounded-full" />
          <SkeletonBox width="w-32" height="h-7" rounded="rounded-lg" />
        </div>
      </div>
    </div>
  );
}

const formatNop = (nop: string) => {
  if (!nop) return '';
  const cleanNop = nop.replace(/[^0-9]/g, '');
  if (cleanNop.length === 17) {
    const padded = cleanNop + '0';
    return `${padded.slice(0, 2)}.${padded.slice(2, 4)}.${padded.slice(4, 7)}.${padded.slice(7, 10)}.${padded.slice(10, 13)}-${padded.slice(13, 17)}.${padded.slice(17)}`;
  }
  if (cleanNop.length === 18) {
    return `${cleanNop.slice(0, 2)}.${cleanNop.slice(2, 4)}.${cleanNop.slice(4, 7)}.${cleanNop.slice(7, 10)}.${cleanNop.slice(10, 13)}-${cleanNop.slice(13, 17)}.${cleanNop.slice(17)}`;
  }
  return nop;
};

const getAbbreviatedJenis = (jenis: string) => {
  switch (jenis) {
    case "OBJEK_PAJAK_BARU": return "OPB";
    case "MUTASI_SEBAGIAN": return "MS";
    case "MUTASI_HABIS_REGULER": return "MHR";
    case "MUTASI_HABIS_UPDATE": return "MHU";
    case "PEMBETULAN": return "PBT";
    case "PENGAKTIFAN": return "AKT";
    default: return jenis;
  }
};

const BUNDLE_TYPE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  MUTASI_SEBAGIAN: { bg: 'bg-indigo-50/80', text: 'text-indigo-700', border: 'border-indigo-150/80' },
  MUTASI_HABIS_UPDATE: { bg: 'bg-emerald-50/80', text: 'text-emerald-700', border: 'border-emerald-150/80' },
  MUTASI_HABIS_REGULER: { bg: 'bg-pink-50/80', text: 'text-pink-750', border: 'border-pink-150/80' },
  OBJEK_PAJAK_BARU: { bg: 'bg-amber-50/80', text: 'text-amber-700', border: 'border-amber-150/80' },
  PEMBETULAN: { bg: 'bg-purple-50/80', text: 'text-purple-700', border: 'border-purple-150/80' },
  PENGAKTIFAN: { bg: 'bg-sky-50/80', text: 'text-sky-700', border: 'border-sky-150/80' },
};

const BUNDLE_STATUS_CONFIG: Record<string, { bg: string; text: string; border: string; dot: string; shadow: string }> = {
  DRAFT: {
    bg: 'bg-indigo-50/70',
    text: 'text-indigo-700',
    border: 'border-indigo-100',
    dot: 'bg-indigo-500',
    shadow: 'hover:shadow-indigo-150/40'
  },
  LOCKED: {
    bg: 'bg-slate-900',
    text: 'text-slate-100',
    border: 'border-slate-800',
    dot: 'bg-amber-400',
    shadow: 'hover:shadow-slate-300/20'
  },
  IN_MANIFEST: {
    bg: 'bg-emerald-50/80',
    text: 'text-emerald-800',
    border: 'border-emerald-150',
    dot: 'bg-emerald-500',
    shadow: 'hover:shadow-emerald-150/40'
  },
};

const isOverdue = (dateStr: string | null | undefined, status: string): boolean => {
  if (!dateStr) return false;
  if (status === 'COMPLETED' || status === 'REJECTED' || status === 'ARCHIVED') return false;
  return new Date(dateStr) < new Date();
};

const toTitleCase = (str: string) =>
  str
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'SUBMITTED':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200/50';
    case 'REVISION':
      return 'bg-amber-100 text-amber-800 border-amber-200/50 animate-pulse';
    case 'BUNDLED':
      return 'bg-blue-100 text-blue-800 border-blue-200/50';
    case 'ARCHIVED':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200/50';
    case 'COMPLETED':
      return 'bg-cyan-100 text-cyan-800 border-cyan-200/50';
    case 'REJECTED':
      return 'bg-rose-100 text-rose-800 border-rose-200/50';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200/50';
  }
};

export default function PengarsipWorkspace() {
  const { showConfirm } = useDashboard();

  // ── View Mode
  const [viewMode, setViewMode] = useState<ViewMode>("bundle");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // ── Data
  const [bundlesList, setBundlesList] = useState<any[]>([]);
  const [selectedBundle, setSelectedBundle] = useState<any | null>(null);

  // ── Loaders & Messages
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ── Bundle tab: search + pagination
  const [searchBundleQuery, setSearchBundleQuery] = useState("");
  const [isBundleSearchFocused, setIsBundleSearchFocused] = useState(false);
  const [currentBundlePage, setCurrentBundlePage] = useState(1);
  const [itemsPerBundlePage, setItemsPerBundlePage] = useState(8);
  const [filterBundleJenisLayanan, setFilterBundleJenisLayanan] = useState<string>("ALL");
  const [filterBundleStatus, setFilterBundleStatus] = useState<string>("ALL");
  const [isBundleFilterDropdownOpen, setIsBundleFilterDropdownOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ── Arsip tab: pagination
  const [currentArsipPage, setCurrentArsipPage] = useState(1);
  const [itemsPerArsipPage, setItemsPerArsipPage] = useState(10);

  // Copy to Clipboard
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const handleCopy = useCallback((e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 1000);
  }, []);

  // ── Correction Modal
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [correctionTarget, setCorrectionTarget] = useState<any | null>(null);
  const [correctionReason, setCorrectionReason] = useState("");

  // ── Fractions Modal (Mutasi Sebagian)
  const [showFractionsModal, setShowFractionsModal] = useState(false);
  const [fractionTargetPermohonan, setFractionTargetPermohonan] = useState<any | null>(null);
  const [activeFractionId, setActiveFractionId] = useState<string | null>(null);
  const fractionFileInputRef = useRef<HTMLInputElement | null>(null);

  // ── File inputs
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Reset arsip pagination when selectedBundle changes
  useEffect(() => {
    setCurrentArsipPage(1);
  }, [selectedBundle?.id]);

  // Reset bundle pagination when search, filters, or items per page change
  useEffect(() => {
    setCurrentBundlePage(1);
  }, [searchBundleQuery, filterBundleStatus, filterBundleJenisLayanan, itemsPerBundlePage]);

  // ── Computed: filtered + paginated bundles
  const filteredBundlesList = useMemo(() => {
    return bundlesList.filter((b) => {
      const matchesSearch = b.nomorBundle.toLowerCase().includes(searchBundleQuery.toLowerCase());
      const matchesStatus = filterBundleStatus === "ALL" || b.status === filterBundleStatus;
      const matchesJenis = filterBundleJenisLayanan === "ALL" || b.jenisPermohonan === filterBundleJenisLayanan;
      return matchesSearch && matchesStatus && matchesJenis;
    });
  }, [bundlesList, searchBundleQuery, filterBundleStatus, filterBundleJenisLayanan]);

  const totalBundlePages = Math.ceil(filteredBundlesList.length / itemsPerBundlePage);
  const activeBundlePage = currentBundlePage > totalBundlePages ? 1 : currentBundlePage;
  const paginatedBundlesList = useMemo(() => {
    return filteredBundlesList.slice(
      (activeBundlePage - 1) * itemsPerBundlePage,
      activeBundlePage * itemsPerBundlePage
    );
  }, [filteredBundlesList, activeBundlePage, itemsPerBundlePage]);

  // ── Computed: permohonan list for arsip tab
  const permohonanList = selectedBundle?.permohonan || [];
  const totalArsipPages = Math.ceil(permohonanList.length / itemsPerArsipPage);
  const activeArsipPage = currentArsipPage > totalArsipPages ? 1 : currentArsipPage;
  const paginatedArsipList = permohonanList.slice(
    (activeArsipPage - 1) * itemsPerArsipPage,
    activeArsipPage * itemsPerArsipPage
  );

  const currentActiveCount = useMemo(() => {
    if (viewMode === "bundle") return filteredBundlesList.length;
    return selectedBundle?.permohonan?.length || 0;
  }, [viewMode, filteredBundlesList.length, selectedBundle?.permohonan?.length]);

  // ── Data fetch
  const fetchBundles = async (forceRefresh = false) => {
    if (forceRefresh) {
      setIsRefreshing(true);
    } else {
      setListLoading(true);
    }
    setError("");
    try {
      const res = await getDigitizationBundles();
      if (res.success) {
        setBundlesList(res.list || []);
        // Re-sync selected bundle
        if (selectedBundle) {
          const updatedSelected = res.list?.find(b => b.id === selectedBundle.id);
          setSelectedBundle(updatedSelected || null);
        }
        return res.list;
      } else {
        setError(res.error || "Gagal mengambil daftar bundle.");
      }
    } catch (err) {
      setError("Kesalahan koneksi ke server.");
    } finally {
      setListLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBundles();
  }, []);

  // ── Select bundle → mark as active (instant, matching Peneliti behavior)
  const handleSelectBundle = (bundle: any) => {
    setSelectedBundle(bundle);
    setCurrentArsipPage(1);
  };

  // ── File upload
  const handleUploadFile = async (permohonanId: string, event: React.ChangeEvent<HTMLInputElement>, dataBaruId?: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("File harus berupa dokumen bertipe PDF.");
      return;
    }
    const MAX_SIZE = 20 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setError("Ukuran file tidak boleh melebihi 20 MB.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    const inputRefKey = dataBaruId ? `${permohonanId}_${dataBaruId}` : permohonanId;

    try {
      const formData = new FormData();
      formData.append("permohonanId", permohonanId);
      if (dataBaruId) {
        formData.append("dataBaruId", dataBaruId);
      }
      formData.append("file", file);

      const res: any = await uploadArsipDigital(formData);
      if (res.success) {
        setSuccess("Arsip digital berhasil diunggah!");
        const updatedList = await fetchBundles();
        
        // Re-sync fractions modal state if active
        if (updatedList && fractionTargetPermohonan) {
          for (const b of updatedList) {
            const match = b.permohonan.find((p: any) => p.id === permohonanId);
            if (match) {
              setFractionTargetPermohonan(match);
              break;
            }
          }
        }

        if (fileInputRefs.current[inputRefKey]) {
          fileInputRefs.current[inputRefKey]!.value = "";
        }
        if (fractionFileInputRef.current) {
          fractionFileInputRef.current.value = "";
        }
        setTimeout(() => setSuccess(""), 4000);
      } else {
        setError(res.error || "Gagal mengunggah arsip digital.");
      }
    } catch (err: any) {
      setError(err.message || "Sistem error saat mengunggah file.");
    } finally {
      setLoading(false);
    }
  };

  const triggerFileInput = (permohonanId: string, dataBaruId?: string) => {
    const key = dataBaruId ? `${permohonanId}_${dataBaruId}` : permohonanId;
    if (fileInputRefs.current[key]) {
      fileInputRefs.current[key]!.click();
    }
  };

  // ── Correction: Kembalikan ke Peneliti
  const handleRequestCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctionTarget || !correctionReason.trim()) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res: any = await ajukanKembalikanKePeneliti(correctionTarget.id, correctionReason);
      if (res.success) {
        setSuccess("Permintaan koreksi 'Kembalikan ke Peneliti' berhasil diajukan dan sedang menunggu keputusan Supervisor.");
        setShowCorrectionModal(false);
        setCorrectionTarget(null);
        setCorrectionReason("");
        await fetchBundles();
        setTimeout(() => setSuccess(""), 5000);
      } else {
        setError(res.error || "Gagal mengajukan permintaan koreksi.");
      }
    } catch (err: any) {
      setError(err.message || "Sistem error saat mengajukan koreksi.");
    } finally {
      setLoading(false);
    }
  };

  const openCorrectionModal = (permohonan: any) => {
    setCorrectionTarget(permohonan);
    setCorrectionReason("");
    setShowCorrectionModal(true);
  };

  return (
    <div id="pengarsip-board-root" className="w-full font-sans select-none animate-fadeIn flex flex-col gap-6">

      {/* Show full skeleton during initial load */}
      {listLoading && <PengarsipSkeleton />}

      {/* Hide real content while skeleton is visible */}
      <div className={`flex flex-col gap-6 ${listLoading ? "hidden" : ""}`}>

        {/* Header with View switcher toggle — aligned with Peneliti style */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] p-5 rounded-2xl shadow-md transition-all duration-300">
          <div className="flex items-center justify-center sm:justify-start w-full sm:w-auto select-none">
            <div className="flex items-center gap-1 sm:gap-1.5 bg-white/30 border border-white/40 p-0.5 sm:p-1 rounded-lg sm:rounded-xl shadow-xs">
              {/* Root tag */}
              <div
                onClick={() => setViewMode('bundle')}
                className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg border border-slate-400/10 cursor-pointer transition-all duration-150 hover:bg-white/25 active:scale-95 text-slate-700/70"
              >
                <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
                <span className="text-[11px] sm:text-[12px] font-bold">Tugas Saya</span>
              </div>

              {/* Slash Separator */}
              <Slash className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-500/25 -rotate-[12deg]" />

              {/* Active tag */}
              <div className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-md sm:rounded-lg border border-violet-500/30 bg-white/70 cursor-default shadow-3xs">
                <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-violet-600 shadow-[0_0_5px_#7c3aed]" />
                <span className="text-[11px] sm:text-[12px] text-violet-800 font-extrabold tracking-wide">
                  {viewMode === 'bundle' ? 'Daftar Bundle' : 'Daftar Arsip'}
                </span>
                <div className="flex items-center justify-center bg-violet-100 rounded sm:rounded-md px-1 sm:px-1.5 py-0.5 ml-0.5 sm:ml-1 border border-violet-200">
                  <span className="text-[9px] sm:text-[10px] text-violet-700 font-extrabold leading-none">{currentActiveCount}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <div className="bg-black/10 p-1 rounded-xl border border-black/5 flex items-center gap-1 shadow-3xs">
              <button
                onClick={() => setViewMode('bundle')}
                className={`px-3.5 py-1.5 rounded-lg text-[11px] font-extrabold transition-all duration-300 flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${viewMode === 'bundle'
                  ? 'bg-white text-[#2c333f] shadow-xs'
                  : 'text-[#2c333f]/75 hover:text-[#2c333f] hover:bg-white/10'
                  }`}
              >
                <Boxes className="w-3.5 h-3.5" />
                <span>Daftar Bundle</span>
              </button>
              <button
                onClick={() => setViewMode('arsip')}
                className={`px-3.5 py-1.5 rounded-lg text-[11px] font-extrabold transition-all duration-300 flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${viewMode === 'arsip'
                  ? 'bg-white text-[#2c333f] shadow-xs'
                  : 'text-[#2c333f]/75 hover:text-[#2c333f] hover:bg-white/10'
                  }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Daftar Arsip</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Error / Success banners ── */}
        {error && (
          <div className="bg-red-50/80 border border-red-200 text-red-700 text-xs font-bold rounded-xl px-4 py-3 flex items-start gap-2 animate-fadeIn shrink-0">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError("")} className="text-red-400 hover:text-red-600 shrink-0 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        {success && (
          <div className="bg-emerald-50/80 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl px-4 py-3 flex items-start gap-2 animate-fadeIn shrink-0">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
            <span className="flex-1">{success}</span>
            <button onClick={() => setSuccess("")} className="text-emerald-500 hover:text-emerald-700 shrink-0 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ==================== VIEW MODE: DAFTAR BUNDLE ==================== */}
        {viewMode === "bundle" && (
          <div className="bg-[#dde3ea] border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6 min-h-[300px]">

            {/* Header row */}
            <div className="flex flex-col md:flex-row md:items-center justify-end gap-4 border-b border-slate-200 pb-4 select-none">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
                <div className="flex flex-row items-center gap-2.5 flex-1 w-full sm:w-auto">
                  {/* Search input for Bundles */}
                  <div className={`relative flex-1 sm:flex-none sm:w-72 p-[1.5px] rounded-lg transition-all duration-300 ${isBundleSearchFocused ? 'bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] shadow-xs' : 'bg-slate-200/90'}`}>
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
                    <input
                      type="text"
                      value={searchBundleQuery}
                      onChange={(e) => setSearchBundleQuery(e.target.value)}
                      onFocus={() => setIsBundleSearchFocused(true)}
                      onBlur={() => setIsBundleSearchFocused(false)}
                      className="w-full pl-8.5 pr-16 py-1.5 bg-white border-transparent rounded-[7px] text-xs font-semibold text-gray-755 placeholder-gray-400 focus:outline-none transition-all"
                      placeholder="Cari No. Bundle, Jenis Pelayanan."
                    />
                    {searchBundleQuery && (
                      <button onClick={() => setSearchBundleQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-655 z-10">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Filter Jenis Layanan (Popover Icon) — identical to Peneliti */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsBundleFilterDropdownOpen(!isBundleFilterDropdownOpen)}
                        className={`relative p-2 rounded-xl border transition-all duration-200 flex items-center justify-center cursor-pointer text-xs font-bold ${filterBundleJenisLayanan !== 'ALL'
                          ? 'bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] text-[#2c333f] border-transparent shadow-sm scale-105'
                          : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 text-slate-500 shadow-3xs'
                          }`}
                        title="Filter Jenis Layanan"
                      >
                        <ListFilter className="w-4 h-4" />
                        {filterBundleJenisLayanan !== 'ALL' && (
                          <span className="absolute -top-1.5 -right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
                        )}
                      </button>

                      {isBundleFilterDropdownOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsBundleFilterDropdownOpen(false)}
                          />
                          <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-60 bg-white border border-slate-100 rounded-xl shadow-lg py-2 z-50 animate-fadeIn text-xs text-slate-700 font-semibold flex flex-col gap-0.5">
                            <div className="px-3 py-1 text-[10px] font-extrabold text-slate-400 capitalize tracking-wider border-b border-slate-50 mb-1 select-none">
                              Pilih Jenis Layanan
                            </div>
                            {[
                              { val: 'ALL', label: 'Semua Layanan' },
                              { val: 'MUTASI_SEBAGIAN', label: 'Mutasi Sebagian' },
                              { val: 'MUTASI_HABIS_UPDATE', label: 'Mutasi Habis (Update)' },
                              { val: 'MUTASI_HABIS_REGULER', label: 'Mutasi Habis (Reguler)' },
                              { val: 'OBJEK_PAJAK_BARU', label: 'Objek Pajak Baru' },
                              { val: 'PEMBETULAN', label: 'Pembetulan' },
                              { val: 'PENGAKTIFAN', label: 'Pengaktifan' }
                            ].map((item) => {
                              const isSelected = filterBundleJenisLayanan === item.val;
                              return (
                                <button
                                  key={item.val}
                                  type="button"
                                  onClick={() => {
                                    setFilterBundleJenisLayanan(item.val);
                                    setCurrentBundlePage(1);
                                    setIsBundleFilterDropdownOpen(false);
                                  }}
                                  className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${isSelected ? 'text-indigo-650 bg-indigo-50/30 font-bold' : ''
                                    }`}
                                >
                                  <span>{item.label}</span>
                                  {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                                </button>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Tombol Refresh Manual */}
                    <button
                      type="button"
                      onClick={() => fetchBundles(true)}
                      disabled={isRefreshing || listLoading}
                      className="p-2 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-500 shadow-3xs transition-all cursor-pointer disabled:opacity-40"
                      title="Refresh Data"
                    >
                      <RefreshCw className={`w-4 h-4 transition-all duration-300 ${isRefreshing ? 'animate-spin text-indigo-500' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bundle grid — identik dengan PenelitiWorkspace */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {loading ? (
                <div className="col-span-full py-20 flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                  <span className="text-xs font-semibold text-gray-400">Memuat...</span>
                </div>
              ) : paginatedBundlesList.length === 0 ? (
                <div className="col-span-full py-20 text-center text-xs text-gray-400 font-medium italic select-none">
                  {searchBundleQuery
                    ? "Tidak ada bundle yang sesuai dengan pencarian."
                    : "Tidak ada bundle digitalisasi saat ini."}
                </div>
              ) : (
                paginatedBundlesList.map((b) => {
                  const isSelected = selectedBundle?.id === b.id;
                  const totalCount = (b.permohonan || []).reduce((acc: number, p: any) => {
                    if (p.jenisPermohonan === "MUTASI_SEBAGIAN") {
                      return acc + (p.dataBaru?.length || 0);
                    }
                    return acc + 1;
                  }, 0);
                  const isAllUploaded = b.permohonan.length > 0 && b.permohonan.every((p: any) => p.status === "ARCHIVED");

                  // Get config styling based on status (fallback to LOCKED)
                  const statusCfg = BUNDLE_STATUS_CONFIG[b.status] || BUNDLE_STATUS_CONFIG.LOCKED;

                  // Get style config for jenisPermohonan
                  const typeStyle = b.jenisPermohonan && BUNDLE_TYPE_STYLES[b.jenisPermohonan]
                    ? BUNDLE_TYPE_STYLES[b.jenisPermohonan]
                    : { bg: 'bg-slate-50', text: 'text-slate-400', border: 'border-slate-200/30' };

                  const renderStatusIcon = () => {
                    const iconClass = "w-2.5 h-2.5 shrink-0";
                    if (b.status === 'LOCKED') return <Lock className={iconClass} />;
                    if (b.status === 'IN_MANIFEST') return <Send className={iconClass} />;
                    return <Unlock className={iconClass} />;
                  };

                  return (
                    <div
                      key={b.id}
                      onClick={() => handleSelectBundle(b)}
                      className={`p-4 rounded-2xl border flex flex-col justify-between gap-3.5 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer relative overflow-hidden group select-none min-h-[110px] ${
                        isSelected
                          ? 'bg-gradient-to-br from-sky-50/50 via-[#9cb4fe]/5 to-white border-indigo-400 shadow-md ring-2 ring-indigo-400/20'
                          : `bg-white border-slate-200 hover:border-slate-350 hover:shadow-md ${statusCfg.shadow}`
                      }`}
                    >
                      {/* Top Row: Number & Count Badge */}
                      <div className="flex items-center justify-between gap-3 w-full">
                        <div className="flex items-center min-w-0 flex-1 gap-1.5">
                          <span className="text-[10px] sm:text-xs font-black text-slate-850 font-mono tracking-tight break-all whitespace-normal block" title={b.nomorBundle}>
                            {b.nomorBundle}
                          </span>
                          {isAllUploaded && (
                            <span className="bg-emerald-50 text-emerald-700 text-[8px] font-extrabold px-1.5 py-0.5 rounded border border-emerald-250 flex items-center gap-0.5 select-none shrink-0" title="Semua berkas selesai diunggah">
                              <Check className="w-2.5 h-2.5 text-emerald-600 stroke-[3.5px]" />
                              <span>SELESAI</span>
                            </span>
                          )}
                        </div>

                        {/* Count Badge */}
                        <span className="flex items-center justify-center bg-[#f25c54] text-white text-[11px] font-bold px-1.5 py-0.5 rounded-md leading-none shrink-0" title={`${totalCount} Berkas`}>
                          {totalCount}
                        </span>
                      </div>

                      {/* Bottom: Service Type Badge & Status / Actions */}
                      <div className="flex flex-col gap-2 pt-2.5 border-t border-slate-100/80">
                        <div className="flex items-center justify-between gap-2.5">
                          {/* Service Type Tag */}
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold border leading-none select-none tracking-wide uppercase ${typeStyle.bg} ${typeStyle.text} ${typeStyle.border}`} title={b.jenisPermohonan ? b.jenisPermohonan.replace(/_/g, ' ') : 'Umum'}>
                            {b.jenisPermohonan ? getAbbreviatedJenis(b.jenisPermohonan) : '—'}
                          </span>

                          <div className="flex items-center gap-2 shrink-0">
                            {/* Status Pill Badge */}
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold border leading-none uppercase tracking-wider flex items-center gap-1 shadow-3xs transition-all shrink-0 ${
                              b.status === 'LOCKED'
                                ? 'bg-slate-900 text-slate-100 border-slate-800'
                                : b.status === 'IN_MANIFEST'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            }`}>
                              {renderStatusIcon()}
                              <span>{b.status.toLowerCase()}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Table Footer / Pagination for Bundles */}
            <div className="px-5 py-3.5 border border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto rounded-xl select-none shadow-3xs shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-semibold text-gray-500 font-sans">
                  {filteredBundlesList.length > 0
                    ? `Menampilkan ${((activeBundlePage - 1) * itemsPerBundlePage) + 1}–${Math.min(activeBundlePage * itemsPerBundlePage, filteredBundlesList.length)} dari ${filteredBundlesList.length} bundle`
                    : 'Tidak ada data'}
                </span>
                {/* Items per page */}
                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-1.5 py-0.5">
                  {[8, 16, 32].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setItemsPerBundlePage(n)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${itemsPerBundlePage === n
                        ? 'bg-gradient-to-r from-[#7dd4fc] to-[#9cb4fe] text-[#1e2022] font-extrabold shadow-sm scale-105 z-10'
                        : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                      {n}
                    </button>
                  ))}
                  <span className="text-[10px] text-slate-400 font-semibold pl-0.5">/hal</span>
                </div>
              </div>

              {totalBundlePages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCurrentBundlePage(prev => Math.max(prev - 1, 1))}
                    disabled={activeBundlePage === 1}
                    className="p-1.5 rounded-lg border-transparent bg-white text-gray-500 hover:bg-[#f1f5f9] disabled:opacity-40 transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  {Array.from({ length: totalBundlePages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentBundlePage(page)}
                      className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${activeBundlePage === page
                        ? 'bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] text-[#1e2022] font-extrabold shadow-sm scale-105 z-10'
                        : 'border-transparent bg-white text-gray-500 hover:bg-[#f1f5f9]'
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCurrentBundlePage(prev => Math.min(prev + 1, totalBundlePages))}
                    disabled={activeBundlePage === totalBundlePages}
                    className="p-1.5 rounded-lg border-transparent bg-white text-gray-500 hover:bg-[#f1f5f9] disabled:opacity-40 transition-all cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== VIEW MODE: DAFTAR ARSIP ==================== */}
        {viewMode === "arsip" && (
          <div className="bg-[#dde3ea] rounded-2xl shadow-sm flex flex-col overflow-hidden min-h-[300px]">
            {selectedBundle ? (
              <div className="flex-1 flex flex-col overflow-hidden animate-fadeIn">

                {/* Bundle header banner — adaptasi dari print view Peneliti */}
                <div className="px-5 py-4 border-b border-gray-200/60 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
                  <div>
                    <h3 className="font-extrabold text-[13px] capitalize tracking-wider text-slate-700 font-display flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-black text-slate-900">{selectedBundle.nomorBundle}</span>
                      <span className="bg-indigo-50 text-indigo-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full select-none">
                        {(selectedBundle.permohonan || []).reduce((acc: number, p: any) => {
                          if (p.jenisPermohonan === "MUTASI_SEBAGIAN") {
                            return acc + (p.dataBaru?.length || 0);
                          }
                          return acc + 1;
                        }, 0)} Berkas
                      </span>
                    </h3>
                  </div>
                </div>

                {/* Permohonan table — identik kolom dengan PenelitiWorkspace, Aksi diganti */}
                <div className="flex-1 flex flex-col justify-between overflow-hidden">
                  <div className="px-5 pt-5 pb-5 bg-[#dde3ea] flex-1 flex flex-col gap-4 overflow-hidden">
                    <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white shadow-3xs flex flex-col flex-1">
                    <div className="flex-1 overflow-x-auto scrollbar-thin">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-[10px] font-extrabold text-slate-600 capitalize tracking-wider text-left border-b border-slate-200 whitespace-nowrap">
                            <th className="py-3 px-5 text-center w-12 min-w-[48px]">No</th>
                            <th className="py-3 px-2 text-center select-none w-10 min-w-[40px]">⭐</th>
                            <th className="py-3 px-5 min-w-[110px]">Tgl. Nopel</th>
                            <th className="py-3 px-5 min-w-[110px]">Tgl. Selesai</th>
                            <th className="py-3 px-5 min-w-[160px]">No. Pelayanan</th>
                            <th className="py-3 px-5 min-w-[180px]">Nomor Objek Pajak</th>
                            <th className="py-3 px-5 min-w-[150px]">Nama Pemohon</th>
                            <th className="py-3 px-5 min-w-[120px]">Jenis Layanan</th>
                            <th className="py-3 px-5 text-center min-w-[100px]">Status</th>
                            <th className="py-3 px-5 text-right pr-6 w-24 min-w-[96px]">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-xs font-semibold text-gray-700 bg-white">
                          {paginatedArsipList.length === 0 ? (
                            <tr>
                              <td colSpan={10} className="py-14 text-center text-slate-400 italic">
                                Bundle tidak memiliki permohonan.
                              </td>
                            </tr>
                          ) : (
                            paginatedArsipList.map((p: any, index: number) => {
                              const isFrozen = p.permintaanKoreksi && p.permintaanKoreksi.length > 0;
                              const needsReUpload = p.status === "BUNDLED" && p.arsipDigital?.some((ad: any) => ad.status === "SUPERSEDED" && ad.dataBaruId === null);
                              const isArchived = p.status === "ARCHIVED";
                              const activeArchive = p.arsipDigital?.find((ad: any) => ad.status === "ACTIVE" && ad.dataBaruId === null);
                              const itemNumber = (activeArsipPage - 1) * itemsPerArsipPage + index + 1;

                              const totalFractions = p.dataBaru?.length || 0;
                              const uploadedFractions = p.dataBaru?.filter((db: any) => p.arsipDigital?.some((ad: any) => ad.dataBaruId === db.id && ad.status === "ACTIVE")).length || 0;

                              const nopolDate = p.tanggalNoPelayanan
                                ? new Date(p.tanggalNoPelayanan).toLocaleDateString("id-ID", {
                                    day: "numeric", month: "short", year: "numeric",
                                  })
                                : "—";
                              const penyelesaianDate = p.tanggalPenyelesaian
                                ? new Date(p.tanggalPenyelesaian).toLocaleDateString("id-ID", {
                                    day: "numeric", month: "short", year: "numeric",
                                  })
                                : "—";

                              return (
                                <tr
                                  key={p.id}
                                  className={`hover:bg-slate-50 transition-colors duration-150 group relative text-xs font-semibold text-gray-700 ${
                                    isFrozen ? "bg-amber-50/20" : ""
                                  }`}
                                >
                                  {/* No */}
                                  <td className="py-4 px-5 text-center text-xs font-bold text-slate-500 font-mono">
                                    {itemNumber}
                                  </td>

                                  {/* ⭐ */}
                                  <td className="py-4 px-2 text-center">
                                    <Star className={`w-4 h-4 transition-all duration-200 inline ${
                                      p.isFavorite
                                        ? 'text-amber-500 fill-amber-500 drop-shadow-[0_0_6px_rgba(245,158,11,0.55)]'
                                        : 'text-slate-350'
                                    }`} />
                                  </td>

                                  {/* Tgl Nopel */}
                                  <td className="py-4 px-5 text-xs font-semibold text-slate-500 whitespace-nowrap">{nopolDate}</td>

                                  {/* Tgl Penyelesaian */}
                                  <td className="py-4 px-5 whitespace-nowrap">
                                    {p.tanggalPenyelesaian ? (
                                      <div className="flex items-center gap-1">
                                        {isOverdue(p.tanggalPenyelesaian, p.status) && (
                                          <AlertTriangle className="w-3 h-3 text-red-500 shrink-0" />
                                        )}
                                        <span className={`text-xs font-semibold ${
                                          isOverdue(p.tanggalPenyelesaian, p.status)
                                            ? 'text-red-600 font-bold'
                                            : 'text-slate-500'
                                        }`}>
                                          {penyelesaianDate}
                                        </span>
                                      </div>
                                    ) : "—"}
                                  </td>

                                  {/* No. Pelayanan */}
                                  <td className="py-4 px-5 min-w-[140px] group/cell relative">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-xs font-bold text-slate-700 font-mono tracking-tight">
                                        {p.nomorPelayanan || p.nomorPermohonan}
                                      </span>
                                      {isFrozen && (
                                        <span className="text-[8px] font-extrabold capitalize bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 select-none">
                                          <Clock className="w-2.5 h-2.5 shrink-0 animate-pulse" />
                                          Frozen
                                        </span>
                                      )}
                                      {p.jenisPermohonan !== "MUTASI_SEBAGIAN" && needsReUpload && !isFrozen && (
                                        <span className="text-[8px] font-extrabold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md select-none">
                                          Re-upload
                                        </span>
                                      )}
                                      <button
                                        onClick={(e) => handleCopy(e, p.nomorPelayanan || p.nomorPermohonan)}
                                        className="p-1 rounded opacity-0 group-hover/cell:opacity-100 hover:bg-slate-105 text-slate-400 hover:text-indigo-655 transition-all cursor-pointer flex items-center justify-center w-5 h-5 select-none"
                                        title="Salin Nomor"
                                      >
                                        {copiedText === (p.nomorPelayanan || p.nomorPermohonan) ? (
                                          <Check className="w-3.5 h-3.5 text-emerald-600 transition-all duration-200 transform scale-110" />
                                        ) : (
                                          <Copy className="w-3 h-3" />
                                        )}
                                      </button>
                                    </div>
                                  </td>

                                  {/* NOP */}
                                  <td className="py-4 px-5 min-w-[140px] group/cell relative">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-xs font-semibold text-slate-500 font-mono">
                                        {formatNop(p.nop)}
                                      </span>
                                      <button
                                        onClick={(e) => handleCopy(e, p.nop)}
                                        className="p-1.5 rounded opacity-0 group-hover/cell:opacity-100 hover:bg-slate-105 text-slate-400 hover:text-indigo-655 transition-all cursor-pointer flex items-center justify-center w-5 h-5 select-none"
                                        title="Salin NOP"
                                      >
                                        {copiedText === p.nop ? (
                                          <Check className="w-3.5 h-3.5 text-emerald-600 transition-all duration-200 transform scale-110" />
                                        ) : (
                                          <Copy className="w-3 h-3" />
                                        )}
                                      </button>
                                    </div>
                                  </td>

                                  {/* Nama WP */}
                                  <td className="py-4 px-5 group/cell relative">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-xs font-bold text-slate-700 whitespace-nowrap uppercase">
                                        {p.namaWajibPajak.toUpperCase()}
                                      </span>
                                      <button
                                        onClick={(e) => handleCopy(e, p.namaWajibPajak)}
                                        className="p-1 rounded opacity-0 group-hover/cell:opacity-100 hover:bg-slate-105 text-slate-400 hover:text-indigo-655 transition-all cursor-pointer flex items-center justify-center w-5 h-5 select-none"
                                        title="Salin Nama Pemohon"
                                      >
                                        {copiedText === p.namaWajibPajak ? (
                                          <Check className="w-3.5 h-3.5 text-emerald-600 transition-all duration-200 transform scale-110" />
                                        ) : (
                                          <Copy className="w-3 h-3" />
                                        )}
                                      </button>
                                    </div>
                                  </td>

                                  {/* Jenis */}
                                  <td className="py-4 px-5">
                                    <span
                                      className="text-[9px] font-bold text-slate-500 bg-slate-100 border border-slate-205 px-2.5 py-0.5 rounded capitalize font-sans tracking-wide select-none"
                                      title={p.jenisPermohonan?.replace(/_/g, " ")}
                                    >
                                      {getAbbreviatedJenis(p.jenisPermohonan)}
                                    </span>
                                  </td>

                                  {/* Status */}
                                  <td className="py-4 px-5 text-center">
                                    <div className="flex items-center justify-center">
                                      <span className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${getStatusBadgeClass(p.status)}`}>
                                        {toTitleCase(p.status).toUpperCase()}
                                      </span>
                                    </div>
                                  </td>

                                  {/* Aksi */}
                                  <td className="py-4 px-5 text-right pr-6">
                                    <div className="flex items-center justify-end gap-1.5">
                                      {isFrozen ? (
                                        <span className="text-[9px] font-extrabold px-2 py-1 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 whitespace-nowrap select-none">
                                          Menunggu Supervisor
                                        </span>
                                      ) : (
                                        <>
                                          {p.jenisPermohonan === "MUTASI_SEBAGIAN" ? (
                                            <>
                                              {/* Kelola Pecahan */}
                                              <button
                                                onClick={() => {
                                                  setFractionTargetPermohonan(p);
                                                  setShowFractionsModal(true);
                                                }}
                                                className={`p-1.5 rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-center shrink-0 border hover:scale-105 active:scale-95 ${
                                                  isArchived
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                                    : "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                                                }`}
                                                title="Kelola berkas pecahan (Mutasi Sebagian)"
                                              >
                                                <FolderOpen className="w-3.5 h-3.5" />
                                              </button>
                                            </>
                                          ) : (
                                            <>
                                              {/* Hidden file input per permohonan */}
                                              <input
                                                type="file"
                                                accept=".pdf"
                                                ref={(el) => { fileInputRefs.current[p.id] = el; }}
                                                onChange={(e) => handleUploadFile(p.id, e)}
                                                className="hidden"
                                                disabled={isFrozen || loading}
                                              />

                                              {/* Re-upload (BUNDLED + SUPERSEDED) */}
                                              {p.status === "BUNDLED" && needsReUpload && (
                                                <button
                                                  onClick={() => triggerFileInput(p.id)}
                                                  disabled={loading}
                                                  className="p-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg shadow-sm transition-all cursor-pointer flex items-center justify-center shrink-0"
                                                  title="Re-upload arsip PDF baru"
                                                >
                                                  <RotateCcw className="w-3.5 h-3.5" />
                                                </button>
                                              )}

                                              {/* Upload pertama kali (BUNDLED, tanpa SUPERSEDED) */}
                                              {p.status === "BUNDLED" && !needsReUpload && (
                                                <button
                                                  onClick={() => triggerFileInput(p.id)}
                                                  disabled={loading}
                                                  className="p-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg shadow-sm transition-all cursor-pointer flex items-center justify-center shrink-0"
                                                  title="Unggah arsip PDF"
                                                >
                                                  <FileSpreadsheet className="w-3.5 h-3.5" />
                                                </button>
                                              )}

                                              {/* Buka arsip (ARCHIVED) */}
                                              {isArchived && activeArchive && (
                                                <a
                                                  href={activeArchive.urlBlob}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="p-1.5 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg text-emerald-700 transition-all flex items-center justify-center shrink-0"
                                                  title={`v${activeArchive.versi} — Buka arsip PDF`}
                                                >
                                                  <FileCheck className="w-3.5 h-3.5" />
                                                </a>
                                              )}

                                              {/* Ganti file (ARCHIVED) */}
                                              {isArchived && (
                                                <button
                                                  onClick={() => triggerFileInput(p.id)}
                                                  disabled={loading}
                                                  className="p-1.5 bg-slate-50 border border-slate-200/60 hover:bg-slate-100 rounded-lg text-slate-500 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
                                                  title="Ganti file arsip"
                                                >
                                                  <FolderOpen className="w-3.5 h-3.5" />
                                                </button>
                                              )}
                                            </>
                                          )}

                                          {/* Kembalikan ke Peneliti */}
                                          <button
                                            onClick={() => openCorrectionModal(p)}
                                            disabled={loading}
                                            className="p-1.5 bg-slate-50 border border-slate-200/60 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 rounded-lg text-slate-400 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
                                            title="Kembalikan ke Peneliti"
                                          >
                                            <ArrowLeftRight className="w-3.5 h-3.5" />
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Table Footer / Pagination — identical to Penginput & Peneliti */}
                    <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 select-none shrink-0">
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-semibold text-gray-500 font-sans">
                          {permohonanList.length > 0
                            ? `Menampilkan ${((activeArsipPage - 1) * itemsPerArsipPage) + 1}–${Math.min(activeArsipPage * itemsPerArsipPage, permohonanList.length)} dari ${permohonanList.length} berkas`
                            : 'Tidak ada data'}
                        </span>
                        {/* Items per page */}
                        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-1.5 py-0.5">
                          {[10, 20, 50].map(n => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => {
                                setItemsPerArsipPage(n);
                                setCurrentArsipPage(1);
                              }}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${itemsPerArsipPage === n
                                ? 'bg-gradient-to-r from-[#7dd4fc] to-[#9cb4fe] text-[#1e2022] shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                              {n}
                            </button>
                          ))}
                          <span className="text-[10px] text-slate-400 font-semibold pl-0.5">/hal</span>
                        </div>
                      </div>

                      {totalArsipPages > 1 && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setCurrentArsipPage(prev => Math.max(prev - 1, 1))}
                            disabled={activeArsipPage === 1}
                            className="p-1.5 rounded-lg border-transparent bg-white text-gray-500 hover:bg-[#f1f5f9] disabled:opacity-40 transition-all cursor-pointer"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          {Array.from({ length: totalArsipPages }, (_, i) => i + 1).map(page => (
                            <button
                              type="button"
                              key={page}
                              onClick={() => setCurrentArsipPage(page)}
                              className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${activeArsipPage === page
                                ? 'bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] text-[#1e2022] font-extrabold shadow-sm scale-105 z-10'
                                : 'border-transparent bg-white text-gray-500 hover:bg-[#f1f5f9]'
                                }`}
                            >
                              {page}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => setCurrentArsipPage(prev => Math.min(prev + 1, totalArsipPages))}
                            disabled={activeArsipPage === totalArsipPages}
                            className="p-1.5 rounded-lg border-transparent bg-white text-gray-500 hover:bg-[#f1f5f9] disabled:opacity-40 transition-all cursor-pointer"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status watermark strip — identik dengan PenelitiWorkspace */}
                  {(() => {
                    const status = selectedBundle.status;
                    const isRevisi = status === "IN_MANIFEST";
                    const repeatedTexts = Array(45).fill(isRevisi ? "REVISI" : status);
                    return (
                      <div className={`w-full py-2 text-center text-[9px] font-bold tracking-widest uppercase select-none flex items-center justify-center gap-6 border-t overflow-hidden shrink-0 ${
                        isRevisi
                          ? "bg-amber-50/60 text-amber-700/75 border-amber-100/50"
                          : "bg-slate-100/60 text-slate-500/70 border-slate-200/50"
                      }`}>
                        <div className="flex items-center gap-6 whitespace-nowrap">
                          {repeatedTexts.map((text, i) => (
                            <React.Fragment key={i}>
                              <span>{text}</span>
                              {i < repeatedTexts.length - 1 && (
                                <span className="opacity-40 select-none">•</span>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            ) : (
              /* Empty state — belum ada bundle dipilih */
              <div className="flex-1 flex flex-col items-center justify-center py-28 px-8 text-center select-none">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-50 to-blue-100 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                  <Boxes className="w-7 h-7 text-indigo-400" />
                </div>
                <p className="text-sm font-bold text-gray-600 mb-1.5">Pilih bundle terlebih dahulu</p>
                <p className="text-xs text-gray-400 font-medium max-w-xs leading-relaxed mb-4">
                  Buka tab "Daftar Bundle", pilih bundle yang ingin diproses, dan daftar arsipnya akan tampil di sini.
                </p>
                <button
                  onClick={() => setViewMode("bundle")}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Boxes className="w-3.5 h-3.5" />
                  <span>Ke Daftar Bundle</span>
                </button>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ==================== MODAL: Kembalikan ke Peneliti ==================== */}
      {showCorrectionModal && correctionTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 select-none">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-150 overflow-hidden animate-scaleUp">

            {/* Modal Header */}
            <div className="bg-slate-50 border-b border-slate-100 px-5 py-4 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-red-400" />
                Kembalikan ke Peneliti
              </h3>
              <button
                onClick={() => { setShowCorrectionModal(false); setCorrectionTarget(null); }}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleRequestCorrection}>
              <div className="p-5 flex flex-col gap-4 text-xs">
                <div className="p-3.5 bg-red-50/60 border border-red-100 rounded-xl leading-relaxed text-red-800 font-medium">
                  <p>
                    Anda mengajukan pengembalian <strong>koreksi major</strong> untuk berkas NOP:{" "}
                    <strong>{formatNop(correctionTarget.nop)}</strong>.
                  </p>
                  <p className="text-[10px] text-red-600 mt-1.5 font-bold">
                    * Tindakan ini memerlukan persetujuan Supervisor dan akan mem-freeze permohonan hingga diputuskan.
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="catatan-koreksi" className="font-extrabold text-gray-755">
                    Alasan pengembalian <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="catatan-koreksi"
                    rows={4}
                    value={correctionReason}
                    onChange={(e) => setCorrectionReason(e.target.value)}
                    placeholder="Masukkan alasan detail (contoh: dokumen sobek, berkas tertukar, NOP tidak sesuai fisik...)"
                    className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:outline-none focus:border-indigo-400 focus:bg-white text-xs font-semibold rounded-xl px-3 py-2.5 transition-all text-gray-800 resize-none"
                    required
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="bg-slate-50 border-t border-slate-100 px-5 py-3.5 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => { setShowCorrectionModal(false); setCorrectionTarget(null); }}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading || !correctionReason.trim()}
                  className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:scale-95 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Ajukan pengembalian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: Detail Pecahan (Mutasi Sebagian) ==================== */}
      {mounted && showFractionsModal && fractionTargetPermohonan && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 select-none animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-white/20 flex flex-col animate-scaleUp max-h-[90vh]">
            
            {/* Gradient Header */}
            <div className="relative bg-gradient-to-br from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] px-6 pt-5 pb-6 select-none overflow-hidden">
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
              <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full bg-white/10" />
              <div className="relative flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="bg-white/25 rounded-lg p-1.5 shrink-0">
                    <FolderOpen className="w-3.5 h-3.5 text-[#2c333f]" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[9px] font-extrabold text-[#2c333f]/60 tracking-widest capitalize leading-none mb-1">Digitalisasi Pecahan</span>
                    <span className="text-sm font-extrabold text-[#2c333f] font-mono tracking-tight truncate leading-none">
                      {fractionTargetPermohonan.nomorPelayanan || fractionTargetPermohonan.nomorPermohonan}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowFractionsModal(false);
                    setFractionTargetPermohonan(null);
                  }}
                  className="bg-white/25 hover:bg-white/40 text-[#2c333f] p-1.5 rounded-xl transition-all cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4 max-h-[70vh]">

              {/* Info Box */}
              <div className="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-xl leading-relaxed text-indigo-900 text-[11px] font-semibold flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <span>
                  Silakan unggah dokumen PDF hasil scan untuk setiap pecahan di bawah ini. Status permohonan utama akan otomatis berubah menjadi <strong>TERARSIP (ARCHIVED)</strong> setelah semua pecahan selesai didigitalisasi.
                </span>
              </div>

              {/* Single File Input for Modal */}
              <input
                type="file"
                accept=".pdf"
                ref={fractionFileInputRef}
                onChange={(e) => {
                  if (activeFractionId && fractionTargetPermohonan) {
                    handleUploadFile(fractionTargetPermohonan.id, e, activeFractionId);
                  }
                }}
                className="hidden"
                disabled={loading}
              />

              {/* Fraction Cards List */}
              <div className="flex flex-col gap-3">
                {fractionTargetPermohonan.dataBaru?.map((db: any, idx: number) => {
                  const dbActiveArchive = fractionTargetPermohonan.arsipDigital?.find((ad: any) => ad.status === "ACTIVE" && ad.dataBaruId === db.id);
                  const dbNeedsReUpload = fractionTargetPermohonan.status === "BUNDLED" && fractionTargetPermohonan.arsipDigital?.some((ad: any) => ad.dataBaruId === db.id && ad.status === "SUPERSEDED");
                  const hasDbArchive = !!dbActiveArchive;
                  const isFrozen = fractionTargetPermohonan.permintaanKoreksi && fractionTargetPermohonan.permintaanKoreksi.length > 0;

                  return (
                    <div
                      key={db.id}
                      className="p-4 bg-slate-50/60 border border-slate-150 rounded-2xl flex flex-col gap-3 hover:bg-white hover:border-indigo-200 hover:shadow-2xs transition-all duration-200"
                    >
                      {/* Card Header */}
                      <div className="flex items-center justify-between border-b border-slate-150/60 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black text-indigo-655 bg-indigo-50/80 border border-indigo-150 px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                            Pecahan {idx + 1}
                          </span>
                          <span className={`inline-block text-[9px] font-extrabold px-2 py-0.5 rounded-full border leading-none ${
                            hasDbArchive 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-250/50' 
                              : dbNeedsReUpload 
                                ? 'bg-amber-50 text-amber-700 border-amber-250/50 animate-pulse' 
                                : 'bg-slate-100 text-slate-550 border-slate-200'
                          }`}>
                            {hasDbArchive ? 'TERARSIP' : dbNeedsReUpload ? 'RE-UPLOAD' : 'BELUM UNGGAH'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {isFrozen ? (
                            <span className="text-[9px] text-amber-600 font-extrabold bg-amber-50 px-2 py-0.5 rounded border border-amber-100 uppercase tracking-wide">
                              Frozen
                            </span>
                          ) : (
                            <>
                              {/* Upload pertama kali */}
                              {!hasDbArchive && !dbNeedsReUpload && (
                                <button
                                  onClick={() => {
                                    setActiveFractionId(db.id);
                                    setTimeout(() => fractionFileInputRef.current?.click(), 50);
                                  }}
                                  disabled={loading}
                                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-[10px] font-black rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1"
                                >
                                  <Upload className="w-3 h-3" />
                                  <span>Unggah</span>
                                </button>
                              )}

                              {/* Re-upload */}
                              {!hasDbArchive && dbNeedsReUpload && (
                                <button
                                  onClick={() => {
                                    setActiveFractionId(db.id);
                                    setTimeout(() => fractionFileInputRef.current?.click(), 50);
                                  }}
                                  disabled={loading}
                                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-[10px] font-black rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  <span>Re-upload</span>
                                </button>
                              )}

                              {/* Buka PDF */}
                              {hasDbArchive && dbActiveArchive && (
                                <a
                                  href={dbActiveArchive.urlBlob}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 bg-emerald-50 border border-emerald-250 hover:bg-emerald-100 rounded-lg text-emerald-700 transition-all flex items-center justify-center cursor-pointer shadow-3xs"
                                  title={`v${dbActiveArchive.versi} — Buka PDF`}
                                >
                                  <FileCheck className="w-3.5 h-3.5" />
                                </a>
                              )}

                              {/* Ganti file */}
                              {hasDbArchive && (
                                <button
                                  onClick={() => {
                                    setActiveFractionId(db.id);
                                    setTimeout(() => fractionFileInputRef.current?.click(), 50);
                                  }}
                                  disabled={loading}
                                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-655 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1 text-[10px] font-extrabold"
                                >
                                  <FolderOpen className="w-3.5 h-3.5 text-slate-450" />
                                  <span>Ganti</span>
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Card Content Properties */}
                      <div className="grid grid-cols-2 gap-3.5 text-xs font-semibold text-gray-800">
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase tracking-wide mb-0.5">Nama Pemilik Baru</span>
                          <span className="capitalize text-slate-800 font-bold">{db.namaPemilikBaru?.toLowerCase()}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase tracking-wide mb-0.5">Nomor Sertifikat Baru</span>
                          <span className="font-mono text-indigo-950 font-black">{db.sertifikatBaru || "—"}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase tracking-wide mb-0.5">Luas Tanah Baru</span>
                          <span className="text-slate-700 font-bold">{db.luasTanahBaru} m²</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase tracking-wide mb-0.5">Luas Bangunan Baru</span>
                          <span className="text-slate-700 font-bold">{db.luasBangunanBaru} m²</span>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-150 px-6 py-4 flex items-center justify-end select-none">
              <button
                type="button"
                onClick={() => {
                  setShowFractionsModal(false);
                  setFractionTargetPermohonan(null);
                }}
                className="px-5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}


