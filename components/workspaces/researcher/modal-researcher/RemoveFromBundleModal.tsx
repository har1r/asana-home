"use client";

import React, { useState, useEffect } from "react";
import { X, FolderMinus, Trash2, AlertCircle } from "lucide-react";
import { removePermohonanFromBundle } from "@/app/actions/researcher";

export interface RemoveFromBundleModalProps {
  isOpen: boolean;
  bundleId: string | null;
  targetItem: any | null;
  isLockedBundle?: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const RemoveFromBundleModal: React.FC<RemoveFromBundleModalProps> = ({
  isOpen,
  bundleId,
  targetItem,
  isLockedBundle = false,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setNotes("");
      setError("");
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen || !targetItem || !bundleId) return null;

  const handleConfirm = async () => {
    if (isLockedBundle && !notes.trim()) {
      setError("Mohon isi alasan/keterangan pengeluaran permohonan dari bundle terkunci.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await removePermohonanFromBundle(bundleId, targetItem.id, notes.trim() || undefined);
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.error || "Gagal mengeluarkan permohonan dari bundle.");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-fadeIn select-none">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden select-none">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2 text-amber-700">
            <FolderMinus className="w-5 h-5 shrink-0" />
            <h3 className="text-sm font-bold text-slate-900">Keluarkan dari Bundle Terkunci</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex flex-col gap-4">
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            Permohonan <strong className="font-mono text-slate-900">{targetItem.applicationNumber}</strong> berada di dalam bundle yang telah <span className="font-semibold text-slate-900">TERKUNCI</span>. 
            Pengeluaran permohonan akan mengembalikan permohonan ke antrean utama dan memperbarui riwayat versi bundle.
          </p>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-slate-700 font-sans flex items-center gap-1">
              <span>Alasan / Keterangan Pengeluaran</span>
              <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Permohonan direvisi / pembatalan oleh pemohon..."
              rows={3}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#00a389] focus:ring-1 focus:ring-[#00a389] font-sans"
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 font-sans">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-2xs disabled:opacity-50 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{loading ? "Memproses..." : "Keluarkan"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
