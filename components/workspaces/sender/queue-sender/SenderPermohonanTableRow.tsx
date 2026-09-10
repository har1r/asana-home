"use client";

import React from "react";
import { Star, Clock, AlertTriangle, Check, Copy, CircleArrowLeft } from "lucide-react";
import { formatNop, toTitleCase } from "@/components/workspaces/shared/constants";

const getAbbreviatedJenis = (jenis: string) => {
  switch (jenis) {
    case "OBJEK_PAJAK_BARU":
      return "OPB";
    case "MUTASI_SEBAGIAN":
      return "MS";
    case "MUTASI_HABIS_REGULER":
      return "MHR";
    case "MUTASI_HABIS_UPDATE":
      return "MHU";
    case "PEMBETULAN":
      return "PBT";
    case "PENGAKTIFAN":
      return "AKT";
    default:
      return jenis?.replace(/_/g, " ") || "Umum";
  }
};

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

const getStatusLabel = (status: string) => {
  if (!status) return "—";
  if (STATUS_LABEL_MAP[status]) return STATUS_LABEL_MAP[status];
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

const isOverdue = (tanggalPenyelesaian?: string | null, status?: string) => {
  if (!tanggalPenyelesaian) return false;
  if (status === "ARCHIVED" || status === "SENT") return false;
  const now = new Date();
  const target = new Date(tanggalPenyelesaian);
  return target < now;
};

interface SenderPermohonanTableRowProps {
  permohonan: any;
  itemNumber: number;
  selectedBundleInManifest: any;
  selectedManifestStatus: string;
  copiedText: string | null;
  loading: boolean;
  onCopy: (e: React.MouseEvent, text?: string | null) => void;
  onToggleFavorite: (permohonanId: string) => void;
  onSelectDetails: (permohonan: any) => void;
  onOpenCorrectionModal: (permohonan: any) => void;
  onReportBundleLost: (bundleId: string, nomorBundle: string) => void;
}

export const SenderPermohonanTableRow: React.FC<SenderPermohonanTableRowProps> = React.memo(({
  permohonan: p,
  itemNumber,
  selectedBundleInManifest,
  selectedManifestStatus,
  copiedText,
  loading,
  onCopy,
  onToggleFavorite,
  onSelectDetails,
  onOpenCorrectionModal,
  onReportBundleLost,
}) => {
  const isFrozen = p.permintaanKoreksi && p.permintaanKoreksi.length > 0;
  const nopolDate = p.tanggalNoPelayanan
    ? new Date(p.tanggalNoPelayanan).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
    : "—";
  const penyelesaianDate = p.tanggalPenyelesaian
    ? new Date(p.tanggalPenyelesaian).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
    : "—";

  return (
    <tr
      onClick={() => onSelectDetails(p)}
      className={`hover:bg-slate-50 transition-colors duration-150 cursor-pointer group relative text-[12px] font-normal text-slate-600 font-sans ${
        p.isPecahanRow ? "border-l-3 border-l-[#00a389] bg-[#00a389]/5" : isFrozen ? "bg-amber-50/20" : ""
      }`}
    >
      <td className="py-3 px-4 text-center text-[12px] font-normal text-slate-400 font-mono">
        {itemNumber}
      </td>

      <td
        className="py-3 px-2 text-center"
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

      <td className="py-3 px-4 text-[12px] font-normal text-slate-600 font-sans whitespace-nowrap capitalize">
        {p.createdAt
          ? new Date(p.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
          : "—"}
      </td>

      <td className="py-3 px-4 text-slate-600 text-[12px] font-normal font-sans whitespace-nowrap capitalize">
        <div className="flex items-center gap-1.5 min-w-0" title={p.penginput?.name || "Petugas Input"}>
          <span className="truncate max-w-[130px] font-sans font-normal capitalize">
            {toTitleCase(p.penginput?.name || "Petugas Input")}
          </span>
        </div>
      </td>

      <td className="py-3 px-4 text-[12px] font-normal text-slate-600 font-sans whitespace-nowrap capitalize">
        {nopolDate}
      </td>

      <td className="py-3 px-4 whitespace-nowrap font-sans">
        {p.tanggalPenyelesaian ? (
          <div className="flex items-center gap-1">
            {isOverdue(p.tanggalPenyelesaian, p.status) && (
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            )}
            <span
              className={`text-[12px] font-sans font-normal capitalize ${
                isOverdue(p.tanggalPenyelesaian, p.status) ? "text-rose-600 font-normal" : "text-slate-600"
              }`}
            >
              {penyelesaianDate}
            </span>
          </div>
        ) : (
          "—"
        )}
      </td>

      <td className="py-3 px-4 min-w-[150px] group/cell relative font-sans">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[12px] font-normal text-slate-700 font-sans tracking-tight capitalize">
            {p.nomorPelayanan || p.nomorPermohonan}
          </span>
          {isFrozen && (
            <span className="text-[9px] font-normal capitalize bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 select-none font-sans">
              <Clock className="w-2.5 h-2.5 shrink-0 animate-pulse" />
              Frozen
            </span>
          )}
          <button
            type="button"
            onClick={(e) => onCopy(e, p.nomorPelayanan || p.nomorPermohonan)}
            className="p-1 rounded opacity-0 group-hover/cell:opacity-100 hover:bg-slate-100 text-slate-400 hover:text-[#00a389] transition-all cursor-pointer flex items-center justify-center w-5 h-5 select-none"
            title="Salin Nomor"
          >
            {copiedText === (p.nomorPelayanan || p.nomorPermohonan) ? (
              <Check className="w-3.5 h-3.5 text-emerald-600 transition-all duration-200 transform scale-110" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
        </div>
      </td>

      <td className="py-3 px-4 min-w-[210px] whitespace-nowrap group/cell relative font-sans">
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-[12px] font-normal text-slate-700 font-sans whitespace-nowrap capitalize">
            {formatNop(p.nop)}
          </span>
          <button
            type="button"
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

      <td className="py-3 px-4 group/cell relative font-sans">
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-[12px] font-normal text-slate-700 whitespace-nowrap capitalize font-sans">
            {toTitleCase(p.displayNamaWajibPajak || p.namaWajibPajak)}
          </span>
          {p.isPecahanRow && (
            <span className="text-[10px] font-normal text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-1.5 py-0.2 rounded-md shrink-0 font-sans">
              #{p.pecahanIndex}/{p.totalPecahan}
            </span>
          )}
          <button
            type="button"
            onClick={(e) => onCopy(e, p.displayNamaWajibPajak || p.namaWajibPajak)}
            className="p-1 rounded opacity-0 group-hover/cell:opacity-100 hover:bg-slate-100 text-slate-400 hover:text-[#00a389] transition-all cursor-pointer flex items-center justify-center w-5 h-5 select-none"
            title="Salin Nama Pemohon"
          >
            {copiedText === (p.displayNamaWajibPajak || p.namaWajibPajak) ? (
              <Check className="w-3.5 h-3.5 text-emerald-600 transition-all duration-200 transform scale-110" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
        </div>
      </td>

      <td className="py-3 px-4 font-sans">
        <span
          className="text-[11px] font-normal text-slate-600 bg-slate-100 border border-slate-200/90 px-2 py-0.5 rounded capitalize font-sans tracking-wide select-none"
          title={p.jenisPermohonan?.replace(/_/g, " ")}
        >
          {getAbbreviatedJenis(p.jenisPermohonan || selectedBundleInManifest?.jenisPermohonan)}
        </span>
      </td>

      <td className="py-3 px-4 text-center font-sans">
        <div className="flex items-center justify-center font-sans">
          {isFrozen ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[12px] font-normal bg-amber-100 text-amber-800 border border-amber-200 select-none capitalize font-sans">
              <Clock className="w-2.5 h-2.5 text-amber-600 animate-spin" />
              Frozen
            </span>
          ) : (
            <span
              className={`inline-flex text-[12px] font-normal px-2.5 py-0.5 rounded-full border capitalize font-sans ${
                p.status === "ARCHIVED"
                  ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                  : "bg-sky-100 text-sky-800 border-sky-200"
              }`}
            >
              {getStatusLabel(p.status)}
            </span>
          )}
        </div>
      </td>

      <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-center gap-1.5">
          {!isFrozen && p.status === "ARCHIVED" && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenCorrectionModal(p);
              }}
              className="p-1.5 text-slate-500 hover:text-rose-700 bg-white hover:bg-rose-50 border border-slate-200 rounded-md transition-all cursor-pointer shadow-3xs"
              title="Kembalikan ke Pengarsip untuk upload ulang scan digital"
            >
              <CircleArrowLeft className="w-3.5 h-3.5" />
            </button>
          )}

          {selectedManifestStatus === "SENT" && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onReportBundleLost(selectedBundleInManifest.id, selectedBundleInManifest.nomorBundle);
              }}
              disabled={loading}
              className="px-2 py-1 text-[10px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-all cursor-pointer flex items-center gap-1 shadow-3xs"
              title="Laporkan hilang"
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Hilang</span>
            </button>
          )}
        </div>
      </td>
    </tr>
  );
});

SenderPermohonanTableRow.displayName = "SenderPermohonanTableRow";
