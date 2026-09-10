"use client";

import React from "react";
import { RefreshCw } from "lucide-react";

interface MonitorQueueHeaderProps {
  selectedBundle: any;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export const MonitorQueueHeader: React.FC<MonitorQueueHeaderProps> = React.memo(({
  selectedBundle,
  isRefreshing,
  onRefresh,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 select-none font-sans">
      <div>
        <h2 className="text-[13px] font-normal text-slate-700 capitalize font-sans flex items-center gap-2">
          <span className="font-mono font-bold text-slate-900 text-[13px]">{selectedBundle.nomorBundle}</span>
        </h2>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto font-sans">
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2 h-9 w-9 rounded-md border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-500 shadow-3xs transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center shrink-0"
          title="Refresh Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#00a389]" : ""}`} />
        </button>
      </div>
    </div>
  );
});

MonitorQueueHeader.displayName = "MonitorQueueHeader";
