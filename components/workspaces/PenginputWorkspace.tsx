"use client";

import React, { useState, useEffect } from 'react';
import {
  Plus, Search, Edit, RefreshCw, User, Phone,
  MapPin, CreditCard, Sparkles, AlertTriangle, X,
  CheckCircle, FileText, Calendar, Trash2,
  ChevronLeft, ChevronRight, Eye, Check, Lock,
  ArrowLeft, CheckCircle2, FileSpreadsheet, Layers,
  Star, Filter
} from 'lucide-react';
import {
  createPermohonan,
  updatePermohonan,
  resubmitPermohonan,
  getPenginputPermohonan,
  togglePermohonanFavorite
} from '@/app/actions/penginput';
import { useDashboard } from '@/context/DashboardContext';
import { SkeletonBox, SkeletonText, SkeletonBadge } from '@/components/skeletons/SkeletonBase';

/** Skeleton lengkap untuk PenginputWorkspace — header + tabel */
export function PenginputSkeleton() {
  const STATUS_CHIPS = ['Semua', 'SUBMITTED', 'REVISION', 'BUNDLED', 'ARCHIVED', 'COMPLETED', 'REJECTED'];
  return (
    <div className="w-full font-sans select-none flex flex-col gap-6 animate-fadeIn">
      {/* Header card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#f3f6f9] p-5 rounded-2xl shadow-sm">
        <SkeletonBox width="w-56" height="h-5" rounded="rounded-full" />
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1">
            <SkeletonBox width="w-32" height="h-7" rounded="rounded-lg" />
            <SkeletonBox width="w-24" height="h-7" rounded="rounded-lg" />
          </div>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-[#f3f6f9] rounded-2xl shadow-sm flex flex-col overflow-hidden min-h-[500px]">
        {/* Action row: search */}
        <div className="p-5 border-b border-gray-200/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <SkeletonBox width="w-36" height="h-4" rounded="rounded-full" />
          <div className="w-72 h-8 bg-gray-200 animate-pulse rounded-lg" />
        </div>

        {/* Filter chips */}
        <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2 overflow-x-auto bg-[#f3f6f9]">
          {STATUS_CHIPS.map((s) => (
            <div key={s} className="h-6 rounded-full bg-gray-200 animate-pulse" style={{ width: s === 'Semua' ? 52 : s.length * 7 + 20 }} />
          ))}
        </div>

        {/* Table */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-gray-200/60">
                {['No', 'Tanggal', 'No. Pelayanan / NOP', 'Wajib Pajak', 'Jenis Layanan', 'Status', 'Aksi'].map((h) => (
                  <th key={h} className="py-3 px-5">
                    <SkeletonText width="w-16" height="h-2.5" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Array.from({ length: 7 }).map((_, i) => (
                <tr key={i}>
                  <td className="py-4 px-5 w-12"><SkeletonText width="w-4" height="h-3" /></td>
                  <td className="py-4 px-5"><SkeletonText width="w-20" height="h-3" /></td>
                  <td className="py-4 px-5 min-w-[220px]">
                    <div className="flex flex-col gap-1.5">
                      <SkeletonText width="w-36" height="h-3" />
                      <SkeletonText width="w-28" height="h-2.5" />
                    </div>
                  </td>
                  <td className="py-4 px-5"><SkeletonText width={i % 2 === 0 ? 'w-28' : 'w-24'} height="h-3" /></td>
                  <td className="py-4 px-5"><SkeletonBadge width="w-10" /></td>
                  <td className="py-4 px-5 text-center"><SkeletonBadge width="w-20" /></td>
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-6 h-6 rounded-lg bg-gray-200 animate-pulse" />
                      <div className="w-6 h-6 rounded-lg bg-gray-200 animate-pulse" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-gray-200/60 flex items-center justify-between">
          <SkeletonText width="w-32" height="h-3" />
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-7 h-7 rounded-lg bg-gray-200 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const JENIS_OPTIONS = [
  { value: 'MUTASI_SEBAGIAN', label: 'Mutasi Sebagian' },
  { value: 'MUTASI_HABIS_UPDATE', label: 'Mutasi Habis Update' },
  { value: 'MUTASI_HABIS_REGULER', label: 'Mutasi Habis Reguler' },
  { value: 'OBJEK_PAJAK_BARU', label: 'Objek Pajak Baru' },
  { value: 'PEMBETULAN', label: 'Pembetulan' },
  { value: 'PENGAKTIFAN', label: 'Pengaktifan' }
] as const;

const formatNop = (nop: string) => {
  // Format: 36.19.150.002.003-0123.0 (2+2+3+3+3+4+1 = 18 digits)
  if (!nop || nop.length !== 18) return nop;
  return `${nop.slice(0, 2)}.${nop.slice(2, 4)}.${nop.slice(4, 7)}.${nop.slice(7, 10)}.${nop.slice(10, 13)}-${nop.slice(13, 17)}.${nop.slice(17)}`;
};

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
      return jenis;
  }
};

export default function PenginputWorkspace() {
  const { showConfirm } = useDashboard();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterJenisLayanan, setFilterJenisLayanan] = useState<string>('ALL');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // View switcher state ('list' | 'form')
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
  // Selected item details modal state
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Initial empty Data Baru item template
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

  // Form State (New Entry)
  const [jenisPermohonan, setJenisPermohonan] = useState<string>('MUTASI_SEBAGIAN');
  const [nomorPelayanan, setNomorPelayanan] = useState('');
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

  // Edit Modal State
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [editJenis, setEditJenis] = useState<string>('MUTASI_SEBAGIAN');
  const [editNomorPelayanan, setEditNomorPelayanan] = useState('');
  const [editNop, setEditNop] = useState('');
  const [editNoWhatsapp, setEditNoWhatsapp] = useState('');

  const [editNamaPemilikLama, setEditNamaPemilikLama] = useState('');
  const [editAlamatPemilikLama, setEditAlamatPemilikLama] = useState('');
  const [editKecamatanPemilikLama, setEditKecamatanPemilikLama] = useState('');
  const [editDesaPemilikLama, setEditDesaPemilikLama] = useState('');
  const [editAlamatObjekLama, setEditAlamatObjekLama] = useState('');
  const [editKecamatanObjekLama, setEditKecamatanObjekLama] = useState('');
  const [editDesaObjekLama, setEditDesaObjekLama] = useState('');
  const [editLuasTanahLama, setEditLuasTanahLama] = useState('');
  const [editLuasBangunanLama, setEditLuasBangunanLama] = useState('');
  const [editSertifikatLama, setEditSertifikatLama] = useState('');

  const [editDataBaru, setEditDataBaru] = useState<any[]>([]);
  const [editFormErrors, setEditFormErrors] = useState<Record<string, string>>({});
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  // Conditional Logic Rules
  const needDataLama = [
    'MUTASI_SEBAGIAN',
    'MUTASI_HABIS_UPDATE',
    'MUTASI_HABIS_REGULER',
    'PEMBETULAN',
    'PENGAKTIFAN'
  ].includes(jenisPermohonan);

  const needDataBaru = [
    'MUTASI_SEBAGIAN',
    'MUTASI_HABIS_UPDATE',
    'MUTASI_HABIS_REGULER',
    'PEMBETULAN',
    'OBJEK_PAJAK_BARU'
  ].includes(jenisPermohonan);

  const editNeedDataLama = [
    'MUTASI_SEBAGIAN',
    'MUTASI_HABIS_UPDATE',
    'MUTASI_HABIS_REGULER',
    'PEMBETULAN',
    'PENGAKTIFAN'
  ].includes(editJenis);

  const editNeedDataBaru = [
    'MUTASI_SEBAGIAN',
    'MUTASI_HABIS_UPDATE',
    'MUTASI_HABIS_REGULER',
    'PEMBETULAN',
    'OBJEK_PAJAK_BARU'
  ].includes(editJenis);

  // Keep Data Baru length to 1 if not MUTASI_SEBAGIAN
  useEffect(() => {
    if (jenisPermohonan !== 'MUTASI_SEBAGIAN') {
      if (dataBaru.length > 1) {
        setDataBaru(prev => prev.slice(0, 1));
      }
    }
  }, [jenisPermohonan, dataBaru.length]);

  useEffect(() => {
    if (editJenis !== 'MUTASI_SEBAGIAN') {
      if (editDataBaru.length > 1) {
        setEditDataBaru(prev => prev.slice(0, 1));
      }
    }
  }, [editJenis, editDataBaru.length]);

  // Load permohonan data
  const fetchData = async () => {
    setListLoading(true);
    try {
      const res = await getPenginputPermohonan();
      if (res.success) {
        setList(res.list || []);
      } else {
        console.error(res.error);
      }
    } catch (err) {
      console.error('Failed to fetch permohonan', err);
    } finally {
      setListLoading(false);
    }
  };

  const handleToggleFavorite = async (id: string) => {
    const originalList = [...list];
    // Optimistic UI update
    const updatedList = list.map(item => {
      if (item.id === id) {
        return { ...item, isFavorite: !item.isFavorite };
      }
      return item;
    });
    setList(updatedList);

    try {
      const res = await togglePermohonanFavorite(id);
      if (!res.success) {
        setError(res.error || 'Gagal mengubah status favorit.');
        setList(originalList); // Revert
      }
    } catch (err) {
      setError('Gagal mengubah status favorit.');
      setList(originalList); // Revert
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus, filterJenisLayanan]);

  // Client validation
  const validateForm = (data: {
    jenisPermohonan: string;
    nomorPelayanan: string;
    nop: string;
    noWhatsapp: string;

    // Data Lama
    namaPemilikLama?: string;
    alamatPemilikLama?: string;
    kecamatanPemilikLama?: string;
    desaPemilikLama?: string;
    alamatObjekLama?: string;
    kecamatanObjekLama?: string;
    desaObjekLama?: string;
    luasTanahLama?: string | number;
    luasBangunanLama?: string | number;
    sertifikatLama?: string;

    // Data Baru
    dataBaru?: any[];
  }) => {
    const errors: Record<string, string> = {};

    // 1. Data Utama
    if (!data.nomorPelayanan.trim()) errors.nomorPelayanan = 'Nomor pelayanan wajib diisi';
    if (!/^\d{18}$/.test(data.nop.replace(/[.\-]/g, ''))) errors.nop = 'NOP harus tepat 18 digit angka';
    if (!/^(08|628)\d{8,12}$/.test(data.noWhatsapp)) {
      errors.noWhatsapp = 'WhatsApp tidak valid (harus diawali 08/628, min 10 digit)';
    }

    const { jenisPermohonan } = data;

    // 2. Data Lama Validation
    const hasDataLama = [
      'MUTASI_SEBAGIAN',
      'MUTASI_HABIS_UPDATE',
      'MUTASI_HABIS_REGULER',
      'PEMBETULAN',
      'PENGAKTIFAN'
    ].includes(jenisPermohonan);

    if (hasDataLama) {
      if (!data.namaPemilikLama?.trim()) errors.namaPemilikLama = 'Nama pemilik lama wajib diisi';
      if (!data.alamatPemilikLama?.trim()) errors.alamatPemilikLama = 'Alamat pemilik lama wajib diisi';
      if (!data.kecamatanPemilikLama?.trim()) errors.kecamatanPemilikLama = 'Kecamatan pemilik lama wajib diisi';
      if (!data.desaPemilikLama?.trim()) errors.desaPemilikLama = 'Desa pemilik lama wajib diisi';
      if (!data.alamatObjekLama?.trim()) errors.alamatObjekLama = 'Alamat objek lama wajib diisi';
      if (!data.kecamatanObjekLama?.trim()) errors.kecamatanObjekLama = 'Kecamatan objek lama wajib diisi';
      if (!data.desaObjekLama?.trim()) errors.desaObjekLama = 'Desa objek lama wajib diisi';
      if (data.luasTanahLama === undefined || data.luasTanahLama === '' || Number(data.luasTanahLama) < 0) {
        errors.luasTanahLama = 'Luas tanah lama harus >= 0';
      }
      if (data.luasBangunanLama === undefined || data.luasBangunanLama === '' || Number(data.luasBangunanLama) < 0) {
        errors.luasBangunanLama = 'Luas bangunan lama harus >= 0';
      }
      if (!data.sertifikatLama?.trim()) errors.sertifikatLama = 'Sertifikat lama wajib diisi';
    }

    // 3. Data Baru Validation
    const hasDataBaru = [
      'MUTASI_SEBAGIAN',
      'MUTASI_HABIS_UPDATE',
      'MUTASI_HABIS_REGULER',
      'PEMBETULAN',
      'OBJEK_PAJAK_BARU'
    ].includes(jenisPermohonan);

    if (hasDataBaru) {
      if (!data.dataBaru || data.dataBaru.length === 0) {
        errors.dataBaru = 'Minimal 1 data pemilik baru wajib diisi';
      } else {
        data.dataBaru.forEach((item, idx) => {
          if (!item.namaPemilikBaru?.trim()) errors[`dataBaru.${idx}.namaPemilikBaru`] = 'Nama pemilik baru wajib diisi';
          if (!item.alamatPemilikBaru?.trim()) errors[`dataBaru.${idx}.alamatPemilikBaru`] = 'Alamat pemilik baru wajib diisi';
          if (!item.kecamatanPemilikBaru?.trim()) errors[`dataBaru.${idx}.kecamatanPemilikBaru`] = 'Kecamatan pemilik baru wajib diisi';
          if (!item.desaPemilikBaru?.trim()) errors[`dataBaru.${idx}.desaPemilikBaru`] = 'Desa pemilik baru wajib diisi';
          if (!item.alamatObjekBaru?.trim()) errors[`dataBaru.${idx}.alamatObjekBaru`] = 'Alamat objek baru wajib diisi';
          if (!item.kecamatanObjekBaru?.trim()) errors[`dataBaru.${idx}.kecamatanObjekBaru`] = 'Kecamatan objek baru wajib diisi';
          if (!item.desaObjekBaru?.trim()) errors[`dataBaru.${idx}.desaObjekBaru`] = 'Desa objek baru wajib diisi';
          if (item.luasTanahBaru === undefined || item.luasTanahBaru === '' || Number(item.luasTanahBaru) < 0) {
            errors[`dataBaru.${idx}.luasTanahBaru`] = 'Luas tanah baru harus >= 0';
          }
          if (item.luasBangunanBaru === undefined || item.luasBangunanBaru === '' || Number(item.luasBangunanBaru) < 0) {
            errors[`dataBaru.${idx}.luasBangunanBaru`] = 'Luas bangunan baru harus >= 0';
          }
          if (!item.sertifikatBaru?.trim()) errors[`dataBaru.${idx}.sertifikatBaru`] = 'Sertifikat baru wajib diisi';
        });
      }
    }

    return errors;
  };

  // Form State Actions
  const handleAddOwner = () => {
    setDataBaru(prev => [...prev, createEmptyDataBaruItem()]);
  };

  const handleRemoveOwner = (index: number) => {
    setDataBaru(prev => prev.filter((_, i) => i !== index));
  };

  const handleOwnerChange = (index: number, field: string, value: any) => {
    setDataBaru(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const handleEditAddOwner = () => {
    setEditDataBaru(prev => [...prev, createEmptyDataBaruItem()]);
  };

  const handleEditRemoveOwner = (index: number) => {
    setEditDataBaru(prev => prev.filter((_, i) => i !== index));
  };

  const handleEditOwnerChange = (index: number, field: string, value: any) => {
    setEditDataBaru(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  // Submit New Application
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const formData = {
      jenisPermohonan,
      nomorPelayanan,
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
        luasTanahBaru: item.luasTanahBaru !== '' ? Number(item.luasTanahBaru) : 0,
        luasBangunanBaru: item.luasBangunanBaru !== '' ? Number(item.luasBangunanBaru) : 0,
      })) : []
    };

    const errors = validateForm(formData as any);

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
        fetchData();
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(res.error || 'Gagal menyimpan permohonan.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Edit Form
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    setEditError('');
    setEditSuccess('');

    const formData = {
      jenisPermohonan: editJenis,
      nomorPelayanan: editNomorPelayanan,
      nop: editNop,
      noWhatsapp: editNoWhatsapp,
      namaPemilikLama: editNeedDataLama ? editNamaPemilikLama : null,
      alamatPemilikLama: editNeedDataLama ? editAlamatPemilikLama : null,
      kecamatanPemilikLama: editNeedDataLama ? editKecamatanPemilikLama : null,
      desaPemilikLama: editNeedDataLama ? editDesaPemilikLama : null,
      alamatObjekLama: editNeedDataLama ? editAlamatObjekLama : null,
      kecamatanObjekLama: editNeedDataLama ? editKecamatanObjekLama : null,
      desaObjekLama: editNeedDataLama ? editDesaObjekLama : null,
      luasTanahLama: editNeedDataLama && editLuasTanahLama !== '' ? Number(editLuasTanahLama) : null,
      luasBangunanLama: editNeedDataLama && editLuasBangunanLama !== '' ? Number(editLuasBangunanLama) : null,
      sertifikatLama: editNeedDataLama ? editSertifikatLama : null,
      dataBaru: editNeedDataBaru ? editDataBaru.map(item => ({
        ...item,
        luasTanahBaru: item.luasTanahBaru !== '' ? Number(item.luasTanahBaru) : 0,
        luasBangunanBaru: item.luasBangunanBaru !== '' ? Number(item.luasBangunanBaru) : 0,
      })) : []
    };

    const errors = validateForm(formData as any);
    if (Object.keys(errors).length > 0) {
      setEditFormErrors(errors);
      setEditError('Form kurang lengkap. Harap periksa detail isian merah di bawah.');
      return;
    }
    setEditFormErrors({});
    setLoading(true);

    try {
      const res = await updatePermohonan(editTarget.id, formData);
      if (res.success) {
        setEditSuccess('Perubahan data berhasil disimpan!');
        fetchData();
        setTimeout(() => {
          setEditTarget(null);
          setEditSuccess('');
        }, 1500);
      } else {
        setEditError(res.error || 'Gagal mengupdate data.');
      }
    } catch (err: any) {
      setEditError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  // Resubmit Revision
  const handleResubmit = (id: string) => {
    showConfirm({
      title: 'Konfirmasi Kirim Ulang',
      message: 'Apakah Anda yakin ingin melakukan resubmit untuk permohonan ini? Harap periksa kembali semua data sebelum melanjutkan.',
      onConfirm: async () => {
        setLoading(true);
        try {
          const res = await resubmitPermohonan(id);
          if (res.success) {
            alert('Resubmit berhasil! Status dialihkan kembali ke diajukan (SUBMITTED) & notifikasi terkirim.');
            fetchData();
          } else {
            alert(res.error || 'Gagal melakukan resubmit.');
          }
        } catch (err: any) {
          alert(err.message || 'Terjadi kesalahan.');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Populate Edit Modal
  const openEditModal = (item: any) => {
    setEditTarget(item);
    setEditJenis(item.jenisPermohonan);
    setEditNomorPelayanan(item.nomorPelayanan || '');
    setEditNop(item.nop || '');
    setEditNoWhatsapp(item.noWhatsapp || '');

    setEditNamaPemilikLama(item.namaPemilikLama || '');
    setEditAlamatPemilikLama(item.alamatPemilikLama || '');
    setEditKecamatanPemilikLama(item.kecamatanPemilikLama || '');
    setEditDesaPemilikLama(item.desaPemilikLama || '');
    setEditAlamatObjekLama(item.alamatObjekLama || '');
    setEditKecamatanObjekLama(item.kecamatanObjekLama || '');
    setEditDesaObjekLama(item.desaObjekLama || '');
    setEditLuasTanahLama(item.luasTanahLama !== null && item.luasTanahLama !== undefined ? String(item.luasTanahLama) : '');
    setEditLuasBangunanLama(item.luasBangunanLama !== null && item.luasBangunanLama !== undefined ? String(item.luasBangunanLama) : '');
    setEditSertifikatLama(item.sertifikatLama || '');

    if (item.dataBaru && item.dataBaru.length > 0) {
      setEditDataBaru(item.dataBaru.map((dbItem: any) => ({
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
      setEditDataBaru([createEmptyDataBaruItem()]);
    }

    setEditFormErrors({});
    setEditError('');
    setEditSuccess('');
  };

  // Search filter
  const filteredList = list.filter((item) => {
    const matchesSearch =
      item.namaWajibPajak.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nop.includes(searchQuery) ||
      item.nomorPermohonan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.nomorPelayanan && item.nomorPelayanan.includes(searchQuery));

    const matchesStatus = filterStatus === 'ALL' || item.status === filterStatus;
    const matchesJenis = filterJenisLayanan === 'ALL' || item.jenisPermohonan === filterJenisLayanan;

    return matchesSearch && matchesStatus && matchesJenis;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const activePage = currentPage > totalPages ? 1 : currentPage;
  const paginatedList = filteredList.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage
  );

  // Converts DB uppercase key like "SUBMITTED" → "Submitted", "MUTASI_SEBAGIAN" → "Mutasi Sebagian"
  const toTitleCase = (str: string) =>
    str
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, c => c.toUpperCase());

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200/50';
      case 'REVISION':
        return 'bg-amber-100 text-amber-800 border-amber-200/50 animate-pulse';
      case 'BUNDLED':
        return 'bg-blue-100 text-blue-800 border-blue-200/50';
      case 'ARCHIVED':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200/50';
      case 'COMPLETED':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200/50';
      case 'REJECTED':
        return 'bg-rose-100 text-rose-800 border-rose-200/50';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200/50';
    }
  };

  return (
    <div id="penginput-board-root" className="w-full font-sans select-none animate-fadeIn flex flex-col gap-6">

      {/* Show full skeleton when initial list is loading */}
      {listLoading && viewMode === 'list' && <PenginputSkeleton />}

      {/* Hide content while skeleton is showing on first load */}
      <div className={`flex flex-col gap-6 ${listLoading && viewMode === 'list' ? 'hidden' : ''}`}>

        {/* 1. Header with View switcher toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#f3f6f9] p-5 rounded-2xl shadow-sm">
          <div>
            <h2 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5 tracking-tight">
              Workspace Petugas Penginput
            </h2>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <div className="bg-slate-100 p-1 rounded-xl border-transparent/80 flex items-center">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${viewMode === 'list'
                  ? 'bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] text-[#2c333f] shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Daftar permohonan</span>
              </button>
              <button
                onClick={() => setViewMode('form')}
                className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${viewMode === 'form'
                  ? 'bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] text-[#2c333f] shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Entri baru</span>
              </button>
            </div>
          </div>
        </div>
        {/* ==================== VIEW MODE: LIST (Spacious Table View) ==================== */}
        {viewMode === 'list' && (
          <div className="bg-[#f3f6f9] rounded-2xl shadow-sm flex flex-col overflow-hidden min-h-[500px]">

            {/* Action Row: Search and quick add */}
            <div className="p-5 border-b border-gray-200/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-black text-[11px] uppercase tracking-wider text-slate-700">
                  Daftar permohonan
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
                {/* Search input */}
                <div className={`relative w-full sm:w-72 p-[1.5px] rounded-lg transition-all duration-300 ${isSearchFocused
                  ? 'bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] shadow-xs'
                  : 'bg-slate-200/90'
                  }`}>
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className="w-full pl-8.5 pr-8 py-1.5 bg-white border-transparent rounded-[7px] text-xs font-semibold text-gray-755 placeholder-gray-400 focus:outline-none transition-all"
                    placeholder="Cari nomor pelayanan, NOP, WP..."
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-655 z-10">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Jenis Layanan (Icon Popover) */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                    className={`p-2 rounded-lg border border-transparent transition-all duration-200 flex items-center justify-center cursor-pointer ${filterJenisLayanan !== 'ALL'
                      ? 'bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] text-[#2c333f] font-bold scale-105 shadow-3xs'
                      : 'bg-transparent hover:bg-slate-200/50 text-slate-500'
                      }`}
                    title="Filter Jenis Layanan"
                  >
                    <Filter className="w-4 h-4" />
                    {filterJenisLayanan !== 'ALL' && (
                      <span className="absolute -top-1.5 -right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
                    )}
                  </button>

                  {isFilterDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsFilterDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-100 rounded-xl shadow-lg py-2 z-50 animate-fadeIn text-xs text-slate-700 font-semibold flex flex-col gap-0.5">
                        <div className="px-3 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-50 mb-1 select-none">
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
                                setCurrentPage(1);
                                setIsFilterDropdownOpen(false);
                              }}
                              className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${isSelected ? 'text-indigo-650 bg-indigo-50/30 font-bold' : ''
                                }`}
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
              </div>
            </div>

            {/* Filtering Chips */}
            <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2 overflow-x-auto scrollbar-none bg-[#f3f6f9] shrink-0">
              {['ALL', 'SUBMITTED', 'REVISION'].map((st) => {
                const isActive = filterStatus === st;
                const count = st === 'ALL' ? list.length : list.filter(item => item.status === st).length;
                return (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-3.5 py-1 rounded-full text-[10px] font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer border ${isActive
                      ? 'bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] text-[#2c333f] border-transparent shadow-sm'
                      : 'bg-white text-slate-500 hover:bg-slate-50 border-gray-200/90'
                      }`}
                  >
                    <span>{st === 'ALL' ? 'Semua' : st.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-extrabold ${isActive ? 'bg-[#2c333f]/10 text-[#2c333f]' : 'bg-slate-100 text-slate-500'
                      }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Table */}
            <div className="flex-1 overflow-x-auto scrollbar-thin">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-extrabold text-slate-450 uppercase tracking-wider text-left border-b border-slate-200">
                    <th className="py-3 px-5 text-center">No</th>
                    <th className="py-3 px-2 text-center select-none w-10">⭐</th>
                    <th className="py-3 px-5">Tanggal Input</th>
                    <th className="py-3 px-5">No. Pelayanan / NOP</th>
                    <th className="py-3 px-5">Nama WP</th>
                    <th className="py-3 px-5">Jenis Layanan</th>
                    <th className="py-3 px-5 text-center">Status</th>
                    <th className="py-3 px-5 text-right pr-6 w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {listLoading ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center">
                        <span className="inline-block w-6 h-6 rounded-full border-2 border-indigo-600/30 border-t-indigo-600 animate-spin" />
                      </td>
                    </tr>
                  ) : filteredList.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-16 px-5 text-center text-xs text-gray-400 italic">
                        Belum ada data permohonan yang sesuai.
                      </td>
                    </tr>
                  ) : (
                    paginatedList.map((item, index) => {
                      const itemNumber = (activePage - 1) * itemsPerPage + index + 1;
                      const tanggalText = new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
                      const canEdit = (item.status === 'SUBMITTED' && !item.bundleId) || item.status === 'REVISION';
                      const showResubmit = item.status === 'REVISION';

                      return (
                        <tr
                          key={item.id}
                          onClick={() => setSelectedRequest(item)}
                          className="hover:bg-indigo-50/20 transition-all cursor-pointer group"
                        >
                          <td className="py-4 px-5 text-center text-xs font-bold text-gray-400 font-mono">
                            {itemNumber}
                          </td>
                          <td className="py-4 px-2 text-center" onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(item.id);
                          }}>
                            <button
                              type="button"
                              className="p-1 hover:scale-110 active:scale-95 transition-all text-slate-300 hover:text-amber-500 cursor-pointer"
                              title={item.isFavorite ? "Hapus dari Favorit" : "Tandai Favorit"}
                            >
                              <Star className={`w-4 h-4 ${item.isFavorite
                                ? 'text-amber-500 fill-amber-500 shadow-3xs'
                                : 'text-slate-350'
                                }`} />
                            </button>
                          </td>
                          <td className="py-4 px-5 text-xs font-semibold text-gray-500 whitespace-nowrap">
                            {tanggalText}
                          </td>
                          <td className="py-4 px-5 min-w-[220px]">
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-slate-805 font-mono tracking-tight">
                                {item.nomorPelayanan || item.nomorPermohonan}
                              </span>
                              <span className="text-[10px] text-gray-400 font-semibold font-mono mt-0.5">
                                {formatNop(item.nop)}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-5">
                            <span className="text-xs font-bold text-slate-700 whitespace-nowrap capitalize">
                              {item.namaWajibPajak.toLowerCase()}
                            </span>
                          </td>
                          <td className="py-4 px-5">
                            <span
                              className="text-[9px] font-bold text-slate-500 bg-slate-100 border border-slate-205 px-2.5 py-0.5 rounded uppercase font-sans tracking-wide"
                              title={item.jenisPermohonan.replace(/_/g, ' ')}
                            >
                              {getAbbreviatedJenis(item.jenisPermohonan)}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-center">
                            <span className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${getStatusBadgeClass(item.status)}`}>
                              {toTitleCase(item.status)}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-right pr-6 whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2.5" onClick={(e) => e.stopPropagation()}>
                              {showResubmit && (
                                <button
                                  onClick={() => handleResubmit(item.id)}
                                  disabled={loading}
                                  className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                                  title="Resubmit (Kirim Ulang Kelengkapan)"
                                >
                                  <RefreshCw className="w-3.5 h-3.5 text-amber-650" />
                                </button>
                              )}
                              {canEdit ? (
                                <button
                                  onClick={() => openEditModal(item)}
                                  disabled={loading}
                                  className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                                  title="Edit Data"
                                >
                                  <Edit className="w-3.5 h-3.5 text-indigo-600" />
                                </button>
                              ) : (
                                <span className="text-[10px] text-gray-400 select-none flex items-center gap-1 font-semibold" title="Terkunci">
                                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer / Pagination */}
            {totalPages > 1 && (
              <div className="px-5 py-4 border-t border-gray-200/60 bg-[#f3f6f9] flex flex-col sm:flex-row items-center justify-between gap-4 select-none shrink-0">
                <span className="text-[11px] font-semibold text-gray-500 font-sans">
                  Menampilkan {((activePage - 1) * itemsPerPage) + 1} - {Math.min(activePage * itemsPerPage, filteredList.length)} dari {filteredList.length} data
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={activePage === 1}
                    className="p-1.5 rounded-lg border-transparent bg-white text-gray-500 hover:bg-[#f1f5f9] disabled:opacity-40 transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${activePage === page
                        ? 'bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] text-[#1e2022] font-extrabold shadow-sm scale-105 z-10'
                        : 'border-transparent bg-white text-gray-500 hover:bg-[#f1f5f9]'
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={activePage === totalPages}
                    className="p-1.5 rounded-lg border-transparent bg-white text-gray-500 hover:bg-[#f1f5f9] disabled:opacity-40 transition-all cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== VIEW MODE: FORM (Centered Input Form) ==================== */}
        {viewMode === 'form' && (
          <div className="w-full bg-[#f3f6f9] rounded-2xl border-transparent/80 shadow-sm overflow-hidden animate-fadeIn">
            {/* Header */}
            <div className="border-b border-gray-200/60 px-6 py-5 flex items-center justify-between bg-[#f3f6f9]">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setViewMode('list')}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-gray-500 hover:text-gray-800 transition-all cursor-pointer"
                  title="Kembali ke Daftar"
                >
                  <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                </button>
                <div>
                  <span className="font-extrabold text-[13px] uppercase tracking-wider text-slate-700 font-display">
                    FORMULIR ENTRI PERMOHONAN BARU
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
                <div className="bg-emerald-50/80 border border-emerald-250/65 text-emerald-805 text-xs font-bold rounded-xl px-4 py-3 flex items-start gap-2.5 animate-fadeIn shrink-0">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-550 mt-0.5" />
                  <span>{success}</span>
                </div>
              )}

              {/* Split cards grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">

                {/* Card 1: Data Utama */}
                <div className="flex flex-col gap-4 bg-[#f3f6f9] border-transparent rounded-2xl p-5">
                  <div className="flex items-center text-indigo-600 font-extrabold text-[11px] uppercase tracking-wider border-b border-slate-100 pb-2 select-none">
                    <span>Data utama</span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold uppercase text-gray-500 tracking-wider">Jenis layanan permohonan</label>
                    <select
                      value={jenisPermohonan}
                      onChange={(e) => setJenisPermohonan(e.target.value)}
                      disabled={loading}
                      className="w-full bg-white border-transparent rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-700 focus:outline-none focus:border-indigo-500 transition-all cursor-pointer shadow-3xs"
                    >
                      {JENIS_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold uppercase text-gray-500 tracking-wider">Nomor pelayanan</label>
                      <input
                        type="text"

                        value={nomorPelayanan}
                        onChange={(e) => setNomorPelayanan(e.target.value)}
                        disabled={loading}
                        className="w-full bg-white border-transparent rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-755 focus:outline-none focus:border-indigo-500 transition-all shadow-3xs"
                      />
                      {formErrors.nomorPelayanan && <span className="text-[10px] text-red-655 font-bold pl-1">{formErrors.nomorPelayanan}</span>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold uppercase text-gray-500 tracking-wider">Nomor objek pajak (NOP)</label>
                      <input
                        type="text"
                        maxLength={24}
                        placeholder="36.19.150.002.003-0123.0"
                        value={nop}
                        onChange={(e) => {
                          // Format: XX.XX.XXX.XXX.XXX-XXXX.X (2+2+3+3+3+4+1 = 18 digits)
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
                        className="w-full bg-white border-transparent rounded-xl px-3.5 py-2.5 text-xs font-bold font-mono text-gray-755 focus:outline-none focus:border-indigo-500 transition-all shadow-3xs"
                      />
                      {formErrors.nop && <span className="text-[10px] text-red-655 font-bold pl-1">{formErrors.nop}</span>}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold uppercase text-gray-500 tracking-wider">Nomor WhatsApp WP</label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Contoh: 081234567890"
                        value={noWhatsapp}
                        onChange={(e) => setNoWhatsapp(e.target.value.replace(/[^\d+]/g, ''))}
                        disabled={loading}
                        className="w-full bg-white border-transparent rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-semibold text-gray-755 focus:outline-none focus:border-indigo-500 transition-all shadow-3xs"
                      />
                    </div>
                    {formErrors.noWhatsapp && <span className="text-[10px] text-red-655 font-bold pl-1">{formErrors.noWhatsapp}</span>}
                  </div>
                </div>

                {/* Card 2: Data Lama */}
                <div className="flex flex-col gap-4 bg-[#f3f6f9] border-transparent rounded-2xl p-5">
                  <div className="flex items-center text-indigo-600 font-extrabold text-[11px] uppercase tracking-wider select-none border-b border-slate-100 pb-2">
                    <span>Data lama (pemilik & objek asal)</span>
                  </div>

                  {!needDataLama ? (
                    <div className="flex-1 flex items-center justify-center py-10 text-center text-xs text-slate-400 font-semibold bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                      Bagian ini tidak diperlukan untuk layanan objek pajak baru.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 flex-1 justify-between">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-extrabold uppercase text-gray-500 tracking-wider">Nama pemilik lama</label>
                        <input
                          type="text"

                          value={namaPemilikLama}
                          onChange={(e) => setNamaPemilikLama(e.target.value)}
                          disabled={loading}
                          className="w-full bg-white border-transparent rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-750 focus:outline-none focus:border-indigo-500 transition-all shadow-3xs"
                        />
                        {formErrors.namaPemilikLama && <span className="text-[10px] text-red-655 font-bold pl-1">{formErrors.namaPemilikLama}</span>}
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-extrabold uppercase text-gray-500 tracking-wider">Alamat pemilik lama</label>
                        <input
                          type="text"

                          value={alamatPemilikLama}
                          onChange={(e) => setAlamatPemilikLama(e.target.value)}
                          disabled={loading}
                          className="w-full bg-white border-transparent rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-750 focus:outline-none focus:border-indigo-500 transition-all shadow-3xs"
                        />
                        {formErrors.alamatPemilikLama && <span className="text-[10px] text-red-655 font-bold pl-1">{formErrors.alamatPemilikLama}</span>}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-extrabold uppercase text-gray-500 tracking-wider">Kecamatan pemilik</label>
                          <input
                            type="text"

                            value={kecamatanPemilikLama}
                            onChange={(e) => setKecamatanPemilikLama(e.target.value)}
                            disabled={loading}
                            className="w-full bg-white border-transparent rounded-xl px-3.5 py-2 text-xs font-semibold text-gray-750 focus:outline-none focus:border-indigo-500 transition-all shadow-3xs"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-extrabold uppercase text-gray-500 tracking-wider">Desa pemilik</label>
                          <input
                            type="text"

                            value={desaPemilikLama}
                            onChange={(e) => setDesaPemilikLama(e.target.value)}
                            disabled={loading}
                            className="w-full bg-white border-transparent rounded-xl px-3.5 py-2 text-xs font-semibold text-gray-750 focus:outline-none focus:border-indigo-500 transition-all shadow-3xs"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-extrabold uppercase text-gray-500 tracking-wider">Alamat objek pajak</label>
                        <input
                          type="text"

                          value={alamatObjekLama}
                          onChange={(e) => setAlamatObjekLama(e.target.value)}
                          disabled={loading}
                          className="w-full bg-white border-transparent rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-755 focus:outline-none focus:border-indigo-500 transition-all shadow-3xs"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-extrabold uppercase text-gray-500 tracking-wider">Kecamatan objek lama</label>
                          <input
                            type="text"
                            value={kecamatanObjekLama}
                            onChange={(e) => setKecamatanObjekLama(e.target.value)}
                            disabled={loading}
                            className="w-full bg-white border-transparent rounded-xl px-3.5 py-2 text-xs font-semibold text-gray-750 focus:outline-none focus:border-indigo-500 transition-all shadow-3xs"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-extrabold uppercase text-gray-500 tracking-wider">Desa objek lama</label>
                          <input
                            type="text"
                            value={desaObjekLama}
                            onChange={(e) => setDesaObjekLama(e.target.value)}
                            disabled={loading}
                            className="w-full bg-white border-transparent rounded-xl px-3.5 py-2 text-xs font-semibold text-gray-750 focus:outline-none focus:border-indigo-500 transition-all shadow-3xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-extrabold uppercase text-gray-500 tracking-wider">Luas tanah asal (m²)</label>
                          <input
                            type="number"

                            value={luasTanahLama}
                            onChange={(e) => setLuasTanahLama(e.target.value)}
                            disabled={loading}
                            className="w-full bg-white border-transparent rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-750 focus:outline-none focus:border-indigo-500 transition-all shadow-3xs"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-extrabold uppercase text-gray-500 tracking-wider">Luas bangunan asal (m²)</label>
                          <input
                            type="number"

                            value={luasBangunanLama}
                            onChange={(e) => setLuasBangunanLama(e.target.value)}
                            disabled={loading}
                            className="w-full bg-white border-transparent rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-750 focus:outline-none focus:border-indigo-500 transition-all shadow-3xs"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-extrabold uppercase text-gray-500 tracking-wider">Nomor sertifikat lama</label>
                        <input
                          type="text"
                          placeholder="Contoh: SHM No. 12345"
                          value={sertifikatLama}
                          onChange={(e) => setSertifikatLama(e.target.value)}
                          disabled={loading}
                          className="w-full bg-white border-transparent rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-750 focus:outline-none focus:border-indigo-500 transition-all shadow-3xs"
                        />
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Card 3: Data Baru (Dynamic Array) */}
              {needDataBaru && (
                <div className="flex flex-col gap-5 col-span-1 lg:col-span-2">
                  <div className="flex items-center justify-between border-b border-gray-200/50 pb-2.5 px-1 select-none">
                    <div className="flex items-center text-indigo-600 font-extrabold text-[11px] uppercase tracking-wider">
                      <span>Data baru (pemilik & objek baru)</span>
                    </div>
                    {jenisPermohonan === 'MUTASI_SEBAGIAN' && (
                      <button
                        type="button"
                        onClick={handleAddOwner}
                        disabled={loading}
                        className="px-2.5 py-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Tambah pemilik baru
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col gap-6">
                    {dataBaru.map((item, idx) => (
                      <div key={idx} className={`flex flex-col gap-4 bg-[#f3f6f9] border-transparent rounded-2xl p-5 relative ${dataBaru.length > 1 ? 'pt-12' : ''}`}>
                        {dataBaru.length > 1 && (
                          <div className="absolute top-3 left-5 right-5 flex items-center justify-between border-b border-slate-100 pb-1.5 select-none">
                            <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider">Pemilik baru #{idx + 1}</span>
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

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                          {/* Subjek Pajak */}
                          <div className="flex flex-col gap-4">

                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-extrabold uppercase text-gray-500 tracking-wider">Nama pemilik baru</label>
                              <input
                                type="text"

                                value={item.namaPemilikBaru}
                                onChange={(e) => handleOwnerChange(idx, 'namaPemilikBaru', e.target.value)}
                                disabled={loading}
                                className="w-full bg-white border-transparent rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-805 focus:outline-none focus:border-indigo-500 transition-all shadow-3xs"
                              />
                              {formErrors[`dataBaru.${idx}.namaPemilikBaru`] && <span className="text-[10px] text-red-655 font-bold pl-1">{formErrors[`dataBaru.${idx}.namaPemilikBaru`]}</span>}
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-extrabold uppercase text-gray-500 tracking-wider">Alamat pemilik baru</label>
                              <input
                                type="text"

                                value={item.alamatPemilikBaru}
                                onChange={(e) => handleOwnerChange(idx, 'alamatPemilikBaru', e.target.value)}
                                disabled={loading}
                                className="w-full bg-white border-transparent rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-755 focus:outline-none focus:border-indigo-500 transition-all shadow-3xs"
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-extrabold uppercase text-gray-500 tracking-wider">Kecamatan pemilik</label>
                                <input
                                  type="text"

                                  value={item.kecamatanPemilikBaru}
                                  onChange={(e) => handleOwnerChange(idx, 'kecamatanPemilikBaru', e.target.value)}
                                  disabled={loading}
                                  className="w-full bg-white border-transparent rounded-xl px-3 py-2 text-xs font-semibold text-gray-755 focus:outline-none transition-all shadow-3xs"
                                />
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-extrabold uppercase text-gray-500 tracking-wider">Desa pemilik</label>
                                <input
                                  type="text"

                                  value={item.desaPemilikBaru}
                                  onChange={(e) => handleOwnerChange(idx, 'desaPemilikBaru', e.target.value)}
                                  disabled={loading}
                                  className="w-full bg-white border-transparent rounded-xl px-3 py-2 text-xs font-semibold text-gray-755 focus:outline-none transition-all shadow-3xs"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Objek Pajak */}
                          <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-extrabold uppercase text-gray-500 tracking-wider">Alamat objek baru</label>
                              <input
                                type="text"

                                value={item.alamatObjekBaru}
                                onChange={(e) => handleOwnerChange(idx, 'alamatObjekBaru', e.target.value)}
                                disabled={loading}
                                className="w-full bg-white border-transparent rounded-xl px-3 py-2 text-xs font-semibold text-gray-755 focus:outline-none transition-all shadow-3xs"
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-extrabold uppercase text-gray-500 tracking-wider">Kecamatan objek</label>
                                <input
                                  type="text"

                                  value={item.kecamatanObjekBaru}
                                  onChange={(e) => handleOwnerChange(idx, 'kecamatanObjekBaru', e.target.value)}
                                  disabled={loading}
                                  className="w-full bg-white border-transparent rounded-xl px-3 py-2 text-xs font-semibold text-gray-755 focus:outline-none transition-all shadow-3xs"
                                />
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-extrabold uppercase text-gray-500 tracking-wider">Desa objek</label>
                                <input
                                  type="text"

                                  value={item.desaObjekBaru}
                                  onChange={(e) => handleOwnerChange(idx, 'desaObjekBaru', e.target.value)}
                                  disabled={loading}
                                  className="w-full bg-white border-transparent rounded-xl px-3 py-2 text-xs font-semibold text-gray-755 focus:outline-none transition-all shadow-3xs"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-extrabold uppercase text-gray-500 tracking-wider">Luas tanah (m²)</label>
                                <input
                                  type="number"

                                  value={item.luasTanahBaru}
                                  onChange={(e) => handleOwnerChange(idx, 'luasTanahBaru', e.target.value)}
                                  disabled={loading}
                                  className="w-full bg-white border-transparent rounded-xl px-3 py-2 text-xs font-semibold text-gray-755 focus:outline-none transition-all shadow-3xs"
                                />
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-extrabold uppercase text-gray-500 tracking-wider">Luas bangunan (m²)</label>
                                <input
                                  type="number"

                                  value={item.luasBangunanBaru}
                                  onChange={(e) => handleOwnerChange(idx, 'luasBangunanBaru', e.target.value)}
                                  disabled={loading}
                                  className="w-full bg-white border-transparent rounded-xl px-3 py-2 text-xs font-semibold text-gray-755 focus:outline-none transition-all shadow-3xs"
                                />
                              </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-extrabold uppercase text-gray-500 tracking-wider">Nomor sertifikat baru</label>
                              <input
                                type="text"
                                placeholder="Contoh: SHM No. 67890"
                                value={item.sertifikatBaru}
                                onChange={(e) => handleOwnerChange(idx, 'sertifikatBaru', e.target.value)}
                                disabled={loading}
                                className="w-full bg-white border-transparent rounded-xl px-3 py-2.5 text-xs font-semibold text-gray-850 focus:outline-none focus:border-indigo-500 transition-all shadow-3xs"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Form actions footer */}
              <div className="flex items-center justify-end gap-3 pt-3 select-none">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className="px-4 py-2 border-transparent hover:bg-slate-50 text-gray-550 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] hover:opacity-90 text-[#2c333f] font-bold text-xs uppercase tracking-wider py-2.5 px-6 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Kirim permohonan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================= DETAILS MODAL OVERLAY ================= */}
        {selectedRequest && (
          <div
            className="fixed inset-0 bg-slate-900/35 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn"
            onClick={() => setSelectedRequest(null)}
          >
            <div
              className="bg-white rounded-2xl border-transparent max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200/60 bg-[#f8fafc] flex items-center justify-between select-none">
                <div className="flex items-center gap-2">
                  <FileText className="w-4.5 h-4.5 text-indigo-600" />
                  <span className="font-bold text-[13px] text-slate-850 font-mono">
                    {selectedRequest.nomorPelayanan || selectedRequest.nomorPermohonan}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-gray-400 hover:text-gray-700 font-bold transition-all cursor-pointer p-1 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 flex flex-col gap-5 overflow-y-auto scrollbar-thin text-xs">

                {/* Grid 1: General Info */}
                <div className="grid grid-cols-2 gap-4 bg-[#f8fafc] p-4 rounded-xl border-transparent/50">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-gray-450 font-extrabold uppercase tracking-wider">Jenis layanan</span>
                    <span className="text-xs font-bold text-slate-800 mt-0.5">{selectedRequest.jenisPermohonan?.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-gray-455 font-extrabold uppercase tracking-wider">Status berkas</span>
                    <div className="mt-1">
                      <span className={`inline-block text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${getStatusBadgeClass(selectedRequest.status)}`}>
                        {selectedRequest.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-gray-455 font-extrabold uppercase tracking-wider">Tanggal pengajuan</span>
                    <span className="text-xs font-bold text-slate-800 mt-0.5">{new Date(selectedRequest.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-gray-455 font-extrabold uppercase tracking-wider">NOP objek</span>
                    <span className="text-xs font-bold text-slate-800 mt-0.5 font-mono">{formatNop(selectedRequest.nop)}</span>
                  </div>
                </div>

                {/* Data Lama details */}
                {selectedRequest.namaPemilikLama && (
                  <div className="flex flex-col gap-3 border-t border-slate-100 pt-4">
                    <h4 className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest">Informasi pemilik lama & objek asal</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-gray-400 font-extrabold uppercase">Nama pemilik lama</span>
                        <span className="text-xs font-bold text-gray-700">{selectedRequest.namaPemilikLama}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-gray-400 font-extrabold uppercase">Nomor WhatsApp WP</span>
                        <span className="text-xs font-bold text-indigo-600 font-mono flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-indigo-505" />
                          {selectedRequest.noWhatsapp}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-gray-400 font-extrabold uppercase">Alamat pemilik lama</span>
                        <span className="text-xs font-semibold text-gray-600">{selectedRequest.alamatPemilikLama || "-"}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-gray-400 font-extrabold uppercase">Alamat letak objek</span>
                        <span className="text-xs font-semibold text-gray-600">{selectedRequest.alamatObjekLama || "-"}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-gray-400 font-extrabold uppercase">Luas tanah / bangunan</span>
                        <span className="text-xs font-semibold text-gray-600">{selectedRequest.luasTanahLama || 0} m² / {selectedRequest.luasBangunanLama || 0} m²</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-gray-400 font-extrabold uppercase">Nomor sertifikat</span>
                        <span className="text-xs font-semibold text-gray-600">{selectedRequest.sertifikatLama || "-"}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Data Baru details (List/Array) */}
                {selectedRequest.dataBaru && selectedRequest.dataBaru.length > 0 && (
                  <div className="flex flex-col gap-3 border-t border-slate-100 pt-4">
                    <h4 className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest">Informasi pemilik & objek baru ({selectedRequest.dataBaru.length})</h4>
                    <div className="flex flex-col gap-4">
                      {selectedRequest.dataBaru.map((db: any, index: number) => (
                        <div key={db.id || index} className="p-3 bg-slate-50 border border-slate-150 rounded-xl flex flex-col gap-2">
                          <span className="text-[9px] font-extrabold text-indigo-600 uppercase tracking-wider">Pemilik baru #{index + 1}</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                            <p className="text-gray-400 font-semibold">Nama pemilik baru: <span className="text-gray-800 font-bold">{db.namaPemilikBaru}</span></p>
                            <p className="text-gray-400 font-semibold">Alamat pemilik: <span className="text-gray-800 font-bold">{db.alamatPemilikBaru}</span></p>
                            <p className="text-gray-400 font-semibold">Kecamatan / desa: <span className="text-gray-800 font-bold">{db.kecamatanPemilikBaru} / {db.desaPemilikBaru}</span></p>
                            <p className="text-gray-400 font-semibold">Alamat objek baru: <span className="text-gray-800 font-bold">{db.alamatObjekBaru}</span></p>
                            <p className="text-gray-400 font-semibold">Luas tanah / bangunan: <span className="text-gray-800 font-bold">{db.luasTanahBaru} m² / {db.luasBangunanBaru} m²</span></p>
                            <p className="text-gray-400 font-semibold">Sertifikat baru: <span className="text-gray-800 font-bold">{db.sertifikatBaru}</span></p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Footer */}
              <div className="px-6 py-3 border-t border-gray-200/60 bg-[#f8fafc] flex justify-end select-none">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase px-4 py-2 rounded-lg transition-all shadow-sm cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* EDIT MODAL POPUP DIALOG (Scrollable Inner Content) */}
        {editTarget && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl p-6 border-transparent flex flex-col gap-4 animate-scaleUp">

              <div className="flex items-center justify-between border-b border-slate-100 pb-3 select-none">
                <h3 className="text-md font-bold text-gray-900 flex items-center gap-1.5">
                  <Edit className="w-4.5 h-4.5 text-indigo-600" /> Edit Permohonan {editTarget.nomorPermohonan}
                </h3>
                <button
                  onClick={() => setEditTarget(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {editError && (
                <div className="bg-red-50/80 border border-red-200 text-red-700 text-xs font-bold rounded-xl px-4 py-2.5 flex items-start gap-2 animate-fadeIn">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                  <span>{editError}</span>
                </div>
              )}

              {editSuccess && (
                <div className="bg-emerald-50/80 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl px-4 py-2.5 flex items-start gap-2 animate-fadeIn">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
                  <span>{editSuccess}</span>
                </div>
              )}

              <form onSubmit={handleUpdate} className="flex flex-col gap-4">

                {/* Scrollable Form Body Container */}
                <div className="overflow-y-auto max-h-[60vh] pr-2 flex flex-col gap-6">

                  {/* EDIT PART 1: DATA UTAMA */}
                  <div className="flex flex-col gap-4 p-4 border-transparent rounded-xl bg-slate-50/20">
                    <h4 className="text-xs font-extrabold text-indigo-700 uppercase tracking-widest border-b border-slate-100 pb-1.5 mb-1">1. Data Utama</h4>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-gray-700 uppercase tracking-widest pl-1">Jenis Layanan Permohonan</label>
                      <select
                        value={editJenis}
                        onChange={(e) => setEditJenis(e.target.value)}
                        disabled={loading}
                        className="w-full text-xs font-bold bg-white border-transparent rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500 text-gray-800"
                      >
                        {JENIS_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-gray-700 uppercase tracking-widest pl-1">No. Pelayanan</label>
                        <input
                          type="text"
                          value={editNomorPelayanan}
                          onChange={(e) => setEditNomorPelayanan(e.target.value)}
                          disabled={loading}
                          className="w-full text-xs font-semibold bg-white border-transparent focus:outline-none focus:border-indigo-500 rounded-xl px-3 pr-4 py-2.5 transition-all text-gray-800"
                        />
                        {editFormErrors.nomorPelayanan && <span className="text-[10px] text-red-600 font-bold pl-1">{editFormErrors.nomorPelayanan}</span>}
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-gray-700 uppercase tracking-widest pl-1">Nomor Objek Pajak (NOP)</label>
                        <input
                          type="text"
                          maxLength={18}
                          value={editNop}
                          onChange={(e) => setEditNop(e.target.value.replace(/\D/g, ''))}
                          disabled={loading}
                          className="w-full text-xs font-semibold bg-white border-transparent focus:outline-none focus:border-indigo-500 rounded-xl px-3 pr-4 py-2.5 transition-all text-gray-800 font-mono"
                        />
                        {editFormErrors.nop && <span className="text-[10px] text-red-600 font-bold pl-1">{editFormErrors.nop}</span>}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-gray-700 uppercase tracking-widest pl-1">Nomor WhatsApp WP</label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={editNoWhatsapp}
                          onChange={(e) => setEditNoWhatsapp(e.target.value.replace(/[^\d+]/g, ''))}
                          disabled={loading}
                          className="w-full text-xs font-semibold bg-white border-transparent focus:outline-none focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 transition-all text-gray-800"
                        />
                      </div>
                      {editFormErrors.noWhatsapp && <span className="text-[10px] text-red-600 font-bold pl-1">{editFormErrors.noWhatsapp}</span>}
                    </div>
                  </div>

                  {/* EDIT PART 2: DATA LAMA */}
                  <div className="flex flex-col gap-4 p-4 border-transparent rounded-xl bg-slate-50/20">
                    <h4 className="text-xs font-extrabold text-indigo-700 uppercase tracking-widest border-b border-slate-100 pb-1.5 mb-1">2. Data Lama (Pemilik & Objek Asal)</h4>

                    {!editNeedDataLama ? (
                      <div className="text-center py-6 text-xs text-slate-400 font-semibold bg-slate-50/50 rounded-xl border border-dashed border-slate-200 select-none">
                        Bagian ini tidak diperlukan untuk layanan objek pajak baru.
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-gray-700 uppercase tracking-widest pl-1">Nama Pemilik Lama</label>
                          <input
                            type="text"
                            value={editNamaPemilikLama}
                            onChange={(e) => setEditNamaPemilikLama(e.target.value)}
                            disabled={loading}
                            className="w-full text-xs font-semibold bg-white border-transparent focus:outline-none focus:border-indigo-500 rounded-xl px-3 pr-4 py-2.5 transition-all text-gray-800"
                          />
                          {editFormErrors.namaPemilikLama && <span className="text-[10px] text-red-600 font-bold pl-1">{editFormErrors.namaPemilikLama}</span>}
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-gray-700 uppercase tracking-widest pl-1">Alamat Pemilik Lama</label>
                          <input
                            type="text"
                            value={editAlamatPemilikLama}
                            onChange={(e) => setEditAlamatPemilikLama(e.target.value)}
                            disabled={loading}
                            className="w-full text-xs font-semibold bg-white border-transparent focus:outline-none focus:border-indigo-500 rounded-xl px-3 pr-4 py-2.5 transition-all text-gray-800"
                          />
                          {editFormErrors.alamatPemilikLama && <span className="text-[10px] text-red-600 font-bold pl-1">{editFormErrors.alamatPemilikLama}</span>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-gray-700 uppercase tracking-widest pl-1">Kecamatan Pemilik</label>
                            <input
                              type="text"
                              value={editKecamatanPemilikLama}
                              onChange={(e) => setEditKecamatanPemilikLama(e.target.value)}
                              disabled={loading}
                              className="w-full text-xs font-semibold bg-white border-transparent focus:outline-none focus:border-indigo-500 rounded-xl px-3 pr-4 py-2.5 transition-all text-gray-800"
                            />
                            {editFormErrors.kecamatanPemilikLama && <span className="text-[10px] text-red-600 font-bold pl-1">{editFormErrors.kecamatanPemilikLama}</span>}
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-gray-700 uppercase tracking-widest pl-1">Desa Pemilik</label>
                            <input
                              type="text"
                              value={editDesaPemilikLama}
                              onChange={(e) => setEditDesaPemilikLama(e.target.value)}
                              disabled={loading}
                              className="w-full text-xs font-semibold bg-white border-transparent focus:outline-none focus:border-indigo-500 rounded-xl px-3 pr-4 py-2.5 transition-all text-gray-800"
                            />
                            {editFormErrors.desaPemilikLama && <span className="text-[10px] text-red-600 font-bold pl-1">{editFormErrors.desaPemilikLama}</span>}
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-gray-700 uppercase tracking-widest pl-1">Alamat Objek Pajak</label>
                          <input
                            type="text"
                            value={editAlamatObjekLama}
                            onChange={(e) => setEditAlamatObjekLama(e.target.value)}
                            disabled={loading}
                            className="w-full text-xs font-semibold bg-white border-transparent focus:outline-none focus:border-indigo-500 rounded-xl px-3 pr-4 py-2.5 transition-all text-gray-800"
                          />
                          {editFormErrors.alamatObjekLama && <span className="text-[10px] text-red-600 font-bold pl-1">{editFormErrors.alamatObjekLama}</span>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-gray-700 uppercase tracking-widest pl-1">Kecamatan Objek</label>
                            <input
                              type="text"
                              value={editKecamatanObjekLama}
                              onChange={(e) => setEditKecamatanObjekLama(e.target.value)}
                              disabled={loading}
                              className="w-full text-xs font-semibold bg-white border-transparent focus:outline-none focus:border-indigo-500 rounded-xl px-3 pr-4 py-2.5 transition-all text-gray-800"
                            />
                            {editFormErrors.kecamatanObjekLama && <span className="text-[10px] text-red-600 font-bold pl-1">{editFormErrors.kecamatanObjekLama}</span>}
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-gray-700 uppercase tracking-widest pl-1">Desa Objek</label>
                            <input
                              type="text"
                              value={editDesaObjekLama}
                              onChange={(e) => setEditDesaObjekLama(e.target.value)}
                              disabled={loading}
                              className="w-full text-xs font-semibold bg-white border-transparent focus:outline-none focus:border-indigo-500 rounded-xl px-3 pr-4 py-2.5 transition-all text-gray-800"
                            />
                            {editFormErrors.desaObjekLama && <span className="text-[10px] text-red-600 font-bold pl-1">{editFormErrors.desaObjekLama}</span>}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-gray-700 uppercase tracking-widest pl-1">Luas Tanah Asal (m²)</label>
                            <input
                              type="number"
                              min={0}
                              step="any"
                              value={editLuasTanahLama}
                              onChange={(e) => setEditLuasTanahLama(e.target.value)}
                              disabled={loading}
                              className="w-full text-xs font-semibold bg-white border-transparent focus:outline-none focus:border-indigo-500 rounded-xl px-3 pr-4 py-2.5 transition-all text-gray-800"
                            />
                            {editFormErrors.luasTanahLama && <span className="text-[10px] text-red-600 font-bold pl-1">{editFormErrors.luasTanahLama}</span>}
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-gray-700 uppercase tracking-widest pl-1">Luas Bangunan Asal (m²)</label>
                            <input
                              type="number"
                              min={0}
                              step="any"
                              value={editLuasBangunanLama}
                              onChange={(e) => setEditLuasBangunanLama(e.target.value)}
                              disabled={loading}
                              className="w-full text-xs font-semibold bg-white border-transparent focus:outline-none focus:border-indigo-500 rounded-xl px-3 pr-4 py-2.5 transition-all text-gray-800"
                            />
                            {editFormErrors.luasBangunanLama && <span className="text-[10px] text-red-600 font-bold pl-1">{editFormErrors.luasBangunanLama}</span>}
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-gray-700 uppercase tracking-widest pl-1">Nomor/Jenis Sertifikat Lama</label>
                          <input
                            type="text"
                            value={editSertifikatLama}
                            onChange={(e) => setEditSertifikatLama(e.target.value)}
                            disabled={loading}
                            className="w-full text-xs font-semibold bg-white border-transparent focus:outline-none focus:border-indigo-500 rounded-xl px-3 pr-4 py-2.5 transition-all text-gray-800"
                          />
                          {editFormErrors.sertifikatLama && <span className="text-[10px] text-red-600 font-bold pl-1">{editFormErrors.sertifikatLama}</span>}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* EDIT PART 3: DATA BARU */}
                  <div className="flex flex-col gap-4 p-4 border-transparent rounded-xl bg-slate-50/20">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-1">
                      <h4 className="text-xs font-extrabold text-indigo-700 uppercase tracking-widest">3. Data Baru (Pemilik & Objek Baru)</h4>
                      {editNeedDataBaru && editJenis === 'MUTASI_SEBAGIAN' && (
                        <button
                          type="button"
                          onClick={handleEditAddOwner}
                          disabled={loading}
                          className="px-2.5 py-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Tambah Pemilik
                        </button>
                      )}
                    </div>

                    {!editNeedDataBaru ? (
                      <div className="text-center py-6 text-xs text-slate-400 font-semibold bg-slate-50/50 rounded-xl border border-dashed border-slate-200 select-none">
                        Bagian ini tidak diperlukan untuk layanan pengaktifan kembali.
                      </div>
                    ) : (
                      <div className="flex flex-col gap-6">
                        {editDataBaru.map((item, idx) => (
                          <div key={idx} className={`flex flex-col gap-4 p-4 border-transparent bg-white rounded-xl relative ${editDataBaru.length > 1 ? 'pt-10' : ''}`}>
                            {editDataBaru.length > 1 && (
                              <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between">
                                <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider">Pemilik Baru #{idx + 1}</span>
                                <button
                                  type="button"
                                  onClick={() => handleEditRemoveOwner(idx)}
                                  disabled={loading}
                                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}

                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold text-gray-700 uppercase tracking-widest pl-1">Nama Pemilik Baru</label>
                              <input
                                type="text"
                                value={item.namaPemilikBaru}
                                onChange={(e) => handleEditOwnerChange(idx, 'namaPemilikBaru', e.target.value)}
                                disabled={loading}
                                className="w-full text-xs font-semibold bg-white border-transparent focus:outline-none focus:border-indigo-500 rounded-xl px-3 pr-4 py-2.5 transition-all text-gray-800"
                              />
                              {editFormErrors[`dataBaru.${idx}.namaPemilikBaru`] && <span className="text-[10px] text-red-600 font-bold pl-1">{editFormErrors[`dataBaru.${idx}.namaPemilikBaru`]}</span>}
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold text-gray-700 uppercase tracking-widest pl-1">Alamat Pemilik Baru</label>
                              <input
                                type="text"
                                value={item.alamatPemilikBaru}
                                onChange={(e) => handleEditOwnerChange(idx, 'alamatPemilikBaru', e.target.value)}
                                disabled={loading}
                                className="w-full text-xs font-semibold bg-white border-transparent focus:outline-none focus:border-indigo-500 rounded-xl px-3 pr-4 py-2.5 transition-all text-gray-800"
                              />
                              {editFormErrors[`dataBaru.${idx}.alamatPemilikBaru`] && <span className="text-[10px] text-red-600 font-bold pl-1">{editFormErrors[`dataBaru.${idx}.alamatPemilikBaru`]}</span>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-gray-700 uppercase tracking-widest pl-1">Kecamatan Pemilik</label>
                                <input
                                  type="text"
                                  value={item.kecamatanPemilikBaru}
                                  onChange={(e) => handleEditOwnerChange(idx, 'kecamatanPemilikBaru', e.target.value)}
                                  disabled={loading}
                                  className="w-full text-xs font-semibold bg-white border-transparent focus:outline-none focus:border-indigo-500 rounded-xl px-3 pr-4 py-2.5 transition-all text-gray-800"
                                />
                                {editFormErrors[`dataBaru.${idx}.kecamatanPemilikBaru`] && <span className="text-[10px] text-red-600 font-bold pl-1">{editFormErrors[`dataBaru.${idx}.kecamatanPemilikBaru`]}</span>}
                              </div>

                              <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-gray-700 uppercase tracking-widest pl-1">Desa Pemilik</label>
                                <input
                                  type="text"
                                  value={item.desaPemilikBaru}
                                  onChange={(e) => handleEditOwnerChange(idx, 'desaPemilikBaru', e.target.value)}
                                  disabled={loading}
                                  className="w-full text-xs font-semibold bg-white border-transparent focus:outline-none focus:border-indigo-500 rounded-xl px-3 pr-4 py-2.5 transition-all text-gray-800"
                                />
                                {editFormErrors[`dataBaru.${idx}.desaPemilikBaru`] && <span className="text-[10px] text-red-600 font-bold pl-1">{editFormErrors[`dataBaru.${idx}.desaPemilikBaru`]}</span>}
                              </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold text-gray-700 uppercase tracking-widest pl-1">Alamat Objek Pajak</label>
                              <input
                                type="text"
                                value={item.alamatObjekBaru}
                                onChange={(e) => handleEditOwnerChange(idx, 'alamatObjekBaru', e.target.value)}
                                disabled={loading}
                                className="w-full text-xs font-semibold bg-white border-transparent focus:outline-none focus:border-indigo-500 rounded-xl px-3 pr-4 py-2.5 transition-all text-gray-800"
                              />
                              {editFormErrors[`dataBaru.${idx}.alamatObjekBaru`] && <span className="text-[10px] text-red-600 font-bold pl-1">{editFormErrors[`dataBaru.${idx}.alamatObjekBaru`]}</span>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-gray-700 uppercase tracking-widest pl-1">Kecamatan Objek</label>
                                <input
                                  type="text"
                                  value={item.kecamatanObjekBaru}
                                  onChange={(e) => handleEditOwnerChange(idx, 'kecamatanObjekBaru', e.target.value)}
                                  disabled={loading}
                                  className="w-full text-xs font-semibold bg-white border-transparent focus:outline-none focus:border-indigo-500 rounded-xl px-3 pr-4 py-2.5 transition-all text-gray-800"
                                />
                                {editFormErrors[`dataBaru.${idx}.kecamatanObjekBaru`] && <span className="text-[10px] text-red-600 font-bold pl-1">{editFormErrors[`dataBaru.${idx}.kecamatanObjekBaru`]}</span>}
                              </div>

                              <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-gray-700 uppercase tracking-widest pl-1">Desa Objek</label>
                                <input
                                  type="text"
                                  value={item.desaObjekBaru}
                                  onChange={(e) => handleEditOwnerChange(idx, 'desaObjekBaru', e.target.value)}
                                  disabled={loading}
                                  className="w-full text-xs font-semibold bg-white border-transparent focus:outline-none focus:border-indigo-500 rounded-xl px-3 pr-4 py-2.5 transition-all text-gray-800"
                                />
                                {editFormErrors[`dataBaru.${idx}.desaObjekBaru`] && <span className="text-[10px] text-red-600 font-bold pl-1">{editFormErrors[`dataBaru.${idx}.desaObjekBaru`]}</span>}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-gray-700 uppercase tracking-widest pl-1">Luas Tanah Baru (m²)</label>
                                <input
                                  type="number"
                                  min={0}
                                  step="any"
                                  value={item.luasTanahBaru}
                                  onChange={(e) => handleEditOwnerChange(idx, 'luasTanahBaru', e.target.value)}
                                  disabled={loading}
                                  className="w-full text-xs font-semibold bg-white border-transparent focus:outline-none focus:border-indigo-500 rounded-xl px-3 pr-4 py-2.5 transition-all text-gray-800"
                                />
                                {editFormErrors[`dataBaru.${idx}.luasTanahBaru`] && <span className="text-[10px] text-red-600 font-bold pl-1">{editFormErrors[`dataBaru.${idx}.luasTanahBaru`]}</span>}
                              </div>

                              <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-gray-700 uppercase tracking-widest pl-1">Luas Bangunan Baru (m²)</label>
                                <input
                                  type="number"
                                  min={0}
                                  step="any"
                                  value={item.luasBangunanBaru}
                                  onChange={(e) => handleEditOwnerChange(idx, 'luasBangunanBaru', e.target.value)}
                                  disabled={loading}
                                  className="w-full text-xs font-semibold bg-white border-transparent focus:outline-none focus:border-indigo-500 rounded-xl px-3 pr-4 py-2.5 transition-all text-gray-800"
                                />
                                {editFormErrors[`dataBaru.${idx}.luasBangunanBaru`] && <span className="text-[10px] text-red-600 font-bold pl-1">{editFormErrors[`dataBaru.${idx}.luasBangunanBaru`]}</span>}
                              </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold text-gray-700 uppercase tracking-widest pl-1">Nomor/Jenis Sertifikat Baru</label>
                              <input
                                type="text"
                                value={item.sertifikatBaru}
                                onChange={(e) => handleEditOwnerChange(idx, 'sertifikatBaru', e.target.value)}
                                disabled={loading}
                                className="w-full text-xs font-semibold bg-white border-transparent focus:outline-none focus:border-indigo-500 rounded-xl px-3 pr-4 py-2.5 transition-all text-gray-800"
                              />
                              {editFormErrors[`dataBaru.${idx}.sertifikatBaru`] && <span className="text-[10px] text-red-600 font-bold pl-1">{editFormErrors[`dataBaru.${idx}.sertifikatBaru`]}</span>}
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
                    onClick={() => setEditTarget(null)}
                    disabled={loading}
                    className="px-3.5 py-2 text-slate-500 hover:text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center"
                  >
                    {loading ? (
                      <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    ) : (
                      'Simpan Perubahan'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>{/* end: hide-during-skeleton wrapper */}
    </div>
  );
}
