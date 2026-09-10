"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X, ChevronDown, Check } from "lucide-react";
import { formatBundleNumber } from "@/components/workspaces/shared/constants";

export interface QueueToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearSearch?: () => void;
  filterJenisLayanan: string;
  onFilterJenisChange: (jenis: string) => void;
  jenisCounts?: Record<string, number>;
  sortBy: "last_modified" | "newest" | "oldest" | "a_z";
  onSortByChange: (sort: "last_modified" | "newest" | "oldest" | "a_z") => void;
  displayMode?: 'permohonan' | 'pemohon';
  onSwitchDisplayMode?: (mode: 'permohonan' | 'pemohon') => void;
  itemsPerPage?: number;
  onItemsPerPageChange?: (num: number) => void;
  totalItems: number;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  selectedBundle?: any;
  bundlesList?: any[];
  onSelectBundle?: (bundle: any) => void;
}

export const QueueToolbar: React.FC<QueueToolbarProps> = React.memo(({
  searchQuery,
  onSearchChange,
  onClearSearch,
  filterJenisLayanan,
  onFilterJenisChange,
  jenisCounts = {},
  sortBy,
  onSortByChange,
  displayMode = 'permohonan',
  onSwitchDisplayMode,
  itemsPerPage = 10,
  onItemsPerPageChange,
  totalItems,
  isRefreshing = false,
  onRefresh,
  selectedBundle,
  bundlesList = [],
  onSelectBundle,
}) => {
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isBundleDropdownOpen, setIsBundleDropdownOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut Ctrl+K or '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      const isTyping = tag === 'input' || tag === 'textarea' || tag === 'select' || (e.target as HTMLElement).isContentEditable;
      if ((e.ctrlKey && e.key === 'k') || (e.key === '/' && !isTyping)) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getSortLabel = (sortKey: string) => {
    switch (sortKey) {
      case 'last_modified': return 'Terbaru Diperbarui';
      case 'newest': return 'Terbaru (Tgl. Permohonan)';
      case 'oldest': return 'Terlama (Tgl. Permohonan)';
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

  // Formatting selected bundle number matching BundleCard standard
  const rawSelectedNum = selectedBundle?.nomorBundle || selectedBundle?.bundleNumber || '';
  const formattedSelectedNumber = rawSelectedNum
    ? formatBundleNumber(rawSelectedNum, selectedBundle?.createdAt)
    : (selectedBundle?.name || selectedBundle?.id || '');

  return (
    <div className="flex flex-col gap-3 font-sans select-none">
      {/* TIER 1: SEARCH & CONTROLS TOOLBAR (JUSTIFY BETWEEN) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left Side: Search Bar */}
        <div className="relative w-full md:w-[403px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Cari NOP, Nopel, atau Nama Pemohon..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-14 py-2 bg-white border border-slate-200/90 rounded-md text-[13px] font-normal text-slate-900 focus:outline-none focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 transition-all font-sans"
          />
          {!searchQuery && (
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-slate-200 bg-slate-100 px-1.5 font-mono text-[10px] font-medium text-slate-400">
              Ctrl+K
            </kbd>
          )}
          {searchQuery && (
            <button
              onClick={() => onClearSearch ? onClearSearch() : onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors cursor-pointer"
              title="Hapus Pencarian"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right Side: Pemilih Target Bundle Diisi (Hanya Nomor Bundle & Arrow Dropdown) */}
        <div className="relative shrink-0 flex items-center">
          {bundlesList && bundlesList.length > 0 ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsBundleDropdownOpen(!isBundleDropdownOpen)}
                className="h-[38px] px-3 bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-slate-300 rounded-md flex items-center gap-1.5 text-xs font-semibold text-slate-800 transition-all cursor-pointer shadow-3xs font-sans"
                title="Pilih Target Bundle untuk Diisi"
              >
                <span className="font-mono text-slate-900 font-bold truncate max-w-[220px]">
                  {formattedSelectedNumber || 'Pilih Bundle Target'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5 shrink-0" />
              </button>

              {/* Dropdown Menu for selecting target bundle */}
              {isBundleDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setIsBundleDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-1 w-72 bg-white border border-slate-200 rounded-md shadow-lg z-30 py-1 max-h-60 overflow-y-auto font-sans">
                    <div className="px-3 py-1.5 text-[11px] font-bold text-slate-500 capitalize border-b border-slate-100">
                      Pilih Target Bundle Diisi
                    </div>
                    {bundlesList.map((b: any) => {
                      const isSelected = selectedBundle?.id === b.id;
                      const rawNum = b.nomorBundle || b.bundleNumber || '';
                      const formattedNum = rawNum ? formatBundleNumber(rawNum, b.createdAt) : (b.name || b.id || '—');
                      return (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => {
                            if (onSelectBundle) onSelectBundle(b);
                            setIsBundleDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected ? 'bg-emerald-50 text-[#00a389] font-semibold' : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="font-mono truncate">{formattedNum}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#00a389] shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="h-[38px] px-3 bg-slate-100/80 border border-slate-200/80 rounded-md flex items-center gap-1.5 text-xs font-medium text-slate-500 shadow-3xs font-sans">
              <span className="font-mono text-slate-600 truncate max-w-[220px]">
                {formattedSelectedNumber || 'Belum Ada Bundle Target'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* TIER 2: HORIZONTAL FILTER PILLS FOR JENIS LAYANAN */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden select-none">
        {jenisPills.map((opt) => {
          const isSelected =
            filterJenisLayanan === opt.value ||
            (opt.value === 'MUTASI_SEBAGIAN' && (filterJenisLayanan === 'PARTIAL_MUTATION' || filterJenisLayanan === 'MUTASI_SEBAGIAN')) ||
            (opt.value === 'MUTASI_PENGGABUNGAN' && (filterJenisLayanan === 'MERGER_MUTATION' || filterJenisLayanan === 'MUTASI_PENGGABUNGAN')) ||
            (opt.value === 'MUTASI_HABIS_UPDATE' && (filterJenisLayanan === 'EXPIRED_UPDATE' || filterJenisLayanan === 'MUTASI_HABIS_UPDATE')) ||
            (opt.value === 'MUTASI_HABIS_REGULER' && (filterJenisLayanan === 'EXPIRED_REGULAR' || filterJenisLayanan === 'MUTASI_HABIS_REGULER')) ||
            (opt.value === 'OBJEK_PAJAK_BARU' && (filterJenisLayanan === 'NEW_TAX_OBJECT' || filterJenisLayanan === 'OBJEK_PAJAK_BARU')) ||
            (opt.value === 'PEMBETULAN' && (filterJenisLayanan === 'CORRECTION' || filterJenisLayanan === 'PEMBETULAN')) ||
            (opt.value === 'PENGAKTIFAN' && (filterJenisLayanan === 'REACTIVATION' || filterJenisLayanan === 'PENGAKTIFAN'));

          const count = jenisCounts[opt.value] ?? (opt.value === 'ALL' ? totalItems : 0);

          return (
            <button
              key={opt.value}
              onClick={() => onFilterJenisChange(opt.value)}
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

      {/* TIER 3: SORT DROPDOWN & DISPLAY MODE SWITCHER */}
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
                      <Check className="w-3.5 h-3.5 text-[#00a389]" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right Side: Tab Mode Switcher (Permohonan & Pemohon) */}
        {onSwitchDisplayMode && (
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
        )}
      </div>
    </div>
  );
});

QueueToolbar.displayName = "QueueToolbar";
