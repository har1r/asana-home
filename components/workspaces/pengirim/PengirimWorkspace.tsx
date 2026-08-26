"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  DRAFT: 'Draf',
  LOCKED: 'Terkunci',
  SENT: 'Dikirim',
};

const getStatusLabel = (status: string) => STATUS_LABEL_MAP[status] || status;

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
    const rawList = selectedBundleInManifest?.permohonan || [];
    // Only display permohonans that are ready in Pengirim workspace (ARCHIVED or SENT).
    // Permohonan returned to Pengarsip (status BUNDLED) will be excluded so the row disappears after Supervisor approval.
    const permohonanList = rawList.filter((p: any) => p.status === 'ARCHIVED' || p.status === 'SENT');

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

        {/* TIER 1: UNIFIED KPI STATS STRIP (Clean Neutral Slate Styling) */}
        <div className="bg-white border border-slate-200/90 rounded-md p-1.5 shadow-3xs select-none">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            {/* Metric 1: Total Manifest */}
            <div
              onClick={() => { setFilterManifestStatus('ALL'); setCurrentManifestPage(1); handleSwitchTab('daftar-manifest'); }}
              className={`p-3 px-3.5 flex items-center justify-between transition-all cursor-pointer rounded-md ${filterManifestStatus === 'ALL' ? 'bg-slate-100/90 text-slate-900 font-bold' : 'hover:bg-slate-50 text-slate-600'
                }`}
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-slate-500 capitalize">Total Manifest</span>
                <span className="text-xl font-black font-mono text-slate-900">{manifestStatusCounts.ALL}</span>
              </div>
              <span className={`text-xs font-black font-mono px-2 py-0.5 rounded-md border transition-all ${filterManifestStatus === 'ALL' ? 'bg-[#00a389] text-white border-[#00a389]' : 'bg-slate-100 text-slate-500 border-slate-200/80'
                }`}>
                100%
              </span>
            </div>

            {/* Metric 2: Draf */}
            <div
              onClick={() => { setFilterManifestStatus('DRAFT'); setCurrentManifestPage(1); handleSwitchTab('daftar-manifest'); }}
              className={`p-3 px-3.5 flex items-center justify-between transition-all cursor-pointer rounded-md ${filterManifestStatus === 'DRAFT' ? 'bg-slate-100/90 text-slate-900 font-bold' : 'hover:bg-slate-50 text-slate-600'
                }`}
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-slate-500 capitalize">Draf</span>
                <span className="text-xl font-black font-mono text-slate-900">{manifestStatusCounts.DRAFT}</span>
              </div>
              <span className={`text-xs font-black font-mono px-2 py-0.5 rounded-md border transition-all ${filterManifestStatus === 'DRAFT' ? 'bg-[#00a389] text-white border-[#00a389]' : 'bg-slate-100 text-slate-500 border-slate-200/80'
                }`}>
                {manifestsList.length > 0 ? `${((manifestStatusCounts.DRAFT / manifestsList.length) * 100).toFixed(0)}%` : '0%'}
              </span>
            </div>

            {/* Metric 3: Terkunci */}
            <div
              onClick={() => { setFilterManifestStatus('LOCKED'); setCurrentManifestPage(1); handleSwitchTab('daftar-manifest'); }}
              className={`p-3 px-3.5 flex items-center justify-between transition-all cursor-pointer rounded-md ${filterManifestStatus === 'LOCKED' ? 'bg-slate-100/90 text-slate-900 font-bold' : 'hover:bg-slate-50 text-slate-600'
                }`}
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-slate-500 capitalize">Terkunci</span>
                <span className="text-xl font-black font-mono text-slate-900">{manifestStatusCounts.LOCKED}</span>
              </div>
              <span className={`text-xs font-black font-mono px-2 py-0.5 rounded-md border transition-all ${filterManifestStatus === 'LOCKED' ? 'bg-[#00a389] text-white border-[#00a389]' : 'bg-slate-100 text-slate-500 border-slate-200/80'
                }`}>
                {manifestsList.length > 0 ? `${((manifestStatusCounts.LOCKED / manifestsList.length) * 100).toFixed(0)}%` : '0%'}
              </span>
            </div>

            {/* Metric 4: Dikirim */}
            <div
              onClick={() => { setFilterManifestStatus('SENT'); setCurrentManifestPage(1); handleSwitchTab('daftar-manifest'); }}
              className={`p-3 px-3.5 flex items-center justify-between transition-all cursor-pointer rounded-md ${filterManifestStatus === 'SENT' ? 'bg-slate-100/90 text-slate-900 font-bold' : 'hover:bg-slate-50 text-slate-600'
                }`}
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-slate-500 capitalize">Dikirim</span>
                <span className="text-xl font-black font-mono text-slate-900">{manifestStatusCounts.SENT}</span>
              </div>
              <span className={`text-xs font-black font-mono px-2 py-0.5 rounded-md border transition-all ${filterManifestStatus === 'SENT' ? 'bg-[#00a389] text-white border-[#00a389]' : 'bg-slate-100 text-slate-500 border-slate-200/80'
                }`}>
                {manifestsList.length > 0 ? `${((manifestStatusCounts.SENT / manifestsList.length) * 100).toFixed(0)}%` : '0%'}
              </span>
            </div>
          </div>
        </div>

        {/* Clean View Mode Switcher Tabs (Equal Width 2 Tabs Layout) */}
        <div className="bg-slate-100/90 border border-slate-200/80 p-1 rounded-md grid grid-cols-2 gap-1 shadow-3xs select-none">
          <button
            type="button"
            onClick={() => handleSwitchTab("daftar-manifest")}
            className={`py-2 px-3 rounded-md text-xs font-bold text-center transition-all cursor-pointer ${workspaceTab === "daftar-manifest"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
          >
            Pilih Manifest Pengiriman
          </button>
          <button
            type="button"
            onClick={() => handleSwitchTab("kelola-pengiriman")}
            className={`py-2 px-3 rounded-md text-xs font-bold text-center transition-all cursor-pointer ${workspaceTab === "kelola-pengiriman"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
          >
            Kelola Pengiriman
          </button>
        </div>

        {/* Error & Success Banners */}
        {error && (
          <div className="bg-rose-50/90 border border-rose-200 text-rose-800 text-xs font-bold rounded-md px-4 py-3 flex items-start gap-2 animate-fadeIn shrink-0 shadow-3xs">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError("")} className="text-rose-400 hover:text-rose-600 shrink-0 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        {success && (
          <div className="bg-emerald-50/90 border border-emerald-200 text-[#008f78] text-xs font-bold rounded-md px-4 py-3 flex items-start gap-2 animate-fadeIn shrink-0 shadow-3xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
            <span className="flex-1">{success}</span>
            <button onClick={() => setSuccess("")} className="text-emerald-500 hover:text-emerald-700 shrink-0 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ==================== TAB: DAFTAR MANIFEST ==================== */}
        {workspaceTab === "daftar-manifest" && (
          <div className="bg-white border border-slate-200/90 rounded-md p-5 sm:p-6 shadow-3xs flex flex-col gap-6 min-h-[300px]">
            {/* Header row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 select-none">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
                {/* Search Manifest */}
                <div className="relative w-full md:w-[403px] max-w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
                  <input
                    type="text"
                    ref={searchManifestInputRef}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className="w-full h-10 pl-10 pr-14 bg-white hover:bg-slate-50 focus:bg-white border border-slate-200 hover:border-slate-300 focus:border-[#00a389] rounded-md text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-3xs"
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 z-10 p-0.5 rounded-full hover:bg-slate-100 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Right side controls: Buat Button + Refresh Button */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleCreateManifest}
                    disabled={loading}
                    className="px-4 py-2 h-10 bg-[#00a389] hover:bg-[#008f78] active:scale-95 text-white font-extrabold text-xs rounded-md shadow-3xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Buat</span>
                  </button>

                  <button
                    onClick={() => fetchInitialData(true)}
                    disabled={isRefreshing || listLoading}
                    className="p-2.5 h-10 w-10 rounded-md border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-500 shadow-3xs transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center shrink-0"
                    title="Refresh Data"
                  >
                    <RefreshCw className={`w-4 h-4 transition-all duration-300 ${isRefreshing ? 'animate-spin text-[#00a389]' : ''}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Status Pills for Manifests */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0 select-none pb-1">
              {['ALL', 'DRAFT', 'LOCKED', 'SENT'].map((st) => {
                const isActive = filterManifestStatus === st;
                const count = manifestStatusCounts[st] ?? 0;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setFilterManifestStatus(st)}
                    className={`px-3.5 py-1 rounded-full text-[10px] font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer border ${isActive
                      ? 'bg-[#00a389] text-white border-[#00a389] shadow-3xs'
                      : 'bg-white text-slate-500 hover:bg-slate-50 border-gray-200/90'
                      }`}
                  >
                    {st !== 'ALL' && (
                      <span className={`w-1.5 h-1.5 rounded-full ${st === 'DRAFT' ? 'bg-slate-300' : st === 'LOCKED' ? 'bg-amber-400' : 'bg-emerald-400'
                        }`} />
                    )}
                    <span>{st === 'ALL' ? 'Semua' : getStatusLabel(st)}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-extrabold ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Manifest Grid (Exact Preserved Content, Rounded-md Updated) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {loading && manifestsList.length === 0 ? (
                <div className="col-span-full py-20 flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-[#00a389]" />
                  <span className="text-xs font-semibold text-slate-500">Memuat data...</span>
                </div>
              ) : filteredManifests.length === 0 ? (
                <div className="col-span-full py-20 text-center text-xs text-slate-400 font-medium italic select-none">
                  {searchQuery || filterManifestStatus !== 'ALL'
                    ? "Tidak ada manifest yang sesuai dengan kriteria pencarian."
                    : "Daftar manifest pengiriman kosong. Silakan buat manifest baru untuk memulai."}
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
                      className={`p-4 rounded-md border flex flex-col justify-between gap-3.5 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer relative overflow-hidden group select-none min-h-[140px] ${isSelected
                        ? "bg-[#00a389]/5 border-[#00a389] shadow-md ring-2 ring-[#00a389]/20"
                        : "bg-white border-slate-200/90 hover:border-slate-350 hover:shadow-md"
                        }`}
                    >
                      {/* Top Row: Manifest Number & Status Badge */}
                      <div className="flex items-center justify-between gap-2 w-full">
                        <span className="text-xs font-bold text-slate-800 font-mono tracking-tight truncate">
                          {highlightText(m.nomorManifest, searchQuery)}
                        </span>

                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border leading-none capitalize tracking-wider shrink-0 ${m.status === 'LOCKED'
                          ? 'bg-slate-900 text-slate-100 border-slate-800'
                          : m.status === 'SENT'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          }`}>
                          <span>{getStatusLabel(m.status)}</span>
                        </span>
                      </div>

                      {/* Middle (Body): 2 Columns divided by vertical line separator */}
                      <div className="py-2 px-1 bg-slate-50 rounded-md border border-slate-100 flex items-center text-[10px]">
                        {/* Left Column: Jumlah Bundle */}
                        <div className="flex-1 flex items-center justify-center font-extrabold text-[#008f78]">
                          <span>{bundlesCount} Bundle</span>
                        </div>

                        {/* Vertical Line Separator */}
                        <div className="w-px h-3.5 bg-slate-200/90 shrink-0" />

                        {/* Right Column: Total Pemohon */}
                        <div className="flex-1 flex items-center justify-center font-semibold text-slate-600">
                          <span>{totalPecahanCount} Pemohon</span>
                        </div>
                      </div>

                      {/* Bottom Row: Pengirim avatar + tanggal */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-5.5 h-5.5 rounded-full bg-[#00a389] text-white text-[8px] font-black flex items-center justify-center shrink-0 shadow-3xs" title={m.pengirim?.name}>
                            {getAvatarInitials(m.pengirim?.name)}
                          </div>
                          <span className="text-[9px] font-semibold text-slate-500 truncate max-w-[110px]" title={m.pengirim?.name}>
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
              <div className="flex-1 flex flex-col items-center justify-center text-center py-20 px-8 select-none bg-white p-8 rounded-md border border-slate-200/90 shadow-3xs min-h-[300px]">
                <div className="w-14 h-14 bg-[#00a389]/10 border border-[#00a389]/20 rounded-md flex items-center justify-center mb-4 shadow-3xs">
                  <Truck className="w-7 h-7 text-[#00a389]" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 mb-1">Pilih Manifest Terlebih Dahulu</h3>
                <p className="text-xs text-slate-400 font-semibold max-w-sm leading-relaxed mb-4">
                  Silakan pilih salah satu manifest di tab <strong>Daftar Manifest</strong> terlebih dahulu untuk mengelola pengiriman map bundle.
                </p>
                <button
                  onClick={() => handleSwitchTab("daftar-manifest")}
                  className="px-4 py-2 bg-[#00a389] hover:bg-[#008f78] text-white font-extrabold text-xs rounded-md shadow-3xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Boxes className="w-3.5 h-3.5" />
                  <span>Ke Daftar Manifest</span>
                </button>
              </div>
            ) : (
              /* Master-Detail Split Panel Layout */
              <div className="bg-white border border-slate-200/90 rounded-md p-5 sm:p-6 shadow-3xs flex flex-col gap-6 min-h-[500px]">

                {/* Top Header Bar */}
                <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4 select-none">
                  <div>
                    <h2 className="font-extrabold text-[13px] capitalize tracking-wider text-slate-700 font-display flex items-center gap-2">
                      <span className="font-mono font-black text-slate-900 text-sm">{selectedManifest.nomorManifest}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border leading-none capitalize tracking-wider ${selectedManifest.status === 'LOCKED'
                        ? 'bg-slate-900 text-slate-100 border-slate-800'
                        : selectedManifest.status === 'SENT'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        }`}>
                        {getStatusLabel(selectedManifest.status)}
                      </span>
                    </h2>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                      Kelola daftar bundle terpasang dan kirim berkas permohonan ke supervisor/tanda terima.
                    </p>
                  </div>
                </div>

                {/* Grid 2 Columns: Antrean Bundle & Bundle Terpasang */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">

                  {/* KIRI: Antrean Bundle Tersedia */}
                  <div className="bg-white border border-slate-200/90 rounded-md p-5 shadow-3xs flex flex-col gap-3 h-[420px]">
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
                        <div className="my-auto py-6 px-4 flex flex-col items-center justify-center text-center bg-slate-50/50 rounded-md border border-dashed border-slate-200 select-none gap-2">
                          <p className="text-xs font-bold text-slate-600">Antrean Bundle Kosong</p>
                          <p className="text-[10px] text-slate-400 font-medium">Tidak ada map bundle locked terarsip di antrean.</p>
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
                              className="p-3.5 sm:p-4 bg-slate-50/70 border border-slate-200/80 rounded-md text-xs flex flex-col justify-between gap-3 hover:border-[#00a389]/40 transition-all select-none shrink-0 min-h-[76px]"
                            >
                              <div className="flex items-center justify-between gap-3 w-full">
                                <span className="text-xs font-bold text-slate-800 font-mono tracking-tight truncate">
                                  {b.nomorBundle}
                                </span>
                                <span className="flex items-center justify-center bg-[#f25c54] text-white text-[10px] font-black w-5 h-5 rounded-full shrink-0 shadow-2xs" title={`${bTotalPecahan} Berkas`}>
                                  {bTotalPecahan}
                                </span>
                              </div>

                              <div className="flex items-center justify-between gap-3 w-full">
                                <span className="bg-emerald-50 text-[#008f78] text-[9px] font-extrabold px-2 py-0.5 rounded-md border border-emerald-200 uppercase leading-none shrink-0">
                                  {getAbbreviatedJenis(b.jenisPermohonan)}
                                </span>

                                {selectedManifest.status === "DRAFT" && (
                                  <button
                                    onClick={() => handleAddBundle(b.id)}
                                    disabled={loading}
                                    className="py-1 px-2.5 bg-[#00a389] hover:bg-[#008f78] text-white font-extrabold text-[10px] rounded-md transition-all active:scale-95 cursor-pointer flex items-center gap-1 shadow-3xs shrink-0"
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
                  <div className="bg-white border border-slate-200/90 rounded-md p-5 shadow-3xs flex flex-col gap-3 h-[420px]">
                    <div className="flex items-center justify-between shrink-0 border-b border-slate-100 pb-3">
                      <h4 className="text-xs font-black text-slate-700 capitalize tracking-wider select-none flex items-center gap-2">
                        <span>Bundle Terpasang</span>
                        <span className="bg-emerald-50 text-[#008f78] text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
                          {(selectedManifest.bundle || []).length}
                        </span>
                      </h4>
                    </div>

                    <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto pr-1 scrollbar-thin">
                      {selectedManifest.bundle?.length === 0 ? (
                        <div className="my-auto py-6 px-4 flex flex-col items-center justify-center text-center bg-slate-50/50 rounded-md border border-dashed border-slate-200 select-none gap-2">
                          <p className="text-xs font-bold text-slate-600">Belum Ada Bundle Terpasang</p>
                          <p className="text-[10px] text-slate-400 font-medium">Belum ada map bundle yang terpasang dalam manifest ini.</p>
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
                              className={`p-3.5 sm:p-4 rounded-md border transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 relative overflow-hidden select-none shrink-0 min-h-[76px] ${isSelectedBundle
                                ? "bg-[#00a389]/5 border-[#00a389] shadow-md ring-2 ring-[#00a389]/20"
                                : "bg-slate-50/60 border-slate-200 hover:border-slate-300 hover:bg-white"
                                }`}
                            >
                              {/* Left Active Indicator Strip */}
                              {isSelectedBundle && (
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#00a389] rounded-l-md" />
                              )}

                              <div className="flex items-center justify-between gap-3 w-full">
                                <span className="text-xs font-bold text-slate-800 font-mono tracking-tight truncate">
                                  {b.nomorBundle}
                                </span>
                                <span className="flex items-center justify-center bg-[#f25c54] text-white text-[10px] font-black w-5 h-5 rounded-full shrink-0 shadow-2xs" title={`${bTotalPecahan} Berkas`}>
                                  {bTotalPecahan}
                                </span>
                              </div>

                              <div className="flex items-center justify-between gap-3 w-full">
                                <span className="bg-emerald-50 text-[#008f78] text-[9px] font-extrabold px-2 py-0.5 rounded-md border border-emerald-200 uppercase leading-none shrink-0">
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

                {/* CARD DETAIL PERMOHONAN */}
                <div className="w-full">
                  <div className="bg-[#f8fafc] rounded-md border border-slate-200/90 p-3.5 flex flex-col gap-3 shadow-3xs animate-fadeIn">

                    {/* COMMAND BAR CARD */}
                    <div className="bg-white border border-slate-200/90 rounded-md p-3 shadow-3xs flex flex-col md:flex-row md:items-center justify-between gap-3 select-none">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
                        {selectedBundleInManifest && (
                          <div className="relative w-full md:w-80">
                            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="text"
                              value={searchBundlePermohonanQuery}
                              onChange={(e) => setSearchBundlePermohonanQuery(e.target.value)}
                              placeholder="Cari NOPEL, NOP, Pemohon... (Ctrl+K)"
                              className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200/90 rounded-md text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#00a389] focus:bg-white transition-all"
                            />
                            {searchBundlePermohonanQuery && (
                              <button
                                type="button"
                                onClick={() => setSearchBundlePermohonanQuery('')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {selectedBundleInManifest && (
                        <div className="flex items-center gap-2.5 shrink-0 justify-end flex-wrap">
                          {/* Segmented Display Mode Switcher */}
                          <div className="inline-flex p-0.5 bg-slate-100 border border-slate-200/80 rounded-md select-none">
                            <button
                              type="button"
                              onClick={() => setBundleDisplayMode('berkas')}
                              className={`px-2.5 py-1 rounded text-[11px] font-extrabold transition-all cursor-pointer ${bundleDisplayMode === 'berkas'
                                ? 'bg-white text-[#008f78] shadow-xs'
                                : 'text-slate-500 hover:text-slate-800'
                                }`}
                            >
                              Nopel
                            </button>
                            <button
                              type="button"
                              onClick={() => setBundleDisplayMode('pemohon')}
                              className={`px-2.5 py-1 rounded text-[11px] font-extrabold transition-all cursor-pointer ${bundleDisplayMode === 'pemohon'
                                ? 'bg-white text-[#008f78] shadow-xs'
                                : 'text-slate-500 hover:text-slate-800'
                                }`}
                            >
                              Pemohon
                            </button>
                          </div>

                          {/* Export Excel Button */}
                          <a
                            href={`/api/export/bundle/${selectedBundleInManifest.id}`}
                            download
                            className="p-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-md transition-all shadow-3xs cursor-pointer flex items-center justify-center"
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
                              className="p-1.5 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-all cursor-pointer shadow-3xs flex items-center justify-center disabled:opacity-40"
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
                      <div className="w-full bg-white border border-slate-200/90 rounded-md shadow-3xs overflow-hidden flex flex-col">
                        <div className="overflow-x-auto scrollbar-thin max-h-[440px]">
                          <table className="w-full text-left border-collapse select-none">
                            <thead>
                              <tr className="bg-slate-50 text-[10px] font-extrabold text-slate-600 uppercase tracking-wider text-left border-b border-slate-200 sticky top-0 z-10 shadow-2xs whitespace-nowrap">
                                <th className="py-3 px-4 text-center w-12 min-w-[48px]">No</th>
                                <th className="py-3 px-2 text-center select-none w-10 min-w-[40px]">⭐</th>
                                <th className="py-3 px-4 min-w-[110px]">Tgl. Input</th>
                                <th className="py-3 px-4 min-w-[130px]">Petugas Input</th>
                                <th className="py-3 px-4 min-w-[110px]">Tgl. Nopel</th>
                                <th className="py-3 px-4 min-w-[110px]">Tgl. Selesai</th>
                                <th className="py-3 px-4 min-w-[150px]">No. Pelayanan</th>
                                <th className="py-3 px-4 min-w-[210px] whitespace-nowrap">Nomor Objek Pajak</th>
                                <th className="py-3 px-4 min-w-[180px]">Nama Pemohon</th>
                                <th className="py-3 px-4 min-w-[110px]">Jenis Layanan</th>
                                <th className="py-3 px-4 text-center min-w-[100px]">Status</th>
                                <th className="py-3 px-4 text-center w-24 min-w-[96px]">Aksi</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white text-xs font-semibold text-slate-700">
                              {paginatedBundlePermohonanList.length === 0 ? (
                                <tr>
                                  <td colSpan={12} className="py-14 text-center text-xs text-slate-400 font-bold italic bg-slate-50/50">
                                    Tidak ada berkas permohonan yang cocok.
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
                                      className={`hover:bg-slate-50 transition-colors duration-150 cursor-pointer group relative text-xs font-semibold text-slate-700 ${p.isPecahanRow ? "border-l-3 border-l-[#00a389] bg-[#00a389]/5" : isFrozen ? "bg-amber-50/20" : ""
                                        }`}
                                    >
                                      <td className="py-3 px-4 text-center text-xs font-bold text-slate-400 font-mono">
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

                                      <td className="py-3 px-4 text-xs font-bold text-slate-600 font-sans whitespace-nowrap uppercase">
                                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase() : '—'}
                                      </td>

                                      <td className="py-3 px-4 text-slate-700 text-xs font-bold font-sans whitespace-nowrap uppercase">
                                        <div className="flex items-center gap-1.5 min-w-0" title={p.penginput?.name || "Petugas Input"}>
                                          <span className="truncate max-w-[130px] uppercase font-sans">{p.penginput?.name || "Petugas Input"}</span>
                                        </div>
                                      </td>

                                      <td className="py-3 px-4 text-xs font-bold text-slate-600 font-sans whitespace-nowrap uppercase">{nopolDate.toUpperCase()}</td>

                                      <td className="py-3 px-4 whitespace-nowrap font-sans">
                                        {p.tanggalPenyelesaian ? (
                                          <div className="flex items-center gap-1">
                                            {isOverdue(p.tanggalPenyelesaian, p.status) && (
                                              <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                            )}
                                            <span className={`text-xs font-sans font-bold uppercase ${isOverdue(p.tanggalPenyelesaian, p.status)
                                              ? 'text-rose-600 font-bold'
                                              : 'text-slate-600'
                                              }`}>
                                              {penyelesaianDate.toUpperCase()}
                                            </span>
                                          </div>
                                        ) : "—"}
                                      </td>

                                      <td className="py-3 px-4 min-w-[150px] group/cell relative font-sans">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <span className="text-xs font-bold text-slate-700 font-sans tracking-tight uppercase">
                                            {p.nomorPelayanan || p.nomorPermohonan}
                                          </span>
                                          {isFrozen && (
                                            <span className="text-[8px] font-extrabold uppercase bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 select-none">
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
                                          <span className="text-xs font-bold text-slate-700 font-sans whitespace-nowrap uppercase">
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
                                          <span className="text-xs font-bold text-slate-700 whitespace-nowrap uppercase font-sans">
                                            {(p.displayNamaWajibPajak || p.namaWajibPajak).toUpperCase()}
                                          </span>
                                          {p.isPecahanRow && (
                                            <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-1.5 py-0.2 rounded-md shrink-0 font-sans">
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
                                          className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200/90 px-2 py-0.5 rounded uppercase font-sans tracking-wide select-none"
                                          title={p.jenisPermohonan?.replace(/_/g, " ")}
                                        >
                                          {getAbbreviatedJenis(p.jenisPermohonan || selectedBundleInManifest.jenisPermohonan)}
                                        </span>
                                      </td>

                                      <td className="py-3 px-4 text-center font-sans">
                                        <div className="flex items-center justify-center">
                                          {isFrozen ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 select-none">
                                              <Clock className="w-2.5 h-2.5 text-amber-600 animate-spin" />
                                              Frozen
                                            </span>
                                          ) : (
                                            <span className={`inline-flex text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase font-sans ${p.status === "ARCHIVED" ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-sky-100 text-sky-800 border-sky-200"}`}>
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
                        <div className="border-t border-slate-200/90 bg-slate-50/80 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold text-slate-600 select-none">
                          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                            <span className="text-slate-500">
                              Menampilkan {filteredBundlePermohonanList.length > 0 ? (activeBundlePermohonanPage - 1) * itemsPerBundlePermohonanPage + 1 : 0} - {Math.min(activeBundlePermohonanPage * itemsPerBundlePermohonanPage, filteredBundlePermohonanList.length)} dari {filteredBundlePermohonanList.length} permohonan
                            </span>
                            <div className="flex items-center gap-1">
                              {[10, 20, 50].map((size) => (
                                <button
                                  key={size}
                                  type="button"
                                  onClick={() => setItemsPerBundlePermohonanPage(size)}
                                  className={`px-2 py-0.5 rounded text-[11px] font-extrabold transition-all cursor-pointer ${itemsPerBundlePermohonanPage === size
                                    ? 'bg-[#00a389] text-white'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                  {size}
                                </button>
                              ))}
                              <span className="text-[11px] text-slate-400 font-bold ml-0.5">/hal</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setCurrentBundlePermohonanPage((prev) => Math.max(prev - 1, 1))}
                              disabled={activeBundlePermohonanPage === 1}
                              className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-xs font-bold"
                            >
                              Sebelumnya
                            </button>
                            <span className="px-2 text-slate-600 font-bold text-xs">
                              {activeBundlePermohonanPage} / {totalBundlePermohonanPages}
                            </span>
                            <button
                              type="button"
                              onClick={() => setCurrentBundlePermohonanPage((prev) => Math.min(prev + 1, totalBundlePermohonanPages))}
                              disabled={activeBundlePermohonanPage === totalBundlePermohonanPages}
                              className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-xs font-bold"
                            >
                              Selanjutnya
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="py-10 px-4 flex flex-col items-center justify-center text-center bg-slate-50/50 rounded-md border border-dashed border-slate-200 select-none gap-3 animate-fadeIn">
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

                {/* Bottom Action Bar Footer */}
                <div className="border border-slate-200/90 bg-slate-50 p-5 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none shadow-3xs mt-auto">
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

                  <div className="flex items-center gap-2 justify-end shrink-0 flex-wrap">
                    {selectedManifest.status === "DRAFT" && (
                      <button
                        onClick={handleLockManifest}
                        disabled={loading || selectedManifest.bundle?.length === 0}
                        className="px-4 py-2 bg-[#00a389] hover:bg-[#008f78] active:scale-95 text-white font-extrabold text-xs rounded-md shadow-3xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Kunci Manifest"
                      >
                        <Lock className="w-4 h-4 text-white" />
                        <span>Kunci Manifest</span>
                      </button>
                    )}

                    {selectedManifest.status === "LOCKED" && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={handleRevisiManifest}
                          disabled={loading}
                          className="px-3 py-2 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md font-extrabold text-xs transition-all cursor-pointer shadow-3xs flex items-center gap-1.5 disabled:opacity-40"
                          title="Batal Kunci Manifest"
                        >
                          <Unlock className="w-4 h-4 text-rose-600" />
                          <span>Revisi Manifest</span>
                        </button>

                        <a
                          href={`/api/pdf/surat-pengantar-manifest/${selectedManifest.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 text-slate-700 hover:text-[#008f78] bg-white border border-slate-200 hover:border-slate-300 rounded-md font-extrabold text-xs transition-all cursor-pointer shadow-3xs flex items-center gap-1.5"
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
                          className="px-4 py-2 text-white bg-[#00a389] hover:bg-[#008f78] active:scale-95 rounded-md font-extrabold text-xs shadow-3xs transition-all cursor-pointer flex items-center gap-1.5"
                          title="Unggah Bukti Tanda Terima"
                        >
                          <Upload className="w-4 h-4 text-white" />
                          <span>Unggah Bukti Tanda Terima</span>
                        </button>
                      </div>
                    )}

                    {selectedManifest.status === "SENT" && selectedManifest.buktiTandaTerima && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <a
                          href={`/api/pdf/surat-pengantar-manifest/${selectedManifest.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 text-slate-700 hover:text-[#008f78] bg-white border border-slate-200 hover:border-slate-300 rounded-md font-extrabold text-xs transition-all cursor-pointer shadow-3xs flex items-center gap-1.5"
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
