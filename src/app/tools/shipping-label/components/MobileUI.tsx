/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from 'react';
import { ShippingLabelLogicReturn } from '../useShippingLabelLogic';
import {
    Printer, ChevronRight, ChevronLeft, User, Upload,
    Download, Loader2, Search, CheckCircle2, Building, Truck, Share2,
    Package, Send, Banknote, ChevronDown, RotateCcw, Info, LayoutDashboard, Receipt, ClipboardList, Scan, ShieldCheck
} from 'lucide-react';
import {
    BrandPriority, IconHeader, CleanVertical,
    FragileHeader, QRModern
} from '@/components/shipping-label/Templates';
import { TemplateType } from '@/types/shipping-label';
import { SafeBarcode } from '@/components/shipping-label/Barcode';
import { PROVINCES } from '@/store/business-store';

const TEMPLATE_OPTIONS: { id: TemplateType; label: string; icon: any }[] = [
    { id: 'postex', label: 'PostEx', icon: LayoutDashboard },
    { id: 'tcs', label: 'TCS', icon: Receipt },
    { id: 'trax', label: 'Trax', icon: Package },
    { id: 'leopards', label: 'Leopards', icon: ClipboardList },
    { id: 'minimal', label: 'M&P', icon: Scan }
];

export default function MobileUI({ logic }: { logic: ShippingLabelLogicReturn }) {
    const {
        data, template, setTemplate, updateData, setInstructions,
        componentRef, isDownloading, downloadFormat,
        currentStep, setCurrentStep,
        isBooking, bookingSuccess,
        orderIdToSearch, setOrderIdToSearch,
        couriers, businessInfo,
        register, watch, setValue, errors,
        handleLogoUpload, handleBookOrder, handleDownloadPDF,
        handleFetchOrder, handlePrint, handleShare,
        validateAndProceed, resetForNewOrder,
    } = logic;

    const [isSharing, setIsSharing] = useState(false);

    // Label Canvas Dimensions
    const labelW = 576;
    const labelH = 384;

    const renderTemplate = () => {
        switch (template) {
            case 'postex': return <CleanVertical data={data} />;
            case 'tcs': return <BrandPriority data={data} />;
            case 'trax': return <FragileHeader data={data} />;
            case 'leopards': return <IconHeader data={data} />;
            case 'minimal': return <QRModern data={data} />;
            default: return <CleanVertical data={data} />;
        }
    };

    const handleShareClick = async () => {
        setIsSharing(true);
        await handleShare();
        setIsSharing(false);
    };

    // Auto-book when entering step 2
    useEffect(() => {
        if (currentStep === 2 && !isBooking && !bookingSuccess) {
            handleBookOrder().then((success: any) => {
                if (success) {
                    setTimeout(() => setCurrentStep(3), 1200);
                }
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentStep]);

    const progress = (currentStep / 3) * 100;

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans text-[#304250] pb-[100px] selection:bg-[#20A46B]/20 selection:text-[#20A46B]">

            <header className="bg-white sticky top-0 z-40 shadow-sm border-b border-[#304250]/10">
                <div className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 w-full">
                        <h1 className="font-extrabold text-[#304250] text-sm sm:text-base flex items-center gap-1.5 flex-1 truncate">
                            {currentStep === 1 && <><Package size={16} className="text-[#20A46B] shrink-0" /> <span className="truncate">Order Details</span></>}
                            {currentStep === 2 && <><Send size={16} className="text-[#20A46B] shrink-0" /> <span className="truncate">Booking Order</span></>}
                            {currentStep === 3 && <><CheckCircle2 size={16} className="text-[#20A46B] shrink-0" /> <span className="truncate">Label & Print</span></>}
                        </h1>

                        <div className="flex items-center gap-2 shrink-0">
                            {currentStep === 3 && (
                                <button onClick={resetForNewOrder} className="flex items-center gap-1 text-[10px] font-bold text-[#304250]/60 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-md active:scale-95 transition-transform">
                                    <RotateCcw size={10} /> New
                                </button>
                            )}
                            <p className="text-[11px] text-[#20A46B] font-black uppercase tracking-widest bg-[#20A46B]/10 px-2 py-1 rounded-md">Step {currentStep} / 3</p>
                        </div>
                    </div>
                </div>
                <div className="w-full h-1 bg-gray-100">
                    <div
                        className="h-full bg-[#20A46B] transition-all duration-500 ease-out rounded-r-full"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </header>

            {/* Content Body */}
            <main className="flex-1 p-4 w-full max-w-[500px] mx-auto">

                {/* ════════ STEP 1: ORDER DETAILS ════════ */}
                {currentStep === 1 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">

                        {/* Quick Import */}
                        <div className="bg-white p-5 rounded-2xl shadow-[0_4px_20px_rgba(48,66,80,0.04)] border border-[#304250]/10">
                            <label className="text-[10px] font-extrabold text-[#304250]/60 uppercase tracking-widest mb-2 block px-1">Quick Import Order</label>
                            <div className="relative flex items-center">
                                <input
                                    value={orderIdToSearch}
                                    onChange={(e: any) => setOrderIdToSearch(e.target.value)}
                                    onKeyDown={(e: any) => e.key === 'Enter' && handleFetchOrder()}
                                    placeholder="Enter Order ID"
                                    className="w-full px-4 py-3.5 pr-14 bg-gray-50 border border-[#304250]/10 rounded-xl outline-none focus:bg-white focus:border-[#20A46B] focus:ring-2 focus:ring-[#20A46B]/20 text-sm font-bold placeholder:font-medium placeholder:text-[#304250]/30 transition-all shadow-sm text-[#304250]"
                                />
                                <button type="button" onClick={handleFetchOrder} className="absolute right-1.5 w-10 h-10 bg-[#EEBE1C]/10 flex items-center justify-center rounded-lg hover:bg-[#EEBE1C]/20 text-[#EEBE1C] transition-colors active:scale-95 border border-[#EEBE1C]/30">
                                    <Search size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Sender Info */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#304250]/10 space-y-4 relative">
                            {businessInfo?.businessName && (
                                <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-[#20A46B]/10 text-[#20A46B] px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider border border-[#20A46B]/20">
                                    <ShieldCheck size={10} /> Auto-filled
                                </div>
                            )}
                            <h3 className="text-sm font-black text-[#304250] flex items-center gap-2 pb-3 border-b border-[#304250]/10">
                                <Building size={16} className="text-[#20A46B]" /> Sender
                            </h3>

                            <label className="cursor-pointer border-2 border-dashed border-[#304250]/20 rounded-xl min-h-[90px] flex flex-col justify-center items-center bg-gray-50 hover:bg-[#20A46B]/5 hover:border-[#20A46B]/30 transition-all relative overflow-hidden group active:scale-95 shadow-sm">
                                <input type="file" accept="image/*" onChange={handleLogoUpload as any} className="hidden" />
                                {data.sellerLogo ? (
                                    <>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={data.sellerLogo} alt="Logo" className="h-[70px] w-auto object-contain p-2 absolute inset-0 m-auto" />
                                        <div className="absolute inset-0 bg-[#304250]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                                            <span className="text-white text-[10px] font-bold flex flex-col items-center gap-1"><Upload size={14} /> Change</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <Upload size={20} className="text-[#304250]/30 mb-1 group-hover:text-[#20A46B] transition-colors" />
                                        <span className="text-[10px] font-extrabold text-[#304250]/50 text-center leading-tight">Upload Store Logo</span>
                                    </>
                                )}
                            </label>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold text-[#304250]/60 uppercase tracking-widest pl-1">Store Name <span className="text-red-500">*</span></label>
                                <input {...register('senderName')} placeholder="Store Name" className={`w-full px-4 py-3.5 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#20A46B]/20 focus:border-[#20A46B] outline-none text-sm font-bold text-[#304250] placeholder:font-medium placeholder:text-[#304250]/40 transition-all shadow-sm ${errors.senderName ? 'border-red-300' : 'border-[#304250]/10'}`} />
                                {errors.senderName && <p className="text-red-500 text-[10px] font-bold pl-1 mt-1">{errors.senderName.message as string}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold text-[#304250]/60 uppercase tracking-widest pl-1">Phone</label>
                                <input {...register('senderPhone')} placeholder="Phone Number" className="w-full px-4 py-3.5 border border-[#304250]/10 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#20A46B]/20 focus:border-[#20A46B] outline-none text-sm font-bold text-[#304250] placeholder:font-medium placeholder:text-[#304250]/40 transition-all shadow-sm" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold text-[#304250]/60 uppercase tracking-widest pl-1">Return Address</label>
                                <textarea {...register('senderAddress')} placeholder="Full return address..." rows={2} className={`w-full border rounded-xl p-4 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#20A46B]/20 focus:border-[#20A46B] outline-none text-sm font-medium text-[#304250] placeholder:text-[#304250]/30 resize-none transition-all shadow-sm custom-scrollbar ${errors.senderAddress ? 'border-red-300' : 'border-[#304250]/10'}`} />
                                {errors.senderAddress && <p className="text-red-500 text-[10px] font-bold pl-1 mt-1">{errors.senderAddress.message as string}</p>}
                            </div>
                        </div>

                        {/* Consignee Info */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#304250]/10 space-y-4">
                            <h3 className="text-sm font-black text-[#304250] flex items-center gap-2 pb-3 border-b border-[#304250]/10">
                                <User size={16} className="text-[#20A46B]" /> Consignee (Receiver)
                            </h3>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold text-[#304250]/60 uppercase tracking-widest pl-1">Full Name *</label>
                                <div className="relative">
                                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#304250]/30" />
                                    <input {...register('receiverName')} placeholder="Customer Full Name" className={`w-full px-4 py-3.5 pl-10 border rounded-xl bg-gray-50 focus:bg-white focus:border-[#20A46B] focus:ring-1 ring-[#20A46B]/20 outline-none text-sm font-bold text-[#304250] placeholder:font-medium placeholder:text-[#304250]/40 transition-all shadow-sm ${errors.receiverName ? 'border-red-300' : 'border-[#304250]/10'}`} />
                                </div>
                                {errors.receiverName && <p className="text-red-500 text-[10px] font-bold pl-1 mt-1">{errors.receiverName.message as string}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold text-[#304250]/60 uppercase tracking-widest pl-1">Phone *</label>
                                <input {...register('receiverPhone')} placeholder="03XXXXXXXXX" className={`w-full px-4 py-3.5 border rounded-xl bg-gray-50 focus:bg-white focus:border-[#20A46B] focus:ring-1 ring-[#20A46B]/20 outline-none text-sm font-bold font-mono text-[#304250] placeholder:font-sans placeholder:font-medium placeholder:text-[#304250]/30 transition-all shadow-sm ${errors.receiverPhone ? 'border-red-300' : 'border-[#304250]/10'}`} />
                                {errors.receiverPhone && <p className="text-red-500 text-[10px] font-bold pl-1 mt-1">{errors.receiverPhone.message as string}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold text-[#304250]/60 uppercase tracking-widest pl-1">Email <span className="font-medium opacity-70 normal-case">(optional)</span></label>
                                <input {...register('receiverEmail')} type="email" placeholder="customer@email.com" className="w-full px-4 py-3.5 text-sm font-bold border border-[#304250]/10 rounded-xl bg-gray-50 focus:bg-white focus:border-[#20A46B] focus:ring-1 ring-[#20A46B]/20 outline-none text-[#304250] placeholder:font-medium placeholder:text-[#304250]/40 transition-all shadow-sm" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold text-[#304250]/60 uppercase tracking-widest pl-1">Delivery Address *</label>
                                <textarea {...register('receiverAddress')} placeholder="House, Street, Area..." rows={2} className={`w-full border rounded-xl p-4 bg-gray-50 focus:bg-white focus:border-[#20A46B] focus:ring-1 ring-[#20A46B]/20 outline-none text-sm font-medium resize-none transition-all shadow-sm text-[#304250] placeholder:text-[#304250]/30 custom-scrollbar ${errors.receiverAddress ? 'border-red-300' : 'border-[#304250]/10'}`} />
                                {errors.receiverAddress && <p className="text-red-500 text-[10px] font-bold pl-1 mt-1">{errors.receiverAddress.message as string}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-extrabold text-[#304250]/60 uppercase tracking-widest pl-1">City *</label>
                                    <input {...register('receiverCity')} placeholder="City" className={`w-full px-4 py-3.5 border rounded-xl bg-gray-50 focus:bg-white focus:border-[#20A46B] focus:ring-1 ring-[#20A46B]/20 outline-none text-sm font-bold transition-all shadow-sm text-[#304250] placeholder:font-medium placeholder:text-[#304250]/40 ${errors.receiverCity ? 'border-red-300' : 'border-[#304250]/10'}`} />
                                    {errors.receiverCity && <p className="text-red-500 text-[10px] font-bold pl-1 mt-1">{errors.receiverCity.message as string}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-extrabold text-[#304250]/60 uppercase tracking-widest pl-1">Province</label>
                                    <div className="relative">
                                        <select {...register('receiverProvince')} className="w-full px-3 py-3.5 border border-[#304250]/10 rounded-xl bg-gray-50 focus:bg-white focus:border-[#20A46B] focus:ring-1 ring-[#20A46B]/20 outline-none text-sm font-bold transition-all appearance-none pr-8 shadow-sm text-[#304250]">
                                            <option value="">Select</option>
                                            {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#304250]/30 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Parcel Details */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#304250]/10 space-y-4">
                            <h3 className="text-sm font-black text-[#304250] flex items-center gap-2 pb-3 border-b border-[#304250]/10">
                                <Truck size={16} className="text-[#20A46B]" /> Parcel Details
                            </h3>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-extrabold text-[#304250]/60 uppercase tracking-widest pl-1">Order Ref *</label>
                                    <input {...register('orderRef')} placeholder="ORD-1234" className={`w-full px-4 py-3.5 border rounded-xl bg-gray-50 focus:bg-white focus:border-[#20A46B] focus:ring-1 ring-[#20A46B]/20 outline-none text-sm font-bold transition-all shadow-sm text-[#304250] placeholder:font-medium placeholder:text-[#304250]/40 ${errors.orderRef ? 'border-red-300' : 'border-[#304250]/10'}`} />
                                    {errors.orderRef && <p className="text-red-500 text-[10px] font-bold pl-1 mt-1">{errors.orderRef.message as string}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-extrabold text-[#304250]/60 uppercase tracking-widest pl-1">Order Date</label>
                                    <input type="date" {...register('orderDate')} className="w-full px-3 py-3.5 border border-[#304250]/10 rounded-xl bg-gray-50 focus:bg-white focus:border-[#20A46B] focus:ring-1 ring-[#20A46B]/20 outline-none text-sm font-bold text-[#304250] transition-all shadow-sm" />
                                </div>
                            </div>

                            {/* Courier */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold text-[#304250]/60 uppercase tracking-widest pl-1">Select Courier *</label>
                                <div className="relative">
                                    {couriers.length > 0 ? (
                                        <select {...register('courier')} className={`w-full px-4 py-3.5 border rounded-xl bg-gray-50 focus:bg-white focus:border-[#20A46B] focus:ring-1 ring-[#20A46B]/20 outline-none text-sm font-bold transition-all appearance-none pr-10 shadow-sm text-[#304250] ${errors.courier ? 'border-red-300' : 'border-[#304250]/10'}`}>
                                            {couriers.map((c: any, i: number) => (
                                                <option key={i} value={c.courierName}>{c.courierName}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input {...register('courier')} placeholder="e.g. TCS, Leopards" className={`w-full px-4 py-3.5 border rounded-xl bg-gray-50 focus:bg-white focus:border-[#20A46B] focus:ring-1 ring-[#20A46B]/20 outline-none text-sm font-bold transition-all shadow-sm text-[#304250] placeholder:font-medium placeholder:text-[#304250]/40 ${errors.courier ? 'border-red-300' : 'border-[#304250]/10'}`} />
                                    )}
                                    {couriers.length > 0 && <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#304250]/30 pointer-events-none" />}
                                    {errors.courier && <p className="text-red-500 text-[10px] font-bold pl-1 mt-1">{errors.courier.message as string}</p>}
                                </div>
                                {couriers.length === 0 && (
                                    <p className="text-[#EEBE1C] text-[10px] font-extrabold uppercase tracking-widest mt-1.5 flex items-center gap-1 bg-[#EEBE1C]/10 px-2 py-1 rounded-md w-fit">
                                        <Info size={12} /> Add in Settings
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-extrabold text-[#304250]/60 uppercase tracking-widest pl-1">Weight</label>
                                    <input {...register('weight')} placeholder="0.5kg" className="w-full px-2 py-3.5 border border-[#304250]/10 rounded-xl bg-gray-50 text-center focus:bg-white focus:border-[#20A46B] focus:ring-1 ring-[#20A46B]/20 outline-none text-sm font-bold transition-all shadow-sm text-[#304250] placeholder:font-medium placeholder:text-[#304250]/30" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-extrabold text-[#304250]/60 uppercase tracking-widest pl-1">Pieces</label>
                                    <input {...register('pieces')} placeholder="1" className="w-full px-2 py-3.5 border border-[#304250]/10 rounded-xl bg-gray-50 text-center focus:bg-white focus:border-[#20A46B] focus:ring-1 ring-[#20A46B]/20 outline-none text-sm font-bold transition-all shadow-sm text-[#304250] placeholder:font-medium placeholder:text-[#304250]/30" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-extrabold text-[#304250]/60 uppercase tracking-widest pl-1">Contents</label>
                                    <input {...register('contents')} placeholder="Item" className="w-full px-2 py-3.5 border border-[#304250]/10 rounded-xl bg-gray-50 text-center focus:bg-white focus:border-[#20A46B] focus:ring-1 ring-[#20A46B]/20 outline-none text-sm font-bold transition-all shadow-sm text-[#304250] placeholder:font-medium placeholder:text-[#304250]/30" />
                                </div>
                            </div>
                        </div>

                        {/* Financials & Instructions */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#304250]/10 space-y-4">
                            <h3 className="text-sm font-black text-[#304250] flex items-center gap-2 pb-3 border-b border-[#304250]/10">
                                <Banknote size={16} className="text-[#20A46B]" /> Payment & Services
                            </h3>

                            <div>
                                <label className="text-[10px] font-extrabold text-[#304250]/60 uppercase tracking-widest mb-2 block pl-1">Payment Method</label>
                                <div className="flex gap-3 bg-gray-50 p-2 rounded-xl border border-[#304250]/5">
                                    <label className={`flex items-center justify-center gap-2 cursor-pointer flex-1 py-3 rounded-lg border transition-all shadow-sm ${watch('paymentType') === 'COD' ? 'bg-white border-[#20A46B] text-[#20A46B] ring-1 ring-[#20A46B]/10' : 'border-transparent text-[#304250]/50 hover:bg-white'}`}>
                                        <input type="radio" value="COD" {...register('paymentType')} className="hidden" />
                                        <span className="text-xs font-extrabold tracking-wide">COD</span>
                                    </label>
                                    <label className={`flex items-center justify-center gap-2 cursor-pointer flex-1 py-3 rounded-lg border transition-all shadow-sm ${watch('paymentType') === 'Prepaid' ? 'bg-white border-[#20A46B] text-[#20A46B] ring-1 ring-[#20A46B]/10' : 'border-transparent text-[#304250]/50 hover:bg-white'}`}>
                                        <input type="radio" value="Prepaid" {...register('paymentType')} className="hidden" />
                                        <span className="text-xs font-extrabold tracking-wide">Prepaid</span>
                                    </label>
                                </div>
                            </div>

                            {watch('paymentType') === 'COD' && (
                                <div className="space-y-1.5 animate-in fade-in zoom-in-95 duration-200">
                                    <label className="text-[10px] font-extrabold text-[#20A46B] uppercase tracking-widest pl-1">COD Amount (PKR) *</label>
                                    <input type="number" {...register('codAmount', { valueAsNumber: true })} placeholder="0" className="w-full px-4 py-4 border-2 border-[#20A46B]/30 rounded-xl bg-[#20A46B]/5 focus:bg-white focus:border-[#20A46B] outline-none text-[#20A46B] text-base font-black transition-all placeholder:text-[#20A46B]/30 shadow-inner" />
                                </div>
                            )}

                            <div className="pt-2 border-t border-[#304250]/5">
                                <label className="text-[10px] font-extrabold text-[#304250]/60 uppercase tracking-widest mb-3 block pl-1">Special Handling</label>
                                <div className="grid grid-cols-2 gap-2.5">
                                    {[
                                        { key: 'fragile', label: 'Fragile' },
                                        { key: 'dontOpen', label: "Don't Open" },
                                        { key: 'callFirst', label: 'Call First' },
                                        { key: 'insurance', label: 'Insurance' },
                                    ].map(({ key, label }) => {
                                        const isChecked = data.instructions[key as keyof typeof data.instructions];
                                        return (
                                            <label key={key} className={`flex items-center justify-between p-3 border-2 rounded-xl cursor-pointer transition-all active:scale-95 shadow-sm ${isChecked ? 'border-[#20A46B] bg-[#20A46B]/5' : 'border-[#304250]/5 bg-gray-50 hover:bg-white hover:border-[#304250]/10'}`}>
                                                <span className={`text-[11px] font-extrabold truncate mr-2 uppercase tracking-wide ${isChecked ? 'text-[#20A46B]' : 'text-[#304250]/50'}`}>{label}</span>
                                                <input type="checkbox" checked={isChecked} onChange={(e: any) => setInstructions(key as any, e.target.checked)} className="accent-[#20A46B] w-3.5 h-3.5 flex-shrink-0" />
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-extrabold text-[#304250]/60 uppercase tracking-widest mb-1.5 block pl-1">Special Instructions <span className="font-medium opacity-70 normal-case">(optional)</span></label>
                                <textarea {...register('specialInstructions')} rows={2} placeholder="Any special delivery instructions..." className="w-full p-4 text-sm font-medium border border-[#304250]/10 rounded-xl outline-none focus:bg-white focus:border-[#20A46B] focus:ring-2 focus:ring-[#20A46B]/20 bg-gray-50 transition-all resize-none shadow-sm text-[#304250] placeholder:text-[#304250]/30 custom-scrollbar" />
                            </div>
                        </div>
                    </div>
                )}

                {/* ════════ STEP 2: BOOKING IN PROGRESS ════════ */}
                {currentStep === 2 && (
                    <div className="flex items-center justify-center min-h-[60vh] py-6 animate-in fade-in duration-300">
                        <div className="w-full bg-white p-10 rounded-[32px] shadow-[0_8px_30px_rgba(48,66,80,0.04)] border border-[#304250]/10 text-center flex flex-col items-center">
                            {!bookingSuccess ? (
                                <>
                                    <div className="w-24 h-24 bg-[#20A46B]/5 rounded-full flex items-center justify-center mb-6 border-[3px] border-[#20A46B]/20">
                                        <Loader2 size={40} className="animate-spin text-[#20A46B]" />
                                    </div>
                                    <h2 className="text-2xl font-black text-[#304250] mb-2 tracking-tight">Booking Order...</h2>
                                    <p className="text-[#304250]/60 font-medium mb-2 max-w-xs">
                                        Booking with <span className="font-extrabold text-[#20A46B] bg-[#20A46B]/10 px-2 py-0.5 rounded-md">{data.courier}</span>
                                    </p>
                                    <p className="text-xs text-[#304250]/40 font-bold uppercase tracking-wider mt-4">Generating CN & Barcode</p>
                                </>
                            ) : (
                                <div className="animate-in zoom-in-95 duration-500 w-full flex flex-col items-center">
                                    <div className="w-24 h-24 bg-[#20A46B]/10 rounded-full flex items-center justify-center text-[#20A46B] mb-6 shadow-inner border border-[#20A46B]/20">
                                        <CheckCircle2 size={48} strokeWidth={2.5} />
                                    </div>
                                    <h2 className="text-2xl font-black text-[#304250] mb-1 tracking-tight">Order Booked!</h2>
                                    <p className="text-[#304250]/60 font-medium mb-8">Tracking number and routing code generated.</p>

                                    <div className="bg-gray-50 border border-[#304250]/10 rounded-2xl p-6 w-full relative overflow-hidden shadow-inner">
                                        <div className="absolute top-0 left-0 w-2 h-full bg-[#20A46B]" />
                                        <div className="flex flex-col gap-4 mb-5 text-left pl-3">
                                            <div>
                                                <span className="text-[10px] font-extrabold text-[#304250]/50 uppercase tracking-widest block mb-1">Tracking Number</span>
                                                <h1 className="text-2xl sm:text-3xl font-black font-mono text-[#304250] tracking-wider">{data.trackingNumber}</h1>
                                            </div>
                                            {data.routingCode && (
                                                <div>
                                                    <span className="text-[10px] font-extrabold text-[#304250]/50 uppercase tracking-widest block mb-1">Routing</span>
                                                    <span className="text-xl font-black text-[#20A46B] font-mono bg-[#20A46B]/10 px-3 py-1 rounded-lg">{data.routingCode}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="bg-white p-4 rounded-xl border border-[#304250]/10 flex justify-center h-[80px] shadow-sm">
                                            <SafeBarcode value={data.barcodeValue || data.trackingNumber} width={1.8} height={50} displayValue={false} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ════════ STEP 3: LABEL PREVIEW (WITH COMPACT TEMPLATE SELECTOR) ════════ */}
                {currentStep === 3 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300 pb-[10px]">

                        {/* 👇 FIX 2: ADDED TEMPLATE SELECTOR (COMPACT GRID) 👇 */}
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#304250]/10">
                            <label className="text-[10px] font-extrabold text-[#304250]/60 uppercase tracking-widest mb-3 block px-1">Select Label Layout</label>

                            <div className="flex overflow-x-auto gap-2 pb-1 no-scrollbar">
                                {TEMPLATE_OPTIONS.map((t) => {
                                    const isActive = template === t.id;
                                    const Icon = t.icon;
                                    return (
                                        <button
                                            key={t.id}
                                            onClick={() => setTemplate(t.id)}
                                            className={`shrink-0 flex items-center gap-2 px-4 py-3 rounded-xl transition-all text-xs font-extrabold border-2 outline-none shadow-sm active:scale-95
                                                ${isActive ? 'bg-white text-[#20A46B] border-[#20A46B] shadow-[0_4px_14px_rgba(32,164,107,0.1)]' : 'bg-gray-50 text-[#304250]/60 border-transparent hover:border-[#304250]/10 hover:bg-white'}`}
                                        >
                                            <Icon size={16} className={isActive ? "text-[#20A46B]" : "text-[#304250]/40"} />
                                            <span>{t.label}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* 100% Correct Responsive Label Preview */}
                        <div className="w-full flex justify-center items-center bg-gray-200/50 rounded-[32px] p-4 sm:p-6 border border-[#304250]/10 shadow-inner overflow-hidden relative" style={{ height: '300px' }}>
                            <div className="relative flex justify-center items-center w-full h-full">
                                <div
                                    className="absolute"
                                    style={{
                                        // Specific scale for mobile to fit the 576px wide canvas nicely
                                        transform: 'scale(0.5)',
                                        transformOrigin: 'center center',
                                    }}
                                >
                                    <div className="shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-[#304250]/10 overflow-hidden rounded-md bg-white">
                                        <div
                                            ref={componentRef}
                                            className="print-area bg-white relative shrink-0 m-0 p-0 box-border"
                                            style={{ width: `${labelW}px`, height: `${labelH}px` }}
                                        >
                                            {renderTemplate()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* ─── Bottom Navigation Bar ─── */}
            <div className="fixed bottom-4 left-4 right-4 bg-white/95 backdrop-blur-xl border border-[#304250]/10 p-3 flex items-center justify-between gap-3 z-50 shadow-[0_8px_30px_rgba(48,66,80,0.15)] rounded-2xl">

                {currentStep > 1 && currentStep !== 2 && (
                    <button
                        onClick={() => currentStep === 3 ? setCurrentStep(1) : setCurrentStep(currentStep - 1)}
                        className="w-14 h-14 shrink-0 flex items-center justify-center text-[#304250]/60 bg-gray-100 border border-[#304250]/5 hover:bg-gray-200 hover:text-[#304250] rounded-xl active:scale-95 transition-all shadow-sm"
                    >
                        <ChevronLeft size={22} />
                    </button>
                )}

                {currentStep === 1 && (
                    <button
                        onClick={validateAndProceed}
                        className="flex-1 h-14 flex items-center justify-center gap-2 font-extrabold text-sm text-white bg-[#20A46B] hover:bg-[#20A46B]/90 rounded-xl shadow-[0_4px_14px_rgba(32,164,107,0.3)] active:scale-[0.98] transition-all"
                    >
                        Book Order <ChevronRight size={18} />
                    </button>
                )}

                {currentStep === 2 && (
                    <div className="flex-1 h-14 flex items-center justify-center gap-2 font-extrabold text-sm text-[#304250]/50 bg-gray-100 rounded-xl border border-[#304250]/5 shadow-inner">
                        <Loader2 size={18} className="animate-spin text-[#20A46B]" /> Processing...
                    </div>
                )}

                {currentStep === 3 && (
                    <>
                        <button
                            onClick={handleShareClick}
                            disabled={isSharing}
                            title="Share Label"
                            className="w-14 h-14 shrink-0 flex items-center justify-center text-[#304250] bg-[#EEBE1C] hover:bg-[#d9ab18] rounded-xl shadow-[0_4px_14px_rgba(238,190,28,0.3)] active:scale-95 transition-all disabled:opacity-50"
                        >
                            {isSharing ? <Loader2 size={20} className="animate-spin text-[#304250]" /> : <Share2 size={20} />}
                        </button>
                        <button
                            onClick={handleDownloadPDF}
                            disabled={isDownloading}
                            title="Download PDF"
                            className="w-14 h-14 shrink-0 flex items-center justify-center text-white bg-[#20A46B] hover:bg-[#20A46B]/90 rounded-xl shadow-[0_4px_14px_rgba(32,164,107,0.3)] active:scale-95 transition-all disabled:opacity-70"
                        >
                            {isDownloading && downloadFormat === 'pdf' ? <Loader2 size={20} className="animate-spin text-white" /> : <Download size={20} />}
                        </button>
                        <button
                            onClick={handlePrint}
                            className="flex-1 h-14 flex items-center justify-center gap-2 font-extrabold text-sm text-white bg-[#304250] hover:bg-[#304250]/90 rounded-xl shadow-[0_4px_14px_rgba(48,66,80,0.3)] active:scale-[0.98] transition-all"
                        >
                            <Printer size={18} /> Print Label
                        </button>
                    </>
                )}
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #30425020; border-radius: 10px; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                @media print {
                    body * { visibility: hidden !important; }
                    .print-area, .print-area * { visibility: visible !important; }
                    .print-area { position: absolute; left: 0; top: 0; }
                    @page { size: 6in 4in; margin: 0; }
                }
            `}</style>
        </div>
    );
}