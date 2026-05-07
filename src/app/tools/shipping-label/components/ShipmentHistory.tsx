'use client';
// src/app/tools/shipping-label/components/ShipmentHistory.tsx
// Real shipment history table with stats, tracking, cancel

import React, { useState, useEffect, useCallback } from 'react';
import {
    Package, Truck, CheckCircle2, AlertCircle, RotateCcw,
    Search, Download, Printer, Eye, X, RefreshCw,
    MapPin, Loader2, ChevronLeft, ChevronRight, Copy, Check,
    TrendingUp, Clock, XCircle, Ban
} from 'lucide-react';

type ShipmentStatus = 'BOOKED' | 'PICKED_UP' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'FAILED' | 'RETURNED' | 'CANCELLED';

interface Shipment {
    id: string;
    trackingNumber: string;
    routingCode?: string;
    courierName: string;
    shipmentStatus: ShipmentStatus;
    orderRef?: string;
    paymentType: string;
    codAmount: number;
    receiverName: string;
    receiverCity: string;
    receiverPhone: string;
    senderName: string;
    weight?: string;
    bookedAt: string;
}

interface Stats { total: number; booked: number; inTransit: number; delivered: number; failed: number; }

const STATUS_CONFIG: Record<ShipmentStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    BOOKED: { label: 'Booked', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', icon: <Package size={11} /> },
    PICKED_UP: { label: 'Picked Up', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200', icon: <Package size={11} /> },
    IN_TRANSIT: { label: 'In Transit', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', icon: <Truck size={11} /> },
    OUT_FOR_DELIVERY: { label: 'Out for Delivery', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200', icon: <MapPin size={11} /> },
    DELIVERED: { label: 'Delivered', color: 'text-green-600', bg: 'bg-green-50 border-green-200', icon: <CheckCircle2 size={11} /> },
    FAILED: { label: 'Failed', color: 'text-red-600', bg: 'bg-red-50 border-red-200', icon: <AlertCircle size={11} /> },
    RETURNED: { label: 'Returned', color: 'text-red-500', bg: 'bg-red-50 border-red-100', icon: <RotateCcw size={11} /> },
    CANCELLED: { label: 'Cancelled', color: 'text-gray-500', bg: 'bg-gray-50 border-gray-200', icon: <Ban size={11} /> },
};

function StatusBadge({ status }: { status: ShipmentStatus }) {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.BOOKED;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.bg} ${cfg.color}`}>
            {cfg.icon} {cfg.label}
        </span>
    );
}

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button onClick={copy} className="p-1 rounded hover:bg-gray-100 text-[#304250]/40 hover:text-[#304250] transition-colors">
            {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
        </button>
    );
}

export default function ShipmentHistory() {
    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [stats, setStats] = useState<Stats>({ total: 0, booked: 0, inTransit: 0, delivered: 0, failed: 0 });
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [cancelling, setCancelling] = useState<string | null>(null);

    const fetchShipments = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), limit: '15' });
            if (statusFilter !== 'ALL') params.append('status', statusFilter);
            const res = await fetch(`/api/courier/shipments?${params}`);
            const data = await res.json();
            setShipments(data.shipments || []);
            setStats(data.stats || { total: 0, booked: 0, inTransit: 0, delivered: 0, failed: 0 });
            setTotalPages(data.pagination?.pages || 1);
        } catch (e) {
            console.error('Failed to fetch shipments:', e);
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter]);

    useEffect(() => { fetchShipments(); }, [fetchShipments]);

    const cancelShipment = async (id: string) => {
        if (!confirm('Cancel this shipment?')) return;
        setCancelling(id);
        try {
            const res = await fetch('/api/courier/shipments', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ shipmentId: id }),
            });
            if (res.ok) fetchShipments();
            else {
                const d = await res.json();
                alert(d.error || 'Cannot cancel');
            }
        } finally { setCancelling(null); }
    };

    const filtered = shipments.filter(s =>
        !search ||
        s.trackingNumber.toLowerCase().includes(search.toLowerCase()) ||
        s.receiverName.toLowerCase().includes(search.toLowerCase()) ||
        s.orderRef?.toLowerCase().includes(search.toLowerCase())
    );

    const statCards = [
        { label: 'Total', value: stats.total, icon: <Package size={18} />, color: 'text-[#304250]', bg: 'bg-gray-50' },
        { label: 'Booked', value: stats.booked, icon: <Clock size={18} />, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'In Transit', value: stats.inTransit, icon: <Truck size={18} />, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Delivered', value: stats.delivered, icon: <CheckCircle2 size={18} />, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Failed', value: stats.failed, icon: <XCircle size={18} />, color: 'text-red-600', bg: 'bg-red-50' },
    ];

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 animate-in fade-in duration-300">

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
                {statCards.map(c => (
                    <div key={c.label} className={`${c.bg} rounded-2xl p-4 border border-white/60`}>
                        <div className={`${c.color} mb-1`}>{c.icon}</div>
                        <p className={`text-2xl font-black ${c.color}`}>{c.value}</p>
                        <p className="text-[11px] font-bold text-[#304250]/50 uppercase tracking-widest">{c.label}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-[#304250]/10 shadow-sm p-4 mb-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#304250]/40" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search by tracking #, name, or order ref..."
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#304250]/15 text-sm font-medium focus:outline-none focus:border-[#20A46B] text-[#304250] placeholder:text-[#304250]/30"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                        className="px-3 py-2.5 rounded-xl border border-[#304250]/15 text-sm font-bold text-[#304250] focus:outline-none focus:border-[#20A46B]"
                    >
                        <option value="ALL">All Status</option>
                        {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                            <option key={k} value={k}>{v.label}</option>
                        ))}
                    </select>
                    <button onClick={fetchShipments} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#20A46B]/10 text-[#20A46B] text-sm font-bold hover:bg-[#20A46B]/20 transition-colors">
                        <RefreshCw size={14} /> Refresh
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-[#304250]/10 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 size={28} className="animate-spin text-[#20A46B]" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16">
                        <Package size={40} className="text-[#304250]/20 mx-auto mb-3" />
                        <p className="font-bold text-[#304250]/40">No shipments found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-[#304250]/10 bg-gray-50/50">
                                    {['Tracking #', 'Receiver', 'Courier', 'Status', 'COD', 'Date', 'Actions'].map(h => (
                                        <th key={h} className="text-left px-4 py-3 text-[10px] font-extrabold text-[#304250]/50 uppercase tracking-widest whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((s, i) => (
                                    <tr key={s.id} className={`border-b border-[#304250]/5 hover:bg-gray-50/50 transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/20'}`}>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                <span className="font-mono font-bold text-[#304250] text-xs">{s.trackingNumber}</span>
                                                <CopyButton text={s.trackingNumber} />
                                            </div>
                                            {s.routingCode && <span className="text-[10px] text-[#20A46B] font-bold">{s.routingCode}</span>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="font-bold text-[#304250] text-xs">{s.receiverName}</p>
                                            <p className="text-[10px] text-[#304250]/50">{s.receiverCity} · {s.receiverPhone}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs font-bold text-[#304250]">{s.courierName}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge status={s.shipmentStatus} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs font-bold text-[#304250]">
                                                {s.paymentType === 'COD' ? `Rs ${s.codAmount.toLocaleString()}` : 'Prepaid'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-[10px] text-[#304250]/50 whitespace-nowrap">
                                            {new Date(s.bookedAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                <a
                                                    href={`/tools/shipping-label?track=${s.trackingNumber}&courier=${s.courierName}`}
                                                    className="p-1.5 rounded-lg hover:bg-[#20A46B]/10 text-[#304250]/50 hover:text-[#20A46B] transition-colors"
                                                    title="Track"
                                                >
                                                    <MapPin size={13} />
                                                </a>
                                                {['BOOKED', 'PICKED_UP'].includes(s.shipmentStatus) && (
                                                    <button
                                                        onClick={() => cancelShipment(s.id)}
                                                        disabled={cancelling === s.id}
                                                        className="p-1.5 rounded-lg hover:bg-red-50 text-[#304250]/50 hover:text-red-500 transition-colors disabled:opacity-50"
                                                        title="Cancel"
                                                    >
                                                        {cancelling === s.id ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-[#304250]/10">
                        <span className="text-xs text-[#304250]/50 font-medium">Page {page} of {totalPages}</span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-1.5 rounded-lg border border-[#304250]/10 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                            >
                                <ChevronLeft size={14} />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-1.5 rounded-lg border border-[#304250]/10 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}