import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(req: Request) {
    try {
        const session = await auth();
        
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;
        
        // 1. Wipe business data from Python backend
        try {
            const pythonBackendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
            const response = await fetch(`${pythonBackendUrl}/api/business/reset`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-ID': userId,
                    'X-Internal-Secret': process.env.INTERNAL_API_SECRET || ''
                }
            });
            
            if (!response.ok) {
                console.error("Failed to reset Python backend data", await response.text());
            }
        } catch (e) {
            console.error("Failed to connect to Python backend for reset", e);
        }

        // 2. Delete user from Postgres
        await prisma.user.delete({
            where: {
                id: userId
            }
        });

        return NextResponse.json({ success: true, message: 'Account deleted successfully' }, { status: 200 });

    } catch (error) {
        console.error('DELETE ACCOUNT ERROR:', error);
        return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
    }
}
