"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import { Loader2, ShieldCheck, CreditCard } from "lucide-react";

function CheckoutContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const userId = searchParams.get("userId");
    const plan = searchParams.get("plan");
    const amount = searchParams.get("amount");

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleMockPayment = async () => {
        setIsLoading(true);
        setError("");

        try {
            // Yeh request hamare aakhri step (Webhook) ko jayegi
            const response = await fetch("/api/webhooks/mock-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    planId: plan,
                    amount: Number(amount),
                    status: "PAID",
                    transactionId: `MOCK_TXN_${Date.now()}` // Fake Transaction ID
                }),
            });

            if (!response.ok) throw new Error("Payment simulation failed. Please try again.");

            // Payment success hone par dashboard pe bhej do
            router.push("/dashboard?upgrade=success");
        } catch (err: any) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    if (!userId || !amount) return <div className="p-10 text-center text-[#304250]/60 font-medium">Invalid Checkout Session. Missing parameters.</div>;

    return (
        <div className="max-w-md w-full bg-white rounded-[32px] shadow-[0_20px_60px_-15px_rgba(48,66,80,0.08)] p-8 sm:p-10 border border-[#304250]/10 relative z-10">
            <div className="text-center mb-8">
                {/* Shield icon in Signature Green */}
                <ShieldCheck size={48} className="text-[#20A46B] mx-auto mb-4" />
                <h1 className="text-2xl font-extrabold text-[#304250] tracking-tight">Secure Checkout</h1>
                <p className="text-[#304250]/60 font-medium text-sm mt-2">Simulated Testing Gateway</p>
            </div>

            <div className="bg-gray-50/50 rounded-2xl p-6 border border-[#304250]/10 mb-8">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[#304250]/70 font-bold">Plan Details</span>
                    <span className="font-extrabold text-[#304250] uppercase">{plan}</span>
                </div>
                <div className="flex justify-between items-center border-t border-[#304250]/10 pt-4 mt-4">
                    <span className="text-[#304250]/70 font-bold">Total Amount</span>
                    {/* Amount highlighted in Signature Green */}
                    <span className="text-2xl font-black text-[#20A46B]">Rs {amount}</span>
                </div>
            </div>

            {error && <p className="text-red-500 text-sm font-bold mb-4 text-center bg-red-50 p-3 rounded-xl border border-red-200">{error}</p>}

            {/* Primary Action Button in Signature Green */}
            <button
                onClick={handleMockPayment}
                disabled={isLoading}
                className="w-full h-14 bg-[#20A46B] hover:bg-[#20A46B]/90 text-white font-bold rounded-xl shadow-[0_4px_14px_rgba(16,185,129,0.3)] transition-all hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
            >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <><CreditCard size={20} /> Simulate Successful Payment</>}
            </button>

            <p className="text-center text-[10px] text-[#304250]/40 mt-6 font-bold uppercase tracking-widest">
                This is a mock environment. No real money is charged.
            </p>
        </div>
    );
}

// Next.js mein useSearchParams use karte waqt Suspense zaroori hota hai
export default function MockCheckout() {
    return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 font-sans relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#20A46B]/10 blur-[100px] pointer-events-none"></div>

            <Suspense fallback={
                <div className="flex items-center justify-center relative z-10">
                    <Loader2 className="animate-spin text-[#20A46B]" size={32} />
                </div>
            }>
                <CheckoutContent />
            </Suspense>
        </div>
    );
}