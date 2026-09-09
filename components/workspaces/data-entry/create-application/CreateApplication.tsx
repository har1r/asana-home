"use client";

import React from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, CheckCircle, Plus, ArrowLeft, RotateCcw, Layers, X } from 'lucide-react';
import { ActionStatusModal } from '../../shared/ActionStatusModal';
import { useCreateApplication } from './useCreateApplication';
import { StepHeader } from '../form-application/StepHeader';
import { StepMainData } from '../form-application/StepMainData';
import { StepPreviousData } from '../form-application/StepPreviousData';
import { StepTargetData } from '../form-application/StepTargetData';

interface CreateApplicationProps {
    onSuccess: () => void;
    onCancel: () => void;
    initialData?: any;
}

// Helper Style Kelas Input
const getInputClass = (hasError?: boolean, extraClass: string = '') => {
    const stateClass = hasError
        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
        : 'border-slate-200/90 focus:border-[#00a389] focus:ring-[#00a389]/10';
    return `w-full bg-white border ${stateClass} rounded-md px-3.5 py-2.5 text-[13px] font-normal text-slate-900 focus:outline-none focus:ring-2 transition-all font-sans ${extraClass}`.trim();
};

// Helper Style Container WhatsApp
const getWhatsAppContainerClass = (hasError?: boolean) => {
    const stateClass = hasError
        ? 'border-red-500 focus-within:border-red-500 focus-within:ring-red-500/10'
        : 'border-slate-200/90 focus-within:border-[#00a389] focus-within:ring-[#00a389]/10';
    return `flex items-center bg-white border ${stateClass} rounded-md overflow-hidden transition-all focus-within:ring-2 font-sans`.trim();
};

export const CreateApplication: React.FC<CreateApplicationProps> = React.memo(({ onSuccess, onCancel, initialData }) => {
    // [1] HOOK LOGIKA CREATE APPLICATION
    const form = useCreateApplication({ onSuccess, onCancel, initialData });
    const [speedDialOpen, setSpeedDialOpen] = React.useState(false);

    return (
        <div className="w-full bg-transparent animate-fadeIn font-sans">
            <h2 className="text-base font-semibold text-slate-600 mb-4">Pengajuan Permohonan</h2>
            {/* [2] STEPHEADER CARD MANDIRI */}
            <div className="w-full bg-white rounded-md border border-slate-200/90 shadow-xs overflow-hidden mb-6">
                <StepHeader
                    onCancel={onCancel}
                    onResetDraft={form.handleResetDraft}
                    loading={form.loading}
                    steps={form.steps}
                    currentStep={form.currentStep}
                    setCurrentStep={form.setCurrentStep}
                />
            </div>

            {/* [3] FORMULIR UTAMA */}
            <form onSubmit={form.handleCreate} className="flex flex-col gap-6" autoComplete="off">
                {/* STEP 1: STEPMAINDATA (Data Utama Permohonan) */}
                {form.currentStepLabel === 'Data Utama' && (
                    <div className="w-full bg-white rounded-md border border-slate-200/90 shadow-xs p-6 sm:p-8">
                        <StepMainData
                            applicationType={form.applicationType}
                            onApplicationTypeChange={form.handleApplicationTypeChange}
                            applicationNumber={form.applicationNumber}
                            onApplicationNumberChange={form.setApplicationNumber}
                            serviceNumberDate={form.serviceNumberDate}
                            onServiceNumberDateChange={form.setServiceNumberDate}
                            completionDate={form.completionDate}
                            formErrors={form.formErrors}
                            loading={form.loading}
                            getInputClass={getInputClass}
                        />
                    </div>
                )}

                {/* STEP 2: STEPPREVIOUSDATA (Data SPPT Lama) */}
                {(form.currentStepLabel === 'Data SPPT Lama' || form.currentStepLabel === 'Data Lama (Asal)') && form.needPreviousData && (
                    <StepPreviousData
                        applicationType={form.applicationType}
                        previousData={form.previousData}
                        onAddPreviousItem={form.handleAddPreviousItem}
                        onRemovePreviousItem={form.handleRemovePreviousItem}
                        onPreviousItemChange={form.handlePreviousItemChange}
                        onSetPrimaryPreviousItem={form.setPrimaryPreviousItem}
                        formErrors={form.formErrors}
                        loading={form.loading}
                        getInputClass={getInputClass}
                        getWhatsAppContainerClass={getWhatsAppContainerClass}
                    />
                )}

                {/* STEP 3: STEPTARGETDATA (Data SPPT Baru) */}
                {(form.currentStepLabel === 'Data SPPT Baru' || form.currentStepLabel === 'Data Baru') && form.needTargetData && (
                    <StepTargetData
                        applicationType={form.applicationType}
                        targetData={form.targetData}
                        onAddTargetItem={form.handleAddTargetItem}
                        onRemoveTargetItem={form.handleRemoveTargetItem}
                        onTargetItemChange={form.handleTargetItemChange}
                        onCopyOwnerFromPrevious={form.handleCopyOwnerFromPrevious}
                        onCopyObjectFromPrevious={form.handleCopyObjectFromPrevious}
                        onCopyObjectToOwner={form.handleCopyObjectToOwner}
                        needPreviousData={form.needPreviousData}
                        previousData={form.previousData}
                        formErrors={form.formErrors}
                        loading={form.loading}
                        getInputClass={getInputClass}
                        getWhatsAppContainerClass={getWhatsAppContainerClass}
                        getPrimaryNopDisplay={form.getPrimaryNopDisplay}
                    />
                )}

                {/* NAVIGASI TOMBOL (SEBELUMNYA / SELANJUTNYA / AJUKAN) */}
                <div className="w-full bg-white rounded-md border border-slate-200/90 shadow-xs p-4 sm:px-6 flex items-center justify-between select-none">
                    {form.currentStep > 1 ? (
                        <button
                            type="button"
                            onClick={form.handlePrevStep}
                            disabled={form.loading}
                            className="h-10 px-4 rounded-md border border-slate-200/90 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-normal text-[13px] font-sans transition-all cursor-pointer shadow-3xs flex items-center gap-1.5 disabled:opacity-50"
                        >
                            <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                            <span>Sebelumnya</span>
                        </button>
                    ) : (
                        <div />
                    )}

                    {form.currentStep < form.steps.length ? (
                        <button
                            type="button"
                            onClick={form.handleNextStep}
                            disabled={form.loading}
                            className="h-10 px-6 rounded-md bg-[#00a389] hover:bg-[#008f78] active:scale-95 text-white font-normal text-[13px] font-sans shadow-xs transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                        >
                            <span>Selanjutnya</span>
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={form.loading}
                            className="h-10 px-6 rounded-md bg-[#00a389] hover:bg-[#008f78] active:scale-95 text-white font-normal text-[13px] font-sans shadow-xs transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                        >
                            <CheckCircle className="w-4 h-4" />
                            <span>Ajukan</span>
                        </button>
                    )}
                </div>
            </form>

            <ActionStatusModal
                isOpen={form.statusModalOpen}
                status={form.statusModalStatus}
                title={form.statusModalTitle}
                message={form.statusModalMessage}
                onClose={form.handleCloseStatusModal}
            />

            {/* [4] FLOATING STICKY SPEED DIAL MENU (KANAN TENGAH LAYAR) */}
            {form.mounted && createPortal(
                <>
                    {/* BACKDROP CLICK OUTSIDE */}
                    {speedDialOpen && (
                        <div
                            className="fixed inset-0 z-40 bg-slate-900/10 backdrop-blur-[1px] animate-fadeIn cursor-pointer"
                            onClick={() => setSpeedDialOpen(false)}
                        />
                    )}

                    <div className="fixed right-5 top-1/2 -translate-y-1/2 z-50 flex flex-col items-end gap-3 font-sans select-none pointer-events-none">
                        {/* EXPANDED MENU ITEMS */}
                        <div
                            className={`flex flex-col items-end gap-2.5 transition-all duration-300 transform origin-bottom-right ${
                                speedDialOpen
                                    ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                                    : 'opacity-0 scale-95 translate-y-4 pointer-events-none hidden'
                            }`}
                        >
                            {/* TOMBOL KEMBALI KE HALAMAN UTAMA / BATAL */}
                            <button
                                type="button"
                                onClick={() => { setSpeedDialOpen(false); onCancel(); }}
                                disabled={form.loading}
                                className="group h-10 px-3.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 hover:border-slate-300 shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
                                title="Kembali ke Halaman Utama"
                            >
                                <ArrowLeft className="w-4 h-4 stroke-[2.5] text-slate-600 shrink-0" />
                                <span className="text-xs font-medium text-slate-700 whitespace-nowrap pr-0.5">
                                    Kembali
                                </span>
                            </button>

                            {/* TOMBOL RESET DRAF */}
                            <button
                                type="button"
                                onClick={() => { setSpeedDialOpen(false); form.handleResetDraft(); }}
                                disabled={form.loading}
                                className="group h-10 px-3.5 rounded-full bg-white hover:bg-red-50 text-red-600 border border-red-200/80 hover:border-red-300 shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
                                title="Reset Draf Form"
                            >
                                <RotateCcw className="w-3.5 h-3.5 stroke-[2.5] text-red-500 shrink-0" />
                                <span className="text-xs font-medium text-red-600 whitespace-nowrap pr-0.5">
                                    Reset Draf
                                </span>
                            </button>

                            {/* TOMBOL LANGKAH SEBELUMNYA */}
                            {form.currentStep > 1 && (
                                <button
                                    type="button"
                                    onClick={(e) => { setSpeedDialOpen(false); form.handlePrevStep(e); }}
                                    disabled={form.loading}
                                    className="group h-10 px-3.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 hover:border-slate-300 shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
                                    title="Kembali ke langkah sebelumnya"
                                >
                                    <ChevronLeft className="w-4 h-4 stroke-[2.5] text-slate-600 shrink-0" />
                                    <span className="text-xs font-medium text-slate-700 whitespace-nowrap pr-0.5">
                                        Sebelumnya
                                    </span>
                                </button>
                            )}

                            {/* TOMBOL TAMBAH SPPT LAMA (STEP 2 & MERGER_MUTATION) */}
                            {(form.currentStep === 2 || form.currentStepLabel === 'Data SPPT Lama' || form.currentStepLabel === 'Data Lama (Asal)') && form.applicationType === 'MERGER_MUTATION' && (
                                <button
                                    type="button"
                                    onClick={() => { setSpeedDialOpen(false); form.handleAddPreviousItem(); }}
                                    disabled={form.loading}
                                    className="group h-10 px-3.5 rounded-full bg-[#00a389] hover:bg-[#008f78] text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
                                    title="Tambah SPPT Lama"
                                >
                                    <Plus className="w-4 h-4 stroke-[2.5] shrink-0" />
                                    <span className="text-xs font-semibold text-white whitespace-nowrap pr-0.5">
                                        Tambah SPPT Lama
                                    </span>
                                </button>
                            )}

                            {/* TOMBOL TAMBAH PEMILIK BARU (STEP 3 & PARTIAL_MUTATION) */}
                            {(form.currentStep === 3 || form.currentStepLabel === 'Data SPPT Baru' || form.currentStepLabel === 'Data Baru') && form.applicationType === 'PARTIAL_MUTATION' && (
                                <button
                                    type="button"
                                    onClick={() => { setSpeedDialOpen(false); form.handleAddTargetItem(); }}
                                    disabled={form.loading}
                                    className="group h-10 px-3.5 rounded-full bg-[#00a389] hover:bg-[#008f78] text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
                                    title="Tambah Pemilik Baru"
                                >
                                    <Plus className="w-4 h-4 stroke-[2.5] shrink-0" />
                                    <span className="text-xs font-semibold text-white whitespace-nowrap pr-0.5">
                                        Tambah Pemilik Baru
                                    </span>
                                </button>
                            )}

                            {/* TOMBOL SELANJUTNYA / AJUKAN */}
                            {form.currentStep < form.steps.length ? (
                                <button
                                    type="button"
                                    onClick={(e) => { setSpeedDialOpen(false); form.handleNextStep(e); }}
                                    disabled={form.loading}
                                    className="group h-10 px-3.5 rounded-full bg-[#00a389] hover:bg-[#008f78] text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
                                    title="Lanjut ke langkah berikutnya"
                                >
                                    <ChevronRight className="w-4 h-4 stroke-[2.5] shrink-0" />
                                    <span className="text-xs font-semibold text-white whitespace-nowrap pr-0.5">
                                        Selanjutnya
                                    </span>
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={(e) => { setSpeedDialOpen(false); form.handleCreate(e as any); }}
                                    disabled={form.loading}
                                    className="group h-10 px-3.5 rounded-full bg-[#00a389] hover:bg-[#008f78] text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
                                    title="Ajukan Permohonan"
                                >
                                    <CheckCircle className="w-4 h-4 stroke-[2.2] shrink-0" />
                                    <span className="text-xs font-semibold text-white whitespace-nowrap pr-0.5">
                                        Ajukan
                                    </span>
                                </button>
                            )}
                        </div>

                        {/* MASTER TRIGGER FAB BUTTON */}
                        <button
                            type="button"
                            onClick={() => setSpeedDialOpen(prev => !prev)}
                            className={`pointer-events-auto h-12 w-12 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center cursor-pointer active:scale-95 ${
                                speedDialOpen
                                    ? 'bg-slate-800 hover:bg-slate-900 text-white rotate-90 scale-105'
                                    : 'bg-[#00a389] hover:bg-[#008f78] text-white hover:scale-105'
                            }`}
                            title={speedDialOpen ? 'Tutup Menu' : 'Menu Aksi Cepat'}
                        >
                            {speedDialOpen ? (
                                <X className="w-6 h-6 stroke-[2.5]" />
                            ) : (
                                <Layers className="w-6 h-6 stroke-[2.2]" />
                            )}
                        </button>
                    </div>
                </>,
                document.body
            )}

            {form.mounted && form.draftModalOpen && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn select-none">
                    <div className="fixed inset-0" onClick={() => form.setDraftModalOpen(false)} />
                    <div className="relative w-full max-w-sm bg-white rounded-md p-6 shadow-2xl border border-slate-200/80 flex flex-col items-center text-center gap-4 z-10 transform transition-all animate-scaleUp font-sans">
                        {/* Centered Top Icon */}
                        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 text-[#00a389]">
                            <CheckCircle className="w-10 h-10 stroke-[2.2]" />
                        </div>

                        {/* Centered Text Content */}
                        <div className="flex flex-col gap-1.5 mt-1">
                            <h3 className="text-base font-extrabold text-slate-800 tracking-tight">Pemberitahuan Draf</h3>
                            <p className="text-xs font-semibold text-slate-500 leading-relaxed max-w-[280px]">
                                {form.draftModalMessage}
                            </p>
                        </div>

                        {/* Action Button */}
                        <button
                            type="button"
                            onClick={() => form.setDraftModalOpen(false)}
                            className="mt-2 w-full py-2.5 bg-[#00a389] hover:bg-[#008f78] active:scale-95 text-white font-bold text-xs rounded-md shadow-xs transition-all cursor-pointer font-sans"
                        >
                            Mengerti
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
});

CreateApplication.displayName = 'CreateApplication';
