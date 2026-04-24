import React, { useState, useRef, useEffect } from 'react';
import { TrendingUp, ShoppingCart, DollarSign, Wallet, AlertTriangle, ChevronDown, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
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

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white px-4 py-3 rounded-xl shadow-[0_8px_30px_rgba(48,66,80,0.12)] border border-[#304250]/10 min-w-[160px]">
            <p className="text-[11px] font-extrabold text-[#304250]/60 uppercase tracking-widest mb-2 pb-2 border-b border-[#304250]/5">{label}</p>
            {payload.map((p: any, i: number) => (
                <div key={i} className="flex items-center justify-between gap-4 py-0.5">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                        <span className="text-xs font-extrabold text-[#304250]/80">{p.name}</span>
                    </div>
                    <span className="text-xs font-black text-[#304250]">Rs {(p.value || 0).toLocaleString()}</span>
                </div>
            ))}
        </div>
    );
};

const CustomLegend = ({ payload }: any) => {
    if (!payload?.length) return null;
    return (
        <div className="flex items-center justify-center gap-5 pt-3 pb-1">
            {payload.map((entry: any, i: number) => (
                <div key={i} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-[11px] font-extrabold text-[#304250]/70 uppercase tracking-wider">{entry.value}</span>
                </div>
            ))}
        </div>
    );
};

// 👇 YAHAN SE DESKTOP KE LIYE VIBRANT CARD ADD KIYA HAI
const VibrantCard = ({ title, value, icon, colorClass, trend, isPositive }: any) => (
    <div className={`p-5 rounded-2xl flex flex-col h-[140px] relative overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 ${colorClass}`}>
        <div className="flex justify-between items-start z-10 w-full">
            <span className="text-xs font-bold text-white/90 uppercase tracking-widest truncate">{title}</span>
            <div className="w-10 h-10 shrink-0 rounded-full bg-white/20 flex items-center justify-center shadow-inner backdrop-blur-md">
                {icon}
            </div>
        </div>
        <div className="z-10 flex flex-col mt-auto pt-2">
            <span className="text-3xl font-black text-white tracking-tight leading-none">{value}</span>
            <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1 bg-white/20 text-white shrink-0">
                    {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {trend}
                </span>
                <span className="text-xs text-white/70 truncate">vs last month</span>
            </div>
        </div>
        {/* Background decorative circle for extra premium look */}
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
    </div>
);

export default function DesktopUI({ logic }: { logic: DashboardLogicReturn }) {
    const {
        summary, chartData, chartRange, setChartRange, pendingCOD, topProducts, lowStockItems, netProfit, setActiveTab
    } = logic;

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const filterRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
                setIsFilterOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const currentRangeLabel = RANGE_OPTIONS.find(r => r.value === chartRange)?.label || 'Last 7 Days';

    // Check if there's any non-zero data
    const hasData = chartData.some((d: any) => d.total > 0 || d.delivered > 0 || d.pending > 0 || d.returned > 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 font-sans text-[#304250] selection:bg-[#20A46B]/20 selection:text-[#20A46B]">
            {/* 👇 VIBRANT CARDS GRID FOR DESKTOP 👇 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <VibrantCard title="Sales" value={`Rs ${summary.todaySales?.toLocaleString() || 0}`} icon={<TrendingUp size={18} className="text-white" />} colorClass="bg-blue-600" trend="12%" isPositive={true} />
                <VibrantCard title="Orders" value={summary.totalOrders || 0} icon={<ShoppingCart size={18} className="text-white" />} colorClass="bg-brand-primary" trend="New" isPositive={true} />
                <VibrantCard title="COD Pending" value={`Rs ${(pendingCOD / 1000).toFixed(1)}k`} icon={<DollarSign size={18} className="text-white" />} colorClass="bg-rose-500" trend="Wait" isPositive={false} />
                <VibrantCard title="Net Profit" value={`Rs ${(netProfit / 1000).toFixed(1)}k`} icon={<Wallet size={18} className="text-white" />} colorClass="bg-amber-400" trend="Margin" isPositive={true} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* CHART SECTION */}
                <div className="lg:col-span-2 bg-white rounded-3xl shadow-[0_8px_30px_rgba(48,66,80,0.04)] border border-[#304250]/10 flex flex-col">
                    {/* Header */}
                    <div className="flex justify-between items-center px-6 pt-6 pb-2">
                        <div>
                            <h3 className="text-base font-extrabold text-[#304250]">Sales Overview</h3>
                            <p className="text-[11px] font-bold text-[#304250]/50 uppercase tracking-widest mt-0.5">Revenue breakdown by status</p>
                        </div>

                        {/* Filter Dropdown */}
                        <div className="relative" ref={filterRef}>
                            <button
                                type="button"
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className="bg-gray-50 border border-[#304250]/10 text-[#304250] py-2 px-3.5 rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-sm hover:bg-white hover:border-[#20A46B]/30 transition-all duration-200 active:scale-[0.98] whitespace-nowrap outline-none"
                            >
                                <span>{currentRangeLabel}</span>
                                <ChevronDown size={14} className={`text-[#304250]/40 transition-transform duration-300 ${isFilterOpen ? 'rotate-180 text-[#20A46B]' : ''}`} />
                            </button>

                            {isFilterOpen && (
                                <div className="absolute top-full right-0 mt-2 w-44 bg-white border border-[#304250]/10 rounded-xl shadow-[0_8px_30px_rgba(48,66,80,0.12)] z-50 overflow-hidden animate-in zoom-in-95 fade-in slide-in-from-top-2 duration-200 ease-out origin-top-right">
                                    {RANGE_OPTIONS.map(opt => (
                                        <div
                                            key={opt.value}
                                            onClick={() => { setChartRange(opt.value); setIsFilterOpen(false); }}
                                            className={`px-4 py-3 text-xs font-extrabold cursor-pointer transition-colors ${chartRange === opt.value
                                                ? 'bg-[#20A46B]/10 text-[#20A46B]'
                                                : 'text-[#304250]/70 hover:bg-gray-50 hover:text-[#304250]'
                                                }`}
                                        >
                                            {opt.label}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="flex-1 px-4 pb-4 pt-2">
                        {hasData ? (
                            <div className="h-[280px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                                        <defs>
                                            <linearGradient id="gradDelivered" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#10b981" stopOpacity={0.15} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="gradPending" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.12} />
                                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="gradReturned" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#30425015" />
                                        <XAxis
                                            dataKey="day"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 10, fill: '#30425080', fontWeight: 800 }}
                                            dy={10}
                                            interval={chartData.length > 15 ? Math.floor(chartData.length / 8) : 0}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 10, fill: '#30425080', fontWeight: 800 }}
                                            dx={-5}
                                            tickFormatter={(val: number) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : `${val}`}
                                        />
                                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#30425020', strokeWidth: 1 }} />
                                        <Legend content={<CustomLegend />} />
                                        <Area
                                            type="monotone"
                                            dataKey="delivered"
                                            name="Delivered"
                                            stroke={STATUS_COLORS.delivered.stroke}
                                            strokeWidth={2.5}
                                            fill="url(#gradDelivered)"
                                            dot={chartData.length <= 15 ? { r: 3, fill: STATUS_COLORS.delivered.fill, strokeWidth: 2, stroke: '#fff' } : false}
                                            activeDot={{ r: 5, fill: STATUS_COLORS.delivered.fill, strokeWidth: 2, stroke: '#fff' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="pending"
                                            name="Pending"
                                            stroke={STATUS_COLORS.pending.stroke}
                                            strokeWidth={2.5}
                                            fill="url(#gradPending)"
                                            dot={chartData.length <= 15 ? { r: 3, fill: STATUS_COLORS.pending.fill, strokeWidth: 2, stroke: '#fff' } : false}
                                            activeDot={{ r: 5, fill: STATUS_COLORS.pending.fill, strokeWidth: 2, stroke: '#fff' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="returned"
                                            name="Returned"
                                            stroke={STATUS_COLORS.returned.stroke}
                                            strokeWidth={2.5}
                                            fill="url(#gradReturned)"
                                            dot={chartData.length <= 15 ? { r: 3, fill: STATUS_COLORS.returned.fill, strokeWidth: 2, stroke: '#fff' } : false}
                                            activeDot={{ r: 5, fill: STATUS_COLORS.returned.fill, strokeWidth: 2, stroke: '#fff' }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-[280px] flex flex-col items-center justify-center text-center">
                                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-4 border border-[#304250]/10 shadow-sm">
                                    <BarChart3 size={24} className="text-[#304250]/30" />
                                </div>
                                <p className="text-sm font-extrabold text-[#304250]/60">No sales data yet</p>
                                <p className="text-[11px] font-medium text-[#304250]/40 mt-1 uppercase tracking-widest">Start adding orders to see your sales trend</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* LISTS */}
                <div className="space-y-6">
                    {/* Top Products */}
                    <div className="bg-white p-6 rounded-[24px] shadow-sm hover:shadow-[0_8px_30px_rgba(48,66,80,0.06)] border border-[#304250]/10 transition-all duration-300">
                        <h3 className="font-extrabold text-sm text-[#304250] mb-4 uppercase tracking-widest">Top Products</h3>
                        <div className="space-y-4">
                            {(topProducts as any[]).map((p, i) => (
                                <div key={i} className="flex items-center gap-4 group cursor-default">
                                    <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-[#304250]/40 font-extrabold text-lg group-hover:scale-110 group-hover:bg-[#20A46B]/10 group-hover:text-[#20A46B] group-hover:shadow-sm border border-[#304250]/5 transition-all duration-300">
                                        {(p.name && typeof p.name === 'string') ? p.name.charAt(0).toUpperCase() : '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-extrabold text-[#304250] truncate">{p.name}</p>
                                        <p className="text-[10px] font-bold text-[#304250]/50 uppercase tracking-widest mt-0.5">{p.sold} sold</p>
                                    </div>
                                    <div className="text-xs font-black text-[#304250]/40 group-hover:text-[#EEBE1C] transition-colors">#{i + 1}</div>
                                </div>
                            ))}
                            {topProducts.length === 0 && <p className="text-[11px] font-bold text-[#304250]/40 text-center py-4 uppercase tracking-widest">No sales recorded yet.</p>}
                        </div>
                    </div>

                    {/* Low Stock Items */}
                    <div className="bg-white p-6 rounded-[24px] shadow-sm hover:shadow-[0_8px_30px_rgba(48,66,80,0.06)] border border-[#304250]/10 relative overflow-hidden transition-all duration-300">
                        <h3 className="font-extrabold text-sm text-[#304250] flex items-center gap-2 mb-4 uppercase tracking-widest"><AlertTriangle size={18} className="text-[#EEBE1C]" /> Low Stock</h3>
                        <div className="space-y-3">
                            {(lowStockItems as any[]).slice(0, 3).map((p, i) => (
                                <div key={i} className="flex justify-between items-center p-3 bg-white rounded-xl border border-[#304250]/10 hover:border-[#EEBE1C]/50 hover:bg-[#EEBE1C]/5 hover:shadow-sm transition-all cursor-default group">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-[#304250]/40 text-xs font-black border border-[#304250]/5 group-hover:text-[#EEBE1C] group-hover:border-[#EEBE1C]/30 transition-colors shadow-sm">{(p.name || '?').charAt(0)}</div>
                                        <p className="text-xs font-extrabold text-[#304250] truncate">{p.name}</p>
                                    </div>
                                    <span className="bg-[#EEBE1C]/10 text-[#EEBE1C] border border-[#EEBE1C]/30 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm">{p.currentStock} Left</span>
                                </div>
                            ))}
                            {lowStockItems.length === 0 && <div className="text-center py-4"><p className="text-[#20A46B] text-[10px] font-extrabold uppercase tracking-widest bg-[#20A46B]/10 py-2 px-4 rounded-full border border-[#20A46B]/20 inline-block">Stock levels healthy! ✅</p></div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}