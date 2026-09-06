"use client";

import React, { useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { ApplicationStatisticMetrics } from './useApplicationStatistics';

export interface DataEntryKpiStripProps {
  metrics: ApplicationStatisticMetrics;
  displayMode?: 'permohonan' | 'pemohon';
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
          <linearGradient id={`gradient-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Gradient fill beneath curve */}
        <path d={areaD} fill={`url(#gradient-${id})`} />

        {/* Curve Line */}
        <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points */}
        {points.map((pt, idx) => (
          <circle
            key={idx}
            cx={pt.x}
            cy={pt.y}
            r={hoveredIdx === idx ? 4 : 2}
            fill={hoveredIdx === idx ? '#ffffff' : color}
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

export const DataEntryKpiStrip: React.FC<DataEntryKpiStripProps> = React.memo(({
  metrics,
  displayMode
}) => {
  const totalSubtitle = displayMode === "pemohon" ? "Jumlah seluruh pemohon" : "Jumlah seluruh permohonan";
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-2 select-none font-sans">

      {/* ==================== CARD 1: TOTAL AKTIF ==================== */}
      <div className="bg-white rounded-md p-4 border border-slate-100/90 shadow-2xs flex flex-col justify-between">
        {/* Top Section: Title & Subtitle */}
        <div className="flex flex-col min-w-0 mb-3">
          <h3 className="text-sm font-bold text-slate-800 leading-tight">Total</h3>
          <p className="text-[11px] font-normal text-slate-500 truncate">
            {totalSubtitle}
          </p>
        </div>

        {/* Bottom Section: Big Metric Number + Growth + Dynamic Sparkline */}
        <div className="flex items-end justify-between gap-2 mt-1">
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
              {metrics.totalActive.toLocaleString('id-ID')}
            </span>
            <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+{Math.max(1, Math.abs(metrics.totalGrowthPct))}% <span className="text-slate-400 font-normal">periode</span></span>
            </div>
          </div>

          <div className="shrink-0 pb-0.5">
            <SparklineBarChart data={metrics.totalTrend} color="#3b82f6" />
          </div>
        </div>
      </div>

      {/* ==================== CARD 2: DIPROSES ==================== */}
      <div className="bg-white rounded-md p-4 border border-slate-100/90 shadow-2xs flex flex-col justify-between">
        {/* Top Section: Title & Subtitle */}
        <div className="flex flex-col min-w-0 mb-3">
          <h3 className="text-sm font-bold text-slate-800 leading-tight">Diproses</h3>
          <p className="text-[11px] font-normal text-slate-500 truncate">Sedang dalam proses verifikasi</p>
        </div>

        {/* Bottom Section: Big Metric Number + Growth + Dynamic Sparkline */}
        <div className="flex items-end justify-between gap-2 mt-1">
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
              {metrics.processing.toLocaleString('id-ID')}
            </span>
            <div className="flex items-center gap-1 text-[11px] font-medium text-amber-700">
              <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
              <span>{metrics.processingPct} <span className="text-slate-400 font-normal">dari total</span></span>
            </div>
          </div>

          <div className="shrink-0 pb-0.5">
            <SparklineAreaChart data={metrics.processingTrend} color="#f59e0b" id="diproses" />
          </div>
        </div>
      </div>

      {/* ==================== CARD 3: SELESAI ==================== */}
      <div className="bg-white rounded-md p-4 border border-slate-100/90 shadow-2xs flex flex-col justify-between">
        {/* Top Section: Title & Subtitle */}
        <div className="flex flex-col min-w-0 mb-3">
          <h3 className="text-sm font-bold text-slate-800 leading-tight">Selesai</h3>
          <p className="text-[11px] font-normal text-slate-500 truncate">Telah diproses dan disetujui</p>
        </div>

        {/* Bottom Section: Big Metric Number + Growth + Dynamic Sparkline */}
        <div className="flex items-end justify-between gap-2 mt-1">
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
              {metrics.completed.toLocaleString('id-ID')}
            </span>
            <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-700">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>{metrics.completedPct} <span className="text-slate-400 font-normal">dari total</span></span>
            </div>
          </div>

          <div className="shrink-0 pb-0.5">
            <SparklineAreaChart data={metrics.completedTrend} color="#10b981" id="selesai" />
          </div>
        </div>
      </div>

      {/* ==================== CARD 4: REVISI ==================== */}
      <div className="bg-white rounded-md p-4 border border-slate-100/90 shadow-2xs flex flex-col justify-between">
        {/* Top Section: Title & Subtitle */}
        <div className="flex flex-col min-w-0 mb-3">
          <h3 className="text-sm font-bold text-slate-800 leading-tight">Revisi</h3>
          <p className="text-[11px] font-normal text-slate-500 truncate">Perlu perbaikan data</p>
        </div>

        {/* Bottom Section: Big Metric Number + Growth + Dynamic Sparkline */}
        <div className="flex items-end justify-between gap-2 mt-1">
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
              {metrics.revision.toLocaleString('id-ID')}
            </span>
            <div className="flex items-center gap-1 text-[11px] font-medium text-rose-700">
              <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
              <span>{metrics.revisionPct} <span className="text-slate-400 font-normal">dari total</span></span>
            </div>
          </div>

          <div className="shrink-0 pb-0.5">
            <SparklineBarChart data={metrics.revisionTrend} color="#f43f5e" />
          </div>
        </div>
      </div>

    </div>
  );
});

DataEntryKpiStrip.displayName = 'DataEntryKpiStrip';
