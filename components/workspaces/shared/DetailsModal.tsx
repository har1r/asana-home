"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, FileText, Phone, Copy, Check, CheckCircle } from 'lucide-react';
import { formatNop, toTitleCase } from './constants';

interface DetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRequest: any;
}

export const DetailsModal: React.FC<DetailsModalProps> = React.memo(({ isOpen, onClose, selectedRequest }) => {
  const [mounted, setMounted] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = useCallback((e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 1000);
  }, []);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !selectedRequest) return null;
  if (!mounted) return null;

  const appNumber = selectedRequest.applicationNumber || selectedRequest.nomorPelayanan || selectedRequest.nomorPermohonan || '-';
  const appType = selectedRequest.applicationType || selectedRequest.jenisPermohonan || '';
  const serviceDateStr = selectedRequest.serviceNumberDate || selectedRequest.tanggalNoPelayanan;
  const completionDateStr = selectedRequest.completionDate || selectedRequest.tanggalPenyelesaian;
  const previousDataList: any[] = Array.isArray(selectedRequest.previousData) && selectedRequest.previousData.length > 0
    ? selectedRequest.previousData
    : (Array.isArray(selectedRequest.dataLama) ? selectedRequest.dataLama : []);
  const targetDataList: any[] = Array.isArray(selectedRequest.targetData) && selectedRequest.targetData.length > 0
    ? selectedRequest.targetData
    : (Array.isArray(selectedRequest.dataBaru) ? selectedRequest.dataBaru : []);

  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn font-sans"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-white px-5 py-4 flex items-center justify-between gap-4 select-none border-b border-slate-200/80 font-sans">
          <div className="flex items-center gap-3 min-w-0">
            <div className="bg-[#00a389]/10 border border-[#00a389]/20 p-2 rounded-lg shrink-0 flex items-center justify-center">
              <FileText className="w-4 h-4 text-[#00a389]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-normal text-slate-500 capitalize leading-none mb-1 font-sans">
                Detail Permohonan
              </span>
              <span className="text-[13px] font-normal text-slate-900 font-mono tracking-tight truncate leading-none">
                {appNumber}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer shrink-0"
            title="Tutup Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-5 flex flex-col gap-4 bg-slate-50">

          {/* Section 1: Data Utama */}
          <div className="flex flex-col gap-4 p-4 rounded-lg bg-white border border-slate-200/90 shadow-3xs font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 select-none">
              <h4 className="text-[13px] font-normal text-slate-800 capitalize font-sans">1. Data Utama</h4>
              <div className="flex items-center gap-1.5">
                {(() => {
                  const s = selectedRequest.status;
                  const cfg: Record<string, { bg: string; text: string; border: string; label: string }> = {
                    SUBMITTED: { label: 'Diajukan', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
                    REVISION: { label: 'Revisi', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
                    BUNDLED: { label: 'Terbundel', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
                    LOCKED: { label: 'Terkunci', bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300' },
                    ARCHIVED: { label: 'Diarsipkan', bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
                    COMPLETED: { label: 'Selesai', bg: 'bg-emerald-50', text: 'text-[#008f78]', border: 'border-emerald-200' },
                    REJECTED: { label: 'Ditolak', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
                  };
                  const c = cfg[s] ?? { label: s || '-', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' };
                  return (
                    <span className={`inline-flex items-center text-[13px] font-normal px-2.5 py-0.5 rounded-full border capitalize font-sans ${c.bg} ${c.text} ${c.border}`}>
                      {c.label}
                    </span>
                  );
                })()}
                <span className="inline-flex items-center text-[13px] font-normal px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 capitalize font-sans">
                  {appType.replace(/_/g, ' ').toLowerCase()}
                </span>
              </div>
            </div>

            {selectedRequest.status === 'COMPLETED' && (
              <div className="p-2.5 bg-emerald-50/90 border border-emerald-200/90 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[12px] text-emerald-900 font-sans">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-[#008f78] shrink-0" />
                  <span>Diverifikasi Selesai Oleh: <strong className="font-semibold">{selectedRequest.pemantau?.name || 'Petugas Pemantau'}</strong></span>
                </div>
                {selectedRequest.completedAt && (
                  <div className="text-emerald-700 text-[11px] font-mono sm:text-right">
                    {new Date(selectedRequest.completedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-normal text-slate-500 capitalize font-sans pl-0.5">Jenis Layanan Permohonan</label>
                <input
                  type="text"
                  value={toTitleCase(appType)}
                  readOnly
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-[13px] font-normal text-slate-800 shadow-3xs cursor-default outline-none capitalize font-sans"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-normal text-slate-500 capitalize font-sans pl-0.5">No. Pelayanan</label>
                <div className="relative">
                  <input
                    type="text"
                    value={appNumber}
                    readOnly
                    className="w-full text-[13px] font-normal bg-slate-50 border border-slate-200 rounded-lg px-3.5 pr-10 py-2 text-slate-800 shadow-3xs cursor-default outline-none font-mono"
                  />
                  {appNumber && appNumber !== '-' && (
                    <button
                      onClick={(e) => handleCopy(e, appNumber)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-slate-200/60 text-slate-400 hover:text-[#00a389] transition-all cursor-pointer flex items-center justify-center w-6 h-6 select-none"
                      title="Salin No. Pelayanan"
                    >
                      {copiedText === appNumber ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-normal text-slate-500 capitalize font-sans pl-0.5">Tanggal Nopel</label>
                <input
                  type="text"
                  value={serviceDateStr ? new Date(serviceDateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                  readOnly
                  className="w-full text-[13px] font-normal bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-800 shadow-3xs cursor-default outline-none font-sans"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-normal text-slate-500 capitalize font-sans pl-0.5">Tanggal Selesai</label>
                <input
                  type="text"
                  value={completionDateStr ? new Date(completionDateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                  readOnly
                  className="w-full text-[13px] font-normal bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-800 shadow-3xs cursor-default outline-none font-sans"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Data SPPT Lama (previousData) */}
          {previousDataList.length > 0 && (
            <div className="flex flex-col gap-4 p-4 rounded-lg bg-white border border-slate-200/90 shadow-3xs font-sans">
              <h4 className="text-[13px] font-normal text-slate-800 capitalize font-sans border-b border-slate-100 pb-2 select-none">
                2. Data SPPT Lama (Asal)
              </h4>
              <div className="flex flex-col gap-6">
                {previousDataList.map((prevItem: any, index: number) => {
                  const nopVal = prevItem.nop ? formatNop(prevItem.nop) : '—';
                  const ownerNameVal = prevItem.ownerName || prevItem.namaPemilikLama || '—';
                  const waVal = prevItem.whatsappNumber || prevItem.noWhatsapp || '';
                  const ownerAddrVal = prevItem.ownerAddress || prevItem.alamatPemilikLama || '—';
                  const ownerKecVal = prevItem.ownerKecamatan || prevItem.kecamatanPemilikLama || '—';
                  const ownerDesaVal = prevItem.ownerDesa || prevItem.desaPemilikLama || '—';
                  const objAddrVal = prevItem.objectAddress || prevItem.alamatObjekLama || '—';
                  const objKecVal = prevItem.objectKecamatan || prevItem.kecamatanObjekLama || '—';
                  const objDesaVal = prevItem.objectDesa || prevItem.desaObjekLama || '—';
                  const landAreaVal = prevItem.landArea ?? prevItem.luasTanahLama;
                  const buildingAreaVal = prevItem.buildingArea ?? prevItem.luasBangunanLama;
                  const certVal = prevItem.certificate || prevItem.sertifikatLama || '—';
                  const notesVal = prevItem.notes || prevItem.catatan || '—';

                  return (
                    <div
                      key={prevItem.id || index}
                      className={`flex flex-col gap-4 relative ${previousDataList.length > 1
                        ? 'p-4 border border-slate-200 rounded-lg bg-slate-50/50 shadow-3xs'
                        : ''
                        }`}
                    >
                      {previousDataList.length > 1 && (
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 select-none font-sans">
                          <span className="text-[13px] font-normal text-slate-700 capitalize font-sans">Data SPPT Lama #{index + 1}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* NOP Lama */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[13px] font-normal text-slate-500 capitalize font-sans pl-0.5">Nomor Objek Pajak (NOP)</label>
                          <div className="relative font-mono">
                            <input
                              type="text"
                              value={nopVal}
                              readOnly
                              className="w-full text-[13px] font-normal bg-slate-50 border border-slate-200 rounded-lg px-3.5 pr-10 py-2 text-[#008f78] shadow-3xs cursor-default outline-none"
                            />
                            {nopVal !== '—' && (
                              <button
                                onClick={(e) => handleCopy(e, nopVal)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-slate-200/60 text-slate-400 hover:text-[#00a389] transition-all cursor-pointer flex items-center justify-center w-6 h-6 select-none"
                                title="Salin NOP"
                              >
                                {copiedText === nopVal ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* WhatsApp WP */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[13px] font-normal text-slate-500 capitalize font-sans pl-0.5">Nomor WhatsApp WP</label>
                          <div className="relative font-mono">
                            <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={waVal || '—'}
                              readOnly
                              className="w-full text-[13px] font-normal bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-20 py-2 text-slate-800 shadow-3xs cursor-default outline-none"
                            />
                            {waVal && (
                              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 select-none">
                                <button
                                  onClick={(e) => handleCopy(e, waVal)}
                                  className="p-1 rounded hover:bg-slate-200/60 text-slate-400 hover:text-[#00a389] transition-all cursor-pointer flex items-center justify-center w-6 h-6"
                                  title="Salin Nomor WhatsApp"
                                >
                                  {copiedText === waVal ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3 h-3 text-slate-400" />
                                  )}
                                </button>
                                <a
                                  href={`https://wa.me/${waVal.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2 py-0.5 text-[13px] font-normal text-emerald-800 bg-emerald-100 hover:bg-emerald-600 hover:text-white rounded-md transition-all flex items-center gap-0.5 cursor-pointer font-sans"
                                  title="Buka Chat WhatsApp"
                                >
                                  Chat WA
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Nama Pemilik */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-normal text-slate-500 capitalize font-sans pl-0.5">Nama Pemilik</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={toTitleCase(ownerNameVal)}
                            readOnly
                            className="w-full text-[13px] font-normal bg-slate-50 border border-slate-200 rounded-lg px-3.5 pr-10 py-2 text-slate-800 shadow-3xs cursor-default outline-none capitalize font-sans"
                          />
                          {ownerNameVal !== '—' && (
                            <button
                              onClick={(e) => handleCopy(e, toTitleCase(ownerNameVal))}
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-slate-200/60 text-slate-400 hover:text-[#00a389] transition-all cursor-pointer flex items-center justify-center w-6 h-6 select-none"
                              title="Salin Nama Pemilik"
                            >
                              {copiedText === toTitleCase(ownerNameVal) ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5 text-slate-400" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Alamat Pemilik */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-normal text-slate-500 capitalize font-sans pl-0.5">Alamat Pemilik</label>
                        <input
                          type="text"
                          value={toTitleCase(ownerAddrVal)}
                          readOnly
                          className="w-full text-[13px] font-normal bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-800 shadow-3xs cursor-default outline-none capitalize font-sans"
                        />
                      </div>

                      {/* Blok, RT, RW Pemilik */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="flex flex-col gap-1">
                          <label className="text-[12px] font-normal text-slate-500 font-sans pl-0.5">Blok Pemilik</label>
                          <input type="text" value={prevItem.ownerBlock || prevItem.blokPemilikLama || '—'} readOnly className="w-full text-[12px] bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 outline-none font-sans" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[12px] font-normal text-slate-500 font-sans pl-0.5">RT Pemilik</label>
                          <input type="text" value={prevItem.ownerRt || prevItem.rtPemilikLama || '—'} readOnly className="w-full text-[12px] bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 outline-none font-sans" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[12px] font-normal text-slate-500 font-sans pl-0.5">RW Pemilik</label>
                          <input type="text" value={prevItem.ownerRw || prevItem.rwPemilikLama || '—'} readOnly className="w-full text-[12px] bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 outline-none font-sans" />
                        </div>
                      </div>

                      {/* Kecamatan & Desa Pemilik */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[13px] font-normal text-slate-500 capitalize font-sans pl-0.5">Kecamatan Pemilik</label>
                          <input
                            type="text"
                            value={toTitleCase(ownerKecVal)}
                            readOnly
                            className="w-full text-[13px] font-normal bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-800 shadow-3xs cursor-default outline-none capitalize font-sans"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[13px] font-normal text-slate-500 capitalize font-sans pl-0.5">Desa Pemilik</label>
                          <input
                            type="text"
                            value={toTitleCase(ownerDesaVal)}
                            readOnly
                            className="w-full text-[13px] font-normal bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-800 shadow-3xs cursor-default outline-none capitalize font-sans"
                          />
                        </div>
                      </div>

                      {/* Alamat Objek */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-normal text-slate-500 capitalize font-sans pl-0.5">Alamat Objek</label>
                        <input
                          type="text"
                          value={toTitleCase(objAddrVal)}
                          readOnly
                          className="w-full text-[13px] font-normal bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-800 shadow-3xs cursor-default outline-none capitalize font-sans"
                        />
                      </div>

                      {/* Blok, RT, RW Objek */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="flex flex-col gap-1">
                          <label className="text-[12px] font-normal text-slate-500 font-sans pl-0.5">Blok Objek</label>
                          <input type="text" value={prevItem.objectBlock || prevItem.blokObjekLama || '—'} readOnly className="w-full text-[12px] bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 outline-none font-sans" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[12px] font-normal text-slate-500 font-sans pl-0.5">RT Objek</label>
                          <input type="text" value={prevItem.objectRt || prevItem.rtObjekLama || '—'} readOnly className="w-full text-[12px] bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 outline-none font-sans" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[12px] font-normal text-slate-500 font-sans pl-0.5">RW Objek</label>
                          <input type="text" value={prevItem.objectRw || prevItem.rwObjekLama || '—'} readOnly className="w-full text-[12px] bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 outline-none font-sans" />
                        </div>
                      </div>

                      {/* Kecamatan & Desa Objek */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[13px] font-normal text-slate-500 capitalize font-sans pl-0.5">Kecamatan Objek</label>
                          <input
                            type="text"
                            value={toTitleCase(objKecVal)}
                            readOnly
                            className="w-full text-[13px] font-normal bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-800 shadow-3xs cursor-default outline-none capitalize font-sans"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[13px] font-normal text-slate-500 capitalize font-sans pl-0.5">Desa Objek</label>
                          <input
                            type="text"
                            value={toTitleCase(objDesaVal)}
                            readOnly
                            className="w-full text-[13px] font-normal bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-800 shadow-3xs cursor-default outline-none capitalize font-sans"
                          />
                        </div>
                      </div>

                      {/* Luas Tanah & Luas Bangunan */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[13px] font-normal text-slate-500 capitalize font-sans pl-0.5">Luas Tanah</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={landAreaVal !== null && landAreaVal !== undefined ? String(landAreaVal) : '0'}
                              readOnly
                              className="w-full text-[13px] font-normal bg-slate-50 border border-slate-200 rounded-lg pl-3.5 pr-10 py-2 text-slate-800 shadow-3xs cursor-default outline-none font-sans"
                            />
                            <span className="text-slate-400 text-xs font-normal absolute right-3.5 top-1/2 -translate-y-1/2 select-none font-sans">
                              m²
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[13px] font-normal text-slate-500 capitalize font-sans pl-0.5">Luas Bangunan</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={buildingAreaVal !== null && buildingAreaVal !== undefined ? String(buildingAreaVal) : '0'}
                              readOnly
                              className="w-full text-[13px] font-normal bg-slate-50 border border-slate-200 rounded-lg pl-3.5 pr-10 py-2 text-slate-800 shadow-3xs cursor-default outline-none font-sans"
                            />
                            <span className="text-slate-400 text-xs font-normal absolute right-3.5 top-1/2 -translate-y-1/2 select-none font-sans">
                              m²
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Sertifikat */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-normal text-slate-500 capitalize font-sans pl-0.5">No/Jenis Sertifikat</label>
                        <input
                          type="text"
                          value={toTitleCase(certVal)}
                          readOnly
                          className="w-full text-[13px] font-normal bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-800 shadow-3xs cursor-default outline-none capitalize font-sans"
                        />
                      </div>

                      {/* Catatan / Notes */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-normal text-slate-500 capitalize font-sans pl-0.5">Catatan / Notes</label>
                        <input
                          type="text"
                          value={notesVal}
                          readOnly
                          className="w-full text-[13px] font-normal bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-800 shadow-3xs cursor-default outline-none font-sans"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        {/* Section 3: Data Baru (targetData) */}
          {targetDataList.length > 0 && (
            <div className="flex flex-col gap-4 p-4 rounded-lg bg-white border border-slate-200/90 shadow-3xs font-sans">
              <h4 className="text-[13px] font-normal text-slate-800 capitalize font-sans border-b border-slate-100 pb-2 select-none">
                3. Data Objek Pajak Baru / Target
              </h4>
              <div className="flex flex-col gap-6">
                {targetDataList.map((targetItem: any, index: number) => {
                  const nopTempVal = targetItem.nopTemporary ? formatNop(targetItem.nopTemporary) : '—';
                  const ownerNameVal = targetItem.ownerName || targetItem.namaPemilikBaru || '—';
                  const waVal = targetItem.whatsappNumber || targetItem.noWhatsapp || '';
                  const ownerAddrVal = targetItem.ownerAddress || targetItem.alamatPemilikBaru || '—';
                  const ownerKecVal = targetItem.ownerKecamatan || targetItem.kecamatanPemilikBaru || '—';
                  const ownerDesaVal = targetItem.ownerDesa || targetItem.desaPemilikBaru || '—';
                  const objAddrVal = targetItem.objectAddress || targetItem.alamatObjekBaru || '—';
                  const objKecVal = targetItem.objectKecamatan || targetItem.kecamatanObjekBaru || '—';
                  const objDesaVal = targetItem.objectDesa || targetItem.desaObjekBaru || '—';
                  const landAreaVal = targetItem.landArea ?? targetItem.luasTanahBaru;
                  const buildingAreaVal = targetItem.buildingArea ?? targetItem.luasBangunanBaru;
                  const certVal = targetItem.certificate || targetItem.sertifikatBaru || '—';
                  const notesVal = targetItem.notes || targetItem.catatan || '—';

                  return (
                    <div
                      key={targetItem.id || index}
                      className={`flex flex-col gap-4 relative ${targetDataList.length > 1
                        ? 'p-4 border border-slate-200 rounded-lg bg-slate-50/50 shadow-3xs'
                        : ''
                        }`}
                    >
                      {targetDataList.length > 1 && (
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 select-none font-sans">
                          <span className="text-[13px] font-normal text-[#008f78] capitalize font-sans">Pemilik Baru #{index + 1}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* NOP Sementara */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[13px] font-normal text-slate-500 capitalize font-sans pl-0.5">NOP Sementara</label>
                          <div className="relative font-mono">
                            <input
                              type="text"
                              value={nopTempVal}
                              readOnly
                              className="w-full text-[13px] font-normal bg-slate-50 border border-slate-200 rounded-lg px-3.5 pr-10 py-2 text-[#008f78] shadow-3xs cursor-default outline-none"
                            />
                            {nopTempVal !== '—' && (
                              <button
                                onClick={(e) => handleCopy(e, nopTempVal)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-slate-200/60 text-slate-400 hover:text-[#00a389] transition-all cursor-pointer flex items-center justify-center w-6 h-6 select-none"
                                title="Salin NOP Sementara"
                              >
                                {copiedText === nopTempVal ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* WhatsApp WP */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[13px] font-normal text-slate-500 capitalize font-sans pl-0.5">Nomor WhatsApp WP</label>
                          <div className="relative font-mono">
                            <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={waVal || '—'}
                              readOnly
                              className="w-full text-[13px] font-normal bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-20 py-2 text-slate-800 shadow-3xs cursor-default outline-none"
                            />
                            {waVal && (
                              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 select-none">
                                <button
                                  onClick={(e) => handleCopy(e, waVal)}
                                  className="p-1 rounded hover:bg-slate-200/60 text-slate-400 hover:text-[#00a389] transition-all cursor-pointer flex items-center justify-center w-6 h-6"
                                  title="Salin Nomor WhatsApp"
                                >
                                  {copiedText === waVal ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3 h-3 text-slate-400" />
                                  )}
                                </button>
                                <a
                                  href={`https://wa.me/${waVal.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2 py-0.5 text-[13px] font-normal text-emerald-800 bg-emerald-100 hover:bg-emerald-600 hover:text-white rounded-md transition-all flex items-center gap-0.5 cursor-pointer font-sans"
                                  title="Buka Chat WhatsApp"
                                >
                                  Chat WA
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Nama Pemilik Baru */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-normal text-slate-500 capitalize font-sans pl-0.5">Nama Pemilik Baru</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={toTitleCase(ownerNameVal)}
                            readOnly
                            className="w-full text-[13px] font-normal bg-slate-50 border border-slate-200 rounded-lg px-3.5 pr-10 py-2 text-slate-800 shadow-3xs cursor-default outline-none capitalize font-sans"
                          />
                          {ownerNameVal !== '—' && (
                            <button
                              onClick={(e) => handleCopy(e, toTitleCase(ownerNameVal))}
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-slate-200/60 text-slate-400 hover:text-[#00a389] transition-all cursor-pointer flex items-center justify-center w-6 h-6 select-none"
                              title="Salin Nama Pemilik"
                            >
                              {copiedText === toTitleCase(ownerNameVal) ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5 text-slate-400" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Alamat Pemilik Baru */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-normal text-slate-500 capitalize font-sans pl-0.5">Alamat Pemilik Baru</label>
                        <input
                          type="text"
                          value={toTitleCase(ownerAddrVal)}
                          readOnly
                          className="w-full text-[13px] font-normal bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-800 shadow-3xs cursor-default outline-none capitalize font-sans"
                        />
                      </div>

                      {/* Blok, RT, RW Pemilik */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="flex flex-col gap-1">
                          <label className="text-[12px] font-normal text-slate-500 font-sans pl-0.5">Blok Pemilik</label>
                          <input type="text" value={targetItem.ownerBlock || targetItem.blokPemilikBaru || '—'} readOnly className="w-full text-[12px] bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 outline-none font-sans" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[12px] font-normal text-slate-500 font-sans pl-0.5">RT Pemilik</label>
                          <input type="text" value={targetItem.ownerRt || targetItem.rtPemilikBaru || '—'} readOnly className="w-full text-[12px] bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 outline-none font-sans" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[12px] font-normal text-slate-500 font-sans pl-0.5">RW Pemilik</label>
                          <input type="text" value={targetItem.ownerRw || targetItem.rwPemilikBaru || '—'} readOnly className="w-full text-[12px] bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 outline-none font-sans" />
                        </div>
                      </div>

                      {/* Kecamatan & Desa Pemilik */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[13px] font-normal text-slate-500 capitalize font-sans pl-0.5">Kecamatan Pemilik</label>
                          <input
                            type="text"
                            value={toTitleCase(ownerKecVal)}
                            readOnly
                            className="w-full text-[13px] font-normal bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-800 shadow-3xs cursor-default outline-none capitalize font-sans"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[13px] font-normal text-slate-500 capitalize font-sans pl-0.5">Desa Pemilik</label>
                          <input
                            type="text"
                            value={toTitleCase(ownerDesaVal)}
                            readOnly
                            className="w-full text-[13px] font-normal bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-800 shadow-3xs cursor-default outline-none capitalize font-sans"
                          />
                        </div>
                      </div>

                      {/* Alamat Objek */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-normal text-slate-500 capitalize font-sans pl-0.5">Alamat Objek Baru</label>
                        <input
                          type="text"
                          value={toTitleCase(objAddrVal)}
                          readOnly
                          className="w-full text-[13px] font-normal bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-800 shadow-3xs cursor-default outline-none capitalize font-sans"
                        />
                      </div>

                      {/* Blok, RT, RW Objek */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="flex flex-col gap-1">
                          <label className="text-[12px] font-normal text-slate-500 font-sans pl-0.5">Blok Objek</label>
                          <input type="text" value={targetItem.objectBlock || targetItem.blokObjekBaru || '—'} readOnly className="w-full text-[12px] bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 outline-none font-sans" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[12px] font-normal text-slate-500 font-sans pl-0.5">RT Objek</label>
                          <input type="text" value={targetItem.objectRt || targetItem.rtObjekBaru || '—'} readOnly className="w-full text-[12px] bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 outline-none font-sans" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[12px] font-normal text-slate-500 font-sans pl-0.5">RW Objek</label>
                          <input type="text" value={targetItem.objectRw || targetItem.rwObjekBaru || '—'} readOnly className="w-full text-[12px] bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 outline-none font-sans" />
                        </div>
                      </div>

                      {/* Kecamatan & Desa Objek */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[13px] font-normal text-slate-500 capitalize font-sans pl-0.5">Kecamatan Objek</label>
                          <input
                            type="text"
                            value={toTitleCase(objKecVal)}
                            readOnly
                            className="w-full text-[13px] font-normal bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-800 shadow-3xs cursor-default outline-none capitalize font-sans"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[13px] font-normal text-slate-500 capitalize font-sans pl-0.5">Desa Objek</label>
                          <input
                            type="text"
                            value={toTitleCase(objDesaVal)}
                            readOnly
                            className="w-full text-[13px] font-normal bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-800 shadow-3xs cursor-default outline-none capitalize font-sans"
                          />
                        </div>
                      </div>

                      {/* Luas Tanah & Luas Bangunan */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[13px] font-normal text-slate-500 capitalize font-sans pl-0.5">Luas Tanah Baru</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={landAreaVal !== null && landAreaVal !== undefined ? String(landAreaVal) : '0'}
                              readOnly
                              className="w-full text-[13px] font-normal bg-slate-50 border border-slate-200 rounded-lg pl-3.5 pr-10 py-2 text-slate-800 shadow-3xs cursor-default outline-none font-sans"
                            />
                            <span className="text-slate-400 text-xs font-normal absolute right-3.5 top-1/2 -translate-y-1/2 select-none font-sans">
                              m²
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[13px] font-normal text-slate-500 capitalize font-sans pl-0.5">Luas Bangunan Baru</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={buildingAreaVal !== null && buildingAreaVal !== undefined ? String(buildingAreaVal) : '0'}
                              readOnly
                              className="w-full text-[13px] font-normal bg-slate-50 border border-slate-200 rounded-lg pl-3.5 pr-10 py-2 text-slate-800 shadow-3xs cursor-default outline-none font-sans"
                            />
                            <span className="text-slate-400 text-xs font-normal absolute right-3.5 top-1/2 -translate-y-1/2 select-none font-sans">
                              m²
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Sertifikat */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-normal text-slate-500 capitalize font-sans pl-0.5">No/Jenis Sertifikat Baru</label>
                        <input
                          type="text"
                          value={toTitleCase(certVal)}
                          readOnly
                          className="w-full text-[13px] font-normal bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-800 shadow-3xs cursor-default outline-none capitalize font-sans"
                        />
                      </div>

                      {/* Catatan / Notes */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-normal text-slate-500 capitalize font-sans pl-0.5">Catatan / Notes</label>
                        <input
                          type="text"
                          value={notesVal}
                          readOnly
                          className="w-full text-[13px] font-normal bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-800 shadow-3xs cursor-default outline-none font-sans"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-white flex items-center justify-end gap-3 select-none font-sans">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#00a389] hover:bg-[#008f78] text-white font-normal text-[13px] rounded-md shadow-3xs transition-all cursor-pointer font-sans capitalize"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
});

DetailsModal.displayName = 'DetailsModal';
