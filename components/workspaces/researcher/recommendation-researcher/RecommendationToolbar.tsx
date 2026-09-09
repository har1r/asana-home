"use client";

import React, { useRef, useEffect } from "react";
import { Search, X, Printer, Lock } from "lucide-react";

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
  searchQuery,
  onSearchChange,
  onPrint,
  onLockBundle,
  isLoading = false,
}) => {
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

      {/* 2. Right Side: Action Buttons (Lock Bundle & Print Recommendation) */}
      <div className="flex items-center gap-3 shrink-0">
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
