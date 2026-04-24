import { PrismaClient } from "@prisma/client";
import dns from "dns";

// Force IPv4 in Node.js to fix Neon database timeout issues on Windows routers that drop IPv6 packets.
dns.setDefaultResultOrder("ipv4first");

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
    globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;