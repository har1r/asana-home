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
  Send
} from 'lucide-react';
import { getGlobalBerandaStats } from '@/app/actions/penginput';
import { useDashboard } from '@/context/DashboardContext';

interface GlobalBerandaDashboardProps {
  onViewAllTasks?: () => void;
}

const SERVICE_META: Record<string, { label: string; bg: string; text: string; border: string; badgeBg: string; description: string }> = {
  MUTASI_SEBAGIAN: {
    label: 'Mutasi Sebagian',
    bg: 'bg-emerald-50/70',
    text: 'text-emerald-800',
    border: 'border-emerald-200/80',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    description: '1 NOPEL bisa memiliki banyak pemilik/pemohon baru'
  },
  MUTASI_HABIS_UPDATE: {
    label: 'Mutasi Habis (Update Data)',
    bg: 'bg-blue-50/70',
    text: 'text-blue-800',
    border: 'border-blue-200/80',
    badgeBg: 'bg-blue-100 text-blue-800 border-blue-300',
    description: 'Peralihan hak secara keseluruhan dengan pembaruan data'
  },
  MUTASI_HABIS_REGULER: {
    label: 'Mutasi Habis (Reguler)',
    bg: 'bg-indigo-50/70',
    text: 'text-indigo-800',
    border: 'border-indigo-200/80',
    badgeBg: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    description: 'Peralihan hak reguler secara penuh'
  },
  OBJEK_PAJAK_BARU: {
    label: 'Objek Pajak Baru',
    bg: 'bg-violet-50/70',
    text: 'text-violet-800',
    border: 'border-violet-200/80',
    badgeBg: 'bg-violet-100 text-violet-800 border-violet-300',
    description: 'Pendaftaran objek pajak PBB baru'
  },
  PEMBETULAN: {
    label: 'Pembetulan Data',
    bg: 'bg-amber-50/70',
    text: 'text-amber-800',
    border: 'border-amber-200/80',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
    description: 'Koreksi/revisi kesalahan data NOP'
  },
  PENGAKTIFAN: {
    label: 'Pengaktifan NOP',
    bg: 'bg-teal-50/70',
    text: 'text-teal-800',
    border: 'border-teal-200/80',
    badgeBg: 'bg-teal-100 text-teal-800 border-teal-300',
    description: 'Pengaktifan kembali NOP pasif/non-aktif'
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
    recentList: []
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
          recentList: res.recentList || []
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

        {/* Card 1: Total NOPEL (Pelayanan) */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200/90 shadow-3xs hover:shadow-xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total NOPEL</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#00a389] flex items-center justify-center border border-emerald-100">
              <FileText className="w-4 h-4 stroke-[2]" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-gray-900 tabular-nums">
              {loading ? '...' : data.totalNopel}
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
              Permohonan
            </span>
          </div>
          <p className="text-[10px] font-medium text-gray-500 mt-1.5 truncate" title="Nomor Pelayanan unik">
            Nomor Pelayanan unik
          </p>
        </div>

        {/* Card 2: Total Pemohon (Akumulasi Nama Pemilik Baru) */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200/90 shadow-3xs hover:shadow-xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Pemohon</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Users className="w-4 h-4 stroke-[2]" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-gray-900 tabular-nums">
              {loading ? '...' : data.totalPemohon}
            </span>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60">
              Pemohon
            </span>
          </div>
          <div className="text-[10px] font-medium text-gray-500 mt-1.5 truncate">
            {data.totalPemohon > data.totalNopel ? (
              <span className="text-blue-800 font-bold bg-blue-50 px-1 py-0.5 rounded border border-blue-200/70 inline-block" title={`+${data.totalPemohon - data.totalNopel} pemohon dari Mutasi Sebagian`}>
                +{data.totalPemohon - data.totalNopel} pemohon ekstra
              </span>
            ) : (
              <span>Seluruh nama pemohon</span>
            )}
          </div>
        </div>

        {/* Card 3: Dalam Proses */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200/90 shadow-3xs hover:shadow-xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Dalam Proses</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Clock className="w-4 h-4 stroke-[2]" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-gray-900 tabular-nums">
              {loading ? '...' : data.globalProses}
            </span>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60">
              Berkas
            </span>
          </div>
          <p className="text-[10px] font-medium text-gray-500 mt-1.5 truncate" title="Sedang diproses di tahapan kerja">
            Sedang diproses
          </p>
        </div>

        {/* Card 4: Selesai */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200/90 shadow-3xs hover:shadow-xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Berkas Selesai</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
              <CheckCircle2 className="w-4 h-4 stroke-[2]" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-gray-900 tabular-nums">
              {loading ? '...' : data.globalSelesai}
            </span>
            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200/60">
              Selesai
            </span>
          </div>
          <p className="text-[10px] font-medium text-gray-500 mt-1.5 truncate" title="Telah diverifikasi">
            Telah diverifikasi
          </p>
        </div>

        {/* Card 5: Berkas Sudah Dikirim */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200/90 shadow-3xs hover:shadow-xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Sudah Dikirim</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <Send className="w-4 h-4 stroke-[2]" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-gray-900 tabular-nums">
              {loading ? '...' : data.globalDikirim}
            </span>
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200/60">
              Dikirim
            </span>
          </div>
          <p className="text-[10px] font-medium text-gray-500 mt-1.5 truncate" title="Telah bermanifest / dikirim">
            Telah dikirim / manifest
          </p>
        </div>

        {/* Card 6: Berkas Revisi */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200/90 shadow-3xs hover:shadow-xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Berkas Revisi</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <AlertTriangle className="w-4 h-4 stroke-[2]" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-gray-900 tabular-nums">
              {loading ? '...' : data.globalRevisi}
            </span>
            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200/60">
              Revisi
            </span>
          </div>
          <p className="text-[10px] font-medium text-gray-500 mt-1.5 truncate" title="Perlu perbaikan data / berkas">
            Perlu perbaikan data
          </p>
        </div>

      </div>

      {/* ========================================== */}
      {/* 2. STATISTIK RINCI PER JENIS LAYANAN      */}
      {/* ========================================== */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#00a389] flex items-center justify-center">
              <Layers className="w-4 h-4 stroke-[2]" />
            </div>
            <h2 className="text-base font-extrabold text-gray-900">Rincian Berkas Per Jenis Layanan</h2>
          </div>
          <button
            onClick={loadData}
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            title="Refresh Data Statistik"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200/90 shadow-3xs">
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

              const total = item.totalNopel || 0;
              const selesaiPct = total > 0 ? Math.round((item.selesaiCount / total) * 100) : 0;

              return (
                <div key={key} className={`rounded-xl p-4 border ${meta.border} ${meta.bg} flex flex-col justify-between gap-3 transition-all hover:shadow-xs`}>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-extrabold px-2.5 py-1 rounded-md border ${meta.badgeBg}`}>
                        {meta.label}
                      </span>
                    </div>
                    <p className="text-[11px] font-medium text-gray-600 mt-1 leading-snug">
                      {meta.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200/60">
                    <div className="flex flex-col bg-white/80 backdrop-blur-xs p-2 rounded-lg border border-gray-200/50">
                      <span className="text-[10px] font-bold text-gray-500 uppercase">Total NOPEL</span>
                      <span className="text-lg font-extrabold text-gray-900 tabular-nums">{item.totalNopel}</span>
                    </div>
                    <div className="flex flex-col bg-white/80 backdrop-blur-xs p-2 rounded-lg border border-gray-200/50">
                      <span className="text-[10px] font-bold text-gray-500 uppercase">Total Pemohon</span>
                      <span className="text-lg font-extrabold text-gray-900 tabular-nums">{item.totalPemohon}</span>
                    </div>
                    {key === 'MUTASI_SEBAGIAN' && item.totalPemohon > item.totalNopel && (
                      <div className="text-[10px] font-extrabold text-emerald-900 bg-emerald-100/90 px-2 py-1 rounded-md border border-emerald-300 col-span-2 text-center">
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
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center border border-blue-200/80">
              <MapPin className="w-5 h-5 stroke-[2]" />
            </div>
            <h2 className="text-base font-extrabold text-gray-900">Distribusi Pemohon Per Wilayah Objek Pajak</h2>
          </div>

          {/* Switcher Tab */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200/80 text-xs font-extrabold select-none shrink-0">
            <button
              onClick={() => setViewMode('kecamatan')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'kecamatan'
                  ? 'bg-white text-gray-900 shadow-3xs font-bold'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Per Kecamatan ({data.byKecamatan.length})
            </button>
            <button
              onClick={() => setViewMode('desa')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'desa'
                  ? 'bg-white text-gray-900 shadow-3xs font-bold'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Per Desa / Kelurahan ({data.byDesa.length})
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
                      <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-extrabold shrink-0 ${
                        idx === 0 ? 'bg-amber-100 text-amber-900 border border-amber-300' :
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
