"use client";

import React, { useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { formatBundleNumber } from "@/components/workspaces/shared/constants";

export interface ArchivistArsipToolbarProps {
  selectedBundle?: any | null;
  bundlesList?: any[];
  onSelectBundle?: (bundle: any) => void;
  arsipDisplayMode: "berkas" | "pemohon";
  onDisplayModeChange: (mode: "berkas" | "pemohon") => void;
}

export const ArchivistArsipToolbar: React.FC<ArchivistArsipToolbarProps> = React.memo(
  ({
    selectedBundle,
    bundlesList = [],
    onSelectBundle,
    arsipDisplayMode,
    onDisplayModeChange,
  }) => {
    const [isBundleDropdownOpen, setIsBundleDropdownOpen] = useState(false);

    // Format selected bundle number matching standard
    const rawSelectedNum = selectedBundle?.nomorBundle || selectedBundle?.bundleNumber || "";
    const formattedSelectedNumber = rawSelectedNum
      ? formatBundleNumber(rawSelectedNum, selectedBundle?.createdAt)
      : selectedBundle?.name || selectedBundle?.id || "";

    return (
      <div className="flex items-center justify-between gap-3 font-sans select-none flex-wrap">
        {/* Left Side: Target Bundle Selector Dropdown */}
        <div className="relative shrink-0 flex items-center">
          {bundlesList && bundlesList.length > 0 ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsBundleDropdownOpen(!isBundleDropdownOpen)}
                className="h-[38px] px-3 bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-slate-300 rounded-md flex items-center gap-1.5 text-xs font-semibold text-slate-800 transition-all cursor-pointer shadow-3xs font-sans"
                title="Pilih Target Bundle untuk Diisi"
              >
                <span className="font-mono text-slate-900 font-bold truncate max-w-[240px]">
                  {formattedSelectedNumber || "Pilih Bundle Target"}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5 shrink-0" />
              </button>

              {/* Dropdown Menu for selecting target bundle */}
              {isBundleDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setIsBundleDropdownOpen(false)}
                  />
                  <div className="absolute left-0 mt-1 w-72 bg-white border border-slate-200 rounded-md shadow-lg z-30 py-1 max-h-60 overflow-y-auto font-sans">
                    <div className="px-3 py-1.5 text-[11px] font-bold text-slate-500 capitalize border-b border-slate-100">
                      Pilih Target Bundle Diisi
                    </div>
                    {bundlesList.map((b: any) => {
                      const isSelected = selectedBundle?.id === b.id;
                      const rawNum = b.nomorBundle || b.bundleNumber || "";
                      const formattedNum = rawNum ? formatBundleNumber(rawNum, b.createdAt) : (b.name || b.id || "—");
                      return (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => {
                            if (onSelectBundle) onSelectBundle(b);
                            setIsBundleDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected ? "bg-emerald-50 text-[#00a389] font-semibold" : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <span className="font-mono truncate">{formattedNum}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#00a389] shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="h-[38px] px-3 bg-slate-100/80 border border-slate-200/80 rounded-md flex items-center gap-1.5 text-xs font-medium text-slate-500 shadow-3xs font-sans">
              <span className="font-mono text-slate-600 truncate max-w-[240px]">
                {formattedSelectedNumber || "Belum Ada Bundle Target"}
              </span>
            </div>
          )}
        </div>

        {/* Right Side: Display Mode Switcher Tab (Permohonan vs Pemohon) */}
        <div className="bg-slate-200/70 p-0.5 rounded-md flex items-center gap-0.5 border border-slate-300/60 text-[13px] font-normal select-none h-8 font-sans">
          <button
            type="button"
            onClick={() => onDisplayModeChange("berkas")}
            className={`h-7 px-3 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              arsipDisplayMode === "berkas"
                ? "bg-white text-slate-900 shadow-3xs font-normal"
                : "text-slate-600 hover:text-slate-900"
            }`}
            title="Tampilkan 1 baris per Nomor Pelayanan (NOPEL)"
          >
            <span>Permohonan</span>
          </button>
          <button
            type="button"
            onClick={() => onDisplayModeChange("pemohon")}
            className={`h-7 px-3 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              arsipDisplayMode === "pemohon"
                ? "bg-white text-slate-900 shadow-3xs font-normal"
                : "text-slate-600 hover:text-slate-900"
            }`}
            title="Tampilkan rincian pecahan pemilik baru (Mutasi Sebagian)"
          >
            <span>Pemohon</span>
          </button>
        </div>
      </div>
    );
  }
);

ArchivistArsipToolbar.displayName = "ArchivistArsipToolbar";
