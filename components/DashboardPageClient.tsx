"use client";

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Menu,
  X,
  Bell,
  Calendar,
  Plus,
  Users,
  Check,
  HelpCircle,
  TrendingUp,
  Inbox as InboxIcon,
  Briefcase,
  Layers,
  Info
} from 'lucide-react';
import { DashboardProvider, useDashboard } from '@/context/DashboardContext';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import TasksRevisionCard from '@/components/TasksRevisionCard';
import FavoritesCard from '@/components/FavoritesCard';
import RecentTasksCard from '@/components/RecentTasksCard';
import MessageTeamCard from '@/components/MessageTeamCard';
import CalendarCard from '@/components/CalendarCard';
import ProjectDetailsDrawer from '@/components/ProjectDetailsDrawer';
import { useSession, signOut } from 'next-auth/react';
import PenginputWorkspace, { PenginputSkeleton } from '@/components/workspaces/PenginputWorkspace';
import PenelitiWorkspace, { PenelitiSkeleton } from '@/components/workspaces/PenelitiWorkspace';
import PengarsipWorkspace, { PengarsipSkeleton } from '@/components/workspaces/PengarsipWorkspace';
import PengirimWorkspace, { PengirimSkeleton } from '@/components/workspaces/PengirimWorkspace';
import PemantauWorkspace, { PemantauSkeleton } from '@/components/workspaces/PemantauWorkspace';
import NotificationSystem from '@/components/NotificationSystem';
import { SkeletonBox, SkeletonCircle, SkeletonText, SkeletonProgressBar, SkeletonBadge } from '@/components/skeletons/SkeletonBase';

/** Skeleton untuk tab Inbox — 3 notification card shimmer */
function InboxSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200/80 p-6 flex flex-col gap-6 w-full shadow-sm max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gray-250 animate-pulse rounded" />
          <SkeletonBox width="w-28" height="h-5" rounded="rounded-full" />
        </div>
        <SkeletonText width="w-64" height="h-3" className="mt-1" />
      </div>

      {/* 3 notification rows */}
      <div className="flex flex-col gap-4">
        {[{ w: 'w-3/4', bw: 'w-1/2' }, { w: 'w-2/3', bw: undefined }, { w: 'w-1/2', bw: undefined }].map((item, i) => (
          <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex gap-3.5 items-start">
            <SkeletonCircle size="w-9 h-9" />
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex flex-col gap-1.5">
                <SkeletonText width={item.w} height="h-3" />
                <SkeletonText width="w-32" height="h-2.5" />
              </div>
              {item.bw && (
                <div className="bg-white rounded-lg p-2.5 border border-slate-100">
                  <SkeletonText width={item.bw} height="h-3" />
                  <SkeletonText width="w-2/3" height="h-3" className="mt-1.5" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Skeleton untuk tab Portfolios — 4 project card shimmer */
function PortfoliosSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200/80 p-6 flex flex-col gap-6 w-full shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 bg-gray-200 animate-pulse rounded" />
          <SkeletonBox width="w-48" height="h-5" rounded="rounded-full" />
        </div>
        <SkeletonText width="w-72" height="h-3" className="mt-1" />
      </div>

      {/* 4-col grid of project cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-5 bg-slate-50 rounded-2xl border border-slate-200/40">
            {/* Icon + title */}
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gray-200 animate-pulse" />
              <div className="flex flex-col gap-1.5">
                <SkeletonText width="w-24" height="h-3" />
                <SkeletonText width="w-16" height="h-2" />
              </div>
            </div>
            {/* Progress section */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <SkeletonText width="w-16" height="h-2.5" />
                <SkeletonText width="w-8" height="h-2.5" />
              </div>
              <SkeletonProgressBar />
              <div className="flex justify-between pt-1">
                <SkeletonText width="w-16" height="h-2" />
                <SkeletonText width="w-16" height="h-2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


/** Spinner loading melingkar untuk My Tasks & pre-initialization */
function WorkspaceLoadingSkeleton() {
  return (
    <div className="w-full min-h-[400px] flex flex-col items-center justify-center gap-3 select-none animate-fadeIn">
      <div className="relative w-10 h-10">
        <div className="w-full h-full rounded-full border-[3px] border-slate-100" />
        <div className="absolute inset-0 w-full h-full rounded-full border-[3px] border-transparent border-t-indigo-500 border-r-violet-500 animate-spin" />
      </div>
      <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider animate-pulse">
        Memuat Halaman Kerja...
      </span>
    </div>
  );
}

function DashboardContent({ initialRole }: { initialRole: string | null }) {
  const { data: session, status: sessionStatus } = useSession();

  // Simpan role ke cookie agar loading berikutnya (SSR) langsung tahu skeleton mana yang di-render
  useEffect(() => {
    if (session?.user && (session.user as any).role) {
      const role = (session.user as any).role;
      document.cookie = `architax_user_role=${role}; path=/; max-age=31536000; SameSite=Lax`;
    }
  }, [session]);

  const {
    activeTab,
    setActiveTab,
    tasks,
    projects,
    favorites,
    teams,
    messages,
    members,
    selectedTeamId,
    setSelectedTeamId,
    selectedProject,
    setSelectedProject,
    searchQuery,
    setSearchQuery,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    isPersonalProfileDrawerOpen,
    setIsPersonalProfileDrawerOpen,

    showAddTeamModal,
    setShowAddTeamModal,
    newTeamName,
    setNewTeamName,
    selectedNewTeamMembers,
    setSelectedNewTeamMembers,
    showAddProjectModal,
    setShowAddProjectModal,

    handleAddTask,
    handleToggleTask,
    handleDeleteTask,
    handleAddProject,
    handleUpdateProject,
    handleAddTaskToProject,
    handleSelectProjectByTitle,
    handleSendMessage,
    handleCreateTeam,
    toggleSelectNewTeamMember,
    getTasksForProject,
    favoriteProjectsList,
    resetDatabase,
    isInitialized
  } = useDashboard();

  return (
    <div id="app-root" className="flex bg-[#f3f6f9] min-h-screen text-gray-800 font-sans relative overflow-x-hidden antialiased">

      {/* ====== GLOBAL NOTIFICATION SYSTEM — polls for new in-app notifications ====== */}
      <NotificationSystem />

      {/* --- DESKTOP SIDEBAR VIEW --- */}
      <div className="hidden md:flex shrink-0">
        <Sidebar />
      </div>

      {/* --- MOBILE COLLAPSED DRAWER MENU --- */}
      {isMobileMenuOpen && (
        <div id="mobile-sidebar-backdrop" className="fixed inset-0 z-40 bg-black/40 md:hidden flex animate-fadeIn" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="w-64 max-w-[80vw] h-full" onClick={(e) => e.stopPropagation()}>
            <Sidebar />
          </div>
        </div>
      )}

      {/* --- MAIN PAGE CONTENT INTERFACE --- */}
      <main id="main-content-pane" className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">

        {/* --- GLOBAL TOP NAVIGATION HEADER BAR --- */}
        <Header />

        {/* --- MAIN TAB INTERFACE CONTROLLER --- */}
        <div id="tab-content-container" className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10 max-w-7xl xl:max-w-[1440px] 2xl:max-w-[1680px] w-full mx-auto pb-16 transition-all duration-300 animate-fadeIn">

          {/* Active view query filters indicator */}
          {searchQuery && (
            <div className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl px-4 py-2 mb-4 flex items-center justify-between select-none animate-fadeIn">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>Filtering dashboard elements matching <strong>"{searchQuery}"</strong></span>
              </div>
              <button
                onClick={() => setSearchQuery('')}
                className="text-indigo-500 hover:text-indigo-800 transition-colors font-bold text-xs"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* ==================== HOME VIEW ==================== */}
          {/* Beranda menggunakan local gate berbasis isInitialized */}
          {activeTab === 'beranda' && (
            !isInitialized ? (
              <WorkspaceLoadingSkeleton />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-8 xl:gap-10 2xl:gap-12 items-start">

                {/* 1. Tasks Revision component */}
                <TasksRevisionCard onViewAll={() => setActiveTab('my-tasks')} />

                {/* 2. Favorites Dashboard Grid Tile matrix */}
                <FavoritesCard />

                {/* 3. Recent Tasks component */}
                <RecentTasksCard onViewAll={() => setActiveTab('my-tasks')} />

                {/* 4. Chat discussion board channel component */}
                <MessageTeamCard />

                {/* 5. Calendar Agenda component */}
                <div className="col-span-1 lg:col-span-2">
                  <CalendarCard />
                </div>

              </div>
            )
          )}

          {/* ==================== MY TASKS VIEW ==================== */}
          {/* Workspace menggunakan loading internal berbasis role dan data */}
          {activeTab === 'my-tasks' && (
            <div className="w-full">
              {(() => {
                // Cek role aktif: utamakan dari session (NextAuth), fallback ke cookie role
                const resolvedRole = (session?.user as any)?.role || initialRole;

                if (resolvedRole === 'PENGINPUT') {
                  return <PenginputWorkspace />;
                }
                if (resolvedRole === 'PENELITI') {
                  return <PenelitiWorkspace />;
                }
                if (resolvedRole === 'PENGARSIP') {
                  return <PengarsipWorkspace />;
                }
                if (resolvedRole === 'PENGIRIM') {
                  return <PengirimWorkspace />;
                }
                if (resolvedRole === 'PEMANTAU') {
                  return <PemantauWorkspace />;
                }

                // Hanya jika session loading selesai tapi role tidak dikenal sama sekali / guest
                if (sessionStatus !== 'loading') {
                  return (
                    <div className="bg-white rounded-xl border border-gray-200/80 p-12 text-center shadow-sm select-none">
                      <h3 className="text-sm font-bold text-gray-800 mb-1">Akses Ditolak</h3>
                      <p className="text-xs text-gray-400 font-semibold max-w-sm mx-auto">
                        Role Anda tidak terdaftar dalam sistem operasional.
                      </p>
                    </div>
                  );
                }

                // Fallback generic loading state jika session loading dan initialRole belum terload
                return <WorkspaceLoadingSkeleton />;
              })()}
            </div>
          )}

          {/* ==================== INBOX NOTIFICATION FEED VIEW ==================== */}
          {activeTab === 'inbox' && (
            messages.length === 0
              ? <InboxSkeleton />
              : (
                <div className="bg-white rounded-xl border border-gray-200/80 p-6 flex flex-col gap-6 w-full shadow-sm max-w-3xl mx-auto select-none">
                  <div className="flex flex-col gap-1 border-b border-gray-100 pb-4">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <InboxIcon className="w-5 h-5 text-indigo-500" /> Inbox Feed
                    </h2>
                    <p className="text-xs text-gray-400 font-medium">Collaboration stream, thread invitations, and active team updates.</p>
                  </div>

                  <div className="flex flex-col gap-4">
                    {/* 1. notification feed row */}
                    <div className="p-4 bg-slate-50 hover:bg-slate-100/50 rounded-xl border border-slate-100 flex gap-3.5 items-start transition-all">
                      <div className="w-9 h-9 rounded-full bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold text-xs ring-2 ring-amber-100/30 shrink-0">
                        PM
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-gray-800">
                          Pierre Meyer <span className="font-semibold text-gray-500">shared the project board</span> Website Launch Runthrough <span className="font-semibold text-gray-500">with you.</span>
                        </h3>
                        <p className="text-[10px] text-gray-400 mt-1 font-semibold uppercase">5min ago • Team marketing</p>
                        <div className="mt-2 text-xs bg-white text-gray-600 rounded-lg p-2.5 border border-slate-100 leading-relaxed font-medium">
                          "Hey everyone! Let's utilize the connected deliverables container to populate the Web Design milestones before Thursdays call! Thank you"
                        </div>
                      </div>
                    </div>

                    {/* 2. notification feed row */}
                    <div className="p-4 bg-slate-50 hover:bg-slate-100/50 rounded-xl border border-slate-100 flex gap-3.5 items-start transition-all">
                      <div className="w-9 h-9 rounded-full bg-indigo-500/10 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                        DG
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-gray-800">
                          Dhanesh Gopalan <span className="font-semibold text-gray-500">dispatched message inside thread</span> Team Marketing.
                        </h3>
                        <p className="text-[10px] text-gray-400 mt-1 font-semibold uppercase">2min ago • Chat stream</p>
                        <p className="mt-1 text-xs text-slate-500 italic">"Cool 👍"</p>
                      </div>
                    </div>

                    {/* 3. notification feed row */}
                    <div className="p-4 bg-slate-50 hover:bg-slate-100/50 rounded-xl border border-slate-100 flex gap-3.5 items-start transition-all">
                      <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                        QA
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-gray-800">
                          System notification: <span className="font-semibold text-gray-500">Dev server initialized on host port</span> 3000.
                        </h3>
                        <p className="text-[10px] text-gray-400 mt-1 font-semibold uppercase font-mono">Just now • System integration</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
          )}

          {/* ==================== PORTFOLIOS GRID VIEW ==================== */}
          {activeTab === 'portfolios' && (
            projects.length === 0
              ? <PortfoliosSkeleton />
              : (
                <div className="bg-white rounded-xl border border-gray-200/80 p-6 flex flex-col gap-6 w-full shadow-sm">
                  <div className="flex flex-col gap-1 border-b border-gray-100 pb-4 select-none">
                    <h2 className="text-lg font-bold text-[#1e1f21] flex items-center gap-1.5">
                      <Briefcase className="w-5 h-5 text-indigo-500 shrink-0" />
                      Portfolios & Project Roadmaps
                    </h2>
                    <p className="text-xs text-gray-400 font-medium">Live progress calculations calculated cleanly based on real-time task checkoffs.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {projects.map((proj) => {
                      const correlatedTasks = getTasksForProject(proj);
                      const total = correlatedTasks.length;
                      const done = correlatedTasks.filter(t => t.completed).length;
                      const percentage = total > 0 ? Math.round((done / total) * 100) : 0;

                      return (
                        <div
                          key={proj.id}
                          onClick={() => setSelectedProject(proj)}
                          className="p-5 bg-slate-50 hover:bg-slate-100/40 rounded-2xl border border-slate-200/40 hover:shadow-md transition-all cursor-pointer pointer-events-auto"
                        >
                          <div className="flex items-center gap-2.5 mb-4">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs ${proj.iconBg}`}>
                              ⚡
                            </div>
                            <div>
                              <h3 className="text-xs font-bold text-gray-800 truncate w-36">{proj.title}</h3>
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{proj.category}</span>
                            </div>
                          </div>

                          {/* Progress calculation parameters */}
                          <div className="space-y-2 select-none">
                            <div className="flex justify-between items-center text-[10px] font-bold text-gray-500">
                              <span>Progress score</span>
                              <span>{percentage}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-[10px] text-gray-400 font-semibold pt-1">
                              <span>{done} complete</span>
                              <span>{total - done} in queue</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )
          )}

          {/* ==================== HELP GUIDE VIEW ==================== */}
          {activeTab === 'help' && (
            <div className="bg-white rounded-xl border border-gray-200/80 p-6 flex flex-col gap-6 w-full shadow-sm max-w-2xl mx-auto">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4 select-none">
                <HelpCircle className="w-6 h-6 text-indigo-500 shrink-0" />
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Workspace Support Center</h2>
                  <p className="text-xs text-gray-400 font-medium">Frequently asked questions and guides about the Architax dashboard replica.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-200/40">
                  <h3 className="text-xs font-bold text-gray-800 mb-1">Is this dashboard interactive?</h3>
                  <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                    Yes, absolutely! You can toggle/complete tasks to decrease task counts, search terms inside the top filter, launch teams, create projects, edit brief descriptions inside the slide-over metadata drawer, and chat inside various channel threads.
                  </p>
                </div>

                <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-200/40">
                  <h3 className="text-xs font-bold text-gray-800 mb-1 font-sans">Does my work persist if I refresh the browser tab?</h3>
                  <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                    Yes! The data connects smoothly to standard client-side `localStorage`, meaning all tasks, comments, and project statuses will remain intact across page reloads.
                  </p>
                </div>

                <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-200/40">
                  <h3 className="text-xs font-bold text-gray-800 mb-1">How can I view team-specific chats?</h3>
                  <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                    Simply click on the team name selector dropdown inside the "Message Team" card. Switching teams will instantly change the visible conversation thread!
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ==================== 1. PROJECT WORKSPACE SLIDE-OVER DRAWER ==================== */}
      <ProjectDetailsDrawer />

      {/* ==================== 2. ADD TEAM POPUP DIALOG MODAL ==================== */}
      {showAddTeamModal && (
        <div id="add-team-backdrop" className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-5 border border-slate-100 flex flex-col gap-4 animate-scaleUp">

            <div className="flex items-center justify-between border-b border-gray-100 pb-3 select-none">
              <h3 className="text-md font-bold text-gray-800 flex items-center gap-1.5">
                <Users className="w-4.5 h-4.5 text-indigo-500" /> Assemble New Team
              </h3>
              <button onClick={() => setShowAddTeamModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full cursor-pointer">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleCreateTeam} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Team name</label>
                <input
                  type="text"
                  placeholder="e.g. Sleek engineers, brand force"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Select founding members</label>
                <div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto pr-1">
                  {members.map(m => {
                    const isSelected = selectedNewTeamMembers.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => toggleSelectNewTeamMember(m.id)}
                        className={`p-2 rounded-xl border text-xs text-left font-bold flex items-center gap-2 transition-all ${isSelected
                          ? 'bg-indigo-50/50 border-indigo-200 text-indigo-700'
                          : 'bg-white border-gray-200/70 text-gray-600 hover:shadow-xs'
                          }`}
                      >
                        <img src={m.avatarUrl} alt={m.name} className="w-5 h-5 rounded-full object-cover shrink-0" />
                        <span className="truncate">{m.name.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action row button */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddTeamModal(false)}
                  className="px-3 py-1.5 text-slate-500 hover:text-slate-700 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  Assemble team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== 3. PERSONAL ACCOUNT PROFILE CONTROL DRAWER ==================== */}
      {isPersonalProfileDrawerOpen && (
        <div id="profile-backdrop" className="fixed inset-0 bg-black/30 backdrop-blur-xs flex justify-end z-50 animate-fadeIn" onClick={() => setIsPersonalProfileDrawerOpen(false)}>
          <div className="w-80 h-full bg-white shadow-2xl p-6 border-l border-gray-100 flex flex-col gap-6 animate-slideInRight" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-gray-800">Personal Workspace Profile</h3>
              <button onClick={() => setIsPersonalProfileDrawerOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col items-center text-center gap-2.5 select-none pt-4">
              <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-indigo-50 shadow-inner relative">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                  alt="Avatar"
                  className="w-full h-full object-cover object-top"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-800">{session?.user?.name || 'Owner Developer Account'}</h4>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">{session?.user?.email || 'muftiharir3@gmail.com'}</p>
                <div className="mt-1.5 inline-block bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                  {(session?.user as any)?.role || 'DEVELOPER'}
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <div className="p-3 bg-violet-50/50 border border-violet-100 rounded-xl space-y-1">
                <div className="flex items-center gap-1 text-violet-700">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Replica overview</span>
                </div>
                <p className="text-[11px] text-violet-600 font-medium leading-relaxed">
                  Architax Home Team replica. Custom-crafted using React 19, tailwind CSS v4 and lucide icon sets. Optimized for high interactive speeds.
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5 select-none text-xs">
                <div className="flex justify-between font-semibold text-gray-600">
                  <span>Incomplete tasks:</span>
                  <span className="font-bold text-gray-800">{tasks.filter(t => !t.completed).length} items</span>
                </div>
                <div className="flex justify-between font-semibold text-gray-600">
                  <span>Registered projects:</span>
                  <span className="font-bold text-gray-800">{projects.length} files</span>
                </div>
                <div className="flex justify-between font-semibold text-gray-600">
                  <span>Chat messages:</span>
                  <span className="font-bold text-gray-800">{messages.length} lines</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                document.cookie = "architax_user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
                signOut({ callbackUrl: '/login' });
              }}
              className="mt-auto w-full text-center py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all cursor-pointer shadow-md hover:shadow-lg"
            >
              Sign out (keluar)
            </button>

            <button
              onClick={resetDatabase}
              className="w-full text-center py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100/30 text-red-600 font-bold text-xs transition-colors cursor-pointer"
            >
              Reset default database
            </button>
          </div>
        </div>
      )}

      {/* ==================== 4. ADD DIRECT PROJECT POPUP MODAL (Triggered via sidebar context) ==================== */}
      {showAddProjectModal && (
        <div id="add-project-backdrop" className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn" onClick={() => setShowAddProjectModal(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl p-5 border border-slate-100 flex flex-col gap-4 animate-scaleUp" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-md font-bold text-gray-800 flex items-center gap-1.5">
                <Briefcase className="w-4.5 h-4.5 text-[#f06e5b]" /> Design Board Project
              </h3>
              <button onClick={() => setShowAddProjectModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full cursor-pointer">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <RecentTasksCard />
          </div>
        </div>
      )}

    </div>
  );
}

export default function DashboardPageClient({ initialRole, initialTab }: { initialRole: string | null; initialTab: string }) {
  return (
    <React.Suspense fallback={null}>
      <DashboardProvider initialTab={initialTab}>
        <DashboardContent initialRole={initialRole} />
      </DashboardProvider>
    </React.Suspense>
  );
}
