"use client";

import React from "react";
import { Search, X } from "lucide-react";

interface MonitorBundleToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  isSearchFocused: boolean;
  onSearchFocus: () => void;
  onSearchBlur: () => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  filterJenisLayanan: string;
  onFilterJenisChange: (jenis: string) => void;
  bundleJenisCounts: Record<string, number>;
}

export const MonitorBundleToolbar: React.FC<MonitorBundleToolbarProps> = React.memo(({
  searchQuery,
  onSearchChange,
  isSearchFocused,
  onSearchFocus,
  onSearchBlur,
  searchInputRef,
  filterJenisLayanan,
  onFilterJenisChange,
  bundleJenisCounts,
}) => {
  const jenisFilterOptions = [
    { val: "ALL", label: "Semua" },
    { val: "MUTASI_SEBAGIAN", label: "Mutasi Sebagian" },
    { val: "MUTASI_HABIS_UPDATE", label: "Mutasi Habis (Update)" },
    { val: "MUTASI_HABIS_REGULER", label: "Mutasi Habis (Reguler)" },
    { val: "OBJEK_PAJAK_BARU", label: "OP Baru" },
    { val: "PEMBETULAN", label: "Pembetulan" },
    { val: "PENGAKTIFAN", label: "Pengaktifan" },
  ];

  return (
    <div className="flex flex-col gap-3 font-sans select-none">
      {/* Search Bar Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
        <div className="relative w-full md:w-[403px] max-w-full font-sans">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
          <input
            type="text"
            ref={searchInputRef}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={onSearchFocus}
            onBlur={onSearchBlur}
            className="w-full h-10 pl-10 pr-14 bg-white hover:bg-slate-50 focus:bg-white border border-slate-200 hover:border-slate-300 focus:border-[#00a389] rounded-md text-[13px] font-normal text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-3xs font-sans"
            placeholder="Cari nomor bundle..."
          />
          {!isSearchFocused && !searchQuery && (
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200/80 select-none pointer-events-none font-sans">
              Ctrl+K
            </span>
          )}
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 z-10 p-0.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Filter Chips (Pilih Jenis Layanan Praktis dengan Angka Count) */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5 shrink-0 select-none font-sans">
        {jenisFilterOptions.map((item) => {
          const isActive = filterJenisLayanan === item.val;
          const count = bundleJenisCounts[item.val] ?? 0;
          return (
            <button
              key={item.val}
              type="button"
              onClick={() => onFilterJenisChange(item.val)}
              className={`px-3 py-1 rounded-md text-[12px] font-normal transition-all shrink-0 flex items-center gap-1.5 cursor-pointer border font-sans capitalize ${
                isActive
                  ? "bg-[#00a389] text-white border-[#00a389] shadow-3xs"
                  : "bg-white text-slate-600 hover:bg-slate-50 border-slate-200/90"
              }`}
            >
              <span>{item.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-md text-[10px] font-semibold ${
                  isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
});

MonitorBundleToolbar.displayName = "MonitorBundleToolbar";
