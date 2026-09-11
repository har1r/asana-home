"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { RefreshCw, Boxes, AlertTriangle, X, CheckCircle2 } from "lucide-react";
import { getMonitoringPermohonan } from "@/app/actions/monitor";
import { useDashboard } from "@/context/DashboardContext";
import { EmptyDataAnimation } from "@/components/workspaces/shared/EmptyDataAnimation";
import { RevisionAlertBanner } from "@/components/workspaces/shared/RevisionAlertBanner";

// Sub-Domain Components & Hooks
import { useMonitorStatistics } from "./statistic-monitor/useMonitorStatistics";
import { MonitorKPIStrip } from "./statistic-monitor/MonitorKPIStrip";

import { useMonitorBundle } from "./bundle-monitor/useMonitorBundle";
import { MonitorBundleToolbar } from "./bundle-monitor/MonitorBundleToolbar";
import { MonitorBundleGrid } from "./bundle-monitor/MonitorBundleGrid";

import { useMonitorQueue } from "./queue-monitor/useMonitorQueue";
import { MonitorQueueHeader } from "./queue-monitor/MonitorQueueHeader";
import { MonitorPermohonanListPanel } from "./queue-monitor/MonitorPermohonanListPanel";
import { MonitorPermohonanDetailPanel } from "./queue-monitor/MonitorPermohonanDetailPanel";

import { MonitorRollbackModal } from "./modal-monitor/MonitorRollbackModal";
import { PemantauBundleSkeleton, PemantauPantauSkeleton } from "@/components/skeletons/MonitorSkeleton";

type WorkspaceTab = "daftar-bundle" | "daftar-pantau";

export default function PemantauWorkspace() {
  const { showConfirm } = useDashboard();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read URL query parameter ?tab=...&view=daftar-bundle|daftar-pantau
  const viewParam = searchParams.get("view");

  // Workspace Tab State initialized from URL query param
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>(() => {
    if (viewParam === "daftar-pantau") return "daftar-pantau";
    return "daftar-bundle";
  });

  // Sync workspaceTab when URL query params change (e.g. Browser Back/Forward buttons)
  useEffect(() => {
    if (viewParam === "daftar-pantau") {
      setWorkspaceTab("daftar-pantau");
    } else {
      setWorkspaceTab("daftar-bundle");
    }
  }, [viewParam]);

  // Helper to switch workspace tab and update URL query param
  const handleSwitchTab = useCallback(
    (mode: WorkspaceTab) => {
      setWorkspaceTab(mode);
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("tab", "pemantau");
        url.searchParams.set("view", mode);
        window.history.replaceState(null, "", url.toString());
      }
    },
    []
  );

  // Core Data Lists and Selected States
  const [permohonanList, setPermohonanList] = useState<any[]>([]);
  const [selectedBundle, setSelectedBundle] = useState<any | null>(null);

  // Loader states
  const [listLoading, setListLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Data Fetching
  const fetchData = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) setIsRefreshing(true);
      else setListLoading(true);

      try {
        const res = await getMonitoringPermohonan();
        if (res.success && "list" in res && res.list) {
          setPermohonanList(res.list);

          if (selectedBundle) {
            const updatedBundlePermohonans = res.list.filter((p: any) => p.bundleId === selectedBundle.id);
            if (updatedBundlePermohonans && updatedBundlePermohonans.length > 0) {
              setSelectedBundle((prev: any) => ({
                ...prev,
                permohonan: updatedBundlePermohonans,
              }));
            } else {
              setSelectedBundle(null);
            }
          }
        }
      } catch (err: any) {
        console.error("Fetch data error:", err);
      } finally {
        setListLoading(false);
        setIsRefreshing(false);
      }
    },
    [selectedBundle]
  );

  useEffect(() => {
    fetchData();
  }, []);

  // Sub-Domain Hooks
  const stats = useMonitorStatistics(permohonanList);

  const bundleState = useMonitorBundle(permohonanList, selectedBundle, (bundle) => {
    setSelectedBundle(bundle);
  });

  const queueState = useMonitorQueue(selectedBundle, setPermohonanList, fetchData, showConfirm);

  return (
    <div id="pemantau-board-root" className="w-full font-sans select-none animate-fadeIn flex flex-col gap-4">
      {/* Show precision skeleton during initial data load */}
      {listLoading && workspaceTab === "daftar-bundle" && <PemantauBundleSkeleton />}
      {listLoading && workspaceTab === "daftar-pantau" && <PemantauPantauSkeleton />}

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
                onClick={() => handleSwitchTab("daftar-bundle")}
                className={`py-1.5 px-3 rounded-md text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                  workspaceTab === "daftar-bundle"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                <span>Daftar Bundle Pemantauan</span>
              </button>

              <button
                type="button"
                onClick={() => handleSwitchTab("daftar-pantau")}
                className={`py-1.5 px-3 rounded-md text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                  workspaceTab === "daftar-pantau"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                <span>Selesaikan Permohonan</span>
              </button>
            </div>

            {/* Action Header: Tombol Refresh Data */}
            <button
              onClick={() => fetchData(true)}
              disabled={isRefreshing || listLoading}
              className="h-9 px-3.5 bg-white border border-slate-200/90 hover:border-slate-300 rounded-md flex items-center gap-2 text-slate-700 hover:text-slate-900 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 shadow-3xs"
              title="Refresh Seluruh Data Workspace"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#00a389]" : ""}`} />
            </button>
          </div>
        </div>

        {/* Alert Banner jika terdapat berkas frozen/sedang dikoreksi */}
        <RevisionAlertBanner
          count={permohonanList.filter((p) => p.permintaanKoreksi && p.permintaanKoreksi.length > 0).length}
          titlePrefix="Perhatian, "
          titleText="Berkas Dibekukan (Sedang Koreksi)"
          descriptionText="berkas permohonan sedang diajukan pembatalan/koreksi dan menunggu keputusan Supervisor."
          actionLabel="Lihat Antrean Pantau"
          onAction={() => {
            handleSwitchTab("daftar-pantau");
          }}
        />

        {/* TIER 1: UNIFIED KPI STATS STRIP (PERSIS PENELITI/RESEARCHER) */}
        <MonitorKPIStrip pemohonKpiCounts={stats.pemohonKpiCounts} />

        {/* THIN DIVIDER LINE BELOW KPI STRIP (PERSIS PENELITI & PENGARSIP) */}
        <div className="w-full border-b border-slate-200/80 my-0.5" />

        {/* Error & Success Banners */}
        {queueState.error && (
          <div className="bg-rose-50/90 border border-rose-200 text-rose-800 text-[13px] font-normal font-sans rounded-md px-4 py-3 flex items-start gap-2 animate-fadeIn shrink-0 shadow-3xs">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
            <span className="flex-1 font-sans">{queueState.error}</span>
            <button
              onClick={() => queueState.setError("")}
              className="text-rose-400 hover:text-rose-600 shrink-0 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        {queueState.success && (
          <div className="bg-emerald-50/90 border border-emerald-200 text-[#008f78] text-[13px] font-normal font-sans rounded-md px-4 py-3 flex items-start gap-2 animate-fadeIn shrink-0 shadow-3xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
            <span className="flex-1 font-sans">{queueState.success}</span>
            <button
              onClick={() => queueState.setSuccess("")}
              className="text-emerald-500 hover:text-emerald-700 shrink-0 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ==================== TAB 1: DAFTAR BUNDLE ==================== */}
        {workspaceTab === "daftar-bundle" && (
          <div className="flex flex-col gap-4 font-sans">
            <MonitorBundleToolbar
              searchQuery={bundleState.searchBundleQuery}
              onSearchChange={bundleState.setSearchBundleQuery}
              isSearchFocused={bundleState.isSearchFocused}
              onSearchFocus={() => bundleState.setIsSearchFocused(true)}
              onSearchBlur={() => bundleState.setIsSearchFocused(false)}
              searchInputRef={bundleState.searchBundleInputRef}
              filterJenisLayanan={bundleState.filterJenisLayanan}
              onFilterJenisChange={bundleState.setFilterJenisLayanan}
              bundleJenisCounts={bundleState.bundleJenisCounts}
            />

            <MonitorBundleGrid
              loading={queueState.loading}
              uniqueBundlesList={bundleState.uniqueBundlesList}
              filteredBundlesList={bundleState.filteredBundlesList}
              visibleBundles={bundleState.visibleBundles}
              selectedBundle={selectedBundle}
              searchQuery={bundleState.searchBundleQuery}
              hasMore={bundleState.hasMore}
              onLoadMore={bundleState.loadMore}
              onSelectBundle={(b) => {
                setSelectedBundle(b);
                queueState.setSelectedPermohonan(null);
              }}
            />
          </div>
        )}

        {/* ==================== TAB 2: DAFTAR PANTAU ==================== */}
        {workspaceTab === "daftar-pantau" && (
          <div className="w-full">
            {!selectedBundle ? (
              <div className="bg-white p-8 rounded-md border border-slate-200/90 shadow-3xs min-h-[350px] flex items-center justify-center font-sans">
                <EmptyDataAnimation
                  title="Pilih Bundle Terlebih Dahulu"
                  description={
                    <>
                      Silakan pilih salah satu bundle di tab <strong>Daftar Bundle</strong> terlebih dahulu untuk melihat
                      daftar permohonan yang harus dipantau.
                    </>
                  }
                  action={
                    <button
                      onClick={() => handleSwitchTab("daftar-bundle")}
                      className="px-4 py-2 bg-[#00a389] hover:bg-[#008f78] text-white font-extrabold text-xs rounded-md shadow-3xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 font-sans"
                    >
                      <Boxes className="w-4 h-4 stroke-[2]" />
                      <span>Ke Daftar Bundle</span>
                    </button>
                  }
                />
              </div>
            ) : (
              /* Master-Detail Stacked Panel Layout */
              <div className="bg-white border border-slate-200/90 rounded-md p-5 sm:p-6 shadow-3xs flex flex-col gap-6 min-h-[500px]">
                {/* Header Bar */}
                <MonitorQueueHeader
                  selectedBundle={selectedBundle}
                  isRefreshing={isRefreshing}
                  onRefresh={() => fetchData(true)}
                />

                {/* 2-Panel Layout: Panel Atas (Permohonan List) & Panel Bawah (Detail Permohonan) */}
                <div className="flex flex-col items-start gap-5 w-full font-sans">
                  <MonitorPermohonanListPanel
                    selectedBundle={selectedBundle}
                    selectedPermohonan={queueState.selectedPermohonan}
                    filteredPantauList={queueState.filteredPantauList}
                    paginatedPantau={queueState.paginatedPantau}
                    activePantauPage={queueState.currentPantauPage}
                    totalPantauPages={queueState.totalPantauPages}
                    onPageChange={queueState.setCurrentPantauPage}
                    onSelectPermohonan={queueState.setSelectedPermohonan}
                  />

                  <MonitorPermohonanDetailPanel
                    selectedPermohonan={queueState.selectedPermohonan}
                    checkedPecahanMap={queueState.checkedPecahanMap}
                    loading={queueState.loading}
                    onTogglePecahanVerified={queueState.handleTogglePecahanVerified}
                    onVerifyAllPecahan={queueState.handleVerifyAllPecahan}
                    onComplete={queueState.handleComplete}
                    onOpenRollbackModal={() => queueState.setShowRollbackModal(true)}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal: Ajukan Batal Selesai (Rollback) */}
      <MonitorRollbackModal
        isOpen={queueState.showRollbackModal}
        selectedPermohonan={queueState.selectedPermohonan}
        rollbackReason={queueState.rollbackReason}
        loading={queueState.loading}
        onReasonChange={queueState.setRollbackReason}
        onClose={() => {
          queueState.setShowRollbackModal(false);
          queueState.setRollbackReason("");
        }}
        onSubmit={queueState.handleRollback}
      />
    </div>
  );
}