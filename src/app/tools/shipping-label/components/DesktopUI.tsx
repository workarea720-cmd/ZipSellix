import React, { useState, useEffect } from 'react';
import { ShippingLabelLogicReturn } from '../useShippingLabelLogic';
import {
    User, Upload, Download, Loader2, Search,
    Receipt, ClipboardList, LayoutDashboard, Package, Scan,
    Share2, Send, CheckCircle2, ArrowRight, Check,
    Building, Truck, Banknote, Printer, ChevronDown, RotateCcw, Info, ShieldCheck
} from 'lucide-react';
import {
    CleanVertical, BrandPriority, FragileHeader,
    IconHeader, QRModern
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

export default function DesktopUI({ logic }: { logic: ShippingLabelLogicReturn }) {
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

    useEffect(() => {
        if (currentStep === 2 && !isBooking && !bookingSuccess) {
            handleBookOrder().then((success) => {
                if (success) {
                    setTimeout(() => setCurrentStep(3), 1200);
                }
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentStep]);

    const stepLabels = ['Order Details', 'Book Order', 'Label & Print'];

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans text-[#304250] selection:bg-[#20A46B]/20 selection:text-[#20A46B]">

            {/* STEP 1 */}
            {currentStep === 1 && (
                <div className="p-6 lg:p-10 animate-in fade-in duration-300">

                    {/* Stepper */}
                    <div className="max-w-4xl mx-auto mb-8 bg-white p-3 rounded-2xl shadow-sm border border-[#304250]/10 flex items-center justify-between px-5 lg:px-8">
                        {stepLabels.map((label, idx) => {
                            const stepNum = idx + 1;
                            const isActive = currentStep >= stepNum;
                            const isCompleted = currentStep > stepNum;
                            return (
                                <React.Fragment key={label}>
                                    {idx > 0 && (
                                        <div className="flex-1 h-1 mx-3 rounded-full relative bg-gray-100 overflow-hidden">
                                            <div className="absolute left-0 top-0 h-full bg-[#20A46B] transition-all duration-500" style={{ width: isActive ? '100%' : '0%' }} />
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2.5 z-10 bg-white cursor-default">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${isActive ? 'bg-[#20A46B] text-white shadow-[0_4px_14px_rgba(32,164,107,0.3)]' : 'bg-gray-100 text-[#304250]/40 border-2 border-transparent'}`}>
                                            {isCompleted ? <Check size={16} strokeWidth={3} /> : stepNum}
                                        </div>
                                        <span className={`font-black text-xs uppercase tracking-wide hidden md:block transition-colors ${isActive ? 'text-[#304250]' : 'text-[#304250]/40'}`}>
                                            {label}
                                        </span>
                                    </div>
                                </React.Fragment>
                            );
                        })}
                    </div>

                    <div className="max-w-5xl mx-auto">

                        {/* Quick Import */}
                        <div className="bg-white border border-[#EEBE1C]/30 rounded-2xl p-5 mb-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                            <div>
                                <h2 className="text-base font-black text-[#304250] flex items-center gap-2">
                                    <Search className="text-[#EEBE1C]" size={18} /> Quick Import
                                </h2>
                                <p className="text-xs text-[#304250]/60 mt-0.5 font-medium">Import existing order details to save time.</p>
                            </div>
                            <div className="flex items-center bg-gray-50 p-1.5 rounded-xl border border-[#304250]/10 w-full md:w-96 shadow-inner focus-within:border-[#EEBE1C] focus-within:ring-1 ring-[#EEBE1C]/30 transition-all focus-within:bg-white">
                                <input
                                    value={orderIdToSearch}
                                    onChange={(e) => setOrderIdToSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleFetchOrder()}
                                    placeholder="Enter Order ID (e.g. ORD-1234)"
                                    className="flex-1 bg-transparent px-4 py-2 text-sm font-bold outline-none placeholder:font-medium placeholder:text-[#304250]/40 text-[#304250]"
                                />
                                <button type="button" onClick={handleFetchOrder} className="bg-[#EEBE1C] hover:bg-[#d9ab18] text-[#304250] px-5 py-2.5 rounded-lg transition-colors shadow-[0_4px_14px_rgba(238,190,28,0.3)] font-extrabold text-sm flex items-center gap-2 active:scale-95">
                                    Import
                                </button>
                            </div>
                        </div>

                        <form className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* LEFT COLUMN */}
                            <div className="space-y-6">

                                {/* Sender Info */}
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#304250]/10 relative">
                                    {businessInfo?.businessName && (
                                        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-[#20A46B]/10 text-[#20A46B] px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border border-[#20A46B]/20">
                                            <ShieldCheck size={12} /> Auto-filled
                                        </div>
                                    )}
                                    <h3 className="text-base font-black text-[#304250] mb-5 flex items-center gap-2 border-b border-[#304250]/10 pb-3">
                                        <Building size={18} className="text-[#20A46B]" /> Sender Information
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-4">
                                            <label className="cursor-pointer border-2 border-dashed border-[#304250]/20 rounded-xl w-24 h-24 flex flex-col justify-center items-center hover:border-[#20A46B] hover:bg-[#20A46B]/5 transition-colors shrink-0 relative overflow-hidden group bg-gray-50 shadow-sm active:scale-95">
                                                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                                                {data.sellerLogo ? (
                                                    <>
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img src={data.sellerLogo} alt="Logo" className="h-[80%] w-auto object-contain absolute" />
                                                        <div className="absolute inset-0 bg-[#304250]/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[1px]">
                                                            <span className="text-white text-[10px] font-bold flex flex-col items-center gap-1"><Upload size={14} /> Change</span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload size={20} className="text-[#304250]/30 mb-1 group-hover:text-[#20A46B] transition-colors" />
                                                        <span className="text-[10px] font-extrabold text-[#304250]/50 text-center leading-tight">Store<br />Logo</span>
                                                    </>
                                                )}
                                            </label>
                                            <div className="flex-1 space-y-4">
                                                <div>
                                                    <label className="text-[11px] font-extrabold text-[#304250]/60 uppercase tracking-wider mb-1.5 block">Store Name <span className="text-red-500">*</span></label>
                                                    <input {...register('senderName')} placeholder="Store / Business Name" className={`w-full p-3.5 text-sm font-bold border rounded-xl outline-none focus:border-[#20A46B] focus:ring-1 ring-[#20A46B]/20 bg-gray-50 focus:bg-white transition-colors text-[#304250] placeholder:font-medium placeholder:text-[#304250]/40 shadow-sm ${errors.senderName ? 'border-red-300 bg-red-50/30' : 'border-[#304250]/10'}`} />
                                                    {errors.senderName && <p className="text-red-500 text-[10px] mt-1 font-bold pl-1">{errors.senderName.message as string}</p>}
                                                </div>
                                                <div>
                                                    <label className="text-[11px] font-extrabold text-[#304250]/60 uppercase tracking-wider mb-1.5 block">Phone</label>
                                                    <input {...register('senderPhone')} placeholder="Phone Number" className="w-full p-3.5 text-sm font-bold border border-[#304250]/10 rounded-xl outline-none focus:border-[#20A46B] focus:ring-1 ring-[#20A46B]/20 bg-gray-50 focus:bg-white transition-colors text-[#304250] placeholder:font-medium placeholder:text-[#304250]/40 shadow-sm" />
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-extrabold text-[#304250]/60 uppercase tracking-wider mb-1.5 block">Pickup / Return Address</label>
                                            <textarea {...register('senderAddress')} rows={2} placeholder="Complete return address..." className={`w-full p-4 text-sm font-medium border rounded-xl outline-none focus:border-[#20A46B] focus:ring-1 ring-[#20A46B]/20 bg-gray-50 focus:bg-white transition-colors resize-none custom-scrollbar text-[#304250] placeholder:text-[#304250]/40 shadow-sm ${errors.senderAddress ? 'border-red-300 bg-red-50/30' : 'border-[#304250]/10'}`} />
                                            {errors.senderAddress && <p className="text-red-500 text-[10px] mt-1 font-bold pl-1">{errors.senderAddress.message as string}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Consignee Details */}
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#304250]/10">
                                    <h3 className="text-base font-black text-[#304250] mb-5 flex items-center gap-2 border-b border-[#304250]/10 pb-3">
                                        <User size={18} className="text-[#20A46B]" /> Consignee (Receiver) Details
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[11px] font-extrabold text-[#304250]/60 uppercase tracking-wider mb-1.5 block">Full Name *</label>
                                                <div className="relative">
                                                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#304250]/30" />
                                                    <input {...register('receiverName')} placeholder="Customer Full Name" className={`w-full p-3.5 pl-10 border rounded-xl bg-gray-50 focus:bg-white focus:border-[#20A46B] focus:ring-1 ring-[#20A46B]/20 outline-none text-sm font-bold text-[#304250] transition-colors shadow-sm placeholder:font-medium placeholder:text-[#304250]/40 ${errors.receiverName ? 'border-red-300 bg-red-50/30' : 'border-[#304250]/10'}`} />
                                                </div>
                                                {errors.receiverName && <p className="text-red-500 text-[10px] mt-1 font-bold pl-1">{errors.receiverName.message as string}</p>}
                                            </div>
                                            <div>
                                                <label className="text-[11px] font-extrabold text-[#304250]/60 uppercase tracking-widest mb-1.5 block">Phone *</label>
                                                <input {...register('receiverPhone')} placeholder="03XXXXXXXXX" className={`w-full p-3.5 border rounded-xl bg-gray-50 focus:bg-white focus:border-[#20A46B] focus:ring-1 ring-[#20A46B]/20 outline-none text-sm font-bold text-[#304250] transition-colors shadow-sm placeholder:font-medium placeholder:text-[#304250]/40 ${errors.receiverPhone ? 'border-red-300 bg-red-50/30' : 'border-[#304250]/10'}`} />
                                                {errors.receiverPhone && <p className="text-red-500 text-[10px] mt-1 font-bold pl-1">{errors.receiverPhone.message as string}</p>}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-extrabold text-[#304250]/60 uppercase tracking-widest mb-1.5 block">Email <span className="font-medium opacity-70">(optional)</span></label>
                                            <input {...register('receiverEmail')} type="email" placeholder="customer@email.com" className="w-full p-3.5 text-sm font-bold border border-[#304250]/10 rounded-xl outline-none focus:border-[#20A46B] focus:ring-1 ring-[#20A46B]/20 bg-gray-50 focus:bg-white transition-colors shadow-sm text-[#304250] placeholder:font-medium placeholder:text-[#304250]/40" />
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-extrabold text-[#304250]/60 uppercase tracking-widest mb-1.5 block">Delivery Address *</label>
                                            <textarea {...register('receiverAddress')} rows={2} placeholder="House #, Street, Area..." className={`w-full p-4 text-sm font-medium border rounded-xl outline-none focus:border-[#20A46B] focus:ring-1 ring-[#20A46B]/20 bg-gray-50 focus:bg-white transition-colors resize-none shadow-sm text-[#304250] placeholder:text-[#304250]/40 custom-scrollbar ${errors.receiverAddress ? 'border-red-300 bg-red-50/30' : 'border-[#304250]/10'}`} />
                                            {errors.receiverAddress && <p className="text-red-500 text-[10px] mt-1 font-bold pl-1">{errors.receiverAddress.message as string}</p>}
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[11px] font-extrabold text-[#304250]/60 uppercase tracking-widest mb-1.5 block">City *</label>
                                                <input {...register('receiverCity')} placeholder="Destination City" className={`w-full p-3.5 text-sm font-bold border rounded-xl outline-none focus:border-[#20A46B] focus:ring-1 ring-[#20A46B]/20 bg-gray-50 focus:bg-white transition-colors shadow-sm text-[#304250] placeholder:font-medium placeholder:text-[#304250]/40 ${errors.receiverCity ? 'border-red-300 bg-red-50/30' : 'border-[#304250]/10'}`} />
                                                {errors.receiverCity && <p className="text-red-500 text-[10px] mt-1 font-bold pl-1">{errors.receiverCity.message as string}</p>}
                                            </div>
                                            {/* ✅ FIXED: Province * — mandatory, red border on error, error message */}
                                            <div>
                                                <label className="text-[11px] font-extrabold text-[#304250]/60 uppercase tracking-widest mb-1.5 block">Province *</label>
                                                <div className="relative">
                                                    <select
                                                        {...register('receiverProvince')}
                                                        className={`w-full p-3.5 text-sm font-bold border rounded-xl outline-none focus:border-[#20A46B] focus:ring-1 ring-[#20A46B]/20 bg-gray-50 focus:bg-white transition-colors appearance-none pr-10 shadow-sm text-[#304250] ${errors.receiverProvince ? 'border-red-300 bg-red-50/30' : 'border-[#304250]/10'}`}
                                                    >
                                                        <option value="">Select Province</option>
                                                        {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                                                    </select>
                                                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#304250]/40 pointer-events-none" />
                                                </div>
                                                {errors.receiverProvince && <p className="text-red-500 text-[10px] mt-1 font-bold pl-1">{errors.receiverProvince.message as string}</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT COLUMN */}
                            <div className="space-y-6">

                                {/* Parcel Details */}
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#304250]/10">
                                    <h3 className="text-base font-black text-[#304250] mb-5 flex items-center gap-2 border-b border-[#304250]/10 pb-3">
                                        <Truck size={18} className="text-[#20A46B]" /> Parcel Details
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[11px] font-extrabold text-[#304250]/60 uppercase tracking-widest mb-1.5 block">Order Ref / ID *</label>
                                                <input {...register('orderRef')} placeholder="ORD-1234" className={`w-full p-3.5 text-sm font-bold border rounded-xl outline-none focus:border-[#20A46B] focus:ring-1 ring-[#20A46B]/20 bg-gray-50 focus:bg-white transition-colors shadow-sm text-[#304250] placeholder:font-medium placeholder:text-[#304250]/40 ${errors.orderRef ? 'border-red-300 bg-red-50/30' : 'border-[#304250]/10'}`} />
                                                {errors.orderRef && <p className="text-red-500 text-[10px] mt-1 font-bold pl-1">{errors.orderRef.message as string}</p>}
                                            </div>
                                            <div>
                                                <label className="text-[11px] font-extrabold text-[#304250]/60 uppercase tracking-widest mb-1.5 block">Order Date</label>
                                                <input {...register('orderDate')} type="date" className="w-full p-3.5 text-sm font-bold border border-[#304250]/10 rounded-xl outline-none focus:border-[#20A46B] focus:ring-1 ring-[#20A46B]/20 bg-gray-50 focus:bg-white transition-colors text-[#304250] shadow-sm" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[11px] font-extrabold text-[#304250]/60 uppercase tracking-widest mb-1.5 block">Select Courier *</label>
                                            <div className="relative">
                                                {couriers.length > 0 ? (
                                                    <>
                                                        <select {...register('courier')} className={`w-full p-3.5 text-sm font-bold border rounded-xl outline-none focus:border-[#20A46B] focus:ring-1 ring-[#20A46B]/20 bg-gray-50 focus:bg-white transition-colors appearance-none pr-10 shadow-sm text-[#304250] ${errors.courier ? 'border-red-300 bg-red-50/30' : 'border-[#304250]/10'}`}>
                                                            <option value="">Select Courier Network</option>
                                                            {couriers.map((c, i) => (
                                                                <option key={i} value={c.courierName}>{c.courierName}</option>
                                                            ))}
                                                        </select>
                                                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#304250]/40 pointer-events-none" />
                                                    </>
                                                ) : (
                                                    <input {...register('courier')} placeholder="e.g. TCS, Leopards, PostEx" className={`w-full p-3.5 text-sm font-bold border rounded-xl outline-none focus:border-[#20A46B] focus:ring-1 ring-[#20A46B]/20 bg-gray-50 focus:bg-white transition-colors shadow-sm text-[#304250] placeholder:font-medium placeholder:text-[#304250]/40 ${errors.courier ? 'border-red-300 bg-red-50/30' : 'border-[#304250]/10'}`} />
                                                )}
                                                {errors.courier && <p className="text-red-500 text-[10px] mt-1 font-bold pl-1">{errors.courier.message as string}</p>}
                                            </div>
                                            {couriers.length === 0 && (
                                                <p className="text-[#EEBE1C] text-[10px] mt-1.5 font-bold flex items-center gap-1 bg-[#EEBE1C]/10 px-2 py-1 rounded-md w-fit">
                                                    <Info size={12} /> Add couriers in Settings to see dropdown
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <label className="text-[11px] font-extrabold text-[#304250]/60 uppercase tracking-widest mb-1.5 block">Weight (kg) *</label>
                                                <input {...register('weight')} placeholder="0.5" className={`w-full p-3.5 text-sm font-bold border rounded-xl outline-none focus:border-[#20A46B] focus:ring-1 ring-[#20A46B]/20 bg-gray-50 focus:bg-white transition-colors text-[#304250] text-center shadow-sm placeholder:font-medium placeholder:text-[#304250]/40 ${errors.weight ? 'border-red-300 bg-red-50/30' : 'border-[#304250]/10'}`} />
                                            </div>
                                            <div>
                                                <label className="text-[11px] font-extrabold text-[#304250]/60 uppercase tracking-widest mb-1.5 block">Pieces *</label>
                                                <input {...register('pieces')} placeholder="1" className={`w-full p-3.5 text-sm font-bold border rounded-xl outline-none focus:border-[#20A46B] focus:ring-1 ring-[#20A46B]/20 bg-gray-50 focus:bg-white transition-colors text-[#304250] text-center shadow-sm placeholder:font-medium placeholder:text-[#304250]/40 ${errors.pieces ? 'border-red-300 bg-red-50/30' : 'border-[#304250]/10'}`} />
                                            </div>
                                            <div>
                                                <label className="text-[11px] font-extrabold text-[#304250]/60 uppercase tracking-widest mb-1.5 block">Contents</label>
                                                <input {...register('contents')} placeholder="Apparel" className="w-full p-3.5 text-sm font-bold border border-[#304250]/10 rounded-xl outline-none focus:border-[#20A46B] focus:ring-1 ring-[#20A46B]/20 bg-gray-50 focus:bg-white transition-colors text-[#304250] text-center shadow-sm placeholder:font-medium placeholder:text-[#304250]/40" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Financials & Services */}
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#304250]/10">
                                    <h3 className="text-base font-black text-[#304250] mb-5 flex items-center gap-2 border-b border-[#304250]/10 pb-3">
                                        <Banknote size={18} className="text-[#20A46B]" /> Financials & Services
                                    </h3>
                                    <div className="space-y-5">
                                        <div>
                                            <label className="text-[10px] font-extrabold text-[#304250]/60 uppercase tracking-widest mb-2 block">Payment Method</label>
                                            <div className="flex gap-4 p-1.5 bg-gray-50 rounded-xl border border-[#304250]/5">
                                                <label className={`flex-1 flex items-center justify-center gap-2 cursor-pointer py-2.5 rounded-lg transition-colors ${watch('paymentType') === 'COD' ? 'bg-white border border-[#20A46B] text-[#20A46B] shadow-sm ring-1 ring-[#20A46B]/10' : 'border border-transparent text-[#304250]/50 hover:bg-white'}`}>
                                                    <input type="radio" value="COD" {...register('paymentType')} className="hidden" />
                                                    <span className="text-sm font-bold">Cash on Delivery</span>
                                                </label>
                                                <label className={`flex-1 flex items-center justify-center gap-2 cursor-pointer py-2.5 rounded-lg transition-colors ${watch('paymentType') === 'Prepaid' ? 'bg-white border border-[#20A46B] text-[#20A46B] shadow-sm ring-1 ring-[#20A46B]/10' : 'border border-transparent text-[#304250]/50 hover:bg-white'}`}>
                                                    <input type="radio" value="Prepaid" {...register('paymentType')} className="hidden" />
                                                    <span className="text-sm font-bold">Prepaid</span>
                                                </label>
                                            </div>
                                        </div>

                                        {watch('paymentType') === 'COD' && (
                                            <div className="animate-in fade-in slide-in-from-top-2 space-y-1.5 pt-2">
                                                <label className="text-[10px] font-extrabold text-[#20A46B] uppercase tracking-widest pl-1">Amount to Collect (PKR) *</label>
                                                <input type="number" {...register('codAmount', { valueAsNumber: true })} placeholder="0" className="w-full p-4 text-lg border-2 border-[#20A46B]/30 bg-[#20A46B]/5 rounded-xl font-black outline-none focus:border-[#20A46B] focus:bg-white transition-colors text-[#20A46B] placeholder:text-[#20A46B]/30 shadow-inner" />
                                            </div>
                                        )}

                                        <div className="pt-2 border-t border-[#304250]/5">
                                            <label className="text-[10px] font-extrabold text-[#304250]/60 uppercase tracking-widest pl-1 mb-3 block">Special Handling</label>
                                            <div className="flex flex-wrap gap-2.5">
                                                {[
                                                    { key: 'fragile', label: 'Fragile' },
                                                    { key: 'dontOpen', label: "Don't Open" },
                                                    { key: 'callFirst', label: 'Call First' },
                                                    { key: 'insurance', label: 'Insurance' },
                                                    { key: 'signature', label: 'Signature' },
                                                ].map(({ key, label }) => {
                                                    const isChecked = data.instructions[key as keyof typeof data.instructions];
                                                    return (
                                                        <label key={key} className={`flex items-center justify-center px-4 py-2.5 border-2 rounded-xl cursor-pointer transition-all active:scale-95 shadow-sm ${isChecked ? 'border-[#20A46B] bg-[#20A46B]/5' : 'border-[#304250]/10 bg-white hover:border-[#304250]/30 hover:bg-gray-50'}`}>
                                                            <span className={`text-[11px] font-extrabold mr-2 uppercase tracking-wide ${isChecked ? 'text-[#20A46B]' : 'text-[#304250]/50'}`}>{label}</span>
                                                            <input type="checkbox" checked={isChecked} onChange={(e) => setInstructions(key as any, e.target.checked)} className="accent-[#20A46B] w-3.5 h-3.5" />
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="space-y-1.5 pt-2">
                                            <label className="text-[10px] font-extrabold text-[#304250]/60 uppercase tracking-widest pl-1">Special Instructions <span className="font-medium opacity-70">(optional)</span></label>
                                            <textarea {...register('specialInstructions')} rows={2} placeholder="Any special delivery instructions..." className="w-full p-4 text-sm font-medium border border-[#304250]/10 rounded-xl outline-none focus:ring-2 ring-[#20A46B]/20 focus:border-[#20A46B] bg-gray-50 focus:bg-white transition-all resize-none shadow-sm text-[#304250] placeholder:text-[#304250]/40 custom-scrollbar" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>

                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={validateAndProceed}
                                className="bg-[#20A46B] hover:bg-[#20A46B]/90 text-white px-10 py-4 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_4px_14px_rgba(32,164,107,0.3)] w-full sm:w-auto"
                            >
                                Book Order with {watch('courier') || 'Courier'} <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 2 */}
            {currentStep === 2 && (
                <div className="flex items-center justify-center min-h-[70vh] p-6 animate-in fade-in duration-300">
                    <div className="max-w-[600px] w-full bg-white p-12 rounded-[32px] shadow-[0_8px_30px_rgba(48,66,80,0.04)] border border-[#304250]/10 text-center flex flex-col items-center">
                        {!bookingSuccess ? (
                            <>
                                <div className="w-20 h-20 bg-[#20A46B]/5 rounded-full flex items-center justify-center mb-6 border-[3px] border-[#20A46B]/20">
                                    <Loader2 size={36} className="animate-spin text-[#20A46B]" />
                                </div>
                                <h2 className="text-2xl font-black text-[#304250] mb-2 tracking-tight">Booking Order...</h2>
                                <p className="text-[#304250]/60 mb-2 max-w-md font-medium">
                                    Booking with <span className="font-extrabold text-[#20A46B] bg-[#20A46B]/10 px-2 py-0.5 rounded-md">{data.courier}</span>
                                </p>
                                <p className="text-xs text-[#304250]/40 font-bold uppercase tracking-wider mt-2">This may take a few seconds.</p>
                            </>
                        ) : (
                            <div className="animate-in zoom-in-95 duration-500 w-full flex flex-col items-center">
                                <div className="w-20 h-20 bg-[#20A46B]/10 rounded-full flex items-center justify-center text-[#20A46B] mb-6 shadow-inner border border-[#20A46B]/20">
                                    <CheckCircle2 size={40} strokeWidth={2.5} />
                                </div>
                                <h2 className="text-2xl font-black text-[#304250] mb-1 tracking-tight">Order Booked!</h2>
                                <p className="text-[#304250]/60 font-medium mb-6">Tracking number and routing code generated.</p>
                                <div className="bg-gray-50 border border-[#304250]/10 rounded-2xl p-6 w-full max-w-md relative overflow-hidden shadow-inner">
                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-[#20A46B]" />
                                    <div className="flex justify-between items-start mb-5 text-left pl-2">
                                        <div>
                                            <span className="text-[10px] font-extrabold text-[#304250]/50 uppercase tracking-widest block mb-1">Tracking Number</span>
                                            <h1 className="text-2xl sm:text-3xl font-black font-mono text-[#304250] tracking-wider">{data.trackingNumber}</h1>
                                        </div>
                                        {data.routingCode && (
                                            <div className="text-right">
                                                <span className="text-[10px] font-extrabold text-[#304250]/50 uppercase tracking-widest block mb-1">Routing</span>
                                                <span className="text-lg font-black text-[#20A46B] font-mono bg-[#20A46B]/10 px-2 py-0.5 rounded-md">{data.routingCode}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="bg-white p-4 rounded-xl border border-[#304250]/10 flex justify-center h-[80px] shadow-sm">
                                        <SafeBarcode value={data.barcodeValue || data.trackingNumber} width={2} height={50} displayValue={false} />
                                    </div>
                                </div>
                                <p className="text-xs font-bold text-[#304250]/40 uppercase tracking-wider mt-6">Redirecting to label preview...</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* STEP 3 */}
            {currentStep === 3 && (
                <div className="p-6 lg:p-10 pt-6 animate-in fade-in duration-300">
                    <div className="max-w-4xl mx-auto flex flex-col items-center">

                        <div className="w-full mb-6 bg-white p-3 rounded-2xl shadow-sm border border-[#304250]/10 flex items-center justify-between px-5 lg:px-8">
                            {stepLabels.map((label, idx) => {
                                const stepNum = idx + 1;
                                const isActive = currentStep >= stepNum;
                                const isCompleted = currentStep > stepNum;
                                return (
                                    <React.Fragment key={label}>
                                        {idx > 0 && (
                                            <div className="flex-1 h-1 mx-3 rounded-full relative bg-gray-100 overflow-hidden">
                                                <div className="absolute left-0 top-0 h-full bg-[#20A46B] transition-all duration-500" style={{ width: isActive ? '100%' : '0%' }} />
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2.5 z-10 bg-white cursor-default">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${isActive ? 'bg-[#20A46B] text-white shadow-[0_4px_14px_rgba(32,164,107,0.3)]' : 'bg-gray-100 text-[#304250]/40 border-2 border-transparent'}`}>
                                                {isCompleted ? <Check size={16} strokeWidth={3} /> : stepNum}
                                            </div>
                                            <span className={`font-black text-xs uppercase tracking-wide hidden md:block transition-colors ${isActive ? 'text-[#304250]' : 'text-[#304250]/40'}`}>
                                                {label}
                                            </span>
                                        </div>
                                    </React.Fragment>
                                );
                            })}
                        </div>

                        <div className="w-full bg-white p-3 rounded-2xl shadow-sm border border-[#304250]/10 flex flex-row items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-1">
                                {TEMPLATE_OPTIONS.map((t) => {
                                    const Icon = t.icon;
                                    const isActive = template === t.id;
                                    return (
                                        <button key={t.id} onClick={() => setTemplate(t.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all text-sm font-bold border-2 outline-none active:scale-95 ${isActive ? 'bg-white text-[#20A46B] border-[#20A46B] shadow-[0_4px_14px_rgba(32,164,107,0.1)]' : 'bg-gray-50 text-[#304250]/60 border-transparent hover:border-[#304250]/10 hover:bg-white'}`}>
                                            <Icon size={18} className={isActive ? "text-[#20A46B]" : "text-[#304250]/40"} />
                                            <span className="whitespace-nowrap">{t.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="flex items-center gap-2.5 shrink-0 border-l border-[#304250]/10 pl-4">
                                <button onClick={handleShareClick} disabled={isSharing} className="flex items-center justify-center gap-2 bg-[#EEBE1C] hover:bg-[#d9ab18] text-[#304250] px-4 h-11 rounded-xl transition-all disabled:opacity-50 outline-none shadow-[0_4px_14px_rgba(238,190,28,0.3)] active:scale-95 font-extrabold text-sm whitespace-nowrap">
                                    {isSharing ? <Loader2 size={16} className="animate-spin" /> : <Share2 size={16} />} Share
                                </button>
                                <button onClick={handleDownloadPDF} disabled={isDownloading} className="flex items-center justify-center gap-2 bg-[#20A46B] hover:bg-[#20A46B]/90 text-white px-4 h-11 rounded-xl transition-all active:scale-95 disabled:opacity-70 outline-none shadow-[0_4px_14px_rgba(32,164,107,0.3)] font-extrabold text-sm whitespace-nowrap">
                                    {isDownloading && downloadFormat === 'pdf' ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} PDF
                                </button>
                                <button onClick={handlePrint} className="flex items-center justify-center gap-2 bg-[#304250] hover:bg-[#304250]/90 text-white px-4 h-11 rounded-xl transition-all outline-none shadow-[0_4px_14px_rgba(48,66,80,0.3)] active:scale-95 font-extrabold text-sm whitespace-nowrap">
                                    <Printer size={16} /> Print
                                </button>
                            </div>
                        </div>

                        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 px-2">
                            <button onClick={resetForNewOrder} className="flex items-center gap-2 text-xs font-extrabold text-[#304250] uppercase tracking-wider transition-colors bg-[#EEBE1C] hover:bg-[#d9ab18] px-5 py-3 rounded-xl shadow-[0_4px_14px_rgba(238,190,28,0.3)] active:scale-95">
                                <RotateCcw size={16} /> New Order
                            </button>
                            <div className="flex items-center gap-4 text-sm bg-white px-5 py-3 rounded-xl border border-[#304250]/10 shadow-sm">
                                <span className="text-[#304250]/60 font-extrabold text-[11px] uppercase tracking-wider">Tracking: <span className="text-[#304250] font-black font-mono ml-1 text-sm bg-gray-100 px-2 py-0.5 rounded">{data.trackingNumber}</span></span>
                                {data.routingCode && (
                                    <>
                                        <div className="w-px h-4 bg-[#304250]/10"></div>
                                        <span className="text-[#304250]/60 font-extrabold text-[11px] uppercase tracking-wider">Route: <span className="text-[#20A46B] font-black font-mono ml-1 text-sm bg-[#20A46B]/10 px-2 py-0.5 rounded">{data.routingCode}</span></span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="w-full flex justify-center items-center bg-gray-200/50 rounded-[32px] p-4 sm:p-6 border border-[#304250]/10 shadow-inner overflow-hidden relative" style={{ height: '500px' }}>
                            <div className="relative flex justify-center items-center w-full h-full">
                                <div className="absolute" style={{ transform: 'scale(0.85)', transformOrigin: 'center center' }}>
                                    <div className="shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-[#304250]/10 overflow-hidden rounded-md bg-white">
                                        <div ref={componentRef} className="print-area bg-white relative shrink-0 m-0 p-0 box-border" style={{ width: `${labelW}px`, height: `${labelH}px` }}>
                                            {renderTemplate()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}