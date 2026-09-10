"use client";

import React, { useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { EmptyDataAnimation } from "@/components/workspaces/shared/EmptyDataAnimation";
import { MonitorBundleCard } from "./MonitorBundleCard";

interface MonitorBundleGridProps {
  loading: boolean;
  uniqueBundlesList: any[];
  filteredBundlesList: any[];
  visibleBundles: any[];
  selectedBundle: any | null;
  searchQuery: string;
  hasMore: boolean;
  onLoadMore: () => void;
  onSelectBundle: (bundle: any) => void;
}

export const MonitorBundleGrid: React.FC<MonitorBundleGridProps> = React.memo(({
  loading,
  uniqueBundlesList,
  filteredBundlesList,
  visibleBundles,
  selectedBundle,
  searchQuery,
  hasMore,
  onLoadMore,
  onSelectBundle,
}) => {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Infinite Scroll IntersectionObserver Sentinel
  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, onLoadMore]);

  return (
    <div className="bg-white border border-slate-200/90 rounded-md p-5 sm:p-6 shadow-3xs flex flex-col gap-6 min-h-[300px] font-sans">
      {/* Bundle Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
        {loading && uniqueBundlesList.length === 0 ? (
          <div className="col-span-full py-20 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-[#00a389]" />
            <span className="text-[13px] font-normal text-slate-500 font-sans">Memuat data...</span>
          </div>
        ) : filteredBundlesList.length === 0 ? (
          <div className="col-span-full py-8 font-sans">
            <EmptyDataAnimation
              title={searchQuery ? "Hasil Pencarian Tidak Ditemukan" : "Belum Ada Bundle"}
              description={
                searchQuery
                  ? "Tidak ada bundle yang sesuai dengan kriteria pencarian."
                  : "Tidak ada bundle aktif dalam antrean pemantauan."
              }
            />
          </div>
        ) : (
          visibleBundles.map((b) => (
            <MonitorBundleCard
              key={b.id}
              bundle={b}
              isSelected={selectedBundle?.id === b.id}
              onSelect={onSelectBundle}
            />
          ))
        )}
      </div>

      {/* Infinite Scroll Sentinel & Footer Indicator (PERSIS RESEARCHER & SENDER) */}
      {filteredBundlesList.length > 0 && (
        <div
          ref={loadMoreRef}
          className="py-3 flex flex-col items-center justify-center gap-1 mt-2 text-xs text-slate-400 font-sans border-t border-slate-200/60 select-none"
        >
          {hasMore ? (
            <div className="flex items-center gap-2 text-slate-500 font-normal">
              <Loader2 className="w-4 h-4 animate-spin text-[#00a389]" />
              <span>Memuat bundle lainnya...</span>
            </div>
          ) : (
            <span className="text-slate-400 text-[11px] font-normal font-sans">
              Menampilkan seluruh {filteredBundlesList.length} Bundle
            </span>
          )}
        </div>
      )}
    </div>
  );
});

MonitorBundleGrid.displayName = "MonitorBundleGrid";
