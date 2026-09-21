"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  addBundleToManifest,
  removeBundleFromManifest,
  uploadBuktiTandaTerima,
  laporkanBundleHilang,
  ajukanKembalikanKePengarsip,
} from "@/app/actions/sender";

export function useSenderInstalledBundle(selectedManifest: any | null) {
  const [selectedBundleInManifest, setSelectedBundleInManifest] = useState<any | null>(null);

  // Search State for Installed Bundles Grid
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchQuery, setActiveSearchQuery] = useState("");

  const handleSearchSubmit = useCallback(() => {
    setActiveSearchQuery(searchQuery);
  }, [searchQuery]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setActiveSearchQuery("");
  }, []);

  // Modals & Upload State
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [correctionTarget, setCorrectionTarget] = useState<any | null>(null);
  const [correctionReason, setCorrectionReason] = useState("");
  const [queueLoading, setQueueLoading] = useState(false);

  // Handle Select Installed Bundle with URL query param sync
  const handleSelectBundle = useCallback((bundle: any) => {
    setSelectedBundleInManifest(bundle);

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const view = url.searchParams.get("view");
      if (view === "lock-manifest" && bundle) {
        const rawNo = bundle.bundleNumber || bundle.id;
        url.searchParams.set("bundle", rawNo);
      } else {
        url.searchParams.delete("bundle");
      }
      window.history.replaceState(null, "", url.toString());
    }
  }, []);

  // Sync selectedBundleInManifest when selectedManifest changes
  useEffect(() => {
    const bundlesList = selectedManifest?.bundles || selectedManifest?.bundle || [];
    if (bundlesList.length > 0) {
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        const view = url.searchParams.get("view");
        const bundleParam = url.searchParams.get("bundle");

        let matched = null;
        if (view === "lock-manifest" && bundleParam) {
          matched = bundlesList.find(
            (b: any) => b.bundleNumber === bundleParam || b.id === bundleParam
          );
        }

        const target = matched || bundlesList[0];
        setSelectedBundleInManifest(target);

        if (view === "lock-manifest" && target) {
          url.searchParams.set("bundle", target.bundleNumber || target.id);
        } else {
          url.searchParams.delete("bundle");
        }
        window.history.replaceState(null, "", url.toString());
      } else {
        setSelectedBundleInManifest(bundlesList[0]);
      }
    } else {
      setSelectedBundleInManifest(null);
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.delete("bundle");
        window.history.replaceState(null, "", url.toString());
      }
    }
  }, [selectedManifest]);

  // Add Bundle to Manifest
  const handleAddBundle = async (
    bundleId: string,
    eligibleBundlesList: any[],
    setEligibleBundlesList: React.Dispatch<React.SetStateAction<any[]>>,
    currentManifest: any,
    setManifestsList: React.Dispatch<React.SetStateAction<any[]>>,
    setSelectedManifest: (m: any) => void,
    showActionStatus?: (status: 'loading' | 'success' | 'error', title: string, message: string) => void,
    onRefreshWorkspace?: () => void
  ) => {
    if (!currentManifest) {
      if (showActionStatus) {
        showActionStatus(
          "error",
          "Pilih Manifest Terlebih Dahulu",
          "Silakan pilih atau buat draf manifest di tab Daftar Manifest terlebih dahulu sebelum memasukkan bundle ini."
        );
      }
      return;
    }

    const targetBundle = eligibleBundlesList.find((b) => b.id === bundleId);
    if (!targetBundle) return;

    setEligibleBundlesList((prev) => prev.filter((b) => b.id !== bundleId));

    const currentBundles = currentManifest.bundles || currentManifest.bundle || [];
    const updatedBundles = [...currentBundles, targetBundle];
    const updatedSelectedManifest = { ...currentManifest, bundles: updatedBundles, bundle: updatedBundles };
    setSelectedManifest(updatedSelectedManifest);

    setManifestsList((prev) =>
      prev.map((m) => (m.id === currentManifest.id ? updatedSelectedManifest : m))
    );

    if (showActionStatus) {
      showActionStatus("loading", "Menambahkan Bundle", "Sedang memasukkan map bundle ke dalam manifest...");
    }

    try {
      const res: any = await addBundleToManifest(currentManifest.id, bundleId);
      if (res.success) {
        if (showActionStatus) showActionStatus("success", "Bundle Berhasil Ditambahkan", "Map bundle berhasil dimasukkan ke dalam manifest pengiriman.");
        if (onRefreshWorkspace) onRefreshWorkspace();
      } else {
        if (showActionStatus) showActionStatus("error", "Gagal Menambahkan Bundle", res.error || "Gagal menambahkan bundle.");
        if (onRefreshWorkspace) onRefreshWorkspace();
      }
    } catch (err: any) {
      if (showActionStatus) showActionStatus("error", "Gagal Menambahkan Bundle", err.message || "Sistem error saat menambahkan bundle.");
      if (onRefreshWorkspace) onRefreshWorkspace();
    }
  };

  // Remove Bundle from Manifest
  const handleRemoveBundle = async (
    bundleId: string,
    setEligibleBundlesList: React.Dispatch<React.SetStateAction<any[]>>,
    currentManifest: any,
    setManifestsList: React.Dispatch<React.SetStateAction<any[]>>,
    setSelectedManifest: (m: any) => void,
    showActionStatus?: (status: 'loading' | 'success' | 'error', title: string, message: string) => void,
    onRefreshWorkspace?: () => void
  ) => {
    if (!currentManifest) return;

    const currentBundles = currentManifest.bundles || currentManifest.bundle || [];
    const targetBundle = currentBundles.find((b: any) => b.id === bundleId);

    const updatedBundles = currentBundles.filter((b: any) => b.id !== bundleId);
    const updatedSelectedManifest = { ...currentManifest, bundles: updatedBundles, bundle: updatedBundles };
    setSelectedManifest(updatedSelectedManifest);

    if (selectedBundleInManifest?.id === bundleId) {
      setSelectedBundleInManifest(null);
    }

    if (targetBundle) {
      setEligibleBundlesList((prev) => [targetBundle, ...prev]);
    }

    setManifestsList((prev) =>
      prev.map((m) => (m.id === currentManifest.id ? updatedSelectedManifest : m))
    );

    if (showActionStatus) {
      showActionStatus("loading", "Melepas Bundle", "Sedang mengeluarkan map bundle dari manifest...");
    }

    try {
      const res: any = await removeBundleFromManifest(currentManifest.id, bundleId);
      if (res.success) {
        if (showActionStatus) showActionStatus("success", "Bundle Berhasil Dilepas", "Map bundle berhasil dikeluarkan dari manifest.");
        if (onRefreshWorkspace) onRefreshWorkspace();
      } else {
        if (showActionStatus) showActionStatus("error", "Gagal Melepas Bundle", res.error || "Gagal melepas bundle.");
        if (onRefreshWorkspace) onRefreshWorkspace();
      }
    } catch (err: any) {
      if (showActionStatus) showActionStatus("error", "Gagal Melepas Bundle", err.message || "Sistem error saat melepas bundle.");
      if (onRefreshWorkspace) onRefreshWorkspace();
    }
  };

  // Upload Receipt File
  const handleUploadReceipt = async (
    event: React.ChangeEvent<HTMLInputElement>,
    currentManifest: any,
    showActionStatus?: (status: 'loading' | 'success' | 'error', title: string, message: string) => void,
    onRefreshWorkspace?: () => void
  ) => {
    if (!currentManifest) return;
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      if (showActionStatus) showActionStatus("error", "Format File Tidak Sesuai", "File bukti tanda terima harus berupa PDF, JPG, atau PNG.");
      return;
    }

    const MAX_SIZE = 20 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      if (showActionStatus) showActionStatus("error", "Ukuran File Melebihi Batas", "Ukuran file tidak boleh melebihi 20 MB.");
      return;
    }

    setQueueLoading(true);
    if (showActionStatus) showActionStatus("loading", "Mengunggah Bukti Resi", "Sedang memproses berkas bukti tanda terima...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res: any = await uploadBuktiTandaTerima(currentManifest.id, formData);
      if (res.success) {
        if (showActionStatus) showActionStatus("success", "Pengiriman Selesai", "Bukti tanda terima berhasil diunggah! Manifest resmi dikirim (SENT).");
        if (onRefreshWorkspace) onRefreshWorkspace();
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        if (showActionStatus) showActionStatus("error", "Gagal Mengunggah Bukti", res.error || "Gagal menyelesaikan pengiriman manifest.");
      }
    } catch (err: any) {
      if (showActionStatus) showActionStatus("error", "Gagal Mengunggah Bukti", err.message || "Sistem error saat mengunggah berkas.");
    } finally {
      setQueueLoading(false);
    }
  };

  // Report Bundle Lost
  const handleReportBundleLost = (
    bundleId: string,
    nomorBundle: string,
    showConfirm?: (params: { title: string; message: string; onConfirm: () => void }) => void,
    showActionStatus?: (status: 'loading' | 'success' | 'error', title: string, message: string) => void,
    onRefreshWorkspace?: () => void
  ) => {
    if (!showConfirm) return;
    showConfirm({
      title: "Laporkan Bundle Hilang",
      message: `Apakah Anda yakin ingin melaporkan bundle ${nomorBundle} HILANG? Bundle akan dilepas dari manifest ini dan dikembalikan ke status LOCKED untuk penelusuran lebih lanjut.`,
      onConfirm: async () => {
        setQueueLoading(true);
        if (showActionStatus) showActionStatus("loading", "Melaporkan Bundle Hilang", `Sedang memproses laporan bundle ${nomorBundle}...`);
        try {
          const res: any = await laporkanBundleHilang(bundleId);
          if (res.success) {
            if (showActionStatus) showActionStatus("success", "Bundle Dilaporkan Hilang", `Bundle ${nomorBundle} berhasil dilaporkan hilang dan dikeluarkan dari manifest.`);
            if (onRefreshWorkspace) onRefreshWorkspace();
          } else {
            if (showActionStatus) showActionStatus("error", "Gagal Melaporkan Bundle", res.error || "Gagal melaporkan bundle hilang.");
          }
        } catch (err: any) {
          if (showActionStatus) showActionStatus("error", "Gagal Melaporkan Bundle", err.message || "Sistem error.");
        } finally {
          setQueueLoading(false);
        }
      },
    });
  };

  // Request Correction to Archivist
  const handleRequestCorrection = async (
    e: React.FormEvent,
    showActionStatus?: (status: 'loading' | 'success' | 'error', title: string, message: string) => void,
    onRefreshWorkspace?: () => void
  ) => {
    e.preventDefault();
    if (!correctionTarget || !correctionReason.trim()) return;

    setQueueLoading(true);
    if (showActionStatus) showActionStatus("loading", "Mengajukan Pengembalian", "Sedang memproses permintaan pengembalian ke Pengarsip...");

    try {
      const res: any = await ajukanKembalikanKePengarsip(correctionTarget.id, correctionReason);
      if (res.success) {
        if (showActionStatus) showActionStatus("success", "Pengembalian Diajukan", "Permintaan pengembalian ke Pengarsip berhasil diajukan.");
        setShowCorrectionModal(false);
        setCorrectionTarget(null);
        setCorrectionReason("");
        if (onRefreshWorkspace) onRefreshWorkspace();
      } else {
        if (showActionStatus) showActionStatus("error", "Gagal Mengajukan Pengembalian", res.error || "Gagal mengajukan permintaan koreksi.");
      }
    } catch (err: any) {
      if (showActionStatus) showActionStatus("error", "Gagal Mengajukan Pengembalian", err.message || "Sistem error.");
    } finally {
      setQueueLoading(false);
    }
  };

  const openCorrectionModal = (application: any) => {
    setCorrectionTarget(application);
    setCorrectionReason("");
    setShowCorrectionModal(true);
  };

  return {
    selectedBundleInManifest,
    setSelectedBundleInManifest,
    searchQuery,
    setSearchQuery,
    activeSearchQuery,
    handleSearchSubmit,
    handleClearSearch,
    fileInputRef,
    showCorrectionModal,
    setShowCorrectionModal,
    correctionTarget,
    setCorrectionTarget,
    correctionReason,
    setCorrectionReason,
    queueLoading,

    // Installed Bundle Actions
    handleSelectBundle,
    handleAddBundle,
    handleRemoveBundle,
    handleUploadReceipt,
    handleReportBundleLost,
    handleRequestCorrection,
    openCorrectionModal,
  };
}
