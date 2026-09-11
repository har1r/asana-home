"use client";

import React from 'react';
import { SkeletonBox, SkeletonText, SkeletonBadge } from '@/components/skeletons/SkeletonBase';

export const DataEntryHistorySkeleton = () => {
    return (
        <div className="w-full flex flex-col gap-3 animate-fadeIn font-sans select-none">
            {/* 1. Header Section Skeleton */}
            <div className="flex items-center justify-between gap-4 py-1">
                <SkeletonText width="w-40" height="h-6" />
                <SkeletonBox width="w-24" height="h-9" rounded="rounded-md" />
            </div>

            {/* 2. Toolbar: Search Bar & Display/View Mode Switchers */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Search Bar Skeleton */}
                <SkeletonBox width="w-full sm:w-80 md:w-96" height="h-9" rounded="rounded-md" />

                {/* Switchers Skeleton */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <SkeletonBox width="w-44" height="h-9" rounded="rounded-md" />
                    <SkeletonBox width="w-20" height="h-9" rounded="rounded-md" />
                </div>
            </div>

            {/* 3. Table Skeleton (Google Drive List View Style) */}
            <div className="w-full overflow-x-auto select-none mt-1">
                <table className="w-full text-left border-collapse font-sans">
                    <thead>
                        <tr className="border-b border-slate-200">
                            <th className="py-2.5 px-3 min-w-[200px]"><SkeletonText width="w-28" height="h-3" /></th>
                            <th className="py-2.5 px-3 min-w-[140px]"><SkeletonText width="w-24" height="h-3" /></th>
                            <th className="py-2.5 px-3 min-w-[140px]"><SkeletonText width="w-20" height="h-3" /></th>
                            <th className="py-2.5 px-3 min-w-[180px]"><SkeletonText width="w-24" height="h-3" /></th>
                            <th className="py-2.5 px-3 min-w-[130px]"><SkeletonText width="w-16" height="h-3" /></th>
                            <th className="py-2.5 px-3 w-12 text-center"><SkeletonText width="w-4" height="h-3" /></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/80">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <tr key={i}>
                                {/* No. Permohonan Column */}
                                <td className="py-3 px-3">
                                    <div className="flex items-center gap-3">
                                        <SkeletonBox width="w-5" height="h-5" rounded="rounded" />
                                        <SkeletonText width="w-28" height="h-3.5" />
                                    </div>
                                </td>

                                {/* Tgl. Permohonan Column */}
                                <td className="py-3 px-3">
                                    <SkeletonText width="w-20" height="h-3" />
                                </td>

                                {/* Tgl. Selesai Column */}
                                <td className="py-3 px-3">
                                    <SkeletonText width="w-20" height="h-3" />
                                </td>

                                {/* Nama Pemohon Column */}
                                <td className="py-3 px-3">
                                    <SkeletonText width={i % 2 === 0 ? "w-28" : "w-36"} height="h-3.5" />
                                </td>

                                {/* Status Column */}
                                <td className="py-3 px-3">
                                    <SkeletonBadge width="w-20" />
                                </td>

                                {/* Action Column */}
                                <td className="py-3 px-3 text-center">
                                    <SkeletonBox width="w-6" height="h-6" rounded="rounded-full" className="mx-auto" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
