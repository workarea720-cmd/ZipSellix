import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // 1. Skip API routes and static files
    if (
        pathname.startsWith("/api/") ||
        pathname.startsWith("/_next/") ||
        pathname.includes(".")
    ) {
        return NextResponse.next();
    }

    // 2. Cookie-based auth check (no NextAuth wrapper = no UnknownAction errors)
    const normalCookie = req.cookies.get("authjs.session-token");
    const secureCookie = req.cookies.get("__Secure-authjs.session-token");
    const oldCookie = req.cookies.get("next-auth.session-token");
    const oldSecureCookie = req.cookies.get("__Secure-next-auth.session-token");

    const isLoggedIn = !!(normalCookie || secureCookie || oldCookie || oldSecureCookie);

    // 3. Route classifications
    const isProtectedRoute = pathname.startsWith('/tools') || pathname.startsWith('/dashboard') || pathname.startsWith('/setup');
    const isAuthRoute = pathname === '/login' || pathname === '/signup';

    // 4. Redirect legacy routes to the single dashboard
    const legacyRedirectRoutes = ['/', '/dashboard', '/setup'];
    if (isLoggedIn && legacyRedirectRoutes.includes(pathname)) {
        return NextResponse.redirect(new URL('/tools/profit-calculator', req.url));
    }

    // 5. Protect routes - redirect to login if not authenticated
    if (isProtectedRoute && !isLoggedIn) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    // 6. Redirect authenticated users away from auth pages
    if (isAuthRoute && isLoggedIn) {
        return NextResponse.redirect(new URL('/tools/profit-calculator', req.url));
    }

    return NextResponse.next();
}

export const config = {
    // Match all request paths except for the ones starting with:
    // - api (API routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.map$|.*\\.json$|\\.well-known).*)"],
};
