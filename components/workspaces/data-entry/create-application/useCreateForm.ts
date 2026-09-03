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

export const useCreateForm = (initialData?: any, onSuccess?: () => void, onCancel?: () => void) => {
  // STATE MANAGEMENT
  const [applicationType, setApplicationType] = useState<string>('PARTIAL_MUTATION');
  const [applicationNumber, setApplicationNumber] = useState('');
  const [serviceNumberDate, setServiceNumberDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [completionDate, setCompletionDate] = useState('');

  // STATE ARRAY UNTUK DATA LAMA & DATA BARU
  const [previousData, setPreviousData] = useState<any[]>([createEmptyPreviousDataItem(), createEmptyPreviousDataItem]);
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

  // Restore Draft / Initial Data
  useEffect(() => {
    if (initialData) {
      setApplicationType(initialData.applicationType || 'PARTIAL_MUTATION');
      setApplicationNumber(initialData.applicationNumber || '');
      setServiceNumberDate(initialData.serviceNumberDate ? new Date(initialData.serviceNumberDate).toISOString().split('T')[0] : '');
      if (initialData.previousData) setPreviousData(initialData.previousData);
      if (initialData.targetData) setTargetData(initialData.targetData);
      else setTargetData([createEmptyTargetDataItem()]);

      setDraftModal({ open: true, message: 'Draf permohonan berhasil diduplikat!' });
      setDraftLoaded(true);
      return;
    }

    try {
      const stored = localStorage.getItem('permohonan_form_draft');
      if (stored) {
        const parsed = JSON.parse(stored);
        setApplicationType(parsed.applicationType);
        setApplicationNumber(parsed.applicationNumber);
        setServiceNumberDate(parsed.serviceNumberDate);
        setCompletionDate(parsed.completionDate);
        if (parsed.previousData) setPreviousData(parsed.previousData);
        if (parsed.targetData) setTargetData(parsed.targetData);
        setDraftModal({ open: true, message: 'Draf pengisian sebelumnya telah otomatis dipulihkan.' });
      }
    } catch (e) { console.error('Failed to load draft', e); }
    finally { setDraftLoaded(true); }
  }, [initialData]);

  // SAVE DRAFT KE LOCAL STORAGE
  useEffect(() => {
    if (!draftLoaded) return;
    const draft = { applicationType, applicationNumber, serviceNumberDate, completionDate, previousData, targetData };
    localStorage.setItem('permohonan_form_draft', JSON.stringify(draft));
  }, [draftLoaded, applicationType, applicationNumber, serviceNumberDate, completionDate, previousData, targetData]);

  // BATASI PANJANG ARRAY TERGET DATA JIKA BUKAN PARTIAL MUTATION
  useEffect(() => {
    if (applicationType !== 'PARTIAL_MUTATION' && targetData.length > 1) {
      setTargetData(prev => prev.slice(0, 1));
    }
  }, [applicationType, targetData.length]);

  // INISIALISASI TARGET DATA JIKA DIBUTUHKAN TAPI KOSONG
  useEffect(() => {
    if (draftLoaded && needTargetData && targetData.length === 0) {
      setTargetData([createEmptyTargetDataItem()]);
    }
  }, [needTargetData, targetData.length, draftLoaded]);

  // ARRAY MANIPULATION
  const updatePreviousItem = useCallback((index: number, field: string, value: any) => {
    setPreviousData(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  }, []);

  const addTargetItem = useCallback(() => setTargetData(prev => [...prev, createEmptyTargetDataItem()]), []);
  const removeTargetItem = useCallback((index: number) => setTargetData(prev => prev.filter((_, i) => i !== index)), []);
  const updateTargetItem = useCallback((index: number, field: string, value: any) => {
    setTargetData(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  }, []);

  // VALIDATION & NAVIGATION
  const validateCurrentStep = useCallback(() => {
    // Kita gunakan Zod schema untuk validasi, lalu filter error berdasarkan step saat ini
    const result = applicationSchema.safeParse({ applicationType, applicationNumber, serviceNumberDate, completionDate, previousData, targetData });

    if (!result.success) {
      const stepErrors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        const path = issue.path.join('.');
        // Filter error hanya untuk field yang relevan dengan step saat ini
        if (currentStepLabel === 'Data Utama' && (path.includes('applicationNumber') || path.includes('serviceNumberDate') || path.includes('completionDate') || path.includes('targetData.0.whatsappNumber'))) {
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
      previousData: needPreviousData ? previousData.map(item => ({
        ...item,
        nop: item.nop ? item.nop.replace(/[.\-]/g, '') : '',
        ownerName: item.ownerName ? item.ownerName.toUpperCase() : '',
        landArea: Number(item.landArea) || 0,
        // ... map field lain sesuai kebutuhan (uppercase/null handling)
      })) : [],
      targetData: needTargetData ? targetData.map(item => ({
        ...item,
        nopTemporary: item.nopTemporary ? item.nopTemporary.replace(/[.\-]/g, '') : null,
        ownerName: item.ownerName ? item.ownerName.toUpperCase() : '',
        landArea: Number(item.landArea) || 0,
        // ... map field lain sesuai kebutuhan
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

  return {
    // State
    applicationType, setApplicationType,
    applicationNumber, setApplicationNumber,
    serviceNumberDate, setServiceNumberDate,
    completionDate, // Read-only di UI, dihitung otomatis
    previousData, updatePreviousItem,
    targetData, addTargetItem, removeTargetItem, updateTargetItem,

    // UI State
    currentStep, currentStepLabel, steps,
    formErrors, error, loading,
    statusModal, setStatusModal,
    draftModal, setDraftModal,
    draftLoaded,

    // Handlers
    handleNextStep,
    handlePrevStep,
    handleSubmit,
    handleResetDraft,
    handleWhatsappChange,
  };
}
