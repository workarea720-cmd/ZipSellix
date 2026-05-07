"use client";
// src/store/business-store.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getBusinessProfile, updateBusinessProfile } from '@/actions/profile';

// ── Python backend URL from env (never hardcoded)
const PYTHON_URL = process.env.NEXT_PUBLIC_PYTHON_URL || 'http://localhost:8000';

// ─── TypeScript Interfaces ───────────────────────────────────────────

export interface CourierRate {
    courierName: string;
    sameCity: number;
    sameProvince: number;
    crossProvince: number;
    extraKg: number;
    codFeePercent: number;
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
    // ── Sync state tracking
    pythonSyncPending: boolean;
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
    // ── Fixed monthly costs only (hosting + internet + rent + salary)
    getMonthlyFixedCosts: () => number;
    // ── Variable cost per single order
    getVariableCostPerOrder: () => number;
    isOnboardingComplete: () => boolean;
    resetStore: () => void;
    loadProfile: () => Promise<void>;
    saveProfile: () => Promise<void>;
    // ── Manual retry for failed Python sync
    syncToPython: () => Promise<void>;
}

// ─── Constants ───────────────────────────────────────────────────────

export const PROVINCES = ['Punjab', 'Sindh', 'KPK', 'Balochistan', 'Islamabad', 'AJK'] as const;

export const SALES_CHANNEL_OPTIONS = [
    'WhatsApp', 'Daraz', 'Facebook', 'Instagram', 'Shopify', 'TikTok', 'Website',
] as const;

export const COURIER_PRESETS: Record<string, Omit<CourierRate, 'courierName'>> = {
    PostEx: { sameCity: 100, sameProvince: 165, crossProvince: 201, extraKg: 50, codFeePercent: 1.5 },
    Leopard: { sameCity: 150, sameProvince: 180, crossProvince: 220, extraKg: 100, codFeePercent: 2 },
    TCS: { sameCity: 200, sameProvince: 250, crossProvince: 300, extraKg: 120, codFeePercent: 1.5 },
    Trax: { sameCity: 130, sameProvince: 160, crossProvince: 190, extraKg: 90, codFeePercent: 2 },
    CallCourier: { sameCity: 140, sameProvince: 170, crossProvince: 200, extraKg: 95, codFeePercent: 2 },
    'M&P': { sameCity: 180, sameProvince: 210, crossProvince: 240, extraKg: 110, codFeePercent: 1.5 },
};

export const COURIER_NAMES = Object.keys(COURIER_PRESETS);

// ─── Default State ───────────────────────────────────────────────────

const defaultState: BusinessState = {
    account: { name: '', email: '', avatar: null },
    businessInfo: { logo: null, businessName: '', phone: '', address: '', city: '', province: 'Punjab', businessType: '' },
    salesChannels: [],
    couriers: [],
    expenses: { hosting: 0, internet: 0, rent: 0, salary: 0, packagingCost: 0 },
    pythonSyncPending: false,
};

// ─── Helper: build Python setup payload ─────────────────────────────

function buildPythonPayload(state: BusinessState) {
    return {
        businessType: state.businessInfo.businessType || 'STOCK',
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
            kg: c.extraKg,
            codFeePercent: c.codFeePercent,
        })),
    };
}

// ─── Store ───────────────────────────────────────────────────────────

export const useBusinessStore = create<BusinessState & BusinessActions>()(
    persist(
        (set, get) => ({
            ...defaultState,

            setAccount: (data) => set((s) => ({ account: { ...s.account, ...data } })),
            setBusinessInfo: (data) => set((s) => ({ businessInfo: { ...s.businessInfo, ...data } })),
            setSalesChannels: (channels) => set({ salesChannels: channels }),
            setCouriers: (couriers) => set({ couriers }),
            addCourier: (courier) => set((s) => ({ couriers: [...s.couriers, courier] })),
            removeCourier: (index) => set((s) => ({ couriers: s.couriers.filter((_, i) => i !== index) })),
            updateCourier: (index, data) => set((s) => ({
                couriers: s.couriers.map((c, i) => (i === index ? { ...c, ...data } : c)),
            })),
            setExpenses: (data) => set((s) => ({ expenses: { ...s.expenses, ...data } })),

            // ── Fixed monthly costs (packaging is NOT included — it's variable)
            getMonthlyFixedCosts: () => {
                const e = get().expenses;
                return e.hosting + e.internet + e.rent + e.salary;
            },

            // ── Variable cost applied per order (not monthly)
            getVariableCostPerOrder: () => get().expenses.packagingCost,

            isOnboardingComplete: () => get().businessInfo.businessName.trim().length > 0,

            resetStore: () => set({ ...defaultState }),

            // ── Load from Postgres → update local state
            // NO auto-sync to Python here — only sync when user explicitly saves
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
                                businessType: (p as any).businessType || 'STOCK',
                            },
                            account: {
                                ...get().account,
                                name: p.ownerName || '',
                            },
                            salesChannels: s.channels || [],
                            couriers: Array.isArray(s.courierRates)
                                ? s.courierRates.map((c: any) => ({
                                    courierName: c.name,
                                    sameCity: c.sameCity,
                                    sameProvince: c.sameProv,
                                    crossProvince: c.crossProv,
                                    extraKg: c.kg,
                                    codFeePercent: c.codFeePercent || 0,
                                }))
                                : [],
                            expenses: {
                                hosting: s.monthlyHosting || 0,
                                internet: s.monthlyInternet || 0,
                                rent: s.monthlyRent || 0,
                                salary: s.monthlySalary || 0,
                                packagingCost: s.packagingCost || 0,
                            },
                        });
                    }
                } catch (e) {
                    console.error('Failed to load profile from DB:', e);
                }
            },

            // ── Save to Postgres first, then sync to Python
            // If Python sync fails: set pending flag — don't silently swallow
            saveProfile: async () => {
                try {
                    const state = get();
                    const payload = buildPythonPayload(state);

                    // Step 1: Save to Postgres (source of truth)
                    const res = await updateBusinessProfile(payload);
                    if (!res.success) throw new Error(res.error);

                    // Step 2: Sync to Python backend
                    await get().syncToPython();

                } catch (e) {
                    console.error('Failed to save profile:', e);
                    throw e; // re-throw so UI can show error toast
                }
            },

            // ── Sync to Python via Next.js proxy route (proxy adds X-User-Id from session)
            syncToPython: async () => {
                const state = get();
                try {
                    // ── Call our Next.js proxy — it adds X-User-Id server-side
                    const res = await fetch('/api/profile/sync-python', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(buildPythonPayload(state)),
                    });

                    if (!res.ok) throw new Error(`Python sync failed: ${res.status}`);

                    // ── Clear pending flag on success
                    set({ pythonSyncPending: false });

                } catch (e) {
                    // ── Mark as pending so UI can show "Re-sync" button
                    set({ pythonSyncPending: true });
                    console.error('Python sync failed — marked as pending:', e);
                    // Do NOT re-throw — Postgres save already succeeded
                }
            },
        }),
        {
            name: 'zipsellix-business-store',
            // ── Don't persist pythonSyncPending across sessions
            partialize: (state) => {
                const { pythonSyncPending, ...rest } = state;
                return rest;
            },
        }
    )
);