"use client";

import React, { useState } from "react";
import { X, FolderMinus, Trash2 } from "lucide-react";
import { removePermohonanFromBundle } from "@/app/actions/researcher";

export interface RemoveFromBundleModalProps {
  isOpen: boolean;
  bundleId: string | null;
  targetItem: any | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const RemoveFromBundleModal: React.FC<RemoveFromBundleModalProps> = ({
  isOpen,
  bundleId,
  targetItem,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !targetItem || !bundleId) return null;

  const handleConfirm = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await removePermohonanFromBundle(bundleId, targetItem.id);
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
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-fadeIn">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden select-none">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2 text-amber-700">
            <FolderMinus className="w-5 h-5 shrink-0" />
            <h3 className="text-sm font-bold text-slate-900">Keluarkan dari Bundle</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex flex-col gap-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Apakah Anda yakin ingin mengeluarkan permohonan{" "}
            <strong className="font-mono text-slate-900">{targetItem.applicationNumber}</strong> dari bundle ini? Permohonan akan dikembalikan ke antrean utama.
          </p>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
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
