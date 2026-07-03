"use client";

import React, { useState } from 'react';
import {
  Home,
  CheckSquare,
  Inbox,
  Briefcase,
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
    setSelectedProject
  } = useDashboard();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const mainMenuItems = [
    { id: 'beranda', label: 'Beranda', icon: Home },
    { id: 'my-tasks', label: 'My Tasks', icon: CheckSquare },
    { id: 'inbox', label: 'Inbox', icon: Inbox },
    { id: 'portfolios', label: 'Portfolios', icon: Briefcase },
    { id: 'help', label: 'Help', icon: HelpCircle },
  ];

  const favoritesList = [
    { id: 'fav-mob', label: 'Mobile App R...' },
    { id: 'fav-launch', label: 'Launch 3.0' },
    { id: 'fav-event', label: 'Event Proposals' },
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
          {/* Architax 3 pink-coral dots logo */}
          <div className="flex items-center gap-1 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f06e5b] inline-block shadow-sm animate-pulse" />
            <div className="flex flex-col gap-0.5 justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f06e5b] inline-block shadow-sm" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#f06e5b] inline-block shadow-sm" />
            </div>
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

            <div className="flex flex-col gap-3 pl-0.5">
              {favoritesList.map((fav) => (
                <button
                  key={fav.id}
                  className="w-full flex items-center gap-3 text-left text-sm text-[#4e535e] hover:text-[#1e2022] font-semibold transition-all"
                >
                  <Star className="w-[18px] h-[18px] text-[#5a606d] stroke-[2.2] shrink-0" />
                  <span className="truncate flex-1">{fav.label}</span>
                </button>
              ))}
              <button
                className="w-full flex items-center gap-3 text-left text-sm text-[#4e535e] hover:text-[#1e2022] font-semibold transition-all pt-0.5"
              >
                <MoreHorizontal className="w-[18px] h-[18px] text-[#5a606d] stroke-[2.2] shrink-0" />
                <span>Show more</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            {favoritesList.map((fav) => (
              <button
                key={fav.id}
                className="flex items-center justify-center p-1 text-[#4e535e] hover:text-[#1e2022] transition-all"
                title={`Favorite: ${fav.label}`}
              >
                <Star className="w-[18px] h-[18px] text-[#5a606d] stroke-[2.2]" />
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
