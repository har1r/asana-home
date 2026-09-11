"use client";

import React, { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  FileEdit,
  FileText,
  Check,
  ChevronRight,
  Copy,
  Layers,
  Filter
} from 'lucide-react';
import { getApplicationSnapshots } from '@/app/actions/data-entry';
import { formatNop, toTitleCase } from './constants';

interface ApplicationSnapshotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  application: any;
}

const typeLabelMap: Record<string, string> = {
  PARTIAL_MUTATION: 'Mutasi Sebagian',
  MERGER_MUTATION: 'Mutasi Penggabungan',
  EXPIRED_UPDATE: 'Mutasi Habis Update',
  EXPIRED_REGULAR: 'Mutasi Habis Reguler',
  NEW_TAX_OBJECT: 'Objek Pajak Baru',
  CORRECTION: 'Pembetulan',
  REACTIVATION: 'Pengaktifan',
};

const snapshotTypeLabelMap: Record<string, string> = {
  INITIAL_SUBMIT: 'Pendaftaran Awal',
  UPDATE_DATA: 'Pengeditan Data',
  RESUBMIT_AFTER_REVISION: 'Resubmit Revisi',
  DUPLICATE_SUBMIT: 'Hasil Duplikasi',
};

export const ApplicationSnapshotDrawer: React.FC<ApplicationSnapshotDrawerProps> = React.memo(({
  isOpen,
  onClose,
  application
}) => {
  const [mounted, setMounted] = useState(false);
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number; targetY: number } | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [showMore, setShowMore] = useState(false);

  const drawerRef = useRef<HTMLDivElement>(null);

  const handleCopy = useCallback((e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 1200);
  }, []);

  const fetchSnapshots = useCallback(async (appId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getApplicationSnapshots(appId);
      if (res.success) {
        setSnapshots(res.list || []);
      } else {
        setError(res.error || 'Gagal memuat riwayat versi.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem saat memuat riwayat versi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen && application?.id) {
      fetchSnapshots(application.id);
    } else {
      setSnapshots([]);
      setExpandedId(null);
      setPopoverPos(null);
      setShowMore(false);
    }
  }, [isOpen, application, fetchSnapshots]);

  const handleItemClick = (e: React.MouseEvent, snapId: string) => {
    if (expandedId === snapId) {
      setExpandedId(null);
      setPopoverPos(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      const targetY = rect.top + rect.height / 2;

      // Calculate leftPos from the drawer panel's right edge so popover NEVER touches or overlaps drawer
      let leftPos = rect.right + 12;
      if (drawerRef.current) {
        const drawerRect = drawerRef.current.getBoundingClientRect();
        leftPos = drawerRect.right + 12;
      }

      setExpandedId(snapId);
      setPopoverPos({ top: rect.top, left: leftPos, targetY });
    }
  };

  if (!isOpen || !application) return null;
  if (!mounted) return null;

  const appNumber = application.applicationNumber || application.nomorPelayanan || '-';
  const rawType = application.applicationType || application.jenisPermohonan || '';
  const displayType = typeLabelMap[rawType] || rawType || 'Permohonan';

  const latestSnapshot = snapshots[0];
  const historicalSnapshots = snapshots.slice(1);
  const displayedHistorical = showMore ? historicalSnapshots : historicalSnapshots.slice(0, 4);

  const activeSnapshot = snapshots.find(s => s.id === expandedId);
  const activeIsLatest = activeSnapshot ? activeSnapshot.id === latestSnapshot?.id : false;
  const activeIndex = activeSnapshot ? snapshots.findIndex(s => s.id === expandedId) : -1;
  const activeVersionLabel = activeSnapshot
    ? (activeIsLatest ? 'Versi Terbaru' : `Versi ${(snapshots.length - activeIndex).toFixed(1)}`)
    : '';

  return createPortal(
    <div className="fixed inset-0 z-[9990] overflow-hidden font-sans select-none">
      {/* Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      {/* Slide-over Panel (Clean Minimalist Left Side Drawer) */}
      <div className="fixed inset-y-0 left-0 max-w-full flex pr-10 z-[9995]">
        <div
          ref={drawerRef}
          className="w-screen max-w-sm bg-white shadow-2xl border-r border-slate-200/80 flex flex-col font-sans animate-slideInLeft relative"
        >
          {/* Header Minimalist */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4 select-none shrink-0 bg-white">
            <div className="flex flex-col">
              <h3 className="text-sm font-normal text-slate-900 font-sans tracking-tight">
                Riwayat Versi Permohonan
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <div className="h-7 px-2.5 rounded-md border border-slate-200 bg-slate-50/50 flex items-center gap-1.5 text-[11px] text-slate-500 font-normal">
                <span>{snapshots.length} Versi</span>
              </div>

              <button
                onClick={onClose}
                className="w-7 h-7 rounded-md border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                title="Tutup Modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Drawer Body: Clean Divided List (Matching Reference Image) */}
          <div className="flex-1 overflow-y-auto scrollbar-thin bg-white flex flex-col relative">

            {/* Skeleton Loading State */}
            {loading && (
              <div className="p-6 flex flex-col gap-4 animate-pulse">
                <div className="h-16 bg-slate-100 rounded-md w-full"></div>
                <div className="h-12 bg-slate-50 rounded-md w-full"></div>
                <div className="h-12 bg-slate-50 rounded-md w-full"></div>
              </div>
            )}

            {/* Error Message */}
            {!loading && error && (
              <div className="m-6 bg-rose-50 border border-rose-100 text-rose-600 text-[12px] font-normal p-4 rounded-md">
                {error}
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && snapshots.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center text-slate-400">
                <FileText className="w-9 h-9 stroke-[1.5] mb-2 text-slate-300" />
                <span className="text-[12px] font-normal text-slate-500">Belum ada riwayat versi.</span>
              </div>
            )}

            {!loading && !error && snapshots.length > 0 && (
              <div className="flex flex-col w-full relative">

                {/* 1. TOP SECTION: NEWEST / ACTIVE VERSION CARD */}
                {latestSnapshot && (
                  <div className="p-5 border-b border-slate-100 bg-white flex flex-col gap-3">
                    {/* Header Row above latest card: Nomor Permohonan (Left) & Jenis Permohonan (Right) */}
                    <div className="flex items-center justify-between gap-2 select-none font-sans">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-[12px] font-normal text-slate-800 font-mono tracking-tight truncate">{appNumber}</span>
                      </div>

                      <div className="shrink-0">
                        <span className="text-[11px] font-normal text-[#008f78] bg-[#00a389]/12 border border-[#00a389]/20 px-2.5 py-0.5 rounded-md font-sans">
                          {displayType}
                        </span>
                      </div>
                    </div>

                    {/* Latest Card Container with Left Edge Accent Bar */}
                    <div className="relative">
                      {/* Left Edge Accent Bar attached directly to panel edge */}
                      <div className="absolute -left-5 top-2 bottom-2 w-[4px] bg-[#00a389] rounded-r-full z-10" />

                      <div
                        onClick={(e) => handleItemClick(e, latestSnapshot.id)}
                        className={`group relative bg-[#00a389]/8 border transition-all rounded-md p-3.5 flex flex-col gap-2 cursor-pointer ${expandedId === latestSnapshot.id ? 'border-[#00a389] ring-2 ring-[#00a389]/15' : 'border-[#00a389]/20 hover:border-[#00a389]/40'
                          }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-md bg-white border border-[#00a389]/20 text-[#00a389] flex items-center justify-center shrink-0 shadow-3xs">
                              <FileEdit className="w-4 h-4 text-[#00a389]" />
                            </div>

                            <div className="flex flex-col min-w-0">
                              <span className="text-[12px] font-normal text-slate-900 tracking-tight font-sans">
                                Versi Terbaru
                              </span>

                              {/* Snapshot Action / Version Title (Replaces Note Position) */}
                              <span className="text-[11px] font-normal text-[#008f78] font-sans truncate mt-0.5">
                                {snapshotTypeLabelMap[latestSnapshot.snapshotType] || 'Pendaftaran Awal'}
                              </span>

                              <span className="text-[11px] text-slate-500 font-sans truncate mt-0.5">
                                {new Date(latestSnapshot.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })} • Oleh {latestSnapshot.actor?.name || 'Petugas'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <div className="w-5 h-5 rounded-full bg-[#00a389] text-white flex items-center justify-center shadow-3xs">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                            <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${expandedId === latestSnapshot.id ? 'translate-x-1 text-[#00a389]' : ''}`} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. BOTTOM SECTION: HISTORICAL VERSIONS DIVIDED LIST */}
                {historicalSnapshots.length > 0 && (
                  <div className="divide-y divide-slate-100 flex flex-col font-sans relative">
                    {displayedHistorical.map((snap: any, hIdx: number) => {
                      const versionIndex = snapshots.length - 1 - hIdx;
                      const versionNum = versionIndex.toFixed(1);
                      const isExpanded = expandedId === snap.id;
                      const dateStr = new Date(snap.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
                      const actorName = snap.actor?.name || 'Petugas';

                      return (
                        <div key={snap.id} className="relative flex flex-col">

                          {/* Historical Row Item */}
                          <div
                            onClick={(e) => handleItemClick(e, snap.id)}
                            className={`px-6 py-3.5 transition-colors flex flex-col gap-1.5 cursor-pointer group relative ${isExpanded ? 'bg-indigo-50/50' : 'hover:bg-slate-50/70'
                              }`}
                          >
                            <div className="flex items-center justify-between gap-3">

                              <div className="flex items-center gap-3.5 min-w-0">
                                <div className="w-8.5 h-8.5 rounded-md bg-indigo-50/70 border border-indigo-100/80 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-100/70 transition-colors">
                                  <FileText className="w-4 h-4 text-indigo-600" />
                                </div>

                                <div className="flex flex-col min-w-0">
                                  <span className="text-[12px] font-normal text-slate-900 font-sans tracking-tight">
                                    Versi {versionNum}
                                  </span>

                                  {/* Snapshot Action / Version Title (Replaces Note Position) */}
                                  <span className="text-[11px] font-normal text-slate-700 font-sans truncate mt-0.5">
                                    {snapshotTypeLabelMap[snap.snapshotType] || 'Snapshot Data'}
                                  </span>

                                  <span className="text-[11px] text-slate-500 font-sans truncate mt-0.5">
                                    {dateStr} • Oleh {actorName}
                                  </span>
                                </div>
                              </div>

                              <ChevronRight className={`w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-transform ${isExpanded ? 'translate-x-1 text-indigo-600' : ''}`} />

                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Show More Button */}
                {historicalSnapshots.length > 4 && !showMore && (
                  <div className="p-5 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setShowMore(true)}
                      className="w-full py-2.5 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-md text-[12px] font-normal text-slate-600 transition-colors cursor-pointer shadow-3xs font-sans"
                    >
                      Tampilkan Lebih Banyak ({historicalSnapshots.length - 4} Versi Lagi)
                    </button>
                  </div>
                )}

              </div>
            )}

          </div>

          {/* Footer Minimalist */}
          <div className="px-6 py-3.5 border-t border-slate-100 flex items-center justify-between select-none shrink-0 bg-white font-sans">
            <span className="text-[12px] text-slate-500 font-normal">
              {snapshots.length} versi tercatat
            </span>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[12px] font-normal transition-colors cursor-pointer font-sans"
            >
              Tutup
            </button>
          </div>

        </div>
      </div>

      {/* FLOATING DETAIL POPOVER CARD RENDERED AT TOP Z-INDEX PORTAL (z-[10000]) */}
      {activeSnapshot && popoverPos && (
        <PortalFloatingPopover
          snap={activeSnapshot}
          isLatest={activeIsLatest}
          versionLabel={activeVersionLabel}
          top={popoverPos.top}
          left={popoverPos.left}
          targetY={popoverPos.targetY}
          onClose={() => {
            setExpandedId(null);
            setPopoverPos(null);
          }}
          copiedText={copiedText}
          handleCopy={handleCopy}
          application={application}
        />
      )}
    </div>,
    document.body
  );
});

// TOP Z-INDEX (10000) PORTAL FLOATING POPOVER
const PortalFloatingPopover: React.FC<{
  snap: any;
  isLatest: boolean;
  versionLabel: string;
  top: number;
  left: number;
  targetY: number;
  onClose: () => void;
  copiedText: string | null;
  handleCopy: (e: React.MouseEvent, text: string) => void;
  application?: any;
}> = ({ snap, isLatest, versionLabel, top, left, targetY, onClose, copiedText, handleCopy, application }) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [adjustedTop, setAdjustedTop] = useState<number>(top);

  useLayoutEffect(() => {
    if (popoverRef.current) {
      const cardHeight = popoverRef.current.getBoundingClientRect().height;
      const windowHeight = window.innerHeight;

      // Calculate max allowed top position so popover NEVER extends beyond (windowHeight - 16)
      const maxAllowedTop = Math.max(16, windowHeight - cardHeight - 16);

      // Ideal top position: slightly above clicked row
      const idealTop = Math.max(16, top - 12);

      // Final top clamped to maxAllowedTop
      const finalTop = Math.min(idealTop, maxAllowedTop);
      setAdjustedTop(finalTop);
    }
  }, [top, snap]);

  let snapshotData = snap.snapshotData || {};
  if (typeof snapshotData === 'string') {
    try {
      snapshotData = JSON.parse(snapshotData);
    } catch (e) {
      snapshotData = {};
    }
  }

  const appNumber = snapshotData.applicationNumber || application?.applicationNumber || application?.nomorPelayanan || '-';
  const appType = snapshotData.applicationType || application?.applicationType || application?.jenisPermohonan || '-';
  const serviceDate = snapshotData.serviceNumberDate || application?.serviceNumberDate || application?.tanggalPermohonan;
  const compDate = snapshotData.completionDate || application?.completionDate || application?.estimasiSelesai;

  const rawPrevList: any[] = Array.isArray(snapshotData.previousData) && snapshotData.previousData.length > 0
    ? snapshotData.previousData
    : (Array.isArray(application?.previousData) ? application.previousData : []);

  const rawTargetList: any[] = Array.isArray(snapshotData.targetData) && snapshotData.targetData.length > 0
    ? snapshotData.targetData
    : (Array.isArray(application?.targetData) ? application.targetData : []);

  const prevList = rawPrevList;
  const targetList = rawTargetList;

  // Calculate Caret Arrow Y coordinate:
  // Points at targetY (middle of clicked row), clamped within screen vertical boundary
  const windowH = typeof window !== 'undefined' ? window.innerHeight : 800;
  const minCaretY = 32;
  const maxCaretY = windowH - 40;
  const caretY = Math.max(minCaretY, Math.min(targetY - 7, maxCaretY));

  return createPortal(
    <>
      {/* Dynamic Caret Arrow pointing to clicked row in left drawer panel */}
      <div
        style={{ top: `${caretY}px`, left: `${left - 7}px` }}
        className="fixed z-[10001] w-3.5 h-3.5 bg-white border-b border-l border-slate-200/90 rotate-45 pointer-events-none transition-[top] duration-200 ease-out"
      />

      <div
        ref={popoverRef}
        style={{
          top: '16px',
          left: `${left}px`,
          height: 'calc(100vh - 32px)',
          maxHeight: 'calc(100vh - 32px)'
        }}
        className="fixed z-[10000] w-[540px] max-w-[calc(100vw-420px)] overflow-y-auto scrollbar-thin bg-white border border-slate-200/90 rounded-md shadow-2xl flex flex-col font-sans animate-scaleUp text-[12px] select-text cursor-default"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Sticky Floating Card Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-xs z-30 px-5 py-3.5 border-b border-slate-100 flex items-center justify-between font-sans shrink-0 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-sm font-normal text-slate-900 font-sans tracking-tight">
              Detail {versionLabel}
            </span>
            {snapshotTypeLabelMap[snap.snapshotType] && (
              <span className={`text-[11px] font-normal px-2.5 py-0.5 rounded-md font-sans ${isLatest ? 'text-[#008f78] bg-[#00a389]/15 border border-[#00a389]/20' : 'text-slate-600 bg-slate-100 border border-slate-200'
                }`}>
                {snapshotTypeLabelMap[snap.snapshotType]}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Tutup Detail"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 flex flex-col gap-4">

          {/* Note Block (Exclusive to Portal Popover) */}
          {snap.note && (
            <div className="bg-slate-50 p-3.5 rounded-md border border-slate-200/90 text-[12px] font-normal text-slate-700 leading-relaxed font-sans flex flex-col gap-1">
              <span className="text-[11px] font-normal text-slate-500 uppercase tracking-wider block">Catatan Versi:</span>
              <p className="italic font-normal text-slate-700 font-sans">"{snap.note}"</p>
            </div>
          )}

          {/* Summary Header Rows */}
          <div className="bg-slate-50/80 p-3.5 rounded-md border border-slate-200/90 grid grid-cols-2 gap-2.5 text-[12px] font-sans">
            <div>
              <span className="text-slate-500 block text-[11px] font-normal font-sans">No. Permohonan</span>
              <span className="font-mono font-normal text-slate-800">{appNumber}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px] font-normal font-sans">Jenis Layanan</span>
              <span className="font-normal text-slate-800 font-sans">{typeLabelMap[appType] || appType || '-'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px] font-normal font-sans">Tanggal Permohonan</span>
              <span className="font-normal text-slate-800 font-sans">{serviceDate ? new Date(serviceDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px] font-normal font-sans">Estimasi Selesai (SLA)</span>
              <span className="font-normal text-slate-800 font-sans">{compDate ? new Date(compDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</span>
            </div>
          </div>

          {/* Data SPPT Lama */}
          {prevList.length > 0 && (
            <div className="flex flex-col gap-2.5 font-sans">
              <span className="text-[11px] font-normal text-slate-700 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                <Layers className="w-3.5 h-3.5 text-amber-600" />
                <span>Data SPPT Lama ({prevList.length})</span>
              </span>
              {prevList.map((item: any, pIdx: number) => {
                const nopVal = item.nop || item.nopAsal || item.nop_asal || '';
                const ownerVal = item.ownerName || item.namaPemilikLama || item.namaPemilik || item.nama_wp || item.nama || '-';
                const waVal = item.whatsappNumber || item.noWhatsapp || '';

                const ownerAddrVal = item.ownerAddress || item.alamatPemilikLama;
                const ownerKecVal = item.ownerKecamatan || item.kecamatanPemilikLama;
                const ownerDesaVal = item.ownerDesa || item.desaPemilikLama;
                const ownerAddrStr = [ownerAddrVal, ownerDesaVal, ownerKecVal].filter(Boolean).join(', ');

                const objAddrVal = item.objectAddress || item.alamatObjekLama;
                const objKecVal = item.objectKecamatan || item.kecamatanObjekLama;
                const objDesaVal = item.objectDesa || item.desaObjekLama;
                const objAddrStr = [objAddrVal, objDesaVal, objKecVal].filter(Boolean).join(', ');

                const landAreaVal = item.landArea ?? item.luasTanahLama ?? item.luasBumi;
                const buildingAreaVal = item.buildingArea ?? item.luasBangunanLama ?? item.luasBangunan;
                const certVal = item.certificate || item.sertifikatLama || item.sertifikat;
                const notesVal = item.notes || item.catatan;
                const isPrimary = Boolean(item.isPrimary);

                return (
                  <div key={pIdx} className="bg-white p-3.5 rounded-md border border-slate-200/90 flex flex-col gap-2.5 text-[12px] shadow-3xs font-sans">
                    {/* Header NOP & Copy/WA */}
                    <div className="flex items-center justify-between font-mono font-normal text-slate-800 pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-slate-800 truncate font-normal font-mono">NOP: {nopVal ? formatNop(nopVal) : '-'}</span>
                        {isPrimary && (
                          <span className="text-[10px] font-normal text-amber-700 bg-amber-50 border border-amber-200/80 px-1.5 py-0.2 rounded font-sans shrink-0">
                            Induk
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 font-sans shrink-0">
                        {nopVal && (
                          <button
                            type="button"
                            onClick={(e) => handleCopy(e, nopVal)}
                            className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100 transition-colors"
                            title="Salin NOP"
                          >
                            {copiedText === nopVal ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        )}
                        {waVal && (
                          <a
                            href={`https://wa.me/${waVal.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-0.5 text-[11px] font-normal text-emerald-700 bg-emerald-50 hover:bg-emerald-600 hover:text-white rounded border border-emerald-200/80 transition-colors"
                            title="Chat WhatsApp WP"
                          >
                            WA: {waVal}
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Grid Details (2 Balanced Columns) */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-[12px] font-sans pt-0.5">
                      {/* Row 1: Pemilik (Left) vs No/Jenis Sertifikat (Right) */}
                      <div>
                        <span className="text-slate-500 block text-[11px] font-normal">Pemilik:</span>
                        <span className="font-normal text-slate-800 capitalize">{toTitleCase(ownerVal)}</span>
                      </div>

                      <div>
                        <span className="text-slate-500 block text-[11px] font-normal">No/Jenis Sertifikat:</span>
                        <span className="font-normal text-slate-800 capitalize">{certVal ? toTitleCase(certVal) : '-'}</span>
                      </div>

                      {/* Row 2: Alamat Pemilik (Left) vs Alamat Objek Pajak (Right) */}
                      <div>
                        <span className="text-slate-500 block text-[11px] font-normal">Alamat Pemilik:</span>
                        <span className="font-normal text-slate-800 capitalize">{ownerAddrStr ? toTitleCase(ownerAddrStr) : '-'}</span>
                      </div>

                      <div>
                        <span className="text-slate-500 block text-[11px] font-normal">Alamat Objek Pajak:</span>
                        <span className="font-normal text-slate-800 capitalize">{objAddrStr ? toTitleCase(objAddrStr) : '-'}</span>
                      </div>

                      {/* Row 3: Luas Tanah (Left) vs Luas Bangunan (Right) */}
                      <div>
                        <span className="text-slate-500 block text-[11px] font-normal">Luas Tanah:</span>
                        <span className="font-normal text-slate-800">{landAreaVal != null ? `${landAreaVal} m²` : '-'}</span>
                      </div>

                      <div>
                        <span className="text-slate-500 block text-[11px] font-normal">Luas Bangunan:</span>
                        <span className="font-normal text-slate-800">{buildingAreaVal != null ? `${buildingAreaVal} m²` : '-'}</span>
                      </div>

                      {/* Row 4: Catatan SPPT (Full Width if exists) */}
                      {notesVal && (
                        <div className="col-span-2 bg-slate-50 p-2.5 rounded-md border border-slate-200/80 text-[11px] font-normal text-slate-600 italic mt-0.5">
                          <span className="font-normal not-italic text-slate-700">Catatan SPPT: </span>
                          "{notesVal}"
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Data SPPT Baru */}
          {targetList.length > 0 && (
            <div className="flex flex-col gap-2.5 font-sans">
              <span className="text-[11px] font-normal text-slate-700 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                <span>Data SPPT Baru ({targetList.length})</span>
              </span>
              {targetList.map((item: any, tIdx: number) => {
                const nopVal = item.nopTemporary || item.nop || item.nopBaru || item.nop_baru || '';
                const ownerVal = item.ownerName || item.namaPemilikBaru || item.namaPemilik || item.nama_wp || item.nama || '-';
                const waVal = item.whatsappNumber || item.noWhatsapp || '';

                const ownerAddrVal = item.ownerAddress || item.alamatPemilikBaru;
                const ownerKecVal = item.ownerKecamatan || item.kecamatanPemilikBaru;
                const ownerDesaVal = item.ownerDesa || item.desaPemilikBaru;
                const ownerAddrStr = [ownerAddrVal, ownerDesaVal, ownerKecVal].filter(Boolean).join(', ');

                const objAddrVal = item.objectAddress || item.alamatObjekBaru;
                const objKecVal = item.objectKecamatan || item.kecamatanObjekBaru;
                const objDesaVal = item.objectDesa || item.desaObjekBaru;
                const objAddrStr = [objAddrVal, objDesaVal, objKecVal].filter(Boolean).join(', ');

                const landAreaVal = item.landArea ?? item.luasTanahBaru ?? item.luasBumi;
                const buildingAreaVal = item.buildingArea ?? item.luasBangunanBaru ?? item.luasBangunan;
                const certVal = item.certificate || item.sertifikatBaru || item.sertifikat;
                const notesVal = item.notes || item.catatan;

                return (
                  <div key={tIdx} className="bg-white p-3.5 rounded-md border border-slate-200/90 flex flex-col gap-2.5 text-[12px] shadow-3xs font-sans">
                    {/* Header NOP Temp & Copy/WA */}
                    <div className="flex items-center justify-between font-mono font-normal text-slate-800 pb-2 border-b border-slate-100">
                      <span className="text-slate-800 truncate font-normal font-mono">NOP Temp: {nopVal ? formatNop(nopVal) : '-'}</span>
                      <div className="flex items-center gap-1.5 font-sans shrink-0">
                        {nopVal && (
                          <button
                            type="button"
                            onClick={(e) => handleCopy(e, nopVal)}
                            className="text-slate-400 hover:text-slate-600 p-0.5 rounded hover:bg-slate-100 transition-colors"
                            title="Salin NOP Temporary"
                          >
                            {copiedText === nopVal ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        )}
                        {waVal && (
                          <a
                            href={`https://wa.me/${waVal.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-0.5 text-[11px] font-normal text-emerald-700 bg-emerald-50 hover:bg-emerald-600 hover:text-white rounded border border-emerald-200/80 transition-colors"
                            title="Chat WhatsApp WP"
                          >
                            WA: {waVal}
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Grid Details (2 Balanced Columns) */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-[12px] font-sans pt-0.5">
                      {/* Row 1: Pemilik Baru (Left) vs No/Jenis Sertifikat (Right) */}
                      <div>
                        <span className="text-slate-500 block text-[11px] font-normal">Pemilik Baru:</span>
                        <span className="font-normal text-slate-800 capitalize">{toTitleCase(ownerVal)}</span>
                      </div>

                      <div>
                        <span className="text-slate-500 block text-[11px] font-normal">No/Jenis Sertifikat:</span>
                        <span className="font-normal text-slate-800 capitalize">{certVal ? toTitleCase(certVal) : '-'}</span>
                      </div>

                      {/* Row 2: Alamat Pemilik Baru (Left) vs Alamat Objek Pajak Baru (Right) */}
                      <div>
                        <span className="text-slate-500 block text-[11px] font-normal">Alamat Pemilik Baru:</span>
                        <span className="font-normal text-slate-800 capitalize">{ownerAddrStr ? toTitleCase(ownerAddrStr) : '-'}</span>
                      </div>

                      <div>
                        <span className="text-slate-500 block text-[11px] font-normal">Alamat Objek Pajak Baru:</span>
                        <span className="font-normal text-slate-800 capitalize">{objAddrStr ? toTitleCase(objAddrStr) : '-'}</span>
                      </div>

                      {/* Row 3: Luas Tanah (Left) vs Luas Bangunan (Right) */}
                      <div>
                        <span className="text-slate-500 block text-[11px] font-normal">Luas Tanah:</span>
                        <span className="font-normal text-slate-800">{landAreaVal != null ? `${landAreaVal} m²` : '-'}</span>
                      </div>

                      <div>
                        <span className="text-slate-500 block text-[11px] font-normal">Luas Bangunan:</span>
                        <span className="font-normal text-slate-800">{buildingAreaVal != null ? `${buildingAreaVal} m²` : '-'}</span>
                      </div>

                      {/* Row 4: Catatan SPPT (Full Width if exists) */}
                      {notesVal && (
                        <div className="col-span-2 bg-slate-50 p-2.5 rounded-md border border-slate-200/80 text-[11px] font-normal text-slate-600 italic mt-0.5">
                          <span className="font-normal not-italic text-slate-700">Catatan SPPT: </span>
                          "{notesVal}"
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Fallback if both lists are empty */}
          {prevList.length === 0 && targetList.length === 0 && (
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-md text-center text-slate-500 text-[12px] font-normal font-sans">
              Tidak ada rincian data SPPT pada versi ini.
            </div>
          )}
        </div>
      </div>
    </>,
    document.body
  );
};
