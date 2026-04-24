'use client';

import React, { useState, useEffect, useCallback, useTransition, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Download, Calendar, Lock, FileText, ChevronDown,
    TrendingUp, PackageOpen, Table2,
    Activity, ArrowUpRight, ArrowDownRight,
    RefreshCcw, Clock, Search, MapPin, ShieldAlert,
    CheckCircle2, XCircle, BarChart3, CreditCard, DollarSign,
    AlertTriangle, Info, Package, BookOpen, Loader2, Zap,
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell
} from 'recharts';

import type { ReportsData, DateRangePreset, SmartInsight } from '@/types/report-types';
import { API_URL, safeFetch } from '@/lib/api-client';

// ============================================================
// Constants & Color Maps
// ============================================================
const BRAND_GREEN = '#20A46B';

const STATUS_COLORS: Record<string, string> = {
    DELIVERED: '#20A46B',
    COMPLETED: '#20A46B',
    PENDING: '#EEBE1C', // Yellow Accent for Pending
    DISPATCHED: '#304250',
    RETURNED: '#ef4444',
    RTO: '#ef4444',
    CANCELLED: '#94a3b8',
};

const DATE_RANGES: { value: DateRangePreset; label: string }[] = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last-7-days', label: 'Last 7 Days' },
    { value: 'this-month', label: 'This Month' },
    { value: 'last-month', label: 'Last Month' },
    { value: 'last-3-months', label: 'Last 3 Months' },
    { value: 'all-time', label: 'All Time' },
];

// ============================================================
// Micro-components
// ============================================================

function StatusPill({ status }: { status: string }) {
    const upper = status.toUpperCase();
    const color = STATUS_COLORS[upper] || '#94a3b8';

    // Slight adjustment for Yellow so text is readable
    const textColor = upper === 'PENDING' ? '#c2410c' : color;

    return (
        <span
            className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] uppercase tracking-widest font-black"
            style={{ background: `${color}20`, color: textColor }}
        >
            {status}
        </span>
    );
}

function BarRow({
    label, value, pct, color, subLabel,
}: { label: string; value: string | number; pct: number; color: string; subLabel?: string }) {
    return (
        <div className="flex items-center gap-3 mb-3">
            <div className="w-28 text-xs font-bold text-[#304250]/70 shrink-0 uppercase tracking-wide">{label}</div>
            <div className="flex-1 h-2.5 bg-[#304250]/5 rounded-full overflow-hidden">
                <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                />
            </div>
            <div className="text-xs font-black min-w-[64px] text-right" style={{ color }}>
                {value}{subLabel && <span className="text-[10px] font-bold text-[#304250]/40 ml-1">({subLabel})</span>}
            </div>
        </div>
    );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`bg-white border border-[#304250]/10 rounded-[24px] shadow-[0_8px_30px_rgba(48,66,80,0.04)] ${className}`}>
            {children}
        </div>
    );
}

function CardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
    return (
        <div className="mb-5">
            <h3 className="text-base font-black text-[#304250]">{title}</h3>
            {subtitle && <p className="text-[11px] font-bold uppercase tracking-widest text-[#304250]/50 mt-0.5">{subtitle}</p>}
        </div>
    );
}

function KpiCard({
    label, value, badge, badgeColor = 'blue', icon: Icon, iconBg, valueColor,
}: {
    label: string;
    value: string | number;
    badge?: string;
    badgeColor?: 'green' | 'amber' | 'red' | 'blue';
    icon: React.ElementType;
    iconBg: string;
    valueColor?: string;
}) {
    const badgeStyles: Record<string, string> = {
        green: 'bg-[#20A46B]/10 text-[#20A46B]',
        amber: 'bg-[#EEBE1C]/20 text-[#c2410c]',
        red: 'bg-red-50 text-red-600',
        blue: 'bg-[#304250]/10 text-[#304250]',
    };

    return (
        <Card className="p-6 hover:shadow-[0_8px_30px_rgba(48,66,80,0.08)] transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#304250]/50">{label}</p>
                <div className={`${iconBg} h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-[#304250]/5`}>
                    <Icon size={18} />
                </div>
            </div>
            <h3
                className="text-2xl sm:text-3xl font-black mb-3 tracking-tight"
                style={{ color: valueColor || undefined }}
            >
                <span className={!valueColor ? 'text-[#304250]' : ''}>{value}</span>
            </h3>
            {badge && (
                <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm border border-white/50 ${badgeStyles[badgeColor]}`}>
                    {badge}
                </span>
            )}
        </Card>
    );
}

function ChartTooltip({ active, payload, label, formatter }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white px-4 py-3 rounded-xl shadow-[0_8px_30px_rgba(48,66,80,0.12)] border border-[#304250]/10 min-w-[160px]">
            <p className="text-[11px] font-extrabold text-[#304250]/50 uppercase tracking-widest mb-2 pb-2 border-b border-[#304250]/5">{label}</p>
            {payload.map((p: any, i: number) => (
                <div key={i} className="flex items-center justify-between gap-4 py-0.5">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                        <span className="text-xs font-bold text-[#304250]/70">{p.name}</span>
                    </div>
                    <span className="text-xs font-black text-[#304250]">
                        {formatter ? formatter(p.value) : `Rs ${(p.value || 0).toLocaleString()}`}
                    </span>
                </div>
            ))}
        </div>
    );
}

function SkeletonCard() {
    return (
        <div className="bg-white rounded-[24px] border border-[#304250]/5 shadow-sm p-6 animate-pulse">
            <div className="flex justify-between items-start">
                <div className="space-y-3 flex-1">
                    <div className="h-3 bg-gray-100 rounded-full w-24" />
                    <div className="h-8 bg-gray-100 rounded-lg w-32" />
                </div>
                <div className="h-10 w-10 bg-gray-100 rounded-xl" />
            </div>
            <div className="mt-5 h-5 bg-gray-50 rounded-md w-24" />
        </div>
    );
}

// Tabs are built dynamically inside the component based on businessType.
const ALL_TABS_PRODUCT = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'pnl', label: 'Profit & Loss', icon: DollarSign },
    { id: 'orders', label: 'Order Analytics', icon: PackageOpen },
    { id: 'rto', label: 'RTO Analysis', icon: ShieldAlert },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'ledger', label: 'Ledger', icon: BookOpen },
];

const ALL_TABS_SERVICE = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'pnl', label: 'Profit & Loss', icon: DollarSign },
    { id: 'orders', label: 'Order Analytics', icon: PackageOpen },
    { id: 'rto', label: 'RTO Analysis', icon: ShieldAlert },
    { id: 'services', label: 'Services', icon: Zap },
    { id: 'ledger', label: 'Ledger', icon: BookOpen },
];

function OverviewTab({ d }: { d: ReportsData }) {
    const s = d.summary;
    const delivered = d.ordersByStatus.find(o => o.status.toUpperCase() === 'DELIVERED');
    const pending = d.ordersByStatus.find(o => o.status.toUpperCase() === 'PENDING');
    const returned = d.ordersByStatus.find(o => ['RETURNED', 'RTO'].includes(o.status.toUpperCase()));

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <KpiCard label="Total Revenue" value={`Rs ${s.totalRevenue.toLocaleString()}`} icon={TrendingUp} iconBg="bg-blue-50 text-blue-600" badge={`${s.totalOrders} orders`} badgeColor="blue" />
                <KpiCard label="Net Profit" value={`Rs ${s.totalProfit.toLocaleString()}`} icon={ArrowUpRight} iconBg="bg-[#20A46B]/10 text-[#20A46B]" valueColor={BRAND_GREEN} badge={`${s.profitMargin}% margin`} badgeColor="green" />
                <KpiCard label="Total Orders" value={s.totalOrders} icon={PackageOpen} iconBg="bg-[#304250]/5 text-[#304250]/60" badge={`${delivered?.count ?? 0} delivered`} badgeColor="blue" />
                <KpiCard label="Avg Order Value" value={`Rs ${s.avgOrderValue.toLocaleString()}`} icon={DollarSign} iconBg="bg-[#EEBE1C]/20 text-[#c2410c]" badge="Per order" badgeColor="amber" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                    <CardHeader title="Revenue Trend" subtitle="Daily orders this period" />
                    {d.salesByDay && d.salesByDay.length > 0 ? (
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={d.salesByDay} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#30425010" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#30425060', fontWeight: 800 }} dy={5} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#30425060', fontWeight: 800 }} tickFormatter={(v) => `Rs ${v}`} dx={-5} />
                                    <Tooltip content={<ChartTooltip />} cursor={{ fill: '#30425008' }} />
                                    <Bar dataKey="revenue" name="Revenue" fill={BRAND_GREEN} radius={[6, 6, 0, 0]} barSize={24} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-[250px] w-full bg-gray-50 rounded-2xl flex flex-col items-center justify-center text-[#304250]/40 border border-[#304250]/5">
                            <BarChart3 size={32} className="mb-2 opacity-30" />
                            <p className="text-xs font-bold uppercase tracking-widest">No sales data</p>
                        </div>
                    )}
                </Card>

                <Card className="p-6">
                    <CardHeader title="Revenue Split" subtitle="Where money goes" />
                    <div className="flex gap-4 mb-4 flex-wrap">
                        {[
                            { color: BRAND_GREEN, label: `Net profit Rs ${s.totalProfit.toLocaleString()}` },
                            { color: '#ef4444', label: `Costs Rs ${s.totalCost.toLocaleString()}` },
                            { color: '#EEBE1C', label: `Expenses Rs ${s.totalExpenses.toLocaleString()}` },
                        ].map(l => (
                            <div key={l.label} className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-[#304250]/5">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
                                <span className="text-[11px] font-extrabold text-[#304250]/70 uppercase tracking-widest">{l.label}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="p-6">
                    <CardHeader title="Fulfillment Rate" />
                    <div className="space-y-3 mt-4">
                        <BarRow label="Delivered" value={`${delivered?.count ?? 0}`} pct={delivered?.percentage ?? 0} color={BRAND_GREEN} subLabel={`${delivered?.percentage ?? 0}%`} />
                        <BarRow label="Pending COD" value={`${pending?.count ?? 0}`} pct={pending?.percentage ?? 0} color="#EEBE1C" subLabel={`${pending?.percentage ?? 0}%`} />
                        <BarRow label="Returned" value={`${returned?.count ?? 0}`} pct={returned?.percentage ?? 0} color="#ef4444" subLabel={`${returned?.percentage ?? 0}%`} />
                    </div>
                </Card>

                <Card className="p-6">
                    <CardHeader title="Payment Split" />
                    <div className="grid grid-cols-2 gap-3 mt-2">
                        {d.paymentSplit.map(p => (
                            <div key={p.method} className="bg-gray-50 rounded-2xl p-5 text-center border border-[#304250]/5 shadow-sm">
                                <div className="text-2xl font-black text-[#304250]">{p.count}</div>
                                <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#304250]/50 mt-1">{p.method} orders</div>
                            </div>
                        ))}
                        {d.paymentSplit.length === 0 && (
                            <div className="col-span-2 text-[11px] font-bold uppercase tracking-widest text-[#304250]/40 text-center py-6 bg-gray-50 rounded-xl">No payment data</div>
                        )}
                    </div>
                </Card>

                <Card className="p-6">
                    <CardHeader title="Key Insights" />
                    <div className="space-y-3 mt-2">
                        {d.insights && d.insights.length > 0 ? d.insights.slice(0, 3).map((insight, i) => {
                            const bgMap = {
                                growth: 'bg-[#20A46B]/10 text-[#20A46B] border border-[#20A46B]/20',
                                warning: 'bg-[#EEBE1C]/10 text-[#c2410c] border border-[#EEBE1C]/30',
                                info: 'bg-[#304250]/5 text-[#304250] border border-[#304250]/10'
                            };
                            return (
                                <div key={i} className={`rounded-xl p-4 text-sm leading-relaxed ${bgMap[insight.type]}`}>
                                    <span className="font-extrabold uppercase tracking-wide text-[11px] block mb-1">{insight.title}</span>
                                    <span className="font-medium text-[#304250]/80">{insight.message}</span>
                                </div>
                            );
                        }) : (
                            <p className="text-[11px] font-bold uppercase tracking-widest text-[#304250]/40 text-center py-6 bg-gray-50 rounded-xl">Insights are calculating...</p>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}

function PnlTab({ d }: { d: ReportsData }) {
    const s = d.summary;
    const totalCosts = s.totalCost + s.totalExpenses;
    const maxBarWidth = s.totalRevenue;

    const waterfallRows = [
        { label: 'Gross Revenue', amount: s.totalRevenue, pct: 100, isPositive: true, isTotal: true },
        { label: '— Product Cost', amount: -s.totalCost, pct: maxBarWidth > 0 ? (s.totalCost / maxBarWidth) * 100 : 0, isPositive: false, isTotal: false },
        { label: '— Expenses', amount: -s.totalExpenses, pct: maxBarWidth > 0 ? (s.totalExpenses / maxBarWidth) * 100 : 0, isPositive: false, isTotal: false },
        { label: '= Net Profit', amount: s.totalProfit, pct: maxBarWidth > 0 ? Math.max(0, (s.totalProfit / maxBarWidth)) * 100 : 0, isPositive: true, isTotal: true },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <KpiCard label="Gross Revenue" value={`Rs ${s.totalRevenue.toLocaleString()}`} icon={TrendingUp} iconBg="bg-blue-50 text-blue-600" badge={`${s.totalOrders} orders`} badgeColor="blue" />
                <KpiCard label="Total Costs" value={`Rs ${totalCosts.toLocaleString()}`} icon={ArrowDownRight} iconBg="bg-red-50 text-red-500" badge="Shipping + product" badgeColor="red" />
                <KpiCard label="Net Profit" value={`Rs ${s.totalProfit.toLocaleString()}`} icon={ArrowUpRight} iconBg="bg-[#20A46B]/10 text-[#20A46B]" valueColor={BRAND_GREEN} badge="After deductions" badgeColor="green" />
                <KpiCard label="Profit Margin" value={`${s.profitMargin}%`} icon={Activity} iconBg="bg-[#EEBE1C]/20 text-[#c2410c]" badge="Margin" badgeColor="amber" />
            </div>

            <Card className="p-6 md:p-8">
                <CardHeader title="Profit Waterfall" subtitle="How revenue becomes profit" />
                <div className="space-y-5 mt-6">
                    {waterfallRows.map((row, i) => (
                        <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <div className={`w-36 text-xs shrink-0 tracking-wider uppercase ${row.isTotal ? 'font-black text-[#304250]' : 'font-bold text-[#304250]/60'}`}>
                                {row.label}
                            </div>
                            <div className="flex-1 h-8 sm:h-10 bg-gray-50 rounded-xl overflow-hidden border border-[#304250]/5">
                                <motion.div
                                    className="h-full rounded-xl flex items-center px-4 shadow-sm"
                                    style={{ backgroundColor: row.isPositive ? (row.isTotal && row.amount < s.totalRevenue ? BRAND_GREEN : '#304250') : '#ef4444' }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.max(4, row.pct)}%` }}
                                    transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                                >
                                    <span className={`text-xs font-black tracking-wide ${row.isPositive ? 'text-white' : 'text-white'}`}>
                                        {row.amount < 0 ? `–Rs ${Math.abs(row.amount).toLocaleString()}` : `Rs ${row.amount.toLocaleString()}`}
                                    </span>
                                </motion.div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}

function OrdersTab({ d }: { d: ReportsData }) {
    const s = d.summary;
    const delivered = d.ordersByStatus.find(o => o.status.toUpperCase() === 'DELIVERED');
    const pending = d.ordersByStatus.find(o => o.status.toUpperCase() === 'PENDING');
    const returned = d.ordersByStatus.find(o => ['RETURNED', 'RTO'].includes(o.status.toUpperCase()));

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <KpiCard label="Total Orders" value={s.totalOrders} icon={PackageOpen} iconBg="bg-[#304250]/5 text-[#304250]" badge="This period" badgeColor="blue" />
                <KpiCard label="Delivered" value={delivered?.count ?? 0} icon={CheckCircle2} iconBg="bg-[#20A46B]/10 text-[#20A46B]" valueColor={BRAND_GREEN} badge={`${delivered?.percentage ?? 0}% success rate`} badgeColor="green" />
                <KpiCard label="Pending" value={pending?.count ?? 0} icon={Clock} iconBg="bg-[#EEBE1C]/20 text-[#c2410c]" valueColor="#f59e0b" badge="Uncollected" badgeColor="amber" />
                <KpiCard label="Returned" value={returned?.count ?? 0} icon={XCircle} iconBg="bg-red-50 text-red-500" valueColor="#ef4444" badge={`${returned?.percentage ?? 0}% RTO rate`} badgeColor="red" />
            </div>
        </div>
    );
}

function RtoTab({ d }: { d: ReportsData }) {
    const rto = d.rto;
    const isHealthy = rto.overallRate < 20;

    return (
        <div className="space-y-6">
            <div className={`flex items-start gap-4 p-6 rounded-2xl border shadow-sm ${isHealthy
                ? 'bg-[#20A46B]/5 border-[#20A46B]/20'
                : 'bg-[#EEBE1C]/10 border-[#EEBE1C]/30'
                }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${isHealthy ? 'bg-[#20A46B]/20' : 'bg-[#EEBE1C]/30'}`}>
                    {isHealthy ? <CheckCircle2 size={20} className="text-[#20A46B]" /> : <AlertTriangle size={20} className="text-[#c2410c]" />}
                </div>
                <div className="pt-0.5">
                    <p className={`text-base font-medium ${isHealthy ? 'text-[#20A46B]' : 'text-[#c2410c]'}`}>
                        Overall return rate <strong className="font-black text-lg">{rto.overallRate}%</strong> ({rto.totalReturns} of {d.summary.totalOrders} orders).
                    </p>
                    <p className={`text-sm font-bold mt-1 ${isHealthy ? 'text-[#20A46B]/70' : 'text-[#c2410c]/70'}`}>
                        {isHealthy ? 'Industry average is 20-30% — you are in the safe zone.' : 'This is above industry average. Consider verifying COD orders before dispatch.'}
                    </p>
                </div>
            </div>
        </div>
    );
}

function ProductsTab({ d, mode = 'product' }: { d: ReportsData; mode?: 'product' | 'service' }) {
    const products = d.topProducts || [];
    const bestProduct = products[0];
    const lossProducts = products.filter(p => p.profit < 0);

    const isService = mode === 'service';

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <KpiCard label={isService ? 'Best Service' : 'Best Product'} value={bestProduct?.name ?? 'N/A'} icon={TrendingUp} iconBg="bg-[#20A46B]/10 text-[#20A46B]" badge={bestProduct ? `${bestProduct.margin}% margin` : 'No data'} badgeColor="green" />
                <KpiCard label={isService ? 'Most Orders' : 'Most Units Sold'} value={`${products.reduce((sum, p) => sum + p.unitsSold, 0)} ${isService ? 'orders' : 'units'}`} icon={PackageOpen} iconBg="bg-[#304250]/5 text-[#304250]" badge={bestProduct?.name ?? 'N/A'} badgeColor="blue" />
                <KpiCard label={isService ? 'Loss-Making Services' : 'Loss-Making Products'} value={lossProducts.length > 0 ? `${lossProducts.length} of ${products.length}` : 'None'} icon={AlertTriangle} iconBg="bg-red-50 text-red-500" valueColor={lossProducts.length > 0 ? '#ef4444' : undefined} badge={lossProducts.map(p => p.name).join(' & ') || 'All profitable'} badgeColor={lossProducts.length > 0 ? 'red' : 'green'} />
            </div>
        </div>
    );
}

function LedgerTab({ d, searchQuery, setSearchQuery }: {
    d: ReportsData;
    searchQuery: string;
    setSearchQuery: (v: string) => void;
}) {
    const [statusFilter, setStatusFilter] = useState('all');
    const s = d.summary;

    const filteredLedger = d.ledger.filter(row => {
        const matchSearch = !searchQuery ||
            row.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            row.customerName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchStatus = statusFilter === 'all' || row.status.toLowerCase() === statusFilter.toLowerCase();
        return matchSearch && matchStatus;
    });

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <KpiCard label="Total Entries" value={d.ledger.length} icon={BookOpen} iconBg="bg-[#304250]/5 text-[#304250]" badge="All orders" badgeColor="blue" />
                <KpiCard label="Total Revenue" value={`Rs ${s.totalRevenue.toLocaleString()}`} icon={TrendingUp} iconBg="bg-[#20A46B]/10 text-[#20A46B]" badge="Gross sales" badgeColor="green" />
                <KpiCard label="Total Expenses" value={`Rs ${(s.totalCost + s.totalExpenses).toLocaleString()}`} icon={ArrowDownRight} iconBg="bg-red-50 text-red-500" valueColor="#ef4444" badge="Cost + shipping" badgeColor="red" />
                <KpiCard label="Net Balance" value={`Rs ${s.totalProfit.toLocaleString()}`} icon={Activity} iconBg="bg-[#EEBE1C]/20 text-[#c2410c]" valueColor={BRAND_GREEN} badge="Final profit" badgeColor="amber" />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-white p-4 rounded-[24px] shadow-sm border border-[#304250]/10">
                <div className="relative flex-1 w-full sm:max-w-sm">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#304250]/40" />
                    <input
                        type="text"
                        placeholder="Search by order ID or customer..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-[#304250]/10 rounded-xl text-sm font-bold outline-none focus:border-[#20A46B] focus:bg-white focus:ring-2 focus:ring-[#20A46B]/20 transition-all text-[#304250] placeholder:text-[#304250]/40 placeholder:font-medium"
                    />
                </div>
                <div className="relative w-full sm:w-auto">
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="w-full bg-gray-50 border border-[#304250]/10 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-[#304250] outline-none cursor-pointer focus:border-[#20A46B] focus:bg-white focus:ring-2 focus:ring-[#20A46B]/20 appearance-none transition-all"
                    >
                        <option value="all">All status</option>
                        <option value="delivered">Delivered</option>
                        <option value="pending">Pending</option>
                        <option value="returned">Returned</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#304250]/40 pointer-events-none" />
                </div>
            </div>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead>
                            <tr className="bg-gray-50/80 text-[10px] uppercase tracking-widest text-[#304250]/50 font-black border-b border-[#304250]/10">
                                <th className="px-6 py-5">Ref ID</th>
                                <th className="px-6 py-5">Date</th>
                                <th className="px-6 py-5">Customer</th>
                                <th className="px-6 py-5">Product</th>
                                <th className="px-6 py-5 text-right">Revenue</th>
                                <th className="px-6 py-5 text-right">Net Profit</th>
                                <th className="px-6 py-5 text-center">Status</th>
                                <th className="px-6 py-5 text-center">Payment</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#304250]/5">
                            {filteredLedger.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="text-center py-16">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="bg-gray-50 p-4 rounded-full border border-[#304250]/5"><Search size={28} className="text-[#304250]/30" /></div>
                                            <p className="text-[#304250]/50 font-extrabold uppercase tracking-widest text-[11px]">No entries found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {filteredLedger.map((row, i) => {
                                const initials = row.customerName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                                return (
                                    <tr key={i} className="hover:bg-gray-50/80 transition-colors duration-150">
                                        <td className="px-6 py-4 font-black text-[#304250]">{row.id}</td>
                                        <td className="px-6 py-4 text-[#304250]/60 text-xs font-bold">
                                            {row.date}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-white border border-[#304250]/10 shadow-sm flex items-center justify-center text-xs font-black text-[#304250] flex-shrink-0">
                                                    {initials}
                                                </div>
                                                <div>
                                                    <div className="font-extrabold text-[#304250] text-[13px]">{row.customerName}</div>
                                                    {row.city && <div className="text-[10px] font-bold uppercase tracking-widest text-[#304250]/50 flex items-center gap-0.5 mt-0.5"><MapPin size={10} className="text-[#304250]/30" />{row.city}</div>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-[#304250]/70 font-bold text-xs">{row.productName ?? '—'}</td>
                                        <td className="px-6 py-4 text-right font-black text-[#304250]">
                                            Rs {row.revenue.toLocaleString()}
                                        </td>
                                        <td className={`px-6 py-4 text-right font-black ${row.profit >= 0 ? 'text-[#20A46B]' : 'text-red-500'}`}>
                                            {row.profit >= 0 ? '+' : '–'}Rs {Math.abs(row.profit).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <StatusPill status={row.status} />
                                        </td>
                                        <td className="px-6 py-4 text-center text-[10px] uppercase tracking-widest font-black text-[#304250]/60">
                                            <span className="bg-gray-100 border border-[#304250]/5 px-2 py-1 rounded shadow-sm">{row.paymentMethod}</span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}

interface ReportsViewProps {
    isPro?: boolean;
    businessType?: 'STOCK' | 'SERVICE' | string;
}

export default function ReportsView({ isPro = false, businessType = 'STOCK' }: ReportsViewProps) {
    const [preset, setPreset] = useState<DateRangePreset>('this-month');
    const [activeTab, setActiveTab] = useState('overview');
    const [reportData, setReportData] = useState<ReportsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isPending, startTransition] = useTransition();

    const TABS = useMemo(() => {
        const isService = businessType?.toUpperCase() === 'SERVICE';
        return isService ? ALL_TABS_SERVICE : ALL_TABS_PRODUCT;
    }, [businessType]);

    useEffect(() => {
        const validIds = TABS.map(t => t.id);
        if (!validIds.includes(activeTab)) {
            setActiveTab('overview');
        }
    }, [TABS, activeTab]);

    // ── PDF Export ──
    const [isExporting, setIsExporting] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [exportToast, setExportToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const fetchData = useCallback(async (range: DateRangePreset) => {
        setLoading(true);
        setError(null);
        try {
            const result = await safeFetch<any>(`${API_URL}/api/reports?preset=${range}`);

            if (result?.success && result?.data) {
                setReportData(result.data);
            } else {
                setError(result?.error || 'Failed to load analytics from local API.');
            }
        } catch (err) {
            console.error(err);
            setError('Network error. Could not connect to backend.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(preset); }, [preset, fetchData]);

    const handleRefresh = () => startTransition(() => { fetchData(preset); });

    const handlePdfExport = async () => {
        if (!reportData) return;
        setIsExporting(true);
        setExportToast(null);
        try {
            const [{ pdf }, { ReportPDF }] = await Promise.all([
                import('@react-pdf/renderer'),
                import('./ReportPDF'),
            ]);

            const blob = await pdf(<ReportPDF data={reportData as any} isPro={isPro} businessType={businessType} />).toBlob();
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            const dateStr = new Date().toISOString().split('T')[0];
            anchor.download = `zipsellix-analytics-${preset}-${dateStr}.pdf`;
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);
            URL.revokeObjectURL(url);

            setExportToast({
                type: 'success',
                message: 'PDF downloaded successfully!',
            });
        } catch (err) {
            console.error('[PDF_EXPORT_ERROR]', err);
            setExportToast({ type: 'error', message: 'PDF generation failed. Please try again.' });
        } finally {
            setIsExporting(false);
            setTimeout(() => setExportToast(null), 5000);
        }
    };

    const d = reportData;
    const lastUpdated = d?.generatedAt
        ? new Date(d.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '--:--';

    const insightBgs: Record<SmartInsight['type'], string> = {
        growth: 'border-l-[#20A46B] bg-[#20A46B]/5',
        warning: 'border-l-[#EEBE1C] bg-[#EEBE1C]/10',
        info: 'border-l-[#304250] bg-[#304250]/5',
    };
    const insightIcons: Record<SmartInsight['type'], React.ElementType> = {
        growth: TrendingUp,
        warning: AlertTriangle,
        info: Info,
    };

    return (
        <div className="min-h-screen pb-24 font-sans text-[#304250] selection:bg-[#20A46B]/20 selection:text-[#20A46B]">
            {/* COMPACT TOP HEADER */}
            <div className="flex flex-row items-center justify-between gap-4 mb-6 pb-4 border-b border-[#304250]/10">
                <div className="flex items-center gap-2 text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-[#304250]/50">
                    <span className="flex items-center gap-1.5"><Clock size={14} className="text-[#304250]/40" /> <span className="hidden sm:inline">Updated:</span> {lastUpdated}</span>
                    <button
                        onClick={handleRefresh}
                        className={`hover:text-[#20A46B] transition-colors ml-1 ${isPending ? 'animate-spin text-[#20A46B]' : ''}`}
                    >
                        <RefreshCcw size={14} />
                    </button>
                </div>

                <div className="flex flex-row items-center gap-3">
                    {/* Compact Select/Dropdown */}
                    <div className="relative bg-white border border-[#304250]/10 rounded-xl shadow-sm hover:border-[#20A46B]/30 transition-colors">
                        <select
                            value={preset}
                            onChange={e => setPreset(e.target.value as DateRangePreset)}
                            className="bg-transparent text-[11px] uppercase tracking-wider font-extrabold text-[#304250] outline-none cursor-pointer appearance-none pl-4 pr-9 py-2.5 w-[120px] sm:w-[140px]"
                        >
                            {DATE_RANGES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                        <ChevronDown size={14} className="text-[#304250]/40 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {/* PDF Button */}
                    <button
                        id="btn-export-pdf"
                        onClick={handlePdfExport}
                        disabled={isExporting || !reportData}
                        className="flex items-center justify-center gap-2 bg-[#304250] hover:bg-[#304250]/90 disabled:bg-gray-200 disabled:text-[#304250]/40 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-widest transition-all shadow-[0_4px_14px_rgba(48,66,80,0.3)] disabled:shadow-none active:scale-95"
                    >
                        {isExporting ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                        <span className="whitespace-nowrap">{isExporting ? 'Wait…' : 'PDF'}</span>
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm font-bold text-red-700 flex items-center gap-3 shadow-sm">
                    <XCircle size={18} /> {error}
                    <button onClick={handleRefresh} className="ml-auto text-red-500 hover:text-red-700 font-black text-xs uppercase tracking-widest bg-white px-3 py-1.5 rounded-md border border-red-100 shadow-sm active:scale-95 transition-all">Retry</button>
                </div>
            )}

            {loading && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-[24px] border border-[#304250]/5 shadow-sm p-6 animate-pulse h-[320px]">
                                <div className="h-4 bg-gray-100 rounded w-40 mb-6" />
                                <div className="h-full bg-gray-50 rounded-xl border border-[#304250]/5" />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!loading && d && (
                <>
                    {d.insights && d.insights.length > 0 && (
                        <div className="mb-8 overflow-x-auto custom-scrollbar pb-3">
                            <div className="flex gap-4 min-w-max px-1">
                                {d.insights.map((insight, i) => {
                                    const InsightIcon = insightIcons[insight.type];
                                    return (
                                        <motion.div
                                            key={insight.id}
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.35, delay: i * 0.08, ease: 'easeOut' }}
                                            className={`border-l-4 p-5 rounded-2xl shadow-sm min-w-[300px] max-w-[360px] flex items-start gap-4 border border-[#304250]/5 hover:shadow-[0_8px_30px_rgba(48,66,80,0.06)] transition-all duration-300 ${insightBgs[insight.type]}`}
                                        >
                                            <div className="bg-white p-2.5 rounded-xl flex-shrink-0 shadow-sm border border-[#304250]/5">
                                                <InsightIcon size={18} style={{ color: insight.type === 'growth' ? BRAND_GREEN : insight.type === 'warning' ? '#c2410c' : '#304250' }} />
                                            </div>
                                            <div className="min-w-0 pt-0.5">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <h4 className="text-[10px] font-black text-[#304250]/50 uppercase tracking-widest">{insight.title}</h4>
                                                </div>
                                                <p className="text-sm font-bold text-[#304250] leading-relaxed">{insight.message}</p>
                                                {insight.metric && (
                                                    <div className="mt-3 flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg w-fit border border-[#304250]/5 shadow-sm">
                                                        <span className="text-base font-black" style={{ color: insight.type === 'growth' ? BRAND_GREEN : insight.type === 'warning' ? '#c2410c' : '#304250' }}>
                                                            {insight.metric}
                                                        </span>
                                                        {insight.metricLabel && <span className="text-[9px] font-black text-[#304250]/40 uppercase tracking-widest">{insight.metricLabel}</span>}
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* TABS NAVIGATION */}
                    <div className="grid grid-cols-2 md:flex md:flex-wrap items-center gap-2.5 mb-8">
                        {TABS.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center justify-center md:justify-start gap-2 px-3 sm:px-5 py-3.5 sm:py-3 text-[11px] sm:text-xs uppercase tracking-widest font-black rounded-xl transition-all border outline-none active:scale-95 ${isActive
                                        ? 'text-white shadow-[0_4px_14px_rgba(32,164,107,0.3)] border-transparent'
                                        : 'bg-white text-[#304250]/50 hover:text-[#304250] hover:bg-gray-50 border-[#304250]/10 shadow-sm'
                                        }`}
                                    style={isActive ? { backgroundColor: BRAND_GREEN } : {}}
                                >
                                    <Icon size={16} className={`shrink-0 ${isActive ? 'text-white' : 'text-[#304250]/40'}`} />
                                    <span className="truncate">{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                        >
                            {activeTab === 'overview' && <OverviewTab d={d} />}
                            {activeTab === 'pnl' && <PnlTab d={d} />}
                            {activeTab === 'orders' && <OrdersTab d={d} />}
                            {activeTab === 'rto' && <RtoTab d={d} />}
                            {activeTab === 'products' && businessType?.toUpperCase() !== 'SERVICE' && <ProductsTab d={d} mode="product" />}
                            {activeTab === 'services' && businessType?.toUpperCase() === 'SERVICE' && <ProductsTab d={d} mode="service" />}
                            {activeTab === 'ledger' && (
                                <LedgerTab
                                    d={d}
                                    searchQuery={searchQuery}
                                    setSearchQuery={setSearchQuery}
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </>
            )}

            <AnimatePresence>
                {exportToast && (
                    <motion.div
                        key="export-toast"
                        initial={{ opacity: 0, y: 16, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 16, scale: 0.95 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="fixed bottom-6 right-6 z-50 max-w-sm"
                    >
                        <div className={`flex items-start gap-4 p-5 rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border ${exportToast.type === 'success'
                            ? 'bg-white border-[#20A46B]/20'
                            : 'bg-white border-rose-200'
                            }`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-inner border ${exportToast.type === 'success'
                                ? 'bg-[#20A46B]/10 border-[#20A46B]/20'
                                : 'bg-rose-100 border-rose-200'
                                }`}>
                                {exportToast.type === 'success'
                                    ? <CheckCircle2 size={20} className="text-[#20A46B]" />
                                    : <XCircle size={20} className="text-rose-500" />}
                            </div>
                            <div className="min-w-0 flex-1 pt-0.5">
                                <p className={`text-sm font-black mb-1 tracking-wide ${exportToast.type === 'success'
                                    ? 'text-[#20A46B]'
                                    : 'text-rose-600'
                                    }`}>
                                    {exportToast.type === 'success' ? 'Export Complete' : 'Export Failed'}
                                </p>
                                <p className="text-xs font-bold text-[#304250]/70 leading-relaxed">
                                    {exportToast.message}
                                </p>
                            </div>
                            <button
                                onClick={() => setExportToast(null)}
                                className="text-[#304250]/40 hover:text-[#304250] transition-colors flex-shrink-0 p-1 active:scale-95"
                            >
                                <XCircle size={18} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #30425020; border-radius: 10px; }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: #30425040; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}