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
  ChevronLeft,
  ArrowLeft,
  ArrowLeftRight,
  RefreshCw,
  GitCommit,
  User,
  ArrowRight,
  Send,
  AlertTriangle,
  FolderOpen,
  Copy,
  Check,
  MoreVertical,
  Download,
  FileCheck
} from "lucide-react";
import { getTrackingData } from "@/app/actions/tracking";
import { useDashboard } from "@/context/DashboardContext";
import { useDebounce } from "@/lib/useDebounce";
import { EmptyDataAnimation } from "@/components/workspaces/shared/EmptyDataAnimation";
import { TrackingTabSkeleton } from "@/components/skeletons/SkeletonBase";


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

  // Active Selected Manifest & Bundle for 3-Tier drilldown view
  const [activeManifestView, setActiveManifestView] = useState<any | null>(null);
  const [activeBundleView, setActiveBundleView] = useState<any | null>(null);

  // Display mode switcher ('berkas' vs 'pemohon')
  const [displayMode, setDisplayMode] = useState<'berkas' | 'pemohon'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tracking_table_display_mode');
      if (saved === 'berkas' || saved === 'pemohon') return saved;
    }
    return 'berkas';
  });

  const handleSwitchDisplayMode = (mode: 'berkas' | 'pemohon') => {
    setDisplayMode(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('tracking_table_display_mode', mode);
    }
  };

  // Row action dropdown state
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Copy feedback state
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Download helpers
  const handleDownloadArsip = (item: any) => {
    const fileUrl = item.arsipDigitalUrl || item.dokumenUrl || item.buktiBayarUrl;
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    } else {
      alert(`Mendownload Arsip Digital Berkas (${item.nomorPelayanan || item.nomorPermohonan || item.nop})...`);
    }
  };

  const handleDownloadBuktiKirim = (item: any) => {
    const buktiUrl = item.buktiTandaTerima || activeManifestView?.buktiTandaTerima;
    if (buktiUrl) {
      window.open(buktiUrl, '_blank');
    } else {
      alert(`Mendownload Bukti Kirim Manifest (${activeManifestView?.nomorManifest || item.nomorPermohonan || 'Pengiriman'})...`);
    }
  };

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

  // Transform permohonan list inside activeBundleView for Mode 3 table display (flatten Mutasi Sebagian fractions when displayMode === 'pemohon')
  const bundleItemsList = useMemo(() => {
    if (!activeBundleView || !activeBundleView.permohonan) return [];

    const rawList = activeBundleView.permohonan;
    const q = debouncedSearch.toLowerCase().trim();

    const filtered = rawList.filter((item: any) => {
      if (!q) return true;
      return (
        (item.namaWajibPajak && item.namaWajibPajak.toLowerCase().includes(q)) ||
        (item.nop && item.nop.includes(q)) ||
        (item.nomorPelayanan && item.nomorPelayanan.toLowerCase().includes(q)) ||
        (item.dataBaru && item.dataBaru.some((db: any) => db.namaPemilikBaru?.toLowerCase().includes(q)))
      );
    });

    if (displayMode === 'berkas') {
      return filtered.map((item: any) => ({
        ...item,
        uniqueRowKey: item.id,
        displayNamaWajibPajak: item.namaWajibPajak,
        isPecahanRow: false,
      }));
    }

    return filtered.flatMap((item: any) => {
      if (item.jenisPermohonan === 'MUTASI_SEBAGIAN' && item.dataBaru && item.dataBaru.length > 0) {
        return item.dataBaru.map((db: any, subIdx: number) => ({
          ...item,
          uniqueRowKey: `${item.id}_pecahan_${subIdx}`,
          displayNamaWajibPajak: db.namaPemilikBaru || item.namaWajibPajak,
          pecahanIndex: subIdx + 1,
          totalPecahan: item.dataBaru.length,
          isPecahanRow: true,
        }));
      }

      return [{
        ...item,
        uniqueRowKey: item.id,
        displayNamaWajibPajak: item.namaWajibPajak,
        isPecahanRow: false,
      }];
    });
  }, [activeBundleView, debouncedSearch, displayMode]);

  // Pagination calculation
  const totalPages = Math.ceil(bundleItemsList.length / itemsPerPage);
  const activePage = currentPage > totalPages ? 1 : currentPage;

  const paginatedBundleItems = useMemo(() => {
    return bundleItemsList.slice(
      (activePage - 1) * itemsPerPage,
      activePage * itemsPerPage
    );
  }, [bundleItemsList, activePage, itemsPerPage]);

  if (loading) {
    return (
      <TrackingTabSkeleton
        viewMode={
          activeBundleView ? 'permohonan' : activeManifestView ? 'bundles' : 'manifests'
        }
      />
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 font-sans">

      {/* 1. Single Unified Command Bar Header dengan Navigasi Breadcrumb Interaktif */}
      <div className="bg-white border border-slate-200/90 p-4 rounded-md shadow-3xs flex flex-col md:flex-row md:items-center justify-between gap-4 select-none font-sans">
        <div>
          {!activeManifestView ? (
            <div>
              <h2 className="text-[13px] font-normal text-slate-800 font-sans capitalize flex items-center gap-1.5">
                Lacak Permohonan
              </h2>
            </div>
          ) : !activeBundleView ? (
            <div className="flex items-center gap-1.5 flex-wrap font-sans select-none text-[13px] font-normal text-slate-800 capitalize">
              <button
                type="button"
                onClick={() => { setActiveManifestView(null); setActiveBundleView(null); }}
                className="text-slate-600 hover:text-slate-900 underline underline-offset-2 cursor-pointer font-sans transition-colors"
                title="Klik untuk kembali ke Daftar Manifest"
              >
                Lacak Permohonan
              </button>
              <span className="text-slate-400 font-sans">/</span>
              <span className="text-slate-800 font-mono font-normal font-sans">
                {activeManifestView.nomorManifest}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 flex-wrap font-sans select-none text-[13px] font-normal text-slate-800 capitalize">
              <button
                type="button"
                onClick={() => { setActiveManifestView(null); setActiveBundleView(null); }}
                className="text-slate-600 hover:text-slate-900 underline underline-offset-2 cursor-pointer font-sans transition-colors"
                title="Klik untuk kembali ke Daftar Manifest"
              >
                Lacak Permohonan
              </button>
              <span className="text-slate-400 font-sans">/</span>
              <button
                type="button"
                onClick={() => setActiveBundleView(null)}
                className="text-slate-600 hover:text-slate-900 underline underline-offset-2 font-mono cursor-pointer font-sans transition-colors"
                title="Klik untuk kembali ke Daftar Bundle"
              >
                {activeManifestView.nomorManifest}
              </button>
              <span className="text-slate-400 font-sans">/</span>
              <span className="text-slate-800 font-mono font-normal font-sans">
                {activeBundleView.nomorBundle}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0 font-sans">
          {/* Search input (Identik dengan Peneliti Workspace) */}
          <div className="relative w-full md:w-[403px] max-w-full font-sans">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="w-full h-10 pl-10 pr-14 bg-white hover:bg-slate-50 focus:bg-white border border-slate-200 hover:border-slate-300 focus:border-[#00a389] rounded-md text-[13px] font-normal text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-3xs font-sans"
              placeholder="Cari nomor manifest, NOP, atau nama..."
            />
            {!isSearchFocused && !searchQuery && (
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200/80 select-none pointer-events-none font-sans">
                Ctrl+K
              </span>
            )}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 z-10 p-0.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer font-bold"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Refresh Button (Identik dengan Peneliti Workspace) */}
          <button
            onClick={() => loadData(true)}
            disabled={loading || refreshing}
            className="p-2.5 h-10 w-10 rounded-md border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-500 shadow-3xs transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center shrink-0"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 transition-all duration-300 ${refreshing ? "animate-spin text-[#00a389]" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main Content Container: Tampilan Card Manifest / Card Bundle / Tabel Permohonan */}
      <div className="w-full font-sans">
        {activeBundleView ? (
          /* ==================== VIEW MODE 3: TABEL PERMOHONAN BERKAS (Identik Penginput Workspace) ==================== */
          <div className="flex flex-col gap-3 font-sans animate-fadeIn">
            {/* Toolbar Atas Tabel: Action Buttons (Download Surat Pengantar & Bukti Kirim) + Mode Switcher */}
            <div className="flex items-center justify-between gap-3 select-none font-sans flex-wrap">
              {/* Action Buttons: Download Surat Pengantar & Download Bukti Kirim */}
              <div className="flex items-center gap-2">
                <a
                  href={activeBundleView?.id ? `/api/pdf/surat-pengantar-bundle/${activeBundleView.id}` : (activeManifestView?.id ? `/api/pdf/surat-pengantar-manifest/${activeManifestView.id}` : '#')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-8 px-3 rounded-md bg-white border border-slate-200/90 hover:border-slate-300 hover:bg-slate-50 text-slate-700 transition-all cursor-pointer flex items-center gap-1.5 text-[12px] font-normal shadow-3xs font-sans"
                  title="Download / Cetak Surat Pengantar PDF (Bundle)"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  <span>Download Surat Pengantar</span>
                </a>

                {activeManifestView?.buktiTandaTerima ? (
                  <a
                    href={activeManifestView.buktiTandaTerima}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-8 px-3 rounded-md bg-emerald-50 border border-emerald-200/90 text-[#008f78] hover:bg-emerald-100 transition-all cursor-pointer flex items-center gap-1.5 text-[12px] font-normal shadow-3xs font-sans"
                    title="Download / Lihat Bukti Tanda Terima Kirim"
                  >
                    <Download className="w-3.5 h-3.5 text-[#00a389]" />
                    <span>Download Bukti Kirim</span>
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => alert("Bukti kirim tanda terima belum diunggah untuk manifest ini.")}
                    className="h-8 px-3 rounded-md bg-slate-50 border border-slate-200/80 text-slate-400 hover:text-slate-600 transition-all cursor-pointer flex items-center gap-1.5 text-[12px] font-normal font-sans"
                    title="Bukti kirim belum diunggah"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                    <span>Download Bukti Kirim</span>
                  </button>
                )}
              </div>

              {/* Right Side: Tab Mode Switcher (Nopel & Pemohon) */}
              <div className="bg-slate-200/70 p-0.5 rounded-md flex items-center gap-0.5 border border-slate-300/60 text-[13px] font-normal select-none h-8 font-sans">
                <button
                  type="button"
                  onClick={() => handleSwitchDisplayMode('berkas')}
                  className={`h-7 px-3 rounded-md transition-all cursor-pointer flex items-center gap-1.5 font-sans ${displayMode === 'berkas'
                    ? 'bg-white text-slate-900 shadow-3xs font-normal'
                    : 'text-slate-600 hover:text-slate-900'
                    }`}
                  title="Tampilkan 1 baris per Nomor Pelayanan (NOPEL)"
                >
                  <span>Nopel</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchDisplayMode('pemohon')}
                  className={`h-7 px-3 rounded-md transition-all cursor-pointer flex items-center gap-1.5 font-sans ${displayMode === 'pemohon'
                    ? 'bg-white text-slate-900 shadow-3xs font-normal'
                    : 'text-slate-600 hover:text-slate-900'
                    }`}
                  title="Tampilkan rincian pecahan pemilik baru (Mutasi Sebagian)"
                >
                  <span>Pemohon</span>
                </button>
              </div>
            </div>

            {/* Enterprise Canvas & Table */}
            <div className="w-full bg-white border border-slate-200/90 rounded-md shadow-xs flex flex-col overflow-hidden min-h-[450px] font-sans">
              <div className="overflow-x-auto scrollbar-thin flex-1">
                <table className="w-full text-left border-collapse font-sans">
                  <thead>
                    <tr className="bg-slate-50/90 text-[13px] font-normal text-slate-600 capitalize text-left border-b border-slate-200/90 select-none font-sans whitespace-nowrap">
                      <th className="py-3 px-4 text-center w-12 min-w-[48px] relative font-normal text-slate-600">
                        <span>No</span>
                        <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                      </th>
                      <th className="py-3 px-2 text-center select-none w-10 min-w-[40px] relative font-normal text-slate-600">
                        <span>⭐</span>
                        <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                      </th>
                      <th className="py-3 px-4 min-w-[110px] relative font-normal text-slate-600">
                        <span>Tgl. Input</span>
                        <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                      </th>
                      <th className="py-3 px-4 min-w-[140px] relative font-normal text-slate-600">
                        <span>Petugas Input</span>
                        <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                      </th>
                      <th className="py-3 px-4 min-w-[110px] relative font-normal text-slate-600">
                        <span>Tgl. Nopel</span>
                        <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                      </th>
                      <th className="py-3 px-4 min-w-[110px] relative font-normal text-slate-600">
                        <span>Tgl. Selesai</span>
                        <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                      </th>
                      <th className="py-3 px-4 min-w-[160px] relative font-normal text-slate-600">
                        <span>No. Pelayanan</span>
                        <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                      </th>
                      <th className="py-3 px-4 min-w-[210px] whitespace-nowrap relative font-normal text-slate-600">
                        <span>Nomor Objek Pajak</span>
                        <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                      </th>
                      <th className="py-3 px-4 min-w-[150px] relative font-normal text-slate-600">
                        <span>Nama Pemohon</span>
                        <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                      </th>
                      <th className="py-3 px-4 min-w-[130px] relative font-normal text-slate-600">
                        <span>Jenis Layanan</span>
                        <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                      </th>
                      <th className="py-3 px-4 text-center min-w-[130px] relative font-normal text-slate-600">
                        <span>Status</span>
                        <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                      </th>
                      <th className="py-3 px-4 text-center min-w-[70px] relative font-normal text-slate-600">
                        <span>Aksi</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[12px] font-normal text-slate-600 font-sans">
                    {paginatedBundleItems.length === 0 ? (
                      <tr>
                        <td colSpan={12} className="py-10 text-center bg-white font-sans">
                          <EmptyDataAnimation
                            title="Belum Ada Permohonan"
                            description="Tidak ada permohonan dalam bundle ini."
                          />
                        </td>
                      </tr>
                    ) : (
                      paginatedBundleItems.map((item: any, idx: number) => {
                        const globalIdx = (activePage - 1) * itemsPerPage + idx + 1;
                        const noPelayanan = item.nomorPelayanan || item.nomorPermohonan || "—";
                        const inputDate = item.createdAt ? new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : "—";
                        const nopelDate = item.tanggalNoPelayanan ? new Date(item.tanggalNoPelayanan).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : "—";
                        const selesaiDate = item.tanggalPenyelesaian ? new Date(item.tanggalPenyelesaian).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : "—";
                        const penginputName = item.penginput?.name || "Petugas Input";

                        return (
                          <tr
                            key={item.uniqueRowKey || item.id || idx}
                            onClick={() => setGlobalSelectedRequest(item)}
                            className={`hover:bg-slate-50/90 transition-colors duration-150 cursor-pointer text-[12px] font-normal font-sans text-slate-600 h-11 ${item.isPecahanRow ? 'border-l-3 border-l-[#00a389] bg-[#00a389]/5' : ''
                              }`}
                          >
                            <td className="py-2.5 px-4 text-center text-slate-600 font-sans">{globalIdx}</td>
                            <td className="py-2.5 px-2 text-center">
                              <Star className={`w-4 h-4 mx-auto ${item.isFavorite ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`} />
                            </td>
                            <td className="py-2.5 px-4 text-slate-600 whitespace-nowrap">{inputDate}</td>
                            <td className="py-2.5 px-4 text-slate-600 whitespace-nowrap">{penginputName}</td>
                            <td className="py-2.5 px-4 text-slate-600 whitespace-nowrap">{nopelDate}</td>
                            <td className="py-2.5 px-4 text-slate-600 whitespace-nowrap">{selesaiDate}</td>
                            <td className="py-2.5 px-4 min-w-[150px] group/cell relative">
                              <div className="flex items-center gap-1.5">
                                <span className="font-normal text-slate-800">{noPelayanan}</span>
                                <button
                                  type="button"
                                  onClick={(e) => handleCopy(e, noPelayanan)}
                                  className="p-1 rounded opacity-0 group-hover/cell:opacity-100 hover:bg-slate-100 text-slate-400 hover:text-[#00a389] transition-all cursor-pointer"
                                  title="Salin Nomor"
                                >
                                  {copiedText === noPelayanan ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                </button>
                              </div>
                            </td>
                            <td className="py-2.5 px-4 min-w-[210px] whitespace-nowrap group/cell relative">
                              <div className="flex items-center gap-1.5">
                                <span className="font-normal text-slate-800">{formatNop(item.nop)}</span>
                                <button
                                  type="button"
                                  onClick={(e) => handleCopy(e, item.nop)}
                                  className="p-1 rounded opacity-0 group-hover/cell:opacity-100 hover:bg-slate-100 text-slate-400 hover:text-[#00a389] transition-all cursor-pointer"
                                  title="Salin NOP"
                                >
                                  {copiedText === item.nop ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                </button>
                              </div>
                            </td>
                            <td className="py-2.5 px-4 min-w-[170px]">
                              <div className="flex items-center gap-1.5 whitespace-nowrap">
                                <span className="font-normal text-slate-800 capitalize">{item.displayNamaWajibPajak || item.namaWajibPajak}</span>
                                {item.isPecahanRow && (
                                  <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-1.5 py-0.2 rounded-md shrink-0 font-sans">
                                    #{item.pecahanIndex}/{item.totalPecahan}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-2.5 px-4 min-w-[130px]">
                              <span className="px-2 py-0.5 rounded-md border text-[11px] font-normal bg-emerald-50 text-[#008f78] border-emerald-200 capitalize font-sans">
                                {item.jenisPermohonan ? getAbbreviatedJenis(item.jenisPermohonan) : '—'}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-center min-w-[130px]">
                              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-normal border leading-none capitalize font-sans ${getStatusBadgeClass(item.status)}`}>
                                {getStatusLabel(item.status)}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-center min-w-[70px] relative font-sans" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdownId(openDropdownId === (item.uniqueRowKey || item.id) ? null : (item.uniqueRowKey || item.id));
                                }}
                                className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer inline-flex items-center justify-center font-sans"
                                title="Opsi Pilihan"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>

                              {openDropdownId === (item.uniqueRowKey || item.id) && (
                                <>
                                  <div
                                    className="fixed inset-0 z-20"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenDropdownId(null);
                                    }}
                                  />
                                  <div className="absolute right-3 mt-1 w-52 bg-white rounded-md shadow-md border border-slate-200/90 py-1 z-30 font-sans text-left animate-fadeIn">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenDropdownId(null);
                                        handleDownloadArsip(item);
                                      }}
                                      className="w-full text-left px-3.5 py-2 text-[12px] text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2 font-normal transition-colors cursor-pointer font-sans"
                                    >
                                      <Download className="w-3.5 h-3.5 text-indigo-500" />
                                      <span>Download Arsip</span>
                                    </button>
                                  </div>
                                </>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer / Enterprise Pagination */}
              <div className="px-5 py-3.5 border-t border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 select-none shrink-0 mt-auto font-sans">
                <div className="flex items-center gap-3 font-sans">
                  <span className="text-[11px] font-semibold text-slate-500 font-sans">
                    {bundleItemsList.length > 0
                      ? `Menampilkan ${((activePage - 1) * itemsPerPage) + 1}–${Math.min(activePage * itemsPerPage, bundleItemsList.length)} dari ${bundleItemsList.length} ${displayMode === 'pemohon' ? 'entri pemohon' : 'permohonan'}`
                      : 'Tidak ada data'}
                  </span>
                  <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-md px-1.5 py-0.5 shadow-3xs font-sans">
                    {[10, 20, 50].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => { setItemsPerPage(n); setCurrentPage(1); }}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer font-sans ${itemsPerPage === n
                          ? 'bg-[#00a389] text-white shadow-3xs'
                          : 'text-slate-500 hover:text-slate-700'
                          }`}
                      >
                        {n}
                      </button>
                    ))}
                    <span className="text-[10px] text-slate-400 font-semibold pl-0.5 font-sans">/hal</span>
                  </div>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center gap-1 font-sans">
                    <button
                      type="button"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={activePage === 1}
                      className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-all cursor-pointer shadow-3xs flex items-center justify-center font-sans"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => page === 1 || page === totalPages || Math.abs(page - activePage) <= 1)
                      .reduce((acc: (number | string)[], page, idx, arr) => {
                        if (idx > 0 && (page as number) - (arr[idx - 1] as number) > 1) acc.push('...');
                        acc.push(page);
                        return acc;
                      }, [])
                      .map((page, idx) =>
                        page === '...' ? (
                          <span key={`ellipsis-${idx}`} className="px-1 text-slate-400 text-xs font-sans">…</span>
                        ) : (
                          <button
                            key={page}
                            type="button"
                            onClick={() => setCurrentPage(page as number)}
                            className={`w-7 h-7 rounded-md text-xs font-bold transition-all cursor-pointer font-sans ${activePage === page
                              ? 'bg-[#00a389] text-white font-extrabold shadow-3xs scale-105 z-10'
                              : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 shadow-3xs'
                              }`}
                          >
                            {page}
                          </button>
                        )
                      )}
                    <button
                      type="button"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={activePage === totalPages}
                      className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-all cursor-pointer shadow-3xs flex items-center justify-center font-sans"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : activeManifestView ? (
          /* ==================== VIEW MODE 2: CARD BUNDLE (Setelalh Card Manifest diklik) ==================== */
          <div className="flex flex-col gap-4 font-sans animate-fadeIn">
            {/* Grid Card Bundle (Identik dengan Peneliti Workspace) */}
            {(!activeManifestView.bundle || activeManifestView.bundle.length === 0) ? (
              <div className="bg-white rounded-md border border-slate-200/90 p-8 text-center shadow-3xs flex items-center justify-center font-sans">
                <EmptyDataAnimation
                  title="Belum Ada Bundle"
                  description="Manifest ini belum memiliki bundle berkas."
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
                {activeManifestView.bundle.map((b: any) => {
                  const berkasCount = b.permohonan?.length || 0;
                  const pemohonCount = (b.permohonan || []).reduce((acc: number, p: any) => {
                    if (p.jenisPermohonan === "MUTASI_SEBAGIAN") {
                      return acc + (p.dataBaru?.length || 1);
                    }
                    return acc + 1;
                  }, 0);

                  const penelitiName = b.peneliti?.name || "Peneliti";
                  const penelitiInitials = b.peneliti?.name
                    ? b.peneliti.name.split(" ").filter(Boolean).map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)
                    : "PN";

                  return (
                    <div
                      key={b.id}
                      onClick={() => setActiveBundleView(b)}
                      className="p-4 rounded-xl border bg-white border-slate-200/90 hover:border-slate-350 hover:shadow-md transition-all duration-300 flex flex-col justify-between gap-3.5 select-none min-h-[140px] font-sans cursor-pointer group"
                    >
                      {/* Baris 1: Nomor Bundle */}
                      <div className="flex items-center justify-between gap-2 w-full font-sans">
                        <span className="text-[13px] font-normal text-slate-800 font-mono tracking-tight truncate block font-sans" title={b.nomorBundle}>
                          {b.nomorBundle}
                        </span>
                      </div>

                      {/* Baris 2: Jenis Layanan Tag | Status Badge | Pemohon Count */}
                      <div className="flex items-center justify-center gap-1.5 w-full py-1 flex-wrap text-[12px] font-normal font-sans">
                        <span className="px-2 py-0.5 rounded-md border text-[11px] font-normal bg-emerald-50 text-[#008f78] border-emerald-200 capitalize font-sans">
                          {b.jenisPermohonan ? getAbbreviatedJenis(b.jenisPermohonan) : 'Umum'}
                        </span>

                        <div className="h-3.5 w-px bg-slate-200 shrink-0" />

                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-normal border capitalize font-sans ${b.status === 'LOCKED'
                          ? 'bg-slate-900 text-slate-100 border-slate-800'
                          : b.status === 'IN_MANIFEST'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-emerald-50 text-[#008f78] border-emerald-200'
                          }`}>
                          {getStatusLabel(b.status || 'LOCKED')}
                        </span>

                        <div className="h-3.5 w-px bg-slate-200 shrink-0" />

                        <span className="bg-[#f25c54] text-white text-[11px] font-normal px-2 py-0.5 rounded-md shrink-0 font-sans">
                          {pemohonCount} Pemohon
                        </span>
                      </div>

                      {/* Baris 3 (Footer): Peneliti Avatar + Tanggal */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[12px] font-normal text-slate-600 font-sans mt-auto">
                        <div className="flex items-center gap-1.5 min-w-0 font-sans" title={`Pembuat: ${penelitiName}`}>
                          <div className="w-5.5 h-5.5 rounded-full bg-[#00a389] text-white flex items-center justify-center text-[9px] font-bold shrink-0 shadow-3xs font-sans">
                            {penelitiInitials}
                          </div>
                        </div>

                        <span className="font-mono text-[12px] text-slate-500 font-normal shrink-0 font-sans">
                          {b.createdAt ? new Date(b.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : manifests.length === 0 ? (
          /* ==================== EMPTY STATE ==================== */
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center flex flex-col items-center justify-center shadow-3xs select-none font-sans">
            <EmptyDataAnimation
              title={debouncedSearch ? "Hasil Pencarian Tidak Ditemukan" : "Pelacakan Kosong"}
              description={
                debouncedSearch
                  ? "Kami tidak menemukan manifest yang sesuai dengan kata kunci."
                  : "Belum ada log pengiriman manifest di sistem saat ini."
              }
              action={
                debouncedSearch ? (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-md transition-all cursor-pointer shadow-3xs font-sans"
                  >
                    Reset Pencarian
                  </button>
                ) : undefined
              }
            />
          </div>
        ) : (
          /* ==================== VIEW MODE 1: GRID CARD MANIFEST ==================== */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-sans animate-fadeIn">
            {manifests.map((m) => {
              const totalBundles = m.bundle?.length || 0;
              const totalPecahanCount = (m.bundle || []).reduce((bAcc: number, b: any) => {
                const bPecahan = (b.permohonan || []).reduce((pAcc: number, p: any) => {
                  if (p.jenisPermohonan === "MUTASI_SEBAGIAN") {
                    return pAcc + (p.dataBaru?.length || 1);
                  }
                  return pAcc + 1;
                }, 0);
                return bAcc + bPecahan;
              }, 0);
              const pengirimName = m.pengirim?.name || "PETUGAS PENGIRIM";
              const pengirimInitials = pengirimName
                ? pengirimName.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)
                : "PG";

              return (
                <div
                  key={m.id}
                  onClick={() => setActiveManifestView(m)}
                  className="p-4 rounded-xl border bg-white border-slate-200/90 hover:border-slate-350 hover:shadow-md transition-all duration-300 cursor-pointer relative overflow-hidden group select-none min-h-[140px] font-sans flex flex-col justify-between gap-3.5"
                >
                  {/* Baris 1 (Header): Nomor Manifest & Badge Status */}
                  <div className="flex items-center justify-between gap-2 w-full font-sans">
                    <span className="font-mono text-[13px] font-normal text-slate-800 tracking-tight truncate font-sans">
                      {m.nomorManifest}
                    </span>

                    <span className={`px-2.5 py-0.5 rounded-full text-[12px] font-normal border leading-none capitalize tracking-wider shrink-0 font-sans ${m.status === 'LOCKED'
                      ? 'bg-slate-900 text-slate-100 border-slate-800'
                      : m.status === 'SENT'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}>
                      <span>{getStatusLabel(m.status)}</span>
                    </span>
                  </div>

                  {/* Baris 2 (Body): 2 Columns divided by vertical line separator */}
                  <div className="py-2 px-1 bg-slate-50 rounded-md border border-slate-100 flex items-center text-[12px] font-normal font-sans">
                    <div className="flex-1 flex items-center justify-center font-normal text-[#008f78] font-sans">
                      <span>{totalBundles} Bundle</span>
                    </div>
                    <div className="w-px h-3.5 bg-slate-200/90 shrink-0" />
                    <div className="flex-1 flex items-center justify-center font-normal text-slate-600 font-sans">
                      <span>{totalPecahanCount} Pemohon</span>
                    </div>
                  </div>

                  {/* Baris 3 (Footer): Pengirim avatar + tanggal */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 font-sans mt-auto">
                    <div className="flex items-center gap-2 min-w-0 font-sans">
                      <div className="w-5.5 h-5.5 rounded-full bg-[#00a389] text-white text-[8px] font-bold flex items-center justify-center shrink-0 shadow-3xs" title={pengirimName}>
                        {pengirimInitials}
                      </div>
                    </div>

                    <span className="text-[12px] font-normal text-slate-500 flex items-center gap-1 shrink-0 font-sans">
                      {m.updatedAt ? new Date(m.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
