"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Boxes, FileText, Lock, Printer,
  ArrowRight, FolderMinus, Plus, Search, AlertCircle,
  CheckCircle, Clock, X, AlertTriangle, Star,
  FileSpreadsheet, Filter, Check, ChevronLeft, ChevronRight,
  User, Hash, ListFilter, RefreshCw, Copy,
  Folder, FolderLock, Unlock, Send, Slash
} from 'lucide-react';
import {
  getSubmittedPermohonan,
  mintaRevisi,
  createBundle,
  getBundles,
  addPermohonanToBundle,
  removePermohonanFromBundle,
  lockBundle,
  getPendingKoreksiForPermohonan,
  resetEmptyBundleType
} from '@/app/actions/peneliti';
import { togglePermohonanFavorite } from '@/app/actions/penginput';
import { useDashboard } from '@/context/DashboardContext';
import { DetailsModal } from './DetailsModal';
import { ActionStatusModal } from './ActionStatusModal';
import { SkeletonBox, SkeletonText, SkeletonBadge, SkeletonProgressBar } from '@/components/skeletons/SkeletonBase';

/** Skeleton untuk PenelitiWorkspace — premium card grid layout */
export function PenelitiSkeleton() {
  return (
    <div className="w-full font-sans select-none flex flex-col gap-6 animate-fadeIn">
      {/* Header card skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#dde3ea] p-5 rounded-2xl shadow-sm">
        <SkeletonBox width="w-56" height="h-5" rounded="rounded-full" />
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1">
            <SkeletonBox width="w-28" height="h-7" rounded="rounded-lg" />
            <SkeletonBox width="w-24" height="h-7" rounded="rounded-lg" />
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

        {/* Status Pills skeleton */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBox key={i} width="w-20" height="h-6" rounded="rounded-full" />
          ))}
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

const getShortBundleNum = (bundleNum: string) => {
  const parts = bundleNum.split('/');
  if (parts.length >= 2) {
    return parts[1];
  }
  return bundleNum;
};

export default function PenelitiWorkspace() {
  const { showConfirm } = useDashboard();
  // Lists
  const [submittedList, setSubmittedList] = useState<any[]>([]);
  const [bundlesList, setBundlesList] = useState<any[]>([]);
  const [selectedBundle, setSelectedBundle] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'bundle' | 'print'>('bundle');

  // Loaders & Message States
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search & Pagination States for Submitted Queue
  const searchSubmittedInputRef = useRef<HTMLInputElement>(null);
  const [searchSubmittedQuery, setSearchSubmittedQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [filterJenisLayanan, setFilterJenisLayanan] = useState<string>('ALL');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [currentSubmittedPage, setCurrentSubmittedPage] = useState(1);
  const [itemsPerSubmittedPage, setItemsPerSubmittedPage] = useState(10);

  // Pagination States for Print Bundle Details Table
  const [currentPrintPage, setCurrentPrintPage] = useState(1);
  const [itemsPerPrintPage, setItemsPerPrintPage] = useState(10);

  // Copy to Clipboard
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const handleCopy = useCallback((e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 1000);
  }, []);

  // Selected Request details modal
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);

  // Modals / Dialogs
  const [revisionTarget, setRevisionTarget] = useState<any | null>(null);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [extractionTarget, setExtractionTarget] = useState<any | null>(null);
  const [extractionNotes, setExtractionNotes] = useState('');

  // Local verification checks for frozen state
  const [pendingKoreksiMap, setPendingKoreksiMap] = useState<Record<string, boolean>>({});

  // Star Favorite Toggle
  const handleToggleFavorite = useCallback(async (id: string) => {
    let originalList: any[] = [];
    setSubmittedList(prev => {
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
        setSubmittedList(originalList); // Revert
      }
    } catch (err) {
      setSubmittedList(originalList); // Revert
    }
  }, []);

  // Keyboard shortcut: Ctrl+K or '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      const isTyping = tag === 'input' || tag === 'textarea' || tag === 'select' || (e.target as HTMLElement).isContentEditable;
      if ((e.ctrlKey && e.key === 'k') || (e.key === '/' && !isTyping)) {
        e.preventDefault();
        searchSubmittedInputRef.current?.focus();
        searchSubmittedInputRef.current?.select();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Reset pagination when search or filters change
  useEffect(() => {
    setCurrentSubmittedPage(1);
  }, [searchSubmittedQuery, filterJenisLayanan, itemsPerSubmittedPage]);

  // Search, Filter & Pagination States for Bundles Queue
  const [searchBundleQuery, setSearchBundleQuery] = useState('');
  const [isBundleSearchFocused, setIsBundleSearchFocused] = useState(false);
  const [currentBundlePage, setCurrentBundlePage] = useState(1);
  const [itemsPerBundlePage, setItemsPerBundlePage] = useState(8);
  const [filterBundleStatus, setFilterBundleStatus] = useState<string>('ALL');
  const [filterBundleJenisLayanan, setFilterBundleJenisLayanan] = useState<string>('ALL');
  const [isBundleFilterDropdownOpen, setIsBundleFilterDropdownOpen] = useState(false);

  // Status Modal State
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusModalStatus, setStatusModalStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusModalTitle, setStatusModalTitle] = useState('');
  const [statusModalMessage, setStatusModalMessage] = useState('');

  // Reset pagination when search bundle, status filter, jenis filter, or items per page changes
  useEffect(() => {
    setCurrentBundlePage(1);
  }, [searchBundleQuery, filterBundleStatus, filterBundleJenisLayanan, itemsPerBundlePage]);

  // Reset pagination when selected bundle or items per page for print changes
  useEffect(() => {
    setCurrentPrintPage(1);
  }, [selectedBundle?.id, itemsPerPrintPage]);

  // Bundle status counts memoization
  const bundleStatusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: bundlesList.length,
      DRAFT: 0,
      LOCKED: 0,
      IN_MANIFEST: 0
    };
    bundlesList.forEach(b => {
      if (counts[b.status] !== undefined) {
        counts[b.status]++;
      }
    });
    return counts;
  }, [bundlesList]);

  // Filter Bundles Client-side
  const filteredBundlesList = useMemo(() => {
    return bundlesList.filter((b) => {
      const matchesSearch = b.nomorBundle.toLowerCase().includes(searchBundleQuery.toLowerCase()) ||
        (b.jenisPermohonan && b.jenisPermohonan.toLowerCase().includes(searchBundleQuery.toLowerCase()));
      const matchesStatus = filterBundleStatus === 'ALL' || b.status === filterBundleStatus;
      const matchesJenis = filterBundleJenisLayanan === 'ALL' || b.jenisPermohonan === filterBundleJenisLayanan;
      return matchesSearch && matchesStatus && matchesJenis;
    });
  }, [bundlesList, searchBundleQuery, filterBundleStatus, filterBundleJenisLayanan]);

  // Pagination computed variables for Bundles
  const totalBundlePages = Math.ceil(filteredBundlesList.length / itemsPerBundlePage);
  const activeBundlePage = currentBundlePage > totalBundlePages ? 1 : currentBundlePage;
  const paginatedBundlesList = useMemo(() => {
    return filteredBundlesList.slice(
      (activeBundlePage - 1) * itemsPerBundlePage,
      activeBundlePage * itemsPerBundlePage
    );
  }, [filteredBundlesList, activeBundlePage, itemsPerBundlePage]);

  // Fetch initial data
  const fetchData = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setListLoading(true);
    }
    setError('');
    try {
      const subRes = await getSubmittedPermohonan();
      const bndRes = await getBundles();

      if (subRes.success) setSubmittedList(subRes.list || []);
      if (bndRes.success) {
        setBundlesList(bndRes.list || []);

        // Re-sync currently selected bundle if any
        if (selectedBundle) {
          const updatedSelected = bndRes.list?.find(b => b.id === selectedBundle.id);
          setSelectedBundle(updatedSelected || null);
        }
      }
    } catch (err) {
      setError('Gagal memuat data dari server.');
    } finally {
      setListLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Check pending koreksi (frozen) for each application in selected bundle
  useEffect(() => {
    const permohonanList = selectedBundle?.permohonan || [];
    if (permohonanList.length === 0) return;

    const checkKoreksiStatus = async () => {
      const map: Record<string, boolean> = {};
      for (const p of permohonanList) {
        const res = await getPendingKoreksiForPermohonan(p.id);
        if (res.success && res.request) {
          map[p.id] = true;
        }
      }
      setPendingKoreksiMap(map);
    };

    checkKoreksiStatus();
  }, [selectedBundle]);  // Create Bundle Action
  const handleCreateBundle = async () => {
    setStatusModalTitle('Membuat Bundle');
    setStatusModalMessage('Sedang membuat bundle operasional baru...');
    setStatusModalStatus('loading');
    setStatusModalOpen(true);
    setLoading(true);
    try {
      const res: any = await createBundle();
      if (res.success) {
        setStatusModalTitle('Bundle Dibuat');
        setStatusModalMessage(`Bundle Baru ${res.bundle?.nomorBundle} Berhasil Dibuat!`);
        setStatusModalStatus('success');
        await fetchData();
        if (res.bundle) {
          setSelectedBundle({ ...res.bundle, permohonan: [] });
        }
      } else {
        setStatusModalTitle('Gagal Membuat Bundle');
        setStatusModalMessage(res.error || 'Gagal membuat bundle.');
        setStatusModalStatus('error');
      }
    } catch (e: any) {
      setStatusModalTitle('Terjadi Kesalahan');
      setStatusModalMessage(e.message || 'Kesalahan sistem.');
      setStatusModalStatus('error');
    } finally {
      setLoading(false);
    }
  };

  // Add Permohonan to Bundle
  const handleAddToBundle = async (permohonanId: string) => {
    if (!selectedBundle) {
      setError('Silakan pilih atau buat bundle draf terlebih dahulu di panel kanan.');
      return;
    }
    if (selectedBundle.status !== 'DRAFT') {
      setError('Permohonan hanya dapat dimasukkan ke bundle yang berstatus DRAFT.');
      return;
    }

    setStatusModalTitle('Memasukkan Berkas');
    setStatusModalMessage('Sedang menambahkan berkas permohonan ke dalam bundle...');
    setStatusModalStatus('loading');
    setStatusModalOpen(true);
    setLoading(true);

    try {
      const res: any = await addPermohonanToBundle(selectedBundle.id, permohonanId);
      if (res.success) {
        setStatusModalTitle('Berkas Ditambahkan');
        setStatusModalMessage('Permohonan berhasil ditambahkan ke dalam bundle!');
        setStatusModalStatus('success');
        await fetchData();
      } else {
        setStatusModalTitle('Gagal Menambahkan');
        setStatusModalMessage(res.error || 'Gagal menambahkan permohonan.');
        setStatusModalStatus('error');
      }
    } catch (e: any) {
      setStatusModalTitle('Terjadi Kesalahan');
      setStatusModalMessage(e.message || 'Kesalahan sistem.');
      setStatusModalStatus('error');
    } finally {
      setLoading(false);
    }
  };

  // Remove Permohonan from Bundle (Draft or Locked)
  const handleRemoveFromBundle = async (targetOverride?: any) => {
    const target = targetOverride || extractionTarget;
    if (!selectedBundle || !target) return;

    setStatusModalTitle('Mengeluarkan Berkas');
    setStatusModalMessage('Sedang mengeluarkan berkas dari bundle...');
    setStatusModalStatus('loading');
    setStatusModalOpen(true);
    setLoading(true);

    try {
      const res: any = await removePermohonanFromBundle(
        selectedBundle.id,
        target.id,
        extractionNotes
      );

      if (res.success) {
        if (res.status === 'REMOVED_IMMEDIATELY') {
          setStatusModalTitle('Berhasil Dikeluarkan');
          setStatusModalMessage('Permohonan berhasil dikeluarkan dari bundle draf!');
          setStatusModalStatus('success');
        } else if (res.status === 'PENDING_APPROVAL') {
          setStatusModalTitle('Koreksi Diajukan');
          setStatusModalMessage('Pengajuan koreksi berhasil dikirim! Menunggu keputusan persetujuan dari Supervisor.');
          setStatusModalStatus('success');
        }
        setExtractionTarget(null);
        setExtractionNotes('');
        await fetchData();
      } else {
        setStatusModalTitle('Gagal Mengeluarkan');
        setStatusModalMessage(res.error || 'Gagal mengeluarkan permohonan.');
        setStatusModalStatus('error');
      }
    } catch (e: any) {
      setStatusModalTitle('Terjadi Kesalahan');
      setStatusModalMessage(e.message || 'Kesalahan sistem.');
      setStatusModalStatus('error');
    } finally {
      setLoading(false);
    }
  };

  // Minta Revisi Action
  const handleMintaRevisi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionTarget || !revisionNotes.trim()) return;

    setStatusModalTitle('Mengirim Permintaan Revisi');
    setStatusModalMessage('Sedang mengalihkan status permohonan ke revisi...');
    setStatusModalStatus('loading');
    setStatusModalOpen(true);
    setLoading(true);

    try {
      const res: any = await mintaRevisi(revisionTarget.id, revisionNotes);
      if (res.success) {
        setStatusModalTitle('Permintaan Revisi Dikirim');
        setStatusModalMessage(`Status permohonan ${revisionTarget.nomorPermohonan} berhasil dialihkan ke REVISION. Catatan pengembalian revisi telah dikirimkan ke Penginput.`);
        setStatusModalStatus('success');
        setRevisionTarget(null);
        setRevisionNotes('');
        await fetchData();
      } else {
        setStatusModalTitle('Gagal Mengirim Revisi');
        setStatusModalMessage(res.error || 'Gagal memproses permintaan revisi.');
        setStatusModalStatus('error');
      }
    } catch (e: any) {
      setStatusModalTitle('Terjadi Kesalahan');
      setStatusModalMessage(e.message || 'Kesalahan sistem.');
      setStatusModalStatus('error');
    } finally {
      setLoading(false);
    }
  };

  // Lock Bundle Action
  const handleLockBundle = () => {
    if (!selectedBundle) return;
    showConfirm({
      title: 'Konfirmasi Kunci Bundle',
      message: `Apakah Anda yakin ingin MENGUNCI bundle ${selectedBundle.nomorBundle}? Setelah dikunci, data di dalamnya tidak dapat diubah tanpa persetujuan Supervisor.`,
      onConfirm: async () => {
        setStatusModalTitle('Mengunci Bundle');
        setStatusModalMessage('Sedang mengunci bundle dan meneruskannya ke pengarsip...');
        setStatusModalStatus('loading');
        setStatusModalOpen(true);
        setLoading(true);

        try {
          const res: any = await lockBundle(selectedBundle.id);
          if (res.success) {
            setStatusModalTitle('Bundle Terkunci');
            setStatusModalMessage(`Bundle ${selectedBundle.nomorBundle} berhasil dikunci dan dialirkan ke Pengarsip!`);
            setStatusModalStatus('success');
            await fetchData();
          } else {
            setStatusModalTitle('Gagal Mengunci');
            setStatusModalMessage(res.error || 'Gagal mengunci bundle.');
            setStatusModalStatus('error');
          }
        } catch (e: any) {
          setStatusModalTitle('Terjadi Kesalahan');
          setStatusModalMessage(e.message || 'Kesalahan sistem.');
          setStatusModalStatus('error');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Reset Empty Bundle Type Action
  const handleResetBundleType = async (bundleId: string) => {
    if (!bundleId) return;
    setStatusModalTitle('Mereset Jenis Bundle');
    setStatusModalMessage('Sedang mereset jenis layanan bundle draf...');
    setStatusModalStatus('loading');
    setStatusModalOpen(true);
    setLoading(true);
    try {
      const res = (await resetEmptyBundleType(bundleId)) as any;
      if (res.success) {
        setStatusModalTitle('Reset Berhasil');
        setStatusModalMessage(res.message || 'Jenis layanan bundle draf berhasil direset.');
        setStatusModalStatus('success');
        await fetchData();
      } else {
        setStatusModalTitle('Reset Gagal');
        setStatusModalMessage(res.error || 'Gagal mereset jenis bundle.');
        setStatusModalStatus('error');
      }
    } catch (e: any) {
      setStatusModalTitle('Terjadi Kesalahan');
      setStatusModalMessage(e.message || 'Kesalahan sistem.');
      setStatusModalStatus('error');
    } finally {
      setLoading(false);
    }
  };

  // Filter Submitted Queue Client-side
  const filteredSubmittedList = submittedList.filter((item) => {
    const matchesSearch =
      item.namaWajibPajak.toLowerCase().includes(searchSubmittedQuery.toLowerCase()) ||
      item.nop.includes(searchSubmittedQuery) ||
      (item.nomorPelayanan && item.nomorPelayanan.toLowerCase().includes(searchSubmittedQuery.toLowerCase()));

    const matchesJenis = filterJenisLayanan === 'ALL' || item.jenisPermohonan === filterJenisLayanan;

    return matchesSearch && matchesJenis;
  });

  // Pagination computed variables
  const totalSubmittedPages = Math.ceil(filteredSubmittedList.length / itemsPerSubmittedPage);
  const activeSubmittedPage = currentSubmittedPage > totalSubmittedPages ? 1 : currentSubmittedPage;
  const paginatedSubmittedList = filteredSubmittedList.slice(
    (activeSubmittedPage - 1) * itemsPerSubmittedPage,
    activeSubmittedPage * itemsPerSubmittedPage
  );

  const currentActiveCount = useMemo(() => {
    if (viewMode === 'bundle') return filteredBundlesList.length;
    if (viewMode === 'list') return filteredSubmittedList.length;
    return selectedBundle?.permohonan?.length || 0;
  }, [viewMode, filteredBundlesList.length, filteredSubmittedList.length, selectedBundle?.permohonan?.length]);

  return (
    <div id="peneliti-board-root" className="w-full font-sans select-none animate-fadeIn flex flex-col gap-6">

      {/* Show full skeleton during initial data load */}
      {listLoading && <PenelitiSkeleton />}

      {/* Hide real content while skeleton is visible */}
      <div className={`flex flex-col gap-6 ${listLoading ? 'hidden' : ''}`}>

        {/* Header with View switcher toggle — aligned with Penginput style */}
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
                  {viewMode === 'bundle' ? 'Daftar Bundle' : viewMode === 'list' ? 'Daftar Antrean' : 'Kunci & Cetak'}
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
                onClick={() => setViewMode('list')}
                className={`px-3.5 py-1.5 rounded-lg text-[11px] font-extrabold transition-all duration-300 flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${viewMode === 'list'
                  ? 'bg-white text-[#2c333f] shadow-xs'
                  : 'text-[#2c333f]/75 hover:text-[#2c333f] hover:bg-white/10'
                  }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Daftar Antrean</span>
              </button>
              <button
                onClick={() => setViewMode('print')}
                className={`px-3.5 py-1.5 rounded-lg text-[11px] font-extrabold transition-all duration-300 flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${viewMode === 'print'
                  ? 'bg-white text-[#2c333f] shadow-xs'
                  : 'text-[#2c333f]/75 hover:text-[#2c333f] hover:bg-white/10'
                  }`}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Kunci & Cetak</span>
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50/80 border border-red-200 text-red-700 text-xs font-bold rounded-xl px-4 py-3 flex items-start gap-2 animate-fadeIn shrink-0">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-emerald-50/80 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl px-4 py-3 flex items-start gap-2 animate-fadeIn shrink-0">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* ==================== VIEW MODE: LIST (Daftar Permohonan) ==================== */}
        {viewMode === 'list' && (
          <div className="bg-[#dde3ea] rounded-2xl shadow-sm flex flex-col overflow-hidden min-h-[300px]">

            {/* Action Row: Search & Filter — styled identical to Penginput */}
            <div className="p-5 border-b border-gray-200/60 flex flex-col md:flex-row md:items-center justify-end gap-4">
              <div className="flex flex-row items-center gap-2.5 w-full md:w-auto">
                <div className={`relative flex-1 sm:flex-none sm:w-72 p-[1.5px] rounded-lg transition-all duration-300 ${isSearchFocused ? 'bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] shadow-xs' : 'bg-slate-200/90'}`}>
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
                  <input
                    ref={searchSubmittedInputRef}
                    type="text"
                    value={searchSubmittedQuery}
                    onChange={(e) => setSearchSubmittedQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className="w-full pl-8.5 pr-16 py-1.5 bg-white border-transparent rounded-[7px] text-xs font-semibold text-gray-755 placeholder-gray-400 focus:outline-none transition-all"
                    placeholder="Cari No. Pelayanan, NOP, Nama."
                  />
                  {!isSearchFocused && !searchSubmittedQuery && (
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/80 select-none pointer-events-none">
                      Ctrl+K
                    </span>
                  )}
                  {searchSubmittedQuery && (
                    <button onClick={() => setSearchSubmittedQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-655 z-10">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Filter Jenis Layanan (Popover Icon) — identical to Penginput */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                      className={`relative p-2 rounded-xl border transition-all duration-200 flex items-center justify-center cursor-pointer text-xs font-bold ${filterJenisLayanan !== 'ALL'
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
                                  setCurrentSubmittedPage(1);
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

                  {/* Indicator Active Bundle with Tooltip */}
                  <div className="relative group flex shrink-0">
                    <button
                      type="button"
                      onClick={() => setViewMode('bundle')}
                      className={`w-9 h-9 rounded-xl border transition-all cursor-pointer shadow-3xs flex items-center justify-center text-xs font-black relative ${selectedBundle
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300'
                        : 'bg-amber-50 border-amber-250 text-amber-600 hover:bg-amber-100 hover:border-amber-300'
                        }`}
                    >
                      {selectedBundle ? getShortBundleNum(selectedBundle.nomorBundle) : '—'}
                    </button>

                    {/* Popover Tooltip (Keterangan Bundle) */}
                    <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-3.5 hidden group-hover:flex flex-col gap-2 z-50 pointer-events-none select-none animate-fadeIn">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-1.5">
                        <div className={`w-2 h-2 rounded-full ${selectedBundle ? 'bg-indigo-650 animate-pulse' : 'bg-amber-500 animate-pulse'}`} />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">
                          Bundle Kerja Aktif
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-bold text-slate-800">
                          {selectedBundle ? selectedBundle.nomorBundle : 'Belum Ada Bundle Aktif'}
                        </span>
                        <p className="text-[10px] font-semibold text-slate-400 leading-relaxed">
                          {selectedBundle
                            ? selectedBundle.status === 'DRAFT'
                              ? 'Siap menerima berkas. Klik tombol ➔ pada kolom Aksi tabel.'
                              : `Status bundle ${selectedBundle.status} (tidak dapat menambah berkas).`
                            : 'Pilih atau buat bundle baru terlebih dahulu di tab Daftar Bundle.'}
                        </p>
                      </div>
                    </div>
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
            {/* Table wrapper with padding — identical to Penginput */}
            <div className="px-5 pt-5 pb-5 bg-[#dde3ea] flex-1 flex flex-col gap-4">
              <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white shadow-3xs flex flex-col">
                <div className="overflow-x-auto scrollbar-thin">
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
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {filteredSubmittedList.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="py-20 px-5 text-center bg-white">
                            <div className="flex flex-col items-center justify-center gap-4 max-w-md mx-auto select-none animate-fadeIn">
                              <FishingAnimation isSearch={!!(searchSubmittedQuery || filterJenisLayanan !== 'ALL')} />
                              <div className="flex flex-col gap-1">
                                <h5 className="text-[11px] font-extrabold text-slate-700 capitalize tracking-wider">
                                  {searchSubmittedQuery || filterJenisLayanan !== 'ALL'
                                    ? 'Hasil Pencarian Tidak Ditemukan'
                                    : 'Belum Ada Permohonan'}
                                </h5>
                                <p className="text-[10px] font-semibold text-slate-400 leading-relaxed px-4">
                                  {searchSubmittedQuery || filterJenisLayanan !== 'ALL'
                                    ? 'Kami tidak menemukan data yang cocok dengan kriteria Anda. Silakan atur ulang kata kunci atau filter.'
                                    : 'Antrean permohonan masuk kosong. Saat ini tidak ada berkas yang perlu diverifikasi.'}
                                </p>
                              </div>
                              {(searchSubmittedQuery || filterJenisLayanan !== 'ALL') && (
                                <button
                                  onClick={() => {
                                    setSearchSubmittedQuery('');
                                    setFilterJenisLayanan('ALL');
                                  }}
                                  className="mt-1 px-4.5 py-2 border border-slate-200/80 hover:bg-slate-50 text-slate-600 font-extrabold text-[10px] rounded-xl transition-all cursor-pointer shadow-3xs"
                                >
                                  Reset Pencarian
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ) : (
                        paginatedSubmittedList.map((item, index) => {
                          const itemNumber = (activeSubmittedPage - 1) * itemsPerSubmittedPage + index + 1;
                          const nopolDate = item.tanggalNoPelayanan
                            ? new Date(item.tanggalNoPelayanan).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                            : '—';
                          const penyelesaianDate = item.tanggalPenyelesaian
                            ? new Date(item.tanggalPenyelesaian).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                            : '—';

                          return (
                            <tr
                              key={item.id}
                              onClick={() => setSelectedRequest(item)}
                              className="hover:bg-slate-50 transition-colors duration-150 cursor-pointer group relative text-xs font-semibold text-gray-700"
                            >
                              <td className="py-4 px-5 text-center text-xs font-bold text-slate-500 font-mono">{itemNumber}</td>
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
                              <td className="py-4 px-5 text-xs font-semibold text-slate-500 whitespace-nowrap">{nopolDate}</td>
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
                                      {penyelesaianDate}
                                    </span>
                                  </div>
                                ) : "—"}
                              </td>
                              <td className="py-4 px-5 min-w-[140px] group/cell relative">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold text-slate-700 font-mono tracking-tight">
                                    {highlightText(item.nomorPelayanan || item.nomorPermohonan, searchSubmittedQuery)}
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
                                    {highlightText(formatNop(item.nop), searchSubmittedQuery)}
                                  </span>
                                  <button
                                    onClick={(e) => handleCopy(e, item.nop)}
                                    className="p-1.5 rounded opacity-0 group-hover/cell:opacity-100 hover:bg-slate-105 text-slate-400 hover:text-indigo-655 transition-all cursor-pointer flex items-center justify-center w-5 h-5 select-none"
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
                                    {highlightText(item.namaWajibPajak.toUpperCase(), searchSubmittedQuery)}
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
                                  className="text-[9px] font-bold text-slate-500 bg-slate-100 border border-slate-205 px-2.5 py-0.5 rounded capitalize font-sans tracking-wide select-none"
                                  title={item.jenisPermohonan.replace(/_/g, ' ')}
                                >
                                  {getAbbreviatedJenis(item.jenisPermohonan)}
                                </span>
                              </td>
                              <td className="py-4 px-5 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <span className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${getStatusBadgeClass(item.status)}`}>
                                    {toTitleCase(item.status).toUpperCase()}
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-5 text-right pr-6">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAddToBundle(item.id);
                                    }}
                                    disabled={loading || !selectedBundle || selectedBundle.status !== 'DRAFT'}
                                    className="p-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg shadow-sm transition-all cursor-pointer flex items-center justify-center shrink-0"
                                    title="Masukkan ke bundle"
                                  >
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setRevisionTarget(item);
                                    }}
                                    disabled={loading}
                                    className="p-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 rounded-lg transition-all cursor-pointer flex items-center justify-center shrink-0"
                                    title="Kembalikan untuk revisi"
                                  >
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer / Pagination — identical to Penginput */}
                <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 select-none shrink-0">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-semibold text-gray-500 font-sans">
                      {filteredSubmittedList.length > 0
                        ? `Menampilkan ${((activeSubmittedPage - 1) * itemsPerSubmittedPage) + 1}–${Math.min(activeSubmittedPage * itemsPerSubmittedPage, filteredSubmittedList.length)} dari ${filteredSubmittedList.length} permohonan`
                        : 'Tidak ada data'}
                    </span>
                    {/* Items per page */}
                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-1.5 py-0.5">
                      {[10, 20, 50].map(n => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setItemsPerSubmittedPage(n)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${itemsPerSubmittedPage === n
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

                  {totalSubmittedPages > 1 && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setCurrentSubmittedPage(prev => Math.max(prev - 1, 1))}
                        disabled={activeSubmittedPage === 1}
                        className="p-1.5 rounded-lg border-transparent bg-white text-gray-500 hover:bg-[#f1f5f9] disabled:opacity-40 transition-all cursor-pointer"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      {Array.from({ length: totalSubmittedPages }, (_, i) => i + 1)
                        .filter(page => page === 1 || page === totalSubmittedPages || Math.abs(page - activeSubmittedPage) <= 1)
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
                              type="button"
                              onClick={() => setCurrentSubmittedPage(page as number)}
                              className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeSubmittedPage === page
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
                        onClick={() => setCurrentSubmittedPage(prev => Math.min(prev + 1, totalSubmittedPages))}
                        disabled={activeSubmittedPage === totalSubmittedPages}
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

        {/* ==================== VIEW MODE: BUNDLE (Buat Bundle) ==================== */}
        {viewMode === 'bundle' && (
          <div className="bg-[#dde3ea] border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6 min-h-[300px]">
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
                    {!isBundleSearchFocused && !searchBundleQuery && (
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/80 select-none pointer-events-none">
                        Ctrl+K
                      </span>
                    )}
                    {searchBundleQuery && (
                      <button onClick={() => setSearchBundleQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-655 z-10">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Filter Jenis Layanan (Popover Icon) — identical to Penginput */}
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
                      onClick={() => fetchData(true)}
                      disabled={isRefreshing || listLoading}
                      className="p-2 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-500 shadow-3xs transition-all cursor-pointer disabled:opacity-40"
                      title="Refresh Data"
                    >
                      <RefreshCw className={`w-4 h-4 transition-all duration-300 ${isRefreshing ? 'animate-spin text-indigo-500' : ''}`} />
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleCreateBundle}
                  disabled={loading}
                  className="px-4 py-2 bg-gradient-to-r from-[#7dd4fc] to-[#9cb4fe] hover:brightness-[1.03] active:scale-95 text-[#2c333f] font-bold text-xs rounded-xl border border-white/20 shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0 w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Buat</span>
                </button>
              </div>
            </div>

            {/* Filter Status Pills for Bundles */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0 select-none pb-1">
              {['ALL', 'DRAFT', 'LOCKED', 'IN_MANIFEST'].map((st) => {
                const isActive = filterBundleStatus === st;
                const count = bundleStatusCounts[st] ?? 0;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setFilterBundleStatus(st)}
                    className={`px-3.5 py-1 rounded-full text-[10px] font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer border ${isActive
                      ? 'bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] text-[#2c333f] border-transparent shadow-sm'
                      : 'bg-white text-slate-500 hover:bg-slate-50 border-gray-200/90'
                      }`}
                  >
                    {st !== 'ALL' && (
                      <span className={`w-1.5 h-1.5 rounded-full ${st === 'DRAFT' ? 'bg-[#9cb4fe]' : st === 'LOCKED' ? 'bg-slate-800' : 'bg-emerald-500'
                        }`} />
                    )}
                    <span>{st === 'ALL' ? 'Semua' : st === 'IN_MANIFEST' ? 'In Manifest' : st.charAt(0) + st.slice(1).toLowerCase()}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-extrabold ${isActive ? 'bg-[#2c333f]/10 text-[#2c333f]' : 'bg-slate-100 text-slate-500'
                      }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {paginatedBundlesList.map((b) => {
                const isSelected = selectedBundle?.id === b.id;
                const berkasCount = b.permohonan?.length || 0;

                // Get config styling based on status (fallback to DRAFT)
                const statusCfg = BUNDLE_STATUS_CONFIG[b.status] || BUNDLE_STATUS_CONFIG.DRAFT;

                // Get style config for jenisPermohonan
                const typeStyle = b.jenisPermohonan && BUNDLE_TYPE_STYLES[b.jenisPermohonan]
                  ? BUNDLE_TYPE_STYLES[b.jenisPermohonan]
                  : { bg: 'bg-slate-50', text: 'text-slate-400', border: 'border-slate-200/30' };

                // Get appropriate Lucide Folder icon or count
                const renderFolderIconOrCount = () => {
                  const iconClass = `w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110 ${isSelected ? 'text-indigo-650 font-bold' : b.status === 'LOCKED' ? 'text-slate-400' : 'text-indigo-500'}`;
                  if (berkasCount > 0) {
                    return (
                      <span className={`w-5 h-5 flex items-center justify-center text-[10px] font-black rounded-full leading-none transition-all duration-300 group-hover:scale-110 ${isSelected
                        ? 'bg-gradient-to-r from-sky-500 to-[#9cb4fe] text-white shadow-sm font-extrabold'
                        : b.status === 'LOCKED'
                          ? 'bg-slate-500 text-slate-50 font-bold'
                          : 'bg-[#9cb4fe] text-white shadow-2xs font-extrabold'
                        }`}>
                        {berkasCount}
                      </span>
                    );
                  }

                  if (b.status === 'LOCKED') return <FolderLock className={iconClass} />;
                  return <Folder className={iconClass} />;
                };

                // Get appropriate Status icon
                const renderStatusIcon = () => {
                  const iconClass = "w-2.5 h-2.5 shrink-0";
                  if (b.status === 'LOCKED') return <Lock className={iconClass} />;
                  if (b.status === 'IN_MANIFEST') return <Send className={iconClass} />;
                  return <Unlock className={iconClass} />;
                };

                return (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBundle(b)}
                    className={`p-4 rounded-2xl border flex flex-col justify-between gap-3.5 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer relative overflow-hidden group select-none min-h-[110px] ${isSelected
                      ? 'bg-gradient-to-br from-sky-50/50 via-[#9cb4fe]/5 to-white border-indigo-400 shadow-md ring-2 ring-indigo-400/20'
                      : `bg-white border-slate-200/90 hover:border-slate-350 hover:shadow-md ${statusCfg.shadow}`
                      }`}
                  >
                    {/* Top Row: Number & Count Badge */}
                    <div className="flex items-center justify-between gap-3 w-full">
                      <div className="flex items-center min-w-0 flex-1">
                        <span className="text-[10px] sm:text-xs font-black text-slate-850 font-mono tracking-tight break-all whitespace-normal block" title={b.nomorBundle}>
                          {b.nomorBundle}
                        </span>
                      </div>

                      {/* Count Badge (like homepage) */}
                      <span className="flex items-center justify-center bg-[#f25c54] text-white text-[11px] font-bold px-1.5 py-0.5 rounded-md leading-none shrink-0" title={`${berkasCount} Berkas`}>
                        {berkasCount}
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
                          {/* Status Pill Badge (moved here) */}
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold border leading-none uppercase tracking-wider flex items-center gap-1 shadow-3xs transition-all shrink-0 ${b.status === 'LOCKED'
                            ? 'bg-slate-900 text-slate-100 border-slate-800'
                            : b.status === 'IN_MANIFEST'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            }`}>
                            {renderStatusIcon()}
                            <span>{b.status.toLowerCase()}</span>
                          </span>

                          {/* Reset button inside card if empty draft bundle is locked */}
                          {b.status === 'DRAFT' && berkasCount === 0 && b.jenisPermohonan && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleResetBundleType(b.id);
                              }}
                              disabled={loading}
                              className="text-[10px] text-amber-600 hover:text-amber-800 hover:underline font-extrabold cursor-pointer shrink-0 animate-fadeIn"
                              title="Reset jenis permohonan bundle yang terkunci"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {filteredBundlesList.length === 0 && (
                <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-slate-200/60 shadow-3xs">
                  <div className="flex flex-col items-center justify-center gap-4 max-w-md mx-auto select-none animate-fadeIn">
                    <FishingAnimation isSearch={!!(searchBundleQuery || filterBundleStatus !== 'ALL')} />
                    <div className="flex flex-col gap-1">
                      <h5 className="text-[11px] font-extrabold text-slate-700 capitalize tracking-wider">
                        {searchBundleQuery || filterBundleStatus !== 'ALL'
                          ? 'Hasil Pencarian Tidak Ditemukan'
                          : 'Belum Ada Bundle'}
                      </h5>
                      <p className="text-[10px] font-semibold text-slate-400 leading-relaxed px-4">
                        {searchBundleQuery || filterBundleStatus !== 'ALL'
                          ? 'Kami tidak menemukan bundle yang cocok dengan kriteria Anda. Silakan atur ulang kata kunci atau filter.'
                          : 'Daftar bundle operasional kosong. Silakan buat bundle baru untuk memulai.'}
                      </p>
                    </div>
                    {(searchBundleQuery || filterBundleStatus !== 'ALL') && (
                      <button
                        onClick={() => {
                          setSearchBundleQuery('');
                          setFilterBundleStatus('ALL');
                        }}
                        className="mt-1 px-4.5 py-2 border border-slate-200/80 hover:bg-slate-50 text-slate-600 font-extrabold text-[10px] rounded-xl transition-all cursor-pointer shadow-3xs"
                      >
                        Reset Pencarian
                      </button>
                    )}
                  </div>
                </div>
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
                        ? 'bg-gradient-to-r from-[#7dd4fc] to-[#9cb4fe] text-[#1e2022] shadow-sm font-extrabold'
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
                    className="p-1.5 rounded-lg border-transparent bg-white text-gray-500 hover:bg-[#f1f5f9] disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  {Array.from({ length: totalBundlePages }, (_, i) => i + 1)
                    .filter(page => page === 1 || page === totalBundlePages || Math.abs(page - activeBundlePage) <= 1)
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
                          type="button"
                          key={page}
                          onClick={() => setCurrentBundlePage(page as number)}
                          className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${activeBundlePage === page
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
                    onClick={() => setCurrentBundlePage(prev => Math.min(prev + 1, totalBundlePages))}
                    disabled={activeBundlePage === totalBundlePages}
                    className="p-1.5 rounded-lg border-transparent bg-white text-gray-500 hover:bg-[#f1f5f9] disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== VIEW MODE: PRINT (Cetak Surat Pengantar) ==================== */}
        {viewMode === 'print' && (
          <div className="bg-[#dde3ea] rounded-2xl shadow-sm flex flex-col overflow-hidden min-h-[300px]">
            {selectedBundle ? (
              <div className="flex-1 flex flex-col overflow-hidden animate-fadeIn">
                {/* Header Banner - containing bundle details and action buttons */}
                <div className="px-5 py-4 border-b border-gray-200/60 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
                  {/* Title / Number (No gray label) */}
                  <div className="select-none">
                    <h3 className="font-extrabold text-[13px] capitalize tracking-wider text-slate-700 font-display flex items-center gap-2">
                      <span className="font-mono font-black text-slate-900">{selectedBundle.nomorBundle}</span>
                      <span className="bg-indigo-50 text-indigo-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full select-none">
                        {(selectedBundle.permohonan || []).length} Berkas
                      </span>
                    </h3>
                  </div>

                  {/* Actions Button Group */}
                  <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto shrink-0 select-none">
                    {/* Print button (always visible) */}
                    <a
                      href={`/api/pdf/surat-pengantar-bundle/${selectedBundle.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-extrabold text-xs rounded-xl shadow-3xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                      title="Unduh / Cetak Surat Pengantar PDF"
                    >
                      <Printer className="w-3.5 h-3.5 text-indigo-650" />
                      <span>Cetak</span>
                    </a>

                    {/* Reset Jenis button for empty draft bundles with a locked type */}
                    {selectedBundle.status === 'DRAFT' && (selectedBundle.permohonan || []).length === 0 && selectedBundle.jenisPermohonan && (
                      <button
                        onClick={() => handleResetBundleType(selectedBundle.id)}
                        disabled={loading}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 shrink-0"
                        title="Reset jenis permohonan bundle yang terkunci"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Reset Jenis</span>
                      </button>
                    )}

                    {/* Bundle Lock button */}
                    {selectedBundle.status === 'DRAFT' && (
                      <button
                        onClick={handleLockBundle}
                        disabled={loading || (selectedBundle.permohonan || []).length === 0}
                        className="px-4 py-2 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-slate-950 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Kunci</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Table — Columns matching Penginput */}
                {(() => {
                  const totalPrintPages = Math.ceil((selectedBundle.permohonan || []).length / itemsPerPrintPage);
                  const activePrintPage = currentPrintPage > totalPrintPages ? 1 : currentPrintPage;
                  const paginatedPrintList = (selectedBundle.permohonan || []).slice(
                    (activePrintPage - 1) * itemsPerPrintPage,
                    activePrintPage * itemsPerPrintPage
                  );

                  return (
                    <div className="flex-1 flex flex-col justify-between overflow-hidden">
                      <div className="px-5 pt-5 pb-5 bg-[#dde3ea] flex-1 flex flex-col gap-4 overflow-hidden">
                        <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white shadow-3xs flex flex-col justify-between flex-1">
                          <div className="overflow-x-auto scrollbar-thin flex-1">
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
                                {paginatedPrintList.length === 0 ? (
                                  <tr>
                                    <td colSpan={10} className="py-14 text-center text-slate-400 italic">
                                      Bundle masih kosong. Silakan masukkan berkas dari tab 'Daftar Antrean'.
                                    </td>
                                  </tr>
                                ) : (
                                  paginatedPrintList.map((item: any, index: number) => {
                                    const isMutasiSebagian = item.jenisPermohonan === 'MUTASI_SEBAGIAN';
                                    const isFrozen = pendingKoreksiMap[item.id] === true;
                                    const itemNumber = (activePrintPage - 1) * itemsPerPrintPage + index + 1;
                                    const nopolDate = item.tanggalNoPelayanan
                                      ? new Date(item.tanggalNoPelayanan).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                                      : '—';
                                    const penyelesaianDate = item.tanggalPenyelesaian
                                      ? new Date(item.tanggalPenyelesaian).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                                      : '—';

                                    return (
                                      <tr key={item.id} className={`hover:bg-slate-50 transition-colors duration-150 cursor-pointer group relative text-xs font-semibold text-gray-700 ${isFrozen ? 'bg-amber-50/30' : ''}`}>
                                        <td className="py-4 px-5 text-center text-xs font-bold text-slate-500 font-mono">{itemNumber}</td>
                                        <td className="py-4 px-2 text-center">
                                          <button
                                            type="button"
                                            className="p-1 cursor-default text-slate-350"
                                          >
                                            <Star className={`w-4 h-4 transition-all duration-200 ${item.isFavorite
                                              ? 'text-amber-500 fill-amber-500 drop-shadow-[0_0_6px_rgba(245,158,11,0.55)]'
                                              : 'text-slate-300'
                                              }`} />
                                          </button>
                                        </td>
                                        <td className="py-4 px-5 text-xs font-semibold text-slate-500 whitespace-nowrap">{nopolDate}</td>
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
                                                {penyelesaianDate}
                                              </span>
                                            </div>
                                          ) : "—"}
                                        </td>
                                        <td className="py-4 px-5 min-w-[140px] group/cell relative">
                                          <div className="flex items-center gap-1.5">
                                            <span className="text-xs font-bold text-slate-700 font-mono tracking-tight">
                                              {item.nomorPelayanan || item.nomorPermohonan}
                                            </span>
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleCopy(e, item.nomorPelayanan || item.nomorPermohonan);
                                              }}
                                              className="p-1 rounded opacity-0 group-hover/cell:opacity-100 hover:bg-slate-105 text-slate-400 hover:text-indigo-655 transition-all cursor-pointer flex items-center justify-center w-5 h-5 select-none"
                                              title="Salin Nomor"
                                            >
                                              {copiedText === (item.nomorPelayanan || item.nomorPermohonan) ? (
                                                <Check className="w-3.5 h-3.5 text-emerald-600 transition-all duration-200 transform scale-110" />
                                              ) : (
                                                <Copy className="w-3 h-3" />
                                              )}
                                            </button>
                                            {isFrozen && (
                                              <span className="text-[8px] font-extrabold capitalize bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 select-none animate-fadeIn">
                                                <Clock className="w-2.5 h-2.5 shrink-0 animate-pulse" />
                                                Frozen
                                              </span>
                                            )}
                                          </div>
                                        </td>
                                        <td className="py-4 px-5 min-w-[140px] group/cell relative">
                                          <div className="flex items-center gap-1.5">
                                            <span className="text-xs font-semibold text-slate-500 font-mono">
                                              {formatNop(item.nop)}
                                            </span>
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleCopy(e, item.nop);
                                              }}
                                              className="p-1.5 rounded opacity-0 group-hover/cell:opacity-100 hover:bg-slate-105 text-slate-400 hover:text-indigo-655 transition-all cursor-pointer flex items-center justify-center w-5 h-5 select-none"
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
                                              {item.namaWajibPajak.toUpperCase()}
                                            </span>
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleCopy(e, item.namaWajibPajak);
                                              }}
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
                                            className="text-[9px] font-bold text-slate-500 bg-slate-100 border border-slate-205 px-2.5 py-0.5 rounded capitalize font-sans tracking-wide select-none"
                                            title={item.jenisPermohonan.replace(/_/g, ' ')}
                                          >
                                            {getAbbreviatedJenis(item.jenisPermohonan)}
                                          </span>
                                        </td>
                                        <td className="py-4 px-5 text-center">
                                          <div className="flex items-center justify-center gap-1">
                                            <span className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${getStatusBadgeClass(item.status)}`}>
                                              {toTitleCase(item.status).toUpperCase()}
                                            </span>
                                          </div>
                                        </td>
                                        <td className="py-4 px-5 text-right pr-6">
                                          <div className="flex items-center justify-end gap-1.5">
                                            {/* Kertas Kerja PDF link for Mutasi Sebagian */}
                                            {isMutasiSebagian && (
                                              <a
                                                href={`/api/pdf/kertas-kerja/${item.id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 transition-all flex items-center justify-center shrink-0"
                                                title="Cetak Kertas Kerja Mutasi Sebagian"
                                              >
                                                <FileText className="w-3.5 h-3.5 text-indigo-650" />
                                              </a>
                                            )}

                                            {/* Extraction Action */}
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                if (selectedBundle.status === 'LOCKED') {
                                                  setExtractionTarget(item);
                                                } else {
                                                  showConfirm({
                                                    title: 'Keluarkan dari Bundle',
                                                    message: `Apakah Anda yakin ingin mengeluarkan permohonan ${item.nomorPermohonan} dari bundle draf ini?`,
                                                    onConfirm: () => {
                                                      handleRemoveFromBundle(item);
                                                    }
                                                  });
                                                }
                                              }}
                                              disabled={loading || isFrozen}
                                              className="p-1.5 bg-slate-50 border border-slate-200/60 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 rounded-lg text-slate-400 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
                                              title={selectedBundle.status === 'LOCKED' ? "Ajukan keluarkan (acc supervisor)" : "Keluarkan"}
                                            >
                                              <FolderMinus className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })
                                )}
                              </tbody>
                            </table>
                          </div>

                          {/* Table Footer / Pagination for Print Table — identical to Antrean */}
                          <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 select-none shrink-0 rounded-b-xl">
                            <div className="flex items-center gap-3">
                              <span className="text-[11px] font-semibold text-gray-500 font-sans">
                                {selectedBundle.permohonan && selectedBundle.permohonan.length > 0
                                  ? `Menampilkan ${((activePrintPage - 1) * itemsPerPrintPage) + 1}–${Math.min(activePrintPage * itemsPerPrintPage, selectedBundle.permohonan.length)} dari ${selectedBundle.permohonan.length} permohonan`
                                  : 'Tidak ada data'}
                              </span>
                              {/* Items per page */}
                              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-1.5 py-0.5">
                                {[10, 20, 50].map(n => (
                                  <button
                                    key={n}
                                    type="button"
                                    onClick={() => setItemsPerPrintPage(n)}
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${itemsPerPrintPage === n
                                      ? 'bg-gradient-to-r from-[#7dd4fc] to-[#9cb4fe] text-[#1e2022] shadow-sm font-extrabold'
                                      : 'text-slate-500 hover:text-slate-700'
                                      }`}
                                  >
                                    {n}
                                  </button>
                                ))}
                                <span className="text-[10px] text-slate-400 font-semibold pl-0.5">/hal</span>
                              </div>
                            </div>
                            {totalPrintPages > 1 && (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => setCurrentPrintPage(prev => Math.max(prev - 1, 1))}
                                  disabled={activePrintPage === 1}
                                  className="p-1.5 rounded-lg border-transparent bg-white text-gray-500 hover:bg-[#f1f5f9] disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center"
                                >
                                  <ChevronLeft className="w-3.5 h-3.5" />
                                </button>
                                {Array.from({ length: totalPrintPages }, (_, i) => i + 1)
                                  .filter(page => page === 1 || page === totalPrintPages || Math.abs(page - activePrintPage) <= 1)
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
                                        type="button"
                                        onClick={() => setCurrentPrintPage(page as number)}
                                        className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${activePrintPage === page
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
                                  onClick={() => setCurrentPrintPage(prev => Math.min(prev + 1, totalPrintPages))}
                                  disabled={activePrintPage === totalPrintPages}
                                  className="p-1.5 rounded-lg border-transparent bg-white text-gray-500 hover:bg-[#f1f5f9] disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center"
                                >
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Footer Status Banner (Full-Width with Watermark-like Repeating Text) */}
                      {(() => {
                        const status = selectedBundle.status;
                        const isLocked = status === 'LOCKED';
                        const repeatedTexts = Array(45).fill(status);

                        return (
                          <div className={`w-full py-2 text-center text-[9px] font-bold tracking-widest uppercase select-none flex items-center justify-center gap-6 border-t overflow-hidden ${isLocked
                            ? 'bg-slate-100/60 text-slate-500/70 border-slate-200/50'
                            : 'bg-amber-50/60 text-amber-700/75 border-amber-100/50'
                            }`}>
                            <div className="flex items-center gap-6 whitespace-nowrap">
                              {repeatedTexts.map((text, i) => (
                                <React.Fragment key={i}>
                                  <span>{text}</span>
                                  {i < repeatedTexts.length - 1 && <span className="opacity-40 select-none">•</span>}
                                </React.Fragment>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  );
                })()}
              </div>
            ) : (
              /* Clean & Premium Empty Placeholder */
              <div className="py-24 text-center flex flex-col items-center justify-center gap-4 select-none animate-fadeIn bg-white border-t border-slate-200">
                <div className="w-20 h-20 rounded-3xl bg-indigo-50 border border-indigo-100/50 flex items-center justify-center text-indigo-500 shadow-3xs animate-pulse">
                  <Boxes className="w-10 h-10 stroke-[1.5]" />
                </div>
                <div className="space-y-1.5 max-w-sm">
                  <h3 className="text-sm font-black text-gray-800 tracking-tight">Detail Bundle & Cetak</h3>
                  <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                    Silakan pilih salah satu bundle di tab <strong className="text-slate-500">Daftar bundle</strong> terlebih dahulu untuk mengulas berkas, melakukan penguncian, atau mencetak Surat Pengantar.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

      </div>{/* end: hide-during-skeleton wrapper */}

      {/* DIALOG: Minta Revisi Notes */}
      {revisionTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-5 border border-slate-100 flex flex-col gap-4 animate-scaleUp">

            <div className="flex items-center justify-between border-b border-slate-100 pb-3 select-none">
              <h3 className="text-md font-bold text-gray-900 flex items-center gap-1.5">
                <AlertCircle className="w-4.5 h-4.5 text-amber-500" /> Pengembalian Berkas Revisi
              </h3>
              <button
                onClick={() => { setRevisionTarget(null); setRevisionNotes(''); }}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <p className="text-xs text-gray-500 font-semibold select-none leading-relaxed">
              Tulis catatan alasan pengembalian berkas permohonan <strong className="text-gray-800">{revisionTarget.nomorPermohonan}</strong>. Notifikasi akan dikirim langsung ke Penginput dan wajib pajak pemilik berkas.
            </p>

            <form onSubmit={handleMintaRevisi} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-700 capitalize tracking-widest pl-1">Catatan / alasan kelengkapan</label>
                <textarea
                  placeholder="Contoh: Lampiran KTP buram, SPPT NOP tidak sesuai sertifikat..."
                  value={revisionNotes}
                  onChange={(e) => setRevisionNotes(e.target.value)}
                  disabled={loading}
                  rows={4}
                  className="w-full text-xs font-bold bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-3 transition-all text-gray-800 resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 select-none">
                <button
                  type="button"
                  onClick={() => { setRevisionTarget(null); setRevisionNotes(''); }}
                  disabled={loading}
                  className="px-3.5 py-2 text-slate-500 hover:text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading || !revisionNotes.trim()}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center"
                >
                  {loading ? (
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    'Kirim pengajuan revisi'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIALOG: Extraction from locked bundle (Requires Supervisor validation) */}
      {extractionTarget && selectedBundle?.status === 'LOCKED' && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-5 border border-slate-100 flex flex-col gap-4 animate-scaleUp">

            <div className="flex items-center justify-between border-b border-slate-100 pb-3 select-none">
              <h3 className="text-md font-bold text-gray-900 flex items-center gap-1.5">
                <Lock className="w-4.5 h-4.5 text-indigo-600" /> Koreksi Korektif Bundle Terkunci
              </h3>
              <button
                onClick={() => { setExtractionTarget(null); setExtractionNotes(''); }}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <p className="text-xs text-gray-500 font-semibold select-none leading-relaxed">
              Karena Bundle <strong className="text-gray-800">{selectedBundle.nomorBundle}</strong> sudah berstatus <strong>LOCKED</strong>, pengeluaran berkas <strong className="text-gray-800">{extractionTarget.nomorPermohonan}</strong> membutuhkan otorisasi persetujuan dari **Supervisor**.
            </p>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-700 capitalize tracking-widest pl-1">Alasan pengeluaran berkas</label>
                <textarea
                  placeholder="Tuliskan catatan alasan pengeluaran berkas untuk ditinjau oleh Supervisor..."
                  value={extractionNotes}
                  onChange={(e) => setExtractionNotes(e.target.value)}
                  disabled={loading}
                  rows={4}
                  className="w-full text-xs font-bold bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-3 transition-all text-gray-800 resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 select-none">
                <button
                  type="button"
                  onClick={() => { setExtractionTarget(null); setExtractionNotes(''); }}
                  disabled={loading}
                  className="px-3.5 py-2 text-slate-500 hover:text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleRemoveFromBundle}
                  disabled={loading || !extractionNotes.trim()}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center"
                >
                  {loading ? (
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    'Kirim permintaan otorisasi'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* DIALOG: Details Modal Overlay */}
      {selectedRequest && (
        <DetailsModal
          isOpen={!!selectedRequest}
          selectedRequest={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}

      <ActionStatusModal
        isOpen={statusModalOpen}
        status={statusModalStatus}
        title={statusModalTitle}
        message={statusModalMessage}
        onClose={() => setStatusModalOpen(false)}
      />
    </div>
  );
}


