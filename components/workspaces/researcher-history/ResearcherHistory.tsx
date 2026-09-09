"use client";

import React, { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  X,
  LayoutList,
  LayoutGrid,
  RefreshCw,
  FileSpreadsheet,
  Calendar,
  User,
  MoreVertical,
  Layers,
  Lock,
  Archive,
  CheckCircle,
  History,
  Eye,
} from "lucide-react";
import { useResearcherHistory, FormattedBundleItem } from "./useResearcherHistory";
import { BundleVersionDrawer } from "@/components/workspaces/shared/BundleVersionDrawer";
import { BundleHistoryDetailView } from "./BundleHistoryDetailView";
import { EmptyDataAnimation } from "@/components/workspaces/shared/EmptyDataAnimation";

// Helper for Bundle Status Badge Styling
const getStatusBadge = (status: string) => {
  const s = (status || "").toUpperCase();
  if (s === "DRAFT") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 shadow-3xs font-sans">
        <Layers className="w-3 h-3 text-slate-500" />
        <span>Draf</span>
      </span>
    );
  }
  if (s === "LOCKED" || s === "TERKUNCI") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-900 text-white shadow-3xs font-sans">
        <Lock className="w-3 h-3 text-amber-400" />
        <span>Terkunci</span>
      </span>
    );
  }
  if (s === "IN_MANIFEST" || s === "MANIFESTED") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-[#008f78] border border-emerald-200/80 shadow-3xs font-sans">
        <Archive className="w-3 h-3 text-[#008f78]" />
        <span>Manifest</span>
      </span>
    );
  }
  if (s === "COMPLETED" || s === "ARCHIVED" || s === "DELIVERED") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300/80 shadow-3xs font-sans">
        <CheckCircle className="w-3 h-3 text-emerald-600" />
        <span>Selesai</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 shadow-3xs font-sans">
      <span>{status}</span>
    </span>
  );
};

// Formatter for Displaying Date
const formatDateDisplay = (rawDateStr?: string) => {
  if (!rawDateStr) return "-";
  const dateObj = new Date(rawDateStr);
  if (isNaN(dateObj.getTime())) return rawDateStr;
  return dateObj.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function ResearcherHistory() {
  const {
    visibleBundles,
    filteredBundles,
    hasMore,
    handleViewMore,
    loading,
    isRefreshing,
    error,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    refreshData,
  } = useResearcherHistory();

  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownMenuRef = useRef<HTMLDivElement>(null);

  // Dropdown Menu State
  const [activeMenuItem, setActiveMenuItem] = useState<FormattedBundleItem | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);

  // Bundle Detail Page View State (Full page table mimicking Cetak Rekomendasi)
  const [selectedDetailsBundle, setSelectedDetailsBundle] = useState<any | null>(null);

  // Bundle Version Drawer State
  const [selectedVersionBundle, setSelectedVersionBundle] = useState<any | null>(null);

  const handleOpenMenu = (e: React.MouseEvent, item: FormattedBundleItem) => {
    e.stopPropagation();
    if (activeMenuItem?.id === item.id) {
      setActiveMenuItem(null);
      setMenuPos(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const menuWidth = 175;
    const menuHeight = 90;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < menuHeight && rect.top > menuHeight;

    let top = openUpward ? rect.top - menuHeight - 4 : rect.bottom + 4;
    let left = rect.right - menuWidth;
    if (left < 8) left = 8;

    setActiveMenuItem(item);
    setMenuPos({ top, left });
  };

  // Close menu on click outside, scroll, or resize
  useEffect(() => {
    if (!activeMenuItem) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownMenuRef.current &&
        dropdownMenuRef.current.contains(event.target as Node)
      ) {
        return;
      }
      setActiveMenuItem(null);
      setMenuPos(null);
    };

    const handleScrollOrResize = () => {
      setActiveMenuItem(null);
      setMenuPos(null);
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [activeMenuItem]);

  // Keyboard shortcut Ctrl+K or '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      const isTyping = tag === "input" || tag === "textarea" || tag === "select" || (e.target as HTMLElement).isContentEditable;
      if ((e.ctrlKey && e.key === "k") || (e.key === "/" && !isTyping)) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // IF A BUNDLE IS SELECTED FOR DETAILS, RENDER FULL PAGE VIEW (MIMICKING CETAK REKOMENDASI TAB)
  if (selectedDetailsBundle) {
    return (
      <BundleHistoryDetailView
        bundle={selectedDetailsBundle}
        onBack={() => setSelectedDetailsBundle(null)}
      />
    );
  }

  return (
    <div className="w-full flex flex-col gap-3 animate-fadeIn font-sans select-none">
      {/* 1. HEADER SECTION (Clean Title & Refresh Button) */}
      <div className="flex items-center justify-between gap-4 py-1 select-none font-sans">
        <h1 className="text-lg font-bold text-slate-900 tracking-tight">
          Riwayat Bundle
        </h1>

        <button
          type="button"
          onClick={refreshData}
          disabled={loading || isRefreshing}
          className="h-9 px-3.5 bg-white border border-slate-200/90 hover:border-slate-300 rounded-md flex items-center gap-2 text-slate-700 hover:text-slate-900 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 shadow-3xs shrink-0"
          title="Refresh Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#00a389]" : ""}`} />
        </button>
      </div>

      {/* 2. TOOLBAR: SEARCH & VIEW MODE SWITCHER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none">
        {/* Left Side: Search Bar */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Cari Nomor Bundle, Pembuat, atau Status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-14 py-1.5 bg-white border border-slate-200/90 rounded-md text-[13px] font-normal text-slate-900 focus:outline-none focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 transition-all font-sans"
          />
          {!searchQuery && (
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-slate-200 bg-slate-100 px-1.5 font-mono text-[10px] font-medium text-slate-400 font-sans">
              Ctrl+K
            </kbd>
          )}
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors cursor-pointer"
              title="Hapus Pencarian"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right Side: Google Drive View Mode Toggle Switch */}
        <div className="flex items-center bg-white border border-slate-200/90 rounded-md p-1 shadow-3xs shrink-0 self-end sm:self-auto gap-1">
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`px-3.5 py-1.5 rounded-md transition-all cursor-pointer flex items-center justify-center ${
              viewMode === "list"
                ? "bg-slate-900 text-white shadow-3xs"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
            title="Tampilan Tabel (List View)"
          >
            <LayoutList className="w-4 h-4 stroke-[2.2]" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`px-3.5 py-1.5 rounded-md transition-all cursor-pointer flex items-center justify-center ${
              viewMode === "grid"
                ? "bg-slate-900 text-white shadow-3xs"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
            title="Tampilan Kisi (Grid View / Google Drive Style)"
          >
            <LayoutGrid className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      {/* 3. MAIN CONTENT: GOOGLE DRIVE STYLE TABLE OR GRID */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3">
          <div className="w-7 h-7 rounded-full border-2 border-slate-200 border-t-[#00a389] animate-spin" />
          <span className="text-xs text-slate-500 font-medium">Memuat data riwayat bundle...</span>
        </div>
      ) : visibleBundles.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center">
          <EmptyDataAnimation
            title={searchQuery ? "Tidak ada riwayat bundle yang sesuai" : "Belum ada riwayat bundle"}
            description={searchQuery ? "Coba ubah kata kunci pencarian." : "Riwayat bundle yang dibuat akan tampil di sini."}
          />
        </div>
      ) : viewMode === "list" ? (
        /* ==================== 3A. GOOGLE DRIVE LIST VIEW TABLE ==================== */
        <div className="w-full overflow-x-auto select-none mt-1">
          <table className="w-full text-left border-collapse font-sans">
            <thead>
              <tr className="border-b border-slate-200 text-[13px] font-semibold text-slate-600 select-none">
                <th className="py-2.5 px-3 min-w-[240px] font-semibold text-slate-700">Nomor Bundle</th>
                <th className="py-2.5 px-3 min-w-[150px] font-semibold text-slate-700">Tanggal Dibuat</th>
                <th className="py-2.5 px-3 min-w-[180px] font-semibold text-slate-700">Nama Pembuat</th>
                <th className="py-2.5 px-3 min-w-[140px] font-semibold text-slate-700">Status</th>
                <th className="py-2.5 px-3 w-12 text-center font-semibold text-slate-700"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 text-[13px] font-normal text-slate-700">
              {visibleBundles.map((item: FormattedBundleItem) => (
                <tr
                  key={item.id}
                  onClick={() => setSelectedDetailsBundle(item.original)}
                  className="group hover:bg-slate-100/80 transition-colors cursor-pointer"
                >
                  {/* Nomor Bundle Column (Green Sheet Icon + Bundle Number) */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <FileSpreadsheet className="w-3.5 h-3.5 stroke-[2.2]" />
                      </div>
                      <span className="font-bold text-slate-900 font-mono tracking-tight text-[13px]">
                        {item.bundleNumber}
                      </span>
                    </div>
                  </td>

                  {/* Tanggal Dibuat Column */}
                  <td className="py-3 px-3 text-slate-600 text-[13px]">
                    <span>{formatDateDisplay(item.createdAt)}</span>
                  </td>

                  {/* Nama Pembuat Column */}
                  <td className="py-3 px-3">
                    <span className="text-slate-800 font-medium text-[13px] truncate max-w-[220px]">
                      {item.creatorName}
                    </span>
                  </td>

                  {/* Status Bundle Column */}
                  <td className="py-3 px-3">
                    <div className="flex items-center">
                      {getStatusBadge(item.status)}
                    </div>
                  </td>

                  {/* Action Column (Three Dots Menu) */}
                  <td className="py-3 px-3 text-center">
                    <button
                      type="button"
                      onClick={(e) => handleOpenMenu(e, item)}
                      className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                        activeMenuItem?.id === item.id
                          ? "bg-slate-200 text-slate-800"
                          : "text-slate-400 hover:text-slate-800 hover:bg-slate-200/60"
                      }`}
                      title="Menu Aksi"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* ==================== 3B. GOOGLE DRIVE KISI / GRID VIEW ==================== */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 mt-1">
          {visibleBundles.map((item: FormattedBundleItem) => (
            <div
              key={item.id}
              onClick={() => setSelectedDetailsBundle(item.original)}
              className="group bg-white border border-slate-200/90 hover:border-slate-300 rounded-md p-3.5 shadow-3xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 relative overflow-hidden"
            >
              {/* Tile Header: Top Left = Nomor Bundle, Top Right = Three Dots Menu */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13px] font-bold font-mono text-slate-900 truncate tracking-tight" title={item.bundleNumber}>
                  {item.bundleNumber}
                </span>
                <button
                  type="button"
                  onClick={(e) => handleOpenMenu(e, item)}
                  className={`p-1 rounded-full transition-colors cursor-pointer shrink-0 ${
                    activeMenuItem?.id === item.id
                      ? "bg-slate-200 text-slate-800"
                      : "text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                  }`}
                  title="Menu Aksi"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              {/* Tile Body: Nama Pembuat */}
              <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium truncate">
                <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate" title={item.creatorName}>{item.creatorName}</span>
              </div>

              {/* Tile Footer: Tanggal Dibuat & Status Badge */}
              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px] text-slate-500">
                <div className="flex items-center gap-1 truncate">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{formatDateDisplay(item.createdAt)}</span>
                </div>
                {getStatusBadge(item.status)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. GOOGLE DRIVE STYLE "VIEW MORE" LINK AT BOTTOM LEFT */}
      {hasMore && (
        <div className="pt-2 pb-4 select-none">
          <button
            type="button"
            onClick={handleViewMore}
            className="text-[13px] font-semibold text-[#1a73e3] hover:text-blue-700 hover:underline cursor-pointer transition-colors inline-flex items-center gap-1 font-sans"
          >
            View more
          </button>
        </div>
      )}

      {/* 5. CONTEXTUAL THREE-DOTS DROPDOWN MENU */}
      {activeMenuItem && menuPos && typeof window !== "undefined" && createPortal(
        <div
          ref={dropdownMenuRef}
          style={{
            position: "fixed",
            top: `${menuPos.top}px`,
            left: `${menuPos.left}px`,
          }}
          onClick={(e) => e.stopPropagation()}
          className="w-44 bg-white border border-slate-200/90 rounded-lg shadow-xl py-1 z-[9999] text-left font-sans animate-fadeIn select-none divide-y divide-slate-100"
        >
          <div className="py-0.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedDetailsBundle(activeMenuItem.original);
                setActiveMenuItem(null);
                setMenuPos(null);
              }}
              className="w-full px-3 py-2 text-[12px] text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer font-medium group"
            >
              <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-colors" />
              <span>Lihat Isi Bundle</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedVersionBundle(activeMenuItem.original);
                setActiveMenuItem(null);
                setMenuPos(null);
              }}
              className="w-full px-3 py-2 text-[12px] text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer font-medium group"
            >
              <History className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#00a389] transition-colors" />
              <span>Versi Bundle</span>
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* 6. BUNDLE VERSION DRAWER */}
      {selectedVersionBundle && (
        <BundleVersionDrawer
          isOpen={Boolean(selectedVersionBundle)}
          onClose={() => setSelectedVersionBundle(null)}
          bundle={selectedVersionBundle}
        />
      )}
    </div>
  );
}
