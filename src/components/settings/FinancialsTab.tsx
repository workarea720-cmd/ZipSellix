'use client';
// src/components/settings/FinancialsTab.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useBusinessStore } from '@/store/business-store';
import { SettingsCard, SaveButton, tabVariants } from '@/components/settings/shared';

export default function FinancialsTab() {
    const store = useBusinessStore();
    const [saving, setSaving] = useState(false);
    const [pkgSaving, setPkgSaving] = useState(false);
    const [pkg, setPkg] = useState(store.expenses.packagingCost);

    const { register, handleSubmit, watch, reset, formState: { isDirty } } = useForm({
        defaultValues: {
            hosting: store.expenses.hosting,
            internet: store.expenses.internet,
            rent: store.expenses.rent,
            salary: store.expenses.salary,
        },
    });

    useEffect(() => {
        reset({
            hosting: store.expenses.hosting,
            internet: store.expenses.internet,
            rent: store.expenses.rent,
            salary: store.expenses.salary,
        });
        setPkg(store.expenses.packagingCost);
    }, [store.expenses]);

    const watchedValues = watch();
    const total =
        Number(watchedValues.hosting || 0) +
        Number(watchedValues.internet || 0) +
        Number(watchedValues.rent || 0) +
        Number(watchedValues.salary || 0);

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

    const expenseFields = [
        { label: 'Hosting / Software', key: 'hosting' },
        { label: 'Internet / Utilities', key: 'internet' },
        { label: 'Monthly Rent', key: 'rent' },
        { label: 'Monthly Salaries', key: 'salary' },
    ] as const;

    return (
        <motion.div variants={tabVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
            {/* Fixed Monthly Expenses */}
            <SettingsCard title="Fixed Monthly Expenses" description="These costs are distributed across your profit calculations."
                footer={<SaveButton onClick={onSaveExpenses} saving={saving} disabled={!isDirty} />}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 w-full">
                    {expenseFields.map(item => (
                        <div key={item.key} className="space-y-2 relative">
                            <label className="text-xs font-bold text-[#304250]/70 uppercase tracking-wider">{item.label}</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#304250]/40 font-bold">Rs</span>
                                <input type="number" {...register(item.key, { valueAsNumber: true })}
                                    className="w-full pl-10 pr-4 py-3 sm:py-2.5 bg-gray-50/50 border border-[#304250]/10 rounded-xl text-sm font-bold text-[#304250] outline-none focus:ring-2 focus:ring-[#20A46B]/20 focus:border-[#20A46B] transition-all" />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-6 sm:mt-8 pt-4 sm:pt-5 border-t border-[#304250]/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 w-full bg-gray-50/50 px-4 sm:px-5 py-4 rounded-xl">
                    <span className="text-xs sm:text-sm font-black text-[#304250]/60 uppercase tracking-widest">Total Fixed Monthly</span>
                    <span className="text-xl sm:text-2xl font-black text-[#20A46B] font-mono">Rs {total.toLocaleString()}</span>
                </div>
            </SettingsCard>

            {/* Variable Costs */}
            <SettingsCard title="Variable Costs" description="Costs applied to each individual order."
                footer={<SaveButton onClick={onSavePkg} saving={pkgSaving} disabled={pkg === store.expenses.packagingCost} />}>
                <div className="w-full sm:max-w-md space-y-2">
                    <label className="text-xs font-bold text-[#304250]/70 uppercase tracking-wider">Packaging Cost per Order</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#304250]/40 font-bold">Rs</span>
                        <input type="number" value={pkg} onChange={e => setPkg(Number(e.target.value))}
                            className="w-full pl-10 pr-4 py-3 sm:py-2.5 bg-gray-50/50 border border-[#304250]/10 rounded-xl text-sm font-bold text-[#304250] outline-none focus:ring-2 focus:ring-[#20A46B]/20 focus:border-[#20A46B] transition-all" />
                    </div>
                </div>
            </SettingsCard>
        </motion.div>
    );
}
