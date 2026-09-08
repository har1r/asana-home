"use client";

import React, { useMemo, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Star, Copy, Check, FileText, Edit, RefreshCw, MoreVertical, History, BookCopy } from 'lucide-react';
import { formatNop, toTitleCase } from '@/components/workspaces/shared/constants';

const JENIS_ABBR_MAP: Record<string, string> = {
  PARTIAL_MUTATION: 'MS',
  MUTASI_SEBAGIAN: 'MS',
  MERGER_MUTATION: 'MG',
  MUTASI_PENGGABUNGAN: 'MG',
  EXPIRED_UPDATE: 'MHU',
  MUTASI_HABIS_UPDATE: 'MHU',
  EXPIRED_REGULAR: 'MHR',
  MUTASI_HABIS_REGULER: 'MHR',
  CORRECTION: 'PBT',
  PEMBETULAN: 'PBT',
  REACTIVATION: 'AKT',
  PENGAKTIFAN: 'AKT',
  NEW_TAX_OBJECT: 'OPB',
  OBJEK_PAJAK_BARU: 'OPB',
};

const getAbbreviatedJenis = (jenis?: string | null) => {
  if (!jenis) return '-';
  return JENIS_ABBR_MAP[jenis] || jenis;
};

const STATUS_LABEL_MAP: Record<string, string> = {
  SUBMITTED: 'Diajukan',
  REVISION: 'Revisi',
  BUNDLED: 'Terbundel',
  LOCKED: 'Terkunci',
  IN_MANIFEST: 'Dimanifest',
  ARCHIVED: 'Diarsipkan',
  COMPLETED: 'Selesai',
  REJECTED: 'Ditolak',
  DRAFT: 'Draf',
  VOID: 'Dibatalkan',
  SENT: 'Dikirim',
};

const getStatusLabel = (status: string) => STATUS_LABEL_MAP[status] || status;

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'SUBMITTED':
      return 'bg-amber-50 text-amber-700 border-amber-200/80';
    case 'REVISION':
      return 'bg-rose-50 text-rose-700 border-rose-200/80';
    case 'BUNDLED':
      return 'bg-blue-50 text-blue-700 border-blue-200/80';
    case 'ARCHIVED':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200/80';
    case 'COMPLETED':
      return 'bg-[#e6f6f4] text-[#008f78] border-[#00a389]/30';
    case 'REJECTED':
      return 'bg-rose-50 text-rose-700 border-rose-200/80';
    case 'DRAFT':
      return 'bg-slate-100 text-slate-700 border-slate-200/80';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200/80';
  }
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
      className={`hover:bg-slate-50/90 transition-colors group cursor-pointer h-11 ${item.isPecahanRow ? 'border-l-3 border-l-emerald-500 bg-emerald-50/20' : ''
        }`}
    >
      <td className="py-2.5 px-4 text-center font-normal text-slate-600 font-sans text-[12px]">
        {globalIndex}
      </td>
      <td className="py-2.5 px-2 text-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(item.id);
          }}
          className="p-1 text-slate-300 hover:text-amber-500 transition-colors cursor-pointer"
          title={isFavorite ? "Hapus dari Favorit" : "Tambah ke Favorit"}
        >
          <Star className={`w-4 h-4 ${isFavorite ? 'text-amber-500 fill-amber-500' : ''}`} />
        </button>
      </td>
      <td className="py-2.5 px-4 text-slate-600 font-sans text-[12px] font-normal whitespace-nowrap capitalize">
        {tglInputStr}
      </td>
      <td className="py-2.5 px-4 text-slate-600 text-[12px] font-normal font-sans whitespace-nowrap">
        <div className="flex items-center gap-1.5 min-w-0" title={item.penginput?.name || sessionUserName || "Petugas Input"}>
          <span className="truncate max-w-[140px] font-sans font-normal text-[12px]">{toTitleCase(item.penginput?.name || sessionUserName || "Petugas Input")}</span>
        </div>
      </td>
      <td className="py-2.5 px-4 text-slate-600 font-sans text-[12px] font-normal whitespace-nowrap capitalize">
        {tglNopelStr}
      </td>
      <td className="py-2.5 px-4 whitespace-nowrap font-sans">
        {tglSelesaiStr ? (
          <div className="flex items-center gap-1.5">
            <span className={`text-[12px] font-sans font-normal capitalize px-2 py-0.5 rounded ${isItemOverdue
              ? 'bg-rose-100 text-rose-700 border border-rose-200 animate-pulse'
              : 'text-slate-600'
              }`}>
              {tglSelesaiStr}
            </span>
          </div>
        ) : "-"}
      </td>
      <td className="py-2.5 px-4 min-w-[150px] group/cell relative font-sans">
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] font-normal font-sans text-slate-600 tracking-tight capitalize">
            {highlightText(nomorVal, searchQuery)}
          </span>
          <button
            onClick={(e) => onCopy(e, nomorVal)}
            className="p-1 rounded opacity-0 group-hover/cell:opacity-100 hover:bg-slate-100 text-slate-400 hover:text-[#00a389] transition-all cursor-pointer flex items-center justify-center w-5 h-5 select-none"
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
      <td className="py-2.5 px-4 min-w-[210px] whitespace-nowrap group/cell relative font-sans">
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-[12px] font-normal font-sans text-slate-600 whitespace-nowrap capitalize">
            {highlightText(formattedNop, searchQuery)}
          </span>
          <button
            onClick={(e) => onCopy(e, item.nop)}
            className="p-1 rounded opacity-0 group-hover/cell:opacity-100 hover:bg-slate-100 text-slate-400 hover:text-[#00a389] transition-all cursor-pointer flex items-center justify-center w-5 h-5 select-none"
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
      <td className="py-2.5 px-4 group/cell relative font-sans">
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-[12px] font-normal text-slate-600 whitespace-nowrap font-sans">
            {highlightText(toTitleCase(item.displayOwnerName || item.ownerName || '-'), searchQuery)}
          </span>
          {item.isPecahanRow && (
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-1.5 py-0.2 rounded-md shrink-0 font-sans">
              #{item.pecahanIndex}/{item.totalPecahan}
            </span>
          )}
          <button
            onClick={(e) => onCopy(e, item.displayOwnerName || item.ownerName || '-')}
            className="p-1 rounded opacity-0 group-hover/cell:opacity-100 hover:bg-slate-100 text-slate-400 hover:text-[#00a389] transition-all cursor-pointer flex items-center justify-center w-5 h-5 select-none"
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
      <td className="py-2.5 px-4 font-sans">
        <span
          className="text-[12px] font-normal text-slate-600 bg-slate-100 border border-slate-200/90 px-2 py-0.5 rounded capitalize font-sans"
          title={(jenisVal || '').replace(/_/g, ' ')}
        >
          {abbreviatedJenis}
        </span>
      </td>
      <td className="py-2.5 px-4 text-center font-sans">
        <div className="flex items-center justify-center gap-1">
          <span className={`px-2.5 py-0.5 text-[12px] font-normal rounded-full border capitalize font-sans ${getStatusBadgeClass(item.status)}`}>
            {getStatusLabel(item.status)}
          </span>
        </div>
      </td>
      <td className="py-2.5 px-4 text-center font-sans">
        <div className="flex items-center justify-center">
          <button
            ref={buttonRef}
            type="button"
            onClick={toggleMenu}
            className={`p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer ${isMenuOpen ? 'bg-slate-100 text-slate-700' : ''
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
                  <Edit className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 transition-colors" />
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
                  <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
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
                    <BookCopy className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#00a389] transition-colors" />
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

DataEntryTableRow.displayName = 'DataEntryTableRow';
