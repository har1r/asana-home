"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EmptyDataAnimation } from "@/components/workspaces/shared/EmptyDataAnimation";
import { DetailsModal } from "@/components/workspaces/shared/DetailsModal";
import { SenderApplicationTableRowHistory } from "./SenderApplicationTableRowHistory";

interface SenderApplicationsTableHistoryProps {
  selectedBundle: any | null;
  bundleDisplayMode: "berkas" | "pemohon";
  searchQuery: string;
  filteredApplicationList: any[];
  paginatedApplicationList: any[];
  copiedText: string | null;
  loading?: boolean;
  activePage: number;
  itemsPerPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (size: number) => void;
  onCopy: (e: React.MouseEvent, text?: string | null) => void;
  onToggleFavorite: (applicationId: string) => void;
}

export const SenderApplicationsTableHistory: React.FC<SenderApplicationsTableHistoryProps> = React.memo(({
  selectedBundle,
  bundleDisplayMode,
  searchQuery,
  filteredApplicationList,
  paginatedApplicationList,
  copiedText,
  loading = false,
  activePage,
  itemsPerPage,
  totalPages,
  onPageChange,
  onItemsPerPageChange,
  onCopy,
  onToggleFavorite,
}) => {
  const [selectedRequestForDetails, setSelectedRequestForDetails] = useState<any | null>(null);

  if (!selectedBundle) {
    return (
      <div className="py-6 px-4 flex flex-col items-center justify-center text-center select-none font-sans animate-fadeIn">
        <EmptyDataAnimation
          title="Pilih Map Bundle"
          description="Silakan pilih salah satu map bundle pada daftar di atas untuk menampilkan tabel detail berkas permohonan."
        />
      </div>
    );
  }

  return (
    <div className="w-full bg-white border border-slate-200/90 rounded-md shadow-3xs overflow-hidden flex flex-col font-sans">
      <div className="overflow-x-auto scrollbar-thin max-h-[440px]">
        <table className="w-full text-left border-collapse select-none font-sans">
          <thead>
            <tr className="bg-slate-50/90 text-[13px] font-normal text-slate-600 capitalize text-left border-b border-slate-200/90 select-none font-sans whitespace-nowrap">
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
              <th className="py-3 px-4 min-w-[100px] relative font-normal text-slate-600">
                <span>Tgl. Nopel</span>
                <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
              </th>
              <th className="py-3 px-4 min-w-[100px] relative font-normal text-slate-600">
                <span>Tgl. Selesai</span>
                <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
              </th>
              <th className="py-3 px-4 min-w-[150px] relative font-normal text-slate-600">
                <span>No. Pelayanan</span>
                <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
              </th>
              <th className="py-3 px-4 min-w-[210px] whitespace-nowrap relative font-normal text-slate-600">
                <span>Nomor Objek Pajak</span>
                <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
              </th>
              <th className="py-3 px-4 min-w-[170px] relative font-normal text-slate-600">
                <span>Nama Pemohon</span>
                <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
              </th>
              <th className="py-3 px-4 min-w-[120px] relative font-normal text-slate-600">
                <span>Jenis Layanan</span>
                <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
              </th>
              <th className="py-3 px-4 text-center min-w-[100px] relative font-normal text-slate-600">
                <span>Status</span>
                <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
              </th>
              <th className="py-3 px-4 text-center w-28 min-w-[110px] font-normal text-slate-600">
                <span>Aksi</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white text-[12px] font-normal text-slate-600 font-sans">
            {paginatedApplicationList.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-10 text-center select-none font-sans">
                  <EmptyDataAnimation
                    title={searchQuery ? "Hasil Pencarian Tidak Ditemukan" : "Belum Ada Permohonan"}
                    description={
                      searchQuery
                        ? "Tidak ada permohonan yang sesuai dengan kata kunci pencarian."
                        : "Tidak ada berkas permohonan terpasang dalam bundle ini."
                    }
                  />
                </td>
              </tr>
            ) : (
              paginatedApplicationList.map((p: any, index: number) => {
                const itemNumber = (activePage - 1) * itemsPerPage + index + 1;
                return (
                  <SenderApplicationTableRowHistory
                    key={p.uniqueRowKey || p.id || `application-row-${index}`}
                    application={p}
                    itemNumber={itemNumber}
                    selectedBundle={selectedBundle}
                    copiedText={copiedText}
                    onCopy={onCopy}
                    onToggleFavorite={onToggleFavorite}
                    onSelectDetails={(app) => setSelectedRequestForDetails(app)}
                  />
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* TABLE FOOTER PAGINATION */}
      <div className="border-t border-slate-200/90 bg-slate-50/80 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] font-normal text-slate-600 select-none font-sans">
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start font-sans">
          <span className="text-slate-500 font-sans">
            {filteredApplicationList.length > 0
              ? `Menampilkan ${(activePage - 1) * itemsPerPage + 1} - ${Math.min(
                  activePage * itemsPerPage,
                  filteredApplicationList.length
                )} dari ${filteredApplicationList.length} ${
                  bundleDisplayMode === "pemohon" ? "entri pemohon" : "permohonan"
                }`
              : "Tidak ada data"}
          </span>
          {/* Items per page switcher */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-md px-1.5 py-0.5 shadow-3xs font-sans">
            {[10, 20, 50].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => onItemsPerPageChange(size)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-normal transition-all cursor-pointer font-sans ${
                  itemsPerPage === size
                    ? "bg-[#00a389] text-white font-semibold shadow-3xs"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {size}
              </button>
            ))}
            <span className="text-[11px] text-slate-400 font-normal pl-0.5 font-sans">/hal</span>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-1 font-sans">
            <button
              type="button"
              onClick={() => onPageChange(Math.max(activePage - 1, 1))}
              disabled={activePage === 1}
              className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-all cursor-pointer shadow-3xs flex items-center justify-center font-sans"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                type="button"
                key={page}
                onClick={() => onPageChange(page)}
                className={`w-7 h-7 flex items-center justify-center rounded-md text-[12px] font-normal transition-all cursor-pointer font-sans ${
                  activePage === page
                    ? "bg-[#00a389] text-white font-semibold shadow-3xs scale-105"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 shadow-3xs"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              onClick={() => onPageChange(Math.min(activePage + 1, totalPages))}
              disabled={activePage === totalPages}
              className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-all cursor-pointer shadow-3xs flex items-center justify-center font-sans"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Details Modal Overlay */}
      <DetailsModal
        isOpen={!!selectedRequestForDetails}
        selectedRequest={selectedRequestForDetails}
        onClose={() => setSelectedRequestForDetails(null)}
      />
    </div>
  );
});

SenderApplicationsTableHistory.displayName = "SenderApplicationsTableHistory";
