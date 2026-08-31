"use client";

import React from "react";

export interface ManifestStatusCounts {
  ALL: number;
  DRAFT: number;
  LOCKED: number;
  SENT: number;
  [key: string]: number;
}

export interface PengirimKPIProps {
  manifestStatusCounts: ManifestStatusCounts;
  totalManifests: number;
  filterManifestStatus: string;
  onSelectAll: () => void;
  onSelectDraft: () => void;
  onSelectLocked: () => void;
  onSelectSent: () => void;
}

export const PengirimKPI: React.FC<PengirimKPIProps> = React.memo(({
  manifestStatusCounts,
  totalManifests,
  filterManifestStatus,
  onSelectAll,
  onSelectDraft,
  onSelectLocked,
  onSelectSent,
}) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-md p-1.5 shadow-3xs select-none font-sans">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
        {/* Metric 1: Total Manifest */}
        <div
          onClick={onSelectAll}
          className={`p-2.5 px-3 flex items-center justify-between transition-all cursor-pointer rounded-md ${
            filterManifestStatus === "ALL"
              ? "bg-slate-100/90 text-slate-900 font-semibold"
              : "hover:bg-slate-50 text-slate-600"
          }`}
        >
          <div className="flex flex-col gap-0.5 font-sans">
            <span className="text-[13px] font-normal text-slate-600 capitalize font-sans">Total Manifest</span>
            <span className="text-lg font-bold font-mono text-slate-800">{manifestStatusCounts.ALL}</span>
          </div>
          <span
            className={`text-[11px] font-semibold font-mono px-1.5 py-0.5 rounded border transition-all ${
              filterManifestStatus === "ALL"
                ? "bg-[#00a389] text-white border-[#00a389]"
                : "bg-slate-100 text-slate-500 border-slate-200/80"
            }`}
          >
            100%
          </span>
        </div>

        {/* Metric 2: Draf */}
        <div
          onClick={onSelectDraft}
          className={`p-2.5 px-3 flex items-center justify-between transition-all cursor-pointer rounded-md ${
            filterManifestStatus === "DRAFT"
              ? "bg-slate-100/90 text-slate-900 font-semibold"
              : "hover:bg-slate-50 text-slate-600"
          }`}
        >
          <div className="flex flex-col gap-0.5 font-sans">
            <span className="text-[13px] font-normal text-slate-600 capitalize font-sans">Draf</span>
            <span className="text-lg font-bold font-mono text-slate-800">{manifestStatusCounts.DRAFT}</span>
          </div>
          <span
            className={`text-[11px] font-semibold font-mono px-1.5 py-0.5 rounded border transition-all ${
              filterManifestStatus === "DRAFT"
                ? "bg-[#00a389] text-white border-[#00a389]"
                : "bg-slate-100 text-slate-500 border-slate-200/80"
            }`}
          >
            {totalManifests > 0 ? `${((manifestStatusCounts.DRAFT / totalManifests) * 100).toFixed(0)}%` : "0%"}
          </span>
        </div>

        {/* Metric 3: Terkunci */}
        <div
          onClick={onSelectLocked}
          className={`p-2.5 px-3 flex items-center justify-between transition-all cursor-pointer rounded-md ${
            filterManifestStatus === "LOCKED"
              ? "bg-slate-100/90 text-slate-900 font-semibold"
              : "hover:bg-slate-50 text-slate-600"
          }`}
        >
          <div className="flex flex-col gap-0.5 font-sans">
            <span className="text-[13px] font-normal text-slate-600 capitalize font-sans">Terkunci</span>
            <span className="text-lg font-bold font-mono text-slate-800">{manifestStatusCounts.LOCKED}</span>
          </div>
          <span
            className={`text-[11px] font-semibold font-mono px-1.5 py-0.5 rounded border transition-all ${
              filterManifestStatus === "LOCKED"
                ? "bg-[#00a389] text-white border-[#00a389]"
                : "bg-slate-100 text-slate-500 border-slate-200/80"
            }`}
          >
            {totalManifests > 0 ? `${((manifestStatusCounts.LOCKED / totalManifests) * 100).toFixed(0)}%` : "0%"}
          </span>
        </div>

        {/* Metric 4: Dikirim */}
        <div
          onClick={onSelectSent}
          className={`p-2.5 px-3 flex items-center justify-between transition-all cursor-pointer rounded-md ${
            filterManifestStatus === "SENT"
              ? "bg-slate-100/90 text-slate-900 font-semibold"
              : "hover:bg-slate-50 text-slate-600"
          }`}
        >
          <div className="flex flex-col gap-0.5 font-sans">
            <span className="text-[13px] font-normal text-slate-600 capitalize font-sans">Dikirim</span>
            <span className="text-lg font-bold font-mono text-slate-800">{manifestStatusCounts.SENT}</span>
          </div>
          <span
            className={`text-[11px] font-semibold font-mono px-1.5 py-0.5 rounded border transition-all ${
              filterManifestStatus === "SENT"
                ? "bg-[#00a389] text-white border-[#00a389]"
                : "bg-slate-100 text-slate-500 border-slate-200/80"
            }`}
          >
            {totalManifests > 0 ? `${((manifestStatusCounts.SENT / totalManifests) * 100).toFixed(0)}%` : "0%"}
          </span>
        </div>
      </div>
    </div>
  );
});

PengirimKPI.displayName = "PengirimKPI";
