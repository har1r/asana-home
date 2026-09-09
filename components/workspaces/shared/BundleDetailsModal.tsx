"use client";

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  FileSpreadsheet,
  Calendar,
  User,
  Layers,
  Lock,
  Archive,
  CheckCircle,
  FolderLock,
  Copy,
  Check,
  Eye,
  FileText
} from 'lucide-react';
import { formatNop, formatBundleNumber } from './constants';
import { DetailsModal } from './DetailsModal';

interface BundleDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bundle: any;
}

const getStatusBadge = (status: string) => {
  const s = (status || "").toUpperCase();
  if (s === "DRAFT") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 font-sans">
        <Layers className="w-3 h-3 text-slate-500" />
        <span>Draf</span>
      </span>
    );
  }
  if (s === "LOCKED" || s === "TERKUNCI") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-900 text-white shadow-3xs font-sans">
        <Lock className="w-3 h-3 text-amber-400" />
        <span>Terkunci</span>
      </span>
    );
  }
  if (s === "IN_MANIFEST" || s === "MANIFESTED") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-[#008f78] border border-emerald-200/80 shadow-3xs font-sans">
        <Archive className="w-3 h-3 text-[#008f78]" />
        <span>Manifest</span>
      </span>
    );
  }
  if (s === "COMPLETED" || s === "ARCHIVED" || s === "DELIVERED") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300/80 shadow-3xs font-sans">
        <CheckCircle className="w-3 h-3 text-emerald-600" />
        <span>Selesai</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 font-sans">
      <span>{status}</span>
    </span>
  );
};

const formatDateDisplay = (rawDateStr?: string) => {
  if (!rawDateStr) return "-";
  const dateObj = new Date(rawDateStr);
  if (isNaN(dateObj.getTime())) return rawDateStr;
  return dateObj.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getAppDetails = (app: any) => {
  const previousData = Array.isArray(app.previousData) ? app.previousData : [];
  const targetData = Array.isArray(app.targetData) ? app.targetData : [];
  const firstPrev = previousData[0] || {};
  const firstTarget = targetData[0] || {};
  const appType = app.applicationType || app.jenisPermohonan || '';

  const isPartialMutation = appType === 'PARTIAL_MUTATION' || appType === 'MUTASI_SEBAGIAN';
  const isReactivation = appType === 'REACTIVATION' || appType === 'PENGAKTIFAN';

  let calculatedNop = app.nop || '';
  if (appType === 'NEW_TAX_OBJECT' || appType === 'OBJEK_PAJAK_BARU') {
    calculatedNop = firstTarget.nopTemporary || firstTarget.nop || app.nop || '-';
  } else {
    calculatedNop = firstPrev.nop || app.nop || '-';
  }

  let calculatedOwnerName = '';
  if (isReactivation) {
    calculatedOwnerName = firstPrev.ownerName || firstPrev.namaPemilikLama || '-';
  } else if (isPartialMutation) {
    const firstName = firstTarget.ownerName || firstTarget.namaPemilikBaru || '';
    const totalCount = targetData.length;
    if (firstName && totalCount > 1) {
      calculatedOwnerName = `${firstName} (${totalCount})`;
    } else {
      calculatedOwnerName = firstName || '-';
    }
  } else {
    if (targetData.length > 0) {
      calculatedOwnerName = targetData
        .map((t: any) => t.ownerName || t.namaPemilikBaru)
        .filter(Boolean)
        .join(', ');
    }
    if (!calculatedOwnerName) {
      calculatedOwnerName = firstPrev.ownerName || app.ownerName || '-';
    }
  }

  return {
    nop: calculatedNop || '-',
    ownerName: calculatedOwnerName || '-',
  };
};

export const BundleDetailsModal: React.FC<BundleDetailsModalProps> = React.memo(({
  isOpen,
  onClose,
  bundle
}) => {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<any | null>(null);

  if (!isOpen || !bundle) return null;

  const rawBundleNumber = bundle.bundleNumber || bundle.nomorBundle || '';
  const bundleNum = rawBundleNumber ? formatBundleNumber(rawBundleNumber, bundle.createdAt) : '—';
  const applications: any[] = bundle.applications || bundle.permohonan || [];
  const creatorName = bundle.createdBy?.name || bundle.creatorName || bundle.peneliti?.name || 'Peneliti';

  const handleCopy = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 1200);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 select-none font-sans">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative z-[9995] w-full max-w-4xl max-h-[85vh] bg-white border border-slate-200/90 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-scaleUp">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-[#00a389] shrink-0">
              <FolderLock className="w-5 h-5 text-[#00a389]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 tracking-tight font-mono">
                  {bundleNum}
                </h3>
                {getStatusBadge(bundle.status)}
              </div>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                Daftar permohonan yang terikat di dalam bundle ini.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-slate-200/80 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            title="Tutup Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Info Sub-Header Bar */}
        <div className="bg-slate-50/80 px-6 py-3 border-b border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs shrink-0">
          <div>
            <span className="text-slate-500 text-[11px] font-semibold block">Tanggal Dibuat</span>
            <span className="font-semibold text-slate-800">{formatDateDisplay(bundle.createdAt)}</span>
          </div>
          <div>
            <span className="text-slate-500 text-[11px] font-semibold block">Pembuat / Peneliti</span>
            <span className="font-semibold text-slate-800">{creatorName}</span>
          </div>
          <div>
            <span className="text-slate-500 text-[11px] font-semibold block">Total Permohonan</span>
            <span className="font-semibold text-[#008f78]">{applications.length} Berkas</span>
          </div>
          <div>
            <span className="text-slate-500 text-[11px] font-semibold block">Jenis Layanan</span>
            <span className="font-semibold text-slate-800">{bundle.applicationType || 'Terbundel'}</span>
          </div>
        </div>

        {/* Modal Body: Table of Applications */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin bg-white">
          {applications.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400">
              <FileText className="w-9 h-9 stroke-[1.5] mb-2 text-slate-300" />
              <span className="text-xs font-semibold text-slate-600">Bundle ini belum memiliki permohonan terikat.</span>
            </div>
          ) : (
            <div className="w-full overflow-x-auto border border-slate-200/90 rounded-lg">
              <table className="w-full text-left border-collapse font-sans">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                    <th className="py-2.5 px-3.5 w-12 text-center">No</th>
                    <th className="py-2.5 px-3.5 min-w-[180px]">No. Permohonan</th>
                    <th className="py-2.5 px-3.5 min-w-[150px]">Tgl. Permohonan</th>
                    <th className="py-2.5 px-3.5 min-w-[180px]">Nama Pemohon</th>
                    <th className="py-2.5 px-3.5 min-w-[180px]">NOP Objek Pajak</th>
                    <th className="py-2.5 px-3.5 min-w-[110px]">Status</th>
                    <th className="py-2.5 px-3.5 w-12 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-normal text-slate-700">
                  {applications.map((app: any, idx: number) => {
                    const { nop, ownerName } = getAppDetails(app);
                    const appNo = app.applicationNumber || app.nomorPelayanan || '-';
                    const appDate = app.serviceNumberDate || app.createdAt;

                    return (
                      <tr
                        key={app.id || idx}
                        onClick={() => setSelectedApplication(app)}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      >
                        <td className="py-3 px-3.5 text-center text-slate-500 font-mono">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-3.5 font-bold font-mono text-slate-900">
                          <div className="flex items-center gap-2">
                            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{appNo}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3.5 text-slate-600">
                          {formatDateDisplay(appDate)}
                        </td>
                        <td className="py-3 px-3.5 font-medium text-slate-800">
                          {ownerName}
                        </td>
                        <td className="py-3 px-3.5 font-mono text-slate-700">
                          <div className="flex items-center gap-1.5">
                            <span>{nop !== '-' ? formatNop(nop) : '-'}</span>
                            {nop !== '-' && (
                              <button
                                type="button"
                                onClick={(e) => handleCopy(e, nop)}
                                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-700 p-0.5 rounded transition-opacity"
                                title="Salin NOP"
                              >
                                {copiedText === nop ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-[#008f78] border border-emerald-200/80">
                            {app.status || 'BUNDLED'}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedApplication(app);
                            }}
                            className="p-1 text-slate-400 hover:text-slate-800 rounded hover:bg-slate-200/60 transition-colors"
                            title="Lihat Detail Permohonan"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between bg-white shrink-0">
          <span className="text-xs text-slate-500 font-normal">
            Menampilkan {applications.length} permohonan terbundel
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* Embedded Details Modal for individual application if clicked inside table */}
      {selectedApplication && (
        <DetailsModal
          isOpen={Boolean(selectedApplication)}
          selectedRequest={selectedApplication}
          onClose={() => setSelectedApplication(null)}
        />
      )}
    </div>,
    document.body
  );
});

BundleDetailsModal.displayName = 'BundleDetailsModal';
