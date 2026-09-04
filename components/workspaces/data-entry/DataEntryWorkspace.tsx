"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef, useDeferredValue } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Plus, Search, Edit, RefreshCw, X, FileText,
  ChevronLeft, ChevronRight, ChevronDown, Check, Star, Copy, AlertTriangle
} from 'lucide-react';
import { useSession } from "next-auth/react";
import { useDashboard } from '@/context/DashboardContext';
import {
  resubmitPermohonan,
  getPenginputPermohonan,
  togglePermohonanFavorite
} from '@/app/actions/data-entry';
import { SkeletonBox, SkeletonText, SkeletonBadge } from '@/components/skeletons/SkeletonBase';
import { DetailsModal } from '@/components/workspaces/shared/DetailsModal';
import { CreateForm } from './CreateForm';
import { EditModal } from './EditModal';
import { ActionStatusModal } from '@/components/workspaces/shared/ActionStatusModal';
import { EmptyDataAnimation } from '@/components/workspaces/shared/EmptyDataAnimation';
import { RevisionAlertBanner } from '@/components/workspaces/shared/RevisionAlertBanner';
import { formatNop, toTitleCase, JENIS_OPTIONS, cleanPecahanSuffix } from '@/components/workspaces/shared/constants';
import { DataEntryListSkeleton, DataEntryCreateSkeleton } from './DataEntrySkeletons';
import { DataEntryTableRow, DataEntryTableRow as PenginputTableRow, isOverdue } from './DataEntryTableRow';
import { DataEntryKpiStrip } from './DataEntryKpiStrip';
import { DataEntryToolbar } from './DataEntryToolbar';


export default function PenginputWorkspace() {
  const { data: session } = useSession();
  const { showConfirm, refreshFavorites } = useDashboard();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Search & Filter State
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterJenisLayanan, setFilterJenisLayanan] = useState<string>('ALL');
  const [isRevisionBannerDismissed, setIsRevisionBannerDismissed] = useState<boolean>(false);

  // Sorting State ('last_modified' | 'newest' | 'oldest' | 'a_z')
  const [sortBy, setSortBy] = useState<'last_modified' | 'newest' | 'oldest' | 'a_z'>('last_modified');
  const [isSortOpen, setIsSortOpen] = useState<boolean>(false);

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
        const rawList = res.list || [];
        const normalized = rawList.map((item: any) => {
          const previousData = Array.isArray(item.previousData) ? item.previousData : (Array.isArray(item.dataLama) ? item.dataLama : []);
          const targetData = Array.isArray(item.targetData) ? item.targetData : (Array.isArray(item.dataBaru) ? item.dataBaru : []);
          const firstPrev = previousData[0] || {};
          const firstTarget = targetData[0] || {};
          const appType = item.applicationType || item.jenisPermohonan || '';

          // 1. NOP logic:
          // NEW_TAX_OBJECT -> targetData[0].nopTemporary
          // All other types -> previousData[0].nop
          let calculatedNop = item.nop || '';
          if (appType === 'NEW_TAX_OBJECT' || appType === 'OBJEK_PAJAK_BARU') {
            calculatedNop = firstTarget.nopTemporary || firstTarget.nop || item.nop || '-';
          } else {
            calculatedNop = firstPrev.nop || firstPrev.nopTemporary || item.nop || '-';
          }

          // 2. Nama Pemohon logic:
          let calculatedNamaWajibPajak = item.namaWajibPajak && item.namaWajibPajak !== '-' ? item.namaWajibPajak : '';
          if (!calculatedNamaWajibPajak) {
            if (targetData.length > 0) {
              calculatedNamaWajibPajak = targetData
                .map((t: any) => t.ownerName || t.namaPemilikBaru)
                .filter(Boolean)
                .join(', ');
            }
            if (!calculatedNamaWajibPajak) {
              calculatedNamaWajibPajak = firstPrev.ownerName || firstPrev.namaWajibPajak || '-';
            }
          }

          return {
            ...item,
            jenisPermohonan: appType,
            applicationType: appType,
            nomorPelayanan: item.applicationNumber || item.nomorPelayanan || '-',
            applicationNumber: item.applicationNumber || item.nomorPelayanan || '-',
            tanggalNoPelayanan: item.serviceNumberDate || item.tanggalNoPelayanan || item.createdAt,
            serviceNumberDate: item.serviceNumberDate || item.tanggalNoPelayanan || item.createdAt,
            tanggalPenyelesaian: item.completionDate || item.tanggalPenyelesaian,
            completionDate: item.completionDate || item.tanggalPenyelesaian,
            nop: calculatedNop,
            namaWajibPajak: calculatedNamaWajibPajak,
            dataLama: previousData,
            dataBaru: targetData,
            previousData,
            targetData,
          };
        });
        setList(normalized);
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
        console.error(res.error || 'Gagal mengubah status favorit.');
        setList(originalList); // Revert
      } else {
        refreshFavorites();
      }
    } catch (err) {
      console.error('Gagal mengubah status favorit.', err);
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

  // Single-pass KPI counts calculation for modeBaseList metrics
  const kpiCounts = useMemo(() => {
    const total = modeBaseList.length;
    let submitted = 0;
    let revision = 0;
    let bundled = 0;
    let archived = 0;
    let completed = 0;
    let rejected = 0;

    for (let i = 0; i < total; i++) {
      const s = modeBaseList[i].status;
      if (s === 'SUBMITTED' || s === 'DRAFT') submitted++;
      else if (s === 'REVISION') revision++;
      else if (s === 'BUNDLED') bundled++;
      else if (s === 'ARCHIVED') archived++;
      else if (s === 'COMPLETED') completed++;
      else if (s === 'REJECTED') rejected++;
    }

    const calcPct = (count: number) => (total > 0 ? `${((count / total) * 100).toFixed(0)}%` : '0%');

    return {
      total,
      submitted,
      submittedPct: calcPct(submitted),
      revision,
      revisionPct: calcPct(revision),
      bundled,
      bundledPct: calcPct(bundled),
      archived,
      archivedPct: calcPct(archived),
      completed,
      completedPct: calcPct(completed),
      rejected,
      rejectedPct: calcPct(rejected),
    };
  }, [modeBaseList]);

  // Search filter
  const filteredList = useMemo(() => {
    return list.filter((item) => {
      const q = deferredSearchQuery.toLowerCase().trim();
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
  }, [list, deferredSearchQuery, filterStatus, filterJenisLayanan, startDate, endDate]);

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

  // Sort displayList according to sortBy selection
  const sortedDisplayList = useMemo(() => {
    const base = [...displayList];
    if (sortBy === 'last_modified') {
      return base.sort((a, b) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime());
    }
    if (sortBy === 'newest') {
      return base.sort((a, b) => new Date(b.tanggalNoPelayanan || b.tanggalPermohonan || b.createdAt || 0).getTime() - new Date(a.tanggalNoPelayanan || a.tanggalPermohonan || a.createdAt || 0).getTime());
    }
    if (sortBy === 'oldest') {
      return base.sort((a, b) => new Date(a.tanggalNoPelayanan || a.tanggalPermohonan || a.createdAt || 0).getTime() - new Date(b.tanggalNoPelayanan || b.tanggalPermohonan || b.createdAt || 0).getTime());
    }
    if (sortBy === 'a_z') {
      return base.sort((a, b) => (a.displayNamaWajibPajak || '').localeCompare(b.displayNamaWajibPajak || ''));
    }
    return base;
  }, [displayList, sortBy]);

  // Pagination logic
  const totalPages = Math.ceil(sortedDisplayList.length / itemsPerPage);
  const activePage = currentPage > totalPages ? 1 : currentPage;

  const paginatedList = useMemo(() => {
    return sortedDisplayList.slice(
      (activePage - 1) * itemsPerPage,
      activePage * itemsPerPage
    );
  }, [sortedDisplayList, activePage, itemsPerPage]);

  return (
    <div id="penginput-board-root" className="w-full font-sans select-none animate-fadeIn flex flex-col gap-6">

      {/* Show precision skeleton based on viewMode (list vs form) when loading */}
      {listLoading && viewMode === 'list' && <DataEntryListSkeleton />}
      {listLoading && viewMode === 'form' && <DataEntryCreateSkeleton />}

      {/* Hide content while skeleton is showing on first load */}
      <div className={`flex flex-col gap-6 ${listLoading ? 'hidden' : ''}`}>

        {/* Reusable Revision Alert Banner */}
        <RevisionAlertBanner
          count={kpiCounts.revision}
          onAction={() => {
            setFilterStatus('REVISION');
            setCurrentPage(1);
          }}
        />

        {/* ==================== VIEW MODE: LIST (2-Column Split Panel) ==================== */}
        {viewMode === 'list' && (
          <div className="flex flex-col gap-4">

            {/* TIER 1: STATS KPI STRIP */}
            <DataEntryKpiStrip
              filterStatus={filterStatus}
              onSelectFilterStatus={(status) => {
                setFilterStatus(status);
                setCurrentPage(1);
              }}
              kpiCounts={kpiCounts}
            />

            {/* TIER 2: SEARCH, FILTERS & TOOLBAR CONTROLS */}
            <DataEntryToolbar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onClearSearch={() => setSearchQuery('')}
              jenisFilter={filterJenisLayanan}
              onJenisFilterChange={setFilterJenisLayanan}
              filterJenisApp={filterJenisLayanan}
              onFilterJenisAppChange={(val) => {
                setFilterJenisLayanan(val);
                setCurrentPage(1);
              }}
              startDate={startDate}
              onStartDateChange={setStartDate}
              endDate={endDate}
              onEndDateChange={setEndDate}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              displayMode={displayMode}
              onSwitchDisplayMode={handleSwitchDisplayMode}
              isRefreshing={isRefreshing}
              onRefresh={() => fetchData(true)}
              jenisOptions={JENIS_OPTIONS}
            />

            {/* TIER 3: DATA CANVAS & ENTERPRISE TABLE */}
            <div className="w-full bg-white border border-slate-200/90 rounded-md shadow-xs flex flex-col overflow-hidden min-h-[500px]">

              {/* Table wrapper full-width without padding */}
              <div className="p-0 flex-1 flex flex-col">
                <div className="overflow-hidden bg-transparent flex flex-col flex-1 justify-between">
                  <div className="overflow-x-auto scrollbar-thin flex-1 flex flex-col">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/90 text-[13px] font-normal text-slate-600 capitalize text-left border-b border-slate-200/90 select-none font-sans">
                          <th className="py-3 px-4 text-center w-12 min-w-[48px] relative font-normal text-slate-600">
                            <span>No</span>
                            <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                          </th>
                          <th className="py-3 px-2 text-center select-none w-10 min-w-[40px] relative font-normal text-slate-600">
                            <span>⭐</span>
                            <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                          </th>

                          {/* Clean Standard Table Headers with Centered Partial-Height Vertical Dividers */}
                          <th className="py-3 px-4 min-w-[110px] relative font-normal text-slate-600">
                            <span>Tgl. Input</span>
                            <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                          </th>
                          <th className="py-3 px-4 min-w-[140px] relative font-normal text-slate-600">
                            <span>Petugas Input</span>
                            <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                          </th>
                          <th className="py-3 px-4 min-w-[130px] relative font-normal text-slate-600">
                            <span>Tgl. Nopel</span>
                            <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                          </th>
                          <th className="py-3 px-4 min-w-[110px] relative font-normal text-slate-600">
                            <span>Tgl. Selesai</span>
                            <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                          </th>
                          <th className="py-3 px-4 min-w-[160px] relative font-normal text-slate-600">
                            <span>No. Pelayanan</span>
                            <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                          </th>
                          <th className="py-3 px-4 min-w-[210px] whitespace-nowrap relative font-normal text-slate-600">
                            <span>Nomor Objek Pajak</span>
                            <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                          </th>
                          <th className="py-3 px-4 min-w-[150px] relative font-normal text-slate-600">
                            <span>Nama Pemohon</span>
                            <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                          </th>
                          <th className="py-3 px-4 min-w-[130px] relative font-normal text-slate-600">
                            <span>Jenis Layanan</span>
                            <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                          </th>
                          <th className="py-3 px-4 text-center min-w-[130px] relative font-normal text-slate-600">
                            <span>Status</span>
                            <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                          </th>
                          <th className="py-3 px-4 text-center min-w-[110px] font-normal text-slate-600">
                            <span>Aksi</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[12px] font-normal text-slate-600 font-sans">
                        {paginatedList.length === 0 ? (
                          <tr>
                            <td colSpan={12} className="py-10 text-center select-none font-sans">
                              <EmptyDataAnimation
                                title={searchQuery ? 'Tidak ada permohonan yang sesuai' : 'Belum ada data permohonan'}
                                description={searchQuery ? 'Coba ubah kata kunci pencarian atau reset filter status.' : 'Klik "+ Tambah Entri Baru" di atas untuk memulai.'}
                              />
                            </td>
                          </tr>
                        ) : (
                          paginatedList.map((item, idx) => (
                            <PenginputTableRow
                              key={item.uniqueRowKey || item.id}
                              item={item}
                              globalIndex={(activePage - 1) * itemsPerPage + idx + 1}
                              searchQuery={deferredSearchQuery}
                              copiedText={copiedText}
                              sessionUserName={session?.user?.name}
                              loading={loading}
                              onSelect={setSelectedRequest}
                              onToggleFavorite={handleToggleFavorite}
                              onCopy={handleCopy}
                              onEdit={setEditTarget}
                              onDuplicate={setDuplicateTarget}
                              onResubmit={handleResubmit}
                            />
                          ))
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


