"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Loader2, RefreshCw } from 'lucide-react';
import { DetailsModal } from '@/components/workspaces/shared/DetailsModal';
import { ActionStatusModal } from '@/components/workspaces/shared/ActionStatusModal';
import { PenelitiBundleSkeleton, PenelitiListSkeleton, PenelitiPrintSkeleton } from '@/components/skeletons/ResearcherSkeleton';

// Modular Researcher Subcomponents & Hooks
import { ResearcherKpiStrip } from './statistic-researcher/ResearcherKpiStrip';
import { useResearcherStatistics } from './statistic-researcher/useResearcherStatistics';

import { BundleCard } from './bundle-researcher/BundleCard';
import { BundleToolbar } from './bundle-researcher/BundleToolbar';
import { useBundleManagement } from './bundle-researcher/useBundleManagement';

import { QueueTableRow } from './queue-researcher/QueueTableRow';
import { QueueToolbar } from './queue-researcher/QueueToolbar';
import { useApplicationQueue } from './queue-researcher/useApplicationQueue';

import { RecommendationPrintView } from './recommendation-researcher/RecommendationPrintView';

import { RevisionRequestModal } from './modal-researcher/RevisionRequestModal';
import { RemoveFromBundleModal } from './modal-researcher/RemoveFromBundleModal';
import { LockBundleConfirmationModal } from './modal-researcher/LockBundleConfirmationModal';
import { EmptyDataAnimation } from "@/components/workspaces/shared/EmptyDataAnimation";
import { BundleSnapshotDrawer } from '@/components/workspaces/shared/BundleSnapshotDrawer';

import { getAllBundles, removePermohonanFromBundle } from '@/app/actions/researcher';

export interface ResearcherWorkspaceProps {
  initialTab?: 'bundle' | 'list' | 'print';
}

export default function ResearcherWorkspace({ initialTab = 'bundle' }: ResearcherWorkspaceProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Tab State
  const viewQuery = searchParams.get('view') || initialTab;
  const [viewMode, setViewMode] = useState<'bundle' | 'list' | 'print'>(
    (viewQuery as 'bundle' | 'list' | 'print') || 'bundle'
  );

  const viewModeRef = useRef(viewMode);
  viewModeRef.current = viewMode;

  const [versionDrawerBundle, setVersionDrawerBundle] = useState<any>(null);
  const [allBundlesList, setAllBundlesList] = useState<any[]>([]);

  useEffect(() => {
    if (viewQuery && ['bundle', 'list', 'print'].includes(viewQuery) && viewQuery !== viewModeRef.current) {
      setViewMode(viewQuery as any);
      viewModeRef.current = viewQuery as any;
    }
  }, [viewQuery]);

  const handleSwitchStep = useCallback((mode: 'bundle' | 'list' | 'print') => {
    setViewMode(mode);
    viewModeRef.current = mode;
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', 'peneliti');
      url.searchParams.set('view', mode);
      window.history.replaceState(null, '', url.toString());
    }
  }, []);

  // Custom Hooks
  const bundleMgmt = useBundleManagement();
  const appQueue = useApplicationQueue();

  const fetchAllBundlesForKpi = useCallback(async () => {
    try {
      const res = await getAllBundles();
      if (res.success && res.list) {
        setAllBundlesList(res.list);
      }
    } catch (e) {
      console.error('Failed to fetch all bundles for KPI statistics:', e);
    }
  }, []);

  const statistics = useResearcherStatistics({
    bundlesList: allBundlesList,
    submittedList: appQueue.submittedList,
  });

  const [isGlobalRefreshing, setIsGlobalRefreshing] = useState(false);

  const handleGlobalRefresh = useCallback(async () => {
    setIsGlobalRefreshing(true);
    try {
      await Promise.all([
        bundleMgmt.fetchBundles(),
        appQueue.fetchSubmittedQueue(),
        fetchAllBundlesForKpi()
      ]);
    } finally {
      setIsGlobalRefreshing(false);
    }
  }, [bundleMgmt, appQueue, fetchAllBundlesForKpi]);

  // Initial Data Load
  useEffect(() => {
    bundleMgmt.fetchBundles();
    appQueue.fetchSubmittedQueue();
    fetchAllBundlesForKpi();
  }, [fetchAllBundlesForKpi]);

  // Infinite Scroll Sentinel Observer for Bundle Cards
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (viewMode !== 'bundle' || !bundleMgmt.hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          bundleMgmt.loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [viewMode, bundleMgmt.hasMore, bundleMgmt.loadMore]);

  // Shared Modals State
  const [selectedRequestDetails, setSelectedRequestDetails] = useState<any | null>(null);
  const [revisionTarget, setRevisionTarget] = useState<any | null>(null);
  const [removeFromBundleTarget, setRemoveFromBundleTarget] = useState<any | null>(null);
  const [lockConfirmationBundle, setLockConfirmationBundle] = useState<any | null>(null);

  // Status Modal State
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusModalStatus, setStatusModalStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusModalTitle, setStatusModalTitle] = useState('');
  const [statusModalMessage, setStatusModalMessage] = useState('');

  const redirectTargetRef = useRef<'list' | 'bundle' | 'bundle-history' | null>(null);
  const autoRedirectTimerRef = useRef<NodeJS.Timeout | null>(null);

  const executeHybridRedirect = useCallback(() => {
    if (autoRedirectTimerRef.current) {
      clearTimeout(autoRedirectTimerRef.current);
      autoRedirectTimerRef.current = null;
    }
    setStatusModalOpen(false);
    setStatusModalStatus('idle');

    const target = redirectTargetRef.current;
    if (target) {
      redirectTargetRef.current = null;
      if (target === 'bundle-history') {
        router.push('/?tab=bundle-history&view=print');
      } else {
        handleSwitchStep(target as any);
        router.push(`/?tab=peneliti&view=${target}`);
      }
    }
  }, [handleSwitchStep, router]);

  const handleRemoveFromBundle = useCallback(async (item: any) => {
    const currentBundle = bundleMgmt.selectedBundle;
    const bundleId = currentBundle?.id || item.currentBundleId || item.bundleId;

    if (!bundleId) return;

    const isLocked = currentBundle?.status === 'LOCKED' || item.bundleStatus === 'LOCKED' || item.status === 'LOCKED';

    if (isLocked) {
      setRemoveFromBundleTarget(item);
    } else {
      setStatusModalStatus('loading');
      setStatusModalTitle('Mengeluarkan Permohonan...');
      setStatusModalMessage(`Mengeluarkan permohonan ${item.applicationNumber || ''} dari bundle draf...`);
      setStatusModalOpen(true);

      try {
        const res = await removePermohonanFromBundle(bundleId, item.id);
        if (res.success) {
          redirectTargetRef.current = 'list';
          setStatusModalStatus('success');
          setStatusModalTitle('Berhasil Dikeluarkan');
          setStatusModalMessage(`Permohonan ${item.applicationNumber || ''} berhasil dikembalikan ke Antrean Utama.`);

          Promise.all([
            bundleMgmt.fetchBundles(),
            appQueue.fetchSubmittedQueue(),
            fetchAllBundlesForKpi()
          ]).catch(err => console.error("Error refreshing background data:", err));

          // Hybrid Auto-Redirect Timer (Fast 400ms fallback)
          if (autoRedirectTimerRef.current) clearTimeout(autoRedirectTimerRef.current);
          autoRedirectTimerRef.current = setTimeout(() => {
            executeHybridRedirect();
          }, 400);
        } else {
          setStatusModalStatus('error');
          setStatusModalTitle('Gagal Mengeluarkan');
          setStatusModalMessage(res.error || 'Gagal mengeluarkan permohonan dari bundle.');
        }
      } catch (err: any) {
        setStatusModalStatus('error');
        setStatusModalTitle('Terjadi Kesalahan');
        setStatusModalMessage(err.message || 'Gagal mengeluarkan permohonan.');
      }
    }
  }, [bundleMgmt, appQueue, fetchAllBundlesForKpi, executeHybridRedirect]);

  const handleAddToBundleWithModal = useCallback(async (bundleId: string, permohonanId: string, itemAppNumber?: string) => {
    setStatusModalStatus('loading');
    setStatusModalTitle('Memasukkan ke Bundle...');
    setStatusModalMessage(`Memasukkan permohonan ${itemAppNumber ? `${itemAppNumber} ` : ''}ke dalam bundle target...`);
    setStatusModalOpen(true);

    try {
      await appQueue.handleAddToBundle(bundleId, permohonanId, async () => {
        await Promise.all([
          bundleMgmt.fetchBundles(),
          fetchAllBundlesForKpi()
        ]);
      });

      appQueue.setSuccess('');
      bundleMgmt.setSuccess('');
      redirectTargetRef.current = null;
      setStatusModalStatus('success');
      setStatusModalTitle('Berhasil Dimasukkan');
      setStatusModalMessage(`Permohonan ${itemAppNumber ? `${itemAppNumber} ` : ''}berhasil dimasukkan ke dalam Bundle.`);

      if (autoRedirectTimerRef.current) clearTimeout(autoRedirectTimerRef.current);
      autoRedirectTimerRef.current = setTimeout(() => {
        setStatusModalOpen(false);
        setStatusModalStatus('idle');
      }, 400);
    } catch (err: any) {
      setStatusModalStatus('error');
      setStatusModalTitle('Gagal Memasukkan');
      setStatusModalMessage(err.message || 'Gagal memasukkan permohonan ke dalam bundle.');
    }
  }, [appQueue, bundleMgmt, fetchAllBundlesForKpi]);

  const handleCreateBundleWithModal = useCallback(async (jenisLayanan?: string) => {
    setStatusModalStatus('loading');
    setStatusModalTitle('Membuat Bundle...');
    setStatusModalMessage(`Membuat bundle draf baru${jenisLayanan ? ` untuk jenis ${jenisLayanan}` : ''}...`);
    setStatusModalOpen(true);

    try {
      const newBundle = await bundleMgmt.handleCreateBundle(jenisLayanan);
      if (newBundle) {
        bundleMgmt.setSuccess('');
        redirectTargetRef.current = null;
        setStatusModalStatus('success');
        setStatusModalTitle('Bundle Berhasil Dibuat');
        setStatusModalMessage(`Bundle ${newBundle.bundleNumber} berhasil dibuat dan siap diisi permohonan.`);

        fetchAllBundlesForKpi();

        if (autoRedirectTimerRef.current) clearTimeout(autoRedirectTimerRef.current);
        autoRedirectTimerRef.current = setTimeout(() => {
          setStatusModalOpen(false);
          setStatusModalStatus('idle');
        }, 400);
      }
    } catch (err: any) {
      setStatusModalStatus('error');
      setStatusModalTitle('Gagal Membuat Bundle');
      setStatusModalMessage(err.message || 'Terjadi kesalahan saat membuat bundle baru.');
    }
  }, [bundleMgmt, fetchAllBundlesForKpi]);

  const handleLockBundleWithModal = useCallback(async (bundleId: string) => {
    setStatusModalStatus('loading');
    setStatusModalTitle('Mengunci Bundle...');
    setStatusModalMessage('Mengunci bundle draf dan memproses dokumen rekomendasi...');
    setStatusModalOpen(true);

    try {
      const success = await bundleMgmt.handleLockBundleAction(bundleId);
      if (success) {
        bundleMgmt.setSuccess('');
        redirectTargetRef.current = 'bundle-history';
        setStatusModalStatus('success');
        setStatusModalTitle('Bundle Berhasil Dikunci');
        setStatusModalMessage('Bundle berhasil dikunci. Anda akan dialihkan ke Riwayat Bundle untuk mencetak rekomendasi.');

        fetchAllBundlesForKpi();

        if (autoRedirectTimerRef.current) clearTimeout(autoRedirectTimerRef.current);
        autoRedirectTimerRef.current = setTimeout(() => {
          executeHybridRedirect();
        }, 400);
      }
    } catch (err: any) {
      setStatusModalStatus('error');
      setStatusModalTitle('Gagal Mengunci Bundle');
      setStatusModalMessage(err.message || 'Terjadi kesalahan saat mengunci bundle.');
    }
  }, [bundleMgmt, fetchAllBundlesForKpi, executeHybridRedirect]);

  const handleRequestLockBundle = useCallback((bundleOrId: any) => {
    let targetBundle = typeof bundleOrId === 'object' && bundleOrId ? bundleOrId : null;
    if (!targetBundle && typeof bundleOrId === 'string') {
      targetBundle = allBundlesList.find(b => b.id === bundleOrId) ||
        bundleMgmt.bundlesList.find(b => b.id === bundleOrId) ||
        (bundleMgmt.selectedBundle?.id === bundleOrId ? bundleMgmt.selectedBundle : null);
    }
    if (targetBundle) {
      setLockConfirmationBundle(targetBundle);
    } else if (typeof bundleOrId === 'string') {
      handleLockBundleWithModal(bundleOrId);
    }
  }, [allBundlesList, bundleMgmt, handleLockBundleWithModal]);

  // Auto show toast messages from hooks
  useEffect(() => {
    if (bundleMgmt.error || appQueue.error) {
      setStatusModalTitle('Terjadi Kesalahan');
      setStatusModalMessage(bundleMgmt.error || appQueue.error);
      setStatusModalStatus('error');
      setStatusModalOpen(true);
      bundleMgmt.setError('');
      appQueue.setError('');
    } else if (bundleMgmt.success || appQueue.success) {
      setStatusModalTitle('Berhasil');
      setStatusModalMessage(bundleMgmt.success || appQueue.success);
      setStatusModalStatus('success');
      setStatusModalOpen(true);
      bundleMgmt.setSuccess('');
      appQueue.setSuccess('');
    }
  }, [bundleMgmt.error, bundleMgmt.success, appQueue.error, appQueue.success]);

  // Queue Pagination calculation
  const totalQueuePages = Math.ceil(appQueue.filteredQueue.length / appQueue.itemsPerPage) || 1;
  const paginatedQueue = appQueue.filteredQueue.slice(
    (appQueue.currentPage - 1) * appQueue.itemsPerPage,
    appQueue.currentPage * appQueue.itemsPerPage
  );

  const hasInitialData = allBundlesList.length > 0 || bundleMgmt.bundlesList.length > 0 || appQueue.submittedList.length > 0;
  if (!hasInitialData && (bundleMgmt.loading || appQueue.listLoading)) {
    if (viewMode === 'list') return <PenelitiListSkeleton />;
    if (viewMode === 'print') return <PenelitiPrintSkeleton />;
    return <PenelitiBundleSkeleton />;
  }

  return (
    <div className="w-full font-sans select-none flex flex-col gap-4 animate-fadeIn">
      {/* HEADER RUANG KERJA (TOP BANNER) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none font-sans">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Ruang Kerja Saya</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* VIEW MODE SWITCHER TABS (RIGHT-ALIGNED NAV TABS) */}
          <div className="bg-slate-100/90 border border-slate-200/80 p-1 rounded-md flex items-center gap-1 shadow-2xs font-sans select-none">
            <button
              onClick={() => handleSwitchStep('bundle')}
              className={`py-1.5 px-3 rounded-md text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${viewMode === 'bundle'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
            >
              <span>Buat Bundle</span>
            </button>

            <button
              onClick={() => handleSwitchStep('list')}
              className={`py-1.5 px-3 rounded-md text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${viewMode === 'list'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
            >
              <span>Kelola Permohonan</span>
            </button>

            <button
              onClick={() => handleSwitchStep('print')}
              className={`py-1.5 px-3 rounded-md text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${viewMode === 'print'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
            >
              <span>Kunci Bundle</span>
            </button>
          </div>

          {/* Action Header: Tombol Refresh Data */}
          <button
            onClick={handleGlobalRefresh}
            disabled={isGlobalRefreshing}
            className="h-9 px-3.5 bg-white border border-slate-200/90 hover:border-slate-300 rounded-md flex items-center gap-2 text-slate-700 hover:text-slate-900 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 shadow-3xs"
            title="Refresh Seluruh Data Workspace"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGlobalRefreshing ? 'animate-spin text-[#00a389]' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. TOP KPI STRIP */}
      <ResearcherKpiStrip
        viewMode={viewMode}
        metrics={statistics}
        totalBundles={statistics.totalBundles}
        bundleStatusCounts={statistics.bundleStatusCounts}
        returnedFromPengarsipCount={statistics.returnedFromPengarsipCount}
        returnedFromPengirimLogistikCount={statistics.returnedFromPengirimLogistikCount}
        returnedFromPengirimPusatCount={statistics.returnedFromPengirimPusatCount}
        filterRevisionSource={appQueue.filterRevisionSource}
        filterBundleStatus={bundleMgmt.filterBundleStatus}
        onSelectZoneABundleStatus={(status) => {
          bundleMgmt.setFilterBundleStatus(status);
          handleSwitchStep('bundle');
        }}
        onSelectZoneBRevisionSource={(source) => {
          appQueue.setFilterRevisionSource(source as any);
          handleSwitchStep('list');
        }}
      />

      {/* THIN DIVIDER LINE BELOW KPI STRIP */}
      <div className="w-full border-b border-slate-200/80 my-0.5" />

      {/* 3. TAB 1: BUNDLE MANAGEMENT VIEW */}
      <div className={viewMode === 'bundle' ? 'flex flex-col gap-4' : 'hidden'}>
        <BundleToolbar
          searchQuery={bundleMgmt.searchQuery}
          onSearchChange={bundleMgmt.setSearchQuery}
          filterJenisLayanan={bundleMgmt.filterJenisLayanan}
          onFilterJenisChange={bundleMgmt.setFilterJenisLayanan}
          filterBundleStatus={bundleMgmt.filterBundleStatus}
          onFilterStatusChange={bundleMgmt.setFilterBundleStatus}
          onCreateBundle={() => handleCreateBundleWithModal(bundleMgmt.filterJenisLayanan !== 'ALL' ? bundleMgmt.filterJenisLayanan : undefined)}
          isLoading={bundleMgmt.loading}
          onRefresh={() => bundleMgmt.fetchBundles()}
          isRefreshing={bundleMgmt.loading}
          bundleJenisCounts={bundleMgmt.bundleJenisCounts}
        />

        {/* Bundle Cards Grid (Directly on main content background) */}
        <div className="min-h-[300px] w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3.5">
            {bundleMgmt.visibleBundles.length > 0 ? (
              bundleMgmt.visibleBundles.map((b) => (
                <BundleCard
                  key={b.id}
                  bundle={b}
                  isSelected={bundleMgmt.selectedBundle?.id === b.id}
                  onSelect={(bundle) => bundleMgmt.setSelectedBundle(bundle)}
                  onLock={(id) => handleRequestLockBundle(b)}
                  onOpenVersionDrawer={(bundle) => setVersionDrawerBundle(bundle)}
                  isLoading={bundleMgmt.loading}
                />
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-xs text-slate-400">
                Tidak ada bundle yang cocok dengan filter.
              </div>
            )}
          </div>
        </div>

        {/* Infinite Scroll Sentinel & Footer Indicator */}
        {bundleMgmt.filteredBundles.length > 0 && (
          <div ref={loadMoreRef} className="py-3 flex flex-col items-center justify-center gap-1 mt-2 text-xs text-slate-400 font-sans border-t border-slate-200/60">
            {bundleMgmt.hasMore ? (
              <div className="flex items-center gap-2 text-slate-500 font-normal">
                <Loader2 className="w-4 h-4 animate-spin text-[#00a389]" />
                <span>Memuat bundle lainnya...</span>
              </div>
            ) : (
              <span className="text-slate-400 text-[11px] font-normal">
                Menampilkan seluruh {bundleMgmt.filteredBundles.length} Bundle
              </span>
            )}
          </div>
        )}
      </div>

      {/* 4. TAB 2: APPLICATION QUEUE VIEW */}
      <div className={viewMode === 'list' ? 'flex flex-col gap-4' : 'hidden'}>
        <QueueToolbar
          selectedBundle={bundleMgmt.selectedBundle}
          bundlesList={bundleMgmt.bundlesList}
          onSelectBundle={bundleMgmt.setSelectedBundle}
          searchQuery={appQueue.searchSubmittedQuery}
          onSearchChange={appQueue.setSearchSubmittedQuery}
          onClearSearch={() => appQueue.setSearchSubmittedQuery('')}
          filterJenisLayanan={appQueue.filterJenisLayanan}
          onFilterJenisChange={appQueue.setFilterJenisLayanan}
          jenisCounts={appQueue.jenisCounts}
          sortBy={appQueue.sortBy}
          onSortByChange={appQueue.setSortBy}
          displayMode={appQueue.displayMode}
          onSwitchDisplayMode={appQueue.setDisplayMode}
          itemsPerPage={appQueue.itemsPerPage}
          onItemsPerPageChange={appQueue.setItemsPerPage}
          totalItems={appQueue.filteredQueue.length}
          isRefreshing={appQueue.listLoading}
          onRefresh={() => appQueue.fetchSubmittedQueue()}
        />

        {/* TIER 3: DATA CANVAS & ENTERPRISE TABLE */}
        <div className="w-full bg-white border border-slate-200/90 rounded-md shadow-xs flex flex-col overflow-hidden min-h-[500px]">
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
                      <th className="py-3 px-4 min-w-[110px] relative font-normal text-slate-600">
                        <span>Tgl. Input</span>
                        <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                      </th>
                      <th className="py-3 px-4 min-w-[140px] relative font-normal text-slate-600">
                        <span>Petugas Input</span>
                        <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                      </th>
                      <th className="py-3 px-4 min-w-[130px] relative font-normal text-slate-600">
                        <span>Tgl. Permohonan</span>
                        <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                      </th>
                      <th className="py-3 px-4 min-w-[110px] relative font-normal text-slate-600">
                        <span>Tgl. Selesai</span>
                        <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                      </th>
                      <th className="py-3 px-4 min-w-[160px] relative font-normal text-slate-600">
                        <span>No. Permohonan</span>
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
                    {paginatedQueue.length > 0 ? (
                      paginatedQueue.map((item, idx) => (
                        <QueueTableRow
                          key={item.uniqueRowKey || `${item.id}-${idx}`}
                          item={item}
                          index={(appQueue.currentPage - 1) * appQueue.itemsPerPage + idx}
                          searchQuery={appQueue.searchSubmittedQuery}
                          selectedBundle={bundleMgmt.selectedBundle}
                          onToggleFavorite={appQueue.handleToggleFavorite}
                          onViewDetails={setSelectedRequestDetails}
                          onAddToBundle={(bundleId, permohonanId) =>
                            handleAddToBundleWithModal(bundleId, permohonanId, item.applicationNumber)
                          }
                          onRequestRevision={setRevisionTarget}
                        />
                      ))
                    ) : (
                      <tr>
                        <td colSpan={12} className="py-10 text-center select-none font-sans">
                          <EmptyDataAnimation
                            title={appQueue.searchSubmittedQuery ? 'Tidak ada permohonan yang sesuai' : 'Belum ada permohonan dalam antrean'}
                            description={appQueue.searchSubmittedQuery ? 'Coba ubah kata kunci pencarian atau reset filter status.' : 'Data permohonan yang diajukan akan muncul di sini.'}
                          />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Table Footer / Pagination */}
          <div className="px-5 py-3.5 border-t border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 select-none shrink-0 mt-auto">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-semibold text-slate-500 font-sans">
                {appQueue.filteredQueue.length > 0
                  ? `Menampilkan ${((appQueue.currentPage - 1) * appQueue.itemsPerPage) + 1}–${Math.min(appQueue.currentPage * appQueue.itemsPerPage, appQueue.filteredQueue.length)} dari ${appQueue.filteredQueue.length} ${appQueue.displayMode === 'pemohon' ? 'entri pemohon' : 'permohonan'}`
                  : 'Tidak ada data'}
              </span>
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-md px-1.5 py-0.5 shadow-3xs">
                {[10, 20, 50].map(n => (
                  <button
                    key={n}
                    onClick={() => {
                      appQueue.setItemsPerPage(n);
                      appQueue.setCurrentPage(1);
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${appQueue.itemsPerPage === n
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

            {totalQueuePages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => appQueue.setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={appQueue.currentPage === 1}
                  className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-all cursor-pointer shadow-3xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                {Array.from({ length: totalQueuePages }, (_, i) => i + 1)
                  .filter(page => page === 1 || page === totalQueuePages || Math.abs(page - appQueue.currentPage) <= 1)
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
                        onClick={() => appQueue.setCurrentPage(page as number)}
                        className={`w-7 h-7 rounded-md text-xs font-bold transition-all cursor-pointer ${appQueue.currentPage === page
                          ? 'bg-[#00a389] text-white font-extrabold shadow-3xs scale-105 z-10'
                          : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 shadow-3xs'
                          }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                <button
                  onClick={() => appQueue.setCurrentPage(prev => Math.min(prev + 1, totalQueuePages))}
                  disabled={appQueue.currentPage === totalQueuePages}
                  className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-all cursor-pointer shadow-3xs"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. TAB 3: RECOMMENDATION PRINT VIEW */}
      <div className={viewMode === 'print' ? 'flex flex-col gap-4' : 'hidden'}>
        <RecommendationPrintView
          selectedBundle={bundleMgmt.selectedBundle}
          bundlesList={bundleMgmt.bundlesList}
          onSelectBundle={bundleMgmt.setSelectedBundle}
          onViewDetails={setSelectedRequestDetails}
          onRefresh={() => bundleMgmt.fetchBundles()}
          isRefreshing={bundleMgmt.loading}
          onLockBundle={(id) => handleRequestLockBundle(id)}
          onRemoveFromBundle={handleRemoveFromBundle}
        />
      </div>

      {/* 6. MODALS & DIALOGS */}
      {selectedRequestDetails && (
        <DetailsModal
          isOpen={Boolean(selectedRequestDetails)}
          selectedRequest={selectedRequestDetails}
          onClose={() => setSelectedRequestDetails(null)}
        />
      )}

      <RevisionRequestModal
        isOpen={Boolean(revisionTarget)}
        targetItem={revisionTarget}
        onClose={() => setRevisionTarget(null)}
        onSuccess={() => appQueue.fetchSubmittedQueue()}
      />

      <RemoveFromBundleModal
        isOpen={Boolean(removeFromBundleTarget)}
        bundleId={bundleMgmt.selectedBundle?.id || removeFromBundleTarget?.currentBundleId || removeFromBundleTarget?.bundleId || null}
        targetItem={removeFromBundleTarget}
        isLockedBundle={bundleMgmt.selectedBundle?.status === 'LOCKED' || removeFromBundleTarget?.status === 'LOCKED'}
        onClose={() => setRemoveFromBundleTarget(null)}
        onSuccess={() => {
          Promise.all([
            bundleMgmt.fetchBundles(),
            appQueue.fetchSubmittedQueue(),
            fetchAllBundlesForKpi()
          ]).catch(err => console.error("Error refreshing background data:", err));

          redirectTargetRef.current = 'list';
          setStatusModalStatus('success');
          setStatusModalTitle('Berhasil Dikeluarkan');
          setStatusModalMessage('Permohonan telah dikeluarkan dari bundle terkunci dan riwayat versi telah diperbarui.');
          setStatusModalOpen(true);

          if (autoRedirectTimerRef.current) clearTimeout(autoRedirectTimerRef.current);
          autoRedirectTimerRef.current = setTimeout(() => {
            executeHybridRedirect();
          }, 400);
        }}
      />

      <LockBundleConfirmationModal
        isOpen={Boolean(lockConfirmationBundle)}
        bundle={lockConfirmationBundle}
        onClose={() => setLockConfirmationBundle(null)}
        onConfirm={(bundleId) => handleLockBundleWithModal(bundleId)}
        isLoading={statusModalStatus === 'loading'}
      />

      <ActionStatusModal
        isOpen={statusModalOpen}
        status={statusModalStatus}
        title={statusModalTitle}
        message={statusModalMessage}
        confirmText={
          redirectTargetRef.current === 'list'
            ? 'Lihat Antrean'
            : redirectTargetRef.current === 'bundle'
              ? 'Lihat Bundle'
              : redirectTargetRef.current === 'bundle-history'
                ? 'Cetak Rekomendasi'
                : 'Tutup'
        }
        onClose={executeHybridRedirect}
      />

      <BundleSnapshotDrawer
        isOpen={Boolean(versionDrawerBundle)}
        onClose={() => setVersionDrawerBundle(null)}
        bundle={versionDrawerBundle}
      />
    </div>
  );
}
