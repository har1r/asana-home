import React, { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, FileCheck, FileSpreadsheet, RotateCcw, FolderOpen, Loader2 } from "lucide-react";
import { cleanPecahanSuffix } from "@/components/workspaces/shared/constants";
import { ArchiveVersionDropdown } from "@/components/workspaces/archivist/queue-archivist/ArchiveVersionDropdown";
import { ArchivistUploadDropdown } from "@/components/workspaces/archivist/queue-archivist/ArchivistUploadDropdown";

export interface ArchivistFractionsModalProps {
  isOpen: boolean;
  permohonan: any | null;
  loading: boolean;
  uploadingTargetId?: string | null;
  onClose: () => void;
  onUploadFile: (permohonanId: string, e: React.ChangeEvent<HTMLInputElement>, dataBaruId?: string, uploadMode?: "REPLACE" | "APPEND") => void;
  onToggleArchiveStatus?: (permohonanId: string, archiveId: string, newStatus: "ACTIVE" | "SUPERSEDED", targetDataId?: string | null) => Promise<void>;
  checkPermohonanNeedsReupload: (p: any, targetId?: string | null) => boolean;
}

export const ArchivistFractionsModal: React.FC<ArchivistFractionsModalProps> = React.memo(
  ({
    isOpen,
    permohonan,
    loading,
    uploadingTargetId,
    onClose,
    onUploadFile,
    onToggleArchiveStatus,
    checkPermohonanNeedsReupload,
  }) => {
    const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
    const [mounted, setMounted] = useState(false);
    const uploadModeRef = useRef<"REPLACE" | "APPEND">("REPLACE");

    useEffect(() => {
      setMounted(true);
    }, []);

    if (!isOpen || !permohonan || !mounted) return null;

    const dataBaruList = (permohonan.dataBaru && permohonan.dataBaru.length > 0) ? permohonan.dataBaru : (permohonan.targetData || []);

    const triggerInput = (dbId: string) => {
      const ref = fileInputRefs.current[dbId];
      if (ref) ref.click();
    };

    return createPortal(
      <div className="fixed inset-0 z-[9999] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn font-sans select-none">
        <div className="bg-white rounded-md max-w-2xl w-full p-6 shadow-2xl border border-slate-100 flex flex-col gap-5 max-h-[85vh] overflow-hidden animate-scaleUp">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#00a389]/10 rounded-md text-[#008f78] border border-[#00a389]/20">
                <FolderOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">
                  {dataBaruList.length > 1 ? "Kelola Berkas Pecahan" : "Kelola Arsip Digital"}
                </h3>
                <p className="text-xs text-slate-500 font-sans">
                  {dataBaruList.length > 1
                    ? "Unggah arsip digital PDF untuk masing-masing pemohon pecahan Mutasi Sebagian."
                    : "Unggah, revisi, atau tambah lampiran berkas PDF untuk permohonan ini."}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3">
            <div className="bg-slate-50 p-3 rounded-md border border-slate-200/80 text-xs flex items-center justify-between">
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
                const targetId = db.id || db.idTargetData || `td_${idx}`;
                const isThisItemLoading = loading && (
                  uploadingTargetId === targetId ||
                  uploadingTargetId === db.id ||
                  uploadingTargetId === db.idTargetData ||
                  uploadingTargetId === permohonan.id
                );
                const itemArchives = (db.digitalArchives && db.digitalArchives.length > 0)
                  ? db.digitalArchives
                  : (permohonan.arsipDigital || []).filter(
                      (ad: any) => (ad.dataBaruId === targetId || ad.dataBaruId === db.id || ad.dataBaruId === db.idTargetData)
                    );
                const activeArchives = itemArchives.filter((ad: any) => ad.status === "ACTIVE");
                const activeArchive = activeArchives[0];
                const needsReupload = checkPermohonanNeedsReupload(permohonan, targetId);

                return (
                  <div
                    key={targetId || idx}
                    className="p-3.5 rounded-md border border-slate-200 bg-white hover:border-[#00a389]/50 transition-all flex items-center justify-between gap-3 shadow-3xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-7 h-7 rounded-md bg-emerald-50 text-[#008f78] border border-emerald-200 text-xs font-mono font-bold flex items-center justify-center shrink-0">
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
                          fileInputRefs.current[targetId] = el;
                        }}
                        onChange={(e) => onUploadFile(permohonan.id, e, targetId, uploadModeRef.current)}
                        className="hidden"
                        disabled={loading}
                      />

                      {!activeArchive && (
                        <button
                          type="button"
                          onClick={() => {
                            uploadModeRef.current = "REPLACE";
                            triggerInput(targetId);
                          }}
                          disabled={loading}
                          className="px-3 py-1.5 bg-[#00a389] hover:bg-[#008f78] disabled:opacity-50 text-white rounded-md text-xs font-semibold shadow-3xs transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-wait font-sans"
                        >
                          {isThisItemLoading ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <FileSpreadsheet className="w-3.5 h-3.5" />
                          )}
                          <span>{isThisItemLoading ? "Mengunggah..." : "Upload PDF"}</span>
                        </button>
                      )}

                      {activeArchive && (
                        <>
                          <ArchiveVersionDropdown
                            archives={itemArchives.length > 0 ? itemArchives : [activeArchive]}
                            onToggleStatus={(arcId, newStatus) =>
                              onToggleArchiveStatus
                                ? onToggleArchiveStatus(permohonan.id, arcId, newStatus, targetId)
                                : Promise.resolve()
                            }
                          />

                          <ArchivistUploadDropdown
                            disabled={loading}
                            loading={isThisItemLoading}
                            currentVersion={activeArchive?.versi || 1}
                            onSelectMode={(mode) => {
                              uploadModeRef.current = mode;
                              triggerInput(targetId);
                            }}
                          />
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
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-md transition-all cursor-pointer font-sans"
            >
              Selesai
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  }
);

ArchivistFractionsModal.displayName = "ArchivistFractionsModal";
