"use client";

import React, { useMemo } from "react";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { EmptyDataAnimation } from "@/components/workspaces/shared/EmptyDataAnimation";
import { ArchivistBundleCard } from "./ArchivistBundleCard";

export interface ArchivistBundleGridProps {
  bundlesList: any[];
  filteredBundlesList: any[];
  selectedBundle: any | null;
  loading: boolean;
  searchBundleQuery: string;
  currentBundlePage: number;
  itemsPerBundlePage: number;
  onSelectBundle: (bundle: any) => void;
  onPageChange: (page: number) => void;
  bundleHasReupload: (bundle: any) => boolean;
  onOpenVersionDrawer?: (bundle: any) => void;
}

export const ArchivistBundleGrid: React.FC<ArchivistBundleGridProps> = React.memo(
  ({
    bundlesList,
    filteredBundlesList,
    selectedBundle,
    loading,
    searchBundleQuery,
    currentBundlePage,
    itemsPerBundlePage,
    onSelectBundle,
    onPageChange,
    bundleHasReupload,
    onOpenVersionDrawer,
  }) => {
    const totalBundlePages = Math.ceil(filteredBundlesList.length / itemsPerBundlePage) || 1;
    const activeBundlePage = currentBundlePage > totalBundlePages ? 1 : currentBundlePage;

    const paginatedBundlesList = useMemo(() => {
      return filteredBundlesList.slice(
        (activeBundlePage - 1) * itemsPerBundlePage,
        activeBundlePage * itemsPerBundlePage
      );
    }, [filteredBundlesList, activeBundlePage, itemsPerBundlePage]);

    return (
      <div className="flex flex-col gap-4 min-h-[300px] font-sans select-none">
        {/* Bundle Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading ? (
            <div className="col-span-full py-20 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-[#00a389]" />
              <span className="text-[13px] font-normal text-slate-500 font-sans">Memuat data...</span>
            </div>
          ) : paginatedBundlesList.length === 0 ? (
            <div className="col-span-full py-10 text-center select-none font-sans">
              <EmptyDataAnimation
                title={searchBundleQuery ? "Hasil Pencarian Tidak Ditemukan" : "Belum Ada Bundle"}
                description={
                  searchBundleQuery
                    ? "Tidak ada bundle yang sesuai dengan kata kunci pencarian."
                    : "Daftar bundle digitalisasi kosong saat ini."
                }
              />
            </div>
          ) : (
            paginatedBundlesList.map((b) => (
              <ArchivistBundleCard
                key={b.id}
                bundle={b}
                isSelected={selectedBundle?.id === b.id}
                hasReupload={bundleHasReupload(b)}
                onSelect={onSelectBundle}
                onOpenVersionDrawer={onOpenVersionDrawer}
              />
            ))
          )}
        </div>

        {/* Pagination Footer */}
        {totalBundlePages > 1 && (
          <div className="px-5 py-3.5 border border-slate-200/80 bg-slate-50 flex items-center justify-between mt-auto rounded-md shadow-3xs">
            <span className="text-[11px] font-semibold text-slate-500 font-sans">
              Menampilkan {((activeBundlePage - 1) * itemsPerBundlePage) + 1}–
              {Math.min(activeBundlePage * itemsPerBundlePage, filteredBundlesList.length)} dari{" "}
              {filteredBundlesList.length} Bundle
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => onPageChange(Math.max(activeBundlePage - 1, 1))}
                disabled={activeBundlePage === 1}
                className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-all cursor-pointer shadow-3xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {Array.from({ length: totalBundlePages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`w-7 h-7 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    activeBundlePage === page
                      ? "bg-[#00a389] text-white shadow-3xs scale-105"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 shadow-3xs"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => onPageChange(Math.min(activeBundlePage + 1, totalBundlePages))}
                disabled={activeBundlePage === totalBundlePages}
                className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-all cursor-pointer shadow-3xs"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
);

ArchivistBundleGrid.displayName = "ArchivistBundleGrid";
