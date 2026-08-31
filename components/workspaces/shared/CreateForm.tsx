"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, Plus, Trash2, Check, AlertTriangle, CheckCircle, Phone, RotateCcw } from 'lucide-react';
import { createPermohonan } from '@/app/actions/penginput';
import { ActionStatusModal } from './ActionStatusModal';
import {
  JENIS_OPTIONS,
  SERVICES_NEED_DATA_LAMA,
  SERVICES_NEED_DATA_BARU,
  KECAMATAN_DATA,
  NOP_MAPPING,
  createEmptyDataBaruItem
} from './constants';

interface CreateFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: any;
}

const createEmptyDataLamaItem = (isUtama: boolean = false) => ({
  nopLama: '',
  namaPemilikLama: '',
  alamatPemilikLama: '',
  blokPemilikLama: '',
  rtPemilikLama: '',
  rwPemilikLama: '',
  kecamatanPemilikLama: '',
  desaPemilikLama: '',
  alamatObjekLama: '',
  blokObjekLama: '',
  rtObjekLama: '',
  rwObjekLama: '',
  kecamatanObjekLama: '',
  desaObjekLama: '',
  luasTanahLama: '',
  luasBangunanLama: '',
  sertifikatLama: '',
  isUtama
});

/**
 * Reusable Design System helper for Form Input / Select / Textarea styling.
 * Visual State System:
 * - background: ALWAYS bg-white (no bg-slate-50, no focus:bg-white)
 * - normal: border-slate-200/90 focus:border-[#00a389] focus:ring-[#00a389]/10
 * - error: border-red-500 focus:border-red-500 focus:ring-red-500/10
 */
const getInputClass = (hasError?: boolean, extraClass: string = '') => {
  const stateClass = hasError
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
    : 'border-slate-200/90 focus:border-[#00a389] focus:ring-[#00a389]/10';

  return `w-full bg-white border ${stateClass} rounded-md px-3.5 py-2.5 text-[13px] font-normal text-slate-900 focus:outline-none focus:ring-2 transition-all font-sans ${extraClass}`.trim();
};

/**
 * Reusable Design System helper for WhatsApp Composite Input Container.
 */
const getWhatsAppContainerClass = (hasError?: boolean) => {
  const stateClass = hasError
    ? 'border-red-500 focus-within:border-red-500 focus-within:ring-red-500/10'
    : 'border-slate-200/90 focus-within:border-[#00a389] focus-within:ring-[#00a389]/10';

  return `flex items-center bg-white border ${stateClass} rounded-md overflow-hidden transition-all focus-within:ring-2 font-sans`.trim();
};

export const CreateForm: React.FC<CreateFormProps> = React.memo(({ onSuccess, onCancel, initialData }) => {
  const [jenisPermohonan, setJenisPermohonan] = useState<string>('MUTASI_SEBAGIAN');
  const [nomorPelayanan, setNomorPelayanan] = useState('');
  const [tanggalNoPelayanan, setTanggalNoPelayanan] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [tanggalPenyelesaian, setTanggalPenyelesaian] = useState('');
  const [noWhatsapp, setNoWhatsapp] = useState('');

  // Data Lama state (single item for standard services)
  const [nopLama, setNopLama] = useState('');
  const [namaPemilikLama, setNamaPemilikLama] = useState('');
  const [alamatPemilikLama, setAlamatPemilikLama] = useState('');
  const [blokPemilikLama, setBlokPemilikLama] = useState('');
  const [rtPemilikLama, setRtPemilikLama] = useState('');
  const [rwPemilikLama, setRwPemilikLama] = useState('');
  const [kecamatanPemilikLama, setKecamatanPemilikLama] = useState('');
  const [desaPemilikLama, setDesaPemilikLama] = useState('');
  const [alamatObjekLama, setAlamatObjekLama] = useState('');
  const [blokObjekLama, setBlokObjekLama] = useState('');
  const [rtObjekLama, setRtObjekLama] = useState('');
  const [rwObjekLama, setRwObjekLama] = useState('');
  const [kecamatanObjekLama, setKecamatanObjekLama] = useState('');
  const [desaObjekLama, setDesaObjekLama] = useState('');
  const [luasTanahLama, setLuasTanahLama] = useState('');
  const [luasBangunanLama, setLuasBangunanLama] = useState('');
  const [sertifikatLama, setSertifikatLama] = useState('');

  // Multi Data Lama state (for MUTASI_PENGGABUNGAN)
  const [dataLama, setDataLama] = useState<any[]>([
    createEmptyDataLamaItem(true),
    createEmptyDataLamaItem(false)
  ]);

  // Data Baru state
  const [dataBaru, setDataBaru] = useState<any[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Stepper State & Copy Feedback State
  const [currentStep, setCurrentStep] = useState(1);

  const [draftLoaded, setDraftLoaded] = useState(false);

  // Status Modal State
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusModalStatus, setStatusModalStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusModalTitle, setStatusModalTitle] = useState('');
  const [statusModalMessage, setStatusModalMessage] = useState('');

  // Draft Restored Popup State
  const [draftModalOpen, setDraftModalOpen] = useState(false);
  const [draftModalMessage, setDraftModalMessage] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCloseStatusModal = useCallback(() => {
    setStatusModalOpen(false);
    if (statusModalStatus === 'success') {
      onSuccess();
      onCancel();
    }
  }, [statusModalStatus, onSuccess, onCancel]);

  // Reset Draft & LocalStorage
  const handleResetDraft = useCallback(() => {
    try {
      localStorage.removeItem('permohonan_form_draft');
    } catch (e) {
      console.error('Failed to clear draft', e);
    }
    setNomorPelayanan('');
    setTanggalNoPelayanan(new Date().toISOString().split('T')[0]);
    setTanggalPenyelesaian('');
    setNoWhatsapp('');
    setNopLama('');
    setNamaPemilikLama('');
    setAlamatPemilikLama('');
    setBlokPemilikLama('');
    setRtPemilikLama('');
    setRwPemilikLama('');
    setKecamatanPemilikLama('');
    setDesaPemilikLama('');
    setAlamatObjekLama('');
    setBlokObjekLama('');
    setRtObjekLama('');
    setRwObjekLama('');
    setKecamatanObjekLama('');
    setDesaObjekLama('');
    setLuasTanahLama('');
    setLuasBangunanLama('');
    setSertifikatLama('');
    setDataLama([createEmptyDataLamaItem(true), createEmptyDataLamaItem(false)]);
    setDataBaru([{ ...createEmptyDataBaruItem(), catatan: '' }]);
    setFormErrors({});
    setError('');
    setSuccess('');
    setCurrentStep(1);
    setDraftModalMessage('Draf formulir dan penyimpanan lokal berhasil dihapus & formulir di-reset!');
    setDraftModalOpen(true);
  }, []);

  // Restore draft on mount or duplicate initialData
  useEffect(() => {
    if (initialData) {
      try {
        if (initialData.jenisPermohonan) setJenisPermohonan(initialData.jenisPermohonan);
        if (initialData.nomorPelayanan) setNomorPelayanan(initialData.nomorPelayanan.toUpperCase());

        const rawDate = initialData.tanggalNoPelayanan ? new Date(initialData.tanggalNoPelayanan) : null;
        setTanggalNoPelayanan(rawDate && !isNaN(rawDate.getTime()) ? rawDate.toISOString().split('T')[0] : '');

        const rawSelesaiDate = initialData.tanggalPenyelesaian ? new Date(initialData.tanggalPenyelesaian) : null;
        setTanggalPenyelesaian(rawSelesaiDate && !isNaN(rawSelesaiDate.getTime()) ? rawSelesaiDate.toISOString().split('T')[0] : '');

        if (initialData.noWhatsapp) setNoWhatsapp(initialData.noWhatsapp);

        if (initialData.nop) {
          const raw = initialData.nop.replace(/[^\d]/g, '');
          if (raw.length === 18) {
            setNopLama(`${raw.slice(0, 2)}.${raw.slice(2, 4)}.${raw.slice(4, 7)}.${raw.slice(7, 10)}.${raw.slice(10, 13)}-${raw.slice(13, 17)}.${raw.slice(17)}`);
          } else {
            setNopLama(initialData.nop);
          }
        }

        if (initialData.namaPemilikLama) setNamaPemilikLama(initialData.namaPemilikLama.toUpperCase());
        if (initialData.alamatPemilikLama) setAlamatPemilikLama(initialData.alamatPemilikLama.toUpperCase());
        if (initialData.blokPemilikLama) setBlokPemilikLama(initialData.blokPemilikLama.toUpperCase());
        if (initialData.rtPemilikLama) setRtPemilikLama(initialData.rtPemilikLama.toUpperCase());
        if (initialData.rwPemilikLama) setRwPemilikLama(initialData.rwPemilikLama.toUpperCase());
        if (initialData.kecamatanPemilikLama) setKecamatanPemilikLama(initialData.kecamatanPemilikLama.toUpperCase());
        if (initialData.desaPemilikLama) setDesaPemilikLama(initialData.desaPemilikLama.toUpperCase());
        if (initialData.alamatObjekLama) setAlamatObjekLama(initialData.alamatObjekLama.toUpperCase());
        if (initialData.blokObjekLama) setBlokObjekLama(initialData.blokObjekLama.toUpperCase());
        if (initialData.rtObjekLama) setRtObjekLama(initialData.rtObjekLama.toUpperCase());
        if (initialData.rwObjekLama) setRwObjekLama(initialData.rwObjekLama.toUpperCase());
        if (initialData.kecamatanObjekLama) setKecamatanObjekLama(initialData.kecamatanObjekLama.toUpperCase());
        if (initialData.desaObjekLama) setDesaObjekLama(initialData.desaObjekLama.toUpperCase());
        setLuasTanahLama(initialData.luasTanahLama !== null && initialData.luasTanahLama !== undefined ? String(initialData.luasTanahLama) : '');
        setLuasBangunanLama(initialData.luasBangunanLama !== null && initialData.luasBangunanLama !== undefined ? String(initialData.luasBangunanLama) : '');
        if (initialData.sertifikatLama) setSertifikatLama(initialData.sertifikatLama.toUpperCase());

        if (initialData.dataLama && initialData.dataLama.length > 0) {
          setDataLama(initialData.dataLama.map((item: any, idx: number) => ({
            nopLama: item.nopLama || '',
            namaPemilikLama: (item.namaPemilikLama || '').toUpperCase(),
            alamatPemilikLama: (item.alamatPemilikLama || '').toUpperCase(),
            blokPemilikLama: (item.blokPemilikLama || '').toUpperCase(),
            rtPemilikLama: (item.rtPemilikLama || '').toUpperCase(),
            rwPemilikLama: (item.rwPemilikLama || '').toUpperCase(),
            kecamatanPemilikLama: (item.kecamatanPemilikLama || '').toUpperCase(),
            desaPemilikLama: (item.desaPemilikLama || '').toUpperCase(),
            alamatObjekLama: (item.alamatObjekLama || '').toUpperCase(),
            blokObjekLama: (item.blokObjekLama || '').toUpperCase(),
            rtObjekLama: (item.rtObjekLama || '').toUpperCase(),
            rwObjekLama: (item.rwObjekLama || '').toUpperCase(),
            kecamatanObjekLama: (item.kecamatanObjekLama || '').toUpperCase(),
            desaObjekLama: (item.desaObjekLama || '').toUpperCase(),
            luasTanahLama: item.luasTanahLama !== null && item.luasTanahLama !== undefined ? String(item.luasTanahLama) : '',
            luasBangunanLama: item.luasBangunanLama !== null && item.luasBangunanLama !== undefined ? String(item.luasBangunanLama) : '',
            sertifikatLama: (item.sertifikatLama || '').toUpperCase(),
            isUtama: item.isUtama ?? idx === 0
          })));
        }

        if (initialData.dataBaru && initialData.dataBaru.length > 0) {
          setDataBaru(initialData.dataBaru.map((item: any) => ({
            namaPemilikBaru: (item.namaPemilikBaru || '').toUpperCase(),
            alamatPemilikBaru: (item.alamatPemilikBaru || '').toUpperCase(),
            blokPemilikBaru: (item.blokPemilikBaru || '').toUpperCase(),
            rtPemilikBaru: (item.rtPemilikBaru || '').toUpperCase(),
            rwPemilikBaru: (item.rwPemilikBaru || '').toUpperCase(),
            kecamatanPemilikBaru: (item.kecamatanPemilikBaru || '').toUpperCase(),
            desaPemilikBaru: (item.desaPemilikBaru || '').toUpperCase(),
            alamatObjekBaru: (item.alamatObjekBaru || '').toUpperCase(),
            blokObjekBaru: (item.blokObjekBaru || '').toUpperCase(),
            rtObjekBaru: (item.rtObjekBaru || '').toUpperCase(),
            rwObjekBaru: (item.rwObjekBaru || '').toUpperCase(),
            kecamatanObjekBaru: (item.kecamatanObjekBaru || '').toUpperCase(),
            desaObjekBaru: (item.desaObjekBaru || '').toUpperCase(),
            luasTanahBaru: item.luasTanahBaru !== null && item.luasTanahBaru !== undefined ? String(item.luasTanahBaru) : '',
            luasBangunanBaru: item.luasBangunanBaru !== null && item.luasBangunanBaru !== undefined ? String(item.luasBangunanBaru) : '',
            sertifikatBaru: (item.sertifikatBaru || '').toUpperCase(),
            catatan: (item.catatan || '').toUpperCase()
          })));
        } else {
          setDataBaru([{ ...createEmptyDataBaruItem(), catatan: '' }]);
        }

        setDraftModalMessage('Draf permohonan berhasil diduplikat untuk formulir baru!');
        setDraftModalOpen(true);
      } catch (e) {
        console.error('Failed to duplicate initialData', e);
      } finally {
        setDraftLoaded(true);
      }
      return;
    }

    try {
      const stored = localStorage.getItem('permohonan_form_draft');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.jenisPermohonan) setJenisPermohonan(parsed.jenisPermohonan);
        if (parsed.nomorPelayanan) setNomorPelayanan(parsed.nomorPelayanan.toUpperCase());
        if (parsed.tanggalNoPelayanan) setTanggalNoPelayanan(parsed.tanggalNoPelayanan);
        if (parsed.tanggalPenyelesaian) setTanggalPenyelesaian(parsed.tanggalPenyelesaian);
        if (parsed.noWhatsapp) setNoWhatsapp(parsed.noWhatsapp);

        if (parsed.nopLama) setNopLama(parsed.nopLama);
        if (parsed.namaPemilikLama) setNamaPemilikLama(parsed.namaPemilikLama.toUpperCase());
        if (parsed.alamatPemilikLama) setAlamatPemilikLama(parsed.alamatPemilikLama.toUpperCase());
        if (parsed.blokPemilikLama) setBlokPemilikLama(parsed.blokPemilikLama.toUpperCase());
        if (parsed.rtPemilikLama) setRtPemilikLama(parsed.rtPemilikLama.toUpperCase());
        if (parsed.rwPemilikLama) setRwPemilikLama(parsed.rwPemilikLama.toUpperCase());
        if (parsed.kecamatanPemilikLama) setKecamatanPemilikLama(parsed.kecamatanPemilikLama.toUpperCase());
        if (parsed.desaPemilikLama) setDesaPemilikLama(parsed.desaPemilikLama.toUpperCase());
        if (parsed.alamatObjekLama) setAlamatObjekLama(parsed.alamatObjekLama.toUpperCase());
        if (parsed.blokObjekLama) setBlokObjekLama(parsed.blokObjekLama.toUpperCase());
        if (parsed.rtObjekLama) setRtObjekLama(parsed.rtObjekLama.toUpperCase());
        if (parsed.rwObjekLama) setRwObjekLama(parsed.rwObjekLama.toUpperCase());
        if (parsed.kecamatanObjekLama) setKecamatanObjekLama(parsed.kecamatanObjekLama.toUpperCase());
        if (parsed.desaObjekLama) setDesaObjekLama(parsed.desaObjekLama.toUpperCase());
        if (parsed.luasTanahLama) setLuasTanahLama(parsed.luasTanahLama);
        if (parsed.luasBangunanLama) setLuasBangunanLama(parsed.luasBangunanLama);
        if (parsed.sertifikatLama) setSertifikatLama(parsed.sertifikatLama.toUpperCase());

        if (parsed.dataLama && parsed.dataLama.length > 0) {
          setDataLama(parsed.dataLama);
        }

        if (parsed.dataBaru && parsed.dataBaru.length > 0) {
          setDataBaru(parsed.dataBaru.map((item: any) => ({
            ...item,
            namaPemilikBaru: (item.namaPemilikBaru || '').toUpperCase(),
            catatan: (item.catatan || '').toUpperCase()
          })));
        }

        setDraftModalMessage('Draf pengisian permohonan Anda sebelumnya telah otomatis dipulihkan ke formulir ini.');
        setDraftModalOpen(true);
      }
    } catch (e) {
      console.error('Failed to load form draft', e);
    } finally {
      setDraftLoaded(true);
    }
  }, [initialData]);

  // Save draft to localStorage on state changes
  useEffect(() => {
    if (!draftLoaded) return;
    try {
      const draft = {
        jenisPermohonan,
        nomorPelayanan: nomorPelayanan.toUpperCase(),
        tanggalNoPelayanan,
        tanggalPenyelesaian,
        noWhatsapp,
        nopLama,
        namaPemilikLama: namaPemilikLama.toUpperCase(),
        alamatPemilikLama: alamatPemilikLama.toUpperCase(),
        blokPemilikLama: blokPemilikLama.toUpperCase(),
        rtPemilikLama: rtPemilikLama.toUpperCase(),
        rwPemilikLama: rwPemilikLama.toUpperCase(),
        kecamatanPemilikLama: kecamatanPemilikLama.toUpperCase(),
        desaPemilikLama: desaPemilikLama.toUpperCase(),
        alamatObjekLama: alamatObjekLama.toUpperCase(),
        blokObjekLama: blokObjekLama.toUpperCase(),
        rtObjekLama: rtObjekLama.toUpperCase(),
        rwObjekLama: rwObjekLama.toUpperCase(),
        kecamatanObjekLama: kecamatanObjekLama.toUpperCase(),
        desaObjekLama: desaObjekLama.toUpperCase(),
        luasTanahLama,
        luasBangunanLama,
        sertifikatLama: sertifikatLama.toUpperCase(),
        dataLama,
        dataBaru: dataBaru.map(item => ({
          ...item,
          namaPemilikBaru: item.namaPemilikBaru.toUpperCase(),
          catatan: (item.catatan || '').toUpperCase()
        }))
      };
      localStorage.setItem('permohonan_form_draft', JSON.stringify(draft));
    } catch (e) {
      console.error('Failed to save form draft', e);
    }
  }, [
    draftLoaded, jenisPermohonan, nomorPelayanan, tanggalNoPelayanan, tanggalPenyelesaian, noWhatsapp,
    nopLama, namaPemilikLama, alamatPemilikLama, blokPemilikLama, rtPemilikLama, rwPemilikLama, kecamatanPemilikLama, desaPemilikLama,
    alamatObjekLama, blokObjekLama, rtObjekLama, rwObjekLama, kecamatanObjekLama, desaObjekLama, luasTanahLama, luasBangunanLama, sertifikatLama,
    dataLama, dataBaru
  ]);

  // Conditional Logic Rules
  const needDataLama = SERVICES_NEED_DATA_LAMA.includes(jenisPermohonan);
  const needDataBaru = SERVICES_NEED_DATA_BARU.includes(jenisPermohonan);

  // Generate Steps dynamically
  const steps = useMemo(() => {
    const list = [{ id: 1, label: 'Data Utama' }];
    if (needDataLama) {
      list.push({ id: list.length + 1, label: 'Data Lama (Asal)' });
    }
    if (needDataBaru) {
      list.push({ id: list.length + 1, label: 'Data Baru' });
    }
    return list;
  }, [needDataLama, needDataBaru]);

  // Reset step to 1 when service type changes
  useEffect(() => {
    setCurrentStep(1);
    setFormErrors({});
  }, [jenisPermohonan]);

  // Auto-calculate Tanggal Penyelesaian based on Jenis Permohonan and Tanggal Pelayanan
  useEffect(() => {
    if (!tanggalNoPelayanan) return;
    const baseDate = new Date(tanggalNoPelayanan);
    if (isNaN(baseDate.getTime())) return;

    let monthsToAdd = 4;
    if (jenisPermohonan === 'OBJEK_PAJAK_BARU') {
      monthsToAdd = 6;
    } else if (jenisPermohonan === 'PENGAKTIFAN') {
      monthsToAdd = 1;
    }

    const targetDate = new Date(baseDate);
    targetDate.setMonth(baseDate.getMonth() + monthsToAdd);

    setTanggalPenyelesaian(targetDate.toISOString().split('T')[0]);
  }, [jenisPermohonan, tanggalNoPelayanan]);

  // Keep Data Baru length to 1 if not MUTASI_SEBAGIAN
  useEffect(() => {
    if (jenisPermohonan !== 'MUTASI_SEBAGIAN') {
      if (dataBaru.length > 1) {
        setDataBaru(prev => prev.slice(0, 1));
      }
    }
  }, [jenisPermohonan, dataBaru.length]);

  // Initialize dataBaru with 1 item if needed
  useEffect(() => {
    if (!draftLoaded) return;
    if (needDataBaru && dataBaru.length === 0) {
      setDataBaru([{ ...createEmptyDataBaruItem(), catatan: '' }]);
    }
  }, [needDataBaru, dataBaru.length, draftLoaded]);

  // Handlers for Multi Data Lama (MUTASI_PENGGABUNGAN)
  const handleAddNopAsal = useCallback(() => {
    setDataLama(prev => [...prev, createEmptyDataLamaItem(false)]);
  }, []);

  const handleRemoveNopAsal = useCallback((index: number) => {
    setDataLama(prev => {
      if (prev.length <= 2) return prev;
      const next = prev.filter((_, i) => i !== index);
      return next.map((item, i) => ({ ...item, isUtama: i === 0 }));
    });
  }, []);

  const handleDataLamaItemChange = useCallback((index: number, field: string, value: any) => {
    setDataLama(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  }, []);

  // Handlers for Data Baru
  const handleAddOwner = useCallback(() => {
    setDataBaru(prev => [...prev, { ...createEmptyDataBaruItem(), catatan: '' }]);
  }, []);

  const handleRemoveOwner = useCallback((index: number) => {
    setDataBaru(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleOwnerChange = useCallback((index: number, field: string, value: any) => {
    setDataBaru(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  }, []);

  // Auto-clear field errors as user types valid inputs
  useEffect(() => {
    setFormErrors(prev => {
      if (Object.keys(prev).length === 0) return prev;
      const next = { ...prev };
      let changed = false;

      if (nomorPelayanan.trim() && next.nomorPelayanan) { delete next.nomorPelayanan; changed = true; }
      if (tanggalNoPelayanan.trim() && next.tanggalNoPelayanan) { delete next.tanggalNoPelayanan; changed = true; }
      if (tanggalPenyelesaian.trim() && next.tanggalPenyelesaian) { delete next.tanggalPenyelesaian; changed = true; }
      if (/^(628)\d{8,12}$/.test(noWhatsapp) && next.noWhatsapp) { delete next.noWhatsapp; changed = true; }

      if (needDataLama) {
        if (jenisPermohonan === 'MUTASI_PENGGABUNGAN') {
          dataLama.forEach((item, idx) => {
            if (item.nopLama?.replace(/[.\-]/g, '').length === 18 && next[`dataLama.${idx}.nopLama`]) { delete next[`dataLama.${idx}.nopLama`]; changed = true; }
            if (item.namaPemilikLama?.trim() && next[`dataLama.${idx}.namaPemilikLama`]) { delete next[`dataLama.${idx}.namaPemilikLama`]; changed = true; }
            if (item.alamatPemilikLama?.trim() && next[`dataLama.${idx}.alamatPemilikLama`]) { delete next[`dataLama.${idx}.alamatPemilikLama`]; changed = true; }
            if (item.kecamatanPemilikLama?.trim() && next[`dataLama.${idx}.kecamatanPemilikLama`]) { delete next[`dataLama.${idx}.kecamatanPemilikLama`]; changed = true; }
            if (item.desaPemilikLama?.trim() && next[`dataLama.${idx}.desaPemilikLama`]) { delete next[`dataLama.${idx}.desaPemilikLama`]; changed = true; }
            if (item.alamatObjekLama?.trim() && next[`dataLama.${idx}.alamatObjekLama`]) { delete next[`dataLama.${idx}.alamatObjekLama`]; changed = true; }
            if (item.kecamatanObjekLama?.trim() && next[`dataLama.${idx}.kecamatanObjekLama`]) { delete next[`dataLama.${idx}.kecamatanObjekLama`]; changed = true; }
            if (item.desaObjekLama?.trim() && next[`dataLama.${idx}.desaObjekLama`]) { delete next[`dataLama.${idx}.desaObjekLama`]; changed = true; }
            if (item.luasTanahLama !== '' && Number(item.luasTanahLama) >= 0 && next[`dataLama.${idx}.luasTanahLama`]) { delete next[`dataLama.${idx}.luasTanahLama`]; changed = true; }
            if (item.luasBangunanLama !== '' && Number(item.luasBangunanLama) >= 0 && next[`dataLama.${idx}.luasBangunanLama`]) { delete next[`dataLama.${idx}.luasBangunanLama`]; changed = true; }
          });
        } else {
          if (nopLama.replace(/[.\-]/g, '').length === 18 && next.nopLama) { delete next.nopLama; changed = true; }
          if (namaPemilikLama.trim() && next.namaPemilikLama) { delete next.namaPemilikLama; changed = true; }
          if (alamatPemilikLama.trim() && next.alamatPemilikLama) { delete next.alamatPemilikLama; changed = true; }
          if (kecamatanPemilikLama.trim() && next.kecamatanPemilikLama) { delete next.kecamatanPemilikLama; changed = true; }
          if (desaPemilikLama.trim() && next.desaPemilikLama) { delete next.desaPemilikLama; changed = true; }
          if (alamatObjekLama.trim() && next.alamatObjekLama) { delete next.alamatObjekLama; changed = true; }
          if (kecamatanObjekLama.trim() && next.kecamatanObjekLama) { delete next.kecamatanObjekLama; changed = true; }
          if (desaObjekLama.trim() && next.desaObjekLama) { delete next.desaObjekLama; changed = true; }
          if (luasTanahLama.trim() !== '' && Number(luasTanahLama) >= 0 && next.luasTanahLama) { delete next.luasTanahLama; changed = true; }
          if (luasBangunanLama.trim() !== '' && Number(luasBangunanLama) >= 0 && next.luasBangunanLama) { delete next.luasBangunanLama; changed = true; }
          if (sertifikatLama.trim() && next.sertifikatLama) { delete next.sertifikatLama; changed = true; }
        }
      }

      if (needDataBaru) {
        dataBaru.forEach((item, idx) => {
          if (item.namaPemilikBaru?.trim() && next[`dataBaru.${idx}.namaPemilikBaru`]) { delete next[`dataBaru.${idx}.namaPemilikBaru`]; changed = true; }
          if (item.alamatPemilikBaru?.trim() && next[`dataBaru.${idx}.alamatPemilikBaru`]) { delete next[`dataBaru.${idx}.alamatPemilikBaru`]; changed = true; }
          if (item.kecamatanPemilikBaru?.trim() && next[`dataBaru.${idx}.kecamatanPemilikBaru`]) { delete next[`dataBaru.${idx}.kecamatanPemilikBaru`]; changed = true; }
          if (item.desaPemilikBaru?.trim() && next[`dataBaru.${idx}.desaPemilikBaru`]) { delete next[`dataBaru.${idx}.desaPemilikBaru`]; changed = true; }
          if (item.alamatObjekBaru?.trim() && next[`dataBaru.${idx}.alamatObjekBaru`]) { delete next[`dataBaru.${idx}.alamatObjekBaru`]; changed = true; }
          if (item.kecamatanObjekBaru?.trim() && next[`dataBaru.${idx}.kecamatanObjekBaru`]) { delete next[`dataBaru.${idx}.kecamatanObjekBaru`]; changed = true; }
          if (item.desaObjekBaru?.trim() && next[`dataBaru.${idx}.desaObjekBaru`]) { delete next[`dataBaru.${idx}.desaObjekBaru`]; changed = true; }
          if (item.luasTanahBaru !== '' && Number(item.luasTanahBaru) >= 0 && next[`dataBaru.${idx}.luasTanahBaru`]) { delete next[`dataBaru.${idx}.luasTanahBaru`]; changed = true; }
          if (item.luasBangunanBaru !== '' && Number(item.luasBangunanBaru) >= 0 && next[`dataBaru.${idx}.luasBangunanBaru`]) { delete next[`dataBaru.${idx}.luasBangunanBaru`]; changed = true; }
          if (item.sertifikatBaru?.trim() && next[`dataBaru.${idx}.sertifikatBaru`]) { delete next[`dataBaru.${idx}.sertifikatBaru`]; changed = true; }
        });
      }

      if (changed && Object.keys(next).length === 0) {
        setError('');
      }

      return changed ? next : prev;
    });
  }, [
    nomorPelayanan, tanggalNoPelayanan, tanggalPenyelesaian, noWhatsapp,
    jenisPermohonan, nopLama, namaPemilikLama, alamatPemilikLama, kecamatanPemilikLama, desaPemilikLama,
    alamatObjekLama, kecamatanObjekLama, desaObjekLama, luasTanahLama, luasBangunanLama, sertifikatLama,
    needDataLama, needDataBaru, dataLama, dataBaru
  ]);

  const validateCurrentStep = useCallback(() => {
    const errors: Record<string, string> = {};
    const stepLabel = steps[currentStep - 1]?.label;

    if (stepLabel === 'Data Utama') {
      if (!nomorPelayanan || !nomorPelayanan.trim()) errors.nomorPelayanan = 'Nomor pelayanan wajib diisi';
      if (!tanggalNoPelayanan || !tanggalNoPelayanan.trim()) errors.tanggalNoPelayanan = 'Tanggal pelayanan wajib diisi';
      if (!tanggalPenyelesaian || !tanggalPenyelesaian.trim()) errors.tanggalPenyelesaian = 'Tanggal penyelesaian wajib diisi';
      if (!noWhatsapp || !/^(628)\d{8,12}$/.test(noWhatsapp)) {
        errors.noWhatsapp = 'WhatsApp tidak valid (minimal 10 digit angka setelah +62)';
      }
    } else if (stepLabel === 'Data Lama (Asal)') {
      if (jenisPermohonan === 'MUTASI_PENGGABUNGAN') {
        if (dataLama.length < 2) {
          errors.dataLamaGeneral = 'Mutasi penggabungan wajib memiliki minimal 2 NOP Asal';
        }
        dataLama.forEach((item, idx) => {
          if (!item.nopLama || !/^\d{18}$/.test(item.nopLama.replace(/[.\-]/g, ''))) {
            errors[`dataLama.${idx}.nopLama`] = 'NOP Asal harus 18 digit';
          }
          if (!item.namaPemilikLama?.trim()) errors[`dataLama.${idx}.namaPemilikLama`] = 'Nama pemilik lama wajib diisi';
          if (!item.alamatObjekLama?.trim()) errors[`dataLama.${idx}.alamatObjekLama`] = 'Alamat objek lama wajib diisi';
          if (!item.blokObjekLama?.trim()) errors[`dataLama.${idx}.blokObjekLama`] = 'Blok objek lama wajib diisi';
          if (!item.rtObjekLama?.trim()) errors[`dataLama.${idx}.rtObjekLama`] = 'RT objek lama wajib diisi';
          if (!item.rwObjekLama?.trim()) errors[`dataLama.${idx}.rwObjekLama`] = 'RW objek lama wajib diisi';
          if (!item.kecamatanObjekLama?.trim()) errors[`dataLama.${idx}.kecamatanObjekLama`] = 'Kecamatan objek lama wajib diisi';
          if (!item.desaObjekLama?.trim()) errors[`dataLama.${idx}.desaObjekLama`] = 'Desa objek lama wajib diisi';
          if (item.luasTanahLama === undefined || item.luasTanahLama === null || item.luasTanahLama === '' || Number(item.luasTanahLama) < 0) {
            errors[`dataLama.${idx}.luasTanahLama`] = 'Luas tanah wajib diisi & >= 0';
          }
          if (item.luasBangunanLama === undefined || item.luasBangunanLama === null || item.luasBangunanLama === '' || Number(item.luasBangunanLama) < 0) {
            errors[`dataLama.${idx}.luasBangunanLama`] = 'Luas bangunan wajib diisi & >= 0';
          }
        });
      } else {
        if (!nopLama || !/^\d{18}$/.test(nopLama.replace(/[.\-]/g, ''))) errors.nopLama = 'NOP harus tepat 18 digit angka';
        if (!namaPemilikLama?.trim()) errors.namaPemilikLama = 'Nama pemilik lama wajib diisi';
        if (!alamatObjekLama?.trim()) errors.alamatObjekLama = 'Alamat objek lama wajib diisi';
        if (!blokObjekLama?.trim()) errors.blokObjekLama = 'Blok objek lama wajib diisi';
        if (!rtObjekLama?.trim()) errors.rtObjekLama = 'RT objek lama wajib diisi';
        if (!rwObjekLama?.trim()) errors.rwObjekLama = 'RW objek lama wajib diisi';
        if (!kecamatanObjekLama?.trim()) errors.kecamatanObjekLama = 'Kecamatan objek lama wajib diisi';
        if (!desaObjekLama?.trim()) errors.desaObjekLama = 'Desa objek lama wajib diisi';
        if (luasTanahLama === undefined || luasTanahLama === null || luasTanahLama === '' || Number(luasTanahLama) < 0) {
          errors.luasTanahLama = 'Luas tanah lama wajib diisi & >= 0';
        }
        if (luasBangunanLama === undefined || luasBangunanLama === null || luasBangunanLama === '' || Number(luasBangunanLama) < 0) {
          errors.luasBangunanLama = 'Luas bangunan lama wajib diisi & >= 0';
        }

        if (jenisPermohonan === 'PENGAKTIFAN' || jenisPermohonan === 'PEMBETULAN') {
          if (!alamatPemilikLama?.trim()) errors.alamatPemilikLama = 'Alamat pemilik lama wajib diisi';
          if (!blokPemilikLama?.trim()) errors.blokPemilikLama = 'Blok pemilik lama wajib diisi';
          if (!rtPemilikLama?.trim()) errors.rtPemilikLama = 'RT pemilik lama wajib diisi';
          if (!rwPemilikLama?.trim()) errors.rwPemilikLama = 'RW pemilik lama wajib diisi';
          if (!sertifikatLama?.trim()) errors.sertifikatLama = 'Sertifikat lama wajib diisi';
        }
      }
    } else if (stepLabel === 'Data Baru') {
      dataBaru.forEach((item, idx) => {
        if (jenisPermohonan === 'OBJEK_PAJAK_BARU' && (!item.nopBaru || !item.nopBaru.trim())) {
          errors[`dataBaru.${idx}.nopBaru`] = 'NOP baru wajib diisi untuk Objek Pajak Baru';
        }
        if (!item.namaPemilikBaru?.trim()) errors[`dataBaru.${idx}.namaPemilikBaru`] = 'Nama pemilik baru wajib diisi';
        if (!item.alamatPemilikBaru?.trim()) errors[`dataBaru.${idx}.alamatPemilikBaru`] = 'Alamat pemilik baru wajib diisi';
        if (!item.blokPemilikBaru?.trim()) errors[`dataBaru.${idx}.blokPemilikBaru`] = 'Blok pemilik baru wajib diisi';
        if (!item.rtPemilikBaru?.trim()) errors[`dataBaru.${idx}.rtPemilikBaru`] = 'RT pemilik baru wajib diisi';
        if (!item.rwPemilikBaru?.trim()) errors[`dataBaru.${idx}.rwPemilikBaru`] = 'RW pemilik baru wajib diisi';
        if (!item.kecamatanPemilikBaru?.trim()) errors[`dataBaru.${idx}.kecamatanPemilikBaru`] = 'Kecamatan pemilik baru wajib diisi';
        if (!item.desaPemilikBaru?.trim()) errors[`dataBaru.${idx}.desaPemilikBaru`] = 'Desa pemilik baru wajib diisi';
        if (!item.alamatObjekBaru?.trim()) errors[`dataBaru.${idx}.alamatObjekBaru`] = 'Alamat objek baru wajib diisi';
        if (!item.blokObjekBaru?.trim()) errors[`dataBaru.${idx}.blokObjekBaru`] = 'Blok objek baru wajib diisi';
        if (!item.rtObjekBaru?.trim()) errors[`dataBaru.${idx}.rtObjekBaru`] = 'RT objek baru wajib diisi';
        if (!item.rwObjekBaru?.trim()) errors[`dataBaru.${idx}.rwObjekBaru`] = 'RW objek baru wajib diisi';
        if (!item.kecamatanObjekBaru?.trim()) errors[`dataBaru.${idx}.kecamatanObjekBaru`] = 'Kecamatan objek baru wajib diisi';
        if (!item.desaObjekBaru?.trim()) errors[`dataBaru.${idx}.desaObjekBaru`] = 'Desa objek baru wajib diisi';
        if (item.luasTanahBaru === undefined || item.luasTanahBaru === null || item.luasTanahBaru === '' || Number(item.luasTanahBaru) < 0) {
          errors[`dataBaru.${idx}.luasTanahBaru`] = 'Luas tanah baru wajib diisi & >= 0';
        }
        if (item.luasBangunanBaru === undefined || item.luasBangunanBaru === null || item.luasBangunanBaru === '' || Number(item.luasBangunanBaru) < 0) {
          errors[`dataBaru.${idx}.luasBangunanBaru`] = 'Luas bangunan baru wajib diisi & >= 0';
        }
        if (!item.sertifikatBaru?.trim()) errors[`dataBaru.${idx}.sertifikatBaru`] = 'Sertifikat baru wajib diisi';
      });
    }

    return errors;
  }, [
    currentStep, steps, nomorPelayanan, tanggalNoPelayanan, tanggalPenyelesaian, noWhatsapp,
    jenisPermohonan, nopLama, namaPemilikLama, alamatPemilikLama, blokPemilikLama, rtPemilikLama, rwPemilikLama,
    kecamatanPemilikLama, desaPemilikLama, alamatObjekLama, blokObjekLama, rtObjekLama, rwObjekLama,
    kecamatanObjekLama, desaObjekLama, luasTanahLama, luasBangunanLama, sertifikatLama, dataLama,
    dataBaru
  ]);

  const validateFullForm = useCallback(() => {
    const errors: Record<string, string> = {};

    // Step 1: Data Utama
    if (!nomorPelayanan || !nomorPelayanan.trim()) errors.nomorPelayanan = 'Nomor pelayanan wajib diisi';
    if (!tanggalNoPelayanan || !tanggalNoPelayanan.trim()) errors.tanggalNoPelayanan = 'Tanggal pelayanan wajib diisi';
    if (!tanggalPenyelesaian || !tanggalPenyelesaian.trim()) errors.tanggalPenyelesaian = 'Tanggal penyelesaian wajib diisi';
    if (!noWhatsapp || !/^(628)\d{8,12}$/.test(noWhatsapp)) {
      errors.noWhatsapp = 'WhatsApp tidak valid (minimal 10 digit angka setelah +62)';
    }

    // Step 2: Data Lama
    if (needDataLama) {
      if (jenisPermohonan === 'MUTASI_PENGGABUNGAN') {
        if (dataLama.length < 2) {
          errors.dataLamaGeneral = 'Mutasi penggabungan wajib memiliki minimal 2 NOP Asal';
        }
        dataLama.forEach((item, idx) => {
          if (!item.nopLama || !/^\d{18}$/.test(item.nopLama.replace(/[.\-]/g, ''))) {
            errors[`dataLama.${idx}.nopLama`] = 'NOP Asal harus 18 digit';
          }
          if (!item.namaPemilikLama?.trim()) errors[`dataLama.${idx}.namaPemilikLama`] = 'Nama pemilik lama wajib diisi';
          if (!item.alamatObjekLama?.trim()) errors[`dataLama.${idx}.alamatObjekLama`] = 'Alamat objek lama wajib diisi';
          if (!item.blokObjekLama?.trim()) errors[`dataLama.${idx}.blokObjekLama`] = 'Blok objek lama wajib diisi';
          if (!item.rtObjekLama?.trim()) errors[`dataLama.${idx}.rtObjekLama`] = 'RT objek lama wajib diisi';
          if (!item.rwObjekLama?.trim()) errors[`dataLama.${idx}.rwObjekLama`] = 'RW objek lama wajib diisi';
          if (!item.kecamatanObjekLama?.trim()) errors[`dataLama.${idx}.kecamatanObjekLama`] = 'Kecamatan objek lama wajib diisi';
          if (!item.desaObjekLama?.trim()) errors[`dataLama.${idx}.desaObjekLama`] = 'Desa objek lama wajib diisi';
          if (item.luasTanahLama === undefined || item.luasTanahLama === null || item.luasTanahLama === '' || Number(item.luasTanahLama) < 0) {
            errors[`dataLama.${idx}.luasTanahLama`] = 'Luas tanah wajib diisi & >= 0';
          }
          if (item.luasBangunanLama === undefined || item.luasBangunanLama === null || item.luasBangunanLama === '' || Number(item.luasBangunanLama) < 0) {
            errors[`dataLama.${idx}.luasBangunanLama`] = 'Luas bangunan wajib diisi & >= 0';
          }
        });
      } else {
        if (!nopLama || !/^\d{18}$/.test(nopLama.replace(/[.\-]/g, ''))) errors.nopLama = 'NOP harus tepat 18 digit angka';
        if (!namaPemilikLama?.trim()) errors.namaPemilikLama = 'Nama pemilik lama wajib diisi';
        if (!alamatObjekLama?.trim()) errors.alamatObjekLama = 'Alamat objek lama wajib diisi';
        if (!blokObjekLama?.trim()) errors.blokObjekLama = 'Blok objek lama wajib diisi';
        if (!rtObjekLama?.trim()) errors.rtObjekLama = 'RT objek lama wajib diisi';
        if (!rwObjekLama?.trim()) errors.rwObjekLama = 'RW objek lama wajib diisi';
        if (!kecamatanObjekLama?.trim()) errors.kecamatanObjekLama = 'Kecamatan objek lama wajib diisi';
        if (!desaObjekLama?.trim()) errors.desaObjekLama = 'Desa objek lama wajib diisi';
        if (luasTanahLama === undefined || luasTanahLama === null || luasTanahLama === '' || Number(luasTanahLama) < 0) {
          errors.luasTanahLama = 'Luas tanah lama wajib diisi & >= 0';
        }
        if (luasBangunanLama === undefined || luasBangunanLama === null || luasBangunanLama === '' || Number(luasBangunanLama) < 0) {
          errors.luasBangunanLama = 'Luas bangunan lama wajib diisi & >= 0';
        }

        if (jenisPermohonan === 'PENGAKTIFAN' || jenisPermohonan === 'PEMBETULAN') {
          if (!alamatPemilikLama?.trim()) errors.alamatPemilikLama = 'Alamat pemilik lama wajib diisi';
          if (!blokPemilikLama?.trim()) errors.blokPemilikLama = 'Blok pemilik lama wajib diisi';
          if (!rtPemilikLama?.trim()) errors.rtPemilikLama = 'RT pemilik lama wajib diisi';
          if (!rwPemilikLama?.trim()) errors.rwPemilikLama = 'RW pemilik lama wajib diisi';
          if (!sertifikatLama?.trim()) errors.sertifikatLama = 'Sertifikat lama wajib diisi';
        }
      }
    }

    // Step 3: Data Baru
    if (needDataBaru) {
      dataBaru.forEach((item, idx) => {
        if (jenisPermohonan === 'OBJEK_PAJAK_BARU' && (!item.nopBaru || !item.nopBaru.trim())) {
          errors[`dataBaru.${idx}.nopBaru`] = 'NOP baru wajib diisi untuk Objek Pajak Baru';
        }
        if (!item.namaPemilikBaru?.trim()) errors[`dataBaru.${idx}.namaPemilikBaru`] = 'Nama pemilik baru wajib diisi';
        if (!item.alamatPemilikBaru?.trim()) errors[`dataBaru.${idx}.alamatPemilikBaru`] = 'Alamat pemilik baru wajib diisi';
        if (!item.blokPemilikBaru?.trim()) errors[`dataBaru.${idx}.blokPemilikBaru`] = 'Blok pemilik baru wajib diisi';
        if (!item.rtPemilikBaru?.trim()) errors[`dataBaru.${idx}.rtPemilikBaru`] = 'RT pemilik baru wajib diisi';
        if (!item.rwPemilikBaru?.trim()) errors[`dataBaru.${idx}.rwPemilikBaru`] = 'RW pemilik baru wajib diisi';
        if (!item.kecamatanPemilikBaru?.trim()) errors[`dataBaru.${idx}.kecamatanPemilikBaru`] = 'Kecamatan pemilik baru wajib diisi';
        if (!item.desaPemilikBaru?.trim()) errors[`dataBaru.${idx}.desaPemilikBaru`] = 'Desa pemilik baru wajib diisi';
        if (!item.alamatObjekBaru?.trim()) errors[`dataBaru.${idx}.alamatObjekBaru`] = 'Alamat objek baru wajib diisi';
        if (!item.blokObjekBaru?.trim()) errors[`dataBaru.${idx}.blokObjekBaru`] = 'Blok objek baru wajib diisi';
        if (!item.rtObjekBaru?.trim()) errors[`dataBaru.${idx}.rtObjekBaru`] = 'RT objek baru wajib diisi';
        if (!item.rwObjekBaru?.trim()) errors[`dataBaru.${idx}.rwObjekBaru`] = 'RW objek baru wajib diisi';
        if (!item.kecamatanObjekBaru?.trim()) errors[`dataBaru.${idx}.kecamatanObjekBaru`] = 'Kecamatan objek baru wajib diisi';
        if (!item.desaObjekBaru?.trim()) errors[`dataBaru.${idx}.desaObjekBaru`] = 'Desa objek baru wajib diisi';
        if (item.luasTanahBaru === undefined || item.luasTanahBaru === null || item.luasTanahBaru === '' || Number(item.luasTanahBaru) < 0) {
          errors[`dataBaru.${idx}.luasTanahBaru`] = 'Luas tanah baru wajib diisi & >= 0';
        }
        if (item.luasBangunanBaru === undefined || item.luasBangunanBaru === null || item.luasBangunanBaru === '' || Number(item.luasBangunanBaru) < 0) {
          errors[`dataBaru.${idx}.luasBangunanBaru`] = 'Luas bangunan baru wajib diisi & >= 0';
        }
        if (!item.sertifikatBaru?.trim()) errors[`dataBaru.${idx}.sertifikatBaru`] = 'Sertifikat baru wajib diisi';
      });
    }

    return errors;
  }, [
    nomorPelayanan, tanggalNoPelayanan, tanggalPenyelesaian, noWhatsapp,
    needDataLama, jenisPermohonan, dataLama, nopLama, namaPemilikLama, alamatPemilikLama, blokPemilikLama, rtPemilikLama, rwPemilikLama,
    kecamatanPemilikLama, desaPemilikLama, alamatObjekLama, blokObjekLama, rtObjekLama, rwObjekLama, kecamatanObjekLama, desaObjekLama,
    luasTanahLama, luasBangunanLama, sertifikatLama, needDataBaru, dataBaru
  ]);

  const handleNextStep = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setError('');
    const errors = validateCurrentStep();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setError('Form kurang lengkap. Harap periksa detail isian merah di bawah.');

      setTimeout(() => {
        const firstErrorKey = Object.keys(errors)[0];
        const element = document.getElementById(firstErrorKey);
        if (element) {
          element.focus();
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);

      return;
    }
    setFormErrors({});
    setCurrentStep(prev => prev + 1);
  }, [validateCurrentStep]);

  const handlePrevStep = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setError('');
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate ALL fields across full form before submitting
    const errors = validateFullForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setError('Formulir belum lengkap. Harap periksa dan lengkapi bagian berpembatas merah.');

      const firstKey = Object.keys(errors)[0];
      const currentLabel = steps[currentStep - 1]?.label;

      if (firstKey.startsWith('dataBaru.') && currentLabel !== 'Data Baru') {
        const stepIdx = steps.findIndex(s => s.label === 'Data Baru');
        if (stepIdx !== -1) setCurrentStep(stepIdx + 1);
      } else if (firstKey.startsWith('dataLama.') && currentLabel !== 'Data Lama (Asal)') {
        const stepIdx = steps.findIndex(s => s.label === 'Data Lama (Asal)');
        if (stepIdx !== -1) setCurrentStep(stepIdx + 1);
      } else if ((firstKey === 'nomorPelayanan' || firstKey === 'tanggalNoPelayanan' || firstKey === 'tanggalPenyelesaian' || firstKey === 'noWhatsapp') && currentLabel !== 'Data Utama') {
        setCurrentStep(1);
      }

      setTimeout(() => {
        const element = document.getElementById(firstKey);
        if (element) {
          element.focus();
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);

      return;
    }

    // Determine derived NOP
    let derivedNop = '';
    if (jenisPermohonan === 'MUTASI_PENGGABUNGAN' && dataLama.length > 0) {
      let maxLt = -1;
      let selectedItem = dataLama[0];
      dataLama.forEach(item => {
        const lt = Number(item.luasTanahLama) || 0;
        if (lt > maxLt) {
          maxLt = lt;
          selectedItem = item;
        }
      });
      derivedNop = selectedItem.nopLama?.replace(/[.\-]/g, '') || '';
    } else if (needDataLama) {
      derivedNop = nopLama.replace(/[.\-]/g, '');
    } else if (dataBaru.length > 0) {
      derivedNop = dataBaru[0].nopBaru?.replace(/[.\-]/g, '') || '-';
    } else {
      derivedNop = '-';
    }

    const payloadDataLama = jenisPermohonan === 'MUTASI_PENGGABUNGAN'
      ? dataLama.map((item, idx) => ({
        nopLama: item.nopLama ? item.nopLama.replace(/[.\-]/g, '') : null,
        namaPemilikLama: item.namaPemilikLama ? item.namaPemilikLama.toUpperCase() : null,
        alamatPemilikLama: item.alamatPemilikLama ? item.alamatPemilikLama.toUpperCase() : null,
        blokPemilikLama: item.blokPemilikLama ? item.blokPemilikLama.toUpperCase() : null,
        rtPemilikLama: item.rtPemilikLama ? item.rtPemilikLama.toUpperCase() : null,
        rwPemilikLama: item.rwPemilikLama ? item.rwPemilikLama.toUpperCase() : null,
        kecamatanPemilikLama: item.kecamatanPemilikLama ? item.kecamatanPemilikLama.toUpperCase() : null,
        desaPemilikLama: item.desaPemilikLama ? item.desaPemilikLama.toUpperCase() : null,
        alamatObjekLama: item.alamatObjekLama ? item.alamatObjekLama.toUpperCase() : null,
        blokObjekLama: item.blokObjekLama ? item.blokObjekLama.toUpperCase() : null,
        rtObjekLama: item.rtObjekLama ? item.rtObjekLama.toUpperCase() : null,
        rwObjekLama: item.rwObjekLama ? item.rwObjekLama.toUpperCase() : null,
        kecamatanObjekLama: item.kecamatanObjekLama ? item.kecamatanObjekLama.toUpperCase() : null,
        desaObjekLama: item.desaObjekLama ? item.desaObjekLama.toUpperCase() : null,
        luasTanahLama: Number(item.luasTanahLama) || 0,
        luasBangunanLama: Number(item.luasBangunanLama) || 0,
        sertifikatLama: item.sertifikatLama ? item.sertifikatLama.toUpperCase() : null,
        isUtama: idx === 0
      }))
      : (needDataLama ? [{
        nopLama: nopLama ? nopLama.replace(/[.\-]/g, '') : null,
        namaPemilikLama: namaPemilikLama ? namaPemilikLama.toUpperCase() : null,
        alamatPemilikLama: alamatPemilikLama ? alamatPemilikLama.toUpperCase() : null,
        blokPemilikLama: blokPemilikLama ? blokPemilikLama.toUpperCase() : null,
        rtPemilikLama: rtPemilikLama ? rtPemilikLama.toUpperCase() : null,
        rwPemilikLama: rwPemilikLama ? rwPemilikLama.toUpperCase() : null,
        kecamatanPemilikLama: kecamatanPemilikLama ? kecamatanPemilikLama.toUpperCase() : null,
        desaPemilikLama: desaPemilikLama ? desaPemilikLama.toUpperCase() : null,
        alamatObjekLama: alamatObjekLama ? alamatObjekLama.toUpperCase() : null,
        blokObjekLama: blokObjekLama ? blokObjekLama.toUpperCase() : null,
        rtObjekLama: rtObjekLama ? rtObjekLama.toUpperCase() : null,
        rwObjekLama: rwObjekLama ? rwObjekLama.toUpperCase() : null,
        kecamatanObjekLama: kecamatanObjekLama ? kecamatanObjekLama.toUpperCase() : null,
        desaObjekLama: desaObjekLama ? desaObjekLama.toUpperCase() : null,
        luasTanahLama: Number(luasTanahLama) || 0,
        luasBangunanLama: Number(luasBangunanLama) || 0,
        sertifikatLama: sertifikatLama ? sertifikatLama.toUpperCase() : null,
        isUtama: true
      }] : []);

    const firstLama: any = payloadDataLama[0] || {};

    const formData = {
      jenisPermohonan,
      nomorPelayanan: nomorPelayanan.toUpperCase(),
      tanggalNoPelayanan,
      tanggalPenyelesaian: tanggalPenyelesaian || null,
      nop: derivedNop,
      noWhatsapp,
      namaPemilikLama: firstLama.namaPemilikLama || null,
      alamatPemilikLama: firstLama.alamatPemilikLama || null,
      blokPemilikLama: firstLama.blokPemilikLama || null,
      rtPemilikLama: firstLama.rtPemilikLama || null,
      rwPemilikLama: firstLama.rwPemilikLama || null,
      kecamatanPemilikLama: firstLama.kecamatanPemilikLama || null,
      desaPemilikLama: firstLama.desaPemilikLama || null,
      alamatObjekLama: firstLama.alamatObjekLama || null,
      blokObjekLama: firstLama.blokObjekLama || null,
      rtObjekLama: firstLama.rtObjekLama || null,
      rwObjekLama: firstLama.rwObjekLama || null,
      kecamatanObjekLama: firstLama.kecamatanObjekLama || null,
      desaObjekLama: firstLama.desaObjekLama || null,
      luasTanahLama: firstLama.luasTanahLama ?? null,
      luasBangunanLama: firstLama.luasBangunanLama ?? null,
      sertifikatLama: firstLama.sertifikatLama || null,
      dataLama: payloadDataLama,
      dataBaru: needDataBaru ? dataBaru.map(item => ({
        nopBaru: item.nopBaru ? item.nopBaru.replace(/[.\-]/g, '') : null,
        namaPemilikBaru: item.namaPemilikBaru ? item.namaPemilikBaru.toUpperCase() : null,
        alamatPemilikBaru: item.alamatPemilikBaru ? item.alamatPemilikBaru.toUpperCase() : null,
        blokPemilikBaru: item.blokPemilikBaru ? item.blokPemilikBaru.toUpperCase() : null,
        rtPemilikBaru: item.rtPemilikBaru ? item.rtPemilikBaru.toUpperCase() : null,
        rwPemilikBaru: item.rwPemilikBaru ? item.rwPemilikBaru.toUpperCase() : null,
        kecamatanPemilikBaru: item.kecamatanPemilikBaru ? item.kecamatanPemilikBaru.toUpperCase() : null,
        desaPemilikBaru: item.desaPemilikBaru ? item.desaPemilikBaru.toUpperCase() : null,
        alamatObjekBaru: item.alamatObjekBaru ? item.alamatObjekBaru.toUpperCase() : null,
        blokObjekBaru: item.blokObjekBaru ? item.blokObjekBaru.toUpperCase() : null,
        rtObjekBaru: item.rtObjekBaru ? item.rtObjekBaru.toUpperCase() : null,
        rwObjekBaru: item.rwObjekBaru ? item.rwObjekBaru.toUpperCase() : null,
        kecamatanObjekBaru: item.kecamatanObjekBaru ? item.kecamatanObjekBaru.toUpperCase() : null,
        desaObjekBaru: item.desaObjekBaru ? item.desaObjekBaru.toUpperCase() : null,
        luasTanahBaru: item.luasTanahBaru !== '' ? Number(item.luasTanahBaru) : null,
        luasBangunanBaru: item.luasBangunanBaru !== '' ? Number(item.luasBangunanBaru) : null,
        sertifikatBaru: item.sertifikatBaru ? item.sertifikatBaru.toUpperCase() : null,
        catatan: item.catatan ? item.catatan.toUpperCase() : null
      })) : []
    };

    setStatusModalTitle('Menyimpan Permohonan');
    setStatusModalMessage('Sedang memproses dan menyimpan data permohonan ke server...');
    setStatusModalStatus('loading');
    setStatusModalOpen(true);
    setLoading(true);

    try {
      const res: any = await createPermohonan(formData);
      if (res.success) {
        setStatusModalTitle('Penyimpanan Berhasil');
        setStatusModalMessage('Data permohonan Anda berhasil disimpan dan didaftarkan ke sistem!');
        setStatusModalStatus('success');
        try {
          localStorage.removeItem('permohonan_form_draft');
        } catch (e) {
          console.error(e);
        }
      } else {
        if (res.issues && Array.isArray(res.issues)) {
          const backendErrors: Record<string, string> = {};
          res.issues.forEach((issue: any) => {
            const key = issue.path ? issue.path.join('.') : 'general';
            backendErrors[key] = issue.message;
          });
          if (Object.keys(backendErrors).length > 0) {
            setFormErrors(backendErrors);
          }
        }
        setStatusModalTitle('Penyimpanan Gagal');
        setStatusModalMessage(res.error || 'Gagal menyimpan data permohonan.');
        setStatusModalStatus('error');
      }
    } catch (err: any) {
      setStatusModalTitle('Terjadi Kesalahan');
      setStatusModalMessage(err.message || 'Terjadi kesalahan sistem saat menyimpan permohonan.');
      setStatusModalStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^\d]/g, '');
    if (val.startsWith('62')) {
      val = val.slice(2);
    }
    if (val.startsWith('0')) {
      val = val.slice(1);
    }
    setNoWhatsapp(val ? '62' + val : '');
  };

  const currentStepLabel = steps[currentStep - 1]?.label;

  return (
    <div className="w-full bg-transparent animate-fadeIn">
      {/* Full-width Stepper Card Container */}
      <div className="w-full bg-white rounded-md border border-slate-200/90 shadow-xs flex flex-col overflow-hidden">

        {/* Top Header Bar: Back & Reset Draft Buttons */}
        <div className="px-6 py-3.5 border-b border-slate-200/80 bg-white flex flex-row items-center justify-between gap-3 select-none">
          <button
            type="button"
            onClick={onCancel}
            className="h-9 px-3.5 rounded-md border border-slate-200/90 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-normal text-[13px] font-sans transition-all cursor-pointer shadow-3xs flex items-center gap-2 shrink-0"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Kembali</span>
          </button>

          <button
            type="button"
            onClick={handleResetDraft}
            disabled={loading}
            className="h-9 px-3 rounded-md border border-red-200/90 bg-red-50/60 hover:bg-red-100/80 text-red-600 font-normal text-[12px] font-sans transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
            title="Hapus draf dari penyimpanan lokal dan reset formulir"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Form & Draf</span>
          </button>
        </div>

        {/* Labeled Multi-Step Stepper Bar */}
        {steps.length > 1 && (
          <div className="border-b border-slate-200/80 bg-slate-50/80 px-6 py-3 select-none">
            <div className="flex items-center justify-between gap-2 max-w-2xl mx-auto">
              {steps.map((step, idx) => {
                const stepNum = idx + 1;
                const isActive = currentStep === stepNum;
                const isCompleted = currentStep > stepNum;

                return (
                  <React.Fragment key={step.label}>
                    {idx > 0 && (
                      <div className={`flex-1 h-0.5 transition-all ${isCompleted ? 'bg-[#00a389]' : 'bg-slate-200/80'}`} />
                    )}
                    <button
                      type="button"
                      disabled={stepNum > currentStep && !isCompleted}
                      onClick={() => {
                        if (stepNum < currentStep) setCurrentStep(stepNum);
                      }}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all cursor-pointer text-[13px] font-normal font-sans ${isActive
                        ? 'bg-[#00a389] text-white shadow-3xs'
                        : isCompleted
                          ? 'bg-[#e6f6f4] text-[#008f78] hover:bg-[#d8f2ee]'
                          : 'bg-white text-slate-400 border border-slate-200/90 cursor-not-allowed'
                        }`}
                    >
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-normal ${isActive ? 'bg-white/20 text-white' : isCompleted ? 'bg-[#00a389] text-white' : 'bg-slate-200 text-slate-500'
                        }`}>
                        {isCompleted ? '✓' : stepNum}
                      </span>
                      <span>{step.label}</span>
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* Form Body Container */}
        <div className="p-6 sm:p-8 flex flex-col gap-6">

          {error && (
            <div className="bg-red-50/80 border border-red-200/65 text-red-750 text-xs font-bold rounded-md px-4 py-3 flex items-start gap-2.5 animate-fadeIn shrink-0">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50/80 border border-emerald-200/65 text-emerald-800 text-xs font-bold rounded-md px-4 py-3 flex items-start gap-2.5 animate-fadeIn shrink-0">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleCreate} className="flex flex-col gap-6" autoComplete="off">

            {/* STEP 1: DATA UTAMA */}
            {currentStepLabel === 'Data Utama' && (
              <div className="flex flex-col gap-5 bg-transparent animate-fadeIn font-sans">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">
                      Jenis Layanan Permohonan <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={jenisPermohonan}
                      onChange={(e) => setJenisPermohonan(e.target.value)}
                      disabled={loading}
                      className={getInputClass(false, 'cursor-pointer')}
                    >
                      {JENIS_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">Nomor Pelayanan <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      id="nomorPelayanan"
                      autoComplete="off"
                      value={nomorPelayanan}
                      onChange={(e) => setNomorPelayanan(e.target.value.toUpperCase())}
                      style={{ textTransform: 'uppercase' }}
                      disabled={loading}
                      className={getInputClass(!!formErrors.nomorPelayanan, 'font-mono tracking-wide')}
                    />
                    {formErrors.nomorPelayanan && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5 font-sans">{formErrors.nomorPelayanan}</span>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">Nomor WhatsApp WP <span className="text-red-500">*</span></label>
                    <div className={getWhatsAppContainerClass(!!formErrors.noWhatsapp)}>
                      <span className="bg-slate-50 border-r border-slate-200 px-3.5 py-2.5 text-[13px] font-normal text-slate-600 select-none flex items-center gap-1 shrink-0 font-sans">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>+62</span>
                      </span>
                      <input
                        type="text"
                        id="noWhatsapp"
                        autoComplete="off"
                        placeholder="81234567890"
                        value={noWhatsapp.startsWith('62') ? noWhatsapp.slice(2) : noWhatsapp}
                        onChange={handleWhatsappChange}
                        disabled={loading}
                        className="w-full px-3.5 py-2.5 text-[13px] font-normal text-slate-900 focus:outline-none bg-white font-sans"
                      />
                    </div>
                    {formErrors.noWhatsapp && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5 font-sans">{formErrors.noWhatsapp}</span>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">Tanggal Pelayanan <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      id="tanggalNoPelayanan"
                      autoComplete="off"
                      value={tanggalNoPelayanan}
                      onChange={(e) => setTanggalNoPelayanan(e.target.value)}
                      disabled={loading}
                      className={getInputClass(!!formErrors.tanggalNoPelayanan)}
                    />
                    {formErrors.tanggalNoPelayanan && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5 font-sans">{formErrors.tanggalNoPelayanan}</span>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">Tanggal Selesai <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      id="tanggalPenyelesaian"
                      autoComplete="off"
                      value={tanggalPenyelesaian}
                      onChange={(e) => setTanggalPenyelesaian(e.target.value)}
                      disabled={loading}
                      className={getInputClass(!!formErrors.tanggalPenyelesaian)}
                    />
                    {formErrors.tanggalPenyelesaian && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5 font-sans">{formErrors.tanggalPenyelesaian}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: DATA LAMA */}
            {currentStepLabel === 'Data Lama (Asal)' && needDataLama && (
              <div className="flex flex-col gap-5 bg-transparent animate-fadeIn font-sans">

                {/* SPECIAL UI FOR MUTASI_PENGGABUNGAN (MULTI NOP ASAL) */}
                {jenisPermohonan === 'MUTASI_PENGGABUNGAN' ? (
                  <div className="flex flex-col gap-6 font-sans">
                    <div className="flex items-center justify-end select-none mb-1">
                      <button
                        type="button"
                        onClick={handleAddNopAsal}
                        disabled={loading}
                        className="h-8 px-3.5 rounded-md bg-[#00a389] hover:bg-[#008f78] active:scale-95 text-white font-normal text-[13px] shadow-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0 disabled:opacity-50 font-sans"
                      >
                        <Plus className="w-4 h-4 stroke-[3]" /> Tambah NOP Asal
                      </button>
                    </div>

                    {formErrors.dataLamaGeneral && (
                      <span className="text-xs text-red-600 font-normal">{formErrors.dataLamaGeneral}</span>
                    )}

                    {dataLama.map((item, idx) => (
                      <div
                        key={idx}
                        className={`flex flex-col gap-4 relative p-5 border border-slate-200/80 rounded-md pt-10 shadow-3xs bg-white`}
                      >
                        <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between select-none border-b border-slate-100 pb-1">
                          <span className="text-[13px] font-normal text-[#008f78] tracking-wide font-sans">NOP Asal #{idx + 1}</span>
                          <div className="flex items-center gap-2">
                            {idx === 0 && (
                              <span className="px-2 py-0.5 text-[10px] font-medium bg-[#00a389] text-white rounded-md">NOP Utama</span>
                            )}

                            {dataLama.length > 2 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveNopAsal(idx)}
                                disabled={loading}
                                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 font-sans">
                          {/* NOP Asal */}
                          <div className="flex flex-col gap-1.5 sm:col-span-2">
                            <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">Nomor Objek Pajak <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              id={`dataLama.${idx}.nopLama`}
                              autoComplete="off"
                              maxLength={24}
                              placeholder="36.19.xxx.xxx.xxx-xxxx.x"
                              value={item.nopLama}
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
                                handleDataLamaItemChange(idx, 'nopLama', fmt);
                              }}
                              disabled={loading}
                              className={getInputClass(!!formErrors[`dataLama.${idx}.nopLama`], 'font-mono tracking-wide')}
                            />
                            {formErrors[`dataLama.${idx}.nopLama`] && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5 font-sans">{formErrors[`dataLama.${idx}.nopLama`]}</span>}
                          </div>

                          {/* Nama Pemilik */}
                          <div className="flex flex-col gap-1.5 sm:col-span-2">
                            <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">Nama Pemilik Asal <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              id={`dataLama.${idx}.namaPemilikLama`}
                              autoComplete="off"
                              value={item.namaPemilikLama}
                              onChange={(e) => handleDataLamaItemChange(idx, 'namaPemilikLama', e.target.value.toUpperCase())}
                              style={{ textTransform: 'uppercase' }}
                              disabled={loading}
                              className={getInputClass(!!formErrors[`dataLama.${idx}.namaPemilikLama`])}
                            />
                            {formErrors[`dataLama.${idx}.namaPemilikLama`] && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5 font-sans">{formErrors[`dataLama.${idx}.namaPemilikLama`]}</span>}
                          </div>

                          {/* Alamat, Kecamatan, Desa Pemilik Asal */}
                          <div className="flex flex-col gap-5">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">Alamat Pemilik Asal <span className="text-red-500">*</span></label>
                              <input
                                type="text"
                                id={`dataLama.${idx}.alamatPemilikLama`}
                                autoComplete="off"
                                value={item.alamatPemilikLama}
                                onChange={(e) => handleDataLamaItemChange(idx, 'alamatPemilikLama', e.target.value.toUpperCase())}
                                style={{ textTransform: 'uppercase' }}
                                disabled={loading}
                                className={getInputClass(!!formErrors[`dataLama.${idx}.alamatPemilikLama`])}
                              />
                              {formErrors[`dataLama.${idx}.alamatPemilikLama`] && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5 font-sans">{formErrors[`dataLama.${idx}.alamatPemilikLama`]}</span>}
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                              <div className="flex flex-col gap-1">
                                <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">Blok</label>
                                <input
                                  type="text"
                                  placeholder="A4"
                                  autoComplete="off"
                                  value={item.blokPemilikLama || ''}
                                  onChange={(e) => handleDataLamaItemChange(idx, 'blokPemilikLama', e.target.value.toUpperCase())}
                                  style={{ textTransform: 'uppercase' }}
                                  disabled={loading}
                                  className={getInputClass()}
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">RT</label>
                                <input
                                  type="text"
                                  placeholder="001"
                                  autoComplete="off"
                                  value={item.rtPemilikLama || ''}
                                  onChange={(e) => handleDataLamaItemChange(idx, 'rtPemilikLama', e.target.value)}
                                  disabled={loading}
                                  className={getInputClass()}
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">RW</label>
                                <input
                                  type="text"
                                  placeholder="005"
                                  autoComplete="off"
                                  value={item.rwPemilikLama || ''}
                                  onChange={(e) => handleDataLamaItemChange(idx, 'rwPemilikLama', e.target.value)}
                                  disabled={loading}
                                  className={getInputClass()}
                                />
                              </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">Kecamatan Pemilik Asal <span className="text-slate-400 font-normal">(Opsional)</span></label>
                              <input
                                type="text"
                                id={`dataLama.${idx}.kecamatanPemilikLama`}
                                autoComplete="off"
                                value={item.kecamatanPemilikLama}
                                onChange={(e) => handleDataLamaItemChange(idx, 'kecamatanPemilikLama', e.target.value.toUpperCase())}
                                style={{ textTransform: 'uppercase' }}
                                disabled={loading}
                                className={getInputClass(!!formErrors[`dataLama.${idx}.kecamatanPemilikLama`])}
                              />
                              {formErrors[`dataLama.${idx}.kecamatanPemilikLama`] && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5 font-sans">{formErrors[`dataLama.${idx}.kecamatanPemilikLama`]}</span>}
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">Desa Pemilik Asal <span className="text-slate-400 font-normal">(Opsional)</span></label>
                              <input
                                type="text"
                                id={`dataLama.${idx}.desaPemilikLama`}
                                autoComplete="off"
                                value={item.desaPemilikLama}
                                onChange={(e) => handleDataLamaItemChange(idx, 'desaPemilikLama', e.target.value.toUpperCase())}
                                style={{ textTransform: 'uppercase' }}
                                disabled={loading}
                                className={getInputClass(!!formErrors[`dataLama.${idx}.desaPemilikLama`])}
                              />
                              {formErrors[`dataLama.${idx}.desaPemilikLama`] && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5 font-sans">{formErrors[`dataLama.${idx}.desaPemilikLama`]}</span>}
                            </div>
                          </div>

                          {/* Alamat Objek Asal & Wilayah */}
                          <div className="flex flex-col gap-5">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">Alamat Objek Asal <span className="text-red-500">*</span></label>
                              <input
                                type="text"
                                id={`dataLama.${idx}.alamatObjekLama`}
                                autoComplete="off"
                                value={item.alamatObjekLama}
                                onChange={(e) => handleDataLamaItemChange(idx, 'alamatObjekLama', e.target.value.toUpperCase())}
                                style={{ textTransform: 'uppercase' }}
                                disabled={loading}
                                className={getInputClass(!!formErrors[`dataLama.${idx}.alamatObjekLama`])}
                              />
                              {formErrors[`dataLama.${idx}.alamatObjekLama`] && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5 font-sans">{formErrors[`dataLama.${idx}.alamatObjekLama`]}</span>}
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                              <div className="flex flex-col gap-1">
                                <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">Blok Objek</label>
                                <input
                                  type="text"
                                  placeholder="B2"
                                  autoComplete="off"
                                  value={item.blokObjekLama || ''}
                                  onChange={(e) => handleDataLamaItemChange(idx, 'blokObjekLama', e.target.value.toUpperCase())}
                                  style={{ textTransform: 'uppercase' }}
                                  disabled={loading}
                                  className={getInputClass()}
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">RT Objek</label>
                                <input
                                  type="text"
                                  placeholder="001"
                                  autoComplete="off"
                                  value={item.rtObjekLama || ''}
                                  onChange={(e) => handleDataLamaItemChange(idx, 'rtObjekLama', e.target.value)}
                                  disabled={loading}
                                  className={getInputClass()}
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">RW Objek</label>
                                <input
                                  type="text"
                                  placeholder="005"
                                  autoComplete="off"
                                  value={item.rwObjekLama || ''}
                                  onChange={(e) => handleDataLamaItemChange(idx, 'rwObjekLama', e.target.value)}
                                  disabled={loading}
                                  className={getInputClass()}
                                />
                              </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">Kecamatan Objek Asal <span className="text-red-500">*</span></label>
                              <select
                                id={`dataLama.${idx}.kecamatanObjekLama`}
                                value={item.kecamatanObjekLama}
                                onChange={(e) => {
                                  handleDataLamaItemChange(idx, 'kecamatanObjekLama', e.target.value);
                                  handleDataLamaItemChange(idx, 'desaObjekLama', '');
                                }}
                                disabled={loading}
                                className={getInputClass(!!formErrors[`dataLama.${idx}.kecamatanObjekLama`], 'cursor-pointer')}
                              >
                                <option value="">Pilih Kecamatan Objek</option>
                                {Object.keys(KECAMATAN_DATA).map(kec => (
                                  <option key={kec} value={kec}>{kec}</option>
                                ))}
                              </select>
                              {formErrors[`dataLama.${idx}.kecamatanObjekLama`] && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5 font-sans">{formErrors[`dataLama.${idx}.kecamatanObjekLama`]}</span>}
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">Desa Objek Asal <span className="text-red-500">*</span></label>
                              <select
                                id={`dataLama.${idx}.desaObjekLama`}
                                value={item.desaObjekLama}
                                onChange={(e) => handleDataLamaItemChange(idx, 'desaObjekLama', e.target.value)}
                                disabled={loading || !item.kecamatanObjekLama}
                                className={getInputClass(!!formErrors[`dataLama.${idx}.desaObjekLama`], 'cursor-pointer')}
                              >
                                <option value="">
                                  {!item.kecamatanObjekLama ? 'Pilih Kecamatan Terlebih Dahulu' : 'Pilih Desa/Kelurahan Objek'}
                                </option>
                                {item.kecamatanObjekLama && KECAMATAN_DATA[item.kecamatanObjekLama]?.map(desa => (
                                  <option key={desa} value={desa}>{desa}</option>
                                ))}
                              </select>
                              {formErrors[`dataLama.${idx}.desaObjekLama`] && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5 font-sans">{formErrors[`dataLama.${idx}.desaObjekLama`]}</span>}
                            </div>
                          </div>

                          {/* Luas Tanah & Bangunan */}
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">Luas Tanah Asal <span className="text-red-500">*</span></label>
                            <div className="relative">
                              <input
                                type="number"
                                id={`dataLama.${idx}.luasTanahLama`}
                                autoComplete="off"
                                value={item.luasTanahLama}
                                onChange={(e) => handleDataLamaItemChange(idx, 'luasTanahLama', e.target.value)}
                                disabled={loading}
                                className={getInputClass(!!formErrors[`dataLama.${idx}.luasTanahLama`], 'pl-3.5 pr-10')}
                              />
                              <span className="text-slate-500 text-xs font-normal absolute right-3.5 top-1/2 -translate-y-1/2 select-none font-sans">m²</span>
                            </div>
                            {formErrors[`dataLama.${idx}.luasTanahLama`] && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5 font-sans">{formErrors[`dataLama.${idx}.luasTanahLama`]}</span>}
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">Luas Bangunan Asal <span className="text-red-500">*</span></label>
                            <div className="relative">
                              <input
                                type="number"
                                id={`dataLama.${idx}.luasBangunanLama`}
                                autoComplete="off"
                                value={item.luasBangunanLama}
                                onChange={(e) => handleDataLamaItemChange(idx, 'luasBangunanLama', e.target.value)}
                                disabled={loading}
                                className={getInputClass(!!formErrors[`dataLama.${idx}.luasBangunanLama`], 'pl-3.5 pr-10')}
                              />
                              <span className="text-slate-500 text-xs font-normal absolute right-3.5 top-1/2 -translate-y-1/2 select-none font-sans">m²</span>
                            </div>
                            {formErrors[`dataLama.${idx}.luasBangunanLama`] && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5 font-sans">{formErrors[`dataLama.${idx}.luasBangunanLama`]}</span>}
                          </div>
                          <div className="flex flex-col gap-1.5 sm:col-span-2 font-sans">
                            <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">
                              No/Jenis Sertifikat Asal <span className="text-slate-400 font-normal">(Opsional)</span>
                            </label>
                            <input
                              type="text"
                              id={`dataLama.${idx}.sertifikatLama`}
                              autoComplete="off"
                              placeholder="Contoh: SHM NO. 12345"
                              value={item.sertifikatLama || ''}
                              onChange={(e) => handleDataLamaItemChange(idx, 'sertifikatLama', e.target.value.toUpperCase())}
                              style={{ textTransform: 'uppercase' }}
                              disabled={loading}
                              className={getInputClass(!!formErrors[`dataLama.${idx}.sertifikatLama`])}
                            />
                            {formErrors[`dataLama.${idx}.sertifikatLama`] && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5 font-sans">{formErrors[`dataLama.${idx}.sertifikatLama`]}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* SINGLE DATA LAMA FORM */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* NOP Asal (18-digit mask) */}
                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <label className="text-[13px] font-normal text-slate-700 tracking-wide flex items-center justify-between font-sans">
                        <span>Nomor Objek Pajak<span className="text-red-500">*</span></span>
                        <span className={`text-xs font-mono font-normal pr-1 ${nopLama.replace(/[^\d]/g, '').length === 18 ? 'text-[#00a389]' : 'text-slate-400'}`}>
                          {nopLama.replace(/[^\d]/g, '').length}/18 digit
                          {nopLama.replace(/[^\d]/g, '').length === 18 && ' ✓'}
                        </span>
                      </label>
                      <input
                        type="text"
                        id="nopLama"
                        autoComplete="off"
                        maxLength={24}
                        placeholder="Contoh: 36.19.xxx.xxx.xxx-xxxx.x"
                        value={nopLama}
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
                          setNopLama(fmt);
                        }}
                        disabled={loading}
                        className={getInputClass(!!formErrors.nopLama, 'font-mono tracking-wide')}
                      />
                      {formErrors.nopLama && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5 font-sans">{formErrors.nopLama}</span>}
                    </div>

                    {/* Nama pemilik lama (Full Width) */}
                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">Nama Pemilik <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        id="namaPemilikLama"
                        autoComplete="off"
                        value={namaPemilikLama}
                        onChange={(e) => setNamaPemilikLama(e.target.value.toUpperCase())}
                        style={{ textTransform: 'uppercase' }}
                        disabled={loading}
                        className={getInputClass(!!formErrors.namaPemilikLama)}
                      />
                      {formErrors.namaPemilikLama && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5 font-sans">{formErrors.namaPemilikLama}</span>}
                    </div>

                    {/* KELOMPOK ALAMAT, KECAMATAN, DESA */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:col-span-2">
                      {/* Kiri: Pemilik */}
                      <div className="flex flex-col gap-5">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">Alamat Pemilik <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            id="alamatPemilikLama"
                            autoComplete="off"
                            value={alamatPemilikLama}
                            onChange={(e) => setAlamatPemilikLama(e.target.value.toUpperCase())}
                            style={{ textTransform: 'uppercase' }}
                            disabled={loading}
                            className={getInputClass(!!formErrors.alamatPemilikLama)}
                          />
                          {formErrors.alamatPemilikLama && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5 font-sans">{formErrors.alamatPemilikLama}</span>}
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div className="flex flex-col gap-1">
                            <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">Blok Pemilik</label>
                            <input
                              type="text"
                              placeholder="A4"
                              autoComplete="off"
                              value={blokPemilikLama}
                              onChange={(e) => setBlokPemilikLama(e.target.value.toUpperCase())}
                              style={{ textTransform: 'uppercase' }}
                              disabled={loading}
                              className={getInputClass()}
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">RT Pemilik</label>
                            <input
                              type="text"
                              placeholder="001"
                              autoComplete="off"
                              value={rtPemilikLama}
                              onChange={(e) => setRtPemilikLama(e.target.value)}
                              disabled={loading}
                              className={getInputClass()}
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">RW Pemilik</label>
                            <input
                              type="text"
                              placeholder="005"
                              autoComplete="off"
                              value={rwPemilikLama}
                              onChange={(e) => setRwPemilikLama(e.target.value)}
                              disabled={loading}
                              className={getInputClass()}
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">Kecamatan Pemilik <span className="text-slate-400 font-normal">(Opsional)</span></label>
                          <input
                            type="text"
                            id="kecamatanPemilikLama"
                            autoComplete="off"
                            value={kecamatanPemilikLama}
                            onChange={(e) => setKecamatanPemilikLama(e.target.value.toUpperCase())}
                            style={{ textTransform: 'uppercase' }}
                            disabled={loading}
                            className={getInputClass(!!formErrors.kecamatanPemilikLama)}
                          />
                          {formErrors.kecamatanPemilikLama && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5 font-sans">{formErrors.kecamatanPemilikLama}</span>}
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">Desa Pemilik <span className="text-slate-400 font-normal">(Opsional)</span></label>
                          <input
                            type="text"
                            id="desaPemilikLama"
                            autoComplete="off"
                            value={desaPemilikLama}
                            onChange={(e) => setDesaPemilikLama(e.target.value.toUpperCase())}
                            style={{ textTransform: 'uppercase' }}
                            disabled={loading}
                            className={getInputClass(!!formErrors.desaPemilikLama)}
                          />
                          {formErrors.desaPemilikLama && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5 font-sans">{formErrors.desaPemilikLama}</span>}
                        </div>
                      </div>

                      {/* Kanan: Objek */}
                      <div className="flex flex-col gap-5">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">Alamat Objek Pajak <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            id="alamatObjekLama"
                            autoComplete="off"
                            value={alamatObjekLama}
                            onChange={(e) => setAlamatObjekLama(e.target.value.toUpperCase())}
                            style={{ textTransform: 'uppercase' }}
                            disabled={loading}
                            className={getInputClass(!!formErrors.alamatObjekLama)}
                          />
                          {formErrors.alamatObjekLama && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5 font-sans">{formErrors.alamatObjekLama}</span>}
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div className="flex flex-col gap-1">
                            <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">Blok Objek</label>
                            <input
                              type="text"
                              placeholder="B2"
                              autoComplete="off"
                              value={blokObjekLama}
                              onChange={(e) => setBlokObjekLama(e.target.value.toUpperCase())}
                              style={{ textTransform: 'uppercase' }}
                              disabled={loading}
                              className={getInputClass()}
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">RT Objek</label>
                            <input
                              type="text"
                              placeholder="001"
                              autoComplete="off"
                              value={rtObjekLama}
                              onChange={(e) => setRtObjekLama(e.target.value)}
                              disabled={loading}
                              className={getInputClass()}
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">RW Objek</label>
                            <input
                              type="text"
                              placeholder="005"
                              autoComplete="off"
                              value={rwObjekLama}
                              onChange={(e) => setRwObjekLama(e.target.value)}
                              disabled={loading}
                              className={getInputClass()}
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">Kecamatan Objek <span className="text-red-500">*</span></label>
                          <select
                            id="kecamatanObjekLama"
                            value={kecamatanObjekLama}
                            onChange={(e) => {
                              setKecamatanObjekLama(e.target.value);
                              setDesaObjekLama('');
                            }}
                            disabled={loading}
                            className={getInputClass(!!formErrors.kecamatanObjekLama, 'cursor-pointer')}
                          >
                            <option value="">Pilih Kecamatan Objek</option>
                            {Object.keys(KECAMATAN_DATA).map(kec => (
                              <option key={kec} value={kec}>{kec}</option>
                            ))}
                          </select>
                          {formErrors.kecamatanObjekLama && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5 font-sans">{formErrors.kecamatanObjekLama}</span>}
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">Desa Objek <span className="text-red-500">*</span></label>
                          <select
                            id="desaObjekLama"
                            value={desaObjekLama}
                            onChange={(e) => setDesaObjekLama(e.target.value)}
                            disabled={loading || !kecamatanObjekLama}
                            className={getInputClass(!!formErrors.desaObjekLama, 'cursor-pointer')}
                          >
                            <option value="">
                              {!kecamatanObjekLama ? 'Pilih Kecamatan Terlebih Dahulu' : 'Pilih Desa/Kelurahan Objek'}
                            </option>
                            {kecamatanObjekLama && KECAMATAN_DATA[kecamatanObjekLama]?.map(desa => (
                              <option key={desa} value={desa}>{desa}</option>
                            ))}
                          </select>
                          {formErrors.desaObjekLama && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5 font-sans">{formErrors.desaObjekLama}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Luas tanah & bangunan asal */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">Luas Tanah Asal <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <input
                          type="number"
                          id="luasTanahLama"
                          autoComplete="off"
                          value={luasTanahLama}
                          onChange={(e) => setLuasTanahLama(e.target.value)}
                          disabled={loading}
                          className={getInputClass(!!formErrors.luasTanahLama, 'pl-3.5 pr-10')}
                        />
                        <span className="text-slate-500 text-xs font-normal absolute right-3.5 top-1/2 -translate-y-1/2 select-none font-sans">m²</span>
                      </div>
                      {formErrors.luasTanahLama && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5 font-sans">{formErrors.luasTanahLama}</span>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">Luas Bangunan Asal <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <input
                          type="number"
                          id="luasBangunanLama"
                          autoComplete="off"
                          value={luasBangunanLama}
                          onChange={(e) => setLuasBangunanLama(e.target.value)}
                          disabled={loading}
                          className={getInputClass(!!formErrors.luasBangunanLama, 'pl-3.5 pr-10')}
                        />
                        <span className="text-slate-500 text-xs font-normal absolute right-3.5 top-1/2 -translate-y-1/2 select-none font-sans">m²</span>
                      </div>
                      {formErrors.luasBangunanLama && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5 font-sans">{formErrors.luasBangunanLama}</span>}
                    </div>

                    <div className="flex flex-col gap-1.5 sm:col-span-2 font-sans">
                      <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">
                        No/Jenis Sertifikat Asal{' '}
                        {(jenisPermohonan === 'PENGAKTIFAN' || jenisPermohonan === 'PEMBETULAN') ? (
                          <span className="text-red-500">*</span>
                        ) : (
                          <span className="text-slate-400 font-normal">(Opsional)</span>
                        )}
                      </label>
                      <input
                        type="text"
                        id="sertifikatLama"
                        autoComplete="off"
                        placeholder="Contoh: SHM NO. 12345"
                        value={sertifikatLama}
                        onChange={(e) => setSertifikatLama(e.target.value.toUpperCase())}
                        style={{ textTransform: 'uppercase' }}
                        disabled={loading}
                        className={getInputClass(!!formErrors.sertifikatLama)}
                      />
                      {formErrors.sertifikatLama && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5 font-sans">{formErrors.sertifikatLama}</span>}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: DATA BARU */}
            {currentStepLabel === 'Data Baru' && needDataBaru && (
              <div className="flex flex-col gap-4 bg-transparent animate-fadeIn font-sans">
                {jenisPermohonan === 'MUTASI_SEBAGIAN' && (
                  <div className="flex justify-end select-none mb-1">
                    <button
                      type="button"
                      onClick={handleAddOwner}
                      disabled={loading}
                      className="h-8 px-3.5 rounded-md bg-[#00a389] hover:bg-[#008f78] active:scale-95 text-white font-normal text-[13px] shadow-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0 disabled:opacity-50 font-sans"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" /> Tambah Pemilik Baru
                    </button>
                  </div>
                )}

                <div className="flex flex-col gap-6 font-sans">
                  {dataBaru.map((item, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col gap-4 relative ${dataBaru.length > 1
                        ? 'p-5 border border-slate-200/80 rounded-md pt-10 shadow-3xs bg-white'
                        : ''
                        }`}
                    >
                      {dataBaru.length > 1 && (
                        <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between select-none border-b border-slate-100 pb-1">
                          <span className="text-[13px] font-normal text-[#008f78] tracking-wide font-sans">Pemilik Baru #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveOwner(idx)}
                            disabled={loading}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 font-sans">
                        {/* NOP Baru (Wajib untuk Objek Pajak Baru, opsional untuk lainnya) */}
                        <div className="flex flex-col gap-1.5 sm:col-span-2">
                          <label className="text-[13px] font-normal text-slate-700 tracking-wide flex items-center justify-between font-sans">
                            <span>
                              NOP Baru{' '}
                              {jenisPermohonan === 'OBJEK_PAJAK_BARU' ? (
                                <span className="text-red-500">*</span>
                              ) : (
                                <span className="text-slate-400 text-xs">(Opsional jika belum terbit)</span>
                              )}
                            </span>
                            <span className={`text-xs font-mono font-normal pr-1 ${(item.nopBaru || '').replace(/[^\d]/g, '').length === 18 ? 'text-[#00a389]' : 'text-slate-400'}`}>
                              {(item.nopBaru || '').replace(/[^\d]/g, '').length}/18 digit
                              {(item.nopBaru || '').replace(/[^\d]/g, '').length === 18 && ' ✓'}
                            </span>
                          </label>
                          <input
                            type="text"
                            id={`dataBaru.${idx}.nopBaru`}
                            autoComplete="off"
                            maxLength={24}
                            placeholder="Contoh: 36.19.xxx.xxx.xxx-xxxx.x"
                            value={item.nopBaru || ''}
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
                              handleOwnerChange(idx, 'nopBaru', fmt);
                            }}
                            disabled={loading}
                            className={getInputClass(!!formErrors[`dataBaru.${idx}.nopBaru`], 'font-mono tracking-wide')}
                          />
                          {formErrors[`dataBaru.${idx}.nopBaru`] && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5 font-sans">{formErrors[`dataBaru.${idx}.nopBaru`]}</span>}
                        </div>

                        {/* Nama pemilik baru */}
                        <div className="flex flex-col gap-1.5 sm:col-span-2">
                          <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">Nama Pemilik <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            id={`dataBaru.${idx}.namaPemilikBaru`}
                            autoComplete="off"
                            value={item.namaPemilikBaru}
                            onChange={(e) => handleOwnerChange(idx, 'namaPemilikBaru', e.target.value.toUpperCase())}
                            style={{ textTransform: 'uppercase' }}
                            disabled={loading}
                            className={getInputClass(!!formErrors[`dataBaru.${idx}.namaPemilikBaru`])}
                          />
                          {formErrors[`dataBaru.${idx}.namaPemilikBaru`] && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5 font-sans">{formErrors[`dataBaru.${idx}.namaPemilikBaru`]}</span>}
                        </div>

                        {/* Alamat, Kecamatan, Desa Pemilik Baru */}
                        <div className="flex flex-col gap-5">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">Alamat Pemilik Baru <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              id={`dataBaru.${idx}.alamatPemilikBaru`}
                              autoComplete="off"
                              value={item.alamatPemilikBaru}
                              onChange={(e) => handleOwnerChange(idx, 'alamatPemilikBaru', e.target.value.toUpperCase())}
                              style={{ textTransform: 'uppercase' }}
                              disabled={loading}
                              className={getInputClass(!!formErrors[`dataBaru.${idx}.alamatPemilikBaru`])}
                            />
                            {formErrors[`dataBaru.${idx}.alamatPemilikBaru`] && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5 font-sans">{formErrors[`dataBaru.${idx}.alamatPemilikBaru`]}</span>}
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <div className="flex flex-col gap-1">
                              <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">Blok</label>
                              <input
                                type="text"
                                placeholder="A4"
                                autoComplete="off"
                                value={item.blokPemilikBaru}
                                onChange={(e) => handleOwnerChange(idx, 'blokPemilikBaru', e.target.value.toUpperCase())}
                                style={{ textTransform: 'uppercase' }}
                                disabled={loading}
                                className={getInputClass()}
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">RT</label>
                              <input
                                type="text"
                                placeholder="001"
                                autoComplete="off"
                                value={item.rtPemilikBaru}
                                onChange={(e) => handleOwnerChange(idx, 'rtPemilikBaru', e.target.value)}
                                disabled={loading}
                                className={getInputClass()}
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">RW</label>
                              <input
                                type="text"
                                placeholder="005"
                                autoComplete="off"
                                value={item.rwPemilikBaru}
                                onChange={(e) => handleOwnerChange(idx, 'rwPemilikBaru', e.target.value)}
                                disabled={loading}
                                className={getInputClass()}
                              />
                            </div>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">Kecamatan Pemilik Baru <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              id={`dataBaru.${idx}.kecamatanPemilikBaru`}
                              autoComplete="off"
                              value={item.kecamatanPemilikBaru}
                              onChange={(e) => handleOwnerChange(idx, 'kecamatanPemilikBaru', e.target.value.toUpperCase())}
                              style={{ textTransform: 'uppercase' }}
                              disabled={loading}
                              className={getInputClass(!!formErrors[`dataBaru.${idx}.kecamatanPemilikBaru`])}
                            />
                            {formErrors[`dataBaru.${idx}.kecamatanPemilikBaru`] && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5 font-sans">{formErrors[`dataBaru.${idx}.kecamatanPemilikBaru`]}</span>}
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">Desa Pemilik Baru <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              id={`dataBaru.${idx}.desaPemilikBaru`}
                              autoComplete="off"
                              value={item.desaPemilikBaru}
                              onChange={(e) => handleOwnerChange(idx, 'desaPemilikBaru', e.target.value.toUpperCase())}
                              style={{ textTransform: 'uppercase' }}
                              disabled={loading}
                              className={getInputClass(!!formErrors[`dataBaru.${idx}.desaPemilikBaru`])}
                            />
                            {formErrors[`dataBaru.${idx}.desaPemilikBaru`] && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5 font-sans">{formErrors[`dataBaru.${idx}.desaPemilikBaru`]}</span>}
                          </div>
                        </div>

                        {/* Alamat Objek Baru */}
                        <div className="flex flex-col gap-5">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">Alamat Objek Baru <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              id={`dataBaru.${idx}.alamatObjekBaru`}
                              autoComplete="off"
                              value={item.alamatObjekBaru}
                              onChange={(e) => handleOwnerChange(idx, 'alamatObjekBaru', e.target.value.toUpperCase())}
                              style={{ textTransform: 'uppercase' }}
                              disabled={loading}
                              className={getInputClass(!!formErrors[`dataBaru.${idx}.alamatObjekBaru`])}
                            />
                            {formErrors[`dataBaru.${idx}.alamatObjekBaru`] && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5 font-sans">{formErrors[`dataBaru.${idx}.alamatObjekBaru`]}</span>}
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <div className="flex flex-col gap-1">
                              <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">Blok Objek</label>
                              <input
                                type="text"
                                placeholder="B2"
                                autoComplete="off"
                                value={item.blokObjekBaru}
                                onChange={(e) => handleOwnerChange(idx, 'blokObjekBaru', e.target.value.toUpperCase())}
                                style={{ textTransform: 'uppercase' }}
                                disabled={loading}
                                className={getInputClass()}
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">RT Objek</label>
                              <input
                                type="text"
                                placeholder="001"
                                autoComplete="off"
                                value={item.rtObjekBaru}
                                onChange={(e) => handleOwnerChange(idx, 'rtObjekBaru', e.target.value)}
                                disabled={loading}
                                className={getInputClass()}
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">RW Objek</label>
                              <input
                                type="text"
                                placeholder="005"
                                autoComplete="off"
                                value={item.rwObjekBaru}
                                onChange={(e) => handleOwnerChange(idx, 'rwObjekBaru', e.target.value)}
                                disabled={loading}
                                className={getInputClass()}
                              />
                            </div>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">Kecamatan Objek Baru <span className="text-red-500">*</span></label>
                            <select
                              id={`dataBaru.${idx}.kecamatanObjekBaru`}
                              value={item.kecamatanObjekBaru}
                              onChange={(e) => {
                                handleOwnerChange(idx, 'kecamatanObjekBaru', e.target.value);
                                handleOwnerChange(idx, 'desaObjekBaru', '');
                              }}
                              disabled={loading}
                              className={getInputClass(!!formErrors[`dataBaru.${idx}.kecamatanObjekBaru`], 'cursor-pointer')}
                            >
                              <option value="">Pilih Kecamatan Objek</option>
                              {Object.keys(KECAMATAN_DATA).map(kec => (
                                <option key={kec} value={kec}>{kec}</option>
                              ))}
                            </select>
                            {formErrors[`dataBaru.${idx}.kecamatanObjekBaru`] && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5 font-sans">{formErrors[`dataBaru.${idx}.kecamatanObjekBaru`]}</span>}
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">Desa Objek Baru <span className="text-red-500">*</span></label>
                            <select
                              id={`dataBaru.${idx}.desaObjekBaru`}
                              value={item.desaObjekBaru}
                              onChange={(e) => handleOwnerChange(idx, 'desaObjekBaru', e.target.value)}
                              disabled={loading || !item.kecamatanObjekBaru}
                              className={getInputClass(!!formErrors[`dataBaru.${idx}.desaObjekBaru`], 'cursor-pointer')}
                            >
                              <option value="">
                                {!item.kecamatanObjekBaru ? 'Pilih Kecamatan Terlebih Dahulu' : 'Pilih Desa/Kelurahan Objek'}
                              </option>
                              {item.kecamatanObjekBaru && KECAMATAN_DATA[item.kecamatanObjekBaru]?.map(desa => (
                                <option key={desa} value={desa}>{desa}</option>
                              ))}
                            </select>
                            {formErrors[`dataBaru.${idx}.desaObjekBaru`] && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5 font-sans">{formErrors[`dataBaru.${idx}.desaObjekBaru`]}</span>}
                          </div>
                        </div>

                        {/* Luas tanah & bangunan baru */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">Luas Tanah Baru <span className="text-red-500">*</span></label>
                          <div className="relative">
                            <input
                              type="number"
                              id={`dataBaru.${idx}.luasTanahBaru`}
                              autoComplete="off"
                              value={item.luasTanahBaru}
                              onChange={(e) => handleOwnerChange(idx, 'luasTanahBaru', e.target.value)}
                              disabled={loading}
                              className={getInputClass(!!formErrors[`dataBaru.${idx}.luasTanahBaru`], 'pl-3.5 pr-10')}
                            />
                            <span className="text-slate-500 text-xs font-normal absolute right-3.5 top-1/2 -translate-y-1/2 select-none font-sans">m²</span>
                          </div>
                          {formErrors[`dataBaru.${idx}.luasTanahBaru`] && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5 font-sans">{formErrors[`dataBaru.${idx}.luasTanahBaru`]}</span>}
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">Luas Bangunan Baru <span className="text-red-500">*</span></label>
                          <div className="relative">
                            <input
                              type="number"
                              id={`dataBaru.${idx}.luasBangunanBaru`}
                              autoComplete="off"
                              value={item.luasBangunanBaru}
                              onChange={(e) => handleOwnerChange(idx, 'luasBangunanBaru', e.target.value)}
                              disabled={loading}
                              className={getInputClass(!!formErrors[`dataBaru.${idx}.luasBangunanBaru`], 'pl-3.5 pr-10')}
                            />
                            <span className="text-slate-500 text-xs font-normal absolute right-3.5 top-1/2 -translate-y-1/2 select-none font-sans">m²</span>
                          </div>
                          {formErrors[`dataBaru.${idx}.luasBangunanBaru`] && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5 font-sans">{formErrors[`dataBaru.${idx}.luasBangunanBaru`]}</span>}
                        </div>

                        {/* Sertifikat Baru */}
                        <div className="flex flex-col gap-1.5 sm:col-span-2">
                          <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">No/Jenis Sertifikat Baru <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            id={`dataBaru.${idx}.sertifikatBaru`}
                            autoComplete="off"
                            placeholder="Contoh: SHM NO. 12345"
                            value={item.sertifikatBaru}
                            onChange={(e) => handleOwnerChange(idx, 'sertifikatBaru', e.target.value.toUpperCase())}
                            style={{ textTransform: 'uppercase' }}
                            disabled={loading}
                            className={getInputClass(!!formErrors[`dataBaru.${idx}.sertifikatBaru`])}
                          />
                          {formErrors[`dataBaru.${idx}.sertifikatBaru`] && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5 font-sans">{formErrors[`dataBaru.${idx}.sertifikatBaru`]}</span>}
                        </div>

                        {/* Catatan Field (Opsional) */}
                        <div className="flex flex-col gap-1.5 sm:col-span-2">
                          <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">Catatan Tambahan <span className="text-slate-400 font-normal">(Opsional)</span></label>
                          <textarea
                            rows={2}
                            placeholder="Masukkan catatan tambahan jika ada..."
                            value={item.catatan || ''}
                            onChange={(e) => handleOwnerChange(idx, 'catatan', e.target.value.toUpperCase())}
                            style={{ textTransform: 'uppercase' }}
                            disabled={loading}
                            className={getInputClass(false, 'resize-y')}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Actions: Previous & Next/Submit Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-200/80 mt-2 select-none">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  disabled={loading}
                  className="h-10 px-4 rounded-md border border-slate-200/90 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-normal text-[13px] font-sans transition-all cursor-pointer shadow-3xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                  <span>Sebelumnya</span>
                </button>
              ) : (
                <div />
              )}

              {currentStep < steps.length ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={loading}
                  className="h-10 px-5 rounded-md bg-[#00a389] hover:bg-[#008f78] active:scale-98 text-white font-normal text-[13px] font-sans shadow-xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50 ml-auto"
                >
                  <span>Selanjutnya</span>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="h-10 px-6 rounded-md bg-[#00a389] hover:bg-[#008f78] active:scale-98 text-white font-normal text-[13px] font-sans shadow-xs transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 ml-auto"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{loading ? 'Menyimpan...' : 'Daftarkan Permohonan'}</span>
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Status Action Modal */}
      <ActionStatusModal
        isOpen={statusModalOpen}
        onClose={handleCloseStatusModal}
        status={statusModalStatus}
        title={statusModalTitle}
        message={statusModalMessage}
      />

      {/* Draft Notification / Reset Modal */}
      {draftModalOpen && mounted && createPortal(
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-md p-6 max-w-sm w-full shadow-2xl border border-slate-100 flex flex-col items-center text-center gap-3 animate-scaleUp font-sans">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#00a389] flex items-center justify-center">
              <CheckCircle className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h3 className="text-base font-normal text-slate-800 font-sans">Informasi Formulir</h3>
            <p className="text-xs text-slate-600 font-sans">{draftModalMessage}</p>
            <button
              type="button"
              onClick={() => setDraftModalOpen(false)}
              className="mt-2 w-full py-2.5 rounded-md bg-[#00a389] hover:bg-[#008f78] text-white text-xs font-normal transition-all cursor-pointer font-sans shadow-xs"
            >
              Mengerti & Lanjutkan
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
});

CreateForm.displayName = 'CreateForm';
