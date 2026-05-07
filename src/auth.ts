// auth.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
// ── Apple requires paid Apple Developer account ($99/yr)
// ── Uncomment below when ready:
// import Apple from "next-auth/providers/apple";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma) as any,
    trustHost: true,
    basePath: "/api/auth",

    providers: [

        // ── 1. GOOGLE ─────────────────────────────────────────────────────
        // Setup: https://console.cloud.google.com → APIs → Credentials → OAuth 2.0
        // Authorized redirect URI: https://yourdomain.com/api/auth/callback/google
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            allowDangerousEmailAccountLinking: true, // allows linking if email already exists
        }),

        // ── 2. FACEBOOK ───────────────────────────────────────────────────
        // Setup: https://developers.facebook.com → My Apps → Add Product → Facebook Login
        // Valid OAuth Redirect: https://yourdomain.com/api/auth/callback/facebook
        Facebook({
            clientId: process.env.FACEBOOK_CLIENT_ID!,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
            allowDangerousEmailAccountLinking: true,
        }),

        // ── 3. APPLE (Uncomment when Apple Dev account is ready) ──────────
        // Requires: Apple Developer Program ($99/yr), Service ID, Private Key
        // Setup guide: https://authjs.dev/reference/core/providers/apple
        // Apple({
        //     clientId: process.env.APPLE_CLIENT_ID!,       // Service ID (e.g. com.yourapp.signin)
        //     clientSecret: process.env.APPLE_CLIENT_SECRET!, // Generated JWT private key
        // }),

        // ── 4. CREDENTIALS ────────────────────────────────────────────────
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email aur password zaroori hain.");
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string },
                });

                if (!user || !user.password) {
                    throw new Error("Ghalat email ya password.");
                }

                const passwordsMatch = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                );

                if (!passwordsMatch) {
                    throw new Error("Ghalat email ya password.");
                }

                return {
                    ...user,
                    planType: (user as any).planType || "FREE",
                    businessName: user.businessName || undefined,
                };
            },
        }),
    ],

    pages: {
        signIn: "/login",
        error: "/login", // OAuth errors redirect here with ?error= param
    },

    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },

    callbacks: {
        async jwt({ token, user, account, trigger, session }) {
            // ── Initial sign-in (any provider)
            if (user) {
                token.id = user.id;
                token.planType = (user as any).planType || "FREE";
                token.businessName = (user as any).businessName || null;
                token.provider = account?.provider || "credentials";
            }
            // ── Manual session update (e.g. after PRO upgrade)
            if (trigger === "update" && session?.planType) {
                token.planType = session.planType;
            }
            return token;
        },

        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.planType = token.planType as string;
                session.user.businessName = token.businessName as string;
                session.user.provider = token.provider as string;
            }
            return session;
        },

        // ── Auto-create user profile on first OAuth sign-in
        async signIn({ user, account }) {
            // Allow credentials login always
            if (account?.provider === "credentials") return true;

            // For OAuth (Google/Facebook): ensure user exists in DB
            // PrismaAdapter handles this automatically
            // but we can add custom logic here if needed (e.g. set businessName)
            if (account?.provider === "google" || account?.provider === "facebook") {
                try {
                    // Check if user already has a record — if new, initialize defaults
                    const existingUser = await prisma.user.findUnique({
                        where: { email: user.email! },
                    });

                    if (!existingUser) {
                        // New OAuth user — PrismaAdapter creates them
                        // isSetupComplete stays false → they will be guided to onboarding
                        return true;
                    }
                } catch {
                    return false;
                }
            }

            return true;
        },
    },
});
