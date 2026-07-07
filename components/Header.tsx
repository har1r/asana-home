"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { Menu, Search, X } from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';
import NotificationBell from '@/components/NotificationBell';
import { useDebounce } from '@/lib/useDebounce';

// Static lookup — avoids re-creating a switch function on every render
const TAB_TITLES: Record<string, string> = {
  beranda: 'Beranda',
  'my-tasks': 'My Tasks Board',
  inbox: 'Workspace Notification Feed',
  portfolios: 'Team Portfolios Grid',
  help: 'Help & Tutorial Guide',
};

export default function Header() {
  const {
    activeTab,
    searchQuery,
    setSearchQuery,
    setIsMobileMenuOpen,
    isPersonalProfileDrawerOpen,
    setIsPersonalProfileDrawerOpen
  } = useDashboard();

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const debouncedSearch = useDebounce(localSearch, 300);

  // Sync debounced search value to global state
  useEffect(() => {
    setSearchQuery(debouncedSearch);
  }, [debouncedSearch, setSearchQuery]);

  // Sync local search when global searchQuery is modified from outside (e.g. clear filters)
  useEffect(() => {
    if (searchQuery !== localSearch) {
      setLocalSearch(searchQuery);
    }
  }, [searchQuery]);

  // Only recomputes when activeTab actually changes
  const headerTitle = useMemo(() => TAB_TITLES[activeTab] ?? '', [activeTab]);

  return (
    <header id="top-nav-bar" className="bg-[#f3f6f9] px-6 py-4 flex items-center justify-between shrink-0 select-none sticky top-0 z-30">
      {/* Mobile Hamburger trigger */}
      <div className="flex items-center">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="md:hidden text-gray-500 hover:text-gray-800 p-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Core Interactive Search & Filter utility */}
      <div className="flex items-center gap-5">
        <div className="relative w-44 sm:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 stroke-[2.25]" />
          <input
            id="search-input"
            type="text"
            placeholder="Search projects or tasks..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200/80 hover:border-slate-300 focus:outline-none focus:border-indigo-500 focus:bg-white text-xs font-medium rounded-full pl-9 pr-4 py-2 transition-all text-gray-700"
          />
          {localSearch && (
            <button
              onClick={() => setLocalSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Notification Bell */}
        <NotificationBell />

        {/* Profile Avatar Trigger Button */}
        <button
          onClick={() => setIsPersonalProfileDrawerOpen(!isPersonalProfileDrawerOpen)}
          className="w-8 h-8 rounded-full overflow-hidden hover:ring-2 hover:ring-indigo-500 hover:ring-offset-1 transition-all shrink-0 shadow bg-slate-100 relative cursor-pointer"
          title="My account"
        >
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
            alt="My profile"
            className="w-full h-full object-cover object-top"
            referrerPolicy="no-referrer"
          />
        </button>
      </div>
    </header>
  );
}
