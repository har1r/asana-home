"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  RefreshCw,
  FolderEdit,
  Zap,
  FilePlus,
  Pencil,
  ExternalLink
} from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';
import { getRecentUploads } from '@/app/actions/pengarsip';
import { RecentTasksCardSkeleton } from '@/components/skeletons/SkeletonBase';
import { toTitleCase, formatDate } from '@/lib/displayHelpers';

const JENIS_CONFIG: Record<string, { icon: any; bg: string }> = {
  'MUTASI_SEBAGIAN':    { icon: FolderEdit, bg: 'bg-indigo-500' },
  'MUTASI_HABIS_UPDATE': { icon: RefreshCw,  bg: 'bg-emerald-500' },
  'MUTASI_HABIS_REGULER':{ icon: RefreshCw,  bg: 'bg-pink-500' },
  'OBJEK_PAJAK_BARU':   { icon: FilePlus,   bg: 'bg-amber-500' },
  'PEMBETULAN':          { icon: Pencil,     bg: 'bg-purple-500' },
  'PENGAKTIFAN':         { icon: Zap,        bg: 'bg-rose-500' },
};

export default function PengarsipRecentUploadsCard({ onViewAll }: { onViewAll?: () => void }) {
  const { searchQuery } = useDashboard();
  const [uploads, setUploads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUploads() {
      try {
        setIsLoading(true);
        const res = await getRecentUploads(5);
        if (res.success && res.list) {
          setUploads(res.list);
        }
      } catch (error) {
        console.error('Failed to load recent uploads:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUploads();
  }, []);

  const filteredUploads = useMemo(() =>
    uploads.filter(item => {
      const permohonan = item.permohonan;
      if (!permohonan) return false;
      const wp = permohonan.namaWajibPajak || '';
      return (
        wp.toLowerCase().includes(searchQuery.toLowerCase()) ||
        permohonan.nomorPermohonan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        permohonan.jenisPermohonan.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }),
    [uploads, searchQuery]
  );

  if (isLoading) return <RecentTasksCardSkeleton />;

  return (
    <div id="pengarsip-recent-uploads-card" className="w-full flex flex-col font-sans select-none">
      {/* Header matching original RecentTasksCard */}
      <div className="flex items-center justify-between pb-[10px] border-b-2 border-gray-200/90 mb-3">
        <div className="flex items-center gap-1.5">
          <h2 className="text-[15px] font-bold text-[#1e2022] font-display">Unggahan Terakhir Anda</h2>
        </div>

        <div className="flex items-center gap-3.5">
          <button
            onClick={onViewAll}
            className="text-xs font-bold text-[#4e5bf2] hover:text-[#2d39b8] underline underline-offset-4 decoration-[1.5px] decoration-[#4e5bf2] transition-colors cursor-pointer"
          >
            Halaman Kerja
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
      <div className="flex flex-col gap-1">
        {filteredUploads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-gray-400">
            <p className="text-xs">Tidak ada unggahan berkas</p>
          </div>
        ) : (
          filteredUploads.map((item) => {
            const permohonan = item.permohonan;
            if (!permohonan) return null;

            const config = JENIS_CONFIG[permohonan.jenisPermohonan] || { icon: FileText, bg: 'bg-slate-400' };
            const Icon = config.icon;

            return (
              <div
                key={item.id}
                className="flex items-center justify-between pb-1.5 pt-1.5 border-b border-[#eceff1] group transition-all cursor-default"
              >
                {/* Left: Icon, WP Name, Subtitle */}
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shadow-xs text-white shrink-0 ${config.bg}`}>
                    <Icon className="w-3.5 h-3.5 stroke-[2.25]" />
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="text-[13px] font-bold text-[#1e2022] group-hover:text-indigo-600 transition-colors truncate capitalize">
                      {permohonan.namaWajibPajak.toLowerCase()}
                    </span>

                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-semibold mt-0.5">
                      <span className="shrink-0">{formatDate(item.createdAt)}</span>
                      <span className="text-gray-300">•</span>
                      <span className="truncate">{permohonan.nomorPermohonan}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Version and Quick PDF Link */}
                <div className="flex items-center gap-3 shrink-0 pl-2">
                  <span className="bg-slate-100 border border-slate-200 text-slate-700 text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                    V{item.versi}
                  </span>
                  
                  <a
                    href={item.urlBlob}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-gray-400 hover:text-[#4e5bf2] hover:bg-slate-50 rounded transition-all cursor-pointer"
                    title="Buka File PDF"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
