"use client";

import React, { useState } from 'react';
import { Search, X, ChevronDown, Check, RefreshCw, Plus } from 'lucide-react';

export interface DataEntryToolbarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onClearSearch: () => void;
  jenisFilter: string;
  onJenisFilterChange: (val: string) => void;
  filterJenisApp: string;
  onFilterJenisAppChange: (val: string) => void;
  jenisCounts: Record<string, number>;
  sortBy: 'last_modified' | 'newest' | 'oldest' | 'a_z';
  onSortByChange: (val: 'last_modified' | 'newest' | 'oldest' | 'a_z') => void;
  displayMode: 'permohonan' | 'pemohon';
  onSwitchDisplayMode: (mode: 'permohonan' | 'pemohon') => void;
  isRefreshing: boolean;
  onRefresh: () => void;
  jenisOptions?: readonly { value: string; label: string }[];
  onAddNew?: () => void;
}

export const DataEntryToolbar: React.FC<DataEntryToolbarProps> = React.memo(({
  searchQuery,
  onSearchChange,
  onClearSearch,
  jenisFilter,
  onJenisFilterChange,
  filterJenisApp,
  onFilterJenisAppChange,
  jenisCounts,
  sortBy,
  onSortByChange,
  displayMode,
  onSwitchDisplayMode,
  isRefreshing,
  onRefresh,
  onAddNew
}) => {
  const [isSortOpen, setIsSortOpen] = useState(false);

  const getSortLabel = (sortKey: string) => {
    switch (sortKey) {
      case 'last_modified': return 'Terbaru Diperbarui';
      case 'newest': return 'Terbaru (Tgl. Nopel)';
      case 'oldest': return 'Terlama (Tgl. Nopel)';
      case 'a_z': return 'A - Z (Nama Pemohon)';
      default: return 'Urutkan';
    }
  };

  const jenisPills = [
    { value: 'ALL', label: 'Semua' },
    { value: 'MUTASI_SEBAGIAN', label: 'Mutasi Sebagian' },
    { value: 'MUTASI_PENGGABUNGAN', label: 'Mutasi Penggabungan' },
    { value: 'MUTASI_HABIS_UPDATE', label: 'Mutasi Habis Update' },
    { value: 'MUTASI_HABIS_REGULER', label: 'Mutasi Habis Reguler' },
    { value: 'OBJEK_PAJAK_BARU', label: 'Objek Pajak Baru' },
    { value: 'PEMBETULAN', label: 'Pembetulan' },
    { value: 'PENGAKTIFAN', label: 'Pengaktifan' },
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* TIER 2: SEARCH & CONTROLS TOOLBAR */}
      <div className="p-3 border border-slate-200/90 rounded-md bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-3xs">
        {/* Left Side: Search Bar */}
        <div className="relative w-full md:w-[403px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari NOP, Nopel, atau Nama Pemohon..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200/90 rounded-md text-[13px] font-normal text-slate-900 focus:outline-none focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 transition-all font-sans"
          />
          {searchQuery && (
            <button
              onClick={onClearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right Side: Refresh & Add Button */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Tombol Tambah Entri Baru */}
          {onAddNew && (
            <button
              onClick={onAddNew}
              className="h-10 px-4 bg-[#00a389] hover:bg-[#008f78] active:bg-[#007a67] text-white rounded-md text-[13px] font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-3xs font-sans shrink-0"
              title="Tambah Permohonan / Entri Baru"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>Ajukan Permohonan</span>
            </button>
          )}
        </div>
      </div>

      {/* HORIZONTAL FILTER PILLS FOR JENIS LAYANAN */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden select-none">
        {jenisPills.map((opt) => {
          const isSelected =
            jenisFilter === opt.value ||
            (opt.value === 'MUTASI_SEBAGIAN' && (jenisFilter === 'PARTIAL_MUTATION' || jenisFilter === 'MUTASI_SEBAGIAN')) ||
            (opt.value === 'MUTASI_PENGGABUNGAN' && (jenisFilter === 'MERGER_MUTATION' || jenisFilter === 'MUTASI_PENGGABUNGAN')) ||
            (opt.value === 'MUTASI_HABIS_UPDATE' && (jenisFilter === 'EXPIRED_UPDATE' || jenisFilter === 'MUTASI_HABIS_UPDATE')) ||
            (opt.value === 'MUTASI_HABIS_REGULER' && (jenisFilter === 'EXPIRED_REGULAR' || jenisFilter === 'MUTASI_HABIS_REGULER')) ||
            (opt.value === 'OBJEK_PAJAK_BARU' && (jenisFilter === 'NEW_TAX_OBJECT' || jenisFilter === 'OBJEK_PAJAK_BARU')) ||
            (opt.value === 'PEMBETULAN' && (jenisFilter === 'CORRECTION' || jenisFilter === 'PEMBETULAN')) ||
            (opt.value === 'PENGAKTIFAN' && (jenisFilter === 'REACTIVATION' || jenisFilter === 'PENGAKTIFAN'));

          const count = jenisCounts[opt.value] ?? (opt.value === 'ALL' ? jenisCounts.ALL : 0);

          return (
            <button
              key={opt.value}
              onClick={() => {
                onJenisFilterChange(opt.value);
                onFilterJenisAppChange(opt.value);
              }}
              className={`h-8 px-3 rounded-md text-[12px] font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 font-sans shrink-0 border ${isSelected
                ? 'bg-[#00a389] text-white border-[#00a389] shadow-3xs font-semibold'
                : 'bg-white text-slate-600 border-slate-200/90 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              <span>{opt.label}</span>
              <span
                className={`px-1.5 py-0.2 text-[10px] font-extrabold rounded-full ${isSelected
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 text-slate-500'
                  }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* SORT & DISPLAY MODE SWITCHER BAR */}
      <div className="flex items-center justify-between gap-3 flex-wrap select-none pt-0.5">
        {/* Left Side: Sort Popover Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsSortOpen(!isSortOpen)}
            className="h-8 px-3 rounded-md bg-white border border-slate-200/90 hover:border-slate-300 text-slate-700 font-normal text-[13px] font-sans transition-all cursor-pointer shadow-3xs flex items-center gap-1.5"
          >
            <span>{getSortLabel(sortBy)}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Dropdown Menu Popover */}
          {isSortOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setIsSortOpen(false)}
              />
              <div className="absolute left-0 mt-1 w-52 bg-white rounded-md shadow-md border border-slate-200/90 py-1 z-30 animate-fadeIn font-sans">
                {[
                  { id: 'last_modified', label: 'Terbaru Diperbarui' },
                  { id: 'newest', label: 'Terbaru (Tgl. Permohonan)' },
                  { id: 'oldest', label: 'Terlama (Tgl. Permohonan)' },
                  { id: 'a_z', label: 'A - Z (Nama Pemohon)' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      onSortByChange(opt.id as any);
                      setIsSortOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-[13px] transition-colors cursor-pointer flex items-center justify-between font-sans text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-normal"
                  >
                    <span>{opt.label}</span>
                    {sortBy === opt.id && (
                      <Check className="w-3.5 h-3.5" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right Side: Tab Mode Switcher (Nopel & Pemohon) */}
        <div className="bg-slate-200/70 p-0.5 rounded-md flex items-center gap-0.5 border border-slate-300/60 text-[13px] font-normal select-none h-8 font-sans">
          <button
            onClick={() => onSwitchDisplayMode('permohonan')}
            className={`h-7 px-3 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${displayMode === 'permohonan'
              ? 'bg-white text-slate-900 shadow-3xs font-normal'
              : 'text-slate-600 hover:text-slate-900'
              }`}
            title="Tampilkan 1 baris per Nomor Pelayanan (NOPEL)"
          >
            <span>Permohonan</span>
          </button>
          <button
            onClick={() => onSwitchDisplayMode('pemohon')}
            className={`h-7 px-3 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${displayMode === 'pemohon'
              ? 'bg-white text-slate-900 shadow-3xs font-normal'
              : 'text-slate-600 hover:text-slate-900'
              }`}
            title="Tampilkan rincian pecahan pemilik baru (Mutasi Sebagian)"
          >
            <span>Pemohon</span>
          </button>
        </div>
      </div>
    </div>
  );
});

DataEntryToolbar.displayName = 'DataEntryToolbar';
