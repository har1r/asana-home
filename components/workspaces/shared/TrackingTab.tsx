"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Search,
  X,
  ChevronDown,
  ChevronUp,
  FileText,
  Boxes,
  FileSpreadsheet,
  Calendar,
  CheckCircle,
  Clock,
  Printer,
  Star,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  GitCommit,
  User,
  ArrowRight,
  Send,
  AlertTriangle,
  FolderOpen
} from "lucide-react";
import { getTrackingData } from "@/app/actions/tracking";
import { useDashboard } from "@/context/DashboardContext";
import { useDebounce } from "@/lib/useDebounce";

// -------------------- HELPER FUNCTIONS --------------------
const formatNop = (nop: string) => {
  if (!nop) return '';
  const cleanNop = nop.replace(/[^0-9]/g, '');
  if (cleanNop.length === 17) {
    const padded = cleanNop + '0';
    return `${padded.slice(0, 2)}.${padded.slice(2, 4)}.${padded.slice(4, 7)}.${padded.slice(7, 10)}.${padded.slice(10, 13)}-${padded.slice(13, 17)}.${padded.slice(17)}`;
  }
  if (cleanNop.length === 18) {
    return `${cleanNop.slice(0, 2)}.${cleanNop.slice(2, 4)}.${cleanNop.slice(4, 7)}.${cleanNop.slice(7, 10)}.${cleanNop.slice(10, 13)}-${cleanNop.slice(13, 17)}.${cleanNop.slice(17)}`;
  }
  return nop;
};

const getAbbreviatedJenis = (jenis: string) => {
  switch (jenis) {
    case 'OBJEK_PAJAK_BARU': return 'OPB';
    case 'MUTASI_SEBAGIAN': return 'MS';
    case 'MUTASI_HABIS_REGULER': return 'MHR';
    case 'MUTASI_HABIS_UPDATE': return 'MHU';
    case 'PEMBETULAN': return 'PBT';
    case 'PENGAKTIFAN': return 'AKT';
    default: return jenis;
  }
};

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'SUBMITTED': return 'bg-emerald-50 text-emerald-700 border-emerald-250/30';
    case 'REVISION': return 'bg-amber-50 text-amber-700 border-amber-200/50 animate-pulse';
    case 'BUNDLED': return 'bg-blue-50 text-blue-700 border-blue-200/50';
    case 'ARCHIVED': return 'bg-indigo-50 text-indigo-700 border-indigo-200/50';
    case 'COMPLETED': return 'bg-cyan-50 text-cyan-700 border-cyan-200/50';
    case 'REJECTED': return 'bg-rose-50 text-rose-700 border-rose-200/50';
    default: return 'bg-gray-50 text-gray-700 border-gray-200/50';
  }
};

// -------------------- INTERACTIVE FISHING ANIMATION --------------------
interface FishingAnimationProps {
  isSearch?: boolean;
}

const FishingAnimation: React.FC<FishingAnimationProps> = React.memo(({ isSearch }) => {
  return (
    <div className="relative w-56 h-36 flex items-center justify-center overflow-hidden select-none mb-1">
      <svg viewBox="0 0 200 120" className="w-full h-full">
        <defs>
          <style>{`
            @keyframes rodBob {
              0%, 100% { transform: rotate(0deg); }
              50% { transform: rotate(-2.5deg); }
            }
            @keyframes lineDangle {
              0%, 100% { transform: skewX(0deg); }
              50% { transform: skewX(-2deg); }
            }
            @keyframes rippleEffect {
              0% { r: 1px; opacity: 0.8; stroke-width: 0.75px; }
              100% { r: 18px; opacity: 0; stroke-width: 0.25px; }
            }
            @keyframes fishJump {
              0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
              5% { opacity: 1; }
              25% { transform: translate(15px, -20px) rotate(30deg); }
              35% { transform: translate(22px, -20px) rotate(70deg); }
              55% { transform: translate(40px, 0px) rotate(130deg); opacity: 1; }
              65%, 100% { transform: translate(40px, 8px) rotate(160deg); opacity: 0; }
            }
            @keyframes cloudMove {
              0% { transform: translateX(-8px); }
              100% { transform: translateX(8px); }
            }
            .rod-rod {
              transform-origin: 45px 75px;
              animation: rodBob 4.5s ease-in-out infinite;
            }
            .line-string {
              transform-origin: 125px 35px;
              animation: lineDangle 4.5s ease-in-out infinite;
            }
            .ripple-circle-1 {
              animation: rippleEffect 3.2s linear infinite;
            }
            .ripple-circle-2 {
              animation: rippleEffect 3.2s linear infinite;
              animation-delay: 1.6s;
            }
            .fish-jumping {
              transform-origin: 125px 95px;
              animation: fishJump 6.5s ease-in-out infinite;
            }
            .cloud-bg-1 {
              animation: cloudMove 15s ease-in-out infinite alternate;
            }
            .cloud-bg-2 {
              animation: cloudMove 20s ease-in-out infinite alternate;
            }
          `}</style>
        </defs>
        <g className="cloud-bg-1" opacity="0.3">
          <path d="M25 20c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5c.8-.2 1.6.3 1.8 1.1.2.8-.3 1.6-1.1 1.8H20c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5" fill="#94a3b8" />
        </g>
        <g className="cloud-bg-2" opacity="0.25">
          <path d="M145 15c0-1.8 1.5-3.3 3.3-3.3s3.3 1.5 3.3 3.3c.6-.2 1.2.2 1.4.8.2.6-.2 1.2-.8 1.4H140c-.6 0-1.1-.5-1.1-1.1s.5-1.1 1.1-1.1" fill="#94a3b8" />
        </g>
        <path d="M0 95h200v25H0z" fill="#f1f5f9" />
        <path d="M0 95c30-1.5 60 1.5 90 0s60-1.5 90 0 20 1.5 20 1.5v4H0z" fill="#cbd5e1" opacity="0.4" />
        <rect x="0" y="80" width="55" height="5" rx="1" fill="#854d0e" />
        <rect x="8" y="85" width="7" height="35" fill="#713f12" />
        <rect x="40" y="85" width="7" height="35" fill="#713f12" />
        <circle cx="35" cy="55" r="4.5" fill="#475569" />
        <path d="M26 53c3-3 15-3 18 0z" fill="#7c2d12" />
        <path d="M21 53h28v1.5H21z" fill="#a16207" />
        <path d="M30 59.5h10l2 18.5H28z" fill="#64748b" />
        <path d="M28 78h12l-1 7H29z" fill="#334155" />
        <rect x="31" y="85" width="2.5" height="11" rx="0.5" fill="#475569" />
        <rect x="36" y="85" width="2.5" height="9" rx="0.5" fill="#475569" />
        <g className="rod-rod">
          <line x1="38" y1="64" x2="125" y2="35" stroke="#a16207" strokeWidth="1.5" strokeLinecap="round" />
          <line className="line-string" x1="125" y1="35" x2="125" y2="95" stroke="#cbd5e1" strokeWidth="0.75" />
        </g>
        <ellipse className="ripple-circle-1" cx="125" cy="95" rx="12" ry="2.5" fill="none" stroke="#6366f1" />
        <ellipse className="ripple-circle-2" cx="125" cy="95" rx="12" ry="2.5" fill="none" stroke="#6366f1" />
        {!isSearch && (
          <g className="fish-jumping">
            <path d="M125 95c2.5-0.8 5-2.5 5-4.2s-2.5-3.3-5-4.2c-1.7 0.8-2.5 2.5-2.5 4.2s0.8 3.3 2.5 4.2z" fill="#f59e0b" />
            <path d="M122.5 90.8l-2.5-1.7v3.3z" fill="#f59e0b" />
            <circle cx="128.5" cy="92" r="0.4" fill="#fff" />
          </g>
        )}
      </svg>
      {isSearch && (
        <div className="absolute right-6 bottom-9 bg-white border border-slate-200 p-1.5 rounded-xl shadow-md animate-bounce flex items-center justify-center">
          <Search className="w-4 h-4 text-indigo-650" />
        </div>
      )}
    </div>
  );
});
FishingAnimation.displayName = "FishingAnimation";

// -------------------- MAIN COMPONENT --------------------
export default function TrackingTab() {
  const { setGlobalSelectedRequest } = useDashboard();
  
  // Search & data states
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 400);

  const [manifests, setManifests] = useState<any[]>([]);
  const [loosePermohonans, setLoosePermohonans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Accordion open/close mapping
  const [expandedManifests, setExpandedManifests] = useState<Record<string, boolean>>({});
  const [expandedBundles, setExpandedBundles] = useState<Record<string, boolean>>({});
  
  // Document Selected for Visual Stepper Timeline
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);

  // Fetch data function
  const loadData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await getTrackingData(debouncedSearch);
      if (res.success) {
        setManifests(res.manifests || []);
        setLoosePermohonans(res.loosePermohonans || []);
        
        // Auto-expand first manifest if matches found in search
        if (debouncedSearch && res.manifests && res.manifests.length > 0) {
          const firstId = res.manifests[0].id;
          setExpandedManifests(prev => ({ ...prev, [firstId]: true }));
          if (res.manifests[0].bundle && res.manifests[0].bundle.length > 0) {
            const firstBundleId = res.manifests[0].bundle[0].id;
            setExpandedBundles(prev => ({ ...prev, [firstBundleId]: true }));
          }
        }
      } else {
        setError(res.error || "Gagal memuat data pelacakan.");
      }
    } catch (err: any) {
      console.error(err);
      setError("Terjadi kesalahan koneksi database.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      const isTyping = tag === "input" || tag === "textarea" || tag === "select" || (e.target as HTMLElement).isContentEditable;
      if ((e.ctrlKey && e.key === "k") || (e.key === "/" && !isTyping)) {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleManifest = (id: string) => {
    setExpandedManifests(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleBundle = (id: string) => {
    setExpandedBundles(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Determine stage steps for the selected document's stepper timeline
  const timelineSteps = useMemo(() => {
    if (!selectedDoc) return [];

    const steps = [
      {
        title: "Diajukan (Penginput)",
        desc: `Berkas diajukan ke sistem dengan status awal SUBMITTED.`,
        date: selectedDoc.createdAt,
        done: true,
      },
      {
        title: "Dibundling (Peneliti)",
        desc: selectedDoc.bundleId 
          ? `Berkas dikelompokkan ke dalam Bundle draf: ${selectedDoc.bundle?.nomorBundle || "—"}.` 
          : "Berkas sedang menunggu giliran untuk dimasukkan ke dalam bundle operasional.",
        date: selectedDoc.bundle?.createdAt || null,
        done: !!selectedDoc.bundleId,
      },
      {
        title: "Digitalisasi (Pengarsip)",
        desc: selectedDoc.arsipDigital && selectedDoc.arsipDigital.length > 0
          ? `File fisik berhasil di-scan & di-upload (versi ${selectedDoc.arsipDigital[0].versi}).`
          : "Menunggu pengunggahan scan PDF arsip digital oleh unit kearsipan.",
        date: selectedDoc.arsipDigital?.[0]?.createdAt || null,
        done: selectedDoc.arsipDigital && selectedDoc.arsipDigital.length > 0,
      },
      {
        title: "Manifestasi (Pengirim)",
        desc: selectedDoc.bundle?.manifestId
          ? `Telah dimasukkan ke Manifest pengiriman: ${selectedDoc.bundle?.manifest?.nomorManifest || "—"} dan didistribusikan.`
          : "Menunggu dimasukkan ke dalam manifest pengiriman logistik berkas.",
        date: selectedDoc.bundle?.manifest?.createdAt || null,
        done: !!selectedDoc.bundle?.manifestId,
      },
      {
        title: "Selesai (Pemantau)",
        desc: selectedDoc.status === "COMPLETED"
          ? "Layanan selesai diproses secara keseluruhan, produk diterbitkan ke WP."
          : selectedDoc.status === "REJECTED"
          ? "Berkas ditolak pada proses peninjauan akhir."
          : "Sedang dalam tahap verifikasi akhir sebelum penutupan berkas.",
        date: selectedDoc.status === "COMPLETED" || selectedDoc.status === "REJECTED" ? selectedDoc.updatedAt : null,
        done: selectedDoc.status === "COMPLETED" || selectedDoc.status === "REJECTED",
      }
    ];

    return steps;
  }, [selectedDoc]);

  return (
    <div className="w-full flex flex-col gap-6 font-sans">
      
      {/* 1. Header & Search Action */}
      <div className="bg-[#dde3ea] border border-slate-200/60 p-5 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
        <div>
          <h2 className="font-extrabold text-[13px] capitalize tracking-wider text-slate-700 font-display flex items-center gap-1.5">
            <Boxes className="w-4 h-4 text-indigo-500" /> Pusat Riwayat Pelacakan Berkas
          </h2>
          <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
            Lacak status dokumen PBB, bundle operasional, dan log pengiriman manifest secara transparan lintas seluruh unit role.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto self-end md:self-auto">
          {/* Search bar with glow and badge shortcut */}
          <div className={`relative flex-1 md:flex-none md:w-80 p-[1.5px] rounded-lg transition-all duration-300 ${
            isSearchFocused
              ? "bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] shadow-xs"
              : "bg-slate-200/90"
          }`}>
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 z-10" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="w-full pl-7.5 pr-12 py-1 bg-white border-transparent rounded-[7px] text-[11px] font-semibold text-gray-755 placeholder-gray-400 focus:outline-none transition-all"
              placeholder="Cari No. Pelayanan, NOP, Nama."
            />
            {!isSearchFocused && !searchQuery && (
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/80 select-none pointer-events-none">
                Ctrl+K
              </span>
            )}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-655 z-10 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <button
            onClick={() => loadData(true)}
            disabled={loading || refreshing}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 transition-all cursor-pointer border border-slate-200/80 bg-white"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-indigo-500" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Side: Manifests & Loose Documents Lists (65% space) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-20 text-center flex flex-col items-center justify-center gap-3 shadow-xs">
              <div className="w-7 h-7 rounded-full border-2 border-indigo-600/30 border-t-indigo-600 animate-spin" />
              <span className="text-[10px] text-gray-400 font-extrabold capitalize tracking-wider animate-pulse">Menghubungkan ke database...</span>
            </div>
          ) : manifests.length === 0 && loosePermohonans.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center flex flex-col items-center justify-center gap-4 shadow-xs select-none">
              <FishingAnimation isSearch={!!debouncedSearch} />
              <div className="flex flex-col gap-1 max-w-sm">
                <h5 className="text-[11px] font-extrabold text-slate-700 capitalize tracking-wider">
                  {debouncedSearch ? "Hasil Pencarian Tidak Ditemukan" : "Pelacakan Kosong"}
                </h5>
                <p className="text-[10px] font-semibold text-slate-400 leading-relaxed px-4">
                  {debouncedSearch 
                    ? "Kami tidak menemukan manifest, bundle, NOP, atau nama pemohon yang sesuai dengan kata kunci."
                    : "Belum ada log permohonan atau pengiriman berkas di sistem saat ini."}
                </p>
              </div>
              {debouncedSearch && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="px-4 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-extrabold text-[10px] rounded-xl transition-all cursor-pointer shadow-3xs"
                >
                  Reset Pencarian
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              
              {/* Manifests List Container */}
              {manifests.length > 0 && (
                <div className="flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 select-none">Log Manifest Pengiriman ({manifests.length})</h3>
                  
                  <div className="flex flex-col gap-3">
                    {manifests.map((m) => {
                      const isExpanded = !!expandedManifests[m.id];
                      const totalBundles = m.bundle?.length || 0;
                      const hasReceipt = !!m.buktiTandaTerima;

                      return (
                        <div key={m.id} className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs hover:shadow-xs transition-all">
                          
                          {/* Manifest Header */}
                          <div 
                            onClick={() => toggleManifest(m.id)}
                            className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors select-none"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-500 shrink-0">
                                <Send className="w-4 h-4" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest leading-none mb-1">Manifest Pengiriman</span>
                                <span className="text-xs font-extrabold text-slate-800 font-mono tracking-tight">{m.nomorManifest}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <span className={`text-[8.5px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border ${
                                m.status === 'SENT' ? 'bg-emerald-50 text-emerald-700 border-emerald-150' : 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}>
                                {m.status}
                              </span>
                              
                              {m.status === 'SENT' ? (
                                hasReceipt ? (
                                  <a 
                                    href={m.buktiTandaTerima}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="px-2.5 py-1 text-[9px] font-extrabold text-emerald-750 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100/60 flex items-center gap-1 cursor-pointer shadow-3xs"
                                    title="Lihat manifest fisik bertanda tangan yang telah terupload"
                                  >
                                    <FileText className="w-3 h-3 text-emerald-600" />
                                    <span>Tanda Terima: Terunggah</span>
                                  </a>
                                ) : (
                                  <span 
                                    className="px-2.5 py-1 text-[9px] font-extrabold text-amber-750 bg-amber-50 border border-amber-200/60 rounded-lg flex items-center gap-1 shadow-3xs select-none"
                                    title="Manifest ini sudah dikirim tetapi bukti tanda terima bertanda tangan belum diunggah oleh Pengirim"
                                  >
                                    <Clock className="w-3 h-3 text-amber-500" />
                                    <span>Tanda Terima: Belum Diunggah</span>
                                  </span>
                                )
                              ) : null}

                              <div className="text-slate-400">
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </div>
                            </div>
                          </div>

                          {/* Manifest Content (Bundles List) */}
                          {isExpanded && (
                            <div className="px-4 pb-4 pt-1 border-t border-slate-100 bg-slate-50/20 flex flex-col gap-3 animate-fadeIn">
                              <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold border-b border-slate-100 pb-1.5 select-none">
                                <span>BERISI {totalBundles} BUNDLE OPERASIONAL:</span>
                                <span>PENGIRIM: {(m.pengirim?.name || "ADMIN").toUpperCase()}</span>
                              </div>

                              {totalBundles === 0 ? (
                                <div className="text-center py-6 text-xs text-slate-400 italic">Manifest ini belum memiliki bundle berkas.</div>
                              ) : (
                                <div className="flex flex-col gap-2.5">
                                  {m.bundle.map((b: any) => {
                                    const isBundleExpanded = !!expandedBundles[b.id];
                                    const permohonansCount = b.permohonan?.length || 0;

                                    return (
                                      <div key={b.id} className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-3xs">
                                        
                                        {/* Bundle Header */}
                                        <div 
                                          onClick={() => toggleBundle(b.id)}
                                          className="p-3 bg-slate-50/40 hover:bg-slate-50 flex items-center justify-between gap-3 cursor-pointer select-none"
                                        >
                                          <div className="flex items-center gap-2.5 min-w-0">
                                            <Boxes className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                            <div className="flex flex-col min-w-0">
                                              <span className="text-[11px] font-bold text-slate-700 font-mono">{b.nomorBundle}</span>
                                              <span className="text-[9px] font-semibold text-slate-400 leading-tight">
                                                Tipe: {b.jenisPermohonan ? b.jenisPermohonan.replace(/_/g, ' ') : "Campuran"}
                                              </span>
                                            </div>
                                          </div>

                                          <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-bold bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full select-none">
                                              {permohonansCount} Berkas
                                            </span>
                                            <div className="text-slate-400">
                                              {isBundleExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                            </div>
                                          </div>
                                        </div>

                                        {/* Bundle Content (Applications Table) */}
                                        {isBundleExpanded && (
                                          <div className="overflow-x-auto scrollbar-thin border-t border-slate-100 p-2 bg-white animate-fadeIn">
                                            <table className="w-full text-left border-collapse text-xs">
                                              <thead>
                                                <tr className="bg-slate-50/50 text-[9px] font-bold text-slate-500 uppercase border-b border-slate-100 select-none">
                                                  <th className="py-2 px-3">NOP</th>
                                                  <th className="py-2 px-3">No. Pelayanan</th>
                                                  <th className="py-2 px-3">Nama Pemohon</th>
                                                  <th className="py-2 px-3 text-center">Status</th>
                                                  <th className="py-2 px-3 text-right">Aksi</th>
                                                </tr>
                                              </thead>
                                              <tbody className="divide-y divide-slate-100 text-xs">
                                                {permohonansCount === 0 ? (
                                                  <tr>
                                                    <td colSpan={5} className="py-4 text-center text-slate-400 italic">Bundle ini kosong.</td>
                                                  </tr>
                                                ) : (
                                                  b.permohonan.map((p: any) => {
                                                    const isSelected = selectedDoc?.id === p.id;
                                                    const archiveUrl = p.arsipDigital?.[0]?.urlBlob;
                                                    
                                                    // Map the bundle details context to Permohonan object for Stepper
                                                    const mappedPermohonan = { ...p, bundle: { ...b, manifest: m } };

                                                    return (
                                                      <tr 
                                                        key={p.id} 
                                                        onClick={() => setSelectedDoc(mappedPermohonan)}
                                                        className={`hover:bg-slate-50/60 transition-colors cursor-pointer ${
                                                          isSelected ? 'bg-indigo-50/30' : ''
                                                        }`}
                                                      >
                                                        <td className="py-3 px-3 font-mono font-bold text-slate-700">{formatNop(p.nop)}</td>
                                                        <td className="py-3 px-3 font-mono font-bold text-indigo-750">{p.nomorPelayanan || p.nomorPermohonan}</td>
                                                        <td className="py-3 px-3 text-slate-600 truncate max-w-[120px] uppercase font-bold">{p.namaWajibPajak}</td>
                                                        <td className="py-3 px-3 text-center">
                                                          <span className={`inline-block text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${getStatusBadgeClass(p.status)}`}>
                                                            {p.status}
                                                          </span>
                                                        </td>
                                                        <td className="py-3 px-3 text-right">
                                                          <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                                                            {archiveUrl && (
                                                              <a 
                                                                href={archiveUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-1 rounded bg-slate-50 border border-slate-200 text-indigo-650 hover:bg-slate-100 transition-all cursor-pointer flex items-center justify-center shadow-3xs"
                                                                title="Lihat Dokumen Arsip Scan PDF"
                                                              >
                                                                <ExternalLink className="w-3.5 h-3.5" />
                                                              </a>
                                                            )}
                                                            <button 
                                                              onClick={() => setGlobalSelectedRequest(mappedPermohonan)}
                                                              className="px-2 py-1 bg-white border border-slate-200 hover:border-slate-350 hover:bg-slate-50 rounded-lg text-[9px] font-black text-slate-600 transition-all cursor-pointer shadow-3xs"
                                                              title="Detail lengkap"
                                                            >
                                                              Tinjau
                                                            </button>
                                                          </div>
                                                        </td>
                                                      </tr>
                                                    );
                                                  })
                                                )}
                                              </tbody>
                                            </table>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Loose Documents List Container */}
              {loosePermohonans.length > 0 && (
                <div className="flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 select-none">
                    Arsip Belum Masuk Manifest ({loosePermohonans.length})
                  </h3>
                  
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                    <div className="overflow-x-auto scrollbar-thin p-2">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50/50 text-[9px] font-bold text-slate-500 uppercase border-b border-slate-100 select-none">
                            <th className="py-2.5 px-3">NOP</th>
                            <th className="py-2.5 px-3">No. Pelayanan</th>
                            <th className="py-2.5 px-3">Nama Pemohon</th>
                            <th className="py-2.5 px-3">Status Operasional</th>
                            <th className="py-2.5 px-3 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs bg-white">
                          {loosePermohonans.map((p) => {
                            const isSelected = selectedDoc?.id === p.id;
                            const archiveUrl = p.arsipDigital?.[0]?.urlBlob;
                            const isBundled = !!p.bundleId;

                            return (
                              <tr 
                                key={p.id} 
                                onClick={() => setSelectedDoc(p)}
                                className={`hover:bg-slate-50/60 transition-colors cursor-pointer ${
                                  isSelected ? 'bg-indigo-50/30 font-bold' : ''
                                }`}
                              >
                                <td className="py-3 px-3 font-mono font-bold text-slate-700">{formatNop(p.nop)}</td>
                                <td className="py-3 px-3 font-mono font-bold text-indigo-750">{p.nomorPelayanan || p.nomorPermohonan}</td>
                                <td className="py-3 px-3 text-slate-600 truncate max-w-[120px] uppercase font-bold">{p.namaWajibPajak}</td>
                                <td className="py-3 px-3">
                                  <div className="flex flex-col gap-0.5 items-start">
                                    <span className={`inline-block text-[9px] font-extrabold px-2 py-0.2 rounded border ${getStatusBadgeClass(p.status)}`}>
                                      {p.status}
                                    </span>
                                    {isBundled ? (
                                      <span className="text-[8px] font-bold text-indigo-650 tracking-tight">
                                        Bundle: {p.bundle?.nomorBundle}
                                      </span>
                                    ) : (
                                      <span className="text-[8px] font-semibold text-slate-400 italic">Belum Bundling</span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3 px-3 text-right">
                                  <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                                    {archiveUrl && (
                                      <a 
                                        href={archiveUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1 rounded bg-slate-50 border border-slate-200 text-indigo-650 hover:bg-slate-100 transition-all cursor-pointer flex items-center justify-center shadow-3xs"
                                        title="Lihat Dokumen Arsip Scan PDF"
                                      >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                      </a>
                                    )}
                                    <button 
                                      onClick={() => setGlobalSelectedRequest(p)}
                                      className="px-2 py-1 bg-white border border-slate-200 hover:border-slate-350 hover:bg-slate-50 rounded-lg text-[9px] font-black text-slate-600 transition-all cursor-pointer shadow-3xs"
                                    >
                                      Tinjau
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Right Side: Visual Timeline Stepper (35% space) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-5 select-none min-h-[400px]">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2">
            Visual Pelacakan Proses
          </h3>

          {selectedDoc ? (
            <div className="flex flex-col gap-6 animate-fadeIn">
              
              {/* Stepper Header Summary */}
              <div className="p-3.5 bg-slate-50 border border-slate-150 rounded-xl space-y-1.5">
                <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block leading-none">Dokumen Terpilih</span>
                <span className="text-xs font-black text-slate-800 font-mono tracking-tight block">
                  {selectedDoc.nomorPelayanan || selectedDoc.nomorPermohonan}
                </span>
                <div className="flex flex-col gap-1 pt-1 border-t border-slate-200/50 text-[10px]">
                  <p className="text-slate-500 font-semibold">NOP: <strong className="text-slate-700 font-mono font-bold">{formatNop(selectedDoc.nop)}</strong></p>
                  <p className="text-slate-500 font-semibold">WP: <strong className="text-slate-700 font-bold uppercase">{selectedDoc.namaWajibPajak}</strong></p>
                </div>
              </div>

              {/* Stepper Flow Elements */}
              <div className="relative pl-6 border-l-2 border-slate-150/70 ml-2 space-y-6 py-2">
                {timelineSteps.map((step, idx) => {
                  const isDone = step.done;
                  
                  return (
                    <div key={idx} className="relative">
                      {/* Circle Dot Marker */}
                      <span className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                        isDone 
                          ? "bg-indigo-500 border-indigo-500 text-white shadow-[0_0_8px_rgba(99,102,241,0.55)] scale-110" 
                          : "bg-white border-slate-300 text-slate-400"
                      }`}>
                        {isDone ? (
                          <CheckCircle className="w-2.5 h-2.5 fill-white stroke-indigo-500 stroke-[3]" />
                        ) : (
                          <span className="w-1 h-1 bg-slate-400 rounded-full" />
                        )}
                      </span>

                      {/* Step Text Info */}
                      <div className="flex flex-col gap-1">
                        <span className={`text-[11px] font-black tracking-tight leading-none ${
                          isDone ? "text-slate-800" : "text-slate-400"
                        }`}>
                          {step.title}
                        </span>
                        
                        <p className={`text-[10px] leading-normal font-medium max-w-[210px] ${
                          isDone ? "text-slate-500" : "text-slate-350"
                        }`}>
                          {step.desc}
                        </p>

                        {isDone && step.date && (
                          <span className="text-[8.5px] font-semibold text-slate-400/80 font-mono mt-0.5">
                            Tanggal: {new Date(step.date).toLocaleString("id-ID", {
                              day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setGlobalSelectedRequest(selectedDoc)}
                  className="px-3.5 py-1.5 bg-indigo-50 border border-indigo-150 hover:bg-indigo-100/30 text-indigo-700 font-extrabold text-[10px] rounded-xl shadow-3xs transition-all flex items-center gap-1 cursor-pointer w-full justify-center"
                >
                  <span>Buka Detail Lengkap</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-16 gap-3 select-none">
              <div className="w-14 h-14 bg-indigo-50 border border-indigo-100/50 rounded-2xl flex items-center justify-center text-indigo-500 shadow-3xs animate-pulse">
                <FolderOpen className="w-7 h-7 stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <h5 className="text-[11px] font-extrabold text-slate-700 capitalize">Pilih Berkas</h5>
                <p className="text-[10px] text-slate-400 font-semibold leading-relaxed max-w-[200px] mx-auto">
                  Klik salah satu permohonan di tabel untuk melihat visualisasi status permohonan dan riwayat pemrosesan berkas.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
