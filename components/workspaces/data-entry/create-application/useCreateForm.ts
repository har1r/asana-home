import { useState, useEffect, useCallback, useMemo } from 'react';
import { createApplication } from '@/app/actions/data-entry';
import {
  SERVICES_NEED_PREVIOUS_DATA,
  SERVICES_NEED_TARGET_DATA,
  createEmptyPreviousDataItem,
  createEmptyTargetDataItem
} from '../../shared/constants';

interface UseCreateFormOptions {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: any;
}

export function useCreateForm({ onSuccess, onCancel, initialData }: UseCreateFormOptions) {
  const [applicationType, setApplicationType] = useState<string>('PARTIAL_MUTATION');
  const [applicationNumber, setApplicationNumber] = useState('');
  const [serviceNumberDate, setServiceNumberDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [completionDate, setCompletionDate] = useState('');

  // SLA Calculation
  useEffect(() => {
    if (!serviceNumberDate) return;
    const d = new Date(serviceNumberDate);
    const slaMonths: Record<string, number> = {
      PARTIAL_MUTATION: 4,
      MERGER_MUTATION: 4,
      EXPIRED_UPDATE: 4,
      EXPIRED_REGULAR: 4,
      CORRECTION: 2,
      REACTIVATION: 1,
      NEW_TAX_OBJECT: 6,
    };
    const months = slaMonths[applicationType] || 4;
    d.setMonth(d.getMonth() + months);
    setCompletionDate(d.toISOString().split('T')[0]);
  }, [serviceNumberDate, applicationType]);

  const [previousData, setPreviousData] = useState<any[]>(() => [
    createEmptyPreviousDataItem()
  ]);
  const [targetData, setTargetData] = useState<any[]>(() => [
    createEmptyTargetDataItem()
  ]);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [draftLoaded, setDraftLoaded] = useState(false);

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusModalStatus, setStatusModalStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusModalTitle, setStatusModalTitle] = useState('');
  const [statusModalMessage, setStatusModalMessage] = useState('');

  const [draftModalOpen, setDraftModalOpen] = useState(false);
  const [draftModalMessage, setDraftModalMessage] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleCloseStatusModal = useCallback(() => {
    setStatusModalOpen(false);
    if (statusModalStatus === 'success') {
      onSuccess();
      onCancel();
    }
  }, [statusModalStatus, onSuccess, onCancel]);

  const handleApplicationTypeChange = (newType: string) => {
    setApplicationType(newType);
    if (newType === 'NEW_TAX_OBJECT') {
      setPreviousData([]);
    } else if (newType === 'MERGER_MUTATION') {
      if (previousData.length < 2) {
        setPreviousData([
          previousData[0] || createEmptyPreviousDataItem(),
          createEmptyPreviousDataItem()
        ]);
      }
    } else {
      if (previousData.length === 0) {
        setPreviousData([createEmptyPreviousDataItem()]);
      } else if (previousData.length > 1) {
        setPreviousData([previousData[0]]);
      }
    }

    if (newType === 'REACTIVATION') {
      setTargetData([]);
    } else {
      if (targetData.length === 0) {
        setTargetData([createEmptyTargetDataItem()]);
      }
    }
  };

  const handleResetDraft = useCallback(() => {
    try { localStorage.removeItem('permohonan_form_draft'); } catch (e) { console.error(e); }
    setApplicationNumber('');
    setServiceNumberDate(new Date().toISOString().split('T')[0]);
    setPreviousData([createEmptyPreviousDataItem()]);
    setTargetData([createEmptyTargetDataItem()]);
    setFormErrors({});
    setError('');
    setCurrentStep(1);
    setDraftModalMessage('Draf formulir dan penyimpanan lokal berhasil dihapus & formulir di-reset!');
    setDraftModalOpen(true);
  }, []);

  // Initial & Draft Loader
  useEffect(() => {
    if (initialData) {
      try {
        if (initialData.applicationType) setApplicationType(initialData.applicationType);
        if (initialData.applicationNumber) setApplicationNumber(initialData.applicationNumber.toUpperCase());
        const rawDate = initialData.serviceNumberDate ? new Date(initialData.serviceNumberDate) : null;
        setServiceNumberDate(rawDate && !isNaN(rawDate.getTime()) ? rawDate.toISOString().split('T')[0] : '');

        if (initialData.previousData && initialData.previousData.length > 0) {
          setPreviousData(initialData.previousData.map((item: any, idx: number) => ({
            nop: item.nop || '',
            ownerName: (item.ownerName || '').toUpperCase(),
            ownerAddress: (item.ownerAddress || '').toUpperCase(),
            ownerBlock: (item.ownerBlock || '').toUpperCase(),
            ownerRt: item.ownerRt || '',
            ownerRw: item.ownerRw || '',
            ownerKecamatan: (item.ownerKecamatan || '').toUpperCase(),
            ownerDesa: (item.ownerDesa || '').toUpperCase(),
            objectAddress: (item.objectAddress || '').toUpperCase(),
            objectBlock: (item.objectBlock || '').toUpperCase(),
            objectRt: item.objectRt || '',
            objectRw: item.objectRw || '',
            objectKecamatan: (item.objectKecamatan || '').toUpperCase(),
            objectDesa: (item.objectDesa || '').toUpperCase(),
            landArea: item.landArea != null ? String(item.landArea) : '',
            buildingArea: item.buildingArea != null ? String(item.buildingArea) : '',
            certificate: (item.certificate || '').toUpperCase(),
            isPrimary: item.isPrimary ?? idx === 0,
            notes: (item.notes || '').toUpperCase()
          })));
        }

        if (initialData.targetData && initialData.targetData.length > 0) {
          setTargetData(initialData.targetData.map((item: any) => ({
            nopTemporary: item.nopTemporary || '',
            ownerName: (item.ownerName || '').toUpperCase(),
            whatsappNumber: item.whatsappNumber || '',
            ownerAddress: (item.ownerAddress || '').toUpperCase(),
            ownerBlock: (item.ownerBlock || '').toUpperCase(),
            ownerRt: item.ownerRt || '',
            ownerRw: item.ownerRw || '',
            ownerKecamatan: (item.ownerKecamatan || '').toUpperCase(),
            ownerDesa: (item.ownerDesa || '').toUpperCase(),
            objectAddress: (item.objectAddress || '').toUpperCase(),
            objectBlock: (item.objectBlock || '').toUpperCase(),
            objectRt: item.objectRt || '',
            objectRw: item.objectRw || '',
            objectKecamatan: (item.objectKecamatan || '').toUpperCase(),
            objectDesa: (item.objectDesa || '').toUpperCase(),
            landArea: item.landArea != null ? String(item.landArea) : '',
            buildingArea: item.buildingArea != null ? String(item.buildingArea) : '',
            certificate: (item.certificate || '').toUpperCase(),
            notes: (item.notes || '').toUpperCase()
          })));
        } else {
          setTargetData([createEmptyTargetDataItem()]);
        }
        setDraftModalMessage('Draf permohonan berhasil diduplikat untuk formulir baru!');
        setDraftModalOpen(true);
      } catch (e) { console.error('Failed to duplicate initialData', e); }
      finally { setDraftLoaded(true); }
      return;
    }

    try {
      const stored = localStorage.getItem('permohonan_form_draft');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.applicationType) setApplicationType(parsed.applicationType);
        if (parsed.applicationNumber) setApplicationNumber(parsed.applicationNumber.toUpperCase());
        if (parsed.serviceNumberDate) setServiceNumberDate(parsed.serviceNumberDate);
        if (parsed.previousData && parsed.previousData.length > 0) setPreviousData(parsed.previousData);
        if (parsed.targetData && parsed.targetData.length > 0) setTargetData(parsed.targetData);
        setDraftModalMessage('Draf pendaftaran permohonan Anda sebelumnya telah otomatis dipulihkan.');
        setDraftModalOpen(true);
      }
    } catch (e) { console.error('Failed to load form draft', e); }
    finally { setDraftLoaded(true); }
  }, [initialData]);

  // Draft Autosave
  useEffect(() => {
    if (!draftLoaded) return;
    try {
      const draft = {
        applicationType,
        applicationNumber: applicationNumber.toUpperCase(),
        serviceNumberDate,
        previousData,
        targetData: targetData.map(item => ({
          ...item,
          ownerName: (item.ownerName || '').toUpperCase(),
          notes: (item.notes || '').toUpperCase()
        }))
      };
      localStorage.setItem('permohonan_form_draft', JSON.stringify(draft));
    } catch (e) { console.error('Failed to save form draft', e); }
  }, [draftLoaded, applicationType, applicationNumber, serviceNumberDate, previousData, targetData]);

  const needPreviousData = SERVICES_NEED_PREVIOUS_DATA.includes(applicationType);
  const needTargetData = SERVICES_NEED_TARGET_DATA.includes(applicationType);

  const steps = useMemo(() => {
    const list = [{ id: 1, label: 'Data Utama' }];
    if (needPreviousData) list.push({ id: list.length + 1, label: 'Data Lama (Asal)' });
    if (needTargetData) list.push({ id: list.length + 1, label: 'Data Baru' });
    return list;
  }, [needPreviousData, needTargetData]);

  useEffect(() => { setCurrentStep(1); setFormErrors({}); }, [applicationType]);

  useEffect(() => {
    if (applicationType !== 'PARTIAL_MUTATION' && targetData.length > 1) {
      setTargetData(prev => prev.slice(0, 1));
    }
  }, [applicationType, targetData.length]);

  useEffect(() => {
    if (!draftLoaded) return;
    if (needTargetData && targetData.length === 0) {
      setTargetData([createEmptyTargetDataItem()]);
    }
  }, [needTargetData, targetData.length, draftLoaded]);

  const handleAddPreviousItem = useCallback(() => {
    setPreviousData(prev => [...prev, createEmptyPreviousDataItem()]);
  }, []);

  const handleRemovePreviousItem = useCallback((index: number) => {
    setPreviousData(prev => {
      if (prev.length <= 2) return prev;
      const next = prev.filter((_, i) => i !== index);
      return next.map((item, i) => ({ ...item, isPrimary: i === 0 }));
    });
  }, []);

  const handlePreviousItemChange = useCallback((index: number, field: string, value: any) => {
    setPreviousData(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  }, []);

  const handleAddTargetItem = useCallback(() => {
    setTargetData(prev => [...prev, createEmptyTargetDataItem()]);
  }, []);

  const handleRemoveTargetItem = useCallback((index: number) => {
    setTargetData(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleTargetItemChange = useCallback((index: number, field: string, value: any) => {
    setTargetData(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  }, []);

  const handleCopyOwnerFromPrevious = useCallback((targetIdx: number) => {
    const prev = previousData[0];
    if (!prev) return;
    setTargetData(prevData => prevData.map((item, idx) => {
      if (idx !== targetIdx) return item;
      return {
        ...item,
        ownerAddress: prev.ownerAddress || '',
        ownerBlock: prev.ownerBlock || '',
        ownerRt: prev.ownerRt || '',
        ownerRw: prev.ownerRw || '',
        ownerKecamatan: prev.ownerKecamatan || '',
        ownerDesa: prev.ownerDesa || '',
      };
    }));
  }, [previousData]);

  const handleCopyObjectFromPrevious = useCallback((targetIdx: number) => {
    const prev = previousData[0];
    if (!prev) return;
    setTargetData(prevData => prevData.map((item, idx) => {
      if (idx !== targetIdx) return item;
      return {
        ...item,
        objectAddress: prev.objectAddress || '',
        objectBlock: prev.objectBlock || '',
        objectRt: prev.objectRt || '',
        objectRw: prev.objectRw || '',
        objectKecamatan: prev.objectKecamatan || '',
        objectDesa: prev.objectDesa || '',
      };
    }));
  }, [previousData]);

  const handleCopyObjectToOwner = useCallback((targetIdx: number) => {
    setTargetData(prevData => prevData.map((item, idx) => {
      if (idx !== targetIdx) return item;
      return {
        ...item,
        ownerAddress: item.objectAddress || '',
        ownerBlock: item.objectBlock || '',
        ownerRt: item.objectRt || '',
        ownerRw: item.objectRw || '',
        ownerKecamatan: item.objectKecamatan || '',
        ownerDesa: item.objectDesa || '',
      };
    }));
  }, []);

  // Clear specific form errors on change
  useEffect(() => {
    setFormErrors(prev => {
      if (Object.keys(prev).length === 0) return prev;
      const next = { ...prev };
      let changed = false;
      if (applicationNumber.trim() && next.applicationNumber) { delete next.applicationNumber; changed = true; }
      if (serviceNumberDate.trim() && next.serviceNumberDate) { delete next.serviceNumberDate; changed = true; }
      if (needPreviousData) {
        previousData.forEach((item, idx) => {
          if (item.nop?.replace(/[.\-]/g, '').length === 18 && next[`previousData.${idx}.nop`]) { delete next[`previousData.${idx}.nop`]; changed = true; }
          if (item.ownerName?.trim() && next[`previousData.${idx}.ownerName`]) { delete next[`previousData.${idx}.ownerName`]; changed = true; }
          if (item.objectAddress?.trim() && next[`previousData.${idx}.objectAddress`]) { delete next[`previousData.${idx}.objectAddress`]; changed = true; }
          if (item.landArea !== '' && Number(item.landArea) > 0 && next[`previousData.${idx}.landArea`]) { delete next[`previousData.${idx}.landArea`]; changed = true; }
        });
      }
      if (needTargetData) {
        targetData.forEach((item, idx) => {
          if (item.ownerName?.trim() && next[`targetData.${idx}.ownerName`]) { delete next[`targetData.${idx}.ownerName`]; changed = true; }
          if (item.landArea !== '' && Number(item.landArea) > 0 && next[`targetData.${idx}.landArea`]) { delete next[`targetData.${idx}.landArea`]; changed = true; }
        });
      }
      if (changed && Object.keys(next).length === 0) setError('');
      return changed ? next : prev;
    });
  }, [applicationNumber, serviceNumberDate, needPreviousData, needTargetData, previousData, targetData]);

  const validateCurrentStep = useCallback(() => {
    const errors: Record<string, string> = {};
    const stepLabel = steps[currentStep - 1]?.label;

    if (stepLabel === 'Data Utama') {
      if (!applicationNumber?.trim()) errors.applicationNumber = 'Nomor pelayanan wajib diisi';
      if (!serviceNumberDate?.trim()) errors.serviceNumberDate = 'Tanggal pelayanan wajib diisi';
    } else if (stepLabel === 'Data Lama (Asal)') {
      if (applicationType === 'MERGER_MUTATION' && previousData.length < 2) {
        errors.previousDataGeneral = 'Mutasi penggabungan wajib memiliki minimal 2 NOP Asal';
      }

      previousData.forEach((item, idx) => {
        if (!item.nop || !/^\d{18}$/.test(item.nop.replace(/[.\-]/g, ''))) errors[`previousData.${idx}.nop`] = 'NOP harus 18 digit';
        if (!item.ownerName?.trim()) errors[`previousData.${idx}.ownerName`] = 'Nama pemilik lama wajib diisi';
        if (!item.objectAddress?.trim()) errors[`previousData.${idx}.objectAddress`] = 'Alamat objek lama wajib diisi';
        if (!item.objectKecamatan?.trim()) errors[`previousData.${idx}.objectKecamatan`] = 'Kecamatan objek lama wajib diisi';
        if (!item.objectDesa?.trim()) errors[`previousData.${idx}.objectDesa`] = 'Desa objek lama wajib diisi';
        if (!item.landArea || Number(item.landArea) <= 0) errors[`previousData.${idx}.landArea`] = 'Luas tanah wajib diisi & > 0';

        if (applicationType === 'CORRECTION' || applicationType === 'REACTIVATION') {
          if (!item.certificate?.trim()) errors[`previousData.${idx}.certificate`] = 'Sertifikat lama wajib diisi';
        }
      });
    } else if (stepLabel === 'Data Baru') {
      targetData.forEach((item, idx) => {
        if (applicationType === 'NEW_TAX_OBJECT' && (!item.nopTemporary || !item.nopTemporary.trim())) {
          errors[`targetData.${idx}.nopTemporary`] = 'NOP sementara wajib diisi untuk Objek Pajak Baru';
        }
        if (!item.ownerName?.trim()) errors[`targetData.${idx}.ownerName`] = 'Nama pemilik baru wajib diisi';
        if (item.whatsappNumber && item.whatsappNumber.trim() !== '') {
          if (!/^(08|628)\d{8,12}$/.test(item.whatsappNumber)) {
            errors[`targetData.${idx}.whatsappNumber`] = 'Nomor WhatsApp tidak valid (contoh: 08123456789)';
          }
        }
        if (!item.ownerAddress?.trim()) errors[`targetData.${idx}.ownerAddress`] = 'Alamat pemilik baru wajib diisi';
        if (!item.ownerKecamatan?.trim()) errors[`targetData.${idx}.ownerKecamatan`] = 'Kecamatan pemilik baru wajib diisi';
        if (!item.ownerDesa?.trim()) errors[`targetData.${idx}.ownerDesa`] = 'Desa pemilik baru wajib diisi';
        if (!item.objectAddress?.trim()) errors[`targetData.${idx}.objectAddress`] = 'Alamat objek baru wajib diisi';
        if (!item.objectKecamatan?.trim()) errors[`targetData.${idx}.objectKecamatan`] = 'Kecamatan objek baru wajib diisi';
        if (!item.objectDesa?.trim()) errors[`targetData.${idx}.objectDesa`] = 'Desa objek baru wajib diisi';
        if (!item.landArea || Number(item.landArea) <= 0) errors[`targetData.${idx}.landArea`] = 'Luas tanah baru wajib diisi & > 0';
        if (!item.certificate?.trim()) errors[`targetData.${idx}.certificate`] = 'Sertifikat baru wajib diisi';
      });
    }
    return errors;
  }, [currentStep, steps, applicationNumber, serviceNumberDate, applicationType, previousData, targetData]);

  const validateFullForm = useCallback(() => {
    const errors: Record<string, string> = {};
    if (!applicationNumber?.trim()) errors.applicationNumber = 'Nomor pelayanan wajib diisi';
    if (!serviceNumberDate?.trim()) errors.serviceNumberDate = 'Tanggal pelayanan wajib diisi';

    if (needPreviousData) {
      if (applicationType === 'MERGER_MUTATION' && previousData.length < 2) {
        errors.previousDataGeneral = 'Minimal 2 NOP Asal';
      }
      previousData.forEach((item, idx) => {
        if (!item.nop || !/^\d{18}$/.test(item.nop.replace(/[.\-]/g, ''))) errors[`previousData.${idx}.nop`] = 'NOP harus 18 digit';
        if (!item.ownerName?.trim()) errors[`previousData.${idx}.ownerName`] = 'Nama pemilik lama wajib diisi';
        if (!item.objectAddress?.trim()) errors[`previousData.${idx}.objectAddress`] = 'Alamat objek lama wajib diisi';
        if (!item.objectKecamatan?.trim()) errors[`previousData.${idx}.objectKecamatan`] = 'Kecamatan objek lama wajib diisi';
        if (!item.objectDesa?.trim()) errors[`previousData.${idx}.objectDesa`] = 'Desa objek lama wajib diisi';
        if (!item.landArea || Number(item.landArea) <= 0) errors[`previousData.${idx}.landArea`] = 'Luas tanah wajib > 0';

        if (applicationType === 'CORRECTION' || applicationType === 'REACTIVATION') {
          if (!item.certificate?.trim()) errors[`previousData.${idx}.certificate`] = 'Sertifikat lama wajib diisi';
        }
      });
    }
    if (needTargetData) {
      targetData.forEach((item, idx) => {
        if (applicationType === 'NEW_TAX_OBJECT' && (!item.nopTemporary || !item.nopTemporary.trim())) {
          errors[`targetData.${idx}.nopTemporary`] = 'NOP sementara wajib diisi';
        }
        if (!item.ownerName?.trim()) errors[`targetData.${idx}.ownerName`] = 'Nama pemilik baru wajib diisi';
        if (item.whatsappNumber && item.whatsappNumber.trim() !== '') {
          if (!/^(08|628)\d{8,12}$/.test(item.whatsappNumber)) {
            errors[`targetData.${idx}.whatsappNumber`] = 'WhatsApp tidak valid';
          }
        }
        if (!item.ownerAddress?.trim()) errors[`targetData.${idx}.ownerAddress`] = 'Alamat pemilik baru wajib diisi';
        if (!item.ownerKecamatan?.trim()) errors[`targetData.${idx}.ownerKecamatan`] = 'Kecamatan pemilik baru wajib diisi';
        if (!item.ownerDesa?.trim()) errors[`targetData.${idx}.ownerDesa`] = 'Desa pemilik baru wajib diisi';
        if (!item.objectAddress?.trim()) errors[`targetData.${idx}.objectAddress`] = 'Alamat objek baru wajib diisi';
        if (!item.objectKecamatan?.trim()) errors[`targetData.${idx}.objectKecamatan`] = 'Kecamatan objek baru wajib diisi';
        if (!item.objectDesa?.trim()) errors[`targetData.${idx}.objectDesa`] = 'Desa objek baru wajib diisi';
        if (!item.landArea || Number(item.landArea) <= 0) errors[`targetData.${idx}.landArea`] = 'Luas tanah baru wajib > 0';
        if (!item.certificate?.trim()) errors[`targetData.${idx}.certificate`] = 'Sertifikat baru wajib diisi';
      });
    }
    return errors;
  }, [applicationNumber, serviceNumberDate, needPreviousData, needTargetData, applicationType, previousData, targetData]);

  const handleNextStep = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setError('');
    const errors = validateCurrentStep();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setError('Form kurang lengkap. Harap periksa detail isian merah di bawah.');
      setTimeout(() => {
        const el = document.getElementById(Object.keys(errors)[0]);
        if (el) { el.focus(); el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
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

    const errors = validateFullForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setError('Formulir belum lengkap. Harap periksa dan lengkapi bagian berpembatas merah.');
      const firstKey = Object.keys(errors)[0];
      if (firstKey.startsWith('targetData.')) {
        const stepIdx = steps.findIndex(s => s.label === 'Data Baru');
        if (stepIdx !== -1) setCurrentStep(stepIdx + 1);
      } else if (firstKey.startsWith('previousData.')) {
        const stepIdx = steps.findIndex(s => s.label === 'Data Lama (Asal)');
        if (stepIdx !== -1) setCurrentStep(stepIdx + 1);
      } else {
        setCurrentStep(1);
      }
      setTimeout(() => {
        const el = document.getElementById(firstKey);
        if (el) { el.focus(); el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      }, 100);
      return;
    }

    const payload = {
      applicationType,
      applicationNumber: applicationNumber.toUpperCase(),
      serviceNumberDate,
      previousData: needPreviousData ? previousData.map((item, idx) => ({
        nop: item.nop ? item.nop.replace(/[.\-]/g, '') : '',
        ownerName: item.ownerName ? item.ownerName.toUpperCase() : '',
        ownerAddress: item.ownerAddress ? item.ownerAddress.toUpperCase() : null,
        ownerBlock: item.ownerBlock ? item.ownerBlock.toUpperCase() : null,
        ownerRt: item.ownerRt || null,
        ownerRw: item.ownerRw || null,
        ownerKecamatan: item.ownerKecamatan ? item.ownerKecamatan.toUpperCase() : null,
        ownerDesa: item.ownerDesa ? item.ownerDesa.toUpperCase() : null,
        objectAddress: item.objectAddress ? item.objectAddress.toUpperCase() : null,
        objectBlock: item.objectBlock ? item.objectBlock.toUpperCase() : null,
        objectRt: item.objectRt || null,
        objectRw: item.objectRw || null,
        objectKecamatan: item.objectKecamatan ? item.objectKecamatan.toUpperCase() : null,
        objectDesa: item.objectDesa ? item.objectDesa.toUpperCase() : null,
        landArea: Number(item.landArea) || 0,
        buildingArea: item.buildingArea ? Number(item.buildingArea) : null,
        certificate: item.certificate ? item.certificate.toUpperCase() : null,
        isPrimary: idx === 0,
        notes: item.notes ? item.notes.toUpperCase() : null
      })) : [],
      targetData: needTargetData ? targetData.map(item => ({
        nopTemporary: item.nopTemporary ? item.nopTemporary.replace(/[.\-]/g, '') : null,
        ownerName: item.ownerName ? item.ownerName.toUpperCase() : '',
        whatsappNumber: item.whatsappNumber || null,
        ownerAddress: item.ownerAddress ? item.ownerAddress.toUpperCase() : null,
        ownerBlock: item.ownerBlock ? item.ownerBlock.toUpperCase() : null,
        ownerRt: item.ownerRt || null,
        ownerRw: item.ownerRw || null,
        ownerKecamatan: item.ownerKecamatan ? item.ownerKecamatan.toUpperCase() : null,
        ownerDesa: item.ownerDesa ? item.ownerDesa.toUpperCase() : null,
        objectAddress: item.objectAddress ? item.objectAddress.toUpperCase() : null,
        objectBlock: item.objectBlock ? item.objectBlock.toUpperCase() : null,
        objectRt: item.objectRt || null,
        objectRw: item.objectRw || null,
        objectKecamatan: item.objectKecamatan ? item.objectKecamatan.toUpperCase() : null,
        objectDesa: item.objectDesa ? item.objectDesa.toUpperCase() : null,
        landArea: Number(item.landArea) || 0,
        buildingArea: item.buildingArea ? Number(item.buildingArea) : null,
        certificate: item.certificate ? item.certificate.toUpperCase() : null,
        notes: item.notes ? item.notes.toUpperCase() : null
      })) : []
    };

    setStatusModalTitle('Menyimpan Permohonan');
    setStatusModalMessage('Sedang memproses dan menyimpan data permohonan ke server...');
    setStatusModalStatus('loading');
    setStatusModalOpen(true);
    setLoading(true);

    try {
      const res: any = await createApplication(payload);
      if (res.success) {
        setStatusModalTitle('Penyimpanan Berhasil');
        setStatusModalMessage('Data permohonan Anda berhasil disimpan dan didaftarkan ke sistem!');
        setStatusModalStatus('success');
        try { localStorage.removeItem('permohonan_form_draft'); } catch (e) { console.error(e); }
      } else {
        if (res.issues && Array.isArray(res.issues)) {
          const backendErrors: Record<string, string> = {};
          res.issues.forEach((issue: any) => {
            const key = issue.path ? issue.path.join('.') : 'general';
            backendErrors[key] = issue.message;
          });
          if (Object.keys(backendErrors).length > 0) setFormErrors(backendErrors);
        }
        setStatusModalTitle('Penyimpanan Gagal');
        setStatusModalMessage(res.error || 'Gagal menyimpan data permohonan.');
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
    applicationType,
    applicationNumber,
    setApplicationNumber,
    serviceNumberDate,
    setServiceNumberDate,
    completionDate,
    previousData,
    targetData,
    formErrors,
    error,
    loading,
    currentStep,
    setCurrentStep,
    steps,
    currentStepLabel,
    needPreviousData,
    needTargetData,
    statusModalOpen,
    setStatusModalOpen,
    statusModalStatus,
    statusModalTitle,
    statusModalMessage,
    draftModalOpen,
    setDraftModalOpen,
    draftModalMessage,
    mounted,
    handleCloseStatusModal,
    handleApplicationTypeChange,
    handleResetDraft,
    handleAddPreviousItem,
    handleRemovePreviousItem,
    handlePreviousItemChange,
    handleAddTargetItem,
    handleRemoveTargetItem,
    handleTargetItemChange,
    handleCopyOwnerFromPrevious,
    handleCopyObjectFromPrevious,
    handleCopyObjectToOwner,
    handleNextStep,
    handlePrevStep,
    handleCreate
  };
}
