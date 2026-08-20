"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Plus, Search, Edit, RefreshCw,
  AlertTriangle, X, CheckCircle, FileText, Calendar,
  Trash2, ChevronLeft, ChevronRight, ChevronDown, Check, Lock,
  FileSpreadsheet, Star, ListFilter, Copy, MessageSquare, Briefcase, ArrowRight,
  Slash
} from 'lucide-react';
import {
  resubmitPermohonan,
  getPenginputPermohonan,
  togglePermohonanFavorite
} from '@/app/actions/penginput';
import { useDashboard } from '@/context/DashboardContext';
import { SkeletonBox, SkeletonText, SkeletonBadge } from '@/components/skeletons/SkeletonBase';
import { DetailsModal } from '@/components/workspaces/shared/DetailsModal';
import { EditModal } from '@/components/workspaces/shared/EditModal';
import { CreateForm } from '@/components/workspaces/shared/CreateForm';
import { ActionStatusModal } from '@/components/workspaces/shared/ActionStatusModal';


const EmptyDataAnimation: React.FC = React.memo(() => {
  return (
    <div className="w-80 h-60 sm:w-[420px] sm:h-[300px] mx-auto flex items-center justify-center overflow-hidden select-none pointer-events-none">
      <iframe
        src="https://lottie.host/embed/3e579b32-f8c2-40f8-854f-d6375c7b361f/PpMBUyHb09.lottie"
        className="w-full h-full border-0 pointer-events-none scale-110"
        title="Empty Data Animation"
      />
    </div>
  );
});

EmptyDataAnimation.displayName = 'EmptyDataAnimation';

/** Skeleton lengkap untuk PenginputWorkspace — header + tabel */
export function PenginputSkeleton() {
  const STATUS_CHIPS = ['Semua', 'SUBMITTED', 'FAVORITE', 'REVISION', 'BUNDLED', 'ARCHIVED', 'COMPLETED', 'REJECTED'];
  return (
    <div className="w-full font-sans select-none flex flex-col gap-6 animate-fadeIn">
      {/* Header card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#dde3ea] p-5 rounded-2xl shadow-sm">
        <SkeletonBox width="w-56" height="h-5" rounded="rounded-full" />
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1">
            <SkeletonBox width="w-32" height="h-7" rounded="rounded-lg" />
            <SkeletonBox width="w-24" height="h-7" rounded="rounded-lg" />
          </div>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-[#dde3ea] rounded-2xl shadow-sm flex flex-col overflow-hidden min-h-[300px]">
        {/* Action row: search */}
        <div className="p-5 border-b border-gray-200/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <SkeletonBox width="w-36" height="h-4" rounded="rounded-full" />
          <div className="w-72 h-8 bg-gray-200 animate-pulse rounded-lg" />
        </div>

        {/* Filter chips */}
        <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2 overflow-x-auto bg-[#dde3ea]">
          {STATUS_CHIPS.map((s) => (
            <div key={s} className="h-6 rounded-full bg-gray-200 animate-pulse" style={{ width: s === 'Semua' ? 52 : s.length * 7 + 20 }} />
          ))}
        </div>

        {/* Table */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-gray-200/60">
                {['No', 'Tanggal', 'No. Pelayanan', 'NOP', 'Wajib Pajak', 'Jenis Layanan', 'Status', 'Aksi'].map((h) => (
                  <th key={h} className="py-3 px-5">
                    <SkeletonText width="w-16" height="h-2.5" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Array.from({ length: 7 }).map((_, i) => (
                <tr key={i}>
                  <td className="py-4 px-5 w-12"><SkeletonText width="w-4" height="h-3" /></td>
                  <td className="py-4 px-5"><SkeletonText width="w-20" height="h-3" /></td>
                  <td className="py-4 px-5 min-w-[140px]">
                    <SkeletonText width="w-36" height="h-3" />
                  </td>
                  <td className="py-4 px-5 min-w-[140px]">
                    <SkeletonText width="w-28" height="h-2.5" />
                  </td>
                  <td className="py-4 px-5"><SkeletonText width={i % 2 === 0 ? 'w-28' : 'w-24'} height="h-3" /></td>
                  <td className="py-4 px-5"><SkeletonBadge width="w-10" /></td>
                  <td className="py-4 px-5 text-center"><SkeletonBadge width="w-20" /></td>
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-6 h-6 rounded-lg bg-gray-200 animate-pulse" />
                      <div className="w-6 h-6 rounded-lg bg-gray-200 animate-pulse" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-gray-200/60 flex items-center justify-between">
          <SkeletonText width="w-32" height="h-3" />
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-7 h-7 rounded-lg bg-gray-200 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const JENIS_OPTIONS = [
  { value: 'MUTASI_SEBAGIAN', label: 'Mutasi Sebagian' },
  { value: 'MUTASI_HABIS_UPDATE', label: 'Mutasi Habis Update' },
  { value: 'MUTASI_HABIS_REGULER', label: 'Mutasi Habis Reguler' },
  { value: 'OBJEK_PAJAK_BARU', label: 'Objek Pajak Baru' },
  { value: 'PEMBETULAN', label: 'Pembetulan' },
  { value: 'PENGAKTIFAN', label: 'Pengaktifan' }
] as const;

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
    case 'OBJEK_PAJAK_BARU':
      return 'OPB';
    case 'MUTASI_SEBAGIAN':
      return 'MS';
    case 'MUTASI_HABIS_REGULER':
      return 'MHR';
    case 'MUTASI_HABIS_UPDATE':
      return 'MHU';
    case 'PEMBETULAN':
      return 'PBT';
    case 'PENGAKTIFAN':
      return 'AKT';
    default:
      return jenis;
  }
};

const SERVICES_NEED_DATA_LAMA = [
  'MUTASI_SEBAGIAN',
  'MUTASI_HABIS_UPDATE',
  'MUTASI_HABIS_REGULER',
  'PEMBETULAN',
  'PENGAKTIFAN'
];

const SERVICES_NEED_DATA_BARU = [
  'MUTASI_SEBAGIAN',
  'MUTASI_HABIS_UPDATE',
  'MUTASI_HABIS_REGULER',
  'PEMBETULAN',
  'OBJEK_PAJAK_BARU'
];

const createEmptyDataBaruItem = () => ({
  namaPemilikBaru: '',
  alamatPemilikBaru: '',
  kecamatanPemilikBaru: '',
  desaPemilikBaru: '',
  alamatObjekBaru: '',
  kecamatanObjekBaru: '',
  desaObjekBaru: '',
  luasTanahBaru: '',
  luasBangunanBaru: '',
  sertifikatBaru: ''
});

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

const highlightText = (text: string, search: string) => {
  if (!search.trim()) return <span>{text}</span>;
  const escapedSearch = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(`(${escapedSearch})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-amber-100 text-amber-900 rounded-[2px] px-0.5 py-0.25 font-bold">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
};

const getStatusDotColor = (status: string) => {
  switch (status) {
    case 'FAVORITE': return 'bg-yellow-400';
    case 'SUBMITTED': return 'bg-emerald-500';
    case 'REVISION': return 'bg-orange-500';
    case 'BUNDLED': return 'bg-blue-500';
    case 'ARCHIVED': return 'bg-indigo-500';
    case 'COMPLETED': return 'bg-cyan-500';
    case 'REJECTED': return 'bg-rose-500';
    default: return 'bg-slate-450';
  }
};

// Helper: cek apakah tanggal penyelesaian sudah lewat tenggat
const isOverdue = (dateStr: string | null | undefined, status: string): boolean => {
  if (!dateStr) return false;
  if (status === 'COMPLETED' || status === 'REJECTED' || status === 'ARCHIVED') return false;
  return new Date(dateStr) < new Date();
};

export default function PenginputWorkspace() {
  const { showConfirm, refreshFavorites } = useDashboard();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search & Filter State
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterJenisLayanan, setFilterJenisLayanan] = useState<string>('ALL');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // Next.js Router & Query Params sync for ?tab=my-tasks&view=create
  const searchParams = useSearchParams();
  const router = useRouter();
  const viewParam = searchParams.get('view');

  // View switcher state ('list' | 'form') initialized from URL param
  const [viewMode, setViewMode] = useState<'list' | 'form'>(
    viewParam === 'create' || viewParam === 'form' ? 'form' : 'list'
  );

  // Sync viewMode when URL query params change (e.g. Browser Back/Forward buttons)
  useEffect(() => {
    const isCreateView = viewParam === 'create' || viewParam === 'form';
    setViewMode(isCreateView ? 'form' : 'list');
  }, [viewParam]);

  // Helper to switch view and update URL query param
  const switchViewMode = useCallback((mode: 'list' | 'form') => {
    setViewMode(mode);
    if (mode === 'form') {
      router.push('/?tab=my-tasks&view=create', { scroll: false });
    } else {
      router.push('/?tab=my-tasks', { scroll: false });
    }
  }, [router]);

  // Items per page state
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Inline Table Header Filter States
  const [isJenisFilterOpen, setIsJenisFilterOpen] = useState(false);
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const handleCopy = useCallback((e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 1000);
  }, []);

  const handleCancelCreate = useCallback(() => {
    setDuplicateTarget(null);
    switchViewMode('list');
  }, [switchViewMode]);
  // Selected item details modal state
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const handleCloseDetails = useCallback(() => {
    setSelectedRequest(null);
  }, []);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [duplicateTarget, setDuplicateTarget] = useState<any | null>(null);
  const handleCloseEdit = useCallback(() => {
    setEditTarget(null);
  }, []);

  // Status Modal State
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusModalStatus, setStatusModalStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusModalTitle, setStatusModalTitle] = useState('');
  const [statusModalMessage, setStatusModalMessage] = useState('');

  // Load permohonan data
  const fetchData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setListLoading(true);
    }
    try {
      const res = await getPenginputPermohonan();
      if (res.success) {
        setList(res.list || []);
      } else {
        console.error(res.error);
      }
    } catch (err) {
      console.error('Failed to fetch permohonan', err);
    } finally {
      setListLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const handleToggleFavorite = useCallback(async (id: string) => {
    let originalList: any[] = [];
    setList(prev => {
      originalList = [...prev];
      return prev.map(item => {
        if (item.id === id) {
          return { ...item, isFavorite: !item.isFavorite };
        }
        return item;
      });
    });

    try {
      const res = await togglePermohonanFavorite(id);
      if (!res.success) {
        setError(res.error || 'Gagal mengubah status favorit.');
        setList(originalList); // Revert
      } else {
        refreshFavorites();
      }
    } catch (err) {
      setError('Gagal mengubah status favorit.');
      setList(originalList); // Revert
    }
  }, [refreshFavorites]);

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
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus, filterJenisLayanan, itemsPerPage]);





  // Resubmit Revision
  const handleResubmit = useCallback((id: string) => {
    showConfirm({
      title: 'Konfirmasi Kirim Ulang',
      message: 'Apakah Anda yakin ingin melakukan resubmit untuk permohonan ini? Harap periksa kembali semua data sebelum melanjutkan.',
      onConfirm: async () => {
        setStatusModalTitle('Kirim Ulang Permohonan');
        setStatusModalMessage('Sedang mengirim ulang permohonan ke sistem...');
        setStatusModalStatus('loading');
        setStatusModalOpen(true);
        try {
          const res = await resubmitPermohonan(id);
          if (res.success) {
            setStatusModalTitle('Kirim Ulang Berhasil');
            setStatusModalMessage('Permohonan berhasil dikirim ulang! Status diubah kembali ke Diajukan (SUBMITTED).');
            setStatusModalStatus('success');
            fetchData();
          } else {
            setStatusModalTitle('Kirim Ulang Gagal');
            setStatusModalMessage(res.error || 'Gagal melakukan resubmit.');
            setStatusModalStatus('error');
          }
        } catch (err: any) {
          setStatusModalTitle('Terjadi Kesalahan');
          setStatusModalMessage(err.message || 'Terjadi kesalahan sistem saat melakukan resubmit.');
          setStatusModalStatus('error');
        }
      }
    });
  }, [showConfirm, fetchData]);



  // Status chips count memoization
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: list.length,
      FAVORITE: 0,
      SUBMITTED: 0,
      REVISION: 0,
      BUNDLED: 0,
      ARCHIVED: 0,
      COMPLETED: 0,
      REJECTED: 0
    };
    list.forEach(item => {
      if (counts[item.status] !== undefined) {
        counts[item.status]++;
      }
      if (item.isFavorite) {
        counts.FAVORITE++;
      }
    });
    return counts;
  }, [list]);

  // Search filter
  const filteredList = useMemo(() => {
    return list.filter((item) => {
      const matchesSearch =
        item.namaWajibPajak.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nop.includes(searchQuery) ||
        (item.nomorPelayanan && item.nomorPelayanan.includes(searchQuery));

      const matchesStatus =
        filterStatus === 'ALL'
          ? true
          : filterStatus === 'FAVORITE'
            ? item.isFavorite
            : item.status === filterStatus;
      const matchesJenis = filterJenisLayanan === 'ALL' || item.jenisPermohonan === filterJenisLayanan;

      // Date range filter for Tgl. Nopel (tanggalPermohonan || createdAt)
      let matchesDate = true;
      const itemDate = new Date(item.tanggalPermohonan || item.createdAt);

      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (itemDate < start) matchesDate = false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (itemDate > end) matchesDate = false;
      }

      return matchesSearch && matchesStatus && matchesJenis && matchesDate;
    });
  }, [list, searchQuery, filterStatus, filterJenisLayanan, startDate, endDate]);

  // Pagination logic
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const activePage = currentPage > totalPages ? 1 : currentPage;

  const paginatedList = useMemo(() => {
    return filteredList.slice(
      (activePage - 1) * itemsPerPage,
      activePage * itemsPerPage
    );
  }, [filteredList, activePage, itemsPerPage]);

  return (
    <div id="penginput-board-root" className="w-full font-sans select-none animate-fadeIn flex flex-col gap-6">

      {/* Show full skeleton when initial list is loading */}
      {listLoading && viewMode === 'list' && <PenginputSkeleton />}

      {/* Hide content while skeleton is showing on first load */}
      <div className={`flex flex-col gap-6 ${listLoading && viewMode === 'list' ? 'hidden' : ''}`}>


        {/* ==================== VIEW MODE: LIST (2-Column Split Panel) ==================== */}
        {viewMode === 'list' && (
          <div className="flex flex-col gap-4">

            {/* Title & Subtitle + Search Bar & Action Buttons Header Row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1 mb-1">
              <div>
                <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">
                  Daftar Permohonan
                </h2>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  Kelola dan pantau seluruh permohonan entri pajak.
                </p>
              </div>

              {/* Right Side Controls: Search Bar + Refresh Button + Entri Baru Button */}
              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Search Input Bar (Moved to Top Header Row) */}
                <div className="relative w-full sm:w-72 md:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className="w-full pl-9 pr-9 py-2 bg-white border border-slate-200/90 rounded-lg text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all shadow-3xs"
                    placeholder="Cari No. Pelayanan, NOP, Nama Pemohon..."
                  />
                  {searchQuery ? (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 z-10 p-0.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Hapus Pencarian"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 pointer-events-none">
                      <kbd className="px-1.5 py-0.5 text-[9px] font-extrabold text-slate-400 bg-slate-100 border border-slate-200 rounded">
                        {'/'}
                      </kbd>
                    </div>
                  )}
                </div>

                {/* Tambah Entri Baru Button */}
                <button
                  onClick={() => switchViewMode('form')}
                  className="flex items-center justify-center gap-2 py-2.5 px-4.5 rounded-lg bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-extrabold text-xs shadow-sm hover:shadow-md transition-all cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Tambah Entri Baru</span>
                </button>

                {/* Refresh Button */}
                <button
                  onClick={() => fetchData(true)}
                  disabled={isRefreshing || listLoading}
                  className="p-2.5 rounded-lg border border-slate-200/80 bg-white hover:bg-slate-100 text-slate-500 transition-all cursor-pointer disabled:opacity-40 shadow-3xs"
                  title="Refresh Data"
                >
                  <RefreshCw className={`w-4 h-4 transition-all duration-300 ${isRefreshing ? 'animate-spin text-indigo-500' : ''}`} />
                </button>
              </div>
            </div>

            {/* 100% Full-Width Table Canvas (Pure White Card with Crisp Borders) */}
            <div className="w-full bg-white border border-slate-200/90 rounded-lg shadow-xs flex flex-col overflow-hidden min-h-[500px]">

              {/* Table wrapper with padding */}
              <div className="p-4 flex-1 flex flex-col">
                <div className="rounded-lg overflow-hidden bg-transparent flex flex-col flex-1 justify-between border border-slate-200/70">
                  <div className="overflow-x-auto scrollbar-thin flex-1 flex flex-col">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/80 text-xs font-extrabold text-slate-700 capitalize tracking-normal text-left border-b border-slate-200/90">
                          <th className="py-3.5 px-4 text-center w-12 min-w-[48px]">No</th>
                          <th className="py-3.5 px-2 text-center select-none w-10 min-w-[40px]">⭐</th>

                          {/* Inline Dropdown Header Filter: Tgl. Nopel */}
                          <th className="py-3.5 px-4 min-w-[130px] relative select-none">
                            <div
                              onClick={() => setIsDateFilterOpen(!isDateFilterOpen)}
                              className="flex items-center gap-1.5 cursor-pointer group/th hover:text-slate-900 transition-colors"
                            >
                              <span>Tgl. Nopel</span>
                              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isDateFilterOpen ? 'rotate-180 text-orange-600' : 'text-slate-400 group-hover/th:text-slate-600'}`} />
                              {(startDate || endDate) && (
                                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" title="Filter Tanggal Aktif" />
                              )}
                            </div>

                            {/* Inline Date Filter Popover */}
                            {isDateFilterOpen && (
                              <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsDateFilterOpen(false)} />
                                <div className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-slate-200/90 p-3 z-50 animate-fadeIn text-xs font-semibold flex flex-col gap-2.5 text-slate-700 font-sans normal-case tracking-normal">
                                  <div className="px-1 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center justify-between">
                                    <span>Filter Tanggal Nopel</span>
                                    {(startDate || endDate) && (
                                      <button
                                        onClick={() => {
                                          setStartDate('');
                                          setEndDate('');
                                          setIsDateFilterOpen(false);
                                        }}
                                        className="text-rose-500 hover:underline cursor-pointer lowercase text-[10px] font-bold"
                                      >
                                        reset
                                      </button>
                                    )}
                                  </div>

                                  <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-extrabold text-slate-500">Dari Tanggal</label>
                                    <input
                                      type="date"
                                      value={startDate}
                                      onChange={(e) => setStartDate(e.target.value)}
                                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:border-orange-500 transition-all cursor-pointer"
                                    />
                                  </div>

                                  <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-extrabold text-slate-500">Sampai Dengan</label>
                                    <input
                                      type="date"
                                      value={endDate}
                                      onChange={(e) => setEndDate(e.target.value)}
                                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:border-orange-500 transition-all cursor-pointer"
                                    />
                                  </div>

                                  {/* Quick presets */}
                                  <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100">
                                    <button
                                      onClick={() => {
                                        const today = new Date().toISOString().split('T')[0];
                                        setStartDate(today);
                                        setEndDate(today);
                                      }}
                                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200/80 rounded-lg text-[10px] font-bold text-slate-600 transition-colors cursor-pointer"
                                    >
                                      Hari Ini
                                    </button>
                                    <button
                                      onClick={() => {
                                        const end = new Date();
                                        const start = new Date();
                                        start.setDate(start.getDate() - 7);
                                        setStartDate(start.toISOString().split('T')[0]);
                                        setEndDate(end.toISOString().split('T')[0]);
                                      }}
                                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200/80 rounded-lg text-[10px] font-bold text-slate-600 transition-colors cursor-pointer"
                                    >
                                      7 Hari
                                    </button>
                                    <button
                                      onClick={() => {
                                        const now = new Date();
                                        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
                                        const today = now.toISOString().split('T')[0];
                                        setStartDate(firstDay);
                                        setEndDate(today);
                                      }}
                                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200/80 rounded-lg text-[10px] font-bold text-slate-600 transition-colors cursor-pointer"
                                    >
                                      Bulan Ini
                                    </button>
                                  </div>
                                </div>
                              </>
                            )}
                          </th>
                          <th className="py-3.5 px-4 min-w-[110px]">Tgl. Selesai</th>
                          <th className="py-3.5 px-4 min-w-[160px]">No. Pelayanan</th>
                          <th className="py-3.5 px-4 min-w-[180px]">Nomor Objek Pajak</th>
                          <th className="py-3.5 px-4 min-w-[150px]">Nama Pemohon</th>

                          {/* Inline Dropdown Header Filter: Jenis Layanan */}
                          <th className="py-3.5 px-4 min-w-[150px] relative select-none">
                            <div
                              onClick={() => setIsJenisFilterOpen(!isJenisFilterOpen)}
                              className="flex items-center gap-1.5 cursor-pointer group/th hover:text-slate-900 transition-colors"
                            >
                              <span>Jenis Layanan</span>
                              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isJenisFilterOpen ? 'rotate-180 text-orange-600' : 'text-slate-400 group-hover/th:text-slate-600'}`} />
                              {filterJenisLayanan !== 'ALL' && (
                                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" title="Filter Aktif" />
                              )}
                            </div>

                            {/* Inline Dropdown Popover */}
                            {isJenisFilterOpen && (
                              <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsJenisFilterOpen(false)} />
                                <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-slate-200/90 p-2 z-50 animate-fadeIn text-xs font-semibold flex flex-col gap-1 text-slate-700 font-sans normal-case tracking-normal">
                                  <div className="px-3 py-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1 flex items-center justify-between">
                                    <span>Filter Jenis Layanan</span>
                                    {filterJenisLayanan !== 'ALL' && (
                                      <button
                                        onClick={() => {
                                          setFilterJenisLayanan('ALL');
                                          setIsJenisFilterOpen(false);
                                        }}
                                        className="text-rose-500 hover:underline cursor-pointer lowercase text-[10px] font-bold"
                                      >
                                        reset
                                      </button>
                                    )}
                                  </div>
                                  {[
                                    { id: 'ALL', label: 'Semua Jenis Layanan' },
                                    { id: 'MUTASI_SEBAGIAN', label: 'Mutasi Sebagian' },
                                    { id: 'MUTASI_HABIS_UPDATE', label: 'Mutasi Habis (Update)' },
                                    { id: 'MUTASI_HABIS_REGULER', label: 'Mutasi Habis (Reguler)' },
                                    { id: 'OBJEK_PAJAK_BARU', label: 'Objek Pajak Baru' },
                                    { id: 'PEMBETULAN', label: 'Pembetulan' },
                                    { id: 'PENGAKTIFAN', label: 'Pengaktifan' }
                                  ].map((opt) => (
                                    <button
                                      key={opt.id}
                                      onClick={() => {
                                        setFilterJenisLayanan(opt.id);
                                        setIsJenisFilterOpen(false);
                                      }}
                                      className={`w-full px-3 py-2 rounded-lg text-left flex items-center justify-between transition-colors cursor-pointer ${filterJenisLayanan === opt.id ? 'bg-orange-50 text-orange-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                                        }`}
                                    >
                                      <span>{opt.label}</span>
                                      {filterJenisLayanan === opt.id && <span className="w-1.5 h-1.5 rounded-full bg-orange-600" />}
                                    </button>
                                  ))}
                                </div>
                              </>
                            )}
                          </th>

                          <th className="py-3.5 px-4 min-w-[150px]">L. Tanah (Lama ➔ Baru)</th>
                          <th className="py-3.5 px-4 min-w-[150px]">L. Bangunan (Lama ➔ Baru)</th>

                          {/* Inline Dropdown Header Filter: Status */}
                          <th className="py-3.5 px-4 text-center min-w-[130px] relative select-none">
                            <div
                              onClick={() => setIsStatusFilterOpen(!isStatusFilterOpen)}
                              className="flex items-center justify-center gap-1.5 cursor-pointer group/th hover:text-slate-900 transition-colors mx-auto"
                            >
                              <span>Status</span>
                              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isStatusFilterOpen ? 'rotate-180 text-orange-600' : 'text-slate-400 group-hover/th:text-slate-600'}`} />
                              {filterStatus !== 'ALL' && (
                                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" title="Filter Aktif" />
                              )}
                            </div>

                            {/* Inline Dropdown Popover */}
                            {isStatusFilterOpen && (
                              <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsStatusFilterOpen(false)} />
                                <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-xl border border-slate-200/90 p-2 z-50 animate-fadeIn text-xs font-semibold flex flex-col gap-1 text-slate-700 font-sans normal-case tracking-normal text-left">
                                  <div className="px-3 py-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1 flex items-center justify-between">
                                    <span>Filter Status</span>
                                    {filterStatus !== 'ALL' && (
                                      <button
                                        onClick={() => {
                                          setFilterStatus('ALL');
                                          setIsStatusFilterOpen(false);
                                        }}
                                        className="text-rose-500 hover:underline cursor-pointer lowercase text-[10px] font-bold"
                                      >
                                        reset
                                      </button>
                                    )}
                                  </div>
                                  {[
                                    { id: 'ALL', label: 'Semua Status' },
                                    { id: 'SUBMITTED', label: 'Diajukan' },
                                    { id: 'FAVORITE', label: 'Permohonan Favorit' },
                                    { id: 'REVISION', label: 'Minta Koreksi' },
                                    { id: 'BUNDLED', label: 'Sudah Dibundel' },
                                    { id: 'COMPLETED', label: 'Selesai' },
                                    { id: 'REJECTED', label: 'Ditolak' },
                                    { id: 'ARCHIVED', label: 'Diarsipkan' }
                                  ].map((opt) => (
                                    <button
                                      key={opt.id}
                                      onClick={() => {
                                        setFilterStatus(opt.id);
                                        setIsStatusFilterOpen(false);
                                      }}
                                      className={`w-full px-3 py-2 rounded-lg text-left flex items-center justify-between transition-colors cursor-pointer ${filterStatus === opt.id ? 'bg-orange-50 text-orange-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                                        }`}
                                    >
                                      <span>{opt.label}</span>
                                      {filterStatus === opt.id && <span className="w-1.5 h-1.5 rounded-full bg-orange-600" />}
                                    </button>
                                  ))}
                                </div>
                              </>
                            )}
                          </th>

                          <th className="py-3.5 px-4 text-center min-w-[110px]">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                        {paginatedList.length === 0 ? (
                          <tr>
                            <td colSpan={12} className="py-10 text-center select-none">
                              <div className="flex flex-col items-center justify-center mx-auto">
                                <EmptyDataAnimation />
                                <p className="text-xs font-bold text-slate-700 mt-1">
                                  {searchQuery ? 'Tidak ada permohonan yang sesuai' : 'Belum ada data permohonan'}
                                </p>
                                <p className="text-[11px] text-slate-400 font-semibold max-w-sm mx-auto mt-1">
                                  {searchQuery ? 'Coba ubah kata kunci pencarian atau reset filter status.' : 'Klik "+ Tambah Entri Baru" di atas untuk memulai.'}
                                </p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          paginatedList.map((item, idx) => {
                            const globalIndex = (activePage - 1) * itemsPerPage + idx + 1;
                            const isFavorite = item.isFavorite;

                            return (
                              <tr
                                key={item.id}
                                className="hover:bg-slate-50/70 transition-colors group"
                              >
                                <td className="py-3 px-4 text-center font-bold text-slate-400 font-mono text-[11px]">
                                  {globalIndex}
                                </td>
                                <td className="py-2.5 px-2 text-center">
                                  <button
                                    onClick={() => handleToggleFavorite(item.id)}
                                    className="p-1 text-slate-300 hover:text-amber-500 transition-colors cursor-pointer"
                                    title={isFavorite ? "Hapus dari Favorit" : "Tambah ke Favorit"}
                                  >
                                    <Star className={`w-4 h-4 ${isFavorite ? 'text-amber-500 fill-amber-500' : ''}`} />
                                  </button>
                                </td>
                                <td className="py-2.5 px-4 text-slate-600 font-mono text-[11px] font-semibold whitespace-nowrap">
                                  {new Date(item.tanggalPermohonan || item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </td>
                                <td className="py-2.5 px-4 whitespace-nowrap">
                                  {item.tanggalPenyelesaian ? (
                                    <div className="flex items-center gap-1.5">
                                      <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${isOverdue(item.tanggalPenyelesaian, item.status)
                                        ? 'bg-rose-100 text-rose-700 border border-rose-200 animate-pulse'
                                        : 'text-slate-600'
                                        }`}>
                                        {new Date(item.tanggalPenyelesaian).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                      </span>
                                    </div>
                                  ) : "-"}
                                </td>
                                <td className="py-2.5 px-4 min-w-[140px] group/cell relative">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold text-slate-700 font-mono tracking-tight">
                                      {highlightText(item.nomorPelayanan || item.nomorPermohonan, searchQuery)}
                                    </span>
                                    <button
                                      onClick={(e) => handleCopy(e, item.nomorPelayanan || item.nomorPermohonan)}
                                      className="p-1 rounded opacity-0 group-hover/cell:opacity-100 hover:bg-slate-105 text-slate-400 hover:text-indigo-655 transition-all cursor-pointer flex items-center justify-center w-5 h-5 select-none"
                                      title="Salin Nomor"
                                    >
                                      {copiedText === (item.nomorPelayanan || item.nomorPermohonan) ? (
                                        <Check className="w-3.5 h-3.5 text-emerald-600 transition-all duration-200 transform scale-110" />
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                    </button>
                                  </div>
                                </td>
                                <td className="py-2.5 px-4 min-w-[140px] group/cell relative">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-semibold text-slate-500 font-mono">
                                      {highlightText(formatNop(item.nop), searchQuery)}
                                    </span>
                                    <button
                                      onClick={(e) => handleCopy(e, item.nop)}
                                      className="p-1 rounded opacity-0 group-hover/cell:opacity-100 hover:bg-slate-105 text-slate-400 hover:text-indigo-655 transition-all cursor-pointer flex items-center justify-center w-5 h-5 select-none"
                                      title="Salin NOP"
                                    >
                                      {copiedText === item.nop ? (
                                        <Check className="w-3.5 h-3.5 text-emerald-600 transition-all duration-200 transform scale-110" />
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                    </button>
                                  </div>
                                </td>
                                <td className="py-2.5 px-4 group/cell relative">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-semibold text-slate-700 whitespace-nowrap uppercase">
                                      {highlightText(item.namaWajibPajak.toUpperCase(), searchQuery)}
                                    </span>
                                    <button
                                      onClick={(e) => handleCopy(e, item.namaWajibPajak)}
                                      className="p-1 rounded opacity-0 group-hover/cell:opacity-100 hover:bg-slate-105 text-slate-400 hover:text-indigo-655 transition-all cursor-pointer flex items-center justify-center w-5 h-5 select-none"
                                      title="Salin Nama Pemohon"
                                    >
                                      {copiedText === item.namaWajibPajak ? (
                                        <Check className="w-3.5 h-3.5 text-emerald-600 transition-all duration-200 transform scale-110" />
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                    </button>
                                  </div>
                                </td>
                                <td className="py-2.5 px-4">
                                  <span
                                    className="text-[9px] font-bold text-slate-500 bg-slate-100 border border-slate-205 px-2.5 py-0.5 rounded capitalize font-sans tracking-wide"
                                    title={item.jenisPermohonan.replace(/_/g, ' ')}
                                  >
                                    {getAbbreviatedJenis(item.jenisPermohonan)}
                                  </span>
                                </td>
                                <td className="py-2.5 px-4 whitespace-nowrap">
                                  <div className="flex items-center gap-1 font-mono text-[11px]">
                                    <span className="font-semibold text-slate-500" title="Luas Tanah Lama">
                                      {item.luasTanahLama !== null && item.luasTanahLama !== undefined && item.luasTanahLama > 0 ? `${item.luasTanahLama} m²` : '-'}
                                    </span>
                                    <span className="text-slate-300 text-[10px] px-0.5">➔</span>
                                    <span className="font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded text-[10px]" title="Luas Tanah Baru">
                                      {item.dataBaru?.[0]?.luasTanahBaru !== null && item.dataBaru?.[0]?.luasTanahBaru !== undefined && item.dataBaru[0].luasTanahBaru > 0
                                        ? `${item.dataBaru[0].luasTanahBaru} m²`
                                        : (item.luasTanahBaru !== null && item.luasTanahBaru !== undefined && item.luasTanahBaru > 0 ? `${item.luasTanahBaru} m²` : '-')}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-2.5 px-4 whitespace-nowrap">
                                  <div className="flex items-center gap-1 font-mono text-[11px]">
                                    <span className="font-semibold text-slate-500" title="Luas Bangunan Lama">
                                      {item.luasBangunanLama !== null && item.luasBangunanLama !== undefined && item.luasBangunanLama > 0 ? `${item.luasBangunanLama} m²` : '-'}
                                    </span>
                                    <span className="text-slate-300 text-[10px] px-0.5">➔</span>
                                    <span className="font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-1.5 py-0.5 rounded text-[10px]" title="Luas Bangunan Baru">
                                      {item.dataBaru?.[0]?.luasBangunanBaru !== null && item.dataBaru?.[0]?.luasBangunanBaru !== undefined && item.dataBaru[0].luasBangunanBaru > 0
                                        ? `${item.dataBaru[0].luasBangunanBaru} m²`
                                        : (item.luasBangunanBaru !== null && item.luasBangunanBaru !== undefined && item.luasBangunanBaru > 0 ? `${item.luasBangunanBaru} m²` : '-')}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-2.5 px-4 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full border uppercase ${getStatusBadgeClass(item.status)}`}>
                                      {item.status}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-2.5 px-4 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <button
                                      onClick={() => setSelectedRequest(item)}
                                      className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                                      title="Lihat Detail"
                                    >
                                      <FileText className="w-4 h-4" />
                                    </button>

                                    <button
                                      onClick={() => setEditTarget(item)}
                                      className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                                      title="Edit Berkas"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>

                                    <button
                                      onClick={() => setDuplicateTarget(item)}
                                      className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                                      title="Duplikasi Berkas"
                                    >
                                      <Copy className="w-4 h-4" />
                                    </button>

                                    {item.status === 'REVISION' && (
                                      <button
                                        onClick={() => handleResubmit(item.id)}
                                        disabled={loading}
                                        className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-100/60 transition-colors cursor-pointer"
                                        title="Kirim Ulang Revisi"
                                      >
                                        <RefreshCw className="w-4 h-4" />
                                      </button>
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

                  {/* Table Footer / Pagination — Pinned to bottom with mt-auto */}
                  <div className="px-5 py-3.5 border-t border-slate-200/60 bg-transparent flex flex-col sm:flex-row items-center justify-between gap-4 select-none shrink-0 mt-auto">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-semibold text-gray-500 font-sans">
                        {filteredList.length > 0
                          ? `Menampilkan ${((activePage - 1) * itemsPerPage) + 1}–${Math.min(activePage * itemsPerPage, filteredList.length)} dari ${filteredList.length} permohonan`
                          : 'Tidak ada data'}
                      </span>
                      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-1.5 py-0.5">
                        {[10, 20, 50].map(n => (
                          <button
                            key={n}
                            onClick={() => setItemsPerPage(n)}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${itemsPerPage === n
                              ? 'bg-slate-900 text-white shadow-xs'
                              : 'text-slate-500 hover:text-slate-700'
                              }`}
                          >
                            {n}
                          </button>
                        ))}
                        <span className="text-[10px] text-slate-400 font-semibold pl-0.5">/hal</span>
                      </div>
                    </div>

                    {totalPages > 1 && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={activePage === 1}
                          className="p-1.5 rounded-lg border-transparent bg-white text-gray-500 hover:bg-[#f1f5f9] disabled:opacity-40 transition-all cursor-pointer"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter(page => page === 1 || page === totalPages || Math.abs(page - activePage) <= 1)
                          .reduce((acc: (number | string)[], page, idx, arr) => {
                            if (idx > 0 && (page as number) - (arr[idx - 1] as number) > 1) acc.push('...');
                            acc.push(page);
                            return acc;
                          }, [])
                          .map((page, idx) =>
                            page === '...' ? (
                              <span key={`ellipsis-${idx}`} className="px-1 text-slate-400 text-xs">…</span>
                            ) : (
                              <button
                                key={page}
                                onClick={() => setCurrentPage(page as number)}
                                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${activePage === page
                                  ? 'bg-slate-900 text-white font-extrabold shadow-xs scale-105 z-10'
                                  : 'border-transparent bg-white text-gray-500 hover:bg-[#f1f5f9]'
                                  }`}
                              >
                                {page}
                              </button>
                            )
                          )}
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={activePage === totalPages}
                          className="p-1.5 rounded-lg border-transparent bg-white text-gray-500 hover:bg-[#f1f5f9] disabled:opacity-40 transition-all cursor-pointer"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== VIEW MODE: FORM (Centered Input Form) ==================== */}
        {viewMode === 'form' && (
          <CreateForm
            onSuccess={() => {
              setDuplicateTarget(null);
              fetchData();
            }}
            onCancel={() => {
              setDuplicateTarget(null);
              handleCancelCreate();
            }}
            initialData={duplicateTarget}
          />
        )}

        {/* ================= DETAILS MODAL OVERLAY ================= */}
        <DetailsModal
          isOpen={!!selectedRequest}
          selectedRequest={selectedRequest}
          onClose={handleCloseDetails}
        />

        <EditModal
          editTarget={editTarget}
          onClose={handleCloseEdit}
          onSuccess={fetchData}
        />

        <ActionStatusModal
          isOpen={statusModalOpen}
          status={statusModalStatus}
          title={statusModalTitle}
          message={statusModalMessage}
          onClose={() => setStatusModalOpen(false)}
        />

      </div>
    </div>
  );
}


