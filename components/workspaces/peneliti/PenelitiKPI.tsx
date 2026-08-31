"use client";

import React from "react";

export interface BundleStatusCounts {
  DRAFT: number;
  LOCKED: number;
  IN_MANIFEST: number;
  VOID: number;
  [key: string]: number;
}

export interface PenelitiKPIProps {
  totalBundles: number;
  bundleStatusCounts: BundleStatusCounts;
  returnedFromPengarsipCount: number;
  returnedFromPengirimLogistikCount: number;
  returnedFromPengirimPusatCount: number;
  filterRevisionSource: string;
  filterBundleStatus: string;
  onSelectZoneABundleStatus: (status: string) => void;
  onSelectZoneBRevisionSource: (source: string) => void;
}

export const PenelitiKPI: React.FC<PenelitiKPIProps> = React.memo(({
  totalBundles,
  bundleStatusCounts,
  returnedFromPengarsipCount,
  returnedFromPengirimLogistikCount,
  returnedFromPengirimPusatCount,
  filterRevisionSource,
  filterBundleStatus,
  onSelectZoneABundleStatus,
  onSelectZoneBRevisionSource,
}) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-md p-1.5 shadow-3xs select-none flex flex-col xl:flex-row gap-2 items-stretch font-sans">
      {/* ZONA A: PIPELINE STATUS OPERASIONAL BUNDLE (5 Metrics) */}
      <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
        {/* Metric 1: Total Bundle */}
        <div
          onClick={() => onSelectZoneABundleStatus("ALL")}
          className={`p-2.5 px-3 flex items-center justify-between transition-all cursor-pointer rounded-md ${
            filterRevisionSource === "ALL" && filterBundleStatus === "ALL"
              ? "bg-slate-100/90 text-slate-900 font-semibold"
              : "hover:bg-slate-50 text-slate-600"
          }`}
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-normal text-slate-600 capitalize font-sans">Bundle</span>
            <span className="text-lg font-bold font-mono text-slate-800">{totalBundles}</span>
          </div>
          <span
            className={`text-[11px] font-semibold font-mono px-1.5 py-0.5 rounded border transition-all ${
              filterRevisionSource === "ALL" && filterBundleStatus === "ALL"
                ? "bg-[#00a389] text-white border-[#00a389]"
                : "bg-slate-100 text-slate-500 border-slate-200/80"
            }`}
          >
            100%
          </span>
        </div>

        {/* Metric 2: Draf */}
        <div
          onClick={() => onSelectZoneABundleStatus("DRAFT")}
          className={`p-2.5 px-3 flex items-center justify-between transition-all cursor-pointer rounded-md ${
            filterRevisionSource === "ALL" && filterBundleStatus === "DRAFT"
              ? "bg-slate-100/90 text-slate-900 font-semibold"
              : "hover:bg-slate-50 text-slate-600"
          }`}
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-normal text-slate-600 capitalize font-sans">Draf</span>
            <span className="text-lg font-bold font-mono text-slate-800">{bundleStatusCounts.DRAFT}</span>
          </div>
          <span
            className={`text-[11px] font-semibold font-mono px-1.5 py-0.5 rounded border transition-all ${
              filterRevisionSource === "ALL" && filterBundleStatus === "DRAFT"
                ? "bg-[#00a389] text-white border-[#00a389]"
                : "bg-slate-100 text-slate-500 border-slate-200/80"
            }`}
          >
            {totalBundles > 0 ? `${((bundleStatusCounts.DRAFT / totalBundles) * 100).toFixed(0)}%` : "0%"}
          </span>
        </div>

        {/* Metric 3: Terkunci */}
        <div
          onClick={() => onSelectZoneABundleStatus("LOCKED")}
          className={`p-2.5 px-3 flex items-center justify-between transition-all cursor-pointer rounded-md ${
            filterRevisionSource === "ALL" && filterBundleStatus === "LOCKED"
              ? "bg-slate-100/90 text-slate-900 font-semibold"
              : "hover:bg-slate-50 text-slate-600"
          }`}
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-normal text-slate-600 capitalize font-sans">Terkunci</span>
            <span className="text-lg font-bold font-mono text-slate-800">{bundleStatusCounts.LOCKED}</span>
          </div>
          <span
            className={`text-[11px] font-semibold font-mono px-1.5 py-0.5 rounded border transition-all ${
              filterRevisionSource === "ALL" && filterBundleStatus === "LOCKED"
                ? "bg-[#00a389] text-white border-[#00a389]"
                : "bg-slate-100 text-slate-500 border-slate-200/80"
            }`}
          >
            {totalBundles > 0 ? `${((bundleStatusCounts.LOCKED / totalBundles) * 100).toFixed(0)}%` : "0%"}
          </span>
        </div>

        {/* Metric 4: Dimanifest */}
        <div
          onClick={() => onSelectZoneABundleStatus("IN_MANIFEST")}
          className={`p-2.5 px-3 flex items-center justify-between transition-all cursor-pointer rounded-md ${
            filterRevisionSource === "ALL" && filterBundleStatus === "IN_MANIFEST"
              ? "bg-slate-100/90 text-slate-900 font-semibold"
              : "hover:bg-slate-50 text-slate-600"
          }`}
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-normal text-slate-600 capitalize font-sans">Dimanifest</span>
            <span className="text-lg font-bold font-mono text-slate-800">{bundleStatusCounts.IN_MANIFEST}</span>
          </div>
          <span
            className={`text-[11px] font-semibold font-mono px-1.5 py-0.5 rounded border transition-all ${
              filterRevisionSource === "ALL" && filterBundleStatus === "IN_MANIFEST"
                ? "bg-[#00a389] text-white border-[#00a389]"
                : "bg-slate-100 text-slate-500 border-slate-200/80"
            }`}
          >
            {totalBundles > 0 ? `${((bundleStatusCounts.IN_MANIFEST / totalBundles) * 100).toFixed(0)}%` : "0%"}
          </span>
        </div>

        {/* Metric 5: Dibatalkan / Void */}
        <div
          onClick={() => onSelectZoneABundleStatus("VOID")}
          className={`p-2.5 px-3 flex items-center justify-between transition-all cursor-pointer rounded-md ${
            filterRevisionSource === "ALL" && filterBundleStatus === "VOID"
              ? "bg-slate-100/90 text-slate-900 font-semibold"
              : "hover:bg-slate-50 text-slate-600"
          }`}
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-normal text-slate-600 capitalize font-sans">Dibatalkan</span>
            <span className="text-lg font-bold font-mono text-slate-800">{bundleStatusCounts.VOID}</span>
          </div>
          <span
            className={`text-[11px] font-semibold font-mono px-1.5 py-0.5 rounded border transition-all ${
              filterRevisionSource === "ALL" && filterBundleStatus === "VOID"
                ? "bg-[#00a389] text-white border-[#00a389]"
                : "bg-slate-100 text-slate-500 border-slate-200/80"
            }`}
          >
            {totalBundles > 0 ? `${((bundleStatusCounts.VOID / totalBundles) * 100).toFixed(0)}%` : "0%"}
          </span>
        </div>
      </div>

      {/* ZONA B: PENGEMBALIAN BERKAS & ALERT REVISI (Ultra-Compact Alert Cards) */}
      <div className="xl:w-[410px] grid grid-cols-1 sm:grid-cols-3 gap-1.5 shrink-0 pl-0 xl:pl-2 xl:border-l border-slate-200/80">
        {/* Metric 6: 🟡 Revisi - Badge: Pengarsip */}
        <div
          onClick={() => onSelectZoneBRevisionSource("PENGARSIP")}
          className={`p-2 px-2.5 flex items-center justify-between transition-all cursor-pointer rounded-md border ${
            filterRevisionSource === "PENGARSIP"
              ? "bg-amber-100/90 text-amber-900 font-semibold border-amber-300 shadow-3xs"
              : "bg-amber-50/80 hover:bg-amber-100/90 text-amber-900 border-amber-200/90"
          }`}
        >
          <div className="flex flex-col gap-0.5 font-sans">
            <span className="text-[12px] font-medium text-amber-800 capitalize font-sans">Retur</span>
            <span className="text-base font-bold font-mono text-amber-950">{returnedFromPengarsipCount}</span>
          </div>
          <span
            className={`text-[9.5px] font-semibold font-sans px-1.5 py-0.5 rounded border transition-all shadow-3xs ${
              filterRevisionSource === "PENGARSIP"
                ? "bg-amber-600 text-white border-amber-600"
                : "bg-amber-100/90 text-amber-800 border-amber-300/80"
            }`}
          >
            Pengarsip
          </span>
        </div>

        {/* Metric 7: 🟠 Retur - Badge: Pengirim */}
        <div
          onClick={() => onSelectZoneBRevisionSource("PENGIRIM_LOGISTIK")}
          className={`p-2 px-2.5 flex items-center justify-between transition-all cursor-pointer rounded-md border ${
            filterRevisionSource === "PENGIRIM_LOGISTIK"
              ? "bg-orange-100/90 text-orange-900 font-semibold border-orange-300 shadow-3xs"
              : "bg-orange-50/80 hover:bg-orange-100/90 text-orange-900 border-orange-200/90"
          }`}
        >
          <div className="flex flex-col gap-0.5 font-sans">
            <span className="text-[12px] font-medium text-orange-800 capitalize font-sans">Retur</span>
            <span className="text-base font-bold font-mono text-orange-950">{returnedFromPengirimLogistikCount}</span>
          </div>
          <span
            className={`text-[9.5px] font-semibold font-sans px-1.5 py-0.5 rounded border transition-all shadow-3xs ${
              filterRevisionSource === "PENGIRIM_LOGISTIK"
                ? "bg-orange-600 text-white border-orange-600"
                : "bg-orange-100/90 text-orange-800 border-orange-300/80"
            }`}
          >
            Pengirim
          </span>
        </div>

        {/* Metric 8: 🔴 Retur - Badge: Pusat */}
        <div
          onClick={() => onSelectZoneBRevisionSource("PENGIRIM_PUSAT")}
          className={`p-2 px-2.5 flex items-center justify-between transition-all cursor-pointer rounded-md border ${
            filterRevisionSource === "PENGIRIM_PUSAT"
              ? "bg-rose-100/90 text-rose-900 font-semibold border-rose-300 shadow-3xs"
              : "bg-rose-50/80 hover:bg-rose-100/90 text-rose-900 border-rose-200/90"
          }`}
        >
          <div className="flex flex-col gap-0.5 font-sans">
            <span className="text-[12px] font-medium text-rose-800 capitalize font-sans">Retur</span>
            <span className="text-base font-bold font-mono text-rose-950">{returnedFromPengirimPusatCount}</span>
          </div>
          <span
            className={`text-[9.5px] font-semibold font-sans px-1.5 py-0.5 rounded border transition-all shadow-3xs ${
              filterRevisionSource === "PENGIRIM_PUSAT"
                ? "bg-rose-600 text-white border-rose-600"
                : "bg-rose-100/90 text-rose-800 border-rose-300/80"
            }`}
          >
            Pusat
          </span>
        </div>
      </div>
    </div>
  );
});

PenelitiKPI.displayName = "PenelitiKPI";
