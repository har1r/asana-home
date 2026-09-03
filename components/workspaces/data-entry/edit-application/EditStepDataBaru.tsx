"use client";
import React from 'react';
import { Plus, Trash2, Copy, Check } from 'lucide-react';
import { KECAMATAN_DATA } from '../../shared/constants';

interface EditStepDataBaruProps {
  jenisPermohonan: string;
  dataBaru: any[];
  onOwnerChange: (idx: number, field: string, val: any) => void;
  onCopyPemilikFromLama: (idx: number) => void;
  onCopyFromLama: (idx: number) => void;
  onAddOwner: () => void;
  onRemoveOwner: (idx: number) => void;
  copiedAlamatObjekIdx: number | null;
  copiedAlamatPemilikIdx: number | null;
  needDataLama: boolean;
  formErrors: Record<string, string>;
  loading: boolean;
  getInputClass: (hasError?: boolean, extraClass?: string) => string;
}

export const EditStepDataBaru: React.FC<EditStepDataBaruProps> = ({
  jenisPermohonan,
  dataBaru,
  onOwnerChange,
  onCopyPemilikFromLama,
  onCopyFromLama,
  onAddOwner,
  onRemoveOwner,
  copiedAlamatObjekIdx,
  copiedAlamatPemilikIdx,
  needDataLama,
  formErrors,
  loading,
  getInputClass
}) => {
  return (
    <div className="flex flex-col gap-4 bg-transparent animate-fadeIn font-sans">
      {jenisPermohonan === 'MUTASI_SEBAGIAN' && (
        <div className="flex justify-end select-none mb-1">
          <button
            type="button"
            onClick={onAddOwner}
            disabled={loading}
            className="h-8 px-3.5 rounded-md bg-[#00a389] hover:bg-[#008f78] active:scale-95 text-white font-normal text-[13px] shadow-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0 disabled:opacity-50 font-sans"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Tambah Pemilik Baru
          </button>
        </div>
      )}

      {formErrors.dataBaru && (
        <div className="text-xs text-red-600 font-normal pl-1 font-sans">{formErrors.dataBaru}</div>
      )}

      <div className="flex flex-col gap-6 font-sans">
        {dataBaru.map((item, idx) => {
          const availableDesa = KECAMATAN_DATA[item.kecamatanObjekBaru || ''] || [];
          return (
            <div key={idx} className={`flex flex-col gap-4 relative ${dataBaru.length > 1 ? 'p-5 border border-slate-200/80 rounded-md pt-10 shadow-3xs bg-white' : ''}`}>
              {dataBaru.length > 1 && (
                <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between select-none border-b border-slate-100 pb-1">
                  <span className="text-[13px] font-normal text-[#008f78] tracking-wide font-sans">Pemilik Baru #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveOwner(idx)}
                    disabled={loading}
                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 font-sans">
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-[13px] font-normal text-slate-700 font-sans">Nama Pemilik Baru <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    id={`edit_dataBaru.${idx}.namaPemilikBaru`}
                    value={item.namaPemilikBaru}
                    onChange={(e) => onOwnerChange(idx, 'namaPemilikBaru', e.target.value.toUpperCase())}
                    style={{ textTransform: 'uppercase' }}
                    disabled={loading}
                    className={getInputClass(!!formErrors[`dataBaru.${idx}.namaPemilikBaru`])}
                  />
                  {formErrors[`dataBaru.${idx}.namaPemilikBaru`] && <span className="text-xs text-red-600 pl-1 mt-0.5">{formErrors[`dataBaru.${idx}.namaPemilikBaru`]}</span>}
                </div>

                {/* Data Pemilik Baru Group */}
                <div className="flex flex-col gap-5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <label className="text-[13px] font-normal text-slate-700 font-sans">Alamat Pemilik Baru <span className="text-red-500">*</span></label>
                    {needDataLama && (
                      <button
                        type="button"
                        onClick={() => onCopyPemilikFromLama(idx)}
                        className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-[#e6f6f4] text-slate-600 hover:text-[#008f78] border border-slate-200 hover:border-[#00a389]/40 transition-all flex items-center gap-1 cursor-pointer font-sans select-none shrink-0"
                        title="Salin alamat pemilik dari Data Lama"
                      >
                        {copiedAlamatPemilikIdx === idx ? (
                          <>
                            <Check className="w-3 h-3 text-[#00a389]" />
                            <span className="text-[#00a389]">Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Salin Pemilik Lama</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <input
                      type="text"
                      id={`edit_dataBaru.${idx}.alamatPemilikBaru`}
                      value={item.alamatPemilikBaru}
                      onChange={(e) => onOwnerChange(idx, 'alamatPemilikBaru', e.target.value.toUpperCase())}
                      style={{ textTransform: 'uppercase' }}
                      disabled={loading}
                      className={getInputClass(!!formErrors[`dataBaru.${idx}.alamatPemilikBaru`])}
                    />
                    {formErrors[`dataBaru.${idx}.alamatPemilikBaru`] && <span className="text-xs text-red-600 pl-1 mt-0.5">{formErrors[`dataBaru.${idx}.alamatPemilikBaru`]}</span>}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col gap-1"><label className="text-[13px] font-normal text-slate-700 font-sans">Blok</label><input type="text" placeholder="A4" value={item.blokPemilikBaru} onChange={(e) => onOwnerChange(idx, 'blokPemilikBaru', e.target.value.toUpperCase())} style={{ textTransform: 'uppercase' }} disabled={loading} className={getInputClass(false)} /></div>
                    <div className="flex flex-col gap-1"><label className="text-[13px] font-normal text-slate-700 font-sans">RT</label><input type="text" placeholder="001" value={item.rtPemilikBaru} onChange={(e) => onOwnerChange(idx, 'rtPemilikBaru', e.target.value)} disabled={loading} className={getInputClass(false)} /></div>
                    <div className="flex flex-col gap-1"><label className="text-[13px] font-normal text-slate-700 font-sans">RW</label><input type="text" placeholder="005" value={item.rwPemilikBaru} onChange={(e) => onOwnerChange(idx, 'rwPemilikBaru', e.target.value)} disabled={loading} className={getInputClass(false)} /></div>
                  </div>

                  <div className="flex flex-col gap-1.5 font-sans">
                    <label className="text-[13px] font-normal text-slate-700 font-sans">Kecamatan Pemilik <span className="text-red-500">*</span></label>
                    <input type="text" id={`edit_dataBaru.${idx}.kecamatanPemilikBaru`} value={item.kecamatanPemilikBaru} onChange={(e) => onOwnerChange(idx, 'kecamatanPemilikBaru', e.target.value.toUpperCase())} style={{ textTransform: 'uppercase' }} disabled={loading} className={getInputClass(!!formErrors[`dataBaru.${idx}.kecamatanPemilikBaru`])} />
                    {formErrors[`dataBaru.${idx}.kecamatanPemilikBaru`] && <span className="text-xs text-red-600 pl-1 mt-0.5">{formErrors[`dataBaru.${idx}.kecamatanPemilikBaru`]}</span>}
                  </div>

                  <div className="flex flex-col gap-1.5 font-sans">
                    <label className="text-[13px] font-normal text-slate-700 font-sans">Desa Pemilik <span className="text-red-500">*</span></label>
                    <input type="text" id={`edit_dataBaru.${idx}.desaPemilikBaru`} value={item.desaPemilikBaru} onChange={(e) => onOwnerChange(idx, 'desaPemilikBaru', e.target.value.toUpperCase())} style={{ textTransform: 'uppercase' }} disabled={loading} className={getInputClass(!!formErrors[`dataBaru.${idx}.desaPemilikBaru`])} />
                    {formErrors[`dataBaru.${idx}.desaPemilikBaru`] && <span className="text-xs text-red-600 pl-1 mt-0.5">{formErrors[`dataBaru.${idx}.desaPemilikBaru`]}</span>}
                  </div>
                </div>

                {/* Data Objek Baru Group */}
                <div className="flex flex-col gap-5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <label className="text-[13px] font-normal text-slate-700 font-sans">Alamat Objek Baru <span className="text-red-500">*</span></label>
                    {needDataLama && (
                      <button
                        type="button"
                        onClick={() => onCopyFromLama(idx)}
                        className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-[#e6f6f4] text-slate-600 hover:text-[#008f78] border border-slate-200 hover:border-[#00a389]/40 transition-all flex items-center gap-1 cursor-pointer font-sans select-none shrink-0"
                        title="Salin alamat objek dari Data Lama"
                      >
                        {copiedAlamatObjekIdx === idx ? (
                          <>
                            <Check className="w-3 h-3 text-[#00a389]" />
                            <span className="text-[#00a389]">Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Salin Objek Lama</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <input
                      type="text"
                      id={`edit_dataBaru.${idx}.alamatObjekBaru`}
                      value={item.alamatObjekBaru}
                      onChange={(e) => onOwnerChange(idx, 'alamatObjekBaru', e.target.value.toUpperCase())}
                      style={{ textTransform: 'uppercase' }}
                      disabled={loading}
                      className={getInputClass(!!formErrors[`dataBaru.${idx}.alamatObjekBaru`])}
                    />
                    {formErrors[`dataBaru.${idx}.alamatObjekBaru`] && <span className="text-xs text-red-600 pl-1 mt-0.5">{formErrors[`dataBaru.${idx}.alamatObjekBaru`]}</span>}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col gap-1"><label className="text-[13px] font-normal text-slate-700 font-sans">Blok</label><input type="text" placeholder="B2" value={item.blokObjekBaru} onChange={(e) => onOwnerChange(idx, 'blokObjekBaru', e.target.value.toUpperCase())} style={{ textTransform: 'uppercase' }} disabled={loading} className={getInputClass(false)} /></div>
                    <div className="flex flex-col gap-1"><label className="text-[13px] font-normal text-slate-700 font-sans">RT</label><input type="text" placeholder="001" value={item.rtObjekBaru} onChange={(e) => onOwnerChange(idx, 'rtObjekBaru', e.target.value)} disabled={loading} className={getInputClass(false)} /></div>
                    <div className="flex flex-col gap-1"><label className="text-[13px] font-normal text-slate-700 font-sans">RW</label><input type="text" placeholder="005" value={item.rwObjekBaru} onChange={(e) => onOwnerChange(idx, 'rwObjekBaru', e.target.value)} disabled={loading} className={getInputClass(false)} /></div>
                  </div>

                  <div className="flex flex-col gap-1.5 font-sans">
                    <label className="text-[13px] font-normal text-slate-700 font-sans">Kecamatan Objek <span className="text-red-500">*</span></label>
                    <select
                      id={`edit_dataBaru.${idx}.kecamatanObjekBaru`}
                      value={item.kecamatanObjekBaru || ''}
                      onChange={(e) => onOwnerChange(idx, 'kecamatanObjekBaru', e.target.value)}
                      disabled={loading}
                      className={getInputClass(!!formErrors[`dataBaru.${idx}.kecamatanObjekBaru`], 'cursor-pointer')}
                    >
                      <option value="">-- Pilih Kecamatan --</option>
                      {Object.keys(KECAMATAN_DATA).map((kec) => (
                        <option key={kec} value={kec}>{kec}</option>
                      ))}
                      {item.kecamatanObjekBaru && !KECAMATAN_DATA[item.kecamatanObjekBaru] && (
                        <option value={item.kecamatanObjekBaru}>{item.kecamatanObjekBaru}</option>
                      )}
                    </select>
                    {formErrors[`dataBaru.${idx}.kecamatanObjekBaru`] && <span className="text-xs text-red-600 pl-1 mt-0.5">{formErrors[`dataBaru.${idx}.kecamatanObjekBaru`]}</span>}
                  </div>

                  <div className="flex flex-col gap-1.5 font-sans">
                    <label className="text-[13px] font-normal text-slate-700 font-sans">Desa Objek <span className="text-red-500">*</span></label>
                    <select
                      id={`edit_dataBaru.${idx}.desaObjekBaru`}
                      value={item.desaObjekBaru || ''}
                      onChange={(e) => onOwnerChange(idx, 'desaObjekBaru', e.target.value)}
                      disabled={loading || !item.kecamatanObjekBaru}
                      className={getInputClass(!!formErrors[`dataBaru.${idx}.desaObjekBaru`], 'cursor-pointer')}
                    >
                      <option value="">-- Pilih Desa --</option>
                      {availableDesa.map((desa) => (
                        <option key={desa} value={desa}>{desa}</option>
                      ))}
                      {item.desaObjekBaru && !availableDesa.includes(item.desaObjekBaru) && (
                        <option value={item.desaObjekBaru}>{item.desaObjekBaru}</option>
                      )}
                    </select>
                    {formErrors[`dataBaru.${idx}.desaObjekBaru`] && <span className="text-xs text-red-600 pl-1 mt-0.5">{formErrors[`dataBaru.${idx}.desaObjekBaru`]}</span>}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 font-sans">
                  <label className="text-[13px] font-normal text-slate-700 font-sans">Luas Tanah Baru <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      type="number"
                      id={`edit_dataBaru.${idx}.luasTanahBaru`}
                      value={item.luasTanahBaru}
                      onChange={(e) => onOwnerChange(idx, 'luasTanahBaru', e.target.value)}
                      disabled={loading}
                      className={getInputClass(!!formErrors[`dataBaru.${idx}.luasTanahBaru`], 'pl-3.5 pr-10')}
                    />
                    <span className="text-slate-500 text-xs absolute right-3.5 top-1/2 -translate-y-1/2 select-none font-sans">m²</span>
                  </div>
                  {formErrors[`dataBaru.${idx}.luasTanahBaru`] && <span className="text-xs text-red-600 pl-1 mt-0.5">{formErrors[`dataBaru.${idx}.luasTanahBaru`]}</span>}
                </div>

                <div className="flex flex-col gap-1.5 font-sans">
                  <label className="text-[13px] font-normal text-slate-700 font-sans">Luas Bangunan Baru <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      type="number"
                      id={`edit_dataBaru.${idx}.luasBangunanBaru`}
                      value={item.luasBangunanBaru}
                      onChange={(e) => onOwnerChange(idx, 'luasBangunanBaru', e.target.value)}
                      disabled={loading}
                      className={getInputClass(!!formErrors[`dataBaru.${idx}.luasBangunanBaru`], 'pl-3.5 pr-10')}
                    />
                    <span className="text-slate-500 text-xs absolute right-3.5 top-1/2 -translate-y-1/2 select-none font-sans">m²</span>
                  </div>
                  {formErrors[`dataBaru.${idx}.luasBangunanBaru`] && <span className="text-xs text-red-600 pl-1 mt-0.5">{formErrors[`dataBaru.${idx}.luasBangunanBaru`]}</span>}
                </div>

                <div className="flex flex-col gap-1.5 sm:col-span-2 font-sans">
                  <label className="text-[13px] font-normal text-slate-700 font-sans">Sertifikat Baru <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    id={`edit_dataBaru.${idx}.sertifikatBaru`}
                    placeholder="SHM NO. 12345"
                    value={item.sertifikatBaru}
                    onChange={(e) => onOwnerChange(idx, 'sertifikatBaru', e.target.value.toUpperCase())}
                    style={{ textTransform: 'uppercase' }}
                    disabled={loading}
                    className={getInputClass(!!formErrors[`dataBaru.${idx}.sertifikatBaru`])}
                  />
                  {formErrors[`dataBaru.${idx}.sertifikatBaru`] && <span className="text-xs text-red-600 pl-1 mt-0.5">{formErrors[`dataBaru.${idx}.sertifikatBaru`]}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
