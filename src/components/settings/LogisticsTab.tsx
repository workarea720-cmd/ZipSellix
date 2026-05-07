'use client';
// src/components/settings/LogisticsTab.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Truck, Plus, ChevronDown, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useBusinessStore, COURIER_NAMES, COURIER_PRESETS, type CourierRate } from '@/store/business-store';
import { SettingsCard, SaveButton, tabVariants } from '@/components/settings/shared';

export default function LogisticsTab() {
    const store = useBusinessStore();
    const [saving, setSaving] = useState(false);
    const [localCouriers, setLocalCouriers] = useState<CourierRate[]>(store.couriers);
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [customName, setCustomName] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const customInputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => { setLocalCouriers(store.couriers); }, [store.couriers]);
    useEffect(() => { if (showCustomInput && customInputRef.current) customInputRef.current.focus(); }, [showCustomInput]);
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsDropdownOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const addCourier = (name: string) => {
        const clean = name.trim();
        if (!clean) return;
        if (localCouriers.some(c => c.courierName.toLowerCase() === clean.toLowerCase())) {
            toast.error('Courier already exists'); return;
        }
        const preset = COURIER_PRESETS[clean] || { sameCity: 0, sameProvince: 0, crossProvince: 0, extraKg: 0, codFeePercent: 0 };
        setLocalCouriers(prev => [...prev, { courierName: clean, ...preset }]);
    };

    const handleCustomCourierAdd = () => {
        if (!customName.trim()) return;
        addCourier(customName);
        setCustomName(''); setShowCustomInput(false);
    };

    const removeCourier = (i: number) => setLocalCouriers(localCouriers.filter((_, idx) => idx !== i));
    const updateRate = (i: number, field: keyof CourierRate, val: string) =>
        setLocalCouriers(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: Number(val) } : c));

    const onSave = async () => {
        setSaving(true);
        store.setCouriers(localCouriers);
        await store.saveProfile();
        await new Promise(r => setTimeout(r, 500));
        setSaving(false);
        toast.success('Courier rates saved');
    };

    const availableCouriers = COURIER_NAMES.filter(
        c => c !== 'Other' && !localCouriers.some(r => r.courierName.toLowerCase() === c.toLowerCase())
    );

    return (
        <motion.div variants={tabVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
            <SettingsCard title="Courier Rate Configuration" description="Manage delivery companies and their shipping rates."
                footer={<SaveButton onClick={onSave} saving={saving} disabled={JSON.stringify(localCouriers) === JSON.stringify(store.couriers)} />}>

                {/* Add Courier Controls */}
                <div className="flex flex-col sm:flex-row sm:items-start gap-3 mb-6 sm:mb-8 w-full relative z-30">
                    <div className="relative w-full sm:w-auto" ref={dropdownRef}>
                        <button type="button" onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="w-full sm:w-64 bg-[#304250] text-white py-3 sm:py-2.5 px-4 rounded-xl text-sm font-bold flex items-center justify-between gap-2 shadow-[0_4px_14px_rgba(48,66,80,0.3)] hover:bg-[#304250]/90 transition-all active:scale-[0.98]">
                            <span className="flex items-center gap-2"><Plus size={16} /> Add Courier</span>
                            <ChevronDown size={16} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                            {isDropdownOpen && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                    className="absolute top-full left-0 mt-2 w-full sm:w-64 bg-white border border-[#304250]/10 rounded-xl shadow-xl z-50 overflow-hidden max-h-[50vh] sm:max-h-none flex flex-col">
                                    <div className="overflow-y-auto custom-scrollbar">
                                        {availableCouriers.map(name => (
                                            <div key={name} onClick={() => { addCourier(name); setIsDropdownOpen(false); setShowCustomInput(false); }}
                                                className="px-5 py-3 text-sm font-bold cursor-pointer transition-colors text-[#304250] hover:bg-[#20A46B]/5 hover:text-[#20A46B]">
                                                {name}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="border-t border-[#304250]/10 shrink-0" />
                                    <div onClick={() => { setShowCustomInput(true); setIsDropdownOpen(false); }}
                                        className="px-5 py-3 text-sm font-black cursor-pointer transition-colors text-[#20A46B] bg-[#20A46B]/5 hover:bg-[#20A46B]/10 flex items-center gap-2 shrink-0 whitespace-nowrap">
                                        <Plus size={16} className="shrink-0" /> Other (Custom Name)
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    {showCustomInput && (
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 w-full sm:w-auto">
                            <input ref={customInputRef} type="text" placeholder="Courier Name" value={customName} onChange={e => setCustomName(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleCustomCourierAdd(); if (e.key === 'Escape') { setShowCustomInput(false); setCustomName(''); } }}
                                className="px-4 py-3 sm:py-2.5 border-2 border-[#20A46B] bg-[#20A46B]/5 text-[#304250] rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-[#20A46B]/20 w-full sm:w-48 transition-all" />
                            <button onClick={handleCustomCourierAdd} className="px-4 py-3 sm:py-2.5 bg-[#20A46B] text-white rounded-xl text-sm font-bold hover:bg-[#20A46B]/90 transition-all shadow-sm active:scale-95 shrink-0">Add</button>
                            <button onClick={() => { setShowCustomInput(false); setCustomName(''); }} className="p-3 sm:p-2.5 text-[#304250]/40 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors shrink-0"><X size={20} /></button>
                        </motion.div>
                    )}
                </div>

                {/* Courier List */}
                {localCouriers.length > 0 ? (
                    <div className="space-y-4">
                        <div className="hidden md:grid grid-cols-14 gap-4 text-[11px] uppercase font-black text-[#304250]/50 px-4 pb-2 border-b border-[#304250]/10 tracking-wider">
                            <div className="col-span-3">Company</div>
                            <div className="col-span-2 text-center">Same City</div>
                            <div className="col-span-2 text-center">Same Prov</div>
                            <div className="col-span-2 text-center">Cross Prov</div>
                            <div className="col-span-2 text-center">Extra /Kg</div>
                            <div className="col-span-2 text-center">COD Fee %</div>
                            <div className="col-span-1"></div>
                        </div>
                        {localCouriers.map((c, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                className="bg-white rounded-xl border border-[#304250]/10 overflow-hidden hover:border-[#304250]/30 transition-colors shadow-sm w-full">
                                {/* Desktop */}
                                <div className="hidden md:grid grid-cols-14 gap-4 items-center p-4">
                                    <div className="col-span-3 font-black text-base text-[#304250] truncate pl-2">{c.courierName}</div>
                                    {(['sameCity', 'sameProvince', 'crossProvince', 'extraKg', 'codFeePercent'] as const).map(field => (
                                        <div key={field} className="col-span-2 relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#304250]/40 font-bold text-xs">{field === 'codFeePercent' ? '%' : 'Rs'}</span>
                                            <input type="number" min={0} step={field === 'codFeePercent' ? 0.1 : 1} value={c[field]} onChange={e => updateRate(i, field, e.target.value)}
                                                className="w-full pl-9 pr-3 py-2.5 text-sm font-bold text-[#304250] border border-[#304250]/10 rounded-lg outline-none focus:ring-2 focus:ring-[#20A46B]/20 focus:border-[#20A46B] transition-all bg-gray-50/50 hover:bg-white" />
                                        </div>
                                    ))}
                                    <div className="col-span-1 flex justify-center">
                                        <button onClick={() => removeCourier(i)} className="p-2.5 hover:bg-rose-50 text-[#304250]/40 hover:text-rose-600 rounded-lg transition-colors"><Trash2 size={18} /></button>
                                    </div>
                                </div>
                                {/* Mobile */}
                                <div className="md:hidden p-4 space-y-4">
                                    <div className="flex justify-between items-center border-b border-[#304250]/10 pb-3">
                                        <div className="font-black text-base text-[#304250] truncate flex items-center gap-2">
                                            <Truck size={16} className="text-[#20A46B]" /> {c.courierName}
                                        </div>
                                        <button onClick={() => removeCourier(i)} className="p-2 bg-rose-50 text-rose-500 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {(['sameCity', 'sameProvince', 'crossProvince', 'extraKg', 'codFeePercent'] as const).map(field => {
                                            const labels = { sameCity: 'Same City', sameProvince: 'Same Province', crossProvince: 'Cross Province', extraKg: 'Extra /Kg', codFeePercent: 'COD Fee %' };
                                            return (
                                                <div key={field} className="space-y-1">
                                                    <label className="text-[10px] font-bold text-[#304250]/60 uppercase tracking-wider">{labels[field]}</label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#304250]/40 font-bold text-xs">{field === 'codFeePercent' ? '%' : 'Rs'}</span>
                                                        <input type="number" min={0} step={field === 'codFeePercent' ? 0.1 : 1} value={c[field]} onChange={e => updateRate(i, field, e.target.value)}
                                                            className="w-full pl-8 pr-2 py-2.5 text-sm font-bold text-[#304250] border border-[#304250]/10 rounded-lg outline-none focus:ring-2 focus:ring-[#20A46B]/20 focus:border-[#20A46B] transition-all bg-gray-50/50" />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="py-12 flex flex-col items-center justify-center text-center bg-gray-50/50 rounded-2xl border border-dashed border-[#304250]/20 w-full">
                        <Truck size={48} className="text-[#304250]/20 mb-4" />
                        <h4 className="text-lg font-bold text-[#304250]">No Couriers Added</h4>
                        <p className="text-sm text-[#304250]/60 mt-1 max-w-sm px-4 font-medium">Add your courier partners above to start configuring shipping rates.</p>
                    </div>
                )}
            </SettingsCard>
        </motion.div>
    );
}
