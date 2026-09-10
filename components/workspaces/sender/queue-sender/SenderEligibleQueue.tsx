"use client";

import React from "react";
import { Plus, MoreVertical } from "lucide-react";
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

interface SenderEligibleQueueProps {
  eligibleBundlesList: any[];
  manifestStatus: string;
  loading: boolean;
  onAddBundle: (bundleId: string) => void;
  onOpenVersionDrawer: (bundle: any) => void;
}

export const SenderEligibleQueue: React.FC<SenderEligibleQueueProps> = React.memo(({
  eligibleBundlesList,
  manifestStatus,
  loading,
  onAddBundle,
  onOpenVersionDrawer,
}) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-md p-5 shadow-3xs flex flex-col gap-3 h-[420px] font-sans">
      <div className="flex items-center justify-between shrink-0 border-b border-slate-100 pb-3 font-sans">
        <h4 className="text-[13px] font-normal text-slate-800 capitalize select-none flex items-center gap-2 font-sans">
          <span>Antrean Bundle</span>
          <span className="bg-slate-100 text-slate-600 text-[11px] font-semibold font-mono px-2 py-0.5 rounded-full border border-slate-200">
            {eligibleBundlesList.length}
          </span>
        </h4>
      </div>

      <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto pr-1 scrollbar-thin font-sans">
        {eligibleBundlesList.length === 0 ? (
          <div className="my-auto py-4 px-4 flex flex-col items-center justify-center text-center select-none font-sans">
            <EmptyDataAnimation
              title="Antrean Bundle Kosong"
              description="Tidak ada map bundle locked terarsip di antrean."
            />
          </div>
        ) : (
          eligibleBundlesList.map((b) => {
            const bTotalPecahan = (b.permohonan || []).reduce((acc: number, p: any) => {
              if (p.jenisPermohonan === "MUTASI_SEBAGIAN") {
                return acc + (p.dataBaru?.length || 1);
              }
              return acc + 1;
            }, 0);

            return (
              <div
                key={b.id}
                className="p-3.5 sm:p-4 bg-slate-50/70 border border-slate-200/80 rounded-md text-[13px] flex flex-col justify-between gap-3 hover:border-[#00a389]/40 transition-all select-none shrink-0 min-h-[76px] font-sans"
              >
                <div className="flex items-center justify-between gap-3 w-full font-sans">
                  <span className="text-[13px] font-normal text-slate-800 font-mono tracking-tight truncate font-sans">
                    {b.nomorBundle}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <span
                      className="flex items-center justify-center bg-[#f25c54] text-white text-[11px] font-bold font-mono w-5 h-5 rounded-full shrink-0 shadow-2xs"
                      title={`${bTotalPecahan} Berkas`}
                    >
                      {bTotalPecahan}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenVersionDrawer(b);
                      }}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                      title="Lihat Riwayat Versi Bundle"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 w-full font-sans">
                  <span className="bg-emerald-50 text-[#008f78] text-[11px] font-normal px-2 py-0.5 rounded-md border border-emerald-200 capitalize leading-none shrink-0 font-sans">
                    {getAbbreviatedJenis(b.jenisPermohonan)}
                  </span>

                  {manifestStatus === "DRAFT" && (
                    <button
                      type="button"
                      onClick={() => onAddBundle(b.id)}
                      disabled={loading}
                      className="py-1 px-2.5 bg-[#00a389] hover:bg-[#008f78] text-white font-normal text-[12px] font-sans rounded-md transition-all active:scale-95 cursor-pointer flex items-center gap-1 shadow-3xs shrink-0 capitalize"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
});

SenderEligibleQueue.displayName = "SenderEligibleQueue";
