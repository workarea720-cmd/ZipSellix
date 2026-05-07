import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const session = await auth();
        
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { currentPassword, newPassword } = body;

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: 'Current and new password are required' }, { status: 400 });
        }

        if (newPassword.length < 8) {
            return NextResponse.json({ error: 'New password must be at least 8 characters long' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user || !user.password) {
            return NextResponse.json({ error: 'User not found or using OAuth login' }, { status: 400 });
        }

        const isPasswordValid = bcrypt.compareSync(currentPassword, user.password);

        if (!isPasswordValid) {
            return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
        }

        const hashed = bcrypt.hashSync(newPassword, 12);

        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashed }
        });

        return NextResponse.json({ success: true, message: 'Password updated successfully' });

    } catch (error) {
        console.error('Change Password Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
