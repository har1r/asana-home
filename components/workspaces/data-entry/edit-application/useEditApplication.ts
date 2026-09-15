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

export const getPrimaryNopDisplay = (previousData: any[], applicationType?: string): string => {
    const primaryItem = (previousData || []).find(item => item && item.isPrimary) || (previousData || [])[0] || {};
    const rawNop = (primaryItem.nop || '').replace(/[^\d]/g, '');

    if (!rawNop) return '36.19.XXX.XXX.XXX-XXXX.X';

    // Format raw NOP dynamically with dots and hyphen
    let fullFmtNop = rawNop;
    if (rawNop.length > 2) fullFmtNop = rawNop.slice(0, 2) + '.' + rawNop.slice(2);
    if (rawNop.length > 4) fullFmtNop = rawNop.slice(0, 2) + '.' + rawNop.slice(2, 4) + '.' + rawNop.slice(4);
    if (rawNop.length > 7) fullFmtNop = rawNop.slice(0, 2) + '.' + rawNop.slice(2, 4) + '.' + rawNop.slice(4, 7) + '.' + rawNop.slice(7);
    if (rawNop.length > 10) fullFmtNop = rawNop.slice(0, 2) + '.' + rawNop.slice(2, 4) + '.' + rawNop.slice(4, 7) + '.' + rawNop.slice(7, 10) + '.' + rawNop.slice(10);
    if (rawNop.length > 13) fullFmtNop = rawNop.slice(0, 2) + '.' + rawNop.slice(2, 4) + '.' + rawNop.slice(4, 7) + '.' + rawNop.slice(7, 10) + '.' + rawNop.slice(10, 13) + '-' + rawNop.slice(13);
    if (rawNop.length > 17) fullFmtNop = rawNop.slice(0, 2) + '.' + rawNop.slice(2, 4) + '.' + rawNop.slice(4, 7) + '.' + rawNop.slice(7, 10) + '.' + rawNop.slice(10, 13) + '-' + rawNop.slice(13, 17) + '.' + rawNop.slice(17, 18);

    // JIKA PEMBETULAN (CORRECTION) ATAU MUTASI HABIS: PREFILL MURNI 100% NOP LAMA
    if (applicationType === 'CORRECTION' || applicationType === 'EXPIRED_UPDATE' || applicationType === 'EXPIRED_REGULAR') {
        return fullFmtNop;
    }

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

export const parseEditTargetData = (editTarget: any) => {
    if (!editTarget) return {
        applicationType: '',
        applicationNumber: '',
        serviceNumberDate: '',
        completionDate: '',
        previousData: [],
        targetData: []
    };

    const appType = editTarget.applicationType || editTarget.jenisPermohonan || '';
    const appNumber = (editTarget.applicationNumber || editTarget.nomorPelayanan || '').toUpperCase();

    const rawDate = editTarget.serviceNumberDate || editTarget.tanggalNoPelayanan;
    const dateObj = rawDate ? new Date(rawDate) : null;
    const srvDate = dateObj && !isNaN(dateObj.getTime()) ? dateObj.toISOString().split('T')[0] : '';

    const rawSelesaiDate = editTarget.completionDate || editTarget.tanggalPenyelesaian;
    const selesaiObj = rawSelesaiDate ? new Date(rawSelesaiDate) : null;
    const compDate = selesaiObj && !isNaN(selesaiObj.getTime()) ? selesaiObj.toISOString().split('T')[0] : '';

    const needsPrev = SERVICES_NEED_PREVIOUS_DATA.includes(appType);
    const needsTgt = SERVICES_NEED_TARGET_DATA.includes(appType);

    let parsedPrev: any[] = [];
    if (!needsPrev) {
        parsedPrev = [];
    } else if (editTarget.previousData && Array.isArray(editTarget.previousData) && editTarget.previousData.length > 0) {
        parsedPrev = editTarget.previousData.map((item: any, i: number) => ({
            ...createEmptyPreviousDataItem(),
            isPrimary: i === 0,
            ...(item || {}),
            nop: item.nop ? formatNop(item.nop) : ''
        }));
    } else if (editTarget.nop || editTarget.namaPemilikLama) {
        parsedPrev = [{
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
            landArea: editTarget.luasTanahLama ?? 0,
            buildingArea: editTarget.luasBangunanLama ?? 0,
            certificate: editTarget.sertifikatLama || ''
        }];
    } else {
        parsedPrev = [createEmptyPreviousDataItem()];
    }

    let parsedTgt: any[] = [];
    if (!needsTgt) {
        parsedTgt = [];
    } else if (editTarget.targetData && Array.isArray(editTarget.targetData) && editTarget.targetData.length > 0) {
        parsedTgt = editTarget.targetData.map((item: any) => ({
            ...createEmptyTargetDataItem(),
            ...(item || {}),
            nopTemporary: item.nopTemporary ? formatNop(item.nopTemporary) : ''
        }));
    } else if (editTarget.dataBaru && Array.isArray(editTarget.dataBaru)) {
        parsedTgt = editTarget.dataBaru.map((item: any) => ({
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
            objectAddress: item.objectAddress || '',
            objectBlock: item.objectBlock || '',
            objectRt: item.objectRt || '',
            objectRw: item.objectRw || '',
            objectKecamatan: item.objectKecamatan || '',
            objectDesa: item.desaObjekBaru || '',
            landArea: item.luasTanahBaru ?? 0,
            buildingArea: item.luasBangunanBaru ?? 0,
            certificate: item.sertifikatBaru || ''
        }));
    } else {
        parsedTgt = [createEmptyTargetDataItem()];
    }

    return {
        applicationType: appType,
        applicationNumber: appNumber,
        serviceNumberDate: srvDate,
        completionDate: compDate,
        previousData: parsedPrev,
        targetData: parsedTgt
    };
};

export const useEditApplication = ({ editTarget, onSuccess, onCancel }: UseEditApplicationOptions) => {
    const initialParsed = useMemo(() => parseEditTargetData(editTarget), [editTarget]);

    const [applicationType, setApplicationType] = useState<string>(() => initialParsed.applicationType);
    const [applicationNumber, setApplicationNumber] = useState(() => initialParsed.applicationNumber);
    const [serviceNumberDate, setServiceNumberDate] = useState(() => initialParsed.serviceNumberDate);
    const [completionDate, setCompletionDate] = useState(() => initialParsed.completionDate);
    const [previousData, setPreviousData] = useState<any[]>(() => initialParsed.previousData);
    const [targetData, setTargetData] = useState<any[]>(() => initialParsed.targetData);

    const [currentStep, setCurrentStep] = useState(1);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [statusModal, setStatusModal] = useState({ open: false, status: 'idle' as 'idle' | 'loading' | 'success' | 'error', title: '', message: '' });
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    // SINKRONISASI DATA EDIT TARGET KE STATE FORM SAAT EDIT TARGET BERUBAH
    const syncDataFromEditTarget = useCallback(() => {
        const parsed = parseEditTargetData(editTarget);
        setApplicationType(parsed.applicationType);
        setApplicationNumber(parsed.applicationNumber);
        setServiceNumberDate(parsed.serviceNumberDate);
        setCompletionDate(parsed.completionDate);
        setPreviousData(parsed.previousData);
        setTargetData(parsed.targetData);
    }, [editTarget]);

    useEffect(() => {
        syncDataFromEditTarget();
    }, [syncDataFromEditTarget]);

    const handleResetChanges = useCallback(() => {
        syncDataFromEditTarget();
        setFormErrors({});
        setError('');
        setCurrentStep(1);
        setStatusModal({ open: true, status: 'success', title: 'Perubahan Dibatalkan', message: 'Isian form dikembalikan ke data awal semula.' });
    }, [syncDataFromEditTarget]);

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

    // Auto-clean data fields when service type changes (e.g. REACTIVATION has no targetData, NEW_TAX_OBJECT has no previousData)
    useEffect(() => {
        if (!applicationType) return;

        if (!needPreviousData) {
            setPreviousData([]);
        } else if (previousData.length === 0) {
            setPreviousData([createEmptyPreviousDataItem()]);
        }

        if (!needTargetData) {
            setTargetData([]);
        } else if (needTargetData && targetData.length === 0) {
            setTargetData([createEmptyTargetDataItem()]);
        }
    }, [applicationType, needPreviousData, needTargetData]);

    useEffect(() => {
        if (applicationType === 'NEW_TAX_OBJECT' || !needPreviousData || !needTargetData) return;

        const defaultNopTemp = getPrimaryNopDisplay(previousData, applicationType);

        setTargetData(prevTargets => {
            let hasChange = false;
            const updated = prevTargets.map(item => {
                if (item.nopTemporary !== defaultNopTemp) {
                    hasChange = true;
                    return { ...item, nopTemporary: defaultNopTemp };
                }
                return item;
            });
            return hasChange ? updated : prevTargets;
        });
    }, [previousData, applicationType, needPreviousData, needTargetData]);

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
            let targetStepIndex = 1;
            if (firstKey.includes('previousData')) {
                const idx = steps.findIndex(s => s.label === 'Data SPPT Lama');
                if (idx !== -1) targetStepIndex = idx + 1;
            } else if (firstKey.includes('targetData')) {
                const idx = steps.findIndex(s => s.label === 'Data SPPT Baru');
                if (idx !== -1) targetStepIndex = idx + 1;
            } else {
                targetStepIndex = 1;
            }
            setCurrentStep(targetStepIndex);

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

        handleCopyOwnerToObject: useCallback((targetIdx: number) => {
            setTargetData(prevTargets => prevTargets.map((item, i) => i === targetIdx ? {
                ...item,
                objectAddress: item.ownerAddress || '',
                objectBlock: item.ownerBlock || '',
                objectRt: item.ownerRt || '',
                objectRw: item.ownerRw || '',
                objectKecamatan: item.ownerKecamatan || '',
                objectDesa: item.ownerDesa || '',
            } : item));
            clearFieldError(`targetData.${targetIdx}.objectAddress`);
            clearFieldError(`targetData.${targetIdx}.objectKecamatan`);
            clearFieldError(`targetData.${targetIdx}.objectDesa`);
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
        mounted,

        // Handlers
        handleNextStep,
        handlePrevStep,
        handleSubmit,
        handleResetDraft: handleResetChanges,
        handleResetChanges,
        handleAddPreviousItem: useCallback(() => setPreviousData(prev => [...prev, createEmptyPreviousDataItem()]), []),
        handleRemovePreviousItem: useCallback((idx: number) => setPreviousData(prev => prev.filter((_, i) => i !== idx)), []),
        setPrimaryPreviousItem,
        getPrimaryNopDisplay,
    };
};

export default useEditApplication;
