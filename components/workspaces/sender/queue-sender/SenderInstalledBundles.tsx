"use client";

import React from "react";
import { Calendar, MoreVertical, Minus, Loader2 } from "lucide-react";
import { EmptyDataAnimation } from "@/components/workspaces/shared/EmptyDataAnimation";
import { getAbbreviatedJenis, formatJenisLayananLabel } from "@/components/workspaces/shared/constants";

interface SenderInstalledBundlesProps {
  installedBundles: any[];
  selectedBundleInManifest: any | null;
  manifestStatus?: string;
  loading?: boolean;
  onSelectBundle: (bundle: any) => void;
  onOpenVersionDrawer: (bundle: any) => void;
  onRemoveBundle?: (bundleId: string) => void;
}

export const SenderInstalledBundles: React.FC<SenderInstalledBundlesProps> = React.memo(({
  installedBundles,
  selectedBundleInManifest,
  manifestStatus = "DRAFT",
  loading = false,
  onSelectBundle,
  onOpenVersionDrawer,
  onRemoveBundle,
}) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-md p-5 shadow-3xs flex flex-col gap-3 h-[420px] font-sans">
      <div className="flex items-center justify-between shrink-0 border-b border-slate-100 pb-3 font-sans">
        <h4 className="text-[13px] font-normal text-slate-800 capitalize select-none flex items-center gap-2 font-sans">
          <span>Bundle Terpasang</span>
          <span className="bg-emerald-50 text-[#008f78] text-[11px] font-semibold font-mono px-2 py-0.5 rounded-full border border-emerald-200">
            {installedBundles.length}
          </span>
        </h4>
      </div>

      <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto pr-1 scrollbar-thin font-sans">
        {installedBundles.length === 0 ? (
          <div className="my-auto py-4 px-4 flex flex-col items-center justify-center text-center select-none font-sans">
            <EmptyDataAnimation
              title="Belum Ada Bundle Terpasang"
              description="Belum ada map bundle yang terpasang dalam manifest ini."
            />
          </div>
        ) : (
          installedBundles.map((b: any) => {
            const isSelectedBundle = selectedBundleInManifest?.id === b.id;
            const appsList = b.applications || b.permohonan || [];
            const bTotalPecahan = appsList.reduce((acc: number, p: any) => {
              const type = p.applicationType || p.jenisPermohonan;
              if (type === "MUTASI_SEBAGIAN" || type === "PARTIAL_MUTATION") {
                const targetList = p.targetData || p.dataBaru || [];
                return acc + (targetList.length > 0 ? targetList.length : 1);
              }
              return acc + 1;
            }, 0);

            const displayBundleNo = b.bundleNumber || b.nomorBundle || "—";
            const displayJenis = b.applicationType || b.jenisPermohonan;

            return (
              <div
                key={b.id}
                onClick={() => onSelectBundle(b)}
                className={`p-3.5 sm:p-4 rounded-md border transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 relative overflow-hidden select-none shrink-0 min-h-[76px] font-sans ${
                  isSelectedBundle
                    ? "bg-[#00a389]/5 border-[#00a389] shadow-md ring-2 ring-[#00a389]/20"
                    : "bg-slate-50/60 border-slate-200 hover:border-slate-300 hover:bg-white"
                }`}
              >
                {/* Left Active Indicator Strip */}
                {isSelectedBundle && (
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#00a389] rounded-l-md" />
                )}

                <div className="flex items-center justify-between gap-3 w-full font-sans">
                  <span className="text-[13px] font-normal text-slate-800 font-mono tracking-tight truncate font-sans">
                    {displayBundleNo}
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
                  <span
                    className="bg-emerald-50 text-[#008f78] text-[11px] font-normal px-2 py-0.5 rounded-md border border-emerald-200 capitalize leading-none shrink-0 font-sans cursor-help"
                    title={formatJenisLayananLabel(displayJenis)}
                  >
                    {getAbbreviatedJenis(displayJenis)}
                  </span>
                  <div className="flex items-center gap-2 shrink-0 font-sans">
                    <span className="text-slate-500 font-normal text-[12px] flex items-center gap-1 shrink-0 font-sans">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {b.updatedAt
                        ? new Date(b.updatedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })
                        : "—"}
                    </span>

                    {manifestStatus === "DRAFT" && onRemoveBundle && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveBundle(b.id);
                        }}
                        disabled={loading}
                        className="py-1 px-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-md transition-all active:scale-95 cursor-pointer flex items-center gap-1 shadow-3xs shrink-0 capitalize disabled:opacity-50"
                        title="Keluarkan bundle dari manifest"
                      >
                        {loading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                        ) : (
                          <Minus className="w-3.5 h-3.5 text-rose-600 stroke-[2.5]" />
                        )}
                      </button>
                    )}
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

SenderInstalledBundles.displayName = "SenderInstalledBundles";
