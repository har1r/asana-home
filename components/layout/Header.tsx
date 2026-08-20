"use client";

import React, { useState, useEffect } from 'react';
import { Search, Zap } from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';

export default function Header() {
  const { searchQuery, setSearchQuery } = useDashboard();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const mainPane = document.getElementById('main-content-pane');

    const handleScroll = () => {
      const scrollTop = mainPane ? mainPane.scrollTop : window.scrollY;
      setIsScrolled(scrollTop > 0);
    };

    handleScroll();

    if (mainPane) {
      mainPane.addEventListener('scroll', handleScroll);
    }
    window.addEventListener('scroll', handleScroll);

    return () => {
      if (mainPane) {
        mainPane.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="sticky top-0 z-20 flex flex-col w-full relative">
      <header
        id="top-nav-bar"
        className={`bg-[#f3f6f8] px-6 pt-4 pb-3 flex items-center justify-between shrink-0 select-none transition-all duration-200 ${isScrolled ? 'border-b border-slate-200/80 shadow-3xs' : 'border-b border-transparent'
          }`}
      >
        {/* Left: LottieFiles-style Global Search Input (Exact DevTools Box Model: 349x22 content, 40px left pad, 12px right pad, 8px top/bottom pad, 403px total width) */}
        <div className="w-[403px] max-w-full relative h-[40px] flex items-center">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Mufti's Workspace..."
            className="w-full h-[40px] bg-white hover:bg-slate-50 focus:bg-white border border-slate-300 hover:border-slate-400 focus:border-indigo-600 rounded-lg pl-[40px] pr-[12px] pt-[8px] pb-[8px] text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-3xs"
          />
        </div>

        {/* Right: Upgrade Workspace Green CTA Button (Height: 40px) */}
        <div className="flex items-center gap-3">
          <button className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-all shadow-3xs cursor-pointer flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span>Upgrade workspace</span>
          </button>
        </div>
      </header>
    </div>
  );
}
