"use client";

import React from "react";
import { SkeletonBox, SkeletonText } from "@/components/skeletons/SkeletonBase";

/** Skeleton dasar KPI Strip & Tabs untuk SupervisorWorkspace */
export function SupervisorBaseHeaderSkeleton() {
  return (
    <>
      {/* TIER 1: KPI STATS STRIP (4 Cards) */}
      <div className="bg-white border border-slate-200/90 rounded-md p-1.5 shadow-3xs select-none">
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-3 px-3.5 flex items-center justify-between gap-2 rounded-md">
              <div className="flex flex-col gap-1.5 w-full">
                <SkeletonBox width="w-24" height="h-3" rounded="rounded-sm" />
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

/** Skeleton presisi untuk Tab 1: Antrean Persetujuan */
export function SupervisorQueueSkeleton() {
  return (
    <div className="w-full font-sans select-none flex flex-col gap-4 animate-fadeIn">
      <SupervisorBaseHeaderSkeleton />

      <div className="bg-white border border-slate-200/90 rounded-md p-5 sm:p-6 shadow-3xs flex flex-col gap-6 min-h-[300px]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <SkeletonBox width="w-full md:w-[403px]" height="h-10" rounded="rounded-md" />
          <SkeletonBox width="w-10" height="h-10" rounded="rounded-md" />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBox key={i} width="w-24" height="h-7" rounded="rounded-full" />
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-md border border-slate-200/90 p-4 flex items-center gap-4">
              <SkeletonBox width="w-8" height="h-8" rounded="rounded-md" />
              <div className="flex-1 flex flex-col gap-2">
                <SkeletonText width="w-48" height="h-3" />
                <SkeletonText width="w-32" height="h-2.5" />
              </div>
              <SkeletonBox width="w-20" height="h-7" rounded="rounded-md" />
            </div>
          ))}
        </div>

        <div className="px-5 py-3.5 border border-slate-200/80 bg-slate-50 flex items-center justify-between mt-auto rounded-md">
          <SkeletonText width="w-36" height="h-3" />
          <SkeletonBox width="w-32" height="h-7" rounded="rounded-md" />
        </div>
      </div>
    </div>
  );
}

/** Skeleton presisi untuk Tab 2: Riwayat Keputusan */
export function SupervisorHistorySkeleton() {
  return (
    <div className="w-full font-sans select-none flex flex-col gap-4 animate-fadeIn">
      <SupervisorBaseHeaderSkeleton />

      <div className="bg-white border border-slate-200/90 rounded-md p-5 sm:p-6 shadow-3xs flex flex-col gap-6 min-h-[300px]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <SkeletonBox width="w-full md:w-[403px]" height="h-10" rounded="rounded-md" />
          <SkeletonBox width="w-10" height="h-10" rounded="rounded-md" />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBox key={i} width="w-24" height="h-7" rounded="rounded-full" />
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-md border border-slate-200/90 p-4 flex items-center gap-4">
              <SkeletonBox width="w-8" height="h-8" rounded="rounded-md" />
              <div className="flex-1 flex flex-col gap-2">
                <SkeletonText width="w-48" height="h-3" />
                <SkeletonText width="w-32" height="h-2.5" />
              </div>
              <SkeletonBox width="w-20" height="h-7" rounded="rounded-md" />
            </div>
          ))}
        </div>

        <div className="px-5 py-3.5 border border-slate-200/80 bg-slate-50 flex items-center justify-between mt-auto rounded-md">
          <SkeletonText width="w-36" height="h-3" />
          <SkeletonBox width="w-32" height="h-7" rounded="rounded-md" />
        </div>
      </div>
    </div>
  );
}
