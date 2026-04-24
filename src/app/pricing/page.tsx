import React from 'react';
import Link from 'next/link';
import { Check, Zap, Shield } from 'lucide-react';
import { auth } from "@/auth";
import { initiateCheckout } from "@/actions/checkout";

export const metadata = {
    title: 'Pricing | ZipSellix',
    description: 'Simple, transparent pricing for growing e-commerce businesses.',
};

export default async function PricingPage() {
    // 1. Check if user is logged in to change the CTA button text dynamically
    const session = await auth();
    const isLoggedIn = !!session?.user;
    const isPro = session?.user?.planType === "PRO";

    const features = [
        { name: "Image Compressor & BG Remover", free: "Single Image (HD)", pro: "Bulk Processing + Templates" },
        { name: "WhatsApp Manager", free: "External Link App", pro: "In-App Sending Dashboard" },
        { name: "SEO Generator", free: "3 Generations / Day", pro: "Unlimited Generations" },
        { name: "Profit Calculator Reports", free: "1 / Day (Watermarked)", pro: "Unlimited (Clean/Custom Logo)" },
        { name: "Link-in-Bio Pages", free: "ZipSellix Badge", pro: "Custom Branding (No Badge)" },
        { name: "Invoices & Packaging Slips", free: "ZipSellix Watermark", pro: "Completely Clean / Custom" },
        { name: "Shipping Labels", free: "Single Generation", pro: "Bulk Generation Support" },
    ];

    return (
        <div className="min-h-screen bg-[#f8fafc] py-20 px-4 font-sans relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-[#20A46B]/5 blur-[120px] pointer-events-none"></div>

            {/* Header Section */}
            <div className="max-w-3xl mx-auto text-center mb-16 relative z-10 animate-in slide-in-from-bottom-4 duration-500">
                <h1 className="text-4xl md:text-5xl font-black text-[#304250] tracking-tight mb-6">
                    Simple pricing, <span className="text-[#20A46B]">no surprises.</span>
                </h1>
                <p className="text-lg text-[#304250]/70 font-medium leading-relaxed">
                    Start for free and upgrade when you need automation, bulk tools, and custom branding to scale your e-commerce business.
                </p>
            </div>

            {/* Pricing Cards */}
            <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 mb-20 relative z-10">

                {/* FREE TIER CARD */}
                <div className="bg-white rounded-[32px] p-8 border border-[#304250]/10 shadow-[0_8px_30px_rgba(48,66,80,0.04)] flex flex-col relative">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-[#304250] mb-2">Free Starter</h2>
                        <p className="text-[#304250]/60 text-sm font-medium">Perfect for new sellers getting off the ground.</p>
                    </div>
                    <div className="mb-8">
                        <span className="text-5xl font-black text-[#304250]">Rs 0</span>
                        <span className="text-[#304250]/50 font-bold ml-2">/ forever</span>
                    </div>

                    <Link
                        href={isLoggedIn ? "/dashboard" : "/signup"}
                        className="w-full text-center py-4 rounded-xl font-bold text-[#304250] bg-gray-50 hover:bg-gray-100 border border-[#304250]/10 transition-all mb-8 shadow-sm hover:shadow-md"
                    >
                        {isLoggedIn ? "Go to Dashboard" : "Get Started for Free"}
                    </Link>

                    <div className="space-y-4 flex-1">
                        <p className="font-bold text-sm text-[#304250] uppercase tracking-wider">What's included:</p>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3 text-sm text-[#304250]/80 font-medium"><Check size={18} className="text-[#20A46B] shrink-0" /> Full access to all basic tools</li>
                            <li className="flex items-start gap-3 text-sm text-[#304250]/80 font-medium"><Check size={18} className="text-[#20A46B] shrink-0" /> HD Image processing (Single)</li>
                            <li className="flex items-start gap-3 text-sm text-[#304250]/80 font-medium"><Check size={18} className="text-[#20A46B] shrink-0" /> Standard WhatsApp links</li>
                        </ul>
                    </div>
                </div>

                {/* PRO TIER CARD */}
                <div className="bg-[#304250] rounded-[32px] p-8 border-2 border-[#EEBE1C] shadow-[0_20px_60px_rgba(48,66,80,0.2)] flex flex-col relative transform md:-translate-y-4">
                    <div className="absolute top-0 right-8 transform -translate-y-1/2">
                        <span className="bg-[#EEBE1C] text-[#304250] text-xs font-black uppercase tracking-wider py-1.5 px-4 rounded-full flex items-center gap-1.5 shadow-lg">
                            <Zap size={14} className="fill-[#304250]" /> Most Popular
                        </span>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-white mb-2">ZipSellix Pro</h2>
                        <p className="text-white/70 text-sm font-medium">For scaling businesses that need automation.</p>
                    </div>
                    <div className="mb-8">
                        <span className="text-5xl font-black text-white">Rs 2,999</span>
                        <span className="text-white/50 font-bold ml-2">/ month</span>
                    </div>

                    {!isPro ? (
                        <form action={async () => {
                            "use server";
                            await initiateCheckout("pro-monthly", 2999);
                        }}>
                            <button
                                type="submit"
                                className="w-full block text-center py-4 rounded-xl font-black text-[#304250] bg-[#EEBE1C] hover:bg-[#d9ab18] shadow-[0_0_20px_rgba(238,190,28,0.3)] transition-all mb-8 active:scale-[0.98]"
                            >
                                Upgrade to Pro
                            </button>
                        </form>
                    ) : (
                        <Link
                            href="/dashboard"
                            className="w-full block text-center py-4 rounded-xl font-black text-[#304250] bg-[#EEBE1C] hover:bg-[#d9ab18] shadow-[0_0_20px_rgba(238,190,28,0.3)] transition-all mb-8 active:scale-[0.98]"
                        >
                            You are on Pro!
                        </Link>
                    )}

                    <div className="space-y-4 flex-1">
                        <p className="font-bold text-sm text-white/50 uppercase tracking-wider">Everything in Free, plus:</p>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3 text-sm text-white/90 font-medium"><Check size={18} className="text-[#20A46B] shrink-0" /> 100% White-labeled (No Branding)</li>
                            <li className="flex items-start gap-3 text-sm text-white/90 font-medium"><Check size={18} className="text-[#20A46B] shrink-0" /> In-App WhatsApp Sending</li>
                            <li className="flex items-start gap-3 text-sm text-white/90 font-medium"><Check size={18} className="text-[#20A46B] shrink-0" /> Bulk Processing & Unlimited AI Limits</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Detailed Feature Comparison Table */}
            <div className="max-w-5xl mx-auto bg-white rounded-[32px] p-6 md:p-12 shadow-[0_8px_30px_rgba(48,66,80,0.04)] border border-[#304250]/10 relative z-10">
                <div className="text-center mb-10">
                    <Shield size={32} className="text-[#20A46B] mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-[#304250]">Compare Features</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                            <tr>
                                <th className="py-4 px-4 font-bold text-[#304250]/60 uppercase text-[11px] tracking-wider border-b-2 border-[#304250]/10 w-1/2">Tool / Feature</th>
                                <th className="py-4 px-4 font-bold text-[#304250] uppercase text-[11px] tracking-wider border-b-2 border-[#304250]/10 w-1/4">Free</th>
                                <th className="py-4 px-4 font-bold text-[#20A46B] uppercase text-[11px] tracking-wider border-b-2 border-[#304250]/10 w-1/4 bg-[#20A46B]/5 rounded-t-xl">Pro</th>
                            </tr>
                        </thead>
                        <tbody>
                            {features.map((feature, index) => (
                                <tr key={index} className="hover:bg-gray-50/50 transition-colors group border-b border-[#304250]/5 last:border-0">
                                    <td className="py-4 px-4 text-sm font-medium text-[#304250]">
                                        {feature.name}
                                    </td>
                                    <td className="py-4 px-4 text-sm text-[#304250]/70 font-medium">
                                        {feature.free}
                                    </td>
                                    <td className="py-4 px-4 text-sm font-bold text-[#20A46B] bg-[#20A46B]/[0.02] group-hover:bg-[#20A46B]/5 transition-colors">
                                        {feature.pro}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}