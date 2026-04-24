"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Legacy redirect: all traffic goes to the single profit-calculator dashboard
export default function DashboardRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/tools/profit-calculator");
    }, [router]);

    return (
        <div className="h-screen flex items-center justify-center bg-[#f8fafc] font-sans">
            <div className="animate-pulse text-[#304250]/70 font-medium tracking-wide text-sm">
                Redirecting to dashboard...
            </div>
        </div>
    );
}