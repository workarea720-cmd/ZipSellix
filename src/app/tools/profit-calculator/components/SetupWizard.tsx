"use client";
import React, { useState, useRef, useEffect } from 'react';
import {
    Building2, ArrowRight, Check, Package, Wrench,
    Share2, Truck, DollarSign, Trash2, ArrowLeft,
    ChevronDown, ChevronRight, X, Plus // 👈 FIX: ChevronRight added to imports
} from 'lucide-react';

import { API_URL, safeFetch } from '@/lib/api-client';

const DEFAULT_RATES: any = {
    "PostEx": { sameCity: 100, sameProv: 165, crossProv: 201, kg: 50 },
    "Leopard": { sameCity: 150, sameProv: 180, crossProv: 220, kg: 100 },
    "TCS": { sameCity: 200, sameProv: 250, crossProv: 300, kg: 120 },
    "Trax": { sameCity: 130, sameProv: 160, crossProv: 190, kg: 90 },
    "CallCourier": { sameCity: 140, sameProv: 170, crossProv: 200, kg: 95 },
    "M&P": { sameCity: 180, sameProv: 210, crossProv: 240, kg: 110 },
    "Other": { sameCity: 0, sameProv: 0, crossProv: 0, kg: 0 }
};

const COMMON_PLATFORMS = ["WhatsApp", "Daraz", "Facebook", "Instagram", "Shopify", "TikTok", "Website"];

export default function SetupWizard({ onComplete }: { onComplete: () => void }) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Custom Dropdown Logic
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [customCourierMode, setCustomCourierMode] = useState(false);
    const [customCourierName, setCustomCourierName] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: any) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    const [formData, setFormData] = useState({
        businessType: 'STOCK',
        businessName: '',
        ownerName: '',
        city: '',
        province: 'Punjab',
        platforms: [] as string[],
        courierRates: [] as any[],
        monthlyRent: '',
        monthlySalary: '',
        monthlyHosting: '',
        monthlyInternet: '',
        packagingCost: ''
    });

    const togglePlatform = (p: string) => {
        if (formData.platforms.includes(p)) {
            setFormData({ ...formData, platforms: formData.platforms.filter(x => x !== p) });
        } else {
            setFormData({ ...formData, platforms: [...formData.platforms, p] });
        }
    };

    const addCourier = (name: string) => {
        if (!name) return;
        if (formData.courierRates.some(c => c.name === name)) return;
        const d = DEFAULT_RATES[name] || DEFAULT_RATES["Other"];
        setFormData({ ...formData, courierRates: [...formData.courierRates, { name, ...d }] });
        setCustomCourierMode(false);
        setCustomCourierName("");
        setIsDropdownOpen(false);
    };

    const removeCourier = (index: number) => {
        const newRates = formData.courierRates.filter((_, i) => i !== index);
        setFormData({ ...formData, courierRates: newRates });
    };

    const updateCourierRate = (index: number, field: string, value: string) => {
        const newRates = [...formData.courierRates];
        newRates[index][field] = Number(value);
        setFormData({ ...formData, courierRates: newRates });
    };

    const handleNext = () => {
        if (step === 1 && (!formData.businessName || !formData.ownerName)) return alert("Please fill details.");
        setStep(step + 1);
    };

    const handleSubmit = async () => {
        setLoading(true);
        const payload = {
            ...formData,
            businessTypes: formData.platforms,
            monthlyRent: Number(formData.monthlyRent),
            monthlySalary: Number(formData.monthlySalary),
            monthlyHosting: Number(formData.monthlyHosting),
            monthlyInternet: Number(formData.monthlyInternet),
            packagingCost: Number(formData.packagingCost)
        };

        try {
            const res = await safeFetch<any>(`${API_URL}/api/business/setup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res?.success) onComplete();
            else alert("Setup failed.");
        } catch (e) { alert("Network Error"); }
        finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 font-sans text-[#304250] selection:bg-[#20A46B]/20 selection:text-[#20A46B]">
            <div className="bg-white w-full max-w-3xl rounded-[24px] shadow-[0_20px_60px_rgba(48,66,80,0.1)] border border-[#304250]/10 overflow-hidden flex flex-col max-h-[90vh]">

                <div className="bg-white p-6 border-b border-[#304250]/5 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-black text-[#304250] tracking-tight">Setup ZipSellix</h2>
                        <p className="text-[#304250]/50 text-[10px] font-bold uppercase tracking-widest mt-1.5">Configuration: Step {step} of 4</p>
                    </div>
                    <div className="flex gap-1.5">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className={`h-2 w-10 rounded-full transition-all duration-500 ${step >= i ? 'bg-[#20A46B]' : 'bg-gray-100'}`}></div>
                        ))}
                    </div>
                </div>

                <div className="p-6 sm:p-10 overflow-y-auto flex-1 custom-scrollbar">

                    {/* STEP 1: BUSINESS BASICS */}
                    {step === 1 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                            <div className="text-center">
                                <div className="w-14 h-14 bg-[#20A46B]/10 text-[#20A46B] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#20A46B]/20 shadow-sm">
                                    <Building2 size={28} />
                                </div>
                                <h3 className="text-lg font-black text-[#304250]">Business Basics</h3>
                                <p className="text-sm text-[#304250]/50 font-medium">Let's start with your identity.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button onClick={() => setFormData({ ...formData, businessType: 'STOCK' })}
                                    className={`p-6 rounded-[20px] border-2 text-left transition-all relative group ${formData.businessType === 'STOCK' ? 'border-[#20A46B] bg-[#20A46B]/5 shadow-md' : 'border-[#304250]/5 bg-gray-50/50 hover:border-[#20A46B]/30'}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${formData.businessType === 'STOCK' ? 'bg-[#20A46B] text-white shadow-lg shadow-[#20A46B]/30' : 'bg-white text-[#304250]/40 border border-[#304250]/10'}`}>
                                            <Package size={24} />
                                        </div>
                                        {formData.businessType === 'STOCK' && <div className="bg-[#20A46B] text-white rounded-full p-1.5 shadow-sm"><Check size={14} strokeWidth={4} /></div>}
                                    </div>
                                    <h4 className={`font-black text-sm uppercase tracking-wide ${formData.businessType === 'STOCK' ? 'text-[#304250]' : 'text-[#304250]/60'}`}>Stock Based</h4>
                                    <p className="text-[11px] text-[#304250]/50 font-bold leading-tight mt-1.5 uppercase">Retail/Wholesale. Manage Inventory.</p>
                                </button>

                                <button onClick={() => setFormData({ ...formData, businessType: 'SERVICE' })}
                                    className={`p-6 rounded-[20px] border-2 text-left transition-all relative group ${formData.businessType === 'SERVICE' ? 'border-[#20A46B] bg-[#20A46B]/5 shadow-md' : 'border-[#304250]/5 bg-gray-50/50 hover:border-[#20A46B]/30'}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${formData.businessType === 'SERVICE' ? 'bg-[#20A46B] text-white shadow-lg shadow-[#20A46B]/30' : 'bg-white text-[#304250]/40 border border-[#304250]/10'}`}>
                                            <Wrench size={24} />
                                        </div>
                                        {formData.businessType === 'SERVICE' && <div className="bg-[#20A46B] text-white rounded-full p-1.5 shadow-sm"><Check size={14} strokeWidth={4} /></div>}
                                    </div>
                                    <h4 className={`font-black text-sm uppercase tracking-wide ${formData.businessType === 'SERVICE' ? 'text-[#304250]' : 'text-[#304250]/60'}`}>Made to Order</h4>
                                    <p className="text-[11px] text-[#304250]/50 font-bold leading-tight mt-1.5 uppercase">Manufacturing. No Stock.</p>
                                </button>
                            </div>

                            <div className="space-y-5 pt-6 border-t border-[#304250]/5">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-black text-[#304250]/50 uppercase tracking-widest pl-1">Business Name</label>
                                    <input className="w-full bg-gray-50 border border-[#304250]/10 p-4 rounded-xl outline-none focus:ring-2 ring-[#20A46B]/20 focus:border-[#20A46B] focus:bg-white text-sm font-bold text-[#304250] transition-all" placeholder="Enter Business Name" value={formData.businessName} onChange={e => setFormData({ ...formData, businessName: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-black text-[#304250]/50 uppercase tracking-widest pl-1">Owner Name</label>
                                        <input className="w-full bg-gray-50 border border-[#304250]/10 p-4 rounded-xl outline-none focus:ring-2 ring-[#20A46B]/20 focus:border-[#20A46B] focus:bg-white text-sm font-bold text-[#304250] transition-all" placeholder="Proprietor Name" value={formData.ownerName} onChange={e => setFormData({ ...formData, ownerName: e.target.value })} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-black text-[#304250]/50 uppercase tracking-widest pl-1">City</label>
                                        <input className="w-full bg-gray-50 border border-[#304250]/10 p-4 rounded-xl outline-none focus:ring-2 ring-[#20A46B]/20 focus:border-[#20A46B] focus:bg-white text-sm font-bold text-[#304250] transition-all" placeholder="e.g. Lahore" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-black text-[#304250]/50 uppercase tracking-widest pl-1">Province</label>
                                    <div className="relative">
                                        <select className="w-full bg-gray-50 border border-[#304250]/10 p-4 rounded-xl outline-none focus:ring-2 ring-[#20A46B]/20 focus:border-[#20A46B] focus:bg-white text-sm font-bold text-[#304250] transition-all appearance-none pr-10 cursor-pointer" value={formData.province} onChange={e => setFormData({ ...formData, province: e.target.value })}>
                                            <option>Punjab</option><option>Sindh</option><option>KPK</option><option>Balochistan</option><option>Islamabad</option><option>AJK</option>
                                        </select>
                                        <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#304250]/30 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: SALES CHANNELS */}
                    {step === 2 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                            <div className="text-center">
                                <div className="w-14 h-14 bg-[#EEBE1C]/10 text-[#304250] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#EEBE1C]/30 shadow-sm">
                                    <Share2 size={28} />
                                </div>
                                <h3 className="text-lg font-black text-[#304250]">Sales Channels</h3>
                                <p className="text-sm text-[#304250]/50 font-medium">Where do you accept orders?</p>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {COMMON_PLATFORMS.map(p => {
                                    const isSelected = formData.platforms.includes(p);
                                    return (
                                        <button key={p} onClick={() => togglePlatform(p)}
                                            className={`px-4 py-4 rounded-2xl text-xs font-black uppercase tracking-widest border-2 transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 ${isSelected ? 'bg-[#20A46B] text-white border-[#20A46B] shadow-[0_4px_14px_rgba(32,164,107,0.3)]' : 'bg-white text-[#304250]/60 border-[#304250]/10 hover:border-[#304250]/30 hover:bg-gray-50 shadow-sm'}`}>
                                            {isSelected && <Check size={16} strokeWidth={4} />} {p}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* STEP 3: COURIER RATES */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                            <div className="text-center mb-6">
                                <div className="w-14 h-14 bg-[#304250]/5 text-[#304250] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#304250]/10 shadow-sm">
                                    <Truck size={28} />
                                </div>
                                <h3 className="text-lg font-black text-[#304250]">Logistics Configuration</h3>
                                <p className="text-sm text-[#304250]/50 font-medium">Add couriers you use for delivery.</p>
                            </div>

                            <div className="relative" ref={dropdownRef}>
                                {customCourierMode ? (
                                    <div className="flex flex-col sm:flex-row gap-3 animate-in fade-in zoom-in-95">
                                        <div className="relative flex-1">
                                            <input autoFocus className="w-full border-2 border-[#20A46B] bg-[#20A46B]/5 p-4 rounded-xl text-sm font-bold outline-none shadow-sm text-[#304250]" placeholder="Enter Courier Name..." value={customCourierName} onChange={(e) => setCustomCourierName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addCourier(customCourierName)} />
                                            <button onClick={() => setCustomCourierMode(false)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#304250]/40 hover:text-red-500 transition-colors"><X size={20} /></button>
                                        </div>
                                        <button onClick={() => addCourier(customCourierName)} className="bg-[#20A46B] text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#20A46B]/90 shadow-[0_4px_14px_rgba(32,164,107,0.3)] transition active:scale-95">Add</button>
                                    </div>
                                ) : (
                                    <div onClick={() => setIsDropdownOpen(!isDropdownOpen)} className={`w-full border-2 p-4 rounded-xl flex justify-between items-center cursor-pointer transition-all duration-300 ${isDropdownOpen ? 'bg-white border-[#20A46B] ring-4 ring-[#20A46B]/10 shadow-md' : 'bg-gray-50 border-[#304250]/10 hover:border-[#304250]/30 shadow-sm'}`}>
                                        <span className="text-sm font-black text-[#304250] uppercase tracking-widest">+ Add New Courier Service</span>
                                        <ChevronDown size={20} className={`text-[#304250]/40 transition-transform ${isDropdownOpen ? 'rotate-180 text-[#20A46B]' : ''}`} />
                                    </div>
                                )}

                                {isDropdownOpen && !customCourierMode && (
                                    <div className="absolute top-full left-0 w-full bg-white border border-[#304250]/10 shadow-2xl rounded-2xl mt-2 z-50 overflow-hidden animate-in slide-in-from-top-2 p-2 max-h-64 overflow-y-auto custom-scrollbar">
                                        {Object.keys(DEFAULT_RATES).filter(k => k !== 'Other').map((company) => (
                                            <button key={company} onClick={() => addCourier(company)} className="w-full text-left px-5 py-4 text-sm font-black text-[#304250]/70 hover:bg-[#20A46B]/5 hover:text-[#20A46B] rounded-xl flex items-center justify-between transition-all group">
                                                <div className="flex items-center gap-3"><Truck size={18} className="text-[#304250]/20 group-hover:text-[#20A46B]" /> {company}</div>
                                                <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                            </button>
                                        ))}
                                        <div className="h-px bg-[#304250]/5 my-2 mx-2"></div>
                                        <button onClick={() => { setCustomCourierMode(true); setIsDropdownOpen(false); }}
                                            className="w-full text-left px-5 py-4 text-sm font-black text-[#EEBE1C] bg-[#EEBE1C]/5 hover:bg-[#EEBE1C]/10 rounded-xl flex items-center gap-3 transition-all">
                                            <Plus size={20} /> Other (Custom Name)
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="border border-[#304250]/10 rounded-2xl overflow-hidden shadow-sm mt-6">
                                <div className="overflow-x-auto custom-scrollbar">
                                    <div className="grid grid-cols-12 bg-gray-50/80 p-4 text-[10px] font-black text-[#304250]/40 uppercase tracking-widest border-b border-[#304250]/5 min-w-[600px]">
                                        <div className="col-span-3">Company</div>
                                        <div className="col-span-2 text-center">Same City</div>
                                        <div className="col-span-2 text-center">Same Prov</div>
                                        <div className="col-span-2 text-center">Cross Prov</div>
                                        <div className="col-span-2 text-center">Extra Kg</div>
                                        <div className="col-span-1"></div>
                                    </div>
                                    <div className="divide-y divide-[#304250]/5">
                                        {formData.courierRates.map((c: any, index: number) => (
                                            <div key={index} className="grid grid-cols-12 p-4 items-center bg-white hover:bg-gray-50/50 transition-colors min-w-[600px]">
                                                <div className="col-span-3 font-black text-sm text-[#304250]">{c.name}</div>
                                                {['sameCity', 'sameProv', 'crossProv', 'kg'].map(field => (
                                                    <div key={field} className="col-span-2 px-1 relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#304250]/30 font-bold text-[10px]">Rs</span>
                                                        <input type="number" className="w-full text-center bg-gray-50 border border-[#304250]/10 rounded-lg p-2 text-sm font-black text-[#304250] focus:bg-white focus:border-[#20A46B] outline-none transition-all shadow-inner" value={c[field]} onChange={e => updateCourierRate(index, field, e.target.value)} />
                                                    </div>
                                                ))}
                                                <div className="col-span-1 flex justify-end">
                                                    <button onClick={() => removeCourier(index)} className="w-9 h-9 flex items-center justify-center hover:bg-red-50 text-[#304250]/20 hover:text-red-500 rounded-lg transition-all active:scale-90">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {formData.courierRates.length === 0 && (
                                            <div className="p-12 text-center text-[#304250]/30 bg-gray-50/30 flex flex-col items-center">
                                                <Truck size={32} className="opacity-20 mb-2" />
                                                <p className="text-[11px] font-black uppercase tracking-widest italic">Configure your courier rates above</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: COST CONFIGURATION */}
                    {step === 4 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                            <div className="text-center">
                                <div className="w-14 h-14 bg-[#20A46B]/10 text-[#20A46B] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#20A46B]/20 shadow-sm">
                                    <DollarSign size={28} />
                                </div>
                                <h3 className="text-lg font-black text-[#304250]">Financial Settings</h3>
                                <p className="text-sm text-[#304250]/50 font-medium">Define your regular operating costs.</p>
                            </div>

                            {/* Packaging Cost */}
                            <div className="bg-[#EEBE1C]/10 p-6 rounded-[24px] border-2 border-[#EEBE1C]/30 shadow-sm">
                                <div className="flex items-start gap-4">
                                    <div className="bg-white p-3 rounded-xl text-[#c2410c] shadow-sm border border-[#EEBE1C]/20"><Package size={22} /></div>
                                    <div className="flex-1">
                                        <label className="text-sm font-black text-[#304250] uppercase tracking-wide">Packaging Cost (Per Order)</label>
                                        <p className="text-[11px] text-[#304250]/60 font-bold mt-1 uppercase tracking-tighter">Avg flyers, tape, bubble wrap expense per parcel.</p>
                                        <div className="flex items-center gap-2 mt-4">
                                            <span className="text-[#304250]/40 font-black text-sm">Rs</span>
                                            <input type="number" className="w-full sm:w-40 border-2 border-[#EEBE1C]/30 p-3 rounded-xl outline-none focus:border-[#EEBE1C] focus:bg-white font-black text-lg text-[#304250] transition-all shadow-inner" placeholder="0" value={formData.packagingCost} onChange={e => setFormData({ ...formData, packagingCost: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-px bg-[#304250]/10 flex-1"></div>
                                    <p className="text-[10px] font-black text-[#304250]/40 uppercase tracking-[0.2em] whitespace-nowrap">Fixed Monthly Expenses</p>
                                    <div className="h-px bg-[#304250]/10 flex-1"></div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    {[
                                        { label: 'Rent / Ads', key: 'monthlyRent' },
                                        { label: 'Salaries', key: 'monthlySalary' },
                                        { label: 'Hosting', key: 'monthlyHosting' },
                                        { label: 'Internet', key: 'monthlyInternet' }
                                    ].map(item => (
                                        <div key={item.key} className="space-y-2">
                                            <label className="text-[11px] font-black text-[#304250]/50 uppercase tracking-widest pl-1">{item.label}</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#304250]/30 font-bold text-xs">Rs</span>
                                                <input type="number" className="w-full border border-[#304250]/10 p-4 pl-10 rounded-xl outline-none focus:ring-2 ring-[#20A46B]/20 focus:border-[#20A46B] bg-gray-50 focus:bg-white transition-all font-bold text-[#304250] shadow-sm" placeholder="0" value={(formData as any)[item.key]} onChange={e => setFormData({ ...formData, [item.key]: e.target.value })} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                <div className="p-6 border-t border-[#304250]/5 bg-gray-50/50 flex justify-between items-center flex-col sm:flex-row gap-4 sm:gap-0">
                    {step > 1 ? (
                        <button onClick={() => setStep(step - 1)} className="text-[#304250]/50 font-black uppercase tracking-widest w-full sm:w-auto text-xs hover:text-[#304250] flex items-center justify-center gap-2 hover:bg-white px-6 py-4 rounded-xl transition-all active:scale-95 border border-transparent hover:border-[#304250]/10 shadow-sm sm:shadow-none"><ArrowLeft size={16} /> Back</button>
                    ) : <div className="hidden sm:block"></div>}

                    <button onClick={step === 4 ? handleSubmit : handleNext} disabled={loading}
                        className="w-full sm:w-auto bg-[#20A46B] justify-center text-white px-10 py-4 rounded-xl text-xs font-black uppercase tracking-[0.1em] shadow-[0_4px_14px_rgba(32,164,107,0.3)] hover:bg-[#20A46B]/90 transition-all flex items-center gap-2 disabled:opacity-50 active:scale-[0.98]">
                        {loading ? 'Setting up...' : step === 4 ? 'Finish Setup' : <>Next Step <ArrowRight size={18} /></>}
                    </button>
                </div>

            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #30425020; border-radius: 10px; }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: #30425040; }
            `}</style>
        </div>
    );
}