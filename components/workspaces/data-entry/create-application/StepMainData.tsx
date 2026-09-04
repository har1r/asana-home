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
          <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">Nomor Permohonan <span className="text-red-500">*</span></label>
          <input type="text" id="applicationNumber" autoComplete="off" placeholder="Contoh: 20260903001 (11 Digit)" value={applicationNumber} onChange={(e) => onApplicationNumberChange(e.target.value.toUpperCase())} style={{ textTransform: 'uppercase' }} disabled={loading} className={getInputClass(!!formErrors.applicationNumber, 'font-mono tracking-wide')} />
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
