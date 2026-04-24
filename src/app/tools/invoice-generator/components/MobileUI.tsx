import React, { useState } from 'react';
import {
    Printer, ChevronRight, ChevronLeft, Download, Share2,
    Loader2, Plus, Trash2, Image, Building, User, ShoppingCart, Calculator, CheckCircle2, Upload, PenTool, Banknote, Truck as TruckIcon
} from 'lucide-react';
import { InvoiceLogicReturn } from '../useInvoiceLogic';
import {
    TemplateMinimal, TemplateCorporate, TemplateModern,
    TemplateElegant, TemplateTech, TemplateCompact,
    TemplateSimple, TemplateClassic
} from './SharedTemplates';

export default function MobileUI({ logic }: { logic: InvoiceLogicReturn }) {
    const {
        data, update, handleUploads, calculations, printRef, handlePrint,
        selectedTemplate, setSelectedTemplate, handleDownloadPDF, handleDownloadPNG, isDownloading, downloadFormat
    } = logic;

    const [step, setStep] = useState(1);
    const [isSharing, setIsSharing] = useState(false);

    const templates: any = {
        1: { comp: TemplateMinimal, name: 'Minimal' },
        2: { comp: TemplateCorporate, name: 'Corporate' },
        3: { comp: TemplateModern, name: 'Modern' },
        4: { comp: TemplateElegant, name: 'Elegant' },
        5: { comp: TemplateTech, name: 'Tech' },
        6: { comp: TemplateCompact, name: 'Compact' },
        7: { comp: TemplateSimple, name: 'Simple' },
        8: { comp: TemplateClassic, name: 'Classic' }
    };

    const templateNames: any = {
        1: 'Minimal', 2: 'Corporate', 3: 'Modern',
        4: 'Elegant', 5: 'Tech', 6: 'Compact',
        7: 'Simple', 8: 'Classic'
    };

    const ActiveTemplate = templates[selectedTemplate].comp;
    const progress = (step / 5) * 100;

    const handleShare = async () => {
        setIsSharing(true);
        try {
            if (navigator.share) {
                await navigator.share({
                    title: `Invoice ${data.invoiceNo}`,
                    text: `Invoice from ${data.sellerName || 'us'} to ${data.billToName || 'Customer'}`,
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

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans text-[#304250] pb-[120px]">

            {/* COMPACT PROGRESS HEADER */}
            <header className="bg-white sticky top-0 z-40 shadow-sm border-b border-[#304250]/10">
                <div className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 w-full">
                        <h1 className="font-extrabold text-[#304250] text-sm sm:text-base flex items-center gap-1.5 flex-1 truncate">
                            {step === 1 && <><Building size={16} className="text-[#20A46B] shrink-0" /> <span className="truncate">Sender Info</span></>}
                            {step === 2 && <><User size={16} className="text-[#20A46B] shrink-0" /> <span className="truncate">Client Info</span></>}
                            {step === 3 && <><ShoppingCart size={16} className="text-[#20A46B] shrink-0" /> <span className="truncate">Line Items</span></>}
                            {step === 4 && <><Calculator size={16} className="text-[#20A46B] shrink-0" /> <span className="truncate">Financials</span></>}
                            {step === 5 && <><CheckCircle2 size={16} className="text-[#20A46B] shrink-0" /> <span className="truncate">Preview</span></>}
                        </h1>
                        <p className="text-[11px] text-[#20A46B] font-black uppercase tracking-widest bg-[#20A46B]/10 px-2 py-1 rounded-md shrink-0">Step {step} / 5</p>
                    </div>
                </div>
                <div className="w-full h-1 bg-gray-100">
                    <div className="h-full bg-[#20A46B] transition-all duration-500 ease-out rounded-r-full" style={{ width: `${progress}%` }}></div>
                </div>
            </header>

            {/* MAIN CONTENT FORM */}
            <main className="flex-1 p-4 w-full max-w-[500px] mx-auto">

                {/* STEP 1: SENDER INFO */}
                {step === 1 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#304250]/10 space-y-4">
                            <div className="grid grid-cols-2 gap-3 mb-2">
                                <div>
                                    <label className="text-[10px] font-bold text-[#304250]/60 uppercase tracking-widest pl-1">Invoice #</label>
                                    <input value={data.invoiceNo} onChange={(e) => update('invoiceNo', e.target.value)} className="w-full px-3 py-3.5 border border-[#304250]/10 rounded-xl bg-[#f8fafc] outline-none focus:bg-white focus:border-[#20A46B] text-sm font-bold mt-1 transition-colors" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-[#304250]/60 uppercase tracking-widest pl-1">Date</label>
                                    <input type="date" value={data.date} onChange={(e) => update('date', e.target.value)} className="w-full px-3 py-3.5 border border-[#304250]/10 rounded-xl bg-[#f8fafc] outline-none focus:bg-white focus:border-[#20A46B] text-sm font-bold mt-1 transition-colors" />
                                </div>
                            </div>

                            <label className="cursor-pointer border-2 border-dashed border-[#304250]/20 rounded-xl min-h-[90px] flex flex-col justify-center items-center bg-[#f8fafc] hover:bg-[#20A46B]/5 hover:border-[#20A46B]/30 transition-colors relative overflow-hidden group">
                                <input type="file" accept="image/*" onChange={handleUploads.logo} className="hidden" />
                                {data.logo ? (
                                    <>
                                        <img src={data.logo} alt="Logo" className="h-[60px] object-contain p-2" />
                                        <div className="absolute inset-0 bg-[#304250]/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <span className="text-white text-xs font-bold flex items-center gap-1.5"><Upload size={14} /> Change</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <Upload size={22} className="text-[#304250]/30 mb-1" />
                                        <span className="text-xs font-bold text-[#304250]/60">Upload Business Logo</span>
                                    </>
                                )}
                            </label>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-[#304250]/60 uppercase tracking-widest pl-1">Your Business Name</label>
                                <input value={data.sellerName} onChange={(e) => update('sellerName', e.target.value)} className="w-full px-4 py-3.5 border border-[#304250]/10 rounded-xl bg-[#f8fafc] outline-none focus:bg-white focus:border-[#20A46B] text-sm font-bold transition-colors" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-[#304250]/60 uppercase tracking-widest pl-1">Your Email / Phone</label>
                                <input value={data.sellerPhone} onChange={(e) => update('sellerPhone', e.target.value)} className="w-full px-4 py-3.5 border border-[#304250]/10 rounded-xl bg-[#f8fafc] outline-none focus:bg-white focus:border-[#20A46B] text-sm transition-colors" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-[#304250]/60 uppercase tracking-widest pl-1">Your Address</label>
                                <textarea value={data.sellerAddress} onChange={(e) => update('sellerAddress', e.target.value)} rows={2} className="w-full px-4 py-4 border border-[#304250]/10 rounded-xl bg-[#f8fafc] outline-none focus:bg-white focus:border-[#20A46B] text-sm resize-none transition-colors" />
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: CLIENT INFO */}
                {step === 2 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#304250]/10 space-y-4">
                            <h2 className="font-bold text-[#304250] border-b border-[#304250]/10 pb-2">Billed To (Client)</h2>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-[#304250]/60 uppercase tracking-widest pl-1">Client Name</label>
                                <div className="relative flex items-center">
                                    <User size={18} className="absolute left-3.5 text-[#304250]/30" />
                                    <input value={data.billToName} onChange={(e) => update('billToName', e.target.value)} className="w-full pl-11 pr-4 py-3.5 border border-[#304250]/10 rounded-xl bg-[#f8fafc] outline-none focus:bg-white focus:border-[#20A46B] text-sm font-bold transition-colors" />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-[#304250]/60 uppercase tracking-widest pl-1">Client Email / Phone</label>
                                <input value={data.billToEmail} onChange={(e) => update('billToEmail', e.target.value)} className="w-full px-4 py-3.5 border border-[#304250]/10 rounded-xl bg-[#f8fafc] outline-none focus:bg-white focus:border-[#20A46B] text-sm transition-colors" />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-[#304250]/60 uppercase tracking-widest pl-1">Billing Address</label>
                                <textarea value={data.billToAddress} onChange={(e) => update('billToAddress', e.target.value)} rows={2} className="w-full px-4 py-4 border border-[#304250]/10 rounded-xl bg-[#f8fafc] outline-none focus:bg-white focus:border-[#20A46B] text-sm resize-none transition-colors" />
                            </div>
                        </div>

                        {/* Shipping Address Toggle */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#304250]/10">
                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="font-bold text-sm text-[#304250]">Add Shipping Address</span>
                                <input type="checkbox" checked={data.showShippingAddress} onChange={(e) => update('showShippingAddress', e.target.checked)} className="w-5 h-5 accent-[#20A46B]" />
                            </label>

                            {data.showShippingAddress && (
                                <div className="mt-4 pt-4 border-t border-[#304250]/10 space-y-4 animate-in fade-in">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-[#304250]/60 uppercase tracking-widest pl-1">Ship To Name</label>
                                        <input value={data.shipToName} onChange={(e) => update('shipToName', e.target.value)} className="w-full px-4 py-3.5 border border-[#304250]/10 rounded-xl bg-[#f8fafc] outline-none focus:bg-white focus:border-[#20A46B] text-sm transition-colors" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-[#304250]/60 uppercase tracking-widest pl-1">Shipping Address</label>
                                        <textarea value={data.shipToAddress} onChange={(e) => update('shipToAddress', e.target.value)} rows={2} className="w-full px-4 py-4 border border-[#304250]/10 rounded-xl bg-[#f8fafc] outline-none focus:bg-white focus:border-[#20A46B] text-sm resize-none transition-colors" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* STEP 3: LINE ITEMS */}
                {step === 3 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-[#304250]/10">
                            <h2 className="font-bold text-[#304250]">Products / Services</h2>
                            <button onClick={calculations.addItem} className="text-[#20A46B] bg-[#20A46B]/10 hover:bg-[#20A46B]/20 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors">
                                <Plus size={14} /> Add Item
                            </button>
                        </div>

                        <div className="space-y-3">
                            {data.items.length === 0 && (
                                <div className="bg-white p-8 rounded-xl shadow-sm border border-[#304250]/20 border-dashed text-center">
                                    <p className="text-sm font-medium text-[#304250]/50">No items added to invoice.</p>
                                </div>
                            )}

                            {data.items.map((item: any, index: number) => (
                                <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-[#304250]/10 space-y-3">
                                    <div className="flex justify-between items-center border-b border-[#304250]/10 pb-2">
                                        <span className="text-xs font-extrabold text-[#304250]/50 bg-gray-100 px-2 py-1 rounded-md">ITEM {index + 1}</span>
                                        <button onClick={() => calculations.removeItem(item.id)} className="text-[#304250]/40 hover:text-red-500 bg-white border border-[#304250]/10 w-7 h-7 flex items-center justify-center rounded-full shadow-sm transition-all"><Trash2 size={12} /></button>
                                    </div>
                                    <div className="space-y-3">
                                        <input value={item.description} onChange={(e) => calculations.updateItem(item.id, 'description', e.target.value)} placeholder="Item Name / Description" className="w-full px-3 py-3.5 border border-[#304250]/10 rounded-xl bg-[#f8fafc] outline-none focus:bg-white focus:border-[#20A46B] text-sm font-bold transition-colors" />
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-[#304250]/60 uppercase tracking-widest pl-1">Quantity</label>
                                                <input type="number" value={item.quantity} onChange={(e) => calculations.updateItem(item.id, 'quantity', Number(e.target.value))} className="w-full px-3 py-3.5 border border-[#304250]/10 rounded-xl bg-[#f8fafc] outline-none focus:bg-white focus:border-[#20A46B] text-sm text-center transition-colors" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-[#304250]/60 uppercase tracking-widest pl-1">Rate (Price)</label>
                                                <input type="number" value={item.rate} onChange={(e) => calculations.updateItem(item.id, 'rate', Number(e.target.value))} className="w-full px-3 py-3.5 border border-[#304250]/10 rounded-xl bg-[#f8fafc] outline-none focus:bg-white focus:border-[#20A46B] text-sm text-center transition-colors" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* STEP 4: FINANCIALS & TERMS */}
                {step === 4 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#304250]/10 space-y-4">
                            <h2 className="font-bold text-[#304250] border-b border-[#304250]/10 pb-2">Taxes & Adjustments</h2>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-[#304250]/60 uppercase tracking-widest">Tax %</label>
                                    <input type="number" value={data.tax} onChange={(e) => update('tax', Number(e.target.value))} className="w-full px-2 py-3.5 border border-[#304250]/10 rounded-xl bg-[#f8fafc] focus:bg-white focus:border-[#20A46B] text-center text-sm outline-none transition-colors" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-[#304250]/60 uppercase tracking-widest">Discount %</label>
                                    <input type="number" value={data.discount} onChange={(e) => update('discount', Number(e.target.value))} className="w-full px-2 py-3.5 border border-[#304250]/10 rounded-xl bg-[#f8fafc] focus:bg-white focus:border-[#20A46B] text-center text-sm text-red-500 font-bold outline-none transition-colors" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-[#304250]/60 uppercase tracking-widest">Shipping</label>
                                    <input type="number" value={data.shipping} onChange={(e) => update('shipping', Number(e.target.value))} className="w-full px-2 py-3.5 border border-[#304250]/10 rounded-xl bg-[#f8fafc] focus:bg-white focus:border-[#20A46B] text-center text-sm outline-none transition-colors" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#304250]/10">
                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="font-bold text-sm text-[#304250]">Add Advance Payment</span>
                                <input type="checkbox" checked={data.showAdvance} onChange={(e) => update('showAdvance', e.target.checked)} className="w-5 h-5 accent-[#20A46B]" />
                            </label>
                            {data.showAdvance && (
                                <div className="mt-4 pt-4 border-t border-[#304250]/10 animate-in fade-in">
                                    <label className="text-[10px] font-bold text-[#20A46B] uppercase tracking-widest mb-1.5 block pl-1">Amount Paid in Advance</label>
                                    <input type="number" value={data.advanceAmount} onChange={(e) => update('advanceAmount', Number(e.target.value))} placeholder="0.00" className="w-full px-4 py-3.5 border-2 border-[#20A46B]/30 bg-[#20A46B]/5 rounded-xl outline-none focus:bg-white focus:border-[#20A46B] text-base font-black text-[#20A46B] transition-colors" />
                                </div>
                            )}
                        </div>

                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#304250]/10 space-y-4">
                            <h2 className="font-bold text-[#304250] border-b border-[#304250]/10 pb-2">Notes & Payment Terms</h2>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-[#304250]/60 uppercase tracking-widest pl-1">Bank Account / Payment Details</label>
                                <textarea value={data.paymentInfo} onChange={(e) => update('paymentInfo', e.target.value)} rows={3} placeholder="e.g. Bank Name, Account Title, IBAN" className="w-full px-4 py-4 border border-[#304250]/10 rounded-xl bg-[#f8fafc] outline-none focus:bg-white focus:border-[#20A46B] text-sm resize-none transition-colors" />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-[#304250]/60 uppercase tracking-widest pl-1">Terms / Notes</label>
                                <textarea value={data.notes} onChange={(e) => update('notes', e.target.value)} rows={2} placeholder="e.g. Please pay within 15 days." className="w-full px-4 py-4 border border-[#304250]/10 rounded-xl bg-[#f8fafc] outline-none focus:bg-white focus:border-[#20A46B] text-sm resize-none transition-colors" />
                            </div>
                        </div>
                        {/* Payment Method Section */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#304250]/10 space-y-4">
                            <h2 className="font-bold text-[#304250] border-b border-[#304250]/10 pb-2">Payment Method</h2>
                            <div className="flex gap-3 bg-[#f8fafc] p-2 rounded-xl border border-[#304250]/10">
                                <label className={`flex items-center justify-center gap-2 cursor-pointer flex-1 py-3 rounded-lg border transition-colors ${data.paymentMethod === 'bank' ? 'bg-white border-[#20A46B] text-[#20A46B] shadow-sm' : 'border-transparent text-[#304250]/50 hover:bg-white'}`}>
                                    <input type="radio" checked={data.paymentMethod === 'bank'} onChange={() => update('paymentMethod', 'bank')} className="hidden" />
                                    <Banknote size={16} />
                                    <span className="text-xs font-extrabold tracking-wide">Bank Transfer</span>
                                </label>
                                <label className={`flex items-center justify-center gap-2 cursor-pointer flex-1 py-3 rounded-lg border transition-colors ${data.paymentMethod === 'cod' ? 'bg-white border-[#20A46B] text-[#20A46B] shadow-sm' : 'border-transparent text-[#304250]/50 hover:bg-white'}`}>
                                    <input type="radio" checked={data.paymentMethod === 'cod'} onChange={() => update('paymentMethod', 'cod')} className="hidden" />
                                    <TruckIcon size={16} />
                                    <span className="text-xs font-extrabold tracking-wide">COD</span>
                                </label>
                            </div>

                            {data.paymentMethod === 'bank' ? (
                                <div className="space-y-3 animate-in fade-in">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-[#304250]/60 uppercase tracking-widest pl-1">Bank Name</label>
                                        <input value={data.bankName} onChange={(e) => update('bankName', e.target.value)} placeholder="e.g. Meezan Bank" className="w-full px-4 py-3.5 border border-[#304250]/10 rounded-xl bg-[#f8fafc] outline-none focus:bg-white focus:border-[#20A46B] text-sm font-bold transition-colors" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-[#304250]/60 uppercase tracking-widest pl-1">Account Title</label>
                                        <input value={data.accountName} onChange={(e) => update('accountName', e.target.value)} placeholder="e.g. Ali Khan" className="w-full px-4 py-3.5 border border-[#304250]/10 rounded-xl bg-[#f8fafc] outline-none focus:bg-white focus:border-[#20A46B] text-sm font-bold transition-colors" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-[#304250]/60 uppercase tracking-widest pl-1">Account / IBAN Number</label>
                                        <input value={data.accountNumber} onChange={(e) => update('accountNumber', e.target.value)} placeholder="e.g. PK36MEZN0001010101" className="w-full px-4 py-3.5 border border-[#304250]/10 rounded-xl bg-[#f8fafc] outline-none focus:bg-white focus:border-[#20A46B] text-sm font-mono transition-colors" />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 py-3 px-4 bg-[#20A46B]/5 rounded-xl border border-[#20A46B]/20 animate-in fade-in">
                                    <div className="w-10 h-10 bg-[#20A46B]/10 rounded-full flex items-center justify-center text-[#20A46B] shrink-0">
                                        <TruckIcon size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-[#20A46B] text-sm">Cash on Delivery</p>
                                        <p className="text-xs text-[#20A46B]">Pay cash to rider upon delivery.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Signature Section */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#304250]/10 space-y-4">
                            <h2 className="font-bold text-[#304250] border-b border-[#304250]/10 pb-2">Authorized Signature</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <label className="cursor-pointer border-2 border-dashed border-[#304250]/20 rounded-xl min-h-[90px] flex flex-col justify-center items-center bg-[#f8fafc] hover:bg-[#20A46B]/5 hover:border-[#20A46B]/30 transition-colors relative overflow-hidden group">
                                    <input type="file" accept="image/*" onChange={handleUploads.signature} className="hidden" />
                                    {data.signature ? (
                                        <>
                                            <img src={data.signature} alt="Signature" className="h-[60px] object-contain p-2" />
                                            <div className="absolute inset-0 bg-[#304250]/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <span className="text-white text-xs font-bold flex items-center gap-1.5"><Upload size={14} /> Change</span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <PenTool size={22} className="text-[#304250]/30 mb-1" />
                                            <span className="text-[10px] font-bold text-[#304250]/50 uppercase tracking-widest">Upload Sign</span>
                                        </>
                                    )}
                                </label>
                                <div className="space-y-1.5 flex flex-col justify-end">
                                    <label className="text-[10px] font-bold text-[#304250]/60 uppercase tracking-widest pl-1">Signatory Name</label>
                                    <input value={data.signName} onChange={(e) => update('signName', e.target.value)} placeholder="e.g. Ali Khan" className="w-full px-3 py-3 border border-[#304250]/10 rounded-xl bg-[#f8fafc] outline-none focus:bg-white focus:border-[#20A46B] text-sm font-bold transition-colors" />
                                </div>
                            </div>
                        </div>

                    </div>
                )}

                {/* STEP 5: PREVIEW & EXPORT */}
                {step === 5 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">

                        <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-[#304250]/10">
                            <label className="text-[10px] font-bold text-[#304250]/60 uppercase tracking-widest mb-2.5 block px-1">Select Design</label>
                            <div className="grid grid-cols-4 gap-1.5 w-full">
                                {Object.keys(templateNames).map((key: any) => {
                                    const tId = Number(key);
                                    return (
                                        <button
                                            key={tId}
                                            onClick={() => setSelectedTemplate(tId)}
                                            className={`py-2 px-1 rounded-xl text-[11px] font-extrabold transition-all border-2
                                                ${selectedTemplate === tId
                                                    ? 'bg-[#20A46B] text-white border-[#20A46B] shadow-md'
                                                    : 'bg-[#f8fafc] border-transparent text-[#304250]/60 hover:bg-gray-100 hover:text-[#304250]'
                                                }`}
                                        >
                                            {templateNames[tId]}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Absolute Scaled A4 Canvas Preview */}
                        <div className="w-full flex justify-center bg-gray-100/80 rounded-2xl p-4 sm:p-6 md:p-8 border border-[#304250]/10 shadow-inner overflow-hidden relative">
                            {/* Inner scaling container holds exact scaled footprint to prevent layout clipping */}
                            <div
                                className="relative transition-all duration-300 flex justify-center"
                                style={{ width: '100%', maxWidth: '300px', height: '420px' }}
                            >
                                {/* Transform wrapper — scales visually for preview only */}
                                <div
                                    className="absolute top-0 left-1/2"
                                    style={{
                                        transform: 'scale(0.35) translateX(-50%)',
                                        transformOrigin: 'top left',
                                    }}
                                >
                                    {/* Capture target — full A4 size, NO transform */}
                                    <div
                                        ref={printRef}
                                        className="bg-white shadow-[0_10px_40px_rgba(0,0,0,0.15)] rounded-sm overflow-hidden origin-top-left"
                                        style={{
                                            width: '794px',
                                            minHeight: '1123px',
                                        }}
                                    >
                                        <ActiveTemplate
                                            data={data}
                                            update={update}
                                            handleUploads={handleUploads}
                                            calculations={calculations}
                                            isPreview={true}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* FLOATING BOTTOM NAVIGATION DOCK - FIXED COLORS BASED ON SCREENSHOTS */}
            <div className="fixed bottom-4 left-4 right-4 bg-white/95 backdrop-blur-xl border border-[#304250]/10 p-3 flex items-center justify-between gap-3 z-50 shadow-[0_8px_30px_rgba(48,66,80,0.15)] rounded-2xl">
                {step > 1 && (
                    <button onClick={() => setStep(step - 1)} className="w-12 h-12 shrink-0 flex items-center justify-center text-[#304250] bg-gray-100 hover:bg-gray-200 rounded-xl transition-all">
                        <ChevronLeft size={22} />
                    </button>
                )}

                {step < 5 ? (
                    <button onClick={() => setStep(step + 1)} className="flex-1 h-12 flex items-center justify-center gap-2 font-extrabold text-sm text-white bg-[#20A46B] hover:bg-[#20A46B]/90 rounded-xl shadow-[0_4px_14px_rgba(32,164,107,0.3)] active:scale-[0.98] transition-all">
                        Next Step <ChevronRight size={18} />
                    </button>
                ) : (
                    <>
                        {/* Share Button (Solid Yellow) */}
                        <button onClick={handleShare} disabled={isSharing} className="w-12 h-12 shrink-0 flex items-center justify-center text-[#304250] bg-[#EEBE1C] hover:bg-[#d9ab18] rounded-xl shadow-md active:scale-95 transition-all disabled:opacity-50">
                            {isSharing ? <Loader2 size={18} className="animate-spin" /> : <Share2 size={18} />}
                        </button>

                        {/* Download PDF Button (Solid Green) */}
                        <button onClick={handleDownloadPDF} disabled={isDownloading} className="w-12 h-12 shrink-0 flex items-center justify-center text-white bg-[#20A46B] hover:bg-[#20A46B]/90 rounded-xl shadow-md active:scale-95 transition-all disabled:opacity-50">
                            {isDownloading && downloadFormat === 'pdf' ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                        </button>

                        {/* Download PNG Button (Solid Green) */}
                        <button onClick={handleDownloadPNG} disabled={isDownloading} className="w-12 h-12 shrink-0 flex items-center justify-center text-white bg-[#20A46B] hover:bg-[#20A46B]/90 rounded-xl shadow-md active:scale-95 transition-all disabled:opacity-50">
                            {isDownloading && downloadFormat === 'png' ? <Loader2 size={18} className="animate-spin" /> : <Image size={18} />}
                        </button>

                        {/* Print Button (Solid Dark Blue) */}
                        <button onClick={handlePrint} className="flex-1 h-12 flex items-center justify-center gap-2 font-extrabold text-sm text-white bg-[#304250] hover:bg-[#304250]/90 rounded-xl shadow-[0_4px_14px_rgba(48,66,80,0.3)] active:scale-[0.98] transition-all">
                            <Printer size={18} /> Print
                        </button>
                    </>
                )}
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { height: 4px; width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
            `}</style>
        </div>
    );
}