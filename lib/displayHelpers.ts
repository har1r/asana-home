/**
 * lib/displayHelpers.ts
 *
 * Pure, side-effect-free display formatting utilities shared across
 * RecentTasksCard, TasksRevisionCard, and any future card components.
 *
 * All functions are module-level (not defined inside components) so they
 * are never re-created on re-render and can be tree-shaken cleanly.
 */

/** Convert SNAKE_CASE or snake_case strings to Title Case for display. */
export const toTitleCase = (str: string): string =>
  str
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

/** Return two-letter initials from a full name. */
export const getInitials = (name: string): string => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : parts[0][0].toUpperCase();
};

const AVATAR_COLORS = [
  'bg-[#ffb000]',
  'bg-[#2adca2]',
  'bg-[#ff5ea6]',
  'bg-[#4e5bf2]',
  'bg-[#8b5cf6]',
  'bg-[#64748b]',
] as const;

/**
 * Return a deterministic Tailwind background-color class for an avatar
 * based on the hash of the user's name. Same name → same color every time.
 */
export const getAvatarBg = (name: string): string => {
  const hash = name
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;

/** Format a date as "Mon 6 Jul" style short-date string. */
export const formatDate = (dateString: string | Date): string => {
  const date = new Date(dateString);
  return `${DAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}`;
};
