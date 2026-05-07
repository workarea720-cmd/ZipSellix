// src/app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email || typeof email !== "string") {
            return NextResponse.json(
                { error: "Email is required." },
                { status: 400 }
            );
        }

        const normalizedEmail = email.toLowerCase().trim();

        // ── Look up user (silently succeed even if not found — security best practice)
        const user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
        });

        // ── Always return the same generic message so attacker can't enumerate emails
        const genericMessage =
            "If this email is registered, a reset link has been generated.";

        if (!user) {
            return NextResponse.json({ success: true, message: genericMessage });
        }

        // ── Delete any existing token for this email
        await prisma.passwordResetToken.deleteMany({
            where: { email: normalizedEmail },
        });

        // ── Generate a secure token
        const token = crypto.randomBytes(32).toString("hex");
        const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

        // ── Save to DB
        await prisma.passwordResetToken.create({
            data: {
                email: normalizedEmail,
                token,
                expires,
            },
        });

        // ── Build the reset URL
        const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
        const resetUrl = `${baseUrl}/reset-password?token=${token}`;

        // ── TODO: Add email service here (Resend, Nodemailer, etc.)
        // ── For now: log to console and return in response for development
        console.log("────────────────────────────────────────");
        console.log("🔑 PASSWORD RESET LINK (Dev Mode):");
        console.log(resetUrl);
        console.log("────────────────────────────────────────");

        return NextResponse.json({
            success: true,
            message: genericMessage,
            // ── DEV ONLY: Remove this in production once email is set up
            devResetUrl: process.env.NODE_ENV === "development" ? resetUrl : undefined,
        });
    } catch (error) {
        console.error("Forgot password error:", error);
        return NextResponse.json(
            { error: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}
