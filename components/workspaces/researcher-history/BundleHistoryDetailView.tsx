"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  ChevronLeft,
  Search,
  X,
  Printer,
  LayoutList,
  LayoutGrid,
  Calendar,
  User,
  MoreVertical,
  BookCopy,
  FileSpreadsheet,
} from "lucide-react";
import { formatBundleNumber, toTitleCase, getAbbreviatedJenis, formatJenisLayananLabel } from "@/components/workspaces/shared/constants";
import { DetailsModal } from "@/components/workspaces/shared/DetailsModal";
import { ApplicationSnapshotDrawer } from "@/components/workspaces/shared/ApplicationSnapshotDrawer";
import { EmptyDataAnimation } from "@/components/workspaces/shared/EmptyDataAnimation";

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

export interface BundleHistoryDetailViewProps {
  bundle: any;
  onBack: () => void;
}

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
  } else if (s === "DRAFT" || s === "DRAF") {
    badgeClass = "bg-slate-100 text-slate-700 border-slate-200/80";
    label = "Draf";
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-normal border shadow-3xs font-sans capitalize ${badgeClass}`}>
      {label}
    </span>
  );
};

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

const normalizeAppItem = (item: any) => {
  const previousData = Array.isArray(item.previousData) ? item.previousData : (Array.isArray(item.dataLama) ? item.dataLama : []);
  const targetData = Array.isArray(item.targetData) ? item.targetData : (Array.isArray(item.dataBaru) ? item.dataBaru : []);
  const firstPrev = previousData[0] || {};
  const firstTarget = targetData[0] || {};
  const appType = item.applicationType || item.jenisPermohonan || '';

  const isPartialMutation = appType === 'PARTIAL_MUTATION' || appType === 'MUTASI_SEBAGIAN';
  const isReactivation = appType === 'REACTIVATION' || appType === 'PENGAKTIFAN';

  let calculatedNop = item.nop || '';
  if (!calculatedNop || calculatedNop === '-') {
    if (appType === 'NEW_TAX_OBJECT' || appType === 'OBJEK_PAJAK_BARU') {
      calculatedNop = firstTarget.nopTemporary || firstTarget.nop || '-';
    } else {
      calculatedNop = firstPrev.nop || firstPrev.nopAsal || firstPrev.nop_asal || '-';
    }
  }

  let calculatedOwnerName = item.ownerName || item.displayOwnerName || '';
  if (!calculatedOwnerName || calculatedOwnerName === '-') {
    if (isReactivation) {
      calculatedOwnerName = firstPrev.ownerName || firstPrev.namaPemilikLama || '-';
    } else if (isPartialMutation) {
      const firstName = firstTarget.ownerName || firstTarget.namaPemilikBaru || '';
      const totalCount = targetData.length;
      if (firstName && totalCount > 1) {
        calculatedOwnerName = `${firstName} (${totalCount})`;
      } else {
        calculatedOwnerName = firstName || '-';
      }
    } else {
      if (targetData.length > 0) {
        calculatedOwnerName = targetData
          .map((t: any) => t.ownerName || t.namaPemilikBaru || t.namaPemilik)
          .filter(Boolean)
          .join(', ');
      }
      if (!calculatedOwnerName) {
        calculatedOwnerName = firstPrev.ownerName || firstPrev.namaPemilikLama || firstPrev.namaPemilik || '-';
      }
    }
  }

  return {
    ...item,
    applicationNumber: item.applicationNumber || item.nomorPelayanan || '-',
    serviceNumberDate: item.serviceNumberDate || item.tanggalNoPelayanan || item.createdAt,
    completionDate: item.completionDate || item.tanggalPenyelesaian,
    nop: calculatedNop || '-',
    ownerName: calculatedOwnerName || '-',
    inputterName: item.penginput?.name || item.inputterName || 'Petugas Input',
  };
};

export const BundleHistoryDetailView: React.FC<BundleHistoryDetailViewProps> = React.memo(({
  bundle,
  onBack
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [displayMode, setDisplayMode] = useState<"permohonan" | "pemohon">("permohonan");

  const [selectedDetailsItem, setSelectedDetailsItem] = useState<any | null>(null);
  const [selectedSnapshotItem, setSelectedSnapshotItem] = useState<any | null>(null);

  // Dropdown Menu State
  const [activeMenuItem, setActiveMenuItem] = useState<any | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownMenuRef = useRef<HTMLDivElement>(null);

  const rawBundleNumber = bundle.bundleNumber || bundle.nomorBundle || '';
  const bundleNum = rawBundleNumber ? formatBundleNumber(rawBundleNumber, bundle.createdAt) : '—';
  const rawApplications: any[] = bundle.applications || bundle.permohonan || [];

  const normalizedApplications = useMemo(() => {
    return rawApplications.map((item) => normalizeAppItem(item));
  }, [rawApplications]);

  // Mode Base List: transform applications based on displayMode ('permohonan' vs 'pemohon')
  const modeBaseList = useMemo(() => {
    if (displayMode === "permohonan") {
      return normalizedApplications.map((item) => ({ ...item, uniqueRowKey: item.id, original: item }));
    }

    // DisplayMode === 'pemohon': FlatMap per target owner for Mutasi Sebagian
    return normalizedApplications.flatMap((item) => {
      const appType = item.applicationType || item.jenisPermohonan || "";
      const isPartial = appType === "PARTIAL_MUTATION" || appType === "MUTASI_SEBAGIAN";
      const targets = Array.isArray(item.targetData) && item.targetData.length > 0
        ? item.targetData
        : (Array.isArray(item.dataBaru) ? item.dataBaru : []);

      if (isPartial && targets.length > 0) {
        return targets.map((td: any, idx: number) => ({
          ...item,
          uniqueRowKey: `${item.id}-pecahan-${idx}`,
          ownerName: td.ownerName || td.namaPemilikBaru || item.ownerName,
          isPecahanRow: true,
          pecahanInfo: `(Pecahan ${idx + 1}/${targets.length})`,
          original: item,
        }));
      }

      return [{ ...item, uniqueRowKey: item.id, original: item }];
    });
  }, [normalizedApplications, displayMode]);

  const filteredApplications = useMemo(() => {
    if (!searchQuery.trim()) return modeBaseList;
    const q = searchQuery.toLowerCase().trim();
    return modeBaseList.filter((item) => {
      const appNo = (item.applicationNumber || '').toLowerCase();
      const owner = (item.ownerName || '').toLowerCase();
      const nop = (item.nop || '').toLowerCase();
      return appNo.includes(q) || owner.includes(q) || nop.includes(q);
    });
  }, [modeBaseList, searchQuery]);

  const handleOpenMenu = (e: React.MouseEvent, item: any) => {
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

  // Shortcut Ctrl+K
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

  const handlePrintBundleCover = () => {
    if (typeof window !== "undefined" && bundle?.id) {
      window.open(`/api/pdf/bundle-cover-letter/${bundle.id}`, "_blank");
    }
  };

  return (
    <div className="w-full flex flex-col gap-3 animate-fadeIn font-sans select-none">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col gap-2 select-none">
        {/* Top Row: Back Button */}
        <div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-slate-300 rounded-md text-xs font-semibold text-slate-600 hover:text-slate-900 transition-all cursor-pointer shadow-3xs font-sans"
            title="Kembali ke Riwayat Bundle"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-slate-500" />
            <span>Kembali</span>
          </button>
        </div>

        {/* Title & Action Controls Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-sans">
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight font-mono">
              {bundleNum}
            </h1>
            {getStatusBadge(bundle.status)}
          </div>

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

            {/* Tombol Cetak Rekomendasi */}
            <button
              type="button"
              onClick={handlePrintBundleCover}
              className="h-9 px-3.5 bg-[#00a389] hover:bg-[#008f78] active:scale-95 text-white rounded-md text-xs font-semibold shadow-3xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
              title="Cetak Rekomendasi Bundle"
            >
              <Printer className="w-3.5 h-3.5 text-white" />
              <span>Cetak Rekomendasi</span>
            </button>
          </div>
        </div>

        {/* THIN DIVIDER LINE BELOW HEADER */}
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
            onClick={() => setDisplayMode("permohonan")}
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
            onClick={() => setDisplayMode("pemohon")}
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

      {/* 3. MAIN CONTENT: GOOGLE DRIVE STYLE TABLE OR GRID */}
      {filteredApplications.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center">
          <EmptyDataAnimation
            title={searchQuery ? "Tidak ada permohonan yang sesuai" : "Belum ada permohonan dalam bundle ini"}
            description={searchQuery ? "Coba ubah kata kunci pencarian." : "Data permohonan dalam bundle akan muncul di sini."}
          />
        </div>
      ) : viewMode === "list" ? (
        /* ==================== 3A. GOOGLE DRIVE LIST VIEW TABLE ==================== */
        <div className="w-full overflow-x-auto select-none mt-1">
          <table className="w-full text-left border-collapse font-sans">
            <thead>
              <tr className="border-b border-slate-200 text-[13px] font-normal text-slate-600 select-none whitespace-nowrap">
                <th className="py-2.5 px-3 min-w-[180px] font-normal text-slate-600 whitespace-nowrap">No. Permohonan</th>
                <th className="py-2.5 px-3 min-w-[140px] font-normal text-slate-600 text-center whitespace-nowrap">Jenis Permohonan</th>
                <th className="py-2.5 px-3 min-w-[140px] font-normal text-slate-600 whitespace-nowrap">Tgl. Permohonan</th>
                <th className="py-2.5 px-3 min-w-[140px] font-normal text-slate-600 whitespace-nowrap">Tgl. Selesai</th>
                <th className="py-2.5 px-3 min-w-[180px] font-normal text-slate-600 whitespace-nowrap">Nama Pemohon</th>
                <th className="py-2.5 px-3 min-w-[130px] font-normal text-slate-600 whitespace-nowrap">Status</th>
                <th className="py-2.5 px-3 w-12 text-center font-normal text-slate-600 whitespace-nowrap"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 text-[13px] font-normal text-slate-700">
              {filteredApplications.map((item: any) => (
                <tr
                  key={item.uniqueRowKey || item.id}
                  onClick={() => setSelectedDetailsItem(item.original || item)}
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
                      {getJenisPermohonanBadge(item.applicationType || item.jenisPermohonan)}
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
          {filteredApplications.map((item: any) => (
            <div
              key={item.uniqueRowKey || item.id}
              onClick={() => setSelectedDetailsItem(item.original || item)}
              className="group bg-white border border-slate-200/90 hover:border-slate-300 rounded-md p-4 shadow-3xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3.5 relative overflow-hidden min-h-[120px]"
            >
              {/* Tile Header: Top Left = No. Permohonan, Top Right = Three Dots Menu */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-5 h-5 rounded bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <FileSpreadsheet className="w-3.5 h-3.5 stroke-[2.2]" />
                  </div>
                  <span className="text-[13px] font-normal font-mono text-slate-700 truncate tracking-tight" title={item.applicationNumber}>
                    {item.applicationNumber}
                  </span>
                </div>
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
                {getJenisPermohonanBadge(item.applicationType || item.jenisPermohonan)}
              </div>

              {/* Tile Body: Nama Pemohon */}
              <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium truncate">
                <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate capitalize" title={toTitleCase(item.ownerName)}>{toTitleCase(item.ownerName)}</span>
                {item.isPecahanRow && (
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {item.pecahanInfo}
                  </span>
                )}
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

      {/* 4. DETAILS MODAL INTEGRATION */}
      {selectedDetailsItem && (
        <DetailsModal
          isOpen={Boolean(selectedDetailsItem)}
          selectedRequest={selectedDetailsItem}
          onClose={() => setSelectedDetailsItem(null)}
        />
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
                setSelectedSnapshotItem(activeMenuItem.original || activeMenuItem);
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

      {/* 6. APPLICATION SNAPSHOT / VERSION DRAWER */}
      {selectedSnapshotItem && (
        <ApplicationSnapshotDrawer
          isOpen={Boolean(selectedSnapshotItem)}
          onClose={() => setSelectedSnapshotItem(null)}
          application={selectedSnapshotItem}
        />
      )}
    </div>
  );
});

BundleHistoryDetailView.displayName = "BundleHistoryDetailView";
