"use client";
import { useEffect } from 'react';

export default function GlobalInputFixes() {
    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            if (document.activeElement?.tagName === 'INPUT' && (document.activeElement as HTMLInputElement).type === 'number') {
                (document.activeElement as HTMLElement).blur();
            }
        };
        const handleFocusIn = (e: FocusEvent) => {
            if (e.target && (e.target as HTMLElement).tagName === 'INPUT' && (e.target as HTMLInputElement).type === 'number') {
                (e.target as HTMLInputElement).select();
            }
        };
        document.addEventListener('wheel', handleWheel, { passive: false });
        document.addEventListener('focusin', handleFocusIn);
        return () => {
            document.removeEventListener('wheel', handleWheel);
            document.removeEventListener('focusin', handleFocusIn);
        };
    }, []);
    return null;
}
