"use client";

import React, { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  FileEdit,
  FolderLock,
  Check,
  ChevronRight,
  Copy,
  Layers,
  FileText,
  Lock,
  Unlock,
  ShieldCheck,
  Users
} from 'lucide-react';
import { getBundleVersions } from '@/app/actions/researcher';
import { formatBundleNumber, getAbbreviatedJenis, formatNop } from './constants';

interface BundleVersionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bundle: any;
}

const typeLabelMap: Record<string, string> = {
  MUTASI_SEBAGIAN: 'Mutasi Sebagian',
  MUTASI_PENGGABUNGAN: 'Mutasi Penggabungan',
  MERGER_MUTATION: 'Mutasi Penggabungan',
  PARTIAL_MUTATION: 'Mutasi Sebagian',
  MUTASI_HABIS_UPDATE: 'Mutasi Habis Update',
  MUTASI_HABIS_REGULER: 'Mutasi Habis Reguler',
  OBJEK_PAJAK_BARU: 'Objek Pajak Baru',
  PEMBETULAN: 'Pembetulan',
  PENGAKTIFAN: 'Pengaktifan',
  UNASSIGNED: 'Belum Ditentukan',
};

const snapshotTypeLabelMap: Record<string, string> = {
  BUNDLE_LOCKED: 'Penguncian Resmi (Locked)',
  BUNDLE_DRAFT: 'Draf Aktif',
  INITIAL_CREATE: 'Pembuatan Wadah Bundle',
  UPDATE_BUNDLE: 'Pembaruan Isi Bundle',
  RETURN_REVISION: 'Revisi Pengembalian',
};

export const BundleVersionDrawer: React.FC<BundleVersionDrawerProps> = React.memo(({
  isOpen,
  onClose,
  bundle
}) => {
  const [mounted, setMounted] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
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

  const fetchVersions = useCallback(async (bId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getBundleVersions(bId);
      if (res.success) {
        setVersions(res.list || []);
      } else {
        setError(res.error || 'Gagal memuat riwayat versi bundle.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem saat memuat versi bundle.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen && bundle?.id) {
      fetchVersions(bundle.id);
    } else {
      setVersions([]);
      setExpandedId(null);
      setPopoverPos(null);
      setShowMore(false);
    }
  }, [isOpen, bundle, fetchVersions]);

  const handleItemClick = (e: React.MouseEvent, verId: string) => {
    if (expandedId === verId) {
      setExpandedId(null);
      setPopoverPos(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      const targetY = rect.top + rect.height / 2;

      let leftPos = rect.right + 12;
      if (drawerRef.current) {
        const drawerRect = drawerRef.current.getBoundingClientRect();
        leftPos = drawerRect.right + 12;
      }

      setExpandedId(verId);
      setPopoverPos({ top: rect.top, left: leftPos, targetY });
    }
  };

  if (!isOpen || !bundle) return null;
  if (!mounted) return null;

  const rawBundleNumber = bundle.bundleNumber || bundle.nomorBundle || '';
  const bundleNum = rawBundleNumber ? formatBundleNumber(rawBundleNumber, bundle.createdAt) : '—';
  const rawType = bundle.applicationType || bundle.jenisPermohonan || '';
  const displayType = typeLabelMap[rawType] || getAbbreviatedJenis(rawType) || 'Bundle';

  const latestVersion = versions[0];
  const historicalVersions = versions.slice(1);
  const displayedHistorical = showMore ? historicalVersions : historicalVersions.slice(0, 4);

  const activeVersion = versions.find(v => v.id === expandedId);
  const activeIsLatest = activeVersion ? activeVersion.id === latestVersion?.id : false;
  const activeIndex = activeVersion ? versions.findIndex(v => v.id === expandedId) : -1;
  const activeVersionLabel = activeVersion
    ? (activeIsLatest ? 'Versi Terbaru' : `Versi ${(versions.length - activeIndex).toFixed(1)}`)
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
              <h3 className="text-base font-semibold text-slate-900 font-sans tracking-tight flex items-center gap-2">
                <FolderLock className="w-4 h-4 text-[#00a389]" />
                <span>Riwayat Versi Bundle</span>
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <div className="h-8 px-2.5 rounded-md border border-slate-200 bg-slate-50/50 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <span>{versions.length} Versi</span>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-md border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                title="Tutup Modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Drawer Body */}
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
              <div className="m-6 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-medium p-4 rounded-md">
                {error}
              </div>
            )}

            {/* Empty State for DRAFT / Unlocked Bundle */}
            {!loading && !error && versions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 px-6 text-center select-none font-sans">
                <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200/80 flex items-center justify-center mb-3.5 text-slate-400">
                  <Lock className="w-5 h-5 stroke-[1.75]" />
                </div>

                <h4 className="text-sm font-semibold text-slate-800 font-sans tracking-tight mb-1">
                  Bundle Masih Berstatus Draf
                </h4>

                <p className="text-xs text-slate-500 max-w-[260px] leading-relaxed font-sans">
                  Riwayat versi resmi (<span className="font-semibold text-slate-700">Versi 1.0</span>) akan terbentuk secara otomatis setelah Bundle ini dikunci (<span className="font-semibold text-emerald-700">LOCKED</span>).
                </p>
              </div>
            )}

            {!loading && !error && versions.length > 0 && (
              <div className="flex flex-col w-full relative">

                {/* 1. TOP SECTION: LATEST VERSION CARD */}
                {latestVersion && (
                  <div className="p-5 border-b border-slate-100 bg-white flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-2 select-none font-sans">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-xs font-bold text-slate-900 font-mono tracking-tight truncate">{bundleNum}</span>
                      </div>

                      <div className="shrink-0">
                        <span className="text-[11px] font-semibold text-[#008f78] bg-[#00a389]/12 border border-[#00a389]/20 px-2 py-0.5 rounded-md font-sans">
                          {displayType}
                        </span>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-5 top-2 bottom-2 w-[4px] bg-[#00a389] rounded-r-full z-10" />

                      <div
                        onClick={(e) => handleItemClick(e, latestVersion.id)}
                        className={`group relative bg-[#00a389]/8 border transition-all rounded-md p-3.5 flex flex-col gap-2 cursor-pointer ${
                          expandedId === latestVersion.id ? 'border-[#00a389] ring-2 ring-[#00a389]/15' : 'border-[#00a389]/20 hover:border-[#00a389]/40'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-md bg-white border border-[#00a389]/20 text-[#00a389] flex items-center justify-center shrink-0 shadow-3xs">
                              {bundle.status === 'LOCKED' ? <Lock className="w-4.5 h-4.5 text-[#00a389]" /> : <FileEdit className="w-4.5 h-4.5 text-[#00a389]" />}
                            </div>

                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-bold text-slate-900 tracking-tight font-sans">
                                {latestVersion.versionLabel || 'Versi Terbaru'}
                              </span>

                              <span className="text-[11px] font-semibold text-[#008f78] font-sans truncate mt-0.5">
                                {snapshotTypeLabelMap[latestVersion.snapshotType] || 'Versi Aktif'}
                              </span>

                              <span className="text-[11px] text-slate-400 font-sans truncate mt-0.5">
                                {new Date(latestVersion.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })} • Oleh {latestVersion.actor?.name || 'Peneliti'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <div className="w-5 h-5 rounded-full bg-[#00a389] text-white flex items-center justify-center shadow-3xs">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                            <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${expandedId === latestVersion.id ? 'translate-x-1 text-[#00a389]' : ''}`} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. BOTTOM SECTION: HISTORICAL VERSIONS LIST */}
                {historicalVersions.length > 0 && (
                  <div className="divide-y divide-slate-100 flex flex-col font-sans relative">
                    {displayedHistorical.map((ver: any, hIdx: number) => {
                      const versionIndex = versions.length - 1 - hIdx;
                      const versionNum = versionIndex.toFixed(1);
                      const isExpanded = expandedId === ver.id;
                      const dateStr = new Date(ver.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
                      const actorName = ver.actor?.name || 'Peneliti';

                      return (
                        <div key={ver.id} className="relative flex flex-col">
                          <div
                            onClick={(e) => handleItemClick(e, ver.id)}
                            className={`px-6 py-4 transition-colors flex flex-col gap-1.5 cursor-pointer group relative ${
                              isExpanded ? 'bg-emerald-50/50' : 'hover:bg-slate-50/70'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3.5 min-w-0">
                                <div className="w-9 h-9 rounded-md bg-emerald-50/70 border border-emerald-100/80 text-[#00a389] flex items-center justify-center shrink-0 group-hover:bg-emerald-100/70 transition-colors">
                                  <Layers className="w-4 h-4 text-[#00a389]" />
                                </div>

                                <div className="flex flex-col min-w-0">
                                  <span className="text-xs font-semibold text-slate-900 font-sans tracking-tight">
                                    Versi {versionNum}
                                  </span>

                                  <span className="text-[11px] font-semibold text-slate-700 font-sans truncate mt-0.5">
                                    {snapshotTypeLabelMap[ver.snapshotType] || 'Log Versi Bundle'}
                                  </span>

                                  <span className="text-[11px] text-slate-400 font-sans truncate mt-0.5">
                                    {dateStr} • Oleh {actorName}
                                  </span>
                                </div>
                              </div>

                              <ChevronRight className={`w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-transform ${isExpanded ? 'translate-x-1 text-[#00a389]' : ''}`} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Show More Button */}
                {historicalVersions.length > 4 && !showMore && (
                  <div className="p-5 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setShowMore(true)}
                      className="w-full py-2.5 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-md text-xs font-medium text-slate-600 transition-colors cursor-pointer shadow-3xs font-sans"
                    >
                      Tampilkan Lebih Banyak ({historicalVersions.length - 4} Versi Lagi)
                    </button>
                  </div>
                )}

              </div>
            )}

          </div>

          {/* Footer Minimalist */}
          <div className="px-6 py-3.5 border-t border-slate-100 flex items-center justify-between select-none shrink-0 bg-white font-sans">
            <span className="text-xs text-slate-400 font-normal">
              {versions.length} versi tercatat
            </span>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold transition-colors cursor-pointer font-sans"
            >
              Tutup
            </button>
          </div>

        </div>
      </div>

      {/* FLOATING DETAIL POPOVER CARD RENDERED AT TOP Z-INDEX PORTAL */}
      {activeVersion && popoverPos && (
        <PortalBundlePopover
          versionItem={activeVersion}
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
          bundle={bundle}
        />
      )}
    </div>,
    document.body
  );
});

// FLOATING POPOVER DETAIL COMPONENT
const PortalBundlePopover: React.FC<{
  versionItem: any;
  isLatest: boolean;
  versionLabel: string;
  top: number;
  left: number;
  targetY: number;
  onClose: () => void;
  copiedText: string | null;
  handleCopy: (e: React.MouseEvent, text: string) => void;
  bundle?: any;
}> = ({ versionItem, isLatest, versionLabel, top, left, targetY, onClose, copiedText, handleCopy, bundle }) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [adjustedTop, setAdjustedTop] = useState<number>(top);

  useLayoutEffect(() => {
    if (popoverRef.current) {
      const cardHeight = popoverRef.current.getBoundingClientRect().height;
      const windowHeight = window.innerHeight;
      const maxAllowedTop = Math.max(16, windowHeight - cardHeight - 16);
      const idealTop = Math.max(16, top - 12);
      setAdjustedTop(Math.min(idealTop, maxAllowedTop));
    }
  }, [top, versionItem]);

  const snapData = versionItem.snapshotData || {};
  const rawBundleNumber = snapData.bundleNumber || bundle?.bundleNumber || bundle?.nomorBundle || '';
  const bundleNum = rawBundleNumber ? formatBundleNumber(rawBundleNumber, bundle?.createdAt) : '—';
  const appsList: any[] = snapData.applications || bundle?.applications || bundle?.permohonan || [];

  const cardH = popoverRef.current ? popoverRef.current.getBoundingClientRect().height : 300;
  const minCaretY = adjustedTop + 20;
  const maxCaretY = adjustedTop + cardH - 24;
  const caretY = Math.max(minCaretY, Math.min(targetY - 7, maxCaretY));

  return createPortal(
    <>
      <div
        style={{ top: `${caretY}px`, left: `${left - 7}px` }}
        className="fixed z-[10001] w-3.5 h-3.5 bg-white border-b border-l border-slate-200/90 rotate-45 pointer-events-none transition-all duration-150"
      />

      <div
        ref={popoverRef}
        style={{ top: `${adjustedTop}px`, left: `${left}px` }}
        className="fixed z-[10000] w-[440px] max-w-[calc(100vw-480px)] max-h-[calc(100vh-32px)] overflow-y-auto scrollbar-thin bg-white border border-slate-200/90 rounded-md shadow-2xl p-5 flex flex-col gap-4 font-sans animate-scaleUp text-xs select-text cursor-default transition-[top] duration-150"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Floating Card Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 font-sans z-20">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900 font-sans tracking-tight">
              Detail {versionLabel}
            </span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md font-sans ${isLatest ? 'text-[#008f78] bg-[#00a389]/15' : 'text-slate-600 bg-slate-100'}`}>
              {snapshotTypeLabelMap[versionItem.snapshotType] || 'Snapshot Bundle'}
            </span>
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

        {/* Note Block */}
        {versionItem.note && (
          <div className="bg-slate-50 p-3.5 rounded-md border border-slate-200/90 text-xs text-slate-700 leading-relaxed font-sans flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Catatan Versi:</span>
            <p className="italic text-slate-600 font-sans">"{versionItem.note}"</p>
          </div>
        )}

        {/* Summary Header Rows */}
        <div className="bg-slate-50/80 p-3.5 rounded-md border border-slate-150 grid grid-cols-2 gap-2.5 text-[11px] font-sans">
          <div>
            <span className="text-slate-400 block text-[10px] font-sans">Nomor Bundle</span>
            <span className="font-mono font-semibold text-slate-800">{bundleNum}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] font-sans">Status Bundle</span>
            <span className="font-semibold text-[#008f78] capitalize">{snapData.status || bundle?.status || 'DRAFT'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] font-sans">Total Permohonan</span>
            <span className="font-semibold text-slate-800">{appsList.length} Permohonan</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] font-sans">Peneliti / Pembuat</span>
            <span className="font-medium text-slate-700 font-sans">{versionItem.actor?.name || bundle?.createdBy?.name || 'Peneliti'}</span>
          </div>
        </div>

        {/* List Applications in Bundle Version */}
        {appsList.length > 0 ? (
          <div className="flex flex-col gap-2.5 font-sans">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 font-sans">
              <Users className="w-3.5 h-3.5 text-[#00a389]" />
              <span>Daftar Permohonan Terbundel ({appsList.length})</span>
            </span>

            {appsList.map((item: any, idx: number) => {
              const previousData = Array.isArray(item.previousData) ? item.previousData : (Array.isArray(item.dataLama) ? item.dataLama : []);
              const targetData = Array.isArray(item.targetData) ? item.targetData : (Array.isArray(item.dataBaru) ? item.dataBaru : []);
              const firstPrev = previousData[0] || {};
              const firstTarget = targetData[0] || {};
              const appType = item.applicationType || item.jenisPermohonan || '';

              const isPartialMutation = appType === 'PARTIAL_MUTATION' || appType === 'MUTASI_SEBAGIAN';
              const isReactivation = appType === 'REACTIVATION' || appType === 'PENGAKTIFAN';

              const appNo = item.applicationNumber || item.nomorPelayanan || `NOPEL-#${idx+1}`;

              let appNop = item.nop || item.taxObjectNop || item.nopAsal || item.nop_asal || '';
              if (!appNop || appNop === '-') {
                if (appType === 'NEW_TAX_OBJECT' || appType === 'OBJEK_PAJAK_BARU') {
                  appNop = firstTarget.nopTemporary || firstTarget.nop || '-';
                } else {
                  appNop = firstPrev.nop || firstPrev.nopAsal || firstPrev.nop_asal || '-';
                }
              }

              let appName = item.ownerName || item.applicantName || item.displayOwnerName || item.namaPemohon || item.nama_wp || '';
              if (!appName || appName === '-') {
                if (isReactivation) {
                  appName = firstPrev.ownerName || firstPrev.namaPemilikLama || '-';
                } else if (isPartialMutation) {
                  appName = firstTarget.ownerName || firstTarget.namaPemilikBaru || '-';
                } else {
                  if (targetData.length > 0) {
                    appName = targetData
                      .map((t: any) => t.ownerName || t.namaPemilikBaru || t.namaPemilik)
                      .filter(Boolean)
                      .join(', ');
                  }
                  if (!appName) {
                    appName = firstPrev.ownerName || firstPrev.namaPemilikLama || firstPrev.namaPemilik || '-';
                  }
                }
              }

              return (
                <div key={idx} className="bg-white p-3 rounded-md border border-slate-200/90 flex flex-col gap-1 text-[11px] font-sans shadow-3xs">
                  <div className="flex items-center justify-between font-mono font-semibold text-slate-900 pb-1 border-b border-slate-100">
                    <span>No. Permohonan: {appNo}</span>
                    {appNop !== '-' && (
                      <button
                        type="button"
                        onClick={(e) => handleCopy(e, appNop)}
                        className="text-slate-400 hover:text-slate-600 p-0.5 rounded hover:bg-slate-100 transition-colors"
                        title="Salin NOP"
                      >
                        {copiedText === appNop ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 font-sans">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Pemohon:</span>
                      <span className="font-medium text-slate-800 truncate block capitalize">{appName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">NOP Objek Pajak:</span>
                      <span className="font-mono text-slate-700">{appNop !== '-' ? formatNop(appNop) : '-'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 bg-slate-50 rounded-md border border-slate-200 text-center text-slate-400 text-xs font-sans">
            Wadah bundle ini belum memiliki permohonan.
          </div>
        )}

      </div>
    </>,
    document.body
  );
};
