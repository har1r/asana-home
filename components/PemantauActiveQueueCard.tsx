"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { getMonitoringPermohonan } from '@/app/actions/pemantau';
import { TasksRevisionCardSkeleton } from '@/components/skeletons/SkeletonBase';
import { formatDate } from '@/lib/displayHelpers';
import { FileText, Inbox, Clock } from 'lucide-react';

const formatNop = (nop: string) => {
  if (!nop) return '';
  const cleanNop = nop.replace(/[^0-9]/g, '');
  if (cleanNop.length === 17) {
    const padded = cleanNop + '0';
    return `${padded.slice(0, 2)}.${padded.slice(2, 4)}.${padded.slice(4, 7)}.${padded.slice(7, 10)}.${padded.slice(10, 13)}-${padded.slice(13, 17)}.${padded.slice(17)}`;
  }
  if (cleanNop.length === 18) {
    return `${cleanNop.slice(0, 2)}.${cleanNop.slice(2, 4)}.${cleanNop.slice(4, 7)}.${cleanNop.slice(7, 10)}.${cleanNop.slice(10, 13)}-${cleanNop.slice(13, 17)}.${cleanNop.slice(17)}`;
  }
  return nop;
};

export default function PemantauActiveQueueCard({ onViewAll }: { onViewAll?: () => void }) {
  const { searchQuery } = useDashboard();
  const [list, setList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchQueue() {
      try {
        setIsLoading(true);
        const res = await getMonitoringPermohonan();
        if (res.success && res.list) {
          // Filter status ARCHIVED (active monitoring queue) and show top 5
          const activeList = res.list.filter((p: any) => p.status === "ARCHIVED");
          setList(activeList.slice(0, 5));
        }
      } catch (error) {
        console.error('Failed to load pemantau active queue:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchQueue();
  }, []);

  // Memoized filter – always show all list items (no global search filtering on homepage cards)
  const filteredList = useMemo(() => list, [list]);

  if (isLoading) return <TasksRevisionCardSkeleton />;

  return (
    <div id="pemantau-active-queue-card" className="w-full flex flex-col font-sans select-none">
      <div className="flex items-center justify-between pb-[10px] border-b-2 border-gray-200/90 mb-3">
        <div className="flex items-center gap-1.5">
          <h2 className="text-[14px] font-bold text-[#1e2022] font-display">Antrean Berkas Terarsip Terbaru</h2>
        </div>
        <div className="flex items-center gap-3.5">
          <button
            onClick={onViewAll}
            className="text-xs font-bold text-[#4e5bf2] hover:text-[#2d39b8] transition-colors underline underline-offset-4 decoration-[1.5px] decoration-[#4e5bf2] cursor-pointer"
          >
            Antrean Pemantauan
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
            <p className="text-xs font-semibold">Tidak ada berkas di antrean pemantauan</p>
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
                  <div className="p-1.5 rounded-lg bg-sky-50 text-sky-650 shrink-0 border border-sky-100/50">
                    <FileText className="w-3.5 h-3.5" />
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

                {/* Date updated */}
                <div className="col-span-3 text-[10.5px] font-semibold text-gray-455 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{formatDate(item.updatedAt)}</span>
                </div>

                {/* Manifest Badge & Frozen status */}
                <div className="col-span-3 flex items-center justify-between">
                  <span className="text-[8.5px] text-indigo-650 font-bold bg-indigo-50 px-2 py-0.5 border border-indigo-100/30 rounded-lg truncate max-w-[80px]">
                    Man: {manifestNo.split("/")[1] || manifestNo}
                  </span>
                  {isFrozen ? (
                    <span className="text-[8px] font-extrabold px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded-md animate-pulse shrink-0">
                      Frozen
                    </span>
                  ) : (
                    <span className="text-[8.5px] font-bold px-1.5 py-0.5 bg-sky-50 text-sky-700 border border-sky-100 rounded-md shrink-0 capitalize">
                      Archived
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
