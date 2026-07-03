import { cookies } from 'next/headers';
import DashboardPageClient from '@/components/DashboardPageClient';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const initialTab = typeof resolvedSearchParams.tab === 'string' ? resolvedSearchParams.tab : 'beranda';

  const cookieStore = await cookies();
  const initialRole = cookieStore.get('architax_user_role')?.value || null;

  return <DashboardPageClient initialRole={initialRole} initialTab={initialTab} />;
}
