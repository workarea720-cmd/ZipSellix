'use client';
// src/components/settings/IntegrationsTab.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { SettingsCard, tabVariants } from '@/components/settings/shared';

const integrations = {
    advertising: [
        { name: 'Facebook Meta Ads', sub: 'Sync Campaigns & Costs', icon: 'https://api.iconify.design/logos:facebook.svg', alt: 'Facebook' },
        { name: 'Instagram Ads', sub: 'Boost & Story Spend', icon: 'https://api.iconify.design/skill-icons:instagram.svg', alt: 'Instagram' },
        { name: 'TikTok Business', sub: 'Track Pixel & Spend', icon: 'https://api.iconify.design/logos:tiktok-icon.svg', alt: 'TikTok' },
        { name: 'Google Ads', sub: 'Search & Display ROAS', icon: 'https://api.iconify.design/logos:google-ads.svg', alt: 'Google Ads' },
    ],
    storefronts: [
        { name: 'Shopify Store', sub: 'Auto-Import Orders', icon: 'https://api.iconify.design/logos:shopify.svg', alt: 'Shopify' },
        { name: 'Daraz PK', sub: 'Seller Center Sync', icon: null, alt: 'Daraz' },
        { name: 'WooCommerce', sub: 'Sales & Inventory Sync', icon: 'https://api.iconify.design/logos:woocommerce-icon.svg', alt: 'WooCommerce' },
        { name: 'WordPress', sub: 'Custom Site Tracking', icon: 'https://api.iconify.design/logos:wordpress-icon.svg', alt: 'WordPress' },
    ],
};

function IntegrationCard({ name, sub, icon, alt }: { name: string; sub: string; icon: string | null; alt: string }) {
    return (
        <div className="p-4 sm:p-5 bg-white border border-[#304250]/10 hover:border-[#20A46B] hover:shadow-md transition-all rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
            <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 bg-white rounded-xl flex items-center justify-center border border-[#304250]/10 shadow-sm">
                    {icon ? (
                        <img src={icon} alt={alt} className="w-6 h-6 sm:w-7 sm:h-7" />
                    ) : (
                        <svg viewBox="0 0 100 100" fill="none" className="w-6 h-6 sm:w-7 sm:h-7">
                            <rect width="100" height="100" rx="20" fill="#F85606" />
                            <polygon points="28,48 50,36 50,84 28,72" fill="#fff" />
                            <polygon points="50,36 50,12 72,24 72,72 50,84" fill="#fff" />
                            <polygon points="50,44 72,56 50,68" fill="#F85606" />
                        </svg>
                    )}
                </div>
                <div>
                    <h4 className="text-sm font-black text-[#304250]">{name}</h4>
                    <p className="text-[11px] sm:text-xs font-semibold text-[#304250]/60 mt-0.5">{sub}</p>
                </div>
            </div>
            <button onClick={() => toast.info('OAuth Integration coming soon!')}
                className="w-full sm:w-auto px-5 py-2.5 bg-gray-50 border border-[#304250]/5 text-[#304250]/70 hover:bg-[#20A46B] hover:text-white rounded-xl text-sm font-bold transition-all active:scale-95 shadow-sm shrink-0">
                Connect
            </button>
        </div>
    );
}

export default function IntegrationsTab() {
    return (
        <motion.div variants={tabVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
            <SettingsCard title="Advertising Platforms" description="Connect your marketing channels to get real-time ROAS and ad spend visibility synced directly to your profit calculations.">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                    {integrations.advertising.map(item => <IntegrationCard key={item.name} {...item} />)}
                </div>
            </SettingsCard>

            <SettingsCard title="E-commerce Storefronts" description="Sync orders, inventory, and automated fulfillment statuses right from your stores.">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                    {integrations.storefronts.map(item => <IntegrationCard key={item.name} {...item} />)}
                </div>
            </SettingsCard>
        </motion.div>
    );
}
