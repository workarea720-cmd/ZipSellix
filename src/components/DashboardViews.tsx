'use client';

import React from 'react';
import {
    ResponsiveContainer, LineChart, Line, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend
} from 'recharts';

const chartData = [
    { day: 'Mon', delivered: 45000, returned: 8500 },
    { day: 'Tue', delivered: 52000, returned: 6200 },
    { day: 'Wed', delivered: 38000, returned: 9100 },
    { day: 'Thu', delivered: 61000, returned: 7400 },
    { day: 'Fri', delivered: 59000, returned: 8800 },
    { day: 'Sat', delivered: 75000, returned: 10500 },
    { day: 'Sun', delivered: 82000, returned: 12000 },
];

const recentOrders = [
    { id: '#ORD-9021', customer: 'Ali Hassan', amount: 'PKR 4,500', status: 'Delivered', color: 'text-brand-primary bg-brand-primary-light border-brand-primary/30' },
    { id: '#ORD-9022', customer: 'Sarah Khan', amount: 'PKR 2,850', status: 'Pending COD', color: 'text-amber-700 bg-amber-50 border-amber-200' },
    { id: '#ORD-9023', customer: 'Usman Tariq', amount: 'PKR 7,200', status: 'Returned', color: 'text-rose-700 bg-rose-50 border-rose-200' },
    { id: '#ORD-9024', customer: 'Fatima Bilal', amount: 'PKR 1,500', status: 'In Transit', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
];

export function DeliveryChart() {
    return (
        <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} tickFormatter={(val: number) => `Rs ${val / 1000}k`} />
                    <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value?: number) => [`PKR ${(value ?? 0).toLocaleString()}`, '']}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Line type="monotone" name="Delivered Revenue" dataKey="delivered" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" name="Returned Loss" dataKey="returned" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, fill: '#f43f5e', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

export function RecentOrdersTable() {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-bg-subtle border-y border-card-border text-xs uppercase tracking-wider text-text-muted font-bold">
                        <th className="px-6 py-4">Order ID</th>
                        <th className="px-6 py-4">Customer</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4 text-right">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-card-bg">
                    {recentOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-bg-subtle transition-colors">
                            <td className="px-6 py-4 text-sm font-bold text-brand-heading">{order.id}</td>
                            <td className="px-6 py-4 text-sm font-medium text-text-muted">{order.customer}</td>
                            <td className="px-6 py-4 text-sm font-bold text-brand-heading">{order.amount}</td>
                            <td className="px-6 py-4 text-right">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold border ${order.color}`}>
                                    {order.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}