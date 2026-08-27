import { cookies } from 'next/headers';
import DashboardAppShell from '@/components/layout/DashboardAppShell';
import { isValidTab, isValidRole, ROLE_COOKIE_NAME } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const rawTab = resolvedSearchParams.tab;
  const tabQuery = Array.isArray(rawTab) ? rawTab[0] : rawTab;
  const initialTab = isValidTab(tabQuery) ? tabQuery : 'beranda';

  const cookieStore = await cookies();
  const roleCookie = cookieStore.get(ROLE_COOKIE_NAME)?.value;
  const initialRole = isValidRole(roleCookie) ? roleCookie : null;

  return <DashboardAppShell initialRole={initialRole} initialTab={initialTab} />;
}
