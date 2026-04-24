"use client";
import React, { useState, useMemo } from 'react';
import {
    Package, Plus, Search, X, Check, Trash2,
    ChevronLeft, ChevronRight, AlertCircle, Calculator, Edit
} from 'lucide-react';

import { API_URL, safeFetch } from '@/lib/api-client';

/* ── Avatar Helpers ── */
const getInitials = (name: string) => name ? name.substring(0, 2).toUpperCase() : 'PR';
const getAvatarColor = (name: string) => {
    const colors = [
        'bg-slate-100 text-slate-600', 'bg-blue-50 text-blue-600',
        'bg-indigo-50 text-indigo-600', 'bg-purple-50 text-purple-600',
        'bg-rose-50 text-rose-600', 'bg-amber-50 text-amber-600'
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

interface InventoryProps {
    products: any[];
    batches: any[];
    summary: any;
    refreshData: () => void;
}

export default function Inventory({ products, batches, summary, refreshData }: InventoryProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBatch, setEditingBatch] = useState<any>(null); // 👈 NEW STATE FOR EDIT
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Bulk Actions State
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    const itemsPerPage = 10;

    // --- 1. DATA MERGING & LOGIC ---
    const mergedBatches = useMemo(() => {
        if (!batches || !Array.isArray(batches)) return [];
        return batches.map(batch => {
            const product = products.find(p => p.id === batch.productId);

            // Margin calculation
            const sellingPrice = product ? Number(product.sellingPrice) : 0;
            const costPrice = Number(batch.costPerItem) || 0;
            const profit = sellingPrice - costPrice;
            const margin = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;

            return {
                ...batch,
                productName: product ? product.name : (batch.productName || 'Unknown'),
                sku: product ? product.sku : 'N/A',
                sellingPrice: sellingPrice,
                margin: Math.round(margin * 10) / 10
            };
        });
    }, [batches, products]);

    // --- 2. SEARCH LOGIC ---
    const filteredBatches = useMemo(() => {
        return mergedBatches.filter(b => {
            const matchName = (b.productName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (b.batchName || '').toLowerCase().includes(searchTerm.toLowerCase());
            return matchName;
        });
    }, [mergedBatches, searchTerm]);

    // --- PAGINATION ---
    const totalPages = Math.ceil(filteredBatches.length / itemsPerPage);
    const paginatedBatches = filteredBatches.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // --- BULK SELECTION ---
    const toggleSelectAll = () => {
        if (selectedItems.length === paginatedBatches.length && paginatedBatches.length > 0) {
            setSelectedItems([]);
        } else {
            setSelectedItems(paginatedBatches.map((b: any) => b.id));
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedItems(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    // --- ACTIONS ---
    const handleBulkDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${selectedItems.length} item(s)?`)) return;
        try {
            await Promise.all(selectedItems.map(id =>
                safeFetch(`${API_URL}/api/inventory/batches/${id}`, { method: 'DELETE' })
            ));
            setSelectedItems([]);
            refreshData();
        } catch (e) {
            alert("Error deleting some items.");
        }
    };

    const openEditModal = () => {
        const itemToEdit = paginatedBatches.find(b => b.id === selectedItems[0]);
        if (itemToEdit) {
            setEditingBatch(itemToEdit);
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
                        <span className="text-sm sm:text-base font-bold text-[#20A46B]">Items Selected</span>
                    </div>
                    <div className="flex gap-2">
                        {/* 👇 YELLOW ACCENT APPLIED TO EDIT BUTTON */}
                        {selectedItems.length === 1 && (
                            <button
                                onClick={openEditModal}
                                className="bg-[#EEBE1C] hover:bg-[#d9ab18] text-[#304250] px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all shadow-[0_2px_8px_rgba(238,190,28,0.3)] shrink-0 active:scale-95"
                            >
                                <Edit size={16} /> <span className="hidden sm:inline">Edit</span>
                            </button>
                        )}
                        <button
                            onClick={handleBulkDelete}
                            className="bg-white text-red-500 border border-red-200 px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-extrabold hover:bg-red-50 hover:border-red-300 flex items-center gap-2 transition-colors shadow-sm shrink-0 active:scale-95"
                        >
                            <Trash2 size={16} /> <span className="hidden sm:inline">Delete Batch</span>
                        </button>
                        {/* DELETE PRODUCT BUTTON */}
                        {selectedItems.length === 1 && (
                            <button
                                onClick={async () => {
                                    const item = paginatedBatches.find(b => b.id === selectedItems[0]);
                                    if (!item) return;
                                    if (!confirm(`Are you sure you want to delete the entire product "${item.productName}"? This will hide it from all forms.`)) return;
                                    try {
                                        const res = await safeFetch(`${API_URL}/api/inventory/products/${item.productId}`, { method: 'DELETE' });
                                        if (res) {
                                            setSelectedItems([]);
                                            refreshData();
                                        }
                                    } catch (e) { alert("Error deleting product."); }
                                }}
                                className="bg-red-500 text-white px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-extrabold hover:bg-red-600 flex items-center gap-2 transition-colors shadow-sm shrink-0 ml-2 active:scale-95"
                            >
                                <X size={16} /> <span className="hidden sm:inline">Remove Product</span>
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex flex-row items-center gap-2 relative z-20">
                    {/* Search Bar */}
                    <div className="relative flex-1 min-w-0 shadow-sm rounded-xl">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#304250]/40 w-4 h-4" />
                        <input
                            className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#304250]/10 rounded-xl text-xs sm:text-sm font-bold focus:ring-2 ring-[#20A46B]/20 focus:border-[#20A46B] outline-none transition-shadow truncate placeholder:font-medium placeholder:text-[#304250]/40 text-[#304250]"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Add Stock Button */}
                    <button
                        onClick={() => { setEditingBatch(null); setIsModalOpen(true); }}
                        className="shrink-0 bg-[#20A46B] hover:bg-[#20A46B]/90 text-white p-2.5 sm:px-4 sm:py-2.5 rounded-xl font-extrabold text-sm shadow-[0_4px_14px_rgba(32,164,107,0.3)] hover:-translate-y-[1px] transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 border border-transparent"
                    >
                        <Plus size={18} className="sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Add Stock</span>
                    </button>
                </div>
            )}

            {/* 📱 MOBILE VIEW: CARDS LAYOUT */}
            <div className="block md:hidden space-y-4">
                {paginatedBatches.length > 0 ? paginatedBatches.map((b: any, i: number) => (
                    <div key={i} onClick={() => toggleSelect(b.id)} className={`bg-white p-5 rounded-2xl shadow-[0_8px_30px_rgba(48,66,80,0.04)] border flex flex-col gap-4 relative transition-colors ${selectedItems.includes(b.id) ? 'border-[#20A46B] bg-[#20A46B]/5 ring-1 ring-[#20A46B]/20' : 'border-[#304250]/10'}`}>
                        {/* Header: Product Info & Status */}
                        <div className="flex justify-between items-start gap-2">
                            <div className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    checked={selectedItems.includes(b.id)}
                                    onChange={() => { }}
                                    className="mt-1 w-4 h-4 rounded border-gray-300 text-[#20A46B] focus:ring-[#20A46B] cursor-pointer accent-[#20A46B]"
                                />
                                <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center font-bold text-base border border-[#304250]/5 ${getAvatarColor(b.productName)}`}>
                                    {getInitials(b.productName)}
                                </div>
                                <div>
                                    <p className="font-extrabold text-[#304250] text-sm truncate max-w-[140px]">{b.productName}</p>
                                    <p className="text-xs text-[#304250]/50 font-medium mt-0.5">Added {formatShortDate(b.date)}</p>
                                </div>
                            </div>
                            <div>
                                {b.remainingQty === 0 ? (
                                    <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-[#fee2e2] text-[#b91c1c] shadow-sm">Out</span>
                                ) : b.remainingQty <= 3 ? (
                                    /* 👇 YELLOW ACCENT FOR LOW STOCK */
                                    <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-[#EEBE1C]/20 text-[#c2410c] border border-[#EEBE1C]/30 shadow-sm">Low</span>
                                ) : (
                                    <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-[#20A46B]/10 text-[#20A46B] shadow-sm">In Stock</span>
                                )}
                            </div>
                        </div>

                        {/* Middle: Stats Grid */}
                        <div className="grid grid-cols-3 gap-2 border-y border-[#304250]/5 py-3">
                            <div className="text-center">
                                <p className="text-[10px] text-[#304250]/50 font-extrabold uppercase tracking-wider mb-1">Stock</p>
                                <p className="font-black text-[#304250] text-base">{b.remainingQty}</p>
                            </div>
                            <div className="text-center border-x border-[#304250]/5">
                                <p className="text-[10px] text-[#304250]/50 font-extrabold uppercase tracking-wider mb-1">Sold</p>
                                <p className="font-black text-[#304250]/70 text-base">{b.initialQty - b.remainingQty}</p>
                            </div>
                            <div className="text-center overflow-hidden">
                                <p className="text-[10px] text-[#304250]/50 font-extrabold uppercase tracking-wider mb-1">Margin</p>
                                {b.sellingPrice > 0 ? (
                                    <p className={`font-black text-sm ${b.margin > 0 ? 'text-[#20A46B]' : 'text-red-500'}`}>
                                        {b.margin > 0 ? '+' : ''}{b.margin}%
                                    </p>
                                ) : (
                                    <p className="font-black text-sm text-[#304250]/30">N/A</p>
                                )}
                            </div>
                        </div>

                        {/* Bottom: Financials */}
                        <div className="flex justify-between items-center">
                            <div className="flex flex-col gap-1">
                                <p className="text-xs text-[#304250]/60 font-bold">Cost: Rs {Number(b.costPerItem).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                                <p className="text-xs text-[#304250]/60 font-bold">Sell: Rs {b.sellingPrice.toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-[#304250]/50 font-extrabold uppercase tracking-widest">Total Value</p>
                                <p className="font-black text-[#304250] text-lg">
                                    Rs {(b.remainingQty * b.costPerItem).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </p>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="text-center p-8 bg-white rounded-2xl border border-[#304250]/10 text-[#304250]/40 font-bold italic shadow-sm">
                        <Package size={32} className="mx-auto opacity-30 mb-2" />
                        <p>No inventory found.</p>
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
                                        checked={selectedItems.length === paginatedBatches.length && paginatedBatches.length > 0}
                                        onChange={toggleSelectAll}
                                        className="w-4 h-4 rounded border-gray-300 text-[#20A46B] focus:ring-[#20A46B] cursor-pointer accent-[#20A46B]"
                                    />
                                </th>
                                <th className="p-4">Product</th>
                                <th className="p-4 text-center">Status</th>
                                <th className="p-4 text-center">Stock Left</th>
                                <th className="p-4 text-center">Sold</th>
                                <th className="p-4">Cost / Unit</th>
                                <th className="p-4">Sell Price</th>
                                <th className="p-4 text-center">Margin</th>
                                <th className="p-4 pr-6">Stock Value</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#304250]/5">
                            {paginatedBatches.length > 0 ? paginatedBatches.map((b: any, i: number) => (
                                <tr key={b.id} className={`${selectedItems.includes(b.id) ? 'bg-[#20A46B]/5' : 'hover:bg-gray-50/80'} transition-colors duration-150 group`}>
                                    <td className="p-4 pl-6">
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.includes(b.id)}
                                            onChange={() => toggleSelect(b.id)}
                                            className="w-4 h-4 rounded border-gray-300 text-[#20A46B] focus:ring-[#20A46B] cursor-pointer accent-[#20A46B]"
                                        />
                                    </td>
                                    <td className="p-4 flex items-center gap-3">
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black border border-[#304250]/5 shadow-sm ${getAvatarColor(b.productName)}`}>
                                            {getInitials(b.productName)}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-extrabold text-[#304250] text-[13px]">{b.productName}</span>
                                            <span className="text-[11px] text-[#304250]/50 font-medium">Added {formatShortDate(b.date)}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        {b.remainingQty === 0 ? (
                                            <span className="px-3 py-1 rounded-md text-[10px] font-extrabold bg-[#fee2e2] text-[#b91c1c] shadow-sm">Out of stock</span>
                                        ) : b.remainingQty <= 3 ? (
                                            /* 👇 YELLOW ACCENT FOR LOW STOCK */
                                            <span className="px-3 py-1 rounded-md text-[10px] font-extrabold bg-[#EEBE1C]/20 text-[#c2410c] border border-[#EEBE1C]/30 shadow-sm">Low stock</span>
                                        ) : (
                                            <span className="px-3 py-1 rounded-md text-[10px] font-extrabold bg-[#20A46B]/10 text-[#20A46B] shadow-sm">In stock</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-center font-black text-[#304250] text-[14px]">{b.remainingQty}</td>
                                    <td className="p-4 text-center font-bold text-[#304250]/60">{b.initialQty - b.remainingQty}</td>
                                    <td className="p-4 text-[#304250]/70 font-bold">Rs {Number(b.costPerItem).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                    <td className="p-4 font-black text-[#304250]">Rs {b.sellingPrice.toLocaleString()}</td>
                                    <td className="p-4 text-center">
                                        {b.sellingPrice > 0 ? (
                                            <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-md shadow-sm border ${b.margin > 0 ? 'text-[#20A46B] bg-[#20A46B]/5 border-[#20A46B]/10' : 'text-red-600 bg-red-50 border-red-100'}`}>
                                                {b.margin > 0 ? '+' : ''}{b.margin}%
                                            </span>
                                        ) : (
                                            <span className="text-[11px] font-bold text-[#304250]/40">N/A</span>
                                        )}
                                    </td>
                                    <td className="p-4 pr-6 font-black text-[#304250] text-[14px]">
                                        Rs {(b.remainingQty * b.costPerItem).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={9} className="p-16 text-center text-[#304250]/40">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="bg-gray-50 p-4 rounded-full border border-[#304250]/5 shadow-sm"><Package size={32} className="opacity-40" /></div>
                                            <p className="font-bold text-sm">No inventory found.</p>
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
                <AddStockModal
                    products={products}
                    editingBatch={editingBatch}
                    onClose={() => { setIsModalOpen(false); setEditingBatch(null); setSelectedItems([]); }}
                    onSuccess={() => { refreshData(); setIsModalOpen(false); setEditingBatch(null); setSelectedItems([]); }}
                />
            )}
        </div>
    );
}

// --- ADD/EDIT STOCK MODAL ---
function AddStockModal({ products, editingBatch, onClose, onSuccess }: { products: any[], editingBatch: any, onClose: () => void, onSuccess: () => void }) {
    const [prodNameInput, setProdNameInput] = useState(editingBatch ? editingBatch.productName : '');
    const [showSuggestions, setShowSuggestions] = useState(false);

    // PRE-FILL FORM WITH EDITING BATCH DATA
    const [formData, setFormData] = useState({
        batchName: editingBatch ? editingBatch.batchName : '',
        supplier: editingBatch ? editingBatch.supplier : '',
        date: editingBatch ? editingBatch.date : new Date().toISOString().split('T')[0],
        quantity: editingBatch ? editingBatch.remainingQty.toString() : '',
        perItemCost: editingBatch ? editingBatch.costPerItem.toString() : '',
        sellingPrice: editingBatch ? editingBatch.sellingPrice.toString() : '',
        transportCost: '',
        otherCost: ''
    });

    const filteredSuggestions = products.filter(p => p.name.toLowerCase().includes(prodNameInput.toLowerCase()));

    const handleSelectProduct = (name: string) => {
        setProdNameInput(name);
        const prod = products.find(p => p.name.toLowerCase() === name.toLowerCase());
        if (prod) {
            setFormData(prev => ({ ...prev, sellingPrice: prod.sellingPrice || '' }));
        }
        setShowSuggestions(false);
    };

    // LOGIC: Total = (Qty * PerItem) + Transport + Other
    const calc = useMemo(() => {
        let qty = parseInt(formData.quantity);
        if (isNaN(qty) || qty < 0) qty = 0;

        const perItem = parseFloat(formData.perItemCost) || 0;
        const transport = parseFloat(formData.transportCost) || 0;
        const other = parseFloat(formData.otherCost) || 0;

        const subTotal = qty * perItem;
        const totalCost = subTotal + transport + other;

        return { qty, perItem, subTotal, totalCost };
    }, [formData]);

    const handleSubmit = async () => {
        if (!prodNameInput) return alert("❌ Please enter a Product Name.");
        if (calc.qty <= 0) return alert("❌ Quantity must be valid.");

        let targetProductId = editingBatch ? editingBatch.productId : '';

        if (!editingBatch) {
            const existingProd = products.find(p => p.name.toLowerCase() === prodNameInput.toLowerCase());

            if (existingProd) {
                targetProductId = existingProd.id;
            } else {
                // New Product
                try {
                    const newProduct = await safeFetch<any>(`${API_URL}/api/inventory/products/create`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: prodNameInput,
                            sku: `SKU-${Date.now().toString().slice(-6)}`,
                            category: 'General',
                            sellingPrice: Number(formData.sellingPrice) || 0
                        })
                    });
                    if (newProduct) {
                        targetProductId = newProduct.id;
                    } else {
                        return alert("Failed to create new product.");
                    }
                } catch (e) {
                    return alert("Network error creating product.");
                }
            }
        }

        if (!targetProductId) return alert("Error: Could not link product.");

        const payload = {
            productId: targetProductId,
            batchName: formData.batchName || `B-${Date.now().toString().slice(-4)}`,
            supplier: formData.supplier || 'N/A',
            quantity: calc.qty,
            date: formData.date,
            baseCost: calc.perItem,
            transportCost: Number(formData.transportCost) || 0,
            packagingCost: 0,
            otherCost: Number(formData.otherCost) || 0,
            totalCost: calc.totalCost,
            sellingPrice: Number(formData.sellingPrice) || 0
        };

        const apiUrl = editingBatch ? `${API_URL}/api/inventory/batches/${editingBatch.id}` : `${API_URL}/api/inventory/batches/add`;
        const apiMethod = editingBatch ? 'PUT' : 'POST';

        try {
            const res = await safeFetch<any>(apiUrl, {
                method: apiMethod, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
            });
            if (res?.success) onSuccess();
            else alert("Server Error saving stock.");
        } catch (e) { alert("Network Error"); }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#304250]/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-[24px] shadow-2xl border border-[#304250]/10 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">

                <div className="px-6 py-5 border-b border-[#304250]/10 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h3 className="text-lg font-black text-[#304250]">{editingBatch ? 'Edit Stock' : 'Add New Stock'}</h3>
                        <p className="text-xs text-[#304250]/60 font-medium">{editingBatch ? 'Update existing batch details.' : 'Record new inventory purchase.'}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-red-50 text-[#304250]/40 hover:text-red-500 rounded-full transition-colors active:scale-95"><X size={20} /></button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
                    {/* Product Name */}
                    <div className="space-y-2 relative">
                        <label className="text-[11px] font-extrabold text-[#304250]/60 uppercase tracking-widest">Product Name</label>
                        <div className="relative">
                            <input
                                className={`w-full px-4 py-3 min-h-[48px] sm:min-h-0 bg-gray-50 border border-[#304250]/10 rounded-xl focus:ring-2 ring-[#20A46B]/20 focus:border-[#20A46B] focus:bg-white outline-none transition-all font-bold text-[#304250] text-base sm:text-sm placeholder:font-medium placeholder:text-[#304250]/30 shadow-sm ${editingBatch ? 'cursor-not-allowed opacity-70' : ''}`}
                                placeholder="Type product name..."
                                value={prodNameInput}
                                onChange={(e) => { if (!editingBatch) { setProdNameInput(e.target.value); setShowSuggestions(true); } }}
                                onFocus={() => { if (!editingBatch) setShowSuggestions(true); }}
                                readOnly={!!editingBatch}
                            />
                            {showSuggestions && prodNameInput && filteredSuggestions.length > 0 && (
                                <div className="absolute z-10 w-full mt-1.5 bg-white border border-[#304250]/10 rounded-xl shadow-[0_10px_40px_rgba(48,66,80,0.08)] max-h-48 overflow-y-auto custom-scrollbar">
                                    {filteredSuggestions.map(p => (
                                        <div key={p.id} onClick={() => handleSelectProduct(p.name)} className="p-3 min-h-[44px] sm:min-h-0 hover:bg-[#20A46B]/5 hover:text-[#20A46B] cursor-pointer flex justify-between items-center border-b border-[#304250]/5 last:border-0 transition-colors">
                                            <span className="font-bold text-sm">{p.name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-extrabold text-[#304250]/60 uppercase tracking-widest">Batch ID</label>
                            <input className="w-full bg-gray-50 border border-[#304250]/10 rounded-xl p-3 min-h-[48px] sm:min-h-0 text-base sm:text-sm outline-none focus:ring-2 ring-[#20A46B]/20 focus:border-[#20A46B] focus:bg-white transition-all font-bold text-[#304250] placeholder:font-medium placeholder:text-[#304250]/30 shadow-sm" placeholder="e.g. #INV-001" value={formData.batchName} onChange={e => setFormData({ ...formData, batchName: e.target.value })} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-extrabold text-[#304250]/60 uppercase tracking-widest">Date</label>
                            <input type="date" className="w-full bg-gray-50 border border-[#304250]/10 rounded-xl p-3 min-h-[48px] sm:min-h-0 text-base sm:text-sm outline-none focus:ring-2 ring-[#20A46B]/20 focus:border-[#20A46B] focus:bg-white transition-all font-bold text-[#304250] shadow-sm" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#20A46B]/5 p-4 sm:p-5 rounded-2xl border border-[#20A46B]/20">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-extrabold text-[#20A46B] uppercase tracking-widest">Quantity</label>
                            <input type="number" className="w-full bg-white border border-[#20A46B]/30 rounded-xl p-3 min-h-[48px] sm:min-h-0 text-base sm:text-sm outline-none focus:ring-2 ring-[#20A46B]/20 focus:border-[#20A46B] font-black text-[#304250] shadow-sm placeholder:font-medium placeholder:text-[#304250]/30 transition-all" placeholder="0" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-extrabold text-[#20A46B] uppercase tracking-widest">Cost / Unit</label>
                            <input type="number" className="w-full bg-white border border-[#20A46B]/30 rounded-xl p-3 min-h-[48px] sm:min-h-0 text-base sm:text-sm outline-none focus:ring-2 ring-[#20A46B]/20 focus:border-[#20A46B] font-black text-[#304250] shadow-sm placeholder:font-medium placeholder:text-[#304250]/30 transition-all" placeholder="Rs 0" value={formData.perItemCost} onChange={e => setFormData({ ...formData, perItemCost: e.target.value })} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-extrabold text-[#20A46B] uppercase tracking-widest">Sell Price</label>
                            <input type="number" className="w-full bg-white border border-[#20A46B]/30 rounded-xl p-3 min-h-[48px] sm:min-h-0 text-base sm:text-sm outline-none focus:ring-2 ring-[#20A46B]/20 focus:border-[#20A46B] font-black text-[#304250] shadow-sm placeholder:font-medium placeholder:text-[#304250]/30 transition-all" placeholder="Rs 0" value={formData.sellingPrice} onChange={e => setFormData({ ...formData, sellingPrice: e.target.value })} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-extrabold text-[#304250]/60 uppercase tracking-widest">Supplier <span className="font-medium opacity-70">(Opt)</span></label>
                            <input className="w-full bg-gray-50 border border-[#304250]/10 rounded-xl p-3 min-h-[48px] sm:min-h-0 text-base sm:text-sm outline-none focus:ring-2 ring-[#20A46B]/20 focus:border-[#20A46B] focus:bg-white transition-all font-bold text-[#304250] placeholder:font-medium placeholder:text-[#304250]/30 shadow-sm" placeholder="e.g. Ali Traders" value={formData.supplier} onChange={e => setFormData({ ...formData, supplier: e.target.value })} />
                        </div>
                    </div>

                    {/* CALCULATED BREAKDOWN */}
                    <div className="bg-gray-50 p-5 rounded-2xl border border-[#304250]/10 space-y-4 shadow-sm">
                        {/* 👇 YELLOW ACCENT TO CALCULATOR ICON */}
                        <h4 className="text-[11px] font-extrabold text-[#304250]/60 uppercase tracking-widest flex items-center gap-2"><Calculator size={14} className="text-[#EEBE1C]" /> Total Calculation</h4>

                        <div className="flex justify-between items-center text-sm border-b border-[#304250]/5 pb-3">
                            <span className="text-[#304250]/70 font-bold">Subtotal ({calc.qty} x {calc.perItem})</span>
                            <span className="font-black text-[#304250]">Rs {calc.subTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                        </div>

                        {!editingBatch && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] text-[#304250]/50 font-extrabold uppercase tracking-widest">Total Transport</label>
                                    <input type="number" className="w-full bg-white border border-[#304250]/10 p-2.5 min-h-[44px] sm:min-h-0 rounded-xl text-base sm:text-sm focus:ring-2 outline-none ring-[#20A46B]/20 focus:border-[#20A46B] font-bold text-[#304250] shadow-sm transition-all placeholder:text-[#304250]/30" placeholder="0" value={formData.transportCost} onChange={e => setFormData({ ...formData, transportCost: e.target.value })} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] text-[#304250]/50 font-extrabold uppercase tracking-widest">Total Other</label>
                                    <input type="number" className="w-full bg-white border border-[#304250]/10 p-2.5 min-h-[44px] sm:min-h-0 rounded-xl text-base sm:text-sm focus:ring-2 outline-none ring-[#20A46B]/20 focus:border-[#20A46B] font-bold text-[#304250] shadow-sm transition-all placeholder:text-[#304250]/30" placeholder="0" value={formData.otherCost} onChange={e => setFormData({ ...formData, otherCost: e.target.value })} />
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between items-center pt-4 border-t border-[#304250]/10 bg-[#20A46B]/10 p-4 rounded-xl -mx-1 mt-2 border border-[#20A46B]/20">
                            <span className="text-sm font-extrabold text-[#304250] uppercase tracking-wide">{editingBatch ? 'Total Value' : 'Total Final Cost'}</span>
                            <span className="text-xl font-black text-[#20A46B] tracking-tight">Rs {calc.totalCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </div>

                <div className="p-5 border-t border-[#304250]/10 bg-gray-50 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
                    <button onClick={onClose} className="w-full sm:w-auto px-6 py-3 sm:py-2.5 bg-white border border-[#304250]/10 text-[#304250]/60 rounded-xl font-bold text-base sm:text-sm hover:bg-gray-100 hover:text-[#304250] transition-colors min-h-[48px] sm:min-h-0 shadow-sm active:scale-95">Cancel</button>
                    <button onClick={handleSubmit} className="w-full sm:w-auto px-8 py-3 sm:py-2.5 bg-[#20A46B] text-white rounded-xl font-extrabold text-base sm:text-sm shadow-[0_4px_14px_rgba(32,164,107,0.3)] hover:bg-[#20A46B]/90 transition-all flex items-center justify-center gap-2 min-h-[48px] sm:min-h-0 active:scale-[0.98]">
                        {editingBatch ? 'Update Stock' : 'Save Stock'}
                    </button>
                </div>
            </div>
        </div>
    );
}