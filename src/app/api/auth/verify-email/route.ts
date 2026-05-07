import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { token } = await req.json();

        if (!token) {
            return NextResponse.json({ error: 'Token is required' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            // @ts-ignore - IDE TS server caching issue with newly generated Prisma fields
            where: { verifyToken: token }
        });

        // @ts-ignore - IDE TS server caching issue with newly generated Prisma fields
        if (!user || !user.verifyTokenExpiry || user.verifyTokenExpiry < new Date()) {
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: new Date(),
                // @ts-ignore - IDE TS server caching issue
                verifyToken: null,
                // @ts-ignore - IDE TS server caching issue
                verifyTokenExpiry: null,
            }
        });

        return NextResponse.json({ success: true, message: 'Email verified successfully' });
    } catch (error) {
        console.error('Email Verification Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
