"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { DetailsModal } from "@/components/workspaces/shared/DetailsModal";
import { BundleSnapshotDrawer } from "@/components/workspaces/shared/BundleSnapshotDrawer";

import { useArchivistBundleManagement } from "./bundle-archivist/useArchivistBundleManagement";
import { useArchivistArsipQueue } from "./queue-archivist/useArchivistArsipQueue";
import { useArchivistStatistics } from "./statistic-archivist/useArchivistStatistics";
import { ArchivistKPIStrip } from "./statistic-archivist/ArchivistKPIStrip";
import { ArchivistBundleToolbar } from "./bundle-archivist/ArchivistBundleToolbar";
import { ArchivistBundleGrid } from "./bundle-archivist/ArchivistBundleGrid";
import { ArchivistArsipToolbar } from "./queue-archivist/ArchivistArsipToolbar";
import { ArchivistArsipTable } from "./queue-archivist/ArchivistArsipTable";
import { ArchivistCorrectionModal } from "./modal-archivist/ArchivistCorrectionModal";
import { ArchivistFractionsModal } from "./modal-archivist/ArchivistFractionsModal";
import { PengarsipBundleSkeleton, PengarsipArsipSkeleton } from "@/components/skeletons/ArchivistSkeleton";

export type ViewMode = "bundle" | "arsip";

export default function ArchivistWorkspace() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read URL query parameter ?tab=...&view=bundle|arsip
  const viewParam = searchParams.get("view");
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (viewParam === "arsip") return "arsip";
    return "bundle";
  });

  const viewModeRef = useRef(viewMode);
  viewModeRef.current = viewMode;

  useEffect(() => {
    if (viewParam && (viewParam === "arsip" || viewParam === "bundle") && viewParam !== viewModeRef.current) {
      setViewMode(viewParam as ViewMode);
      viewModeRef.current = viewParam as ViewMode;
    }
  }, [viewParam]);

  const handleSwitchTab = useCallback(
    (mode: ViewMode) => {
      setViewMode(mode);
      viewModeRef.current = mode;
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("view", mode);
        window.history.replaceState(null, "", url.toString());
      }
    },
    []
  );

  // Sub-domain Custom Hooks
  const bundleMgmt = useArchivistBundleManagement();
  const arsipQueue = useArchivistArsipQueue({
    permohonanList: bundleMgmt.permohonanList,
    selectedBundle: bundleMgmt.selectedBundle,
    fetchBundleDetail: bundleMgmt.fetchBundleDetail,
    fetchBundles: bundleMgmt.fetchBundles,
    checkPermohonanNeedsReupload: bundleMgmt.checkPermohonanNeedsReupload,
  });

  const metrics = useArchivistStatistics(
    bundleMgmt.allPermohonanList,
    bundleMgmt.bundlesList,
    bundleMgmt.checkPermohonanNeedsReupload
  );

  const [versionDrawerBundle, setVersionDrawerBundle] = useState<any>(null);

  useEffect(() => {
    bundleMgmt.fetchData();
  }, []);

  const error = bundleMgmt.error || arsipQueue.error;
  const setError = (msg: string) => {
    bundleMgmt.setError(msg);
    arsipQueue.setError(msg);
  };

  const success = bundleMgmt.success || arsipQueue.success;
  const setSuccess = (msg: string) => {
    bundleMgmt.setSuccess(msg);
    arsipQueue.setSuccess(msg);
  };

  const isLoading = bundleMgmt.loading || arsipQueue.loading;

  return (
    <div className="w-full font-sans select-none flex flex-col gap-4 animate-fadeIn">
      {/* SUCCESS / ERROR ALERTS */}
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")} className="font-bold">✕</button>
        </div>
      )}
      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg flex items-center justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess("")} className="font-bold">✕</button>
        </div>
      )}

      {/* TOP HEADER: WORKSPACE TITLE, NAV TABS & REFRESH BUTTON */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none font-sans">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Digitalisasi Arsip</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* NAVIGATION TABS (RIGHT-ALIGNED NAV TABS) */}
          <div className="bg-slate-100/90 border border-slate-200/80 p-1 rounded-md flex items-center gap-1 shadow-3xs">
            <button
              onClick={() => handleSwitchTab("bundle")}
              className={`py-1.5 px-3 rounded-md text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                viewMode === "bundle"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              <span>Pilih Bundle</span>
            </button>

            <button
              onClick={() => handleSwitchTab("arsip")}
              className={`py-1.5 px-3 rounded-md text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                viewMode === "arsip"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              <span>Upload Arsip</span>
            </button>
          </div>

          <button
            onClick={() => {
              if (viewMode === "bundle") {
                bundleMgmt.fetchBundles();
              } else {
                bundleMgmt.fetchData();
              }
            }}
            disabled={bundleMgmt.isRefreshing || isLoading}
            className="h-9 px-3.5 bg-white border border-slate-200/90 hover:border-slate-300 rounded-md flex items-center gap-2 text-slate-700 hover:text-slate-900 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 shadow-3xs"
            title="Refresh Seluruh Data Workspace"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${bundleMgmt.isRefreshing || isLoading ? "animate-spin text-[#00a389]" : ""}`} />
          </button>
        </div>
      </div>

      {/* KPI STRIP */}
      <ArchivistKPIStrip
        metrics={metrics}
        filterBundleStatus={bundleMgmt.filterBundleStatus}
        onFilterChange={bundleMgmt.setFilterBundleStatus}
        onSwitchTab={handleSwitchTab}
      />

      {/* THIN DIVIDER LINE BELOW KPI STRIP */}
      <div className="w-full border-b border-slate-200/80 my-0.5" />

      {/* MAIN VIEW CONTENT */}
      {(() => {
        const hasInitialData = bundleMgmt.bundlesList.length > 0 || bundleMgmt.permohonanList.length > 0;
        if (!hasInitialData && bundleMgmt.listLoading) {
          return viewMode === "bundle" ? <PengarsipBundleSkeleton /> : <PengarsipArsipSkeleton />;
        }
        return null;
      })()}

      <div className={viewMode === "bundle" ? "flex flex-col gap-4" : "hidden"}>
        <ArchivistBundleToolbar
          searchBundleQuery={bundleMgmt.searchBundleQuery}
          onSearchChange={bundleMgmt.setSearchBundleQuery}
          filterBundleStatus={bundleMgmt.filterBundleStatus}
          onFilterStatusChange={bundleMgmt.setFilterBundleStatus}
          filterBundleJenisLayanan={bundleMgmt.filterBundleJenisLayanan}
          onFilterJenisLayananChange={bundleMgmt.setFilterBundleJenisLayanan}
          bundleJenisCounts={bundleMgmt.bundleJenisCounts}
        />
        <ArchivistBundleGrid
          bundlesList={bundleMgmt.bundlesList}
          filteredBundlesList={bundleMgmt.filteredBundlesList}
          selectedBundle={bundleMgmt.selectedBundle}
          loading={isLoading}
          searchBundleQuery={bundleMgmt.searchBundleQuery}
          currentBundlePage={bundleMgmt.currentBundlePage}
          itemsPerBundlePage={bundleMgmt.itemsPerBundlePage}
          onSelectBundle={bundleMgmt.handleSelectBundle}
          onPageChange={bundleMgmt.setCurrentBundlePage}
          bundleHasReupload={bundleMgmt.bundleHasReupload}
          onOpenVersionDrawer={(b) => setVersionDrawerBundle(b)}
        />
      </div>

      <div className={viewMode === "arsip" ? "flex flex-col gap-4" : "hidden"}>
        <ArchivistArsipToolbar
          selectedBundle={bundleMgmt.selectedBundle}
          bundlesList={bundleMgmt.bundlesList}
          onSelectBundle={bundleMgmt.handleSelectBundle}
          arsipDisplayMode={arsipQueue.arsipDisplayMode}
          onDisplayModeChange={arsipQueue.setArsipDisplayMode}
        />
        <ArchivistArsipTable
          filteredArsipList={arsipQueue.filteredArsipList}
          selectedBundle={bundleMgmt.selectedBundle}
          searchArsipQuery={arsipQueue.searchArsipQuery}
          currentArsipPage={arsipQueue.currentArsipPage}
          itemsPerArsipPage={arsipQueue.itemsPerArsipPage}
          arsipDisplayMode={arsipQueue.arsipDisplayMode}
          copiedText={arsipQueue.copiedText}
          loading={isLoading}
          uploadingTargetId={arsipQueue.uploadingTargetId}
          onSelectRequest={arsipQueue.setGlobalSelectedRequest}
          onToggleFavorite={arsipQueue.handleToggleFavorite}
          onCopy={arsipQueue.handleCopy}
          onUploadFile={arsipQueue.handleUploadFile}
          onToggleArchiveStatus={arsipQueue.handleToggleArchiveStatus}
          triggerFileInput={arsipQueue.triggerFileInput}
          fileInputRefs={arsipQueue.fileInputRefs}
          checkPermohonanNeedsReupload={bundleMgmt.checkPermohonanNeedsReupload}
          onOpenCorrectionModal={arsipQueue.openCorrectionModal}
          onOpenFractionsModal={(item) => {
            arsipQueue.setFractionTargetPermohonan(item);
            arsipQueue.setShowFractionsModal(true);
          }}
          onPageChange={arsipQueue.setCurrentArsipPage}
          onItemsPerPageChange={arsipQueue.setItemsPerArsipPage}
        />
      </div>

      {/* MODAL DETAIL PERMOHONAN */}
      {arsipQueue.globalSelectedRequest && (
        <DetailsModal
          isOpen={!!arsipQueue.globalSelectedRequest}
          onClose={() => arsipQueue.setGlobalSelectedRequest(null)}
          selectedRequest={arsipQueue.globalSelectedRequest}
        />
      )}

      {/* MODAL KOREKSI / PENGEMBALIAN */}
      {arsipQueue.showCorrectionModal && (
        <ArchivistCorrectionModal
          isOpen={arsipQueue.showCorrectionModal}
          correctionTarget={arsipQueue.correctionTarget}
          correctionReason={arsipQueue.correctionReason}
          loading={isLoading}
          onReasonChange={arsipQueue.setCorrectionReason}
          onClose={() => {
            arsipQueue.setShowCorrectionModal(false);
            arsipQueue.setCorrectionTarget(null);
            arsipQueue.setCorrectionReason("");
          }}
          onSubmit={arsipQueue.handleRequestCorrection}
        />
      )}

      {/* MODAL MUTASI SEBAGIAN PECAHAN */}
      {arsipQueue.showFractionsModal && arsipQueue.fractionTargetPermohonan && (
        <ArchivistFractionsModal
          isOpen={arsipQueue.showFractionsModal}
          permohonan={arsipQueue.fractionTargetPermohonan}
          loading={isLoading}
          uploadingTargetId={arsipQueue.uploadingTargetId}
          onClose={() => {
            arsipQueue.setShowFractionsModal(false);
            arsipQueue.setFractionTargetPermohonan(null);
          }}
          onUploadFile={arsipQueue.handleUploadFile}
          onToggleArchiveStatus={arsipQueue.handleToggleArchiveStatus}
          checkPermohonanNeedsReupload={bundleMgmt.checkPermohonanNeedsReupload}
        />
      )}

      {/* DRAWER RIWAYAT SNAPSHOT BUNDLE */}
      {versionDrawerBundle && (
        <BundleSnapshotDrawer
          isOpen={!!versionDrawerBundle}
          onClose={() => setVersionDrawerBundle(null)}
          bundle={versionDrawerBundle}
        />
      )}
    </div>
  );
}
