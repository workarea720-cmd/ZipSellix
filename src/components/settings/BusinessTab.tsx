'use client';
// src/components/settings/BusinessTab.tsx

import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import CustomDropdown from '@/components/CustomDropdown';
import { useBusinessStore, PROVINCES, SALES_CHANNEL_OPTIONS } from '@/store/business-store';
import { SettingsCard, SaveButton, tabVariants } from '@/components/settings/shared';

export default function BusinessTab() {
    const store = useBusinessStore();
    const [saving, setSaving] = useState(false);
    const [channels, setChannels] = useState(store.salesChannels);
    const [channelsSaving, setChannelsSaving] = useState(false);

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

    useEffect(() => {
        reset({
            businessName: store.businessInfo.businessName,
            phone: store.businessInfo.phone,
            address: store.businessInfo.address,
            city: store.businessInfo.city,
            province: store.businessInfo.province,
        });
    }, [store.businessInfo]);

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

    const toggleCh = (ch: string) =>
        setChannels(prev => prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch]);

    return (
        <motion.div variants={tabVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
            {/* Store Logo */}
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

            {/* Business Identity */}
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

            {/* Sales Channels */}
            <SettingsCard title="Sales Channels" description="Where you sell your products."
                footer={<SaveButton onClick={onSaveChannels} saving={channelsSaving} disabled={JSON.stringify(channels) === JSON.stringify(store.salesChannels)} />}>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 w-full">
                    {SALES_CHANNEL_OPTIONS.map(ch => {
                        const isSelected = channels.includes(ch);
                        return (
                            <button key={ch} onClick={() => toggleCh(ch)}
                                className={`relative flex items-center justify-center gap-2 px-2 sm:px-4 py-3 sm:py-3.5 rounded-xl border-2 transition-all duration-300 group w-full ${isSelected ? 'border-[#20A46B] bg-[#20A46B]/5 shadow-sm' : 'border-[#304250]/10 bg-white hover:border-[#304250]/30 hover:bg-gray-50'
                                    }`}>
                                {isSelected && (
                                    <div className="absolute -top-2 -right-2 bg-[#20A46B] text-white p-1 rounded-full z-10 shadow-md">
                                        <Check size={10} strokeWidth={4} />
                                    </div>
                                )}
                                <span className={`text-xs sm:text-sm font-bold truncate ${isSelected ? 'text-[#20A46B]' : 'text-[#304250]/60'}`}>{ch}</span>
                            </button>
                        );
                    })}
                </div>
            </SettingsCard>
        </motion.div>
    );
}
