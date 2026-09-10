"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { AlertTriangle, X, CheckCircle2, Boxes, RefreshCw } from "lucide-react";
import { RevisionAlertBanner } from "@/components/workspaces/shared/RevisionAlertBanner";
import { BundleVersionDrawer } from "@/components/workspaces/shared/BundleVersionDrawer";
import { DetailsModal } from "@/components/workspaces/shared/DetailsModal";
import { useDashboard } from "@/context/DashboardContext";
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
  ajukanKembalikanKePengarsip,
} from "@/app/actions/sender";

// Sub-Domain Components & Hooks
import { SenderKPIStrip } from "./statistic-sender/SenderKPIStrip";
import { useSenderManifest } from "./manifest-sender/useSenderManifest";
import { SenderManifestToolbar } from "./manifest-sender/SenderManifestToolbar";
import { SenderManifestGrid } from "./manifest-sender/SenderManifestGrid";

import { useSenderQueue } from "./queue-sender/useSenderQueue";
import { SenderQueueHeader } from "./queue-sender/SenderQueueHeader";
import { SenderEligibleQueue } from "./queue-sender/SenderEligibleQueue";
import { SenderInstalledBundles } from "./queue-sender/SenderInstalledBundles";
import { SenderPermohonanToolbar } from "./queue-sender/SenderPermohonanToolbar";
import { SenderPermohonanTable } from "./queue-sender/SenderPermohonanTable";
import { SenderQueueActionBar } from "./queue-sender/SenderQueueActionBar";

import { SenderCorrectionModal } from "./modal-sender/SenderCorrectionModal";
import { PengirimManifestSkeleton, PengirimKelolaSkeleton } from "./SenderSkeleton";

type WorkspaceTab = "daftar-manifest" | "kelola-pengiriman";

export default function PengirimWorkspace() {
  const { showConfirm } = useDashboard();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read URL query parameter ?tab=...&view=daftar-manifest|kelola-pengiriman
  const viewParam = searchParams.get("view");

  // Workspace Tab State initialized from URL query param
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>(() => {
    if (viewParam === "kelola-pengiriman") return "kelola-pengiriman";
    return "daftar-manifest";
  });

  // Sync workspaceTab when URL query params change (e.g. Browser Back/Forward buttons)
  useEffect(() => {
    if (viewParam === "kelola-pengiriman") {
      setWorkspaceTab("kelola-pengiriman");
    } else {
      setWorkspaceTab("daftar-manifest");
    }
  }, [viewParam]);

  // Helper to switch workspace tab and update URL query param
  const handleSwitchTab = useCallback(
    (mode: WorkspaceTab) => {
      setWorkspaceTab(mode);
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("tab", "pengirim");
        url.searchParams.set("view", mode);
        window.history.replaceState(null, "", url.toString());
      }
    },
    []
  );

  // Core Data Lists and Selected States
  const [manifestsList, setManifestsList] = useState<any[]>([]);
  const [eligibleBundlesList, setEligibleBundlesList] = useState<any[]>([]);
  const [selectedManifest, setSelectedManifest] = useState<any | null>(null);

  // Drawers & Modals
  const [versionDrawerBundle, setVersionDrawerBundle] = useState<any | null>(null);
  const [selectedPermohonanForDetails, setSelectedPermohonanForDetails] = useState<any | null>(null);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [correctionTarget, setCorrectionTarget] = useState<any | null>(null);
  const [correctionReason, setCorrectionReason] = useState("");

  // States for search and loaders
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sub-Domain Hook: Sender Queue Management
  const queueState = useSenderQueue(selectedManifest);

  // Data Fetching
  const fetchInitialData = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) setIsRefreshing(true);
      else setListLoading(true);
      setError("");

      try {
        const manifestsRes = await getManifests();
        const bundlesRes = await getEligibleBundles();

        if (manifestsRes.success && "list" in manifestsRes) {
          const fetchedManifests = manifestsRes.list || [];
          setManifestsList(fetchedManifests);

          if (selectedManifest) {
            const detailRes = await getManifestDetails(selectedManifest.id);
            if (detailRes.success && "manifest" in detailRes && detailRes.manifest) {
              setSelectedManifest(detailRes.manifest);
              if (queueState.selectedBundleInManifest) {
                const bundleList =
                  (detailRes.manifest as any).bundles || (detailRes.manifest as any).bundle || [];
                const updatedBundle = bundleList.find(
                  (b: any) => b.id === queueState.selectedBundleInManifest.id
                );
                queueState.setSelectedBundleInManifest(updatedBundle || null);
              }
            }
          }
        }
        if (bundlesRes.success && "list" in bundlesRes) {
          setEligibleBundlesList(bundlesRes.list || []);
        }
      } catch (err: any) {
        setError(err.message || "Kesalahan koneksi ke server.");
      } finally {
        setListLoading(false);
        setIsRefreshing(false);
      }
    },
    [selectedManifest, queueState.selectedBundleInManifest]
  );

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Synchronous Manifest Selection on Click
  const handleSelectManifest = (manifest: any) => {
    setSelectedManifest(manifest);
    setError("");
    setSuccess("");

    // Background fetch to refresh details without blocking UI
    getManifestDetails(manifest.id)
      .then((res) => {
        if (res.success && "manifest" in res && res.manifest) {
          setSelectedManifest(res.manifest);
        }
      })
      .catch(() => {});
  };

  // Create Manifest Handler
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
        if (detail.success && "manifest" in detail && detail.manifest) {
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

  // Sub-Domain Hook: Sender Manifest Management
  const manifestState = useSenderManifest(
    manifestsList,
    handleSelectManifest,
    handleCreateManifest
  );

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

    if (queueState.selectedBundleInManifest?.id === bundleId) {
      queueState.setSelectedBundleInManifest(null);
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
      },
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
      },
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
      },
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

  return (
    <div id="pengirim-board-root" className="w-full font-sans select-none animate-fadeIn flex flex-col gap-4">
      {/* Show precision skeleton during initial data load */}
      {listLoading && workspaceTab === "daftar-manifest" && <PengirimManifestSkeleton />}
      {listLoading && workspaceTab === "kelola-pengiriman" && <PengirimKelolaSkeleton />}

      {/* Hide real content while skeleton is visible */}
      <div className={`flex flex-col gap-4 ${listLoading ? "hidden" : ""}`}>
        {/* HEADER RUANG KERJA (TOP BANNER) - Persis Peneliti */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none font-sans">
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Ruang Kerja Saya</h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* VIEW MODE SWITCHER TABS (RIGHT-ALIGNED NAV TABS) */}
            <div className="bg-slate-100/90 border border-slate-200/80 p-1 rounded-md flex items-center gap-1 shadow-2xs font-sans select-none">
              <button
                type="button"
                onClick={() => handleSwitchTab("daftar-manifest")}
                className={`py-1.5 px-3 rounded-md text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                  workspaceTab === "daftar-manifest"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                <span>Pilih Manifest Pengiriman</span>
              </button>

              <button
                type="button"
                onClick={() => handleSwitchTab("kelola-pengiriman")}
                className={`py-1.5 px-3 rounded-md text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                  workspaceTab === "kelola-pengiriman"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                <span>Kelola Pengiriman</span>
              </button>
            </div>

            {/* Action Header: Tombol Refresh Data */}
            <button
              onClick={() => fetchInitialData(true)}
              disabled={isRefreshing || listLoading}
              className="h-9 px-3.5 bg-white border border-slate-200/90 hover:border-slate-300 rounded-md flex items-center gap-2 text-slate-700 hover:text-slate-900 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 shadow-3xs"
              title="Refresh Seluruh Data Workspace"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#00a389]" : ""}`} />
            </button>
          </div>
        </div>

        {/* Alert Banner jika terdapat manifest draf / belum dikirim */}
        <RevisionAlertBanner
          count={manifestsList.filter((m) => m.status === "DRAFT").length}
          titlePrefix="Perhatian, "
          titleText="Manifest Pengiriman Dalam Draf"
          descriptionText="manifest pengiriman kargo berkas fisik yang belum terkunci atau belum diunggah resi bukti kirimnya."
          actionLabel="Lihat Draf Manifest"
          onAction={() => {
            manifestState.setFilterManifestStatus("DRAFT");
            handleSwitchTab("daftar-manifest");
          }}
        />

        {/* TIER 1: UNIFIED KPI STATS STRIP (PERSIS PENELITI/RESEARCHER) */}
        <SenderKPIStrip
          manifestStatusCounts={manifestState.manifestStatusCounts}
          totalManifests={manifestsList.length}
          filterManifestStatus={manifestState.filterManifestStatus}
          onSelectAll={() => {
            manifestState.setFilterManifestStatus("ALL");
            handleSwitchTab("daftar-manifest");
          }}
          onSelectDraft={() => {
            manifestState.setFilterManifestStatus("DRAFT");
            handleSwitchTab("daftar-manifest");
          }}
          onSelectLocked={() => {
            manifestState.setFilterManifestStatus("LOCKED");
            handleSwitchTab("daftar-manifest");
          }}
          onSelectSent={() => {
            manifestState.setFilterManifestStatus("SENT");
            handleSwitchTab("daftar-manifest");
          }}
        />

        {/* THIN DIVIDER LINE BELOW KPI STRIP (PERSIS PENELITI & PENGARSIP) */}
        <div className="w-full border-b border-slate-200/80 my-0.5" />

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

        {/* ==================== TAB 1: DAFTAR MANIFEST ==================== */}
        {workspaceTab === "daftar-manifest" && (
          <div className="flex flex-col gap-4 min-h-[300px] font-sans">
            <SenderManifestToolbar
              searchQuery={manifestState.searchQuery}
              onSearchChange={manifestState.setSearchQuery}
              isSearchFocused={manifestState.isSearchFocused}
              onSearchFocus={() => manifestState.setIsSearchFocused(true)}
              onSearchBlur={() => manifestState.setIsSearchFocused(false)}
              searchInputRef={manifestState.searchManifestInputRef}
              onCreateManifest={handleCreateManifest}
              onRefresh={() => fetchInitialData(true)}
              loading={loading}
              isRefreshing={isRefreshing}
              listLoading={listLoading}
            />

            <SenderManifestGrid
              loading={loading}
              manifestsList={manifestsList}
              filteredManifests={manifestState.filteredManifests}
              visibleManifests={manifestState.visibleManifests}
              selectedManifest={selectedManifest}
              searchQuery={manifestState.searchQuery}
              hasMore={manifestState.hasMore}
              onLoadMore={manifestState.loadMore}
              onSelectManifest={handleSelectManifest}
            />
          </div>
        )}

        {/* ==================== TAB 2: KELOLA PENGIRIMAN ==================== */}
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
                <h3 className="text-[13px] font-normal text-slate-800 mb-1 capitalize font-sans">
                  Pilih Manifest Terlebih Dahulu
                </h3>
                <p className="text-[12px] text-slate-500 font-normal max-w-sm leading-relaxed mb-4 font-sans">
                  Silakan pilih salah satu manifest di tab{" "}
                  <strong className="font-normal text-slate-700">Daftar Manifest</strong> terlebih dahulu untuk
                  mengelola pengiriman map bundle.
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
                {/* Header Bar */}
                <SenderQueueHeader selectedManifest={selectedManifest} />

                {/* Grid 2 Columns: Antrean Bundle & Bundle Terpasang */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch font-sans">
                  <SenderEligibleQueue
                    eligibleBundlesList={eligibleBundlesList}
                    manifestStatus={selectedManifest.status}
                    loading={loading}
                    onAddBundle={handleAddBundle}
                    onOpenVersionDrawer={setVersionDrawerBundle}
                  />

                  <SenderInstalledBundles
                    installedBundles={selectedManifest.bundle || []}
                    selectedBundleInManifest={queueState.selectedBundleInManifest}
                    onSelectBundle={queueState.setSelectedBundleInManifest}
                    onOpenVersionDrawer={setVersionDrawerBundle}
                  />
                </div>

                {/* Card Detail Permohonan */}
                <div className="w-full">
                  <div className="bg-[#f8fafc] rounded-md border border-slate-200/90 p-3.5 flex flex-col gap-3 shadow-3xs animate-fadeIn">
                    <SenderPermohonanToolbar
                      selectedBundleInManifest={queueState.selectedBundleInManifest}
                      manifestStatus={selectedManifest.status}
                      bundleDisplayMode={queueState.bundleDisplayMode}
                      onDisplayModeChange={queueState.setBundleDisplayMode}
                      onRemoveBundle={handleRemoveBundle}
                      loading={loading}
                    />

                    <SenderPermohonanTable
                      selectedBundleInManifest={queueState.selectedBundleInManifest}
                      selectedManifestStatus={selectedManifest.status}
                      bundleDisplayMode={queueState.bundleDisplayMode}
                      searchQuery={queueState.searchBundlePermohonanQuery}
                      filteredBundlePermohonanList={queueState.filteredBundlePermohonanList}
                      paginatedBundlePermohonanList={queueState.paginatedBundlePermohonanList}
                      copiedText={queueState.copiedText}
                      loading={loading}
                      activePage={queueState.currentBundlePermohonanPage}
                      itemsPerPage={queueState.itemsPerBundlePermohonanPage}
                      totalPages={queueState.totalBundlePermohonanPages}
                      onPageChange={queueState.setCurrentBundlePermohonanPage}
                      onItemsPerPageChange={queueState.setItemsPerBundlePermohonanPage}
                      onCopy={queueState.handleCopy}
                      onToggleFavorite={queueState.handleToggleFavorite}
                      onSelectDetails={setSelectedPermohonanForDetails}
                      onOpenCorrectionModal={openCorrectionModal}
                      onReportBundleLost={handleReportBundleLost}
                    />
                  </div>
                </div>

                {/* Action Bar Footer */}
                <SenderQueueActionBar
                  selectedManifest={selectedManifest}
                  loading={loading}
                  fileInputRef={fileInputRef}
                  onLockManifest={handleLockManifest}
                  onRevisiManifest={handleRevisiManifest}
                  onUploadReceipt={handleUploadReceipt}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal: Ajukan Kembalikan ke Pengarsip */}
      <SenderCorrectionModal
        isOpen={showCorrectionModal}
        correctionTarget={correctionTarget}
        correctionReason={correctionReason}
        loading={loading}
        onReasonChange={setCorrectionReason}
        onClose={() => {
          setShowCorrectionModal(false);
          setCorrectionTarget(null);
        }}
        onSubmit={handleRequestCorrection}
      />

      {/* Details Modal Overlay */}
      <DetailsModal
        isOpen={!!selectedPermohonanForDetails}
        selectedRequest={selectedPermohonanForDetails}
        onClose={() => setSelectedPermohonanForDetails(null)}
      />

      {/* Drawer Riwayat Versi Bundle */}
      {versionDrawerBundle && (
        <BundleVersionDrawer
          isOpen={!!versionDrawerBundle}
          onClose={() => setVersionDrawerBundle(null)}
          bundle={versionDrawerBundle}
        />
      )}
    </div>
  );
}
