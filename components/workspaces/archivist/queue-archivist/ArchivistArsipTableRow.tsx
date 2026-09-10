"use client";

import React from "react";
import {
  Star,
  Copy,
  Check,
  AlertTriangle,
  Clock,
  RotateCcw,
  FolderOpen,
  FileSpreadsheet,
  FileCheck,
  ArrowLeftRight,
} from "lucide-react";
import { formatNop, toTitleCase, getAbbreviatedJenis } from "@/components/workspaces/shared/constants";

const STATUS_LABEL_MAP: Record<string, string> = {
  SUBMITTED: "Diajukan",
  REVISION: "Revisi",
  BUNDLED: "Terbundel",
  LOCKED: "Terkunci",
  IN_MANIFEST: "Dimanifest",
  ARCHIVED: "Diarsipkan",
  COMPLETED: "Selesai",
  REJECTED: "Ditolak",
  DRAFT: "Draf",
  VOID: "Dibatalkan",
  SENT: "Dikirim",
};

const getStatusLabel = (status: string) => STATUS_LABEL_MAP[status] || status;

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case "SUBMITTED":
      return "bg-amber-50 text-amber-700 border-amber-200/80";
    case "REVISION":
      return "bg-rose-50 text-rose-700 border-rose-200/80";
    case "BUNDLED":
      return "bg-blue-50 text-blue-700 border-blue-200/80";
    case "ARCHIVED":
      return "bg-indigo-50 text-indigo-700 border-indigo-200/80";
    case "COMPLETED":
      return "bg-[#e6f6f4] text-[#008f78] border-[#00a389]/30";
    case "REJECTED":
      return "bg-rose-50 text-rose-700 border-rose-200/80";
    case "DRAFT":
      return "bg-slate-100 text-slate-700 border-slate-200/80";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200/80";
  }
};

export const isOverdue = (dateStr: string | null | undefined, status: string): boolean => {
  if (!dateStr) return false;
  if (status === "COMPLETED" || status === "REJECTED" || status === "ARCHIVED") return false;
  return new Date(dateStr) < new Date();
};

export interface ArchivistArsipTableRowProps {
  item: any;
  itemNumber: number;
  selectedBundle: any | null;
  copiedText: string | null;
  loading: boolean;
  arsipDisplayMode: "berkas" | "pemohon";
  onSelect: (item: any) => void;
  onToggleFavorite: (id: string) => void;
  onCopy: (e: React.MouseEvent, text: string) => void;
  onUploadFile: (permohonanId: string, e: React.ChangeEvent<HTMLInputElement>, dataBaruId?: string) => void;
  triggerFileInput: (permohonanId: string) => void;
  fileInputRefs: React.MutableRefObject<{ [key: string]: HTMLInputElement | null }>;
  checkPermohonanNeedsReupload: (p: any, targetId?: string | null) => boolean;
  onOpenCorrectionModal: (item: any) => void;
  onOpenFractionsModal: (item: any) => void;
}

export const ArchivistArsipTableRow: React.FC<ArchivistArsipTableRowProps> = React.memo(
  ({
    item: p,
    itemNumber,
    selectedBundle,
    copiedText,
    loading,
    arsipDisplayMode,
    onSelect,
    onToggleFavorite,
    onCopy,
    onUploadFile,
    triggerFileInput,
    fileInputRefs,
    checkPermohonanNeedsReupload,
    onOpenCorrectionModal,
    onOpenFractionsModal,
  }) => {
    const isFrozen = p.permintaanKoreksi && p.permintaanKoreksi.length > 0;
    const activeArchives = (p.arsipDigital || []).filter((ad: any) => ad.status === "ACTIVE");
    const activeArchive = p.targetDataBaruId
      ? activeArchives.find((ad: any) => ad.dataBaruId === p.targetDataBaruId)
      : activeArchives.find((ad: any) => ad.dataBaruId === null) ||
        activeArchives[activeArchives.length - 1] ||
        activeArchives[0];

    const needsReUpload = checkPermohonanNeedsReupload(p, p.targetDataBaruId);
    const isArchived = p.status === "ARCHIVED";

    const nopolDate = p.tanggalNoPelayanan || p.serviceNumberDate
      ? new Date(p.tanggalNoPelayanan || p.serviceNumberDate).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "—";

    const penyelesaianDate = p.tanggalPenyelesaian || p.completionDate
      ? new Date(p.tanggalPenyelesaian || p.completionDate).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "—";

    const nomorVal = p.nomorPelayanan || p.nomorPermohonan || p.applicationNumber || "-";

    const firstPrev = (p.previousData && p.previousData[0]) || (p.dataLama && p.dataLama[0]) || {};
    const firstTarget = (p.targetData && p.targetData[0]) || (p.dataBaru && p.dataBaru[0]) || {};
    const appType = p.jenisPermohonan || p.applicationType || '';

    let rawNop = p.nop;
    if (!rawNop || rawNop === '-') {
      if (appType === 'NEW_TAX_OBJECT' || appType === 'OBJEK_PAJAK_BARU') {
        rawNop = firstTarget.nopTemporary || firstTarget.nop || '-';
      } else {
        rawNop = firstPrev.nop || '-';
      }
    }
    const formattedNop = formatNop(rawNop);

    let rawOwnerName = p.displayNamaWajibPajak || p.namaWajibPajak || p.ownerName;
    if (!rawOwnerName || rawOwnerName === '-') {
      if (appType === 'REACTIVATION' || appType === 'PENGAKTIFAN') {
        rawOwnerName = firstPrev.ownerName || firstPrev.namaPemilikLama || '-';
      } else if (appType === 'PARTIAL_MUTATION' || appType === 'MUTASI_SEBAGIAN') {
        const firstName = firstTarget.ownerName || firstTarget.namaPemilikBaru || '';
        const totalCount = (p.targetData || p.dataBaru || []).length;
        if (firstName && totalCount > 1) {
          rawOwnerName = `${firstName} (${totalCount})`;
        } else {
          rawOwnerName = firstName || '-';
        }
      } else {
        const targetList = p.targetData || p.dataBaru || [];
        if (targetList.length > 0) {
          rawOwnerName = targetList
            .map((t: any) => t.ownerName || t.namaPemilikBaru)
            .filter(Boolean)
            .join(', ');
        }
        if (!rawOwnerName) {
          rawOwnerName = firstPrev.ownerName || '-';
        }
      }
    }
    const ownerName = toTitleCase(rawOwnerName || "-");
    const jenisVal = p.jenisPermohonan || p.applicationType;

    return (
      <tr
        onClick={() => onSelect(p)}
        className={`hover:bg-slate-50/90 transition-colors duration-150 cursor-pointer group relative text-[12px] font-normal text-slate-600 font-sans h-11 border-b border-slate-100 ${
          p.isPecahanRow
            ? "border-l-3 border-l-[#00a389] bg-[#00a389]/5"
            : needsReUpload
            ? "bg-amber-50/50 border-l-4 border-l-amber-500"
            : isFrozen
            ? "bg-amber-50/20"
            : ""
        }`}
      >
        {/* 1. Index */}
        <td className="py-2.5 px-4 text-center text-[12px] font-normal text-slate-600 font-sans">
          {itemNumber}
        </td>

        {/* 2. Star Favorite */}
        <td
          className="py-2.5 px-2 text-center"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(p.id);
          }}
        >
          <button
            type="button"
            className="p-1 hover:scale-125 active:scale-75 transition-all duration-200 text-slate-300 hover:text-amber-500 cursor-pointer"
            title={p.isFavorite ? "Hapus dari Favorit" : "Tandai Favorit"}
          >
            <Star
              className={`w-4 h-4 transition-all duration-200 ${
                p.isFavorite
                  ? "text-amber-500 fill-amber-500 drop-shadow-[0_0_6px_rgba(245,158,11,0.55)]"
                  : "text-slate-300"
              }`}
            />
          </button>
        </td>

        {/* 3. Tgl Input */}
        <td className="py-2.5 px-4 text-[12px] font-normal text-slate-600 font-sans whitespace-nowrap capitalize">
          {p.createdAt
            ? new Date(p.createdAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "—"}
        </td>

        {/* 4. Petugas Input */}
        <td className="py-2.5 px-4 text-slate-600 text-[12px] font-normal font-sans whitespace-nowrap capitalize">
          <div className="flex items-center gap-1.5 min-w-0" title={p.penginput?.name || "Petugas Input"}>
            <span className="truncate max-w-[130px] capitalize font-sans">
              {toTitleCase(p.penginput?.name || "Petugas Input")}
            </span>
          </div>
        </td>

        {/* 5. Tgl Nopel */}
        <td className="py-2.5 px-4 text-[12px] font-normal text-slate-600 font-sans whitespace-nowrap capitalize">
          {nopolDate}
        </td>

        {/* 6. Estimasi Selesai SLA */}
        <td className="py-2.5 px-4 whitespace-nowrap font-sans">
          {penyelesaianDate !== "—" ? (
            <div className="flex items-center gap-1">
              {isOverdue(p.tanggalPenyelesaian || p.completionDate, p.status) && (
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              )}
              <span
                className={`text-[12px] font-sans font-normal capitalize ${
                  isOverdue(p.tanggalPenyelesaian || p.completionDate, p.status)
                    ? "text-rose-600 font-normal"
                    : "text-slate-600"
                }`}
              >
                {penyelesaianDate}
              </span>
            </div>
          ) : (
            "—"
          )}
        </td>

        {/* 7. No Permohonan / Pelayanan */}
        <td className="py-2.5 px-4 min-w-[150px] group/cell relative font-sans">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[12px] font-normal text-slate-600 font-sans tracking-tight capitalize">
              {nomorVal}
            </span>
            {isFrozen && (
              <span className="text-[8px] font-extrabold uppercase bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 select-none">
                <Clock className="w-2.5 h-2.5 shrink-0 animate-pulse" />
                Frozen
              </span>
            )}
            {needsReUpload && !isFrozen && (
              <span className="text-[8.5px] font-black uppercase bg-amber-500 text-white px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-3xs select-none">
                <RotateCcw className="w-2.5 h-2.5 shrink-0" />
                Re-upload
              </span>
            )}
            <button
              onClick={(e) => onCopy(e, nomorVal)}
              className="p-1 rounded opacity-0 group-hover/cell:opacity-100 hover:bg-slate-100 text-slate-400 hover:text-[#00a389] transition-all cursor-pointer flex items-center justify-center w-5 h-5 select-none"
              title="Salin Nomor"
            >
              {copiedText === nomorVal ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 transition-all duration-200 transform scale-110" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          </div>
        </td>

        {/* 8. NOP */}
        <td className="py-2.5 px-4 min-w-[210px] whitespace-nowrap group/cell relative font-sans">
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="text-[12px] font-normal text-slate-600 font-sans whitespace-nowrap capitalize">
              {formattedNop}
            </span>
            <button
              onClick={(e) => onCopy(e, p.nop)}
              className="p-1 rounded opacity-0 group-hover/cell:opacity-100 hover:bg-slate-100 text-slate-400 hover:text-[#00a389] transition-all cursor-pointer flex items-center justify-center w-5 h-5 select-none"
              title="Salin NOP"
            >
              {copiedText === p.nop ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 transition-all duration-200 transform scale-110" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          </div>
        </td>

        {/* 9. Nama Pemohon */}
        <td className="py-2.5 px-4 group/cell relative font-sans">
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="text-[12px] font-normal text-slate-600 whitespace-nowrap capitalize font-sans">
              {ownerName}
            </span>
            {p.isPecahanRow && (
              <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-1.5 py-0.2 rounded-md shrink-0 font-sans">
                #{p.pecahanIndex}/{p.totalPecahan}
              </span>
            )}
            <button
              onClick={(e) => onCopy(e, p.displayNamaWajibPajak || p.namaWajibPajak || p.ownerName)}
              className="p-1 rounded opacity-0 group-hover/cell:opacity-100 hover:bg-slate-100 text-slate-400 hover:text-[#00a389] transition-all cursor-pointer flex items-center justify-center w-5 h-5 select-none"
              title="Salin Nama Pemohon"
            >
              {copiedText === (p.displayNamaWajibPajak || p.namaWajibPajak || p.ownerName) ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 transition-all duration-200 transform scale-110" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          </div>
        </td>

        {/* 10. Jenis Layanan */}
        <td className="py-2.5 px-4 whitespace-nowrap font-sans text-center">
          <span
            className="text-[11px] font-semibold text-[#008f78] bg-[#00a389]/12 border border-[#00a389]/20 px-2.5 py-0.5 rounded-md font-sans"
            title={jenisVal?.replace(/_/g, " ")}
          >
            {getAbbreviatedJenis(jenisVal)}
          </span>
        </td>

        {/* 11. Status */}
        <td className="py-2.5 px-4 whitespace-nowrap font-sans text-center">
          <span
            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md border ${getStatusBadgeClass(
              p.status || "BUNDLED"
            )}`}
          >
            {getStatusLabel(p.status || "BUNDLED")}
          </span>
        </td>

        {/* 12. Tgl Upload */}
        <td className="py-2.5 px-4 text-[12px] font-normal text-slate-600 font-sans whitespace-nowrap capitalize">
          {activeArchive?.createdAt
            ? new Date(activeArchive.createdAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "—"}
        </td>

        {/* 13. Actions */}
        <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-center gap-1.5">
            {isFrozen ? (
              <span className="text-[9px] font-extrabold px-2 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap select-none">
                Frozen
              </span>
            ) : (
              <>
                {arsipDisplayMode === "berkas" &&
                (p.jenisPermohonan === "MUTASI_SEBAGIAN" || p.applicationType === "MUTASI_SEBAGIAN") ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenFractionsModal(p);
                    }}
                    className={`p-1.5 rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-center shrink-0 border hover:scale-105 active:scale-95 ${
                      isArchived
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                        : "bg-[#00a389]/10 text-[#008f78] border-[#00a389]/20 hover:bg-[#00a389]/20"
                    }`}
                    title="Kelola berkas pecahan (Mutasi Sebagian)"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <>
                    <input
                      type="file"
                      accept=".pdf"
                      ref={(el) => {
                        fileInputRefs.current[p.uniqueRowKey || p.id] = el;
                      }}
                      onChange={(e) => onUploadFile(p.id, e, p.targetDataBaruId)}
                      className="hidden"
                      disabled={isFrozen || loading}
                    />

                    {p.status === "BUNDLED" && needsReUpload && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerFileInput(p.uniqueRowKey || p.id);
                        }}
                        disabled={loading}
                        className="p-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg shadow-3xs transition-all cursor-pointer flex items-center justify-center shrink-0"
                        title="Re-upload arsip PDF baru"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {p.status === "BUNDLED" && !needsReUpload && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerFileInput(p.uniqueRowKey || p.id);
                        }}
                        disabled={loading}
                        className="p-1.5 bg-[#00a389] hover:bg-[#008f78] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg shadow-3xs transition-all cursor-pointer flex items-center justify-center shrink-0"
                        title="Unggah arsip PDF"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {isArchived && activeArchive && (
                      <a
                        href={activeArchive.urlBlob}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg text-emerald-700 transition-all flex items-center justify-center shrink-0"
                        title={`v${activeArchive.versi || 1} — Buka arsip PDF`}
                      >
                        <FileCheck className="w-3.5 h-3.5 text-[#00a389]" />
                      </a>
                    )}

                    {isArchived && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerFileInput(p.uniqueRowKey || p.id);
                        }}
                        disabled={loading}
                        className="p-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-500 transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center shrink-0"
                        title="Ganti file arsip"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </>
                )}

                {(() => {
                  const isBundleInManifest = selectedBundle?.status === "IN_MANIFEST";
                  const hasPengirimReturnRequest = p.permintaanKoreksi?.some(
                    (k: any) =>
                      k.jenisKoreksi === "KEMBALIKAN_KE_PENGARSIP" && k.status === "APPROVED"
                  );
                  const canReturnToPeneliti = !isBundleInManifest || hasPengirimReturnRequest;

                  return (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!canReturnToPeneliti) return;
                        onOpenCorrectionModal(p);
                      }}
                      disabled={loading || isFrozen || !canReturnToPeneliti}
                      className={`p-1.5 rounded-lg border transition-all flex items-center justify-center shrink-0 shadow-3xs ${
                        !canReturnToPeneliti
                          ? "bg-slate-100/60 border-slate-200/60 text-slate-300 cursor-not-allowed opacity-50"
                          : "bg-slate-50 border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-400 cursor-pointer"
                      }`}
                      title={
                        !canReturnToPeneliti
                          ? "Bundle sudah di Pengirim (Dimanifest). Tidak dapat dikembalikan ke Peneliti tanpa adanya pengembalian resmi dari Pengirim."
                          : "Kembalikan ke Peneliti"
                      }
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                    </button>
                  );
                })()}
              </>
            )}
          </div>
        </td>
      </tr>
    );
  }
);

ArchivistArsipTableRow.displayName = "ArchivistArsipTableRow";
