"use client";

import React from "react";
import { SkeletonBox, SkeletonText, SkeletonBadge } from "@/components/skeletons/SkeletonBase";

/** Skeleton komponen dasar KPI Strip & Tabs untuk PengarsipWorkspace */
export function PengarsipBaseHeaderSkeleton() {
  return (
    <>
      {/* TIER 1: KPI STATS STRIP (4 Cards) */}
      <div className="bg-white border border-slate-200/90 rounded-md p-1.5 shadow-3xs select-none">
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          {Array.from({ length: 4 }).map((_, i) => (
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

      {/* TIER 2: VIEW MODE SWITCHER TABS (2 Equal Tabs) */}
      <div className="bg-slate-100/90 border border-slate-200/80 p-1 rounded-md grid grid-cols-2 gap-1 shadow-3xs select-none">
        <SkeletonBox width="w-full" height="h-8" rounded="rounded-md" />
        <SkeletonBox width="w-full" height="h-8" rounded="rounded-md" />
      </div>
    </>
  );
}

/** Skeleton presisi untuk Tab 1: Daftar Bundle */
export function PengarsipBundleSkeleton() {
  return (
    <div className="w-full font-sans select-none flex flex-col gap-4 animate-fadeIn">
      <PengarsipBaseHeaderSkeleton />

      {/* CARD CONTENT: BUNDLE GRID VIEW */}
      <div className="bg-white border border-slate-200/90 rounded-md p-5 sm:p-6 shadow-3xs flex flex-col gap-6 min-h-[300px]">
        {/* Action toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <SkeletonBox width="w-full md:w-[403px]" height="h-10" rounded="rounded-lg" />
          <div className="flex items-center gap-2">
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

/** Skeleton presisi untuk Tab 2: Daftar Berkas Arsip */
export function PengarsipArsipSkeleton() {
  return (
    <div className="w-full font-sans select-none flex flex-col gap-4 animate-fadeIn">
      <PengarsipBaseHeaderSkeleton />

      {/* CARD CONTENT: ARSIP TABLE VIEW */}
      <div className="bg-white border border-slate-200/90 rounded-md shadow-3xs flex flex-col overflow-hidden min-h-[400px]">
        {/* Action Toolbar */}
        <div className="p-3 border-b border-slate-200/80 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-3xs">
          <SkeletonBox width="w-full md:w-[403px]" height="h-10" rounded="rounded-lg" />
          <div className="flex items-center gap-2">
            <SkeletonBox width="w-28" height="h-10" rounded="rounded-lg" />
            <SkeletonBox width="w-10" height="h-10" rounded="rounded-lg" />
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
