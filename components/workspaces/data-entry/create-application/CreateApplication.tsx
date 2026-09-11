"use client";

import React from 'react';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { ActionStatusModal } from '../../shared/ActionStatusModal';
import { FormFloatingDock } from '../../shared/FormFloatingDock';
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

/** Helper styling class input text (Digunakan pada JSX baris: 67 [<StepMainData>], 83 [<StepPreviousData>], & 103 [<StepTargetData>]) */
const getInputClass = (hasError?: boolean, extraClass: string = '') => {
    const stateClass = hasError
        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
        : 'border-slate-200/90 focus:border-[#00a389] focus:ring-[#00a389]/10';
    return `w-full bg-white border ${stateClass} rounded-md px-3.5 py-2.5 text-[13px] font-normal text-slate-900 focus:outline-none focus:ring-2 transition-all font-sans ${extraClass}`.trim();
};

/** Helper styling class container WhatsApp (Digunakan pada JSX baris: 84 [<StepPreviousData>] & 104 [<StepTargetData>]) */
const getWhatsAppContainerClass = (hasError?: boolean) => {
    const stateClass = hasError
        ? 'border-red-500 focus-within:border-red-500 focus-within:ring-red-500/10'
        : 'border-slate-200/90 focus-within:border-[#00a389] focus-within:ring-[#00a389]/10';
    return `flex items-center bg-white border ${stateClass} rounded-md overflow-hidden transition-all focus-within:ring-2 font-sans`.trim();
};

export const CreateApplication: React.FC<CreateApplicationProps> = React.memo(({ onSuccess, onCancel, initialData }) => {
    /** Hook utama pengelolaan formulir permohonan */
    const form = useCreateApplication({ onSuccess, onCancel, initialData });

    return (
        <div className="w-full bg-transparent animate-fadeIn font-sans">
            <h2 className="text-base font-semibold text-slate-600 mb-4">Pengajuan Permohonan</h2>

            {/* Component StepHeader: Progress bar tahapan formulir */}
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

            {/* Container Formulir Utama */}
            <form onSubmit={form.handleCreate} className="flex flex-col gap-6" autoComplete="off">
                {/* Step 1: Data Utama Permohonan */}
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

                {/* Step 2: Data SPPT Lama */}
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

                {/* Step 3: Data SPPT Baru */}
                {(form.currentStepLabel === 'Data SPPT Baru' || form.currentStepLabel === 'Data Baru') && form.needTargetData && (
                    <StepTargetData
                        applicationType={form.applicationType}
                        targetData={form.targetData}
                        onAddTargetItem={form.handleAddTargetItem}
                        onRemoveTargetItem={form.handleRemoveTargetItem}
                        onTargetItemChange={form.handleTargetItemChange}
                        onCopyOwnerFromPrevious={form.handleCopyOwnerFromPrevious}
                        onCopyObjectFromPrevious={form.handleCopyObjectFromPrevious}
                        onCopyOwnerToObject={form.handleCopyOwnerToObject}
                        needPreviousData={form.needPreviousData}
                        previousData={form.previousData}
                        formErrors={form.formErrors}
                        loading={form.loading}
                        getInputClass={getInputClass}
                        getWhatsAppContainerClass={getWhatsAppContainerClass}
                        getPrimaryNopDisplay={form.getPrimaryNopDisplay}
                    />
                )}

                {/* Baris Tombol Navigasi Bawah */}
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

                    {!form.applicationType || form.currentStep < form.steps.length ? (
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

            {/* Modal Status Aksi */}
            <ActionStatusModal
                isOpen={form.statusModalOpen}
                status={form.statusModalStatus}
                title={form.statusModalTitle}
                message={form.statusModalMessage}
                onClose={form.handleCloseStatusModal}
            />

            {/* Floating Dock Navigation Component */}
            <FormFloatingDock
                mounted={form.mounted}
                loading={form.loading}
                currentStep={form.currentStep}
                totalSteps={form.steps.length}
                currentStepLabel={form.currentStepLabel}
                applicationType={form.applicationType}
                onCancel={onCancel}
                onReset={form.handleResetDraft}
                resetLabel="Reset Draf"
                onPrevStep={form.handlePrevStep}
                onNextStep={form.handleNextStep}
                onSubmit={(e) => form.handleCreate(e as any)}
                submitLabel="Ajukan"
                onAddPreviousItem={form.handleAddPreviousItem}
                onAddTargetItem={form.handleAddTargetItem}
            />

            {/* Modal Pemberitahuan Draf (Standardized ActionStatusModal) */}
            <ActionStatusModal
                isOpen={form.draftModalOpen}
                status="success"
                title="Pemberitahuan Draf"
                message={form.draftModalMessage}
                confirmText="Mengerti"
                onClose={() => form.setDraftModalOpen(false)}
            />
        </div>
    );
});

CreateApplication.displayName = 'CreateApplication';
