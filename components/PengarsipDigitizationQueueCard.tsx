"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { getDigitizationBundles } from '@/app/actions/pengarsip';
import { TasksRevisionCardSkeleton } from '@/components/skeletons/SkeletonBase';
import { toTitleCase, formatDate } from '@/lib/displayHelpers';
import { Folder, AlertCircle } from 'lucide-react';

const CATEGORY_STYLES: Record<string, string> = {
  'MUTASI_SEBAGIAN': 'bg-indigo-100 text-indigo-950 border-indigo-200/50',
  'MUTASI_HABIS_UPDATE': 'bg-emerald-100 text-emerald-900 border-emerald-200/50',
  'MUTASI_HABIS_REGULER': 'bg-pink-100 text-pink-900 border-pink-200/50',
  'OBJEK_PAJAK_BARU': 'bg-amber-100 text-amber-900 border-amber-200/50',
  'PEMBETULAN': 'bg-purple-100 text-purple-900 border-purple-200/50',
  'PENGAKTIFAN': 'bg-rose-100 text-rose-900 border-rose-200/50',
};

const STATUS_STYLES: Record<string, string> = {
  'LOCKED': 'bg-emerald-50 text-emerald-700 border-emerald-100',
  'IN_MANIFEST': 'bg-red-50 text-red-700 border-red-100',
};

export default function PengarsipDigitizationQueueCard({ onViewAll }: { onViewAll?: () => void }) {
  const { searchQuery } = useDashboard();
  const [bundles, setBundles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBundles() {
      try {
        setIsLoading(true);
        const res = await getDigitizationBundles();
        if (res.success && res.list) {
          setBundles(res.list);
        }
      } catch (error) {
        console.error('Failed to load digitization bundles:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchBundles();
  }, []);

  const filteredBundles = useMemo(() =>
    bundles.filter(item => {
      const creatorName = item.peneliti?.name || '';
      const jenis = item.jenisPermohonan || '';
      return (
        item.nomorBundle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        jenis.toLowerCase().includes(searchQuery.toLowerCase()) ||
        creatorName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }),
    [bundles, searchQuery]
  );

  const activeCount = bundles.length;

  if (isLoading) return <TasksRevisionCardSkeleton />;

  return (
    <div id="pengarsip-digitization-queue-card" className="w-full flex flex-col font-sans select-none">
      {/* Header bar matching original styling */}
      <div className="flex items-center justify-between pb-[10px] border-b-2 border-gray-200/90 mb-3 font-sans">
        <div className="flex items-center gap-1.5">
          <h2 className="text-[15px] font-bold text-[#1e2022] font-display">Antrean Digitalisasi Bundle</h2>
          {activeCount > 0 && (
            <span className="flex items-center justify-center bg-[#4e5bf2] text-white text-[11px] font-bold px-1.5 py-0.5 rounded-md leading-none">
              {activeCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3.5 font-sans">
          <div className="flex items-center gap-2.5 text-xs font-bold text-[#4e5bf2]">
            <button
              onClick={onViewAll}
              className="hover:text-[#2d39b8] transition-colors underline underline-offset-4 decoration-[1.5px] decoration-[#4e5bf2] cursor-pointer"
            >
              Mulai Digitalisasi
            </button>
          </div>

          {/* Grip icon */}
          <div className="flex gap-0.5 justify-center text-[#9ca3af] opacity-60">
            <div className="flex flex-col gap-0.5">
              <span className="w-1 h-1 rounded-full bg-current" />
              <span className="w-1 h-1 rounded-full bg-current" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="w-1 h-1 rounded-full bg-current" />
              <span className="w-1 h-1 rounded-full bg-current" />
            </div>
          </div>
        </div>
      </div>

      {/* Bundle list table */}
      <div className="flex flex-col flex-1 gap-1 min-h-[160px]">
        {filteredBundles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-gray-400">
            <p className="text-xs">Tidak ada antrean digitalisasi</p>
          </div>
        ) : (
          filteredBundles.slice(0, 5).map((item) => {
            const tagClass = item.jenisPermohonan 
              ? (CATEGORY_STYLES[item.jenisPermohonan] || 'bg-slate-100 text-slate-900 border-slate-200/50')
              : 'bg-slate-50 text-slate-400 border-slate-200/30';
            
            const isReupload = item.status === 'IN_MANIFEST';
            const statusLabel = isReupload ? 'Unggah Ulang' : 'Antrean';
            const statusClass = STATUS_STYLES[item.status] || 'bg-slate-100 text-slate-700';
            const count = item.permohonan?.length || 0;

            return (
              <div
                key={item.id}
                className="task-row grid grid-cols-12 gap-2 items-center pb-2 pt-2 border-b border-[#eceff1] group transition-all relative"
              >
                {/* Left Column: Nomor Bundle & Pembuat */}
                <div className="col-span-5 min-w-0 pr-2 flex items-center gap-2">
                  <div className={`p-1 rounded-lg shrink-0 ${isReupload ? 'bg-red-50 text-red-650' : 'bg-indigo-50 text-indigo-600'}`}>
                    <Folder className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span
                      className="text-[12px] font-bold text-[#1e2022] truncate cursor-default block"
                      title={item.nomorBundle}
                    >
                      {item.nomorBundle}
                    </span>
                    <span className="text-[10px] text-gray-400 font-semibold truncate capitalize">
                      Dibuat Oleh: {item.peneliti?.name || 'Sistem'}
                    </span>
                  </div>
                </div>

                {/* Date locked/locked */}
                <span className="col-span-2 text-[11px] font-semibold text-gray-400 text-left">
                  {formatDate(item.createdAt)}
                </span>

                {/* Jenis Layanan Badge */}
                <div className="col-span-3 flex justify-start">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold border leading-none ${tagClass} text-center select-none`} title={item.jenisPermohonan ? toTitleCase(item.jenisPermohonan) : 'Kosong'}>
                    {item.jenisPermohonan ? toTitleCase(item.jenisPermohonan) : 'Belum Ditentukan'}
                  </span>
                </div>

                {/* Status & Capacity */}
                <div className="col-span-2 flex flex-col items-end gap-1">
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold border ${statusClass} leading-none flex items-center gap-0.5`}>
                    {isReupload && <AlertCircle className="w-2 h-2" />}
                    {statusLabel}
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold">
                    {count} berkas
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
