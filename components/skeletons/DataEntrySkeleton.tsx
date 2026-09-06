"use client"

import { SkeletonBox, SkeletonText } from '@/components/skeletons/SkeletonBase'
export const DataEntrySkeleton = () => {
    return (
        <div className="w-full bg-white rounded-lg border border-slate-200/90 shadow-xs flex flex-col overflow-hidden animate-fadeIn select-none">
            <div className="px-6 py-3.5 border-b border-slate-200/80 bg-white flex items-center justify-between">
                <SkeletonBox width="w-24" height="h-10" rounded="rounded-md" />
                <SkeletonBox width="w-32" height="h-4" rounded="rounded-full" />
            </div>

            <div className="border-b border-slate-200/80 bg-slate-50/80 px-6 py-3">
                <div className="flex items-center justify-between gap-2 max-w-2xl mx-auto">
                    <SkeletonBox width="w-28" height="h-8" rounded="rounded-md" />
                    <div className="flex-1 h-0.5 bg-slate-200" />
                    <SkeletonBox width="w-32" height="h-8" rounded="rounded-md" />
                    <div className="flex-1 h-0.5 bg-slate-200" />
                    <SkeletonBox width="w-28" height="h-8" rounded="rounded-md" />
                </div>
            </div>

            <div className="p-6 flex flex-col gap-6 max-w-3xl mx-auto w-full">
                <div className="flex flex-col gap-4 p-5 rounded-2xl bg-slate-50">
                    <SkeletonText width="w-48" height="h-4" />
                    <div className="flex flex-col gap-4 pt-2">
                        <div className="flex flex-col gap-2">
                            <SkeletonText width="w-36" height="h-3" />
                            <SkeletonBox width="w-full" height="h-10" rounded="rounded-xl" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <SkeletonText width="w-28" height="h-3" />
                                <SkeletonBox width="w-full" height="h-10" rounded="rounded-xl" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <SkeletonText width="w-32" height="h-3" />
                                <SkeletonBox width="w-full" height="h-10" rounded="rounded-xl" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <SkeletonText width="w-36" height="h-3" />
                                <SkeletonBox width="w-full" height="h-10" rounded="rounded-xl" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <SkeletonText width="w-24" height="h-3" />
                                <SkeletonBox width="w-full" height="h-10" rounded="rounded-xl" />
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <SkeletonText width="w-32" height="h-3" />
                            <SkeletonBox width="w-full" height="h-10" rounded="rounded-xl" />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                    <SkeletonBox width="w-20" height="h-10" rounded="rounded-md" />
                    <SkeletonBox width="w-28" height="h-10" rounded="rounded-md" />
                </div>
            </div>
        </div>
    )
}

