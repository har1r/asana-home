"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Search, X, Printer, ChevronDown, Check, Lock } from "lucide-react";
import { formatBundleNumber, JENIS_LABEL_MAP } from "@/components/workspaces/shared/constants";

export interface RecommendationToolbarProps {
  selectedBundle: any | null;
  bundlesList?: any[];
  onSelectBundle?: (bundle: any) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onPrint: () => void;
  onLockBundle?: (bundleId: string) => void;
  isLoading?: boolean;
}

export const RecommendationToolbar: React.FC<RecommendationToolbarProps> = React.memo(({
  selectedBundle,
  bundlesList = [],
  onSelectBundle,
  searchQuery,
  onSearchChange,
  onPrint,
  onLockBundle,
  isLoading = false,
}) => {
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

  const lockedBundles = useMemo(() => {
    return bundlesList.filter((b) => b.status === 'LOCKED' || b.status === 'IN_MANIFEST');
  }, [bundlesList]);

  return (
    <div className="p-3 border border-slate-200/90 rounded-md bg-slate-50 flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-3xs font-sans select-none animate-fadeIn">
      {/* 1. Far Left: Searchbar (Identical UI with QueueToolbar) */}
      <div className="relative flex-1 min-w-[200px] max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Cari NOP, Nopel, atau Nama Pemohon..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-14 py-2 bg-white border border-slate-200/90 rounded-md text-[13px] font-normal text-slate-900 focus:outline-none focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 transition-all font-sans"
        />
        {!searchQuery && (
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-slate-200 bg-slate-100 px-1.5 font-mono text-[10px] font-medium text-slate-400 font-sans">
            Ctrl+K
          </kbd>
        )}
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors cursor-pointer"
            title="Hapus Pencarian"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 2. Right Side: Ganti Bundle Dropdown & Print Button */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Bundle Selector Dropdown */}
        {lockedBundles.length > 0 && onSelectBundle && (
          <div className="relative inline-block text-left">
            <button
              type="button"
              onClick={() => setIsBundleDropdownOpen(!isBundleDropdownOpen)}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200/90 rounded-md text-xs font-medium text-slate-700 transition-all cursor-pointer shadow-3xs"
            >
              <span className="text-slate-500 font-normal">Ganti Bundle:</span>
              <span className="font-bold text-slate-900 font-mono">
                {selectedBundle ? formatBundleNumber(selectedBundle.bundleNumber) : 'Pilih Bundle'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isBundleDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsBundleDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-1 w-64 bg-white border border-slate-200/90 rounded-lg shadow-xl py-1 z-50 animate-fadeIn font-sans">
                  <div className="px-3 py-1.5 text-[11px] font-bold capitalize text-slate-500 border-b border-slate-100">
                    Daftar Bundle Terkunci ({lockedBundles.length})
                  </div>
                  <div className="max-h-48 overflow-y-auto divide-y divide-slate-50">
                    {lockedBundles.map((b) => {
                      const isSelected = selectedBundle?.id === b.id;
                      return (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => {
                            onSelectBundle(b);
                            setIsBundleDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-[12px] flex items-center justify-between transition-colors cursor-pointer text-left ${isSelected ? 'bg-slate-100 font-bold text-slate-900' : 'hover:bg-slate-50 text-slate-700'
                            }`}
                        >
                          <div className="truncate">
                            <div className="font-bold font-mono">{formatBundleNumber(b.bundleNumber)}</div>
                            <div className="text-[10px] text-slate-400 font-normal">
                              {JENIS_LABEL_MAP[b.applicationType] || b.applicationType} • {b.applications?.length || 0} item
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Action Button: Lock Bundle (if still DRAFT and not empty) */}
        {selectedBundle && selectedBundle.status === 'DRAFT' && onLockBundle && (
          <button
            type="button"
            onClick={() => onLockBundle(selectedBundle.id)}
            disabled={isLoading || ((selectedBundle.applications?.length || selectedBundle.permohonan?.length || 0) === 0)}
            className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-md text-[13px] font-semibold shadow-3xs transition-all font-sans ${
              ((selectedBundle.applications?.length || selectedBundle.permohonan?.length || 0) === 0)
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300/80 shadow-none'
                : 'bg-slate-900 hover:bg-slate-800 active:scale-95 text-slate-100 cursor-pointer'
            }`}
            title={((selectedBundle.applications?.length || selectedBundle.permohonan?.length || 0) === 0) ? 'Bundle kosong (0 Pemohon) tidak dapat dikunci' : 'Kunci Bundle ini agar siap dikirim ke Pengarsip'}
          >
            <Lock className={`w-3.5 h-3.5 ${((selectedBundle.applications?.length || selectedBundle.permohonan?.length || 0) === 0) ? 'text-slate-400' : 'text-amber-400'}`} />
            <span>Kunci Bundle</span>
          </button>
        )}

        {/* Action Button: Print Recommendation */}
        {selectedBundle && (
          <button
            type="button"
            onClick={onPrint}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#00a389] hover:bg-[#008f78] active:scale-95 text-white rounded-md text-[13px] font-semibold shadow-3xs transition-all cursor-pointer shrink-0 font-sans"
          >
            <Printer className="w-4 h-4 text-white" />
            <span>Cetak Rekomendasi</span>
          </button>
        )}
      </div>
    </div>
  );
});

RecommendationToolbar.displayName = "RecommendationToolbar";
