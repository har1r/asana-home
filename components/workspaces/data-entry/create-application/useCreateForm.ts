import { useState, useEffect, useCallback, useMemo } from 'react';
import { createApplication } from '@/app/actions/data-entry';
import { applicationSchema } from '@/lib/validations/application'
import {
  APPLICATION_TYPE_OPTIONS,
  SERVICES_NEED_PREVIOUS_DATA,
  SERVICES_NEED_TARGET_DATA,
  createEmptyPreviousDataItem,
  createEmptyTargetDataItem
} from '@/components/workspaces/shared/constants';

// HELPER EKSTRAKSI NOP SEBAGAI DRAFT NOP SEMENTARA DATA BARU
export const getPrimaryNopDisplay = (previousData: any[]): string => {
  const primaryItem = (previousData || []).find(item => item && item.isPrimary) || (previousData || [])[0] || {};
  const rawNop = (primaryItem.nop || '').replace(/[^\d]/g, '');

  if (!rawNop) return '36.19.XXX.XXX.XXX-XXXX.X';

  const p1 = rawNop.slice(0, 2).padEnd(2, 'X');
  const p2 = rawNop.slice(2, 4).padEnd(2, 'X');
  const p3 = rawNop.slice(4, 7).padEnd(3, 'X');
  const p4 = rawNop.slice(7, 10).padEnd(3, 'X');
  const p5 = rawNop.slice(10, 13).padEnd(3, 'X');

  return `${p1}.${p2}.${p3}.${p4}.${p5}-XXXX.X`;
};


interface UseCreateFormOptions {
  initialData?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const useCreateForm = (options: UseCreateFormOptions = {}) => {
  const { initialData, onSuccess, onCancel } = options;

  // STATE MANAGEMENT
  const [applicationType, setApplicationType] = useState<string>('');
  const [applicationNumber, setApplicationNumber] = useState('');
  const [serviceNumberDate, setServiceNumberDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [completionDate, setCompletionDate] = useState('');

  // STATE ARRAY UNTUK DATA LAMA & DATA BARU
  const [previousData, setPreviousData] = useState<any[]>(() => {
    const item1 = createEmptyPreviousDataItem();
    item1.isPrimary = true;
    return [item1];
  });
  const [targetData, setTargetData] = useState<any[]>([]);

  // UI DAN VALIDATION STATE
  const [currentStep, setCurrentStep] = useState(1);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);

  // MODAL STATES
  const [statusModal, setStatusModal] = useState({ open: false, status: 'idle' as 'idle' | 'loading' | 'success' | 'error', title: '', message: '' });
  const [draftModal, setDraftModal] = useState({ open: false, message: '' });
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // DERIVED VALUES
  const needPreviousData = useMemo(() => SERVICES_NEED_PREVIOUS_DATA.includes(applicationType), [applicationType]);
  const needTargetData = useMemo(() => SERVICES_NEED_TARGET_DATA.includes(applicationType), [applicationType]);

  const steps = useMemo(() => {
    const list = [{ id: 1, label: 'Data Utama' }];
    if (needPreviousData) list.push({ id: list.length + 1, label: 'Data Lama (Asal)' });
    if (needTargetData) list.push({ id: list.length + 1, label: 'Data Baru' });
    return list;
  }, [needPreviousData, needTargetData]);

  const currentStepLabel = steps[currentStep - 1]?.label;

  // EFFECTS
  // Auto-calculate Tanggal Penyelesaian (SLA)
  useEffect(() => {
    if (!serviceNumberDate) return;
    const baseDate = new Date(serviceNumberDate);
    if (isNaN(baseDate.getTime())) return;

    let monthsToAdd = 4; // Default
    if (applicationType === 'NEW_TAX_OBJECT') monthsToAdd = 6;
    else if (applicationType === 'REACTIVATION') monthsToAdd = 1;

    const targetDate = new Date(baseDate);
    targetDate.setMonth(baseDate.getMonth() + monthsToAdd);
    setCompletionDate(targetDate.toISOString().split('T')[0]);
  }, [applicationType, serviceNumberDate]);

  // Restore Draft / Initial Data (Hanya sekali saat mount / initialData siap)
  useEffect(() => {
    if (initialData) {
      setApplicationType(initialData.applicationType || '');
      setApplicationNumber(initialData.applicationNumber || '');
      setServiceNumberDate(initialData.serviceNumberDate ? new Date(initialData.serviceNumberDate).toISOString().split('T')[0] : '');
      if (initialData.previousData && Array.isArray(initialData.previousData)) {
        setPreviousData(initialData.previousData.map((item: any, i: number) => ({
          ...createEmptyPreviousDataItem(),
          isPrimary: i === 0,
          ...(item || {})
        })));
      }
      if (initialData.targetData && Array.isArray(initialData.targetData)) {
        setTargetData(initialData.targetData.map((item: any) => ({
          ...createEmptyTargetDataItem(),
          ...(item || {})
        })));
      } else {
        setTargetData([createEmptyTargetDataItem()]);
      }

      setDraftModal({ open: true, message: 'Draf permohonan berhasil diduplikat!' });
      setDraftLoaded(true);
      return;
    }

    try {
      const stored = localStorage.getItem('permohonan_form_draft');
      if (stored) {
        const parsed = JSON.parse(stored);
        setApplicationType(parsed.applicationType || '');
        setApplicationNumber(parsed.applicationNumber || '');
        setServiceNumberDate(parsed.serviceNumberDate || new Date().toISOString().split('T')[0]);
        setCompletionDate(parsed.completionDate || '');
        if (parsed.previousData && Array.isArray(parsed.previousData)) {
          setPreviousData(parsed.previousData.map((item: any, i: number) => ({
            ...createEmptyPreviousDataItem(),
            isPrimary: i === 0,
            ...(item || {})
          })));
        }
        if (parsed.targetData && Array.isArray(parsed.targetData)) {
          setTargetData(parsed.targetData.map((item: any) => ({
            ...createEmptyTargetDataItem(),
            ...(item || {})
          })));
        }
        setDraftModal({ open: true, message: 'Draf pengisian sebelumnya telah otomatis dipulihkan.' });
      }
    } catch (e) { console.error('Failed to load draft', e); }
    finally { setDraftLoaded(true); }
  }, []); // Run ONCE on mount

  // SINKRONISASI 15 DIGIT NOP ASAL KE NOP SEMENTARA DATA BARU
  useEffect(() => {
    if (!draftLoaded || applicationType === 'NEW_TAX_OBJECT' || !needPreviousData || !needTargetData) return;

    const defaultNopTemp = getPrimaryNopDisplay(previousData);

    setTargetData(prevTargets => {
      let hasChange = false;
      const updated = prevTargets.map(item => {
        // Jika NOP Sementara masih kosong atau mengikuti format default dari NOP Asal
        if (!item.nopTemporary || item.nopTemporary.includes('X') || item.nopTemporary.endsWith('-XXXX.X')) {
          if (item.nopTemporary !== defaultNopTemp) {
            hasChange = true;
            return { ...item, nopTemporary: defaultNopTemp };
          }
        }
        return item;
      });
      return hasChange ? updated : prevTargets;
    });
  }, [previousData, applicationType, needPreviousData, needTargetData, draftLoaded]);


  // SAVE DRAFT KE LOCAL STORAGE
  useEffect(() => {
    if (!draftLoaded) return;
    const draft = { applicationType, applicationNumber, serviceNumberDate, completionDate, previousData, targetData };
    localStorage.setItem('permohonan_form_draft', JSON.stringify(draft));
  }, [draftLoaded, applicationType, applicationNumber, serviceNumberDate, completionDate, previousData, targetData]);

  // AUTO-ADJUST STATE PREVIOUS DATA & TARGET DATA SESUAI JENIS PERMOHONAN
  useEffect(() => {
    if (!draftLoaded || !applicationType) return;

    // A. Auto-Adjust Previous Data
    if (!needPreviousData) {
      setPreviousData([]);
    } else if (applicationType === 'MERGER_MUTATION') {
      // Mutasi Penggabungan wajib minimal 2 NOP asal
      setPreviousData(prev => {
        if (prev.length >= 2) return prev;
        const copy = [...prev];
        while (copy.length < 2) {
          copy.push(createEmptyPreviousDataItem());
        }
        return copy;
      });
    } else {
      // Layanan 1 data lama (Mutasi Sebagian, Pengaktifan, Pembetulan, Mutasi Habis)
      setPreviousData(prev => {
        if (prev.length === 0) {
          const item = createEmptyPreviousDataItem();
          item.isPrimary = true;
          return [item];
        }
        if (prev.length > 1) {
          return prev.slice(0, 1);
        }
        return prev;
      });
    }

    // B. Auto-Adjust Target Data
    if (!needTargetData) {
      setTargetData([]);
    } else if (applicationType !== 'PARTIAL_MUTATION' && targetData.length > 1) {
      setTargetData(prev => prev.slice(0, 1));
    } else if (needTargetData && targetData.length === 0) {
      setTargetData([createEmptyTargetDataItem()]);
    }
  }, [applicationType, needPreviousData, needTargetData, draftLoaded]);


  // INISIALISASI TARGET DATA JIKA DIBUTUHKAN TAPI KOSONG
  useEffect(() => {
    if (draftLoaded && needTargetData && targetData.length === 0) {
      setTargetData([createEmptyTargetDataItem()]);
    }
  }, [needTargetData, targetData.length, draftLoaded]);

  // CLEAR ERROR HELPER (REAL-TIME)
  const clearFieldError = useCallback((fieldKey: string) => {
    setFormErrors(prev => {
      if (!prev[fieldKey]) return prev;
      const next = { ...prev };
      delete next[fieldKey];
      if (Object.keys(next).length === 0) setError('');
      return next;
    });
  }, []);

  const handleApplicationTypeChange = useCallback((newType: string) => {
    setApplicationType(newType);
    clearFieldError('applicationType');
  }, [clearFieldError]);

  const handleApplicationNumberChange = useCallback((val: string) => {
    setApplicationNumber(val);
    clearFieldError('applicationNumber');
  }, [clearFieldError]);

  const handleServiceNumberDateChange = useCallback((val: string) => {
    setServiceNumberDate(val);
    clearFieldError('serviceNumberDate');
  }, [clearFieldError]);

  // ARRAY MANIPULATION
  const updatePreviousItem = useCallback((index: number, field: string, value: any) => {
    setPreviousData(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
    clearFieldError(`previousData.${index}.${field}`);
    if (field === 'nop') clearFieldError('previousDataGeneral');
  }, [clearFieldError]);

  const setPrimaryPreviousItem = useCallback((selectedIndex: number) => {
    setPreviousData(prev => prev.map((item, i) => ({
      ...item,
      isPrimary: i === selectedIndex
    })));
  }, []);

  const addTargetItem = useCallback(() => setTargetData(prev => [...prev, createEmptyTargetDataItem()]), []);
  const removeTargetItem = useCallback((index: number) => setTargetData(prev => prev.filter((_, i) => i !== index)), []);
  const updateTargetItem = useCallback((index: number, field: string, value: any) => {
    setTargetData(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
    clearFieldError(`targetData.${index}.${field}`);
  }, [clearFieldError]);

  // VALIDATION & NAVIGATION
  const validateCurrentStep = useCallback(() => {
    // Kita gunakan Zod schema untuk validasi, lalu filter error berdasarkan step saat ini
    const result = applicationSchema.safeParse({ applicationType, applicationNumber, serviceNumberDate, completionDate, previousData, targetData });

    if (!result.success) {
      const stepErrors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        const path = issue.path.join('.');
        // Filter error hanya untuk field yang relevan dengan step saat ini
        if (currentStepLabel === 'Data Utama' && (path.includes('applicationType') || path.includes('applicationNumber') || path.includes('serviceNumberDate') || path.includes('completionDate'))) {
          stepErrors[path] = issue.message;
        } else if (currentStepLabel === 'Data Lama (Asal)' && path.includes('previousData')) {
          stepErrors[path] = issue.message;
        } else if (currentStepLabel === 'Data Baru' && path.includes('targetData')) {
          stepErrors[path] = issue.message;
        }
      });
      return stepErrors;
    }
    return {};
  }, [applicationType, applicationNumber, serviceNumberDate, completionDate, previousData, targetData, currentStepLabel]);

  const handleNextStep = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setError('');
    const errors = validateCurrentStep();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setError('Form kurang lengkap. Harap periksa detail isian merah di bawah.');
      // Auto-scroll ke error pertama
      setTimeout(() => {
        const firstKey = Object.keys(errors)[0];
        const el = document.getElementById(firstKey);
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

  // SUBMIT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validasi Penuh sebelum kirim
    const result = applicationSchema.safeParse({ applicationType, applicationNumber, serviceNumberDate, completionDate, previousData, targetData });
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach(issue => { errors[issue.path.join('.')] = issue.message; });
      setFormErrors(errors);
      setError('Formulir belum lengkap. Harap periksa bagian berpembatas merah.');

      // Pindah ke step yang memiliki error
      const firstKey = Object.keys(errors)[0];
      if (firstKey.includes('previousData')) setCurrentStep(steps.findIndex(s => s.label === 'Data Lama (Asal)') + 1 || 1);
      else if (firstKey.includes('targetData')) setCurrentStep(steps.findIndex(s => s.label === 'Data Baru') + 1 || 1);
      else setCurrentStep(1);
      return;
    }

    // Siapkan Payload Bersih (Sesuai Ekspektasi Backend)
    const payload = {
      applicationType,
      applicationNumber: applicationNumber.toUpperCase(),
      serviceNumberDate,
      completionDate,
      previousData: needPreviousData ? previousData.map((item, idx) => ({
        ...item,
        nop: item.nop ? item.nop.replace(/[.\-]/g, '') : '',
        ownerName: item.ownerName ? item.ownerName.toUpperCase() : '',
        ownerAddress: item.ownerAddress ? item.ownerAddress.toUpperCase() : '',
        ownerBlock: item.ownerBlock ? item.ownerBlock.toUpperCase() : '',
        ownerKecamatan: item.ownerKecamatan ? item.ownerKecamatan.toUpperCase() : '',
        ownerDesa: item.ownerDesa ? item.ownerDesa.toUpperCase() : '',
        objectAddress: item.objectAddress ? item.objectAddress.toUpperCase() : '',
        objectBlock: item.objectBlock ? item.objectBlock.toUpperCase() : '',
        objectKecamatan: item.objectKecamatan ? item.objectKecamatan.toUpperCase() : '',
        objectDesa: item.objectDesa ? item.objectDesa.toUpperCase() : '',
        landArea: Number(item.landArea) || 0,
        buildingArea: item.buildingArea !== undefined && item.buildingArea !== '' && item.buildingArea !== null ? Number(item.buildingArea) : null,
        certificate: item.certificate ? item.certificate.toUpperCase() : '',
        isPrimary: item.isPrimary ?? (idx === 0),
        notes: item.notes ? item.notes.toUpperCase() : null,
      })) : [],
      targetData: needTargetData ? targetData.map(item => ({
        ...item,
        nopTemporary: item.nopTemporary ? item.nopTemporary.replace(/[.\-]/g, '') : '',
        ownerName: item.ownerName ? item.ownerName.toUpperCase() : '',
        ownerAddress: item.ownerAddress ? item.ownerAddress.toUpperCase() : '',
        ownerBlock: item.ownerBlock ? item.ownerBlock.toUpperCase() : '',
        ownerKecamatan: item.ownerKecamatan ? item.ownerKecamatan.toUpperCase() : '',
        ownerDesa: item.ownerDesa ? item.ownerDesa.toUpperCase() : '',
        objectAddress: item.objectAddress ? item.objectAddress.toUpperCase() : '',
        objectBlock: item.objectBlock ? item.objectBlock.toUpperCase() : '',
        objectKecamatan: item.objectKecamatan ? item.objectKecamatan.toUpperCase() : '',
        objectDesa: item.objectDesa ? item.objectDesa.toUpperCase() : '',
        landArea: Number(item.landArea) || 0,
        buildingArea: item.buildingArea !== undefined && item.buildingArea !== '' && item.buildingArea !== null ? Number(item.buildingArea) : null,
        certificate: item.certificate ? item.certificate.toUpperCase() : '',
        notes: item.notes ? item.notes.toUpperCase() : null,
      })) : []
    };

    // Tampilkan Modal Loading
    setStatusModal({ open: true, status: 'loading', title: 'Menyimpan Permohonan', message: 'Sedang memproses data ke server...' });
    setLoading(true);

    try {
      const res = await createApplication(payload);
      if (res.success) {
        setStatusModal({ open: true, status: 'success', title: 'Berhasil', message: 'Permohonan berhasil didaftarkan!' });
        localStorage.removeItem('permohonan_form_draft');
        setTimeout(() => {
          setStatusModal(prev => ({ ...prev, open: false }));
          onSuccess?.();
          onCancel?.();
        }, 2000);
      } else {
        // Handle Zod errors dari backend
        if (res.issues) {
          const backendErrors: Record<string, string> = {};
          res.issues.forEach((issue: any) => { backendErrors[issue.path.join('.')] = issue.message; });
          setFormErrors(backendErrors);
        }
        setStatusModal({ open: true, status: 'error', title: 'Gagal', message: res.error || 'Terjadi kesalahan.' });
      }
    } catch (err: any) {
      setStatusModal({ open: true, status: 'error', title: 'Error Sistem', message: err.message || 'Gagal terhubung ke server.' });
    } finally {
      setLoading(false);
    }
  };

  // UTILITIS
  const handleResetDraft = useCallback(() => {
    localStorage.removeItem('permohonan_form_draft');
    setApplicationType('');
    setApplicationNumber('');
    setServiceNumberDate(new Date().toISOString().split('T')[0]);
    setPreviousData([createEmptyPreviousDataItem(), createEmptyPreviousDataItem()]);
    setTargetData([createEmptyTargetDataItem()]);
    setFormErrors({});
    setError('');
    setCurrentStep(1);
    setDraftModal({ open: true, message: 'Draf dihapus dan form di-reset.' });
  }, []);

  const handleWhatsappChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^\d]/g, '');
    if (val.startsWith('62')) val = val.slice(2);
    if (val.startsWith('0')) val = val.slice(1);
    const formatted = val ? '62' + val : '';
    if (targetData.length > 0) {
      updateTargetItem(0, 'whatsappNumber', formatted);
    }
  }, [targetData.length, updateTargetItem]);

  const handleCopyOwnerFromPrevious = useCallback((targetIdx: number) => {
    const prev = previousData[0];
    if (!prev) return;
    setTargetData(prevTargets => prevTargets.map((item, i) => i === targetIdx ? {
      ...item,
      ownerName: prev.ownerName || '',
      ownerAddress: prev.ownerAddress || '',
      ownerBlock: prev.ownerBlock || '',
      ownerRt: prev.ownerRt || '',
      ownerRw: prev.ownerRw || '',
      ownerKecamatan: prev.ownerKecamatan || '',
      ownerDesa: prev.ownerDesa || '',
    } : item));
  }, [previousData]);

  const handleCopyObjectFromPrevious = useCallback((targetIdx: number) => {
    const prev = previousData[0];
    if (!prev) return;
    setTargetData(prevTargets => prevTargets.map((item, i) => i === targetIdx ? {
      ...item,
      objectAddress: prev.objectAddress || '',
      objectBlock: prev.objectBlock || '',
      objectRt: prev.objectRt || '',
      objectRw: prev.objectRw || '',
      objectKecamatan: prev.objectKecamatan || '',
      objectDesa: prev.objectDesa || '',
    } : item));
  }, [previousData]);

  const handleCopyObjectToOwner = useCallback((targetIdx: number) => {
    setTargetData(prevTargets => prevTargets.map((item, i) => i === targetIdx ? {
      ...item,
      ownerAddress: item.objectAddress || '',
      ownerBlock: item.objectBlock || '',
      ownerRt: item.objectRt || '',
      ownerRw: item.objectRw || '',
      ownerKecamatan: item.objectKecamatan || '',
      ownerDesa: item.objectDesa || '',
    } : item));
  }, []);

  const handleAddPreviousItem = useCallback(() => {
    setPreviousData(prev => [...prev, createEmptyPreviousDataItem()]);
  }, []);

  const handleRemovePreviousItem = useCallback((idx: number) => {
    setPreviousData(prev => prev.filter((_, i) => i !== idx));
  }, []);

  return {
    // State
    applicationType, setApplicationType,
    handleApplicationTypeChange,
    applicationNumber, setApplicationNumber: handleApplicationNumberChange,
    serviceNumberDate, setServiceNumberDate: handleServiceNumberDateChange,
    completionDate,
    previousData, updatePreviousItem, handlePreviousItemChange: updatePreviousItem,
    targetData, addTargetItem, handleAddTargetItem: addTargetItem,
    removeTargetItem, handleRemoveTargetItem: removeTargetItem,
    updateTargetItem, handleTargetItemChange: updateTargetItem,
    needPreviousData, needTargetData,

    // Copy Helpers
    handleCopyOwnerFromPrevious,
    handleCopyObjectFromPrevious,
    handleCopyObjectToOwner,

    // UI State
    currentStep, setCurrentStep, currentStepLabel, steps,
    formErrors, error, loading,
    statusModal, setStatusModal,
    statusModalOpen: statusModal.open,
    statusModalStatus: statusModal.status,
    statusModalTitle: statusModal.title,
    statusModalMessage: statusModal.message,
    handleCloseStatusModal: () => setStatusModal(prev => ({ ...prev, open: false })),

    draftModal, setDraftModal,
    draftModalOpen: draftModal.open,
    draftModalMessage: draftModal.message,
    setDraftModalOpen: (open: boolean) => setDraftModal(prev => ({ ...prev, open })),
    draftLoaded, mounted,

    // Handlers
    handleCreate: handleSubmit,
    handleNextStep,
    handlePrevStep,
    handleSubmit,
    handleResetDraft,
    handleAddPreviousItem,
    handleRemovePreviousItem,
    handleWhatsappChange,
    setPrimaryPreviousItem,
    getPrimaryNopDisplay,
  };
}
