import { getSession } from "next-auth/react";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

/**
 * A safe fetch wrapper that prevents "Failed to fetch" crashes.
 * It checks response.ok, catches network errors, logs them, and returns null instead of throwing.
 * Now it also automatically injects the x-user-id header from the session.
 */
export async function safeFetch<T>(url: string, options?: RequestInit): Promise<T | null> {
    console.log(`[Fetch] Requesting: ${url}`);
    
    // Auto-inject User ID for multi-tenant isolation
    let session = null;
    try {
        session = await getSession();
    } catch (e) {
        console.warn("[Fetch] Failed to get session, falling back to anonymous.");
    }

    const headers = new Headers(options?.headers || {});
    if (session?.user?.id) {
        headers.set("x-user-id", session.user.id);
    } else {
        console.error(`[Fetch] Blocked: No User ID found for ${url}. Auth required.`);
        return null;
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });
        
        console.log(`[Fetch] Response Status for ${url}: ${response.status}`);
        
        if (!response.ok) {
            console.error(`[Fetch] Error for ${url}: ${response.statusText} (${response.status})`);
            return null;
        }

        return (await response.json()) as T;
    } catch (error) {
        console.error(`[Fetch] Network/Parse Error for ${url}:`, error);
        return null;
    }
}
