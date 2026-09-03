"use client";

import React from "react";

export interface PengarsipKPICounts {
  totalPemohon: number;
  sudahTerupload: number;
  belumDiupload: number;
  perluReupload: number;
}

export interface PengarsipKPIProps {
  kpiCounts: PengarsipKPICounts;
  filterBundleStatus: string;
  onSelectAll: () => void;
  onSelectLocked: () => void;
  onSelectReupload: () => void;
}

export const PengarsipKPI: React.FC<PengarsipKPIProps> = React.memo(({
  kpiCounts,
  filterBundleStatus,
  onSelectAll,
  onSelectLocked,
  onSelectReupload,
}) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-md p-1.5 shadow-3xs select-none font-sans">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
        {/* Metric 1: Total Pemohon */}
        <div
          onClick={onSelectAll}
          className={`p-2.5 px-3 flex items-center justify-between transition-all cursor-pointer rounded-md ${
            filterBundleStatus === "ALL"
              ? "bg-slate-100/90 text-slate-900 font-semibold"
              : "hover:bg-slate-50 text-slate-600"
          }`}
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-normal text-slate-600 capitalize font-sans">Total Pemohon</span>
            <span className="text-lg font-bold font-mono text-slate-800">{kpiCounts.totalPemohon}</span>
          </div>
          <span
            className={`text-[11px] font-semibold font-mono px-1.5 py-0.5 rounded border transition-all ${
              filterBundleStatus === "ALL"
                ? "bg-[#00a389] text-white border-[#00a389]"
                : "bg-slate-100 text-slate-500 border-slate-200/80"
            }`}
          >
            100%
          </span>
        </div>

        {/* Metric 2: Sudah Terupload */}
        <div
          onClick={onSelectAll}
          className="p-2.5 px-3 flex items-center justify-between transition-all cursor-pointer rounded-md hover:bg-slate-50 text-slate-600"
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-normal text-slate-600 capitalize font-sans">Sudah Terupload</span>
            <span className="text-lg font-bold font-mono text-slate-800">{kpiCounts.sudahTerupload}</span>
          </div>
          <span className="text-[11px] font-semibold font-mono px-1.5 py-0.5 rounded border bg-slate-100 text-slate-500 border-slate-200/80">
            {kpiCounts.totalPemohon > 0
              ? `${((kpiCounts.sudahTerupload / kpiCounts.totalPemohon) * 100).toFixed(0)}%`
              : "0%"}
          </span>
        </div>

        {/* Metric 3: Belum Diupload */}
        <div
          onClick={onSelectLocked}
          className={`p-2.5 px-3 flex items-center justify-between transition-all cursor-pointer rounded-md ${
            filterBundleStatus === "LOCKED"
              ? "bg-slate-100/90 text-slate-900 font-semibold"
              : "hover:bg-slate-50 text-slate-600"
          }`}
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-normal text-slate-600 capitalize font-sans">Belum Diupload</span>
            <span className="text-lg font-bold font-mono text-slate-800">{kpiCounts.belumDiupload}</span>
          </div>
          <span
            className={`text-[11px] font-semibold font-mono px-1.5 py-0.5 rounded border transition-all ${
              filterBundleStatus === "LOCKED"
                ? "bg-[#00a389] text-white border-[#00a389]"
                : "bg-slate-100 text-slate-500 border-slate-200/80"
            }`}
          >
            {kpiCounts.totalPemohon > 0
              ? `${((kpiCounts.belumDiupload / kpiCounts.totalPemohon) * 100).toFixed(0)}%`
              : "0%"}
          </span>
        </div>

        {/* Metric 4: Dikembalikan / Re-upload */}
        <div
          onClick={onSelectReupload}
          className={`p-2.5 px-3 flex items-center justify-between transition-all cursor-pointer rounded-md ${
            filterBundleStatus === "REUPLOAD"
              ? "bg-amber-100/90 text-amber-900 font-semibold"
              : kpiCounts.perluReupload > 0
              ? "bg-amber-50/70 hover:bg-amber-100/80 text-amber-800"
              : "hover:bg-slate-50 text-slate-600"
          }`}
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-normal text-slate-600 capitalize font-sans flex items-center gap-1">
              <span>Re-upload</span>
              {kpiCounts.perluReupload > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block" />
              )}
            </span>
            <span
              className={`text-lg font-bold font-mono ${
                kpiCounts.perluReupload > 0 ? "text-amber-600" : "text-slate-800"
              }`}
            >
              {kpiCounts.perluReupload}
            </span>
          </div>
          <span
            className={`text-[11px] font-semibold font-mono px-1.5 py-0.5 rounded border transition-all ${
              filterBundleStatus === "REUPLOAD"
                ? "bg-amber-500 text-white border-amber-500"
                : kpiCounts.perluReupload > 0
                ? "bg-amber-500 text-white border-amber-500"
                : "bg-slate-100 text-slate-500 border-slate-200/80"
            }`}
          >
            {kpiCounts.perluReupload > 0 ? `${kpiCounts.perluReupload} Berkas` : "0"}
          </span>
        </div>
      </div>
    </div>
  );
});

PengarsipKPI.displayName = "PengarsipKPI";
