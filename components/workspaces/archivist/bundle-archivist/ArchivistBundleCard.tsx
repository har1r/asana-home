"use client";

import React, { useState, useRef, useEffect } from "react";
import { Lock, Unlock, Send, RotateCcw, MoreVertical, Layers } from "lucide-react";
import { getAbbreviatedJenis, formatBundleNumber } from "@/components/workspaces/shared/constants";

const getInitials = (name?: string | null): string => {
  if (!name) return "P";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

export const BUNDLE_TYPE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  MUTASI_SEBAGIAN: { bg: "bg-indigo-50/80", text: "text-indigo-700", border: "border-indigo-150/80" },
  MUTASI_PENGGABUNGAN: { bg: "bg-teal-50/80", text: "text-teal-700", border: "border-teal-150/80" },
  MERGER_MUTATION: { bg: "bg-teal-50/80", text: "text-teal-700", border: "border-teal-150/80" },
  MUTASI_HABIS_UPDATE: { bg: "bg-emerald-50/80", text: "text-emerald-700", border: "border-emerald-150/80" },
  MUTASI_HABIS_REGULER: { bg: "bg-pink-50/80", text: "text-pink-750", border: "border-pink-150/80" },
  OBJEK_PAJAK_BARU: { bg: "bg-amber-50/80", text: "text-amber-700", border: "border-amber-150/80" },
  PEMBETULAN: { bg: "bg-purple-50/80", text: "text-purple-700", border: "border-purple-150/80" },
  PENGAKTIFAN: { bg: "bg-sky-50/80", text: "text-sky-700", border: "border-sky-150/80" },
};

export const BUNDLE_STATUS_CONFIG: Record<
  string,
  { bg: string; text: string; border: string; dot: string; shadow: string }
> = {
  DRAFT: {
    bg: "bg-emerald-50/70",
    text: "text-[#008f78]",
    border: "border-emerald-200",
    dot: "bg-[#00a389]",
    shadow: "hover:shadow-emerald-150/40",
  },
  LOCKED: {
    bg: "bg-slate-900",
    text: "text-slate-100",
    border: "border-slate-800",
    dot: "bg-amber-400",
    shadow: "hover:shadow-slate-300/20",
  },
  IN_MANIFEST: {
    bg: "bg-emerald-50/80",
    text: "text-emerald-800",
    border: "border-emerald-150",
    dot: "bg-emerald-500",
    shadow: "hover:shadow-emerald-150/40",
  },
  ARCHIVED: {
    bg: "bg-teal-50/80",
    text: "text-[#008f78]",
    border: "border-teal-200",
    dot: "bg-[#00a389]",
    shadow: "hover:shadow-teal-150/40",
  },
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

const getStatusLabel = (status: string) => STATUS_LABEL_MAP[status] || status;

export interface ArchivistBundleCardProps {
  bundle: any;
  isSelected: boolean;
  hasReupload: boolean;
  onSelect: (bundle: any) => void;
  onOpenVersionDrawer?: (bundle: any) => void;
}

export const ArchivistBundleCard: React.FC<ArchivistBundleCardProps> = React.memo(
  ({ bundle: b, isSelected, hasReupload, onSelect, onOpenVersionDrawer }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
          setMenuOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const rawBundleNumber = b.nomorBundle || b.bundleNumber || "";
    const bundleNumber = rawBundleNumber ? formatBundleNumber(rawBundleNumber, b.createdAt) : "—";
    const jenisPermohonan = b.jenisPermohonan || b.applicationType || "";
    const bundleApps = b.applications || b.permohonan || [];
    const penelitiName =
      b.createdBy?.name ||
      b.createdByUser?.name ||
      b.peneliti?.name ||
      b.user?.name ||
      b.createdByName ||
      (typeof b.createdBy === "string" ? b.createdBy : "") ||
      "Pengarsip";

    const { totalCount, uploadedCount } = bundleApps.reduce(
      (acc: { totalCount: number; uploadedCount: number }, p: any) => {
        const activeArchives = (p.arsipDigital || []).filter((ad: any) => ad.status === "ACTIVE");
        const appJenis = p.jenisPermohonan || p.applicationType;
        const isPartialMutation = appJenis === "MUTASI_SEBAGIAN" || appJenis === "PARTIAL_MUTATION";
        const fractions = p.targetData || p.dataBaru || [];

        if (isPartialMutation && fractions.length > 0) {
          const totalPecahan = fractions.length;
          let uploadedPecahan = 0;
          if (p.status === "ARCHIVED") {
            uploadedPecahan = totalPecahan;
          } else {
            fractions.forEach((db: any) => {
              const targetId = db.idTargetData || db.id;
              const hasUpload = db.isArchived === true || activeArchives.some((ad: any) => ad.dataBaruId === targetId || ad.dataBaruId === db.id || ad.dataBaruId === db.idTargetData);
              if (hasUpload) uploadedPecahan++;
            });
          }
          return {
            totalCount: acc.totalCount + totalPecahan,
            uploadedCount: acc.uploadedCount + uploadedPecahan,
          };
        } else {
          const isUploaded = p.status === "ARCHIVED" || (p.targetData && p.targetData.some((td: any) => td.isArchived === true)) || activeArchives.length > 0;
          return {
            totalCount: acc.totalCount + 1,
            uploadedCount: acc.uploadedCount + (isUploaded ? 1 : 0),
          };
        }
      },
      { totalCount: 0, uploadedCount: 0 }
    );

    const statusCfg = BUNDLE_STATUS_CONFIG[b.status] || BUNDLE_STATUS_CONFIG.LOCKED;
    const typeStyle =
      jenisPermohonan && BUNDLE_TYPE_STYLES[jenisPermohonan]
        ? BUNDLE_TYPE_STYLES[jenisPermohonan]
        : { bg: "bg-slate-100/80", text: "text-slate-400", border: "border-slate-200/60" };

    const renderStatusIcon = () => {
      const iconClass = "w-2.5 h-2.5 shrink-0";
      if (b.status === "LOCKED") return <Lock className={iconClass} />;
      if (b.status === "IN_MANIFEST") return <Send className={iconClass} />;
      return <Unlock className={iconClass} />;
    };

    return (
      <div
        onClick={() => onSelect(b)}
        className={`p-3.5 rounded-lg border flex flex-col justify-between gap-2.5 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer relative overflow-hidden group select-none ${
          hasReupload
            ? "bg-amber-50/30 border-amber-400 ring-2 ring-amber-400/40 shadow-md"
            : isSelected
            ? "bg-gradient-to-br from-[#00a389]/5 via-emerald-50/20 to-white border-[#00a389] shadow-md ring-2 ring-[#00a389]/20"
            : `bg-white border-slate-200/90 hover:border-slate-350 hover:shadow-md ${statusCfg.shadow}`
        }`}
      >
        {/* Top Row: Number & 3-Dots Dropdown Menu */}
        <div className="flex items-start justify-between gap-1.5 w-full font-sans">
          <span
            className="text-[12px] font-normal text-slate-800 font-mono tracking-tight break-all whitespace-normal block"
            title={bundleNumber}
          >
            {bundleNumber}
          </span>

          <div className="flex items-center gap-1 shrink-0 font-sans" ref={menuRef}>
            {hasReupload && (
              <span
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-normal bg-amber-500 text-white shadow-3xs select-none shrink-0 font-sans"
                title="Terdapat permohonan dikembalikan yang perlu di-upload ulang"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                Re-upload
              </span>
            )}

            <div className="relative shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen((prev) => !prev);
                }}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Opsi Bundle"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200/90 rounded-lg shadow-xl py-1 z-30 text-left font-sans animate-fadeIn select-none divide-y divide-slate-100">
                  <div className="py-0.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        if (onOpenVersionDrawer) onOpenVersionDrawer(b);
                      }}
                      className="w-full px-3 py-2 text-[12px] text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer font-medium group"
                    >
                      <Layers className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-colors" />
                      <span>Riwayat Versi Bundle</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Middle Row: Service Type Tag | Status | Count Badge Centered Horizontally */}
        <div className="flex items-center justify-center gap-1.5 w-full py-0.5 flex-wrap sm:flex-nowrap font-sans">
          {/* Service Type Tag */}
          <span
            className={`inline-flex px-1.5 py-0.5 rounded-full text-[11px] font-normal border leading-none select-none tracking-wide uppercase font-sans ${typeStyle.bg} ${typeStyle.text} ${typeStyle.border}`}
            title={jenisPermohonan ? jenisPermohonan.replace(/_/g, " ") : "Umum"}
          >
            {getAbbreviatedJenis(jenisPermohonan)}
          </span>

          {/* Thin Vertical Line Separator 1 */}
          <div className="h-3 w-px bg-slate-200/90 shrink-0" />

          {/* Status Pill Badge */}
          <span
            className={`px-1.5 py-0.5 rounded-full text-[11px] font-normal border leading-none capitalize tracking-wider flex items-center gap-1 shadow-3xs transition-all shrink-0 font-sans ${
              b.status === "LOCKED"
                ? "bg-slate-900 text-slate-100 border-slate-800"
                : b.status === "IN_MANIFEST"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-emerald-50 text-[#008f78] border-emerald-200"
            }`}
          >
            {renderStatusIcon()}
            <span>{getStatusLabel(b.status)}</span>
          </span>

          {/* Thin Vertical Line Separator 2 */}
          <div className="h-3 w-px bg-slate-200/90 shrink-0" />

          {/* Count Badge */}
          <span
            className={`flex items-center justify-center text-white text-[11px] font-normal px-1.5 py-0.5 rounded-md leading-none shrink-0 shadow-3xs font-sans ${
              uploadedCount === totalCount && totalCount > 0 ? "bg-[#00a389]" : "bg-[#f25c54]"
            }`}
            title={`${uploadedCount} dari ${totalCount} Pemohon Ter-upload`}
          >
            {uploadedCount}/{totalCount} Terupload
          </span>
        </div>

        {/* Bottom Row: Peneliti Profile Initials Avatar & Creation Date */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100/90 text-[11px] text-slate-500 font-normal select-none mt-auto font-sans">
          {/* Peneliti Avatar Initials */}
          <div className="flex items-center gap-1.5 min-w-0" title={`Pembuat Bundle: ${penelitiName}`}>
            <div className="w-5 h-5 rounded-full bg-[#00a389] text-white flex items-center justify-center text-[9.5px] font-bold shrink-0 shadow-3xs font-sans">
              {getInitials(penelitiName)}
            </div>
            <span className="truncate text-slate-700 font-medium text-[11.5px] font-sans">{penelitiName}</span>
          </div>

          {/* Creation Date */}
          <span className="font-mono text-[11px] text-slate-500 font-medium shrink-0">
            {b.createdAt ? new Date(b.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "—"}
          </span>
        </div>
      </div>
    );
  }
);

ArchivistBundleCard.displayName = "ArchivistBundleCard";
