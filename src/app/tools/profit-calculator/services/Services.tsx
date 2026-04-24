"use client";
import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
    Wrench, Plus, Search, X, Check, Trash2, Edit,
    ChevronLeft, ChevronRight, Clock, Calculator, Save
} from 'lucide-react';

import { API_URL, safeFetch } from '@/lib/api-client';

/* ── Avatar Helpers ── */
const getInitials = (name: string) => name ? name.substring(0, 2).toUpperCase() : 'SE';
const getAvatarColor = (name: string) => {
    const colors = [
        'bg-slate-100 text-slate-600', 'bg-blue-50 text-blue-600',
        'bg-indigo-50 text-indigo-600', 'bg-[#EEBE1C]/10 text-[#c2410c]', // Swapped amber to use Yellow Accent vibe
        'bg-rose-50 text-rose-600', 'bg-[#20A46B]/10 text-[#20A46B]'
    ];
    const charCode = name ? name.charCodeAt(0) : 0;
    return colors[charCode % colors.length];
}

interface ServicesProps {
    services: any[];
    refreshData: () => void;
}

export default function Services({ services = [], refreshData }: ServicesProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<any>(null); // 👈 NEW STATE FOR EDIT
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Bulk Actions State
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    const itemsPerPage = 10;

    // --- FILTERING ---
    const filteredServices = useMemo(() => {
        if (!Array.isArray(services)) return [];
        return services.filter(s =>
            (s.name || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [services, searchTerm]);

    // --- PAGINATION ---
    const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
    const paginatedServices = filteredServices.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // --- BULK SELECTION ---
    const toggleSelectAll = () => {
        if (selectedItems.length === paginatedServices.length && paginatedServices.length > 0) {
            setSelectedItems([]);
        } else {
            setSelectedItems(paginatedServices.map((s: any) => s.id));
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedItems(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    // --- ACTIONS ---
    const handleBulkDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${selectedItems.length} service(s)?`)) return;
        try {
            await Promise.all(selectedItems.map(id =>
                safeFetch(`${API_URL}/api/services/${id}`, { method: 'DELETE' })
            ));
            setSelectedItems([]);
            refreshData();
        } catch (e) {
            alert("Error deleting some items.");
        }
    };

    const openEditModal = () => {
        const itemToEdit = paginatedServices.find(s => s.id === selectedItems[0]);
        if (itemToEdit) {
            setEditingService(itemToEdit);
            setIsModalOpen(true);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 relative font-sans text-[#304250] pb-10 selection:bg-[#20A46B]/20 selection:text-[#20A46B]">

            {/* ACTIONS BAR */}
            {selectedItems.length > 0 ? (
                <div className="bg-[#20A46B]/10 border border-[#20A46B]/20 p-3 sm:p-4 rounded-2xl flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 shadow-sm relative z-20">
                    <div className="flex items-center gap-3">
                        <span className="bg-[#20A46B] text-white text-xs sm:text-sm font-bold px-3 py-1.5 rounded-full">{selectedItems.length}</span>
                        <span className="text-sm sm:text-base font-extrabold text-[#20A46B]">Services Selected</span>
                    </div>
                    <div className="flex gap-2">
                        {/* EDIT BUTTON (Shows only if 1 item is selected) */}
                        {selectedItems.length === 1 && (
                            <button
                                onClick={openEditModal}
                                className="bg-[#EEBE1C] text-[#304250] px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-extrabold hover:bg-[#d9ab18] flex items-center gap-2 transition-all shadow-[0_2px_8px_rgba(238,190,28,0.3)] shrink-0 active:scale-95"
                            >
                                <Edit size={16} /> <span className="hidden sm:inline">Edit</span>
                            </button>
                        )}
                        <button
                            onClick={handleBulkDelete}
                            className="bg-white text-red-500 border border-red-200 px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-extrabold hover:bg-red-50 hover:border-red-300 flex items-center gap-2 transition-colors shadow-sm shrink-0 active:scale-95"
                        >
                            <Trash2 size={16} /> <span className="hidden sm:inline">Delete</span>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-row items-center gap-2 relative z-20">
                    {/* Search Bar */}
                    <div className="relative flex-1 min-w-0 shadow-sm rounded-xl">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#304250]/40 w-4 h-4" />
                        <input
                            className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#304250]/10 rounded-xl text-xs sm:text-sm font-bold focus:ring-2 ring-[#20A46B]/20 focus:border-[#20A46B] outline-none transition-shadow truncate placeholder:font-medium placeholder:text-[#304250]/40 text-[#304250]"
                            placeholder="Search services..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Add Service Button */}
                    <button
                        onClick={() => { setEditingService(null); setIsModalOpen(true); }}
                        className="shrink-0 bg-[#20A46B] hover:bg-[#20A46B]/90 text-white p-2.5 sm:px-4 sm:py-2.5 rounded-xl font-extrabold text-sm shadow-[0_4px_14px_rgba(32,164,107,0.3)] hover:-translate-y-[1px] transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 border border-transparent"
                    >
                        <Plus size={18} className="sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Add Service</span>
                    </button>
                </div>
            )}

            {/* 📱 MOBILE VIEW: CARDS LAYOUT */}
            <div className="block md:hidden space-y-4">
                {paginatedServices.length > 0 ? paginatedServices.map((s: any, i: number) => (
                    <div key={i} onClick={() => toggleSelect(s.id)} className={`bg-white p-5 rounded-2xl shadow-[0_8px_30px_rgba(48,66,80,0.04)] border flex flex-col gap-4 relative transition-colors ${selectedItems.includes(s.id) ? 'border-[#20A46B] bg-[#20A46B]/5 ring-1 ring-[#20A46B]/20' : 'border-[#304250]/10'}`}>
                        {/* Header: Service Info & Est Time */}
                        <div className="flex justify-between items-start gap-2">
                            <div className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    checked={selectedItems.includes(s.id)}
                                    onChange={() => { }}
                                    className="mt-1 w-4 h-4 rounded border-gray-300 text-[#20A46B] focus:ring-[#20A46B] cursor-pointer accent-[#20A46B]"
                                />
                                <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center font-bold text-base border border-[#304250]/5 ${getAvatarColor(s.name)}`}>
                                    {getInitials(s.name)}
                                </div>
                                <div>
                                    <p className="font-extrabold text-[#304250] text-sm truncate max-w-[140px]">{s.name}</p>
                                    <p className="text-xs text-[#304250]/50 font-medium mt-0.5 line-clamp-1">{s.description || 'No description'}</p>
                                </div>
                            </div>
                            <span className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 border border-blue-100 shadow-sm">
                                <Clock size={10} /> {s.estimatedTime}
                            </span>
                        </div>

                        {/* Middle: Pricing Stats */}
                        <div className="grid grid-cols-2 gap-4 border-y border-[#304250]/5 py-3">
                            <div>
                                <p className="text-[10px] text-[#304250]/50 font-extrabold uppercase tracking-wider mb-1">Production Cost</p>
                                <p className="font-bold text-[#304250]/70 text-base">Rs {(s.productionCost || 0).toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-[#304250]/50 font-extrabold uppercase tracking-wider mb-1">Selling Price</p>
                                <p className="font-black text-[#304250] text-lg">Rs {(s.sellingPrice || 0).toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Bottom: Profit & Actions */}
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-[10px] text-[#20A46B]/70 font-extrabold uppercase tracking-wider mb-0.5">Profit / Unit</p>
                                <p className="font-black text-[#20A46B] text-lg">+ Rs {((s.sellingPrice || 0) - (s.productionCost || 0)).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="text-center p-8 bg-white rounded-[24px] border border-[#304250]/10 text-[#304250]/40 font-bold italic shadow-sm">
                        <Wrench size={32} className="mx-auto opacity-30 mb-2" />
                        <p>No services found.</p>
                    </div>
                )}
            </div>

            {/* 💻 DESKTOP VIEW: CLEAN MODERN TABLE */}
            <div className="hidden md:block bg-white rounded-[24px] shadow-[0_8px_30px_rgba(48,66,80,0.04)] border border-[#304250]/10 overflow-hidden">
                <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                        <thead className="bg-gray-50/50 text-[#304250]/50 font-extrabold uppercase tracking-widest text-[11px] border-b border-[#304250]/10">
                            <tr>
                                <th className="p-4 pl-6 w-12">
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.length === paginatedServices.length && paginatedServices.length > 0}
                                        onChange={toggleSelectAll}
                                        className="w-4 h-4 rounded border-gray-300 text-[#20A46B] focus:ring-[#20A46B] cursor-pointer accent-[#20A46B]"
                                    />
                                </th>
                                <th className="p-4">Service Name</th>
                                <th className="p-4">Est. Time</th>
                                <th className="p-4 text-center">Production Cost</th>
                                <th className="p-4 text-center">Selling Price</th>
                                <th className="p-4 pr-6 text-right">Profit / Unit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#304250]/5">
                            {paginatedServices.length > 0 ? paginatedServices.map((s: any, i: number) => (
                                <tr key={s.id} className={`${selectedItems.includes(s.id) ? 'bg-[#20A46B]/5' : 'hover:bg-gray-50/80'} transition-colors duration-150 group`}>
                                    <td className="p-4 pl-6">
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.includes(s.id)}
                                            onChange={() => toggleSelect(s.id)}
                                            className="w-4 h-4 rounded border-gray-300 text-[#20A46B] focus:ring-[#20A46B] cursor-pointer accent-[#20A46B]"
                                        />
                                    </td>
                                    <td className="p-4 flex items-center gap-3">
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black border border-[#304250]/5 shadow-sm ${getAvatarColor(s.name)}`}>
                                            {getInitials(s.name)}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-extrabold text-[#304250] text-[13px]">{s.name}</span>
                                            <span className="text-[11px] text-[#304250]/50 font-medium line-clamp-1 max-w-[200px]">{s.description || 'No description'}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] uppercase tracking-widest font-black bg-blue-50 text-blue-600 border border-blue-100 shadow-sm">
                                            <Clock size={12} /> {s.estimatedTime}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center text-[#304250]/70 font-bold">Rs {(s.productionCost || 0).toLocaleString()}</td>
                                    <td className="p-4 text-center font-black text-[#304250] text-[14px]">Rs {(s.sellingPrice || 0).toLocaleString()}</td>
                                    <td className="p-4 pr-6 text-right">
                                        <span className="text-[12px] font-black text-[#20A46B] bg-[#20A46B]/10 px-3 py-1.5 rounded-full border border-[#20A46B]/20 shadow-sm">
                                            + Rs {((s.sellingPrice || 0) - (s.productionCost || 0)).toLocaleString()}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="p-16 text-center text-[#304250]/40">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="bg-gray-50 p-4 rounded-full border border-[#304250]/5 shadow-sm"><Wrench size={32} className="opacity-30" /></div>
                                            <p className="font-bold text-sm">No services found.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* SHARED PAGINATION (Mobile + Desktop) */}
            {totalPages > 1 && (
                <div className="p-4 flex justify-between items-center bg-white rounded-2xl border border-[#304250]/10 shadow-[0_8px_30px_rgba(48,66,80,0.04)] mt-4">
                    <span className="text-xs font-extrabold text-[#304250]/60 uppercase tracking-widest">Page {currentPage} of {totalPages}</span>
                    <div className="flex gap-2">
                        <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-2.5 bg-white border border-[#304250]/10 rounded-xl hover:bg-gray-50 disabled:opacity-50 text-[#304250] transition-colors shadow-sm active:scale-95"><ChevronLeft size={16} /></button>
                        <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-2.5 bg-white border border-[#304250]/10 rounded-xl hover:bg-gray-50 disabled:opacity-50 text-[#304250] transition-colors shadow-sm active:scale-95"><ChevronRight size={16} /></button>
                    </div>
                </div>
            )}

            {/* MODAL */}
            {isModalOpen && (
                <AddServiceModal
                    editingService={editingService}
                    onClose={() => { setIsModalOpen(false); setEditingService(null); setSelectedItems([]); }}
                    onSuccess={() => { refreshData(); setIsModalOpen(false); setEditingService(null); setSelectedItems([]); }}
                />
            )}
        </div>
    );
}

function AddServiceModal({ editingService, onClose, onSuccess }: { editingService: any, onClose: () => void, onSuccess: () => void }) {
    const [loading, setLoading] = useState(false);

    // PRE-FILL FORM WITH EDITING SERVICE DATA
    const [formData, setFormData] = useState({
        name: editingService ? editingService.name : '',
        productionCost: editingService ? editingService.productionCost.toString() : '',
        sellingPrice: editingService ? editingService.sellingPrice.toString() : '',
        estimatedTime: editingService ? editingService.estimatedTime : '3-5 Days',
        description: editingService ? (editingService.description || '') : ''
    });

    const handleSubmit = async () => {
        if (!formData.name) return alert("Enter Service Name.");
        if (!formData.productionCost || !formData.sellingPrice) return alert("Enter Costs.");

        setLoading(true);
        try {
            // IF EDITING, DELETE THE OLD ONE FIRST, THEN ADD THE NEW ONE
            if (editingService) {
                await safeFetch(`${API_URL}/api/services/${editingService.id}`, { method: 'DELETE' });
            }

            const res = await safeFetch<any>(`${API_URL}/api/services/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    productionCost: Number(formData.productionCost),
                    sellingPrice: Number(formData.sellingPrice)
                })
            });
            if (res?.success) onSuccess();
            else alert("Error saving service.");
        } catch (e) { alert("Network Error"); }
        finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#304250]/40 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Modal Container */}
            <div className="bg-white w-full max-w-lg rounded-[24px] shadow-[0_20px_60px_rgba(48,66,80,0.15)] border border-[#304250]/10 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">

                {/* Header (Fixed) */}
                <div className="px-6 py-5 border-b border-[#304250]/10 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h3 className="text-lg font-black text-[#304250]">{editingService ? 'Edit Service' : 'Add Service'}</h3>
                        <p className="text-[11px] font-bold text-[#304250]/50 uppercase tracking-widest mt-0.5">{editingService ? 'Update details for this service.' : 'Define a new made-to-order item.'}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-red-50 text-[#304250]/40 hover:text-red-500 rounded-full transition-colors active:scale-95"><X size={20} /></button>
                </div>

                {/* Body (Scrollable) */}
                <div className="p-6 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-extrabold text-[#304250]/60 uppercase tracking-widest">Service Name</label>
                        <input className="w-full bg-gray-50 border border-[#304250]/10 p-3 min-h-[48px] sm:min-h-0 rounded-xl text-base sm:text-sm outline-none focus:bg-white focus:ring-2 ring-[#20A46B]/20 focus:border-[#20A46B] font-bold text-[#304250] shadow-sm transition-all placeholder:font-medium placeholder:text-[#304250]/30" placeholder="e.g. Custom Neon Sign" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-extrabold text-[#304250]/60 uppercase tracking-widest">Making Cost</label>
                            <input type="number" className="w-full bg-gray-50 border border-[#304250]/10 p-3 min-h-[48px] sm:min-h-0 rounded-xl text-base sm:text-sm outline-none focus:bg-white focus:ring-2 ring-[#20A46B]/20 focus:border-[#20A46B] font-bold text-[#304250] shadow-sm transition-all placeholder:font-medium placeholder:text-[#304250]/30" placeholder="0" value={formData.productionCost} onChange={e => setFormData({ ...formData, productionCost: e.target.value })} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-extrabold text-[#304250]/60 uppercase tracking-widest">Selling Price</label>
                            <input type="number" className="w-full bg-gray-50 border border-[#304250]/10 p-3 min-h-[48px] sm:min-h-0 rounded-xl text-base sm:text-sm outline-none focus:bg-white focus:ring-2 ring-[#20A46B]/20 focus:border-[#20A46B] font-bold text-[#304250] shadow-sm transition-all placeholder:font-medium placeholder:text-[#304250]/30" placeholder="0" value={formData.sellingPrice} onChange={e => setFormData({ ...formData, sellingPrice: e.target.value })} />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-extrabold text-[#304250]/60 uppercase tracking-widest">Est. Delivery Time</label>
                        <input className="w-full bg-gray-50 border border-[#304250]/10 p-3 min-h-[48px] sm:min-h-0 rounded-xl text-base sm:text-sm outline-none focus:bg-white focus:ring-2 ring-[#20A46B]/20 focus:border-[#20A46B] font-bold text-[#304250] shadow-sm transition-all placeholder:font-medium placeholder:text-[#304250]/30" placeholder="e.g. 7 Days" value={formData.estimatedTime} onChange={e => setFormData({ ...formData, estimatedTime: e.target.value })} />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-extrabold text-[#304250]/60 uppercase tracking-widest">Description <span className="font-medium opacity-70">(Opt)</span></label>
                        <textarea className="w-full bg-gray-50 border border-[#304250]/10 p-4 min-h-[48px] sm:min-h-0 rounded-xl text-base sm:text-sm outline-none focus:bg-white focus:ring-2 ring-[#20A46B]/20 focus:border-[#20A46B] font-medium text-[#304250] shadow-sm transition-all h-24 sm:h-20 resize-none custom-scrollbar placeholder:text-[#304250]/30" placeholder="Enter details..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                    </div>
                </div>

                {/* Footer (Fixed) */}
                <div className="p-5 border-t border-[#304250]/10 bg-gray-50 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-auto">
                    <button onClick={onClose} className="w-full sm:w-auto px-6 py-3.5 sm:py-3 bg-white border border-[#304250]/10 text-[#304250]/60 rounded-xl font-bold text-base sm:text-sm hover:bg-gray-100 hover:text-[#304250] shadow-sm transition-colors active:scale-95">Cancel</button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full sm:w-auto justify-center px-8 py-3.5 sm:py-3 bg-[#20A46B] text-white rounded-xl font-extrabold text-base sm:text-sm shadow-[0_4px_14px_rgba(32,164,107,0.3)] hover:bg-[#20A46B]/90 transition-all flex items-center gap-2 disabled:opacity-50 active:scale-[0.98]"
                    >
                        {loading ? 'Saving...' : <><Save size={20} className="sm:w-[18px] sm:h-[18px]" /> {editingService ? 'Update Service' : 'Save Service'}</>}
                    </button>
                </div>
            </div>
        </div>
    );
}