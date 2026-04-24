import { NextRequest, NextResponse } from 'next/server';

const BACKEND = 'http://127.0.0.1:8000';

// ── POST: /api/whatsapp-manager → /api/wa/verify
// ── POST: /api/whatsapp-manager?action=templates → /api/wa/templates
export async function POST(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const action = searchParams.get('action');
        const backendPath = action === 'templates' ? '/api/wa/templates' : '/api/wa/verify';
        const body = await req.json();
        const res = await fetch(`${BACKEND}${backendPath}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch {
        return NextResponse.json({ success: false, error: 'Backend unavailable' }, { status: 500 });
    }
}

// ── GET: /api/whatsapp-manager?endpoint=dashboard|templates
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const endpoint = searchParams.get('endpoint') || 'dashboard';
        const res = await fetch(`${BACKEND}/api/wa/${endpoint}`);
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch {
        return NextResponse.json({ success: false, error: 'Backend unavailable' }, { status: 500 });
    }
}

// ── PATCH: /api/whatsapp-manager?id=xxx → /api/wa/orders/{id}/status
export async function PATCH(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
        const body = await req.json();
        const res = await fetch(`${BACKEND}/api/wa/orders/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch {
        return NextResponse.json({ success: false, error: 'Backend unavailable' }, { status: 500 });
    }
}

// ── DELETE: /api/whatsapp-manager?id=xxx → /api/wa/templates/{id}
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
        const res = await fetch(`${BACKEND}/api/wa/templates/${id}`, { method: 'DELETE' });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch {
        return NextResponse.json({ success: false, error: 'Backend unavailable' }, { status: 500 });
    }
}