/**
 * ============================================================================
 * ANAK KOMPONEN: StepMainData (STEP 1: DATA UTAMA PERMOHONAN)
 * ============================================================================
 * Terhubung dengan:
 * 1. `CreateForm.tsx`   --> Rendernya dipicu saat `form.currentStepLabel === 'Data Utama'`
 * 2. `useCreateForm.ts` --> Menerima state & handler:
 *    - `applicationType` & `onApplicationTypeChange` (Memilih jenis permohonan)
 *    - `applicationNumber` & `onApplicationNumberChange` (Input 11 karakter / Auto Reactivation)
 *    - `serviceNumberDate` & `onServiceNumberDateChange` (Tanggal permohonan)
 *    - `completionDate` (Tanggal penyelesaian / SLA otomatis)
 * ============================================================================
 */

"use client";

import React from 'react';
import { APPLICATION_TYPE_OPTIONS } from '../../shared/constants';

interface StepMainDataProps {
  applicationType: string;
  onApplicationTypeChange: (newType: string) => void;
  applicationNumber: string;
  onApplicationNumberChange: (val: string) => void;
  serviceNumberDate: string;
  onServiceNumberDateChange: (val: string) => void;
  completionDate: string;
  formErrors: Record<string, string>;
  loading: boolean;
  getInputClass: (hasError?: boolean, extraClass?: string) => string;
}

export const StepMainData: React.FC<StepMainDataProps> = ({
  applicationType,
  onApplicationTypeChange,
  applicationNumber,
  onApplicationNumberChange,
  serviceNumberDate,
  onServiceNumberDateChange,
  completionDate,
  formErrors,
  loading,
  getInputClass
}) => {
  return (
    <div className="flex flex-col gap-5 bg-transparent animate-fadeIn font-sans">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">Jenis Permohonan <span className="text-red-500">*</span></label>
          <select value={applicationType} onChange={(e) => onApplicationTypeChange(e.target.value)} disabled={loading} className={getInputClass(!!formErrors.applicationType, 'cursor-pointer')}>
            <option value="" disabled>-- Pilih Jenis Permohonan --</option>
            {APPLICATION_TYPE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {formErrors.applicationType && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5 font-sans">{formErrors.applicationType}</span>}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans flex items-center justify-between">
            <span>Nomor Permohonan <span className="text-red-500">*</span></span>
            {applicationType === 'REACTIVATION' ? (
              <span className="text-[11px] font-medium text-[#008f78] bg-[#e6f6f4] px-2 py-0.5 rounded border border-[#00a389]/30 font-sans">
                ✓ Otomatis Sistem (11 Digit)
              </span>
            ) : (
              <span className={`text-xs font-mono pr-1 ${(applicationNumber || '').length === 11 ? 'text-[#00a389]' : 'text-slate-400'}`}>
                {(applicationNumber || '').length}/11
              </span>
            )}
          </label>
          <input
            type="text"
            id="applicationNumber"
            autoComplete="off"
            maxLength={11}
            placeholder={applicationType === 'REACTIVATION' ? "Otomatis dibuat oleh sistem" : "Contoh: 20260903001 (11 Karakter)"}
            value={applicationNumber}
            onChange={(e) => {
              if (applicationType === 'REACTIVATION') return;
              const val = e.target.value.toUpperCase().slice(0, 11);
              onApplicationNumberChange(val);
            }}
            readOnly={applicationType === 'REACTIVATION'}
            disabled={loading}
            className={getInputClass(
              !!formErrors.applicationNumber,
              applicationType === 'REACTIVATION'
                ? 'font-mono tracking-wide bg-slate-50 cursor-not-allowed text-slate-700 select-none'
                : 'font-mono tracking-wide'
            )}
          />
          {formErrors.applicationNumber && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5 font-sans">{formErrors.applicationNumber}</span>}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">Tanggal Permohonan <span className="text-red-500">*</span></label>
          <input type="date" id="serviceNumberDate" value={serviceNumberDate} onChange={(e) => onServiceNumberDateChange(e.target.value)} disabled={loading} className={getInputClass(!!formErrors.serviceNumberDate, 'cursor-pointer')} />
          {formErrors.serviceNumberDate && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5 font-sans">{formErrors.serviceNumberDate}</span>}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans flex items-center justify-between">
            <span>Tanggal Penyelesaian</span>
          </label>
          <input type="date" value={completionDate} readOnly disabled className="w-full bg-slate-50 border border-slate-200/90 rounded-md px-3.5 py-2.5 text-[13px] font-normal text-slate-600 cursor-not-allowed font-sans select-none" />
        </div>
      </div>
    </div>
  );
};
