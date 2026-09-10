"use client";

import React from "react";
import { FileSpreadsheet, Trash } from "lucide-react";

interface SenderPermohonanToolbarProps {
  selectedBundleInManifest: any | null;
  manifestStatus: string;
  bundleDisplayMode: "berkas" | "pemohon";
  onDisplayModeChange: (mode: "berkas" | "pemohon") => void;
  onRemoveBundle: (bundleId: string) => void;
  loading: boolean;
}

export const SenderPermohonanToolbar: React.FC<SenderPermohonanToolbarProps> = React.memo(({
  selectedBundleInManifest,
  manifestStatus,
  bundleDisplayMode,
  onDisplayModeChange,
  onRemoveBundle,
  loading,
}) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-md p-3 shadow-3xs flex flex-row items-center justify-end gap-3 select-none font-sans">
      {selectedBundleInManifest && (
        <div className="flex items-center gap-2.5 shrink-0 justify-end flex-wrap font-sans">
          {/* Segmented Display Mode Switcher */}
          <div className="inline-flex p-0.5 bg-slate-100 border border-slate-200/80 rounded-md select-none font-sans">
            <button
              type="button"
              onClick={() => onDisplayModeChange("berkas")}
              className={`px-2.5 py-1 rounded text-[12px] font-normal font-sans capitalize transition-all cursor-pointer ${
                bundleDisplayMode === "berkas"
                  ? "bg-white text-slate-800 shadow-xs"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              Nopel
            </button>
            <button
              type="button"
              onClick={() => onDisplayModeChange("pemohon")}
              className={`px-2.5 py-1 rounded text-[12px] font-normal font-sans capitalize transition-all cursor-pointer ${
                bundleDisplayMode === "pemohon"
                  ? "bg-white text-slate-800 shadow-xs"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              Pemohon
            </button>
          </div>

          {/* Export Excel Button */}
          <a
            href={`/api/export/bundle/${selectedBundleInManifest.id}`}
            download
            className="p-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-md transition-all shadow-3xs cursor-pointer flex items-center justify-center font-sans"
            title="Ekspor daftar permohonan ke Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#00a389]" />
          </a>

          {/* Remove Bundle Button */}
          {manifestStatus === "DRAFT" && (
            <button
              type="button"
              onClick={() => onRemoveBundle(selectedBundleInManifest.id)}
              disabled={loading}
              className="p-1.5 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-all cursor-pointer shadow-3xs flex items-center justify-center disabled:opacity-40 font-sans"
              title="Keluarkan bundle dari manifest"
            >
              <Trash className="w-4 h-4 text-rose-600" />
            </button>
          )}
        </div>
      )}
    </div>
  );
});

SenderPermohonanToolbar.displayName = "SenderPermohonanToolbar";
