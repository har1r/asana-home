"use client";

import React, { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EmptyDataAnimation } from "@/components/workspaces/shared/EmptyDataAnimation";
import { ArchivistArsipTableRow } from "./ArchivistArsipTableRow";

export interface ArchivistArsipTableProps {
  filteredArsipList: any[];
  selectedBundle: any | null;
  searchArsipQuery: string;
  currentArsipPage: number;
  itemsPerArsipPage: number;
  arsipDisplayMode: "berkas" | "pemohon";
  copiedText: string | null;
  loading: boolean;
  onSelectRequest: (item: any) => void;
  onToggleFavorite: (id: string) => void;
  onCopy: (e: React.MouseEvent, text: string) => void;
  onUploadFile: (permohonanId: string, e: React.ChangeEvent<HTMLInputElement>, dataBaruId?: string) => void;
  triggerFileInput: (permohonanId: string) => void;
  fileInputRefs: React.MutableRefObject<{ [key: string]: HTMLInputElement | null }>;
  checkPermohonanNeedsReupload: (p: any, targetId?: string | null) => boolean;
  onOpenCorrectionModal: (item: any) => void;
  onOpenFractionsModal: (item: any) => void;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (n: number) => void;
}

export const ArchivistArsipTable: React.FC<ArchivistArsipTableProps> = React.memo(
  ({
    filteredArsipList,
    selectedBundle,
    searchArsipQuery,
    currentArsipPage,
    itemsPerArsipPage,
    arsipDisplayMode,
    copiedText,
    loading,
    onSelectRequest,
    onToggleFavorite,
    onCopy,
    onUploadFile,
    triggerFileInput,
    fileInputRefs,
    checkPermohonanNeedsReupload,
    onOpenCorrectionModal,
    onOpenFractionsModal,
    onPageChange,
    onItemsPerPageChange,
  }) => {
    const totalArsipPages = Math.ceil(filteredArsipList.length / itemsPerArsipPage) || 1;
    const activeArsipPage = currentArsipPage > totalArsipPages ? 1 : currentArsipPage;

    const paginatedArsipList = useMemo(() => {
      const start = (activeArsipPage - 1) * itemsPerArsipPage;
      return filteredArsipList.slice(start, start + itemsPerArsipPage);
    }, [filteredArsipList, activeArsipPage, itemsPerArsipPage]);

    return (
      <div className="bg-white border border-slate-200/90 rounded-md shadow-3xs flex flex-col overflow-hidden min-h-[400px] font-sans">
        {/* Table Canvas */}
        <div className="overflow-x-auto flex-1 scrollbar-thin">
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
                <th className="py-3 px-4 min-w-[120px] text-center relative font-normal text-slate-600">
                  <span>Jenis Layanan</span>
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                </th>
                <th className="py-3 px-4 text-center min-w-[100px] relative font-normal text-slate-600">
                  <span>Status</span>
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                </th>
                <th className="py-3 px-4 min-w-[120px] relative font-normal text-slate-600">
                  <span>Tgl. Upload</span>
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                </th>
                <th className="py-3 px-4 text-center w-28 min-w-[110px] font-normal text-slate-600">
                  <span>Aksi</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[12px] font-normal text-slate-600 bg-white font-sans">
              {paginatedArsipList.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-10 text-center select-none font-sans">
                    <EmptyDataAnimation
                      title={searchArsipQuery ? "Hasil Pencarian Tidak Ditemukan" : "Belum Ada Permohonan"}
                      description={
                        searchArsipQuery
                          ? "Bundle tidak memiliki permohonan yang cocok dengan kata kunci pencarian."
                          : "Tidak ada permohonan terpasang dalam bundle ini."
                      }
                    />
                  </td>
                </tr>
              ) : (
                paginatedArsipList.map((p: any, index: number) => {
                  const itemNumber = (activeArsipPage - 1) * itemsPerArsipPage + index + 1;
                  return (
                    <ArchivistArsipTableRow
                      key={p.uniqueRowKey || `${p.id}-${index}`}
                      item={p}
                      itemNumber={itemNumber}
                      selectedBundle={selectedBundle}
                      copiedText={copiedText}
                      loading={loading}
                      arsipDisplayMode={arsipDisplayMode}
                      onSelect={onSelectRequest}
                      onToggleFavorite={onToggleFavorite}
                      onCopy={onCopy}
                      onUploadFile={onUploadFile}
                      triggerFileInput={triggerFileInput}
                      fileInputRefs={fileInputRefs}
                      checkPermohonanNeedsReupload={checkPermohonanNeedsReupload}
                      onOpenCorrectionModal={onOpenCorrectionModal}
                      onOpenFractionsModal={onOpenFractionsModal}
                    />
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 select-none shrink-0 font-sans">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-semibold text-slate-500 font-sans">
              {filteredArsipList.length > 0
                ? `Menampilkan ${((activeArsipPage - 1) * itemsPerArsipPage) + 1}–${Math.min(
                    activeArsipPage * itemsPerArsipPage,
                    filteredArsipList.length
                  )} dari ${filteredArsipList.length} ${
                    arsipDisplayMode === "pemohon" ? "entri pemohon" : "berkas"
                  }`
                : "Tidak ada data"}
            </span>

            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-1.5 py-0.5 shadow-3xs">
              {[10, 20, 50].map((n) => (
                <button
                  key={n}
                  onClick={() => onItemsPerPageChange(n)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                    itemsPerArsipPage === n
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

          {totalArsipPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onPageChange(Math.max(activeArsipPage - 1, 1))}
                disabled={activeArsipPage === 1}
                className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-all cursor-pointer shadow-3xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {Array.from({ length: totalArsipPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`w-7 h-7 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    activeArsipPage === page
                      ? "bg-[#00a389] text-white shadow-3xs scale-105"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 shadow-3xs"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => onPageChange(Math.min(activeArsipPage + 1, totalArsipPages))}
                disabled={activeArsipPage === totalArsipPages}
                className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-all cursor-pointer shadow-3xs"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
);

ArchivistArsipTable.displayName = "ArchivistArsipTable";
