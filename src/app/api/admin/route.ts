import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

const baseUrl = process.env.PYTHON_API_URL || 'http://127.0.0.1:8000';

/** Secure headers for admin endpoints — includes shared secret + verified email */
function adminHeaders(email: string): Record<string, string> {
    return {
        'Content-Type': 'application/json',
        'X-Internal-Secret': process.env.INTERNAL_API_SECRET || '',
        'X-User-Email': email,
    };
}

// ── GET: /api/admin?endpoint=all-tickets
export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id || !session?.user?.email) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const endpoint = searchParams.get('endpoint') || 'all-tickets';

        const res = await fetch(`${baseUrl}/api/admin/${endpoint}`, {
            method: 'GET',
            headers: adminHeaders(session.user.email),
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch {
        return NextResponse.json({ success: false, error: 'Backend unavailable' }, { status: 500 });
    }
}

// ── PATCH: /api/admin?ticketId=xxx → /api/admin/tickets/{id}/status
export async function PATCH(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id || !session?.user?.email) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const ticketId = searchParams.get('ticketId');
        if (!ticketId) {
            return NextResponse.json({ success: false, error: 'Missing ticketId' }, { status: 400 });
        }

        const body = await req.json();

        const res = await fetch(`${baseUrl}/api/admin/tickets/${ticketId}/status`, {
            method: 'PATCH',
            headers: adminHeaders(session.user.email),
            body: JSON.stringify(body),
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch {
        return NextResponse.json({ success: false, error: 'Backend unavailable' }, { status: 500 });
    }
}
