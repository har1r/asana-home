"use client";

import React, { useState } from "react";
import { X, AlertTriangle, Send } from "lucide-react";
import { mintaRevisi } from "@/app/actions/researcher";

export interface RevisionRequestModalProps {
  isOpen: boolean;
  targetItem: any | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const RevisionRequestModal: React.FC<RevisionRequestModalProps> = ({
  isOpen,
  targetItem,
  onClose,
  onSuccess,
}) => {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !targetItem) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) {
      setError("Catatan alasan revisi wajib diisi.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await mintaRevisi(targetItem.id, notes.trim());
      if (res.success) {
        setNotes("");
        onSuccess();
        onClose();
      } else {
        setError(res.error || "Gagal meminta revisi.");
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
          <div className="flex items-center gap-2 text-rose-700">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <h3 className="text-sm font-bold text-slate-900">Minta Revisi Berkas</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <div className="text-xs text-slate-600">
            <span className="font-medium text-slate-800">No. Permohonan: </span>
            <span className="font-mono font-semibold text-slate-900">{targetItem.applicationNumber}</span>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Alasan Revisi / Catatan Perbaikan <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Jelaskan dokumen atau data yang perlu diperbaiki oleh Penginput..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-sans"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || !notes.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-2xs disabled:opacity-50 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? "Mengirim..." : "Kirim Revisi"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
