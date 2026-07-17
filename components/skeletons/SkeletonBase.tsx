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

/** Skeleton untuk RecentTasksCard — header + 10 item list */
export function RecentTasksCardSkeleton() {
  return (
    <div className="w-full flex flex-col font-sans select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-[10px] border-b-2 border-gray-200/90 mb-3">
        <SkeletonBox width="w-40" height="h-4" rounded="rounded-full" />
        <div className="flex items-center gap-3.5">
          <SkeletonBox width="w-20" height="h-3" rounded="rounded-full" />
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

      {/* Item rows */}
      <div className="flex flex-col gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between pb-1.5 pt-1.5 border-b border-[#eceff1]"
          >
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-gray-200 animate-pulse shrink-0" />
              <div className="flex flex-col gap-1.5 min-w-0">
                <SkeletonText width={i % 2 === 0 ? 'w-40' : 'w-32'} height="h-3" />
                <SkeletonText width="w-24" height="h-2" />
              </div>
            </div>
            <div className="shrink-0 pl-2">
              <SkeletonAvatarStack count={1} size="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Skeleton untuk MessageTeamCard — header + 3 chat bubble + input bar */
export function MessageTeamCardSkeleton() {
  return (
    <div className="w-full flex flex-col font-sans select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-[10px] border-b-2 border-gray-200/90 mb-3">
        <SkeletonBox width="w-28" height="h-4" rounded="rounded-full" />
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

      {/* Team dropdown row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <SkeletonBox width="w-32" height="h-4" rounded="rounded-full" />
          <div className="w-4 h-4 bg-gray-200 animate-pulse rounded" />
        </div>
        <SkeletonBox width="w-24" height="h-3" rounded="rounded-full" />
      </div>

      {/* Chat bubble area */}
      <div className="flex flex-col gap-3.5 min-h-[140px] mb-3">
        <div className="flex gap-2 items-start">
          <SkeletonCircle size="w-7 h-7" />
          <div className="flex flex-col gap-1.5 max-w-[75%]">
            <SkeletonText width="w-48" height="h-3.5" />
            <SkeletonText width="w-32" height="h-3" />
          </div>
        </div>
        <div className="flex gap-2 items-start flex-row-reverse">
          <SkeletonCircle size="w-7 h-7" />
          <div className="flex flex-col gap-1.5 items-end max-w-[75%]">
            <SkeletonText width="w-56" height="h-3.5" />
            <SkeletonText width="w-28" height="h-3" />
          </div>
        </div>
        <div className="flex gap-2 items-start">
          <SkeletonCircle size="w-7 h-7" />
          <div className="flex flex-col gap-1.5 max-w-[55%]">
            <SkeletonText width="w-24" height="h-3.5" />
          </div>
        </div>
      </div>

      {/* Input bar */}
      <div className="border border-gray-200/80 rounded-xl p-3 flex items-center gap-2.5 bg-white">
        <SkeletonBox width="flex-1" height="h-4" rounded="rounded-full" className="flex-1" />
        <div className="w-8 h-8 bg-gray-200 animate-pulse rounded-lg shrink-0" />
      </div>
    </div>
  );
}

/** Skeleton untuk CalendarCard — grid 7-col kalender + panel agenda */
export function CalendarCardSkeleton() {
  return (
    <div className="w-full flex flex-col font-sans select-none animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-[10px] border-b-2 border-gray-200/90 mb-6 gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gray-200 animate-pulse" />
          <div className="flex flex-col gap-1.5">
            <SkeletonBox width="w-28" height="h-4" rounded="rounded-full" />
            <SkeletonText width="w-44" height="h-2.5" />
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="h-7 w-16 bg-gray-200 animate-pulse rounded-lg" />
          <div className="h-7 w-36 bg-gray-200 animate-pulse rounded-lg" />
        </div>
      </div>

      {/* Calendar grid + right panel */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        {/* Left: Calendar grid */}
        <div className="md:col-span-7 flex flex-col">
          {/* Day name headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((d) => (
              <div key={d} className="h-4 bg-gray-100 animate-pulse rounded-full mx-1" />
            ))}
          </div>
          {/* Day cells: 6 rows × 7 cols = 42 cells */}
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: 42 }).map((_, i) => (
              <div
                key={i}
                className={`aspect-square rounded-xl animate-pulse ${
                  i >= 7 && i < 35 ? 'bg-gray-200' : 'bg-gray-100'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Right: Agenda panel */}
        <div className="md:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col gap-4 shadow-3xs">
          {/* Panel header */}
          <div className="border-b border-slate-200/60 pb-3">
            <SkeletonText width="w-16" height="h-2.5" />
            <SkeletonBox width="w-36" height="h-4" rounded="rounded-full" className="mt-1.5" />
          </div>

          {/* Note items */}
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border rounded-xl p-3 flex flex-col gap-2 border-slate-200/60 bg-slate-50/50">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse mt-1 shrink-0" />
                  <div className="flex flex-col gap-1.5 flex-1">
                    <SkeletonText width={i % 2 === 0 ? 'w-full' : 'w-3/4'} height="h-3" />
                    <SkeletonText width="w-16" height="h-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add note button */}
          <div className="h-8 bg-indigo-50/60 animate-pulse rounded-xl border border-indigo-100" />
        </div>
      </div>
    </div>
  );
}

