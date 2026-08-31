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

  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Aligned with Sidebar & Header clean UI design system */}
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
                {selectedRequest.nomorPelayanan || selectedRequest.nomorPermohonan}
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
                  const c = cfg[s] ?? { label: s, bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' };
                  return (
                    <span className={`inline-flex items-center text-[13px] font-normal px-2.5 py-0.5 rounded-full border capitalize font-sans ${c.bg} ${c.text} ${c.border}`}>
                      {c.label}
                    </span>
                  );
                })()}
                <span className="inline-flex items-center text-[13px] font-normal px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 capitalize font-sans">
                  {selectedRequest.jenisPermohonan?.replace(/_/g, ' ').toLowerCase()}
                </span>
              </div>

              {selectedRequest.status === 'COMPLETED' && (
                <div className="mt-1 p-2.5 bg-emerald-50/90 border border-emerald-200/90 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[12px] text-emerald-900 font-sans">
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
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-normal text-slate-500 capitalize font-sans pl-0.5">Jenis Layanan Permohonan</label>
              <input
                type="text"
                value={toTitleCase(selectedRequest.jenisPermohonan || '')}
                readOnly
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-[13px] font-normal text-slate-800 shadow-3xs cursor-default outline-none capitalize font-sans"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-normal text-slate-500 capitalize font-sans pl-0.5">No. Pelayanan</label>
              <div className="relative">
                <input
                  type="text"
                  value={selectedRequest.nomorPelayanan || ''}
                  readOnly
                  className="w-full text-[13px] font-normal bg-slate-50 border border-slate-200 rounded-lg px-3.5 pr-10 py-2 text-slate-800 shadow-3xs cursor-default outline-none font-mono"
                />
                {selectedRequest.nomorPelayanan && (
                  <button
                    onClick={(e) => handleCopy(e, selectedRequest.nomorPelayanan)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-slate-200/60 text-slate-400 hover:text-[#00a389] transition-all cursor-pointer flex items-center justify-center w-6 h-6 select-none"
                    title="Salin No. Pelayanan"
                  >
                    {copiedText === selectedRequest.nomorPelayanan ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-normal text-slate-500 capitalize font-sans pl-0.5">Tanggal Nopel</label>
                <input
                  type="text"
                  value={selectedRequest.tanggalNoPelayanan ? new Date(selectedRequest.tanggalNoPelayanan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                  readOnly
                  className="w-full text-[13px] font-normal bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-800 shadow-3xs cursor-default outline-none font-sans"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-normal text-slate-500 capitalize font-sans pl-0.5">Tanggal Selesai</label>
                <input
                  type="text"
                  value={selectedRequest.tanggalPenyelesaian ? new Date(selectedRequest.tanggalPenyelesaian).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                  readOnly
                  className="w-full text-[13px] font-normal bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-800 shadow-3xs cursor-default outline-none font-sans"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-normal text-slate-500 capitalize font-sans pl-0.5">Nomor Objek Pajak (NOP)</label>
                <div className="relative font-mono">
                  <input
                    type="text"
                    value={formatNop(selectedRequest.nop || '')}
                    readOnly
                    className="w-full text-[13px] font-normal bg-slate-50 border border-slate-200 rounded-lg px-3.5 pr-10 py-2 text-[#008f78] shadow-3xs cursor-default outline-none"
                  />
                  {selectedRequest.nop && (
                    <button
                      onClick={(e) => handleCopy(e, formatNop(selectedRequest.nop))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-slate-200/60 text-slate-400 hover:text-[#00a389] transition-all cursor-pointer flex items-center justify-center w-6 h-6 select-none"
                      title="Salin NOP Objek Pajak"
                    >
                      {copiedText === formatNop(selectedRequest.nop) ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-normal text-slate-500 capitalize font-sans pl-0.5">Nomor WhatsApp WP</label>
                <div className="relative font-mono">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={selectedRequest.noWhatsapp || ''}
                    readOnly
                    className="w-full text-[13px] font-normal bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-20 py-2 text-slate-800 shadow-3xs cursor-default outline-none"
                  />
                  {selectedRequest.noWhatsapp && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 select-none">
                      <button
                        onClick={(e) => handleCopy(e, selectedRequest.noWhatsapp)}
                        className="p-1 rounded hover:bg-slate-200/60 text-slate-400 hover:text-[#00a389] transition-all cursor-pointer flex items-center justify-center w-6 h-6"
                        title="Salin Nomor WhatsApp"
                      >
                        {copiedText === selectedRequest.noWhatsapp ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3 text-slate-400" />
                        )}
                      </button>
                      <a
                        href={`https://wa.me/${selectedRequest.noWhatsapp}`}
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
          </div>

          {/* Section 2: Data Lama */}
          {selectedRequest.namaPemilikLama && (
            <div className="flex flex-col gap-4 p-4 rounded-lg bg-white border border-slate-200/90 shadow-3xs font-sans">
              <h4 className="text-[13px] font-normal text-slate-800 capitalize font-sans border-b border-slate-100 pb-2 select-none">
                2. Data Lama (Asal)
              </h4>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-normal text-slate-500 capitalize font-sans pl-0.5">Nama Pemilik</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={toTitleCase(selectedRequest.namaPemilikLama || '')}
                      readOnly
                      className="w-full text-[13px] font-normal bg-slate-50 border border-slate-200 rounded-lg px-3.5 pr-10 py-2 text-slate-800 shadow-3xs cursor-default outline-none capitalize font-sans"
                    />
                    <button
                      onClick={(e) => handleCopy(e, toTitleCase(selectedRequest.namaPemilikLama))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-slate-200/60 text-slate-400 hover:text-[#00a389] transition-all cursor-pointer flex items-center justify-center w-6 h-6 select-none"
                      title="Salin Nama Pemilik Lama"
                    >
                      {copiedText === toTitleCase(selectedRequest.namaPemilikLama) ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-normal text-slate-500 capitalize font-sans pl-0.5">Alamat Pemilik</label>
                  <input
                    type="text"
                    value={toTitleCase(selectedRequest.alamatPemilikLama || '')}
                    readOnly
                    className="w-full text-[13px] font-normal bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-800 shadow-3xs cursor-default outline-none capitalize font-sans"
                  />
                </div>

                {(selectedRequest.blokPemilikLama || selectedRequest.rtPemilikLama || selectedRequest.rwPemilikLama) && (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[12px] font-normal text-slate-500 font-sans pl-0.5">Blok Pemilik</label>
                      <input type="text" value={selectedRequest.blokPemilikLama || '-'} readOnly className="w-full text-[12px] bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 outline-none font-sans" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[12px] font-normal text-slate-500 font-sans pl-0.5">RT Pemilik</label>
                      <input type="text" value={selectedRequest.rtPemilikLama || '-'} readOnly className="w-full text-[12px] bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 outline-none font-sans" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[12px] font-normal text-slate-500 font-sans pl-0.5">RW Pemilik</label>
                      <input type="text" value={selectedRequest.rwPemilikLama || '-'} readOnly className="w-full text-[12px] bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 outline-none font-sans" />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-normal text-slate-500 capitalize font-sans pl-0.5">Kecamatan Pemilik</label>
                    <input
                      type="text"
                      value={toTitleCase(selectedRequest.kecamatanPemilikLama || '')}
                      readOnly
                      className="w-full text-[13px] font-normal bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-800 shadow-3xs cursor-default outline-none capitalize font-sans"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-normal text-slate-500 capitalize font-sans pl-0.5">Desa Pemilik</label>
                    <input
                      type="text"
                      value={toTitleCase(selectedRequest.desaPemilikLama || '')}
                      readOnly
                      className="w-full text-[13px] font-normal bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-800 shadow-3xs cursor-default outline-none capitalize font-sans"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-normal text-slate-500 capitalize font-sans pl-0.5">Alamat Objek</label>
                  <input
                    type="text"
                    value={toTitleCase(selectedRequest.alamatObjekLama || '')}
                    readOnly
                    className="w-full text-[13px] font-normal bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-800 shadow-3xs cursor-default outline-none capitalize font-sans"
                  />
                </div>

                {(selectedRequest.blokObjekLama || selectedRequest.rtObjekLama || selectedRequest.rwObjekLama) && (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[12px] font-normal text-slate-500 font-sans pl-0.5">Blok Objek</label>
                      <input type="text" value={selectedRequest.blokObjekLama || '-'} readOnly className="w-full text-[12px] bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 outline-none font-sans" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[12px] font-normal text-slate-500 font-sans pl-0.5">RT Objek</label>
                      <input type="text" value={selectedRequest.rtObjekLama || '-'} readOnly className="w-full text-[12px] bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 outline-none font-sans" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[12px] font-normal text-slate-500 font-sans pl-0.5">RW Objek</label>
                      <input type="text" value={selectedRequest.rwObjekLama || '-'} readOnly className="w-full text-[12px] bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 outline-none font-sans" />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-normal text-slate-500 capitalize font-sans pl-0.5">Kecamatan Objek</label>
                    <input
                      type="text"
                      value={toTitleCase(selectedRequest.kecamatanObjekLama || '')}
                      readOnly
                      className="w-full text-[13px] font-normal bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-800 shadow-3xs cursor-default outline-none capitalize font-sans"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-normal text-slate-500 capitalize font-sans pl-0.5">Desa Objek</label>
                    <input
                      type="text"
                      value={toTitleCase(selectedRequest.desaObjekLama || '')}
                      readOnly
                      className="w-full text-[13px] font-normal bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-800 shadow-3xs cursor-default outline-none capitalize font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-normal text-slate-500 capitalize font-sans pl-0.5">Luas Tanah</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={selectedRequest.luasTanahLama !== null && selectedRequest.luasTanahLama !== undefined ? String(selectedRequest.luasTanahLama) : ''}
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
                        value={selectedRequest.luasBangunanLama !== null && selectedRequest.luasBangunanLama !== undefined ? String(selectedRequest.luasBangunanLama) : ''}
                        readOnly
                        className="w-full text-[13px] font-normal bg-slate-50 border border-slate-200 rounded-lg pl-3.5 pr-10 py-2 text-slate-800 shadow-3xs cursor-default outline-none font-sans"
                      />
                      <span className="text-slate-400 text-xs font-normal absolute right-3.5 top-1/2 -translate-y-1/2 select-none font-sans">
                        m²
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-normal text-slate-500 capitalize font-sans pl-0.5">No/Jenis Sertifikat</label>
                  <input
                    type="text"
                    value={toTitleCase(selectedRequest.sertifikatLama || '')}
                    readOnly
                    className="w-full text-[13px] font-normal bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-800 shadow-3xs cursor-default outline-none capitalize font-sans"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Data Baru */}
          {selectedRequest.dataBaru && selectedRequest.dataBaru.length > 0 && (
            <div className="flex flex-col gap-4 p-4 rounded-lg bg-white border border-slate-200/90 shadow-3xs font-sans">
              <h4 className="text-[13px] font-normal text-slate-800 capitalize font-sans border-b border-slate-100 pb-2 select-none">
                3. Data Baru
              </h4>
              <div className="flex flex-col gap-6">
                {selectedRequest.dataBaru.map((db: any, index: number) => (
                  <div
                    key={db.id || index}
                    className={`flex flex-col gap-4 relative ${selectedRequest.dataBaru.length > 1
                      ? 'p-4 border border-slate-200 rounded-lg bg-slate-50/50 shadow-3xs'
                      : ''
                      }`}
                  >
                    {selectedRequest.jenisPermohonan === 'MUTASI_SEBAGIAN' && (
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 select-none font-sans">
                        <span className="text-[13px] font-normal text-[#008f78] capitalize font-sans">Pemilik Baru #{index + 1}</span>
                      </div>
                    )}

                    <div className="flex flex-col gap-4 font-sans">
                      {/* 1. Nama Pemilik */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-normal text-slate-500 capitalize font-sans pl-0.5">Nama Pemilik</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={toTitleCase(db.namaPemilikBaru || '')}
                            readOnly
                            className="w-full text-[13px] font-normal bg-slate-50 border border-slate-200 rounded-lg px-3.5 pr-10 py-2 text-slate-800 shadow-3xs cursor-default outline-none capitalize font-sans"
                          />
                          <button
                            onClick={(e) => handleCopy(e, toTitleCase(db.namaPemilikBaru || ''))}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-slate-200/60 text-slate-400 hover:text-[#00a389] transition-all cursor-pointer flex items-center justify-center w-6 h-6 select-none"
                            title="Salin Nama Pemilik"
                          >
                            {copiedText === toTitleCase(db.namaPemilikBaru || '') ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-slate-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* 2. Alamat Pemilik */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-normal text-slate-500 capitalize font-sans pl-0.5">Alamat Pemilik</label>
                        <input
                          type="text"
                          value={toTitleCase(db.alamatPemilikBaru || '')}
                          readOnly
                          className="w-full text-[13px] font-normal bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-800 shadow-3xs cursor-default outline-none capitalize font-sans"
                        />
                      </div>

                      {(db.blokPemilikBaru || db.rtPemilikBaru || db.rwPemilikBaru) && (
                        <div className="grid grid-cols-3 gap-2">
                          <div className="flex flex-col gap-1">
                            <label className="text-[12px] font-normal text-slate-500 font-sans pl-0.5">Blok Pemilik</label>
                            <input type="text" value={db.blokPemilikBaru || '-'} readOnly className="w-full text-[12px] bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 outline-none font-sans" />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[12px] font-normal text-slate-500 font-sans pl-0.5">RT Pemilik</label>
                            <input type="text" value={db.rtPemilikBaru || '-'} readOnly className="w-full text-[12px] bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 outline-none font-sans" />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[12px] font-normal text-slate-500 font-sans pl-0.5">RW Pemilik</label>
                            <input type="text" value={db.rwPemilikBaru || '-'} readOnly className="w-full text-[12px] bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 outline-none font-sans" />
                          </div>
                        </div>
                      )}

                      {/* 3. Kecamatan & Desa Pemilik */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[13px] font-normal text-slate-500 capitalize font-sans pl-0.5">Kecamatan Pemilik</label>
                          <input
                            type="text"
                            value={toTitleCase(db.kecamatanPemilikBaru || '')}
                            readOnly
                            className="w-full text-[13px] font-normal bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-800 shadow-3xs cursor-default outline-none capitalize font-sans"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[13px] font-normal text-slate-500 capitalize font-sans pl-0.5">Desa Pemilik</label>
                          <input
                            type="text"
                            value={toTitleCase(db.desaPemilikBaru || '')}
                            readOnly
                            className="w-full text-[13px] font-normal bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-800 shadow-3xs cursor-default outline-none capitalize font-sans"
                          />
                        </div>
                      </div>

                      {/* 4. Alamat Objek */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-normal text-slate-500 capitalize font-sans pl-0.5">Alamat Objek</label>
                        <input
                          type="text"
                          value={toTitleCase(db.alamatObjekBaru || '')}
                          readOnly
                          className="w-full text-[13px] font-normal bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-800 shadow-3xs cursor-default outline-none capitalize font-sans"
                        />
                      </div>

                      {(db.blokObjekBaru || db.rtObjekBaru || db.rwObjekBaru) && (
                        <div className="grid grid-cols-3 gap-2">
                          <div className="flex flex-col gap-1">
                            <label className="text-[12px] font-normal text-slate-500 font-sans pl-0.5">Blok Objek</label>
                            <input type="text" value={db.blokObjekBaru || '-'} readOnly className="w-full text-[12px] bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 outline-none font-sans" />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[12px] font-normal text-slate-500 font-sans pl-0.5">RT Objek</label>
                            <input type="text" value={db.rtObjekBaru || '-'} readOnly className="w-full text-[12px] bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 outline-none font-sans" />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[12px] font-normal text-slate-500 font-sans pl-0.5">RW Objek</label>
                            <input type="text" value={db.rwObjekBaru || '-'} readOnly className="w-full text-[12px] bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 outline-none font-sans" />
                          </div>
                        </div>
                      )}

                      {/* 5. Kecamatan & Desa Objek */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[13px] font-normal text-slate-500 capitalize font-sans pl-0.5">Kecamatan Objek</label>
                          <input
                            type="text"
                            value={toTitleCase(db.kecamatanObjekBaru || '')}
                            readOnly
                            className="w-full text-[13px] font-normal bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-800 shadow-3xs cursor-default outline-none capitalize font-sans"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[13px] font-normal text-slate-500 capitalize font-sans pl-0.5">Desa Objek</label>
                          <input
                            type="text"
                            value={toTitleCase(db.desaObjekBaru || '')}
                            readOnly
                            className="w-full text-[13px] font-normal bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-800 shadow-3xs cursor-default outline-none capitalize font-sans"
                          />
                        </div>
                      </div>

                      {/* 6. Luas Tanah & Luas Bangunan */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[13px] font-normal text-slate-500 capitalize font-sans pl-0.5">Luas Tanah</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={db.luasTanahBaru !== null && db.luasTanahBaru !== undefined ? String(db.luasTanahBaru) : ''}
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
                              value={db.luasBangunanBaru !== null && db.luasBangunanBaru !== undefined ? String(db.luasBangunanBaru) : ''}
                              readOnly
                              className="w-full text-[13px] font-normal bg-slate-50 border border-slate-200 rounded-lg pl-3.5 pr-10 py-2 text-slate-800 shadow-3xs cursor-default outline-none font-sans"
                            />
                            <span className="text-slate-400 text-xs font-normal absolute right-3.5 top-1/2 -translate-y-1/2 select-none font-sans">
                              m²
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 7. Nomor/Jenis Sertifikat */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-normal text-slate-500 capitalize font-sans pl-0.5">No/Jenis Sertifikat</label>
                        <input
                          type="text"
                          value={toTitleCase(db.sertifikatBaru || '')}
                          readOnly
                          className="w-full text-[13px] font-normal bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-800 shadow-3xs cursor-default outline-none capitalize font-sans"
                        />
                      </div>
                    </div>
                  </div>
                ))}
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
