"use client";

import React, { useState, useMemo, useEffect } from 'react';
import NotificationBell from './NotificationBell';
import {
  LayoutDashboard,
  FileText,
  Sparkles,
  Layers,
  FolderKanban,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Users,
  Bell,
  Trash2,
  Share2,
  GraduationCap,
  Gift,
  User,
  Plus,
  Star,
  Zap,
  MoreHorizontal,
  Home,
  CheckSquare,
  Inbox,
  Search,
  HelpCircle,
  Calendar
} from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';
import { getLatestPermohonans, getPermohonanStats } from '@/app/actions/penginput';

export default function Sidebar() {
  const {
    activeTab,
    setActiveTab,
    teams,
    selectedTeamId,
    setSelectedTeamId,
    setShowAddTeamModal,
    setSelectedProject,
    favoritePermohonans,
    setSearchQuery,
    setIsPersonalProfileDrawerOpen
  } = useDashboard();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const [showCollections, setShowCollections] = useState(false);
  const [showAllFavorites, setShowAllFavorites] = useState(false);

  // Dynamic Permohonan Stats & List
  const [permohonanList, setPermohonanList] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, scanned: 0 });

  useEffect(() => {
    async function loadPermohonanData() {
      try {
        const [latestRes, statsRes] = await Promise.all([
          getLatestPermohonans(15),
          getPermohonanStats()
        ]);
        if (latestRes.success && latestRes.list) {
          setPermohonanList(latestRes.list);
        }
        if (statsRes.success && statsRes.stats) {
          setStats({
            total: statsRes.stats.total || 0,
            scanned: (statsRes.stats.completed || 0) + (statsRes.stats.sent || 0)
          });
        }
      } catch (e) {
        console.error('Failed to load permohonan data for sidebar:', e);
      }
    }
    loadPermohonanData();
  }, []);

  // Flatten permohonan list into individual new applicant (DataBaru) items
  const dataBaruItems = useMemo(() => {
    const items: Array<{ id: string; namaPemilikBaru: string; nopel: string; permohonanId: string }> = [];
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

  const totalApplicantsCount = dataBaruItems.length > 0 ? dataBaruItems.length : stats.total;

  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }, []);

  const mainMenuItems = [
    { id: 'beranda', label: 'Beranda', icon: Home },
    { id: 'my-tasks', label: 'Tugas Saya', icon: CheckSquare },
    { id: 'inbox', label: 'Inbox', icon: Inbox },
    { id: 'tracking', label: 'Pelacakan', icon: Search },
    { id: 'help', label: 'Help', icon: HelpCircle },
  ];

  return (
    <aside
      id="sidebar-nav"
      style={{ fontFamily: "'Karla', var(--font-karla), system-ui, 'Segoe UI', Roboto, sans-serif" }}
      className={`${isCollapsed ? 'w-16 p-3' : 'w-[289px] p-4'
        } min-h-screen flex flex-col justify-between shrink-0 select-none relative bg-white border-r border-slate-200/90 text-slate-700 transition-all duration-300 z-30`}
    >
      {/* Floating Collapse/Expand Trigger Button on the right edge */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:text-slate-900 hover:scale-110 active:scale-95 transition-all cursor-pointer z-45"
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
        )}
      </button>

      {/* TOP SECTION */}
      <div className="flex flex-col gap-4 overflow-y-auto scrollbar-none pr-0.5">

        {/* 1. WORKSPACE HEADER SELECTOR */}
        {!isCollapsed ? (
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2.5 cursor-pointer group">
              <div className="w-7 h-7 rounded-lg bg-slate-300 text-slate-900 text-xs font-semibold flex items-center justify-center shrink-0 shadow-xs">
                MU
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-slate-800 group-hover:text-orange-600 transition-colors truncate max-w-[130px]">
                    Mufti's Workspace
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
                </div>
                <span className="text-[10px] font-medium text-slate-400">
                  Starter Plan
                </span>
              </div>
            </div>

            {/* Notification Bell */}
            <NotificationBell />
          </div>
        ) : (
          <div className="flex justify-center pb-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
              MU
            </div>
          </div>
        )}

        {/* 2. USAGE / PROGRESS TRACKER BOX (Borderless) */}
        {!isCollapsed && (
          <div className="rounded-lg p-3 bg-slate-50 flex flex-col gap-2.5">
            {/* Line 1: Permohonan Masuk (Counts individual new applicant names) */}
            <div className="flex flex-col gap-1 text-[10px] font-medium text-slate-500">
              <div className="flex items-center justify-between">
                <span>Permohonan Masuk</span>
                <span className="text-slate-700 font-semibold">{totalApplicantsCount}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-200/80 overflow-hidden">
                <div className="h-full bg-slate-400 rounded-full w-full" />
              </div>
            </div>

            {/* Line 2: Scan Permohonan Diupload */}
            <div className="flex flex-col gap-1 text-[10px] font-medium text-slate-500">
              <div className="flex items-center justify-between">
                <span>Scan permohonan diupload</span>
                <span className="text-slate-700 font-semibold">{stats.scanned}/{totalApplicantsCount}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-200/80 overflow-hidden">
                <div
                  className="h-full bg-slate-400 rounded-full transition-all duration-500"
                  style={{ width: `${totalApplicantsCount > 0 ? Math.min(100, Math.round((stats.scanned / totalApplicantsCount) * 100)) : 0}%` }}
                />
              </div>
            </div>

            <button className="w-full py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-lg transition-all shadow-3xs cursor-pointer flex items-center justify-center gap-1.5 mt-0.5">
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>Upgrade</span>
            </button>
          </div>
        )}

        {/* 3. TODAY DATE DISPLAY */}
        {!isCollapsed && (
          <div className="w-full py-1.5 px-3 border border-slate-200/90 bg-slate-50/50 text-slate-700 font-bold text-xs rounded-lg flex items-center justify-center gap-2 select-none shadow-3xs">
            <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="capitalize text-slate-700">{todayFormatted}</span>
          </div>
        )}

        {/* 4. MAIN NAVIGATION MENU */}
        <nav className="flex flex-col gap-0.5 mt-1">
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
                className={`w-full flex ${isCollapsed ? 'justify-center py-2 px-1' : 'items-center gap-3 px-3 py-2 text-left'
                  } rounded-lg text-xs transition-all ${isActive
                    ? 'bg-slate-100 text-slate-900 font-bold shadow-3xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                  }`}
                title={item.label}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-900' : 'text-slate-500'}`} />
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* 5. EXPANDABLE CATEGORIES (Permohonan Masuk & Favorit) */}
        {!isCollapsed && (
          <div className="flex flex-col gap-0.5 pt-2 border-t border-slate-100">
            {/* Permohonan Masuk Category */}
            <button
              onClick={() => setShowProjects(!showProjects)}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <div className="flex items-center gap-2">
                <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${showProjects ? 'rotate-90' : ''}`} />
                <span>Permohonan Masuk</span>
              </div>
              {totalApplicantsCount > 0 && (
                <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-full">
                  {totalApplicantsCount}
                </span>
              )}
            </button>
            {showProjects && (
              <div className="pl-7 flex flex-col gap-0.5 animate-fadeIn">
                {dataBaruItems.length > 0 ? (
                  dataBaruItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSearchQuery(item.namaPemilikBaru);
                        setActiveTab('my-tasks');
                      }}
                      className="w-full text-left py-1 px-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors truncate cursor-pointer flex items-center justify-between gap-1.5"
                      title={`Pemohon: ${item.namaPemilikBaru} (NOPEL: ${item.nopel})`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                        <span className="truncate uppercase text-[11px] font-semibold">{item.namaPemilikBaru}</span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="py-1 px-2 text-[10px] text-slate-400 font-medium italic select-none">
                    Belum ada permohonan masuk
                  </div>
                )}
              </div>
            )}

            {/* Favorit Category */}
            <button
              onClick={() => setShowCollections(!showCollections)}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <div className="flex items-center gap-2">
                <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${showCollections ? 'rotate-90' : ''}`} />
                <span>Favorit</span>
              </div>
              {favoritePermohonans && favoritePermohonans.length > 0 && (
                <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                  {favoritePermohonans.length}
                </span>
              )}
            </button>

            {showCollections && (
              <div className="pl-7 flex flex-col gap-0.5 animate-fadeIn">
                {favoritePermohonans && favoritePermohonans.length > 0 ? (
                  <>
                    {(showAllFavorites ? favoritePermohonans : favoritePermohonans.slice(0, 5)).map((fav) => (
                      <button
                        key={fav.id}
                        onClick={() => {
                          setSearchQuery(fav.nomorPelayanan || fav.nomorPermohonan);
                          setActiveTab('my-tasks');
                        }}
                        className="w-full flex items-center gap-2 text-left py-1 px-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors group/fav truncate cursor-pointer"
                        title={`Lihat Permohonan: ${fav.nomorPelayanan || fav.nomorPermohonan}`}
                      >
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                        <span className="truncate font-mono text-[11px]">
                          {fav.nomorPelayanan || fav.nomorPermohonan}
                        </span>
                      </button>
                    ))}
                    {favoritePermohonans.length > 5 && (
                      <button
                        onClick={() => setShowAllFavorites(!showAllFavorites)}
                        className="w-full text-left py-1 px-2 text-[10px] font-semibold text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                      >
                        {showAllFavorites ? 'Tampilkan lebih sedikit' : 'Tampilkan lebih banyak'}
                      </button>
                    )}
                  </>
                ) : (
                  <div className="py-1 px-2 text-[10px] text-slate-400 font-medium italic select-none">
                    Belum ada NOPEL favorit
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 6. SECONDARY LINKS (Shared with Me, Recently Deleted) */}
        {!isCollapsed && (
          <div className="flex flex-col gap-0.5 pt-2">
            <button className="w-full flex items-center gap-3 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors">
              <Share2 className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Shared with Me</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors">
              <Trash2 className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Recently Deleted</span>
            </button>
          </div>
        )}

      </div>

      {/* BOTTOM FOOTER SECTION */}
      <div className="flex flex-col gap-2 pt-3">
        {!isCollapsed && (
          <div className="flex flex-col gap-0.5">
            <button className="w-full flex items-center gap-3 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors">
              <GraduationCap className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Learn</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors">
              <Gift className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Refer & earn</span>
            </button>
            <button
              onClick={() => setIsPersonalProfileDrawerOpen && setIsPersonalProfileDrawerOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors"
            >
              <User className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Profile</span>
            </button>
          </div>
        )}

        {/* User Profile Info Badge */}
        {!isCollapsed ? (
          <div
            onClick={() => setIsPersonalProfileDrawerOpen && setIsPersonalProfileDrawerOpen(true)}
            className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 font-bold text-xs flex items-center justify-center shrink-0 border border-orange-200/80">
              M
            </div>
            <div className="flex flex-col truncate">
              <span className="font-bold text-xs text-slate-800 group-hover:text-slate-900 truncate">
                Mufti Harir
              </span>
              <span className="text-[10px] font-medium text-slate-400 truncate">
                muftiharir3@gmail.com
              </span>
            </div>
          </div>
        ) : (
          <div
            onClick={() => setIsPersonalProfileDrawerOpen && setIsPersonalProfileDrawerOpen(true)}
            className="flex justify-center p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
            title="Profile: Mufti Harir"
          >
            <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 font-bold text-xs flex items-center justify-center shrink-0 border border-orange-200/80">
              M
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
