"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ShieldCheck,
  Search,
  Clock,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ListFilter,
  X,
  Eye,
  Check,
  History,
  Inbox,
  TrendingUp,
  Boxes,
  RotateCcw,
  FileOutput,
  ArrowLeftRight,
  Loader2,
  User,
  Calendar,
  FileText
} from "lucide-react";
import {
  getPendingKoreksi,
  getKoreksiHistory,
  getSupervisorStats,
  approveKoreksi,
  rejectKoreksi
} from "@/app/actions/supervisor";
import { useDashboard } from "@/context/DashboardContext";
import { SkeletonBox, SkeletonText } from "@/components/skeletons/SkeletonBase";
import { EmptyDataAnimation } from "@/components/workspaces/shared/EmptyDataAnimation";

type WorkspaceTab = "queue" | "history";

/** Skeleton dasar KPI Strip & Tabs untuk SupervisorWorkspace */
function SupervisorBaseHeaderSkeleton() {
  return (
    <>
      {/* TIER 1: KPI STATS STRIP (4 Cards) */}
      <div className="bg-white border border-slate-200/90 rounded-md p-1.5 shadow-3xs select-none">
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-3 px-3.5 flex items-center justify-between gap-2 rounded-md">
              <div className="flex flex-col gap-1.5 w-full">
                <SkeletonBox width="w-24" height="h-3" rounded="rounded-sm" />
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

/** Skeleton presisi untuk Tab 1: Antrean Persetujuan */
export function SupervisorQueueSkeleton() {
  return (
    <div className="w-full font-sans select-none flex flex-col gap-4 animate-fadeIn">
      <SupervisorBaseHeaderSkeleton />

      <div className="bg-white border border-slate-200/90 rounded-md p-5 sm:p-6 shadow-3xs flex flex-col gap-6 min-h-[300px]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <SkeletonBox width="w-full md:w-[403px]" height="h-10" rounded="rounded-md" />
          <SkeletonBox width="w-10" height="h-10" rounded="rounded-md" />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBox key={i} width="w-24" height="h-7" rounded="rounded-full" />
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-md border border-slate-200/90 p-4 flex items-center gap-4">
              <SkeletonBox width="w-8" height="h-8" rounded="rounded-md" />
              <div className="flex-1 flex flex-col gap-2">
                <SkeletonText width="w-48" height="h-3" />
                <SkeletonText width="w-32" height="h-2.5" />
              </div>
              <SkeletonBox width="w-20" height="h-7" rounded="rounded-md" />
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

/** Skeleton presisi untuk Tab 2: Riwayat Keputusan */
export function SupervisorHistorySkeleton() {
  return (
    <div className="w-full font-sans select-none flex flex-col gap-4 animate-fadeIn">
      <SupervisorBaseHeaderSkeleton />

      <div className="bg-white border border-slate-200/90 rounded-md p-5 sm:p-6 shadow-3xs flex flex-col gap-6 min-h-[300px]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <SkeletonBox width="w-full md:w-[403px]" height="h-10" rounded="rounded-md" />
          <SkeletonBox width="w-10" height="h-10" rounded="rounded-md" />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBox key={i} width="w-24" height="h-7" rounded="rounded-full" />
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-md border border-slate-200/90 p-4 flex items-center gap-4">
              <SkeletonBox width="w-8" height="h-8" rounded="rounded-md" />
              <div className="flex-1 flex flex-col gap-2">
                <SkeletonText width="w-48" height="h-3" />
                <SkeletonText width="w-32" height="h-2.5" />
              </div>
              <SkeletonBox width="w-20" height="h-7" rounded="rounded-md" />
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

const JENIS_LABEL: Record<string, { label: string; icon: React.ReactNode; color: string; dot: string }> = {
  KELUARKAN_DARI_BUNDLE: {
    label: 'Keluarkan dari Bundle',
    icon: <Boxes className="w-3.5 h-3.5" />,
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
    dot: 'bg-indigo-500'
  },
  KEMBALIKAN_KE_PENELITI: {
    label: 'Kembalikan ke Peneliti',
    icon: <RotateCcw className="w-3.5 h-3.5" />,
    color: 'bg-amber-50 text-amber-700 border-amber-200/60',
    dot: 'bg-amber-500'
  },
  KEMBALIKAN_KE_PENGARSIP: {
    label: 'Kembalikan ke Pengarsip',
    icon: <FileOutput className="w-3.5 h-3.5" />,
    color: 'bg-orange-50 text-orange-700 border-orange-200/60',
    dot: 'bg-orange-500'
  },
  BATAL_SELESAI: {
    label: 'Batal Selesai',
    icon: <ArrowLeftRight className="w-3.5 h-3.5" />,
    color: 'bg-rose-50 text-rose-700 border-rose-200/60',
    dot: 'bg-rose-500'
  }
};

function JenisBadge({ jenis }: { jenis: string }) {
  const meta = JENIS_LABEL[jenis] ?? { label: jenis, icon: null, color: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${meta.color} whitespace-nowrap`}>
      {meta.icon}
      {meta.label}
    </span>
  );
}

function formatDate(date: string | Date | null | undefined) {
  if (!date) return '—';
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(date));
}

function formatDateShort(date: string | Date | null | undefined) {
  if (!date) return '—';
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date));
}

export default function SupervisorWorkspace() {
  const { showConfirm } = useDashboard();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read URL query parameter ?tab=...&view=queue|history
  const viewParam = searchParams.get('view');

  // Workspace Tab State initialized from URL query param
  const [viewMode, setViewMode] = useState<WorkspaceTab>(() => {
    if (viewParam === 'history') return 'history';
    return 'queue';
  });

  // Sync viewMode when URL query params change (e.g. Browser Back/Forward buttons)
  useEffect(() => {
    if (viewParam === 'history') {
      setViewMode('history');
    } else {
      setViewMode('queue');
    }
  }, [viewParam]);

  // Helper to switch workspace tab and update URL query param
  const handleSwitchTab = useCallback((mode: WorkspaceTab) => {
    setViewMode(mode);
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', mode);
    router.push(`/?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  // Data state
  const [pendingList, setPendingList] = useState<any[]>([]);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ pendingTotal: 0, decidedToday: 0, approvedTotal: 0, rejectedTotal: 0, byJenis: {} });
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Search & filter for pending queue
  const [searchQuery, setSearchQuery] = useState('');
  const [filterJenis, setFilterJenis] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Search & filter for history
  const [historySearch, setHistorySearch] = useState('');
  const [historyFilterJenis, setHistoryFilterJenis] = useState('ALL');
  const [historyFilterStatus, setHistoryFilterStatus] = useState('ALL');
  const [historyPage, setHistoryPage] = useState(1);

  // Dialog state
  const [approveTarget, setApproveTarget] = useState<any>(null);
  const [rejectTarget, setRejectTarget] = useState<any>(null);
  const [approveCatatan, setApproveCatatan] = useState('');
  const [rejectCatatan, setRejectCatatan] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  // Detail modal
  const [detailTarget, setDetailTarget] = useState<any>(null);

  const fetchData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    else setLoading(true);
    try {
      const [pendingRes, historyRes, statsRes] = await Promise.all([
        getPendingKoreksi(),
        getKoreksiHistory(),
        getSupervisorStats()
      ]);
      if (pendingRes.success && 'list' in pendingRes) setPendingList(pendingRes.list);
      if (historyRes.success && 'list' in historyRes) setHistoryList(historyRes.list);
      if (statsRes.success && 'stats' in statsRes) setStats(statsRes.stats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset pagination on filter change
  useEffect(() => { setCurrentPage(1); }, [searchQuery, filterJenis]);
  useEffect(() => { setHistoryPage(1); }, [historySearch, historyFilterJenis, historyFilterStatus]);

  // Filtered + paginated pending list
  const filteredPending = useMemo(() => {
    return pendingList.filter(k => {
      const matchSearch = !searchQuery ||
        k.permohonan?.nomorPermohonan?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        k.permohonan?.namaWajibPajak?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        k.pengaju?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchJenis = filterJenis === 'ALL' || k.jenisKoreksi === filterJenis;
      return matchSearch && matchJenis;
    });
  }, [pendingList, searchQuery, filterJenis]);

  const totalPages = Math.ceil(filteredPending.length / itemsPerPage);
  const activePage = Math.min(currentPage, Math.max(1, totalPages));
  const paginatedPending = useMemo(() => {
    return filteredPending.slice((activePage - 1) * itemsPerPage, activePage * itemsPerPage);
  }, [filteredPending, activePage, itemsPerPage]);

  // Filtered + paginated history list
  const filteredHistory = useMemo(() => {
    return historyList.filter(k => {
      const matchSearch = !historySearch ||
        k.permohonan?.nomorPermohonan?.toLowerCase().includes(historySearch.toLowerCase()) ||
        k.permohonan?.namaWajibPajak?.toLowerCase().includes(historySearch.toLowerCase()) ||
        k.pengaju?.name?.toLowerCase().includes(historySearch.toLowerCase());
      const matchJenis = historyFilterJenis === 'ALL' || k.jenisKoreksi === historyFilterJenis;
      const matchStatus = historyFilterStatus === 'ALL' || k.status === historyFilterStatus;
      return matchSearch && matchJenis && matchStatus;
    });
  }, [historyList, historySearch, historyFilterJenis, historyFilterStatus]);

  const totalHistoryPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const activeHistoryPage = Math.min(historyPage, Math.max(1, totalHistoryPages));
  const paginatedHistory = useMemo(() => {
    return filteredHistory.slice((activeHistoryPage - 1) * itemsPerPage, activeHistoryPage * itemsPerPage);
  }, [filteredHistory, activeHistoryPage, itemsPerPage]);

  // Approve handler
  const handleApprove = async () => {
    if (!approveTarget) return;
    setActionLoading(true);
    setActionError('');
    try {
      const res = await approveKoreksi(approveTarget.id, approveCatatan || undefined);
      if (res.success) {
        setApproveTarget(null);
        setApproveCatatan('');
        await fetchData(true);
      } else {
        setActionError(res.error || 'Gagal menyetujui.');
      }
    } catch {
      setActionError('Terjadi kesalahan.');
    } finally {
      setActionLoading(false);
    }
  };

  // Reject handler
  const handleReject = async () => {
    if (!rejectTarget) return;
    if (!rejectCatatan.trim()) { setActionError('Alasan penolakan wajib diisi.'); return; }
    setActionLoading(true);
    setActionError('');
    try {
      const res = await rejectKoreksi(rejectTarget.id, rejectCatatan);
      if (res.success) {
        setRejectTarget(null);
        setRejectCatatan('');
        await fetchData(true);
      } else {
        setActionError(res.error || 'Gagal menolak.');
      }
    } catch {
      setActionError('Terjadi kesalahan.');
    } finally {
      setActionLoading(false);
    }
  };

  const JENIS_FILTER_OPTS = ['ALL', ...Object.keys(JENIS_LABEL)];

  return (
    <div id="supervisor-board-root" className="w-full font-sans select-none animate-fadeIn flex flex-col gap-6">

      {/* Show precision skeleton during initial data load */}
      {loading && viewMode === "queue" && <SupervisorQueueSkeleton />}
      {loading && viewMode === "history" && <SupervisorHistorySkeleton />}

      {/* Hide real content while skeleton is visible */}
      <div className={`flex flex-col gap-4 ${loading ? "hidden" : ""}`}>

        {/* TIER 1: UNIFIED KPI STATS STRIP (Clean Neutral Slate Styling) */}
        <div className="bg-white border border-slate-200/90 rounded-md p-1.5 shadow-3xs select-none">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            {/* Metric 1: Menunggu Keputusan */}
            <div
              onClick={() => { setFilterJenis('ALL'); setCurrentPage(1); handleSwitchTab('queue'); }}
              className={`p-3 px-3.5 flex items-center justify-between transition-all cursor-pointer rounded-md ${viewMode === 'queue' && filterJenis === 'ALL' ? 'bg-slate-100/90 text-slate-900 font-bold' : 'hover:bg-slate-50 text-slate-600'
                }`}
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-slate-500 capitalize">Menunggu Keputusan</span>
                <span className="text-xl font-black font-mono text-slate-900">{stats.pendingTotal}</span>
              </div>
              <span className={`text-xs font-black font-mono px-2 py-0.5 rounded-md border transition-all ${viewMode === 'queue' && filterJenis === 'ALL' ? 'bg-[#00a389] text-white border-[#00a389]' : 'bg-slate-100 text-slate-500 border-slate-200/80'
                }`}>
                Pending
              </span>
            </div>

            {/* Metric 2: Diputuskan Hari Ini */}
            <div
              onClick={() => { handleSwitchTab('history'); }}
              className={`p-3 px-3.5 flex items-center justify-between transition-all cursor-pointer rounded-md ${viewMode === 'history' ? 'bg-slate-100/90 text-slate-900 font-bold' : 'hover:bg-slate-50 text-slate-600'
                }`}
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-slate-500 capitalize">Diputuskan Hari Ini</span>
                <span className="text-xl font-black font-mono text-slate-900">{stats.decidedToday}</span>
              </div>
              <span className="text-xs font-black font-mono px-2 py-0.5 rounded-md border bg-slate-100 text-slate-500 border-slate-200/80">
                Hari Ini
              </span>
            </div>

            {/* Metric 3: Total Disetujui */}
            <div
              onClick={() => { setHistoryFilterStatus('APPROVED'); handleSwitchTab('history'); }}
              className={`p-3 px-3.5 flex items-center justify-between transition-all cursor-pointer rounded-md ${viewMode === 'history' && historyFilterStatus === 'APPROVED' ? 'bg-slate-100/90 text-slate-900 font-bold' : 'hover:bg-slate-50 text-slate-600'
                }`}
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-slate-500 capitalize">Total Disetujui</span>
                <span className="text-xl font-black font-mono text-slate-900">{stats.approvedTotal}</span>
              </div>
              <span className="text-xs font-black font-mono px-2 py-0.5 rounded-md border bg-emerald-50 text-[#008f78] border-emerald-200">
                Disetujui
              </span>
            </div>

            {/* Metric 4: Total Ditolak */}
            <div
              onClick={() => { setHistoryFilterStatus('REJECTED'); handleSwitchTab('history'); }}
              className={`p-3 px-3.5 flex items-center justify-between transition-all cursor-pointer rounded-md ${viewMode === 'history' && historyFilterStatus === 'REJECTED' ? 'bg-slate-100/90 text-slate-900 font-bold' : 'hover:bg-slate-50 text-slate-600'
                }`}
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-slate-500 capitalize">Total Ditolak</span>
                <span className="text-xl font-black font-mono text-slate-900">{stats.rejectedTotal}</span>
              </div>
              <span className="text-xs font-black font-mono px-2 py-0.5 rounded-md border bg-rose-50 text-rose-700 border-rose-200">
                Ditolak
              </span>
            </div>
          </div>
        </div>

        {/* Clean View Mode Switcher Tabs (Equal Width 2 Tabs Layout) */}
        <div className="bg-slate-100/90 border border-slate-200/80 p-1 rounded-md grid grid-cols-2 gap-1 shadow-3xs select-none">
          <button
            type="button"
            onClick={() => handleSwitchTab("queue")}
            className={`py-2 px-3 rounded-md text-xs font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-2 ${viewMode === "queue"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
          >
            <span>Antrean Persetujuan Koreksi</span>
            {stats.pendingTotal > 0 && (
              <span className="bg-[#00a389] text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full">
                {stats.pendingTotal}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => handleSwitchTab("history")}
            className={`py-2 px-3 rounded-md text-xs font-bold text-center transition-all cursor-pointer ${viewMode === "history"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
          >
            Riwayat Keputusan Koreksi
          </button>
        </div>

        {/* ==================== TAB: QUEUE (ANTEAN PERSETUJUAN) ==================== */}
        {viewMode === "queue" && (
          <div className="bg-white border border-slate-200/90 rounded-md p-5 sm:p-6 shadow-3xs flex flex-col gap-6 min-h-[300px]">
            {/* Header row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 select-none">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
                {/* Search */}
                <div className="relative w-full md:w-[403px] max-w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 pl-10 pr-10 bg-white hover:bg-slate-50 focus:bg-white border border-slate-200 hover:border-slate-300 focus:border-[#00a389] rounded-md text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-3xs"
                    placeholder="Cari no. permohonan, nama WP, pengaju..."
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 z-10 p-0.5 rounded-full hover:bg-slate-100 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Refresh button */}
                <button
                  onClick={() => fetchData(true)}
                  disabled={isRefreshing}
                  className="p-2.5 h-10 w-10 rounded-md border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-500 shadow-3xs transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center shrink-0"
                  title="Refresh Data"
                >
                  <RefreshCw className={`w-4 h-4 transition-all duration-300 ${isRefreshing ? 'animate-spin text-[#00a389]' : ''}`} />
                </button>
              </div>
            </div>

            {/* Filter badge pills */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0 select-none pb-1">
              {JENIS_FILTER_OPTS.map(jenis => {
                const isActive = filterJenis === jenis;
                const count = jenis === 'ALL' ? pendingList.length : (stats.byJenis?.[jenis] ?? 0);
                const meta = JENIS_LABEL[jenis];
                return (
                  <button
                    key={jenis}
                    type="button"
                    onClick={() => setFilterJenis(jenis)}
                    className={`px-3.5 py-1 rounded-full text-[10px] font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer border ${isActive
                      ? 'bg-[#00a389] text-white border-[#00a389] shadow-3xs'
                      : 'bg-white text-slate-500 hover:bg-slate-50 border-gray-200/90'
                      }`}
                  >
                    {meta && <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />}
                    <span>{jenis === 'ALL' ? 'Semua' : meta?.label ?? jenis}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-extrabold ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Queue Table */}
            <div className="border border-slate-200/80 rounded-md overflow-hidden bg-white shadow-3xs flex flex-col">
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-left border-collapse select-none">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-extrabold text-slate-600 uppercase tracking-wider text-left border-b border-slate-200 sticky top-0 z-10 shadow-2xs whitespace-nowrap">
                      <th className="py-3 px-5 text-center w-12 min-w-[48px]">No</th>
                      <th className="py-3 px-5 min-w-[110px]">Tgl. Input</th>
                      <th className="py-3 px-5 min-w-[140px]">Petugas Input</th>
                      <th className="py-3 px-5 min-w-[110px]">Tgl. Pengajuan</th>
                      <th className="py-3 px-5 min-w-[160px]">Jenis Koreksi</th>
                      <th className="py-3 px-5 min-w-[160px]">No. Permohonan</th>
                      <th className="py-3 px-5 min-w-[160px]">Nama WP</th>
                      <th className="py-3 px-5 min-w-[140px]">Diajukan Oleh</th>
                      <th className="py-3 px-5 min-w-[180px]">Alasan</th>
                      <th className="py-3 px-5 text-right pr-6 min-w-[140px]">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {paginatedPending.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-10 px-5 text-center bg-white font-sans">
                          <EmptyDataAnimation
                            title={searchQuery || filterJenis !== 'ALL' ? 'Tidak Ditemukan' : 'Antrean Persetujuan Kosong'}
                            description={
                              searchQuery || filterJenis !== 'ALL'
                                ? 'Tidak ada permintaan koreksi yang sesuai dengan kriteria pencarian.'
                                : 'Semua permintaan koreksi telah ditangani. Tidak ada permohonan yang menunggu persetujuan.'
                            }
                          />
                        </td>
                      </tr>
                    ) : (
                      paginatedPending.map((k, idx) => (
                        <tr
                          key={k.id}
                          className="hover:bg-slate-50 transition-colors duration-150 text-xs cursor-pointer"
                          onClick={() => setDetailTarget(k)}
                        >
                          <td className="py-4 px-5 text-center text-xs font-bold text-slate-400 font-mono">
                            {(activePage - 1) * itemsPerPage + idx + 1}
                          </td>
                          <td className="py-4 px-5 text-xs font-semibold text-slate-500 font-mono whitespace-nowrap">
                            {k.permohonan?.createdAt ? formatDateShort(k.permohonan.createdAt) : '—'}
                          </td>
                          <td className="py-4 px-5 text-slate-700 text-xs font-bold whitespace-nowrap uppercase">
                            <div className="flex items-center gap-1.5 min-w-0" title={k.permohonan?.penginput?.name || "Petugas Input"}>
                              <span className="truncate max-w-[130px] uppercase">{k.permohonan?.penginput?.name || "Petugas Input"}</span>
                            </div>
                          </td>
                          <td className="py-4 px-5 text-xs font-semibold text-slate-500 whitespace-nowrap">
                            {formatDateShort(k.createdAt)}
                          </td>
                          <td className="py-4 px-5 whitespace-nowrap">
                            <JenisBadge jenis={k.jenisKoreksi} />
                          </td>
                          <td className="py-4 px-5 text-xs font-mono font-bold text-slate-800 whitespace-nowrap">
                            {k.permohonan?.nomorPermohonan ?? '—'}
                          </td>
                          <td className="py-4 px-5 text-xs font-bold text-slate-800 uppercase whitespace-nowrap max-w-[160px] truncate">
                            {k.permohonan?.namaWajibPajak ?? '—'}
                          </td>
                          <td className="py-4 px-5 whitespace-nowrap">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-xs font-bold text-slate-700">{k.pengaju?.name ?? '—'}</span>
                              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide">{k.pengaju?.role ?? '—'}</span>
                            </div>
                          </td>
                          <td className="py-4 px-5 text-xs font-semibold text-slate-600 max-w-[200px]">
                            <span className="line-clamp-2">{k.catatanPengaju}</span>
                          </td>
                          <td className="py-4 px-5 pr-6 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center gap-2 justify-end">
                              <button
                                type="button"
                                onClick={() => { setApproveTarget(k); setActionError(''); setApproveCatatan(''); }}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-[#00a389] hover:bg-[#008f78] text-white rounded-md text-[10px] font-extrabold transition-all cursor-pointer shadow-3xs active:scale-95"
                                title="Setujui koreksi"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Setujui
                              </button>
                              <button
                                type="button"
                                onClick={() => { setRejectTarget(k); setActionError(''); setRejectCatatan(''); }}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-md text-[10px] font-bold transition-all cursor-pointer shadow-3xs active:scale-95"
                                title="Tolak koreksi"
                              >
                                <X className="w-3.5 h-3.5" />
                                Tolak
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer / Pagination */}
              <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 select-none shadow-3xs shrink-0">
                <span className="text-[11px] font-semibold text-slate-500 font-sans">
                  {filteredPending.length > 0
                    ? `Menampilkan ${((activePage - 1) * itemsPerPage) + 1}–${Math.min(activePage * itemsPerPage, filteredPending.length)} dari ${filteredPending.length} permintaan`
                    : 'Tidak ada data'}
                </span>

                {totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                      disabled={activePage === 1}
                      className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-all cursor-pointer shadow-3xs flex items-center justify-center"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={`w-7 h-7 flex items-center justify-center rounded-md text-xs font-bold transition-all cursor-pointer ${activePage === page
                          ? 'bg-[#00a389] text-white font-extrabold shadow-3xs scale-105'
                          : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 shadow-3xs'
                          }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                      disabled={activePage === totalPages}
                      className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-all cursor-pointer shadow-3xs flex items-center justify-center"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB: HISTORY (RIWAYAT KEPUTUSAN) ==================== */}
        {viewMode === "history" && (
          <div className="bg-white border border-slate-200/90 rounded-md p-5 sm:p-6 shadow-3xs flex flex-col gap-6 min-h-[300px]">
            {/* Header row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 select-none">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
                {/* Search */}
                <div className="relative w-full md:w-[403px] max-w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
                  <input
                    type="text"
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    className="w-full h-10 pl-10 pr-10 bg-white hover:bg-slate-50 focus:bg-white border border-slate-200 hover:border-slate-300 focus:border-[#00a389] rounded-md text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-3xs"
                    placeholder="Cari no. permohonan, nama WP..."
                  />
                  {historySearch && (
                    <button
                      onClick={() => setHistorySearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 z-10 p-0.5 rounded-full hover:bg-slate-100 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Status filter pills */}
                <div className="flex items-center gap-1 shrink-0">
                  {['ALL', 'APPROVED', 'REJECTED'].map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setHistoryFilterStatus(st)}
                      className={`px-3 py-2 h-10 rounded-md text-xs font-bold transition-all cursor-pointer border ${historyFilterStatus === st
                        ? 'bg-[#00a389] text-white border-[#00a389] shadow-3xs'
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 shadow-3xs'
                        }`}
                    >
                      {st === 'ALL' ? 'Semua' : st === 'APPROVED' ? '✓ Disetujui' : '✕ Ditolak'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Filter badge pills for Jenis */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0 select-none pb-1">
              {JENIS_FILTER_OPTS.map(jenis => {
                const isActive = historyFilterJenis === jenis;
                const meta = JENIS_LABEL[jenis];
                return (
                  <button
                    key={jenis}
                    type="button"
                    onClick={() => setHistoryFilterJenis(jenis)}
                    className={`px-3.5 py-1 rounded-full text-[10px] font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer border ${isActive
                      ? 'bg-[#00a389] text-white border-[#00a389] shadow-3xs'
                      : 'bg-white text-slate-500 hover:bg-slate-50 border-gray-200/90'
                      }`}
                  >
                    {meta && <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />}
                    <span>{jenis === 'ALL' ? 'Semua Jenis' : meta?.label ?? jenis}</span>
                  </button>
                );
              })}
            </div>

            {/* History Table */}
            <div className="border border-slate-200/80 rounded-md overflow-hidden bg-white shadow-3xs flex flex-col">
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-left border-collapse select-none">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-extrabold text-slate-600 uppercase tracking-wider text-left border-b border-slate-200 sticky top-0 z-10 shadow-2xs whitespace-nowrap">
                      <th className="py-3 px-5 text-center w-12 min-w-[48px]">No</th>
                      <th className="py-3 px-5 min-w-[110px]">Tgl. Input</th>
                      <th className="py-3 px-5 min-w-[140px]">Petugas Input</th>
                      <th className="py-3 px-5 min-w-[110px]">Tgl. Diputuskan</th>
                      <th className="py-3 px-5 min-w-[160px]">Jenis Koreksi</th>
                      <th className="py-3 px-5 min-w-[160px]">No. Permohonan</th>
                      <th className="py-3 px-5 min-w-[140px]">Pengaju</th>
                      <th className="py-3 px-5 min-w-[120px]">Keputusan</th>
                      <th className="py-3 px-5 min-w-[200px]">Catatan Supervisor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {paginatedHistory.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-10 px-5 text-center bg-white font-sans">
                          <EmptyDataAnimation
                            title="Belum Ada Riwayat"
                            description="Riwayat keputusan koreksi akan muncul di sini setelah Anda menyetujui atau menolak permintaan."
                          />
                        </td>
                      </tr>
                    ) : (
                      paginatedHistory.map((k, idx) => (
                        <tr key={k.id} className="hover:bg-slate-50 transition-colors duration-150 text-xs">
                          <td className="py-4 px-5 text-center text-xs font-bold text-slate-400 font-mono">
                            {(activeHistoryPage - 1) * itemsPerPage + idx + 1}
                          </td>
                          <td className="py-4 px-5 text-xs font-semibold text-slate-500 font-mono whitespace-nowrap">
                            {k.permohonan?.createdAt ? formatDateShort(k.permohonan.createdAt) : '—'}
                          </td>
                          <td className="py-4 px-5 text-slate-700 text-xs font-bold whitespace-nowrap uppercase">
                            <div className="flex items-center gap-1.5 min-w-0" title={k.permohonan?.penginput?.name || "Petugas Input"}>
                              <span className="truncate max-w-[130px] uppercase">{k.permohonan?.penginput?.name || "Petugas Input"}</span>
                            </div>
                          </td>
                          <td className="py-4 px-5 text-xs font-semibold text-slate-500 whitespace-nowrap">
                            {formatDateShort(k.diputuskanAt)}
                          </td>
                          <td className="py-4 px-5 whitespace-nowrap">
                            <JenisBadge jenis={k.jenisKoreksi} />
                          </td>
                          <td className="py-4 px-5 text-xs font-mono font-bold text-slate-800 whitespace-nowrap">
                            {k.permohonan?.nomorPermohonan ?? '—'}
                          </td>
                          <td className="py-4 px-5 whitespace-nowrap">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-xs font-bold text-slate-700">{k.pengaju?.name ?? '—'}</span>
                              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide">{k.pengaju?.role ?? '—'}</span>
                            </div>
                          </td>
                          <td className="py-4 px-5 whitespace-nowrap">
                            {k.status === 'APPROVED' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <Check className="w-3 h-3 text-[#00a389]" /> DISETUJUI
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                <X className="w-3 h-3 text-rose-600" /> DITOLAK
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-5 text-xs font-semibold text-slate-600 max-w-[220px]">
                            <span className="line-clamp-2">{k.catatanSupervisor ?? '—'}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer / Pagination */}
              <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 select-none shadow-3xs shrink-0">
                <span className="text-[11px] font-semibold text-slate-500 font-sans">
                  {filteredHistory.length > 0
                    ? `Menampilkan ${((activeHistoryPage - 1) * itemsPerPage) + 1}–${Math.min(activeHistoryPage * itemsPerPage, filteredHistory.length)} dari ${filteredHistory.length} riwayat`
                    : 'Tidak ada data'}
                </span>

                {totalHistoryPages > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setHistoryPage(p => Math.max(p - 1, 1))}
                      disabled={activeHistoryPage === 1}
                      className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-all cursor-pointer shadow-3xs flex items-center justify-center"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    {Array.from({ length: totalHistoryPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setHistoryPage(page)}
                        className={`w-7 h-7 flex items-center justify-center rounded-md text-xs font-bold transition-all cursor-pointer ${activeHistoryPage === page
                          ? 'bg-[#00a389] text-white font-extrabold shadow-3xs scale-105'
                          : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 shadow-3xs'
                          }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setHistoryPage(p => Math.min(p + 1, totalHistoryPages))}
                      disabled={activeHistoryPage === totalHistoryPages}
                      className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-all cursor-pointer shadow-3xs flex items-center justify-center"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ================= DIALOG: DETAIL KOREKSI ================= */}
      {detailTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn" onClick={() => setDetailTarget(null)}>
          <div className="bg-white rounded-md max-w-lg w-full shadow-2xl p-5 border border-slate-200 flex flex-col gap-4 animate-scaleUp select-none" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#00a389]" /> Detail Permintaan Koreksi
              </h3>
              <button onClick={() => setDetailTarget(null)} className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-md border border-slate-200/70">
                <FileText className="w-4 h-4 text-[#00a389] mt-0.5 shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-slate-800 font-mono">{detailTarget.permohonan?.nomorPermohonan}</span>
                  <span className="text-slate-600 font-semibold uppercase">{detailTarget.permohonan?.namaWajibPajak}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-md border border-slate-200/70">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Jenis Koreksi</span>
                  <JenisBadge jenis={detailTarget.jenisKoreksi} />
                </div>
                <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-md border border-slate-200/70">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Diajukan Oleh</span>
                  <span className="font-bold text-slate-800">{detailTarget.pengaju?.name}</span>
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase">{detailTarget.pengaju?.role}</span>
                </div>
                <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-md border border-slate-200/70">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Tanggal Pengajuan</span>
                  <span className="font-semibold text-slate-700">{formatDate(detailTarget.createdAt)}</span>
                </div>
                {detailTarget.permohonan?.bundle && (
                  <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-md border border-slate-200/70">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Bundle</span>
                    <span className="font-bold text-slate-800 font-mono">{detailTarget.permohonan.bundle.nomorBundle}</span>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase">{detailTarget.permohonan.bundle.status}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5 p-3.5 bg-amber-50 border border-amber-200 rounded-md">
                <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider">Alasan Pengaju</span>
                <p className="font-semibold text-slate-700 leading-relaxed text-xs">{detailTarget.catatanPengaju}</p>
              </div>
            </div>

            {detailTarget.status === 'PENDING_APPROVAL' && (
              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setDetailTarget(null); setApproveTarget(detailTarget); setActionError(''); setApproveCatatan(''); }}
                  className="flex-1 py-2 bg-[#00a389] hover:bg-[#008f78] text-white font-extrabold text-xs rounded-md shadow-3xs transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Check className="w-3.5 h-3.5" /> Setujui
                </button>
                <button
                  type="button"
                  onClick={() => { setDetailTarget(null); setRejectTarget(detailTarget); setActionError(''); setRejectCatatan(''); }}
                  className="flex-1 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-md shadow-3xs transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <X className="w-3.5 h-3.5" /> Tolak
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= DIALOG: KONFIRMASI SETUJUI ================= */}
      {approveTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn select-none">
          <div className="bg-white rounded-md max-w-md w-full shadow-2xl p-5 border border-slate-200 flex flex-col gap-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="bg-emerald-50 border border-emerald-200 p-1.5 rounded-md text-[#00a389]">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-slate-900">Konfirmasi Persetujuan</h3>
              </div>
              <button onClick={() => setApproveTarget(null)} className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-md text-xs font-semibold text-[#008f78] leading-relaxed">
              Anda akan menyetujui permintaan koreksi <strong>{JENIS_LABEL[approveTarget.jenisKoreksi]?.label ?? approveTarget.jenisKoreksi}</strong> untuk permohonan <strong>{approveTarget.permohonan?.nomorPermohonan}</strong>. Tindakan ini <strong>tidak dapat dibatalkan</strong> dan akan langsung mengubah status berkas.
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-extrabold text-slate-700">Catatan Supervisor (opsional)</label>
              <textarea
                value={approveCatatan}
                onChange={e => setApproveCatatan(e.target.value)}
                rows={3}
                placeholder="Tambahkan catatan untuk pengaju (opsional)..."
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:outline-none focus:border-[#00a389] text-xs font-semibold rounded-md px-3.5 py-2.5 transition-all text-slate-800 resize-none shadow-3xs"
              />
            </div>

            {actionError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs font-semibold text-rose-800">
                {actionError}
              </div>
            )}

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button type="button" onClick={() => setApproveTarget(null)} className="flex-1 py-2 border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 font-bold text-xs rounded-md shadow-3xs transition-all cursor-pointer">
                Batal
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={actionLoading}
                className="flex-1 py-2 bg-[#00a389] hover:bg-[#008f78] text-white font-extrabold text-xs rounded-md shadow-3xs transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 active:scale-95"
              >
                {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Ya, Setujui
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= DIALOG: KONFIRMASI TOLAK ================= */}
      {rejectTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn select-none">
          <div className="bg-white rounded-md max-w-md w-full shadow-2xl p-5 border border-slate-200 flex flex-col gap-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="bg-rose-50 border border-rose-200 p-1.5 rounded-md text-rose-600">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-slate-900">Konfirmasi Penolakan</h3>
              </div>
              <button onClick={() => setRejectTarget(null)} className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-md text-xs font-semibold text-rose-800 leading-relaxed">
              Anda akan menolak permintaan koreksi untuk permohonan <strong>{rejectTarget.permohonan?.nomorPermohonan}</strong>. Status permohonan <strong>tidak akan berubah</strong>.
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-extrabold text-slate-700">
                Alasan Penolakan <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={rejectCatatan}
                onChange={e => { setRejectCatatan(e.target.value); setActionError(''); }}
                rows={3}
                placeholder="Tuliskan alasan penolakan yang jelas untuk pengaju..."
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:outline-none focus:border-[#00a389] text-xs font-semibold rounded-md px-3.5 py-2.5 transition-all text-slate-800 resize-none shadow-3xs"
                required
              />
            </div>

            {actionError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs font-semibold text-rose-800">
                {actionError}
              </div>
            )}

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button type="button" onClick={() => setRejectTarget(null)} className="flex-1 py-2 border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 font-bold text-xs rounded-md shadow-3xs transition-all cursor-pointer">
                Batal
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={actionLoading}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-md shadow-3xs transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 active:scale-95"
              >
                {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                Ya, Tolak
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
