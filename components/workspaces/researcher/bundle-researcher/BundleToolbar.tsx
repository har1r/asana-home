"use client";

import React from "react";
import { Search, Plus, X, RefreshCw } from "lucide-react";

export interface BundleToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterJenisLayanan: string;
  onFilterJenisChange: (jenis: string) => void;
  filterBundleStatus: string;
  onFilterStatusChange: (status: string) => void;
  onCreateBundle: () => void;
  isLoading?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  bundleJenisCounts?: Record<string, number>;
}

export const BundleToolbar: React.FC<BundleToolbarProps> = React.memo(({
  searchQuery,
  onSearchChange,
  filterJenisLayanan,
  onFilterJenisChange,
  filterBundleStatus,
  onFilterStatusChange,
  onCreateBundle,
  isLoading = false,
  onRefresh,
  isRefreshing = false,
  bundleJenisCounts = {},
}) => {
  const [isBundleSearchFocused, setIsBundleSearchFocused] = React.useState(false);

  const jenisFilterOptions = [
    { val: 'ALL', label: 'Semua' },
    { val: 'MUTASI_SEBAGIAN', label: 'Mutasi Sebagian' },
    { val: 'MUTASI_PENGGABUNGAN', label: 'Mutasi Penggabungan' },
    { val: 'MUTASI_HABIS_UPDATE', label: 'Mutasi Habis (Update)' },
    { val: 'MUTASI_HABIS_REGULER', label: 'Mutasi Habis (Reguler)' },
    { val: 'OBJEK_PAJAK_BARU', label: 'OP Baru' },
    { val: 'PEMBETULAN', label: 'Pembetulan' },
    { val: 'PENGAKTIFAN', label: 'Pengaktifan' }
  ];

  return (
    <div className="flex flex-col gap-2.5 bg-slate-50/90 border border-slate-200/80 p-3 rounded-md shadow-3xs select-none">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search input for Bundles */}
        <div className="relative w-full md:w-[403px] max-w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsBundleSearchFocused(true)}
            onBlur={() => setIsBundleSearchFocused(false)}
            className="w-full h-10 pl-10 pr-14 bg-white hover:bg-slate-50 focus:bg-white border border-slate-200 hover:border-slate-300 focus:border-[#00a389] rounded-md text-[13px] font-normal text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-3xs font-sans"
            placeholder="Cari No. Bundle, Jenis Pelayanan."
          />
          {!isBundleSearchFocused && !searchQuery && (
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/80 select-none pointer-events-none font-sans">
              Ctrl+K
            </span>
          )}
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 z-10 p-0.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              title="Hapus Pencarian"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right side controls: Buat Button + Refresh Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onCreateBundle}
            disabled={isLoading}
            className="px-4 py-2 h-10 bg-[#00a389] hover:bg-[#008f78] active:scale-95 text-white font-normal text-[13px] font-sans rounded-md shadow-3xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Buat</span>
          </button>

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing || isLoading}
              className="p-2.5 h-10 w-10 rounded-md border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-500 shadow-3xs transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center shrink-0"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 transition-all duration-300 ${isRefreshing ? 'animate-spin text-[#00a389]' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Filter Jenis Layanan Pills for Bundles */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1 border-t border-slate-200/60 shrink-0 select-none font-sans">
        {jenisFilterOptions.map((item) => {
          const isActive = filterJenisLayanan === item.val;
          const count = bundleJenisCounts[item.val] ?? 0;
          return (
            <button
              key={item.val}
              type="button"
              onClick={() => onFilterJenisChange(item.val)}
              className={`h-7 px-2.5 rounded-md text-[13px] font-normal font-sans transition-all shrink-0 flex items-center gap-1.5 cursor-pointer border ${
                isActive
                  ? 'bg-[#00a389] text-white border-[#00a389] shadow-3xs'
                  : 'bg-white text-slate-600 border-slate-200/90 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              <span>{item.label}</span>
              {bundleJenisCounts[item.val] !== undefined && (
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold font-mono ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
});

BundleToolbar.displayName = "BundleToolbar";
