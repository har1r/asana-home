"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { getManifests } from '@/app/actions/pengirim';
import { TasksRevisionCardSkeleton } from '@/components/skeletons/SkeletonBase';
import { formatDate } from '@/lib/displayHelpers';
import { Layers, CheckCircle2, Shield, Calendar } from 'lucide-react';

const STATUS_STYLES: Record<string, string> = {
  'DRAFT': 'bg-amber-50 text-amber-700 border-amber-100',
  'LOCKED': 'bg-emerald-50 text-emerald-700 border-emerald-100',
  'SENT': 'bg-indigo-50 text-indigo-700 border-indigo-100',
};

export default function PengirimManifestListCard({ onViewAll }: { onViewAll?: () => void }) {
  const { searchQuery } = useDashboard();
  const [manifests, setManifests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchManifests() {
      try {
        setIsLoading(true);
        const res = await getManifests();
        if (res.success && res.list) {
          setManifests(res.list.slice(0, 5)); // show top 5
        }
      } catch (error) {
        console.error('Failed to load recent manifests:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchManifests();
  }, []);

  const filteredManifests = useMemo(() =>
    manifests.filter(item => {
      const creatorName = item.pengirim?.name || '';
      return (
        item.nomorManifest.toLowerCase().includes(searchQuery.toLowerCase()) ||
        creatorName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }),
    [manifests, searchQuery]
  );

  if (isLoading) return <TasksRevisionCardSkeleton />;

  return (
    <div id="pengirim-manifest-list-card" className="w-full flex flex-col font-sans select-none">
      <div className="flex items-center justify-between pb-[10px] border-b-2 border-gray-200/90 mb-3">
        <div className="flex items-center gap-1.5">
          <h2 className="text-[14px] font-bold text-[#1e2022] font-display">Manifes Pengiriman Terbaru</h2>
        </div>
        <div className="flex items-center gap-3.5">
          <button
            onClick={onViewAll}
            className="text-xs font-bold text-[#4e5bf2] hover:text-[#2d39b8] transition-colors underline underline-offset-4 decoration-[1.5px] decoration-[#4e5bf2] cursor-pointer"
          >
            Kelola Pengiriman
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
        {filteredManifests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <p className="text-xs font-semibold">Tidak ada manifes logistik aktif</p>
          </div>
        ) : (
          filteredManifests.map((item) => {
            const statusClass = STATUS_STYLES[item.status] || 'bg-slate-100 text-slate-700';
            const bundleCount = item.bundle?.length || 0;

            return (
              <div
                key={item.id}
                className="grid grid-cols-12 gap-2 items-center py-2.5 border-b border-[#eceff1] last:border-b-0 hover:bg-slate-50/50 rounded-xl px-2 transition-all"
              >
                {/* Left Column: Nomor Manifest & Dispatcher */}
                <div className="col-span-6 min-w-0 pr-2 flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-650 shrink-0 border border-indigo-100/50">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11.5px] font-extrabold text-[#1e2022] truncate font-mono" title={item.nomorManifest}>
                      {item.nomorManifest}
                    </span>
                    <span className="text-[9.5px] text-gray-400 font-semibold truncate capitalize">
                      Pengirim: {item.pengirim?.name || 'Sistem'}
                    </span>
                  </div>
                </div>

                {/* Date Created */}
                <div className="col-span-3 text-[10.5px] font-semibold text-gray-450 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>{formatDate(item.createdAt)}</span>
                </div>

                {/* Status Badge */}
                <div className="col-span-3 flex items-center justify-between">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold border leading-none capitalize ${statusClass}`}>
                    {item.status.toLowerCase()}
                  </span>
                  <span className="text-[9.5px] text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/50">
                    {bundleCount} Map
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
