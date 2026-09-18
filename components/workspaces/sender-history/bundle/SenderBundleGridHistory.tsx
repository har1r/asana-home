"use client";

import React from "react";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { EmptyDataAnimation } from "@/components/workspaces/shared/EmptyDataAnimation";
import { SenderBundleCardHistory } from "./SenderBundleCardHistory";

export interface SenderBundleGridHistoryProps {
  installedBundles: any[];
  selectedBundle: any | null;
  manifestStatus?: string;
  searchQuery?: string;
  loading?: boolean;
  onSelectBundle: (bundle: any) => void;
}

export const SenderBundleGridHistory: React.FC<SenderBundleGridHistoryProps> = React.memo(({
  installedBundles,
  selectedBundle,
  manifestStatus = "LOCKED",
  searchQuery = "",
  loading = false,
  onSelectBundle,
}) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(12);

  // Filter bundles based on search query
  const filteredBundles = React.useMemo(() => {
    if (!searchQuery || !searchQuery.trim()) return installedBundles;
    const q = searchQuery.toLowerCase().trim();
    return installedBundles.filter((b) => {
      const bundleNo = (b.bundleNumber || b.nomorBundle || "").toLowerCase();
      const jenis = (b.applicationType || b.jenisPermohonan || "").toLowerCase();
      const creator = (
        b.createdBy?.name ||
        b.createdByUser?.name ||
        b.peneliti?.name ||
        b.user?.name ||
        ""
      ).toLowerCase();
      return bundleNo.includes(q) || jenis.includes(q) || creator.includes(q);
    });
  }, [installedBundles, searchQuery]);

  // Reset to page 1 on filter or dataset change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, installedBundles.length]);

  const totalPages = Math.ceil(filteredBundles.length / itemsPerPage) || 1;
  const paginatedBundles = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBundles.slice(start, start + itemsPerPage);
  }, [filteredBundles, currentPage, itemsPerPage]);

  return (
    <div className="flex flex-col gap-4 min-h-[220px] font-sans">
      {/* Cards Grid 4 Kolom */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 font-sans">
        {loading && installedBundles.length === 0 ? (
          <div className="col-span-full py-16 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-[#00a389]" />
            <span className="text-[13px] font-normal text-slate-500 font-sans">Memuat map bundle...</span>
          </div>
        ) : filteredBundles.length === 0 ? (
          <div className="col-span-full py-8 text-center select-none font-sans">
            <EmptyDataAnimation
              title={searchQuery ? "Hasil Pencarian Tidak Ditemukan" : "Belum Ada Bundle Terpasang"}
              description={
                searchQuery
                  ? "Tidak ada map bundle yang sesuai dengan kata kunci pencarian."
                  : "Belum ada map bundle yang terpasang dalam manifest riwayat ini."
              }
            />
          </div>
        ) : (
          paginatedBundles.map((bundle) => (
            <SenderBundleCardHistory
              key={bundle.id}
              bundle={bundle}
              isSelected={selectedBundle?.id === bundle.id}
              manifestStatus={manifestStatus}
              searchQuery={searchQuery}
              loading={loading && selectedBundle?.id === bundle.id}
              onSelectBundle={onSelectBundle}
            />
          ))
        )}
      </div>

      {/* Pagination Footer */}
      {filteredBundles.length > 0 && (
        <div className="px-4 py-3 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 select-none shrink-0 mt-auto font-sans rounded-b-md">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-semibold text-slate-500 font-sans">
              {((currentPage - 1) * itemsPerPage) + 1}–
              {Math.min(currentPage * itemsPerPage, filteredBundles.length)} dari{" "}
              {filteredBundles.length} Bundle
            </span>
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-md px-1.5 py-0.5 shadow-3xs">
              {[12, 24, 48].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => {
                    setItemsPerPage(n);
                    setCurrentPage(1);
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${itemsPerPage === n
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
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
                      type="button"
                      onClick={() => setCurrentPage(item)}
                      className={`w-7 h-7 rounded-md text-xs font-bold transition-all cursor-pointer ${currentPage === item
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
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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

