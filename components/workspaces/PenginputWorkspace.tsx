"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Plus, Search, Edit, RefreshCw,
  AlertTriangle, X, CheckCircle, FileText, Calendar,
  Trash2, ChevronLeft, ChevronRight, Check, Lock,
  FileSpreadsheet, Star, Filter
} from 'lucide-react';
import {
  resubmitPermohonan,
  getPenginputPermohonan,
  togglePermohonanFavorite
} from '@/app/actions/penginput';
import { useDashboard } from '@/context/DashboardContext';
import { SkeletonBox, SkeletonText, SkeletonBadge } from '@/components/skeletons/SkeletonBase';
import { DetailsModal } from './DetailsModal';
import { EditModal } from './EditModal';
import { CreateForm } from './CreateForm';

/** Skeleton lengkap untuk PenginputWorkspace — header + tabel */
export function PenginputSkeleton() {
  const STATUS_CHIPS = ['Semua', 'SUBMITTED', 'REVISION', 'BUNDLED', 'ARCHIVED', 'COMPLETED', 'REJECTED'];
  return (
    <div className="w-full font-sans select-none flex flex-col gap-6 animate-fadeIn">
      {/* Header card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#f3f6f9] p-5 rounded-2xl shadow-sm">
        <SkeletonBox width="w-56" height="h-5" rounded="rounded-full" />
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1">
            <SkeletonBox width="w-32" height="h-7" rounded="rounded-lg" />
            <SkeletonBox width="w-24" height="h-7" rounded="rounded-lg" />
          </div>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-[#f3f6f9] rounded-2xl shadow-sm flex flex-col overflow-hidden min-h-[500px]">
        {/* Action row: search */}
        <div className="p-5 border-b border-gray-200/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <SkeletonBox width="w-36" height="h-4" rounded="rounded-full" />
          <div className="w-72 h-8 bg-gray-200 animate-pulse rounded-lg" />
        </div>

        {/* Filter chips */}
        <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2 overflow-x-auto bg-[#f3f6f9]">
          {STATUS_CHIPS.map((s) => (
            <div key={s} className="h-6 rounded-full bg-gray-200 animate-pulse" style={{ width: s === 'Semua' ? 52 : s.length * 7 + 20 }} />
          ))}
        </div>

        {/* Table */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-gray-200/60">
                {['No', 'Tanggal', 'No. Pelayanan / NOP', 'Wajib Pajak', 'Jenis Layanan', 'Status', 'Aksi'].map((h) => (
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
                  <td className="py-4 px-5 min-w-[220px]">
                    <div className="flex flex-col gap-1.5">
                      <SkeletonText width="w-36" height="h-3" />
                      <SkeletonText width="w-28" height="h-2.5" />
                    </div>
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
  // Format: 36.19.150.002.003-0123.0 (2+2+3+3+3+4+1 = 18 digits)
  if (!nop || nop.length !== 18) return nop;
  return `${nop.slice(0, 2)}.${nop.slice(2, 4)}.${nop.slice(4, 7)}.${nop.slice(7, 10)}.${nop.slice(10, 13)}-${nop.slice(13, 17)}.${nop.slice(17)}`;
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

export default function PenginputWorkspace() {
  const { showConfirm } = useDashboard();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterJenisLayanan, setFilterJenisLayanan] = useState<string>('ALL');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // View switcher state ('list' | 'form')
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
  const handleCancelCreate = useCallback(() => {
    setViewMode('list');
  }, []);
  // Selected item details modal state
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const handleCloseDetails = useCallback(() => {
    setSelectedRequest(null);
  }, []);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [editTarget, setEditTarget] = useState<any | null>(null);
  const handleCloseEdit = useCallback(() => {
    setEditTarget(null);
  }, []);

  // Load permohonan data
  const fetchData = useCallback(async () => {
    setListLoading(true);
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
      }
    } catch (err) {
      setError('Gagal mengubah status favorit.');
      setList(originalList); // Revert
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus, filterJenisLayanan]);





  // Resubmit Revision
  const handleResubmit = useCallback((id: string) => {
    showConfirm({
      title: 'Konfirmasi Kirim Ulang',
      message: 'Apakah Anda yakin ingin melakukan resubmit untuk permohonan ini? Harap periksa kembali semua data sebelum melanjutkan.',
      onConfirm: async () => {
        setLoading(true);
        try {
          const res = await resubmitPermohonan(id);
          if (res.success) {
            showConfirm({
              title: 'Resubmit Berhasil',
              message: 'Status dialihkan kembali ke diajukan (SUBMITTED) & notifikasi terkirim.',
              onConfirm: () => {},
              confirmText: 'Selesai',
              cancelText: 'Tutup'
            });
            fetchData();
          } else {
            showConfirm({
              title: 'Resubmit Gagal',
              message: res.error || 'Gagal melakukan resubmit.',
              onConfirm: () => {},
              confirmText: 'Mengerti',
              cancelText: 'Tutup'
            });
          }
        } catch (err: any) {
          showConfirm({
            title: 'Terjadi Kesalahan',
            message: err.message || 'Terjadi kesalahan sistem saat melakukan resubmit.',
            onConfirm: () => {},
            confirmText: 'Mengerti',
            cancelText: 'Tutup'
          });
        } finally {
          setLoading(false);
        }
      }
    });
  }, [showConfirm, fetchData]);



  // Status chips count memoization
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: list.length,
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
    });
    return counts;
  }, [list]);

  // Search filter
  const filteredList = useMemo(() => {
    return list.filter((item) => {
      const matchesSearch =
        item.namaWajibPajak.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nop.includes(searchQuery) ||
        item.nomorPermohonan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.nomorPelayanan && item.nomorPelayanan.includes(searchQuery));

      const matchesStatus = filterStatus === 'ALL' || item.status === filterStatus;
      const matchesJenis = filterJenisLayanan === 'ALL' || item.jenisPermohonan === filterJenisLayanan;

      return matchesSearch && matchesStatus && matchesJenis;
    });
  }, [list, searchQuery, filterStatus, filterJenisLayanan]);

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

        {/* 1. Header with View switcher toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] p-5 rounded-2xl shadow-md shadow-indigo-200/20 transition-all duration-300">
          <div className="flex items-center gap-2.5 text-[11px] font-bold tracking-wider font-display select-none">
            <div className="flex items-center gap-1.5 text-[#2c333f]/65 hover:text-[#2c333f] transition-colors">
              <span className="capitalize">my tasks</span>
            </div>
            <span className="text-[#2c333f]/40 font-medium select-none">&gt;</span>
            <div className="flex items-center gap-1.5 bg-white/40 border border-white/50 px-2.5 py-1 rounded-lg shadow-3xs animate-fadeIn">
              <span className="font-extrabold capitalize text-[#2c333f]">
                {viewMode === 'list' ? 'daftar permohonan' : 'entri baru'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <div className="bg-black/10 p-1 rounded-xl border border-black/5 flex items-center gap-1 shadow-3xs">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3.5 py-1.5 rounded-lg text-[11px] font-extrabold transition-all duration-300 flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${viewMode === 'list'
                  ? 'bg-white text-[#2c333f] shadow-xs'
                  : 'text-[#2c333f]/75 hover:text-[#2c333f] hover:bg-white/10'
                  }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Daftar permohonan</span>
              </button>
              <button
                onClick={() => setViewMode('form')}
                className={`px-3.5 py-1.5 rounded-lg text-[11px] font-extrabold transition-all duration-300 flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${viewMode === 'form'
                  ? 'bg-white text-[#2c333f] shadow-xs'
                  : 'text-[#2c333f]/75 hover:text-[#2c333f] hover:bg-white/10'
                  }`}
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Entri baru</span>
              </button>
            </div>
          </div>
        </div>
        {/* ==================== VIEW MODE: LIST (Spacious Table View) ==================== */}
        {viewMode === 'list' && (
          <div className="bg-[#f3f6f9] rounded-2xl shadow-sm flex flex-col overflow-hidden min-h-[500px]">

            {/* Action Row: Search and quick add */}
            <div className="p-5 border-b border-gray-200/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-extrabold text-[13px] capitalize tracking-wider text-slate-700 font-display">
                  Daftar permohonan
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
                {/* Search input */}
                <div className={`relative w-full sm:w-72 p-[1.5px] rounded-lg transition-all duration-300 ${isSearchFocused
                  ? 'bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] shadow-xs'
                  : 'bg-slate-200/90'
                  }`}>
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className="w-full pl-8.5 pr-8 py-1.5 bg-white border-transparent rounded-[7px] text-xs font-semibold text-gray-755 placeholder-gray-400 focus:outline-none transition-all"
                    placeholder="Cari nomor pelayanan, NOP, WP..."
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-655 z-10">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Jenis Layanan (Icon Popover) */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                    className={`p-2 rounded-lg border border-transparent transition-all duration-200 flex items-center justify-center cursor-pointer ${filterJenisLayanan !== 'ALL'
                      ? 'bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] text-[#2c333f] font-bold scale-105 shadow-3xs'
                      : 'bg-transparent hover:bg-slate-200/50 text-slate-500'
                      }`}
                    title="Filter Jenis Layanan"
                  >
                    <Filter className="w-4 h-4" />
                    {filterJenisLayanan !== 'ALL' && (
                      <span className="absolute -top-1.5 -right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
                    )}
                  </button>

                  {isFilterDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsFilterDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-100 rounded-xl shadow-lg py-2 z-50 animate-fadeIn text-xs text-slate-700 font-semibold flex flex-col gap-0.5">
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
                          const isSelected = filterJenisLayanan === item.val;
                          return (
                            <button
                              key={item.val}
                              type="button"
                              onClick={() => {
                                setFilterJenisLayanan(item.val);
                                setCurrentPage(1);
                                setIsFilterDropdownOpen(false);
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
              </div>
            </div>

            {/* Filtering Chips */}
            <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2 overflow-x-auto scrollbar-none bg-[#f3f6f9] shrink-0">
              {['ALL', 'SUBMITTED', 'REVISION', 'BUNDLED', 'ARCHIVED', 'COMPLETED', 'REJECTED'].map((st) => {
                const isActive = filterStatus === st;
                const count = statusCounts[st] ?? 0;
                return (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-3.5 py-1 rounded-full text-[10px] font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer border ${isActive
                      ? 'bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] text-[#2c333f] border-transparent shadow-sm'
                      : 'bg-white text-slate-500 hover:bg-slate-50 border-gray-200/90'
                      }`}
                  >
                    <span>{st === 'ALL' ? 'Semua' : st.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-extrabold ${isActive ? 'bg-[#2c333f]/10 text-[#2c333f]' : 'bg-slate-100 text-slate-500'
                      }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Table */}
            <div className="flex-1 overflow-x-auto scrollbar-thin">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-extrabold text-slate-450 capitalize tracking-wider text-left border-b border-slate-200">
                    <th className="py-3 px-5 text-center">No</th>
                    <th className="py-3 px-2 text-center select-none w-10">⭐</th>
                    <th className="py-3 px-5">Tanggal Nopel</th>
                    <th className="py-3 px-5">Tanggal Penyelesaian</th>
                    <th className="py-3 px-5">No. Pelayanan / NOP</th>
                    <th className="py-3 px-5">Nama WP</th>
                    <th className="py-3 px-5">Jenis Layanan</th>
                    <th className="py-3 px-5 text-center">Status</th>
                    <th className="py-3 px-5 text-right pr-6 w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {listLoading ? (
                    <tr>
                      <td colSpan={9} className="py-16 text-center">
                        <span className="inline-block w-6 h-6 rounded-full border-2 border-indigo-600/30 border-t-indigo-600 animate-spin" />
                      </td>
                    </tr>
                  ) : filteredList.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-16 px-5 text-center text-xs text-gray-400 italic">
                        Belum ada data permohonan yang sesuai.
                      </td>
                    </tr>
                  ) : (
                    paginatedList.map((item, index) => {
                      const itemNumber = (activePage - 1) * itemsPerPage + index + 1;
                      const tanggalText = new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
                      const canEdit = (item.status === 'SUBMITTED' && !item.bundleId) || item.status === 'REVISION';
                      const showResubmit = item.status === 'REVISION';

                      return (
                        <tr
                          key={item.id}
                          onClick={() => setSelectedRequest(item)}
                          className="hover:bg-indigo-50/20 transition-all cursor-pointer group"
                        >
                          <td className="py-4 px-5 text-center text-xs font-bold text-gray-400 font-mono">
                            {itemNumber}
                          </td>
                          <td className="py-4 px-2 text-center" onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(item.id);
                          }}>
                            <button
                              type="button"
                              className="p-1 hover:scale-110 active:scale-95 transition-all text-slate-300 hover:text-amber-500 cursor-pointer"
                              title={item.isFavorite ? "Hapus dari Favorit" : "Tandai Favorit"}
                            >
                              <Star className={`w-4 h-4 ${item.isFavorite
                                ? 'text-amber-500 fill-amber-500 shadow-3xs'
                                : 'text-slate-355'
                                }`} />
                            </button>
                          </td>
                          <td className="py-4 px-5 text-xs font-semibold text-gray-500 whitespace-nowrap">
                            {item.tanggalNoPelayanan
                              ? new Date(item.tanggalNoPelayanan).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                              : "-"}
                          </td>
                          <td className="py-4 px-5 text-xs font-semibold text-gray-500 whitespace-nowrap">
                            {item.tanggalPenyelesaian
                              ? new Date(item.tanggalPenyelesaian).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                              : "-"}
                          </td>
                          <td className="py-4 px-5 min-w-[220px]">
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-slate-805 font-mono tracking-tight">
                                {item.nomorPelayanan || item.nomorPermohonan}
                              </span>
                              <span className="text-[10px] text-gray-400 font-semibold font-mono mt-0.5">
                                {formatNop(item.nop)}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-5">
                            <span className="text-xs font-bold text-slate-700 whitespace-nowrap capitalize">
                              {item.namaWajibPajak.toLowerCase()}
                            </span>
                          </td>
                          <td className="py-4 px-5">
                            <span
                              className="text-[9px] font-bold text-slate-500 bg-slate-100 border border-slate-205 px-2.5 py-0.5 rounded capitalize font-sans tracking-wide"
                              title={item.jenisPermohonan.replace(/_/g, ' ')}
                            >
                              {getAbbreviatedJenis(item.jenisPermohonan)}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-center">
                            <span className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${getStatusBadgeClass(item.status)}`}>
                              {toTitleCase(item.status)}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-right pr-6 whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2.5" onClick={(e) => e.stopPropagation()}>
                              {showResubmit && (
                                <button
                                  onClick={() => handleResubmit(item.id)}
                                  disabled={loading}
                                  className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                                  title="Resubmit (Kirim Ulang Kelengkapan)"
                                >
                                  <RefreshCw className="w-3.5 h-3.5 text-amber-650" />
                                </button>
                              )}
                              {canEdit ? (
                                <button
                                  onClick={() => setEditTarget(item)}
                                  disabled={loading}
                                  className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                                  title="Edit Data"
                                >
                                  <Edit className="w-3.5 h-3.5 text-indigo-600" />
                                </button>
                              ) : (
                                <div className="p-1.5 flex items-center justify-center text-gray-400 select-none" title="Terkunci">
                                  <Lock className="w-3.5 h-3.5 text-slate-400/85" />
                                </div>
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

            {/* Table Footer / Pagination */}
            {totalPages > 1 && (
              <div className="px-5 py-4 border-t border-gray-200/60 bg-[#f3f6f9] flex flex-col sm:flex-row items-center justify-between gap-4 select-none shrink-0">
                <span className="text-[11px] font-semibold text-gray-500 font-sans">
                  Menampilkan {((activePage - 1) * itemsPerPage) + 1} - {Math.min(activePage * itemsPerPage, filteredList.length)} dari {filteredList.length} permohonan
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={activePage === 1}
                    className="p-1.5 rounded-lg border-transparent bg-white text-gray-500 hover:bg-[#f1f5f9] disabled:opacity-40 transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${activePage === page
                        ? 'bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] text-[#1e2022] font-extrabold shadow-sm scale-105 z-10'
                        : 'border-transparent bg-white text-gray-500 hover:bg-[#f1f5f9]'
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={activePage === totalPages}
                    className="p-1.5 rounded-lg border-transparent bg-white text-gray-500 hover:bg-[#f1f5f9] disabled:opacity-40 transition-all cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== VIEW MODE: FORM (Centered Input Form) ==================== */}
        {viewMode === 'form' && (
          <CreateForm
            onSuccess={fetchData}
            onCancel={handleCancelCreate}
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

      </div>{/* end: hide-during-skeleton wrapper */}
    </div>
  );
}
