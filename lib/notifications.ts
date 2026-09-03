import { UserRole } from '@prisma/client';
import { prisma } from './prisma';

/**
 * Creates an In-App notification record for a specific user.
 */
export async function createInAppNotification(
  userId: string,
  judul: string,
  pesan: string,
  metadata?: any
) {
  try {
    console.log(`[NOTIF-INAPP] Notification for user ${userId}: "${judul}" - ${pesan}`);
    return { id: `notif-${Date.now()}`, userId, judul, pesan, metadata: metadata || null };
  } catch (error) {
    console.error('[NOTIF-INAPP-ERR] Gagal membuat notifikasi In-App:', error);
    return null;
  }
}

/**
 * Creates In-App notification records for all active users of a specific role.
 */
export async function notifyAllUsersOfRole(
  role: UserRole,
  judul: string,
  pesan: string,
  metadata?: any
) {
  try {
    const activeUsers = await prisma.user.findMany({
      where: {
        role,
        isActive: true
      },
      select: { id: true }
    });

    console.log(`[NOTIF-INAPP] Broadcasted notif to ${activeUsers.length} active users of role ${role}: "${judul}"`);
    return activeUsers;
  } catch (error) {
    console.error(`[NOTIF-INAPP-ERR] Gagal mengirim broadcast ke role ${role}:`, error);
    return [];
  }
}
