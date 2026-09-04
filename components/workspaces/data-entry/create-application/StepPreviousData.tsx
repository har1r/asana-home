"use client";
import React from 'react';
import { Plus, Trash2, Phone } from 'lucide-react';
import { KECAMATAN_DATA } from '../../shared/constants';

interface StepPreviousDataProps {
  applicationType: string;
  previousData: any[];
  onAddPreviousItem: () => void;
  onRemovePreviousItem: (idx: number) => void;
  onPreviousItemChange: (idx: number, field: string, val: any) => void;
  onSetPrimaryPreviousItem?: (idx: number) => void;
  formErrors: Record<string, string>;
  loading: boolean;
  getInputClass: (hasError?: boolean, extraClass?: string) => string;
  getWhatsAppContainerClass?: (hasError?: boolean) => string;
}

export const StepPreviousData: React.FC<StepPreviousDataProps> = ({
  applicationType,
  previousData,
  onAddPreviousItem,
  onRemovePreviousItem,
  onPreviousItemChange,
  onSetPrimaryPreviousItem,
  formErrors,
  loading,
  getInputClass,
  getWhatsAppContainerClass
}) => {
  return (
    <div className="flex flex-col gap-4 bg-transparent animate-fadeIn font-sans">
      {applicationType === 'MERGER_MUTATION' && (
        <div className="flex items-center justify-between select-none mb-1">
          <span className="text-[13px] font-normal text-slate-500 font-sans">Mutasi Penggabungan (Minimal 2 NOP Asal)</span>
          <button type="button" onClick={onAddPreviousItem} disabled={loading} className="h-8 px-3.5 rounded-md bg-[#00a389] hover:bg-[#008f78] active:scale-95 text-white font-normal text-[13px] shadow-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0 disabled:opacity-50 font-sans">
            <Plus className="w-4 h-4 stroke-[3]" /> Tambah NOP Asal
          </button>
        </div>
      )}
      {formErrors.previousDataGeneral && (
        <span className="text-xs text-red-600 font-normal pl-1 font-sans">{formErrors.previousDataGeneral}</span>
      )}

      {applicationType === 'MERGER_MUTATION' ? (
        <div className="flex flex-col gap-6 font-sans">
          {(previousData || []).map((rawItem, idx) => {
            const item = rawItem || {};
            const availableDesa = KECAMATAN_DATA[item.objectKecamatan || ''] || [];
            return (
              <div key={idx} className="flex flex-col gap-4 p-5 border border-slate-200/80 rounded-md pt-10 relative shadow-3xs bg-white">
                <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between select-none border-b border-slate-100 pb-1">
                  <span className="text-[13px] font-medium text-[#008f78] tracking-wide font-sans">NOP Asal #{idx + 1}</span>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-normal text-slate-600 select-none">
                      <span className={item.isPrimary ? "font-semibold text-[#00a389]" : "text-slate-500"}>
                        {item.isPrimary ? "NOP Induk" : "NOP Utama"}
                      </span>
                      <button
                        type="button"
                        onClick={() => onSetPrimaryPreviousItem && onSetPrimaryPreviousItem(idx)}
                        disabled={loading}
                        className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${item.isPrimary ? 'bg-[#00a389]' : 'bg-slate-300'
                          }`}
                      >
                        <span
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${item.isPrimary ? 'translate-x-4' : 'translate-x-0'
                            }`}
                        />
                      </button>
                    </label>
                    {previousData.length > 2 && (
                      <button type="button" onClick={() => onRemovePreviousItem(idx)} disabled={loading} className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 font-sans">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">Nomor Objek Pajak <span className="text-red-500">*</span></label>
                    <input type="text" id={`previousData.${idx}.nop`} autoComplete="off" maxLength={24} placeholder="36.19.xxx.xxx.xxx-xxxx.x" value={item.nop} onChange={(e) => { const raw = e.target.value.replace(/[^\d]/g, '').slice(0, 18); let fmt = raw; if (raw.length > 2) fmt = raw.slice(0, 2) + '.' + raw.slice(2); if (raw.length > 4) fmt = raw.slice(0, 2) + '.' + raw.slice(2, 4) + '.' + raw.slice(4); if (raw.length > 7) fmt = raw.slice(0, 2) + '.' + raw.slice(2, 4) + '.' + raw.slice(4, 7) + '.' + raw.slice(7); if (raw.length > 10) fmt = raw.slice(0, 2) + '.' + raw.slice(2, 4) + '.' + raw.slice(4, 7) + '.' + raw.slice(7, 10) + '.' + raw.slice(10); if (raw.length > 13) fmt = raw.slice(0, 2) + '.' + raw.slice(2, 4) + '.' + raw.slice(4, 7) + '.' + raw.slice(7, 10) + '.' + raw.slice(10, 13) + '-' + raw.slice(13); if (raw.length > 17) fmt = raw.slice(0, 2) + '.' + raw.slice(2, 4) + '.' + raw.slice(4, 7) + '.' + raw.slice(7, 10) + '.' + raw.slice(10, 13) + '-' + raw.slice(13, 17) + '.' + raw.slice(17); onPreviousItemChange(idx, 'nop', fmt); }} disabled={loading} className={getInputClass(!!formErrors[`previousData.${idx}.nop`], 'font-mono tracking-wide')} />
                    {formErrors[`previousData.${idx}.nop`] && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5 font-sans">{formErrors[`previousData.${idx}.nop`]}</span>}
                  </div>
                  <div className="flex flex-col gap-1.5 font-sans">
                    <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">Nomor WhatsApp Pemilik Asal <span className="text-slate-400 text-xs">(Opsional)</span></label>
                    <div className={getWhatsAppContainerClass ? getWhatsAppContainerClass(!!formErrors[`previousData.${idx}.whatsappNumber`]) : "flex items-center bg-white border border-slate-200/90 rounded-md overflow-hidden"}>
                      <span className="bg-slate-50 border-r border-slate-200 px-3.5 py-2.5 text-[13px] font-normal text-slate-600 select-none flex items-center gap-1 shrink-0 font-sans">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>+62</span>
                      </span>
                      <input
                        type="text"
                        id={`previousData.${idx}.whatsappNumber`}
                        placeholder="81234567890"
                        value={(item.whatsappNumber || '').startsWith('62') ? (item.whatsappNumber || '').slice(2) : (item.whatsappNumber || '')}
                        onChange={(e) => {
                          let val = e.target.value.replace(/[^\d]/g, '');
                          if (val.startsWith('62')) val = val.slice(2);
                          const formatted = val ? '62' + val : '';
                          onPreviousItemChange(idx, 'whatsappNumber', formatted);
                        }}
                        disabled={loading}
                        className="w-full px-3.5 py-2.5 text-[13px] font-normal text-slate-900 focus:outline-none bg-white font-sans"
                      />
                    </div>
                    {formErrors[`previousData.${idx}.whatsappNumber`] && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5 font-sans">{formErrors[`previousData.${idx}.whatsappNumber`]}</span>}
                  </div>
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">Nama Pemilik Asal <span className="text-red-500">*</span></label>
                    <input type="text" id={`previousData.${idx}.ownerName`} autoComplete="off" placeholder="Contoh: AHMAD SUBARKAH" value={item.ownerName} onChange={(e) => onPreviousItemChange(idx, 'ownerName', e.target.value.toUpperCase())} style={{ textTransform: 'uppercase' }} disabled={loading} className={getInputClass(!!formErrors[`previousData.${idx}.ownerName`])} />
                    {formErrors[`previousData.${idx}.ownerName`] && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5 font-sans">{formErrors[`previousData.${idx}.ownerName`]}</span>}
                  </div>
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">Alamat Pemilik Asal <span className="text-slate-400 text-xs">(Opsional)</span></label>
                      <input type="text" id={`previousData.${idx}.ownerAddress`} autoComplete="off" placeholder="Contoh: JL. RAYA PAKUHAJI NO. 12" value={item.ownerAddress} onChange={(e) => onPreviousItemChange(idx, 'ownerAddress', e.target.value.toUpperCase())} style={{ textTransform: 'uppercase' }} disabled={loading} className={getInputClass(!!formErrors[`previousData.${idx}.ownerAddress`])} />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="flex flex-col gap-1"><label className="text-[13px] font-normal text-slate-700 font-sans">Blok</label><input type="text" placeholder="Contoh: A4" value={item.ownerBlock || ''} onChange={(e) => onPreviousItemChange(idx, 'ownerBlock', e.target.value.toUpperCase())} style={{ textTransform: 'uppercase' }} disabled={loading} className={getInputClass()} /></div>
                      <div className="flex flex-col gap-1"><label className="text-[13px] font-normal text-slate-700 font-sans">RT</label><input type="text" placeholder="001" value={item.ownerRt || ''} onChange={(e) => onPreviousItemChange(idx, 'ownerRt', e.target.value)} disabled={loading} className={getInputClass()} /></div>
                      <div className="flex flex-col gap-1"><label className="text-[13px] font-normal text-slate-700 font-sans">RW</label><input type="text" placeholder="005" value={item.ownerRw || ''} onChange={(e) => onPreviousItemChange(idx, 'ownerRw', e.target.value)} disabled={loading} className={getInputClass()} /></div>
                    </div>
                    <div className="flex flex-col gap-1.5 font-sans">
                      <label className="text-[13px] font-normal text-slate-700 font-sans">Kecamatan Pemilik <span className="text-slate-400 text-xs">(Opsional)</span></label>
                      <input type="text" id={`previousData.${idx}.ownerKecamatan`} placeholder="Contoh: PAKUHAJI" value={item.ownerKecamatan || ''} onChange={(e) => onPreviousItemChange(idx, 'ownerKecamatan', e.target.value.toUpperCase())} style={{ textTransform: 'uppercase' }} disabled={loading} className={getInputClass(false)} />
                    </div>
                    <div className="flex flex-col gap-1.5 font-sans">
                      <label className="text-[13px] font-normal text-slate-700 font-sans">Desa Pemilik <span className="text-slate-400 text-xs">(Opsional)</span></label>
                      <input type="text" id={`previousData.${idx}.ownerDesa`} placeholder="Contoh: SUKAWALI" value={item.ownerDesa || ''} onChange={(e) => onPreviousItemChange(idx, 'ownerDesa', e.target.value.toUpperCase())} style={{ textTransform: 'uppercase' }} disabled={loading} className={getInputClass(false)} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">Alamat Objek Asal <span className="text-red-500">*</span></label>
                      <input type="text" id={`previousData.${idx}.objectAddress`} autoComplete="off" placeholder="Contoh: JL. RAYA PAKUHAJI NO. 12" value={item.objectAddress} onChange={(e) => onPreviousItemChange(idx, 'objectAddress', e.target.value.toUpperCase())} style={{ textTransform: 'uppercase' }} disabled={loading} className={getInputClass(!!formErrors[`previousData.${idx}.objectAddress`])} />
                      {formErrors[`previousData.${idx}.objectAddress`] && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5 font-sans">{formErrors[`previousData.${idx}.objectAddress`]}</span>}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="flex flex-col gap-1"><label className="text-[13px] font-normal text-slate-700 font-sans">Blok</label><input type="text" placeholder="Contoh: B2" value={item.objectBlock || ''} onChange={(e) => onPreviousItemChange(idx, 'objectBlock', e.target.value.toUpperCase())} style={{ textTransform: 'uppercase' }} disabled={loading} className={getInputClass(!!formErrors[`previousData.${idx}.objectBlock`])} /></div>
                      <div className="flex flex-col gap-1"><label className="text-[13px] font-normal text-slate-700 font-sans">RT</label><input type="text" placeholder="001" value={item.objectRt || ''} onChange={(e) => onPreviousItemChange(idx, 'objectRt', e.target.value)} disabled={loading} className={getInputClass(!!formErrors[`previousData.${idx}.objectRt`])} /></div>
                      <div className="flex flex-col gap-1"><label className="text-[13px] font-normal text-slate-700 font-sans">RW</label><input type="text" placeholder="005" value={item.objectRw || ''} onChange={(e) => onPreviousItemChange(idx, 'objectRw', e.target.value)} disabled={loading} className={getInputClass(!!formErrors[`previousData.${idx}.objectRw`])} /></div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-normal text-slate-700 font-sans">Kecamatan Objek <span className="text-red-500">*</span></label>
                      <select id={`previousData.${idx}.objectKecamatan`} value={item.objectKecamatan || ''} onChange={(e) => onPreviousItemChange(idx, 'objectKecamatan', e.target.value)} disabled={loading} className={getInputClass(!!formErrors[`previousData.${idx}.objectKecamatan`], 'cursor-pointer')}>
                        <option value="">-- Pilih Kecamatan --</option>
                        {Object.keys(KECAMATAN_DATA).map(kec => (
                          <option key={kec} value={kec}>{kec}</option>
                        ))}
                        {item.objectKecamatan && !KECAMATAN_DATA[item.objectKecamatan] && (
                          <option value={item.objectKecamatan}>{item.objectKecamatan}</option>
                        )}
                      </select>
                      {formErrors[`previousData.${idx}.objectKecamatan`] && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5">{formErrors[`previousData.${idx}.objectKecamatan`]}</span>}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-normal text-slate-700 font-sans">Desa Objek <span className="text-red-500">*</span></label>
                      <select id={`previousData.${idx}.objectDesa`} value={item.objectDesa || ''} onChange={(e) => onPreviousItemChange(idx, 'objectDesa', e.target.value)} disabled={loading || !item.objectKecamatan} className={getInputClass(!!formErrors[`previousData.${idx}.objectDesa`], 'cursor-pointer')}>
                        <option value="">-- Pilih Desa --</option>
                        {availableDesa.map(desa => (
                          <option key={desa} value={desa}>{desa}</option>
                        ))}
                        {item.objectDesa && !availableDesa.includes(item.objectDesa) && (
                          <option value={item.objectDesa}>{item.objectDesa}</option>
                        )}
                      </select>
                      {formErrors[`previousData.${idx}.objectDesa`] && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5">{formErrors[`previousData.${idx}.objectDesa`]}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-normal text-slate-700 font-sans">Luas Tanah <span className="text-red-500">*</span></label>
                    <div className="relative"><input type="number" id={`previousData.${idx}.landArea`} value={item.landArea} onChange={(e) => onPreviousItemChange(idx, 'landArea', e.target.value)} disabled={loading} className={getInputClass(!!formErrors[`previousData.${idx}.landArea`], 'pl-3.5 pr-10')} /><span className="text-slate-500 text-xs absolute right-3.5 top-1/2 -translate-y-1/2 select-none font-sans">m²</span></div>
                    {formErrors[`previousData.${idx}.landArea`] && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5">{formErrors[`previousData.${idx}.landArea`]}</span>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-normal text-slate-700 font-sans">Luas Bangunan</label>
                    <div className="relative"><input type="number" id={`previousData.${idx}.buildingArea`} value={item.buildingArea} onChange={(e) => onPreviousItemChange(idx, 'buildingArea', e.target.value)} disabled={loading} className={getInputClass(false, 'pl-3.5 pr-10')} /><span className="text-slate-500 text-xs absolute right-3.5 top-1/2 -translate-y-1/2 select-none font-sans">m²</span></div>
                  </div>
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="text-[13px] font-normal text-slate-700 font-sans">No/Jenis Sertifikat <span className="text-slate-400">(Opsional)</span></label>
                    <input type="text" id={`previousData.${idx}.certificate`} placeholder="SHM NO. 12345" value={item.certificate || ''} onChange={(e) => onPreviousItemChange(idx, 'certificate', e.target.value.toUpperCase())} style={{ textTransform: 'uppercase' }} disabled={loading} className={getInputClass(!!formErrors[`previousData.${idx}.certificate`])} />
                  </div>
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="text-[13px] font-normal text-slate-700 font-sans">Catatan <span className="text-slate-400">(Opsional)</span></label>
                    <textarea rows={2} placeholder="Catatan tambahan data lama..." value={item.notes || ''} onChange={(e) => onPreviousItemChange(idx, 'notes', e.target.value.toUpperCase())} style={{ textTransform: 'uppercase' }} disabled={loading} className={getInputClass(false, 'resize-y')} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        (() => {
          const item0 = previousData[0] || {};
          const availableDesa0 = KECAMATAN_DATA[item0.objectKecamatan || ''] || [];
          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2 flex items-center justify-between border-b border-slate-100 pb-2.5 mb-1 select-none">
                <span className="text-[13px] font-medium text-[#008f78]">NOP Asal (Data Lama)</span>
                <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-[#e6f6f4] text-[#008f78] border border-[#00a389]/30 rounded-md">
                  ✓ NOP Utama (Induk)
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-normal text-slate-700 tracking-wide flex items-center justify-between font-sans"><span>NOP <span className="text-red-500">*</span></span><span className={`text-xs font-mono pr-1 ${(item0.nop || '').replace(/[^\d]/g, '').length === 18 ? 'text-[#00a389]' : 'text-slate-400'}`}>{(item0.nop || '').replace(/[^\d]/g, '').length}/18</span></label>
                <input type="text" id="previousData.0.nop" maxLength={24} placeholder="36.19.xxx.xxx.xxx-xxxx.x" value={item0.nop || ''} onChange={(e) => { const raw = e.target.value.replace(/[^\d]/g, '').slice(0, 18); let fmt = raw; if (raw.length > 2) fmt = raw.slice(0, 2) + '.' + raw.slice(2); if (raw.length > 4) fmt = raw.slice(0, 2) + '.' + raw.slice(2, 4) + '.' + raw.slice(4); if (raw.length > 7) fmt = raw.slice(0, 2) + '.' + raw.slice(2, 4) + '.' + raw.slice(4, 7) + '.' + raw.slice(7); if (raw.length > 10) fmt = raw.slice(0, 2) + '.' + raw.slice(2, 4) + '.' + raw.slice(4, 7) + '.' + raw.slice(7, 10) + '.' + raw.slice(10); if (raw.length > 13) fmt = raw.slice(0, 2) + '.' + raw.slice(2, 4) + '.' + raw.slice(4, 7) + '.' + raw.slice(7, 10) + '.' + raw.slice(10, 13) + '-' + raw.slice(13); if (raw.length > 17) fmt = raw.slice(0, 2) + '.' + raw.slice(2, 4) + '.' + raw.slice(4, 7) + '.' + raw.slice(7, 10) + '.' + raw.slice(10, 13) + '-' + raw.slice(13, 17) + '.' + raw.slice(17); onPreviousItemChange(0, 'nop', fmt); }} disabled={loading} className={getInputClass(!!formErrors['previousData.0.nop'], 'font-mono tracking-wide')} />
                {formErrors['previousData.0.nop'] && <span className="text-xs text-red-600 pl-1 mt-0.5">{formErrors['previousData.0.nop']}</span>}
              </div>
              <div className="flex flex-col gap-1.5 font-sans">
                <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">Nomor WhatsApp Pemilik <span className="text-slate-400 text-xs">(Opsional)</span></label>
                <div className={getWhatsAppContainerClass ? getWhatsAppContainerClass(!!formErrors['previousData.0.whatsappNumber']) : "flex items-center bg-white border border-slate-200/90 rounded-md overflow-hidden"}>
                  <span className="bg-slate-50 border-r border-slate-200 px-3.5 py-2.5 text-[13px] font-normal text-slate-600 select-none flex items-center gap-1 shrink-0 font-sans">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>+62</span>
                  </span>
                  <input
                    type="text"
                    id="previousData.0.whatsappNumber"
                    placeholder="81234567890"
                    value={(item0.whatsappNumber || '').startsWith('62') ? (item0.whatsappNumber || '').slice(2) : (item0.whatsappNumber || '')}
                    onChange={(e) => {
                      let val = e.target.value.replace(/[^\d]/g, '');
                      if (val.startsWith('62')) val = val.slice(2);
                      const formatted = val ? '62' + val : '';
                      onPreviousItemChange(0, 'whatsappNumber', formatted);
                    }}
                    disabled={loading}
                    className="w-full px-3.5 py-2.5 text-[13px] font-normal text-slate-900 focus:outline-none bg-white font-sans"
                  />
                </div>
                {formErrors['previousData.0.whatsappNumber'] && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5 font-sans">{formErrors['previousData.0.whatsappNumber']}</span>}
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-[13px] font-normal text-slate-700 font-sans">Nama Pemilik <span className="text-red-500">*</span></label>
                <input type="text" id="previousData.0.ownerName" placeholder="Contoh: AHMAD SUBARKAH" value={item0.ownerName || ''} onChange={(e) => onPreviousItemChange(0, 'ownerName', e.target.value.toUpperCase())} style={{ textTransform: 'uppercase' }} disabled={loading} className={getInputClass(!!formErrors['previousData.0.ownerName'])} />
                {formErrors['previousData.0.ownerName'] && <span className="text-xs text-red-600 pl-1 mt-0.5">{formErrors['previousData.0.ownerName']}</span>}
              </div>
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5"><label className="text-[13px] font-normal text-slate-700 font-sans">Alamat Pemilik <span className="text-slate-400 text-xs">(Opsional)</span></label><input type="text" placeholder="Contoh: JL. RAYA PAKUHAJI NO. 12" value={item0.ownerAddress || ''} onChange={(e) => onPreviousItemChange(0, 'ownerAddress', e.target.value.toUpperCase())} style={{ textTransform: 'uppercase' }} disabled={loading} className={getInputClass()} /></div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col gap-1"><label className="text-[13px] font-normal text-slate-700 font-sans">Blok</label><input type="text" placeholder="Contoh: A4" value={item0.ownerBlock || ''} onChange={(e) => onPreviousItemChange(0, 'ownerBlock', e.target.value.toUpperCase())} style={{ textTransform: 'uppercase' }} disabled={loading} className={getInputClass()} /></div>
                  <div className="flex flex-col gap-1"><label className="text-[13px] font-normal text-slate-700 font-sans">RT</label><input type="text" placeholder="001" value={item0.ownerRt || ''} onChange={(e) => onPreviousItemChange(0, 'ownerRt', e.target.value)} disabled={loading} className={getInputClass()} /></div>
                  <div className="flex flex-col gap-1"><label className="text-[13px] font-normal text-slate-700 font-sans">RW</label><input type="text" placeholder="005" value={item0.ownerRw || ''} onChange={(e) => onPreviousItemChange(0, 'ownerRw', e.target.value)} disabled={loading} className={getInputClass()} /></div>
                </div>
                <div className="flex flex-col gap-1.5 font-sans">
                  <label className="text-[13px] font-normal text-slate-700 font-sans">Kecamatan Pemilik <span className="text-slate-400 text-xs">(Opsional)</span></label>
                  <input type="text" id="previousData.0.ownerKecamatan" placeholder="Contoh: PAKUHAJI" value={item0.ownerKecamatan || ''} onChange={(e) => onPreviousItemChange(0, 'ownerKecamatan', e.target.value.toUpperCase())} style={{ textTransform: 'uppercase' }} disabled={loading} className={getInputClass(false)} />
                </div>
                <div className="flex flex-col gap-1.5 font-sans">
                  <label className="text-[13px] font-normal text-slate-700 font-sans">Desa Pemilik <span className="text-slate-400 text-xs">(Opsional)</span></label>
                  <input type="text" id="previousData.0.ownerDesa" placeholder="Contoh: SUKAWALI" value={item0.ownerDesa || ''} onChange={(e) => onPreviousItemChange(0, 'ownerDesa', e.target.value.toUpperCase())} style={{ textTransform: 'uppercase' }} disabled={loading} className={getInputClass(false)} />
                </div>
              </div>
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5"><label className="text-[13px] font-normal text-slate-700 font-sans">Alamat Objek <span className="text-red-500">*</span></label><input type="text" id="previousData.0.objectAddress" placeholder="Contoh: JL. RAYA PAKUHAJI NO. 12" value={item0.objectAddress || ''} onChange={(e) => onPreviousItemChange(0, 'objectAddress', e.target.value.toUpperCase())} style={{ textTransform: 'uppercase' }} disabled={loading} className={getInputClass(!!formErrors['previousData.0.objectAddress'])} />{formErrors['previousData.0.objectAddress'] && <span className="text-xs text-red-600 pl-1 mt-0.5">{formErrors['previousData.0.objectAddress']}</span>}</div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col gap-1"><label className="text-[13px] font-normal text-slate-700 font-sans">Blok</label><input type="text" placeholder="Contoh: B2" value={item0.objectBlock || ''} onChange={(e) => onPreviousItemChange(0, 'objectBlock', e.target.value.toUpperCase())} style={{ textTransform: 'uppercase' }} disabled={loading} className={getInputClass(!!formErrors['previousData.0.objectBlock'])} /></div>
                  <div className="flex flex-col gap-1"><label className="text-[13px] font-normal text-slate-700 font-sans">RT</label><input type="text" placeholder="001" value={item0.objectRt || ''} onChange={(e) => onPreviousItemChange(0, 'objectRt', e.target.value)} disabled={loading} className={getInputClass(!!formErrors['previousData.0.objectRt'])} /></div>
                  <div className="flex flex-col gap-1"><label className="text-[13px] font-normal text-slate-700 font-sans">RW</label><input type="text" placeholder="005" value={item0.objectRw || ''} onChange={(e) => onPreviousItemChange(0, 'objectRw', e.target.value)} disabled={loading} className={getInputClass(!!formErrors['previousData.0.objectRw'])} /></div>
                </div>
                <div className="flex flex-col gap-1.5 font-sans">
                  <label className="text-[13px] font-normal text-slate-700 font-sans">Kecamatan Objek <span className="text-red-500">*</span></label>
                  <select id="previousData.0.objectKecamatan" value={item0.objectKecamatan || ''} onChange={(e) => onPreviousItemChange(0, 'objectKecamatan', e.target.value)} disabled={loading} className={getInputClass(!!formErrors['previousData.0.objectKecamatan'], 'cursor-pointer')}>
                    <option value="">-- Pilih Kecamatan --</option>
                    {Object.keys(KECAMATAN_DATA).map(kec => (
                      <option key={kec} value={kec}>{kec}</option>
                    ))}
                    {item0.objectKecamatan && !KECAMATAN_DATA[item0.objectKecamatan] && (
                      <option value={item0.objectKecamatan}>{item0.objectKecamatan}</option>
                    )}
                  </select>
                  {formErrors['previousData.0.objectKecamatan'] && <span className="text-xs text-red-600 pl-1 mt-0.5">{formErrors['previousData.0.objectKecamatan']}</span>}
                </div>
                <div className="flex flex-col gap-1.5 font-sans">
                  <label className="text-[13px] font-normal text-slate-700 font-sans">Desa Objek <span className="text-red-500">*</span></label>
                  <select id="previousData.0.objectDesa" value={item0.objectDesa || ''} onChange={(e) => onPreviousItemChange(0, 'objectDesa', e.target.value)} disabled={loading || !item0.objectKecamatan} className={getInputClass(!!formErrors['previousData.0.objectDesa'], 'cursor-pointer')}>
                    <option value="">-- Pilih Desa --</option>
                    {availableDesa0.map(desa => (
                      <option key={desa} value={desa}>{desa}</option>
                    ))}
                    {item0.objectDesa && !availableDesa0.includes(item0.objectDesa) && (
                      <option value={item0.objectDesa}>{item0.objectDesa}</option>
                    )}
                  </select>
                  {formErrors['previousData.0.objectDesa'] && <span className="text-xs text-red-600 pl-1 mt-0.5">{formErrors['previousData.0.objectDesa']}</span>}
                </div>
              </div>
              <div className="flex flex-col gap-1.5"><label className="text-[13px] font-normal text-slate-700 font-sans">Luas Tanah <span className="text-red-500">*</span></label><div className="relative"><input type="number" id="previousData.0.landArea" placeholder="Contoh: 150" value={item0.landArea || ''} onChange={(e) => onPreviousItemChange(0, 'landArea', e.target.value)} disabled={loading} className={getInputClass(!!formErrors['previousData.0.landArea'], 'pl-3.5 pr-10')} /><span className="text-slate-500 text-xs absolute right-3.5 top-1/2 -translate-y-1/2 select-none font-sans">m²</span></div>{formErrors['previousData.0.landArea'] && <span className="text-xs text-red-600 pl-1 mt-0.5">{formErrors['previousData.0.landArea']}</span>}</div>
              <div className="flex flex-col gap-1.5"><label className="text-[13px] font-normal text-slate-700 font-sans">Luas Bangunan <span className="text-slate-400 text-xs">(Opsional)</span></label><div className="relative"><input type="number" placeholder="Contoh: 90 (0 jika tanah kosong)" value={item0.buildingArea || ''} onChange={(e) => onPreviousItemChange(0, 'buildingArea', e.target.value)} disabled={loading} className={getInputClass(false, 'pl-3.5 pr-10')} /><span className="text-slate-500 text-xs absolute right-3.5 top-1/2 -translate-y-1/2 select-none font-sans">m²</span></div></div>
              <div className="flex flex-col gap-1.5 sm:col-span-2"><label className="text-[13px] font-normal text-slate-700 font-sans">No/Jenis Sertifikat <span className="text-slate-400">(Opsional)</span></label><input type="text" placeholder="Contoh: SHM NO. 12345 / LETER C NO. 567" value={item0.certificate || ''} onChange={(e) => onPreviousItemChange(0, 'certificate', e.target.value.toUpperCase())} style={{ textTransform: 'uppercase' }} disabled={loading} className={getInputClass(!!formErrors['previousData.0.certificate'])} /></div>
              <div className="flex flex-col gap-1.5 sm:col-span-2"><label className="text-[13px] font-normal text-slate-700 font-sans">Catatan <span className="text-slate-400">(Opsional)</span></label><textarea rows={2} placeholder="Catatan tambahan data lama..." value={item0.notes || ''} onChange={(e) => onPreviousItemChange(0, 'notes', e.target.value.toUpperCase())} style={{ textTransform: 'uppercase' }} disabled={loading} className={getInputClass(false, 'resize-y')} /></div>
            </div>
          );
        })()
      )}
    </div>
  );
};
