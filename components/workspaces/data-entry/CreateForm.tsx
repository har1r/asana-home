"use client";
import React from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, CheckCircle, AlertTriangle } from 'lucide-react';
import { ActionStatusModal } from '../shared/ActionStatusModal';
import { useCreateForm } from './create-application/useCreateForm';
import { StepHeader } from './create-application/StepHeader';
import { StepMainData } from './create-application/StepMainData';
import { StepPreviousData } from './create-application/StepPreviousData';
import { StepTargetData } from './create-application/StepTargetData';

interface CreateFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: any;
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

export const CreateForm: React.FC<CreateFormProps> = React.memo(({ onSuccess, onCancel, initialData }) => {
  const form = useCreateForm({ onSuccess, onCancel, initialData });

  return (
    <div className="w-full bg-transparent animate-fadeIn">
      <div className="w-full bg-white rounded-md border border-slate-200/90 shadow-xs flex flex-col overflow-hidden">
        {/* Step Header & Progress Bar */}
        <StepHeader
          onCancel={onCancel}
          onResetDraft={form.handleResetDraft}
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

          <form onSubmit={form.handleCreate} className="flex flex-col gap-6" autoComplete="off">
            {/* Step 1: Data Utama */}
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

            {/* Step 2: Data Lama (Asal) */}
            {form.currentStepLabel === 'Data Lama (Asal)' && form.needPreviousData && (
              <StepPreviousData
                applicationType={form.applicationType}
                previousData={form.previousData}
                onAddPreviousItem={form.handleAddPreviousItem}
                onRemovePreviousItem={form.handleRemovePreviousItem}
                onPreviousItemChange={form.handlePreviousItemChange}
                formErrors={form.formErrors}
                loading={form.loading}
                getInputClass={getInputClass}
              />
            )}

            {/* Step 3: Data Baru */}
            {form.currentStepLabel === 'Data Baru' && form.needTargetData && (
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
              />
            )}

            {/* Navigation & Submit Buttons */}
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
                  <span>Simpan & Daftarkan Permohonan</span>
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Action Status Modal */}
      <ActionStatusModal
        isOpen={form.statusModalOpen}
        status={form.statusModalStatus}
        title={form.statusModalTitle}
        message={form.statusModalMessage}
        onClose={form.handleCloseStatusModal}
      />

      {/* Draft Notification Modal */}
      {form.mounted && form.draftModalOpen && createPortal(
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] animate-fadeIn">
          <div className="bg-white rounded-md p-6 max-w-sm w-full shadow-lg border border-slate-200/80 flex flex-col gap-4 animate-scaleUp font-sans">
            <div className="flex items-center gap-3 text-emerald-600">
              <CheckCircle className="w-6 h-6 shrink-0 text-[#00a389]" />
              <h3 className="font-semibold text-slate-800 text-base">Pemberitahuan Draf</h3>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed">{form.draftModalMessage}</p>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => form.setDraftModalOpen(false)}
                className="px-4 py-2 bg-[#00a389] hover:bg-[#008f78] text-white text-xs font-normal rounded-md transition-all cursor-pointer"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
});