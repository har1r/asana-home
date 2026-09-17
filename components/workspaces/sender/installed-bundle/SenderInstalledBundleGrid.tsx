"use client";

import React, { useState, useMemo } from "react";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { EmptyDataAnimation } from "@/components/workspaces/shared/EmptyDataAnimation";
import { SenderInstalledBundleCard } from "./SenderInstalledBundleCard";

export interface SenderInstalledBundleGridProps {
  loading: boolean;
  installedBundles: any[];
  selectedBundleInManifest: any | null;
  manifestStatus: string;
  searchQuery?: string;
  onSelectBundle: (bundle: any) => void;
  onRemoveBundle?: (bundleId: string) => void;
  onOpenVersionDrawer: (bundle: any) => void;
}

export const SenderInstalledBundleGrid: React.FC<SenderInstalledBundleGridProps> = React.memo(({
  loading,
  installedBundles = [],
  selectedBundleInManifest,
  manifestStatus = "DRAFT",
  searchQuery = "",
  onSelectBundle,
  onRemoveBundle,
  onOpenVersionDrawer,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  const filteredBundles = useMemo(() => {
    if (!searchQuery || !searchQuery.trim()) return installedBundles;
    const q = searchQuery.toLowerCase().trim();
    return installedBundles.filter((b) => {
      const bNo = (b.bundleNumber || b.nomorBundle || "").toLowerCase();
      return bNo.includes(q);
    });
  }, [installedBundles, searchQuery]);

  const totalPages = Math.ceil(filteredBundles.length / itemsPerPage) || 1;

  const paginatedBundles = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBundles.slice(start, start + itemsPerPage);
  }, [filteredBundles, currentPage, itemsPerPage]);

  return (
    <div className="flex flex-col gap-4 min-h-[300px] font-sans">
      {/* Installed Bundle Cards Grid 4 Kolom */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 font-sans">
        {loading && installedBundles.length === 0 ? (
          <div className="col-span-full py-20 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-[#00a389]" />
            <span className="text-[13px] font-normal text-slate-500 font-sans">Memuat data...</span>
          </div>
        ) : filteredBundles.length === 0 ? (
          <div className="col-span-full py-10 text-center select-none font-sans">
            <EmptyDataAnimation
              title={searchQuery ? "Hasil Pencarian Tidak Ditemukan" : "Belum Ada Bundle Terpasang"}
              description={
                searchQuery
                  ? "Tidak ada nomor bundle terpasang yang sesuai dengan kata kunci pencarian."
                  : "Belum ada map bundle yang terpasang dalam manifest ini."
              }
            />
          </div>
        ) : (
          paginatedBundles.map((b) => (
            <SenderInstalledBundleCard
              key={b.id}
              bundle={b}
              isSelected={selectedBundleInManifest?.id === b.id}
              manifestStatus={manifestStatus}
              searchQuery={searchQuery}
              loading={loading}
              onSelectBundle={onSelectBundle}
              onRemoveBundle={onRemoveBundle}
              onOpenVersionDrawer={onOpenVersionDrawer}
            />
          ))
        )}
      </div>

      {/* Table / Grid Footer Pagination */}
      {filteredBundles.length > 0 && (
        <div className="px-4 py-3.5 border-t border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 select-none shrink-0 mt-auto font-sans rounded-b-md">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-semibold text-slate-500 font-sans">
              {((currentPage - 1) * itemsPerPage) + 1}–
              {Math.min(currentPage * itemsPerPage, filteredBundles.length)} dari{" "}
              {filteredBundles.length} Bundle Terpasang
            </span>
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-md px-1.5 py-0.5 shadow-3xs">
              {[12, 24, 48].map((n) => (
                <button
                  key={n}
                  onClick={() => {
                    setItemsPerPage(n);
                    setCurrentPage(1);
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                    itemsPerPage === n
                      ? "bg-[#00a389] text-white shadow-3xs"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {n}
                </button>
              ))}
              <span className="text-[10px] text-slate-400 font-semibold pl-0.5">/hal</span>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-all cursor-pointer shadow-3xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                .reduce((acc: (number | string)[], page, idx, arr) => {
                  if (idx > 0 && (page as number) - (arr[idx - 1] as number) > 1) acc.push("...");
                  acc.push(page);
                  return acc;
                }, [])
                .map((item, idx) =>
                  typeof item === "number" ? (
                    <button
                      key={idx}
                      onClick={() => setCurrentPage(item)}
                      className={`w-7 h-7 rounded-md text-xs font-bold transition-all cursor-pointer ${
                        currentPage === item
                          ? "bg-[#00a389] text-white shadow-3xs scale-105"
                          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 shadow-3xs"
                      }`}
                    >
                      {item}
                    </button>
                  ) : (
                    <span key={idx} className="px-1 text-slate-400 text-xs font-bold">
                      ...
                    </span>
                  )
                )}

              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-all cursor-pointer shadow-3xs"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

SenderInstalledBundleGrid.displayName = "SenderInstalledBundleGrid";
