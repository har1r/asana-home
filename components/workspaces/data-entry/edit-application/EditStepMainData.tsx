"use client";
import React from 'react';
import { Phone } from 'lucide-react';
import { JENIS_OPTIONS } from '../../shared/constants';

interface EditStepMainDataProps {
  jenisPermohonan: string;
  onJenisPermohonanChange: (val: string) => void;
  nomorPelayanan: string;
  onNomorPelayananChange: (val: string) => void;
  tanggalNoPelayanan: string;
  onTanggalNoPelayananChange: (val: string) => void;
  tanggalPenyelesaian: string;
  onTanggalPenyelesaianChange: (val: string) => void;
  nop: string;
  onNopChange: (val: string) => void;
  noWhatsapp: string;
  onNoWhatsappChange: (val: string) => void;
  formErrors: Record<string, string>;
  loading: boolean;
  getInputClass: (hasError?: boolean, extraClass?: string) => string;
}

export const EditStepMainData: React.FC<EditStepMainDataProps> = ({
  jenisPermohonan,
  onJenisPermohonanChange,
  nomorPelayanan,
  onNomorPelayananChange,
  tanggalNoPelayanan,
  onTanggalNoPelayananChange,
  tanggalPenyelesaian,
  onTanggalPenyelesaianChange,
  nop,
  onNopChange,
  noWhatsapp,
  onNoWhatsappChange,
  formErrors,
  loading,
  getInputClass
}) => {
  return (
    <div className="flex flex-col gap-5 bg-transparent animate-fadeIn font-sans">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">Jenis Permohonan <span className="text-red-500">*</span></label>
          <select
            value={jenisPermohonan}
            onChange={(e) => onJenisPermohonanChange(e.target.value)}
            disabled={loading}
            className={getInputClass(false, 'cursor-pointer')}
          >
            {JENIS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">Nomor Pelayanan <span className="text-red-500">*</span></label>
          <input
            type="text"
            id="edit_nomorPelayanan"
            value={nomorPelayanan}
            onChange={(e) => onNomorPelayananChange(e.target.value.toUpperCase())}
            style={{ textTransform: 'uppercase' }}
            disabled={loading}
            className={getInputClass(!!formErrors.nomorPelayanan, 'font-mono tracking-wide')}
          />
          {formErrors.nomorPelayanan && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5 font-sans">{formErrors.nomorPelayanan}</span>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">Tanggal Pelayanan <span className="text-red-500">*</span></label>
          <input
            type="date"
            id="edit_tanggalNoPelayanan"
            value={tanggalNoPelayanan}
            onChange={(e) => onTanggalNoPelayananChange(e.target.value)}
            disabled={loading}
            className={getInputClass(!!formErrors.tanggalNoPelayanan, 'cursor-pointer')}
          />
          {formErrors.tanggalNoPelayanan && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5 font-sans">{formErrors.tanggalNoPelayanan}</span>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans flex items-center justify-between">
            <span>Tanggal Penyelesaian <span className="text-red-500">*</span></span>
            <span className="text-[11px] text-[#008f78] bg-[#e6f6f4] px-2 py-0.5 rounded font-normal font-sans">SLA Otomatis</span>
          </label>
          <input
            type="date"
            id="edit_tanggalPenyelesaian"
            value={tanggalPenyelesaian}
            onChange={(e) => onTanggalPenyelesaianChange(e.target.value)}
            disabled={loading}
            className={getInputClass(!!formErrors.tanggalPenyelesaian, 'cursor-pointer')}
          />
          {formErrors.tanggalPenyelesaian && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5 font-sans">{formErrors.tanggalPenyelesaian}</span>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans flex items-center justify-between">
            <span>Nomor Objek Pajak (NOP) <span className="text-red-500">*</span></span>
            <span className={`text-xs font-mono pr-1 ${nop.replace(/[^\d]/g, '').length === 18 ? 'text-[#00a389]' : 'text-slate-400'}`}>
              {nop.replace(/[^\d]/g, '').length}/18
            </span>
          </label>
          <input
            type="text"
            id="edit_nop"
            maxLength={24}
            placeholder="36.19.xxx.xxx.xxx-xxxx.x"
            value={nop}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^\d]/g, '').slice(0, 18);
              let formatted = raw;
              if (raw.length > 2) formatted = raw.slice(0, 2) + '.' + raw.slice(2);
              if (raw.length > 4) formatted = raw.slice(0, 2) + '.' + raw.slice(2, 4) + '.' + raw.slice(4);
              if (raw.length > 7) formatted = raw.slice(0, 2) + '.' + raw.slice(2, 4) + '.' + raw.slice(4, 7) + '.' + raw.slice(7);
              if (raw.length > 10) formatted = raw.slice(0, 2) + '.' + raw.slice(2, 4) + '.' + raw.slice(4, 7) + '.' + raw.slice(7, 10) + '.' + raw.slice(10);
              if (raw.length > 13) formatted = raw.slice(0, 2) + '.' + raw.slice(2, 4) + '.' + raw.slice(4, 7) + '.' + raw.slice(7, 10) + '.' + raw.slice(10, 13) + '-' + raw.slice(13);
              if (raw.length > 17) formatted = raw.slice(0, 2) + '.' + raw.slice(2, 4) + '.' + raw.slice(4, 7) + '.' + raw.slice(7, 10) + '.' + raw.slice(10, 13) + '-' + raw.slice(13, 17) + '.' + raw.slice(17);
              onNopChange(formatted);
            }}
            disabled={loading}
            className={getInputClass(!!formErrors.nop, 'font-mono tracking-wide')}
          />
          {formErrors.nop && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5 font-sans">{formErrors.nop}</span>}
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">Nomor WhatsApp <span className="text-red-500">*</span></label>
          <div className={`flex items-center bg-white border ${formErrors.noWhatsapp ? 'border-red-500 focus-within:border-red-500 focus-within:ring-red-500/10' : 'border-slate-200/90 focus-within:border-[#00a389] focus-within:ring-[#00a389]/10'} rounded-md overflow-hidden transition-all focus-within:ring-2 font-sans`}>
            <span className="bg-slate-50 border-r border-slate-200 px-3.5 py-2.5 text-[13px] font-normal text-slate-600 select-none flex items-center gap-1 shrink-0 font-sans">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>+62</span>
            </span>
            <input
              type="text"
              id="edit_noWhatsapp"
              placeholder="81234567890"
              value={noWhatsapp.startsWith('62') ? noWhatsapp.slice(2) : noWhatsapp}
              onChange={(e) => {
                let val = e.target.value.replace(/[^\d]/g, '');
                if (val.startsWith('62')) val = val.slice(2);
                if (val.startsWith('0')) val = val.slice(1);
                onNoWhatsappChange(val ? '62' + val : '');
              }}
              disabled={loading}
              className="w-full px-3.5 py-2.5 text-[13px] font-normal text-slate-900 focus:outline-none bg-white font-sans"
            />
          </div>
          {formErrors.noWhatsapp && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5 font-sans">{formErrors.noWhatsapp}</span>}
        </div>
      </div>
    </div>
  );
};
