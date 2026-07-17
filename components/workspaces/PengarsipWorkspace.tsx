"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
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
  Lock,
  Unlock,
  Send,
  Folder,
  FolderLock,
  Copy,
  Check,
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

/** Skeleton untuk PengarsipWorkspace — premium tabbed layout (mengikuti PenelitiSkeleton) */
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

      {/* Content card skeleton */}
      <div className="bg-[#dde3ea] rounded-2xl shadow-sm flex flex-col overflow-hidden min-h-[300px]">
        <div className="p-5 border-b border-gray-200/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <SkeletonBox width="w-36" height="h-4" rounded="rounded-full" />
          <div className="w-72 h-8 bg-gray-200 animate-pulse rounded-lg" />
        </div>
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-gray-200/60">
                {["No", "⭐", "Tanggal", "No. Pelayanan", "NOP", "Wajib Pajak", "Layanan", "Status", "Aksi"].map((h) => (
                  <th key={h} className="py-3 px-5">
                    <SkeletonText width="w-16" height="h-2.5" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="py-4 px-5 w-12"><SkeletonText width="w-4" height="h-3" /></td>
                  <td className="py-4 px-5 w-10 text-center"><SkeletonText width="w-4" height="h-3" /></td>
                  <td className="py-4 px-5"><SkeletonText width="w-20" height="h-3" /></td>
                  <td className="py-4 px-5 min-w-[140px]">
                    <SkeletonText width="w-36" height="h-3" />
                  </td>
                  <td className="py-4 px-5 min-w-[140px]">
                    <SkeletonText width="w-28" height="h-2.5" />
                  </td>
                  <td className="py-4 px-5"><SkeletonText width={i % 2 === 0 ? "w-28" : "w-24"} height="h-3" /></td>
                  <td className="py-4 px-5"><SkeletonBadge width="w-10" /></td>
                  <td className="py-4 px-5"><SkeletonBadge width="w-16" /></td>
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-7 h-7 rounded-lg bg-gray-200 animate-pulse" />
                      <div className="w-7 h-7 rounded-lg bg-gray-200 animate-pulse" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const formatNop = (nop: string) => {
  if (!nop || nop.length !== 18) return nop;
  return `${nop.slice(0, 2)}.${nop.slice(2, 4)}.${nop.slice(4, 7)}.${nop.slice(7, 10)}.${nop.slice(10, 13)}-${nop.slice(13, 17)}.${nop.slice(17)}`;
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
  MUTASI_SEBAGIAN: { bg: 'bg-indigo-50/80', text: 'text-indigo-700', border: 'border-indigo-150' },
  MUTASI_HABIS_UPDATE: { bg: 'bg-emerald-50/80', text: 'text-emerald-700', border: 'border-emerald-150' },
  MUTASI_HABIS_REGULER: { bg: 'bg-sky-50/80', text: 'text-sky-750', border: 'border-sky-150' },
  OBJEK_PAJAK_BARU: { bg: 'bg-amber-50/80', text: 'text-amber-700', border: 'border-amber-150' },
  PEMBETULAN: { bg: 'bg-purple-50/80', text: 'text-purple-700', border: 'border-purple-150' },
  PENGAKTIFAN: { bg: 'bg-teal-50/80', text: 'text-teal-700', border: 'border-teal-150' },
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
  const itemsPerBundlePage = 8;

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

  // ── File inputs
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Reset arsip pagination when selectedBundle changes
  useEffect(() => {
    setCurrentArsipPage(1);
  }, [selectedBundle?.id]);

  // Reset bundle pagination when search changes
  useEffect(() => {
    setCurrentBundlePage(1);
  }, [searchBundleQuery]);

  // ── Computed: filtered + paginated bundles
  const filteredBundlesList = useMemo(() => {
    return bundlesList.filter((b) =>
      b.nomorBundle.toLowerCase().includes(searchBundleQuery.toLowerCase())
    );
  }, [bundlesList, searchBundleQuery]);

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

  // ── Data fetch
  const fetchBundles = async () => {
    setListLoading(true);
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
      } else {
        setError(res.error || "Gagal mengambil daftar bundle.");
      }
    } catch (err) {
      setError("Kesalahan koneksi ke server.");
    } finally {
      setListLoading(false);
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
  const handleUploadFile = async (permohonanId: string, event: React.ChangeEvent<HTMLInputElement>) => {
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

    try {
      const formData = new FormData();
      formData.append("permohonanId", permohonanId);
      formData.append("file", file);

      const res: any = await uploadArsipDigital(formData);
      if (res.success) {
        setSuccess("Arsip digital berhasil diunggah!");
        await fetchBundles();
        if (fileInputRefs.current[permohonanId]) {
          fileInputRefs.current[permohonanId]!.value = "";
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

  const triggerFileInput = (permohonanId: string) => {
    if (fileInputRefs.current[permohonanId]) {
      fileInputRefs.current[permohonanId]!.click();
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

        {/* ── Header card — gradient + tab switcher (identik dengan PenelitiWorkspace) ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] p-5 rounded-2xl shadow-md transition-all duration-300">
          <div className="flex items-center gap-2.5 text-xs font-bold tracking-wider font-display select-none">
            <div className="flex items-center gap-1.5 text-[#2c333f]/80 hover:text-[#2c333f] transition-colors">
              <span>Tugas Saya</span>
            </div>
            <span className="text-[#2c333f]/50 font-medium select-none">&gt;</span>
            <div className="flex items-center gap-1.5 bg-white/40 border border-white/50 px-2.5 py-1 rounded-lg shadow-3xs animate-fadeIn">
              <span className="font-extrabold capitalize text-[#2c333f]">
                {viewMode === "bundle" ? "daftar bundle" : "daftar arsip"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <div className="bg-black/10 p-1 rounded-xl border border-black/5 flex items-center gap-1 shadow-3xs">
              <button
                onClick={() => setViewMode("bundle")}
                className={`px-3.5 py-1.5 rounded-lg text-[11px] font-extrabold transition-all duration-300 flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                  viewMode === "bundle"
                    ? "bg-white text-[#2c333f] shadow-xs"
                    : "text-[#2c333f]/75 hover:text-[#2c333f] hover:bg-white/10"
                }`}
              >
                <Boxes className="w-3.5 h-3.5" />
                <span>Daftar Bundle</span>
              </button>
              <button
                onClick={() => setViewMode("arsip")}
                className={`px-3.5 py-1.5 rounded-lg text-[11px] font-extrabold transition-all duration-300 flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                  viewMode === "arsip"
                    ? "bg-white text-[#2c333f] shadow-xs"
                    : "text-[#2c333f]/75 hover:text-[#2c333f] hover:bg-white/10"
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Daftar Arsip</span>
              </button>
            </div>
            {/* Refresh icon removed */}
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4 select-none">
              <div>
                <h2 className="font-extrabold text-[13px] capitalize tracking-wider text-slate-700 font-display">
                  Daftar Bundle Digitalisasi
                </h2>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
                {/* Search bundle */}
                <div className={`relative w-full sm:w-56 p-[1.5px] rounded-lg transition-all duration-300 ${
                  isBundleSearchFocused
                    ? "bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] shadow-xs"
                    : "bg-slate-200/90"
                }`}>
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 z-10" />
                  <input
                    type="text"
                    value={searchBundleQuery}
                    onChange={(e) => setSearchBundleQuery(e.target.value)}
                    onFocus={() => setIsBundleSearchFocused(true)}
                    onBlur={() => setIsBundleSearchFocused(false)}
                    className="w-full pl-7.5 pr-8 py-1 bg-white border-transparent rounded-[7px] text-[11px] font-semibold text-gray-755 placeholder-gray-400 focus:outline-none transition-all"
                    placeholder="Cari nomor bundle..."
                  />
                  {searchBundleQuery && (
                    <button
                      onClick={() => setSearchBundleQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-655 z-10 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
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
                  const isRevisi = b.status === "IN_MANIFEST";

                  const reuploadNeeded = b.permohonan.filter(
                    (p: any) => p.status === "BUNDLED" && p.arsipDigital.some((ad: any) => ad.status === "SUPERSEDED")
                  ).length;
                  const archivedCount = b.permohonan.filter((p: any) => p.status === "ARCHIVED").length;
                  const totalCount = b.permohonan.length;

                  // Get config styling based on status (fallback to LOCKED)
                  const statusCfg = BUNDLE_STATUS_CONFIG[b.status] || BUNDLE_STATUS_CONFIG.LOCKED;

                  // Get style config for jenisPermohonan
                  const typeStyle = b.jenisPermohonan && BUNDLE_TYPE_STYLES[b.jenisPermohonan]
                    ? BUNDLE_TYPE_STYLES[b.jenisPermohonan]
                    : { bg: 'bg-slate-50', text: 'text-slate-400', border: 'border-slate-200/30' };

                  const renderFolderIconOrCount = () => {
                    const iconClass = `w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                      isSelected ? 'text-indigo-655 font-bold' : b.status === 'LOCKED' ? 'text-slate-400' : 'text-indigo-500'
                    }`;
                    if (totalCount > 0) {
                      return (
                        <span className={`w-5 h-5 flex items-center justify-center text-[10px] font-black rounded-full leading-none transition-all duration-300 group-hover:scale-110 ${
                          isSelected
                            ? 'bg-gradient-to-r from-sky-500 to-[#9cb4fe] text-white shadow-sm font-extrabold'
                            : b.status === 'LOCKED'
                              ? 'bg-slate-500 text-slate-50 font-bold'
                              : 'bg-[#9cb4fe] text-white shadow-2xs font-extrabold'
                        }`}>
                          {totalCount}
                        </span>
                      );
                    }

                    if (b.status === 'LOCKED') return <FolderLock className={iconClass} />;
                    return <Folder className={iconClass} />;
                  };

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
                      className={`p-4 rounded-2xl border flex flex-col justify-between gap-3.5 transition-all duration-300 hover:-translate-y-1 cursor-pointer relative overflow-hidden group select-none min-h-[110px] ${
                        isSelected
                          ? 'bg-gradient-to-br from-sky-50/60 via-[#9cb4fe]/10 to-white/90 border-[#9cb4fe]/60 shadow-md ring-2 ring-[#7dd4fc]/25'
                          : `bg-white/85 border-slate-200 hover:border-slate-350 hover:shadow-md ${statusCfg.shadow}`
                      }`}
                    >
                      {/* Status Pill Badge (Top-Right) */}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold border leading-none uppercase tracking-wider flex items-center gap-1 shadow-3xs transition-all ${
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

                      <div className="flex gap-2.5 items-start">
                        {/* Left: Premium Folder Icon Wrapper */}
                        <div className={`p-2 rounded-xl border flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-sky-50/80 border-sky-150'
                            : b.status === 'LOCKED'
                              ? 'bg-slate-100 border-slate-200'
                              : 'bg-slate-50 border-slate-200/40'
                        }`}>
                          {renderFolderIconOrCount()}
                        </div>

                        {/* Right: Info */}
                        <div className="flex flex-col min-w-0 flex-1 justify-center pr-12">
                          <span className="text-xs font-black text-slate-850 font-mono tracking-tight truncate block" title={b.nomorBundle}>
                            {b.nomorBundle}
                          </span>
                          <div className="mt-1">
                            {isRevisi ? (
                              <span className="text-[10px] text-amber-700 font-bold select-none bg-amber-50 px-2 py-0.5 rounded-lg w-fit border border-amber-100/50">
                                {reuploadNeeded} perlu re-upload
                              </span>
                            ) : (
                              <span className="text-[10px] text-indigo-650 font-bold select-none bg-indigo-50 px-2 py-0.5 rounded-lg w-fit border border-indigo-100/50">
                                {archivedCount}/{totalCount} terarsip
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Bottom: Service Type Badge & Action */}
                      <div className="flex flex-col gap-2 pt-2 border-t border-slate-100/80">
                        <div className="flex items-center justify-between gap-2.5">
                          {/* Service Type Tag */}
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold border leading-none select-none tracking-wide uppercase ${typeStyle.bg} ${typeStyle.text} ${typeStyle.border}`} title={b.jenisPermohonan ? b.jenisPermohonan.replace(/_/g, ' ') : 'Umum'}>
                            {b.jenisPermohonan ? getAbbreviatedJenis(b.jenisPermohonan) : '—'}
                          </span>

                          {isSelected && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setViewMode("arsip"); }}
                              className="text-[9px] text-indigo-600 font-extrabold hover:underline flex items-center gap-0.5 cursor-pointer animate-fadeIn"
                            >
                              <span>Lihat Arsip</span>
                              <ArrowRight className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination bundles */}
            {totalBundlePages > 1 && (
              <div className="px-5 py-3 border-t border-slate-200/55 flex items-center justify-between mt-auto">
                <span className="text-[11px] font-semibold text-gray-400 select-none">
                  Menampilkan {((activeBundlePage - 1) * itemsPerBundlePage) + 1}–{Math.min(activeBundlePage * itemsPerBundlePage, filteredBundlesList.length)} dari {filteredBundlesList.length} bundle
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCurrentBundlePage((prev) => Math.max(prev - 1, 1))}
                    disabled={activeBundlePage === 1}
                    className="p-1.5 rounded-lg border-transparent bg-white text-gray-500 hover:bg-[#f1f5f9] disabled:opacity-40 transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  {Array.from({ length: totalBundlePages }, (_, i) => i + 1).map((page) => (
                    <button
                      type="button"
                      key={page}
                      onClick={() => setCurrentBundlePage(page)}
                      className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        activeBundlePage === page
                          ? "bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] text-[#1e2022] font-extrabold shadow-sm scale-105 z-10"
                          : "border-transparent bg-white text-gray-500 hover:bg-[#f1f5f9]"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCurrentBundlePage((prev) => Math.min(prev + 1, totalBundlePages))}
                    disabled={activeBundlePage === totalBundlePages}
                    className="p-1.5 rounded-lg border-transparent bg-white text-gray-500 hover:bg-[#f1f5f9] disabled:opacity-40 transition-all cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
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
                        {(selectedBundle.permohonan || []).length} Berkas
                      </span>
                    </h3>
                    <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                      Peneliti:{" "}
                      <span className="text-gray-600 font-semibold">{selectedBundle.peneliti?.name || "—"}</span>
                      {" · "}
                      {new Date(selectedBundle.createdAt).toLocaleDateString("id-ID", {
                        day: "2-digit", month: "short", year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {/* Permohonan table — identik kolom dengan PenelitiWorkspace, Aksi diganti */}
                <div className="flex-1 flex flex-col justify-between overflow-hidden">
                  <div className="px-5 pt-5 pb-5 bg-[#dde3ea] flex-1 flex flex-col gap-4 overflow-hidden">
                    <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white shadow-3xs flex flex-col flex-1">
                    <div className="flex-1 overflow-x-auto scrollbar-thin">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-[10px] font-extrabold text-slate-600 capitalize tracking-wider text-left border-b border-slate-200">
                            <th className="py-3 px-5 text-center">No</th>
                            <th className="py-3 px-2 text-center select-none w-10">⭐</th>
                            <th className="py-3 px-5">Tgl. Nopel</th>
                            <th className="py-3 px-5">Tgl. Selesai</th>
                            <th className="py-3 px-5">No. Pelayanan</th>
                            <th className="py-3 px-5">Nomor Objek Pajak</th>
                            <th className="py-3 px-5">Nama Pemohon</th>
                            <th className="py-3 px-5">Jenis Layanan</th>
                            <th className="py-3 px-5 text-center">Status</th>
                            <th className="py-3 px-5 text-right pr-6 w-32">Aksi</th>
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
                              const needsReUpload = p.status === "BUNDLED" && p.arsipDigital?.some((ad: any) => ad.status === "SUPERSEDED");
                              const isArchived = p.status === "ARCHIVED";
                              const activeArchive = p.arsipDigital?.find((ad: any) => ad.status === "ACTIVE");
                              const itemNumber = (activeArsipPage - 1) * itemsPerArsipPage + index + 1;

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
                                        : 'text-slate-300'
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
                                      {needsReUpload && !isFrozen && (
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
                                      <span className="text-xs font-bold text-slate-700 whitespace-nowrap capitalize">
                                        {p.namaWajibPajak.toLowerCase()}
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
                                    <div className="flex items-center justify-center gap-1">
                                      <span className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${getStatusBadgeClass(p.status)}`}>
                                        {toTitleCase(p.status).toUpperCase()}
                                      </span>
                                    </div>
                                  </td>

                                  {/* Aksi */}
                                  <td className="py-4 px-5 text-right pr-6">
                                    {/* Hidden file input per permohonan */}
                                    <input
                                      type="file"
                                      accept=".pdf"
                                      ref={(el) => { fileInputRefs.current[p.id] = el; }}
                                      onChange={(e) => handleUploadFile(p.id, e)}
                                      className="hidden"
                                      disabled={isFrozen || loading}
                                    />

                                    <div className="flex items-center justify-end gap-1.5">
                                      {isFrozen ? (
                                        <span className="text-[9px] font-extrabold px-2 py-1 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 whitespace-nowrap">
                                          Menunggu Supervisor
                                        </span>
                                      ) : (
                                        <>
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
    </div>
  );
}


