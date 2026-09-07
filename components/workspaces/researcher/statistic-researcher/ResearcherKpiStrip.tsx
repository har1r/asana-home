"use client";

import React, { useState } from "react";
import { TrendingUp } from "lucide-react";
import { BundleStatusCounts } from "./useResearcherStatistics";

export interface ResearcherKpiStripProps {
  viewMode?: 'bundle' | 'list' | 'print';
  totalBundles: number;
  bundleStatusCounts: BundleStatusCounts;
  returnedFromPengarsipCount: number;
  returnedFromPengirimLogistikCount: number;
  returnedFromPengirimPusatCount: number;
  filterRevisionSource?: string;
  filterBundleStatus?: string;
  onSelectZoneABundleStatus?: (status: string) => void;
  onSelectZoneBRevisionSource?: (source: string) => void;
}

// ==================== DYNAMIC SVG BAR SPARKLINE ====================
const SparklineBarChart: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const width = 84;
  const height = 40;
  const maxVal = Math.max(...data, 1);
  const barWidth = 7;
  const gap = 5;

  return (
    <div className="relative group/chart">
      <svg width={width} height={height} className="overflow-visible">
        {data.map((val, idx) => {
          const barHeight = Math.max(4, Math.round((val / maxVal) * (height - 8)));
          const x = idx * (barWidth + gap);
          const y = height - barHeight;
          const isHovered = hoveredIdx === idx;

          return (
            <g key={idx} onMouseEnter={() => setHoveredIdx(idx)} onMouseLeave={() => setHoveredIdx(null)}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={2.5}
                fill={color}
                opacity={isHovered ? 1 : 0.8}
                className="transition-all duration-200 cursor-pointer"
              />
            </g>
          );
        })}
      </svg>

      {/* Tooltip on hover */}
      {hoveredIdx !== null && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-mono px-2 py-0.5 rounded shadow-lg z-20 pointer-events-none whitespace-nowrap">
          {data[hoveredIdx]} data
        </div>
      )}
    </div>
  );
};

// ==================== DYNAMIC SVG SMOOTH AREA SPARKLINE ====================
const SparklineAreaChart: React.FC<{ data: number[]; color: string; id: string }> = ({ data, color, id }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const width = 90;
  const height = 40;
  const maxVal = Math.max(...data, 1);
  const minVal = Math.min(...data, 0);
  const range = maxVal - minVal || 1;

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = height - 4 - ((val - minVal) / range) * (height - 12);
    return { x, y, val };
  });

  // Build smooth Bezier path
  let pathD = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    const cpX = (curr.x + next.x) / 2;
    pathD += ` C ${cpX},${curr.y} ${cpX},${next.y} ${next.x},${next.y}`;
  }

  const areaD = `${pathD} L ${width},${height} L 0,${height} Z`;

  return (
    <div className="relative group/chart">
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id={`gradient-researcher-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Gradient fill beneath curve */}
        <path d={areaD} fill={`url(#gradient-researcher-${id})`} />

        {/* Curve Line */}
        <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points */}
        {points.map((pt, idx) => (
          <circle
            key={idx}
            cx={pt.x}
            cy={pt.y}
            r={hoveredIdx === idx ? 4 : 2}
            fill={hoveredIdx === idx ? "#ffffff" : color}
            stroke={color}
            strokeWidth={hoveredIdx === idx ? 2.5 : 1}
            className="transition-all cursor-pointer"
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
          />
        ))}
      </svg>

      {/* Tooltip on hover */}
      {hoveredIdx !== null && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-mono px-2 py-0.5 rounded shadow-lg z-20 pointer-events-none whitespace-nowrap">
          {data[hoveredIdx]} data
        </div>
      )}
    </div>
  );
};

export const ResearcherKpiStrip: React.FC<ResearcherKpiStripProps> = React.memo(({
  viewMode = 'bundle',
  totalBundles,
  bundleStatusCounts,
  returnedFromPengarsipCount,
  returnedFromPengirimLogistikCount,
  returnedFromPengirimPusatCount,
}) => {
  const draftCount = bundleStatusCounts.DRAFT || 0;
  const lockedCount = bundleStatusCounts.LOCKED || 0;
  const manifestCount = bundleStatusCounts.IN_MANIFEST || 0;
  const totalReturCount = returnedFromPengarsipCount + returnedFromPengirimLogistikCount + returnedFromPengirimPusatCount;

  // Percentage calculations
  const draftPct = totalBundles > 0 ? `${((draftCount / totalBundles) * 100).toFixed(0)}%` : "0%";
  const lockedPct = totalBundles > 0 ? `${((lockedCount / totalBundles) * 100).toFixed(0)}%` : "0%";
  const manifestPct = totalBundles > 0 ? `${((manifestCount / totalBundles) * 100).toFixed(0)}%` : "0%";

  const totalReturPct = totalBundles > 0 ? `${((totalReturCount / totalBundles) * 100).toFixed(0)}%` : "0%";
  const pengarsipPct = totalBundles > 0 ? `${((returnedFromPengarsipCount / totalBundles) * 100).toFixed(0)}%` : "0%";
  const logistikPct = totalBundles > 0 ? `${((returnedFromPengirimLogistikCount / totalBundles) * 100).toFixed(0)}%` : "0%";
  const pusatPct = totalBundles > 0 ? `${((returnedFromPengirimPusatCount / totalBundles) * 100).toFixed(0)}%` : "0%";

  // Dummy trend arrays for smooth sparkline visuals
  const totalTrend = [
    Math.max(1, Math.round(totalBundles * 0.4)),
    Math.max(1, Math.round(totalBundles * 0.6)),
    Math.max(1, Math.round(totalBundles * 0.75)),
    Math.max(1, Math.round(totalBundles * 0.9)),
    totalBundles,
    Math.max(1, Math.round(totalBundles * 0.85)),
    totalBundles,
  ];

  const draftTrend = [
    Math.max(0, Math.round(draftCount * 0.5)),
    Math.max(0, Math.round(draftCount * 0.8)),
    Math.max(0, Math.round(draftCount * 0.6)),
    Math.max(0, Math.round(draftCount * 0.9)),
    draftCount,
  ];

  const lockedTrend = [
    Math.max(0, Math.round(lockedCount * 0.3)),
    Math.max(0, Math.round(lockedCount * 0.5)),
    Math.max(0, Math.round(lockedCount * 0.7)),
    Math.max(0, Math.round(lockedCount * 0.85)),
    lockedCount,
  ];

  const manifestTrend = [
    Math.max(0, Math.round(manifestCount * 0.2)),
    Math.max(0, Math.round(manifestCount * 0.6)),
    Math.max(0, Math.round(manifestCount * 0.8)),
    manifestCount,
  ];

  const totalReturTrend = [
    Math.max(0, Math.round(totalReturCount * 0.3)),
    Math.max(0, Math.round(totalReturCount * 0.6)),
    Math.max(0, Math.round(totalReturCount * 0.8)),
    totalReturCount,
  ];

  const pengarsipTrend = [
    Math.max(0, Math.round(returnedFromPengarsipCount * 0.3)),
    Math.max(0, Math.round(returnedFromPengarsipCount * 0.7)),
    Math.max(0, Math.round(returnedFromPengarsipCount * 0.5)),
    returnedFromPengarsipCount,
  ];

  const logistikTrend = [
    Math.max(0, Math.round(returnedFromPengirimLogistikCount * 0.4)),
    Math.max(0, Math.round(returnedFromPengirimLogistikCount * 0.8)),
    returnedFromPengirimLogistikCount,
  ];

  const pusatTrend = [
    Math.max(0, Math.round(returnedFromPengirimPusatCount * 0.2)),
    Math.max(0, Math.round(returnedFromPengirimPusatCount * 0.6)),
    returnedFromPengirimPusatCount,
  ];

  // ==================== MODE 1: QUEUE ANTREAN PERMOHONAN (DISPLAY ONLY) ====================
  if (viewMode === 'list') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-2 select-none font-sans">
        {/* CARD 1: TOTAL RETUR */}
        <div className="bg-white rounded-md p-4 border border-slate-100/90 shadow-2xs flex flex-col justify-between">
          <div className="flex flex-col min-w-0 mb-3">
            <h3 className="text-sm font-bold text-slate-800 leading-tight">Total Retur</h3>
            <p className="text-[11px] font-normal text-slate-500 truncate">Seluruh permohonan direvisi</p>
          </div>

          <div className="flex items-end justify-between gap-2 mt-1">
            <div className="flex flex-col gap-1">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
                {totalReturCount.toLocaleString("id-ID")}
              </span>
              <div className="flex items-center gap-1 text-[11px] font-medium text-rose-600">
                <TrendingUp className="w-3.5 h-3.5 text-rose-600" />
                <span>{totalReturPct} <span className="text-slate-400 font-normal">dari total</span></span>
              </div>
            </div>

            <div className="shrink-0 pb-0.5">
              <SparklineBarChart data={totalReturTrend} color="#ef4444" />
            </div>
          </div>
        </div>

        {/* CARD 2: RETUR PENGARSIP */}
        <div className="bg-white rounded-md p-4 border border-slate-100/90 shadow-2xs flex flex-col justify-between">
          <div className="flex flex-col min-w-0 mb-3">
            <h3 className="text-sm font-bold text-slate-800 leading-tight">Retur Pengarsip</h3>
            <p className="text-[11px] font-normal text-slate-500 truncate">Dikembalikan oleh petugas Pengarsip</p>
          </div>

          <div className="flex items-end justify-between gap-2 mt-1">
            <div className="flex flex-col gap-1">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
                {returnedFromPengarsipCount.toLocaleString("id-ID")}
              </span>
              <div className="flex items-center gap-1 text-[11px] font-medium text-amber-700">
                <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                <span>{pengarsipPct} <span className="text-slate-400 font-normal">dari total</span></span>
              </div>
            </div>

            <div className="shrink-0 pb-0.5">
              <SparklineBarChart data={pengarsipTrend} color="#f59e0b" />
            </div>
          </div>
        </div>

        {/* CARD 3: RETUR LOGISTIK */}
        <div className="bg-white rounded-md p-4 border border-slate-100/90 shadow-2xs flex flex-col justify-between">
          <div className="flex flex-col min-w-0 mb-3">
            <h3 className="text-sm font-bold text-slate-800 leading-tight">Retur Logistik</h3>
            <p className="text-[11px] font-normal text-slate-500 truncate">Dikembalikan oleh Pengirim Logistik</p>
          </div>

          <div className="flex items-end justify-between gap-2 mt-1">
            <div className="flex flex-col gap-1">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
                {returnedFromPengirimLogistikCount.toLocaleString("id-ID")}
              </span>
              <div className="flex items-center gap-1 text-[11px] font-medium text-orange-700">
                <TrendingUp className="w-3.5 h-3.5 text-orange-600" />
                <span>{logistikPct} <span className="text-slate-400 font-normal">dari total</span></span>
              </div>
            </div>

            <div className="shrink-0 pb-0.5">
              <SparklineBarChart data={logistikTrend} color="#f97316" />
            </div>
          </div>
        </div>

        {/* CARD 4: RETUR KANTOR PUSAT */}
        <div className="bg-white rounded-md p-4 border border-slate-100/90 shadow-2xs flex flex-col justify-between">
          <div className="flex flex-col min-w-0 mb-3">
            <h3 className="text-sm font-bold text-slate-800 leading-tight">Retur Kantor Pusat</h3>
            <p className="text-[11px] font-normal text-slate-500 truncate">Dikembalikan oleh Kantor Pusat</p>
          </div>

          <div className="flex items-end justify-between gap-2 mt-1">
            <div className="flex flex-col gap-1">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
                {returnedFromPengirimPusatCount.toLocaleString("id-ID")}
              </span>
              <div className="flex items-center gap-1 text-[11px] font-medium text-rose-700">
                <TrendingUp className="w-3.5 h-3.5 text-rose-600" />
                <span>{pusatPct} <span className="text-slate-400 font-normal">dari total</span></span>
              </div>
            </div>

            <div className="shrink-0 pb-0.5">
              <SparklineBarChart data={pusatTrend} color="#f43f5e" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== MODE 2: KELOLA BUNDLE & DEFAULT (DISPLAY ONLY) ====================
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-2 select-none font-sans">
      {/* CARD 1: TOTAL BUNDLE */}
      <div className="bg-white rounded-md p-4 border border-slate-100/90 shadow-2xs flex flex-col justify-between">
        <div className="flex flex-col min-w-0 mb-3">
          <h3 className="text-sm font-bold text-slate-800 leading-tight">Total Bundle</h3>
          <p className="text-[11px] font-normal text-slate-500 truncate">Jumlah seluruh bundle permohonan</p>
        </div>

        <div className="flex items-end justify-between gap-2 mt-1">
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
              {totalBundles.toLocaleString("id-ID")}
            </span>
            <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>100% <span className="text-slate-400 font-normal">total</span></span>
            </div>
          </div>

          <div className="shrink-0 pb-0.5">
            <SparklineBarChart data={totalTrend} color="#3b82f6" />
          </div>
        </div>
      </div>

      {/* CARD 2: BUNDLE DRAF */}
      <div className="bg-white rounded-md p-4 border border-slate-100/90 shadow-2xs flex flex-col justify-between">
        <div className="flex flex-col min-w-0 mb-3">
          <h3 className="text-sm font-bold text-slate-800 leading-tight">Draf</h3>
          <p className="text-[11px] font-normal text-slate-500 truncate">Bundle dalam penyusunan</p>
        </div>

        <div className="flex items-end justify-between gap-2 mt-1">
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
              {draftCount.toLocaleString("id-ID")}
            </span>
            <div className="flex items-center gap-1 text-[11px] font-medium text-amber-600">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{draftPct} <span className="text-slate-400 font-normal">dari total</span></span>
            </div>
          </div>

          <div className="shrink-0 pb-0.5">
            <SparklineAreaChart data={draftTrend} color="#f59e0b" id="researcher-draf" />
          </div>
        </div>
      </div>

      {/* CARD 3: BUNDLE DIKUNCI */}
      <div className="bg-white rounded-md p-4 border border-slate-100/90 shadow-2xs flex flex-col justify-between">
        <div className="flex flex-col min-w-0 mb-3">
          <h3 className="text-sm font-bold text-slate-800 leading-tight">Dikunci</h3>
          <p className="text-[11px] font-normal text-slate-500 truncate">Bundle selesai dan dikunci</p>
        </div>

        <div className="flex items-end justify-between gap-2 mt-1">
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
              {lockedCount.toLocaleString("id-ID")}
            </span>
            <div className="flex items-center gap-1 text-[11px] font-medium text-sky-600">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{lockedPct} <span className="text-slate-400 font-normal">dari total</span></span>
            </div>
          </div>

          <div className="shrink-0 pb-0.5">
            <SparklineAreaChart data={lockedTrend} color="#0284c7" id="researcher-dikunci" />
          </div>
        </div>
      </div>

      {/* CARD 4: BUNDLE DIMANIFEST */}
      <div className="bg-white rounded-md p-4 border border-slate-100/90 shadow-2xs flex flex-col justify-between">
        <div className="flex flex-col min-w-0 mb-3">
          <h3 className="text-sm font-bold text-slate-800 leading-tight">Dimanifest</h3>
          <p className="text-[11px] font-normal text-slate-500 truncate">Bundle masuk dalam manifest</p>
        </div>

        <div className="flex items-end justify-between gap-2 mt-1">
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
              {manifestCount.toLocaleString("id-ID")}
            </span>
            <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{manifestPct} <span className="text-slate-400 font-normal">dari total</span></span>
            </div>
          </div>

          <div className="shrink-0 pb-0.5">
            <SparklineAreaChart data={manifestTrend} color="#10b981" id="researcher-dimanifest" />
          </div>
        </div>
      </div>
    </div>
  );
});

ResearcherKpiStrip.displayName = "ResearcherKpiStrip";
