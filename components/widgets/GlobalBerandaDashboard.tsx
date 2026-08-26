"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  RefreshCw,
  PlusCircle,
  Edit3,
  Search,
  ArrowUpRight,
  TrendingUp,
  FolderOpen,
  MapPin,
  Send,
  Sparkles,
  Activity,
  FileCheck,
  Lock,
  FileSpreadsheet
} from 'lucide-react';
import { getGlobalBerandaStats } from '@/app/actions/penginput';
import { useDashboard } from '@/context/DashboardContext';

interface GlobalBerandaDashboardProps {
  onViewAllTasks?: () => void;
}

const SERVICE_META: Record<string, { label: string }> = {
  MUTASI_SEBAGIAN: {
    label: 'Mutasi Sebagian'
  },
  MUTASI_HABIS_UPDATE: {
    label: 'Mutasi Habis (Update)'
  },
  MUTASI_HABIS_REGULER: {
    label: 'Mutasi Habis (Reguler)'
  },
  OBJEK_PAJAK_BARU: {
    label: 'Objek Pajak Baru'
  },
  PEMBETULAN: {
    label: 'Pembetulan Data'
  },
  PENGAKTIFAN: {
    label: 'Pengaktifan NOP'
  }
};

export default function GlobalBerandaDashboard({ onViewAllTasks }: GlobalBerandaDashboardProps) {
  const { setSearchQuery, setActiveTab } = useDashboard();
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kecamatan' | 'desa'>('kecamatan');
  const [regionSearch, setRegionSearch] = useState('');
  const [data, setData] = useState<{
    totalNopel: number;
    totalPemohon: number;
    globalProses: number;
    globalSelesai: number;
    globalRevisi: number;
    globalDikirim: number;
    mutasiSebagianMultiNopelCount: number;
    breakdownByService: Record<string, any>;
    byKecamatan: any[];
    byDesa: any[];
    recentList: any[];
    rekomStats: {
      totalDibuat: number;
      totalDikirim: number;
      totalVoid: number;
      breakdownByService: Record<string, { totalDibuat: number; totalDikirim: number; totalVoid: number }>;
    };
  }>({
    totalNopel: 0,
    totalPemohon: 0,
    globalProses: 0,
    globalSelesai: 0,
    globalRevisi: 0,
    globalDikirim: 0,
    mutasiSebagianMultiNopelCount: 0,
    breakdownByService: {},
    byKecamatan: [],
    byDesa: [],
    recentList: [],
    rekomStats: {
      totalDibuat: 0,
      totalDikirim: 0,
      totalVoid: 0,
      breakdownByService: {}
    }
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getGlobalBerandaStats();
      if (res.success) {
        setData({
          totalNopel: res.totalNopel || 0,
          totalPemohon: res.totalPemohon || 0,
          globalProses: res.globalProses || 0,
          globalSelesai: res.globalSelesai || 0,
          globalRevisi: res.globalRevisi || 0,
          globalDikirim: res.globalDikirim || 0,
          mutasiSebagianMultiNopelCount: res.mutasiSebagianMultiNopelCount || 0,
          breakdownByService: res.breakdownByService || {},
          byKecamatan: res.byKecamatan || [],
          byDesa: res.byDesa || [],
          recentList: res.recentList || [],
          rekomStats: res.rekomStats || { totalDibuat: 0, totalDikirim: 0, totalVoid: 0, breakdownByService: {} }
        });
      }
    } catch (e) {
      console.error('Gagal memuat statistik global beranda:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const [showAllDesa, setShowAllDesa] = useState(false);

  const filteredRegionList = useMemo(() => {
    const rawList = viewMode === 'kecamatan'
      ? data.byKecamatan.map(i => ({ name: i.kecamatan, subName: null, totalPemohon: i.totalPemohon, totalNopel: i.totalNopel }))
      : data.byDesa.map(i => ({ name: i.desa, subName: i.kecamatan, totalPemohon: i.totalPemohon, totalNopel: i.totalNopel }));

    if (!regionSearch.trim()) return rawList;
    const q = regionSearch.toLowerCase();
    return rawList.filter(i => i.name.toLowerCase().includes(q) || (i.subName && i.subName.toLowerCase().includes(q)));
  }, [viewMode, regionSearch, data.byKecamatan, data.byDesa]);

  const displayRegionList = useMemo(() => {
    if (viewMode === 'desa' && !showAllDesa && !regionSearch.trim()) {
      return filteredRegionList.slice(0, 5);
    }
    return filteredRegionList;
  }, [viewMode, showAllDesa, regionSearch, filteredRegionList]);

  return (
    <div className="flex flex-col gap-6 w-full pb-10">

      {/* ========================================== */}
      {/* 1. TOP OVERVIEW SUMMARY CARDS (6 CARDS GRID) */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">

        {/* Card 1: Total NOPEL */}
        <div className="bg-gradient-to-r from-[#008967] via-[#007f5f] to-[#006e52] text-white rounded-md p-4 shadow-xs hover:shadow-md hover:scale-[1.02] transition-all flex flex-col justify-between min-h-[124px]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-white/90 capitalize tracking-wider">Total NOPEL</span>
            <div className="w-7 h-7 rounded-full border border-white/40 bg-white/10 flex items-center justify-center text-white shrink-0">
              <FileText className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
          </div>
          <div className="my-1">
            <span className="text-3xl font-black text-white tabular-nums tracking-tight">
              {loading ? '...' : data.totalNopel}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-white/90 truncate">
            <TrendingUp className="w-3.5 h-3.5 shrink-0 stroke-[2.2]" />
            <span className="truncate">{data.totalNopel} Dokumen Masuk</span>
          </div>
        </div>

        {/* Card 2: Total Pemohon */}
        <div className="bg-gradient-to-r from-[#0061e0] via-[#2446e8] to-[#5233ed] text-white rounded-md p-4 shadow-xs hover:shadow-md hover:scale-[1.02] transition-all flex flex-col justify-between min-h-[124px]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-white/90 capitalize tracking-wider">Total Pemohon</span>
            <div className="w-7 h-7 rounded-full border border-white/40 bg-white/10 flex items-center justify-center text-white shrink-0">
              <Users className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
          </div>
          <div className="my-1">
            <span className="text-3xl font-black text-white tabular-nums tracking-tight">
              {loading ? '...' : data.totalPemohon}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-white/90 truncate">
            <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-300 stroke-[2.2]" />
            <span className="truncate">
              +{data.totalPemohon > data.totalNopel ? data.totalPemohon - data.totalNopel : 1} Pemohon Mutasi
            </span>
          </div>
        </div>

        {/* Card 3: Dalam Proses */}
        <div className="bg-gradient-to-r from-[#fa6e00] via-[#ff5b00] to-[#ff4200] text-white rounded-md p-4 shadow-xs hover:shadow-md hover:scale-[1.02] transition-all flex flex-col justify-between min-h-[124px]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-white/90 capitalize tracking-wider">Dalam Proses</span>
            <div className="w-7 h-7 rounded-full border border-white/40 bg-white/10 flex items-center justify-center text-white shrink-0">
              <Clock className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
          </div>
          <div className="my-1">
            <span className="text-3xl font-black text-white tabular-nums tracking-tight">
              {loading ? '...' : data.globalProses}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-white/90 truncate">
            <Activity className="w-3.5 h-3.5 shrink-0 stroke-[2.2]" />
            <span className="truncate">Sedang Divalidasi</span>
          </div>
        </div>

        {/* Card 4: Berkas Selesai */}
        <div className="bg-gradient-to-r from-[#008967] via-[#007f5f] to-[#006e52] text-white rounded-md p-4 shadow-xs hover:shadow-md hover:scale-[1.02] transition-all flex flex-col justify-between min-h-[124px]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-white/90 capitalize tracking-wider">Berkas Selesai</span>
            <div className="w-7 h-7 rounded-full border border-white/40 bg-white/10 flex items-center justify-center text-white shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
          </div>
          <div className="my-1">
            <span className="text-3xl font-black text-white tabular-nums tracking-tight">
              {loading ? '...' : data.globalSelesai}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-white/90 truncate">
            <FileCheck className="w-3.5 h-3.5 shrink-0 stroke-[2.2]" />
            <span className="truncate">Verifikasi Rampung</span>
          </div>
        </div>

        {/* Card 5: Berkas Sudah Dikirim */}
        <div className="bg-gradient-to-r from-[#5335ed] via-[#6924f4] to-[#7f18fb] text-white rounded-md p-4 shadow-xs hover:shadow-md hover:scale-[1.02] transition-all flex flex-col justify-between min-h-[124px]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-white/90 uppercase tracking-wider">SUDAH DIKIRIM</span>
            <div className="w-7 h-7 rounded-full border border-white/40 bg-white/10 flex items-center justify-center text-white shrink-0">
              <Send className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
          </div>
          <div className="my-1">
            <span className="text-3xl font-black text-white tabular-nums tracking-tight">
              {loading ? '...' : data.globalDikirim}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-white/90 truncate">
            <Send className="w-3.5 h-3.5 shrink-0 stroke-[2.2]" />
            <span className="truncate">Manifest Resmi</span>
          </div>
        </div>

        {/* Card 6: Berkas Revisi */}
        <div className="bg-gradient-to-r from-[#e60055] via-[#d4003d] to-[#b8002d] text-white rounded-md p-4 shadow-xs hover:shadow-md hover:scale-[1.02] transition-all flex flex-col justify-between min-h-[124px]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-white/90 uppercase tracking-wider">BERKAS REVISI</span>
            <div className="w-7 h-7 rounded-full border border-white/40 bg-white/10 flex items-center justify-center text-white shrink-0">
              <AlertTriangle className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
          </div>
          <div className="my-1">
            <span className="text-3xl font-black text-white tabular-nums tracking-tight">
              {loading ? '...' : data.globalRevisi}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-white/90 truncate">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 stroke-[2.2]" />
            <span className="truncate">
              {data.globalRevisi > 0 ? `${data.globalRevisi} Butuh Koreksi Data` : '1 Butuh Koreksi Data'}
            </span>
          </div>
        </div>

      </div>

      {/* ========================================== */}
      {/* 1.5 STATISTIK SURAT REKOMENDASI (BUNDLE)  */}
      {/* ========================================== */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-gray-900">Statistik Surat Rekomendasi</h2>
          </div>
        </div>

        <div className="bg-white rounded-md p-5 border border-gray-200/90 shadow-3xs flex flex-col gap-4">
          {/* Sub-summary cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-md p-4 flex items-center justify-between shadow-xs">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-white/90 uppercase tracking-wider">Surat Rekom Dibuat</span>
                <span className="text-2xl font-black text-white tabular-nums mt-1">
                  {loading ? '...' : data.rekomStats?.totalDibuat || 0}
                </span>
                <span className="text-[10px] font-medium text-white/80 mt-0.5">Sudah dikunci oleh Peneliti</span>
              </div>
              <div className="w-10 h-10 rounded-full border border-white/40 bg-white/10 flex items-center justify-center text-white shrink-0">
                <Lock className="w-5 h-5 stroke-[2.2]" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-md p-4 flex items-center justify-between shadow-xs">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-white/90 uppercase tracking-wider">Surat Rekom Dikirim</span>
                <span className="text-2xl font-black text-white tabular-nums mt-1">
                  {loading ? '...' : data.rekomStats?.totalDikirim || 0}
                </span>
                <span className="text-[10px] font-medium text-white/80 mt-0.5">Sudah dikelompokkan dan dikirim</span>
              </div>
              <div className="w-10 h-10 rounded-full border border-white/40 bg-white/10 flex items-center justify-center text-white shrink-0">
                <Send className="w-5 h-5 stroke-[2.2]" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-rose-600 to-red-700 text-white rounded-md p-4 flex items-center justify-between shadow-xs">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-white/90 uppercase tracking-wider">Surat Rekom Void</span>
                <span className="text-2xl font-black text-white tabular-nums mt-1">
                  {loading ? '...' : data.rekomStats?.totalVoid || 0}
                </span>
                <span className="text-[10px] font-medium text-white/80 mt-0.5">Dibatalkan / Void</span>
              </div>
              <div className="w-10 h-10 rounded-full border border-white/40 bg-white/10 flex items-center justify-center text-white shrink-0">
                <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
              </div>
            </div>
          </div>

          {/* Breakdown Per Jenis Layanan */}
          <div className="pt-2 border-t border-gray-100">
            <span className="text-xs font-bold text-gray-700 mb-2.5 block">Total Surat Rekom Per Jenis Layanan</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {Object.keys(SERVICE_META).map((key) => {
                const meta = SERVICE_META[key];
                const rItem = data.rekomStats?.breakdownByService?.[key] || { totalDibuat: 0, totalDikirim: 0, totalVoid: 0 };

                return (
                  <div key={key} className="bg-slate-50/80 border border-slate-200/70 rounded-md p-3 flex flex-col justify-between gap-1.5">
                    <span className="text-[10px] font-extrabold text-gray-800 truncate" title={meta.label}>
                      {meta.label}
                    </span>
                    <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-200/50">
                      <span className="font-extrabold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200/60" title="Dibuat / Terkunci">
                        🔒 {rItem.totalDibuat}
                      </span>
                      <span className="font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200/60" title="Dikirim">
                        ✈️ {rItem.totalDikirim}
                      </span>
                      <span className="font-extrabold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded-md border border-rose-200/60" title="Void / Dibatalkan">
                        🚫 {rItem.totalVoid || 0}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* 2. STATISTIK RINCI PER JENIS LAYANAN      */}
      {/* ========================================== */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-gray-900">Rincian Pemohon Per Jenis Layanan</h2>
          </div>
          <button
            onClick={loadData}
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
            title="Refresh Data Statistik"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="bg-white rounded-md p-6 border border-gray-200/90 shadow-3xs">
          {/* Grid 6 Jenis Layanan */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.keys(SERVICE_META).map((key) => {
              const meta = SERVICE_META[key];
              const item = data.breakdownByService[key] || {
                totalNopel: 0,
                totalPemohon: 0,
                prosesCount: 0,
                selesaiCount: 0,
                revisiCount: 0
              };

              const total = item.totalPemohon || 0;
              const selesaiPct = total > 0 ? Math.round((item.selesaiCount / total) * 100) : 0;

              return (
                <div key={key} className="rounded-md p-4 border border-gray-200/90 bg-white flex flex-col justify-between gap-3 transition-all hover:shadow-xs">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-800 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200/80">
                        {meta.label}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                    <div className="flex flex-col bg-slate-50/80 p-2 rounded-md border border-slate-200/60">
                      <span className="text-[10px] font-bold text-gray-500 uppercase">Total NOPEL</span>
                      <span className="text-lg font-extrabold text-gray-900 tabular-nums">{item.totalNopel}</span>
                    </div>
                    <div className="flex flex-col bg-slate-50/80 p-2 rounded-md border border-slate-200/60">
                      <span className="text-[10px] font-bold text-gray-500 uppercase">Total Pemohon</span>
                      <span className="text-lg font-extrabold text-gray-900 tabular-nums">{item.totalPemohon}</span>
                    </div>
                    {key === 'MUTASI_SEBAGIAN' && item.totalPemohon > item.totalNopel && (
                      <div className="text-[10px] font-bold text-gray-700 bg-slate-100 px-2 py-1 rounded-md border border-slate-200 col-span-2 text-center">
                        💡 1 NOPEL memuat {item.totalPemohon - item.totalNopel + 1} Pemohon Baru
                      </div>
                    )}
                  </div>

                  {/* Progress Bar Status */}
                  <div className="flex flex-col gap-1 mt-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-gray-700">
                      <span>Progres Selesai</span>
                      <span className="tabular-nums">{selesaiPct}%</span>
                    </div>
                    <div className="w-full bg-gray-200/80 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-[#00a389] h-full rounded-full transition-all duration-500"
                        style={{ width: `${selesaiPct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-gray-500 mt-0.5">
                      <span>Proses: {item.prosesCount}</span>
                      <span className="text-emerald-700 font-medium">Dikirim: {item.dikirimCount || 0}</span>
                      <span>Selesai: {item.selesaiCount}</span>
                      {item.revisiCount > 0 && <span className="text-rose-600 font-semibold">Revisi: {item.revisiCount}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* 3. GRAFIK & CHART DISTRIBUSI WILAYAH      */}
      {/* ========================================== */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-gray-900">Distribusi Pemohon Per Kecamatan</h2>
          </div>

          {/* Switcher Tab */}
          <div className="bg-slate-100 p-1 rounded-md flex items-center gap-1 border border-slate-200/80 text-xs font-extrabold select-none shrink-0">
            <button
              onClick={() => setViewMode('kecamatan')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${viewMode === 'kecamatan'
                ? 'bg-white text-gray-900 shadow-3xs font-bold'
                : 'text-gray-500 hover:text-gray-900'
                }`}
            >
              Kecamatan
            </button>
            <button
              onClick={() => setViewMode('desa')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${viewMode === 'desa'
                ? 'bg-white text-gray-900 shadow-3xs font-bold'
                : 'text-gray-500 hover:text-gray-900'
                }`}
            >
              Desa / Kelurahan
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200/90 shadow-3xs flex flex-col gap-5">
          {/* Filter Search Input */}
          <div className="flex items-center justify-between gap-3">
            <div className="relative max-w-sm w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={regionSearch}
                onChange={(e) => setRegionSearch(e.target.value)}
                placeholder={`Cari nama ${viewMode === 'kecamatan' ? 'Kecamatan' : 'Desa/Kelurahan'}...`}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-gray-200 focus:bg-white focus:border-[#00a389] rounded-lg text-xs font-semibold text-gray-800 placeholder-gray-400 focus:outline-none transition-all"
              />
            </div>
            <span className="text-xs font-bold text-gray-500 shrink-0">
              Menampilkan {displayRegionList.length} {viewMode === 'desa' && !showAllDesa && !regionSearch.trim() ? `dari ${filteredRegionList.length}` : ''} wilayah
            </span>
          </div>

          {/* Scrollable Graphic Bars List */}
          <div className="max-h-[380px] overflow-y-auto pr-1 flex flex-col gap-3 mt-1 scrollbar-thin">
            {loading ? (
              <div className="py-12 text-center text-gray-400 font-semibold">
                Memuat grafik wilayah...
              </div>
            ) : displayRegionList.length > 0 ? (
              displayRegionList.map((item, idx) => {
                const maxPemohon = Math.max(...displayRegionList.map(i => i.totalPemohon), 1);
                const barWidthPct = Math.max(8, Math.round((item.totalPemohon / maxPemohon) * 100));
                const totalPct = data.totalPemohon > 0 ? Math.round((item.totalPemohon / data.totalPemohon) * 100) : 0;

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setSearchQuery(item.name);
                      setActiveTab('my-tasks');
                    }}
                    className="flex flex-col gap-1.5 p-3 rounded-xl bg-slate-50/70 hover:bg-emerald-50/50 border border-slate-200/60 hover:border-emerald-200 transition-all cursor-pointer group shrink-0"
                    title={`Klik untuk melihat permohonan di wilayah ${item.name}`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-gray-900 gap-2">
                      <div className="flex items-center gap-2 truncate">
                        <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-extrabold shrink-0 ${idx === 0 ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                          idx === 1 ? 'bg-slate-200 text-slate-800 border border-slate-300' :
                            idx === 2 ? 'bg-orange-100 text-orange-900 border border-orange-300' :
                              'bg-gray-100 text-gray-600'
                          }`}>
                          #{idx + 1}
                        </span>
                        <span className="uppercase tracking-wide group-hover:text-[#00a389] transition-colors truncate">
                          {item.name}
                        </span>
                        {item.subName && (
                          <span className="text-[10px] font-semibold text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200 shrink-0">
                            Kec. {item.subName}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {item.totalPemohon} Pemohon
                        </span>
                        <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {item.totalNopel} NOPEL
                        </span>
                        <span className="text-[10px] font-bold text-gray-500 tabular-nums">
                          ({totalPct}%)
                        </span>
                      </div>
                    </div>

                    {/* Horizontal Bar Graphic */}
                    <div className="w-full bg-gray-200/80 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#00a389] to-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${barWidthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-gray-400 font-semibold italic">
                Belum ada data wilayah objek pajak
              </div>
            )}
          </div>

          {/* Toggle Expand Button for Desa */}
          {viewMode === 'desa' && !regionSearch.trim() && filteredRegionList.length > 5 && (
            <button
              onClick={() => setShowAllDesa(!showAllDesa)}
              className="w-full py-2.5 text-xs font-bold text-[#00a389] hover:text-[#008f78] hover:bg-emerald-50/60 rounded-xl transition-colors cursor-pointer border border-dashed border-emerald-300 text-center"
            >
              {showAllDesa ? '▲ Tampilkan Top 5 Desa Sahaja' : `▼ Lihat Semua ${filteredRegionList.length} Desa / Kelurahan`}
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
