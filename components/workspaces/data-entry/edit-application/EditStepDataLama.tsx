"use client";
import React from 'react';
import { KECAMATAN_DATA } from '../../shared/constants';

interface EditStepDataLamaProps {
  namaPemilikLama: string;
  onNamaPemilikLamaChange: (val: string) => void;
  alamatPemilikLama: string;
  onAlamatPemilikLamaChange: (val: string) => void;
  blokPemilikLama: string;
  onBlokPemilikLamaChange: (val: string) => void;
  rtPemilikLama: string;
  onRtPemilikLamaChange: (val: string) => void;
  rwPemilikLama: string;
  onRwPemilikLamaChange: (val: string) => void;
  kecamatanPemilikLama: string;
  onKecamatanPemilikLamaChange: (val: string) => void;
  desaPemilikLama: string;
  onDesaPemilikLamaChange: (val: string) => void;
  alamatObjekLama: string;
  onAlamatObjekLamaChange: (val: string) => void;
  blokObjekLama: string;
  onBlokObjekLamaChange: (val: string) => void;
  rtObjekLama: string;
  onRtObjekLamaChange: (val: string) => void;
  rwObjekLama: string;
  onRwObjekLamaChange: (val: string) => void;
  kecamatanObjekLama: string;
  onKecamatanObjekLamaChange: (val: string) => void;
  desaObjekLama: string;
  onDesaObjekLamaChange: (val: string) => void;
  luasTanahLama: string;
  onLuasTanahLamaChange: (val: string) => void;
  luasBangunanLama: string;
  onLuasBangunanLamaChange: (val: string) => void;
  sertifikatLama: string;
  onSertifikatLamaChange: (val: string) => void;
  formErrors: Record<string, string>;
  loading: boolean;
  getInputClass: (hasError?: boolean, extraClass?: string) => string;
}

export const EditStepDataLama: React.FC<EditStepDataLamaProps> = ({
  namaPemilikLama,
  onNamaPemilikLamaChange,
  alamatPemilikLama,
  onAlamatPemilikLamaChange,
  blokPemilikLama,
  onBlokPemilikLamaChange,
  rtPemilikLama,
  onRtPemilikLamaChange,
  rwPemilikLama,
  onRwPemilikLamaChange,
  kecamatanPemilikLama,
  onKecamatanPemilikLamaChange,
  desaPemilikLama,
  onDesaPemilikLamaChange,
  alamatObjekLama,
  onAlamatObjekLamaChange,
  blokObjekLama,
  onBlokObjekLamaChange,
  rtObjekLama,
  onRtObjekLamaChange,
  rwObjekLama,
  onRwObjekLamaChange,
  kecamatanObjekLama,
  onKecamatanObjekLamaChange,
  desaObjekLama,
  onDesaObjekLamaChange,
  luasTanahLama,
  onLuasTanahLamaChange,
  luasBangunanLama,
  onLuasBangunanLamaChange,
  sertifikatLama,
  onSertifikatLamaChange,
  formErrors,
  loading,
  getInputClass
}) => {
  const availableDesa = KECAMATAN_DATA[kecamatanObjekLama || ''] || [];

  return (
    <div className="flex flex-col gap-5 bg-transparent animate-fadeIn font-sans">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">Nama Pemilik Lama <span className="text-red-500">*</span></label>
          <input
            type="text"
            id="edit_namaPemilikLama"
            value={namaPemilikLama}
            onChange={(e) => onNamaPemilikLamaChange(e.target.value.toUpperCase())}
            style={{ textTransform: 'uppercase' }}
            disabled={loading}
            className={getInputClass(!!formErrors.namaPemilikLama)}
          />
          {formErrors.namaPemilikLama && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5 font-sans">{formErrors.namaPemilikLama}</span>}
        </div>

        {/* Data Pemilik Lama Group */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">Alamat Pemilik Lama <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="edit_alamatPemilikLama"
              value={alamatPemilikLama}
              onChange={(e) => onAlamatPemilikLamaChange(e.target.value.toUpperCase())}
              style={{ textTransform: 'uppercase' }}
              disabled={loading}
              className={getInputClass(!!formErrors.alamatPemilikLama)}
            />
            {formErrors.alamatPemilikLama && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5 font-sans">{formErrors.alamatPemilikLama}</span>}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-[13px] font-normal text-slate-700 font-sans">Blok</label>
              <input type="text" placeholder="A4" value={blokPemilikLama} onChange={(e) => onBlokPemilikLamaChange(e.target.value.toUpperCase())} style={{ textTransform: 'uppercase' }} disabled={loading} className={getInputClass(false)} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[13px] font-normal text-slate-700 font-sans">RT</label>
              <input type="text" placeholder="001" value={rtPemilikLama} onChange={(e) => onRtPemilikLamaChange(e.target.value)} disabled={loading} className={getInputClass(false)} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[13px] font-normal text-slate-700 font-sans">RW</label>
              <input type="text" placeholder="005" value={rwPemilikLama} onChange={(e) => onRwPemilikLamaChange(e.target.value)} disabled={loading} className={getInputClass(false)} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 font-sans">
            <label className="text-[13px] font-normal text-slate-700 font-sans">Kecamatan Pemilik <span className="text-slate-400 text-xs">(Opsional)</span></label>
            <input type="text" id="edit_kecamatanPemilikLama" value={kecamatanPemilikLama} onChange={(e) => onKecamatanPemilikLamaChange(e.target.value.toUpperCase())} style={{ textTransform: 'uppercase' }} disabled={loading} className={getInputClass(false)} />
          </div>

          <div className="flex flex-col gap-1.5 font-sans">
            <label className="text-[13px] font-normal text-slate-700 font-sans">Desa Pemilik <span className="text-slate-400 text-xs">(Opsional)</span></label>
            <input type="text" id="edit_desaPemilikLama" value={desaPemilikLama} onChange={(e) => onDesaPemilikLamaChange(e.target.value.toUpperCase())} style={{ textTransform: 'uppercase' }} disabled={loading} className={getInputClass(false)} />
          </div>
        </div>

        {/* Data Objek Lama Group */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-normal text-slate-700 tracking-wide font-sans">Alamat Objek Lama <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="edit_alamatObjekLama"
              value={alamatObjekLama}
              onChange={(e) => onAlamatObjekLamaChange(e.target.value.toUpperCase())}
              style={{ textTransform: 'uppercase' }}
              disabled={loading}
              className={getInputClass(!!formErrors.alamatObjekLama)}
            />
            {formErrors.alamatObjekLama && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5 font-sans">{formErrors.alamatObjekLama}</span>}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-[13px] font-normal text-slate-700 font-sans">Blok</label>
              <input type="text" placeholder="B2" value={blokObjekLama} onChange={(e) => onBlokObjekLamaChange(e.target.value.toUpperCase())} style={{ textTransform: 'uppercase' }} disabled={loading} className={getInputClass(false)} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[13px] font-normal text-slate-700 font-sans">RT</label>
              <input type="text" placeholder="001" value={rtObjekLama} onChange={(e) => onRtObjekLamaChange(e.target.value)} disabled={loading} className={getInputClass(false)} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[13px] font-normal text-slate-700 font-sans">RW</label>
              <input type="text" placeholder="005" value={rwObjekLama} onChange={(e) => onRwObjekLamaChange(e.target.value)} disabled={loading} className={getInputClass(false)} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 font-sans">
            <label className="text-[13px] font-normal text-slate-700 font-sans">Kecamatan Objek <span className="text-red-500">*</span></label>
            <select
              id="edit_kecamatanObjekLama"
              value={kecamatanObjekLama || ''}
              onChange={(e) => onKecamatanObjekLamaChange(e.target.value)}
              disabled={loading}
              className={getInputClass(!!formErrors.kecamatanObjekLama, 'cursor-pointer')}
            >
              <option value="">-- Pilih Kecamatan --</option>
              {Object.keys(KECAMATAN_DATA).map((kec) => (
                <option key={kec} value={kec}>{kec}</option>
              ))}
              {kecamatanObjekLama && !KECAMATAN_DATA[kecamatanObjekLama] && (
                <option value={kecamatanObjekLama}>{kecamatanObjekLama}</option>
              )}
            </select>
            {formErrors.kecamatanObjekLama && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5 font-sans">{formErrors.kecamatanObjekLama}</span>}
          </div>

          <div className="flex flex-col gap-1.5 font-sans">
            <label className="text-[13px] font-normal text-slate-700 font-sans">Desa Objek <span className="text-red-500">*</span></label>
            <select
              id="edit_desaObjekLama"
              value={desaObjekLama || ''}
              onChange={(e) => onDesaObjekLamaChange(e.target.value)}
              disabled={loading || !kecamatanObjekLama}
              className={getInputClass(!!formErrors.desaObjekLama, 'cursor-pointer')}
            >
              <option value="">-- Pilih Desa --</option>
              {availableDesa.map((desa) => (
                <option key={desa} value={desa}>{desa}</option>
              ))}
              {desaObjekLama && !availableDesa.includes(desaObjekLama) && (
                <option value={desaObjekLama}>{desaObjekLama}</option>
              )}
            </select>
            {formErrors.desaObjekLama && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5 font-sans">{formErrors.desaObjekLama}</span>}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-normal text-slate-700 font-sans">Luas Tanah Lama <span className="text-red-500">*</span></label>
          <div className="relative">
            <input
              type="number"
              id="edit_luasTanahLama"
              value={luasTanahLama}
              onChange={(e) => onLuasTanahLamaChange(e.target.value)}
              disabled={loading}
              className={getInputClass(!!formErrors.luasTanahLama, 'pl-3.5 pr-10')}
            />
            <span className="text-slate-500 text-xs absolute right-3.5 top-1/2 -translate-y-1/2 select-none font-sans">m²</span>
          </div>
          {formErrors.luasTanahLama && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5 font-sans">{formErrors.luasTanahLama}</span>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-normal text-slate-700 font-sans">Luas Bangunan Lama <span className="text-red-500">*</span></label>
          <div className="relative">
            <input
              type="number"
              id="edit_luasBangunanLama"
              value={luasBangunanLama}
              onChange={(e) => onLuasBangunanLamaChange(e.target.value)}
              disabled={loading}
              className={getInputClass(!!formErrors.luasBangunanLama, 'pl-3.5 pr-10')}
            />
            <span className="text-slate-500 text-xs absolute right-3.5 top-1/2 -translate-y-1/2 select-none font-sans">m²</span>
          </div>
          {formErrors.luasBangunanLama && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5 font-sans">{formErrors.luasBangunanLama}</span>}
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2 font-sans">
          <label className="text-[13px] font-normal text-slate-700 font-sans">Sertifikat Lama <span className="text-red-500">*</span></label>
          <input
            type="text"
            id="edit_sertifikatLama"
            placeholder="SHM NO. 12345"
            value={sertifikatLama}
            onChange={(e) => onSertifikatLamaChange(e.target.value.toUpperCase())}
            style={{ textTransform: 'uppercase' }}
            disabled={loading}
            className={getInputClass(!!formErrors.sertifikatLama)}
          />
          {formErrors.sertifikatLama && <span className="text-xs text-red-600 font-normal pl-1 mt-0.5 font-sans">{formErrors.sertifikatLama}</span>}
        </div>
      </div>
    </div>
  );
};
