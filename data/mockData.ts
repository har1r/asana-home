import { TeamMember, Task, Project, Team, FavoriteTile, TeamMessage } from '@/types';

export const INITIAL_MEMBERS: TeamMember[] = [
  {
    id: 'member-1',
    name: 'Pierre Meyer',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    role: 'Product Manager',
    email: 'pierre.meyer@architax-demo.com'
  },
  {
    id: 'member-2',
    name: 'Dhanesh Gopalan',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'Lead Developer',
    email: 'dhanesh@architax-demo.com'
  },
  {
    id: 'member-3',
    name: 'Kylian Mbappé',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    role: 'Brand Specialist',
    email: 'kylian@architax-demo.com'
  },
  {
    id: 'member-4',
    name: 'Jani Lindqvist',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    role: 'Head of Marketing',
    email: 'jani.l@architax-demo.com'
  },
  {
    id: 'member-5',
    name: 'Sarah Jenkins',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    role: 'QA Engineer',
    email: 'sarah.j@architax-demo.com'
  },
  {
    id: 'member-6',
    name: 'Alex Rivera',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    role: 'Frontend Architect',
    email: 'alex.r@architax-demo.com'
  },
  {
    id: 'member-7',
    name: 'Emily Zhao',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    role: 'UI/UX Designer',
    email: 'emily.zhao@architax-demo.com'
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Deployment Of Zillow O...',
    dueDate: 'Thu 29 Jan',
    category: 'Web Design',
    categoryColor: 'bg-amber-100 text-amber-900 border-amber-200/50',
    assignees: ['member-1', 'member-2', 'member-7'],
    completed: false
  },
  {
    id: 'task-2',
    title: 'Discovery Call With Jani...',
    dueDate: 'Thu 29 Jan',
    category: 'Marketing',
    categoryColor: 'bg-emerald-100 text-emerald-900 border-emerald-200/50',
    assignees: ['member-4'],
    completed: false
  },
  {
    id: 'task-3',
    title: 'Webflow Team Setup',
    dueDate: 'Thu 29 Jan',
    category: 'Engineering',
    categoryColor: 'bg-pink-100 text-pink-900 border-pink-200/50',
    assignees: ['member-6', 'member-2', 'member-5', 'member-1'],
    completed: false
  },
  {
    id: 'task-4',
    nopel: 'HDJA847483',
    nama_pemohon: 'Mufti Harir',
    dueDate: 'Thu 29 Jan',
    category: 'Mutasi Sebagian',
    categoryColor: 'bg-indigo-100 text-indigo-950 border-indigo-200/50',
    assignees: ['member-3', 'member-4'],
    completed: false
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'project-1',
    title: 'Website Launch Runthrough',
    updatedDate: 'Today',
    category: 'Web Design',
    categoryColor: 'text-amber-600 bg-amber-50 border-amber-100',
    icon: 'LayoutGrid',
    iconBg: 'bg-amber-500',
    description: 'A comprehensive step-by-step master plan for deploying and validating our new web platform layout.',
    members: ['member-1', 'member-2', 'member-5'],
    status: 'in-progress'
  },
  {
    id: 'project-2',
    title: 'Elevation Worship Social Media Conte...',
    updatedDate: 'Yesterday',
    category: 'Marketing',
    categoryColor: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    icon: 'Tv2',
    iconBg: 'bg-emerald-500',
    description: 'Planning campaign schedules, copywriting, social assets, and video snippets for digital distribution channels.',
    members: ['member-4', 'member-1', 'member-3', 'member-7', 'member-2'],
    status: 'planning'
  },
  {
    id: 'project-3',
    title: 'F1 Youtube Channel: 3x Subs',
    updatedDate: 'Jan 15',
    category: 'Marketing',
    categoryColor: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    icon: 'Youtube',
    iconBg: 'bg-teal-500',
    description: 'Optimizing thumbnail strategies, scripts, dynamic editing hooks, and sponsorship partnerships to scale sub metrics.',
    members: ['member-6', 'member-7'],
    status: 'in-progress'
  },
  {
    id: 'project-4',
    title: 'React Python Mashup Hackathon',
    updatedDate: 'Jan 12',
    category: 'Engineering',
    categoryColor: 'text-rose-600 bg-rose-50 border-rose-100',
    icon: 'Terminal',
    iconBg: 'bg-pink-500',
    description: 'Internal hackathon challenging developers to design real-time AI agents blending snappy React fronts with Python core engines.',
    members: ['member-2', 'member-6', 'member-5'],
    status: 'completed'
  }
];

export const INITIAL_FAVORITES: FavoriteTile[] = [
  {
    id: 'fav-1',
    title: '10x SEO Offer',
    category: 'Marketing',
    icon: 'PieChart',
    bgGradient: 'bg-emerald-400 text-white',
    textColor: 'text-emerald-500'
  },
  {
    id: 'fav-2',
    title: 'Easy Templates',
    category: 'Onboarding',
    icon: 'UserRound',
    bgGradient: 'bg-[#615dfa] text-white',
    textColor: 'text-indigo-600'
  },
  {
    id: 'fav-3',
    title: 'Design System',
    category: 'Web Design',
    icon: 'Boxes',
    bgGradient: 'bg-amber-500 text-white',
    textColor: 'text-amber-500',
    isLocked: true
  },
  {
    id: 'fav-4',
    title: 'Mighty Hacks',
    category: 'Engineering',
    icon: 'Terminal',
    bgGradient: 'bg-pink-500 text-white',
    textColor: 'text-pink-500'
  }
];

export const INITIAL_TEAMS: Team[] = [
  {
    id: 'team-marketing',
    name: 'Marketing',
    members: ['member-1', 'member-2', 'member-3', 'member-4']
  },
  {
    id: 'team-sleek-engineers',
    name: 'Sleek Engineers',
    members: ['member-1', 'member-2', 'member-5', 'member-6']
  },
  {
    id: 'team-design-superstars',
    name: 'Design Superstars',
    members: ['member-1', 'member-6', 'member-7', 'member-3']
  }
];

export const INITIAL_MESSAGES: TeamMessage[] = [
  // Marketing messages
  {
    id: 'msg-1',
    teamId: 'team-marketing',
    senderId: 'member-1',
    senderName: 'Pierre Meyer',
    senderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    message: 'hey guys! we are kicking off with a discovery meeting with Kylian Mba...',
    timestamp: '5min ago'
  },
  {
    id: 'msg-2',
    teamId: 'team-marketing',
    senderId: 'member-2',
    senderName: 'Dhanesh Gopalan',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    message: 'Cool 👍',
    timestamp: '2min ago'
  },
  
  // Sleek Engineers messages
  {
    id: 'msg-3',
    teamId: 'team-sleek-engineers',
    senderId: 'member-6',
    senderName: 'Alex Rivera',
    senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    message: 'Just deployed the latest Vite build to Cloud Run! The response times look blistering fast ⚡',
    timestamp: '15min ago'
  },
  {
    id: 'msg-4',
    teamId: 'team-sleek-engineers',
    senderId: 'member-5',
    senderName: 'Sarah Jenkins',
    senderAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    message: 'All QA checks passed! Merging the tailwind-v4 branch now.',
    timestamp: '10min ago'
  },

  // Design Superstars messages
  {
    id: 'msg-5',
    teamId: 'team-design-superstars',
    senderId: 'member-7',
    senderName: 'Emily Zhao',
    senderAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    message: 'Uploaded the new layout Mockups into Figma! Check out the favorites grid styling, it feels extremely clean and responsive.',
    timestamp: '1h ago'
  },
  {
    id: 'msg-6',
    teamId: 'team-design-superstars',
    senderId: 'member-1',
    senderName: 'Pierre Meyer',
    senderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    message: 'These colors are gorgeous! Matches the sidebar gradient perfectly.',
    timestamp: '45min ago'
  }
];
