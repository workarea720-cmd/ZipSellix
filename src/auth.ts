import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma) as any,
    trustHost: true,
    basePath: "/api/auth",
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email aur password zaroori hain.");
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string }
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
                    businessName: user.businessName || undefined
                };
            }
        })
    ],
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 Din ka session
    },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            // Initial sign-in
            if (user) {
                token.id = user.id;
                token.planType = (user as any).planType || "FREE";
                token.businessName = (user as any).businessName || null;
            }
            // Handling manual session updates
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
            }
            return session;
        }
    }
});