"use client";

import React from "react";
import { Search, Plus, RefreshCw, X } from "lucide-react";

interface SenderManifestToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  isSearchFocused: boolean;
  onSearchFocus: () => void;
  onSearchBlur: () => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  onCreateManifest: () => void;
  onRefresh: () => void;
  loading: boolean;
  isRefreshing: boolean;
  listLoading: boolean;
}

export const SenderManifestToolbar: React.FC<SenderManifestToolbarProps> = React.memo(({
  searchQuery,
  onSearchChange,
  isSearchFocused,
  onSearchFocus,
  onSearchBlur,
  searchInputRef,
  onCreateManifest,
  onRefresh,
  loading,
  isRefreshing,
  listLoading,
}) => {
  return (
    <div className="flex flex-col gap-3 font-sans select-none">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search input for Manifests */}
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
            placeholder="Cari nomor manifest..."
          />
          {!isSearchFocused && !searchQuery && (
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200/80 select-none pointer-events-none">
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

        {/* Right side controls: Buat Button + Refresh Button */}
        <div className="flex items-center gap-2 shrink-0 font-sans">
          <button
            onClick={onCreateManifest}
            disabled={loading}
            className="px-4 py-2 h-10 bg-[#00a389] hover:bg-[#008f78] active:scale-95 text-white font-normal text-[13px] font-sans rounded-md shadow-3xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Buat Manifest</span>
          </button>
        </div>
      </div>
    </div>
  );
});

SenderManifestToolbar.displayName = "SenderManifestToolbar";
