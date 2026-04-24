import React from 'react';
import Link from 'next/link';
import { Lock, Zap, CheckCircle2, X } from 'lucide-react';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
}

export default function UpgradeModal({
    isOpen,
    onClose,
    title = "Daily Limit Reached",
    message = "You've used all your free generations for today."
}: UpgradeModalProps) {

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop with blur */}
            <div
                className="absolute inset-0 bg-[#304250]/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-md bg-card-bg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-1.5 rounded-full transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Header Icon Area */}
                <div className="bg-bg-subtle p-6 flex flex-col items-center border-b border-gray-100">
                    <div className="w-16 h-16 bg-[#EEBE1C]/20 text-[#EEBE1C] rounded-full flex items-center justify-center mb-4 shadow-inner ring-4 ring-white">
                        <Lock size={32} />
                    </div>
                    <h3 className="text-2xl font-black text-[#304250] text-center tracking-tight">
                        {title}
                    </h3>
                    <p className="text-center text-gray-600 mt-2 font-medium px-4">
                        {message}
                    </p>
                </div>

                {/* Pro Features List */}
                <div className="p-6 bg-card-bg">
                    <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                            <CheckCircle2 size={18} className="text-[#20A46B]" />
                            <span>Unlimited SEO Generations</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                            <CheckCircle2 size={18} className="text-[#20A46B]" />
                            <span>In-App WhatsApp Messaging</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                            <CheckCircle2 size={18} className="text-[#20A46B]" />
                            <span>Custom Branding on Reports</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                            <CheckCircle2 size={18} className="text-[#20A46B]" />
                            <span>Bulk Image Compression</span>
                        </div>
                    </div>

                    <Link
                        href="/pricing"
                        className="w-full flex items-center justify-center gap-2 bg-[#EEBE1C] text-[#304250] hover:bg-[#d9ab18] font-black text-lg py-3.5 rounded-xl transition-all shadow-md active:scale-[0.98]"
                    >
                        <Zap size={20} />
                        Upgrade to ZipSellix Pro
                    </Link>

                    <button
                        onClick={onClose}
                        className="w-full mt-3 text-center text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        Maybe Later
                    </button>
                </div>
            </div>
        </div>
    );
}