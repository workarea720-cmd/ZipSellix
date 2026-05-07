// src/app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
    try {
        const { token, newPassword } = await req.json();

        // ── Basic validation
        if (!token || typeof token !== "string") {
            return NextResponse.json(
                { error: "Reset token is required." },
                { status: 400 }
            );
        }

        if (!newPassword || typeof newPassword !== "string") {
            return NextResponse.json(
                { error: "New password is required." },
                { status: 400 }
            );
        }

        if (newPassword.length < 8) {
            return NextResponse.json(
                { error: "Password must be at least 8 characters." },
                { status: 400 }
            );
        }

        // ── Find the token in DB
        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { token },
        });

        if (!resetToken) {
            return NextResponse.json(
                { error: "Invalid or expired reset link. Please request a new one." },
                { status: 400 }
            );
        }

        // ── Check expiry
        if (new Date() > resetToken.expires) {
            // Clean up expired token
            await prisma.passwordResetToken.delete({ where: { token } });
            return NextResponse.json(
                { error: "This reset link has expired. Please request a new one." },
                { status: 400 }
            );
        }

        // ── Find the user
        const user = await prisma.user.findUnique({
            where: { email: resetToken.email },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found." },
                { status: 404 }
            );
        }

        // ── Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        // ── Update password in DB
        await prisma.user.update({
            where: { email: resetToken.email },
            data: { password: hashedPassword },
        });

        // ── Delete the used token
        await prisma.passwordResetToken.delete({ where: { token } });

        return NextResponse.json({
            success: true,
            message: "Password updated successfully. You can now log in.",
        });
    } catch (error) {
        console.error("Reset password error:", error);
        return NextResponse.json(
            { error: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}
