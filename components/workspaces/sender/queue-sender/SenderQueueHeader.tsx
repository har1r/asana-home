"use client";

import React from "react";
import { Lock, Printer, Upload, FileCheck, Loader2, RefreshCw } from "lucide-react";

const STATUS_LABEL_MAP: Record<string, string> = {
  SUBMITTED: "Diajukan",
  REVISION: "Revisi",
  BUNDLED: "Terbundel",
  LOCKED: "Terkunci",
  IN_MANIFEST: "Dimanifest",
  ARCHIVED: "Diarsipkan",
  COMPLETED: "Selesai",
  REJECTED: "Ditolak",
  DRAFT: "Draf",
  VOID: "Dibatalkan",
  SENT: "Dikirim",
};

const getStatusLabel = (status: string) => {
  if (!status) return "—";
  if (STATUS_LABEL_MAP[status]) return STATUS_LABEL_MAP[status];
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

interface SenderQueueHeaderProps {
  selectedManifest: any;
  loading?: boolean;
  fileInputRef?: React.RefObject<HTMLInputElement | null>;
  onLockManifest?: () => void;
  onRevisiManifest?: () => void;
  onUploadReceipt?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SenderQueueHeader: React.FC<SenderQueueHeaderProps> = React.memo(({
  selectedManifest,
  loading = false,
  fileInputRef,
  onLockManifest,
  onRevisiManifest,
  onUploadReceipt,
}) => {
  const rawManifestNumber = selectedManifest?.nomorManifest || selectedManifest?.manifestNumber || "—";
  const status = selectedManifest?.status || "DRAFT";
  const bundlesList = selectedManifest?.bundles || selectedManifest?.bundle || [];
  const isManifestEmpty = bundlesList.length === 0;

  return (
    <div className="bg-white border border-slate-200/90 rounded-md p-3.5 sm:p-4 shadow-3xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none font-sans">
      {/* Title & Status Badge (Left Aligned) */}
      <div className="flex items-center gap-2.5 flex-wrap font-sans">
        <h2 className="font-mono text-[14px] font-bold text-slate-800 tracking-tight font-sans">
          {rawManifestNumber}
        </h2>
        <span
          className={`px-2.5 py-0.5 rounded-full text-[12px] font-medium border leading-none capitalize tracking-wider font-sans shrink-0 ${
            status === "LOCKED"
              ? "bg-slate-900 text-slate-100 border-slate-800"
              : status === "SENT"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-amber-50 text-amber-800 border-amber-200"
          }`}
        >
          {getStatusLabel(status)}
        </span>
      </div>

      {/* Action Buttons (Right Aligned, Sejajar dengan Judul) */}
      <div className="flex items-center gap-2 justify-end shrink-0 flex-wrap font-sans">
        {status === "DRAFT" && onLockManifest && (
          <button
            type="button"
            onClick={() => onLockManifest()}
            disabled={loading || isManifestEmpty}
            className="px-4 py-2 bg-[#00a389] hover:bg-[#008f78] active:scale-95 text-white font-normal text-[13px] font-sans rounded-md shadow-3xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed capitalize"
            title="Kunci Manifest untuk siap dikirim"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
              <Lock className="w-4 h-4 text-white stroke-[2]" />
            )}
            <span>{loading ? "Mengunci..." : "Kunci Manifest"}</span>
          </button>
        )}

        {status === "LOCKED" && (
          <div className="flex items-center gap-2 flex-wrap font-sans">
            {onRevisiManifest && (
              <button
                type="button"
                onClick={onRevisiManifest}
                disabled={loading}
                className="px-3 py-2 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md font-normal text-[13px] font-sans transition-all cursor-pointer shadow-3xs flex items-center gap-1.5 disabled:opacity-40 capitalize"
                title="Batal Kunci Manifest / Revisi ke Draf"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 text-rose-600 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 text-rose-600" />
                )}
                <span>{loading ? "Merevisi..." : "Revisi Manifest"}</span>
              </button>
            )}

            <a
              href={`/api/pdf/surat-pengantar-manifest/${selectedManifest.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 text-slate-700 hover:text-[#008f78] bg-white border border-slate-200 hover:border-slate-300 rounded-md font-normal text-[13px] font-sans transition-all cursor-pointer shadow-3xs flex items-center gap-1.5 capitalize"
              title="Cetak Surat Pengantar Manifest"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Cetak Surat Pengantar</span>
            </a>

            {fileInputRef && onUploadReceipt && (
              <>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={onUploadReceipt}
                  accept="image/*,application/pdf"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="px-4 py-2 text-white bg-[#00a389] hover:bg-[#008f78] active:scale-95 rounded-md font-normal text-[13px] font-sans shadow-3xs transition-all cursor-pointer flex items-center gap-1.5 capitalize disabled:opacity-50"
                  title="Unggah Bukti Tanda Terima"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 text-white" />
                  )}
                  <span>{loading ? "Mengunggah..." : "Unggah Bukti Tanda Terima"}</span>
                </button>
              </>
            )}
          </div>
        )}

        {status === "SENT" && (
          <div className="flex items-center gap-2 flex-wrap font-sans">
            <a
              href={`/api/pdf/surat-pengantar-manifest/${selectedManifest.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 text-slate-700 hover:text-[#008f78] bg-white border border-slate-200 hover:border-slate-300 rounded-md font-normal text-[13px] font-sans transition-all cursor-pointer shadow-3xs flex items-center gap-1.5 capitalize"
              title="Cetak Surat Pengantar Manifest"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Cetak Surat Pengantar</span>
            </a>

            {selectedManifest.buktiTandaTerima && (
              <a
                href={selectedManifest.buktiTandaTerima}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 text-[#008f78] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md font-extrabold text-xs transition-all cursor-pointer shadow-3xs flex items-center gap-1.5"
                title="Lihat Bukti Tanda Terima"
              >
                <FileCheck className="w-4 h-4 text-[#00a389]" />
                <span>Lihat Bukti Tanda Terima</span>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

SenderQueueHeader.displayName = "SenderQueueHeader";
