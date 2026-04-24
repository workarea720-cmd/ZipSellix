"use client";
import React, { useEffect } from 'react';
import {
    LayoutDashboard, ShoppingCart, Package, Info, Wrench,
    Truck, FileText, Receipt, MessageCircle, Search,
    Link, Eraser, ImageDown, PanelLeftClose, PanelLeftOpen, X,
    PieChart, Moon, Sun
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    businessType?: string;
    isMobileOpen?: boolean;
    onMobileClose?: () => void;
}

const toolItems = [
    { id: 'tool-invoice', label: 'Invoice Generator', icon: Receipt },
    { id: 'tool-packing-slip', label: 'Packaging Slip', icon: FileText },
    { id: 'tool-shipping-label', label: 'Shipping Label', icon: Truck },
    { id: 'tool-seo', label: 'SEO Generator', icon: Search },
    { id: 'tool-link-in-bio', label: 'WhatsApp Store', icon: Link },
    { id: 'tool-whatsapp', label: 'WhatsApp Manager', icon: MessageCircle },
    { id: 'tool-bg-remover', label: 'Background Remover', icon: Eraser },
    { id: 'tool-img-compressor', label: 'Image Compressor', icon: ImageDown },
];

export default function Sidebar({ activeTab, setActiveTab, businessType = 'STOCK', isMobileOpen = false, onMobileClose }: SidebarProps) {
    const [collapsed, setCollapsed] = React.useState(false);
    const isService = businessType === 'SERVICE' || businessType?.toUpperCase() === 'SERVICE';

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isMobileOpen) onMobileClose?.();
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [isMobileOpen, onMobileClose]);

    useEffect(() => {
        if (isMobileOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }, [isMobileOpen]);

    const mainItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'orders', label: 'Orders', icon: ShoppingCart },
    ];

    if (isService) {
        mainItems.push({ id: 'services', label: 'Services', icon: Wrench });
    } else {
        mainItems.push({ id: 'inventory', label: 'Inventory', icon: Package });
    }

    mainItems.push({ id: 'reports', label: 'Reports', icon: PieChart });

    const handleTabClick = (tabId: string) => {
        setActiveTab(tabId);
        if (isMobileOpen) onMobileClose?.();
    };

    const renderButton = (item: { id: string; label: string; icon: React.ElementType }, isToolItem = false, isMobile = false) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        const showLabel = isMobile || !collapsed;

        return (
            <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                title={!showLabel ? item.label : undefined}
                className={`
                    group relative w-full flex items-center overflow-hidden shrink-0
                    ${!showLabel ? 'justify-center px-0 py-3' : 'px-3 py-2.5'}
                    ${isToolItem && showLabel ? 'gap-2.5' : 'gap-3'}
                    rounded-xl text-[13px] font-bold transition-all duration-200 active:scale-[0.97]
                    ${isActive ? 'text-[#20A46B]' : 'text-[#304250]/70 hover:text-[#304250]'}
                `}
            >
                {isActive && showLabel && (
                    <motion.div
                        layoutId="sidebarActiveBg"
                        className="absolute inset-0 bg-[#20A46B]/5 ring-1 ring-[#20A46B]/10 rounded-xl"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                )}

                <div className={`
                    flex items-center justify-center flex-shrink-0 rounded-lg relative z-10 transition-all duration-300
                    ${!showLabel ? 'w-10 h-10' : 'w-8 h-8'}
                    ${isActive
                        ? 'bg-[#20A46B] text-white shadow-md shadow-[#20A46B]/20'
                        : 'bg-[#304250]/5 text-[#304250]/40 group-hover:bg-[#304250]/10 group-hover:text-[#304250] group-hover:scale-105'
                    }
                `}>
                    <Icon size={!showLabel ? 18 : 16} strokeWidth={2.5} />
                </div>

                {showLabel && (
                    <span className="whitespace-nowrap overflow-hidden text-ellipsis relative z-10 transition-transform duration-200 group-hover:translate-x-0.5">
                        {item.label}
                    </span>
                )}

                {isActive && (
                    <motion.div
                        layoutId="sidebarActiveIndicator"
                        className="absolute left-0 top-2 bottom-2 w-[3px] bg-[#20A46B] rounded-r-full shadow-[1px_0_4px_rgba(32,164,107,0.4)]"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                )}
            </button>
        );
    };

    const sidebarContent = (isMobile: boolean) => (
        <div className={`flex-1 overflow-y-auto py-6 no-scrollbar ${!isMobile && collapsed ? 'px-2' : 'px-4 md:px-5'} transition-all duration-300`}>
            {/* Main Navigation */}
            <nav className="space-y-1 flex flex-col pb-2">
                {mainItems.map((item) => renderButton(item, false, isMobile))}
            </nav>

            {/* Divider + Section Label using Yellow Accent */}
            <div className="my-8 relative shrink-0">
                <div className="border-t border-[#304250]/5" />
                {(isMobile || !collapsed) && (
                    <span className="absolute -top-2 left-4 bg-white px-2 text-[9px] font-black text-[#EEBE1C] uppercase tracking-[0.15em]">
                        All Tools
                    </span>
                )}
            </div>

            {/* Tools */}
            <nav className="space-y-1 flex flex-col pb-10">
                {toolItems.map((item) => renderButton(item, true, isMobile))}
            </nav>
        </div>
    );

    return (
        <>
            {/* ===== DESKTOP SIDEBAR ===== */}
            <motion.aside
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={`
                    bg-white border-r border-[#304250]/10 hidden md:flex flex-col h-full
                    transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
                    ${collapsed ? 'w-[80px] overflow-hidden' : 'w-[280px]'}
                `}
                style={{ boxShadow: '1px 0 15px rgba(48,66,80,0.02)' }}
            >
                {/* Logo Section */}
                <div className={`flex items-center flex-shrink-0 h-24 border-b border-[#304250]/5 ${collapsed ? 'justify-center px-0' : 'px-8'}`}>
                    {!collapsed ? (
                        <div className="flex items-center w-full animate-in fade-in slide-in-from-left-4 duration-500">
                            <img src="/wordmark-logo.svg" alt="ZipSellix" className="h-12 w-auto block" />
                        </div>
                    ) : (
                        <div className="w-11 h-11 border border-[#304250]/10 rounded-xl bg-white flex items-center justify-center shrink-0 animate-in zoom-in-95 shadow-sm overflow-hidden p-1.5">
                            <img src="/z-monogram.png" alt="Z" className="w-full h-full object-contain" />
                        </div>
                    )}
                </div>

                {sidebarContent(false)}

                {/* Desktop Collapse Toggle */}
                <div className={`border-t border-[#304250]/5 flex-shrink-0 p-4 bg-white flex flex-col gap-2 ${collapsed ? 'items-center' : ''}`}>
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className={`
                            flex items-center gap-3 w-full rounded-xl text-[11px] font-black uppercase tracking-wider
                            text-[#304250]/40 hover:text-[#304250] hover:bg-gray-50
                            transition-all duration-200
                            ${collapsed ? 'justify-center p-3' : 'px-4 py-3'}
                        `}
                        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {collapsed
                            ? <PanelLeftOpen size={20} />
                            : <><PanelLeftClose size={18} /><span>Collapse</span></>
                        }
                    </button>
                </div>
            </motion.aside>

            {/* ===== MOBILE DRAWER OVERLAY ===== */}
            <div className={`fixed inset-0 z-[100] md:hidden transition-opacity duration-300 ${isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                {/* Backdrop */}
                <div className="absolute inset-0 bg-[#304250]/40 backdrop-blur-sm" onClick={onMobileClose} />

                {/* Drawer Panel */}
                <aside
                    className={`
                        absolute top-0 left-0 h-[100dvh] w-[280px] bg-white shadow-2xl
                        flex flex-col overflow-hidden transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
                        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
                    `}
                >
                    <div className="flex items-center justify-between px-6 h-[80px] shrink-0 border-b border-[#304250]/5 bg-white">
                        <img src="/wordmark-logo.svg" alt="ZipSellix" className="h-10 w-auto" />
                        <button onClick={onMobileClose} className="p-2.5 rounded-xl text-[#304250]/40 hover:text-[#304250] hover:bg-gray-100 transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    {sidebarContent(true)}
                </aside>
            </div>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </>
    );
}