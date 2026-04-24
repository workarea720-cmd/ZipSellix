import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// Agar aapke paas pehle se 'prisma' client ki koi file hai (jaise @/lib/prisma),
// toh usay yahan import kar lein. Warna yeh default implementation bilkul theek chalegi.
const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, planId, amount, status, transactionId } = body;

        // Security Check: Make sure data exists
        if (!userId || status !== "PAID") {
            return NextResponse.json({ error: "Invalid payment data" }, { status: 400 });
        }

        // Calculate Next Billing Date (30 days from now)
        const nextBillingDate = new Date();
        nextBillingDate.setDate(nextBillingDate.getDate() + 30);

        // Update User in Database
        await prisma.user.update({
            where: { id: userId },
            data: {
                planType: "PRO",
                subscriptionStatus: "ACTIVE",
                subscriptionId: transactionId, // Fake order ID
                currentPeriodEnd: nextBillingDate,
                paymentMethod: "MOCK_GATEWAY",
            },
        });

        console.log(`✅ User ${userId} successfully upgraded to PRO!`);

        return NextResponse.json({ success: true, message: "Account upgraded" });

    } catch (error) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
    }
}