/**
 * SkeletonBase.tsx
 * Shared primitive components for skeleton/shimmer loading states.
 * All components use Tailwind's animate-pulse — no external dependencies.
 */

import React from 'react';

interface SkeletonBoxProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: string;
}

/** Generic rectangular shimmer block */
export function SkeletonBox({
  className = '',
  width = 'w-full',
  height = 'h-4',
  rounded = 'rounded-md',
}: SkeletonBoxProps) {
  return (
    <div
      className={`${width} ${height} ${rounded} bg-gray-200 animate-pulse ${className}`}
    />
  );
}

interface SkeletonCircleProps {
  size?: string;
  className?: string;
}

/** Circular shimmer (avatars, icons) */
export function SkeletonCircle({ size = 'w-8 h-8', className = '' }: SkeletonCircleProps) {
  return (
    <div className={`${size} rounded-full bg-gray-200 animate-pulse shrink-0 ${className}`} />
  );
}

interface SkeletonTextProps {
  width?: string;
  className?: string;
  height?: string;
}

/** Single line text shimmer */
export function SkeletonText({ width = 'w-1/2', height = 'h-3', className = '' }: SkeletonTextProps) {
  return (
    <div className={`${width} ${height} bg-gray-200 animate-pulse rounded-full ${className}`} />
  );
}

interface SkeletonAvatarStackProps {
  count?: number;
  size?: string;
}

/** Stacked avatar shimmer (-space-x-1 style) */
export function SkeletonAvatarStack({ count = 3, size = 'w-5 h-5' }: SkeletonAvatarStackProps) {
  return (
    <div className="flex -space-x-1">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`${size} rounded-full bg-gray-300 animate-pulse ring-2 ring-white`} />
      ))}
    </div>
  );
}

interface SkeletonBadgeProps {
  width?: string;
  className?: string;
}

/** Pill/badge shimmer */
export function SkeletonBadge({ width = 'w-16', className = '' }: SkeletonBadgeProps) {
  return (
    <div className={`${width} h-4 bg-gray-200 animate-pulse rounded-full ${className}`} />
  );
}

interface SkeletonProgressBarProps {
  className?: string;
}

/** Progress bar shimmer */
export function SkeletonProgressBar({ className = '' }: SkeletonProgressBarProps) {
  return (
    <div className={`w-full h-1.5 bg-gray-200 animate-pulse rounded-full ${className}`} />
  );
}

/** Wrapper for a skeleton card (white bg, border, rounded) */
export function SkeletonCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200/80 ${className}`}>
      {children}
    </div>
  );
}

/** Skeleton lengkap untuk PenginputWorkspace — header + tabel */
export function PenginputSkeleton() {
  const STATUS_CHIPS = ['Semua', 'SUBMITTED', 'REVISION', 'BUNDLED', 'ARCHIVED', 'COMPLETED', 'REJECTED'];
  return (
    <div className="w-full font-sans select-none flex flex-col gap-6 animate-fadeIn">
      {/* Header card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#f3f6f9] p-5 rounded-2xl shadow-sm">
        <SkeletonBox width="w-56" height="h-5" rounded="rounded-full" />
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1">
            <SkeletonBox width="w-32" height="h-7" rounded="rounded-lg" />
            <SkeletonBox width="w-24" height="h-7" rounded="rounded-lg" />
          </div>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-[#f3f6f9] rounded-2xl shadow-sm flex flex-col overflow-hidden min-h-[300px]">
        {/* Action row: search */}
        <div className="p-5 border-b border-gray-200/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <SkeletonBox width="w-36" height="h-4" rounded="rounded-full" />
          <div className="w-72 h-8 bg-gray-200 animate-pulse rounded-lg" />
        </div>

        {/* Filter chips */}
        <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2 overflow-x-auto bg-[#f3f6f9]">
          {STATUS_CHIPS.map((s) => (
            <div key={s} className="h-6 rounded-full bg-gray-200 animate-pulse" style={{ width: s === 'Semua' ? 52 : s.length * 7 + 20 }} />
          ))}
        </div>

        {/* Table */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-gray-200/60">
                {['No', 'Tanggal', 'No. Pelayanan / NOP', 'Wajib Pajak', 'Jenis Layanan', 'Status', 'Aksi'].map((h) => (
                  <th key={h} className="py-3 px-5">
                    <SkeletonText width="w-16" height="h-2.5" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Array.from({ length: 7 }).map((_, i) => (
                <tr key={i}>
                  <td className="py-4 px-5 w-12"><SkeletonText width="w-4" height="h-3" /></td>
                  <td className="py-4 px-5"><SkeletonText width="w-20" height="h-3" /></td>
                  <td className="py-4 px-5 min-w-[220px]">
                    <div className="flex flex-col gap-1.5">
                      <SkeletonText width="w-36" height="h-3" />
                      <SkeletonText width="w-28" height="h-2.5" />
                    </div>
                  </td>
                  <td className="py-4 px-5"><SkeletonText width={i % 2 === 0 ? 'w-28' : 'w-24'} height="h-3" /></td>
                  <td className="py-4 px-5"><SkeletonBadge width="w-10" /></td>
                  <td className="py-4 px-5 text-center"><SkeletonBadge width="w-20" /></td>
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-6 h-6 rounded-lg bg-gray-200 animate-pulse" />
                      <div className="w-6 h-6 rounded-lg bg-gray-200 animate-pulse" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-gray-200/60 flex items-center justify-between">
          <SkeletonText width="w-32" height="h-3" />
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-7 h-7 rounded-lg bg-gray-200 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Skeleton untuk PenelitiWorkspace — premium tabbed layout */
export function PenelitiSkeleton() {
  return (
    <div className="w-full font-sans select-none flex flex-col gap-6 animate-fadeIn">
      {/* Header card skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#f3f6f9] p-5 rounded-2xl shadow-sm">
        <SkeletonBox width="w-56" height="h-5" rounded="rounded-full" />
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1">
            <SkeletonBox width="w-28" height="h-7" rounded="rounded-lg" />
            <SkeletonBox width="w-24" height="h-7" rounded="rounded-lg" />
            <SkeletonBox width="w-28" height="h-7" rounded="rounded-lg" />
          </div>
        </div>
      </div>

      {/* Content card skeleton (default: table) */}
      <div className="bg-[#f3f6f9] rounded-2xl shadow-sm flex flex-col overflow-hidden min-h-[300px]">
        {/* Action row: search */}
        <div className="p-5 border-b border-gray-200/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <SkeletonBox width="w-36" height="h-4" rounded="rounded-full" />
          <div className="w-72 h-8 bg-gray-200 animate-pulse rounded-lg" />
        </div>

        {/* Table */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-gray-200/60">
                {['No', '⭐', 'Tanggal', 'No. Pelayanan / NOP', 'Wajib Pajak', 'Layanan', 'Aksi'].map((h) => (
                  <th key={h} className="py-3 px-5">
                    <SkeletonText width="w-16" height="h-2.5" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="py-4 px-5 w-12"><SkeletonText width="w-4" height="h-3" /></td>
                  <td className="py-4 px-5 w-10 text-center"><SkeletonText width="w-4" height="h-3" /></td>
                  <td className="py-4 px-5"><SkeletonText width="w-20" height="h-3" /></td>
                  <td className="py-4 px-5 min-w-[220px]">
                    <div className="flex flex-col gap-1.5">
                      <SkeletonText width="w-36" height="h-3" />
                      <SkeletonText width="w-28" height="h-2.5" />
                    </div>
                  </td>
                  <td className="py-4 px-5"><SkeletonText width={i % 2 === 0 ? 'w-28' : 'w-24'} height="h-3" /></td>
                  <td className="py-4 px-5"><SkeletonBadge width="w-10" /></td>
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-6 rounded-lg bg-gray-200 animate-pulse" />
                      <div className="w-12 h-6 rounded-lg bg-gray-200 animate-pulse" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/** Skeleton untuk PengarsipWorkspace — 2-panel flex layout */
export function PengarsipSkeleton() {
  return (
    <div className="w-full font-sans select-none flex flex-col gap-6 animate-fadeIn">
      {/* Header card skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#f3f6f9] p-5 rounded-2xl shadow-sm">
        <div className="flex flex-col gap-2">
          <SkeletonBox width="w-16" height="h-4" rounded="rounded-full" />
          <SkeletonBox width="w-64" height="h-5" rounded="rounded-full" />
        </div>
        <SkeletonBox width="w-44" height="h-8" rounded="rounded-xl" />
      </div>

      <div className="flex flex-col lg:flex-row gap-6 w-full">
        {/* LEFT PANEL: Bundle List */}
        <div className="w-full lg:w-96 flex flex-col gap-4 bg-white/70 backdrop-blur-md p-5 rounded-2xl border border-gray-250/50 shadow-sm shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gray-200 animate-pulse rounded" />
              <SkeletonBox width="w-36" height="h-5" rounded="rounded-full" />
            </div>
            <div className="w-7 h-7 bg-gray-200 animate-pulse rounded-lg" />
          </div>

          {/* Search */}
          <div className="h-10 bg-gray-200 animate-pulse rounded-xl" />

          {/* Bundle cards */}
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <SkeletonText width="w-36" height="h-3" />
                  <div className="flex gap-1.5">
                    <SkeletonBadge width="w-12" />
                    <SkeletonBadge width="w-16" />
                  </div>
                </div>
                <SkeletonProgressBar />
                <div className="flex justify-between">
                  <SkeletonText width="w-20" height="h-2.5" />
                  <SkeletonText width="w-16" height="h-2.5" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL: Detail placeholder */}
        <div className="flex-1 flex flex-col gap-5 bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-gray-250/50 shadow-sm min-w-0">
          {/* Detail header shimmer */}
          <div className="border-b border-gray-100 pb-4">
            <div className="flex items-center justify-between mb-3">
              <SkeletonBox width="w-48" height="h-5" rounded="rounded-full" />
              <SkeletonBadge width="w-20" />
            </div>
            <div className="flex gap-4">
              <SkeletonText width="w-32" height="h-3" />
              <SkeletonText width="w-40" height="h-3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Skeleton untuk PengirimWorkspace — 2-panel layout */
export function PengirimSkeleton() {
  return (
    <div className="w-full font-sans select-none flex flex-col gap-6 animate-fadeIn">
      {/* Header card skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#f3f6f9] p-5 rounded-2xl shadow-sm">
        <div className="flex flex-col gap-2">
          <SkeletonBox width="w-16" height="h-4" rounded="rounded-full" />
          <SkeletonBox width="w-72" height="h-5" rounded="rounded-full" />
        </div>
        <SkeletonBox width="w-44" height="h-8" rounded="rounded-xl" />
      </div>

      <div className="flex flex-col lg:flex-row gap-6 w-full">
        {/* LEFT PANEL */}
        <div className="w-full lg:w-96 flex flex-col gap-4 bg-white/70 backdrop-blur-md p-5 rounded-2xl border border-gray-250/50 shadow-sm shrink-0">
          {/* Tab switcher */}
          <div className="flex p-1 bg-slate-100 rounded-xl">
            <div className="flex-1 h-8 bg-gray-200 animate-pulse rounded-lg" />
            <div className="flex-1 h-8 bg-transparent rounded-lg" />
          </div>

          {/* Label + refresh */}
          <div className="flex items-center justify-between">
            <SkeletonText width="w-28" height="h-3" />
            <div className="w-6 h-6 bg-gray-200 animate-pulse rounded-lg" />
          </div>

          {/* Search */}
          <div className="h-10 bg-gray-200 animate-pulse rounded-xl" />

          {/* Manifest cards */}
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <SkeletonText width="w-32" height="h-3" />
                  <SkeletonBadge width="w-14" />
                </div>
                <div className="flex justify-between mt-1">
                  <SkeletonText width="w-20" height="h-2.5" />
                  <SkeletonText width="w-16" height="h-2.5" />
                </div>
              </div>
            ))}
          </div>

          {/* New manifest button */}
          <div className="h-9 bg-gray-200 animate-pulse rounded-xl" />
        </div>

        {/* RIGHT PANEL: Manifest Detail */}
        <div className="flex-1 flex flex-col gap-5 bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-gray-250/50 shadow-sm min-w-0">
          {/* Detail header */}
          <div className="border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 bg-gray-200 animate-pulse rounded" />
              <SkeletonBox width="w-40" height="h-5" rounded="rounded-full" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <SkeletonText width="w-20" height="h-2.5" />
                  <SkeletonText width="w-28" height="h-3" />
                </div>
              ))}
            </div>
          </div>

          {/* Bundle items inside manifest */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <SkeletonText width="w-36" height="h-4" />
              <SkeletonBadge width="w-16" />
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-slate-50 rounded-xl border border-slate-200 p-3.5 flex items-center justify-between">
                <div className="flex flex-col gap-1.5">
                  <SkeletonText width="w-32" height="h-3" />
                  <SkeletonText width="w-20" height="h-2.5" />
                </div>
                <div className="w-7 h-7 bg-gray-200 animate-pulse rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Skeleton untuk PemantauWorkspace — 2-panel layout + timeline stepper */
export function PemantauSkeleton() {
  return (
    <div className="w-full font-sans select-none flex flex-col gap-6 animate-fadeIn">
      {/* Header card skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#f3f6f9] p-5 rounded-2xl shadow-sm">
        <div className="flex flex-col gap-2">
          <SkeletonBox width="w-16" height="h-4" rounded="rounded-full" />
          <SkeletonBox width="w-72" height="h-5" rounded="rounded-full" />
        </div>
        <SkeletonBox width="w-44" height="h-8" rounded="rounded-xl" />
      </div>

      <div className="flex flex-col lg:flex-row gap-6 w-full">
        {/* LEFT PANEL */}
        <div className="w-full lg:w-96 flex flex-col gap-4 bg-white/70 backdrop-blur-md p-5 rounded-2xl border border-gray-250/50 shadow-sm shrink-0">
          {/* Tab switcher */}
          <div className="flex p-1 bg-slate-100 rounded-xl">
            <div className="flex-1 h-8 bg-gray-200 animate-pulse rounded-lg" />
            <div className="flex-1 h-8 bg-transparent rounded-lg" />
          </div>

          {/* Label + refresh */}
          <div className="flex items-center justify-between">
            <SkeletonText width="w-24" height="h-3" />
            <div className="w-6 h-6 bg-gray-200 animate-pulse rounded-lg" />
          </div>

          {/* Search */}
          <div className="h-10 bg-gray-200 animate-pulse rounded-xl" />

          {/* Permohonan cards */}
          <div className="flex flex-col gap-3 max-h-[55vh] overflow-y-auto">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <SkeletonText width="w-36" height="h-3" />
                  <SkeletonBadge width="w-16" />
                </div>
                <SkeletonText width={i % 2 === 0 ? 'w-32' : 'w-28'} height="h-3" />
                <div className="flex justify-between mt-1">
                  <SkeletonText width="w-24" height="h-2.5" />
                  <SkeletonText width="w-16" height="h-2.5" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL: Detail */}
        <div className="flex-1 flex flex-col gap-5 bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-gray-250/50 shadow-sm min-w-0">
          {/* Detail header */}
          <div className="border-b border-gray-100 pb-4">
            <div className="flex items-center justify-between mb-3">
              <SkeletonBox width="w-48" height="h-5" rounded="rounded-full" />
              <SkeletonBadge width="w-20" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <SkeletonText width="w-20" height="h-2.5" />
                  <SkeletonText width="w-28" height="h-3" />
                </div>
              ))}
            </div>
          </div>

          {/* Timeline stepper shimmer */}
          <div className="flex flex-col gap-2">
            <SkeletonText width="w-32" height="h-4" className="mb-2" />
            <div className="flex items-center gap-0">
              {Array.from({ length: 5 }).map((_, i) => (
                <React.Fragment key={i}>
                  <div className="flex flex-col items-center gap-1.5">
                    <div className={`w-8 h-8 rounded-full animate-pulse ${i < 3 ? 'bg-indigo-200' : 'bg-gray-200'}`} />
                    <SkeletonText width="w-14" height="h-2" />
                  </div>
                  {i < 4 && (
                    <div className={`flex-1 h-0.5 mb-5 animate-pulse ${i < 2 ? 'bg-indigo-200' : 'bg-gray-200'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mt-auto pt-4 border-t border-gray-100">
            <div className="h-9 flex-1 bg-gray-200 animate-pulse rounded-xl" />
            <div className="h-9 w-36 bg-gray-200 animate-pulse rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Skeleton untuk TasksRevisionCard — header + 5 baris tabel */
export function TasksRevisionCardSkeleton() {
  return (
    <div className="w-full flex flex-col font-sans select-none">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-[10px] border-b-2 border-gray-200/90 mb-3">
        <div className="flex items-center gap-2">
          <SkeletonBox width="w-36" height="h-4" rounded="rounded-full" />
          <SkeletonBox width="w-5" height="h-5" rounded="rounded-md" />
        </div>
        <div className="flex items-center gap-5">
          <SkeletonBox width="w-16" height="h-3" rounded="rounded-full" />
          <SkeletonBox width="w-14" height="h-3" rounded="rounded-full" />
          <div className="flex gap-0.5">
            <div className="flex flex-col gap-0.5">
              <span className="w-1 h-1 rounded-full bg-gray-200" />
              <span className="w-1 h-1 rounded-full bg-gray-200" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="w-1 h-1 rounded-full bg-gray-200" />
              <span className="w-1 h-1 rounded-full bg-gray-200" />
            </div>
          </div>
        </div>
      </div>

      {/* Table rows */}
      <div className="flex flex-col gap-1 min-h-[160px]">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-12 gap-2 items-center pb-2.5 pt-2.5 border-b border-[#eceff1]"
          >
            <div className="col-span-6 sm:col-span-5 pr-2">
              <SkeletonText width={i % 2 === 0 ? 'w-4/5' : 'w-3/5'} height="h-3" />
            </div>
            <div className="col-span-3 sm:col-span-2">
              <SkeletonText width="w-12" height="h-2.5" />
            </div>
            <div className="col-span-3 sm:col-span-3">
              <SkeletonBadge width="w-20" />
            </div>
            <div className="hidden sm:flex sm:col-span-2 justify-end">
              <div className="w-5 h-5 rounded-full bg-gray-200 animate-pulse ring-2 ring-white" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Skeleton untuk FavoritesCard — header + 5 tile kotak statistik */
export function FavoritesCardSkeleton() {
  return (
    <div className="w-full flex flex-col font-sans select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-[10px] border-b-2 border-gray-200/90 mb-5">
        <SkeletonBox width="w-24" height="h-4" rounded="rounded-full" />
        <div className="flex gap-0.5">
          <div className="flex flex-col gap-0.5">
            <span className="w-1 h-1 rounded-full bg-gray-200" />
            <span className="w-1 h-1 rounded-full bg-gray-200" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="w-1 h-1 rounded-full bg-gray-200" />
            <span className="w-1 h-1 rounded-full bg-gray-200" />
          </div>
        </div>
      </div>

      {/* 5-tile grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 justify-items-center sm:justify-items-stretch">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="w-[80px] h-[80px] rounded-[20px] bg-gray-200 animate-pulse" />
            <div className="mt-2.5 flex flex-col items-center gap-1.5">
              <SkeletonText width="w-20" height="h-3" />
              <SkeletonText width="w-14" height="h-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface TrackingTabSkeletonProps {
  viewMode?: 'manifests' | 'bundles' | 'permohonan';
}

/** Skeleton presisi untuk TrackingTab (Lacak Permohonan) — mencakup Header Card & Main Content */
export function TrackingTabSkeleton({ viewMode = 'manifests' }: TrackingTabSkeletonProps) {
  return (
    <div className="w-full flex flex-col gap-6 font-sans select-none animate-fadeIn">
      {/* 1. Command Bar Header Skeleton */}
      <div className="bg-white border border-slate-200/90 p-4 rounded-md shadow-3xs flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans">
        <SkeletonBox width="w-44" height="h-5" rounded="rounded-full" />
        <div className="flex items-center gap-2 w-full md:w-auto">
          <SkeletonBox width="w-full md:w-[403px]" height="h-10" rounded="rounded-md" />
          <SkeletonBox width="w-10" height="h-10" rounded="rounded-md" />
        </div>
      </div>

      {/* 2. Main Content Container Skeleton */}
      {viewMode === 'permohonan' ? (
        <div className="flex flex-col gap-3 font-sans">
          <div className="flex items-center justify-end">
            <SkeletonBox width="w-36" height="h-8" rounded="rounded-md" />
          </div>
          <div className="w-full bg-white border border-slate-200/90 rounded-md shadow-xs flex flex-col overflow-hidden min-h-[400px]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-sans">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200">
                    {['No', '⭐', 'Tgl. Input', 'Petugas Input', 'Tgl. Nopel', 'Tgl. Selesai', 'No. Pelayanan', 'NOP', 'Nama Pemohon', 'Jenis', 'Status', 'Aksi'].map((_, idx) => (
                      <th key={idx} className="py-3 px-4">
                        <SkeletonText width="w-14" height="h-3" />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <tr key={i}>
                      <td className="py-3 px-4 text-center"><SkeletonText width="w-4" height="h-3" /></td>
                      <td className="py-3 px-2 text-center"><SkeletonCircle size="w-4 h-4" /></td>
                      <td className="py-3 px-4"><SkeletonText width="w-16" height="h-3" /></td>
                      <td className="py-3 px-4"><SkeletonText width="w-24" height="h-3" /></td>
                      <td className="py-3 px-4"><SkeletonText width="w-16" height="h-3" /></td>
                      <td className="py-3 px-4"><SkeletonText width="w-16" height="h-3" /></td>
                      <td className="py-3 px-4"><SkeletonText width="w-28" height="h-3" /></td>
                      <td className="py-3 px-4"><SkeletonText width="w-32" height="h-3" /></td>
                      <td className="py-3 px-4"><SkeletonText width={i % 2 === 0 ? "w-28" : "w-24"} height="h-3" /></td>
                      <td className="py-3 px-4"><SkeletonBadge width="w-10" /></td>
                      <td className="py-3 px-4"><SkeletonBadge width="w-16" /></td>
                      <td className="py-3 px-4 text-center"><SkeletonBox width="w-14" height="h-7" rounded="rounded-md" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-slate-200/90 bg-slate-50 flex items-center justify-between mt-auto">
              <SkeletonText width="w-36" height="h-3" />
              <SkeletonBox width="w-32" height="h-7" rounded="rounded-md" />
            </div>
          </div>
        </div>
      ) : viewMode === 'bundles' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 rounded-xl border bg-white border-slate-200/90 flex flex-col justify-between gap-3.5 select-none min-h-[140px] font-sans shadow-3xs">
              <div className="flex items-center justify-between gap-2">
                <SkeletonText width="w-36" height="h-4" />
              </div>
              <div className="flex items-center justify-center gap-1.5 py-1">
                <SkeletonBadge width="w-12" />
                <div className="h-3.5 w-px bg-slate-200 shrink-0" />
                <SkeletonBadge width="w-16" />
                <div className="h-3.5 w-px bg-slate-200 shrink-0" />
                <SkeletonBadge width="w-20" />
              </div>
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 mt-auto">
                <SkeletonCircle size="w-5.5 h-5.5" />
                <SkeletonText width="w-20" height="h-3" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="p-4 rounded-xl border bg-white border-slate-200/90 flex flex-col justify-between gap-3.5 select-none min-h-[140px] font-sans shadow-3xs">
              <div className="flex items-center justify-between gap-2">
                <SkeletonText width="w-32" height="h-4" />
                <SkeletonBadge width="w-16" />
              </div>
              <div className="py-2 px-1 bg-slate-50 rounded-md border border-slate-100 flex items-center">
                <div className="flex-1 flex justify-center"><SkeletonText width="w-16" height="h-3" /></div>
                <div className="w-px h-3.5 bg-slate-200 shrink-0" />
                <div className="flex-1 flex justify-center"><SkeletonText width="w-20" height="h-3" /></div>
              </div>
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 mt-auto">
                <SkeletonCircle size="w-5.5 h-5.5" />
                <SkeletonText width="w-20" height="h-3" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Skeleton presisi untuk GlobalBerandaDashboard — mirror 100% struktur Beranda */
export function GlobalBerandaSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full pb-10 font-sans select-none animate-fadeIn">
      {/* 0. Top Command Toolbar (Date Filter & Actions) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 font-sans">
        <div className="flex items-center gap-2 flex-wrap font-sans">
          {/* Date range picker container */}
          <div className="flex items-center gap-2 bg-white border border-slate-200/90 rounded-md p-1 px-3 shadow-3xs h-10 w-72">
            <SkeletonBox width="w-full" height="h-4" rounded="rounded-md" />
          </div>
          {/* Preset pills */}
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonBox key={i} width="w-24" height="h-8" rounded="rounded-md" />
            ))}
          </div>
        </div>
        {/* Right side buttons */}
        <div className="flex items-center gap-2">
          <SkeletonBox width="w-10" height="h-10" rounded="rounded-md" />
          <SkeletonBox width="w-10" height="h-10" rounded="rounded-md" />
        </div>
      </div>

      {/* 1. Main KPI Stats Grid (6 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 font-sans">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-md p-4 border border-slate-200/90 shadow-3xs flex flex-col justify-between gap-3 min-h-[100px]">
            <div className="flex items-center justify-between">
              <SkeletonText width="w-20" height="h-2.5" />
              <SkeletonCircle size="w-7 h-7" />
            </div>
            <div className="flex flex-col gap-1">
              <SkeletonText width="w-16" height="h-6" />
              <SkeletonText width="w-24" height="h-2" />
            </div>
          </div>
        ))}
      </div>

      {/* 2. Rekomendasi Stats Cards (3 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-md p-4 border border-slate-200/90 shadow-3xs flex items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
              <SkeletonText width="w-28" height="h-3" />
              <SkeletonText width="w-16" height="h-6" />
            </div>
            <SkeletonCircle size="w-10 h-10" />
          </div>
        ))}
      </div>

      {/* 3. Rincian Pemohon Per Jenis Layanan (6 Cards) */}
      <div className="flex flex-col gap-3 font-sans">
        <div className="flex items-center justify-between px-1">
          <SkeletonText width="w-56" height="h-4" />
          <SkeletonBox width="w-8" height="h-8" rounded="rounded-md" />
        </div>
        <div className="bg-white rounded-md p-6 border border-slate-200/90 shadow-3xs">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-slate-50/80 rounded-md p-4 border border-slate-200/70 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <SkeletonText width="w-36" height="h-3" />
                  <SkeletonBadge width="w-12" />
                </div>
                <div className="flex items-baseline gap-2">
                  <SkeletonText width="w-16" height="h-5" />
                  <SkeletonText width="w-20" height="h-2.5" />
                </div>
                <SkeletonProgressBar />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Rekapitulasi Wilayah (Kecamatan / Desa) */}
      <div className="flex flex-col gap-3 font-sans">
        <div className="flex items-center justify-between px-1">
          <SkeletonText width="w-48" height="h-4" />
          <div className="flex items-center gap-2">
            <SkeletonBox width="w-36" height="h-8" rounded="rounded-md" />
            <SkeletonBox width="w-44" height="h-8" rounded="rounded-md" />
          </div>
        </div>
        <div className="bg-white rounded-md p-6 border border-slate-200/90 shadow-3xs flex flex-col gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <SkeletonText width="w-36" height="h-3" />
                <SkeletonText width="w-16" height="h-3" />
              </div>
              <SkeletonProgressBar />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



