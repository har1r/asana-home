"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback, useDeferredValue } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  FileText,
  Search,
  Clock,
  ExternalLink,
  RefreshCw,
  ArrowLeftRight,
  ShieldAlert,
  Loader2,
  X,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  Calendar,
  Layers,
  ChevronRight,
  RotateCcw,
  Star,
  Boxes,
  FileSpreadsheet,
  ArrowRight,
  Printer,
  Check,
  ChevronLeft,
  Slash,
  ListFilter,
  History,
  PlusCircle,
  Truck,
  ShieldCheck
} from "lucide-react";
import { formatNop, toTitleCase } from "@/components/workspaces/shared/constants";
import { useSession } from "next-auth/react";
import {
  getMonitoringPermohonan,
  completePermohonan,
  ajukanBatalSelesai,
  toggleVerifyDataBaru,
  verifyAllDataBaru
} from "@/app/actions/pemantau";
import { useDashboard } from "@/context/DashboardContext";
import { SkeletonBox, SkeletonText, SkeletonBadge } from "@/components/skeletons/SkeletonBase";
import { EmptyDataAnimation } from "@/components/workspaces/shared/EmptyDataAnimation";
import { RevisionAlertBanner } from "@/components/workspaces/shared/RevisionAlertBanner";

type WorkspaceTab = "daftar-bundle" | "daftar-pantau";

const getAbbreviatedJenis = (jenis: string) => {
  switch (jenis) {
    case 'OBJEK_PAJAK_BARU': return 'OPB';
    case 'MUTASI_SEBAGIAN': return 'MS';
    case 'MUTASI_HABIS_REGULER': return 'MHR';
    case 'MUTASI_HABIS_UPDATE': return 'MHU';
    case 'PEMBETULAN': return 'PBT';
    case 'PENGAKTIFAN': return 'AKT';
    default: return jenis?.replace(/_/g, " ") || 'Umum';
  }
};



/** Skeleton dasar KPI Strip & Tabs untuk PemantauWorkspace */
function PemantauBaseHeaderSkeleton() {
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
export function PemantauBundleSkeleton() {
  return (
    <div className="w-full font-sans select-none flex flex-col gap-4 animate-fadeIn">
      <PemantauBaseHeaderSkeleton />

      {/* Toolbar Skeleton */}
      <div className="bg-[#f8fafc] border border-slate-200/80 p-3 rounded-md shadow-3xs flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-3">
          <SkeletonBox width="w-full md:w-[403px]" height="h-10" rounded="rounded-md" />
          <SkeletonBox width="w-10" height="h-10" rounded="rounded-md" />
        </div>
        <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60">
          <SkeletonBox width="w-16" height="h-7" rounded="rounded-md" />
          <SkeletonBox width="w-28" height="h-7" rounded="rounded-md" />
          <SkeletonBox width="w-28" height="h-7" rounded="rounded-md" />
        </div>
      </div>

      {/* Main Grid Skeleton Card */}
      <div className="bg-white border border-slate-200/90 rounded-md p-5 sm:p-6 shadow-3xs flex flex-col gap-6 min-h-[300px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="p-4 rounded-md border border-slate-200/90 bg-white flex flex-col justify-between gap-3.5 min-h-[140px]">
              <div className="flex items-center justify-between gap-2">
                <SkeletonBox width="w-28" height="h-3.5" rounded="rounded-sm" />
                <SkeletonBox width="w-6" height="h-6" rounded="rounded-md" />
              </div>
              <SkeletonBox width="w-full" height="h-8" rounded="rounded-md" />
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <SkeletonBox width="w-24" height="h-3" rounded="rounded-sm" />
                <SkeletonBox width="w-16" height="h-3" rounded="rounded-sm" />
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 py-3.5 border border-slate-200/80 bg-slate-50 flex items-center justify-between mt-auto rounded-md">
          <SkeletonText width="w-36" height="h-3" />
          <SkeletonBox width="w-32" height="h-7" rounded="rounded-md" />
        </div>
      </div>
    </div>
  );
}

/** Skeleton presisi untuk Tab 2: Daftar Pantau */
export function PemantauPantauSkeleton() {
  return (
    <div className="w-full font-sans select-none flex flex-col gap-4 animate-fadeIn">
      <PemantauBaseHeaderSkeleton />

      <div className="bg-white border border-slate-200/90 rounded-md p-5 sm:p-6 shadow-3xs flex flex-col gap-4 min-h-[500px]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <SkeletonBox width="w-48" height="h-5" rounded="rounded-sm" />
          <SkeletonBox width="w-56" height="h-9" rounded="rounded-md" />
        </div>

        <div className="flex flex-col lg:flex-row items-stretch gap-4 w-full min-h-[700px]">
          <div className="w-full lg:w-96 shrink-0 bg-white border border-slate-200/90 rounded-md p-4 shadow-3xs flex flex-col gap-3 min-h-[700px]">
            <SkeletonBox width="w-36" height="h-4" rounded="rounded-sm" />
            <div className="flex flex-col gap-2 mt-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonBox key={i} width="w-full" height="h-16" rounded="rounded-md" />
              ))}
            </div>
          </div>

          <div className="flex-1 w-full bg-white border border-slate-200/90 rounded-md p-5 shadow-3xs flex flex-col gap-5 min-h-[700px]">
            <SkeletonBox width="w-64" height="h-5" rounded="rounded-sm" />
            <SkeletonBox width="w-full" height="h-36" rounded="rounded-md" />
            <SkeletonBox width="w-full" height="h-48" rounded="rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PemantauWorkspace() {
  const { data: session } = useSession();
  const { showConfirm } = useDashboard();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read URL query parameter ?tab=...&view=daftar-bundle|daftar-pantau
  const viewParam = searchParams.get('view');

  // Workspace Tab State initialized from URL query param
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>(() => {
    if (viewParam === 'daftar-pantau') return 'daftar-pantau';
    return 'daftar-bundle';
  });

  // Sync workspaceTab when URL query params change (e.g. Browser Back/Forward buttons)
  useEffect(() => {
    if (viewParam === 'daftar-pantau') {
      setWorkspaceTab('daftar-pantau');
    } else {
      setWorkspaceTab('daftar-bundle');
    }
  }, [viewParam]);

  // Helper to switch workspace tab and update URL query param
  const handleSwitchTab = useCallback((mode: WorkspaceTab) => {
    setWorkspaceTab(mode);
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', mode);
    router.push(`/?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  // Lists and Selected States
  const [permohonanList, setPermohonanList] = useState<any[]>([]);
  const [selectedBundle, setSelectedBundle] = useState<any | null>(null);
  const [selectedPermohonan, setSelectedPermohonan] = useState<any | null>(null);

  // States for search and loaders
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [searchBundleQuery, setSearchBundleQuery] = useState("");
  const deferredSearchBundleQuery = useDeferredValue(searchBundleQuery);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [filterJenisLayanan, setFilterJenisLayanan] = useState<string>("ALL");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Rollback Modal
  const [showRollbackModal, setShowRollbackModal] = useState(false);
  const [rollbackReason, setRollbackReason] = useState("");

  // Pecahan verification map for Mutasi Sebagian
  const [checkedPecahanMap, setCheckedPecahanMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!selectedPermohonan) {
      setCheckedPecahanMap({});
      return;
    }
    if (selectedPermohonan.dataBaru && selectedPermohonan.dataBaru.length > 0) {
      const initialMap: Record<string, boolean> = {};
      selectedPermohonan.dataBaru.forEach((db: any, idx: number) => {
        const itemKey = db.id || `pecahan_${idx}`;
        initialMap[itemKey] = selectedPermohonan.status === "COMPLETED" || !!db.isVerified;
      });
      setCheckedPecahanMap(initialMap);
    } else {
      setCheckedPecahanMap({});
    }
  }, [selectedPermohonan?.id, selectedPermohonan?.status, selectedPermohonan?.dataBaru]);

  // Handler: Toggle individual DataBaru verification (persisted to Database)
  const handleTogglePecahanVerified = async (dbId: string | undefined, itemKey: string, isChecked: boolean) => {
    setCheckedPecahanMap(prev => ({ ...prev, [itemKey]: isChecked }));

    // Optimistically update permohonanList & selectedPermohonan state so card progress updates instantly
    setPermohonanList(prevList => prevList.map(p => {
      if (p.id === selectedPermohonan?.id && p.dataBaru) {
        const updatedDataBaru = p.dataBaru.map((db: any, idx: number) => {
          const key = db.id || `pecahan_${idx}`;
          return (db.id === dbId || key === itemKey) ? { ...db, isVerified: isChecked } : db;
        });
        return { ...p, dataBaru: updatedDataBaru };
      }
      return p;
    }));

    if (selectedPermohonan && selectedPermohonan.dataBaru) {
      setSelectedPermohonan((prev: any) => {
        if (!prev) return prev;
        const updatedDataBaru = prev.dataBaru.map((db: any, idx: number) => {
          const key = db.id || `pecahan_${idx}`;
          return (db.id === dbId || key === itemKey) ? { ...db, isVerified: isChecked } : db;
        });
        return { ...prev, dataBaru: updatedDataBaru };
      });
    }

    const targetId = dbId || itemKey;
    if (targetId && !targetId.startsWith("pecahan_")) {
      const res = await toggleVerifyDataBaru(targetId, isChecked);
      if (!res.success) {
        console.error("[TOGGLE-VERIFY-FAIL]", res.error);
      }
    }
  };

  // Handler: Verify all DataBaru entries (persisted to Database)
  const handleVerifyAllPecahan = async () => {
    if (!selectedPermohonan || !selectedPermohonan.dataBaru) return;

    const allMap: Record<string, boolean> = {};
    selectedPermohonan.dataBaru.forEach((db: any, idx: number) => {
      allMap[db.id || `pecahan_${idx}`] = true;
    });
    setCheckedPecahanMap(allMap);

    setPermohonanList(prevList => prevList.map(p => {
      if (p.id === selectedPermohonan.id && p.dataBaru) {
        const updatedDataBaru = p.dataBaru.map((db: any) => ({ ...db, isVerified: true }));
        return { ...p, dataBaru: updatedDataBaru };
      }
      return p;
    }));

    setSelectedPermohonan((prev: any) => {
      if (!prev) return prev;
      const updatedDataBaru = (prev.dataBaru || []).map((db: any) => ({ ...db, isVerified: true }));
      return { ...prev, dataBaru: updatedDataBaru };
    });

    await verifyAllDataBaru(selectedPermohonan.id);
  };

  // Pagination states
  const [currentBundlePage, setCurrentBundlePage] = useState(1);
  const [itemsPerBundlePage, setItemsPerBundlePage] = useState(8);
  const [currentPantauPage, setCurrentPantauPage] = useState(1);
  const searchBundleInputRef = useRef<HTMLInputElement | null>(null);

  const fetchData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    else setListLoading(true);
    setError("");

    try {
      const res = await getMonitoringPermohonan();
      if (res.success && 'list' in res && res.list) {
        setPermohonanList(res.list);

        if (selectedPermohonan) {
          const updated = res.list.find((p) => p.id === selectedPermohonan.id);
          setSelectedPermohonan(updated || null);
        }

        if (selectedBundle) {
          const updatedBundlePermohonans = res.list.filter((p: any) => p.bundleId === selectedBundle.id);
          if (updatedBundlePermohonans && updatedBundlePermohonans.length > 0) {
            setSelectedBundle((prev: any) => ({
              ...prev,
              permohonan: updatedBundlePermohonans
            }));
          } else {
            setSelectedBundle(null);
          }
        }
      } else {
        setError('error' in res && res.error ? res.error : "Gagal memuat antrean pemantauan.");
      }
    } catch (err: any) {
      setError(err.message || "Kesalahan koneksi ke server.");
    } finally {
      setListLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedPermohonan, selectedBundle]);

  useEffect(() => {
    fetchData();
  }, []);

  // Keyboard shortcut: Ctrl+K or '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      const isTyping = tag === 'input' || tag === 'textarea' || tag === 'select' || (e.target as HTMLElement).isContentEditable;
      if ((e.ctrlKey && e.key === 'k') || (e.key === '/' && !isTyping)) {
        e.preventDefault();
        searchBundleInputRef.current?.focus();
        searchBundleInputRef.current?.select();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Reset pagination when search changes
  useEffect(() => {
    setCurrentBundlePage(1);
    setCurrentPantauPage(1);
  }, [searchQuery, searchBundleQuery, filterJenisLayanan, itemsPerBundlePage]);

  // Complete Permohonan
  const handleComplete = (id: string, nomorPermohonan: string) => {
    showConfirm({
      title: "Konfirmasi Penyelesaian",
      message: `Apakah Anda yakin ingin menandai permohonan ${nomorPermohonan} SELESAI?`,
      onConfirm: async () => {
        setLoading(true);
        setError("");
        setSuccess("");
        try {
          const res: any = await completePermohonan(id);
          if (res.success) {
            setSuccess(`Permohonan ${nomorPermohonan} berhasil ditandai selesai!`);
            await fetchData(true);
            setTimeout(() => setSuccess(""), 5000);
          } else {
            setError(res.error || "Gagal menyelesaikan permohonan.");
          }
        } catch (err: any) {
          setError(err.message || "Sistem error.");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Submit Rollback Request: Batal Selesai
  const handleRollback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPermohonan || !rollbackReason.trim()) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res: any = await ajukanBatalSelesai(selectedPermohonan.id, rollbackReason);
      if (res.success) {
        setSuccess("Permintaan rollback 'Batal Selesai' berhasil diajukan dan sedang menunggu keputusan Supervisor.");
        setShowRollbackModal(false);
        setRollbackReason("");
        await fetchData(true);
        setTimeout(() => setSuccess(""), 5000);
      } else {
        setError(res.error || "Gagal mengajukan rollback.");
      }
    } catch (err: any) {
      setError(err.message || "Sistem error.");
    } finally {
      setLoading(false);
    }
  };

  // Unique Bundles list dynamically derived from permohonanList
  const uniqueBundlesList = useMemo(() => {
    const map = new Map();
    permohonanList.forEach((p) => {
      const b = p.bundle;
      if (b && !map.has(b.id)) {
        map.set(b.id, {
          ...b,
          permohonan: [p]
        });
      } else if (b) {
        map.get(b.id).permohonan.push(p);
      }
    });
    return Array.from(map.values());
  }, [permohonanList]);

  // Filters
  const filteredBundlesList = useMemo(() => {
    return uniqueBundlesList.filter((b) => {
      const matchesSearch = b.nomorBundle.toLowerCase().includes(searchBundleQuery.toLowerCase());
      const matchesJenis = filterJenisLayanan === "ALL" || b.jenisPermohonan === filterJenisLayanan;
      return matchesSearch && matchesJenis;
    });
  }, [uniqueBundlesList, searchBundleQuery, filterJenisLayanan]);

  const filteredPantauList = useMemo(() => {
    if (!selectedBundle) return [];
    return (selectedBundle.permohonan || []).filter((p: any) => {
      const matchesSearch =
        p.nop.includes(searchQuery) ||
        p.namaWajibPajak.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.nomorPelayanan && p.nomorPelayanan.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSearch;
    });
  }, [selectedBundle, searchQuery]);

  // Computed KPI Counts for Pemohon & Completion Progress
  const pemohonKpiCounts = useMemo(() => {
    let totalPemohon = 0;
    let completedPemohon = 0;

    permohonanList.forEach((p) => {
      if (p.jenisPermohonan === "MUTASI_SEBAGIAN" && p.dataBaru && p.dataBaru.length > 0) {
        totalPemohon += p.dataBaru.length;
        if (p.status === "COMPLETED") {
          completedPemohon += p.dataBaru.length;
        } else {
          p.dataBaru.forEach((db: any) => {
            if (db.isVerified) completedPemohon++;
          });
        }
      } else {
        totalPemohon += 1;
        if (p.status === "COMPLETED") {
          completedPemohon += 1;
        }
      }
    });

    const effectiveTotal = Math.max(totalPemohon, 75);
    const pendingPemohon = Math.max(0, effectiveTotal - completedPemohon);
    const pctCompleted = effectiveTotal > 0 ? Math.round((completedPemohon / effectiveTotal) * 100) : 0;

    return {
      total: effectiveTotal,
      completed: completedPemohon,
      pending: pendingPemohon,
      percentage: pctCompleted
    };
  }, [permohonanList]);

  // Counts for Pemantau Bundle Jenis Layanan Quick Filter Pills
  const bundleJenisCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: uniqueBundlesList.length,
      MUTASI_SEBAGIAN: 0,
      MUTASI_HABIS_UPDATE: 0,
      MUTASI_HABIS_REGULER: 0,
      OBJEK_PAJAK_BARU: 0,
      PEMBETULAN: 0,
      PENGAKTIFAN: 0
    };
    uniqueBundlesList.forEach(b => {
      if (b.jenisPermohonan && counts[b.jenisPermohonan] !== undefined) {
        counts[b.jenisPermohonan]++;
      }
    });
    return counts;
  }, [uniqueBundlesList]);

  // Paginated lists
  const totalBundlePages = Math.ceil(filteredBundlesList.length / itemsPerBundlePage);
  const activeBundlePage = currentBundlePage > totalBundlePages ? 1 : currentBundlePage;
  const paginatedBundles = useMemo(() => {
    return filteredBundlesList.slice(
      (activeBundlePage - 1) * itemsPerBundlePage,
      activeBundlePage * itemsPerBundlePage
    );
  }, [filteredBundlesList, activeBundlePage, itemsPerBundlePage]);

  const totalPantauPages = Math.ceil(filteredPantauList.length / 10);
  const activePantauPage = currentPantauPage > totalPantauPages ? 1 : currentPantauPage;
  const paginatedPantau = useMemo(() => {
    return filteredPantauList.slice(
      (activePantauPage - 1) * 10,
      activePantauPage * 10
    );
  }, [filteredPantauList, activePantauPage]);

  return (
    <div id="pemantau-board-root" className="w-full font-sans select-none animate-fadeIn flex flex-col gap-6">

      {/* Show precision skeleton during initial data load */}
      {listLoading && workspaceTab === "daftar-bundle" && <PemantauBundleSkeleton />}
      {listLoading && workspaceTab === "daftar-pantau" && <PemantauPantauSkeleton />}

      {/* Hide real content while skeleton is visible */}
      <div className={`flex flex-col gap-4 ${listLoading ? "hidden" : ""}`}>

        {/* Alert Banner jika terdapat berkas frozen/sedang dikoreksi */}
        <RevisionAlertBanner
          count={permohonanList.filter(p => p.permintaanKoreksi && p.permintaanKoreksi.length > 0).length}
          titlePrefix="Perhatian, "
          titleText="Berkas Dibekukan (Sedang Koreksi)"
          descriptionText="berkas permohonan sedang diajukan pembatalan/koreksi dan menunggu keputusan Supervisor."
          actionLabel="Lihat Antrean Pantau"
          onAction={() => {
            setWorkspaceTab("daftar-pantau");
          }}
        />

        {/* TIER 1: UNIFIED KPI STATS STRIP (Clean Neutral Slate Styling matching Peneliti) */}
        <div className="bg-white border border-slate-200/90 rounded-md p-1.5 shadow-3xs select-none font-sans">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            {/* Metric 1: Total Pemohon */}
            <div
              className="p-2.5 px-3 flex items-center justify-between transition-all rounded-md hover:bg-slate-50 text-slate-600"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px] font-normal text-slate-600 capitalize font-sans">Total Pemohon</span>
                <span className="text-lg font-bold font-mono text-slate-800">{pemohonKpiCounts.total}</span>
              </div>
              <span className="text-[11px] font-semibold font-mono px-1.5 py-0.5 rounded border transition-all bg-[#00a389] text-white border-[#00a389]">
                100%
              </span>
            </div>

            {/* Metric 2: Selesai */}
            <div
              className="p-2.5 px-3 flex items-center justify-between transition-all rounded-md hover:bg-slate-50 text-slate-600"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px] font-normal text-slate-600 capitalize font-sans">Selesai</span>
                <span className="text-lg font-bold font-mono text-slate-800">{pemohonKpiCounts.completed}</span>
              </div>
              <span className="text-[11px] font-semibold font-mono px-1.5 py-0.5 rounded border transition-all bg-slate-100 text-slate-600 border-slate-200/80">
                {pemohonKpiCounts.percentage}%
              </span>
            </div>

            {/* Metric 3: Belum Selesai (Selisih) */}
            <div
              className="p-2.5 px-3 flex items-center justify-between transition-all rounded-md hover:bg-slate-50 text-slate-600"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px] font-normal text-slate-600 capitalize font-sans">Belum Selesai</span>
                <span className="text-lg font-bold font-mono text-slate-800">{pemohonKpiCounts.pending}</span>
              </div>
              <span className="text-[11px] font-semibold font-mono px-1.5 py-0.5 rounded border transition-all bg-slate-100 text-slate-600 border-slate-200/80">
                {pemohonKpiCounts.total > 0 ? `${Math.round((pemohonKpiCounts.pending / pemohonKpiCounts.total) * 100)}%` : '0%'}
              </span>
            </div>

            {/* Metric 4: Progres Penyelesaian */}
            <div
              className="p-2.5 px-3 flex items-center justify-between transition-all rounded-md hover:bg-slate-50 text-slate-600"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px] font-normal text-slate-600 capitalize font-sans">Progres</span>
                <span className="text-lg font-bold font-mono text-slate-800">{pemohonKpiCounts.percentage}%</span>
              </div>
              <span className="text-[11px] font-semibold font-mono px-1.5 py-0.5 rounded border transition-all bg-slate-100 text-slate-600 border-slate-200/80">
                {pemohonKpiCounts.completed}/{pemohonKpiCounts.total}
              </span>
            </div>
          </div>
        </div>

        {/* Clean View Mode Switcher Tabs (Equal Width 2 Tabs Layout) */}
        <div className="bg-slate-100/90 border border-slate-200/80 p-1 rounded-md grid grid-cols-2 gap-1 shadow-3xs select-none font-sans">
          <button
            type="button"
            onClick={() => handleSwitchTab("daftar-bundle")}
            className={`py-2 px-3 rounded-md text-[13px] font-normal text-center transition-all cursor-pointer font-sans capitalize ${workspaceTab === "daftar-bundle"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
          >
            Daftar Bundle Pemantauan
          </button>
          <button
            type="button"
            onClick={() => handleSwitchTab("daftar-pantau")}
            className={`py-2 px-3 rounded-md text-[13px] font-normal text-center transition-all cursor-pointer font-sans capitalize ${workspaceTab === "daftar-pantau"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
          >
            Selesaikan Permohonan
          </button>
        </div>

        {/* Error & Success Banners */}
        {error && (
          <div className="bg-rose-50/90 border border-rose-200 text-rose-800 text-xs font-bold rounded-md px-4 py-3 flex items-start gap-2 animate-fadeIn shrink-0 shadow-3xs">
            <span className="flex-1">{error}</span>
            <button onClick={() => setError("")} className="text-rose-400 hover:text-rose-600 shrink-0 cursor-pointer font-bold">
              ✕
            </button>
          </div>
        )}
        {success && (
          <div className="bg-emerald-50/90 border border-emerald-200 text-[#008f78] text-xs font-bold rounded-md px-4 py-3 flex items-start gap-2 animate-fadeIn shrink-0 shadow-3xs">
            <span className="flex-1">{success}</span>
            <button onClick={() => setSuccess("")} className="text-emerald-500 hover:text-emerald-700 shrink-0 cursor-pointer font-bold">
              ✕
            </button>
          </div>
        )}

        {/* ==================== TAB: DAFTAR BUNDLE ==================== */}
        {workspaceTab === "daftar-bundle" && (
          <div className="flex flex-col gap-4">
            {/* TIER 2: UNIFIED COMMAND BAR & QUICK FILTER CHIPS (Terpisah Dari Card Utama — Identik Peneliti) */}
            <div className="flex flex-col gap-2.5 bg-[#f8fafc] border border-slate-200/80 p-3 rounded-md shadow-3xs select-none font-sans">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
                {/* Search input for Bundles (Identik Peneliti dengan Ikon Search) */}
                <div className="relative w-full md:w-[403px] max-w-full font-sans">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
                  <input
                    type="text"
                    ref={searchBundleInputRef}
                    value={searchBundleQuery}
                    onChange={(e) => setSearchBundleQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className="w-full h-10 pl-9 pr-9 bg-white border border-slate-200/90 rounded-md text-[13px] font-normal text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 transition-all shadow-3xs font-sans"
                    placeholder="Cari nomor bundle..."
                  />
                  {!isSearchFocused && !searchBundleQuery && (
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200/80 select-none pointer-events-none font-sans">
                      Ctrl+K
                    </span>
                  )}
                  {searchBundleQuery && (
                    <button
                      onClick={() => setSearchBundleQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 z-10 p-0.5 rounded-full hover:bg-slate-100 transition-colors font-bold cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Refresh Icon Button (Identik Peneliti) */}
                <button
                  onClick={() => fetchData(true)}
                  disabled={isRefreshing || listLoading}
                  className="h-10 w-10 rounded-md border border-slate-200/90 bg-white hover:bg-slate-100 text-slate-500 transition-all cursor-pointer disabled:opacity-40 shadow-3xs flex items-center justify-center shrink-0"
                  title="Refresh Data"
                >
                  <RefreshCw className={`w-4 h-4 transition-all duration-300 ${isRefreshing ? 'animate-spin text-[#00a389]' : ''}`} />
                </button>
              </div>

              {/* Quick Filter Chips (Pilih Jenis Layanan Praktis dengan Angka Count) */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1 border-t border-slate-200/60 select-none font-sans">
                {[
                  { val: 'ALL', label: 'Semua' },
                  { val: 'MUTASI_SEBAGIAN', label: 'Mutasi Sebagian' },
                  { val: 'MUTASI_HABIS_UPDATE', label: 'Mutasi Habis (Update)' },
                  { val: 'MUTASI_HABIS_REGULER', label: 'Mutasi Habis (Reguler)' },
                  { val: 'OBJEK_PAJAK_BARU', label: 'OP Baru' },
                  { val: 'PEMBETULAN', label: 'Pembetulan' },
                  { val: 'PENGAKTIFAN', label: 'Pengaktifan' }
                ].map((item) => {
                  const isActive = filterJenisLayanan === item.val;
                  const count = bundleJenisCounts[item.val] ?? 0;
                  return (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => {
                        setFilterJenisLayanan(item.val);
                        setCurrentBundlePage(1);
                      }}
                      className={`px-3.5 py-1 rounded-md text-[13px] font-normal transition-all shrink-0 flex items-center gap-1.5 cursor-pointer border font-sans capitalize ${isActive
                        ? "bg-[#00a389] text-white border-[#00a389] shadow-3xs"
                        : "bg-white text-slate-500 hover:bg-slate-50 border-gray-200/90"
                        }`}
                    >
                      <span>{item.label}</span>
                      <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-semibold ${isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                        }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Cards Grid Container */}
            <div className="bg-white border border-slate-200/90 rounded-md p-5 sm:p-6 shadow-3xs flex flex-col gap-6 min-h-[300px]">

            {/* Bundle Cards Grid (Exact Preserved Content, Palette & Rounded-md Updated) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
              {paginatedBundles.length === 0 ? (
                <div className="col-span-full py-8 font-sans">
                  <EmptyDataAnimation
                    title={searchBundleQuery ? "Hasil Pencarian Tidak Ditemukan" : "Belum Ada Bundle"}
                    description={
                      searchBundleQuery
                        ? "Tidak ada bundle yang sesuai dengan kriteria pencarian."
                        : "Tidak ada bundle aktif dalam antrean pemantauan."
                    }
                  />
                </div>
              ) : (
                paginatedBundles.map((b) => {
                  const isSelected = selectedBundle?.id === b.id;

                  let totalPemohon = 0;
                  let completedPemohon = 0;

                  (b.permohonan || []).forEach((p: any) => {
                    if (p.jenisPermohonan === "MUTASI_SEBAGIAN" && p.dataBaru && p.dataBaru.length > 0) {
                      totalPemohon += p.dataBaru.length;
                      if (p.status === "COMPLETED") {
                        completedPemohon += p.dataBaru.length;
                      } else {
                        p.dataBaru.forEach((db: any) => {
                          if (db.isVerified) completedPemohon++;
                        });
                      }
                    } else {
                      totalPemohon += 1;
                      if (p.status === "COMPLETED") {
                        completedPemohon += 1;
                      }
                    }
                  });

                  const progressPct = totalPemohon > 0 ? Math.round((completedPemohon / totalPemohon) * 100) : 0;

                  const pembuatName = b.peneliti?.name || "—";
                  const pembuatInitials = pembuatName !== "—"
                    ? pembuatName.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)
                    : "?";
                  const tanggalDibuat = b.createdAt
                    ? new Date(b.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                    : null;

                  return (
                    <div
                      key={b.id}
                      onClick={() => {
                        setSelectedBundle(b);
                        setSelectedPermohonan(null);
                      }}
                      className={`p-4 rounded-md border flex flex-col justify-between gap-3 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer relative overflow-hidden group min-h-[140px] select-none font-sans ${isSelected
                        ? "bg-[#00a389]/5 border-[#00a389] shadow-md ring-2 ring-[#00a389]/20"
                        : "bg-white border-slate-200/90 hover:border-slate-350 hover:shadow-md"
                        }`}
                    >
                      {/* Top Row: Number & Count Badge */}
                      <div className="flex items-center justify-between gap-3 w-full">
                        <span className="text-[13px] font-normal text-slate-800 font-mono tracking-tight truncate block max-w-[170px]" title={b.nomorBundle}>
                          {b.nomorBundle}
                        </span>
                        <span className="flex items-center justify-center bg-[#f25c54] text-white text-[10px] font-black w-5 h-5 rounded-md shrink-0 shadow-2xs font-sans" title={`${totalPemohon} Pemohon`}>
                          {totalPemohon}
                        </span>
                      </div>

                      {/* Middle: Progress bar + badges */}
                      <div className="flex flex-col gap-2.5 pt-2.5 border-t border-slate-100">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between text-[13px] font-normal font-sans">
                            <span className="text-slate-600 capitalize">Progres</span>
                            <span className={`${progressPct === 100 ? "text-[#008f78]" : "text-slate-500"}`}>
                              {completedPemohon}/{totalPemohon} selesai
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-md overflow-hidden">
                            <div
                              className={`h-full rounded-md transition-all duration-500 ${progressPct === 100
                                ? "bg-[#00a389]"
                                : progressPct > 0
                                  ? "bg-[#00a389]/70"
                                  : "bg-slate-200"
                                }`}
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex px-2 py-0.5 rounded-md text-[9px] font-extrabold border leading-none bg-emerald-50 text-[#008f78] border-emerald-200 select-none uppercase tracking-wide">
                            {b.jenisPermohonan ? getAbbreviatedJenis(b.jenisPermohonan) : 'Umum'}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[8px] font-extrabold border bg-emerald-50 text-[#008f78] border-emerald-200 uppercase tracking-wider select-none shrink-0">
                            TERKIRIM
                          </span>
                        </div>
                      </div>

                      {/* Bottom: Pembuat (Peneliti) avatar + tanggal dibuat */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                        <div className="w-5.5 h-5.5 rounded-full bg-[#00a389] text-white text-[8px] font-black flex items-center justify-center shrink-0 shadow-3xs" title={pembuatName}>
                          {pembuatInitials}
                        </div>
                        {tanggalDibuat && (
                          <span className="text-[9px] font-semibold text-slate-400 flex items-center gap-1 shrink-0">
                            {tanggalDibuat}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Table Footer / Pagination for Bundles */}
            <div className="px-5 py-3.5 border border-slate-200/90 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto rounded-md select-none shadow-3xs shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-semibold text-slate-500 font-sans">
                  {filteredBundlesList.length > 0
                    ? `Menampilkan ${((activeBundlePage - 1) * itemsPerBundlePage) + 1}–${Math.min(activeBundlePage * itemsPerBundlePage, filteredBundlesList.length)} dari ${filteredBundlesList.length} bundle`
                    : 'Tidak ada data'}
                </span>
                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-md px-1.5 py-0.5">
                  {[8, 16, 32].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => {
                        setItemsPerBundlePage(n);
                        setCurrentBundlePage(1);
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${itemsPerBundlePage === n
                        ? 'bg-[#00a389] text-white font-extrabold shadow-3xs'
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
                    className="p-1.5 px-2.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-all cursor-pointer shadow-3xs flex items-center justify-center text-xs font-bold"
                  >
                    ‹
                  </button>
                  {Array.from({ length: totalBundlePages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentBundlePage(page)}
                      className={`w-7 h-7 flex items-center justify-center rounded-md text-xs font-bold transition-all cursor-pointer ${activeBundlePage === page
                        ? 'bg-[#00a389] text-white font-extrabold shadow-3xs scale-105'
                        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 shadow-3xs'
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCurrentBundlePage(prev => Math.min(prev + 1, totalBundlePages))}
                    disabled={activeBundlePage === totalBundlePages}
                    className="p-1.5 px-2.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-all cursor-pointer shadow-3xs flex items-center justify-center text-xs font-bold"
                  >
                    ›
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

        {/* ==================== TAB: DAFTAR PANTAU ==================== */}
        {workspaceTab === "daftar-pantau" && (
          <div className="w-full">
            {!selectedBundle ? (
              <div className="bg-white p-8 rounded-md border border-slate-200/90 shadow-3xs min-h-[350px] flex items-center justify-center font-sans">
                <EmptyDataAnimation
                  title="Pilih Bundle Terlebih Dahulu"
                  description={
                    <>
                      Silakan pilih salah satu bundle di tab <strong>Daftar Bundle</strong> terlebih dahulu untuk melihat daftar permohonan yang harus dipantau.
                    </>
                  }
                  action={
                    <button
                      onClick={() => handleSwitchTab("daftar-bundle")}
                      className="px-4 py-2 bg-[#00a389] hover:bg-[#008f78] text-white font-extrabold text-xs rounded-md shadow-3xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 font-sans"
                    >
                      <span>Ke Daftar Bundle</span>
                    </button>
                  }
                />
              </div>
            ) : (
              /* Master-Detail Stacked Panel Layout */
              <div className="bg-white border border-slate-200/90 rounded-md p-5 sm:p-6 shadow-3xs flex flex-col gap-6 min-h-[500px]">
                {/* Top Header Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 select-none font-sans">
                  <div>
                    <h2 className="text-[13px] font-normal text-slate-700 capitalize font-sans flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 text-[13px]">{selectedBundle.nomorBundle}</span>
                    </h2>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
                    <button
                      onClick={() => fetchData(true)}
                      disabled={isRefreshing}
                      className="p-2 h-9 w-9 rounded-md border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-500 shadow-3xs transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center shrink-0"
                      title="Refresh Data"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#00a389]" : ""}`} />
                    </button>
                  </div>
                </div>

                {/* 2-PANEL LAYOUT: PANEL ATAS (Daftar Permohonan) & PANEL BAWAH (Detail Permohonan) */}
                <div className="flex flex-col items-start gap-5 w-full font-sans">

                  {/* PANEL ATAS: 1-Column List of Permohonan */}
                  <div className="w-full bg-white border border-slate-200/90 rounded-md p-4 shadow-3xs flex flex-col gap-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <h4 className="text-[13px] font-normal text-slate-700 capitalize font-sans select-none flex items-center gap-2">
                        <span>Permohonan</span>
                        <span className="bg-emerald-50 text-[#008f78] text-[10px] font-semibold px-2 py-0.5 rounded-md border border-emerald-200">
                          {filteredPantauList.length}
                        </span>
                      </h4>

                      {totalPantauPages > 1 && (
                        <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-500 select-none">
                          <span>Hal {activePantauPage}/{totalPantauPages}</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setCurrentPantauPage((prev) => Math.max(prev - 1, 1))}
                              disabled={activePantauPage === 1}
                              className="p-1 px-2 rounded-md bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer shadow-3xs text-xs font-bold"
                            >
                              ‹
                            </button>
                            <button
                              type="button"
                              onClick={() => setCurrentPantauPage((prev) => Math.min(prev + 1, totalPantauPages))}
                              disabled={activePantauPage === totalPantauPages}
                              className="p-1 px-2 rounded-md bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer shadow-3xs text-xs font-bold"
                            >
                              ›
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 max-h-[calc(100vh-160px)] overflow-y-auto pr-1 flex flex-col gap-1.5 scrollbar-thin">
                      {paginatedPantau.length === 0 ? (
                        <div className="py-8 text-center select-none font-sans">
                          <EmptyDataAnimation
                            title="Hasil Pencarian Tidak Ditemukan"
                            description="Tidak ada berkas permohonan yang sesuai dengan kriteria pencarian/filter."
                          />
                        </div>
                      ) : (
                        paginatedPantau.map((p) => {
                          const isSelected = selectedPermohonan?.id === p.id;
                          const nopolDate = p.tanggalNoPelayanan
                            ? new Date(p.tanggalNoPelayanan).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                            : '—';
                          const isFrozen = p.permintaanKoreksi && p.permintaanKoreksi.length > 0;

                          const sc = isFrozen
                            ? { label: 'Frozen', bg: 'bg-amber-500', badgeBg: 'bg-amber-100', badgeText: 'text-amber-800', badgeBorder: 'border-amber-200', pulse: true }
                            : p.status === 'COMPLETED'
                              ? { label: 'Selesai', bg: 'bg-emerald-500', badgeBg: 'bg-emerald-100', badgeText: 'text-emerald-800', badgeBorder: 'border-emerald-200', pulse: false }
                              : { label: 'Terarsip', bg: 'bg-sky-500', badgeBg: 'bg-sky-100', badgeText: 'text-sky-850', badgeBorder: 'border-sky-200', pulse: false };

                          const pTotalPecahan = p.dataBaru?.length || 1;
                          let pVerifiedPecahan = 0;
                          if (p.status === 'COMPLETED') {
                            pVerifiedPecahan = pTotalPecahan;
                          } else if (p.dataBaru && p.dataBaru.length > 0) {
                            pVerifiedPecahan = p.dataBaru.filter((db: any) => db.isVerified).length;
                          }

                          return (
                            <div
                              key={p.id}
                              onClick={() => setSelectedPermohonan(p)}
                              className={`p-3.5 sm:p-4 rounded-md border transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 relative overflow-hidden select-none shrink-0 min-h-[76px] font-sans ${isSelected
                                ? "bg-[#00a389]/5 border-[#00a389] shadow-md ring-2 ring-[#00a389]/20"
                                : "bg-slate-50/70 border-slate-200/80 hover:border-slate-300 hover:bg-white"
                                }`}
                            >
                              {isSelected && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00a389]" />
                              )}

                              <div className="flex items-center justify-between gap-2 pl-1">
                                <span className="text-[13px] font-normal text-slate-800 font-mono truncate">
                                  {formatNop(p.nop)}
                                </span>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[13px] font-normal capitalize border leading-none shrink-0 ${sc.badgeBg} ${sc.badgeText} ${sc.badgeBorder}`}>
                                  {sc.label}
                                </span>
                              </div>

                              <div className="flex items-center justify-between gap-2 pl-1 text-[13px]">
                                <span className="text-[13px] font-normal text-slate-600 capitalize truncate max-w-md font-sans" title={p.namaWajibPajak}>
                                  {p.namaWajibPajak?.toLowerCase()}
                                </span>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  {p.jenisPermohonan === 'MUTASI_SEBAGIAN' && (
                                    <span className={`inline-flex px-2 py-0.5 rounded-md text-[13px] font-normal capitalize border leading-none ${pVerifiedPecahan === pTotalPecahan
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : pVerifiedPecahan > 0
                                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                                        : 'bg-slate-100 text-slate-500 border-slate-200'
                                      }`}>
                                      {pVerifiedPecahan}/{pTotalPecahan} Verified
                                    </span>
                                  )}
                                  <span className="inline-flex px-2 py-0.5 rounded-md text-[13px] font-normal capitalize border leading-none bg-emerald-50 text-[#008f78] border-emerald-200">
                                    {getAbbreviatedJenis(p.jenisPermohonan || selectedBundle.jenisPermohonan)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* PANEL KANAN: Detail Permohonan (Dynamic Natural Flow) */}
                  <div className="flex-1 min-w-0 w-full bg-white border border-slate-200/90 rounded-md p-5 shadow-3xs flex flex-col gap-5 relative">
                    {selectedPermohonan ? (
                      <div className="flex flex-col gap-5 animate-fadeIn">
                        {/* Frozen Alert Banner */}
                        {selectedPermohonan.permintaanKoreksi && selectedPermohonan.permintaanKoreksi.length > 0 && (
                          <div className="bg-amber-50/70 border border-amber-200 text-amber-800 p-4 rounded-md text-[13px] font-normal select-none flex flex-col gap-1.5 animate-fadeIn shrink-0 shadow-3xs">
                            <p className="flex items-center gap-1.5 font-normal">
                              Permohonan ini dibekukan (LOCKED)
                            </p>
                            <p className="text-[13px] text-amber-700 leading-relaxed pl-5 font-normal">
                              Tindakan koreksi pembatalan selesai (<strong>Rollback</strong>) telah diajukan dan sedang menunggu persetujuan dari Supervisor sebelum status berkas dapat dipulihkan ke Terarsip.
                              Catatan: "{selectedPermohonan.permintaanKoreksi[0].catatanPengaju}"
                            </p>
                          </div>
                        )}

                        {/* Timeline Stepper & Detail Riwayat Penanggung Jawab */}
                        {(() => {
                          const stepsData = [
                            {
                              label: "Diinput",
                              key: "INPUTTED",
                              roleLabel: "Penginput",
                              actorName: selectedPermohonan.penginput?.name || "Petugas Penginput",
                              dateStr: selectedPermohonan.createdAt
                                ? new Date(selectedPermohonan.createdAt).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                                : "—"
                            },
                            {
                              label: "Diteliti",
                              key: "RESEARCHED",
                              roleLabel: "Peneliti",
                              actorName: selectedPermohonan.bundle?.peneliti?.name || "Petugas Peneliti",
                              dateStr: selectedPermohonan.bundle?.createdAt
                                ? new Date(selectedPermohonan.bundle.createdAt).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                                : "—"
                            },
                            {
                              label: "Diarsip",
                              key: "ARCHIVED",
                              roleLabel: "Pengarsip",
                              actorName: selectedPermohonan.arsipDigital?.[0]?.pengarsip?.name || "Petugas Pengarsip",
                              dateStr: selectedPermohonan.arsipDigital?.[0]?.createdAt
                                ? new Date(selectedPermohonan.arsipDigital[0].createdAt).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                                : "—"
                            },
                            {
                              label: "Dikirim",
                              key: "SENT",
                              roleLabel: "Pengirim",
                              actorName: selectedPermohonan.bundle?.manifest?.pengirim?.name || "Petugas Pengirim",
                              dateStr: selectedPermohonan.bundle?.manifest?.updatedAt
                                ? new Date(selectedPermohonan.bundle.manifest.updatedAt).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                                : "—"
                            },
                            {
                              label: "Dipantau",
                              key: "MONITORING",
                              roleLabel: "Pemantau",
                              actorName: session?.user?.name ? `${session.user.name}` : "Petugas Pemantau",
                              dateStr: selectedPermohonan.bundle?.manifest?.updatedAt
                                ? new Date(selectedPermohonan.bundle.manifest.updatedAt).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                                : "—"
                            },
                            {
                              label: "Selesai",
                              key: "COMPLETED",
                              roleLabel: "Penyelesaian",
                              actorName: selectedPermohonan.status === "COMPLETED" ? (session?.user?.name || selectedPermohonan.penginput?.name || "Petugas Pemantau") : "Menunggu Selesai",
                              dateStr: selectedPermohonan.tanggalPenyelesaian
                                ? new Date(selectedPermohonan.tanggalPenyelesaian).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                                : selectedPermohonan.status === "COMPLETED"
                                  ? new Date(selectedPermohonan.updatedAt).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                                  : "—"
                            }
                          ];

                          const isAllCompleted = selectedPermohonan.status === "COMPLETED";
                          const activeIndex = isAllCompleted ? 5 : 4;

                          return (
                            <div className="bg-slate-50/90 p-4 rounded-md border border-slate-200/80 select-none flex flex-col gap-4 shadow-3xs font-sans">
                              <div className="flex items-center justify-end border-b border-slate-200/70 pb-2">
                                <span className="text-[13px] font-normal text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                                  6 Tahapan Siklus
                                </span>
                              </div>

                              {/* Horizontal Stepper */}
                              <div className="flex items-start justify-between w-full overflow-x-auto pt-1 pb-2">
                                {stepsData.map((step, i) => {
                                  const isDone = isAllCompleted || i < activeIndex;
                                  const isCurrent = !isAllCompleted && i === activeIndex;

                                  return (
                                    <React.Fragment key={step.key}>
                                      <div className="flex flex-col items-center gap-1 shrink-0 z-10 min-w-[60px] text-center">
                                        <div
                                          className={`w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-normal transition-all duration-300 ${isDone
                                            ? "bg-[#00a389] text-white shadow-3xs"
                                            : isCurrent
                                              ? "bg-[#00a389] text-white shadow-md ring-4 ring-[#00a389]/20 scale-105"
                                              : "bg-slate-200 text-slate-400 border border-slate-300/60"
                                            }`}
                                        >
                                          {isDone ? (
                                            <span>✓</span>
                                          ) : isCurrent ? (
                                            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                          ) : (
                                            <span>{i + 1}</span>
                                          )}
                                        </div>
                                        <span
                                          className={`text-[13px] font-normal whitespace-nowrap ${isDone
                                            ? "text-[#008f78]"
                                            : isCurrent
                                              ? "text-[#008f78]"
                                              : "text-slate-400"
                                            }`}
                                        >
                                          {step.label}
                                        </span>
                                        <span className="text-[13px] font-normal text-slate-500 truncate max-w-[70px]" title={step.actorName}>
                                          {step.actorName.split(" ")[0]}
                                        </span>
                                      </div>

                                      {i < stepsData.length - 1 && (
                                        <div className="flex-1 mx-1 mt-3.5 min-w-[12px]">
                                          <div
                                            className={`h-0.5 w-full rounded-full transition-all duration-300 ${i < activeIndex || isAllCompleted
                                              ? "bg-[#00a389]"
                                              : "bg-slate-200"
                                              }`}
                                          />
                                        </div>
                                      )}
                                    </React.Fragment>
                                  );
                                })}
                              </div>

                            </div>
                          );
                        })()}

                        {/* Row Top: Data Utama Permohonan & Data Objek Lama Berjejer (Side by Side) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full items-start font-sans">

                          {/* Card 1: Data Utama Permohonan */}
                          <div className="bg-slate-50/80 p-4 rounded-md border border-slate-200/70 flex flex-col gap-2.5 w-full">
                            <h5 className="text-[13px] font-normal text-slate-700 capitalize font-sans border-b border-slate-200/60 pb-1.5 flex items-center justify-between">
                              <span>Data Utama</span>
                            </h5>
                            <div className="grid grid-cols-[120px_8px_1fr] gap-y-2 text-[13px] font-normal items-baseline bg-white p-3.5 rounded-md border border-slate-200/60 shadow-3xs">
                              <span className="text-slate-500 font-normal">NOP</span>
                              <span className="text-slate-400 font-normal">:</span>
                              <span className="text-slate-800 font-normal font-mono">{formatNop(selectedPermohonan.nop)}</span>

                              <span className="text-slate-500 font-normal">Nama WP</span>
                              <span className="text-slate-400 font-normal">:</span>
                              <span className="text-slate-800 font-normal uppercase">{selectedPermohonan.namaWajibPajak}</span>

                              <span className="text-slate-500 font-normal">Alamat WP</span>
                              <span className="text-slate-400 font-normal">:</span>
                              <span className="text-slate-700 font-normal">{selectedPermohonan.alamat}</span>

                              <span className="text-slate-500 font-normal">No. WhatsApp</span>
                              <span className="text-slate-400 font-normal">:</span>
                              <span className="text-slate-700 font-normal">{selectedPermohonan.noWhatsapp}</span>
                            </div>
                          </div>

                          {/* Card 2: Data Objek Lama (Berjejer dengan Data Utama) */}
                          {selectedPermohonan.namaPemilikLama && (
                            <div className="bg-slate-50/80 p-4 rounded-md border border-slate-200/70 flex flex-col gap-2.5 w-full">
                              <h5 className="text-[13px] font-normal text-slate-700 capitalize font-sans border-b border-slate-200/60 pb-1.5">
                                Data Lama (Asal)
                              </h5>
                              <div className="grid grid-cols-[120px_8px_1fr] gap-y-2 text-[13px] font-normal items-baseline bg-white p-3.5 rounded-md border border-slate-200/70 shadow-3xs">
                                <span className="text-slate-500 font-normal">Pemilik Lama</span>
                                <span className="text-slate-400 font-normal">:</span>
                                <span className="text-slate-700 font-normal uppercase">{selectedPermohonan.namaPemilikLama}</span>

                                {selectedPermohonan.luasTanahLama !== undefined && selectedPermohonan.luasTanahLama !== null && (
                                  <>
                                    <span className="text-slate-500 font-normal">Luas Tanah</span>
                                    <span className="text-slate-400 font-normal">:</span>
                                    <span className="text-slate-700 font-normal">{selectedPermohonan.luasTanahLama} m²</span>
                                  </>
                                )}

                                {selectedPermohonan.luasBangunanLama !== undefined && selectedPermohonan.luasBangunanLama !== null && (
                                  <>
                                    <span className="text-slate-500 font-normal">Luas Bangunan</span>
                                    <span className="text-slate-400 font-normal">:</span>
                                    <span className="text-slate-700 font-normal">{selectedPermohonan.luasBangunanLama} m²</span>
                                  </>
                                )}

                                {selectedPermohonan.sertifikatLama && (
                                  <>
                                    <span className="text-slate-500 font-normal">Sertifikat</span>
                                    <span className="text-slate-400 font-normal">:</span>
                                    <span className="text-slate-700 font-normal uppercase">{selectedPermohonan.sertifikatLama}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          )}

                        </div>

                        {/* Section Data Objek Baru (Kondisional Pecahan vs Objek Baru) */}
                        {selectedPermohonan.dataBaru && selectedPermohonan.dataBaru.length > 0 && (
                          <div className="bg-slate-50/80 p-4 rounded-md border border-slate-200/70 select-none flex flex-col gap-3 font-sans w-full">
                            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                              <h5 className="text-[13px] font-normal text-slate-700 capitalize font-sans flex items-center gap-1.5">
                                Data Baru {selectedPermohonan.jenisPermohonan === "MUTASI_SEBAGIAN" && selectedPermohonan.dataBaru.length > 1 ? `(${selectedPermohonan.dataBaru.length} Pecahan)` : ''}
                              </h5>

                              {selectedPermohonan.dataBaru.length > 1 && selectedPermohonan.status !== "COMPLETED" && (
                                <div className="flex items-center gap-2">
                                  <span className="text-[13px] font-normal text-[#008f78] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                                    {Object.values(checkedPecahanMap).filter(Boolean).length}/{selectedPermohonan.dataBaru.length} Terverifikasi
                                  </span>
                                  <button
                                    type="button"
                                    onClick={handleVerifyAllPecahan}
                                    className="text-[13px] font-normal text-white bg-[#00a389] hover:bg-[#008f78] px-2.5 py-1 rounded-md transition-all active:scale-95 cursor-pointer shadow-3xs"
                                  >
                                    Selesaikan Semua
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Grid Objek Baru / Pecahan Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 items-start">
                              {selectedPermohonan.dataBaru.map((db: any, idx: number) => {
                                const itemKey = db.id || `pecahan_${idx}`;
                                const isChecked = selectedPermohonan.status === "COMPLETED" || !!checkedPecahanMap[itemKey];
                                const isMutasiSebagian = selectedPermohonan.jenisPermohonan === "MUTASI_SEBAGIAN";

                                return (
                                  <div
                                    key={itemKey}
                                    className={`grid grid-cols-[120px_8px_1fr] gap-y-2 text-[13px] font-normal items-baseline p-3.5 rounded-md border transition-all shadow-3xs ${isChecked
                                      ? "bg-emerald-50/40 border-emerald-200/90 ring-1 ring-emerald-500/10"
                                      : "bg-white border-slate-200/80 hover:border-slate-300"
                                      }`}
                                  >
                                    <div className="col-span-3 flex items-center justify-between border-b border-slate-100 pb-1.5 mb-1 select-none">
                                      <span className="text-[13px] font-normal text-slate-800 flex items-center gap-1.5">
                                        {isMutasiSebagian && (
                                          <span className="w-4 h-4 rounded-full bg-emerald-50 text-[#008f78] border border-emerald-200 text-[10px] flex items-center justify-center font-normal shrink-0">
                                            {idx + 1}
                                          </span>
                                        )}
                                        {isMutasiSebagian
                                          ? `Pecahan Objek #${idx + 1}`
                                          : selectedPermohonan.dataBaru.length > 1
                                            ? `Objek Baru #${idx + 1}`
                                            : "Data Objek Baru"
                                        }
                                      </span>

                                      {selectedPermohonan.status !== "COMPLETED" ? (
                                        <label className="inline-flex items-center gap-1.5 cursor-pointer select-none bg-white px-2.5 py-0.5 rounded-md border border-slate-200 shadow-3xs hover:bg-slate-50">
                                          <input
                                            type="checkbox"
                                            checked={!!checkedPecahanMap[itemKey]}
                                            onChange={(e) => handleTogglePecahanVerified(db.id, itemKey, e.target.checked)}
                                            className="w-3.5 h-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                          />
                                          <span className={`text-[13px] font-normal ${checkedPecahanMap[itemKey] ? "text-emerald-700" : "text-slate-500"}`}>
                                            {checkedPecahanMap[itemKey] ? "Selesai" : "Selesaikan"}
                                          </span>
                                        </label>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 text-[13px] font-normal px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 border border-emerald-200">
                                          Selesai
                                        </span>
                                      )}
                                    </div>

                                    <span className="text-slate-500 font-normal">Pemilik Baru</span>
                                    <span className="text-slate-400 font-normal">:</span>
                                    <span className="text-slate-800 font-normal uppercase">{db.namaPemilikBaru}</span>

                                    {db.alamatPemilikBaru && (
                                      <>
                                        <span className="text-slate-500 font-normal">Alamat</span>
                                        <span className="text-slate-400 font-normal">:</span>
                                        <span className="text-slate-700 font-normal">{db.alamatPemilikBaru}</span>
                                      </>
                                    )}

                                    {db.luasTanahBaru !== undefined && db.luasTanahBaru !== null && (
                                      <>
                                        <span className="text-slate-500 font-normal">Luas Tanah</span>
                                        <span className="text-slate-400 font-normal">:</span>
                                        <span className="text-slate-700 font-normal">{db.luasTanahBaru} m²</span>
                                      </>
                                    )}

                                    {db.luasBangunanBaru !== undefined && db.luasBangunanBaru !== null && (
                                      <>
                                        <span className="text-slate-500 font-normal">Luas Bangunan</span>
                                        <span className="text-slate-400 font-normal">:</span>
                                        <span className="text-slate-700 font-normal">{db.luasBangunanBaru} m²</span>
                                      </>
                                    )}

                                    {db.sertifikatBaru && (
                                      <>
                                        <span className="text-slate-500 font-normal">Sertifikat</span>
                                        <span className="text-slate-400 font-normal">:</span>
                                        <span className="text-slate-700 font-normal uppercase">{db.sertifikatBaru}</span>
                                      </>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Floating Sticky Action Footer */}
                        {(() => {
                          const totalPecahanCount = selectedPermohonan.dataBaru?.length || 0;
                          const verifiedCount = Object.values(checkedPecahanMap).filter(Boolean).length;
                          const isAllPecahanVerified = totalPecahanCount <= 1 || verifiedCount >= totalPecahanCount;
                          const isMutasiSebagian = selectedPermohonan.jenisPermohonan === "MUTASI_SEBAGIAN";

                          return (
                            <div className="sticky bottom-4 z-30 bg-white/95 backdrop-blur-md p-4 rounded-md border border-slate-200/90 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none mt-4 animate-slideUp">
                              <div className="text-[13px] text-slate-500 font-normal flex items-center gap-1.5">
                                {selectedPermohonan.status === "ARCHIVED" && (
                                  <span>
                                    {!isAllPecahanVerified
                                      ? `⚠️ Harap verifikasi seluruh ${isMutasiSebagian ? 'pecahan' : 'objek baru'} (${verifiedCount}/${totalPecahanCount}) untuk mengaktifkan tombol penyelesaian.`
                                      : `✓ Seluruh ${isMutasiSebagian ? 'pecahan' : 'objek baru'} terverifikasi! Klik tombol untuk menandai layanan PBB selesai.`}
                                  </span>
                                )}
                                {selectedPermohonan.status === "COMPLETED" && (
                                  <span>* Klik tombol jika perlu membatal-selesaikan berkas.</span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 justify-end shrink-0">
                                {selectedPermohonan.status === "ARCHIVED" && (
                                  <button
                                    onClick={() => handleComplete(selectedPermohonan.id, selectedPermohonan.nomorPermohonan)}
                                    disabled={loading || selectedPermohonan.permintaanKoreksi?.length > 0 || !isAllPecahanVerified}
                                    className="flex items-center gap-1.5 py-2.5 px-4 text-[13px] font-normal text-white bg-[#00a389] hover:bg-[#008f78] active:scale-95 rounded-md shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    title={!isAllPecahanVerified ? `Harap verifikasi seluruh (${totalPecahanCount}) pecahan objek di Data Baru terlebih dahulu` : ""}
                                  >
                                    Tandai Selesai {!isAllPecahanVerified && `(${verifiedCount}/${totalPecahanCount})`}
                                  </button>
                                )}

                                {selectedPermohonan.status === "COMPLETED" && (
                                  <button
                                    onClick={() => setShowRollbackModal(true)}
                                    disabled={loading || selectedPermohonan.permintaanKoreksi?.length > 0}
                                    className="flex items-center gap-1.5 py-2.5 px-4.5 text-[13px] font-normal text-white bg-rose-600 hover:bg-rose-700 active:scale-95 rounded-md shadow-3xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    Batal Selesai
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })()}

                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 p-8 my-auto select-none font-sans">
                        <img
                          src="/assets/Select-bro.svg"
                          alt="Pilih Permohonan"
                          className="w-48 h-48 sm:w-56 sm:h-56 max-w-full object-contain pointer-events-none drop-shadow-xs mb-2"
                        />
                        <h4 className="text-sm font-extrabold text-slate-800 tracking-tight font-sans">Pilih Permohonan</h4>
                        <p className="text-xs text-slate-500 font-normal leading-relaxed max-w-xs mt-1 font-sans">
                          Klik salah satu berkas permohonan di panel atas untuk menampilkan detail dan tombol aksi.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================= MODAL: AJUKAN ROLLBACK (BATAL SELESAI) ================= */}
      {showRollbackModal && selectedPermohonan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 select-none animate-fadeIn">
          <div className="bg-white rounded-md shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-scaleUp">

            {/* Modal Header */}
            <div className="bg-white border-b border-slate-200/80 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-black text-slate-900 tracking-tight">
                  Batal Selesai (Rollback)
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowRollbackModal(false);
                  setRollbackReason("");
                }}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleRollback}>
              <div className="p-5 flex flex-col gap-4 text-xs">
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-md leading-relaxed text-rose-800 font-semibold">
                  <p>
                    Anda mengajukan pembatalan status selesai (Rollback) untuk berkas NOP:{" "}
                    <strong className="font-mono">{formatNop(selectedPermohonan.nop)}</strong>.
                  </p>
                  <p className="text-[10px] text-rose-700 mt-1.5 font-bold">
                    * Tindakan ini bersifat destruktif, memerlukan persetujuan Supervisor, dan akan membekukan berkas hingga diputuskan.
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="catatan-rollback" className="font-extrabold text-slate-700">
                    Alasan pembatalan / rollback berkas <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="catatan-rollback"
                    rows={4}
                    value={rollbackReason}
                    onChange={(e) => setRollbackReason(e.target.value)}
                    placeholder="Masukkan alasan detail mengapa status selesai harus dibatalkan (misalnya: produk layanan cacat cetak, dibatalkan oleh WP, salah menandai berkas, dll.)"
                    className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:outline-none focus:border-[#00a389] text-xs font-semibold rounded-md px-3.5 py-2.5 transition-all text-slate-800 resize-none shadow-3xs"
                    required
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="bg-slate-50 border-t border-slate-200/80 px-5 py-3.5 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowRollbackModal(false);
                    setRollbackReason("");
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-all cursor-pointer shadow-3xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading || !rollbackReason.trim()}
                  className="px-4 py-2 text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 rounded-md flex items-center gap-1.5 shadow-3xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Ajukan Rollback Status
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}