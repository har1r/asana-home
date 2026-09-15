"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Star, Copy, Check, MoreVertical, Eye, CheckCircle2 } from "lucide-react";
import { formatNop, toTitleCase, getAbbreviatedJenis } from "@/components/workspaces/shared/constants";

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'SUBMITTED':
      return 'bg-amber-50 text-amber-700 border-amber-200/80';
    case 'BUNDLED':
      return 'bg-[#00a389]/10 text-[#008f78] border-[#00a389]/30';
    case 'ARCHIVED':
      return 'bg-sky-50 text-sky-800 border-sky-200/80';
    case 'COMPLETED':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200/80';
    case 'LOCKED':
      return 'bg-slate-100 text-slate-700 border-slate-200/80';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200/80';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'SUBMITTED': return 'Diajukan';
    case 'BUNDLED': return 'Terbundel';
    case 'ARCHIVED': return 'Terarsip';
    case 'COMPLETED': return 'Selesai';
    case 'LOCKED': return 'Terkunci';
    default: return status || 'Aktif';
  }
};

const highlightText = (text: string, search?: string) => {
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

export interface MonitorTableRowProps {
  item: any;
  index: number;
  searchQuery?: string;
  onToggleFavorite?: (id: string) => void;
  onViewDetails: (item: any) => void;
  onToggleVerified: (permohonanId: string, targetId: string | undefined, itemKey: string, isChecked: boolean) => void;
  onComplete?: (id: string, nomor: string) => void;
}

export const MonitorTableRow: React.FC<MonitorTableRowProps> = React.memo(({
  item,
  index,
  searchQuery = "",
  onToggleFavorite,
  onViewDetails,
  onToggleVerified,
  onComplete,
}) => {
  const [copiedText, setCopiedText] = useState<string | null>(null);
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
      const menuHeight = 100;
      const menuWidth = 160;
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
    const handleScrollOrResize = () => setIsMenuOpen(false);
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

  const handleCopyLocal = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const isFavorite = item.isFavorite || false;

  const tglInputStr = useMemo(() => {
    return item.createdAt
      ? new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
      : '—';
  }, [item.createdAt]);

  const nomorVal = item.applicationNumber || item.nomorPelayanan || item.nomorPermohonan || '-';
  const nopRaw = item.nop || item.nopFinal || item.nopTemporary || '';
  const formattedNop = useMemo(() => (nopRaw ? formatNop(nopRaw) : '-'), [nopRaw]);
  const ownerName = useMemo(() => toTitleCase(item.ownerName || item.namaWajibPajak || item.applicantName || '-'), [item]);
  const alamatVal = item.objectAddress || item.ownerAddress || item.alamat || '-';
  const luasStr = useMemo(() => {
    const lt = item.landArea ?? item.luasTanahBaru ?? item.luasTanahLama;
    const lb = item.buildingArea ?? item.luasBangunanBaru ?? item.luasBangunanLama;
    if (lt === undefined && lb === undefined) return '-';
    return `${lt ?? 0} m² / ${lb ?? 0} m²`;
  }, [item]);

  const jenisVal = item.jenisPermohonan || item.applicationType || '';
  const abbreviatedJenis = useMemo(() => getAbbreviatedJenis(jenisVal), [jenisVal]);

  const isCompleted = item.status === 'COMPLETED';
  const isVerified = item.isVerified || isCompleted;

  return (
    <tr
      onClick={() => onViewDetails(item.parentPermohonan || item)}
      className={`hover:bg-slate-50/90 transition-colors group cursor-pointer h-11 border-b border-slate-100 font-sans text-[12px] ${
        item.isPecahanRow ? 'border-l-3 border-l-[#00a389] bg-emerald-50/15' : ''
      }`}
    >
      {/* 1. Index */}
      <td className="py-2.5 px-4 text-center font-normal text-slate-600 font-sans text-[12px]">
        {index + 1}
      </td>

      {/* 2. Star / Favorite */}
      <td className="py-2.5 px-2 text-center">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onToggleFavorite) onToggleFavorite(item.id);
          }}
          className="p-1 text-slate-300 hover:text-amber-500 transition-colors cursor-pointer"
          title={isFavorite ? "Hapus dari Favorit" : "Tandai Favorit"}
        >
          <Star className={`w-4 h-4 ${isFavorite ? "fill-amber-500 text-amber-500" : ""}`} />
        </button>
      </td>

      {/* 3. Tgl Input */}
      <td className="py-2.5 px-4 text-slate-600 font-sans text-[12px] font-normal whitespace-nowrap capitalize">
        {tglInputStr}
      </td>

      {/* 4. No Permohonan */}
      <td className="py-2.5 px-4 min-w-[140px] group/cell relative font-sans">
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] font-normal font-sans text-slate-700 tracking-tight capitalize">
            {highlightText(nomorVal, searchQuery)}
          </span>
          {nomorVal !== '-' && (
            <button
              type="button"
              onClick={(e) => handleCopyLocal(e, nomorVal)}
              className="p-1 rounded opacity-0 group-hover/cell:opacity-100 hover:bg-slate-100 text-slate-400 hover:text-[#00a389] transition-all cursor-pointer flex items-center justify-center w-5 h-5 select-none"
              title="Salin Nomor"
            >
              {copiedText === nomorVal ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 transition-all duration-200 transform scale-110" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          )}
        </div>
      </td>

      {/* 5. NOP */}
      <td className="py-2.5 px-4 min-w-[190px] whitespace-nowrap group/cell relative font-sans">
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-[12px] font-normal font-mono text-slate-800 whitespace-nowrap">
            {highlightText(formattedNop, searchQuery)}
          </span>
          {nopRaw && (
            <button
              type="button"
              onClick={(e) => handleCopyLocal(e, nopRaw)}
              className="p-1 rounded opacity-0 group-hover/cell:opacity-100 hover:bg-slate-100 text-slate-400 hover:text-[#00a389] transition-all cursor-pointer flex items-center justify-center w-5 h-5 select-none"
              title="Salin NOP"
            >
              {copiedText === nopRaw ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 transition-all duration-200 transform scale-110" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          )}
        </div>
      </td>

      {/* 6. Nama Pemohon / WP */}
      <td className="py-2.5 px-4 group/cell relative font-sans">
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-[12px] font-normal text-slate-800 whitespace-nowrap uppercase font-sans">
            {highlightText(ownerName, searchQuery)}
          </span>
          {item.isPecahanRow && (
            <span className="text-[10px] font-normal text-[#008f78] bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded shrink-0 font-sans">
              #{item.pecahanIndex}/{item.totalPecahan}
            </span>
          )}
        </div>
      </td>

      {/* 7. Alamat Objek */}
      <td className="py-2.5 px-4 max-w-[220px] font-sans">
        <span className="text-[12px] font-normal text-slate-600 truncate block capitalize" title={alamatVal}>
          {alamatVal}
        </span>
      </td>

      {/* 8. Luas LT / LB */}
      <td className="py-2.5 px-4 whitespace-nowrap font-sans text-slate-600 text-[12px]">
        {luasStr}
      </td>

      {/* 9. Jenis Layanan */}
      <td className="py-2.5 px-4 whitespace-nowrap font-sans text-center">
        <span className="text-[11px] font-normal text-[#008f78] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-sans">
          {abbreviatedJenis}
        </span>
      </td>

      {/* 10. Verifikasi (isVerified Action Column) */}
      <td className="py-2.5 px-4 whitespace-nowrap font-sans text-center select-none">
        {isCompleted ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-normal px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 font-sans">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Selesai
          </span>
        ) : (
          <label
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 cursor-pointer select-none bg-white px-2.5 py-1 rounded-md border border-slate-200/90 shadow-3xs hover:bg-slate-50 transition-all font-sans"
          >
            <input
              type="checkbox"
              checked={!!isVerified}
              onChange={(e) => {
                onToggleVerified(
                  item.permohonanId || item.id,
                  item.targetId || item.idTargetData || item.id,
                  item.itemKey || item.id,
                  e.target.checked
                );
              }}
              className="w-3.5 h-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
            <span className={`text-[12px] font-normal ${isVerified ? "text-emerald-700 font-semibold" : "text-slate-500"}`}>
              {isVerified ? "Terverifikasi" : "Selesaikan"}
            </span>
          </label>
        )}
      </td>

      {/* 11. Status Berkas */}
      <td className="py-2.5 px-4 whitespace-nowrap font-sans text-center">
        <span className={`text-[11px] font-normal px-2.5 py-0.5 rounded-md border capitalize ${getStatusBadgeClass(item.status || 'SUBMITTED')}`}>
          {getStatusLabel(item.status || 'SUBMITTED')}
        </span>
      </td>

      {/* 12. Actions Menu */}
      <td className="py-2.5 px-4 text-center select-none font-sans">
        <div className="relative inline-block text-left">
          <button
            ref={buttonRef}
            type="button"
            onClick={toggleMenu}
            className={`p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer ${
              isMenuOpen ? 'bg-slate-100 text-slate-700' : ''
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
              className="w-44 bg-white border border-slate-200/90 rounded-md shadow-xl py-1 z-[9999] text-left font-sans animate-fadeIn select-none divide-y divide-slate-100"
            >
              <div className="py-0.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    onViewDetails(item.parentPermohonan || item);
                  }}
                  className="w-full px-3 py-2 text-[12px] text-slate-700 hover:bg-slate-100 flex items-center gap-2.5 transition-colors cursor-pointer font-normal group"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#00a389] transition-colors" />
                  <span>Lihat Detail</span>
                </button>

                {onComplete && item.status !== "COMPLETED" && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(false);
                      const targetApp = item.parentPermohonan || item;
                      onComplete(targetApp.id || item.permohonanId, targetApp.applicationNumber || targetApp.nomorPelayanan || targetApp.id);
                    }}
                    className="w-full px-3 py-2 text-[12px] text-emerald-700 hover:bg-emerald-50 flex items-center gap-2.5 transition-colors cursor-pointer font-normal group border-t border-slate-100"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 group-hover:text-emerald-700 transition-colors" />
                    <span>Tandai Selesai</span>
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

MonitorTableRow.displayName = "MonitorTableRow";
