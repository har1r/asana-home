"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useDashboard } from '@/context/DashboardContext';
import { getRevisionPermohonans } from '@/app/actions/penginput';
import { TasksRevisionCardSkeleton } from '@/components/skeletons/SkeletonBase';
import { toTitleCase, getInitials, getAvatarBg, formatDate } from '@/lib/displayHelpers';

const CATEGORY_STYLES: Record<string, string> = {
  'MUTASI_SEBAGIAN':     'bg-indigo-100 text-indigo-700',
  'MUTASI_HABIS_UPDATE': 'bg-emerald-100 text-emerald-700',
  'MUTASI_HABIS_REGULER':'bg-pink-100 text-pink-700',
  'OBJEK_PAJAK_BARU':    'bg-amber-100 text-amber-700',
  'PEMBETULAN':          'bg-purple-100 text-purple-700',
  'PENGAKTIFAN':         'bg-rose-100 text-rose-700',
};

export default function TasksRevisionCard({ onViewAll }: { onViewAll?: () => void }) {
  const { data: session } = useSession();
  const { searchQuery } = useDashboard();
  const [revisions, setRevisions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRevisions() {
      try {
        setIsLoading(true);
        const res = await getRevisionPermohonans();
        if (res.success && res.list) {
          setRevisions(res.list);
        }
      } catch (error) {
        console.error('Failed to load revision permohonans:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchRevisions();
  }, []);

  // Memoized filter – only recomputes when revisions list or searchQuery change
  const filteredRevisions = useMemo(() =>
    revisions.filter(item => {
      const namaPemilik = item.jenisPermohonan === 'PENGAKTIFAN'
        ? (item.namaPemilikLama || '')
        : (item.dataBaru?.[0]?.namaPemilikBaru || item.namaWajibPajak || '');

      return (
        namaPemilik.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nop.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.jenisPermohonan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.penginput?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }),
    [revisions, searchQuery]
  );

  const activeCount = revisions.length;

  if (isLoading) return <TasksRevisionCardSkeleton />;

  return (
    <div id="tasks-due-card" className="w-full flex flex-col font-sans select-none">
      {/* Header bar matching screenshot styling */}
      <div className="flex items-center justify-between pb-[10px] border-b-2 border-gray-200/90 mb-3 font-sans">
        <div className="flex items-center gap-1.5">
          <h2 className="text-[15px] font-bold text-[#1e2022] font-display">Permohonan Revisi</h2>
          {activeCount > 0 && (
            <span className="flex items-center justify-center bg-[#f25c54] text-white text-[11px] font-bold px-1.5 py-0.5 rounded-md leading-none">
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
              Semua Revisi
            </button>
          </div>

          {/* Beautiful four-dot grip icon */}
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

      {/* Task List table */}
      <div className={`flex flex-col flex-1 gap-1 ${filteredRevisions.length === 0 ? 'min-h-[160px] justify-center' : 'justify-start mt-1'}`}>
        {filteredRevisions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center select-none animate-fadeIn gap-2.5">
            <div className="w-11 h-11 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-100/60 flex items-center justify-center shadow-3xs animate-pulse">
              <CheckCircle2 className="w-5.5 h-5.5 stroke-[1.85]" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-700">Semua Permohonan Aman!</p>
              <p className="text-[10px] text-slate-400 font-semibold max-w-[240px] leading-relaxed mx-auto">
                {searchQuery 
                  ? "Tidak ada permohonan revisi yang cocok dengan kata kunci pencarian Anda." 
                  : "Semua berkas bersih dan tidak memerlukan perbaikan atau revisi saat ini."}
              </p>
            </div>
          </div>
        ) : (
          filteredRevisions.slice(0, 5).map((item) => {
            const tagClass = CATEGORY_STYLES[item.jenisPermohonan] || 'bg-slate-100 text-slate-600';
            const namaPemilik = item.jenisPermohonan === 'PENGAKTIFAN'
              ? (item.namaPemilikLama || '')
              : (item.dataBaru?.[0]?.namaPemilikBaru || item.namaWajibPajak || '');

            return (
              <div
                key={item.id}
                className="task-row grid grid-cols-12 gap-2 items-center pb-2 pt-2 border-b border-[#eceff1] group transition-all relative select-none"
              >
                {/* Column 1: Nomor Pelayanan (Left Aligned) */}
                <div className="col-span-3 min-w-0 pr-2">
                  <span className="text-[11px] font-semibold text-[#1e2022] select-none truncate block">
                    {item.nomorPelayanan || item.nomorPermohonan}
                  </span>
                </div>

                {/* Column 2: Nama Pemilik (Left Aligned) */}
                <div className="col-span-3 min-w-0 pr-2">
                  <span
                    className="text-[13px] font-bold text-[#1e2022] truncate cursor-pointer block capitalize"
                    title={namaPemilik.toLowerCase()}
                  >
                    {namaPemilik.toLowerCase()}
                  </span>
                </div>

                {/* Column 3: Date Inputted (Centered) */}
                <div className="col-span-2 flex justify-center">
                  <span className="text-[11px] font-semibold text-gray-400 text-center select-none">
                    {new Date(item.updatedAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })}
                  </span>
                </div>

                {/* Column 4: Service Type Badge (Centered) */}
                <div className="col-span-3 flex justify-center overflow-hidden">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-bold leading-none ${tagClass} text-center select-none truncate max-w-full`} title={toTitleCase(item.jenisPermohonan)}>
                    {toTitleCase(item.jenisPermohonan)}
                  </span>
                </div>

                {/* Column 5: Inputter Initial Avatar (Right Aligned) */}
                <div className="col-span-1 flex items-center justify-end select-none">
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-bold text-white ring-2 ring-white cursor-pointer ${getAvatarBg(item.penginput?.name || '')}`}
                    title={item.penginput?.name || 'Unknown'}
                  >
                    {getInitials(item.penginput?.name || 'Unknown')}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
