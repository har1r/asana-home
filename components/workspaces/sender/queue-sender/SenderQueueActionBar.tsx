"use client";

import React from "react";
import { Lock, Unlock, Printer, Upload, FileCheck, Loader2 } from "lucide-react";

interface SenderQueueActionBarProps {
  selectedManifest: any;
  loading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onLockManifest: () => void;
  onRevisiManifest: () => void;
  onUploadReceipt: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SenderQueueActionBar: React.FC<SenderQueueActionBarProps> = React.memo(({
  selectedManifest,
  loading,
  fileInputRef,
  onLockManifest,
  onRevisiManifest,
  onUploadReceipt,
}) => {
  const bundlesList = selectedManifest.bundles || selectedManifest.bundle || [];
  const isManifestEmpty = bundlesList.length === 0;

  return (
    <div className="border border-slate-200/90 bg-slate-50 p-5 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none shadow-3xs mt-auto font-sans">
      <div className="text-[12px] text-slate-500 font-normal max-w-lg flex items-center gap-2 font-sans">
        {selectedManifest.status === "DRAFT" && (
          <span>
            Masukkan map bundle terlebih dahulu lalu klik{" "}
            <strong className="font-normal text-slate-700">Kunci Manifest</strong> untuk siap dikirim.
          </span>
        )}
        {selectedManifest.status === "LOCKED" && (
          <span>Cetak surat pengantar manifest dan unggah bukti tanda terima untuk menyelesaikan pengiriman.</span>
        )}
        {selectedManifest.status === "SENT" && (
          <span>Pengiriman manifest telah selesai. Anda dapat meninjau bukti tanda terima atau mengelola berkas.</span>
        )}
      </div>

      <div className="flex items-center gap-2 justify-end shrink-0 flex-wrap font-sans">
        {selectedManifest.status === "DRAFT" && (
          <button
            onClick={onLockManifest}
            disabled={loading || isManifestEmpty}
            className="px-4 py-2 bg-[#00a389] hover:bg-[#008f78] active:scale-95 text-white font-normal text-[13px] font-sans rounded-md shadow-3xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed capitalize"
            title="Kunci Manifest"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
              <Lock className="w-4 h-4 text-white stroke-[2]" />
            )}
            <span>{loading ? "Mengunci..." : "Kunci Manifest"}</span>
          </button>
        )}

        {selectedManifest.status === "LOCKED" && (
          <div className="flex items-center gap-2 flex-wrap font-sans">
            <button
              onClick={onRevisiManifest}
              disabled={loading}
              className="px-3 py-2 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md font-normal text-[13px] font-sans transition-all cursor-pointer shadow-3xs flex items-center gap-1.5 disabled:opacity-40 capitalize"
              title="Batal Kunci Manifest"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 text-rose-600 animate-spin" />
              ) : (
                <Unlock className="w-4 h-4 text-rose-600" />
              )}
              <span>{loading ? "Merevisi..." : "Revisi Manifest"}</span>
            </button>

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

            <input
              type="file"
              ref={fileInputRef}
              onChange={onUploadReceipt}
              accept="image/*,application/pdf"
              className="hidden"
            />
            <button
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
          </div>
        )}

        {selectedManifest.status === "SENT" && selectedManifest.buktiTandaTerima && (
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
          </div>
        )}
      </div>
    </div>
  );
});

SenderQueueActionBar.displayName = "SenderQueueActionBar";
