"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FileText,
  Search,
  Upload,
  History,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileCheck,
  RefreshCw,
  FolderOpen,
  ArrowLeftRight,
  ShieldAlert,
  Loader2,
  X,
  Star
} from "lucide-react";
import {
  getDigitizationBundles,
  getBundleDetails,
  uploadArsipDigital,
  ajukanKembalikanKePeneliti
} from "@/app/actions/pengarsip";
import { useDashboard } from "@/context/DashboardContext";
import { SkeletonBox, SkeletonText, SkeletonBadge, SkeletonProgressBar } from "@/components/skeletons/SkeletonBase";

/** Skeleton untuk PengarsipWorkspace — 2-panel flex layout */
export function PengarsipSkeleton() {
  return (
    <div className="w-full font-sans select-none flex flex-col gap-6 animate-fadeIn">
      {/* Header card skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#f3f6f9] p-5 rounded-2xl shadow-sm">
        <div className="flex flex-col gap-2">
          <SkeletonBox width="w-16" height="h-4" rounded="rounded-full" />
          <SkeletonBox width="w-64" height="h-5" rounded="rounded-full" />
        </div>
        <SkeletonBox width="w-44" height="h-8" rounded="rounded-xl" />
      </div>

      <div className="flex flex-col lg:flex-row gap-6 w-full">
        {/* LEFT PANEL: Bundle List */}
        <div className="w-full lg:w-96 flex flex-col gap-4 bg-white/70 backdrop-blur-md p-5 rounded-2xl border border-gray-250/50 shadow-sm shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gray-200 animate-pulse rounded" />
              <SkeletonBox width="w-36" height="h-5" rounded="rounded-full" />
            </div>
            <div className="w-7 h-7 bg-gray-200 animate-pulse rounded-lg" />
          </div>

          {/* Search */}
          <div className="h-10 bg-gray-200 animate-pulse rounded-xl" />

          {/* Bundle cards */}
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <SkeletonText width="w-36" height="h-3" />
                  <div className="flex gap-1.5">
                    <SkeletonBadge width="w-12" />
                    <SkeletonBadge width="w-16" />
                  </div>
                </div>
                <SkeletonProgressBar />
                <div className="flex justify-between">
                  <SkeletonText width="w-20" height="h-2.5" />
                  <SkeletonText width="w-16" height="h-2.5" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL: Detail placeholder */}
        <div className="flex-1 flex flex-col gap-5 bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-gray-250/50 shadow-sm min-w-0">
          {/* Detail header shimmer */}
          <div className="border-b border-gray-100 pb-4">
            <div className="flex items-center justify-between mb-3">
              <SkeletonBox width="w-48" height="h-5" rounded="rounded-full" />
              <SkeletonBadge width="w-20" />
            </div>
            <div className="flex gap-4">
              <SkeletonText width="w-32" height="h-3" />
              <SkeletonText width="w-24" height="h-3" />
            </div>
          </div>

          {/* Permohonan items */}
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <SkeletonText width="w-44" height="h-3" />
                  <SkeletonBadge width="w-20" />
                </div>
                <SkeletonText width="w-32" height="h-2.5" />
                <div className="flex gap-2">
                  <div className="h-8 w-28 bg-gray-200 animate-pulse rounded-lg" />
                  <div className="h-8 w-24 bg-gray-200 animate-pulse rounded-lg" />
                </div>
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

export default function PengarsipWorkspace() {
  const { showConfirm } = useDashboard();
  
  // Lists & Selected States
  const [bundlesList, setBundlesList] = useState<any[]>([]);
  const [selectedBundle, setSelectedBundle] = useState<any | null>(null);
  const [selectedPermohonan, setSelectedPermohonan] = useState<any | null>(null);

  // States for search and UI loaders
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Version history dropdown state (tracked by permohonanId)
  const [expandedHistory, setExpandedHistory] = useState<Record<string, boolean>>({});

  // Modals for Major Correction (Kembalikan ke Peneliti)
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [correctionTarget, setCorrectionTarget] = useState<any | null>(null);
  const [correctionReason, setCorrectionReason] = useState("");

  // Refs for file input
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const fetchBundles = async () => {
    setListLoading(true);
    setError("");
    try {
      const res = await getDigitizationBundles();
      if (res.success) {
        setBundlesList(res.list || []);
        
        // Re-sync currently selected bundle details if any
        if (selectedBundle) {
          const detailRes = await getBundleDetails(selectedBundle.id);
          if (detailRes.success) {
            setSelectedBundle(detailRes.bundle);
          } else {
            setSelectedBundle(null);
          }
        }
      } else {
        setError(res.error || "Gagal mengambil daftar bundle.");
      }
    } catch (err) {
      setError("Kesalahan koneksi ke server.");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchBundles();
  }, []);

  const handleSelectBundle = async (bundle: any) => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await getBundleDetails(bundle.id);
      if (res.success) {
        setSelectedBundle(res.bundle);
      } else {
        setError(res.error || "Gagal memuat detail bundle.");
      }
    } catch (err) {
      setError("Kesalahan memuat detail bundle.");
    } finally {
      setLoading(false);
    }
  };

  // Toggle version history visibility
  const toggleHistory = (permohonanId: string) => {
    setExpandedHistory((prev) => ({
      ...prev,
      [permohonanId]: !prev[permohonanId]
    }));
  };

  // Handle file upload
  const handleUploadFile = async (permohonanId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("File harus berupa dokumen bertipe PDF.");
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
      formData.append("permohonanId", permohonanId);
      formData.append("file", file);

      const res: any = await uploadArsipDigital(formData);
      if (res.success) {
        setSuccess("Arsip digital berhasil diunggah!");
        await fetchBundles();
        // Clear input element
        if (fileInputRefs.current[permohonanId]) {
          fileInputRefs.current[permohonanId]!.value = "";
        }
        setTimeout(() => setSuccess(""), 4000);
      } else {
        setError(res.error || "Gagal mengunggah arsip digital.");
      }
    } catch (err: any) {
      setError(err.message || "Sistem error saat mengunggah file.");
    } finally {
      setLoading(false);
    }
  };

  // Trigger file input dialog
  const triggerFileInput = (permohonanId: string) => {
    if (fileInputRefs.current[permohonanId]) {
      fileInputRefs.current[permohonanId]!.click();
    }
  };

  // Submit major correction: Kembalikan ke Peneliti
  const handleRequestCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctionTarget || !correctionReason.trim()) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res: any = await ajukanKembalikanKePeneliti(correctionTarget.id, correctionReason);
      if (res.success) {
        setSuccess("Permintaan koreksi 'Kembalikan ke Peneliti' berhasil diajukan dan sedang menunggu keputusan Supervisor.");
        setShowCorrectionModal(false);
        setCorrectionTarget(null);
        setCorrectionReason("");
        await fetchBundles();
        setTimeout(() => setSuccess(""), 5000);
      } else {
        setError(res.error || "Gagal mengajukan permintaan koreksi.");
      }
    } catch (err: any) {
      setError(err.message || "Sistem error saat mengajukan koreksi.");
    } finally {
      setLoading(false);
    }
  };

  // Open correction modal
  const openCorrectionModal = (permohonan: any) => {
    setCorrectionTarget(permohonan);
    setCorrectionReason("");
    setShowCorrectionModal(true);
  };

  // Filter bundles list by search query
  const filteredBundles = bundlesList.filter((b) =>
    b.nomorBundle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Early return: full skeleton while loading
  if (listLoading) return <PengarsipSkeleton />;

  return (
    <div className="w-full font-sans select-none flex flex-col gap-6 animate-fadeIn">
      {/* Header card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#f3f6f9] p-5 rounded-2xl shadow-sm select-none">
        <div>
          <span className="text-[9px] font-extrabold uppercase bg-indigo-50 border border-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full">
            Fase 4
          </span>
          <h2 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5 tracking-tight mt-1.5">
            Workspace Petugas Pengarsip (Digitalisasi)
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white border border-slate-100 px-3.5 py-2 rounded-xl shadow-3xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Arsip Digital Terintegrasi</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 w-full">
      {/* ================= LEFT PANEL: BUNDLES LIST ================= */}
      <div className="w-full lg:w-96 flex flex-col gap-4 bg-white/70 backdrop-blur-md p-5 rounded-2xl border border-gray-250/50 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-md font-bold text-gray-800 flex items-center gap-2 select-none">
            <FolderOpen className="w-5 h-5 text-indigo-500" /> Digitalisasi Antrean
          </h2>
          <button
            onClick={fetchBundles}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${listLoading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Search Input */}
        <div className={`relative p-[1.5px] rounded-xl transition-all duration-300 ${
          isSearchFocused 
            ? 'bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] shadow-xs' 
            : 'bg-slate-200/85'
        }`}>
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 z-10" />
          <input
            type="text"
            placeholder="Cari nomor bundle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="w-full bg-white border-transparent focus:outline-none text-xs font-semibold rounded-[10px] pl-9.5 pr-4 py-2 transition-all text-gray-705"
          />
        </div>

        {/* List of Bundles */}
        <div className="flex-1 max-h-[60vh] lg:max-h-[65vh] overflow-y-auto pr-1 flex flex-col gap-3">
          {listLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              <span className="text-xs font-bold">Memuat antrean bundle...</span>
            </div>
          ) : filteredBundles.length === 0 ? (
            <div className="text-center py-12 text-gray-400 font-semibold text-xs border border-dashed border-gray-200 rounded-xl">
              Tidak ada bundle untuk digitalisasi.
            </div>
          ) : (
            filteredBundles.map((b) => {
              const totalPermohonan = b.permohonan.length;
              const archivedPermohonan = b.permohonan.filter((p: any) => p.status === "ARCHIVED").length;
              const progressPercentage = totalPermohonan > 0 ? (archivedPermohonan / totalPermohonan) * 100 : 0;
              const isSelected = selectedBundle?.id === b.id;

              // Check if any application in the bundle needs re-upload (Fase 4 return flag)
              const needsReUpload = b.status === "IN_MANIFEST" && b.permohonan.some(
                (p: any) => p.status === "BUNDLED" && p.arsipDigital.some((ad: any) => ad.status === "SUPERSEDED")
              );

              return (
                <button
                  key={b.id}
                  onClick={() => handleSelectBundle(b)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-300 flex flex-col gap-2.5 ${
                    isSelected
                      ? "bg-gradient-to-r from-indigo-500 to-indigo-650 text-white border-indigo-600 shadow-md transform scale-[1.01]"
                      : "bg-white hover:bg-slate-50 border-gray-200 text-gray-800 shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-extrabold truncate max-w-[190px]">
                      {b.nomorBundle}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {needsReUpload && (
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full select-none ${
                          isSelected ? "bg-amber-400 text-slate-900" : "bg-amber-100 text-amber-800"
                        } animate-pulse`}>
                          Re-Upload
                        </span>
                      )}
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full select-none ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : b.status === "LOCKED"
                          ? "bg-indigo-100 text-indigo-800"
                          : "bg-slate-100 text-slate-800"
                      }`}>
                        {b.status}
                      </span>
                    </div>
                  </div>

                  {/* Progress Indicator */}
                  <div className="w-full flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] font-semibold">
                      <span className={isSelected ? "text-indigo-200" : "text-gray-400"}>
                        Digitalisasi: {archivedPermohonan}/{totalPermohonan}
                      </span>
                      <span className={isSelected ? "text-indigo-100" : "text-gray-600"}>
                        {Math.round(progressPercentage)}%
                      </span>
                    </div>
                    <div className={`w-full h-1.5 rounded-full overflow-hidden ${isSelected ? "bg-indigo-700/50" : "bg-gray-100"}`}>
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${isSelected ? "bg-white" : "bg-indigo-600"}`}
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  <div className={`text-[9px] flex items-center justify-between font-medium ${isSelected ? "text-indigo-200" : "text-gray-400"}`}>
                    <span>Peneliti: {b.peneliti?.name || "-"}</span>
                    <span>{new Date(b.createdAt).toLocaleDateString("id-ID")}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ================= RIGHT PANEL: SELECTED BUNDLE DETAILS ================= */}
      <div className="flex-1 flex flex-col gap-5 bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-gray-250/50 shadow-sm min-w-0">
        
        {/* Banner Messages */}
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

        {!selectedBundle ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-20 text-gray-400 select-none">
            <FileText className="w-12 h-12 text-slate-300 mb-3 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-700 mb-1">Pilih Bundle</h3>
            <p className="text-xs text-gray-400 font-semibold max-w-sm">
              Silakan pilih salah satu bundle di antrean sebelah kiri untuk mengelola digitalisasi dan mengunggah dokumen arsip fisik.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-5 flex-1">
            
            {/* Header info */}
            <div className="border-b border-gray-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
              <div>
                <h3 className="text-sm font-extrabold text-gray-800 flex items-center gap-1.5">
                  Detail Bundle: <span className="text-indigo-600 font-black">{selectedBundle.nomorBundle}</span>
                </h3>
                <p className="text-[11px] text-gray-400 font-semibold mt-0.5">
                  Status: <span className="font-bold text-gray-700 uppercase">{selectedBundle.status}</span> • 
                  Jenis: <span className="font-bold text-gray-700 uppercase">{selectedBundle.jenisPermohonan?.replace(/_/g, " ") || "Campuran"}</span>
                </p>
              </div>
              <div className="text-[11px] font-semibold text-gray-400 text-left sm:text-right">
                <p>Verifikasi oleh Peneliti: <span className="text-gray-700">{selectedBundle.peneliti?.name || "-"}</span></p>
                <p>Dibuat: <span className="text-gray-700">{new Date(selectedBundle.createdAt).toLocaleString("id-ID")}</span></p>
              </div>
            </div>

            {/* List of applications */}
            <div className="flex flex-col gap-4 overflow-y-auto max-h-[60vh]">
              <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">
                Daftar Permohonan ({selectedBundle.permohonan.length})
              </h4>

              {selectedBundle.permohonan.length === 0 ? (
                <p className="text-center py-6 text-gray-400 font-semibold text-xs border border-dashed border-gray-200 rounded-xl select-none">
                  Bundle ini tidak memiliki permohonan.
                </p>
              ) : (
                selectedBundle.permohonan.map((p: any) => {
                  const activeArchive = p.arsipDigital?.find((ad: any) => ad.status === "ACTIVE");
                  
                  // Check if this permohonan is frozen (pending correction approval)
                  const isFrozen = p.permintaanKoreksi && p.permintaanKoreksi.length > 0;
                  const pendingReq = isFrozen ? p.permintaanKoreksi[0] : null;

                  // Flag re-upload if status is BUNDLED and has superseded versions (returned from logistik)
                  const needsReUpload = p.status === "BUNDLED" && p.arsipDigital?.some((ad: any) => ad.status === "SUPERSEDED");

                  return (
                    <div
                      key={p.id}
                      className={`p-5 bg-white border rounded-2xl shadow-sm flex flex-col gap-4 transition-all hover:shadow-md ${
                        isFrozen 
                          ? "border-amber-200 bg-amber-50/20" 
                          : needsReUpload
                          ? "border-amber-300"
                          : "border-gray-200"
                      }`}
                    >
                      {/* Top Info Header */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-black text-gray-900 tracking-tight">
                              NOP: {formatNop(p.nop)}
                            </span>
                            {p.isFavorite && (
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0 shadow-3xs" />
                            )}
                            <span className="text-[10px] font-bold text-gray-400 bg-slate-100 px-2 py-0.5 rounded-full select-none">
                              {p.jenisPermohonan?.replace(/_/g, " ")}
                            </span>
                          </div>
                          <span className="text-xs text-gray-700 font-bold mt-1">
                            Wajib Pajak: {p.namaWajibPajak}
                          </span>
                          <span className="text-[10px] text-gray-400 font-semibold mt-0.5">
                            Pelayanan: {p.nomorPelayanan || "-"} • WA WP: {p.noWhatsapp}
                          </span>
                        </div>

                        {/* Status Badges */}
                        <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
                          {isFrozen && (
                            <span className="text-[9px] font-bold px-2.5 py-1 bg-amber-500 text-white rounded-full flex items-center gap-1 animate-pulse select-none">
                              <ShieldAlert className="w-3 h-3" /> Menunggu Acc Supervisor
                            </span>
                          )}
                          {needsReUpload && !isFrozen && (
                            <span className="text-[9px] font-bold px-2.5 py-1 bg-amber-100 text-amber-800 border border-amber-250 rounded-full flex items-center gap-1 select-none animate-pulse">
                              <AlertTriangle className="w-3 h-3 text-amber-600" /> Perlu Re-Upload
                            </span>
                          )}
                          <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase select-none ${
                            p.status === "ARCHIVED"
                              ? "bg-emerald-100 text-emerald-800"
                              : p.status === "BUNDLED"
                              ? "bg-sky-100 text-sky-800"
                              : "bg-slate-100 text-slate-800"
                          }`}>
                            {p.status === "ARCHIVED" ? "Terarsip" : p.status === "BUNDLED" ? "Terbundel" : p.status}
                          </span>
                        </div>
                      </div>

                      {/* Display Alert Banner if Frozen */}
                      {isFrozen && (
                        <div className="bg-amber-50/70 border border-amber-200 text-amber-800 p-3 rounded-xl text-xs font-semibold select-none flex flex-col gap-1">
                          <p className="flex items-center gap-1.5 font-bold">
                            <Clock className="w-3.5 h-3.5 text-amber-500 animate-spin" /> 
                            Permohonan ini dibekukan
                          </p>
                          <p className="text-[10px] text-amber-700 leading-relaxed pl-5 font-semibold">
                            Pengajuan koreksi major ({pendingReq.jenisKoreksi.replace(/_/g, " ")}) diajukan oleh Anda. 
                            Catatan: "{pendingReq.catatanPengaju}"
                          </p>
                        </div>
                      )}

                      {/* Actions & File Areas */}
                      <div className="border-t border-gray-100 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {/* LEFT: File Upload controls */}
                        <div className="flex-1 flex flex-col gap-2">
                          <input
                            type="file"
                            accept=".pdf"
                            ref={(el) => {
                              fileInputRefs.current[p.id] = el;
                            }}
                            onChange={(e) => handleUploadFile(p.id, e)}
                            className="hidden"
                            disabled={isFrozen || loading}
                          />

                          {/* Not Uploaded view */}
                          {p.status === "BUNDLED" && (
                            <button
                              onClick={() => triggerFileInput(p.id)}
                              disabled={isFrozen || loading}
                              className={`flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-extrabold rounded-xl border border-dashed text-indigo-600 border-indigo-300 hover:bg-indigo-50/50 hover:border-indigo-400 active:scale-98 transition-all cursor-pointer ${
                                isFrozen ? "opacity-50 cursor-not-allowed" : ""
                              }`}
                            >
                              <Upload className="w-4 h-4 shrink-0" />
                              {needsReUpload ? "Re-upload file PDF baru" : "Unggah arsip PDF"}
                            </button>
                          )}

                          {/* Active archive file display */}
                          {p.status === "ARCHIVED" && activeArchive && (
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-emerald-500/10 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                                <FileCheck className="w-5 h-5" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-bold text-gray-800 flex items-center gap-1">
                                  Arsip aktif (v{activeArchive.versi})
                                  <a
                                    href={activeArchive.urlBlob}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-indigo-600 hover:text-indigo-800 transition-colors p-0.5 shrink-0 inline-flex items-center"
                                    title="Buka file di tab baru"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                </span>
                                <span className="text-[10px] text-gray-400 font-semibold truncate">
                                  Diunggah: {new Date(activeArchive.createdAt).toLocaleString("id-ID")}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* RIGHT: Major / Minor Corrections */}
                        {!isFrozen && (
                          <div className="flex items-center gap-2 sm:justify-end shrink-0">
                            {/* Upload Ulang (Minor Correction) */}
                            {p.status === "ARCHIVED" && (
                              <button
                                onClick={() => triggerFileInput(p.id)}
                                disabled={loading}
                                className="flex items-center gap-1.5 py-2 px-3 text-xs font-bold text-gray-600 hover:text-indigo-700 bg-slate-50 hover:bg-indigo-55/15 rounded-xl transition-all cursor-pointer active:scale-95"
                                title="Ganti berkas digital tanpa mengubah status"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                Upload ulang
                              </button>
                            )}

                            {/* Kembalikan ke Peneliti (Major Correction) */}
                            <button
                              onClick={() => openCorrectionModal(p)}
                              disabled={loading}
                              className="flex items-center gap-1.5 py-2 px-3 text-xs font-bold text-gray-500 hover:text-red-700 bg-slate-50 hover:bg-red-50 rounded-xl transition-all cursor-pointer active:scale-95"
                              title="Kembalikan permohonan ke peneliti (cacat berkas / substansi data)"
                            >
                              <ArrowLeftRight className="w-3.5 h-3.5" />
                              Kembalikan ke peneliti
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Expandable Version History list */}
                      {p.arsipDigital && p.arsipDigital.length > 0 && (
                        <div className="border-t border-slate-50 pt-2 select-none">
                          <button
                            onClick={() => toggleHistory(p.id)}
                            className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-600 font-bold transition-colors"
                          >
                            <History className="w-3 h-3" />
                            {expandedHistory[p.id] ? "Sembunyikan riwayat" : `Tampilkan riwayat (${p.arsipDigital.length})`}
                            {expandedHistory[p.id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>

                          {expandedHistory[p.id] && (
                            <div className="mt-2.5 overflow-x-auto rounded-xl border border-slate-100 shadow-inner">
                              <table className="w-full text-[10px] text-left text-gray-600 border-collapse">
                                <thead>
                                  <tr className="bg-[#f8fafc] text-gray-400 border-b border-gray-200/60 uppercase select-none font-bold">
                                    <th className="px-3 py-1.5 font-bold">Versi</th>
                                    <th className="px-3 py-1.5 font-bold">Status Versi</th>
                                    <th className="px-3 py-1.5 font-bold">Tanggal Upload</th>
                                    <th className="px-3 py-1.5 font-bold">Aksi</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {p.arsipDigital.map((ad: any) => (
                                    <tr key={ad.id} className="border-b border-slate-200 last:border-0 hover:bg-slate-100/50">
                                      <td className="px-3 py-1.5 font-bold">v{ad.versi}</td>
                                      <td className="px-3 py-1.5">
                                        <span className={`font-semibold px-1.5 py-0.5 rounded-md text-[9px] ${
                                          ad.status === "ACTIVE"
                                            ? "bg-emerald-100 text-emerald-800"
                                            : ad.status === "SUPERSEDED"
                                            ? "bg-amber-100 text-amber-800"
                                            : "bg-red-100 text-red-800"
                                        }`}>
                                          {ad.status === "ACTIVE" ? "Aktif" : ad.status === "SUPERSEDED" ? "Digantikan" : "Dibatalkan"}
                                        </span>
                                      </td>
                                      <td className="px-3 py-1.5 font-medium">
                                        {new Date(ad.createdAt).toLocaleString("id-ID")}
                                      </td>
                                      <td className="px-3 py-1.5">
                                        <a
                                          href={ad.urlBlob}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-indigo-600 hover:text-indigo-800 transition-colors font-bold inline-flex items-center gap-0.5"
                                        >
                                          Buka <ExternalLink className="w-2.5 h-2.5" />
                                        </a>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* ================= MODAL: AJUKAN KEMBALIKAN KE PENELITI ================= */}
      {showCorrectionModal && correctionTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4 select-none">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-150 overflow-hidden animate-scaleUp">
            
            {/* Modal Header */}
            <div className="bg-slate-50 border-b border-slate-100 px-5 py-4 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-red-500 animate-pulse" />
                Kembalikan ke Peneliti
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
                    Anda mengajukan pengembalian <strong>koreksi major</strong> untuk berkas NOP: <strong>{formatNop(correctionTarget.nop)}</strong>.
                  </p>
                  <p className="text-[10px] text-red-600 mt-1.5 font-bold">
                    * Tindakan ini memerlukan persetujuan Supervisor dan akan mem-freeze permohonan hingga diputuskan.
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
                    placeholder="Masukkan alasan detail kesalahan berkas fisik (misalnya: dokumen sobek, berkas tertukar, NOP berbeda dengan fisik, dll.)"
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
                  className="px-4 py-2 text-xs font-bold text-white bg-red-650 hover:bg-red-700 active:scale-95 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
