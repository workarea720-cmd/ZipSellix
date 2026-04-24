"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function initiateCheckout(planId: string, price: number) {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login?callbackUrl=/pricing");
    }

    const userId = session.user.id;

    // Simulate gateway redirect with URL parameters
    const checkoutUrl = `/mock-checkout?userId=${userId}&plan=${planId}&amount=${price}`;

    redirect(checkoutUrl);
}