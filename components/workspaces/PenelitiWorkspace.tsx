"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  Boxes, FileText, Lock, Printer,
  ArrowRight, Trash, Plus, Search, AlertCircle,
  CheckCircle, Clock, X, AlertTriangle, Star,
  FileSpreadsheet, Filter, Check, ChevronLeft, ChevronRight,
  User, Hash
} from 'lucide-react';
import {
  getSubmittedPermohonan,
  mintaRevisi,
  createBundle,
  getBundles,
  addPermohonanToBundle,
  removePermohonanFromBundle,
  lockBundle,
  getPendingKoreksiForPermohonan
} from '@/app/actions/peneliti';
import { useDashboard } from '@/context/DashboardContext';
import { SkeletonBox, SkeletonText, SkeletonBadge, SkeletonProgressBar } from '@/components/skeletons/SkeletonBase';

/** Skeleton untuk PenelitiWorkspace — premium tabbed layout */
export function PenelitiSkeleton() {
  return (
    <div className="w-full font-sans select-none flex flex-col gap-6 animate-fadeIn">
      {/* Header card skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#f3f6f9] p-5 rounded-2xl shadow-sm">
        <SkeletonBox width="w-56" height="h-5" rounded="rounded-full" />
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1">
            <SkeletonBox width="w-28" height="h-7" rounded="rounded-lg" />
            <SkeletonBox width="w-24" height="h-7" rounded="rounded-lg" />
            <SkeletonBox width="w-28" height="h-7" rounded="rounded-lg" />
          </div>
        </div>
      </div>

      {/* Content card skeleton (default: table) */}
      <div className="bg-[#f3f6f9] rounded-2xl shadow-sm flex flex-col overflow-hidden min-h-[500px]">
        {/* Action row: search */}
        <div className="p-5 border-b border-gray-200/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <SkeletonBox width="w-36" height="h-4" rounded="rounded-full" />
          <div className="w-72 h-8 bg-gray-200 animate-pulse rounded-lg" />
        </div>

        {/* Table */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-gray-200/60">
                {['No', '⭐', 'Tanggal', 'No. Pelayanan / NOP', 'Wajib Pajak', 'Layanan', 'Aksi'].map((h) => (
                  <th key={h} className="py-3 px-5">
                    <SkeletonText width="w-16" height="h-2.5" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="py-4 px-5 w-12"><SkeletonText width="w-4" height="h-3" /></td>
                  <td className="py-4 px-5 w-10 text-center"><SkeletonText width="w-4" height="h-3" /></td>
                  <td className="py-4 px-5"><SkeletonText width="w-20" height="h-3" /></td>
                  <td className="py-4 px-5 min-w-[220px]">
                    <div className="flex flex-col gap-1.5">
                      <SkeletonText width="w-36" height="h-3" />
                      <SkeletonText width="w-28" height="h-2.5" />
                    </div>
                  </td>
                  <td className="py-4 px-5"><SkeletonText width={i % 2 === 0 ? 'w-28' : 'w-24'} height="h-3" /></td>
                  <td className="py-4 px-5"><SkeletonBadge width="w-10" /></td>
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-6 rounded-lg bg-gray-200 animate-pulse" />
                      <div className="w-12 h-6 rounded-lg bg-gray-200 animate-pulse" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const formatNop = (nop: string) => {
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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search & Pagination States for Submitted Queue
  const [searchSubmittedQuery, setSearchSubmittedQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [filterJenisLayanan, setFilterJenisLayanan] = useState<string>('ALL');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [currentSubmittedPage, setCurrentSubmittedPage] = useState(1);
  const itemsPerSubmittedPage = 10;

  // Modals / Dialogs
  const [revisionTarget, setRevisionTarget] = useState<any | null>(null);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [extractionTarget, setExtractionTarget] = useState<any | null>(null);
  const [extractionNotes, setExtractionNotes] = useState('');

  // Local verification checks for frozen state
  const [pendingKoreksiMap, setPendingKoreksiMap] = useState<Record<string, boolean>>({});

  // Reset pagination when search or filters change
  useEffect(() => {
    setCurrentSubmittedPage(1);
  }, [searchSubmittedQuery, filterJenisLayanan]);

  // Search, Filter & Pagination States for Bundles Queue
  const [searchBundleQuery, setSearchBundleQuery] = useState('');
  const [isBundleSearchFocused, setIsBundleSearchFocused] = useState(false);
  const [currentBundlePage, setCurrentBundlePage] = useState(1);
  const itemsPerBundlePage = 8; // 8 bundle per halaman (2 baris x 4 kolom grid)

  // Reset pagination when search bundle changes
  useEffect(() => {
    setCurrentBundlePage(1);
  }, [searchBundleQuery]);

  // Filter Bundles Client-side
  const filteredBundlesList = useMemo(() => {
    return bundlesList.filter((b) => {
      const matchesSearch = b.nomorBundle.toLowerCase().includes(searchBundleQuery.toLowerCase()) ||
        (b.jenisPermohonan && b.jenisPermohonan.toLowerCase().includes(searchBundleQuery.toLowerCase()));
      return matchesSearch;
    });
  }, [bundlesList, searchBundleQuery]);

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
  const fetchData = async () => {
    setListLoading(true);
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
  }, [selectedBundle]);

  // Create Bundle Action
  const handleCreateBundle = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res: any = await createBundle();
      if (res.success) {
        setSuccess(`Bundle Baru ${res.bundle?.nomorBundle} Berhasil Dibuat!`);
        await fetchData();
        // Select the newly created bundle
        if (res.bundle) {
          setSelectedBundle({ ...res.bundle, permohonan: [] });
        }
        setTimeout(() => setSuccess(''), 4000);
      } else {
        setError(res.error || 'Gagal membuat bundle.');
      }
    } catch (e: any) {
      setError(e.message || 'Kesalahan sistem.');
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

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res: any = await addPermohonanToBundle(selectedBundle.id, permohonanId);
      if (res.success) {
        setSuccess('Permohonan berhasil ditambahkan ke dalam bundle!');
        await fetchData();
        setTimeout(() => setSuccess(''), 4000);
      } else {
        setError(res.error || 'Gagal menambahkan permohonan.');
      }
    } catch (e: any) {
      setError(e.message || 'Kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  // Remove Permohonan from Bundle (Draft or Locked)
  const handleRemoveFromBundle = async (targetOverride?: any) => {
    const target = targetOverride || extractionTarget;
    if (!selectedBundle || !target) return;
    setLoading(true);
    setError('');

    try {
      const res: any = await removePermohonanFromBundle(
        selectedBundle.id,
        target.id,
        extractionNotes
      );

      if (res.success) {
        if (res.status === 'REMOVED_IMMEDIATELY') {
          showConfirm({
            title: 'Berhasil Dikeluarkan',
            message: 'Permohonan berhasil dikeluarkan dari bundle draf!',
            onConfirm: () => { },
            confirmText: 'Selesai',
            cancelText: 'Tutup'
          });
        } else if (res.status === 'PENDING_APPROVAL') {
          showConfirm({
            title: 'Koreksi Diajukan',
            message: 'Pengajuan koreksi berhasil dikirim! Menunggu keputusan persetujuan dari Supervisor.',
            onConfirm: () => { },
            confirmText: 'Mengerti',
            cancelText: 'Tutup'
          });
        }
        setExtractionTarget(null);
        setExtractionNotes('');
        await fetchData();
      } else {
        setError(res.error || 'Gagal mengeluarkan permohonan.');
      }
    } catch (e: any) {
      setError(e.message || 'Kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  // Minta Revisi Action
  const handleMintaRevisi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionTarget || !revisionNotes.trim()) return;
    setLoading(true);
    setError('');

    try {
      const res: any = await mintaRevisi(revisionTarget.id, revisionNotes);
      if (res.success) {
        showConfirm({
          title: 'Permintaan Revisi Terkirim',
          message: `Status permohonan ${revisionTarget.nomorPermohonan} berhasil dialihkan ke REVISION. Catatan pengembalian revisi telah dikirimkan ke Penginput dan Wajib Pajak terkait.`,
          onConfirm: () => { },
          confirmText: 'Selesai',
          cancelText: 'Tutup'
        });
        setRevisionTarget(null);
        setRevisionNotes('');
        await fetchData();
      } else {
        setError(res.error || 'Gagal memproses permintaan revisi.');
      }
    } catch (e: any) {
      setError(e.message || 'Kesalahan sistem.');
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
        setLoading(true);
        setError('');
        setSuccess('');

        try {
          const res: any = await lockBundle(selectedBundle.id);
          if (res.success) {
            setSuccess(`Bundle ${selectedBundle.nomorBundle} berhasil dikunci dan dialirkan ke Pengarsip!`);
            await fetchData();
            setTimeout(() => setSuccess(''), 5000);
          } else {
            setError(res.error || 'Gagal mengunci bundle.');
          }
        } catch (e: any) {
          setError(e.message || 'Kesalahan sistem.');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Filter Submitted Queue Client-side
  const filteredSubmittedList = submittedList.filter((item) => {
    const matchesSearch =
      item.namaWajibPajak.toLowerCase().includes(searchSubmittedQuery.toLowerCase()) ||
      item.nop.includes(searchSubmittedQuery) ||
      item.nomorPermohonan.toLowerCase().includes(searchSubmittedQuery.toLowerCase()) ||
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

  return (
    <div id="peneliti-board-root" className="w-full font-sans select-none animate-fadeIn flex flex-col gap-6">

      {/* Show full skeleton during initial data load */}
      {listLoading && <PenelitiSkeleton />}

      {/* Hide real content while skeleton is visible */}
      <div className={`flex flex-col gap-6 ${listLoading ? 'hidden' : ''}`}>

        {/* Header with View switcher toggle — aligned with Penginput style */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] p-5 rounded-2xl shadow-md shadow-indigo-200/20 transition-all duration-300">
          <div className="flex items-center gap-2.5 text-[11px] font-bold tracking-wider font-display select-none">
            <div className="flex items-center gap-1.5 text-[#2c333f]/65 hover:text-[#2c333f] transition-colors">
              <span className="capitalize">my tasks</span>
            </div>
            <span className="text-[#2c333f]/40 font-medium select-none">&gt;</span>
            <div className="flex items-center gap-1.5 bg-white/40 border border-white/50 px-2.5 py-1 rounded-lg shadow-3xs animate-fadeIn">
              <span className="font-extrabold capitalize text-[#2c333f]">
                {viewMode === 'bundle' ? 'daftar bundle' : viewMode === 'list' ? 'daftar antrean' : 'kunci & cetak'}
              </span>
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
                <span>Daftar bundle</span>
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
          <div className="bg-[#f3f6f9] rounded-2xl shadow-sm flex flex-col overflow-hidden min-h-[500px]">
            {/* Active Bundle Banner */}
            <div className="px-5 py-3 border-b border-gray-200/60 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${selectedBundle ? 'bg-indigo-600' : 'bg-amber-500'}`} />
                <span className="text-xs font-semibold text-gray-700">
                  {selectedBundle
                    ? `Bundle Aktif Terpilih: ${selectedBundle.nomorBundle} (${selectedBundle.status})`
                    : 'Belum ada bundle yang aktif.'}
                </span>
              </div>
              {!selectedBundle ? (
                <span className="text-[10px] text-amber-600 font-bold bg-amber-50 border border-amber-100 px-2.5 py-0.5 rounded-full self-start sm:self-auto">
                  Pilih/buat bundle di tab 'Buat bundle' terlebih dahulu untuk memasukkan berkas
                </span>
              ) : selectedBundle.status !== 'DRAFT' ? (
                <span className="text-[10px] text-red-600 font-bold bg-red-50 border border-red-100 px-2.5 py-0.5 rounded-full self-start sm:self-auto">
                  Status bundle {selectedBundle.status} tidak dapat ditambah berkas baru
                </span>
              ) : (
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full self-start sm:self-auto">
                  Siap memasukkan berkas ke bundle ini
                </span>
              )}
            </div>

            {/* Action Row: Search & Filter — styled identical to Penginput */}
            <div className="p-5 border-b border-gray-200/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-extrabold text-[13px] capitalize tracking-wider text-slate-700 font-display">
                  Antrean Permohonan Masuk
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
                <div className={`relative w-full sm:w-72 p-[1.5px] rounded-lg transition-all duration-300 ${isSearchFocused ? 'bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] shadow-xs' : 'bg-slate-200/90'}`}>
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
                  <input
                    type="text"
                    value={searchSubmittedQuery}
                    onChange={(e) => setSearchSubmittedQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className="w-full pl-8.5 pr-8 py-1.5 bg-white border-transparent rounded-[7px] text-xs font-semibold text-gray-755 placeholder-gray-400 focus:outline-none transition-all"
                    placeholder="Cari nomor pelayanan, NOP, WP..."
                  />
                  {searchSubmittedQuery && (
                    <button onClick={() => setSearchSubmittedQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-655 z-10">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Jenis Layanan (Popover Icon) — identical to Penginput */}
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
              </div>
            </div>

            {/* Table — Columns matching Penginput */}
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-extrabold text-slate-450 uppercase tracking-wider text-left border-b border-slate-200">
                    <th className="py-3 px-5 w-12 text-center">No</th>
                    <th className="py-3 px-5 w-10 text-center select-none">⭐</th>
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
                  {filteredSubmittedList.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-xs text-gray-400 italic">
                        Belum ada data permohonan yang sesuai.
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
                        <tr key={item.id} className="hover:bg-indigo-50/20 transition-all text-xs font-semibold text-gray-700">
                          <td className="py-4 px-5 text-center text-xs font-bold text-gray-400 font-mono">{itemNumber}</td>
                          <td className="py-4 px-5 text-center">
                            {item.isFavorite ? (
                              <Star className="w-4 h-4 text-amber-500 fill-amber-500 inline shadow-3xs" />
                            ) : (
                              <Star className="w-4 h-4 text-slate-300 inline" />
                            )}
                          </td>
                          <td className="py-4 px-5 text-gray-500 font-semibold">{nopolDate}</td>
                          <td className="py-4 px-5 text-gray-500 font-semibold">{penyelesaianDate}</td>
                          <td className="py-4 px-5">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-bold text-[#1e2022] text-[12px]">{item.nomorPelayanan || item.nomorPermohonan}</span>
                              <span className="text-[10px] text-gray-400 font-semibold font-mono">{formatNop(item.nop)}</span>
                            </div>
                          </td>
                          <td className="py-4 px-5 text-[#1e2022]">{item.namaWajibPajak}</td>
                          <td className="py-4 px-5">
                            <span
                              className="text-[9px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded capitalize font-sans tracking-wide select-none"
                              title={item.jenisPermohonan.replace(/_/g, ' ')}
                            >
                              {getAbbreviatedJenis(item.jenisPermohonan)}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-center">
                            {(() => {
                              const s = item.status;
                              const cfg: Record<string, { bg: string; text: string; dot: string }> = {
                                SUBMITTED: { bg: 'bg-sky-100', text: 'text-sky-700', dot: 'bg-sky-500' },
                                REVISION: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500 animate-pulse' },
                                BUNDLED: { bg: 'bg-violet-100', text: 'text-violet-700', dot: 'bg-violet-500' },
                                ARCHIVED: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
                                COMPLETED: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
                                REJECTED: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
                              };
                              const c = cfg[s] ?? cfg.SUBMITTED;
                              return (
                                <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded-full capitalize ${c.bg} ${c.text}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />{s.toLowerCase()}
                                </span>
                              );
                            })()}
                          </td>
                          <td className="py-4 px-5 text-right pr-6">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleAddToBundle(item.id)}
                                disabled={loading || !selectedBundle || selectedBundle.status !== 'DRAFT'}
                                className="p-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg shadow-sm transition-all cursor-pointer flex items-center justify-center shrink-0"
                                title="Masukkan ke bundle"
                              >
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setRevisionTarget(item)}
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

            {/* Pagination */}
            {totalSubmittedPages > 1 && (
              <div className="px-5 py-3 border-t border-gray-200/60 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-gray-400">
                  Menampilkan {((activeSubmittedPage - 1) * itemsPerSubmittedPage) + 1} - {Math.min(activeSubmittedPage * itemsPerSubmittedPage, filteredSubmittedList.length)} dari {filteredSubmittedList.length} permohonan
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCurrentSubmittedPage(prev => Math.max(prev - 1, 1))}
                    disabled={activeSubmittedPage === 1}
                    className="p-1.5 rounded-lg border-transparent bg-white text-gray-500 hover:bg-[#f1f5f9] disabled:opacity-40 transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  {Array.from({ length: totalSubmittedPages }, (_, i) => i + 1).map((page) => (
                    <button
                      type="button"
                      key={page}
                      onClick={() => setCurrentSubmittedPage(page)}
                      className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${activeSubmittedPage === page
                        ? 'bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] text-[#1e2022] font-extrabold shadow-sm scale-105 z-10'
                        : 'border-transparent bg-white text-gray-500 hover:bg-[#f1f5f9]'
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCurrentSubmittedPage(prev => Math.min(prev + 1, totalSubmittedPages))}
                    disabled={activeSubmittedPage === totalSubmittedPages}
                    className="p-1.5 rounded-lg border-transparent bg-white text-gray-500 hover:bg-[#f1f5f9] disabled:opacity-40 transition-all cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== VIEW MODE: BUNDLE (Buat Bundle) ==================== */}
        {viewMode === 'bundle' && (
          <div className="bg-[#f3f6f9] border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6 min-h-[500px]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4 select-none">
              <div>
                <h2 className="font-extrabold text-[13px] capitalize tracking-wider text-slate-700 font-display">
                  Daftar Bundle Operasional
                </h2>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
                {/* Search input for Bundles */}
                <div className={`relative w-full sm:w-56 p-[1.5px] rounded-lg transition-all duration-300 ${isBundleSearchFocused ? 'bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] shadow-xs' : 'bg-slate-200/90'}`}>
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 z-10" />
                  <input
                    type="text"
                    value={searchBundleQuery}
                    onChange={(e) => setSearchBundleQuery(e.target.value)}
                    onFocus={() => setIsBundleSearchFocused(true)}
                    onBlur={() => setIsBundleSearchFocused(false)}
                    className="w-full pl-7.5 pr-8 py-1 bg-white border-transparent rounded-[7px] text-[11px] font-semibold text-gray-755 placeholder-gray-400 focus:outline-none transition-all"
                    placeholder="Cari nomor bundle, jenis..."
                  />
                  {searchBundleQuery && (
                    <button onClick={() => setSearchBundleQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-655 z-10">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <button
                  onClick={handleCreateBundle}
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Buat</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {paginatedBundlesList.map((b) => {
                const isSelected = selectedBundle?.id === b.id;
                return (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBundle(b)}
                    className={`p-4 rounded-2xl border flex flex-col justify-between gap-3.5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer bg-white relative overflow-hidden group min-h-[110px] ${isSelected
                      ? 'border-indigo-400 shadow-md ring-2 ring-indigo-500/10'
                      : 'border-slate-200 hover:shadow-sm hover:border-slate-350'
                      }`}
                  >
                    {/* Ribbon status miring (DRAFT / LOCKED) */}
                    <div className="absolute top-0 right-0 h-14 w-14 overflow-hidden select-none pointer-events-none z-10">
                      <div className={`absolute transform rotate-45 text-center text-[7px] font-extrabold uppercase py-0.5 w-20 -right-6 top-2 shadow-2xs ${b.status === 'LOCKED'
                        ? 'bg-slate-900 text-white'
                        : 'bg-[#9cb4fe] text-[#2c333f]'
                        }`}>
                        {b.status.toLowerCase()}
                      </div>
                    </div>

                    <div className="space-y-2 pr-6">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-gray-400 font-extrabold capitalize tracking-wider">Nomor Bundle</span>
                        <span className="text-sm font-black text-gray-800 font-mono tracking-tight">{b.nomorBundle}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-indigo-650 font-bold select-none bg-indigo-50 px-2 py-0.5 rounded-lg w-fit border border-indigo-100/50">
                          {b.permohonan.length} berkas
                        </span>
                        <span className="text-[9px] text-slate-500 font-bold capitalize truncate block">
                          {b.jenisPermohonan ? b.jenisPermohonan.replace(/_/g, ' ').toLowerCase() : 'Kosong / Umum'}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-1 select-none animate-fadeIn">
                        <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Aktif</span>
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewMode('print');
                          }}
                          className="text-[9px] text-indigo-600 font-extrabold hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>Kelola & Cetak</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
              {filteredBundlesList.length === 0 && (
                <div className="col-span-full py-20 text-center text-xs text-gray-400 font-medium italic select-none">
                  Tidak ada bundle yang sesuai dengan kriteria pencarian.
                </div>
              )}
            </div>

            {/* Pagination for Bundles */}
            {totalBundlePages > 1 && (
              <div className="px-5 py-3 border-t border-slate-200/55 flex items-center justify-between mt-auto">
                <span className="text-[11px] font-semibold text-gray-400 select-none">
                  Menampilkan {((activeBundlePage - 1) * itemsPerBundlePage) + 1} - {Math.min(activeBundlePage * itemsPerBundlePage, filteredBundlesList.length)} dari {filteredBundlesList.length} bundle
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCurrentBundlePage(prev => Math.max(prev - 1, 1))}
                    disabled={activeBundlePage === 1}
                    className="p-1.5 rounded-lg border-transparent bg-white text-gray-500 hover:bg-[#f1f5f9] disabled:opacity-40 transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  {Array.from({ length: totalBundlePages }, (_, i) => i + 1).map((page) => (
                    <button
                      type="button"
                      key={page}
                      onClick={() => setCurrentBundlePage(page)}
                      className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${activeBundlePage === page
                        ? 'bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] text-[#1e2022] font-extrabold shadow-sm scale-105 z-10'
                        : 'border-transparent bg-white text-gray-500 hover:bg-[#f1f5f9]'
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCurrentBundlePage(prev => Math.min(prev + 1, totalBundlePages))}
                    disabled={activeBundlePage === totalBundlePages}
                    className="p-1.5 rounded-lg border-transparent bg-white text-gray-500 hover:bg-[#f1f5f9] disabled:opacity-40 transition-all cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== VIEW MODE: PRINT (Cetak Surat Pengantar) ==================== */}
        {viewMode === 'print' && (
          <div className="bg-[#f3f6f9] border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6 min-h-[500px]">
            {selectedBundle ? (
              <div className="flex flex-col gap-6 animate-fadeIn">
                {/* Header Info — clean, structural and premium */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-3xs flex flex-col sm:flex-row sm:items-center justify-between gap-5 select-none relative overflow-hidden">
                  <div className="absolute top-0 left-0 h-1.5 w-full bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe]" />
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {(() => {
                        const status = selectedBundle.status;
                        const isLocked = status === 'LOCKED';
                        return (
                          <span className={`text-[8px] font-extrabold capitalize px-2.5 py-0.5 rounded-full border tracking-wide select-none ${
                            isLocked 
                              ? 'bg-slate-900 text-white border-slate-950 shadow-3xs' 
                              : 'bg-indigo-50 border border-indigo-150 text-indigo-700'
                          }`}>
                            bundle {status.toLowerCase()}
                          </span>
                        );
                      })()}
                      <span className="text-[8px] font-bold capitalize bg-slate-100 border border-slate-200 text-slate-500 px-2.5 py-0.5 rounded-full tracking-wide select-none">
                        Layanan: {selectedBundle.jenisPermohonan ? selectedBundle.jenisPermohonan.replace(/_/g, ' ') : 'KOSONG / UMUM'}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400 font-extrabold capitalize tracking-wider select-none">Nomor Bundle</span>
                      <h3 className="text-base md:text-lg font-black text-slate-800 font-mono tracking-wide mt-0.5">{selectedBundle.nomorBundle}</h3>
                    </div>
                  </div>

                  {/* Bundle Lock button */}
                  {selectedBundle.status === 'DRAFT' && (
                    <button
                      onClick={handleLockBundle}
                      disabled={loading || (selectedBundle.permohonan || []).length === 0}
                      className="px-4 py-2.5 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-slate-950 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed self-start sm:self-auto shrink-0 select-none"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Kunci & Kirim</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left: Cetak section */}
                  <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-3xs">
                    <div className="border-b border-slate-100 pb-2">
                      <h4 className="text-[10px] font-extrabold text-indigo-650 tracking-widest capitalize select-none">Cetak Dokumen Fisik</h4>
                    </div>

                    <div className="flex flex-col gap-3">
                      <a
                        href={`/api/pdf/surat-pengantar-bundle/${selectedBundle.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-3 bg-white hover:bg-slate-50 border border-slate-200/80 hover:border-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-between shadow-3xs group/btn select-none"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                            <Printer className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col text-left">
                            <span className="text-xs text-gray-800 font-extrabold">Surat Pengantar</span>
                            <span className="text-[9px] text-gray-400 font-medium font-sans mt-0.5">Manifest bundle pdf</span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover/btn:translate-x-0.5 transition-transform" />
                      </a>
                    </div>
                  </div>

                  {/* Right: Berkas terbundel */}
                  <div className="lg:col-span-8 space-y-3">
                    <div className="flex items-center justify-between pl-1 select-none">
                      <h4 className="text-[11px] font-extrabold text-indigo-650 tracking-widest capitalize">
                        Berkas Terbundel ({(selectedBundle.permohonan || []).length})
                      </h4>
                    </div>

                    <div className="flex flex-col gap-3 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
                      {(selectedBundle.permohonan || []).map((item: any) => {
                        const isMutasiSebagian = item.jenisPermohonan === 'MUTASI_SEBAGIAN';
                        const isFrozen = pendingKoreksiMap[item.id] === true;

                        return (
                          <div
                            key={item.id}
                            className={`border bg-white rounded-2xl flex items-center justify-between gap-4 p-4 transition-all duration-300 border-slate-200/85 hover:shadow-xs hover:border-slate-300 relative overflow-hidden border-l-4 ${isFrozen
                              ? 'bg-amber-50/50 border-amber-300 border-l-amber-500 opacity-95'
                              : 'border-l-indigo-500'
                              }`}
                          >
                            <div className="space-y-2 max-w-[75%]">
                              <div className="flex items-center gap-2 flex-wrap select-none">
                                <span className="text-[10px] text-gray-400 font-extrabold capitalize tracking-wider">nomor permohonan</span>
                                <span className="text-xs font-black text-slate-800 font-mono tracking-wide">{item.nomorPermohonan}</span>
                                {isFrozen && (
                                  <span className="text-[8px] font-extrabold capitalize bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Clock className="w-2.5 h-2.5 shrink-0 animate-pulse" />
                                    Frozen
                                  </span>
                                )}
                              </div>
                              
                              {/* Grid layout for WP & NOP details to replace pipe separator */}
                              <div className="flex flex-col sm:flex-row sm:items-center gap-x-5 gap-y-1 text-[11px] text-gray-500 font-semibold">
                                <div className="flex items-center gap-1.5">
                                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span className="text-gray-400">WP:</span>
                                  <span className="text-slate-700 font-bold">{item.namaWajibPajak}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Hash className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span className="text-gray-400">NOP:</span>
                                  <span className="text-indigo-650 font-bold font-mono tracking-tight">{formatNop(item.nop)}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {/* Kertas Kerja PDF link for Mutasi Sebagian */}
                              {isMutasiSebagian && (
                                <a
                                  href={`/api/pdf/kertas-kerja/${item.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-600 transition-all flex items-center gap-1.5 text-[10px] font-bold select-none shadow-3xs"
                                  title="Cetak Kertas Kerja Mutasi Sebagian"
                                >
                                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                                  <span className="hidden sm:inline">Kertas Kerja</span>
                                </a>
                              )}

                              {/* Extraction Action — clean and modern rounded action button */}
                              <button
                                onClick={() => {
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
                                className="p-2 bg-slate-50 border border-slate-200/60 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 rounded-xl text-slate-400 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
                                title={selectedBundle.status === 'LOCKED' ? "Ajukan keluarkan (acc supervisor)" : "Keluarkan"}
                              >
                                <Trash className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {(selectedBundle.permohonan || []).length === 0 && (
                        <p className="text-xs text-center py-14 bg-white border border-dashed border-slate-200 rounded-2xl text-slate-400 italic">
                          Bundle masih kosong. Silakan masukkan berkas dari tab 'Daftar permohonan'.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Clean & Premium Empty Placeholder */
              <div className="py-24 text-center flex flex-col items-center justify-center gap-4 select-none animate-fadeIn">
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
    </div>
  );
}
