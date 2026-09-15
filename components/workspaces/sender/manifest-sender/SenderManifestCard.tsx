"use client";

import React, { useState, useRef, useEffect } from "react";
import { Calendar, Lock, Unlock, Send, MoreVertical, Boxes, FileText, RefreshCw, Loader2 } from "lucide-react";

const getAvatarInitials = (name?: string) => {
  if (!name) return "PG";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

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

const highlightText = (text: string, query: string) => {
  if (!query || !query.trim()) return text;
  const parts = text.split(new RegExp(`(${query})`, "gi"));
  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <span key={index} className="bg-amber-200/80 text-slate-900 rounded-[2px] px-0.5 font-bold">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
};

export interface SenderManifestCardProps {
  manifest: any;
  isSelected: boolean;
  searchQuery: string;
  loading?: boolean;
  onSelect: (manifest: any) => void;
  onLockManifest?: (manifestId: string) => void;
  onRevisiManifest?: (manifestId: string) => void;
  onManageManifest?: (manifest: any) => void;
}

export const SenderManifestCard: React.FC<SenderManifestCardProps> = React.memo(({
  manifest,
  isSelected,
  searchQuery,
  loading = false,
  onSelect,
  onLockManifest,
  onRevisiManifest,
  onManageManifest,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close 3-dots dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const rawManifestNumber = manifest.manifestNumber || manifest.nomorManifest || "";
  const status = manifest.status || "DRAFT";
  const bundlesList = manifest.bundles || manifest.bundle || [];
  const bundlesCount = bundlesList.length;

  const totalPecahanCount = bundlesList.reduce((bAcc: number, b: any) => {
    const appsList = b.applications || b.permohonan || [];
    const bPecahan = appsList.reduce((pAcc: number, p: any) => {
      const type = p.applicationType || p.jenisPermohonan;
      if (type === "MUTASI_SEBAGIAN" || type === "PARTIAL_MUTATION") {
        const targetList = p.targetData || p.dataBaru || [];
        return pAcc + (targetList.length > 0 ? targetList.length : 1);
      }
      return pAcc + 1;
    }, 0);
    return bAcc + bPecahan;
  }, 0);

  const pengirimName =
    manifest.createdBy?.name ||
    manifest.user?.name ||
    manifest.pengirim?.name ||
    "Pengirim";

  const renderStatusIcon = () => {
    const iconClass = "w-2.5 h-2.5 shrink-0";
    if (loading && isSelected) return <Loader2 className={`${iconClass} animate-spin`} />;
    if (status === "LOCKED") return <Lock className={iconClass} />;
    if (status === "SENT") return <Send className={iconClass} />;
    return <Unlock className={iconClass} />;
  };

  return (
    <div
      onClick={() => onSelect(manifest)}
      className={`p-3.5 sm:p-4 rounded-md border flex flex-col justify-between gap-3 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer relative overflow-hidden group select-none min-h-[145px] font-sans ${
        isSelected
          ? "bg-gradient-to-br from-[#00a389]/5 via-emerald-50/20 to-white border-[#00a389] shadow-md ring-2 ring-[#00a389]/20"
          : "bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-md"
      }`}
    >
      {/* Top Row: Nomor Manifest, Status Pill, & 3-Dots Action Menu */}
      <div className="flex items-start justify-between gap-1.5 w-full font-sans">
        <span
          className="font-mono text-[12px] font-bold text-slate-800 tracking-tight break-all whitespace-normal block flex-1"
          title={rawManifestNumber}
        >
          {highlightText(rawManifestNumber, searchQuery)}
        </span>

        <div className="flex items-center gap-1 shrink-0">
          {/* Status Badge */}
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-medium border leading-none capitalize tracking-wider flex items-center gap-1 shadow-3xs font-sans shrink-0 ${
              status === "LOCKED"
                ? "bg-slate-900 text-slate-100 border-slate-800"
                : status === "SENT"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-amber-50 text-amber-800 border-amber-200"
            }`}
          >
            {renderStatusIcon()}
            <span>{getStatusLabel(status)}</span>
          </span>

          {/* 3-Dots Dropdown Menu */}
          <div className="relative shrink-0" ref={menuRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((prev) => !prev);
              }}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Aksi Manifest"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200/90 rounded-md shadow-xl py-1 z-30 text-left font-sans animate-fadeIn select-none divide-y divide-slate-100">
                <div className="py-0.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      if (onManageManifest) onManageManifest(manifest);
                      else onSelect(manifest);
                    }}
                    className="w-full px-3 py-2 text-[12px] text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer font-medium group"
                  >
                    <Boxes className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-colors" />
                    <span>Kelola Pengiriman</span>
                  </button>
                </div>

                {status === "DRAFT" && onLockManifest && (
                  <div className="py-0.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        onLockManifest(manifest.id);
                      }}
                      className="w-full px-3 py-2 text-[12px] text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer font-medium group"
                    >
                      <Lock className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-colors" />
                      <span>Kunci Manifest</span>
                    </button>
                  </div>
                )}

                {status === "LOCKED" && onRevisiManifest && (
                  <div className="py-0.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        onRevisiManifest(manifest.id);
                      }}
                      className="w-full px-3 py-2 text-[12px] text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer font-medium group"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-colors" />
                      <span>Revisi ke Draf</span>
                    </button>
                  </div>
                )}

                <div className="py-0.5">
                  <a
                    href={`/api/pdf/manifest-cover-letter/${manifest.id}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-[12px] text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer font-medium group"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-colors" />
                    <span>Cetak Surat Pengantar</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Middle Row: Summary Box 2 Kolom (Jumlah Bundle & Total Pemohon) */}
      <div className="py-2 px-2 bg-slate-50 rounded-md border border-slate-100/90 flex items-center text-[12px] font-normal font-sans">
        <div className="flex-1 flex items-center justify-center font-semibold text-[#008f78] font-sans">
          <span>{bundlesCount} Bundle</span>
        </div>

        <div className="w-px h-3.5 bg-slate-200/90 shrink-0" />

        <div className="flex-1 flex items-center justify-center font-normal text-slate-600 font-sans">
          <span>{totalPecahanCount} Pemohon</span>
        </div>
      </div>

      {/* Bottom Row: Avatar Pengirim & Tanggal */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 font-sans mt-auto">
        <div className="flex items-center gap-1.5 min-w-0 font-sans" title={`Pengirim: ${pengirimName}`}>
          <div className="w-5 h-5 rounded-full bg-[#00a389] text-white text-[8px] font-bold flex items-center justify-center shrink-0 shadow-3xs">
            {getAvatarInitials(pengirimName)}
          </div>
          <span className="text-[11px] font-normal text-slate-600 truncate">{pengirimName}</span>
        </div>

        <span className="text-[11px] font-normal text-slate-400 flex items-center gap-1 shrink-0 font-sans font-mono">
          <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
          {manifest.updatedAt
            ? new Date(manifest.updatedAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "—"}
        </span>
      </div>
    </div>
  );
});

SenderManifestCard.displayName = "SenderManifestCard";
