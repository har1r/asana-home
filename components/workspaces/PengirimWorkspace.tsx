"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  FileText,
  Search,
  Upload,
  Clock,
  ExternalLink,
  RefreshCw,
  FolderOpen,
  ArrowLeftRight,
  ShieldAlert,
  Loader2,
  X,
  Truck,
  Plus,
  Lock,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  FolderDot,
  FileTextIcon,
  Trash,
  ChevronDown,
  ChevronRight,
  Star,
  Boxes,
  FileSpreadsheet,
  ArrowRight,
  Printer,
  Check,
  ChevronLeft,
  Unlock,
  Send,
  Layers
} from "lucide-react";
import {
  getEligibleBundles,
  getManifests,
  getManifestDetails,
  createManifest,
  addBundleToManifest,
  removeBundleFromManifest,
  lockManifest,
  revisiManifest,
  uploadBuktiTandaTerima,
  laporkanBundleHilang,
  ajukanKembalikanKePengarsip
} from "@/app/actions/pengirim";
import { useDashboard } from "@/context/DashboardContext";
import { SkeletonBox, SkeletonText, SkeletonBadge, SkeletonProgressBar } from "@/components/skeletons/SkeletonBase";

/** Skeleton untuk PengirimWorkspace — 2-panel layout */
export function PengirimSkeleton() {
  return (
    <div className="w-full font-sans select-none flex flex-col gap-6 animate-fadeIn">
      {/* Header card skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#f3f6f9] p-5 rounded-2xl shadow-sm">
        <div className="flex flex-col gap-2">
          <SkeletonBox width="w-16" height="h-4" rounded="rounded-full" />
          <SkeletonBox width="w-72" height="h-5" rounded="rounded-full" />
        </div>
        <SkeletonBox width="w-44" height="h-8" rounded="rounded-xl" />
      </div>

      {/* Main card skeleton */}
      <div className="bg-[#dde3ea] rounded-2xl p-6 shadow-sm flex flex-col gap-6 min-h-[400px]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <SkeletonText width="w-40" height="h-4" />
          <SkeletonBox width="w-56" height="h-8" rounded="rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col gap-3 h-32">
              <SkeletonText width="w-24" height="h-4" />
              <SkeletonText width="w-36" height="h-3" />
              <SkeletonText width="w-20" height="h-3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

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

        {/* Sky Background & Clouds */}
        <g className="cloud-bg-1" opacity="0.3">
          <path d="M25 20c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5c.8-.2 1.6.3 1.8 1.1.2.8-.3 1.6-1.1 1.8H20c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5" fill="#94a3b8" />
        </g>
        <g className="cloud-bg-2" opacity="0.25">
          <path d="M145 15c0-1.8 1.5-3.3 3.3-3.3s3.3 1.5 3.3 3.3c.6-.2 1.2.2 1.4.8.2.6-.2 1.2-.8 1.4H140c-.6 0-1.1-.5-1.1-1.1s.5-1.1 1.1-1.1" fill="#94a3b8" />
        </g>

        {/* Water */}
        <path d="M0 95h200v25H0z" fill="#f1f5f9" />
        <path d="M0 95c30-1.5 60 1.5 90 0s60-1.5 90 0 20 1.5 20 1.5v4H0z" fill="#cbd5e1" opacity="0.4" />

        {/* Wooden Pier */}
        <rect x="0" y="80" width="55" height="5" rx="1" fill="#854d0e" />
        <rect x="8" y="85" width="7" height="35" fill="#713f12" />
        <rect x="40" y="85" width="7" height="35" fill="#713f12" />

        {/* Sitting Fisherman */}
        <circle cx="35" cy="55" r="4.5" fill="#475569" />
        {/* Hat */}
        <path d="M26 53c3-3 15-3 18 0z" fill="#7c2d12" />
        <path d="M21 53h28v1.5H21z" fill="#a16207" />
        {/* Torso & Arms */}
        <path d="M30 59.5h10l2 18.5H28z" fill="#64748b" />
        {/* Pants */}
        <path d="M28 78h12l-1 7H29z" fill="#334155" />
        {/* Legs dangling over pier */}
        <rect x="31" y="85" width="2.5" height="11" rx="0.5" fill="#475569" />
        <rect x="36" y="85" width="2.5" height="9" rx="0.5" fill="#475569" />

        {/* Fishing Rod and Line Group */}
        <g className="rod-rod">
          {/* Wooden rod stick */}
          <line x1="38" y1="64" x2="125" y2="35" stroke="#a16207" strokeWidth="1.5" strokeLinecap="round" />
          {/* Thread line */}
          <line className="line-string" x1="125" y1="35" x2="125" y2="95" stroke="#cbd5e1" strokeWidth="0.75" />
        </g>

        {/* Water Ripple Circles */}
        <ellipse className="ripple-circle-1" cx="125" cy="95" rx="12" ry="2.5" fill="none" stroke="#6366f1" />
        <ellipse className="ripple-circle-2" cx="125" cy="95" rx="12" ry="2.5" fill="none" stroke="#6366f1" />

        {/* Jumping Fish */}
        {!isSearch && (
          <g className="fish-jumping">
            <path d="M125 95c2.5-0.8 5-2.5 5-4.2s-2.5-3.3-5-4.2c-1.7 0.8-2.5 2.5-2.5 4.2s0.8 3.3 2.5 4.2z" fill="#f59e0b" />
            <path d="M122.5 90.8l-2.5-1.7v3.3z" fill="#f59e0b" />
            <circle cx="128.5" cy="92" r="0.4" fill="#fff" />
          </g>
        )}
      </svg>
      {/* Search overlay indicator */}
      {isSearch && (
        <div className="absolute right-6 bottom-9 bg-white border border-slate-200 p-1.5 rounded-xl shadow-md animate-bounce flex items-center justify-center">
          <Search className="w-4 h-4 text-indigo-650" />
        </div>
      )}
    </div>
  );
});

FishingAnimation.displayName = 'FishingAnimation';

const highlightText = (text: string, search: string) => {
  if (!search.trim()) return <span>{text}</span>;
  const escapedSearch = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(`(${escapedSearch})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-100 text-yellow-900 rounded-[2px] px-0.5 font-bold">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
};

const MANIFEST_STATUS_CONFIG: Record<string, { bg: string, dot: string, icon: any, label: string, shadow: string }> = {
  DRAFT: {
    bg: "bg-indigo-50 text-indigo-700 border-indigo-200",
    dot: "bg-indigo-500",
    icon: Unlock,
    label: "draft",
    shadow: "shadow-[0_2px_8px_-3px_rgba(99,102,241,0.12)]",
  },
  LOCKED: {
    bg: "bg-amber-50 text-amber-800 border-amber-200/80",
    dot: "bg-amber-500",
    icon: Lock,
    label: "segel",
    shadow: "shadow-[0_2px_8px_-3px_rgba(245,158,11,0.12)]",
  },
  SENT: {
    bg: "bg-emerald-50 text-emerald-800 border-emerald-250",
    dot: "bg-emerald-500",
    icon: CheckCircle2,
    label: "terkirim",
    shadow: "shadow-[0_2px_8px_-3px_rgba(16,185,129,0.12)]",
  },
};

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

export default function PengirimWorkspace() {
  const { showConfirm } = useDashboard();
  // Local tabs: 'daftar-manifest' vs 'antrean-bundle' vs 'detail-manifest'
  const [workspaceTab, setWorkspaceTab] = useState<"daftar-manifest" | "antrean-bundle" | "detail-manifest">("daftar-manifest");

  // Lists and Selected States
  const [manifestsList, setManifestsList] = useState<any[]>([]);
  const [eligibleBundlesList, setEligibleBundlesList] = useState<any[]>([]);
  const [selectedManifest, setSelectedManifest] = useState<any | null>(null);
  const [selectedBundle, setSelectedBundle] = useState<any | null>(null);

  // States for search and loaders
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [filterManifestStatus, setFilterManifestStatus] = useState<string>("ALL");
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modals
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [correctionTarget, setCorrectionTarget] = useState<any | null>(null);
  const [correctionReason, setCorrectionReason] = useState("");
  const [showPreviewBundleModal, setShowPreviewBundleModal] = useState(false);

  // Pagination states
  const [currentManifestPage, setCurrentManifestPage] = useState(1);
  const [itemsPerManifestPage, setItemsPerManifestPage] = useState(8);
  const [currentBundlePage, setCurrentBundlePage] = useState(1);
  const itemsPerBundlePage = 8;

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const searchManifestInputRef = useRef<HTMLInputElement | null>(null);

  const fetchInitialData = async () => {
    setListLoading(true);
    setError("");
    try {
      const manifestsRes = await getManifests();
      const bundlesRes = await getEligibleBundles();

      if (manifestsRes.success) {
        setManifestsList(manifestsRes.list || []);

        if (selectedManifest) {
          const detailRes = await getManifestDetails(selectedManifest.id);
          if (detailRes.success) {
            setSelectedManifest(detailRes.manifest);
          } else {
            setSelectedManifest(null);
          }
        }
      }
      if (bundlesRes.success) {
        setEligibleBundlesList(bundlesRes.list || []);
      }
    } catch (err) {
      setError("Kesalahan koneksi ke server.");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Reset pagination when search changes
  useEffect(() => {
    setCurrentManifestPage(1);
  }, [searchQuery]);

  const handleSelectManifest = async (manifest: any) => {
    setLoading(true);
    setError("");
    setSuccess("");
    setSelectedBundle(null);
    try {
      const res = await getManifestDetails(manifest.id);
      if (res.success) {
        setSelectedManifest(res.manifest);
      } else {
        setError(res.error || "Gagal memuat detail manifest.");
      }
    } catch (err) {
      setError("Kesalahan memuat detail manifest.");
    } finally {
      setLoading(false);
    }
  };

  // Create Manifest
  const handleCreateManifest = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res: any = await createManifest();
      if (res.success) {
        setSuccess(`Manifest baru ${res.manifest?.nomorManifest} berhasil dibuat!`);
        await fetchInitialData();
        if (res.manifest) {
          // Select newly created manifest
          const detail = await getManifestDetails(res.manifest.id);
          if (detail.success) {
            setSelectedManifest(detail.manifest);
            setWorkspaceTab("detail-manifest");
          }
        }
        setTimeout(() => setSuccess(""), 4000);
      } else {
        setError(res.error || "Gagal membuat manifest baru.");
      }
    } catch (err: any) {
      setError(err.message || "Sistem error saat membuat manifest.");
    } finally {
      setLoading(false);
    }
  };

  // Add Bundle to Manifest
  const handleAddBundle = async (bundleId: string) => {
    if (!selectedManifest) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res: any = await addBundleToManifest(selectedManifest.id, bundleId);
      if (res.success) {
        setSuccess("Bundle berhasil ditambahkan ke dalam manifest!");
        await fetchInitialData();
        setTimeout(() => setSuccess(""), 4000);
      } else {
        setError(res.error || "Gagal menambahkan bundle.");
      }
    } catch (err: any) {
      setError(err.message || "Sistem error saat menambahkan bundle.");
    } finally {
      setLoading(false);
    }
  };

  // Remove Bundle from Manifest
  const handleRemoveBundle = async (bundleId: string) => {
    if (!selectedManifest) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res: any = await removeBundleFromManifest(selectedManifest.id, bundleId);
      if (res.success) {
        setSuccess("Bundle berhasil dilepas dari manifest!");
        await fetchInitialData();
        setTimeout(() => setSuccess(""), 4000);
      } else {
        setError(res.error || "Gagal melepas bundle.");
      }
    } catch (err: any) {
      setError(err.message || "Sistem error saat melepas bundle.");
    } finally {
      setLoading(false);
    }
  };

  // Lock Manifest
  const handleLockManifest = () => {
    if (!selectedManifest) return;
    showConfirm({
      title: "Konfirmasi Kunci Manifest",
      message: `Apakah Anda yakin ingin MENGUNCI manifest ${selectedManifest.nomorManifest}? Setelah dikunci, daftar bundle tidak dapat diubah tanpa merevisi manifest kembali ke DRAFT.`,
      onConfirm: async () => {
        setLoading(true);
        setError("");
        setSuccess("");
        try {
          const res: any = await lockManifest(selectedManifest.id);
          if (res.success) {
            setSuccess(`Manifest ${selectedManifest.nomorManifest} berhasil dikunci!`);
            await fetchInitialData();
            setTimeout(() => setSuccess(""), 4000);
          } else {
            setError(res.error || "Gagal mengunci manifest.");
          }
        } catch (err: any) {
          setError(err.message || "Sistem error saat mengunci.");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Revert Lock to Draft (Revisi Manifest)
  const handleRevisiManifest = () => {
    if (!selectedManifest) return;
    showConfirm({
      title: "Konfirmasi Revisi Manifest",
      message: `Apakah Anda yakin ingin MEREVISI manifest ${selectedManifest.nomorManifest}? Ini akan mengembalikan status menjadi DRAFT agar Anda dapat mengubah daftar bundle didalamnya.`,
      onConfirm: async () => {
        setLoading(true);
        setError("");
        setSuccess("");
        try {
          const res: any = await revisiManifest(selectedManifest.id);
          if (res.success) {
            setSuccess(`Manifest ${selectedManifest.nomorManifest} berhasil dikembalikan ke DRAFT.`);
            await fetchInitialData();
            setTimeout(() => setSuccess(""), 4000);
          } else {
            setError(res.error || "Gagal merevisi manifest.");
          }
        } catch (err: any) {
          setError(err.message || "Sistem error.");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Handle Receipt File upload
  const handleUploadReceipt = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedManifest) return;
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      setError("File bukti tanda terima harus berupa PDF, JPG, atau PNG.");
      return;
    }

    const MAX_SIZE = 20 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setError("Ukuran file tidak boleh melebihi 20 MB.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res: any = await uploadBuktiTandaTerima(selectedManifest.id, formData);
      if (res.success) {
        setSuccess("Bukti tanda terima diunggah! Manifest berhasil dikirim (SENT) dan wajib pajak telah dinotifikasi.");
        await fetchInitialData();
        if (fileInputRef.current) fileInputRef.current.value = "";
        setTimeout(() => setSuccess(""), 5000);
      } else {
        setError(res.error || "Gagal menyelesaikan pengiriman manifest.");
      }
    } catch (err: any) {
      setError(err.message || "Sistem error saat mengunggah berkas.");
    } finally {
      setLoading(false);
    }
  };

  // Report Bundle Lost (Anomali C)
  const handleReportBundleLost = (bundleId: string, nomorBundle: string) => {
    showConfirm({
      title: "Laporkan Bundle Hilang",
      message: `Apakah Anda yakin ingin melaporkan bundle ${nomorBundle} HILANG? Bundle akan dilepas dari manifest ini dan dikembalikan ke status LOCKED untuk penelusuran lebih lanjut.`,
      onConfirm: async () => {
        setLoading(true);
        setError("");
        setSuccess("");
        try {
          const res: any = await laporkanBundleHilang(bundleId);
          if (res.success) {
            setSuccess(`Bundle ${nomorBundle} berhasil dilaporkan hilang dan dikeluarkan dari manifest.`);
            await fetchInitialData();
            setTimeout(() => setSuccess(""), 5000);
          } else {
            setError(res.error || "Gagal melaporkan bundle hilang.");
          }
        } catch (err: any) {
          setError(err.message || "Sistem error.");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Request Major Correction: Kembalikan ke Pengarsip (Anomali A)
  const handleRequestCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctionTarget || !correctionReason.trim()) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res: any = await ajukanKembalikanKePengarsip(correctionTarget.id, correctionReason);
      if (res.success) {
        setSuccess("Permintaan koreksi 'Kembalikan ke Pengarsip' berhasil diajukan dan sedang menunggu keputusan Supervisor.");
        setShowCorrectionModal(false);
        setCorrectionTarget(null);
        setCorrectionReason("");
        await fetchInitialData();
        setTimeout(() => setSuccess(""), 5000);
      } else {
        setError(res.error || "Gagal mengajukan permintaan koreksi.");
      }
    } catch (err: any) {
      setError(err.message || "Sistem error.");
    } finally {
      setLoading(false);
    }
  };

  const openCorrectionModal = (permohonan: any) => {
    setCorrectionTarget(permohonan);
    setCorrectionReason("");
    setShowCorrectionModal(true);
  };

  // Keyboard shortcut: Ctrl+K or '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      const isTyping = tag === 'input' || tag === 'textarea' || tag === 'select' || (e.target as HTMLElement).isContentEditable;
      if ((e.ctrlKey && e.key === 'k') || (e.key === '/' && !isTyping)) {
        e.preventDefault();
        searchManifestInputRef.current?.focus();
        searchManifestInputRef.current?.select();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Reset pagination when search or filters change
  useEffect(() => {
    setCurrentManifestPage(1);
  }, [searchQuery, filterManifestStatus, itemsPerManifestPage]);

  // Computed filtered & paginated manifests
  const manifestStatusCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: manifestsList.length, DRAFT: 0, LOCKED: 0, SENT: 0 };
    manifestsList.forEach((m) => {
      if (m.status) {
        counts[m.status] = (counts[m.status] || 0) + 1;
      }
    });
    return counts;
  }, [manifestsList]);

  const filteredManifests = useMemo(() => {
    return manifestsList.filter((m) => {
      const matchesSearch = m.nomorManifest.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.pengirim?.name || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterManifestStatus === "ALL" || m.status === filterManifestStatus;
      return matchesSearch && matchesStatus;
    });
  }, [manifestsList, searchQuery, filterManifestStatus]);

  const totalManifestPages = Math.ceil(filteredManifests.length / itemsPerManifestPage);
  const activeManifestPage = currentManifestPage > totalManifestPages ? 1 : currentManifestPage;
  const paginatedManifests = filteredManifests.slice(
    (activeManifestPage - 1) * itemsPerManifestPage,
    activeManifestPage * itemsPerManifestPage
  );

  // Computed paginated bundles
  const totalBundlePages = Math.ceil(eligibleBundlesList.length / itemsPerBundlePage);
  const activeBundlePage = currentBundlePage > totalBundlePages ? 1 : currentBundlePage;
  const paginatedBundles = eligibleBundlesList.slice(
    (activeBundlePage - 1) * itemsPerBundlePage,
    activeBundlePage * itemsPerBundlePage
  );

  // Early return: full skeleton while loading
  if (listLoading) return <PengirimSkeleton />;

  return (
    <div id="pengirim-board-root" className="w-full font-sans select-none flex flex-col gap-6 animate-fadeIn">
      {/* ── Card 1: Header card with gradient + tab switcher ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] p-5 rounded-2xl shadow-md transition-all duration-300">
        <div className="flex items-center gap-2.5 text-xs font-bold tracking-wider font-display select-none">
          <div className="flex items-center gap-1.5 text-[#2c333f]/80 hover:text-[#2c333f] transition-colors">
            <span>Tugas Saya</span>
          </div>
          <span className="text-[#2c333f]/50 font-medium select-none">&gt;</span>
          <div className="flex items-center gap-1.5 bg-white/40 border border-white/50 px-2.5 py-1 rounded-lg shadow-3xs animate-fadeIn">
            <span className="font-extrabold capitalize text-[#2c333f]">
              {workspaceTab === "daftar-manifest"
                ? "daftar manifest"
                : workspaceTab === "antrean-bundle"
                  ? "antrean bundle"
                  : "kelola pengiriman"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <div className="bg-black/10 p-1 rounded-xl border border-black/5 flex items-center gap-1 shadow-3xs">
            <button
              onClick={() => setWorkspaceTab("daftar-manifest")}
              className={`px-3.5 py-1.5 rounded-lg text-[11px] font-extrabold transition-all duration-300 flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${workspaceTab === "daftar-manifest"
                  ? "bg-white text-[#2c333f] shadow-xs"
                  : "text-[#2c333f]/75 hover:text-[#2c333f] hover:bg-white/10"
                }`}
            >
              <Boxes className="w-3.5 h-3.5" />
              <span>Daftar Manifest</span>
            </button>
            <button
              onClick={() => setWorkspaceTab("antrean-bundle")}
              className={`px-3.5 py-1.5 rounded-lg text-[11px] font-extrabold transition-all duration-300 flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${workspaceTab === "antrean-bundle"
                  ? "bg-white text-[#2c333f] shadow-xs"
                  : "text-[#2c333f]/75 hover:text-[#2c333f] hover:bg-white/10"
                }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Antrean Bundle ({eligibleBundlesList.length})</span>
            </button>
            <button
              onClick={() => setWorkspaceTab("detail-manifest")}
              className={`px-3.5 py-1.5 rounded-lg text-[11px] font-extrabold transition-all duration-300 flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${workspaceTab === "detail-manifest"
                  ? "bg-white text-[#2c333f] shadow-xs"
                  : "text-[#2c333f]/75 hover:text-[#2c333f] hover:bg-white/10"
                }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Kelola Pengiriman</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Card 2: Content card that adapts based on workspaceTab ── */}

      {/* ==================== TAB: DAFTAR MANIFEST ==================== */}
      {workspaceTab === "daftar-manifest" && (
        <div className="bg-[#dde3ea] border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6 min-h-[300px]">
          {/* Header row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4 select-none">
            <div>
              <h2 className="font-extrabold text-[13px] capitalize tracking-wider text-slate-700 font-display">
                Daftar Manifest Pengiriman
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
              {/* Search Manifest */}
              <div className={`relative w-full sm:w-72 p-[1.5px] rounded-lg transition-all duration-300 ${isSearchFocused
                  ? "bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] shadow-xs"
                  : "bg-slate-200/90"
                }`}>
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
                <input
                  type="text"
                  ref={searchManifestInputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="w-full pl-8.5 pr-16 py-1.5 bg-white border-transparent rounded-[7px] text-xs font-semibold text-gray-755 placeholder-gray-400 focus:outline-none transition-all"
                  placeholder="Cari nomor manifest..."
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
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Action to create manifest */}
              <button
                onClick={handleCreateManifest}
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-[#7dd4fc] to-[#9cb4fe] hover:brightness-[1.03] active:scale-95 text-[#2c333f] font-bold text-xs rounded-xl border border-white/20 shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Manifest Baru</span>
              </button>
            </div>
          </div>

          {/* Filter Status Pills for Manifests */}
          <div className="flex flex-wrap items-center gap-2 select-none pb-1">
            {['ALL', 'DRAFT', 'LOCKED', 'SENT'].map((st) => {
              const isActive = filterManifestStatus === st;
              const count = manifestStatusCounts[st] ?? 0;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setFilterManifestStatus(st)}
                  className={`px-3.5 py-1 rounded-full text-[10px] font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer border ${isActive
                    ? 'bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] text-[#2c333f] border-transparent shadow-sm'
                    : 'bg-white text-slate-500 hover:bg-slate-50 border-gray-200/90'
                    }`}
                >
                  {st !== 'ALL' && (
                    <span className={`w-1.5 h-1.5 rounded-full ${st === 'DRAFT' ? 'bg-[#9cb4fe]' : st === 'LOCKED' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`} />
                  )}
                  <span>{st === 'ALL' ? 'Semua' : st === 'LOCKED' ? 'Segel' : st === 'SENT' ? 'Terkirim' : st.charAt(0) + st.slice(1).toLowerCase()}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-extrabold ${isActive ? 'bg-[#2c333f]/10 text-[#2c333f]' : 'bg-slate-100 text-slate-500'
                    }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Manifest Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {loading && manifestsList.length === 0 ? (
              <div className="col-span-full py-20 flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                <span className="text-xs font-semibold text-gray-400">Memuat...</span>
              </div>
            ) : filteredManifests.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-slate-200/60 shadow-3xs">
                <div className="flex flex-col items-center justify-center gap-4 max-w-md mx-auto select-none animate-fadeIn">
                  <FishingAnimation isSearch={!!(searchQuery || filterManifestStatus !== 'ALL')} />
                  <div className="flex flex-col gap-1">
                    <h5 className="text-[11px] font-extrabold text-slate-700 capitalize tracking-wider">
                      {searchQuery || filterManifestStatus !== 'ALL'
                        ? 'Hasil Pencarian Tidak Ditemukan'
                        : 'Belum Ada Manifest'}
                    </h5>
                    <p className="text-[10px] font-semibold text-slate-400 leading-relaxed px-4">
                      {searchQuery || filterManifestStatus !== 'ALL'
                        ? 'Kami tidak menemukan manifest yang cocok dengan kriteria Anda. Silakan atur ulang kata kunci atau filter.'
                        : 'Daftar manifest pengiriman kosong. Silakan buat manifest baru untuk memulai.'}
                    </p>
                  </div>
                  {(searchQuery || filterManifestStatus !== 'ALL') && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setFilterManifestStatus('ALL');
                      }}
                      className="mt-1 px-4.5 py-2 border border-slate-200/80 hover:bg-slate-50 text-slate-600 font-extrabold text-[10px] rounded-xl transition-all cursor-pointer shadow-3xs"
                    >
                      Reset Pencarian
                    </button>
                  )}
                </div>
              </div>
            ) : (
              paginatedManifests.map((m) => {
                const isSelected = selectedManifest?.id === m.id;
                const bundlesCount = m.bundle?.length || 0;
                const totalWP = m.bundle?.reduce((acc: number, b: any) => acc + b.permohonan.length, 0) || 0;
                const statusCfg = MANIFEST_STATUS_CONFIG[m.status] || MANIFEST_STATUS_CONFIG.DRAFT;

                const renderCardIconOrCount = () => {
                  const iconClass = `w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110 ${isSelected ? 'text-indigo-650 font-bold' : m.status === 'SENT' ? 'text-[#10b981]' : 'text-indigo-500'
                    }`;
                  if (bundlesCount > 0) {
                    return (
                      <span className={`w-5 h-5 flex items-center justify-center text-[10px] font-black rounded-full leading-none transition-all duration-300 group-hover:scale-110 ${isSelected
                          ? 'bg-gradient-to-r from-sky-500 to-[#9cb4fe] text-white shadow-sm font-extrabold'
                          : m.status === 'SENT'
                            ? 'bg-emerald-500 text-white shadow-2xs font-extrabold'
                            : 'bg-[#9cb4fe] text-white shadow-2xs font-extrabold'
                        }`}>
                        {bundlesCount}
                      </span>
                    );
                  }
                  return <Layers className={iconClass} />;
                };

                const renderStatusIcon = () => {
                  const iconClass = "w-2.5 h-2.5 shrink-0";
                  if (m.status === 'LOCKED') return <Lock className={iconClass} />;
                  if (m.status === 'SENT') return <CheckCircle2 className={iconClass} />;
                  return <Unlock className={iconClass} />;
                };

                return (
                  <div
                    key={m.id}
                    onClick={() => handleSelectManifest(m)}
                    className={`p-4 rounded-2xl border flex flex-col justify-between gap-3.5 transition-all duration-300 hover:-translate-y-1 cursor-pointer relative overflow-hidden group select-none min-h-[110px] ${isSelected
                        ? 'bg-gradient-to-br from-sky-50/60 via-[#9cb4fe]/10 to-white/90 border-[#9cb4fe]/60 shadow-md ring-2 ring-[#7dd4fc]/25'
                        : `bg-white/85 border-slate-200 hover:border-slate-350 hover:shadow-md ${statusCfg.shadow}`
                      }`}
                  >
                    {/* Status Pill Badge (Top-Right) */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold border leading-none uppercase tracking-wider flex items-center gap-1 shadow-3xs transition-all ${m.status === 'LOCKED'
                          ? 'bg-slate-900 text-slate-100 border-slate-800'
                          : m.status === 'SENT'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-250'
                            : 'bg-indigo-50 text-indigo-755 border-indigo-200'
                        }`}>
                        {renderStatusIcon()}
                        <span>{statusCfg.label}</span>
                      </span>
                    </div>

                    <div className="flex gap-2.5 items-start">
                      {/* Left: Premium Representative Icon Wrapper */}
                      <div className={`p-2 rounded-xl border flex items-center justify-center transition-all ${isSelected
                          ? 'bg-sky-50/80 border-sky-150'
                          : m.status === 'SENT'
                            ? 'bg-emerald-50 border-emerald-100'
                            : 'bg-slate-50 border-slate-200/45'
                        }`}>
                        {renderCardIconOrCount()}
                      </div>

                      {/* Right: Info */}
                      <div className="flex flex-col min-w-0 flex-1 justify-center pr-12 self-center">
                        <span className="text-[10px] text-gray-400 font-extrabold capitalize tracking-wider select-none">Nomor Manifest</span>
                        <span className="text-xs font-black text-slate-850 font-mono tracking-tight block truncate" title={m.nomorManifest}>
                          {highlightText(m.nomorManifest, searchQuery)}
                        </span>
                      </div>
                    </div>

                    {/* Bottom: Manifest Details & Actions */}
                    <div className="flex flex-col gap-2 pt-2 border-t border-slate-100/80">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-indigo-650 font-bold select-none bg-indigo-50 px-2 py-0.5 rounded-lg w-fit border border-indigo-100/50">
                          {bundlesCount} map · {totalWP} berkas WP
                        </span>
                        <div className="flex items-center justify-between text-[9px] font-semibold text-slate-400">
                          <span className="truncate pr-2">
                            Pengirim: <strong className="text-slate-500 font-bold">{m.pengirim?.name || "-"}</strong>
                          </span>
                          <span className="shrink-0">
                            {new Date(m.createdAt).toLocaleDateString("id-ID", {
                              day: "2-digit", month: "short", year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="flex items-center justify-between pt-1 border-t border-slate-50 mt-0.5 select-none animate-fadeIn">
                          <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Aktif</span>
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setWorkspaceTab("detail-manifest");
                            }}
                            className="text-[9px] text-indigo-600 font-extrabold hover:underline flex items-center gap-0.5 cursor-pointer"
                          >
                            <span>Kelola Pengiriman</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Table Footer / Pagination for Manifests */}
          <div className="px-5 py-3.5 border border-slate-200/60 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto rounded-xl select-none shadow-3xs shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-semibold text-gray-500 font-sans">
                {filteredManifests.length > 0
                  ? `Menampilkan ${((activeManifestPage - 1) * itemsPerManifestPage) + 1}–${Math.min(activeManifestPage * itemsPerManifestPage, filteredManifests.length)} dari ${filteredManifests.length} manifest`
                  : 'Tidak ada data'}
              </span>
              {/* Items per page */}
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-1.5 py-0.5">
                {[8, 16, 32].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => {
                      setItemsPerManifestPage(n);
                      setCurrentManifestPage(1);
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${itemsPerManifestPage === n
                      ? 'bg-gradient-to-r from-[#7dd4fc] to-[#9cb4fe] text-[#1e2022] shadow-sm font-extrabold'
                      : 'text-slate-500 hover:text-slate-700'
                      }`}
                  >
                    {n}
                  </button>
                ))}
                <span className="text-[10px] text-slate-400 font-semibold pl-0.5">/hal</span>
              </div>
            </div>

            {totalManifestPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentManifestPage(prev => Math.max(prev - 1, 1))}
                  disabled={activeManifestPage === 1}
                  className="p-1.5 rounded-lg border-transparent bg-white text-gray-500 hover:bg-[#f1f5f9] disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                {Array.from({ length: totalManifestPages }, (_, i) => i + 1)
                  .filter(page => page === 1 || page === totalManifestPages || Math.abs(page - activeManifestPage) <= 1)
                  .reduce((acc: (number | string)[], page, idx, arr) => {
                    if (idx > 0 && (page as number) - (arr[idx - 1] as number) > 1) acc.push('...');
                    acc.push(page);
                    return acc;
                  }, [])
                  .map((page, idx) =>
                    page === '...' ? (
                      <span key={`ellipsis-${idx}`} className="px-1 text-slate-400 text-xs">…</span>
                    ) : (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setCurrentManifestPage(page as number)}
                        className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${activeManifestPage === page
                          ? 'bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] text-[#1e2022] font-extrabold shadow-sm scale-105 z-10'
                          : 'border-transparent bg-white text-gray-500 hover:bg-[#f1f5f9]'
                          }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                <button
                  type="button"
                  onClick={() => setCurrentManifestPage(prev => Math.min(prev + 1, totalManifestPages))}
                  disabled={activeManifestPage === totalManifestPages}
                  className="p-1.5 rounded-lg border-transparent bg-white text-gray-500 hover:bg-[#f1f5f9] disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== TAB: ANTREAN BUNDLE ==================== */}
      {workspaceTab === "antrean-bundle" && (
        <div className="bg-[#dde3ea] border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6 min-h-[300px]">
          {/* Header row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4 select-none">
            <div>
              <h2 className="font-extrabold text-[13px] capitalize tracking-wider text-slate-700 font-display">
                Antrean Bundle Locked
              </h2>
              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                Daftar bundle fisik terarsip penuh (LOCKED) yang siap dikirimkan.
              </p>
            </div>
          </div>

          {/* Bundle Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {paginatedBundles.length === 0 ? (
              <div className="col-span-full py-20 text-center text-xs text-gray-400 font-medium italic select-none">
                Tidak ada bundle locked terarsip penuh di antrean saat ini.
              </div>
            ) : (
              paginatedBundles.map((b) => {
                const isSelected = selectedBundle?.id === b.id;

                return (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBundle(b)}
                    className={`p-4 rounded-2xl border flex flex-col justify-between gap-3.5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer bg-white relative overflow-hidden group min-h-[110px] ${isSelected
                        ? "border-indigo-400 shadow-md ring-2 ring-indigo-500/10"
                        : "border-slate-200 hover:shadow-sm hover:border-slate-350"
                      }`}
                  >
                    {/* Ribbon status miring */}
                    <div className="absolute top-0 right-0 h-14 w-14 overflow-hidden select-none pointer-events-none z-10">
                      <div className="absolute transform rotate-45 text-center text-[7px] font-extrabold uppercase py-0.5 w-20 -right-6 top-2 shadow-2xs bg-slate-900 text-white">
                        {b.status.toLowerCase()}
                      </div>
                    </div>

                    <div className="space-y-2 pr-6">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-gray-400 font-extrabold capitalize tracking-wider">Nomor Bundle</span>
                        <span className="text-sm font-black text-gray-800 font-mono tracking-tight">{b.nomorBundle}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-indigo-650 font-bold select-none bg-indigo-50 px-2 py-0.5 rounded-lg w-fit border border-indigo-100/50">
                          {b.permohonan?.length} berkas
                        </span>
                        <span className="text-[9px] text-slate-500 font-bold capitalize truncate block">
                          {b.jenisPermohonan
                            ? b.jenisPermohonan.replace(/_/g, " ").toLowerCase()
                            : "Campuran / Umum"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-1 select-none">
                      {isSelected ? (
                        <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Terpilih</span>
                        </span>
                      ) : (
                        <span className="text-[9px] text-slate-400 font-semibold">
                          Klik untuk memilih
                        </span>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBundle(b);
                          setShowPreviewBundleModal(true);
                        }}
                        className="text-[9px] text-indigo-650 font-extrabold hover:underline flex items-center gap-0.5 cursor-pointer ml-auto"
                      >
                        <span>Pratinjau</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination bundles */}
          {totalBundlePages > 1 && (
            <div className="px-5 py-3 border-t border-slate-200/55 flex items-center justify-between mt-auto">
              <span className="text-[11px] font-semibold text-gray-400 select-none">
                Menampilkan {((activeBundlePage - 1) * itemsPerBundlePage) + 1}–{Math.min(activeBundlePage * itemsPerBundlePage, eligibleBundlesList.length)} dari {eligibleBundlesList.length} bundle
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentBundlePage((prev) => Math.max(prev - 1, 1))}
                  disabled={activeBundlePage === 1}
                  className="p-1.5 rounded-lg border-transparent bg-white text-gray-500 hover:bg-[#f1f5f9] disabled:opacity-40 transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                {Array.from({ length: totalBundlePages }, (_, i) => i + 1).map((page) => (
                  <button
                    type="button"
                    key={page}
                    onClick={() => setCurrentBundlePage(page)}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${activeBundlePage === page
                        ? "bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] text-[#1e2022] font-extrabold shadow-sm scale-105 z-10"
                        : "border-transparent bg-white text-gray-500 hover:bg-[#f1f5f9]"
                      }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setCurrentBundlePage((prev) => Math.min(prev + 1, totalBundlePages))}
                  disabled={activeBundlePage === totalBundlePages}
                  className="p-1.5 rounded-lg border-transparent bg-white text-gray-500 hover:bg-[#f1f5f9] disabled:opacity-40 transition-all cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== TAB: DETAIL MANIFEST ==================== */}
      {workspaceTab === "detail-manifest" && (
        <div className="bg-[#dde3ea] rounded-2xl shadow-sm flex flex-col overflow-hidden min-h-[300px]">
          {selectedManifest ? (
            <div className="flex-1 flex flex-col overflow-hidden animate-fadeIn">
              {/* Header Manifest */}
              <div className="px-5 py-4 border-b border-gray-200/60 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => setWorkspaceTab("daftar-manifest")}
                    className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-gray-700 font-extrabold transition-colors cursor-pointer w-fit uppercase tracking-wider mb-1"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Kembali ke Daftar Manifest</span>
                  </button>
                  <h3 className="font-extrabold text-[13px] capitalize tracking-wider text-slate-700 font-display flex items-center gap-2 flex-wrap">
                    Manifest: <span className="font-mono font-black text-slate-900">{selectedManifest.nomorManifest}</span>
                    <span className="bg-indigo-50 text-indigo-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                      {(selectedManifest.bundle || []).length} Map Bundle
                    </span>
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-[10px] text-gray-400 font-semibold">
                      Dibuat: {new Date(selectedManifest.createdAt).toLocaleString("id-ID")}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[10px] text-gray-400 font-semibold">
                      Pengirim: <span className="text-slate-700 font-bold">{selectedManifest.pengirim?.name || "-"}</span>
                    </span>
                  </div>
                </div>

                {/* Status Timeline Progress */}
                <div className="flex items-center gap-1">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${selectedManifest.status === "DRAFT" ? "bg-sky-100 text-sky-850" : "bg-slate-100 text-slate-500"
                    }`}>
                    DRAFT
                  </span>
                  <span className="text-slate-300">&gt;</span>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${selectedManifest.status === "LOCKED" ? "bg-amber-100 text-amber-850" : "bg-slate-100 text-slate-500"
                    }`}>
                    LOCKED
                  </span>
                  <span className="text-slate-300">&gt;</span>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${selectedManifest.status === "SENT" ? "bg-emerald-100 text-emerald-850" : "bg-slate-100 text-slate-500"
                    }`}>
                    SENT
                  </span>
                </div>
              </div>

              {/* Main detail page content wrapper */}
              <div className="p-6 flex flex-col gap-6 bg-[#dde3ea] flex-1">
                {/* Error & Success Banner (inner) */}
                {error && (
                  <div className="bg-red-50/80 border border-red-200 text-red-700 text-xs font-bold rounded-xl px-4 py-3 flex items-start gap-2 animate-fadeIn shrink-0">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                    <span className="flex-1">{error}</span>
                    <button onClick={() => setError("")} className="text-red-400 hover:text-red-600 shrink-0 cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                {success && (
                  <div className="bg-emerald-50/80 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl px-4 py-3 flex items-start gap-2 animate-fadeIn shrink-0">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
                    <span className="flex-1">{success}</span>
                    <button onClick={() => setSuccess("")} className="text-emerald-500 hover:text-emerald-750 shrink-0 cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* List of Bundles inside Manifest */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
                  <h4 className="text-xs font-black text-slate-500 capitalize tracking-widest select-none">
                    Daftar Bundle didalam Manifest ({selectedManifest.bundle?.length || 0})
                  </h4>

                  {selectedManifest.bundle?.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 font-semibold text-xs border border-dashed border-gray-200 rounded-xl select-none">
                      Belum ada bundle yang dimasukkan ke manifest ini.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {selectedManifest.bundle.map((b: any) => (
                        <div
                          key={b.id}
                          className="p-4 bg-slate-50/50 border border-gray-150 rounded-2xl flex flex-col gap-3.5"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <span className="text-xs font-bold text-slate-800">{b.nomorBundle}</span>
                              <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                                Tipe: {b.jenisPermohonan?.replace(/_/g, " ")} • Jumlah: {b.permohonan?.length} berkas
                              </span>
                            </div>

                            {/* Actions per bundle depending on manifest status */}
                            <div className="flex items-center gap-2 shrink-0">
                              <a
                                href={`/api/export/bundle/${b.id}`}
                                download
                                className="flex items-center gap-1 py-1 px-2.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100/50 rounded-lg transition-all"
                                title="Ekspor daftar permohonan ke Excel"
                              >
                                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                                Excel
                              </a>
                              {selectedManifest.status === "DRAFT" && (
                                <button
                                  onClick={() => handleRemoveBundle(b.id)}
                                  disabled={loading}
                                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                                  title="Hapus bundle dari manifest"
                                >
                                  <Trash className="w-4 h-4" />
                                </button>
                              )}
                              {selectedManifest.status === "SENT" && (
                                <button
                                  onClick={() => handleReportBundleLost(b.id, b.nomorBundle)}
                                  disabled={loading}
                                  className="flex items-center gap-1 py-1 px-2.5 text-[10px] font-bold text-red-650 hover:text-red-700 bg-red-50 hover:bg-red-100/50 rounded-lg transition-all cursor-pointer"
                                  title="Laporkan bundle ini hilang saat pengiriman"
                                >
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  Laporkan hilang
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Display Applications details inside bundle (for SENT manifest) */}
                          {selectedManifest.status === "SENT" && b.permohonan && b.permohonan.length > 0 && (
                            <div className="border-t border-slate-100 pt-3 flex flex-col gap-2">
                              <span className="text-[10px] font-extrabold text-slate-400 capitalize tracking-wider block">
                                Status Berkas (Permohonan)
                              </span>
                              <div className="flex flex-col gap-2">
                                {b.permohonan.map((p: any) => {
                                  const isFrozen = p.permintaanKoreksi && p.permintaanKoreksi.length > 0;

                                  return (
                                    <div
                                      key={p.id}
                                      className={`p-3 border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-all ${isFrozen ? "border-amber-200 bg-amber-50/20" : "border-slate-100 bg-slate-50/50"
                                        }`}
                                    >
                                      <div>
                                        <span className="font-extrabold text-slate-800 flex items-center gap-1.5 font-mono">
                                          NOP: {formatNop(p.nop)}
                                          {p.isFavorite && (
                                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0 shadow-3xs" />
                                          )}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-semibold block">
                                          Wajib Pajak: {p.namaWajibPajak}
                                        </span>
                                        {isFrozen && (
                                          <span className="text-[9px] font-bold text-amber-700 flex items-center gap-1 mt-1">
                                            <Clock className="w-3 h-3 text-amber-500 animate-spin" />
                                            Menunggu Supervisor: Kembalikan ke Pengarsip
                                          </span>
                                        )}
                                      </div>

                                      <div className="flex items-center gap-2">
                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full capitalize select-none ${p.status === "ARCHIVED" ? "bg-emerald-100 text-emerald-800" : "bg-sky-100 text-sky-800"
                                          }`}>
                                          {p.status === "ARCHIVED" ? "Terarsip" : p.status}
                                        </span>

                                        {!isFrozen && p.status === "ARCHIVED" && (
                                          <button
                                            onClick={() => openCorrectionModal(p)}
                                            className="py-1 px-2 text-[9px] font-bold text-gray-500 hover:text-red-700 bg-white hover:bg-red-50 border border-slate-200 rounded-lg transition-all cursor-pointer"
                                            title="Kembalikan ke Pengarsip untuk upload ulang scan digital"
                                          >
                                            Kembalikan ke pengarsip
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Bundle interface in DRAFT status */}
                  {selectedManifest.status === "DRAFT" && (
                    <div className="mt-4 border-t border-slate-100 pt-4 flex flex-col gap-3">
                      <h5 className="text-[10px] font-bold text-slate-500 capitalize tracking-widest select-none">
                        Masukkan Antrean Bundle
                      </h5>
                      {eligibleBundlesList.length === 0 ? (
                        <p className="text-center py-4 text-gray-400 font-medium text-xs border border-dashed border-gray-200 rounded-xl select-none">
                          Tidak ada bundle locked terarsip penuh di antrean.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {eligibleBundlesList.map((b) => (
                            <div
                              key={b.id}
                              className="p-3.5 bg-slate-50 border border-slate-150 rounded-xl text-xs flex flex-col gap-2 hover:border-slate-350 transition-all select-none"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="font-bold text-slate-800 block truncate">{b.nomorBundle}</span>
                                  <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">
                                    Tipe: {b.jenisPermohonan?.replace(/_/g, " ")} • {b.permohonan?.length} berkas
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={() => handleAddBundle(b.id)}
                                disabled={loading}
                                className="w-full py-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-[10px] rounded-lg transition-all active:scale-95 cursor-pointer text-center"
                              >
                                Tambah ke manifest
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Bar Footer depending on manifest status */}
                <div className="border-t border-slate-200 pt-4 bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none shadow-sm">

                  {/* Left description */}
                  <div className="text-[11px] text-slate-500 font-bold max-w-lg">
                    {selectedManifest.status === "DRAFT" && (
                      <span>* Masukkan map bundle terlebih dahulu lalu kunci manifest untuk melanjutkan ke proses pengiriman.</span>
                    )}
                    {selectedManifest.status === "LOCKED" && (
                      <span>* Cetak surat pengantar manifest dan unggah berkas bukti tanda terima untuk menyelesaikan pengiriman.</span>
                    )}
                    {selectedManifest.status === "SENT" && (
                      <span>* Pengiriman manifest telah selesai. Anda dapat meninjau tanda terima atau melaporkan anomali berkas.</span>
                    )}
                  </div>

                  {/* Right actions */}
                  <div className="flex items-center gap-3 justify-end shrink-0">

                    {/* Draft Actions */}
                    {selectedManifest.status === "DRAFT" && (
                      <button
                        onClick={handleLockManifest}
                        disabled={loading || selectedManifest.bundle?.length === 0}
                        className="flex items-center gap-1.5 py-2.5 px-5 text-xs font-black text-white bg-indigo-650 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        Kunci manifest
                      </button>
                    )}

                    {/* Locked Actions */}
                    {selectedManifest.status === "LOCKED" && (
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Print dispatch letter */}
                        <a
                          href={`/api/pdf/surat-pengantar-manifest/${selectedManifest.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 py-2.5 px-4 text-xs font-bold text-gray-700 hover:text-indigo-700 bg-white border border-slate-200 hover:border-slate-350 rounded-xl transition-all cursor-pointer"
                        >
                          <FileTextIcon className="w-4 h-4 text-red-500" />
                          Cetak surat pengantar
                        </a>

                        {/* Revert locking to draft */}
                        <button
                          onClick={handleRevisiManifest}
                          disabled={loading}
                          className="py-2.5 px-4 text-xs font-bold text-gray-655 hover:text-gray-800 bg-white border border-slate-200 rounded-xl transition-all cursor-pointer"
                        >
                          Revisi manifest
                        </button>

                        {/* Upload receipt file */}
                        <input
                          type="file"
                          accept=".pdf, image/jpeg, image/png"
                          ref={fileInputRef}
                          onChange={handleUploadReceipt}
                          className="hidden"
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={loading}
                          className="flex items-center gap-1.5 py-2.5 px-5 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-sm transition-all cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          Unggah tanda terima
                        </button>
                      </div>
                    )}

                    {/* Sent Actions */}
                    {selectedManifest.status === "SENT" && selectedManifest.buktiTandaTerima && (
                      <a
                        href={selectedManifest.buktiTandaTerima}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 py-2.5 px-5 text-xs font-black text-emerald-700 bg-emerald-50 hover:bg-emerald-100/50 rounded-xl border border-emerald-250 transition-all cursor-pointer"
                      >
                        <FileCheck className="w-4 h-4" />
                        Lihat bukti tanda terima
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-20 text-slate-400 select-none bg-white p-8">
              <Truck className="w-12 h-12 text-slate-350 mb-3 animate-pulse" />
              <h3 className="text-sm font-bold text-slate-700 mb-1">Kelola Pengiriman</h3>
              <p className="text-xs text-gray-400 font-semibold max-w-sm">
                Silakan pilih salah satu manifest aktif di tab <strong>Daftar Manifest</strong>, lalu klik tombol <strong>Kelola Pengiriman</strong> untuk meninjau, mengunci, atau menyelesaikan berkas bukti tanda terima pengiriman manifest.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ================= PREVIEW BUNDLE MODAL ================= */}
      {showPreviewBundleModal && selectedBundle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4 select-none animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-slate-150 overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="bg-slate-50 border-b border-slate-100 px-5 py-4 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-indigo-600" />
                <span>Pratinjau Berkas Bundle: <span className="font-mono font-black">{selectedBundle.nomorBundle}</span></span>
              </h3>
              <button
                onClick={() => {
                  setShowPreviewBundleModal(false);
                }}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 flex flex-col gap-4 text-xs max-h-[60vh] overflow-y-auto">
              <div className="flex flex-col gap-1 border-b border-slate-100 pb-2 mb-2">
                <span className="text-[10px] text-slate-400 font-extrabold capitalize tracking-wider">Tipe Permohonan</span>
                <span className="font-bold text-slate-700 capitalize">{selectedBundle.jenisPermohonan?.replace(/_/g, " ").toLowerCase() || "Campuran / Umum"}</span>
              </div>

              <div className="flex flex-col gap-2">
                <h4 className="text-xs font-black text-slate-500 capitalize tracking-widest mb-1 select-none">
                  Daftar Permohonan ({selectedBundle.permohonan?.length || 0})
                </h4>
                {selectedBundle.permohonan?.map((p: any) => (
                  <div key={p.id} className="p-3.5 bg-slate-50 border border-slate-150 rounded-xl text-xs flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">NOP: {formatNop(p.nop)}</span>
                      <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full capitalize">
                        {p.status}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      Wajib Pajak: <span className="font-bold text-slate-700">{p.namaWajibPajak}</span> • WA: {p.noWhatsapp}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-100 px-5 py-3.5 flex items-center justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowPreviewBundleModal(false);
                }}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: AJUKAN KEMBALIKAN KE PENGARSIP ================= */}
      {showCorrectionModal && correctionTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4 select-none animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-150 overflow-hidden animate-scaleUp">

            {/* Modal Header */}
            <div className="bg-slate-50 border-b border-slate-100 px-5 py-4 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-red-500 animate-pulse" />
                Kembalikan ke Pengarsip
              </h3>
              <button
                onClick={() => {
                  setShowCorrectionModal(false);
                  setCorrectionTarget(null);
                }}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleRequestCorrection}>
              <div className="p-5 flex flex-col gap-4 text-xs">
                <div className="p-3.5 bg-red-50/50 border border-red-100 rounded-xl leading-relaxed text-red-800 font-medium">
                  <p>
                    Anda mengajukan pengembalian <strong>koreksi major</strong> untuk berkas NOP: <strong>{formatNop(correctionTarget.nop)}</strong> kembali ke Pengarsip.
                  </p>
                  <p className="text-[10px] text-red-650 mt-1.5 font-bold">
                    * Tindakan ini memerlukan persetujuan Supervisor dan akan mem-freeze permohonan hingga disetujui.
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="catatan-koreksi" className="font-extrabold text-gray-755">
                    Alasan pengembalian berkas <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="catatan-koreksi"
                    rows={4}
                    value={correctionReason}
                    onChange={(e) => setCorrectionReason(e.target.value)}
                    placeholder="Masukkan alasan detail kesalahan arsip digital (misalnya: kualitas scan buram, halaman halaman terpotong, berkas salah diunggah, dll.)"
                    className="w-full bg-slate-50 border border-slate-200 hover:border-slate-350 focus:outline-none focus:border-indigo-500 focus:bg-white text-xs font-semibold rounded-xl px-3 py-2.5 transition-all text-gray-800 shadow-inner"
                    required
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="bg-slate-50 border-t border-slate-100 px-5 py-3.5 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowCorrectionModal(false);
                    setCorrectionTarget(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading || !correctionReason.trim()}
                  className="px-4 py-2 text-xs font-bold text-white bg-red-650 hover:bg-red-700 active:scale-95 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Ajukan pengembalian
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
