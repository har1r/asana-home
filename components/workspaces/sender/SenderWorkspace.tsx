"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { AlertTriangle, X, CheckCircle2, Boxes, RefreshCw } from "lucide-react";
import { RevisionAlertBanner } from "@/components/workspaces/shared/RevisionAlertBanner";
import { BundleSnapshotDrawer } from "@/components/workspaces/shared/BundleSnapshotDrawer";
import { DetailsModal } from "@/components/workspaces/shared/DetailsModal";
import { ActionStatusModal } from "@/components/workspaces/shared/ActionStatusModal";
import { useDashboard } from "@/context/DashboardContext";
import {
  getEligibleBundles,
  getManifests,
  getManifestDetails,
} from "@/app/actions/sender";

import { SenderKPIStats } from "./kpi/SenderKPIStats";
import { useSenderKPIStats } from "./kpi/useSenderKPIStats";

import { useSenderManifest } from "./manifest/useSenderManifest";
import { SenderManifestToolbar } from "./manifest/SenderManifestToolbar";
import { SenderManifestGrid } from "./manifest/SenderManifestGrid";

import { useSenderInstalledBundle } from "./installed-bundle/useSenderInstalledBundle";
import { SenderInstalledBundleToolbar } from "./installed-bundle/SenderInstalledBundleToolbar";
import { SenderInstalledBundleGrid } from "./installed-bundle/SenderInstalledBundleGrid";

import { useSenderBundle } from "./bundle/useSenderBundle";
import { SenderBundleToolbar } from "./bundle/SenderBundleToolbar";
import { SenderBundleGrid } from "./bundle/SenderBundleGrid";

import { useSenderTable } from "./table/useSenderTable";
import { SenderApplicationsToolbar } from "./table/SenderApplicationsToolbar";
import { SenderApplicationsTable } from "./table/SenderApplicationsTable";

import { SenderCorrectionModal } from "./modals/SenderCorrectionModal";
import { LockManifestConfirmationModal } from "./modals/LockManifestConfirmationModal";
import { SenderManifestSkeleton, SenderShippingSkeleton } from "@/components/skeletons/SenderSkeleton";

type WorkspaceTab = "manage-manifest" | "manage-shipping" | "lock-manifest";

export default function SenderWorkspace() {
  const { showConfirm } = useDashboard();

  const searchParams = useSearchParams();
  const viewParam = searchParams.get("view");

  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>(() => {
    if (viewParam === "manage-shipping") return "manage-shipping";
    if (viewParam === "lock-manifest") return "lock-manifest";
    return "manage-manifest";
  });

  useEffect(() => {
    if (viewParam === "manage-shipping") {
      setWorkspaceTab("manage-shipping");
    } else if (viewParam === "lock-manifest") {
      setWorkspaceTab("lock-manifest");
    } else {
      setWorkspaceTab("manage-manifest");
    }
  }, [viewParam]);

  const handleSwitchTab = useCallback(
    (mode: WorkspaceTab) => {
      setWorkspaceTab(mode);
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("view", mode);
        window.history.replaceState(null, "", url.toString());
      }
    },
    []
  );

  const [listLoading, setListLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusModalStatus, setStatusModalStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusModalTitle, setStatusModalTitle] = useState('');
  const [statusModalMessage, setStatusModalMessage] = useState('');

  const showActionStatus = useCallback(
    (status: 'loading' | 'success' | 'error', title: string, message: string) => {
      setStatusModalStatus(status);
      setStatusModalTitle(title);
      setStatusModalMessage(message);
      setStatusModalOpen(true);
    },
    []
  );

  const [versionDrawerBundle, setVersionDrawerBundle] = useState<any | null>(null);
  const [selectedPermohonanForDetails, setSelectedPermohonanForDetails] = useState<any | null>(null);

  const kpiState = useSenderKPIStats();

  const manifestState = useSenderManifest(
    showActionStatus,
    showConfirm,
    () => fetchInitialData(true)
  );

  const queueState = useSenderInstalledBundle(manifestState.selectedManifest);
  const bundleState = useSenderBundle(showActionStatus, () => fetchInitialData(true));
  const tableState = useSenderTable(queueState.selectedBundleInManifest);

  const fetchInitialData = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) setIsRefreshing(true);
      else setListLoading(true);
      setError("");

      try {
        const manifestsRes = await getManifests({ status: "ALL", limit: 48, search: manifestState.activeSearchQuery });
        if (manifestsRes.success && "list" in manifestsRes) {
          const fetchedManifests = manifestsRes.list || [];
          manifestState.setManifestsList(fetchedManifests);

          if (manifestState.selectedManifest) {
            const detailRes = await getManifestDetails(manifestState.selectedManifest.id);
            if (detailRes.success && "manifest" in detailRes && detailRes.manifest) {
              manifestState.setSelectedManifest(detailRes.manifest);
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

        const bundlesRes = await getEligibleBundles();
        if (bundlesRes.success && "list" in bundlesRes) {
          const eligibleList = bundlesRes.list || [];
          bundleState.setEligibleBundlesList(eligibleList);
        }

        await kpiState.fetchKPIStats();
      } catch (err: any) {
        setError(err.message || "Kesalahan koneksi ke server.");
      } finally {
        setListLoading(false);
        setIsRefreshing(false);
      }
    },
    [manifestState.selectedManifest, manifestState.activeSearchQuery, queueState.selectedBundleInManifest, kpiState.fetchKPIStats]
  );

  useEffect(() => {
    fetchInitialData();
  }, []);

  return (
    <div id="pengirim-board-root" className="w-full font-sans select-none animate-fadeIn flex flex-col gap-4">
      {listLoading && workspaceTab === "manage-manifest" && <SenderManifestSkeleton />}
      {listLoading && (workspaceTab === "manage-shipping" || workspaceTab === "lock-manifest") && <SenderShippingSkeleton />}

      <div className={`flex flex-col gap-4 ${listLoading ? "hidden" : ""}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-4 select-none font-sans">
          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="bg-slate-100/90 border border-slate-200/80 p-1 rounded-md flex items-center gap-1 shadow-2xs font-sans select-none">
              <button
                type="button"
                onClick={() => handleSwitchTab("manage-manifest")}
                className={`py-1.5 px-3 rounded-md text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${workspaceTab === "manage-manifest"
                  ? "bg-white text-black shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                  }`}
              >
                <span>Kelola Manifest</span>
              </button>

              <button
                type="button"
                onClick={() => handleSwitchTab("manage-shipping")}
                className={`py-1.5 px-3 rounded-md text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${workspaceTab === "manage-shipping"
                  ? "bg-white text-black shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                  }`}
              >
                <span>Kelola Pengiriman</span>
              </button>

              <button
                type="button"
                onClick={() => handleSwitchTab("lock-manifest")}
                className={`py-1.5 px-3 rounded-md text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${workspaceTab === "lock-manifest"
                  ? "bg-white text-black shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                  }`}
              >
                <span>Detail & Kunci</span>
              </button>
            </div>

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

        <div className="w-full border-b border-slate-200/80 my-0.5" />

        <RevisionAlertBanner
          count={manifestState.manifestsList.filter((m) => m.status === "DRAFT").length}
          titlePrefix="Perhatian, "
          titleText="Manifest Pengiriman Dalam Draf"
          descriptionText="manifest pengiriman kargo berkas fisik yang belum terkunci atau belum diunggah resi bukti kirimnya."
          actionLabel="Lihat Draf Manifest"
          onAction={() => {
            manifestState.setFilterManifestStatus("DRAFT");
            handleSwitchTab("manage-manifest");
          }}
        />

        <div className="flex flex-col sm:flex-col gap-4">
          <span className="text-base font-bold text-slate-700 tracking-tight">Statistik Manifest</span>
          <SenderKPIStats metrics={kpiState.metrics} />
        </div>

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

        {workspaceTab === "manage-manifest" && (
          <div className="flex flex-col gap-4 min-h-[300px] font-sans">
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-slate-700 tracking-tight">Daftar Manifest</span>
            </div>
            <SenderManifestToolbar
              searchQuery={manifestState.searchQuery}
              onSearchChange={manifestState.setSearchQuery}
              onSearchSubmit={manifestState.handleSearchSubmit}
              onClearSearch={manifestState.handleClearSearch}
              isSearchFocused={manifestState.isSearchFocused}
              onSearchFocus={() => manifestState.setIsSearchFocused(true)}
              onSearchBlur={() => manifestState.setIsSearchFocused(false)}
              searchInputRef={manifestState.searchManifestInputRef}
              onCreateManifest={manifestState.handleCreateManifest}
              onRefresh={() => fetchInitialData(true)}
              loading={manifestState.loading}
              isRefreshing={isRefreshing}
              listLoading={manifestState.isGridLoading}
            />

            <SenderManifestGrid
              loading={manifestState.isGridLoading}
              manifestsList={manifestState.manifestsList}
              filteredManifests={manifestState.filteredManifests}
              paginatedManifests={manifestState.paginatedManifests}
              selectedManifest={manifestState.selectedManifest}
              searchQuery={manifestState.activeSearchQuery}
              currentPage={manifestState.currentPage}
              totalPages={manifestState.totalPages}
              itemsPerPage={manifestState.itemsPerPage}
              onPageChange={manifestState.setCurrentPage}
              onItemsPerPageChange={(n) => {
                manifestState.setItemsPerPage(n);
                manifestState.setCurrentPage(1);
              }}
              onSelectManifest={manifestState.handleSelectManifest}
              onLockManifest={(id) => {
                const target = manifestState.manifestsList.find((m) => m.id === id);
                if (target) manifestState.setSelectedManifest(target);
                manifestState.handleLockManifest(target);
              }}
              onRevisiManifest={(id) => {
                const target = manifestState.manifestsList.find((m) => m.id === id);
                if (target) manifestState.setSelectedManifest(target);
                manifestState.handleRevisiManifest();
              }}
              onManageManifest={(m) => {
                manifestState.handleSelectManifest(m);
                handleSwitchTab("manage-shipping");
              }}
            />
          </div>
        )}

        {/* TAB 2: KELOLA PENGIRIMAN (Full-width Modular Bundle Grid & Toolbar) */}
        {workspaceTab === "manage-shipping" && (
          <div className="flex flex-col gap-4 w-full min-h-[500px] font-sans">

            <SenderBundleToolbar
              searchQuery={bundleState.searchQuery}
              onSearchChange={bundleState.setSearchQuery}
              onSearchSubmit={bundleState.handleSearchSubmit}
              onClearSearch={bundleState.handleClearSearch}
              onRefresh={() => fetchInitialData(true)}
              totalBundlesCount={bundleState.eligibleBundlesList.length}
              loading={manifestState.loading || queueState.queueLoading || bundleState.loading}
              isRefreshing={isRefreshing}
              selectedManifest={manifestState.selectedManifest}
              manifestsList={manifestState.manifestsList}
              onSelectManifest={manifestState.handleSelectManifest}
            />

            <SenderBundleGrid
              loading={manifestState.loading || queueState.queueLoading || bundleState.loading}
              bundlesList={bundleState.eligibleBundlesList}
              filteredBundles={bundleState.filteredBundles}
              paginatedBundles={bundleState.paginatedBundles}
              manifestStatus={manifestState.selectedManifest?.status || "DRAFT"}
              searchQuery={bundleState.activeSearchQuery}
              currentPage={bundleState.currentPage}
              totalPages={bundleState.totalPages}
              itemsPerPage={bundleState.itemsPerPage}
              onPageChange={bundleState.setCurrentPage}
              onItemsPerPageChange={bundleState.setItemsPerPage}
              onAddBundle={(id) =>
                bundleState.handleAddBundle(
                  id,
                  manifestState.selectedManifest,
                  manifestState.setManifestsList,
                  manifestState.setSelectedManifest
                )
              }
              onOpenVersionDrawer={setVersionDrawerBundle}
            />
          </div>
        )}

        {/* TAB 3: DETAIL & KUNCI MANIFEST (lock-manifest) */}
        {workspaceTab === "lock-manifest" && (
          <div className="flex flex-col gap-6 font-sans">
            <div className="flex flex-col gap-6 w-full font-sans">
              {/* 1. Map Bundle Terpasang dalam Manifest Ini (Modular Grid Card & Toolbar) */}
              <div className="flex flex-col gap-4 w-full font-sans">
                <SenderInstalledBundleToolbar
                  searchQuery={queueState.searchQuery}
                  onSearchChange={queueState.setSearchQuery}
                  onSearchSubmit={queueState.handleSearchSubmit}
                  onClearSearch={queueState.handleClearSearch}
                  onRefresh={() => fetchInitialData(true)}
                  installedBundlesCount={manifestState.selectedManifest ? (manifestState.selectedManifest.bundles || manifestState.selectedManifest.bundle || []).length : 0}
                  loading={manifestState.loading || queueState.queueLoading}
                  isRefreshing={isRefreshing}
                  selectedManifest={manifestState.selectedManifest}
                  manifestsList={manifestState.manifestsList}
                  onSelectManifest={manifestState.handleSelectManifest}
                  onLockManifest={manifestState.selectedManifest ? () => manifestState.handleLockManifest(manifestState.selectedManifest) : undefined}
                />

                <SenderInstalledBundleGrid
                  installedBundles={manifestState.selectedManifest ? (manifestState.selectedManifest.bundles || manifestState.selectedManifest.bundle || []) : []}
                  selectedBundleInManifest={queueState.selectedBundleInManifest}
                  manifestStatus={manifestState.selectedManifest?.status || "DRAFT"}
                  searchQuery={queueState.activeSearchQuery}
                  loading={manifestState.loading || queueState.queueLoading}
                  onSelectBundle={queueState.setSelectedBundleInManifest}
                  onOpenVersionDrawer={setVersionDrawerBundle}
                  onRemoveBundle={(id) =>
                    queueState.handleRemoveBundle(
                      id,
                      bundleState.setEligibleBundlesList,
                      manifestState.selectedManifest,
                      manifestState.setManifestsList,
                      manifestState.setSelectedManifest,
                      showActionStatus,
                      () => fetchInitialData(true)
                    )
                  }
                />
              </div>

              {/* 2. Toolbar & Tabel Detail Berkas Aplikasi Permohonan */}
              <div className="bg-[#f8fafc] rounded-md border border-slate-200/90 p-3.5 flex flex-col gap-3 shadow-3xs animate-fadeIn">
                <SenderApplicationsToolbar
                  selectedBundleInManifest={queueState.selectedBundleInManifest}
                  selectedManifest={manifestState.selectedManifest}
                  manifestStatus={manifestState.selectedManifest?.status || "DRAFT"}
                  bundleDisplayMode={tableState.bundleDisplayMode}
                  onDisplayModeChange={tableState.setBundleDisplayMode}
                  onRemoveBundle={(id) =>
                    queueState.handleRemoveBundle(
                      id,
                      bundleState.setEligibleBundlesList,
                      manifestState.selectedManifest,
                      manifestState.setManifestsList,
                      manifestState.setSelectedManifest,
                      showActionStatus,
                      () => fetchInitialData(true)
                    )
                  }
                  loading={manifestState.loading || queueState.queueLoading}
                />

                <SenderApplicationsTable
                  selectedBundleInManifest={queueState.selectedBundleInManifest}
                  selectedManifestStatus={manifestState.selectedManifest?.status || "DRAFT"}
                  bundleDisplayMode={tableState.bundleDisplayMode}
                  searchQuery={tableState.searchApplicationQuery}
                  filteredApplicationList={tableState.filteredApplicationList}
                  paginatedApplicationList={tableState.paginatedApplicationList}
                  copiedText={tableState.copiedText}
                  loading={manifestState.loading || queueState.queueLoading}
                  activePage={tableState.currentApplicationPage}
                  itemsPerPage={tableState.itemsPerApplicationPage}
                  totalPages={tableState.totalApplicationPages}
                  onPageChange={tableState.setCurrentApplicationPage}
                  onItemsPerPageChange={tableState.setItemsPerApplicationPage}
                  onCopy={tableState.handleCopy}
                  onToggleFavorite={tableState.handleToggleFavorite}
                  onSelectDetails={setSelectedPermohonanForDetails}
                  onOpenCorrectionModal={queueState.openCorrectionModal}
                  onReportBundleLost={(id, no) =>
                    queueState.handleReportBundleLost(
                      id,
                      no,
                      showConfirm,
                      showActionStatus,
                      () => fetchInitialData(true)
                    )
                  }
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <LockManifestConfirmationModal
        isOpen={manifestState.showLockManifestModal}
        manifest={manifestState.manifestToLock || manifestState.selectedManifest}
        onClose={() => {
          manifestState.setShowLockManifestModal(false);
          manifestState.setManifestToLock(null);
        }}
        onConfirm={(manifestId) => {
          manifestState.setShowLockManifestModal(false);
          manifestState.executeLockManifest(manifestId);
        }}
        isLoading={manifestState.loading}
      />

      <SenderCorrectionModal
        isOpen={queueState.showCorrectionModal}
        correctionTarget={queueState.correctionTarget}
        correctionReason={queueState.correctionReason}
        loading={queueState.queueLoading}
        onReasonChange={queueState.setCorrectionReason}
        onClose={() => {
          queueState.setShowCorrectionModal(false);
          queueState.setCorrectionTarget(null);
        }}
        onSubmit={(e) =>
          queueState.handleRequestCorrection(e, showActionStatus, () => fetchInitialData(true))
        }
      />

      <DetailsModal
        isOpen={!!selectedPermohonanForDetails}
        selectedRequest={selectedPermohonanForDetails}
        onClose={() => setSelectedPermohonanForDetails(null)}
      />

      {versionDrawerBundle && (
        <BundleSnapshotDrawer
          isOpen={!!versionDrawerBundle}
          onClose={() => setVersionDrawerBundle(null)}
          bundle={versionDrawerBundle}
        />
      )}

      <ActionStatusModal
        isOpen={statusModalOpen}
        status={statusModalStatus}
        title={statusModalTitle}
        message={statusModalMessage}
        onClose={() => {
          setStatusModalOpen(false);
          setStatusModalStatus("idle");
        }}
      />
    </div>
  );
}
