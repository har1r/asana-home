"use client";
import React from 'react';
import { Plus, Trash2, Phone, Copy, RefreshCw, UploadCloud, FileText, X, Paperclip } from 'lucide-react';
import { KECAMATAN_DATA } from '../../shared/constants';

interface StepTargetDataProps {
  applicationType: string;
  targetData: any[];
  onAddTargetItem: () => void;
  onRemoveTargetItem: (idx: number) => void;
  onTargetItemChange: (idx: number, field: string, val: any) => void;
  onCopyOwnerFromPrevious: (targetIdx: number) => void;
  onCopyObjectFromPrevious: (targetIdx: number) => void;
  onCopyObjectToOwner: (targetIdx: number) => void;
  needPreviousData: boolean;
  previousData: any[];
  formErrors: Record<string, string>;
  loading: boolean;
  getInputClass: (hasError?: boolean, extraClass?: string) => string;
  getWhatsAppContainerClass: (hasError?: boolean) => string;
  getPrimaryNopDisplay: (previousData: any[]) => string;
}

export const StepTargetData: React.FC<StepTargetDataProps> = ({
  applicationType,
  targetData,
  onAddTargetItem,
  onRemoveTargetItem,
  onTargetItemChange,
  onCopyOwnerFromPrevious,
  onCopyObjectFromPrevious,
  onCopyObjectToOwner,
  needPreviousData,
  previousData,
  formErrors,
  loading,
  getInputClass,
  getWhatsAppContainerClass,
  getPrimaryNopDisplay
}) => {
  return (
    <div className="flex flex-col gap-4 bg-transparent animate-fadeIn font-sans">
      {applicationType === 'PARTIAL_MUTATION' && (
        <div className="flex justify-end select-none mb-1">
          <button type="button" onClick={onAddTargetItem} disabled={loading} className="h-8 px-3.5 rounded-md bg-[#00a389] hover:bg-[#008f78] active:scale-95 text-white font-normal text-[13px] shadow-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0 disabled:opacity-50 font-sans">
            <Plus className="w-4 h-4 stroke-[3]" /> Tambah Pemilik Baru
          </button>
        </div>
      )}
      <div className="flex flex-col gap-6 font-sans">
        {(targetData || []).map((rawItem, idx) => {
          const item = rawItem || {};
          const availableDesa = KECAMATAN_DATA[item.objectKecamatan || ''] || [];
          return (
            <div key={idx} className={`flex flex-col gap-4 relative ${targetData.length > 1 ? 'p-5 border border-slate-200/80 rounded-md pt-10 shadow-3xs bg-white' : ''}`}>
              {targetData.length > 1 && (
                <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between select-none border-b border-slate-100 pb-1">
                  <span className="text-[13px] font-normal text-[#008f78] tracking-wide font-sans">Pemilik Baru #{idx + 1}</span>
                  <button type="button" onClick={() => onRemoveTargetItem(idx)} disabled={loading} className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 font-sans">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-normal text-slate-700 font-sans">
                    NOP Sementara {applicationType === 'NEW_TAX_OBJECT' ? <span className="text-red-500">*</span> : <span className="text-slate-400 text-xs">(Opsional / Ditentukan Sistem)</span>}
                  </label>
                  <input
                    type="text"
                    id={`targetData.${idx}.nopTemporary`}
                    maxLength={24}
                    placeholder={getPrimaryNopDisplay(previousData)}
                    value={item.nopTemporary || ''}
                    onChange={(e) => onTargetItemChange(idx, 'nopTemporary', e.target.value)}
                    disabled={loading}
                  className={getInputClass(!!formErrors[`targetData.${idx}.nopTemporary`], 'font-mono tracking-wide')}/>
                  {applicationType !== 'NEW_TAX_OBJECT' && (
                    <span className="text-[11px] text-slate-400 font-sans">
                      * 15 digit lokasi menginduk otomatis pada NOP Asal
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">Nomor WhatsApp Pemilik Baru <span className="text-red-500">*</span></label>
                  <div className={getWhatsAppContainerClass(!!formErrors[`targetData.${idx}.whatsappNumber`])}>
                    <span className="bg-slate-50 border-r border-slate-200 px-3.5 py-2.5 text-[13px] font-normal text-slate-600 select-none flex items-center gap-1 shrink-0 font-sans">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>+62</span>
                    </span>
                    <input type="text" id={`targetData.${idx}.whatsappNumber`} placeholder="81234567890" value={(item.whatsappNumber || '').startsWith('62') ? (item.whatsappNumber || '').slice(2) : (item.whatsappNumber || '')} onChange={(e) => {
                      let val = e.target.value.replace(/[^\d]/g, '');
                      if (val.startsWith('62')) val = val.slice(2);
                      const formatted = val ? '62' + val : '';
                      onTargetItemChange(idx, 'whatsappNumber', formatted);
                    }} disabled={loading} className="w-full px-3.5 py-2.5 text-[13px] font-normal text-slate-900 focus:outline-none bg-white font-sans" />
                  </div>
                  {formErrors[`targetData.${idx}.whatsappNumber`] && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5 font-sans">{formErrors[`targetData.${idx}.whatsappNumber`]}</span>}
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-[13px] font-normal text-slate-700 font-sans">Nama Pemilik Baru <span className="text-red-500">*</span></label>
                  <input type="text" id={`targetData.${idx}.ownerName`} placeholder="Contoh: BUDI SANTOSO" value={item.ownerName} onChange={(e) => onTargetItemChange(idx, 'ownerName', e.target.value.toUpperCase())} style={{ textTransform: 'uppercase' }} disabled={loading} className={getInputClass(!!formErrors[`targetData.${idx}.ownerName`])} />
                  {formErrors[`targetData.${idx}.ownerName`] && <span className="text-xs text-red-600 pl-1 mt-0.5">{formErrors[`targetData.${idx}.ownerName`]}</span>}
                </div>
                <div className="flex flex-col gap-5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <label className="text-[13px] font-normal text-slate-700 font-sans">Alamat Pemilik Baru <span className="text-red-500">*</span></label>
                    <div className="flex items-center gap-1.5 flex-wrap select-none">
                      {needPreviousData && previousData.length > 0 && (
                        <button type="button" onClick={() => onCopyOwnerFromPrevious(idx)} className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-[#e6f6f4] text-slate-600 hover:text-[#008f78] border border-slate-200 hover:border-[#00a389]/40 transition-all flex items-center gap-1 cursor-pointer font-sans" title="Salin alamat pemilik dari Data Lama">
                          <Copy className="w-3 h-3" />
                          <span>Salin Pemilik Lama</span>
                        </button>
                      )}
                      <button type="button" onClick={() => onCopyObjectToOwner(idx)} className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-[#e6f6f4] text-slate-600 hover:text-[#008f78] border border-slate-200 hover:border-[#00a389]/40 transition-all flex items-center gap-1 cursor-pointer font-sans" title="Samakan alamat pemilik dengan alamat objek baru">
                        <RefreshCw className="w-3 h-3" />
                        <span>Samakan dg Objek</span>
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <input type="text" id={`targetData.${idx}.ownerAddress`} placeholder="Contoh: JL. MERDEKA NO. 45" value={item.ownerAddress} onChange={(e) => onTargetItemChange(idx, 'ownerAddress', e.target.value.toUpperCase())} style={{ textTransform: 'uppercase' }} disabled={loading} className={getInputClass(!!formErrors[`targetData.${idx}.ownerAddress`])} />
                    {formErrors[`targetData.${idx}.ownerAddress`] && <span className="text-xs text-red-600 pl-1 mt-0.5">{formErrors[`targetData.${idx}.ownerAddress`]}</span>}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col gap-1"><label className="text-[13px] font-normal text-slate-700 font-sans">Blok</label><input type="text" placeholder="Contoh: C2" value={item.ownerBlock} onChange={(e) => onTargetItemChange(idx, 'ownerBlock', e.target.value.toUpperCase())} style={{ textTransform: 'uppercase' }} disabled={loading} className={getInputClass(!!formErrors[`targetData.${idx}.ownerBlock`])} /></div>
                    <div className="flex flex-col gap-1"><label className="text-[13px] font-normal text-slate-700 font-sans">RT</label><input type="text" placeholder="002" value={item.ownerRt} onChange={(e) => onTargetItemChange(idx, 'ownerRt', e.target.value)} disabled={loading} className={getInputClass(!!formErrors[`targetData.${idx}.ownerRt`])} /></div>
                    <div className="flex flex-col gap-1"><label className="text-[13px] font-normal text-slate-700 font-sans">RW</label><input type="text" placeholder="008" value={item.ownerRw} onChange={(e) => onTargetItemChange(idx, 'ownerRw', e.target.value)} disabled={loading} className={getInputClass(!!formErrors[`targetData.${idx}.ownerRw`])} /></div>
                  </div>
                  <div className="flex flex-col gap-1.5"><label className="text-[13px] font-normal text-slate-700 font-sans">Kecamatan Pemilik <span className="text-red-500">*</span></label><input type="text" id={`targetData.${idx}.ownerKecamatan`} placeholder="Contoh: PAKUHAJI" value={item.ownerKecamatan} onChange={(e) => onTargetItemChange(idx, 'ownerKecamatan', e.target.value.toUpperCase())} style={{ textTransform: 'uppercase' }} disabled={loading} className={getInputClass(!!formErrors[`targetData.${idx}.ownerKecamatan`])} /></div>
                  <div className="flex flex-col gap-1.5"><label className="text-[13px] font-normal text-slate-700 font-sans">Desa Pemilik <span className="text-red-500">*</span></label><input type="text" id={`targetData.${idx}.ownerDesa`} placeholder="Contoh: KOHOD" value={item.ownerDesa} onChange={(e) => onTargetItemChange(idx, 'ownerDesa', e.target.value.toUpperCase())} style={{ textTransform: 'uppercase' }} disabled={loading} className={getInputClass(!!formErrors[`targetData.${idx}.ownerDesa`])} /></div>
                </div>
                <div className="flex flex-col gap-5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <label className="text-[13px] font-normal text-slate-700 font-sans">Alamat Objek <span className="text-red-500">*</span></label>
                    {needPreviousData && previousData.length > 0 && (
                      <button type="button" onClick={() => onCopyObjectFromPrevious(idx)} className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-[#e6f6f4] text-slate-600 hover:text-[#008f78] border border-slate-200 hover:border-[#00a389]/40 transition-all flex items-center gap-1 cursor-pointer font-sans" title="Salin alamat objek dari Data Lama">
                        <Copy className="w-3 h-3" />
                        <span>Salin Objek Lama</span>
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <input type="text" id={`targetData.${idx}.objectAddress`} placeholder="Contoh: JL. MERDEKA NO. 45" value={item.objectAddress} onChange={(e) => onTargetItemChange(idx, 'objectAddress', e.target.value.toUpperCase())} style={{ textTransform: 'uppercase' }} disabled={loading} className={getInputClass(!!formErrors[`targetData.${idx}.objectAddress`])} />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col gap-1"><label className="text-[13px] font-normal text-slate-700 font-sans">Blok</label><input type="text" placeholder="Contoh: C2" value={item.objectBlock} onChange={(e) => onTargetItemChange(idx, 'objectBlock', e.target.value.toUpperCase())} style={{ textTransform: 'uppercase' }} disabled={loading} className={getInputClass()} /></div>
                    <div className="flex flex-col gap-1"><label className="text-[13px] font-normal text-slate-700 font-sans">RT</label><input type="text" placeholder="002" value={item.objectRt} onChange={(e) => onTargetItemChange(idx, 'objectRt', e.target.value)} disabled={loading} className={getInputClass()} /></div>
                    <div className="flex flex-col gap-1"><label className="text-[13px] font-normal text-slate-700 font-sans">RW</label><input type="text" placeholder="008" value={item.objectRw} onChange={(e) => onTargetItemChange(idx, 'objectRw', e.target.value)} disabled={loading} className={getInputClass()} /></div>
                  </div>
                  <div className="flex flex-col gap-1.5 font-sans">
                    <label className="text-[13px] font-normal text-slate-700 font-sans">Kecamatan Objek <span className="text-red-500">*</span></label>
                    <select id={`targetData.${idx}.objectKecamatan`} value={item.objectKecamatan || ''} onChange={(e) => onTargetItemChange(idx, 'objectKecamatan', e.target.value)} disabled={loading} className={getInputClass(!!formErrors[`targetData.${idx}.objectKecamatan`], 'cursor-pointer')}>
                      <option value="">-- Pilih Kecamatan --</option>
                      {Object.keys(KECAMATAN_DATA).map(kec => (
                        <option key={kec} value={kec}>{kec}</option>
                      ))}
                      {item.objectKecamatan && !KECAMATAN_DATA[item.objectKecamatan] && (
                        <option value={item.objectKecamatan}>{item.objectKecamatan}</option>
                      )}
                    </select>
                    {formErrors[`targetData.${idx}.objectKecamatan`] && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5">{formErrors[`targetData.${idx}.objectKecamatan`]}</span>}
                  </div>
                  <div className="flex flex-col gap-1.5 font-sans">
                    <label className="text-[13px] font-normal text-slate-700 font-sans">Desa Objek <span className="text-red-500">*</span></label>
                    <select id={`targetData.${idx}.objectDesa`} value={item.objectDesa || ''} onChange={(e) => onTargetItemChange(idx, 'objectDesa', e.target.value)} disabled={loading || !item.objectKecamatan} className={getInputClass(!!formErrors[`targetData.${idx}.objectDesa`], 'cursor-pointer')}>
                      <option value="">-- Pilih Desa --</option>
                      {availableDesa.map(desa => (
                        <option key={desa} value={desa}>{desa}</option>
                      ))}
                      {item.objectDesa && !availableDesa.includes(item.objectDesa) && (
                        <option value={item.objectDesa}>{item.objectDesa}</option>
                      )}
                    </select>
                    {formErrors[`targetData.${idx}.objectDesa`] && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5">{formErrors[`targetData.${idx}.objectDesa`]}</span>}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5"><label className="text-[13px] font-normal text-slate-700 font-sans">Luas Tanah <span className="text-red-500">*</span></label><div className="relative"><input type="number" id={`targetData.${idx}.landArea`} placeholder="Contoh: 200" value={item.landArea} onChange={(e) => onTargetItemChange(idx, 'landArea', e.target.value)} disabled={loading} className={getInputClass(!!formErrors[`targetData.${idx}.landArea`], 'pl-3.5 pr-10')} /><span className="text-slate-500 text-xs absolute right-3.5 top-1/2 -translate-y-1/2 select-none font-sans">m²</span></div>{formErrors[`targetData.${idx}.landArea`] && <span className="text-xs text-red-600 pl-1 mt-0.5">{formErrors[`targetData.${idx}.landArea`]}</span>}</div>
                <div className="flex flex-col gap-1.5"><label className="text-[13px] font-normal text-slate-700 font-sans">Luas Bangunan <span className="text-slate-400 text-xs">(Opsional)</span></label><div className="relative"><input type="number" placeholder="Contoh: 120 (0 jika tanah kosong)" value={item.buildingArea} onChange={(e) => onTargetItemChange(idx, 'buildingArea', e.target.value)} disabled={loading} className={getInputClass(false, 'pl-3.5 pr-10')} /><span className="text-slate-500 text-xs absolute right-3.5 top-1/2 -translate-y-1/2 select-none font-sans">m²</span></div></div>
                <div className="flex flex-col gap-1.5"><label className="text-[13px] font-normal text-slate-700 font-sans">No/Jenis Sertifikat <span className="text-red-500">*</span></label><input type="text" id={`targetData.${idx}.certificate`} placeholder="Contoh: SHM NO. 67890" value={item.certificate} onChange={(e) => onTargetItemChange(idx, 'certificate', e.target.value.toUpperCase())} style={{ textTransform: 'uppercase' }} disabled={loading} className={getInputClass(!!formErrors[`targetData.${idx}.certificate`])} />{formErrors[`targetData.${idx}.certificate`] && <span className="text-xs text-red-600 pl-1 mt-0.5">{formErrors[`targetData.${idx}.certificate`]}</span>}</div>

                <div className="flex flex-col gap-1.5 font-sans">
                  <label className="text-[13px] font-normal text-slate-700 font-sans flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                      <span>Upload Berkas / Lampiran Dokumen <span className="text-slate-400 text-xs">(Opsional)</span></span>
                    </span>
                  </label>

                  <label
                    htmlFor={`targetData.${idx}.files`}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (loading) return;
                      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        const newFiles = Array.from(e.dataTransfer.files);
                        const existingFiles = item.files || [];
                        onTargetItemChange(idx, 'files', [...existingFiles, ...newFiles]);
                      }
                    }}
                    className={`border border-dashed rounded-md px-3 py-2 transition-all cursor-pointer flex items-center justify-between bg-white hover:bg-[#e6f6f4]/20 group min-h-[38px] ${
                      loading ? 'opacity-50 cursor-not-allowed border-slate-200' : 'border-slate-300 hover:border-[#00a389]'
                    }`}
                  >
                    <input
                      id={`targetData.${idx}.files`}
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      disabled={loading}
                      className="hidden"
                      onChange={(e) => {
                        if (!e.target.files || e.target.files.length === 0) return;
                        const newFiles = Array.from(e.target.files);
                        const existingFiles = item.files || [];
                        onTargetItemChange(idx, 'files', [...existingFiles, ...newFiles]);
                        e.target.value = '';
                      }}
                    />
                    <div className="flex items-center gap-2 text-slate-600 group-hover:text-[#00a389] transition-colors truncate">
                      <UploadCloud className="w-4 h-4 text-slate-400 group-hover:text-[#00a389] shrink-0" />
                      <span className="text-[13px] font-normal truncate">
                        {item.files && item.files.length > 0 ? `${item.files.length} berkas dipilih` : 'Pilih/seret berkas (PDF, JPG, DOC)'}
                      </span>
                    </div>
                    <span className="text-[11px] bg-slate-100 group-hover:bg-[#00a389]/10 text-slate-500 group-hover:text-[#00a389] px-2 py-0.5 rounded shrink-0 transition-colors">
                      Browse
                    </span>
                  </label>

                  {item.files && item.files.length > 0 && (
                    <div className="flex flex-col gap-1.5 mt-0.5 font-sans">
                      {item.files.map((file: any, fIdx: number) => {
                        const fileName = file.name || `File ${fIdx + 1}`;
                        const fileSizeMB = file.size ? (file.size / (1024 * 1024)).toFixed(2) : null;
                        return (
                          <div key={fIdx} className="flex items-center justify-between bg-slate-50 border border-slate-200/80 rounded-md px-2.5 py-1.5 text-xs">
                            <div className="flex items-center gap-1.5 truncate">
                              <FileText className="w-3.5 h-3.5 text-[#00a389] shrink-0" />
                              <span className="font-medium text-slate-700 truncate">{fileName}</span>
                              {fileSizeMB && <span className="text-slate-400 text-[10px] shrink-0">({fileSizeMB} MB)</span>}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const currentFiles = item.files || [];
                                const updatedFiles = currentFiles.filter((_: any, i: number) => i !== fIdx);
                                onTargetItemChange(idx, 'files', updatedFiles);
                              }}
                              disabled={loading}
                              className="p-0.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
                              title="Hapus berkas"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1.5 sm:col-span-2"><label className="text-[13px] font-normal text-slate-700 font-sans">Catatan <span className="text-slate-400">(Opsional)</span></label><textarea rows={2} placeholder="Catatan tambahan data baru..." value={item.notes || ''} onChange={(e) => onTargetItemChange(idx, 'notes', e.target.value.toUpperCase())} style={{ textTransform: 'uppercase' }} disabled={loading} className={getInputClass(false, 'resize-y')} /></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
