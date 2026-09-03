import { UserRole } from '@prisma/client';

export const ROLE_COOKIE_NAME = 'architax_user_role';

export const VALID_TABS = [
  'beranda',
  'my-tasks',
  'inbox',
  'tracking',
  'help',
  'data-entry',
  'researcher',
  'archivist',
  'sender',
  'monitor',
  'supervisor',
  'portfolios',
  'penginput',
  'peneliti',
  'pengarsip',
  'pengirim',
  'pemantau'
] as const;
export type TabType = typeof VALID_TABS[number];

export const VALID_ROLES = [
  'DATA_ENTRY',
  'RESEARCHER',
  'ARCHIVIST',
  'SENDER',
  'MONITOR',
  'SUPERVISOR'
] as const;
export type UserRoleType = UserRole;

export function isValidTab(tab: any): boolean {
  return typeof tab === 'string' && (VALID_TABS as readonly string[]).includes(tab);
}

export function isValidRole(role: any): role is UserRoleType {
  return typeof role === 'string' && (VALID_ROLES as readonly string[]).includes(role);
}
