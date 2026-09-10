"use client";

import React from "react";
import { Printer, Lock } from "lucide-react";

export interface RecommendationToolbarProps {
  selectedBundle: any | null;
  bundlesList?: any[];
  onSelectBundle?: (bundle: any) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onPrint: () => void;
  onLockBundle?: (bundleId: string) => void;
  isLoading?: boolean;
}

export const RecommendationToolbar: React.FC<RecommendationToolbarProps> = React.memo(({
  selectedBundle,
  onPrint,
  onLockBundle,
  isLoading = false,
}) => {
  return (
    <div className="flex items-center justify-end gap-3 font-sans select-none animate-fadeIn">
      {/* Action Buttons (Lock Bundle & Print Recommendation) */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Action Button: Lock Bundle (if still DRAFT and not empty) */}
        {selectedBundle && selectedBundle.status === 'DRAFT' && onLockBundle && (
          <button
            type="button"
            onClick={() => onLockBundle(selectedBundle.id)}
            disabled={isLoading || ((selectedBundle.applications?.length || selectedBundle.permohonan?.length || 0) === 0)}
            className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-md text-[13px] font-semibold shadow-3xs transition-all font-sans ${
              ((selectedBundle.applications?.length || selectedBundle.permohonan?.length || 0) === 0)
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300/80 shadow-none'
                : 'bg-slate-900 hover:bg-slate-800 active:scale-95 text-slate-100 cursor-pointer'
            }`}
            title={((selectedBundle.applications?.length || selectedBundle.permohonan?.length || 0) === 0) ? 'Bundle kosong (0 Pemohon) tidak dapat dikunci' : 'Kunci Bundle ini agar siap dikirim ke Pengarsip'}
          >
            <Lock className={`w-3.5 h-3.5 ${((selectedBundle.applications?.length || selectedBundle.permohonan?.length || 0) === 0) ? 'text-slate-400' : 'text-amber-400'}`} />
            <span>Kunci Bundle</span>
          </button>
        )}

        {/* Action Button: Print Recommendation */}
        {selectedBundle && (
          <button
            type="button"
            onClick={onPrint}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#00a389] hover:bg-[#008f78] active:scale-95 text-white rounded-md text-[13px] font-semibold shadow-3xs transition-all cursor-pointer shrink-0 font-sans"
          >
            <Printer className="w-4 h-4 text-white" />
            <span>Cetak Rekomendasi</span>
          </button>
        )}
      </div>
    </div>
  );
});

RecommendationToolbar.displayName = "RecommendationToolbar";
