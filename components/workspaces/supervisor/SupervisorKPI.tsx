"use client";

import React from "react";

export interface SupervisorStats {
  pendingTotal: number;
  decidedToday: number;
  approvedTotal: number;
  rejectedTotal: number;
}

export interface SupervisorKPIProps {
  stats: SupervisorStats;
  viewMode: "queue" | "history";
  filterJenis: string;
  historyFilterStatus: string;
  onSelectPendingAll: () => void;
  onSwitchTabHistory: () => void;
  onSelectHistoryApproved: () => void;
  onSelectHistoryRejected: () => void;
}

export const SupervisorKPI: React.FC<SupervisorKPIProps> = React.memo(({
  stats,
  viewMode,
  filterJenis,
  historyFilterStatus,
  onSelectPendingAll,
  onSwitchTabHistory,
  onSelectHistoryApproved,
  onSelectHistoryRejected,
}) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-md p-1.5 shadow-3xs select-none">
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
        {/* Metric 1: Menunggu Keputusan */}
        <div
          onClick={onSelectPendingAll}
          className={`p-3 px-3.5 flex items-center justify-between transition-all cursor-pointer rounded-md ${
            viewMode === "queue" && filterJenis === "ALL"
              ? "bg-slate-100/90 text-slate-900 font-bold"
              : "hover:bg-slate-50 text-slate-600"
          }`}
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-bold text-slate-500 capitalize">Menunggu Keputusan</span>
            <span className="text-xl font-black font-mono text-slate-900">{stats.pendingTotal}</span>
          </div>
          <span
            className={`text-xs font-black font-mono px-2 py-0.5 rounded-md border transition-all ${
              viewMode === "queue" && filterJenis === "ALL"
                ? "bg-[#00a389] text-white border-[#00a389]"
                : "bg-slate-100 text-slate-500 border-slate-200/80"
            }`}
          >
            Pending
          </span>
        </div>

        {/* Metric 2: Diputuskan Hari Ini */}
        <div
          onClick={onSwitchTabHistory}
          className={`p-3 px-3.5 flex items-center justify-between transition-all cursor-pointer rounded-md ${
            viewMode === "history" ? "bg-slate-100/90 text-slate-900 font-bold" : "hover:bg-slate-50 text-slate-600"
          }`}
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-bold text-slate-500 capitalize">Diputuskan Hari Ini</span>
            <span className="text-xl font-black font-mono text-slate-900">{stats.decidedToday}</span>
          </div>
          <span className="text-xs font-black font-mono px-2 py-0.5 rounded-md border bg-slate-100 text-slate-500 border-slate-200/80">
            Hari Ini
          </span>
        </div>

        {/* Metric 3: Total Disetujui */}
        <div
          onClick={onSelectHistoryApproved}
          className={`p-3 px-3.5 flex items-center justify-between transition-all cursor-pointer rounded-md ${
            viewMode === "history" && historyFilterStatus === "APPROVED"
              ? "bg-slate-100/90 text-slate-900 font-bold"
              : "hover:bg-slate-50 text-slate-600"
          }`}
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-bold text-slate-500 capitalize">Total Disetujui</span>
            <span className="text-xl font-black font-mono text-slate-900">{stats.approvedTotal}</span>
          </div>
          <span className="text-xs font-black font-mono px-2 py-0.5 rounded-md border bg-emerald-50 text-[#008f78] border-emerald-200">
            Disetujui
          </span>
        </div>

        {/* Metric 4: Total Ditolak */}
        <div
          onClick={onSelectHistoryRejected}
          className={`p-3 px-3.5 flex items-center justify-between transition-all cursor-pointer rounded-md ${
            viewMode === "history" && historyFilterStatus === "REJECTED"
              ? "bg-slate-100/90 text-slate-900 font-bold"
              : "hover:bg-slate-50 text-slate-600"
          }`}
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-bold text-slate-500 capitalize">Total Ditolak</span>
            <span className="text-xl font-black font-mono text-slate-900">{stats.rejectedTotal}</span>
          </div>
          <span className="text-xs font-black font-mono px-2 py-0.5 rounded-md border bg-rose-50 text-rose-700 border-rose-200">
            Ditolak
          </span>
        </div>
      </div>
    </div>
  );
});

SupervisorKPI.displayName = "SupervisorKPI";
