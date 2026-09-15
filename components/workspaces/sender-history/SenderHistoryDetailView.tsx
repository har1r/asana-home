"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  ChevronLeft,
  Search,
  Printer,
  Calendar,
  User,
  Boxes,
  FileCheck,
  Upload,
  RefreshCw,
  Lock,
  Send,
  Eye,
  FileText,
  FileSpreadsheet,
  LayoutGrid,
  LayoutList,
  MoreVertical,
  Layers,
  Archive,
  CheckCircle,
  X,
} from "lucide-react";
import { DetailsModal } from "@/components/workspaces/shared/DetailsModal";
import { EmptyDataAnimation } from "@/components/workspaces/shared/EmptyDataAnimation";
import { formatJenisLayananLabel, getAbbreviatedJenis, formatBundleNumber, toTitleCase } from "@/components/workspaces/shared/constants";

// Helper for Jenis Permohonan Badge Styling (Singkatan Resmi, Warna Netral Clean, Center Aligned & Font Sans)
const getJenisPermohonanBadge = (jenis?: string | null) => {
  const abbr = getAbbreviatedJenis(jenis || "");
  const fullName = formatJenisLayananLabel(jenis);
  return (
    <span
      className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[11px] font-medium font-sans bg-slate-100 text-slate-700 border border-slate-200/80 shadow-3xs whitespace-nowrap select-none text-center"
      title={fullName}
    >
      {abbr}
    </span>
  );
};

// Helper for Application Status Badge Styling (Panel Bawah)
const getAppStatusBadge = (status: string) => {
  const s = (status || "").toUpperCase();
  let badgeClass = "bg-slate-100 text-slate-700 border-slate-200/80";
  let label = status || "Terbundel";

  if (s === "DELIVERED" || s === "TERKIRIM") {
    badgeClass = "bg-emerald-50 text-[#008f78] border-emerald-200/80";
    label = "Terkirim";
  } else if (s === "BUNDLED" || s === "TERBUNDEL") {
    badgeClass = "bg-blue-50 text-blue-700 border-blue-200/80";
    label = "Terbundel";
  } else if (s === "LOCKED" || s === "TERKUNCI") {
    badgeClass = "bg-slate-900 text-white border-slate-900";
    label = "Terkunci";
  } else if (s === "IN_MANIFEST" || s === "MANIFESTED" || s === "SENT") {
    badgeClass = "bg-emerald-50 text-[#008f78] border-emerald-200/80";
    label = "Dimanifest";
  } else if (s === "ARCHIVED" || s === "DIARSIPKAN") {
    badgeClass = "bg-indigo-50 text-indigo-700 border-indigo-200/80";
    label = "Diarsipkan";
  } else if (s === "COMPLETED" || s === "SELESAI") {
    badgeClass = "bg-[#e6f6f4] text-[#008f78] border-[#00a389]/30";
    label = "Selesai";
  } else if (s === "DRAFT" || s === "DRAF") {
    badgeClass = "bg-slate-100 text-slate-700 border-slate-200/80";
    label = "Draf";
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-normal border shadow-3xs font-sans capitalize ${badgeClass}`}>
      {label}
    </span>
  );
};

const normalizeAppItem = (item: any, manifestStatus?: string) => {
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

  let calculatedOwnerName = item.ownerName || item.displayOwnerName || item.namaPemohon || item.namaPemilik || '';
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

  let appStatus = item.status || 'BUNDLED';
  if (manifestStatus === 'SENT' && (appStatus === 'BUNDLED' || appStatus === 'LOCKED' || appStatus === 'IN_MANIFEST')) {
    appStatus = 'DELIVERED';
  }

  return {
    ...item,
    applicationNumber: item.applicationNumber || item.nomorPelayanan || '-',
    serviceNumberDate: item.serviceNumberDate || item.tanggalNoPelayanan || item.createdAt,
    completionDate: item.completionDate || item.tanggalPenyelesaian,
    nop: calculatedNop || '-',
    ownerName: calculatedOwnerName || '-',
    status: appStatus,
  };
};

// Helper for Bundle Status Badge Styling
const getStatusBadge = (status: string) => {
  const s = (status || "").toUpperCase();
  if (s === "DRAFT") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 shadow-3xs font-sans">
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
  if (s === "IN_MANIFEST" || s === "MANIFESTED" || s === "SENT") {
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
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 shadow-3xs font-sans">
      <span>{status}</span>
    </span>
  );
};

// Formatter for Displaying Date
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

export interface SenderHistoryDetailViewProps {
  manifest: any;
  onBack: () => void;
  onRevisiManifest?: (manifestId: string) => void;
  onUploadReceipt?: (manifestId: string, file: File) => Promise<void>;
}

export const SenderHistoryDetailView: React.FC<SenderHistoryDetailViewProps> = ({
  manifest,
  onBack,
  onRevisiManifest,
  onUploadReceipt,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequestForDetails, setSelectedRequestForDetails] = useState<any | null>(null);
  const [selectedBundleForDetail, setSelectedBundleForDetail] = useState<any | null>(null);
  const [displayMode, setDisplayMode] = useState<"permohonan" | "pemohon">("permohonan");
  const [isUploading, setIsUploading] = useState(false);
  const [bundleViewMode, setBundleViewMode] = useState<"grid" | "list">("grid");
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const rawManifestNumber = manifest?.manifestNumber || manifest?.nomorManifest || "—";
  const status = manifest?.status || "LOCKED";
  const bundlesList = useMemo(() => {
    return manifest?.bundles || manifest?.bundle || [];
  }, [manifest]);

  const pengirimName =
    manifest?.createdBy?.name ||
    manifest?.user?.name ||
    manifest?.pengirim?.name ||
    "Pengirim";

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUploadReceipt) return;
    setIsUploading(true);
    try {
      await onUploadReceipt(manifest.id, file);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Mode Base List: transform applications based on displayMode ('permohonan' vs 'pemohon')
  const modeBaseList = useMemo(() => {
    if (!selectedBundleForDetail) return [];
    const subApplications = selectedBundleForDetail.applications || selectedBundleForDetail.permohonan || [];

    if (displayMode === "permohonan") {
      return subApplications.map((item: any) => {
        const norm = normalizeAppItem(item, status);
        return { ...norm, uniqueRowKey: norm.id || norm.applicationNumber, original: item };
      });
    }

    // DisplayMode === 'pemohon': FlatMap per target owner for Mutasi Sebagian
    return subApplications.flatMap((item: any) => {
      const norm = normalizeAppItem(item, status);
      const appType = norm.applicationType || norm.jenisPermohonan || "";
      const isPartial = appType === "PARTIAL_MUTATION" || appType === "MUTASI_SEBAGIAN";
      const targets = Array.isArray(norm.targetData) && norm.targetData.length > 0
        ? norm.targetData
        : (Array.isArray(norm.dataBaru) ? norm.dataBaru : []);

      if (isPartial && targets.length > 0) {
        return targets.map((td: any, idx: number) => ({
          ...norm,
          uniqueRowKey: `${norm.id || norm.applicationNumber}-pecahan-${idx}`,
          ownerName: td.ownerName || td.namaPemilikBaru || norm.ownerName,
          isPecahanRow: true,
          pecahanInfo: `(Pecahan ${idx + 1}/${targets.length})`,
          original: item,
        }));
      }

      return [{ ...norm, uniqueRowKey: norm.id || norm.applicationNumber, original: item }];
    });
  }, [selectedBundleForDetail, displayMode]);

  // Filtered bundle applications by search
  const filteredSubApplications = useMemo(() => {
    if (!searchQuery.trim()) return modeBaseList;
    const q = searchQuery.toLowerCase().trim();
    return modeBaseList.filter((item: any) => {
      const appNo = (item.applicationNumber || "").toLowerCase();
      const owner = (item.ownerName || "").toLowerCase();
      const nop = (item.nop || "").toLowerCase();
      return appNo.includes(q) || owner.includes(q) || nop.includes(q);
    });
  }, [modeBaseList, searchQuery]);

  // IF A BUNDLE IS CLICKED, RENDER THE BUNDLE DETAIL SUB-PAGE VIEW (PERSIS BUNDLE HISTORY DETAIL VIEW)
  if (selectedBundleForDetail) {
    const bundleRawNum = selectedBundleForDetail.bundleNumber || selectedBundleForDetail.nomorBundle || "";
    const bundleFormattedNum = bundleRawNum
      ? formatBundleNumber(bundleRawNum, selectedBundleForDetail.createdAt)
      : "—";
    const bundleStatus = selectedBundleForDetail.status || status;

    return (
      <div className="w-full flex flex-col gap-4 font-sans select-none animate-fadeIn">
        {/* Top Header: Back Button & Bundle Title */}
        <div className="flex flex-col gap-2 select-none">
          <div>
            <button
              type="button"
              onClick={() => {
                setSelectedBundleForDetail(null);
                setSearchQuery("");
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/90 hover:border-slate-300 rounded-md text-xs font-semibold text-slate-700 hover:text-slate-900 transition-all shadow-3xs cursor-pointer active:scale-95"
            >
              <ChevronLeft className="w-4 h-4 text-slate-500" />
              <span>Kembali ke Daftar Bundle</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-sans">
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight font-mono">
                {bundleFormattedNum}
              </h1>
              {getStatusBadge(bundleStatus)}
            </div>
          </div>

          <div className="w-full border-b border-slate-200/80 my-0.5" />
        </div>

        {/* Toolbar Search for Applications & Display Mode Switcher (Permohonan vs Pemohon) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none mt-1">
          {/* Left Side: Search Bar */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari NOP, No. Permohonan, atau Nama Pemohon..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-10 py-1.5 bg-white border border-slate-200/90 rounded-md text-[13px] font-normal text-slate-900 focus:outline-none focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 transition-all font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right Side: Display Mode Switcher (Permohonan vs Pemohon) */}
          <div className="bg-slate-200/70 p-0.5 rounded-md flex items-center gap-0.5 border border-slate-300/60 text-[13px] font-normal select-none h-8 font-sans shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setDisplayMode("permohonan")}
              className={`h-7 px-3 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                displayMode === "permohonan"
                  ? "bg-white text-slate-900 shadow-3xs font-normal"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Tampilkan 1 baris per Nomor Pelayanan (NOPEL)"
            >
              <span>Permohonan</span>
            </button>
            <button
              type="button"
              onClick={() => setDisplayMode("pemohon")}
              className={`h-7 px-3 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                displayMode === "pemohon"
                  ? "bg-white text-slate-900 shadow-3xs font-normal"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Tampilkan rincian pecahan pemilik baru (Mutasi Sebagian)"
            >
              <span>Pemohon</span>
            </button>
          </div>
        </div>

        {/* Applications Table */}
        <div className="flex flex-col gap-3">
          {filteredSubApplications.length === 0 ? (
            <div className="py-12 text-center">
              <EmptyDataAnimation
                title={searchQuery ? "Tidak Ada Permohonan Ditemukan" : "Belum Ada Permohonan Dalam Bundle Ini"}
                description={
                  searchQuery
                    ? "Coba ubah kata kunci pencarian permohonan."
                    : "Belum ada berkas permohonan yang terdaftar pada map bundle ini."
                }
              />
            </div>
          ) : (
            <div className="w-full overflow-x-auto select-none mt-1">
              <table className="w-full text-left border-collapse font-sans">
                <thead>
                  <tr className="border-b border-slate-200 text-[13px] font-normal text-slate-600 select-none whitespace-nowrap">
                    <th className="py-2.5 px-3 min-w-[180px] font-normal text-slate-600 whitespace-nowrap">No. Permohonan</th>
                    <th className="py-2.5 px-3 min-w-[140px] font-normal text-slate-600 text-center whitespace-nowrap">Jenis Permohonan</th>
                    <th className="py-2.5 px-3 min-w-[140px] font-normal text-slate-600 whitespace-nowrap">Tgl. Permohonan</th>
                    <th className="py-2.5 px-3 min-w-[140px] font-normal text-slate-600 whitespace-nowrap">Tgl. Selesai</th>
                    <th className="py-2.5 px-3 min-w-[180px] font-normal text-slate-600 whitespace-nowrap">Nama Pemohon</th>
                    <th className="py-2.5 px-3 min-w-[130px] font-normal text-slate-600 whitespace-nowrap">Status</th>
                    <th className="py-2.5 px-3 w-12 text-center font-normal text-slate-600 whitespace-nowrap"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80 text-[13px] font-normal text-slate-700">
                  {filteredSubApplications.map((item: any, idx: number) => {
                    return (
                      <tr
                        key={item.uniqueRowKey || item.id || idx}
                        onClick={() => setSelectedRequestForDetails(item.original || item)}
                        className="group hover:bg-slate-100/80 transition-colors cursor-pointer"
                      >
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                              <FileSpreadsheet className="w-3.5 h-3.5 stroke-[2.2]" />
                            </div>
                            <span className="font-normal text-slate-700 font-mono tracking-tight text-[13px]">
                              {item.applicationNumber}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center">
                            {getJenisPermohonanBadge(item.applicationType || item.jenisPermohonan)}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-700 text-[13px] font-normal">
                          <span>{formatDateDisplay(item.serviceNumberDate)}</span>
                        </td>
                        <td className="py-3 px-3 text-slate-700 text-[13px] font-normal">
                          <span>{formatDateDisplay(item.completionDate)}</span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-700 font-normal text-[13px] truncate max-w-[220px] capitalize">
                              {toTitleCase(item.ownerName)}
                            </span>
                            {item.isPecahanRow && (
                              <span className="text-[10px] text-slate-400 font-mono shrink-0">
                                {item.pecahanInfo}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center">
                            {getAppStatusBadge(item.status)}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRequestForDetails(item.original || item);
                            }}
                            className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
                            title="Lihat Detail Permohonan"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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
  }

  // MAIN VIEW: DAFTAR BUNDLE MANIFEST (MAP BUNDLE LIST VIEW)
  return (
    <div className="w-full flex flex-col gap-4 font-sans select-none animate-fadeIn">
      {/* Top Back Navigation Bar & Action Buttons */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/90 hover:border-slate-300 rounded-md text-xs font-semibold text-slate-700 hover:text-slate-900 transition-all shadow-3xs cursor-pointer active:scale-95"
        >
          <ChevronLeft className="w-4 h-4 text-slate-500" />
          <span>Kembali</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Print Cover Letter */}
          <a
            href={`/api/pdf/surat-pengantar-manifest/${manifest.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 rounded-md font-semibold text-xs transition-all shadow-3xs flex items-center gap-1.5"
            title="Cetak Surat Pengantar Manifest"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Cetak Surat Pengantar</span>
          </a>

          {/* Upload / View Receipt */}
          {status === "SENT" && manifest.buktiTandaTerima ? (
            <a
              href={manifest.buktiTandaTerima}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-[#008f78] rounded-md font-semibold text-xs transition-all shadow-3xs flex items-center gap-1.5"
            >
              <FileCheck className="w-3.5 h-3.5 text-[#00a389]" />
              <span>Lihat Bukti Terkirim</span>
            </a>
          ) : (
            onUploadReceipt && (
              <>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*,application/pdf"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-3.5 py-1.5 bg-[#00a389] hover:bg-[#008f78] text-white rounded-md font-semibold text-xs transition-all shadow-3xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5 text-white" />
                  <span>{isUploading ? "Mengunggah..." : "Unggah Bukti Resi"}</span>
                </button>
              </>
            )
          )}

          {/* Revert Lock to Draft */}
          {status === "LOCKED" && onRevisiManifest && (
            <button
              type="button"
              onClick={() => onRevisiManifest(manifest.id)}
              className="px-3 py-1.5 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 rounded-md font-semibold text-xs transition-all shadow-3xs flex items-center gap-1.5 cursor-pointer"
              title="Kembalikan Manifest ke Status Draf"
            >
              <RefreshCw className="w-3.5 h-3.5 text-rose-600" />
              <span>Revisi ke Draf</span>
            </button>
          )}
        </div>
      </div>

      {/* DETAIL MANIFEST & DAFTAR BUNDLE */}
      <div className="flex flex-col gap-3">
        {/* Header Manifest & User Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-mono text-base font-bold text-slate-900 tracking-tight">
                  {rawManifestNumber}
                </h2>
              </div>
            </div>
          </div>
        </div>

        {/* Selectable Map Bundle Section (Kisi / List View Mode Toggle) */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-end gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              {/* View Mode Switcher untuk Bundle (Kisi / List) */}
              <div className="flex items-center bg-white border border-slate-200/90 rounded-md p-0.5 shadow-3xs shrink-0 h-8 gap-0.5">
                <button
                  type="button"
                  onClick={() => setBundleViewMode("grid")}
                  className={`h-7 px-2.5 rounded-md transition-all cursor-pointer flex items-center justify-center ${
                    bundleViewMode === "grid"
                      ? "bg-[#00a389] text-white shadow-3xs"
                      : "text-slate-500 hover:text-[#00a389] hover:bg-slate-100"
                  }`}
                  title="Tampilan Kisi (Grid View)"
                >
                  <LayoutGrid className="w-3.5 h-3.5 stroke-[2.2]" />
                </button>
                <button
                  type="button"
                  onClick={() => setBundleViewMode("list")}
                  className={`h-7 px-2.5 rounded-md transition-all cursor-pointer flex items-center justify-center ${
                    bundleViewMode === "list"
                      ? "bg-[#00a389] text-white shadow-3xs"
                      : "text-slate-500 hover:text-[#00a389] hover:bg-slate-100"
                  }`}
                  title="Tampilan Tabel (List View)"
                >
                  <LayoutList className="w-3.5 h-3.5 stroke-[2.2]" />
                </button>
              </div>
            </div>
          </div>

          {bundlesList.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400 font-normal italic">
              Tidak ada map bundle dalam manifest ini.
            </div>
          ) : bundleViewMode === "grid" ? (
            /* KISI / GRID VIEW BUNDLE */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 mt-1">
              {bundlesList.map((b: any, idx: number) => {
                const apps = b.applications || b.permohonan || [];
                const rawNum = b.bundleNumber || b.nomorBundle || "";
                const formattedNum = formatBundleNumber(rawNum, b.createdAt);
                const creator = b.createdBy?.name || b.creatorName || b.user?.name || pengirimName || "Pengirim";
                const appType =
                  b.applicationType ||
                  b.jenisPermohonan ||
                  apps[0]?.applicationType ||
                  apps[0]?.jenisPermohonan ||
                  "";
                const bundleStatus = b.status || status;

                return (
                  <div
                    key={b.id || idx}
                    onClick={() => setSelectedBundleForDetail(b)}
                    className="group bg-white border border-slate-200/90 hover:border-slate-300 rounded-md p-4 shadow-3xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 relative overflow-hidden min-h-[130px] font-sans"
                  >
                    {/* Tile Header: Top Left = Nomor Bundle, Top Right = Three Dots Menu */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[13px] font-normal font-mono text-slate-700 truncate tracking-tight" title={formattedNum}>
                        {formattedNum}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBundleForDetail(b);
                        }}
                        className="p-1 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                        title="Lihat Detail Bundle"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Tile Sub-Header: Jenis Permohonan Badge */}
                    <div className="flex items-center gap-1.5">
                      {getJenisPermohonanBadge(appType)}
                    </div>

                    {/* Tile Body: Nama Pembuat */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium truncate">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate" title={creator}>{creator}</span>
                    </div>

                    {/* Tile Footer: Tanggal Dibuat & Status Badge */}
                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px] text-slate-500">
                      <div className="flex items-center gap-1 truncate">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{formatDateDisplay(b.createdAt)}</span>
                      </div>
                      {getStatusBadge(bundleStatus)}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* TABEL / LIST VIEW BUNDLE */
            <div className="w-full overflow-x-auto select-none mt-1">
              <table className="w-full text-left border-collapse font-sans">
                <thead>
                  <tr className="border-b border-slate-200 text-[13px] font-normal text-slate-600 select-none">
                    <th className="py-2.5 px-3 min-w-[200px] font-normal text-slate-600">Nomor Bundle</th>
                    <th className="py-2.5 px-3 min-w-[130px] font-normal text-slate-600 text-center">Jenis Permohonan</th>
                    <th className="py-2.5 px-3 min-w-[140px] font-normal text-slate-600">Tanggal Dibuat</th>
                    <th className="py-2.5 px-3 min-w-[160px] font-normal text-slate-600">Nama Pembuat</th>
                    <th className="py-2.5 px-3 min-w-[130px] font-normal text-slate-600 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80 text-[13px] font-normal text-slate-700">
                  {bundlesList.map((b: any, idx: number) => {
                    const apps = b.applications || b.permohonan || [];
                    const rawNum = b.bundleNumber || b.nomorBundle || "";
                    const formattedNum = formatBundleNumber(rawNum, b.createdAt);
                    const creator = b.createdBy?.name || b.creatorName || b.user?.name || pengirimName || "Pengirim";
                    const appType =
                      b.applicationType ||
                      b.jenisPermohonan ||
                      apps[0]?.applicationType ||
                      apps[0]?.jenisPermohonan ||
                      "";
                    const bundleStatus = b.status || status;

                    return (
                      <tr
                        key={b.id || idx}
                        onClick={() => setSelectedBundleForDetail(b)}
                        className="group hover:bg-slate-100/80 transition-colors cursor-pointer"
                      >
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                              <FileSpreadsheet className="w-3.5 h-3.5 stroke-[2.2]" />
                            </div>
                            <span className="font-normal text-slate-700 font-mono tracking-tight text-[13px]">
                              {formattedNum}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center">
                            {getJenisPermohonanBadge(appType)}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-700 text-[13px] font-normal">
                          {formatDateDisplay(b.createdAt)}
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-slate-700 font-normal text-[13px] truncate max-w-[220px]">
                            {creator}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end">
                            {getStatusBadge(bundleStatus)}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal Overlay */}
      <DetailsModal
        isOpen={!!selectedRequestForDetails}
        selectedRequest={selectedRequestForDetails}
        onClose={() => setSelectedRequestForDetails(null)}
      />
    </div>
  );
};
