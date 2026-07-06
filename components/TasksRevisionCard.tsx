"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useDashboard } from '@/context/DashboardContext';
import { getRevisionPermohonans } from '@/app/actions/penginput';
import { TasksRevisionCardSkeleton } from '@/components/skeletons/SkeletonBase';

const CATEGORY_STYLES: Record<string, string> = {
  'MUTASI_SEBAGIAN': 'bg-indigo-100 text-indigo-950 border-indigo-200/50',
  'MUTASI_HABIS_UPDATE': 'bg-emerald-100 text-emerald-900 border-emerald-200/50',
  'MUTASI_HABIS_REGULER': 'bg-pink-100 text-pink-900 border-pink-200/50',
  'OBJEK_PAJAK_BARU': 'bg-amber-100 text-amber-900 border-amber-200/50',
  'PEMBETULAN': 'bg-purple-100 text-purple-900 border-purple-200/50',
  'PENGAKTIFAN': 'bg-rose-100 text-rose-900 border-rose-200/50',
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

// ── Pure module-level helpers (no closure captures) ─────────────────────────
const toTitleCase = (str: string) =>
  str
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());

const getInitials = (name: string) => {
  if (!name) return '?';
  const parts = name.split(' ');
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : parts[0][0].toUpperCase();
};

const getAvatarBg = (name: string) => {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colors = ['bg-[#ffb000]', 'bg-[#2adca2]', 'bg-[#ff5ea6]', 'bg-[#4e5bf2]', 'bg-[#8b5cf6]', 'bg-[#64748b]'];
  return colors[hash % colors.length];
};

const formatDate = (dateString: string | Date) => {
  const date = new Date(dateString);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
};
// ─────────────────────────────────────────────────────────────────────────────

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
      <div className="flex flex-col flex-1 gap-1 min-h-[160px]">
        {filteredRevisions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-gray-400">
            <p className="text-xs">Tidak ada permohonan revisi</p>
          </div>
        ) : (
          filteredRevisions.slice(0, 5).map((item) => {
            const tagClass = CATEGORY_STYLES[item.jenisPermohonan] || 'bg-slate-100 text-slate-900 border-slate-200/50';
            const namaPemilik = item.jenisPermohonan === 'PENGAKTIFAN'
              ? (item.namaPemilikLama || '')
              : (item.dataBaru?.[0]?.namaPemilikBaru || item.namaWajibPajak || '');

            return (
              <div
                key={item.id}
                className="task-row grid grid-cols-12 gap-2 items-center pb-2 pt-2 border-b border-[#eceff1] group transition-all relative"
              >
                {/* Left Column: Title / Nama Pemilik */}
                <div className="col-span-6 sm:col-span-5 min-w-0 pr-2">
                  <span
                    className="text-[13px] font-semibold text-[#1e2022] truncate cursor-pointer block capitalize"
                    title={namaPemilik.toLowerCase()}
                  >
                    {namaPemilik.toLowerCase()}
                  </span>
                </div>

                {/* Middle Column 1: Date Inputted */}
                <span className="col-span-3 sm:col-span-2 text-[11px] font-semibold text-gray-400 text-left">
                  {formatDate(item.createdAt)}
                </span>

                {/* Middle Column 2: Service Type Badge */}
                <div className="col-span-3 sm:col-span-3 flex justify-start">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold border leading-none ${tagClass} text-center select-none`} title={toTitleCase(item.jenisPermohonan)}>
                    {toTitleCase(item.jenisPermohonan)}
                  </span>
                </div>

                {/* Middle Column 3: Inputter Initial Avatar */}
                <div className="hidden sm:flex sm:col-span-2 items-center justify-end select-none">
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
