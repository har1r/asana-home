export interface TeamMember {
  id: string;
  name: string;
  avatarUrl: string;
  role: string;
  email: string;
}

export type CategoryType = 'Web Design' | 'Marketing' | 'Engineering' | 'Onboarding' | 'Design' | string;

export interface Task {
  id: string;
  title?: string;
  nopel?: string;
  nama_pemohon?: string;
  dueDate: string;
  category: CategoryType;
  categoryColor: string; // Tailwind bg color class
  assignees: string[]; // Member IDs
  completed: boolean;
  projectId?: string;
}

export interface Project {
  id: string;
  title: string;
  updatedDate: string;
  dueDate?: string;
  category: CategoryType;
  categoryColor: string;
  icon: string; // Lucide icon name
  iconBg: string; // Tailwind background class
  description: string;
  members: string[]; // Member IDs
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold';
}

export interface Team {
  id: string;
  name: string;
  members: string[]; // Member IDs
}

export interface FavoriteTile {
  id: string;
  title: string;
  category: string;
  icon: string; // Lucide icon name
  bgGradient: string; // Tailwind gradient or class
  textColor: string;
  isLocked?: boolean;
}

export interface TeamMessage {
  id: string;
  teamId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  message: string;
  timestamp: string; // e.g. "5min ago", "Just now"
}
