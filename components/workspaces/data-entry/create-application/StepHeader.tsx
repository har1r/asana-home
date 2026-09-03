"use client";
import React from 'react';
import { ChevronLeft, RotateCcw } from 'lucide-react';

interface StepHeaderProps {
  onCancel: () => void;
  onResetDraft: () => void;
  loading: boolean;
  steps: { id: number; label: string }[];
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

export const StepHeader: React.FC<StepHeaderProps> = ({
  onCancel,
  onResetDraft,
  loading,
  steps,
  currentStep,
  setCurrentStep
}) => {
  return (
    <>
      {/* Top Header Buttons */}
      <div className="px-6 py-3.5 border-b border-slate-200/80 bg-white flex flex-row items-center justify-between gap-3 select-none">
        <button
          type="button"
          onClick={onCancel}
          className="h-9 px-3.5 rounded-md border border-slate-200/90 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-normal text-[13px] font-sans transition-all cursor-pointer shadow-3xs flex items-center gap-2 shrink-0"
        >
          <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
          <span>Kembali</span>
        </button>
        <button
          type="button"
          onClick={onResetDraft}
          disabled={loading}
          className="h-9 px-3 hover:text-red-600 font-normal text-[13px] font-sans transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
          title="Hapus draf"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Stepper Progress Bar - Stretched */}
      {steps.length > 1 && (
        <div className="border-b border-slate-200/80 bg-slate-50/80 px-6 sm:px-8 py-3 select-none">
          <div className="flex items-center justify-between gap-2 w-full">
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
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all cursor-pointer text-[13px] font-normal font-sans ${
                      isActive
                        ? 'bg-[#00a389] text-white shadow-3xs'
                        : isCompleted
                        ? 'bg-[#e6f6f4] text-[#008f78] hover:bg-[#d8f2ee]'
                        : 'bg-white text-slate-400 border border-slate-200/90 cursor-not-allowed'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-normal ${
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
        </div>
      )}
    </>
  );
};
