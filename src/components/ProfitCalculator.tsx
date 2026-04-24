"use client";
import { useState } from 'react';
import { calculateProfit, Courier, Province, PaymentMethod, ProfitResult } from '../utils/profitCalculator';

export default function ProfitCalculator() {
    const [form, setForm] = useState({
        sellingPrice: 3000, costPrice: 1500, marketingCost: 500,
        courier: 'Trax' as Courier, province: 'Punjab' as Province,
        paymentMethod: 'COD' as PaymentMethod, weightKg: 1
    });

    const [result, setResult] = useState<ProfitResult | null>(null);

    const handleCalculate = () => {
        const res = calculateProfit(form);
        setResult(res);
    };

    return (
        <div className="bg-card-bg p-6 rounded-2xl shadow-xl border border-card-border-subtle transform transition hover:scale-[1.02] duration-300">
            <div className="flex items-center gap-2 mb-4">
                <span className="bg-brand-primary-light p-2 rounded-lg text-brand-primary">
                    🧮
                </span>
                <h3 className="text-lg font-bold text-text-main">Profit Calculator</h3>
            </div>

            <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-[10px] font-bold text-text-muted-light uppercase tracking-wider">Selling Price</label>
                        <input type="number" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: Number(e.target.value) })}
                            className="w-full p-2 bg-bg-subtle border border-card-border rounded-lg text-sm focus:ring-2 focus:ring-brand-primary outline-none transition" />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-text-muted-light uppercase tracking-wider">Product Cost</label>
                        <input type="number" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: Number(e.target.value) })}
                            className="w-full p-2 bg-bg-subtle border border-card-border rounded-lg text-sm focus:ring-2 focus:ring-brand-primary outline-none transition" />
                    </div>
                </div>

                <button onClick={handleCalculate} className="w-full bg-brand-secondary hover:bg-brand-secondary-hover text-white font-semibold py-3 rounded-lg transition-all active:scale-95 text-sm shadow-lg shadow-slate-200">
                    Calculate Net Profit
                </button>

                {result && (
                    <div className="mt-4 pt-4 border-t border-dashed border-card-border bg-bg-subtle p-3 rounded-lg">
                        <div className="flex justify-between items-end mb-1">
                            <span className="text-text-muted text-xs font-medium">Net Profit</span>
                            <span className={`text-2xl font-bold ${result.netProfit > 0 ? 'text-brand-primary' : 'text-red-500'}`}>Rs {result.netProfit}</span>
                        </div>
                        <div className="flex justify-between text-xs mt-2">
                            <span className="bg-card-bg border border-card-border px-2 py-1 rounded text-text-muted font-medium">Margin: {result.marginPercentage}</span>
                            <span className="text-text-muted-light py-1">Hidden Tax: Rs {result.breakdown.revenue.whtDeduction}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}