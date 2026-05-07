'use client';
// src/components/settings/SettingsClient.tsx  (or wherever you currently have it)

import React, { useState, Suspense } from 'react';
import { User, Building2, Truck, DollarSign, FileText, ArrowLeft, Blocks, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';

// ── Extracted tab components (each in its own file)
import GeneralTab from '@/components/settings/GeneralTab';
import BusinessTab from '@/components/settings/BusinessTab';
import LogisticsTab from '@/components/settings/LogisticsTab';
import FinancialsTab from '@/components/settings/FinancialsTab';
import IntegrationsTab from '@/components/settings/IntegrationsTab';
import DocumentsTab from '@/components/settings/DocumentsTab';

// ── Tab config
const TABS = [
    { id: 'general', label: 'Personal Info', icon: User },
    { id: 'business', label: 'Business Identity', icon: Building2 },
    { id: 'logistics', label: 'Logistics', icon: Truck },
    { id: 'financials', label: 'Financials', icon: DollarSign },
    { id: 'integrations', label: 'Integrations', icon: Blocks },
    { id: 'documents', label: 'Documents', icon: FileText },
];

function SettingsClientInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const returnTo = searchParams.get('from') ?? '/tools/profit-calculator';
    const [activeTab, setActiveTab] = useState('general');

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans text-[#304250] pb-20 selection:bg-[#20A46B]/20 selection:text-[#20A46B]">

            {/* ── Top Bar ── */}
            <div className="bg-white border-b border-[#304250]/10 sticky top-0 z-20 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 sm:h-20 flex items-center gap-3 sm:gap-4">
                    <button
                        onClick={() => router.push(returnTo)}
                        className="p-2 sm:p-2.5 rounded-xl hover:bg-gray-50 text-[#304250]/60 transition-colors border border-transparent hover:border-[#304250]/10 active:scale-95 shrink-0"
                    >
                        <ArrowLeft size={20} strokeWidth={2.5} />
                    </button>
                    <div className="min-w-0">
                        <h1 className="text-lg sm:text-2xl font-black text-[#304250] tracking-tight truncate">Settings Workspace</h1>
                        <p className="text-[10px] sm:text-xs font-bold text-[#304250]/60 uppercase tracking-widest mt-0.5 truncate">Manage your preferences</p>
                    </div>
                </div>
            </div>

            {/* ── Mobile Tabs Grid ── */}
            <div className="md:hidden bg-white border-b border-[#304250]/10 p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {TABS.map(tab => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center justify-center gap-1.5 px-2 py-2.5 text-[11px] sm:text-xs font-bold rounded-xl transition-all border ${isActive
                                        ? 'text-white bg-[#20A46B] border-[#20A46B] shadow-sm'
                                        : 'text-[#304250]/60 bg-gray-50 border-[#304250]/10 hover:bg-gray-100 hover:text-[#304250]'
                                    }`}>
                                <tab.icon size={14} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
                                <span className="truncate">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Page Layout ── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8">
                <div className="flex flex-col md:flex-row gap-8">

                    {/* ── Desktop Sidebar Nav ── */}
                    <nav className="hidden md:block w-64 flex-shrink-0">
                        <div className="sticky top-28 flex flex-col gap-2">
                            {TABS.map(tab => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-300 relative overflow-hidden group ${isActive
                                                ? 'text-[#20A46B] bg-[#20A46B]/5 shadow-sm border border-[#20A46B]/20'
                                                : 'text-[#304250]/60 hover:text-[#304250] hover:bg-white border border-transparent hover:border-[#304250]/10'
                                            }`}>
                                        {isActive && (
                                            <motion.div layoutId="activeTabIndicator" className="absolute left-0 top-0 bottom-0 w-1 bg-[#20A46B] rounded-r-full" />
                                        )}
                                        <Icon size={18} className={isActive ? 'text-[#20A46B]' : 'text-[#304250]/40 group-hover:text-[#304250]/60'} strokeWidth={isActive ? 2.5 : 2} />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </nav>

                    {/* ── Tab Content ── */}
                    <div className="flex-1 min-w-0 w-full overflow-hidden">
                        <AnimatePresence mode="wait">
                            {activeTab === 'general' && <GeneralTab key="general" />}
                            {activeTab === 'business' && <BusinessTab key="business" />}
                            {activeTab === 'logistics' && <LogisticsTab key="logistics" />}
                            {activeTab === 'financials' && <FinancialsTab key="financials" />}
                            {activeTab === 'integrations' && <IntegrationsTab key="integrations" />}
                            {activeTab === 'documents' && <DocumentsTab key="documents" />}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #30425020; border-radius: 10px; }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: #30425040; }
            `}</style>
        </div>
    );
}

export default function SettingsClient() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#20A46B]" />
            </div>
        }>
            <SettingsClientInner />
        </Suspense>
    );
}