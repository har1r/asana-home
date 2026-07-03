"use server";

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * Ambil semua notifikasi yang belum dibaca untuk user yang sedang login.
 */
export async function getUnreadNotifications() {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, notifications: [] };

  try {
    const notifications = await prisma.inAppNotification.findMany({
      where: {
        userId: (session.user as any).id,
        isRead: false,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return { success: true, notifications };
  } catch (error) {
    console.error('[NOTIF-GET-ERR]', error);
    return { success: false, notifications: [] };
  }
}

/**
 * Tandai notifikasi sebagai sudah dibaca.
 */
export async function markNotificationAsRead(notificationId: string) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false };

  try {
    await prisma.inAppNotification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
    return { success: true };
  } catch (error) {
    console.error('[NOTIF-MARK-READ-ERR]', error);
    return { success: false };
  }
}

/**
 * Tandai semua notifikasi user sebagai sudah dibaca.
 */
export async function markAllNotificationsAsRead() {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false };

  try {
    await prisma.inAppNotification.updateMany({
      where: {
        userId: (session.user as any).id,
        isRead: false,
      },
      data: { isRead: true },
    });
    return { success: true };
  } catch (error) {
    console.error('[NOTIF-MARK-ALL-READ-ERR]', error);
    return { success: false };
  }
}
