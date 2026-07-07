import { cookies } from 'next/headers';
import DashboardPageClient from '@/components/DashboardPageClient';
import { isValidTab, isValidRole, ROLE_COOKIE_NAME } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const tabQuery = resolvedSearchParams.tab;
  const initialTab = isValidTab(tabQuery) ? tabQuery : 'beranda';

  const cookieStore = await cookies();
  const roleCookie = cookieStore.get(ROLE_COOKIE_NAME)?.value;
  const initialRole = isValidRole(roleCookie) ? roleCookie : null;

  return <DashboardPageClient initialRole={initialRole} initialTab={initialTab} />;
}

