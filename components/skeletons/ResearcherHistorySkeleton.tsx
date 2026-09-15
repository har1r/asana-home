"use client";

import React from 'react';
import { SkeletonBox, SkeletonText, SkeletonBadge } from '@/components/skeletons/SkeletonBase';

export const ResearcherHistorySkeleton = () => {
    return (
        <div className="w-full flex flex-col gap-3 animate-fadeIn font-sans select-none">
            {/* 1. Header Section Skeleton (Title, View Mode Switcher, Refresh Button & Smooth Divider) */}
            <div className="flex flex-col gap-2 select-none">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-1">
                    <SkeletonText width="w-36" height="h-6" />

                    <div className="flex items-center gap-2 shrink-0">
                        {/* View Mode Toggle Switcher Skeleton (List vs Grid) */}
                        <div className="flex items-center bg-white border border-slate-200/90 rounded-md p-0.5 shadow-3xs shrink-0 h-9 gap-0.5">
                            <SkeletonBox width="w-8" height="h-8" rounded="rounded-md" />
                            <SkeletonBox width="w-8" height="h-8" rounded="rounded-md" />
                        </div>

                        {/* Refresh Button Skeleton */}
                        <SkeletonBox width="w-9" height="h-9" rounded="rounded-md" />
                    </div>
                </div>

                {/* Thin Divider Line */}
                <div className="w-full border-b border-slate-200/80 my-0.5" />
            </div>

            {/* 2. Toolbar Skeleton: Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none mt-1">
                <SkeletonBox width="w-full sm:w-80 md:w-96" height="h-9" rounded="rounded-md" />
            </div>

            {/* 3. Table Skeleton (Google Drive List View Style matching ResearcherHistory) */}
            <div className="w-full overflow-x-auto select-none mt-1">
                <table className="w-full text-left border-collapse font-sans">
                    <thead>
                        <tr className="border-b border-slate-200 text-[13px] font-normal text-slate-600 select-none">
                            <th className="py-2.5 px-3 min-w-[200px]"><SkeletonText width="w-28" height="h-3" /></th>
                            <th className="py-2.5 px-3 min-w-[130px] text-center"><SkeletonText width="w-24" height="h-3" className="mx-auto" /></th>
                            <th className="py-2.5 px-3 min-w-[140px]"><SkeletonText width="w-24" height="h-3" /></th>
                            <th className="py-2.5 px-3 min-w-[160px]"><SkeletonText width="w-24" height="h-3" /></th>
                            <th className="py-2.5 px-3 min-w-[130px]"><SkeletonText width="w-16" height="h-3" /></th>
                            <th className="py-2.5 px-3 w-12 text-center"><SkeletonText width="w-4" height="h-3" className="mx-auto" /></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/80 text-[13px]">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <tr key={i}>
                                {/* Nomor Bundle Column (Spreadsheet Icon Box + Bundle Number Text) */}
                                <td className="py-3 px-3">
                                    <div className="flex items-center gap-3">
                                        <SkeletonBox width="w-5" height="h-5" rounded="rounded" />
                                        <SkeletonText width={i % 3 === 0 ? "w-36" : i % 2 === 0 ? "w-32" : "w-40"} height="h-3.5" />
                                    </div>
                                </td>

                                {/* Jenis Permohonan Badge Column (Center Aligned) */}
                                <td className="py-3 px-3 text-center">
                                    <div className="flex items-center justify-center">
                                        <SkeletonBadge width={i % 2 === 0 ? "w-16" : "w-20"} className="mx-auto" />
                                    </div>
                                </td>

                                {/* Tanggal Dibuat Column */}
                                <td className="py-3 px-3">
                                    <SkeletonText width="w-20" height="h-3" />
                                </td>

                                {/* Nama Pembuat Column */}
                                <td className="py-3 px-3">
                                    <SkeletonText width={i % 2 === 0 ? "w-28" : "w-36"} height="h-3.5" />
                                </td>

                                {/* Status Bundle Column */}
                                <td className="py-3 px-3">
                                    <div className="flex items-center">
                                        <SkeletonBadge width={i % 2 === 0 ? "w-20" : "w-16"} />
                                    </div>
                                </td>

                                {/* Action Column (Three Dots Icon Button) */}
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
