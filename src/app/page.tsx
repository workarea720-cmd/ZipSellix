'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import {
    Box, AlertCircle, TrendingDown, Edit3, PieChart,
    Calculator, FileCheck, Banknote, Shield, ShieldCheck,
    Package, UserX, ChevronDown, CheckCircle2, Star,
    ArrowRight, Menu, X, ShoppingCart, Truck, Smartphone,
    FileText, RefreshCcw, ClipboardList
} from 'lucide-react';

// ==========================================
// 🎨 ANIMATION VARIANTS
// ==========================================
const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15 }
    }
};

// ==========================================
// 🧩 SUB-COMPONENTS
// ==========================================

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-card-bg/80 backdrop-blur-md border-b border-card-border transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center">
                    <img src="/wordmark-logo.svg" alt="ZipSellix" className="h-8 w-auto" />
                </div>

                <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-text-muted">
                    <Link href="#features" className="hover:text-brand-primary transition-colors">Features</Link>
                    <Link href="#roi" className="hover:text-brand-primary transition-colors">Calculator</Link>
                    <Link href="/pricing" className="hover:text-brand-primary transition-colors">Pricing</Link>
                    <Link href="#faq" className="hover:text-brand-primary transition-colors">FAQs</Link>
                </nav>

                <div className="hidden md:flex items-center gap-4">
                    <Link href="/login" className="text-sm font-bold text-text-muted hover:text-brand-heading transition-colors px-4 py-2">
                        Log in
                    </Link>
                    <Link href="/signup" className="text-sm font-bold bg-[#20A46B] hover:bg-[#1a8557] text-white px-5 py-2.5 rounded-xl shadow-[0_4px_14px_rgba(32,164,107,0.3)] hover:-translate-y-0.5 transition-all">
                        Start Free
                    </Link>
                </div>

                <button className="md:hidden p-2 text-text-muted" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {isOpen && (
                <div className="md:hidden absolute top-16 left-0 w-full bg-card-bg border-b border-card-border p-4 flex flex-col gap-3 shadow-xl">
                    <Link href="#features" onClick={() => setIsOpen(false)} className="text-sm font-bold text-text-muted py-2 hover:text-brand-primary">Features</Link>
                    <Link href="#roi" onClick={() => setIsOpen(false)} className="text-sm font-bold text-text-muted py-2 hover:text-brand-primary">Calculator</Link>
                    <Link href="/pricing" onClick={() => setIsOpen(false)} className="text-sm font-bold text-text-muted py-2 hover:text-brand-primary">Pricing</Link>
                    <Link href="#faq" onClick={() => setIsOpen(false)} className="text-sm font-bold text-text-muted py-2 hover:text-brand-primary">FAQs</Link>
                    <div className="h-px bg-bg-muted my-2"></div>
                    <Link href="/login" className="text-center text-sm font-bold text-text-muted py-3 bg-bg-subtle rounded-xl">Log in</Link>
                    <Link href="/signup" className="text-center text-sm font-bold bg-[#20A46B] text-white py-3 rounded-xl shadow-lg shadow-[#20A46B]/20">Start Free Account</Link>
                </div>
            )}
        </header>
    );
};

const ROISlider = () => {
    const [parcels, setParcels] = useState<number>(50);

    const timeSaved = ((parcels * 3) / 60).toFixed(1);
    const rtoLossPrevented = Math.round(parcels * 0.15 * 300).toLocaleString();

    return (
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} id="roi" className="py-24 px-4 sm:px-6 lg:px-8 bg-card-bg border-y border-card-border">
            <div className="max-w-4xl mx-auto bg-bg-subtle rounded-[2rem] border border-card-border p-8 sm:p-12 shadow-sm text-center">
                <h2 className="text-3xl font-extrabold text-[#304250] tracking-tight mb-2">See your daily ROI.</h2>
                <p className="text-text-muted font-medium mb-10">Automation pays for itself on day one.</p>

                <div className="mb-10">
                    <label className="block text-sm font-bold text-text-main uppercase tracking-wide mb-6">
                        How many parcels do you ship daily? <span className="text-[#20A46B] text-xl ml-2">{parcels}</span>
                    </label>
                    <input
                        type="range"
                        min="10" max="500" step="10"
                        value={parcels}
                        onChange={(e) => setParcels(Number(e.target.value))}
                        className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#20A46B]"
                    />
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                    <div className="bg-card-bg p-6 rounded-2xl border border-card-border shadow-sm flex flex-col items-center justify-center transition-all">
                        <span className="text-text-muted text-sm font-bold mb-2">Manual Time Saved (Daily)</span>
                        <span className="text-4xl font-black text-[#304250]">{timeSaved} <span className="text-xl text-[#20A46B]">hours</span></span>
                    </div>
                    <div className="bg-card-bg p-6 rounded-2xl border border-card-border shadow-sm flex flex-col items-center justify-center transition-all">
                        <span className="text-text-muted text-sm font-bold mb-2">RTO Loss Prevented (Daily)</span>
                        <span className="text-4xl font-black text-[#20A46B]">Rs. {rtoLossPrevented}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const FAQ = () => {
    const faqs = [
        { q: "Do I need to be FBR registered?", a: "No, ZipSellix is built for everyone from small WhatsApp sellers to large established brands. You can start optimizing your COD workflow immediately without any tax documentation." },
        { q: "Is my data safe?", a: "Yes, 100% secure. We use end-to-end bank-grade encryption. We never share, sell, or analyze your product data, customer lists, or sales numbers for third parties." },
        { q: "Is it really free?", a: "Yes! Our core Phase 1 tools (Profit Calculator, Invoice Generator, and basic Label Printing) are free forever to help you grow. We only charge for advanced high-volume automation features later on." }
    ];

    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} id="faq" className="py-24 px-4 sm:px-6 lg:px-8 bg-bg-subtle">
            <div className="max-w-3xl mx-auto">
                <motion.h2 variants={fadeUp} className="text-3xl font-extrabold text-[#304250] tracking-tight text-center mb-12">Frequently Asked Questions</motion.h2>
                <div className="space-y-4">
                    {faqs.map((faq, i) => (
                        <motion.div key={i} variants={fadeUp} className="bg-card-bg border border-card-border rounded-2xl overflow-hidden transition-all hover:border-[#20A46B]/30 shadow-sm">
                            <button
                                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                            >
                                <span className="font-bold text-[#304250] text-lg">{faq.q}</span>
                                <ChevronDown className={`text-[#20A46B] transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`} />
                            </button>
                            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === i ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                                <p className="px-6 pb-6 text-text-muted font-medium leading-relaxed">{faq.a}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.section>
    );
};

// ==========================================
// 🚀 MAIN PAGE COMPONENT
// ==========================================

export default function Home() {
    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }} className="min-h-screen bg-[#f8fafc] font-sans text-brand-heading selection:bg-brand-primary-light selection:text-[#20A46B] overflow-x-hidden">
            <Header />

            {/* 2. HERO SECTION */}
            <section className="pt-24 pb-16 lg:pt-28 lg:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

                    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="lg:pr-8 z-10">
                        <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-5xl font-extrabold text-[#304250] leading-[1.2] tracking-tight mb-5">
                            Run Your E-Commerce <br className="hidden lg:block" /> Operations Smarter
                        </motion.h1>

                        <motion.p variants={fadeUp} className="text-lg text-text-muted mb-8 font-medium leading-relaxed max-w-lg">
                            Invoices, labels, calculators, content and more. <br className="hidden sm:block" /> All in one place.
                        </motion.p>

                        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 mb-4">
                            <Link href="/signup" className="flex items-center justify-center bg-[#20A46B] hover:bg-[#1a8557] text-white px-8 py-3.5 rounded-xl font-bold text-lg transition-all shadow-[0_8px_20px_rgba(32,164,107,0.3)] hover:-translate-y-0.5">
                                Start Free
                            </Link>
                            <Link href="/pricing" className="flex items-center justify-center bg-bg-muted hover:bg-slate-200 text-[#304250] px-8 py-3.5 rounded-xl font-bold text-lg transition-all">
                                View Plans
                            </Link>
                        </motion.div>

                        <motion.p variants={fadeUp} className="text-sm text-text-muted-light font-medium">
                            No card required. Upgrade anytime.
                        </motion.p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative w-full max-w-[600px] aspect-[4/3] mx-auto lg:mx-0 lg:ml-auto perspective-1000 mt-8 lg:mt-0"
                    >
                        <div className="absolute inset-0 bg-[#20A46B]/10 rounded-[3rem] transform -rotate-3 scale-105 -z-10"></div>
                        <div className="absolute inset-4 bg-teal-50/50 rounded-[3rem] transform rotate-2 scale-105 -z-10 blur-md"></div>

                        <div className="absolute top-0 left-12 right-0 h-64 bg-card-bg/80 backdrop-blur-md border border-card-border rounded-t-2xl shadow-sm">
                            <div className="flex gap-1.5 p-4 border-b border-card-border-subtle">
                                <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                            </div>
                        </div>

                        <motion.div
                            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, duration: 0.6 }}
                            className="absolute top-16 -left-4 right-8 flex gap-3 z-10 flex-wrap"
                        >
                            <div className="bg-card-bg px-4 py-2.5 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-card-border-subtle flex items-center gap-2 text-sm font-bold text-text-main">
                                <FileText size={16} className="text-[#20A46B]" /> Invoice
                            </div>
                            <div className="bg-card-bg px-4 py-2.5 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-card-border-subtle flex items-center gap-2 text-sm font-bold text-[#304250]">
                                <Calculator size={16} /> Calc
                            </div>
                            <div className="bg-card-bg px-4 py-2.5 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-card-border-subtle flex items-center gap-2 text-sm font-black text-red-600 italic tracking-tighter">
                                TCS
                            </div>
                            <div className="bg-card-bg px-4 py-2.5 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-card-border-subtle flex items-center gap-2 text-sm font-black text-[#304250] italic tracking-tighter">
                                TRAX
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7, duration: 0.6 }}
                            className="absolute top-32 left-4 right-10 bg-card-bg rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-card-border p-5 z-20"
                        >
                            <div className="flex items-center gap-2 mb-5">
                                <div className="bg-[#304250] w-8 h-8 rounded-lg flex items-center justify-center shadow-inner">
                                    <Package size={18} className="text-white" />
                                </div>
                                <span className="text-xl font-black text-[#304250] tracking-tight">PostEx</span>
                                <div className="ml-auto flex gap-2">
                                    <div className="w-10 h-2 bg-bg-muted rounded-full"></div>
                                    <div className="w-6 h-2 bg-bg-muted rounded-full"></div>
                                </div>
                            </div>

                            <div className="border border-slate-300 rounded-xl p-4 relative overflow-hidden">
                                <div className="absolute top-0 right-0 bg-bg-muted text-[8px] font-bold text-text-muted-light px-2 py-1 rounded-bl-lg">Origin and Routing labels</div>

                                <div className="flex justify-between items-start border-b border-card-border-subtle pb-3 mb-3 pt-2">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-black text-lg text-[#304250] tracking-tight">Sam</span>
                                            <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">COD</span>
                                        </div>
                                        <div className="text-[10px] text-text-muted-light font-medium">0300-1234567</div>
                                        <div className="text-[10px] text-text-muted-light font-medium mt-0.5">123 Business Road, Lahore</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[9px] font-bold text-text-muted-light uppercase tracking-widest">Amount</div>
                                        <div className="text-lg font-black text-[#304250] mt-0.5">Rs. 4,500</div>
                                    </div>
                                </div>

                                <div className="flex justify-center items-end h-12 gap-[2px] opacity-85 mb-1 w-full">
                                    {[2, 4, 2, 1, 3, 1, 1, 4, 2, 3, 1, 2, 2, 4, 1, 3, 2, 1, 1, 4, 2, 3, 2, 1, 3, 4, 1].map((w, i) => (
                                        <div key={i} className="bg-[#304250] h-full rounded-[1px]" style={{ width: `${w * 2.5}px` }}></div>
                                    ))}
                                </div>
                                <p className="text-center text-[9px] font-mono text-text-muted tracking-[0.2em] mt-1">PEX-01234567890</p>
                            </div>
                        </motion.div>

                        <motion.div animate={{ y: [-8, 8, -8] }} transition={{ repeat: Infinity, duration: 4 }} className="absolute top-28 -left-6 bg-card-bg w-12 h-12 rounded-xl shadow-xl border border-card-border-subtle flex items-center justify-center z-30">
                            <RefreshCcw size={20} className="text-[#304250]" />
                        </motion.div>
                        <motion.div animate={{ y: [8, -8, 8] }} transition={{ repeat: Infinity, duration: 5 }} className="absolute bottom-10 -right-2 bg-card-bg w-12 h-12 rounded-xl shadow-xl border border-card-border-subtle flex items-center justify-center z-30">
                            <CheckCircle2 size={24} className="text-[#20A46B]" />
                        </motion.div>
                        <motion.div animate={{ y: [-5, 10, -5] }} transition={{ repeat: Infinity, duration: 3.5 }} className="absolute top-48 right-0 bg-card-bg w-10 h-10 rounded-xl shadow-xl border border-card-border-subtle flex items-center justify-center z-30">
                            <ClipboardList size={18} className="text-[#EEBE1C]" />
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* 3. INTEGRATIONS BANNER */}
            <section className="py-12 border-y border-card-border bg-card-bg overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted-light mb-8">
                        Optimized for your workflow
                    </p>
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-14 lg:gap-20">
                        <div className="flex items-center gap-2.5 font-bold text-[1.1rem] text-text-muted-light hover:text-text-main transition-colors cursor-default">
                            <ShoppingCart strokeWidth={2.5} size={22} /> Shopify
                        </div>
                        <div className="flex items-center gap-2.5 font-bold text-[1.1rem] text-text-muted-light hover:text-text-main transition-colors cursor-default">
                            <Box strokeWidth={2.5} size={22} /> WooCommerce
                        </div>
                        <div className="flex items-center gap-2.5 font-bold text-[1.1rem] text-text-muted-light hover:text-text-main transition-colors cursor-default">
                            <Smartphone strokeWidth={2.5} size={22} /> WhatsApp
                        </div>
                        <div className="flex items-center gap-2.5 font-bold text-[1.1rem] text-text-muted-light hover:text-text-main transition-colors cursor-default">
                            <Truck strokeWidth={2.5} size={22} /> TCS & Leopards
                        </div>
                        <div className="flex items-center gap-2.5 font-bold text-[1.1rem] text-text-muted-light hover:text-text-main transition-colors cursor-default">
                            <Package strokeWidth={2.5} size={22} /> Trax Logistics
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. THE PAIN SECTION (Fixed Contrast) */}
            <section className="py-24 bg-[#304250] text-white px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                            Running an e-commerce business here is <span className="text-red-400">hard enough.</span>
                        </h2>
                    </motion.div>

                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: AlertCircle, title: "Courier stuck COD?", desc: "Waiting weeks to get your own money back." },
                            { icon: TrendingDown, title: "Hidden RTO losses?", desc: "Fake buyers eating up your tight profit margins." },
                            { icon: Edit3, title: "Manual slips?", desc: "Wasting hours writing addresses by hand." },
                            { icon: PieChart, title: "Fake profit calculations?", desc: "Forgetting Facebook ad spend and packaging costs." }
                        ].map((item, i) => (
                            <motion.div key={i} variants={fadeUp} className="bg-[#3B4F5E] p-8 rounded-3xl border border-[#4A6273] hover:border-red-500/50 transition-colors group shadow-lg">
                                <div className="w-14 h-14 bg-red-500/10 text-red-400 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-red-500 group-hover:text-white transition-colors">
                                    <item.icon size={28} strokeWidth={2.5} />
                                </div>
                                <h3 className="text-xl font-bold mb-2 text-white">{item.title}</h3>
                                <p className="text-white/80 font-medium leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* 5. THE SOLUTION (BENTO GRID) */}
            <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-bg-subtle">
                <div className="max-w-7xl mx-auto">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-16 md:flex md:justify-between md:items-end">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-[#304250] tracking-tight mb-4">
                                ZipSellix handles the math,<br className="hidden md:block" /> you handle the sales.
                            </h2>
                        </div>
                    </motion.div>

                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(250px,auto)]">

                        <motion.div variants={fadeUp} className="md:col-span-2 bg-card-bg rounded-3xl p-8 lg:p-10 border border-card-border shadow-sm flex flex-col justify-center relative overflow-hidden group">
                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-[#20A46B]/10 text-[#20A46B] rounded-2xl flex items-center justify-center mb-6">
                                    <Calculator size={28} />
                                </div>
                                <h3 className="text-2xl font-bold text-[#304250] mb-3">Real Profit Calculator</h3>
                                <p className="text-text-muted font-medium max-w-md">Instantly deduct shipping fees, Facebook ad spend, and packaging costs. See your actual net profit per order before you ship.</p>
                            </div>
                            <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:opacity-10 transition-opacity transform rotate-12 scale-150 text-[#20A46B]">
                                <Calculator size={200} />
                            </div>
                        </motion.div>

                        <motion.div variants={fadeUp} className="md:col-span-1 bg-[#20A46B] text-white rounded-3xl p-8 lg:p-10 border border-[#20A46B] shadow-lg flex flex-col justify-center relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-card-bg/20 text-white rounded-2xl flex items-center justify-center mb-6">
                                    <FileCheck size={28} />
                                </div>
                                <h3 className="text-xl font-bold mb-3">1-Click Labels</h3>
                                <p className="text-green-100 font-medium">Generate thermal-ready shipping labels and packing slips instantly.</p>
                            </div>
                        </motion.div>

                        <motion.div variants={fadeUp} className="md:col-span-1 bg-card-bg rounded-3xl p-8 lg:p-10 border border-card-border shadow-sm flex flex-col justify-center">
                            <div className="w-14 h-14 bg-[#EEBE1C]/20 text-[#EEBE1C] rounded-2xl flex items-center justify-center mb-6">
                                <Banknote size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-[#304250] mb-3">COD Tracking</h3>
                            <p className="text-text-muted font-medium">Know exactly how much cash is stuck with which courier company.</p>
                        </motion.div>

                        <motion.div variants={fadeUp} className="md:col-span-2 bg-[#304250] text-white rounded-3xl p-8 lg:p-10 border border-[#304250] shadow-sm flex flex-col justify-center relative overflow-hidden group">
                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-red-500/20 text-red-400 rounded-2xl flex items-center justify-center mb-6">
                                    <UserX size={28} />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">Return Blacklist (RTO Control)</h3>
                                <p className="text-text-muted-light font-medium max-w-md">Verify customer numbers against a national database of known fake buyers and serial returners. Stop losing courier fees.</p>
                            </div>
                            <div className="absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Shield size={180} />
                            </div>
                        </motion.div>

                    </motion.div>
                </div>
            </section>

            {/* 6. INTERACTIVE ROI SLIDER */}
            <ROISlider />

            {/* 7. DATA SECURITY BADGE */}
            <section className="py-16 bg-card-bg px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#20A46B]/10 text-[#20A46B] rounded-full mb-6">
                        <ShieldCheck size={32} />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-[#304250] mb-4">Your "Winning Products" stay yours.</h2>
                    <p className="text-text-muted font-medium leading-relaxed">
                        Bank-grade encryption. We never share your product data, customer lists, or sales numbers. Built with strict privacy for serious sellers.
                    </p>
                </div>
            </section>

            {/* 8. SOCIAL PROOF / TESTIMONIAL (Fixed UI) */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-bg-subtle border-t border-card-border">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="max-w-4xl mx-auto bg-card-bg p-8 sm:p-12 rounded-[2rem] border border-card-border shadow-xl text-center relative">
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-[#EEBE1C] flex gap-1 bg-card-bg px-4 py-2 rounded-full border border-card-border-subtle shadow-sm">
                        {[1, 2, 3, 4, 5].map(star => <Star key={star} fill="currentColor" size={20} />)}
                    </div>
                    <blockquote className="text-2xl sm:text-3xl font-bold text-[#304250] leading-snug mb-8 mt-4">
                        "Pehle main roz register par hisaab karta tha, ab mujhe apna real profit tips pe pata hai. Rider returns ab easily track ho jate hain."
                    </blockquote>

                    <div className="flex items-center justify-center gap-4">
                        <img
                            src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
                            alt="Ali M."
                            className="w-14 h-14 rounded-full object-cover border-2 border-card-border-subtle shadow-sm"
                        />
                        <div className="text-left">
                            <p className="font-bold text-[#304250] text-lg">Ali M.</p>
                            <p className="text-text-muted text-sm font-medium">Founder of <span className="font-bold text-[#20A46B]">StylePk</span>, Lahore</p>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* 9. FAQ SECTION */}
            <FAQ />

            {/* 10. GLOBAL FOOTER */}
            <footer className="bg-[#304250] text-slate-300">
                <div className="bg-[#20A46B] px-4 py-20 text-center text-white">
                    <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-8">Stop guessing your profit.</h2>
                    <Link href="/signup" className="inline-flex items-center justify-center bg-card-bg text-[#304250] px-10 py-5 rounded-2xl font-black text-lg transition-all shadow-xl hover:shadow-2xl hover:scale-105">
                        Create your free account now
                    </Link>
                    <p className="text-green-100 mt-6 font-medium">No credit card required. Setup takes exactly 2 minutes.</p>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex items-center mb-6">
                            <img src="/wordmark-logo.svg" alt="ZipSellix" className="h-8 w-auto brightness-0 invert" />
                        </div>
                        <p className="text-sm font-medium leading-relaxed">The operating system for Pakistan's smart e-commerce and COD sellers.</p>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">Product</h4>
                        <ul className="space-y-3 text-sm font-medium">
                            <li><Link href="#features" className="hover:text-[#20A46B] transition-colors">Features</Link></li>
                            <li><Link href="#roi" className="hover:text-[#20A46B] transition-colors">ROI Calculator</Link></li>
                            <li><Link href="/pricing" className="hover:text-[#20A46B] transition-colors">Pricing</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">Legal</h4>
                        <ul className="space-y-3 text-sm font-medium">
                            <li><Link href="#" className="hover:text-[#20A46B] transition-colors">Privacy Policy</Link></li>
                            <li><Link href="#" className="hover:text-[#20A46B] transition-colors">Terms of Service</Link></li>
                            <li><Link href="#" className="hover:text-[#20A46B] transition-colors">Data Security</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">Contact</h4>
                        <ul className="space-y-3 text-sm font-medium">
                            <li><Link href="#" className="hover:text-[#20A46B] transition-colors">Support</Link></li>
                            <li><Link href="#" className="hover:text-[#20A46B] transition-colors">Sales</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-[#405463] text-center py-8 text-sm font-medium">
                    <p>© {new Date().getFullYear()} ZipSellix. All rights reserved.</p>
                </div>
            </footer>

        </motion.div>
    );
}