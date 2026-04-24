"use client";

import React, { useState, useEffect, lazy, Suspense } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import GlobalOnboardingWizard from '@/components/GlobalOnboarding';
import Dashboard from './dashboard/Dashboard';
import Inventory from './inventory/Inventory';
import Orders from './orders/Orders';
import Services from './services/Services';
import ReportsView from './reports/ReportsView';
import { useBusinessStore } from '@/store/business-store';
import { motion, AnimatePresence } from 'framer-motion';

// Lazy-loaded tool pages
const ShippingLabelTool = lazy(() => import('@/app/tools/shipping-label/ClientWrapper'));
const PackingSlipTool = lazy(() => import('@/app/tools/packing-slip/ClientWrapper'));
const InvoiceTool = lazy(() => import('@/app/tools/invoice-generator/ClientWrapper'));
const WhatsAppTool = lazy(() => import('@/app/tools/whatsapp-manager/ClientWrapper'));
const SeoTool = lazy(() => import('@/app/tools/seo-generator/ClientWrapper'));
const LinkInBioTool = lazy(() => import('@/app/tools/link-in-bio/ClientWrapper'));
const BackgroundRemoverTool = lazy(() => import('@/app/tools/background-remover/ClientWrapper'));
const ImageCompressorTool = lazy(() => import('@/app/tools/image-compressor/ClientWrapper'));

import { API_URL, safeFetch } from '@/lib/api-client';

export default function ZipSellixClient({ isMobile = false }: { isMobile?: boolean }) {
    const store = useBusinessStore();
    const onboardingComplete = store.isOnboardingComplete();
    const [showOnboarding, setShowOnboarding] = useState(false);

    const [activeTab, setActiveTab] = useState('dashboard');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const [data, setData] = useState<any>({
        summary: { todaySales: 0, monthProfit: 0, totalExpenses: 0, netProfit: 0, totalOrders: 0, lowStockCount: 0, stockValue: 0 },
        chart: [],
        orders: []
    });
    const [products, setProducts] = useState<any[]>([]);
    const [batches, setBatches] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);

    // 👇 ADDED: State to properly track business setup info from the API
    const [setupInfo, setSetupInfo] = useState<any>({
        businessType: 'STOCK',
        businessName: '',
        settings: { couriers: [], courierRates: [], packagingCost: 0 }
    });

    useEffect(() => {
        const init = async () => {
            if (!onboardingComplete) {
                setShowOnboarding(true);
            }
            await store.loadProfile();
            await loadDashboard();
        };
        init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadDashboard = async () => {
        try {
            const [d, p, b, s, profileInfo] = await Promise.all([
                safeFetch<any>(`${API_URL}/api/analytics`),
                safeFetch<any[]>(`${API_URL}/api/inventory/products`),
                safeFetch<any[]>(`${API_URL}/api/inventory/batches`),
                safeFetch<any[]>(`${API_URL}/api/services`),
                // Fetch the actual profile from DB to get the true businessType
                safeFetch<any>(`${API_URL}/api/profile`)
            ]);

            if (d?.summary) setData(d);
            if (Array.isArray(p)) setProducts(p);
            if (Array.isArray(b)) setBatches(b);
            if (Array.isArray(s)) setServices(s);

            // Update setupInfo with REAL database data or fallback to store
            const latestStore = useBusinessStore.getState();
            setSetupInfo({
                businessType: latestStore.businessInfo?.businessType || profileInfo?.businessType || 'STOCK',
                businessName: latestStore.businessInfo?.businessName || profileInfo?.businessName || '',
                settings: {
                    couriers: latestStore.couriers.map(c => c.courierName),
                    courierRates: latestStore.couriers.map(c => ({
                        name: c.courierName,
                        sameCity: c.sameCity,
                        sameProv: c.sameProvince,
                        crossProv: c.crossProvince,
                        kg: c.extraKg,
                    })),
                    packagingCost: latestStore.expenses.packagingCost,
                }
            });

        } catch (e) {
            console.error("Failed to load dashboard data:", e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-semibold animate-pulse">Loading ZipSellix...</div>;

    return (
        <>
            {showOnboarding && (
                <GlobalOnboardingWizard onComplete={() => { setShowOnboarding(false); loadDashboard(); }} />
            )}

            <div className="flex h-[100dvh] bg-slate-50 font-sans text-slate-800">
                {/* 👇 FIXED: businessType is now dynamically passed from the verified state */}
                <Sidebar
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    businessType={setupInfo.businessType}
                    isMobileOpen={mobileMenuOpen}
                    onMobileClose={() => setMobileMenuOpen(false)}
                />

                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    <Header activeTab={activeTab} businessName={setupInfo.businessName} onMenuToggle={() => setMobileMenuOpen(true)} />

                    <main className="flex-1 overflow-y-auto">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3, ease: 'easeOut' }}
                                className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 w-full"
                            >
                                {activeTab === 'dashboard' && <Dashboard data={data} products={products} setActiveTab={setActiveTab} isMobile={isMobile} />}
                                {activeTab === 'inventory' && <Inventory products={products} batches={batches} summary={data.summary} refreshData={loadDashboard} />}
                                {activeTab === 'services' && <Services services={services} refreshData={loadDashboard} />}
                                {activeTab === 'orders' && (
                                    <Orders
                                        products={products}
                                        services={services}
                                        orders={data.orders}
                                        totalOrders={data.summary.totalOrders}
                                        settings={setupInfo.settings}
                                        businessType={setupInfo.businessType} // Passes to Orders modal
                                        refreshData={loadDashboard}
                                    />
                                )}

                                {activeTab === 'reports' && (
                                    <ReportsView
                                        isPro={true}
                                        businessType={setupInfo.businessType}
                                    />
                                )}

                                <Suspense fallback={<div className="flex items-center justify-center py-20 text-text-muted-light font-medium animate-pulse">Loading tool...</div>}>
                                    {activeTab === 'tool-shipping-label' && <ShippingLabelTool isMobile={isMobile} />}
                                    {activeTab === 'tool-packing-slip' && <PackingSlipTool isMobile={isMobile} />}
                                    {activeTab === 'tool-invoice' && <InvoiceTool isMobile={isMobile} />}
                                    {activeTab === 'tool-whatsapp' && <WhatsAppTool isMobile={isMobile} />}
                                    {activeTab === 'tool-seo' && <SeoTool isMobile={isMobile} />}
                                    {activeTab === 'tool-link-in-bio' && <LinkInBioTool isMobile={isMobile} />}
                                    {activeTab === 'tool-bg-remover' && <BackgroundRemoverTool isMobile={isMobile} />}
                                    {activeTab === 'tool-img-compressor' && <ImageCompressorTool isMobile={isMobile} />}
                                </Suspense>
                            </motion.div>
                        </AnimatePresence>
                    </main>
                </div>
            </div>
        </>
    );
}