import { useState, useEffect, useCallback, useMemo } from 'react';
import { updateApplication } from '@/app/actions/data-entry';
import { applicationSchema } from '@/lib/validations/application';
import {
    SERVICES_NEED_PREVIOUS_DATA,
    SERVICES_NEED_TARGET_DATA,
    createEmptyPreviousDataItem,
    createEmptyTargetDataItem,
    formatNop
} from '@/components/workspaces/shared/constants';

export const getPrimaryNopDisplay = (previousData: any[]): string => {
    const primaryItem = (previousData || []).find(item => item && item.isPrimary) || (previousData || [])[0] || {};
    const rawNop = (primaryItem.nop || '').replace(/[^\d]/g, '');

    if (!rawNop) return '36.19.XXX.XXX.XXX-XXXX.X';

    const p1 = rawNop.slice(0, 2).padEnd(2, 'X');
    const p2 = rawNop.slice(2, 4).padEnd(2, 'X');
    const p3 = rawNop.slice(4, 7).padEnd(3, 'X');
    const p4 = rawNop.slice(7, 10).padEnd(3, 'X');
    const p5 = rawNop.slice(10, 13).padEnd(3, 'X');

    return `${p1}.${p2}.${p3}.${p4}.${p5}-0000.0`;
};

interface UseEditApplicationOptions {
    editTarget: any;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export const useEditApplication = ({ editTarget, onSuccess, onCancel }: UseEditApplicationOptions) => {
    const [applicationType, setApplicationType] = useState<string>('');
    const [applicationNumber, setApplicationNumber] = useState('');
    const [serviceNumberDate, setServiceNumberDate] = useState('');
    const [completionDate, setCompletionDate] = useState('');
    const [previousData, setPreviousData] = useState<any[]>([]);
    const [targetData, setTargetData] = useState<any[]>([]);

    const [currentStep, setCurrentStep] = useState(1);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [statusModal, setStatusModal] = useState({ open: false, status: 'idle' as 'idle' | 'loading' | 'success' | 'error', title: '', message: '' });

    // SINKRONISASI DATA EDIT TARGET KE STATE FORM
    useEffect(() => {
        if (!editTarget) return;

        setApplicationType(editTarget.applicationType || editTarget.jenisPermohonan || '');
        setApplicationNumber((editTarget.applicationNumber || editTarget.nomorPelayanan || '').toUpperCase());

        const rawDate = editTarget.serviceNumberDate || editTarget.tanggalNoPelayanan;
        const dateObj = rawDate ? new Date(rawDate) : null;
        setServiceNumberDate(dateObj && !isNaN(dateObj.getTime()) ? dateObj.toISOString().split('T')[0] : '');

        const rawSelesaiDate = editTarget.completionDate || editTarget.tanggalPenyelesaian;
        const selesaiObj = rawSelesaiDate ? new Date(rawSelesaiDate) : null;
        setCompletionDate(selesaiObj && !isNaN(selesaiObj.getTime()) ? selesaiObj.toISOString().split('T')[0] : '');

        // Parse Data Lama / Previous Data
        if (editTarget.previousData && Array.isArray(editTarget.previousData) && editTarget.previousData.length > 0) {
            setPreviousData(editTarget.previousData.map((item: any, i: number) => ({
                ...createEmptyPreviousDataItem(),
                isPrimary: i === 0,
                ...(item || {}),
                nop: item.nop ? formatNop(item.nop) : ''
            })));
        } else if (editTarget.nop || editTarget.namaPemilikLama) {
            setPreviousData([{
                ...createEmptyPreviousDataItem(),
                isPrimary: true,
                nop: formatNop(editTarget.nop || ''),
                whatsappNumber: editTarget.noWhatsapp || '',
                ownerName: editTarget.namaPemilikLama || '',
                ownerAddress: editTarget.alamatPemilikLama || '',
                ownerBlock: editTarget.blokPemilikLama || '',
                ownerRt: editTarget.rtPemilikLama || '',
                ownerRw: editTarget.rwPemilikLama || '',
                ownerKecamatan: editTarget.kecamatanPemilikLama || '',
                ownerDesa: editTarget.desaPemilikLama || '',
                objectAddress: editTarget.alamatObjekLama || '',
                objectBlock: editTarget.blokObjekLama || '',
                objectRt: editTarget.rtObjekLama || '',
                objectRw: editTarget.rwObjekLama || '',
                objectKecamatan: editTarget.kecamatanObjekLama || '',
                objectDesa: editTarget.desaObjekLama || '',
                landArea: editTarget.luasTanahLama || '',
                buildingArea: editTarget.luasBangunanLama || '',
                certificate: editTarget.sertifikatLama || ''
            }]);
        } else {
            setPreviousData([createEmptyPreviousDataItem()]);
        }

        // Parse Data Baru / Target Data
        if (editTarget.targetData && Array.isArray(editTarget.targetData) && editTarget.targetData.length > 0) {
            setTargetData(editTarget.targetData.map((item: any) => ({
                ...createEmptyTargetDataItem(),
                ...(item || {}),
                nopTemporary: item.nopTemporary ? formatNop(item.nopTemporary) : ''
            })));
        } else if (editTarget.dataBaru && Array.isArray(editTarget.dataBaru)) {
            setTargetData(editTarget.dataBaru.map((item: any) => ({
                ...createEmptyTargetDataItem(),
                ...(item || {}),
                nopTemporary: item.nopSementara ? formatNop(item.nopSementara) : '',
                whatsappNumber: item.noWhatsapp || '',
                ownerName: item.namaPemilikBaru || '',
                ownerAddress: item.alamatPemilikBaru || '',
                ownerBlock: item.blokPemilikBaru || '',
                ownerRt: item.rtPemilikBaru || '',
                ownerRw: item.rwPemilikBaru || '',
                ownerKecamatan: item.kecamatanPemilikBaru || '',
                ownerDesa: item.desaPemilikBaru || '',
                objectAddress: item.alamatObjekBaru || '',
                objectBlock: item.blokObjekBaru || '',
                objectRt: item.rtObjekBaru || '',
                objectRw: item.rwObjekBaru || '',
                objectKecamatan: item.kecamatanObjekBaru || '',
                objectDesa: item.desaObjekBaru || '',
                landArea: item.luasTanahBaru || '',
                buildingArea: item.luasBangunanBaru || '',
                certificate: item.sertifikatBaru || ''
            })));
        } else {
            setTargetData([createEmptyTargetDataItem()]);
        }
    }, [editTarget]);

    // DERIVED VALUES
    const needPreviousData = useMemo(() => SERVICES_NEED_PREVIOUS_DATA.includes(applicationType), [applicationType]);
    const needTargetData = useMemo(() => SERVICES_NEED_TARGET_DATA.includes(applicationType), [applicationType]);

    const steps = useMemo(() => {
        const list = [{ id: 1, label: 'Data Utama' }];
        if (needPreviousData) list.push({ id: list.length + 1, label: 'Data SPPT Lama' });
        if (needTargetData) list.push({ id: list.length + 1, label: 'Data SPPT Baru' });
        return list;
    }, [needPreviousData, needTargetData]);

    const currentStepLabel = steps[currentStep - 1]?.label;

    // HANDLERS INPUT
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

    const updatePreviousItem = useCallback((index: number, field: string, value: any) => {
        setPreviousData(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
        clearFieldError(`previousData.${index}.${field}`);
    }, [clearFieldError]);

    const setPrimaryPreviousItem = useCallback((selectedIndex: number) => {
        setPreviousData(prev => prev.map((item, i) => ({
            ...item,
            isPrimary: i === selectedIndex
        })));
    }, []);

    const addTargetItem = useCallback(() => {
        const newItem = createEmptyTargetDataItem();
        newItem.nopTemporary = getPrimaryNopDisplay(previousData);
        setTargetData(prev => [...prev, newItem]);
    }, [previousData]);
    const removeTargetItem = useCallback((index: number) => setTargetData(prev => prev.filter((_, i) => i !== index)), []);
    const updateTargetItem = useCallback((index: number, field: string, value: any) => {
        setTargetData(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
        clearFieldError(`targetData.${index}.${field}`);
    }, [clearFieldError]);

    // VALIDATION & STEP NAVIGATION
    const validateCurrentStep = useCallback(() => {
        const result = applicationSchema.safeParse({ applicationType, applicationNumber, serviceNumberDate, completionDate, previousData, targetData });

        if (!result.success) {
            const stepErrors: Record<string, string> = {};
            result.error.issues.forEach(issue => {
                const path = issue.path.join('.');
                if (currentStepLabel === 'Data Utama' && (path.includes('applicationType') || path.includes('applicationNumber') || path.includes('serviceNumberDate') || path.includes('completionDate'))) {
                    stepErrors[path] = issue.message;
                } else if (currentStepLabel === 'Data SPPT Lama' && path.includes('previousData')) {
                    stepErrors[path] = issue.message;
                } else if (currentStepLabel === 'Data SPPT Baru' && path.includes('targetData')) {
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

    // SUBMIT UPDATE API
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editTarget?.id) return;
        setError('');

        const result = applicationSchema.safeParse({ applicationType, applicationNumber, serviceNumberDate, completionDate, previousData, targetData });
        if (!result.success) {
            const errors: Record<string, string> = {};
            result.error.issues.forEach(issue => { errors[issue.path.join('.')] = issue.message; });
            setFormErrors(errors);
            setError('Formulir belum lengkap. Harap periksa bagian berpembatas merah.');

            const firstKey = Object.keys(errors)[0];
            if (firstKey.includes('previousData')) setCurrentStep(steps.findIndex(s => s.label === 'Data SPPT Lama') + 1 || 1);
            else if (firstKey.includes('targetData')) setCurrentStep(steps.findIndex(s => s.label === 'Data SPPT Baru') + 1 || 1);
            else setCurrentStep(1);

            setTimeout(() => {
                const el = document.getElementById(firstKey);
                if (el) {
                    el.focus();
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
            return;
        }

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
                ownerKecamatan: item.ownerKecamatan ? item.ownerKecamatan.toUpperCase() : '',
                ownerDesa: item.ownerDesa ? item.ownerDesa.toUpperCase() : '',
                objectAddress: item.objectAddress ? item.objectAddress.toUpperCase() : '',
                objectKecamatan: item.objectKecamatan ? item.objectKecamatan.toUpperCase() : '',
                objectDesa: item.objectDesa ? item.objectDesa.toUpperCase() : '',
                landArea: Number(item.landArea) || 0,
                buildingArea: item.buildingArea !== undefined && item.buildingArea !== '' && item.buildingArea !== null ? Number(item.buildingArea) : null,
                certificate: item.certificate ? item.certificate.toUpperCase() : '',
                isPrimary: item.isPrimary ?? (idx === 0),
            })) : [],
            targetData: needTargetData ? targetData.map(item => ({
                ...item,
                nopTemporary: item.nopTemporary ? item.nopTemporary.replace(/[.\-]/g, '') : '',
                ownerName: item.ownerName ? item.ownerName.toUpperCase() : '',
                ownerAddress: item.ownerAddress ? item.ownerAddress.toUpperCase() : '',
                ownerKecamatan: item.ownerKecamatan ? item.ownerKecamatan.toUpperCase() : '',
                ownerDesa: item.ownerDesa ? item.ownerDesa.toUpperCase() : '',
                objectAddress: item.objectAddress ? item.objectAddress.toUpperCase() : '',
                objectKecamatan: item.objectKecamatan ? item.objectKecamatan.toUpperCase() : '',
                objectDesa: item.objectDesa ? item.objectDesa.toUpperCase() : '',
                landArea: Number(item.landArea) || 0,
                buildingArea: item.buildingArea !== undefined && item.buildingArea !== '' && item.buildingArea !== null ? Number(item.buildingArea) : null,
                certificate: item.certificate ? item.certificate.toUpperCase() : '',
            })) : []
        };

        setStatusModal({ open: true, status: 'loading', title: 'Menyimpan Perubahan', message: 'Sedang meng-update data permohonan...' });
        setLoading(true);

        try {
            const res = await updateApplication(editTarget.id, payload);
            if (res.success) {
                setStatusModal({ open: true, status: 'success', title: 'Berhasil', message: 'Perubahan permohonan berhasil disimpan!' });
                setTimeout(() => {
                    setStatusModal(prev => ({ ...prev, open: false }));
                    onSuccess?.();
                    onCancel?.();
                }, 1500);
            } else {
                setStatusModal({ open: true, status: 'error', title: 'Gagal', message: res.error || 'Terjadi kesalahan.' });
            }
        } catch (err: any) {
            setStatusModal({ open: true, status: 'error', title: 'Error Sistem', message: err.message || 'Gagal terhubung ke server.' });
        } finally {
            setLoading(false);
        }
    };

    return {
        // State
        applicationType, setApplicationType, handleApplicationTypeChange,
        applicationNumber, setApplicationNumber: handleApplicationNumberChange,
        serviceNumberDate, setServiceNumberDate: handleServiceNumberDateChange,
        completionDate,
        previousData, updatePreviousItem, handlePreviousItemChange: updatePreviousItem,
        targetData, addTargetItem, handleAddTargetItem: addTargetItem,
        removeTargetItem, handleRemoveTargetItem: removeTargetItem,
        updateTargetItem, handleTargetItemChange: updateTargetItem,
        needPreviousData, needTargetData,

        // Copy Helpers
        handleCopyOwnerFromPrevious: useCallback((targetIdx: number) => {
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
            clearFieldError(`targetData.${targetIdx}.ownerName`);
            clearFieldError(`targetData.${targetIdx}.ownerAddress`);
            clearFieldError(`targetData.${targetIdx}.ownerKecamatan`);
            clearFieldError(`targetData.${targetIdx}.ownerDesa`);
        }, [previousData, clearFieldError]),

        handleCopyObjectFromPrevious: useCallback((targetIdx: number) => {
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
            clearFieldError(`targetData.${targetIdx}.objectAddress`);
            clearFieldError(`targetData.${targetIdx}.objectKecamatan`);
            clearFieldError(`targetData.${targetIdx}.objectDesa`);
        }, [previousData, clearFieldError]),

        handleCopyObjectToOwner: useCallback((targetIdx: number) => {
            setTargetData(prevTargets => prevTargets.map((item, i) => i === targetIdx ? {
                ...item,
                ownerAddress: item.objectAddress || '',
                ownerBlock: item.objectBlock || '',
                ownerRt: item.objectRt || '',
                ownerRw: item.objectRw || '',
                ownerKecamatan: item.objectKecamatan || '',
                ownerDesa: item.objectDesa || '',
            } : item));
            clearFieldError(`targetData.${targetIdx}.ownerAddress`);
            clearFieldError(`targetData.${targetIdx}.ownerKecamatan`);
            clearFieldError(`targetData.${targetIdx}.ownerDesa`);
        }, [clearFieldError]),

        // Stepper & UI
        currentStep, setCurrentStep, currentStepLabel, steps,
        formErrors, error, loading,
        statusModal, setStatusModal,
        statusModalOpen: statusModal.open,
        statusModalStatus: statusModal.status,
        statusModalTitle: statusModal.title,
        statusModalMessage: statusModal.message,
        handleCloseStatusModal: () => setStatusModal(prev => ({ ...prev, open: false })),

        // Handlers
        handleNextStep,
        handlePrevStep,
        handleSubmit,
        handleResetDraft: () => { },
        handleAddPreviousItem: useCallback(() => setPreviousData(prev => [...prev, createEmptyPreviousDataItem()]), []),
        handleRemovePreviousItem: useCallback((idx: number) => setPreviousData(prev => prev.filter((_, i) => i !== idx)), []),
        setPrimaryPreviousItem,
        getPrimaryNopDisplay,
    };
};

export default useEditApplication;
