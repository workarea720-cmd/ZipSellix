import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        // 1. Get Logged-in User
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        const isPro = session.user.planType === "PRO";
        const body = await req.json();

        // 2. ENFORCE FREE TIER LIMITS (3 per day)
        if (!isPro) {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

            const now = new Date();
            const lastReset = new Date(user.lastUsageReset);

            // Is it a new day? (Midnight Auto-Reset)
            const isNewDay =
                now.getDate() !== lastReset.getDate() ||
                now.getMonth() !== lastReset.getMonth() ||
                now.getFullYear() !== lastReset.getFullYear();

            let currentUsage = user.seoGensToday;

            if (isNewDay) {
                await prisma.user.update({
                    where: { id: userId },
                    data: { seoGensToday: 0, lastUsageReset: now }
                });
                currentUsage = 0;
            }

            // Block request if limit is reached!
            if (currentUsage >= 3) {
                return NextResponse.json({
                    success: false,
                    limitReached: true,
                    message: "You have reached your free daily limit of 3 generations. Upgrade to Pro for unlimited access!"
                }, { status: 403 });
            }
        }

        // 3. CALL PYTHON ENGINE (If allowed)
        const pythonResponse = await fetch('http://localhost:8000/generate-seo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!pythonResponse.ok) throw new Error("Python backend error");

        const data = await pythonResponse.json();

        // 4. INCREMENT COUNTER ON SUCCESS (For Free Users)
        if (!isPro && data.success) {
            await prisma.user.update({
                where: { id: userId },
                data: { seoGensToday: { increment: 1 } }
            });
        }

        return NextResponse.json(data);

    } catch (error) {
        console.error("SEO API Gatekeeper Error:", error);
        return NextResponse.json({ success: false, message: "Something went wrong." }, { status: 500 });
    }
}