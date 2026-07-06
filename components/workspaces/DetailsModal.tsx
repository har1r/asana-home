"use client";

import React from 'react';
import { X, FileText, Phone, Calendar } from 'lucide-react';

interface DetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRequest: any;
}

const formatNop = (nop: string) => {
  if (!nop || nop.length !== 18) return nop;
  return `${nop.slice(0, 2)}.${nop.slice(2, 4)}.${nop.slice(4, 7)}.${nop.slice(7, 10)}.${nop.slice(10, 13)}-${nop.slice(13, 17)}.${nop.slice(17)}`;
};

export const DetailsModal: React.FC<DetailsModalProps> = React.memo(({ isOpen, onClose, selectedRequest }) => {
  if (!isOpen || !selectedRequest) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-white/20 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient Header — compact: ikon + label + nomor + tutup */}
        <div className="relative bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] px-6 py-4 select-none overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-6 -left-4 w-20 h-20 rounded-full bg-white/10" />
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="bg-white/25 rounded-lg p-1.5 shrink-0">
                <FileText className="w-3.5 h-3.5 text-[#2c333f]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] font-extrabold text-[#2c333f]/60 tracking-widest capitalize">Detail Permohonan</span>
                <span className="text-sm font-extrabold text-[#2c333f] font-mono tracking-tight truncate">
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
          <div className="bg-white rounded-2xl p-4 flex flex-col gap-3 shadow-3xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-[10px] font-extrabold text-indigo-600 capitalize tracking-widest select-none">Data Utama</h4>
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
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider">No. Pelayanan</span>
                <span className="text-xs font-semibold text-slate-800">{selectedRequest.nomorPelayanan || "—"}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider">No. Permohonan</span>
                <span className="text-xs font-semibold text-slate-800 font-mono">{selectedRequest.nomorPermohonan}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider">NOP Objek Pajak</span>
                <span className="text-xs font-semibold text-indigo-700 font-mono tracking-tight">{formatNop(selectedRequest.nop)}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider">No. WhatsApp WP</span>
                <span className="text-xs font-semibold text-indigo-600 font-mono flex items-center gap-1">
                  <Phone className="w-3 h-3 shrink-0" />{selectedRequest.noWhatsapp}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider">Tanggal Pelayanan</span>
                <span className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                  {selectedRequest.tanggalNoPelayanan
                    ? new Date(selectedRequest.tanggalNoPelayanan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                    : "—"}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider">Tanggal Penyelesaian</span>
                <span className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                  {selectedRequest.tanggalPenyelesaian
                    ? new Date(selectedRequest.tanggalPenyelesaian).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                    : "—"}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider">Tanggal Input</span>
                <span className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                  {new Date(selectedRequest.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Data Lama */}
          {selectedRequest.namaPemilikLama && (
            <div className="bg-white rounded-2xl p-4 flex flex-col gap-3 shadow-3xs">
              <h4 className="text-[10px] font-extrabold text-indigo-600 capitalize tracking-widest border-b border-slate-100 pb-2 select-none">
                Pemilik &amp; Objek Lama
              </h4>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider">Nama Pemilik Lama</span>
                  <span className="text-xs font-semibold text-slate-800">{selectedRequest.namaPemilikLama}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider">Alamat Pemilik</span>
                  <span className="text-xs font-semibold text-slate-700">{selectedRequest.alamatPemilikLama || "—"}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider">Kecamatan Pemilik</span>
                  <span className="text-xs font-semibold text-slate-700">{selectedRequest.kecamatanPemilikLama || "—"}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider">Desa Pemilik</span>
                  <span className="text-xs font-semibold text-slate-700">{selectedRequest.desaPemilikLama || "—"}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider">Alamat Letak Objek</span>
                  <span className="text-xs font-semibold text-slate-700">{selectedRequest.alamatObjekLama || "—"}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider">Luas Tanah / Bangunan</span>
                  <span className="text-xs font-semibold text-slate-800">
                    {selectedRequest.luasTanahLama ?? 0} m² / {selectedRequest.luasBangunanLama ?? 0} m²
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider">Nomor Sertifikat</span>
                  <span className="text-xs font-semibold text-slate-700">{selectedRequest.sertifikatLama || "—"}</span>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Data Baru */}
          {selectedRequest.dataBaru && selectedRequest.dataBaru.length > 0 && (
            <div className="flex flex-col gap-3">
              <h4 className="text-[10px] font-extrabold text-indigo-600 capitalize tracking-widest px-1 select-none">
                Pemilik &amp; Objek Baru ({selectedRequest.dataBaru.length})
              </h4>
              {selectedRequest.dataBaru.map((db: any, index: number) => (
                <div key={db.id || index} className="bg-white rounded-2xl p-4 shadow-3xs flex flex-col gap-3">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <div className="w-5 h-5 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                      <span className="text-[9px] font-extrabold text-indigo-600">{index + 1}</span>
                    </div>
                    <span className="text-[10px] font-extrabold text-indigo-600 capitalize tracking-wider">Pemilik Baru #{index + 1}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider">Nama Pemilik Baru</span>
                      <span className="text-xs font-semibold text-slate-800">{db.namaPemilikBaru}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider">Alamat Pemilik</span>
                      <span className="text-xs font-semibold text-slate-700">{db.alamatPemilikBaru}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider">Kecamatan / Desa</span>
                      <span className="text-xs font-semibold text-slate-700">{db.kecamatanPemilikBaru} / {db.desaPemilikBaru}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider">Alamat Objek Baru</span>
                      <span className="text-xs font-semibold text-slate-700">{db.alamatObjekBaru}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider">Luas Tanah / Bangunan</span>
                      <span className="text-xs font-semibold text-slate-800">{db.luasTanahBaru} m² / {db.luasBangunanBaru} m²</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider">Nomor Sertifikat Baru</span>
                      <span className="text-xs font-semibold text-slate-700">{db.sertifikatBaru}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-gray-100 bg-white flex items-center justify-end gap-3 select-none">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] hover:opacity-90 text-[#2c333f] font-bold text-xs rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
});

DetailsModal.displayName = 'DetailsModal';
