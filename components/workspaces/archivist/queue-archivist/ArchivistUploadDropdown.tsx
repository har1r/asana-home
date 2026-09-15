"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { FolderOpen, RefreshCw, FilePlus, ChevronDown, Loader2 } from "lucide-react";

export interface ArchivistUploadDropdownProps {
  onSelectMode: (mode: "REPLACE" | "APPEND") => void;
  disabled?: boolean;
  loading?: boolean;
  currentVersion?: number;
}

export const ArchivistUploadDropdown: React.FC<ArchivistUploadDropdownProps> = ({
  onSelectMode,
  disabled = false,
  loading = false,
  currentVersion = 1,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
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
    if (disabled || loading) return;
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

  const handleChoose = (mode: "REPLACE" | "APPEND") => {
    setIsOpen(false);
    onSelectMode(mode);
  };

  return (
    <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleOpen}
        disabled={disabled || loading}
        className="p-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 active:bg-slate-200 rounded-lg text-slate-600 hover:text-slate-900 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-wait flex items-center gap-0.5 shrink-0 shadow-3xs"
        title="Opsi Unggah / Unggah Ulang Berkas"
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00a389]" />
        ) : (
          <>
            <FolderOpen className="w-3.5 h-3.5 text-slate-600" />
            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
          </>
        )}
      </button>

      {/* Contextual Popover Menu using React Portal */}
      {isOpen && coords && mounted && createPortal(
        <div
          ref={dropdownRef}
          style={{ top: `${coords.top}px`, right: `${coords.right}px` }}
          className="fixed w-64 bg-white rounded-lg shadow-2xl border border-slate-200/90 z-[100000] p-1.5 flex flex-col gap-0.5 animate-fadeIn font-sans text-left divide-y divide-slate-100"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="py-0.5">
            <button
              type="button"
              onClick={() => handleChoose("REPLACE")}
              className="w-full p-2 hover:bg-emerald-50/70 rounded-md transition-colors cursor-pointer text-left flex items-start gap-2.5 group"
            >
              <div className="p-1.5 rounded-md bg-emerald-100/70 text-[#008f78] group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0 mt-0.5">
                <RefreshCw className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-slate-800 group-hover:text-[#008f78] transition-colors leading-tight">
                  🔄 Revisi Berkas
                </span>
                <span className="text-[10.5px] text-slate-500 leading-tight mt-0.5">
                  Menonaktifkan v{currentVersion} & mengunggah v{currentVersion + 1}
                </span>
              </div>
            </button>
          </div>

          <div className="pt-1 py-0.5">
            <button
              type="button"
              onClick={() => handleChoose("APPEND")}
              className="w-full p-2 hover:bg-emerald-50/70 rounded-md transition-colors cursor-pointer text-left flex items-start gap-2.5 group"
            >
              <div className="p-1.5 rounded-md bg-indigo-100/70 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0 mt-0.5">
                <FilePlus className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-700 transition-colors leading-tight">
                  ➕ Tambah Lampiran Baru
                </span>
                <span className="text-[10.5px] text-slate-500 leading-tight mt-0.5">
                  Menyimpan sebagai berkas aktif tambahan
                </span>
              </div>
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
