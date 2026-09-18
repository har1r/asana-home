"use client";

import React from "react";
import { Star, Clock, AlertTriangle, Check, Copy, Eye } from "lucide-react";
import { formatNop, toTitleCase, getAbbreviatedJenis, formatJenisLayananLabel } from "@/components/workspaces/shared/constants";

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
  if (status === "ARCHIVED" || status === "SENT" || status === "COMPLETED") return false;
  const now = new Date();
  const target = new Date(tanggalPenyelesaian);
  return target < now;
};

interface SenderApplicationTableRowHistoryProps {
  application: any;
  itemNumber: number;
  selectedBundle: any;
  copiedText: string | null;
  onCopy: (e: React.MouseEvent, text?: string | null) => void;
  onToggleFavorite: (applicationId: string) => void;
  onSelectDetails: (application: any) => void;
}

export const SenderApplicationTableRowHistory: React.FC<SenderApplicationTableRowHistoryProps> = React.memo(({
  application: p,
  itemNumber,
  selectedBundle,
  copiedText,
  onCopy,
  onToggleFavorite,
  onSelectDetails,
}) => {
  const isFrozen = p.permintaanKoreksi && p.permintaanKoreksi.length > 0;
  const rawNopolDate = p.serviceNumberDate || p.tanggalNoPelayanan || p.createdAt;
  const nopolDate = rawNopolDate
    ? new Date(rawNopolDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
    : "—";

  const rawPenyelesaianDate = p.completionDate || p.tanggalPenyelesaian;
  const penyelesaianDate = rawPenyelesaianDate
    ? new Date(rawPenyelesaianDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
    : "—";

  const displayNoPelayanan = p.applicationNumber || p.nomorPelayanan || p.nomorPermohonan || "—";
  const rawNop = p.nop || p.previousData?.[0]?.nop || p.targetData?.[0]?.nopTemporary || "";
  const displayNop = rawNop ? formatNop(rawNop) : "—";
  const displayNama = p.displayNamaWajibPajak || p.namaWajibPajak || p.applicantName || p.previousData?.[0]?.ownerName || p.targetData?.[0]?.ownerName || "—";
  const displayJenis = p.applicationType || p.jenisPermohonan || selectedBundle?.applicationType || selectedBundle?.jenisPermohonan;

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
        <div className="flex items-center gap-1.5 min-w-0" title={p.penginput?.name || p.user?.name || p.createdBy?.name || "Petugas Input"}>
          <span className="truncate max-w-[130px] font-sans font-normal capitalize">
            {toTitleCase(p.penginput?.name || p.user?.name || p.createdBy?.name || "Petugas Input")}
          </span>
        </div>
      </td>

      <td className="py-3 px-4 text-[12px] font-normal text-slate-600 font-sans whitespace-nowrap capitalize">
        {nopolDate}
      </td>

      <td className="py-3 px-4 whitespace-nowrap font-sans">
        {rawPenyelesaianDate ? (
          <div className="flex items-center gap-1">
            {isOverdue(rawPenyelesaianDate, p.status) && (
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            )}
            <span
              className={`text-[12px] font-sans font-normal capitalize ${
                isOverdue(rawPenyelesaianDate, p.status) ? "text-rose-600 font-normal" : "text-slate-600"
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
            {displayNoPelayanan}
          </span>
          {isFrozen && (
            <span className="text-[9px] font-normal capitalize bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 select-none font-sans">
              <Clock className="w-2.5 h-2.5 shrink-0 animate-pulse" />
              Frozen
            </span>
          )}
          <button
            type="button"
            onClick={(e) => onCopy(e, displayNoPelayanan)}
            className="p-1 rounded-md opacity-0 group-hover/cell:opacity-100 hover:bg-slate-100 text-slate-400 hover:text-[#00a389] transition-all cursor-pointer flex items-center justify-center w-5 h-5 select-none"
            title="Salin Nomor"
          >
            {copiedText === displayNoPelayanan ? (
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
            {displayNop}
          </span>
          <button
            type="button"
            onClick={(e) => onCopy(e, rawNop || displayNop)}
            className="p-1 rounded-md opacity-0 group-hover/cell:opacity-100 hover:bg-slate-100 text-slate-400 hover:text-[#00a389] transition-all cursor-pointer flex items-center justify-center w-5 h-5 select-none"
            title="Salin NOP"
          >
            {copiedText === (rawNop || displayNop) ? (
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
            {toTitleCase(displayNama)}
          </span>
          {p.isPecahanRow && (
            <span className="text-[10px] font-normal text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-1.5 py-0.2 rounded-md shrink-0 font-sans">
              #{p.pecahanIndex}/{p.totalPecahan}
            </span>
          )}
          <button
            type="button"
            onClick={(e) => onCopy(e, displayNama)}
            className="p-1 rounded-md opacity-0 group-hover/cell:opacity-100 hover:bg-slate-100 text-slate-400 hover:text-[#00a389] transition-all cursor-pointer flex items-center justify-center w-5 h-5 select-none"
            title="Salin Nama Pemohon"
          >
            {copiedText === displayNama ? (
              <Check className="w-3.5 h-3.5 text-emerald-600 transition-all duration-200 transform scale-110" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
        </div>
      </td>

      <td className="py-3 px-4 font-sans">
        <span
          className="text-[11px] font-normal text-slate-600 bg-slate-100 border border-slate-200/90 px-2 py-0.5 rounded-md capitalize font-sans tracking-wide select-none cursor-help"
          title={formatJenisLayananLabel(displayJenis)}
        >
          {getAbbreviatedJenis(displayJenis)}
        </span>
      </td>

      <td className="py-3 px-4 text-center font-sans">
        <div className="flex items-center justify-center font-sans">
          {isFrozen ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[12px] font-normal bg-amber-100 text-amber-800 border border-amber-200 select-none capitalize font-sans">
              <Clock className="w-2.5 h-2.5 text-amber-600 animate-spin" />
              Frozen
            </span>
          ) : (
            <span
              className={`inline-flex text-[12px] font-normal px-2.5 py-0.5 rounded-md border capitalize font-sans ${
                p.status === "ARCHIVED" || p.status === "COMPLETED" || p.status === "DELIVERED"
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
        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={() => onSelectDetails(p)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-all cursor-pointer shadow-3xs"
            title="Lihat Detail Permohonan"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
});

SenderApplicationTableRowHistory.displayName = "SenderApplicationTableRowHistory";
