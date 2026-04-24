import { useState } from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';

/* ══════════════════════════════ TYPES ═══════════════════════════════════ */

export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface RiskFlag { label: string; severity: RiskLevel }

export interface VerifyResult {
    customer: { name: string; phone: string; city: string; address: string };
    orderId: string;
    internalId: string;
    verification: {
        phoneStatus: string;
        riskLevel: RiskLevel;
        riskScore: number;
        riskReasons: string[];
    };
    duplicateInfo: { totalPrevious: number; confirmed: number; cancelled: number };
    messages: Record<string, string>;
    links: Record<string, string>;
}

/* ═══════════════════════════ RISK ENGINE ════════════════════════════════ */

const FAKE_NAMES = /^(unknown|test|abc|xyz|asdf?|admin|user|demo|na|n\/a|none|x+|\.+)$/i;
const PK_PHONE = /^0[3][0-9]{9}$/;

export function localRisk(name: string, phone: string, city: string, address: string) {
    const flags: RiskFlag[] = [];
    let s = 0;
    const p = phone.replace(/[\s\-()]/g, '');
    if (!p) { flags.push({ label: 'Phone number is missing', severity: 'High' }); s += 40; }
    else if (p.length !== 11 || !PK_PHONE.test(p)) { flags.push({ label: 'Invalid phone format (expected 03XX-XXXXXXX)', severity: 'High' }); s += 35; }
    else if (/(.)\1{6,}/.test(p)) { flags.push({ label: 'Suspicious phone: repeated digits', severity: 'High' }); s += 40; }

    const a = address.trim();
    if (!a) { flags.push({ label: 'Address is empty', severity: 'High' }); s += 30; }
    else if (a.length < 10) { flags.push({ label: 'Address too short — house/street details missing', severity: 'High' }); s += 25; }
    else if (!/\d/.test(a)) { flags.push({ label: 'No house/street number in address', severity: 'Medium' }); s += 10; }

    const n = name.trim();
    if (!n || n.length < 2) { flags.push({ label: 'Name is missing or too short', severity: 'Medium' }); s += 15; }
    else if (FAKE_NAMES.test(n)) { flags.push({ label: `Suspicious name: "${n}"`, severity: 'Medium' }); s += 15; }

    if (!city.trim()) { flags.push({ label: 'City not provided', severity: 'Medium' }); s += 15; }

    s = Math.min(s, 100);
    const level: RiskLevel = s >= 50 ? 'High' : s >= 20 ? 'Medium' : 'Low';
    if (flags.length === 0) flags.push({ label: 'All fields properly formatted', severity: 'Low' });

    return { score: s, level, flags };
}

/* templates */
export function tpl(name: string, address: string) {
    return {
        confirmation: `Asalam o Alaikum ${name}, this is to confirm your recent order. Please reply with 'YES' to dispatch your parcel. Total COD: [Amount].`,
        recheck: `Hi ${name}, your delivery address '${address}' seems incomplete. Please provide your complete street/house number for timely delivery.`,
        codReminder: `Dear ${name}, your parcel is arriving today. Please keep the exact cash amount ready for the rider.`,
    };
}

export function waLink(phone: string, msg: string) {
    const c = phone.replace(/[\s\-()]/g, '');
    const intl = c.startsWith('0') ? `92${c.slice(1)}` : c;
    return `https://wa.me/${intl}?text=${encodeURIComponent(msg)}`;
}

/* ═══════════════════════ COLOURS / CONFIG ═══════════════════════════════ */

export const RISK: Record<RiskLevel, { bg: string; border: string; text: string; badge: string; Icon: React.ElementType }> = {
    Low: { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d', badge: 'bg-emerald-100 text-emerald-700 ring-emerald-300', Icon: ShieldCheck },
    Medium: { bg: '#fffbeb', border: '#fde68a', text: '#92400e', badge: 'bg-amber-100 text-amber-700 ring-amber-300', Icon: AlertTriangle },
    High: { bg: '#fef2f2', border: '#fecaca', text: '#991b1b', badge: 'bg-red-100 text-red-700 ring-red-300', Icon: ShieldAlert },
};

/* ════════════════════════ HOOK LOGIC ════════════════════════════════ */

export function useWhatsAppManagerLogic() {
    const [form, setForm] = useState({ name: '', phone: '', city: '', address: '' });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<VerifyResult | null>(null);
    const [localResult, setLocalResult] = useState<ReturnType<typeof localRisk> | null>(null);
    const [copied, setCopied] = useState('');
    const [activeTemplate, setActiveTemplate] = useState<'confirmation' | 'recheck' | 'codReminder'>('confirmation');

    const setField = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

    const copy = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(''), 1800);
    };

    const canSubmit = form.name.trim() && form.phone.trim();

    /* ── Verify ── */
    const handleVerify = async () => {
        if (!canSubmit) return;
        setLoading(true);

        // local risk (instant)
        const lr = localRisk(form.name, form.phone, form.city, form.address);
        setLocalResult(lr);

        // backend call (for duplicate detection + logging)
        try {
            const raw = `${form.name}\n${form.phone}\n${form.address}\n${form.city}`;
            const r = await fetch('/api/whatsapp-manager', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rawText: raw, isPro: false, sellerProfile: 'general', productList: '' }),
            });
            const d = await r.json();
            if (d.success) setResult(d.data);
        } catch { /* backend optional — local risk still works */ }
        finally { setLoading(false); }
    };

    const templates = tpl(form.name || 'Customer', form.address || '[Address]');
    const risk = localResult;
    const rCfg = risk ? RISK[risk.level] : null;

    return {
        form, setField,
        loading,
        result,
        localResult, setLocalResult,
        copied, setCopied,
        activeTemplate, setActiveTemplate,
        canSubmit,
        handleVerify,
        copy,
        templates,
        risk,
        rCfg
    };
}

export type WhatsAppManagerLogicReturn = ReturnType<typeof useWhatsAppManagerLogic>;
