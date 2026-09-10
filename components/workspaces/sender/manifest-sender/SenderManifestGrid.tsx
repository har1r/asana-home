"use client";

import React, { useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { EmptyDataAnimation } from "@/components/workspaces/shared/EmptyDataAnimation";
import { SenderManifestCard } from "./SenderManifestCard";

interface SenderManifestGridProps {
  loading: boolean;
  manifestsList: any[];
  filteredManifests: any[];
  visibleManifests: any[];
  selectedManifest: any | null;
  searchQuery: string;
  hasMore: boolean;
  onLoadMore: () => void;
  onSelectManifest: (manifest: any) => void;
}

export const SenderManifestGrid: React.FC<SenderManifestGridProps> = React.memo(({
  loading,
  manifestsList,
  filteredManifests,
  visibleManifests,
  selectedManifest,
  searchQuery,
  hasMore,
  onLoadMore,
  onSelectManifest,
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
    <div className="flex flex-col gap-4 min-h-[300px] font-sans">
      {/* Manifest Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
        {loading && manifestsList.length === 0 ? (
          <div className="col-span-full py-20 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-[#00a389]" />
            <span className="text-[13px] font-normal text-slate-500 font-sans">Memuat data...</span>
          </div>
        ) : filteredManifests.length === 0 ? (
          <div className="col-span-full py-10 text-center select-none font-sans">
            <EmptyDataAnimation
              title={searchQuery ? "Hasil Pencarian Tidak Ditemukan" : "Belum Ada Manifest"}
              description={
                searchQuery
                  ? "Tidak ada manifest yang sesuai dengan kata kunci pencarian."
                  : "Daftar manifest pengiriman kosong saat ini."
              }
            />
          </div>
        ) : (
          visibleManifests.map((m) => (
            <SenderManifestCard
              key={m.id}
              manifest={m}
              isSelected={selectedManifest?.id === m.id}
              searchQuery={searchQuery}
              onSelect={onSelectManifest}
            />
          ))
        )}
      </div>

      {/* Infinite Scroll Sentinel & Footer Indicator (PERSIS RESEARCHER) */}
      {filteredManifests.length > 0 && (
        <div
          ref={loadMoreRef}
          className="py-3 flex flex-col items-center justify-center gap-1 mt-2 text-xs text-slate-400 font-sans border-t border-slate-200/60 select-none"
        >
          {hasMore ? (
            <div className="flex items-center gap-2 text-slate-500 font-normal">
              <Loader2 className="w-4 h-4 animate-spin text-[#00a389]" />
              <span>Memuat manifest lainnya...</span>
            </div>
          ) : (
            <span className="text-slate-400 text-[11px] font-normal font-sans">
              Menampilkan seluruh {filteredManifests.length} Manifest
            </span>
          )}
        </div>
      )}
    </div>
  );
});

SenderManifestGrid.displayName = "SenderManifestGrid";
