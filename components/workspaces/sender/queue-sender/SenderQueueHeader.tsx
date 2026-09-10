"use client";

import React from "react";

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
}

export const SenderQueueHeader: React.FC<SenderQueueHeaderProps> = React.memo(({
  selectedManifest,
}) => {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4 select-none font-sans">
      <div>
        <h2 className="font-normal text-[13px] capitalize text-slate-800 font-sans flex items-center gap-2">
          <span className="font-mono font-normal text-slate-800 text-[13px]">
            {selectedManifest.nomorManifest}
          </span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[12px] font-normal border leading-none capitalize tracking-wider font-sans ${
              selectedManifest.status === "LOCKED"
                ? "bg-slate-900 text-slate-100 border-slate-800"
                : selectedManifest.status === "SENT"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-indigo-50 text-indigo-700 border-indigo-200"
            }`}
          >
            {getStatusLabel(selectedManifest.status)}
          </span>
        </h2>
      </div>
    </div>
  );
});

SenderQueueHeader.displayName = "SenderQueueHeader";
