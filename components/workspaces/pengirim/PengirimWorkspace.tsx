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
  Calendar,
  FileSpreadsheet,
  ChevronRight,
  Star,
  Boxes,
  ArrowRight,
  Printer,
  Check,
  ChevronLeft,
  Unlock,
  Send,
  Layers,
  Slash,
  CircleArrowLeft
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
import { DetailsModal } from "@/components/workspaces/shared/DetailsModal";

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

const getAbbreviatedJenis = (jenis: string) => {
  switch (jenis) {
    case 'OBJEK_PAJAK_BARU':
      return 'OPB';
    case 'MUTASI_SEBAGIAN':
      return 'MS';
    case 'MUTASI_HABIS_REGULER':
      return 'MHR';
    case 'MUTASI_HABIS_UPDATE':
      return 'MHU';
    case 'PEMBETULAN':
      return 'PBT';
    case 'PENGAKTIFAN':
      return 'AKT';
    default:
      return jenis?.replace(/_/g, " ") || 'Umum';
  }
};

const getAvatarInitials = (name?: string) => {
  if (!name) return 'PG';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

export default function PengirimWorkspace() {
  const { showConfirm } = useDashboard();
  // Local tabs: 'daftar-manifest' | 'kelola-pengiriman'
  const [workspaceTab, setWorkspaceTab] = useState<"daftar-manifest" | "kelola-pengiriman">("daftar-manifest");

  // Lists and Selected States
  const [manifestsList, setManifestsList] = useState<any[]>([]);
  const [eligibleBundlesList, setEligibleBundlesList] = useState<any[]>([]);
  const [selectedManifest, setSelectedManifest] = useState<any | null>(null);
  const [selectedBundleInManifest, setSelectedBundleInManifest] = useState<any | null>(null);

  // Sync selectedBundleInManifest when selectedManifest changes
  useEffect(() => {
    if (selectedManifest?.bundle && selectedManifest.bundle.length > 0) {
      const exists = selectedManifest.bundle.find((b: any) => b.id === selectedBundleInManifest?.id);
      if (exists) {
        setSelectedBundleInManifest(exists);
      } else {
        setSelectedBundleInManifest(selectedManifest.bundle[0]);
      }
    } else {
      setSelectedBundleInManifest(null);
    }
  }, [selectedManifest]);

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
  const [selectedPermohonanForDetails, setSelectedPermohonanForDetails] = useState<any | null>(null);

  // Pagination states
  const [currentManifestPage, setCurrentManifestPage] = useState(1);
  const [itemsPerManifestPage, setItemsPerManifestPage] = useState(8);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const searchManifestInputRef = useRef<HTMLInputElement | null>(null);

  const fetchInitialData = async (silent = false) => {
    if (!silent) setListLoading(true);
    setError("");
    try {
      const manifestsRes = await getManifests();
      const bundlesRes = await getEligibleBundles();

      if (manifestsRes.success) {
        const fetchedManifests = manifestsRes.list || [];
        setManifestsList(fetchedManifests);

        if (selectedManifest) {
          const detailRes = await getManifestDetails(selectedManifest.id);
          if (detailRes.success && detailRes.manifest) {
            setSelectedManifest(detailRes.manifest);
            if (selectedBundleInManifest) {
              const updatedBundle = (detailRes.manifest.bundle || []).find((b: any) => b.id === selectedBundleInManifest.id);
              setSelectedBundleInManifest(updatedBundle || null);
            }
          }
        }
      }
      if (bundlesRes.success) {
        setEligibleBundlesList(bundlesRes.list || []);
      }
    } catch (err) {
      setError("Kesalahan koneksi ke server.");
    } finally {
      if (!silent) setListLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Reset pagination when search changes
  useEffect(() => {
    setCurrentManifestPage(1);
  }, [searchQuery]);

  const handleSelectManifest = (manifest: any) => {
    // Instant synchronous state update for 0ms click delay
    setSelectedManifest(manifest);
    setError("");
    setSuccess("");

    // Silent background fetch to refresh details without blocking UI
    getManifestDetails(manifest.id).then((res) => {
      if (res.success && res.manifest) {
        setSelectedManifest(res.manifest);
      }
    }).catch(() => { });
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
        await fetchInitialData(true);
        if (res.manifest) {
          // Select newly created manifest
          const detail = await getManifestDetails(res.manifest.id);
          if (detail.success) {
            setSelectedManifest(detail.manifest);
            setWorkspaceTab("kelola-pengiriman");
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

  // Add Bundle to Manifest (Instant Optimistic Update + Silent Refresh)
  const handleAddBundle = async (bundleId: string) => {
    if (!selectedManifest) return;
    setError("");
    setSuccess("");

    // Find target bundle in eligible list
    const targetBundle = eligibleBundlesList.find((b) => b.id === bundleId);
    if (!targetBundle) return;

    // Instant 0ms optimistic UI updates
    setEligibleBundlesList((prev) => prev.filter((b) => b.id !== bundleId));

    const updatedBundles = [...(selectedManifest.bundle || []), targetBundle];
    const updatedSelectedManifest = { ...selectedManifest, bundle: updatedBundles };
    setSelectedManifest(updatedSelectedManifest);

    // Update manifest item in manifestsList
    setManifestsList((prev) =>
      prev.map((m) => (m.id === selectedManifest.id ? updatedSelectedManifest : m))
    );

    try {
      const res: any = await addBundleToManifest(selectedManifest.id, bundleId);
      if (res.success) {
        setSuccess("Bundle berhasil ditambahkan ke dalam manifest!");
        // Refresh server sync silently without triggering page loading skeleton
        await fetchInitialData(true);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(res.error || "Gagal menambahkan bundle.");
        await fetchInitialData(true);
      }
    } catch (err: any) {
      setError(err.message || "Sistem error saat menambahkan bundle.");
      await fetchInitialData(true);
    }
  };

  // Remove Bundle from Manifest (Instant Optimistic Update + Silent Refresh)
  const handleRemoveBundle = async (bundleId: string) => {
    if (!selectedManifest) return;
    setError("");
    setSuccess("");

    // Find target bundle in selectedManifest
    const targetBundle = (selectedManifest.bundle || []).find((b: any) => b.id === bundleId);

    // Instant 0ms optimistic UI updates
    const updatedBundles = (selectedManifest.bundle || []).filter((b: any) => b.id !== bundleId);
    const updatedSelectedManifest = { ...selectedManifest, bundle: updatedBundles };
    setSelectedManifest(updatedSelectedManifest);

    if (selectedBundleInManifest?.id === bundleId) {
      setSelectedBundleInManifest(null);
    }

    if (targetBundle) {
      setEligibleBundlesList((prev) => [targetBundle, ...prev]);
    }

    // Update manifest item in manifestsList
    setManifestsList((prev) =>
      prev.map((m) => (m.id === selectedManifest.id ? updatedSelectedManifest : m))
    );

    try {
      const res: any = await removeBundleFromManifest(selectedManifest.id, bundleId);
      if (res.success) {
        setSuccess("Bundle berhasil dilepas dari manifest!");
        // Refresh server sync silently without triggering page loading skeleton
        await fetchInitialData(true);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(res.error || "Gagal melepas bundle.");
        await fetchInitialData(true);
      }
    } catch (err: any) {
      setError(err.message || "Sistem error saat melepas bundle.");
      await fetchInitialData(true);
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
            await fetchInitialData(true);
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
            await fetchInitialData(true);
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

  // Count for breadcrumb badge
  const currentActiveCount = workspaceTab === "daftar-manifest"
    ? filteredManifests.length
    : selectedManifest?.bundle?.length ?? 0;

  // Early return: full skeleton while loading
  if (listLoading) return <PengirimSkeleton />;

  return (
    <div id="pengirim-board-root" className="w-full font-sans select-none flex flex-col gap-6 animate-fadeIn">
      {/* ── Card 1: Header card — Peneliti/Penginput style ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] p-5 rounded-2xl shadow-md transition-all duration-300">
        {/* Left: Breadcrumb navigation pill */}
        <div className="flex items-center justify-center sm:justify-start w-full sm:w-auto select-none">
          <div className="flex items-center gap-1 sm:gap-1.5 bg-white/30 border border-white/40 p-0.5 sm:p-1 rounded-lg sm:rounded-xl shadow-xs">
            {/* Root node */}
            <div
              onClick={() => setWorkspaceTab("daftar-manifest")}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg border border-slate-400/10 cursor-pointer transition-all duration-150 hover:bg-white/25 active:scale-95 text-slate-700/70"
            >
              <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
              <span className="text-[11px] sm:text-[12px] font-bold">Tugas Saya</span>
            </div>

            {/* Slash Separator */}
            <Slash className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-500/25 -rotate-[12deg]" />

            {/* Active tab pill */}
            <div className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-md sm:rounded-lg border border-violet-500/30 bg-white/70 cursor-default shadow-3xs">
              <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-violet-600 shadow-[0_0_5px_#7c3aed]" />
              <span className="text-[11px] sm:text-[12px] text-violet-800 font-extrabold tracking-wide">
                {workspaceTab === "daftar-manifest" ? "Daftar Manifest" : "Kelola Pengiriman"}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Tab Switcher — 2 tabs */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <div className="bg-black/10 p-1 rounded-xl border border-black/5 flex items-center gap-1 shadow-3xs">
            <button
              onClick={() => setWorkspaceTab("daftar-manifest")}
              className={`px-3.5 py-1.5 rounded-lg text-[11px] font-extrabold transition-all duration-300 flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${workspaceTab === "daftar-manifest"
                ? "bg-white text-[#2c333f] shadow-xs"
                : "text-[#2c333f]/75 hover:text-[#2c333f] hover:bg-white/10"
                }`}
            >
              <span>Daftar Manifest</span>
            </button>
            <button
              onClick={() => setWorkspaceTab("kelola-pengiriman")}
              className={`px-3.5 py-1.5 rounded-lg text-[11px] font-extrabold transition-all duration-300 flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${workspaceTab === "kelola-pengiriman"
                ? "bg-white text-[#2c333f] shadow-xs"
                : "text-[#2c333f]/75 hover:text-[#2c333f] hover:bg-white/10"
                }`}
            >
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-300/90 pb-4 select-none">
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
                <span>Buat</span>
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
                  <span>{st === 'ALL' ? 'Semua' : st.charAt(0).toUpperCase() + st.slice(1).toLowerCase()}</span>
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
                const totalPecahanCount = (m.bundle || []).reduce((bAcc: number, b: any) => {
                  const bPecahan = (b.permohonan || []).reduce((pAcc: number, p: any) => {
                    if (p.jenisPermohonan === "MUTASI_SEBAGIAN") {
                      return pAcc + (p.dataBaru?.length || 1);
                    }
                    return pAcc + 1;
                  }, 0);
                  return bAcc + bPecahan;
                }, 0);

                return (
                  <div
                    key={m.id}
                    onClick={() => handleSelectManifest(m)}
                    className={`p-4 rounded-2xl border flex flex-col justify-between gap-3.5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer relative overflow-hidden group select-none min-h-[140px] bg-white ${isSelected
                      ? "border-indigo-400 shadow-md ring-2 ring-indigo-500/10"
                      : "border-slate-200 hover:border-slate-350 hover:shadow-sm"
                      }`}
                  >
                    {/* Top Row: Manifest Number & Status Badge */}
                    <div className="flex items-center justify-between gap-2 w-full">
                      <span className="text-xs font-bold text-slate-800 font-mono tracking-tight truncate">
                        {highlightText(m.nomorManifest, searchQuery)}
                      </span>

                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold border leading-none uppercase tracking-wider shrink-0 ${m.status === 'LOCKED'
                        ? 'bg-amber-100 text-amber-800 border-amber-200'
                        : m.status === 'SENT'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : 'bg-indigo-100 text-indigo-800 border-indigo-200'
                        }`}>
                        <span>{m.status}</span>
                      </span>
                    </div>

                    {/* Middle (Body): 2 Columns divided by vertical line separator */}
                    <div className="py-2 px-1 bg-slate-50/70 rounded-xl border border-slate-100/80 flex items-center text-[10px]">
                      {/* Left Column: Jumlah Bundle */}
                      <div className="flex-1 flex items-center justify-center font-extrabold text-indigo-700">
                        <span>{bundlesCount} Bundle</span>
                      </div>

                      {/* Vertical Line Separator */}
                      <div className="w-px h-3.5 bg-slate-200/90 shrink-0" />

                      {/* Right Column: Total Berkas */}
                      <div className="flex-1 flex items-center justify-center font-semibold text-slate-600">
                        <span>{totalPecahanCount} Berkas</span>
                      </div>
                    </div>

                    {/* Bottom Row (Footer - 100% Exact match with Pemantau Bundle Card): Pengirim avatar + tanggal */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100/60">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-5.5 h-5.5 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-white text-[8px] font-black flex items-center justify-center shrink-0 shadow-sm" title={m.pengirim?.name}>
                          {getAvatarInitials(m.pengirim?.name)}
                        </div>
                        <span className="text-[9px] font-semibold text-slate-400 truncate max-w-[110px]" title={m.pengirim?.name}>
                          {m.pengirim?.name || 'Petugas Pengirim'}
                        </span>
                      </div>

                      <span className="text-[9.5px] font-semibold text-slate-400 flex items-center gap-1 shrink-0">
                        <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                        {m.updatedAt ? new Date(m.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </span>
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

      {/* ==================== TAB: KELOLA PENGIRIMAN ==================== */}
      {workspaceTab === "kelola-pengiriman" && (
        <div className="w-full">
          {!selectedManifest ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-20 text-slate-400 select-none bg-white p-8 rounded-2xl border border-slate-200 shadow-3xs min-h-[300px]">
              <Truck className="w-12 h-12 text-slate-350 mb-3 animate-pulse" />
              <h3 className="text-sm font-bold text-slate-700 mb-1">Pilih Manifest Terlebih Dahulu</h3>
              <p className="text-xs text-gray-400 font-semibold max-w-sm">
                Silakan pilih salah satu manifest di tab <strong>Daftar Manifest</strong> terlebih dahulu untuk mengelola pengiriman map bundle.
              </p>
            </div>
          ) : (
            /* Master-Detail Split Panel Layout (99% Identik dengan Tab Daftar Pantau Pemantau) */
            <div className="bg-[#dde3ea] border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6 min-h-[500px]">

              {/* Top Header Row */}
              <div className="flex items-center justify-between gap-4 border-b border-slate-300/90 pb-4 select-none">
                <div>
                  <h2 className="font-extrabold text-[13px] capitalize tracking-wider text-slate-700 font-display flex items-center gap-2">
                    <span className="font-mono font-black text-slate-900 text-sm">{selectedManifest.nomorManifest}</span>
                  </h2>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                    Pilih map bundle pada daftar di atas untuk meninjau detail berkas permohonan dan status pengiriman.
                  </p>
                </div>
              </div>

              {/* Error & Success Banners */}
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

              {/* Top Row Grid: 2 Columns Side-by-Side (Antrean Bundle & Map Bundle Terpasang - Symmetric Fixed Height h-[420px]) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">

                {/* ── KIRI: Antrean Bundle Tersedia ── */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-3 h-[420px]">
                  <div className="flex items-center justify-between shrink-0 border-b border-slate-100 pb-3">
                    <h4 className="text-xs font-black text-slate-700 capitalize tracking-wider select-none flex items-center gap-2">
                      <span>Antrean Bundle</span>
                      <span className="bg-slate-100 text-slate-600 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-slate-200">
                        {eligibleBundlesList.length}
                      </span>
                    </h4>
                  </div>

                  <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto pr-1 scrollbar-thin">
                    {eligibleBundlesList.length === 0 ? (
                      <div className="my-auto py-6 px-4 flex flex-col items-center justify-center text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200 select-none gap-2">
                        <img
                          src="/empty-box.png"
                          alt="Empty Box"
                          className="w-14 h-14 object-contain opacity-85 hover:scale-105 transition-transform duration-300 drop-shadow-xs"
                        />
                        <div className="flex flex-col gap-0.5">
                          <p className="text-xs font-bold text-slate-600">Antrean Bundle Kosong</p>
                          <p className="text-[10px] text-slate-400 font-medium">Tidak ada map bundle locked terarsip di antrean.</p>
                        </div>
                      </div>
                    ) : (
                      eligibleBundlesList.map((b) => {
                        const bTotalPecahan = (b.permohonan || []).reduce((acc: number, p: any) => {
                          if (p.jenisPermohonan === "MUTASI_SEBAGIAN") {
                            return acc + (p.dataBaru?.length || 1);
                          }
                          return acc + 1;
                        }, 0);

                        return (
                          <div
                            key={b.id}
                            className="p-3.5 sm:p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl text-xs flex flex-col justify-between gap-3 hover:border-indigo-300 transition-all select-none shrink-0 min-h-[76px]"
                          >
                            {/* Top Row: Nomor Bundle (Top-Left) & Red Circle Count Badge (Top-Right) */}
                            <div className="flex items-center justify-between gap-3 w-full">
                              <span className="text-xs font-bold text-slate-800 font-mono tracking-tight truncate">
                                {b.nomorBundle}
                              </span>
                              <span className="flex items-center justify-center bg-[#f25c54] text-white text-[10px] font-black w-5 h-5 rounded-full shrink-0 shadow-2xs" title={`${bTotalPecahan} Berkas`}>
                                {bTotalPecahan}
                              </span>
                            </div>

                            {/* Bottom Row: Jenis Badge (Bottom-Left) & "Masukkan" Button (Bottom-Right) */}
                            <div className="flex items-center justify-between gap-3 w-full">
                              <span className="bg-indigo-50 text-indigo-700 text-[9px] font-extrabold px-2 py-0.5 rounded-md border border-indigo-200/60 uppercase leading-none shrink-0">
                                {getAbbreviatedJenis(b.jenisPermohonan)}
                              </span>

                              {selectedManifest.status === "DRAFT" && (
                                <button
                                  onClick={() => handleAddBundle(b.id)}
                                  disabled={loading}
                                  className="py-1 px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10px] rounded-lg transition-all active:scale-95 cursor-pointer flex items-center gap-1 shadow-2xs shrink-0"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* ── KANAN: Map Bundle Terpasang Dalam Manifest ── */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-3 h-[420px]">
                  <div className="flex items-center justify-between shrink-0 border-b border-slate-100 pb-3">
                    <h4 className="text-xs font-black text-slate-700 capitalize tracking-wider select-none flex items-center gap-2">
                      <span>Bundle Terpasang</span>
                      <span className="bg-indigo-50 text-indigo-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-indigo-200">
                        {(selectedManifest.bundle || []).length}
                      </span>
                    </h4>
                  </div>

                  <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto pr-1 scrollbar-thin">
                    {selectedManifest.bundle?.length === 0 ? (
                      <div className="my-auto py-6 px-4 flex flex-col items-center justify-center text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200 select-none gap-2">
                        <img
                          src="/empty-box.png"
                          alt="Empty Box"
                          className="w-14 h-14 object-contain opacity-85 hover:scale-105 transition-transform duration-300 drop-shadow-xs"
                        />
                        <div className="flex flex-col gap-0.5">
                          <p className="text-xs font-bold text-slate-600">Belum Ada Bundle Terpasang</p>
                          <p className="text-[10px] text-slate-400 font-medium">Belum ada map bundle yang terpasang dalam manifest ini.</p>
                        </div>
                      </div>
                    ) : (
                      selectedManifest.bundle.map((b: any) => {
                        const isSelectedBundle = selectedBundleInManifest?.id === b.id;
                        const bTotalPecahan = (b.permohonan || []).reduce((acc: number, p: any) => {
                          if (p.jenisPermohonan === "MUTASI_SEBAGIAN") {
                            return acc + (p.dataBaru?.length || 1);
                          }
                          return acc + 1;
                        }, 0);

                        return (
                          <div
                            key={b.id}
                            onClick={() => setSelectedBundleInManifest(b)}
                            className={`p-3.5 sm:p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 relative overflow-hidden select-none shrink-0 min-h-[76px] ${isSelectedBundle
                              ? "bg-white border-indigo-500 shadow-md ring-2 ring-indigo-500/20 translate-x-0.5"
                              : "bg-slate-50/60 border-slate-200 hover:border-slate-300 hover:bg-white"
                              }`}
                          >
                            {/* Left Active Indicator Strip */}
                            {isSelectedBundle && (
                              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-600 rounded-l-xl" />
                            )}

                            {/* Top Row: Nomor Bundle (Top-Left) & Red Circle Count Badge (Top-Right) */}
                            <div className="flex items-center justify-between gap-3 w-full">
                              <span className="text-xs font-bold text-slate-800 font-mono tracking-tight truncate">
                                {b.nomorBundle}
                              </span>
                              <span className="flex items-center justify-center bg-[#f25c54] text-white text-[10px] font-black w-5 h-5 rounded-full shrink-0 shadow-2xs" title={`${bTotalPecahan} Berkas`}>
                                {bTotalPecahan}
                              </span>
                            </div>

                            {/* Bottom Row: Jenis Badge (Bottom-Left) & Date (Bottom-Right) */}
                            <div className="flex items-center justify-between gap-3 w-full">
                              <span className="bg-indigo-50 text-indigo-700 text-[9px] font-extrabold px-2 py-0.5 rounded-md border border-indigo-200/60 uppercase leading-none shrink-0">
                                {getAbbreviatedJenis(b.jenisPermohonan)}
                              </span>
                              <span className="text-slate-400 font-semibold text-[9.5px] flex items-center gap-1 shrink-0">
                                <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                                {b.updatedAt ? new Date(b.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '—'}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>

              {/* ── BARIS BAWAH: CARD DETAIL SELEBAR LAYAR (FULL WIDTH) ── */}
              <div className="w-full">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-5 shadow-sm animate-fadeIn">

                  {/* Detail Header (Selalu Tampil) */}
                  <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3.5 select-none">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black text-slate-700 capitalize tracking-wider select-none">
                        Daftar Berkas Permohonan Dalam Bundle
                      </h4>
                    </div>

                    {/* Header Actions (Hanya jika bundle terpilih) */}
                    {selectedBundleInManifest && (
                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={`/api/export/bundle/${selectedBundleInManifest.id}`}
                          download
                          className="p-2 text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 rounded-xl transition-all shadow-3xs cursor-pointer flex items-center justify-center"
                          title="Ekspor daftar permohonan ke Excel"
                        >
                          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                        </a>

                        {selectedManifest.status === "DRAFT" && (
                          <button
                            onClick={() => handleRemoveBundle(selectedBundleInManifest.id)}
                            disabled={loading}
                            className="p-2 text-red-650 hover:text-red-700 bg-red-50 hover:bg-red-100/80 border border-red-200/80 rounded-xl transition-all cursor-pointer shadow-3xs flex items-center justify-center disabled:opacity-40"
                            title="Keluarkan bundle dari manifest"
                          >
                            <Trash className="w-4 h-4 text-red-600" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Body Content: Tabel atau Empty State dengan Asset choose-topic.png */}
                  {selectedBundleInManifest ? (
                    <div className="flex flex-col gap-3">
                      <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white shadow-3xs flex flex-col">
                        <div className="overflow-x-auto scrollbar-thin max-h-[380px]">
                          <table className="w-full text-left border-collapse select-none">
                            <thead>
                              <tr className="bg-slate-50 text-[10px] font-extrabold text-slate-600 capitalize tracking-wider text-left border-b border-slate-200 sticky top-0 z-10 shadow-2xs">
                                <th className="py-3 px-5 text-center w-12 min-w-[48px]">No</th>
                                <th className="py-3 px-2 text-center select-none w-10 min-w-[40px]">⭐</th>
                                <th className="py-3 px-5 min-w-[110px]">Tgl. Nopel</th>
                                <th className="py-3 px-5 min-w-[110px]">Tgl. Selesai</th>
                                <th className="py-3 px-5 min-w-[160px]">No. Pelayanan</th>
                                <th className="py-3 px-5 min-w-[180px]">Nomor Objek Pajak</th>
                                <th className="py-3 px-5 min-w-[150px]">Nama Pemohon</th>
                                <th className="py-3 px-5 min-w-[120px]">Jenis Layanan</th>
                                <th className="py-3 px-5 text-center min-w-[100px]">Status</th>
                                <th className="py-3 px-5 text-right pr-6 w-24 min-w-[96px]">Aksi</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                              {(!selectedBundleInManifest.permohonan || selectedBundleInManifest.permohonan.length === 0) ? (
                                <tr>
                                  <td colSpan={10} className="py-12 text-center text-xs text-slate-400 font-semibold italic bg-slate-50/50">
                                    Tidak ada berkas permohonan di dalam bundle ini.
                                  </td>
                                </tr>
                              ) : (
                                selectedBundleInManifest.permohonan.map((p: any, idx: number) => {
                                  const isFrozen = p.permintaanKoreksi && p.permintaanKoreksi.length > 0;
                                  const tglNopelText = p.tanggalNoPelayanan
                                    ? new Date(p.tanggalNoPelayanan).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                                    : '—';
                                  const tglSelesaiText = p.tanggalPenyelesaian
                                    ? new Date(p.tanggalPenyelesaian).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                                    : '—';

                                  return (
                                    <tr
                                      key={p.id}
                                      onClick={() => setSelectedPermohonanForDetails(p)}
                                      className={`transition-colors duration-150 text-xs cursor-pointer ${isFrozen
                                        ? 'border-l-2 border-l-amber-400 bg-amber-50/30 hover:bg-amber-50/60'
                                        : 'hover:bg-slate-50'
                                        }`}
                                    >
                                      <td className="py-4 px-5 text-center text-xs font-bold text-slate-500 font-mono">
                                        {idx + 1}
                                      </td>
                                      <td className="py-4 px-2 text-center select-none" onClick={(e) => e.stopPropagation()}>
                                        <Star className={`w-4 h-4 mx-auto ${p.isFavorite
                                          ? 'text-amber-500 fill-amber-500 drop-shadow-[0_0_6px_rgba(245,158,11,0.55)]'
                                          : 'text-slate-300'
                                          }`} />
                                      </td>
                                      <td className="py-4 px-5 text-xs font-semibold text-slate-500 whitespace-nowrap">
                                        {tglNopelText}
                                      </td>
                                      <td className="py-4 px-5 text-xs font-semibold text-slate-500 whitespace-nowrap">
                                        {tglSelesaiText}
                                      </td>
                                      <td className="py-4 px-5 text-xs font-mono font-bold text-slate-800 whitespace-nowrap">
                                        {p.nomorPelayanan || '—'}
                                      </td>
                                      <td className="py-4 px-5 text-xs font-mono font-bold text-slate-700 whitespace-nowrap">
                                        {formatNop(p.nop)}
                                      </td>
                                      <td className="py-4 px-5 text-xs font-semibold text-slate-700 capitalize max-w-[180px] truncate">
                                        {p.namaWajibPajak?.toLowerCase() || '—'}
                                      </td>
                                      <td className="py-4 px-5 whitespace-nowrap">
                                        <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-extrabold border leading-none uppercase ">
                                          {getAbbreviatedJenis(p.jenisPermohonan || selectedBundleInManifest.jenisPermohonan)}
                                        </span>
                                      </td>
                                      <td className="py-4 px-5 text-center whitespace-nowrap">
                                        {isFrozen ? (
                                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200 select-none">
                                            <Clock className="w-2.5 h-2.5 text-amber-600 animate-spin" />
                                            Frozen
                                          </span>
                                        ) : (
                                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold capitalize select-none ${p.status === "ARCHIVED" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-sky-100 text-sky-800 border border-sky-200"
                                            }`}>
                                            {p.status}
                                          </span>
                                        )}
                                      </td>
                                      <td className="py-4 px-5 text-right pr-6 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-end gap-2">
                                          {!isFrozen && p.status === "ARCHIVED" && (
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                openCorrectionModal(p);
                                              }}
                                              className="py-1 px-2.5 text-[9.5px] font-bold text-slate-600 hover:text-red-700 bg-white hover:bg-red-50 border border-slate-200 rounded-lg transition-all cursor-pointer shadow-3xs"
                                              title="Kembalikan ke Pengarsip untuk upload ulang scan digital"
                                            >
                                              <CircleArrowLeft className="w-3.5 h-3.5" />
                                            </button>
                                          )}

                                          {selectedManifest.status === "SENT" && (
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleReportBundleLost(selectedBundleInManifest.id, selectedBundleInManifest.nomorBundle);
                                              }}
                                              disabled={loading}
                                              className="py-1 px-2 text-[9.5px] font-bold text-red-650 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-all cursor-pointer flex items-center gap-1 shadow-3xs"
                                              title="Laporkan hilang"
                                            >
                                              <AlertTriangle className="w-3 h-3" />
                                              <span>Hilang</span>
                                            </button>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-10 px-4 flex flex-col items-center justify-center text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200 select-none gap-3 animate-fadeIn">
                      <img
                        src="/choose-topic.png"
                        alt="Pilih Bundle"
                        className="w-20 h-20 object-contain opacity-85 hover:scale-105 transition-transform duration-300 drop-shadow-xs"
                      />
                      <div className="flex flex-col gap-1 max-w-sm">
                        <p className="text-xs font-extrabold text-slate-700">Pilih Map Bundle</p>
                        <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                          Silakan pilih salah satu map bundle pada daftar di atas untuk menampilkan tabel detail berkas permohonan.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Sticky Action Bar Footer */}
              <div className="border border-slate-200/80 bg-white p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none shadow-sm mt-auto">
                {/* Left helper description */}
                <div className="text-[11px] text-slate-500 font-bold max-w-lg flex items-center gap-2">
                  {selectedManifest.status === "DRAFT" && (
                    <span>Masukkan map bundle terlebih dahulu lalu klik <strong>Kunci Manifest</strong> untuk siap dikirim.</span>
                  )}
                  {selectedManifest.status === "LOCKED" && (
                    <span>Cetak surat pengantar manifest dan unggah bukti tanda terima untuk menyelesaikan pengiriman.</span>
                  )}
                  {selectedManifest.status === "SENT" && (
                    <span>Pengiriman manifest telah selesai. Anda dapat meninjau bukti tanda terima atau mengelola berkas.</span>
                  )}
                </div>

                {/* Right Action Buttons (Icon-Only Buttons with Tooltips) */}
                <div className="flex items-center gap-2 justify-end shrink-0 flex-wrap">
                  {/* DRAFT Actions */}
                  {selectedManifest.status === "DRAFT" && (
                    <button
                      onClick={handleLockManifest}
                      disabled={loading || selectedManifest.bundle?.length === 0}
                      className="p-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Kunci Manifest"
                    >
                      <Lock className="w-4 h-4 text-white" />
                    </button>
                  )}

                  {/* LOCKED Actions */}
                  {selectedManifest.status === "LOCKED" && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={handleRevisiManifest}
                        disabled={loading}
                        className="p-2.5 text-red-650 hover:text-red-700 bg-red-50 hover:bg-red-100/80 border border-red-200/80 rounded-xl transition-all cursor-pointer shadow-3xs flex items-center justify-center disabled:opacity-40"
                        title="Batal Kunci Manifest"
                      >
                        <Unlock className="w-4 h-4 text-red-600" />
                      </button>

                      <a
                        href={`/api/pdf/surat-pengantar-manifest/${selectedManifest.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 text-slate-700 hover:text-indigo-700 bg-white border border-slate-200/90 hover:border-slate-350 rounded-xl transition-all cursor-pointer shadow-3xs flex items-center justify-center"
                        title="Cetak Surat Pengantar Manifest"
                      >
                        <Printer className="w-4 h-4 text-slate-600" />
                      </a>

                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleUploadReceipt}
                        accept="image/*,application/pdf"
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={loading}
                        className="p-2.5 text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center"
                        title="Unggah Bukti Tanda Terima"
                      >
                        <Upload className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  )}

                  {/* SENT Actions */}
                  {selectedManifest.status === "SENT" && selectedManifest.buktiTandaTerima && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <a
                        href={`/api/pdf/surat-pengantar-manifest/${selectedManifest.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 text-slate-700 hover:text-indigo-700 bg-white border border-slate-200/90 hover:border-slate-350 rounded-xl transition-all cursor-pointer shadow-3xs flex items-center justify-center"
                        title="Cetak Surat Pengantar Manifest"
                      >
                        <Printer className="w-4 h-4 text-slate-600" />
                      </a>

                      <a
                        href={selectedManifest.buktiTandaTerima}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 rounded-xl transition-all cursor-pointer shadow-3xs flex items-center justify-center"
                        title="Lihat Bukti Tanda Terima"
                      >
                        <FileCheck className="w-4 h-4 text-emerald-600" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}
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

      {/* Details Modal Overlay */}
      <DetailsModal
        isOpen={!!selectedPermohonanForDetails}
        selectedRequest={selectedPermohonanForDetails}
        onClose={() => setSelectedPermohonanForDetails(null)}
      />
    </div>
  );
}
