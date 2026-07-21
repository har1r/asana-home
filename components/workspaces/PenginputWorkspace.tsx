"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Plus, Search, Edit, RefreshCw,
  AlertTriangle, X, CheckCircle, FileText, Calendar,
  Trash2, ChevronLeft, ChevronRight, Check, Lock,
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
import { DetailsModal } from './DetailsModal';
import { EditModal } from './EditModal';
import { CreateForm } from './CreateForm';
import { ActionStatusModal } from './ActionStatusModal';


interface FishingAnimationProps {
  isSearch?: boolean;
}

const FishingAnimation: React.FC<FishingAnimationProps> = React.memo(({ isSearch }) => {
  return (
    <div className="relative w-56 h-36 flex items-center justify-center overflow-hidden select-none mb-1">
      <svg viewBox="0 0 200 120" className="w-full h-full">
        <defs>
          <style>{`
            @keyframes rodBob {
              0%, 100% { transform: rotate(0deg); }
              50% { transform: rotate(-2.5deg); }
            }
            @keyframes lineDangle {
              0%, 100% { transform: skewX(0deg); }
              50% { transform: skewX(-2deg); }
            }
            @keyframes rippleEffect {
              0% { r: 1px; opacity: 0.8; stroke-width: 0.75px; }
              100% { r: 18px; opacity: 0; stroke-width: 0.25px; }
            }
            @keyframes fishJump {
              0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
              5% { opacity: 1; }
              25% { transform: translate(15px, -20px) rotate(30deg); }
              35% { transform: translate(22px, -20px) rotate(70deg); }
              55% { transform: translate(40px, 0px) rotate(130deg); opacity: 1; }
              65%, 100% { transform: translate(40px, 8px) rotate(160deg); opacity: 0; }
            }
            @keyframes cloudMove {
              0% { transform: translateX(-8px); }
              100% { transform: translateX(8px); }
            }
            .rod-rod {
              transform-origin: 45px 75px;
              animation: rodBob 4.5s ease-in-out infinite;
            }
            .line-string {
              transform-origin: 125px 35px;
              animation: lineDangle 4.5s ease-in-out infinite;
            }
            .ripple-circle-1 {
              animation: rippleEffect 3.2s linear infinite;
            }
            .ripple-circle-2 {
              animation: rippleEffect 3.2s linear infinite;
              animation-delay: 1.6s;
            }
            .fish-jumping {
              transform-origin: 125px 95px;
              animation: fishJump 6.5s ease-in-out infinite;
            }
            .cloud-bg-1 {
              animation: cloudMove 15s ease-in-out infinite alternate;
            }
            .cloud-bg-2 {
              animation: cloudMove 20s ease-in-out infinite alternate;
            }
          `}</style>
        </defs>

        {/* Sky Background & Clouds */}
        <g className="cloud-bg-1" opacity="0.3">
          <path d="M25 20c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5c.8-.2 1.6.3 1.8 1.1.2.8-.3 1.6-1.1 1.8H20c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5" fill="#94a3b8" />
        </g>
        <g className="cloud-bg-2" opacity="0.25">
          <path d="M145 15c0-1.8 1.5-3.3 3.3-3.3s3.3 1.5 3.3 3.3c.6-.2 1.2.2 1.4.8.2.6-.2 1.2-.8 1.4H140c-.6 0-1.1-.5-1.1-1.1s.5-1.1 1.1-1.1" fill="#94a3b8" />
        </g>

        {/* Water */}
        <path d="M0 95h200v25H0z" fill="#f1f5f9" />
        <path d="M0 95c30-1.5 60 1.5 90 0s60-1.5 90 0 20 1.5 20 1.5v4H0z" fill="#cbd5e1" opacity="0.4" />

        {/* Wooden Pier */}
        <rect x="0" y="80" width="55" height="5" rx="1" fill="#854d0e" />
        <rect x="8" y="85" width="7" height="35" fill="#713f12" />
        <rect x="40" y="85" width="7" height="35" fill="#713f12" />

        {/* Sitting Fisherman */}
        <circle cx="35" cy="55" r="4.5" fill="#475569" />
        {/* Hat */}
        <path d="M26 53c3-3 15-3 18 0z" fill="#7c2d12" />
        <path d="M21 53h28v1.5H21z" fill="#a16207" />
        {/* Torso & Arms */}
        <path d="M30 59.5h10l2 18.5H28z" fill="#64748b" />
        {/* Pants */}
        <path d="M28 78h12l-1 7H29z" fill="#334155" />
        {/* Legs dangling over pier */}
        <rect x="31" y="85" width="2.5" height="11" rx="0.5" fill="#475569" />
        <rect x="36" y="85" width="2.5" height="9" rx="0.5" fill="#475569" />

        {/* Fishing Rod and Line Group */}
        <g className="rod-rod">
          {/* Wooden rod stick */}
          <line x1="38" y1="64" x2="125" y2="35" stroke="#a16207" strokeWidth="1.5" strokeLinecap="round" />
          {/* Thread line */}
          <line className="line-string" x1="125" y1="35" x2="125" y2="95" stroke="#cbd5e1" strokeWidth="0.75" />
        </g>

        {/* Water Ripple Circles */}
        <ellipse className="ripple-circle-1" cx="125" cy="95" rx="12" ry="2.5" fill="none" stroke="#6366f1" />
        <ellipse className="ripple-circle-2" cx="125" cy="95" rx="12" ry="2.5" fill="none" stroke="#6366f1" />

        {/* Jumping Fish */}
        {!isSearch && (
          <g className="fish-jumping">
            <path d="M125 95c2.5-0.8 5-2.5 5-4.2s-2.5-3.3-5-4.2c-1.7 0.8-2.5 2.5-2.5 4.2s0.8 3.3 2.5 4.2z" fill="#f59e0b" />
            <path d="M122.5 90.8l-2.5-1.7v3.3z" fill="#f59e0b" />
            <circle cx="128.5" cy="92" r="0.4" fill="#fff" />
          </g>
        )}
      </svg>
      {/* Search overlay indicator */}
      {isSearch && (
        <div className="absolute right-6 bottom-9 bg-white border border-slate-200 p-1.5 rounded-xl shadow-md animate-bounce flex items-center justify-center">
          <Search className="w-4 h-4 text-indigo-650" />
        </div>
      )}
    </div>
  );
});

FishingAnimation.displayName = 'FishingAnimation';

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

  // View switcher state ('list' | 'form')
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list');

  // Items per page state
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const handleCopy = useCallback((e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 1000);
  }, []);

  const handleCancelCreate = useCallback(() => {
    setDuplicateTarget(null);
    setViewMode('list');
  }, []);
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] p-5 rounded-2xl shadow-md transition-all duration-300">
          <div className="flex items-center justify-center sm:justify-start w-full sm:w-auto select-none">
            <div className="flex items-center gap-1 sm:gap-1.5 bg-white/30 border border-white/40 p-0.5 sm:p-1 rounded-lg sm:rounded-xl shadow-xs">
              {/* Root tag */}
              <div 
                onClick={() => setViewMode('list')}
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
                  {viewMode === 'list' ? 'Daftar Permohonan' : 'Entri Baru'}
                </span>
                {viewMode === 'list' && (
                  <div className="flex items-center justify-center bg-violet-100 rounded sm:rounded-md px-1 sm:px-1.5 py-0.5 ml-0.5 sm:ml-1 border border-violet-200">
                    <span className="text-[9px] sm:text-[10px] text-violet-700 font-extrabold leading-none">{filteredList.length}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center w-full sm:w-auto">
            <div className="bg-black/10 p-1 rounded-xl border border-black/5 flex items-center gap-1 shadow-3xs w-full sm:w-auto justify-center">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3.5 py-1.5 rounded-lg text-[11px] font-extrabold transition-all duration-300 flex items-center gap-1.5 justify-center flex-1 sm:flex-none cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${viewMode === 'list'
                  ? 'bg-white text-[#2c333f] shadow-xs'
                  : 'text-[#2c333f]/75 hover:text-[#2c333f] hover:bg-white/10'
                  }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Daftar permohonan</span>
              </button>
              <button
                onClick={() => setViewMode('form')}
                className={`px-3.5 py-1.5 rounded-lg text-[11px] font-extrabold transition-all duration-300 flex items-center gap-1.5 justify-center flex-1 sm:flex-none cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${viewMode === 'form'
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
          <div className="bg-[#dde3ea] rounded-2xl shadow-sm flex flex-col overflow-hidden min-h-[300px]">

            {/* Action Row: Search and quick add */}
            <div className="p-5 border-b border-gray-200/60 flex items-center justify-end">
              <div className="flex flex-row items-center gap-2.5 w-full md:w-auto">
                {/* Search input — Fitur 1: Keyboard Shortcut Ctrl+K / '/' */}
                <div className={`relative flex-1 sm:flex-none sm:w-72 p-[1.5px] rounded-lg transition-all duration-300 ${isSearchFocused
                  ? 'bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] shadow-xs'
                  : 'bg-slate-200/90'
                  }`}>
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className="w-full pl-8.5 pr-16 py-1.5 bg-white border-transparent rounded-[7px] text-xs font-semibold text-gray-755 placeholder-gray-400 focus:outline-none transition-all"
                    placeholder="Cari No. Pelayanan, NOP, Nama."
                  />
                  {/* Keyboard hint badge */}
                  {!isSearchFocused && !searchQuery && (
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/80 select-none pointer-events-none">
                      Ctrl+K
                    </span>
                  )}
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-655 z-10">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter + Refresh button group */}
                <div className="flex items-center gap-1.5">

                  {/* Filter Jenis Layanan (Icon Popover) */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                      className={`relative p-2 rounded-xl border transition-all duration-200 flex items-center gap-1.5 cursor-pointer text-xs font-bold ${filterJenisLayanan !== 'ALL'
                        ? 'bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] text-[#2c333f] border-transparent shadow-sm scale-105'
                        : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 text-slate-500 shadow-3xs'
                        }`}
                      title="Filter Jenis Layanan"
                    >
                      <ListFilter className="w-4 h-4" />
                      {filterJenisLayanan !== 'ALL' && (
                        <span className="absolute -top-1.5 -right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
                      )}
                    </button>

                    {isFilterDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setIsFilterDropdownOpen(false)}
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
                                className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${isSelected ? 'text-indigo-650 bg-indigo-50/30 font-bold' : ''}`}
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
                    onClick={() => fetchData(true)}
                    disabled={isRefreshing || listLoading}
                    className="p-2 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-500 shadow-3xs transition-all cursor-pointer disabled:opacity-40"
                    title="Refresh Data"
                  >
                    <RefreshCw className={`w-4 h-4 transition-all duration-300 ${isRefreshing ? 'animate-spin text-indigo-500' : ''}`} />
                  </button>

                </div>
              </div>
            </div>

            {/* Filtering Chips */}
            <div className="px-5 py-3 flex items-center gap-2 overflow-x-auto scrollbar-none bg-[#dde3ea] shrink-0">
              {['ALL', 'SUBMITTED', 'FAVORITE', 'REVISION', 'BUNDLED', 'ARCHIVED', 'COMPLETED', 'REJECTED'].map((st) => {
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
                    {st !== 'ALL' && (
                      <span className={`w-1.5 h-1.5 rounded-full ${getStatusDotColor(st)}`} />
                    )}
                    <span>{st === 'ALL' ? 'Semua' : st.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-extrabold ${isActive ? 'bg-[#2c333f]/10 text-[#2c333f]' : 'bg-slate-100 text-slate-500'
                      }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
            {/* Table wrapper with padding */}
            <div className="px-5 pt-5 pb-5 bg-[#dde3ea] flex-1 flex flex-col gap-4">
              <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white shadow-3xs flex flex-col">
                <div className="overflow-x-auto scrollbar-thin">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] font-extrabold text-slate-600 capitalize tracking-wider text-left border-b border-slate-200">
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
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {listLoading ? (
                        <tr>
                          <td colSpan={10} className="py-16 text-center">
                            <span className="inline-block w-6 h-6 rounded-full border-2 border-indigo-600/30 border-t-indigo-600 animate-spin" />
                          </td>
                        </tr>
                      ) : filteredList.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="py-20 px-5 text-center bg-white">
                            <div className="flex flex-col items-center justify-center gap-4 max-w-md mx-auto select-none animate-fadeIn">
                              <FishingAnimation isSearch={!!(searchQuery || filterStatus !== 'ALL' || filterJenisLayanan !== 'ALL')} />
                              <div className="flex flex-col gap-1">
                                <h5 className="text-[11px] font-extrabold text-slate-700 capitalize tracking-wider">
                                  {searchQuery || filterStatus !== 'ALL' || filterJenisLayanan !== 'ALL'
                                    ? 'Hasil Pencarian Tidak Ditemukan'
                                    : 'Belum Ada Permohonan'}
                                </h5>
                                <p className="text-[10px] font-semibold text-slate-400 leading-relaxed px-4">
                                  {searchQuery || filterStatus !== 'ALL' || filterJenisLayanan !== 'ALL'
                                    ? 'Kami tidak menemukan data yang cocok dengan kriteria Anda. Silakan atur ulang kata kunci atau filter.'
                                    : 'Daftar permohonan Anda kosong. Silakan buat permohonan baru untuk menambahkan data ke dalam sistem.'}
                                </p>
                              </div>
                              {searchQuery || filterStatus !== 'ALL' || filterJenisLayanan !== 'ALL' ? (
                                <button
                                  onClick={() => {
                                    setSearchQuery('');
                                    setFilterStatus('ALL');
                                    setFilterJenisLayanan('ALL');
                                  }}
                                  className="mt-1 px-4.5 py-2 border border-slate-200/80 hover:bg-slate-50 text-slate-600 font-extrabold text-[10px] rounded-xl transition-all cursor-pointer shadow-3xs"
                                >
                                  Reset Pencarian
                                </button>
                              ) : (
                                <button
                                  onClick={() => setViewMode('form')}
                                  className="mt-1 bg-gradient-to-br from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] hover:opacity-90 text-[#2c333f] font-extrabold text-[10px] py-2 px-4.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" /> Buat Permohonan Baru
                                </button>
                              )}
                            </div>
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
                              className={`transition-colors duration-150 cursor-pointer group relative ${item.status === 'REVISION'
                                ? 'border-l-2 border-l-amber-400 bg-amber-50/30 hover:bg-amber-50/60'
                                : 'hover:bg-slate-50'
                                }`}
                            >
                              <td className="py-4 px-5 text-center text-xs font-bold text-slate-500 font-mono">
                                {itemNumber}
                              </td>
                              <td className="py-4 px-2 text-center" onClick={(e) => {
                                e.stopPropagation();
                                handleToggleFavorite(item.id);
                              }}>
                                <button
                                  type="button"
                                  className="p-1 hover:scale-125 active:scale-75 transition-all duration-200 text-slate-300 hover:text-amber-500 cursor-pointer"
                                  title={item.isFavorite ? "Hapus dari Favorit" : "Tandai Favorit"}
                                >
                                  <Star className={`w-4 h-4 transition-all duration-200 ${item.isFavorite
                                    ? 'text-amber-500 fill-amber-500 drop-shadow-[0_0_6px_rgba(245,158,11,0.55)]'
                                    : 'text-slate-300'
                                    }`} />
                                </button>
                              </td>
                              <td className="py-4 px-5 text-xs font-semibold text-slate-500 whitespace-nowrap">
                                {item.tanggalNoPelayanan
                                  ? new Date(item.tanggalNoPelayanan).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                                  : "-"}
                              </td>
                              {/* Fitur 3: Highlight merah jika tanggal penyelesaian sudah lewat */}
                              <td className="py-4 px-5 whitespace-nowrap">
                                {item.tanggalPenyelesaian ? (
                                  <div className="flex items-center gap-1">
                                    {isOverdue(item.tanggalPenyelesaian, item.status) && (
                                      <AlertTriangle className="w-3 h-3 text-red-500 shrink-0" />
                                    )}
                                    <span className={`text-xs font-semibold ${isOverdue(item.tanggalPenyelesaian, item.status)
                                      ? 'text-red-600 font-bold'
                                      : 'text-slate-500'
                                      }`}>
                                      {new Date(item.tanggalPenyelesaian).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                  </div>
                                ) : "-"}
                              </td>
                              <td className="py-4 px-5 min-w-[140px] group/cell relative">
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
                              <td className="py-4 px-5 min-w-[140px] group/cell relative">
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
                              <td className="py-4 px-5 group/cell relative">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold text-slate-700 whitespace-nowrap uppercase">
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
                              <td className="py-4 px-5">
                                <span
                                  className="text-[9px] font-bold text-slate-500 bg-slate-100 border border-slate-205 px-2.5 py-0.5 rounded capitalize font-sans tracking-wide"
                                  title={item.jenisPermohonan.replace(/_/g, ' ')}
                                >
                                  {getAbbreviatedJenis(item.jenisPermohonan)}
                                </span>
                              </td>
                              {/* Fitur 2: Tooltip catatan revisi untuk status REVISION */}
                              <td className="py-4 px-5 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <span className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${getStatusBadgeClass(item.status)}`}>
                                    {toTitleCase(item.status).toUpperCase()}
                                  </span>
                                  {item.status === 'REVISION' && item.permintaanKoreksi?.[0]?.catatanPengaju && (
                                    <div className="relative group/tooltip">
                                      <MessageSquare className="w-3 h-3 text-amber-500 cursor-help shrink-0" />
                                      <div className="absolute bottom-full right-0 mb-1.5 w-56 bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-semibold rounded-xl px-3 py-2 shadow-lg z-50 hidden group-hover/tooltip:block leading-relaxed whitespace-normal">
                                        <p className="font-extrabold text-amber-700 mb-0.5">Catatan Revisi:</p>
                                        <p>{item.permintaanKoreksi[0].catatanPengaju}</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
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
                                  <button
                                    onClick={() => {
                                      setDuplicateTarget(item);
                                      setViewMode('form');
                                    }}
                                    disabled={loading}
                                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                                    title="Duplikat Permohonan (Salin ke Form Baru)"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
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

                {/* Table Footer / Pagination — Fitur 4: Items per page selector */}
                <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 select-none shrink-0">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-semibold text-gray-500 font-sans">
                      {filteredList.length > 0
                        ? `Menampilkan ${((activePage - 1) * itemsPerPage) + 1}–${Math.min(activePage * itemsPerPage, filteredList.length)} dari ${filteredList.length} permohonan`
                        : 'Tidak ada data'}
                    </span>
                    {/* Items per page */}
                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-1.5 py-0.5">
                      {[10, 20, 50].map(n => (
                        <button
                          key={n}
                          onClick={() => setItemsPerPage(n)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${itemsPerPage === n
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
                                ? 'bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] text-[#1e2022] font-extrabold shadow-sm scale-105 z-10'
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

      </div>{/* end: hide-during-skeleton wrapper */}
    </div>
  );
}


