"use client";

import React, { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  X,
  LayoutList,
  LayoutGrid,
  RefreshCw,
  Calendar,
  User,
  MoreVertical,
  Lock,
  Send,
  Boxes,
  Eye,
  Printer,
  FileCheck,
} from "lucide-react";
import { useSenderHistory, FormattedManifestItem } from "./useSenderHistory";
import { SenderHistoryDetailView } from "./SenderHistoryDetailView";
import { EmptyDataAnimation } from "@/components/workspaces/shared/EmptyDataAnimation";
import { ActionStatusModal } from "@/components/workspaces/shared/ActionStatusModal";
import { revisiManifest, uploadBuktiTandaTerima } from "@/app/actions/sender";

// Helper for Status Badge Styling (Persis Peneliti)
const getStatusBadge = (status: string) => {
  const s = (status || "").toUpperCase();
  if (s === "LOCKED" || s === "TERKUNCI") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-900 text-white shadow-3xs font-sans">
        <Lock className="w-3 h-3 text-amber-400" />
        <span>Terkunci</span>
      </span>
    );
  }
  if (s === "SENT" || s === "DIKIRIM") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-[#008f78] border border-emerald-200/80 shadow-3xs font-sans">
        <Send className="w-3 h-3 text-[#008f78]" />
        <span>Dikirim</span>
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

export default function SenderHistory() {
  const {
    visibleManifests,
    filteredManifests,
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
  } = useSenderHistory();

  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownMenuRef = useRef<HTMLDivElement>(null);

  // Dropdown Menu State
  const [activeMenuItem, setActiveMenuItem] = useState<FormattedManifestItem | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);

  // Manifest Detail Page View State
  const [selectedDetailsManifest, setSelectedDetailsManifest] = useState<any | null>(null);

  // Action Status Modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusModalStatus, setStatusModalStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [statusModalTitle, setStatusModalTitle] = useState("");
  const [statusModalMessage, setStatusModalMessage] = useState("");

  const showActionStatus = (
    status: "loading" | "success" | "error",
    title: string,
    message: string
  ) => {
    setStatusModalStatus(status);
    setStatusModalTitle(title);
    setStatusModalMessage(message);
    setStatusModalOpen(true);
  };

  const handleOpenMenu = (e: React.MouseEvent, item: FormattedManifestItem) => {
    e.stopPropagation();
    if (activeMenuItem?.id === item.id) {
      setActiveMenuItem(null);
      setMenuPos(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const menuWidth = 180;
    const menuHeight = 110;
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
      const isTyping =
        tag === "input" || tag === "textarea" || tag === "select" || (e.target as HTMLElement).isContentEditable;
      if ((e.ctrlKey && e.key === "k") || (e.key === "/" && !isTyping)) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Revert Lock to Draft Handler
  const handleRevisiManifest = async (manifestId: string) => {
    showActionStatus("loading", "Merevisi Manifest", "Sedang mengembalikan status manifest ke DRAFT...");
    try {
      const res: any = await revisiManifest(manifestId);
      if (res.success) {
        showActionStatus(
          "success",
          "Manifest Berhasil Direvisi",
          "Manifest berhasil dikembalikan ke status DRAFT dan dapat dikelola kembali di menu Buat Manifest."
        );
        setSelectedDetailsManifest(null);
        await refreshData();
      } else {
        showActionStatus("error", "Gagal Merevisi Manifest", res.error || "Gagal merevisi manifest.");
      }
    } catch (err: any) {
      showActionStatus("error", "Gagal Merevisi Manifest", err.message || "Sistem error saat merevisi.");
    }
  };

  // Upload Receipt Handler
  const handleUploadReceipt = async (manifestId: string, file: File) => {
    showActionStatus("loading", "Mengunggah Resi Bukti Kirim", "Sedang memproses berkas bukti tanda terima...");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res: any = await uploadBuktiTandaTerima(manifestId, formData);
      if (res.success) {
        showActionStatus(
          "success",
          "Pengiriman Selesai",
          "Bukti tanda terima berhasil diunggah! Manifest resmi dikirim."
        );
        await refreshData();
      } else {
        showActionStatus("error", "Gagal Mengunggah Bukti", res.error || "Gagal mengunggah bukti resi.");
      }
    } catch (err: any) {
      showActionStatus("error", "Gagal Mengunggah Bukti", err.message || "Sistem error saat mengunggah berkas.");
    }
  };

  // IF A MANIFEST IS SELECTED FOR DETAILS, RENDER FULL PAGE VIEW
  if (selectedDetailsManifest) {
    return (
      <div className="w-full font-sans select-none animate-fadeIn">
        <SenderHistoryDetailView
          manifest={selectedDetailsManifest}
          onBack={() => setSelectedDetailsManifest(null)}
          onRevisiManifest={handleRevisiManifest}
          onUploadReceipt={handleUploadReceipt}
        />
        <ActionStatusModal
          isOpen={statusModalOpen}
          status={statusModalStatus}
          title={statusModalTitle}
          message={statusModalMessage}
          onClose={() => {
            setStatusModalOpen(false);
            setStatusModalStatus("idle");
          }}
        />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-3 animate-fadeIn font-sans select-none">
      {/* 1. HEADER SECTION (Clean Title, View Mode Switcher, Refresh Button & Smooth Divider Line) */}
      <div className="flex flex-col gap-2 select-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-1 select-none font-sans">
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Riwayat Manifest
          </h1>

          <div className="flex items-center gap-2">
            {/* VIEW MODE TOGGLE SWITCH: LIST VS GRID (HIJAU #00a389) */}
            <div className="flex items-center bg-white border border-slate-200/90 rounded-md p-0.5 shadow-3xs shrink-0 h-9 gap-0.5">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`h-8 px-3 rounded-md transition-all cursor-pointer flex items-center justify-center ${
                  viewMode === "list"
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
                className={`h-8 px-3 rounded-md transition-all cursor-pointer flex items-center justify-center ${
                  viewMode === "grid"
                    ? "bg-[#00a389] text-white shadow-3xs"
                    : "text-slate-500 hover:text-[#00a389] hover:bg-slate-100"
                }`}
                title="Tampilan Kisi (Grid View)"
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

        {/* THIN DIVIDER LINE BELOW HEADER (SMOOTH & CLEAN PERSIS RESEARCHER) */}
        <div className="w-full border-b border-slate-200/80 my-0.5" />
      </div>

      {/* 2. TOOLBAR: SEARCH */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none mt-1">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Cari Nomor Manifest, Pengirim, atau Status..."
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
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      {/* 3. MAIN CONTENT: GOOGLE DRIVE STYLE TABLE OR GRID */}
      {visibleManifests.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center">
          <EmptyDataAnimation
            title={searchQuery ? "Tidak ada riwayat manifest yang sesuai" : "Belum ada riwayat manifest"}
            description={searchQuery ? "Coba ubah kata kunci pencarian." : "Manifest pengiriman yang terkunci atau dikirim akan tampil di sini."}
          />
        </div>
      ) : viewMode === "list" ? (
        /* ==================== 3A. GOOGLE DRIVE LIST VIEW TABLE ==================== */
        <div className="w-full overflow-x-auto select-none mt-1">
          <table className="w-full text-left border-collapse font-sans">
            <thead>
              <tr className="border-b border-slate-200 text-[13px] font-normal text-slate-600 select-none">
                <th className="py-2.5 px-3 min-w-[200px] font-normal text-slate-600">Nomor Manifest</th>
                <th className="py-2.5 px-3 min-w-[150px] font-normal text-slate-600 text-center">Isi Manifest</th>
                <th className="py-2.5 px-3 min-w-[140px] font-normal text-slate-600">Tanggal Dibuat</th>
                <th className="py-2.5 px-3 min-w-[160px] font-normal text-slate-600">Nama Pengirim</th>
                <th className="py-2.5 px-3 min-w-[130px] font-normal text-slate-600">Status</th>
                <th className="py-2.5 px-3 w-12 text-center font-normal text-slate-600"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 text-[13px] font-normal text-slate-700">
              {visibleManifests.map((item: FormattedManifestItem) => (
                <tr
                  key={item.id}
                  onClick={() => setSelectedDetailsManifest(item.original)}
                  className="group hover:bg-slate-100/80 transition-colors cursor-pointer"
                >
                  {/* Nomor Manifest Column */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded bg-[#00a389] text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <Boxes className="w-3.5 h-3.5 stroke-[2.2]" />
                      </div>
                      <span className="font-normal text-slate-700 font-mono tracking-tight text-[13px]">
                        {item.manifestNumber}
                      </span>
                    </div>
                  </td>

                  {/* Isi Manifest Column */}
                  <td className="py-3 px-3 text-center">
                    <span className="font-mono text-[12px] font-medium text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
                      {item.bundleCount} Bundle ({item.pemohonCount} Pemohon)
                    </span>
                  </td>

                  {/* Tanggal Column */}
                  <td className="py-3 px-3 text-slate-700 text-[13px] font-normal">
                    <span>{formatDateDisplay(item.createdAt)}</span>
                  </td>

                  {/* Nama Pengirim Column */}
                  <td className="py-3 px-3">
                    <span className="text-slate-700 font-normal text-[13px] truncate max-w-[220px]">
                      {item.pengirimName}
                    </span>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3.5 mt-1">
          {visibleManifests.map((item: FormattedManifestItem) => (
            <div
              key={item.id}
              onClick={() => setSelectedDetailsManifest(item.original)}
              className="group bg-white border border-slate-200/90 hover:border-slate-300 rounded-md p-4 shadow-3xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 relative overflow-hidden min-h-[130px]"
            >
              {/* Tile Header: Top Left = Nomor Manifest, Top Right = Three Dots Menu */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13px] font-normal font-mono text-slate-700 truncate tracking-tight" title={item.manifestNumber}>
                  {item.manifestNumber}
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

              {/* Tile Sub-Header: Isi Manifest */}
              <div className="flex items-center gap-1.5 text-xs text-[#008f78] font-medium">
                <span>{item.bundleCount} Bundle ({item.pemohonCount} Pemohon)</span>
              </div>

              {/* Tile Body: Nama Pengirim */}
              <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium truncate">
                <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate" title={item.pengirimName}>{item.pengirimName}</span>
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
          className="w-48 bg-white border border-slate-200/90 rounded-lg shadow-xl py-1 z-[9999] text-left font-sans animate-fadeIn select-none divide-y divide-slate-100"
        >
          <div className="py-0.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedDetailsManifest(activeMenuItem.original);
                setActiveMenuItem(null);
                setMenuPos(null);
              }}
              className="w-full px-3 py-2 text-[12px] text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer font-medium group"
            >
              <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-colors" />
              <span>Lihat Detail Manifest</span>
            </button>
          </div>

          <div className="py-0.5">
            <a
              href={`/api/pdf/surat-pengantar-manifest/${activeMenuItem.id}`}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => {
                e.stopPropagation();
                setActiveMenuItem(null);
                setMenuPos(null);
              }}
              className="w-full px-3 py-2 text-[12px] text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer font-medium group"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-colors" />
              <span>Cetak Surat Pengantar</span>
            </a>
          </div>

          {activeMenuItem.status === "LOCKED" && (
            <div className="py-0.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRevisiManifest(activeMenuItem.id);
                  setActiveMenuItem(null);
                  setMenuPos(null);
                }}
                className="w-full px-3 py-2 text-[12px] text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer font-medium group"
              >
                <RefreshCw className="w-3.5 h-3.5 text-rose-500 group-hover:text-rose-600 transition-colors" />
                <span>Revisi ke Draf</span>
              </button>
            </div>
          )}
        </div>,
        document.body
      )}

      {/* Action Status Modal */}
      <ActionStatusModal
        isOpen={statusModalOpen}
        status={statusModalStatus}
        title={statusModalTitle}
        message={statusModalMessage}
        onClose={() => {
          setStatusModalOpen(false);
          setStatusModalStatus("idle");
        }}
      />
    </div>
  );
}
