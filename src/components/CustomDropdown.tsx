"use client";
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, Check } from 'lucide-react';

// ─── Official Courier Logo Map via Clearbit Logo API ─────────────────────────
// Clearbit returns clean, high-quality square PNGs for any domain.
const COURIER_LOGO_MAP: Record<string, string> = {
    'Leopards': 'https://logo.clearbit.com/leopardscourier.com',
    'Leopard': 'https://logo.clearbit.com/leopardscourier.com',
    'TCS': 'https://logo.clearbit.com/tcsexpress.com',
    'Trax': 'https://logo.clearbit.com/trax.pk',
    'PostEx': 'https://logo.clearbit.com/postex.pk',
    'CallCourier': 'https://logo.clearbit.com/callcourier.com.pk',
    'M&P': 'https://logo.clearbit.com/mulphilog.com',
    'Rider': 'https://logo.clearbit.com/withrider.com',
    'Swyft': 'https://logo.clearbit.com/swyftlogistics.com',
    'BlueEx': 'https://logo.clearbit.com/blueex.com',
    'Daewoo': 'https://logo.clearbit.com/daewooexpress.com',
};

export const getCourierLogoUrl = (name: string): string | null =>
    COURIER_LOGO_MAP[name] ?? null;

// ─── Logo Avatar Component ────────────────────────────────────────────────────
function CourierLogo({ name, size = 'sm' }: { name: string; size?: 'sm' | 'md' }) {
    const [imgError, setImgError] = useState(false);
    const logoUrl = getCourierLogoUrl(name);
    const initials = name.slice(0, 2).toUpperCase();

    const sizeClasses = size === 'sm'
        ? 'w-6 h-6 text-[9px]'
        : 'w-8 h-8 text-[10px]';

    if (!logoUrl || imgError) {
        return (
            <span className={`${sizeClasses} rounded-md bg-bg-muted border border-card-border flex items-center justify-center font-bold text-text-muted flex-shrink-0`}>
                {initials}
            </span>
        );
    }

    return (
        <img
            src={logoUrl}
            alt={name}
            className={`${sizeClasses} rounded-md object-contain bg-card-bg flex-shrink-0`}
            onError={() => setImgError(true)}
        />
    );
}

// ─── CustomDropdown ───────────────────────────────────────────────────────────
interface CustomDropdownProps {
    options: readonly string[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function CustomDropdown({
    options,
    value,
    onChange,
    placeholder = 'Select an option',
}: CustomDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);



    return (
        <div className="relative w-full" ref={ref}>
            {/* ── Trigger ── */}
            <button
                type="button"
                onClick={() => setIsOpen(prev => !prev)}
                className={`
                    group w-full flex items-center justify-between gap-2
                    px-3.5 py-2.5 rounded-xl border text-sm transition-all duration-200 active:scale-[0.98]
                    ${isOpen
                        ? 'border-brand-primary bg-brand-primary-light/30 ring-2 ring-brand-primary-light shadow-sm'
                        : 'border-card-border bg-card-bg hover:border-slate-300 hover:bg-bg-subtle hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]'}
                `}
            >
                <span className={`flex items-center gap-2.5 min-w-0 flex-1 transition-colors duration-200 ${!value ? 'text-text-muted-light' : 'text-text-main font-medium group-hover:text-brand-primary'}`}>
                    <span className="truncate">{value || placeholder}</span>
                </span>
                <ChevronDown
                    size={15}
                    className={`flex-shrink-0 transition-all duration-300 ${isOpen ? 'rotate-180 text-brand-primary' : 'text-text-muted-light group-hover:text-brand-primary'}`}
                />
            </button>

            {/* ── Dropdown Panel ── */}
            {isOpen && (
                <div className="absolute z-[999] left-0 right-0 mt-2 bg-card-bg rounded-xl border border-card-border shadow-[0_10px_40px_rgba(0,0,0,0.12)] overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200 origin-top">
                    {/* Scrollable options (excluding "Other") */}
                    <div className="max-h-72 overflow-y-auto overscroll-contain py-1.5 px-1.5 scrollbar-hide">
                        {options.filter(o => o !== 'Other').map(option => {
                            const isActive = value === option;
                            return (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => { onChange(option); setIsOpen(false); }}
                                    className={`
                                        w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all duration-200 text-left relative overflow-hidden group
                                        ${isActive
                                            ? 'bg-brand-primary-light text-brand-primary font-bold shadow-[inset_2px_0_0_0_#10b981]'
                                            : 'text-text-muted hover:bg-bg-subtle hover:text-brand-heading font-medium'}
                                    `}
                                >
                                    <span className="flex-1 truncate relative z-10 transition-transform duration-200 group-hover:translate-x-0.5">{option}</span>
                                    {isActive && (
                                        <Check size={14} strokeWidth={3} className="flex-shrink-0 text-brand-primary relative z-10 animate-in zoom-in slide-in-from-left-2 duration-300" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* "Other" pinned at the bottom — always visible */}
                    {options.includes('Other') && (
                        <>
                            <div className="border-t border-card-border-subtle mx-1.5" />
                            <div className="p-1.5 pb-1">
                                <button
                                    type="button"
                                    onClick={() => { onChange('Other'); setIsOpen(false); }}
                                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-text-muted bg-bg-subtle/50 hover:bg-bg-muted rounded-lg transition-all duration-200 text-left group"
                                >
                                    <div className="bg-card-bg p-1 rounded min-w-[20px] shadow-sm border border-card-border flex items-center justify-center transition-transform duration-200 group-hover:scale-110 group-hover:border-brand-primary/30 group-hover:text-brand-primary">
                                        <Plus size={12} strokeWidth={2.5} />
                                    </div>
                                    <span className="transition-colors duration-200 group-hover:text-text-main">Other Custom...</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Re-export for direct use in Logistics tab ────────────────────────────────
export { CourierLogo };