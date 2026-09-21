"use client";

import React from "react";
import { SkeletonBox, SkeletonText, SkeletonBadge } from "@/components/skeletons/SkeletonBase";

/** Precision Skeleton for Sender History Page (?tab=history or ?tab=sender-history) */
export const SenderHistorySkeleton = () => {
  return (
    <div className="w-full flex flex-col gap-4 animate-fadeIn font-sans select-none">
      {/* 1. Header Section Skeleton */}
      <div className="flex items-center justify-between py-1">
        <SkeletonText width="w-48" height="h-6" />
      </div>

      {/* 2. Toolbar Skeleton: Search Bar & Refresh Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SkeletonBox width="w-full sm:w-80 md:w-96" height="h-9" rounded="rounded-md" />
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <SkeletonBox width="w-9" height="h-9" rounded="rounded-md" />
        </div>
      </div>

      {/* 3. 4-Column Grid Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 mt-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-xl border border-slate-200/90 bg-white shadow-3xs flex flex-col justify-between gap-4 min-h-[160px]"
          >
            {/* Card Header: Manifest Number & Status Badge */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <SkeletonBox width="w-28" height="h-4" rounded="rounded-sm" />
              <SkeletonBadge width="w-16" />
            </div>

            {/* Card Body: Info Items */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <SkeletonText width="w-20" height="h-3" />
                <SkeletonText width="w-24" height="h-3" />
              </div>
              <div className="flex items-center justify-between">
                <SkeletonText width="w-24" height="h-3" />
                <SkeletonText width="w-16" height="h-3" />
              </div>
              <div className="flex items-center justify-between">
                <SkeletonText width="w-16" height="h-3" />
                <SkeletonText width="w-12" height="h-3" />
              </div>
            </div>

            {/* Card Footer: Action Button */}
            <div className="pt-2 border-t border-slate-100">
              <SkeletonBox width="w-full" height="h-8" rounded="rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SenderHistorySkeleton;
