"use client";

import React from "react";

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

interface MonitorBundleCardProps {
  bundle: any;
  isSelected: boolean;
  onSelect: (bundle: any) => void;
}

export const MonitorBundleCard: React.FC<MonitorBundleCardProps> = React.memo(({
  bundle: b,
  isSelected,
  onSelect,
}) => {
  let totalPemohon = 0;
  let completedPemohon = 0;

  (b.permohonan || []).forEach((p: any) => {
    if (p.jenisPermohonan === "MUTASI_SEBAGIAN" && p.dataBaru && p.dataBaru.length > 0) {
      totalPemohon += p.dataBaru.length;
      if (p.status === "COMPLETED") {
        completedPemohon += p.dataBaru.length;
      } else {
        p.dataBaru.forEach((db: any) => {
          if (db.isVerified) completedPemohon++;
        });
      }
    } else {
      totalPemohon += 1;
      if (p.status === "COMPLETED") {
        completedPemohon += 1;
      }
    }
  });

  const progressPct = totalPemohon > 0 ? Math.round((completedPemohon / totalPemohon) * 100) : 0;
  const pembuatName = b.peneliti?.name || "—";
  const pembuatInitials =
    pembuatName !== "—"
      ? pembuatName
          .split(" ")
          .map((w: string) => w[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "?";

  const tanggalDibuat = b.createdAt
    ? new Date(b.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <div
      onClick={() => onSelect(b)}
      className={`p-4 rounded-md border flex flex-col justify-between gap-3 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer relative overflow-hidden group min-h-[140px] select-none font-sans ${
        isSelected
          ? "bg-[#00a389]/5 border-[#00a389] shadow-md ring-2 ring-[#00a389]/20"
          : "bg-white border-slate-200/90 hover:border-slate-350 hover:shadow-md"
      }`}
    >
      {/* Top Row: Number & Count Badge */}
      <div className="flex items-center justify-between gap-3 w-full font-sans">
        <span
          className="text-[13px] font-normal text-slate-800 font-mono tracking-tight truncate block max-w-[170px]"
          title={b.nomorBundle}
        >
          {b.nomorBundle}
        </span>
        <span
          className="flex items-center justify-center bg-[#f25c54] text-white text-[10px] font-black w-5 h-5 rounded-md shrink-0 shadow-2xs font-sans"
          title={`${totalPemohon} Pemohon`}
        >
          {totalPemohon}
        </span>
      </div>

      {/* Middle: Progress bar + badges */}
      <div className="flex flex-col gap-2.5 pt-2.5 border-t border-slate-100 font-sans">
        <div className="flex flex-col gap-1 font-sans">
          <div className="flex items-center justify-between text-[13px] font-normal font-sans">
            <span className="text-slate-600 capitalize">Progres</span>
            <span className={progressPct === 100 ? "text-[#008f78]" : "text-slate-500"}>
              {completedPemohon}/{totalPemohon} selesai
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-md overflow-hidden font-sans">
            <div
              className={`h-full rounded-md transition-all duration-500 ${
                progressPct === 100 ? "bg-[#00a389]" : progressPct > 0 ? "bg-[#00a389]/70" : "bg-slate-200"
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 font-sans">
          <span className="inline-flex px-2 py-0.5 rounded-md text-[9px] font-extrabold border leading-none bg-emerald-50 text-[#008f78] border-emerald-200 select-none uppercase tracking-wide font-sans">
            {b.jenisPermohonan ? getAbbreviatedJenis(b.jenisPermohonan) : "Umum"}
          </span>
          <span className="px-2 py-0.5 rounded-md text-[8px] font-extrabold border bg-emerald-50 text-[#008f78] border-emerald-200 uppercase tracking-wider select-none shrink-0 font-sans">
            TERKIRIM
          </span>
        </div>
      </div>

      {/* Bottom: Pembuat (Peneliti) avatar + tanggal dibuat */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 font-sans">
        <div
          className="w-5.5 h-5.5 rounded-full bg-[#00a389] text-white text-[8px] font-black flex items-center justify-center shrink-0 shadow-3xs"
          title={pembuatName}
        >
          {pembuatInitials}
        </div>
        {tanggalDibuat && (
          <span className="text-[9px] font-semibold text-slate-400 flex items-center gap-1 shrink-0 font-sans">
            {tanggalDibuat}
          </span>
        )}
      </div>
    </div>
  );
});

MonitorBundleCard.displayName = "MonitorBundleCard";
