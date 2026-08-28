"use client";

import React, { useState } from "react";
import { AlertTriangle, RefreshCw, X } from "lucide-react";

export interface RevisionAlertBannerProps {
  /** Jumlah berkas yang perlu direvisi/dikoreksi */
  count: number;
  /** Teks merah tebal diawal judul (default: "Perhatian, ") */
  titlePrefix?: string;
  /** Teks judul utama (default: "Berkas Perlu Direvisi") */
  titleText?: string;
  /** Teks deskripsi setelah angka jumlah berkas (default: "permohonan dikembalikan oleh Peneliti/Supervisor untuk diperbaiki.") */
  descriptionText?: string;
  /** Teks pada tombol aksi (default: "Lihat Berkas Revisi") */
  actionLabel?: string;
  /** Handler callback saat tombol aksi diklik */
  onAction?: () => void;
  /** Handler callback kustom saat tombol X diklik */
  onDismiss?: () => void;
}

export const RevisionAlertBanner: React.FC<RevisionAlertBannerProps> = ({
  count,
  titlePrefix = "Perhatian, ",
  titleText = "Berkas Perlu Direvisi",
  descriptionText = "permohonan dikembalikan oleh Peneliti/Supervisor untuk diperbaiki.",
  actionLabel = "Lihat Berkas Revisi",
  onAction,
  onDismiss
}) => {
  const [dismissed, setDismissed] = useState(false);

  if (count <= 0 || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    if (onDismiss) onDismiss();
  };

  return (
    <div className="relative overflow-hidden w-full bg-[#fff5f6] border border-rose-200/80 border-l-[5px] border-l-[#e11d48] rounded-md p-4 px-5 flex items-center justify-between gap-4 shadow-3xs animate-fadeIn select-none font-sans">
      {/* Background Polka Dot Decoration (Top Right) */}
      <div
        className="absolute right-0 top-0 w-44 h-full pointer-events-none opacity-25"
        style={{
          backgroundImage: "radial-gradient(#e11d48 1.2px, transparent 1.2px)",
          backgroundSize: "9px 9px"
        }}
      />

      {/* Left Content Area (Icon + Text) */}
      <div className="flex items-center gap-4 min-w-0 relative z-10">
        {/* Multi-layered Glowing Circle Icon with Alert Rays */}
        <div className="relative shrink-0 flex items-center justify-center">
          {/* Alert Rays top-right */}
          <div className="absolute -top-1 -right-1 text-[#e11d48] z-10 pointer-events-none">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 2v4M19 5l-3 3M22 12h-4" />
            </svg>
          </div>

          {/* Outer Translucent Ring */}
          <div className="w-14 h-14 rounded-full bg-rose-200/60 flex items-center justify-center p-1">
            {/* Inner Ring */}
            <div className="w-full h-full rounded-full bg-rose-100 flex items-center justify-center shadow-2xs">
              {/* Red Triangle Alert Icon */}
              <div className="w-9 h-9 rounded-full bg-[#e11d48] text-white flex items-center justify-center shadow-xs">
                <AlertTriangle className="w-5 h-5 fill-white stroke-[#e11d48]" />
              </div>
            </div>
          </div>
        </div>

        {/* Text Area */}
        <div className="flex flex-col gap-0.5 min-w-0">
          <h3 className="text-[15px] font-bold text-slate-900 font-sans tracking-tight">
            <span className="text-[#e11d48]">{titlePrefix}</span>
            <span>{titleText}</span>
          </h3>
          <p className="text-[13px] text-slate-600 font-normal font-sans leading-snug">
            <span className="text-[#e11d48] font-bold">{count} berkas </span>
            <span>{descriptionText}</span>
          </p>
        </div>
      </div>

      {/* Right Action Controls */}
      <div className="flex items-center gap-4 shrink-0 relative z-10">
        {/* Vertical Separator Divider */}
        <div className="h-9 w-[1px] bg-slate-300/60 hidden sm:block" />

        {/* Action Button */}
        {onAction && (
          <button
            type="button"
            onClick={onAction}
            className="h-10 px-4 rounded-md bg-white border border-[#e11d48] hover:bg-rose-50 text-[#e11d48] text-[13px] font-bold transition-all cursor-pointer shadow-3xs flex items-center gap-2 font-sans"
          >
            <RefreshCw className="w-4 h-4 text-[#e11d48]" />
            <span>{actionLabel}</span>
          </button>
        )}

        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-md transition-colors cursor-pointer"
          title="Tutup Pemberitahuan"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
