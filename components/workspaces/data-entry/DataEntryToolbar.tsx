"use client";

import React, { useState } from 'react';
import { Search, X, ChevronDown, Check, RefreshCw } from 'lucide-react';

export interface DataEntryToolbarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onClearSearch: () => void;
  jenisFilter: string;
  onJenisFilterChange: (val: string) => void;
  filterJenisApp: string;
  onFilterJenisAppChange: (val: string) => void;
  startDate: string;
  onStartDateChange: (val: string) => void;
  endDate: string;
  onEndDateChange: (val: string) => void;
  sortBy: 'last_modified' | 'newest' | 'oldest' | 'a_z';
  onSortByChange: (val: 'last_modified' | 'newest' | 'oldest' | 'a_z') => void;
  displayMode: 'berkas' | 'pemohon';
  onSwitchDisplayMode: (mode: 'berkas' | 'pemohon') => void;
  isRefreshing: boolean;
  onRefresh: () => void;
  jenisOptions: readonly { value: string; label: string }[];
}

export const DataEntryToolbar: React.FC<DataEntryToolbarProps> = React.memo(({
  searchQuery,
  onSearchChange,
  onClearSearch,
  jenisFilter,
  onJenisFilterChange,
  filterJenisApp,
  onFilterJenisAppChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  sortBy,
  onSortByChange,
  displayMode,
  onSwitchDisplayMode,
  isRefreshing,
  onRefresh,
  jenisOptions
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

        {/* Right Side: Filters, Refresh, and Sort */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Dropdown Filter Jenis Layanan */}
          <select
            value={jenisFilter}
            onChange={(e) => {
              onJenisFilterChange(e.target.value);
              onFilterJenisAppChange(e.target.value);
            }}
            className="h-10 px-3 bg-white border border-slate-200/90 rounded-md text-[13px] font-normal text-slate-700 focus:outline-none focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 transition-all cursor-pointer font-sans"
          >
            <option value="ALL">Semua Jenis Layanan</option>
            {jenisOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Date Filter Range */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200/90 rounded-md px-2.5 py-1.5 text-[13px]">
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="text-slate-700 text-xs focus:outline-none bg-transparent font-sans cursor-pointer"
            />
            <span className="text-slate-400">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="text-slate-700 text-xs focus:outline-none bg-transparent font-sans cursor-pointer"
            />
          </div>

          {/* Tombol Refresh Table */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-10 w-10 bg-white border border-slate-200/90 hover:border-slate-300 rounded-md flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#00a389]' : ''}`} />
          </button>
        </div>
      </div>

      {/* FILTER CHIPS & TAB SWITCHER BAR */}
      <div className="flex items-center justify-between gap-3 flex-wrap select-none pt-1">
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
                  { id: 'newest', label: 'Terbaru (Tgl. Nopel)' },
                  { id: 'oldest', label: 'Terlama (Tgl. Nopel)' },
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
            onClick={() => onSwitchDisplayMode('berkas')}
            className={`h-7 px-3 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${displayMode === 'berkas'
              ? 'bg-white text-slate-900 shadow-3xs font-normal'
              : 'text-slate-600 hover:text-slate-900'
              }`}
            title="Tampilkan 1 baris per Nomor Pelayanan (NOPEL)"
          >
            <span>Nopel</span>
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
