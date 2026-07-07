"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import { isValidTab } from '@/lib/constants';
import { useSyncToLocalStorage } from '@/lib/useLocalStorage';
import { Task, Project, Team, TeamMessage, TeamMember, FavoriteTile } from '@/types';
import {
  INITIAL_MEMBERS,
  INITIAL_TASKS,
  INITIAL_PROJECTS,
  INITIAL_FAVORITES,
  INITIAL_TEAMS,
  INITIAL_MESSAGES
} from '@/data/mockData';

interface DashboardContextType {
  members: TeamMember[];
  tasks: Task[];
  projects: Project[];
  favorites: FavoriteTile[];
  teams: Team[];
  messages: TeamMessage[];

  activeTab: string;
  setActiveTab: (tab: string) => void;
  isInitialized: boolean;
  selectedTeamId: string;
  setSelectedTeamId: (teamId: string) => void;
  selectedProject: Project | null;
  setSelectedProject: (proj: Project | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  isPersonalProfileDrawerOpen: boolean;
  setIsPersonalProfileDrawerOpen: (open: boolean) => void;

  // Modals
  showAddTeamModal: boolean;
  setShowAddTeamModal: (show: boolean) => void;
  showAddProjectModal: boolean;
  setShowAddProjectModal: (show: boolean) => void;

  // Operations
  handleAddTask: (newTaskParams: Omit<Task, 'id'>) => void;
  handleToggleTask: (taskId: string) => void;
  handleDeleteTask: (taskId: string) => void;
  handleAddProject: (newProjectParams: Omit<Project, 'id'>) => void;
  handleUpdateProject: (projectId: string, updatedParams: Partial<Project>) => void;
  handleAddTaskToProject: (taskTitle: string, projectId: string) => void;
  handleSelectProjectByTitle: (title: string) => void;
  handleSendMessage: (teamId: string, messageText: string) => void;
  handleCreateTeam: (name: string, membersList: string[]) => void;
  getTasksForProject: (proj: Project | null) => Task[];
  favoriteProjectsList: Project[];
  resetDatabase: () => void;
  showConfirm: (params: {
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
  }) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children, initialTab }: { children: React.ReactNode; initialTab?: string }) {
  const [members] = useState<TeamMember[]>(INITIAL_MEMBERS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [favorites, setFavorites] = useState<FavoriteTile[]>(INITIAL_FAVORITES);
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [messages, setMessages] = useState<TeamMessage[]>(INITIAL_MESSAGES);

  // UI state
  const router = useRouter();
  const searchParams = useSearchParams();

  // activeTab: sinkron dengan URL ?tab=xxx
  const [activeTab, setActiveTabState] = useState<string>(initialTab || 'beranda');
  const [isInitialized, setIsInitialized] = useState(false);

  // Setter yang juga mengupdate URL
  const setActiveTab = useCallback((tab: string) => {
    setActiveTabState(tab);
    const params = new URLSearchParams(window.location.search);
    params.set('tab', tab);
    router.push(`?${params.toString()}`, { scroll: false });
  }, [router]);
  const [selectedTeamId, setSelectedTeamId] = useState('team-marketing');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPersonalProfileDrawerOpen, setIsPersonalProfileDrawerOpen] = useState(false);

  // Modals state
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);

  // Universal Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const showConfirm = useCallback(({
    title,
    message,
    onConfirm,
    confirmText = 'Ya, Lanjutkan',
    cancelText = 'Batal'
  }: {
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
  }) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText,
      onConfirm: () => {
        onConfirm();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  }, []);

  // Hydration sync
  const isMounted = useRef(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const localTasks = localStorage.getItem('architax_tasks');
      if (localTasks) {
        try {
          const parsed = JSON.parse(localTasks);
          if (Array.isArray(parsed) && parsed.every(t => t && t.title)) {
            setTasks(parsed);
          }
        } catch (e) { }
      }

      const localProjects = localStorage.getItem('architax_projects');
      if (localProjects) {
        try {
          const parsed = JSON.parse(localProjects);
          if (Array.isArray(parsed) && parsed.every(p => p && p.title)) {
            setProjects(parsed);
          }
        } catch (e) { }
      }

      const localFavorites = localStorage.getItem('architax_favorites');
      if (localFavorites) {
        try {
          const parsed = JSON.parse(localFavorites);
          if (Array.isArray(parsed) && parsed.every(f => f && f.title)) {
            setFavorites(parsed);
          } else {
            // Discard invalid local storage and save defaults
            setFavorites(INITIAL_FAVORITES);
            localStorage.setItem('architax_favorites', JSON.stringify(INITIAL_FAVORITES));
          }
        } catch (e) {
          setFavorites(INITIAL_FAVORITES);
          localStorage.setItem('architax_favorites', JSON.stringify(INITIAL_FAVORITES));
        }
      }

      const localTeams = localStorage.getItem('architax_teams');
      if (localTeams) {
        try {
          const parsed = JSON.parse(localTeams);
          if (Array.isArray(parsed) && parsed.every(t => t && t.name)) {
            setTeams(parsed);
          }
        } catch (e) { }
      }

      const localMessages = localStorage.getItem('architax_messages');
      if (localMessages) {
        try {
          const parsed = JSON.parse(localMessages);
          if (Array.isArray(parsed) && parsed.every(m => m && m.message)) {
            setMessages(parsed);
          }
        } catch (e) { }
      }

      // Prioritas: URL param → localStorage → default 'beranda'
      const urlTab = new URLSearchParams(window.location.search).get('tab');
      const localActiveTab = localStorage.getItem('architax_active_tab');
      
      let resolvedTab = 'beranda';
      if (isValidTab(urlTab)) {
        resolvedTab = urlTab;
      } else if (isValidTab(localActiveTab)) {
        resolvedTab = localActiveTab;
      }
      
      setActiveTabState(resolvedTab);
      // Pastikan URL selalu mencerminkan tab aktif
      if (!urlTab || !isValidTab(urlTab)) {
        const params = new URLSearchParams(window.location.search);
        params.set('tab', resolvedTab);
        router.replace(`?${params.toString()}`, { scroll: false });
      }

      isMounted.current = true;
      setIsInitialized(true);
    }
  }, []);

  // Sync state saat URL berubah dari luar (tombol back/forward browser)
  useEffect(() => {
    if (!isMounted.current) return;
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && isValidTab(tabFromUrl) && tabFromUrl !== activeTab) {
      setActiveTabState(tabFromUrl);
    }
  }, [searchParams]);

  // Sync all persisted state to localStorage after initial hydration.
  // The custom hook skips the write until `isMounted.current` is true,
  // preventing accidental overwrites of data just loaded from storage.
  useSyncToLocalStorage('architax_active_tab', activeTab, isMounted.current);
  useSyncToLocalStorage('architax_tasks', tasks, isMounted.current);
  useSyncToLocalStorage('architax_projects', projects, isMounted.current);
  useSyncToLocalStorage('architax_favorites', favorites, isMounted.current);
  useSyncToLocalStorage('architax_teams', teams, isMounted.current);
  useSyncToLocalStorage('architax_messages', messages, isMounted.current);

  // Actions
  const handleAddTask = useCallback((newTaskParams: Omit<Task, 'id'>) => {
    const task: Task = {
      ...newTaskParams,
      id: `task-${Date.now()}`
    };
    setTasks(prev => [task, ...prev]);
  }, []);

  const handleToggleTask = useCallback((taskId: string) => {
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    ));
  }, []);

  const handleDeleteTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  }, []);

  const handleAddProject = useCallback((newProjectParams: Omit<Project, 'id'>) => {
    const proj: Project = {
      ...newProjectParams,
      id: `project-${Date.now()}`
    };
    setProjects(prev => [proj, ...prev]);
  }, []);

  const handleUpdateProject = useCallback((projectId: string, updatedParams: Partial<Project>) => {
    setProjects(prev => prev.map(p =>
      p.id === projectId ? { ...p, ...updatedParams } : p
    ));
    if (selectedProject?.id === projectId) {
      setSelectedProject(prev => prev ? { ...prev, ...updatedParams } : null);
    }
  }, [selectedProject]);

  const handleAddTaskToProject = useCallback((taskTitle: string, projectId: string) => {
    const proj = projects.find(p => p.id === projectId);
    if (!proj) return;

    let categoryColorClass = 'bg-amber-100 text-amber-900 border-amber-200/50';
    if (proj.category === 'Marketing') categoryColorClass = 'bg-emerald-100 text-emerald-900 border-emerald-200/50';
    if (proj.category === 'Engineering') categoryColorClass = 'bg-rose-100 text-rose-900 border-rose-200/50';
    if (proj.category === 'Onboarding') categoryColorClass = 'bg-[#e8eaf6] text-[#1a237e] border-[#c0cbdc]';

    const task: Task = {
      id: `task-${Date.now()}`,
      title: taskTitle,
      dueDate: 'Today',
      category: proj.category,
      categoryColor: categoryColorClass,
      assignees: proj.members.slice(0, 2),
      completed: false,
      projectId: projectId
    };

    setTasks(prev => [task, ...prev]);
  }, [projects]);

  const handleSelectProjectByTitle = useCallback((title: string) => {
    if (!title) return;
    const proj = projects.find(p =>
      p.title &&
      (p.title.toLowerCase().includes(title.toLowerCase()) ||
        title.toLowerCase().includes(p.title.toLowerCase()))
    );
    if (proj) {
      setSelectedProject(proj);
    } else {
      showConfirm({
        title: 'Informasi Tag Favorit',
        message: `Selected favorite "${title}" details. You can view tasks linked to this tag in the tasks list.`,
        onConfirm: () => {},
        confirmText: 'Mengerti',
        cancelText: 'Tutup'
      });
    }
  }, [projects, showConfirm]);

  const handleSendMessage = useCallback((teamId: string, messageText: string) => {
    const newMsg: TeamMessage = {
      id: `msg-${Date.now()}`,
      teamId,
      senderId: 'member-me',
      senderName: 'Me',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      message: messageText,
      timestamp: 'Just now'
    };
    setMessages(prev => [...prev, newMsg]);
  }, []);

  const handleCreateTeam = useCallback((name: string, membersList: string[]) => {
    if (!name.trim()) return;

    const team: Team = {
      id: `team-${Date.now()}`,
      name: name.trim(),
      members: membersList
    };

    setTeams(prev => [...prev, team]);
    setSelectedTeamId(team.id);
    setShowAddTeamModal(false);
  }, []);

  const getTasksForProject = useCallback((proj: Project | null) => {
    if (!proj) return [];
    return tasks.filter(t => t.projectId === proj.id || (t.category === proj.category && !t.projectId));
  }, [tasks]);

  const favoriteProjectsList = useMemo(() => projects.filter(p => p.id === 'project-1' || p.id === 'project-2'), [projects]);

  const resetDatabase = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      window.location.reload();
    }
  }, []);

  const contextValue = useMemo(() => ({
    members,
    tasks,
    projects,
    favorites,
    teams,
    messages,

    activeTab,
    setActiveTab,
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
    getTasksForProject,
    favoriteProjectsList,
    resetDatabase,
    showConfirm,
    isInitialized
  }), [
    members,
    tasks,
    projects,
    favorites,
    teams,
    messages,
    activeTab,
    setActiveTab,
    selectedTeamId,
    selectedProject,
    searchQuery,
    isMobileMenuOpen,
    isPersonalProfileDrawerOpen,
    showAddTeamModal,
    showAddProjectModal,
    handleAddTask,
    handleToggleTask,
    handleDeleteTask,
    handleAddProject,
    handleUpdateProject,
    handleAddTaskToProject,
    handleSelectProjectByTitle,
    handleSendMessage,
    handleCreateTeam,
    getTasksForProject,
    favoriteProjectsList,
    resetDatabase,
    showConfirm,
    isInitialized
  ]);

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}

      {/* GLOBAL UNIVERSAL CONFIRMATION MODAL */}
      {confirmModal.isOpen && (
        <div id="universal-confirm-backdrop" className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl p-6 border border-slate-100 flex flex-col gap-4 animate-scaleUp">
            <div className="flex items-start gap-3 select-none">
              <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-gray-900 leading-tight">{confirmModal.title}</h3>
                <p className="text-xs text-gray-500 font-semibold mt-1.5 leading-relaxed">{confirmModal.message}</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 select-none">
              <button
                type="button"
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="px-3.5 py-2 text-slate-500 hover:text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                {confirmModal.cancelText}
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
              >
                {confirmModal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
