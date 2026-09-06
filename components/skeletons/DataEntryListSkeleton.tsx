"use client";

import React from 'react';
import { SkeletonBox, SkeletonText, SkeletonBadge } from '@/components/skeletons/SkeletonBase';

export const DataEntryListSkeleton = () => {
    return (
        <div className="w-full font-sans select-none flex flex-col gap-4 animate-fadeIn">
            <div className="bg-white border border-slate-200/90 rounded-md p-1.5 shadow-3xs mb-1 select-none">
                <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="p-2.5 px-3 flex items-center justify-between gap-2 rounded-md">
                            <div className="flex flex-col gap-1.5 w-full">
                                <SkeletonBox width="w-16" height="h-2.5" rounded="rounded-sm" />
                                <SkeletonBox width="w-10" height="h-4" rounded="rounded-sm" />
                            </div>
                            <SkeletonBox width="w-7" height="h-3.5" rounded="rounded-sm" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-3 border border-slate-200/90 rounded-md bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-3xs">
                <SkeletonBox width="w-full md:w-[403px]" height="h-10" rounded="rounded-lg" />
                <div className="flex items-center gap-2">
                    <SkeletonBox width="w-36" height="h-10" rounded="rounded-lg" />
                    <SkeletonBox width="w-44" height="h-10" rounded="rounded-lg" />
                    <SkeletonBox width="w-10" height="h-10" rounded="rounded-lg" />
                </div>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1">
                {Array.from({ length: 7 }).map((_, i) => (
                    <SkeletonBox key={i} width={i === 0 ? "w-16" : "w-32"} height="h-7" rounded="rounded-md" />
                ))}
            </div>

            <div className="w-full bg-white border border-slate-200/90 rounded-md shadow-xs flex flex-col overflow-hidden min-h-[450px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/90 border-b border-slate-200/90">
                                <th className="py-3 px-4 w-12"><SkeletonText width="w-5" height="h-2.5" /></th>
                                <th className="py-3 px-2 text-center w-10"><SkeletonText width="w-4" height="h-2.5" /></th>
                                <th className="py-3 px-4 min-w-[130px]"><SkeletonText width="w-16" height="h-2.5" /></th>
                                <th className="py-3 px-4 min-w-[110px]"><SkeletonText width="w-16" height="h-2.5" /></th>
                                <th className="py-3 px-4 min-w-[160px]"><SkeletonText width="w-20" height="h-2.5" /></th>
                                <th className="py-3 px-4 min-w-[210px]"><SkeletonText width="w-28" height="h-2.5" /></th>
                                <th className="py-3 px-4 min-w-[150px]"><SkeletonText width="w-20" height="h-2.5" /></th>
                                <th className="py-3 px-4 min-w-[150px]"><SkeletonText width="w-20" height="h-2.5" /></th>
                                <th className="py-3 px-4 min-w-[200px]"><SkeletonText width="w-24" height="h-2.5" /></th>
                                <th className="py-3 px-4 text-center min-w-[130px]"><SkeletonText width="w-12" height="h-2.5" /></th>
                                <th className="py-3 px-4 text-center min-w-[110px]"><SkeletonText width="w-10" height="h-2.5" /></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {Array.from({ length: 10 }).map((_, i) => (
                                <tr key={i}>
                                    <td className="py-3 px-4 text-center"><SkeletonText width="w-4" height="h-3" /></td>
                                    <td className="py-3 px-2 text-center"><SkeletonBox width="w-4" height="h-4" rounded="rounded-full" /></td>
                                    <td className="py-3 px-4"><SkeletonText width="w-20" height="h-3" /></td>
                                    <td className="py-3 px-4"><SkeletonText width="w-20" height="h-3" /></td>
                                    <td className="py-3 px-4"><SkeletonText width="w-28" height="h-3" /></td>
                                    <td className="py-3 px-4"><SkeletonText width="w-36" height="h-3" /></td>
                                    <td className="py-3 px-4"><SkeletonText width={i % 2 === 0 ? "w-28" : "w-32"} height="h-3" /></td>
                                    <td className="py-3 px-4"><SkeletonBadge width="w-20" /></td>
                                    <td className="py-3 px-4"><SkeletonText width="w-28" height="h-3" /></td>
                                    <td className="py-3 px-4 text-center"><SkeletonBadge width="w-16" /></td>
                                    <td className="py-3 px-4 text-center">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <SkeletonBox width="w-7" height="h-7" rounded="rounded-lg" />
                                            <SkeletonBox width="w-7" height="h-7" rounded="rounded-lg" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

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
    )
};