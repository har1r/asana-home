import { prisma } from './prisma';

// Definisi tipe lokal untuk menghindari ketergantungan pada `prisma generate`
// Harus selalu sinkron dengan enum UserRole di prisma/schema.prisma
type UserRole = 'PENGINPUT' | 'PENELITI' | 'PENGARSIP' | 'PENGIRIM' | 'PEMANTAU' | 'SUPERVISOR';

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
    const notification = await prisma.inAppNotification.create({
      data: {
        userId,
        judul,
        pesan,
        metadata: metadata || null,
      },
    });
    console.log(`[NOTIF-INAPP] Created notification for user ${userId}: "${judul}"`);
    return notification;
  } catch (error) {
    console.error('[NOTIF-INAPP-ERR] Gagal membuat notifikasi In-App:', error);
    return null;
  }
}

/**
 * Creates In-App notification records for all active users of a specific role.
 *
 * Uses createMany() for a single bulk INSERT instead of N individual
 * create() calls, reducing database round-trips from O(N) to O(1).
 *
 * Note: createMany does not return the created records — this is intentional
 * as callers only need to know the operation succeeded.
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

    if (activeUsers.length === 0) return [];

    // Single bulk INSERT — one round-trip regardless of user count
    await prisma.inAppNotification.createMany({
      data: activeUsers.map((u) => ({
        userId: u.id,
        judul,
        pesan,
        metadata: metadata || null,
      })),
    });

    console.log(`[NOTIF-INAPP] Broadcasted notif to ${activeUsers.length} active users of role ${role}`);
    return activeUsers; // return IDs for audit purposes if needed
  } catch (error) {
    console.error(`[NOTIF-INAPP-ERR] Gagal mengirim broadcast ke role ${role}:`, error);
    return [];
  }
}
