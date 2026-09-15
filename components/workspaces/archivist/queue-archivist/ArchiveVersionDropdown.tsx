"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { FileCheck, ChevronDown, ExternalLink, History, Clock, Loader2 } from "lucide-react";

export interface ArchiveVersionDropdownProps {
  archives: any[];
  compact?: boolean;
  onToggleStatus?: (archiveId: string, newStatus: "ACTIVE" | "SUPERSEDED") => Promise<void>;
}

export const ArchiveVersionDropdown: React.FC<ArchiveVersionDropdownProps> = ({
  archives,
  compact = false,
  onToggleStatus,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; right: number } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const rightPos = window.innerWidth - rect.right;
      setCoords({
        top: rect.bottom + 6,
        right: Math.max(12, rightPos),
      });
    }
  };

  const toggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen) {
      updatePosition();
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleScrollOrResize() {
      if (buttonRef.current) {
        updatePosition();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen]);

  if (!archives || archives.length === 0) return null;

  // Sort archives descending by version / createdAt
  const sortedArchives = [...archives].sort((a, b) => {
    const vA = a.versi || 0;
    const vB = b.versi || 0;
    if (vA !== vB) return vB - vA;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const activeArchives = sortedArchives.filter((a) => a.status === "ACTIVE");
  const latestArchive = activeArchives[0] || sortedArchives[0];
  const hasMultipleArchives = sortedArchives.length > 1;

  const getCodeBadge = (arc: any, idx: number) => {
    if (arc.labelCode) return arc.labelCode;
    if (arc.archiveType === "ATTACHMENT") return `L${arc.versi || idx + 1}`;
    return `v${arc.versi || sortedArchives.length - idx}`;
  };

  if (!hasMultipleArchives) {
    const singleCode = getCodeBadge(latestArchive, 0);
    if (compact) {
      return (
        <a
          href={latestArchive.urlBlob}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="px-2 py-1 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-md text-emerald-700 text-xs font-semibold transition-all inline-flex items-center gap-1 shrink-0 whitespace-nowrap font-sans shadow-3xs"
          title={`${singleCode} — Buka arsip PDF`}
        >
          <FileCheck className="w-3.5 h-3.5 text-[#00a389]" />
          <span>{singleCode}</span>
        </a>
      );
    }

    return (
      <a
        href={latestArchive.urlBlob}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-md text-emerald-700 text-xs font-semibold transition-all inline-flex items-center gap-1.5 shadow-3xs cursor-pointer font-sans whitespace-nowrap shrink-0"
      >
        <FileCheck className="w-3.5 h-3.5 text-[#00a389]" />
        <span>Lihat PDF ({singleCode})</span>
      </a>
    );
  }

  // Multiple archives present
  const latestCode = getCodeBadge(latestArchive, 0);
  const buttonLabel = activeArchives.length > 1
    ? (compact ? `${activeArchives.length} Berkas PDF` : `${activeArchives.length} Berkas PDF (Aktif)`)
    : (compact ? latestCode : `Lihat PDF (${latestCode})`);

  return (
    <div className="relative inline-block text-left whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
      {compact ? (
        <button
          ref={buttonRef}
          type="button"
          onClick={toggleOpen}
          className="px-2 py-1 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 rounded-md text-emerald-800 text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer shadow-3xs whitespace-nowrap shrink-0"
          title={`Ada ${sortedArchives.length} berkas PDF (${activeArchives.length} Aktif). Klik untuk detail.`}
        >
          <FileCheck className="w-3.5 h-3.5 text-[#00a389]" />
          <span>{buttonLabel}</span>
          <ChevronDown className={`w-3 h-3 text-emerald-600 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
      ) : (
        <button
          ref={buttonRef}
          type="button"
          onClick={toggleOpen}
          className="px-2.5 py-1 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 rounded-md text-emerald-800 text-xs font-semibold transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-3xs font-sans whitespace-nowrap shrink-0"
        >
          <FileCheck className="w-3.5 h-3.5 text-[#00a389]" />
          <span>{buttonLabel}</span>
          <ChevronDown className={`w-3.5 h-3.5 text-emerald-600 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
      )}

      {/* Popover Menu using Portal */}
      {isOpen && coords && mounted && createPortal(
        <div
          ref={dropdownRef}
          style={{ top: `${coords.top}px`, right: `${coords.right}px` }}
          className="fixed w-80 bg-white rounded-md shadow-2xl border border-slate-200/90 z-[100000] p-2.5 flex flex-col gap-1.5 animate-fadeIn font-sans text-left"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-1 py-0.5 border-b border-slate-100 pb-1.5">
            <div className="flex items-center gap-1.5 text-slate-700 text-xs font-bold">
              <History className="w-3.5 h-3.5 text-[#00a389]" />
              <span>Daftar Berkas & Lampiran</span>
            </div>
            <span className="text-[10px] font-mono bg-emerald-50 text-[#008f78] border border-emerald-200 px-1.5 py-0.5 rounded-md font-bold">
              {sortedArchives.length} Berkas
            </span>
          </div>

          <div className="max-h-64 overflow-y-auto flex flex-col gap-1.5 pr-0.5 scrollbar-thin">
            {sortedArchives.map((arc, idx) => {
              const isActive = arc.status === "ACTIVE";
              const codeBadge = getCodeBadge(arc, idx);
              const isAttachment = codeBadge.startsWith("L") || arc.archiveType === "ATTACHMENT";
              const isItemLoading = togglingId === arc.idArchive;

              const formattedDate = arc.createdAt
                ? new Date(arc.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
                : "—";

              return (
                <div
                  key={arc.idArchive || idx}
                  className={`p-2 rounded-md border transition-all flex flex-col gap-1 text-xs ${isActive
                      ? isAttachment
                        ? "bg-sky-50/60 border-sky-200 text-slate-800"
                        : "bg-emerald-50/70 border-emerald-200 text-slate-800"
                      : "bg-slate-50/80 border-slate-200/80 text-slate-500 opacity-75 hover:opacity-100"
                    }`}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className={`text-[10px] font-bold font-mono px-1.5 py-0.2 rounded-md border shrink-0 ${isAttachment
                            ? "bg-sky-100 text-sky-800 border-sky-300"
                            : "bg-emerald-100 text-emerald-800 border-emerald-300"
                          }`}
                      >
                        {codeBadge}
                      </span>

                      {/* Combined Status Pill Button */}
                      {onToggleStatus && arc.idArchive ? (
                        <button
                          type="button"
                          disabled={isItemLoading}
                          onClick={async (e) => {
                            e.stopPropagation();
                            setTogglingId(arc.idArchive);
                            await onToggleStatus(arc.idArchive, isActive ? "SUPERSEDED" : "ACTIVE");
                            setTogglingId(null);
                          }}
                          className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded-md transition-all cursor-pointer flex items-center gap-1 shrink-0 ${isActive
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-3xs"
                              : "bg-slate-200 hover:bg-emerald-100 text-slate-600 hover:text-emerald-800 border border-slate-300 hover:border-emerald-300"
                            }`}
                          title={isActive ? "Klik untuk ubah status ke Digantikan" : "Klik untuk kembalikan status ke Aktif"}
                        >
                          {isItemLoading ? (
                            <Loader2 className="w-2.5 h-2.5 animate-spin" />
                          ) : (
                            <span>{isActive ? "🟢 AKTIF" : "⚪ Digantikan"}</span>
                          )}
                        </button>
                      ) : (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${isActive
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-200 text-slate-500"
                            }`}
                        >
                          {isActive ? "AKTIF" : "Digantikan"}
                        </span>
                      )}
                    </div>

                    <a
                      href={arc.urlBlob}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-0.5 bg-white hover:bg-emerald-600 hover:text-white border border-slate-200 hover:border-emerald-600 rounded text-[11px] font-semibold text-slate-700 transition-all flex items-center gap-1 cursor-pointer shadow-3xs shrink-0"
                      title="Buka PDF di Tab Baru"
                    >
                      <span>Buka</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100/80">
                    <span className="truncate max-w-[170px] font-mono text-[10.5px]" title={arc.fileName || "File PDF"}>
                      {arc.fileName || "File PDF"}
                    </span>
                    <span className="flex items-center gap-0.5 text-[10px] text-slate-400 shrink-0">
                      <Clock className="w-2.5 h-2.5" />
                      {formattedDate}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
