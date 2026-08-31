"use client";

import React from "react";
import { SkeletonBox, SkeletonText } from "@/components/skeletons/SkeletonBase";

/** Skeleton dasar KPI Strip & Tabs untuk PemantauWorkspace */
export function PemantauBaseHeaderSkeleton() {
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
export function PemantauBundleSkeleton() {
  return (
    <div className="w-full font-sans select-none flex flex-col gap-4 animate-fadeIn">
      <PemantauBaseHeaderSkeleton />

      {/* Toolbar Skeleton */}
      <div className="bg-[#f8fafc] border border-slate-200/80 p-3 rounded-md shadow-3xs flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-3">
          <SkeletonBox width="w-full md:w-[403px]" height="h-10" rounded="rounded-md" />
          <SkeletonBox width="w-10" height="h-10" rounded="rounded-md" />
        </div>
        <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60">
          <SkeletonBox width="w-16" height="h-7" rounded="rounded-md" />
          <SkeletonBox width="w-28" height="h-7" rounded="rounded-md" />
          <SkeletonBox width="w-28" height="h-7" rounded="rounded-md" />
        </div>
      </div>

      {/* Main Grid Skeleton Card */}
      <div className="bg-white border border-slate-200/90 rounded-md p-5 sm:p-6 shadow-3xs flex flex-col gap-6 min-h-[300px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="p-4 rounded-md border border-slate-200/90 bg-white flex flex-col justify-between gap-3.5 min-h-[140px]">
              <div className="flex items-center justify-between gap-2">
                <SkeletonBox width="w-28" height="h-3.5" rounded="rounded-sm" />
                <SkeletonBox width="w-6" height="h-6" rounded="rounded-md" />
              </div>
              <SkeletonBox width="w-full" height="h-8" rounded="rounded-md" />
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <SkeletonBox width="w-24" height="h-3" rounded="rounded-sm" />
                <SkeletonBox width="w-16" height="h-3" rounded="rounded-sm" />
              </div>
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

/** Skeleton presisi untuk Tab 2: Daftar Pantau */
export function PemantauPantauSkeleton() {
  return (
    <div className="w-full font-sans select-none flex flex-col gap-4 animate-fadeIn">
      <PemantauBaseHeaderSkeleton />

      <div className="bg-white border border-slate-200/90 rounded-md p-5 sm:p-6 shadow-3xs flex flex-col gap-4 min-h-[500px]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <SkeletonBox width="w-48" height="h-5" rounded="rounded-sm" />
          <SkeletonBox width="w-32" height="h-9" rounded="rounded-md" />
        </div>

        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonBox key={i} width="w-full" height="h-16" rounded="rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
}
