"use client";

import React from "react";
import { AlertTriangle, X, Loader2, Send } from "lucide-react";
import { formatNop } from "@/components/workspaces/shared/constants";

export interface ArchivistCorrectionModalProps {
  isOpen: boolean;
  correctionTarget: any | null;
  correctionReason: string;
  loading: boolean;
  onReasonChange: (reason: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const ArchivistCorrectionModal: React.FC<ArchivistCorrectionModalProps> = React.memo(
  ({
    isOpen,
    correctionTarget,
    correctionReason,
    loading,
    onReasonChange,
    onClose,
    onSubmit,
  }) => {
    if (!isOpen || !correctionTarget) return null;

    const nomorVal = correctionTarget.nomorPelayanan || correctionTarget.nomorPermohonan || correctionTarget.applicationNumber || "-";
    const namaVal = correctionTarget.displayNamaWajibPajak || correctionTarget.namaWajibPajak || correctionTarget.ownerName || "-";

    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn font-sans select-none">
        <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-50 rounded-xl text-amber-600 border border-amber-100">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">Kembalikan Permohonan ke Peneliti</h3>
                <p className="text-xs text-slate-500 font-sans">
                  Ajukan pengembalian berkas karena terdapat kesalahan data/kelengkapan.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs space-y-1.5 font-sans">
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">No. Permohonan:</span>
                <span className="font-bold font-mono text-slate-800">{nomorVal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">NOP:</span>
                <span className="font-medium font-mono text-slate-700">{formatNop(correctionTarget.nop)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Nama Pemohon:</span>
                <span className="font-medium text-slate-800 capitalize font-sans">{namaVal}</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 font-sans">
                Alasan Pengembalian <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={correctionReason}
                onChange={(e) => onReasonChange(e.target.value)}
                placeholder="Tuliskan catatan alasan mengapa permohonan ini perlu dikembalikan ke Peneliti..."
                rows={4}
                className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#00a389] focus:border-[#00a389] outline-none transition-all placeholder:text-slate-400 font-sans resize-none"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer font-sans"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading || !correctionReason.trim()}
                className="px-4 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer font-sans"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Kirim Pengembalian</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
);

ArchivistCorrectionModal.displayName = "ArchivistCorrectionModal";
