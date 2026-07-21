"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { getPendingKoreksi } from '@/app/actions/supervisor';
import { RecentTasksCardSkeleton } from '@/components/skeletons/SkeletonBase';
import { getInitials, getAvatarBg, formatDate } from '@/lib/displayHelpers';
import { Inbox, ClipboardCheck } from 'lucide-react';

export default function SupervisorPendingCard({ onViewAll }: { onViewAll?: () => void }) {
  const { searchQuery } = useDashboard();
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRequests() {
      try {
        setIsLoading(true);
        const res = await getPendingKoreksi();
        if (res.success && res.list) {
          setRequests(res.list.slice(0, 5)); // show top 5
        }
      } catch (error) {
        console.error('Failed to load pending corrections:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchRequests();
  }, []);

  // Memoized filter – always show all requests (no global search filtering on homepage cards)
  const filteredRequests = useMemo(() => requests, [requests]);

  const activeCount = requests.length;

  if (isLoading) return <RecentTasksCardSkeleton />;

  return (
    <div id="supervisor-pending-card" className="w-full flex flex-col font-sans select-none">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-[10px] border-b-2 border-gray-200/90 mb-3">
        <div className="flex items-center gap-1.5">
          <h2 className="text-[15px] font-bold text-[#1e2022] font-display">Antrean Persetujuan</h2>
          {activeCount > 0 && (
            <span className="flex items-center justify-center bg-rose-500 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-md leading-none animate-pulse">
              {activeCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3.5">
          <button
            onClick={onViewAll}
            className="text-xs font-bold text-[#4e5bf2] hover:text-[#2d39b8] underline underline-offset-4 decoration-[1.5px] decoration-[#4e5bf2] transition-colors cursor-pointer"
          >
            Tinjau Semua
          </button>

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

      {/* Item list */}
      <div className="flex flex-col gap-1.5">
        {filteredRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <Inbox className="w-8 h-8 text-gray-300 stroke-[1.5] mb-2" />
            <p className="text-xs font-bold text-gray-500">Antrean Persetujuan Bersih</p>
            <p className="text-[10px] text-gray-400 font-semibold">Semua permintaan koreksi telah ditinjau.</p>
          </div>
        ) : (
          filteredRequests.map((item) => (
            <div
              key={item.id}
              onClick={onViewAll}
              className="flex items-center justify-between pb-2 pt-2 border-b border-[#eceff1] group transition-all cursor-pointer hover:bg-slate-50/50 px-2 rounded-lg"
            >
              {/* Left side: Colored box + details */}
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shadow-xs text-white shrink-0 bg-amber-500">
                  <ClipboardCheck className="w-3.5 h-3.5 stroke-[2.25]" />
                </div>

                <div className="flex flex-col min-w-0">
                  <span
                    className="text-[13px] font-bold text-[#1e2022] group-hover:text-[#4e5bf2] transition-colors truncate"
                  >
                    {item.permohonan?.nomorPermohonan || '—'}
                  </span>

                  <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-semibold mt-0.5">
                    <span>{formatDate(item.createdAt)}</span>
                    <span>•</span>
                    <span className="truncate">{item.jenisKoreksi.replace(/_/g, ' ')}</span>
                  </div>
                </div>
              </div>

              {/* Right side: applicant initials avatar */}
              <div className="flex items-center gap-3 shrink-0 pl-2">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-gray-600">{item.pengaju?.name.split(' ')[0]}</span>
                  <span className="text-[9px] font-semibold text-gray-400 uppercase">{item.pengaju?.role}</span>
                </div>
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white ring-2 ring-white shrink-0 ${getAvatarBg(item.pengaju?.name || '')}`}
                  title={item.pengaju?.name || 'Unknown'}
                >
                  {getInitials(item.pengaju?.name || 'Unknown')}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
