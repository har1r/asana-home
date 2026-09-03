"use server";

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * Ambil semua notifikasi yang belum dibaca untuk user yang sedang login.
 */
export async function getUnreadNotifications() {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, notifications: [] };
  return { success: true, notifications: [] };
}

/**
 * Tandai notifikasi sebagai sudah dibaca.
 */
export async function markNotificationAsRead(notificationId: string) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false };
  return { success: true };
}

/**
 * Tandai semua notifikasi user sebagai sudah dibaca.
 */
export async function markAllNotificationsAsRead() {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false };
  return { success: true };
}
