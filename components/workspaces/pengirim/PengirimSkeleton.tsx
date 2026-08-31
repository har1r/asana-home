"use client";

import React from "react";
import { SkeletonBox, SkeletonText } from "@/components/skeletons/SkeletonBase";

/** Skeleton dasar KPI Strip & Tabs untuk PengirimWorkspace */
export function PengirimBaseHeaderSkeleton() {
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

/** Skeleton presisi untuk Tab 1: Daftar Manifest */
export function PengirimManifestSkeleton() {
  return (
    <div className="w-full font-sans select-none flex flex-col gap-4 animate-fadeIn">
      <PengirimBaseHeaderSkeleton />

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

/** Skeleton presisi untuk Tab 2: Kelola Pengiriman */
export function PengirimKelolaSkeleton() {
  return (
    <div className="w-full font-sans select-none flex flex-col gap-4 animate-fadeIn">
      <PengirimBaseHeaderSkeleton />

      <div className="bg-white border border-slate-200/90 rounded-md p-5 sm:p-6 shadow-3xs flex flex-col gap-6 min-h-[500px]">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <SkeletonBox width="w-48" height="h-5" rounded="rounded-sm" />
          <SkeletonBox width="w-32" height="h-9" rounded="rounded-md" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 border border-slate-200/90 rounded-md p-4 flex flex-col gap-4">
            <SkeletonBox width="w-36" height="h-4" rounded="rounded-sm" />
            <SkeletonBox width="w-full" height="h-10" rounded="rounded-md" />
            <div className="flex flex-col gap-2 pt-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonBox key={i} width="w-full" height="h-14" rounded="rounded-md" />
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 border border-slate-200/90 rounded-md p-4 flex flex-col gap-4">
            <SkeletonBox width="w-48" height="h-4" rounded="rounded-sm" />
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonBox key={i} width="w-full" height="h-20" rounded="rounded-md" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
