"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ShieldCheck,
  Search,
  RefreshCw,
  Clock,
  User,
  FileText,
  Boxes,
  FileSpreadsheet,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Activity,
  CheckCircle2,
  AlertCircle,
  Lock,
  Send,
  RotateCcw,
  Upload,
  Info,
  ExternalLink,
  X,
  Loader2
} from "lucide-react";
import { getGlobalAuditLogs, getEntityDetailsForAudit } from "@/app/actions/audit";
import { useDashboard } from "@/context/DashboardContext";
import { SkeletonText, SkeletonCircle } from "@/components/skeletons/SkeletonBase";

// -------------------- HELPER BADGES & STYLING --------------------

const getActionConfig = (action: string) => {
  switch (action) {
    case "CREATE":
    case "SUBMIT_DATA":
      return {
        label: "Pendaftaran / Input Berkas",
        bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
        nodeBg: "bg-emerald-500 shadow-emerald-200",
        icon: FileText,
      };
    case "UPDATE_STATUS":
      return {
        label: "Update Status Berkas",
        bg: "bg-sky-50 text-sky-700 border-sky-200",
        nodeBg: "bg-sky-500 shadow-sky-200",
        icon: Activity,
      };
    case "ADD_TO_BUNDLE":
      return {
        label: "Tambah Permohonan ke Bundle",
        bg: "bg-blue-50 text-blue-700 border-blue-200",
        nodeBg: "bg-blue-500 shadow-blue-200",
        icon: Boxes,
      };
    case "REMOVE_FROM_BUNDLE":
      return {
        label: "Lepas Permohonan dari Bundle",
        bg: "bg-amber-50 text-amber-700 border-amber-200",
        nodeBg: "bg-amber-500 shadow-amber-200",
        icon: Boxes,
      };
    case "LOCK_BUNDLE":
    case "LOCK_MANIFEST":
      return {
        label: "Penguncian (Lock Status)",
        bg: "bg-indigo-50 text-indigo-700 border-indigo-200",
        nodeBg: "bg-indigo-600 shadow-indigo-200",
        icon: Lock,
      };
    case "UNLOCK_BUNDLE":
      return {
        label: "Buka Kunci (Unlock Status)",
        bg: "bg-purple-50 text-purple-700 border-purple-200",
        nodeBg: "bg-purple-500 shadow-purple-200",
        icon: Lock,
      };
    case "ADD_TO_MANIFEST":
      return {
        label: "Tambah Bundle ke Manifest",
        bg: "bg-cyan-50 text-cyan-700 border-cyan-200",
        nodeBg: "bg-cyan-500 shadow-cyan-200",
        icon: FileSpreadsheet,
      };
    case "REMOVE_FROM_MANIFEST":
      return {
        label: "Keluarkkan Bundle dari Manifest",
        bg: "bg-orange-50 text-orange-700 border-orange-200",
        nodeBg: "bg-orange-500 shadow-orange-200",
        icon: FileSpreadsheet,
      };
    case "SEND_MANIFEST":
      return {
        label: "Pengiriman Manifest Berkas",
        bg: "bg-violet-50 text-violet-700 border-violet-200",
        nodeBg: "bg-violet-600 shadow-violet-200",
        icon: Send,
      };
    case "TRIGGER_RETURN":
    case "REVISE_DATA":
      return {
        label: "Pengajuan Koreksi / Revisi",
        bg: "bg-amber-50 text-amber-800 border-amber-300",
        nodeBg: "bg-amber-500 shadow-amber-200",
        icon: RotateCcw,
      };
    case "APPROVE_RETURN":
      return {
        label: "Koreksi Disetujui (Approved)",
        bg: "bg-teal-50 text-teal-700 border-teal-200",
        nodeBg: "bg-teal-500 shadow-teal-200",
        icon: CheckCircle2,
      };
    case "REJECT_RETURN":
      return {
        label: "Koreksi Ditolak (Rejected)",
        bg: "bg-rose-50 text-rose-700 border-rose-200",
        nodeBg: "bg-rose-500 shadow-rose-200",
        icon: AlertCircle,
      };
    case "UPLOAD_DOCUMENT":
      return {
        label: "Upload Dokumen Lampiran",
        bg: "bg-sky-50 text-sky-700 border-sky-200",
        nodeBg: "bg-sky-500 shadow-sky-200",
        icon: Upload,
      };
    default:
      return {
        label: action,
        bg: "bg-slate-50 text-slate-700 border-slate-200",
        nodeBg: "bg-slate-500 shadow-slate-200",
        icon: Info,
      };
  }
};

const getRoleBadge = (role: string) => {
  switch (role) {
    case "SUPERVISOR":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "RESEARCHER":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "DATA_ENTRY":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "ARCHIVIST":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "SENDER":
      return "bg-indigo-100 text-indigo-800 border-indigo-200";
    case "MONITOR":
      return "bg-cyan-100 text-cyan-800 border-cyan-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
};

const parseDateParts = (dateStr: string) => {
  const d = new Date(dateStr);
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sept", "Okt", "Nov", "Des"];
  const month = monthNames[d.getMonth()] || "Sept";
  const day = String(d.getDate()).padStart(2, "0");
  const year = String(d.getFullYear());
  const time = d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";
  return { month, day, year, time };
};

// -------------------- MAIN AUDIT LOG PAGE COMPONENT (INFINITE SCROLL) --------------------

export default function AuditLogPage() {
  const { setGlobalSelectedRequest } = useDashboard();

  // State Management
  const [logs, setLogs] = useState<any[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoadingInitial, setIsLoadingInitial] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Refs for Infinite Scroll
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Initial Load & Search change fetch
  const fetchInitialAuditLogs = useCallback(async (query: string) => {
    setIsLoadingInitial(true);
    setPage(1);
    try {
      const res = await getGlobalAuditLogs({
        page: 1,
        limit: 15,
        search: query,
      });

      if (res.success) {
        setLogs(res.logs);
        setHasMore(1 < res.totalPages);
      }
    } catch (err) {
      console.error("Gagal memuat audit log:", err);
    } finally {
      setIsLoadingInitial(false);
    }
  }, []);

  // Fetch Next Page (Load More)
  const fetchMoreAuditLogs = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);

    const nextPage = page + 1;
    try {
      const res = await getGlobalAuditLogs({
        page: nextPage,
        limit: 15,
        search: searchQuery,
      });

      if (res.success) {
        setLogs((prev) => [...prev, ...res.logs]);
        setPage(nextPage);
        setHasMore(nextPage < res.totalPages);
      }
    } catch (err) {
      console.error("Gagal memuat halaman berikutnya:", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [page, hasMore, isLoadingMore, searchQuery]);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInitialAuditLogs(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchInitialAuditLogs]);

  // Sentinel Element Observer (Infinite Scroll Trigger)
  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoadingInitial || isLoadingMore) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchMoreAuditLogs();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [isLoadingInitial, isLoadingMore, hasMore, fetchMoreAuditLogs]
  );

  const handleOpenEntityDetail = async (entityType: string, entityId: string) => {
    try {
      const res = await getEntityDetailsForAudit(entityType, entityId);
      if (res.success && res.data) {
        setGlobalSelectedRequest(res.data);
      }
    } catch (err) {
      console.error("Gagal membuka detail entitas:", err);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full font-sans text-slate-800 animate-fadeIn pb-16">
      
      {/* ========================================== */}
      {/* 1. PROMINENT SEARCH INPUT ONLY             */}
      {/* ========================================== */}
      <div className="bg-white p-3 px-4 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nomor permohonan, bundle, manifest, atau nama petugas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ========================================== */}
      {/* 2. CENTRAL SPINE INFINITE TIMELINE         */}
      {/* ========================================== */}
      <div className="relative min-h-[400px] px-2 py-4">
        
        {/* Central Spine Vertical Stem (Garis Vertikal Abu-abu di Tengah) */}
        <div className="absolute top-0 bottom-0 left-4 md:left-1/2 -translate-x-1/2 w-0.5 bg-slate-200/90 z-0"></div>

        {isLoadingInitial ? (
          <div className="flex flex-col gap-6 relative z-10 max-w-2xl mx-auto py-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
                <SkeletonCircle size="w-12 h-12" />
                <div className="flex-1 flex flex-col gap-2">
                  <SkeletonText width="w-40" height="h-4" />
                  <SkeletonText width="w-full" height="h-3" />
                </div>
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="relative z-10 bg-white p-12 rounded-2xl border border-slate-200/90 shadow-sm text-center flex flex-col items-center justify-center gap-3 max-w-lg mx-auto my-8">
            <div className="p-4 bg-slate-50 rounded-full text-slate-400">
              <ShieldCheck className="w-10 h-10 stroke-[1.5]" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Tidak ada riwayat timeline ditemukan</h3>
            <p className="text-xs text-slate-400">
              Pastikan kata kunci permohonan, bundle, manifest, atau nama petugas yang Anda cari sudah sesuai.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-8 md:gap-10 relative z-10">
            {logs.map((log, index) => {
              const isEven = index % 2 === 0;
              const cfg = getActionConfig(log.action);
              const dateParts = parseDateParts(log.createdAt);

              return (
                <div
                  key={`${log.id}-${index}`}
                  className={`relative flex items-center w-full ${
                    isEven ? "md:flex-row-reverse" : "md:flex-row"
                  } pl-10 md:pl-0`}
                >
                  {/* Central Node Circle */}
                  <div className="absolute left-4 md:left-1/2 -translate-x-1/2 top-5 z-20">
                    <div className={`w-4.5 h-4.5 rounded-full border-4 border-white shadow-md ${cfg.nodeBg} flex items-center justify-center`}>
                    </div>
                  </div>

                  {/* Card Container */}
                  <div className={`w-full md:w-[calc(50%-2rem)] ${isEven ? "md:mr-auto" : "md:ml-auto"}`}>
                    <div
                      onClick={() => handleOpenEntityDetail(log.entityType, log.entityId)}
                      className="bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-row items-stretch cursor-pointer group relative"
                    >
                      {/* Pointer Arrow Indicator */}
                      <div
                        className={`hidden md:block absolute top-4.5 w-2.5 h-2.5 bg-white rotate-45 border-slate-200/90 z-10 ${
                          isEven
                            ? "-right-1.25 border-t border-r"
                            : "-left-1.25 border-b border-l"
                        }`}
                      ></div>

                      {/* MAIN CONTENT BLOCK */}
                      <div className="flex-1 p-3 px-4 flex flex-col justify-center gap-1.5 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-xs font-bold text-slate-800 tracking-tight truncate group-hover:text-indigo-600 transition-colors">
                            {cfg.label}
                          </h3>
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200/80 font-mono shrink-0">
                            {log.entityType}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium truncate">
                          <span className="text-slate-700 font-semibold truncate">
                            {log.actor?.name || "Petugas Sistem"}
                          </span>

                          {log.actor?.role && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border shrink-0 ${getRoleBadge(log.actor.role)}`}>
                              {log.actor.role}
                            </span>
                          )}

                          {(log.oldStatus || log.newStatus) && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="font-mono text-[10px] text-slate-600 truncate">
                                {log.oldStatus ? `${log.oldStatus} ➔ ` : ''}{log.newStatus || ''}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* DATE BOX BLOCK */}
                      <div className="w-18 md:w-20 bg-slate-50/80 border-l border-slate-200/80 flex flex-col items-center justify-center p-2 text-center shrink-0 select-none">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none">
                          {dateParts.month}
                        </span>
                        <span className="text-base md:text-lg font-black text-slate-800 leading-tight my-0.5">
                          {dateParts.day}
                        </span>
                        <span className="text-[9px] font-semibold text-slate-400 leading-none">
                          {dateParts.year}
                        </span>
                        <span className="text-[9px] font-mono text-indigo-600 font-bold mt-1 leading-none">
                          {dateParts.time}
                        </span>
                      </div>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Sentinel Element Trigger for Load More */}
        <div ref={lastElementRef} className="h-4 w-full"></div>

        {/* Loading Spinner for Infinite Scroll */}
        {isLoadingMore && (
          <div className="flex items-center justify-center gap-2 py-6 text-xs text-indigo-600 font-semibold">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Memuat riwayat berikutnya...</span>
          </div>
        )}

        {/* End of Timeline Indicator */}
        {!hasMore && logs.length > 0 && !isLoadingInitial && (
          <div className="flex items-center justify-center pt-8 pb-4">
            <span className="px-4 py-1.5 bg-slate-100 text-slate-500 rounded-full text-[11px] font-semibold border border-slate-200/80 shadow-2xs">
              Semua riwayat timeline telah ditampilkan
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
