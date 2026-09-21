"use client";

import React from "react";
import { SkeletonBox, SkeletonText } from "@/components/skeletons/SkeletonBase";

/** Base Header & KPI Strip Skeleton for SenderWorkspace */
export function SenderBaseHeaderSkeleton() {
  return (
    <>
      {/* TIER 1: TOP BANNER & SWITCHER TABS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none font-sans">
        <SkeletonBox width="w-44" height="h-6" rounded="rounded-md" />
        <div className="flex items-center gap-2">
          <div className="bg-slate-100/90 border border-slate-200/80 p-1 rounded-md flex items-center gap-1 shadow-2xs">
            <SkeletonBox width="w-36" height="h-7" rounded="rounded-md" />
            <SkeletonBox width="w-32" height="h-7" rounded="rounded-md" />
          </div>
          <SkeletonBox width="w-9" height="h-9" rounded="rounded-md" />
        </div>
      </div>

      {/* TIER 2: 4 KPI CARDS GRID WITH SPARKLINE SKELETON */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-1 select-none font-sans">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-md p-4 border border-slate-100/90 shadow-2xs flex flex-col justify-between h-[110px]">
            <div className="flex flex-col gap-1.5">
              <SkeletonBox width="w-24" height="h-4" rounded="rounded-sm" />
              <SkeletonBox width="w-36" height="h-3" rounded="rounded-sm" />
            </div>
            <div className="flex items-end justify-between gap-2 mt-2">
              <SkeletonBox width="w-16" height="h-7" rounded="rounded-sm" />
              <SkeletonBox width="w-20" height="h-8" rounded="rounded-sm" />
            </div>
          </div>
        ))}
      </div>

      {/* THIN DIVIDER LINE BELOW KPI STRIP */}
      <div className="w-full border-b border-slate-200/80 my-0.5" />
    </>
  );
}

/** Precision Skeleton for Tab 1: Manage Manifest */
export function SenderManifestSkeleton() {
  return (
    <div className="w-full font-sans select-none flex flex-col gap-4 animate-fadeIn">
      <SenderBaseHeaderSkeleton />

      {/* CARD CONTENT: MANIFEST GRID VIEW */}
      <div className="bg-white border border-slate-200/90 rounded-md p-5 sm:p-6 shadow-3xs flex flex-col gap-6 min-h-[300px]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <SkeletonBox width="w-full md:w-[403px]" height="h-10" rounded="rounded-md" />
          <div className="flex items-center gap-2">
            <SkeletonBox width="w-24" height="h-10" rounded="rounded-md" />
            <SkeletonBox width="w-10" height="h-10" rounded="rounded-md" />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBox key={i} width="w-24" height="h-7" rounded="rounded-full" />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="p-4 rounded-md border border-slate-200/90 bg-white flex flex-col justify-between gap-3.5 min-h-[140px]">
              <div className="flex items-center justify-between gap-2">
                <SkeletonBox width="w-28" height="h-3.5" rounded="rounded-sm" />
                <SkeletonBox width="w-14" height="h-4" rounded="rounded-full" />
              </div>
              <SkeletonBox width="w-full" height="h-9" rounded="rounded-md" />
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

/** Precision Skeleton for Tab 2: Manage Shipping */
export function SenderShippingSkeleton() {
  return (
    <div className="w-full font-sans select-none flex flex-col gap-4 animate-fadeIn">
      <SenderBaseHeaderSkeleton />

      <div className="bg-white border border-slate-200/90 rounded-md p-5 sm:p-6 shadow-3xs flex flex-col gap-6 min-h-[500px]">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <SkeletonBox width="w-48" height="h-5" rounded="rounded-sm" />
          <SkeletonBox width="w-32" height="h-9" rounded="rounded-md" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="border border-slate-200/90 rounded-md p-4 flex flex-col gap-4 h-[420px]">
            <SkeletonBox width="w-36" height="h-4" rounded="rounded-sm" />
            <div className="flex flex-col gap-2 pt-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonBox key={i} width="w-full" height="h-16" rounded="rounded-md" />
              ))}
            </div>
          </div>

          <div className="border border-slate-200/90 rounded-md p-4 flex flex-col gap-4 h-[420px]">
            <SkeletonBox width="w-36" height="h-4" rounded="rounded-sm" />
            <div className="flex flex-col gap-2 pt-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonBox key={i} width="w-full" height="h-16" rounded="rounded-md" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { SenderHistorySkeleton } from "./SenderHistorySkeleton";


