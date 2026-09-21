"use client";

import React, { useMemo, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Star, Copy, Check, FileText, Edit, RefreshCw, MoreVertical, History, BookCopy, FileSpreadsheet } from 'lucide-react';
import { formatNop, toTitleCase, getAbbreviatedJenis, formatJenisLayananLabel } from '@/components/workspaces/shared/constants';

// Helper for Jenis Permohonan Badge Styling (Singkatan Resmi, Warna Netral Clean, Center Aligned & Font Sans)
const getJenisPermohonanBadge = (jenis?: string | null) => {
  const abbr = getAbbreviatedJenis(jenis || "");
  const fullName = formatJenisLayananLabel(jenis);
  return (
    <span
      className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[11px] font-medium font-sans bg-slate-100 text-slate-700 border border-slate-200/80 shadow-3xs whitespace-nowrap select-none text-center"
      title={fullName}
    >
      {abbr}
    </span>
  );
};

// Helper for Status Badge Styling (Tanpa Icon, Gunakan rounded-md)
const getStatusBadge = (status: string) => {
  const s = (status || "").toUpperCase();
  let badgeClass = "bg-slate-100 text-slate-700 border-slate-200/80";
  let label = status;

  if (s === "BUNDLED" || s === "TERBUNDEL") {
    badgeClass = "bg-blue-50 text-blue-700 border-blue-200/80";
    label = "Terbundel";
  } else if (s === "LOCKED" || s === "TERKUNCI") {
    badgeClass = "bg-slate-900 text-white border-slate-900";
    label = "Terkunci";
  } else if (s === "IN_MANIFEST" || s === "MANIFESTED") {
    badgeClass = "bg-emerald-50 text-[#008f78] border-emerald-200/80";
    label = "Dimanifest";
  } else if (s === "ARCHIVED" || s === "DIARSIPKAN") {
    badgeClass = "bg-indigo-50 text-indigo-700 border-indigo-200/80";
    label = "Diarsipkan";
  } else if (s === "COMPLETED" || s === "DELIVERED" || s === "SELESAI") {
    badgeClass = "bg-[#e6f6f4] text-[#008f78] border-[#00a389]/30";
    label = "Selesai";
  } else if (s === "SUBMITTED" || s === "DIAJUKAN") {
    badgeClass = "bg-amber-50 text-amber-700 border-amber-200/80";
    label = "Diajukan";
  } else if (s === "REVISION" || s === "REVISI") {
    badgeClass = "bg-rose-50 text-rose-700 border-rose-200/80";
    label = "Revisi";
  } else if (s === "REJECTED" || s === "DITOLAK") {
    badgeClass = "bg-rose-50 text-rose-700 border-rose-200/80";
    label = "Ditolak";
  } else if (s === "DRAFT" || s === "DRAF") {
    badgeClass = "bg-slate-100 text-slate-700 border-slate-200/80";
    label = "Draf";
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-normal border shadow-3xs font-sans capitalize ${badgeClass}`}>
      {label}
    </span>
  );
};

const highlightText = (text: string, search: string) => {
  if (!text) return <span></span>;
  if (!search || !search.trim()) return <span>{text}</span>;
  const escapedSearch = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(`(${escapedSearch})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-amber-100 text-amber-900 rounded-[2px] px-0.5 py-0.25 font-bold">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
};

export const isOverdue = (dateStr: string | null | undefined, status: string): boolean => {
  if (!dateStr) return false;
  if (status === 'COMPLETED' || status === 'REJECTED' || status === 'ARCHIVED') return false;
  return new Date(dateStr) < new Date();
};

export interface DataEntryTableRowProps {
  item: any;
  globalIndex: number;
  searchQuery: string;
  copiedText: string | null;
  sessionUserName?: string | null;
  loading: boolean;
  onSelect: (item: any) => void;
  onToggleFavorite: (id: string) => void;
  onCopy: (e: React.MouseEvent, text: string) => void;
  onEdit: (item: any) => void;
  onDuplicate: (item: any) => void;
  onResubmit?: (id: string) => void;
  onViewSnapshots?: (item: any) => void;
}

export const DataEntryTableRow: React.FC<DataEntryTableRowProps> = React.memo(({
  item,
  globalIndex,
  searchQuery,
  copiedText,
  sessionUserName,
  loading,
  onSelect,
  onToggleFavorite,
  onCopy,
  onEdit,
  onDuplicate,
  onResubmit,
  onViewSnapshots,
}) => {
  const isFavorite = item.isFavorite;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMenuOpen) {
      setIsMenuOpen(false);
      return;
    }

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuHeight = item.status === 'REVISION' ? 155 : 120;
      const menuWidth = 176;
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpward = spaceBelow < menuHeight && rect.top > menuHeight;

      let top = openUpward ? rect.top - menuHeight - 4 : rect.bottom + 4;
      let left = rect.right - menuWidth;

      if (left < 8) left = 8;

      setMenuPosition({ top, left });
      setIsMenuOpen(true);
    }
  };

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleScrollOrResize = () => {
      setIsMenuOpen(false);
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(event.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isMenuOpen]);

  const tglInputStr = useMemo(() => {
    return item.createdAt
      ? new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
      : '—';
  }, [item.createdAt]);

  const tglNopelStr = useMemo(() => {
    const raw = item.serviceNumberDate || item.createdAt;
    if (!raw) return '-';
    return new Date(raw).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  }, [item.serviceNumberDate, item.createdAt]);

  const completionDateVal = item.completionDate;
  const tglSelesaiStr = useMemo(() => {
    if (!completionDateVal) return '-';
    return new Date(completionDateVal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  }, [completionDateVal]);

  const isItemOverdue = useMemo(() => {
    return isOverdue(completionDateVal, item.status);
  }, [completionDateVal, item.status]);

  const nomorVal = item.applicationNumber || '-';
  const formattedNop = useMemo(() => formatNop(item.nop), [item.nop]);
  const jenisVal = item.applicationType || '';
  const abbreviatedJenis = useMemo(() => getAbbreviatedJenis(jenisVal), [jenisVal]);

  return (
    <tr
      onClick={() => onSelect(item)}
      className={`group hover:bg-slate-100/80 transition-colors cursor-pointer ${item.isPecahanRow ? 'border-l-3 border-l-emerald-500 bg-emerald-50/20' : ''
        }`}
    >
      {/* No / Global Index Column */}
      <td className="py-3 px-3 text-center w-12 min-w-[48px] font-normal text-slate-600 font-sans text-[13px]">
        {globalIndex}
      </td>

      {/* No. Permohonan Column (Favorite Star + Green Spreadsheet Icon + Application Number) */}
      <td className="py-3 px-3 min-w-[100px] group/cell relative font-sans">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(item.id);
            }}
            className="p-1 text-slate-300 hover:text-amber-500 transition-colors cursor-pointer shrink-0"
            title={isFavorite ? "Hapus dari Favorit" : "Tambah ke Favorit"}
          >
            <Star className={`w-4 h-4 ${isFavorite ? 'text-amber-500 fill-amber-500' : ''}`} />
          </button>
          <span className="font-normal text-slate-700 font-mono tracking-tight text-[13px]">
            {highlightText(nomorVal, searchQuery)}
          </span>
          <button
            type="button"
            onClick={(e) => onCopy(e, nomorVal)}
            className="p-1 rounded opacity-0 group-hover/cell:opacity-100 hover:bg-slate-200 text-slate-400 hover:text-[#00a389] transition-all cursor-pointer flex items-center justify-center w-5 h-5 select-none"
            title="Salin Nomor"
          >
            {copiedText === nomorVal ? (
              <Check className="w-3.5 h-3.5 text-emerald-600 transition-all duration-200 transform scale-110" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
        </div>
      </td>

      {/* Tgl. Permohonan Column */}
      <td className="py-3 px-3 min-w-[100px] text-slate-700 font-sans text-[13px] font-normal whitespace-nowrap capitalize">
        {tglNopelStr}
      </td>

      {/* Tgl. Selesai Column */}
      <td className="py-3 px-3 min-w-[120px] w-[12%] whitespace-nowrap font-sans text-[13px]">
        {tglSelesaiStr ? (
          <div className="flex items-center gap-1.5">
            <span className={`text-[13px] font-sans font-normal capitalize px-2 py-0.5 rounded ${isItemOverdue
              ? 'bg-rose-100 text-rose-700 border border-rose-200 animate-pulse'
              : 'text-slate-700'
              }`}>
              {tglSelesaiStr}
            </span>
          </div>
        ) : "-"}
      </td>

      {/* NOP Column */}
      <td className="py-3 px-3 min-w-[190px] w-[20%] whitespace-nowrap group/cell relative font-sans">
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-[13px] font-normal font-mono text-slate-700 tracking-tight whitespace-nowrap">
            {highlightText(formattedNop, searchQuery)}
          </span>
          <button
            onClick={(e) => onCopy(e, item.nop)}
            className="p-1 rounded opacity-0 group-hover/cell:opacity-100 hover:bg-slate-200 text-slate-400 hover:text-[#00a389] transition-all cursor-pointer flex items-center justify-center w-5 h-5 select-none"
            title="Salin NOP"
          >
            {copiedText === item.nop ? (
              <Check className="w-3.5 h-3.5 text-emerald-600 transition-all duration-200 transform scale-110" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
        </div>
      </td>

      {/* Nama Pemohon Column */}
      <td className="py-3 px-3 min-w-[170px] w-[18%] group/cell relative font-sans">
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-[13px] font-normal text-slate-700 whitespace-nowrap font-sans">
            {highlightText(toTitleCase(item.displayOwnerName || item.ownerName || '-'), searchQuery)}
          </span>
          {item.isPecahanRow && (
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-1.5 py-0.2 rounded-md shrink-0 font-sans">
              #{item.pecahanIndex}/{item.totalPecahan}
            </span>
          )}
          <button
            onClick={(e) => onCopy(e, item.displayOwnerName || item.ownerName || '-')}
            className="p-1 rounded opacity-0 group-hover/cell:opacity-100 hover:bg-slate-200 text-slate-400 hover:text-[#00a389] transition-all cursor-pointer flex items-center justify-center w-5 h-5 select-none"
            title="Salin Nama Pemohon"
          >
            {copiedText === (item.displayOwnerName || item.ownerName) ? (
              <Check className="w-3.5 h-3.5 text-emerald-600 transition-all duration-200 transform scale-110" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
        </div>
      </td>

      {/* Jenis Layanan Badge Column (Center Aligned) */}
      <td className="py-3 px-3 text-center min-w-[110px] w-[10%] font-sans">
        <div className="flex items-center justify-center">
          {getJenisPermohonanBadge(jenisVal)}
        </div>
      </td>

      {/* Status Badge Column */}
      <td className="py-3 px-3 text-center font-sans">
        <div className="flex items-center justify-center">
          {getStatusBadge(item.status)}
        </div>
      </td>

      {/* Action Column (Three Dots Menu) */}
      <td className="py-3 px-3 text-center font-sans">
        <div className="flex items-center justify-center">
          <button
            ref={buttonRef}
            type="button"
            onClick={toggleMenu}
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${isMenuOpen
              ? 'bg-slate-200 text-slate-800'
              : 'text-slate-400 hover:text-slate-800 hover:bg-slate-200/60'
              }`}
            title="Menu Aksi"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {isMenuOpen && menuPosition && typeof window !== 'undefined' && createPortal(
            <div
              ref={menuRef}
              style={{
                position: 'fixed',
                top: `${menuPosition.top}px`,
                left: `${menuPosition.left}px`,
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-44 bg-white border border-slate-200/90 rounded-lg shadow-xl py-1 z-[9999] text-left font-sans animate-fadeIn select-none divide-y divide-slate-100"
            >
              <div className="py-0.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    onEdit(item);
                  }}
                  className="w-full px-3 py-2 text-[12px] text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer font-medium group"
                >
                  <Edit className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-colors" />
                  <span>Edit Berkas</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    onDuplicate(item);
                  }}
                  className="w-full px-3 py-2 text-[12px] text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer font-medium group"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-colors" />
                  <span>Duplikasi Berkas</span>
                </button>

                {onViewSnapshots && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(false);
                      onViewSnapshots(item);
                    }}
                    className="w-full px-3 py-2 text-[12px] text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer font-medium group"
                  >
                    <BookCopy className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-colors" />
                    <span>Riwayat Versi</span>
                  </button>
                )}
              </div>
            </div>,
            document.body
          )}
        </div>
      </td>
    </tr>
  );
});

