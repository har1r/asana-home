"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { getMonitoringPermohonan } from '@/app/actions/pemantau';
import { RecentTasksCardSkeleton } from '@/components/skeletons/SkeletonBase';
import { formatDate } from '@/lib/displayHelpers';
import { FileCheck, CheckCircle2, Calendar } from 'lucide-react';

const formatNop = (nop: string) => {
  if (!nop || nop.length !== 18) return nop;
  return `${nop.slice(0, 2)}.${nop.slice(2, 4)}.${nop.slice(4, 7)}.${nop.slice(7, 10)}.${nop.slice(10, 13)}-${nop.slice(13, 17)}.${nop.slice(17)}`;
};

export default function PemantauRecentCompletedCard({ onViewAll }: { onViewAll?: () => void }) {
  const { searchQuery } = useDashboard();
  const [list, setList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchQueue() {
      try {
        setIsLoading(true);
        const res = await getMonitoringPermohonan();
        if (res.success && res.list) {
          // Filter status COMPLETED and show top 5
          const completedList = res.list.filter((p: any) => p.status === "COMPLETED");
          setList(completedList.slice(0, 5));
        }
      } catch (error) {
        console.error('Failed to load pemantau completed queue:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchQueue();
  }, []);

  const filteredList = useMemo(() =>
    list.filter(item => {
      return (
        item.nop.includes(searchQuery) ||
        item.namaWajibPajak.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nomorPermohonan.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }),
    [list, searchQuery]
  );

  if (isLoading) return <RecentTasksCardSkeleton />;

  return (
    <div id="pemantau-recent-completed-card" className="w-full flex flex-col font-sans select-none">
      <div className="flex items-center justify-between pb-[10px] border-b-2 border-gray-200/90 mb-3">
        <div className="flex items-center gap-1.5">
          <h2 className="text-[14px] font-bold text-[#1e2022] font-display">Riwayat Berkas Selesai Terbaru</h2>
        </div>
        <div className="flex items-center gap-3.5">
          <button
            onClick={onViewAll}
            className="text-xs font-bold text-[#4e5bf2] hover:text-[#2d39b8] transition-colors underline underline-offset-4 decoration-[1.5px] decoration-[#4e5bf2] cursor-pointer"
          >
            Daftar Selesai
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
        {filteredList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <p className="text-xs font-semibold">Belum ada berkas selesai</p>
          </div>
        ) : (
          filteredList.map((item) => {
            const manifestNo = item.bundle?.manifest?.nomorManifest || "—";
            const isFrozen = item.permintaanKoreksi && item.permintaanKoreksi.length > 0;

            return (
              <div
                key={item.id}
                className="grid grid-cols-12 gap-2 items-center py-2.5 border-b border-[#eceff1] last:border-b-0 hover:bg-slate-50/50 rounded-xl px-2 transition-all"
              >
                {/* Left Column: NOP & WP Name */}
                <div className="col-span-6 min-w-0 pr-2 flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-650 shrink-0 border border-emerald-100/50">
                    <FileCheck className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11.5px] font-extrabold text-[#1e2022] truncate font-mono" title={item.nop}>
                      NOP: {formatNop(item.nop)}
                    </span>
                    <span className="text-[9.5px] text-gray-400 font-semibold truncate capitalize">
                      WP: {item.namaWajibPajak}
                    </span>
                  </div>
                </div>

                {/* Date completed */}
                <div className="col-span-3 text-[10.5px] font-semibold text-gray-455 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>{formatDate(item.updatedAt)}</span>
                </div>

                {/* Manifest Badge & Status */}
                <div className="col-span-3 flex items-center justify-between">
                  <span className="text-[8.5px] text-indigo-650 font-bold bg-indigo-50 px-2 py-0.5 border border-indigo-100/30 rounded-lg truncate max-w-[80px]">
                    Man: {manifestNo.split("/")[1] || manifestNo}
                  </span>
                  {isFrozen ? (
                    <span className="text-[8px] font-extrabold px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded-md animate-pulse shrink-0">
                      Frozen
                    </span>
                  ) : (
                    <span className="text-[8.5px] font-bold px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md shrink-0 flex items-center gap-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      <span>Selesai</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
