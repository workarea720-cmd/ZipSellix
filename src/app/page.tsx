'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useInView, Variants } from 'framer-motion';
import {
    ArrowRight, Menu, X, CheckCircle2, ChevronDown,
    Zap, Shield, TrendingUp, Package, FileText,
    Calculator, Truck, BarChart3, MessageSquare,
    Star, Clock, Users, DollarSign, AlertTriangle,
    Check, MoveRight, Sparkles
} from 'lucide-react';

// ─── Animation helpers ────────────────────────────────────────────────────
const fadeUp: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } }
};
const stagger: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } }
};

function AnimatedSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-80px' });
    return (
        <motion.div ref={ref} variants={stagger} initial="hidden" animate={isInView ? 'visible' : 'hidden'} className={className}>
            {children}
        </motion.div>
    );
}

// ─── HEADER ───────────────────────────────────────────────────────────────
function Header() {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', fn);
        return () => window.removeEventListener('scroll', fn);
    }, []);

    return (
        <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-[0_1px_0_0_rgba(48,66,80,0.08)]' : 'bg-transparent'}`}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                <img src="/wordmark-logo.svg" alt="ZipSellix" className="h-8 w-auto" />

                <nav className="hidden md:flex items-center gap-1">
                    {[['Features', '#features'], ['How It Works', '#how-it-works'], ['Pricing', '/pricing'], ['FAQs', '#faq']].map(([label, href]) => (
                        <Link key={label} href={href}
                            className="px-4 py-2 text-sm font-semibold text-[#304250]/70 hover:text-[#304250] rounded-lg hover:bg-[#304250]/5 transition-all">
                            {label}
                        </Link>
                    ))}
                </nav>

                <div className="hidden md:flex items-center gap-3">
                    <Link href="/login" className="px-4 py-2 text-sm font-bold text-[#304250]/70 hover:text-[#304250] transition-colors">
                        Log in
                    </Link>
                    <Link href="/signup"
                        className="px-5 py-2.5 bg-[#20A46B] hover:bg-[#1a8f5e] text-white text-sm font-bold rounded-xl shadow-[0_4px_12px_rgba(32,164,107,0.35)] hover:shadow-[0_6px_20px_rgba(32,164,107,0.4)] hover:-translate-y-px transition-all">
                        Start Free →
                    </Link>
                </div>

                <button className="md:hidden p-2 text-[#304250]" onClick={() => setOpen(!open)}>
                    {open ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {open && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className="md:hidden absolute top-16 inset-x-0 bg-white border-b border-[#304250]/10 px-4 py-4 flex flex-col gap-1 shadow-xl">
                    {[['Features', '#features'], ['How It Works', '#how-it-works'], ['Pricing', '/pricing'], ['FAQs', '#faq']].map(([label, href]) => (
                        <Link key={label} href={href} onClick={() => setOpen(false)}
                            className="px-4 py-3 text-sm font-semibold text-[#304250] hover:bg-gray-50 rounded-xl">
                            {label}
                        </Link>
                    ))}
                    <div className="h-px bg-gray-100 my-2" />
                    <Link href="/login" className="px-4 py-3 text-sm font-bold text-[#304250]/60 text-center bg-gray-50 rounded-xl">Log in</Link>
                    <Link href="/signup" className="px-4 py-3 text-sm font-bold text-white text-center bg-[#20A46B] rounded-xl shadow-lg">Start Free Account →</Link>
                </motion.div>
            )}
        </header>
    );
}

// ─── HERO ─────────────────────────────────────────────────────────────────
function Hero() {
    return (
        <section className="relative pt-28 pb-20 lg:pt-36 lg:pb-28 px-4 sm:px-6 overflow-hidden bg-[#f8fafc]">
            {/* Grid background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#30425008_1px,transparent_1px),linear-gradient(to_bottom,#30425008_1px,transparent_1px)] bg-[size:48px_48px]" />
            {/* Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#20A46B]/8 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative max-w-5xl mx-auto text-center">
                {/* Badge */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 bg-[#20A46B]/10 text-[#20A46B] text-xs font-bold px-4 py-2 rounded-full border border-[#20A46B]/20 mb-8">
                    <Sparkles size={12} />
                    Built for Pakistan's COD sellers
                </motion.div>

                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#304250] leading-[1.1] tracking-tight mb-6">
                    Stop guessing your profit.<br />
                    <span className="text-[#20A46B]">Start knowing it.</span>
                </motion.h1>

                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-lg sm:text-xl text-[#304250]/60 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
                    ZipSellix calculates real net profit per order, generates shipping labels, tracks COD returns, and verifies customers — all in one dashboard.
                </motion.p>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                    <Link href="/signup"
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#20A46B] hover:bg-[#1a8f5e] text-white px-8 py-4 rounded-2xl font-bold text-base shadow-[0_8px_24px_rgba(32,164,107,0.35)] hover:shadow-[0_12px_32px_rgba(32,164,107,0.45)] hover:-translate-y-0.5 transition-all">
                        Create Free Account <ArrowRight size={18} />
                    </Link>
                    <Link href="#how-it-works"
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-[#304250] px-8 py-4 rounded-2xl font-bold text-base border border-[#304250]/12 shadow-sm transition-all">
                        See how it works
                    </Link>
                </motion.div>

                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.4 }}
                    className="text-sm text-[#304250]/40 font-medium">
                    No credit card required · Free forever for core tools · Setup in 2 minutes
                </motion.p>

                {/* Stats row */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}
                    className="mt-16 grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto">
                    {[
                        { label: 'Orders Processed', value: 'Beta' },
                        { label: 'Avg. Time Saved', value: '3 hrs/day' },
                        { label: 'RTO Prevention Rate', value: '~40%' },
                    ].map((stat) => (
                        <div key={stat.label} className="text-center">
                            <div className="text-2xl sm:text-3xl font-black text-[#304250]">{stat.value}</div>
                            <div className="text-xs sm:text-sm text-[#304250]/50 font-medium mt-1">{stat.label}</div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

// ─── TRUSTED BY (courier logos) ───────────────────────────────────────────
function TrustedBy() {
    const couriers = ['PostEx', 'Leopard', 'TCS', 'M&P', 'Trax', 'CallCourier', 'BlueEx'];
    return (
        <div className="border-y border-[#304250]/8 bg-white py-8 overflow-hidden">
            <div className="max-w-6xl mx-auto px-4">
                <p className="text-center text-[11px] font-bold uppercase tracking-[0.2em] text-[#304250]/35 mb-6">
                    Works with Pakistan's top couriers
                </p>
                <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-10">
                    {couriers.map(name => (
                        <span key={name} className="text-sm font-black text-[#304250]/25 hover:text-[#304250]/50 transition-colors cursor-default tracking-tight">
                            {name}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── PAIN SECTION ─────────────────────────────────────────────────────────
function PainSection() {
    const pains = [
        { icon: AlertTriangle, title: "Your profit calculation is wrong", desc: "Most sellers forget to deduct Facebook ads, packaging cost, and courier fees. You think you made Rs. 800 per order — you actually made Rs. 220." },
        { icon: Clock, title: "3+ hours wasted writing labels", desc: "Writing the same address on 50 slips every morning. Your courier picks up at 10am, you start at 7am. Every. Single. Day." },
        { icon: Users, title: "Fake buyers are bleeding you dry", desc: "One fake customer = courier fee + return fee + wasted stock. You have no way to check if that new number has cancelled 5 orders before yours." },
        { icon: DollarSign, title: "Your COD money is stuck for weeks", desc: "Rs. 80,000 sitting with Leopard. Rs. 45,000 with PostEx. You don't know who owes you what, or when it arrives." },
    ];

    return (
        <section className="py-24 px-4 sm:px-6 bg-[#304250]">
            <div className="max-w-6xl mx-auto">
                <AnimatedSection>
                    <motion.div variants={fadeUp} className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
                            Running a COD business in Pakistan is <span className="text-red-400">brutal.</span>
                        </h2>
                        <p className="text-[#a8bbc8] font-medium max-w-xl mx-auto">
                            Every seller faces the same 4 problems. Most just accept them. You don't have to.
                        </p>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 gap-5">
                        {pains.map((pain, i) => (
                            <motion.div key={i} variants={fadeUp}
                                className="bg-[#3b4f5e] border border-[#4a6273] rounded-2xl p-7 group hover:border-red-500/40 transition-all">
                                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-5 group-hover:bg-red-500/20 transition-colors">
                                    <pain.icon size={22} className="text-red-400" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">{pain.title}</h3>
                                <p className="text-[#8fa3b1] font-medium leading-relaxed text-sm">{pain.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </AnimatedSection>
            </div>
        </section>
    );
}

// ─── HOW IT WORKS ─────────────────────────────────────────────────────────
function HowItWorks() {
    const steps = [
        { num: '01', title: 'Set up your business once', desc: 'Enter your courier rates, monthly expenses (rent, salaries, hosting), and packaging cost. Takes 2 minutes. Never re-enter again.' },
        { num: '02', title: 'Add orders as they come in', desc: 'Paste the customer address, select courier and product. ZipSellix instantly shows: real profit, shipping cost, and risk level for that customer.' },
        { num: '03', title: 'Print labels in one click', desc: 'Professional thermal-ready shipping labels and packing slips. Batch print 50 orders at once. Your handwriting days are over.' },
        { num: '04', title: 'Track everything, know everything', desc: 'See all pending COD amounts, high-risk customers, daily profit trends, and which courier owes you the most cash.' },
    ];

    return (
        <section id="how-it-works" className="py-24 px-4 sm:px-6 bg-white">
            <div className="max-w-5xl mx-auto">
                <AnimatedSection>
                    <motion.div variants={fadeUp} className="text-center mb-16">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#20A46B] mb-3">How it works</p>
                        <h2 className="text-3xl sm:text-4xl font-black text-[#304250] tracking-tight">
                            From chaos to clarity in 4 steps.
                        </h2>
                    </motion.div>

                    <div className="space-y-4">
                        {steps.map((step, i) => (
                            <motion.div key={i} variants={fadeUp}
                                className="flex gap-6 p-7 rounded-2xl border border-[#304250]/8 hover:border-[#20A46B]/30 hover:bg-[#20A46B]/3 transition-all group cursor-default">
                                <div className="text-4xl font-black text-[#304250]/10 group-hover:text-[#20A46B]/20 transition-colors shrink-0 w-14 leading-none pt-1">
                                    {step.num}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-[#304250] mb-2">{step.title}</h3>
                                    <p className="text-[#304250]/60 font-medium leading-relaxed">{step.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </AnimatedSection>
            </div>
        </section>
    );
}

// ─── FEATURES ─────────────────────────────────────────────────────────────
function Features() {
    const features = [
        {
            icon: Calculator,
            title: 'Profit Calculator',
            desc: 'Real net profit per order. Deducts shipping, packaging, Facebook ad spend, and fixed costs automatically.',
            tag: 'Core Tool',
            tagColor: 'bg-[#20A46B]/10 text-[#20A46B]',
            span: 'md:col-span-2',
        },
        {
            icon: FileText,
            title: 'Shipping Label Generator',
            desc: 'Thermal-ready labels for PostEx, Leopard, TCS and more. Batch print in seconds.',
            tag: 'Core Tool',
            tagColor: 'bg-[#20A46B]/10 text-[#20A46B]',
            span: 'md:col-span-1',
        },
        {
            icon: Shield,
            title: 'Customer Risk Scoring',
            desc: 'Every new order gets a risk score based on phone pattern, address quality, and past cancellation history. Stop fake COD orders before they ship.',
            tag: 'AI-Powered',
            tagColor: 'bg-purple-100 text-purple-600',
            span: 'md:col-span-1',
        },
        {
            icon: BarChart3,
            title: 'COD & Profit Reports',
            desc: 'Daily, weekly, monthly breakdowns. See exactly how much is stuck with each courier, net profit trend, and RTO rate.',
            tag: 'Analytics',
            tagColor: 'bg-[#EEBE1C]/15 text-[#b08c00]',
            span: 'md:col-span-1',
        },
        {
            icon: MessageSquare,
            title: 'WhatsApp Order Manager',
            desc: 'Paste any WhatsApp address message. ZipSellix extracts customer name, phone, city, and risk level in 1 second.',
            tag: 'Automation',
            tagColor: 'bg-green-100 text-green-700',
            span: 'md:col-span-1',
        },
        {
            icon: Truck,
            title: 'Shipping Label & Tracking',
            desc: 'Book shipments and generate labels directly from ZipSellix. Track live status across all couriers from one screen.',
            tag: 'Coming Soon',
            tagColor: 'bg-[#304250]/8 text-[#304250]/50',
            span: 'md:col-span-1',
        },
    ];

    return (
        <section id="features" className="py-24 px-4 sm:px-6 bg-[#f8fafc]">
            <div className="max-w-6xl mx-auto">
                <AnimatedSection>
                    <motion.div variants={fadeUp} className="text-center mb-16">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#20A46B] mb-3">Features</p>
                        <h2 className="text-3xl sm:text-4xl font-black text-[#304250] tracking-tight mb-4">
                            Everything a Pakistan COD seller needs.
                        </h2>
                        <p className="text-[#304250]/55 font-medium max-w-lg mx-auto">
                            No bloat. No features you'll never use. Just the tools that directly affect your profit.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {features.map((f, i) => (
                            <motion.div key={i} variants={fadeUp}
                                className={`${f.span} bg-white rounded-2xl border border-[#304250]/8 p-7 hover:border-[#20A46B]/30 hover:shadow-[0_8px_32px_rgba(32,164,107,0.08)] transition-all group`}>
                                <div className="flex items-start justify-between mb-5">
                                    <div className="w-11 h-11 rounded-xl bg-[#304250]/5 flex items-center justify-center group-hover:bg-[#20A46B]/10 transition-colors">
                                        <f.icon size={20} className="text-[#304250]/60 group-hover:text-[#20A46B] transition-colors" />
                                    </div>
                                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${f.tagColor}`}>{f.tag}</span>
                                </div>
                                <h3 className="text-lg font-bold text-[#304250] mb-2">{f.title}</h3>
                                <p className="text-sm text-[#304250]/55 font-medium leading-relaxed">{f.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </AnimatedSection>
            </div>
        </section>
    );
}

// ─── ROI CALCULATOR ───────────────────────────────────────────────────────
function ROICalculator() {
    const [parcels, setParcels] = useState(50);
    const timeSaved = ((parcels * 3) / 60).toFixed(1);
    const rtoPrevented = Math.round(parcels * 0.12 * 350);
    const labelTime = Math.round(parcels * 2.5);

    return (
        <section id="roi" className="py-24 px-4 sm:px-6 bg-white border-y border-[#304250]/8">
            <div className="max-w-4xl mx-auto">
                <AnimatedSection>
                    <motion.div variants={fadeUp} className="text-center mb-12">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#20A46B] mb-3">ROI Calculator</p>
                        <h2 className="text-3xl sm:text-4xl font-black text-[#304250] tracking-tight">
                            How much is manual work costing you?
                        </h2>
                    </motion.div>

                    <motion.div variants={fadeUp} className="bg-[#f8fafc] rounded-3xl border border-[#304250]/8 p-8 sm:p-12">
                        <div className="mb-10">
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-sm font-bold text-[#304250] uppercase tracking-wide">Daily parcels shipped</label>
                                <span className="text-3xl font-black text-[#20A46B]">{parcels}</span>
                            </div>
                            <input type="range" min="10" max="500" step="5" value={parcels}
                                onChange={e => setParcels(Number(e.target.value))}
                                className="w-full h-2 rounded-full accent-[#20A46B] cursor-pointer" />
                            <div className="flex justify-between text-xs text-[#304250]/40 font-medium mt-2">
                                <span>10</span><span>500</span>
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-3 gap-5">
                            {[
                                { label: 'Time saved daily on labels', value: `${timeSaved} hrs`, sub: `(${labelTime} min of writing)`, color: 'text-[#304250]' },
                                { label: 'Fake order losses prevented', value: `Rs. ${rtoPrevented.toLocaleString()}`, sub: 'per day (est. 12% fake rate)', color: 'text-[#20A46B]' },
                                { label: 'Profit visibility gained', value: '100%', sub: 'vs. guessing right now', color: 'text-[#304250]' },
                            ].map((item) => (
                                <div key={item.label} className="bg-white rounded-2xl border border-[#304250]/8 p-6 text-center shadow-sm">
                                    <div className="text-xs font-bold text-[#304250]/50 uppercase tracking-wide mb-3">{item.label}</div>
                                    <div className={`text-3xl font-black ${item.color} mb-1`}>{item.value}</div>
                                    <div className="text-[11px] text-[#304250]/40 font-medium">{item.sub}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </AnimatedSection>
            </div>
        </section>
    );
}

// ─── COMPARISON TABLE ─────────────────────────────────────────────────────
function ComparisonTable() {
    const rows = [
        { feature: 'Real per-order profit calculation', us: true, spreadsheet: false, nothing: false },
        { feature: 'Automatic shipping label generation', us: true, spreadsheet: false, nothing: false },
        { feature: 'Customer risk scoring (fake buyer detection)', us: true, spreadsheet: false, nothing: false },
        { feature: 'COD tracking by courier', us: true, spreadsheet: 'Manual', nothing: false },
        { feature: 'WhatsApp address parser', us: true, spreadsheet: false, nothing: false },
        { feature: 'Daily profit reports', us: true, spreadsheet: 'Manual', nothing: false },
    ];

    return (
        <section className="py-24 px-4 sm:px-6 bg-[#f8fafc]">
            <div className="max-w-4xl mx-auto">
                <AnimatedSection>
                    <motion.div variants={fadeUp} className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-black text-[#304250] tracking-tight">
                            ZipSellix vs. how you do it now.
                        </h2>
                    </motion.div>

                    <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-[#304250]/8 overflow-hidden shadow-sm">
                        <div className="grid grid-cols-4 bg-[#304250] text-white text-xs font-bold uppercase tracking-wider">
                            <div className="col-span-2 px-6 py-4">Feature</div>
                            <div className="px-4 py-4 text-center text-[#20A46B]">ZipSellix</div>
                            <div className="px-4 py-4 text-center text-white/50">Excel / Nothing</div>
                        </div>
                        {rows.map((row, i) => (
                            <div key={i} className={`grid grid-cols-4 border-b border-[#304250]/6 last:border-0 ${i % 2 === 0 ? '' : 'bg-[#f8fafc]'}`}>
                                <div className="col-span-2 px-6 py-4 text-sm font-medium text-[#304250]">{row.feature}</div>
                                <div className="px-4 py-4 flex justify-center items-center">
                                    {row.us === true
                                        ? <CheckCircle2 size={18} className="text-[#20A46B]" />
                                        : <span className="text-xs text-[#304250]/50 font-medium">{row.us}</span>}
                                </div>
                                <div className="px-4 py-4 flex justify-center items-center">
                                    {row.nothing === false && row.spreadsheet === false
                                        ? <X size={16} className="text-red-400" />
                                        : <span className="text-xs text-[#304250]/50 font-medium">{row.spreadsheet || '—'}</span>}
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </AnimatedSection>
            </div>
        </section>
    );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────
function FAQ() {
    const [open, setOpen] = useState<number | null>(0);
    const faqs = [
        { q: 'Is ZipSellix free?', a: 'Yes. The core tools — Profit Calculator, Invoice Generator, and Label Printing — are free forever. We only charge for advanced automation features when you scale up.' },
        { q: 'Do I need to be FBR registered or have a company?', a: 'No. ZipSellix works for any seller, from a single WhatsApp reseller to a large brand. No tax documentation, no registration required.' },
        { q: 'Which couriers are supported?', a: 'Currently the platform supports rate calculations for PostEx, Leopard, TCS, M&P, Trax, and CallCourier. Direct API booking is available for PostEx. More couriers will be added based on user demand.' },
        { q: 'Is my data safe?', a: 'Yes. We use industry-standard encryption. Your product data, customer lists, and sales numbers are never shared with third parties — ever. They are only visible to you.' },
        { q: "What if I'm a service business, not selling products?", a: 'ZipSellix supports both physical product sellers and service-based businesses. During onboarding you select your business type and the platform adjusts accordingly.' },
        { q: 'Can I use it on mobile?', a: 'Yes. ZipSellix is fully responsive and works on any device — mobile, tablet, or desktop. Many sellers use it to process orders directly from their phone.' },
    ];

    return (
        <section id="faq" className="py-24 px-4 sm:px-6 bg-white">
            <div className="max-w-3xl mx-auto">
                <AnimatedSection>
                    <motion.div variants={fadeUp} className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-black text-[#304250] tracking-tight">Frequently asked questions</h2>
                    </motion.div>

                    <div className="space-y-3">
                        {faqs.map((faq, i) => (
                            <motion.div key={i} variants={fadeUp} className="border border-[#304250]/8 rounded-2xl overflow-hidden">
                                <button onClick={() => setOpen(open === i ? null : i)}
                                    className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50/50 transition-colors">
                                    <span className="font-bold text-[#304250] pr-4">{faq.q}</span>
                                    <ChevronDown size={18} className={`text-[#304250]/40 transition-transform duration-200 shrink-0 ${open === i ? 'rotate-180' : ''}`} />
                                </button>
                                {open === i && (
                                    <div className="px-6 pb-5 text-[#304250]/65 font-medium leading-relaxed border-t border-[#304250]/6 pt-4">
                                        {faq.a}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </AnimatedSection>
            </div>
        </section>
    );
}

// ─── CTA ──────────────────────────────────────────────────────────────────
function CTA() {
    return (
        <section className="py-24 px-4 sm:px-6 bg-[#20A46B]">
            <div className="max-w-4xl mx-auto text-center">
                <AnimatedSection>
                    <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-6">
                        Ready to see your<br />actual profit?
                    </motion.h2>
                    <motion.p variants={fadeUp} className="text-green-100 font-medium text-lg mb-10 max-w-xl mx-auto">
                        Join sellers who have stopped guessing and started growing. Setup takes 2 minutes.
                    </motion.p>
                    <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/signup"
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-[#20A46B] px-8 py-4 rounded-2xl font-black text-base shadow-[0_8px_24px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 transition-all">
                            Create Free Account <ArrowRight size={18} />
                        </Link>
                    </motion.div>
                    <motion.p variants={fadeUp} className="text-green-100/70 text-sm font-medium mt-5">
                        No credit card · Free forever for core tools · Cancel anytime
                    </motion.p>
                </AnimatedSection>
            </div>
        </section>
    );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────
function Footer() {
    return (
        <footer className="bg-[#304250] text-slate-400">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
                <div className="col-span-2 md:col-span-1">
                    <img src="/wordmark-logo.svg" alt="ZipSellix" className="h-8 w-auto brightness-0 invert mb-4" />
                    <p className="text-sm font-medium leading-relaxed text-slate-400">
                        The profit & operations platform for Pakistan's COD sellers.
                    </p>
                </div>
                {[
                    { heading: 'Product', links: [['Features', '#features'], ['How It Works', '#how-it-works'], ['ROI Calculator', '#roi'], ['Pricing', '/pricing']] },
                    { heading: 'Legal', links: [['Privacy Policy', '#'], ['Terms of Service', '#'], ['Data Security', '#']] },
                    { heading: 'Support', links: [['Help Center', '#'], ['Contact Us', '#'], ['System Status', '#']] },
                ].map(col => (
                    <div key={col.heading}>
                        <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-5">{col.heading}</h4>
                        <ul className="space-y-3">
                            {col.links.map(([label, href]) => (
                                <li key={label}>
                                    <Link href={href} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
            <div className="border-t border-white/8 px-4 py-6 text-center text-xs font-medium text-slate-500">
                © {new Date().getFullYear()} ZipSellix. All rights reserved. Built for Pakistan's sellers.
            </div>
        </footer>
    );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────
export default function Home() {
    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans antialiased overflow-x-hidden">
            <Header />
            <Hero />
            <TrustedBy />
            <PainSection />
            <HowItWorks />
            <Features />
            <ROICalculator />
            <ComparisonTable />
            <FAQ />
            <CTA />
            <Footer />
        </div>
    );
}