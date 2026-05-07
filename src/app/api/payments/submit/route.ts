import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const session = await auth();
        
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        const body = await req.json();
        const { method, transactionId } = body;

        if (!method || !transactionId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Update User in Database for manual verification
        await prisma.user.update({
            where: { id: userId },
            data: {
                subscriptionStatus: "PENDING_VERIFICATION",
                transactionId: transactionId,
                paymentMethod: method,
            },
        });

        console.log(`✅ User ${userId} submitted payment verification (${method}: ${transactionId})`);

        return NextResponse.json({ success: true, message: "Payment submitted for verification" });

    } catch (error) {
        console.error("Payment Submission Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
