"use client"

import React from 'react';
import { ChevronLeft, RotateCcw } from 'lucide-react'

interface stepHeaderProps {
    onCancel: () => void;
    onResetDraft: () => void;
    loading: boolean;
    steps: { id: number; label: string }[];
    currentStep: number;
    setCurrentStep: (step: number) => void;
    resetLabel?: string;
}

export const StepHeader: React.FC<stepHeaderProps> = ({
    onCancel,
    onResetDraft,
    loading,
    steps,
    currentStep,
    setCurrentStep,
    resetLabel = 'Reset draf'
}) => {
    const isEditMode = resetLabel.toLowerCase().includes('perubahan');
    const hoverColorClass = isEditMode
        ? 'hover:text-amber-600 text-slate-600'
        : 'hover:text-red-600 text-slate-600';

    return (
        <>
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
                    className={`h-9 px-3 ${hoverColorClass} font-normal text-[13px] font-sans transition-all cursor-pointer flex items-center gap-1.5 shrink-0`}
                    title={resetLabel}
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{resetLabel}</span>
                </button>
            </div >

            {steps.length > 1 && (
                <div className="border-b border-slate-200/80 bg-slate-50/70 px-6 sm:px-12 py-4 select-none">
                    <div className="flex items-start justify-between w-full relative">
                        {steps.map((step, idx) => {
                            const stepNum = idx + 1;
                            const isActive = currentStep === stepNum;
                            const isCompleted = currentStep > stepNum;
                            const isClickable = stepNum < currentStep || isCompleted;

                            return (
                                <React.Fragment key={step.label || idx}>
                                    {idx > 0 && (
                                        <div
                                            className={`flex-1 h-0.5 mt-3.5 sm:mt-4 transition-all duration-300 ${
                                                isCompleted ? 'bg-[#00a389]' : 'bg-slate-200/80'
                                            }`}
                                        />
                                    )}
                                    <button
                                        type="button"
                                        disabled={!isClickable}
                                        onClick={() => { if (isClickable) setCurrentStep(stepNum); }}
                                        className="flex flex-col items-center gap-1.5 group transition-all focus:outline-none cursor-pointer disabled:cursor-not-allowed shrink-0"
                                    >
                                        <div
                                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200 ${
                                                isCompleted
                                                    ? 'bg-[#00a389] text-white shadow-2xs'
                                                    : isActive
                                                    ? 'bg-[#e6f6f4] text-[#008f78] border border-[#00a389]/40 ring-4 ring-[#00a389]/15 scale-105'
                                                    : 'bg-slate-100 text-slate-400 border border-slate-200/90'
                                            }`}
                                        >
                                            {isCompleted ? (
                                                <span className="text-xs font-bold text-white">✓</span>
                                            ) : (
                                                <span>{stepNum}</span>
                                            )}
                                        </div>
                                        <span
                                            className={`text-[12px] sm:text-[13px] transition-colors font-sans whitespace-nowrap ${
                                                isCompleted
                                                    ? 'text-slate-700 font-medium group-hover:text-[#00a389]'
                                                    : isActive
                                                    ? 'text-[#008f78] font-semibold'
                                                    : 'text-slate-400 font-normal'
                                            }`}
                                        >
                                            {step.label}
                                        </span>
                                    </button>
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            )}
        </>
    )
}