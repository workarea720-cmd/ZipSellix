import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Upgrade the user to PRO in the database
        await prisma.user.update({
            where: { id: session.user.id },
            data: { planType: "PRO" } as any
        });

        return NextResponse.json({ success: true, message: "Upgraded to PRO successfully!" });
    } catch (error) {
        console.error("Test Upgrade Error:", error);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}