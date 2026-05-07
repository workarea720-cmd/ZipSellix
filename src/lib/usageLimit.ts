import { prisma } from '@/lib/prisma';

export type LimitableFeature =
    | 'seoGensToday'
    | 'reportsDownloadedToday'
    | 'compressionsToday'
    | 'calculationsToday'
    | 'bgRemovalsToday';

const FREE_DAILY_LIMITS: Record<LimitableFeature, number> = {
    seoGensToday: 3,
    reportsDownloadedToday: 3,
    compressionsToday: 5,
    calculationsToday: 50,
    bgRemovalsToday: 3,
};

export async function checkAndIncrement(
    userId: string,
    feature: LimitableFeature
): Promise<{ allowed: boolean; remaining: number; reason?: string }> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { allowed: false, remaining: 0, reason: 'User nahi mila' };

    // PRO user — koi limit nahi
    const isPro =
        user.planType?.toUpperCase() === 'PRO' &&
        user.subscriptionStatus === 'ACTIVE';
    if (isPro) return { allowed: true, remaining: 999 };

    // Din badal gaya? Reset karo
    const now = new Date();
    const lastReset = new Date(user.lastUsageReset);
    const dayChanged =
        now.getDate() !== lastReset.getDate() ||
        now.getMonth() !== lastReset.getMonth() ||
        now.getFullYear() !== lastReset.getFullYear();

    if (dayChanged) {
        await prisma.user.update({
            where: { id: userId },
            data: {
                seoGensToday: 0,
                reportsDownloadedToday: 0,
                compressionsToday: 0,
                calculationsToday: 0,
                bgRemovalsToday: 0,
                lastUsageReset: now,
            },
        });
        // Reset ke baad fresh user fetch
        (user as any)[feature] = 0;
    }

    const current = (user as any)[feature] as number;
    const limit = FREE_DAILY_LIMITS[feature];

    if (current >= limit) {
        return {
            allowed: false,
            remaining: 0,
            reason: `Free plan mein din mein sirf ${limit} baar allowed hai. Pro lo unlimited ke liye!`,
        };
    }

    await prisma.user.update({
        where: { id: userId },
        data: { [feature]: { increment: 1 } },
    });

    return { allowed: true, remaining: limit - current - 1 };
}