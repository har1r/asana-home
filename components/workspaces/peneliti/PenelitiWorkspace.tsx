"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef, useDeferredValue } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Boxes, FileText, Lock, Printer,
  ArrowRight, FolderMinus, Plus, Search, AlertCircle,
  CheckCircle, Clock, X, AlertTriangle, Star,
  FileSpreadsheet, Filter, Check, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  User, Hash, ListFilter, RefreshCw, Copy,
  Folder, FolderLock, Unlock, Send, Slash, FolderOpen, Users
} from 'lucide-react';
import {
  getSubmittedPermohonan,
  mintaRevisi,
  createBundle,
  getBundles,
  addPermohonanToBundle,
  removePermohonanFromBundle,
  lockBundle,
  getPendingKoreksiForPermohonan,
  resetEmptyBundleType
} from '@/app/actions/peneliti';
import { togglePermohonanFavorite } from '@/app/actions/penginput';
import { useDashboard } from '@/context/DashboardContext';
import { DetailsModal } from '@/components/workspaces/shared/DetailsModal';
import { ActionStatusModal } from '@/components/workspaces/shared/ActionStatusModal';
import { SkeletonBox, SkeletonText, SkeletonBadge, SkeletonProgressBar } from '@/components/skeletons/SkeletonBase';
import { formatNop, toTitleCase } from '@/components/workspaces/shared/constants';
import { EmptyDataAnimation } from '@/components/workspaces/shared/EmptyDataAnimation';

/** Skeleton komponen dasar KPI Strip & Tabs untuk PenelitiWorkspace */
function PenelitiBaseHeaderSkeleton() {
  return (
    <>
      {/* TIER 1: KPI STATS STRIP (5 Cards) */}
      <div className="bg-white border border-slate-200/90 rounded-md p-1.5 shadow-3xs select-none">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-3 px-3.5 flex items-center justify-between gap-2 rounded-md">
              <div className="flex flex-col gap-1.5 w-full">
                <SkeletonBox width="w-20" height="h-3" rounded="rounded-sm" />
                <SkeletonBox width="w-12" height="h-5" rounded="rounded-sm" />
              </div>
              <SkeletonBox width="w-8" height="h-4" rounded="rounded-sm" />
            </div>
          ))}
        </div>
      </div>

      {/* TIER 2: VIEW MODE SWITCHER TABS (3 Equal Tabs) */}
      <div className="bg-slate-100/90 border border-slate-200/80 p-1 rounded-md grid grid-cols-3 gap-1 shadow-3xs select-none">
        <SkeletonBox width="w-full" height="h-8" rounded="rounded-md" />
        <SkeletonBox width="w-full" height="h-8" rounded="rounded-md" />
        <SkeletonBox width="w-full" height="h-8" rounded="rounded-md" />
      </div>
    </>
  );
}

/** Skeleton presisi untuk Tab 1: Pilih / Buat Bundle */
export function PenelitiBundleSkeleton() {
  return (
    <div className="w-full font-sans select-none flex flex-col gap-4 animate-fadeIn">
      <PenelitiBaseHeaderSkeleton />

      {/* CARD CONTENT: BUNDLE GRID VIEW */}
      <div className="bg-white border border-slate-200/90 rounded-md p-5 sm:p-6 shadow-3xs flex flex-col gap-6 min-h-[300px]">
        {/* Action toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <SkeletonBox width="w-full md:w-[403px]" height="h-10" rounded="rounded-lg" />
          <div className="flex items-center gap-2">
            <SkeletonBox width="w-24" height="h-10" rounded="rounded-lg" />
            <SkeletonBox width="w-10" height="h-10" rounded="rounded-lg" />
          </div>
        </div>

        {/* Jenis Layanan filter pills */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <SkeletonBox key={i} width={i === 0 ? "w-16" : "w-32"} height="h-7" rounded="rounded-full" />
          ))}
        </div>

        {/* Grid of bundle cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="p-4 rounded-2xl border border-slate-200/90 bg-white flex flex-col justify-between gap-3.5 min-h-[110px]">
              <div className="flex items-center justify-between gap-3">
                <SkeletonBox width="w-28" height="h-3.5" rounded="rounded-sm" />
                <SkeletonBox width="w-6" height="h-5" rounded="rounded-full" />
              </div>
              <div className="flex items-center justify-between gap-2.5 pt-2.5 border-t border-slate-100">
                <SkeletonBox width="w-16" height="h-4" rounded="rounded-md" />
                <SkeletonBox width="w-16" height="h-4" rounded="rounded-full" />
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Footer */}
        <div className="px-5 py-3.5 border border-slate-200/80 bg-slate-50 flex items-center justify-between mt-auto rounded-xl">
          <SkeletonText width="w-36" height="h-3" />
          <SkeletonBox width="w-32" height="h-7" rounded="rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/** Skeleton presisi untuk Tab 2: Isi Antrean Permohonan */
export function PenelitiListSkeleton() {
  return (
    <div className="w-full font-sans select-none flex flex-col gap-4 animate-fadeIn">
      <PenelitiBaseHeaderSkeleton />

      {/* CARD CONTENT: LIST TABLE VIEW */}
      <div className="bg-white border border-slate-200/90 rounded-md shadow-3xs flex flex-col overflow-hidden min-h-[400px]">
        {/* Action Toolbar */}
        <div className="p-3 border-b border-slate-200/80 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-3xs">
          <SkeletonBox width="w-full md:w-[403px]" height="h-10" rounded="rounded-lg" />
          <div className="flex items-center gap-2">
            <SkeletonBox width="w-24" height="h-10" rounded="rounded-lg" />
            <SkeletonBox width="w-28" height="h-10" rounded="rounded-lg" />
            <SkeletonBox width="w-10" height="h-10" rounded="rounded-lg" />
          </div>
        </div>

        {/* Jenis Layanan Filter Pills */}
        <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-2 overflow-x-auto bg-white">
          {Array.from({ length: 7 }).map((_, i) => (
            <SkeletonBox key={i} width={i === 0 ? "w-16" : "w-32"} height="h-7" rounded="rounded-full" />
          ))}
        </div>

        {/* Table Canvas */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200">
                <th className="py-3 px-4 w-12"><SkeletonText width="w-5" height="h-2.5" /></th>
                <th className="py-3 px-2 text-center w-10"><SkeletonText width="w-4" height="h-2.5" /></th>
                <th className="py-3 px-4 min-w-[100px]"><SkeletonText width="w-16" height="h-2.5" /></th>
                <th className="py-3 px-4 min-w-[100px]"><SkeletonText width="w-16" height="h-2.5" /></th>
                <th className="py-3 px-4 min-w-[150px]"><SkeletonText width="w-20" height="h-2.5" /></th>
                <th className="py-3 px-4 min-w-[210px]"><SkeletonText width="w-28" height="h-2.5" /></th>
                <th className="py-3 px-4 min-w-[170px]"><SkeletonText width="w-20" height="h-2.5" /></th>
                <th className="py-3 px-4 min-w-[120px]"><SkeletonText width="w-20" height="h-2.5" /></th>
                <th className="py-3 px-4 text-center min-w-[100px]"><SkeletonText width="w-12" height="h-2.5" /></th>
                <th className="py-3 px-4 text-center w-28"><SkeletonText width="w-10" height="h-2.5" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Array.from({ length: 7 }).map((_, i) => (
                <tr key={i}>
                  <td className="py-3 px-4 text-center"><SkeletonText width="w-4" height="h-3" /></td>
                  <td className="py-3 px-2 text-center"><SkeletonBox width="w-4" height="h-4" rounded="rounded-full" /></td>
                  <td className="py-3 px-4"><SkeletonText width="w-20" height="h-3" /></td>
                  <td className="py-3 px-4"><SkeletonText width="w-20" height="h-3" /></td>
                  <td className="py-3 px-4"><SkeletonText width="w-28" height="h-3" /></td>
                  <td className="py-3 px-4"><SkeletonText width="w-36" height="h-3" /></td>
                  <td className="py-3 px-4"><SkeletonText width={i % 2 === 0 ? "w-28" : "w-32"} height="h-3" /></td>
                  <td className="py-3 px-4"><SkeletonBadge width="w-20" /></td>
                  <td className="py-3 px-4 text-center"><SkeletonBadge width="w-16" /></td>
                  <td className="py-3 px-4 text-center"><SkeletonBox width="w-20" height="h-8" rounded="rounded-lg" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-5 py-3 border-t border-slate-200/90 bg-slate-50 flex items-center justify-between mt-auto">
          <SkeletonText width="w-36" height="h-3" />
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonBox key={i} width="w-7" height="h-7" rounded="rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Skeleton presisi untuk Tab 3: Kunci & Cetak Berkas */
export function PenelitiPrintSkeleton() {
  return (
    <div className="w-full font-sans select-none flex flex-col gap-4 animate-fadeIn">
      <PenelitiBaseHeaderSkeleton />

      {/* CARD CONTENT: PRINT TABLE VIEW */}
      <div className="bg-white border border-slate-200/90 rounded-md shadow-3xs flex flex-col overflow-hidden min-h-[400px]">
        {/* Top Control Bar */}
        <div className="p-4 border-b border-slate-200/80 bg-slate-50 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <SkeletonBox width="w-64" height="h-10" rounded="rounded-lg" />
          <div className="flex items-center gap-2">
            <SkeletonBox width="w-28" height="h-9" rounded="rounded-lg" />
            <SkeletonBox width="w-40" height="h-9" rounded="rounded-lg" />
          </div>
        </div>

        {/* Table Canvas */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200">
                <th className="py-3 px-4 w-12"><SkeletonText width="w-5" height="h-2.5" /></th>
                <th className="py-3 px-2 text-center w-10"><SkeletonText width="w-4" height="h-2.5" /></th>
                <th className="py-3 px-4 min-w-[100px]"><SkeletonText width="w-16" height="h-2.5" /></th>
                <th className="py-3 px-4 min-w-[100px]"><SkeletonText width="w-16" height="h-2.5" /></th>
                <th className="py-3 px-4 min-w-[150px]"><SkeletonText width="w-20" height="h-2.5" /></th>
                <th className="py-3 px-4 min-w-[210px]"><SkeletonText width="w-28" height="h-2.5" /></th>
                <th className="py-3 px-4 min-w-[170px]"><SkeletonText width="w-20" height="h-2.5" /></th>
                <th className="py-3 px-4 min-w-[120px]"><SkeletonText width="w-20" height="h-2.5" /></th>
                <th className="py-3 px-4 text-center min-w-[100px]"><SkeletonText width="w-12" height="h-2.5" /></th>
                <th className="py-3 px-4 text-center w-24"><SkeletonText width="w-10" height="h-2.5" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Array.from({ length: 7 }).map((_, i) => (
                <tr key={i}>
                  <td className="py-3 px-4 text-center"><SkeletonText width="w-4" height="h-3" /></td>
                  <td className="py-3 px-2 text-center"><SkeletonBox width="w-4" height="h-4" rounded="rounded-full" /></td>
                  <td className="py-3 px-4"><SkeletonText width="w-20" height="h-3" /></td>
                  <td className="py-3 px-4"><SkeletonText width="w-20" height="h-3" /></td>
                  <td className="py-3 px-4"><SkeletonText width="w-28" height="h-3" /></td>
                  <td className="py-3 px-4"><SkeletonText width="w-36" height="h-3" /></td>
                  <td className="py-3 px-4"><SkeletonText width={i % 2 === 0 ? "w-28" : "w-32"} height="h-3" /></td>
                  <td className="py-3 px-4"><SkeletonBadge width="w-20" /></td>
                  <td className="py-3 px-4 text-center"><SkeletonBadge width="w-16" /></td>
                  <td className="py-3 px-4 text-center"><SkeletonBox width="w-8" height="h-8" rounded="rounded-lg" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-5 py-3 border-t border-slate-200/90 bg-slate-50 flex items-center justify-between mt-auto">
          <SkeletonText width="w-36" height="h-3" />
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonBox key={i} width="w-7" height="h-7" rounded="rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const getInitials = (name?: string | null): string => {
  if (!name) return 'P';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

const getAbbreviatedJenis = (jenis: string) => {
  switch (jenis) {
    case 'OBJEK_PAJAK_BARU':
      return 'OPB';
    case 'MUTASI_SEBAGIAN':
      return 'MS';
    case 'MUTASI_HABIS_REGULER':
      return 'MHR';
    case 'MUTASI_HABIS_UPDATE':
      return 'MHU';
    case 'PEMBETULAN':
      return 'PBT';
    case 'PENGAKTIFAN':
      return 'AKT';
    default:
      return jenis;
  }
};

const BUNDLE_TYPE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  MUTASI_SEBAGIAN: { bg: 'bg-indigo-50/80', text: 'text-indigo-700', border: 'border-indigo-150/80' },
  MUTASI_HABIS_UPDATE: { bg: 'bg-emerald-50/80', text: 'text-emerald-700', border: 'border-emerald-150/80' },
  MUTASI_HABIS_REGULER: { bg: 'bg-pink-50/80', text: 'text-pink-750', border: 'border-pink-150/80' },
  OBJEK_PAJAK_BARU: { bg: 'bg-amber-50/80', text: 'text-amber-700', border: 'border-amber-150/80' },
  PEMBETULAN: { bg: 'bg-purple-50/80', text: 'text-purple-700', border: 'border-purple-150/80' },
  PENGAKTIFAN: { bg: 'bg-sky-50/80', text: 'text-sky-700', border: 'border-sky-150/80' },
};

const BUNDLE_STATUS_CONFIG: Record<string, { bg: string; text: string; border: string; dot: string; shadow: string }> = {
  DRAFT: {
    bg: 'bg-emerald-50/70',
    text: 'text-[#008f78]',
    border: 'border-emerald-200',
    dot: 'bg-[#00a389]',
    shadow: 'hover:shadow-emerald-150/40'
  },
  LOCKED: {
    bg: 'bg-slate-900',
    text: 'text-slate-100',
    border: 'border-slate-800',
    dot: 'bg-amber-400',
    shadow: 'hover:shadow-slate-300/20'
  },
  IN_MANIFEST: {
    bg: 'bg-emerald-50/80',
    text: 'text-emerald-800',
    border: 'border-emerald-150',
    dot: 'bg-emerald-500',
    shadow: 'hover:shadow-emerald-150/40'
  },
  VOID: {
    bg: 'bg-rose-50/70',
    text: 'text-rose-700',
    border: 'border-rose-100',
    dot: 'bg-rose-500',
    shadow: 'hover:shadow-rose-150/40'
  },
};

interface FishingAnimationProps {
  isSearch?: boolean;
}

const FishingAnimation: React.FC<FishingAnimationProps> = React.memo(({ isSearch }) => {
  return (
    <div className="relative w-56 h-36 flex items-center justify-center overflow-hidden select-none mb-1">
      <svg viewBox="0 0 200 120" className="w-full h-full">
        <defs>
          <style>{`
            @keyframes rodBob {
              0%, 100% { transform: rotate(0deg); }
              50% { transform: rotate(-2.5deg); }
            }
            @keyframes lineDangle {
              0%, 100% { transform: skewX(0deg); }
              50% { transform: skewX(-2deg); }
            }
            @keyframes rippleEffect {
              0% { r: 1px; opacity: 0.8; stroke-width: 0.75px; }
              100% { r: 18px; opacity: 0; stroke-width: 0.25px; }
            }
            @keyframes fishJump {
              0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
              5% { opacity: 1; }
              25% { transform: translate(15px, -20px) rotate(30deg); }
              35% { transform: translate(22px, -20px) rotate(70deg); }
              55% { transform: translate(40px, 0px) rotate(130deg); opacity: 1; }
              65%, 100% { transform: translate(40px, 8px) rotate(160deg); opacity: 0; }
            }
            @keyframes cloudMove {
              0% { transform: translateX(-8px); }
              100% { transform: translateX(8px); }
            }
            .rod-rod {
              transform-origin: 45px 75px;
              animation: rodBob 4.5s ease-in-out infinite;
            }
            .line-string {
              transform-origin: 125px 35px;
              animation: lineDangle 4.5s ease-in-out infinite;
            }
            .ripple-circle-1 {
              animation: rippleEffect 3.2s linear infinite;
            }
            .ripple-circle-2 {
              animation: rippleEffect 3.2s linear infinite;
              animation-delay: 1.6s;
            }
            .fish-jumping {
              transform-origin: 125px 95px;
              animation: fishJump 6.5s ease-in-out infinite;
            }
            .cloud-bg-1 {
              animation: cloudMove 15s ease-in-out infinite alternate;
            }
            .cloud-bg-2 {
              animation: cloudMove 20s ease-in-out infinite alternate;
            }
          `}</style>
        </defs>

        {/* Sky Background & Clouds */}
        <g className="cloud-bg-1" opacity="0.3">
          <path d="M25 20c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5c.8-.2 1.6.3 1.8 1.1.2.8-.3 1.6-1.1 1.8H20c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5" fill="#94a3b8" />
        </g>
        <g className="cloud-bg-2" opacity="0.25">
          <path d="M145 15c0-1.8 1.5-3.3 3.3-3.3s3.3 1.5 3.3 3.3c.6-.2 1.2.2 1.4.8.2.6-.2 1.2-.8 1.4H140c-.6 0-1.1-.5-1.1-1.1s.5-1.1 1.1-1.1" fill="#94a3b8" />
        </g>

        {/* Water */}
        <path d="M0 95h200v25H0z" fill="#f1f5f9" />
        <path d="M0 95c30-1.5 60 1.5 90 0s60-1.5 90 0 20 1.5 20 1.5v4H0z" fill="#cbd5e1" opacity="0.4" />

        {/* Wooden Pier */}
        <rect x="0" y="80" width="55" height="5" rx="1" fill="#854d0e" />
        <rect x="8" y="85" width="7" height="35" fill="#713f12" />
        <rect x="40" y="85" width="7" height="35" fill="#713f12" />

        {/* Sitting Fisherman */}
        <circle cx="35" cy="55" r="4.5" fill="#475569" />
        {/* Hat */}
        <path d="M26 53c3-3 15-3 18 0z" fill="#7c2d12" />
        <path d="M21 53h28v1.5H21z" fill="#a16207" />
        {/* Torso & Arms */}
        <path d="M30 59.5h10l2 18.5H28z" fill="#64748b" />
        {/* Pants */}
        <path d="M28 78h12l-1 7H29z" fill="#334155" />
        {/* Legs dangling over pier */}
        <rect x="31" y="85" width="2.5" height="11" rx="0.5" fill="#475569" />
        <rect x="36" y="85" width="2.5" height="9" rx="0.5" fill="#475569" />

        {/* Fishing Rod and Line Group */}
        <g className="rod-rod">
          {/* Wooden rod stick */}
          <line x1="38" y1="64" x2="125" y2="35" stroke="#a16207" strokeWidth="1.5" strokeLinecap="round" />
          {/* Thread line */}
          <line className="line-string" x1="125" y1="35" x2="125" y2="95" stroke="#cbd5e1" strokeWidth="0.75" />
        </g>

        {/* Water Ripple Circles */}
        <ellipse className="ripple-circle-1" cx="125" cy="95" rx="12" ry="2.5" fill="none" stroke="#6366f1" />
        <ellipse className="ripple-circle-2" cx="125" cy="95" rx="12" ry="2.5" fill="none" stroke="#6366f1" />

        {/* Jumping Fish */}
        {!isSearch && (
          <g className="fish-jumping">
            <path d="M125 95c2.5-0.8 5-2.5 5-4.2s-2.5-3.3-5-4.2c-1.7 0.8-2.5 2.5-2.5 4.2s0.8 3.3 2.5 4.2z" fill="#f59e0b" />
            <path d="M122.5 90.8l-2.5-1.7v3.3z" fill="#f59e0b" />
            <circle cx="128.5" cy="92" r="0.4" fill="#fff" />
          </g>
        )}
      </svg>
      {/* Search overlay indicator */}
      {isSearch && (
        <div className="absolute right-6 bottom-9 bg-white border border-slate-200 p-1.5 rounded-xl shadow-md animate-bounce flex items-center justify-center">
          <Search className="w-4 h-4 text-indigo-650" />
        </div>
      )}
    </div>
  );
});

FishingAnimation.displayName = 'FishingAnimation';

const highlightText = (text: string, search: string) => {
  if (!search.trim()) return <span>{text}</span>;
  const escapedSearch = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(`(${escapedSearch})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-amber-100 text-amber-900 rounded-[2px] px-0.5 py-0.25 font-bold">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
};

const cleanPecahanSuffix = (name: string) => {
  if (!name) return '';
  return name.replace(/\s*\([^)]*pecahan[^)]*\)/gi, '').trim();
};

const isOverdue = (dateStr: string | null | undefined, status: string): boolean => {
  if (!dateStr) return false;
  if (status === 'COMPLETED' || status === 'REJECTED' || status === 'ARCHIVED') return false;
  return new Date(dateStr) < new Date();
};

const STATUS_LABEL_MAP: Record<string, string> = {
  SUBMITTED: 'Diajukan',
  REVISION: 'Revisi',
  BUNDLED: 'Terbundel',
  LOCKED: 'Terkunci',
  IN_MANIFEST: 'Dimanifest',
  ARCHIVED: 'Diarsipkan',
  COMPLETED: 'Selesai',
  REJECTED: 'Ditolak',
  DRAFT: 'Draf',
  VOID: 'Dibatalkan',
  SENT: 'Dikirim',
};

const getStatusLabel = (status: string) => STATUS_LABEL_MAP[status] || status;

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'SUBMITTED':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200/50';
    case 'REVISION':
      return 'bg-amber-100 text-amber-800 border-amber-200/50 animate-pulse';
    case 'BUNDLED':
      return 'bg-blue-100 text-blue-800 border-blue-200/50';
    case 'LOCKED':
      return 'bg-slate-800 text-slate-100 border-slate-700';
    case 'IN_MANIFEST':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200/50';
    case 'DRAFT':
      return 'bg-amber-100 text-amber-800 border-amber-200/50';
    case 'VOID':
      return 'bg-rose-100 text-rose-800 border-rose-200/50';
    case 'ARCHIVED':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200/50';
    case 'COMPLETED':
      return 'bg-cyan-100 text-cyan-800 border-cyan-200/50';
    case 'REJECTED':
      return 'bg-rose-100 text-rose-800 border-rose-200/50';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200/50';
  }
};

const getShortBundleNum = (bundleNum: string) => {
  const parts = bundleNum.split('/');
  if (parts.length >= 2) {
    return parts[1];
  }
  return bundleNum;
};

export default function PenelitiWorkspace() {
  const { showConfirm } = useDashboard();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read URL query parameter ?tab=peneliti&view=bundle|queue|print
  const viewParam = searchParams.get('view');

  // View mode state ('bundle' | 'list' | 'print') initialized from URL param
  const [viewMode, setViewMode] = useState<'bundle' | 'list' | 'print'>(() => {
    if (viewParam === 'queue' || viewParam === 'list') return 'list';
    if (viewParam === 'print') return 'print';
    return 'bundle';
  });

  // Sync viewMode when URL query params change (e.g. Browser Back/Forward buttons)
  useEffect(() => {
    if (viewParam === 'queue' || viewParam === 'list') {
      setViewMode('list');
    } else if (viewParam === 'print') {
      setViewMode('print');
    } else {
      setViewMode('bundle');
    }
  }, [viewParam]);

  // Helper to switch view/step and update URL query param
  const handleSwitchStep = useCallback((mode: 'bundle' | 'list' | 'print') => {
    setViewMode(mode);
    const viewQuery = mode === 'list' ? 'queue' : mode;
    router.push(`/?tab=peneliti&view=${viewQuery}`, { scroll: false });
  }, [router]);

  // Lists
  const [submittedList, setSubmittedList] = useState<any[]>([]);
  const [bundlesList, setBundlesList] = useState<any[]>([]);
  const [selectedBundle, setSelectedBundle] = useState<any | null>(null);

  // Loaders & Message States
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search & Pagination States for Submitted Queue
  const searchSubmittedInputRef = useRef<HTMLInputElement>(null);
  const [searchSubmittedQuery, setSearchSubmittedQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [filterJenisLayanan, setFilterJenisLayanan] = useState<string>('ALL');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'last_modified' | 'newest' | 'oldest' | 'a_z'>('last_modified');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [currentSubmittedPage, setCurrentSubmittedPage] = useState(1);
  const [itemsPerSubmittedPage, setItemsPerSubmittedPage] = useState(10);

  // Pagination States for Print Bundle Details Table
  const [currentPrintPage, setCurrentPrintPage] = useState(1);
  const [itemsPerPrintPage, setItemsPerPrintPage] = useState(10);

  // Copy to Clipboard
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const handleCopy = useCallback((e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 1000);
  }, []);

  // Selected Request details modal
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);

  // Modals / Dialogs
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [revisionTarget, setRevisionTarget] = useState<any | null>(null);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [extractionTarget, setExtractionTarget] = useState<any | null>(null);
  const [extractionNotes, setExtractionNotes] = useState('');

  // Local verification checks for frozen state
  const [pendingKoreksiMap, setPendingKoreksiMap] = useState<Record<string, boolean>>({});

  // Star Favorite Toggle
  const handleToggleFavorite = useCallback(async (id: string) => {
    let originalList: any[] = [];
    setSubmittedList(prev => {
      originalList = [...prev];
      return prev.map(item => {
        if (item.id === id) {
          return { ...item, isFavorite: !item.isFavorite };
        }
        return item;
      });
    });

    try {
      const res = await togglePermohonanFavorite(id);
      if (!res.success) {
        setSubmittedList(originalList); // Revert
      }
    } catch (err) {
      setSubmittedList(originalList); // Revert
    }
  }, []);

  // Keyboard shortcut: Ctrl+K or '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      const isTyping = tag === 'input' || tag === 'textarea' || tag === 'select' || (e.target as HTMLElement).isContentEditable;
      if ((e.ctrlKey && e.key === 'k') || (e.key === '/' && !isTyping)) {
        e.preventDefault();
        searchSubmittedInputRef.current?.focus();
        searchSubmittedInputRef.current?.select();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Reset pagination when search or filters change
  useEffect(() => {
    setCurrentSubmittedPage(1);
  }, [searchSubmittedQuery, filterJenisLayanan, itemsPerSubmittedPage]);

  // Search, Filter & Pagination States for Bundles Queue
  const [searchBundleQuery, setSearchBundleQuery] = useState('');
  const deferredSearchBundleQuery = useDeferredValue(searchBundleQuery);
  const [isBundleSearchFocused, setIsBundleSearchFocused] = useState(false);
  const [currentBundlePage, setCurrentBundlePage] = useState(1);
  const [itemsPerBundlePage, setItemsPerBundlePage] = useState(8);
  const [filterBundleStatus, setFilterBundleStatus] = useState<string>('ALL');
  const [filterBundleJenisLayanan, setFilterBundleJenisLayanan] = useState<string>('ALL');
  const [isBundleFilterDropdownOpen, setIsBundleFilterDropdownOpen] = useState(false);

  // Status Modal State
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusModalStatus, setStatusModalStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusModalTitle, setStatusModalTitle] = useState('');
  const [statusModalMessage, setStatusModalMessage] = useState('');

  // Reset pagination when search bundle, status filter, jenis filter, or items per page changes
  useEffect(() => {
    setCurrentBundlePage(1);
  }, [searchBundleQuery, filterBundleStatus, filterBundleJenisLayanan, itemsPerBundlePage]);

  // Reset pagination when selected bundle or items per page for print changes
  useEffect(() => {
    setCurrentPrintPage(1);
  }, [selectedBundle?.id, itemsPerPrintPage]);

  // Bundle status counts memoization
  const bundleStatusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: bundlesList.length,
      DRAFT: 0,
      LOCKED: 0,
      IN_MANIFEST: 0,
      VOID: 0
    };
    bundlesList.forEach(b => {
      if (counts[b.status] !== undefined) {
        counts[b.status]++;
      }
    });
    return counts;
  }, [bundlesList]);

  // Bundle jenis permohonan counts memoization
  const bundleJenisCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: bundlesList.length,
      MUTASI_SEBAGIAN: 0,
      MUTASI_HABIS_UPDATE: 0,
      MUTASI_HABIS_REGULER: 0,
      OBJEK_PAJAK_BARU: 0,
      PEMBETULAN: 0,
      PENGAKTIFAN: 0
    };
    bundlesList.forEach(b => {
      if (b.jenisPermohonan && counts[b.jenisPermohonan] !== undefined) {
        counts[b.jenisPermohonan]++;
      }
    });
    return counts;
  }, [bundlesList]);

  // Filter Bundles Client-side (Memoized & Deferred)
  const filteredBundlesList = useMemo(() => {
    const q = deferredSearchBundleQuery.toLowerCase().trim();
    return bundlesList.filter((b) => {
      const matchesSearch = !q || b.nomorBundle.toLowerCase().includes(q) ||
        (b.jenisPermohonan && b.jenisPermohonan.toLowerCase().includes(q));
      const matchesStatus = filterBundleStatus === 'ALL' || b.status === filterBundleStatus;
      const matchesJenis = filterBundleJenisLayanan === 'ALL' || b.jenisPermohonan === filterBundleJenisLayanan;
      return matchesSearch && matchesStatus && matchesJenis;
    });
  }, [bundlesList, deferredSearchBundleQuery, filterBundleStatus, filterBundleJenisLayanan]);

  // Pagination computed variables for Bundles
  const totalBundlePages = Math.ceil(filteredBundlesList.length / itemsPerBundlePage);
  const activeBundlePage = currentBundlePage > totalBundlePages ? 1 : currentBundlePage;
  const paginatedBundlesList = useMemo(() => {
    return filteredBundlesList.slice(
      (activeBundlePage - 1) * itemsPerBundlePage,
      activeBundlePage * itemsPerBundlePage
    );
  }, [filteredBundlesList, activeBundlePage, itemsPerBundlePage]);

  // Fetch initial data
  const fetchData = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setListLoading(true);
    }
    setError('');
    try {
      const subRes = await getSubmittedPermohonan();
      const bndRes = await getBundles();

      if (subRes.success) setSubmittedList(subRes.list || []);
      if (bndRes.success) {
        setBundlesList(bndRes.list || []);

        // Re-sync currently selected bundle if any
        if (selectedBundle) {
          const updatedSelected = bndRes.list?.find(b => b.id === selectedBundle.id);
          setSelectedBundle(updatedSelected || null);
        }
      }
    } catch (err) {
      setError('Gagal memuat data dari server.');
    } finally {
      setListLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Check pending koreksi (frozen) for each application in selected bundle
  useEffect(() => {
    const permohonanList = selectedBundle?.permohonan || [];
    if (permohonanList.length === 0) return;

    const checkKoreksiStatus = async () => {
      const map: Record<string, boolean> = {};
      for (const p of permohonanList) {
        const res = await getPendingKoreksiForPermohonan(p.id);
        if (res.success && res.request) {
          map[p.id] = true;
        }
      }
      setPendingKoreksiMap(map);
    };

    checkKoreksiStatus();
  }, [selectedBundle]);  // Create Bundle Action
  const handleCreateBundle = async () => {
    setStatusModalTitle('Membuat Bundle');
    setStatusModalMessage('Sedang membuat bundle operasional baru...');
    setStatusModalStatus('loading');
    setStatusModalOpen(true);
    setLoading(true);
    try {
      const res: any = await createBundle();
      if (res.success) {
        setStatusModalTitle('Bundle Dibuat');
        setStatusModalMessage(`Bundle Baru ${res.bundle?.nomorBundle} Berhasil Dibuat!`);
        setStatusModalStatus('success');
        await fetchData();
        if (res.bundle) {
          setSelectedBundle({ ...res.bundle, permohonan: [] });
        }
      } else {
        setStatusModalTitle('Gagal Membuat Bundle');
        setStatusModalMessage(res.error || 'Gagal membuat bundle.');
        setStatusModalStatus('error');
      }
    } catch (e: any) {
      setStatusModalTitle('Terjadi Kesalahan');
      setStatusModalMessage(e.message || 'Kesalahan sistem.');
      setStatusModalStatus('error');
    } finally {
      setLoading(false);
    }
  };

  // Add Permohonan to Bundle
  const handleAddToBundle = async (permohonanId: string) => {
    if (!selectedBundle) {
      setError('Silakan pilih atau buat bundle draf terlebih dahulu di panel kanan.');
      return;
    }
    if (selectedBundle.status !== 'DRAFT') {
      setError('Permohonan hanya dapat dimasukkan ke bundle yang berstatus DRAFT.');
      return;
    }

    setStatusModalTitle('Memasukkan Berkas');
    setStatusModalMessage('Sedang menambahkan berkas permohonan ke dalam bundle...');
    setStatusModalStatus('loading');
    setStatusModalOpen(true);
    setLoading(true);

    try {
      const res: any = await addPermohonanToBundle(selectedBundle.id, permohonanId);
      if (res.success) {
        setStatusModalTitle('Berkas Ditambahkan');
        setStatusModalMessage('Permohonan berhasil ditambahkan ke dalam bundle!');
        setStatusModalStatus('success');
        await fetchData();
      } else {
        setStatusModalTitle('Gagal Menambahkan');
        setStatusModalMessage(res.error || 'Gagal menambahkan permohonan.');
        setStatusModalStatus('error');
      }
    } catch (e: any) {
      setStatusModalTitle('Terjadi Kesalahan');
      setStatusModalMessage(e.message || 'Kesalahan sistem.');
      setStatusModalStatus('error');
    } finally {
      setLoading(false);
    }
  };

  // Remove Permohonan from Bundle (Draft or Locked)
  const handleRemoveFromBundle = async (targetOverride?: any) => {
    // Ensure target is a valid permohonan object with a string .id, not a React SyntheticEvent
    const target = (targetOverride && typeof targetOverride === 'object' && typeof targetOverride.id === 'string' && !('nativeEvent' in targetOverride))
      ? targetOverride
      : extractionTarget;

    if (!selectedBundle || !target || !target.id) return;

    setStatusModalTitle('Mengeluarkan Berkas');
    setStatusModalMessage('Sedang mengeluarkan berkas dari bundle...');
    setStatusModalStatus('loading');
    setStatusModalOpen(true);
    setLoading(true);

    try {
      const res: any = await removePermohonanFromBundle(
        selectedBundle.id,
        target.id,
        extractionNotes
      );

      if (res.success) {
        if (res.status === 'REMOVED_IMMEDIATELY') {
          setStatusModalTitle('Berhasil Dikeluarkan');
          setStatusModalMessage('Permohonan berhasil dikeluarkan dari bundle draf!');
          setStatusModalStatus('success');
        } else if (res.status === 'PENDING_APPROVAL') {
          setStatusModalTitle('Koreksi Diajukan');
          setStatusModalMessage('Pengajuan koreksi berhasil dikirim! Menunggu keputusan persetujuan dari Supervisor.');
          setStatusModalStatus('success');
        }
        setExtractionTarget(null);
        setExtractionNotes('');
        await fetchData();
      } else {
        setStatusModalTitle('Gagal Mengeluarkan');
        setStatusModalMessage(res.error || 'Gagal mengeluarkan permohonan.');
        setStatusModalStatus('error');
      }
    } catch (e: any) {
      setStatusModalTitle('Terjadi Kesalahan');
      setStatusModalMessage(e.message || 'Kesalahan sistem.');
      setStatusModalStatus('error');
    } finally {
      setLoading(false);
    }
  };

  // Minta Revisi Action
  const handleMintaRevisi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionTarget || !revisionNotes.trim()) return;

    setStatusModalTitle('Mengirim Permintaan Revisi');
    setStatusModalMessage('Sedang mengalihkan status permohonan ke revisi...');
    setStatusModalStatus('loading');
    setStatusModalOpen(true);
    setLoading(true);

    try {
      const res: any = await mintaRevisi(revisionTarget.id, revisionNotes);
      if (res.success) {
        setStatusModalTitle('Permintaan Revisi Dikirim');
        setStatusModalMessage(`Status permohonan ${revisionTarget.nomorPermohonan} berhasil dialihkan ke REVISION. Catatan pengembalian revisi telah dikirimkan ke Penginput.`);
        setStatusModalStatus('success');
        setRevisionTarget(null);
        setRevisionNotes('');
        await fetchData();
      } else {
        setStatusModalTitle('Gagal Mengirim Revisi');
        setStatusModalMessage(res.error || 'Gagal memproses permintaan revisi.');
        setStatusModalStatus('error');
      }
    } catch (e: any) {
      setStatusModalTitle('Terjadi Kesalahan');
      setStatusModalMessage(e.message || 'Kesalahan sistem.');
      setStatusModalStatus('error');
    } finally {
      setLoading(false);
    }
  };

  // Lock Bundle Action
  const handleLockBundle = () => {
    if (!selectedBundle) return;
    showConfirm({
      title: 'Konfirmasi Kunci Bundle',
      message: `Apakah Anda yakin ingin MENGUNCI bundle ${selectedBundle.nomorBundle}? Setelah dikunci, data di dalamnya tidak dapat diubah tanpa persetujuan Supervisor.`,
      onConfirm: async () => {
        setStatusModalTitle('Mengunci Bundle');
        setStatusModalMessage('Sedang mengunci bundle dan meneruskannya ke pengarsip...');
        setStatusModalStatus('loading');
        setStatusModalOpen(true);
        setLoading(true);

        try {
          const res: any = await lockBundle(selectedBundle.id);
          if (res.success) {
            setStatusModalTitle('Bundle Terkunci');
            setStatusModalMessage(`Bundle ${selectedBundle.nomorBundle} berhasil dikunci dan dialirkan ke Pengarsip!`);
            setStatusModalStatus('success');
            await fetchData();
          } else {
            setStatusModalTitle('Gagal Mengunci');
            setStatusModalMessage(res.error || 'Gagal mengunci bundle.');
            setStatusModalStatus('error');
          }
        } catch (e: any) {
          setStatusModalTitle('Terjadi Kesalahan');
          setStatusModalMessage(e.message || 'Kesalahan sistem.');
          setStatusModalStatus('error');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Reset Empty Bundle Type Action
  const handleResetBundleType = async (bundleId: string) => {
    if (!bundleId) return;
    setStatusModalTitle('Mereset Jenis Bundle');
    setStatusModalMessage('Sedang mereset jenis layanan bundle draf...');
    setStatusModalStatus('loading');
    setStatusModalOpen(true);
    setLoading(true);
    try {
      const res = (await resetEmptyBundleType(bundleId)) as any;
      if (res.success) {
        setStatusModalTitle('Reset Berhasil');
        setStatusModalMessage(res.message || 'Jenis layanan bundle draf berhasil direset.');
        setStatusModalStatus('success');
        await fetchData();
      } else {
        setStatusModalTitle('Reset Gagal');
        setStatusModalMessage(res.error || 'Gagal mereset jenis bundle.');
        setStatusModalStatus('error');
      }
    } catch (e: any) {
      setStatusModalTitle('Terjadi Kesalahan');
      setStatusModalMessage(e.message || 'Kesalahan sistem.');
      setStatusModalStatus('error');
    } finally {
      setLoading(false);
    }
  };

  // Display Mode Switcher State ('berkas' | 'pemohon')
  const [displayMode, setDisplayMode] = useState<'berkas' | 'pemohon'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('architax_table_display_mode');
      if (saved === 'berkas' || saved === 'pemohon') return saved;
    }
    return 'berkas';
  });

  const handleSwitchDisplayMode = (mode: 'berkas' | 'pemohon') => {
    setDisplayMode(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('architax_table_display_mode', mode);
    }
  };

  // Submitted mode base list for accurate counting across displayModes
  const submittedModeBaseList = useMemo(() => {
    if (displayMode === 'berkas') return submittedList;

    return submittedList.flatMap((item) => {
      if (item.jenisPermohonan === 'MUTASI_SEBAGIAN' && item.dataBaru && item.dataBaru.length > 0) {
        return item.dataBaru.map((db: any) => ({
          ...item,
          displayNamaWajibPajak: cleanPecahanSuffix(db.namaPemilikBaru || item.namaWajibPajak),
          isPecahanRow: true,
        }));
      }
      return [item];
    });
  }, [submittedList, displayMode]);

  // Submitted queue jenis permohonan counts memoization
  const submittedJenisCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: submittedModeBaseList.length,
      MUTASI_SEBAGIAN: 0,
      MUTASI_HABIS_UPDATE: 0,
      MUTASI_HABIS_REGULER: 0,
      OBJEK_PAJAK_BARU: 0,
      PEMBETULAN: 0,
      PENGAKTIFAN: 0
    };
    submittedModeBaseList.forEach(i => {
      if (i.jenisPermohonan && counts[i.jenisPermohonan] !== undefined) {
        counts[i.jenisPermohonan]++;
      }
    });
    return counts;
  }, [submittedModeBaseList]);

  const deferredSearchSubmittedQuery = useDeferredValue(searchSubmittedQuery);

  // Filter & Sort Submitted Queue Client-side (Memoized & Deferred)
  const filteredSubmittedList = useMemo(() => {
    const q = deferredSearchSubmittedQuery.toLowerCase().trim();
    const list = submittedList.filter((item) => {
      const matchesSearch =
        !q ||
        item.namaWajibPajak.toLowerCase().includes(q) ||
        item.nop.includes(q) ||
        (item.nomorPelayanan && item.nomorPelayanan.toLowerCase().includes(q)) ||
        (item.dataBaru && item.dataBaru.some((db: any) => db.namaPemilikBaru?.toLowerCase().includes(q)));

      const matchesJenis = filterJenisLayanan === 'ALL' || item.jenisPermohonan === filterJenisLayanan;

      return matchesSearch && matchesJenis;
    });

    return list.sort((a, b) => {
      if (sortBy === 'a_z') {
        const nameA = (a.displayNamaWajibPajak || a.namaWajibPajak || '').toLowerCase();
        const nameB = (b.displayNamaWajibPajak || b.namaWajibPajak || '').toLowerCase();
        return nameA.localeCompare(nameB);
      }
      if (sortBy === 'newest') {
        const dateA = new Date(a.tanggalNoPelayanan || a.tanggalPermohonan || a.createdAt || 0).getTime();
        const dateB = new Date(b.tanggalNoPelayanan || b.tanggalPermohonan || b.createdAt || 0).getTime();
        return dateB - dateA;
      }
      if (sortBy === 'oldest') {
        const dateA = new Date(a.tanggalNoPelayanan || a.tanggalPermohonan || a.createdAt || 0).getTime();
        const dateB = new Date(b.tanggalNoPelayanan || b.tanggalPermohonan || b.createdAt || 0).getTime();
        return dateA - dateB;
      }
      // 'last_modified' default
      const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  }, [submittedList, deferredSearchSubmittedQuery, filterJenisLayanan, sortBy]);

  // Expandable rows state for Mode Nopel inline expansion
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const toggleRowExpanded = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Transform submitted list according to displayMode ('berkas' vs 'pemohon')
  const displaySubmittedList = useMemo(() => {
    if (displayMode === 'berkas') {
      return filteredSubmittedList.flatMap(item => {
        const baseRow = {
          ...item,
          uniqueRowKey: item.id,
          displayNamaWajibPajak: cleanPecahanSuffix(item.namaWajibPajak),
          displayLuasTanahBaru: item.luasTanahBaru,
          displayLuasBangunanBaru: item.luasBangunanBaru,
          isPecahanRow: false,
          hasPecahan: item.jenisPermohonan === 'MUTASI_SEBAGIAN' && item.dataBaru && item.dataBaru.length > 0,
        };

        if (expandedRows[item.id] && item.jenisPermohonan === 'MUTASI_SEBAGIAN' && item.dataBaru && item.dataBaru.length > 0) {
          const subRows = item.dataBaru.map((db: any, subIdx: number) => ({
            ...item,
            uniqueRowKey: `${item.id}_pecahan_${subIdx}`,
            displayNamaWajibPajak: cleanPecahanSuffix(db.namaPemilikBaru || item.namaWajibPajak),
            displayLuasTanahBaru: db.luasTanahBaru ?? item.luasTanahBaru,
            displayLuasBangunanBaru: db.luasBangunanBaru ?? item.luasBangunanBaru,
            displaySertifikatBaru: db.sertifikatBaru ?? item.sertifikatBaru,
            pecahanIndex: subIdx + 1,
            totalPecahan: item.dataBaru.length,
            isPecahanRow: true,
          }));
          return [baseRow, ...subRows];
        }

        return [baseRow];
      });
    }

    // Mode 'pemohon': Automatically expand/open ALL fraction rows for MUTASI_SEBAGIAN permohonan items!
    return filteredSubmittedList.flatMap((item) => {
      if (item.jenisPermohonan === 'MUTASI_SEBAGIAN' && item.dataBaru && item.dataBaru.length > 0) {
        return item.dataBaru.map((db: any, subIdx: number) => ({
          ...item,
          uniqueRowKey: `${item.id}_pecahan_${subIdx}`,
          displayNamaWajibPajak: cleanPecahanSuffix(db.namaPemilikBaru || item.namaWajibPajak),
          displayLuasTanahBaru: db.luasTanahBaru ?? item.luasTanahBaru,
          displayLuasBangunanBaru: db.luasBangunanBaru ?? item.luasBangunanBaru,
          displaySertifikatBaru: db.sertifikatBaru ?? item.sertifikatBaru,
          pecahanIndex: subIdx + 1,
          totalPecahan: item.dataBaru.length,
          isPecahanRow: true,
        }));
      }

      return [{
        ...item,
        uniqueRowKey: item.id,
        displayNamaWajibPajak: cleanPecahanSuffix(item.namaWajibPajak),
        displayLuasTanahBaru: item.luasTanahBaru,
        displayLuasBangunanBaru: item.luasBangunanBaru,
        isPecahanRow: false,
      }];
    });
  }, [filteredSubmittedList, displayMode, expandedRows]);

  // Pagination computed variables
  const totalSubmittedPages = Math.ceil(displaySubmittedList.length / itemsPerSubmittedPage);
  const activeSubmittedPage = currentSubmittedPage > totalSubmittedPages ? 1 : currentSubmittedPage;
  const paginatedSubmittedList = displaySubmittedList.slice(
    (activeSubmittedPage - 1) * itemsPerSubmittedPage,
    activeSubmittedPage * itemsPerSubmittedPage
  );

  // Transform selected bundle permohonan list according to displayMode ('berkas' vs 'pemohon')
  const displayPrintList = useMemo(() => {
    const rawList = selectedBundle?.permohonan || [];
    if (displayMode === 'berkas') {
      return rawList.flatMap((item: any) => {
        const baseRow = {
          ...item,
          uniqueRowKey: item.id,
          displayNamaWajibPajak: cleanPecahanSuffix(item.namaWajibPajak),
          isPecahanRow: false,
          hasPecahan: item.jenisPermohonan === 'MUTASI_SEBAGIAN' && item.dataBaru && item.dataBaru.length > 0,
        };

        if (expandedRows[`print_${item.id}`] && item.jenisPermohonan === 'MUTASI_SEBAGIAN' && item.dataBaru && item.dataBaru.length > 0) {
          const subRows = item.dataBaru.map((db: any, subIdx: number) => ({
            ...item,
            uniqueRowKey: `${item.id}_pecahan_${subIdx}`,
            displayNamaWajibPajak: cleanPecahanSuffix(db.namaPemilikBaru || item.namaWajibPajak),
            pecahanIndex: subIdx + 1,
            totalPecahan: item.dataBaru.length,
            isPecahanRow: true,
          }));
          return [baseRow, ...subRows];
        }

        return [baseRow];
      });
    }

    // Mode 'pemohon': Automatically expand/open ALL fraction rows for MUTASI_SEBAGIAN permohonan items!
    return rawList.flatMap((item: any) => {
      if (item.jenisPermohonan === 'MUTASI_SEBAGIAN' && item.dataBaru && item.dataBaru.length > 0) {
        return item.dataBaru.map((db: any, subIdx: number) => ({
          ...item,
          uniqueRowKey: `${item.id}_pecahan_${subIdx}`,
          displayNamaWajibPajak: cleanPecahanSuffix(db.namaPemilikBaru || item.namaWajibPajak),
          pecahanIndex: subIdx + 1,
          totalPecahan: item.dataBaru.length,
          isPecahanRow: true,
        }));
      }

      return [{
        ...item,
        uniqueRowKey: item.id,
        displayNamaWajibPajak: cleanPecahanSuffix(item.namaWajibPajak),
        isPecahanRow: false,
      }];
    });
  }, [selectedBundle?.permohonan, displayMode, expandedRows]);

  const currentActiveCount = useMemo(() => {
    if (viewMode === 'bundle') return filteredBundlesList.length;
    if (viewMode === 'list') return filteredSubmittedList.length;
    return selectedBundle?.permohonan?.length || 0;
  }, [viewMode, filteredBundlesList.length, filteredSubmittedList.length, selectedBundle?.permohonan?.length]);

  return (
    <div id="peneliti-board-root" className="w-full font-sans select-none animate-fadeIn flex flex-col gap-6">

      {/* Show precision skeleton based on active viewMode tab when loading */}
      {listLoading && viewMode === 'bundle' && <PenelitiBundleSkeleton />}
      {listLoading && viewMode === 'list' && <PenelitiListSkeleton />}
      {listLoading && viewMode === 'print' && <PenelitiPrintSkeleton />}

      {/* Hide real content while skeleton is visible */}
      <div className={`flex flex-col gap-4 ${listLoading ? 'hidden' : ''}`}>

        {/* TIER 1: UNIFIED KPI STATS STRIP (Focus Permanently on Bundle Status) */}
        <div className="bg-white border border-slate-200/90 rounded-md p-1.5 shadow-3xs select-none">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            {/* Metric 1: Total Bundle */}
            <div
              onClick={() => { setFilterBundleStatus('ALL'); setCurrentBundlePage(1); handleSwitchStep('bundle'); }}
              className={`p-2.5 px-3 flex items-center justify-between transition-all cursor-pointer rounded-md ${filterBundleStatus === 'ALL' ? 'bg-slate-100/90 text-slate-900 font-semibold' : 'hover:bg-slate-50 text-slate-600'
                }`}
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px] font-normal text-slate-600 capitalize font-sans">Total Bundle</span>
                <span className="text-lg font-bold font-mono text-slate-800">{bundlesList.length}</span>
              </div>
              <span className={`text-[11px] font-semibold font-mono px-1.5 py-0.5 rounded border transition-all ${filterBundleStatus === 'ALL' ? 'bg-[#00a389] text-white border-[#00a389]' : 'bg-slate-100 text-slate-500 border-slate-200/80'
                }`}>
                100%
              </span>
            </div>

            {/* Metric 2: Draf */}
            <div
              onClick={() => { setFilterBundleStatus('DRAFT'); setCurrentBundlePage(1); handleSwitchStep('bundle'); }}
              className={`p-2.5 px-3 flex items-center justify-between transition-all cursor-pointer rounded-md ${filterBundleStatus === 'DRAFT' ? 'bg-slate-100/90 text-slate-900 font-semibold' : 'hover:bg-slate-50 text-slate-600'
                }`}
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px] font-normal text-slate-600 capitalize font-sans">Draf (Aktif)</span>
                <span className="text-lg font-bold font-mono text-slate-800">{bundleStatusCounts.DRAFT}</span>
              </div>
              <span className={`text-[11px] font-semibold font-mono px-1.5 py-0.5 rounded border transition-all ${filterBundleStatus === 'DRAFT' ? 'bg-[#00a389] text-white border-[#00a389]' : 'bg-slate-100 text-slate-500 border-slate-200/80'
                }`}>
                {bundlesList.length > 0 ? `${((bundleStatusCounts.DRAFT / bundlesList.length) * 100).toFixed(0)}%` : '0%'}
              </span>
            </div>

            {/* Metric 3: Terkunci */}
            <div
              onClick={() => { setFilterBundleStatus('LOCKED'); setCurrentBundlePage(1); handleSwitchStep('bundle'); }}
              className={`p-2.5 px-3 flex items-center justify-between transition-all cursor-pointer rounded-md ${filterBundleStatus === 'LOCKED' ? 'bg-slate-100/90 text-slate-900 font-semibold' : 'hover:bg-slate-50 text-slate-600'
                }`}
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px] font-normal text-slate-600 capitalize font-sans">Terkunci</span>
                <span className="text-lg font-bold font-mono text-slate-800">{bundleStatusCounts.LOCKED}</span>
              </div>
              <span className={`text-[11px] font-semibold font-mono px-1.5 py-0.5 rounded border transition-all ${filterBundleStatus === 'LOCKED' ? 'bg-[#00a389] text-white border-[#00a389]' : 'bg-slate-100 text-slate-500 border-slate-200/80'
                }`}>
                {bundlesList.length > 0 ? `${((bundleStatusCounts.LOCKED / bundlesList.length) * 100).toFixed(0)}%` : '0%'}
              </span>
            </div>

            {/* Metric 4: Dimanifest */}
            <div
              onClick={() => { setFilterBundleStatus('IN_MANIFEST'); setCurrentBundlePage(1); handleSwitchStep('bundle'); }}
              className={`p-2.5 px-3 flex items-center justify-between transition-all cursor-pointer rounded-md ${filterBundleStatus === 'IN_MANIFEST' ? 'bg-slate-100/90 text-slate-900 font-semibold' : 'hover:bg-slate-50 text-slate-600'
                }`}
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px] font-normal text-slate-600 capitalize font-sans">Dimanifest</span>
                <span className="text-lg font-bold font-mono text-slate-800">{bundleStatusCounts.IN_MANIFEST}</span>
              </div>
              <span className={`text-[11px] font-semibold font-mono px-1.5 py-0.5 rounded border transition-all ${filterBundleStatus === 'IN_MANIFEST' ? 'bg-[#00a389] text-white border-[#00a389]' : 'bg-slate-100 text-slate-500 border-slate-200/80'
                }`}>
                {bundlesList.length > 0 ? `${((bundleStatusCounts.IN_MANIFEST / bundlesList.length) * 100).toFixed(0)}%` : '0%'}
              </span>
            </div>

            {/* Metric 5: Dibatalkan / Void */}
            <div
              onClick={() => { setFilterBundleStatus('VOID'); setCurrentBundlePage(1); handleSwitchStep('bundle'); }}
              className={`p-2.5 px-3 flex items-center justify-between transition-all cursor-pointer rounded-md ${filterBundleStatus === 'VOID' ? 'bg-slate-100/90 text-slate-900 font-semibold' : 'hover:bg-slate-50 text-slate-600'
                }`}
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px] font-normal text-slate-600 capitalize font-sans">Dibatalkan</span>
                <span className="text-lg font-bold font-mono text-slate-800">{bundleStatusCounts.VOID}</span>
              </div>
              <span className={`text-[11px] font-semibold font-mono px-1.5 py-0.5 rounded border transition-all ${filterBundleStatus === 'VOID' ? 'bg-[#00a389] text-white border-[#00a389]' : 'bg-slate-100 text-slate-500 border-slate-200/80'
                }`}>
                {bundlesList.length > 0 ? `${((bundleStatusCounts.VOID / bundlesList.length) * 100).toFixed(0)}%` : '0%'}
              </span>
            </div>
          </div>
        </div>

        {/* Clean View Mode Switcher Tabs (Equal Width Layout, without count badges) */}
        <div className="bg-slate-100/90 border border-slate-200/80 p-1 rounded-md grid grid-cols-3 gap-1 shadow-3xs select-none font-sans">
          <button
            type="button"
            onClick={() => handleSwitchStep('bundle')}
            className={`py-2 px-3 rounded-md text-[13px] font-normal text-center transition-all cursor-pointer font-sans ${viewMode === 'bundle'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
          >
            Pilih Bundle
          </button>
          <button
            type="button"
            onClick={() => handleSwitchStep('list')}
            className={`py-2 px-3 rounded-md text-[13px] font-normal text-center transition-all cursor-pointer font-sans ${viewMode === 'list'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
          >
            Isi Bundle
          </button>
          <button
            type="button"
            onClick={() => handleSwitchStep('print')}
            className={`py-2 px-3 rounded-md text-[13px] font-normal text-center transition-all cursor-pointer font-sans ${viewMode === 'print'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
          >
            Kunci & Cetak
          </button>
        </div>

        {error && (
          <div className="bg-red-50/80 border border-red-200 text-red-700 text-xs font-bold rounded-md px-4 py-3 flex items-start gap-2 animate-fadeIn shrink-0 shadow-3xs">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-emerald-50/80 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-md px-4 py-3 flex items-start gap-2 animate-fadeIn shrink-0 shadow-3xs">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* ==================== VIEW MODE: LIST (Daftar Permohonan / Isi Antrean) ==================== */}
        {viewMode === 'list' && (
          <div className="flex flex-col gap-4">
            {/* TIER 2: UNIFIED COMMAND BAR & QUICK FILTER CHIPS */}
            <div className="flex flex-col gap-2.5 bg-slate-50/90 border border-slate-200/80 p-3 rounded-md shadow-3xs mb-1 select-none">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Left Side: Search Bar */}
                <div className="relative w-full md:w-96">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
                  <input
                    ref={searchSubmittedInputRef}
                    type="text"
                    value={searchSubmittedQuery}
                    onChange={(e) => setSearchSubmittedQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className="w-full h-10 pl-9 pr-9 bg-white border border-slate-200/90 rounded-md text-[13px] font-normal text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 transition-all shadow-3xs font-sans"
                    placeholder="Cari No. Pelayanan, NOP, Nama Pemohon..."
                  />
                  {searchSubmittedQuery ? (
                    <button
                      onClick={() => setSearchSubmittedQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 z-10 p-0.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Hapus Pencarian"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 pointer-events-none">
                      <kbd className="px-1.5 py-0.5 text-[9px] font-extrabold text-slate-400 bg-slate-100 border border-slate-200 rounded font-sans">
                        {'/'}
                      </kbd>
                    </div>
                  )}
                </div>

                {/* Right Side: Active Bundle Indicator + Mode Switcher + Refresh Button */}
                <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                  {/* Indicator Active Bundle with Tooltip */}
                  <div className="relative group flex shrink-0">
                    <button
                      type="button"
                      onClick={() => setViewMode('bundle')}
                      className={`h-10 px-3 rounded-md border transition-all cursor-pointer shadow-3xs flex items-center gap-1.5 text-[13px] font-normal relative font-sans ${selectedBundle
                        ? 'bg-emerald-50 border-emerald-200 text-[#008f78] hover:bg-emerald-100'
                        : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                        }`}
                    >
                      <span className="font-mono font-black">{selectedBundle ? getShortBundleNum(selectedBundle.nomorBundle) : '—'}</span>
                    </button>

                    {/* Popover Tooltip (Keterangan Bundle) */}
                    <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-3.5 hidden group-hover:flex flex-col gap-2 z-50 pointer-events-none select-none animate-fadeIn font-sans">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-1.5">
                        <div className={`w-2 h-2 rounded-full ${selectedBundle ? 'bg-[#00a389] animate-pulse' : 'bg-amber-500 animate-pulse'}`} />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">
                          Bundle Kerja Aktif
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-bold text-slate-800">
                          {selectedBundle ? selectedBundle.nomorBundle : 'Belum Ada Bundle Aktif'}
                        </span>
                        <p className="text-[10px] font-semibold text-slate-400 leading-relaxed">
                          {selectedBundle
                            ? selectedBundle.status === 'DRAFT'
                              ? 'Siap menerima berkas. Klik tombol "+ Bundle" pada kolom Aksi tabel.'
                              : `Status bundle ${getStatusLabel(selectedBundle.status)} (tidak dapat menambah berkas).`
                            : 'Pilih atau buat bundle baru terlebih dahulu di tab Pilih Bundle.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Tombol Refresh Manual */}
                  <button
                    onClick={() => fetchData(true)}
                    disabled={isRefreshing || listLoading}
                    className="h-10 w-10 rounded-md border border-slate-200/90 bg-white hover:bg-slate-100 text-slate-500 transition-all cursor-pointer disabled:opacity-40 shadow-3xs flex items-center justify-center shrink-0"
                    title="Refresh Data"
                  >
                    <RefreshCw className={`w-4 h-4 transition-all duration-300 ${isRefreshing ? 'animate-spin text-[#00a389]' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Quick Filter Chips (Pilih Jenis Layanan Praktis dengan Angka Count) */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1 border-t border-slate-200/60 select-none">
                {[
                  { val: 'ALL', label: 'Semua' },
                  { val: 'MUTASI_SEBAGIAN', label: 'Mutasi Sebagian' },
                  { val: 'MUTASI_HABIS_UPDATE', label: 'Mutasi Habis (Update)' },
                  { val: 'MUTASI_HABIS_REGULER', label: 'Mutasi Habis (Reguler)' },
                  { val: 'OBJEK_PAJAK_BARU', label: 'OP Baru' },
                  { val: 'PEMBETULAN', label: 'Pembetulan' },
                  { val: 'PENGAKTIFAN', label: 'Pengaktifan' }
                ].map((item) => {
                  const isActive = filterJenisLayanan === item.val;
                  const count = submittedJenisCounts[item.val] ?? 0;
                  return (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => {
                        setFilterJenisLayanan(item.val);
                        setCurrentSubmittedPage(1);
                      }}
                      className={`h-7 px-2.5 rounded-md text-[13px] font-normal transition-all cursor-pointer shrink-0 border flex items-center gap-1.5 font-sans ${isActive
                        ? 'bg-[#00a389] text-white border-[#00a389] shadow-3xs'
                        : 'bg-white text-slate-600 border-slate-200/90 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                    >
                      <span>{item.label}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold font-mono ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* TOOLBAR OUTSIDE TABLE: DROPDOWN URUTKAN (KIRI) & TAB NOPEL/PEMOHON (KANAN) */}
            <div className="flex items-center justify-between mb-1 select-none font-sans">
              {/* Left Side: Urutkan Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="flex items-center gap-1.5 text-[13px] font-normal text-slate-600 transition-colors cursor-pointer py-1 rounded-md"
                  title="Urutkan Data Tabel"
                >
                  <span>Urutkan</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isSortOpen ? 'rotate-180 text-slate-800' : ''}`} />
                </button>

                {isSortOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setIsSortOpen(false)}
                    />
                    <div className="absolute left-0 mt-1 w-52 bg-white rounded-md shadow-md border border-slate-200/90 py-1 z-30 animate-fadeIn font-sans">
                      {[
                        { id: 'last_modified', label: 'Terbaru Diperbarui' },
                        { id: 'newest', label: 'Terbaru (Tgl. Nopel)' },
                        { id: 'oldest', label: 'Terlama (Tgl. Nopel)' },
                        { id: 'a_z', label: 'A - Z (Nama Pemohon)' }
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => {
                            setSortBy(opt.id as any);
                            setIsSortOpen(false);
                          }}
                          className="w-full text-left px-3.5 py-2 text-[13px] transition-colors cursor-pointer flex items-center justify-between font-sans text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-normal"
                        >
                          <span>{opt.label}</span>
                          {sortBy === opt.id && (
                            <Check className="w-3.5 h-3.5 text-[#00a389] shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Right Side: Display Mode Switcher ('Nopel' vs 'Pemohon') */}
              <div className="bg-slate-200/70 p-0.5 rounded-md flex items-center gap-0.5 border border-slate-300/60 text-[13px] font-normal select-none h-8 font-sans">
                <button
                  type="button"
                  onClick={() => handleSwitchDisplayMode('berkas')}
                  className={`h-7 px-3 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${displayMode === 'berkas'
                    ? 'bg-white text-slate-900 shadow-3xs font-normal'
                    : 'text-slate-600 hover:text-slate-900'
                    }`}
                  title="Tampilkan 1 baris per Nomor Pelayanan (NOPEL)"
                >
                  <span>Nopel</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchDisplayMode('pemohon')}
                  className={`h-7 px-3 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${displayMode === 'pemohon'
                    ? 'bg-white text-slate-900 shadow-3xs font-normal'
                    : 'text-slate-600 hover:text-slate-900'
                    }`}
                  title="Tampilkan rincian pecahan pemilik baru (Mutasi Sebagian)"
                >
                  <span>Pemohon</span>
                </button>
              </div>
            </div>

            {/* TIER 3: DATA CANVAS & ENTERPRISE TABLE CARD */}
            <div className="w-full bg-white border border-slate-200/90 rounded-md shadow-xs flex flex-col overflow-hidden min-h-[500px]">

              {/* Table Content */}
              <div className="overflow-x-auto scrollbar-thin flex-1">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/90 text-[13px] font-normal text-slate-600 capitalize text-left border-b border-slate-200/90 select-none font-sans whitespace-nowrap">
                      <th className="py-3 px-4 text-center w-12 min-w-[48px] relative font-normal text-slate-600">
                        <span>No</span>
                        <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                      </th>
                      <th className="py-3 px-2 text-center select-none w-10 min-w-[40px] relative font-normal text-slate-600">
                        <span>⭐</span>
                        <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                      </th>
                      <th className="py-3 px-4 min-w-[110px] relative font-normal text-slate-600">
                        <span>Tgl. Input</span>
                        <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                      </th>
                      <th className="py-3 px-4 min-w-[140px] relative font-normal text-slate-600">
                        <span>Petugas Input</span>
                        <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                      </th>
                      <th className="py-3 px-4 min-w-[100px] relative font-normal text-slate-600">
                        <span>Tgl. Nopel</span>
                        <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                      </th>
                      <th className="py-3 px-4 min-w-[100px] relative font-normal text-slate-600">
                        <span>Tgl. Selesai</span>
                        <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                      </th>
                      <th className="py-3 px-4 min-w-[150px] relative font-normal text-slate-600">
                        <span>No. Pelayanan</span>
                        <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                      </th>
                      <th className="py-3 px-4 min-w-[210px] whitespace-nowrap relative font-normal text-slate-600">
                        <span>Nomor Objek Pajak</span>
                        <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                      </th>
                      <th className="py-3 px-4 min-w-[170px] relative font-normal text-slate-600">
                        <span>Nama Pemohon</span>
                        <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                      </th>
                      <th className="py-3 px-4 min-w-[120px] relative font-normal text-slate-600">
                        <span>Jenis Layanan</span>
                        <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                      </th>
                      <th className="py-3 px-4 text-center min-w-[100px] relative font-normal text-slate-600">
                        <span>Status</span>
                        <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                      </th>
                      <th className="py-3 px-4 text-center w-28 min-w-[110px] font-normal text-slate-600">
                        <span>Aksi</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[12px] font-normal text-slate-600 font-sans bg-white">
                    {filteredSubmittedList.length === 0 ? (
                      <tr>
                        <td colSpan={12} className="py-10 text-center bg-white font-sans select-none">
                          <EmptyDataAnimation
                            title={searchSubmittedQuery || filterJenisLayanan !== 'ALL' ? 'Hasil Pencarian Tidak Ditemukan' : 'Belum Ada Permohonan'}
                            description={searchSubmittedQuery || filterJenisLayanan !== 'ALL' ? 'Kami tidak menemukan data yang cocok dengan kriteria Anda. Silakan atur ulang kata kunci atau filter.' : 'Antrean permohonan masuk kosong. Saat ini tidak ada berkas yang perlu diverifikasi.'}
                          />
                        </td>
                      </tr>
                    ) : (
                      paginatedSubmittedList.map((item, index) => {
                        const itemNumber = (activeSubmittedPage - 1) * itemsPerSubmittedPage + index + 1;
                        const nopolDate = item.tanggalNoPelayanan
                          ? new Date(item.tanggalNoPelayanan).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                          : '—';
                        const penyelesaianDate = item.tanggalPenyelesaian
                          ? new Date(item.tanggalPenyelesaian).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                          : '—';

                        return (
                          <tr
                            key={item.uniqueRowKey || item.id}
                            onClick={() => setSelectedRequest(item)}
                            className={`hover:bg-slate-50/90 transition-colors duration-150 cursor-pointer group text-[12px] font-normal font-sans text-slate-600 h-11 ${item.isPecahanRow ? 'border-l-3 border-l-[#00a389] bg-[#00a389]/5' : ''
                              }`}
                          >
                            <td className="py-2.5 px-4 text-center font-normal text-slate-600 font-sans text-[12px]">{itemNumber}</td>
                            <td className="py-2.5 px-2 text-center" onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFavorite(item.id);
                            }}>
                              <button
                                type="button"
                                className="p-1 hover:scale-125 active:scale-75 transition-all duration-200 text-slate-300 hover:text-amber-500 cursor-pointer"
                                title={item.isFavorite ? "Hapus dari Favorit" : "Tandai Favorit"}
                              >
                                <Star className={`w-4 h-4 transition-all duration-200 ${item.isFavorite
                                  ? 'text-amber-500 fill-amber-500 drop-shadow-[0_0_6px_rgba(245,158,11,0.55)]'
                                  : 'text-slate-300'
                                  }`} />
                              </button>
                            </td>
                            <td className="py-2.5 px-4 text-slate-600 font-sans text-[12px] font-normal whitespace-nowrap capitalize">
                              {item.createdAt ? new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                            </td>
                            <td className="py-2.5 px-4 text-slate-600 text-[12px] font-normal font-sans whitespace-nowrap">
                              <div className="flex items-center gap-1.5 min-w-0" title={item.penginput?.name || "Petugas Input"}>
                                <span className="truncate max-w-[130px] font-sans font-normal">{toTitleCase(item.penginput?.name || "Petugas Input")}</span>
                              </div>
                            </td>
                            <td className="py-2.5 px-4 text-slate-600 font-sans text-[12px] font-normal whitespace-nowrap capitalize">{nopolDate}</td>
                            <td className="py-2.5 px-4 whitespace-nowrap font-sans">
                              {item.tanggalPenyelesaian ? (
                                <div className="flex items-center gap-1">
                                  {isOverdue(item.tanggalPenyelesaian, item.status) && (
                                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                  )}
                                  <span className={`text-[12px] font-sans font-normal capitalize ${isOverdue(item.tanggalPenyelesaian, item.status)
                                    ? 'text-rose-600 font-normal'
                                    : 'text-slate-600'
                                    }`}>
                                    {penyelesaianDate}
                                  </span>
                                </div>
                              ) : "—"}
                            </td>
                            <td className="py-2.5 px-4 min-w-[150px] group/cell relative font-sans">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[12px] font-normal text-slate-600 font-sans tracking-tight capitalize">
                                  {highlightText(item.nomorPelayanan || item.nomorPermohonan, searchSubmittedQuery)}
                                </span>
                                <button
                                  onClick={(e) => handleCopy(e, item.nomorPelayanan || item.nomorPermohonan)}
                                  className="p-1 rounded opacity-0 group-hover/cell:opacity-100 hover:bg-slate-100 text-slate-400 hover:text-[#00a389] transition-all cursor-pointer flex items-center justify-center w-5 h-5 select-none"
                                  title="Salin Nomor"
                                >
                                  {copiedText === (item.nomorPelayanan || item.nomorPermohonan) ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600 transition-all duration-200 transform scale-110" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            </td>
                            <td className="py-2.5 px-4 min-w-[210px] whitespace-nowrap group/cell relative font-sans">
                              <div className="flex items-center gap-1.5 whitespace-nowrap">
                                <span className="text-[12px] font-normal text-slate-600 font-sans whitespace-nowrap capitalize">
                                  {highlightText(formatNop(item.nop), searchSubmittedQuery)}
                                </span>
                                <button
                                  onClick={(e) => handleCopy(e, item.nop)}
                                  className="p-1 rounded opacity-0 group-hover/cell:opacity-100 hover:bg-slate-100 text-slate-400 hover:text-[#00a389] transition-all cursor-pointer flex items-center justify-center w-5 h-5 select-none"
                                  title="Salin NOP"
                                >
                                  {copiedText === item.nop ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600 transition-all duration-200 transform scale-110" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            </td>
                            <td className="py-2.5 px-4 group/cell relative min-w-[170px] font-sans">
                              <div className="flex items-center gap-1.5 whitespace-nowrap">
                                <span className="text-[12px] font-normal text-slate-600 whitespace-nowrap capitalize font-sans">
                                  {highlightText(toTitleCase(item.displayNamaWajibPajak), searchSubmittedQuery)}
                                </span>
                                {item.isPecahanRow && (
                                  <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-1.5 py-0.2 rounded-md shrink-0 font-sans">
                                    #{item.pecahanIndex}/{item.totalPecahan}
                                  </span>
                                )}
                                <button
                                  onClick={(e) => handleCopy(e, item.displayNamaWajibPajak)}
                                  className="p-1 rounded opacity-0 group-hover/cell:opacity-100 hover:bg-slate-100 text-slate-400 hover:text-[#00a389] transition-all cursor-pointer flex items-center justify-center w-5 h-5 select-none"
                                  title="Salin Nama Pemohon"
                                >
                                  {copiedText === item.displayNamaWajibPajak ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600 transition-all duration-200 transform scale-110" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            </td>
                            <td className="py-2.5 px-4 font-sans">
                              <span
                                className="text-[12px] font-normal text-slate-600 bg-slate-100 border border-slate-200/90 px-2 py-0.5 rounded capitalize font-sans"
                                title={item.jenisPermohonan.replace(/_/g, ' ')}
                              >
                                {getAbbreviatedJenis(item.jenisPermohonan)}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-center font-sans">
                              <div className="flex items-center justify-center gap-1">
                                <span className={`px-2.5 py-0.5 text-[12px] font-normal rounded-full border capitalize font-sans ${getStatusBadgeClass(item.status)}`}>
                                  {getStatusLabel(item.status)}
                                </span>
                              </div>
                            </td>
                            <td className="py-2.5 px-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddToBundle(item.id);
                                  }}
                                  disabled={loading || !selectedBundle || selectedBundle.status !== 'DRAFT'}
                                  className="h-8 px-2.5 bg-[#00a389] hover:bg-[#008f78] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[11px] font-extrabold rounded-lg shadow-3xs transition-all cursor-pointer flex items-center gap-1 shrink-0"
                                  title="Masukkan ke bundle aktif"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Bundle</span>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setRevisionTarget(item);
                                  }}
                                  disabled={loading}
                                  className="h-8 w-8 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 rounded-lg transition-all cursor-pointer flex items-center justify-center shrink-0"
                                  title="Kembalikan untuk revisi"
                                >
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer / Pagination */}
              <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 select-none shrink-0">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-semibold text-slate-500 font-sans">
                    {displaySubmittedList.length > 0
                      ? `Menampilkan ${((activeSubmittedPage - 1) * itemsPerSubmittedPage) + 1}–${Math.min(activeSubmittedPage * itemsPerSubmittedPage, displaySubmittedList.length)} dari ${displaySubmittedList.length} ${displayMode === 'pemohon' ? 'entri pemohon' : 'permohonan'}`
                      : 'Tidak ada data'}
                  </span>
                  {/* Items per page */}
                  <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-1.5 py-0.5 shadow-3xs">
                    {[10, 20, 50].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setItemsPerSubmittedPage(n)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${itemsPerSubmittedPage === n
                          ? 'bg-[#00a389] text-white shadow-3xs font-extrabold'
                          : 'text-slate-500 hover:text-slate-700'
                          }`}
                      >
                        {n}
                      </button>
                    ))}
                    <span className="text-[10px] text-slate-400 font-semibold pl-0.5">/hal</span>
                  </div>
                </div>

                {totalSubmittedPages > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setCurrentSubmittedPage(prev => Math.max(prev - 1, 1))}
                      disabled={activeSubmittedPage === 1}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-all cursor-pointer shadow-3xs flex items-center justify-center"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    {Array.from({ length: totalSubmittedPages }, (_, i) => i + 1)
                      .filter(page => page === 1 || page === totalSubmittedPages || Math.abs(page - activeSubmittedPage) <= 1)
                      .reduce((acc: (number | string)[], page, idx, arr) => {
                        if (idx > 0 && (page as number) - (arr[idx - 1] as number) > 1) acc.push('...');
                        acc.push(page);
                        return acc;
                      }, [])
                      .map((page, idx) =>
                        page === '...' ? (
                          <span key={`ellipsis-${idx}`} className="px-1 text-slate-400 text-xs">…</span>
                        ) : (
                          <button
                            key={page}
                            type="button"
                            onClick={() => setCurrentSubmittedPage(page as number)}
                            className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${activeSubmittedPage === page
                              ? 'bg-[#00a389] text-white font-extrabold shadow-3xs scale-105 z-10'
                              : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 shadow-3xs'
                              }`}
                          >
                            {page}
                          </button>
                        )
                      )}
                    <button
                      type="button"
                      onClick={() => setCurrentSubmittedPage(prev => Math.min(prev + 1, totalSubmittedPages))}
                      disabled={activeSubmittedPage === totalSubmittedPages}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-all cursor-pointer shadow-3xs flex items-center justify-center"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================== VIEW MODE: BUNDLE (Buat Bundle) ==================== */}
        {viewMode === 'bundle' && (
          <div className="flex flex-col gap-4 min-h-[300px]">
            {/* TIER 2: UNIFIED COMMAND BAR & QUICK FILTER CHIPS (Matching Isi Bundle style & tight spacing) */}
            <div className="flex flex-col gap-2.5 bg-slate-50/90 border border-slate-200/80 p-3 rounded-md shadow-3xs select-none">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Search input for Bundles (Aligned width & style with Header search) */}
                <div className="relative w-full md:w-[403px] max-w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
                  <input
                    type="text"
                    value={searchBundleQuery}
                    onChange={(e) => setSearchBundleQuery(e.target.value)}
                    onFocus={() => setIsBundleSearchFocused(true)}
                    onBlur={() => setIsBundleSearchFocused(false)}
                    className="w-full h-10 pl-10 pr-14 bg-white hover:bg-slate-50 focus:bg-white border border-slate-200 hover:border-slate-300 focus:border-[#00a389] rounded-lg text-[13px] font-normal text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-3xs font-sans"
                    placeholder="Cari No. Bundle, Jenis Pelayanan."
                  />
                  {!isBundleSearchFocused && !searchBundleQuery && (
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/80 select-none pointer-events-none">
                      Ctrl+K
                    </span>
                  )}
                  {searchBundleQuery && (
                    <button onClick={() => setSearchBundleQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 z-10 p-0.5 rounded-full hover:bg-slate-100 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Right side controls: Buat Button + Refresh Button to its right */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleCreateBundle}
                    disabled={loading}
                    className="px-4 py-2 h-10 bg-[#00a389] hover:bg-[#008f78] active:scale-95 text-white font-normal text-[13px] font-sans rounded-lg shadow-3xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Buat</span>
                  </button>

                  <button
                    onClick={() => fetchData(true)}
                    disabled={isRefreshing || listLoading}
                    className="p-2.5 h-10 w-10 rounded-lg border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-500 shadow-3xs transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center shrink-0"
                    title="Refresh Data"
                  >
                    <RefreshCw className={`w-4 h-4 transition-all duration-300 ${isRefreshing ? 'animate-spin text-[#00a389]' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Filter Jenis Layanan Pills for Bundles (Replacing Status Pills) */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1 border-t border-slate-200/60 shrink-0 select-none font-sans">
                {[
                  { val: 'ALL', label: 'Semua' },
                  { val: 'MUTASI_SEBAGIAN', label: 'Mutasi Sebagian' },
                  { val: 'MUTASI_HABIS_UPDATE', label: 'Mutasi Habis (Update)' },
                  { val: 'MUTASI_HABIS_REGULER', label: 'Mutasi Habis (Reguler)' },
                  { val: 'OBJEK_PAJAK_BARU', label: 'OP Baru' },
                  { val: 'PEMBETULAN', label: 'Pembetulan' },
                  { val: 'PENGAKTIFAN', label: 'Pengaktifan' }
                ].map((item) => {
                  const isActive = filterBundleJenisLayanan === item.val;
                  const count = bundleJenisCounts[item.val] ?? 0;
                  return (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setFilterBundleJenisLayanan(item.val)}
                      className={`h-7 px-2.5 rounded-md text-[13px] font-normal font-sans transition-all shrink-0 flex items-center gap-1.5 cursor-pointer border ${isActive
                        ? 'bg-[#00a389] text-white border-[#00a389] shadow-3xs'
                        : 'bg-white text-slate-600 border-slate-200/90 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                    >
                      <span>{item.label}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold font-mono ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {paginatedBundlesList.map((b) => {
                const isSelected = selectedBundle?.id === b.id;
                const berkasCount = b.permohonan?.length || 0;
                const pemohonCount = (b.permohonan || []).reduce((acc: number, item: any) => {
                  if (item.jenisPermohonan === 'MUTASI_SEBAGIAN' && item.dataBaru && item.dataBaru.length > 0) {
                    return acc + item.dataBaru.length;
                  }
                  return acc + 1;
                }, 0);

                // Get config styling based on status (fallback to DRAFT)
                const statusCfg = BUNDLE_STATUS_CONFIG[b.status] || BUNDLE_STATUS_CONFIG.DRAFT;

                // Get style config for jenisPermohonan
                const typeStyle = b.jenisPermohonan && BUNDLE_TYPE_STYLES[b.jenisPermohonan]
                  ? BUNDLE_TYPE_STYLES[b.jenisPermohonan]
                  : { bg: 'bg-slate-50', text: 'text-slate-400', border: 'border-slate-200/30' };

                // Get appropriate Lucide Folder icon or count
                const renderFolderIconOrCount = () => {
                  const iconClass = `w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110 ${isSelected ? 'text-indigo-650 font-bold' : b.status === 'LOCKED' ? 'text-slate-400' : b.status === 'VOID' ? 'text-rose-500' : 'text-indigo-500'}`;
                  if (pemohonCount > 0) {
                    return (
                      <span className={`w-5 h-5 flex items-center justify-center text-[10px] font-black rounded-full leading-none transition-all duration-300 group-hover:scale-110 ${isSelected
                        ? 'bg-gradient-to-r from-sky-500 to-[#9cb4fe] text-white shadow-sm font-extrabold'
                        : b.status === 'LOCKED'
                          ? 'bg-slate-500 text-slate-50 font-bold'
                          : 'bg-[#9cb4fe] text-white shadow-2xs font-extrabold'
                        }`}>
                        {pemohonCount}
                      </span>
                    );
                  }

                  if (b.status === 'LOCKED') return <FolderLock className={iconClass} />;
                  return <Folder className={iconClass} />;
                };

                // Get appropriate Status icon
                const renderStatusIcon = () => {
                  const iconClass = "w-2.5 h-2.5 shrink-0";
                  if (b.status === 'LOCKED') return <Lock className={iconClass} />;
                  if (b.status === 'IN_MANIFEST') return <Send className={iconClass} />;
                  if (b.status === 'VOID') return <X className={iconClass} />;
                  return <Unlock className={iconClass} />;
                };

                return (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBundle(b)}
                    className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer relative overflow-hidden group select-none min-h-[125px] ${isSelected
                      ? 'bg-gradient-to-br from-[#00a389]/5 via-emerald-50/20 to-white border-[#00a389] shadow-md ring-2 ring-[#00a389]/20'
                      : `bg-white border-slate-200/90 hover:border-slate-350 hover:shadow-md ${statusCfg.shadow}`
                      }`}
                  >
                    {/* Top Row: Number */}
                    <div className="flex items-center justify-between gap-3 w-full">
                      <span className="text-[13px] font-normal text-slate-800 font-mono tracking-tight break-all whitespace-normal block" title={b.nomorBundle}>
                        {b.nomorBundle}
                      </span>
                    </div>

                    {/* Middle Row: Service Type Tag | Status | Count Badge Centered Horizontally */}
                    <div className="flex items-center justify-center gap-2 w-full py-1 flex-wrap sm:flex-nowrap">
                      {/* Service Type Tag */}
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[13px] font-normal border leading-none select-none tracking-wide uppercase font-sans ${typeStyle.bg} ${typeStyle.text} ${typeStyle.border}`} title={b.jenisPermohonan ? b.jenisPermohonan.replace(/_/g, ' ') : 'Umum'}>
                        {b.jenisPermohonan ? getAbbreviatedJenis(b.jenisPermohonan) : '—'}
                      </span>

                      {/* Thin Vertical Line Separator 1 */}
                      <div className="h-3.5 w-px bg-slate-200/90 shrink-0" />

                      {/* Status Pill Badge */}
                      <span className={`px-2 py-0.5 rounded-full text-[13px] font-normal border leading-none capitalize tracking-wider flex items-center gap-1 shadow-3xs transition-all shrink-0 font-sans ${b.status === 'LOCKED'
                        ? 'bg-slate-900 text-slate-100 border-slate-800'
                        : b.status === 'IN_MANIFEST'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : b.status === 'VOID'
                            ? 'bg-rose-50 text-rose-800 border-rose-250'
                            : 'bg-emerald-50 text-[#008f78] border-emerald-200'
                        }`}>
                        {renderStatusIcon()}
                        <span>{getStatusLabel(b.status)}</span>
                      </span>

                      {/* Reset button inside card if empty draft bundle is locked */}
                      {b.status === 'DRAFT' && berkasCount === 0 && b.jenisPermohonan && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResetBundleType(b.id);
                          }}
                          disabled={loading}
                          className="text-[9px] text-amber-600 hover:text-amber-800 hover:underline font-extrabold cursor-pointer shrink-0 animate-fadeIn"
                          title="Reset jenis permohonan bundle yang terkunci"
                        >
                          Reset
                        </button>
                      )}

                      {/* Thin Vertical Line Separator 2 */}
                      <div className="h-3.5 w-px bg-slate-200/90 shrink-0" />

                      {/* Count Badge */}
                      <span className="flex items-center justify-center bg-[#f25c54] text-white text-[13px] font-normal px-2 py-0.5 rounded-md leading-none shrink-0 shadow-3xs font-sans" title={`${berkasCount} Permohonan NOPEL (${pemohonCount} Pemohon)`}>
                        {pemohonCount} Pemohon
                      </span>
                    </div>

                    {/* Bottom Row: Peneliti Profile Initials Avatar & Creation Date */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100/80 text-[13px] text-slate-600 font-normal select-none mt-auto font-sans">
                      {/* Peneliti Avatar Initials & Name */}
                      <div className="flex items-center gap-1.5 min-w-0" title={`Pembuat Bundle: ${b.peneliti?.name || 'Peneliti'}`}>
                        <div className="w-5 h-5 rounded-full bg-[#00a389] text-white flex items-center justify-center text-[10px] font-bold shrink-0 shadow-3xs font-sans">
                          {getInitials(b.peneliti?.name || 'Peneliti')}
                        </div>
                      </div>

                      {/* Creation Date */}
                      <span className="font-mono text-[13px] text-slate-600 font-normal shrink-0">
                        {b.createdAt ? new Date(b.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </span>
                    </div>
                  </div>
                );
              })}
              {filteredBundlesList.length === 0 && (
                <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-slate-200/60 shadow-3xs">
                  <div className="flex flex-col items-center justify-center gap-4 max-w-md mx-auto select-none animate-fadeIn">
                    <FishingAnimation isSearch={!!(searchBundleQuery || filterBundleStatus !== 'ALL')} />
                    <div className="flex flex-col gap-1">
                      <h5 className="text-[11px] font-extrabold text-slate-700 capitalize tracking-wider">
                        {searchBundleQuery || filterBundleStatus !== 'ALL'
                          ? 'Hasil Pencarian Tidak Ditemukan'
                          : 'Belum Ada Bundle'}
                      </h5>
                      <p className="text-[10px] font-semibold text-slate-400 leading-relaxed px-4">
                        {searchBundleQuery || filterBundleStatus !== 'ALL'
                          ? 'Kami tidak menemukan bundle yang cocok dengan kriteria Anda. Silakan atur ulang kata kunci atau filter.'
                          : 'Daftar bundle operasional kosong. Silakan buat bundle baru untuk memulai.'}
                      </p>
                    </div>
                    {(searchBundleQuery || filterBundleStatus !== 'ALL') && (
                      <button
                        onClick={() => {
                          setSearchBundleQuery('');
                          setFilterBundleStatus('ALL');
                        }}
                        className="mt-1 px-4.5 py-2 border border-slate-200/80 hover:bg-slate-50 text-slate-600 font-extrabold text-[10px] rounded-xl transition-all cursor-pointer shadow-3xs"
                      >
                        Reset Pencarian
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Table Footer / Pagination for Bundles */}
            <div className="px-5 py-3.5 border border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto rounded-xl select-none shadow-3xs shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-semibold text-gray-500 font-sans">
                  {filteredBundlesList.length > 0
                    ? `Menampilkan ${((activeBundlePage - 1) * itemsPerBundlePage) + 1}–${Math.min(activeBundlePage * itemsPerBundlePage, filteredBundlesList.length)} dari ${filteredBundlesList.length} bundle`
                    : 'Tidak ada data'}
                </span>
                {/* Items per page */}
                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-1.5 py-0.5">
                  {[8, 16, 32].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setItemsPerBundlePage(n)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${itemsPerBundlePage === n
                        ? 'bg-[#00a389] text-white shadow-3xs font-extrabold'
                        : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                      {n}
                    </button>
                  ))}
                  <span className="text-[10px] text-slate-400 font-semibold pl-0.5">/hal</span>
                </div>
              </div>

              {totalBundlePages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCurrentBundlePage(prev => Math.max(prev - 1, 1))}
                    disabled={activeBundlePage === 1}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-all cursor-pointer shadow-3xs flex items-center justify-center"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  {Array.from({ length: totalBundlePages }, (_, i) => i + 1)
                    .filter(page => page === 1 || page === totalBundlePages || Math.abs(page - activeBundlePage) <= 1)
                    .reduce((acc: (number | string)[], page, idx, arr) => {
                      if (idx > 0 && (page as number) - (arr[idx - 1] as number) > 1) acc.push('...');
                      acc.push(page);
                      return acc;
                    }, [])
                    .map((page, idx) =>
                      page === '...' ? (
                        <span key={`ellipsis-${idx}`} className="px-1 text-slate-400 text-xs">…</span>
                      ) : (
                        <button
                          type="button"
                          key={page}
                          onClick={() => setCurrentBundlePage(page as number)}
                          className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${activeBundlePage === page
                            ? 'bg-[#00a389] text-white font-extrabold shadow-3xs scale-105 z-10'
                            : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 shadow-3xs'
                            }`}
                        >
                          {page}
                        </button>
                      )
                    )}
                  <button
                    type="button"
                    onClick={() => setCurrentBundlePage(prev => Math.min(prev + 1, totalBundlePages))}
                    disabled={activeBundlePage === totalBundlePages}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-all cursor-pointer shadow-3xs flex items-center justify-center"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== VIEW MODE: PRINT (Kunci & Cetak Surat Pengantar) ==================== */}
        {viewMode === 'print' && (
          <div className="flex flex-col gap-2.5">
            {selectedBundle ? (
              <div className="flex flex-col gap-2.5 animate-fadeIn">
                {/* TIER 2: UNIFIED COMMAND BAR CONTAINER (Separated above table card) */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/90 border border-slate-200/80 p-3 rounded-md shadow-3xs select-none">
                  {/* Left: Bundle Number & Status */}
                  <div className="flex items-center gap-2">
                    <span className="font-sans text-[13px] font-normal text-slate-800 bg-white border border-slate-200/90 px-3 py-1 rounded-md shadow-3xs">
                      {selectedBundle.nomorBundle}
                    </span>
                    <span className={`px-2.5 py-0.5 text-[12px] font-normal rounded-full border capitalize font-sans ${getStatusBadgeClass(selectedBundle.status)}`}>
                      {getStatusLabel(selectedBundle.status)}
                    </span>
                  </div>

                  {/* Right: Mode Switcher + Action Buttons */}
                  <div className="flex items-center gap-2.5 shrink-0 flex-wrap font-sans">
                    {/* Display Mode Switcher ('Nopel' vs 'Pemohon') */}
                    <div className="bg-slate-200/70 p-0.5 rounded-md flex items-center gap-0.5 border border-slate-300/60 text-[13px] font-normal select-none h-8 font-sans">
                      <button
                        type="button"
                        onClick={() => handleSwitchDisplayMode('berkas')}
                        className={`h-7 px-3 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${displayMode === 'berkas'
                          ? 'bg-white text-slate-900 shadow-3xs font-normal'
                          : 'text-slate-600 hover:text-slate-900'
                          }`}
                        title="Tampilkan 1 baris per Nomor Pelayanan (NOPEL)"
                      >
                        <span>Nopel</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSwitchDisplayMode('pemohon')}
                        className={`h-7 px-3 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${displayMode === 'pemohon'
                          ? 'bg-white text-slate-900 shadow-3xs font-normal'
                          : 'text-slate-600 hover:text-slate-900'
                          }`}
                        title="Tampilkan rincian pecahan pemilik baru (Mutasi Sebagian)"
                      >
                        <span>Pemohon</span>
                      </button>
                    </div>

                    {/* Reset Jenis button */}
                    {selectedBundle.status === 'DRAFT' && (selectedBundle.permohonan || []).length === 0 && selectedBundle.jenisPermohonan && (
                      <button
                        onClick={() => handleResetBundleType(selectedBundle.id)}
                        disabled={loading}
                        className="h-10 px-3 bg-amber-500 hover:bg-amber-600 text-white text-[13px] font-normal rounded-md shadow-3xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 shrink-0 font-sans"
                        title="Reset jenis permohonan bundle"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Reset Jenis</span>
                      </button>
                    )}

                    {/* Lock Bundle button */}
                    {selectedBundle.status === 'DRAFT' && (
                      <button
                        onClick={handleLockBundle}
                        disabled={loading || (selectedBundle.permohonan || []).length === 0}
                        className="h-10 px-4 bg-[#00a389] hover:bg-[#008f78] text-white text-[13px] font-normal rounded-md shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0 font-sans"
                      >
                        <Lock className="w-4 h-4" />
                        <span>Kunci Bundle</span>
                      </button>
                    )}

                    {/* Print PDF Button */}
                    <a
                      href={`/api/pdf/surat-pengantar-bundle/${selectedBundle.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-10 px-4 bg-white hover:bg-slate-100 border border-slate-200/90 text-slate-700 text-[13px] font-normal rounded-md shadow-3xs transition-all flex items-center gap-2 cursor-pointer shrink-0 font-sans"
                      title="Unduh / Cetak Surat Pengantar PDF"
                    >
                      <Printer className="w-4 h-4 text-[#00a389]" />
                      <span>Cetak</span>
                    </a>
                  </div>
                </div>

                {/* TIER 3: DATA CANVAS & ENTERPRISE TABLE CARD */}
                <div className="w-full bg-white border border-slate-200/90 rounded-md shadow-xs flex flex-col overflow-hidden min-h-[500px]">
                  {(() => {
                    const totalPrintPages = Math.ceil(displayPrintList.length / itemsPerPrintPage);
                    const activePrintPage = currentPrintPage > totalPrintPages ? 1 : currentPrintPage;
                    const paginatedPrintList = displayPrintList.slice(
                      (activePrintPage - 1) * itemsPerPrintPage,
                      activePrintPage * itemsPerPrintPage
                    );

                    return (
                      <div className="flex-1 flex flex-col justify-between overflow-hidden">
                        <div className="overflow-x-auto scrollbar-thin flex-1">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-slate-50/90 text-[13px] font-normal text-slate-600 capitalize text-left border-b border-slate-200/90 select-none font-sans whitespace-nowrap">
                                <th className="py-3 px-4 text-center w-12 min-w-[48px] relative font-normal text-slate-600">
                                  <span>No</span>
                                  <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                                </th>
                                <th className="py-3 px-2 text-center select-none w-10 min-w-[40px] relative font-normal text-slate-600">
                                  <span>⭐</span>
                                  <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                                </th>
                                <th className="py-3 px-4 min-w-[110px] relative font-normal text-slate-600">
                                  <span>Tgl. Input</span>
                                  <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                                </th>
                                <th className="py-3 px-4 min-w-[140px] relative font-normal text-slate-600">
                                  <span>Petugas Input</span>
                                  <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                                </th>
                                <th className="py-3 px-4 min-w-[100px] relative font-normal text-slate-600">
                                  <span>Tgl. Nopel</span>
                                  <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                                </th>
                                <th className="py-3 px-4 min-w-[100px] relative font-normal text-slate-600">
                                  <span>Tgl. Selesai</span>
                                  <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                                </th>
                                <th className="py-3 px-4 min-w-[150px] relative font-normal text-slate-600">
                                  <span>No. Pelayanan</span>
                                  <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                                </th>
                                <th className="py-3 px-4 min-w-[170px] relative font-normal text-slate-600">
                                  <span>Nomor Objek Pajak</span>
                                  <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                                </th>
                                <th className="py-3 px-4 min-w-[170px] relative font-normal text-slate-600">
                                  <span>Nama Pemohon</span>
                                  <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                                </th>
                                <th className="py-3 px-4 min-w-[120px] relative font-normal text-slate-600">
                                  <span>Jenis Layanan</span>
                                  <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                                </th>
                                <th className="py-3 px-4 text-center min-w-[100px] relative font-normal text-slate-600">
                                  <span>Status</span>
                                  <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                                </th>
                                <th className="py-3 px-4 text-center w-24 min-w-[96px] font-normal text-slate-600">
                                  <span>Aksi</span>
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-[12px] font-normal text-slate-600 font-sans bg-white">
                              {paginatedPrintList.length === 0 ? (
                                <tr>
                                  <td colSpan={12} className="py-10 text-center select-none font-sans bg-white">
                                    <EmptyDataAnimation
                                      title="Belum Ada Permohonan"
                                      description="Bundle ini masih kosong. Silakan masukkan berkas dari tab 'Isi Antrean'."
                                    />
                                  </td>
                                </tr>
                              ) : (
                                paginatedPrintList.map((item: any, index: number) => {
                                  const isFrozen = pendingKoreksiMap[item.id] === true;
                                  const itemNumber = (activePrintPage - 1) * itemsPerPrintPage + index + 1;
                                  const nopolDate = item.tanggalNoPelayanan
                                    ? new Date(item.tanggalNoPelayanan).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                                    : '—';
                                  const penyelesaianDate = item.tanggalPenyelesaian
                                    ? new Date(item.tanggalPenyelesaian).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                                    : '—';

                                  return (
                                    <tr
                                      key={item.uniqueRowKey || item.id}
                                      onClick={() => setSelectedRequest(item)}
                                      className={`hover:bg-slate-50/90 transition-colors duration-150 cursor-pointer group text-[12px] font-normal font-sans text-slate-600 h-11 ${item.isPecahanRow ? 'border-l-3 border-l-[#00a389] bg-[#00a389]/5' : isFrozen ? 'bg-amber-50/30' : ''}`}
                                    >
                                      <td className="py-2.5 px-4 text-center font-normal text-slate-600 font-sans text-[12px]">{itemNumber}</td>
                                      <td className="py-2.5 px-2 text-center">
                                        <button
                                          type="button"
                                          className="p-1 cursor-default text-slate-300"
                                        >
                                          <Star className={`w-4 h-4 transition-all duration-200 ${item.isFavorite
                                            ? 'text-amber-500 fill-amber-500 drop-shadow-[0_0_6px_rgba(245,158,11,0.55)]'
                                            : 'text-slate-300'
                                            }`} />
                                        </button>
                                      </td>
                                      <td className="py-2.5 px-4 text-slate-600 font-sans text-[12px] font-normal whitespace-nowrap capitalize">
                                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                      </td>
                                      <td className="py-2.5 px-4 text-slate-600 text-[12px] font-normal font-sans whitespace-nowrap">
                                        <div className="flex items-center gap-1.5 min-w-0" title={item.penginput?.name || "Petugas Input"}>
                                          <span className="truncate max-w-[130px] font-sans font-normal">{toTitleCase(item.penginput?.name || "Petugas Input")}</span>
                                        </div>
                                      </td>
                                      <td className="py-2.5 px-4 text-slate-600 font-sans text-[12px] font-normal whitespace-nowrap capitalize">{nopolDate}</td>
                                      <td className="py-2.5 px-4 whitespace-nowrap font-sans">
                                        {item.tanggalPenyelesaian ? (
                                          <div className="flex items-center gap-1">
                                            {isOverdue(item.tanggalPenyelesaian, item.status) && (
                                              <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                            )}
                                            <span className={`text-[12px] font-sans font-normal capitalize ${isOverdue(item.tanggalPenyelesaian, item.status)
                                              ? 'text-rose-600 font-normal'
                                              : 'text-slate-600'
                                              }`}>
                                              {penyelesaianDate}
                                            </span>
                                          </div>
                                        ) : "—"}
                                      </td>
                                      <td className="py-2.5 px-4 min-w-[150px] group/cell relative font-sans">
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-[12px] font-normal text-slate-600 font-sans tracking-tight capitalize">
                                            {item.nomorPelayanan || item.nomorPermohonan}
                                          </span>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleCopy(e, item.nomorPelayanan || item.nomorPermohonan);
                                            }}
                                            className="p-1 rounded opacity-0 group-hover/cell:opacity-100 hover:bg-slate-100 text-slate-400 hover:text-[#00a389] transition-all cursor-pointer flex items-center justify-center w-5 h-5 select-none"
                                            title="Salin Nomor"
                                          >
                                            {copiedText === (item.nomorPelayanan || item.nomorPermohonan) ? (
                                              <Check className="w-3.5 h-3.5 text-emerald-600 transition-all duration-200 transform scale-110" />
                                            ) : (
                                              <Copy className="w-3 h-3" />
                                            )}
                                          </button>
                                          {isFrozen && (
                                            <span className="text-[8px] font-extrabold uppercase bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 select-none animate-fadeIn">
                                              <Clock className="w-2.5 h-2.5 shrink-0 animate-pulse" />
                                              Frozen
                                            </span>
                                          )}
                                        </div>
                                      </td>
                                      <td className="py-2.5 px-4 min-w-[210px] whitespace-nowrap group/cell relative font-sans">
                                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                                          <span className="text-[12px] font-normal text-slate-600 font-sans whitespace-nowrap capitalize">
                                            {formatNop(item.nop)}
                                          </span>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleCopy(e, item.nop);
                                            }}
                                            className="p-1 rounded opacity-0 group-hover/cell:opacity-100 hover:bg-slate-100 text-slate-400 hover:text-[#00a389] transition-all cursor-pointer flex items-center justify-center w-5 h-5 select-none"
                                            title="Salin NOP"
                                          >
                                            {copiedText === item.nop ? (
                                              <Check className="w-3.5 h-3.5 text-emerald-600 transition-all duration-200 transform scale-110" />
                                            ) : (
                                              <Copy className="w-3 h-3" />
                                            )}
                                          </button>
                                        </div>
                                      </td>
                                      <td className="py-2.5 px-4 group/cell relative min-w-[170px] font-sans">
                                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                                          <span className="text-[12px] font-normal text-slate-600 whitespace-nowrap capitalize font-sans">
                                            {toTitleCase(item.displayNamaWajibPajak || item.namaWajibPajak)}
                                          </span>
                                          {item.isPecahanRow && (
                                            <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-1.5 py-0.2 rounded-md shrink-0 font-sans">
                                              #{item.pecahanIndex}/{item.totalPecahan}
                                            </span>
                                          )}
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleCopy(e, item.displayNamaWajibPajak || item.namaWajibPajak);
                                            }}
                                            className="p-1 rounded opacity-0 group-hover/cell:opacity-100 hover:bg-slate-100 text-slate-400 hover:text-[#00a389] transition-all cursor-pointer flex items-center justify-center w-5 h-5 select-none"
                                            title="Salin Nama Pemohon"
                                          >
                                            {copiedText === (item.displayNamaWajibPajak || item.namaWajibPajak) ? (
                                              <Check className="w-3.5 h-3.5 text-emerald-600 transition-all duration-200 transform scale-110" />
                                            ) : (
                                              <Copy className="w-3 h-3" />
                                            )}
                                          </button>
                                        </div>
                                      </td>
                                      <td className="py-2.5 px-4 font-sans">
                                        <span
                                          className="text-[12px] font-normal text-slate-600 bg-slate-100 border border-slate-200/90 px-2 py-0.5 rounded capitalize font-sans"
                                          title={item.jenisPermohonan.replace(/_/g, ' ')}
                                        >
                                          {getAbbreviatedJenis(item.jenisPermohonan)}
                                        </span>
                                      </td>
                                      <td className="py-2.5 px-4 text-center font-sans">
                                        <div className="flex items-center justify-center gap-1">
                                          <span className={`px-2.5 py-0.5 text-[12px] font-normal rounded-full border capitalize font-sans ${getStatusBadgeClass(item.status)}`}>
                                            {getStatusLabel(item.status)}
                                          </span>
                                        </div>
                                      </td>
                                      <td className="py-3 px-4 text-center">
                                        <div className="flex items-center justify-center gap-1.5">
                                          {/* Kertas Kerja PDF link for Mutasi Sebagian */}
                                          {item.jenisPermohonan === 'MUTASI_SEBAGIAN' && (
                                            <a
                                              href={`/api/pdf/kertas-kerja/${item.id}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="h-8 w-8 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 transition-all flex items-center justify-center shrink-0"
                                              title="Cetak Kertas Kerja Mutasi Sebagian"
                                            >
                                              <FileText className="w-3.5 h-3.5 text-[#00a389]" />
                                            </a>
                                          )}

                                          {/* Extraction Action */}
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              if (selectedBundle.status === 'LOCKED') {
                                                setExtractionTarget(item);
                                              } else {
                                                showConfirm({
                                                  title: 'Keluarkan dari Bundle',
                                                  message: `Apakah Anda yakin ingin mengeluarkan permohonan ${item.nomorPermohonan} dari bundle draf ini?`,
                                                  onConfirm: () => {
                                                    handleRemoveFromBundle(item);
                                                  }
                                                });
                                              }
                                            }}
                                            disabled={loading || isFrozen}
                                            className="h-8 w-8 bg-slate-50 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 rounded-lg text-slate-400 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shrink-0 shadow-3xs"
                                            title={selectedBundle.status === 'LOCKED' ? "Ajukan keluarkan (acc supervisor)" : "Keluarkan"}
                                          >
                                            <FolderMinus className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>

                        {/* Table Footer / Pagination for Print Table */}
                        <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 select-none shrink-0">
                          <div className="flex items-center gap-3">
                            <span className="text-[11px] font-semibold text-slate-500 font-sans">
                              {displayPrintList.length > 0
                                ? `Menampilkan ${((activePrintPage - 1) * itemsPerPrintPage) + 1}–${Math.min(activePrintPage * itemsPerPrintPage, displayPrintList.length)} dari ${displayPrintList.length} ${displayMode === 'pemohon' ? 'entri pemohon' : 'permohonan'}`
                                : 'Tidak ada data'}
                            </span>
                            {/* Items per page */}
                            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-1.5 py-0.5 shadow-3xs">
                              {[10, 20, 50].map(n => (
                                <button
                                  key={n}
                                  type="button"
                                  onClick={() => setItemsPerPrintPage(n)}
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${itemsPerPrintPage === n
                                    ? 'bg-[#00a389] text-white shadow-3xs font-extrabold'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                  {n}
                                </button>
                              ))}
                              <span className="text-[10px] text-slate-400 font-semibold pl-0.5">/hal</span>
                            </div>
                          </div>
                          {totalPrintPages > 1 && (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setCurrentPrintPage(prev => Math.max(prev - 1, 1))}
                                disabled={activePrintPage === 1}
                                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-all cursor-pointer shadow-3xs flex items-center justify-center"
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </button>
                              {Array.from({ length: totalPrintPages }, (_, i) => i + 1)
                                .filter(page => page === 1 || page === totalPrintPages || Math.abs(page - activePrintPage) <= 1)
                                .reduce((acc: (number | string)[], page, idx, arr) => {
                                  if (idx > 0 && (page as number) - (arr[idx - 1] as number) > 1) acc.push('...');
                                  acc.push(page);
                                  return acc;
                                }, [])
                                .map((page, idx) =>
                                  page === '...' ? (
                                    <span key={`ellipsis-${idx}`} className="px-1 text-slate-400 text-xs">…</span>
                                  ) : (
                                    <button
                                      key={page}
                                      type="button"
                                      onClick={() => setCurrentPrintPage(page as number)}
                                      className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${activePrintPage === page
                                        ? 'bg-[#00a389] text-white font-extrabold shadow-3xs scale-105 z-10'
                                        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 shadow-3xs'
                                        }`}
                                    >
                                      {page}
                                    </button>
                                  )
                                )}
                              <button
                                type="button"
                                onClick={() => setCurrentPrintPage(prev => Math.min(prev + 1, totalPrintPages))}
                                disabled={activePrintPage === totalPrintPages}
                                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-all cursor-pointer shadow-3xs flex items-center justify-center"
                              >
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            ) : (
              /* Clean & Premium Empty Placeholder with Select-bro.svg */
              <div className="py-14 text-center flex flex-col items-center justify-center gap-4 select-none animate-fadeIn bg-white border border-slate-200/90 rounded-md p-8 shadow-3xs">
                <img
                  src="/assets/Select-bro.svg"
                  alt="Pilih Bundle"
                  className="w-56 h-56 max-w-full object-contain pointer-events-none drop-shadow-xs"
                />
                <div className="space-y-1.5 max-w-sm">
                  <h3 className="text-sm font-extrabold text-slate-800 tracking-tight font-sans">Belum Ada Bundle yang Dipilih</h3>
                  <p className="text-xs text-slate-500 font-normal leading-relaxed font-sans">
                    Silakan pilih salah satu bundle pada tab <strong className="text-slate-700 font-bold font-sans">Pilih Bundle</strong> terlebih dahulu untuk mengulas berkas, melakukan penguncian, atau mencetak Surat Pengantar.
                  </p>
                  <button
                    onClick={() => handleSwitchStep('bundle')}
                    className="mt-3 px-4 py-2 bg-[#00a389] hover:bg-[#008f78] text-white text-[13px] font-normal rounded-md transition-all cursor-pointer shadow-3xs inline-flex items-center gap-1.5 font-sans"
                  >
                    <span>Pilih Bundle Sekarang</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>{/* end: hide-during-skeleton wrapper */}

      {/* DIALOG: Minta Revisi Notes - Reconstructed Floating Modal Overlay via React Portal */}
      {mounted && revisionTarget && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-fadeIn select-none font-sans overflow-y-auto">
          {/* Clickable Backdrop to Dismiss */}
          <div
            className="fixed inset-0 -z-10"
            onClick={() => {
              if (!loading) {
                setRevisionTarget(null);
                setRevisionNotes('');
              }
            }}
          />

          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200/90 overflow-hidden animate-scaleUp flex flex-col my-auto">
            {/* Header Strip matching App Theme & Header Bar */}
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-sm font-extrabold text-white tracking-wide uppercase font-sans">
                    Pengembalian Berkas Revisi
                  </h3>
                  <p className="text-[11px] font-semibold text-slate-400 font-sans">
                    Kembalikan permohonan ke Petugas Input untuk diperbaiki
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setRevisionTarget(null); setRevisionNotes(''); }}
                disabled={loading}
                className="w-8 h-8 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors flex items-center justify-center cursor-pointer shrink-0 disabled:opacity-40"
                title="Tutup Modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body Content */}
            <form onSubmit={handleMintaRevisi} className="p-5 sm:p-6 flex flex-col gap-4">
              {/* Target Details Card Header */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-lg p-3.5 flex flex-col gap-2 shadow-3xs">
                <div className="flex items-center justify-between text-xs gap-2">
                  <span className="font-semibold text-slate-500 font-sans">No. Pelayanan:</span>
                  <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-3xs text-[11px]">
                    {revisionTarget.nomorPelayanan || revisionTarget.nomorPermohonan}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs gap-2">
                  <span className="font-semibold text-slate-500 font-sans">Nama Pemohon:</span>
                  <span className="font-bold text-slate-800 uppercase truncate text-[11px] font-sans">
                    {revisionTarget.namaWajibPajak}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs gap-2">
                  <span className="font-semibold text-slate-500 font-sans">NOP:</span>
                  <span className="font-mono font-bold text-slate-700 text-[11px]">
                    {formatNop(revisionTarget.nop)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs gap-2">
                  <span className="font-semibold text-slate-500 font-sans">Jenis Layanan:</span>
                  <span className="font-bold text-[#008f78] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/80 text-[11px] capitalize font-sans">
                    {revisionTarget.jenisPermohonan.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Textarea Form Group */}
              <div className="flex flex-col gap-2 font-sans">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Catatan Alasan Revisi</span>
                  <span className="text-[10px] text-slate-400 font-semibold normal-case">Wajib diisi</span>
                </label>
                <textarea
                  placeholder="Tuliskan catatan detail alasan berkas dikembalikan (contoh: Lampiran KTP buram, SPPT NOP tidak sesuai sertifikat...)"
                  value={revisionNotes}
                  onChange={(e) => setRevisionNotes(e.target.value)}
                  disabled={loading}
                  rows={4}
                  className="w-full text-xs font-semibold bg-white border border-slate-200 focus:outline-none focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 rounded-lg p-3 transition-all text-slate-800 resize-none shadow-3xs"
                  required
                />

                {/* Quick Preset Buttons */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    'Lampiran KTP buram / tidak jelas',
                    'SPPT NOP tidak sesuai sertifikat',
                    'Format Surat Kuasa tidak valid',
                    'Bukti bayar PBB belum dilampirkan',
                    'Rincian pecahan luas tidak cocok'
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setRevisionNotes(prev => prev ? `${prev}; ${preset}` : preset);
                      }}
                      className="px-2.5 py-1 text-[10px] font-bold bg-slate-100 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 border border-slate-200/80 text-slate-600 rounded-md transition-all cursor-pointer text-left shrink-0 font-sans"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons Strip */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 select-none font-sans">
                <button
                  type="button"
                  onClick={() => { setRevisionTarget(null); setRevisionNotes(''); }}
                  disabled={loading}
                  className="h-10 px-4 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs transition-all cursor-pointer disabled:opacity-40"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading || !revisionNotes.trim()}
                  className="h-10 px-4 rounded-md bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-extrabold text-xs shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40 disabled:scale-100"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <>
                      <Send className="w-4 h-4 stroke-[2.5]" />
                      <span>Kirim Revisi Ke Penginput</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* DIALOG: Extraction from locked bundle (Requires Supervisor validation) */}
      {mounted && extractionTarget && selectedBundle?.status === 'LOCKED' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-fadeIn select-none font-sans overflow-y-auto">
          {/* Clickable Backdrop to Dismiss */}
          <div
            className="fixed inset-0 -z-10"
            onClick={() => {
              if (!loading) {
                setExtractionTarget(null);
                setExtractionNotes('');
              }
            }}
          />

          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200/90 overflow-hidden animate-scaleUp flex flex-col my-auto">
            {/* Header Strip matching App Theme & Header Bar */}
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#00a389]/20 border border-[#00a389]/30 flex items-center justify-center text-[#00a389] shrink-0">
                  <Lock className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-sm font-extrabold text-white tracking-wide uppercase font-sans">
                    Koreksi Bundle Terkunci
                  </h3>
                  <p className="text-[11px] font-semibold text-slate-400 font-sans">
                    Pengeluaran berkas dari bundle locked membutuhkan persetujuan Supervisor
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setExtractionTarget(null); setExtractionNotes(''); }}
                disabled={loading}
                className="w-8 h-8 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors flex items-center justify-center cursor-pointer shrink-0 disabled:opacity-40"
                title="Tutup Modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-6 flex flex-col gap-4 font-sans">
              <p className="text-xs text-slate-500 font-semibold select-none leading-relaxed">
                Karena Bundle <strong className="text-slate-800 font-bold">{selectedBundle.nomorBundle}</strong> sudah berstatus <strong>LOCKED</strong>, pengeluaran berkas <strong className="text-slate-800 font-bold">{extractionTarget.nomorPermohonan}</strong> membutuhkan otorisasi persetujuan dari <strong>Supervisor</strong>.
              </p>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Alasan Pengeluaran Berkas</label>
                <textarea
                  placeholder="Tuliskan catatan alasan pengeluaran berkas untuk ditinjau oleh Supervisor..."
                  value={extractionNotes}
                  onChange={(e) => setExtractionNotes(e.target.value)}
                  disabled={loading}
                  rows={4}
                  className="w-full text-xs font-semibold bg-white border border-slate-200 focus:outline-none focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 rounded-lg p-3 transition-all text-slate-800 resize-none shadow-3xs"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 select-none">
                <button
                  type="button"
                  onClick={() => { setExtractionTarget(null); setExtractionNotes(''); }}
                  disabled={loading}
                  className="h-10 px-4 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs transition-all cursor-pointer disabled:opacity-40"
                >
                  Batal
                </button>
                <button
                  onClick={() => handleRemoveFromBundle()}
                  disabled={loading || !extractionNotes.trim()}
                  className="h-10 px-4 rounded-md bg-[#00a389] hover:bg-[#008f78] active:scale-95 text-white font-extrabold text-xs shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    'Kirim Permintaan Otorisasi'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
      {/* DIALOG: Details Modal Overlay */}
      {selectedRequest && (
        <DetailsModal
          isOpen={!!selectedRequest}
          selectedRequest={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}

      <ActionStatusModal
        isOpen={statusModalOpen}
        status={statusModalStatus}
        title={statusModalTitle}
        message={statusModalMessage}
        onClose={() => setStatusModalOpen(false)}
      />
    </div>
  );
}


