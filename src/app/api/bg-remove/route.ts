import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { checkAndIncrement } from '@/lib/usageLimit';

const PYTHON_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Login karo pehle' }, { status: 401 });
        }

        const isPro = session.user.planType?.toUpperCase() === 'PRO';

        if (!isPro) {
            const check = await checkAndIncrement(session.user.id, 'bgRemovalsToday');
            if (!check.allowed) {
                return NextResponse.json(
                    { error: check.reason, limitReached: true },
                    { status: 403 }
                );
            }
        }

        // Forward to Python
        const formData = await req.formData();
        const pythonRes = await fetch(`${PYTHON_URL}/remove-bg`, {
            method: 'POST',
            body: formData,
        });

        const blob = await pythonRes.blob();
        return new NextResponse(blob, {
            status: pythonRes.status,
            headers: { 'Content-Type': pythonRes.headers.get('Content-Type') || 'image/png' },
        });

    } catch (error) {
        return NextResponse.json({ error: 'BG removal failed' }, { status: 500 });
    }
}