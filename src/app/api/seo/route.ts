// src/app/api/seo/route.ts
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const PYTHON_API_URL = process.env.PYTHON_API_URL || "http://localhost:8000";
const FREE_DAILY_LIMIT = 3;

export async function POST(req: Request) {
    try {
        // ── 1. Auth check
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        const isPro = session.user.planType === "PRO";
        const body = await req.json();

        // ── 2. Free tier rate limit — atomic transaction (fixes race condition)
        if (!isPro) {
            try {
                await prisma.$transaction(async (tx) => {
                    const user = await tx.user.findUnique({
                        where: { id: userId },
                        select: { seoGensToday: true, lastUsageReset: true },
                    });

                    if (!user) throw new Error("USER_NOT_FOUND");

                    // ── Daily reset check
                    const now = new Date();
                    const lastReset = new Date(user.lastUsageReset);
                    const isNewDay =
                        now.getDate() !== lastReset.getDate() ||
                        now.getMonth() !== lastReset.getMonth() ||
                        now.getFullYear() !== lastReset.getFullYear();

                    const currentCount = isNewDay ? 0 : user.seoGensToday;

                    // ── Block if at limit
                    if (currentCount >= FREE_DAILY_LIMIT) {
                        throw new Error("RATE_LIMIT");
                    }

                    // ── Atomically increment (or reset + set to 1 on new day)
                    await tx.user.update({
                        where: { id: userId },
                        data: {
                            seoGensToday: isNewDay ? 1 : { increment: 1 },
                            lastUsageReset: isNewDay ? now : undefined,
                        },
                    });
                });
            } catch (txError: any) {
                if (txError.message === "RATE_LIMIT") {
                    return NextResponse.json({
                        success: false,
                        limitReached: true,
                        message: `You've reached your free daily limit of ${FREE_DAILY_LIMIT} generations. Upgrade to Pro for unlimited access!`,
                    }, { status: 429 });
                }
                if (txError.message === "USER_NOT_FOUND") {
                    return NextResponse.json({ error: "User not found" }, { status: 404 });
                }
                throw txError; // unexpected DB error — let outer catch handle it
            }
        }

        // ── 3. Call Python engine
        const pythonResponse = await fetch(`${PYTHON_API_URL}/generate-seo`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (!pythonResponse.ok) {
            throw new Error(`Python backend returned ${pythonResponse.status}`);
        }

        const data = await pythonResponse.json();

        // ── 4. PRO users: still track usage (optional analytics), no limit enforced
        //    Counter was already incremented atomically inside the transaction above
        //    for free users, so no second update needed here.

        return NextResponse.json(data);

    } catch (error) {
        console.error("SEO API Error:", error);
        return NextResponse.json(
            { success: false, message: "Something went wrong." },
            { status: 500 }
        );
    }
}