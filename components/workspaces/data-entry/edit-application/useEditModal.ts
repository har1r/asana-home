import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { updatePermohonan } from '@/app/actions/data-entry';
import {
  SERVICES_NEED_DATA_LAMA,
  SERVICES_NEED_DATA_BARU,
  NOP_MAPPING,
  createEmptyDataBaruItem,
  formatNop
} from '../../shared/constants';

interface UseEditModalOptions {
  editTarget: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function useEditModal({ editTarget, onClose, onSuccess }: UseEditModalOptions) {
  const [jenisPermohonan, setJenisPermohonan] = useState<string>('MUTASI_SEBAGIAN');
  const [nomorPelayanan, setNomorPelayanan] = useState('');
  const [tanggalNoPelayanan, setTanggalNoPelayanan] = useState('');
  const [tanggalPenyelesaian, setTanggalPenyelesaian] = useState('');
  const [nop, setNop] = useState('');
  const [noWhatsapp, setNoWhatsapp] = useState('');

  // Data Lama state
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

  // Data Baru state
  const [dataBaru, setDataBaru] = useState<any[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Stepper State & Copy Feedback State
  const [currentStep, setCurrentStep] = useState(1);
  const [copiedAlamatObjekIdx, setCopiedAlamatObjekIdx] = useState<number | null>(null);
  const [copiedAlamatPemilikIdx, setCopiedAlamatPemilikIdx] = useState<number | null>(null);

  // Status Modal State
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusModalStatus, setStatusModalStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusModalTitle, setStatusModalTitle] = useState('');
  const [statusModalMessage, setStatusModalMessage] = useState('');

  const isInitialLoad = useRef(true);
  const isNopInitialLoad = useRef(true);

  const handleCloseStatusModal = useCallback(() => {
    setStatusModalOpen(false);
    if (statusModalStatus === 'success') {
      onSuccess();
      onClose();
    }
  }, [statusModalStatus, onSuccess, onClose]);

  // Sync editTarget to states
  useEffect(() => {
    if (!editTarget) return;
    isInitialLoad.current = true;
    isNopInitialLoad.current = true;

    setJenisPermohonan(editTarget.jenisPermohonan || 'MUTASI_SEBAGIAN');
    setNomorPelayanan((editTarget.nomorPelayanan || '').toUpperCase());

    const rawDate = editTarget.tanggalNoPelayanan ? new Date(editTarget.tanggalNoPelayanan) : null;
    setTanggalNoPelayanan(rawDate && !isNaN(rawDate.getTime()) ? rawDate.toISOString().split('T')[0] : '');

    const rawSelesaiDate = editTarget.tanggalPenyelesaian ? new Date(editTarget.tanggalPenyelesaian) : null;
    setTanggalPenyelesaian(rawSelesaiDate && !isNaN(rawSelesaiDate.getTime()) ? rawSelesaiDate.toISOString().split('T')[0] : '');

    setNop(formatNop(editTarget.nop || ''));
    setNoWhatsapp(editTarget.noWhatsapp || '');

    setNamaPemilikLama((editTarget.namaPemilikLama || '').toUpperCase());
    setAlamatPemilikLama((editTarget.alamatPemilikLama || '').toUpperCase());
    setBlokPemilikLama((editTarget.blokPemilikLama || '').toUpperCase());
    setRtPemilikLama((editTarget.rtPemilikLama || '').toUpperCase());
    setRwPemilikLama((editTarget.rwPemilikLama || '').toUpperCase());
    setKecamatanPemilikLama((editTarget.kecamatanPemilikLama || '').toUpperCase());
    setDesaPemilikLama((editTarget.desaPemilikLama || '').toUpperCase());
    setAlamatObjekLama((editTarget.alamatObjekLama || '').toUpperCase());
    setBlokObjekLama((editTarget.blokObjekLama || '').toUpperCase());
    setRtObjekLama((editTarget.rtObjekLama || '').toUpperCase());
    setRwObjekLama((editTarget.rwObjekLama || '').toUpperCase());
    setKecamatanObjekLama((editTarget.kecamatanObjekLama || '').toUpperCase());
    setDesaObjekLama((editTarget.desaObjekLama || '').toUpperCase());
    setLuasTanahLama(editTarget.luasTanahLama !== null && editTarget.luasTanahLama !== undefined ? String(editTarget.luasTanahLama) : '');
    setLuasBangunanLama(editTarget.luasBangunanLama !== null && editTarget.luasBangunanLama !== undefined ? String(editTarget.luasBangunanLama) : '');
    setSertifikatLama((editTarget.sertifikatLama || '').toUpperCase());

    if (editTarget.dataBaru && editTarget.dataBaru.length > 0) {
      setDataBaru(editTarget.dataBaru.map((dbItem: any) => ({
        namaPemilikBaru: (dbItem.namaPemilikBaru || '').toUpperCase(),
        alamatPemilikBaru: (dbItem.alamatPemilikBaru || '').toUpperCase(),
        blokPemilikBaru: (dbItem.blokPemilikBaru || '').toUpperCase(),
        rtPemilikBaru: (dbItem.rtPemilikBaru || '').toUpperCase(),
        rwPemilikBaru: (dbItem.rwPemilikBaru || '').toUpperCase(),
        kecamatanPemilikBaru: (dbItem.kecamatanPemilikBaru || '').toUpperCase(),
        desaPemilikBaru: (dbItem.desaPemilikBaru || '').toUpperCase(),
        alamatObjekBaru: (dbItem.alamatObjekBaru || '').toUpperCase(),
        blokObjekBaru: (dbItem.blokObjekBaru || '').toUpperCase(),
        rtObjekBaru: (dbItem.rtObjekBaru || '').toUpperCase(),
        rwObjekBaru: (dbItem.rwObjekBaru || '').toUpperCase(),
        kecamatanObjekBaru: (dbItem.kecamatanObjekBaru || '').toUpperCase(),
        desaObjekBaru: (dbItem.desaObjekBaru || '').toUpperCase(),
        luasTanahBaru: dbItem.luasTanahBaru !== null && dbItem.luasTanahBaru !== undefined ? String(dbItem.luasTanahBaru) : '',
        luasBangunanBaru: dbItem.luasBangunanBaru !== null && dbItem.luasBangunanBaru !== undefined ? String(dbItem.luasBangunanBaru) : '',
        sertifikatBaru: (dbItem.sertifikatBaru || '').toUpperCase()
      })));
    } else {
      setDataBaru([createEmptyDataBaruItem()]);
    }

    setFormErrors({});
    setError('');
    setSuccess('');
    setCurrentStep(1);
  }, [editTarget]);

  const needDataLama = SERVICES_NEED_DATA_LAMA.includes(jenisPermohonan);
  const needDataBaru = SERVICES_NEED_DATA_BARU.includes(jenisPermohonan);

  const steps = useMemo(() => {
    const list = [{ id: 1, label: 'Data Utama' }];
    if (needDataLama) list.push({ id: list.length + 1, label: 'Data Lama (Asal)' });
    if (needDataBaru) list.push({ id: list.length + 1, label: 'Data Baru' });
    return list;
  }, [needDataLama, needDataBaru]);

  const formProgress = useMemo(() => {
    let total = 5;
    let filled = 0;

    if (nomorPelayanan.trim()) filled++;
    if (tanggalNoPelayanan.trim()) filled++;
    if (tanggalPenyelesaian.trim()) filled++;
    if (nop.replace(/[.\-]/g, '').length === 18) filled++;
    if (noWhatsapp.trim().length >= 10) filled++;

    if (needDataLama) {
      total += 10;
      if (namaPemilikLama.trim()) filled++;
      if (alamatPemilikLama.trim()) filled++;
      if (kecamatanPemilikLama.trim()) filled++;
      if (desaPemilikLama.trim()) filled++;
      if (alamatObjekLama.trim()) filled++;
      if (kecamatanObjekLama.trim()) filled++;
      if (desaObjekLama.trim()) filled++;
      if (luasTanahLama.trim() !== '') filled++;
      if (luasBangunanLama.trim() !== '') filled++;
      if (sertifikatLama.trim()) filled++;
    }

    if (needDataBaru) {
      dataBaru.forEach(item => {
        total += 10;
        if (item.namaPemilikBaru.trim()) filled++;
        if (item.alamatPemilikBaru.trim()) filled++;
        if (item.kecamatanPemilikBaru.trim()) filled++;
        if (item.desaPemilikBaru.trim()) filled++;
        if (item.alamatObjekBaru.trim()) filled++;
        if (item.kecamatanObjekBaru.trim()) filled++;
        if (item.desaObjekBaru.trim()) filled++;
        if (item.luasTanahBaru !== '') filled++;
        if (item.luasBangunanBaru !== '') filled++;
        if (item.sertifikatBaru.trim()) filled++;
      });
    }

    return { total, filled, percentage: Math.round((filled / total) * 100) };
  }, [
    nomorPelayanan, tanggalNoPelayanan, tanggalPenyelesaian, nop, noWhatsapp,
    needDataLama, namaPemilikLama, alamatPemilikLama, kecamatanPemilikLama, desaPemilikLama,
    alamatObjekLama, kecamatanObjekLama, desaObjekLama, luasTanahLama, luasBangunanLama, sertifikatLama,
    needDataBaru, dataBaru
  ]);

  // Auto-fill kecamatan and desa objek based on NOP
  useEffect(() => {
    if (isNopInitialLoad.current) {
      isNopInitialLoad.current = false;
      return;
    }
    const rawNop = nop.replace(/[^\d]/g, '');
    if (rawNop.length >= 10) {
      const kecCode = rawNop.slice(4, 7);
      const desaCode = rawNop.slice(7, 10);
      const mapping = NOP_MAPPING[kecCode];
      if (mapping) {
        const kecName = mapping.name;
        const desaName = mapping.villages[desaCode] || "";
        if (kecName) setKecamatanObjekLama(kecName);
        if (desaName) setDesaObjekLama(desaName);
        setDataBaru(prev =>
          prev.map(item => ({
            ...item,
            kecamatanObjekBaru: kecName || item.kecamatanObjekBaru,
            desaObjekBaru: desaName || item.desaObjekBaru
          }))
        );
      }
    }
  }, [nop]);

  // Keep Data Baru length to 1 if not MUTASI_SEBAGIAN
  useEffect(() => {
    if (jenisPermohonan !== 'MUTASI_SEBAGIAN' && dataBaru.length > 1) {
      setDataBaru(prev => prev.slice(0, 1));
    }
  }, [jenisPermohonan, dataBaru.length]);

  // Auto-calculate Tanggal Penyelesaian (real-time)
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }
    if (!tanggalNoPelayanan) return;
    const baseDate = new Date(tanggalNoPelayanan);
    if (isNaN(baseDate.getTime())) return;

    let monthsToAdd = 4;
    if (jenisPermohonan === 'OBJEK_PAJAK_BARU') monthsToAdd = 6;
    else if (jenisPermohonan === 'PENGAKTIFAN') monthsToAdd = 1;

    const targetDate = new Date(baseDate);
    targetDate.setMonth(baseDate.getMonth() + monthsToAdd);
    setTanggalPenyelesaian(targetDate.toISOString().split('T')[0]);
  }, [jenisPermohonan, tanggalNoPelayanan]);

  // Clear field errors in real-time
  useEffect(() => {
    setFormErrors(prev => {
      if (Object.keys(prev).length === 0) return prev;
      const copy = { ...prev };
      let changed = false;

      if (nomorPelayanan.trim() && copy.nomorPelayanan) { delete copy.nomorPelayanan; changed = true; }
      if (tanggalNoPelayanan.trim() && copy.tanggalNoPelayanan) { delete copy.tanggalNoPelayanan; changed = true; }
      if (tanggalPenyelesaian.trim() && copy.tanggalPenyelesaian) { delete copy.tanggalPenyelesaian; changed = true; }
      if (/^\d{18}$/.test(nop.replace(/[.\-]/g, '')) && copy.nop) { delete copy.nop; changed = true; }
      if (/^(628)\d{8,12}$/.test(noWhatsapp) && copy.noWhatsapp) { delete copy.noWhatsapp; changed = true; }

      if (namaPemilikLama.trim() && copy.namaPemilikLama) { delete copy.namaPemilikLama; changed = true; }
      if (alamatPemilikLama.trim() && copy.alamatPemilikLama) { delete copy.alamatPemilikLama; changed = true; }
      if (kecamatanPemilikLama.trim() && copy.kecamatanPemilikLama) { delete copy.kecamatanPemilikLama; changed = true; }
      if (desaPemilikLama.trim() && copy.desaPemilikLama) { delete copy.desaPemilikLama; changed = true; }
      if (alamatObjekLama.trim() && copy.alamatObjekLama) { delete copy.alamatObjekLama; changed = true; }
      if (kecamatanObjekLama.trim() && copy.kecamatanObjekLama) { delete copy.kecamatanObjekLama; changed = true; }
      if (desaObjekLama.trim() && copy.desaObjekLama) { delete copy.desaObjekLama; changed = true; }
      if (luasTanahLama.trim() && Number(luasTanahLama) >= 0 && copy.luasTanahLama) { delete copy.luasTanahLama; changed = true; }
      if (luasBangunanLama.trim() && Number(luasBangunanLama) >= 0 && copy.luasBangunanLama) { delete copy.luasBangunanLama; changed = true; }
      if (sertifikatLama.trim() && copy.sertifikatLama) { delete copy.sertifikatLama; changed = true; }

      dataBaru.forEach((item, idx) => {
        if (item.namaPemilikBaru.trim() && copy[`dataBaru.${idx}.namaPemilikBaru`]) { delete copy[`dataBaru.${idx}.namaPemilikBaru`]; changed = true; }
        if (item.alamatPemilikBaru.trim() && copy[`dataBaru.${idx}.alamatPemilikBaru`]) { delete copy[`dataBaru.${idx}.alamatPemilikBaru`]; changed = true; }
        if (item.kecamatanPemilikBaru.trim() && copy[`dataBaru.${idx}.kecamatanPemilikBaru`]) { delete copy[`dataBaru.${idx}.kecamatanPemilikBaru`]; changed = true; }
        if (item.desaPemilikBaru.trim() && copy[`dataBaru.${idx}.desaPemilikBaru`]) { delete copy[`dataBaru.${idx}.desaPemilikBaru`]; changed = true; }
        if (item.alamatObjekBaru.trim() && copy[`dataBaru.${idx}.alamatObjekBaru`]) { delete copy[`dataBaru.${idx}.alamatObjekBaru`]; changed = true; }
        if (item.kecamatanObjekBaru.trim() && copy[`dataBaru.${idx}.kecamatanObjekBaru`]) { delete copy[`dataBaru.${idx}.kecamatanObjekBaru`]; changed = true; }
        if (item.desaObjekBaru.trim() && copy[`dataBaru.${idx}.desaObjekBaru`]) { delete copy[`dataBaru.${idx}.desaObjekBaru`]; changed = true; }
        if (item.luasTanahBaru.trim() && Number(item.luasTanahBaru) >= 0 && copy[`dataBaru.${idx}.luasTanahBaru`]) { delete copy[`dataBaru.${idx}.luasTanahBaru`]; changed = true; }
        if (item.luasBangunanBaru.trim() && Number(item.luasBangunanBaru) >= 0 && copy[`dataBaru.${idx}.luasBangunanBaru`]) { delete copy[`dataBaru.${idx}.luasBangunanBaru`]; changed = true; }
        if (item.sertifikatBaru.trim() && copy[`dataBaru.${idx}.sertifikatBaru`]) { delete copy[`dataBaru.${idx}.sertifikatBaru`]; changed = true; }
      });

      return changed ? copy : prev;
    });
  }, [
    nomorPelayanan, tanggalNoPelayanan, tanggalPenyelesaian, nop, noWhatsapp,
    namaPemilikLama, alamatPemilikLama, kecamatanPemilikLama, desaPemilikLama,
    alamatObjekLama, kecamatanObjekLama, desaObjekLama, luasTanahLama, luasBangunanLama, sertifikatLama,
    dataBaru
  ]);

  const handleOwnerChange = useCallback((index: number, field: string, value: any) => {
    setDataBaru(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  }, []);

  const handleCopyPemilikFromLama = useCallback((idx: number) => {
    handleOwnerChange(idx, 'alamatPemilikBaru', alamatPemilikLama);
    handleOwnerChange(idx, 'blokPemilikBaru', blokPemilikLama);
    handleOwnerChange(idx, 'rtPemilikBaru', rtPemilikLama);
    handleOwnerChange(idx, 'rwPemilikBaru', rwPemilikLama);
    handleOwnerChange(idx, 'kecamatanPemilikBaru', kecamatanPemilikLama);
    handleOwnerChange(idx, 'desaPemilikBaru', desaPemilikLama);
    setCopiedAlamatPemilikIdx(idx);
    setTimeout(() => setCopiedAlamatPemilikIdx(null), 1500);
  }, [alamatPemilikLama, blokPemilikLama, rtPemilikLama, rwPemilikLama, kecamatanPemilikLama, desaPemilikLama, handleOwnerChange]);

  const handleCopyFromLama = useCallback((idx: number) => {
    handleOwnerChange(idx, 'alamatObjekBaru', alamatObjekLama);
    handleOwnerChange(idx, 'blokObjekBaru', blokObjekLama);
    handleOwnerChange(idx, 'rtObjekBaru', rtObjekLama);
    handleOwnerChange(idx, 'rwObjekBaru', rwObjekLama);
    handleOwnerChange(idx, 'kecamatanObjekBaru', kecamatanObjekLama);
    handleOwnerChange(idx, 'desaObjekBaru', desaObjekLama);
    setCopiedAlamatObjekIdx(idx);
    setTimeout(() => setCopiedAlamatObjekIdx(null), 1500);
  }, [alamatObjekLama, blokObjekLama, rtObjekLama, rwObjekLama, kecamatanObjekLama, desaObjekLama, handleOwnerChange]);

  const handleAddOwner = useCallback(() => {
    setDataBaru(prev => [...prev, createEmptyDataBaruItem()]);
  }, []);

  const handleRemoveOwner = useCallback((index: number) => {
    setDataBaru(prev => prev.filter((_, i) => i !== index));
  }, []);

  const validateCurrentStep = useCallback(() => {
    const errors: Record<string, string> = {};
    const stepLabel = steps[currentStep - 1]?.label;

    if (stepLabel === 'Data Utama') {
      if (!nomorPelayanan || !nomorPelayanan.trim()) errors.nomorPelayanan = 'Nomor pelayanan wajib diisi';
      if (!tanggalNoPelayanan || !tanggalNoPelayanan.trim()) errors.tanggalNoPelayanan = 'Tanggal pelayanan wajib diisi';
      if (!tanggalPenyelesaian || !tanggalPenyelesaian.trim()) errors.tanggalPenyelesaian = 'Tanggal penyelesaian wajib diisi';
      if (!nop || !/^\d{18}$/.test(nop.replace(/[.\-]/g, ''))) errors.nop = 'NOP harus tepat 18 digit angka';
      if (!noWhatsapp || !/^(628)\d{8,12}$/.test(noWhatsapp)) {
        errors.noWhatsapp = 'WhatsApp tidak valid (minimal 10 digit angka setelah +62)';
      }
    } else if (stepLabel === 'Data Lama (Asal)') {
      if (!namaPemilikLama?.trim()) errors.namaPemilikLama = 'Nama pemilik lama wajib diisi';
      if (!alamatPemilikLama?.trim()) errors.alamatPemilikLama = 'Alamat pemilik lama wajib diisi';
      if (!alamatObjekLama?.trim()) errors.alamatObjekLama = 'Alamat objek lama wajib diisi';
      if (!kecamatanObjekLama?.trim()) errors.kecamatanObjekLama = 'Kecamatan objek lama wajib diisi';
      if (!desaObjekLama?.trim()) errors.desaObjekLama = 'Desa objek lama wajib diisi';
      if (luasTanahLama === undefined || luasTanahLama === null || luasTanahLama === '' || Number(luasTanahLama) < 0) {
        errors.luasTanahLama = 'Luas tanah lama wajib diisi & >= 0';
      }
      if (luasBangunanLama === undefined || luasBangunanLama === null || luasBangunanLama === '' || Number(luasBangunanLama) < 0) {
        errors.luasBangunanLama = 'Luas bangunan lama wajib diisi & >= 0';
      }
      if (!sertifikatLama?.trim()) errors.sertifikatLama = 'Sertifikat lama wajib diisi';
    } else if (stepLabel === 'Data Baru') {
      dataBaru.forEach((item, idx) => {
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
        if (!item.sertifikatBaru?.trim()) errors[`dataBaru.${idx}.sertifikatBaru`] = 'Sertifikat baru wajib diisi';
      });
    }

    return errors;
  }, [
    currentStep, steps, nomorPelayanan, tanggalNoPelayanan, tanggalPenyelesaian, nop, noWhatsapp,
    namaPemilikLama, alamatPemilikLama, kecamatanPemilikLama, desaPemilikLama,
    alamatObjekLama, kecamatanObjekLama, desaObjekLama, luasTanahLama, luasBangunanLama, sertifikatLama,
    dataBaru
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
        const element = document.getElementById(`edit_${firstErrorKey}`);
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

  const validateFullForm = (data: any) => {
    const errors: Record<string, string> = {};

    if (!data.nomorPelayanan || !data.nomorPelayanan.trim()) errors.nomorPelayanan = 'Nomor pelayanan wajib diisi';
    if (!data.tanggalNoPelayanan || !data.tanggalNoPelayanan.trim()) errors.tanggalNoPelayanan = 'Tanggal pelayanan wajib diisi';
    if (!data.tanggalPenyelesaian || !data.tanggalPenyelesaian.trim()) errors.tanggalPenyelesaian = 'Tanggal penyelesaian wajib diisi';
    if (!data.nop || !/^\d{18}$/.test(data.nop.replace(/[.\-]/g, ''))) errors.nop = 'NOP harus tepat 18 digit angka';
    if (!data.noWhatsapp || !/^(628)\d{8,12}$/.test(data.noWhatsapp)) errors.noWhatsapp = 'WhatsApp tidak valid (minimal 10 digit angka setelah +62)';

    if (needDataLama) {
      if (!data.namaPemilikLama?.trim()) errors.namaPemilikLama = 'Nama pemilik lama wajib diisi';
      if (!data.alamatPemilikLama?.trim()) errors.alamatPemilikLama = 'Alamat pemilik lama wajib diisi';
      if (!data.alamatObjekLama?.trim()) errors.alamatObjekLama = 'Alamat objek lama wajib diisi';
      if (!data.kecamatanObjekLama?.trim()) errors.kecamatanObjekLama = 'Kecamatan objek lama wajib diisi';
      if (!data.desaObjekLama?.trim()) errors.desaObjekLama = 'Desa objek lama wajib diisi';
      if (data.luasTanahLama === undefined || data.luasTanahLama === null || data.luasTanahLama === '' || Number(data.luasTanahLama) < 0) {
        errors.luasTanahLama = 'Luas tanah lama wajib diisi & >= 0';
      }
      if (data.luasBangunanLama === undefined || data.luasBangunanLama === null || data.luasBangunanLama === '' || Number(data.luasBangunanLama) < 0) {
        errors.luasBangunanLama = 'Luas bangunan lama wajib diisi & >= 0';
      }
      if (!data.sertifikatLama || !data.sertifikatLama.trim()) errors.sertifikatLama = 'Sertifikat lama wajib diisi';
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
          if (!item.sertifikatBaru || !item.sertifikatBaru.trim()) errors[`dataBaru.${idx}.sertifikatBaru`] = 'Sertifikat baru wajib diisi';
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
      nomorPelayanan: nomorPelayanan.toUpperCase(),
      tanggalNoPelayanan,
      tanggalPenyelesaian: tanggalPenyelesaian || null,
      nop: nop.replace(/[.\-]/g, ''),
      noWhatsapp,
      namaPemilikLama: needDataLama ? namaPemilikLama.toUpperCase() : null,
      alamatPemilikLama: needDataLama ? alamatPemilikLama.toUpperCase() : null,
      blokPemilikLama: needDataLama && blokPemilikLama ? blokPemilikLama.toUpperCase() : null,
      rtPemilikLama: needDataLama && rtPemilikLama ? rtPemilikLama.toUpperCase() : null,
      rwPemilikLama: needDataLama && rwPemilikLama ? rwPemilikLama.toUpperCase() : null,
      kecamatanPemilikLama: needDataLama ? kecamatanPemilikLama.toUpperCase() : null,
      desaPemilikLama: needDataLama ? desaPemilikLama.toUpperCase() : null,
      alamatObjekLama: needDataLama ? alamatObjekLama.toUpperCase() : null,
      blokObjekLama: needDataLama && blokObjekLama ? blokObjekLama.toUpperCase() : null,
      rtObjekLama: needDataLama && rtObjekLama ? rtObjekLama.toUpperCase() : null,
      rwObjekLama: needDataLama && rwObjekLama ? rwObjekLama.toUpperCase() : null,
      kecamatanObjekLama: needDataLama ? kecamatanObjekLama.toUpperCase() : null,
      desaObjekLama: needDataLama ? desaObjekLama.toUpperCase() : null,
      luasTanahLama: needDataLama && luasTanahLama !== '' ? Number(luasTanahLama) : null,
      luasBangunanLama: needDataLama && luasBangunanLama !== '' ? Number(luasBangunanLama) : null,
      sertifikatLama: needDataLama ? sertifikatLama.toUpperCase() : null,
      dataBaru: needDataBaru ? dataBaru.map(item => ({
        namaPemilikBaru: item.namaPemilikBaru.toUpperCase(),
        alamatPemilikBaru: item.alamatPemilikBaru.toUpperCase(),
        blokPemilikBaru: item.blokPemilikBaru ? item.blokPemilikBaru.toUpperCase() : null,
        rtPemilikBaru: item.rtPemilikBaru ? item.rtPemilikBaru.toUpperCase() : null,
        rwPemilikBaru: item.rwPemilikBaru ? item.rwPemilikBaru.toUpperCase() : null,
        kecamatanPemilikBaru: item.kecamatanPemilikBaru.toUpperCase(),
        desaPemilikBaru: item.desaPemilikBaru.toUpperCase(),
        alamatObjekBaru: item.alamatObjekBaru.toUpperCase(),
        blokObjekBaru: item.blokObjekBaru ? item.blokObjekBaru.toUpperCase() : null,
        rtObjekBaru: item.rtObjekBaru ? item.rtObjekBaru.toUpperCase() : null,
        rwObjekBaru: item.rwObjekBaru ? item.rwObjekBaru.toUpperCase() : null,
        kecamatanObjekBaru: item.kecamatanObjekBaru.toUpperCase(),
        desaObjekBaru: item.desaObjekBaru.toUpperCase(),
        luasTanahBaru: item.luasTanahBaru !== '' ? Number(item.luasTanahBaru) : null,
        luasBangunanBaru: item.luasBangunanBaru !== '' ? Number(item.luasBangunanBaru) : null,
        sertifikatBaru: item.sertifikatBaru.toUpperCase()
      })) : []
    };

    const errors = validateFullForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setError('Form kurang lengkap. Harap periksa detail isian merah di bawah.');

      const firstErrorKey = Object.keys(errors)[0];
      if (firstErrorKey.startsWith('dataBaru.')) {
        const stepIdx = steps.findIndex(s => s.label === 'Data Baru');
        if (stepIdx !== -1) setCurrentStep(stepIdx + 1);
      } else if (['namaPemilikLama', 'alamatPemilikLama', 'alamatObjekLama', 'kecamatanObjekLama', 'desaObjekLama', 'luasTanahLama', 'luasBangunanLama', 'sertifikatLama'].includes(firstErrorKey)) {
        const stepIdx = steps.findIndex(s => s.label === 'Data Lama (Asal)');
        if (stepIdx !== -1) setCurrentStep(stepIdx + 1);
      } else {
        setCurrentStep(1);
      }

      setTimeout(() => {
        const element = document.getElementById(`edit_${firstErrorKey}`);
        if (element) {
          element.focus();
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);

      return;
    }

    setStatusModalTitle('Memperbarui Permohonan');
    setStatusModalMessage('Sedang menyimpan perubahan permohonan ke server...');
    setStatusModalStatus('loading');
    setStatusModalOpen(true);
    setLoading(true);

    try {
      const res: any = await updatePermohonan(editTarget.id, formData);
      if (res.success) {
        setStatusModalTitle('Pembaruan Berhasil');
        setStatusModalMessage('Data permohonan berhasil diperbarui!');
        setStatusModalStatus('success');
      } else {
        setStatusModalTitle('Pembaruan Gagal');
        setStatusModalMessage(res.error || 'Gagal memperbarui data permohonan.');
        setStatusModalStatus('error');
      }
    } catch (err: any) {
      setStatusModalTitle('Terjadi Kesalahan');
      setStatusModalMessage(err.message || 'Terjadi kesalahan sistem.');
      setStatusModalStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const currentStepLabel = steps[currentStep - 1]?.label;

  return {
    jenisPermohonan,
    setJenisPermohonan,
    nomorPelayanan,
    setNomorPelayanan,
    tanggalNoPelayanan,
    setTanggalNoPelayanan,
    tanggalPenyelesaian,
    setTanggalPenyelesaian,
    nop,
    setNop,
    noWhatsapp,
    setNoWhatsapp,
    namaPemilikLama,
    setNamaPemilikLama,
    alamatPemilikLama,
    setAlamatPemilikLama,
    blokPemilikLama,
    setBlokPemilikLama,
    rtPemilikLama,
    setRtPemilikLama,
    rwPemilikLama,
    setRwPemilikLama,
    kecamatanPemilikLama,
    setKecamatanPemilikLama,
    desaPemilikLama,
    setDesaPemilikLama,
    alamatObjekLama,
    setAlamatObjekLama,
    blokObjekLama,
    setBlokObjekLama,
    rtObjekLama,
    setRtObjekLama,
    rwObjekLama,
    setRwObjekLama,
    kecamatanObjekLama,
    setKecamatanObjekLama,
    desaObjekLama,
    setDesaObjekLama,
    luasTanahLama,
    setLuasTanahLama,
    luasBangunanLama,
    setLuasBangunanLama,
    sertifikatLama,
    setSertifikatLama,
    dataBaru,
    setDataBaru,
    formErrors,
    error,
    success,
    loading,
    currentStep,
    setCurrentStep,
    steps,
    currentStepLabel,
    formProgress,
    needDataLama,
    needDataBaru,
    copiedAlamatObjekIdx,
    copiedAlamatPemilikIdx,
    statusModalOpen,
    setStatusModalOpen,
    statusModalStatus,
    statusModalTitle,
    statusModalMessage,
    handleCloseStatusModal,
    handleOwnerChange,
    handleCopyPemilikFromLama,
    handleCopyFromLama,
    handleAddOwner,
    handleRemoveOwner,
    handleNextStep,
    handlePrevStep,
    handleUpdate
  };
}
