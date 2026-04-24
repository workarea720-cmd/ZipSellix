"use client"; // REQUIRED: Prevents Next.js server crashes when using Zustand's persist (localStorage)

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getBusinessProfile, updateBusinessProfile } from '@/actions/profile';
import { API_URL, safeFetch } from '@/lib/api-client';

// ─── TypeScript Interfaces ───────────────────────────────────────────

export interface CourierRate {
    courierName: string;
    sameCity: number;
    sameProvince: number;
    crossProvince: number;
    extraKg: number;
}

export interface AccountInfo {
    name: string;
    email: string;
    avatar: string | null;
}

export interface BusinessInfo {
    logo: string | null;
    businessName: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    businessType: 'STOCK' | 'SERVICE' | string;
}

export interface ExpensesInfo {
    hosting: number;
    internet: number;
    rent: number;
    salary: number;
    packagingCost: number;
}

export interface BusinessState {
    account: AccountInfo;
    businessInfo: BusinessInfo;
    salesChannels: string[];
    couriers: CourierRate[];
    expenses: ExpensesInfo;
}

interface BusinessActions {
    setAccount: (data: Partial<AccountInfo>) => void;
    setBusinessInfo: (data: Partial<BusinessInfo>) => void;
    setSalesChannels: (channels: string[]) => void;
    setCouriers: (couriers: CourierRate[]) => void;
    addCourier: (courier: CourierRate) => void;
    removeCourier: (index: number) => void;
    updateCourier: (index: number, data: Partial<CourierRate>) => void;
    setExpenses: (data: Partial<ExpensesInfo>) => void;
    getTotalExpense: () => number;
    isOnboardingComplete: () => boolean;
    resetStore: () => void;
    loadProfile: () => Promise<void>;
    saveProfile: () => Promise<void>;
}

// ─── Constants ───────────────────────────────────────────────────────

export const PROVINCES = ['Punjab', 'Sindh', 'KPK', 'Balochistan', 'Islamabad', 'AJK'] as const;

export const SALES_CHANNEL_OPTIONS = [
    'WhatsApp', 'Daraz', 'Facebook', 'Instagram', 'Shopify', 'TikTok', 'Website',
] as const;

export const COURIER_PRESETS: Record<string, Omit<CourierRate, 'courierName'>> = {
    PostEx: { sameCity: 100, sameProvince: 165, crossProvince: 201, extraKg: 50 },
    Leopard: { sameCity: 150, sameProvince: 180, crossProvince: 220, extraKg: 100 },
    TCS: { sameCity: 200, sameProvince: 250, crossProvince: 300, extraKg: 120 },
    Trax: { sameCity: 130, sameProvince: 160, crossProvince: 190, extraKg: 90 },
    CallCourier: { sameCity: 140, sameProvince: 170, crossProvince: 200, extraKg: 95 },
    'M&P': { sameCity: 180, sameProvince: 210, crossProvince: 240, extraKg: 110 },
};

export const COURIER_NAMES = Object.keys(COURIER_PRESETS);

// ─── Default State ───────────────────────────────────────────────────

const defaultState: BusinessState = {
    account: { name: '', email: '', avatar: null },
    businessInfo: { logo: null, businessName: '', phone: '', address: '', city: '', province: 'Punjab', businessType: '' },
    salesChannels: [],
    couriers: [],
    expenses: { hosting: 0, internet: 0, rent: 0, salary: 0, packagingCost: 0 },
};

// ─── Store ───────────────────────────────────────────────────────────

export const useBusinessStore = create<BusinessState & BusinessActions>()(
    persist(
        (set, get) => ({
            ...defaultState,

            setAccount: (data) =>
                set((s) => ({ account: { ...s.account, ...data } })),

            setBusinessInfo: (data) =>
                set((s) => ({ businessInfo: { ...s.businessInfo, ...data } })),

            setSalesChannels: (channels) =>
                set({ salesChannels: channels }),

            setCouriers: (couriers) =>
                set({ couriers }),

            addCourier: (courier) =>
                set((s) => ({ couriers: [...s.couriers, courier] })),

            removeCourier: (index) =>
                set((s) => ({ couriers: s.couriers.filter((_, i) => i !== index) })),

            updateCourier: (index, data) =>
                set((s) => ({
                    couriers: s.couriers.map((c, i) => (i === index ? { ...c, ...data } : c)),
                })),

            setExpenses: (data) =>
                set((s) => ({ expenses: { ...s.expenses, ...data } })),

            getTotalExpense: () => {
                const e = get().expenses;
                // FIX: packagingCost is now properly included in the total calculation
                return e.hosting + e.internet + e.rent + e.salary + e.packagingCost;
            },

            isOnboardingComplete: () => {
                return get().businessInfo.businessName.trim().length > 0;
            },

            resetStore: () => set({ ...defaultState }),

            loadProfile: async () => {
                try {
                    const data = await getBusinessProfile();
                    if (data.success && data.isSetupComplete && data.profile) {
                        const p = data.profile;
                        const s = p.settings || {};
                        set({
                            businessInfo: {
                                logo: s.logo || null,
                                businessName: p.businessName || '',
                                phone: s.phone || '',
                                address: s.address || '',
                                city: p.city || '',
                                province: p.province || 'Punjab',
                                // 👇 YAHAN TypeScript ERROR FIX KIYA HAI
                                businessType: (p as any).businessType || 'STOCK',
                            },
                            account: { ...get().account, name: p.ownerName || '' },
                            salesChannels: s.channels || [],
                            couriers: Array.isArray(s.courierRates) ? s.courierRates.map((c: any) => ({
                                courierName: c.name,
                                sameCity: c.sameCity,
                                sameProvince: c.sameProv,
                                crossProvince: c.crossProv,
                                extraKg: c.kg
                            })) : [],
                            expenses: {
                                hosting: s.monthlyHosting || 0,
                                internet: s.monthlyInternet || 0,
                                rent: s.monthlyRent || 0,
                                salary: s.monthlySalary || 0,
                                packagingCost: s.packagingCost || 0
                            }
                        });

                        // 👇 Auto-sync to Python Backend directly after loading from Postgres
                        try {
                            const state = get();
                            await safeFetch(`${API_URL}/api/business/setup`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    businessType: state.businessInfo.businessType || "STOCK",
                                    businessName: state.businessInfo.businessName,
                                    ownerName: state.account.name,
                                    city: state.businessInfo.city,
                                    province: state.businessInfo.province,
                                    monthlyRent: state.expenses.rent,
                                    monthlySalary: state.expenses.salary,
                                    monthlyHosting: state.expenses.hosting,
                                    monthlyInternet: state.expenses.internet,
                                    packagingCost: state.expenses.packagingCost,
                                    courierRates: state.couriers.map((c: any) => ({
                                        name: c.courierName,
                                        sameCity: c.sameCity,
                                        sameProv: c.sameProvince,
                                        crossProv: c.crossProvince,
                                        kg: c.extraKg
                                    }))
                                })
                            });
                        } catch (e) { console.error("Sync to python failed", e); }
                    }
                } catch (e) {
                    console.error("Failed to load profile from DB", e);
                }
            },

            saveProfile: async () => {
                try {
                    const state = get();
                    const payload = {
                        businessType: state.businessInfo.businessType || "STOCK",
                        businessName: state.businessInfo.businessName,
                        ownerName: state.account.name,
                        city: state.businessInfo.city,
                        province: state.businessInfo.province,
                        businessTypes: state.salesChannels,
                        logo: state.businessInfo.logo || undefined,
                        phone: state.businessInfo.phone,
                        address: state.businessInfo.address,
                        monthlyRent: state.expenses.rent,
                        monthlySalary: state.expenses.salary,
                        monthlyHosting: state.expenses.hosting,
                        monthlyInternet: state.expenses.internet,
                        packagingCost: state.expenses.packagingCost,
                        courierRates: state.couriers.map(c => ({
                            name: c.courierName,
                            sameCity: c.sameCity,
                            sameProv: c.sameProvince,
                            crossProv: c.crossProvince,
                            kg: c.extraKg
                        }))
                    };
                    const res = await updateBusinessProfile(payload);
                    if (!res.success) throw new Error(res.error);

                    // 👇 Auto-sync to Python Backend after successfully saving to Postgres
                    try {
                        await safeFetch(`${API_URL}/api/business/setup`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(payload)
                        });
                    } catch (e) { console.error("Python sync failed", e); }

                } catch (e) {
                    console.error("Failed to save profile to DB", e);
                }
            },
        }),
        {
            name: 'zipsellix-business-store',
        }
    )
);