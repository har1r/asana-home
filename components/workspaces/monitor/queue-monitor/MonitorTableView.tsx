"use client";

import React, { useState, useMemo } from "react";
import { FolderLock, ChevronLeft, ChevronRight, RefreshCw, CheckCircle2, AlertTriangle, Layers, FileSpreadsheet } from "lucide-react";
import { formatBundleNumber, formatNop } from "@/components/workspaces/shared/constants";
import { EmptyDataAnimation } from "@/components/workspaces/shared/EmptyDataAnimation";
import { MonitorTableRow } from "./MonitorTableRow";
import { DetailsModal } from "@/components/workspaces/shared/DetailsModal";

export interface MonitorTableViewProps {
  selectedBundle: any | null;
  bundlesList?: any[];
  onSelectBundle?: (bundle: any) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onTogglePecahanVerified: (permohonanId: string, targetId: string | undefined, itemKey: string, isChecked: boolean) => void;
  onVerifyAllPecahan: () => void;
  onComplete: (id: string, nomorPermohonan: string) => void;
  onCompleteBundle?: (bundle: any) => void;
  onOpenRollbackModal: () => void;
  loading?: boolean;
  checkedPecahanMap: Record<string, boolean>;
}

export const MonitorTableView: React.FC<MonitorTableViewProps> = React.memo(({
  selectedBundle,
  bundlesList = [],
  onSelectBundle,
  onRefresh,
  isRefreshing = false,
  onTogglePecahanVerified,
  onVerifyAllPecahan,
  onComplete,
  onCompleteBundle,
  onOpenRollbackModal,
  loading = false,
  checkedPecahanMap,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [displayMode, setDisplayMode] = useState<"permohonan" | "pemohon">("permohonan");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedDetailsRequest, setSelectedDetailsRequest] = useState<any | null>(null);

  // Derive flat list of items depending on displayMode
  const allRows = useMemo(() => {
    if (!selectedBundle || !selectedBundle.permohonan) return [];
    const apps = selectedBundle.permohonan || [];

    if (displayMode === "permohonan") {
      return apps.map((app: any) => {
        const prev = Array.isArray(app.previousData) && app.previousData.length > 0 ? app.previousData[0] : (Array.isArray(app.dataLama) && app.dataLama.length > 0 ? app.dataLama[0] : null);
        const targ = Array.isArray(app.targetData) && app.targetData.length > 0 ? app.targetData[0] : (Array.isArray(app.dataBaru) && app.dataBaru.length > 0 ? app.dataBaru[0] : null);

        const targetList = Array.isArray(app.targetData) && app.targetData.length > 0
          ? app.targetData
          : (Array.isArray(app.dataBaru) ? app.dataBaru : []);

        const isFullyVerified = targetList.length > 0
          ? targetList.every((t: any, idx: number) => {
              const k = t.idTargetData || t.id || `pecahan_${idx}`;
              return app.status === "COMPLETED" || !!t.isVerified || !!checkedPecahanMap[k];
            })
          : true;

        return {
          ...app,
          permohonanId: app.id,
          nop: app.nop || prev?.nop || targ?.nopFinal || targ?.nopTemporary || "",
          ownerName: app.namaWajibPajak || prev?.ownerName || prev?.namaPemilikLama || targ?.ownerName || app.applicantName || "—",
          objectAddress: app.alamat || prev?.ownerAddress || prev?.objectAddress || targ?.ownerAddress || targ?.objectAddress || "—",
          isVerified: isFullyVerified,
          parentPermohonan: app,
        };
      });
    }

    // Display mode "pemohon" -> Flatten target data / pecahan
    const flattened: any[] = [];
    apps.forEach((app: any) => {
      const prev = Array.isArray(app.previousData) && app.previousData.length > 0 ? app.previousData[0] : (Array.isArray(app.dataLama) && app.dataLama.length > 0 ? app.dataLama[0] : null);
      const targetList = Array.isArray(app.targetData) && app.targetData.length > 0
        ? app.targetData
        : (Array.isArray(app.dataBaru) && app.dataBaru.length > 0 ? app.dataBaru : []);

      if (targetList.length > 0) {
        targetList.forEach((t: any, idx: number) => {
          const itemKey = t.idTargetData || t.id || `pecahan_${idx}`;
          const isVerified = app.status === "COMPLETED" || !!t.isVerified || !!checkedPecahanMap[itemKey];

          flattened.push({
            ...t,
            id: t.idTargetData || t.id || `${app.id}_${idx}`,
            targetId: t.idTargetData || t.id,
            itemKey,
            permohonanId: app.id,
            applicationNumber: app.applicationNumber || app.nomorPelayanan || app.nomorPermohonan,
            createdAt: app.createdAt,
            jenisPermohonan: app.jenisPermohonan || app.applicationType,
            status: app.status,
            nop: t.nopFinal || t.nopTemporary || t.nop || app.nop || prev?.nop || "",
            ownerName: t.ownerName || t.namaPemilikBaru || app.namaWajibPajak || prev?.ownerName || "—",
            objectAddress: t.ownerAddress || t.objectAddress || t.alamatPemilikBaru || app.alamat || prev?.ownerAddress || "—",
            landArea: t.landArea ?? t.luasTanahBaru,
            buildingArea: t.buildingArea ?? t.luasBangunanBaru,
            isVerified,
            isPecahanRow: targetList.length > 1,
            pecahanIndex: idx + 1,
            totalPecahan: targetList.length,
            parentPermohonan: app,
          });
        });
      } else {
        flattened.push({
          id: app.id,
          permohonanId: app.id,
          applicationNumber: app.applicationNumber || app.nomorPelayanan,
          createdAt: app.createdAt,
          jenisPermohonan: app.jenisPermohonan || app.applicationType,
          status: app.status,
          nop: app.nop || prev?.nop || "",
          ownerName: app.namaWajibPajak || prev?.ownerName || app.applicantName || "—",
          objectAddress: app.alamat || prev?.ownerAddress || "—",
          isVerified: app.status === "COMPLETED",
          isPecahanRow: false,
          parentPermohonan: app,
        });
      }
    });
    return flattened;
  }, [selectedBundle, displayMode, checkedPecahanMap]);

  // Filter rows by searchQuery
  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return allRows;
    return allRows.filter((r: any) => {
      const nopStr = (r.nop || "").toLowerCase();
      const nameStr = (r.ownerName || "").toLowerCase();
      const numStr = (r.applicationNumber || "").toLowerCase();
      const addrStr = (r.objectAddress || "").toLowerCase();
      return nopStr.includes(query) || nameStr.includes(query) || numStr.includes(query) || addrStr.includes(query);
    });
  }, [allRows, searchQuery]);

  const totalPages = Math.ceil(filteredRows.length / itemsPerPage) || 1;
  const activePage = currentPage > totalPages ? 1 : currentPage;

  const paginatedRows = useMemo(() => {
    return filteredRows.slice((activePage - 1) * itemsPerPage, activePage * itemsPerPage);
  }, [filteredRows, activePage, itemsPerPage]);

  const startEntry = filteredRows.length > 0 ? (activePage - 1) * itemsPerPage + 1 : 0;
  const endEntry = Math.min(activePage * itemsPerPage, filteredRows.length);

  // Overall verification calculations for current selectedBundle
  const { totalTargetsCount, totalVerifiedCount, isAllVerified } = useMemo(() => {
    if (!selectedBundle || !selectedBundle.permohonan) return { totalTargetsCount: 0, totalVerifiedCount: 0, isAllVerified: false };
    let total = 0;
    let verified = 0;
    selectedBundle.permohonan.forEach((app: any) => {
      const tList = Array.isArray(app.targetData) && app.targetData.length > 0
        ? app.targetData
        : (Array.isArray(app.dataBaru) && app.dataBaru.length > 0 ? app.dataBaru : []);
      if (tList.length > 0) {
        tList.forEach((t: any, idx: number) => {
          total++;
          const itemKey = t.idTargetData || t.id || `pecahan_${idx}`;
          if (app.status === "COMPLETED" || !!t.isVerified || !!checkedPecahanMap[itemKey]) {
            verified++;
          }
        });
      } else {
        total++;
        if (app.status === "COMPLETED") verified++;
      }
    });
    return {
      totalTargetsCount: total,
      totalVerifiedCount: verified,
      isAllVerified: total > 0 && verified >= total,
    };
  }, [selectedBundle, checkedPecahanMap]);

  if (!selectedBundle) {
    return (
      <div className="bg-white p-8 rounded-md border border-slate-200/90 shadow-3xs min-h-[350px] flex items-center justify-center font-sans">
        <EmptyDataAnimation
          title="Pilih Bundle Terlebih Dahulu"
          description="Silakan pilih salah satu bundle di tab Daftar Bundle terlebih dahulu."
        />
      </div>
    );
  }

  const isCompleted = selectedBundle.permohonan?.every((p: any) => p.status === "COMPLETED");

  return (
    <div className="flex flex-col gap-4 font-sans select-none animate-fadeIn">
      {/* Bundle Header & Toolbar */}
      <div className="bg-white p-4 rounded-md border border-slate-200/90 shadow-3xs flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans">
        {/* Left: Bundle Title Dropdown / Select */}
        <div className="flex items-center gap-3">
          <div className="bg-[#00a389]/10 border border-[#00a389]/20 p-2 rounded-md text-[#008f78] shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-slate-400 capitalize leading-none mb-1">Bundle Terpilih</span>
            {bundlesList.length > 1 && onSelectBundle ? (
              <select
                value={selectedBundle.id}
                onChange={(e) => {
                  const b = bundlesList.find((x) => x.id === e.target.value);
                  if (b) onSelectBundle(b);
                }}
                className="text-sm font-bold font-mono text-slate-900 bg-transparent border-b border-slate-200 cursor-pointer outline-none hover:text-[#00a389] transition-colors"
              >
                {bundlesList.map((b) => (
                  <option key={b.id} value={b.id}>
                    {formatBundleNumber(b.nomorBundle || b.bundleNumber)} ({b.permohonan?.length || 0} Permohonan)
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-sm font-bold font-mono text-slate-900">
                {formatBundleNumber(selectedBundle.nomorBundle || selectedBundle.bundleNumber)}
              </span>
            )}
          </div>
        </div>

        {/* Center & Right: Search Bar, Display Mode Switcher, Refresh */}
        <div className="flex flex-wrap items-center gap-3 font-sans">
          {/* Search input */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari NOP / Nama / No. Pelayanan..."
              className="w-64 text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 pl-8 text-slate-800 focus:outline-none focus:border-[#00a389] font-sans"
            />
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Display Mode Tab Switcher */}
          <div className="bg-slate-100 p-1 rounded-md flex items-center gap-1 border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setDisplayMode("permohonan");
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded text-xs transition-all cursor-pointer ${
                displayMode === "permohonan"
                  ? "bg-white text-slate-900 shadow-3xs font-bold"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Mode Permohonan
            </button>
            <button
              type="button"
              onClick={() => {
                setDisplayMode("pemohon");
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded text-xs transition-all cursor-pointer ${
                displayMode === "pemohon"
                  ? "bg-white text-slate-900 shadow-3xs font-bold"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Mode Pecahan / Target
            </button>
          </div>

          {/* Refresh Button */}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-3xs transition-all cursor-pointer disabled:opacity-40"
              title="Refresh Data Table"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-[#00a389]" : ""}`} />
            </button>
          )}
        </div>
      </div>

      {/* Enterprise Data Table Canvas */}
      <div className="w-full bg-white border border-slate-200/90 rounded-md shadow-xs flex flex-col overflow-hidden min-h-[440px] font-sans">
        <div className="p-0 flex-1 flex flex-col">
          <div className="overflow-x-auto scrollbar-thin flex-1 flex flex-col">
            <table className="w-full text-left border-collapse font-sans">
              <thead>
                <tr className="bg-slate-50/90 text-[13px] font-normal text-slate-600 capitalize text-left border-b border-slate-200/90 select-none font-sans">
                  <th className="py-3 px-4 text-center w-12 min-w-[48px] relative font-normal text-slate-600">No</th>
                  <th className="py-3 px-2 text-center w-10 min-w-[40px] relative font-normal text-slate-600">⭐</th>
                  <th className="py-3 px-4 min-w-[110px] relative font-normal text-slate-600">Tgl. Input</th>
                  <th className="py-3 px-4 min-w-[140px] relative font-normal text-slate-600">No. Permohonan</th>
                  <th className="py-3 px-4 min-w-[190px] relative font-normal text-slate-600">Nomor Objek Pajak (NOP)</th>
                  <th className="py-3 px-4 min-w-[180px] relative font-normal text-slate-600">Nama Pemohon / WP</th>
                  <th className="py-3 px-4 min-w-[200px] relative font-normal text-slate-600">Alamat Objek</th>
                  <th className="py-3 px-4 min-w-[130px] relative font-normal text-slate-600">Luas (LT / LB)</th>
                  <th className="py-3 px-4 text-center min-w-[120px] relative font-normal text-slate-600">Jenis Layanan</th>
                  <th className="py-3 px-4 text-center min-w-[140px] relative font-normal text-slate-600">Verifikasi Target</th>
                  <th className="py-3 px-4 text-center min-w-[110px] relative font-normal text-slate-600">Status</th>
                  <th className="py-3 px-4 text-center min-w-[90px] font-normal text-slate-600">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[12px] font-normal text-slate-600 font-sans">
                {paginatedRows.length > 0 ? (
                  paginatedRows.map((rowItem: any, idx: number) => (
                    <MonitorTableRow
                      key={rowItem.id || `row_${idx}`}
                      item={rowItem}
                      index={(activePage - 1) * itemsPerPage + idx}
                      searchQuery={searchQuery}
                      onViewDetails={(item) => setSelectedDetailsRequest(item)}
                      onToggleVerified={onTogglePecahanVerified}
                      onComplete={onComplete}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={12} className="py-12 text-center select-none font-sans">
                      <EmptyDataAnimation
                        title={searchQuery ? "Tidak ada permohonan yang sesuai" : "Belum ada permohonan dalam bundle ini"}
                        description={searchQuery ? "Coba ubah kata kunci pencarian Anda." : "Data permohonan akan muncul di sini."}
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table Footer / Pagination */}
        <div className="px-5 py-3 border-t border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 select-none shrink-0 mt-auto font-sans">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-semibold text-slate-500 font-sans">
              {filteredRows.length > 0
                ? `Menampilkan ${startEntry}–${endEntry} dari ${filteredRows.length} ${displayMode === "pemohon" ? "entri pemohon/target" : "permohonan"}`
                : "Tidak ada data"}
            </span>
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-md px-1.5 py-0.5 shadow-3xs">
              {[10, 20, 50].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => {
                    setItemsPerPage(n);
                    setCurrentPage(1);
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                    itemsPerPage === n
                      ? "bg-[#00a389] text-white shadow-3xs"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {n}
                </button>
              ))}
              <span className="text-[10px] text-slate-400 font-semibold pl-0.5">/hal</span>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1 font-sans">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={activePage === 1}
                className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-all cursor-pointer shadow-3xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => page === 1 || page === totalPages || Math.abs(page - activePage) <= 1)
                .reduce((acc: (number | string)[], page, idx, arr) => {
                  if (idx > 0 && (page as number) - (arr[idx - 1] as number) > 1) acc.push("...");
                  acc.push(page);
                  return acc;
                }, [])
                .map((page, idx) =>
                  page === "..." ? (
                    <span key={`ellipsis-${idx}`} className="px-1 text-slate-400 text-xs">…</span>
                  ) : (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page as number)}
                      className={`min-w-[28px] h-[28px] rounded-md text-xs font-semibold transition-all cursor-pointer shadow-3xs ${
                        activePage === page
                          ? "bg-[#00a389] text-white"
                          : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={activePage === totalPages}
                className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-all cursor-pointer shadow-3xs"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Floating Sticky Action Footer */}
      <div className="sticky bottom-4 z-30 bg-white/95 backdrop-blur-md p-4 rounded-md border border-slate-200/90 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none mt-2 animate-slideUp font-sans">
        <div className="text-[13px] text-slate-600 font-normal flex items-center gap-2 font-sans">
          {isAllVerified ? (
            <span className="text-[#008f78] font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Seluruh {totalTargetsCount} target data terverifikasi! Klik tombol untuk menandai layanan PBB selesai.
            </span>
          ) : (
            <span className="text-amber-800 font-medium flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Progress Verifikasi: ({totalVerifiedCount}/{totalTargetsCount}) Target Data terverifikasi.
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 justify-end shrink-0 font-sans">
          {totalTargetsCount > totalVerifiedCount && (
            <button
              type="button"
              onClick={onVerifyAllPecahan}
              className="py-2 px-3 text-[12px] font-normal text-[#00a389] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-all cursor-pointer font-sans"
            >
              Selesaikan Semua Verifikasi
            </button>
          )}

          {!isCompleted ? (
            <button
              type="button"
              onClick={() => {
                if (onCompleteBundle) {
                  onCompleteBundle(selectedBundle);
                } else {
                  const uncompleted = (selectedBundle.permohonan || []).filter((p: any) => p.status !== "COMPLETED");
                  if (uncompleted.length > 0) {
                    onComplete(uncompleted[0].id, uncompleted[0].applicationNumber || uncompleted[0].nomorPelayanan || uncompleted[0].id);
                  }
                }
              }}
              disabled={loading || !isAllVerified}
              className="py-2 px-4 text-[13px] font-normal text-white bg-[#00a389] hover:bg-[#008f78] active:scale-95 rounded-md shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-sans"
            >
              Tandai Selesai
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenRollbackModal}
              disabled={loading}
              className="py-2 px-4 text-[13px] font-normal text-white bg-rose-600 hover:bg-rose-700 active:scale-95 rounded-md shadow-3xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-sans"
            >
              Batal Selesai
            </button>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {selectedDetailsRequest && (
        <DetailsModal
          isOpen={!!selectedDetailsRequest}
          onClose={() => setSelectedDetailsRequest(null)}
          selectedRequest={selectedDetailsRequest}
        />
      )}
    </div>
  );
});

MonitorTableView.displayName = "MonitorTableView";
