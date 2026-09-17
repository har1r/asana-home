"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, X, Loader2, RefreshCw, ChevronDown, Check } from "lucide-react";

const STATUS_LABEL_MAP: Record<string, string> = {
  SUBMITTED: "Diajukan",
  REVISION: "Revisi",
  BUNDLED: "Terbundel",
  LOCKED: "Terkunci",
  IN_MANIFEST: "Dimanifest",
  ARCHIVED: "Diarsipkan",
  COMPLETED: "Selesai",
  REJECTED: "Ditolak",
  DRAFT: "Draf",
  VOID: "Dibatalkan",
  SENT: "Dikirim",
};

const getStatusLabel = (status: string) => {
  if (!status) return "—";
  if (STATUS_LABEL_MAP[status]) return STATUS_LABEL_MAP[status];
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

export interface SenderBundleToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit?: () => void;
  onClearSearch: () => void;
  onRefresh?: () => void;
  totalBundlesCount: number;
  loading?: boolean;
  isRefreshing?: boolean;
  listLoading?: boolean;
  selectedManifest?: any;
  manifestsList?: any[];
  onSelectManifest?: (manifest: any) => void;
}

export const SenderBundleToolbar: React.FC<SenderBundleToolbarProps> = React.memo(({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  onRefresh,
  totalBundlesCount,
  loading = false,
  isRefreshing = false,
  listLoading = false,
  selectedManifest,
  manifestsList = [],
  onSelectManifest,
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isManifestDropdownOpen, setIsManifestDropdownOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName?.toLowerCase();
      const isTyping = tag === "input" || tag === "textarea" || tag === "select" || (e.target as HTMLElement).isContentEditable;
      if (
        ((e.ctrlKey || e.metaKey) && (e.key?.toLowerCase() === "k" || e.code === "KeyK")) ||
        (e.key === "/" && !isTyping)
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit();
    }
  };

  const selectedManifestNumber = selectedManifest?.nomorManifest || selectedManifest?.manifestNumber || "";
  const draftManifestsList = (manifestsList || []).filter((m: any) => m.status === "DRAFT");

  return (
    <div className="flex flex-col gap-3 font-sans select-none">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Custom Manifest Dropdown (Filtered only for DRAFT status) */}
        <div className="relative shrink-0 flex items-center">
          {draftManifestsList.length > 0 ? (
            <div className="relative font-sans">
              <button
                type="button"
                onClick={() => setIsManifestDropdownOpen(!isManifestDropdownOpen)}
                className="h-10 px-3 bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-slate-300 rounded-md flex items-center gap-1.5 text-xs font-semibold text-slate-800 transition-all cursor-pointer shadow-3xs font-sans"
                title="Pilih Manifest Target"
              >
                <span className="font-mono text-slate-900 font-bold truncate max-w-[220px]">
                  {selectedManifestNumber || "Pilih Manifest Target"}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5 shrink-0" />
              </button>

              {/* Dropdown Menu for selecting target manifest */}
              {isManifestDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setIsManifestDropdownOpen(false)}
                  />
                  <div className="absolute left-0 mt-1 w-72 bg-white border border-slate-200 rounded-md shadow-lg z-30 py-1 max-h-60 overflow-y-auto font-sans">
                    <div className="px-3 py-1.5 text-[11px] font-bold text-slate-500 capitalize border-b border-slate-100">
                      Pilih Manifest Target
                    </div>
                    {draftManifestsList.map((m: any) => {
                      const isSelected = selectedManifest?.id === m.id;
                      const rawNum = m.nomorManifest || m.manifestNumber || m.id || "—";
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            if (onSelectManifest) onSelectManifest(m);
                            setIsManifestDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${isSelected ? "bg-emerald-50 text-[#00a389] font-semibold" : "text-slate-700 hover:bg-slate-50"
                            }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="font-mono truncate">{rawNum}</span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#00a389] shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="h-10 px-3 bg-slate-100/80 border border-slate-200/80 rounded-md flex items-center gap-1.5 text-xs font-medium text-slate-500 shadow-3xs font-sans">
              <span className="font-mono text-slate-600 truncate max-w-[220px]">
                {selectedManifestNumber || "Belum Ada Manifest Draf"}
              </span>
            </div>
          )}
        </div>

        {/* Right: Search Form */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-[340px] max-w-full font-sans">
            <input
              type="text"
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="w-full h-10 pl-3 pr-9 bg-white hover:bg-slate-50 focus:bg-white border border-slate-200 hover:border-slate-300 focus:border-[#00a389] rounded-md text-[13px] font-normal text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-3xs font-sans"
              placeholder="Cari nomor bundle..."
            />
            {!isSearchFocused && !searchQuery && (
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200/80 select-none pointer-events-none">
                Ctrl+K
              </span>
            )}
            {searchQuery && (
              <button
                type="button"
                onClick={onClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 z-10 p-0.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                title="Bersihkan pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={listLoading || loading}
            className="px-3.5 h-10 bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-medium text-[13px] rounded-md border border-slate-200/90 shadow-3xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
          >
            {listLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" />
            ) : (
              <Search className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span>Cari</span>
          </button>
        </form>
      </div>
    </div>
  );
});
