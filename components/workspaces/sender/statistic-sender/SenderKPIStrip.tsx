"use client";

import React, { useState } from "react";
import { TrendingUp } from "lucide-react";

export interface ManifestStatusCounts {
  ALL: number;
  DRAFT: number;
  LOCKED: number;
  SENT: number;
  [key: string]: number;
}

export interface SenderKPIStripProps {
  manifestStatusCounts: ManifestStatusCounts;
  totalManifests: number;
  filterManifestStatus: string;
  onSelectAll: () => void;
  onSelectDraft: () => void;
  onSelectLocked: () => void;
  onSelectSent: () => void;
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
          <linearGradient id={`gradient-sender-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Gradient fill beneath curve */}
        <path d={areaD} fill={`url(#gradient-sender-${id})`} />

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

export const SenderKPIStrip: React.FC<SenderKPIStripProps> = React.memo(({
  manifestStatusCounts,
  totalManifests,
  filterManifestStatus,
  onSelectAll,
  onSelectDraft,
  onSelectLocked,
  onSelectSent,
}) => {
  const draftCount = manifestStatusCounts.DRAFT || 0;
  const lockedCount = manifestStatusCounts.LOCKED || 0;
  const sentCount = manifestStatusCounts.SENT || 0;

  // Percentage calculations
  const draftPct = totalManifests > 0 ? `${((draftCount / totalManifests) * 100).toFixed(0)}%` : "0%";
  const lockedPct = totalManifests > 0 ? `${((lockedCount / totalManifests) * 100).toFixed(0)}%` : "0%";
  const sentPct = totalManifests > 0 ? `${((sentCount / totalManifests) * 100).toFixed(0)}%` : "0%";

  // Dynamic sparkline trends
  const totalTrend = [
    Math.max(1, Math.round(totalManifests * 0.4)),
    Math.max(1, Math.round(totalManifests * 0.6)),
    Math.max(1, Math.round(totalManifests * 0.75)),
    Math.max(1, Math.round(totalManifests * 0.9)),
    totalManifests,
    Math.max(1, Math.round(totalManifests * 0.85)),
    totalManifests,
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

  const sentTrend = [
    Math.max(0, Math.round(sentCount * 0.2)),
    Math.max(0, Math.round(sentCount * 0.6)),
    Math.max(0, Math.round(sentCount * 0.8)),
    sentCount,
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-1 select-none font-sans">
      {/* CARD 1: TOTAL MANIFEST */}
      <div
        onClick={onSelectAll}
        className={`rounded-md p-4 border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
          filterManifestStatus === "ALL"
            ? "bg-gradient-to-br from-[#00a389]/5 via-emerald-50/20 to-white border-[#00a389] shadow-md ring-2 ring-[#00a389]/20"
            : "bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-sm"
        }`}
      >
        <div className="flex flex-col min-w-0 mb-3 font-sans">
          <h3 className="text-sm font-bold text-slate-800 leading-tight">Total Manifest</h3>
          <p className="text-[11px] font-normal text-slate-500 truncate">Jumlah seluruh manifest pengiriman</p>
        </div>

        <div className="flex items-end justify-between gap-2 mt-1">
          <div className="flex flex-col gap-1 font-sans">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
              {totalManifests.toLocaleString("id-ID")}
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

      {/* CARD 2: MANIFEST DRAF */}
      <div
        onClick={onSelectDraft}
        className={`rounded-md p-4 border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
          filterManifestStatus === "DRAFT"
            ? "bg-gradient-to-br from-[#00a389]/5 via-emerald-50/20 to-white border-[#00a389] shadow-md ring-2 ring-[#00a389]/20"
            : "bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-sm"
        }`}
      >
        <div className="flex flex-col min-w-0 mb-3 font-sans">
          <h3 className="text-sm font-bold text-slate-800 leading-tight">Draf</h3>
          <p className="text-[11px] font-normal text-slate-500 truncate">Manifest dalam penyusunan draf</p>
        </div>

        <div className="flex items-end justify-between gap-2 mt-1">
          <div className="flex flex-col gap-1 font-sans">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
              {draftCount.toLocaleString("id-ID")}
            </span>
            <div className="flex items-center gap-1 text-[11px] font-medium text-amber-600">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{draftPct} <span className="text-slate-400 font-normal">dari total</span></span>
            </div>
          </div>

          <div className="shrink-0 pb-0.5">
            <SparklineAreaChart data={draftTrend} color="#f59e0b" id="sender-draf" />
          </div>
        </div>
      </div>

      {/* CARD 3: MANIFEST TERKUNCI */}
      <div
        onClick={onSelectLocked}
        className={`rounded-md p-4 border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
          filterManifestStatus === "LOCKED"
            ? "bg-gradient-to-br from-[#00a389]/5 via-emerald-50/20 to-white border-[#00a389] shadow-md ring-2 ring-[#00a389]/20"
            : "bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-sm"
        }`}
      >
        <div className="flex flex-col min-w-0 mb-3 font-sans">
          <h3 className="text-sm font-bold text-slate-800 leading-tight">Terkunci</h3>
          <p className="text-[11px] font-normal text-slate-500 truncate">Manifest selesai dan dikunci</p>
        </div>

        <div className="flex items-end justify-between gap-2 mt-1">
          <div className="flex flex-col gap-1 font-sans">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
              {lockedCount.toLocaleString("id-ID")}
            </span>
            <div className="flex items-center gap-1 text-[11px] font-medium text-sky-600">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{lockedPct} <span className="text-slate-400 font-normal">dari total</span></span>
            </div>
          </div>

          <div className="shrink-0 pb-0.5">
            <SparklineAreaChart data={lockedTrend} color="#0284c7" id="sender-terkunci" />
          </div>
        </div>
      </div>

      {/* CARD 4: MANIFEST DIKIRIM */}
      <div
        onClick={onSelectSent}
        className={`rounded-md p-4 border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
          filterManifestStatus === "SENT"
            ? "bg-gradient-to-br from-[#00a389]/5 via-emerald-50/20 to-white border-[#00a389] shadow-md ring-2 ring-[#00a389]/20"
            : "bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-sm"
        }`}
      >
        <div className="flex flex-col min-w-0 mb-3 font-sans">
          <h3 className="text-sm font-bold text-slate-800 leading-tight">Dikirim</h3>
          <p className="text-[11px] font-normal text-slate-500 truncate">Manifest telah dikirim (ber-resi)</p>
        </div>

        <div className="flex items-end justify-between gap-2 mt-1">
          <div className="flex flex-col gap-1 font-sans">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
              {sentCount.toLocaleString("id-ID")}
            </span>
            <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{sentPct} <span className="text-slate-400 font-normal">dari total</span></span>
            </div>
          </div>

          <div className="shrink-0 pb-0.5">
            <SparklineAreaChart data={sentTrend} color="#10b981" id="sender-dikirim" />
          </div>
        </div>
      </div>
    </div>
  );
});

SenderKPIStrip.displayName = "SenderKPIStrip";
