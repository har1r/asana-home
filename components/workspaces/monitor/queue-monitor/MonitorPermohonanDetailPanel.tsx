"use client";

import React from "react";
import { formatNop } from "@/components/workspaces/shared/constants";
import { useSession } from "next-auth/react";

interface MonitorPermohonanDetailPanelProps {
  selectedPermohonan: any | null;
  checkedPecahanMap: Record<string, boolean>;
  loading: boolean;
  onTogglePecahanVerified: (dbId: string | undefined, itemKey: string, isChecked: boolean) => void;
  onVerifyAllPecahan: () => void;
  onComplete: (id: string, nomorPermohonan: string) => void;
  onOpenRollbackModal: () => void;
}

export const MonitorPermohonanDetailPanel: React.FC<MonitorPermohonanDetailPanelProps> = React.memo(({
  selectedPermohonan,
  checkedPecahanMap,
  loading,
  onTogglePecahanVerified,
  onVerifyAllPecahan,
  onComplete,
  onOpenRollbackModal,
}) => {
  const { data: session } = useSession();

  if (!selectedPermohonan) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 p-8 my-auto select-none font-sans">
        <img
          src="/assets/Select-bro.svg"
          alt="Pilih Permohonan"
          className="w-48 h-48 sm:w-56 sm:h-56 max-w-full object-contain pointer-events-none drop-shadow-xs mb-2"
        />
        <h4 className="text-sm font-extrabold text-slate-800 tracking-tight font-sans">Pilih Permohonan</h4>
        <p className="text-xs text-slate-500 font-normal leading-relaxed max-w-xs mt-1 font-sans">
          Klik salah satu berkas permohonan di panel atas untuk menampilkan detail dan tombol aksi.
        </p>
      </div>
    );
  }

  const stepsData = [
    {
      label: "Diinput",
      key: "INPUTTED",
      roleLabel: "Penginput",
      actorName: selectedPermohonan.penginput?.name || "Petugas Penginput",
      dateStr: selectedPermohonan.createdAt
        ? new Date(selectedPermohonan.createdAt).toLocaleString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "—",
    },
    {
      label: "Diteliti",
      key: "RESEARCHED",
      roleLabel: "Peneliti",
      actorName: selectedPermohonan.bundle?.peneliti?.name || "Petugas Peneliti",
      dateStr: selectedPermohonan.bundle?.createdAt
        ? new Date(selectedPermohonan.bundle.createdAt).toLocaleString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "—",
    },
    {
      label: "Diarsip",
      key: "ARCHIVED",
      roleLabel: "Pengarsip",
      actorName: selectedPermohonan.arsipDigital?.[0]?.pengarsip?.name || "Petugas Pengarsip",
      dateStr: selectedPermohonan.arsipDigital?.[0]?.createdAt
        ? new Date(selectedPermohonan.arsipDigital[0].createdAt).toLocaleString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "—",
    },
    {
      label: "Dikirim",
      key: "SENT",
      roleLabel: "Pengirim",
      actorName: selectedPermohonan.bundle?.manifest?.pengirim?.name || "Petugas Pengirim",
      dateStr: selectedPermohonan.bundle?.manifest?.updatedAt
        ? new Date(selectedPermohonan.bundle.manifest.updatedAt).toLocaleString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "—",
    },
    {
      label: "Dipantau",
      key: "MONITORING",
      roleLabel: "Pemantau",
      actorName: session?.user?.name ? `${session.user.name}` : "Petugas Pemantau",
      dateStr: selectedPermohonan.bundle?.manifest?.updatedAt
        ? new Date(selectedPermohonan.bundle.manifest.updatedAt).toLocaleString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "—",
    },
    {
      label: "Selesai",
      key: "COMPLETED",
      roleLabel: "Penyelesaian",
      actorName:
        selectedPermohonan.status === "COMPLETED"
          ? session?.user?.name || selectedPermohonan.penginput?.name || "Petugas Pemantau"
          : "Menunggu Selesai",
      dateStr: selectedPermohonan.tanggalPenyelesaian
        ? new Date(selectedPermohonan.tanggalPenyelesaian).toLocaleString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : selectedPermohonan.status === "COMPLETED"
        ? new Date(selectedPermohonan.updatedAt).toLocaleString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "—",
    },
  ];

  const isAllCompleted = selectedPermohonan.status === "COMPLETED";
  const activeIndex = isAllCompleted ? 5 : 4;

  const totalPecahanCount = selectedPermohonan.dataBaru?.length || 0;
  const verifiedCount = Object.values(checkedPecahanMap).filter(Boolean).length;
  const isAllPecahanVerified = totalPecahanCount <= 1 || verifiedCount >= totalPecahanCount;
  const isMutasiSebagian = selectedPermohonan.jenisPermohonan === "MUTASI_SEBAGIAN";

  return (
    <div className="flex-1 min-w-0 w-full bg-white border border-slate-200/90 rounded-md p-5 shadow-3xs flex flex-col gap-5 relative font-sans">
      <div className="flex flex-col gap-5 animate-fadeIn font-sans">
        {/* Frozen Alert Banner */}
        {selectedPermohonan.permintaanKoreksi && selectedPermohonan.permintaanKoreksi.length > 0 && (
          <div className="bg-amber-50/70 border border-amber-200 text-amber-800 p-4 rounded-md text-[13px] font-normal select-none flex flex-col gap-1.5 animate-fadeIn shrink-0 shadow-3xs font-sans">
            <p className="flex items-center gap-1.5 font-normal">Permohonan ini dibekukan (LOCKED)</p>
            <p className="text-[13px] text-amber-700 leading-relaxed pl-5 font-normal">
              Tindakan koreksi pembatalan selesai (<strong>Rollback</strong>) telah diajukan dan sedang menunggu
              persetujuan dari Supervisor sebelum status berkas dapat dipulihkan ke Terarsip. Catatan: "
              {selectedPermohonan.permintaanKoreksi[0].catatanPengaju}"
            </p>
          </div>
        )}

        {/* Timeline Stepper & Detail Riwayat Penanggung Jawab */}
        <div className="bg-slate-50/90 p-4 rounded-md border border-slate-200/80 select-none flex flex-col gap-4 shadow-3xs font-sans">
          <div className="flex items-center justify-end border-b border-slate-200/70 pb-2">
            <span className="text-[13px] font-normal text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
              6 Tahapan Siklus
            </span>
          </div>

          {/* Horizontal Stepper */}
          <div className="flex items-start justify-between w-full overflow-x-auto pt-1 pb-2 font-sans">
            {stepsData.map((step, i) => {
              const isDone = isAllCompleted || i < activeIndex;
              const isCurrent = !isAllCompleted && i === activeIndex;

              return (
                <React.Fragment key={step.key}>
                  <div className="flex flex-col items-center gap-1 shrink-0 z-10 min-w-[60px] text-center font-sans">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-normal transition-all duration-300 ${
                        isDone
                          ? "bg-[#00a389] text-white shadow-3xs"
                          : isCurrent
                          ? "bg-[#00a389] text-white shadow-md ring-4 ring-[#00a389]/20 scale-105"
                          : "bg-slate-200 text-slate-400 border border-slate-300/60"
                      }`}
                    >
                      {isDone ? (
                        <span>✓</span>
                      ) : isCurrent ? (
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      ) : (
                        <span>{i + 1}</span>
                      )}
                    </div>
                    <span
                      className={`text-[13px] font-normal whitespace-nowrap ${
                        isDone ? "text-[#008f78]" : isCurrent ? "text-[#008f78]" : "text-slate-400"
                      }`}
                    >
                      {step.label}
                    </span>
                    <span className="text-[13px] font-normal text-slate-500 truncate max-w-[70px]" title={step.actorName}>
                      {step.actorName.split(" ")[0]}
                    </span>
                  </div>

                  {i < stepsData.length - 1 && (
                    <div className="flex-1 mx-1 mt-3.5 min-w-[12px]">
                      <div
                        className={`h-0.5 w-full rounded-full transition-all duration-300 ${
                          i < activeIndex || isAllCompleted ? "bg-[#00a389]" : "bg-slate-200"
                        }`}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Row Top: Data Utama Permohonan & Data Objek Lama Berjejer (Side by Side) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full items-start font-sans">
          {/* Card 1: Data Utama Permohonan */}
          <div className="bg-slate-50/80 p-4 rounded-md border border-slate-200/70 flex flex-col gap-2.5 w-full">
            <h5 className="text-[13px] font-normal text-slate-700 capitalize font-sans border-b border-slate-200/60 pb-1.5 flex items-center justify-between">
              <span>Data Utama</span>
            </h5>
            <div className="grid grid-cols-[120px_8px_1fr] gap-y-2 text-[13px] font-normal items-baseline bg-white p-3.5 rounded-md border border-slate-200/60 shadow-3xs">
              <span className="text-slate-500 font-normal">NOP</span>
              <span className="text-slate-400 font-normal">:</span>
              <span className="text-slate-800 font-normal font-mono">{formatNop(selectedPermohonan.nop)}</span>

              <span className="text-slate-500 font-normal">Nama WP</span>
              <span className="text-slate-400 font-normal">:</span>
              <span className="text-slate-800 font-normal uppercase">{selectedPermohonan.namaWajibPajak}</span>

              <span className="text-slate-500 font-normal">Alamat WP</span>
              <span className="text-slate-400 font-normal">:</span>
              <span className="text-slate-700 font-normal">{selectedPermohonan.alamat}</span>

              <span className="text-slate-500 font-normal">No. WhatsApp</span>
              <span className="text-slate-400 font-normal">:</span>
              <span className="text-slate-700 font-normal">{selectedPermohonan.noWhatsapp}</span>
            </div>
          </div>

          {/* Card 2: Data Objek Lama (Berjejer dengan Data Utama) */}
          {selectedPermohonan.namaPemilikLama && (
            <div className="bg-slate-50/80 p-4 rounded-md border border-slate-200/70 flex flex-col gap-2.5 w-full">
              <h5 className="text-[13px] font-normal text-slate-700 capitalize font-sans border-b border-slate-200/60 pb-1.5">
                Data Lama (Asal)
              </h5>
              <div className="grid grid-cols-[120px_8px_1fr] gap-y-2 text-[13px] font-normal items-baseline bg-white p-3.5 rounded-md border border-slate-200/70 shadow-3xs">
                <span className="text-slate-500 font-normal">Pemilik Lama</span>
                <span className="text-slate-400 font-normal">:</span>
                <span className="text-slate-700 font-normal uppercase">{selectedPermohonan.namaPemilikLama}</span>

                {selectedPermohonan.luasTanahLama !== undefined && selectedPermohonan.luasTanahLama !== null && (
                  <>
                    <span className="text-slate-500 font-normal">Luas Tanah</span>
                    <span className="text-slate-400 font-normal">:</span>
                    <span className="text-slate-700 font-normal">{selectedPermohonan.luasTanahLama} m²</span>
                  </>
                )}

                {selectedPermohonan.luasBangunanLama !== undefined && selectedPermohonan.luasBangunanLama !== null && (
                  <>
                    <span className="text-slate-500 font-normal">Luas Bangunan</span>
                    <span className="text-slate-400 font-normal">:</span>
                    <span className="text-slate-700 font-normal">{selectedPermohonan.luasBangunanLama} m²</span>
                  </>
                )}

                {selectedPermohonan.sertifikatLama && (
                  <>
                    <span className="text-slate-500 font-normal">Sertifikat</span>
                    <span className="text-slate-400 font-normal">:</span>
                    <span className="text-slate-700 font-normal uppercase">{selectedPermohonan.sertifikatLama}</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Section Data Objek Baru (Kondisional Pecahan vs Objek Baru) */}
        {selectedPermohonan.dataBaru && selectedPermohonan.dataBaru.length > 0 && (
          <div className="bg-slate-50/80 p-4 rounded-md border border-slate-200/70 select-none flex flex-col gap-3 font-sans w-full">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2 font-sans">
              <h5 className="text-[13px] font-normal text-slate-700 capitalize font-sans flex items-center gap-1.5">
                Data Baru{" "}
                {selectedPermohonan.jenisPermohonan === "MUTASI_SEBAGIAN" && selectedPermohonan.dataBaru.length > 1
                  ? `(${selectedPermohonan.dataBaru.length} Pecahan)`
                  : ""}
              </h5>

              {selectedPermohonan.dataBaru.length > 1 && selectedPermohonan.status !== "COMPLETED" && (
                <div className="flex items-center gap-2 font-sans">
                  <span className="text-[13px] font-normal text-[#008f78] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                    {Object.values(checkedPecahanMap).filter(Boolean).length}/{selectedPermohonan.dataBaru.length}{" "}
                    Terverifikasi
                  </span>
                  <button
                    type="button"
                    onClick={onVerifyAllPecahan}
                    className="text-[13px] font-normal text-white bg-[#00a389] hover:bg-[#008f78] px-2.5 py-1 rounded-md transition-all active:scale-95 cursor-pointer shadow-3xs font-sans"
                  >
                    Selesaikan Semua
                  </button>
                </div>
              )}
            </div>

            {/* Grid Objek Baru / Pecahan Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 items-start font-sans">
              {selectedPermohonan.dataBaru.map((db: any, idx: number) => {
                const itemKey = db.id || `pecahan_${idx}`;
                const isChecked = selectedPermohonan.status === "COMPLETED" || !!checkedPecahanMap[itemKey];
                const isMutasiSebagian = selectedPermohonan.jenisPermohonan === "MUTASI_SEBAGIAN";

                return (
                  <div
                    key={itemKey}
                    className={`grid grid-cols-[120px_8px_1fr] gap-y-2 text-[13px] font-normal items-baseline p-3.5 rounded-md border transition-all shadow-3xs ${
                      isChecked
                        ? "bg-emerald-50/40 border-emerald-200/90 ring-1 ring-emerald-500/10"
                        : "bg-white border-slate-200/80 hover:border-slate-300"
                    }`}
                  >
                    <div className="col-span-3 flex items-center justify-between border-b border-slate-100 pb-1.5 mb-1 select-none font-sans">
                      <span className="text-[13px] font-normal text-slate-800 flex items-center gap-1.5 font-sans">
                        {isMutasiSebagian && (
                          <span className="w-4 h-4 rounded-full bg-emerald-50 text-[#008f78] border border-emerald-200 text-[10px] flex items-center justify-center font-normal shrink-0">
                            {idx + 1}
                          </span>
                        )}
                        {isMutasiSebagian
                          ? `Pecahan Objek #${idx + 1}`
                          : selectedPermohonan.dataBaru.length > 1
                          ? `Objek Baru #${idx + 1}`
                          : "Data Objek Baru"}
                      </span>

                      {selectedPermohonan.status !== "COMPLETED" ? (
                        <label className="inline-flex items-center gap-1.5 cursor-pointer select-none bg-white px-2.5 py-0.5 rounded-md border border-slate-200 shadow-3xs hover:bg-slate-50 font-sans">
                          <input
                            type="checkbox"
                            checked={!!checkedPecahanMap[itemKey]}
                            onChange={(e) => onTogglePecahanVerified(db.id, itemKey, e.target.checked)}
                            className="w-3.5 h-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                          <span
                            className={`text-[13px] font-normal ${
                              checkedPecahanMap[itemKey] ? "text-emerald-700" : "text-slate-500"
                            }`}
                          >
                            {checkedPecahanMap[itemKey] ? "Selesai" : "Selesaikan"}
                          </span>
                        </label>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[13px] font-normal px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 border border-emerald-200 font-sans">
                          Selesai
                        </span>
                      )}
                    </div>

                    <span className="text-slate-500 font-normal">Pemilik Baru</span>
                    <span className="text-slate-400 font-normal">:</span>
                    <span className="text-slate-800 font-normal uppercase">{db.namaPemilikBaru}</span>

                    {db.alamatPemilikBaru && (
                      <>
                        <span className="text-slate-500 font-normal">Alamat</span>
                        <span className="text-slate-400 font-normal">:</span>
                        <span className="text-slate-700 font-normal">{db.alamatPemilikBaru}</span>
                      </>
                    )}

                    {db.luasTanahBaru !== undefined && db.luasTanahBaru !== null && (
                      <>
                        <span className="text-slate-500 font-normal">Luas Tanah</span>
                        <span className="text-slate-400 font-normal">:</span>
                        <span className="text-slate-700 font-normal">{db.luasTanahBaru} m²</span>
                      </>
                    )}

                    {db.luasBangunanBaru !== undefined && db.luasBangunanBaru !== null && (
                      <>
                        <span className="text-slate-500 font-normal">Luas Bangunan</span>
                        <span className="text-slate-400 font-normal">:</span>
                        <span className="text-slate-700 font-normal">{db.luasBangunanBaru} m²</span>
                      </>
                    )}

                    {db.sertifikatBaru && (
                      <>
                        <span className="text-slate-500 font-normal">Sertifikat</span>
                        <span className="text-slate-400 font-normal">:</span>
                        <span className="text-slate-700 font-normal uppercase">{db.sertifikatBaru}</span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Floating Sticky Action Footer */}
        <div className="sticky bottom-4 z-30 bg-white/95 backdrop-blur-md p-4 rounded-md border border-slate-200/90 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none mt-4 animate-slideUp font-sans">
          <div className="text-[13px] text-slate-500 font-normal flex items-center gap-1.5 font-sans">
            {selectedPermohonan.status === "ARCHIVED" && (
              <span>
                {!isAllPecahanVerified
                  ? `⚠️ Harap verifikasi seluruh ${
                      isMutasiSebagian ? "pecahan" : "objek baru"
                    } (${verifiedCount}/${totalPecahanCount}) untuk mengaktifkan tombol penyelesaian.`
                  : `✓ Seluruh ${
                      isMutasiSebagian ? "pecahan" : "objek baru"
                    } terverifikasi! Klik tombol untuk menandai layanan PBB selesai.`}
              </span>
            )}
            {selectedPermohonan.status === "COMPLETED" && (
              <span>* Klik tombol jika perlu membatal-selesaikan berkas.</span>
            )}
          </div>

          <div className="flex items-center gap-2 justify-end shrink-0 font-sans">
            {selectedPermohonan.status === "ARCHIVED" && (
              <button
                onClick={() => onComplete(selectedPermohonan.id, selectedPermohonan.nomorPermohonan)}
                disabled={loading || selectedPermohonan.permintaanKoreksi?.length > 0 || !isAllPecahanVerified}
                className="flex items-center gap-1.5 py-2.5 px-4 text-[13px] font-normal text-white bg-[#00a389] hover:bg-[#008f78] active:scale-95 rounded-md shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-sans"
                title={
                  !isAllPecahanVerified
                    ? `Harap verifikasi seluruh (${totalPecahanCount}) pecahan objek di Data Baru terlebih dahulu`
                    : ""
                }
              >
                Tandai Selesai {!isAllPecahanVerified && `(${verifiedCount}/${totalPecahanCount})`}
              </button>
            )}

            {selectedPermohonan.status === "COMPLETED" && (
              <button
                onClick={onOpenRollbackModal}
                disabled={loading || selectedPermohonan.permintaanKoreksi?.length > 0}
                className="flex items-center gap-1.5 py-2.5 px-4.5 text-[13px] font-normal text-white bg-rose-600 hover:bg-rose-700 active:scale-95 rounded-md shadow-3xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-sans"
              >
                Batal Selesai
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

MonitorPermohonanDetailPanel.displayName = "MonitorPermohonanDetailPanel";
