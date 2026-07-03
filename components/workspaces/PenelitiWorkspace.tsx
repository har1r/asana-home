"use client";

import React, { useState, useEffect } from 'react';
import {
  Boxes, FileText, Lock, Printer,
  ArrowRight, Trash, Plus, Search, AlertCircle,
  CheckCircle, Clock, X, AlertTriangle, Star,
  FileSpreadsheet
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
  const [currentSubmittedPage, setCurrentSubmittedPage] = useState(1);
  const itemsPerSubmittedPage = 5;

  // Modals / Dialogs
  const [revisionTarget, setRevisionTarget] = useState<any | null>(null);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [extractionTarget, setExtractionTarget] = useState<any | null>(null);
  const [extractionNotes, setExtractionNotes] = useState('');

  // Local verification checks for frozen state
  const [pendingKoreksiMap, setPendingKoreksiMap] = useState<Record<string, boolean>>({});

  // Reset pagination when search changes
  useEffect(() => {
    setCurrentSubmittedPage(1);
  }, [searchSubmittedQuery]);

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
          alert('Permohonan berhasil dikeluarkan dari bundle draf!');
        } else if (res.status === 'PENDING_APPROVAL') {
          alert('Pengajuan koreksi berhasil dikirim! Menunggu keputusan persetujuan dari Supervisor.');
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
        alert(`Status permohonan ${revisionTarget.nomorPermohonan} berhasil dialihkan ke REVISION.`);
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

    return matchesSearch;
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

        {/* Header with View switcher toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#f3f6f9] p-5 rounded-2xl shadow-sm">
          <div>
            <h2 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5 tracking-tight">
              Workspace Petugas Peneliti
            </h2>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <div className="bg-slate-100 p-1 rounded-xl border-transparent/80 flex items-center">
              <button
                onClick={() => setViewMode('bundle')}
                className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${viewMode === 'bundle' ? 'bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] text-[#2c333f] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <Boxes className="w-3.5 h-3.5" />
                <span>Daftar bundle</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${viewMode === 'list' ? 'bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] text-[#2c333f] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Daftar Antrean</span>
              </button>
              <button
                onClick={() => setViewMode('print')}
                className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${viewMode === 'print' ? 'bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] text-[#2c333f] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
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

            {/* Action Row: Search */}
            <div className="p-5 border-b border-gray-200/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-black text-[11px] uppercase tracking-wider text-slate-700">
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
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f8fafc] border-b border-gray-200/60 text-[10px] font-bold text-gray-400 uppercase tracking-wider select-none">
                    <th className="py-3 px-5 w-12 text-left">No</th>
                    <th className="py-3 px-5 w-10 text-center">⭐</th>
                    <th className="py-3 px-5 w-28 text-left">Tanggal</th>
                    <th className="py-3 px-5 text-left">No. Pelayanan / NOP</th>
                    <th className="py-3 px-5 text-left">Wajib Pajak</th>
                    <th className="py-3 px-5 text-left">Jenis Layanan</th>
                    <th className="py-3 px-5 text-right pr-6">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredSubmittedList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-xs text-gray-400 italic">
                        Belum ada data permohonan yang sesuai.
                      </td>
                    </tr>
                  ) : (
                    paginatedSubmittedList.map((item, index) => {
                      const itemNumber = (activeSubmittedPage - 1) * itemsPerSubmittedPage + index + 1;
                      const tanggalText = new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors text-xs font-semibold text-gray-700">
                          <td className="py-4 px-5 text-gray-400 font-medium">{itemNumber}</td>
                          <td className="py-4 px-5 text-center">
                            {item.isFavorite ? (
                              <Star className="w-4 h-4 text-amber-500 fill-amber-500 inline shadow-3xs" />
                            ) : (
                              <Star className="w-4 h-4 text-slate-300 inline" />
                            )}
                          </td>
                          <td className="py-4 px-5 text-[#1e2022] font-semibold">{tanggalText}</td>
                          <td className="py-4 px-5">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-bold text-[#1e2022] text-[12px]">{item.nomorPelayanan || item.nomorPermohonan}</span>
                              <span className="text-[10px] text-gray-400 font-semibold font-mono">{formatNop(item.nop)}</span>
                            </div>
                          </td>
                          <td className="py-4 px-5 text-[#1e2022]">{item.namaWajibPajak}</td>
                          <td className="py-4 px-5 text-gray-500 font-bold uppercase text-[10px]">
                            {item.jenisPermohonan.replace(/_/g, ' ')}
                          </td>
                          <td className="py-4 px-5 text-right pr-6">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleAddToBundle(item.id)}
                                disabled={loading || !selectedBundle || selectedBundle.status !== 'DRAFT'}
                                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-[10px] rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                title="Masukkan ke bundle"
                              >
                                <span>Masukkan</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => setRevisionTarget(item)}
                                disabled={loading}
                                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 font-bold text-[10px] rounded-lg transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
                              >
                                Revisi
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
                  Menampilkan {((activeSubmittedPage - 1) * itemsPerSubmittedPage) + 1} - {Math.min(activeSubmittedPage * itemsPerSubmittedPage, filteredSubmittedList.length)} dari {filteredSubmittedList.length}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCurrentSubmittedPage(prev => Math.max(prev - 1, 1))}
                    disabled={activeSubmittedPage === 1}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-bold text-[#1e2022] transition-colors disabled:opacity-40 disabled:hover:bg-white cursor-pointer disabled:cursor-not-allowed"
                  >
                    Sebelumnya
                  </button>
                  {Array.from({ length: totalSubmittedPages }, (_, i) => i + 1).map((page) => (
                    <button
                      type="button"
                      key={page}
                      onClick={() => setCurrentSubmittedPage(page)}
                      className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${activeSubmittedPage === page
                        ? 'bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] text-[#1e2022] font-extrabold shadow-sm scale-105 z-10'
                        : 'border border-slate-200 bg-white hover:bg-slate-50 text-gray-500'
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCurrentSubmittedPage(prev => Math.min(prev + 1, totalSubmittedPages))}
                    disabled={activeSubmittedPage === totalSubmittedPages}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-bold text-[#1e2022] transition-colors disabled:opacity-40 disabled:hover:bg-white cursor-pointer disabled:cursor-not-allowed"
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== VIEW MODE: BUNDLE (Buat Bundle) ==================== */}
        {viewMode === 'bundle' && (
          <div className="bg-[#f3f6f9] border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6 min-h-[500px]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 select-none">
              <div>
                <h2 className="text-md font-bold text-gray-900 tracking-tight flex items-center gap-2">
                  <Boxes className="w-5 h-5 text-indigo-600 shrink-0" />
                  Daftar Bundle Operasional
                </h2>
              </div>
              <button
                onClick={handleCreateBundle}
                disabled={loading}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Buat bundle baru</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {bundlesList.map((b) => {
                const isSelected = selectedBundle?.id === b.id;
                return (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBundle(b)}
                    className={`p-3.5 rounded-xl border flex flex-col justify-between gap-2.5 transition-all cursor-pointer bg-white relative overflow-hidden group ${isSelected
                      ? 'border-indigo-400 shadow-sm ring-2 ring-indigo-500/10'
                      : 'border-slate-200 hover:shadow-xs hover:border-slate-300'
                      }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-extrabold text-gray-800">{b.nomorBundle}</span>
                        <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full border ${b.status === 'LOCKED' ? 'bg-slate-900 text-white border-slate-950' : 'bg-indigo-100 text-indigo-800 border-indigo-200'}`}>
                          {b.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-semibold truncate">
                        {b.permohonan.length} berkas • {b.jenisPermohonan ? b.jenisPermohonan.replace(/_/g, ' ') : 'KOSONG / UMUM'}
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
                          className="text-[9px] text-indigo-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>Kelola & Cetak</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
              {bundlesList.length === 0 && (
                <div className="col-span-full py-20 text-center text-xs text-gray-400 font-medium italic select-none">
                  Belum ada bundle terdaftar. Silakan buat baru!
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== VIEW MODE: PRINT (Cetak Surat Pengantar) ==================== */}
        {viewMode === 'print' && (
          <div className="bg-[#f3f6f9] border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6 min-h-[500px]">
            {selectedBundle ? (
              <div className="flex flex-col gap-6">
                {/* Header Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
                  <div>
                    <span className="text-[9px] font-extrabold uppercase bg-indigo-50 border border-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full">
                      Bundle {selectedBundle.status}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 tracking-tight mt-2">{selectedBundle.nomorBundle}</h3>
                    <p className="text-xs text-gray-400 font-semibold mt-1">
                      Layanan homogen: <strong className="text-gray-600">{selectedBundle.jenisPermohonan ? selectedBundle.jenisPermohonan.replace(/_/g, ' ') : 'belum ditentukan (homogen)'}</strong>
                    </p>
                  </div>

                  {/* Bundle Lock button */}
                  {selectedBundle.status === 'DRAFT' && (
                    <button
                      onClick={handleLockBundle}
                      disabled={loading || (selectedBundle.permohonan || []).length === 0}
                      className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed self-start sm:self-auto"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Kunci & Kirim ke Pengarsip</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left: Cetak section */}
                  <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 space-y-4 h-fit">
                    <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Cetak Dokumen Fisik (PDF)</h4>

                    <div className="flex flex-col gap-2.5">
                      <a
                        href={`/api/pdf/surat-pengantar-bundle/${selectedBundle.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-[11px] rounded-xl transition-all flex items-center justify-between shadow-3xs"
                      >
                        <div className="flex items-center gap-2">
                          <Printer className="w-4 h-4 text-indigo-600" />
                          <span>Surat Pengantar Bundle</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                      </a>
                    </div>
                  </div>

                  {/* Right: Berkas terbundel */}
                  <div className="lg:col-span-8 space-y-3">
                    <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider pl-1">
                      Berkas Terbundel ({(selectedBundle.permohonan || []).length} berkas)
                    </h4>

                    <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-1">
                      {(selectedBundle.permohonan || []).map((item: any) => {
                        const isMutasiSebagian = item.jenisPermohonan === 'MUTASI_SEBAGIAN';
                        const isFrozen = pendingKoreksiMap[item.id] === true;

                        return (
                          <div
                            key={item.id}
                            className={`p-4 border rounded-2xl flex items-center justify-between gap-4 transition-all ${isFrozen
                              ? 'bg-amber-50/50 border-amber-200/80 opacity-90'
                              : 'bg-white border-slate-200/80 hover:shadow-sm'
                              }`}
                          >
                            <div className="space-y-1 max-w-[70%]">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-gray-800 truncate">{item.nomorPermohonan}</span>
                                {isFrozen && (
                                  <span className="text-[8px] font-extrabold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Clock className="w-2.5 h-2.5 shrink-0" />
                                    Frozen
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 font-medium truncate">
                                WP: <strong className="text-gray-700">{item.namaWajibPajak}</strong> | NOP: <strong className="text-gray-700">{formatNop(item.nop)}</strong>
                              </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {/* Kertas Kerja PDF link for Mutasi Sebagian */}
                              {isMutasiSebagian && (
                                <a
                                  href={`/api/pdf/kertas-kerja/${item.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors flex items-center gap-1.5 text-[10px] font-bold"
                                  title="Cetak Kertas Kerja Mutasi Sebagian"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline">Kertas Kerja</span>
                                </a>
                              )}

                              {/* Extraction Action */}
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
                                className="p-2 bg-red-50 hover:bg-red-100 border border-red-100 rounded-lg text-red-600 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
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
              <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
                <Boxes className="w-16 h-16 text-slate-300" />
                <h3 className="text-sm font-bold text-gray-800">Detail Bundle & Cetak</h3>
                <p className="text-xs text-slate-400 font-semibold max-w-xs leading-relaxed">
                  Silakan pilih salah satu bundle di tab 'Buat bundle' terlebih dahulu untuk mengulas berkas, melakukan penguncian, atau mencetak Surat Pengantar.
                </p>
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
                <label className="text-[10px] font-bold text-gray-700 uppercase tracking-widest pl-1">Catatan / alasan kelengkapan</label>
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
                <label className="text-[10px] font-bold text-gray-700 uppercase tracking-widest pl-1">Alasan pengeluaran berkas</label>
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
