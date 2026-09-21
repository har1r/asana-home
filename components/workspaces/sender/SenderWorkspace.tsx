"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, X, CheckCircle2, RefreshCw } from "lucide-react";
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

import { Plus, Lock, Check, ChevronDown } from "lucide-react";

type WorkspaceTab = "create-manifest" | "manage-shipping" | "lock-manifest";

export default function SenderWorkspace() {
  const { showConfirm } = useDashboard();

  const searchParams = useSearchParams();
  const viewParam = searchParams.get("view");
  const manifestParam = searchParams.get("manifest");

  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>(() => {
    if (viewParam === "manage-shipping") return "manage-shipping";
    if (viewParam === "lock-manifest") return "lock-manifest";
    return "create-manifest";
  });

  useEffect(() => {
    if (viewParam === "manage-shipping") {
      setWorkspaceTab("manage-shipping");
    } else if (viewParam === "lock-manifest") {
      setWorkspaceTab("lock-manifest");
    } else {
      setWorkspaceTab("create-manifest");
    }
  }, [viewParam]);

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

  const [isManifestDropdownOpen, setIsManifestDropdownOpen] = useState(false);

  const kpiState = useSenderKPIStats();

  const manifestState = useSenderManifest(
    showActionStatus,
    showConfirm,
    () => fetchInitialData(true)
  );

  const selectedManifestNumber = manifestState.selectedManifest?.manifestNumber || "";
  const draftManifestsList = (manifestState.manifestsList || []).filter((m: any) => m.status === "DRAFT");

  const queueState = useSenderInstalledBundle(manifestState.selectedManifest);
  const bundleState = useSenderBundle(showActionStatus, () => fetchInitialData(true));
  const tableState = useSenderTable(queueState.selectedBundleInManifest);

  const handleSwitchTab = useCallback(
    (mode: WorkspaceTab) => {
      setWorkspaceTab(mode);
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("view", mode);
        if (mode !== "lock-manifest") {
          url.searchParams.delete("bundle");
        } else if (queueState.selectedBundleInManifest) {
          const rawNo = queueState.selectedBundleInManifest.bundleNumber || queueState.selectedBundleInManifest.id;
          url.searchParams.set("bundle", rawNo);
        }
        window.history.replaceState(null, "", url.toString());
      }
    },
    [queueState.selectedBundleInManifest]
  );

  const fetchInitialData = useCallback(
    async (isManualRefresh = false) => {
      const startTime = performance.now();
      if (isManualRefresh) setIsRefreshing(true);
      else setListLoading(true);
      setError("");

      try {
        const manifestsRes = await getManifests({ status: "ALL", limit: 48, search: manifestState.activeSearchQuery });
        if (manifestsRes.success && "list" in manifestsRes) {
          const fetchedManifests = manifestsRes.list || [];
          manifestState.setManifestsList(fetchedManifests);

          const targetManifest =
            manifestState.selectedManifest ||
            (manifestParam
              ? fetchedManifests.find(
                (m: any) =>
                  m.manifestNumber === manifestParam ||
                  m.id === manifestParam
              )
              : null);
          if (targetManifest) {
            const detailRes = await getManifestDetails(targetManifest.id);
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
        const duration = (performance.now() - startTime).toFixed(2);
        console.log(
          `%c[DATA LOAD] %cSenderWorkspace data loaded in %c${duration}ms`,
          'color: #00a389; font-weight: bold;',
          'color: #64748b;',
          'color: #f59e0b; font-weight: bold;'
        );
      } catch (err: any) {
        setError(err.message || "Kesalahan koneksi ke server.");
      } finally {
        setListLoading(false);
        setIsRefreshing(false);
      }
    },
    [manifestState.selectedManifest, manifestState.activeSearchQuery, queueState.selectedBundleInManifest, kpiState.fetchKPIStats, manifestParam]
  );

  useEffect(() => {
    fetchInitialData();
  }, []);

  return (
    <div id="pengirim-board-root" className="w-full font-sans select-none animate-fadeIn flex flex-col gap-4">
      {listLoading && workspaceTab === "create-manifest" && <SenderManifestSkeleton />}
      {listLoading && (workspaceTab === "manage-shipping" || workspaceTab === "lock-manifest") && <SenderShippingSkeleton />}

      <div className={`flex flex-col gap-4 ${listLoading ? "hidden" : ""}`}>
        <div className="flex flex-wrap items-center justify-between gap-2 w-full font-sans select-none">
          {/* Container Tab Switcher */}
          <div className="flex items-center gap-1 rounded-md border border-slate-200/80 bg-slate-100/90 p-1 shadow-xs">
            {([
              { id: "create-manifest", label: "Buat Manifest" },
              { id: "manage-shipping", label: "Kelola Pengiriman" },
              { id: "lock-manifest", label: "Kunci Manifest" },
            ] as const).map((tab, index) => (
              <React.Fragment key={tab.id}>
                {index > 0 && <div className="h-4 w-px bg-slate-300/80" />}

                <button
                  type="button"
                  onClick={() => handleSwitchTab(tab.id)}
                  className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${workspaceTab === tab.id
                    ? "bg-white text-black shadow-xs"
                    : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900"
                    }`}
                >
                  <span>{tab.label}</span>
                </button>
              </React.Fragment>
            ))}
          </div>

          {/* Tombol Refresh */}
          <button
            type="button"
            onClick={() => fetchInitialData(true)}
            disabled={isRefreshing || listLoading}
            className="flex h-9 cursor-pointer items-center gap-2 rounded-md border border-slate-400/90 px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs transition-all hover:border-slate-700 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-50"
            title="Refresh Seluruh Data Workspace"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-[#00a389]" : ""}`} />
            <span>Refresh Data</span>
          </button>
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
            handleSwitchTab("create-manifest");
          }}
        />

        <div className="flex flex-col sm:flex-col gap-4">
          <span className="text-[18px] font-bold text-slate-900 tracking-tight">Statistik Manifest</span>
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

        {workspaceTab === "create-manifest" && (
          <div className="flex flex-col gap-4 min-h-[300px] font-sans">
            <div className="flex justify-between items-center justify-between">
              <span className="text-[18px] font-bold text-slate-900 tracking-tight">Daftar Manifest</span>
              <div className="flex items-center justify-end gap-2 shrink-0 font-sans">
                <button
                  onClick={manifestState.handleCreateManifest}
                  disabled={manifestState.loading}
                  className="px-2 py-2 h-8 bg-[#00a389] hover:bg-[#008f78] active:scale-95 text-white font-normal text-[13px] font-sans rounded-md shadow-3xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Buat Manifest</span>
                </button>
              </div>
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
            <div className="flex items-center justify-between">
              <span className="text-[18px] font-bold text-slate-900 tracking-tight">Daftar Bundel Draf</span>
              <div className="relative shrink-0 flex items-center gap-2.5 flex-wrap font-sans">
                {draftManifestsList.length > 0 ? (
                  <div className="relative font-sans">
                    <button
                      type="button"
                      onClick={() => setIsManifestDropdownOpen(!isManifestDropdownOpen)}
                      className="h-8 px-2 py-2 bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-slate-300 rounded-md flex items-center gap-1.5 text-xs font-semibold text-slate-800 transition-all cursor-pointer shadow-3xs font-sans"
                      title="Pilih Target Manifest (Draf)"
                    >
                      <span className="font-mono text-slate-900 font-bold truncate max-w-[220px]">
                        {selectedManifestNumber || "Pilih Target Manifest Draf"}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5 shrink-0" />
                    </button>

                    {isManifestDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-20"
                          onClick={() => setIsManifestDropdownOpen(false)}
                        />
                        <div className="absolute right-0 mt-1 w-72 bg-white border border-slate-200 rounded-md shadow-lg z-30 py-1 max-h-60 overflow-y-auto font-sans">
                          <div className="px-3 py-1.5 text-[11px] font-light text-slate-500 capitalize border-b border-slate-100 antialiased">
                            Pilih Target Manifest
                          </div>

                          {draftManifestsList.map((m: any) => {
                            const isSelected = manifestState.selectedManifest?.id === m.id;
                            const rawNum = m.nomorManifest || m.manifestNumber || m.id || "—";
                            return (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() => {
                                  if (manifestState.handleSelectManifest) manifestState.handleSelectManifest(m);
                                  setIsManifestDropdownOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${isSelected ? "bg-emerald-50 text-[#00a389] font-semibold" : "text-slate-700 hover:bg-slate-50"
                                  }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <span className="font-mono truncate">{rawNum}</span>
                                </div>
                                {isSelected && <Check className="w-3.5 h-3.5 text-[#00a389] shrink-0 ml-2" />}
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="h-8 px-2 py-2 bg-slate-100/80 border border-slate-200/80 rounded-md flex items-center gap-1.5 text-xs font-medium text-slate-500 shadow-3xs font-sans">
                    <span className="font-mono text-slate-600 truncate max-w-[220px]">
                      {selectedManifestNumber || "Belum Ada Manifest Draf"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <SenderBundleToolbar
              searchQuery={bundleState.searchQuery}
              onSearchChange={bundleState.setSearchQuery}
              onSearchSubmit={bundleState.handleSearchSubmit}
              onClearSearch={bundleState.handleClearSearch}
              loading={manifestState.loading || queueState.queueLoading || bundleState.loading}
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
              <div className="flex flex-col gap-4 w-full font-sans">
                <div className="flex items-center justify-between">
                  <span className="text-[18px] font-bold text-slate-900 tracking-tight">Daftar Bundel Terpasang</span>
                  <div className="flex gap-2">
                    <div className="relative shrink-0 flex items-center gap-2.5 flex-wrap font-sans">
                      {draftManifestsList.length > 0 ? (
                        <div className="relative font-sans">
                          <button
                            type="button"
                            onClick={() => setIsManifestDropdownOpen(!isManifestDropdownOpen)}
                            className="h-8 px-2 py-2 bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-slate-300 rounded-md flex items-center gap-1.5 text-xs font-semibold text-slate-800 transition-all cursor-pointer shadow-3xs font-sans"
                            title="Pilih Target Manifest (Draf)"
                          >
                            <span className="font-mono text-slate-900 font-bold truncate max-w-[220px]">
                              {selectedManifestNumber || "Pilih Target Manifest Draf"}
                            </span>
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5 shrink-0" />
                          </button>

                          {isManifestDropdownOpen && (
                            <>
                              <div
                                className="fixed inset-0 z-20"
                                onClick={() => setIsManifestDropdownOpen(false)}
                              />
                              <div className="absolute right-0 mt-1 w-72 bg-white border border-slate-200 rounded-md shadow-lg z-30 py-1 max-h-60 overflow-y-auto font-sans">
                                <div className="px-3 py-1.5 text-[11px] font-light text-slate-500 capitalize border-b border-slate-100 antialiased">
                                  Pilih Target Manifest
                                </div>

                                {draftManifestsList.map((m: any) => {
                                  const isSelected = manifestState.selectedManifest?.id === m.id;
                                  const rawNum = m.nomorManifest || m.manifestNumber || m.id || "—";
                                  return (
                                    <button
                                      key={m.id}
                                      type="button"
                                      onClick={() => {
                                        if (manifestState.handleSelectManifest) manifestState.handleSelectManifest(m);
                                        setIsManifestDropdownOpen(false);
                                      }}
                                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${isSelected ? "bg-emerald-50 text-[#00a389] font-semibold" : "text-slate-700 hover:bg-slate-50"
                                        }`}
                                    >
                                      <div className="flex items-center gap-2 truncate">
                                        <span className="font-mono truncate">{rawNum}</span>
                                      </div>
                                      {isSelected && <Check className="w-3.5 h-3.5 text-[#00a389] shrink-0 ml-2" />}
                                    </button>
                                  );
                                })}
                              </div>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="h-8 px-2 py-2 bg-slate-100/80 border border-slate-200/80 rounded-md flex items-center gap-1.5 text-xs font-medium text-slate-500 shadow-3xs font-sans">
                          <span className="font-mono text-slate-600 truncate max-w-[220px]">
                            {selectedManifestNumber || "Belum Ada Manifest Draf"}
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={manifestState.handleLockManifest}
                      disabled={manifestState.loading || manifestState.selectedManifest === 0}
                      className="px-2 py-2 h-8 bg-[#00a389] hover:bg-[#008f78] active:scale-95 text-white font-normal text-[13px] font-sans rounded-md shadow-3xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50 capitalize"
                      title="Kunci Manifest untuk siap dikirim"
                    >
                      <Lock className="w-4 h-4 text-white stroke-[2]" />
                      <span>Kunci Manifest</span>
                    </button>
                  </div>
                </div>
                <SenderInstalledBundleToolbar
                  searchQuery={queueState.searchQuery}
                  onSearchChange={queueState.setSearchQuery}
                  onSearchSubmit={queueState.handleSearchSubmit}
                  onClearSearch={queueState.handleClearSearch}
                  loading={manifestState.loading || queueState.queueLoading}
                />

                <SenderInstalledBundleGrid
                  installedBundles={manifestState.selectedManifest ? (manifestState.selectedManifest.bundles || manifestState.selectedManifest.bundle || []) : []}
                  selectedBundleInManifest={queueState.selectedBundleInManifest}
                  manifestStatus={manifestState.selectedManifest?.status || "DRAFT"}
                  searchQuery={queueState.activeSearchQuery}
                  loading={manifestState.loading || queueState.queueLoading}
                  onSelectBundle={queueState.handleSelectBundle}
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
              <div className="flex flex-col gap-3 shadow-3xs animate-fadeIn">
                <SenderApplicationsToolbar
                  selectedBundleInManifest={queueState.selectedBundleInManifest}
                  bundleDisplayMode={tableState.bundleDisplayMode}
                  onDisplayModeChange={tableState.setBundleDisplayMode}
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
