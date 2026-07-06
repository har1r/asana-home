"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, AlertTriangle, CheckCircle, Phone, Plus, Trash2 } from 'lucide-react';
import { createPermohonan } from '@/app/actions/penginput';

interface CreateFormProps {
  onSuccess: () => void;
  onCancel: () => void;
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

export const CreateForm: React.FC<CreateFormProps> = React.memo(({ onSuccess, onCancel }) => {
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

  // Data Baru state (Array)
  const [dataBaru, setDataBaru] = useState<any[]>([createEmptyDataBaruItem()]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Conditional Logic Rules
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
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
      const res = await createPermohonan(formData);
      if (res.success) {
        setSuccess('Permohonan berhasil diajukan & notifikasi WhatsApp terkirim ke wajib pajak!');
        // Reset form
        setNomorPelayanan('');
        setTanggalNoPelayanan('');
        setTanggalPenyelesaian('');
        setNop('');
        setNoWhatsapp('');
        setNamaPemilikLama('');
        setAlamatPemilikLama('');
        setKecamatanPemilikLama('');
        setDesaPemilikLama('');
        setAlamatObjekLama('');
        setKecamatanObjekLama('');
        setDesaObjekLama('');
        setLuasTanahLama('');
        setLuasBangunanLama('');
        setSertifikatLama('');
        setDataBaru([createEmptyDataBaruItem()]);
        
        setTimeout(() => {
          onSuccess();
          onCancel();
        }, 1500);
      } else {
        setError(res.error || 'Gagal menyimpan permohonan.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#f3f6f9] rounded-2xl border-transparent/80 shadow-sm overflow-hidden animate-fadeIn">
      {/* Header */}
      <div className="border-b border-gray-200/60 px-6 py-5 flex items-center justify-between bg-[#f3f6f9]">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-gray-500 hover:text-gray-800 transition-all cursor-pointer"
            title="Kembali ke Daftar"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          </button>
          <div>
            <span className="font-extrabold text-[13px] capitalize tracking-wider text-slate-700 font-display">
              Formulir Permohonan
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleCreate} className="p-6 md:p-8 flex flex-col gap-6 bg-[#f3f6f9]">
        {error && (
          <div className="bg-red-50/80 border border-red-200/65 text-red-750 text-xs font-bold rounded-xl px-4 py-3 flex items-start gap-2.5 animate-fadeIn shrink-0">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-emerald-50/80 border border-emerald-200/65 text-emerald-800 text-xs font-bold rounded-xl px-4 py-3 flex items-start gap-2.5 animate-fadeIn shrink-0">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Scrollable grid container for form fields */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          {/* Card 1: Data Utama */}
          <div className="flex flex-col gap-4 bg-[#f3f6f9] border-transparent rounded-2xl p-5">
            <div className="flex items-center text-indigo-600 font-extrabold text-[11px] capitalize tracking-wider border-b border-slate-100 pb-2 select-none">
              <span>Data utama</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider">Jenis layanan permohonan</label>
              <select
                value={jenisPermohonan}
                onChange={(e) => setJenisPermohonan(e.target.value)}
                disabled={loading}
                className="w-full bg-white border border-transparent rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-800 focus:outline-none focus:border-indigo-500 transition-all shadow-3xs cursor-pointer"
              >
                {JENIS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider">Nomor pelayanan <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={nomorPelayanan}
                onChange={(e) => setNomorPelayanan(e.target.value)}
                disabled={loading}
                className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-755 focus:outline-none focus:border-indigo-500 transition-all shadow-3xs ${formErrors.nomorPelayanan ? 'border-red-500 focus:border-red-500' : 'border-transparent'
                  }`}
              />
              {formErrors.nomorPelayanan && <span className="text-[10px] text-red-600 font-bold pl-1">{formErrors.nomorPelayanan}</span>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider">Tanggal pelayanan <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={tanggalNoPelayanan}
                  onChange={(e) => setTanggalNoPelayanan(e.target.value)}
                  disabled={loading}
                  className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-755 focus:outline-none focus:border-indigo-500 transition-all shadow-3xs ${formErrors.tanggalNoPelayanan ? 'border-red-500 focus:border-red-500' : 'border-transparent'
                    }`}
                />
                {formErrors.tanggalNoPelayanan && <span className="text-[10px] text-red-600 font-bold pl-1">{formErrors.tanggalNoPelayanan}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider">Tanggal penyelesaian <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={tanggalPenyelesaian}
                  onChange={(e) => setTanggalPenyelesaian(e.target.value)}
                  disabled={loading}
                  className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-755 focus:outline-none focus:border-indigo-500 transition-all shadow-3xs ${formErrors.tanggalPenyelesaian ? 'border-red-500 focus:border-red-500' : 'border-transparent'
                    }`}
                />
                {formErrors.tanggalPenyelesaian && <span className="text-[10px] text-red-600 font-bold pl-1">{formErrors.tanggalPenyelesaian}</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider">Nomor objek pajak (NOP) <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  maxLength={24}
                  value={nop}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^\d]/g, '').slice(0, 18);
                    let fmt = '';
                    if (raw.length <= 2) fmt = raw;
                    else if (raw.length <= 4) fmt = raw.slice(0, 2) + '.' + raw.slice(2);
                    else if (raw.length <= 7) fmt = raw.slice(0, 2) + '.' + raw.slice(2, 4) + '.' + raw.slice(4);
                    else if (raw.length <= 10) fmt = raw.slice(0, 2) + '.' + raw.slice(2, 4) + '.' + raw.slice(4, 7) + '.' + raw.slice(7);
                    else if (raw.length <= 13) fmt = raw.slice(0, 2) + '.' + raw.slice(2, 4) + '.' + raw.slice(4, 7) + '.' + raw.slice(7, 10) + '.' + raw.slice(10);
                    else if (raw.length <= 17) fmt = raw.slice(0, 2) + '.' + raw.slice(2, 4) + '.' + raw.slice(4, 7) + '.' + raw.slice(7, 10) + '.' + raw.slice(10, 13) + '-' + raw.slice(13);
                    else fmt = raw.slice(0, 2) + '.' + raw.slice(2, 4) + '.' + raw.slice(4, 7) + '.' + raw.slice(7, 10) + '.' + raw.slice(10, 13) + '-' + raw.slice(13, 17) + '.' + raw.slice(17);
                    setNop(fmt);
                  }}
                  disabled={loading}
                  className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs font-bold font-mono text-gray-755 focus:outline-none focus:border-indigo-500 transition-all shadow-3xs ${formErrors.nop ? 'border-red-500 focus:border-red-500' : 'border-transparent'
                    }`}
                />
                {formErrors.nop && <span className="text-[10px] text-red-600 font-bold pl-1">{formErrors.nop}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider">Nomor WhatsApp WP <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Contoh: 081234567890"
                    value={noWhatsapp}
                    onChange={(e) => setNoWhatsapp(e.target.value.replace(/[^\d+]/g, ''))}
                    disabled={loading}
                    className={`w-full bg-white border rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-semibold text-gray-755 focus:outline-none focus:border-indigo-500 transition-all shadow-3xs ${formErrors.noWhatsapp ? 'border-red-500 focus:border-red-500' : 'border-transparent'
                      }`}
                  />
                </div>
                {formErrors.noWhatsapp && <span className="text-[10px] text-red-600 font-bold pl-1">{formErrors.noWhatsapp}</span>}
              </div>
            </div>
          </div>

          {/* Card 2: Data Lama */}
          <div className="flex flex-col gap-4 bg-[#f3f6f9] border-transparent rounded-2xl p-5">
            <div className="flex items-center text-indigo-600 font-extrabold text-[11px] capitalize tracking-wider select-none border-b border-slate-100 pb-2">
              <span>Data lama (pemilik & objek asal)</span>
            </div>

            {!needDataLama ? (
              <div className="flex-1 flex items-center justify-center py-10 text-center text-xs text-slate-400 font-semibold bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                Bagian ini tidak diperlukan untuk layanan objek pajak baru.
              </div>
            ) : (
              <div className="flex flex-col gap-3 flex-1 justify-between">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider">Nama pemilik lama <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={namaPemilikLama}
                    onChange={(e) => setNamaPemilikLama(e.target.value)}
                    disabled={loading}
                    className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-755 focus:outline-none focus:border-indigo-500 transition-all shadow-3xs ${formErrors.namaPemilikLama ? 'border-red-500 focus:border-red-500' : 'border-transparent'
                      }`}
                  />
                  {formErrors.namaPemilikLama && <span className="text-[10px] text-red-600 font-bold pl-1">{formErrors.namaPemilikLama}</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider">Alamat pemilik lama <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={alamatPemilikLama}
                    onChange={(e) => setAlamatPemilikLama(e.target.value)}
                    disabled={loading}
                    className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-755 focus:outline-none focus:border-indigo-500 transition-all shadow-3xs ${formErrors.alamatPemilikLama ? 'border-red-500 focus:border-red-500' : 'border-transparent'
                      }`}
                  />
                  {formErrors.alamatPemilikLama && <span className="text-[10px] text-red-600 font-bold pl-1">{formErrors.alamatPemilikLama}</span>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider">Kecamatan pemilik <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={kecamatanPemilikLama}
                      onChange={(e) => setKecamatanPemilikLama(e.target.value)}
                      disabled={loading}
                      className={`w-full bg-white border rounded-xl px-3.5 py-2 text-xs font-semibold text-gray-755 focus:outline-none focus:border-indigo-500 transition-all shadow-3xs ${formErrors.kecamatanPemilikLama ? 'border-red-500 focus:border-red-500' : 'border-transparent'
                        }`}
                    />
                    {formErrors.kecamatanPemilikLama && <span className="text-[10px] text-red-600 font-bold pl-1">{formErrors.kecamatanPemilikLama}</span>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider">Desa pemilik <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={desaPemilikLama}
                      onChange={(e) => setDesaPemilikLama(e.target.value)}
                      disabled={loading}
                      className={`w-full bg-white border rounded-xl px-3.5 py-2 text-xs font-semibold text-gray-755 focus:outline-none focus:border-indigo-500 transition-all shadow-3xs ${formErrors.desaPemilikLama ? 'border-red-500 focus:border-red-500' : 'border-transparent'
                        }`}
                    />
                    {formErrors.desaPemilikLama && <span className="text-[10px] text-red-600 font-bold pl-1">{formErrors.desaPemilikLama}</span>}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider">Alamat objek pajak <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={alamatObjekLama}
                    onChange={(e) => setAlamatObjekLama(e.target.value)}
                    disabled={loading}
                    className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-755 focus:outline-none focus:border-indigo-500 transition-all shadow-3xs ${formErrors.alamatObjekLama ? 'border-red-500 focus:border-red-500' : 'border-transparent'
                      }`}
                  />
                  {formErrors.alamatObjekLama && <span className="text-[10px] text-red-600 font-bold pl-1">{formErrors.alamatObjekLama}</span>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider">Kecamatan objek lama <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={kecamatanObjekLama}
                      onChange={(e) => setKecamatanObjekLama(e.target.value)}
                      disabled={loading}
                      className={`w-full bg-white border rounded-xl px-3.5 py-2 text-xs font-semibold text-gray-755 focus:outline-none focus:border-indigo-500 transition-all shadow-3xs ${formErrors.kecamatanObjekLama ? 'border-red-500 focus:border-red-500' : 'border-transparent'
                        }`}
                    />
                    {formErrors.kecamatanObjekLama && <span className="text-[10px] text-red-600 font-bold pl-1">{formErrors.kecamatanObjekLama}</span>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider">Desa objek lama <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={desaObjekLama}
                      onChange={(e) => setDesaObjekLama(e.target.value)}
                      disabled={loading}
                      className={`w-full bg-white border rounded-xl px-3.5 py-2 text-xs font-semibold text-gray-755 focus:outline-none focus:border-indigo-500 transition-all shadow-3xs ${formErrors.desaObjekLama ? 'border-red-500 focus:border-red-500' : 'border-transparent'
                        }`}
                    />
                    {formErrors.desaObjekLama && <span className="text-[10px] text-red-600 font-bold pl-1">{formErrors.desaObjekLama}</span>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider">Luas tanah asal (m²) <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      value={luasTanahLama}
                      onChange={(e) => setLuasTanahLama(e.target.value)}
                      disabled={loading}
                      className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-755 focus:outline-none focus:border-indigo-500 transition-all shadow-3xs ${formErrors.luasTanahLama ? 'border-red-500 focus:border-red-500' : 'border-transparent'
                        }`}
                    />
                    {formErrors.luasTanahLama && <span className="text-[10px] text-red-600 font-bold pl-1">{formErrors.luasTanahLama}</span>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider">Luas bangunan asal (m²) <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      value={luasBangunanLama}
                      onChange={(e) => setLuasBangunanLama(e.target.value)}
                      disabled={loading}
                      className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-755 focus:outline-none focus:border-indigo-500 transition-all shadow-3xs ${formErrors.luasBangunanLama ? 'border-red-500 focus:border-red-500' : 'border-transparent'
                        }`}
                    />
                    {formErrors.luasBangunanLama && <span className="text-[10px] text-red-600 font-bold pl-1">{formErrors.luasBangunanLama}</span>}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider">Nomor sertifikat lama <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="Contoh: SHM No. 12345"
                    value={sertifikatLama}
                    onChange={(e) => setSertifikatLama(e.target.value)}
                    disabled={loading}
                    className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-755 focus:outline-none focus:border-indigo-500 transition-all shadow-3xs ${formErrors.sertifikatLama ? 'border-red-500 focus:border-red-500' : 'border-transparent'
                      }`}
                  />
                  {formErrors.sertifikatLama && <span className="text-[10px] text-red-600 font-bold pl-1">{formErrors.sertifikatLama}</span>}
                </div>
              </div>
            )}
          </div>

          {/* Card 3: Data Baru */}
          {needDataBaru && (
            <div className="flex flex-col gap-5 col-span-1 lg:col-span-2">
              <div className="flex items-center justify-between border-b border-gray-200/50 pb-2.5 px-1 select-none">
                <div className="flex items-center text-indigo-600 font-extrabold text-[11px] capitalize tracking-wider">
                  <span>Data baru (pemilik & objek baru)</span>
                </div>
                {jenisPermohonan === 'MUTASI_SEBAGIAN' && (
                  <button
                    type="button"
                    onClick={handleAddOwner}
                    disabled={loading}
                    className="px-2.5 py-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-6">
                {dataBaru.map((item, idx) => (
                  <div key={idx} className={`flex flex-col gap-4 bg-[#f3f6f9] border-transparent rounded-2xl p-5 relative ${dataBaru.length > 1 ? 'pt-12' : ''}`}>
                    {dataBaru.length > 1 && (
                      <div className="absolute top-3 left-5 right-5 flex items-center justify-between border-b border-slate-100 pb-1.5 select-none">
                        <span className="text-[10px] font-extrabold text-indigo-600 capitalize tracking-wider">Pemilik baru #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveOwner(idx)}
                          disabled={loading}
                          className="px-2.5 py-1 text-[9px] font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" /> Hapus
                        </button>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Pemilik Baru */}
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider">Nama pemilik baru <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            value={item.namaPemilikBaru}
                            onChange={(e) => handleOwnerChange(idx, 'namaPemilikBaru', e.target.value)}
                            disabled={loading}
                            className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-805 focus:outline-none focus:border-indigo-500 transition-all shadow-3xs ${formErrors[`dataBaru.${idx}.namaPemilikBaru`] ? 'border-red-500 focus:border-red-500' : 'border-transparent'
                              }`}
                          />
                          {formErrors[`dataBaru.${idx}.namaPemilikBaru`] && <span className="text-[10px] text-red-600 font-bold pl-1">{formErrors[`dataBaru.${idx}.namaPemilikBaru`]}</span>}
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider">Alamat pemilik baru <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            value={item.alamatPemilikBaru}
                            onChange={(e) => handleOwnerChange(idx, 'alamatPemilikBaru', e.target.value)}
                            disabled={loading}
                            className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-755 focus:outline-none focus:border-indigo-500 transition-all shadow-3xs ${formErrors[`dataBaru.${idx}.alamatPemilikBaru`] ? 'border-red-500 focus:border-red-500' : 'border-transparent'
                              }`}
                          />
                          {formErrors[`dataBaru.${idx}.alamatPemilikBaru`] && <span className="text-[10px] text-red-600 font-bold pl-1">{formErrors[`dataBaru.${idx}.alamatPemilikBaru`]}</span>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider">Kecamatan pemilik <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              value={item.kecamatanPemilikBaru}
                              onChange={(e) => handleOwnerChange(idx, 'kecamatanPemilikBaru', e.target.value)}
                              disabled={loading}
                              className={`w-full bg-white border rounded-xl px-3.5 py-2 text-xs font-semibold text-gray-755 focus:outline-none focus:border-indigo-500 transition-all shadow-3xs ${formErrors[`dataBaru.${idx}.kecamatanPemilikBaru`] ? 'border-red-500 focus:border-red-500' : 'border-transparent'
                                }`}
                            />
                            {formErrors[`dataBaru.${idx}.kecamatanPemilikBaru`] && <span className="text-[10px] text-red-600 font-bold pl-1">{formErrors[`dataBaru.${idx}.kecamatanPemilikBaru`]}</span>}
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider">Desa pemilik <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              value={item.desaPemilikBaru}
                              onChange={(e) => handleOwnerChange(idx, 'desaPemilikBaru', e.target.value)}
                              disabled={loading}
                              className={`w-full bg-white border rounded-xl px-3.5 py-2 text-xs font-semibold text-gray-755 focus:outline-none focus:border-indigo-500 transition-all shadow-3xs ${formErrors[`dataBaru.${idx}.desaPemilikBaru`] ? 'border-red-500 focus:border-red-500' : 'border-transparent'
                                }`}
                            />
                            {formErrors[`dataBaru.${idx}.desaPemilikBaru`] && <span className="text-[10px] text-red-600 font-bold pl-1">{formErrors[`dataBaru.${idx}.desaPemilikBaru`]}</span>}
                          </div>
                        </div>
                      </div>

                      {/* Objek Pajak */}
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider">Alamat objek baru <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            value={item.alamatObjekBaru}
                            onChange={(e) => handleOwnerChange(idx, 'alamatObjekBaru', e.target.value)}
                            disabled={loading}
                            className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-755 focus:outline-none focus:border-indigo-500 transition-all shadow-3xs ${formErrors[`dataBaru.${idx}.alamatObjekBaru`] ? 'border-red-500 focus:border-red-500' : 'border-transparent'
                              }`}
                          />
                          {formErrors[`dataBaru.${idx}.alamatObjekBaru`] && <span className="text-[10px] text-red-600 font-bold pl-1">{formErrors[`dataBaru.${idx}.alamatObjekBaru`]}</span>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider">Kecamatan objek <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              value={item.kecamatanObjekBaru}
                              onChange={(e) => handleOwnerChange(idx, 'kecamatanObjekBaru', e.target.value)}
                              disabled={loading}
                              className={`w-full bg-white border rounded-xl px-3.5 py-2 text-xs font-semibold text-gray-755 focus:outline-none focus:border-indigo-500 transition-all shadow-3xs ${formErrors[`dataBaru.${idx}.kecamatanObjekBaru`] ? 'border-red-500 focus:border-red-500' : 'border-transparent'
                                }`}
                            />
                            {formErrors[`dataBaru.${idx}.kecamatanObjekBaru`] && <span className="text-[10px] text-red-600 font-bold pl-1">{formErrors[`dataBaru.${idx}.kecamatanObjekBaru`]}</span>}
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider">Desa objek <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              value={item.desaObjekBaru}
                              onChange={(e) => handleOwnerChange(idx, 'desaObjekBaru', e.target.value)}
                              disabled={loading}
                              className={`w-full bg-white border rounded-xl px-3.5 py-2 text-xs font-semibold text-gray-755 focus:outline-none focus:border-indigo-500 transition-all shadow-3xs ${formErrors[`dataBaru.${idx}.desaObjekBaru`] ? 'border-red-500 focus:border-red-500' : 'border-transparent'
                                }`}
                            />
                            {formErrors[`dataBaru.${idx}.desaObjekBaru`] && <span className="text-[10px] text-red-600 font-bold pl-1">{formErrors[`dataBaru.${idx}.desaObjekBaru`]}</span>}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider">Luas tanah (m²) <span className="text-red-500">*</span></label>
                            <input
                              type="number"
                              value={item.luasTanahBaru}
                              onChange={(e) => handleOwnerChange(idx, 'luasTanahBaru', e.target.value)}
                              disabled={loading}
                              className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-755 focus:outline-none focus:border-indigo-500 transition-all shadow-3xs ${formErrors[`dataBaru.${idx}.luasTanahBaru`] ? 'border-red-500 focus:border-red-500' : 'border-transparent'
                                }`}
                            />
                            {formErrors[`dataBaru.${idx}.luasTanahBaru`] && <span className="text-[10px] text-red-600 font-bold pl-1">{formErrors[`dataBaru.${idx}.luasTanahBaru`]}</span>}
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider">Luas bangunan (m²) <span className="text-red-500">*</span></label>
                            <input
                              type="number"
                              value={item.luasBangunanBaru}
                              onChange={(e) => handleOwnerChange(idx, 'luasBangunanBaru', e.target.value)}
                              disabled={loading}
                              className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-755 focus:outline-none focus:border-indigo-500 transition-all shadow-3xs ${formErrors[`dataBaru.${idx}.luasBangunanBaru`] ? 'border-red-500 focus:border-red-500' : 'border-transparent'
                                }`}
                            />
                            {formErrors[`dataBaru.${idx}.luasBangunanBaru`] && <span className="text-[10px] text-red-600 font-bold pl-1">{formErrors[`dataBaru.${idx}.luasBangunanBaru`]}</span>}
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-extrabold capitalize text-gray-500 tracking-wider">Nomor sertifikat baru <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            placeholder="Contoh: SHM No. 67890"
                            value={item.sertifikatBaru}
                            onChange={(e) => handleOwnerChange(idx, 'sertifikatBaru', e.target.value)}
                            disabled={loading}
                            className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-850 focus:outline-none focus:border-indigo-500 transition-all shadow-3xs ${formErrors[`dataBaru.${idx}.sertifikatBaru`] ? 'border-red-500 focus:border-red-500' : 'border-transparent'
                              }`}
                          />
                          {formErrors[`dataBaru.${idx}.sertifikatBaru`] && <span className="text-[10px] text-red-600 font-bold pl-1">{formErrors[`dataBaru.${idx}.sertifikatBaru`]}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Form Actions Footer */}
        <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-200 select-none">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border-transparent hover:bg-slate-50 text-gray-550 font-bold text-xs capitalize tracking-wider rounded-xl transition-all cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] hover:opacity-90 text-[#2c333f] font-bold text-xs capitalize tracking-wider py-2.5 px-6 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <span>Kirim</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
});

CreateForm.displayName = 'CreateForm';
