import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PackingSlipLogicReturn } from '../usePackingSlipLogic';
import {
    Printer, Plus, Trash2, ClipboardList, Receipt,
    Gift, LayoutTemplate, ScanLine, Download, Search,
    Upload, Loader2, Eye, Edit3, User, Share2, Image
} from 'lucide-react';
import { TemplateType } from '@/types/packing-slip';
import {
    StyleStandard, StyleWarehouse, StyleThermal,
    StyleModern, StyleGift, StyleMinimal
} from '@/components/packing-slip/Templates';

export default function DesktopUI({ logic }: { logic: PackingSlipLogicReturn }) {
    const {
        data, template, setTemplate, isFetching, isDownloading, downloadFormat,
        showForm, setShowForm, register, fields, append, remove,
        handleFetchOrder, handleLogoUpload, componentRef, handlePrint, handleDownloadPDF, handleDownloadPNG
    } = logic;

    // Share State
    const [isSharing, setIsSharing] = useState(false);

    const renderTemplate = () => {
        switch (template) {
            case 'standard': return <StyleStandard data={data} />;
            case 'warehouse': return <StyleWarehouse data={data} />;
            case 'thermal': return <StyleThermal data={data} />;
            case 'modern': return <StyleModern data={data} />;
            case 'gift': return <StyleGift data={data} />;
            case 'minimal': return <StyleMinimal data={data} />;
            default: return <StyleStandard data={data} />;
        }
    };

    // Workable Desktop Share Function (With Clipboard Fallback)
    const handleShare = async () => {
        setIsSharing(true);
        try {
            if (navigator.share) {
                // If browser supports native sharing (Mac Safari/Edge)
                await navigator.share({
                    title: 'Packing Slip Details',
                    text: `Packing Slip for ${data.receiverName || 'Customer'}`,
                    url: window.location.href,
                });
            } else {
                // Fallback for Desktop Chrome/Windows: Copy to clipboard
                await navigator.clipboard.writeText(window.location.href);
                alert("Link copied to clipboard! You can now paste it anywhere.");
            }
        } catch (error) {
            console.log('Error sharing:', error);
        } finally {
            setIsSharing(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }} className="min-h-screen bg-[#f8fafc] font-sans text-[#304250] p-8">
            {/* 1. COMPACT TOP TOOLBAR */}
            <div className="max-w-[1100px] mx-auto bg-white p-3 rounded-[16px] shadow-[0_8px_30px_rgba(48,66,80,0.04)] mb-8 flex items-center justify-between gap-4 border border-[#304250]/10">
                <div className="flex gap-2 w-auto pb-0 px-1">
                    {[
                        { id: 'standard', icon: Receipt, label: 'Standard' },
                        { id: 'warehouse', icon: ClipboardList, label: 'Warehouse' },
                        { id: 'modern', icon: LayoutTemplate, label: 'Modern' },
                        { id: 'gift', icon: Gift, label: 'Gift Style' },
                        { id: 'minimal', icon: ScanLine, label: 'Minimal' },
                        { id: 'thermal', icon: Printer, label: '4x6 Label' }
                    ].map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTemplate(t.id as TemplateType)}
                            className={`flex flex-col items-center justify-center min-w-[85px] min-h-[64px] rounded-xl border-[2px] transition-all duration-300 shrink-0
                            ${template === t.id ? 'border-[#20A46B] bg-[#20A46B]/5 shadow-sm' : 'border-transparent hover:bg-gray-50'}`}
                        >
                            <div className={`w-[50px] h-[34px] rounded-md mb-1.5 flex items-center justify-center transition-colors ${template === t.id ? 'bg-[#20A46B]/10 text-[#20A46B]' : 'bg-gray-100 text-[#304250]/40'}`}>
                                <t.icon size={16} />
                            </div>
                            <span className={`text-[11px] font-extrabold tracking-wider uppercase ${template === t.id ? 'text-[#20A46B]' : 'text-[#304250]/50'}`}>{t.label}</span>
                        </button>
                    ))}
                </div>

                <div className="flex items-center justify-end gap-2 border-l border-[#304250]/10 pl-4 pr-1">
                    <button
                        title={showForm ? 'Hide Form' : 'Edit Details'}
                        onClick={() => setShowForm(!showForm)}
                        className={`flex items-center justify-center p-3 rounded-xl border transition-all shadow-sm active:scale-95
                        ${showForm ? 'bg-gray-100 border-transparent text-[#304250]' : 'bg-white border-[#304250]/10 text-[#304250]/60 hover:border-[#304250]/30 hover:text-[#304250]'}`}
                    >
                        {showForm ? <Eye size={18} /> : <Edit3 size={18} />}
                    </button>

                    {/* SHARE BUTTON (10% Accent Yellow) */}
                    <button
                        title="Share Slip"
                        onClick={handleShare}
                        disabled={isSharing}
                        className="flex items-center justify-center bg-[#EEBE1C] text-[#304250] hover:bg-[#d9ab18] p-3 rounded-xl transition-all shadow-[0_4px_14px_rgba(238,190,28,0.3)] disabled:opacity-50 active:scale-95"
                    >
                        {isSharing ? <Loader2 size={18} className="animate-spin text-[#304250]" /> : <Share2 size={18} />}
                    </button>

                    <button
                        title="Download PDF"
                        onClick={handleDownloadPDF}
                        disabled={isDownloading}
                        className="flex items-center justify-center bg-[#20A46B] text-white hover:bg-[#20A46B]/90 p-3 rounded-xl transition-all shadow-[0_4px_14px_rgba(32,164,107,0.3)] disabled:opacity-50 active:scale-95"
                    >
                        {isDownloading && downloadFormat === 'pdf' ? <Loader2 size={18} className="animate-spin text-white" /> : <Download size={18} />}
                    </button>

                    <button
                        title="Download PNG"
                        onClick={handleDownloadPNG}
                        disabled={isDownloading}
                        className="flex items-center justify-center bg-[#20A46B] text-white hover:bg-[#20A46B]/90 p-3 rounded-xl transition-all shadow-[0_4px_14px_rgba(32,164,107,0.3)] disabled:opacity-50 active:scale-95"
                    >
                        {isDownloading && downloadFormat === 'png' ? <Loader2 size={18} className="animate-spin text-white" /> : <Image size={18} />}
                    </button>

                    <button
                        title="Print Slip"
                        onClick={handlePrint}
                        className="flex items-center justify-center bg-[#304250] hover:bg-[#304250]/90 text-white p-3 rounded-xl shadow-[0_4px_14px_rgba(48,66,80,0.3)] transition-all active:scale-95"
                    >
                        <Printer size={18} />
                    </button>
                </div>
            </div>

            {/* 2. OPTIONAL DATA FORM */}
            {showForm && (
                <div className="max-w-[1100px] mx-auto bg-white p-8 rounded-[24px] shadow-[0_8px_30px_rgba(48,66,80,0.04)] mb-8 animate-in fade-in slide-in-from-top-4 border border-[#304250]/10">
                    <form className="grid grid-cols-3 gap-8">
                        {/* Col 1: Business & Logistics */}
                        <div className="space-y-4">
                            <h3 className="font-extrabold text-[#304250] border-b border-[#304250]/10 pb-2 mb-2 uppercase tracking-wide text-sm">Business & Logistics</h3>
                            <div className="flex gap-2 items-center">
                                <input {...register('orderId')} placeholder="Order ID (Quick Import)" className="flex-1 p-3 min-h-[40px] border border-[#304250]/10 rounded-xl text-sm outline-none focus:ring-2 ring-[#20A46B]/20 focus:border-[#20A46B] bg-gray-50 focus:bg-white transition-all font-bold text-[#304250] placeholder:font-medium placeholder:text-[#304250]/40" />
                                <button type="button" onClick={handleFetchOrder} disabled={isFetching} className="bg-gray-100 w-10 h-10 rounded-xl hover:bg-gray-200 text-[#304250]/60 disabled:opacity-50 flex items-center justify-center shrink-0 transition-colors active:scale-95">
                                    {isFetching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                                </button>
                            </div>
                            <label className="cursor-pointer border-2 border-dashed border-[#304250]/20 bg-gray-50 hover:bg-[#20A46B]/5 hover:border-[#20A46B]/30 rounded-xl p-3 min-h-[40px] flex justify-center items-center transition-colors mt-2 mb-2 active:scale-95">
                                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                                <span className="text-sm font-extrabold text-[#304250]/60 flex items-center gap-2"><Upload size={18} /> Upload Logo</span>
                            </label>

                            <input {...register('senderName')} placeholder="Business Name" className="w-full p-3 min-h-[40px] border border-[#304250]/10 rounded-xl text-sm outline-none focus:ring-2 ring-[#20A46B]/20 focus:border-[#20A46B] bg-gray-50 focus:bg-white transition-all font-bold text-[#304250] placeholder:font-medium placeholder:text-[#304250]/40" />
                            <input {...register('senderPhone')} placeholder="Support Phone" className="w-full p-3 min-h-[40px] border border-[#304250]/10 rounded-xl text-sm outline-none focus:ring-2 ring-[#20A46B]/20 focus:border-[#20A46B] bg-gray-50 focus:bg-white transition-all font-bold text-[#304250] placeholder:font-medium placeholder:text-[#304250]/40" />
                            <textarea {...register('senderAddress')} placeholder="Full Return Address" className="w-full p-3 min-h-[40px] border border-[#304250]/10 rounded-xl text-sm outline-none focus:ring-2 ring-[#20A46B]/20 focus:border-[#20A46B] bg-gray-50 focus:bg-white transition-all font-bold text-[#304250] placeholder:font-medium placeholder:text-[#304250]/40 custom-scrollbar" rows={2} />

                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#304250]/5 mt-2">
                                <input {...register('orderDate')} type="date" className="w-full p-3 min-h-[40px] border border-[#304250]/10 rounded-xl text-sm outline-none focus:ring-2 ring-[#20A46B]/20 focus:border-[#20A46B] bg-gray-50 focus:bg-white transition-all font-bold text-[#304250]" />
                                <input {...register('shippingMethod')} placeholder="Courier Method" className="w-full p-3 min-h-[40px] border border-[#304250]/10 rounded-xl text-sm outline-none focus:ring-2 ring-[#20A46B]/20 focus:border-[#20A46B] bg-gray-50 focus:bg-white transition-all font-bold text-[#304250] placeholder:font-medium placeholder:text-[#304250]/40" />
                            </div>
                            <input {...register('totalWeight')} placeholder="Total Weight (e.g. 1kg)" className="w-full p-3 min-h-[40px] border border-[#304250]/10 rounded-xl text-sm outline-none focus:ring-2 ring-[#20A46B]/20 focus:border-[#20A46B] bg-gray-50 focus:bg-white transition-all font-bold text-[#304250] placeholder:font-medium placeholder:text-[#304250]/40 mt-2" />
                        </div>

                        {/* Col 2: Customer Info & Notes */}
                        <div className="space-y-4">
                            <h3 className="font-extrabold text-[#304250] border-b border-[#304250]/10 pb-2 mb-2 uppercase tracking-wide text-sm">Customer Details</h3>
                            <div className="relative">
                                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#304250]/40" />
                                <input {...register('receiverName')} placeholder="Customer Name" className="w-full pl-10 p-3 min-h-[40px] border border-[#304250]/10 rounded-xl text-sm font-bold text-[#304250] outline-none focus:ring-2 ring-[#20A46B]/20 focus:border-[#20A46B] bg-gray-50 focus:bg-white transition-all placeholder:font-medium placeholder:text-[#304250]/40" />
                            </div>
                            <input {...register('receiverPhone')} placeholder="Phone Number" className="w-full p-3 min-h-[40px] border border-[#304250]/10 rounded-xl text-sm font-bold text-[#304250] outline-none focus:ring-2 ring-[#20A46B]/20 focus:border-[#20A46B] bg-gray-50 focus:bg-white transition-all placeholder:font-medium placeholder:text-[#304250]/40" />
                            <input {...register('receiverCity')} placeholder="City" className="w-full p-3 min-h-[40px] border border-[#304250]/10 rounded-xl text-sm font-bold text-[#304250] outline-none focus:ring-2 ring-[#20A46B]/20 focus:border-[#20A46B] bg-gray-50 focus:bg-white transition-all placeholder:font-medium placeholder:text-[#304250]/40" />
                            <textarea {...register('receiverAddress')} placeholder="Delivery Address" className="w-full p-3 min-h-[40px] border border-[#304250]/10 rounded-xl text-sm font-bold text-[#304250] outline-none focus:ring-2 ring-[#20A46B]/20 focus:border-[#20A46B] bg-gray-50 focus:bg-white transition-all placeholder:font-medium placeholder:text-[#304250]/40 custom-scrollbar" rows={2} />

                            <h3 className="font-extrabold text-[#304250] border-b border-[#304250]/10 pb-2 pt-2 mt-4 mb-2 uppercase tracking-wide text-sm">Extra Notes</h3>
                            <textarea {...register('internalNotes')} placeholder="Internal Note (e.g. Fragile)" className="w-full p-3 min-h-[40px] border border-[#EEBE1C]/40 bg-[#EEBE1C]/10 rounded-xl text-sm font-bold text-[#304250] outline-none focus:ring-2 ring-[#EEBE1C]/20 focus:border-[#EEBE1C] transition-all placeholder:font-medium placeholder:text-[#304250]/50 custom-scrollbar" rows={2} />
                            <textarea {...register('customerNotes')} placeholder="Note for Customer" className="w-full p-3 min-h-[40px] border border-[#304250]/10 rounded-xl text-sm font-bold text-[#304250] outline-none focus:ring-2 ring-[#20A46B]/20 focus:border-[#20A46B] bg-gray-50 focus:bg-white transition-all placeholder:font-medium placeholder:text-[#304250]/40 custom-scrollbar mt-2" rows={2} />
                        </div>

                        {/* Col 3: Items List */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center border-b border-[#304250]/10 pb-2">
                                <h3 className="font-extrabold text-[#304250] uppercase tracking-wide text-sm">Products List</h3>
                                <button type="button" onClick={() => append({ id: Date.now().toString(), sku: '', name: '', variant: '', quantity: 1 })} className="text-[#20A46B] text-xs font-extrabold flex items-center gap-1 hover:underline min-h-0 px-0 active:scale-95 transition-transform">
                                    <Plus size={14} /> Add Item
                                </button>
                            </div>

                            <div className="max-h-[400px] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                                {fields.length === 0 && <p className="text-xs text-[#304250]/40 text-center py-4 italic font-bold">No products added.</p>}

                                {fields.map((field, index) => (
                                    <div key={field.id} className="bg-gray-50 p-3 rounded-xl border border-[#304250]/10 relative group transition-all mt-2 hover:border-[#304250]/30 shadow-sm">
                                        <button type="button" onClick={() => remove(index)} className="absolute -top-2 -right-2 bg-white border border-[#304250]/10 text-[#304250]/40 hover:text-red-500 w-8 h-8 flex items-center justify-center rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all z-10 active:scale-95">
                                            <Trash2 size={14} />
                                        </button>

                                        <div className="grid grid-cols-12 gap-2 mb-2">
                                            <input {...register(`items.${index}.sku`)} placeholder="SKU" className="col-span-4 p-2 min-h-[40px] border border-[#304250]/10 rounded-xl text-sm font-bold text-[#304250] outline-none focus:ring-2 ring-[#20A46B]/20 focus:border-[#20A46B] bg-white transition-all placeholder:font-medium placeholder:text-[#304250]/40" />
                                            <input {...register(`items.${index}.name`)} placeholder="Product Name" className="col-span-8 p-2 min-h-[40px] border border-[#304250]/10 rounded-xl text-sm font-bold text-[#304250] outline-none focus:ring-2 ring-[#20A46B]/20 focus:border-[#20A46B] bg-white transition-all placeholder:font-medium placeholder:text-[#304250]/40" />
                                        </div>
                                        <div className="grid grid-cols-12 gap-2">
                                            <input {...register(`items.${index}.variant`)} placeholder="Variant" className="col-span-8 p-2 min-h-[40px] border border-[#304250]/10 rounded-xl text-sm font-bold text-[#304250] outline-none focus:ring-2 ring-[#20A46B]/20 focus:border-[#20A46B] bg-white transition-all placeholder:font-medium placeholder:text-[#304250]/40" />
                                            <input {...register(`items.${index}.quantity`)} type="number" placeholder="Qty" className="col-span-4 p-2 min-h-[40px] border border-[#304250]/10 rounded-xl text-sm font-bold text-[#304250] text-center outline-none focus:ring-2 ring-[#20A46B]/20 focus:border-[#20A46B] bg-white transition-all placeholder:font-medium placeholder:text-[#304250]/40" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </form>
                </div>
            )}

            {/* 3. CANVAS AREA */}
            <div className="max-w-[1100px] mx-auto flex justify-center px-4">
                <div className="bg-white shadow-[0_20px_60px_rgba(48,66,80,0.08)] rounded-[24px] rounded-t-[24px] p-8 w-max h-max transition-all duration-300 origin-top">
                    <div
                        ref={componentRef}
                        className={`bg-white overflow-hidden relative transition-all duration-300
                        ${template === 'thermal'
                                ? 'w-[400px] h-[600px]'
                                : 'w-max h-max min-w-[700px] min-h-[900px]'
                            }`}
                    >
                        {renderTemplate()}
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #30425020; border-radius: 20px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #30425040; }
            `}</style>

        </motion.div>
    );
}