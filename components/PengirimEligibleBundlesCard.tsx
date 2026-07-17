"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { getEligibleBundles } from '@/app/actions/pengirim';
import { RecentTasksCardSkeleton } from '@/components/skeletons/SkeletonBase';
import { formatDate, toTitleCase } from '@/lib/displayHelpers';
import { Folder, CheckCircle, Clock } from 'lucide-react';

const CATEGORY_STYLES: Record<string, string> = {
  'MUTASI_SEBAGIAN': 'bg-indigo-50 text-indigo-700 border-indigo-100',
  'MUTASI_HABIS_UPDATE': 'bg-emerald-50 text-emerald-700 border-emerald-100',
  'MUTASI_HABIS_REGULER': 'bg-pink-50 text-pink-700 border-pink-100',
  'OBJEK_PAJAK_BARU': 'bg-amber-50 text-amber-700 border-amber-100',
  'PEMBETULAN': 'bg-purple-50 text-purple-700 border-purple-100',
  'PENGAKTIFAN': 'bg-rose-50 text-rose-700 border-rose-100',
};

export default function PengirimEligibleBundlesCard({ onViewAll }: { onViewAll?: () => void }) {
  const { searchQuery } = useDashboard();
  const [bundles, setBundles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBundles() {
      try {
        setIsLoading(true);
        const res = await getEligibleBundles();
        if (res.success && res.list) {
          setBundles(res.list.slice(0, 5)); // show top 5
        }
      } catch (error) {
        console.error('Failed to load eligible bundles:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchBundles();
  }, []);

  const filteredBundles = useMemo(() =>
    bundles.filter(item => {
      const creatorName = item.peneliti?.name || '';
      return (
        item.nomorBundle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        creatorName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }),
    [bundles, searchQuery]
  );

  if (isLoading) return <RecentTasksCardSkeleton />;

  return (
    <div id="pengirim-eligible-bundles-card" className="w-full flex flex-col font-sans select-none">
      <div className="flex items-center justify-between pb-[10px] border-b-2 border-gray-200/90 mb-3">
        <div className="flex items-center gap-1.5">
          <h2 className="text-[14px] font-bold text-[#1e2022] font-display">Antrean Bundle Terkunci (Locked)</h2>
        </div>
        <div className="flex items-center gap-3.5">
          <button
            onClick={onViewAll}
            className="text-xs font-bold text-[#4e5bf2] hover:text-[#2d39b8] transition-colors underline underline-offset-4 decoration-[1.5px] decoration-[#4e5bf2] cursor-pointer"
          >
            Kelola Bundle
          </button>
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

      <div className="flex flex-col flex-1 gap-1 min-h-[160px]">
        {filteredBundles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <p className="text-xs font-semibold">Tidak ada bundle terkunci di antrean</p>
          </div>
        ) : (
          filteredBundles.map((item) => {
            const tagClass = item.jenisPermohonan 
              ? (CATEGORY_STYLES[item.jenisPermohonan] || 'bg-slate-50 text-slate-700 border-slate-200/55')
              : 'bg-slate-50 text-slate-400 border-slate-250/30';
            
            const permohonanCount = item.permohonan?.length || 0;

            return (
              <div
                key={item.id}
                className="grid grid-cols-12 gap-2 items-center py-2.5 border-b border-[#eceff1] last:border-b-0 hover:bg-slate-50/50 rounded-xl px-2 transition-all"
              >
                {/* Left Column: Nomor Bundle & Peneliti */}
                <div className="col-span-6 min-w-0 pr-2 flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 shrink-0 border border-emerald-100/50">
                    <Folder className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11.5px] font-extrabold text-[#1e2022] truncate" title={item.nomorBundle}>
                      {item.nomorBundle}
                    </span>
                    <span className="text-[9.5px] text-gray-400 font-semibold truncate capitalize">
                      Peneliti: {item.peneliti?.name || 'Sistem'}
                    </span>
                  </div>
                </div>

                {/* Date Created */}
                <div className="col-span-3 text-[10.5px] font-semibold text-gray-450 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{formatDate(item.createdAt)}</span>
                </div>

                {/* Service Tag & Count */}
                <div className="col-span-3 flex items-center justify-between">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[8.5px] font-bold border leading-none capitalize truncate max-w-[80px] ${tagClass}`}>
                    {item.jenisPermohonan ? toTitleCase(item.jenisPermohonan) : 'Unassigned'}
                  </span>
                  <span className="text-[9.5px] text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/50">
                    {permohonanCount} WP
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
