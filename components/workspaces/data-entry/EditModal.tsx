"use client";

import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { ActionStatusModal } from '../shared/ActionStatusModal';
import { useEditModal } from './edit-application/useEditModal';
import { EditModalHeader } from './edit-application/EditModalHeader';
import { EditStepMainData } from './edit-application/EditStepMainData';
import { EditStepDataLama } from './edit-application/EditStepDataLama';
import { EditStepDataBaru } from './edit-application/EditStepDataBaru';

interface EditModalProps {
  editTarget: any;
  onClose: () => void;
  onSuccess: () => void;
}

const getInputClass = (hasError?: boolean, extraClass: string = '') => {
  const stateClass = hasError
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
    : 'border-slate-200/90 focus:border-[#00a389] focus:ring-[#00a389]/10';
  return `w-full bg-white border ${stateClass} rounded-md px-3.5 py-2.5 text-[13px] font-normal text-slate-900 focus:outline-none focus:ring-2 transition-all font-sans ${extraClass}`.trim();
};

export const EditModal: React.FC<EditModalProps> = React.memo(({ editTarget, onClose, onSuccess }) => {
  const modal = useEditModal({ editTarget, onClose, onSuccess });

  if (!editTarget) return null;

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-[999] animate-fadeIn">
      <div className="bg-white rounded-md max-w-4xl w-full max-h-[90vh] flex flex-col shadow-xl border border-slate-200/90 overflow-hidden animate-scaleUp">
        {/* Header & Stepper */}
        <EditModalHeader
          editTarget={editTarget}
          onClose={onClose}
          loading={modal.loading}
          steps={modal.steps}
          currentStep={modal.currentStep}
          setCurrentStep={modal.setCurrentStep}
          formProgress={modal.formProgress}
        />

        {/* Scrollable Modal Content */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 flex flex-col gap-6">
          {modal.error && (
            <div className="bg-red-50/80 border border-red-200/65 text-red-750 text-xs font-bold rounded-md px-4 py-3 flex items-start gap-2.5 animate-fadeIn shrink-0 font-sans">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              <span>{modal.error}</span>
            </div>
          )}

          {modal.success && (
            <div className="bg-emerald-50/80 border border-emerald-200/65 text-emerald-750 text-xs font-bold rounded-md px-4 py-3 flex items-start gap-2.5 animate-fadeIn shrink-0 font-sans">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <span>{modal.success}</span>
            </div>
          )}

          <form onSubmit={modal.handleUpdate} className="flex flex-col gap-6" autoComplete="off">
            {/* Step 1: Data Utama */}
            {modal.currentStepLabel === 'Data Utama' && (
              <EditStepMainData
                jenisPermohonan={modal.jenisPermohonan}
                onJenisPermohonanChange={modal.setJenisPermohonan}
                nomorPelayanan={modal.nomorPelayanan}
                onNomorPelayananChange={modal.setNomorPelayanan}
                tanggalNoPelayanan={modal.tanggalNoPelayanan}
                onTanggalNoPelayananChange={modal.setTanggalNoPelayanan}
                tanggalPenyelesaian={modal.tanggalPenyelesaian}
                onTanggalPenyelesaianChange={modal.setTanggalPenyelesaian}
                nop={modal.nop}
                onNopChange={modal.setNop}
                noWhatsapp={modal.noWhatsapp}
                onNoWhatsappChange={modal.setNoWhatsapp}
                formErrors={modal.formErrors}
                loading={modal.loading}
                getInputClass={getInputClass}
              />
            )}

            {/* Step 2: Data Lama (Asal) */}
            {modal.currentStepLabel === 'Data Lama (Asal)' && modal.needDataLama && (
              <EditStepDataLama
                namaPemilikLama={modal.namaPemilikLama}
                onNamaPemilikLamaChange={modal.setNamaPemilikLama}
                alamatPemilikLama={modal.alamatPemilikLama}
                onAlamatPemilikLamaChange={modal.setAlamatPemilikLama}
                blokPemilikLama={modal.blokPemilikLama}
                onBlokPemilikLamaChange={modal.setBlokPemilikLama}
                rtPemilikLama={modal.rtPemilikLama}
                onRtPemilikLamaChange={modal.setRtPemilikLama}
                rwPemilikLama={modal.rwPemilikLama}
                onRwPemilikLamaChange={modal.setRwPemilikLama}
                kecamatanPemilikLama={modal.kecamatanPemilikLama}
                onKecamatanPemilikLamaChange={modal.setKecamatanPemilikLama}
                desaPemilikLama={modal.desaPemilikLama}
                onDesaPemilikLamaChange={modal.setDesaPemilikLama}
                alamatObjekLama={modal.alamatObjekLama}
                onAlamatObjekLamaChange={modal.setAlamatObjekLama}
                blokObjekLama={modal.blokObjekLama}
                onBlokObjekLamaChange={modal.setBlokObjekLama}
                rtObjekLama={modal.rtObjekLama}
                onRtObjekLamaChange={modal.setRtObjekLama}
                rwObjekLama={modal.rwObjekLama}
                onRwObjekLamaChange={modal.setRwObjekLama}
                kecamatanObjekLama={modal.kecamatanObjekLama}
                onKecamatanObjekLamaChange={modal.setKecamatanObjekLama}
                desaObjekLama={modal.desaObjekLama}
                onDesaObjekLamaChange={modal.setDesaObjekLama}
                luasTanahLama={modal.luasTanahLama}
                onLuasTanahLamaChange={modal.setLuasTanahLama}
                luasBangunanLama={modal.luasBangunanLama}
                onLuasBangunanLamaChange={modal.setLuasBangunanLama}
                sertifikatLama={modal.sertifikatLama}
                onSertifikatLamaChange={modal.setSertifikatLama}
                formErrors={modal.formErrors}
                loading={modal.loading}
                getInputClass={getInputClass}
              />
            )}

            {/* Step 3: Data Baru */}
            {modal.currentStepLabel === 'Data Baru' && modal.needDataBaru && (
              <EditStepDataBaru
                jenisPermohonan={modal.jenisPermohonan}
                dataBaru={modal.dataBaru}
                onOwnerChange={modal.handleOwnerChange}
                onCopyPemilikFromLama={modal.handleCopyPemilikFromLama}
                onCopyFromLama={modal.handleCopyFromLama}
                onAddOwner={modal.handleAddOwner}
                onRemoveOwner={modal.handleRemoveOwner}
                copiedAlamatObjekIdx={modal.copiedAlamatObjekIdx}
                copiedAlamatPemilikIdx={modal.copiedAlamatPemilikIdx}
                needDataLama={modal.needDataLama}
                formErrors={modal.formErrors}
                loading={modal.loading}
                getInputClass={getInputClass}
              />
            )}

            {/* Modal Footer Navigation */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-200/80 mt-2 select-none">
              {modal.currentStep > 1 ? (
                <button
                  type="button"
                  onClick={modal.handlePrevStep}
                  disabled={modal.loading}
                  className="h-10 px-4 rounded-md border border-slate-200/90 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-normal text-[13px] font-sans transition-all cursor-pointer shadow-3xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  Sebelumnya
                </button>
              ) : (
                <div />
              )}

              {modal.currentStep < modal.steps.length ? (
                <button
                  type="button"
                  onClick={modal.handleNextStep}
                  disabled={modal.loading}
                  className="h-10 px-6 rounded-md bg-[#00a389] hover:bg-[#008f78] active:scale-95 text-white font-normal text-[13px] font-sans shadow-xs transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  Selanjutnya
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={modal.loading}
                  className="h-10 px-6 rounded-md bg-[#00a389] hover:bg-[#008f78] active:scale-95 text-white font-normal text-[13px] font-sans shadow-xs transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  Simpan Perubahan
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Action Status Modal */}
        <ActionStatusModal
          isOpen={modal.statusModalOpen}
          status={modal.statusModalStatus}
          title={modal.statusModalTitle}
          message={modal.statusModalMessage}
          onClose={modal.handleCloseStatusModal}
        />
      </div>
    </div>,
    document.body
  );
});

EditModal.displayName = 'EditModal';
