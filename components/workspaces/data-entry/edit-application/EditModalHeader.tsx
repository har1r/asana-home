"use client";
import React from 'react';
import { X, Edit } from 'lucide-react';

interface EditModalHeaderProps {
  editTarget: any;
  onClose: () => void;
  loading: boolean;
  steps: { id: number; label: string }[];
  currentStep: number;
  setCurrentStep: (step: number) => void;
  formProgress: { total: number; filled: number; percentage: number };
}

export const EditModalHeader: React.FC<EditModalHeaderProps> = ({
  editTarget,
  onClose,
  loading,
  steps,
  currentStep,
  setCurrentStep,
  formProgress
}) => {
  return (
    <>
      {/* Header Modal */}
      <div className="px-6 py-4 border-b border-slate-200/80 bg-white flex flex-row items-center justify-between gap-3 shrink-0 select-none">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-[#e6f6f4] border border-[#00a389]/20 flex items-center justify-center text-[#00a389] shrink-0">
            <Edit className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <h2 className="text-[16px] font-semibold text-slate-800 tracking-tight font-sans">
              Edit Permohonan
            </h2>
            <p className="text-[12px] font-normal text-slate-500 font-sans">
              Nomor Pelayanan: <span className="font-mono text-slate-700 font-medium">{editTarget?.nomorPelayanan || '-'}</span>
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Progress Bar & Stepper */}
      <div className="bg-slate-50/90 border-b border-slate-200/80 px-6 sm:px-8 py-3 shrink-0 select-none">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[11px] font-normal text-slate-500 font-sans">Kelengkapan Data: {formProgress.filled}/{formProgress.total} Field ({formProgress.percentage}%)</span>
          <div className="w-28 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#00a389] transition-all duration-300 rounded-full"
              style={{ width: `${formProgress.percentage}%` }}
            />
          </div>
        </div>

        {steps.length > 1 && (
          <div className="flex items-center justify-between gap-2 w-full pt-1">
            {steps.map((step, idx) => {
              const stepNum = idx + 1;
              const isActive = currentStep === stepNum;
              const isCompleted = currentStep > stepNum;
              return (
                <React.Fragment key={step.label}>
                  {idx > 0 && (
                    <div className={`flex-1 h-0.5 transition-all ${isCompleted ? 'bg-[#00a389]' : 'bg-slate-200/80'}`} />
                  )}
                  <button
                    type="button"
                    disabled={stepNum > currentStep && !isCompleted}
                    onClick={() => { if (stepNum < currentStep) setCurrentStep(stepNum); }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all cursor-pointer text-[12px] font-normal font-sans ${
                      isActive
                        ? 'bg-[#00a389] text-white shadow-3xs'
                        : isCompleted
                        ? 'bg-[#e6f6f4] text-[#008f78] hover:bg-[#d8f2ee]'
                        : 'bg-white text-slate-400 border border-slate-200/90 cursor-not-allowed'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-normal ${
                      isActive ? 'bg-white/20 text-white' : isCompleted ? 'bg-[#00a389] text-white' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {isCompleted ? '✓' : stepNum}
                    </span>
                    <span>{step.label}</span>
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};
