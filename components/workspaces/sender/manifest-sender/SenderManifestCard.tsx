"use client";

import React from "react";
import { Calendar } from "lucide-react";

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
  if (!query.trim()) return text;
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

interface SenderManifestCardProps {
  manifest: any;
  isSelected: boolean;
  searchQuery: string;
  onSelect: (manifest: any) => void;
}

export const SenderManifestCard: React.FC<SenderManifestCardProps> = React.memo(({
  manifest,
  isSelected,
  searchQuery,
  onSelect,
}) => {
  const bundlesCount = manifest.bundle?.length || 0;
  const totalPecahanCount = (manifest.bundle || []).reduce((bAcc: number, b: any) => {
    const bPecahan = (b.permohonan || []).reduce((pAcc: number, p: any) => {
      if (p.jenisPermohonan === "MUTASI_SEBAGIAN") {
        return pAcc + (p.dataBaru?.length || 1);
      }
      return pAcc + 1;
    }, 0);
    return bAcc + bPecahan;
  }, 0);

  return (
    <div
      onClick={() => onSelect(manifest)}
      className={`p-4 rounded-xl border flex flex-col justify-between gap-3.5 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer relative overflow-hidden group select-none min-h-[140px] font-sans ${
        isSelected
          ? "bg-gradient-to-br from-[#00a389]/5 via-emerald-50/20 to-white border-[#00a389] shadow-md ring-2 ring-[#00a389]/20"
          : "bg-white border-slate-200/90 hover:border-slate-350 hover:shadow-md"
      }`}
    >
      {/* Baris 1 (Header): Nomor Manifest & Badge Status */}
      <div className="flex items-center justify-between gap-2 w-full font-sans">
        <span className="font-mono text-[13px] font-normal text-slate-800 tracking-tight truncate font-sans">
          {highlightText(manifest.nomorManifest, searchQuery)}
        </span>

        <span
          className={`px-2.5 py-0.5 rounded-full text-[12px] font-normal border leading-none capitalize tracking-wider shrink-0 font-sans ${
            manifest.status === "LOCKED"
              ? "bg-slate-900 text-slate-100 border-slate-800"
              : manifest.status === "SENT"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-indigo-50 text-indigo-700 border-indigo-200"
          }`}
        >
          <span>{getStatusLabel(manifest.status)}</span>
        </span>
      </div>

      {/* Baris 2 (Body): 2 Columns divided by vertical line separator */}
      <div className="py-2 px-1 bg-slate-50 rounded-md border border-slate-100 flex items-center text-[12px] font-normal font-sans">
        {/* Left Column: Jumlah Bundle */}
        <div className="flex-1 flex items-center justify-center font-normal text-[#008f78] font-sans">
          <span>{bundlesCount} Bundle</span>
        </div>

        {/* Vertical Line Separator */}
        <div className="w-px h-3.5 bg-slate-200/90 shrink-0" />

        {/* Right Column: Total Pemohon */}
        <div className="flex-1 flex items-center justify-center font-normal text-slate-600 font-sans">
          <span>{totalPecahanCount} Pemohon</span>
        </div>
      </div>

      {/* Baris 3 (Footer): Pengirim avatar + tanggal */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 font-sans mt-auto">
        <div className="flex items-center gap-2 min-w-0 font-sans">
          <div
            className="w-5.5 h-5.5 rounded-full bg-[#00a389] text-white text-[8px] font-bold flex items-center justify-center shrink-0 shadow-3xs"
            title={manifest.pengirim?.name}
          >
            {getAvatarInitials(manifest.pengirim?.name)}
          </div>
        </div>

        <span className="text-[12px] font-normal text-slate-500 flex items-center gap-1 shrink-0 font-sans">
          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
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
