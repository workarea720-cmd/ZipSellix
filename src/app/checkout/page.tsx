'use client';

import React, { useState } from 'react';
import { CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MockCheckoutPage() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleMockPayment = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/test-upgrade', { method: 'POST' });
            const data = await res.json();

            if (data.success) {
                // The database is updated! 
                alert("Payment Successful! Please log out and log back in to apply your PRO session.");
                router.push('/dashboard');
            } else {
                alert("Error upgrading account.");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 font-sans text-[#304250] relative overflow-hidden">
            {/* Background Glow using Primary Green */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#20A46B]/10 blur-[100px] pointer-events-none"></div>

            <div className="bg-white max-w-md w-full rounded-[32px] p-8 sm:p-10 shadow-[0_20px_60px_-15px_rgba(48,66,80,0.08)] border border-[#304250]/10 text-center relative z-10">

                {/* 10% Accent Color (Yellow) used perfectly for the warning badge */}
                <div className="bg-[#EEBE1C]/10 border border-[#EEBE1C]/30 text-[#304250] text-[11px] font-extrabold uppercase tracking-widest py-2 px-4 rounded-full inline-flex items-center gap-2 mb-8 shadow-sm">
                    <AlertTriangle size={14} className="text-[#EEBE1C]" /> Developer Test Mode
                </div>

                <div className="flex flex-col items-center text-center mb-6">
                    <h1 className="text-3xl font-extrabold text-[#304250] tracking-tight mb-2">Checkout</h1>
                    <p className="text-[#304250]/60 font-medium">
                        ZipSellix Pro Subscription - Rs 2,999/mo
                    </p>
                </div>

                <div className="bg-gray-50/50 rounded-2xl p-6 mb-8 text-left border border-[#304250]/10">
                    <p className="text-sm text-[#304250]/70 mb-4 font-medium leading-relaxed">By clicking below, you will simulate a successful payment and instantly upgrade your account to PRO.</p>
                    <div className="flex items-center gap-2 text-sm text-[#20A46B] font-bold bg-[#20A46B]/5 p-3 rounded-xl border border-[#20A46B]/10">
                        <CheckCircle2 size={18} /> Database will update to "PRO"
                    </div>
                </div>

                {/* 60% Primary Action Color (Green) for the main button to match Login/Signup */}
                <button
                    onClick={handleMockPayment}
                    disabled={loading}
                    className="w-full h-14 flex items-center justify-center gap-2 bg-[#20A46B] text-white font-bold text-[16px] rounded-xl hover:bg-[#20A46B]/90 transition-all shadow-[0_4px_14px_rgba(16,185,129,0.3)] hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-70 disabled:hover:translate-y-0"
                >
                    {loading ? <Loader2 size={24} className="animate-spin" /> : "Simulate Payment"}
                </button>
            </div>
        </div>
    );
}