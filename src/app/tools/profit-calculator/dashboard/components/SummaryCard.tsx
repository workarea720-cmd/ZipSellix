import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export function SummaryCard({ title, value, icon, iconBg, trendBg, trend, isPositive }: any) {
    return (
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 relative overflow-hidden group hover:shadow-md transition-shadow duration-300">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase mb-2">{title}</p>
                    <h3 className="text-slate-900 text-2xl font-black">{value}</h3>
                </div>
                <div className={`${iconBg || 'bg-slate-100 text-slate-500'} h-8 w-8 rounded-lg flex items-center justify-center`}>
                    {icon}
                </div>
            </div>
            <div className="mt-4 flex flex-col items-start gap-1">
                <div className={`${trendBg || 'bg-slate-100 text-slate-600'} text-[10px] px-2 py-0.5 rounded-md font-medium flex items-center gap-1`}>
                    {isPositive ? <ArrowUpRight size={10} strokeWidth={3} /> : <ArrowDownRight size={10} strokeWidth={3} />} {trend}
                </div>
            </div>
        </div>
    );
}
