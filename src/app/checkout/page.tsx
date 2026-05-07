"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import { Loader2, Building2, Smartphone, CheckCircle2 } from "lucide-react";
import { paymentConfig } from "@/config/payments";

function CheckoutContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const plan = searchParams.get("plan");
    const amount = searchParams.get("amount");

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedMethod, setSelectedMethod] = useState<"Bank Transfer" | "Easypaisa" | "JazzCash" | "">("");
    const [transactionId, setTransactionId] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMethod || !transactionId) {
            setError("Please select a payment method and enter the Transaction ID.");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const response = await fetch("/api/payments/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    method: selectedMethod,
                    transactionId,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Payment submission failed. Please try again.");
            }

            setIsSuccess(true);
            setTimeout(() => {
                router.push("/dashboard?upgrade=pending");
            }, 3000);
        } catch (err: any) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    if (!amount) return <div className="p-10 text-center text-[#304250]/60 font-medium">Invalid Checkout Session.</div>;

    if (isSuccess) {
        return (
            <div className="max-w-md w-full bg-white rounded-[32px] shadow-[0_20px_60px_-15px_rgba(48,66,80,0.08)] p-8 text-center">
                <CheckCircle2 size={64} className="text-[#20A46B] mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-[#304250] mb-2">Verification Pending</h2>
                <p className="text-[#304250]/70">We have received your transaction ID. Your account will be upgraded shortly after verification.</p>
                <p className="text-sm text-[#304250]/50 mt-4">Redirecting to dashboard...</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl w-full bg-white rounded-[32px] shadow-[0_20px_60px_-15px_rgba(48,66,80,0.08)] p-8 border border-[#304250]/10 relative z-10">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-extrabold text-[#304250] tracking-tight">Complete Payment</h1>
                <p className="text-[#304250]/60 font-medium mt-2">Transfer Rs {amount} to any account below to upgrade your plan.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {/* Bank Transfer */}
                <button 
                    onClick={() => setSelectedMethod("Bank Transfer")}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${selectedMethod === "Bank Transfer" ? "border-[#20A46B] bg-[#20A46B]/5" : "border-gray-100 hover:border-[#20A46B]/30"}`}
                >
                    <Building2 className="mb-2 text-[#20A46B]" />
                    <h3 className="font-bold text-[#304250] mb-1">Bank Transfer</h3>
                    <div className="text-sm text-[#304250]/70">
                        <p className="font-medium text-[#304250]">{paymentConfig.bankTransfer.bankName}</p>
                        <p className="truncate" title={paymentConfig.bankTransfer.accountTitle}>{paymentConfig.bankTransfer.accountTitle}</p>
                        <p className="font-mono text-xs mt-1 text-[#20A46B] select-all">{paymentConfig.bankTransfer.iban}</p>
                    </div>
                </button>

                {/* Easypaisa */}
                <button 
                    onClick={() => setSelectedMethod("Easypaisa")}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${selectedMethod === "Easypaisa" ? "border-[#20A46B] bg-[#20A46B]/5" : "border-gray-100 hover:border-[#20A46B]/30"}`}
                >
                    <Smartphone className="mb-2 text-green-500" />
                    <h3 className="font-bold text-[#304250] mb-1">Easypaisa</h3>
                    <div className="text-sm text-[#304250]/70">
                        <p className="truncate" title={paymentConfig.easypaisa.title}>{paymentConfig.easypaisa.title}</p>
                        <p className="font-mono mt-1 text-green-600 font-semibold select-all">{paymentConfig.easypaisa.number}</p>
                    </div>
                </button>

                {/* JazzCash */}
                <button 
                    onClick={() => setSelectedMethod("JazzCash")}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${selectedMethod === "JazzCash" ? "border-[#20A46B] bg-[#20A46B]/5" : "border-gray-100 hover:border-[#20A46B]/30"}`}
                >
                    <Smartphone className="mb-2 text-red-500" />
                    <h3 className="font-bold text-[#304250] mb-1">JazzCash</h3>
                    <div className="text-sm text-[#304250]/70">
                        <p className="truncate" title={paymentConfig.jazzcash.title}>{paymentConfig.jazzcash.title}</p>
                        <p className="font-mono mt-1 text-red-600 font-semibold select-all">{paymentConfig.jazzcash.number}</p>
                    </div>
                </button>
            </div>

            <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <div className="mb-4">
                    <label className="block text-sm font-bold text-[#304250] mb-2">Transaction ID (TID)</label>
                    <input 
                        type="text" 
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="Enter your TID after transferring"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#20A46B] focus:border-transparent transition-all"
                        required
                    />
                </div>

                {error && <p className="text-red-500 text-sm font-bold mb-4">{error}</p>}

                <button
                    type="submit"
                    disabled={isLoading || !selectedMethod || !transactionId}
                    className="w-full h-14 bg-[#20A46B] hover:bg-[#20A46B]/90 text-white font-bold rounded-xl shadow-[0_4px_14px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Submit for Verification"}
                </button>
            </form>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 font-sans relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#20A46B]/10 blur-[100px] pointer-events-none"></div>

            <Suspense fallback={<Loader2 className="animate-spin text-[#20A46B]" size={32} />}>
                <CheckoutContent />
            </Suspense>
        </div>
    );
}