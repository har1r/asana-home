"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Plus, Search, Edit, RefreshCw,
  AlertTriangle, X, CheckCircle, FileText, Calendar,
  Trash2, ChevronLeft, ChevronRight, ChevronDown, Check, Lock,
  FileSpreadsheet, Star, ListFilter, Copy, MessageSquare, Briefcase, ArrowRight,
  Slash, FolderOpen, Users, Clock, CheckCircle2
} from 'lucide-react';
import { useSession } from "next-auth/react";
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

/** Skeleton presisi untuk List View PenginputWorkspace (tab=my-tasks) */
export function PenginputListSkeleton() {
  return (
    <div className="w-full font-sans select-none flex flex-col gap-4 animate-fadeIn">
      {/* TIER 1: STATS KPI STRIP (8 Cards) */}
      <div className="bg-white border border-slate-200/90 rounded-md p-1.5 shadow-3xs mb-1 select-none">
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="p-2.5 px-3 flex items-center justify-between gap-2 rounded-md">
              <div className="flex flex-col gap-1.5 w-full">
                <SkeletonBox width="w-16" height="h-2.5" rounded="rounded-sm" />
                <SkeletonBox width="w-10" height="h-4" rounded="rounded-sm" />
              </div>
              <SkeletonBox width="w-7" height="h-3.5" rounded="rounded-sm" />
            </div>
          ))}
        </div>
      </div>

      {/* TIER 2: SEARCH & CONTROLS TOOLBAR */}
      <div className="p-3 border border-slate-200/90 rounded-md bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-3xs">
        <SkeletonBox width="w-full md:w-[403px]" height="h-10" rounded="rounded-lg" />
        <div className="flex items-center gap-2">
          <SkeletonBox width="w-36" height="h-10" rounded="rounded-lg" />
          <SkeletonBox width="w-44" height="h-10" rounded="rounded-lg" />
          <SkeletonBox width="w-10" height="h-10" rounded="rounded-lg" />
        </div>
      </div>

      {/* Horizontal Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <SkeletonBox key={i} width={i === 0 ? "w-16" : "w-32"} height="h-7" rounded="rounded-md" />
        ))}
      </div>

      {/* TIER 3: DATA TABLE CANVAS */}
      <div className="w-full bg-white border border-slate-200/90 rounded-md shadow-xs flex flex-col overflow-hidden min-h-[450px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200/90">
                <th className="py-3 px-4 w-12"><SkeletonText width="w-5" height="h-2.5" /></th>
                <th className="py-3 px-2 text-center w-10"><SkeletonText width="w-4" height="h-2.5" /></th>
                <th className="py-3 px-4 min-w-[130px]"><SkeletonText width="w-16" height="h-2.5" /></th>
                <th className="py-3 px-4 min-w-[110px]"><SkeletonText width="w-16" height="h-2.5" /></th>
                <th className="py-3 px-4 min-w-[160px]"><SkeletonText width="w-20" height="h-2.5" /></th>
                <th className="py-3 px-4 min-w-[210px]"><SkeletonText width="w-28" height="h-2.5" /></th>
                <th className="py-3 px-4 min-w-[150px]"><SkeletonText width="w-20" height="h-2.5" /></th>
                <th className="py-3 px-4 min-w-[150px]"><SkeletonText width="w-20" height="h-2.5" /></th>
                <th className="py-3 px-4 min-w-[200px]"><SkeletonText width="w-24" height="h-2.5" /></th>
                <th className="py-3 px-4 text-center min-w-[130px]"><SkeletonText width="w-12" height="h-2.5" /></th>
                <th className="py-3 px-4 text-center min-w-[110px]"><SkeletonText width="w-10" height="h-2.5" /></th>
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
                  <td className="py-3 px-4"><SkeletonText width="w-28" height="h-3" /></td>
                  <td className="py-3 px-4 text-center"><SkeletonBadge width="w-16" /></td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <SkeletonBox width="w-7" height="h-7" rounded="rounded-lg" />
                      <SkeletonBox width="w-7" height="h-7" rounded="rounded-lg" />
                    </div>
                  </td>
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

/** Skeleton presisi untuk Form Input Create View (tab=my-tasks&view=create) */
export function PenginputCreateSkeleton() {
  return (
    <div className="w-full bg-white rounded-lg border border-slate-200/90 shadow-xs flex flex-col overflow-hidden animate-fadeIn select-none">
      {/* Top Header Bar */}
      <div className="px-6 py-3.5 border-b border-slate-200/80 bg-white flex items-center justify-between">
        <SkeletonBox width="w-24" height="h-10" rounded="rounded-md" />
        <SkeletonBox width="w-32" height="h-4" rounded="rounded-full" />
      </div>

      {/* Stepper Bar */}
      <div className="border-b border-slate-200/80 bg-slate-50/80 px-6 py-3">
        <div className="flex items-center justify-between gap-2 max-w-2xl mx-auto">
          <SkeletonBox width="w-28" height="h-8" rounded="rounded-md" />
          <div className="flex-1 h-0.5 bg-slate-200" />
          <SkeletonBox width="w-32" height="h-8" rounded="rounded-md" />
          <div className="flex-1 h-0.5 bg-slate-200" />
          <SkeletonBox width="w-28" height="h-8" rounded="rounded-md" />
        </div>
      </div>

      {/* Form Content Area */}
      <div className="p-6 flex flex-col gap-6 max-w-3xl mx-auto w-full">
        <div className="flex flex-col gap-4 p-5 rounded-2xl bg-slate-50">
          <SkeletonText width="w-48" height="h-4" />

          {/* Form Controls Grid */}
          <div className="flex flex-col gap-4 pt-2">
            <div className="flex flex-col gap-2">
              <SkeletonText width="w-36" height="h-3" />
              <SkeletonBox width="w-full" height="h-10" rounded="rounded-xl" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <SkeletonText width="w-28" height="h-3" />
                <SkeletonBox width="w-full" height="h-10" rounded="rounded-xl" />
              </div>
              <div className="flex flex-col gap-2">
                <SkeletonText width="w-32" height="h-3" />
                <SkeletonBox width="w-full" height="h-10" rounded="rounded-xl" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <SkeletonText width="w-36" height="h-3" />
                <SkeletonBox width="w-full" height="h-10" rounded="rounded-xl" />
              </div>
              <div className="flex flex-col gap-2">
                <SkeletonText width="w-24" height="h-3" />
                <SkeletonBox width="w-full" height="h-10" rounded="rounded-xl" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <SkeletonText width="w-32" height="h-3" />
              <SkeletonBox width="w-full" height="h-10" rounded="rounded-xl" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <SkeletonBox width="w-20" height="h-10" rounded="rounded-md" />
          <SkeletonBox width="w-28" height="h-10" rounded="rounded-md" />
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

const cleanPecahanSuffix = (name?: string | null): string => {
  if (!name) return '';
  return name
    .replace(/\s*\(Pecahan\s*\d+\)/gi, '')
    .replace(/\s*Pecahan\s*\d+/gi, '')
    .trim();
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
      return 'bg-amber-50 text-amber-700 border-amber-200/80';
    case 'REVISION':
      return 'bg-rose-50 text-rose-700 border-rose-200/80';
    case 'BUNDLED':
      return 'bg-blue-50 text-blue-700 border-blue-200/80';
    case 'ARCHIVED':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200/80';
    case 'COMPLETED':
      return 'bg-[#e6f6f4] text-[#008f78] border-[#00a389]/30';
    case 'REJECTED':
      return 'bg-rose-50 text-rose-700 border-rose-200/80';
    case 'DRAFT':
      return 'bg-slate-100 text-slate-700 border-slate-200/80';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200/80';
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
  const { data: session } = useSession();
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

  // Display Mode Switcher State ('berkas' | 'pemohon')
  const [displayMode, setDisplayMode] = useState<'berkas' | 'pemohon'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('architax_table_display_mode');
      if (saved === 'berkas' || saved === 'pemohon') return saved;
    }
    return 'berkas';
  });

  const handleSwitchDisplayMode = (mode: 'berkas' | 'pemohon') => {
    setDisplayMode(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('architax_table_display_mode', mode);
    }
  };

  // Full list transformed by displayMode ('berkas' vs 'pemohon') for dynamic KPI metric counts
  const modeBaseList = useMemo(() => {
    if (displayMode === 'berkas') return list;

    return list.flatMap((item) => {
      if (item.jenisPermohonan === 'MUTASI_SEBAGIAN' && item.dataBaru && item.dataBaru.length > 0) {
        return item.dataBaru.map((db: any, subIdx: number) => ({
          ...item,
          displayNamaWajibPajak: cleanPecahanSuffix(db.namaPemilikBaru || item.namaWajibPajak),
          isPecahanRow: true,
        }));
      }
      return [item];
    });
  }, [list, displayMode]);

  // Search filter
  const filteredList = useMemo(() => {
    return list.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.namaWajibPajak.toLowerCase().includes(q) ||
        item.nop.includes(q) ||
        (item.nomorPelayanan && item.nomorPelayanan.includes(q)) ||
        (item.dataBaru && item.dataBaru.some((db: any) => db.namaPemilikBaru?.toLowerCase().includes(q)));

      const matchesStatus =
        filterStatus === 'ALL'
          ? true
          : filterStatus === 'FAVORITE'
            ? item.isFavorite
            : filterStatus === 'OVERDUE'
              ? isOverdue(item.tanggalPenyelesaian, item.status)
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

  // Memoized counts per jenisPermohonan for horizontal filter pills
  const jenisCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: modeBaseList.length,
      MUTASI_SEBAGIAN: 0,
      MUTASI_HABIS_UPDATE: 0,
      MUTASI_HABIS_REGULER: 0,
      OBJEK_PAJAK_BARU: 0,
      PEMBETULAN: 0,
      PENGAKTIFAN: 0,
    };

    modeBaseList.forEach((item) => {
      if (item.jenisPermohonan && counts[item.jenisPermohonan] !== undefined) {
        counts[item.jenisPermohonan]++;
      }
    });

    return counts;
  }, [modeBaseList]);

  // Transform list according to displayMode ('berkas' vs 'pemohon')
  const displayList = useMemo(() => {
    if (displayMode === 'berkas') {
      return filteredList.map(item => ({
        ...item,
        uniqueRowKey: item.id,
        displayNamaWajibPajak: cleanPecahanSuffix(item.namaWajibPajak),
        displayLuasTanahBaru: item.luasTanahBaru,
        displayLuasBangunanBaru: item.luasBangunanBaru,
        isPecahanRow: false,
      }));
    }

    // Mode 'pemohon': Flatten MUTASI_SEBAGIAN permohonan that have dataBaru
    return filteredList.flatMap((item) => {
      if (item.jenisPermohonan === 'MUTASI_SEBAGIAN' && item.dataBaru && item.dataBaru.length > 0) {
        return item.dataBaru.map((db: any, subIdx: number) => ({
          ...item,
          uniqueRowKey: `${item.id}_pecahan_${subIdx}`,
          displayNamaWajibPajak: cleanPecahanSuffix(db.namaPemilikBaru || item.namaWajibPajak),
          displayLuasTanahBaru: db.luasTanahBaru ?? item.luasTanahBaru,
          displayLuasBangunanBaru: db.luasBangunanBaru ?? item.luasBangunanBaru,
          displaySertifikatBaru: db.sertifikatBaru ?? item.sertifikatBaru,
          pecahanIndex: subIdx + 1,
          totalPecahan: item.dataBaru.length,
          isPecahanRow: true,
        }));
      }

      return [{
        ...item,
        uniqueRowKey: item.id,
        displayNamaWajibPajak: cleanPecahanSuffix(item.namaWajibPajak),
        displayLuasTanahBaru: item.luasTanahBaru,
        displayLuasBangunanBaru: item.luasBangunanBaru,
        isPecahanRow: false,
      }];
    });
  }, [filteredList, displayMode]);

  // Pagination logic
  const totalPages = Math.ceil(displayList.length / itemsPerPage);
  const activePage = currentPage > totalPages ? 1 : currentPage;

  const paginatedList = useMemo(() => {
    return displayList.slice(
      (activePage - 1) * itemsPerPage,
      activePage * itemsPerPage
    );
  }, [displayList, activePage, itemsPerPage]);

  return (
    <div id="penginput-board-root" className="w-full font-sans select-none animate-fadeIn flex flex-col gap-6">

      {/* Show precision skeleton based on viewMode (list vs form) when loading */}
      {listLoading && viewMode === 'list' && <PenginputListSkeleton />}
      {listLoading && viewMode === 'form' && <PenginputCreateSkeleton />}

      {/* Hide content while skeleton is showing on first load */}
      <div className={`flex flex-col gap-6 ${listLoading ? 'hidden' : ''}`}>


        {/* ==================== VIEW MODE: LIST (2-Column Split Panel) ==================== */}
        {viewMode === 'list' && (
          <div className="flex flex-col gap-4">

            {/* TIER 1: STATS KPI STRIP (Clean Neutral Slate Styling) */}
            <div className="bg-white border border-slate-200/90 rounded-md p-1.5 shadow-3xs mb-1 select-none">
              <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                {/* 1. Total Berkas / Pemohon */}
                <div
                  onClick={() => { setFilterStatus('ALL'); setCurrentPage(1); }}
                  className={`p-2.5 px-3 flex items-center justify-between transition-all cursor-pointer rounded-md ${filterStatus === 'ALL'
                    ? 'bg-slate-100/90 text-slate-900 font-bold'
                    : 'hover:bg-slate-50 text-slate-600'
                    }`}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-bold text-slate-500 capitalize truncate">
                      {displayMode === 'pemohon' ? 'Total Pemohon' : 'Total Nopel'}
                    </span>
                    <span className="text-lg font-black font-mono text-slate-900">{modeBaseList.length}</span>
                  </div>
                  <span className={`text-[10px] font-black font-mono px-1.5 py-0.5 rounded border transition-all ${filterStatus === 'ALL'
                    ? 'bg-[#00a389] text-white border-[#00a389]'
                    : 'bg-slate-100 text-slate-500 border-slate-200/80'
                    }`}>
                    100%
                  </span>
                </div>

                {/* 2. Diajukan */}
                <div
                  onClick={() => { setFilterStatus('SUBMITTED'); setCurrentPage(1); }}
                  className={`p-2.5 px-3 flex items-center justify-between transition-all cursor-pointer rounded-md ${filterStatus === 'SUBMITTED'
                    ? 'bg-slate-100/90 text-slate-900 font-bold'
                    : 'hover:bg-slate-50 text-slate-600'
                    }`}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-bold text-slate-500 capitalize">Diajukan</span>
                    <span className="text-lg font-black font-mono text-slate-900">
                      {modeBaseList.filter(i => i.status === 'SUBMITTED' || i.status === 'DRAFT').length}
                    </span>
                  </div>
                  <span className={`text-[10px] font-black font-mono px-1.5 py-0.5 rounded border transition-all ${filterStatus === 'SUBMITTED'
                    ? 'bg-[#00a389] text-white border-[#00a389]'
                    : 'bg-slate-100 text-slate-500 border-slate-200/80'
                    }`}>
                    {modeBaseList.length > 0 ? `${((modeBaseList.filter(i => i.status === 'SUBMITTED' || i.status === 'DRAFT').length / modeBaseList.length) * 100).toFixed(0)}%` : '0%'}
                  </span>
                </div>

                {/* 3. Revisi */}
                <div
                  onClick={() => { setFilterStatus('REVISION'); setCurrentPage(1); }}
                  className={`p-2.5 px-3 flex items-center justify-between transition-all cursor-pointer rounded-md ${filterStatus === 'REVISION'
                    ? 'bg-slate-100/90 text-slate-900 font-bold'
                    : 'hover:bg-slate-50 text-slate-600'
                    }`}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-bold text-slate-500 capitalize">Revisi</span>
                    <span className="text-lg font-black font-mono text-slate-900">
                      {modeBaseList.filter(i => i.status === 'REVISION').length}
                    </span>
                  </div>
                  <span className={`text-[10px] font-black font-mono px-1.5 py-0.5 rounded border transition-all ${filterStatus === 'REVISION'
                    ? 'bg-[#00a389] text-white border-[#00a389]'
                    : 'bg-slate-100 text-slate-500 border-slate-200/80'
                    }`}>
                    {modeBaseList.length > 0 ? `${((modeBaseList.filter(i => i.status === 'REVISION').length / modeBaseList.length) * 100).toFixed(0)}%` : '0%'}
                  </span>
                </div>

                {/* 4. Terbundel */}
                <div
                  onClick={() => { setFilterStatus('BUNDLED'); setCurrentPage(1); }}
                  className={`p-2.5 px-3 flex items-center justify-between transition-all cursor-pointer rounded-md ${filterStatus === 'BUNDLED'
                    ? 'bg-slate-100/90 text-slate-900 font-bold'
                    : 'hover:bg-slate-50 text-slate-600'
                    }`}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-bold text-slate-500 capitalize">Terbundel</span>
                    <span className="text-lg font-black font-mono text-slate-900">
                      {modeBaseList.filter(i => i.status === 'BUNDLED').length}
                    </span>
                  </div>
                  <span className={`text-[10px] font-black font-mono px-1.5 py-0.5 rounded border transition-all ${filterStatus === 'BUNDLED'
                    ? 'bg-[#00a389] text-white border-[#00a389]'
                    : 'bg-slate-100 text-slate-500 border-slate-200/80'
                    }`}>
                    {modeBaseList.length > 0 ? `${((modeBaseList.filter(i => i.status === 'BUNDLED').length / modeBaseList.length) * 100).toFixed(0)}%` : '0%'}
                  </span>
                </div>

                {/* 5. Diarsipkan */}
                <div
                  onClick={() => { setFilterStatus('ARCHIVED'); setCurrentPage(1); }}
                  className={`p-2.5 px-3 flex items-center justify-between transition-all cursor-pointer rounded-md ${filterStatus === 'ARCHIVED'
                    ? 'bg-slate-100/90 text-slate-900 font-bold'
                    : 'hover:bg-slate-50 text-slate-600'
                    }`}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-bold text-slate-500 capitalize">Diarsipkan</span>
                    <span className="text-lg font-black font-mono text-slate-900">
                      {modeBaseList.filter(i => i.status === 'ARCHIVED').length}
                    </span>
                  </div>
                  <span className={`text-[10px] font-black font-mono px-1.5 py-0.5 rounded border transition-all ${filterStatus === 'ARCHIVED'
                    ? 'bg-[#00a389] text-white border-[#00a389]'
                    : 'bg-slate-100 text-slate-500 border-slate-200/80'
                    }`}>
                    {modeBaseList.length > 0 ? `${((modeBaseList.filter(i => i.status === 'ARCHIVED').length / modeBaseList.length) * 100).toFixed(0)}%` : '0%'}
                  </span>
                </div>

                {/* 6. Selesai */}
                <div
                  onClick={() => { setFilterStatus('COMPLETED'); setCurrentPage(1); }}
                  className={`p-2.5 px-3 flex items-center justify-between transition-all cursor-pointer rounded-md ${filterStatus === 'COMPLETED'
                    ? 'bg-slate-100/90 text-slate-900 font-bold'
                    : 'hover:bg-slate-50 text-slate-600'
                    }`}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-bold text-slate-500 capitalize">Selesai</span>
                    <span className="text-lg font-black font-mono text-slate-900">
                      {modeBaseList.filter(i => i.status === 'COMPLETED').length}
                    </span>
                  </div>
                  <span className={`text-[10px] font-black font-mono px-1.5 py-0.5 rounded border transition-all ${filterStatus === 'COMPLETED'
                    ? 'bg-[#00a389] text-white border-[#00a389]'
                    : 'bg-slate-100 text-slate-500 border-slate-200/80'
                    }`}>
                    {modeBaseList.length > 0 ? `${((modeBaseList.filter(i => i.status === 'COMPLETED').length / modeBaseList.length) * 100).toFixed(0)}%` : '0%'}
                  </span>
                </div>

                {/* 7. Ditolak */}
                <div
                  onClick={() => { setFilterStatus('REJECTED'); setCurrentPage(1); }}
                  className={`p-2.5 px-3 flex items-center justify-between transition-all cursor-pointer rounded-md ${filterStatus === 'REJECTED'
                    ? 'bg-slate-100/90 text-slate-900 font-bold'
                    : 'hover:bg-slate-50 text-slate-600'
                    }`}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-bold text-slate-500 capitalize">Ditolak</span>
                    <span className="text-lg font-black font-mono text-slate-900">
                      {modeBaseList.filter(i => i.status === 'REJECTED').length}
                    </span>
                  </div>
                  <span className={`text-[10px] font-black font-mono px-1.5 py-0.5 rounded border transition-all ${filterStatus === 'REJECTED'
                    ? 'bg-[#00a389] text-white border-[#00a389]'
                    : 'bg-slate-100 text-slate-500 border-slate-200/80'
                    }`}>
                    {modeBaseList.length > 0 ? `${((modeBaseList.filter(i => i.status === 'REJECTED').length / modeBaseList.length) * 100).toFixed(0)}%` : '0%'}
                  </span>
                </div>
              </div>
            </div>

            {/* TIER 2: UNIFIED COMMAND BAR & QUICK FILTER CHIPS */}
            <div className="flex flex-col gap-2.5 bg-slate-50/90 border border-slate-200/80 p-3 rounded-md shadow-3xs mb-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Left Side: Search Bar */}
                <div className="relative w-full md:w-96">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className="w-full h-10 pl-9 pr-9 bg-white border border-slate-200/90 rounded-md text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 transition-all shadow-3xs"
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

                {/* Right Side: Mode Switcher + Action Buttons */}
                <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                  {/* Mode Switcher */}
                  <div className="bg-slate-200/70 p-1 rounded-md flex items-center gap-1 border border-slate-300/60 text-xs font-extrabold select-none h-10">
                    <button
                      onClick={() => handleSwitchDisplayMode('berkas')}
                      className={`h-8 px-3 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${displayMode === 'berkas'
                        ? 'bg-white text-slate-900 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                        }`}
                      title="Tampilkan 1 baris per Nomor Pelayanan (NOPEL)"
                    >
                      <span>Nopel</span>
                    </button>
                    <button
                      onClick={() => handleSwitchDisplayMode('pemohon')}
                      className={`h-8 px-3 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${displayMode === 'pemohon'
                        ? 'bg-white text-slate-900 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                        }`}
                      title="Tampilkan rincian pecahan pemilik baru (Mutasi Sebagian)"
                    >
                      <span>Pemohon</span>
                    </button>
                  </div>

                  <button
                    onClick={() => switchViewMode('form')}
                    className="h-10 px-4 rounded-md bg-[#00a389] hover:bg-[#008f78] active:scale-95 text-white font-extrabold text-xs shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Tambah</span>
                  </button>

                  <button
                    onClick={() => fetchData(true)}
                    disabled={isRefreshing || listLoading}
                    className="h-10 w-10 rounded-md border border-slate-200/90 bg-white hover:bg-slate-100 text-slate-500 transition-all cursor-pointer disabled:opacity-40 shadow-3xs flex items-center justify-center shrink-0"
                    title="Refresh Data"
                  >
                    <RefreshCw className={`w-4 h-4 transition-all duration-300 ${isRefreshing ? 'animate-spin text-[#00a389]' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Quick Filter Chips (Pilih Jenis Layanan Praktis dengan Angka Count) */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1 border-t border-slate-200/60 select-none">
                {[
                  { id: 'ALL', label: 'Semua' },
                  { id: 'MUTASI_SEBAGIAN', label: 'Mutasi Sebagian' },
                  { id: 'MUTASI_HABIS_UPDATE', label: 'Mutasi Habis (Update)' },
                  { id: 'MUTASI_HABIS_REGULER', label: 'Mutasi Habis (Reguler)' },
                  { id: 'OBJEK_PAJAK_BARU', label: 'OP Baru' },
                  { id: 'PEMBETULAN', label: 'Pembetulan' },
                  { id: 'PENGAKTIFAN', label: 'Pengaktifan' }
                ].map((chip) => {
                  const isActive = filterJenisLayanan === chip.id;
                  const count = jenisCounts[chip.id] ?? 0;
                  return (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => {
                        setFilterJenisLayanan(chip.id);
                        setCurrentPage(1);
                      }}
                      className={`h-7 px-2.5 rounded-md text-[11px] font-bold transition-all cursor-pointer shrink-0 border flex items-center gap-1.5 ${isActive
                        ? 'bg-[#00a389] text-white border-[#00a389] shadow-3xs'
                        : 'bg-white text-slate-600 border-slate-200/90 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                    >
                      <span>{chip.label}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold font-mono ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* TIER 3: DATA CANVAS & ENTERPRISE TABLE */}
            <div className="w-full bg-white border border-slate-200/90 rounded-md shadow-xs flex flex-col overflow-hidden min-h-[500px]">

              {/* Table wrapper full-width without padding */}
              <div className="p-0 flex-1 flex flex-col">
                <div className="overflow-hidden bg-transparent flex flex-col flex-1 justify-between">
                  <div className="overflow-x-auto scrollbar-thin flex-1 flex flex-col">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/90 text-[11px] font-bold text-slate-400 capitalize tracking-wider text-left border-b border-slate-200/90 select-none font-sans">
                          <th className="py-3 px-4 text-center w-12 min-w-[48px]">No</th>
                          <th className="py-3 px-2 text-center select-none w-10 min-w-[40px]">⭐</th>

                          {/* Clean Standard Table Headers */}
                          <th className="py-3 px-4 min-w-[110px]">Tgl. Input</th>
                          <th className="py-3 px-4 min-w-[140px]">Petugas Input</th>
                          <th className="py-3 px-4 min-w-[130px]">Tgl. Nopel</th>
                          <th className="py-3 px-4 min-w-[110px]">Tgl. Selesai</th>
                          <th className="py-3 px-4 min-w-[160px]">No. Pelayanan</th>
                          <th className="py-3 px-4 min-w-[210px] whitespace-nowrap">Nomor Objek Pajak</th>
                          <th className="py-3 px-4 min-w-[150px]">Nama Pemohon</th>
                          <th className="py-3 px-4 min-w-[130px]">Jenis Layanan</th>
                          <th className="py-3 px-4 text-center min-w-[130px]">Status</th>
                          <th className="py-3 px-4 text-center min-w-[110px]">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[11px] font-bold font-sans">
                        {paginatedList.length === 0 ? (
                          <tr>
                            <td colSpan={12} className="py-10 text-center select-none font-sans">
                              <div className="flex flex-col items-center justify-center mx-auto font-sans">
                                <EmptyDataAnimation />
                                <p className="text-[11px] font-bold text-slate-700 mt-1 font-sans">
                                  {searchQuery ? 'Tidak ada permohonan yang sesuai' : 'Belum ada data permohonan'}
                                </p>
                                <p className="text-[11px] text-slate-400 font-bold max-w-sm mx-auto mt-1 font-sans">
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
                                key={item.uniqueRowKey || item.id}
                                onClick={() => setSelectedRequest(item)}
                                className={`hover:bg-slate-50/90 transition-colors group cursor-pointer h-11 ${item.isPecahanRow ? 'border-l-3 border-l-emerald-500 bg-emerald-50/20' : ''
                                  }`}
                              >
                                <td className="py-2.5 px-4 text-center font-bold text-slate-400 font-sans text-[11px]">
                                  {globalIndex}
                                </td>
                                <td className="py-2.5 px-2 text-center">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleFavorite(item.id);
                                    }}
                                    className="p-1 text-slate-300 hover:text-amber-500 transition-colors cursor-pointer"
                                    title={isFavorite ? "Hapus dari Favorit" : "Tambah ke Favorit"}
                                  >
                                    <Star className={`w-4 h-4 ${isFavorite ? 'text-amber-500 fill-amber-500' : ''}`} />
                                  </button>
                                </td>
                                <td className="py-2.5 px-4 text-slate-600 font-sans text-[11px] font-bold whitespace-nowrap capitalize">
                                  {item.createdAt ? new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                </td>
                                <td className="py-2.5 px-4 text-slate-700 text-[11px] font-bold font-sans whitespace-nowrap">
                                  <div className="flex items-center gap-1.5 min-w-0" title={item.penginput?.name || session?.user?.name || "Petugas Input"}>
                                    <span className="truncate max-w-[130px] capitalize font-sans">{item.penginput?.name || session?.user?.name || "Petugas Input"}</span>
                                  </div>
                                </td>
                                <td className="py-2.5 px-4 text-slate-600 font-sans text-[11px] font-bold whitespace-nowrap capitalize">
                                  {new Date(item.tanggalPermohonan || item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </td>
                                <td className="py-2.5 px-4 whitespace-nowrap font-sans">
                                  {item.tanggalPenyelesaian ? (
                                    <div className="flex items-center gap-1.5">
                                      <span className={`text-[11px] font-sans font-bold capitalize px-2 py-0.5 rounded ${isOverdue(item.tanggalPenyelesaian, item.status)
                                        ? 'bg-rose-100 text-rose-700 border border-rose-200 animate-pulse'
                                        : 'text-slate-600'
                                        }`}>
                                        {new Date(item.tanggalPenyelesaian).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                      </span>
                                    </div>
                                  ) : "-"}
                                </td>
                                <td className="py-2.5 px-4 min-w-[140px] group/cell relative font-sans">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[11px] font-bold text-slate-700 font-sans tracking-tight">
                                      {highlightText(item.nomorPelayanan || item.nomorPermohonan, searchQuery)}
                                    </span>
                                    <button
                                      onClick={(e) => handleCopy(e, item.nomorPelayanan || item.nomorPermohonan)}
                                      className="p-1 rounded opacity-0 group-hover/cell:opacity-100 hover:bg-slate-100 text-slate-400 hover:text-[#00a389] transition-all cursor-pointer flex items-center justify-center w-5 h-5 select-none"
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
                                <td className="py-2.5 px-4 min-w-[210px] whitespace-nowrap group/cell relative font-sans">
                                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                                    <span className="text-[11px] font-bold text-slate-700 font-sans whitespace-nowrap">
                                      {highlightText(formatNop(item.nop), searchQuery)}
                                    </span>
                                    <button
                                      onClick={(e) => handleCopy(e, item.nop)}
                                      className="p-1 rounded opacity-0 group-hover/cell:opacity-100 hover:bg-slate-100 text-slate-400 hover:text-[#00a389] transition-all cursor-pointer flex items-center justify-center w-5 h-5 select-none"
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
                                <td className="py-2.5 px-4 group/cell relative font-sans">
                                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                                    <span className="text-[11px] font-bold text-slate-700 whitespace-nowrap capitalize font-sans">
                                      {highlightText(item.displayNamaWajibPajak, searchQuery)}
                                    </span>
                                    {item.isPecahanRow && (
                                      <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-1.5 py-0.2 rounded-md shrink-0 font-sans">
                                        #{item.pecahanIndex}/{item.totalPecahan}
                                      </span>
                                    )}
                                    <button
                                      onClick={(e) => handleCopy(e, item.displayNamaWajibPajak)}
                                      className="p-1 rounded opacity-0 group-hover/cell:opacity-100 hover:bg-slate-100 text-slate-400 hover:text-[#00a389] transition-all cursor-pointer flex items-center justify-center w-5 h-5 select-none"
                                      title="Salin Nama Pemohon"
                                    >
                                      {copiedText === item.displayNamaWajibPajak ? (
                                        <Check className="w-3.5 h-3.5 text-emerald-600 transition-all duration-200 transform scale-110" />
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                    </button>
                                  </div>
                                </td>
                                <td className="py-2.5 px-4 font-sans">
                                  <span
                                    className="text-[11px] font-bold text-slate-500 bg-slate-100 border border-slate-200/90 px-2 py-0.5 rounded capitalize font-sans tracking-wide"
                                    title={item.jenisPermohonan.replace(/_/g, ' ')}
                                  >
                                    {getAbbreviatedJenis(item.jenisPermohonan)}
                                  </span>
                                </td>
                                <td className="py-2.5 px-4 text-center font-sans">
                                  <div className="flex items-center justify-center gap-1">
                                    <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border capitalize font-sans ${getStatusBadgeClass(item.status)}`}>
                                      {getStatusLabel(item.status)}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-2.5 px-4 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedRequest(item);
                                      }}
                                      className="p-1.5 rounded-md text-slate-400 hover:text-[#00a389] hover:bg-[#e6f6f4] transition-colors cursor-pointer"
                                      title="Lihat Detail"
                                    >
                                      <FileText className="w-4 h-4" />
                                    </button>

                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditTarget(item);
                                      }}
                                      className="p-1.5 rounded-md text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                                      title="Edit Berkas"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>

                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setDuplicateTarget(item);
                                      }}
                                      className="p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                                      title="Duplikasi Berkas"
                                    >
                                      <Copy className="w-4 h-4" />
                                    </button>

                                    {item.status === 'REVISION' && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleResubmit(item.id);
                                        }}
                                        disabled={loading}
                                        className="p-1.5 rounded-md text-amber-600 hover:bg-amber-100/60 transition-colors cursor-pointer"
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
                  <div className="px-5 py-3.5 border-t border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 select-none shrink-0 mt-auto">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-semibold text-slate-500 font-sans">
                        {displayList.length > 0
                          ? `Menampilkan ${((activePage - 1) * itemsPerPage) + 1}–${Math.min(activePage * itemsPerPage, displayList.length)} dari ${displayList.length} ${displayMode === 'pemohon' ? 'entri pemohon' : 'permohonan'}`
                          : 'Tidak ada data'}
                      </span>
                      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-md px-1.5 py-0.5 shadow-3xs">
                        {[10, 20, 50].map(n => (
                          <button
                            key={n}
                            onClick={() => setItemsPerPage(n)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${itemsPerPage === n
                              ? 'bg-[#00a389] text-white shadow-3xs'
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
                          className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-all cursor-pointer shadow-3xs"
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
                                className={`w-7 h-7 rounded-md text-xs font-bold transition-all cursor-pointer ${activePage === page
                                  ? 'bg-[#00a389] text-white font-extrabold shadow-3xs scale-105 z-10'
                                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 shadow-3xs'
                                  }`}
                              >
                                {page}
                              </button>
                            )
                          )}
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={activePage === totalPages}
                          className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-all cursor-pointer shadow-3xs"
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


