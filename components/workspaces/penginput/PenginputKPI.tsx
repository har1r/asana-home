"use client";

import React, { useMemo } from 'react';

export interface KPIItem {
  status: string;
  [key: string]: any;
}

export interface KPICounts {
  total: number;
  submitted: number;
  submittedPct: string;
  revision: number;
  revisionPct: string;
  bundled: number;
  bundledPct: string;
  archived: number;
  archivedPct: string;
  completed: number;
  completedPct: string;
  rejected: number;
  rejectedPct: string;
}

export interface PenginputKPIProps {
  modeBaseList: KPIItem[];
  filterStatus: string;
  onSelectFilterStatus: (status: string) => void;
}

export const PenginputKPI: React.FC<PenginputKPIProps> = React.memo(({
  modeBaseList,
  filterStatus,
  onSelectFilterStatus,
}) => {
  // Single-pass KPI counts calculation for modeBaseList metrics
  const kpiCounts = useMemo<KPICounts>(() => {
    const total = modeBaseList.length;
    let submitted = 0;
    let revision = 0;
    let bundled = 0;
    let archived = 0;
    let completed = 0;
    let rejected = 0;

    for (let i = 0; i < total; i++) {
      const s = modeBaseList[i].status;
      if (s === 'SUBMITTED' || s === 'DRAFT') submitted++;
      else if (s === 'REVISION') revision++;
      else if (s === 'BUNDLED') bundled++;
      else if (s === 'ARCHIVED') archived++;
      else if (s === 'COMPLETED') completed++;
      else if (s === 'REJECTED') rejected++;
    }

    const calcPct = (count: number) => (total > 0 ? `${((count / total) * 100).toFixed(0)}%` : '0%');

    return {
      total,
      submitted,
      submittedPct: calcPct(submitted),
      revision,
      revisionPct: calcPct(revision),
      bundled,
      bundledPct: calcPct(bundled),
      archived,
      archivedPct: calcPct(archived),
      completed,
      completedPct: calcPct(completed),
      rejected,
      rejectedPct: calcPct(rejected),
    };
  }, [modeBaseList]);

  return (
    <div className="bg-white border border-slate-200/90 rounded-md p-1.5 shadow-3xs mb-1 select-none">
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
        {/* 1. Total Berkas / Pemohon */}
        <div
          onClick={() => onSelectFilterStatus('ALL')}
          className={`p-2.5 px-3 flex items-center justify-between transition-all cursor-pointer rounded-md ${
            filterStatus === 'ALL'
              ? 'bg-slate-100/90 text-slate-900 font-semibold'
              : 'hover:bg-slate-50 text-slate-600'
          }`}
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-normal text-slate-600 capitalize font-sans truncate">
              Total
            </span>
            <span className="text-lg font-bold font-mono text-slate-800">{kpiCounts.total}</span>
          </div>
          <span
            className={`text-[11px] font-semibold font-mono px-1.5 py-0.5 rounded border transition-all ${
              filterStatus === 'ALL'
                ? 'bg-[#00a389] text-white border-[#00a389]'
                : 'bg-slate-100 text-slate-500 border-slate-200/80'
            }`}
          >
            100%
          </span>
        </div>

        {/* 2. Diajukan */}
        <div
          onClick={() => onSelectFilterStatus('SUBMITTED')}
          className={`p-2.5 px-3 flex items-center justify-between transition-all cursor-pointer rounded-md ${
            filterStatus === 'SUBMITTED'
              ? 'bg-slate-100/90 text-slate-900 font-semibold'
              : 'hover:bg-slate-50 text-slate-600'
          }`}
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-normal text-slate-600 capitalize font-sans">Diajukan</span>
            <span className="text-lg font-bold font-mono text-slate-800">
              {kpiCounts.submitted}
            </span>
          </div>
          <span
            className={`text-[11px] font-semibold font-mono px-1.5 py-0.5 rounded border transition-all ${
              filterStatus === 'SUBMITTED'
                ? 'bg-[#00a389] text-white border-[#00a389]'
                : 'bg-slate-100 text-slate-500 border-slate-200/80'
            }`}
          >
            {kpiCounts.submittedPct}
          </span>
        </div>

        {/* 3. Revisi */}
        <div
          onClick={() => onSelectFilterStatus('REVISION')}
          className={`p-2.5 px-3 flex items-center justify-between transition-all cursor-pointer rounded-md ${
            filterStatus === 'REVISION'
              ? 'bg-slate-100/90 text-slate-900 font-semibold'
              : 'hover:bg-slate-50 text-slate-600'
          }`}
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-normal text-slate-600 capitalize font-sans">Revisi</span>
            <span className="text-lg font-bold font-mono text-slate-800">
              {kpiCounts.revision}
            </span>
          </div>
          <span
            className={`text-[11px] font-semibold font-mono px-1.5 py-0.5 rounded border transition-all ${
              filterStatus === 'REVISION'
                ? 'bg-[#00a389] text-white border-[#00a389]'
                : 'bg-slate-100 text-slate-500 border-slate-200/80'
            }`}
          >
            {kpiCounts.revisionPct}
          </span>
        </div>

        {/* 4. Terbundel */}
        <div
          onClick={() => onSelectFilterStatus('BUNDLED')}
          className={`p-2.5 px-3 flex items-center justify-between transition-all cursor-pointer rounded-md ${
            filterStatus === 'BUNDLED'
              ? 'bg-slate-100/90 text-slate-900 font-semibold'
              : 'hover:bg-slate-50 text-slate-600'
          }`}
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-normal text-slate-600 capitalize font-sans">Terbundel</span>
            <span className="text-lg font-bold font-mono text-slate-800">
              {kpiCounts.bundled}
            </span>
          </div>
          <span
            className={`text-[11px] font-semibold font-mono px-1.5 py-0.5 rounded border transition-all ${
              filterStatus === 'BUNDLED'
                ? 'bg-[#00a389] text-white border-[#00a389]'
                : 'bg-slate-100 text-slate-500 border-slate-200/80'
            }`}
          >
            {kpiCounts.bundledPct}
          </span>
        </div>

        {/* 5. Diarsipkan */}
        <div
          onClick={() => onSelectFilterStatus('ARCHIVED')}
          className={`p-2.5 px-3 flex items-center justify-between transition-all cursor-pointer rounded-md ${
            filterStatus === 'ARCHIVED'
              ? 'bg-slate-100/90 text-slate-900 font-semibold'
              : 'hover:bg-slate-50 text-slate-600'
          }`}
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-normal text-slate-600 capitalize font-sans">Diarsipkan</span>
            <span className="text-lg font-bold font-mono text-slate-800">
              {kpiCounts.archived}
            </span>
          </div>
          <span
            className={`text-[11px] font-semibold font-mono px-1.5 py-0.5 rounded border transition-all ${
              filterStatus === 'ARCHIVED'
                ? 'bg-[#00a389] text-white border-[#00a389]'
                : 'bg-slate-100 text-slate-500 border-slate-200/80'
            }`}
          >
            {kpiCounts.archivedPct}
          </span>
        </div>

        {/* 6. Selesai */}
        <div
          onClick={() => onSelectFilterStatus('COMPLETED')}
          className={`p-2.5 px-3 flex items-center justify-between transition-all cursor-pointer rounded-md ${
            filterStatus === 'COMPLETED'
              ? 'bg-slate-100/90 text-slate-900 font-semibold'
              : 'hover:bg-slate-50 text-slate-600'
          }`}
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-normal text-slate-600 capitalize font-sans">Selesai</span>
            <span className="text-lg font-bold font-mono text-slate-800">
              {kpiCounts.completed}
            </span>
          </div>
          <span
            className={`text-[11px] font-semibold font-mono px-1.5 py-0.5 rounded border transition-all ${
              filterStatus === 'COMPLETED'
                ? 'bg-[#00a389] text-white border-[#00a389]'
                : 'bg-slate-100 text-slate-500 border-slate-200/80'
            }`}
          >
            {kpiCounts.completedPct}
          </span>
        </div>

        {/* 7. Ditolak */}
        <div
          onClick={() => onSelectFilterStatus('REJECTED')}
          className={`p-2.5 px-3 flex items-center justify-between transition-all cursor-pointer rounded-md ${
            filterStatus === 'REJECTED'
              ? 'bg-slate-100/90 text-slate-900 font-semibold'
              : 'hover:bg-slate-50 text-slate-600'
          }`}
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-normal text-slate-600 capitalize font-sans">Ditolak</span>
            <span className="text-lg font-bold font-mono text-slate-800">
              {kpiCounts.rejected}
            </span>
          </div>
          <span
            className={`text-[11px] font-semibold font-mono px-1.5 py-0.5 rounded border transition-all ${
              filterStatus === 'REJECTED'
                ? 'bg-[#00a389] text-white border-[#00a389]'
                : 'bg-slate-100 text-slate-500 border-slate-200/80'
            }`}
          >
            {kpiCounts.rejectedPct}
          </span>
        </div>
      </div>
    </div>
  );
});

PenginputKPI.displayName = 'PenginputKPI';
