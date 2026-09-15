"use client";

import React from "react";

const BUNDLE_TYPE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  MUTASI_SEBAGIAN: { bg: "bg-indigo-50/80", text: "text-indigo-700", border: "border-indigo-200" },
  PARTIAL_MUTATION: { bg: "bg-indigo-50/80", text: "text-indigo-700", border: "border-indigo-200" },
  MUTASI_PENGGABUNGAN: { bg: "bg-teal-50/80", text: "text-teal-700", border: "border-teal-200" },
  MERGER_MUTATION: { bg: "bg-teal-50/80", text: "text-teal-700", border: "border-teal-200" },
  MUTASI_HABIS_UPDATE: { bg: "bg-emerald-50/80", text: "text-emerald-700", border: "border-emerald-200" },
  MUTASI_HABIS_REGULER: { bg: "bg-pink-50/80", text: "text-pink-700", border: "border-pink-200" },
  OBJEK_PAJAK_BARU: { bg: "bg-amber-50/80", text: "text-amber-700", border: "border-amber-200" },
  PEMBETULAN: { bg: "bg-purple-50/80", text: "text-purple-700", border: "border-purple-200" },
  PENGAKTIFAN: { bg: "bg-sky-50/80", text: "text-sky-700", border: "border-sky-200" },
};

const getAbbreviatedJenis = (jenis: string) => {
  switch (jenis) {
    case "OBJEK_PAJAK_BARU":
      return "OPB";
    case "MUTASI_SEBAGIAN":
    case "PARTIAL_MUTATION":
      return "MS";
    case "MUTASI_HABIS_REGULER":
      return "MHR";
    case "MUTASI_HABIS_UPDATE":
      return "MHU";
    case "MUTASI_PENGGABUNGAN":
    case "MERGER_MUTATION":
      return "MPG";
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
    const targetList = Array.isArray(p.targetData)
      ? p.targetData
      : Array.isArray(p.dataBaru)
      ? p.dataBaru
      : Array.isArray(p.targets)
      ? p.targets
      : Array.isArray(p.targetDataList)
      ? p.targetDataList
      : [];

    let pTotal = 1;
    if (typeof p.totalPemohon === "number" && p.totalPemohon > 0) {
      pTotal = p.totalPemohon;
    } else if (targetList.length > 0) {
      pTotal = targetList.length;
    }

    let pCompleted = 0;
    if (p.status === "COMPLETED") {
      pCompleted = pTotal;
    } else if (targetList.length > 0) {
      let vCount = 0;
      targetList.forEach((db: any) => {
        if (db.isVerified || db.status === "COMPLETED" || db.verified) {
          vCount++;
        }
      });
      pCompleted = vCount;
    }

    totalPemohon += pTotal;
    completedPemohon += pCompleted;
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

  const jenisPermohonan =
    b.jenisPermohonan ||
    b.applicationType ||
    (b.permohonan && b.permohonan[0] ? b.permohonan[0].jenisPermohonan || b.permohonan[0].applicationType : null);

  const abbreviatedJenis = jenisPermohonan ? getAbbreviatedJenis(jenisPermohonan) : "—";
  const typeStyle = (jenisPermohonan && BUNDLE_TYPE_STYLES[jenisPermohonan])
    ? BUNDLE_TYPE_STYLES[jenisPermohonan]
    : { bg: "bg-emerald-50", text: "text-[#008f78]", border: "border-emerald-200" };

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
          className="text-[13px] font-normal text-slate-800 font-mono tracking-tight truncate flex-1 min-w-0"
          title={b?.nomorBundle || b?.bundleNumber || "—"}
        >
          {b?.nomorBundle || b?.bundleNumber || "Bundle Tanpa Nomor"}
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
          <span className={`inline-flex px-2 py-0.5 rounded-md text-[9px] font-extrabold border leading-none select-none uppercase tracking-wide font-sans ${typeStyle.bg} ${typeStyle.text} ${typeStyle.border}`}>
            {abbreviatedJenis}
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
