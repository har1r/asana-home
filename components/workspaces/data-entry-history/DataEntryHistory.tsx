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
} from "lucide-react";
import { useDataEntryHistory, FormattedHistoryItem } from "./useDataEntryHistory";
import { DetailsModal } from "@/components/workspaces/shared/DetailsModal";
import { ApplicationSnapshotDrawer } from "@/components/workspaces/shared/ApplicationSnapshotDrawer";
import { EmptyDataAnimation } from "@/components/workspaces/shared/EmptyDataAnimation";
import { DataEntryHistorySkeleton } from "@/components/skeletons/DataEntryHistorySkeleton";

// Helper for Status Badge Styling
const getStatusBadge = (status: string) => {
  const s = (status || "").toUpperCase();
  if (s === "BUNDLED" || s === "TERBUNDEL") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/80 shadow-3xs font-sans">
        <Layers className="w-3 h-3 text-blue-500" />
        <span>Terbundel</span>
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

export default function DataEntryHistory() {
  const {
    visibleApplications,
    filteredApplications,
    hasMore,
    handleViewMore,
    loading,
    isRefreshing,
    error,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    displayMode,
    handleSwitchDisplayMode,
    selectedDetailsItem,
    setSelectedDetailsItem,
    refreshData,
  } = useDataEntryHistory();

  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownMenuRef = useRef<HTMLDivElement>(null);

  // Dropdown Menu State
  const [activeMenuItem, setActiveMenuItem] = useState<FormattedHistoryItem | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);

  // Application Version Drawer State
  const [selectedSnapshotItem, setSelectedSnapshotItem] = useState<any | null>(null);

  const handleOpenMenu = (e: React.MouseEvent, item: FormattedHistoryItem) => {
    e.stopPropagation();
    if (activeMenuItem?.uniqueRowKey === item.uniqueRowKey) {
      setActiveMenuItem(null);
      setMenuPos(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const menuWidth = 160;
    const menuHeight = 50;
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

  if (loading) {
    return <DataEntryHistorySkeleton />;
  }

  return (
    <div className="w-full flex flex-col gap-3 animate-fadeIn font-sans select-none">
      {/* 1. HEADER SECTION (Clean Title & Refresh Button without Card background) */}
      <div className="flex items-center justify-between gap-4 py-1 select-none font-sans">
        <h1 className="text-lg font-bold text-slate-900 tracking-tight">
          Riwayat Pengajuan
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

      {/* 2. TOOLBAR: SEARCH & DISPLAY MODE / GOOGLE DRIVE TOGGLE SWITCH */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none">
        {/* Left Side: Search Bar */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Cari No. Permohonan, Nama Pemohon, atau NOP..."
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

        {/* Right Side: Display Mode Switcher (Permohonan vs Pemohon) & View Mode (List vs Grid) */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto flex-wrap">
          {/* DISPLAY MODE SWITCHER: PERMOHONAN VS PEMOHON */}
          <div className="flex items-center bg-white border border-slate-200/90 rounded-md p-1 shadow-3xs gap-1">
            <button
              type="button"
              onClick={() => handleSwitchDisplayMode("permohonan")}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                displayMode === "permohonan"
                  ? "bg-[#00a389] text-white shadow-3xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Permohonan
            </button>
            <button
              type="button"
              onClick={() => handleSwitchDisplayMode("pemohon")}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                displayMode === "pemohon"
                  ? "bg-[#00a389] text-white shadow-3xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Pemohon
            </button>
          </div>

          {/* GOOGLE DRIVE VIEW MODE TOGGLE SWITCH: LIST VS GRID */}
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
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      {/* 3. MAIN CONTENT: GOOGLE DRIVE STYLE TABLE (FLAT, NO CARD WRAPPER BORDER) */}
      {visibleApplications.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center">
          <EmptyDataAnimation
            title={searchQuery ? "Tidak ada riwayat permohonan yang sesuai" : "Belum ada riwayat permohonan"}
            description={searchQuery ? "Coba ubah kata kunci pencarian." : "Riwayat permohonan yang sudah terbundel akan tampil di sini."}
          />
        </div>
      ) : viewMode === "list" ? (
        /* ==================== 3A. GOOGLE DRIVE LIST VIEW TABLE ==================== */
        <div className="w-full overflow-x-auto select-none mt-1">
          <table className="w-full text-left border-collapse font-sans">
            <thead>
              <tr className="border-b border-slate-200 text-[13px] font-normal text-slate-600 select-none">
                <th className="py-2.5 px-3 min-w-[200px] font-normal text-slate-600">No. Permohonan</th>
                <th className="py-2.5 px-3 min-w-[140px] font-normal text-slate-600">Tgl. Permohonan</th>
                <th className="py-2.5 px-3 min-w-[140px] font-normal text-slate-600">Tgl. Selesai</th>
                <th className="py-2.5 px-3 min-w-[180px] font-normal text-slate-600">Nama Pemohon</th>
                <th className="py-2.5 px-3 min-w-[130px] font-normal text-slate-600">Status</th>
                <th className="py-2.5 px-3 w-12 text-center font-normal text-slate-600"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 text-[13px] font-normal text-slate-700">
              {visibleApplications.map((item: FormattedHistoryItem) => (
                <tr
                  key={item.uniqueRowKey || item.id}
                  onClick={() => setSelectedDetailsItem(item.original)}
                  className="group hover:bg-slate-100/80 transition-colors cursor-pointer"
                >
                  {/* No. Permohonan Column (Green Google Sheet Icon + Application Number) */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <FileSpreadsheet className="w-3.5 h-3.5 stroke-[2.2]" />
                      </div>
                      <span className="font-normal text-slate-700 font-mono tracking-tight text-[13px]">
                        {item.applicationNumber}
                      </span>
                    </div>
                  </td>

                  {/* Tgl. Permohonan Column */}
                  <td className="py-3 px-3 text-slate-700 text-[13px] font-normal">
                    <span>{formatDateDisplay(item.serviceNumberDate)}</span>
                  </td>

                  {/* Tgl. Selesai Column */}
                  <td className="py-3 px-3 text-slate-700 text-[13px] font-normal">
                    <span>{formatDateDisplay(item.completionDate)}</span>
                  </td>

                  {/* Nama Pemohon Column */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-700 font-normal text-[13px] truncate max-w-[220px]">
                        {item.ownerName}
                      </span>
                      {item.isPecahanRow && (
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">
                          {item.pecahanInfo}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Status Column */}
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
                        activeMenuItem?.uniqueRowKey === item.uniqueRowKey
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
          {visibleApplications.map((item: FormattedHistoryItem) => (
            <div
              key={item.uniqueRowKey || item.id}
              onClick={() => setSelectedDetailsItem(item.original)}
              className="group bg-white border border-slate-200/90 hover:border-slate-300 rounded-md p-3.5 shadow-3xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 relative overflow-hidden"
            >
              {/* Tile Header: Top Left = No. Permohonan, Top Right = Three Dots Menu */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13px] font-normal font-mono text-slate-700 truncate tracking-tight" title={item.applicationNumber}>
                  {item.applicationNumber}
                </span>
                <button
                  type="button"
                  onClick={(e) => handleOpenMenu(e, item)}
                  className={`p-1 rounded-full transition-colors cursor-pointer shrink-0 ${
                    activeMenuItem?.uniqueRowKey === item.uniqueRowKey
                      ? "bg-slate-200 text-slate-800"
                      : "text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                  }`}
                  title="Menu Aksi"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              {/* Tile Body: Nama Pemohon */}
              <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium truncate">
                <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate" title={item.ownerName}>{item.ownerName}</span>
              </div>

              {/* Tile Footer: Tgl Permohonan & Status Badge */}
              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px] text-slate-500">
                <div className="flex items-center gap-1 truncate">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{formatDateDisplay(item.serviceNumberDate)}</span>
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

      {/* 5. DETAILS MODAL INTEGRATION */}
      {selectedDetailsItem && (
        <DetailsModal
          isOpen={Boolean(selectedDetailsItem)}
          selectedRequest={selectedDetailsItem}
          onClose={() => setSelectedDetailsItem(null)}
        />
      )}

      {/* 6. CONTEXTUAL THREE-DOTS DROPDOWN MENU */}
      {activeMenuItem && menuPos && typeof window !== "undefined" && createPortal(
        <div
          ref={dropdownMenuRef}
          style={{
            position: "fixed",
            top: `${menuPos.top}px`,
            left: `${menuPos.left}px`,
          }}
          onClick={(e) => e.stopPropagation()}
          className="w-40 bg-white border border-slate-200/90 rounded-lg shadow-xl py-1 z-[9999] text-left font-sans animate-fadeIn select-none"
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedSnapshotItem(activeMenuItem.original);
              setActiveMenuItem(null);
              setMenuPos(null);
            }}
            className="w-full px-3 py-2 text-[12px] text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer font-medium group"
          >
            <History className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#00a389] transition-colors" />
            <span>Versi Permohonan</span>
          </button>
        </div>,
        document.body
      )}

      {/* 7. APPLICATION SNAPSHOT / VERSION DRAWER */}
      {selectedSnapshotItem && (
        <ApplicationSnapshotDrawer
          isOpen={Boolean(selectedSnapshotItem)}
          onClose={() => setSelectedSnapshotItem(null)}
          application={selectedSnapshotItem}
        />
      )}
    </div>
  );
}

