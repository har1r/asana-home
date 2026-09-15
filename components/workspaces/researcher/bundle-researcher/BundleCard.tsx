"use client";

import React, { useState, useRef, useEffect } from "react";
import { Folder, FolderLock, Lock, Send, X, Unlock, MoreVertical, Layers } from "lucide-react";
import { getAbbreviatedJenis, formatBundleNumber } from "@/components/workspaces/shared/constants";

const getInitials = (name?: string | null): string => {
  if (!name) return 'P';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

export const BUNDLE_TYPE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  MUTASI_SEBAGIAN: { bg: 'bg-indigo-50/80', text: 'text-indigo-700', border: 'border-indigo-150/80' },
  MUTASI_PENGGABUNGAN: { bg: 'bg-teal-50/80', text: 'text-teal-700', border: 'border-teal-150/80' },
  MERGER_MUTATION: { bg: 'bg-teal-50/80', text: 'text-teal-700', border: 'border-teal-150/80' },
  MUTASI_HABIS_UPDATE: { bg: 'bg-emerald-50/80', text: 'text-emerald-700', border: 'border-emerald-150/80' },
  MUTASI_HABIS_REGULER: { bg: 'bg-pink-50/80', text: 'text-pink-750', border: 'border-pink-150/80' },
  OBJEK_PAJAK_BARU: { bg: 'bg-amber-50/80', text: 'text-amber-700', border: 'border-amber-150/80' },
  PEMBETULAN: { bg: 'bg-purple-50/80', text: 'text-purple-700', border: 'border-purple-150/80' },
  PENGAKTIFAN: { bg: 'bg-sky-50/80', text: 'text-sky-700', border: 'border-sky-150/80' },
};

export const BUNDLE_STATUS_CONFIG: Record<string, { bg: string; text: string; border: string; dot: string; shadow: string; label: string }> = {
  DRAFT: {
    bg: 'bg-emerald-50/70',
    text: 'text-[#008f78]',
    border: 'border-emerald-200',
    dot: 'bg-[#00a389]',
    shadow: 'hover:shadow-emerald-150/40',
    label: 'Draf'
  },
  LOCKED: {
    bg: 'bg-slate-900',
    text: 'text-slate-100',
    border: 'border-slate-800',
    dot: 'bg-amber-400',
    shadow: 'hover:shadow-slate-300/20',
    label: 'Terkunci'
  },
  IN_MANIFEST: {
    bg: 'bg-emerald-50/80',
    text: 'text-emerald-800',
    border: 'border-emerald-150',
    dot: 'bg-emerald-500',
    shadow: 'hover:shadow-emerald-150/40',
    label: 'Dimanifest'
  },
  VOID: {
    bg: 'bg-rose-50/70',
    text: 'text-rose-700',
    border: 'border-rose-100',
    dot: 'bg-rose-500',
    shadow: 'hover:shadow-rose-150/40',
    label: 'Void'
  },
};

const STATUS_LABEL_MAP: Record<string, string> = {
  SUBMITTED: 'Diajukan',
  REVISION: 'Revisi',
  BUNDLED: 'Terbundel',
  LOCKED: 'Terkunci',
  IN_MANIFEST: 'Dimanifest',
  ARCHIVED: 'Diarsipkan',
  COMPLETED: 'Selesai',
  REJECTED: 'Ditolak',
  DRAFT: 'Draf',
  VOID: 'Dibatalkan',
  SENT: 'Dikirim',
};

const getStatusLabel = (status: string) => STATUS_LABEL_MAP[status] || status;

export interface BundleCardProps {
  bundle: any;
  isSelected: boolean;
  onSelect: (bundle: any) => void;
  onLock?: (bundleId: string) => void;
  onOpenVersionDrawer?: (bundle: any) => void;
  isLoading?: boolean;
}

export const BundleCard: React.FC<BundleCardProps> = React.memo(({
  bundle: b,
  isSelected,
  onSelect,
  onLock,
  onOpenVersionDrawer,
  isLoading = false,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Properti fallback kompatibel DB Prisma & Mock State
  const rawBundleNumber = b.nomorBundle || b.bundleNumber || '';
  const bundleNumber = rawBundleNumber ? formatBundleNumber(rawBundleNumber, b.createdAt) : '—';
  const jenisPermohonan = b.jenisPermohonan || b.applicationType || '';
  const applications = b.permohonan || b.applications || [];
  const penelitiName = b.createdBy?.name || b.createdByUser?.name || b.peneliti?.name || b.user?.name || b.createdByName || (typeof b.createdBy === 'string' ? b.createdBy : '') || 'Peneliti';
  const status = b.status || 'DRAFT';

  const berkasCount = applications.length;
  const pemohonCount = applications.reduce((acc: number, item: any) => {
    if (item.jenisPermohonan === 'MUTASI_SEBAGIAN' && item.dataBaru && item.dataBaru.length > 0) {
      return acc + item.dataBaru.length;
    }
    return acc + 1;
  }, 0);

  const statusCfg = BUNDLE_STATUS_CONFIG[status] || BUNDLE_STATUS_CONFIG.DRAFT;

  // Jika belum ada permohonan (berkasCount === 0), tampilkan neutral badge '—' (Belum ada permohonan)
  const hasApplications = berkasCount > 0;
  const displayJenis = hasApplications && jenisPermohonan ? getAbbreviatedJenis(jenisPermohonan) : '—';
  const displayJenisTitle = hasApplications && jenisPermohonan ? jenisPermohonan.replace(/_/g, ' ') : 'Belum ada permohonan';
  const typeStyle = hasApplications && jenisPermohonan && BUNDLE_TYPE_STYLES[jenisPermohonan]
    ? BUNDLE_TYPE_STYLES[jenisPermohonan]
    : { bg: 'bg-slate-100/80', text: 'text-slate-400', border: 'border-slate-200/60' };

  const renderStatusIcon = () => {
    const iconClass = "w-2.5 h-2.5 shrink-0";
    if (status === 'LOCKED') return <Lock className={iconClass} />;
    if (status === 'IN_MANIFEST') return <Send className={iconClass} />;
    if (status === 'VOID') return <X className={iconClass} />;
    return <Unlock className={iconClass} />;
  };

  return (
    <div
      onClick={() => onSelect(b)}
      className={`p-3 sm:p-3.5 rounded-md border flex flex-col justify-between gap-2.5 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer relative overflow-hidden group select-none ${
        isSelected
          ? 'bg-gradient-to-br from-[#00a389]/5 via-emerald-50/20 to-white border-[#00a389] shadow-md ring-2 ring-[#00a389]/20'
          : `bg-white border-slate-200/90 hover:border-slate-350 hover:shadow-md ${statusCfg.shadow}`
      }`}
    >
      {/* Top Row: Number & Vertical 3-Dots Dropdown (Sejajar dengan Nomor Bundle) */}
      <div className="flex items-start justify-between gap-1.5 w-full">
        <span className="text-[12px] font-normal text-slate-800 font-mono tracking-tight break-all whitespace-normal block" title={bundleNumber}>
          {bundleNumber}
        </span>

        {/* Three Dots Vertical Dropdown Button */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((prev) => !prev);
            }}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
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

              {status === 'DRAFT' && onLock && (
                <div className="py-0.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onLock(b.id);
                    }}
                    className="w-full px-3 py-2 text-[12px] text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer font-medium group"
                  >
                    <Lock className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-colors" />
                    <span>Kunci Bundle</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Middle Row: Service Type Tag | Status | Count Badge Centered Horizontally */}
      <div className="flex items-center justify-center gap-1.5 w-full py-0.5 flex-wrap sm:flex-nowrap">
        {/* Service Type Tag */}
        <span className={`inline-flex px-1.5 py-0.5 rounded-full text-[11px] font-normal border leading-none select-none tracking-wide uppercase font-sans ${typeStyle.bg} ${typeStyle.text} ${typeStyle.border}`} title={displayJenisTitle}>
          {displayJenis}
        </span>

        {/* Thin Vertical Line Separator 1 */}
        <div className="h-3 w-px bg-slate-200/90 shrink-0" />

        {/* Status Pill Badge */}
        <span className={`px-1.5 py-0.5 rounded-full text-[11px] font-normal border leading-none capitalize tracking-wider flex items-center gap-1 shadow-3xs transition-all shrink-0 font-sans ${
          status === 'LOCKED'
            ? 'bg-slate-900 text-slate-100 border-slate-800'
            : status === 'IN_MANIFEST'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : status === 'VOID'
                ? 'bg-rose-50 text-rose-800 border-rose-250'
                : 'bg-emerald-50 text-[#008f78] border-emerald-200'
        }`}>
          {renderStatusIcon()}
          <span>{getStatusLabel(status)}</span>
        </span>

        {/* Thin Vertical Line Separator 2 */}
        <div className="h-3 w-px bg-slate-200/90 shrink-0" />

        {/* Count Badge */}
        <span className="flex items-center justify-center bg-[#f25c54] text-white text-[11px] font-normal px-1.5 py-0.5 rounded-md leading-none shrink-0 shadow-3xs font-sans" title={`${berkasCount} Permohonan NOPEL (${pemohonCount} Pemohon)`}>
          {pemohonCount} Pemohon
        </span>
      </div>

      {/* Bottom Row: Peneliti Profile Initials Avatar & Creation Date */}
      <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-100/80 text-[11px] text-slate-500 font-normal select-none mt-auto font-sans">
        {/* Peneliti Avatar Initials */}
        <div className="flex items-center gap-1.5 min-w-0" title={`Pembuat Bundle: ${penelitiName}`}>
          <div className="w-4.5 h-4.5 rounded-full bg-[#00a389] text-white flex items-center justify-center text-[9px] font-bold shrink-0 shadow-3xs font-sans">
            {getInitials(penelitiName)}
          </div>
        </div>

        {/* Creation Date */}
        <span className="font-mono text-[11px] text-slate-500 font-normal shrink-0">
          {b.createdAt ? new Date(b.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
        </span>
      </div>
    </div>
  );
});

BundleCard.displayName = "BundleCard";
