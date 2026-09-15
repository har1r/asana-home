"use client";

import React from "react";
import { Lock, Printer } from "lucide-react";
import { formatBundleNumber } from "@/components/workspaces/shared/constants";

export interface RecommendationToolbarProps {
  selectedBundle: any | null;
  bundlesList?: any[];
  onSelectBundle?: (bundle: any) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onPrint?: () => void;
  onLockBundle?: (bundleId: string) => void;
  isLoading?: boolean;
  displayMode?: 'permohonan' | 'pemohon';
  onSwitchDisplayMode?: (mode: 'permohonan' | 'pemohon') => void;
}

export const RecommendationToolbar: React.FC<RecommendationToolbarProps> = React.memo(({
  selectedBundle,
  onPrint,
  onLockBundle,
  isLoading = false,
  displayMode = 'permohonan',
  onSwitchDisplayMode,
}) => {
  const applicationCount = selectedBundle?.applications?.length || selectedBundle?.permohonan?.length || 0;
  const isBundleEmpty = applicationCount === 0;

  return (
    <div className="flex flex-col gap-3.5 w-full font-sans select-none animate-fadeIn pb-1">
      {/* BARIS 1: Tombol Cetak Rekomendasi (Kiri) & Kunci Bundle (Kanan) */}
      <div className="flex items-center justify-between gap-2.5 w-full">
        {/* Tombol Cetak Rekomendasi (Sebelah Kiri) */}
        {selectedBundle && onPrint && (
          <button
            type="button"
            onClick={onPrint}
            disabled={isLoading || isBundleEmpty}
            className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-md text-[13px] font-semibold shadow-3xs transition-all font-sans ${
              isBundleEmpty
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300/80 shadow-none'
                : 'bg-[#00a389] hover:bg-[#008f78] active:scale-95 text-white cursor-pointer'
            }`}
            title={isBundleEmpty ? 'Bundle kosong (0 Pemohon) tidak dapat dicetak' : 'Cetak Surat Rekomendasi Bundle'}
          >
            <Printer className="w-3.5 h-3.5 text-white" />
            <span>Cetak Rekomendasi</span>
          </button>
        )}

        {/* Tombol Kunci Bundle (Sebelah Kanan) */}
        {selectedBundle && selectedBundle.status === 'DRAFT' && onLockBundle ? (
          <button
            type="button"
            onClick={() => onLockBundle(selectedBundle.id)}
            disabled={isLoading || isBundleEmpty}
            className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-md text-[13px] font-semibold shadow-3xs transition-all font-sans ml-auto ${
              isBundleEmpty
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300/80 shadow-none'
                : 'bg-slate-900 hover:bg-slate-800 active:scale-95 text-slate-100 cursor-pointer'
            }`}
            title={isBundleEmpty ? 'Bundle kosong (0 Pemohon) tidak dapat dikunci' : 'Kunci Bundle ini agar siap dikirim ke Pengarsip'}
          >
            <Lock className={`w-3.5 h-3.5 ${isBundleEmpty ? 'text-slate-400' : 'text-amber-400'}`} />
            <span>Kunci Bundle</span>
          </button>
        ) : <div />}
      </div>

      {/* BARIS 2: Sejajar Horizontal: Judul Nomor Bundle & Badge (Kiri) | Tab Switcher Permohonan & Pemohon (Kanan) */}
      {selectedBundle && (
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Sisi Kiri: Judul Nomor Bundle & Status Badge */}
          <div className="flex items-center gap-2.5">
            <h2 className="text-[13px] font-bold text-slate-900 font-mono tracking-tight">
              {formatBundleNumber(selectedBundle.bundleNumber || selectedBundle.nomorBundle)}
            </h2>
            <span className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-md shadow-3xs font-sans ${
              selectedBundle.status === 'LOCKED'
                ? 'bg-slate-900 text-white'
                : 'bg-emerald-50 text-[#008f78] border border-emerald-200'
            }`}>
              {selectedBundle.status === 'LOCKED' ? 'TERKUNCI' : 'DRAF'}
            </span>
          </div>

          {/* Sisi Kanan: Mode Switcher Permohonan vs Pemohon */}
          {onSwitchDisplayMode && (
            <div className="bg-slate-200/70 p-0.5 rounded-md flex items-center gap-0.5 border border-slate-300/60 text-[13px] font-normal select-none h-[34px] font-sans">
              <button
                type="button"
                onClick={() => onSwitchDisplayMode('permohonan')}
                className={`h-7 px-3 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                  displayMode === 'permohonan'
                    ? 'bg-white text-slate-900 shadow-3xs font-normal'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Tampilkan 1 baris per Nomor Pelayanan (NOPEL)"
              >
                <span>Permohonan</span>
              </button>
              <button
                type="button"
                onClick={() => onSwitchDisplayMode('pemohon')}
                className={`h-7 px-3 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                  displayMode === 'pemohon'
                    ? 'bg-white text-slate-900 shadow-3xs font-normal'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Tampilkan rincian pecahan pemilik baru (Mutasi Sebagian)"
              >
                <span>Pemohon</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

RecommendationToolbar.displayName = "RecommendationToolbar";
