"use client";

import React from "react";
import { Loader2, X } from "lucide-react";
import { formatNop } from "@/components/workspaces/shared/constants";

interface MonitorRollbackModalProps {
  isOpen: boolean;
  selectedPermohonan: any | null;
  rollbackReason: string;
  loading: boolean;
  onReasonChange: (reason: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const MonitorRollbackModal: React.FC<MonitorRollbackModalProps> = React.memo(({
  isOpen,
  selectedPermohonan,
  rollbackReason,
  loading,
  onReasonChange,
  onClose,
  onSubmit,
}) => {
  if (!isOpen || !selectedPermohonan) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 select-none animate-fadeIn">
      <div className="bg-white rounded-md shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-scaleUp">
        {/* Modal Header */}
        <div className="bg-white border-b border-slate-200/80 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-black text-slate-900 tracking-tight">
              Batal Selesai (Rollback)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer font-bold"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={onSubmit}>
          <div className="p-5 flex flex-col gap-4 text-xs">
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-md leading-relaxed text-rose-800 font-semibold">
              <p>
                Anda mengajukan pembatalan status selesai (Rollback) untuk berkas NOP:{" "}
                <strong className="font-mono">{formatNop(selectedPermohonan.nop)}</strong>.
              </p>
              <p className="text-[10px] text-rose-700 mt-1.5 font-bold">
                * Tindakan ini bersifat destruktif, memerlukan persetujuan Supervisor, dan akan membekukan berkas hingga diputuskan.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="catatan-rollback" className="font-extrabold text-slate-700">
                Alasan pembatalan / rollback berkas <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="catatan-rollback"
                rows={4}
                value={rollbackReason}
                onChange={(e) => onReasonChange(e.target.value)}
                placeholder="Masukkan alasan detail mengapa status selesai harus dibatalkan (misalnya: produk layanan cacat cetak, dibatalkan oleh WP, salah menandai berkas, dll.)"
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:outline-none focus:border-[#00a389] text-xs font-semibold rounded-md px-3.5 py-2.5 transition-all text-slate-800 resize-none shadow-3xs"
                required
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="bg-slate-50 border-t border-slate-200/80 px-5 py-3.5 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-all cursor-pointer shadow-3xs"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || !rollbackReason.trim()}
              className="px-4 py-2 text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 rounded-md flex items-center gap-1.5 shadow-3xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Ajukan Rollback Status
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

MonitorRollbackModal.displayName = "MonitorRollbackModal";
