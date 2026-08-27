"use client";

// ==========================================
// 1. IMPORT MODULE & IKON (LUCIDE REACT)
// ==========================================
import React, { useState, useMemo, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import NotificationBell from './NotificationBell';
import {
  ChevronDown,
  ChevronRight,
  Trash2,
  Share2,
  GraduationCap,
  Gift,
  Globe,
  Star,
  Zap,
  Home,
  CheckSquare,
  Inbox,
  Search,
  HelpCircle,
  Calendar,
  UserPlus,
  LucideIcon,
  Folder,
  Layers,
  Clock,
  X
} from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';
import { getGlobalBerandaStats } from '@/app/actions/beranda';
import { getPermohonanStats } from '@/app/actions/penginput';

// ==========================================
// 2. TYPE DEFINITIONS & INTERFACES
// ==========================================
interface DataBaruItem {
  id: string;
  namaPemilikBaru: string;
  nopel: string;
  permohonanId: string;
}

interface PermohonanStatsState {
  total: number;
  scanned: number;
}

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

// ==========================================
// 3. KOMPONEN UTAMA SIDEBAR (99% PRESISI LOTTIEFILES - PURE TAILWIND)
// ==========================================
export default function Sidebar() {
  // --- Context Dashboard ---
  const {
    activeTab,
    setActiveTab,
    favoritePermohonans,
    setSearchQuery,
    setSelectedProject,
    setIsPersonalProfileDrawerOpen,
    setIsMobileMenuOpen
  } = useDashboard();

  // --- User Session & Role ---
  const { data: session } = useSession();
  const userName = session?.user?.name || '';
  const userRoleRaw = (session?.user as any)?.role || '';

  const firstName = useMemo(() => {
    if (!userName || !userName.trim()) return '';
    return userName.trim().split(/\s+/)[0];
  }, [userName]);

  const userInitials = useMemo(() => {
    if (!userName || !userName.trim()) return 'MU';
    const parts = userName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  }, [userName]);

  const userRoleFormatted = useMemo(() => {
    if (!userRoleRaw) return 'Starter Plan';
    return userRoleRaw.charAt(0).toUpperCase() + userRoleRaw.slice(1).toLowerCase();
  }, [userRoleRaw]);

  // --- Local UI State (Toggle Menu Dropdown) ---
  const [showProjects, setShowProjects] = useState(false);
  const [showCollections, setShowCollections] = useState(false);
  const [showAllFavorites, setShowAllFavorites] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  // --- Live Digital Clock Timer ---
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- State Data Permohonan & Statistik ---
  const [permohonanList, setPermohonanList] = useState<any[]>([]);
  const [stats, setStats] = useState<PermohonanStatsState>({ total: 0, scanned: 0 });

  // ==========================================
  // 4. DATA FETCHING & LOGIKA DIHUBUNGKAN
  // ==========================================
  useEffect(() => {
    async function loadPermohonanData() {
      try {
        const [globalRes, statsRes] = await Promise.all([
          getGlobalBerandaStats(),
          getPermohonanStats()
        ]);
        if (globalRes.success && globalRes.recentList) {
          setPermohonanList(globalRes.recentList);
        }
        if (statsRes.success || globalRes.success) {
          setStats({
            total: globalRes.totalPemohon || statsRes.stats?.total || 0,
            scanned: globalRes.totalScannedPemohon ?? ((statsRes.stats?.completed || 0) + (statsRes.stats?.archived || 0))
          });
        }
      } catch (e) {
        console.error('Gagal memuat data permohonan untuk sidebar:', e);
      }
    }
    loadPermohonanData();
  }, []);

  // Memecah list permohonan menjadi item permohonan individu (Pemohon Baru / Data Baru)
  const dataBaruItems = useMemo<DataBaruItem[]>(() => {
    const items: DataBaruItem[] = [];
    permohonanList.forEach((perm) => {
      if (perm.dataBaru && perm.dataBaru.length > 0) {
        perm.dataBaru.forEach((db: any, idx: number) => {
          if (db.namaPemilikBaru) {
            items.push({
              id: `${perm.id}-db-${idx}`,
              namaPemilikBaru: db.namaPemilikBaru,
              nopel: perm.nomorPelayanan || perm.nomorPermohonan,
              permohonanId: perm.id
            });
          }
        });
      } else if (perm.namaPemilikLama) {
        items.push({
          id: perm.id,
          namaPemilikBaru: perm.namaPemilikLama,
          nopel: perm.nomorPelayanan || perm.nomorPermohonan,
          permohonanId: perm.id
        });
      }
    });
    return items;
  }, [permohonanList]);

  // Hitung total pemohon aktif (62 Pemohon)
  const totalApplicantsCount = stats.total > 0 ? stats.total : dataBaruItems.length;

  // Format Tanggal Hari Ini (Indonesia)
  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }, []);

  // Menu Navigasi Utama
  const mainMenuItems: MenuItem[] = [
    { id: 'beranda', label: 'Beranda', icon: Home },
    { id: 'my-tasks', label: 'Tugas Saya', icon: CheckSquare },
    { id: 'inbox', label: 'Kotak Masuk', icon: Inbox },
    { id: 'tracking', label: 'Lacak Permohonan', icon: Search },
    { id: 'help', label: 'Bantuan', icon: HelpCircle },
  ];

  // ==========================================
  // 5. RENDERING VISUAL SIDEBAR (99% IDENTIK LOTTIEFILES - PURE TAILWIND CSS)
  // ==========================================
  return (
    <aside
      id="sidebar-nav"
      style={{ fontFamily: "'Karla', var(--font-karla), system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" }}
      className="max-w-[289px] w-[289px] p-4 h-screen sticky top-0 border-r border-gray-200/80 flex flex-col justify-between shrink-0 select-none relative bg-white text-gray-900 z-30"
    >
      {/* MOBILE CLOSE BUTTON */}
      <button
        onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
        className="md:hidden absolute top-3 right-3 p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer z-50"
        title="Tutup Menu"
      >
        <X className="w-5 h-5" />
      </button>

      {/* INNER WRAPPER CONTAINER (PURE TAILWIND FLEX COL) */}
      <div className="flex flex-col justify-between h-full w-full">
        <div className="flex flex-col justify-between h-full">

          {/* ========================================== */}
          {/* SECTION 1: HEADER & PROGRESS TRACKER (ATAS) */}
          {/* ========================================== */}
          <div className="flex flex-col gap-3 shrink-0">

            {/* 1. WORKSPACE SELECTOR & NOTIFICATION BELL */}
            <div className="flex items-center justify-between h-[47px] pb-1">
              <div>
                <div className="bg-white rounded-lg">
                  <button
                    type="button"
                    id="workspace-menu"
                    aria-haspopup="menu"
                    aria-expanded="false"
                    data-state="closed"
                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg cursor-pointer hover:bg-gray-100 group transition-colors text-left"
                  >
                    <div className="flex gap-x-2 items-center">
                      <div className="relative flex items-center gap-2 text-gray-600">
                        <div className="w-7.5 h-7.5 rounded-lg bg-[#E0E6EB] box-border flex justify-center items-center select-none shrink-0 shadow-3xs">
                          <p className="m-0 p-0 text-center box-border font-sans text-[11px] text-[#2D3A46] leading-[0] uppercase font-semibold">{userInitials}</p>
                        </div>
                      </div>
                      <div className="flex flex-col max-w-[130px]">
                        <div className="text-slate-800 text-[13px] font-normal tracking-tight font-sans">
                          <div className="flex items-center gap-x-1">
                            <div className="capitalize truncate">
                              {firstName ? `Hi, ${firstName}` : "Hi, User"}
                            </div>
                          </div>
                        </div>
                        <div className="text-slate-600 text-[13px] font-normal leading-normal truncate font-sans">
                          <div className="flex items-center gap-x-1">
                            <span className="capitalize truncate">
                              {userRoleFormatted}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <ChevronDown className="w-3 h-3 shrink-0 text-slate-400 group-hover:text-slate-800 transition-colors ml-0.5" />
                  </button>
                </div>
              </div>

              {/* Notification Bell */}
              <div className="flex items-center">
                <NotificationBell />
              </div>
            </div>

            {/* 2. USAGE TRACKER / PROGRESS & ACTION BUTTONS */}
            <div className="flex flex-col gap-2.5 px-1 py-1">
              <div className="flex flex-col gap-2">
                {/* Tracker 1: Permohonan Masuk */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-slate-600 font-sans">
                      Permohonan Masuk
                    </span>
                    <span className="text-[11px] text-slate-700 tabular-nums font-medium font-sans">
                      {totalApplicantsCount}
                    </span>
                  </div>
                  <div className="rounded-full bg-slate-200/80 w-full h-1.5 overflow-hidden">
                    <div className="h-full bg-[#00a389] rounded-full w-full motion-safe:animate-progress-ok" />
                  </div>
                </div>

                {/* Tracker 2: Scan permohonan diupload */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-slate-600 font-sans">
                      Scan permohonan diupload
                    </span>
                    <span className="text-[11px] text-slate-700 tabular-nums font-medium font-sans">
                      {stats.scanned}/{totalApplicantsCount}
                    </span>
                  </div>
                  <div className="rounded-full bg-slate-200/80 w-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-[#00a389] rounded-full transition-all duration-500 motion-safe:animate-progress-ok"
                      style={{ width: `${totalApplicantsCount > 0 ? Math.min(100, Math.round((stats.scanned / totalApplicantsCount) * 100)) : 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Digital Clock Badge */}
              <div className="relative flex items-center justify-center rounded-lg px-3 py-2 text-[13px] text-white bg-[#00a389] shadow-xs select-none gap-2 font-sans font-normal">
                <Clock className="w-4 h-4 shrink-0 text-white stroke-[2]" />
                <span className="font-mono text-[13px] font-normal tracking-wider text-white">{currentTime || '00:00:00'}</span>
              </div>

              {/* Today Date Badge */}
              <div className="relative flex items-center justify-center rounded-lg px-3 py-1.5 border font-normal text-[13px] border-slate-200/90 bg-white text-slate-700 shadow-3xs select-none mt-0.5 gap-2 font-sans">
                <Calendar className="w-4 h-4 shrink-0 text-slate-400" />
                <span className="truncate text-[13px] font-normal text-slate-700 font-sans">{todayFormatted}</span>
              </div>
            </div>

          </div>

          {/* ========================================== */}
          {/* SECTION 2: SCROLLABLE NAVIGATION AREA (TENGAH) */}
          {/* ========================================== */}
          <div className="px-1 border-t border-b border-transparent my-3 overflow-y-auto scrollbar-none flex-1">
            <div className="flex flex-col gap-4 my-2">

              {/* 2.1 Navigasi Utama */}
              <nav className="flex flex-col gap-0.5">
                {mainMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setSelectedProject(null);
                      }}
                      className={`w-full flex group items-center gap-2 px-2.5 py-2 text-left rounded-lg text-[13px] font-normal font-sans transition-all ${isActive
                        ? 'bg-slate-100 text-slate-900 font-normal'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-normal'
                        }`}
                      title={item.label}
                    >
                      <div className="w-3.5 h-3.5 shrink-0" />
                      <Icon className={`w-4 h-4 shrink-0 transition-all ${isActive ? 'text-slate-900 fill-slate-900/15' : 'text-slate-400 fill-none group-hover:text-slate-900'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* 2.2 Accordions (Permohonan Masuk & Favorit NOPEL) */}
              <div className="flex flex-col gap-0.5 pt-1">

                {/* Permohonan Masuk Accordion */}
                <div>
                  <button
                    onClick={() => setShowProjects(!showProjects)}
                    className="w-full flex items-center justify-between group px-2.5 py-2 rounded-lg text-[13px] font-normal text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer font-sans"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 shrink-0 flex items-center justify-center">
                        <ChevronRight className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 transition-transform duration-200 ${showProjects ? 'rotate-90 text-slate-900' : ''}`} />
                      </div>
                      <Folder className={`w-4 h-4 shrink-0 transition-all ${showProjects ? 'text-slate-900 fill-slate-900/15' : 'text-slate-400 fill-none group-hover:text-slate-900'}`} />
                      <span className={showProjects ? 'text-slate-900' : ''}>Projects</span>
                    </div>
                    {totalApplicantsCount > 0 && (
                      <span className="text-[11px] font-normal text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full font-sans">
                        {totalApplicantsCount}
                      </span>
                    )}
                  </button>
                  {showProjects && (
                    <div className="pl-12 flex flex-col gap-0.5 animate-fadeIn">
                      {dataBaruItems.length > 0 ? (
                        dataBaruItems.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => {
                              setSearchQuery(item.namaPemilikBaru);
                              setActiveTab('my-tasks');
                            }}
                            className="w-full text-left py-1.5 px-2 text-[13px] font-normal text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors truncate cursor-pointer flex items-center justify-between gap-1.5 font-sans"
                            title={`Pemohon: ${item.namaPemilikBaru} (NOPEL: ${item.nopel})`}
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                              <span className="truncate capitalize text-[13px] font-normal text-slate-600 font-sans">{item.namaPemilikBaru}</span>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="py-1 px-2 text-[11px] text-slate-400 font-normal italic select-none font-sans">
                          Belum ada permohonan masuk
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Favorit NOPEL Accordion */}
                <div>
                  <button
                    onClick={() => setShowCollections(!showCollections)}
                    className="w-full flex items-center justify-between group px-2.5 py-2 rounded-lg text-[13px] font-normal text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer font-sans"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 shrink-0 flex items-center justify-center">
                        <ChevronRight className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 transition-transform duration-200 ${showCollections ? 'rotate-90 text-slate-900' : ''}`} />
                      </div>
                      <Layers className={`w-4 h-4 shrink-0 transition-all ${showCollections ? 'text-slate-900 fill-slate-900/15' : 'text-slate-400 fill-none group-hover:text-slate-900'}`} />
                      <span className={showCollections ? 'text-slate-900' : ''}>Favorit</span>
                    </div>
                    {favoritePermohonans && favoritePermohonans.length > 0 && (
                      <span className="text-[11px] font-normal text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full font-sans">
                        {favoritePermohonans.length}
                      </span>
                    )}
                  </button>
                  {showCollections && (
                    <div className="pl-12 flex flex-col gap-0.5 animate-fadeIn">
                      {favoritePermohonans && favoritePermohonans.length > 0 ? (
                        <>
                          {(showAllFavorites ? favoritePermohonans : favoritePermohonans.slice(0, 5)).map((fav) => (
                            <button
                              key={fav.id}
                              onClick={() => {
                                setSearchQuery(fav.nomorPelayanan || fav.nomorPermohonan);
                                setActiveTab('my-tasks');
                              }}
                              className="w-full flex items-center gap-2 text-left py-1.5 px-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors group/fav truncate cursor-pointer"
                              title={`Lihat Permohonan: ${fav.nomorPelayanan || fav.nomorPermohonan}`}
                            >
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                              <span className="truncate font-mono text-xs font-semibold text-slate-700">
                                {fav.nomorPelayanan || fav.nomorPermohonan}
                              </span>
                            </button>
                          ))}
                          {favoritePermohonans.length > 5 && (
                            <button
                              onClick={() => setShowAllFavorites(!showAllFavorites)}
                              className="w-full text-left py-1 px-2 text-[11px] font-semibold text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
                            >
                              {showAllFavorites ? 'Tampilkan lebih sedikit' : 'Tampilkan lebih banyak'}
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="py-1 px-2 text-[11px] text-slate-400 font-medium italic select-none">
                          Belum ada NOPEL favorit
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>

              {/* 2.3 Secondary Links */}
              <div className="flex flex-col gap-0.5 pt-1">
                <button className="w-full flex items-center gap-2 group px-2.5 py-2 text-[13px] font-normal text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors cursor-pointer font-sans">
                  <div className="w-3.5 h-3.5 shrink-0" />
                  <Share2 className="w-4 h-4 text-slate-400 group-hover:text-slate-900 shrink-0 transition-colors" />
                  <span>Shared with Me</span>
                </button>
                <button className="w-full flex items-center gap-2 group px-2.5 py-2 text-[13px] font-normal text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors cursor-pointer font-sans">
                  <div className="w-3.5 h-3.5 shrink-0" />
                  <Trash2 className="w-4 h-4 text-slate-400 group-hover:text-slate-900 shrink-0 transition-colors" />
                  <span>Recently Deleted</span>
                </button>
              </div>

            </div>
          </div>

          {/* ========================================== */}
          {/* SECTION 3: FOOTER & USER PROFILE (BAWAH)   */}
          {/* ========================================== */}
          <div className="mt-auto pt-3 px-1 pb-2 border-t border-slate-200/80 flex flex-col gap-1.5">
            <div className="flex flex-col gap-0.5">
              <button className="w-full flex items-center gap-2 group px-2.5 py-2 text-[13px] font-normal text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors cursor-pointer font-sans">
                <div className="w-3.5 h-3.5 shrink-0" />
                <GraduationCap className="w-4 h-4 text-slate-400 group-hover:text-slate-900 shrink-0 transition-colors" />
                <span>Learn</span>
              </button>
              <button className="w-full flex items-center gap-2 group px-2.5 py-2 text-[13px] font-normal text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors cursor-pointer font-sans">
                <div className="w-3.5 h-3.5 shrink-0" />
                <Gift className="w-4 h-4 text-slate-400 group-hover:text-slate-900 shrink-0 transition-colors" />
                <span>Refer & earn</span>
              </button>
              <button
                onClick={() => setIsPersonalProfileDrawerOpen && setIsPersonalProfileDrawerOpen(true)}
                className="w-full flex items-center gap-2 group px-2.5 py-2 text-[13px] font-normal text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors cursor-pointer font-sans"
              >
                <div className="w-3.5 h-3.5 shrink-0" />
                <Globe className="w-4 h-4 text-slate-400 group-hover:text-slate-900 shrink-0 transition-colors" />
                <span>Profile</span>
              </button>
            </div>

            {/* User Profile Badge */}
            <div
              onClick={() => setIsPersonalProfileDrawerOpen && setIsPersonalProfileDrawerOpen(true)}
              className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors group mt-1"
            >
              <div className="w-7 h-7 rounded-full bg-[#ffedd5] text-[#9a3412] font-normal text-[13px] flex items-center justify-center shrink-0 border border-[#fed7aa] font-sans">
                M
              </div>
              <div className="flex flex-col truncate max-w-[180px]">
                <span className="truncate font-normal text-[13px] text-slate-700 group-hover:text-slate-900 font-sans">
                  Mufti Harir
                </span>
                <span className="truncate text-xs font-normal text-slate-500 font-sans">
                  muftiharir3@gmail.com
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </aside>
  );
}
