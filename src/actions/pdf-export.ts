'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// ─── Constants ───────────────────────────────────────────────
const FREE_WEEKLY_PDF_LIMIT = 3; // FREE users get 3 PDF exports per rolling 7-day window

export type PdfLimitResult =
    | { allowed: true; remaining: number; isPro: boolean }
    | { allowed: false; reason: 'UPGRADE_REQUIRED' | 'UNAUTHENTICATED'; remaining: 0; isPro: false };

/**
 * Checks whether the current user is allowed to download a PDF report.
 * - PRO users: always allowed.
 * - FREE users: capped at FREE_WEEKLY_PDF_LIMIT per rolling 7-day window.
 *
 * On success (`allowed: true`) it also increments the download counter and
 * records the timestamp — so one call both gates AND records the export.
 */
export async function checkAndRecordPdfExport(): Promise<PdfLimitResult> {
    const session = await auth();
    if (!session?.user?.id) {
        return { allowed: false, reason: 'UNAUTHENTICATED', remaining: 0, isPro: false };
    }

    const userId = session.user.id;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            planType: true,
            reportsDownloadedToday: true,
            lastPdfDownload: true,
            totalPdfsDownloaded: true,
        },
    });

    if (!user) {
        return { allowed: false, reason: 'UNAUTHENTICATED', remaining: 0, isPro: false };
    }

    const isPro = user.planType?.toUpperCase() === 'PRO';

    // PRO users — always allow, just record
    if (isPro) {
        await prisma.user.update({
            where: { id: userId },
            data: {
                lastPdfDownload: new Date(),
                totalPdfsDownloaded: { increment: 1 },
            },
        });
        return { allowed: true, remaining: Infinity as unknown as number, isPro: true };
    }

    // FREE users — rolling 7-day window check
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const lastDownload = user.lastPdfDownload;

    // Reset window counter if last download was > 7 days ago
    const windowCount =
        lastDownload && lastDownload > sevenDaysAgo
            ? user.reportsDownloadedToday
            : 0;

    if (windowCount >= FREE_WEEKLY_PDF_LIMIT) {
        return { allowed: false, reason: 'UPGRADE_REQUIRED', remaining: 0, isPro: false };
    }

    // Allowed — record the download
    await prisma.user.update({
        where: { id: userId },
        data: {
            lastPdfDownload: new Date(),
            reportsDownloadedToday: windowCount + 1,
            totalPdfsDownloaded: { increment: 1 },
        },
    });

    return {
        allowed: true,
        remaining: FREE_WEEKLY_PDF_LIMIT - (windowCount + 1),
        isPro: false,
    };
}
