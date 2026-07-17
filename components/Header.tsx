"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { Menu, Search, X } from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';
import NotificationBell from '@/components/NotificationBell';
import { useDebounce } from '@/lib/useDebounce';
import { useSession } from 'next-auth/react';
import { searchPermohonans } from '@/app/actions/search';

// Helper format NOP
const formatNop = (nop: string) => {
  if (!nop || nop.length !== 18) return nop;
  return `${nop.slice(0, 2)}.${nop.slice(2, 4)}.${nop.slice(4, 7)}.${nop.slice(7, 10)}.${nop.slice(10, 13)}-${nop.slice(13, 17)}.${nop.slice(17)}`;
};

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'SUBMITTED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    case 'REVISION':
      return 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse';
    case 'BUNDLED':
      return 'bg-blue-50 text-blue-700 border-blue-100';
    case 'ARCHIVED':
      return 'bg-indigo-50 text-indigo-700 border-indigo-100';
    case 'COMPLETED':
      return 'bg-cyan-50 text-cyan-700 border-cyan-100';
    case 'REJECTED':
      return 'bg-rose-50 text-rose-700 border-rose-100';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-100';
  }
};

// Static lookup — avoids re-creating a switch function on every render
const TAB_TITLES: Record<string, string> = {
  beranda: 'Beranda',
  'my-tasks': 'Papan Tugas Saya',
  inbox: 'Workspace Notification Feed',
  portfolios: 'Team Portfolios Grid',
  help: 'Help & Tutorial Guide',
};

export default function Header() {
  const { data: session, status } = useSession();
  const {
    activeTab,
    searchQuery,
    setSearchQuery,
    setIsMobileMenuOpen,
    isPersonalProfileDrawerOpen,
    setIsPersonalProfileDrawerOpen,
    setGlobalSelectedRequest
  } = useDashboard();

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isMobileSearchExpanded, setIsMobileSearchExpanded] = useState(false);
  const debouncedSearch = useDebounce(localSearch, 300);

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  // Trigger search when debouncedSearch changes
  useEffect(() => {
    async function triggerGlobalSearch() {
      const term = debouncedSearch.trim();
      if (!term) {
        setSearchResults([]);
        setIsSearching(false);
        setSearchError(null);
        setPanelOpen(false);
        return;
      }

      setIsSearching(true);
      setSearchError(null);
      setPanelOpen(true);

      try {
        const res = await searchPermohonans(term);
        if (res.success) {
          setSearchResults(res.results || []);
        } else {
          setSearchError('Gagal memuat hasil pencarian.');
        }
      } catch (err: any) {
        console.error(err);
        setSearchError('Terjadi kesalahan sistem.');
      } finally {
        setIsSearching(false);
      }
    }

    triggerGlobalSearch();
  }, [debouncedSearch]);

  // Load from sessionStorage on client mount (safe from SSR hydration mismatch)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cached = sessionStorage.getItem('architax_search_query');
      if (cached) {
        setLocalSearch(cached);
      }
    }
  }, []);

  // Sync debounced search value to global state
  useEffect(() => {
    setSearchQuery(debouncedSearch);
  }, [debouncedSearch, setSearchQuery]);

  // Sync local search keyword to sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('architax_search_query', localSearch);
    }
  }, [localSearch]);

  // Sync local search when global searchQuery is modified from outside (e.g. clear filters)
  useEffect(() => {
    if (searchQuery !== localSearch) {
      setLocalSearch(searchQuery);
    }
  }, [searchQuery]);

  // Only recomputes when activeTab actually changes
  const headerTitle = useMemo(() => TAB_TITLES[activeTab] ?? '', [activeTab]);

  return (
    <header id="top-nav-bar" className="bg-[#dde3ea] px-6 py-4 flex items-center justify-between shrink-0 select-none sticky top-0 z-30 min-h-[64px]">
      {/* Mobile Hamburger trigger (Hidden if mobile search is expanded) */}
      {!isMobileSearchExpanded && (
        <div className="flex items-center">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden text-gray-500 hover:text-gray-800 p-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Core Interactive Search & Filter utility */}
      <div className="flex items-center gap-3 sm:gap-5 flex-1 justify-end">
        {/* Search bar container */}
        <div className={`relative transition-all duration-350 ${
          isMobileSearchExpanded 
            ? 'w-full flex items-center gap-2 z-40 bg-[#dde3ea]' 
            : 'hidden sm:block w-44 sm:w-64'
        }`}>
          {isMobileSearchExpanded && (
            <button
              onClick={() => {
                setIsMobileSearchExpanded(false);
                setLocalSearch('');
              }}
              className="sm:hidden p-1.5 rounded-full hover:bg-slate-200/50 text-gray-500 hover:text-gray-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 stroke-[2.25] z-10" />
            <div className="p-[1px] bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] rounded-full overflow-hidden">
              <input
                id="search-input"
                type="text"
                placeholder="Cari permohonan, NOP, atau nama..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                onFocus={() => {
                  if (localSearch.trim()) setPanelOpen(true);
                }}
                className="w-full bg-slate-50 focus:outline-none focus:bg-white text-xs font-medium rounded-full pl-9 pr-8 py-1.5 transition-all text-gray-700 border-0"
              />
            </div>
            {localSearch && (
              <button
                onClick={() => {
                  setLocalSearch('');
                  setPanelOpen(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {panelOpen && (
              <>
                {/* Backdrop clicks block to close search results panel */}
                <div className="fixed inset-0 z-40" onClick={() => setPanelOpen(false)} />
                <div className="absolute top-full mt-2 right-0 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100/80 z-50 overflow-hidden flex flex-col max-h-[360px] animate-fadeIn">
                  
                  {/* Header Panel */}
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-50 bg-slate-50/50 select-none">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Hasil Pencarian Global</span>
                    <button onClick={() => setPanelOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Body Panel */}
                  <div className="flex-1 overflow-y-auto scrollbar-thin">
                    {isSearching ? (
                      <div className="flex flex-col items-center justify-center py-10 gap-3">
                        <div className="relative w-10 h-10">
                          <div className="absolute inset-0 w-full h-full rounded-full border-[2.5px] border-slate-100" />
                          <div className="absolute inset-0 w-full h-full rounded-full border-[2.5px] border-transparent border-t-indigo-500 border-r-violet-500 animate-spin" />
                          <div className="absolute inset-1 bg-white rounded-full flex items-center justify-center overflow-hidden">
                            <svg viewBox="34 34 132 132" className="w-5.5 h-5.5">
                              <g transform="translate(100,100) rotate(-8)">
                                <rect x="-56" y="-56" width="50" height="50" rx="12" fill="#3F72E6" />
                                <rect x="6" y="-56" width="50" height="50" rx="12" fill="#0DC5B4" />
                                <rect x="-56" y="6" width="50" height="50" rx="12" fill="#FF6355" />
                                <rect x="6" y="6" width="50" height="50" rx="12" fill="#7C5CFC" />
                              </g>
                              <circle cx="100" cy="100" r="6" fill="white" />
                            </svg>
                          </div>
                        </div>
                        <span className="text-[9px] text-gray-400 font-extrabold tracking-wider animate-pulse">Mencari di Database...</span>
                      </div>
                    ) : searchError ? (
                      <div className="py-8 text-center text-xs font-semibold text-rose-500">{searchError}</div>
                    ) : searchResults.length === 0 ? (
                      <div className="py-12 text-center select-none flex flex-col items-center justify-center gap-2">
                        <Search className="w-7 h-7 text-slate-350 stroke-[1.5]" />
                        <p className="text-xs text-slate-400 font-semibold">Tidak ada hasil ditemukan</p>
                        <p className="text-[10px] text-slate-350 font-medium px-6 leading-relaxed">Coba cari dengan nomor pelayanan, nomor permohonan, NOP, atau nama pemohon.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-50">
                        {searchResults.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => {
                              setGlobalSelectedRequest(item);
                              setPanelOpen(false);
                            }}
                            className="flex items-start justify-between gap-3 px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer group"
                          >
                            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                              <span className="text-xs font-bold text-gray-800 font-mono tracking-tight truncate group-hover:text-indigo-650 transition-colors">
                                {item.nomorPelayanan || item.nomorPermohonan}
                              </span>
                              <span className="text-[10px] font-extrabold text-slate-700 truncate uppercase">
                                {item.namaWajibPajak}
                              </span>
                              <span className="text-[9px] font-bold text-slate-400 font-mono">
                                NOP: {formatNop(item.nop)}
                              </span>
                            </div>
                            <div className="flex flex-col items-end gap-1.5 shrink-0 select-none">
                              <span className="px-1.5 py-0.2 bg-slate-100 text-[8px] font-bold text-slate-500 rounded border border-slate-200/50 uppercase tracking-wide">
                                {item.jenisPermohonan?.replace(/_/g, ' ')}
                              </span>
                              <span className={`px-2 py-0.5 text-[8.5px] font-extrabold rounded-full border uppercase ${getStatusBadgeClass(item.status)}`}>
                                {item.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile Search Expand Trigger Button */}
        {!isMobileSearchExpanded && (
          <button
            onClick={() => setIsMobileSearchExpanded(true)}
            className="sm:hidden p-2 rounded-full hover:bg-slate-100 text-gray-500 hover:text-gray-800 transition-all cursor-pointer"
            aria-label="Cari"
          >
            <Search className="w-4 h-4 stroke-[2.25]" />
          </button>
        )}

        {/* Other actions (Notifications, Profile) - Hidden on mobile if search is expanded */}
        {!isMobileSearchExpanded && (
          <>
            {/* Notification Bell */}
            <NotificationBell />

            {/* Profile Avatar Container with Hover Tooltip */}
            <div 
              className="relative"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              {status === 'loading' ? (
                <div className="w-8 h-8 rounded-full bg-slate-300 animate-pulse shrink-0 shadow" />
              ) : (
                <button
                  onClick={() => setIsPersonalProfileDrawerOpen(!isPersonalProfileDrawerOpen)}
                  className="w-8 h-8 rounded-full overflow-hidden hover:ring-2 hover:ring-indigo-500 hover:ring-offset-1 transition-all shrink-0 shadow bg-slate-100 relative cursor-pointer"
                  aria-label="My account"
                >
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                    alt="My profile"
                    className="w-full h-full object-cover object-top"
                    referrerPolicy="no-referrer"
                  />
                </button>
              )}
              
              {showTooltip && session?.user && (
                <div className="absolute right-0 top-10 bg-slate-800 text-white text-[10px] font-semibold py-1.5 px-3 rounded-lg shadow-lg border border-slate-700/50 whitespace-nowrap z-50 animate-fadeIn pointer-events-none">
                  <p className="font-extrabold text-[11px]">{session.user.name}</p>
                  <p className="text-gray-400 text-[9px] font-medium mt-0.5">{session.user.email}</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
