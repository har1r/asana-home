"use client";

import React from "react";
import { FileSpreadsheet, Trash, Loader2 } from "lucide-react";

interface SenderApplicationsToolbarProps {
  selectedBundleInManifest: any | null;
  bundleDisplayMode: "berkas" | "pemohon";
  onDisplayModeChange: (mode: "berkas" | "pemohon") => void;
}

export const SenderApplicationsToolbar: React.FC<SenderApplicationsToolbarProps> = React.memo(({
  selectedBundleInManifest,
  bundleDisplayMode,
  onDisplayModeChange,
}) => {
  const selectedBundleNo = selectedBundleInManifest?.nomorBundle || selectedBundleInManifest?.bundleNumber || "";

  return (
    <div className="bg-white border border-slate-200/90 rounded-md p-3 shadow-3xs flex flex-col sm:flex-row items-center justify-between gap-3 select-none font-sans">
      {/* Left: Selected Bundle Indicator */}
      <div className="flex items-center gap-2.5 font-sans">
        {selectedBundleNo ? (
          <span className="bg-emerald-50 text-[#008f78] text-[11px] font-bold font-mono px-2 py-0.5 rounded-md border border-emerald-200/80">
            Map {selectedBundleNo}
          </span>
        ) : (
          <span className="bg-slate-100 text-slate-500 text-[11px] font-medium font-sans px-2 py-0.5 rounded-md border border-slate-200/80">
            Pilih map bundle di atas
          </span>
        )}
      </div>

      {/* Right: Controls (Mode Switcher & Excel Export Always Visible) */}
      <div className="flex items-center gap-2.5 shrink-0 justify-end flex-wrap font-sans">
        {/* Segmented Display Mode Switcher */}
        <div className="inline-flex p-0.5 bg-slate-100 border border-slate-200/80 rounded-md select-none font-sans">
          <button
            type="button"
            onClick={() => onDisplayModeChange("berkas")}
            className={`px-2.5 py-1 rounded-md text-[12px] font-normal font-sans capitalize transition-all cursor-pointer ${bundleDisplayMode === "berkas"
              ? "bg-white text-slate-800 shadow-xs font-medium"
              : "text-slate-600 hover:text-slate-800"
              }`}
          >
            Nopel
          </button>
          <button
            type="button"
            onClick={() => onDisplayModeChange("pemohon")}
            className={`px-2.5 py-1 rounded-md text-[12px] font-normal font-sans capitalize transition-all cursor-pointer ${bundleDisplayMode === "pemohon"
              ? "bg-white text-slate-800 shadow-xs font-medium"
              : "text-slate-600 hover:text-slate-800"
              }`}
          >
            Pemohon
          </button>
        </div>

        {/* Export Excel Button (Selalu Visible, Disabled jika belum ada bundle terpilih) */}
        {selectedBundleInManifest?.id ? (
          <a
            href={`/api/export/bundle/${selectedBundleInManifest.id}`}
            download
            className="p-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-md transition-all shadow-3xs cursor-pointer flex items-center justify-center font-sans"
            title="Ekspor daftar permohonan ke Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#00a389]" />
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="p-1.5 text-slate-400 bg-slate-100/70 border border-slate-200/80 rounded-md opacity-50 cursor-not-allowed flex items-center justify-center font-sans"
            title="Pilih map bundle terlebih dahulu untuk mengekspor ke Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-slate-400" />
          </button>
        )}
      </div>
    </div>
  );
});

