"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Inbox, 
  Boxes, 
  Lock, 
  Send,
  Layers
} from 'lucide-react';
import { getPengirimStats } from '@/app/actions/pengirim';
import { FavoritesCardSkeleton } from '@/components/skeletons/SkeletonBase';

export default function PengirimStatsCard() {
  const [stats, setStats] = useState({ totalManifest: 0, draftManifest: 0, lockedManifest: 0, sentManifest: 0, eligibleBundles: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        setIsLoading(true);
        const res = await getPengirimStats();
        if (res.success && res.stats) {
          setStats(res.stats);
        }
      } catch (error) {
        console.error('Failed to fetch pengirim stats:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  const statItems = useMemo(() => [
    {
      title: "Antrean Bundle Siap Kirim",
      count: stats.eligibleBundles,
      icon: Inbox,
      bg: "bg-[#4e5bf2]",
      suffix: "Bundle"
    },
    {
      title: "Draf Manifest",
      count: stats.draftManifest,
      icon: Boxes,
      bg: "bg-[#ffb000]",
      suffix: "Manifest"
    },
    {
      title: "Manifest Terkunci",
      count: stats.lockedManifest,
      icon: Lock,
      bg: "bg-[#2adca2]",
      suffix: "Manifest"
    },
    {
      title: "Manifest Terkirim",
      count: stats.sentManifest,
      icon: Send,
      bg: "bg-[#3abde7]",
      suffix: "Manifest"
    },
    {
      title: "Total Manifest",
      count: stats.totalManifest,
      icon: Layers,
      bg: "bg-[#64748b]",
      suffix: "Manifest"
    }
  ], [stats]);

  if (isLoading) return <FavoritesCardSkeleton />;

  return (
    <div id="pengirim-stats-section" className="w-full flex flex-col font-sans select-none">
      {/* Header bar matching original styling */}
      <div className="flex items-center justify-between pb-[10px] border-b-2 border-gray-200/90 mb-5">
        <h2 className="text-[15px] font-bold text-[#1e2022] font-display">Statistik Logistik Pengiriman</h2>
        
        {/* Four-dot grip icon */}
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
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 justify-items-center sm:justify-items-stretch">
        {statItems.map((tile, index) => {
          const IconComponent = tile.icon;
          
          return (
            <div
              key={index}
              className="flex flex-col items-center group cursor-default"
            >
              {/* Colored icon square container */}
              <div 
                className={`w-[80px] h-[80px] rounded-[20px] flex items-center justify-center shadow-sm relative group-hover:scale-[1.03] transition-transform duration-300 text-white ${tile.bg}`}
              >
                <IconComponent className="w-5.5 h-5.5 stroke-[1.8]" />
              </div>

              {/* Title & category below the icon square */}
              <div className="mt-2.5 text-center flex flex-col items-center">
                <h3 className="text-xs font-bold text-[#1e2022] transition-colors truncate w-24 text-center">
                  {tile.title}
                </h3>
                <p className="text-[10px] text-gray-400 font-semibold mt-1 flex items-center justify-center gap-1">
                  {tile.count} {tile.suffix}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
