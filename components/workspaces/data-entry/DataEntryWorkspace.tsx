"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Plus, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { useSession } from "next-auth/react";
import { useDashboard } from '@/context/DashboardContext';
import {
  resubmitApplication,
  getActiveApplications,
  getAllApplicationsForKpi,
  toggleFavoriteApplication
} from '@/app/actions/data-entry';
import { DetailsModal } from '@/components/workspaces/shared/DetailsModal';
import { ActionStatusModal } from '@/components/workspaces/shared/ActionStatusModal';
import { ApplicationSnapshotDrawer } from '@/components/workspaces/shared/ApplicationSnapshotDrawer';
import { EmptyDataAnimation } from '@/components/workspaces/shared/EmptyDataAnimation';
import { RevisionAlertBanner } from '@/components/workspaces/shared/RevisionAlertBanner';
import { JENIS_OPTIONS } from '@/components/workspaces/shared/constants';
import { DataEntrySkeleton } from '@/components/skeletons/DataEntrySkeleton';
import { DataEntryListSkeleton } from '@/components/skeletons/DataEntryListSkeleton';
import { DataEntryKpiStrip } from './statistic-application/DataEntryKpiStrip';
import { useApplicationStatistics } from './statistic-application/useApplicationStatistics';
import { DataEntryTableRow } from './table-application/DataEntryTableRow';
import { DataEntryToolbar } from './table-application/DataEntryToolbar';
import { useListApplication } from './table-application/useListApplication';
import { CreateApplication } from './create-application/CreateApplication';
import { EditApplication } from './edit-application/EditApplication';

export default function PenginputWorkspace() {
  const { data: session } = useSession();
  const { showConfirm, refreshFavorites } = useDashboard();
  const [list, setList] = useState<any[]>([]);
  const [globalKpiList, setGlobalKpiList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Next.js Router & Query Params sync for ?tab=my-tasks&view=create
  const searchParams = useSearchParams();
  const router = useRouter();
  const viewParam = searchParams.get('view');

  // View switcher state ('list' | 'create' | 'edit') initialized from URL param
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit'>(
    viewParam === 'edit' ? 'edit' : (viewParam === 'create' || viewParam === 'form' ? 'create' : 'list')
  );

  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [duplicateTarget, setDuplicateTarget] = useState<any | null>(null);
  const [snapshotDrawerTarget, setSnapshotDrawerTarget] = useState<any | null>(null);

  // Sync viewMode when URL query params change (e.g. Browser Back/Forward buttons)
  useEffect(() => {
    if (viewParam === 'edit') {
      if (editTarget) setViewMode('edit');
    } else if (viewParam === 'create' || viewParam === 'form') {
      setViewMode('create');
    } else if (!viewParam) {
      // Prevent premature fallback to list view while async router.push is pending for edit
      if (editTarget) return;
      setViewMode('list');
    }
  }, [viewParam, editTarget]);

  // Fallback protection: If viewMode is 'edit' but editTarget is null, revert to 'list' view and clean URL query
  useEffect(() => {
    if (viewMode === 'edit' && !editTarget) {
      setViewMode('list');
      router.replace('/?tab=my-tasks', { scroll: false });
    }
  }, [viewMode, editTarget, router]);

  // Helper to switch view and update URL query param
  const switchViewMode = useCallback((mode: 'list' | 'create' | 'edit') => {
    setViewMode(mode);
    if (mode === 'create') {
      router.push('/?tab=my-tasks&view=create', { scroll: false });
    } else if (mode === 'edit') {
      router.push('/?tab=my-tasks&view=edit', { scroll: false });
    } else {
      router.push('/?tab=my-tasks', { scroll: false });
    }
  }, [router]);

  const handleCloseDetails = useCallback(() => {
    setSelectedRequest(null);
  }, []);

  const handleDuplicate = useCallback((targetItem: any) => {
    setDuplicateTarget(targetItem);
    switchViewMode('create');
  }, [switchViewMode]);

  const handleEdit = useCallback((targetItem: any) => {
    setEditTarget(targetItem);
    switchViewMode('edit');
  }, [switchViewMode]);

  const handleCloseEdit = useCallback(() => {
    setEditTarget(null);
    setViewMode('list');
    router.replace('/?tab=my-tasks', { scroll: false });
  }, [router]);

  const handleCancelCreate = useCallback(() => {
    setDuplicateTarget(null);
    setViewMode('list');
    router.replace('/?tab=my-tasks', { scroll: false });
  }, [router]);

  // Status Modal State
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusModalStatus, setStatusModalStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusModalTitle, setStatusModalTitle] = useState('');
  const [statusModalMessage, setStatusModalMessage] = useState('');

  // Table List & Filters Logic Hook
  const {
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    filterJenisLayanan,
    setFilterJenisLayanan,
    sortBy,
    setSortBy,
    displayMode,
    setDisplayMode,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    copiedText,
    handleCopy,
    modeBaseList,
    jenisCounts,
    filteredAndSortedList,
    paginatedList,
    totalPages,
  } = useListApplication({ list });

  // Transform global KPI list based on displayMode ('permohonan' vs 'pemohon')
  const kpiBaseList = useMemo(() => {
    const rawKpiList = globalKpiList.length > 0 ? globalKpiList : list;
    if (displayMode === 'permohonan') return rawKpiList;

    return rawKpiList.flatMap((item) => {
      const isPartial = item.applicationType === 'PARTIAL_MUTATION' || item.applicationType === 'MUTASI_SEBAGIAN' || item.jenisPermohonan === 'MUTASI_SEBAGIAN';
      const targets = (item.targetData && item.targetData.length > 0) ? item.targetData : (item.dataBaru || []);

      if (isPartial && targets.length > 0) {
        return targets.map((td: any, idx: number) => ({
          ...item,
          uniqueRowKey: `${item.id}-pecahan-${idx}`,
          displayOwnerName: td.ownerName || td.namaPemilikBaru || item.ownerName,
          isPecahanRow: true,
          pecahanIndex: idx + 1,
          totalPecahan: targets.length,
        }));
      }
      return [{ ...item, uniqueRowKey: item.id }];
    });
  }, [globalKpiList, list, displayMode]);

  // Application Statistics Calculation Hook (using global database applications & active displayMode for complete KPI)
  const appMetrics = useApplicationStatistics(kpiBaseList);

  // Load permohonan data
  const fetchData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setListLoading(true);
    }
    try {
      const [resActive, resKpi] = await Promise.all([
        getActiveApplications(),
        getAllApplicationsForKpi()
      ]);

      if (resKpi.success) {
        setGlobalKpiList(resKpi.list || []);
      }

      if (resActive.success) {
        const rawList = resActive.list || [];
        const normalized = rawList.map((item: any) => {
          const previousData = Array.isArray(item.previousData) ? item.previousData : (Array.isArray(item.dataLama) ? item.dataLama : []);
          const targetData = Array.isArray(item.targetData) ? item.targetData : (Array.isArray(item.dataBaru) ? item.dataBaru : []);
          const firstPrev = previousData[0] || {};
          const firstTarget = targetData[0] || {};
          const appType = item.applicationType || item.jenisPermohonan || '';

          const isPartialMutation = appType === 'PARTIAL_MUTATION' || appType === 'MUTASI_SEBAGIAN';
          const isReactivation = appType === 'REACTIVATION' || appType === 'PENGAKTIFAN';

          let calculatedNop = item.nop || '';
          if (appType === 'NEW_TAX_OBJECT' || appType === 'OBJEK_PAJAK_BARU') {
            calculatedNop = firstTarget.nopTemporary || firstTarget.nop || item.nop || '-';
          } else {
            calculatedNop = firstPrev.nop || item.nop || '-';
          }

          let calculatedOwnerName = '';
          if (isReactivation) {
            calculatedOwnerName = firstPrev.ownerName || firstPrev.namaPemilikLama || '-';
          } else if (isPartialMutation) {
            const firstName = firstTarget.ownerName || firstTarget.namaPemilikBaru || '';
            const totalCount = targetData.length;
            if (firstName && totalCount > 1) {
              calculatedOwnerName = `${firstName} (${totalCount})`;
            } else {
              calculatedOwnerName = firstName || '-';
            }
          } else {
            if (targetData.length > 0) {
              calculatedOwnerName = targetData
                .map((t: any) => t.ownerName || t.namaPemilikBaru)
                .filter(Boolean)
                .join(', ');
            }
            if (!calculatedOwnerName) {
              calculatedOwnerName = '-';
            }
          }

          return {
            ...item,
            applicationType: appType,
            applicationNumber: item.applicationNumber || item.nomorPelayanan || '-',
            serviceNumberDate: item.serviceNumberDate || item.tanggalNoPelayanan || item.createdAt,
            completionDate: item.completionDate || item.tanggalPenyelesaian,
            nop: calculatedNop,
            ownerName: calculatedOwnerName,
            previousData,
            targetData,
          };
        });
        setList(normalized);
      } else {
        console.error(resActive.error);
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
      const res = await toggleFavoriteApplication(id);
      if (!res.success) {
        console.error(res.error || 'Gagal mengubah status favorit.');
        setList(originalList);
      } else {
        refreshFavorites();
      }
    } catch (err) {
      console.error('Gagal mengubah status favorit.', err);
      setList(originalList);
    }
  }, [refreshFavorites]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
          const res = await resubmitApplication(id);
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

  return (
    <div id="data-entry-workspace-root" className="w-full flex flex-col gap-6 animate-fadeIn select-none font-sans">
      {/* SKELETON PLACEHOLDER */}
      {listLoading && viewMode === 'list' && <DataEntryListSkeleton />}
      {listLoading && (viewMode === 'create' || viewMode === 'edit') && <DataEntrySkeleton />}

      {/* Main Content Interface */}
      <div className={`flex flex-col gap-6 ${listLoading ? 'hidden' : ''}`}>

        {/* Reusable Revision Alert Banner */}
        <RevisionAlertBanner
          count={appMetrics.revision}
          onAction={() => {
            setFilterStatus('REVISION');
            setCurrentPage(1);
          }}
        />

        {/* ==================== VIEW MODE: LIST ==================== */}
        {viewMode === 'list' && (
          <div className="flex flex-col gap-4">

            {/* HEADER RUANG KERJA (TOP BANNER) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none font-sans">
              <div>
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">Ruang Kerja Saya</h1>
              </div>

              <div className="flex items-center gap-2">
                {/* Action Header: Tombol Ajukan Permohonan */}
                <button
                  onClick={() => switchViewMode('create')}
                  className="h-9 px-3.5 bg-[#00a389] hover:bg-[#008f78] active:bg-[#007a67] text-white rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-3xs font-sans shrink-0"
                  title="Tambah Permohonan / Entri Baru"
                >
                  <Plus className="w-3.5 h-3.5 shrink-0" />
                  <span>Ajukan Permohonan</span>
                </button>

                {/* Action Header: Tombol Refresh Data */}
                <button
                  onClick={() => fetchData(true)}
                  disabled={isRefreshing}
                  className="h-9 px-3.5 bg-white border border-slate-200/90 hover:border-slate-300 rounded-md flex items-center gap-2 text-slate-700 hover:text-slate-900 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 shadow-3xs"
                  title="Refresh Seluruh Data Workspace"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#00a389]' : ''}`} />
                </button>
              </div>
            </div>

            {/* TIER 1: STATS KPI STRIP */}
            <DataEntryKpiStrip
              metrics={appMetrics}
              displayMode={displayMode}
            />

            {/* THIN DIVIDER LINE BELOW KPI STRIP */}
            <div className="w-full border-b border-slate-200/80 my-0.5" />

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
              jenisCounts={jenisCounts}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              displayMode={displayMode}
              onSwitchDisplayMode={setDisplayMode}
              isRefreshing={isRefreshing}
              onRefresh={() => fetchData(true)}
              jenisOptions={JENIS_OPTIONS}
              onAddNew={() => switchViewMode('create')}
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
                        {paginatedList.length === 0 ? (
                          <tr>
                            <td colSpan={12} className="py-10 text-center select-none font-sans">
                              <EmptyDataAnimation
                                title={searchQuery ? 'Tidak ada permohonan yang sesuai' : 'Belum ada data permohonan'}
                                description={searchQuery ? 'Coba ubah kata kunci pencarian atau reset filter status.' : 'Klik "+ Tambah Entri Baru" di atas untuk memulai.'}
                                action={
                                  !searchQuery ? (
                                    <button
                                      onClick={() => switchViewMode('create')}
                                      className="px-3.5 py-2 bg-[#00a389] hover:bg-[#008f78] text-white rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-3xs font-sans"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                      <span>Tambah Entri Baru</span>
                                    </button>
                                  ) : undefined
                                }
                              />
                            </td>
                          </tr>
                        ) : (
                          paginatedList.map((item, idx) => (
                            <DataEntryTableRow
                              key={item.uniqueRowKey || `${item.id}-${idx}`}
                              item={item}
                              globalIndex={(currentPage - 1) * itemsPerPage + idx + 1}
                              searchQuery={searchQuery}
                              copiedText={copiedText}
                              sessionUserName={session?.user?.name}
                              loading={loading}
                              onSelect={setSelectedRequest}
                              onToggleFavorite={handleToggleFavorite}
                              onCopy={handleCopy}
                              onEdit={handleEdit}
                              onDuplicate={handleDuplicate}
                              onViewSnapshots={setSnapshotDrawerTarget}
                            />
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Table Footer / Pagination */}
                  <div className="px-5 py-3.5 border-t border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 select-none shrink-0 mt-auto">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-semibold text-slate-500 font-sans">
                        {filteredAndSortedList.length > 0
                          ? `Menampilkan ${((currentPage - 1) * itemsPerPage) + 1}–${Math.min(currentPage * itemsPerPage, filteredAndSortedList.length)} dari ${filteredAndSortedList.length} ${displayMode === 'pemohon' ? 'entri pemohon' : 'permohonan'}`
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
                          disabled={currentPage === 1}
                          className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-all cursor-pointer shadow-3xs"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
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
                                className={`w-7 h-7 rounded-md text-xs font-bold transition-all cursor-pointer ${currentPage === page
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
                          disabled={currentPage === totalPages}
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

        {/* ==================== VIEW MODE: CREATE ==================== */}
        {viewMode === 'create' && (
          <CreateApplication
            onSuccess={() => {
              setDuplicateTarget(null);
              switchViewMode('list');
              fetchData();
            }}
            onCancel={handleCancelCreate}
            initialData={duplicateTarget}
          />
        )}

        {/* ==================== VIEW MODE: EDIT ==================== */}
        {viewMode === 'edit' && editTarget && (
          <EditApplication
            editTarget={editTarget}
            onSuccess={() => {
              handleCloseEdit();
              fetchData();
            }}
            onCancel={handleCloseEdit}
          />
        )}
      </div>

      {/* Details Slide-Over / Modal */}
      {selectedRequest && (
        <DetailsModal
          isOpen={!!selectedRequest}
          selectedRequest={selectedRequest}
          onClose={handleCloseDetails}
        />
      )}

      {/* Application Snapshot & Audit History Drawer */}
      <ApplicationSnapshotDrawer
        isOpen={!!snapshotDrawerTarget}
        application={snapshotDrawerTarget}
        onClose={() => setSnapshotDrawerTarget(null)}
      />

      {/* Global Status Action Modal */}
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
