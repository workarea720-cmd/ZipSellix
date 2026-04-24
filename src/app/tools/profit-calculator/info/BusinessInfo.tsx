"use client";
import React, { useState, useEffect } from 'react';
import {
    Building2, MapPin, DollarSign, Edit3, Save,
    Trash2, Truck, Share2, User, CheckCircle
} from 'lucide-react';

import { API_URL, safeFetch } from '@/lib/api-client';

// Default Rates
const DEFAULT_RATES: any = {
    "PostEx": { sameCity: 100, sameProv: 165, crossProv: 201, kg: 50 },
    "Leopard": { sameCity: 150, sameProv: 180, crossProv: 220, kg: 100 },
    "TCS": { sameCity: 200, sameProv: 250, crossProv: 300, kg: 120 },
    "Trax": { sameCity: 130, sameProv: 160, crossProv: 190, kg: 90 },
    "CallCourier": { sameCity: 140, sameProv: 170, crossProv: 200, kg: 95 },
    "M&P": { sameCity: 180, sameProv: 210, crossProv: 240, kg: 110 },
    "Other": { sameCity: 0, sameProv: 0, crossProv: 0, kg: 0 }
};

// Common Platforms in Pakistan
const COMMON_PLATFORMS = ["WhatsApp", "Daraz", "Facebook", "Instagram", "Shopify", "TikTok", "Website"];

interface BusinessInfoProps {
    data: any;
    refreshData: () => void;
}

export default function BusinessInfo({ data, refreshData }: BusinessInfoProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    const profile = data?.profile || {};
    const settings = profile.settings || {};

    const [formData, setFormData] = useState({
        businessName: profile.businessName || '',
        ownerName: profile.ownerName || '',
        province: profile.province || 'Punjab',
        city: profile.city || '',

        platforms: settings.channels || [],
        courierRates: settings.courierRates || [],

        monthlyHosting: settings.monthlyHosting || 0,
        monthlyInternet: settings.monthlyInternet || 0,
        monthlyRent: settings.monthlyRent || 0,
        monthlySalary: settings.monthlySalary || 0,
        packagingCost: settings.packagingCost || 0
    });

    useEffect(() => {
        if (data?.profile) {
            const p = data.profile;
            const s = p.settings || {};
            setFormData({
                businessName: p.businessName,
                ownerName: p.ownerName,
                province: p.province || 'Punjab',
                city: p.city,
                platforms: s.channels || [],
                courierRates: s.courierRates || [],
                monthlyHosting: s.monthlyHosting || 0,
                monthlyInternet: s.monthlyInternet || 0,
                monthlyRent: s.monthlyRent || 0,
                monthlySalary: s.monthlySalary || 0,
                packagingCost: s.packagingCost || 0
            });
        }
    }, [data]);

    const totalExpense =
        Number(formData.monthlyHosting) + Number(formData.monthlyInternet) +
        Number(formData.monthlyRent) + Number(formData.monthlySalary);

    // --- HANDLERS ---
    const togglePlatform = (p: string) => {
        if (formData.platforms.includes(p)) {
            setFormData({ ...formData, platforms: formData.platforms.filter((x: string) => x !== p) });
        } else {
            setFormData({ ...formData, platforms: [...formData.platforms, p] });
        }
    };

    const addCourier = (name: string) => {
        if (formData.courierRates.some((c: any) => c.name === name)) return;
        const defaults = DEFAULT_RATES[name] || { sameCity: 0, sameProv: 0, crossProv: 0, kg: 0 };
        setFormData({
            ...formData,
            courierRates: [...formData.courierRates, {
                name, sameCity: defaults.sameCity, sameProv: defaults.sameProv, crossProv: defaults.crossProv, kg: defaults.kg
            }]
        });
    };

    const removeCourier = (index: number) => {
        const newRates = formData.courierRates.filter((_: any, i: number) => i !== index);
        setFormData({ ...formData, courierRates: newRates });
    };

    const updateCourierRate = (index: number, field: string, value: string) => {
        const newRates = [...formData.courierRates];
        (newRates[index] as any)[field] = Number(value);
        setFormData({ ...formData, courierRates: newRates });
    };

    const handleSave = async () => {
        setLoading(true);
        const payload = {
            businessName: formData.businessName,
            ownerName: formData.ownerName,
            city: formData.city,
            province: formData.province,
            businessTypes: formData.platforms,
            courierRates: formData.courierRates,
            monthlyHosting: Number(formData.monthlyHosting),
            monthlyInternet: Number(formData.monthlyInternet),
            monthlyRent: Number(formData.monthlyRent),
            monthlySalary: Number(formData.monthlySalary),
            packagingCost: Number(formData.packagingCost)
        };

        try {
            const res = await safeFetch<any>(`${API_URL}/api/business/setup`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
            });
            if (res?.success) { await refreshData(); setIsEditing(false); }
        } catch (e) { alert("Network Error"); }
        finally { setLoading(false); }
    };

    const handleDelete = async () => {
        if (!confirm("⚠️ This will DELETE your business profile and reset everything.")) return;
        await safeFetch(`${API_URL}/api/business/reset`, { method: 'DELETE' });
        window.location.reload();
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 font-sans text-[#304250] pb-10 selection:bg-[#20A46B]/20 selection:text-[#20A46B]">

            {!isEditing && (
                <div className="flex flex-col sm:flex-row justify-end gap-3">
                    <button onClick={() => setIsEditing(true)} className="flex items-center justify-center gap-2 bg-[#20A46B] text-white px-5 py-3 sm:py-2.5 min-h-[48px] sm:min-h-0 rounded-xl text-base sm:text-sm font-extrabold hover:bg-[#20A46B]/90 shadow-[0_4px_14px_rgba(32,164,107,0.3)] transition-all duration-200 active:scale-95 w-full sm:w-auto">
                        <Edit3 size={18} className="sm:w-[16px] sm:h-[16px]" /> Edit Settings
                    </button>
                    <button onClick={handleDelete} className="flex items-center justify-center gap-2 bg-white border border-red-200 text-red-600 px-5 py-3 sm:py-2.5 min-h-[48px] sm:min-h-0 rounded-xl text-base sm:text-sm font-extrabold hover:bg-red-50 transition-all duration-200 active:scale-95 w-full sm:w-auto shadow-sm">
                        <Trash2 size={18} className="sm:w-[16px] sm:h-[16px]" /> Delete
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* 1. BUSINESS PROFILE */}
                <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgba(48,66,80,0.04)] border border-[#304250]/10">
                    <div className="flex items-center gap-3 mb-6 border-b border-[#304250]/5 pb-4">
                        <div className="w-10 h-10 rounded-full bg-[#20A46B]/10 text-[#20A46B] flex items-center justify-center border border-[#20A46B]/20 shadow-sm"><Building2 size={20} /></div>
                        <h3 className="text-lg font-black text-[#304250]">Business Profile</h3>
                    </div>

                    <div className="space-y-4">
                        {/* Owner Name */}
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2.5 hover:bg-gray-50 rounded-xl gap-2 sm:gap-0 transition-colors">
                            <span className="text-sm text-[#304250]/60 font-bold flex items-center gap-2"><User size={16} className="text-[#304250]/40" /> Owner Name</span>
                            {isEditing ? <input className="w-full sm:w-48 border border-[#304250]/10 p-2 sm:p-2.5 text-base sm:text-sm sm:text-right rounded-lg font-bold outline-none focus:ring-1 ring-[#20A46B]/20 focus:border-[#20A46B] min-h-[48px] sm:min-h-0 bg-white shadow-sm transition-all" value={formData.ownerName} onChange={e => setFormData({ ...formData, ownerName: e.target.value })} />
                                : <span className="font-extrabold text-[#304250]">{formData.ownerName || '—'}</span>}
                        </div>

                        {/* Business Name */}
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2.5 hover:bg-gray-50 rounded-xl gap-2 sm:gap-0 transition-colors">
                            <span className="text-sm text-[#304250]/60 font-bold flex items-center gap-2"><Building2 size={16} className="text-[#304250]/40" /> Business Name</span>
                            {isEditing ? <input className="w-full sm:w-48 border border-[#304250]/10 p-2 sm:p-2.5 text-base sm:text-sm sm:text-right rounded-lg font-bold outline-none focus:ring-1 ring-[#20A46B]/20 focus:border-[#20A46B] min-h-[48px] sm:min-h-0 bg-white shadow-sm transition-all" value={formData.businessName} onChange={e => setFormData({ ...formData, businessName: e.target.value })} />
                                : <span className="font-extrabold text-[#304250]">{formData.businessName || '—'}</span>}
                        </div>

                        {/* Location */}
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2.5 hover:bg-gray-50 rounded-xl gap-2 sm:gap-0 transition-colors">
                            <span className="text-sm text-[#304250]/60 font-bold flex items-center gap-2"><MapPin size={16} className="text-[#304250]/40" /> Location</span>
                            {isEditing ? (
                                <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                                    <input className="w-full sm:w-28 border border-[#304250]/10 p-2 sm:p-2.5 rounded-lg text-base sm:text-sm sm:text-right font-bold outline-none focus:ring-1 ring-[#20A46B]/20 focus:border-[#20A46B] min-h-[48px] sm:min-h-0 bg-white shadow-sm transition-all" placeholder="City" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                                    <select className="w-full sm:w-32 border border-[#304250]/10 p-2 sm:p-2.5 rounded-lg text-base sm:text-sm font-bold bg-white outline-none focus:ring-1 ring-[#20A46B]/20 focus:border-[#20A46B] min-h-[48px] sm:min-h-0 shadow-sm transition-all" value={formData.province} onChange={e => setFormData({ ...formData, province: e.target.value })}>
                                        <option>Punjab</option><option>Sindh</option><option>KPK</option><option>Balochistan</option><option>Islamabad</option><option>AJK</option>
                                    </select>
                                </div>
                            ) : <span className="font-extrabold text-[#304250]">{formData.city ? `${formData.city}, ` : ''}{formData.province || '—'}</span>}
                        </div>
                    </div>
                </div>

                {/* 2. ACTIVE PLATFORMS (NEW BOX) */}
                <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgba(48,66,80,0.04)] border border-[#304250]/10">
                    <div className="flex items-center gap-3 mb-6 border-b border-[#304250]/5 pb-4">
                        <div className="w-10 h-10 rounded-full bg-[#EEBE1C]/10 text-[#304250] border border-[#EEBE1C]/30 flex items-center justify-center shadow-sm"><Share2 size={18} /></div>
                        <h3 className="text-lg font-black text-[#304250]">Sales Channels</h3>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {isEditing ? (
                            COMMON_PLATFORMS.map(p => (
                                <button
                                    key={p}
                                    onClick={() => togglePlatform(p)}
                                    className={`px-4 py-2.5 sm:px-3.5 sm:py-2 min-h-[40px] sm:min-h-0 rounded-xl text-base sm:text-sm font-extrabold border flex items-center gap-2 transition-all shadow-sm active:scale-95 ${formData.platforms.includes(p) ? 'bg-[#20A46B] text-white border-[#20A46B] shadow-[0_4px_14px_rgba(32,164,107,0.3)]' : 'bg-white text-[#304250]/60 border-[#304250]/10 hover:bg-gray-50 hover:text-[#304250]'}`}
                                >
                                    {formData.platforms.includes(p) && <CheckCircle size={16} />} {p}
                                </button>
                            ))
                        ) : (
                            formData.platforms.length > 0 ? formData.platforms.map((p: string) => (
                                <span key={p} className="px-3.5 py-2 bg-gray-50 text-[#304250] font-black text-xs rounded-xl border border-[#304250]/10 mb-1 shadow-sm">
                                    {p}
                                </span>
                            )) : <p className="text-sm font-bold text-[#304250]/40 italic">No platforms selected.</p>
                        )}
                    </div>
                </div>

                {/* 3. COURIER RATES */}
                <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgba(48,66,80,0.04)] border border-[#304250]/10 md:col-span-2">
                    <div className="flex items-center gap-3 mb-6 border-b border-[#304250]/5 pb-4">
                        <div className="w-10 h-10 rounded-full bg-[#304250]/5 text-[#304250] flex items-center justify-center border border-[#304250]/10 shadow-sm"><Truck size={20} /></div>
                        <h3 className="text-lg font-black text-[#304250]">Courier Rate Configuration</h3>
                    </div>

                    {isEditing && (
                        <div className="mb-5">
                            <select className="w-full md:w-64 border border-[#304250]/10 p-3.5 sm:p-2.5 min-h-[48px] sm:min-h-0 rounded-xl text-base sm:text-sm font-bold bg-white outline-none focus:ring-1 ring-[#20A46B]/20 focus:border-[#20A46B] shadow-sm transition-all text-[#304250]" onChange={(e) => { addCourier(e.target.value); e.target.value = ''; }}>
                                <option value="">+ Add Courier Company</option>
                                {Object.keys(DEFAULT_RATES).map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    )}

                    <div className="space-y-3 overflow-x-auto custom-scrollbar pb-2">
                        <div className="grid grid-cols-12 gap-2 text-[10px] uppercase font-extrabold text-[#304250]/40 tracking-widest px-2 min-w-[600px] mb-2">
                            <div className="col-span-2">Company</div>
                            <div className="col-span-2 text-center">Same City</div>
                            <div className="col-span-2 text-center">Same Prov</div>
                            <div className="col-span-2 text-center">Cross Prov</div>
                            <div className="col-span-2 text-center">Extra /Kg</div>
                            <div className="col-span-2"></div>
                        </div>

                        {formData.courierRates.map((c: any, index: number) => (
                            <div key={index} className="grid grid-cols-12 gap-2 items-center bg-gray-50 p-3 rounded-xl border border-[#304250]/5 min-w-[600px] hover:border-[#304250]/20 transition-colors shadow-sm">
                                <div className="col-span-2 font-black text-sm text-[#304250] pl-2">{c.name}</div>
                                {isEditing ? (
                                    <>
                                        <div className="col-span-2 px-1"><input type="number" className="w-full text-center border border-[#304250]/10 rounded-lg p-2.5 sm:p-2 text-base sm:text-sm min-h-[44px] sm:min-h-0 font-bold text-[#304250] outline-none focus:ring-1 ring-[#20A46B]/20 focus:border-[#20A46B] shadow-inner transition-all" value={c.sameCity} onChange={e => updateCourierRate(index, 'sameCity', e.target.value)} /></div>
                                        <div className="col-span-2 px-1"><input type="number" className="w-full text-center border border-[#304250]/10 rounded-lg p-2.5 sm:p-2 text-base sm:text-sm min-h-[44px] sm:min-h-0 font-bold text-[#304250] outline-none focus:ring-1 ring-[#20A46B]/20 focus:border-[#20A46B] shadow-inner transition-all" value={c.sameProv} onChange={e => updateCourierRate(index, 'sameProv', e.target.value)} /></div>
                                        <div className="col-span-2 px-1"><input type="number" className="w-full text-center border border-[#304250]/10 rounded-lg p-2.5 sm:p-2 text-base sm:text-sm min-h-[44px] sm:min-h-0 font-bold text-[#304250] outline-none focus:ring-1 ring-[#20A46B]/20 focus:border-[#20A46B] shadow-inner transition-all" value={c.crossProv} onChange={e => updateCourierRate(index, 'crossProv', e.target.value)} /></div>
                                        <div className="col-span-2 px-1"><input type="number" className="w-full text-center border border-[#304250]/10 rounded-lg p-2.5 sm:p-2 text-base sm:text-sm min-h-[44px] sm:min-h-0 font-bold text-[#304250] outline-none focus:ring-1 ring-[#20A46B]/20 focus:border-[#20A46B] shadow-inner transition-all" value={c.kg} onChange={e => updateCourierRate(index, 'kg', e.target.value)} /></div>
                                        <div className="col-span-2 text-right"><button onClick={() => removeCourier(index)} className="p-2.5 sm:p-2 min-w-[44px] sm:min-w-0 bg-white border border-red-100 hover:bg-red-50 text-red-500 rounded-lg flex justify-center items-center ml-auto shadow-sm active:scale-95 transition-all"><Trash2 size={16} className="sm:w-[14px] sm:h-[14px]" /></button></div>
                                    </>
                                ) : (
                                    <>
                                        <div className="col-span-2 text-center font-extrabold text-[#304250]">Rs {c.sameCity}</div>
                                        <div className="col-span-2 text-center font-extrabold text-[#304250]">Rs {c.sameProv}</div>
                                        <div className="col-span-2 text-center font-extrabold text-[#304250]">Rs {c.crossProv}</div>
                                        <div className="col-span-2 text-center font-bold text-[#304250]/50 text-xs">+ {c.kg}/kg</div>
                                        <div className="col-span-2"></div>
                                    </>
                                )}
                            </div>
                        ))}
                        {formData.courierRates.length === 0 && <p className="text-[11px] font-bold text-[#304250]/40 text-center py-6 bg-gray-50 rounded-xl border border-dashed border-[#304250]/10 uppercase tracking-widest">No courier rates configured.</p>}
                    </div>
                </div>

                {/* 4. FIXED COSTS */}
                <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgba(48,66,80,0.04)] border border-[#304250]/10 md:col-span-2">
                    <div className="flex items-center gap-3 mb-6 border-b border-[#304250]/5 pb-4">
                        <div className="w-10 h-10 rounded-full bg-[#20A46B]/10 text-[#20A46B] flex items-center justify-center border border-[#20A46B]/20 shadow-sm"><DollarSign size={20} /></div>
                        <h3 className="text-lg font-black text-[#304250]">Fixed Monthly Costs</h3>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 bg-[#EEBE1C]/10 rounded-xl mb-6 border border-[#EEBE1C]/30 gap-3 sm:gap-0 shadow-sm">
                        <span className="text-sm font-extrabold text-[#304250]">Packaging Cost (Per Order)</span>
                        {isEditing ? <input type="number" className="w-full sm:w-32 border border-[#EEBE1C]/50 p-2.5 sm:p-2 text-base sm:text-sm sm:text-right rounded-lg font-bold text-[#304250] outline-none focus:border-[#EEBE1C] focus:ring-1 ring-[#EEBE1C]/30 min-h-[48px] sm:min-h-0 bg-white shadow-inner transition-all" value={formData.packagingCost} onChange={e => setFormData({ ...formData, packagingCost: Number(e.target.value) })} /> : <span className="font-black text-lg text-[#304250]">Rs {formData.packagingCost}</span>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { l: 'Hosting', k: 'monthlyHosting' }, { l: 'Internet', k: 'monthlyInternet' },
                            { l: 'Rent / Ads', k: 'monthlyRent' }, { l: 'Salaries', k: 'monthlySalary' }
                        ].map((i: any) => (
                            <div key={i.k} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-gray-50 border border-[#304250]/5 hover:border-[#304250]/10 hover:shadow-sm rounded-xl gap-2 sm:gap-0 transition-all">
                                <span className="text-sm font-bold text-[#304250]/60">{i.l}</span>
                                {isEditing ? (
                                    <input type="number" className="w-full sm:w-32 border border-[#304250]/10 p-2.5 sm:p-2 text-base sm:text-sm sm:text-right rounded-lg font-bold text-[#304250] outline-none focus:ring-1 ring-[#20A46B]/20 focus:border-[#20A46B] min-h-[48px] sm:min-h-0 bg-white shadow-inner transition-all" value={(formData as any)[i.k]} onChange={e => setFormData({ ...formData, [i.k]: e.target.value })} />
                                ) : <span className="font-extrabold text-[#304250]">Rs {Number((formData as any)[i.k]).toLocaleString()}</span>}
                            </div>
                        ))}
                    </div>
                    <div className="pt-4 border-t border-[#304250]/10 mt-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 bg-gray-50 p-4 rounded-xl">
                        <span className="text-xs font-extrabold uppercase tracking-widest text-[#304250]/60">Total Fixed Monthly</span>
                        <span className="text-2xl font-black text-[#20A46B]">Rs {totalExpense.toLocaleString()}</span>
                    </div>
                </div>

            </div>

            {isEditing && (
                <div className="fixed bottom-6 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:right-auto bg-white p-4 rounded-2xl shadow-[0_20px_60px_rgba(48,66,80,0.15)] border border-[#304250]/10 flex flex-col sm:flex-row gap-3 sm:gap-4 z-50 animate-in slide-in-from-bottom-10">
                    <button onClick={() => setIsEditing(false)} className="w-full sm:w-auto min-h-[48px] sm:min-h-0 px-8 py-3 sm:py-2.5 bg-gray-100 text-[#304250]/60 rounded-xl font-bold text-base sm:text-sm hover:bg-gray-200 hover:text-[#304250] transition-colors active:scale-95">Cancel</button>
                    <button onClick={handleSave} className="w-full sm:w-auto min-h-[48px] sm:min-h-0 px-8 py-3 sm:py-2.5 bg-[#20A46B] text-white rounded-xl font-extrabold text-base sm:text-sm shadow-[0_4px_14px_rgba(32,164,107,0.3)] hover:bg-[#20A46B]/90 flex justify-center gap-2 items-center transition-all active:scale-[0.98]">
                        {loading ? 'Saving...' : <><Save size={18} className="sm:w-[16px] sm:h-[16px]" /> Save Changes</>}
                    </button>
                </div>
            )}

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #30425020; border-radius: 10px; }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: #30425040; }
            `}</style>
        </div>
    );
}