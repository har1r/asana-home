"use client";

import React, { useState, useEffect, useRef } from "react";
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
  ChevronRight,
  Star
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

      <div className="flex flex-col lg:flex-row gap-6 w-full">
        {/* LEFT PANEL */}
        <div className="w-full lg:w-96 flex flex-col gap-4 bg-white/70 backdrop-blur-md p-5 rounded-2xl border border-gray-250/50 shadow-sm shrink-0">
          {/* Tab switcher */}
          <div className="flex p-1 bg-slate-100 rounded-xl">
            <div className="flex-1 h-8 bg-gray-200 animate-pulse rounded-lg" />
            <div className="flex-1 h-8 bg-transparent rounded-lg" />
          </div>

          {/* Label + refresh */}
          <div className="flex items-center justify-between">
            <SkeletonText width="w-28" height="h-3" />
            <div className="w-6 h-6 bg-gray-200 animate-pulse rounded-lg" />
          </div>

          {/* Search */}
          <div className="h-10 bg-gray-200 animate-pulse rounded-xl" />

          {/* Manifest cards */}
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <SkeletonText width="w-32" height="h-3" />
                  <SkeletonBadge width="w-14" />
                </div>
                <div className="flex justify-between mt-1">
                  <SkeletonText width="w-20" height="h-2.5" />
                  <SkeletonText width="w-16" height="h-2.5" />
                </div>
              </div>
            ))}
          </div>

          {/* New manifest button */}
          <div className="h-9 bg-gray-200 animate-pulse rounded-xl" />
        </div>

        {/* RIGHT PANEL: Manifest Detail */}
        <div className="flex-1 flex flex-col gap-5 bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-gray-250/50 shadow-sm min-w-0">
          {/* Detail header */}
          <div className="border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 bg-gray-200 animate-pulse rounded" />
              <SkeletonBox width="w-40" height="h-5" rounded="rounded-full" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <SkeletonText width="w-20" height="h-2.5" />
                  <SkeletonText width="w-28" height="h-3" />
                </div>
              ))}
            </div>
          </div>

          {/* Bundle items inside manifest */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <SkeletonText width="w-36" height="h-4" />
              <SkeletonBadge width="w-16" />
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-slate-50 rounded-xl border border-slate-200 p-3.5 flex items-center justify-between">
                <div className="flex flex-col gap-1.5">
                  <SkeletonText width="w-32" height="h-3" />
                  <SkeletonText width="w-20" height="h-2.5" />
                </div>
                <div className="w-7 h-7 bg-gray-200 animate-pulse rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const formatNop = (nop: string) => {
  if (!nop || nop.length !== 18) return nop;
  return `${nop.slice(0, 2)}.${nop.slice(2, 4)}.${nop.slice(4, 7)}.${nop.slice(7, 10)}.${nop.slice(10, 13)}-${nop.slice(13, 17)}.${nop.slice(17)}`;
};

export default function PengirimWorkspace() {
  const { showConfirm } = useDashboard();

  // Local tabs: 'daftar-manifest' vs 'antrean-bundle'
  const [workspaceTab, setWorkspaceTab] = useState<"daftar-manifest" | "antrean-bundle">("daftar-manifest");

  // Lists and Selected States
  const [manifestsList, setManifestsList] = useState<any[]>([]);
  const [eligibleBundlesList, setEligibleBundlesList] = useState<any[]>([]);
  const [selectedManifest, setSelectedManifest] = useState<any | null>(null);
  const [selectedBundle, setSelectedBundle] = useState<any | null>(null);

  // States for search and loaders
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modals
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [correctionTarget, setCorrectionTarget] = useState<any | null>(null);
  const [correctionReason, setCorrectionReason] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchInitialData = async () => {
    setListLoading(true);
    setError("");
    try {
      const manifestsRes = await getManifests();
      const bundlesRes = await getEligibleBundles();

      if (manifestsRes.success) {
        setManifestsList(manifestsRes.list || []);
        
        // Re-sync selected manifest details if any
        if (selectedManifest) {
          const detailRes = await getManifestDetails(selectedManifest.id);
          if (detailRes.success) {
            setSelectedManifest(detailRes.manifest);
          } else {
            setSelectedManifest(null);
          }
        }
      }
      if (bundlesRes.success) {
        setEligibleBundlesList(bundlesRes.list || []);
      }
    } catch (err) {
      setError("Kesalahan koneksi ke server.");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleSelectManifest = async (manifest: any) => {
    setLoading(true);
    setError("");
    setSuccess("");
    setSelectedBundle(null);
    try {
      const res = await getManifestDetails(manifest.id);
      if (res.success) {
        setSelectedManifest(res.manifest);
      } else {
        setError(res.error || "Gagal memuat detail manifest.");
      }
    } catch (err) {
      setError("Kesalahan memuat detail manifest.");
    } finally {
      setLoading(false);
    }
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
        await fetchInitialData();
        if (res.manifest) {
          // Select newly created manifest
          const detail = await getManifestDetails(res.manifest.id);
          if (detail.success) {
            setSelectedManifest(detail.manifest);
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

  // Add Bundle to Manifest
  const handleAddBundle = async (bundleId: string) => {
    if (!selectedManifest) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res: any = await addBundleToManifest(selectedManifest.id, bundleId);
      if (res.success) {
        setSuccess("Bundle berhasil ditambahkan ke dalam manifest!");
        await fetchInitialData();
        setTimeout(() => setSuccess(""), 4000);
      } else {
        setError(res.error || "Gagal menambahkan bundle.");
      }
    } catch (err: any) {
      setError(err.message || "Sistem error saat menambahkan bundle.");
    } finally {
      setLoading(false);
    }
  };

  // Remove Bundle from Manifest
  const handleRemoveBundle = async (bundleId: string) => {
    if (!selectedManifest) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res: any = await removeBundleFromManifest(selectedManifest.id, bundleId);
      if (res.success) {
        setSuccess("Bundle berhasil dilepas dari manifest!");
        await fetchInitialData();
        setTimeout(() => setSuccess(""), 4000);
      } else {
        setError(res.error || "Gagal melepas bundle.");
      }
    } catch (err: any) {
      setError(err.message || "Sistem error saat melepas bundle.");
    } finally {
      setLoading(false);
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
            await fetchInitialData();
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
            await fetchInitialData();
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

  // Filter manifests by search query
  const filteredManifests = manifestsList.filter((m) =>
    m.nomorManifest.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Early return: full skeleton while loading
  if (listLoading) return <PengirimSkeleton />;

  return (
    <div className="w-full font-sans select-none flex flex-col gap-6 animate-fadeIn">
      {/* Header card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#f3f6f9] p-5 rounded-2xl shadow-sm select-none">
        <div>
          <span className="text-[9px] font-extrabold uppercase bg-indigo-50 border border-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full">
            Fase 5
          </span>
          <h2 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5 tracking-tight mt-1.5">
            Workspace Petugas Pengirim (Ekspedisi & Manifest)
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white border border-slate-100 px-3.5 py-2 rounded-xl shadow-3xs">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          <span>Pengiriman & Logistik PBB</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 w-full">
      
      {/* ================= LEFT PANEL: MANIFESTS / BUNDLE QUEUE ================= */}
      <div className="w-full lg:w-96 flex flex-col gap-4 bg-white/70 backdrop-blur-md p-5 rounded-2xl border border-gray-250/50 shadow-sm shrink-0">
        
        {/* Tab Switcher */}
        <div className="flex p-1 bg-slate-100 rounded-xl select-none">
          <button
            onClick={() => {
              setWorkspaceTab("daftar-manifest");
              setSelectedBundle(null);
            }}
            className={`flex-1 text-center py-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
              workspaceTab === "daftar-manifest"
                ? "bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] text-[#2c333f] shadow-sm font-extrabold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Daftar Manifest
          </button>
          <button
            onClick={() => {
              setWorkspaceTab("antrean-bundle");
              setSelectedManifest(null);
            }}
            className={`flex-1 text-center py-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
              workspaceTab === "antrean-bundle"
                ? "bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] text-[#2c333f] shadow-sm font-extrabold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Antrean Bundle ({eligibleBundlesList.length})
          </button>
        </div>

        {/* Content for Manifest List Tab */}
        {workspaceTab === "daftar-manifest" && (
          <div className="flex flex-col gap-4 flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black text-slate-500 uppercase tracking-wider select-none">
                Manifest Pengiriman
              </h2>
              <button
                onClick={fetchInitialData}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
                title="Refresh Data"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${listLoading ? "animate-spin" : ""}`} />
              </button>
            </div>

            {/* Search Manifest */}
            <div className={`relative p-[1.5px] rounded-xl transition-all duration-300 ${
              isSearchFocused 
                ? 'bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] shadow-xs' 
                : 'bg-slate-200/85'
            }`}>
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 z-10" />
              <input
                type="text"
                placeholder="Cari nomor manifest..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="w-full bg-white border-transparent focus:outline-none text-xs font-semibold rounded-[10px] pl-9.5 pr-4 py-2 transition-all text-gray-750"
              />
            </div>

            {/* Action to create manifest */}
            <button
              onClick={handleCreateManifest}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-98 cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4 shrink-0" />
              Buat manifest baru
            </button>

            {/* Manifest Cards List */}
            <div className="flex-1 max-h-[50vh] lg:max-h-[55vh] overflow-y-auto pr-1 flex flex-col gap-3">
              {listLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                  <span className="text-xs font-bold">Memuat daftar manifest...</span>
                </div>
              ) : filteredManifests.length === 0 ? (
                <div className="text-center py-12 text-gray-400 font-semibold text-xs border border-dashed border-gray-200 rounded-xl">
                  Tidak ada manifest pengiriman.
                </div>
              ) : (
                filteredManifests.map((m) => {
                  const isSelected = selectedManifest?.id === m.id;
                  const bundlesCount = m.bundle?.length || 0;
                  const totalWP = m.bundle?.reduce((acc: number, b: any) => acc + b.permohonan.length, 0) || 0;

                  return (
                    <button
                      key={m.id}
                      onClick={() => handleSelectManifest(m)}
                      className={`w-full text-left p-4 rounded-xl border transition-all duration-300 flex flex-col gap-2 ${
                        isSelected
                          ? "bg-gradient-to-r from-indigo-500 to-indigo-650 text-white border-indigo-600 shadow-md transform scale-[1.01]"
                          : "bg-white hover:bg-slate-50 border-gray-200 text-gray-800 shadow-sm"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-black truncate max-w-[190px]">
                          {m.nomorManifest}
                        </span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase select-none ${
                          isSelected
                            ? "bg-white/20 text-white"
                            : m.status === "SENT"
                            ? "bg-emerald-100 text-emerald-800"
                            : m.status === "LOCKED"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-sky-100 text-sky-800"
                        }`}>
                          {m.status === "SENT" ? "Terkirim" : m.status === "LOCKED" ? "Segel" : m.status}
                        </span>
                      </div>

                      <div className={`text-[10px] font-semibold ${isSelected ? "text-indigo-200" : "text-gray-500"}`}>
                        Logistik: {bundlesCount} Map ({totalWP} Berkas WP)
                      </div>

                      <div className={`text-[9px] flex items-center justify-between font-medium ${isSelected ? "text-indigo-200" : "text-gray-400"} mt-1.5`}>
                        <span>Pengirim: {m.pengirim?.name || "-"}</span>
                        <span>{new Date(m.createdAt).toLocaleDateString("id-ID")}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Content for Antrean Bundle Tab */}
        {workspaceTab === "antrean-bundle" && (
          <div className="flex flex-col gap-4 flex-1 select-none">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black text-slate-500 uppercase tracking-wider">
                Antrean Bundle Locked
              </h2>
              <button
                onClick={fetchInitialData}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${listLoading ? "animate-spin" : ""}`} />
              </button>
            </div>

            <p className="text-[10px] text-gray-400 font-semibold leading-relaxed">
              Daftar bundle fisik dengan status LOCKED yang seluruh permohonan di dalamnya telah diarsip (ARCHIVED) oleh Pengarsip. Siap dimasukkan ke manifest logistik.
            </p>

            <div className="flex-1 max-h-[60vh] overflow-y-auto pr-1 flex flex-col gap-3">
              {listLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                  <span className="text-xs font-bold">Memuat antrean...</span>
                </div>
              ) : eligibleBundlesList.length === 0 ? (
                <div className="text-center py-12 text-gray-400 font-semibold text-xs border border-dashed border-gray-200 rounded-xl">
                  Tidak ada bundle terarsip penuh di antrean.
                </div>
              ) : (
                eligibleBundlesList.map((b) => {
                  const isSelected = selectedBundle?.id === b.id;
                  return (
                    <button
                      key={b.id}
                      onClick={() => setSelectedBundle(isSelected ? null : b)}
                      className={`w-full text-left p-4 rounded-xl border transition-all duration-300 flex flex-col gap-2 ${
                        isSelected
                          ? "bg-slate-100 border-indigo-300"
                          : "bg-white hover:bg-slate-50 border-gray-200 text-gray-800 shadow-sm"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-bold text-gray-800 truncate">
                          {b.nomorBundle}
                        </span>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 select-none">
                          {b.status}
                        </span>
                      </div>
                      <div className="text-[10px] font-semibold text-slate-500">
                        Tipe: {b.jenisPermohonan?.replace(/_/g, " ")}
                      </div>
                      <div className="flex items-center justify-between w-full pt-1.5 border-t border-slate-100/50">
                        <span className="text-[10px] font-bold text-indigo-650">
                          Jumlah: {b.permohonan?.length} berkas
                        </span>
                        <a
                          href={`/api/export/bundle/${b.id}`}
                          onClick={(e) => e.stopPropagation()}
                          download
                          className="flex items-center gap-1 py-1 px-2.5 text-[9px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100/50 rounded-lg transition-all"
                        >
                          <FileText className="w-3 h-3 text-emerald-600" />
                          Export Excel
                        </a>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* ================= RIGHT PANEL: SELECTED DETAILS ================= */}
      <div className="flex-1 flex flex-col gap-5 bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-gray-250/50 shadow-sm min-w-0">
        
        {/* Banner messages */}
        {error && (
          <div className="bg-red-55 border border-red-200/60 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2.5 text-xs font-semibold select-none animate-fadeIn">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 animate-bounce" />
            <p className="flex-1">{error}</p>
            <button onClick={() => setError("")} className="text-red-500 hover:text-red-800 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-250/60 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-2.5 text-xs font-semibold select-none animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <p className="flex-1">{success}</p>
            <button onClick={() => setSuccess("")} className="text-emerald-500 hover:text-emerald-800 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {workspaceTab === "daftar-manifest" && !selectedManifest && (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-20 text-gray-400 select-none">
            <Truck className="w-12 h-12 text-slate-350 mb-3 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-700 mb-1">Pilih Manifest</h3>
            <p className="text-xs text-gray-400 font-semibold max-w-sm">
              Silakan pilih salah satu manifest pengiriman di sebelah kiri untuk melihat detail status logistik, mengunggah bukti tanda terima, atau mengajukan koreksi berkas.
            </p>
          </div>
        )}

        {workspaceTab === "antrean-bundle" && !selectedBundle && (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-20 text-gray-400 select-none">
            <FolderDot className="w-12 h-12 text-slate-350 mb-3 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-700 mb-1">Pilih Bundle</h3>
            <p className="text-xs text-gray-400 font-semibold max-w-sm">
              Pilih bundle di antrean kiri untuk meninjau data sebelum dimasukkan ke manifest pengiriman logistik.
            </p>
          </div>
        )}

        {/* View Details of selected bundle in queue */}
        {workspaceTab === "antrean-bundle" && selectedBundle && (
          <div className="flex flex-col gap-5 flex-1 select-none">
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-sm font-extrabold text-gray-800">
                Pratinjau Bundle Antrean: <span className="text-indigo-600">{selectedBundle.nomorBundle}</span>
              </h3>
              <p className="text-[11px] text-gray-400 font-semibold mt-1">
                Tipe Permohonan: <span className="font-bold text-gray-600">{selectedBundle.jenisPermohonan?.replace(/_/g, " ")}</span>
              </p>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[55vh] flex flex-col gap-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Daftar Permohonan ({selectedBundle.permohonan?.length})
              </h4>
              {selectedBundle.permohonan?.map((p: any) => (
                <div key={p.id} className="p-4 bg-slate-50 border border-slate-150 rounded-xl text-xs flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">NOP: {formatNop(p.nop)}</span>
                    <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase">
                      {p.status}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    Wajib Pajak: <span className="font-bold text-slate-700">{p.namaWajibPajak}</span> • WA: {p.noWhatsapp}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <span className="text-slate-500 font-semibold">
                * Untuk mengirim bundle ini, silakan buat atau pilih Manifest Draf terlebih dahulu, lalu masukkan bundle ini.
              </span>
              <button
                onClick={() => setWorkspaceTab("daftar-manifest")}
                className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl text-center active:scale-95 transition-all cursor-pointer shrink-0"
              >
                Kembali ke manifest
              </button>
            </div>
          </div>
        )}

        {/* View Details of selected manifest */}
        {workspaceTab === "daftar-manifest" && selectedManifest && (
          <div className="flex flex-col gap-5 flex-1">
            
            {/* Header Manifest */}
            <div className="border-b border-gray-100 pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4 select-none">
              <div>
                <h3 className="text-sm font-extrabold text-gray-800 flex items-center gap-1.5">
                  Manifest: <span className="text-indigo-600 font-black">{selectedManifest.nomorManifest}</span>
                </h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-[11px] text-gray-400 font-semibold">
                    Dibuat: {new Date(selectedManifest.createdAt).toLocaleString("id-ID")}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[11px] text-gray-400 font-semibold">
                    Pengirim: <span className="text-slate-700 font-bold">{selectedManifest.pengirim?.name || "-"}</span>
                  </span>
                </div>
              </div>

              {/* Status Timeline Progress */}
              <div className="flex items-center gap-1">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${
                  selectedManifest.status === "DRAFT" ? "bg-sky-100 text-sky-800" : "bg-slate-100 text-slate-500"
                }`}>
                  DRAFT
                </span>
                <span className="text-slate-300">→</span>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${
                  selectedManifest.status === "LOCKED" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-500"
                }`}>
                  LOCKED
                </span>
                <span className="text-slate-300">→</span>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${
                  selectedManifest.status === "SENT" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                }`}>
                  SENT
                </span>
              </div>
            </div>

            {/* List of Bundles inside Manifest */}
            <div className="flex-1 overflow-y-auto max-h-[55vh] flex flex-col gap-4">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest select-none">
                Daftar Bundle didalam Manifest ({selectedManifest.bundle?.length || 0})
              </h4>

              {selectedManifest.bundle?.length === 0 ? (
                <div className="text-center py-8 text-gray-400 font-semibold text-xs border border-dashed border-gray-200 rounded-xl select-none">
                  Belum ada bundle yang dimasukkan ke manifest ini.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {selectedManifest.bundle.map((b: any) => (
                    <div
                      key={b.id}
                      className="p-4 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col gap-3"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <span className="text-xs font-bold text-slate-800">{b.nomorBundle}</span>
                          <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                            Tipe: {b.jenisPermohonan?.replace(/_/g, " ")} • Jumlah: {b.permohonan?.length} berkas
                          </span>
                        </div>
                        
                        {/* Actions per bundle depending on manifest status */}
                        <div className="flex items-center gap-2 shrink-0">
                          <a
                            href={`/api/export/bundle/${b.id}`}
                            download
                            className="flex items-center gap-1 py-1 px-2.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100/50 rounded-lg transition-all"
                            title="Ekspor daftar permohonan ke Excel"
                          >
                            <FileText className="w-3.5 h-3.5 text-emerald-600" />
                            Excel
                          </a>
                          {selectedManifest.status === "DRAFT" && (
                            <button
                              onClick={() => handleRemoveBundle(b.id)}
                              disabled={loading}
                              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                              title="Hapus bundle dari manifest"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          )}
                          {selectedManifest.status === "SENT" && (
                            <button
                              onClick={() => handleReportBundleLost(b.id, b.nomorBundle)}
                              disabled={loading}
                              className="flex items-center gap-1 py-1 px-2.5 text-[10px] font-bold text-red-650 hover:text-red-700 bg-red-50 hover:bg-red-100/50 rounded-lg transition-all cursor-pointer"
                              title="Laporkan bundle ini hilang saat pengiriman"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                              Laporkan hilang
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Display Applications details inside bundle (for SENT manifest) */}
                      {selectedManifest.status === "SENT" && b.permohonan && b.permohonan.length > 0 && (
                        <div className="border-t border-slate-50 pt-3 flex flex-col gap-2">
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                            Status Berkas (Permohonan)
                          </span>
                          <div className="flex flex-col gap-2">
                            {b.permohonan.map((p: any) => {
                              const isFrozen = p.permintaanKoreksi && p.permintaanKoreksi.length > 0;
                              const pendingReq = isFrozen ? p.permintaanKoreksi[0] : null;

                              return (
                                <div
                                  key={p.id}
                                  className={`p-3 border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-all ${
                                    isFrozen ? "border-amber-200 bg-amber-50/20" : "border-slate-100 bg-slate-50/50"
                                  }`}
                                >
                                  <div>
                                    <span className="font-extrabold text-slate-800 flex items-center gap-1.5 font-mono">
                                      NOP: {formatNop(p.nop)}
                                      {p.isFavorite && (
                                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0 shadow-3xs" />
                                      )}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-semibold block">
                                      Wajib Pajak: {p.namaWajibPajak}
                                    </span>
                                    {isFrozen && (
                                      <span className="text-[9px] font-bold text-amber-700 flex items-center gap-1 mt-1">
                                        <Clock className="w-3 h-3 text-amber-500 animate-spin" /> 
                                        Menunggu Supervisor: Kembalikan ke Pengarsip
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase select-none ${
                                      p.status === "ARCHIVED" ? "bg-emerald-100 text-emerald-800" : "bg-sky-100 text-sky-800"
                                    }`}>
                                      {p.status === "ARCHIVED" ? "Terarsip" : p.status}
                                    </span>

                                    {!isFrozen && p.status === "ARCHIVED" && (
                                      <button
                                        onClick={() => openCorrectionModal(p)}
                                        className="py-1 px-2 text-[9px] font-bold text-gray-500 hover:text-red-700 bg-white hover:bg-red-50 border border-slate-200 rounded-lg transition-all cursor-pointer"
                                        title="Kembalikan ke Pengarsip untuk upload ulang scan digital"
                                      >
                                        Kembalikan ke pengarsip
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Add Bundle interface in DRAFT status */}
              {selectedManifest.status === "DRAFT" && (
                <div className="mt-4 border-t border-slate-100 pt-4 flex flex-col gap-3">
                  <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest select-none">
                    Masukkan Antrean Bundle
                  </h5>
                  {eligibleBundlesList.length === 0 ? (
                    <p className="text-center py-4 text-gray-400 font-medium text-xs border border-dashed border-gray-200 rounded-xl select-none">
                      Tidak ada bundle locked terarsip penuh di antrean.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {eligibleBundlesList.map((b) => (
                        <div
                          key={b.id}
                          className="p-3.5 bg-slate-50 border border-slate-150 rounded-xl text-xs flex flex-col gap-2 hover:border-slate-300 transition-all select-none"
                        >
                          <div>
                            <span className="font-bold text-slate-800 block truncate">{b.nomorBundle}</span>
                            <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">
                              Tipe: {b.jenisPermohonan?.replace(/_/g, " ")} • {b.permohonan?.length} berkas
                            </span>
                          </div>
                          <button
                            onClick={() => handleAddBundle(b.id)}
                            disabled={loading}
                            className="w-full py-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-[10px] rounded-lg transition-all active:scale-95 cursor-pointer text-center"
                          >
                            Tambah ke manifest
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Bar Footer depending on manifest status */}
            <div className="border-t border-gray-150 pt-4 bg-slate-50 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
              
              {/* Left description */}
              <div className="text-xs text-slate-500 font-medium">
                {selectedManifest.status === "DRAFT" && (
                  <span>* Masukkan map bundle terlebih dahulu lalu kunci manifest untuk melanjutkan ke proses pengiriman.</span>
                )}
                {selectedManifest.status === "LOCKED" && (
                  <span>* Cetak surat pengantar manifest dan unggah berkas bukti tanda terima untuk menyelesaikan pengiriman.</span>
                )}
                {selectedManifest.status === "SENT" && (
                  <span>* Pengiriman manifest telah selesai. Anda dapat meninjau tanda terima atau melaporkan anomali.</span>
                )}
              </div>

              {/* Right actions */}
              <div className="flex items-center gap-3 justify-end shrink-0">
                
                {/* Draft Actions */}
                {selectedManifest.status === "DRAFT" && (
                  <button
                    onClick={handleLockManifest}
                    disabled={loading || selectedManifest.bundle?.length === 0}
                    className="flex items-center gap-1.5 py-2.5 px-5 text-xs font-black text-white bg-indigo-650 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    Kunci manifest
                  </button>
                )}

                {/* Locked Actions */}
                {selectedManifest.status === "LOCKED" && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Print dispatch letter */}
                    <a
                      href={`/api/pdf/surat-pengantar-manifest/${selectedManifest.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 py-2.5 px-4 text-xs font-bold text-gray-700 hover:text-indigo-700 bg-white border border-slate-200 hover:border-slate-300 rounded-xl transition-all cursor-pointer"
                    >
                      <FileTextIcon className="w-4 h-4 text-red-500" />
                      Cetak surat pengantar
                    </a>

                    {/* Revert locking to draft */}
                    <button
                      onClick={handleRevisiManifest}
                      disabled={loading}
                      className="py-2.5 px-4 text-xs font-bold text-gray-655 hover:text-gray-800 bg-white border border-slate-200 rounded-xl transition-all cursor-pointer"
                    >
                      Revisi manifest
                    </button>

                    {/* Upload receipt file */}
                    <input
                      type="file"
                      accept=".pdf, image/jpeg, image/png"
                      ref={fileInputRef}
                      onChange={handleUploadReceipt}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={loading}
                      className="flex items-center gap-1.5 py-2.5 px-5 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-sm transition-all cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Unggah tanda terima
                    </button>
                  </div>
                )}

                {/* Sent Actions */}
                {selectedManifest.status === "SENT" && selectedManifest.buktiTandaTerima && (
                  <a
                    href={selectedManifest.buktiTandaTerima}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 py-2.5 px-5 text-xs font-black text-emerald-700 bg-emerald-50 hover:bg-emerald-100/50 rounded-xl border border-emerald-250 transition-all cursor-pointer"
                  >
                    <FileCheck className="w-4 h-4" />
                    Lihat bukti tanda terima
                  </a>
                )}
              </div>

            </div>
          </div>
        )}
      </div>

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
      </div>
    </div>
  );
}
