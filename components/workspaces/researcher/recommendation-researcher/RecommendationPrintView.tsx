"use client";

import React from "react";
import { Printer, Lock, FolderLock, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { formatNop, toTitleCase, JENIS_LABEL_MAP } from "@/components/workspaces/shared/constants";
import { useRecommendationPrint } from "./useRecommendationPrint";

export interface RecommendationPrintViewProps {
  selectedBundle: any | null;
  onViewDetails: (item: any) => void;
}

export const RecommendationPrintView: React.FC<RecommendationPrintViewProps> = React.memo(({
  selectedBundle,
  onViewDetails,
}) => {
  const {
    applications,
    paginatedApplications,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    totalPages,
    handlePrintBundleCover,
  } = useRecommendationPrint({ selectedBundle });

  if (!selectedBundle) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-xl p-12 shadow-2xs flex flex-col items-center justify-center text-center min-h-[350px] font-sans">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 mb-4 shadow-3xs">
          <FolderLock className="w-7 h-7 text-slate-600" />
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-1">Pilih Bundle Terkunci</h3>
        <p className="text-xs text-slate-500 max-w-md leading-relaxed font-normal">
          Silakan pilih bundle yang berstatus <strong>Terkunci (LOCKED)</strong> dari Tab Bundle Management untuk mencetak Surat Rekomendasi / Surat Pengantar Bundle Peneliti.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl shadow-2xs flex flex-col overflow-hidden font-sans select-none animate-fadeIn">
      {/* Top Banner Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200/80 bg-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 font-mono tracking-tight">
                {selectedBundle.bundleNumber}
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-900 text-white rounded-full">
                TERKUNCI
              </span>
            </div>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              {JENIS_LABEL_MAP[selectedBundle.applicationType] || selectedBundle.applicationType} • {applications.length} Permohonan
            </p>
          </div>
        </div>

        {/* Action Button: Print Recommendation Cover Letter */}
        <button
          onClick={() => handlePrintBundleCover(selectedBundle.id)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-2xs hover:shadow-xs transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4 text-amber-400" />
          <span>Cetak Surat Rekomendasi Bundle</span>
        </button>
      </div>

      {/* Table Canvas */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 text-xs font-semibold">
              <th className="py-3 px-4 w-12 text-center">No</th>
              <th className="py-3 px-4 min-w-[140px]">No. Permohonan</th>
              <th className="py-3 px-4 min-w-[150px]">NOP</th>
              <th className="py-3 px-4 min-w-[180px]">Pemilik Semula</th>
              <th className="py-3 px-4 min-w-[180px]">Pemilik Baru / Target</th>
              <th className="py-3 px-4 text-center w-24">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {paginatedApplications.length > 0 ? (
              paginatedApplications.map((item: any, idx: number) => {
                const prev = item.previousData?.[0] || {};
                const target = item.targetData?.[0] || {};
                const globalIdx = (currentPage - 1) * itemsPerPage + idx + 1;

                return (
                  <tr key={item.id || idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-center font-mono text-[11px] text-slate-400">
                      {globalIdx}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                      {item.applicationNumber}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {formatNop(prev.nop || '')}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {toTitleCase(prev.ownerName || '-')}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {toTitleCase(target.ownerName || prev.ownerName || '-')}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onViewDetails(item)}
                        className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors cursor-pointer"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                  Tidak ada permohonan dalam bundle ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="px-5 py-3 border-t border-slate-200/90 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-normal">
            Halaman {currentPage} dari {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

RecommendationPrintView.displayName = "RecommendationPrintView";
