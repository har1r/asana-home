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
  BookCopy,
  Copy,
} from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import { useDataEntryHistory, FormattedHistoryItem } from "./useDataEntryHistory";
import { DetailsModal } from "@/components/workspaces/shared/DetailsModal";
import { ApplicationSnapshotDrawer } from "@/components/workspaces/shared/ApplicationSnapshotDrawer";
import { EmptyDataAnimation } from "@/components/workspaces/shared/EmptyDataAnimation";
import { DataEntryHistorySkeleton } from "@/components/skeletons/DataEntryHistorySkeleton";
import { toTitleCase, getAbbreviatedJenis, formatJenisLayananLabel } from "@/components/workspaces/shared/constants";

// Helper for Jenis Permohonan Badge Styling (Singkatan Resmi, Warna Netral Clean, Center Aligned & Font Sans)
const getJenisPermohonanBadge = (jenis?: string | null) => {
  const abbr = getAbbreviatedJenis(jenis || "");
  const fullName = formatJenisLayananLabel(jenis);
  return (
    <span
      className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[11px] font-medium font-sans bg-slate-100 text-slate-700 border border-slate-200/80 shadow-3xs whitespace-nowrap select-none text-center"
      title={fullName}
    >
      {abbr}
    </span>
  );
};

// Helper for Status Badge Styling (Tanpa Icon, Gunakan rounded-md)
const getStatusBadge = (status: string) => {
  const s = (status || "").toUpperCase();
  let badgeClass = "bg-slate-100 text-slate-700 border-slate-200/80";
  let label = status;

  if (s === "BUNDLED" || s === "TERBUNDEL") {
    badgeClass = "bg-blue-50 text-blue-700 border-blue-200/80";
    label = "Terbundel";
  } else if (s === "LOCKED" || s === "TERKUNCI") {
    badgeClass = "bg-slate-900 text-white border-slate-900";
    label = "Terkunci";
  } else if (s === "IN_MANIFEST" || s === "MANIFESTED") {
    badgeClass = "bg-emerald-50 text-[#008f78] border-emerald-200/80";
    label = "Dimanifest";
  } else if (s === "ARCHIVED" || s === "DIARSIPKAN") {
    badgeClass = "bg-indigo-50 text-indigo-700 border-indigo-200/80";
    label = "Diarsipkan";
  } else if (s === "COMPLETED" || s === "DELIVERED" || s === "SELESAI") {
    badgeClass = "bg-[#e6f6f4] text-[#008f78] border-[#00a389]/30";
    label = "Selesai";
  } else if (s === "SUBMITTED" || s === "DIAJUKAN") {
    badgeClass = "bg-amber-50 text-amber-700 border-amber-200/80";
    label = "Diajukan";
  } else if (s === "REVISION" || s === "REVISI") {
    badgeClass = "bg-rose-50 text-rose-700 border-rose-200/80";
    label = "Revisi";
  } else if (s === "REJECTED" || s === "DITOLAK") {
    badgeClass = "bg-rose-50 text-rose-700 border-rose-200/80";
    label = "Ditolak";
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-normal border shadow-3xs font-sans capitalize ${badgeClass}`}>
      {label}
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
  const { handleDuplicateApplication } = useDashboard();

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
    const menuWidth = 176;
    const menuHeight = 85;
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
      {/* 1. HEADER SECTION (Clean Title, View Mode Switcher, Refresh Button & Smooth Divider Line) */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-4 py-1 select-none font-sans">
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Riwayat Pengajuan
          </h1>

          <div className="flex items-center gap-2">
            {/* VIEW MODE TOGGLE SWITCH: LIST VS GRID (HIJAU #00a389) */}
            <div className="flex items-center bg-white border border-slate-200/90 rounded-md p-0.5 shadow-3xs shrink-0 h-9 gap-0.5">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`h-8 px-3 rounded-md transition-all cursor-pointer flex items-center justify-center ${viewMode === "list"
                  ? "bg-[#00a389] text-white shadow-3xs"
                  : "text-slate-500 hover:text-[#00a389] hover:bg-slate-100"
                  }`}
                title="Tampilan Tabel (List View)"
              >
                <LayoutList className="w-4 h-4 stroke-[2.2]" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`h-8 px-3 rounded-md transition-all cursor-pointer flex items-center justify-center ${viewMode === "grid"
                  ? "bg-[#00a389] text-white shadow-3xs"
                  : "text-slate-500 hover:text-[#00a389] hover:bg-slate-100"
                  }`}
                title="Tampilan Kisi (Grid View / Google Drive Style)"
              >
                <LayoutGrid className="w-4 h-4 stroke-[2.2]" />
              </button>
            </div>

            {/* Tombol Refresh Data */}
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
        </div>

        {/* THIN DIVIDER LINE BELOW HEADER (SMOOTH & CLEAN LIKE DATAENTRYWORKSPACE) */}
        <div className="w-full border-b border-slate-200/80 my-0.5" />
      </div>

      {/* 2. TOOLBAR: SEARCH & DISPLAY MODE (PERMOHONAN VS PEMOHON) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none mt-1">
        {/* Left Side: Search Bar */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Cari NOP, Nopel, atau Nama Pemohon..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200/90 rounded-md text-[13px] font-normal text-slate-900 focus:outline-none focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 transition-all font-sans"
          />
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

        {/* Right Side: Display Mode Switcher (Permohonan vs Pemohon) */}
        <div className="bg-slate-200/70 p-0.5 rounded-md flex items-center gap-0.5 border border-slate-300/60 text-[13px] font-normal select-none h-8 font-sans shrink-0 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => handleSwitchDisplayMode("permohonan")}
            className={`h-7 px-3 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${displayMode === "permohonan"
              ? "bg-white text-slate-900 shadow-3xs font-normal"
              : "text-slate-600 hover:text-slate-900"
              }`}
            title="Tampilkan 1 baris per Nomor Pelayanan (NOPEL)"
          >
            <span>Permohonan</span>
          </button>
          <button
            type="button"
            onClick={() => handleSwitchDisplayMode("pemohon")}
            className={`h-7 px-3 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${displayMode === "pemohon"
              ? "bg-white text-slate-900 shadow-3xs font-normal"
              : "text-slate-600 hover:text-slate-900"
              }`}
            title="Tampilkan rincian pecahan pemilik baru (Mutasi Sebagian)"
          >
            <span>Pemohon</span>
          </button>
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
                <th className="py-2.5 px-3 min-w-[180px] font-normal text-slate-600">No. Permohonan</th>
                <th className="py-2.5 px-3 min-w-[130px] font-normal text-slate-600 text-center">Jenis Permohonan</th>
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

                  {/* Jenis Layanan Column (Center Aligned) */}
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center">
                      {getJenisPermohonanBadge(item.applicationType)}
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
                      <span className="text-slate-700 font-normal text-[13px] truncate max-w-[220px] capitalize">
                        {toTitleCase(item.ownerName)}
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
                      className={`p-1.5 rounded-full transition-colors cursor-pointer ${activeMenuItem?.uniqueRowKey === item.uniqueRowKey
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3.5 mt-1">
          {visibleApplications.map((item: FormattedHistoryItem) => (
            <div
              key={item.uniqueRowKey || item.id}
              onClick={() => setSelectedDetailsItem(item.original)}
              className="group bg-white border border-slate-200/90 hover:border-slate-300 rounded-md p-4 shadow-3xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 relative overflow-hidden min-h-[130px]"
            >
              {/* Tile Header: Top Left = No. Permohonan, Top Right = Three Dots Menu */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13px] font-normal font-mono text-slate-700 truncate tracking-tight" title={item.applicationNumber}>
                  {item.applicationNumber}
                </span>
                <button
                  type="button"
                  onClick={(e) => handleOpenMenu(e, item)}
                  className={`p-1 rounded-full transition-colors cursor-pointer shrink-0 ${activeMenuItem?.uniqueRowKey === item.uniqueRowKey
                    ? "bg-slate-200 text-slate-800"
                    : "text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                    }`}
                  title="Menu Aksi"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              {/* Tile Sub-Header: Jenis Layanan Badge */}
              <div className="flex items-center gap-1.5">
                {getJenisPermohonanBadge(item.applicationType)}
              </div>

              {/* Tile Body: Nama Pemohon */}
              <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium truncate">
                <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate capitalize" title={toTitleCase(item.ownerName)}>{toTitleCase(item.ownerName)}</span>
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
          className="w-44 bg-white border border-slate-200/90 rounded-lg shadow-xl py-1 z-[9999] text-left font-sans animate-fadeIn select-none divide-y divide-slate-100"
        >
          <div className="py-0.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDuplicateApplication(activeMenuItem.original);
                setActiveMenuItem(null);
                setMenuPos(null);
              }}
              className="w-full px-3 py-2 text-[12px] text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer font-medium group"
            >
              <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-colors" />
              <span>Duplikasi Berkas</span>
            </button>
          </div>

          <div className="py-0.5">
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
              <BookCopy className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-colors" />
              <span>Riwayat Versi</span>
            </button>
          </div>
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

