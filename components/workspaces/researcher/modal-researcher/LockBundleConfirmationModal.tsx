"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Lock, X, CheckSquare, Square, FileCheck, ShieldCheck } from "lucide-react";
import { formatBundleNumber } from "@/components/workspaces/shared/constants";

export interface LockBundleConfirmationModalProps {
  isOpen: boolean;
  bundle: any | null;
  onClose: () => void;
  onConfirm: (bundleId: string) => void;
  isLoading?: boolean;
}

export const LockBundleConfirmationModal: React.FC<LockBundleConfirmationModalProps> = ({
  isOpen,
  bundle,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  const [mounted, setMounted] = useState(false);
  const [hasConfirmedSignatures, setHasConfirmedSignatures] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setHasConfirmedSignatures(true);
    }
  }, [isOpen]);

  if (!isOpen || !bundle || !mounted) return null;

  const rawNum = bundle.bundleNumber || bundle.nomorBundle || "";
  const formattedNum = rawNum ? formatBundleNumber(rawNum, bundle.createdAt) : "—";
  const applications = bundle.applications || bundle.permohonan || [];
  const berkasCount = applications.length;

  const pemohonCount = applications.reduce((acc: number, item: any) => {
    if (item.jenisPermohonan === 'MUTASI_SEBAGIAN' && item.dataBaru && item.dataBaru.length > 0) {
      return acc + item.dataBaru.length;
    }
    return acc + 1;
  }, 0);

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-fadeIn select-none">
      {/* Backdrop click dismiss */}
      <div
        className="fixed inset-0"
        onClick={() => {
          if (!isLoading) onClose();
        }}
      />

      <div className="relative z-10 bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden select-none animate-scaleUp">
        {/* Modal Header (Clean enterprise white header with brand emerald icon) */}
        <div className="p-4 border-b border-slate-100/90 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-150 text-[#00a389] flex items-center justify-center shrink-0 shadow-3xs">
              <Lock className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Konfirmasi Penguncian Bundle</h3>
              <p className="text-[11px] text-slate-500 font-mono font-medium">{formattedNum}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
            title="Tutup Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex flex-col gap-4">
          {/* Bundle Summary Pill */}
          <div className="p-3 bg-slate-50/90 border border-slate-200/90 rounded-lg flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-700 font-medium">
              <FileCheck className="w-4 h-4 text-[#00a389] shrink-0" />
              <span>Jumlah Permohonan</span>
            </div>
            <span className="font-semibold text-slate-900 bg-white px-2.5 py-1 rounded-md border border-slate-200 font-mono shadow-3xs text-[11px]">
              {berkasCount} Berkas ({pemohonCount} Pemohon)
            </span>
          </div>

          {/* Clean Confirmation Message */}
          <div className="flex flex-col gap-3 p-3.5 bg-slate-50/80 border border-slate-200/90 rounded-lg text-xs">
            <div className="flex items-start gap-2.5 text-slate-800">
              <ShieldCheck className="w-4 h-4 text-[#00a389] shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="font-bold text-slate-900 text-[13px]">Apakah Anda yakin ingin mengunci bundle ini?</span>
                <p className="text-[11.5px] leading-relaxed text-slate-600 font-normal">
                  Penguncian bundle akan membekukan daftar permohonan agar siap diteruskan ke unit Pengarsipan dan Logistik.
                </p>
              </div>
            </div>

            {/* Checklist Checkbox */}
            <div
              className="pt-2.5 border-t border-slate-200/80 flex items-start gap-2.5 cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setHasConfirmedSignatures(!hasConfirmedSignatures)}
            >
              <button type="button" className="mt-0.5 text-[#00a389] shrink-0">
                {hasConfirmedSignatures ? (
                  <CheckSquare className="w-4 h-4 text-[#00a389]" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
              </button>
              <span className="text-[11.5px] font-normal leading-relaxed text-slate-700 select-none">
                Dokumen rekomendasi telah diperiksa dan disetujui/ditandatangani oleh <strong className="font-semibold text-slate-900">Kasubag TU (KTU)</strong> dan <strong className="font-semibold text-slate-900">Kepala UPTD (KUPTD)</strong>.
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 font-sans">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 rounded-md text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 font-sans"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm(bundle.id);
                onClose();
              }}
              disabled={isLoading || !hasConfirmedSignatures}
              className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold shadow-3xs transition-all font-sans ${
                !hasConfirmedSignatures
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300/80 shadow-none"
                  : "bg-[#00a389] hover:bg-[#008f78] active:scale-95 text-white cursor-pointer"
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-white" />
              <span>Ya, Kunci Bundle</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
