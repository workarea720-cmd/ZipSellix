import React, { useState } from 'react';
import { PackingSlipLogicReturn } from '../usePackingSlipLogic';
import {
    Printer, ChevronRight, ChevronLeft, User, Upload,
    Download, Loader2, Search, Plus, Trash2, Share2,
    Building, Package, CheckCircle2, Image, Banknote, Truck as TruckIcon, Shield, Zap, PenTool
} from 'lucide-react';
import { TemplateType } from '@/types/packing-slip';
import {
    StyleStandard, StyleWarehouse, StyleThermal,
    StyleModern, StyleGift, StyleMinimal
} from '@/components/packing-slip/Templates';
import { PROVINCES } from '@/store/business-store';

export default function MobileUI({ logic }: { logic: PackingSlipLogicReturn }) {
    const {
        data, template, setTemplate, isFetching, isDownloading, downloadFormat,
        showForm, setShowForm, register, fields, append, remove,
        handleFetchOrder, handleLogoUpload, componentRef, handlePrint, handleDownloadPDF, handleDownloadPNG
    } = logic;

    const [step, setStep] = useState(1);
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

    const progress = (step / 4) * 100;

    // Workable Mobile Share Function
    const handleShare = async () => {
        setIsSharing(true);
        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'Packing Slip Details',
                    text: `Packing Slip for ${data.receiverName || 'Customer'}`,
                    url: window.location.href,
                });
            } else {
                await navigator.clipboard.writeText(window.location.href);
                alert("Link copied to clipboard!");
            }
        } catch (error) {
            console.log('Error sharing:', error);
        } finally {
            setIsSharing(false);
        }
    };

    const templateNames: Record<TemplateType, string> = {
        standard: 'Standard',
        warehouse: 'Warehouse',
        modern: 'Modern',
        gift: 'Gift Style',
        minimal: 'Minimal',
        thermal: '4x6 Label'
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans text-[#304250] pb-[120px]">

            {/* COMPACT PROGRESS HEADER */}
            <header className="bg-white sticky top-0 z-40 shadow-sm border-b border-[#304250]/10">
                <div className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 w-full">
                        <h1 className="font-extrabold text-[#304250] text-sm sm:text-base flex items-center gap-1.5 flex-1 truncate">
                            {step === 1 && <><Building size={16} className="text-[#20A46B] shrink-0" /> <span className="truncate">Business Info</span></>}
                            {step === 2 && <><User size={16} className="text-[#20A46B] shrink-0" /> <span className="truncate">Customer Info</span></>}
                            {step === 3 && <><Package size={16} className="text-[#20A46B] shrink-0" /> <span className="truncate">Order Items</span></>}
                            {step === 4 && <><CheckCircle2 size={16} className="text-[#20A46B] shrink-0" /> <span className="truncate">Slip Ready</span></>}
                        </h1>
                        <p className="text-[11px] text-[#20A46B] font-black uppercase tracking-widest bg-[#20A46B]/10 px-2 py-1 rounded-md shrink-0">Step {step} / 4</p>
                    </div>
                </div>
                <div className="w-full h-1 bg-gray-100">
                    <div className="h-full bg-[#20A46B] transition-all duration-500 ease-out rounded-r-full" style={{ width: `${progress}%` }}></div>
                </div>
            </header>

            {/* Content Body */}
            <main className="flex-1 p-4 w-full max-w-[500px] mx-auto">

                {/* STEP 1: Business & Logistics */}
                {step === 1 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        {/* Quick Import Box */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#304250]/10">
                            <label className="text-[10px] font-extrabold text-[#304250]/60 uppercase tracking-widest mb-2 block">Quick Import Order</label>
                            <div className="relative flex items-center">
                                <input placeholder="Enter Order ID" className="w-full px-4 py-3.5 pr-14 bg-gray-50 border border-[#304250]/10 rounded-xl outline-none focus:border-[#20A46B] focus:ring-1 ring-[#20A46B] text-sm font-bold text-[#304250] placeholder:font-medium placeholder:text-[#304250]/40 transition-all shadow-sm" {...register('orderId')} />
                                <button type="button" onClick={handleFetchOrder} disabled={isFetching} className="absolute right-1.5 w-10 h-10 bg-[#20A46B]/10 flex items-center justify-center rounded-lg hover:bg-[#20A46B]/20 text-[#20A46B] transition-colors disabled:opacity-50">
                                    {isFetching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Business Info Box */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#304250]/10 space-y-4">
                            <label className="cursor-pointer border-2 border-dashed border-[#304250]/20 rounded-xl min-h-[90px] flex flex-col justify-center items-center bg-gray-50 hover:bg-[#20A46B]/5 hover:border-[#20A46B]/30 transition-all relative overflow-hidden group shadow-sm active:scale-95">
                                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                                {data.logoUrl ? (
                                    <>
                                        <img src={data.logoUrl} alt="Store Logo" className="h-[80px] w-auto object-contain p-2 absolute inset-0 m-auto" />
                                        <div className="absolute inset-0 bg-[#304250]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-white text-xs font-bold flex items-center gap-1.5"><Upload size={14} /> Change</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <Upload size={22} className="text-[#304250]/30 mb-1" />
                                        <span className="text-xs font-extrabold text-[#304250]/50">Upload Store Logo</span>
                                    </>
                                )}
                            </label>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold text-[#304250]/60 uppercase tracking-widest pl-1">Business Name</label>
                                <input {...register('senderName')} placeholder="e.g. My Store" className="w-full px-4 py-3.5 border border-[#304250]/10 rounded-xl bg-gray-50 focus:bg-white focus:border-[#20A46B] focus:ring-1 ring-[#20A46B] outline-none text-sm font-bold text-[#304250] transition-all shadow-sm placeholder:font-medium placeholder:text-[#304250]/40" />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold text-[#304250]/60 uppercase tracking-widest pl-1">Support Phone</label>
                                <input {...register('senderPhone')} placeholder="+92 300 0000000" className="w-full px-4 py-3.5 border border-[#304250]/10 rounded-xl bg-gray-50 focus:bg-white focus:border-[#20A46B] focus:ring-1 ring-[#20A46B] outline-none text-sm font-bold text-[#304250] transition-all shadow-sm placeholder:font-medium placeholder:text-[#304250]/40" />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold text-[#304250]/60 uppercase tracking-widest pl-1">Return Address</label>
                                <textarea {...register('senderAddress')} placeholder="Enter full return address..." rows={2} className="w-full border border-[#304250]/10 rounded-xl p-4 bg-gray-50 focus:bg-white focus:border-[#20A46B] focus:ring-1 ring-[#20A46B] outline-none text-sm font-medium text-[#304250] resize-none custom-scrollbar transition-all shadow-sm placeholder:text-[#304250]/40" />
                            </div>
                        </div>

                        {/* Logistics Box */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#304250]/10 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-extrabold text-[#304250]/60 uppercase tracking-widest pl-1">Order Date</label>
                                    <input type="date" {...register('orderDate')} className="w-full px-3 py-3.5 border border-[#304250]/10 rounded-xl bg-gray-50 focus:bg-white focus:border-[#20A46B] focus:ring-1 ring-[#20A46B] outline-none text-sm font-bold text-[#304250] transition-all shadow-sm" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-extrabold text-[#304250]/60 uppercase tracking-widest pl-1">Courier</label>
                                    <input {...register('shippingMethod')} placeholder="e.g. TCS" className="w-full px-4 py-3.5 border border-[#304250]/10 rounded-xl bg-gray-50 focus:bg-white focus:border-[#20A46B] focus:ring-1 ring-[#20A46B] outline-none text-sm font-bold text-[#304250] transition-all shadow-sm placeholder:font-medium placeholder:text-[#304250]/40" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold text-[#304250]/60 uppercase tracking-widest pl-1">Total Weight</label>
                                <input {...register('totalWeight')} placeholder="e.g. 1.5 kg" className="w-full px-4 py-3.5 border border-[#304250]/10 rounded-xl bg-gray-50 focus:bg-white focus:border-[#20A46B] focus:ring-1 ring-[#20A46B] outline-none text-sm font-bold text-[#304250] transition-all shadow-sm placeholder:font-medium placeholder:text-[#304250]/40" />
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: Customer Details & Notes */}
                {step === 2 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#304250]/10 space-y-4">

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold text-[#304250]/60 uppercase tracking-widest pl-1">Customer Name</label>
                                <div className="relative flex items-center">
                                    <User size={18} className="absolute left-3.5 text-[#304250]/30" />
                                    <input {...register('receiverName')} placeholder="Full Name" className="w-full px-4 py-3.5 pl-11 border border-[#304250]/10 rounded-xl bg-gray-50 focus:bg-white focus:border-[#20A46B] focus:ring-1 ring-[#20A46B] outline-none text-sm font-bold text-[#304250] transition-all shadow-sm placeholder:font-medium placeholder:text-[#304250]/40" />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold text-[#304250]/60 uppercase tracking-widest pl-1">Customer Phone</label>
                                <input {...register('receiverPhone')} placeholder="Phone Number" className="w-full px-4 py-3.5 border border-[#304250]/10 rounded-xl bg-gray-50 focus:bg-white focus:border-[#20A46B] focus:ring-1 ring-[#20A46B] outline-none text-sm font-bold text-[#304250] transition-all shadow-sm placeholder:font-medium placeholder:text-[#304250]/40" />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-extrabold text-[#304250]/60 uppercase tracking-widest pl-1">City</label>
                                    <input {...register('receiverCity')} placeholder="e.g. Lahore" className="w-full px-4 py-3.5 border border-[#304250]/10 rounded-xl bg-gray-50 focus:bg-white focus:border-[#20A46B] focus:ring-1 ring-[#20A46B] outline-none text-sm font-bold text-[#304250] transition-all shadow-sm placeholder:font-medium placeholder:text-[#304250]/40" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-extrabold text-[#304250]/60 uppercase tracking-widest pl-1">Province</label>
                                    <select {...register('receiverProvince')} className="w-full px-3 py-3.5 border border-[#304250]/10 rounded-xl bg-gray-50 focus:bg-white focus:border-[#20A46B] focus:ring-1 ring-[#20A46B] outline-none text-sm font-bold text-[#304250] transition-all shadow-sm">
                                        <option value="">Select</option>
                                        {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold text-[#304250]/60 uppercase tracking-widest pl-1">Delivery Address</label>
                                <textarea {...register('receiverAddress')} placeholder="House, Street, Area..." rows={3} className="w-full border border-[#304250]/10 rounded-xl p-4 bg-gray-50 focus:bg-white focus:border-[#20A46B] focus:ring-1 ring-[#20A46B] outline-none text-sm font-medium text-[#304250] resize-none custom-scrollbar transition-all shadow-sm placeholder:text-[#304250]/40" />
                            </div>
                        </div>

                        {/* Notes Box */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#304250]/10 space-y-4">
                            <h2 className="font-extrabold text-[#304250] border-b border-[#304250]/10 pb-2">Extra Notes</h2>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold text-[#EEBE1C] uppercase tracking-widest pl-1">Internal Note</label>
                                <textarea {...register('internalNotes')} placeholder="e.g. Confirm address before dispatch" rows={2} className="w-full border border-[#EEBE1C]/30 bg-[#EEBE1C]/10 rounded-xl p-4 focus:bg-white focus:border-[#EEBE1C] focus:ring-1 ring-[#EEBE1C]/30 outline-none text-sm font-medium text-[#304250] resize-none transition-all shadow-sm placeholder:text-[#304250]/40 custom-scrollbar" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold text-[#304250]/60 uppercase tracking-widest pl-1">Note For Customer</label>
                                <textarea {...register('customerNotes')} placeholder="e.g. Thank you for shopping with us!" rows={2} className="w-full border border-[#304250]/10 rounded-xl p-4 bg-gray-50 focus:bg-white focus:border-[#20A46B] focus:ring-1 ring-[#20A46B] outline-none text-sm font-medium text-[#304250] resize-none transition-all shadow-sm placeholder:text-[#304250]/40 custom-scrollbar mt-2" />
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 3: Products */}
                {step === 3 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-[#304250]/10">
                            <h2 className="font-extrabold text-[#304250] uppercase tracking-wide text-sm">Products List</h2>
                            <button type="button" onClick={() => append({ id: Date.now().toString(), sku: '', name: '', variant: '', quantity: 1 })} className="text-[#20A46B] bg-[#20A46B]/10 hover:bg-[#20A46B]/20 px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-colors active:scale-95">
                                <Plus size={14} /> Add Item
                            </button>
                        </div>

                        <div className="space-y-3">
                            {fields.length === 0 && (
                                <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#304250]/20 border-dashed text-center">
                                    <p className="text-sm font-bold text-[#304250]/40">No products added yet.</p>
                                </div>
                            )}

                            {fields.map((field, index) => (
                                <div key={field.id} className="bg-gray-50 p-4 rounded-2xl shadow-sm border border-[#304250]/10 relative group transition-all hover:border-[#304250]/30 hover:shadow-md">
                                    <div className="flex justify-between items-center mb-3 border-b border-[#304250]/5 pb-2">
                                        <span className="text-[10px] font-extrabold text-[#304250]/40 uppercase tracking-widest">Item {index + 1}</span>
                                        <button type="button" onClick={() => remove(index)} className="text-red-500 bg-red-50 hover:bg-red-100 border border-red-100 w-7 h-7 flex items-center justify-center rounded-full shadow-sm transition-all active:scale-95 z-10">
                                            <Trash2 size={12} />
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="grid grid-cols-12 gap-2">
                                            <div className="col-span-4">
                                                <input {...register(`items.${index}.sku` as const)} placeholder="SKU" className="w-full px-3 py-3 border border-[#304250]/10 rounded-xl bg-white focus:ring-2 ring-[#20A46B]/20 focus:border-[#20A46B] outline-none text-xs font-bold text-[#304250] transition-all shadow-sm placeholder:font-medium placeholder:text-[#304250]/30" />
                                            </div>
                                            <div className="col-span-8">
                                                <input {...register(`items.${index}.name` as const)} placeholder="Product Name" className="w-full px-3 py-3 border border-[#304250]/10 rounded-xl bg-white focus:ring-2 ring-[#20A46B]/20 focus:border-[#20A46B] outline-none text-xs font-bold text-[#304250] transition-all shadow-sm placeholder:font-medium placeholder:text-[#304250]/30" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-12 gap-2">
                                            <div className="col-span-8">
                                                <input {...register(`items.${index}.variant` as const)} placeholder="Variant (e.g. Size M)" className="w-full px-3 py-3 border border-[#304250]/10 rounded-xl bg-white focus:ring-2 ring-[#20A46B]/20 focus:border-[#20A46B] outline-none text-xs font-bold text-[#304250] transition-all shadow-sm placeholder:font-medium placeholder:text-[#304250]/30" />
                                            </div>
                                            <div className="col-span-4">
                                                <input type="number" {...register(`items.${index}.quantity` as const)} placeholder="Qty" className="w-full px-3 py-3 border border-[#304250]/10 rounded-xl bg-white text-center focus:ring-2 ring-[#20A46B]/20 focus:border-[#20A46B] outline-none text-xs font-bold text-[#304250] transition-all shadow-sm placeholder:font-medium placeholder:text-[#304250]/30" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* STEP 4: Templates & Preview */}
                {step === 4 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">

                        {/* COMPACT TEMPLATE SELECTOR (GRID BASED) */}
                        <div className="bg-white p-3.5 rounded-2xl shadow-[0_4px_20px_rgba(48,66,80,0.04)] border border-[#304250]/10">
                            <label className="text-[10px] font-extrabold text-[#304250]/60 uppercase tracking-widest mb-2.5 block px-1">Select Design</label>

                            <div className="grid grid-cols-3 gap-1.5 w-full">
                                {(Object.keys(templateNames) as TemplateType[]).map((tId) => (
                                    <button
                                        key={tId}
                                        onClick={() => setTemplate(tId)}
                                        className={`py-2 px-1 rounded-xl text-[11px] font-extrabold transition-colors border-2
                                            ${template === tId
                                                ? 'bg-[#20A46B] text-white border-[#20A46B] shadow-md'
                                                : 'bg-gray-50 border-transparent text-[#304250]/60 hover:bg-gray-100 hover:text-[#304250]'
                                            }`}
                                    >
                                        {templateNames[tId]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* PERFECT ALIGNMENT & SCALING FOR A4 AND THERMAL */}
                        <div className="w-full flex justify-center items-center bg-gray-100/80 rounded-2xl p-4 sm:p-6 border border-[#304250]/10 shadow-inner overflow-hidden relative" style={{ height: '420px' }}>
                            <div
                                className="relative flex justify-center items-start w-full h-full"
                            >
                                <div
                                    className="absolute"
                                    style={{
                                        // Both Scale and Translation handled together to keep it dead center
                                        transform: `scale(${template === 'thermal' ? '0.55' : '0.33'})`,
                                        transformOrigin: 'top center',
                                    }}
                                >
                                    <div
                                        ref={componentRef}
                                        className="bg-white shadow-[0_10px_40px_rgba(0,0,0,0.15)] rounded-sm overflow-hidden"
                                        style={{
                                            width: template === 'thermal' ? '400px' : '794px',
                                            minHeight: template === 'thermal' ? '500px' : '1123px', // Exact A4 aspect ratio fixed
                                            margin: '0 auto' // Ensures container is centered
                                        }}
                                    >
                                        {renderTemplate()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Floating App-like Bottom Navigation */}
            <div className="fixed bottom-4 left-4 right-4 bg-white/95 backdrop-blur-xl border border-[#304250]/10 p-3 flex items-center justify-between gap-3 z-50 shadow-[0_8px_30px_rgba(48,66,80,0.15)] rounded-2xl">
                {step > 1 && (
                    <button
                        onClick={() => setStep(step - 1)}
                        className="w-12 h-12 shrink-0 flex items-center justify-center text-[#304250] bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
                    >
                        <ChevronLeft size={22} />
                    </button>
                )}

                {step < 4 ? (
                    <button
                        onClick={() => setStep(step + 1)}
                        className="flex-1 h-12 flex items-center justify-center gap-2 font-extrabold text-sm text-white bg-[#20A46B] hover:bg-[#20A46B]/90 rounded-xl shadow-[0_4px_14px_rgba(32,164,107,0.3)] active:scale-[0.98] transition-all"
                    >
                        Next Step <ChevronRight size={18} />
                    </button>
                ) : (
                    <>
                        <button
                            onClick={handleShare}
                            disabled={isSharing}
                            className="w-12 h-12 shrink-0 flex items-center justify-center text-[#304250] bg-[#EEBE1C] hover:bg-[#d9ab18] rounded-xl shadow-md active:scale-95 transition-all disabled:opacity-50"
                        >
                            {isSharing ? <Loader2 size={18} className="animate-spin text-[#304250]" /> : <Share2 size={18} />}
                        </button>

                        <button
                            onClick={handleDownloadPDF}
                            disabled={isDownloading}
                            className="w-12 h-12 shrink-0 flex items-center justify-center text-white bg-[#20A46B] hover:bg-[#20A46B]/90 rounded-xl shadow-[0_4px_14px_rgba(32,164,107,0.3)] active:scale-95 transition-all disabled:opacity-50"
                        >
                            {isDownloading && downloadFormat === 'pdf' ? <Loader2 size={18} className="animate-spin text-white" /> : <Download size={18} />}
                        </button>

                        <button
                            onClick={handleDownloadPNG}
                            disabled={isDownloading}
                            className="w-12 h-12 shrink-0 flex items-center justify-center text-white bg-[#20A46B] hover:bg-[#20A46B]/90 rounded-xl shadow-[0_4px_14px_rgba(32,164,107,0.3)] active:scale-95 transition-all disabled:opacity-50"
                        >
                            {isDownloading && downloadFormat === 'png' ? <Loader2 size={18} className="animate-spin text-white" /> : <Image size={18} />}
                        </button>

                        <button
                            onClick={handlePrint}
                            className="flex-1 h-12 flex items-center justify-center gap-2 font-extrabold text-sm text-white bg-[#304250] hover:bg-[#304250]/90 rounded-xl shadow-[0_4px_14px_rgba(48,66,80,0.3)] active:scale-[0.98] transition-all"
                        >
                            <Printer size={18} /> Print
                        </button>
                    </>
                )}
            </div>

            <style jsx global>{`
                @media print {
                    body * { visibility: hidden !important; }
                    .print-area, .print-area * { visibility: visible !important; }
                    .print-area { position: absolute; left: 0; top: 0; }
                }
                .custom-scrollbar::-webkit-scrollbar { height: 4px; width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #30425020; border-radius: 10px; }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: #30425040; }
            `}</style>
        </div>
    );
}