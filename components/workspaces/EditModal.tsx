"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { X, Edit, AlertTriangle, CheckCircle, Phone, Trash2, Plus } from 'lucide-react';
import { updatePermohonan } from '@/app/actions/penginput';

interface EditModalProps {
  editTarget: any;
  onClose: () => void;
  onSuccess: () => void;
}

const JENIS_OPTIONS = [
  { value: 'MUTASI_SEBAGIAN', label: 'Mutasi Sebagian' },
  { value: 'MUTASI_HABIS_UPDATE', label: 'Mutasi Habis Update' },
  { value: 'MUTASI_HABIS_REGULER', label: 'Mutasi Habis Reguler' },
  { value: 'OBJEK_PAJAK_BARU', label: 'Objek Pajak Baru' },
  { value: 'PEMBETULAN', label: 'Pembetulan' },
  { value: 'PENGAKTIFAN', label: 'Pengaktifan' }
] as const;

const SERVICES_NEED_DATA_LAMA = [
  'MUTASI_SEBAGIAN',
  'MUTASI_HABIS_UPDATE',
  'MUTASI_HABIS_REGULER',
  'PEMBETULAN',
  'PENGAKTIFAN'
];

const SERVICES_NEED_DATA_BARU = [
  'MUTASI_SEBAGIAN',
  'MUTASI_HABIS_UPDATE',
  'MUTASI_HABIS_REGULER',
  'PEMBETULAN',
  'OBJEK_PAJAK_BARU'
];

const createEmptyDataBaruItem = () => ({
  namaPemilikBaru: '',
  alamatPemilikBaru: '',
  kecamatanPemilikBaru: '',
  desaPemilikBaru: '',
  alamatObjekBaru: '',
  kecamatanObjekBaru: '',
  desaObjekBaru: '',
  luasTanahBaru: '',
  luasBangunanBaru: '',
  sertifikatBaru: ''
});

const formatNop = (nop: string) => {
  if (!nop || nop.length !== 18) return nop;
  return `${nop.slice(0, 2)}.${nop.slice(2, 4)}.${nop.slice(4, 7)}.${nop.slice(7, 10)}.${nop.slice(10, 13)}-${nop.slice(13, 17)}.${nop.slice(17)}`;
};

export const EditModal: React.FC<EditModalProps> = React.memo(({ editTarget, onClose, onSuccess }) => {
  const [jenisPermohonan, setJenisPermohonan] = useState<string>('MUTASI_SEBAGIAN');
  const [nomorPelayanan, setNomorPelayanan] = useState('');
  const [tanggalNoPelayanan, setTanggalNoPelayanan] = useState('');
  const [tanggalPenyelesaian, setTanggalPenyelesaian] = useState('');
  const [nop, setNop] = useState('');
  const [noWhatsapp, setNoWhatsapp] = useState('');

  // Data Lama state
  const [namaPemilikLama, setNamaPemilikLama] = useState('');
  const [alamatPemilikLama, setAlamatPemilikLama] = useState('');
  const [kecamatanPemilikLama, setKecamatanPemilikLama] = useState('');
  const [desaPemilikLama, setDesaPemilikLama] = useState('');
  const [alamatObjekLama, setAlamatObjekLama] = useState('');
  const [kecamatanObjekLama, setKecamatanObjekLama] = useState('');
  const [desaObjekLama, setDesaObjekLama] = useState('');
  const [luasTanahLama, setLuasTanahLama] = useState('');
  const [luasBangunanLama, setLuasBangunanLama] = useState('');
  const [sertifikatLama, setSertifikatLama] = useState('');

  // Data Baru state
  const [dataBaru, setDataBaru] = useState<any[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync editTarget to states
  useEffect(() => {
    if (!editTarget) return;
    setJenisPermohonan(editTarget.jenisPermohonan || 'MUTASI_SEBAGIAN');
    setNomorPelayanan(editTarget.nomorPelayanan || '');

    const rawDate = editTarget.tanggalNoPelayanan ? new Date(editTarget.tanggalNoPelayanan) : null;
    setTanggalNoPelayanan(rawDate && !isNaN(rawDate.getTime()) ? rawDate.toISOString().split('T')[0] : '');

    const rawSelesaiDate = editTarget.tanggalPenyelesaian ? new Date(editTarget.tanggalPenyelesaian) : null;
    setTanggalPenyelesaian(rawSelesaiDate && !isNaN(rawSelesaiDate.getTime()) ? rawSelesaiDate.toISOString().split('T')[0] : '');

    setNop(formatNop(editTarget.nop || ''));
    setNoWhatsapp(editTarget.noWhatsapp || '');

    setNamaPemilikLama(editTarget.namaPemilikLama || '');
    setAlamatPemilikLama(editTarget.alamatPemilikLama || '');
    setKecamatanPemilikLama(editTarget.kecamatanPemilikLama || '');
    setDesaPemilikLama(editTarget.desaPemilikLama || '');
    setAlamatObjekLama(editTarget.alamatObjekLama || '');
    setKecamatanObjekLama(editTarget.kecamatanObjekLama || '');
    setDesaObjekLama(editTarget.desaObjekLama || '');
    setLuasTanahLama(editTarget.luasTanahLama !== null && editTarget.luasTanahLama !== undefined ? String(editTarget.luasTanahLama) : '');
    setLuasBangunanLama(editTarget.luasBangunanLama !== null && editTarget.luasBangunanLama !== undefined ? String(editTarget.luasBangunanLama) : '');
    setSertifikatLama(editTarget.sertifikatLama || '');

    if (editTarget.dataBaru && editTarget.dataBaru.length > 0) {
      setDataBaru(editTarget.dataBaru.map((dbItem: any) => ({
        namaPemilikBaru: dbItem.namaPemilikBaru || '',
        alamatPemilikBaru: dbItem.alamatPemilikBaru || '',
        kecamatanPemilikBaru: dbItem.kecamatanPemilikBaru || '',
        desaPemilikBaru: dbItem.desaPemilikBaru || '',
        alamatObjekBaru: dbItem.alamatObjekBaru || '',
        kecamatanObjekBaru: dbItem.kecamatanObjekBaru || '',
        desaObjekBaru: dbItem.desaObjekBaru || '',
        luasTanahBaru: dbItem.luasTanahBaru !== null && dbItem.luasTanahBaru !== undefined ? String(dbItem.luasTanahBaru) : '',
        luasBangunanBaru: dbItem.luasBangunanBaru !== null && dbItem.luasBangunanBaru !== undefined ? String(dbItem.luasBangunanBaru) : '',
        sertifikatBaru: dbItem.sertifikatBaru || ''
      })));
    } else {
      setDataBaru([createEmptyDataBaruItem()]);
    }

    setFormErrors({});
    setError('');
    setSuccess('');
  }, [editTarget]);

  // Conditional logic rules
  const needDataLama = SERVICES_NEED_DATA_LAMA.includes(jenisPermohonan);
  const needDataBaru = SERVICES_NEED_DATA_BARU.includes(jenisPermohonan);

  // Keep Data Baru length to 1 if not MUTASI_SEBAGIAN
  useEffect(() => {
    if (jenisPermohonan !== 'MUTASI_SEBAGIAN') {
      if (dataBaru.length > 1) {
        setDataBaru(prev => prev.slice(0, 1));
      }
    }
  }, [jenisPermohonan, dataBaru.length]);

  // Actions
  const handleAddOwner = useCallback(() => {
    setDataBaru(prev => [...prev, createEmptyDataBaruItem()]);
  }, []);

  const handleRemoveOwner = useCallback((index: number) => {
    setDataBaru(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleOwnerChange = useCallback((index: number, field: string, value: any) => {
    setDataBaru(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  }, []);

  const validateForm = (data: any) => {
    const errors: Record<string, string> = {};

    if (!data.nomorPelayanan || !data.nomorPelayanan.trim()) errors.nomorPelayanan = 'Nomor pelayanan wajib diisi';
    if (!data.tanggalNoPelayanan || !data.tanggalNoPelayanan.trim()) {
      errors.tanggalNoPelayanan = 'Tanggal pelayanan wajib diisi';
    }
    if (!data.tanggalPenyelesaian || !data.tanggalPenyelesaian.trim()) {
      errors.tanggalPenyelesaian = 'Tanggal penyelesaian wajib diisi';
    }
    if (!data.nop || !/^\d{18}$/.test(data.nop.replace(/[.\-]/g, ''))) errors.nop = 'NOP harus tepat 18 digit angka';
    if (!data.noWhatsapp || !/^(08|628)\d{8,12}$/.test(data.noWhatsapp)) {
      errors.noWhatsapp = 'WhatsApp tidak valid (harus diawali 08/628, min 10 digit)';
    }

    if (needDataLama) {
      if (!data.namaPemilikLama?.trim()) errors.namaPemilikLama = 'Nama pemilik lama wajib diisi';
      if (!data.alamatPemilikLama?.trim()) errors.alamatPemilikLama = 'Alamat pemilik lama wajib diisi';
      if (!data.kecamatanPemilikLama?.trim()) errors.kecamatanPemilikLama = 'Kecamatan pemilik lama wajib diisi';
      if (!data.desaPemilikLama?.trim()) errors.desaPemilikLama = 'Desa pemilik lama wajib diisi';
      if (!data.alamatObjekLama?.trim()) errors.alamatObjekLama = 'Alamat objek lama wajib diisi';
      if (!data.kecamatanObjekLama?.trim()) errors.kecamatanObjekLama = 'Kecamatan objek lama wajib diisi';
      if (!data.desaObjekLama?.trim()) errors.desaObjekLama = 'Desa objek lama wajib diisi';
      if (data.luasTanahLama === undefined || data.luasTanahLama === null || data.luasTanahLama === '' || Number(data.luasTanahLama) < 0) {
        errors.luasTanahLama = 'Luas tanah lama wajib diisi & >= 0';
      }
      if (data.luasBangunanLama === undefined || data.luasBangunanLama === null || data.luasBangunanLama === '' || Number(data.luasBangunanLama) < 0) {
        errors.luasBangunanLama = 'Luas bangunan lama wajib diisi & >= 0';
      }
      if (!data.sertifikatLama || !data.sertifikatLama.trim()) {
        errors.sertifikatLama = 'Sertifikat lama wajib diisi';
      }
    }

    if (needDataBaru) {
      if (!data.dataBaru || data.dataBaru.length === 0) {
        errors.dataBaru = 'Minimal 1 data pemilik baru wajib diisi';
      } else {
        data.dataBaru.forEach((item: any, idx: number) => {
          if (!item.namaPemilikBaru?.trim()) errors[`dataBaru.${idx}.namaPemilikBaru`] = 'Nama pemilik baru wajib diisi';
          if (!item.alamatPemilikBaru?.trim()) errors[`dataBaru.${idx}.alamatPemilikBaru`] = 'Alamat pemilik baru wajib diisi';
          if (!item.kecamatanPemilikBaru?.trim()) errors[`dataBaru.${idx}.kecamatanPemilikBaru`] = 'Kecamatan pemilik baru wajib diisi';
          if (!item.desaPemilikBaru?.trim()) errors[`dataBaru.${idx}.desaPemilikBaru`] = 'Desa pemilik baru wajib diisi';
          if (!item.alamatObjekBaru?.trim()) errors[`dataBaru.${idx}.alamatObjekBaru`] = 'Alamat objek baru wajib diisi';
          if (!item.kecamatanObjekBaru?.trim()) errors[`dataBaru.${idx}.kecamatanObjekBaru`] = 'Kecamatan objek baru wajib diisi';
          if (!item.desaObjekBaru?.trim()) errors[`dataBaru.${idx}.desaObjekBaru`] = 'Desa objek baru wajib diisi';
          if (item.luasTanahBaru === undefined || item.luasTanahBaru === null || item.luasTanahBaru === '' || Number(item.luasTanahBaru) < 0) {
            errors[`dataBaru.${idx}.luasTanahBaru`] = 'Luas tanah baru wajib diisi & >= 0';
          }
          if (item.luasBangunanBaru === undefined || item.luasBangunanBaru === null || item.luasBangunanBaru === '' || Number(item.luasBangunanBaru) < 0) {
            errors[`dataBaru.${idx}.luasBangunanBaru`] = 'Luas bangunan baru wajib diisi & >= 0';
          }
          if (!item.sertifikatBaru || !item.sertifikatBaru.trim()) {
            errors[`dataBaru.${idx}.sertifikatBaru`] = 'Sertifikat baru wajib diisi';
          }
        });
      }
    }

    return errors;
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    setError('');
    setSuccess('');

    const formData = {
      jenisPermohonan,
      nomorPelayanan,
      tanggalNoPelayanan,
      tanggalPenyelesaian: tanggalPenyelesaian || null,
      nop: nop.replace(/[.\-]/g, ''),
      noWhatsapp,
      namaPemilikLama: needDataLama ? namaPemilikLama : null,
      alamatPemilikLama: needDataLama ? alamatPemilikLama : null,
      kecamatanPemilikLama: needDataLama ? kecamatanPemilikLama : null,
      desaPemilikLama: needDataLama ? desaPemilikLama : null,
      alamatObjekLama: needDataLama ? alamatObjekLama : null,
      kecamatanObjekLama: needDataLama ? kecamatanObjekLama : null,
      desaObjekLama: needDataLama ? desaObjekLama : null,
      luasTanahLama: needDataLama && luasTanahLama !== '' ? Number(luasTanahLama) : null,
      luasBangunanLama: needDataLama && luasBangunanLama !== '' ? Number(luasBangunanLama) : null,
      sertifikatLama: needDataLama ? sertifikatLama : null,
      dataBaru: needDataBaru ? dataBaru.map(item => ({
        ...item,
        luasTanahBaru: item.luasTanahBaru !== '' ? Number(item.luasTanahBaru) : null,
        luasBangunanBaru: item.luasBangunanBaru !== '' ? Number(item.luasBangunanBaru) : null,
      })) : []
    };

    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setError('Form kurang lengkap. Harap periksa detail isian merah di bawah.');
      return;
    }
    setFormErrors({});
    setLoading(true);

    try {
      const res = await updatePermohonan(editTarget.id, formData);
      if (res.success) {
        setSuccess('Perubahan data berhasil disimpan!');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1200);
      } else {
        setError(res.error || 'Gagal mengupdate data.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  if (!editTarget) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-white/20 flex flex-col animate-scaleUp">

        {/* Gradient Header */}
        <div className="relative bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] px-6 py-4 select-none overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-6 -left-4 w-20 h-20 rounded-full bg-white/10" />
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="bg-white/25 rounded-lg p-1.5 shrink-0">
                <Edit className="w-3.5 h-3.5 text-[#2c333f]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] font-extrabold text-[#2c333f]/60 tracking-widest capitalize">Edit Permohonan</span>
                <span className="text-sm font-extrabold text-[#2c333f] font-mono tracking-tight truncate">
                  {editTarget.nomorPelayanan || editTarget.nomorPermohonan}
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

        <div className="p-6 flex flex-col gap-4">

          {error && (
            <div className="bg-red-50/80 border border-red-200 text-red-700 text-xs font-bold rounded-xl px-4 py-2.5 flex items-start gap-2 animate-fadeIn">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50/80 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl px-4 py-2.5 flex items-start gap-2 animate-fadeIn">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleUpdate} className="flex flex-col gap-4">

            {/* Scrollable Form Body Container */}
            <div className="overflow-y-auto max-h-[60vh] pr-2 flex flex-col gap-6">

              {/* EDIT PART 1: DATA UTAMA */}
              <div className="flex flex-col gap-4 p-5 rounded-2xl bg-[#f3f6f9] shadow-3xs">
                <h4 className="text-xs font-extrabold text-indigo-700 capitalize tracking-widest border-b border-slate-100 pb-1.5 mb-1">1. Data Utama</h4>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider pl-1">Jenis Layanan Permohonan</label>
                  <select
                    value={jenisPermohonan}
                    onChange={(e) => setJenisPermohonan(e.target.value)}
                    disabled={loading}
                    className="w-full text-xs font-bold bg-white border-transparent rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500 text-gray-800"
                  >
                    {JENIS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider pl-1">No. Pelayanan <span className="text-red-500"> *</span></label>
                  <input
                    type="text"
                    value={nomorPelayanan}
                    onChange={(e) => setNomorPelayanan(e.target.value)}
                    disabled={loading}
                    className={`w-full text-xs font-semibold bg-white border rounded-xl px-3 pr-4 py-2.5 transition-all text-gray-800 focus:outline-none focus:border-indigo-500 ${formErrors.nomorPelayanan ? 'border-red-500 focus:border-red-500' : 'border-transparent'
                      }`}
                  />
                  {formErrors.nomorPelayanan && <span className="text-[10px] text-red-600 font-bold pl-1">{formErrors.nomorPelayanan}</span>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider pl-1">Tanggal Pelayanan <span className="text-red-500"> *</span></label>
                    <input
                      type="date"
                      value={tanggalNoPelayanan}
                      onChange={(e) => setTanggalNoPelayanan(e.target.value)}
                      disabled={loading}
                      className={`w-full text-xs font-semibold bg-white border rounded-xl px-3 pr-4 py-2.5 transition-all text-gray-800 focus:outline-none focus:border-indigo-500 ${formErrors.tanggalNoPelayanan ? 'border-red-500 focus:border-red-500' : 'border-transparent'
                        }`}
                    />
                    {formErrors.tanggalNoPelayanan && <span className="text-[10px] text-red-600 font-bold pl-1">{formErrors.tanggalNoPelayanan}</span>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider pl-1">Tanggal Penyelesaian <span className="text-red-500"> *</span></label>
                    <input
                      type="date"
                      value={tanggalPenyelesaian}
                      onChange={(e) => setTanggalPenyelesaian(e.target.value)}
                      disabled={loading}
                      className={`w-full text-xs font-semibold bg-white border rounded-xl px-3 pr-4 py-2.5 transition-all text-gray-800 focus:outline-none focus:border-indigo-500 ${formErrors.tanggalPenyelesaian ? 'border-red-500 focus:border-red-500' : 'border-transparent'
                        }`}
                    />
                    {formErrors.tanggalPenyelesaian && <span className="text-[10px] text-red-600 font-bold pl-1">{formErrors.tanggalPenyelesaian}</span>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider pl-1">Nomor Objek Pajak (NOP) <span className="text-red-500"> *</span></label>
                    <input
                      type="text"
                      maxLength={18}
                      value={nop}
                      onChange={(e) => setNop(e.target.value.replace(/\D/g, ''))}
                      disabled={loading}
                      className={`w-full text-xs font-semibold bg-white border rounded-xl px-3 pr-4 py-2.5 transition-all text-gray-800 font-mono focus:outline-none focus:border-indigo-500 ${formErrors.nop ? 'border-red-500 focus:border-red-500' : 'border-transparent'
                        }`}
                    />
                    {formErrors.nop && <span className="text-[10px] text-red-600 font-bold pl-1">{formErrors.nop}</span>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider pl-1">Nomor WhatsApp WP <span className="text-red-500"> *</span></label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={noWhatsapp}
                        onChange={(e) => setNoWhatsapp(e.target.value.replace(/[^\d+]/g, ''))}
                        disabled={loading}
                        className={`w-full text-xs font-semibold bg-white border rounded-xl pl-10 pr-4 py-2.5 transition-all text-gray-800 focus:outline-none focus:border-indigo-500 ${formErrors.noWhatsapp ? 'border-red-500 focus:border-red-500' : 'border-transparent'
                          }`}
                      />
                    </div>
                    {formErrors.noWhatsapp && <span className="text-[10px] text-red-600 font-bold pl-1">{formErrors.noWhatsapp}</span>}
                  </div>
                </div>
              </div>

              {/* EDIT PART 2: DATA LAMA */}
              <div className="flex flex-col gap-4 p-5 rounded-2xl bg-[#f3f6f9] shadow-3xs">
                <h4 className="text-xs font-extrabold text-indigo-700 capitalize tracking-widest border-b border-slate-100 pb-1.5 mb-1">2. Data Lama (Pemilik & Objek Asal)</h4>

                {!needDataLama ? (
                  <div className="text-center py-6 text-xs text-slate-400 font-semibold bg-slate-50/50 rounded-xl border border-dashed border-slate-200 select-none">
                    Bagian ini tidak diperlukan untuk layanan objek pajak baru.
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider pl-1">Nama Pemilik Lama <span className="text-red-500"> *</span></label>
                      <input
                        type="text"
                        value={namaPemilikLama}
                        onChange={(e) => setNamaPemilikLama(e.target.value)}
                        disabled={loading}
                        className={`w-full text-xs font-semibold bg-white border rounded-xl px-3 pr-4 py-2.5 transition-all text-gray-800 focus:outline-none focus:border-indigo-500 ${formErrors.namaPemilikLama ? 'border-red-500 focus:border-red-500' : 'border-transparent'
                          }`}
                      />
                      {formErrors.namaPemilikLama && <span className="text-[10px] text-red-600 font-bold pl-1">{formErrors.namaPemilikLama}</span>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider pl-1">Alamat Pemilik Lama <span className="text-red-500"> *</span></label>
                      <input
                        type="text"
                        value={alamatPemilikLama}
                        onChange={(e) => setAlamatPemilikLama(e.target.value)}
                        disabled={loading}
                        className={`w-full text-xs font-semibold bg-white border rounded-xl px-3 pr-4 py-2.5 transition-all text-gray-800 focus:outline-none focus:border-indigo-500 ${formErrors.alamatPemilikLama ? 'border-red-500 focus:border-red-500' : 'border-transparent'
                          }`}
                      />
                      {formErrors.alamatPemilikLama && <span className="text-[10px] text-red-600 font-bold pl-1">{formErrors.alamatPemilikLama}</span>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider pl-1">Kecamatan Pemilik <span className="text-red-500"> *</span></label>
                        <input
                          type="text"
                          value={kecamatanPemilikLama}
                          onChange={(e) => setKecamatanPemilikLama(e.target.value)}
                          disabled={loading}
                          className={`w-full text-xs font-semibold bg-white border rounded-xl px-3 pr-4 py-2.5 transition-all text-gray-800 focus:outline-none focus:border-indigo-500 ${formErrors.kecamatanPemilikLama ? 'border-red-500 focus:border-red-500' : 'border-transparent'
                            }`}
                        />
                        {formErrors.kecamatanPemilikLama && <span className="text-[10px] text-red-600 font-bold pl-1">{formErrors.kecamatanPemilikLama}</span>}
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider pl-1">Desa Pemilik <span className="text-red-500"> *</span></label>
                        <input
                          type="text"
                          value={desaPemilikLama}
                          onChange={(e) => setDesaPemilikLama(e.target.value)}
                          disabled={loading}
                          className={`w-full text-xs font-semibold bg-white border rounded-xl px-3 pr-4 py-2.5 transition-all text-gray-800 focus:outline-none focus:border-indigo-500 ${formErrors.desaPemilikLama ? 'border-red-500 focus:border-red-500' : 'border-transparent'
                            }`}
                        />
                        {formErrors.desaPemilikLama && <span className="text-[10px] text-red-600 font-bold pl-1">{formErrors.desaPemilikLama}</span>}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider pl-1">Alamat Objek Pajak <span className="text-red-500"> *</span></label>
                      <input
                        type="text"
                        value={alamatObjekLama}
                        onChange={(e) => setAlamatObjekLama(e.target.value)}
                        disabled={loading}
                        className={`w-full text-xs font-semibold bg-white border rounded-xl px-3 pr-4 py-2.5 transition-all text-gray-800 focus:outline-none focus:border-indigo-500 ${formErrors.alamatObjekLama ? 'border-red-500 focus:border-red-500' : 'border-transparent'
                          }`}
                      />
                      {formErrors.alamatObjekLama && <span className="text-[10px] text-red-600 font-bold pl-1">{formErrors.alamatObjekLama}</span>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider pl-1">Kecamatan Objek <span className="text-red-500"> *</span></label>
                        <input
                          type="text"
                          value={kecamatanObjekLama}
                          onChange={(e) => setKecamatanObjekLama(e.target.value)}
                          disabled={loading}
                          className={`w-full text-xs font-semibold bg-white border rounded-xl px-3 pr-4 py-2.5 transition-all text-gray-800 focus:outline-none focus:border-indigo-500 ${formErrors.kecamatanObjekLama ? 'border-red-500 focus:border-red-500' : 'border-transparent'
                            }`}
                        />
                        {formErrors.kecamatanObjekLama && <span className="text-[10px] text-red-600 font-bold pl-1">{formErrors.kecamatanObjekLama}</span>}
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider pl-1">Desa Objek <span className="text-red-500"> *</span></label>
                        <input
                          type="text"
                          value={desaObjekLama}
                          onChange={(e) => setDesaObjekLama(e.target.value)}
                          disabled={loading}
                          className={`w-full text-xs font-semibold bg-white border rounded-xl px-3 pr-4 py-2.5 transition-all text-gray-800 focus:outline-none focus:border-indigo-500 ${formErrors.desaObjekLama ? 'border-red-500 focus:border-red-500' : 'border-transparent'
                            }`}
                        />
                        {formErrors.desaObjekLama && <span className="text-[10px] text-red-600 font-bold pl-1">{formErrors.desaObjekLama}</span>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider pl-1">Luas Tanah Asal (m²) <span className="text-red-500"> *</span></label>
                        <input
                          type="number"
                          min={0}
                          step="any"
                          value={luasTanahLama}
                          onChange={(e) => setLuasTanahLama(e.target.value)}
                          disabled={loading}
                          className={`w-full text-xs font-semibold bg-white border rounded-xl px-3 pr-4 py-2.5 transition-all text-gray-800 focus:outline-none focus:border-indigo-500 ${formErrors.luasTanahLama ? 'border-red-500 focus:border-red-500' : 'border-transparent'
                            }`}
                        />
                        {formErrors.luasTanahLama && <span className="text-[10px] text-red-600 font-bold pl-1">{formErrors.luasTanahLama}</span>}
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider pl-1">Luas Bangunan Asal (m²) <span className="text-red-500"> *</span></label>
                        <input
                          type="number"
                          min={0}
                          step="any"
                          value={luasBangunanLama}
                          onChange={(e) => setLuasBangunanLama(e.target.value)}
                          disabled={loading}
                          className={`w-full text-xs font-semibold bg-white border rounded-xl px-3 pr-4 py-2.5 transition-all text-gray-800 focus:outline-none focus:border-indigo-500 ${formErrors.luasBangunanLama ? 'border-red-500 focus:border-red-500' : 'border-transparent'
                            }`}
                        />
                        {formErrors.luasBangunanLama && <span className="text-[10px] text-red-600 font-bold pl-1">{formErrors.luasBangunanLama}</span>}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider pl-1">Nomor/Jenis Sertifikat Lama <span className="text-red-500"> *</span></label>
                      <input
                        type="text"
                        value={sertifikatLama}
                        onChange={(e) => setSertifikatLama(e.target.value)}
                        disabled={loading}
                        className={`w-full text-xs font-semibold bg-white border rounded-xl px-3 pr-4 py-2.5 transition-all text-gray-800 focus:outline-none focus:border-indigo-500 ${formErrors.sertifikatLama ? 'border-red-500 focus:border-red-500' : 'border-transparent'
                          }`}
                      />
                      {formErrors.sertifikatLama && <span className="text-[10px] text-red-600 font-bold pl-1">{formErrors.sertifikatLama}</span>}
                    </div>
                  </div>
                )}
              </div>

              {/* EDIT PART 3: DATA BARU */}
              <div className="flex flex-col gap-4 p-5 rounded-2xl bg-[#f3f6f9] shadow-3xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-1">
                  <h4 className="text-xs font-extrabold text-indigo-700 capitalize tracking-widest">3. Data Baru (Pemilik & Objek Baru)</h4>
                  {needDataBaru && jenisPermohonan === 'MUTASI_SEBAGIAN' && (
                    <button
                      type="button"
                      onClick={handleAddOwner}
                      disabled={loading}
                      className="px-2.5 py-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Tambah Pemilik
                    </button>
                  )}
                </div>

                {!needDataBaru ? (
                  <div className="text-center py-6 text-xs text-slate-400 font-semibold bg-slate-50/50 rounded-xl border border-dashed border-slate-200 select-none">
                    Bagian ini tidak diperlukan untuk layanan pengaktifan kembali.
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    {dataBaru.map((item, idx) => (
                      <div key={idx} className={`flex flex-col gap-4 p-5 border-transparent bg-white rounded-2xl relative shadow-3xs ${dataBaru.length > 1 ? 'pt-10' : ''}`}>
                        {dataBaru.length > 1 && (
                          <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between">
                            <span className="text-[10px] font-extrabold text-indigo-600 capitalize tracking-wider">Pemilik Baru #{idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveOwner(idx)}
                              disabled={loading}
                              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider pl-1">Nama Pemilik Baru <span className="text-red-500"> *</span></label>
                          <input
                            type="text"
                            value={item.namaPemilikBaru}
                            onChange={(e) => handleOwnerChange(idx, 'namaPemilikBaru', e.target.value)}
                            disabled={loading}
                            className={`w-full text-xs font-semibold bg-white border rounded-xl px-3 pr-4 py-2.5 transition-all text-gray-800 focus:outline-none focus:border-indigo-500 ${formErrors[`dataBaru.${idx}.namaPemilikBaru`] ? 'border-red-500 focus:border-red-500' : 'border-transparent'
                              }`}
                          />
                          {formErrors[`dataBaru.${idx}.namaPemilikBaru`] && <span className="text-[10px] text-red-600 font-bold pl-1">{formErrors[`dataBaru.${idx}.namaPemilikBaru`]}</span>}
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider pl-1">Alamat Pemilik Baru <span className="text-red-500"> *</span></label>
                          <input
                            type="text"
                            value={item.alamatPemilikBaru}
                            onChange={(e) => handleOwnerChange(idx, 'alamatPemilikBaru', e.target.value)}
                            disabled={loading}
                            className={`w-full text-xs font-semibold bg-white border rounded-xl px-3 pr-4 py-2.5 transition-all text-gray-800 focus:outline-none focus:border-indigo-500 ${formErrors[`dataBaru.${idx}.alamatPemilikBaru`] ? 'border-red-500 focus:border-red-500' : 'border-transparent'
                              }`}
                          />
                          {formErrors[`dataBaru.${idx}.alamatPemilikBaru`] && <span className="text-[10px] text-red-600 font-bold pl-1">{formErrors[`dataBaru.${idx}.alamatPemilikBaru`]}</span>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider pl-1">Kecamatan Pemilik <span className="text-red-500"> *</span></label>
                            <input
                              type="text"
                              value={item.kecamatanPemilikBaru}
                              onChange={(e) => handleOwnerChange(idx, 'kecamatanPemilikBaru', e.target.value)}
                              disabled={loading}
                              className={`w-full text-xs font-semibold bg-white border rounded-xl px-3 pr-4 py-2.5 transition-all text-gray-800 focus:outline-none focus:border-indigo-500 ${formErrors[`dataBaru.${idx}.kecamatanPemilikBaru`] ? 'border-red-500 focus:border-red-500' : 'border-transparent'
                                }`}
                            />
                            {formErrors[`dataBaru.${idx}.kecamatanPemilikBaru`] && <span className="text-[10px] text-red-600 font-bold pl-1">{formErrors[`dataBaru.${idx}.kecamatanPemilikBaru`]}</span>}
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider pl-1">Desa Pemilik <span className="text-red-500"> *</span></label>
                            <input
                              type="text"
                              value={item.desaPemilikBaru}
                              onChange={(e) => handleOwnerChange(idx, 'desaPemilikBaru', e.target.value)}
                              disabled={loading}
                              className={`w-full text-xs font-semibold bg-white border rounded-xl px-3 pr-4 py-2.5 transition-all text-gray-800 focus:outline-none focus:border-indigo-500 ${formErrors[`dataBaru.${idx}.desaPemilikBaru`] ? 'border-red-500 focus:border-red-500' : 'border-transparent'
                                }`}
                            />
                            {formErrors[`dataBaru.${idx}.desaPemilikBaru`] && <span className="text-[10px] text-red-600 font-bold pl-1">{formErrors[`dataBaru.${idx}.desaPemilikBaru`]}</span>}
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider pl-1">Alamat Objek Baru <span className="text-red-500"> *</span></label>
                          <input
                            type="text"
                            value={item.alamatObjekBaru}
                            onChange={(e) => handleOwnerChange(idx, 'alamatObjekBaru', e.target.value)}
                            disabled={loading}
                            className={`w-full text-xs font-semibold bg-white border rounded-xl px-3 pr-4 py-2.5 transition-all text-gray-800 focus:outline-none focus:border-indigo-500 ${formErrors[`dataBaru.${idx}.alamatObjekBaru`] ? 'border-red-500 focus:border-red-500' : 'border-transparent'
                              }`}
                          />
                          {formErrors[`dataBaru.${idx}.alamatObjekBaru`] && <span className="text-[10px] text-red-600 font-bold pl-1">{formErrors[`dataBaru.${idx}.alamatObjekBaru`]}</span>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider pl-1">Kecamatan Objek <span className="text-red-500"> *</span></label>
                            <input
                              type="text"
                              value={item.kecamatanObjekBaru}
                              onChange={(e) => handleOwnerChange(idx, 'kecamatanObjekBaru', e.target.value)}
                              disabled={loading}
                              className={`w-full text-xs font-semibold bg-white border rounded-xl px-3 pr-4 py-2.5 transition-all text-gray-800 focus:outline-none focus:border-indigo-500 ${formErrors[`dataBaru.${idx}.kecamatanObjekBaru`] ? 'border-red-500 focus:border-red-500' : 'border-transparent'
                                }`}
                            />
                            {formErrors[`dataBaru.${idx}.kecamatanObjekBaru`] && <span className="text-[10px] text-red-600 font-bold pl-1">{formErrors[`dataBaru.${idx}.kecamatanObjekBaru`]}</span>}
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider pl-1">Desa Objek <span className="text-red-500"> *</span></label>
                            <input
                              type="text"
                              value={item.desaObjekBaru}
                              onChange={(e) => handleOwnerChange(idx, 'desaObjekBaru', e.target.value)}
                              disabled={loading}
                              className={`w-full text-xs font-semibold bg-white border rounded-xl px-3 pr-4 py-2.5 transition-all text-gray-800 focus:outline-none focus:border-indigo-500 ${formErrors[`dataBaru.${idx}.desaObjekBaru`] ? 'border-red-500 focus:border-red-500' : 'border-transparent'
                                }`}
                            />
                            {formErrors[`dataBaru.${idx}.desaObjekBaru`] && <span className="text-[10px] text-red-600 font-bold pl-1">{formErrors[`dataBaru.${idx}.desaObjekBaru`]}</span>}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider pl-1">Luas Tanah (m²) <span className="text-red-500"> *</span></label>
                            <input
                              type="number"
                              value={item.luasTanahBaru}
                              onChange={(e) => handleOwnerChange(idx, 'luasTanahBaru', e.target.value)}
                              disabled={loading}
                              className={`w-full text-xs font-semibold bg-white border rounded-xl px-3 pr-4 py-2.5 transition-all text-gray-800 focus:outline-none focus:border-indigo-500 ${formErrors[`dataBaru.${idx}.luasTanahBaru`] ? 'border-red-500 focus:border-red-500' : 'border-transparent'
                                }`}
                            />
                            {formErrors[`dataBaru.${idx}.luasTanahBaru`] && <span className="text-[10px] text-red-600 font-bold pl-1">{formErrors[`dataBaru.${idx}.luasTanahBaru`]}</span>}
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider pl-1">Luas Bangunan (m²) <span className="text-red-500"> *</span></label>
                            <input
                              type="number"
                              value={item.luasBangunanBaru}
                              onChange={(e) => handleOwnerChange(idx, 'luasBangunanBaru', e.target.value)}
                              disabled={loading}
                              className={`w-full text-xs font-semibold bg-white border rounded-xl px-3 pr-4 py-2.5 transition-all text-gray-800 focus:outline-none focus:border-indigo-500 ${formErrors[`dataBaru.${idx}.luasBangunanBaru`] ? 'border-red-500 focus:border-red-500' : 'border-transparent'
                                }`}
                            />
                            {formErrors[`dataBaru.${idx}.luasBangunanBaru`] && <span className="text-[10px] text-red-600 font-bold pl-1">{formErrors[`dataBaru.${idx}.luasBangunanBaru`]}</span>}
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider pl-1">Nomor/Jenis Sertifikat Baru <span className="text-red-500"> *</span></label>
                          <input
                            type="text"
                            value={item.sertifikatBaru}
                            onChange={(e) => handleOwnerChange(idx, 'sertifikatBaru', e.target.value)}
                            disabled={loading}
                            className={`w-full text-xs font-semibold bg-white border rounded-xl px-3 pr-4 py-2.5 transition-all text-gray-800 focus:outline-none focus:border-indigo-500 ${formErrors[`dataBaru.${idx}.sertifikatBaru`] ? 'border-red-500 focus:border-red-500' : 'border-transparent'
                              }`}
                          />
                          {formErrors[`dataBaru.${idx}.sertifikatBaru`] && <span className="text-[10px] text-red-600 font-bold pl-1">{formErrors[`dataBaru.${idx}.sertifikatBaru`]}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Edit Modal Actions Footer */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 select-none">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-3.5 py-2 text-slate-500 hover:text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] hover:opacity-90 text-[#2c333f] font-bold text-xs capitalize rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex items-center justify-center disabled:opacity-50 gap-1.5"
              >
                {loading ? (
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  'Simpan'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
});

EditModal.displayName = 'EditModal';
