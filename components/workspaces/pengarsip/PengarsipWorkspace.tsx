"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  Calendar,
  User,
} from "lucide-react";
import {
  getDigitizationBundles,
  getBundleDetails,
  uploadArsipDigital,
  ajukanKembalikanKePeneliti,
} from "@/app/actions/pengarsip";
import { togglePermohonanFavorite } from "@/app/actions/penginput";
import { useDashboard } from "@/context/DashboardContext";
import {
  SkeletonBox,
  SkeletonText,
  SkeletonBadge,
} from "@/components/skeletons/SkeletonBase";
import { DetailsModal } from "@/components/workspaces/shared/DetailsModal";

type ViewMode = "bundle" | "arsip";

/** Skeleton komponen dasar KPI Strip & Tabs untuk PengarsipWorkspace */
function PengarsipBaseHeaderSkeleton() {
  return (
    <>
      {/* TIER 1: KPI STATS STRIP (4 Cards) */}
      <div className="bg-white border border-slate-200/90 rounded-md p-1.5 shadow-3xs select-none">
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-3 px-3.5 flex items-center justify-between gap-2 rounded-md">
              <div className="flex flex-col gap-1.5 w-full">
                <SkeletonBox width="w-20" height="h-3" rounded="rounded-sm" />
                <SkeletonBox width="w-12" height="h-5" rounded="rounded-sm" />
              </div>
              <SkeletonBox width="w-8" height="h-4" rounded="rounded-sm" />
            </div>
          ))}
        </div>
      </div>

      {/* TIER 2: VIEW MODE SWITCHER TABS (2 Equal Tabs) */}
      <div className="bg-slate-100/90 border border-slate-200/80 p-1 rounded-md grid grid-cols-2 gap-1 shadow-3xs select-none">
        <SkeletonBox width="w-full" height="h-8" rounded="rounded-md" />
        <SkeletonBox width="w-full" height="h-8" rounded="rounded-md" />
      </div>
    </>
  );
}

/** Skeleton presisi untuk Tab 1: Daftar Bundle */
export function PengarsipBundleSkeleton() {
  return (
    <div className="w-full font-sans select-none flex flex-col gap-4 animate-fadeIn">
      <PengarsipBaseHeaderSkeleton />

      {/* CARD CONTENT: BUNDLE GRID VIEW */}
      <div className="bg-white border border-slate-200/90 rounded-md p-5 sm:p-6 shadow-3xs flex flex-col gap-6 min-h-[300px]">
        {/* Action toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <SkeletonBox width="w-full md:w-[403px]" height="h-10" rounded="rounded-lg" />
          <div className="flex items-center gap-2">
            <SkeletonBox width="w-10" height="h-10" rounded="rounded-lg" />
          </div>
        </div>

        {/* Jenis Layanan filter pills */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <SkeletonBox key={i} width={i === 0 ? "w-16" : "w-32"} height="h-7" rounded="rounded-full" />
          ))}
        </div>

        {/* Grid of bundle cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="p-4 rounded-2xl border border-slate-200/90 bg-white flex flex-col justify-between gap-3.5 min-h-[110px]">
              <div className="flex items-center justify-between gap-3">
                <SkeletonBox width="w-28" height="h-3.5" rounded="rounded-sm" />
                <SkeletonBox width="w-6" height="h-5" rounded="rounded-full" />
              </div>
              <div className="flex items-center justify-between gap-2.5 pt-2.5 border-t border-slate-100">
                <SkeletonBox width="w-16" height="h-4" rounded="rounded-md" />
                <SkeletonBox width="w-16" height="h-4" rounded="rounded-full" />
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Footer */}
        <div className="px-5 py-3.5 border border-slate-200/80 bg-slate-50 flex items-center justify-between mt-auto rounded-xl">
          <SkeletonText width="w-36" height="h-3" />
          <SkeletonBox width="w-32" height="h-7" rounded="rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/** Skeleton presisi untuk Tab 2: Daftar Berkas Arsip */
export function PengarsipArsipSkeleton() {
  return (
    <div className="w-full font-sans select-none flex flex-col gap-4 animate-fadeIn">
      <PengarsipBaseHeaderSkeleton />

      {/* CARD CONTENT: ARSIP TABLE VIEW */}
      <div className="bg-white border border-slate-200/90 rounded-md shadow-3xs flex flex-col overflow-hidden min-h-[400px]">
        {/* Action Toolbar */}
        <div className="p-3 border-b border-slate-200/80 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-3xs">
          <SkeletonBox width="w-full md:w-[403px]" height="h-10" rounded="rounded-lg" />
          <div className="flex items-center gap-2">
            <SkeletonBox width="w-28" height="h-10" rounded="rounded-lg" />
            <SkeletonBox width="w-10" height="h-10" rounded="rounded-lg" />
          </div>
        </div>

        {/* Table Canvas */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200">
                <th className="py-3 px-4 w-12"><SkeletonText width="w-5" height="h-2.5" /></th>
                <th className="py-3 px-2 text-center w-10"><SkeletonText width="w-4" height="h-2.5" /></th>
                <th className="py-3 px-4 min-w-[100px]"><SkeletonText width="w-16" height="h-2.5" /></th>
                <th className="py-3 px-4 min-w-[100px]"><SkeletonText width="w-16" height="h-2.5" /></th>
                <th className="py-3 px-4 min-w-[150px]"><SkeletonText width="w-20" height="h-2.5" /></th>
                <th className="py-3 px-4 min-w-[210px]"><SkeletonText width="w-28" height="h-2.5" /></th>
                <th className="py-3 px-4 min-w-[170px]"><SkeletonText width="w-20" height="h-2.5" /></th>
                <th className="py-3 px-4 min-w-[120px]"><SkeletonText width="w-20" height="h-2.5" /></th>
                <th className="py-3 px-4 text-center min-w-[100px]"><SkeletonText width="w-12" height="h-2.5" /></th>
                <th className="py-3 px-4 text-center w-28"><SkeletonText width="w-10" height="h-2.5" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Array.from({ length: 7 }).map((_, i) => (
                <tr key={i}>
                  <td className="py-3 px-4 text-center"><SkeletonText width="w-4" height="h-3" /></td>
                  <td className="py-3 px-2 text-center"><SkeletonBox width="w-4" height="h-4" rounded="rounded-full" /></td>
                  <td className="py-3 px-4"><SkeletonText width="w-20" height="h-3" /></td>
                  <td className="py-3 px-4"><SkeletonText width="w-20" height="h-3" /></td>
                  <td className="py-3 px-4"><SkeletonText width="w-28" height="h-3" /></td>
                  <td className="py-3 px-4"><SkeletonText width="w-36" height="h-3" /></td>
                  <td className="py-3 px-4"><SkeletonText width={i % 2 === 0 ? "w-28" : "w-32"} height="h-3" /></td>
                  <td className="py-3 px-4"><SkeletonBadge width="w-20" /></td>
                  <td className="py-3 px-4 text-center"><SkeletonBadge width="w-16" /></td>
                  <td className="py-3 px-4 text-center"><SkeletonBox width="w-20" height="h-8" rounded="rounded-lg" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-5 py-3 border-t border-slate-200/90 bg-slate-50 flex items-center justify-between mt-auto">
          <SkeletonText width="w-36" height="h-3" />
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonBox key={i} width="w-7" height="h-7" rounded="rounded-lg" />
            ))}
          </div>
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
  MUTASI_SEBAGIAN: { bg: 'bg-[#00a389]/10', text: 'text-[#008f78]', border: 'border-[#00a389]/20' },
  MUTASI_HABIS_UPDATE: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  MUTASI_HABIS_REGULER: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
  OBJEK_PAJAK_BARU: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  PEMBETULAN: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  PENGAKTIFAN: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
};

const BUNDLE_STATUS_CONFIG: Record<string, { bg: string; text: string; border: string; dot: string; shadow: string }> = {
  DRAFT: {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
    shadow: 'hover:shadow-slate-200/40'
  },
  LOCKED: {
    bg: 'bg-slate-900',
    text: 'text-slate-100',
    border: 'border-slate-800',
    dot: 'bg-amber-400',
    shadow: 'hover:shadow-slate-300/20'
  },
  IN_MANIFEST: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    shadow: 'hover:shadow-emerald-150/40'
  },
  ARCHIVED: {
    bg: 'bg-teal-50',
    text: 'text-[#008f78]',
    border: 'border-teal-200',
    dot: 'bg-[#00a389]',
    shadow: 'hover:shadow-teal-150/40'
  },
};

const STATUS_LABEL_MAP: Record<string, string> = {
  SUBMITTED: 'Diajukan',
  REVISION: 'Revisi',
  BUNDLED: 'Terbundel',
  LOCKED: 'Terkunci',
  IN_MANIFEST: 'Dimanifest',
  ARCHIVED: 'Diarsipkan',
  COMPLETED: 'Selesai',
  REJECTED: 'Ditolak',
  DRAFT: 'Draf',
  VOID: 'Dibatalkan',
  SENT: 'Dikirim',
};

const getStatusLabel = (status: string) => STATUS_LABEL_MAP[status] || status;

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'SUBMITTED':
      return 'bg-[#00a389]/10 text-[#008f78] border-[#00a389]/20';
    case 'REVISION':
      return 'bg-amber-100 text-amber-800 border-amber-200/50 animate-pulse';
    case 'BUNDLED':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200/50';
    case 'LOCKED':
      return 'bg-slate-900 text-slate-100 border-slate-700';
    case 'IN_MANIFEST':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200/50';
    case 'ARCHIVED':
      return 'bg-teal-100 text-[#008f78] border-teal-200/50';
    case 'COMPLETED':
      return 'bg-cyan-100 text-cyan-800 border-cyan-200/50';
    case 'REJECTED':
      return 'bg-rose-100 text-rose-800 border-rose-200/50';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200/50';
  }
};

const isOverdue = (dateStr: string | null | undefined, status: string): boolean => {
  if (!dateStr) return false;
  if (status === 'COMPLETED' || status === 'REJECTED' || status === 'ARCHIVED') return false;
  return new Date(dateStr) < new Date();
};

export default function PengarsipWorkspace() {
  const { showConfirm } = useDashboard();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read URL query parameter ?tab=...&view=bundle|arsip
  const viewParam = searchParams.get('view');

  // View mode state ('bundle' | 'arsip') initialized from URL param
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (viewParam === 'arsip') return 'arsip';
    return 'bundle';
  });

  // Sync viewMode when URL query params change (e.g. Browser Back/Forward buttons)
  useEffect(() => {
    if (viewParam === 'arsip') {
      setViewMode('arsip');
    } else {
      setViewMode('bundle');
    }
  }, [viewParam]);

  // Helper to switch view mode and update URL query param
  const handleSwitchTab = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', mode);
    router.push(`/?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  // State Data Bundles
  const [bundlesList, setBundlesList] = useState<any[]>([]);
  const [selectedBundle, setSelectedBundle] = useState<any | null>(null);

  // State Data All Permohonan (system-wide)
  const [allPermohonanList, setAllPermohonanList] = useState<any[]>([]);

  // State Data Permohonan (pada bundle aktif)
  const [permohonanList, setPermohonanList] = useState<any[]>([]);

  // State Loading & Refetch
  const [loading, setLoading] = useState<boolean>(false);
  const [listLoading, setListLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // Search & Filter State
  const [searchBundleQuery, setSearchBundleQuery] = useState<string>("");
  const [isBundleSearchFocused, setIsBundleSearchFocused] = useState<boolean>(false);
  const [filterBundleJenisLayanan, setFilterBundleJenisLayanan] = useState<string>("ALL");
  const [filterBundleStatus, setFilterBundleStatus] = useState<string>("ALL");

  const [searchArsipQuery, setSearchArsipQuery] = useState<string>("");
  const [isArsipSearchFocused, setIsArsipSearchFocused] = useState<boolean>(false);

  // Pagination State
  const [currentBundlePage, setCurrentBundlePage] = useState<number>(1);
  const [itemsPerBundlePage, setItemsPerBundlePage] = useState<number>(8);

  const [currentArsipPage, setCurrentArsipPage] = useState<number>(1);
  const [itemsPerArsipPage, setItemsPerArsipPage] = useState<number>(10);

  // Modal Detail Permohonan
  const [globalSelectedRequest, setGlobalSelectedRequest] = useState<any | null>(null);

  // Modal Koreksi / Pengembalian
  const [showCorrectionModal, setShowCorrectionModal] = useState<boolean>(false);
  const [correctionTarget, setCorrectionTarget] = useState<any | null>(null);
  const [correctionReason, setCorrectionReason] = useState<string>("");

  // Modal Kelola Pecahan (Mutasi Sebagian)
  const [showFractionsModal, setShowFractionsModal] = useState<boolean>(false);
  const [fractionTargetPermohonan, setFractionTargetPermohonan] = useState<any | null>(null);
  const [activeFractionId, setActiveFractionId] = useState<string | null>(null);

  // Copy Feedback State
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // File Inputs Refs
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const fractionFileInputRef = useRef<HTMLInputElement | null>(null);

  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleCopy = useCallback((e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 1000);
  }, []);

  // Fetch semua bundle digitalisasi
  const fetchBundles = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    else setListLoading(true);
    setError("");

    try {
      const res = await getDigitizationBundles();
      if (res.success && 'list' in res && res.list) {
        setBundlesList(res.list);
        if ('allPermohonan' in res && (res as any).allPermohonan) {
          setAllPermohonanList((res as any).allPermohonan);
        }
      } else {
        setError('error' in res && res.error ? res.error : "Gagal memuat daftar bundle.");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat memuat data.");
    } finally {
      setListLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBundles();
  }, [fetchBundles]);

  // Fetch rincian bundle ketika selectedBundle berubah
  const fetchBundleDetail = useCallback(async (bundleId: string) => {
    try {
      const res = await getBundleDetails(bundleId);
      if (res.success && 'bundle' in res && res.bundle) {
        setSelectedBundle(res.bundle);
        setPermohonanList(res.bundle.permohonan || []);
      } else {
        setError('error' in res && res.error ? res.error : "Gagal memuat rincian bundle.");
      }
    } catch (err: any) {
      setError(err.message || "Gagal memuat rincian permohonan.");
    }
  }, []);

  const handleSelectBundle = useCallback((bundle: any) => {
    setSelectedBundle(bundle);
    setPermohonanList(bundle.permohonan || []);
    setCurrentArsipPage(1);
  }, []);

  // Handle Upload File PDF Arsip
  const handleUploadFile = async (permohonanId: string, event: React.ChangeEvent<HTMLInputElement>, dataBaruId?: string) => {
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
        setSuccess("File arsip digital berhasil diunggah!");
        if (selectedBundle) {
          await fetchBundleDetail(selectedBundle.id);
        }
        await fetchBundles(true);

        if (showFractionsModal && fractionTargetPermohonan && selectedBundle) {
          const updatedRes = await getBundleDetails(selectedBundle.id);
          if (updatedRes.success && 'bundle' in updatedRes && updatedRes.bundle) {
            const updatedP = updatedRes.bundle.permohonan.find((p: any) => p.id === fractionTargetPermohonan.id);
            if (updatedP) setFractionTargetPermohonan(updatedP);
          }
        }
      } else {
        setError('error' in res && res.error ? (res.error as string) : "Gagal mengunggah file arsip.");
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
        setError('error' in res && res.error ? (res.error as string) : "Gagal mengajukan pengembalian.");
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
      const res = await togglePermohonanFavorite(permohonanId);
      if (res.success) {
        if (selectedBundle) {
          fetchBundleDetail(selectedBundle.id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Counts for Bundle Jenis Layanan Pills
  const bundleJenisCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: bundlesList.length,
      MUTASI_SEBAGIAN: 0,
      MUTASI_HABIS_UPDATE: 0,
      MUTASI_HABIS_REGULER: 0,
      OBJEK_PAJAK_BARU: 0,
      PEMBETULAN: 0,
      PENGAKTIFAN: 0,
    };
    bundlesList.forEach(b => {
      if (b.jenisPermohonan && counts[b.jenisPermohonan] !== undefined) {
        counts[b.jenisPermohonan]++;
      }
    });
    return counts;
  }, [bundlesList]);

  // Counts for Pemohon KPI Cards (System-wide, accurately counting Mutasi Sebagian fractions)
  const kpiCounts = useMemo(() => {
    let totalPemohon = 0;
    let sudahTerupload = 0;
    let belumDiupload = 0;

    // Use allPermohonanList for system-wide KPI, or fallback to bundlesList permohonan
    const targetList = allPermohonanList.length > 0
      ? allPermohonanList
      : bundlesList.flatMap(b => b.permohonan || []);

    targetList.forEach((p: any) => {
      if (p.jenisPermohonan === "MUTASI_SEBAGIAN" && p.dataBaru && p.dataBaru.length > 0) {
        p.dataBaru.forEach((db: any) => {
          totalPemohon++;
          const isUploaded = p.arsipDigital?.some((ad: any) => ad.dataBaruId === db.id && ad.status === "ACTIVE");
          if (isUploaded) {
            sudahTerupload++;
          } else {
            belumDiupload++;
          }
        });
      } else {
        totalPemohon++;
        const isUploaded = p.status === "ARCHIVED" || p.arsipDigital?.some((ad: any) => ad.status === "ACTIVE" && ad.dataBaruId === null);
        if (isUploaded) {
          sudahTerupload++;
        } else {
          belumDiupload++;
        }
      }
    });

    return { totalPemohon, sudahTerupload, belumDiupload };
  }, [allPermohonanList, bundlesList]);

  // Filter Bundles List
  const filteredBundlesList = useMemo(() => {
    return bundlesList.filter((b) => {
      const matchSearch =
        searchBundleQuery === "" ||
        b.nomorBundle.toLowerCase().includes(searchBundleQuery.toLowerCase()) ||
        (b.jenisPermohonan && b.jenisPermohonan.toLowerCase().includes(searchBundleQuery.toLowerCase()));

      const matchJenis =
        filterBundleJenisLayanan === "ALL" || b.jenisPermohonan === filterBundleJenisLayanan;

      const matchStatus =
        filterBundleStatus === "ALL" || b.status === filterBundleStatus;

      return matchSearch && matchJenis && matchStatus;
    });
  }, [bundlesList, searchBundleQuery, filterBundleJenisLayanan, filterBundleStatus]);

  // Filter Permohonan Arsip List
  const filteredArsipList = useMemo(() => {
    return permohonanList.filter((p) => {
      const q = searchArsipQuery.toLowerCase();
      const matchSearch =
        searchArsipQuery === "" ||
        (p.nomorPelayanan && p.nomorPelayanan.toLowerCase().includes(q)) ||
        (p.nomorPermohonan && p.nomorPermohonan.toLowerCase().includes(q)) ||
        (p.nop && p.nop.includes(q)) ||
        (p.namaWajibPajak && p.namaWajibPajak.toLowerCase().includes(q));

      return matchSearch;
    });
  }, [permohonanList, searchArsipQuery]);

  // Pagination for Bundles
  const totalBundlePages = Math.ceil(filteredBundlesList.length / itemsPerBundlePage);
  const activeBundlePage = currentBundlePage > totalBundlePages ? 1 : currentBundlePage;
  const paginatedBundlesList = useMemo(() => {
    return filteredBundlesList.slice(
      (activeBundlePage - 1) * itemsPerBundlePage,
      activeBundlePage * itemsPerBundlePage
    );
  }, [filteredBundlesList, activeBundlePage, itemsPerBundlePage]);

  // Pagination for Arsip
  const totalArsipPages = Math.ceil(filteredArsipList.length / itemsPerArsipPage);
  const activeArsipPage = currentArsipPage > totalArsipPages ? 1 : currentArsipPage;
  const paginatedArsipList = useMemo(() => {
    return filteredArsipList.slice(
      (activeArsipPage - 1) * itemsPerArsipPage,
      activeArsipPage * itemsPerArsipPage
    );
  }, [filteredArsipList, activeArsipPage, itemsPerArsipPage]);

  return (
    <div id="pengarsip-board-root" className="w-full font-sans select-none animate-fadeIn flex flex-col gap-6">

      {/* Show precision skeleton during initial data load */}
      {listLoading && viewMode === "bundle" && <PengarsipBundleSkeleton />}
      {listLoading && viewMode === "arsip" && <PengarsipArsipSkeleton />}

      {/* Hide real content while skeleton is visible */}
      <div className={`flex flex-col gap-4 ${listLoading ? "hidden" : ""}`}>

        {/* TIER 1: UNIFIED KPI STATS STRIP (Clean Neutral Slate Styling) */}
        <div className="bg-white border border-slate-200/90 rounded-md p-1.5 shadow-3xs select-none">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            {/* Metric 1: Total Pemohon */}
            <div
              onClick={() => { setFilterBundleStatus('ALL'); setCurrentBundlePage(1); handleSwitchTab('bundle'); }}
              className={`p-3 px-3.5 flex items-center justify-between transition-all cursor-pointer rounded-md ${filterBundleStatus === 'ALL' ? 'bg-slate-100/90 text-slate-900 font-bold' : 'hover:bg-slate-50 text-slate-600'
                }`}
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-slate-500 capitalize">Total Pemohon</span>
                <span className="text-xl font-black font-mono text-slate-900">{kpiCounts.totalPemohon}</span>
              </div>
              <span className={`text-xs font-black font-mono px-2 py-0.5 rounded-md border transition-all ${filterBundleStatus === 'ALL' ? 'bg-[#00a389] text-white border-[#00a389]' : 'bg-slate-100 text-slate-500 border-slate-200/80'
                }`}>
                100%
              </span>
            </div>

            {/* Metric 2: Sudah Terupload */}
            <div
              onClick={() => { setFilterBundleStatus('ALL'); setCurrentBundlePage(1); handleSwitchTab('bundle'); }}
              className={`p-3 px-3.5 flex items-center justify-between transition-all cursor-pointer rounded-md hover:bg-slate-50 text-slate-600`}
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-slate-500 capitalize">Sudah Terupload</span>
                <span className="text-xl font-black font-mono text-[#008f78]">{kpiCounts.sudahTerupload}</span>
              </div>
              <span className="text-xs font-black font-mono px-2 py-0.5 rounded-md border bg-emerald-50 text-[#008f78] border-emerald-200">
                {kpiCounts.totalPemohon > 0 ? `${((kpiCounts.sudahTerupload / kpiCounts.totalPemohon) * 100).toFixed(0)}%` : '0%'}
              </span>
            </div>

            {/* Metric 3: Belum Diupload */}
            <div
              onClick={() => { setFilterBundleStatus('LOCKED'); setCurrentBundlePage(1); handleSwitchTab('bundle'); }}
              className={`p-3 px-3.5 flex items-center justify-between transition-all cursor-pointer rounded-md hover:bg-slate-50 text-slate-600`}
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-slate-500 capitalize">Belum Diupload</span>
                <span className="text-xl font-black font-mono text-amber-600">{kpiCounts.belumDiupload}</span>
              </div>
              <span className="text-xs font-black font-mono px-2 py-0.5 rounded-md border bg-amber-50 text-amber-700 border-amber-200">
                {kpiCounts.totalPemohon > 0 ? `${((kpiCounts.belumDiupload / kpiCounts.totalPemohon) * 100).toFixed(0)}%` : '0%'}
              </span>
            </div>
          </div>
        </div>

        {/* Clean View Mode Switcher Tabs (Equal Width 2 Tabs Layout) */}
        <div className="bg-slate-100/90 border border-slate-200/80 p-1 rounded-md grid grid-cols-2 gap-1 shadow-3xs select-none">
          <button
            type="button"
            onClick={() => handleSwitchTab("bundle")}
            className={`py-2 px-3 rounded-md text-xs font-bold text-center transition-all cursor-pointer ${viewMode === "bundle"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
          >
            Daftar Bundle Digitalisasi
          </button>
          <button
            type="button"
            onClick={() => handleSwitchTab("arsip")}
            className={`py-2 px-3 rounded-md text-xs font-bold text-center transition-all cursor-pointer ${viewMode === "arsip"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
          >
            Daftar Berkas Arsip
          </button>
        </div>

        {/* Error & Success Banners */}
        {error && (
          <div className="bg-rose-50/90 border border-rose-200 text-rose-800 text-xs font-bold rounded-lg px-4 py-3 flex items-start gap-2 animate-fadeIn shrink-0 shadow-3xs">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError("")} className="text-rose-400 hover:text-rose-600 shrink-0 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        {success && (
          <div className="bg-emerald-50/90 border border-emerald-200 text-[#008f78] text-xs font-bold rounded-lg px-4 py-3 flex items-start gap-2 animate-fadeIn shrink-0 shadow-3xs">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
            <span className="flex-1">{success}</span>
            <button onClick={() => setSuccess("")} className="text-emerald-500 hover:text-emerald-700 shrink-0 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ==================== VIEW MODE: DAFTAR BUNDLE ==================== */}
        {viewMode === "bundle" && (
          <div className="bg-white border border-slate-200/90 rounded-md p-5 sm:p-6 shadow-3xs flex flex-col gap-6 min-h-[300px]">

            {/* Header Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 select-none">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
                {/* Search input for Bundles */}
                <div className="relative w-full md:w-[403px] max-w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
                  <input
                    type="text"
                    value={searchBundleQuery}
                    onChange={(e) => setSearchBundleQuery(e.target.value)}
                    onFocus={() => setIsBundleSearchFocused(true)}
                    onBlur={() => setIsBundleSearchFocused(false)}
                    className="w-full h-10 pl-10 pr-14 bg-white hover:bg-slate-50 focus:bg-white border border-slate-200 hover:border-slate-300 focus:border-[#00a389] rounded-lg text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-3xs"
                    placeholder="Cari No. Bundle, Jenis Pelayanan."
                  />
                  {searchBundleQuery && (
                    <button onClick={() => setSearchBundleQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 z-10 p-0.5 rounded-full hover:bg-slate-100 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Right side controls: Refresh Button */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => fetchBundles(true)}
                    disabled={isRefreshing || listLoading}
                    className="p-2.5 h-10 w-10 rounded-lg border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-500 shadow-3xs transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center shrink-0"
                    title="Refresh Data"
                  >
                    <RefreshCw className={`w-4 h-4 transition-all duration-300 ${isRefreshing ? 'animate-spin text-[#00a389]' : ''}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Jenis Layanan Pills for Bundles */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0 select-none pb-1">
              {[
                { val: "ALL", label: "Semua" },
                { val: "MUTASI_SEBAGIAN", label: "Mutasi Sebagian" },
                { val: "MUTASI_HABIS_UPDATE", label: "Mutasi Habis (Update)" },
                { val: "MUTASI_HABIS_REGULER", label: "Mutasi Habis (Reguler)" },
                { val: "OBJEK_PAJAK_BARU", label: "OP Baru" },
                { val: "PEMBETULAN", label: "Pembetulan" },
                { val: "PENGAKTIFAN", label: "Pengaktifan" }
              ].map((item) => {
                const isActive = filterBundleJenisLayanan === item.val;
                const count = bundleJenisCounts[item.val] ?? 0;
                return (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setFilterBundleJenisLayanan(item.val)}
                    className={`px-3.5 py-1 rounded-full text-[10px] font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer border ${isActive
                      ? "bg-[#00a389] text-white border-[#00a389] shadow-3xs"
                      : "bg-white text-slate-500 hover:bg-slate-50 border-gray-200/90"
                      }`}
                  >
                    <span>{item.label}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-extrabold ${isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                      }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Bundle Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {loading ? (
                <div className="col-span-full py-20 flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-[#00a389]" />
                  <span className="text-xs font-semibold text-slate-500">Memuat data...</span>
                </div>
              ) : paginatedBundlesList.length === 0 ? (
                <div className="col-span-full py-20 text-center text-xs text-slate-400 font-medium italic select-none">
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
                  const isAllUploaded = b.permohonan?.length > 0 && b.permohonan.every((p: any) => p.status === "ARCHIVED");

                  const pengarsipName = (() => {
                    if (!b.permohonan) return null;
                    for (const p of b.permohonan) {
                      if (p.arsipDigital && p.arsipDigital.length > 0) {
                        const activeArsip = p.arsipDigital.find((ad: any) => ad.status === 'ACTIVE') || p.arsipDigital[0];
                        if (activeArsip?.pengarsip?.name) {
                          return activeArsip.pengarsip.name;
                        }
                      }
                    }
                    return null;
                  })();

                  const getAvatarInitials = (name: string) => {
                    if (!name || name === '—') return '?';
                    const parts = name.trim().split(' ');
                    if (parts.length >= 2) {
                      return (parts[0][0] + parts[1][0]).toUpperCase();
                    }
                    return name.slice(0, 2).toUpperCase();
                  };

                  const statusCfg = BUNDLE_STATUS_CONFIG[b.status] || BUNDLE_STATUS_CONFIG.LOCKED;
                  const typeStyle = b.jenisPermohonan && BUNDLE_TYPE_STYLES[b.jenisPermohonan]
                    ? BUNDLE_TYPE_STYLES[b.jenisPermohonan]
                    : { bg: "bg-slate-50", text: "text-slate-400", border: "border-slate-200/30" };

                  const renderStatusIcon = () => {
                    const iconClass = "w-2.5 h-2.5 shrink-0";
                    if (b.status === "LOCKED") return <Lock className={iconClass} />;
                    if (b.status === "IN_MANIFEST") return <Send className={iconClass} />;
                    return <Unlock className={iconClass} />;
                  };

                  return (
                    <div
                      key={b.id}
                      onClick={() => handleSelectBundle(b)}
                      className={`p-4 rounded-md border flex flex-col justify-between gap-3 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer relative overflow-hidden group select-none min-h-[130px] ${isSelected
                          ? "bg-[#00a389]/5 border-[#00a389] shadow-md ring-2 ring-[#00a389]/20"
                          : `bg-white border-slate-200/90 hover:border-slate-350 hover:shadow-md ${statusCfg.shadow}`
                        }`}
                    >
                      {/* Top Row: Number */}
                      <div className="flex items-center justify-between gap-3 w-full">
                        <span className="text-[10px] sm:text-xs font-black text-slate-850 font-mono tracking-tight break-all whitespace-normal block" title={b.nomorBundle}>
                          {b.nomorBundle}
                        </span>
                      </div>

                      {/* Middle Row: Service Type Tag | Count Badge Centered Horizontally */}
                      <div className="flex items-center justify-center gap-2.5 w-full py-1">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border leading-none select-none tracking-wide uppercase ${typeStyle.bg} ${typeStyle.text} ${typeStyle.border}`} title={b.jenisPermohonan ? b.jenisPermohonan.replace(/_/g, " ") : "Umum"}>
                          {b.jenisPermohonan ? getAbbreviatedJenis(b.jenisPermohonan) : "—"}
                        </span>

                        {/* Thin Vertical Line Separator */}
                        <div className="h-3.5 w-px bg-slate-200/90 shrink-0" />

                        {/* Count Badge */}
                        <span className="flex items-center justify-center bg-[#f25c54] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md leading-none shrink-0 shadow-3xs" title={`${totalCount} Berkas`}>
                          {totalCount} Pemohon
                        </span>
                      </div>

                      {/* Bottom Footer Row: Avatar Initials / Creation Date & Status Badge */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100/80 font-sans mt-auto">
                        <div className="flex items-center gap-2 min-w-0">
                          {pengarsipName ? (
                            <div className="w-5.5 h-5.5 rounded-full bg-[#00a389] text-white text-[8px] font-black flex items-center justify-center shrink-0 shadow-3xs" title={`Diarsipkan oleh ${pengarsipName}`}>
                              {getAvatarInitials(pengarsipName)}
                            </div>
                          ) : (
                            <div className="w-5.5 h-5.5 rounded-full bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center shrink-0" title="Belum ada pengarsip">
                              <User className="w-3 h-3 text-slate-400" />
                            </div>
                          )}
                        </div>

                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border leading-none capitalize tracking-wider flex items-center gap-1 shadow-3xs transition-all shrink-0 ${b.status === 'LOCKED'
                            ? 'bg-slate-900 text-slate-100 border-slate-800'
                            : b.status === 'IN_MANIFEST'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          }`}>
                          {renderStatusIcon()}
                          <span>{getStatusLabel(b.status)}</span>
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination Footer */}
            <div className="px-5 py-3.5 border border-slate-200/90 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto rounded-xl select-none shadow-3xs shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-semibold text-slate-500 font-sans">
                  {filteredBundlesList.length > 0
                    ? `Menampilkan ${((activeBundlePage - 1) * itemsPerBundlePage) + 1}–${Math.min(activeBundlePage * itemsPerBundlePage, filteredBundlesList.length)} dari ${filteredBundlesList.length} bundle`
                    : "Tidak ada data"}
                </span>
                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-1.5 py-0.5">
                  {[8, 16, 32].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setItemsPerBundlePage(n)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${itemsPerBundlePage === n
                        ? "bg-[#00a389] text-white font-extrabold shadow-3xs"
                        : "text-slate-500 hover:text-slate-700"
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
                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-all cursor-pointer shadow-3xs flex items-center justify-center"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  {Array.from({ length: totalBundlePages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentBundlePage(page)}
                      className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${activeBundlePage === page
                        ? "bg-[#00a389] text-white font-extrabold shadow-3xs scale-105"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 shadow-3xs"
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCurrentBundlePage(prev => Math.min(prev + 1, totalBundlePages))}
                    disabled={activeBundlePage === totalBundlePages}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-all cursor-pointer shadow-3xs flex items-center justify-center"
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
          <div className="bg-white border border-slate-200/90 rounded-md shadow-3xs flex flex-col overflow-hidden min-h-[400px]">
            {selectedBundle ? (
              <div className="flex-1 flex flex-col overflow-hidden animate-fadeIn">

                {/* Bundle Header Bar */}
                <div className="px-5 py-3.5 border-b border-slate-200/80 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-3 select-none">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleSwitchTab("bundle")}
                      className="h-10 px-3 rounded-lg border border-emerald-200 bg-emerald-50 text-[#008f78] hover:bg-emerald-100 font-bold text-xs transition-all cursor-pointer shadow-3xs flex items-center gap-1.5"
                    >
                      <span className="font-mono font-black">{selectedBundle.nomorBundle}</span>
                      <span className="text-[10px] font-black bg-white px-1.5 py-0.2 rounded border border-emerald-200">
                        {(selectedBundle.permohonan || []).length} Berkas
                      </span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Search Input for Arsip */}
                    <div className="relative w-full md:w-[320px]">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
                      <input
                        type="text"
                        value={searchArsipQuery}
                        onChange={(e) => setSearchArsipQuery(e.target.value)}
                        onFocus={() => setIsArsipSearchFocused(true)}
                        onBlur={() => setIsArsipSearchFocused(false)}
                        className="w-full h-10 pl-9 pr-8 bg-white border border-slate-200 hover:border-slate-300 focus:border-[#00a389] rounded-lg text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-3xs"
                        placeholder="Cari No. Pelayanan, NOP, Nama..."
                      />
                      {searchArsipQuery && (
                        <button onClick={() => setSearchArsipQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => fetchBundleDetail(selectedBundle.id)}
                      disabled={loading}
                      className="p-2.5 h-10 w-10 rounded-lg border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-500 shadow-3xs transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center shrink-0"
                      title="Refresh Rincian Bundle"
                    >
                      <RefreshCw className={`w-4 h-4 transition-all duration-300 ${loading ? 'animate-spin text-[#00a389]' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Table Canvas */}
                <div className="flex-1 flex flex-col justify-between overflow-hidden">
                  <div className="overflow-x-auto scrollbar-thin flex-1">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/90 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider border-b border-slate-200 select-none whitespace-nowrap">
                          <th className="py-3 px-4 text-center w-12 min-w-[48px]">No</th>
                          <th className="py-3 px-2 text-center w-10 min-w-[40px]">⭐</th>
                          <th className="py-3 px-4 min-w-[110px]">Tgl. Input</th>
                          <th className="py-3 px-4 min-w-[140px]">Petugas Input</th>
                          <th className="py-3 px-4 min-w-[100px]">Tgl. Nopel</th>
                          <th className="py-3 px-4 min-w-[100px]">Tgl. Selesai</th>
                          <th className="py-3 px-4 min-w-[150px]">No. Pelayanan</th>
                          <th className="py-3 px-4 min-w-[210px] whitespace-nowrap">Nomor Objek Pajak</th>
                          <th className="py-3 px-4 min-w-[170px]">Nama Pemohon</th>
                          <th className="py-3 px-4 min-w-[120px]">Jenis Layanan</th>
                          <th className="py-3 px-4 text-center min-w-[100px]">Status</th>
                          <th className="py-3 px-4 min-w-[120px]">Tgl. Upload</th>
                          <th className="py-3 px-4 text-center w-28 min-w-[110px]">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700 bg-white">
                        {paginatedArsipList.length === 0 ? (
                          <tr>
                            <td colSpan={13} className="py-14 text-center text-slate-400 italic">
                              Bundle tidak memiliki permohonan yang cocok.
                            </td>
                          </tr>
                        ) : (
                          paginatedArsipList.map((p: any, index: number) => {
                            const isFrozen = p.permintaanKoreksi && p.permintaanKoreksi.length > 0;
                            const needsReUpload = p.status === "BUNDLED" && p.arsipDigital?.some((ad: any) => ad.status === "SUPERSEDED" && ad.dataBaruId === null);
                            const isArchived = p.status === "ARCHIVED";
                            const activeArchive = p.arsipDigital?.find((ad: any) => ad.status === "ACTIVE" && ad.dataBaruId === null);
                            const itemNumber = (activeArsipPage - 1) * itemsPerArsipPage + index + 1;

                            const nopolDate = p.tanggalNoPelayanan
                              ? new Date(p.tanggalNoPelayanan).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                              : "—";
                            const penyelesaianDate = p.tanggalPenyelesaian
                              ? new Date(p.tanggalPenyelesaian).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                              : "—";

                            return (
                              <tr
                                key={p.id}
                                onClick={() => setGlobalSelectedRequest(p)}
                                className={`hover:bg-slate-50 transition-colors duration-150 cursor-pointer group relative text-xs font-semibold text-slate-700 ${isFrozen ? "bg-amber-50/20" : ""
                                  }`}
                              >
                                <td className="py-3 px-4 text-center text-xs font-bold text-slate-400 font-mono">
                                  {itemNumber}
                                </td>

                                <td className="py-3 px-2 text-center" onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleFavorite(p.id);
                                }}>
                                  <button
                                    type="button"
                                    className="p-1 hover:scale-125 active:scale-75 transition-all duration-200 text-slate-300 hover:text-amber-500 cursor-pointer"
                                    title={p.isFavorite ? "Hapus dari Favorit" : "Tandai Favorit"}
                                  >
                                    <Star className={`w-4 h-4 transition-all duration-200 ${p.isFavorite
                                        ? 'text-amber-500 fill-amber-500 drop-shadow-[0_0_6px_rgba(245,158,11,0.55)]'
                                        : 'text-slate-300'
                                      }`} />
                                  </button>
                                </td>

                                <td className="py-3 px-4 text-xs font-semibold text-slate-500 font-mono whitespace-nowrap">
                                  {p.createdAt ? new Date(p.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                </td>
                                <td className="py-3 px-4 text-slate-700 text-xs font-bold whitespace-nowrap uppercase">
                                  <div className="flex items-center gap-1.5 min-w-0" title={p.penginput?.name || "Petugas Input"}>
                                    <span className="truncate max-w-[130px] uppercase">{p.penginput?.name || "Petugas Input"}</span>
                                  </div>
                                </td>

                                <td className="py-3 px-4 text-xs font-semibold text-slate-500 whitespace-nowrap">{nopolDate}</td>

                                <td className="py-3 px-4 whitespace-nowrap">
                                  {p.tanggalPenyelesaian ? (
                                    <div className="flex items-center gap-1">
                                      {isOverdue(p.tanggalPenyelesaian, p.status) && (
                                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                      )}
                                      <span className={`text-xs font-semibold ${isOverdue(p.tanggalPenyelesaian, p.status)
                                          ? 'text-rose-600 font-bold'
                                          : 'text-slate-500'
                                        }`}>
                                        {penyelesaianDate}
                                      </span>
                                    </div>
                                  ) : "—"}
                                </td>

                                <td className="py-3 px-4 min-w-[150px] group/cell relative">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-xs font-bold text-slate-800 font-mono tracking-tight">
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
                                      className="p-1 rounded opacity-0 group-hover/cell:opacity-100 hover:bg-slate-100 text-slate-400 hover:text-[#00a389] transition-all cursor-pointer flex items-center justify-center w-5 h-5 select-none"
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

                                <td className="py-3 px-4 min-w-[210px] whitespace-nowrap group/cell relative">
                                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                                    <span className="text-xs font-semibold text-slate-600 font-mono whitespace-nowrap">
                                      {formatNop(p.nop)}
                                    </span>
                                    <button
                                      onClick={(e) => handleCopy(e, p.nop)}
                                      className="p-1 rounded opacity-0 group-hover/cell:opacity-100 hover:bg-slate-100 text-slate-400 hover:text-[#00a389] transition-all cursor-pointer flex items-center justify-center w-5 h-5 select-none"
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

                                <td className="py-3 px-4 group/cell relative">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold text-slate-800 whitespace-nowrap uppercase">
                                      {p.namaWajibPajak.toUpperCase()}
                                    </span>
                                    <button
                                      onClick={(e) => handleCopy(e, p.namaWajibPajak)}
                                      className="p-1 rounded opacity-0 group-hover/cell:opacity-100 hover:bg-slate-100 text-slate-400 hover:text-[#00a389] transition-all cursor-pointer flex items-center justify-center w-5 h-5 select-none"
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

                                <td className="py-3 px-4">
                                  <span
                                    className="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded capitalize font-sans tracking-wide select-none"
                                    title={p.jenisPermohonan?.replace(/_/g, " ")}
                                  >
                                    {getAbbreviatedJenis(p.jenisPermohonan)}
                                  </span>
                                </td>

                                <td className="py-3 px-4 text-center">
                                  <div className="flex items-center justify-center">
                                    <span className={`inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${getStatusBadgeClass(p.status)}`}>
                                      {getStatusLabel(p.status)}
                                    </span>
                                  </div>
                                </td>

                                <td className="py-3 px-4 text-xs font-semibold text-slate-500 font-mono whitespace-nowrap">
                                  {activeArchive?.createdAt
                                    ? new Date(activeArchive.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                                    : '—'}
                                </td>

                                <td className="py-3 px-4 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    {isFrozen ? (
                                      <span className="text-[9px] font-extrabold px-2 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap select-none">
                                        Frozen
                                      </span>
                                    ) : (
                                      <>
                                        {p.jenisPermohonan === "MUTASI_SEBAGIAN" ? (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setFractionTargetPermohonan(p);
                                              setShowFractionsModal(true);
                                            }}
                                            className={`p-1.5 rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-center shrink-0 border hover:scale-105 active:scale-95 ${isArchived
                                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                                : "bg-[#00a389]/10 text-[#008f78] border-[#00a389]/20 hover:bg-[#00a389]/20"
                                              }`}
                                            title="Kelola berkas pecahan (Mutasi Sebagian)"
                                          >
                                            <FolderOpen className="w-3.5 h-3.5" />
                                          </button>
                                        ) : (
                                          <>
                                            <input
                                              type="file"
                                              accept=".pdf"
                                              ref={(el) => { fileInputRefs.current[p.id] = el; }}
                                              onChange={(e) => handleUploadFile(p.id, e)}
                                              className="hidden"
                                              disabled={isFrozen || loading}
                                            />

                                            {p.status === "BUNDLED" && needsReUpload && (
                                              <button
                                                onClick={(e) => { e.stopPropagation(); triggerFileInput(p.id); }}
                                                disabled={loading}
                                                className="p-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg shadow-3xs transition-all cursor-pointer flex items-center justify-center shrink-0"
                                                title="Re-upload arsip PDF baru"
                                              >
                                                <RotateCcw className="w-3.5 h-3.5" />
                                              </button>
                                            )}

                                            {p.status === "BUNDLED" && !needsReUpload && (
                                              <button
                                                onClick={(e) => { e.stopPropagation(); triggerFileInput(p.id); }}
                                                disabled={loading}
                                                className="p-1.5 bg-[#00a389] hover:bg-[#008f78] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg shadow-3xs transition-all cursor-pointer flex items-center justify-center shrink-0"
                                                title="Unggah arsip PDF"
                                              >
                                                <FileSpreadsheet className="w-3.5 h-3.5" />
                                              </button>
                                            )}

                                            {isArchived && activeArchive && (
                                              <a
                                                href={activeArchive.urlBlob}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="p-1.5 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg text-emerald-700 transition-all flex items-center justify-center shrink-0"
                                                title={`v${activeArchive.versi} — Buka arsip PDF`}
                                              >
                                                <FileCheck className="w-3.5 h-3.5 text-[#00a389]" />
                                              </a>
                                            )}

                                            {isArchived && (
                                              <button
                                                onClick={(e) => { e.stopPropagation(); triggerFileInput(p.id); }}
                                                disabled={loading}
                                                className="p-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-500 transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center shrink-0"
                                                title="Ganti file arsip"
                                              >
                                                <FolderOpen className="w-3.5 h-3.5" />
                                              </button>
                                            )}
                                          </>
                                        )}

                                        <button
                                          onClick={(e) => { e.stopPropagation(); openCorrectionModal(p); }}
                                          disabled={loading}
                                          className="p-1.5 bg-slate-50 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 rounded-lg text-slate-400 transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center shrink-0"
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

                  {/* Pagination Footer */}
                  <div className="px-5 py-3 border-t border-slate-200/90 bg-slate-50 flex items-center justify-between mt-auto select-none">
                    <span className="text-[11px] font-semibold text-slate-500 font-sans">
                      {permohonanList.length > 0
                        ? `Menampilkan ${((activeArsipPage - 1) * itemsPerArsipPage) + 1}–${Math.min(activeArsipPage * itemsPerArsipPage, permohonanList.length)} dari ${permohonanList.length} berkas`
                        : "Tidak ada data"}
                    </span>
                    {totalArsipPages > 1 && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setCurrentArsipPage(prev => Math.max(prev - 1, 1))}
                          disabled={activeArsipPage === 1}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-all cursor-pointer shadow-3xs flex items-center justify-center"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        {Array.from({ length: totalArsipPages }, (_, i) => i + 1).map(page => (
                          <button
                            type="button"
                            key={page}
                            onClick={() => setCurrentArsipPage(page)}
                            className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${activeArsipPage === page
                              ? "bg-[#00a389] text-white font-extrabold shadow-3xs scale-105"
                              : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 shadow-3xs"
                              }`}
                          >
                            {page}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => setCurrentArsipPage(prev => Math.min(prev + 1, totalArsipPages))}
                          disabled={activeArsipPage === totalArsipPages}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-all cursor-pointer shadow-3xs flex items-center justify-center"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Empty state — belum ada bundle dipilih */
              <div className="flex-1 flex flex-col items-center justify-center py-28 px-8 text-center select-none">
                <div className="w-14 h-14 bg-[#00a389]/10 border border-[#00a389]/20 rounded-2xl flex items-center justify-center mb-4 shadow-3xs">
                  <Boxes className="w-7 h-7 text-[#00a389]" />
                </div>
                <p className="text-sm font-bold text-slate-800 mb-1.5">Pilih bundle terlebih dahulu</p>
                <p className="text-xs text-slate-400 font-semibold max-w-xs leading-relaxed mb-4">
                  Buka tab "Daftar Bundle", pilih bundle yang ingin diproses, dan daftar berkas arsipnya akan tampil di sini.
                </p>
                <button
                  onClick={() => handleSwitchTab("bundle")}
                  className="px-4 py-2 bg-[#00a389] hover:bg-[#008f78] text-white font-extrabold text-xs rounded-lg shadow-3xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Boxes className="w-3.5 h-3.5" />
                  <span>Ke Daftar Bundle</span>
                </button>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ==================== MODAL: Details Modal (Shared Component) ==================== */}
      {globalSelectedRequest && (
        <DetailsModal
          isOpen={!!globalSelectedRequest}
          onClose={() => setGlobalSelectedRequest(null)}
          selectedRequest={globalSelectedRequest}
        />
      )}

      {/* ==================== MODAL: Kembalikan ke Peneliti ==================== */}
      {showCorrectionModal && correctionTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 select-none animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-scaleUp">

            {/* Modal Header */}
            <div className="bg-white border-b border-slate-200/80 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-rose-50 border border-rose-200 p-2 rounded-lg shrink-0 flex items-center justify-center">
                  <ArrowLeftRight className="w-4 h-4 text-rose-600" />
                </div>
                <h3 className="text-sm font-black text-slate-900 tracking-tight">
                  Kembalikan ke Peneliti
                </h3>
              </div>
              <button
                onClick={() => { setShowCorrectionModal(false); setCorrectionTarget(null); }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleRequestCorrection}>
              <div className="p-5 flex flex-col gap-4 text-xs">
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl leading-relaxed text-rose-800 font-semibold">
                  <p>
                    Anda mengajukan pengembalian <strong>koreksi berkas</strong> NOP:{" "}
                    <strong className="font-mono">{formatNop(correctionTarget.nop)}</strong>.
                  </p>
                  <p className="text-[10px] text-rose-700 mt-1.5 font-bold">
                    * Tindakan ini memerlukan persetujuan Supervisor dan akan mem-freeze permohonan hingga diputuskan.
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="catatan-koreksi" className="font-extrabold text-slate-700">
                    Alasan pengembalian <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="catatan-koreksi"
                    rows={4}
                    value={correctionReason}
                    onChange={(e) => setCorrectionReason(e.target.value)}
                    placeholder="Masukkan alasan detail (contoh: dokumen sobek, berkas tertukar, NOP tidak sesuai fisik...)"
                    className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:outline-none focus:border-[#00a389] text-xs font-semibold rounded-xl px-3.5 py-2.5 transition-all text-slate-800 resize-none shadow-3xs"
                    required
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="bg-slate-50 border-t border-slate-200/80 px-5 py-3.5 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => { setShowCorrectionModal(false); setCorrectionTarget(null); }}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer shadow-3xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading || !correctionReason.trim()}
                  className="px-4 py-2 text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 rounded-xl flex items-center gap-1.5 shadow-3xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Ajukan Pengembalian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: Detail Pecahan (Mutasi Sebagian) ==================== */}
      {mounted && showFractionsModal && fractionTargetPermohonan && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 select-none animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 flex flex-col animate-scaleUp max-h-[90vh]">

            {/* Modal Header */}
            <div className="bg-white border-b border-slate-200/80 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="bg-[#00a389]/10 border border-[#00a389]/20 p-2 rounded-lg shrink-0 flex items-center justify-center">
                  <FolderOpen className="w-4 h-4 text-[#00a389]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest leading-none mb-1">Digitalisasi Pecahan</span>
                  <span className="text-sm font-black text-slate-900 font-mono tracking-tight truncate leading-none">
                    {fractionTargetPermohonan.nomorPelayanan || fractionTargetPermohonan.nomorPermohonan}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowFractionsModal(false);
                  setFractionTargetPermohonan(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4 max-h-[70vh] bg-slate-50">

              {/* Info Box */}
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl leading-relaxed text-[#008f78] text-[11px] font-semibold flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-[#00a389] shrink-0 mt-0.5" />
                <span>
                  Silakan unggah dokumen PDF hasil scan untuk setiap pecahan di bawah ini. Status permohonan utama akan otomatis berubah menjadi <strong>Diarsipkan</strong> setelah semua pecahan selesai didigitalisasi.
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
                      className="p-4 bg-white border border-slate-200/90 rounded-xl flex flex-col gap-3 shadow-3xs hover:border-[#00a389]/40 transition-all duration-200"
                    >
                      {/* Card Header */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black text-[#008f78] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                            Pecahan #{idx + 1}
                          </span>
                          <span className={`inline-block text-[9px] font-extrabold px-2 py-0.5 rounded-full border leading-none ${hasDbArchive
                              ? 'bg-emerald-50 text-[#008f78] border-emerald-200'
                              : dbNeedsReUpload
                                ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                                : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}>
                            {hasDbArchive ? 'Diarsipkan' : dbNeedsReUpload ? 'Re-upload' : 'Belum Unggah'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {isFrozen ? (
                            <span className="text-[9px] text-amber-600 font-extrabold bg-amber-50 px-2 py-0.5 rounded border border-amber-100 uppercase tracking-wide">
                              Frozen
                            </span>
                          ) : (
                            <>
                              {!hasDbArchive && !dbNeedsReUpload && (
                                <button
                                  onClick={() => {
                                    setActiveFractionId(db.id);
                                    setTimeout(() => fractionFileInputRef.current?.click(), 50);
                                  }}
                                  disabled={loading}
                                  className="px-3 py-1.5 bg-[#00a389] hover:bg-[#008f78] disabled:opacity-50 text-white text-[10px] font-extrabold rounded-lg shadow-3xs transition-all cursor-pointer flex items-center gap-1"
                                >
                                  <Upload className="w-3 h-3" />
                                  <span>Unggah</span>
                                </button>
                              )}

                              {!hasDbArchive && dbNeedsReUpload && (
                                <button
                                  onClick={() => {
                                    setActiveFractionId(db.id);
                                    setTimeout(() => fractionFileInputRef.current?.click(), 50);
                                  }}
                                  disabled={loading}
                                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-[10px] font-extrabold rounded-lg shadow-3xs transition-all cursor-pointer flex items-center gap-1"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  <span>Re-upload</span>
                                </button>
                              )}

                              {hasDbArchive && dbActiveArchive && (
                                <a
                                  href={dbActiveArchive.urlBlob}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg text-emerald-700 transition-all flex items-center justify-center cursor-pointer shadow-3xs"
                                  title={`v${dbActiveArchive.versi} — Buka PDF`}
                                >
                                  <FileCheck className="w-3.5 h-3.5 text-[#00a389]" />
                                </a>
                              )}

                              {hasDbArchive && (
                                <button
                                  onClick={() => {
                                    setActiveFractionId(db.id);
                                    setTimeout(() => fractionFileInputRef.current?.click(), 50);
                                  }}
                                  disabled={loading}
                                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1 text-[10px] font-extrabold"
                                >
                                  <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Ganti</span>
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Card Content Properties */}
                      <div className="grid grid-cols-2 gap-3.5 text-xs font-semibold text-slate-800">
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase tracking-wide mb-0.5">Nama Pemilik Baru</span>
                          <span className="capitalize text-slate-800 font-bold">{db.namaPemilikBaru?.toLowerCase()}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase tracking-wide mb-0.5">Nomor Sertifikat Baru</span>
                          <span className="font-mono text-slate-900 font-black">{db.sertifikatBaru || "—"}</span>
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
            <div className="bg-slate-50 border-t border-slate-200/80 px-6 py-4 flex items-center justify-end select-none">
              <button
                type="button"
                onClick={() => {
                  setShowFractionsModal(false);
                  setFractionTargetPermohonan(null);
                }}
                className="px-5 py-2 border border-slate-200 hover:bg-slate-100 text-slate-600 font-semibold text-xs rounded-xl transition-colors cursor-pointer shadow-3xs"
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
