"use client";

import React, { useState, useRef } from "react";
import { ChevronLeft, Printer, FileCheck, Upload, RefreshCw, Search, X } from "lucide-react";
import { useSenderManifestHistory } from "./manifest/useSenderManifestHistory";
import { SenderManifestToolbarHistory } from "./manifest/SenderManifestToolbarHistory";
import { SenderManifestGridHistory } from "./manifest/SenderManifestGridHistory";
import { useSenderInstalledBundleHistory } from "./bundle/useSenderInstalledBundleHistory";
import { SenderBundleToolbarHistory } from "./bundle/SenderBundleToolbarHistory";
import { SenderBundleGridHistory } from "./bundle/SenderBundleGridHistory";
import { useSenderTableHistory } from "./table/useSenderTableHistory";
import { SenderApplicationsToolbarHistory } from "./table/SenderApplicationsToolbarHistory";
import { SenderApplicationsTableHistory } from "./table/SenderApplicationsTableHistory";
import { ActionStatusModal } from "@/components/workspaces/shared/ActionStatusModal";
import { SenderHistorySkeleton } from "@/components/skeletons/SenderHistorySkeleton";
import { SenderCancelShippingModal } from "./modals/SenderCancelShippingModal";
import { revisiManifest, uploadBuktiTandaTerima, kirimManifest, cancelManifestDelivery } from "@/app/actions/sender";




export default function SenderHistory() {
  // 1. Hook for History Manifest State & Data
  const manifestHistoryState = useSenderManifestHistory();

  // Selected manifest details and status
  const currentManifest = manifestHistoryState.selectedManifest;
  const rawManifestNumber = currentManifest?.manifestNumber || currentManifest?.nomorManifest || "—";
  const manifestStatus = currentManifest?.status || "LOCKED";
  const rawBundles = React.useMemo(() => {
    return currentManifest?.bundles || currentManifest?.bundle || [];
  }, [currentManifest?.id, currentManifest?.bundles, currentManifest?.bundle]);

  // 2. Hook for Installed Bundle List in Selected History Manifest
  const installedBundleState = useSenderInstalledBundleHistory(rawBundles);

  // 3. Hook for Application Table State of Selected Bundle
  const tableState = useSenderTableHistory(installedBundleState.selectedBundle);

  // Action Status Modal State
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusModalStatus, setStatusModalStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [statusModalTitle, setStatusModalTitle] = useState("");
  const [statusModalMessage, setStatusModalMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showActionStatus = (
    status: "loading" | "success" | "error",
    title: string,
    message: string
  ) => {
    setStatusModalStatus(status);
    setStatusModalTitle(title);
    setStatusModalMessage(message);
    setStatusModalOpen(true);
  };

  // Revert Lock to Draft Handler
  const handleRevisiManifest = async (manifestId: string) => {
    showActionStatus("loading", "Merevisi Manifest", "Sedang mengembalikan status manifest ke DRAFT...");
    try {
      const res: any = await revisiManifest(manifestId);
      if (res.success) {
        showActionStatus(
          "success",
          "Manifest Berhasil Direvisi",
          "Manifest berhasil dikembalikan ke status DRAFT dan dapat dikelola kembali di menu Buat Manifest."
        );
        manifestHistoryState.setSelectedManifest(null);
        await manifestHistoryState.refreshData();
      } else {
        showActionStatus("error", "Gagal Merevisi Manifest", res.error || "Gagal merevisi manifest.");
      }
    } catch (err: any) {
      showActionStatus("error", "Gagal Merevisi Manifest", err.message || "Sistem error saat merevisi.");
    }
  };

  // Upload Receipt Handler (Only saves receipt file, does NOT change status to SENT)
  const handleUploadReceipt = async (manifestId: string, file: File) => {
    showActionStatus("loading", "Mengunggah Resi Bukti Kirim", "Sedang memproses berkas bukti tanda terima...");
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res: any = await uploadBuktiTandaTerima(manifestId, formData);
      if (res.success) {
        showActionStatus(
          "success",
          "Bukti Berhasil Diunggah",
          "Bukti tanda terima berhasil disimpan. Klik 'Kirim Manifest' untuk menyelesaikan pengiriman."
        );
        if (currentManifest) {
          manifestHistoryState.handleSelectManifest(currentManifest);
        }
        await manifestHistoryState.refreshData();
      } else {
        showActionStatus("error", "Gagal Mengunggah Bukti", res.error || "Gagal mengunggah bukti resi.");
      }
    } catch (err: any) {
      showActionStatus("error", "Gagal Mengunggah Bukti", err.message || "Sistem error saat mengunggah berkas.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Kirim Manifest Handler (Explicitly changes status from LOCKED to SENT and applications to DELIVERED)
  const handleKirimManifest = async (manifestId: string) => {
    showActionStatus("loading", "Mengirim Manifest", "Sedang memperbarui status manifest dan permohonan ke Terkirim...");
    try {
      const res: any = await kirimManifest(manifestId);
      if (res.success) {
        showActionStatus(
          "success",
          "Manifest Berhasil Dikirim",
          "Manifest resmi dikirim (SENT) dan status seluruh permohonan diubah menjadi DELIVERED."
        );
        if (currentManifest) {
          manifestHistoryState.handleSelectManifest(currentManifest);
        }
        await manifestHistoryState.refreshData();
      } else {
        showActionStatus("error", "Gagal Mengirim Manifest", res.error || "Gagal mengirim manifest.");
      }
    } catch (err: any) {
      showActionStatus("error", "Gagal Mengirim Manifest", err.message || "Sistem error saat mengirim manifest.");
    }
  };

  // Cancel Shipping Modal State
  const [isCancelShippingModalOpen, setIsCancelShippingModalOpen] = useState(false);
  const [cancelShippingReason, setCancelShippingReason] = useState("");

  // Cancel Manifest Delivery Handler
  const handleCancelManifestDelivery = async (manifestId: string, reason: string) => {
    setIsCancelShippingModalOpen(false);
    showActionStatus("loading", "Membatalkan Pengiriman", "Sedang memperbarui status manifest ke Terkunci...");
    try {
      const res: any = await cancelManifestDelivery(manifestId, reason);
      if (res.success) {
        showActionStatus(
          "success",
          "Pengiriman Dibatalkan",
          "Manifest berhasil dikembalikan ke status TERKUNCI (LOCKED) dan permohonan dapat dikelola kembali."
        );
        if (currentManifest) {
          manifestHistoryState.handleSelectManifest(currentManifest);
        }
        await manifestHistoryState.refreshData();
      } else {
        showActionStatus("error", "Gagal Membatalkan Pengiriman", res.error || "Gagal membatalkan pengiriman manifest.");
      }
    } catch (err: any) {
      showActionStatus("error", "Gagal Membatalkan Pengiriman", err.message || "Sistem error saat membatalkan pengiriman.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentManifest) {
      handleUploadReceipt(currentManifest.id, file);
    }
  };

  // VIEW MODE A: DETAIL VIEW (Saat Manifest Diklik/Terpilih)
  if (currentManifest) {
    const buktiUrl = currentManifest.buktiTandaTerima || currentManifest.signedReceiptUrl;

    return (
      <div className="w-full flex flex-col gap-5 font-sans select-none animate-fadeIn">
        {/* Top Back Navigation Bar */}
        <div className="flex items-center justify-between gap-3 font-sans">
          <button
            onClick={() => manifestHistoryState.handleSelectManifest(null)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/90 hover:border-slate-300 rounded-md text-xs font-semibold text-slate-700 hover:text-slate-900 transition-all shadow-3xs cursor-pointer active:scale-95"
          >
            <ChevronLeft className="w-4 h-4 text-slate-500" />
            <span>Kembali</span>
          </button>
        </div>

        {/* Section 1: Toolbar & Grid Bundle Terpasang */}
        <div className="flex flex-col gap-2 mb-6 font-sans">
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-slate-700 tracking-tight">
              Daftar Bundel Terpasang
            </span>
          </div>

          <SenderBundleToolbarHistory
            searchQuery={installedBundleState.searchQuery}
            onSearchChange={installedBundleState.setSearchQuery}
            onSearchSubmit={installedBundleState.handleSearchSubmit}
            onClearSearch={installedBundleState.handleClearSearch}
            installedBundlesCount={installedBundleState.bundlesList.length}
            selectedManifest={currentManifest}
            manifestsList={manifestHistoryState.manifestsList}
            onSelectManifest={manifestHistoryState.handleSelectManifest}
            onUnlockManifest={
              manifestStatus === "LOCKED"
                ? () => handleRevisiManifest(currentManifest.id)
                : undefined
            }
          />

          <SenderBundleGridHistory
            installedBundles={installedBundleState.bundlesList}
            selectedBundle={installedBundleState.selectedBundle}
            manifestStatus={manifestStatus}
            searchQuery={installedBundleState.activeSearchQuery}
            onSelectBundle={installedBundleState.handleSelectBundle}
          />
        </div>

        {/* Section 2: Toolbar & Tabel Detail Berkas Permohonan */}
        <div className="flex flex-col gap-2 shadow-3xs animate-fadeIn font-sans mt-2">
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-slate-700 tracking-tight">
              Daftar Permohonan Bundle Terpasang
            </span>
          </div>

          <SenderApplicationsToolbarHistory
            selectedBundle={installedBundleState.selectedBundle}
            bundleDisplayMode={tableState.bundleDisplayMode}
            onDisplayModeChange={tableState.setBundleDisplayMode}
          />

          {/* Tabel Permohonan History */}
          <SenderApplicationsTableHistory
            selectedBundle={installedBundleState.selectedBundle}
            bundleDisplayMode={tableState.bundleDisplayMode}
            searchQuery={tableState.searchApplicationQuery}
            filteredApplicationList={tableState.filteredApplicationList}
            paginatedApplicationList={tableState.paginatedApplicationList}
            copiedText={tableState.copiedText}
            activePage={tableState.currentApplicationPage}
            itemsPerPage={tableState.itemsPerApplicationPage}
            totalPages={tableState.totalApplicationPages}
            onPageChange={tableState.setCurrentApplicationPage}
            onItemsPerPageChange={tableState.setItemsPerApplicationPage}
            onCopy={tableState.handleCopy}
            onToggleFavorite={tableState.handleToggleFavorite}
          />
        </div>

        {/* Section 3: Unggah Resi Tanda Terima & Action Button (Di Paling Bawah Halaman) */}
        <div className="flex flex-col gap-2.5 mt-4 font-sans shadow-3xs">
          <span className="text-base font-bold text-slate-700 tracking-tight">
            Unggah Resi Tanda Terima
          </span>
          <div className="flex items-center justify-start gap-3 w-full">
            {/* Input File Tersembunyi */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,application/pdf"
              className="hidden"
            />

            {/* KOTAK 1: Lihat Hasil Upload */}
            <a
              href={buktiUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-[200px] h-9 px-3 bg-emerald-50 border border-emerald-200 text-[#008f78] rounded-lg font-semibold text-xs transition-all shadow-xs flex items-center gap-1.5 whitespace-nowrap hover:bg-emerald-100/70 ${!buktiUrl ? "opacity-40 pointer-events-none border-gray-200 bg-gray-50 text-gray-400" : ""
                }`}
            >
              <FileCheck className={`w-4 h-4 ${buktiUrl ? "text-[#00a389]" : "text-gray-400"}`} />
              <span>Lihat Bukti</span>
            </a>

            {/* KOTAK 2: Field Input Mengunggah Bukti Resi (Memanjang & Minimalis) */}
            <div
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={`flex-[0.8] h-9 px-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 rounded-lg flex items-center gap-2 cursor-pointer transition-all ${isUploading ? "opacity-50 cursor-not-allowed bg-gray-100 select-none" : ""
                }`}
            >
              <Upload className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-xs text-gray-500 truncate select-none">
                {isUploading ? "Sedang mengunggah file..." : "Pilih atau unggah bukti resi..."}
              </span>
            </div>

            {/* KOTAK 3: Kirim Manifest / Batal Terkirim Button */}
            {manifestStatus === "SENT" ? (
              <button
                type="button"
                onClick={() => {
                  setCancelShippingReason("");
                  setIsCancelShippingModalOpen(true);
                }}
                className="h-9 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/90 hover:border-rose-300 rounded-lg font-semibold text-xs transition-all shadow-xs flex items-center gap-1.5 whitespace-nowrap cursor-pointer active:scale-95"
                title="Batalkan status pengiriman manifest ini kembali ke Terkunci"
              >
                <span>Batal Terkirim</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleKirimManifest(currentManifest.id)}
                disabled={!buktiUrl}
                className="h-9 px-4 bg-[#00a389] hover:bg-[#008f78] disabled:bg-slate-100 text-white disabled:text-slate-400 border border-transparent disabled:border-slate-200/90 rounded-lg font-semibold text-xs transition-all shadow-xs flex items-center gap-1.5 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
                title={!buktiUrl ? "Unggah bukti resi terlebih dahulu untuk mengirim manifest" : "Kirim manifest secara resmi"}
              >
                <span>Kirim Manifest</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Catatan Pembatalan Pengiriman */}
        <SenderCancelShippingModal
          isOpen={isCancelShippingModalOpen}
          manifestNumber={rawManifestNumber}
          reason={cancelShippingReason}
          loading={false}
          onReasonChange={setCancelShippingReason}
          onClose={() => setIsCancelShippingModalOpen(false)}
          onSubmit={(e) => {
            e.preventDefault();
            if (currentManifest && cancelShippingReason.trim()) {
              handleCancelManifestDelivery(currentManifest.id, cancelShippingReason);
            }
          }}
        />

        {/* Action Status Modal Overlay */}
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

  // VIEW MODE B: MAIN GRID DAFTAR MANIFEST RIWAYAT
  if (manifestHistoryState.loading && manifestHistoryState.manifestsList.length === 0) {
    return <SenderHistorySkeleton />;
  }

  return (

    <div className="w-full flex flex-col gap-4 animate-fadeIn font-sans select-none">
      <div className="flex items-center justify-between">
        <span className="text-base font-bold text-slate-700 tracking-tight">Daftar Riwayat Manifest</span>
      </div>

      {/* 1. Toolbar Riwayat Manifest */}
      <SenderManifestToolbarHistory
        searchQuery={manifestHistoryState.searchQuery}
        onSearchChange={manifestHistoryState.setSearchQuery}
        onSearchSubmit={manifestHistoryState.handleSearchSubmit}
        onClearSearch={manifestHistoryState.handleClearSearch}
        isSearchFocused={manifestHistoryState.isSearchFocused}
        onSearchFocus={() => manifestHistoryState.setIsSearchFocused(true)}
        onSearchBlur={() => manifestHistoryState.setIsSearchFocused(false)}
        searchInputRef={manifestHistoryState.searchManifestInputRef}
        onRefresh={manifestHistoryState.refreshData}
        loading={manifestHistoryState.loading}
        isRefreshing={manifestHistoryState.isRefreshing}
        listLoading={manifestHistoryState.isGridLoading}
      />

      {/* Error Message if any */}
      {manifestHistoryState.error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold text-rose-700 font-sans">
          {manifestHistoryState.error}
        </div>
      )}

      {/* 2. Grid Kartu Manifest Riwayat */}
      <SenderManifestGridHistory
        loading={manifestHistoryState.loading || manifestHistoryState.isGridLoading}
        manifestsList={manifestHistoryState.manifestsList}
        filteredManifests={manifestHistoryState.filteredManifests}
        paginatedManifests={manifestHistoryState.paginatedManifests}
        selectedManifest={manifestHistoryState.selectedManifest}
        searchQuery={manifestHistoryState.activeSearchQuery}
        currentPage={manifestHistoryState.currentPage}
        totalPages={manifestHistoryState.totalPages}
        itemsPerPage={manifestHistoryState.itemsPerPage}
        onPageChange={manifestHistoryState.setCurrentPage}
        onItemsPerPageChange={manifestHistoryState.setItemsPerPage}
        onSelectManifest={manifestHistoryState.handleSelectManifest}
      />

      {/* Action Status Modal Overlay */}
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
