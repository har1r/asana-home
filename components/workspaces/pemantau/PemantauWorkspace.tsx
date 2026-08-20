"use client";

import React, { useState, useEffect, useRef } from "react";
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
  ChevronLeft,
  Slash,
  ListFilter,
  History,
  PlusCircle,
  Truck,
  ShieldCheck
} from "lucide-react";
import { useSession } from "next-auth/react";
import {
  getMonitoringPermohonan,
  completePermohonan,
  ajukanBatalSelesai
} from "@/app/actions/pemantau";
import { useDashboard } from "@/context/DashboardContext";
import { SkeletonBox, SkeletonText, SkeletonBadge } from "@/components/skeletons/SkeletonBase";

const getAbbreviatedJenis = (jenis: string) => {
  switch (jenis) {
    case 'OBJEK_PAJAK_BARU':
      return 'OPB';
    case 'MUTASI_SEBAGIAN':
      return 'MS';
    case 'MUTASI_HABIS_REGULER':
      return 'MHR';
    case 'MUTASI_HABIS_UPDATE':
      return 'MHU';
    case 'PEMBETULAN':
      return 'PBT';
    case 'PENGAKTIFAN':
      return 'AKT';
    default:
      return jenis?.replace(/_/g, " ") || 'Umum';
  }
};

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
  const { data: session } = useSession();
  const { showConfirm } = useDashboard();
  // Tabs: 'daftar-bundle' vs 'daftar-pantau'
  const [workspaceTab, setWorkspaceTab] = useState<"daftar-bundle" | "daftar-pantau">("daftar-bundle");

  // Lists and Selected States
  const [permohonanList, setPermohonanList] = useState<any[]>([]);
  const [selectedBundle, setSelectedBundle] = useState<any | null>(null);
  const [selectedPermohonan, setSelectedPermohonan] = useState<any | null>(null);
  const [isViewingDetail, setIsViewingDetail] = useState(false);

  // States for search and loaders
  const [searchQuery, setSearchQuery] = useState("");
  const [searchBundleQuery, setSearchBundleQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [filterJenisLayanan, setFilterJenisLayanan] = useState<string>("ALL");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Rollback Modal
  const [showRollbackModal, setShowRollbackModal] = useState(false);
  const [rollbackReason, setRollbackReason] = useState("");

  // Pecahan verification map for Mutasi Sebagian
  const [checkedPecahanMap, setCheckedPecahanMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!selectedPermohonan) {
      setCheckedPecahanMap({});
      return;
    }
    if (selectedPermohonan.status === "COMPLETED" && selectedPermohonan.dataBaru) {
      const initialMap: Record<string, boolean> = {};
      selectedPermohonan.dataBaru.forEach((db: any, idx: number) => {
        initialMap[db.id || `pecahan_${idx}`] = true;
      });
      setCheckedPecahanMap(initialMap);
    } else {
      setCheckedPecahanMap({});
    }
  }, [selectedPermohonan?.id, selectedPermohonan?.status]);

  // Pagination states
  const [currentBundlePage, setCurrentBundlePage] = useState(1);
  const [itemsPerBundlePage, setItemsPerBundlePage] = useState(8);
  const [currentPantauPage, setCurrentPantauPage] = useState(1);
  const itemsPerPage = 8;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const searchBundleInputRef = useRef<HTMLInputElement | null>(null);

  const fetchData = async (silent = false) => {
    if (!silent) setListLoading(true);
    else setIsRefreshing(true);
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

        // Re-sync selected bundle details if any
        if (selectedBundle) {
          const updatedBundlePermohonans = res.list?.filter((p: any) => p.bundleId === selectedBundle.id);
          if (updatedBundlePermohonans && updatedBundlePermohonans.length > 0) {
            setSelectedBundle((prev: any) => ({
              ...prev,
              permohonan: updatedBundlePermohonans
            }));
          } else {
            setSelectedBundle(null);
          }
        }
      } else {
        setError(res.error || "Gagal memuat antrean pemantauan.");
      }
    } catch (err) {
      setError("Kesalahan koneksi ke server.");
    } finally {
      if (!silent) setListLoading(false);
      else setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Ctrl+K keyboard shortcut for Search Bundle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchBundleInputRef.current?.focus();
        searchBundleInputRef.current?.select();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Reset pagination when search changes
  useEffect(() => {
    setCurrentBundlePage(1);
    setCurrentPantauPage(1);
  }, [searchQuery, searchBundleQuery, filterJenisLayanan, itemsPerBundlePage]);

  // Complete Permohonan
  const handleComplete = (id: string, nomorPermohonan: string) => {
    showConfirm({
      title: "Konfirmasi Penyelesaian",
      message: `Apakah Anda yakin ingin menandai permohonan ... (terpotong)`,
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

  // Unique Bundles list dynamically derived from permohonanList
  const uniqueBundlesList = React.useMemo(() => {
    const map = new Map();
    permohonanList.forEach((p) => {
      const b = p.bundle;
      if (b && !map.has(b.id)) {
        map.set(b.id, {
          ...b,
          permohonan: [p]
        });
      } else if (b) {
        map.get(b.id).permohonan.push(p);
      }
    });
    return Array.from(map.values());
  }, [permohonanList]);

  // Filters
  const filteredBundlesList = React.useMemo(() => {
    return uniqueBundlesList.filter((b) => {
      const matchesSearch = b.nomorBundle.toLowerCase().includes(searchBundleQuery.toLowerCase());
      const matchesJenis = filterJenisLayanan === "ALL" || b.jenisPermohonan === filterJenisLayanan;
      return matchesSearch && matchesJenis;
    });
  }, [uniqueBundlesList, searchBundleQuery, filterJenisLayanan]);

  const filteredPantauList = React.useMemo(() => {
    if (!selectedBundle) return [];
    return (selectedBundle.permohonan || []).filter((p) => {
      const matchesSearch =
        p.nop.includes(searchQuery) ||
        p.namaWajibPajak.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.nomorPelayanan && p.nomorPelayanan.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSearch;
    });
  }, [selectedBundle, searchQuery]);

  // Paginated lists
  const totalBundlePages = Math.ceil(filteredBundlesList.length / itemsPerBundlePage);
  const activeBundlePage = currentBundlePage > totalBundlePages ? 1 : currentBundlePage;
  const paginatedBundles = filteredBundlesList.slice(
    (activeBundlePage - 1) * itemsPerBundlePage,
    activeBundlePage * itemsPerBundlePage
  );

  const totalPantauPages = Math.ceil(filteredPantauList.length / 10);
  const activePantauPage = currentPantauPage > totalPantauPages ? 1 : currentPantauPage;
  const paginatedPantau = filteredPantauList.slice(
    (activePantauPage - 1) * 10,
    activePantauPage * 10
  );

  // Early return: full skeleton while loading
  if (listLoading) return <PemantauSkeleton />;

  return (
    <div id="pemantau-board-root" className="w-full font-sans select-none flex flex-col gap-6 animate-fadeIn">
      {/* ── Card 1: Header card with gradient + tab switcher ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] p-5 rounded-2xl shadow-md transition-all duration-300">
        <div className="flex items-center gap-2.5 text-xs font-bold tracking-wider font-display select-none">
          <div
            onClick={() => {
              setWorkspaceTab("daftar-bundle");
              setIsViewingDetail(false);
            }}
            className="flex items-center gap-1.5 text-[#2c333f]/80 hover:text-[#2c333f] transition-colors cursor-pointer"
          >
            <span>Tugas Saya</span>
          </div>
          <Slash className="w-3 h-3 text-[#2c333f]/30 -rotate-12 stroke-[2.5px]" />
          <div className="flex items-center gap-1.5 bg-white/70 border border-violet-500/30 px-2.5 py-1 rounded-lg shadow-3xs animate-fadeIn">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-600 shadow-[0_0_5px_#7c3aed] animate-pulse" />
            <span className="font-extrabold capitalize text-violet-950">
              {workspaceTab === "daftar-bundle" ? "daftar bundle" : "daftar pantau"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <div className="bg-black/10 p-1 rounded-xl border border-black/5 flex items-center gap-1 shadow-3xs">
            <button
              onClick={() => {
                setWorkspaceTab("daftar-bundle");
                setIsViewingDetail(false);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-[11px] font-extrabold transition-all duration-300 flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${workspaceTab === "daftar-bundle"
                ? "bg-white text-[#2c333f] shadow-xs"
                : "text-[#2c333f]/75 hover:text-[#2c333f] hover:bg-white/10"
                }`}
            >
              <span>Daftar Bundle</span>
            </button>
            <button
              onClick={() => {
                setWorkspaceTab("daftar-pantau");
              }}
              className={`px-3.5 py-1.5 rounded-lg text-[11px] font-extrabold transition-all duration-300 flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${workspaceTab === "daftar-pantau"
                ? "bg-white text-[#2c333f] shadow-xs"
                : "text-[#2c333f]/75 hover:text-[#2c333f] hover:bg-white/10"
                }`}
            >
              <span>Daftar Pantau</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Card 2: Content card that adapts based on workspaceTab ── */}

      {/* ==================== TAB: DAFTAR BUNDLE ==================== */}
      {workspaceTab === "daftar-bundle" && (
        <div className="bg-[#dde3ea] border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6 min-h-[300px]">
          {/* Header row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-300/90 pb-4 select-none">
            <div>
              <h2 className="font-extrabold text-[13px] capitalize tracking-wider text-slate-700 font-display">
                Antrean Bundle Pemantauan
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
              {/* Search */}
              <div className={`relative w-full sm:w-72 p-[1.5px] rounded-lg transition-all duration-300 ${isSearchFocused
                ? "bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] shadow-xs"
                : "bg-slate-200/90"
                }`}>
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
                <input
                  type="text"
                  ref={searchBundleInputRef}
                  value={searchBundleQuery}
                  onChange={(e) => setSearchBundleQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="w-full pl-8.5 pr-16 py-1.5 bg-white border-transparent rounded-[7px] text-xs font-semibold text-gray-755 placeholder-gray-400 focus:outline-none transition-all"
                  placeholder="Cari nomor bundle..."
                />
                {!isSearchFocused && !searchBundleQuery && (
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/80 select-none pointer-events-none">
                    Ctrl+K
                  </span>
                )}
                {searchBundleQuery && (
                  <button
                    onClick={() => setSearchBundleQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-655 z-10 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {/* Filter Jenis Layanan */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                    className={`relative p-2 rounded-xl border transition-all duration-200 flex items-center gap-1.5 cursor-pointer text-xs font-bold ${filterJenisLayanan !== 'ALL'
                      ? 'bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] text-[#2c333f] border-transparent shadow-sm scale-105'
                      : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 text-slate-500 shadow-3xs'
                      }`}
                    title="Filter Jenis Layanan"
                  >
                    <ListFilter className="w-4 h-4" />
                    {filterJenisLayanan !== 'ALL' && (
                      <span className="absolute -top-1.5 -right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
                    )}
                  </button>

                  {isFilterDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsFilterDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-100 rounded-xl shadow-lg py-2 z-50 animate-fadeIn text-xs text-slate-700 font-semibold flex flex-col gap-0.5">
                        <div className="px-3 py-1 text-[10px] font-extrabold text-slate-400 capitalize tracking-wider border-b border-slate-50 mb-1 select-none">
                          Pilih Jenis Layanan
                        </div>
                        {[
                          { val: 'ALL', label: 'Semua Layanan' },
                          { val: 'MUTASI_SEBAGIAN', label: 'Mutasi Sebagian' },
                          { val: 'MUTASI_HABIS_UPDATE', label: 'Mutasi Habis (Update)' },
                          { val: 'MUTASI_HABIS_REGULER', label: 'Mutasi Habis (Reguler)' },
                          { val: 'OBJEK_PAJAK_BARU', label: 'Objek Pajak Baru' },
                          { val: 'PEMBETULAN', label: 'Pembetulan' },
                          { val: 'PENGAKTIFAN', label: 'Pengaktifan' }
                        ].map((item) => {
                          const isSelected = filterJenisLayanan === item.val;
                          return (
                            <button
                              key={item.val}
                              type="button"
                              onClick={() => {
                                setFilterJenisLayanan(item.val);
                                setCurrentBundlePage(1);
                                setIsFilterDropdownOpen(false);
                              }}
                              className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${isSelected ? 'text-indigo-650 bg-indigo-50/30 font-bold' : ''}`}
                            >
                              <span>{item.label}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>

                {/* Refresh Button */}
                <button
                  onClick={() => fetchData(true)}
                  disabled={isRefreshing}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 transition-all cursor-pointer border border-slate-200/80 bg-white shadow-3xs disabled:opacity-50"
                  title="Refresh"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-indigo-600" : ""}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Grid of Bundles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {paginatedBundles.length === 0 ? (
              <div className="col-span-full py-20 text-center text-xs text-gray-400 font-medium italic select-none">
                {searchBundleQuery
                  ? "Tidak ada bundle yang sesuai dengan kriteria pencarian."
                  : "Tidak ada bundle aktif dalam antrean pemantauan."}
              </div>
            ) : (
              paginatedBundles.map((b) => {
                const isSelected = selectedBundle?.id === b.id;

                // Calculate file counts inside the bundle
                const totalPecahan = (b.permohonan || []).reduce((acc: number, p: any) => {
                  if (p.jenisPermohonan === "MUTASI_SEBAGIAN") {
                    return acc + (p.dataBaru?.length || 0);
                  }
                  return acc + 1;
                }, 0);

                // Progress: how many are COMPLETED
                const completedCount = (b.permohonan || []).filter((p: any) => p.status === "COMPLETED").length;
                const totalCount = (b.permohonan || []).length;
                const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

                // Pembuat (Peneliti) info & Tanggal Dibuat
                const pembuatName = b.peneliti?.name || "—";
                const pembuatInitials = pembuatName !== "—"
                  ? pembuatName.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)
                  : "?";
                const tanggalDibuat = b.createdAt
                  ? new Date(b.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                  : null;

                return (
                  <div
                    key={b.id}
                    onClick={() => {
                      setSelectedBundle(b);
                      setSelectedPermohonan(null);
                    }}
                    className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer relative overflow-hidden group min-h-[140px] bg-white ${isSelected
                      ? "border-indigo-400 shadow-md ring-2 ring-indigo-500/10"
                      : "border-slate-200 hover:shadow-sm hover:border-slate-350"
                      }`}
                  >
                    {/* Top Row: Number & Count Badge */}
                    <div className="flex items-center justify-between gap-3 w-full">
                      <span className="text-xs font-black text-gray-800 font-mono tracking-tight truncate block max-w-[170px]" title={b.nomorBundle}>
                        {b.nomorBundle}
                      </span>
                      <span className="flex items-center justify-center bg-[#f25c54] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md leading-none shrink-0" title={`${totalPecahan} Berkas`}>
                        {totalPecahan}
                      </span>
                    </div>

                    {/* Middle: Progress bar + badges */}
                    <div className="flex flex-col gap-2.5 pt-2.5 border-t border-slate-100/80">
                      {/* Mini Progress Bar */}
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between text-[9px] font-bold">
                          <span className="text-slate-400">Progres</span>
                          <span className={`${progressPct === 100 ? "text-emerald-600" : "text-slate-500"}`}>
                            {completedCount}/{totalCount} selesai
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${progressPct === 100
                              ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                              : progressPct > 0
                                ? "bg-gradient-to-r from-sky-400 to-indigo-500"
                                : "bg-slate-200"
                              }`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Service Type + Manifest badges */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold border leading-none bg-indigo-50 text-indigo-700 border-indigo-200 select-none uppercase tracking-wide">
                          {b.jenisPermohonan ? getAbbreviatedJenis(b.jenisPermohonan) : 'Umum'}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[8px] font-extrabold border bg-emerald-50 text-emerald-800 border-emerald-250 uppercase tracking-wider select-none shrink-0">
                          SENT
                        </span>
                      </div>
                    </div>

                    {/* Bottom: Pembuat (Peneliti) avatar + tanggal dibuat */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100/60">
                      <div className="flex items-center gap-2">
                        <div className="w-5.5 h-5.5 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-white text-[8px] font-black flex items-center justify-center shrink-0 shadow-sm" title={pembuatName}>
                          {pembuatInitials}
                        </div>
                        <span className="text-[9px] font-semibold text-slate-400 truncate max-w-[100px]" title={pembuatName}>
                          {pembuatName}
                        </span>
                      </div>
                      {tanggalDibuat && (
                        <span className="text-[9px] font-semibold text-slate-400 flex items-center gap-1 shrink-0">
                          <Calendar className="w-3 h-3" />
                          {tanggalDibuat}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Table Footer / Pagination for Bundles */}
          <div className="px-5 py-3.5 border border-slate-200/60 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto rounded-xl select-none shadow-3xs shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-semibold text-gray-500 font-sans">
                {filteredBundlesList.length > 0
                  ? `Menampilkan ${((activeBundlePage - 1) * itemsPerBundlePage) + 1}–${Math.min(activeBundlePage * itemsPerBundlePage, filteredBundlesList.length)} dari ${filteredBundlesList.length} bundle`
                  : 'Tidak ada data'}
              </span>
              {/* Items per page */}
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-1.5 py-0.5">
                {[8, 16, 32].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => {
                      setItemsPerBundlePage(n);
                      setCurrentBundlePage(1);
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${itemsPerBundlePage === n
                      ? 'bg-gradient-to-r from-[#7dd4fc] to-[#9cb4fe] text-[#1e2022] shadow-sm font-extrabold'
                      : 'text-slate-500 hover:text-slate-700'
                      }`}
                  >
                    {n}
                  </button>
                ))}
                <span className="text-[10px] text-slate-400 font-semibold pl-0.5">/hal</span>
              </div>
            </div>

            {totalBundlePages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentBundlePage(prev => Math.max(prev - 1, 1))}
                  disabled={activeBundlePage === 1}
                  className="p-1.5 rounded-lg border-transparent bg-white text-gray-500 hover:bg-[#f1f5f9] disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                {Array.from({ length: totalBundlePages }, (_, i) => i + 1)
                  .filter(page => page === 1 || page === totalBundlePages || Math.abs(page - activeBundlePage) <= 1)
                  .reduce((acc: (number | string)[], page, idx, arr) => {
                    if (idx > 0 && (page as number) - (arr[idx - 1] as number) > 1) acc.push('...');
                    acc.push(page);
                    return acc;
                  }, [])
                  .map((page, idx) =>
                    page === '...' ? (
                      <span key={`ellipsis-${idx}`} className="px-1 text-slate-400 text-xs">…</span>
                    ) : (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setCurrentBundlePage(page as number)}
                        className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${activeBundlePage === page
                          ? 'bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] text-[#1e2022] font-extrabold shadow-sm scale-105 z-10'
                          : 'border-transparent bg-[#ffffff] text-gray-500 hover:bg-[#f1f5f9]'
                          }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                <button
                  type="button"
                  onClick={() => setCurrentBundlePage(prev => Math.min(prev + 1, totalBundlePages))}
                  disabled={activeBundlePage === totalBundlePages}
                  className="p-1.5 rounded-lg border-transparent bg-white text-gray-500 hover:bg-[#f1f5f9] disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== TAB: DAFTAR PANTAU ==================== */}
      {workspaceTab === "daftar-pantau" && (
        <div className="w-full">
          {!selectedBundle ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-20 text-slate-400 select-none bg-white p-8 rounded-2xl border border-slate-200 shadow-3xs min-h-[300px]">
              <Layers className="w-12 h-12 text-slate-350 mb-3 animate-pulse" />
              <h3 className="text-sm font-bold text-slate-700 mb-1">Pilih Bundle Terlebih Dahulu</h3>
              <p className="text-xs text-gray-400 font-semibold max-w-sm">
                Silakan pilih salah satu bundle di tab <strong>Daftar Bundle</strong> terlebih dahulu untuk melihat daftar permohonan yang harus dipantau.
              </p>
            </div>
          ) : (
            /* Master-Detail Stacked Layout */
            <div className="bg-[#dde3ea] border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4 min-h-[500px]">
              {/* Header row */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-300/90 pb-3.5 select-none">
                <div>
                  <h2 className="font-extrabold text-[13px] capitalize tracking-wider text-slate-700 font-display flex items-center gap-1.5">
                    Daftar Permohonan: <span className="font-mono font-black text-slate-900">{selectedBundle.nomorBundle}</span>
                  </h2>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                    Pilih permohonan pada kisi di atas untuk meninjau detail dan status penyelesaian.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
                  {/* Search */}
                  <div className={`relative w-full sm:w-56 p-[1.5px] rounded-lg transition-all duration-300 ${isSearchFocused
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
                      placeholder="Cari NOP, Nama Pemohon..."
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
                    onClick={() => fetchData(true)}
                    disabled={isRefreshing}
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 transition-all cursor-pointer border border-slate-200/80 bg-white shadow-3xs disabled:opacity-50"
                    title="Refresh"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-indigo-600" : ""}`} />
                  </button>
                </div>
              </div>

              {/* ── 2-PANEL LAYOUT: PANEL KIRI (Daftar 1 Kolom) & PANEL KANAN (Detail Permohonan) ── */}
              <div className="flex flex-col lg:flex-row items-stretch gap-4 w-full min-h-[900px]">

                {/* PANEL KIRI: 1-Column List of Permohonan (Menampung 10 permohonan @ 76px, Min Height 900px) */}
                <div className="w-full lg:w-96 shrink-0 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col gap-3 min-h-[900px] max-h-[calc(100vh-220px)] overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <h4 className="text-xs font-black text-slate-700 capitalize tracking-wider select-none flex items-center gap-2">
                      <span>📋 Daftar Permohonan</span>
                      <span className="bg-indigo-50 text-indigo-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-indigo-200">
                        {filteredPantauList.length}
                      </span>
                    </h4>

                    {/* Left Panel Pagination Controls */}
                    {totalPantauPages > 1 && (
                      <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-500 select-none">
                        <span>Hal {activePantauPage}/{totalPantauPages}</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setCurrentPantauPage((prev) => Math.max(prev - 1, 1))}
                            disabled={activePantauPage === 1}
                            className="p-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setCurrentPantauPage((prev) => Math.min(prev + 1, totalPantauPages))}
                            disabled={activePantauPage === totalPantauPages}
                            className="p-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 1-Column List Container */}
                  <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-1.5 scrollbar-thin">
                    {paginatedPantau.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-400 font-medium italic select-none bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        Tidak ada berkas permohonan yang sesuai kriteria.
                      </div>
                    ) : (
                      paginatedPantau.map((p) => {
                        const isSelected = selectedPermohonan?.id === p.id;
                        const nopolDate = p.tanggalNoPelayanan
                          ? new Date(p.tanggalNoPelayanan).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                          : '—';
                        const isFrozen = p.permintaanKoreksi && p.permintaanKoreksi.length > 0;

                        const sc = isFrozen
                          ? { label: 'Frozen', bg: 'bg-amber-500', badgeBg: 'bg-amber-100', badgeText: 'text-amber-800', badgeBorder: 'border-amber-200', pulse: true }
                          : p.status === 'COMPLETED'
                            ? { label: 'Selesai', bg: 'bg-emerald-500', badgeBg: 'bg-emerald-100', badgeText: 'text-emerald-800', badgeBorder: 'border-emerald-200', pulse: false }
                            : { label: 'Terarsip', bg: 'bg-indigo-500', badgeBg: 'bg-indigo-100', badgeText: 'text-indigo-800', badgeBorder: 'border-indigo-200', pulse: false };

                        return (
                          <div
                            key={p.id}
                            onClick={() => setSelectedPermohonan(p)}
                            className={`p-3.5 sm:p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 relative overflow-hidden select-none shrink-0 min-h-[76px] ${isSelected
                              ? "bg-white border-indigo-500 shadow-md ring-2 ring-indigo-500/20 translate-x-0.5"
                              : "bg-slate-50/70 border-slate-200/80 hover:border-slate-300 hover:bg-white"
                              }`}
                          >
                            {isSelected && (
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600" />
                            )}

                            {/* Top row: NOP & Status */}
                            <div className="flex items-center justify-between gap-2 pl-1">
                              <span className="text-xs font-bold text-slate-800 font-mono truncate">
                                {formatNop(p.nop)}
                              </span>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[8px] font-extrabold border leading-none shrink-0 ${sc.badgeBg} ${sc.badgeText} ${sc.badgeBorder}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${sc.bg} ${sc.pulse ? 'animate-pulse' : ''}`} />
                                {sc.label}
                              </span>
                            </div>

                            {/* Bottom row: Nama WP & Jenis Layanan Badge & Date */}
                            <div className="flex items-center justify-between gap-2 pl-1 text-[10px]">
                              <span className="font-semibold text-slate-600 capitalize truncate max-w-[140px]" title={p.namaWajibPajak}>
                                {p.namaWajibPajak?.toLowerCase()}
                              </span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="inline-flex px-1.5 py-0.2 rounded text-[8px] font-extrabold border leading-none bg-indigo-50 text-indigo-700 border-indigo-200 uppercase">
                                  {getAbbreviatedJenis(p.jenisPermohonan || selectedBundle.jenisPermohonan)}
                                </span>
                                <span className="text-slate-400 font-medium text-[9px]">{nopolDate}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* PANEL KANAN: Detail Permohonan (Identik dengan Panel Kiri - Equal Min Height 900px) */}
                <div className="flex-1 min-w-0 w-full bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-5 min-h-[900px] max-h-[calc(100vh-220px)] overflow-y-auto scrollbar-thin">
                {selectedPermohonan ? (
                  <div className="flex flex-col gap-5 animate-fadeIn">

                    {/* Detail Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 select-none">
                      {/* Nomor Pelayanan */}
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="font-mono font-bold text-sm text-slate-800">
                          {selectedPermohonan.nomorPelayanan || selectedPermohonan.nomorPermohonan}
                        </h3>
                      </div>

                      {/* Status Badge */}
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold capitalize shrink-0 select-none ${selectedPermohonan.status === "COMPLETED"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-250"
                        : "bg-sky-100 text-sky-850 border border-sky-250"
                        }`}>
                        <span className={`w-2 h-2 rounded-full ${selectedPermohonan.status === "COMPLETED" ? "bg-emerald-500" : "bg-sky-500"}`} />
                        {selectedPermohonan.status === "COMPLETED" ? "Layanan Selesai" : "Arsip Terverifikasi"}
                      </span>
                    </div>

                    {/* Banners */}
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

                    {/* ── Timeline Stepper & Detail Riwayat Penanggung Jawab ── */}
                    {(() => {
                      const stepsData = [
                        {
                          label: "Diinput",
                          key: "INPUTTED",
                          roleLabel: "Penginput",
                          actorName: selectedPermohonan.penginput?.name || "Petugas Penginput",
                          dateStr: selectedPermohonan.createdAt
                            ? new Date(selectedPermohonan.createdAt).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                            : "—",
                          icon: PlusCircle
                        },
                        {
                          label: "Diteliti",
                          key: "RESEARCHED",
                          roleLabel: "Peneliti",
                          actorName: selectedPermohonan.bundle?.peneliti?.name || "Petugas Peneliti",
                          dateStr: selectedPermohonan.bundle?.createdAt
                            ? new Date(selectedPermohonan.bundle.createdAt).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                            : "—",
                          icon: Search
                        },
                        {
                          label: "Diarsip",
                          key: "ARCHIVED",
                          roleLabel: "Pengarsip",
                          actorName: selectedPermohonan.arsipDigital?.[0]?.pengarsip?.name || "Petugas Pengarsip",
                          dateStr: selectedPermohonan.arsipDigital?.[0]?.createdAt
                            ? new Date(selectedPermohonan.arsipDigital[0].createdAt).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                            : "—",
                          icon: FolderOpen
                        },
                        {
                          label: "Dikirim",
                          key: "SENT",
                          roleLabel: "Pengirim",
                          actorName: selectedPermohonan.bundle?.manifest?.pengirim?.name || "Petugas Pengirim",
                          dateStr: selectedPermohonan.bundle?.manifest?.updatedAt
                            ? new Date(selectedPermohonan.bundle.manifest.updatedAt).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                            : "—",
                          icon: Truck
                        },
                        {
                          label: "Dipantau",
                          key: "MONITORING",
                          roleLabel: "Pemantau",
                          actorName: session?.user?.name ? `${session.user.name}` : "Petugas Pemantau",
                          dateStr: selectedPermohonan.bundle?.manifest?.updatedAt
                            ? new Date(selectedPermohonan.bundle.manifest.updatedAt).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                            : "—",
                          icon: ShieldCheck
                        },
                        {
                          label: "Selesai",
                          key: "COMPLETED",
                          roleLabel: "Penyelesaian",
                          actorName: selectedPermohonan.status === "COMPLETED" ? (session?.user?.name || selectedPermohonan.penginput?.name || "Petugas Pemantau") : "Menunggu Selesai",
                          dateStr: selectedPermohonan.tanggalPenyelesaian
                            ? new Date(selectedPermohonan.tanggalPenyelesaian).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                            : selectedPermohonan.status === "COMPLETED"
                              ? new Date(selectedPermohonan.updatedAt).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                              : "—",
                          icon: CheckCircle2
                        }
                      ];

                      const isAllCompleted = selectedPermohonan.status === "COMPLETED";
                      const activeIndex = isAllCompleted ? 5 : 4;

                      return (
                        <div className="bg-slate-50/90 p-4 rounded-xl border border-slate-200/80 select-none flex flex-col gap-4 shadow-3xs">
                          <div className="flex items-center justify-between border-b border-slate-200/70 pb-2">
                            <h5 className="font-extrabold text-slate-700 capitalize tracking-wider text-[10px] flex items-center gap-1.5">
                              <History className="w-3.5 h-3.5 text-indigo-600" />
                              Detail Penanggung Jawab & Riwayat Alur Berkas
                            </h5>
                            <span className="text-[9px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                              6 Tahapan Siklus
                            </span>
                          </div>

                          {/* Horizontal Stepper */}
                          <div className="flex items-start justify-between w-full overflow-x-auto pt-1 pb-2">
                            {stepsData.map((step, i) => {
                              const isDone = isAllCompleted || i < activeIndex;
                              const isCurrent = !isAllCompleted && i === activeIndex;

                              return (
                                <React.Fragment key={step.key}>
                                  {/* Step Circle + Label */}
                                  <div className="flex flex-col items-center gap-1 shrink-0 z-10 min-w-[60px] text-center">
                                    <div
                                      className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-300 ${isDone
                                        ? "bg-emerald-500 text-white shadow-sm ring-2 ring-emerald-500/20"
                                        : isCurrent
                                          ? "bg-indigo-600 text-white shadow-md ring-4 ring-indigo-500/20 scale-105"
                                          : "bg-slate-200 text-slate-400 border border-slate-300/60"
                                        }`}
                                    >
                                      {isDone ? (
                                        <Check className="w-3.5 h-3.5 stroke-[3px]" />
                                      ) : isCurrent ? (
                                        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                      ) : (
                                        <span>{i + 1}</span>
                                      )}
                                    </div>
                                    <span
                                      className={`text-[9px] font-bold whitespace-nowrap ${isDone
                                        ? "text-emerald-700"
                                        : isCurrent
                                          ? "text-indigo-700 font-extrabold"
                                          : "text-slate-400"
                                        }`}
                                    >
                                      {step.label}
                                    </span>
                                    <span className="text-[8px] font-semibold text-slate-500 truncate max-w-[70px]" title={step.actorName}>
                                      {step.actorName.split(" ")[0]}
                                    </span>
                                  </div>

                                  {/* Connector Line */}
                                  {i < stepsData.length - 1 && (
                                    <div className="flex-1 mx-1 mt-3.5 min-w-[12px]">
                                      <div
                                        className={`h-0.5 w-full rounded-full transition-all duration-300 ${i < activeIndex || isAllCompleted
                                          ? "bg-emerald-500"
                                          : "bg-slate-200"
                                          }`}
                                      />
                                    </div>
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </div>

                          {/* Grid Detail Penanggung Jawab & Waktu */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-2.5 border-t border-slate-200/70">
                            {stepsData.map((step, i) => {
                              const isDone = isAllCompleted || i <= activeIndex;
                              const StepIcon = step.icon;

                              return (
                                <div
                                  key={`detail-${step.key}`}
                                  className={`p-2.5 rounded-xl border flex flex-col gap-1 transition-all ${isDone
                                    ? "bg-white border-slate-200/90 shadow-3xs"
                                    : "bg-slate-100/50 border-slate-200/40 opacity-60"
                                    }`}
                                >
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="text-[10px] font-extrabold text-slate-700 flex items-center gap-1 truncate">
                                      <StepIcon className={`w-3 h-3 ${isDone ? "text-indigo-600" : "text-slate-400"}`} />
                                      {step.label}
                                    </span>
                                    <span className="text-[8px] font-extrabold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 uppercase border border-slate-200/80">
                                      {step.roleLabel}
                                    </span>
                                  </div>

                                  <div className="flex flex-col text-[10px] mt-0.5">
                                    <span className="font-bold text-slate-800 truncate" title={step.actorName}>
                                      👤 {step.actorName}
                                    </span>
                                    <span className="text-[9px] font-semibold text-slate-400 flex items-center gap-1 mt-0.5">
                                      <Calendar className="w-2.5 h-2.5 shrink-0 text-slate-400" />
                                      {step.dateStr}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}

                    {/* ── Ringkasan Data Utama & Logistik Pengiriman ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs select-none">

                      {/* Card 1: Data Utama Wajib Pajak */}
                      <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/70 flex flex-col gap-2.5">
                        <h5 className="font-extrabold text-slate-700 capitalize tracking-wider text-[10px] border-b border-slate-200/60 pb-1.5 flex items-center justify-between">
                          <span>📄 Data Utama Permohonan</span>
                          <span className="text-[8px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-1.5 py-0.2 rounded uppercase">
                            {getAbbreviatedJenis(selectedPermohonan.jenisPermohonan || selectedBundle.jenisPermohonan)}
                          </span>
                        </h5>
                        <div className="grid grid-cols-[100px_8px_1fr] gap-y-1.5 text-[11px] items-baseline bg-white p-3 rounded-lg border border-slate-200/60 shadow-3xs">
                          <span className="text-slate-400 font-medium">NOP</span>
                          <span className="text-slate-400 font-medium">:</span>
                          <span className="text-slate-800 font-bold font-mono">{formatNop(selectedPermohonan.nop)}</span>

                          <span className="text-slate-400 font-medium">Nama WP</span>
                          <span className="text-slate-400 font-medium">:</span>
                          <span className="text-slate-800 font-semibold uppercase">{selectedPermohonan.namaWajibPajak}</span>

                          <span className="text-slate-400 font-medium">Alamat WP</span>
                          <span className="text-slate-400 font-medium">:</span>
                          <span className="text-slate-700 font-semibold">{selectedPermohonan.alamat}</span>

                          <span className="text-slate-400 font-medium">No. WhatsApp</span>
                          <span className="text-slate-400 font-medium">:</span>
                          <span className="text-slate-700 font-semibold">{selectedPermohonan.noWhatsapp}</span>
                        </div>
                      </div>

                      {/* Card 2: Informasi Logistik Pengiriman */}
                      <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/70 flex flex-col gap-2.5">
                        <h5 className="font-extrabold text-slate-700 capitalize tracking-wider text-[10px] border-b border-slate-200/60 pb-1.5 flex items-center justify-between">
                          <span>🚚 Informasi Logistik Pengiriman</span>
                          <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded uppercase">
                            TERKIRIM
                          </span>
                        </h5>
                        <div className="grid grid-cols-[100px_8px_1fr] gap-y-1.5 text-[11px] items-baseline bg-white p-3 rounded-lg border border-slate-200/60 shadow-3xs">
                          <span className="text-slate-400 font-medium">Nomor Bundle</span>
                          <span className="text-slate-400 font-medium">:</span>
                          <span className="text-slate-800 font-bold font-mono">{selectedPermohonan.bundle?.nomorBundle || "-"}</span>

                          <span className="text-slate-400 font-medium">Nomor Manifest</span>
                          <span className="text-slate-400 font-medium">:</span>
                          <span className="text-slate-800 font-bold font-mono">{selectedPermohonan.bundle?.manifest?.nomorManifest || "-"}</span>

                          <span className="text-slate-400 font-medium">Pengirim</span>
                          <span className="text-slate-400 font-medium">:</span>
                          <span className="text-slate-700 font-semibold uppercase">{selectedPermohonan.bundle?.manifest?.pengirim?.name || "-"}</span>

                          <span className="text-slate-400 font-medium">Tanggal Kirim</span>
                          <span className="text-slate-400 font-medium">:</span>
                          <span className="text-slate-700 font-semibold">{selectedPermohonan.bundle?.manifest?.updatedAt ? new Date(selectedPermohonan.bundle.manifest.updatedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-"}</span>
                        </div>
                      </div>

                    </div>

                    {/* ── Section Khusus Rincian Data Objek Pajak (Data Lama & Data Baru / Pecahan) ── */}
                    <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/70 select-none flex flex-col gap-3">
                      <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                        <h5 className="font-extrabold text-slate-700 capitalize tracking-wider text-[10px] flex items-center gap-1.5">
                          <Boxes className="w-3.5 h-3.5 text-indigo-600" />
                          Rincian Objek Pajak (Data Lama & Data Baru / Pecahan)
                        </h5>

                        {/* Batch verify shortcut if multiple pecahan */}
                        {selectedPermohonan.dataBaru && selectedPermohonan.dataBaru.length > 1 && selectedPermohonan.status !== "COMPLETED" && (
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                              {Object.values(checkedPecahanMap).filter(Boolean).length}/{selectedPermohonan.dataBaru.length} Terverifikasi
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const allMap: Record<string, boolean> = {};
                                selectedPermohonan.dataBaru.forEach((db: any, idx: number) => {
                                  allMap[db.id || `pecahan_${idx}`] = true;
                                });
                                setCheckedPecahanMap(allMap);
                              }}
                              className="text-[9px] font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 px-2 py-0.5 rounded-lg transition-all active:scale-95 cursor-pointer shadow-3xs"
                            >
                              ✓ Verifikasi Semua
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
                        {/* Sub-Card 1: Data Objek Lama */}
                        {selectedPermohonan.namaPemilikLama && (
                          <div className="flex flex-col gap-1.5">
                            <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                              <span>🏛️ Data Objek Lama</span>
                            </span>
                            <div className="grid grid-cols-[100px_8px_1fr] gap-y-1.5 text-[11px] items-baseline bg-white p-3 rounded-lg border border-slate-200/70 shadow-3xs">
                              <span className="text-slate-400 font-medium">Pemilik Lama</span>
                              <span className="text-slate-400 font-medium">:</span>
                              <span className="text-slate-700 font-semibold uppercase">{selectedPermohonan.namaPemilikLama}</span>

                              {selectedPermohonan.luasTanahLama !== undefined && selectedPermohonan.luasTanahLama !== null && (
                                <>
                                  <span className="text-slate-400 font-medium">Luas Tanah</span>
                                  <span className="text-slate-400 font-medium">:</span>
                                  <span className="text-slate-700 font-semibold">{selectedPermohonan.luasTanahLama} m²</span>
                                </>
                              )}

                              {selectedPermohonan.luasBangunanLama !== undefined && selectedPermohonan.luasBangunanLama !== null && (
                                <>
                                  <span className="text-slate-400 font-medium">Luas Bangunan</span>
                                  <span className="text-slate-400 font-medium">:</span>
                                  <span className="text-slate-700 font-semibold">{selectedPermohonan.luasBangunanLama} m²</span>
                                </>
                              )}

                              {selectedPermohonan.sertifikatLama && (
                                <>
                                  <span className="text-slate-400 font-medium">Sertifikat</span>
                                  <span className="text-slate-400 font-medium">:</span>
                                  <span className="text-slate-700 font-semibold uppercase">{selectedPermohonan.sertifikatLama}</span>
                                </>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Sub-Card 2: Data Objek Baru / Pecahan (Scrollable Container jika > 2 Pecahan) */}
                        {selectedPermohonan.dataBaru && selectedPermohonan.dataBaru.length > 0 && (
                          <div className={`flex flex-col gap-1.5 ${!selectedPermohonan.namaPemilikLama ? 'col-span-full' : ''}`}>
                            <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                              <span>✨ Data Objek Baru {selectedPermohonan.dataBaru.length > 1 ? `(${selectedPermohonan.dataBaru.length} Pecahan)` : ''}</span>
                            </span>

                            {/* Scrollable Container with Max Height for Multiple Pecahan */}
                            <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                              {selectedPermohonan.dataBaru.map((db: any, idx: number) => {
                                const itemKey = db.id || `pecahan_${idx}`;
                                const isChecked = selectedPermohonan.status === "COMPLETED" || !!checkedPecahanMap[itemKey];

                                return (
                                  <div
                                    key={itemKey}
                                    className={`grid grid-cols-[100px_8px_1fr] gap-y-1.5 text-[11px] items-baseline p-3 rounded-lg border transition-all shadow-3xs ${isChecked
                                      ? "bg-emerald-50/40 border-emerald-200/90 ring-1 ring-emerald-500/10"
                                      : "bg-white border-slate-200/80 hover:border-slate-300"
                                      }`}
                                  >
                                    <div className="col-span-3 flex items-center justify-between border-b border-slate-100 pb-1.5 mb-1 select-none">
                                      <span className="text-[9.5px] font-black text-slate-800 flex items-center gap-1.5">
                                        <span className="w-4 h-4 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[8px] flex items-center justify-center font-black shrink-0">
                                          {idx + 1}
                                        </span>
                                        Pecahan Objek #{idx + 1}
                                      </span>

                                      {selectedPermohonan.status !== "COMPLETED" ? (
                                        <label className="inline-flex items-center gap-1.5 cursor-pointer select-none bg-white px-2 py-0.5 rounded border border-slate-200 shadow-3xs hover:bg-slate-50">
                                          <input
                                            type="checkbox"
                                            checked={!!checkedPecahanMap[itemKey]}
                                            onChange={(e) => {
                                              setCheckedPecahanMap((prev) => ({
                                                ...prev,
                                                [itemKey]: e.target.checked,
                                              }));
                                            }}
                                            className="w-3.5 h-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                          />
                                          <span className={`text-[9px] font-extrabold ${checkedPecahanMap[itemKey] ? "text-emerald-700" : "text-slate-500"}`}>
                                            {checkedPecahanMap[itemKey] ? "✓ Verified" : "Verifikasi"}
                                          </span>
                                        </label>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 text-[8.5px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 border border-emerald-200">
                                          ✓ Selesai
                                        </span>
                                      )}
                                    </div>

                                    <span className="text-slate-400 font-medium">Pemilik Baru</span>
                                    <span className="text-slate-400 font-medium">:</span>
                                    <span className="text-slate-800 font-semibold uppercase">{db.namaPemilikBaru}</span>

                                    {db.alamatPemilikBaru && (
                                      <>
                                        <span className="text-slate-400 font-medium">Alamat</span>
                                        <span className="text-slate-400 font-medium">:</span>
                                        <span className="text-slate-700 font-medium">{db.alamatPemilikBaru}</span>
                                      </>
                                    )}

                                    {db.luasTanahBaru !== undefined && db.luasTanahBaru !== null && (
                                      <>
                                        <span className="text-slate-400 font-medium">Luas Tanah</span>
                                        <span className="text-slate-400 font-medium">:</span>
                                        <span className="text-slate-700 font-semibold">{db.luasTanahBaru} m²</span>
                                      </>
                                    )}

                                    {db.luasBangunanBaru !== undefined && db.luasBangunanBaru !== null && (
                                      <>
                                        <span className="text-slate-400 font-medium">Luas Bangunan</span>
                                        <span className="text-slate-400 font-medium">:</span>
                                        <span className="text-slate-700 font-semibold">{db.luasBangunanBaru} m²</span>
                                      </>
                                    )}

                                    {db.sertifikatBaru && (
                                      <>
                                        <span className="text-slate-400 font-medium">Sertifikat</span>
                                        <span className="text-slate-400 font-medium">:</span>
                                        <span className="text-slate-700 font-semibold uppercase">{db.sertifikatBaru}</span>
                                      </>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Scanned Archive view */}
                    {selectedPermohonan.arsipDigital && selectedPermohonan.arsipDigital.length > 0 && (
                      <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 flex items-center justify-between gap-4 text-xs select-none">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-emerald-500/10 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                            <FileCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-gray-800 block text-[11px]">
                              Dokumen Arsip Digital (PDF v{selectedPermohonan.arsipDigital[0].versi})
                            </span>
                            <span className="text-[9px] text-gray-400 font-semibold block">
                              Diunggah: {new Date(selectedPermohonan.arsipDigital[0].createdAt).toLocaleString("id-ID")}
                            </span>
                          </div>
                        </div>

                        <a
                          href={selectedPermohonan.arsipDigital[0].urlBlob}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 py-1 px-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-indigo-650 font-bold text-[10px] rounded-lg transition-all shrink-0 cursor-pointer shadow-3xs"
                          title="Lihat dokumen PDF asli di tab baru"
                        >
                          Lihat berkas <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </div>
                    )}

                    {/* Active Actions Footer */}
                    {(() => {
                      const totalPecahanCount = selectedPermohonan.dataBaru?.length || 0;
                      const verifiedCount = Object.values(checkedPecahanMap).filter(Boolean).length;
                      const isAllPecahanVerified = totalPecahanCount <= 1 || verifiedCount >= totalPecahanCount;

                      return (
                        <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none">
                          <div className="text-[10px] text-slate-400 font-semibold">
                            {selectedPermohonan.status === "ARCHIVED" && (
                              <span>
                                {!isAllPecahanVerified
                                  ? `* Verifikasi seluruh pecahan (${verifiedCount}/${totalPecahanCount}) untuk mengaktifkan tombol penyelesaian.`
                                  : "* Klik tombol untuk menandai bahwa layanan PBB telah selesai."}
                              </span>
                            )}
                            {selectedPermohonan.status === "COMPLETED" && (
                              <span>* Klik tombol jika perlu membatal-selesaikan berkas.</span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 justify-end shrink-0">
                            {selectedPermohonan.status === "ARCHIVED" && (
                              <button
                                onClick={() => handleComplete(selectedPermohonan.id, selectedPermohonan.nomorPermohonan)}
                                disabled={loading || selectedPermohonan.permintaanKoreksi?.length > 0 || !isAllPecahanVerified}
                                className="flex items-center gap-1.5 py-2 px-4 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                title={!isAllPecahanVerified ? `Harap verifikasi seluruh (${totalPecahanCount}) pecahan objek di Data Baru terlebih dahulu` : ""}
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                Tandai Selesai {!isAllPecahanVerified && `(${verifiedCount}/${totalPecahanCount})`}
                              </button>
                            )}

                            {selectedPermohonan.status === "COMPLETED" && (
                              <button
                                onClick={() => setShowRollbackModal(true)}
                                disabled={loading || selectedPermohonan.permintaanKoreksi?.length > 0}
                                className="flex items-center gap-1.5 py-2.5 px-4.5 text-xs font-black text-white bg-red-600 hover:bg-red-700 active:scale-95 rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <RotateCcw className="w-4 h-4" />
                                Batal Selesai
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 p-12 my-auto">
                    <Layers className="w-10 h-10 text-slate-300 mb-2 animate-pulse" />
                    <h4 className="text-xs font-bold text-slate-700">Pilih Permohonan</h4>
                    <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                      Klik salah satu berkas permohonan di panel kiri untuk menampilkan detail dan tombol aksi.
                    </p>
                  </div>
                )}
              </div>
            </div>
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