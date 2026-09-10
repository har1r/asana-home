"use client";

import React from "react";
import { FolderLock, ChevronLeft, ChevronRight } from "lucide-react";
import { formatBundleNumber } from "@/components/workspaces/shared/constants";
import { useRecommendationPrint } from "./useRecommendationPrint";
import { RecommendationToolbar } from "./RecommendationToolbar";
import { QueueTableRow } from "../queue-researcher/QueueTableRow";
import { EmptyDataAnimation } from "@/components/workspaces/shared/EmptyDataAnimation";

export interface RecommendationPrintViewProps {
  selectedBundle: any | null;
  bundlesList?: any[];
  onSelectBundle?: (bundle: any) => void;
  onViewDetails: (item: any) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onLockBundle?: (bundleId: string) => void;
}

export const RecommendationPrintView: React.FC<RecommendationPrintViewProps> = React.memo(({
  selectedBundle,
  bundlesList = [],
  onSelectBundle,
  onViewDetails,
  onRefresh,
  isRefreshing = false,
  onLockBundle,
}) => {
  const {
    applications,
    filteredApplications,
    paginatedApplications,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    searchQuery,
    setSearchQuery,
    handleToggleFavorite,
    handlePrintBundleCover,
  } = useRecommendationPrint({ selectedBundle });

  if (!selectedBundle) {
    return (
      <div className="flex flex-col gap-4 font-sans select-none animate-fadeIn">
        <RecommendationToolbar
          selectedBundle={null}
          bundlesList={bundlesList}
          onSelectBundle={onSelectBundle}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onPrint={() => {}}
          onLockBundle={onLockBundle}
          isLoading={isRefreshing}
        />

        <div className="bg-white border border-slate-200/90 rounded-xl p-12 shadow-2xs flex flex-col items-center justify-center text-center min-h-[350px]">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 mb-4 shadow-3xs">
            <FolderLock className="w-7 h-7 text-slate-600" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">Pilih Bundle Terkunci</h3>
          <p className="text-xs text-slate-500 max-w-md leading-relaxed font-normal">
            Silakan pilih bundle yang berstatus <strong>Terkunci (LOCKED)</strong> dari Tab Kelola Bundle untuk mencetak Surat Rekomendasi Bundle.
          </p>
        </div>
      </div>
    );
  }

  const startEntry = filteredApplications.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endEntry = Math.min(currentPage * itemsPerPage, filteredApplications.length);

  return (
    <div className="flex flex-col gap-3 font-sans select-none animate-fadeIn">
      {/* Bundle Header Row: Nomor Bundle (Kiri), Status Badge & Action Buttons (Cetak Rekomendasi) (Kanan) */}
      {selectedBundle && (
        <div className="flex items-center justify-between gap-3 px-1 py-1 select-none font-sans flex-wrap">
          <h2 className="text-[13px] font-bold text-slate-900 font-sans tracking-tight">
            {formatBundleNumber(selectedBundle.bundleNumber)}
          </h2>

          <div className="flex items-center gap-3 shrink-0">
            <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-md shadow-3xs font-sans ${
              selectedBundle.status === 'LOCKED'
                ? 'bg-slate-900 text-white'
                : 'bg-emerald-50 text-[#008f78] border border-emerald-200'
            }`}>
              {selectedBundle.status === 'LOCKED' ? 'TERKUNCI' : 'DRAF'}
            </span>

            <RecommendationToolbar
              selectedBundle={selectedBundle}
              bundlesList={bundlesList}
              onSelectBundle={onSelectBundle}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onPrint={() => handlePrintBundleCover(selectedBundle.id)}
              onLockBundle={onLockBundle}
              isLoading={isRefreshing}
            />
          </div>
        </div>
      )}

      {/* Enterprise Data Table Canvas (Identical to Queue / Tab 2) */}
      <div className="w-full bg-white border border-slate-200/90 rounded-md shadow-xs flex flex-col overflow-hidden min-h-[480px]">
        <div className="p-0 flex-1 flex flex-col">
          <div className="overflow-hidden bg-transparent flex flex-col flex-1 justify-between">
            <div className="overflow-x-auto scrollbar-thin flex-1 flex flex-col">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/90 text-[13px] font-normal text-slate-600 capitalize text-left border-b border-slate-200/90 select-none font-sans">
                    <th className="py-3 px-4 text-center w-12 min-w-[48px] relative font-normal text-slate-600">
                      <span>No</span>
                      <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                    </th>
                    <th className="py-3 px-2 text-center select-none w-10 min-w-[40px] relative font-normal text-slate-600">
                      <span>⭐</span>
                      <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                    </th>
                    <th className="py-3 px-4 min-w-[110px] relative font-normal text-slate-600">
                      <span>Tgl. Input</span>
                      <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                    </th>
                    <th className="py-3 px-4 min-w-[140px] relative font-normal text-slate-600">
                      <span>Petugas Input</span>
                      <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                    </th>
                    <th className="py-3 px-4 min-w-[130px] relative font-normal text-slate-600">
                      <span>Tgl. Permohonan</span>
                      <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                    </th>
                    <th className="py-3 px-4 min-w-[110px] relative font-normal text-slate-600">
                      <span>Tgl. Selesai</span>
                      <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                    </th>
                    <th className="py-3 px-4 min-w-[160px] relative font-normal text-slate-600">
                      <span>No. Permohonan</span>
                      <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                    </th>
                    <th className="py-3 px-4 min-w-[210px] whitespace-nowrap relative font-normal text-slate-600">
                      <span>Nomor Objek Pajak</span>
                      <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                    </th>
                    <th className="py-3 px-4 min-w-[150px] relative font-normal text-slate-600">
                      <span>Nama Pemohon</span>
                      <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                    </th>
                    <th className="py-3 px-4 min-w-[130px] relative font-normal text-slate-600">
                      <span>Jenis Layanan</span>
                      <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                    </th>
                    <th className="py-3 px-4 text-center min-w-[130px] relative font-normal text-slate-600">
                      <span>Status</span>
                      <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                    </th>
                    <th className="py-3 px-4 text-center min-w-[110px] font-normal text-slate-600">
                      <span>Aksi</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[12px] font-normal text-slate-600 font-sans">
                  {paginatedApplications.length > 0 ? (
                    paginatedApplications.map((item: any, idx: number) => (
                      <QueueTableRow
                        key={item.uniqueRowKey || item.id || idx}
                        item={item}
                        index={(currentPage - 1) * itemsPerPage + idx}
                        searchQuery={searchQuery}
                        selectedBundle={selectedBundle}
                        onToggleFavorite={handleToggleFavorite}
                        onViewDetails={onViewDetails}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={12} className="py-10 text-center select-none font-sans">
                        <EmptyDataAnimation
                          title={searchQuery ? 'Tidak ada permohonan yang sesuai' : 'Belum ada permohonan dalam bundle ini'}
                          description={searchQuery ? 'Coba ubah kata kunci pencarian.' : 'Data permohonan dalam bundle akan muncul di sini.'}
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Table Footer / Pagination (Identical to Queue / Tab 2) */}
        <div className="px-5 py-3.5 border-t border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 select-none shrink-0 mt-auto">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-semibold text-slate-500 font-sans">
              {filteredApplications.length > 0
                ? `Menampilkan ${startEntry}–${endEntry} dari ${filteredApplications.length} permohonan`
                : 'Tidak ada data'}
            </span>
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-md px-1.5 py-0.5 shadow-3xs">
              {[10, 20, 50].map((n) => (
                <button
                  key={n}
                  onClick={() => {
                    setItemsPerPage(n);
                    setCurrentPage(1);
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                    itemsPerPage === n
                      ? 'bg-[#00a389] text-white shadow-3xs'
                      : 'text-slate-500 hover:text-slate-700'
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
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-all cursor-pointer shadow-3xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                .reduce((acc: (number | string)[], page, idx, arr) => {
                  if (idx > 0 && (page as number) - (arr[idx - 1] as number) > 1) acc.push('...');
                  acc.push(page);
                  return acc;
                }, [])
                .map((page, idx) =>
                  page === '...' ? (
                    <span key={`ellipsis-${idx}`} className="px-1 text-slate-400 text-xs">…</span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page as number)}
                      className={`min-w-[28px] h-[28px] rounded-md text-xs font-semibold transition-all cursor-pointer shadow-3xs ${
                        currentPage === page
                          ? 'bg-[#00a389] text-white'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-all cursor-pointer shadow-3xs"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

RecommendationPrintView.displayName = "RecommendationPrintView";
