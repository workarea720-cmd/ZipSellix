"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
    User, Building2, Truck, DollarSign, FileText, ArrowLeft, Save, Loader2,
    Upload, Trash2, Download, Check, Share2, Lock, AlertTriangle, X, ChevronDown, Plus, Blocks,
    Facebook, Instagram, MessageCircle, ShoppingBag, ShoppingCart, Globe, Music, LayoutTemplate
} from 'lucide-react';
import CustomDropdown from '@/components/CustomDropdown';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
    useBusinessStore, PROVINCES, SALES_CHANNEL_OPTIONS,
    COURIER_NAMES, COURIER_PRESETS, type CourierRate
} from '@/store/business-store';

// ─── Animations
const tabVariants: Variants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] as const } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
};

// ─── Vercel-Style Card Component (Mobile Optimized & Brand Aligned)
function SettingsCard({ title, description, children, footer, danger = false }: {
    title: string; description?: string; children: React.ReactNode; footer?: React.ReactNode; danger?: boolean;
}) {
    return (
        // FIX: Removed overflow-hidden from here so the dropdown can overlap outside the card
        <div className={`bg-white border rounded-2xl shadow-[0_8px_30px_rgba(48,66,80,0.04)] transition-shadow hover:shadow-[0_8px_30px_rgba(48,66,80,0.08)] w-full ${danger ? 'border-red-200' : 'border-[#304250]/10'}`}>
            <div className="px-4 sm:px-6 pt-5 sm:pt-6 pb-4 sm:pb-5">
                <h3 className={`text-base sm:text-lg font-extrabold tracking-tight ${danger ? 'text-red-600' : 'text-[#304250]'}`}>{title}</h3>
                {description && <p className={`text-xs sm:text-sm mt-1 font-medium ${danger ? 'text-red-500/80' : 'text-[#304250]/60'}`}>{description}</p>}
                <div className="mt-5 sm:mt-6 relative z-10">{children}</div>
            </div>
            {footer && (
                <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50/50 border-t border-[#304250]/5 flex flex-col sm:flex-row justify-end rounded-b-2xl">
                    {footer}
                </div>
            )}
        </div>
    );
}

// ─── Save Button Component
function SaveButton({ onClick, saving, title = "Save Changes", disabled = false }: { onClick?: () => void; saving: boolean; title?: string; disabled?: boolean }) {
    const isDisabled = saving || disabled;
    return (
        <button onClick={onClick} disabled={isDisabled} type={onClick ? 'button' : 'submit'}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 text-sm font-bold rounded-xl transition-all duration-300 shadow-sm active:scale-[0.98] ${isDisabled && !saving
                ? 'bg-gray-100 text-[#304250]/40 cursor-not-allowed shadow-none border border-[#304250]/10'
                : 'text-white bg-[#20A46B] hover:bg-[#20A46B]/90 disabled:opacity-50 hover:shadow-[0_4px_14px_0_rgba(32,164,107,0.3)]'
                }`}>
            {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> {title}</>}
        </button>
    );
}

// ─── Tab Configuration
const TABS = [
    { id: 'general', label: 'Personal Info', icon: User },
    { id: 'business', label: 'Business Identity', icon: Building2 },
    { id: 'logistics', label: 'Logistics', icon: Truck },
    { id: 'financials', label: 'Financials', icon: DollarSign },
    { id: 'integrations', label: 'Integrations', icon: Blocks },
    { id: 'documents', label: 'Documents', icon: FileText },
];

// ─── Form Schemas
const passwordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Please confirm your password'),
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type PasswordForm = z.infer<typeof passwordSchema>;

// ─── Main SettingsClient ─────────────────────────────────────────────
// ── Tab 1: General ────────────────────────────────────────────────
const GeneralTab = () => {
    const store = useBusinessStore();
    const { data: session } = useSession();
    const [saving, setSaving] = useState(false);
    const { register, handleSubmit, reset, formState: { isDirty } } = useForm({
        defaultValues: { name: store.account.name, email: session?.user?.email || store.account.email },
    });
    useEffect(() => { reset({ name: store.account.name, email: session?.user?.email || store.account.email }); }, [store.account, session]);

    const onSave = handleSubmit(async (data) => {
        setSaving(true);
        store.setAccount(data);
        await new Promise(r => setTimeout(r, 600));
        setSaving(false);
        toast.success('Account updated successfully');
    });

    const [pwdSaving, setPwdSaving] = useState(false);
    const [showPwdForm, setShowPwdForm] = useState(false);
    const { register: registerPwd, handleSubmit: handlePwdSubmit, formState: { errors: pwdErrors }, reset: resetPwd } = useForm<PasswordForm>({
        resolver: zodResolver(passwordSchema)
    });

    const onPwdSubmit = async (data: PasswordForm) => {
        setPwdSaving(true);
        await new Promise(r => setTimeout(r, 1000));
        setPwdSaving(false);
        toast.success('Password updated successfully!');
        resetPwd();
        setShowPwdForm(false);
    };

    return (
        <motion.div variants={tabVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
            <SettingsCard title="Personal Information" description="Your profile details."
                footer={<SaveButton onClick={onSave} saving={saving} disabled={!isDirty} />}>
                <div className="space-y-5 max-w-md w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
                        <label className="group relative cursor-pointer w-20 h-20 rounded-full bg-gray-50 border-2 border-dashed border-[#304250]/20 flex items-center justify-center overflow-hidden hover:border-[#20A46B] transition-all duration-300 mx-auto sm:mx-0 shrink-0">
                            <input type="file" accept="image/*" className="hidden" onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) { const r = new FileReader(); r.onloadend = () => store.setAccount({ avatar: r.result as string }); r.readAsDataURL(file); }
                            }} />
                            {store.account.avatar
                                ? <img src={store.account.avatar} alt="Avatar" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                : <User size={28} className="text-[#304250]/30 group-hover:scale-110 transition-transform duration-300 group-hover:text-[#20A46B]" />
                            }
                        </label>
                        <div className="text-center sm:text-left">
                            <p className="text-sm font-bold text-[#304250]">Profile Photo</p>
                            <p className="text-xs text-[#304250]/50 mt-0.5 font-medium">Click to upload. JPG, PNG.</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[#304250]/70 uppercase tracking-wider">Full Name</label>
                        <input {...register('name')} placeholder="Ali Khan" className="w-full px-4 py-3 sm:py-2.5 bg-gray-50/50 border border-[#304250]/10 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#20A46B]/20 focus:border-[#20A46B] hover:bg-gray-50 transition-all duration-200 text-[#304250]" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[#304250]/70 uppercase tracking-wider">Email Address</label>
                        <input {...register('email')} type="email" placeholder="you@example.com" className="w-full px-4 py-3 sm:py-2.5 bg-[#304250]/5 border border-[#304250]/10 rounded-xl text-sm font-medium outline-none text-[#304250]/50 cursor-not-allowed transition-all duration-200" readOnly disabled />
                        {/* 10% Yellow Accent used here */}
                        <p className="text-[10px] font-bold text-[#EEBE1C] flex items-center gap-1 mt-1"><Lock size={10} /> Email cannot be changed.</p>
                    </div>
                </div>
            </SettingsCard>

            <SettingsCard title="Security" description="Manage authentication and account safety.">
                {!showPwdForm ? (
                    <button onClick={() => setShowPwdForm(true)} className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-2 px-5 py-3 bg-white text-[#304250] border border-[#304250]/10 rounded-xl text-sm font-bold hover:bg-gray-50 hover:border-[#304250]/30 transition-all duration-200 active:scale-95 shadow-sm">
                        <Lock size={16} className="text-[#304250]/40" /> Change Password
                    </button>
                ) : (
                    <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} onSubmit={handlePwdSubmit(onPwdSubmit)} className="space-y-5 max-w-md mt-2 w-full">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[#304250]/70 uppercase tracking-wider">Current Password</label>
                            <input type="password" {...registerPwd('currentPassword')} className="w-full px-4 py-3 sm:py-2.5 bg-gray-50/50 border border-[#304250]/10 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#20A46B]/20 focus:border-[#20A46B] transition-all duration-200 text-[#304250]" />
                            {pwdErrors.currentPassword && <p className="text-[10px] font-bold text-red-500 mt-1">{pwdErrors.currentPassword.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[#304250]/70 uppercase tracking-wider">New Password</label>
                            <input type="password" {...registerPwd('newPassword')} className="w-full px-4 py-3 sm:py-2.5 bg-gray-50/50 border border-[#304250]/10 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#20A46B]/20 focus:border-[#20A46B] transition-all duration-200 text-[#304250]" />
                            {pwdErrors.newPassword && <p className="text-[10px] font-bold text-red-500 mt-1">{pwdErrors.newPassword.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[#304250]/70 uppercase tracking-wider">Confirm Password</label>
                            <input type="password" {...registerPwd('confirmPassword')} className="w-full px-4 py-3 sm:py-2.5 bg-gray-50/50 border border-[#304250]/10 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#20A46B]/20 focus:border-[#20A46B] transition-all duration-200 text-[#304250]" />
                            {pwdErrors.confirmPassword && <p className="text-[10px] font-bold text-red-500 mt-1">{pwdErrors.confirmPassword.message}</p>}
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 w-full">
                            <SaveButton saving={pwdSaving} title="Update Password" />
                            <button type="button" onClick={() => { setShowPwdForm(false); resetPwd(); }} className="w-full sm:w-auto px-5 py-3 sm:py-2.5 text-sm font-bold text-[#304250]/60 hover:text-[#304250] bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors active:scale-95 border border-transparent">Cancel</button>
                        </div>
                    </motion.form>
                )}
            </SettingsCard>
        </motion.div>
    );
};

// ── Tab 2: Business Profile ───────────────────────────────────────
const BusinessTab = () => {
    const store = useBusinessStore();
    const [saving, setSaving] = useState(false);
    const { register, handleSubmit, reset, watch, setValue, formState: { isDirty } } = useForm({
        defaultValues: {
            businessName: store.businessInfo.businessName,
            phone: store.businessInfo.phone,
            address: store.businessInfo.address,
            city: store.businessInfo.city,
            province: store.businessInfo.province,
        },
    });
    const provinceValue = watch('province');
    useEffect(() => { reset({ businessName: store.businessInfo.businessName, phone: store.businessInfo.phone, address: store.businessInfo.address, city: store.businessInfo.city, province: store.businessInfo.province }); }, [store.businessInfo]);

    const [channels, setChannels] = useState(store.salesChannels);
    const [channelsSaving, setChannelsSaving] = useState(false);

    const onSaveBiz = handleSubmit(async (data) => {
        setSaving(true);
        store.setBusinessInfo(data);
        await store.saveProfile();
        await new Promise(r => setTimeout(r, 600));
        setSaving(false);
        toast.success('Business identity saved');
    });

    const onSaveChannels = async () => {
        setChannelsSaving(true);
        store.setSalesChannels(channels);
        await store.saveProfile();
        await new Promise(r => setTimeout(r, 600));
        setChannelsSaving(false);
        toast.success('Sales channels updated');
    };

    const toggleCh = (ch: string) => setChannels(prev => prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch]);

    return (
        <motion.div variants={tabVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
            <SettingsCard title="Store Logo" description="Appears on invoices, shipping labels, and packing slips.">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 w-full">
                    <label className="cursor-pointer w-24 h-24 rounded-2xl bg-gray-50 border-2 border-dashed border-[#304250]/20 flex flex-col items-center justify-center overflow-hidden hover:border-[#20A46B] hover:bg-[#20A46B]/5 transition-all duration-300 group shadow-sm shrink-0">
                        <input type="file" accept="image/*" className="hidden" onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) { const r = new FileReader(); r.onloadend = () => { store.setBusinessInfo({ logo: r.result as string }); toast.success('Logo uploaded'); }; r.readAsDataURL(file); }
                        }} />
                        {store.businessInfo.logo
                            ? <img src={store.businessInfo.logo} alt="Logo" className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500" />
                            : <div className="flex flex-col items-center transform group-hover:-translate-y-1 transition-transform duration-300">
                                <Upload size={24} className="text-[#304250]/30 group-hover:text-[#20A46B] transition-colors mb-1" />
                                <span className="text-[10px] font-bold text-[#304250]/40 group-hover:text-[#20A46B] uppercase tracking-wider">Upload</span>
                            </div>
                        }
                    </label>
                    {store.businessInfo.logo && (
                        <button onClick={() => { store.setBusinessInfo({ logo: null }); toast.success('Logo removed'); }}
                            className="text-xs text-red-500 hover:text-white font-bold flex items-center justify-center sm:justify-start gap-1.5 px-4 py-2.5 rounded-xl hover:bg-red-500 transition-colors w-full sm:w-auto mt-2 sm:mt-0 border border-red-200 hover:border-transparent bg-red-50">
                            <Trash2 size={14} /> Remove Logo
                        </button>
                    )}
                </div>
            </SettingsCard>

            <SettingsCard title="Business Identity" description="Used across all generated documents."
                footer={<SaveButton onClick={onSaveBiz} saving={saving} disabled={!isDirty} />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 w-full">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[#304250]/70 uppercase tracking-wider">Business Name</label>
                        <input {...register('businessName')} className="w-full px-4 py-3 sm:py-2.5 bg-gray-50/50 border border-[#304250]/10 rounded-xl text-sm font-medium text-[#304250] outline-none focus:ring-2 focus:ring-[#20A46B]/20 focus:border-[#20A46B] transition-all duration-200" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[#304250]/70 uppercase tracking-wider">Support Phone</label>
                        <input {...register('phone')} placeholder="+92 300 1234567" className="w-full px-4 py-3 sm:py-2.5 bg-gray-50/50 border border-[#304250]/10 rounded-xl text-sm font-medium text-[#304250] outline-none focus:ring-2 focus:ring-[#20A46B]/20 focus:border-[#20A46B] transition-all duration-200" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[#304250]/70 uppercase tracking-wider">City</label>
                        <input {...register('city')} className="w-full px-4 py-3 sm:py-2.5 bg-gray-50/50 border border-[#304250]/10 rounded-xl text-sm font-medium text-[#304250] outline-none focus:ring-2 focus:ring-[#20A46B]/20 focus:border-[#20A46B] transition-all duration-200" />
                    </div>
                    <div className="space-y-2 z-50 relative">
                        <label className="text-xs font-bold text-[#304250]/70 uppercase tracking-wider">Province</label>
                        <CustomDropdown options={PROVINCES as any} value={provinceValue} onChange={val => setValue('province', val, { shouldDirty: true })} />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-bold text-[#304250]/70 uppercase tracking-wider">Full Street Address</label>
                        <textarea {...register('address')} rows={3} placeholder="House #, Street, Area..." className="w-full px-4 py-3 sm:py-2.5 bg-gray-50/50 border border-[#304250]/10 rounded-xl text-sm font-medium text-[#304250] outline-none focus:ring-2 focus:ring-[#20A46B]/20 focus:border-[#20A46B] transition-all duration-200 resize-none" />
                    </div>
                </div>
            </SettingsCard>

            <SettingsCard title="Sales Channels" description="Where you sell your products."
                footer={<SaveButton onClick={onSaveChannels} saving={channelsSaving} disabled={JSON.stringify(channels) === JSON.stringify(store.salesChannels)} />}>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 w-full">
                    {SALES_CHANNEL_OPTIONS.map(ch => {
                        const isSelected = channels.includes(ch);
                        return (
                            <button key={ch} onClick={() => toggleCh(ch)}
                                className={`relative flex items-center justify-center gap-2 px-2 sm:px-4 py-3 sm:py-3.5 rounded-xl border-2 transition-all duration-300 group w-full ${isSelected
                                    ? 'border-[#20A46B] bg-[#20A46B]/5 shadow-sm'
                                    : 'border-[#304250]/10 bg-white hover:border-[#304250]/30 hover:bg-gray-50'
                                    }`}>
                                {isSelected && (
                                    <div className="absolute -top-2 -right-2 bg-[#20A46B] text-white p-1 rounded-full z-10 shadow-md">
                                        <Check size={10} strokeWidth={4} />
                                    </div>
                                )}
                                <span className={`text-xs sm:text-sm font-bold truncate ${isSelected ? 'text-[#20A46B]' : 'text-[#304250]/60'}`}>
                                    {ch}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </SettingsCard>
        </motion.div>
    );
};

// ── Tab 3: Logistics & Couriers ───────────────────────────────────
const LogisticsTab = () => {
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
        const handler = (e: MouseEvent) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsDropdownOpen(false); }
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const addCourier = (name: string) => {
        const clean = name.trim();
        if (!clean) return;
        if (localCouriers.some(c => c.courierName.toLowerCase() === clean.toLowerCase())) {
            toast.error('Courier already exists'); return;
        }
        const preset = COURIER_PRESETS[clean] || { sameCity: 0, sameProvince: 0, crossProvince: 0, extraKg: 0 };
        setLocalCouriers(prev => [...prev, { courierName: clean, ...preset }]);
    };

    const handleCustomCourierAdd = () => {
        if (!customName.trim()) return;
        addCourier(customName);
        setCustomName(''); setShowCustomInput(false);
    };

    const removeCourier = (i: number) => setLocalCouriers(localCouriers.filter((_, idx) => idx !== i));
    const updateRate = (i: number, field: keyof CourierRate, val: string) => setLocalCouriers(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: Number(val) } : c));

    const onSave = async () => {
        setSaving(true);
        store.setCouriers(localCouriers);
        await store.saveProfile();
        await new Promise(r => setTimeout(r, 500));
        setSaving(false);
        toast.success('Courier rates saved');
    };

    const availableCouriers = COURIER_NAMES.filter(c => c !== 'Other' && !localCouriers.some(r => r.courierName.toLowerCase() === c.toLowerCase()));

    return (
        <motion.div variants={tabVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
            <SettingsCard title="Courier Rate Configuration" description="Manage delivery companies and their shipping rates."
                footer={<SaveButton onClick={onSave} saving={saving} disabled={JSON.stringify(localCouriers) === JSON.stringify(store.couriers)} />}>

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
                                    {/* FIX: ADDED whitespace-nowrap TO PREVENT TEXT CUT OFF */}
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

                {localCouriers.length > 0 ? (
                    <div className="space-y-4">
                        {/* Desktop Header */}
                        <div className="hidden md:grid grid-cols-12 gap-4 text-[11px] uppercase font-black text-[#304250]/50 px-4 pb-2 border-b border-[#304250]/10 tracking-wider">
                            <div className="col-span-3">Company</div>
                            <div className="col-span-2 text-center">Same City</div>
                            <div className="col-span-2 text-center">Same Prov</div>
                            <div className="col-span-2 text-center">Cross Prov</div>
                            <div className="col-span-2 text-center">Extra /Kg</div>
                            <div className="col-span-1"></div>
                        </div>

                        {/* Courier Cards */}
                        {localCouriers.map((c, i) => (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} key={i} className="bg-white rounded-xl border border-[#304250]/10 overflow-hidden hover:border-[#304250]/30 transition-colors shadow-sm w-full">
                                {/* Desktop View */}
                                <div className="hidden md:grid grid-cols-12 gap-4 items-center p-4">
                                    <div className="col-span-3 font-black text-base text-[#304250] truncate pl-2">{c.courierName}</div>
                                    {(['sameCity', 'sameProvince', 'crossProvince', 'extraKg'] as const).map(field => (
                                        <div key={field} className="col-span-2 relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#304250]/40 font-bold text-xs">Rs</span>
                                            <input type="number" min={0} className="w-full pl-9 pr-3 py-2.5 text-sm font-bold text-[#304250] border border-[#304250]/10 rounded-lg outline-none focus:ring-2 focus:ring-[#20A46B]/20 focus:border-[#20A46B] transition-all bg-gray-50/50 hover:bg-white" value={c[field]} onChange={e => updateRate(i, field, e.target.value)} />
                                        </div>
                                    ))}
                                    <div className="col-span-1 flex justify-center">
                                        <button onClick={() => removeCourier(i)} className="p-2.5 hover:bg-rose-50 text-[#304250]/40 hover:text-rose-600 rounded-lg transition-colors"><Trash2 size={18} /></button>
                                    </div>
                                </div>

                                {/* Mobile View (Stacked Grid) */}
                                <div className="md:hidden p-4 space-y-4">
                                    <div className="flex justify-between items-center border-b border-[#304250]/10 pb-3">
                                        <div className="font-black text-base text-[#304250] truncate flex items-center gap-2">
                                            <Truck size={16} className="text-[#20A46B]" /> {c.courierName}
                                        </div>
                                        <button onClick={() => removeCourier(i)} className="p-2 bg-rose-50 text-rose-500 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {(['sameCity', 'sameProvince', 'crossProvince', 'extraKg'] as const).map(field => {
                                            const labels = { sameCity: 'Same City', sameProvince: 'Same Province', crossProvince: 'Cross Province', extraKg: 'Extra /Kg' };
                                            return (
                                                <div key={field} className="space-y-1">
                                                    <label className="text-[10px] font-bold text-[#304250]/60 uppercase tracking-wider">{labels[field]}</label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#304250]/40 font-bold text-xs">Rs</span>
                                                        <input type="number" min={0} className="w-full pl-8 pr-2 py-2.5 text-sm font-bold text-[#304250] border border-[#304250]/10 rounded-lg outline-none focus:ring-2 focus:ring-[#20A46B]/20 focus:border-[#20A46B] transition-all bg-gray-50/50" value={c[field]} onChange={e => updateRate(i, field, e.target.value)} />
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
};

// ── Tab 4: Financials & Expenses ──────────────────────────────────
const FinancialsTab = () => {
    const store = useBusinessStore();
    const [saving, setSaving] = useState(false);
    const { register, handleSubmit, watch, reset, formState: { isDirty } } = useForm({
        defaultValues: { hosting: store.expenses.hosting, internet: store.expenses.internet, rent: store.expenses.rent, salary: store.expenses.salary },
    });
    const [pkgSaving, setPkgSaving] = useState(false);
    const [pkg, setPkg] = useState(store.expenses.packagingCost);

    useEffect(() => { reset({ hosting: store.expenses.hosting, internet: store.expenses.internet, rent: store.expenses.rent, salary: store.expenses.salary }); setPkg(store.expenses.packagingCost); }, [store.expenses]);

    const watchedValues = watch();
    const total = Number(watchedValues.hosting || 0) + Number(watchedValues.internet || 0) + Number(watchedValues.rent || 0) + Number(watchedValues.salary || 0);

    const onSaveExpenses = handleSubmit(async (data) => {
        setSaving(true);
        store.setExpenses({ hosting: Number(data.hosting), internet: Number(data.internet), rent: Number(data.rent), salary: Number(data.salary) });
        await store.saveProfile();
        await new Promise(r => setTimeout(r, 600));
        setSaving(false);
        toast.success('Fixed expenses updated');
    });

    const onSavePkg = async () => {
        setPkgSaving(true);
        store.setExpenses({ packagingCost: Number(pkg) });
        await store.saveProfile();
        await new Promise(r => setTimeout(r, 600));
        setPkgSaving(false);
        toast.success('Packaging cost updated');
    };

    return (
        <motion.div variants={tabVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
            <SettingsCard title="Fixed Monthly Expenses" description="These costs are distributed across your profit calculations." footer={<SaveButton onClick={onSaveExpenses} saving={saving} disabled={!isDirty} />}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 w-full">
                    {[{ label: 'Hosting / Software', key: 'hosting' }, { label: 'Internet / Utilities', key: 'internet' }, { label: 'Monthly Rent', key: 'rent' }, { label: 'Monthly Salaries', key: 'salary' }].map(item => (
                        <div key={item.key} className="space-y-2 relative">
                            <label className="text-xs font-bold text-[#304250]/70 uppercase tracking-wider">{item.label}</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#304250]/40 font-bold">Rs</span>
                                <input type="number" {...register(item.key as any, { valueAsNumber: true })} className="w-full pl-10 pr-4 py-3 sm:py-2.5 bg-gray-50/50 border border-[#304250]/10 rounded-xl text-sm font-bold text-[#304250] outline-none focus:ring-2 focus:ring-[#20A46B]/20 focus:border-[#20A46B] transition-all" />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-6 sm:mt-8 pt-4 sm:pt-5 border-t border-[#304250]/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 w-full bg-gray-50/50 px-4 sm:px-5 py-4 rounded-xl border border-[#304250]/5">
                    <span className="text-xs sm:text-sm font-black text-[#304250]/60 uppercase tracking-widest">Total Fixed Monthly</span>
                    <span className="text-xl sm:text-2xl font-black text-[#20A46B] font-mono">Rs {total.toLocaleString()}</span>
                </div>
            </SettingsCard>

            <SettingsCard title="Variable Costs" description="Costs applied to each individual order." footer={<SaveButton onClick={onSavePkg} saving={pkgSaving} disabled={pkg === store.expenses.packagingCost} />}>
                <div className="w-full sm:max-w-md space-y-2">
                    <label className="text-xs font-bold text-[#304250]/70 uppercase tracking-wider">Packaging Cost per Order</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#304250]/40 font-bold">Rs</span>
                        <input type="number" value={pkg} onChange={e => setPkg(Number(e.target.value))} className="w-full pl-10 pr-4 py-3 sm:py-2.5 bg-gray-50/50 border border-[#304250]/10 rounded-xl text-sm font-bold text-[#304250] outline-none focus:ring-2 focus:ring-[#20A46B]/20 focus:border-[#20A46B] transition-all" />
                    </div>
                </div>
            </SettingsCard>
        </motion.div>
    );
};

// ── Tab 5: Documents ──────────────────────────────────────────────
const DocumentsTab = () => {
    return (
        <motion.div variants={tabVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
            <SettingsCard title="Document History" description="All invoices, labels, and slips you've generated.">
                <div className="py-16 bg-gray-50/50 border border-dashed border-[#304250]/20 rounded-2xl flex flex-col items-center justify-center text-center w-full">
                    <FileText size={48} className="text-[#304250]/20 mb-4" />
                    <h4 className="text-lg font-black text-[#304250]">No Documents Yet</h4>
                    <p className="text-sm text-[#304250]/60 mt-2 max-w-sm px-4 font-medium">Documents you generate using the tools will automatically appear here in your history log.</p>
                </div>
            </SettingsCard>
        </motion.div>
    );
};

// ── Tab 6: Integrations & Apps ───────────────────────────────────────────────
const IntegrationsTab = () => {
    return (
        <motion.div variants={tabVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
            <SettingsCard title="Advertising Platforms" description="Connect your marketing channels to get real-time ROAS and ad spend visibility synced directly to your profit calculations.">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                    {/* FB Ads */}
                    <div className="p-4 sm:p-5 bg-white border border-[#304250]/10 hover:border-[#20A46B] hover:shadow-md transition-all rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 bg-white rounded-xl flex items-center justify-center border border-[#304250]/10 shadow-sm">
                                <img src="https://api.iconify.design/logos:facebook.svg" alt="Facebook" className="w-6 h-6 sm:w-7 sm:h-7" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-[#304250]">Facebook Meta Ads</h4>
                                <p className="text-[11px] sm:text-xs font-semibold text-[#304250]/60 mt-0.5">Sync Campaigns & Costs</p>
                            </div>
                        </div>
                        <button onClick={() => toast.info('OAuth Integration coming soon!')} className="w-full sm:w-auto px-5 py-2.5 bg-gray-50 border border-[#304250]/5 text-[#304250]/70 hover:bg-[#20A46B] hover:text-white rounded-xl text-sm font-bold transition-all active:scale-95 shadow-sm shrink-0">Connect</button>
                    </div>

                    {/* Instagram Ads */}
                    <div className="p-4 sm:p-5 bg-white border border-[#304250]/10 hover:border-[#20A46B] hover:shadow-md transition-all rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 bg-white rounded-xl flex items-center justify-center border border-[#304250]/10 shadow-sm">
                                <img src="https://api.iconify.design/skill-icons:instagram.svg" alt="Instagram" className="w-6 h-6 sm:w-7 sm:h-7" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-[#304250]">Instagram Ads</h4>
                                <p className="text-[11px] sm:text-xs font-semibold text-[#304250]/60 mt-0.5">Boost & Story Spend</p>
                            </div>
                        </div>
                        <button onClick={() => toast.info('OAuth Integration coming soon!')} className="w-full sm:w-auto px-5 py-2.5 bg-gray-50 border border-[#304250]/5 text-[#304250]/70 hover:bg-[#20A46B] hover:text-white rounded-xl text-sm font-bold transition-all active:scale-95 shadow-sm shrink-0">Connect</button>
                    </div>

                    {/* TikTok Ads */}
                    <div className="p-4 sm:p-5 bg-white border border-[#304250]/10 hover:border-[#20A46B] hover:shadow-md transition-all rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 bg-white rounded-xl flex items-center justify-center border border-[#304250]/10 shadow-sm">
                                <img src="https://api.iconify.design/logos:tiktok-icon.svg" alt="TikTok" className="w-6 h-6 sm:w-7 sm:h-7" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-[#304250]">TikTok Business</h4>
                                <p className="text-[11px] sm:text-xs font-semibold text-[#304250]/60 mt-0.5">Track Pixel & Spend</p>
                            </div>
                        </div>
                        <button onClick={() => toast.info('OAuth Integration coming soon!')} className="w-full sm:w-auto px-5 py-2.5 bg-gray-50 border border-[#304250]/5 text-[#304250]/70 hover:bg-[#20A46B] hover:text-white rounded-xl text-sm font-bold transition-all active:scale-95 shadow-sm shrink-0">Connect</button>
                    </div>

                    {/* Google Ads */}
                    <div className="p-4 sm:p-5 bg-white border border-[#304250]/10 hover:border-[#20A46B] hover:shadow-md transition-all rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 bg-white rounded-xl flex items-center justify-center border border-[#304250]/10 shadow-sm">
                                <img src="https://api.iconify.design/logos:google-ads.svg" alt="Google Ads" className="w-6 h-6 sm:w-7 sm:h-7" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-[#304250]">Google Ads</h4>
                                <p className="text-[11px] sm:text-xs font-semibold text-[#304250]/60 mt-0.5">Search & Display ROAS</p>
                            </div>
                        </div>
                        <button onClick={() => toast.info('OAuth Integration coming soon!')} className="w-full sm:w-auto px-5 py-2.5 bg-gray-50 border border-[#304250]/5 text-[#304250]/70 hover:bg-[#20A46B] hover:text-white rounded-xl text-sm font-bold transition-all active:scale-95 shadow-sm shrink-0">Connect</button>
                    </div>
                </div>
            </SettingsCard>

            <SettingsCard title="E-commerce Storefronts" description="Sync orders, inventory, and automated fulfillment statuses right from your stores.">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                    {/* Shopify */}
                    <div className="p-4 sm:p-5 bg-white border border-[#304250]/10 hover:border-[#20A46B] hover:shadow-md transition-all rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 bg-white rounded-xl flex items-center justify-center border border-[#304250]/10 shadow-sm">
                                <img src="https://api.iconify.design/logos:shopify.svg" alt="Shopify" className="w-6 h-6 sm:w-7 sm:h-7" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-[#304250]">Shopify Store</h4>
                                <p className="text-[11px] sm:text-xs font-semibold text-[#304250]/60 mt-0.5">Auto-Import Orders</p>
                            </div>
                        </div>
                        <button onClick={() => toast.info('OAuth Integration coming soon!')} className="w-full sm:w-auto px-5 py-2.5 bg-gray-50 border border-[#304250]/5 text-[#304250]/70 hover:bg-[#20A46B] hover:text-white rounded-xl text-sm font-bold transition-all active:scale-95 shadow-sm shrink-0">Connect</button>
                    </div>

                    {/* Daraz */}
                    <div className="p-4 sm:p-5 bg-white border border-[#304250]/10 hover:border-[#20A46B] hover:shadow-md transition-all rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 bg-white rounded-xl flex items-center justify-center border border-[#304250]/10 shadow-sm">
                                <svg viewBox="0 0 100 100" fill="none" className="w-6 h-6 sm:w-7 sm:h-7"><rect width="100" height="100" rx="20" fill="#F85606" /><polygon points="28,48 50,36 50,84 28,72" fill="#fff" /><polygon points="50,36 50,12 72,24 72,72 50,84" fill="#fff" /><polygon points="50,44 72,56 50,68" fill="#F85606" /></svg>
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-[#304250]">Daraz PK</h4>
                                <p className="text-[11px] sm:text-xs font-semibold text-[#304250]/60 mt-0.5">Seller Center Sync</p>
                            </div>
                        </div>
                        <button onClick={() => toast.info('OAuth Integration coming soon!')} className="w-full sm:w-auto px-5 py-2.5 bg-gray-50 border border-[#304250]/5 text-[#304250]/70 hover:bg-[#20A46B] hover:text-white rounded-xl text-sm font-bold transition-all active:scale-95 shadow-sm shrink-0">Connect</button>
                    </div>

                    {/* WooCommerce */}
                    <div className="p-4 sm:p-5 bg-white border border-[#304250]/10 hover:border-[#20A46B] hover:shadow-md transition-all rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 bg-white rounded-xl flex items-center justify-center border border-[#304250]/10 shadow-sm">
                                <img src="https://api.iconify.design/logos:woocommerce-icon.svg" alt="WooCommerce" className="w-6 h-6 sm:w-7 sm:h-7" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-[#304250]">WooCommerce</h4>
                                <p className="text-[11px] sm:text-xs font-semibold text-[#304250]/60 mt-0.5">Sales & Inventory Sync</p>
                            </div>
                        </div>
                        <button onClick={() => toast.info('OAuth Integration coming soon!')} className="w-full sm:w-auto px-5 py-2.5 bg-gray-50 border border-[#304250]/5 text-[#304250]/70 hover:bg-[#20A46B] hover:text-white rounded-xl text-sm font-bold transition-all active:scale-95 shadow-sm shrink-0">Connect</button>
                    </div>

                    {/* WordPress */}
                    <div className="p-4 sm:p-5 bg-white border border-[#304250]/10 hover:border-[#20A46B] hover:shadow-md transition-all rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 bg-white rounded-xl flex items-center justify-center border border-[#304250]/10 shadow-sm">
                                <img src="https://api.iconify.design/logos:wordpress-icon.svg" alt="WordPress" className="w-6 h-6 sm:w-7 sm:h-7" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-[#304250]">WordPress</h4>
                                <p className="text-[11px] sm:text-xs font-semibold text-[#304250]/60 mt-0.5">Custom Site Tracking</p>
                            </div>
                        </div>
                        <button onClick={() => toast.info('OAuth Integration coming soon!')} className="w-full sm:w-auto px-5 py-2.5 bg-gray-50 border border-[#304250]/5 text-[#304250]/70 hover:bg-[#20A46B] hover:text-white rounded-xl text-sm font-bold transition-all active:scale-95 shadow-sm shrink-0">Connect</button>
                    </div>
                </div>
            </SettingsCard>
        </motion.div>
    );
};

export default function SettingsClient() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('general');

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans text-[#304250] pb-20 selection:bg-[#20A46B]/20 selection:text-[#20A46B]">
            {/* Top Bar - Mobile Optimized & Brand Aligned */}
            <div className="bg-white border-b border-[#304250]/10 sticky top-0 z-20 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 sm:h-20 flex items-center gap-3 sm:gap-4">
                    <button onClick={() => router.push('/tools/profit-calculator')} className="p-2 sm:p-2.5 rounded-xl hover:bg-gray-50 text-[#304250]/60 transition-colors border border-transparent hover:border-[#304250]/10 active:scale-95 shrink-0">
                        <ArrowLeft size={20} strokeWidth={2.5} />
                    </button>
                    <div className="min-w-0">
                        <h1 className="text-lg sm:text-2xl font-black text-[#304250] tracking-tight truncate">Settings Workspace</h1>
                        <p className="text-[10px] sm:text-xs font-bold text-[#304250]/60 uppercase tracking-widest mt-0.5 truncate">Manage your preferences</p>
                    </div>
                </div>
            </div>

            {/* Mobile Tabs Grid */}
            <div className="md:hidden bg-white border-b border-[#304250]/10 p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {TABS.map(tab => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center justify-center gap-1.5 px-2 py-2.5 text-[11px] sm:text-xs font-bold rounded-xl transition-all border ${isActive
                                    ? 'text-white bg-[#20A46B] border-[#20A46B] shadow-sm'
                                    : 'text-[#304250]/60 bg-gray-50 border-[#304250]/10 hover:bg-gray-100 hover:text-[#304250]'
                                    }`}>
                                <tab.icon size={14} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
                                <span className="truncate">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Layout */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8">
                <div className="flex flex-col md:flex-row gap-8">

                    {/* Desktop Navigation */}
                    <nav className="hidden md:block w-64 flex-shrink-0">
                        <div className="sticky top-28 flex flex-col gap-2">
                            {TABS.map(tab => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-300 relative overflow-hidden group
                                            ${isActive ? 'text-[#20A46B] bg-[#20A46B]/5 shadow-sm border border-[#20A46B]/20' : 'text-[#304250]/60 hover:text-[#304250] hover:bg-white border border-transparent hover:border-[#304250]/10'}`}>

                                        {isActive && (
                                            <motion.div layoutId="activeTabIndicator" className="absolute left-0 top-0 bottom-0 w-1 bg-[#20A46B] rounded-r-full" />
                                        )}

                                        <Icon size={18} className={isActive ? 'text-[#20A46B]' : 'text-[#304250]/40 group-hover:text-[#304250]/60'} strokeWidth={isActive ? 2.5 : 2} />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </nav>

                    {/* Content Area */}
                    <div className="flex-1 min-w-0 w-full overflow-hidden">
                        <AnimatePresence mode="wait">
                            {activeTab === 'general' && <GeneralTab key="general" />}
                            {activeTab === 'business' && <BusinessTab key="business" />}
                            {activeTab === 'logistics' && <LogisticsTab key="logistics" />}
                            {activeTab === 'financials' && <FinancialsTab key="financials" />}
                            {activeTab === 'integrations' && <IntegrationsTab key="integrations" />}
                            {activeTab === 'documents' && <DocumentsTab key="documents" />}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #30425020; border-radius: 10px; }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: #30425040; }
            `}</style>
        </div>
    );
}