"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { getPermohonanStats } from '@/app/actions/penginput';
import { FavoritesCardSkeleton } from '@/components/skeletons/SkeletonBase';


export default function PenginputStatsCard() {
  const [stats, setStats] = useState({ total: 0, revision: 0, sent: 0, completed: 0, rejected: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        setIsLoading(true);
        const res = await getPermohonanStats();
        if (res.success && res.stats) {
          setStats(res.stats);
        }
      } catch (error) {
        console.error('Failed to fetch permohonan stats:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  const statItems = useMemo(() => [
    {
      title: "Total",
      count: stats.total,
      bg: "bg-[#4e5bf2]"
    },
    {
      title: "Revisi",
      count: stats.revision,
      bg: "bg-[#ffb000]"
    },
    {
      title: "Dikirim",
      count: stats.sent,
      bg: "bg-[#3abde7]"
    },
    {
      title: "Selesai",
      count: stats.completed,
      bg: "bg-[#2adca2]"
    },
    {
      title: "Ditolak",
      count: stats.rejected,
      bg: "bg-[#ff5ea6]"
    }
  ], [stats]);

  if (isLoading) return <FavoritesCardSkeleton />;

  return (
    <div id="favorites-section" className="w-full flex flex-col font-sans select-none">
      {/* Header bar matching screenshot styling */}
      <div className="flex items-center justify-between pb-[10px] border-b-2 border-gray-200/90 mb-5">
        <h2 className="text-[15px] font-bold text-[#1e2022] font-display">Statistik Permohonan</h2>

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

      {/* Grid containing the colored cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 justify-items-center sm:justify-items-stretch">
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
              <h3 className="text-xs font-bold text-[#1e2022] truncate w-24">
                {tile.title}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
