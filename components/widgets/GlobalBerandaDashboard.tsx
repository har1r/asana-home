"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  FileSpreadsheet,
  Printer,
  Calendar,
  X
} from 'lucide-react';
import { getGlobalBerandaStats } from '@/app/actions/beranda';
import { useDashboard } from '@/context/DashboardContext';
import { GlobalBerandaSkeleton } from '@/components/skeletons/SkeletonBase';

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
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
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

  const loadData = useCallback(async (start = startDate, end = endDate) => {
    setLoading(true);
    try {
      const res = await getGlobalBerandaStats(start, end);
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
  }, [startDate, endDate]);

  useEffect(() => {
    loadData(startDate, endDate);
  }, [startDate, endDate]);

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

  if (loading) {
    return <GlobalBerandaSkeleton />;
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-10 font-sans">

      {/* ========================================== */}
      {/* 0. TOP HEADER COMMAND TOOLBAR (Date Filter & Actions) */}
      {/* ========================================== */}
      <div className=" flex flex-col md:flex-row md:items-center justify-between gap-3 select-none font-sans">
        {/* Left Side: Filter Tanggal menggantikan teks Judul & Subjudul */}
        <div className="flex items-center gap-2 flex-wrap font-sans">
          <div className="flex items-center gap-2 bg-white border border-slate-200/90 rounded-md p-1 px-3 shadow-3xs font-sans">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-[13px] font-normal text-slate-800 focus:outline-none font-sans cursor-pointer"
              title="Tanggal Mulai"
            />
            <span className="text-[13px] font-normal text-slate-400 font-sans">s/d</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-[13px] font-normal text-slate-800 focus:outline-none font-sans cursor-pointer"
              title="Tanggal Selesai"
            />
            {(startDate || endDate) && (
              <button
                type="button"
                onClick={() => { setStartDate(''); setEndDate(''); }}
                className="text-[11px] font-normal text-slate-400 hover:text-rose-600 ml-1 px-1.5 py-0.5 rounded hover:bg-slate-100 transition-colors cursor-pointer font-sans"
                title="Reset Filter Tanggal"
              >
                ✕ Reset
              </button>
            )}
          </div>

          {/* Quick Presets: Semua Periode & Triwulan (TW 1 - TW 4) */}
          <div className="flex items-center gap-1 font-sans flex-wrap">
            <button
              type="button"
              onClick={() => { setStartDate(''); setEndDate(''); }}
              className={`px-3 py-1 rounded-md text-[13px] font-normal transition-all cursor-pointer border font-sans ${!startDate && !endDate ? 'bg-[#00a389] text-white border-[#00a389] shadow-3xs' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
            >
              Semua Periode
            </button>

            <button
              type="button"
              onClick={() => {
                const yr = new Date().getFullYear();
                setStartDate(`${yr}-01-01`);
                setEndDate(`${yr}-03-31`);
              }}
              className={`px-3 py-1 rounded-md text-[13px] font-normal transition-all cursor-pointer border font-sans ${startDate.endsWith('-01-01') && endDate.endsWith('-03-31') ? 'bg-[#00a389] text-white border-[#00a389] shadow-3xs' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
              title="Triwulan I (1 Jan - 31 Mar)"
            >
              TW 1 (Jan - Mar)
            </button>

            <button
              type="button"
              onClick={() => {
                const yr = new Date().getFullYear();
                setStartDate(`${yr}-04-01`);
                setEndDate(`${yr}-06-30`);
              }}
              className={`px-3 py-1 rounded-md text-[13px] font-normal transition-all cursor-pointer border font-sans ${startDate.endsWith('-04-01') && endDate.endsWith('-06-30') ? 'bg-[#00a389] text-white border-[#00a389] shadow-3xs' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
              title="Triwulan II (1 Apr - 30 Jun)"
            >
              TW 2 (Apr - Jun)
            </button>

            <button
              type="button"
              onClick={() => {
                const yr = new Date().getFullYear();
                setStartDate(`${yr}-07-01`);
                setEndDate(`${yr}-09-30`);
              }}
              className={`px-3 py-1 rounded-md text-[13px] font-normal transition-all cursor-pointer border font-sans ${startDate.endsWith('-07-01') && endDate.endsWith('-09-30') ? 'bg-[#00a389] text-white border-[#00a389] shadow-3xs' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
              title="Triwulan III (1 Jul - 30 Sep)"
            >
              TW 3 (Jul - Sep)
            </button>

            <button
              type="button"
              onClick={() => {
                const yr = new Date().getFullYear();
                setStartDate(`${yr}-10-01`);
                setEndDate(`${yr}-12-31`);
              }}
              className={`px-3 py-1 rounded-md text-[13px] font-normal transition-all cursor-pointer border font-sans ${startDate.endsWith('-10-01') && endDate.endsWith('-12-31') ? 'bg-[#00a389] text-white border-[#00a389] shadow-3xs' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
              title="Triwulan IV (1 Okt - 31 Des)"
            >
              TW 4 (Okt - Des)
            </button>
          </div>
        </div>

        {/* Right Side: Direct 1-Click PDF Download & Refresh */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Tombol Download PDF Rangkuman Pelayanan Total (Langsung Unduh Sesuai Tanggal Tanpa Modal) */}
          <a
            href={`/api/pdf/rangkuman-pelayanan?startDate=${startDate}&endDate=${endDate}`}
            target="_blank"
            rel="noopener noreferrer"
            className="h-10 px-3.5 rounded-md border border-slate-200/90 hover:border-slate-300 hover:bg-slate-100 text-slate-700 transition-all cursor-pointer flex items-center gap-2 text-[13px] font-normal shadow-3xs font-sans"
            title="Cetak & Download PDF Rangkuman Pelayanan Total (Otomatis Ikut Filter Tanggal)"
          >
            <Printer className="w-4 h-4 text-emerald-600" />
          </a>

          {/* Tombol Refresh Dipindahkan ke Paling Atas */}
          <button
            type="button"
            onClick={() => loadData(startDate, endDate)}
            disabled={loading}
            className="h-10 w-10 rounded-md border border-slate-200/90 bg-white hover:bg-slate-100 text-slate-500 transition-all cursor-pointer disabled:opacity-40 shadow-3xs flex items-center justify-center shrink-0"
            title="Refresh Data Beranda"
          >
            <RefreshCw className={`w-4 h-4 transition-all duration-300 ${loading ? 'animate-spin text-[#00a389]' : ''}`} />
          </button>
        </div>
      </div>

      {/* ========================================== */}
      {/* 1. TOP OVERVIEW SUMMARY CARDS (6 CARDS GRID) */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 select-none">

        {/* Card 1: Total Nopel */}
        <div className="bg-gradient-to-r from-[#008967] via-[#007f5f] to-[#006e52] text-white rounded-md p-4 shadow-xs hover:shadow-md hover:scale-[1.02] transition-all flex flex-col justify-between min-h-[124px]">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-normal text-white/90 capitalize tracking-tight font-sans">Total Nopel</span>
            <div className="w-7 h-7 rounded-full border border-white/40 bg-white/10 flex items-center justify-center text-white shrink-0">
              <FileText className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
          </div>
          <div className="my-1">
            <span className="text-3xl font-black text-white tabular-nums tracking-tight">
              {loading ? '...' : data.totalNopel}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[13px] font-normal text-white/90 truncate font-sans capitalize">
            <TrendingUp className="w-3.5 h-3.5 shrink-0 stroke-[2.2]" />
            <span className="truncate">{data.totalNopel} Dokumen Masuk</span>
          </div>
        </div>

        {/* Card 2: Total Pemohon */}
        <div className="bg-gradient-to-r from-[#0061e0] via-[#2446e8] to-[#5233ed] text-white rounded-md p-4 shadow-xs hover:shadow-md hover:scale-[1.02] transition-all flex flex-col justify-between min-h-[124px]">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-normal text-white/90 capitalize tracking-tight font-sans">Total Pemohon</span>
            <div className="w-7 h-7 rounded-full border border-white/40 bg-white/10 flex items-center justify-center text-white shrink-0">
              <Users className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
          </div>
          <div className="my-1">
            <span className="text-3xl font-black text-white tabular-nums tracking-tight">
              {loading ? '...' : data.totalPemohon}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[13px] font-normal text-white/90 truncate font-sans capitalize">
            <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-300 stroke-[2.2]" />
            <span className="truncate">
              +{data.totalPemohon > data.totalNopel ? data.totalPemohon - data.totalNopel : 1} Pemohon Mutasi
            </span>
          </div>
        </div>

        {/* Card 3: Dalam Proses */}
        <div className="bg-gradient-to-r from-[#fa6e00] via-[#ff5b00] to-[#ff4200] text-white rounded-md p-4 shadow-xs hover:shadow-md hover:scale-[1.02] transition-all flex flex-col justify-between min-h-[124px]">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-normal text-white/90 capitalize tracking-tight font-sans">Dalam Proses</span>
            <div className="w-7 h-7 rounded-full border border-white/40 bg-white/10 flex items-center justify-center text-white shrink-0">
              <Clock className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
          </div>
          <div className="my-1">
            <span className="text-3xl font-black text-white tabular-nums tracking-tight">
              {loading ? '...' : data.globalProses}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[13px] font-normal text-white/90 truncate font-sans capitalize">
            <Activity className="w-3.5 h-3.5 shrink-0 stroke-[2.2]" />
            <span className="truncate">Sedang Divalidasi</span>
          </div>
        </div>

        {/* Card 4: Berkas Selesai */}
        <div className="bg-gradient-to-r from-[#008967] via-[#007f5f] to-[#006e52] text-white rounded-md p-4 shadow-xs hover:shadow-md hover:scale-[1.02] transition-all flex flex-col justify-between min-h-[124px]">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-normal text-white/90 capitalize tracking-tight font-sans">Berkas Selesai</span>
            <div className="w-7 h-7 rounded-full border border-white/40 bg-white/10 flex items-center justify-center text-white shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
          </div>
          <div className="my-1">
            <span className="text-3xl font-black text-white tabular-nums tracking-tight">
              {loading ? '...' : data.globalSelesai}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[13px] font-normal text-white/90 truncate font-sans capitalize">
            <FileCheck className="w-3.5 h-3.5 shrink-0 stroke-[2.2]" />
            <span className="truncate">Verifikasi Rampung</span>
          </div>
        </div>

        {/* Card 5: Berkas Sudah Dikirim */}
        <div className="bg-gradient-to-r from-[#5335ed] via-[#6924f4] to-[#7f18fb] text-white rounded-md p-4 shadow-xs hover:shadow-md hover:scale-[1.02] transition-all flex flex-col justify-between min-h-[124px]">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-normal text-white/90 capitalize tracking-tight font-sans">Sudah Dikirim</span>
            <div className="w-7 h-7 rounded-full border border-white/40 bg-white/10 flex items-center justify-center text-white shrink-0">
              <Send className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
          </div>
          <div className="my-1">
            <span className="text-3xl font-black text-white tabular-nums tracking-tight">
              {loading ? '...' : data.globalDikirim}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[13px] font-normal text-white/90 truncate font-sans capitalize">
            <Send className="w-3.5 h-3.5 shrink-0 stroke-[2.2]" />
            <span className="truncate">Manifest Resmi</span>
          </div>
        </div>

        {/* Card 6: Berkas Revisi */}
        <div className="bg-gradient-to-r from-[#e60055] via-[#d4003d] to-[#b8002d] text-white rounded-md p-4 shadow-xs hover:shadow-md hover:scale-[1.02] transition-all flex flex-col justify-between min-h-[124px]">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-normal text-white/90 capitalize tracking-tight font-sans">Berkas Revisi</span>
            <div className="w-7 h-7 rounded-full border border-white/40 bg-white/10 flex items-center justify-center text-white shrink-0">
              <AlertTriangle className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
          </div>
          <div className="my-1">
            <span className="text-3xl font-black text-white tabular-nums tracking-tight">
              {loading ? '...' : data.globalRevisi}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[13px] font-normal text-white/90 truncate font-sans capitalize">
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
            <h2 className="text-[13px] font-normal text-slate-800 capitalize font-sans">Statistik Surat Rekomendasi</h2>
          </div>
        </div>

        <div className="bg-white rounded-md p-5 border border-slate-200/90 shadow-3xs flex flex-col gap-4 select-none">
          {/* Sub-summary cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-md p-4 flex items-center justify-between shadow-xs">
              <div className="flex flex-col">
                <span className="text-[13px] font-normal text-white/90 capitalize tracking-tight font-sans">Surat Rekom Dibuat</span>
                <span className="text-2xl font-black text-white tabular-nums mt-1 font-sans">
                  {loading ? '...' : data.rekomStats?.totalDibuat || 0}
                </span>
                <span className="text-[13px] font-normal text-white/80 capitalize mt-0.5 font-sans">Sudah Dikunci Oleh Peneliti</span>
              </div>
              <div className="w-10 h-10 rounded-full border border-white/40 bg-white/10 flex items-center justify-center text-white shrink-0">
                <Lock className="w-5 h-5 stroke-[2.2]" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-md p-4 flex items-center justify-between shadow-xs">
              <div className="flex flex-col">
                <span className="text-[13px] font-normal text-white/90 capitalize tracking-tight font-sans">Surat Rekom Dikirim</span>
                <span className="text-2xl font-black text-white tabular-nums mt-1 font-sans">
                  {loading ? '...' : data.rekomStats?.totalDikirim || 0}
                </span>
                <span className="text-[13px] font-normal text-white/80 capitalize mt-0.5 font-sans">Sudah Dikelompokkan Dan Dikirim</span>
              </div>
              <div className="w-10 h-10 rounded-full border border-white/40 bg-white/10 flex items-center justify-center text-white shrink-0">
                <Send className="w-5 h-5 stroke-[2.2]" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-rose-600 to-red-700 text-white rounded-md p-4 flex items-center justify-between shadow-xs">
              <div className="flex flex-col">
                <span className="text-[13px] font-normal text-white/90 capitalize tracking-tight font-sans">Surat Rekom Void</span>
                <span className="text-2xl font-black text-white tabular-nums mt-1 font-sans">
                  {loading ? '...' : data.rekomStats?.totalVoid || 0}
                </span>
                <span className="text-[13px] font-normal text-white/80 capitalize mt-0.5 font-sans">Dibatalkan / Void</span>
              </div>
              <div className="w-10 h-10 rounded-full border border-white/40 bg-white/10 flex items-center justify-center text-white shrink-0">
                <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
              </div>
            </div>
          </div>

          {/* Breakdown Per Jenis Layanan */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[13px] font-normal text-slate-800 mb-2.5 block capitalize font-sans">Total Surat Rekom Per Jenis Layanan</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {Object.keys(SERVICE_META).map((key) => {
                const meta = SERVICE_META[key];
                const rItem = data.rekomStats?.breakdownByService?.[key] || { totalDibuat: 0, totalDikirim: 0, totalVoid: 0 };

                return (
                  <div key={key} className="bg-slate-50/80 border border-slate-200/70 rounded-md p-3 flex flex-col justify-between gap-1.5">
                    <span className="text-[13px] font-normal text-slate-800 truncate capitalize font-sans" title={meta.label}>
                      {meta.label}
                    </span>
                    <div className="flex items-center justify-between text-[13px] pt-1.5 border-t border-slate-200/50 font-sans">
                      <span className="font-normal text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200/60 font-sans" title="Dibuat / Terkunci">
                        🔒 {rItem.totalDibuat}
                      </span>
                      <span className="font-normal text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200/60 font-sans" title="Dikirim">
                        ✈️ {rItem.totalDikirim}
                      </span>
                      <span className="font-normal text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded-md border border-rose-200/60 font-sans" title="Void / Dibatalkan">
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
            <h2 className="text-[13px] font-normal text-slate-800 capitalize font-sans">Rincian Pemohon Per Jenis Layanan</h2>
          </div>
          <button
            onClick={() => loadData(startDate, endDate)}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
            title="Refresh Data Statistik"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="bg-white rounded-md p-6 border border-slate-200/90 shadow-3xs select-none">
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
                <div key={key} className="rounded-md p-4 border border-slate-200/90 bg-white flex flex-col justify-between gap-3 transition-all hover:shadow-xs">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-normal text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200/80 capitalize font-sans">
                        {meta.label}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 font-sans">
                    <div className="flex flex-col bg-slate-50/80 p-2 rounded-md border border-slate-200/60">
                      <span className="text-[13px] font-normal text-slate-500 capitalize font-sans">Total Nopel</span>
                      <span className="text-lg font-black text-slate-900 tabular-nums font-sans">{item.totalNopel}</span>
                    </div>
                    <div className="flex flex-col bg-slate-50/80 p-2 rounded-md border border-slate-200/60">
                      <span className="text-[13px] font-normal text-slate-500 capitalize font-sans">Total Pemohon</span>
                      <span className="text-lg font-black text-slate-900 tabular-nums font-sans">{item.totalPemohon}</span>
                    </div>
                    {key === 'MUTASI_SEBAGIAN' && item.totalPemohon > item.totalNopel && (
                      <div className="text-[13px] font-normal text-slate-700 bg-slate-100 px-2 py-1 rounded-md border border-slate-200 col-span-2 text-center capitalize font-sans">
                        💡 1 Nopel Memuat {item.totalPemohon - item.totalNopel + 1} Pemohon Baru
                      </div>
                    )}
                  </div>

                  {/* Progress Bar Status */}
                  <div className="flex flex-col gap-1 mt-1 font-sans">
                    <div className="flex items-center justify-between text-[13px] font-normal text-slate-700 capitalize font-sans">
                      <span>Progres Selesai</span>
                      <span className="tabular-nums font-sans">{selesaiPct}%</span>
                    </div>
                    <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-[#00a389] h-full rounded-full transition-all duration-500"
                        style={{ width: `${selesaiPct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[13px] font-normal text-slate-500 mt-0.5 capitalize font-sans">
                      <span>Proses: {item.prosesCount}</span>
                      <span className="text-emerald-700 font-normal">Dikirim: {item.dikirimCount || 0}</span>
                      <span>Selesai: {item.selesaiCount}</span>
                      {item.revisiCount > 0 && <span className="text-rose-600 font-normal">Revisi: {item.revisiCount}</span>}
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
      <div className="flex flex-col gap-3 select-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
          <div className="flex items-center gap-2.5">
            <h2 className="text-[13px] font-normal text-slate-800 capitalize font-sans">Distribusi Pemohon Per Kecamatan</h2>
          </div>

          {/* Switcher Tab */}
          <div className="bg-slate-200/70 p-0.5 rounded-md flex items-center gap-0.5 border border-slate-300/60 text-[13px] font-normal select-none shrink-0 font-sans h-8">
            <button
              type="button"
              onClick={() => setViewMode('kecamatan')}
              className={`h-7 px-3 rounded-md transition-all cursor-pointer flex items-center gap-1.5 capitalize font-sans ${viewMode === 'kecamatan'
                ? 'bg-white text-slate-900 shadow-3xs font-normal'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <span>Kecamatan</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('desa')}
              className={`h-7 px-3 rounded-md transition-all cursor-pointer flex items-center gap-1.5 capitalize font-sans ${viewMode === 'desa'
                ? 'bg-white text-slate-900 shadow-3xs font-normal'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <span>Desa / Kelurahan</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-md p-6 border border-slate-200/90 shadow-3xs flex flex-col gap-5">
          {/* Filter Search Input */}
          <div className="flex items-center justify-between gap-3 font-sans">
            <div className="relative max-w-sm w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={regionSearch}
                onChange={(e) => setRegionSearch(e.target.value)}
                placeholder={`Cari Nama ${viewMode === 'kecamatan' ? 'Kecamatan' : 'Desa/Kelurahan'}...`}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200/90 focus:bg-white focus:border-[#00a389] rounded-md text-[13px] font-normal text-slate-800 placeholder-slate-400 focus:outline-none transition-all font-sans"
              />
            </div>
            <span className="text-[13px] font-normal text-slate-500 shrink-0 capitalize font-sans">
              Menampilkan {displayRegionList.length} {viewMode === 'desa' && !showAllDesa && !regionSearch.trim() ? `dari ${filteredRegionList.length}` : ''} Wilayah
            </span>
          </div>

          {/* Scrollable Graphic Bars List */}
          <div className="max-h-[380px] overflow-y-auto pr-1 flex flex-col gap-3 mt-1 scrollbar-thin font-sans">
            {loading ? (
              <div className="py-12 text-center text-slate-400 font-normal text-[13px] font-sans capitalize">
                Memuat Grafik Wilayah...
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
                    className="flex flex-col gap-1.5 p-3 rounded-md bg-slate-50/70 hover:bg-emerald-50/50 border border-slate-200/60 hover:border-emerald-200 transition-all cursor-pointer group shrink-0"
                    title={`Klik untuk melihat permohonan di wilayah ${item.name}`}
                  >
                    <div className="flex items-center justify-between text-[13px] font-normal text-slate-900 gap-2 font-sans">
                      <div className="flex items-center gap-2 truncate">
                        <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-normal shrink-0 ${idx === 0 ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                          idx === 1 ? 'bg-slate-200 text-slate-800 border border-slate-300' :
                            idx === 2 ? 'bg-orange-100 text-orange-900 border border-orange-300' :
                              'bg-slate-100 text-slate-600'
                          }`}>
                          #{idx + 1}
                        </span>
                        <span className="capitalize tracking-tight group-hover:text-[#00a389] transition-colors truncate font-sans text-[13px] font-normal text-slate-800">
                          {item.name}
                        </span>
                        {item.subName && (
                          <span className="text-[13px] font-normal text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0 capitalize font-sans">
                            Kec. {item.subName}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0 font-sans">
                        <span className="text-[13px] font-normal text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 capitalize font-sans">
                          {item.totalPemohon} Pemohon
                        </span>
                        <span className="text-[13px] font-normal text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 capitalize font-sans">
                          {item.totalNopel} Nopel
                        </span>
                        <span className="text-[13px] font-normal text-slate-500 tabular-nums font-sans">
                          ({totalPct}%)
                        </span>
                      </div>
                    </div>

                    {/* Horizontal Bar Graphic */}
                    <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#00a389] to-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${barWidthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-slate-400 font-normal text-[13px] font-sans capitalize">
                Belum Ada Data Wilayah Objek Pajak
              </div>
            )}
          </div>

          {/* Toggle Expand Button for Desa */}
          {viewMode === 'desa' && !regionSearch.trim() && filteredRegionList.length > 5 && (
            <button
              onClick={() => setShowAllDesa(!showAllDesa)}
              className="w-full py-2 text-[13px] font-normal text-[#00a389] hover:text-[#008f78] hover:bg-emerald-50/60 rounded-md transition-colors cursor-pointer border border-dashed border-emerald-300 text-center capitalize font-sans"
            >
              {showAllDesa ? '▲ Tampilkan Top 5 Desa Sahaja' : `▼ Lihat Semua ${filteredRegionList.length} Desa / Kelurahan`}
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
