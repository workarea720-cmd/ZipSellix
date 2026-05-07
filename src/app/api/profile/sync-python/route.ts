// src/app/api/profile/sync-python/route.ts
// ── Proxies business setup to Python backend with proper X-User-Id header.
// ── The store calls this route instead of Python directly.

import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

const PYTHON_URL = process.env.PYTHON_API_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
    try {
        // ── 1. Get session server-side (has user ID)
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // ── 2. Forward the payload to Python with X-User-Id
        const body = await req.json();

        const pythonRes = await fetch(`${PYTHON_URL}/api/business/setup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-User-Id": session.user.id,
            },
            body: JSON.stringify(body),
        });

        const data = await pythonRes.json();

        if (!pythonRes.ok) {
            return NextResponse.json(
                { error: `Python returned ${pythonRes.status}`, detail: data },
                { status: pythonRes.status }
            );
        }

        return NextResponse.json(data);

    } catch (error: any) {
        console.error("Python sync proxy error:", error);
        return NextResponse.json(
            { error: "Failed to sync with Python backend" },
            { status: 500 }
        );
    }
}