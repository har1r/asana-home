"use client";

import React from "react";
import { Minus, Loader2, Send, Calendar } from "lucide-react";
import { getAbbreviatedJenis, formatJenisLayananLabel } from "@/components/workspaces/shared/constants";

export interface SenderInstalledBundleCardProps {
  bundle: any;
  isSelected: boolean;
  manifestStatus: string;
  loading?: boolean;
  searchQuery?: string;
  onSelectBundle: (bundle: any) => void;
  onRemoveBundle?: (bundleId: string) => void;
  onOpenVersionDrawer: (bundle: any) => void;
}

const highlightText = (text: string, query?: string) => {
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

const getInitials = (name: string) => {
  if (!name) return "P";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

export const SenderInstalledBundleCard: React.FC<SenderInstalledBundleCardProps> = React.memo(({
  bundle,
  isSelected,
  manifestStatus,
  loading = false,
  searchQuery = "",
  onSelectBundle,
  onRemoveBundle,
  onOpenVersionDrawer,
}) => {
  const appsList = bundle.applications || bundle.permohonan || [];
  const bTotalPecahan = appsList.reduce(
    (acc: number, p: any) => acc + (p.targetData?.length || p.dataBaru?.length || 1),
    0
  );

  const displayBundleNo = bundle.bundleNumber || bundle.nomorBundle || "—";
  const displayJenis = bundle.applicationType || bundle.jenisPermohonan;

  const creatorName =
    bundle.createdBy?.name ||
    bundle.createdByUser?.name ||
    bundle.peneliti?.name ||
    bundle.user?.name ||
    bundle.createdByName ||
    (typeof bundle.createdBy === "string" ? bundle.createdBy : "") ||
    "Peneliti";

  const initials = getInitials(creatorName);

  return (
    <div
      onClick={() => onSelectBundle(bundle)}
      className={`p-3 sm:p-3.5 rounded-md border flex flex-col justify-between gap-2.5 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer relative overflow-hidden group select-none min-h-[145px] font-sans ${isSelected
          ? "bg-gradient-to-br from-[#00a389]/5 via-emerald-50/20 to-white border-[#00a389] shadow-md ring-2 ring-[#00a389]/20"
          : "bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-md"
        }`}
    >
      {/* Top Row: Bundle No & Action Button (Lepas di Pojok Kanan Atas) */}
      <div className="flex items-start justify-between gap-2 w-full font-sans shrink-0">
        <span
          className="font-mono text-[12px] font-bold text-slate-800 tracking-tight break-all whitespace-normal block flex-1"
          title={displayBundleNo}
        >
          {highlightText(displayBundleNo, searchQuery)}
        </span>

        {manifestStatus === "DRAFT" && onRemoveBundle && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemoveBundle(bundle.id);
            }}
            disabled={loading}
            className="py-1 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 hover:border-rose-300 active:scale-95 text-[12px] font-normal font-sans rounded-md transition-all cursor-pointer flex items-center gap-1 shadow-3xs shrink-0 capitalize disabled:opacity-50"
            title="Keluarkan Map Bundle ini dari Manifest"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
            ) : (
              <Minus className="w-3.5 h-3.5 text-rose-600 stroke-[2.5]" />
            )}
            <span>Keluarkan</span>
          </button>
        )}
      </div>

      {/* Middle Row: Pills (Presisi Terpusat di Tengah Horisontal Sesuai Researcher BundleCard) */}
      <div className="flex items-center justify-center gap-1.5 w-full py-1 flex-wrap font-sans text-[11px] my-auto">
        {/* Pill 1: Jenis Layanan (Grey Pill) */}
        <span
          className="inline-flex items-center justify-center bg-slate-100/90 text-slate-600 font-bold px-2 py-0.5 rounded-full border border-slate-200/80 leading-none cursor-help font-mono"
          title={formatJenisLayananLabel(displayJenis)}
        >
          {getAbbreviatedJenis(displayJenis)}
        </span>

        {/* Thin Vertical Line Separator 1 */}
        <div className="h-3 w-px bg-slate-200/90 shrink-0 self-center" />

        {/* Pill 2: Status (Outline Green Pill with Send Icon) */}
        <span className="inline-flex items-center justify-center border border-emerald-300 text-[#008f78] bg-emerald-50/60 font-semibold px-2.5 py-0.5 rounded-full leading-none gap-1 shrink-0">
          <Send className="w-3 h-3 text-[#00a389] shrink-0" />
          <span>Dimanifest</span>
        </span>

        {/* Thin Vertical Line Separator 2 */}
        <div className="h-3 w-px bg-slate-200/90 shrink-0 self-center" />

        {/* Pill 3: Berkas Count (Solid Teal Pill) */}
        <span
          className="inline-flex items-center justify-center bg-[#00a389] text-white font-bold font-mono px-2.5 py-0.5 rounded-full leading-none shadow-3xs shrink-0"
          title={`${bTotalPecahan} Berkas Permohonan`}
        >
          {bTotalPecahan} Berkas
        </span>
      </div>

      {/* Bottom Row: Peneliti Profile Initials Avatar & Creation Date */}
      <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-100/80 text-[11px] text-slate-500 font-normal select-none mt-auto font-sans shrink-0">
        {/* Left: Avatar Circle + Name */}
        <div className="flex items-center gap-1.5 min-w-0" title={`Pembuat Bundle: ${creatorName}`}>
          <div className="w-4.5 h-4.5 rounded-full bg-[#00a389] text-white flex items-center justify-center text-[9px] font-bold shrink-0 shadow-3xs font-sans">
            {initials}
          </div>
          <span className="truncate text-slate-600 font-sans font-medium text-[11px]">
            {creatorName}
          </span>
        </div>

        {/* Right: Date dengan Ikon Kalender */}
        <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 font-normal shrink-0">
          <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
          <span>
            {bundle.createdAt
              ? new Date(bundle.createdAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
              : "—"}
          </span>
        </div>
      </div>
    </div>
  );
});

SenderInstalledBundleCard.displayName = "SenderInstalledBundleCard";
