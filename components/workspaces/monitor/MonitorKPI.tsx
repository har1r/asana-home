"use client";

import React from "react";

export interface PemantauKPICounts {
  total: number;
  completed: number;
  pending: number;
  percentage: number;
}

export interface PemantauKPIProps {
  pemohonKpiCounts: PemantauKPICounts;
}

export const PemantauKPI: React.FC<PemantauKPIProps> = React.memo(({
  pemohonKpiCounts,
}) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-md p-1.5 shadow-3xs select-none font-sans">
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
        {/* Metric 1: Total Pemohon */}
        <div className="p-2.5 px-3 flex items-center justify-between transition-all rounded-md hover:bg-slate-50 text-slate-600">
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-normal text-slate-600 capitalize font-sans">Total Pemohon</span>
            <span className="text-lg font-bold font-mono text-slate-800">{pemohonKpiCounts.total}</span>
          </div>
          <span className="text-[11px] font-semibold font-mono px-1.5 py-0.5 rounded border transition-all bg-[#00a389] text-white border-[#00a389]">
            100%
          </span>
        </div>

        {/* Metric 2: Selesai */}
        <div className="p-2.5 px-3 flex items-center justify-between transition-all rounded-md hover:bg-slate-50 text-slate-600">
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-normal text-slate-600 capitalize font-sans">Selesai</span>
            <span className="text-lg font-bold font-mono text-slate-800">{pemohonKpiCounts.completed}</span>
          </div>
          <span className="text-[11px] font-semibold font-mono px-1.5 py-0.5 rounded border transition-all bg-slate-100 text-slate-600 border-slate-200/80">
            {pemohonKpiCounts.percentage}%
          </span>
        </div>

        {/* Metric 3: Belum Selesai (Selisih) */}
        <div className="p-2.5 px-3 flex items-center justify-between transition-all rounded-md hover:bg-slate-50 text-slate-600">
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-normal text-slate-600 capitalize font-sans">Belum Selesai</span>
            <span className="text-lg font-bold font-mono text-slate-800">{pemohonKpiCounts.pending}</span>
          </div>
          <span className="text-[11px] font-semibold font-mono px-1.5 py-0.5 rounded border transition-all bg-slate-100 text-slate-600 border-slate-200/80">
            {pemohonKpiCounts.total > 0 ? `${Math.round((pemohonKpiCounts.pending / pemohonKpiCounts.total) * 100)}%` : "0%"}
          </span>
        </div>

        {/* Metric 4: Progres Penyelesaian */}
        <div className="p-2.5 px-3 flex items-center justify-between transition-all rounded-md hover:bg-slate-50 text-slate-600">
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-normal text-slate-600 capitalize font-sans">Progres</span>
            <span className="text-lg font-bold font-mono text-slate-800">{pemohonKpiCounts.percentage}%</span>
          </div>
          <span className="text-[11px] font-semibold font-mono px-1.5 py-0.5 rounded border transition-all bg-slate-100 text-slate-600 border-slate-200/80">
            {pemohonKpiCounts.completed}/{pemohonKpiCounts.total}
          </span>
        </div>
      </div>
    </div>
  );
});

PemantauKPI.displayName = "PemantauKPI";
