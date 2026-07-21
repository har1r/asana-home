"use client";

import React, { useState } from 'react';
import {
  Home,
  CheckSquare,
  Inbox,
  Search,
  HelpCircle,
  Star,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Plus,
  MoreHorizontal
} from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';

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
    setSearchQuery
  } = useDashboard();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAllFavorites, setShowAllFavorites] = useState(false);

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
      className={`${isCollapsed ? 'w-16 px-3.5 py-6' : 'w-60 p-6'
        } min-h-screen flex flex-col shrink-0 font-sans select-none relative bg-gradient-to-b from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] text-[#2c333f]/90 transition-all duration-300`}
    >
      {/* Floating Collapse/Expand Trigger Button on the top right edge of the sidebar */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-[26px] w-6 h-6 rounded-full bg-white border border-[#beccd9] shadow-sm flex items-center justify-center text-gray-700 hover:text-[#1e2022] hover:scale-110 active:scale-95 transition-all cursor-pointer z-45"
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
        )}
      </button>

      <div className="flex flex-col gap-6">
        {/* Architax Branding Logo Section */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5'} pb-2`}>
          {/* Architax Four Tiles Logo */}
          <div className="w-8 h-8 shrink-0 transition-all duration-300 hover:scale-105">
            <svg viewBox="34 34 132 132" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <g transform="translate(100,100) rotate(-8)">
                {/* Top-left */}
                <rect x="-56" y="-56" width="50" height="50" rx="12" fill="#3F72E6"/>
                {/* Top-right */}
                <rect x="6" y="-56" width="50" height="50" rx="12" fill="#0DC5B4"/>
                {/* Bottom-left */}
                <rect x="-56" y="6" width="50" height="50" rx="12" fill="#FF6355"/>
                {/* Bottom-right */}
                <rect x="6" y="6" width="50" height="50" rx="12" fill="#7C5CFC"/>
              </g>
              {/* Center connector dot */}
              <circle cx="100" cy="100" r="6" fill="white"/>
            </svg>
          </div>
          {!isCollapsed && (
            <span className="font-bold text-xl tracking-tight text-[#1e2022] font-display animate-fade-in">Architax</span>
          )}
        </div>

        {/* Global Navigation Items */}
        <nav className="flex flex-col gap-2.5">
          {mainMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-item-${item.id}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setSelectedProject(null);
                }}
                className={`w-full flex ${isCollapsed ? 'justify-center py-2' : 'items-center gap-3.5 py-0.5 text-left'
                  } text-sm transition-all relative ${isActive
                    ? 'text-[#1e2022] font-bold'
                    : 'text-[#4e535e] hover:text-[#1e2022] font-semibold'
                  }`}
                title={item.label}
              >
                <Icon className={`w-[18px] h-[18px] stroke-[2.2] shrink-0 ${isActive ? 'text-[#1e2022]' : 'text-[#5a606d]'}`} />
                {!isCollapsed && item.label}
              </button>
            );
          })}
        </nav>

        {/* Muted thin divider */}
        <div className="h-[1px] bg-black/10 my-1 w-full" />

        {/* Favorites Section */}
        {!isCollapsed ? (
          <div className="flex flex-col gap-3">
            <span className="text-[11px] font-bold tracking-widest text-[#5a606d] font-sans">Favorites</span>

            <div className="flex flex-col gap-2.5 pl-0.5">
              {favoritePermohonans && favoritePermohonans.length > 0 ? (
                <>
                  {(showAllFavorites ? favoritePermohonans : favoritePermohonans.slice(0, 5)).map((fav) => (
                    <button
                      key={fav.id}
                      onClick={() => {
                        setSearchQuery(fav.nomorPelayanan || fav.nomorPermohonan);
                        setActiveTab('my-tasks');
                      }}
                      className="w-full flex items-center gap-3 text-left text-xs text-[#4e535e] hover:text-[#1e2022] font-semibold transition-all group/fav"
                      title={`Lihat Permohonan: ${fav.nomorPelayanan || fav.nomorPermohonan}`}
                    >
                      <Star className="w-[16px] h-[16px] text-amber-500 fill-amber-500 drop-shadow-[0_0_4px_rgba(245,158,11,0.35)] shrink-0 group-hover/fav:scale-110 transition-transform" />
                      <span className="truncate flex-1 font-sans text-[11px] text-[#2c333f] font-semibold">
                        {fav.nomorPelayanan || fav.nomorPermohonan}
                      </span>
                    </button>
                  ))}
                  {favoritePermohonans.length > 5 && (
                    <button
                      onClick={() => setShowAllFavorites(!showAllFavorites)}
                      className="w-full flex items-center gap-3 text-left text-xs text-[#4e535e] hover:text-[#1e2022] font-semibold transition-all pt-0.5"
                    >
                      <MoreHorizontal className="w-[16px] h-[16px] text-[#5a606d] stroke-[2.2] shrink-0" />
                      <span>{showAllFavorites ? 'Tampilkan lebih sedikit' : 'Tampilkan lebih banyak'}</span>
                    </button>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2.5 px-1 py-0.5 text-[#5a606d]/60 select-none animate-fadeIn">
                  <div className="relative w-5 h-5 flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" className="w-full h-full">
                      <defs>
                        <style>{`
                          @keyframes starPulse {
                            0%, 100% { transform: scale(1); opacity: 0.6; }
                            50% { transform: scale(1.15); opacity: 1; }
                          }
                          @keyframes sparkleBlink {
                            0%, 100% { opacity: 0.15; transform: scale(0.6) rotate(0deg); }
                            50% { opacity: 0.95; transform: scale(1.1) rotate(45deg); }
                          }
                          .pulsing-star {
                            transform-origin: center;
                            animation: starPulse 3s ease-in-out infinite;
                          }
                          .sparkle-dot-1 {
                            transform-origin: 18px 6px;
                            animation: sparkleBlink 2.2s ease-in-out infinite;
                          }
                          .sparkle-dot-2 {
                            transform-origin: 6px 18px;
                            animation: sparkleBlink 2.5s ease-in-out infinite;
                            animation-delay: 0.8s;
                          }
                        `}</style>
                      </defs>
                      <path
                        className="pulsing-star"
                        d="M12 2.5l2.2 6.8h7.2l-5.8 4.2 2.2 6.8-5.8-4.2-5.8 4.2 2.2-6.8-5.8-4.2h7.2z"
                        fill="none"
                        stroke="#5a606d"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path className="sparkle-dot-1" d="M18 6l1 1-1 1-1-1z" fill="#f59e0b" />
                      <path className="sparkle-dot-2" d="M6 18l1 1-1 1-1-1z" fill="#f59e0b" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-semibold italic text-[#5a606d]/75">Belum ada favorit</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            {favoritePermohonans && favoritePermohonans.slice(0, 5).map((fav) => (
              <button
                key={fav.id}
                onClick={() => {
                  setSearchQuery(fav.nomorPelayanan || fav.nomorPermohonan);
                  setActiveTab('my-tasks');
                }}
                className="flex items-center justify-center p-1 text-[#4e535e] hover:text-[#1e2022] transition-all"
                title={`Favorite: ${fav.nomorPelayanan || fav.nomorPermohonan}`}
              >
                <Star className="w-[18px] h-[18px] text-amber-500 fill-amber-500 drop-shadow-[0_0_4px_rgba(245,158,11,0.35)]" />
              </button>
            ))}
          </div>
        )}

        {/* Teams Section */}
        {!isCollapsed ? (
          <div className="flex flex-col gap-3 mt-1">
            <span className="text-[11px] font-bold tracking-widest text-[#5a606d] font-sans">Teams</span>

            <div className="flex flex-col gap-3 pl-0.5">
              {teams.map((team) => {
                const isSelected = selectedTeamId === team.id;
                return (
                  <button
                    key={team.id}
                    onClick={() => setSelectedTeamId(team.id)}
                    className={`w-full flex items-center justify-between text-left text-sm transition-all ${isSelected
                      ? 'text-[#1e2022] font-bold'
                      : 'text-[#4e535e] hover:text-[#1e2022] font-semibold'
                      }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className="flex flex-wrap w-[18px] h-[18px] items-center justify-center p-0.5 border border-[#5a606d]/20 rounded-md bg-white/20 select-none">
                        <span className="w-1 h-1 rounded-full bg-[#5a606d]" />
                      </div>
                      <span className="truncate">{team.name}</span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-[#5a606d] stroke-[2.2] shrink-0" />
                  </button>
                );
              })}

              <button
                onClick={() => setShowAddTeamModal(true)}
                className="w-full flex items-center gap-3 text-left text-sm text-indigo-700/85 hover:text-indigo-900 font-bold transition-all pt-1"
              >
                <Plus className="w-[18px] h-[18px] stroke-[2.5]" />
                <span>Add team</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 mt-1">
            {teams.map((team) => {
              const isSelected = selectedTeamId === team.id;
              return (
                <button
                  key={team.id}
                  onClick={() => setSelectedTeamId(team.id)}
                  className="flex items-center justify-center p-1 transition-all"
                  title={`Team: ${team.name}`}
                >
                  <div className={`flex flex-wrap w-[18px] h-[18px] items-center justify-center p-0.5 border rounded-md select-none ${isSelected ? 'border-[#1e2022] bg-white/40' : 'border-[#5a606d]/20 bg-white/20'
                    }`}>
                    <span className="w-1 h-1 rounded-full bg-[#5a606d]" />
                  </div>
                </button>
              );
            })}

            <button
              onClick={() => setShowAddTeamModal(true)}
              className="flex items-center justify-center p-1 text-indigo-700/85 hover:text-indigo-900 transition-all font-bold"
              title="Add team"
            >
              <Plus className="w-[18px] h-[18px] stroke-[2.5]" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
