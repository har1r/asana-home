export const ROLE_COOKIE_NAME = 'architax_user_role';

export const VALID_TABS = ['beranda', 'my-tasks', 'inbox', 'portfolios', 'help'] as const;
export type TabType = typeof VALID_TABS[number];

export const VALID_ROLES = [
  'PENGINPUT',
  'PENELITI',
  'PENGARSIP',
  'PENGIRIM',
  'PEMANTAU',
  'SUPERVISOR'
] as const;
export type UserRoleType = typeof VALID_ROLES[number];

export function isValidTab(tab: any): tab is TabType {
  return typeof tab === 'string' && VALID_TABS.includes(tab as TabType);
}

export function isValidRole(role: any): role is UserRoleType {
  return typeof role === 'string' && VALID_ROLES.includes(role as UserRoleType);
}
