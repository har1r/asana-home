import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, CheckCircle, Plus, ArrowLeft, RotateCcw, Layers, X } from 'lucide-react';

export interface FormFloatingDockProps {
    /** Status mounting komponen pada DOM client (Portal) */
    mounted: boolean;
    /** Status loading form */
    loading?: boolean;
    /** Tahapan langkah formulir saat ini (1-indexed) */
    currentStep: number;
    /** Total jumlah langkah dalam formulir */
    totalSteps: number;
    /** Label nama tahapan aktif saat ini (contoh: 'Data Utama', 'Data SPPT Lama', dll) */
    currentStepLabel?: string;
    /** Jenis permohonan yang dipilih (contoh: 'MUTASI_SEBAGIAN', 'MUTASI_PENGABUNGAN', dll) */
    applicationType?: string;
    /** Handler aksi kembali ke halaman utama / batal */
    onCancel: () => void;
    /** Handler aksi reset formulir (Reset Draf / Reset Perubahan) */
    onReset: () => void;
    /** Label tombol reset (Default: 'Reset Draf') */
    resetLabel?: string;
    /** Handler navigasi langkah sebelumnya */
    onPrevStep: (e: React.MouseEvent) => void;
    /** Handler navigasi langkah selanjutnya */
    onNextStep: (e: React.MouseEvent) => void;
    /** Handler submit akhir formulir (Ajukan / Simpan Perubahan) */
    onSubmit: (e: React.FormEvent) => void;
    /** Label tombol submit (Default: 'Ajukan') */
    submitLabel?: string;
    /** Handler opsional untuk menambah item SPPT Lama (Step 2) */
    onAddPreviousItem?: () => void;
    /** Handler opsional untuk menambah item Pemilik Baru (Step 3) */
    onAddTargetItem?: () => void;
}

export const FormFloatingDock: React.FC<FormFloatingDockProps> = React.memo(({
    mounted,
    loading = false,
    currentStep,
    totalSteps,
    currentStepLabel,
    applicationType,
    onCancel,
    onReset,
    resetLabel = 'Reset Draf',
    onPrevStep,
    onNextStep,
    onSubmit,
    submitLabel = 'Ajukan',
    onAddPreviousItem,
    onAddTargetItem,
}) => {
    const [speedDialOpen, setSpeedDialOpen] = useState(false);

    if (!mounted) return null;

    const isMergerMutation = applicationType === 'MERGER_MUTATION';
    const isPartialMutation = applicationType === 'PARTIAL_MUTATION';
    const isPreviousStep = currentStepLabel === 'Data SPPT Lama' || currentStepLabel === 'Data Lama (Asal)' || currentStep === 2;
    const isTargetStep = currentStepLabel === 'Data SPPT Baru' || currentStepLabel === 'Data Baru' || currentStep === 3;
    const isResetWarning = resetLabel.toLowerCase().includes('perubahan');

    return createPortal(
        <>
            {/* Backdrop Click Outside */}
            {speedDialOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/10 backdrop-blur-[1px] animate-fadeIn cursor-pointer"
                    onClick={() => setSpeedDialOpen(false)}
                />
            )}

            {/* Container Floating Speed Dial */}
            <div className="fixed right-4 bottom-8 z-50 flex flex-col items-end gap-3 font-sans select-none pointer-events-none">
                {/* Expanded Action Buttons */}
                <div
                    className={`flex flex-col items-end gap-2.5 transition-all duration-300 transform origin-bottom-right ${speedDialOpen
                        ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                        : 'opacity-0 scale-95 translate-y-4 pointer-events-none hidden'
                        }`}
                >
                    {/* Tombol Kembali */}
                    <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); setSpeedDialOpen(false); onCancel(); }}
                        disabled={loading}
                        className="group h-8 px-3.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 hover:border-slate-300 shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95 text-xs font-medium"
                        title="Kembali ke Halaman Utama"
                    >
                        <ArrowLeft className="w-4 h-4 stroke-[2.5] text-slate-600 shrink-0" />
                        <span className="whitespace-nowrap pr-0.5">Kembali</span>
                    </button>

                    {/* Tombol Reset */}
                    <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); setSpeedDialOpen(false); onReset(); }}
                        disabled={loading}
                        className={`group h-8 px-3.5 rounded-full bg-white border shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95 text-xs font-medium ${isResetWarning
                            ? 'hover:bg-amber-50 text-amber-700 border-amber-200/80 hover:border-amber-300'
                            : 'hover:bg-red-50 text-red-600 border-red-200/80 hover:border-red-300'
                            }`}
                        title={resetLabel}
                    >
                        <RotateCcw className={`w-3.5 h-3.5 stroke-[2.5] shrink-0 ${isResetWarning ? 'text-amber-600' : 'text-red-500'}`} />
                        <span className="whitespace-nowrap pr-0.5">{resetLabel}</span>
                    </button>

                    {/* Tombol Langkah Sebelumnya */}
                    {currentStep > 1 && (
                        <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); setSpeedDialOpen(false); onPrevStep(e); }}
                            disabled={loading}
                            className="group h-8 px-3.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 hover:border-slate-300 shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95 text-xs font-medium"
                            title="Kembali ke langkah sebelumnya"
                        >
                            <ChevronLeft className="w-4 h-4 stroke-[2.5] text-slate-600 shrink-0" />
                            <span className="whitespace-nowrap pr-0.5">Sebelumnya</span>
                        </button>
                    )}

                    {/* Tombol Tambah SPPT Lama (Step 2 & MERGER_MUTATION) */}
                    {isPreviousStep && isMergerMutation && onAddPreviousItem && (
                        <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); setSpeedDialOpen(false); onAddPreviousItem(); }}
                            disabled={loading}
                            className="group h-8 px-3.5 rounded-full bg-[#00a389] hover:bg-[#008f78] text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95 text-xs font-semibold"
                            title="Tambah SPPT Lama"
                        >
                            <Plus className="w-4 h-4 stroke-[2.5] shrink-0" />
                            <span className="whitespace-nowrap pr-0.5">Tambah SPPT Lama</span>
                        </button>
                    )}

                    {/* Tombol Tambah Pemilik Baru (Step 3 & PARTIAL_MUTATION) */}
                    {isTargetStep && isPartialMutation && onAddTargetItem && (
                        <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); setSpeedDialOpen(false); onAddTargetItem(); }}
                            disabled={loading}
                            className="group h-8 px-3.5 rounded-full bg-[#00a389] hover:bg-[#008f78] text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95 text-xs font-semibold"
                            title="Tambah Pemilik Baru"
                        >
                            <Plus className="w-4 h-4 stroke-[2.5] shrink-0" />
                            <span className="whitespace-nowrap pr-0.5">Tambah Pemilik Baru</span>
                        </button>
                    )}

                    {/* Tombol Selanjutnya / Submit (Ajukan / Simpan Perubahan) */}
                    {!applicationType || currentStep < totalSteps ? (
                        <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); setSpeedDialOpen(false); onNextStep(e); }}
                            disabled={loading}
                            className="group h-8 px-3.5 rounded-full bg-[#00a389] hover:bg-[#008f78] text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95 text-xs font-semibold"
                            title="Lanjut ke langkah berikutnya"
                        >
                            <ChevronRight className="w-4 h-4 stroke-[2.5] shrink-0" />
                            <span className="whitespace-nowrap pr-0.5">Selanjutnya</span>
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); setSpeedDialOpen(false); onSubmit(e as any); }}
                            disabled={loading}
                            className="group h-8 px-3.5 rounded-full bg-[#00a389] hover:bg-[#008f78] text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95 text-xs font-semibold"
                            title={submitLabel}
                        >
                            <CheckCircle className="w-4 h-4 stroke-[2.2] shrink-0" />
                            <span className="whitespace-nowrap pr-0.5">{submitLabel}</span>
                        </button>
                    )}
                </div>

                {/* Master FAB Trigger Button */}
                <button
                    type="button"
                    onClick={() => setSpeedDialOpen(prev => !prev)}
                    className={`pointer-events-auto h-8 w-8 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center cursor-pointer active:scale-95 ${speedDialOpen
                        ? 'bg-slate-800 hover:bg-slate-900 text-white rotate-90 scale-105'
                        : 'bg-[#00a389] hover:bg-[#008f78] text-white hover:scale-105'
                        }`}
                    title={speedDialOpen ? 'Tutup Menu' : 'Menu Aksi Cepat'}
                >
                    {speedDialOpen ? (
                        <X className="w-5 h-5 stroke-[2.5]" />
                    ) : (
                        <Layers className="w-5 h-5 stroke-[2.2]" />
                    )}
                </button>
            </div>
        </>,
        document.body
    );
});

FormFloatingDock.displayName = 'FormFloatingDock';
