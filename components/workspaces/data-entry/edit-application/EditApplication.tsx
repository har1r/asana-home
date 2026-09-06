"use client";

import React from 'react';
import { ChevronLeft, CheckCircle, AlertTriangle } from 'lucide-react';
import { ActionStatusModal } from '../../shared/ActionStatusModal';
import { useEditApplication } from './useEditApplication';
import { StepHeader } from '../form-application/StepHeader';
import { StepMainData } from '../form-application/StepMainData';
import { StepPreviousData } from '../form-application/StepPreviousData';
import { StepTargetData } from '../form-application/StepTargetData';

interface EditApplicationProps {
    editTarget: any;
    onCancel: () => void;
    onSuccess: () => void;
}

const getInputClass = (hasError?: boolean, extraClass: string = '') => {
    const stateClass = hasError
        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
        : 'border-slate-200/90 focus:border-[#00a389] focus:ring-[#00a389]/10';
    return `w-full bg-white border ${stateClass} rounded-md px-3.5 py-2.5 text-[13px] font-normal text-slate-900 focus:outline-none focus:ring-2 transition-all font-sans ${extraClass}`.trim();
};

const getWhatsAppContainerClass = (hasError?: boolean) => {
    const stateClass = hasError
        ? 'border-red-500 focus-within:border-red-500 focus-within:ring-red-500/10'
        : 'border-slate-200/90 focus-within:border-[#00a389] focus-within:ring-[#00a389]/10';
    return `flex items-center bg-white border ${stateClass} rounded-md overflow-hidden transition-all focus-within:ring-2 font-sans`.trim();
};

export const EditApplication: React.FC<EditApplicationProps> = React.memo(({ editTarget, onCancel, onSuccess }) => {
    const form = useEditApplication({ editTarget, onSuccess, onCancel });

    if (!editTarget) return null;

    return (
        <div className="w-full bg-transparent animate-fadeIn font-sans">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-slate-700">
                    Edit Permohonan <span className="text-[#008f78] font-mono">#{form.applicationNumber || editTarget.nomorPelayanan}</span>
                </h2>
            </div>

            <div className="w-full bg-white rounded-md border border-slate-200/90 shadow-xs flex flex-col overflow-hidden">
                {/* STEP HEADER */}
                <StepHeader
                    onCancel={onCancel}
                    onResetDraft={() => { }}
                    loading={form.loading}
                    steps={form.steps}
                    currentStep={form.currentStep}
                    setCurrentStep={form.setCurrentStep}
                />

                <div className="p-6 sm:p-8 flex flex-col gap-6">
                    {form.error && (
                        <div className="bg-red-50/80 border border-red-200/65 text-red-750 text-xs font-bold rounded-md px-4 py-3 flex items-start gap-2.5 animate-fadeIn shrink-0">
                            <AlertTriangle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                            <span>{form.error}</span>
                        </div>
                    )}

                    <form onSubmit={form.handleSubmit} className="flex flex-col gap-6" autoComplete="off">
                        {/* STEP 1: DATA UTAMA */}
                        {form.currentStepLabel === 'Data Utama' && (
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
                        )}

                        {/* STEP 2: DATA SPPT LAMA */}
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

                        {/* STEP 3: DATA SPPT BARU */}
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

                        {/* TOMBOL NAVIGASI */}
                        <div className="flex items-center justify-between pt-6 border-t border-slate-200/80 mt-2 select-none">
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
                                    <span>Simpan Perubahan</span>
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            <ActionStatusModal
                isOpen={form.statusModalOpen}
                status={form.statusModalStatus}
                title={form.statusModalTitle}
                message={form.statusModalMessage}
                onClose={form.handleCloseStatusModal}
            />
        </div>
    );
});

EditApplication.displayName = 'EditApplication';
