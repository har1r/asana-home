"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, FileText, Phone, Calendar, Copy, Check } from 'lucide-react';

interface DetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRequest: any;
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

const toTitleCase = (str: string) => {
  if (!str) return '';
  return str.replace(/_/g, ' ').toUpperCase();
};

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
      className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-white/20 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient Header */}
        <div className="relative bg-gradient-to-br from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] px-6 pt-5 pb-6 select-none overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full bg-white/10" />
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="bg-white/25 rounded-lg p-1.5 shrink-0">
                <FileText className="w-3.5 h-3.5 text-[#2c333f]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] font-extrabold text-[#2c333f]/60 tracking-widest capitalize leading-none mb-1">Detail Permohonan</span>
                <span className="text-sm font-extrabold text-[#2c333f] font-mono tracking-tight truncate leading-none">
                  {selectedRequest.nomorPelayanan || selectedRequest.nomorPermohonan}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="bg-white/25 hover:bg-white/40 text-[#2c333f] p-1.5 rounded-xl transition-all cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-5 flex flex-col gap-4 bg-[#f3f6f9]">

          {/* Section 1: Data Utama */}
          <div className="flex flex-col gap-4 p-5 rounded-2xl bg-[#f3f6f9] shadow-3xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-1 select-none">
              <h4 className="text-xs font-extrabold text-indigo-700 capitalize tracking-widest">1. Data Utama</h4>
              <div className="flex items-center gap-1.5">
                {(() => {
                  const s = selectedRequest.status;
                  const cfg: Record<string, { bg: string; text: string; dot: string }> = {
                    SUBMITTED: { bg: 'bg-sky-100', text: 'text-sky-700', dot: 'bg-sky-500' },
                    REVISION: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
                    BUNDLED: { bg: 'bg-violet-100', text: 'text-violet-700', dot: 'bg-violet-500' },
                    ARCHIVED: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
                    COMPLETED: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
                    REJECTED: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
                  };
                  const c = cfg[s] ?? cfg.SUBMITTED;
                  return (
                    <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded-full capitalize ${c.bg} ${c.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />{s.toLowerCase()}
                    </span>
                  );
                })()}
                <span className="inline-flex items-center text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 capitalize">
                  {selectedRequest.jenisPermohonan?.replace(/_/g, ' ').toLowerCase()}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider pl-1">Jenis Layanan Permohonan</label>
              <input
                type="text"
                value={(selectedRequest.jenisPermohonan?.replace(/_/g, ' ') || '').toUpperCase()}
                readOnly
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-855 shadow-3xs cursor-default outline-none uppercase"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider pl-1">No. Pelayanan</label>
              <div className="relative">
                <input
                  type="text"
                  value={selectedRequest.nomorPelayanan || ''}
                  readOnly
                  className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl px-3.5 pr-10 py-2.5 text-gray-805 shadow-3xs cursor-default outline-none font-mono"
                />
                {selectedRequest.nomorPelayanan && (
                  <button
                    onClick={(e) => handleCopy(e, selectedRequest.nomorPelayanan)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-indigo-650 transition-all cursor-pointer flex items-center justify-center w-6 h-6 select-none"
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
                <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider pl-1">Tanggal Nopel</label>
                <input
                  type="text"
                  value={selectedRequest.tanggalNoPelayanan ? new Date(selectedRequest.tanggalNoPelayanan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase() : '—'}
                  readOnly
                  className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-gray-805 shadow-3xs cursor-default outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider pl-1">Tanggal Selesai</label>
                <input
                  type="text"
                  value={selectedRequest.tanggalPenyelesaian ? new Date(selectedRequest.tanggalPenyelesaian).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase() : '—'}
                  readOnly
                  className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-gray-805 shadow-3xs cursor-default outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider pl-1">Nomor Objek Pajak (NOP)</label>
                <div className="relative font-mono">
                  <input
                    type="text"
                    value={formatNop(selectedRequest.nop || '')}
                    readOnly
                    className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl px-3.5 pr-10 py-2.5 text-indigo-700 shadow-3xs cursor-default outline-none"
                  />
                  {selectedRequest.nop && (
                    <button
                      onClick={(e) => handleCopy(e, formatNop(selectedRequest.nop))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-indigo-650 transition-all cursor-pointer flex items-center justify-center w-6 h-6 select-none"
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
                <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider pl-1">Nomor WhatsApp WP</label>
                <div className="relative font-mono">
                  <Phone className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={selectedRequest.noWhatsapp || ''}
                    readOnly
                    className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl pl-9 pr-20 py-2.5 text-indigo-650 shadow-3xs cursor-default outline-none"
                  />
                  {selectedRequest.noWhatsapp && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 select-none">
                      <button
                        onClick={(e) => handleCopy(e, selectedRequest.noWhatsapp)}
                        className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-indigo-650 transition-all cursor-pointer flex items-center justify-center w-6 h-6"
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
                        className="px-2 py-0.5 text-[9px] font-extrabold text-[#075e54] bg-[#dcf8c6] hover:bg-[#128c7e] hover:text-white rounded-md transition-all flex items-center gap-0.5 cursor-pointer"
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
            <div className="flex flex-col gap-4 p-5 rounded-2xl bg-[#f3f6f9] shadow-3xs">
              <h4 className="text-xs font-extrabold text-indigo-700 capitalize tracking-widest border-b border-slate-100 pb-1.5 mb-1 select-none">
                2. Data Lama (Asal)
              </h4>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider pl-1">Nama Pemilik</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={toTitleCase(selectedRequest.namaPemilikLama || '')}
                      readOnly
                      className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl px-3.5 pr-10 py-2.5 text-gray-855 shadow-3xs cursor-default outline-none"
                    />
                    <button
                      onClick={(e) => handleCopy(e, toTitleCase(selectedRequest.namaPemilikLama))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-indigo-650 transition-all cursor-pointer flex items-center justify-center w-6 h-6 select-none"
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
                  <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider pl-1">Alamat Pemilik</label>
                  <input
                    type="text"
                    value={toTitleCase(selectedRequest.alamatPemilikLama || '')}
                    readOnly
                    className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-gray-805 shadow-3xs cursor-default outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider pl-1">Kecamatan Pemilik</label>
                    <input
                      type="text"
                      value={toTitleCase(selectedRequest.kecamatanPemilikLama || '')}
                      readOnly
                      className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-gray-855 shadow-3xs cursor-default outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider pl-1">Desa Pemilik</label>
                    <input
                      type="text"
                      value={toTitleCase(selectedRequest.desaPemilikLama || '')}
                      readOnly
                      className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-gray-855 shadow-3xs cursor-default outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider pl-1">Alamat Objek</label>
                  <input
                    type="text"
                    value={toTitleCase(selectedRequest.alamatObjekLama || '')}
                    readOnly
                    className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-gray-855 shadow-3xs cursor-default outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider pl-1">Kecamatan Objek</label>
                    <input
                      type="text"
                      value={toTitleCase(selectedRequest.kecamatanObjekLama || '')}
                      readOnly
                      className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-gray-855 shadow-3xs cursor-default outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider pl-1">Desa Objek</label>
                    <input
                      type="text"
                      value={toTitleCase(selectedRequest.desaObjekLama || '')}
                      readOnly
                      className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-gray-855 shadow-3xs cursor-default outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider pl-1">Luas Tanah</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={selectedRequest.luasTanahLama !== null && selectedRequest.luasTanahLama !== undefined ? String(selectedRequest.luasTanahLama) : ''}
                        readOnly
                        className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl pl-3.5 pr-10 py-2.5 text-gray-855 shadow-3xs cursor-default outline-none"
                      />
                      <span className="text-slate-400 text-[10px] font-bold absolute right-3.5 top-1/2 -translate-y-1/2 select-none">
                        m²
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider pl-1">Luas Bangunan</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={selectedRequest.luasBangunanLama !== null && selectedRequest.luasBangunanLama !== undefined ? String(selectedRequest.luasBangunanLama) : ''}
                        readOnly
                        className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl pl-3.5 pr-10 py-2.5 text-gray-855 shadow-3xs cursor-default outline-none"
                      />
                      <span className="text-slate-400 text-[10px] font-bold absolute right-3.5 top-1/2 -translate-y-1/2 select-none">
                        m²
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider pl-1">No/Jenis Sertifikat</label>
                  <input
                    type="text"
                    value={(selectedRequest.sertifikatLama || '').toUpperCase()}
                    readOnly
                    className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-gray-805 shadow-3xs cursor-default outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Data Baru */}
          {selectedRequest.dataBaru && selectedRequest.dataBaru.length > 0 && (
            <div className="flex flex-col gap-4 p-5 rounded-2xl bg-[#f3f6f9] shadow-3xs">
              <h4 className="text-xs font-extrabold text-indigo-700 capitalize tracking-widest border-b border-slate-100 pb-1.5 mb-1 select-none">
                3. Data Baru
              </h4>
              <div className="flex flex-col gap-6">
                {selectedRequest.dataBaru.map((db: any, index: number) => (
                  <div
                    key={db.id || index}
                    className={`flex flex-col gap-4 relative ${selectedRequest.dataBaru.length > 1
                      ? 'p-5 border border-slate-200 rounded-2xl shadow-3xs bg-transparent'
                      : ''
                      }`}
                  >
                    {selectedRequest.jenisPermohonan === 'MUTASI_SEBAGIAN' && (
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 select-none">
                        <span className="text-[10px] font-extrabold text-indigo-650 capitalize tracking-wider">Pemilik Baru #{index + 1}</span>
                      </div>
                    )}

                    <div className="flex flex-col gap-4 mt-2">
                      {/* 1. Nama Pemilik */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider pl-1">Nama Pemilik</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={toTitleCase(db.namaPemilikBaru || '')}
                            readOnly
                            className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl px-3.5 pr-10 py-2.5 text-gray-855 shadow-3xs cursor-default outline-none"
                          />
                          <button
                            onClick={(e) => handleCopy(e, toTitleCase(db.namaPemilikBaru || ''))}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-indigo-655 transition-all cursor-pointer flex items-center justify-center w-6 h-6 select-none"
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
                        <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider pl-1">Alamat Pemilik</label>
                        <input
                          type="text"
                          value={toTitleCase(db.alamatPemilikBaru || '')}
                          readOnly
                          className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-gray-855 shadow-3xs cursor-default outline-none"
                        />
                      </div>

                      {/* 3. Kecamatan & Desa Pemilik */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider pl-1">Kecamatan Pemilik</label>
                          <input
                            type="text"
                            value={toTitleCase(db.kecamatanPemilikBaru || '')}
                            readOnly
                            className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-gray-855 shadow-3xs cursor-default outline-none"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider pl-1">Desa Pemilik</label>
                          <input
                            type="text"
                            value={toTitleCase(db.desaPemilikBaru || '')}
                            readOnly
                            className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-gray-855 shadow-3xs cursor-default outline-none"
                          />
                        </div>
                      </div>

                      {/* 4. Alamat Objek */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider pl-1">Alamat Objek</label>
                        <input
                          type="text"
                          value={toTitleCase(db.alamatObjekBaru || '')}
                          readOnly
                          className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-gray-855 shadow-3xs cursor-default outline-none"
                        />
                      </div>

                      {/* 5. Kecamatan & Desa Objek */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider pl-1">Kecamatan Objek</label>
                          <input
                            type="text"
                            value={toTitleCase(db.kecamatanObjekBaru || '')}
                            readOnly
                            className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-gray-855 shadow-3xs cursor-default outline-none"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider pl-1">Desa Objek</label>
                          <input
                            type="text"
                            value={toTitleCase(db.desaObjekBaru || '')}
                            readOnly
                            className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-gray-855 shadow-3xs cursor-default outline-none"
                          />
                        </div>
                      </div>

                      {/* 6. Luas Tanah & Luas Bangunan */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider pl-1">Luas Tanah</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={db.luasTanahBaru !== null && db.luasTanahBaru !== undefined ? String(db.luasTanahBaru) : ''}
                              readOnly
                              className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl pl-3.5 pr-10 py-2.5 text-gray-855 shadow-3xs cursor-default outline-none"
                            />
                            <span className="text-slate-400 text-[10px] font-bold absolute right-3.5 top-1/2 -translate-y-1/2 select-none">
                              m²
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider pl-1">Luas Bangunan</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={db.luasBangunanBaru !== null && db.luasBangunanBaru !== undefined ? String(db.luasBangunanBaru) : ''}
                              readOnly
                              className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl pl-3.5 pr-10 py-2.5 text-gray-855 shadow-3xs cursor-default outline-none"
                            />
                            <span className="text-slate-400 text-[10px] font-bold absolute right-3.5 top-1/2 -translate-y-1/2 select-none">
                              m²
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 7. Nomor/Jenis Sertifikat */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider pl-1">No/Jenis Sertifikat</label>
                        <input
                          type="text"
                          value={(db.sertifikatBaru || '').toUpperCase()}
                          readOnly
                          className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-gray-855 shadow-3xs cursor-default outline-none"
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
        <div className="px-5 py-3.5 border-t border-gray-100 bg-white flex items-center justify-end gap-3 select-none">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-br from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] hover:opacity-90 text-[#2c333f] font-bold text-xs rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
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

