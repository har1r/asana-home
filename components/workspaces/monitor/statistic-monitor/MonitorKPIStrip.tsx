"use client";

import React, { useState } from "react";
import { TrendingUp } from "lucide-react";
import { PemohonKpiCounts } from "./useMonitorStatistics";

export interface MonitorKPIStripProps {
  pemohonKpiCounts: PemohonKpiCounts;
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
          <linearGradient id={`gradient-monitor-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Gradient fill beneath curve */}
        <path d={areaD} fill={`url(#gradient-monitor-${id})`} />

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

export const MonitorKPIStrip: React.FC<MonitorKPIStripProps> = React.memo(({
  pemohonKpiCounts,
}) => {
  const { total, completed, pending, percentage } = pemohonKpiCounts;

  const completedPct = total > 0 ? `${percentage}%` : "0%";
  const pendingPct = total > 0 ? `${Math.round((pending / total) * 100)}%` : "0%";

  // Dynamic sparkline trends
  const totalTrend = [
    Math.max(1, Math.round(total * 0.4)),
    Math.max(1, Math.round(total * 0.6)),
    Math.max(1, Math.round(total * 0.75)),
    Math.max(1, Math.round(total * 0.9)),
    total,
    Math.max(1, Math.round(total * 0.85)),
    total,
  ];

  const completedTrend = [
    Math.max(0, Math.round(completed * 0.3)),
    Math.max(0, Math.round(completed * 0.5)),
    Math.max(0, Math.round(completed * 0.75)),
    Math.max(0, Math.round(completed * 0.9)),
    completed,
  ];

  const pendingTrend = [
    Math.max(0, Math.round(pending * 0.5)),
    Math.max(0, Math.round(pending * 0.8)),
    Math.max(0, Math.round(pending * 0.6)),
    pending,
  ];

  const progressTrend = [
    Math.max(0, Math.round(percentage * 0.2)),
    Math.max(0, Math.round(percentage * 0.5)),
    Math.max(0, Math.round(percentage * 0.8)),
    percentage,
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-1 select-none font-sans">
      {/* CARD 1: TOTAL PEMOHON */}
      <div className="bg-white rounded-md p-4 border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between">
        <div className="flex flex-col min-w-0 mb-3 font-sans">
          <h3 className="text-sm font-bold text-slate-800 leading-tight">Total Pemohon</h3>
          <p className="text-[11px] font-normal text-slate-500 truncate">Total berkas permohonan dipantau</p>
        </div>

        <div className="flex items-end justify-between gap-2 mt-1">
          <div className="flex flex-col gap-1 font-sans">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
              {total.toLocaleString("id-ID")}
            </span>
            <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 font-sans">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% <span className="text-slate-400 font-normal">total</span></span>
            </div>
          </div>

          <div className="shrink-0 pb-0.5">
            <SparklineBarChart data={totalTrend} color="#3b82f6" />
          </div>
        </div>
      </div>

      {/* CARD 2: SELESAI */}
      <div className="bg-white rounded-md p-4 border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between">
        <div className="flex flex-col min-w-0 mb-3 font-sans">
          <h3 className="text-sm font-bold text-slate-800 leading-tight">Selesai</h3>
          <p className="text-[11px] font-normal text-slate-500 truncate">Berkas selesai dikerjakan</p>
        </div>

        <div className="flex items-end justify-between gap-2 mt-1">
          <div className="flex flex-col gap-1 font-sans">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
              {completed.toLocaleString("id-ID")}
            </span>
            <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 font-sans">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>{completedPct} <span className="text-slate-400 font-normal">dari total</span></span>
            </div>
          </div>

          <div className="shrink-0 pb-0.5">
            <SparklineAreaChart data={completedTrend} color="#10b981" id="monitor-selesai" />
          </div>
        </div>
      </div>

      {/* CARD 3: BELUM SELESAI */}
      <div className="bg-white rounded-md p-4 border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between">
        <div className="flex flex-col min-w-0 mb-3 font-sans">
          <h3 className="text-sm font-bold text-slate-800 leading-tight">Belum Selesai</h3>
          <p className="text-[11px] font-normal text-slate-500 truncate">Berkas dalam proses pemantauan</p>
        </div>

        <div className="flex items-end justify-between gap-2 mt-1">
          <div className="flex flex-col gap-1 font-sans">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
              {pending.toLocaleString("id-ID")}
            </span>
            <div className="flex items-center gap-1 text-[11px] font-medium text-amber-600 font-sans">
              <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
              <span>{pendingPct} <span className="text-slate-400 font-normal">dari total</span></span>
            </div>
          </div>

          <div className="shrink-0 pb-0.5">
            <SparklineAreaChart data={pendingTrend} color="#f59e0b" id="monitor-belum-selesai" />
          </div>
        </div>
      </div>

      {/* CARD 4: PROGRES */}
      <div className="bg-white rounded-md p-4 border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between">
        <div className="flex flex-col min-w-0 mb-3 font-sans">
          <h3 className="text-sm font-bold text-slate-800 leading-tight">Progres</h3>
          <p className="text-[11px] font-normal text-slate-500 truncate">Tingkat penyelesaian seluruh berkas</p>
        </div>

        <div className="flex items-end justify-between gap-2 mt-1">
          <div className="flex flex-col gap-1 font-sans">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
              {percentage}%
            </span>
            <div className="flex items-center gap-1 text-[11px] font-medium text-sky-600 font-sans">
              <TrendingUp className="w-3.5 h-3.5 text-sky-600" />
              <span>{completed}/{total} <span className="text-slate-400 font-normal">berkas</span></span>
            </div>
          </div>

          <div className="shrink-0 pb-0.5">
            <SparklineAreaChart data={progressTrend} color="#0284c7" id="monitor-progres" />
          </div>
        </div>
      </div>
    </div>
  );
});

MonitorKPIStrip.displayName = "MonitorKPIStrip";
