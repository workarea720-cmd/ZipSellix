import { prisma } from '@/lib/prisma';

// Free plan ki daily limits
const FREE_LIMITS = {
    seoGensToday: 3,           // Din mein 3 SEO generate
    reportsDownloadedToday: 2, // Din mein 2 report download
};

export async function checkAndIncrementUsage(
    userId: string,
    feature: 'seoGensToday' | 'reportsDownloadedToday'
) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { allowed: false, reason: 'User nahi mila' };

    // PRO user — koi limit nahi
    if (user.planType === 'PRO' && user.subscriptionStatus === 'ACTIVE') {
        return { allowed: true };
    }

    // Din badal gaya? Reset karo
    const lastReset = new Date(user.lastUsageReset);
    const now = new Date();
    const dayChanged = lastReset.toDateString() !== now.toDateString();

    if (dayChanged) {
        await prisma.user.update({
            where: { id: userId },
            data: {
                seoGensToday: 0,
                reportsDownloadedToday: 0,
                lastUsageReset: now,
            },
        });
        user.seoGensToday = 0;
        user.reportsDownloadedToday = 0;
    }

    // Limit check
    const currentUsage = user[feature];
    const limit = FREE_LIMITS[feature];

    if (currentUsage >= limit) {
        return {
            allowed: false,
            reason: `Free plan mein din mein sirf ${limit} baar allowed hai. PRO lo!`,
        };
    }

    // Usage increment karo
    await prisma.user.update({
        where: { id: userId },
        data: { [feature]: { increment: 1 } },
    });

    return { allowed: true, remaining: limit - currentUsage - 1 };
}