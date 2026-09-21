"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, X, Loader2 } from "lucide-react";

interface SenderCancelShippingModalProps {
  isOpen: boolean;
  manifestNumber: string;
  reason: string;
  loading?: boolean;
  onReasonChange: (reason: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const SenderCancelShippingModal: React.FC<SenderCancelShippingModalProps> = React.memo(({
  isOpen,
  manifestNumber,
  reason,
  loading = false,
  onReasonChange,
  onClose,
  onSubmit,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-fadeIn select-none">
      {/* Backdrop click dismiss */}
      <div
        className="fixed inset-0"
        onClick={() => {
          if (!loading) onClose();
        }}
      />

      <div className="relative z-10 bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden select-none animate-scaleUp">
        {/* Modal Header */}
        <div className="bg-slate-50/80 border-b border-slate-100/90 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-150 text-rose-600 flex items-center justify-center shrink-0 shadow-3xs">
              <AlertTriangle className="w-4 h-4 stroke-[2.2]" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
              Batalkan Pengiriman Manifest
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={onSubmit}>
          <div className="p-5 flex flex-col gap-4 text-xs font-sans">
            <div className="p-3.5 bg-rose-50/80 border border-rose-200/90 rounded-lg leading-relaxed text-rose-800 font-medium">
              <p>
                Anda akan membatalkan status pengiriman untuk Manifest No:{" "}
                <strong className="font-mono text-slate-900 font-bold">{manifestNumber}</strong>.
              </p>
              <p className="text-[11px] text-rose-700 mt-1.5 font-normal">
                Status manifest akan dikembalikan menjadi <strong>TERKUNCI (LOCKED)</strong> dan status seluruh permohonan kembali menjadi <strong>DIMANIFEST</strong>.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="catatan-batal-kirim" className="font-bold text-slate-700">
                Catatan / Alasan Pembatalan <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="catatan-batal-kirim"
                rows={4}
                value={reason}
                onChange={(e) => onReasonChange(e.target.value)}
                placeholder="Masukkan alasan detail kenapa pengiriman manifest dibatalkan (misalnya: ada kesalahan kurir, terjadi perubahan dokumen, berkas belum lengkap, dll.)"
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:outline-none focus:border-[#00a389] text-xs font-medium rounded-lg px-3.5 py-2.5 transition-all text-slate-800 resize-none shadow-3xs"
                required
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="bg-slate-50/80 border-t border-slate-100/90 px-5 py-3.5 flex items-center justify-end gap-2.5 font-sans">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-all cursor-pointer shadow-3xs"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || !reason.trim()}
              className="px-4 py-2 text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 rounded-lg flex items-center gap-1.5 shadow-3xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Konfirmasi Batal Kirim
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
});

SenderCancelShippingModal.displayName = "SenderCancelShippingModal";
