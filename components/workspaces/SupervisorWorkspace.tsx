"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
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

// ─── Skeleton ────────────────────────────────────────────────────────────────

export function SupervisorSkeleton() {
  return (
    <div className="w-full font-sans select-none flex flex-col gap-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#f3f6f9] p-5 rounded-2xl shadow-sm">
        <div className="flex flex-col gap-2">
          <SkeletonBox width="w-16" height="h-4" rounded="rounded-full" />
          <SkeletonBox width="w-72" height="h-5" rounded="rounded-full" />
        </div>
        <SkeletonBox width="w-44" height="h-8" rounded="rounded-xl" />
      </div>
      <div className="bg-[#dde3ea] rounded-2xl p-6 shadow-sm flex flex-col gap-6 min-h-[400px]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <SkeletonText width="w-40" height="h-4" />
          <SkeletonBox width="w-56" height="h-8" rounded="rounded-lg" />
        </div>
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
              <SkeletonBox width="w-8" height="h-8" rounded="rounded-lg" />
              <div className="flex-1 flex flex-col gap-2">
                <SkeletonText width="w-48" height="h-3" />
                <SkeletonText width="w-32" height="h-2.5" />
              </div>
              <SkeletonBox width="w-20" height="h-7" rounded="rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const JENIS_LABEL: Record<string, { label: string; icon: React.ReactNode; color: string; dot: string }> = {
  KELUARKAN_DARI_BUNDLE: {
    label: 'Keluarkan dari Bundle',
    icon: <Boxes className="w-3.5 h-3.5" />,
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200/50',
    dot: 'bg-indigo-500'
  },
  KEMBALIKAN_KE_PENELITI: {
    label: 'Kembalikan ke Peneliti',
    icon: <RotateCcw className="w-3.5 h-3.5" />,
    color: 'bg-amber-50 text-amber-700 border-amber-200/50',
    dot: 'bg-amber-500'
  },
  KEMBALIKAN_KE_PENGARSIP: {
    label: 'Kembalikan ke Pengarsip',
    icon: <FileOutput className="w-3.5 h-3.5" />,
    color: 'bg-orange-50 text-orange-700 border-orange-200/50',
    dot: 'bg-orange-500'
  },
  BATAL_SELESAI: {
    label: 'Batal Selesai',
    icon: <ArrowLeftRight className="w-3.5 h-3.5" />,
    color: 'bg-rose-50 text-rose-700 border-rose-200/50',
    dot: 'bg-rose-500'
  }
};

function JenisBadge({ jenis }: { jenis: string }) {
  const meta = JENIS_LABEL[jenis] ?? { label: jenis, icon: null, color: 'bg-gray-100 text-gray-600 border-gray-200/50', dot: 'bg-gray-400' };
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

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SupervisorWorkspace() {
  const { showConfirm } = useDashboard();

  // Data state
  const [pendingList, setPendingList] = useState<any[]>([]);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ pendingTotal: 0, decidedToday: 0, approvedTotal: 0, rejectedTotal: 0, byJenis: {} });
  const [loading, setLoading] = useState(true);

  // View state
  const [viewMode, setViewMode] = useState<'queue' | 'history'>('queue');

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

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [pendingRes, historyRes, statsRes] = await Promise.all([
        getPendingKoreksi(),
        getKoreksiHistory(),
        getSupervisorStats()
      ]);
      if (pendingRes.success) setPendingList(pendingRes.list);
      if (historyRes.success) setHistoryList(historyRes.list);
      if (statsRes.success) setStats(statsRes.stats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
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
  const paginatedPending = filteredPending.slice((activePage - 1) * itemsPerPage, activePage * itemsPerPage);

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
  const paginatedHistory = filteredHistory.slice((activeHistoryPage - 1) * itemsPerPage, activeHistoryPage * itemsPerPage);

  // Smart pagination
  const getPaginationButtons = (current: number, total: number) => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const buttons: (number | '…')[] = [];
    buttons.push(1);
    if (current > 3) buttons.push('…');
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) buttons.push(i);
    if (current < total - 2) buttons.push('…');
    buttons.push(total);
    return buttons;
  };

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
        await fetchData();
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
        await fetchData();
      } else {
        setActionError(res.error || 'Gagal menolak.');
      }
    } catch {
      setActionError('Terjadi kesalahan.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <SupervisorSkeleton />;

  // ─── Stat Cards ────────────────────────────────────────────────────────────
  const statCards = [
    { label: 'Menunggu Keputusan', value: stats.pendingTotal, icon: <Clock className="w-4 h-4" />, color: 'bg-amber-50 text-amber-600 border-amber-200/50' },
    { label: 'Diputuskan Hari Ini', value: stats.decidedToday, icon: <CheckCircle2 className="w-4 h-4" />, color: 'bg-emerald-50 text-emerald-600 border-emerald-200/50' },
    { label: 'Total Disetujui', value: stats.approvedTotal, icon: <ShieldCheck className="w-4 h-4" />, color: 'bg-indigo-50 text-indigo-600 border-indigo-200/50' },
    { label: 'Total Ditolak', value: stats.rejectedTotal, icon: <XCircle className="w-4 h-4" />, color: 'bg-rose-50 text-rose-600 border-rose-200/50' },
  ];

  const JENIS_FILTER_OPTS = ['ALL', ...Object.keys(JENIS_LABEL)];

  return (
    <div className="w-full font-sans select-none flex flex-col gap-6 animate-fadeIn">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#f3f6f9] p-5 rounded-2xl shadow-sm border border-slate-200/60">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Panel Supervisor</span>
          <h1 className="text-[15px] font-extrabold text-slate-800 capitalize tracking-tight font-display">
            Pusat Persetujuan Koreksi
          </h1>
          <p className="text-[11px] font-semibold text-slate-400">Tinjau, setujui, atau tolak permintaan koreksi dari seluruh tim operasional.</p>
        </div>

        {/* Stat mini chips */}
        <div className="flex flex-wrap gap-2 shrink-0">
          {statCards.map(s => (
            <div key={s.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${s.color} text-[10px] font-bold`}>
              {s.icon}
              <span className="font-black text-sm">{s.value}</span>
              <span className="font-semibold opacity-80">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tab switcher ── */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
        {[
          { id: 'queue', label: 'Antrean Persetujuan', icon: <Inbox className="w-4 h-4" />, badge: stats.pendingTotal },
          { id: 'history', label: 'Riwayat Keputusan', icon: <History className="w-4 h-4" />, badge: null },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setViewMode(tab.id as any)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${viewMode === tab.id
              ? 'bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] text-[#2c333f] shadow-sm'
              : 'text-slate-500 hover:bg-slate-100'
              }`}
          >
            {tab.icon}
            {tab.label}
            {tab.badge !== null && tab.badge > 0 && (
              <span className="bg-rose-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full animate-pulse">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
        <div className="ml-auto">
          <button
            onClick={() => fetchData()}
            disabled={loading}
            className="p-2 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-500 shadow-3xs transition-all cursor-pointer disabled:opacity-40"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 transition-all duration-300 ${loading ? 'animate-spin text-indigo-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          QUEUE TAB
      ══════════════════════════════════════════════════════════ */}
      {viewMode === 'queue' && (
        <div className="bg-[#dde3ea] border border-slate-200 rounded-2xl shadow-sm flex flex-col gap-5 overflow-hidden">
          {/* Controls row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 pb-0">
            <h2 className="font-extrabold text-[13px] capitalize tracking-wider text-slate-700 font-display">
              Antrean Persetujuan Koreksi
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Search */}
              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 z-10" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-7.5 pr-8 py-1.5 bg-white border border-slate-200/90 rounded-lg text-[11px] font-semibold text-gray-700 placeholder-gray-400 focus:outline-none shadow-3xs transition-all"
                  placeholder="Cari no. permohonan, pengaju..."
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Filter badge pills */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none select-none px-5">
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
                    ? 'bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] text-[#2c333f] border-transparent shadow-sm'
                    : 'bg-white text-slate-500 hover:bg-slate-50 border-gray-200/90'
                    }`}
                >
                  {meta && (
                    <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                  )}
                  <span>{jenis === 'ALL' ? 'Semua' : meta?.label ?? jenis}</span>
                  <span className={`px-1.5 rounded-full text-[9px] font-extrabold ${isActive ? 'bg-[#2c333f]/10 text-[#2c333f]' : 'bg-slate-100 text-slate-500'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Table */}
          <div className="px-5 pb-5 flex flex-col gap-4">
            <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white shadow-3xs flex flex-col">
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-extrabold text-slate-600 capitalize tracking-wider text-left border-b border-slate-200">
                      <th className="py-3 px-5 text-center">No</th>
                      <th className="py-3 px-5 whitespace-nowrap">Tgl. Pengajuan</th>
                      <th className="py-3 px-5 whitespace-nowrap">Jenis Koreksi</th>
                      <th className="py-3 px-5 whitespace-nowrap">No. Permohonan</th>
                      <th className="py-3 px-5 whitespace-nowrap">Nama WP</th>
                      <th className="py-3 px-5 whitespace-nowrap">Diajukan Oleh</th>
                      <th className="py-3 px-5">Alasan</th>
                      <th className="py-3 px-5 text-right pr-6 whitespace-nowrap">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {paginatedPending.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-20 px-5 text-center bg-white">
                          <div className="flex flex-col items-center justify-center gap-4 max-w-md mx-auto select-none animate-fadeIn">
                            <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-100/50 flex items-center justify-center text-emerald-400">
                              <CheckCircle2 className="w-8 h-8 stroke-[1.5]" />
                            </div>
                            <div className="space-y-1.5 text-center">
                              <h3 className="text-sm font-black text-gray-800 tracking-tight">
                                {searchQuery || filterJenis !== 'ALL' ? 'Tidak ditemukan' : 'Antrean Kosong'}
                              </h3>
                              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                                {searchQuery || filterJenis !== 'ALL'
                                  ? 'Tidak ada permintaan koreksi yang sesuai dengan filter Anda.'
                                  : 'Semua permintaan koreksi telah ditangani. Tidak ada yang menunggu keputusan.'}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedPending.map((k, idx) => (
                        <tr
                          key={k.id}
                          className="hover:bg-slate-50/80 transition-all duration-150 cursor-pointer"
                          onClick={() => setDetailTarget(k)}
                        >
                          <td className="py-3 px-5 text-center text-[11px] font-bold text-slate-400">
                            {(activePage - 1) * itemsPerPage + idx + 1}
                          </td>
                          <td className="py-3 px-5 text-[11px] font-semibold text-slate-600 whitespace-nowrap">
                            {formatDateShort(k.createdAt)}
                          </td>
                          <td className="py-3 px-5">
                            <JenisBadge jenis={k.jenisKoreksi} />
                          </td>
                          <td className="py-3 px-5 text-[11px] font-bold text-slate-800 whitespace-nowrap font-mono">
                            {k.permohonan?.nomorPermohonan ?? '—'}
                          </td>
                          <td className="py-3 px-5 text-[11px] font-semibold text-slate-600 whitespace-nowrap max-w-[160px] truncate">
                            {k.permohonan?.namaWajibPajak ?? '—'}
                          </td>
                          <td className="py-3 px-5">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[11px] font-bold text-slate-700">{k.pengaju?.name ?? '—'}</span>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{k.pengaju?.role ?? '—'}</span>
                            </div>
                          </td>
                          <td className="py-3 px-5 text-[11px] font-semibold text-slate-500 max-w-[200px]">
                            <span className="line-clamp-2">{k.catatanPengaju}</span>
                          </td>
                          <td className="py-3 px-5 pr-6">
                            <div
                              className="flex items-center gap-2 justify-end"
                              onClick={e => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() => { setApproveTarget(k); setActionError(''); setApproveCatatan(''); }}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/50 rounded-lg text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap"
                                title="Setujui"
                              >
                                <Check className="w-3 h-3" />
                                Setujui
                              </button>
                              <button
                                type="button"
                                onClick={() => { setRejectTarget(k); setActionError(''); setRejectCatatan(''); }}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/50 rounded-lg text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap"
                                title="Tolak"
                              >
                                <X className="w-3 h-3" />
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

              {/* Pagination footer */}
              {totalPages > 1 && (
                <div className="px-5 py-3 border-t border-slate-200/55 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-gray-400 select-none">
                    Menampilkan {((activePage - 1) * itemsPerPage) + 1} – {Math.min(activePage * itemsPerPage, filteredPending.length)} dari {filteredPending.length} permintaan
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                      disabled={activePage === 1}
                      className="p-1.5 rounded-lg border-transparent bg-white text-gray-500 hover:bg-[#f1f5f9] disabled:opacity-40 transition-all cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    {getPaginationButtons(activePage, totalPages).map((page, i) =>
                      page === '…' ? (
                        <span key={`el-${i}`} className="px-2 text-gray-400 text-xs font-bold select-none">…</span>
                      ) : (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setCurrentPage(Number(page))}
                          className={`w-7 h-7 rounded-lg text-xs font-bold border transition-all cursor-pointer ${activePage === page
                            ? 'bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] text-[#1e2022] font-extrabold shadow-sm scale-105 z-10'
                            : 'border-transparent bg-white text-gray-500 hover:bg-[#f1f5f9]'
                            }`}
                        >
                          {page}
                        </button>
                      )
                    )}
                    <button
                      type="button"
                      onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                      disabled={activePage === totalPages}
                      className="p-1.5 rounded-lg border-transparent bg-white text-gray-500 hover:bg-[#f1f5f9] disabled:opacity-40 transition-all cursor-pointer"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          HISTORY TAB
      ══════════════════════════════════════════════════════════ */}
      {viewMode === 'history' && (
        <div className="bg-[#dde3ea] border border-slate-200 rounded-2xl shadow-sm flex flex-col gap-5 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 pb-0">
            <h2 className="font-extrabold text-[13px] capitalize tracking-wider text-slate-700 font-display">
              Riwayat Keputusan Koreksi
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 z-10" />
                <input
                  type="text"
                  value={historySearch}
                  onChange={e => setHistorySearch(e.target.value)}
                  className="w-full pl-7.5 pr-8 py-1.5 bg-white border border-slate-200/90 rounded-lg text-[11px] font-semibold text-gray-700 placeholder-gray-400 focus:outline-none shadow-3xs transition-all"
                  placeholder="Cari no. permohonan..."
                />
                {historySearch && (
                  <button onClick={() => setHistorySearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Status filter */}
              <div className="flex items-center gap-1">
                {['ALL', 'APPROVED', 'REJECTED'].map(st => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setHistoryFilterStatus(st)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${historyFilterStatus === st
                      ? 'bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] text-[#2c333f] border-transparent shadow-sm'
                      : 'bg-white text-slate-500 border-gray-200/90 hover:bg-slate-50'
                      }`}
                  >
                    {st === 'ALL' ? 'Semua' : st === 'APPROVED' ? '✓ Disetujui' : '✕ Ditolak'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Jenis filter pills */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none select-none px-5">
            {JENIS_FILTER_OPTS.map(jenis => {
              const isActive = historyFilterJenis === jenis;
              const meta = JENIS_LABEL[jenis];
              return (
                <button
                  key={jenis}
                  type="button"
                  onClick={() => setHistoryFilterJenis(jenis)}
                  className={`px-3.5 py-1 rounded-full text-[10px] font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer border ${isActive
                    ? 'bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] text-[#2c333f] border-transparent shadow-sm'
                    : 'bg-white text-slate-500 hover:bg-slate-50 border-gray-200/90'
                    }`}
                >
                  {meta && <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />}
                  <span>{jenis === 'ALL' ? 'Semua Jenis' : meta?.label ?? jenis}</span>
                </button>
              );
            })}
          </div>

          {/* History table */}
          <div className="px-5 pb-5 flex flex-col gap-4">
            <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white shadow-3xs flex flex-col">
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-extrabold text-slate-600 capitalize tracking-wider text-left border-b border-slate-200">
                      <th className="py-3 px-5 text-center">No</th>
                      <th className="py-3 px-5 whitespace-nowrap">Tgl. Diputuskan</th>
                      <th className="py-3 px-5 whitespace-nowrap">Jenis Koreksi</th>
                      <th className="py-3 px-5 whitespace-nowrap">No. Permohonan</th>
                      <th className="py-3 px-5 whitespace-nowrap">Pengaju</th>
                      <th className="py-3 px-5 whitespace-nowrap">Keputusan</th>
                      <th className="py-3 px-5">Catatan Supervisor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {paginatedHistory.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-20 px-5 text-center bg-white">
                          <div className="flex flex-col items-center justify-center gap-4 max-w-md mx-auto select-none animate-fadeIn">
                            <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-slate-100/50 flex items-center justify-center text-slate-300">
                              <History className="w-8 h-8 stroke-[1.5]" />
                            </div>
                            <div className="space-y-1.5 text-center">
                              <h3 className="text-sm font-black text-gray-800 tracking-tight">Belum Ada Riwayat</h3>
                              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                                Riwayat keputusan koreksi akan muncul di sini setelah Anda menyetujui atau menolak permintaan.
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedHistory.map((k, idx) => (
                        <tr key={k.id} className="hover:bg-slate-50/80 transition-all duration-150">
                          <td className="py-3 px-5 text-center text-[11px] font-bold text-slate-400">
                            {(activeHistoryPage - 1) * itemsPerPage + idx + 1}
                          </td>
                          <td className="py-3 px-5 text-[11px] font-semibold text-slate-600 whitespace-nowrap">
                            {formatDateShort(k.diputuskanAt)}
                          </td>
                          <td className="py-3 px-5">
                            <JenisBadge jenis={k.jenisKoreksi} />
                          </td>
                          <td className="py-3 px-5 text-[11px] font-bold text-slate-800 whitespace-nowrap font-mono">
                            {k.permohonan?.nomorPermohonan ?? '—'}
                          </td>
                          <td className="py-3 px-5">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[11px] font-bold text-slate-700">{k.pengaju?.name ?? '—'}</span>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{k.pengaju?.role ?? '—'}</span>
                            </div>
                          </td>
                          <td className="py-3 px-5">
                            {k.status === 'APPROVED' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                                <Check className="w-3 h-3" /> DISETUJUI
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200/50">
                                <X className="w-3 h-3" /> DITOLAK
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-5 text-[11px] font-semibold text-slate-500 max-w-[220px]">
                            <span className="line-clamp-2">{k.catatanSupervisor ?? '—'}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {totalHistoryPages > 1 && (
                <div className="px-5 py-3 border-t border-slate-200/55 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-gray-400 select-none">
                    Menampilkan {((activeHistoryPage - 1) * itemsPerPage) + 1} – {Math.min(activeHistoryPage * itemsPerPage, filteredHistory.length)} dari {filteredHistory.length} riwayat
                  </span>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => setHistoryPage(p => Math.max(p - 1, 1))} disabled={activeHistoryPage === 1} className="p-1.5 rounded-lg border-transparent bg-white text-gray-500 hover:bg-[#f1f5f9] disabled:opacity-40 transition-all cursor-pointer">
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    {getPaginationButtons(activeHistoryPage, totalHistoryPages).map((page, i) =>
                      page === '…' ? (
                        <span key={`el-${i}`} className="px-2 text-gray-400 text-xs font-bold select-none">…</span>
                      ) : (
                        <button key={page} type="button" onClick={() => setHistoryPage(Number(page))}
                          className={`w-7 h-7 rounded-lg text-xs font-bold border transition-all cursor-pointer ${activeHistoryPage === page ? 'bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] text-[#1e2022] font-extrabold shadow-sm scale-105 z-10' : 'border-transparent bg-white text-gray-500 hover:bg-[#f1f5f9]'}`}>
                          {page}
                        </button>
                      )
                    )}
                    <button type="button" onClick={() => setHistoryPage(p => Math.min(p + 1, totalHistoryPages))} disabled={activeHistoryPage === totalHistoryPages} className="p-1.5 rounded-lg border-transparent bg-white text-gray-500 hover:bg-[#f1f5f9] disabled:opacity-40 transition-all cursor-pointer">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          DIALOG: Detail Koreksi
      ══════════════════════════════════════════════════════════ */}
      {detailTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn" onClick={() => setDetailTarget(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl p-5 border border-slate-100 flex flex-col gap-4 animate-scaleUp" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 select-none">
              <h3 className="text-md font-bold text-gray-900 flex items-center gap-1.5">
                <Eye className="w-4.5 h-4.5 text-indigo-500" /> Detail Permintaan Koreksi
              </h3>
              <button onClick={() => setDetailTarget(null)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex flex-col gap-3 text-[12px]">
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <FileText className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-slate-800">{detailTarget.permohonan?.nomorPermohonan}</span>
                  <span className="text-slate-400 font-semibold">{detailTarget.permohonan?.namaWajibPajak}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-0.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Jenis Koreksi</span>
                  <JenisBadge jenis={detailTarget.jenisKoreksi} />
                </div>
                <div className="flex flex-col gap-0.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Diajukan Oleh</span>
                  <span className="font-bold text-slate-700">{detailTarget.pengaju?.name}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">{detailTarget.pengaju?.role}</span>
                </div>
                <div className="flex flex-col gap-0.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Tanggal Pengajuan</span>
                  <span className="font-semibold text-slate-700">{formatDate(detailTarget.createdAt)}</span>
                </div>
                {detailTarget.permohonan?.bundle && (
                  <div className="flex flex-col gap-0.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Bundle</span>
                    <span className="font-bold text-slate-700 font-mono text-[11px]">{detailTarget.permohonan.bundle.nomorBundle}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{detailTarget.permohonan.bundle.status}</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1 p-3 bg-amber-50 rounded-xl border border-amber-100">
                <span className="text-[10px] font-extrabold text-amber-500 uppercase tracking-wider">Alasan Pengaju</span>
                <p className="font-semibold text-slate-700 leading-relaxed">{detailTarget.catatanPengaju}</p>
              </div>
            </div>
            {detailTarget.status === 'PENDING_APPROVAL' && (
              <div className="flex gap-2 pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setDetailTarget(null); setApproveTarget(detailTarget); setActionError(''); setApproveCatatan(''); }}
                  className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" /> Setujui
                </button>
                <button
                  type="button"
                  onClick={() => { setDetailTarget(null); setRejectTarget(detailTarget); setActionError(''); setRejectCatatan(''); }}
                  className="flex-1 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" /> Tolak
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          DIALOG: Konfirmasi Setujui
      ══════════════════════════════════════════════════════════ */}
      {approveTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-5 border border-slate-100 flex flex-col gap-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 select-none">
              <h3 className="text-md font-bold text-gray-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" /> Konfirmasi Persetujuan
              </h3>
              <button onClick={() => setApproveTarget(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full cursor-pointer"><X className="w-4 h-4" /></button>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-[11px] font-semibold text-emerald-800 leading-relaxed">
              Anda akan menyetujui permintaan koreksi <strong>{JENIS_LABEL[approveTarget.jenisKoreksi]?.label ?? approveTarget.jenisKoreksi}</strong> untuk permohonan <strong>{approveTarget.permohonan?.nomorPermohonan}</strong>. Tindakan ini <strong>tidak dapat dibatalkan</strong> dan akan langsung mengubah status data.
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-600">Catatan Supervisor (opsional)</label>
              <textarea
                value={approveCatatan}
                onChange={e => setApproveCatatan(e.target.value)}
                rows={2}
                placeholder="Tambahkan catatan untuk pengaju (opsional)..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-[11px] font-semibold text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-400 resize-none transition-all"
              />
            </div>

            {actionError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200/50 rounded-xl text-[11px] font-semibold text-rose-700">
                {actionError}
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => setApproveTarget(null)} className="flex-1 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-xl transition-all cursor-pointer">Batal</button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={actionLoading}
                className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Ya, Setujui
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          DIALOG: Konfirmasi Tolak
      ══════════════════════════════════════════════════════════ */}
      {rejectTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-5 border border-slate-100 flex flex-col gap-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 select-none">
              <h3 className="text-md font-bold text-gray-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4.5 h-4.5 text-rose-500" /> Konfirmasi Penolakan
              </h3>
              <button onClick={() => setRejectTarget(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full cursor-pointer"><X className="w-4 h-4" /></button>
            </div>

            <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 text-[11px] font-semibold text-rose-800 leading-relaxed">
              Anda akan menolak permintaan koreksi untuk permohonan <strong>{rejectTarget.permohonan?.nomorPermohonan}</strong>. Status permohonan <strong>tidak akan berubah</strong>.
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-600">
                Alasan Penolakan <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={rejectCatatan}
                onChange={e => { setRejectCatatan(e.target.value); setActionError(''); }}
                rows={3}
                placeholder="Tuliskan alasan penolakan yang jelas untuk pengaju..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-[11px] font-semibold text-gray-700 placeholder-gray-400 focus:outline-none focus:border-rose-400 resize-none transition-all"
              />
            </div>

            {actionError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200/50 rounded-xl text-[11px] font-semibold text-rose-700">
                {actionError}
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => setRejectTarget(null)} className="flex-1 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-xl transition-all cursor-pointer">Batal</button>
              <button
                type="button"
                onClick={handleReject}
                disabled={actionLoading}
                className="flex-1 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
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
