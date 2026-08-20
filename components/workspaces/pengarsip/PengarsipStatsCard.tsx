"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { getPengarsipStats } from '@/app/actions/pengarsip';
import { FavoritesCardSkeleton } from '@/components/skeletons/SkeletonBase';

export default function PengarsipStatsCard() {
  const [stats, setStats] = useState({ digitizationQueue: 0, archivedPending: 0, totalUploaded: 0, pendingKoreksi: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        setIsLoading(true);
        const res = await getPengarsipStats();
        if (res.success && res.stats) {
          setStats(res.stats);
        }
      } catch (error) {
        console.error('Failed to fetch pengarsip stats:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  const statItems = useMemo(() => [
    {
      title: "Antrean Digitalisasi",
      count: stats.digitizationQueue,
      bg: "bg-[#4e5bf2]"
    },
    {
      title: "Proses Unggah",
      count: stats.archivedPending,
      bg: "bg-[#ffb000]"
    },
    {
      title: "Unggahan Anda",
      count: stats.totalUploaded,
      bg: "bg-[#2adca2]"
    },
    {
      title: "Unggah Ulang",
      count: stats.pendingKoreksi,
      bg: "bg-[#ff5ea6]"
    }
  ], [stats]);

  if (isLoading) return <FavoritesCardSkeleton />;

  return (
    <div id="pengarsip-stats-section" className="w-full flex flex-col font-sans select-none">
      {/* Header bar matching FavoritesCard styling */}
      <div className="flex items-center justify-between pb-[10px] border-b-2 border-gray-200/90 mb-5">
        <h2 className="text-[15px] font-bold text-[#1e2022] font-display">Statistik Digitalisasi</h2>

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

      {/* Grid containing the colored cards — identical to FavoritesCard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 justify-items-center sm:justify-items-stretch">
        {statItems.map((tile, index) => (
          <div
            key={index}
            className="flex flex-col items-center group cursor-default"
          >
            {/* Colored box with count number */}
            <div
              className={`w-[80px] h-[80px] rounded-[20px] flex items-center justify-center shadow-sm group-hover:scale-[1.03] transition-transform duration-300 text-white ${tile.bg}`}
            >
              <span className="text-[28px] font-black leading-none tracking-tight">
                {tile.count}
              </span>
            </div>

            {/* Label below the box */}
            <div className="mt-2.5 text-center flex flex-col items-center">
              <h3 className="text-xs font-bold text-[#1e2022] truncate w-24 text-center">
                {tile.title}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
