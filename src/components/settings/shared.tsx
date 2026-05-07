// src/components/settings/shared.tsx
import React from 'react';
import { Save, Loader2 } from 'lucide-react';
import type { Variants } from 'framer-motion';

export const tabVariants: Variants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] as const } },
    exit:    { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

export function SettingsCard({ title, description, children, footer, danger = false }: {
    title: string; description?: string; children: React.ReactNode; footer?: React.ReactNode; danger?: boolean;
}) {
    return (
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

export function SaveButton({ onClick, saving, title = 'Save Changes', disabled = false }: {
    onClick?: () => void; saving: boolean; title?: string; disabled?: boolean;
}) {
    const isDisabled = saving || disabled;
    return (
        <button onClick={onClick} disabled={isDisabled} type={onClick ? 'button' : 'submit'}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 text-sm font-bold rounded-xl transition-all duration-300 shadow-sm active:scale-[0.98] ${
                isDisabled && !saving
                    ? 'bg-gray-100 text-[#304250]/40 cursor-not-allowed shadow-none border border-[#304250]/10'
                    : 'text-white bg-[#20A46B] hover:bg-[#20A46B]/90 disabled:opacity-50 hover:shadow-[0_4px_14px_0_rgba(32,164,107,0.3)]'
            }`}>
            {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> {title}</>}
        </button>
    );
}
