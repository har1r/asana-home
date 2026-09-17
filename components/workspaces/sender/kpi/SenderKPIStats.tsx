"use client";

import React, { useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { ManifestStatusCounts, SenderKPIStatsMetrics } from "./useSenderKPIStats";

export type { ManifestStatusCounts, SenderKPIStatsMetrics };

export interface SenderKPIStripProps {
  metrics?: SenderKPIStatsMetrics;
}

const weekLabels = ["Minggu ke-4 Lalu", "Minggu ke-3 Lalu", "Minggu ke-2 Lalu", "Minggu ini"];

export const SenderKPIStats: React.FC<SenderKPIStripProps> = React.memo(({
  metrics,
}) => {
  const totalManifests = metrics?.totalManifests ?? 0;
  const draftCount = metrics?.manifestStatusCounts?.DRAFT ?? 0;
  const lockedCount = metrics?.manifestStatusCounts?.LOCKED ?? 0;
  const sentCount = metrics?.manifestStatusCounts?.SENT ?? 0;

  const totalTrend = metrics?.totalTrend ?? [];
  const draftTrend = metrics?.draftTrend ?? [];
  const lockedTrend = metrics?.lockedTrend ?? [];
  const sentTrend = metrics?.sentTrend ?? [];

  const totalGrowth = metrics?.totalGrowthPct ?? 0;
  const draftGrowth = metrics?.draftGrowthPct ?? 0;
  const lockedGrowth = metrics?.lockedGrowthPct ?? 0;
  const sentGrowth = metrics?.sentGrowthPct ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-1 select-none font-sans">
      <div className="bg-white rounded-md p-4 border border-slate-100/90 shadow-2xs flex flex-col justify-between">
        <div className="flex flex-col min-w-0 mb-3 font-sans">
          <h3 className="text-sm font-bold text-slate-800 leading-tight">Total Manifest</h3>
          <p className="text-[11px] font-normal text-slate-500 truncate">Jumlah seluruh manifest yang dibuat</p>
        </div>

        <div className="flex items-end justify-between gap-2 mt-1">
          <div className="flex flex-col gap-1 font-sans">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
              {totalManifests.toLocaleString("id-ID")}
            </span>
            <GrowthBadge
              growthPct={totalGrowth}
              positiveColorClass="text-emerald-600"
            />
          </div>

          <div className="shrink-0 pb-0.5">
            <SparklineBarChart data={totalTrend} color="#3b82f6" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-md p-4 border border-slate-100/90 shadow-2xs flex flex-col justify-between">
        <div className="flex flex-col min-w-0 mb-3 font-sans">
          <h3 className="text-sm font-bold text-slate-800 leading-tight">Draf</h3>
          <p className="text-[11px] font-normal text-slate-500 truncate">Jumlah Manifest yang dalam penyusunan</p>
        </div>

        <div className="flex items-end justify-between gap-2 mt-1">
          <div className="flex flex-col gap-1 font-sans">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
              {draftCount.toLocaleString("id-ID")}
            </span>
            <GrowthBadge
              growthPct={draftGrowth}
              positiveColorClass="text-amber-600"
            />
          </div>

          <div className="shrink-0 pb-0.5">
            <SparklineAreaChart data={draftTrend} color="#f59e0b" id="sender-draf" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-md p-4 border border-slate-100/90 shadow-2xs flex flex-col justify-between">
        <div className="flex flex-col min-w-0 mb-3 font-sans">
          <h3 className="text-sm font-bold text-slate-800 leading-tight">Terkunci</h3>
          <p className="text-[11px] font-normal text-slate-500 truncate">Jumlah Manifest yang sudah dikunci</p>
        </div>

        <div className="flex items-end justify-between gap-2 mt-1">
          <div className="flex flex-col gap-1 font-sans">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
              {lockedCount.toLocaleString("id-ID")}
            </span>
            <GrowthBadge
              growthPct={lockedGrowth}
              positiveColorClass="text-sky-600"
            />
          </div>

          <div className="shrink-0 pb-0.5">
            <SparklineAreaChart data={lockedTrend} color="#0284c7" id="sender-terkunci" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-md p-4 border border-slate-100/90 shadow-2xs flex flex-col justify-between">
        <div className="flex flex-col min-w-0 mb-3 font-sans">
          <h3 className="text-sm font-bold text-slate-800 leading-tight">Dikirim</h3>
          <p className="text-[11px] font-normal text-slate-500 truncate">Jumlah Manifest yang sudah dikirim</p>
        </div>

        <div className="flex items-end justify-between gap-2 mt-1">
          <div className="flex flex-col gap-1 font-sans">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
              {sentCount.toLocaleString("id-ID")}
            </span>
            <GrowthBadge
              growthPct={sentGrowth}
              positiveColorClass="text-emerald-600"
            />
          </div>

          <div className="shrink-0 pb-0.5">
            <SparklineAreaChart data={sentTrend} color="#10b981" id="sender-dikirim" />
          </div>
        </div>
      </div>
    </div>
  );
});

const SparklineBarChart: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const width = 84;
  const height = 40;
  const maxVal = Math.max(...data, 1);
  const isFourPoints = data.length === 4;
  const barWidth = isFourPoints ? 13 : 7;
  const gap = isFourPoints ? 8 : 5;

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

      {hoveredIdx !== null && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-mono px-2 py-0.5 rounded-md shadow-lg z-20 pointer-events-none whitespace-nowrap">
          {weekLabels[hoveredIdx] || `Minggu ${hoveredIdx + 1}`}: {data[hoveredIdx]} data
        </div>
      )}
    </div>
  );
};

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

        <path d={areaD} fill={`url(#gradient-sender-${id})`} />

        <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

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


      {hoveredIdx !== null && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-mono px-2 py-0.5 rounded-md shadow-lg z-20 pointer-events-none whitespace-nowrap">
          {weekLabels[hoveredIdx] || `Minggu ${hoveredIdx + 1}`}: {data[hoveredIdx]} data
        </div>
      )}
    </div>
  );
};

const GrowthBadge: React.FC<{
  growthPct: number;
  positiveColorClass?: string;
  inverted?: boolean;
}> = ({ growthPct, positiveColorClass = "text-emerald-600", inverted = false }) => {
  const isPositive = growthPct > 0;
  const isNegative = growthPct < 0;

  let colorClass = "text-slate-500";
  let Icon = TrendingUp;

  if (isPositive) {
    colorClass = inverted ? "text-rose-600" : positiveColorClass;
    Icon = TrendingUp;
  } else if (isNegative) {
    colorClass = inverted ? "text-emerald-600" : "text-rose-600";
    Icon = TrendingDown;
  }

  const formattedVal = isPositive ? `+${growthPct}%` : `${growthPct}%`;

  return (
    <div className={`flex items-center gap-1 text-[11px] font-medium ${colorClass}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{formattedVal}</span>
    </div>
  );
};


