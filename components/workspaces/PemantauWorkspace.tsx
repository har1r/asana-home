"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Search,
  Clock,
  ExternalLink,
  RefreshCw,
  ArrowLeftRight,
  ShieldAlert,
  Loader2,
  X,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  Calendar,
  Layers,
  ChevronRight,
  RotateCcw,
  Star
} from "lucide-react";
import {
  getMonitoringPermohonan,
  completePermohonan,
  ajukanBatalSelesai
} from "@/app/actions/pemantau";
import { useDashboard } from "@/context/DashboardContext";
import { SkeletonBox, SkeletonText, SkeletonBadge } from "@/components/skeletons/SkeletonBase";

/** Skeleton untuk PemantauWorkspace — 2-panel layout + timeline stepper */
export function PemantauSkeleton() {
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
            <SkeletonText width="w-24" height="h-3" />
            <div className="w-6 h-6 bg-gray-200 animate-pulse rounded-lg" />
          </div>

          {/* Search */}
          <div className="h-10 bg-gray-200 animate-pulse rounded-xl" />

          {/* Permohonan cards */}
          <div className="flex flex-col gap-3 max-h-[55vh] overflow-y-auto">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <SkeletonText width="w-36" height="h-3" />
                  <SkeletonBadge width="w-16" />
                </div>
                <SkeletonText width={i % 2 === 0 ? 'w-32' : 'w-28'} height="h-3" />
                <div className="flex justify-between mt-1">
                  <SkeletonText width="w-24" height="h-2.5" />
                  <SkeletonText width="w-16" height="h-2.5" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL: Detail */}
        <div className="flex-1 flex flex-col gap-5 bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-gray-250/50 shadow-sm min-w-0">
          {/* Detail header */}
          <div className="border-b border-gray-100 pb-4">
            <div className="flex items-center justify-between mb-3">
              <SkeletonBox width="w-48" height="h-5" rounded="rounded-full" />
              <SkeletonBadge width="w-20" />
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

          {/* Timeline stepper shimmer */}
          <div className="flex flex-col gap-2">
            <SkeletonText width="w-32" height="h-4" className="mb-2" />
            <div className="flex items-center gap-0">
              {Array.from({ length: 5 }).map((_, i) => (
                <React.Fragment key={i}>
                  <div className="flex flex-col items-center gap-1.5">
                    <div className={`w-8 h-8 rounded-full animate-pulse ${i < 3 ? 'bg-indigo-200' : 'bg-gray-200'}`} />
                    <SkeletonText width="w-14" height="h-2" />
                  </div>
                  {i < 4 && (
                    <div className={`flex-1 h-0.5 mb-5 animate-pulse ${i < 2 ? 'bg-indigo-200' : 'bg-gray-200'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mt-auto pt-4 border-t border-gray-100">
            <div className="h-9 flex-1 bg-gray-200 animate-pulse rounded-xl" />
            <div className="h-9 w-36 bg-gray-200 animate-pulse rounded-xl" />
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

export default function PemantauWorkspace() {
  const { showConfirm } = useDashboard();

  // Tabs: 'antrean-pemantauan' vs 'daftar-selesai'
  const [workspaceTab, setWorkspaceTab] = useState<"antrean-pemantauan" | "daftar-selesai">("antrean-pemantauan");

  // Lists and Selected States
  const [permohonanList, setPermohonanList] = useState<any[]>([]);
  const [selectedPermohonan, setSelectedPermohonan] = useState<any | null>(null);

  // States for search and loaders
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Rollback Modal
  const [showRollbackModal, setShowRollbackModal] = useState(false);
  const [rollbackReason, setRollbackReason] = useState("");

  const fetchData = async () => {
    setListLoading(true);
    setError("");
    try {
      const res = await getMonitoringPermohonan();
      if (res.success) {
        setPermohonanList(res.list || []);
        
        // Re-sync selected application details if any
        if (selectedPermohonan) {
          const updated = res.list?.find((p) => p.id === selectedPermohonan.id);
          setSelectedPermohonan(updated || null);
        }
      } else {
        setError(res.error || "Gagal memuat antrean pemantauan.");
      }
    } catch (err) {
      setError("Kesalahan koneksi ke server.");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter permohonan by search query and tab status
  const filteredList = permohonanList.filter((p) => {
    const matchesSearch =
      p.nop.includes(searchQuery) ||
      p.namaWajibPajak.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.nomorPelayanan && p.nomorPelayanan.toLowerCase().includes(searchQuery.toLowerCase()));

    const targetStatus = workspaceTab === "antrean-pemantauan" ? "ARCHIVED" : "COMPLETED";
    return matchesSearch && p.status === targetStatus;
  });

  // Complete Permohonan
  const handleComplete = (id: string, nomorPermohonan: string) => {
    showConfirm({
      title: "Konfirmasi Penyelesaian",
      message: `Apakah Anda yakin ingin menandai permohonan ${nomorPermohonan} SELESAI? Tindakan ini akan mengirimkan notifikasi WhatsApp kelulusan layanan kepada Wajib Pajak.`,
      onConfirm: async () => {
        setLoading(true);
        setError("");
        setSuccess("");
        try {
          const res: any = await completePermohonan(id);
          if (res.success) {
            setSuccess(`Permohonan ${nomorPermohonan} berhasil ditandai selesai!`);
            await fetchData();
            setTimeout(() => setSuccess(""), 5000);
          } else {
            setError(res.error || "Gagal menyelesaikan permohonan.");
          }
        } catch (err: any) {
          setError(err.message || "Sistem error.");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Submit Rollback Request: Batal Selesai
  const handleRollback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPermohonan || !rollbackReason.trim()) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res: any = await ajukanBatalSelesai(selectedPermohonan.id, rollbackReason);
      if (res.success) {
        setSuccess("Permintaan rollback 'Batal Selesai' berhasil diajukan dan sedang menunggu keputusan Supervisor.");
        setShowRollbackModal(false);
        setRollbackReason("");
        await fetchData();
        setTimeout(() => setSuccess(""), 5000);
      } else {
        setError(res.error || "Gagal mengajukan rollback.");
      }
    } catch (err: any) {
      setError(err.message || "Sistem error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full font-sans select-none flex flex-col gap-6 animate-fadeIn">

      {/* Show full skeleton during initial data load */}
      {listLoading && <PemantauSkeleton />}

      {/* Hide content while skeleton visible */}
      <div className={`flex flex-col gap-6 ${listLoading ? 'hidden' : ''}`}>

        {/* Header card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#f3f6f9] p-5 rounded-2xl shadow-sm select-none">
          <div>
            <span className="text-[9px] font-extrabold uppercase bg-indigo-50 border border-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full">
              Fase 6
            </span>
            <h2 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5 tracking-tight mt-1.5">
              Workspace Petugas Pemantau (Monitoring)
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white border border-slate-100 px-3.5 py-2 rounded-xl shadow-3xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Pemantauan & Penyelesaian</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 w-full">
      
      {/* ================= LEFT PANEL: TABBED APPLICATIONS LIST ================= */}
      <div className="w-full lg:w-96 flex flex-col gap-4 bg-white/70 backdrop-blur-md p-5 rounded-2xl border border-gray-250/50 shadow-sm shrink-0">
        
        {/* Tab Switcher */}
        <div className="flex p-1 bg-slate-100 rounded-xl select-none">
          <button
            onClick={() => {
              setWorkspaceTab("antrean-pemantauan");
              setSelectedPermohonan(null);
            }}
            className={`flex-1 text-center py-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
              workspaceTab === "antrean-pemantauan"
                ? "bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] text-[#2c333f] shadow-sm font-extrabold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Antrean Pemantauan
          </button>
          <button
            onClick={() => {
              setWorkspaceTab("daftar-selesai");
              setSelectedPermohonan(null);
            }}
            className={`flex-1 text-center py-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
              workspaceTab === "daftar-selesai"
                ? "bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] text-[#2c333f] shadow-sm font-extrabold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Daftar Selesai
          </button>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black text-slate-500 uppercase tracking-wider select-none">
            {workspaceTab === "antrean-pemantauan" ? "Fase 5 - Antrean" : "Arsip Selesai"}
          </h2>
          <button
            onClick={fetchData}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${listLoading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Search Bar */}
        <div className={`relative p-[1.5px] rounded-xl transition-all duration-300 ${
          isSearchFocused 
            ? 'bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] shadow-xs' 
            : 'bg-slate-200/85'
        }`}>
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 z-10" />
          <input
            type="text"
            placeholder="Cari NOP, pelayanan, atau WP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="w-full bg-white border-transparent focus:outline-none text-xs font-semibold rounded-[10px] pl-9.5 pr-4 py-2 transition-all text-gray-705"
          />
        </div>

        {/* List of Applications */}
        <div className="flex-1 max-h-[55vh] lg:max-h-[60vh] overflow-y-auto pr-1 flex flex-col gap-3">
          {listLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              <span className="text-xs font-bold">Memuat berkas permohonan...</span>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="text-center py-12 text-gray-400 font-semibold text-xs border border-dashed border-gray-200 rounded-xl select-none">
              Tidak ada permohonan di tab ini.
            </div>
          ) : (
            filteredList.map((p) => {
              const isSelected = selectedPermohonan?.id === p.id;
              const manifestNo = p.bundle?.manifest?.nomorManifest || "-";
              
              // Check frozen state
              const isFrozen = p.permintaanKoreksi && p.permintaanKoreksi.length > 0;

              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPermohonan(p)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-300 flex flex-col gap-2 ${
                    isSelected
                      ? "bg-gradient-to-r from-indigo-500 to-indigo-650 text-white border-indigo-600 shadow-md transform scale-[1.01]"
                      : isFrozen
                      ? "bg-amber-50/40 hover:bg-amber-50 border-amber-200 text-gray-800 shadow-sm"
                      : "bg-white hover:bg-slate-50 border-gray-200 text-gray-800 shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-black truncate max-w-[190px] flex items-center gap-1.5 font-mono">
                      NOP: {formatNop(p.nop)}
                      {p.isFavorite && (
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0 shadow-3xs" />
                      )}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {isFrozen && (
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full animate-pulse ${
                          isSelected ? "bg-amber-400 text-slate-900" : "bg-amber-100 text-amber-800"
                        }`}>
                          Frozen
                        </span>
                      )}
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase select-none ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : p.status === "COMPLETED"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-sky-100 text-sky-800"
                      }`}>
                        {p.status === "COMPLETED" ? "Selesai" : "Terarsip"}
                      </span>
                    </div>
                  </div>

                  <div className={`text-xs font-bold ${isSelected ? "text-indigo-100" : "text-slate-700"}`}>
                    Wajib Pajak: {p.namaWajibPajak}
                  </div>

                  <div className={`text-[9px] font-semibold flex items-center justify-between ${isSelected ? "text-indigo-200" : "text-gray-400"} mt-1.5`}>
                    <span className="truncate max-w-[170px]">Manifest: {manifestNo}</span>
                    <span>{new Date(p.updatedAt).toLocaleDateString("id-ID")}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ================= RIGHT PANEL: SELECTED APPLICATION DETAILS ================= */}
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

        {!selectedPermohonan ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-20 text-gray-400 select-none">
            <Layers className="w-12 h-12 text-slate-350 mb-3 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-700 mb-1">Pilih Permohonan</h3>
            <p className="text-xs text-gray-400 font-semibold max-w-sm">
              Silakan pilih salah satu permohonan layanan PBB di antrean kiri untuk meninjau berkas, berkas arsip PDF, detail logistik manifest, dan memproses penyelesaian layanan.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-5 flex-1">
            
            {/* Header Application */}
            <div className="border-b border-gray-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
              <div>
                <h3 className="text-sm font-extrabold text-gray-800">
                  Permohonan: <span className="text-indigo-600 font-black">{selectedPermohonan.nomorPermohonan}</span>
                </h3>
                <p className="text-[11px] text-gray-400 font-semibold mt-0.5">
                  Tipe: <span className="font-bold text-gray-700 uppercase">{selectedPermohonan.jenisPermohonan?.replace(/_/g, " ")}</span>
                </p>
              </div>

              {/* Status Badge */}
              <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase shrink-0 ${
                selectedPermohonan.status === "COMPLETED"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-sky-100 text-sky-800"
              }`}>
                {selectedPermohonan.status === "COMPLETED" ? "Layanan Selesai" : "Arsip Terverifikasi"}
              </span>
            </div>

            {/* Display Alert Banner if Frozen */}
            {selectedPermohonan.permintaanKoreksi && selectedPermohonan.permintaanKoreksi.length > 0 && (
              <div className="bg-amber-50/70 border border-amber-200 text-amber-800 p-4 rounded-xl text-xs font-semibold select-none flex flex-col gap-1.5 animate-fadeIn">
                <p className="flex items-center gap-1.5 font-bold">
                  <ShieldAlert className="w-4 h-4 text-amber-500 animate-bounce" /> 
                  Permohonan ini dibekukan (LOCKED)
                </p>
                <p className="text-[10px] text-amber-700 leading-relaxed pl-5 font-semibold">
                  Tindakan koreksi pembatalan selesai (**Rollback**) telah diajukan dan sedang menunggu persetujuan dari Supervisor sebelum status berkas dapat dipulihkan ke Terarsip.
                  Catatan: "{selectedPermohonan.permintaanKoreksi[0].catatanPengaju}"
                </p>
              </div>
            )}

            {/* Metadata Fields Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs select-none">
              
              {/* Box 1: WP Info */}
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex flex-col gap-2.5">
                <h5 className="font-extrabold text-slate-500 uppercase tracking-widest text-[9px]">
                  Informasi Wajib Pajak
                </h5>
                <div className="flex flex-col gap-1.5">
                  <p className="text-gray-400 font-semibold">NOP: <span className="text-gray-800 font-bold">{formatNop(selectedPermohonan.nop)}</span></p>
                  <p className="text-gray-400 font-semibold">Nama WP: <span className="text-gray-800 font-bold">{selectedPermohonan.namaWajibPajak}</span></p>
                  <p className="text-gray-400 font-semibold">Alamat: <span className="text-gray-800 font-bold">{selectedPermohonan.alamat}</span></p>
                  <p className="text-gray-400 font-semibold">No. WhatsApp: <span className="text-gray-800 font-bold">{selectedPermohonan.noWhatsapp}</span></p>
                </div>
              </div>

              {/* Box 2: Logistics Info */}
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex flex-col gap-2.5">
                <h5 className="font-extrabold text-slate-500 uppercase tracking-widest text-[9px]">
                  Informasi Logistik Pengiriman
                </h5>
                <div className="flex flex-col gap-1.5">
                  <p className="text-gray-400 font-semibold">Nomor Map/Bundle: <span className="text-gray-800 font-bold">{selectedPermohonan.bundle?.nomorBundle || "-"}</span></p>
                  <p className="text-gray-400 font-semibold">Nomor Manifest: <span className="text-gray-800 font-bold">{selectedPermohonan.bundle?.manifest?.nomorManifest || "-"}</span></p>
                  <p className="text-gray-400 font-semibold">Petugas Pengirim: <span className="text-gray-800 font-bold">{selectedPermohonan.bundle?.manifest?.pengirim?.name || "-"}</span></p>
                  <p className="text-gray-400 font-semibold">Tanggal Kirim: <span className="text-gray-800 font-bold">{selectedPermohonan.bundle?.manifest?.updatedAt ? new Date(selectedPermohonan.bundle.manifest.updatedAt).toLocaleDateString("id-ID") : "-"}</span></p>
                </div>
              </div>
            </div>

            {/* Scanned Archive view */}
            {selectedPermohonan.arsipDigital && selectedPermohonan.arsipDigital.length > 0 && (
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex items-center justify-between gap-4 text-xs select-none">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-emerald-500/10 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-gray-800 block">
                      Dokumen Arsip Digital (PDF v{selectedPermohonan.arsipDigital[0].versi})
                    </span>
                    <span className="text-[10px] text-gray-400 font-semibold block mt-0.5">
                      Diunggah: {new Date(selectedPermohonan.arsipDigital[0].createdAt).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
                
                <a
                  href={selectedPermohonan.arsipDigital[0].urlBlob}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 py-1.5 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-indigo-655 font-bold rounded-lg transition-all shrink-0 cursor-pointer"
                  title="Lihat dokumen PDF asli di tab baru"
                >
                  Lihat berkas <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </a>
              </div>
            )}

            {/* Active Actions Footer depending on status */}
            <div className="mt-auto border-t border-gray-100 pt-5 bg-slate-50 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
              
              {/* Left guidance */}
              <div className="text-xs text-slate-500 font-medium">
                {selectedPermohonan.status === "ARCHIVED" && (
                  <span>* Klik "Tandai Layanan Selesai" jika produk layanan PBB untuk WP ini telah terbit dan selesai diproses di Kantor Pusat.</span>
                )}
                {selectedPermohonan.status === "COMPLETED" && (
                  <span>* Jika terjadi kesalahan status selesai, klik "Batal Selesai" untuk mengajukan persetujuan pemulihan ke Supervisor.</span>
                )}
              </div>

              {/* Right actions */}
              <div className="flex items-center gap-3 justify-end shrink-0">
                {selectedPermohonan.status === "ARCHIVED" && (
                  <button
                    onClick={() => handleComplete(selectedPermohonan.id, selectedPermohonan.nomorPermohonan)}
                    disabled={loading || selectedPermohonan.permintaanKoreksi?.length > 0}
                    className="flex items-center gap-1.5 py-2.5 px-5 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Tandai layanan selesai
                  </button>
                )}

                {selectedPermohonan.status === "COMPLETED" && (
                  <button
                    onClick={() => setShowRollbackModal(true)}
                    disabled={loading || selectedPermohonan.permintaanKoreksi?.length > 0}
                    className="flex items-center gap-1.5 py-2.5 px-5 text-xs font-black text-white bg-red-650 hover:bg-red-700 active:scale-95 rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Batal selesai (rollback)
                  </button>
                )}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* ================= MODAL: AJUKAN ROLLBACK (BATAL SELESAI) ================= */}
      {showRollbackModal && selectedPermohonan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4 select-none animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-150 overflow-hidden animate-scaleUp">
            
            {/* Modal Header */}
            <div className="bg-slate-50 border-b border-slate-100 px-5 py-4 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-red-500 animate-pulse" />
                Batal Selesai (Rollback)
              </h3>
              <button
                onClick={() => {
                  setShowRollbackModal(false);
                  setRollbackReason("");
                }}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleRollback}>
              <div className="p-5 flex flex-col gap-4 text-xs">
                <div className="p-3.5 bg-red-50/50 border border-red-100 rounded-xl leading-relaxed text-red-800 font-medium">
                  <p>
                    Anda mengajukan pembatalan status selesai (Rollback) untuk berkas NOP: <strong>{formatNop(selectedPermohonan.nop)}</strong>.
                  </p>
                  <p className="text-[10px] text-red-650 mt-1.5 font-bold">
                    * Tindakan ini bersifat destruktif, memerlukan persetujuan Supervisor, dan akan membekukan berkas hingga diputuskan.
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="catatan-rollback" className="font-extrabold text-gray-755">
                    Alasan pembatalan / rollback berkas <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="catatan-rollback"
                    rows={4}
                    value={rollbackReason}
                    onChange={(e) => setRollbackReason(e.target.value)}
                    placeholder="Masukkan alasan detail mengapa status selesai harus dibatalkan (misalnya: produk layanan cacat cetak, dibatalkan oleh WP, salah menandai berkas, dll.)"
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
                    setShowRollbackModal(false);
                    setRollbackReason("");
                  }}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading || !rollbackReason.trim()}
                  className="px-4 py-2 text-xs font-bold text-white bg-red-650 hover:bg-red-700 active:scale-95 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Ajukan rollback status
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
        </div>
      </div>{/* end: hide-during-skeleton wrapper */}
    </div>
  );
}
