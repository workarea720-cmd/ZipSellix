"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Menu, Settings, LogOut, ChevronDown, Bell, AlertCircle } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useBusinessStore } from '@/store/business-store';
import { motion, AnimatePresence } from 'framer-motion';

// 👇 FIX: SupportModal import kiya gaya hai
import SupportModal from '@/components/Support/Support';

interface HeaderProps {
    activeTab: string;
    businessName: string;
    onMenuToggle?: () => void;
}

export default function Header({ activeTab, businessName, onMenuToggle }: HeaderProps) {
    const [open, setOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [isSupportOpen, setIsSupportOpen] = useState(false); // 👈 FIX: Support Modal state

    const ref = useRef<HTMLDivElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const store = useBusinessStore();

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const [notifications, setNotifications] = useState<any[]>([]);
    const [expandedNotifId, setExpandedNotifId] = useState<string | number | null>(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleNotificationClick = (notif: any) => {
        setExpandedNotifId(expandedNotifId === notif.id ? null : notif.id);
        if (!notif.read) {
            setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
        }
    };

    const headerContent: Record<string, { title: string; subtitle: string }> = {
        dashboard: { title: 'Dashboard', subtitle: 'Overview of your business performance.' },
        orders: { title: 'Order Management', subtitle: 'Track and manage your customer orders.' },
        inventory: { title: 'Inventory', subtitle: 'Manage stock levels and batches.' },
        services: { title: 'Services Catalog', subtitle: 'Manage your made-to-order products and costs.' },
        'tool-shipping-label': { title: 'Shipping Label', subtitle: 'Generate and print shipping labels.' },
        'tool-packing-slip': { title: 'Packing Slip', subtitle: 'Create packing slips for your orders.' },
        'tool-invoice': { title: 'Invoice Generator', subtitle: 'Generate professional invoices.' },
        'tool-whatsapp': { title: 'WhatsApp Manager', subtitle: 'Manage customer communication via WhatsApp.' },
        'tool-seo': { title: 'SEO Generator', subtitle: 'Generate SEO-optimized product descriptions.' },
        'tool-link-in-bio': { title: 'WhatsApp Store Builder', subtitle: 'Build your mini WhatsApp store in minutes.' },
        'tool-bg-remover': { title: 'Background Remover', subtitle: 'Remove backgrounds from product images instantly.' },
        'tool-img-compressor': { title: 'Image Compressor', subtitle: 'Compress and optimize your product images.' },
    };

    const current = headerContent[activeTab] || { title: 'ZipSellix', subtitle: '' };
    const avatarLetter = (businessName || store.account.name || 'U').charAt(0).toUpperCase();
    const displayName = store.account.name || businessName || 'My Account';
    const displayEmail = store.account.email || '';

    return (
        <>
            <motion.header initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }} className="bg-white/90 backdrop-blur-xl border-b border-[#304250]/10 px-4 py-3 md:px-8 md:py-5 flex items-center gap-2 sm:gap-3 sticky top-0 z-50 min-h-[56px] md:h-24 shadow-sm">
                {/* Mobile hamburger */}
                <button onClick={onMenuToggle} className="md:hidden p-2 -ml-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#304250]/60 hover:bg-gray-100 hover:text-[#20A46B] transition-colors" aria-label="Open menu">
                    <Menu size={22} />
                </button>

                {/* Title */}
                <div className="min-w-0 flex-1 animate-in slide-in-from-left-4 fade-in duration-500">
                    <h1 className="text-[19px] sm:text-xl md:text-2xl font-black text-[#304250] tracking-tight truncate leading-none">{current.title}</h1>
                    <p className="hidden md:block text-xs text-[#304250]/50 mt-1 font-extrabold uppercase tracking-widest truncate">{current.subtitle}</p>
                </div>

                <div className="flex items-center gap-1 sm:gap-4 ml-auto">

                    {/* Notification Bell (Size Reduced for Mobile) */}
                    <div className="relative flex items-center" ref={notifRef}>
                        <button
                            onClick={() => setNotifOpen(!notifOpen)}
                            className="relative p-1.5 sm:p-2.5 text-[#304250]/40 hover:text-[#20A46B] hover:bg-[#20A46B]/5 rounded-full transition-colors duration-200"
                        >
                            <Bell className="w-[18px] h-[18px] sm:w-5 sm:h-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EEBE1C] opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-[#EEBE1C] border border-white"></span>
                                </span>
                            )}
                        </button>

                        <AnimatePresence>
                            {notifOpen && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                    className="absolute -right-12 sm:right-0 top-full mt-3 w-64 sm:w-80 bg-white rounded-[24px] border border-[#304250]/10 shadow-[0_20px_60px_rgba(48,66,80,0.15)] z-[100] overflow-hidden transform origin-top-right"
                                >
                                    <div className="p-4 border-b border-[#304250]/5 flex items-center justify-between bg-gray-50/50">
                                        <h3 className="text-[13px] sm:text-sm font-black text-[#304250]">Notifications</h3>
                                        {unreadCount > 0 && (
                                            <span className="bg-[#EEBE1C] text-[#304250] text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md shadow-sm">
                                                {unreadCount} New
                                            </span>
                                        )}
                                    </div>
                                    <div className="max-h-[50vh] sm:max-h-80 overflow-y-auto custom-scrollbar">
                                        {notifications.length > 0 ? (
                                            notifications.map((notif) => (
                                                <div key={notif.id} onClick={() => handleNotificationClick(notif)} className={`p-4 border-b last:border-0 border-[#304250]/5 hover:bg-gray-50 transition-colors cursor-pointer ${!notif.read ? 'bg-[#20A46B]/5' : ''}`}>
                                                    <div className="flex gap-3">
                                                        <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mt-1.5 flex-shrink-0 ${!notif.read ? 'bg-[#20A46B]' : 'bg-transparent'}`} />
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-[12px] sm:text-[13px] leading-tight truncate ${!notif.read ? 'font-black text-[#304250]' : 'font-bold text-[#304250]/60'}`}>{notif.title}</p>
                                                            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#304250]/40 mt-1">{notif.time}</p>
                                                        </div>
                                                    </div>
                                                    {expandedNotifId === notif.id && (
                                                        <div className="mt-3 pl-5 text-[11px] text-[#304250]/70 font-medium leading-relaxed border-t border-[#304250]/5 pt-3 animate-in flex-col fade-in duration-200">
                                                            {notif.description || 'No additional details provided.'}
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-6 sm:p-8 flex flex-col items-center justify-center text-center">
                                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3 border border-[#304250]/5 shadow-sm">
                                                    <Bell size={16} className="text-[#304250]/20" />
                                                </div>
                                                <p className="text-[12px] sm:text-[13px] font-black text-[#304250]/50">No new notifications</p>
                                                <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#304250]/30 mt-1">You're all caught up!</p>
                                            </div>
                                        )}
                                    </div>
                                    {notifications.length > 0 && (
                                        <div className="p-2 border-t border-[#304250]/10 bg-gray-50">
                                            <button onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))} className="w-full py-2.5 text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-[#20A46B] hover:bg-[#20A46B]/10 rounded-xl transition-colors">
                                                Mark all as read
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* User Avatar Dropdown (Size Reduced for Mobile) */}
                    <div className="relative flex-shrink-0 flex items-center" ref={ref}>
                        <button onClick={() => setOpen(!open)}
                            className="group flex items-center gap-1.5 sm:gap-2 hover:bg-[#20A46B]/5 p-1 sm:p-1.5 pr-2 sm:pr-3 rounded-full transition-colors border border-transparent hover:border-[#20A46B]/20 cursor-pointer outline-none"
                        >
                            <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full bg-[#20A46B] flex items-center justify-center text-white font-black text-[11px] sm:text-sm md:text-base shadow-[0_4px_14px_rgba(32,164,107,0.3)] transition-transform duration-300">
                                {store.account.avatar
                                    ? <img src={store.account.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                                    : avatarLetter
                                }
                            </div>
                            <ChevronDown className={`w-[14px] h-[14px] sm:w-4 sm:h-4 text-[#304250]/40 transition-transform duration-300 ${open ? 'rotate-180 text-[#20A46B]' : 'group-hover:text-[#20A46B]'}`} />
                        </button>

                        <AnimatePresence>
                            {open && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                    className="absolute right-0 top-full mt-3 w-[220px] sm:w-[240px] md:w-64 bg-white rounded-[24px] border border-[#304250]/10 shadow-[0_20px_60px_rgba(48,66,80,0.15)] z-[100] overflow-hidden transform origin-top-right"
                                >
                                    {/* User Info */}
                                    <div className="p-4 flex items-center gap-3 bg-gray-50/50">
                                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#20A46B]/10 flex items-center justify-center text-[#20A46B] border border-[#20A46B]/20 font-black text-[11px] sm:text-sm flex-shrink-0 shadow-sm">
                                            {store.account.avatar
                                                ? <img src={store.account.avatar} alt="" className="w-full h-full rounded-xl object-cover" />
                                                : avatarLetter
                                            }
                                        </div>
                                        <div className="min-w-0 pt-0.5">
                                            <p className="text-[12px] sm:text-[13px] font-black text-[#304250] truncate">{displayName}</p>
                                            {displayEmail && <p className="text-[9px] sm:text-[10px] font-bold text-[#304250]/50 truncate">{displayEmail}</p>}
                                        </div>
                                    </div>

                                    <div className="border-b border-[#304250]/5" />

                                    {/* Menu Items */}
                                    <div className="p-2 space-y-1">
                                        <button
                                            onClick={() => { setOpen(false); router.push('/settings'); }}
                                            className="w-full flex items-center gap-2.5 px-3 py-3 text-[12px] sm:text-[13px] font-extrabold text-[#304250]/70 hover:text-[#20A46B] hover:bg-[#20A46B]/5 rounded-xl transition-all duration-200 active:scale-[0.98] group outline-none">
                                            <Settings size={16} className="text-[#304250]/30 group-hover:text-[#20A46B] transition-colors" />
                                            Profile & Settings
                                        </button>

                                        {/* 👇 FIX: NAYA REPORT AN ISSUE BUTTON YAHAN ADD KIYA GAYA HAI 👇 */}
                                        <button
                                            onClick={() => { setOpen(false); setIsSupportOpen(true); }}
                                            className="w-full flex items-center gap-2.5 px-3 py-3 text-[12px] sm:text-[13px] font-extrabold text-[#304250] hover:bg-[#EEBE1C]/10 rounded-xl transition-all duration-200 active:scale-[0.98] group outline-none">
                                            <AlertCircle size={16} className="text-[#EEBE1C] transition-colors" />
                                            Report an Issue
                                        </button>

                                        <button
                                            onClick={() => { setOpen(false); store.resetStore(); signOut({ callbackUrl: '/login' }); }}
                                            className="w-full flex items-center gap-2.5 px-3 py-3 text-[12px] sm:text-[13px] font-extrabold text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 active:scale-[0.98] group outline-none mt-1">
                                            <LogOut size={16} className="text-red-400 group-hover:text-red-500 transition-colors" />
                                            Log Out
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.header>

            {/* 👇 FIX: Render Support Modal */}
            {isSupportOpen && <SupportModal onClose={() => setIsSupportOpen(false)} />}
        </>
    );
}