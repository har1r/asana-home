"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback, useDeferredValue } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { EmptyDataAnimation } from "@/components/workspaces/shared/EmptyDataAnimation";
import { RevisionAlertBanner } from "@/components/workspaces/shared/RevisionAlertBanner";
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
  CircleArrowLeft,
  Copy
} from "lucide-react";
import { formatNop, toTitleCase } from "@/components/workspaces/shared/constants";
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
import { SkeletonBox, SkeletonText, SkeletonBadge } from "@/components/skeletons/SkeletonBase";
import { DetailsModal } from "@/components/workspaces/shared/DetailsModal";

type WorkspaceTab = "daftar-manifest" | "kelola-pengiriman";

/** Skeleton dasar KPI Strip & Tabs untuk PengirimWorkspace */
function PengirimBaseHeaderSkeleton() {
  return (
    <>
      {/* TIER 1: KPI STATS STRIP (4 Cards) */}
      <div className="bg-white border border-slate-200/90 rounded-md p-1.5 shadow-3xs select-none">
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-3 px-3.5 flex items-center justify-between gap-2 rounded-md">
              <div className="flex flex-col gap-1.5 w-full">
                <SkeletonBox width="w-20" height="h-3" rounded="rounded-sm" />
                <SkeletonBox width="w-12" height="h-5" rounded="rounded-sm" />
              </div>
              <SkeletonBox width="w-8" height="h-4" rounded="rounded-sm" />
            </div>
          ))}
        </div>
      </div>

      {/* TIER 2: VIEW MODE SWITCHER TABS (2 Equal Tabs) */}
      <div className="bg-slate-100/90 border border-slate-200/80 p-1 rounded-md grid grid-cols-2 gap-1 shadow-3xs select-none">
        <SkeletonBox width="w-full" height="h-8" rounded="rounded-md" />
        <SkeletonBox width="w-full" height="h-8" rounded="rounded-md" />
      </div>
    </>
  );
}

/** Skeleton presisi untuk Tab 1: Daftar Manifest */
export function PengirimManifestSkeleton() {
  return (
    <div className="w-full font-sans select-none flex flex-col gap-4 animate-fadeIn">
      <PengirimBaseHeaderSkeleton />

      {/* CARD CONTENT: MANIFEST GRID VIEW */}
      <div className="bg-white border border-slate-200/90 rounded-md p-5 sm:p-6 shadow-3xs flex flex-col gap-6 min-h-[300px]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <SkeletonBox width="w-full md:w-[403px]" height="h-10" rounded="rounded-md" />
          <div className="flex items-center gap-2">
            <SkeletonBox width="w-24" height="h-10" rounded="rounded-md" />
            <SkeletonBox width="w-10" height="h-10" rounded="rounded-md" />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBox key={i} width="w-24" height="h-7" rounded="rounded-full" />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="p-4 rounded-md border border-slate-200/90 bg-white flex flex-col justify-between gap-3.5 min-h-[140px]">
              <div className="flex items-center justify-between gap-2">
                <SkeletonBox width="w-28" height="h-3.5" rounded="rounded-sm" />
                <SkeletonBox width="w-14" height="h-4" rounded="rounded-full" />
              </div>
              <SkeletonBox width="w-full" height="h-9" rounded="rounded-md" />
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <SkeletonBox width="w-24" height="h-3" rounded="rounded-sm" />
                <SkeletonBox width="w-16" height="h-3" rounded="rounded-sm" />
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 py-3.5 border border-slate-200/80 bg-slate-50 flex items-center justify-between mt-auto rounded-md">
          <SkeletonText width="w-36" height="h-3" />
          <SkeletonBox width="w-32" height="h-7" rounded="rounded-md" />
        </div>
      </div>
    </div>
  );
}

/** Skeleton presisi untuk Tab 2: Kelola Pengiriman */
export function PengirimKelolaSkeleton() {
  return (
    <div className="w-full font-sans select-none flex flex-col gap-4 animate-fadeIn">
      <PengirimBaseHeaderSkeleton />

      <div className="bg-white border border-slate-200/90 rounded-md p-5 sm:p-6 shadow-3xs flex flex-col gap-6 min-h-[500px]">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <SkeletonBox width="w-48" height="h-5" rounded="rounded-sm" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200/90 rounded-md p-5 shadow-3xs flex flex-col gap-3 h-[420px]">
            <SkeletonBox width="w-36" height="h-4" rounded="rounded-sm" />
            <div className="flex flex-col gap-2.5 mt-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonBox key={i} width="w-full" height="h-16" rounded="rounded-md" />
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-md p-5 shadow-3xs flex flex-col gap-3 h-[420px]">
            <SkeletonBox width="w-36" height="h-4" rounded="rounded-sm" />
            <div className="flex flex-col gap-2.5 mt-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonBox key={i} width="w-full" height="h-16" rounded="rounded-md" />
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-md border border-slate-200/90 p-5 shadow-3xs flex flex-col gap-3">
          <SkeletonBox width="w-56" height="h-4" rounded="rounded-sm" />
          <SkeletonBox width="w-full" height="h-40" rounded="rounded-md" />
        </div>
      </div>
    </div>
  );
}



const getAbbreviatedJenis = (jenis: string) => {
  switch (jenis) {
    case 'OBJEK_PAJAK_BARU': return 'OPB';
    case 'MUTASI_SEBAGIAN': return 'MS';
    case 'MUTASI_HABIS_REGULER': return 'MHR';
    case 'MUTASI_HABIS_UPDATE': return 'MHU';
    case 'PEMBETULAN': return 'PBT';
    case 'PENGAKTIFAN': return 'AKT';
    default: return jenis?.replace(/_/g, " ") || 'Umum';
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

const getStatusLabel = (status: string) => {
  if (!status) return '—';
  if (STATUS_LABEL_MAP[status]) return STATUS_LABEL_MAP[status];
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'SUBMITTED':
      return 'bg-[#00a389]/10 text-[#008f78] border-[#00a389]/20';
    case 'REVISION':
      return 'bg-amber-100 text-amber-800 border-amber-200/50 animate-pulse';
    case 'BUNDLED':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200/50';
    case 'LOCKED':
      return 'bg-slate-900 text-slate-100 border-slate-700';
    case 'IN_MANIFEST':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200/50';
    case 'ARCHIVED':
      return 'bg-teal-100 text-[#008f78] border-teal-200/50';
    case 'COMPLETED':
      return 'bg-sky-100 text-sky-800 border-sky-200/50';
    case 'REJECTED':
      return 'bg-rose-100 text-rose-800 border-rose-200/50';
    case 'SENT':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200/50';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200/50';
  }
};

const getShortBundleNum = (bundleNum: string) => {
  if (!bundleNum) return '—';
  const parts = bundleNum.split('/');
  return parts.length >= 2 ? parts[1] : bundleNum;
};

const cleanPecahanSuffix = (name?: string | null): string => {
  if (!name) return '';
  return name
    .replace(/\s*\([^)]*pecahan[^)]*\)/gi, '')
    .replace(/\s*\(Pecahan\s*\d+\)/gi, '')
    .replace(/\s*Pecahan\s*\d+/gi, '')
    .trim();
};

const isOverdue = (tanggalPenyelesaian?: string | null, status?: string) => {
  if (!tanggalPenyelesaian) return false;
  if (status === 'ARCHIVED' || status === 'SENT') return false;
  const now = new Date();
  const target = new Date(tanggalPenyelesaian);
  return target < now;
};

const highlightText = (text: string, query: string) => {
  if (!query.trim()) return text;
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <span key={index} className="bg-amber-200/80 text-slate-900 rounded-[2px] px-0.5 font-bold">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
};

export default function PengirimWorkspace() {
  const { showConfirm } = useDashboard();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read URL query parameter ?tab=...&view=daftar-manifest|kelola-pengiriman
  const viewParam = searchParams.get('view');

  // Workspace Tab State initialized from URL query param
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>(() => {
    if (viewParam === 'kelola-pengiriman') return 'kelola-pengiriman';
    return 'daftar-manifest';
  });

  // Sync workspaceTab when URL query params change (e.g. Browser Back/Forward buttons)
  useEffect(() => {
    if (viewParam === 'kelola-pengiriman') {
      setWorkspaceTab('kelola-pengiriman');
    } else {
      setWorkspaceTab('daftar-manifest');
    }
  }, [viewParam]);

  // Helper to switch workspace tab and update URL query param
  const handleSwitchTab = useCallback((mode: WorkspaceTab) => {
    setWorkspaceTab(mode);
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', mode);
    router.push(`/?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  // Lists and Selected States
  const [manifestsList, setManifestsList] = useState<any[]>([]);
  const [eligibleBundlesList, setEligibleBundlesList] = useState<any[]>([]);
  const [selectedManifest, setSelectedManifest] = useState<any | null>(null);
  const [selectedBundleInManifest, setSelectedBundleInManifest] = useState<any | null>(null);

  // Display Mode & Search for Bundle Permohonan Table
  const [bundleDisplayMode, setBundleDisplayMode] = useState<'berkas' | 'pemohon'>('berkas');
  const [searchBundlePermohonanQuery, setSearchBundlePermohonanQuery] = useState("");

  // Copy Feedback State
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (e: React.MouseEvent, text?: string | null) => {
    e.stopPropagation();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 1500);
  };

  const handleToggleFavorite = (permohonanId: string) => {
    if (selectedBundleInManifest?.permohonan) {
      const updatedPermohonan = selectedBundleInManifest.permohonan.map((p: any) =>
        p.id === permohonanId ? { ...p, isFavorite: !p.isFavorite } : p
      );
      setSelectedBundleInManifest({
        ...selectedBundleInManifest,
        permohonan: updatedPermohonan,
      });
    }
  };

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
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [filterManifestStatus, setFilterManifestStatus] = useState<string>("ALL");
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modals
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [correctionTarget, setCorrectionTarget] = useState<any | null>(null);
  const [correctionReason, setCorrectionReason] = useState("");
  const [selectedPermohonanForDetails, setSelectedPermohonanForDetails] = useState<any | null>(null);

  // Pagination states for manifest grid
  const [currentManifestPage, setCurrentManifestPage] = useState(1);
  const [itemsPerManifestPage, setItemsPerManifestPage] = useState(8);

  // Pagination states for bundle permohonan table
  const [currentBundlePermohonanPage, setCurrentBundlePermohonanPage] = useState(1);
  const [itemsPerBundlePermohonanPage, setItemsPerBundlePermohonanPage] = useState(10);

  // Process Permohonan List according to Display Mode (berkas vs pemohon)
  const processedBundlePermohonanList = useMemo(() => {
    const permohonanList = selectedBundleInManifest?.permohonan || [];

    if (bundleDisplayMode === 'pemohon') {
      const result: any[] = [];
      permohonanList.forEach((p: any) => {
        if (p.jenisPermohonan === 'MUTASI_SEBAGIAN' && p.dataBaru && p.dataBaru.length > 0) {
          p.dataBaru.forEach((db: any, idx: number) => {
            result.push({
              ...p,
              isPecahanRow: true,
              pecahanIndex: idx + 1,
              totalPecahan: p.dataBaru.length,
              displayNamaWajibPajak: cleanPecahanSuffix(db.namaPemilikBaru || p.namaWajibPajak),
              targetDataBaruId: db.id,
              uniqueRowKey: `${p.id}-db-${idx}`
            });
          });
        } else {
          result.push({
            ...p,
            isPecahanRow: false,
            displayNamaWajibPajak: cleanPecahanSuffix(p.namaWajibPajak),
            uniqueRowKey: p.id
          });
        }
      });
      return result;
    }

    return permohonanList.map((p: any) => ({
      ...p,
      isPecahanRow: false,
      displayNamaWajibPajak: cleanPecahanSuffix(p.namaWajibPajak),
      uniqueRowKey: p.id
    }));
  }, [selectedBundleInManifest, bundleDisplayMode]);

  // Filtered Bundle Permohonan List
  const filteredBundlePermohonanList = useMemo(() => {
    if (!searchBundlePermohonanQuery.trim()) return processedBundlePermohonanList;
    const q = searchBundlePermohonanQuery.toLowerCase();
    return processedBundlePermohonanList.filter((p: any) => {
      const nopel = (p.nomorPelayanan || p.nomorPermohonan || '').toLowerCase();
      const nop = (p.nop || '').toLowerCase();
      const nama = (p.displayNamaWajibPajak || p.namaWajibPajak || '').toLowerCase();
      const penginput = (p.penginput?.name || '').toLowerCase();
      return nopel.includes(q) || nop.includes(q) || nama.includes(q) || penginput.includes(q);
    });
  }, [processedBundlePermohonanList, searchBundlePermohonanQuery]);

  // Reset permohonan pagination when search or display mode change
  useEffect(() => {
    setCurrentBundlePermohonanPage(1);
  }, [searchBundlePermohonanQuery, bundleDisplayMode, selectedBundleInManifest]);

  const totalBundlePermohonanPages = Math.ceil(filteredBundlePermohonanList.length / itemsPerBundlePermohonanPage) || 1;
  const activeBundlePermohonanPage = currentBundlePermohonanPage > totalBundlePermohonanPages ? 1 : currentBundlePermohonanPage;

  const paginatedBundlePermohonanList = useMemo(() => {
    const start = (activeBundlePermohonanPage - 1) * itemsPerBundlePermohonanPage;
    return filteredBundlePermohonanList.slice(start, start + itemsPerBundlePermohonanPage);
  }, [filteredBundlePermohonanList, activeBundlePermohonanPage, itemsPerBundlePermohonanPage]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const searchManifestInputRef = useRef<HTMLInputElement | null>(null);

  const fetchInitialData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    else setListLoading(true);
    setError("");

    try {
      const manifestsRes = await getManifests();
      const bundlesRes = await getEligibleBundles();

      if (manifestsRes.success && 'list' in manifestsRes) {
        const fetchedManifests = manifestsRes.list || [];
        setManifestsList(fetchedManifests);

        if (selectedManifest) {
          const detailRes = await getManifestDetails(selectedManifest.id);
          if (detailRes.success && 'manifest' in detailRes && detailRes.manifest) {
            setSelectedManifest(detailRes.manifest);
            if (selectedBundleInManifest) {
              const updatedBundle = (detailRes.manifest.bundle || []).find((b: any) => b.id === selectedBundleInManifest.id);
              setSelectedBundleInManifest(updatedBundle || null);
            }
          }
        }
      }
      if (bundlesRes.success && 'list' in bundlesRes) {
        setEligibleBundlesList(bundlesRes.list || []);
      }
    } catch (err: any) {
      setError(err.message || "Kesalahan koneksi ke server.");
    } finally {
      setListLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedManifest, selectedBundleInManifest]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Reset pagination when search changes
  useEffect(() => {
    setCurrentManifestPage(1);
  }, [searchQuery]);

  // Synchronous Manifest Selection on Click (No Tab Switch)
  const handleSelectManifest = (manifest: any) => {
    setSelectedManifest(manifest);
    setError("");
    setSuccess("");

    // Background fetch to refresh details without blocking UI
    getManifestDetails(manifest.id).then((res) => {
      if (res.success && 'manifest' in res && res.manifest) {
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
      if (res.success && res.manifest) {
        setSuccess(`Manifest baru ${res.manifest?.nomorManifest} berhasil dibuat!`);
        await fetchInitialData(true);
        const detail = await getManifestDetails(res.manifest.id);
        if (detail.success && 'manifest' in detail && detail.manifest) {
          setSelectedManifest(detail.manifest);
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
    setError("");
    setSuccess("");

    const targetBundle = eligibleBundlesList.find((b) => b.id === bundleId);
    if (!targetBundle) return;

    setEligibleBundlesList((prev) => prev.filter((b) => b.id !== bundleId));

    const updatedBundles = [...(selectedManifest.bundle || []), targetBundle];
    const updatedSelectedManifest = { ...selectedManifest, bundle: updatedBundles };
    setSelectedManifest(updatedSelectedManifest);

    setManifestsList((prev) =>
      prev.map((m) => (m.id === selectedManifest.id ? updatedSelectedManifest : m))
    );

    try {
      const res: any = await addBundleToManifest(selectedManifest.id, bundleId);
      if (res.success) {
        setSuccess("Bundle berhasil ditambahkan ke dalam manifest!");
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

  // Remove Bundle from Manifest
  const handleRemoveBundle = async (bundleId: string) => {
    if (!selectedManifest) return;
    setError("");
    setSuccess("");

    const targetBundle = (selectedManifest.bundle || []).find((b: any) => b.id === bundleId);

    const updatedBundles = (selectedManifest.bundle || []).filter((b: any) => b.id !== bundleId);
    const updatedSelectedManifest = { ...selectedManifest, bundle: updatedBundles };
    setSelectedManifest(updatedSelectedManifest);

    if (selectedBundleInManifest?.id === bundleId) {
      setSelectedBundleInManifest(null);
    }

    if (targetBundle) {
      setEligibleBundlesList((prev) => [targetBundle, ...prev]);
    }

    setManifestsList((prev) =>
      prev.map((m) => (m.id === selectedManifest.id ? updatedSelectedManifest : m))
    );

    try {
      const res: any = await removeBundleFromManifest(selectedManifest.id, bundleId);
      if (res.success) {
        setSuccess("Bundle berhasil dilepas dari manifest!");
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
        await fetchInitialData(true);
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

  // Report Bundle Lost
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
            await fetchInitialData(true);
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

  // Request Major Correction: Kembalikan ke Pengarsip
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
        await fetchInitialData(true);
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
  const paginatedManifests = useMemo(() => {
    return filteredManifests.slice(
      (activeManifestPage - 1) * itemsPerManifestPage,
      activeManifestPage * itemsPerManifestPage
    );
  }, [filteredManifests, activeManifestPage, itemsPerManifestPage]);

  return (
    <div id="pengirim-board-root" className="w-full font-sans select-none animate-fadeIn flex flex-col gap-6">

      {/* Show precision skeleton during initial data load */}
      {listLoading && workspaceTab === "daftar-manifest" && <PengirimManifestSkeleton />}
      {listLoading && workspaceTab === "kelola-pengiriman" && <PengirimKelolaSkeleton />}

      {/* Hide real content while skeleton is visible */}
      <div className={`flex flex-col gap-4 ${listLoading ? "hidden" : ""}`}>

        {/* Alert Banner jika terdapat manifest draf / belum dikirim */}
        <RevisionAlertBanner
          count={manifestsList.filter(m => m.status === 'DRAFT').length}
          titlePrefix="Perhatian, "
          titleText="Manifest Pengiriman Dalam Draf"
          descriptionText="manifest pengiriman kargo berkas fisik yang belum terkunci atau belum diunggah resi bukti kirimnya."
          actionLabel="Lihat Draf Manifest"
          onAction={() => {
            setFilterManifestStatus('DRAFT');
            handleSwitchTab('daftar-manifest');
          }}
        />

        {/* TIER 1: UNIFIED KPI STATS STRIP (Clean Neutral Slate Styling - 100% Identik dengan Pengarsip & Peneliti) */}
        <div className="bg-white border border-slate-200/90 rounded-md p-1.5 shadow-3xs select-none font-sans">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            {/* Metric 1: Total Manifest */}
            <div
              onClick={() => { setFilterManifestStatus('ALL'); setCurrentManifestPage(1); handleSwitchTab('daftar-manifest'); }}
              className={`p-2.5 px-3 flex items-center justify-between transition-all cursor-pointer rounded-md ${filterManifestStatus === 'ALL' ? 'bg-slate-100/90 text-slate-900 font-semibold' : 'hover:bg-slate-50 text-slate-600'
                }`}
            >
              <div className="flex flex-col gap-0.5 font-sans">
                <span className="text-[13px] font-normal text-slate-600 capitalize font-sans">Total Manifest</span>
                <span className="text-lg font-bold font-mono text-slate-800">{manifestStatusCounts.ALL}</span>
              </div>
              <span className={`text-[11px] font-semibold font-mono px-1.5 py-0.5 rounded border transition-all ${filterManifestStatus === 'ALL' ? 'bg-[#00a389] text-white border-[#00a389]' : 'bg-slate-100 text-slate-500 border-slate-200/80'
                }`}>
                100%
              </span>
            </div>

            {/* Metric 2: Draf */}
            <div
              onClick={() => { setFilterManifestStatus('DRAFT'); setCurrentManifestPage(1); handleSwitchTab('daftar-manifest'); }}
              className={`p-2.5 px-3 flex items-center justify-between transition-all cursor-pointer rounded-md ${filterManifestStatus === 'DRAFT' ? 'bg-slate-100/90 text-slate-900 font-semibold' : 'hover:bg-slate-50 text-slate-600'
                }`}
            >
              <div className="flex flex-col gap-0.5 font-sans">
                <span className="text-[13px] font-normal text-slate-600 capitalize font-sans">Draf</span>
                <span className="text-lg font-bold font-mono text-slate-800">{manifestStatusCounts.DRAFT}</span>
              </div>
              <span className={`text-[11px] font-semibold font-mono px-1.5 py-0.5 rounded border transition-all ${filterManifestStatus === 'DRAFT' ? 'bg-[#00a389] text-white border-[#00a389]' : 'bg-slate-100 text-slate-500 border-slate-200/80'
                }`}>
                {manifestsList.length > 0 ? `${((manifestStatusCounts.DRAFT / manifestsList.length) * 100).toFixed(0)}%` : '0%'}
              </span>
            </div>

            {/* Metric 3: Terkunci */}
            <div
              onClick={() => { setFilterManifestStatus('LOCKED'); setCurrentManifestPage(1); handleSwitchTab('daftar-manifest'); }}
              className={`p-2.5 px-3 flex items-center justify-between transition-all cursor-pointer rounded-md ${filterManifestStatus === 'LOCKED' ? 'bg-slate-100/90 text-slate-900 font-semibold' : 'hover:bg-slate-50 text-slate-600'
                }`}
            >
              <div className="flex flex-col gap-0.5 font-sans">
                <span className="text-[13px] font-normal text-slate-600 capitalize font-sans">Terkunci</span>
                <span className="text-lg font-bold font-mono text-slate-800">{manifestStatusCounts.LOCKED}</span>
              </div>
              <span className={`text-[11px] font-semibold font-mono px-1.5 py-0.5 rounded border transition-all ${filterManifestStatus === 'LOCKED' ? 'bg-[#00a389] text-white border-[#00a389]' : 'bg-slate-100 text-slate-500 border-slate-200/80'
                }`}>
                {manifestsList.length > 0 ? `${((manifestStatusCounts.LOCKED / manifestsList.length) * 100).toFixed(0)}%` : '0%'}
              </span>
            </div>

            {/* Metric 4: Dikirim */}
            <div
              onClick={() => { setFilterManifestStatus('SENT'); setCurrentManifestPage(1); handleSwitchTab('daftar-manifest'); }}
              className={`p-2.5 px-3 flex items-center justify-between transition-all cursor-pointer rounded-md ${filterManifestStatus === 'SENT' ? 'bg-slate-100/90 text-slate-900 font-semibold' : 'hover:bg-slate-50 text-slate-600'
                }`}
            >
              <div className="flex flex-col gap-0.5 font-sans">
                <span className="text-[13px] font-normal text-slate-600 capitalize font-sans">Dikirim</span>
                <span className="text-lg font-bold font-mono text-slate-800">{manifestStatusCounts.SENT}</span>
              </div>
              <span className={`text-[11px] font-semibold font-mono px-1.5 py-0.5 rounded border transition-all ${filterManifestStatus === 'SENT' ? 'bg-[#00a389] text-white border-[#00a389]' : 'bg-slate-100 text-slate-500 border-slate-200/80'
                }`}>
                {manifestsList.length > 0 ? `${((manifestStatusCounts.SENT / manifestsList.length) * 100).toFixed(0)}%` : '0%'}
              </span>
            </div>
          </div>
        </div>

        {/* Clean View Mode Switcher Tabs (Equal Width 2 Tabs Layout) */}
        <div className="bg-slate-100/90 border border-slate-200/80 p-1 rounded-md grid grid-cols-2 gap-1 shadow-3xs select-none font-sans">
          <button
            type="button"
            onClick={() => handleSwitchTab("daftar-manifest")}
            className={`py-2 px-3 rounded-md text-[13px] font-normal font-sans text-center transition-all cursor-pointer ${workspaceTab === "daftar-manifest"
              ? "bg-white text-slate-800 shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
          >
            Pilih Manifest Pengiriman
          </button>
          <button
            type="button"
            onClick={() => handleSwitchTab("kelola-pengiriman")}
            className={`py-2 px-3 rounded-md text-[13px] font-normal font-sans text-center transition-all cursor-pointer ${workspaceTab === "kelola-pengiriman"
              ? "bg-white text-slate-800 shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
          >
            Kelola Pengiriman
          </button>
        </div>

        {/* Error & Success Banners */}
        {error && (
          <div className="bg-rose-50/90 border border-rose-200 text-rose-800 text-[13px] font-normal font-sans rounded-md px-4 py-3 flex items-start gap-2 animate-fadeIn shrink-0 shadow-3xs">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
            <span className="flex-1 font-sans">{error}</span>
            <button onClick={() => setError("")} className="text-rose-400 hover:text-rose-600 shrink-0 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        {success && (
          <div className="bg-emerald-50/90 border border-emerald-200 text-[#008f78] text-[13px] font-normal font-sans rounded-md px-4 py-3 flex items-start gap-2 animate-fadeIn shrink-0 shadow-3xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
            <span className="flex-1 font-sans">{success}</span>
            <button onClick={() => setSuccess("")} className="text-emerald-500 hover:text-emerald-700 shrink-0 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ==================== TAB: DAFTAR MANIFEST ==================== */}
        {workspaceTab === "daftar-manifest" && (
          <div className="flex flex-col gap-4 min-h-[300px] font-sans">
            {/* TIER 2: UNIFIED COMMAND BAR CARD */}
            <div className="bg-slate-50/90 border border-slate-200/80 p-3 rounded-md shadow-3xs select-none font-sans">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Search input for Manifests */}
                <div className="relative w-full md:w-[403px] max-w-full font-sans">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
                  <input
                    type="text"
                    ref={searchManifestInputRef}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className="w-full h-10 pl-10 pr-14 bg-white hover:bg-slate-50 focus:bg-white border border-slate-200 hover:border-slate-300 focus:border-[#00a389] rounded-md text-[13px] font-normal text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-3xs font-sans"
                    placeholder="Cari nomor manifest..."
                  />
                  {!isSearchFocused && !searchQuery && (
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200/80 select-none pointer-events-none">
                      Ctrl+K
                    </span>
                  )}
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 z-10 p-0.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Right side controls: Buat Button + Refresh Button */}
                <div className="flex items-center gap-2 shrink-0 font-sans">
                  <button
                    onClick={handleCreateManifest}
                    disabled={loading}
                    className="px-4 py-2 h-10 bg-[#00a389] hover:bg-[#008f78] active:scale-95 text-white font-normal text-[13px] font-sans rounded-md shadow-3xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Buat</span>
                  </button>

                  <button
                    onClick={() => fetchInitialData(true)}
                    disabled={isRefreshing || listLoading}
                    className="p-2.5 h-10 w-10 rounded-md border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-500 shadow-3xs transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center shrink-0"
                    title="Refresh Data"
                  >
                    <RefreshCw className={`w-4 h-4 transition-all duration-300 ${isRefreshing ? 'animate-spin text-[#00a389]' : ''}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Manifest Cards Grid (Standalone outside Command Bar container) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
              {loading && manifestsList.length === 0 ? (
                <div className="col-span-full py-20 flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-[#00a389]" />
                  <span className="text-[13px] font-normal text-slate-500 font-sans">Memuat data...</span>
                </div>
              ) : filteredManifests.length === 0 ? (
                <div className="col-span-full py-10 text-center select-none font-sans">
                  <EmptyDataAnimation
                    title={searchQuery ? "Hasil Pencarian Tidak Ditemukan" : "Belum Ada Manifest"}
                    description={searchQuery ? "Tidak ada manifest yang sesuai dengan kata kunci pencarian." : "Daftar manifest pengiriman kosong saat ini."}
                  />
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
                      className={`p-4 rounded-xl border flex flex-col justify-between gap-3.5 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer relative overflow-hidden group select-none min-h-[140px] font-sans ${isSelected
                        ? "bg-gradient-to-br from-[#00a389]/5 via-emerald-50/20 to-white border-[#00a389] shadow-md ring-2 ring-[#00a389]/20"
                        : "bg-white border-slate-200/90 hover:border-slate-350 hover:shadow-md"
                        }`}
                    >
                      {/* Baris 1 (Header): Nomor Manifest & Badge Status */}
                      <div className="flex items-center justify-between gap-2 w-full font-sans">
                        <span className="font-mono text-[13px] font-normal text-slate-800 tracking-tight truncate font-sans">
                          {highlightText(m.nomorManifest, searchQuery)}
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
                        {/* Left Column: Jumlah Bundle */}
                        <div className="flex-1 flex items-center justify-center font-normal text-[#008f78] font-sans">
                          <span>{bundlesCount} Bundle</span>
                        </div>

                        {/* Vertical Line Separator */}
                        <div className="w-px h-3.5 bg-slate-200/90 shrink-0" />

                        {/* Right Column: Total Pemohon */}
                        <div className="flex-1 flex items-center justify-center font-normal text-slate-600 font-sans">
                          <span>{totalPecahanCount} Pemohon</span>
                        </div>
                      </div>

                      {/* Baris 3 (Footer): Pengirim avatar + tanggal */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 font-sans mt-auto">
                        <div className="flex items-center gap-2 min-w-0 font-sans">
                          <div className="w-5.5 h-5.5 rounded-full bg-[#00a389] text-white text-[8px] font-bold flex items-center justify-center shrink-0 shadow-3xs" title={m.pengirim?.name}>
                            {getAvatarInitials(m.pengirim?.name)}
                          </div>
                        </div>

                        <span className="text-[12px] font-normal text-slate-500 flex items-center gap-1 shrink-0 font-sans">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {m.updatedAt ? new Date(m.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Table Footer / Pagination for Manifests */}
            <div className="px-5 py-3.5 border border-slate-200/90 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto rounded-md select-none shadow-3xs shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-semibold text-slate-500 font-sans">
                  {filteredManifests.length > 0
                    ? `Menampilkan ${((activeManifestPage - 1) * itemsPerManifestPage) + 1}–${Math.min(activeManifestPage * itemsPerManifestPage, filteredManifests.length)} dari ${filteredManifests.length} manifest`
                    : 'Tidak ada data'}
                </span>
                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-md px-1.5 py-0.5">
                  {[8, 16, 32].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => {
                        setItemsPerManifestPage(n);
                        setCurrentManifestPage(1);
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${itemsPerManifestPage === n
                        ? 'bg-[#00a389] text-white font-extrabold shadow-3xs'
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
                    className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-all cursor-pointer shadow-3xs flex items-center justify-center"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  {Array.from({ length: totalManifestPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentManifestPage(page)}
                      className={`w-7 h-7 flex items-center justify-center rounded-md text-xs font-bold transition-all cursor-pointer ${activeManifestPage === page
                        ? 'bg-[#00a389] text-white font-extrabold shadow-3xs scale-105'
                        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 shadow-3xs'
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCurrentManifestPage(prev => Math.min(prev + 1, totalManifestPages))}
                    disabled={activeManifestPage === totalManifestPages}
                    className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-all cursor-pointer shadow-3xs flex items-center justify-center"
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
              <div className="flex-1 flex flex-col items-center justify-center text-center py-16 px-8 select-none bg-white p-8 rounded-md border border-slate-200/90 shadow-3xs min-h-[400px] font-sans">
                <div className="mb-2 relative flex items-center justify-center">
                  <Image
                    src="/assets/Select-Bro.svg"
                    alt="Pilih Manifest"
                    width={224}
                    height={224}
                    className="w-56 h-56 object-contain pointer-events-none drop-shadow-sm select-none"
                    priority
                  />
                </div>
                <h3 className="text-[13px] font-normal text-slate-800 mb-1 capitalize font-sans">Pilih Manifest Terlebih Dahulu</h3>
                <p className="text-[12px] text-slate-500 font-normal max-w-sm leading-relaxed mb-4 font-sans">
                  Silakan pilih salah satu manifest di tab <strong className="font-normal text-slate-700">Daftar Manifest</strong> terlebih dahulu untuk mengelola pengiriman map bundle.
                </p>
                <button
                  onClick={() => handleSwitchTab("daftar-manifest")}
                  className="px-4 py-2 bg-[#00a389] hover:bg-[#008f78] text-white font-normal text-[13px] font-sans rounded-md shadow-3xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 capitalize"
                >
                  <Boxes className="w-4 h-4 stroke-[2]" />
                  <span>Ke Daftar Manifest</span>
                </button>
              </div>
            ) : (
              /* Master-Detail Split Panel Layout */
              <div className="bg-white border border-slate-200/90 rounded-md p-5 sm:p-6 shadow-3xs flex flex-col gap-6 min-h-[500px]">

                {/* Top Header Bar */}
                <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4 select-none font-sans">
                  <div>
                    <h2 className="font-normal text-[13px] capitalize text-slate-800 font-sans flex items-center gap-2">
                      <span className="font-mono font-normal text-slate-800 text-[13px]">{selectedManifest.nomorManifest}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[12px] font-normal border leading-none capitalize tracking-wider font-sans ${selectedManifest.status === 'LOCKED'
                        ? 'bg-slate-900 text-slate-100 border-slate-800'
                        : selectedManifest.status === 'SENT'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        }`}>
                        {getStatusLabel(selectedManifest.status)}
                      </span>
                    </h2>
                  </div>
                </div>

                {/* Grid 2 Columns: Antrean Bundle & Bundle Terpasang */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch font-sans">

                  {/* KIRI: Antrean Bundle Tersedia */}
                  <div className="bg-white border border-slate-200/90 rounded-md p-5 shadow-3xs flex flex-col gap-3 h-[420px] font-sans">
                    <div className="flex items-center justify-between shrink-0 border-b border-slate-100 pb-3 font-sans">
                      <h4 className="text-[13px] font-normal text-slate-800 capitalize select-none flex items-center gap-2 font-sans">
                        <span>Antrean Bundle</span>
                        <span className="bg-slate-100 text-slate-600 text-[11px] font-semibold font-mono px-2 py-0.5 rounded-full border border-slate-200">
                          {eligibleBundlesList.length}
                        </span>
                      </h4>
                    </div>

                    <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto pr-1 scrollbar-thin font-sans">
                      {eligibleBundlesList.length === 0 ? (
                        <div className="my-auto py-4 px-4 flex flex-col items-center justify-center text-center select-none font-sans">
                          <EmptyDataAnimation
                            title="Antrean Bundle Kosong"
                            description="Tidak ada map bundle locked terarsip di antrean."
                          />
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
                              className="p-3.5 sm:p-4 bg-slate-50/70 border border-slate-200/80 rounded-md text-[13px] flex flex-col justify-between gap-3 hover:border-[#00a389]/40 transition-all select-none shrink-0 min-h-[76px] font-sans"
                            >
                              <div className="flex items-center justify-between gap-3 w-full font-sans">
                                <span className="text-[13px] font-normal text-slate-800 font-mono tracking-tight truncate font-sans">
                                  {b.nomorBundle}
                                </span>
                                <span className="flex items-center justify-center bg-[#f25c54] text-white text-[11px] font-bold font-mono w-5 h-5 rounded-full shrink-0 shadow-2xs" title={`${bTotalPecahan} Berkas`}>
                                  {bTotalPecahan}
                                </span>
                              </div>

                              <div className="flex items-center justify-between gap-3 w-full font-sans">
                                <span className="bg-emerald-50 text-[#008f78] text-[11px] font-normal px-2 py-0.5 rounded-md border border-emerald-200 capitalize leading-none shrink-0 font-sans">
                                  {getAbbreviatedJenis(b.jenisPermohonan)}
                                </span>

                                {selectedManifest.status === "DRAFT" && (
                                  <button
                                    onClick={() => handleAddBundle(b.id)}
                                    disabled={loading}
                                    className="py-1 px-2.5 bg-[#00a389] hover:bg-[#008f78] text-white font-normal text-[12px] font-sans rounded-md transition-all active:scale-95 cursor-pointer flex items-center gap-1 shadow-3xs shrink-0 capitalize"
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

                  {/* KANAN: Map Bundle Terpasang Dalam Manifest */}
                  <div className="bg-white border border-slate-200/90 rounded-md p-5 shadow-3xs flex flex-col gap-3 h-[420px] font-sans">
                    <div className="flex items-center justify-between shrink-0 border-b border-slate-100 pb-3 font-sans">
                      <h4 className="text-[13px] font-normal text-slate-800 capitalize select-none flex items-center gap-2 font-sans">
                        <span>Bundle Terpasang</span>
                        <span className="bg-emerald-50 text-[#008f78] text-[11px] font-semibold font-mono px-2 py-0.5 rounded-full border border-emerald-200">
                          {(selectedManifest.bundle || []).length}
                        </span>
                      </h4>
                    </div>

                    <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto pr-1 scrollbar-thin font-sans">
                      {selectedManifest.bundle?.length === 0 ? (
                        <div className="my-auto py-4 px-4 flex flex-col items-center justify-center text-center select-none font-sans">
                          <EmptyDataAnimation
                            title="Belum Ada Bundle Terpasang"
                            description="Belum ada map bundle yang terpasang dalam manifest ini."
                          />
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
                              className={`p-3.5 sm:p-4 rounded-md border transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 relative overflow-hidden select-none shrink-0 min-h-[76px] font-sans ${isSelectedBundle
                                ? "bg-[#00a389]/5 border-[#00a389] shadow-md ring-2 ring-[#00a389]/20"
                                : "bg-slate-50/60 border-slate-200 hover:border-slate-300 hover:bg-white"
                                }`}
                            >
                              {/* Left Active Indicator Strip */}
                              {isSelectedBundle && (
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#00a389] rounded-l-md" />
                              )}

                              <div className="flex items-center justify-between gap-3 w-full font-sans">
                                <span className="text-[13px] font-normal text-slate-800 font-mono tracking-tight truncate font-sans">
                                  {b.nomorBundle}
                                </span>
                                <span className="flex items-center justify-center bg-[#f25c54] text-white text-[11px] font-bold font-mono w-5 h-5 rounded-full shrink-0 shadow-2xs" title={`${bTotalPecahan} Berkas`}>
                                  {bTotalPecahan}
                                </span>
                              </div>

                              <div className="flex items-center justify-between gap-3 w-full font-sans">
                                <span className="bg-emerald-50 text-[#008f78] text-[11px] font-normal px-2 py-0.5 rounded-md border border-emerald-200 capitalize leading-none shrink-0 font-sans">
                                  {getAbbreviatedJenis(b.jenisPermohonan)}
                                </span>
                                <span className="text-slate-500 font-normal text-[12px] flex items-center gap-1 shrink-0 font-sans">
                                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
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

                {/* CARD DETAIL PERMOHONAN */}
                <div className="w-full">
                  <div className="bg-[#f8fafc] rounded-md border border-slate-200/90 p-3.5 flex flex-col gap-3 shadow-3xs animate-fadeIn">

                    {/* COMMAND BAR CARD */}
                    <div className="bg-white border border-slate-200/90 rounded-md p-3 shadow-3xs flex flex-row items-center justify-end gap-3 select-none font-sans">

                      {selectedBundleInManifest && (
                        <div className="flex items-center gap-2.5 shrink-0 justify-end flex-wrap font-sans">
                          {/* Segmented Display Mode Switcher */}
                          <div className="inline-flex p-0.5 bg-slate-100 border border-slate-200/80 rounded-md select-none font-sans">
                            <button
                              type="button"
                              onClick={() => setBundleDisplayMode('berkas')}
                              className={`px-2.5 py-1 rounded text-[12px] font-normal font-sans capitalize transition-all cursor-pointer ${bundleDisplayMode === 'berkas'
                                ? 'bg-white text-slate-800 shadow-xs'
                                : 'text-slate-600 hover:text-slate-800'
                                }`}
                            >
                              Nopel
                            </button>
                            <button
                              type="button"
                              onClick={() => setBundleDisplayMode('pemohon')}
                              className={`px-2.5 py-1 rounded text-[12px] font-normal font-sans capitalize transition-all cursor-pointer ${bundleDisplayMode === 'pemohon'
                                ? 'bg-white text-slate-800 shadow-xs'
                                : 'text-slate-600 hover:text-slate-800'
                                }`}
                            >
                              Pemohon
                            </button>
                          </div>

                          {/* Export Excel Button */}
                          <a
                            href={`/api/export/bundle/${selectedBundleInManifest.id}`}
                            download
                            className="p-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-md transition-all shadow-3xs cursor-pointer flex items-center justify-center font-sans"
                            title="Ekspor daftar permohonan ke Excel"
                          >
                            <FileSpreadsheet className="w-4 h-4 text-[#00a389]" />
                          </a>

                          {/* Remove Bundle Button */}
                          {selectedManifest.status === "DRAFT" && (
                            <button
                              type="button"
                              onClick={() => handleRemoveBundle(selectedBundleInManifest.id)}
                              disabled={loading}
                              className="p-1.5 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-all cursor-pointer shadow-3xs flex items-center justify-center disabled:opacity-40 font-sans"
                              title="Keluarkan bundle dari manifest"
                            >
                              <Trash className="w-4 h-4 text-rose-600" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* DATA CANVAS & TABLE CARD */}
                    {selectedBundleInManifest ? (
                      <div className="w-full bg-white border border-slate-200/90 rounded-md shadow-3xs overflow-hidden flex flex-col font-sans">
                        <div className="overflow-x-auto scrollbar-thin max-h-[440px]">
                          <table className="w-full text-left border-collapse select-none font-sans">
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
                                <th className="py-3 px-4 min-w-[100px] relative font-normal text-slate-600">
                                  <span>Tgl. Nopel</span>
                                  <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                                </th>
                                <th className="py-3 px-4 min-w-[100px] relative font-normal text-slate-600">
                                  <span>Tgl. Selesai</span>
                                  <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                                </th>
                                <th className="py-3 px-4 min-w-[150px] relative font-normal text-slate-600">
                                  <span>No. Pelayanan</span>
                                  <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                                </th>
                                <th className="py-3 px-4 min-w-[210px] whitespace-nowrap relative font-normal text-slate-600">
                                  <span>Nomor Objek Pajak</span>
                                  <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                                </th>
                                <th className="py-3 px-4 min-w-[170px] relative font-normal text-slate-600">
                                  <span>Nama Pemohon</span>
                                  <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                                </th>
                                <th className="py-3 px-4 min-w-[120px] relative font-normal text-slate-600">
                                  <span>Jenis Layanan</span>
                                  <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                                </th>
                                <th className="py-3 px-4 text-center min-w-[100px] relative font-normal text-slate-600">
                                  <span>Status</span>
                                  <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-[1px] bg-slate-300/80 pointer-events-none" />
                                </th>
                                <th className="py-3 px-4 text-center w-28 min-w-[110px] font-normal text-slate-600">
                                  <span>Aksi</span>
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white text-[12px] font-normal text-slate-600 font-sans">
                              {paginatedBundlePermohonanList.length === 0 ? (
                                <tr>
                                  <td colSpan={12} className="py-10 text-center select-none font-sans">
                                    <EmptyDataAnimation
                                      title={searchBundlePermohonanQuery ? "Hasil Pencarian Tidak Ditemukan" : "Belum Ada Permohonan"}
                                      description={searchBundlePermohonanQuery ? "Tidak ada permohonan yang sesuai dengan kata kunci pencarian." : "Tidak ada berkas permohonan terpasang dalam bundle ini."}
                                    />
                                  </td>
                                </tr>
                              ) : (
                                paginatedBundlePermohonanList.map((p: any, index: number) => {
                                  const isFrozen = p.permintaanKoreksi && p.permintaanKoreksi.length > 0;
                                  const itemNumber = (activeBundlePermohonanPage - 1) * itemsPerBundlePermohonanPage + index + 1;
                                  const nopolDate = p.tanggalNoPelayanan
                                    ? new Date(p.tanggalNoPelayanan).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                                    : '—';
                                  const penyelesaianDate = p.tanggalPenyelesaian
                                    ? new Date(p.tanggalPenyelesaian).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                                    : '—';

                                  return (
                                    <tr
                                      key={p.uniqueRowKey || p.id}
                                      onClick={() => setSelectedPermohonanForDetails(p)}
                                      className={`hover:bg-slate-50 transition-colors duration-150 cursor-pointer group relative text-[12px] font-normal text-slate-600 font-sans ${p.isPecahanRow ? "border-l-3 border-l-[#00a389] bg-[#00a389]/5" : isFrozen ? "bg-amber-50/20" : ""
                                        }`}
                                    >
                                      <td className="py-3 px-4 text-center text-[12px] font-normal text-slate-400 font-mono">
                                        {itemNumber}
                                      </td>

                                      <td className="py-3 px-2 text-center" onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleFavorite(p.id);
                                      }}>
                                        <button
                                          type="button"
                                          className="p-1 hover:scale-125 active:scale-75 transition-all duration-200 text-slate-300 hover:text-amber-500 cursor-pointer"
                                          title={p.isFavorite ? "Hapus dari Favorit" : "Tandai Favorit"}
                                        >
                                          <Star className={`w-4 h-4 transition-all duration-200 ${p.isFavorite
                                            ? 'text-amber-500 fill-amber-500 drop-shadow-[0_0_6px_rgba(245,158,11,0.55)]'
                                            : 'text-slate-300'
                                            }`} />
                                        </button>
                                      </td>

                                      <td className="py-3 px-4 text-[12px] font-normal text-slate-600 font-sans whitespace-nowrap capitalize">
                                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                      </td>

                                      <td className="py-3 px-4 text-slate-600 text-[12px] font-normal font-sans whitespace-nowrap capitalize">
                                        <div className="flex items-center gap-1.5 min-w-0" title={p.penginput?.name || "Petugas Input"}>
                                          <span className="truncate max-w-[130px] font-sans font-normal capitalize">{toTitleCase(p.penginput?.name || "Petugas Input")}</span>
                                        </div>
                                      </td>

                                      <td className="py-3 px-4 text-[12px] font-normal text-slate-600 font-sans whitespace-nowrap capitalize">{nopolDate}</td>

                                      <td className="py-3 px-4 whitespace-nowrap font-sans">
                                        {p.tanggalPenyelesaian ? (
                                          <div className="flex items-center gap-1">
                                            {isOverdue(p.tanggalPenyelesaian, p.status) && (
                                              <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                            )}
                                            <span className={`text-[12px] font-sans font-normal capitalize ${isOverdue(p.tanggalPenyelesaian, p.status)
                                              ? 'text-rose-600 font-normal'
                                              : 'text-slate-600'
                                              }`}>
                                              {penyelesaianDate}
                                            </span>
                                          </div>
                                        ) : "—"}
                                      </td>

                                      <td className="py-3 px-4 min-w-[150px] group/cell relative font-sans">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <span className="text-[12px] font-normal text-slate-700 font-sans tracking-tight capitalize">
                                            {p.nomorPelayanan || p.nomorPermohonan}
                                          </span>
                                          {isFrozen && (
                                            <span className="text-[9px] font-normal capitalize bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 select-none font-sans">
                                              <Clock className="w-2.5 h-2.5 shrink-0 animate-pulse" />
                                              Frozen
                                            </span>
                                          )}
                                          <button
                                            type="button"
                                            onClick={(e) => handleCopy(e, p.nomorPelayanan || p.nomorPermohonan)}
                                            className="p-1 rounded opacity-0 group-hover/cell:opacity-100 hover:bg-slate-100 text-slate-400 hover:text-[#00a389] transition-all cursor-pointer flex items-center justify-center w-5 h-5 select-none"
                                            title="Salin Nomor"
                                          >
                                            {copiedText === (p.nomorPelayanan || p.nomorPermohonan) ? (
                                              <Check className="w-3.5 h-3.5 text-emerald-600 transition-all duration-200 transform scale-110" />
                                            ) : (
                                              <Copy className="w-3 h-3" />
                                            )}
                                          </button>
                                        </div>
                                      </td>

                                      <td className="py-3 px-4 min-w-[210px] whitespace-nowrap group/cell relative font-sans">
                                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                                          <span className="text-[12px] font-normal text-slate-700 font-sans whitespace-nowrap capitalize">
                                            {formatNop(p.nop)}
                                          </span>
                                          <button
                                            type="button"
                                            onClick={(e) => handleCopy(e, p.nop)}
                                            className="p-1 rounded opacity-0 group-hover/cell:opacity-100 hover:bg-slate-100 text-slate-400 hover:text-[#00a389] transition-all cursor-pointer flex items-center justify-center w-5 h-5 select-none"
                                            title="Salin NOP"
                                          >
                                            {copiedText === p.nop ? (
                                              <Check className="w-3.5 h-3.5 text-emerald-600 transition-all duration-200 transform scale-110" />
                                            ) : (
                                              <Copy className="w-3 h-3" />
                                            )}
                                          </button>
                                        </div>
                                      </td>

                                      <td className="py-3 px-4 group/cell relative font-sans">
                                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                                          <span className="text-[12px] font-normal text-slate-700 whitespace-nowrap capitalize font-sans">
                                            {toTitleCase(p.displayNamaWajibPajak || p.namaWajibPajak)}
                                          </span>
                                          {p.isPecahanRow && (
                                            <span className="text-[10px] font-normal text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-1.5 py-0.2 rounded-md shrink-0 font-sans">
                                              #{p.pecahanIndex}/{p.totalPecahan}
                                            </span>
                                          )}
                                          <button
                                            type="button"
                                            onClick={(e) => handleCopy(e, p.displayNamaWajibPajak || p.namaWajibPajak)}
                                            className="p-1 rounded opacity-0 group-hover/cell:opacity-100 hover:bg-slate-100 text-slate-400 hover:text-[#00a389] transition-all cursor-pointer flex items-center justify-center w-5 h-5 select-none"
                                            title="Salin Nama Pemohon"
                                          >
                                            {copiedText === (p.displayNamaWajibPajak || p.namaWajibPajak) ? (
                                              <Check className="w-3.5 h-3.5 text-emerald-600 transition-all duration-200 transform scale-110" />
                                            ) : (
                                              <Copy className="w-3 h-3" />
                                            )}
                                          </button>
                                        </div>
                                      </td>

                                      <td className="py-3 px-4 font-sans">
                                        <span
                                          className="text-[11px] font-normal text-slate-600 bg-slate-100 border border-slate-200/90 px-2 py-0.5 rounded capitalize font-sans tracking-wide select-none"
                                          title={p.jenisPermohonan?.replace(/_/g, " ")}
                                        >
                                          {getAbbreviatedJenis(p.jenisPermohonan || selectedBundleInManifest.jenisPermohonan)}
                                        </span>
                                      </td>

                                      <td className="py-3 px-4 text-center font-sans">
                                        <div className="flex items-center justify-center font-sans">
                                          {isFrozen ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[12px] font-normal bg-amber-100 text-amber-800 border border-amber-200 select-none capitalize font-sans">
                                              <Clock className="w-2.5 h-2.5 text-amber-600 animate-spin" />
                                              Frozen
                                            </span>
                                          ) : (
                                            <span className={`inline-flex text-[12px] font-normal px-2.5 py-0.5 rounded-full border capitalize font-sans ${p.status === "ARCHIVED" ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-sky-100 text-sky-800 border-sky-200"}`}>
                                              {getStatusLabel(p.status)}
                                            </span>
                                          )}
                                        </div>
                                      </td>

                                      <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-center gap-1.5">
                                          {!isFrozen && p.status === "ARCHIVED" && (
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                openCorrectionModal(p);
                                              }}
                                              className="p-1.5 text-slate-500 hover:text-rose-700 bg-white hover:bg-rose-50 border border-slate-200 rounded-md transition-all cursor-pointer shadow-3xs"
                                              title="Kembalikan ke Pengarsip untuk upload ulang scan digital"
                                            >
                                              <CircleArrowLeft className="w-3.5 h-3.5" />
                                            </button>
                                          )}

                                          {selectedManifest.status === "SENT" && (
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleReportBundleLost(selectedBundleInManifest.id, selectedBundleInManifest.nomorBundle);
                                              }}
                                              disabled={loading}
                                              className="px-2 py-1 text-[10px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-all cursor-pointer flex items-center gap-1 shadow-3xs"
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

                        {/* TABLE FOOTER PAGINATION */}
                        <div className="border-t border-slate-200/90 bg-slate-50/80 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] font-normal text-slate-600 select-none font-sans">
                          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start font-sans">
                            <span className="text-slate-500 font-sans">
                              {filteredBundlePermohonanList.length > 0
                                ? `Menampilkan ${(activeBundlePermohonanPage - 1) * itemsPerBundlePermohonanPage + 1} - ${Math.min(activeBundlePermohonanPage * itemsPerBundlePermohonanPage, filteredBundlePermohonanList.length)} dari ${filteredBundlePermohonanList.length} ${bundleDisplayMode === 'pemohon' ? 'entri pemohon' : 'permohonan'}`
                                : "Tidak ada data"}
                            </span>
                            {/* Items per page switcher */}
                            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-md px-1.5 py-0.5 shadow-3xs font-sans">
                              {[10, 20, 50].map((size) => (
                                <button
                                  key={size}
                                  type="button"
                                  onClick={() => { setItemsPerBundlePermohonanPage(size); setCurrentBundlePermohonanPage(1); }}
                                  className={`px-2 py-0.5 rounded text-[11px] font-normal transition-all cursor-pointer font-sans ${itemsPerBundlePermohonanPage === size
                                    ? 'bg-[#00a389] text-white font-semibold shadow-3xs'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                  {size}
                                </button>
                              ))}
                              <span className="text-[11px] text-slate-400 font-normal pl-0.5 font-sans">/hal</span>
                            </div>
                          </div>

                          {totalBundlePermohonanPages > 1 && (
                            <div className="flex items-center gap-1 font-sans">
                              <button
                                type="button"
                                onClick={() => setCurrentBundlePermohonanPage((prev) => Math.max(prev - 1, 1))}
                                disabled={activeBundlePermohonanPage === 1}
                                className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-all cursor-pointer shadow-3xs flex items-center justify-center font-sans"
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </button>
                              {Array.from({ length: totalBundlePermohonanPages }, (_, i) => i + 1).map((page) => (
                                <button
                                  type="button"
                                  key={page}
                                  onClick={() => setCurrentBundlePermohonanPage(page)}
                                  className={`w-7 h-7 flex items-center justify-center rounded-md text-[12px] font-normal transition-all cursor-pointer font-sans ${activeBundlePermohonanPage === page
                                    ? "bg-[#00a389] text-white font-semibold shadow-3xs scale-105"
                                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 shadow-3xs"
                                    }`}
                                >
                                  {page}
                                </button>
                              ))}
                              <button
                                type="button"
                                onClick={() => setCurrentBundlePermohonanPage((prev) => Math.min(prev + 1, totalBundlePermohonanPages))}
                                disabled={activeBundlePermohonanPage === totalBundlePermohonanPages}
                                className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-all cursor-pointer shadow-3xs flex items-center justify-center font-sans"
                              >
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="py-6 px-4 flex flex-col items-center justify-center text-center select-none font-sans animate-fadeIn">
                        <EmptyDataAnimation
                          title="Pilih Map Bundle"
                          description="Silakan pilih salah satu map bundle pada daftar di atas untuk menampilkan tabel detail berkas permohonan."
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Action Bar Footer */}
                <div className="border border-slate-200/90 bg-slate-50 p-5 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none shadow-3xs mt-auto font-sans">
                  <div className="text-[12px] text-slate-500 font-normal max-w-lg flex items-center gap-2 font-sans">
                    {selectedManifest.status === "DRAFT" && (
                      <span>Masukkan map bundle terlebih dahulu lalu klik <strong className="font-normal text-slate-700">Kunci Manifest</strong> untuk siap dikirim.</span>
                    )}
                    {selectedManifest.status === "LOCKED" && (
                      <span>Cetak surat pengantar manifest dan unggah bukti tanda terima untuk menyelesaikan pengiriman.</span>
                    )}
                    {selectedManifest.status === "SENT" && (
                      <span>Pengiriman manifest telah selesai. Anda dapat meninjau bukti tanda terima atau mengelola berkas.</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 justify-end shrink-0 flex-wrap font-sans">
                    {selectedManifest.status === "DRAFT" && (
                      <button
                        onClick={handleLockManifest}
                        disabled={loading || selectedManifest.bundle?.length === 0}
                        className="px-4 py-2 bg-[#00a389] hover:bg-[#008f78] active:scale-95 text-white font-normal text-[13px] font-sans rounded-md shadow-3xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed capitalize"
                        title="Kunci Manifest"
                      >
                        <Lock className="w-4 h-4 text-white stroke-[2]" />
                        <span>Kunci Manifest</span>
                      </button>
                    )}

                    {selectedManifest.status === "LOCKED" && (
                      <div className="flex items-center gap-2 flex-wrap font-sans">
                        <button
                          onClick={handleRevisiManifest}
                          disabled={loading}
                          className="px-3 py-2 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md font-normal text-[13px] font-sans transition-all cursor-pointer shadow-3xs flex items-center gap-1.5 disabled:opacity-40 capitalize"
                          title="Batal Kunci Manifest"
                        >
                          <Unlock className="w-4 h-4 text-rose-600" />
                          <span>Revisi Manifest</span>
                        </button>

                        <a
                          href={`/api/pdf/surat-pengantar-manifest/${selectedManifest.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 text-slate-700 hover:text-[#008f78] bg-white border border-slate-200 hover:border-slate-300 rounded-md font-normal text-[13px] font-sans transition-all cursor-pointer shadow-3xs flex items-center gap-1.5 capitalize"
                          title="Cetak Surat Pengantar Manifest"
                        >
                          <Printer className="w-4 h-4 text-slate-600" />
                          <span>Cetak Surat Pengantar</span>
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
                          className="px-4 py-2 text-white bg-[#00a389] hover:bg-[#008f78] active:scale-95 rounded-md font-normal text-[13px] font-sans shadow-3xs transition-all cursor-pointer flex items-center gap-1.5 capitalize"
                          title="Unggah Bukti Tanda Terima"
                        >
                          <Upload className="w-4 h-4 text-white" />
                          <span>Unggah Bukti Tanda Terima</span>
                        </button>
                      </div>
                    )}

                    {selectedManifest.status === "SENT" && selectedManifest.buktiTandaTerima && (
                      <div className="flex items-center gap-2 flex-wrap font-sans">
                        <a
                          href={`/api/pdf/surat-pengantar-manifest/${selectedManifest.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 text-slate-700 hover:text-[#008f78] bg-white border border-slate-200 hover:border-slate-300 rounded-md font-normal text-[13px] font-sans transition-all cursor-pointer shadow-3xs flex items-center gap-1.5 capitalize"
                          title="Cetak Surat Pengantar Manifest"
                        >
                          <Printer className="w-4 h-4 text-slate-600" />
                          <span>Cetak Surat Pengantar</span>
                        </a>

                        <a
                          href={selectedManifest.buktiTandaTerima}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 text-[#008f78] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md font-extrabold text-xs transition-all cursor-pointer shadow-3xs flex items-center gap-1.5"
                          title="Lihat Bukti Tanda Terima"
                        >
                          <FileCheck className="w-4 h-4 text-[#00a389]" />
                          <span>Lihat Bukti Tanda Terima</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

      </div>

      {/* ================= MODAL: AJUKAN KEMBALIKAN KE PENGARSIP ================= */}
      {showCorrectionModal && correctionTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 select-none animate-fadeIn">
          <div className="bg-white rounded-md shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-scaleUp">

            {/* Modal Header */}
            <div className="bg-white border-b border-slate-200/80 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-rose-50 border border-rose-200 p-2 rounded-md shrink-0 flex items-center justify-center">
                  <ArrowLeftRight className="w-4 h-4 text-rose-600" />
                </div>
                <h3 className="text-sm font-black text-slate-900 tracking-tight">
                  Kembalikan ke Pengarsip
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowCorrectionModal(false);
                  setCorrectionTarget(null);
                }}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleRequestCorrection}>
              <div className="p-5 flex flex-col gap-4 text-xs">
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-md leading-relaxed text-rose-800 font-semibold">
                  <p>
                    Anda mengajukan pengembalian <strong>koreksi berkas</strong> NOP:{" "}
                    <strong className="font-mono">{formatNop(correctionTarget.nop)}</strong> kembali ke Pengarsip.
                  </p>
                  <p className="text-[10px] text-rose-700 mt-1.5 font-bold">
                    * Tindakan ini memerlukan persetujuan Supervisor dan akan mem-freeze permohonan hingga diputuskan.
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="catatan-koreksi" className="font-extrabold text-slate-700">
                    Alasan pengembalian <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="catatan-koreksi"
                    rows={4}
                    value={correctionReason}
                    onChange={(e) => setCorrectionReason(e.target.value)}
                    placeholder="Masukkan alasan detail kesalahan arsip digital (misalnya: kualitas scan buram, halaman terpotong, berkas salah diunggah, dll.)"
                    className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:outline-none focus:border-[#00a389] text-xs font-semibold rounded-md px-3.5 py-2.5 transition-all text-slate-800 resize-none shadow-3xs"
                    required
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="bg-slate-50 border-t border-slate-200/80 px-5 py-3.5 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowCorrectionModal(false);
                    setCorrectionTarget(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-all cursor-pointer shadow-3xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading || !correctionReason.trim()}
                  className="px-4 py-2 text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 rounded-md flex items-center gap-1.5 shadow-3xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Ajukan Pengembalian
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
