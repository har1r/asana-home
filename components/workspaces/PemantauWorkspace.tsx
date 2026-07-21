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
  Star,
  Boxes,
  FileSpreadsheet,
  ArrowRight,
  Printer,
  Check,
  ChevronLeft
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

      {/* Main card skeleton */}
      <div className="bg-[#dde3ea] rounded-2xl p-6 shadow-sm flex flex-col gap-6 min-h-[400px]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <SkeletonText width="w-40" height="h-4" />
          <SkeletonBox width="w-56" height="h-8" rounded="rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col gap-3 h-32">
              <SkeletonText width="w-24" height="h-4" />
              <SkeletonText width="w-36" height="h-3" />
              <SkeletonText width="w-20" height="h-3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const formatNop = (nop: string) => {
  if (!nop) return '';
  const cleanNop = nop.replace(/[^0-9]/g, '');
  if (cleanNop.length === 17) {
    const padded = cleanNop + '0';
    return `${padded.slice(0, 2)}.${padded.slice(2, 4)}.${padded.slice(4, 7)}.${padded.slice(7, 10)}.${padded.slice(10, 13)}-${padded.slice(13, 17)}.${padded.slice(17)}`;
  }
  if (cleanNop.length === 18) {
    return `${cleanNop.slice(0, 2)}.${cleanNop.slice(2, 4)}.${cleanNop.slice(4, 7)}.${cleanNop.slice(7, 10)}.${cleanNop.slice(10, 13)}-${cleanNop.slice(13, 17)}.${cleanNop.slice(17)}`;
  }
  return nop;
};

export default function PemantauWorkspace() {
  const { showConfirm } = useDashboard();
  // Tabs: 'antrean-pemantauan' vs 'daftar-selesai' vs 'detail-permohonan'
  const [workspaceTab, setWorkspaceTab] = useState<"antrean-pemantauan" | "daftar-selesai" | "detail-permohonan">("antrean-pemantauan");

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

  // Pagination states
  const [currentAntreanPage, setCurrentAntreanPage] = useState(1);
  const [currentSelesaiPage, setCurrentSelesaiPage] = useState(1);
  const itemsPerPage = 8;

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

  // Reset pagination when search changes
  useEffect(() => {
    setCurrentAntreanPage(1);
    setCurrentSelesaiPage(1);
  }, [searchQuery]);

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

  // Filter permohonan by search query and tab status (for separate states)
  const filteredAntreanList = permohonanList.filter((p) => {
    const matchesSearch =
      p.nop.includes(searchQuery) ||
      p.namaWajibPajak.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.nomorPelayanan && p.nomorPelayanan.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch && p.status === "ARCHIVED";
  });

  const filteredSelesaiList = permohonanList.filter((p) => {
    const matchesSearch =
      p.nop.includes(searchQuery) ||
      p.namaWajibPajak.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.nomorPelayanan && p.nomorPelayanan.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch && p.status === "COMPLETED";
  });

  // Paginated Lists
  const totalAntreanPages = Math.ceil(filteredAntreanList.length / itemsPerPage);
  const activeAntreanPage = currentAntreanPage > totalAntreanPages ? 1 : currentAntreanPage;
  const paginatedAntrean = filteredAntreanList.slice(
    (activeAntreanPage - 1) * itemsPerPage,
    activeAntreanPage * itemsPerPage
  );

  const totalSelesaiPages = Math.ceil(filteredSelesaiList.length / itemsPerPage);
  const activeSelesaiPage = currentSelesaiPage > totalSelesaiPages ? 1 : currentSelesaiPage;
  const paginatedSelesai = filteredSelesaiList.slice(
    (activeSelesaiPage - 1) * itemsPerPage,
    activeSelesaiPage * itemsPerPage
  );

  // Early return: full skeleton while loading
  if (listLoading) return <PemantauSkeleton />;

  return (
    <div id="pemantau-board-root" className="w-full font-sans select-none flex flex-col gap-6 animate-fadeIn">
      {/* ── Card 1: Header card with gradient + tab switcher ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] p-5 rounded-2xl shadow-md transition-all duration-300">
        <div className="flex items-center gap-2.5 text-xs font-bold tracking-wider font-display select-none">
          <div className="flex items-center gap-1.5 text-[#2c333f]/80 hover:text-[#2c333f] transition-colors">
            <span>Tugas Saya</span>
          </div>
          <span className="text-[#2c333f]/50 font-medium select-none">&gt;</span>
          <div className="flex items-center gap-1.5 bg-white/40 border border-white/50 px-2.5 py-1 rounded-lg shadow-3xs animate-fadeIn">
            <span className="font-extrabold capitalize text-[#2c333f]">
              {workspaceTab === "antrean-pemantauan"
                ? "antrean pemantauan"
                : workspaceTab === "daftar-selesai"
                ? "daftar selesai"
                : "detail berkas"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <div className="bg-black/10 p-1 rounded-xl border border-black/5 flex items-center gap-1 shadow-3xs">
            <button
              onClick={() => setWorkspaceTab("antrean-pemantauan")}
              className={`px-3.5 py-1.5 rounded-lg text-[11px] font-extrabold transition-all duration-300 flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                workspaceTab === "antrean-pemantauan"
                  ? "bg-white text-[#2c333f] shadow-xs"
                  : "text-[#2c333f]/75 hover:text-[#2c333f] hover:bg-white/10"
              }`}
            >
              <Boxes className="w-3.5 h-3.5" />
              <span>Antrean Pemantauan ({filteredAntreanList.length})</span>
            </button>
            <button
              onClick={() => setWorkspaceTab("daftar-selesai")}
              className={`px-3.5 py-1.5 rounded-lg text-[11px] font-extrabold transition-all duration-300 flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                workspaceTab === "daftar-selesai"
                  ? "bg-white text-[#2c333f] shadow-xs"
                  : "text-[#2c333f]/75 hover:text-[#2c333f] hover:bg-white/10"
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Daftar Selesai ({filteredSelesaiList.length})</span>
            </button>
            <button
              onClick={() => setWorkspaceTab("detail-permohonan")}
              className={`px-3.5 py-1.5 rounded-lg text-[11px] font-extrabold transition-all duration-300 flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                workspaceTab === "detail-permohonan"
                  ? "bg-white text-[#2c333f] shadow-xs"
                  : "text-[#2c333f]/75 hover:text-[#2c333f] hover:bg-white/10"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Detail Berkas</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Card 2: Content card that adapts based on workspaceTab ── */}

      {/* ==================== TAB: ANTREAN PEMANTAUAN ==================== */}
      {workspaceTab === "antrean-pemantauan" && (
        <div className="bg-[#dde3ea] border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6 min-h-[300px]">
          {/* Header row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4 select-none">
            <div>
              <h2 className="font-extrabold text-[13px] capitalize tracking-wider text-slate-700 font-display">
                Antrean Berkas Pemantauan
              </h2>
              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                Daftar produk layanan PBB yang berkas fisiknya telah terarsip digital (ARCHIVED) dan siap diselesaikan.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
              {/* Search */}
              <div className={`relative w-full sm:w-56 p-[1.5px] rounded-lg transition-all duration-300 ${
                isSearchFocused
                  ? "bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] shadow-xs"
                  : "bg-slate-200/90"
              }`}>
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 z-10" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="w-full pl-7.5 pr-8 py-1 bg-white border-transparent rounded-[7px] text-[11px] font-semibold text-gray-755 placeholder-gray-400 focus:outline-none transition-all"
                  placeholder="Cari No. Pelayanan, NOP, Nama."
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-655 z-10 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              
              <button
                onClick={fetchData}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 transition-all cursor-pointer border border-slate-200/80 bg-white"
                title="Refresh"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* Grid of Applications */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {paginatedAntrean.length === 0 ? (
              <div className="col-span-full py-20 text-center text-xs text-gray-400 font-medium italic select-none">
                {searchQuery
                  ? "Tidak ada berkas yang sesuai dengan kriteria pencarian."
                  : "Tidak ada berkas di antrean pemantauan saat ini."}
              </div>
            ) : (
              paginatedAntrean.map((p) => {
                const isSelected = selectedPermohonan?.id === p.id;
                const manifestNo = p.bundle?.manifest?.nomorManifest || "—";
                const isFrozen = p.permintaanKoreksi && p.permintaanKoreksi.length > 0;

                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPermohonan(p)}
                    className={`p-4 rounded-2xl border flex flex-col justify-between gap-3.5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer bg-white relative overflow-hidden group min-h-[120px] ${
                      isSelected
                        ? "border-indigo-400 shadow-md ring-2 ring-indigo-500/10"
                        : isFrozen
                        ? "border-amber-200 bg-amber-50/20"
                        : "border-slate-200 hover:shadow-sm hover:border-slate-350"
                    }`}
                  >
                    {/* Ribbon status miring */}
                    <div className="absolute top-0 right-0 h-14 w-14 overflow-hidden select-none pointer-events-none z-10">
                      <div className={`absolute transform rotate-45 text-center text-[7px] font-extrabold uppercase py-0.5 w-20 -right-6 top-2 shadow-2xs ${
                        isFrozen ? "bg-amber-400 text-amber-900" : "bg-sky-400 text-sky-900"
                      }`}>
                        {isFrozen ? "frozen" : "terarsip"}
                      </div>
                    </div>

                    <div className="space-y-2 pr-6">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-gray-400 font-extrabold capitalize tracking-wider font-display">NOP</span>
                        <span className="text-xs font-black text-gray-800 font-mono tracking-tight">{formatNop(p.nop)}</span>
                      </div>
                      <div className="flex flex-col gap-1 text-[11px]">
                        <span className="font-extrabold text-slate-755 truncate block max-w-[170px]">{p.namaWajibPajak}</span>
                        <span className="text-[9px] text-indigo-650 font-bold select-none bg-indigo-50 px-2 py-0.5 rounded-lg w-fit border border-indigo-100/50 block truncate max-w-[170px]">
                          Manifest: {manifestNo}
                        </span>
                        <span className="text-[9px] text-slate-405 font-medium block">
                          Diupdate: {new Date(p.updatedAt).toLocaleDateString("id-ID", {
                            day: "2-digit", month: "short", year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-1 select-none animate-fadeIn">
                        <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Aktif</span>
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); setWorkspaceTab("detail-permohonan"); }}
                          className="text-[9px] text-indigo-600 font-extrabold hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>Tinjau Berkas</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {totalAntreanPages > 1 && (
            <div className="px-5 py-3 border-t border-slate-200/55 flex items-center justify-between mt-auto">
              <span className="text-[11px] font-semibold text-gray-400 select-none">
                Menampilkan {((activeAntreanPage - 1) * itemsPerPage) + 1}–{Math.min(activeAntreanPage * itemsPerPage, filteredAntreanList.length)} dari {filteredAntreanList.length} berkas
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentAntreanPage((prev) => Math.max(prev - 1, 1))}
                  disabled={activeAntreanPage === 1}
                  className="p-1.5 rounded-lg border-transparent bg-white text-gray-500 hover:bg-[#f1f5f9] disabled:opacity-40 transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                {Array.from({ length: totalAntreanPages }, (_, i) => i + 1).map((page) => (
                  <button
                    type="button"
                    key={page}
                    onClick={() => setCurrentAntreanPage(page)}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeAntreanPage === page
                        ? "bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] text-[#1e2022] font-extrabold shadow-sm scale-105 z-10"
                        : "border-transparent bg-white text-gray-500 hover:bg-[#f1f5f9]"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setCurrentAntreanPage((prev) => Math.min(prev + 1, totalAntreanPages))}
                  disabled={activeAntreanPage === totalAntreanPages}
                  className="p-1.5 rounded-lg border-transparent bg-white text-gray-500 hover:bg-[#f1f5f9] disabled:opacity-40 transition-all cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== TAB: DAFTAR SELESAI ==================== */}
      {workspaceTab === "daftar-selesai" && (
        <div className="bg-[#dde3ea] border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6 min-h-[300px]">
          {/* Header row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4 select-none">
            <div>
              <h2 className="font-extrabold text-[13px] capitalize tracking-wider text-slate-700 font-display">
                Daftar Berkas Selesai diproses
              </h2>
              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                Daftar berkas permohonan yang telah selesai (COMPLETED) diproses dan diserahterimakan kepada Wajib Pajak.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
              {/* Search */}
              <div className={`relative w-full sm:w-56 p-[1.5px] rounded-lg transition-all duration-300 ${
                isSearchFocused
                  ? "bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] shadow-xs"
                  : "bg-slate-200/90"
              }`}>
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 z-10" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="w-full pl-7.5 pr-8 py-1 bg-white border-transparent rounded-[7px] text-[11px] font-semibold text-gray-755 placeholder-gray-400 focus:outline-none transition-all"
                  placeholder="Cari No. Pelayanan, NOP, Nama."
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-655 z-10 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              
              <button
                onClick={fetchData}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 transition-all cursor-pointer border border-slate-200/80 bg-white"
                title="Refresh"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* Grid of Completed Applications */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {paginatedSelesai.length === 0 ? (
              <div className="col-span-full py-20 text-center text-xs text-gray-400 font-medium italic select-none">
                {searchQuery
                  ? "Tidak ada berkas selesai yang sesuai dengan kriteria pencarian."
                  : "Belum ada berkas selesai yang diarsipkan."}
              </div>
            ) : (
              paginatedSelesai.map((p) => {
                const isSelected = selectedPermohonan?.id === p.id;
                const manifestNo = p.bundle?.manifest?.nomorManifest || "—";
                const isFrozen = p.permintaanKoreksi && p.permintaanKoreksi.length > 0;

                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPermohonan(p)}
                    className={`p-4 rounded-2xl border flex flex-col justify-between gap-3.5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer bg-white relative overflow-hidden group min-h-[120px] ${
                      isSelected
                        ? "border-indigo-400 shadow-md ring-2 ring-indigo-500/10"
                        : isFrozen
                        ? "border-amber-200 bg-amber-50/20"
                        : "border-slate-200 hover:shadow-sm hover:border-slate-350"
                    }`}
                  >
                    {/* Ribbon status miring */}
                    <div className="absolute top-0 right-0 h-14 w-14 overflow-hidden select-none pointer-events-none z-10">
                      <div className={`absolute transform rotate-45 text-center text-[7px] font-extrabold uppercase py-0.5 w-20 -right-6 top-2 shadow-2xs ${
                        isFrozen ? "bg-amber-400 text-amber-900" : "bg-emerald-400 text-emerald-900"
                      }`}>
                        {isFrozen ? "frozen" : "selesai"}
                      </div>
                    </div>

                    <div className="space-y-2 pr-6">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-gray-400 font-extrabold capitalize tracking-wider font-display">NOP</span>
                        <span className="text-xs font-black text-gray-800 font-mono tracking-tight">{formatNop(p.nop)}</span>
                      </div>
                      <div className="flex flex-col gap-1 text-[11px]">
                        <span className="font-extrabold text-slate-755 truncate block max-w-[170px]">{p.namaWajibPajak}</span>
                        <span className="text-[9px] text-indigo-650 font-bold select-none bg-indigo-50 px-2 py-0.5 rounded-lg w-fit border border-indigo-100/50 block truncate max-w-[170px]">
                          Manifest: {manifestNo}
                        </span>
                        <span className="text-[9px] text-slate-405 font-medium block">
                          Selesai: {new Date(p.updatedAt).toLocaleDateString("id-ID", {
                            day: "2-digit", month: "short", year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-1 select-none animate-fadeIn">
                        <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Aktif</span>
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); setWorkspaceTab("detail-permohonan"); }}
                          className="text-[9px] text-indigo-650 font-extrabold hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>Tinjau Berkas</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination selesai */}
          {totalSelesaiPages > 1 && (
            <div className="px-5 py-3 border-t border-slate-200/55 flex items-center justify-between mt-auto">
              <span className="text-[11px] font-semibold text-gray-400 select-none">
                Menampilkan {((activeSelesaiPage - 1) * itemsPerPage) + 1}–{Math.min(activeSelesaiPage * itemsPerPage, filteredSelesaiList.length)} dari {filteredSelesaiList.length} berkas
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentSelesaiPage((prev) => Math.max(prev - 1, 1))}
                  disabled={activeSelesaiPage === 1}
                  className="p-1.5 rounded-lg border-transparent bg-white text-gray-500 hover:bg-[#f1f5f9] disabled:opacity-40 transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                {Array.from({ length: totalSelesaiPages }, (_, i) => i + 1).map((page) => (
                  <button
                    type="button"
                    key={page}
                    onClick={() => setCurrentSelesaiPage(page)}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeSelesaiPage === page
                        ? "bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] text-[#1e2022] font-extrabold shadow-sm scale-105 z-10"
                        : "border-transparent bg-white text-gray-500 hover:bg-[#f1f5f9]"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setCurrentSelesaiPage((prev) => Math.min(prev + 1, totalSelesaiPages))}
                  disabled={activeSelesaiPage === totalSelesaiPages}
                  className="p-1.5 rounded-lg border-transparent bg-white text-gray-500 hover:bg-[#f1f5f9] disabled:opacity-40 transition-all cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== TAB: DETAIL PERMOHONAN ==================== */}
      {workspaceTab === "detail-permohonan" && (
        <div className="bg-[#dde3ea] rounded-2xl shadow-sm flex flex-col overflow-hidden min-h-[300px]">
          {selectedPermohonan ? (
            <div className="flex-1 flex flex-col overflow-hidden animate-fadeIn">
              {/* Header Permohonan */}
              <div className="px-5 py-4 border-b border-gray-200/60 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => {
                      if (selectedPermohonan.status === "COMPLETED") {
                        setWorkspaceTab("daftar-selesai");
                      } else {
                        setWorkspaceTab("antrean-pemantauan");
                      }
                    }}
                    className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-gray-700 font-extrabold transition-colors cursor-pointer w-fit uppercase tracking-wider mb-1"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Kembali ke Daftar Berkas</span>
                  </button>
                  <h3 className="font-extrabold text-[13px] capitalize tracking-wider text-slate-700 font-display flex items-center gap-2">
                    Permohonan: <span className="font-mono font-black text-slate-900">{selectedPermohonan.nomorPermohonan}</span>
                  </h3>
                  <p className="text-[11px] text-gray-400 font-semibold mt-0.5">
                    Tipe: <span className="font-bold text-gray-700 capitalize">{selectedPermohonan.jenisPermohonan?.replace(/_/g, " ")}</span>
                  </p>
                </div>

                {/* Status Badge */}
                <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full capitalize shrink-0 select-none ${
                  selectedPermohonan.status === "COMPLETED"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-sky-100 text-sky-850"
                }`}>
                  {selectedPermohonan.status === "COMPLETED" ? "Layanan Selesai" : "Arsip Terverifikasi"}
                </span>
              </div>

              {/* Main detail page content wrapper */}
              <div className="p-6 flex flex-col gap-6 bg-[#dde3ea] flex-1">
                {/* Error & Success Banner (inner) */}
                {error && (
                  <div className="bg-red-55 border border-red-200/60 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2.5 text-xs font-semibold select-none animate-fadeIn shrink-0">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 animate-bounce" />
                    <p className="flex-1">{error}</p>
                    <button onClick={() => setError("")} className="text-red-500 hover:text-red-800 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                {success && (
                  <div className="bg-emerald-55 border border-emerald-250/60 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-2.5 text-xs font-semibold select-none animate-fadeIn shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <p className="flex-1">{success}</p>
                    <button onClick={() => setSuccess("")} className="text-emerald-500 hover:text-emerald-800 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Display Alert Banner if Frozen */}
                {selectedPermohonan.permintaanKoreksi && selectedPermohonan.permintaanKoreksi.length > 0 && (
                  <div className="bg-amber-50/70 border border-amber-200 text-amber-800 p-4 rounded-xl text-xs font-semibold select-none flex flex-col gap-1.5 animate-fadeIn shrink-0 shadow-3xs">
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
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col gap-3 shadow-sm">
                    <h5 className="font-extrabold text-slate-500 capitalize tracking-widest text-[9px] border-b border-slate-100 pb-1.5">
                      Informasi Wajib Pajak
                    </h5>
                    <div className="flex flex-col gap-2">
                      <p className="text-gray-400 font-semibold">NOP: <span className="text-gray-800 font-bold font-mono">{formatNop(selectedPermohonan.nop)}</span></p>
                      <p className="text-gray-400 font-semibold">Nama WP: <span className="text-gray-800 font-bold">{selectedPermohonan.namaWajibPajak}</span></p>
                      <p className="text-gray-400 font-semibold">Alamat: <span className="text-gray-800 font-bold">{selectedPermohonan.alamat}</span></p>
                      <p className="text-gray-400 font-semibold">No. WhatsApp: <span className="text-gray-800 font-bold">{selectedPermohonan.noWhatsapp}</span></p>
                    </div>
                  </div>

                  {/* Box 2: Logistics Info */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col gap-3 shadow-sm">
                    <h5 className="font-extrabold text-slate-500 capitalize tracking-widest text-[9px] border-b border-slate-100 pb-1.5">
                      Informasi Logistik Pengiriman
                    </h5>
                    <div className="flex flex-col gap-2">
                      <p className="text-gray-400 font-semibold">Nomor Map/Bundle: <span className="text-gray-800 font-bold">{selectedPermohonan.bundle?.nomorBundle || "-"}</span></p>
                      <p className="text-gray-400 font-semibold">Nomor Manifest: <span className="text-gray-800 font-bold">{selectedPermohonan.bundle?.manifest?.nomorManifest || "-"}</span></p>
                      <p className="text-gray-400 font-semibold">Petugas Pengirim: <span className="text-gray-800 font-bold">{selectedPermohonan.bundle?.manifest?.pengirim?.name || "-"}</span></p>
                      <p className="text-gray-400 font-semibold">Tanggal Kirim: <span className="text-gray-800 font-bold">{selectedPermohonan.bundle?.manifest?.updatedAt ? new Date(selectedPermohonan.bundle.manifest.updatedAt).toLocaleDateString("id-ID") : "-"}</span></p>
                    </div>
                  </div>
                </div>

                {/* Scanned Archive view */}
                {selectedPermohonan.arsipDigital && selectedPermohonan.arsipDigital.length > 0 && (
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between gap-4 text-xs select-none shadow-sm">
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
                      className="flex items-center gap-1.5 py-1.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-indigo-650 font-bold rounded-lg transition-all shrink-0 cursor-pointer shadow-3xs"
                      title="Lihat dokumen PDF asli di tab baru"
                    >
                      Lihat berkas <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    </a>
                  </div>
                )}

                {/* Active Actions Footer depending on status */}
                <div className="mt-auto border-t border-slate-200 pt-5 bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none shadow-sm">
                  
                  {/* Left guidance */}
                  <div className="text-[11px] text-slate-500 font-bold max-w-lg">
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
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-20 text-slate-400 select-none bg-white p-8">
              <Layers className="w-12 h-12 text-slate-350 mb-3 animate-pulse" />
              <h3 className="text-sm font-bold text-slate-700 mb-1">Pilih Permohonan</h3>
              <p className="text-xs text-gray-400 font-semibold max-w-sm">
                Silakan pilih salah satu permohonan aktif di tab <strong>Antrean Pemantauan</strong> atau <strong>Daftar Selesai</strong>, lalu klik tombol <strong>Tinjau Berkas</strong> untuk memproses penyelesaian layanan PBB.
              </p>
            </div>
          )}
        </div>
      )}

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
                className="text-gray-400 hover:text-gray-655 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
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
                  className="px-4 py-2 text-xs font-bold text-gray-655 hover:text-gray-850 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all cursor-pointer"
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
  );
}
