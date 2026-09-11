"use client";

import React from "react";
import { SkeletonBox, SkeletonText } from "@/components/skeletons/SkeletonBase";

/** Skeleton dasar Header & KPI Strip untuk PemantauWorkspace */
export function PemantauBaseHeaderSkeleton() {
  return (
    <>
      {/* TIER 1: TOP BANNER & SWITCHER TABS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none font-sans">
        <SkeletonBox width="w-44" height="h-6" rounded="rounded-md" />
        <div className="flex items-center gap-2">
          <div className="bg-slate-100/90 border border-slate-200/80 p-1 rounded-md flex items-center gap-1 shadow-2xs">
            <SkeletonBox width="w-44" height="h-7" rounded="rounded-md" />
            <SkeletonBox width="w-40" height="h-7" rounded="rounded-md" />
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

/** Skeleton presisi untuk Tab 1: Daftar Bundle */
export function PemantauBundleSkeleton() {
  return (
    <div className="w-full font-sans select-none flex flex-col gap-4 animate-fadeIn">
      <PemantauBaseHeaderSkeleton />

      {/* Toolbar Skeleton */}
      <div className="flex flex-col gap-3 font-sans">
        <div className="flex items-center justify-between gap-3">
          <SkeletonBox width="w-full md:w-[403px]" height="h-10" rounded="rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <SkeletonBox width="w-16" height="h-7" rounded="rounded-md" />
          <SkeletonBox width="w-28" height="h-7" rounded="rounded-md" />
          <SkeletonBox width="w-28" height="h-7" rounded="rounded-md" />
        </div>
      </div>

      {/* Main Grid Skeleton Cards */}
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
      </div>
    </div>
  );
}

/** Skeleton presisi untuk Tab 2: Selesaikan Permohonan (Daftar Pantau) */
export function PemantauPantauSkeleton() {
  return (
    <div className="w-full font-sans select-none flex flex-col gap-4 animate-fadeIn">
      <PemantauBaseHeaderSkeleton />

      <div className="bg-white border border-slate-200/90 rounded-md p-5 sm:p-6 shadow-3xs flex flex-col gap-4 min-h-[500px]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <SkeletonBox width="w-48" height="h-5" rounded="rounded-sm" />
          <SkeletonBox width="w-9" height="h-9" rounded="rounded-md" />
        </div>

        <div className="flex flex-col items-start gap-5 w-full">
          <div className="w-full border border-slate-200/90 rounded-md p-4 flex flex-col gap-3">
            <SkeletonBox width="w-36" height="h-4" rounded="rounded-sm" />
            <div className="flex flex-col gap-2 pt-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonBox key={i} width="w-full" height="h-16" rounded="rounded-md" />
              ))}
            </div>
          </div>

          <div className="w-full border border-slate-200/90 rounded-md p-5 flex flex-col gap-5">
            <SkeletonBox width="w-64" height="h-5" rounded="rounded-sm" />
            <SkeletonBox width="w-full" height="h-36" rounded="rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
