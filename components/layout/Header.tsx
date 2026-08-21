"use client";

import React, { useState, useEffect } from 'react';
import { Search, Zap, Menu } from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';

export default function Header() {
  const { searchQuery, setSearchQuery, setIsMobileMenuOpen } = useDashboard();
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
        className={`bg-[#f3f6f8] px-4 sm:px-6 pt-4 pb-3 flex items-center justify-between shrink-0 select-none transition-all duration-200 ${
          isScrolled ? 'border-b border-gray-200/80 shadow-3xs' : 'border-b border-transparent'
        }`}
      >
        {/* Left: Mobile Hamburger Button & Search Input */}
        <div className="flex items-center gap-2.5 w-[403px] max-w-full">
          <button
            onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-200/70 hover:text-gray-900 transition-colors cursor-pointer shrink-0"
            title="Buka Menu Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="w-full relative h-[40px] flex items-center">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Mufti's Workspace"
              className="w-full h-[40px] bg-white hover:bg-gray-50 focus:bg-white border border-gray-200 hover:border-gray-300 focus:border-[#00a389] rounded-lg pl-10 pr-3 text-xs font-semibold text-gray-800 placeholder-gray-400 focus:outline-none transition-all shadow-3xs"
            />
          </div>
        </div>

        {/* Right: Upgrade Workspace Green Teal CTA Button */}
        <div className="flex items-center gap-3">
          <button className="h-[40px] px-4 bg-[#00a389] hover:bg-[#008f78] text-white font-extrabold text-xs rounded-lg transition-all shadow-xs cursor-pointer flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 fill-white text-white" />
            <span>Upgrade workspace</span>
          </button>
        </div>
      </header>
    </div>
  );
}
