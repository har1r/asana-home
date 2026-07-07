"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  RefreshCw,
  FolderEdit,
  Zap,
  FilePlus,
  Pencil
} from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';
import { getLatestPermohonans } from '@/app/actions/penginput';
import { RecentTasksCardSkeleton } from '@/components/skeletons/SkeletonBase';
import { toTitleCase, getInitials, getAvatarBg, formatDate } from '@/lib/displayHelpers';


// Warna & ikon untuk setiap jenis permohonan
// Module-level constant: tidak bergantung pada state, tidak perlu di dalam komponen
const JENIS_CONFIG: Record<string, { icon: any; bg: string }> = {
  'MUTASI_SEBAGIAN':    { icon: FolderEdit, bg: 'bg-indigo-500' },
  'MUTASI_HABIS_UPDATE': { icon: RefreshCw,  bg: 'bg-emerald-500' },
  'MUTASI_HABIS_REGULER':{ icon: RefreshCw,  bg: 'bg-pink-500' },
  'OBJEK_PAJAK_BARU':   { icon: FilePlus,   bg: 'bg-amber-500' },
  'PEMBETULAN':          { icon: Pencil,     bg: 'bg-purple-500' },
  'PENGAKTIFAN':         { icon: Zap,        bg: 'bg-rose-500' },
};

export default function RecentTasksCard({ onViewAll }: { onViewAll?: () => void }) {
  const { searchQuery } = useDashboard();
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLatest() {
      try {
        setIsLoading(true);
        const res = await getLatestPermohonans(10);
        if (res.success && res.list) {
          setTasks(res.list);
        }
      } catch (error) {
        console.error('Failed to load latest permohonans:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchLatest();
  }, []);

  // Memoized filter – only recomputes when tasks list or searchQuery change
  const filteredTasks = useMemo(() =>
    tasks.filter(item => {
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
    [tasks, searchQuery]
  );

  if (isLoading) return <RecentTasksCardSkeleton />;

  return (
    <div id="recent-tasks-card" className="w-full flex flex-col font-sans select-none">
      {/* Header — identik dengan RecentProjectsCard */}
      <div className="flex items-center justify-between pb-[10px] border-b-2 border-gray-200/90 mb-3">
        <div className="flex items-center gap-1.5">
          <h2 className="text-[15px] font-bold text-[#1e2022] font-display">Permohonan Terbaru</h2>
        </div>

        <div className="flex items-center gap-3.5">
          <button
            onClick={onViewAll}
            className="text-xs font-bold text-[#4e5bf2] hover:text-[#2d39b8] underline underline-offset-4 decoration-[1.5px] decoration-[#4e5bf2] transition-colors cursor-pointer"
          >
            Semua Permohonan
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

      {/* Item list — tata letak identik dengan RecentProjectsCard */}
      <div className="flex flex-col gap-1">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-gray-400">
            <p className="text-xs">Tidak ada permohonan</p>
          </div>
        ) : (
          filteredTasks.slice(0, 10).map((item) => {
            const config = JENIS_CONFIG[item.jenisPermohonan] || { icon: FileText, bg: 'bg-slate-400' };
            const Icon = config.icon;

            const namaPemilik = item.jenisPermohonan === 'PENGAKTIFAN'
              ? (item.namaPemilikLama || '')
              : (item.dataBaru?.[0]?.namaPemilikBaru || item.namaWajibPajak || '');

            return (
              <div
                key={item.id}
                className="flex items-center justify-between pb-1.5 pt-1.5 border-b border-[#eceff1] group transition-all cursor-default"
              >
                {/* Left: ikon kotak + nama & subtitle — identik dengan RecentProjectsCard */}
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  {/* Square colored icon — w-7 h-7 rounded-lg — sama persis */}
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shadow-xs text-white shrink-0 ${config.bg}`}>
                    <Icon className="w-3.5 h-3.5 stroke-[2.25]" />
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="text-[13px] font-bold text-[#1e2022] group-hover:text-indigo-600 transition-colors truncate capitalize">
                      {namaPemilik.toLowerCase()}
                    </span>

                    {/* Subtitle: tanggal diinput • jenis layanan — sama posisi & style dengan RecentProjectsCard */}
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-semibold mt-0.5">
                      <span className="shrink-0">{formatDate(item.createdAt)}</span>
                      <span className="text-gray-300">•</span>
                      <span className="truncate">{toTitleCase(item.jenisPermohonan)}</span>
                    </div>
                  </div>
                </div>

                {/* Right: avatar inisial penginput — menggantikan avatar stack member */}
                <div className="flex items-center gap-3 shrink-0 pl-2">
                  <div className="flex -space-x-1 items-center select-none">
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-bold text-white ring-2 ring-white ${getAvatarBg(item.penginput?.name || '')}`}
                      title={item.penginput?.name || 'Unknown'}
                    >
                      {getInitials(item.penginput?.name || 'Unknown')}
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
