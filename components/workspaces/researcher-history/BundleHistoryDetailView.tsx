"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  ChevronLeft,
  Search,
  X,
  Printer,
  FileSpreadsheet,
  Copy,
  Check,
  Eye,
  ChevronRight,
  Layers,
  Lock,
  Archive,
  CheckCircle,
  History,
} from "lucide-react";
import { formatNop, formatBundleNumber, getAbbreviatedJenis, toTitleCase } from "@/components/workspaces/shared/constants";
import { DetailsModal } from "@/components/workspaces/shared/DetailsModal";
import { ApplicationSnapshotDrawer } from "@/components/workspaces/shared/ApplicationSnapshotDrawer";
import { EmptyDataAnimation } from "@/components/workspaces/shared/EmptyDataAnimation";

export interface BundleHistoryDetailViewProps {
  bundle: any;
  onBack: () => void;
}

const getStatusBadge = (status: string) => {
  const s = (status || "").toUpperCase();
  if (s === "DRAFT") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 font-sans">
        <Layers className="w-3 h-3 text-slate-500" />
        <span>Draf</span>
      </span>
    );
  }
  if (s === "LOCKED" || s === "TERKUNCI") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-900 text-white shadow-3xs font-sans">
        <Lock className="w-3 h-3 text-amber-400" />
        <span>Terkunci</span>
      </span>
    );
  }
  if (s === "IN_MANIFEST" || s === "MANIFESTED") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-[#008f78] border border-emerald-200/80 shadow-3xs font-sans">
        <Archive className="w-3 h-3 text-[#008f78]" />
        <span>Manifest</span>
      </span>
    );
  }
  if (s === "COMPLETED" || s === "ARCHIVED" || s === "DELIVERED") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300/80 shadow-3xs font-sans">
        <CheckCircle className="w-3 h-3 text-emerald-600" />
        <span>Selesai</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 font-sans">
      <span>{status}</span>
    </span>
  );
};

const formatDateDisplay = (rawDateStr?: string) => {
  if (!rawDateStr) return "-";
  const dateObj = new Date(rawDateStr);
  if (isNaN(dateObj.getTime())) return rawDateStr;
  return dateObj.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const normalizeAppItem = (item: any) => {
  const previousData = Array.isArray(item.previousData) ? item.previousData : (Array.isArray(item.dataLama) ? item.dataLama : []);
  const targetData = Array.isArray(item.targetData) ? item.targetData : (Array.isArray(item.dataBaru) ? item.dataBaru : []);
  const firstPrev = previousData[0] || {};
  const firstTarget = targetData[0] || {};
  const appType = item.applicationType || item.jenisPermohonan || '';

  const isPartialMutation = appType === 'PARTIAL_MUTATION' || appType === 'MUTASI_SEBAGIAN';
  const isReactivation = appType === 'REACTIVATION' || appType === 'PENGAKTIFAN';

  let calculatedNop = item.nop || '';
  if (!calculatedNop || calculatedNop === '-') {
    if (appType === 'NEW_TAX_OBJECT' || appType === 'OBJEK_PAJAK_BARU') {
      calculatedNop = firstTarget.nopTemporary || firstTarget.nop || '-';
    } else {
      calculatedNop = firstPrev.nop || firstPrev.nopAsal || firstPrev.nop_asal || '-';
    }
  }

  let calculatedOwnerName = item.ownerName || item.displayOwnerName || '';
  if (!calculatedOwnerName || calculatedOwnerName === '-') {
    if (isReactivation) {
      calculatedOwnerName = firstPrev.ownerName || firstPrev.namaPemilikLama || '-';
    } else if (isPartialMutation) {
      const firstName = firstTarget.ownerName || firstTarget.namaPemilikBaru || '';
      const totalCount = targetData.length;
      if (firstName && totalCount > 1) {
        calculatedOwnerName = `${firstName} (${totalCount})`;
      } else {
        calculatedOwnerName = firstName || '-';
      }
    } else {
      if (targetData.length > 0) {
        calculatedOwnerName = targetData
          .map((t: any) => t.ownerName || t.namaPemilikBaru || t.namaPemilik)
          .filter(Boolean)
          .join(', ');
      }
      if (!calculatedOwnerName) {
        calculatedOwnerName = firstPrev.ownerName || firstPrev.namaPemilikLama || firstPrev.namaPemilik || '-';
      }
    }
  }

  return {
    ...item,
    applicationNumber: item.applicationNumber || item.nomorPelayanan || '-',
    serviceNumberDate: item.serviceNumberDate || item.tanggalNoPelayanan || item.createdAt,
    completionDate: item.completionDate || item.tanggalPenyelesaian,
    nop: calculatedNop || '-',
    ownerName: calculatedOwnerName || '-',
    inputterName: item.penginput?.name || item.inputterName || 'Petugas Input',
  };
};

export const BundleHistoryDetailView: React.FC<BundleHistoryDetailViewProps> = React.memo(({
  bundle,
  onBack
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<any | null>(null);
  const [selectedSnapshotApplication, setSelectedSnapshotApplication] = useState<any | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const rawBundleNumber = bundle.bundleNumber || bundle.nomorBundle || '';
  const bundleNum = rawBundleNumber ? formatBundleNumber(rawBundleNumber, bundle.createdAt) : '—';
  const rawApplications: any[] = bundle.applications || bundle.permohonan || [];

  const normalizedApplications = useMemo(() => {
    return rawApplications.map((item) => normalizeAppItem(item));
  }, [rawApplications]);

  const filteredApplications = useMemo(() => {
    if (!searchQuery.trim()) return normalizedApplications;
    const q = searchQuery.toLowerCase().trim();
    return normalizedApplications.filter((item) => {
      const appNo = (item.applicationNumber || '').toLowerCase();
      const owner = (item.ownerName || '').toLowerCase();
      const nop = (item.nop || '').toLowerCase();
      return appNo.includes(q) || owner.includes(q) || nop.includes(q);
    });
  }, [normalizedApplications, searchQuery]);

  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage) || 1;

  const paginatedApplications = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredApplications.slice(start, start + itemsPerPage);
  }, [filteredApplications, currentPage, itemsPerPage]);

  const handleCopy = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 1200);
  };

  const handlePrintBundleCover = () => {
    window.print();
  };

  // Shortcut Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      const isTyping = tag === 'input' || tag === 'textarea' || tag === 'select' || (e.target as HTMLElement).isContentEditable;
      if ((e.ctrlKey && e.key === 'k') || (e.key === '/' && !isTyping)) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const startEntry = filteredApplications.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endEntry = Math.min(currentPage * itemsPerPage, filteredApplications.length);

  return (
    <div className="w-full flex flex-col gap-3 animate-fadeIn font-sans select-none">
      {/* 1. TOP HEADER NAVIGATION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none font-sans py-1">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-md text-xs font-semibold text-slate-700 transition-all cursor-pointer shadow-3xs font-sans shrink-0 self-start sm:self-auto"
          title="Kembali ke Riwayat Bundle"
        >
          <ChevronLeft className="w-4 h-4 text-slate-500" />
          <span>Kembali</span>
        </button>

        <div className="text-xs text-slate-500 font-medium font-sans">
          Total: <span className="font-bold text-[#008f78]">{rawApplications.length} Permohonan</span>
        </div>
      </div>

      {/* 2. TOOLBAR BAR (Identical to Recommendation Toolbar) */}
      <div className="p-3 border border-slate-200/90 rounded-md bg-slate-50 flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-3xs font-sans select-none animate-fadeIn">
        {/* Left Side: Searchbar */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Cari NOP, Nopel, atau Nama Pemohon..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-14 py-2 bg-white border border-slate-200/90 rounded-md text-[13px] font-normal text-slate-900 focus:outline-none focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 transition-all font-sans"
          />
          {!searchQuery && (
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-slate-200 bg-slate-100 px-1.5 font-mono text-[10px] font-medium text-slate-400 font-sans">
              Ctrl+K
            </kbd>
          )}
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors cursor-pointer"
              title="Hapus Pencarian"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right Side: Print Recommendation Button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handlePrintBundleCover}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#00a389] hover:bg-[#008f78] active:scale-95 text-white rounded-md text-[13px] font-semibold shadow-3xs transition-all cursor-pointer shrink-0 font-sans"
          >
            <Printer className="w-4 h-4 text-white" />
            <span>Cetak Rekomendasi</span>
          </button>
        </div>
      </div>

      {/* 3. BUNDLE TITLE & STATUS BADGE (Placed directly between Search Toolbar & Table Canvas) */}
      <div className="flex items-center justify-between px-1 py-0.5 select-none font-sans">
        <h2 className="text-[13px] font-bold text-slate-900 font-sans tracking-tight font-mono">
          {bundleNum}
        </h2>
        {getStatusBadge(bundle.status)}
      </div>

      {/* 4. ENTERPRISE DATA TABLE CANVAS (Matching RecommendationPrintView / Queue) */}
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
                    <th className="py-3 px-4 text-center min-w-[90px] font-normal text-slate-600">
                      <span>Aksi</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[12px] font-normal text-slate-600 font-sans">
                  {paginatedApplications.length > 0 ? (
                    paginatedApplications.map((item: any, idx: number) => {
                      const globalIdx = (currentPage - 1) * itemsPerPage + idx + 1;
                      const appNo = item.applicationNumber || '-';
                      const nopVal = item.nop || '-';

                      return (
                        <tr
                          key={item.id || idx}
                          onClick={() => setSelectedApplication(item)}
                          className="hover:bg-slate-50/90 transition-colors group cursor-pointer h-11"
                        >
                          <td className="py-2.5 px-4 text-center font-normal text-slate-600 font-sans text-[12px]">
                            {globalIdx}
                          </td>
                          <td className="py-2.5 px-4 text-slate-600 font-sans text-[12px] font-normal whitespace-nowrap capitalize">
                            {formatDateDisplay(item.createdAt)}
                          </td>
                          <td className="py-2.5 px-4 text-slate-600 text-[12px] font-normal font-sans whitespace-nowrap">
                            <span className="truncate max-w-[140px] font-sans font-normal text-[12px]">
                              {toTitleCase(item.inputterName)}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-slate-600 font-sans text-[12px] font-normal whitespace-nowrap capitalize">
                            {formatDateDisplay(item.serviceNumberDate)}
                          </td>
                          <td className="py-2.5 px-4 whitespace-nowrap font-sans text-slate-600 text-[12px]">
                            {formatDateDisplay(item.completionDate)}
                          </td>
                          <td className="py-2.5 px-4 min-w-[150px] font-sans">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[12px] font-semibold font-mono text-slate-900 tracking-tight">
                                {appNo}
                              </span>
                            </div>
                          </td>
                          <td className="py-2.5 px-4 min-w-[210px] whitespace-nowrap font-sans">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[12px] font-mono text-slate-700">
                                {nopVal !== '-' ? formatNop(nopVal) : '-'}
                              </span>
                              {nopVal !== '-' && (
                                <button
                                  type="button"
                                  onClick={(e) => handleCopy(e, nopVal)}
                                  className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-slate-100 text-slate-400 hover:text-[#00a389] transition-all cursor-pointer"
                                  title="Salin NOP"
                                >
                                  {copiedText === nopVal ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-4 font-sans">
                            <span className="text-[12px] font-medium text-slate-800 capitalize truncate max-w-[180px] block">
                              {item.ownerName}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 font-sans">
                            <span className="text-[12px] font-normal text-slate-600 bg-slate-100 border border-slate-200/90 px-2 py-0.5 rounded capitalize font-sans">
                              {getAbbreviatedJenis(item.applicationType)}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-center font-sans">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-[#008f78] border border-emerald-200/80">
                              {item.status || 'BUNDLED'}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-center font-sans">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSnapshotApplication(item);
                              }}
                              className="p-1.5 rounded-md text-slate-400 hover:text-[#00a389] hover:bg-slate-100 transition-colors cursor-pointer"
                              title="Lihat Versi Permohonan"
                            >
                              <History className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={11} className="py-10 text-center select-none font-sans">
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

          {/* Table Footer / Pagination */}
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
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${itemsPerPage === n
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
                        type="button"
                        onClick={() => setCurrentPage(page as number)}
                        className={`w-7 h-7 rounded-md text-xs font-bold transition-all cursor-pointer ${currentPage === page
                          ? 'bg-[#00a389] text-white font-extrabold shadow-3xs scale-105 z-10'
                          : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 shadow-3xs'
                        }`}
                      >
                        {page}
                      </button>
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
        </div>
      </div>

      {/* Embedded Details Modal for Application */}
      {selectedApplication && (
        <DetailsModal
          isOpen={Boolean(selectedApplication)}
          selectedRequest={selectedApplication}
          onClose={() => setSelectedApplication(null)}
        />
      )}

      {/* Application Snapshot / Version Drawer */}
      {selectedSnapshotApplication && (
        <ApplicationSnapshotDrawer
          isOpen={Boolean(selectedSnapshotApplication)}
          onClose={() => setSelectedSnapshotApplication(null)}
          application={selectedSnapshotApplication}
        />
      )}
    </div>
  );
});

BundleHistoryDetailView.displayName = "BundleHistoryDetailView";
