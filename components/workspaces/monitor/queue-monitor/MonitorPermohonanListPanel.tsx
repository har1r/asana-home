"use client";

import React from "react";
import { formatNop } from "@/components/workspaces/shared/constants";
import { EmptyDataAnimation } from "@/components/workspaces/shared/EmptyDataAnimation";

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

interface MonitorPermohonanListPanelProps {
  selectedBundle: any;
  selectedPermohonan: any | null;
  filteredPantauList: any[];
  paginatedPantau: any[];
  activePantauPage: number;
  totalPantauPages: number;
  onPageChange: (page: number) => void;
  onSelectPermohonan: (permohonan: any) => void;
}

export const MonitorPermohonanListPanel: React.FC<MonitorPermohonanListPanelProps> = React.memo(({
  selectedBundle,
  selectedPermohonan,
  filteredPantauList,
  paginatedPantau,
  activePantauPage,
  totalPantauPages,
  onPageChange,
  onSelectPermohonan,
}) => {
  return (
    <div className="w-full bg-white border border-slate-200/90 rounded-md p-4 shadow-3xs flex flex-col gap-3 font-sans">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 font-sans">
        <h4 className="text-[13px] font-normal text-slate-700 capitalize font-sans select-none flex items-center gap-2">
          <span>Permohonan</span>
          <span className="bg-emerald-50 text-[#008f78] text-[10px] font-semibold px-2 py-0.5 rounded-md border border-emerald-200">
            {filteredPantauList.length}
          </span>
        </h4>

        {totalPantauPages > 1 && (
          <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-500 select-none font-sans">
            <span>
              Hal {activePantauPage}/{totalPantauPages}
            </span>
            <div className="flex items-center gap-1 font-sans">
              <button
                type="button"
                onClick={() => onPageChange(Math.max(activePantauPage - 1, 1))}
                disabled={activePantauPage === 1}
                className="p-1 px-2 rounded-md bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer shadow-3xs text-xs font-bold"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => onPageChange(Math.min(activePantauPage + 1, totalPantauPages))}
                disabled={activePantauPage === totalPantauPages}
                className="p-1 px-2 rounded-md bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer shadow-3xs text-xs font-bold"
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 max-h-[calc(100vh-160px)] overflow-y-auto pr-1 flex flex-col gap-1.5 scrollbar-thin font-sans">
        {paginatedPantau.length === 0 ? (
          <div className="py-8 text-center select-none font-sans">
            <EmptyDataAnimation
              title="Hasil Pencarian Tidak Ditemukan"
              description="Tidak ada berkas permohonan yang sesuai dengan kriteria pencarian/filter."
            />
          </div>
        ) : (
          paginatedPantau.map((p) => {
            const isSelected = selectedPermohonan?.id === p.id;
            const isFrozen = p.permintaanKoreksi && p.permintaanKoreksi.length > 0;

            const sc = isFrozen
              ? {
                  label: "Frozen",
                  badgeBg: "bg-amber-100",
                  badgeText: "text-amber-800",
                  badgeBorder: "border-amber-200",
                }
              : p.status === "COMPLETED"
              ? {
                  label: "Selesai",
                  badgeBg: "bg-emerald-100",
                  badgeText: "text-emerald-800",
                  badgeBorder: "border-emerald-200",
                }
              : {
                  label: "Terarsip",
                  badgeBg: "bg-sky-100",
                  badgeText: "text-sky-850",
                  badgeBorder: "border-sky-200",
                };

            const prev = Array.isArray(p.previousData) && p.previousData.length > 0 ? p.previousData[0] : (Array.isArray(p.dataLama) && p.dataLama.length > 0 ? p.dataLama[0] : null);
            const targ = Array.isArray(p.targetData) && p.targetData.length > 0 ? p.targetData[0] : (Array.isArray(p.dataBaru) && p.dataBaru.length > 0 ? p.dataBaru[0] : null);

            const targetDataList = Array.isArray(p.targetData) && p.targetData.length > 0
              ? p.targetData
              : (Array.isArray(p.dataBaru) ? p.dataBaru : []);

            const pTotalPecahan = targetDataList.length > 0 ? targetDataList.length : 1;
            let pVerifiedPecahan = 0;
            if (p.status === "COMPLETED") {
              pVerifiedPecahan = pTotalPecahan;
            } else if (targetDataList.length > 0) {
              pVerifiedPecahan = targetDataList.filter((db: any) => db.isVerified).length;
            }

            const nopVal =
              p.nop ||
              prev?.nop ||
              targ?.nopFinal ||
              targ?.nopTemporary ||
              "";

            const namaWpVal =
              p.namaWajibPajak ||
              prev?.ownerName ||
              prev?.namaPemilikLama ||
              targ?.ownerName ||
              p.applicantName ||
              "Nama Wajib Pajak";

            const displayNop = nopVal ? formatNop(nopVal) : (p.nomorPelayanan || p.applicationNumber || "—");
            const jenisLayananStr = p.jenisPermohonan || p.applicationType || selectedBundle?.jenisPermohonan || "";

            return (
              <div
                key={p.id}
                onClick={() => onSelectPermohonan(p)}
                className={`p-3.5 sm:p-4 rounded-md border transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 relative overflow-hidden select-none shrink-0 min-h-[76px] font-sans ${
                  isSelected
                    ? "bg-[#00a389]/5 border-[#00a389] shadow-md ring-2 ring-[#00a389]/20"
                    : "bg-slate-50/70 border-slate-200/80 hover:border-slate-300 hover:bg-white"
                }`}
              >
                {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00a389]" />}

                <div className="flex items-center justify-between gap-2 pl-1 font-sans">
                  <span className="text-[13px] font-normal text-slate-800 font-mono truncate">
                    {displayNop}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[13px] font-normal capitalize border leading-none shrink-0 ${sc.badgeBg} ${sc.badgeText} ${sc.badgeBorder}`}
                  >
                    {sc.label}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 pl-1 text-[13px] font-sans">
                  <span
                    className="text-[13px] font-normal text-slate-600 capitalize truncate max-w-md font-sans"
                    title={namaWpVal}
                  >
                    {namaWpVal.toLowerCase()}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0 font-sans">
                    {jenisLayananStr === "MUTASI_SEBAGIAN" && (
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-md text-[13px] font-normal capitalize border leading-none ${
                          pVerifiedPecahan === pTotalPecahan
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : pVerifiedPecahan > 0
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-slate-100 text-slate-500 border-slate-200"
                        }`}
                      >
                        {pVerifiedPecahan}/{pTotalPecahan} Verified
                      </span>
                    )}
                    <span className="inline-flex px-2 py-0.5 rounded-md text-[13px] font-normal capitalize border leading-none bg-emerald-50 text-[#008f78] border-emerald-200">
                      {getAbbreviatedJenis(jenisLayananStr)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
});

MonitorPermohonanListPanel.displayName = "MonitorPermohonanListPanel";
