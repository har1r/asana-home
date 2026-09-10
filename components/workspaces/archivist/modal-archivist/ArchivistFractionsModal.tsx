"use client";

import React, { useRef } from "react";
import { X, FileCheck, FileSpreadsheet, RotateCcw, FolderOpen } from "lucide-react";
import { cleanPecahanSuffix } from "@/components/workspaces/shared/constants";

export interface ArchivistFractionsModalProps {
  isOpen: boolean;
  permohonan: any | null;
  loading: boolean;
  onClose: () => void;
  onUploadFile: (permohonanId: string, e: React.ChangeEvent<HTMLInputElement>, dataBaruId?: string) => void;
  checkPermohonanNeedsReupload: (p: any, targetId?: string | null) => boolean;
}

export const ArchivistFractionsModal: React.FC<ArchivistFractionsModalProps> = React.memo(
  ({
    isOpen,
    permohonan,
    loading,
    onClose,
    onUploadFile,
    checkPermohonanNeedsReupload,
  }) => {
    const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

    if (!isOpen || !permohonan) return null;

    const dataBaruList = (permohonan.dataBaru && permohonan.dataBaru.length > 0) ? permohonan.dataBaru : (permohonan.targetData || []);

    const triggerInput = (dbId: string) => {
      const ref = fileInputRefs.current[dbId];
      if (ref) ref.click();
    };

    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn font-sans select-none">
        <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 flex flex-col gap-5 max-h-[85vh] overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#00a389]/10 rounded-xl text-[#008f78] border border-[#00a389]/20">
                <FolderOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">Kelola Berkas Pecahan</h3>
                <p className="text-xs text-slate-500 font-sans">
                  Unggah arsip digital PDF untuk masing-masing pemohon pecahan Mutasi Sebagian.
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

          {/* Body */}
          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-500 font-sans">No. Permohonan: </span>
                <span className="font-mono font-bold text-slate-800">
                  {permohonan.nomorPelayanan || permohonan.nomorPermohonan || permohonan.applicationNumber}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-sans">Total Pecahan: </span>
                <span className="font-mono font-bold text-[#008f78] bg-[#00a389]/10 border border-[#00a389]/20 px-2 py-0.5 rounded-md">
                  {dataBaruList.length} Pemohon
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              {dataBaruList.map((db: any, idx: number) => {
                const activeArchives = (permohonan.arsipDigital || []).filter(
                  (ad: any) => ad.dataBaruId === db.id && ad.status === "ACTIVE"
                );
                const activeArchive = activeArchives[0];
                const needsReupload = checkPermohonanNeedsReupload(permohonan, db.id);

                return (
                  <div
                    key={db.id || idx}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-[#00a389]/50 transition-all flex items-center justify-between gap-3 shadow-3xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-7 h-7 rounded-lg bg-emerald-50 text-[#008f78] border border-emerald-200 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                        #{idx + 1}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-slate-800 truncate font-sans">
                          {cleanPecahanSuffix(db.namaPemilikBaru || db.ownerName || permohonan.namaWajibPajak)}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono truncate">
                          NOP Temp: {db.nopTemporary || "-"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <input
                        type="file"
                        accept=".pdf"
                        ref={(el) => {
                          fileInputRefs.current[db.id] = el;
                        }}
                        onChange={(e) => onUploadFile(permohonan.id, e, db.id)}
                        className="hidden"
                        disabled={loading}
                      />

                      {needsReupload && (
                        <button
                          type="button"
                          onClick={() => triggerInput(db.id)}
                          disabled={loading}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white rounded-lg text-xs font-semibold shadow-3xs transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Re-upload</span>
                        </button>
                      )}

                      {!needsReupload && !activeArchive && (
                        <button
                          type="button"
                          onClick={() => triggerInput(db.id)}
                          disabled={loading}
                          className="px-3 py-1.5 bg-[#00a389] hover:bg-[#008f78] disabled:opacity-40 text-white rounded-lg text-xs font-semibold shadow-3xs transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                          <span>Upload PDF</span>
                        </button>
                      )}

                      {activeArchive && (
                        <>
                          <a
                            href={activeArchive.urlBlob}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1.5 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg text-emerald-700 text-xs font-medium transition-all flex items-center gap-1"
                          >
                            <FileCheck className="w-3.5 h-3.5 text-[#00a389]" />
                            <span>Lihat PDF</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => triggerInput(db.id)}
                            disabled={loading}
                            className="p-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-500 transition-all cursor-pointer disabled:opacity-40"
                            title="Ganti PDF"
                          >
                            <FolderOpen className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100 shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
            >
              Selesai
            </button>
          </div>
        </div>
      </div>
    );
  }
);

ArchivistFractionsModal.displayName = "ArchivistFractionsModal";
