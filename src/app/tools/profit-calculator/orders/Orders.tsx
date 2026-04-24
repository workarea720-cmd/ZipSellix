"use client";
import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
    ShoppingCart, Filter, Plus, Search,
    X, Check, Truck, Trash2, ChevronDown, Edit
} from 'lucide-react';

import { API_URL, safeFetch } from '@/lib/api-client';
import { useBusinessStore } from '@/store/business-store';

/* ── Avatar Helpers ── */
const getInitials = (name: string) => name ? name.substring(0, 2).toUpperCase() : 'CU';
const getAvatarColor = (name: string) => {
    const colors = [
        'bg-blue-50 text-blue-700 border-blue-100', 'bg-emerald-50 text-emerald-700 border-emerald-100',
        'bg-amber-50 text-amber-700 border-amber-100', 'bg-purple-50 text-purple-700 border-purple-100',
        'bg-rose-50 text-rose-700 border-rose-100', 'bg-indigo-50 text-indigo-700 border-indigo-100'
    ];
    const charCode = name ? name.charCodeAt(0) : 0;
    return colors[charCode % colors.length];
}

/* ── Date Formatter ── */
const formatShortDate = (dateStr: string) => {
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
        return dateStr;
    }
}

/* ── Reusable Custom Dropdown ── */
function FormSelect({ value, onChange, options, placeholder }: {
    value: string;
    onChange: (val: string) => void;
    options: { value: string; label: string }[];
    placeholder?: string;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const selectedLabel = options.find(o => o.value === value)?.label || placeholder || 'Select...';

    return (
        <div className="relative w-full" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full bg-white border border-[#304250]/10 text-[#304250] py-2.5 px-3 rounded-xl text-sm font-bold flex items-center justify-between gap-2 shadow-sm hover:bg-gray-50 hover:border-[#20A46B]/30 transition-all duration-200 active:scale-[0.98] outline-none focus:ring-1 ring-[#20A46B]/20"
            >
                <span className="truncate">{selectedLabel}</span>
                <ChevronDown size={14} className={`text-[#304250]/40 shrink-0 transition-transform duration-300 ${open ? 'rotate-180 text-[#20A46B]' : ''}`} />
            </button>
            {open && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-[#304250]/10 rounded-xl shadow-[0_8px_30px_rgba(48,66,80,0.12)] z-[60] overflow-hidden max-h-52 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200 ease-out custom-scrollbar">
                    {options.map((opt: any) => (
                        <div
                            key={opt.value}
                            onClick={() => { onChange(opt.value); setOpen(false); }}
                            className={`px-4 py-2.5 text-sm font-bold cursor-pointer transition-colors ${value === opt.value ? 'bg-[#20A46B]/10 text-[#20A46B]' : 'text-[#304250]/70 hover:bg-gray-50 hover:text-[#304250]'}`}
                        >
                            {opt.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

interface OrdersProps {
    products: any[];
    services?: any[];
    orders: any[];
    totalOrders: number;
    settings: any;
    businessType?: string;
    refreshData: () => void;
}

export default function Orders({ products, services = [], orders, totalOrders, settings, businessType = 'STOCK', refreshData }: OrdersProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Bulk Actions State
    const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isBulkStatusOpen, setIsBulkStatusOpen] = useState(false); // 👈 NEW STATE FOR BULK STATUS DROPDOWN

    // --- FILTERING ---
    const filteredOrders = useMemo(() => {
        return orders.filter((o: any) => {
            const matchesSearch = o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                o.orderId.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [orders, searchTerm, statusFilter]);

    // --- BULK SELECTION ---
    const toggleSelectAll = () => {
        if (selectedOrders.length === filteredOrders.length && filteredOrders.length > 0) {
            setSelectedOrders([]);
        } else {
            setSelectedOrders(filteredOrders.map((o: any) => o.id));
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedOrders(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    // --- ACTIONS ---
    const handleStatusChange = async (orderId: string, newStatus: string) => {
        try {
            const res = await safeFetch<any>(`${API_URL}/api/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res?.success) refreshData();
        } catch (e) { alert("Network Error"); }
    };

    const handleBulkStatusChange = async (newStatus: string) => {
        if (!newStatus || selectedOrders.length === 0) return;
        try {
            await Promise.all(selectedOrders.map(id =>
                safeFetch(`${API_URL}/api/orders/${id}/status`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: newStatus })
                })
            ));
            setSelectedOrders([]);
            refreshData();
        } catch (e) {
            alert("Error updating status for some orders.");
        }
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${selectedOrders.length} order(s)?`)) return;
        try {
            await Promise.all(selectedOrders.map(id =>
                safeFetch(`${API_URL}/api/orders/${id}`, { method: 'DELETE' })
            ));
            setSelectedOrders([]);
            refreshData();
        } catch (e) {
            alert("Error deleting some orders.");
        }
    };

    const openEditModal = () => {
        const orderToEdit = orders.find((o: any) => o.id === selectedOrders[0]);
        if (orderToEdit) {
            setEditingOrder(orderToEdit);
            setIsModalOpen(true);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-10 selection:bg-[#20A46B]/20 selection:text-[#20A46B] text-[#304250] font-sans">

            {/* BULK ACTION BAR OR NORMAL TOOLBAR */}
            {selectedOrders.length > 0 ? (
                <div className="bg-[#20A46B]/10 border border-[#20A46B]/20 p-3 sm:p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 shadow-sm relative z-40">
                    <div className="flex items-center gap-3">
                        <span className="bg-[#20A46B] text-white text-xs sm:text-sm font-bold px-3 py-1.5 rounded-full">{selectedOrders.length}</span>
                        <span className="text-sm sm:text-base font-extrabold text-[#20A46B]">Orders Selected</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">

                        {/* 👇 YELLOW ACCENT APPLIED TO BULK STATUS DROPDOWN 👇 */}
                        <div className="relative flex-1 sm:flex-none">
                            <button
                                onClick={() => setIsBulkStatusOpen(!isBulkStatusOpen)}
                                className="w-full sm:w-auto bg-[#EEBE1C] border border-transparent text-[#304250] py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-between gap-2 shadow-[0_2px_8px_rgba(238,190,28,0.3)] hover:bg-[#d9ab18] transition-all duration-200 active:scale-95 outline-none"
                            >
                                <span>Change Status...</span>
                                <ChevronDown size={14} className={`transition-transform duration-300 ${isBulkStatusOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isBulkStatusOpen && (
                                <div className="absolute top-full left-0 sm:right-0 mt-1.5 w-44 bg-white border border-[#304250]/10 rounded-xl shadow-[0_8px_30px_rgba(48,66,80,0.12)] z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 ease-out origin-top-left sm:origin-top-right">
                                    {[
                                        { val: 'PENDING', label: 'Mark as Pending' },
                                        { val: 'DELIVERED', label: 'Mark as Delivered' },
                                        { val: 'RTO', label: 'Mark as Returned' }
                                    ].map(opt => (
                                        <div
                                            key={opt.val}
                                            onClick={() => {
                                                handleBulkStatusChange(opt.val);
                                                setIsBulkStatusOpen(false);
                                            }}
                                            className="px-4 py-2.5 text-xs sm:text-sm font-bold cursor-pointer transition-colors text-[#304250]/70 hover:bg-[#EEBE1C]/10 hover:text-[#304250]"
                                        >
                                            {opt.label}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* EDIT BUTTON (Shows only if 1 order is selected) */}
                        {selectedOrders.length === 1 && (
                            <button
                                onClick={openEditModal}
                                className="bg-white text-blue-500 border border-blue-200 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold hover:bg-blue-50 transition-colors shadow-sm shrink-0 active:scale-95 flex items-center gap-2 outline-none"
                            >
                                <Edit size={16} /> <span className="hidden sm:inline">Edit</span>
                            </button>
                        )}

                        <button
                            onClick={handleBulkDelete}
                            className="bg-white text-red-500 border border-red-200 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold hover:bg-red-50 transition-colors shadow-sm shrink-0 active:scale-95 flex items-center gap-2 outline-none"
                        >
                            <Trash2 size={16} /> <span className="hidden sm:inline">Delete</span>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-row items-center gap-2 relative z-40">
                    <div className="relative flex-1 min-w-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#304250]/40 w-4 h-4" />
                        <input
                            className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#304250]/10 rounded-xl text-xs sm:text-sm font-bold focus:ring-2 ring-[#20A46B]/20 focus:border-[#20A46B] outline-none transition-shadow shadow-sm truncate placeholder:font-medium placeholder:text-[#304250]/30 text-[#304250]"
                            placeholder="Search ID/Name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="relative shrink-0">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="bg-white border border-[#304250]/10 text-[#304250] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-between gap-1.5 shadow-sm hover:bg-gray-50 hover:border-[#20A46B]/30 transition-all duration-200 active:scale-95 outline-none"
                        >
                            <span className="hidden sm:inline">
                                {statusFilter === 'All' ? 'All Status' : statusFilter === 'PENDING' ? 'Pending' : statusFilter === 'DELIVERED' ? 'Delivered' : 'Returned'}
                            </span>
                            <Filter size={16} className="text-[#304250]/60 sm:hidden" />
                            <ChevronDown size={14} className={`text-[#304250]/40 transition-transform duration-300 hidden sm:block ${isFilterOpen ? 'rotate-180 text-[#20A46B]' : ''}`} />
                        </button>

                        {isFilterOpen && (
                            <div className="absolute top-full right-0 sm:left-0 mt-2 w-40 bg-white border border-[#304250]/10 rounded-xl shadow-[0_8px_30px_rgba(48,66,80,0.12)] z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 ease-out origin-top-right sm:origin-top">
                                {['All', 'PENDING', 'DELIVERED', 'RTO'].map(opt => (
                                    <div
                                        key={opt}
                                        onClick={() => { setStatusFilter(opt); setIsFilterOpen(false); }}
                                        className={`px-4 py-2.5 text-xs sm:text-sm font-bold cursor-pointer transition-colors 
                                        ${statusFilter === opt ? 'bg-[#20A46B]/10 text-[#20A46B]' : 'text-[#304250]/70 hover:bg-gray-50 hover:text-[#304250]'}`}
                                    >
                                        {opt === 'All' ? 'All Status' : opt === 'PENDING' ? 'Pending' : opt === 'DELIVERED' ? 'Delivered' : 'Returned'}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => { setIsFilterOpen(false); setEditingOrder(null); setIsModalOpen(true); }}
                        className="shrink-0 bg-[#20A46B] hover:bg-[#20A46B]/90 text-white p-2.5 sm:px-4 sm:py-2.5 rounded-xl font-extrabold text-sm shadow-[0_4px_14px_rgba(32,164,107,0.3)] hover:-translate-y-[1px] transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 outline-none border border-transparent"
                    >
                        <Plus size={18} className="sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Add Order</span>
                    </button>
                </div>
            )}

            {/* 📱 MOBILE VIEW: CARDS LAYOUT */}
            <div className="block md:hidden space-y-4">
                {filteredOrders.length > 0 ? filteredOrders.map((o: any, i: number) => (
                    <div key={i} onClick={() => toggleSelect(o.id)} className={`bg-white p-5 rounded-[24px] shadow-sm border flex flex-col gap-4 transition-colors ${selectedOrders.includes(o.id) ? 'border-[#20A46B] bg-[#20A46B]/5 ring-1 ring-[#20A46B]/20' : 'border-[#304250]/10'}`}>
                        <div className="flex justify-between items-start">
                            <div className="flex gap-3 items-start">
                                <input
                                    type="checkbox"
                                    checked={selectedOrders.includes(o.id)}
                                    onChange={() => { }}
                                    className="mt-1 w-4 h-4 rounded border-gray-300 text-[#20A46B] focus:ring-[#20A46B] cursor-pointer accent-[#20A46B]"
                                />
                                <div>
                                    <p className="font-extrabold text-[#304250] text-sm">{o.orderId}</p>
                                    <p className="text-[10px] text-[#304250]/50 font-bold uppercase tracking-widest mt-0.5">{formatShortDate(o.date)}</p>
                                </div>
                            </div>

                            <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase tracking-widest font-black border shadow-sm
                                ${o.status === 'DELIVERED' ? 'bg-[#e0f8e9] text-[#059669] border-[#10b981]/20' :
                                    o.status === 'RTO' ? 'bg-[#fee2e2] text-[#b91c1c] border-[#ef4444]/20' :
                                        'bg-[#fef3c7] text-[#b45309] border-[#f59e0b]/20'}`}
                            >
                                {o.status === 'PENDING' ? (o.paymentType === 'COD' ? 'Pending COD' : 'Pending') : o.status === 'DELIVERED' ? 'Delivered' : 'Returned'}
                            </span>
                        </div>

                        <div className="border-y border-[#304250]/5 py-3 flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0 border shadow-sm ${getAvatarColor(o.customerName)}`}>
                                {getInitials(o.customerName)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-[#304250] truncate">{o.customerName}</p>
                                <p className="text-[11px] text-[#304250]/60 font-bold uppercase tracking-wider truncate">{o.city}</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            {o.items.map((item: any, idx: number) => (
                                <div key={idx} className="text-xs bg-gray-50 text-[#304250]/80 px-3 py-2 rounded-xl inline-flex items-center gap-1.5 border border-[#304250]/10 font-bold">
                                    {item.productName} <span className="font-black text-[#20A46B]">x{item.quantity}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between items-center pt-2">
                            <div className="flex flex-col">
                                <p className="font-black text-[#304250] text-lg">Rs {o.totalAmount.toLocaleString()}</p>
                                <p className="text-[10px] text-[#304250]/50 font-bold uppercase tracking-widest mt-0.5">Ship: Rs {o.shippingCost}</p>
                            </div>
                            <div className="text-right flex flex-col items-end">
                                <p className="text-[11px] font-black text-[#304250]/70 uppercase tracking-wider">{o.paymentType === 'ONLINE' ? 'Online transfer' : 'COD'}</p>
                                <p className="text-[10px] text-[#304250]/40 font-bold uppercase tracking-widest mt-1 bg-gray-100 px-2 py-0.5 rounded">{o.courier}</p>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="text-center p-8 bg-white rounded-[24px] border border-[#304250]/10 shadow-sm text-[#304250]/40 italic font-bold">
                        <ShoppingCart size={32} className="mx-auto opacity-30 mb-2" />
                        <p>No orders found.</p>
                    </div>
                )}
            </div>

            {/* 💻 DESKTOP VIEW: CLEAN TABLE & HIDDEN SCROLLBAR */}
            <div className="hidden md:block bg-white rounded-[24px] shadow-[0_8px_30px_rgba(48,66,80,0.04)] border border-[#304250]/10 overflow-hidden">
                <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                        <thead className="bg-gray-50/50 text-[#304250]/50 font-extrabold uppercase tracking-widest text-[11px] border-b border-[#304250]/10">
                            <tr>
                                <th className="p-4 pl-6 w-12">
                                    <input
                                        type="checkbox"
                                        checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                                        onChange={toggleSelectAll}
                                        className="w-4 h-4 rounded border-gray-300 text-[#20A46B] focus:ring-[#20A46B] cursor-pointer accent-[#20A46B]"
                                    />
                                </th>
                                <th className="p-4">Order ID</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Customer</th>
                                <th className="p-4">Items</th>
                                <th className="p-4">Amount</th>
                                <th className="p-4 text-center">Status</th>
                                <th className="p-4">Payment</th>
                                <th className="p-4 pr-6">Courier</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#304250]/5">
                            {filteredOrders.length > 0 ? filteredOrders.map((o: any) => (
                                <tr key={o.id} className={`${selectedOrders.includes(o.id) ? 'bg-[#20A46B]/5' : 'hover:bg-gray-50/80'} transition-colors duration-150`}>
                                    <td className="p-4 pl-6">
                                        <input
                                            type="checkbox"
                                            checked={selectedOrders.includes(o.id)}
                                            onChange={() => toggleSelect(o.id)}
                                            className="w-4 h-4 rounded border-gray-300 text-[#20A46B] focus:ring-[#20A46B] cursor-pointer accent-[#20A46B]"
                                        />
                                    </td>
                                    <td className="p-4 font-extrabold text-[#304250] text-[13px]">{o.orderId}</td>
                                    <td className="p-4 text-[#304250]/50 font-bold text-[11px] uppercase tracking-wider">{formatShortDate(o.date)}</td>
                                    <td className="p-4 flex items-center gap-3 min-w-[200px]">
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black border shadow-sm ${getAvatarColor(o.customerName)}`}>
                                            {getInitials(o.customerName)}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-extrabold text-[#304250] text-[13px]">{o.customerName}</span>
                                            <span className="text-[10px] text-[#304250]/50 font-bold uppercase tracking-widest mt-0.5">{o.city}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-wrap gap-1.5 max-w-[220px]">
                                            {o.items.map((item: any, idx: number) => (
                                                <div key={idx} className="text-[10px] bg-white text-[#304250]/80 font-bold px-2.5 py-1 rounded-md inline-flex items-center gap-1 border border-[#304250]/10 shadow-sm">
                                                    <span className="truncate max-w-[100px]">{item.productName}</span>
                                                    <span className="font-black text-[#20A46B]">x{item.quantity}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="font-black text-[#304250] text-[14px]">Rs {o.totalAmount.toLocaleString()}</span>
                                            <span className="text-[10px] text-[#304250]/50 font-bold uppercase tracking-widest mt-0.5">Ship: Rs {o.shippingCost}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase tracking-widest font-black border shadow-sm whitespace-nowrap
                                            ${o.status === 'DELIVERED' ? 'bg-[#e0f8e9] text-[#059669] border-[#10b981]/20' :
                                                o.status === 'RTO' ? 'bg-[#fee2e2] text-[#b91c1c] border-[#ef4444]/20' :
                                                    'bg-[#fef3c7] text-[#b45309] border-[#f59e0b]/20'}`}
                                        >
                                            {o.status === 'PENDING' ? (o.paymentType === 'COD' ? 'Pending COD' : 'Pending') : o.status === 'DELIVERED' ? 'Delivered' : 'Returned'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-[#304250]/70 font-extrabold text-[12px]">{o.paymentType === 'ONLINE' ? 'Online transfer' : 'COD'}</td>
                                    <td className="p-4 pr-6">
                                        <span className="bg-gray-100 border border-[#304250]/5 text-[#304250]/60 font-bold text-[10px] uppercase tracking-widest px-2 py-1 rounded shadow-sm">{o.courier}</span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={9} className="p-16 text-center text-[#304250]/40">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="bg-gray-50 p-4 rounded-full border border-[#304250]/5 shadow-sm"><ShoppingCart size={32} className="opacity-30" /></div>
                                            <p className="font-bold text-sm">No orders found.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ADD / EDIT ORDER MODAL */}
            {isModalOpen && (
                <AddOrderModal
                    products={products}
                    services={services}
                    businessType={businessType}
                    settings={settings}
                    totalOrders={totalOrders}
                    editingOrder={editingOrder}
                    onClose={() => { setIsModalOpen(false); setEditingOrder(null); setSelectedOrders([]); }}
                    onSuccess={() => { refreshData(); setIsModalOpen(false); setEditingOrder(null); setSelectedOrders([]); }}
                />
            )}

        </div>
    );
}

// --- ADD / EDIT ORDER MODAL ---
function AddOrderModal({ products, services, businessType, settings, totalOrders, editingOrder, onClose, onSuccess }: any) {
    const { businessInfo, couriers } = useBusinessStore();

    const defaultCourier = settings?.couriers?.[0] || 'Leopard';
    const packagingCost = Number(settings?.packagingCost) || 0;
    const isServiceMode = businessType === 'SERVICE';
    const itemList = isServiceMode ? services : products;

    // 👇 PRE-FILL WITH EXISTING ORDER IF EDITING
    const [orderItems, setOrderItems] = useState(
        editingOrder ? editingOrder.items : [{ productId: '', quantity: 1, salePrice: 0 }]
    );
    const [isFreeShipping, setIsFreeShipping] = useState(editingOrder?.isFreeShipping || false);

    const [form, setForm] = useState({
        customerName: editingOrder?.customerName || '',
        city: editingOrder?.city || '',
        province: editingOrder?.province || 'Punjab',
        courier: editingOrder?.courier || defaultCourier,
        weight: editingOrder?.weight || 0.5,
        shippingCost: editingOrder ? editingOrder.shippingCost : 0,
        status: editingOrder?.status || 'PENDING',
        paymentType: editingOrder?.paymentType || 'COD',
        date: editingOrder?.date || new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        if (!form.courier || !settings?.courierRates) return;

        // Use settings.courierRates (from DB Profile) as source of truth
        const courierRates = settings.courierRates || [];
        const rateInfo = courierRates.find((c: any) => c.name.toLowerCase() === form.courier.toLowerCase());

        if (!rateInfo) {
            console.warn(`[Shipping] No rates found for courier: ${form.courier}`);
            setForm(prev => ({ ...prev, shippingCost: 0 }));
            return;
        }

        const myCity = (businessInfo?.city || '').toLowerCase().trim();
        const myProv = (businessInfo?.province || '').toLowerCase().trim();
        const custCity = (form.city || '').toLowerCase().trim();
        const custProv = (form.province || '').toLowerCase().trim();

        let baseCost = Number(rateInfo.crossProv) || 0;
        if (custCity === myCity && myCity !== '') {
            baseCost = Number(rateInfo.sameCity) || 0;
        } else if (custProv === myProv && myProv !== '') {
            baseCost = Number(rateInfo.sameProv) || 0;
        }

        const extraWeight = Math.max(0, Number(form.weight) - 0.5);
        const totalShipping = baseCost + (extraWeight * (Number(rateInfo.kg) || 0));

        setForm(prev => ({ ...prev, shippingCost: totalShipping }));
    }, [form.courier, form.city, form.province, form.weight, businessInfo, settings.courierRates]);

    const addItem = () => setOrderItems([...orderItems, { productId: '', quantity: 1, salePrice: 0 }]);
    const removeItem = (index: number) => setOrderItems(orderItems.filter((_: any, i: number) => i !== index));

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...orderItems];
        (newItems[index] as any)[field] = value;

        if (field === 'productId') {
            const selectedItem = itemList.find((i: any) => i.id === value);
            if (selectedItem) {
                (newItems[index] as any)['salePrice'] = selectedItem.sellingPrice || 0;
            }
        }
        setOrderItems(newItems);
    };

    const itemsTotal = orderItems.reduce((acc: number, item: any) => acc + (item.quantity * item.salePrice), 0);
    const activeShippingCost = isFreeShipping ? 0 : form.shippingCost;
    const grandTotal = itemsTotal + activeShippingCost + packagingCost;

    const handleSubmit = async () => {
        if (!form.customerName || !form.city) return alert("Please fill customer details");
        if (orderItems.some((i: any) => !i.productId || i.salePrice <= 0)) return alert("Please check items/prices.");

        const payload = {
            ...form,
            shippingCost: activeShippingCost,
            packagingCost: packagingCost,
            totalAmount: grandTotal,
            isFreeShipping,
            items: orderItems.map((i: any) => ({
                productId: i.productId,
                quantity: Number(i.quantity),
                salePrice: Number(i.salePrice)
            })),
            weight: Number(form.weight)
        };

        const apiUrl = editingOrder ? `${API_URL}/api/orders/${editingOrder.id}` : `${API_URL}/api/orders/add`;
        const apiMethod = editingOrder ? 'PUT' : 'POST';

        try {
            const res = await safeFetch<any>(apiUrl, {
                method: apiMethod, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
            });
            if (res?.success) onSuccess();
            else alert("Error saving order");
        } catch (e) { alert("Network Error"); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#304250]/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-3xl rounded-[24px] shadow-2xl border border-[#304250]/10 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

                <div className="px-6 py-5 border-b border-[#304250]/10 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h3 className="text-lg font-black text-[#304250]">{editingOrder ? 'Edit Order' : 'Add New Order'}</h3>
                        <p className="text-xs text-[#304250]/60 font-bold uppercase tracking-widest mt-0.5">ID: {editingOrder ? editingOrder.orderId : `#ORD-${(totalOrders || 0) + 1001}`}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-red-50 text-[#304250]/40 hover:text-red-500 rounded-full transition-colors active:scale-95"><X size={20} /></button>
                </div>

                <div className="p-5 sm:p-6 overflow-y-auto space-y-6 custom-scrollbar">

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5"><label className="text-[11px] font-extrabold text-[#304250]/60 uppercase tracking-widest">Date</label><input type="date" className="w-full border border-[#304250]/10 bg-gray-50 focus:bg-white p-3.5 rounded-xl text-sm font-bold text-[#304250] focus:ring-2 ring-[#20A46B]/20 focus:border-[#20A46B] outline-none shadow-sm transition-all" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
                        <div className="space-y-1.5"><label className="text-[11px] font-extrabold text-[#304250]/60 uppercase tracking-widest">Customer Name</label><input className="w-full border border-[#304250]/10 bg-gray-50 focus:bg-white p-3.5 rounded-xl text-sm font-bold text-[#304250] placeholder:font-medium placeholder:text-[#304250]/30 focus:ring-2 ring-[#20A46B]/20 focus:border-[#20A46B] outline-none shadow-sm transition-all" placeholder="Ali Khan" value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} /></div>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1.5"><label className="text-[11px] font-extrabold text-[#304250]/60 uppercase tracking-widest">City</label><input className="w-full border border-[#304250]/10 bg-gray-50 focus:bg-white p-3.5 rounded-xl text-sm font-bold text-[#304250] placeholder:font-medium placeholder:text-[#304250]/30 focus:ring-2 ring-[#20A46B]/20 focus:border-[#20A46B] outline-none shadow-sm transition-all" placeholder="Lahore" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} /></div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-extrabold text-[#304250]/60 uppercase tracking-widest">Province</label>
                                <FormSelect
                                    value={form.province}
                                    onChange={(val) => setForm({ ...form, province: val })}
                                    options={[
                                        { value: 'Punjab', label: 'Punjab' },
                                        { value: 'Sindh', label: 'Sindh' },
                                        { value: 'KPK', label: 'KPK' },
                                        { value: 'Balochistan', label: 'Balochistan' },
                                        { value: 'Islamabad', label: 'Islamabad' },
                                        { value: 'AJK', label: 'AJK' },
                                    ]}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-2xl border border-[#304250]/10 shadow-sm">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-extrabold text-[#304250]/60 uppercase tracking-widest">Courier</label>
                            {settings?.couriers?.length > 1 ? (
                                <FormSelect
                                    value={form.courier}
                                    onChange={(val) => setForm({ ...form, courier: val })}
                                    options={(settings.couriers || []).map((c: string) => ({ value: c, label: c }))}
                                />
                            ) : (
                                <div className="w-full border border-[#304250]/10 p-3.5 rounded-xl text-sm bg-gray-100 text-[#304250]/50 font-extrabold cursor-not-allowed flex items-center shadow-inner">{form.courier}</div>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-extrabold text-[#304250]/60 uppercase tracking-widest">Status</label>
                            <FormSelect
                                value={form.status}
                                onChange={(val) => setForm({ ...form, status: val })}
                                options={[
                                    { value: 'PENDING', label: 'Pending' },
                                    { value: 'DELIVERED', label: 'Delivered' },
                                    { value: 'RTO', label: 'Returned' },
                                ]}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-extrabold text-[#304250]/60 uppercase tracking-widest">Payment Method</label>
                            <FormSelect
                                value={form.paymentType}
                                onChange={(val) => setForm({ ...form, paymentType: val })}
                                options={[
                                    { value: 'COD', label: 'Cash on Delivery' },
                                    { value: 'ONLINE', label: 'Online Transfer' },
                                ]}
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center border-b border-[#304250]/10 pb-3">
                            <label className="text-[11px] font-extrabold text-[#304250]/60 uppercase tracking-widest">{isServiceMode ? "Select Service" : "Select Product"}</label>
                            <div className="hidden sm:flex gap-10 text-[11px] font-extrabold text-[#304250]/40 mr-12 tracking-widest uppercase">
                                <span>Quantity</span>
                                <span>Price</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {orderItems.map((item: any, index: number) => (
                                <div key={index} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center bg-white p-3 sm:p-0 rounded-xl border border-[#304250]/5 sm:border-transparent shadow-sm sm:shadow-none">
                                    <div className="flex-1">
                                        <FormSelect
                                            value={item.productId}
                                            onChange={(val) => updateItem(index, 'productId', val)}
                                            placeholder={isServiceMode ? 'Select Service...' : 'Select Product...'}
                                            options={itemList
                                                .filter((x: any) => isServiceMode || x.currentStock > 0)
                                                .map((x: any) => ({
                                                    value: x.id,
                                                    label: `${x.name} ${isServiceMode ? `(Rs ${x.sellingPrice})` : `(Stock: ${x.currentStock})`}`
                                                }))}
                                        />
                                    </div>
                                    <div className="flex gap-2 w-full sm:w-auto">
                                        <input type="number" className="w-full sm:w-20 bg-gray-50 border border-[#304250]/10 p-3.5 sm:p-2.5 rounded-xl text-sm font-bold text-[#304250] text-center focus:bg-white focus:ring-2 ring-[#20A46B]/20 focus:border-[#20A46B] outline-none transition-all shadow-sm" placeholder="Qty" value={item.quantity} onChange={e => updateItem(index, 'quantity', e.target.value)} />
                                        <input type="number" className="w-full sm:w-28 bg-gray-50 border border-[#304250]/10 p-3.5 sm:p-2.5 rounded-xl text-sm font-bold text-[#304250] text-center focus:bg-white focus:ring-2 ring-[#20A46B]/20 focus:border-[#20A46B] outline-none transition-all shadow-sm" placeholder="Price" value={item.salePrice} onChange={e => updateItem(index, 'salePrice', e.target.value)} />
                                        {orderItems.length > 1 && (
                                            <button onClick={() => removeItem(index)} className="p-3 sm:p-2.5 flex items-center justify-center text-red-400 hover:text-red-600 border border-red-100 hover:bg-red-50 transition-colors rounded-xl shadow-sm active:scale-95"><Trash2 size={16} /></button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* 👇 YELLOW ACCENT APPLIED TO ADD ITEM BUTTON 👇 */}
                        <button onClick={addItem} className="text-[10px] font-extrabold text-[#304250] bg-[#EEBE1C] hover:bg-[#d9ab18] shadow-[0_2px_8px_rgba(238,190,28,0.3)] px-3 py-1.5 rounded-md flex items-center gap-1 mt-3 uppercase tracking-widest transition-all active:scale-95"><Plus size={14} /> Add Another Item</button>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-end gap-4 p-5 rounded-2xl border border-[#304250]/10 bg-gray-50 shadow-sm">
                        <div className="space-y-1.5 sm:w-32 flex-1">
                            <label className="text-[10px] font-extrabold text-[#304250]/60 uppercase tracking-widest">Total Weight (kg)</label>
                            <input type="number" step="0.1" className="w-full bg-white border border-[#304250]/10 p-3.5 sm:p-3 rounded-xl text-sm focus:ring-2 ring-[#20A46B]/20 focus:border-[#20A46B] outline-none font-bold text-[#304250] transition-all shadow-sm" value={form.weight} onChange={e => setForm({ ...form, weight: Number(e.target.value) })} />
                        </div>

                        <div className="space-y-1.5 sm:w-48 flex-1 relative">
                            <label className="text-[10px] font-extrabold text-[#304250]/60 uppercase tracking-widest flex items-center">
                                Shipping Cost
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#304250]/40 font-black text-sm">Rs</span>
                                <input
                                    type="number"
                                    className={`w-full border pl-10 pr-3.5 py-3.5 sm:py-3 rounded-xl text-sm font-bold outline-none transition-all shadow-sm ${isFreeShipping ? 'bg-gray-100 border-[#304250]/5 text-[#304250]/40 cursor-not-allowed shadow-inner' : 'bg-white border-[#304250]/10 focus:ring-2 ring-[#20A46B]/20 focus:border-[#20A46B] text-[#304250]'}`}
                                    value={isFreeShipping ? 0 : form.shippingCost}
                                    onChange={e => setForm({ ...form, shippingCost: Number(e.target.value) })}
                                    readOnly={isFreeShipping}
                                />
                            </div>
                        </div>

                        <label className={`flex items-center justify-center gap-2 cursor-pointer px-5 py-3.5 sm:py-3 rounded-xl border transition-all shadow-sm w-full sm:w-auto mt-1 sm:mt-0 active:scale-95 ${isFreeShipping ? 'bg-[#20A46B]/10 border-[#20A46B]/30' : 'bg-white border-[#304250]/10 hover:bg-gray-50 hover:border-[#304250]/30'}`}>
                            <input type="checkbox" className="accent-[#20A46B] w-4 h-4" checked={isFreeShipping} onChange={e => setIsFreeShipping(e.target.checked)} />
                            <span className={`text-xs font-extrabold flex items-center gap-2 uppercase tracking-wide ${isFreeShipping ? 'text-[#20A46B]' : 'text-[#304250]/70'}`}><Truck size={16} className={isFreeShipping ? "text-[#20A46B]" : "text-[#304250]/40"} /> Free Ship</span>
                        </label>
                    </div>

                    <div className="bg-[#20A46B]/5 p-5 sm:p-6 rounded-2xl border border-[#20A46B]/20 flex flex-col w-full shadow-inner">
                        <div className="flex flex-wrap items-center justify-between gap-y-2 text-[10px] sm:text-xs text-[#304250]/60 font-extrabold uppercase tracking-widest mb-4 pb-4 border-b border-[#20A46B]/10 w-full">
                            <span className="whitespace-nowrap">Items: <b className="text-[#304250]">Rs {itemsTotal}</b></span>
                            <span className="text-[#20A46B]/30 font-black px-1 text-base">+</span>
                            <span className={`whitespace-nowrap ${isFreeShipping ? 'line-through opacity-40' : ''}`}>
                                Ship: <b className="text-[#304250]">Rs {isFreeShipping ? 0 : form.shippingCost}</b>
                            </span>
                            {packagingCost > 0 && (
                                <>
                                    <span className="text-[#20A46B]/30 font-black px-1 text-base">+</span>
                                    <span className="whitespace-nowrap">Pack: <b className="text-[#304250]">Rs {packagingCost}</b></span>
                                </>
                            )}
                        </div>
                        <div className="flex items-center justify-between w-full">
                            <span className="text-xs sm:text-sm font-extrabold text-[#20A46B] uppercase tracking-widest">Grand Total</span>
                            <span className="text-3xl font-black text-[#20A46B] tracking-tighter">Rs {grandTotal.toLocaleString()}</span>
                        </div>
                    </div>

                </div>

                <div className="p-5 sm:p-6 border-t border-[#304250]/10 bg-gray-50 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-auto">
                    <button onClick={onClose} className="w-full sm:w-auto px-8 py-3.5 sm:py-3 bg-white border border-[#304250]/10 text-[#304250]/60 rounded-xl font-bold text-sm hover:bg-gray-100 hover:text-[#304250] transition-colors duration-200 active:scale-95 shadow-sm">Cancel</button>
                    <button onClick={handleSubmit} className="w-full sm:w-auto justify-center px-10 py-3.5 sm:py-3 bg-[#20A46B] text-white rounded-xl font-extrabold text-sm shadow-[0_4px_14px_rgba(32,164,107,0.3)] hover:bg-[#20A46B]/90 transition-all duration-200 active:scale-[0.98] flex items-center gap-2"><Check size={18} /> {editingOrder ? 'Update Order' : 'Confirm Order'}</button>
                </div>

            </div>
        </div>
    );
}