"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { getLockedBundles } from '@/app/actions/pengarsip';
import { RecentTasksCardSkeleton } from '@/components/skeletons/SkeletonBase';
import { toTitleCase, getInitials, getAvatarBg, formatDate } from '@/lib/displayHelpers';
import { Folder } from 'lucide-react';

const CATEGORY_STYLES: Record<string, string> = {
  'MUTASI_SEBAGIAN': 'bg-indigo-50 text-indigo-700 border-indigo-100/80',
  'MUTASI_HABIS_UPDATE': 'bg-emerald-50 text-emerald-700 border-emerald-100/80',
  'MUTASI_HABIS_REGULER': 'bg-pink-50 text-pink-700 border-pink-100/80',
  'OBJEK_PAJAK_BARU': 'bg-amber-50 text-amber-700 border-amber-100/80',
  'PEMBETULAN': 'bg-purple-50 text-purple-700 border-purple-100/80',
  'PENGAKTIFAN': 'bg-sky-50 text-sky-700 border-sky-100/80',
};

export default function PengarsipDigitizationQueueCard({ onViewAll }: { onViewAll?: () => void }) {
  const { searchQuery } = useDashboard();
  const [bundles, setBundles] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBundles() {
      try {
        setIsLoading(true);
        const res = await getLockedBundles(5);
        if (res.success && res.list) {
          setBundles(res.list);
          setTotalCount(res.total || 0);
        }
      } catch (error) {
        console.error('Failed to load locked bundles:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchBundles();
  }, []);

  // Memoized filter – always show all bundles (no global search filtering on homepage cards)
  const filteredBundles = useMemo(() => bundles, [bundles]);

  if (isLoading) return <RecentTasksCardSkeleton />;

  return (
    <div id="pengarsip-digitization-queue-card" className="w-full flex flex-col font-sans select-none">
      {/* Header bar — identik dengan RecentTasksCard */}
      <div className="flex items-center justify-between pb-[10px] border-b-2 border-gray-200/90 mb-3">
        <div className="flex items-center gap-1.5">
          <h2 className="text-[15px] font-bold text-[#1e2022] font-display">Antrean Digitalisasi</h2>
          {totalCount > 0 && (
            <span className="flex items-center justify-center bg-[#f25c54] text-white text-[11px] font-bold px-1.5 py-0.5 rounded-md leading-none">
              {totalCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3.5">
          <button
            onClick={onViewAll}
            className="text-xs font-bold text-[#4e5bf2] hover:text-[#2d39b8] underline underline-offset-4 decoration-[1.5px] decoration-[#4e5bf2] transition-colors cursor-pointer"
          >
            Mulai Digitalisasi
          </button>

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

      {/* Item list — tata letak flex identik dengan RecentTasksCard */}
      <div className="flex flex-col gap-1">
        {filteredBundles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-gray-400">
            <p className="text-xs">Tidak ada antrean digitalisasi</p>
          </div>
        ) : (
          filteredBundles.slice(0, 5).map((item) => {
            const tagClass = item.jenisPermohonan
              ? (CATEGORY_STYLES[item.jenisPermohonan] || 'bg-slate-50 text-slate-700 border-slate-200/50')
              : 'bg-slate-50 text-slate-400 border-slate-200/30';

            return (
              <div
                key={item.id}
                className="flex items-center justify-between pb-1.5 pt-1.5 border-b border-[#eceff1] group transition-all cursor-default hover:bg-slate-50/50 rounded-sm"
              >
                {/* Left: ikon kotak solid abu + nomor bundle & subtitle */}
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shadow-xs text-white shrink-0 bg-[#64748b]">
                    <Folder className="w-3.5 h-3.5 stroke-[2.25]" />
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span
                      className="text-[13px] font-bold text-[#1e2022] group-hover:text-indigo-600 transition-colors truncate"
                      title={item.nomorBundle}
                    >
                      {item.nomorBundle}
                    </span>

                    {/* Subtitle: tanggal • jenis layanan • status Antrean */}
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-semibold mt-0.5">
                      <span className="shrink-0">{formatDate(item.createdAt)}</span>
                      <span className="text-gray-300">•</span>
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-extrabold border leading-none capitalize truncate max-w-[90px] ${tagClass}`}>
                        {item.jenisPermohonan ? toTitleCase(item.jenisPermohonan) : 'Belum Ditentukan'}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className="inline-flex px-1.5 py-0.5 rounded text-[9px] font-extrabold border leading-none bg-emerald-50 text-emerald-700 border-emerald-100/80">
                        Antrean
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: avatar inisial peneliti pembuat bundle */}
                <div className="flex items-center gap-3 shrink-0 pl-2">
                  <div className="flex -space-x-1 items-center select-none">
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white ring-2 ring-white ${getAvatarBg(item.peneliti?.name || '')}`}
                      title={item.peneliti?.name || 'Unknown'}
                    >
                      {getInitials(item.peneliti?.name || 'Unknown')}
                    </div>
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
