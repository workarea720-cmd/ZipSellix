import React, { useState, useRef, useEffect } from 'react';
import { TrendingUp, ShoppingCart, DollarSign, Wallet, AlertTriangle, ChevronDown, ArrowUpRight, ArrowDownRight, BarChart3 } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DashboardLogicReturn } from '../useDashboardLogic';
import type { ChartRange } from '../useDashboardLogic';

const RANGE_OPTIONS: { value: ChartRange; label: string }[] = [
    { value: '7days', label: 'Last 7 Days' },
    { value: '15days', label: 'Last 15 Days' },
    { value: '30days', label: 'Last 1 Month' },
    { value: 'all', label: 'All Time' },
];

const STATUS_COLORS = {
    delivered: { stroke: '#10b981', fill: '#10b981', label: 'Delivered' },
    pending: { stroke: '#f59e0b', fill: '#f59e0b', label: 'Pending' },
    returned: { stroke: '#ef4444', fill: '#ef4444', label: 'Returned' },
};

const MobileTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-[#304250]/10 min-w-[130px]">
            <p className="text-[10px] font-extrabold text-[#304250]/50 mb-1 pb-1 border-b border-[#304250]/5 uppercase tracking-widest">{label}</p>
            {payload.map((p: any, i: number) => (
                <div key={i} className="flex items-center justify-between gap-3 py-0.5">
                    <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
                        <span className="text-[10px] font-bold text-[#304250]/70">{p.name}</span>
                    </div>
                    <span className="text-[10px] font-black text-[#304250]">Rs {(p.value || 0).toLocaleString()}</span>
                </div>
            ))}
        </div>
    );
};

const MobileLegend = ({ payload }: any) => {
    if (!payload?.length) return null;
    return (
        <div className="flex items-center justify-center gap-4 pt-2">
            {payload.map((entry: any, i: number) => (
                <div key={i} className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-[9px] font-extrabold text-[#304250]/60 uppercase tracking-wider">{entry.value}</span>
                </div>
            ))}
        </div>
    );
};

export default function MobileUI({ logic }: { logic: DashboardLogicReturn }) {
    const {
        summary, chartData, chartRange, setChartRange, pendingCOD, topProducts, lowStockItems, netProfit
    } = logic;

    const hasData = chartData.some((d: any) => d.total > 0 || d.delivered > 0 || d.pending > 0 || d.returned > 0);

    const [isRangeOpen, setIsRangeOpen] = useState(false);
    const rangeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (rangeRef.current && !rangeRef.current.contains(e.target as Node)) setIsRangeOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const currentRangeLabel = RANGE_OPTIONS.find(r => r.value === chartRange)?.label || 'Last 7 Days';

    const VibrantCard = ({ title, value, icon, colorClass, trend, isPositive }: any) => (
        <div className={`p-3.5 rounded-2xl flex flex-col h-[115px] relative overflow-hidden shadow-sm ${colorClass}`}>
            <div className="flex justify-between items-start z-10 w-full">
                <span className="text-[10px] font-bold text-white/90 uppercase tracking-widest truncate">{title}</span>
                <div className="w-7 h-7 shrink-0 rounded-full bg-white/20 flex items-center justify-center shadow-inner backdrop-blur-md">
                    {icon}
                </div>
            </div>
            <div className="z-10 flex flex-col mt-auto pt-1">
                <span className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none">{value}</span>
                <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 bg-white/20 text-white shrink-0">
                        {isPositive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                        {trend}
                    </span>
                    <span className="text-[9px] text-white/70 truncate">vs last month</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-4 animate-in fade-in duration-300 font-sans text-[#304250] pb-8 px-4 pt-4 bg-[#f8fafc] min-h-screen selection:bg-[#20A46B]/20 selection:text-[#20A46B]">

            {/* 1. CARDS GRID */}
            <div className="grid grid-cols-2 gap-3">
                <VibrantCard title="Sales" value={`Rs ${summary.todaySales?.toLocaleString() || 0}`} icon={<TrendingUp size={14} className="text-white" />} colorClass="bg-blue-600" trend="12%" isPositive={true} />
                <VibrantCard title="Orders" value={summary.totalOrders || 0} icon={<ShoppingCart size={14} className="text-white" />} colorClass="bg-[#20A46B]" trend="New" isPositive={true} />
                <VibrantCard title="COD Pending" value={`Rs ${(pendingCOD / 1000).toFixed(1)}k`} icon={<DollarSign size={14} className="text-white" />} colorClass="bg-rose-500" trend="Wait" isPositive={false} />
                <VibrantCard title="Net Profit" value={`Rs ${(netProfit / 1000).toFixed(1)}k`} icon={<Wallet size={14} className="text-white" />} colorClass="bg-amber-400" trend="Margin" isPositive={true} />
            </div>

            {/* 2. CHART SECTION */}
            <div className="bg-white p-4 rounded-2xl shadow-[0_4px_20px_rgba(48,66,80,0.04)] border border-[#304250]/10 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-extrabold text-[#304250]">Sales Overview</h3>
                    <div className="relative shrink-0" ref={rangeRef}>
                        <button
                            type="button"
                            onClick={() => setIsRangeOpen(!isRangeOpen)}
                            className="bg-gray-50 border border-[#304250]/10 text-[#304250]/70 py-1.5 px-2.5 rounded-lg text-[10px] font-extrabold flex items-center gap-1.5 shadow-sm hover:bg-white hover:border-[#20A46B]/30 hover:text-[#304250] transition-all duration-200 active:scale-95 whitespace-nowrap outline-none"
                        >
                            <span>{currentRangeLabel}</span>
                            <ChevronDown size={10} className={`text-[#304250]/40 transition-transform duration-300 ${isRangeOpen ? 'rotate-180 text-[#20A46B]' : ''}`} />
                        </button>
                        {isRangeOpen && (
                            <div className="absolute top-full right-0 mt-1 w-[130px] bg-white border border-[#304250]/10 rounded-xl shadow-[0_8px_30px_rgba(48,66,80,0.12)] z-50 overflow-hidden">
                                {RANGE_OPTIONS.map(opt => (
                                    <div
                                        key={opt.value}
                                        onClick={() => { setChartRange(opt.value); setIsRangeOpen(false); }}
                                        className={`px-3 py-2.5 text-[11px] font-extrabold cursor-pointer transition-colors ${chartRange === opt.value ? 'bg-[#20A46B]/10 text-[#20A46B]' : 'text-[#304250]/70 hover:bg-gray-50 hover:text-[#304250]'}`}
                                    >
                                        {opt.label}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {hasData ? (
                    <div className="h-[160px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                                <defs>
                                    <linearGradient id="gradDeliveredM" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gradPendingM" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.12} />
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gradReturnedM" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#ef4444" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="day"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 9, fill: '#30425060', fontWeight: 800 }}
                                    dy={5}
                                    interval={chartData.length > 10 ? Math.floor(chartData.length / 5) : 0}
                                />
                                <Tooltip content={<MobileTooltip />} />
                                <Legend content={<MobileLegend />} />
                                <Area
                                    type="monotone"
                                    dataKey="delivered"
                                    name="Delivered"
                                    stroke={STATUS_COLORS.delivered.stroke}
                                    strokeWidth={2}
                                    fill="url(#gradDeliveredM)"
                                    dot={chartData.length <= 10 ? { r: 2, fill: STATUS_COLORS.delivered.fill, strokeWidth: 1.5, stroke: '#fff' } : false}
                                    activeDot={{ r: 4, fill: STATUS_COLORS.delivered.fill, strokeWidth: 1.5, stroke: '#fff' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="pending"
                                    name="Pending"
                                    stroke={STATUS_COLORS.pending.stroke}
                                    strokeWidth={2}
                                    fill="url(#gradPendingM)"
                                    dot={chartData.length <= 10 ? { r: 2, fill: STATUS_COLORS.pending.fill, strokeWidth: 1.5, stroke: '#fff' } : false}
                                    activeDot={{ r: 4, fill: STATUS_COLORS.pending.fill, strokeWidth: 1.5, stroke: '#fff' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="returned"
                                    name="Returned"
                                    stroke={STATUS_COLORS.returned.stroke}
                                    strokeWidth={2}
                                    fill="url(#gradReturnedM)"
                                    dot={chartData.length <= 10 ? { r: 2, fill: STATUS_COLORS.returned.fill, strokeWidth: 1.5, stroke: '#fff' } : false}
                                    activeDot={{ r: 4, fill: STATUS_COLORS.returned.fill, strokeWidth: 1.5, stroke: '#fff' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="h-[140px] flex flex-col items-center justify-center text-center bg-gray-50 rounded-xl border border-dashed border-[#304250]/10">
                        <BarChart3 size={20} className="text-[#304250]/20 mb-2" />
                        <p className="text-xs font-extrabold text-[#304250]/50">No sales data yet</p>
                        <p className="text-[10px] font-bold text-[#304250]/30 mt-1 uppercase tracking-widest">Add orders to see trends</p>
                    </div>
                )}
            </div>

            {/* 3. ALERTS & PRODUCTS */}
            <div className="space-y-4">
                {/* Low Stock Alerts */}
                {lowStockItems.length > 0 && (
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#304250]/10">
                        <h3 className="text-sm font-extrabold text-[#304250] flex items-center gap-2 mb-4 uppercase tracking-widest">
                            <span className="w-6 h-6 rounded-full bg-[#EEBE1C]/10 flex items-center justify-center"><AlertTriangle size={12} className="text-[#EEBE1C]" /></span>
                            Low Stock Alerts
                        </h3>
                        <div className="space-y-2">
                            {(lowStockItems as any[]).slice(0, 3).map((p, i) => (
                                <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-[#304250]/5 shadow-sm group">
                                    <p className="text-[11px] sm:text-xs font-bold text-[#304250] truncate pr-2 group-hover:text-[#20A46B] transition-colors">{p.name || 'Unnamed Product'}</p>
                                    <span className="bg-[#EEBE1C]/20 text-[#304250] border border-[#EEBE1C]/50 text-[9px] sm:text-[10px] font-black uppercase px-2 py-1 rounded-md shrink-0 shadow-sm">
                                        {p.currentStock} Left
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Top Products */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#304250]/10">
                    <h3 className="text-sm font-extrabold text-[#304250] mb-4 uppercase tracking-widest">Top Products</h3>
                    <div className="space-y-2">
                        {(topProducts as any[]).map((p, i) => (
                            <div key={i} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-[#304250]/5 group">
                                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gray-100 flex shrink-0 items-center justify-center text-[#304250]/40 font-black text-sm border border-[#304250]/5 group-hover:bg-[#20A46B]/10 group-hover:text-[#20A46B] group-hover:border-[#20A46B]/20 transition-all shadow-sm">
                                    {(p.name && typeof p.name === 'string') ? p.name.charAt(0).toUpperCase() : '?'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs sm:text-[13px] font-extrabold text-[#304250] truncate">{p.name}</p>
                                    <p className="text-[10px] font-bold text-[#304250]/50 uppercase tracking-wider mt-0.5">{p.sold} units sold</p>
                                </div>
                                <div className="text-[10px] sm:text-[11px] font-black text-[#304250]/50 bg-gray-100 px-2 py-1 rounded-md shrink-0 group-hover:text-[#EEBE1C] group-hover:bg-[#EEBE1C]/10 transition-colors">#{i + 1}</div>
                            </div>
                        ))}
                        {topProducts.length === 0 && <p className="text-[11px] font-bold text-[#304250]/40 text-center py-4 bg-gray-50 rounded-xl border border-dashed border-[#304250]/10 uppercase tracking-widest">No sales recorded yet.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}